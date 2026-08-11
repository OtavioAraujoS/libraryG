import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let genres;

  try {
    genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro ao acessar o banco de dados." },
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
