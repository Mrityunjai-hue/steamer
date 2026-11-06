import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskPhoneNumber } from "@/lib/encryption";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const windows = await prisma.setupWindow.findMany({
      where: {
        status: { in: ["ACTIVE", "QUEUED"] },
      },
      orderBy: [{ status: "asc" }, { queuePosition: "asc" }],
      include: {
        user: {
          select: {
            id: true,
            email: true,
            whatsappNumber: true,
            profile: { select: { displayName: true } },
          },
        },
        subscription: {
          include: {
            planGames: { include: { game: true } },
            device: true,
          },
        },
      },
    });

    const formatted = windows.map((w) => {
      const games = w.subscription.planGames.map((pg) => pg.game.title).join(", ") || "All-Access Pass";
      const cleanPhone = (w.user.whatsappNumber || "").replace(/\D/g, "");

      // Ready-made WhatsApp pre-filled template with NO secrets per Section 4
      const waTemplate = `Hello ${w.user.profile?.displayName || "Gamer"}! Your Steamer setup window for ${games} is starting now. Please reply to confirm you are at your PC with Steam open.`;
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waTemplate)}` : "#";

      let minutesLeft = 0;
      if (w.status === "ACTIVE" && w.expiresAt) {
        minutesLeft = Math.max(0, Math.round((new Date(w.expiresAt).getTime() - Date.now()) / 60000));
      }

      return {
        id: w.id,
        status: w.status,
        queuePosition: w.queuePosition,
        email: w.user.email,
        displayName: w.user.profile?.displayName || "Gamer",
        maskedWhatsapp: w.user.whatsappNumber ? maskPhoneNumber(w.user.whatsappNumber) : "—",
        rawWhatsapp: w.user.whatsappNumber,
        deviceLabel: w.subscription.device?.deviceLabel || "Primary PC",
        games,
        startedAt: w.startedAt,
        expiresAt: w.expiresAt,
        minutesLeft,
        offlineConfirmed: w.offlineConfirmed,
        adminOfflineConfirmed: w.adminOfflineConfirmed,
        notes: w.notes,
        waLink,
      };
    });

    return NextResponse.json({ windows: formatted });
  } catch (error) {
    console.error("Admin setup windows error:", error);
    return NextResponse.json({ error: "Failed to load setup windows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { windowId, action, extendMinutes = 60, checklistStep } = body;

    const window = await prisma.setupWindow.findUnique({
      where: { id: windowId },
      include: { subscription: true },
    });

    if (!window) {
      return NextResponse.json({ error: "Setup window not found" }, { status: 404 });
    }

    if (action === "START") {
      // Check if another active window is currently open (Rule 3.1: Only ONE window open at any time)
      const existingActive = await prisma.setupWindow.findFirst({
        where: { status: "ACTIVE", id: { not: window.id } },
      });

      if (existingActive) {
        return NextResponse.json(
          { error: "Another setup window is currently active. Close it before starting a new window." },
          { status: 409 }
        );
      }

      const startedAt = new Date();
      const expiresAt = new Date(Date.now() + 180 * 60 * 1000); // 3 hours

      await prisma.$transaction([
        prisma.setupWindow.update({
          where: { id: window.id },
          data: {
            status: "ACTIVE",
            startedAt,
            expiresAt,
            notes: "Credentials relayed on WhatsApp",
          },
        }),
        prisma.grant.updateMany({
          where: { subscriptionId: window.subscriptionId, status: "ACTIVE" },
          data: { lastCredentialRelayAt: startedAt },
        }),
        prisma.auditLog.create({
          data: {
            adminId: session.userId,
            action: "START_SETUP_WINDOW",
            targetType: "SETUP_WINDOW",
            targetId: window.id,
            metadataJson: JSON.stringify({ userId: window.userId, startedAt }),
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Setup window started (3 hours allocated)" });
    }

    if (action === "EXTEND") {
      const currentExpiry = window.expiresAt ? new Date(window.expiresAt).getTime() : Date.now();
      const newExpiry = new Date(currentExpiry + extendMinutes * 60 * 1000);

      await prisma.setupWindow.update({
        where: { id: window.id },
        data: { expiresAt: newExpiry },
      });

      return NextResponse.json({ success: true, message: `Window extended by ${extendMinutes} minutes` });
    }

    if (action === "CLOSE") {
      await prisma.$transaction([
        prisma.setupWindow.update({
          where: { id: window.id },
          data: {
            status: "COMPLETED",
            closedAt: new Date(),
            adminOfflineConfirmed: true,
          },
        }),
        prisma.auditLog.create({
          data: {
            adminId: session.userId,
            action: "CLOSE_SETUP_WINDOW",
            targetType: "SETUP_WINDOW",
            targetId: window.id,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Setup window closed successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin setup window action error:", error);
    return NextResponse.json({ error: "Failed to update setup window" }, { status: 500 });
  }
}

