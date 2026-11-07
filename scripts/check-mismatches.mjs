import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, title: true, steamAppId: true, headerImage: true }
  });

  console.log(`Checking ${games.length} games for title & artwork mismatches...`);
  const mismatches = [];
  const invalidAppIds = [];

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    if (!game.steamAppId) {
      invalidAppIds.push({ title: game.title, reason: "No steamAppId" });
      continue;
    }

    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.steamAppId}&filters=basic`);
      const data = await res.json();
      const appData = data[game.steamAppId];

      if (!appData || !appData.success || !appData.data) {
        invalidAppIds.push({ title: game.title, steamAppId: game.steamAppId, reason: "AppId not found / delisted" });
        continue;
      }

      const steamName = appData.data.name;
      const cleanOur = game.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSteam = steamName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if one contains the key parts of the other
      const isMatch = cleanOur.includes(cleanSteam) || cleanSteam.includes(cleanOur) ||
        (cleanOur.startsWith(cleanSteam.slice(0, 10)) && cleanSteam.length > 5);

      if (!isMatch) {
        mismatches.push({
          id: game.id,
          title: game.title,
          steamAppId: game.steamAppId,
          actualSteamName: steamName,
          headerImage: game.headerImage
        });
      }
    } catch (err) {
      console.error(`Error checking ${game.title} (${game.steamAppId}):`, err.message);
    }

    // Gentle 100ms throttle
    await new Promise(r => setTimeout(r, 80));
    if ((i + 1) % 25 === 0) {
      console.log(`Processed ${i + 1}/${games.length}... (Found ${mismatches.length} mismatches, ${invalidAppIds.length} invalid)`);
    }
  }

  console.log(`\n--- RESULTS ---`);
  console.log(`Total mismatches found: ${mismatches.length}`);
  console.log(`Total invalid / delisted appIds: ${invalidAppIds.length}`);

  fs.writeFileSync('scripts/mismatch_report.json', JSON.stringify({ mismatches, invalidAppIds }, null, 2));
  console.log('Saved report to scripts/mismatch_report.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());

