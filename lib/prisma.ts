import { PrismaClient } from "@prisma/client";

// Ensure fallback for SQLite in container/serverless environments
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./steamer.db";
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

