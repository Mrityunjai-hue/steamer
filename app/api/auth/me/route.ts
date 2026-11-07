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

  return NextResponse.json({
    user: {
      userId: user.id,
      email: user.email,
      displayName: user.profile?.displayName || "Gamer",
      role: user.role,
      whatsappNumber: user.whatsappNumber,
      isWhatsappVerified: user.isWhatsappVerified,
      totpEnabled: user.totpEnabled,
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
      latestSetupWindow: user.setupWindows[0]
        ? {
            id: user.setupWindows[0].id,
            status: user.setupWindows[0].status,
            expiresAt: user.setupWindows[0].expiresAt,
            startedAt: user.setupWindows[0].startedAt,
            offlineConfirmed: user.setupWindows[0].offlineConfirmed,
          }
        : null,
    },
  });
}

