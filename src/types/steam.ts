import { z } from "zod";

export const SteamGameSchema = z.object({
  appid: z.number(),
  name: z.string(),
  playtime_forever: z.number(),
  img_icon_url: z.string().optional(),
});

export const SteamResponseSchema = z.object({
  response: z.object({
    game_count: z.number().optional(),
    games: z.array(SteamGameSchema).optional(),
  }),
});

export type SteamGame = z.infer<typeof SteamGameSchema>;
export type SteamResponse = z.infer<typeof SteamResponseSchema>;
