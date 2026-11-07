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
        orders: {
          select: { orderId: true, status: true, amount: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
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
        latestOrderId: u.orders[0]?.orderId || null,
        latestOrderStatus: u.orders[0]?.status || null,
        planType: activeSub?.type || "All-Access Pass",
        games: activeSub ? activeSub.planGames.map((pg) => pg.game.title).join(", ") || "All 265+ Vault Titles" : "—",
        deviceLabel: activeSub?.device?.deviceLabel || u.devices[0]?.deviceLabel || "Primary PC",
        startDate: activeSub ? activeSub.startDate : null,
        endDate: activeSub ? activeSub.endDate : null,
        daysLeft,
        status,
        isSuspended: u.isSuspended,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { orders: { orderBy: { createdAt: "desc" } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "VERIFY") {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await prisma.$transaction(async (tx) => {
        // Mark user verified and RENTER
        await tx.user.update({
          where: { id: userId },
          data: {
            isWhatsappVerified: true,
            role: "RENTER",
            isSuspended: false,
          },
        });

        // Update contact verifications
        await tx.contactVerification.updateMany({
          where: { userId, status: "PENDING" },
          data: {
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: session.email,
          },
        });

        // Update latest order if pending
        const pendingOrder = user.orders.find((o) => o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_SUBMITTED");
        if (pendingOrder) {
          await tx.order.update({
            where: { orderId: pendingOrder.orderId },
            data: { status: "VERIFIED" },
          });

          let sub = await tx.subscription.findUnique({
            where: { orderId: pendingOrder.orderId },
          });

          if (!sub) {
            let device = await tx.device.findFirst({ where: { userId } });
            if (!device) {
              device = await tx.device.create({
                data: { userId, deviceLabel: "Primary Gaming PC", isApproved: true },
              });
            }

            await tx.subscription.create({
              data: {
                userId,
                orderId: pendingOrder.orderId,
                type: "ALL_ACCESS",
                priceINR: pendingOrder.amount,
                startDate,
                endDate,
                deviceId: device.id,
                status: "ACTIVE",
              },
            });
          }
        }

        await tx.auditLog.create({
          data: {
            adminId: session.userId,
            action: "ADMIN_MANUAL_VERIFY_RENTER",
            targetType: "USER",
            targetId: userId,
          },
        });
      });

      return NextResponse.json({ success: true, message: `Renter ${user.email} verified and activated!` });
    }

    if (action === "TOGGLE_SUSPEND") {
      const newSuspended = !user.isSuspended;
      await prisma.user.update({
        where: { id: userId },
        data: { isSuspended: newSuspended },
      });

      return NextResponse.json({
        success: true,
        message: `Renter ${user.email} is now ${newSuspended ? "Suspended" : "Active"}.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin renter update error:", error);
    return NextResponse.json({ error: "Failed to update renter" }, { status: 500 });
  }
}
