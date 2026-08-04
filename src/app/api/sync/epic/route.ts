import { NextResponse } from "next/server";
import { fetchEpicLibrary } from "@/lib/integration/epic";
import { syncGames } from "@/lib/sync";
import { Platform } from "../../../../../generated/prisma/enums";

export async function POST() {
  try {
    const games = await fetchEpicLibrary();
    const result = await syncGames(games, Platform.EPIC);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Erro ao sincronizar Epic:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao sincronizar biblioteca Epic" },
      { status: 500 }
    );
  }
}
