import axios from "axios";
import type { NormalizedGame } from "@/types/game";
import { SteamResponseSchema } from "@/types/steam";
import { requireEnvVars } from "@/lib/integration/helpers";
import { logger } from "@/lib/logger";

const STEAM_API_BASE = "https://api.steampowered.com";

const MOCK_GAMES: NormalizedGame[] = [
  {
    title: "Portal 2",
    externalId: "620",
    platform: "STEAM",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/620/library_600x900.jpg",
    playtimeMinutes: 1200,
  },
  {
    title: "The Witcher 3: Wild Hunt",
    externalId: "292030",
    platform: "STEAM",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg",
    playtimeMinutes: 4500,
  },
  {
    title: "Counter-Strike 2",
    externalId: "730",
    platform: "STEAM",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_600x900.jpg",
    playtimeMinutes: 15000,
  },
  {
    title: "Terraria",
    externalId: "105600",
    platform: "STEAM",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/library_600x900.jpg",
    playtimeMinutes: 3200,
  }
];

export async function fetchSteamLibrary(): Promise<NormalizedGame[]> {
  const useMock = process.env.STEAM_API_MOCK === "true";

  if (useMock) {
    logger.warn("Steam API: running in MOCK mode.");
    return MOCK_GAMES;
  }

  const { STEAM_API_KEY: apiKey, STEAM_ID: steamId } = requireEnvVars(
    "STEAM_API_KEY",
    "STEAM_ID"
  );

  try {
    const { data } = await axios.get(
      `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v0001/`,
      {
        params: {
          key: apiKey,
          steamid: steamId,
          include_appinfo: true,
          include_played_free_games: true,
          format: "json",
        },
      },
    );

    const parsed = SteamResponseSchema.safeParse(data);

    if (!parsed.success) {
      logger.error("Resposta inesperada da Steam API", parsed.error);
      throw new Error("Falha ao validar dados da Steam API");
    }

    const games = parsed.data.response.games ?? [];

    return games.map(
      (game): NormalizedGame => ({
        title: game.name,
        externalId: String(game.appid),
        platform: "STEAM",
        coverImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`,
        playtimeMinutes: game.playtime_forever,
      }),
    );
  } catch (error: any) {
    const isNetworkError = 
      error.code === "ECONNRESET" || 
      error.code === "ETIMEDOUT" || 
      error.code === "ENOTFOUND" || 
      error.message?.includes("Network Error") ||
      error.message?.includes("Connection was reset");

    if (process.env.NODE_ENV === "development" && isNetworkError) {
      logger.warn("Steam API: network connection failed (firewall / ECONNRESET) — using MOCK data.");
      return MOCK_GAMES;
    }
    throw error;
  }
}
