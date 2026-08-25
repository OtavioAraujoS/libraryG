"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { DashboardMetrics, UseDashboardResult } from "./useDashboard.types";

interface DashboardErrorDetails {
  message: string;
  code: string | null;
  hint: string | null;
}

function parseDashboardError(err: unknown): DashboardErrorDetails {
  if (axios.isAxiosError(err) && err.response?.data) {
    const errorData = err.response.data;
    return {
      message: errorData.error || "Não foi possível carregar as métricas do painel.",
      code: errorData.code || null,
      hint: errorData.hint || null,
    };
  }

  const message =
    err instanceof Error
      ? err.message
      : "Não foi possível carregar as métricas do painel.";

  return {
    message,
    code: null,
    hint: null,
  };
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const fetchDashboardMetrics = useCallback(async (isIgnored?: () => boolean) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    setErrorHint(null);

    try {
      const response = await axios.get("/api/dashboard");

      if (isIgnored?.()) return;

      if (!response.data.success) {
        throw new Error(
          response.data.error ?? "Erro ao carregar dados do dashboard.",
        );
      }

      setData(response.data.data);
    } catch (err: unknown) {
      if (isIgnored?.()) return;

      const { message, code, hint } = parseDashboardError(err);
      setError(message);
      setErrorCode(code);
      setErrorHint(hint);
    } finally {
      if (!isIgnored?.()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchDashboardMetrics(() => ignore);

    return () => {
      ignore = true;
    };
  }, [fetchDashboardMetrics]);

  return {
    data,
    loading,
    error,
    errorCode,
    errorHint,
    refetch: fetchDashboardMetrics,
  };
}

