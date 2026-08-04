"use client";

import { useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GameGrid, ViewMode } from "@/components/games";
import { useGames } from "@/hooks";
import { cn } from "@/lib/utils";

export default function LibraryPage() {
  const { games, total, loading, error, q, setQ } = useGames();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar jogo..."
              className="pl-8"
            />
          </div>

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

      <GameGrid
        games={games}
        loading={loading}
        error={error}
        viewMode={viewMode}
      />
    </div>
  );
}
