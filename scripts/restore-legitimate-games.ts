/**
 * Restore legitimately-removed games with their real Steam AppIDs.
 * Run: npx tsx scripts/restore-legitimate-games.ts
 */
import { prisma } from "../lib/prisma";

const RESTORE_GAMES = [
  {
    title: "Battlefield 6",
    steamAppId: "2727850",
    releaseDate: "2025-06-05",
    genres: '["Action","Shooter","Multiplayer"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/2727850/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Hot",
  },
  {
    title: "Jurassic World Evolution 3",
    steamAppId: "2956840",
    releaseDate: "2025-09-09",
    genres: '["Simulation","Strategy"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/2956840/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Standard",
  },
  {
    title: "F1 25",
    steamAppId: "3139550",
    releaseDate: "2025-05-30",
    genres: '["Racing","Sports","Simulation"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/3139550/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Standard",
  },
  {
    title: "Max Payne 1 & 2 Remake",
    steamAppId: "2612430",
    releaseDate: "2025-08-19",
    genres: '["Action","Shooter","Third-Person"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/2612430/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Popular",
  },
  {
    title: "Alan Wake 2",
    steamAppId: "1876723",
    releaseDate: "2023-10-27",
    genres: '["Action","Horror","Thriller"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/1876723/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Hot",
  },
  {
    title: "The Witcher 4",
    steamAppId: "2762040",
    releaseDate: "2026-01-01",
    genres: '["RPG","Action","Open World"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/2762040/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Hot",
  },
  {
    title: "Phantom Blade Zero",
    steamAppId: "1407200",
    releaseDate: "2025-09-01",
    genres: '["Action","RPG","Soulslike"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/1407200/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Popular",
  },
  {
    title: "Batman: Arkham Asylum - Game of the Year Edition",
    steamAppId: "35140",
    releaseDate: "2010-01-01",
    genres: '["Action","Adventure","Superhero"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/35140/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Standard",
  },
  {
    title: "Subnautica 2",
    steamAppId: "2706680",
    releaseDate: "2025-04-29",
    genres: '["Survival","Adventure","Open World"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/2706680/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Popular",
  },
  {
    title: "Resident Evil 3 Remake",
    steamAppId: "952070",
    releaseDate: "2020-04-03",
    genres: '["Action","Horror","Survival"]',
    headerImage: "https://shared.akamaized.net/store_item_assets/steam/apps/952070/header.jpg",
    ourMonthlyPriceINR: 300,
    hypeTier: "Standard",
  },
];

async function main() {
  console.log("🔄 Restoring legitimate games with real Steam AppIDs...\n");

  for (const g of RESTORE_GAMES) {
    const existing = await prisma.game.findFirst({
      where: {
        OR: [
          { steamAppId: g.steamAppId },
          { title: { equals: g.title, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true },
    });

    if (existing) {
      console.log(`⏭  Already exists: "${existing.title}"`);
      continue;
    }

    await prisma.game.create({
      data: {
        title: g.title,
        steamAppId: g.steamAppId,
        releaseDate: g.releaseDate,
        genres: g.genres,
        headerImage: g.headerImage,
        capsuleImage: g.headerImage.replace("header.jpg", "capsule_231x87.jpg"),
        ourMonthlyPriceINR: g.ourMonthlyPriceINR,
        hypeTier: g.hypeTier,
        offlineTag: "Unverified",
        launcher: "steam",
      },
    });
    console.log(`✅ Restored: "${g.title}" → AppID ${g.steamAppId}`);
  }

  const total = await prisma.game.count();
  console.log(`\n✅ Done. ${total} games in DB.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
