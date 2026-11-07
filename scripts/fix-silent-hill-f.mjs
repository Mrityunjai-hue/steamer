import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const newHeaderImage = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2947440/7e5d923ac622bd1775ebc9b5d4b5b0a24bf5ed40/header.jpg?t=1770169624";

async function updateSilentHillF() {
  console.log("Updating Silent Hill f header image in database...");

  const updated = await prisma.game.updateMany({
    where: {
      OR: [
        { title: { contains: "Silent Hill f" } },
        { title: { contains: "SILENT HILL f" } },
        { steamAppId: "2947440" },
      ],
    },
    data: {
      headerImage: newHeaderImage,
    },
  });

  console.log(`Updated ${updated.count} game records in Prisma DB.`);

  // Update in JSON files
  const jsonFiles = ["scripts/all_games_current.json", "scripts/full_verification.json"];
  for (const jf of jsonFiles) {
    if (fs.existsSync(jf)) {
      const data = JSON.parse(fs.readFileSync(jf, "utf8"));
      let count = 0;
      for (const item of data) {
        if (item.title?.toLowerCase().includes("silent hill f") || item.steamAppId === "2947440") {
          item.headerImage = newHeaderImage;
          count++;
        }
      }
      fs.writeFileSync(jf, JSON.stringify(data, null, 2), "utf8");
      console.log(`Updated ${count} items in ${jf}`);
    }
  }

  // Copy prisma/steamer.db to prisma_seed and root
  const src = path.join(process.cwd(), "prisma", "steamer.db");
  const destSeed = path.join(process.cwd(), "prisma_seed", "steamer.db");
  const destRoot = path.join(process.cwd(), "steamer.db");

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, destSeed);
    fs.copyFileSync(src, destRoot);
    console.log("Synchronized database replicas.");
  }
}

updateSilentHillF()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

