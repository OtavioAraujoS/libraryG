"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FilterPanel,
  GameGrid,
  Pagination,
  SearchBar,
} from "@/components/games";
import { useGames, useGenres } from "@/hooks";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/components/games";
import type { PlatformFilter } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function LibraryPage() {
  const {
    games,
    total,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    platforms,
    setPlatforms,
    genres,
    setGenres,
  } = useGames();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const { availableGenres } = useGenres();

  const totalPages = Math.max(1, Math.ceil(games.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedGames = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return games.slice(start, start + ITEMS_PER_PAGE);
  }, [games, safeCurrentPage]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePlatformsChange = (
    newPlatforms: React.SetStateAction<PlatformFilter[]>,
  ) => {
    setPlatforms(newPlatforms);
    setCurrentPage(1);
  };

  const handleGenresChange = (newGenres: React.SetStateAction<string[]>) => {
    setGenres(newGenres);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Biblioteca
            </h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Carregando..."
                : `${total} ${total === 1 ? "jogo" : "jogos"}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full sm:w-64"
            />

            <div className="flex items-center rounded-md border border-border p-0.5">
              <Button
                variant="ghost"
                size="icon"
                aria-pressed={viewMode === "grid"}
                aria-label="Visualização em grid"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 w-8",
                  viewMode === "grid" && "bg-secondary text-foreground",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-pressed={viewMode === "list"}
                aria-label="Visualização em lista"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-8 w-8",
                  viewMode === "list" && "bg-secondary text-foreground",
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <FilterPanel
          platforms={platforms}
          onPlatformsChange={handlePlatformsChange}
          genres={genres}
          onGenresChange={handleGenresChange}
          availableGenres={availableGenres}
        />
      </div>

      <GameGrid
        games={paginatedGames}
        loading={loading}
        error={error}
        viewMode={viewMode}
      />

      {!loading && !error && games.length > 0 && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
