import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const [
      totalGames,
      platformGroups,
      playtimeAgg,
      familySharedCount,
      familyMembersGroup,
      gamesWithPlaytime,
    ] = await Promise.all([
      prisma.game.count(),
      prisma.gameOnPlatform.groupBy({
        by: ["platform"],
        _count: { _all: true },
      }),
      prisma.gameOnPlatform.aggregate({
        _sum: { playtimeMinutes: true },
      }),
      prisma.gameOnPlatform.count({
        where: { isShared: true },
      }),
      prisma.gameOnPlatform.groupBy({
        by: ["ownerName", "ownerSteamId", "isShared"],
        where: {
          platform: "STEAM",
        },
        _count: { _all: true },
      }),
      prisma.game.findMany({
        where: {
          platforms: {
            some: {
              playtimeMinutes: { gt: 0 },
            },
          },
        },
        include: {
          platforms: true,
          genres: true,
        },
        take: 30,
      }),
    ]);

    const platformData = platformGroups.map((group) => ({
      platform: group.platform,
      count: group._count._all,
    }));

    const totalPlatformLinks = platformData.reduce(
      (sum, platform) => sum + platform.count,
      0,
    );
    const totalMinutes = playtimeAgg._sum.playtimeMinutes ?? 0;

    const familyDataMap: Record<string, number> = {};
    for (const member of familyMembersGroup) {
      let name = member.ownerName;
      if (!name || name === "Otávio" || !member.isShared) {
        name = member.isShared
          ? member.ownerSteamId
            ? `Membro (${member.ownerSteamId.slice(-4)})`
            : "Compartilhado"
          : "Otávio (Você)";
      }
      familyDataMap[name] = (familyDataMap[name] ?? 0) + member._count._all;
    }

    const familyData = Object.entries(familyDataMap)
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => second.count - first.count);

    const topGames = gamesWithPlaytime
      .map((game) => ({
        ...game,
        releaseDate: game.releaseDate ? game.releaseDate.toISOString() : null,
        platforms: game.platforms.map((platform) => ({
          id: platform.id,
          platform: platform.platform,
          externalId: platform.externalId,
          playtimeMinutes: platform.playtimeMinutes ?? 0,
          playtime2WeeksMinutes: platform.playtime2WeeksMinutes,
          lastPlayedAt: platform.lastPlayedAt
            ? platform.lastPlayedAt.toISOString()
            : null,
          isShared: platform.isShared,
          ownerSteamId: platform.ownerSteamId,
          ownerName: platform.ownerName,
          lastSyncedAt: platform.lastSyncedAt.toISOString(),
        })),
        genres: game.genres.map((genre) => ({
          id: genre.id,
          name: genre.name,
        })),
        totalPlaytime: game.platforms.reduce(
          (sum, platform) => sum + (platform.playtimeMinutes ?? 0),
          0,
        ),
      }))
      .sort((first, second) => second.totalPlaytime - first.totalPlaytime)
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      data: {
        totalGames,
        totalPlatformLinks,
        totalMinutes,
        familySharedCount,
        platformData,
        familyData,
        topGames,
      },
    });
  } catch (error) {
    logger.error("[GET /api/dashboard]", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar métricas do dashboard." },
      { status: 500 },
    );
  }
}
