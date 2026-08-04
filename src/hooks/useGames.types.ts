import { GameDTO, PlatformFilter } from "@/types";

export interface UseGamesResult {
  games: GameDTO[];
  total: number;
  loading: boolean;
  error: string | null;
  q: string;
  setQ: (value: string) => void;
  platforms: PlatformFilter[];
  setPlatforms: React.Dispatch<React.SetStateAction<PlatformFilter[]>>;
  togglePlatform: (platform: PlatformFilter) => void;
  genres: string[];
  setGenres: React.Dispatch<React.SetStateAction<string[]>>;
  toggleGenre: (genre: string) => void;
  clearFilters: () => void;
  refetch: () => void;
}
