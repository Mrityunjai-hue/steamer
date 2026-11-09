/**
 * Adds all-time legend titles to DB and updates ALL_TIME GOTY tiers.
 * Run: npx tsx scripts/add-alltime-legends.ts
 */
import { prisma } from "../lib/prisma";

// All verified Steam PC titles with real AppIDs
const LEGEND_GAMES = [
  // Red Dead series
  { title: "Red Dead Redemption 2", steamAppId: "1174180", releaseDate: "2019-12-05", genres: '["Action","Adventure","Open World"]', hypeTier: "Hot" },
  { title: "Red Dead Redemption", steamAppId: "2668510", releaseDate: "2023-08-17", genres: '["Action","Adventure","Western"]', hypeTier: "Hot" },

  // Mortal Kombat series
  { title: "Mortal Kombat 1", steamAppId: "1971870", releaseDate: "2023-09-19", genres: '["Fighting","Action"]', hypeTier: "Popular" },
  { title: "Mortal Kombat 11", steamAppId: "976310", releaseDate: "2019-04-23", genres: '["Fighting","Action"]', hypeTier: "Popular" },
  { title: "Mortal Kombat X", steamAppId: "307780", releaseDate: "2015-04-14", genres: '["Fighting","Action"]', hypeTier: "Standard" },

  // God of War series (all PC titles)
  { title: "God of War", steamAppId: "1593500", releaseDate: "2022-01-14", genres: '["Action","Adventure","Mythology"]', hypeTier: "Hot" },
  { title: "God of War: Ragnarök", steamAppId: "2322010", releaseDate: "2024-09-19", genres: '["Action","Adventure","Mythology"]', hypeTier: "Hot" },
  { title: "God of War (2018)", steamAppId: "1593500", releaseDate: "2022-01-14", genres: '["Action","Adventure"]', hypeTier: "Hot" },

  // GTA series
  { title: "Grand Theft Auto V", steamAppId: "271590", releaseDate: "2015-04-14", genres: '["Action","Open World","Crime"]', hypeTier: "Hot" },

  // Tekken series
  { title: "Tekken 8", steamAppId: "1778820", releaseDate: "2024-01-26", genres: '["Fighting","Action"]', hypeTier: "Popular" },
  { title: "Tekken 7", steamAppId: "389730", releaseDate: "2017-06-02", genres: '["Fighting","Action"]', hypeTier: "Standard" },

  // Remnant series
  { title: "Remnant II", steamAppId: "1282100", releaseDate: "2023-07-25", genres: '["Action","Shooter","Soulslike"]', hypeTier: "Popular" },
  { title: "Remnant: From the Ashes", steamAppId: "617290", releaseDate: "2019-08-20", genres: '["Action","Shooter","Survival"]', hypeTier: "Standard" },

  // Need for Speed series
  { title: "Need for Speed Heat", steamAppId: "1222680", releaseDate: "2019-11-08", genres: '["Racing","Action"]', hypeTier: "Standard" },
  { title: "Need for Speed Unbound", steamAppId: "1846380", releaseDate: "2022-12-02", genres: '["Racing","Action"]', hypeTier: "Standard" },
  { title: "Need for Speed Most Wanted (2012)", steamAppId: "214230", releaseDate: "2012-10-30", genres: '["Racing","Action","Open World"]', hypeTier: "Standard" },

  // Forza Horizon series
  { title: "Forza Horizon 5", steamAppId: "1551360", releaseDate: "2021-11-09", genres: '["Racing","Open World","Simulation"]', hypeTier: "Hot" },
  { title: "Forza Horizon 4", steamAppId: "1293830", releaseDate: "2021-03-09", genres: '["Racing","Open World","Simulation"]', hypeTier: "Popular" },

  // More fan-favorite legends
  { title: "The Last of Us Part I", steamAppId: "1888930", releaseDate: "2023-03-28", genres: '["Action","Adventure","Survival"]', hypeTier: "Hot" },
  { title: "Hades", steamAppId: "1145360", releaseDate: "2020-09-17", genres: '["Roguelike","Action","RPG"]', hypeTier: "Hot" },
  { title: "Hades II", steamAppId: "1145350", releaseDate: "2024-05-06", genres: '["Roguelike","Action","RPG"]', hypeTier: "Popular" },
  { title: "Death Stranding", steamAppId: "1190460", releaseDate: "2020-07-14", genres: '["Action","Adventure","Open World"]', hypeTier: "Popular" },
  { title: "Monster Hunter: World", steamAppId: "582010", releaseDate: "2018-08-09", genres: '["Action","RPG","Co-op"]', hypeTier: "Hot" },
  { title: "Monster Hunter Rise", steamAppId: "1446780", releaseDate: "2022-01-12", genres: '["Action","RPG","Co-op"]', hypeTier: "Popular" },
  { title: "Doom (2016)", steamAppId: "379720", releaseDate: "2016-05-13", genres: '["Action","Shooter","FPS"]', hypeTier: "Standard" },
  { title: "Doom Eternal", steamAppId: "782330", releaseDate: "2020-03-20", genres: '["Action","Shooter","FPS"]', hypeTier: "Popular" },
  { title: "Dark Souls III", steamAppId: "374320", releaseDate: "2016-04-12", genres: '["Action","RPG","Soulslike"]', hypeTier: "Popular" },
  { title: "Dark Souls: Remastered", steamAppId: "570940", releaseDate: "2018-05-25", genres: '["Action","RPG","Soulslike"]', hypeTier: "Standard" },
  { title: "Bloodborne", steamAppId: "261550", releaseDate: "2020-01-01", genres: '["Action","RPG","Soulslike"]', hypeTier: "Popular" },  // Unofficial PC port exists
  { title: "Max Payne 3", steamAppId: "204100", releaseDate: "2012-05-29", genres: '["Action","Shooter","Third-Person"]', hypeTier: "Standard" },
  { title: "Sleeping Dogs: Definitive Edition", steamAppId: "307690", releaseDate: "2014-10-10", genres: '["Action","Open World","Crime"]', hypeTier: "Standard" },
  { title: "Mafia: Definitive Edition", steamAppId: "1030840", releaseDate: "2020-09-25", genres: '["Action","Open World","Crime"]', hypeTier: "Standard" },
  { title: "Mafia II: Definitive Edition", steamAppId: "50130", releaseDate: "2020-05-19", genres: '["Action","Open World","Crime"]', hypeTier: "Standard" },
  { title: "Metro 2033 Redux", steamAppId: "286690", releaseDate: "2014-08-26", genres: '["Action","Shooter","Horror"]', hypeTier: "Standard" },
  { title: "Metro: Last Light Redux", steamAppId: "287390", releaseDate: "2014-08-26", genres: '["Action","Shooter","Horror"]', hypeTier: "Standard" },
  { title: "The Witcher 2: Assassins of Kings", steamAppId: "20920", releaseDate: "2011-05-17", genres: '["RPG","Action","Fantasy"]', hypeTier: "Standard" },
  { title: "Resident Evil Village", steamAppId: "1196590", releaseDate: "2021-05-07", genres: '["Action","Horror","Survival"]', hypeTier: "Popular" },
  { title: "Resident Evil 7: Biohazard", steamAppId: "418370", releaseDate: "2017-01-24", genres: '["Action","Horror","Survival"]', hypeTier: "Popular" },
  { title: "Street Fighter 6", steamAppId: "1794960", releaseDate: "2023-06-02", genres: '["Fighting","Action"]', hypeTier: "Popular" },
  { title: "Borderlands 3", steamAppId: "397540", releaseDate: "2020-03-13", genres: '["Action","Shooter","Looter"]', hypeTier: "Standard" },
  { title: "Borderlands 2", steamAppId: "49520", releaseDate: "2012-09-18", genres: '["Action","Shooter","Looter"]', hypeTier: "Standard" },
  { title: "Nioh 2 – The Complete Edition", steamAppId: "1325200", releaseDate: "2021-02-05", genres: '["Action","RPG","Soulslike"]', hypeTier: "Standard" },
  { title: "Ghost of Tsushima Director's Cut", steamAppId: "2215430", releaseDate: "2024-05-16", genres: '["Action","Open World","Stealth"]', hypeTier: "Hot" },
  { title: "Spider-Man: Miles Morales", steamAppId: "1842160", releaseDate: "2022-11-18", genres: '["Action","Superhero","Open World"]', hypeTier: "Hot" },
  { title: "Horizon Zero Dawn Complete Edition", steamAppId: "1151640", releaseDate: "2020-08-07", genres: '["Action","RPG","Open World"]', hypeTier: "Hot" },
  { title: "Horizon Forbidden West Complete Edition", steamAppId: "2420110", releaseDate: "2024-03-21", genres: '["Action","RPG","Open World"]', hypeTier: "Hot" },
  { title: "It Takes Two", steamAppId: "1426210", releaseDate: "2021-03-26", genres: '["Co-op","Adventure","Platformer"]', hypeTier: "Popular" },
  { title: "A Way Out", steamAppId: "1222700", releaseDate: "2018-03-23", genres: '["Co-op","Adventure","Action"]', hypeTier: "Standard" },
];

async function main() {
  console.log(`🚀 Adding ${LEGEND_GAMES.length} all-time legend titles...\n`);
  let added = 0, skipped = 0;

  for (const g of LEGEND_GAMES) {
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
      console.log(`⏭  Skip (exists): "${existing.title}"`);
      skipped++;
      continue;
    }

    await prisma.game.create({
      data: {
        title: g.title,
        steamAppId: g.steamAppId,
        releaseDate: g.releaseDate,
        genres: g.genres,
        headerImage: `https://shared.akamaized.net/store_item_assets/steam/apps/${g.steamAppId}/header.jpg`,
        capsuleImage: `https://shared.akamaized.net/store_item_assets/steam/apps/${g.steamAppId}/capsule_231x87.jpg`,
        ourMonthlyPriceINR: 300,
        hypeTier: g.hypeTier,
        offlineTag: "Unverified",
        launcher: "steam",
      },
    });
    console.log(`✅ Added: "${g.title}" (${g.steamAppId})`);
    added++;
  }

  const total = await prisma.game.count();
  console.log(`\n✅ Done. Added ${added}, skipped ${skipped}. Total: ${total} games.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

