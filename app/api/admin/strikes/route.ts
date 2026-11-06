import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const strikes = await prisma.strike.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        user: { select: { email: true, profile: { select: { displayName: true } } } },
      },
    });

    const violations = await prisma.violation.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { email: true, profile: { select: { displayName: true } } } },
      },
    });

    return NextResponse.json({ strikes, violations });
  } catch (error) {
    console.error("Admin strikes error:", error);
    return NextResponse.json({ error: "Failed to load strikes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, level, reason, immediateBan } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const strikeLevel = immediateBan ? 3 : Math.min(3, Math.max(1, parseInt(level || "1", 10)));
    const strikeReason = reason?.trim() || (immediateBan ? "Critical terms breach: immediate permanent ban" : "Policy violation");

    await prisma.$transaction(async (tx) => {
      // Record Strike
      await tx.strike.create({
        data: {
          userId: user.id,
          level: strikeLevel,
          reason: strikeReason,
        },
      });

      // Apply enforcement
      if (strikeLevel === 1) {
        // Warning only
      } else if (strikeLevel === 2) {
        // 7-day suspension
        const suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await tx.user.update({
          where: { id: user.id },
          data: { isSuspended: true, suspendedUntil },
        });
      } else if (strikeLevel === 3) {
        // Permanent ban
        await tx.user.update({
          where: { id: user.id },
          data: { isSuspended: true, suspendedUntil: null },
        });
        // Revoke active grants
        await tx.grant.updateMany({
          where: { userId: user.id, status: "ACTIVE" },
          data: { status: "REVOKED" },
        });
        // Cancel active subscriptions
        await tx.subscription.updateMany({
          where: { userId: user.id, status: "ACTIVE" },
          data: { status: "SUSPENDED" },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.userId,
          action: `ISSUE_STRIKE_LEVEL_${strikeLevel}`,
          targetType: "USER",
          targetId: user.id,
          metadataJson: JSON.stringify({ strikeLevel, reason: strikeReason, immediateBan }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Strike level ${strikeLevel} issued to ${user.email}`,
    });
  } catch (error) {
    console.error("Strike issue error:", error);
    return NextResponse.json({ error: "Failed to issue strike" }, { status: 500 });
  }
}

