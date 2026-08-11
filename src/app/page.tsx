"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterPanel, GameGrid, SearchBar } from "@/components/games";
import { useGames } from "@/hooks";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/components/games";

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

  const availableGenres: string[] = [];

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
            <SearchBar value={searchQuery} onChange={setSearchQuery} className="w-full sm:w-64" />

            <div className="flex items-center rounded-md border border-border p-0.5">
              <Button
                variant="ghost"
                size="icon"
                aria-pressed={viewMode === "grid"}
                aria-label="Visualização em grid"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 w-8",
                  viewMode === "grid" && "bg-secondary text-foreground"
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
                  viewMode === "list" && "bg-secondary text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <FilterPanel
          platforms={platforms}
          onPlatformsChange={setPlatforms}
          genres={genres}
          onGenresChange={setGenres}
          availableGenres={availableGenres}
        />
      </div>

      <GameGrid
        games={games}
        loading={loading}
        error={error}
        viewMode={viewMode}
      />
    </div>
  );
}
