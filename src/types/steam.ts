import { z } from "zod";

export const SteamGameSchema = z.object({
  appid: z.number(),
  name: z.string(),
  playtime_forever: z.number(),
  img_icon_url: z.string().optional(),
  rtime_last_played: z.number().optional(),
  playtime_2weeks: z.number().optional(),
  playtime_windows_forever: z.number().optional(),
  playtime_mac_forever: z.number().optional(),
  playtime_linux_forever: z.number().optional(),
  playtime_deck_forever: z.number().optional(),
  has_community_visible_stats: z.boolean().optional(),
});

export const SteamResponseSchema = z.object({
  response: z.object({
    game_count: z.number().optional(),
    games: z.array(SteamGameSchema).optional(),
  }),
});

export type SteamGame = z.infer<typeof SteamGameSchema>;
export type SteamResponse = z.infer<typeof SteamResponseSchema>;
