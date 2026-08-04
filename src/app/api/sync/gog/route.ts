import { NextResponse } from "next/server";
import { fetchGogLibrary } from "@/lib/integration/gog";
import { syncGames } from "@/lib/sync";
import { Platform } from "../../../../../generated/prisma/enums";

export async function POST() {
  try {
    const games = await fetchGogLibrary();
    const result = await syncGames(games, Platform.GOG);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Erro ao sincronizar GOG:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao sincronizar biblioteca GOG" },
      { status: 500 },
    );
  }
}
