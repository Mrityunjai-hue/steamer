import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function getDatabaseUrl(): string {
  // If running in Vercel or AWS Lambda serverless environment
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NOW_REGION
  );

  if (isServerless) {
    const tmpDbPath = path.join("/tmp", "steamer.db");

    const candidates = [
      path.join(process.cwd(), "prisma", "steamer.db"),
      path.join(process.cwd(), "steamer.db"),
      path.join(process.cwd(), "prisma_seed", "steamer.db"),
      path.join(__dirname, "..", "prisma", "steamer.db"),
      path.join(__dirname, "..", "steamer.db"),
      "/var/task/prisma/steamer.db",
      "/var/task/steamer.db",
    ];

    const sourcePath = candidates.find((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    });

    let shouldCopy = true;
    if (fs.existsSync(tmpDbPath) && sourcePath) {
      try {
        const srcStat = fs.statSync(sourcePath);
        const tmpStat = fs.statSync(tmpDbPath);
        if (srcStat.size === tmpStat.size && srcStat.mtimeMs <= tmpStat.mtimeMs) {
          shouldCopy = false;
        }
      } catch {
        shouldCopy = true;
      }
    }

    if (shouldCopy && sourcePath) {
      try {
        fs.copyFileSync(sourcePath, tmpDbPath);
        console.log(`[Prisma Vercel] Initialized SQLite at ${tmpDbPath} from ${sourcePath}`);
      } catch (e) {
        console.error(`[Prisma Vercel] Error copying SQLite from ${sourcePath}:`, e);
      }
    }

    return `file:${tmpDbPath}`;
  }

  // Local development / server environment
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith("file:")) {
      const raw = process.env.DATABASE_URL.replace("file:", "");
      if (path.isAbsolute(raw)) return process.env.DATABASE_URL;

      const cwdPath = path.join(process.cwd(), raw);
      const prismaPath = path.join(process.cwd(), "prisma", path.basename(raw));
      if (fs.existsSync(cwdPath)) return `file:${cwdPath}`;
      if (fs.existsSync(prismaPath)) return `file:${prismaPath}`;
    }
    return process.env.DATABASE_URL;
  }

  const defaultDb = path.join(process.cwd(), "prisma", "steamer.db");
  return `file:${defaultDb}`;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
