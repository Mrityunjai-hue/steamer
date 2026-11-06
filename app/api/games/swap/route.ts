import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { oldGameId, newGameId } = body;

    const sub = await prisma.subscription.findFirst({
      where: { userId: session.userId, status: "ACTIVE" },
      include: { planGames: true },
    });

    if (!sub) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    if (sub.type === "ALL_ACCESS") {
      return NextResponse.json(
        { error: "All-Access plans already have access to the full catalog! No swap needed." },
        { status: 400 }
      );
    }

    if (sub.freeSwapUsed) {
      return NextResponse.json(
        { error: "You have already used your 1 free game swap for this 30-day cycle" },
        { status: 403 }
      );
    }

    const hasOldGame = sub.planGames.some((pg) => pg.gameId === oldGameId);
    if (!hasOldGame) {
      return NextResponse.json({ error: "The selected game to replace is not in your current plan" }, { status: 400 });
    }

    const newGame = await prisma.game.findUnique({
      where: { id: newGameId },
    });

    if (!newGame || !newGame.purchasableAsSingle) {
      return NextResponse.json({ error: "The new game is not available for swapping" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Remove old game
      await tx.planGame.deleteMany({
        where: { subscriptionId: sub.id, gameId: oldGameId },
      });

      // Add new game
      await tx.planGame.create({
        data: {
          subscriptionId: sub.id,
          gameId: newGameId,
        },
      });

      // Mark free swap used
      await tx.subscription.update({
        where: { id: sub.id },
        data: { freeSwapUsed: true },
      });

      // Create Admin Task noting game swap
      await tx.adminTask.create({
        data: {
          type: "CREDENTIAL_RELAY",
          subject: `Game Swapped by ${session.email}: Swapped into ${newGame.title}`,
          detailsJson: JSON.stringify({
            userId: session.userId,
            oldGameId,
            newGameId,
            newGameTitle: newGame.title,
            swappedAt: new Date().toISOString(),
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully swapped into ${newGame.title}! You can install it in your next setup window.`,
    });
  } catch (error) {
    console.error("Game swap error:", error);
    return NextResponse.json({ error: "Failed to perform game swap" }, { status: 500 });
  }
}

