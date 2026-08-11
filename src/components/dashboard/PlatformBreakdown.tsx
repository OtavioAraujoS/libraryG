import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlatformCount {
  platform: "STEAM" | "EPIC" | "GOG";
  count: number;
}

const PLATFORM_META: Record<
  PlatformCount["platform"],
  { label: string; barColor: string }
> = {
  STEAM: { label: "Steam", barColor: "bg-[#66c0f4]" },
  EPIC: { label: "Epic Games", barColor: "bg-[#ffffff]" },
  GOG: { label: "GOG", barColor: "bg-[#a06eff]" },
};

export function PlatformBreakdown({ data }: { data: PlatformCount[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground/90">
          Jogos por plataforma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map(({ platform, count }) => {
          const meta = PLATFORM_META[platform];
          const percent = Math.round((count / total) * 100);
          return (
            <div key={platform}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-foreground/80">{meta.label}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
                <div
                  className={`h-full rounded-full ${meta.barColor}`}
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
