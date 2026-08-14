import type { GameDTO } from "@/types";

export interface PlatformMetric {
  platform: "STEAM" | "EPIC" | "GOG";
  count: number;
}

export interface FamilyMemberMetric {
  name: string;
  count: number;
}

export interface DashboardMetrics {
  totalGames: number;
  totalPlatformLinks: number;
  totalMinutes: number;
  familySharedCount: number;
  platformData: PlatformMetric[];
  familyData: FamilyMemberMetric[];
  topGames: GameDTO[];
}

export interface UseDashboardResult {
  data: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
