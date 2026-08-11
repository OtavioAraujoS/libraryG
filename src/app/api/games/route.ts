import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Platform } from "../../../../generated/prisma/enums";
import type { Prisma } from "../../../../generated/prisma/client";
import { logger } from "@/lib/logger";

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

    const games = await prisma.game.findMany({
      where,
      include: {
        platforms: true,
        genres: true,
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      success: true,
      total: games.length,
      games,
    });
  } catch (error) {
    logger.error("[GET /api/games]", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar jogos." },
      { status: 500 },
    );
  }
}
