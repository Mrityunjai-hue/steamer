import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const tier = searchParams.get("tier") || "";
    const launcher = searchParams.get("launcher") || "";
    const offlineTag = searchParams.get("offlineTag") || "";
    const series = searchParams.get("series") || "";
    const includeOnlineOnly = searchParams.get("includeOnlineOnly") === "true";
    const sort = searchParams.get("sort") || "hype";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(60, Math.max(6, parseInt(searchParams.get("limit") || "24", 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { series: { name: { contains: search } } },
      ];
    }

    if (tier) {
      where.hypeTier = tier;
    }

    if (launcher) {
      where.launcher = launcher;
    }

    if (offlineTag) {
      where.offlineTag = offlineTag;
    }

    if (series) {
      where.series = { name: series };
    }

    // By default, hide online required games per section 5.1 unless requested
    if (!includeOnlineOnly) {
      where.offlineTag = { not: "Online required" };
    }

    // Sorting logic
    let orderBy: any = {};
    if (sort === "price_asc") {
      orderBy = { ourMonthlyPriceINR: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { ourMonthlyPriceINR: "desc" };
    } else if (sort === "title_asc") {
      orderBy = { title: "asc" };
    } else if (sort === "title_desc") {
      orderBy = { title: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else {
      // Default: Hype / Popularity order
      orderBy = [{ ourMonthlyPriceINR: "desc" }, { title: "asc" }];
    }

    const [games, total, allSeries] = await Promise.all([
      prisma.game.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { series: true },
      }),
      prisma.game.count({ where }),
      prisma.series.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    return NextResponse.json({
      games: games.map((g) => ({
        id: g.id,
        title: g.title,
        series: g.series?.name || null,
        hypeTier: g.hypeTier,
        ourMonthlyPriceINR: g.ourMonthlyPriceINR,
        steamPriceINR: g.steamPriceINR,
        offlineTag: g.offlineTag,
        testedOfflineOn: g.testedOfflineOn,
        launcher: g.launcher,
        headerImage: g.headerImage,
        purchasableAsSingle: g.purchasableAsSingle,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      seriesList: allSeries.map((s) => s.name),
    });
  } catch (error: any) {
    console.error("Error in catalog API:", error);
    return NextResponse.json({
      error: "Failed to load catalog",
      details: error?.message || String(error),
    }, { status: 500 });
  }
}
