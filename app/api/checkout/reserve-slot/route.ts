import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in or register before checking out" }, { status: 401 });
    }

    // Check onboarding pause
    const pauseSetting = await prisma.systemSetting.findUnique({
      where: { key: "onboarding_paused" },
    });
    if (pauseSetting?.value === "true") {
      return NextResponse.json(
        { error: "New subscriptions are temporarily paused by management to maintain platform stability. Please check back shortly." },
        { status: 403 }
      );
    }

    // Check capacity
    const maxSetting = await prisma.systemSetting.findUnique({
      where: { key: "max_active_renters" },
    });
    const maxRenters = maxSetting ? parseInt(maxSetting.value, 10) : 8;

    const activeSubs = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    const activeHolds = await prisma.slotReservation.count({
      where: {
        status: "HOLD",
        expiresAt: { gt: new Date() },
        userId: { not: session.userId },
      },
    });

    if (activeSubs + activeHolds >= maxRenters) {
      return NextResponse.json({
        isFull: true,
        message: "All rental slots are currently occupied. You may join the priority waitlist.",
      });
    }

    // Clean up any old expired holds for this user
    await prisma.slotReservation.deleteMany({
      where: {
        userId: session.userId,
        status: "HOLD",
        expiresAt: { lt: new Date() },
      },
    });

    // Create 30-minute slot hold per Addendum 2f
    const holdToken = `HOLD_${crypto.randomBytes(16).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await prisma.slotReservation.create({
      data: {
        userId: session.userId,
        holdToken,
        expiresAt,
        status: "HOLD",
      },
    });

    return NextResponse.json({
      success: true,
      holdToken,
      expiresAt: expiresAt.toISOString(),
      holdMinutes: 30,
    });
  } catch (error) {
    console.error("Slot reservation error:", error);
    return NextResponse.json({ error: "Failed to reserve slot" }, { status: 500 });
  }
}

