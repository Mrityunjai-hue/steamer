import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePlanPricing } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameIds = [], isAllAccess = false } = body;

    let games: Array<{ id: string; title: string; hypeTier: string; price: number }> = [];

    if (gameIds.length > 0 && !isAllAccess) {
      const dbGames = await prisma.game.findMany({
        where: { id: { in: gameIds } },
        select: { id: true, title: true, hypeTier: true, ourMonthlyPriceINR: true },
      });

      games = dbGames.map((g) => ({
        id: g.id,
        title: g.title,
        hypeTier: g.hypeTier,
        price: g.ourMonthlyPriceINR,
      }));
    }

    const pricing = calculatePlanPricing(games, isAllAccess);

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.error("Cart calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate pricing" }, { status: 500 });
  }
}

