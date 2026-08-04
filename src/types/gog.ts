import { z } from "zod";

export const GogTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export const GogOwnedGamesSchema = z.object({
  owned: z.array(z.number()),
});

export const GogProductDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  images: z
    .object({
      logo2x: z.string().optional(),
      background: z.string().optional(),
    })
    .optional(),
});

export type GogTokenResponse = z.infer<typeof GogTokenResponseSchema>;
export type GogOwnedGames = z.infer<typeof GogOwnedGamesSchema>;
export type GogProductDetails = z.infer<typeof GogProductDetailsSchema>;
