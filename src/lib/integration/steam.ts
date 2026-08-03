import axios from "axios";
import { z } from "zod";
import type { NormalizedGame } from "@/types/game";

const STEAM_API_BASE = "https://api.steampowered.com";

const SteamGameSchema = z.object({
  appid: z.number(),
  name: z.string(),
  playtime_forever: z.number(),
  img_icon_url: z.string().optional(),
});

const SteamResponseSchema = z.object({
  response: z.object({
    game_count: z.number().optional(),
    games: z.array(SteamGameSchema).optional(),
  }),
});

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
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;
  const useMock = process.env.STEAM_API_MOCK === "true";

  if (useMock) {
    console.warn("Steam API: Running in MOCK mode.");
    return MOCK_GAMES;
  }

  if (!apiKey || !steamId) {
    throw new Error("STEAM_API_KEY ou STEAM_ID não configurados no .env");
  }

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
      console.error("Resposta inesperada da Steam API:", parsed.error);
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
      console.warn("Steam API: Network connection failed (firewall block / ECONNRESET). Using MOCK data for development.");
      return MOCK_GAMES;
    }
    throw error;
  }
}

