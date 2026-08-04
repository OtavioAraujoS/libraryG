import { z } from "zod";

export const EpicTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export const EpicLibraryItemSchema = z.object({
  catalogItemId: z.string(),
  namespace: z.string(),
});

export const EpicLibraryResponseSchema = z.object({
  records: z.array(EpicLibraryItemSchema),
});

export const EpicCatalogItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  keyImages: z
    .array(
      z.object({
        type: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});

export type EpicTokenResponse = z.infer<typeof EpicTokenResponseSchema>;
export type EpicLibraryItem = z.infer<typeof EpicLibraryItemSchema>;
export type EpicLibraryResponse = z.infer<typeof EpicLibraryResponseSchema>;
export type EpicCatalogItem = z.infer<typeof EpicCatalogItemSchema>;
