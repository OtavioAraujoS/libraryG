export type DashboardGameItem = {
  game: {
    id: string;
    title: string;
    coverImage: string | null;
    bannerImage: string | null;
    description: string | null;
    developer: string | null;
    publisher: string | null;
    releaseDate: Date | null;
    platforms: Array<{
      id: string;
      platform: "STEAM" | "EPIC" | "GOG";
      externalId: string;
      playtimeMinutes: number | null;
      playtime2WeeksMinutes: number | null;
      lastPlayedAt: Date | null;
      isShared: boolean;
      ownerSteamId: string | null;
      ownerName: string | null;
      lastSyncedAt: Date;
    }>;
    genres: Array<{
      id: string;
      name: string;
    }>;
  };
};
