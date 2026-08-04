import axios from "axios";
import type { NormalizedGame } from "@/types/game";
import {
  GogTokenResponseSchema,
  GogOwnedGamesSchema,
  GogProductDetailsSchema,
} from "@/types/gog";
import { requireEnvVars, batchProcess } from "@/lib/integration/helpers";

async function refreshAccessToken(): Promise<string> {
  const { GOG_CLIENT_ID, GOG_CLIENT_SECRET, GOG_REFRESH_TOKEN } = requireEnvVars(
    "GOG_CLIENT_ID",
    "GOG_CLIENT_SECRET",
    "GOG_REFRESH_TOKEN"
  );

  const { data } = await axios.post("https://auth.gog.com/token", null, {
    params: {
      client_id: GOG_CLIENT_ID,
      client_secret: GOG_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: GOG_REFRESH_TOKEN,
    },
  });

  const parsed = GogTokenResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Falha ao renovar token de acesso do GOG");
  }

  return parsed.data.access_token;
}

async function fetchOwnedGameIds(accessToken: string): Promise<number[]> {
  const { data } = await axios.get("https://embed.gog.com/user/data/games", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const parsed = GogOwnedGamesSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Resposta inesperada da GOG (owned games):", parsed.error);
    throw new Error("Falha ao validar lista de jogos do GOG");
  }

  return parsed.data.owned;
}

async function fetchProductDetails(
  productId: number,
): Promise<NormalizedGame | null> {
  try {
    const { data } = await axios.get(
      `https://api.gog.com/products/${productId}`,
      { params: { expand: "images" } },
    );

    const parsed = GogProductDetailsSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`Produto GOG ${productId} com formato inesperado, pulando.`);
      return null;
    }

    return {
      title: parsed.data.title,
      externalId: String(parsed.data.id),
      platform: "GOG",
      coverImage: parsed.data.images?.logo2x
        ? `https:${parsed.data.images.logo2x}`
        : undefined,
    };
  } catch {
    console.warn(`Falha ao buscar detalhes do produto GOG ${productId}`);
    return null;
  }
}

export async function fetchGogLibrary(): Promise<NormalizedGame[]> {
  const accessToken = await refreshAccessToken();
  const ownedIds = await fetchOwnedGameIds(accessToken);

  return batchProcess(ownedIds, 5, fetchProductDetails);
}
