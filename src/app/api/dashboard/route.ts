import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { DashboardGameItem, FamilyMemberGroupItem } from "@/types";

function resolveMemberName(member: {
  ownerName: string | null;
  ownerSteamId: string | null;
  isShared: boolean;
}): string {
  if (!member.isShared) {
    return "Otávio (Você)";
  }

  if (member.ownerName && member.ownerName !== "Otávio") {
    return member.ownerName;
  }

  if (member.ownerSteamId) {
    return `Membro (${member.ownerSteamId.slice(-4)})`;
  }

  return "Compartilhado";
}

function buildFamilyMetrics(familyMembersGroup: FamilyMemberGroupItem[]) {
  const familyDataMap: Record<string, number> = {};

  for (const member of familyMembersGroup) {
    const name = resolveMemberName(member);
    familyDataMap[name] = (familyDataMap[name] ?? 0) + member._count._all;
  }

  return Object.entries(familyDataMap)
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => second.count - first.count);
}

function formatGame(game: DashboardGameItem["game"]) {
  return {
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
  };
}

function extractTopGames(gamesWithPlaytime: DashboardGameItem[], limit = 6) {
  const seenGameIds = new Set<string>();
  const topGames = [];

  for (const item of gamesWithPlaytime) {
    if (!seenGameIds.has(item.game.id)) {
      seenGameIds.add(item.game.id);
      topGames.push(formatGame(item.game));
    }

    if (topGames.length >= limit) {
      break;
    }
  }

  return topGames;
}

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
      prisma.gameOnPlatform.findMany({
        where: {
          playtimeMinutes: { gt: 0 },
        },
        orderBy: {
          playtimeMinutes: "desc",
        },
        take: 12,
        include: {
          game: {
            include: {
              platforms: true,
              genres: true,
            },
          },
        },
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
    const familyData = buildFamilyMetrics(familyMembersGroup);
    const topGames = extractTopGames(gamesWithPlaytime, 6);

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    logger.error("[GET /api/dashboard]", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar métricas do dashboard." },
      { status: 500 },
    );
  }
}
