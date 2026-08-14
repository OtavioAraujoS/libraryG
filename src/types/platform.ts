export type PlatformFilter = "STEAM" | "EPIC" | "GOG";

export interface GameOnPlatformDTO {
  id: string;
  platform: PlatformFilter;
  externalId: string;
  playtimeMinutes: number;
  playtime2WeeksMinutes?: number | null;
  lastPlayedAt?: string | null;
  lastSyncedAt: string;
}
