import { PrismaClient } from "../../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.warn(
    "[Prisma] Aviso: Nenhuma URL de banco de dados (TURSO_DATABASE_URL ou DATABASE_URL) foi configurada no ambiente.",
  );
}

const adapter = new PrismaLibSql({
  url: databaseUrl || "file:./dev.db",
  authToken,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
