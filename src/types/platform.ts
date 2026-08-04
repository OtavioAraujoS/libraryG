export type PlatformFilter = "STEAM" | "EPIC" | "GOG";

export interface GameOnPlatformDTO {
  id: string;
  platform: PlatformFilter;
  externalId: string;
  playtimeMinutes: number;
  lastSyncedAt: string;
}
