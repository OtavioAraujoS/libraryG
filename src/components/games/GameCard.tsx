"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "./PlatformBadge";
import { formatPlaytime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GameCardProps } from "./types";

export function GameCard({ game, viewMode }: GameCardProps) {
  const initialCover =
    game.coverImage ?? game.coverUrl ?? game.bannerImage ?? null;
  const [imgSrc, setImgSrc] = useState<string | null>(initialCover);

  useEffect(() => {
    setImgSrc(game.coverImage ?? game.coverUrl ?? game.bannerImage ?? null);
  }, [game.coverImage, game.coverUrl, game.bannerImage]);

  const handleImageError = () => {
    if (imgSrc && game.bannerImage && imgSrc !== game.bannerImage) {
      setImgSrc(game.bannerImage);
    } else {
      setImgSrc(null);
    }
  };

  const totalPlaytime = game.platforms.reduce(
    (sum, p) => sum + p.playtimeMinutes,
    0,
  );

  const sharedPlatform = game.platforms.find((p) => p.isShared);
  const isFamilyShared = Boolean(sharedPlatform);
  const sharedOwnerName = sharedPlatform?.ownerName;

  if (viewMode === "list") {
    return (
      <Card className="group flex items-center gap-4 border-border bg-card p-3 transition-colors hover:border-primary/50">
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-secondary">
          {imgSrc && (
            <Image
              src={imgSrc}
              alt={game.title}
              fill
              className="object-cover"
              sizes="48px"
              onError={handleImageError}
            />
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-foreground">{game.title}</p>
            {isFamilyShared && (
              <span className="inline-flex items-center gap-1 rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <Users className="h-3 w-3" />
                {sharedOwnerName ? `Família (${sharedOwnerName})` : "Família"}
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {game.developer ?? "Desenvolvedor desconhecido"} ·{" "}
            {formatPlaytime(totalPlaytime)}
          </p>
        </div>

        <div className="hidden shrink-0 gap-1 sm:flex">
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
        "hover:border-primary/60 hover:shadow-[0_0_24px_-4px_hsl(var(--primary))]",
      )}
    >
      <div className="relative aspect-2/3 w-full bg-secondary">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
            sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Sem capa
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/60 to-transparent p-3 pt-8">
          <p className="truncate text-sm font-medium text-foreground">
            {game.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {formatPlaytime(totalPlaytime)}
          </p>
        </div>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isFamilyShared && (
            <div
              className="flex items-center gap-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-xs shadow-xs"
              title={
                sharedOwnerName
                  ? `Compartilhado por ${sharedOwnerName}`
                  : "Compartilhado pela Família Steam"
              }
            >
              <Users className="h-3 w-3 text-primary" />
              <span className="max-w-17.5 truncate">
                {sharedOwnerName || "Família"}
              </span>
            </div>
          )}
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
