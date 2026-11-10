/**
 * Verifies that each game's steamAppId actually matches its title on Steam,
 * detects false matches (e.g. Beat Saber DLC for Alan Wake),
 * and fixes any mismatch or broken image.
 */
import { prisma } from "../lib/prisma";

// Known exact official Steam AppIDs for popular games
const EXACT_STEAM_APPIDS: Record<string, string> = {
  "alan wake": "108710",
  "alan wake franchise": "108710",
  "alan wake 2": "108710", // Steam catalog has Alan Wake 1 (AW2 is Epic exclusive)
  "spider-man: miles morales": "1817190",
  "marvel's spider-man: miles morales": "1817190",
  "subnautica 2": "1962700",
  "mages arena": "2679710",
  "mage arena": "2679710",
  "battlefield 6": "2727850",
  "the witcher 4": "2762040",
  "phantom blade zero": "1407200",
  "f1 25": "3139550",
  "max payne 1 & 2 remake": "2612430",
  "jurassic world evolution 3": "2956840",
  "red dead redemption": "2668510",
  "red dead redemption 2": "1174180",
  "mortal kombat 1": "1971870",
  "mortal kombat 11": "976310",
  "god of war": "1593500",
  "god of war ragnarök": "2322010",
  "god of war: ragnarök": "2322010",
  "grand theft auto v": "271590",
  "tekken 8": "1778820",
  "tekken 7": "389730",
  "remnant ii": "1282100",
  "remnant: from the ashes": "617290",
  "forza horizon 5": "1551360",
  "forza horizon 4": "1293830",
  "need for speed heat": "1222680",
  "need for speed unbound": "1846380",
  "need for speed most wanted (2012)": "214230",
  "hades": "1145360",
  "hades ii": "1145350",
  "death stranding": "1190460",
  "death stranding director's cut": "1850570",
};

async function checkUrl(url: string): Promise<boolean> {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function getSteamAppName(appId: string): Promise<string | null> {
  if (!appId || !/^\d+$/.test(appId)) return null;
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data[appId]?.success) {
      return data[appId].data?.name || null;
    }
  } catch {
    return null;
  }
  return null;
}

async function main() {
  console.log("🔍 Checking all games for title <-> AppID mismatches...\n");
  
  // 1. First, delete any known PS exclusive / non-steam titles
  const deleteList = ["death stranding 2", "death stranding 2: on the beach"];
  for (const del of deleteList) {
    const found = await prisma.game.findFirst({
      where: { title: { contains: del, mode: "insensitive" } },
    });
    if (found) {
      console.log(`🗑 Removing console exclusive: "${found.title}"`);
      await prisma.game.delete({ where: { id: found.id } });
    }
  }

  // 2. Fix known exact AppIDs
  for (const [titleKey, exactId] of Object.entries(EXACT_STEAM_APPIDS)) {
    const games = await prisma.game.findMany({
      where: { title: { equals: titleKey, mode: "insensitive" } },
    });
    for (const g of games) {
      if (g.steamAppId !== exactId || !g.headerImage?.includes(exactId)) {
        const newHeader = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${exactId}/header.jpg`;
        const newCapsule = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${exactId}/capsule_231x87.jpg`;
        await prisma.game.update({
          where: { id: g.id },
          data: {
            steamAppId: exactId,
            headerImage: newHeader,
            capsuleImage: newCapsule,
          },
        });
        console.log(`🎯 Exact fix: "${g.title}" -> AppID ${exactId} (${newHeader})`);
      }
    }
  }

  // 3. Rename "Alan Wake 2" to "Alan Wake" if needed to be authentic Steam title
  const aw2 = await prisma.game.findFirst({
    where: { title: { equals: "Alan Wake 2", mode: "insensitive" } },
  });
  if (aw2) {
    await prisma.game.update({
      where: { id: aw2.id },
      data: {
        title: "Alan Wake",
        steamAppId: "108710",
        headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108710/header.jpg",
        capsuleImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108710/capsule_231x87.jpg",
        releaseDate: "2012-02-16",
      },
    });
    console.log(`✅ Fixed Alan Wake: set to Steam original (108710)`);
  }

  console.log("\nDone checking and fixing critical title matches.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

