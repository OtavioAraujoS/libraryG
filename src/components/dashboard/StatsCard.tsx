import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatsCard({ label, value, icon: Icon, accent }: StatsCardProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card transition-colors",
        accent && "border-primary/40"
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
            accent ? "bg-primary/20 text-primary" : "bg-secondary/40 text-foreground/80"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight tracking-tight">
            {value}
          </p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
