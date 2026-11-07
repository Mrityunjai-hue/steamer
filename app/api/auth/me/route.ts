import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      subscriptions: {
        where: { status: "ACTIVE" },
        include: {
          planGames: {
            include: { game: true },
          },
          device: true,
        },
      },
      devices: true,
      setupWindows: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      contactVerifications: {
        orderBy: { requestedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    if (session.role === "ADMIN") {
      return NextResponse.json({
        user: {
          userId: session.userId,
          email: session.email,
          displayName: "Steamer Lead Administrator",
          role: "ADMIN",
          isWhatsappVerified: true,
          totpEnabled: true,
          activeSubscription: null,
          verificationPending: null,
        },
      });
    }
    return NextResponse.json({ user: null });
  }

  const activeSub = user.subscriptions[0] || null;
  let latestWindow = user.setupWindows[0] || null;

  // Persist setup window timer if activeSub exists and window timer is uninitialized
  if (activeSub) {
    if (!latestWindow) {
      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + 45 * 60 * 1000);
      latestWindow = await prisma.setupWindow.create({
        data: {
          userId: user.id,
          subscriptionId: activeSub.id,
          status: "ACTIVE",
          startedAt,
          expiresAt,
        },
      });
    } else if (!latestWindow.expiresAt && latestWindow.status !== "COMPLETED") {
      const startedAt = latestWindow.startedAt || new Date();
      const expiresAt = new Date(startedAt.getTime() + 45 * 60 * 1000);
      latestWindow = await prisma.setupWindow.update({
        where: { id: latestWindow.id },
        data: {
          status: "ACTIVE",
          startedAt,
          expiresAt,
        },
      });
    }
  }

  const hasPurchased =
    !!activeSub ||
    (await prisma.order.count({
      where: {
        userId: user.id,
        status: { in: ["COMPLETED", "VERIFIED", "ACTIVE"] },
      },
    })) > 0;

  const isCompleted =
    latestWindow?.status === "COMPLETED" ||
    latestWindow?.offlineConfirmed === true ||
    (await prisma.order.count({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
    })) > 0;

  return NextResponse.json({
    user: {
      userId: user.id,
      email: user.email,
      displayName: user.profile?.displayName || "Gamer",
      role: user.role,
      whatsappNumber: user.whatsappNumber,
      isWhatsappVerified: user.isWhatsappVerified,
      totpEnabled: user.totpEnabled,
      hasPurchased,
      isCompleted,
      activeSubscription: activeSub
        ? {
            id: activeSub.id,
            type: activeSub.type,
            startDate: activeSub.startDate,
            endDate: activeSub.endDate,
            deviceLabel: activeSub.device?.deviceLabel || "Primary PC",
            games: activeSub.planGames.map((pg) => ({
              id: pg.game.id,
              title: pg.game.title,
              launcher: pg.game.launcher,
              offlineTag: pg.game.offlineTag,
              headerImage: pg.game.headerImage,
            })),
          }
        : null,
      verificationPending: !user.isWhatsappVerified ? user.contactVerifications[0] : null,
      latestSetupWindow: latestWindow
        ? {
            id: latestWindow.id,
            status: latestWindow.status,
            expiresAt: latestWindow.expiresAt,
            startedAt: latestWindow.startedAt,
            offlineConfirmed: latestWindow.offlineConfirmed,
          }
        : null,
    },
  });
}

