import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface GameEntry {
  title: string;
  steamAppId: string;
  series: string;
  releaseYear: string;
  genres: string;
  steamPriceINR: number;
  hypeTier: string;
  launcher?: string;
}

const fanFavorites: GameEntry[] = [
  // --- ALAN WAKE FRANCHISE ---
  {
    title: "Alan Wake",
    steamAppId: "108710",
    series: "Alan Wake",
    releaseYear: "2012",
    genres: "Action, Adventure, Psychological Horror, Mystery",
    steamPriceINR: 1299,
    hypeTier: "Hot",
  },
  {
    title: "Alan Wake's American Nightmare",
    steamAppId: "202750",
    series: "Alan Wake",
    releaseYear: "2012",
    genres: "Action, Adventure, Horror, Third-Person Shooter",
    steamPriceINR: 699,
    hypeTier: "Popular",
  },
  {
    title: "Alan Wake 2",
    steamAppId: "2677660",
    series: "Alan Wake",
    releaseYear: "2023",
    genres: "Survival Horror, Psychological Horror, Cinematic, Mystery",
    steamPriceINR: 3499,
    hypeTier: "Hot",
  },

  // --- MAX PAYNE FRANCHISE ---
  {
    title: "Max Payne",
    steamAppId: "12140",
    series: "Max Payne",
    releaseYear: "2001",
    genres: "Action, Bullet Time, Third-Person Shooter, Classic Noir",
    steamPriceINR: 699,
    hypeTier: "Hot",
  },
  {
    title: "Max Payne 2: The Fall of Max Payne",
    steamAppId: "12150",
    series: "Max Payne",
    releaseYear: "2003",
    genres: "Action, Bullet Time, Third-Person Shooter, Noir",
    steamPriceINR: 699,
    hypeTier: "Hot",
  },
  {
    title: "Max Payne 3",
    steamAppId: "204100",
    series: "Max Payne",
    releaseYear: "2012",
    genres: "Action, Bullet Time, Third-Person Shooter, Rockstar",
    steamPriceINR: 1999,
    hypeTier: "Hot",
  },
  {
    title: "Max Payne 1 & 2 Remake",
    steamAppId: "2840770",
    series: "Max Payne",
    releaseYear: "2026",
    genres: "Action, Bullet Time, Remake, Remedy, Rockstar",
    steamPriceINR: 4299,
    hypeTier: "Hot",
  },

  // --- FINAL FANTASY FRANCHISE ---
  {
    title: "FINAL FANTASY VII REMAKE INTERGRADE",
    steamAppId: "1462040",
    series: "Final Fantasy",
    releaseYear: "2022",
    genres: "JRPG, Action RPG, Great Soundtrack, Story Rich, Masterpiece",
    steamPriceINR: 4799,
    hypeTier: "Hot",
  },
  {
    title: "Final Fantasy VII Rebirth",
    steamAppId: "2440510",
    series: "Final Fantasy",
    releaseYear: "2025",
    genres: "JRPG, Open World, Action RPG, Story Rich, Masterpiece",
    steamPriceINR: 4999,
    hypeTier: "Hot",
  },
  {
    title: "Final Fantasy XVI",
    steamAppId: "2515020",
    series: "Final Fantasy",
    releaseYear: "2024",
    genres: "Action RPG, Cinematic, Dark Fantasy, Spectacle Fighter",
    steamPriceINR: 4499,
    hypeTier: "Hot",
  },
  {
    title: "CRISIS CORE –FINAL FANTASY VII– REUNION",
    steamAppId: "1608070",
    series: "Final Fantasy",
    releaseYear: "2022",
    genres: "JRPG, Action RPG, Remaster, Zack Fair, Great Soundtrack",
    steamPriceINR: 3199,
    hypeTier: "Popular",
  },
  {
    title: "FINAL FANTASY XV WINDOWS EDITION",
    steamAppId: "637650",
    series: "Final Fantasy",
    releaseYear: "2018",
    genres: "Open World, JRPG, Action RPG, Exploration, Great Soundtrack",
    steamPriceINR: 2099,
    hypeTier: "Hot",
  },
  {
    title: "FINAL FANTASY X/X-2 HD Remaster",
    steamAppId: "359870",
    series: "Final Fantasy",
    releaseYear: "2016",
    genres: "Classic JRPG, Turn-Based Combat, Emotional Story, Remaster",
    steamPriceINR: 1299,
    hypeTier: "Popular",
  },
  {
    title: "FINAL FANTASY XII THE ZODIAC AGE",
    steamAppId: "748490",
    series: "Final Fantasy",
    releaseYear: "2018",
    genres: "JRPG, Tactical, Open World, Gambit System, Remaster",
    steamPriceINR: 2499,
    hypeTier: "Popular",
  },
  {
    title: "STRANGER OF PARADISE FINAL FANTASY ORIGIN",
    steamAppId: "2113900",
    series: "Final Fantasy",
    releaseYear: "2023",
    genres: "Action RPG, Soulslike, Dark Fantasy, Team NINJA",
    steamPriceINR: 2499,
    hypeTier: "Popular",
  },
  {
    title: "FINAL FANTASY VIII - Remastered",
    steamAppId: "1026680",
    series: "Final Fantasy",
    releaseYear: "2019",
    genres: "Classic JRPG, Turn-Based, Story Rich, Remaster",
    steamPriceINR: 1399,
    hypeTier: "Popular",
  },
  {
    title: "FINAL FANTASY IX",
    steamAppId: "377840",
    series: "Final Fantasy",
    releaseYear: "2016",
    genres: "Classic JRPG, Turn-Based, Fantasy, Story Rich, Masterpiece",
    steamPriceINR: 1399,
    hypeTier: "Hot",
  },
  {
    title: "FINAL FANTASY XIII",
    steamAppId: "292120",
    series: "Final Fantasy",
    releaseYear: "2014",
    genres: "JRPG, Sci-Fi, Story Rich, Great Soundtrack",
    steamPriceINR: 999,
    hypeTier: "Standard",
  },
  {
    title: "FINAL FANTASY XIII-2",
    steamAppId: "292140",
    series: "Final Fantasy",
    releaseYear: "2014",
    genres: "JRPG, Time Travel, Great Soundtrack, Sequel",
    steamPriceINR: 1199,
    hypeTier: "Standard",
  },
  {
    title: "LIGHTNING RETURNS: FINAL FANTASY XIII",
    steamAppId: "345350",
    series: "Final Fantasy",
    releaseYear: "2015",
    genres: "Action RPG, JRPG, Customization, Female Protagonist",
    steamPriceINR: 1199,
    hypeTier: "Standard",
  },

  // --- REMEDY & NOIR UNIVERSE ---
  {
    title: "Control Ultimate Edition",
    steamAppId: "870780",
    series: "Remedy Connected Universe",
    releaseYear: "2020",
    genres: "Action, Supernatural, Sci-Fi, Atmospheric, Remedy",
    steamPriceINR: 2199,
    hypeTier: "Hot",
  },
  {
    title: "Quantum Break",
    steamAppId: "474960",
    series: "Remedy Connected Universe",
    releaseYear: "2016",
    genres: "Action, Time Manipulation, Story Rich, Cinematic, Sci-Fi",
    steamPriceINR: 849,
    hypeTier: "Popular",
  },

  // --- CROWD-PLEASING LEGENDS ---
  {
    title: "Batman: Arkham Asylum - Game of the Year Edition",
    steamAppId: "35140",
    series: "Batman Arkham",
    releaseYear: "2010",
    genres: "Superhero, Stealth, Action, Metroidvania, Classic",
    steamPriceINR: 565,
    hypeTier: "Hot",
  },
  {
    title: "The Elder Scrolls V: Skyrim Special Edition",
    steamAppId: "489830",
    series: "The Elder Scrolls",
    releaseYear: "2016",
    genres: "Open World, RPG, Fantasy, Moddable, Masterpiece",
    steamPriceINR: 1799,
    hypeTier: "Hot",
  },
  {
    title: "Fallout 4: Game of the Year Edition",
    steamAppId: "377160",
    series: "Fallout",
    releaseYear: "2015",
    genres: "Open World, Post-apocalyptic, RPG, Building, Exploration",
    steamPriceINR: 1799,
    hypeTier: "Hot",
  },
  {
    title: "Dark Souls: Remastered",
    steamAppId: "570940",
    series: "Dark Souls",
    releaseYear: "2018",
    genres: "Souls-like, Dark Fantasy, Difficult, Atmospheric, Masterpiece",
    steamPriceINR: 2499,
    hypeTier: "Hot",
  },
  {
    title: "Dark Souls III",
    steamAppId: "374320",
    series: "Dark Souls",
    releaseYear: "2016",
    genres: "Souls-like, Dark Fantasy, Great Soundtrack, Masterpiece, Action RPG",
    steamPriceINR: 2499,
    hypeTier: "Hot",
  },
  {
    title: "Devil May Cry 5",
    steamAppId: "601150",
    series: "Devil May Cry",
    releaseYear: "2019",
    genres: "Spectacle Fighter, Character Action, Fast-Paced, Great Soundtrack",
    steamPriceINR: 1749,
    hypeTier: "Hot",
  },
  {
    title: "Resident Evil 3",
    steamAppId: "952060",
    series: "Resident Evil",
    releaseYear: "2020",
    genres: "Survival Horror, Zombies, Action, Remake, Capcom",
    steamPriceINR: 1999,
    hypeTier: "Popular",
  },
  {
    title: "Resident Evil 7 Biohazard",
    steamAppId: "418370",
    series: "Resident Evil",
    releaseYear: "2017",
    genres: "Survival Horror, First-Person, Horror, Atmospheric, Capcom",
    steamPriceINR: 1499,
    hypeTier: "Hot",
  },
  {
    title: "Half-Life 2",
    steamAppId: "220",
    series: "Half-Life",
    releaseYear: "2004",
    genres: "FPS, Sci-Fi, Story Rich, Masterpiece, Classic",
    steamPriceINR: 480,
    hypeTier: "Hot",
  },
  {
    title: "Portal 2",
    steamAppId: "620",
    series: "Portal",
    releaseYear: "2011",
    genres: "Puzzle, Comedy, Sci-Fi, Masterpiece, Co-op",
    steamPriceINR: 480,
    hypeTier: "Hot",
  },
  {
    title: "DOOM Eternal",
    steamAppId: "782330",
    series: "DOOM",
    releaseYear: "2020",
    genres: "FPS, Fast-Paced, Demons, Great Soundtrack, Gore",
    steamPriceINR: 1799,
    hypeTier: "Hot",
  },
  {
    title: "Mass Effect Legendary Edition",
    steamAppId: "1328670",
    series: "Mass Effect",
    releaseYear: "2021",
    genres: "RPG, Sci-Fi, Space, Story Rich, Masterpiece, Choice Matters",
    steamPriceINR: 2999,
    hypeTier: "Hot",
  },
];

