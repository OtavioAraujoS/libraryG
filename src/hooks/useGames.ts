"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { PlatformFilter, GameDTO } from "@/types";
import { UseGamesResult } from "./useGames.types";

const DEBOUNCE_MS = 350;

export function useGames(): UseGamesResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [platforms, setPlatforms] = useState<PlatformFilter[]>([]);
  const [genres, setGenres] = useState<string[]>([]);

  const [games, setGames] = useState<GameDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchGames = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (platforms.length > 0) params.platform = platforms.join(",");
      if (genres.length > 0) params.genre = genres.join(",");

      const { data } = await axios.get("/api/games", {
        params,
        signal: controller.signal,
      });

      if (!data.success) {
        throw new Error(data.error ?? "Erro ao buscar jogos.");
      }

      setGames(data.games);
      setTotal(data.total);
    } catch (err) {
      if (axios.isCancel(err)) return;

      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Não foi possível carregar a biblioteca de jogos.";
      setError(message);
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }, [searchQuery, platforms, genres]);

  const togglePlatform = useCallback((platform: PlatformFilter) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    setGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setPlatforms([]);
    setGenres([]);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGames();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchGames]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return {
    games,
    total,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    platforms,
    setPlatforms,
    togglePlatform,
    genres,
    setGenres,
    toggleGenre,
    clearFilters,
    refetch: fetchGames,
  };
}
