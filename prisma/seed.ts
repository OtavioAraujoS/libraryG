import { prisma } from "../src/lib/prisma";

const GENRES = [
  "Ação",
  "Aventura",
  "RPG",
  "Estratégia",
  "Simulação",
  "Esporte",
  "FPS",
  "Indie",
  "Terror",
  "Puzzle",
];

const GENRE_MAPPINGS: Record<string, string[]> = {
  "Left 4 Dead": ["Ação", "FPS", "Terror"],
  "Resident Evil": ["Ação", "Terror"],
  "Grand Theft Auto": ["Ação", "Aventura"],
  Witcher: ["RPG", "Aventura"],
  Portal: ["Puzzle", "Aventura"],
  "Counter-Strike": ["FPS", "Ação"],
  Terraria: ["Indie", "Aventura"],
  Cyberpunk: ["RPG", "Ação"],
  Dota: ["Estratégia", "Ação"],
  "Half-Life": ["FPS", "Ação"],
  Doom: ["FPS", "Ação", "Terror"],
  Fallout: ["RPG", "Aventura"],
  Skyrim: ["RPG", "Aventura"],
  "Elden Ring": ["RPG", "Ação"],
  "Dark Souls": ["RPG", "Ação"],
  FIFA: ["Esporte"],
  "FC ": ["Esporte"],
  Sims: ["Simulação"],
  Civilization: ["Estratégia"],
  Stardew: ["Indie", "Simulação"],
};

async function main() {
  const genreRecords: Record<string, { id: string; name: string }> = {};
  for (const name of GENRES) {
    const genre = await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    genreRecords[name] = genre;
  }

  const games = await prisma.game.findMany({
    include: { genres: true },
  });

  let updatedCount = 0;

  for (const game of games) {
    const assignedGenreNames: string[] = [];

    for (const [key, mappedGenres] of Object.entries(GENRE_MAPPINGS)) {
      if (game.title.toLowerCase().includes(key.toLowerCase())) {
        assignedGenreNames.push(...mappedGenres);
      }
    }

    if (assignedGenreNames.length === 0) {
      const charSum = game.title
        .split("")
        .reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0);
      const firstGenreIndex = charSum % GENRES.length;
      const secondGenreIndex = (charSum + 3) % GENRES.length;

      assignedGenreNames.push(GENRES[firstGenreIndex]);
      if (firstGenreIndex !== secondGenreIndex) {
        assignedGenreNames.push(GENRES[secondGenreIndex]);
      }
    }

    const uniqueGenreNames = [...new Set(assignedGenreNames)];

    await prisma.game.update({
      where: { id: game.id },
      data: {
        genres: {
          set: uniqueGenreNames.map((name) => ({ id: genreRecords[name].id })),
        },
      },
    });

    updatedCount++;
  }

  console.log(`Seed concluído com sucesso: ${updatedCount} jogos atualizados.`);
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {});
