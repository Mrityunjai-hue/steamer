import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskPhoneNumber } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const format = searchParams.get("format");

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { profile: { displayName: { contains: search } } },
        { whatsappNumber: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        devices: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            planGames: { include: { game: true } },
            device: true,
            grants: { orderBy: { issuedAt: "desc" }, take: 1 },
          },
        },
      },
    });

    const registry = users.map((u) => {
      const activeSub = u.subscriptions[0] || null;
      let daysLeft = 0;
      let status = "INACTIVE";

      if (u.isSuspended) {
        status = "SUSPENDED";
      } else if (activeSub) {
        const now = Date.now();
        const end = new Date(activeSub.endDate).getTime();
        daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
        if (now > end) {
          status = "EXPIRED";
        } else if (daysLeft <= 5) {
          status = "EXPIRING";
        } else {
          status = "ACTIVE";
        }
      }

      return {
        userId: u.id,
        email: u.email,
        displayName: u.profile?.displayName || "—",
        whatsapp: u.whatsappNumber ? maskPhoneNumber(u.whatsappNumber) : "—",
        rawWhatsapp: u.whatsappNumber,
        isWhatsappVerified: u.isWhatsappVerified,
        planType: activeSub?.type || "None",
        games: activeSub ? activeSub.planGames.map((pg) => pg.game.title).join(", ") || "All-Access Pass" : "—",
        deviceLabel: activeSub?.device?.deviceLabel || u.devices[0]?.deviceLabel || "Primary PC",
        startDate: activeSub ? activeSub.startDate : null,
        endDate: activeSub ? activeSub.endDate : null,
        daysLeft,
        status,
        lastCredentialRelay: activeSub?.grants[0]?.lastCredentialRelayAt || null,
      };
    });

    // CSV Export option
    if (format === "csv") {
      const headers = ["Email,Name,WhatsApp,Plan,Games,Device,StartDate,EndDate,DaysLeft,Status"];
      const rows = registry.map((r) =>
        `"${r.email}","${r.displayName}","${r.whatsapp}","${r.planType}","${r.games.replace(/"/g, '""')}","${r.deviceLabel}","${r.startDate ? new Date(r.startDate).toLocaleDateString() : ""}","${r.endDate ? new Date(r.endDate).toLocaleDateString() : ""}",${r.daysLeft},"${r.status}"`
      );
      const csvData = [headers, ...rows].join("\n");

      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="steamer_renter_registry_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ registry });
  } catch (error) {
    console.error("Admin registry error:", error);
    return NextResponse.json({ error: "Failed to load registry" }, { status: 500 });
  }
}

