"use client";

import {
  HeroBanner,
  StatsCard,
  PlatformBreakdown,
  FamilyBreakdown,
  RecentGamesSection,
  SetupGuideCard,
} from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks";
import { formatPlaytime } from "@/lib/format";
import { Gamepad2, Layers, Clock, Users } from "lucide-react";

export default function DashboardPage() {
  const { data, loading, error, errorCode, errorHint, refetch } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-8 px-6 py-8">
        <SetupGuideCard
          error={error}
          errorCode={errorCode}
          errorHint={errorHint}
          onRetry={refetch}
        />
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
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 sm:p-12 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Gamepad2 className="h-6 w-6" />
        </div>

        <h3 className="text-xl font-semibold text-foreground">
          Nenhum jogo sincronizado ainda
        </h3>

        <p className="text-sm text-muted-foreground">
          Sua base de dados está pronta! Para popular sua biblioteca, configure suas chaves de API no arquivo <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">.env</code> e clique no botão <strong>&quot;Sincronizar agora&quot;</strong> acima.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-background/60 p-3">
            <p className="text-xs font-semibold text-primary">1. Steam</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Preencha <code className="text-[10px] font-mono">STEAM_API_KEY</code> e <code className="text-[10px] font-mono">STEAM_ID</code> no .env
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/60 p-3">
            <p className="text-xs font-semibold text-primary">2. Epic Games</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Adicione as credenciais Epic no .env para sync automático
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/60 p-3">
            <p className="text-xs font-semibold text-primary">3. GOG</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Configure as credenciais GOG e importe seus títulos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
