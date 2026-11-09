import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // 2. Filter/prioritize by requested year
    let yearFiltered: typeof allGames = [];
    if (yearParam === "ALL_TIME") {
      yearFiltered = [...allGames];
    } else {
      yearFiltered = allGames.filter((g) => {
        if (!g.releaseDate) return false;
        return g.releaseDate.includes(yearParam);
      });

      // If we need more to reach 100, add top remaining games
      if (yearFiltered.length < 100) {
        const existingIds = new Set(yearFiltered.map((g) => g.id));
        const remaining = allGames.filter((g) => !existingIds.has(g.id));
        yearFiltered = [...yearFiltered, ...remaining].slice(0, 100);
      }
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

    // Ensure exactly up to 100 games
    const top100 = yearFiltered.slice(0, 100);

    // 4. Split into Steam's exact 4 Tiers:
    // Platinum: 1st - 12th (12 items)
    // Gold: 13th - 24th (12 items)
    // Silver: 25th - 50th (26 items)
    // Bronze: 51st - 100th (50 items)
    const platinum = top100.slice(0, 12);
    const gold = top100.slice(12, 24);
    const silver = top100.slice(24, 50);
    const bronze = top100.slice(50, 100);

    return NextResponse.json(
      {
        year: yearParam,
        category: categoryParam,
        total: top100.length,
        tiers: {
          platinum: {
            title: "PLATINUM",
            subtitle: "1ST - 12TH SORTED RANDOMLY",
            count: platinum.length,
            games: platinum,
          },
          gold: {
            title: "GOLD",
            subtitle: "13TH - 24TH SORTED RANDOMLY",
            count: gold.length,
            games: gold,
          },
          silver: {
            title: "SILVER",
            subtitle: "25TH - 50TH SORTED RANDOMLY",
            count: silver.length,
            games: silver,
          },
          bronze: {
            title: "BRONZE",
            subtitle: "51ST - 100TH SORTED RANDOMLY",
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

