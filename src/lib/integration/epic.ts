import axios from "axios";
import type { NormalizedGame } from "@/types/game";
import {
  EpicTokenResponseSchema,
  EpicLibraryResponseSchema,
  EpicCatalogItemSchema,
} from "@/types/epic";
import { requireEnvVars, batchProcess } from "@/lib/integration/helpers";
import { logger } from "@/lib/logger";

async function refreshAccessToken(): Promise<string> {
  const { EPIC_CLIENT_ID, EPIC_CLIENT_SECRET, EPIC_REFRESH_TOKEN } =
    requireEnvVars(
      "EPIC_CLIENT_ID",
      "EPIC_CLIENT_SECRET",
      "EPIC_REFRESH_TOKEN",
    );

  const epicBasicAuth = Buffer.from(
    `${EPIC_CLIENT_ID}:${EPIC_CLIENT_SECRET}`,
  ).toString("base64");

  const { data } = await axios.post(
    "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: EPIC_REFRESH_TOKEN,
    }),
    {
      headers: {
        Authorization: `Basic ${epicBasicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  const parsed = EpicTokenResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Falha ao renovar token de acesso da Epic");
  }

  return parsed.data.access_token;
}

async function fetchLibraryItems(
  accessToken: string,
): Promise<{ catalogItemId: string; namespace: string }[]> {
  const { data } = await axios.get(
    "https://library-service.live.use1.on.epicgames.com/library/api/public/items",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { includeMetadata: true },
    },
  );

  const parsed = EpicLibraryResponseSchema.safeParse(data);
  if (!parsed.success) {
    logger.error("Resposta inesperada da Epic (library items)", parsed.error);
    throw new Error("Falha ao validar biblioteca da Epic");
  }

  return parsed.data.records;
}

async function fetchCatalogItem(
  accessToken: string,
  item: { catalogItemId: string; namespace: string },
): Promise<NormalizedGame | null> {
  try {
    const { data } = await axios.get(
      `https://catalog-public-service-prod06.ol.epicgames.com/catalog/api/shared/namespace/${item.namespace}/bulk/items`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          id: item.catalogItemId,
          includeDLCDetails: false,
          includeMainGameDetails: false,
          country: "BR",
          locale: "pt-BR",
        },
      },
    );

    const catalogData = data[item.catalogItemId];
    const parsed = EpicCatalogItemSchema.safeParse(catalogData);
    if (!parsed.success) return null;

    const coverImage = parsed.data.keyImages?.find(
      (img) => img.type === "DieselStoreFrontWide" || img.type === "Thumbnail",
    )?.url;

    return {
      title: parsed.data.title,
      externalId: parsed.data.id,
      platform: "EPIC",
      coverImage,
    };
  } catch {
    logger.warn(`Falha ao buscar item do catálogo Epic ${item.catalogItemId}`);
    return null;
  }
}

export async function fetchEpicLibrary(): Promise<NormalizedGame[]> {
  const accessToken = await refreshAccessToken();
  const items = await fetchLibraryItems(accessToken);

  return batchProcess(items, 5, (item) => fetchCatalogItem(accessToken, item));
}
