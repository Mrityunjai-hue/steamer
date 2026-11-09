import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
// shortcut: revalidate ignored when force-dynamic is set, explicit for clarity

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Authoritative Steam Game of the Year Tier Definitions
const GOTY_TIERS: Record<
  string,
  {
    platinum: string[];
    gold: string[];
    silver: string[];
    bronze?: string[];
  }
> = {
  "2026": {
    // Only confirmed Steam PC titles with Steam pages for 2026
    platinum: [
      "the witcher 4 (polaris)",
      "the witcher 4",
      "crimson desert",
    ],
    gold: [
      "phantom blade zero",
      "subnautica 2",
      "death stranding 2: on the beach",
      "max payne 1 & 2 remake",
    ],
    silver: [],
  },
  "2025": {
    platinum: [
      "battlefield 6",
      "borderlands 4",
      "arc raiders",
      "civilization vii",
      "sid meier's civilization vii",
      "hollow knight: silksong",
      "dune: awakening",
      "elden ring: nightreign",
      "elden ring nightreign",
      "the elder scrolls iv: oblivion remastered",
      "monster hunter wilds",
      "kingdom come: deliverance ii",
      "avowed",
    ],
    gold: [
      "assassin's creed shadows",
      "assassin's creed: shadows",
      "call of duty: black ops 7",
      "doom: the dark ages",
      "dispatch",
      "clair obscur: expedition 33",
      "inzoi",
      "anno 117: pax romana",
      "split fiction",
      "stellar blade",
      "digimon story: time stranger",
      "dying light: the beast",
      "gothic 1 remake",
    ],
    silver: [
      "jurassic world evolution 3",
      "mafia: the old country",
      "final fantasy vii rebirth",
      "metal gear solid delta: snake eater",
      "wuchang: fallen feathers",
      "death stranding 2: on the beach",
      "lost soul aside",
      "darwin's paradox",
      "phantom blade zero",
      "subnautica 2",
      "max payne 1 & 2 remake",
    ],
    bronze: [
      "atelier yumia",
      "two point museum",
      "like a dragon: pirate yakuza in hawaii",
      "jump space",
      "killing floor 3",
      "lies of p: overture",
      "mage arena",
      "f1 25",
      "broken arrow",
      "euro truck simulator 2: nordic horizons",
      "rimworld: odyssey",
      "super robot wars y",
      "solo leveling: arise overdrive",
    ],
  },
  "2024": {
    platinum: [
      "black myth: wukong",
      "helldivers 2",
      "palworld",
      "warhammer 40,000: space marine 2",
      "ghost of tsushima director's cut",
      "god of war ragnarok",
      "dragon's dogma 2",
      "balatro",
      "manor lords",
      "final fantasy xvi",
      "silent hill 2",
      "metaphor: refantazio",
    ],
    gold: [
      "tekken 8",
      "hades ii",
      "s.t.a.l.k.e.r. 2: heart of chornobyl",
      "frostpunk 2",
      "persona 3 reload",
      "horizon forbidden west complete edition",
      "indiana jones and the great circle",
      "dragon age: the veilguard",
      "sons of the forest",
      "enshrouded",
      "v rising",
      "senua's saga: hellblade ii",
    ],
    silver: [
      "star wars outlaws",
      "avatar: frontiers of pandora",
      "prince of persia: the lost crown",
      "the outlast trials",
      "dragon ball: sparking! zero",
      "dead island 2",
      "pacific drive",
      "the crew motorfest",
      "horizon zero dawn remastered",
      "life is strange: double exposure",
      "shin chan: shiro and the coal town",
      "tomb raider i remastered",
      "tomb raider ii remastered",
      "tomb raider iii remastered",
      "until dawn",
      "wwe 2k24",
      "europa",
      "7 days to die",
      "red dead redemption",
    ],
  },
  "2023": {
    platinum: [
      "baldur's gate 3",
      "alan wake 2",
      "resident evil 4 (remake)",
      "resident evil 4",
      "hogwarts legacy",
      "the last of us part i",
      "starfield",
      "armored core vi: fires of rubicon",
      "lies of p",
      "dead space",
      "street fighter 6",
      "hi-fi rush",
      "ghostrunner 2",
    ],
    gold: [
      "diablo iv",
      "star wars jedi: survivor",
      "remnant ii",
      "robocop: rogue city",
      "lords of the fallen",
      "forza motorsport",
      "payday 3",
      "cities: skylines ii",
      "system shock",
      "total war: pharaoh",
      "jagged alliance 3",
      "granny remake",
    ],
    silver: [
      "far cry 6",
      "five nights at freddy's: help wanted 2",
      "grand theft auto iii - the definitive edition",
      "grand theft auto: san andreas - the definitive edition",
      "grand theft auto: vice city - the definitive edition",
      "metal gear solid - master collection version",
      "metal gear solid 2: sons of liberty - master collection",
      "metal gear solid 3: snake eater - master collection",
    ],
  },
  "ALL_TIME": {
    platinum: [
      "grand theft auto v",
      "red dead redemption 2",
      "the witcher 3: wild hunt",
      "elden ring",
      "baldur's gate 3",
      "god of war",
      "cyberpunk 2077",
      "black myth: wukong",
      "sekiro: shadows die twice",
      "the elder scrolls v: skyrim",
      "batman: arkham city",
      "half-life 2",
    ],
    gold: [
      "batman: arkham knight",
      "doom eternal",
      "control ultimate edition",
      "hollow knight: silksong",
      "days gone",
      "forza horizon 5",
      "subnautica",
      "dying light",
      "resident evil 2 (remake)",
      "marvel's spider-man remastered",
      "portal 2",
      "metro exodus",
    ],
    silver: [
      "outlast",
      "outlast 2",
      "sleeping dogs",
      "tekken 7",
      "tekken 8",
      "mortal kombat 11",
      "rise of the tomb raider",
      "shadow of the tomb raider",
      "hitman 3",
      "far cry 3",
      "far cry 4",
      "far cry 5",
    ],
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year") || "2025";
    const categoryParam = searchParams.get("category") || "TOP_SELLERS";

    // 1. Fetch games from DB
    const allGames = await prisma.game.findMany({
      select: {
        id: true,
        title: true,
        steamAppId: true,
        steamPriceINR: true,
        ourMonthlyPriceINR: true,
        releaseDate: true,
        genres: true,
        headerImage: true,
        capsuleImage: true,
        hypeTier: true,
        launcher: true,
        offlineTag: true,
      },
      orderBy: [
        { hypeTier: "asc" },
        { steamPriceINR: "desc" },
      ],
    });

    // 2. Filter strictly by requested year
    let yearFiltered: typeof allGames = [];
    if (yearParam === "ALL_TIME") {
      yearFiltered = [...allGames];
    } else {
      yearFiltered = allGames.filter((g) => {
        if (!g.releaseDate) return false;
        return g.releaseDate.includes(yearParam);
      });
    }

    const curConfig = GOTY_TIERS[yearParam];

    let platinumGames: typeof allGames = [];
    let goldGames: typeof allGames = [];
    let silverGames: typeof allGames = [];
    let bronzeGames: typeof allGames = [];

    if (curConfig && categoryParam === "TOP_SELLERS") {
      // Use official Steam GOTY tier ranking
      const pNorms = curConfig.platinum.map(norm);
      const gNorms = curConfig.gold.map(norm);
      const sNorms = curConfig.silver.map(norm);
      const bNorms = (curConfig.bronze || []).map(norm);

      const placedIds = new Set<string>();

      const findMatch = (name: string) => {
        // 1. Exact normalized match first
        const exact = yearFiltered.find((g) => !placedIds.has(g.id) && norm(g.title) === name);
        if (exact) return exact;

        // 2. Substring match fallback
        return yearFiltered.find(
          (g) => !placedIds.has(g.id) && (norm(g.title).includes(name) || name.includes(norm(g.title)))
        );
      };

      // Populate Platinum strictly
      for (const pName of pNorms) {
        const match = findMatch(pName);
        if (match) {
          platinumGames.push(match);
          placedIds.add(match.id);
        }
      }

      // Populate Gold
      for (const gName of gNorms) {
        const match = findMatch(gName);
        if (match) {
          goldGames.push(match);
          placedIds.add(match.id);
        }
      }

      // Populate Silver
      for (const sName of sNorms) {
        const match = findMatch(sName);
        if (match) {
          silverGames.push(match);
          placedIds.add(match.id);
        }
      }

      // Populate Bronze
      for (const bName of bNorms) {
        const match = findMatch(bName);
        if (match) {
          bronzeGames.push(match);
          placedIds.add(match.id);
        }
      }

      // Remaining unplaced titles distributed into Silver and Bronze
      const remaining = yearFiltered.filter((g) => !placedIds.has(g.id));
      for (const r of remaining) {
        if (silverGames.length < 26) {
          silverGames.push(r);
        } else {
          bronzeGames.push(r);
        }
      }
    } else {
      // Fallback or specific sorting filters (e.g. NEW_RELEASES, MOST_PLAYED)
      if (categoryParam === "NEW_RELEASES") {
        yearFiltered.sort((a, b) => {
          const yA = parseInt(a.releaseDate || "2020", 10) || 2020;
          const yB = parseInt(b.releaseDate || "2020", 10) || 2020;
          return yB - yA;
        });
      } else if (categoryParam === "MOST_PLAYED") {
        yearFiltered.sort((a, b) => (b.steamPriceINR || 0) - (a.steamPriceINR || 0));
      }

      const total = yearFiltered.length;
      let pCount = Math.min(12, Math.max(1, Math.round(total * 0.2)));
      let gCount = Math.min(12, Math.max(1, Math.round(total * 0.25)));
      let sCount = Math.min(26, Math.max(1, Math.round(total * 0.28)));
      if (total >= 100) {
        pCount = 12;
        gCount = 12;
        sCount = 26;
      }

      platinumGames = yearFiltered.slice(0, pCount);
      goldGames = yearFiltered.slice(pCount, pCount + gCount);
      silverGames = yearFiltered.slice(pCount + gCount, pCount + gCount + sCount);
      bronzeGames = yearFiltered.slice(pCount + gCount + sCount);
    }

    const totalCount = platinumGames.length + goldGames.length + silverGames.length + bronzeGames.length;
    const pEnd = platinumGames.length;
    const gStart = pEnd + 1;
    const gEnd = pEnd + goldGames.length;
    const sStart = gEnd + 1;
    const sEnd = gEnd + silverGames.length;
    const bStart = sEnd + 1;
    const bEnd = totalCount;

    return NextResponse.json(
      {
        year: yearParam,
        category: categoryParam,
        total: totalCount,
        tiers: {
          platinum: {
            title: "PLATINUM",
            subtitle: `1ST - ${pEnd}TH SORTED RANDOMLY`,
            count: platinumGames.length,
            games: platinumGames,
          },
          gold: {
            title: "GOLD",
            subtitle: `${gStart}TH - ${gEnd}TH SORTED RANDOMLY`,
            count: goldGames.length,
            games: goldGames,
          },
          silver: {
            title: "SILVER",
            subtitle: `${sStart}TH - ${sEnd}TH SORTED RANDOMLY`,
            count: silverGames.length,
            games: silverGames,
          },
          bronze: {
            title: "BRONZE",
            subtitle: `${bStart}TH - ${bEnd}TH SORTED RANDOMLY`,
            count: bronzeGames.length,
            games: bronzeGames,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Best of year catalog error:", error);
    return NextResponse.json({ error: "Failed to load Best of Year data" }, { status: 500 });
  }
}