async function main() {
  console.log(`Starting to seed ${fanFavorites.length} fan-favorite blockbusters...`);
  const testedDate = new Date();
  let count = 0;

  for (const g of fanFavorites) {
    const seriesRecord = await prisma.series.upsert({
      where: { name: g.series },
      update: {},
      create: { name: g.series },
    });

    const headerImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.steamAppId}/header.jpg`;
    const capsuleImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.steamAppId}/header.jpg`;

    await prisma.game.upsert({
      where: { title: g.title },
      update: {
        seriesId: seriesRecord.id,
        steamAppId: g.steamAppId,
        releaseDate: g.releaseYear,
        genres: g.genres,
        steamPriceINR: g.steamPriceINR,
        hypeTier: g.hypeTier,
        launcher: g.launcher || "Steam only",
        offlineTag: "Offline OK",
        testedOfflineOn: testedDate,
        headerImage,
        capsuleImage,
      },
      create: {
        title: g.title,
        seriesId: seriesRecord.id,
        steamAppId: g.steamAppId,
        releaseDate: g.releaseYear,
        genres: g.genres,
        steamPriceINR: g.steamPriceINR,
        ourMonthlyPriceINR: 300,
        hypeTier: g.hypeTier,
        launcher: g.launcher || "Steam only",
        offlineTag: "Offline OK",
        suggestedOfflineTag: "Offline OK",
        testedOfflineOn: testedDate,
        purchasableAsSingle: true,
        headerImage,
        capsuleImage,
      },
    });

    count++;
  }

  const totalInDb = await prisma.game.count();
  console.log(`✓ Completed fan-favorite seeding! Processed: ${count}. Total games in DB: ${totalInDb}`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
