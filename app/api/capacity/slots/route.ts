import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pauseSetting = await prisma.systemSetting.findUnique({
      where: { key: "onboarding_paused" },
    });
    const onboardingPaused = pauseSetting?.value === "true";

    // Active subscriptions count
    const activeSubs = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    // Unlimited model for Setup Guide (no user cap)
    return NextResponse.json({
      activeRenters: activeSubs,
      heldSlots: 0,
      totalSlots: "Unlimited",
      slotsLeft: 99999,
      onboardingPaused,
      waitlistCount: 0,
      isFull: false,
    });
  } catch (error) {
    console.error("Error fetching slot capacity:", error);
    return NextResponse.json({
      activeRenters: 0,
      heldSlots: 0,
      totalSlots: "Unlimited",
      slotsLeft: 99999,
      onboardingPaused: false,
      waitlistCount: 0,
      isFull: false,
    });
  }
}
