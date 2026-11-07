import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(12);
  const hash1 = await bcrypt.hash("SteamerMasterPass2026!", salt);

  const adminEmails = [
    "steamer.support365@gmail.com",
    "admin@steamer.live",
  ];

  for (const email of adminEmails) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: "ADMIN",
          passwordHash: hash1,
          isEmailVerified: true,
          isSuspended: false,
        },
      });
      console.log(`Updated admin user: ${email}`);
    } else {
      await prisma.user.create({
        data: {
          email,
          role: "ADMIN",
          passwordHash: hash1,
          isEmailVerified: true,
          profile: {
            create: {
              displayName: "Steamer Administrator",
            },
          },
        },
      });
      console.log(`Created new admin user: ${email}`);
    }
  }

  console.log("✓ Admin users configured successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();

    const sourceDb = path.join(process.cwd(), "prisma", "steamer.db");
    const seedDb = path.join(process.cwd(), "prisma_seed", "steamer.db");
    const rootDb = path.join(process.cwd(), "steamer.db");

    if (fs.existsSync(sourceDb)) {
      fs.copyFileSync(sourceDb, seedDb);
      fs.copyFileSync(sourceDb, rootDb);
      console.log("✓ Synchronized databases");
    }
  });

