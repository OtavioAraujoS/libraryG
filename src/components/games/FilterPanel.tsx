"use client";

import { ChevronDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PlatformFilter } from "@/types";

const ALL_PLATFORMS: PlatformFilter[] = ["STEAM", "EPIC", "GOG"];

const PLATFORM_LABEL: Record<PlatformFilter, string> = {
  STEAM: "Steam",
  EPIC: "Epic",
  GOG: "GOG",
};

interface FilterPanelProps {
  platforms: PlatformFilter[];
  onPlatformsChange: (platforms: PlatformFilter[]) => void;
  genres: string[];
  onGenresChange: (genres: string[]) => void;
  availableGenres: string[];
}

export function FilterPanel({
  platforms,
  onPlatformsChange,
  genres,
  onGenresChange,
  availableGenres,
}: FilterPanelProps) {
  const togglePlatform = (platform: PlatformFilter) => {
    onPlatformsChange(
      platforms.includes(platform)
        ? platforms.filter((p) => p !== platform)
        : [...platforms, platform]
    );
  };

  const toggleGenre = (genre: string) => {
    onGenresChange(
      genres.includes(genre)
        ? genres.filter((g) => g !== genre)
        : [...genres, genre]
    );
  };

  const activeCount = platforms.length + genres.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
        {ALL_PLATFORMS.map((platform) => {
          const active = platforms.includes(platform);
          return (
            <button
              key={platform}
              type="button"
              aria-pressed={active}
              onClick={() => togglePlatform(platform)}
              className={cn(
                "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {PLATFORM_LABEL[platform]}
            </button>
          );
        })}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={availableGenres.length === 0}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          Gênero
          {genres.length > 0 && (
            <Badge variant="secondary" className="px-1.5">
              {genres.length}
            </Badge>
          )}
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filtrar por gênero</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableGenres.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              Nenhum gênero disponível ainda.
            </p>
          ) : (
            availableGenres.map((genre) => (
              <DropdownMenuCheckboxItem
                key={genre}
                checked={genres.includes(genre)}
                onCheckedChange={() => toggleGenre(genre)}
              >
                {genre}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            onPlatformsChange([]);
            onGenresChange([]);
          }}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
