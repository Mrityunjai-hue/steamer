import { PrismaClient } from "@prisma/client";
import { generateManifests } from "./generate-manifests";

const prisma = new PrismaClient();

// Console exclusives or non-existent titles that MUST NOT be in a legitimate Steam catalog
const DISALLOWED_TITLES = [
  "grand theft auto vi",
  "marvel's wolverine",
  "the last of us part ii remastered",
  "uncharted: the lost legacy",
  "the elder scrolls vi",
  "control 2",
  "judas",
  "ark ii",
  "mass effect 5",
  "clockwork revolution",
  "light no fire",
  "pragmata",
  "fable",
  "perfect dark",
  "halo: campaign next",
  "007 first light",
  "bioshock 4",
  "star wars eclipse",
  "beyond good and evil 2",
  "half-life 3",
  "fallout: new vegas remastered",
  "forza horizon 6",
  "blade",
  "tomb raider next",
  "resident evil 9",
  "project 007",
  "death stranding 2",
  "death stranding 2: on the beach",
];

// Explicit verified Steam App IDs for known blockbusters
const VERIFIED_STEAM_APPIDS: Record<string, string> = {
  "battlefield 6": "2727850",
  "borderlands 4": "1285190",
  "borderlands 3": "397540",
  "borderlands 2": "49520",
  "subnautica 2": "1962700",
  "subnautica": "264710",
  "alan wake": "108710",
  "alan wake's american nightmare": "202750",
  "max payne 1 & 2 remake": "2612430",
  "max payne 3": "204100",
  "the witcher 4": "2762040",
  "the witcher 3: wild hunt": "292030",
  "phantom blade zero": "1407200",
  "f1 25": "3139550",
  "jurassic world evolution 3": "2956840",
  "mortal kombat 1": "1971870",
  "mortal kombat 11": "976310",
  "mortal kombat x": "307780",
  "god of war": "1593500",
  "god of war (2018)": "1593500",
  "god of war: ragnarök": "2322010",
  "god of war ragnarök": "2322010",
  "grand theft auto v": "271590",
  "red dead redemption": "2668510",
  "red dead redemption 2": "1174180",
  "tekken 8": "1778820",
  "tekken 7": "389730",
  "remnant ii": "1282100",
  "remnant: from the ashes": "617290",
  "forza horizon 5": "1551360",
  "forza horizon 4": "1293830",
  "need for speed heat": "1222680",
  "need for speed unbound": "1846380",
  "need for speed most wanted (2012)": "214230",
  "spider-man: miles morales": "1817190",
  "marvel's spider-man: miles morales": "1817190",
  "marvel’s spider-man: miles morales": "1817190",
  "marvel's spider-man remastered": "1817070",
  "hades": "1145360",
  "hades ii": "1145350",
  "death stranding": "1190460",
  "death stranding director's cut": "1850570",
  "horizon zero dawn complete edition": "1151640",
  "horizon forbidden west complete edition": "2420110",
  "ghost of tsushima director's cut": "2215430",
  "ghost of tsushima": "2215430",
  "cyberpunk 2077": "1091500",
  "elden ring": "1245620",
  "elden ring: nightreign": "2778580",
  "elden ring nightreign": "2778580",
  "baldur's gate 3": "1086940",
  "black myth: wukong": "2358720",
  "sekiro: shadows die twice": "814380",
  "the elder scrolls v: skyrim": "489830",
  "the elder scrolls iv: oblivion remastered": "22330",
  "monster hunter: world": "582010",
  "monster hunter rise": "1446780",
  "monster hunter wilds": "2246340",
  "resident evil 4 (remake)": "2050650",
  "resident evil 4": "2050650",
  "resident evil 2 (remake)": "883710",
  "resident evil 3 remake": "952070",
  "resident evil village": "1196590",
  "resident evil 7: biohazard": "418370",
  "street fighter 6": "1794960",
  "doom eternal": "782330",
  "doom (2016)": "379720",
  "doom: the dark ages": "3017860",
  "civilization vii": "1295660",
  "sid meier's civilization vii": "1295660",
  "dune: awakening": "1172710",
  "arc raiders": "1808500",
  "hollow knight: silksong": "1030300",
  "avowed": "2457220",
  "kingdom come: deliverance ii": "1771300",
  "assassin's creed shadows": "3159330",
  "call of duty: black ops 7": "1938090",
  "clair obscur: expedition 33": "1903340",
  "inzoi": "2456740",
  "stellar blade": "3443310",
  "mafia: the old country": "2987820",
  "final fantasy vii rebirth": "2909400",
  "metal gear solid delta: snake eater": "2417610",
  "wuchang: fallen feathers": "2813640",
  "a way out": "1222700",
  "it takes two": "1426210",
  "mages arena": "2679710",
  "mage arena": "2679710",
};

