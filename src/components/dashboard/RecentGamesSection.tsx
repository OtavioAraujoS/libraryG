"use client";

import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/games";
import type { GameDTO } from "@/types";

interface RecentGamesSectionProps {
  games: GameDTO[];
  title?: string;
}

export function RecentGamesSection({
  games,
  title = "Mais Jogados da Coleção",
}: RecentGamesSectionProps) {
  if (!games || games.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          nativeButton={false}
          render={<Link href="/library" />}
        >
          Ver todos na biblioteca
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} viewMode="grid" />
        ))}
      </div>
    </div>
  );
}
