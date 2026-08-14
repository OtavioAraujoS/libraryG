import axios from "axios";
import type { NormalizedGame } from "@/types/game";
import { SteamResponseSchema } from "@/types/steam";
import { requireEnvVars } from "@/lib/integration/helpers";
import { logger } from "@/lib/logger";

const STEAM_API_BASE = "https://api.steampowered.com";

export async function fetchSteamLibrary(): Promise<NormalizedGame[]> {
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
        bannerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
        playtimeMinutes: game.playtime_forever,
        playtime2WeeksMinutes: game.playtime_2weeks,
        lastPlayedAt: game.rtime_last_played
          ? new Date(game.rtime_last_played * 1000)
          : undefined,
      }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Falha ao buscar biblioteca real da Steam API", message);
    throw error;
  }
}