async function checkUrl(url: string): Promise<boolean> {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function searchSteamStore(title: string): Promise<{ id: string; name: string } | null> {
  try {
    const cleanTerm = title
      .replace(/\(.*?\)/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/remaster(ed)?/gi, "")
      .replace(/definitive edition/gi, "")
      .replace(/director's cut/gi, "")
      .replace(/game of the year edition/gi, "")
      .trim();

    const res = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanTerm)}&l=english&cc=US`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    for (const item of data.items) {
      const live = await checkUrl(
        `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`
      );
      if (live) {
        return { id: item.id.toString(), name: item.name };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function healCatalog() {
  console.log("=== STEAMER AUTOMATED CATALOG HEALING ENGINE ===");

  // 1. Purge console exclusives and speculative titles
  for (const title of DISALLOWED_TITLES) {
    const found = await prisma.game.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    });
    if (found) {
      console.log(`🗑 Removing disallowed / non-Steam title: "${found.title}"`);
      await prisma.game.delete({ where: { id: found.id } });
    }
  }

  // 2. Scan all remaining games
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      steamAppId: true,
      headerImage: true,
      capsuleImage: true,
    },
  });

  console.log(`Auditing ${games.length} catalog titles for 100% verified Steam images...`);
  let healedCount = 0;

  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    const lower = g.title.toLowerCase().trim();
    let needsUpdate = false;
    let targetAppId = g.steamAppId;
    let targetImage = g.headerImage;

    // A. Check verified map first
    if (VERIFIED_STEAM_APPIDS[lower]) {
      const expectedId = VERIFIED_STEAM_APPIDS[lower];
      if (targetAppId !== expectedId || !targetImage?.includes(expectedId)) {
        targetAppId = expectedId;
        targetImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${expectedId}/header.jpg`;
        needsUpdate = true;
      }
    }

    // B. Fix domain typos (shared.akamaized.net -> shared.akamai.steamstatic.com)
    if (targetImage && targetImage.includes("shared.akamaized.net")) {
      targetImage = targetImage.replace("shared.akamaized.net", "shared.akamai.steamstatic.com");
      needsUpdate = true;
    }

    // C. Check if current image is live
    let isLive = targetImage ? await checkUrl(targetImage) : false;

    // D. If not live, try standard Steam CDNs if we have a numeric AppID
    if (!isLive && targetAppId && /^\d+$/.test(targetAppId)) {
      const c1 = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${targetAppId}/header.jpg`;
      const c2 = `https://cdn.cloudflare.steamstatic.com/steam/apps/${targetAppId}/header.jpg`;
      if (await checkUrl(c1)) {
        targetImage = c1;
        isLive = true;
        needsUpdate = true;
      } else if (await checkUrl(c2)) {
        targetImage = c2;
        isLive = true;
        needsUpdate = true;
      }
    }

    // E. If still not live, perform real-time Steam search
    if (!isLive) {
      console.log(`🔍 [${i + 1}/${games.length}] Searching Steam for: "${g.title}"`);
      const searchRes = await searchSteamStore(g.title);
      if (searchRes) {
        targetAppId = searchRes.id;
        targetImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${searchRes.id}/header.jpg`;
        needsUpdate = true;
        console.log(`   -> Found: "${searchRes.name}" (${searchRes.id})`);
      }
    }

    if (needsUpdate && targetImage) {
      const targetCapsule = targetImage.includes("header.jpg")
        ? targetImage.replace("header.jpg", "capsule_231x87.jpg")
        : targetImage;

      await prisma.game.update({
        where: { id: g.id },
        data: {
          steamAppId: targetAppId,
          headerImage: targetImage,
          capsuleImage: targetCapsule,
        },
      });
      console.log(`✓ Healed "${g.title}": AppID ${targetAppId} -> ${targetImage}`);
      healedCount++;
    }
  }

  console.log(`\nAudit complete: ${healedCount} games were successfully healed and corrected.`);

  // 3. Re-sync manifests to match healed database state
  console.log("Re-syncing .acf manifests and .lua scripts in /public/manifests/...");
  await generateManifests();
  console.log("=== HEALING AND MANIFEST SYNC COMPLETE ===");
}

if (require.main === module) {
  healCatalog()
    .catch((err) => {
      console.error("Heal catalog failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
