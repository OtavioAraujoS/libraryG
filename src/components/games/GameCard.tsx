"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "./PlatformBadge";
import { formatPlaytime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GameCardProps } from "./types";

export function GameCard({ game, viewMode }: GameCardProps) {
  const totalPlaytime = game.platforms.reduce(
    (sum, p) => sum + p.playtimeMinutes,
    0
  );

  if (viewMode === "list") {
    return (
      <Card className="group flex items-center gap-4 border-border bg-card p-3 transition-colors hover:border-primary/50">
        <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-sm bg-secondary">
          {game.coverUrl && (
            <Image
              src={game.coverUrl}
              alt={game.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium text-foreground">{game.title}</p>
          <p className="truncate text-sm text-muted-foreground">
            {game.developer ?? "Desenvolvedor desconhecido"} ·{" "}
            {formatPlaytime(totalPlaytime)}
          </p>
        </div>

        <div className="hidden flex-shrink-0 gap-1 sm:flex">
          {game.platforms.map((p) => (
            <PlatformBadge key={p.id} platform={p.platform} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border bg-card p-0 transition-all",
        "hover:border-primary/60 hover:shadow-[0_0_24px_-4px_hsl(var(--primary))]"
      )}
    >
      <div className="relative aspect-[2/3] w-full bg-secondary">
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
            sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Sem capa
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-3 pt-8">
          <p className="truncate text-sm font-medium text-foreground">
            {game.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {formatPlaytime(totalPlaytime)}
          </p>
        </div>

        <div className="absolute right-2 top-2 flex flex-col gap-1">
          {game.platforms.map((p) => (
            <PlatformBadge
              key={p.id}
              platform={p.platform}
              className="px-1.5 py-0 text-[10px]"
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
