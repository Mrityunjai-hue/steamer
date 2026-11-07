import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_GUIDE_CONFIG, GuideConfig } from "@/lib/guide";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderId }, { id: orderId }],
      },
      include: {
        submission: true,
        user: {
          select: {
            id: true,
            email: true,
            whatsappNumber: true,
            role: true,
            passwordHash: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isVerified =
      order.status === "VERIFIED" ||
      order.status === "ACTIVE" ||
      order.status === "COMPLETED" ||
      order.status === "EXPIRED";

    // 1. If already completed by the user
    if (order.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        order: {
          orderId: order.orderId,
          amount: order.amount,
          status: order.status,
          utr: order.submission?.utr || null,
          payerName: order.submission?.payerName || null,
          createdAt: order.createdAt,
          user: {
            email: order.user.email,
            whatsapp: order.user.whatsappNumber,
            displayName: order.user.profile?.displayName || "Steamer Gamer",
            isGuest: !order.user.passwordHash || order.user.role === "GUEST_RENTER",
          },
        },
        isVerified: true,
        isCompleted: true,
        isExpired: false,
        windowStatus: "COMPLETED",
        completedAt: order.submission?.verifiedAt || order.createdAt,
        guide: null, // Guide is permanently locked once completed
      });
    }

    // 2. If expired
    if (order.status === "EXPIRED") {
      return NextResponse.json({
        success: true,
        order: {
          orderId: order.orderId,
          amount: order.amount,
          status: order.status,
          utr: order.submission?.utr || null,
          payerName: order.submission?.payerName || null,
          createdAt: order.createdAt,
          user: {
            email: order.user.email,
            whatsapp: order.user.whatsappNumber,
            displayName: order.user.profile?.displayName || "Steamer Gamer",
            isGuest: !order.user.passwordHash || order.user.role === "GUEST_RENTER",
          },
        },
        isVerified: true,
        isCompleted: false,
        isExpired: true,
        windowStatus: "EXPIRED",
        guide: null, // Guide is permanently locked once expired
      });
    }

    // 3. Active setup window management (45-minute countdown window)
    let windowStatus = "ACTIVE";
    let remainingSeconds = 45 * 60; // 45 minutes default
    let expiresAtDate: Date = new Date(Date.now() + 45 * 60 * 1000);
    let startedAtDate: Date = new Date();

    if (isVerified) {
      // Find subscription for user
      const subscription = await prisma.subscription.findFirst({
        where: {
          OR: [{ orderId: order.orderId }, { userId: order.userId }],
        },
      });

      // Find or create setup window
      let setupWindow = await prisma.setupWindow.findFirst({
        where: {
          userId: order.userId,
          status: { in: ["ACTIVE", "QUEUED"] },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!setupWindow && subscription) {
        // Read duration setting or default to 45 minutes
        const durationSetting = await prisma.systemSetting.findUnique({
          where: { key: "setup_window_duration_minutes" },
        });
        const durationMinutes = durationSetting?.value ? parseInt(durationSetting.value, 10) : 45;
        startedAtDate = new Date();
        expiresAtDate = new Date(startedAtDate.getTime() + durationMinutes * 60 * 1000);

        setupWindow = await prisma.setupWindow.create({
          data: {
            userId: order.userId,
            subscriptionId: subscription.id,
            status: "ACTIVE",
            startedAt: startedAtDate,
            expiresAt: expiresAtDate,
          },
        });
      }

      if (setupWindow && setupWindow.expiresAt) {
        expiresAtDate = new Date(setupWindow.expiresAt);
        startedAtDate = setupWindow.startedAt ? new Date(setupWindow.startedAt) : new Date(setupWindow.createdAt);
        const diffMs = expiresAtDate.getTime() - Date.now();
        remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));

        // If time has completely expired
        if (remainingSeconds <= 0) {
          await prisma.setupWindow.update({
            where: { id: setupWindow.id },
            data: { status: "EXPIRED" },
          });
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });

          return NextResponse.json({
            success: true,
            order: {
              orderId: order.orderId,
              amount: order.amount,
              status: "EXPIRED",
              utr: order.submission?.utr || null,
              payerName: order.submission?.payerName || null,
              createdAt: order.createdAt,
              user: {
                email: order.user.email,
                whatsapp: order.user.whatsappNumber,
                displayName: order.user.profile?.displayName || "Steamer Gamer",
                isGuest: !order.user.passwordHash || order.user.role === "GUEST_RENTER",
              },
            },
            isVerified: true,
            isCompleted: false,
            isExpired: true,
            windowStatus: "EXPIRED",
            guide: null,
          });
        }
      }
    }

    // Load guide if verified and window active
    let guide: GuideConfig = DEFAULT_GUIDE_CONFIG;
    if (isVerified) {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "setup_guide_content" },
      });
      if (setting?.value) {
        try {
          guide = JSON.parse(setting.value);
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        amount: order.amount,
        status: order.status,
        utr: order.submission?.utr || null,
        payerName: order.submission?.payerName || null,
        createdAt: order.createdAt,
        user: {
          email: order.user.email,
          whatsapp: order.user.whatsappNumber,
          displayName: order.user.profile?.displayName || "Steamer Gamer",
          isGuest: !order.user.passwordHash || order.user.role === "GUEST_RENTER",
        },
      },
      isVerified,
      isCompleted: false,
      isExpired: false,
      windowStatus,
      remainingSeconds,
      expiresAt: expiresAtDate.toISOString(),
      startedAt: startedAtDate.toISOString(),
      guide: isVerified ? guide : null,
    });
  } catch (error) {
    console.error("Access link fetch error:", error);
    return NextResponse.json({ error: "Failed to retrieve access link" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await req.json();
    const { action, password } = body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderId }, { id: orderId }],
      },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Process Completed Action
    if (action === "COMPLETE_SETUP") {
      // Mark order COMPLETED
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
      });

      // Close and complete all active/queued setup windows for this user
      await prisma.setupWindow.updateMany({
        where: {
          userId: order.userId,
          status: { in: ["ACTIVE", "QUEUED"] },
        },
        data: {
          status: "COMPLETED",
          closedAt: new Date(),
          offlineConfirmed: true,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          adminId: "SYSTEM",
          action: "SETUP_PROCESS_COMPLETED",
          targetType: "ORDER",
          targetId: order.orderId,
          metadataJson: JSON.stringify({
            userId: order.userId,
            email: order.user.email,
            completedAt: new Date().toISOString(),
            orderId: order.orderId,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Process confirmed! Setup window completed and safely locked.",
      });
    }

    // 2. Claim Guest Account Action
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: order.userId },
        data: {
          passwordHash,
          role: "RENTER",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully! You can now log in anytime with your email.",
      });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (error) {
    console.error("Order access POST error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
