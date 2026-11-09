import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== CURATING OFFICIAL GAME OF THE YEAR (GOTY) TITLES ===");

  // 1. Remove duplicate entries to guarantee clean catalog integrity
  console.log("Cleaning up duplicate records...");
  
  // Clean up duplicate Elden Ring Nightreign (keep 2778580 in 2025)
  await prisma.game.deleteMany({
    where: {
      OR: [
        { steamAppId: "custom-elden-ring-nightreign" },
        { title: "Elden Ring Nightreign", steamAppId: { not: "2778580" } },
      ],
    },
  });

  // Clean up duplicate Assassin's Creed: Shadows (keep 'Assassin's Creed Shadows')
  const acDup = await prisma.game.findFirst({
    where: { title: "Assassin's Creed: Shadows" },
  });
  if (acDup) {
    await prisma.game.delete({ where: { id: acDup.id } });
  }

  // Clean up duplicate Resident Evil 7 Biohazard (keep 'Resident Evil 7: Biohazard')
  const re7Dup = await prisma.game.findFirst({
    where: { title: "Resident Evil 7 Biohazard" },
  });
  if (re7Dup) {
    await prisma.game.delete({ where: { id: re7Dup.id } });
  }

  // Clean up duplicate DOOM Eternal (keep 'Doom Eternal')
  const doomDup = await prisma.game.findFirst({
    where: { title: "DOOM Eternal" },
  });
  if (doomDup) {
    await prisma.game.delete({ where: { id: doomDup.id } });
  }

  // 2. Add missing GOTY Titans (Elden Ring, Cyberpunk 2077, Resident Evil 9, Elder Scrolls VI)
  console.log("Adding missing GOTY Titans...");

  const existingEldenRing = await prisma.game.findFirst({
    where: { steamAppId: "1245620" },
  });
  if (!existingEldenRing) {
    await prisma.game.create({
      data: {
        title: "Elden Ring",
        steamAppId: "1245620",
        releaseDate: "Feb 25, 2022",
        genres: "Action, RPG, Souls-like, Open World",
        steamPriceINR: 3599,
        ourMonthlyPriceINR: 99,
        hypeTier: "Hot",
        launcher: "Steam only",
        offlineTag: "Offline OK",
        headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
        capsuleImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg",
      },
    });
    console.log("✓ Added Elden Ring (2022 GOTY Winner)");
  }

  const existingCyberpunk = await prisma.game.findFirst({
    where: { steamAppId: "1091500" },
  });
  if (!existingCyberpunk) {
    await prisma.game.create({
      data: {
        title: "Cyberpunk 2077",
        steamAppId: "1091500",
        releaseDate: "Dec 10, 2020",
        genres: "RPG, Open World, Cyberpunk, Sci-Fi",
        steamPriceINR: 2999,
        ourMonthlyPriceINR: 99,
        hypeTier: "Hot",
        launcher: "Steam only",
        offlineTag: "Offline OK",
        headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
        capsuleImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg",
      },
    });
    console.log("✓ Added Cyberpunk 2077");
  }

  const existingRE9 = await prisma.game.findFirst({
    where: { title: "Resident Evil 9" },
  });
  if (!existingRE9) {
    await prisma.game.create({
      data: {
        title: "Resident Evil 9",
        steamAppId: "custom-resident-evil-9",
        releaseDate: "2026",
        genres: "Survival Horror, Action, Atmospheric",
        steamPriceINR: 4999,
        ourMonthlyPriceINR: 300,
        hypeTier: "Hot",
        launcher: "Steam only",
        offlineTag: "Offline OK",
        headerImage: "/images/capsules/resident-evil-9.svg",
        capsuleImage: "/images/capsules/resident-evil-9.svg",
      },
    });
    console.log("✓ Added Resident Evil 9 (2026)");
  }

  const existingTES6 = await prisma.game.findFirst({
    where: { title: "The Elder Scrolls VI" },
  });
  if (!existingTES6) {
    await prisma.game.create({
      data: {
        title: "The Elder Scrolls VI",
        steamAppId: "custom-the-elder-scrolls-vi",
        releaseDate: "2026",
        genres: "RPG, Open World, Fantasy",
        steamPriceINR: 4999,
        ourMonthlyPriceINR: 300,
        hypeTier: "Hot",
        launcher: "Steam only",
        offlineTag: "Offline OK",
        headerImage: "/images/capsules/the-elder-scrolls-vi.svg",
        capsuleImage: "/images/capsules/the-elder-scrolls-vi.svg",
      },
    });
    console.log("✓ Added The Elder Scrolls VI (2026)");
  }

  // 3. Year-Match corrections:
  // Move 2025 games currently erroneously labeled 2026 to 2025
  const to2025 = [
    { title: "Battlefield 6", year: "2025", tier: "Hot" },
    { title: "Borderlands 4", year: "2025", tier: "Hot" },
    { title: "Dune: Awakening", year: "2025", tier: "Hot" },
    { title: "The Elder Scrolls IV: Oblivion Remastered", year: "2025", tier: "Hot" },
    { title: "Elden Ring: Nightreign", year: "2025", tier: "Hot" },
    { title: "Death Stranding 2: On the Beach", year: "2025", tier: "Hot" },
    { title: "F1 25: 2026 Season Edition", newTitle: "F1 25", year: "2025", tier: "Hot" },
    { title: "Arc Raiders", newTitle: "ARC Raiders", year: "2025", tier: "Hot" },
    { title: "Sid Meier's Civilization VII", year: "2025", tier: "Hot" },
    { title: "Hollow Knight: Silksong", year: "2025", tier: "Hot" },
    { title: "Monster Hunter Wilds", year: "2025", tier: "Hot" },
    { title: "Kingdom Come: Deliverance II", year: "2025", tier: "Hot" },
    { title: "Avowed", year: "2025", tier: "Hot" },
    { title: "Assassin's Creed Shadows", year: "2025", tier: "Hot" },
    { title: "Call of Duty: Black Ops 7", year: "2025", tier: "Hot" },
    { title: "DOOM: The Dark Ages", year: "2025", tier: "Hot" },
    { title: "Dispatch", year: "2025", tier: "Hot" },
    { title: "Clair Obscur: Expedition 33", year: "2025", tier: "Hot" },
    { title: "inZOI", year: "2025", tier: "Hot" },
    { title: "Anno 117: Pax Romana", year: "2025", tier: "Hot" },
    { title: "Split Fiction", year: "2025", tier: "Hot" },
    { title: "Stellar Blade", year: "2025", tier: "Hot" },
    { title: "Digimon Story: Time Stranger", year: "2025", tier: "Hot" },
    { title: "Dying Light: The Beast", year: "2025", tier: "Hot" },
    { title: "The Last of Us Part II Remastered", year: "2025", tier: "Hot" },
    { title: "Jurassic World Evolution 3", year: "2025", tier: "Hot" },
    { title: "Mafia: The Old Country", year: "2025", tier: "Hot" },
    { title: "Final Fantasy VII Rebirth", year: "2025", tier: "Hot" },
    { title: "Metal Gear Solid Delta: Snake Eater", year: "2025", tier: "Hot" },
    { title: "Wuchang: Fallen Feathers", year: "2025", tier: "Hot" },
    { title: "Atelier Yumia: The Alchemist of Memories", year: "2025", tier: "Hot" },
    { title: "Two Point Museum", year: "2025", tier: "Hot" },
    { title: "Like a Dragon: Pirate Yakuza in Hawaii", year: "2025", tier: "Hot" },
    { title: "Jump Space", year: "2025", tier: "Hot" },
    { title: "Killing Floor 3", year: "2025", tier: "Hot" },
    { title: "Lies of P: Overture", year: "2025", tier: "Hot" },
    { title: "Mage Arena", year: "2025", tier: "Hot" },
    { title: "Broken Arrow", year: "2025", tier: "Hot" },
    { title: "Euro Truck Simulator 2: Nordic Horizons", year: "2025", tier: "Hot" },
    { title: "RimWorld: Odyssey", year: "2025", tier: "Hot" },
  ];

  for (const item of to2025) {
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { title: item.title },
          { title: { contains: item.title } },
        ],
      },
    });

    if (game) {
      if (item.newTitle && item.newTitle !== game.title) {
        const existingWithNewTitle = await prisma.game.findFirst({
          where: { title: item.newTitle },
        });
        if (existingWithNewTitle) {
          await prisma.game.delete({ where: { id: game.id } });
          await prisma.game.update({
            where: { id: existingWithNewTitle.id },
            data: { releaseDate: item.year, hypeTier: item.tier },
          });
          console.log(`✓ Merged duplicate: "${item.newTitle}" -> ${item.year}`);
          continue;
        }
      }

      await prisma.game.update({
        where: { id: game.id },
        data: {
          title: item.newTitle || game.title,
          releaseDate: item.year,
          hypeTier: item.tier,
        },
      });
      console.log(`✓ Year-matched 2025: "${game.title}" -> ${item.year}`);
    }
  }

  // 4. Ensure true 2026 upcoming titles are strictly set to 2026
  const to2026 = [
    "Grand Theft Auto VI",
    "The Witcher 4 (Polaris)",
    "Max Payne 1 & 2 Remake",
    "Marvel's Wolverine",
    "Control 2",
    "Judas",
    "Ark II",
    "Mass Effect 5",
    "Crimson Desert",
    "Phantom Blade Zero",
    "Tomb Raider Next",
    "Clockwork Revolution",
    "Light No Fire",
    "Subnautica 2",
    "Project 007",
    "Pragmata",
    "Forza Horizon 6",
    "Resident Evil 9",
    "The Elder Scrolls VI",
  ];

  for (const t of to2026) {
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { title: t },
          { title: { contains: t } },
        ],
      },
    });

    if (game) {
      await prisma.game.update({
        where: { id: game.id },
        data: {
          releaseDate: "2026",
          hypeTier: "Hot",
        },
      });
      console.log(`✓ Year-matched 2026: "${game.title}" -> 2026`);
    }
  }

  // 5. Ensure 2024 GOTY heavyweights have clean releaseDate '2024'
  const to2024 = [
    "Black Myth: Wukong",
    "Helldivers 2",
    "Palworld",
    "Warhammer 40,000: Space Marine 2",
    "Dragon's Dogma 2",
    "Final Fantasy XVI",
    "Silent Hill 2",
    "Ghost of Tsushima DIRECTOR'S CUT",
    "God of War Ragnarök",
    "Balatro",
    "Manor Lords",
    "Metaphor: ReFantazio",
    "Tekken 8",
    "Hades II",
    "S.T.A.L.K.E.R. 2: Heart of Chornobyl",
    "Frostpunk 2",
    "Indiana Jones and the Great Circle",
    "Horizon Forbidden West Complete Edition",
    "Persona 3 Reload",
    "Dragon Age: The Veilguard",
    "Sons of the Forest",
    "Enshrouded",
    "V Rising",
    "Senua's Saga: Hellblade II",
    "Star Wars Outlaws",
  ];

  for (const t of to2024) {
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { title: t },
          { title: { contains: t } },
        ],
      },
    });

    if (game) {
      await prisma.game.update({
        where: { id: game.id },
        data: {
          releaseDate: "2024",
          hypeTier: "Hot",
        },
      });
      console.log(`✓ Year-matched 2024: "${game.title}" -> 2024`);
    }
  }

  // 6. Ensure 2023 GOTY heavyweights have clean releaseDate '2023'
  const to2023 = [
    "Baldur's Gate 3",
    "Alan Wake 2",
    "Resident Evil 4 (Remake)",
    "Hogwarts Legacy",
    "The Last of Us Part I",
    "Starfield",
    "Armored Core VI: Fires of Rubicon",
    "Lies of P",
    "Dead Space",
    "Street Fighter 6",
    "Hi-Fi Rush",
    "Ghostrunner 2",
  ];

  for (const t of to2023) {
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { title: t },
          { title: { contains: t } },
        ],
      },
    });

    if (game) {
      await prisma.game.update({
        where: { id: game.id },
        data: {
          releaseDate: "2023",
          hypeTier: "Hot",
        },
      });
      console.log(`✓ Year-matched 2023: "${game.title}" -> 2023`);
    }
  }

  console.log("=== GOTY CURATION COMPLETED SUCCESSFULLY ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
