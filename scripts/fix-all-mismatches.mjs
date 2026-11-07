import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Precise overrides for titles that had wrong or duplicate AppIds
const FIXES = {
  "007 First Light": {
    steamAppId: "3768760",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3768760/be65391533f072e79699be70ef2d47b7b2ac57ee/header_alt_assets_5.jpg?t=1793979129",
    releaseDate: "May 26, 2026",
    genres: "Action, Adventure, Stealth",
    steamPriceINR: 3999
  },
  "A Plague Tale: Requiem": {
    steamAppId: "1182900",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg?t=1784712272",
    releaseDate: "Oct 18, 2022",
    genres: "Action, Adventure, Story Rich",
    steamPriceINR: 2499
  },
  "Pragmata": {
    steamAppId: "3357650",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3357650/e32e168b25ed68a0cf6264c220c07e96c2abfb56/header.jpg?t=1791454600",
    releaseDate: "2026",
    genres: "Action, Adventure, Sci-Fi",
    steamPriceINR: 3999
  },
  "Stellar Blade": {
    steamAppId: "3489700",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3489700/header.jpg?t=1776466244",
    releaseDate: "2026",
    genres: "Action, Hack and Slash, Sci-Fi",
    steamPriceINR: 3999
  },
  "Forza Horizon 6": {
    steamAppId: "2483190",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2483190/c53fe3362cc3267a5d34aca3e796b90963e0e23f/header_alt_assets_6.jpg?t=1793894652",
    releaseDate: "2026",
    genres: "Racing, Open World, Driving",
    steamPriceINR: 4999
  },
  "Jurassic World Evolution 3": {
    steamAppId: "2958130",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2958130/df39f8c59232633e8e01ab63313b095402bdd0d5/header.jpg?t=1790687062",
    releaseDate: "2026",
    genres: "Simulation, Strategy, Management",
    steamPriceINR: 3999
  },
  "Internet Cafe & Supermarket Simulator": {
    steamAppId: "2738380",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2738380/capsule_231x87.jpg?t=1763086065",
    releaseDate: "Feb 23, 2024",
    genres: "Simulation, Management, Casual",
    steamPriceINR: 850
  },
  "Tomb Raider I Remastered": {
    steamAppId: "2478970",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2478970/a94ccfdb7582dc5564cdf736b0f239531b66bf1d/header.jpg?t=1788752575",
    releaseDate: "Feb 14, 2024",
    genres: "Action, Adventure, Classic",
    steamPriceINR: 1999
  },
  "Tomb Raider II Remastered": {
    steamAppId: "2478970",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2478970/a94ccfdb7582dc5564cdf736b0f239531b66bf1d/header.jpg?t=1788752575",
    releaseDate: "Feb 14, 2024",
    genres: "Action, Adventure, Classic",
    steamPriceINR: 1999
  },
  "Tomb Raider III Remastered": {
    steamAppId: "2478970",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2478970/a94ccfdb7582dc5564cdf736b0f239531b66bf1d/header.jpg?t=1788752575",
    releaseDate: "Feb 14, 2024",
    genres: "Action, Adventure, Classic",
    steamPriceINR: 1999
  },
  "Tomb Raider IV Remastered": {
    steamAppId: "2525380",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2525380/header.jpg?t=1788752633",
    releaseDate: "Feb 14, 2025",
    genres: "Action, Adventure, Classic",
    steamPriceINR: 1999
  },
  "Tomb Raider V Remastered": {
    steamAppId: "2525380",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2525380/header.jpg?t=1788752633",
    releaseDate: "Feb 14, 2025",
    genres: "Action, Adventure, Classic",
    steamPriceINR: 1999
  },
  "Tomb Raider VI Remastered": {
    steamAppId: "2525380",
    headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2525380/header.jpg?t=1788752633",
    releaseDate: "Feb 14, 2025",
    genres: "Action, Adventure, Classic",
    steamPriceINR: 1999
  },
  "Resident Evil 3: Nemesis (1999)": {
    steamAppId: "952060",
    headerImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/952060/header.jpg",
    releaseDate: "Apr 3, 2020",
    genres: "Action, Survival Horror",
    steamPriceINR: 1999
  },
  "Deadpool": {
    steamAppId: "224060",
    headerImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/224060/header.jpg",
    releaseDate: "Jun 25, 2013",
    genres: "Action, Comedy, Superhero",
    steamPriceINR: 1999
  },
  "Hitman: Absolution": {
    steamAppId: "205930",
    headerImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/205930/header.jpg",
    releaseDate: "Nov 20, 2012",
    genres: "Action, Stealth",
    steamPriceINR: 850
  },
  "Assassin's Creed: Black Flag Resynced": {
    steamAppId: "277590",
    headerImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/277590/header.jpg",
    releaseDate: "Feb 25, 2014",
    genres: "Action, Adventure, Open World",
    steamPriceINR: 850
  }
};

async function run() {
  console.log("Applying precise fixes to mismatched games in database...");
  
  for (const [title, data] of Object.entries(FIXES)) {
    const res = await prisma.game.updateMany({
      where: { title },
      data: {
        steamAppId: data.steamAppId,
        headerImage: data.headerImage,
        releaseDate: data.releaseDate,
        genres: data.genres,
        steamPriceINR: data.steamPriceINR
      }
    });
    console.log(`Updated "${title}" -> steamAppId: ${data.steamAppId} (matched ${res.count} records)`);
  }

  // Update LEGO Batman: Legacy of the Dark Knight -> LEGO Marvel Super Heroes if exists
  const legoCheck = await prisma.game.findFirst({
    where: { title: "LEGO Batman: Legacy of the Dark Knight" }
  });
  if (legoCheck) {
    await prisma.game.update({
      where: { id: legoCheck.id },
      data: {
        title: "LEGO Marvel Super Heroes",
        steamAppId: "249130",
        headerImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/249130/header.jpg",
        releaseDate: "Oct 22, 2013",
        genres: "Action, Adventure, Superhero",
        steamPriceINR: 565
      }
    });
    console.log(`Renamed "LEGO Batman: Legacy of the Dark Knight" -> "LEGO Marvel Super Heroes" (AppId: 249130)`);
  }

  // Also sync to prisma_seed/steamer.db if it exists
  const seedDbPath = path.join(process.cwd(), 'prisma_seed', 'steamer.db');
  const mainDbPath = path.join(process.cwd(), 'prisma', 'steamer.db');
  if (fs.existsSync(seedDbPath)) {
    fs.copyFileSync(mainDbPath, seedDbPath);
    console.log("Synced changes to prisma_seed/steamer.db");
  }

  console.log("\nAll mismatch fixes applied successfully!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

