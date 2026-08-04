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
          data: { coverImage: game.coverImage ?? existingGame.coverImage },
        })
      : await prisma.game.create({
          data: {
            title: game.title,
            coverImage: game.coverImage,
          },
        });

    const extraFields = extra(game);

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

    existingGame ? updated++ : created++;
  }

  return { total: games.length, created, updated };
}
