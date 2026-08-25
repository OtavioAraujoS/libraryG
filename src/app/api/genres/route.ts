import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { ensureDatabaseReady } from "@/lib/db-init";

export async function GET() {
  let genres;

  try {
    try {
      genres = await prisma.genre.findMany({
        orderBy: { name: "asc" },
      });
    } catch {
      await ensureDatabaseReady();
      genres = await prisma.genre.findMany({
        orderBy: { name: "asc" },
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro ao acessar o banco de dados. Verifique a conexão ou execute 'npm run db:push'." },
      { status: 500 },
    );
  }

  if (!Array.isArray(genres)) {
    return NextResponse.json(
      {
        success: false,
        error: "Dados de gêneros inválidos retornados pelo banco.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    genres: genres.map((g) => g.name),
  });
}
