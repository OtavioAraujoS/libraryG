import { GameOnPlatformDTO, PlatformFilter } from "./platform";
import { GenreDTO } from "./genre";

export type PlatformSource = PlatformFilter;

export interface NormalizedGame {
  title: string;
  externalId: string;
  platform: PlatformSource;
  coverImage?: string;
  playtimeMinutes?: number;
}

export interface GameDTO {
  id: string;
  title: string;
  coverUrl: string | null;
  description: string | null;
  developer: string | null;
  publisher: string | null;
  platforms: GameOnPlatformDTO[];
  genres: GenreDTO[];
}
