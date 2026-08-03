export type PlatformSource = "STEAM" | "EPIC" | "GOG";

export interface NormalizedGame {
  title: string;
  externalId: string;
  platform: PlatformSource;
  coverImage?: string;
  playtimeMinutes?: number;
}
