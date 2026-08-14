import { NextRequest, NextResponse, after } from "next/server";
import { fetchSteamLibrary } from "@/lib/integration/steam";
import { fetchEpicLibrary } from "@/lib/integration/epic";
import { fetchGogLibrary } from "@/lib/integration/gog";
import { syncGames } from "@/lib/sync";
import { Platform } from "../../../../../generated/prisma/enums";
import { logger } from "@/lib/logger";
import { isAuthorized } from "@/lib/auth";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isAuthorized(req, "sync/all")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  after(async () => {
    logger.info("Iniciando processamento em segundo plano das bibliotecas...");

    const [steamResult, epicResult, gogResult] = await Promise.allSettled([
      fetchSteamLibrary().then((games) =>
        syncGames(games, Platform.STEAM, (g) => ({
          playtimeMinutes: g.playtimeMinutes,
          playtime2WeeksMinutes: g.playtime2WeeksMinutes,
          lastPlayedAt: g.lastPlayedAt,
          isShared: g.isShared,
          ownerSteamId: g.ownerSteamId,
          ownerName: g.ownerName,
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

    logger.info("Sincronização em segundo plano concluída", report);
  });

  return NextResponse.json({
    success: true,
    message: "Sincronização iniciada em segundo plano.",
  });
}
