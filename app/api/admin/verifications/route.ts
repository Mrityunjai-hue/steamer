import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verifications = await prisma.contactVerification.findMany({
      orderBy: { requestedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            whatsappNumber: true,
            isWhatsappVerified: true,
            role: true,
            profile: { select: { displayName: true } },
            orders: {
              select: {
                orderId: true,
                status: true,
                amount: true,
                createdAt: true,
                submission: { select: { utr: true } },
              },
              orderBy: { createdAt: "desc" },
              take: 3,
            },
          },
        },
      },
    });

    return NextResponse.json({ verifications });
  } catch (error) {
    console.error("Admin verifications error:", error);
    return NextResponse.json({ error: "Failed to load verifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { verificationId, action, query, userId } = body;

    // 1. QUICK VERIFY ACTION (By PIN, Code, Order ID, Email, or WhatsApp Number)
    if (action === "QUICK_VERIFY") {
      const q = (query || "").trim();
      if (!q) {
        return NextResponse.json({ error: "Please enter a PIN, Order ID, Email, or Phone number." }, { status: 400 });
      }

      // Try finding by ContactVerification code (e.g. "4821" or "VERIFY 4821")
      let matchedVerif = await prisma.contactVerification.findFirst({
        where: {
          OR: [
            { code: { equals: q } },
            { code: { contains: q } },
          ],
        },
        include: { user: { include: { orders: { orderBy: { createdAt: "desc" } } } } },
      });

      let targetUser = matchedVerif?.user;
      let matchedOrder = targetUser?.orders?.[0];

      // If not found by code, try Order ID or UTR
      if (!targetUser) {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { orderId: { equals: q } },
              { orderId: { contains: q } },
              { submission: { utr: { equals: q } } },
            ],
          },
          include: { user: { include: { orders: { orderBy: { createdAt: "desc" } } } } },
        });

        if (order) {
          targetUser = order.user;
          matchedOrder = order;
        }
      }

      // If not found, try User Email or WhatsApp
      if (!targetUser) {
        const cleanDigits = q.replace(/\D/g, "");
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: q.toLowerCase() } },
              { email: { contains: q.toLowerCase() } },
              ...(cleanDigits.length >= 4 ? [{ whatsappNumber: { contains: cleanDigits } }] : []),
            ],
          },
          include: { orders: { orderBy: { createdAt: "desc" } } },
        });

        if (user) {
          targetUser = user;
          matchedOrder = user.orders?.[0];
        }
      }

      if (!targetUser) {
        return NextResponse.json(
          { error: `No customer record found matching "${q}". Please check the PIN or Order ID.` },
          { status: 404 }
        );
      }

      // Perform complete user & order verification
      await activateUserAndOrders(targetUser.id, session, matchedOrder?.orderId);

      return NextResponse.json({
        success: true,
        message: `Customer ${targetUser.email} has been successfully verified & activated!`,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          whatsappNumber: targetUser.whatsappNumber,
        },
        orderId: matchedOrder?.orderId || null,
        accessUrl: matchedOrder ? `/access/${matchedOrder.orderId}` : null,
      });
    }

    // 2. VERIFY USER ACTION (Direct by User ID)
    if (action === "VERIFY_USER" && userId) {
      await activateUserAndOrders(userId, session);
      return NextResponse.json({ success: true, message: "User verified and activated successfully." });
    }

    // 3. LEGACY VERIFY ACTION (By verificationId)
    if (action === "VERIFY" && verificationId) {
      const verification = await prisma.contactVerification.findUnique({
        where: { id: verificationId },
      });

      if (!verification) {
        return NextResponse.json({ error: "Verification not found" }, { status: 404 });
      }

      await activateUserAndOrders(verification.userId, session);
      return NextResponse.json({ success: true, message: "WhatsApp number & customer pass verified successfully" });
    }

    // 4. REJECT ACTION
    if (action === "REJECT" && verificationId) {
      await prisma.contactVerification.update({
        where: { id: verificationId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, message: "Verification rejected" });
    }

    return NextResponse.json({ error: "Invalid action or missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("Verification action error:", error);
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  }
}

// Shared helper to mark user verified, approve orders, and grant active subscription
async function activateUserAndOrders(userId: string, session: any, specificOrderId?: string) {
  const startDate = new Date();
  const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1-year / permanent active window

  await prisma.$transaction(async (tx) => {
    // 1. Update User to verified RENTER
    await tx.user.update({
      where: { id: userId },
      data: {
        isWhatsappVerified: true,
        role: "RENTER",
        isSuspended: false,
      },
    });

    // 2. Update all pending ContactVerifications
    await tx.contactVerification.updateMany({
      where: { userId, status: "PENDING" },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: session.email,
      },
    });

    // 3. Find any order to activate
    const orderWhere: any = specificOrderId
      ? { orderId: specificOrderId }
      : { userId, status: { in: ["PENDING_PAYMENT", "PAYMENT_SUBMITTED"] } };

    const ordersToVerify = await tx.order.findMany({
      where: orderWhere,
      include: { submission: true },
    });

    for (const order of ordersToVerify) {
      // Mark order VERIFIED
      await tx.order.update({
        where: { orderId: order.orderId },
        data: { status: "VERIFIED" },
      });

      // Update submission if exists
      if (order.submission) {
        await tx.paymentSubmission.update({
          where: { id: order.submission.id },
          data: {
            verifiedBy: session.email,
            verifiedAt: new Date(),
          },
        });
      }

      // Create or update device
      const draft = JSON.parse(order.subscriptionDraft || "{}");
      let device = await tx.device.findFirst({
        where: { userId: order.userId, deviceLabel: draft.deviceLabel || "Primary PC" },
      });

      if (!device) {
        device = await tx.device.create({
          data: {
            userId: order.userId,
            deviceLabel: draft.deviceLabel || "Primary PC",
            isApproved: true,
          },
        });
      }

      // Check if Subscription exists
      let sub = await tx.subscription.findUnique({
        where: { orderId: order.orderId },
      });

      if (!sub) {
        sub = await tx.subscription.create({
          data: {
            userId: order.userId,
            orderId: order.orderId,
            type: draft.planType || "ALL_ACCESS",
            priceINR: order.amount,
            startDate,
            endDate,
            deviceId: device.id,
            status: "ACTIVE",
          },
        });

        // Create Grant
        await tx.grant.create({
          data: {
            userId: order.userId,
            subscriptionId: sub.id,
            deviceLabel: device.deviceLabel,
            status: "ACTIVE",
            issuedAt: startDate,
            expiresAt: endDate,
          },
        });
      } else {
        await tx.subscription.update({
          where: { id: sub.id },
          data: {
            status: "ACTIVE",
            endDate,
          },
        });
      }
    }

    // 4. Audit log
    await tx.auditLog.create({
      data: {
        adminId: session.userId,
        action: "ADMIN_VERIFY_AND_ACTIVATE_CUSTOMER",
        targetType: "USER",
        targetId: userId,
        metadataJson: JSON.stringify({
          verifiedBy: session.email,
          ordersCount: ordersToVerify.length,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  });
}
