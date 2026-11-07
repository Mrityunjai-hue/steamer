import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const gamesToInsert = [
  // Call of Duty — Modern Warfare Saga
  { steamAppId: 7940, series: "Call of Duty", fallbackTitle: "Call of Duty 4: Modern Warfare (2007)", hypeTier: "Hot", price: 79, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 10180, series: "Call of Duty", fallbackTitle: "Call of Duty: Modern Warfare 2 (2009)", hypeTier: "Hot", price: 79, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 42680, series: "Call of Duty", fallbackTitle: "Call of Duty: Modern Warfare 3 (2011)", hypeTier: "Hot", price: 79, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 393080, series: "Call of Duty", fallbackTitle: "Call of Duty: Modern Warfare Remastered", hypeTier: "Hot", price: 79, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 2000950, series: "Call of Duty", fallbackTitle: "Call of Duty: Modern Warfare (2019)", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 1938090, series: "Call of Duty", fallbackTitle: "Call of Duty: Modern Warfare II (2022)", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 2519060, series: "Call of Duty", fallbackTitle: "Call of Duty: Modern Warfare III (2023)", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },

  // Call of Duty — Black Ops Saga
  { steamAppId: 42700, series: "Call of Duty", fallbackTitle: "Call of Duty: Black Ops", hypeTier: "Hot", price: 79, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 202970, series: "Call of Duty", fallbackTitle: "Call of Duty: Black Ops II", hypeTier: "Hot", price: 79, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 311210, series: "Call of Duty", fallbackTitle: "Call of Duty: Black Ops III", hypeTier: "Hot", price: 79, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 1985810, series: "Call of Duty", fallbackTitle: "Call of Duty: Black Ops Cold War", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 2933620, series: "Call of Duty", fallbackTitle: "Call of Duty: Black Ops 6", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },

  // Call of Duty — Standalones & Sub-series
  { steamAppId: 10090, series: "Call of Duty", fallbackTitle: "Call of Duty: World at War", hypeTier: "Popular", price: 59, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 209160, series: "Call of Duty", fallbackTitle: "Call of Duty: Ghosts", hypeTier: "Popular", price: 59, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 209650, series: "Call of Duty", fallbackTitle: "Call of Duty: Advanced Warfare", hypeTier: "Popular", price: 59, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 292730, series: "Call of Duty", fallbackTitle: "Call of Duty: Infinite Warfare", hypeTier: "Popular", price: 59, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 476620, series: "Call of Duty", fallbackTitle: "Call of Duty: WWII", hypeTier: "Popular", price: 59, launcher: "Steam only", offlineTag: "Offline OK" },

  // Fighting & Action Anime Hits
  { steamAppId: 1364780, series: "Street Fighter", fallbackTitle: "Street Fighter 6", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 1490890, series: "Demon Slayer", fallbackTitle: "Demon Slayer: The Hinokami Chronicles", hypeTier: "Hot", price: 79, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 2373990, series: "Solo Leveling", fallbackTitle: "Solo Leveling: ARISE OVERDRIVE", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 1790600, series: "Dragon Ball", fallbackTitle: "DRAGON BALL: Sparking! ZERO", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },

  // PlayStation PC Masterpieces
  { steamAppId: 2215430, series: "PlayStation Hits", fallbackTitle: "Ghost of Tsushima DIRECTOR'S CUT", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },
  { steamAppId: 2322010, series: "PlayStation Hits", fallbackTitle: "God of War Ragnarök", hypeTier: "Hot", price: 99, launcher: "Steam only", offlineTag: "Offline OK" },
];

async function main() {
  console.log(`Starting catalog expansion for ${gamesToInsert.length} titles...`);

  // Ensure series records exist
  const seriesNames = [...new Set(gamesToInsert.map((g) => g.series))];
  const seriesMap = {};
  for (const sName of seriesNames) {
    let sRecord = await prisma.series.findUnique({ where: { name: sName } });
    if (!sRecord) {
      sRecord = await prisma.series.create({ data: { name: sName } });
      console.log(`Created series: ${sName}`);
    }
    seriesMap[sName] = sRecord.id;
  }

  for (const g of gamesToInsert) {
    let name = g.fallbackTitle;
    let header = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.steamAppId}/header.jpg`;
    let capsule = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.steamAppId}/library_600x900.jpg`;
    let steamPrice = 3999;
    let genres = "Action";
    let releaseDate = "Available";

    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${g.steamAppId}&l=english`);
      const data = await res.json();
      if (data && data[g.steamAppId] && data[g.steamAppId].success) {
        const d = data[g.steamAppId].data;
        name = d.name || g.fallbackTitle;
        if (d.header_image) header = d.header_image;
        if (d.genres && d.genres.length > 0) {
          genres = d.genres.map((x) => x.description).join(", ");
        }
        if (d.release_date && d.release_date.date) {
          releaseDate = d.release_date.date;
        }
        if (d.price_overview && d.price_overview.final) {
          steamPrice = Math.round(d.price_overview.final / 100);
        }
      }
    } catch (err) {
      console.warn(`Steam fetch warning for ${g.steamAppId}:`, err.message);
    }

    const appIdStr = String(g.steamAppId);
    const existing = await prisma.game.findFirst({
      where: {
        OR: [
          { steamAppId: appIdStr },
          { title: name },
        ],
      },
    });

    if (existing) {
      await prisma.game.update({
        where: { id: existing.id },
        data: {
          title: name,
          headerImage: header,
          capsuleImage: capsule,
          steamAppId: appIdStr,
          seriesId: seriesMap[g.series],
          genres,
          releaseDate,
        },
      });
      console.log(`Updated existing game: ${name}`);
    } else {
      await prisma.game.create({
        data: {
          title: name,
          steamAppId: appIdStr,
          hypeTier: g.hypeTier,
          ourMonthlyPriceINR: g.price,
          steamPriceINR: steamPrice,
          launcher: g.launcher,
          offlineTag: g.offlineTag,
          headerImage: header,
          capsuleImage: capsule,
          seriesId: seriesMap[g.series],
          purchasableAsSingle: true,
          genres,
          releaseDate,
        },
      });
      console.log(`Added new game: ${name}`);
    }

    await new Promise((r) => setTimeout(r, 60));
  }

  const finalCount = await prisma.game.count();
  console.log(`\nAll done! Total games in catalog: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();

    // Synchronize to prisma_seed/steamer.db and root ./steamer.db
    const sourceDb = path.join(process.cwd(), "prisma", "steamer.db");
    const seedDb = path.join(process.cwd(), "prisma_seed", "steamer.db");
    const rootDb = path.join(process.cwd(), "steamer.db");

    if (fs.existsSync(sourceDb)) {
      fs.copyFileSync(sourceDb, seedDb);
      fs.copyFileSync(sourceDb, rootDb);
      console.log("✓ Synchronized prisma/steamer.db to prisma_seed/ and root ./steamer.db");
    }
  });
