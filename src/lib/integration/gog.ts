import axios from "axios";
import { z } from "zod";
import type { NormalizedGame } from "@/types/game";

const GOG_CLIENT_ID = "46899977096215655";
const GOG_CLIENT_SECRET =
  "9d85c43b1482497dbbce61f6e4aa173a433796eeae2ca2f1e50e3ada9024af9";

const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

const OwnedGamesSchema = z.object({
  owned: z.array(z.number()),
});

const ProductDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  images: z
    .object({
      logo2x: z.string().optional(),
      background: z.string().optional(),
    })
    .optional(),
});

async function refreshAccessToken(): Promise<string> {
  const refreshToken = process.env.GOG_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error("GOG_REFRESH_TOKEN não configurado no .env");
  }

  const { data } = await axios.post("https://auth.gog.com/token", null, {
    params: {
      client_id: GOG_CLIENT_ID,
      client_secret: GOG_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
  });

  const parsed = TokenResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Falha ao renovar token de acesso do GOG");
  }

  return parsed.data.access_token;
}

async function fetchOwnedGameIds(accessToken: string): Promise<number[]> {
  const { data } = await axios.get("https://embed.gog.com/user/data/games", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const parsed = OwnedGamesSchema.safeParse(data);
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

    const parsed = ProductDetailsSchema.safeParse(data);
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

  const BATCH_SIZE = 5;
  const results: NormalizedGame[] = [];

  for (let i = 0; i < ownedIds.length; i += BATCH_SIZE) {
    const batch = ownedIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((id) => fetchProductDetails(id)),
    );
    results.push(
      ...batchResults.filter((g): g is NormalizedGame => g !== null),
    );
  }

  return results;
}
