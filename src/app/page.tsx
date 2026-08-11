import { prisma } from "@/lib/prisma";
import { HeroBanner, StatsCard, PlatformBreakdown } from "@/components/dashboard";
import { Gamepad2, Layers, Clock } from "lucide-react";
import { formatPlaytime } from "@/lib/format";

export default async function DashboardPage() {
  const [totalGames, platformGroups, playtimeAgg] = await Promise.all([
    prisma.game.count(),
    prisma.gameOnPlatform.groupBy({
      by: ["platform"],
      _count: { _all: true },
    }),
    prisma.gameOnPlatform.aggregate({
      _sum: { playtimeMinutes: true },
    }),
  ]);

  const platformData = platformGroups.map((g) => ({
    platform: g.platform,
    count: g._count._all,
  }));

  const totalPlatformLinks = platformData.reduce((sum, p) => sum + p.count, 0);
  const totalMinutes = playtimeAgg._sum.playtimeMinutes ?? 0;

  return (
    <div className="space-y-8 px-6 py-8">
      <HeroBanner totalGames={totalGames} />

      {totalGames === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatsCard
              label="Jogos únicos"
              value={totalGames}
              icon={Gamepad2}
              accent
            />
            <StatsCard
              label="Vínculos de plataforma"
              value={totalPlatformLinks}
              icon={Layers}
            />
            <StatsCard
              label="Tempo total jogado"
              value={formatPlaytime(totalMinutes)}
              icon={Clock}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PlatformBreakdown data={platformData} />
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <p className="text-lg font-medium text-foreground/90">
        Nenhum jogo sincronizado ainda
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Dispare a sincronização de uma plataforma (ex:{" "}
        <code className="rounded bg-secondary/30 px-1.5 py-0.5 text-xs">
          POST /api/sync/steam
        </code>
        ) para popular sua biblioteca e ver os números aqui.
      </p>
    </div>
  );
}
