"use client";

import {
  HeroBanner,
  StatsCard,
  PlatformBreakdown,
  FamilyBreakdown,
  RecentGamesSection,
} from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks";
import { formatPlaytime } from "@/lib/format";
import { Gamepad2, Layers, Clock, Users } from "lucide-react";

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-16 text-center">
        <p className="font-medium text-destructive">
          Não foi possível carregar as métricas do painel
        </p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  const {
    totalGames,
    totalPlatformLinks,
    totalMinutes,
    familySharedCount,
    platformData,
    familyData,
    topGames,
  } = data;

  return (
    <div className="space-y-8 px-6 py-8">
      <HeroBanner totalGames={totalGames} />

      {totalGames === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              label="Jogos únicos"
              value={totalGames}
              icon={Gamepad2}
              accent
            />
            {familySharedCount > 0 ? (
              <StatsCard
                label="Jogos da Família Steam"
                value={familySharedCount}
                icon={Users}
              />
            ) : (
              <StatsCard
                label="Vínculos de plataforma"
                value={totalPlatformLinks}
                icon={Layers}
              />
            )}
            <StatsCard
              label="Vínculos totais"
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
            {familyData.length > 0 && (
              <FamilyBreakdown
                data={familyData}
                totalShared={familySharedCount}
              />
            )}
          </div>

          {topGames.length > 0 && (
            <RecentGamesSection
              games={topGames}
              title="Mais Jogados da Coleção"
            />
          )}
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 px-6 py-8">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
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
        Clique no botão &quot;Sincronizar agora&quot; acima para importar seus
        jogos da Steam, Epic Games e GOG.
      </p>
    </div>
  );
}
