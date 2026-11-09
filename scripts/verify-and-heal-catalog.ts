import { PrismaClient } from "@prisma/client";
import { generateManifests } from "./generate-manifests";
import { ensureCustomCapsule } from "./generate-custom-capsules";

const prisma = new PrismaClient();

// Explicit known custom banners for games without active Steam store pages
const customBannerMap: Record<string, string> = {
  "grand theft auto vi": "/images/capsules/gta-6.svg",
  "alan wake 2": "/images/capsules/alan-wake-2.svg",
  "the witcher 4 (polaris)": "/images/capsules/witcher-4.svg",
  "the witcher 4": "/images/capsules/witcher-4.svg",
  "max payne 1 & 2 remake": "/images/capsules/max-payne-remake.svg",
  "control 2": "/images/capsules/control-2.svg",
  "judas": "/images/capsules/judas.svg",
  "ark ii": "/images/capsules/ark-2.svg",
  "mass effect 5": "/images/capsules/mass-effect-5.svg",
  "tomb raider next": "/images/capsules/tomb-raider-next.svg",
  "battlefield 6": "/images/capsules/battlefield-6.svg",
  "elden ring nightreign": "/images/capsules/elden-ring-nightreign.svg",
  "f1 25: 2026 season edition": "/images/capsules/f1-25.svg",
  "f1 25": "/images/capsules/f1-25.svg",
  "phantom blade zero": "/images/capsules/phantom-blade-zero.svg",
  "clockwork revolution": "/images/capsules/clockwork-revolution.svg",
  "light no fire": "/images/capsules/light-no-fire.svg",
  "subnautica 2": "/images/capsules/subnautica-2.svg",
  "project 007": "/images/capsules/project-007.svg",
  "resident evil (1996)": "/images/capsules/resident-evil-1996.svg",
  "resident evil 2 (1998)": "/images/capsules/resident-evil-2-1998.svg",
  "jurassic world evolution 3": "/images/capsules/jurassic-world-evolution-3.svg",
};

// Explicit verified Steam App IDs for known blockbusters
const explicitSteamAppIdMap: Record<string, string> = {
  "borderlands 4": "1285190",
  "robocop: rogue city": "1681430",
  "assassin's creed shadows": "3159330",
  "assassin’s creed shadows": "3159330",
  "two point museum": "2185060",
  "final fantasy vii rebirth": "2909400",
  "death stranding 2: on the beach": "3280350",
  "death stranding 2": "3280350",
  "lies of p: overture": "2848330",
  "jump space": "1757300",
  "mage arena": "3716600",
  "civilization vii": "1295660",
  "dune: awakening": "1172710",
  "frostpunk 2": "1601580",
  "indiana jones and the great circle": "2677660",
  "avatar: frontiers of pandora": "2840770",
  "metal gear solid 2: sons of liberty - master collection": "2131640",
  "forza motorsport": "2440510",
  "grand theft auto v": "271590",
};

async function checkUrl(url: string): Promise<boolean> {
  if (url.startsWith("/")) return true; // Local image
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

async function searchSteamStore(term: string): Promise<string | null> {
  try {
    const cleanTerm = term
      .replace(/\(.*?\)/g, "")
      .replace(/remaster(ed)?/gi, "")
      .replace(/game of the year edition/gi, "")
      .trim();

    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanTerm)}&l=english&cc=US`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    for (const item of data.items) {
      const testUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`;
      const isLive = await checkUrl(testUrl);
      if (isLive) {
        return item.id.toString();
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function healCatalog() {
  console.log("=== STEAMER CATALOG VERIFICATION & SELF-HEALING ENGINE ===");
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      steamAppId: true,
      headerImage: true,
      capsuleImage: true,
    },
  });

  console.log(`Auditing ${games.length} catalog titles for image accuracy and AppID integrity...`);

  // Track occurrences of Steam App IDs to catch collisions
  const appIdUsage: Record<string, string[]> = {};
  for (const g of games) {
    if (!g.steamAppId) continue;
    if (!appIdUsage[g.steamAppId]) appIdUsage[g.steamAppId] = [];
    appIdUsage[g.steamAppId].push(g.title);
  }

  let healedCount = 0;

  for (const g of games) {
    const lowerTitle = g.title.toLowerCase().trim();
    let needsHealing = false;
    let targetAppId = g.steamAppId;
    let targetImage = g.headerImage;

    // 1. Check if game is a known custom banner game
    if (customBannerMap[lowerTitle]) {
      const customUrl = customBannerMap[lowerTitle];
      if (g.headerImage !== customUrl || g.steamAppId === "271590" || (g.steamAppId && appIdUsage[g.steamAppId]?.length > 1)) {
        needsHealing = true;
        targetAppId = `custom-${lowerTitle.replace(/[^a-z0-9]/g, "-")}`;
        targetImage = customUrl;
      }
    } else if (explicitSteamAppIdMap[lowerTitle]) {
      // 2. Check if game has an explicit verified Steam AppID
      const realId = explicitSteamAppIdMap[lowerTitle];
      if (g.steamAppId !== realId) {
        needsHealing = true;
        targetAppId = realId;
        targetImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${realId}/header.jpg`;
      }
    } else {
      // 3. Check for collisions (another completely different game using the same AppID) or 404 image
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normTitle = norm(g.title);
      const isKnownVariant = appIdUsage[g.steamAppId || ""]?.some((t) => {
        const nt = norm(t);
        return nt === normTitle || nt.includes(normTitle) || normTitle.includes(nt);
      });
      const hasCollision = g.steamAppId && (appIdUsage[g.steamAppId]?.length || 0) > 1 && !isKnownVariant;
      const currentUrl = g.headerImage || (g.steamAppId ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.steamAppId}/header.jpg` : "");
      const isLive = currentUrl ? await checkUrl(currentUrl) : false;

      if (!isLive || hasCollision) {
        needsHealing = true;
        const foundId = await searchSteamStore(g.title);
        if (foundId) {
          targetAppId = foundId;
          targetImage = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${foundId}/header.jpg`;
        } else {
          const slug = lowerTitle.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          targetAppId = `custom-${slug}`;
          targetImage = ensureCustomCapsule(g.title, slug);
        }
      }
    }

    // Apply updates if healing is required
    if (needsHealing && targetImage) {
      await prisma.game.update({
        where: { id: g.id },
        data: {
          steamAppId: targetAppId,
          headerImage: targetImage,
          capsuleImage: targetImage,
        },
      });
      console.log(`✓ Healed "${g.title}": AppID -> ${targetAppId}, Image -> ${targetImage}`);
      healedCount++;
    }
  }

  console.log(`Audit complete: ${healedCount} games were successfully healed and corrected.`);

  // Re-sync manifests to match healed database state
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

