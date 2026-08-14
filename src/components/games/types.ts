import type { GameDTO, PlatformFilter } from "@/types";

export type ViewMode = "grid" | "list";

export interface GameCardProps {
  game: GameDTO;
  viewMode: ViewMode;
}

export interface GameGridProps {
  games: GameDTO[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
}

export interface PlatformBadgeProps {
  platform: PlatformFilter;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
  siblingCount?: number;
}
