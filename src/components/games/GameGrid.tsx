"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "./GameCard";
import type { GameGridProps } from "./types";

const GRID_CLASSES =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
const LIST_CLASSES = "flex flex-col gap-2";

export function GameGrid({ games, loading, error, viewMode }: GameGridProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 py-16 text-center">
        <p className="font-medium text-destructive">
          Não foi possível carregar sua biblioteca
        </p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={viewMode === "grid" ? GRID_CLASSES : LIST_CLASSES}>
        {Array.from({ length: viewMode === "grid" ? 12 : 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className={
              viewMode === "grid" ? "aspect-[2/3] w-full" : "h-20 w-full"
            }
          />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-20 text-center">
        <p className="font-medium text-foreground">Nenhum jogo encontrado</p>
        <p className="text-sm text-muted-foreground">
          Ajuste a busca ou os filtros, ou sincronize sua biblioteca em uma
          plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className={viewMode === "grid" ? GRID_CLASSES : LIST_CLASSES}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} viewMode={viewMode} />
      ))}
    </div>
  );
}
