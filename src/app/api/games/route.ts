import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Platform } from "../../../../generated/prisma/enums";
import type { Prisma } from "../../../../generated/prisma/client";
import { logger } from "@/lib/logger";

import { ensureDatabaseReady } from "@/lib/db-init";

async function queryGames(where: Prisma.GameWhereInput) {
  return prisma.game.findMany({
    where,
    include: {
      platforms: true,
      genres: true,
    },
    orderBy: { title: "asc" },
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get("q")?.trim();
    const platformParam = searchParams.get("platform");
    const genreParam = searchParams.get("genre");

    const platforms = platformParam
      ? platformParam
          .split(",")
          .map((p) => p.trim().toUpperCase())
          .filter((p): p is Platform =>
            Object.values(Platform).includes(p as Platform),
          )
      : undefined;

    const genres = genreParam
      ? genreParam
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : undefined;

    const where: Prisma.GameWhereInput = {};

    if (q) {
      where.title = {
        contains: q,
      };
    }

    if (platforms && platforms.length > 0) {
      where.platforms = {
        some: {
          platform: { in: platforms },
        },
      };
    }

    if (genres && genres.length > 0) {
      where.genres = {
        some: {
          name: { in: genres },
        },
      };
    }

    let games;
    try {
      games = await queryGames(where);
    } catch (primaryError) {
      logger.warn("[GET /api/games] Falha na consulta, verificando banco...", primaryError);
      await ensureDatabaseReady();
      games = await queryGames(where);
    }

    return NextResponse.json({
      success: true,
      total: games.length,
      games,
    });
  } catch (error) {
    logger.error("[GET /api/games]", error);

    const errorStr = error instanceof Error ? error.message : String(error);
    const isDbError =
      errorStr.includes("no such table") ||
      errorStr.includes("SQLITE_ERROR") ||
      errorStr.includes("database") ||
      errorStr.includes("PrismaClient");

    const errorMessage = isDbError
      ? "Banco de dados não inicializado ou inacessível. Execute 'npm run db:push' para sincronizar as tabelas locais."
      : "Erro ao buscar jogos.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: isDbError ? "DATABASE_NOT_INITIALIZED" : "SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
