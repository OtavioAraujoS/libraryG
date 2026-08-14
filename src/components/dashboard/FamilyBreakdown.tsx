import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export interface FamilyMemberCount {
  name: string;
  count: number;
}

export function FamilyBreakdown({
  data,
  totalShared,
}: {
  data: FamilyMemberCount[];
  totalShared: number;
}) {
  const total =
    data.reduce((sum, item) => sum + item.count, 0) || totalShared || 1;

  if (data.length === 0) {
    return null;
  }

  const COLORS = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground/90">
          <Users className="h-4 w-4 text-primary" />
          Família Steam
        </CardTitle>
        <span className="text-xs font-medium text-muted-foreground">
          {total} {total === 1 ? "jogo" : "jogos"} no grupo
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map(({ name, count }, index) => {
          const percent = Math.round((count / total) * 100);
          const colorClass = COLORS[index % COLORS.length];

          return (
            <div key={name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground/80">{name}</span>
                <span className="text-xs text-muted-foreground">
                  {count} {count === 1 ? "jogo" : "jogos"} ({percent}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
                <div
                  className={`h-full rounded-full ${colorClass}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
