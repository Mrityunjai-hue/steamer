import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache for blazing fast performance

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
        { hypeTier: "asc" }, // Hot first
        { steamPriceINR: "desc" },
      ],
    });

    // 2. Filter strictly by requested year (NEVER fill with mismatched old years)
    let yearFiltered: typeof allGames = [];
    if (yearParam === "ALL_TIME") {
      yearFiltered = [...allGames];
    } else {
      yearFiltered = allGames.filter((g) => {
        if (!g.releaseDate) return false;
        return g.releaseDate.includes(yearParam);
      });
    }

    // 3. Category adjustments / sorting
    if (categoryParam === "NEW_RELEASES") {
      yearFiltered.sort((a, b) => {
        const yA = parseInt(a.releaseDate || "2020", 10) || 2020;
        const yB = parseInt(b.releaseDate || "2020", 10) || 2020;
        return yB - yA;
      });
    } else if (categoryParam === "MOST_PLAYED") {
      yearFiltered.sort((a, b) => (b.steamPriceINR || 0) - (a.steamPriceINR || 0));
    }

    // Up to 100 top titles for this year
    const curatedGames = yearFiltered.slice(0, 100);
    const totalCount = curatedGames.length;

    // 4. Split proportionally into Steam's exact 4 Tiers:
    // When totalCount >= 100: Platinum: 12, Gold: 12, Silver: 26, Bronze: 50
    // When totalCount < 100: allocate proportionally so all titles are genuinely from this year
    let pCount = Math.min(12, Math.max(1, Math.round(totalCount * 0.2)));
    let gCount = Math.min(12, Math.max(1, Math.round(totalCount * 0.25)));
    let sCount = Math.min(26, Math.max(1, Math.round(totalCount * 0.28)));
    
    if (totalCount >= 100) {
      pCount = 12;
      gCount = 12;
      sCount = 26;
    }

    const platinum = curatedGames.slice(0, pCount);
    const gold = curatedGames.slice(pCount, pCount + gCount);
    const silver = curatedGames.slice(pCount + gCount, pCount + gCount + sCount);
    const bronze = curatedGames.slice(pCount + gCount + sCount);

    const pEnd = platinum.length;
    const gStart = pEnd + 1;
    const gEnd = pEnd + gold.length;
    const sStart = gEnd + 1;
    const sEnd = gEnd + silver.length;
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
            count: platinum.length,
            games: platinum,
          },
          gold: {
            title: "GOLD",
            subtitle: `${gStart}TH - ${gEnd}TH SORTED RANDOMLY`,
            count: gold.length,
            games: gold,
          },
          silver: {
            title: "SILVER",
            subtitle: `${sStart}TH - ${sEnd}TH SORTED RANDOMLY`,
            count: silver.length,
            games: silver,
          },
          bronze: {
            title: "BRONZE",
            subtitle: `${bStart}TH - ${bEnd}TH SORTED RANDOMLY`,
            count: bronze.length,
            games: bronze,
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

