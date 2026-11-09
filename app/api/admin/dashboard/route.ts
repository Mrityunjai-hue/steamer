import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.systemSetting.findMany();
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    const totalSlots = 99999;
    const onboardingPaused = settingsMap["onboarding_paused"] === "true";

    // Active subscriptions count
    const activeSubsCount = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    // Subscriptions expiring within 5 days
    const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: fiveDaysFromNow, gt: new Date() },
      },
      include: {
        user: { select: { email: true, whatsappNumber: true, profile: { select: { displayName: true } } } },
        planGames: { include: { game: { select: { title: true } } } },
      },
    });

    // Active setup window
    const activeWindow = await prisma.setupWindow.findFirst({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { email: true, whatsappNumber: true, profile: { select: { displayName: true } } } },
        subscription: { include: { planGames: { include: { game: { select: { title: true } } } } } },
      },
    });

    // Queued setup windows
    const queuedWindowsCount = await prisma.setupWindow.count({
      where: { status: "QUEUED" },
    });

    // Pending payments
    const pendingPaymentsCount = await prisma.order.count({
      where: { status: "PAYMENT_SUBMITTED" },
    });

    // Pending WhatsApp number verifications
    const pendingVerificationsCount = await prisma.contactVerification.count({
      where: { status: "PENDING" },
    });

    // Revenue calculations: include all verified, active, and completed orders
    const paidStatuses = ["VERIFIED", "ACTIVE", "COMPLETED"];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [monthOrders, allPaidOrders, allSubs] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: { in: paidStatuses },
          createdAt: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
      prisma.order.findMany({
        where: {
          status: { in: paidStatuses },
        },
        select: { amount: true },
      }),
      prisma.subscription.findMany({
        select: { priceINR: true, createdAt: true },
      }),
    ]);

    const orderMonthlyRevenue = monthOrders.reduce((sum, o) => sum + o.amount, 0);
    const subMonthlyRevenue = allSubs
      .filter((s) => new Date(s.createdAt) >= startOfMonth)
      .reduce((sum, s) => sum + s.priceINR, 0);
    const monthlyRevenue = Math.max(orderMonthlyRevenue, subMonthlyRevenue);

    const orderTotalRevenue = allPaidOrders.reduce((sum, o) => sum + o.amount, 0);
    const subTotalRevenue = allSubs.reduce((sum, s) => sum + s.priceINR, 0);
    const totalRevenue = Math.max(orderTotalRevenue, subTotalRevenue);

    // Latest presence alert
    const latestPresence = await prisma.steamPresenceSnapshot.findFirst({
      orderBy: { snapshotTime: "desc" },
    });

    return NextResponse.json({
      capacity: {
        activeRenters: activeSubsCount,
        totalSlots,
        slotsLeft: Math.max(0, totalSlots - activeSubsCount),
        onboardingPaused,
      },
      activeWindow: activeWindow
        ? {
            id: activeWindow.id,
            email: activeWindow.user.email,
            displayName: activeWindow.user.profile?.displayName || "Gamer",
            whatsapp: activeWindow.user.whatsappNumber,
            startedAt: activeWindow.startedAt,
            expiresAt: activeWindow.expiresAt,
            offlineConfirmed: activeWindow.offlineConfirmed,
            games: activeWindow.subscription.planGames.map((pg) => pg.game.title),
          }
        : null,
      queueCount: queuedWindowsCount,
      pendingPaymentsCount,
      pendingVerificationsCount,
      monthlyRevenue,
      totalRevenue,
      expiringSoon: expiringSoon.map((sub) => ({
        id: sub.id,
        email: sub.user.email,
        displayName: sub.user.profile?.displayName || "Gamer",
        whatsapp: sub.user.whatsappNumber,
        endDate: sub.endDate,
        daysLeft: Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        games: sub.planGames.map((pg) => pg.game.title),
      })),
      presenceAlert: latestPresence?.outsideWindowAlert ? latestPresence : null,
      settings: settingsMap,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, onboardingPaused, warningSignTriggered } = body;

    // Warning sign trigger auto-enables onboarding paused per Section 3.2
    if (warningSignTriggered || action === "toggle_onboarding") {
      const newValue = warningSignTriggered ? "true" : onboardingPaused ? "true" : "false";

      await prisma.systemSetting.upsert({
        where: { key: "onboarding_paused" },
        update: { value: newValue, updatedAt: new Date() },
        create: {
          key: "onboarding_paused",
          value: newValue,
          description: "Emergency master switch pausing all new subscription onboarding",
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "UPDATE_ONBOARDING_PAUSE",
          targetType: "SETTINGS",
          metadataJson: JSON.stringify({ onboardingPaused: newValue, warningSignTriggered }),
        },
      });

      return NextResponse.json({ success: true, onboardingPaused: newValue === "true" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin dashboard action error:", error);
    return NextResponse.json({ error: "Failed to update dashboard setting" }, { status: 500 });
  }
}

