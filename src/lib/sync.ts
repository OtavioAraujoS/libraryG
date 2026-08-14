import { prisma } from "@/lib/prisma";
import type { NormalizedGame } from "@/types/game";
import { Platform } from "../../generated/prisma/enums";

export interface SyncResult {
  total: number;
  created: number;
  updated: number;
}

interface GameOnPlatformExtra {
  playtimeMinutes?: number;
  playtime2WeeksMinutes?: number;
  lastPlayedAt?: Date;
  isShared?: boolean;
  ownerSteamId?: string;
  ownerName?: string;
}

export async function syncGames(
  games: NormalizedGame[],
  platform: Platform,
  extra: (game: NormalizedGame) => GameOnPlatformExtra = () => ({}),
): Promise<SyncResult> {
  let created = 0;
  let updated = 0;

  for (const game of games) {
    const existingGame = await prisma.game.findFirst({
      where: { title: game.title },
    });

    const gameRecord = existingGame
      ? await prisma.game.update({
          where: { id: existingGame.id },
          data: {
            coverImage: game.coverImage ?? existingGame.coverImage,
            bannerImage: game.bannerImage ?? existingGame.bannerImage,
          },
        })
      : await prisma.game.create({
          data: {
            title: game.title,
            coverImage: game.coverImage,
            bannerImage: game.bannerImage,
          },
        });

    const extraFields = {
      isShared: game.isShared ?? false,
      ownerSteamId: game.ownerSteamId,
      ownerName: game.ownerName,
      ...extra(game),
    };

    await prisma.gameOnPlatform.upsert({
      where: {
        platform_externalId: {
          platform,
          externalId: game.externalId,
        },
      },
      create: {
        gameId: gameRecord.id,
        platform,
        externalId: game.externalId,
        ...extraFields,
      },
      update: {
        ...extraFields,
        lastSyncedAt: new Date(),
      },
    });

    if (existingGame) {
      updated++;
    } else {
      created++;
    }
  }

  return { total: games.length, created, updated };
}
