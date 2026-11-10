/**
 * Audits every single game in the database, verifies image availability with HTTP HEAD,
 * fixes broken URLs, replaces legacy/404 CDN links with live Steam CDN URLs,
 * and uses Steam Store API to look up missing AppIDs.
 */
import { prisma } from "../lib/prisma";

async function checkUrl(url: string): Promise<boolean> {
  if (!url) return false;
  if (url.startsWith("/")) return true; // Local static file
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

async function main() {
  console.log("🔍 Scanning all catalog games for broken/missing images...\n");
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      steamAppId: true,
      headerImage: true,
      capsuleImage: true,
    },
  });

  console.log(`Found ${games.length} total games in database.`);
  let fixedCount = 0;
  let brokenList: string[] = [];

  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    let needsUpdate = false;
    let newAppId = g.steamAppId;
    let newHeader = g.headerImage;

    // 1. Fix any domain typo (shared.akamaized.net -> shared.akamai.steamstatic.com)
    if (newHeader && newHeader.includes("shared.akamaized.net")) {
      newHeader = newHeader.replace("shared.akamaized.net", "shared.akamai.steamstatic.com");
      needsUpdate = true;
    }

    // 2. Check if current header image is live
    let isLive = newHeader ? await checkUrl(newHeader) : false;

    // 3. If not live, try standard Steam CDN with numeric appId
    if (!isLive && newAppId && /^\d+$/.test(newAppId)) {
      const candidate1 = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${newAppId}/header.jpg`;
      const candidate2 = `https://cdn.cloudflare.steamstatic.com/steam/apps/${newAppId}/header.jpg`;
      if (await checkUrl(candidate1)) {
        newHeader = candidate1;
        isLive = true;
        needsUpdate = true;
      } else if (await checkUrl(candidate2)) {
        newHeader = candidate2;
        isLive = true;
        needsUpdate = true;
      }
    }

    // 4. If still not live or missing appId, query Steam Store Search
    if (!isLive) {
      console.log(`⚠️ Image broken for "${g.title}" (current AppID: ${g.steamAppId}). Searching Steam...`);
      const searchRes = await searchSteamStore(g.title);
      if (searchRes) {
        newAppId = searchRes.id;
        newHeader = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${searchRes.id}/header.jpg`;
        isLive = true;
        needsUpdate = true;
        console.log(`   -> Found real Steam match: "${searchRes.name}" (${searchRes.id})`);
      } else {
        brokenList.push(`[${g.title}] currentAppId: ${g.steamAppId}, url: ${g.headerImage}`);
      }
    }

    // 5. Update database if any field changed
    if (needsUpdate && newHeader) {
      const newCapsule = newHeader.includes("header.jpg")
        ? newHeader.replace("header.jpg", "capsule_231x87.jpg")
        : newHeader;

      await prisma.game.update({
        where: { id: g.id },
        data: {
          steamAppId: newAppId,
          headerImage: newHeader,
          capsuleImage: newCapsule,
        },
      });
      fixedCount++;
      console.log(`✅ [${i + 1}/${games.length}] Fixed: "${g.title}" -> ${newHeader}`);
    }
  }

  console.log("\n==========================================");
  console.log(`Scan Complete: ${fixedCount} games updated and healed.`);
  if (brokenList.length > 0) {
    console.log(`Still unresolved (${brokenList.length}):`);
    brokenList.forEach((b) => console.log(" - " + b));
  } else {
    console.log("🎉 ALL games now have 100% verified working images!");
  }
  console.log("==========================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

