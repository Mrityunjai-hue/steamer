import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, title: true, steamAppId: true, headerImage: true },
    orderBy: { title: 'asc' }
  });

  console.log(`Verifying all ${games.length} games on Steam...`);
  const results = [];

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    let steamName = null;
    let success = false;

    if (game.steamAppId) {
      try {
        const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.steamAppId}&filters=basic`);
        const data = await res.json();
        if (data && data[game.steamAppId] && data[game.steamAppId].success && data[game.steamAppId].data) {
          steamName = data[game.steamAppId].data.name;
          success = true;
        }
      } catch (e) {
        // network err
      }
    }

    results.push({
      id: game.id,
      title: game.title,
      steamAppId: game.steamAppId,
      steamName: steamName || "NOT_FOUND_OR_RESTRICTED",
      headerImage: game.headerImage,
      matched: steamName ? steamName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(game.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)) : false
    });

    await new Promise(r => setTimeout(r, 60));
    if ((i + 1) % 50 === 0) console.log(`Processed ${i + 1}/${games.length}...`);
  }

  fs.writeFileSync('scripts/full_verification.json', JSON.stringify(results, null, 2));
  console.log('Done! Saved to scripts/full_verification.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());

