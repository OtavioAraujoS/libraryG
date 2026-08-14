import { NextRequest, NextResponse } from "next/server";
import { fetchSteamLibrary } from "@/lib/integration/steam";
import { syncGames } from "@/lib/sync";
import { Platform } from "../../../../../generated/prisma/enums";
import { logger } from "@/lib/logger";

import { isAuthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isAuthorized(req, "sync/steam")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const games = await fetchSteamLibrary();
    const result = await syncGames(games, Platform.STEAM, (game) => ({
      playtimeMinutes: game.playtimeMinutes,
      playtime2WeeksMinutes: game.playtime2WeeksMinutes,
      lastPlayedAt: game.lastPlayedAt,
    }));

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error("Erro ao sincronizar Steam", error);
    return NextResponse.json(
      { success: false, error: "Falha ao sincronizar biblioteca Steam" },
      { status: 500 },
    );
  }
}
