import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlatformFilter } from "@/types";
import type { PlatformBadgeProps } from "./types";

const PLATFORM_CONFIG: Record<
  PlatformFilter,
  { label: string; className: string }
> = {
  STEAM: {
    label: "Steam",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  },
  EPIC: {
    label: "Epic",
    className: "border-zinc-400/40 bg-zinc-400/10 text-zinc-200",
  },
  GOG: {
    label: "GOG",
    className: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  },
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
