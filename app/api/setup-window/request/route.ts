import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.userId,
        status: "ACTIVE",
      },
      include: {
        planGames: { include: { game: true } },
        device: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "You need an active subscription to request a setup window" },
        { status: 403 }
      );
    }

    // Check if user has already completed a setup window or order
    const completedWindow = await prisma.setupWindow.findFirst({
      where: {
        userId: session.userId,
        OR: [{ status: "COMPLETED" }, { offlineConfirmed: true }],
      },
    });

    const completedOrder = await prisma.order.findFirst({
      where: {
        userId: session.userId,
        status: "COMPLETED",
      },
    });

    if (completedWindow || completedOrder) {
      return NextResponse.json(
        {
          error:
            "Your one-time setup session is already completed and permanently secured. To request a fresh activation window (e.g. for a new PC, hardware change, or system format), please use the Renew option or contact Admin on WhatsApp.",
        },
        { status: 403 }
      );
    }

    // Check if user already has an active or queued window
    const existingWindow = await prisma.setupWindow.findFirst({
      where: {
        userId: session.userId,
        status: { in: ["ACTIVE", "QUEUED"] },
      },
    });

    if (existingWindow) {
      return NextResponse.json({
        success: true,
        message: "You already have an active or queued setup window",
        setupWindow: existingWindow,
      });
    }

    // Determine queue position
    const queuedCount = await prisma.setupWindow.count({
      where: { status: "QUEUED" },
    });

    const activeWindow = await prisma.setupWindow.findFirst({
      where: { status: "ACTIVE" },
    });

    const queuePosition = queuedCount + (activeWindow ? 1 : 0) + 1;

    // Create setup window in QUEUED state
    const setupWindow = await prisma.setupWindow.create({
      data: {
        userId: session.userId,
        subscriptionId: subscription.id,
        status: "QUEUED",
        queuePosition,
      },
    });

    // Create an AdminTask for WhatsApp Credential Relay
    const gamesList = subscription.planGames.map((pg) => pg.game.title).join(", ") || "All-Access Pass";
    await prisma.adminTask.create({
      data: {
        type: "CREDENTIAL_RELAY",
        subject: `Setup Window Turn: ${session.email} (Position #${queuePosition})`,
        detailsJson: JSON.stringify({
          setupWindowId: setupWindow.id,
          userId: session.userId,
          email: session.email,
          deviceLabel: subscription.device?.deviceLabel || "Primary PC",
          games: gamesList,
          queuePosition,
          requestedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      setupWindow,
      message: `Setup window requested! You are #${queuePosition} in queue. Admin will message you on WhatsApp when your turn starts.`,
    });
  } catch (error) {
    console.error("Setup window request error:", error);
    return NextResponse.json({ error: "Failed to request setup window" }, { status: 500 });
  }
}

