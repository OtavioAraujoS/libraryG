"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { DashboardMetrics, UseDashboardResult } from "./useDashboard.types";

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/dashboard");

      if (!response.data.success) {
        throw new Error(
          response.data.error ?? "Erro ao carregar dados do dashboard.",
        );
      }

      setData(response.data.data);
    } catch (err: unknown) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Não foi possível carregar as métricas do painel.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardMetrics,
  };
}
