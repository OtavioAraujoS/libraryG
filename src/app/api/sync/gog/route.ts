import { NextRequest, NextResponse } from "next/server";
import { fetchGogLibrary } from "@/lib/integration/gog";
import { syncGames } from "@/lib/sync";
import { Platform } from "../../../../../generated/prisma/enums";
import { logger } from "@/lib/logger";

import { isAuthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isAuthorized(req, "sync/gog")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const games = await fetchGogLibrary();
    const result = await syncGames(games, Platform.GOG);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error("Erro ao sincronizar GOG", error);
    return NextResponse.json(
      { success: false, error: "Falha ao sincronizar biblioteca GOG" },
      { status: 500 },
    );
  }
}
