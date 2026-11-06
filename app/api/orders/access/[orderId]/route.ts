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

    const isVerified = order.status === "ACTIVE" || order.status === "COMPLETED";

    // Load guide if verified
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
      guide: isVerified ? guide : null,
    });
  } catch (error) {
    console.error("Access link fetch error:", error);
    return NextResponse.json({ error: "Failed to retrieve access link" }, { status: 500 });
  }
}

// Allow guest to set a password to convert their order into a full account
export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderId }, { id: orderId }],
      },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
  } catch (error) {
    console.error("Claim account error:", error);
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
  }
}
