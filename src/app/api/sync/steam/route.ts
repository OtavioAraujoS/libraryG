import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchSteamLibrary } from "@/lib/integration/steam";

export async function POST() {
  try {
    const games = await fetchSteamLibrary();

    let created = 0;
    let updated = 0;

    for (const game of games) {
      const existingGame = await prisma.game.findFirst({
        where: { title: game.title },
      });

      const gameRecord = existingGame
        ? await prisma.game.update({
            where: { id: existingGame.id },
            data: { coverImage: game.coverImage },
          })
        : await prisma.game.create({
            data: {
              title: game.title,
              coverImage: game.coverImage,
            },
          });

      await prisma.gameOnPlatform.upsert({
        where: {
          platform_externalId: {
            platform: "STEAM",
            externalId: game.externalId,
          },
        },
        create: {
          gameId: gameRecord.id,
          platform: "STEAM",
          externalId: game.externalId,
          playtimeMinutes: game.playtimeMinutes,
        },
        update: {
          playtimeMinutes: game.playtimeMinutes,
          lastSyncedAt: new Date(),
        },
      });

      existingGame ? updated++ : created++;
    }

    return NextResponse.json({
      success: true,
      total: games.length,
      created,
      updated,
    });
  } catch (error) {
    console.error("Erro ao sincronizar Steam:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao sincronizar biblioteca Steam" },
      { status: 500 },
    );
  }
}
