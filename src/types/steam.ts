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

export const SteamFamilyMemberSchema = z.object({
  steamid: z.union([z.string(), z.number()]),
  role: z.number().optional(),
});

export const SteamFamilyGroupForUserResponseSchema = z.object({
  response: z.object({
    family_groupid: z.union([z.string(), z.number()]).optional(),
    family_group: z
      .object({
        family_groupid: z.union([z.string(), z.number()]).optional(),
        name: z.string().optional(),
        members: z.array(SteamFamilyMemberSchema).optional(),
      })
      .optional(),
  }),
});

export const SteamSharedLibraryAppSchema = z.object({
  appid: z.number(),
  name: z.string().optional(),
  owner_steamids: z.array(z.union([z.string(), z.number()])).optional(),
  exclude_reason: z.number().optional(),
  rt_time_acquired: z.number().optional(),
  img_icon_hash: z.string().optional(),
  playtime_forever: z.number().optional(),
  rtime_last_played: z.number().optional(),
});

export const SteamSharedLibraryResponseSchema = z.object({
  response: z.object({
    apps: z.array(SteamSharedLibraryAppSchema).optional(),
  }),
});

export const SteamPlayerSummarySchema = z.object({
  steamid: z.string(),
  personaname: z.string(),
  avatar: z.string().optional(),
  avatarfull: z.string().optional(),
});

export const SteamPlayerSummariesResponseSchema = z.object({
  response: z.object({
    players: z.array(SteamPlayerSummarySchema).optional(),
  }),
});

export type SteamGame = z.infer<typeof SteamGameSchema>;
export type SteamResponse = z.infer<typeof SteamResponseSchema>;
export type SteamSharedLibraryApp = z.infer<typeof SteamSharedLibraryAppSchema>;
export type SteamPlayerSummary = z.infer<typeof SteamPlayerSummarySchema>;
