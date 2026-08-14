import { GameOnPlatformDTO, PlatformFilter } from "./platform";
import { GenreDTO } from "./genre";

export type PlatformSource = PlatformFilter;

export interface NormalizedGame {
  title: string;
  externalId: string;
  platform: PlatformSource;
  coverImage?: string;
  bannerImage?: string;
  playtimeMinutes?: number;
  playtime2WeeksMinutes?: number;
  lastPlayedAt?: Date;
}

export interface GameDTO {
  id: string;
  title: string;
  coverImage?: string | null;
  coverUrl?: string | null;
  bannerImage?: string | null;
  description: string | null;
  developer: string | null;
  publisher: string | null;
  releaseDate?: string | null;
  platforms: GameOnPlatformDTO[];
  genres: GenreDTO[];
}
