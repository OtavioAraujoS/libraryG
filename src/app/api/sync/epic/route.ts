import { NextResponse, NextRequest } from "next/server";
import { fetchEpicLibrary } from "@/lib/integration/epic";
import { syncGames } from "@/lib/sync";
import { Platform } from "../../../../../generated/prisma/enums";
import { logger } from "@/lib/logger";
import { isAuthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isAuthorized(req, "sync/epic")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const games = await fetchEpicLibrary();
    const result = await syncGames(games, Platform.EPIC);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error("Erro ao sincronizar Epic", error);
    return NextResponse.json(
      { success: false, error: "Falha ao sincronizar biblioteca Epic" },
      { status: 500 },
    );
  }
}
