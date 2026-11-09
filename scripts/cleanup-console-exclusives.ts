/**
 * Removes console-exclusive and speculative (no Steam PC page) games from DB.
 * Run: npx tsx scripts/cleanup-console-exclusives.ts
 */
import { prisma } from "../lib/prisma";

// Games confirmed NOT on Steam PC (PS5-exclusive, Xbox-exclusive, or pure speculation)
const TO_DELETE = [
  "Grand Theft Auto VI",        // PS5 exclusive, no PC announcement
  "Marvel's Wolverine",          // PS5 exclusive, never on PC
  "The Last of Us Part II Remastered", // PS5 exclusive
  "Uncharted: The Lost Legacy",  // PS exclusive
  "The Elder Scrolls VI",        // 10+ years away, speculation
  "Control 2",                   // Not on Steam, no confirmed PC
  "Judas",                       // No confirmed Steam release
  "Ark II",                      // No confirmed Steam release
  "Mass Effect 5",               // No confirmed release at all
  "Clockwork Revolution",        // Xbox/Game Pass exclusive, no Steam page
  "Light No Fire",               // Not released
  "Pragmata",                    // No confirmed Steam date
  "Fable",                       // Xbox exclusive
  "Perfect Dark",                // Xbox exclusive
  "Halo: Campaign Next",         // Xbox exclusive (fictional)
  "007 First Light",             // Unconfirmed Steam
  "Bioshock 4",                  // Not announced
  "Star Wars Eclipse",           // No confirmed release
  "Beyond Good and Evil 2",      // No confirmed release
  "Half-Life 3",                 // Does not exist
  "Fallout: New Vegas Remastered", // Speculation
  "Forza Horizon 6",             // Not announced for Steam
  "Blade",                       // No confirmed PC/Steam
  "Tomb Raider Next",            // Not announced
  "Resident Evil 9",             // Not released/announced for PC yet
  "Project 007",                 // No confirmed Steam release
  "Saros",                       // No confirmed Steam
];

async function main() {
  console.log("🔍 Finding console/speculative games to remove...\n");

  for (const title of TO_DELETE) {
    // Case-insensitive match
    const found = await prisma.game.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
      select: { id: true, title: true, steamAppId: true },
    });

    if (!found) {
      console.log(`⚠️  Not found: "${title}"`);
      continue;
    }

    console.log(`🗑  Deleting: "${found.title}" (${found.steamAppId})`);
    await prisma.game.delete({ where: { id: found.id } });
  }

  // Also clean any remaining custom-* steamAppId games that have no Steam presence
  const customGames = await prisma.game.findMany({
    where: { steamAppId: { startsWith: "custom-" } },
    select: { id: true, title: true, steamAppId: true },
  });

  const KEEP_CUSTOM = [
    // These custom entries are OK (old games with no Steam AppID but legitimate PC titles)
    "resident evil (1996)",
    "resident evil 2 (1998)",
    "batman: arkham origins",
    "bully: scholarship edition",
  ];

  for (const g of customGames) {
    const shouldKeep = KEEP_CUSTOM.some(k => g.title.toLowerCase().includes(k.toLowerCase()));
    if (!shouldKeep) {
      console.log(`🗑  Removing custom-id game: "${g.title}" (${g.steamAppId})`);
      await prisma.game.delete({ where: { id: g.id } });
    } else {
      console.log(`✅ Keeping: "${g.title}" (${g.steamAppId})`);
    }
  }

  const remaining = await prisma.game.count();
  console.log(`\n✅ Done. ${remaining} games remain in DB.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
