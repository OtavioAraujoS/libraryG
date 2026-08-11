import { NextRequest, NextResponse } from "next/server";
import { fetchSteamLibrary } from "@/lib/integration/steam";
import { fetchEpicLibrary } from "@/lib/integration/epic";
import { fetchGogLibrary } from "@/lib/integration/gog";
import { syncGames } from "@/lib/sync";
import { Platform } from "../../../../../generated/prisma/enums";
import { logger } from "@/lib/logger";

import { isAuthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isAuthorized(req, "sync/all")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [steamResult, epicResult, gogResult] = await Promise.allSettled([
    fetchSteamLibrary().then((games) =>
      syncGames(games, Platform.STEAM, (g) => ({
        playtimeMinutes: g.playtimeMinutes,
      })),
    ),
    fetchEpicLibrary().then((games) => syncGames(games, Platform.EPIC)),
    fetchGogLibrary().then((games) => syncGames(games, Platform.GOG)),
  ]);

  const report = {
    steam:
      steamResult.status === "fulfilled"
        ? { ok: true, ...steamResult.value }
        : {
            ok: false,
            error: steamResult.reason?.message || String(steamResult.reason),
          },
    epic:
      epicResult.status === "fulfilled"
        ? { ok: true, ...epicResult.value }
        : {
            ok: false,
            error: epicResult.reason?.message || String(epicResult.reason),
          },
    gog:
      gogResult.status === "fulfilled"
        ? { ok: true, ...gogResult.value }
        : {
            ok: false,
            error: gogResult.reason?.message || String(gogResult.reason),
          },
  };

  Object.entries(report).forEach(([platform, res]) => {
    if (!res.ok) {
      logger.error(`Falha ao sincronizar [${platform}]`, res.error);
    }
  });

  const anyOk = Object.values(report).some((r) => r.ok);

  if (!anyOk) {
    logger.error("Todas as plataformas falharam ao sincronizar", report);
    return NextResponse.json({ success: false, report }, { status: 500 });
  }

  logger.info("Sincronização executada", report);
  return NextResponse.json({ success: true, report });
}
