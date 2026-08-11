"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";

const GenresResponseSchema = z.object({
  success: z.literal(true),
  genres: z.array(z.string().min(1)),
});

export function useGenres() {
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get("/api/genres")
      .then(({ data }) => {
        const parsed = GenresResponseSchema.safeParse(data);

        if (!parsed.success) {
          toast.error("Dados de gêneros inválidos ou incompletos.", {
            description: "A resposta da API não está no formato esperado.",
          });
          return;
        }

        setAvailableGenres(parsed.data.genres);
      })
      .catch((err) => {
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response.data.error
            : "Não foi possível carregar os gêneros disponíveis.";

        toast.error("Erro ao carregar gêneros", { description: message });
      });
  }, []);

  return { availableGenres };
}
