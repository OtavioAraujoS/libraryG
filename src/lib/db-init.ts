import { createClient } from "@libsql/client";
import { logger } from "./logger";

let initPromise: Promise<void> | null = null;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "coverImage" TEXT,
    "bannerImage" TEXT,
    "description" TEXT,
    "releaseDate" DATETIME,
    "developer" TEXT,
    "publisher" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Game_title_idx" ON "Game"("title");

CREATE TABLE IF NOT EXISTS "GameOnPlatform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "playtimeMinutes" INTEGER,
    "playtime2WeeksMinutes" INTEGER,
    "lastPlayedAt" DATETIME,
    "isShared" BOOLEAN NOT NULL DEFAULT 0,
    "ownerSteamId" TEXT,
    "ownerName" TEXT,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameOnPlatform_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "GameOnPlatform_platform_externalId_key" ON "GameOnPlatform"("platform", "externalId");
CREATE INDEX IF NOT EXISTS "GameOnPlatform_gameId_idx" ON "GameOnPlatform"("gameId");
CREATE INDEX IF NOT EXISTS "GameOnPlatform_platform_idx" ON "GameOnPlatform"("platform");
CREATE INDEX IF NOT EXISTS "GameOnPlatform_playtimeMinutes_idx" ON "GameOnPlatform"("playtimeMinutes");
CREATE INDEX IF NOT EXISTS "GameOnPlatform_isShared_idx" ON "GameOnPlatform"("isShared");
CREATE INDEX IF NOT EXISTS "GameOnPlatform_ownerSteamId_idx" ON "GameOnPlatform"("ownerSteamId");

CREATE TABLE IF NOT EXISTS "Genre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Genre_name_key" ON "Genre"("name");

CREATE TABLE IF NOT EXISTS "_GameGenres" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "_GameGenres_AB_unique" ON "_GameGenres"("A", "B");
CREATE INDEX IF NOT EXISTS "_GameGenres_B_index" ON "_GameGenres"("B");
`;

export async function ensureDatabaseReady(): Promise<void> {
  if (initPromise !== null) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const databaseUrl =
        process.env.TURSO_DATABASE_URL ||
        process.env.DATABASE_URL ||
        "file:./dev.db";
      const authToken = process.env.TURSO_AUTH_TOKEN;

      const client = createClient({
        url: databaseUrl,
        authToken: authToken || undefined,
      });

      const statements = SCHEMA_SQL.split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      for (const statement of statements) {
        await client.execute(statement);
      }

      logger.info("[DB-Init] Estrutura do banco de dados verificada e pronta.");
    } catch (err) {
      logger.error(
        "[DB-Init] Falha ao verificar/inicializar tabelas do banco:",
        err,
      );
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}
