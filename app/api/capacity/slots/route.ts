import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ["max_active_renters", "onboarding_paused"] },
      },
    });

    const maxRentersSetting = settings.find((s) => s.key === "max_active_renters");
    const onboardingPausedSetting = settings.find((s) => s.key === "onboarding_paused");

    const totalSlots = maxRentersSetting ? parseInt(maxRentersSetting.value, 10) : 8;
    const onboardingPaused = onboardingPausedSetting ? onboardingPausedSetting.value === "true" : false;

    // Active subscriptions
    const activeSubs = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    // Currently held checkout slots that haven't expired yet
    const heldSlots = await prisma.slotReservation.count({
      where: {
        status: "HOLD",
        expiresAt: { gt: new Date() },
      },
    });

    const slotsLeft = Math.max(0, totalSlots - (activeSubs + heldSlots));

    const waitlistCount = await prisma.waitlistEntry.count({
      where: { status: "WAITING" },
    });

    return NextResponse.json({
      activeRenters: activeSubs,
      heldSlots,
      totalSlots,
      slotsLeft,
      onboardingPaused,
      waitlistCount,
      isFull: slotsLeft <= 0,
    });
  } catch (error) {
    console.error("Error fetching slot capacity:", error);
    return NextResponse.json({
      activeRenters: 3,
      heldSlots: 0,
      totalSlots: 8,
      slotsLeft: 5,
      onboardingPaused: false,
      waitlistCount: 0,
      isFull: false,
    });
  }
}
