import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// List of games that specifically belong to 2026
const games2026 = [
  "Grand Theft Auto VI",
  "Battlefield 6",
  "Borderlands 4",
  "The Elder Scrolls IV: Oblivion Remastered",
  "Dune: Awakening",
  "Elden Ring Nightreign",
  "Marvel's Wolverine",
  "Death Stranding 2: On the Beach",
  "Max Payne 1 & 2 Remake",
  "Forza Horizon 6",
  "Pragmata",
  "007 First Light",
  "F1 25: 2026 Season Edition",
  "The Witcher 4 (Polaris)",
  "Control 2",
  "Judas",
  "Crimson Desert",
  "Ark II",
  "Mass Effect 5",
  "Tomb Raider Next",
  "Clockwork Revolution",
  "Phantom Blade Zero",
  "Light No Fire",
  "Subnautica 2",
  "Project 007",
];

// List of games that belong to 2025
const games2025 = [
  "Monster Hunter Wilds",
  "Civilization VII",
  "Kingdom Come: Deliverance II",
  "Final Fantasy VII Rebirth",
  "DOOM: The Dark Ages",
  "Assassin's Creed: Shadows",
  "Clair Obscur: Expedition 33",
  "Split Fiction",
  "Stellar Blade",
  "inZOI",
  "Mafia: The Old Country",
  "Metal Gear Solid Delta: Snake Eater",
  "Wuchang: Fallen Feathers",
  "Atelier Yumia",
  "Two Point Museum",
  "Like a Dragon: Pirate Yakuza in Hawaii",
  "Killing Floor 3",
  "Lies of P: Overture",
  "Broken Arrow",
  "Euro Truck Simulator 2 Nordic Horizons",
  "RimWorld Odyssey",
  "Dispatch",
  "Anno 117: Pax Romana",
  "The Last of Us Part II Remastered",
  "Jurassic World Evolution 3",
  "Digimon Story: Time Stranger",
  "Jump Space",
  "Mage Arena",
  "Hollow Knight: Silksong",
  "Arc Raiders",
  "Call of Duty: Black Ops 7",
];

// List of games that belong to 2024
const games2024 = [
  "Black Myth: Wukong",
  "Final Fantasy XVI",
  "Elden Ring: Shadow of the Erdtree",
  "Warhammer 40,000: Space Marine 2",
  "Helldivers 2",
  "Dragon's Dogma 2",
  "Persona 3 Reload",
  "Metaphor: ReFantazio",
  "Tekken 8",
  "Silent Hill 2",
  "S.T.A.L.K.E.R. 2: Heart of Chornobyl",
  "Dragon Age: The Veilguard",
  "Ghost of Tsushima DIRECTOR'S CUT",
  "God of War Ragnarök",
  "Like a Dragon: Infinite Wealth",
  "Indiana Jones and the Great Circle",
  "Red Dead Redemption",
  "Frostpunk 2",
  "Manor Lords",
  "Balatro",
  "Life is Strange: Double Exposure",
  "The Outlast Trials",
  "Prince of Persia: The Lost Crown",
  "Senua's Saga: Hellblade II",
];

// List of games that belong to 2023
const games2023 = [
  "Baldur's Gate 3",
  "Alan Wake 2",
  "Resident Evil 4",
  "Cyberpunk 2077: Phantom Liberty",
  "Hogwarts Legacy",
  "Armored Core VI: Fires of Rubicon",
  "Starfield",
  "Lies of P",
  "Remnant II",
  "Dead Space",
  "Street Fighter 6",
  "Diablo IV",
  "Star Wars Jedi: Survivor",
  "Hi-Fi RUSH",
];

async function updateBatch(titles: string[], year: string) {
  for (const title of titles) {
    try {
      const match = await prisma.game.findFirst({
        where: {
          title: {
            equals: title,
            mode: "insensitive",
          },
        },
      });

      if (match) {
        await prisma.game.update({
          where: { id: match.id },
          data: { releaseDate: year },
        });
        console.log(`Updated "${match.title}" -> releaseDate: ${year}`);
      } else {
        // If it doesn't exist yet, we can create it for 2026
        if (year === "2026") {
          const seriesRecord = await prisma.series.upsert({
            where: { name: "Next-Gen Anticipated" },
            update: {},
            create: { name: "Next-Gen Anticipated" },
          });

          await prisma.game.create({
            data: {
              title,
              seriesId: seriesRecord.id,
              steamAppId: "271590", // placeholder
              releaseDate: "2026",
              genres: "Action, Adventure, Next-Gen",
              steamPriceINR: 4999,
              ourMonthlyPriceINR: 300,
              hypeTier: "Hot",
              launcher: "Steam only",
              offlineTag: "Offline OK",
              testedOfflineOn: new Date(),
              headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
              capsuleImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
              purchasableAsSingle: true,
            },
          });
          console.log(`Created 2026 title: "${title}"`);
        }
      }
    } catch (err) {
      console.error(`Error on ${title}:`, err);
    }
  }
}

async function main() {
  console.log("Setting accurate release years for catalog...");
  await updateBatch(games2026, "2026");
  await updateBatch(games2025, "2025");
  await updateBatch(games2024, "2024");
  await updateBatch(games2023, "2023");
  console.log("Finished updating release years.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

