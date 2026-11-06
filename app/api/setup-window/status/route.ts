import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupWindow = await prisma.setupWindow.findFirst({
      where: {
        userId: session.userId,
        status: { in: ["ACTIVE", "QUEUED"] },
      },
      include: {
        subscription: {
          include: {
            planGames: { include: { game: true } },
            device: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!setupWindow) {
      return NextResponse.json({ setupWindow: null });
    }

    // Check if active window has expired
    let isExpired = false;
    let minutesLeft = 0;

    if (setupWindow.status === "ACTIVE" && setupWindow.expiresAt) {
      const now = new Date().getTime();
      const expiry = new Date(setupWindow.expiresAt).getTime();
      if (now >= expiry) {
        isExpired = true;
      } else {
        minutesLeft = Math.max(0, Math.round((expiry - now) / 60000));
      }
    }

    return NextResponse.json({
      setupWindow: {
        id: setupWindow.id,
        status: setupWindow.status,
        queuePosition: setupWindow.queuePosition,
        startedAt: setupWindow.startedAt,
        expiresAt: setupWindow.expiresAt,
        minutesLeft,
        isExpired,
        offlineConfirmed: setupWindow.offlineConfirmed,
        deviceLabel: setupWindow.subscription.device?.deviceLabel || "Primary PC",
        games: setupWindow.subscription.planGames.map((pg) => ({
          title: pg.game.title,
          launcher: pg.game.launcher,
          offlineTag: pg.game.offlineTag,
        })),
      },
    });
  } catch (error) {
    console.error("Setup window status error:", error);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

