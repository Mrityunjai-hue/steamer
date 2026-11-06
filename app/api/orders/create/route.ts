import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePlanPricing } from "@/lib/pricing";
import { brandConfig } from "@/config/brand";
import qrcode from "qrcode";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { gameIds = [], isAllAccess = false, deviceLabel = "Primary Gaming Rig", consentId, holdToken } = body;

    // Verify consent record
    const consent = await prisma.consentRecord.findUnique({
      where: { id: consentId },
    });

    if (!consent || !consent.trustPledgeAccepted) {
      return NextResponse.json(
        { error: "You must complete the mandatory disclosure & Trust Pledge before order creation" },
        { status: 400 }
      );
    }

    const userId = session?.userId || consent.userId;

    // Verify slot hold if provided
    if (holdToken) {
      await prisma.slotReservation.updateMany({
        where: { holdToken, userId, status: "HOLD" },
        data: { status: "ACTIVE" },
      });
    }

    // Fetch games and calculate official price
    let games: Array<{ id: string; title: string; hypeTier: string; price: number }> = [];
    if (gameIds.length > 0 && !isAllAccess) {
      const dbGames = await prisma.game.findMany({
        where: { id: { in: gameIds } },
        select: { id: true, title: true, hypeTier: true, ourMonthlyPriceINR: true },
      });
      games = dbGames.map((g) => ({
        id: g.id,
        title: g.title,
        hypeTier: g.hypeTier,
        price: g.ourMonthlyPriceINR,
      }));
    }

    const pricing = calculatePlanPricing(games, isAllAccess);
    if (pricing.finalPrice <= 0) {
      return NextResponse.json({ error: "Invalid game selection" }, { status: 400 });
    }

    // Generate unique Order ID, e.g. STR-2026-000123
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const orderId = `STR-${new Date().getFullYear()}-${orderNumber}`;

    // Get UPI Settings
    const upiSettings = await prisma.systemSetting.findMany({
      where: { key: { in: ["upi_vpa", "upi_payee_name", "upi_static_qr_path"] } },
    });

    const vpa = upiSettings.find((s) => s.key === "upi_vpa")?.value || "steamer@upi";
    const payeeName = upiSettings.find((s) => s.key === "upi_payee_name")?.value || brandConfig.legalBusinessName;
    const staticQrPath = upiSettings.find((s) => s.key === "upi_static_qr_path")?.value || "";

    // Standard UPI deep link: upi://pay?pa=<VPA>&pn=<PAYEE>&am=<AMOUNT>&cu=INR&tn=<ORDER ID>
    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${pricing.finalPrice}&cu=INR&tn=${encodeURIComponent(orderId)}`;

    // Generate dynamic QR code locally
    const qrDataUrl = await qrcode.toDataURL(upiDeepLink, {
      width: 320,
      margin: 2,
      color: {
        dark: "#171a21",
        light: "#ffffff",
      },
    });

    // Create Order with status PENDING_PAYMENT (1 hour window to submit UTR)
    const orderExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const order = await prisma.order.create({
      data: {
        orderId,
        userId,
        amount: pricing.finalPrice,
        status: "PENDING_PAYMENT",
        expiresAt: orderExpiresAt,
        subscriptionDraft: JSON.stringify({
          planType: pricing.planType,
          gameIds: isAllAccess ? [] : games.map((g) => g.id),
          isAllAccess,
          deviceLabel,
          consentId,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderId: order.orderId,
        amount: order.amount,
        status: order.status,
        expiresAt: order.expiresAt,
        upiDeepLink,
        qrDataUrl,
        vpa,
        payeeName,
        staticQrPath,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
