import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    const where: any = {};
    if (status !== "ALL") {
      if (status === "VERIFIED") {
        where.status = { in: ["VERIFIED", "ACTIVE", "COMPLETED"] };
      } else {
        where.status = status;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            whatsappNumber: true,
            profile: { select: { displayName: true } },
          },
        },
        submission: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin payments fetch error:", error);
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, action, rejectionReason, confirmedInBankApp } = body;

    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { submission: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "VERIFY") {
      // Addendum 2e: Require the admin to tick "I have confirmed this amount in my bank/UPI app" before Verify becomes active
      if (!confirmedInBankApp) {
        return NextResponse.json(
          { error: "Mandatory verification check: You must check 'I have confirmed this amount in my bank/UPI app' before approving." },
          { status: 400 }
        );
      }

      const draft = JSON.parse(order.subscriptionDraft || "{}");
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day continuous cycle

      await prisma.$transaction(async (tx) => {
        // Update order and submission
        await tx.order.update({
          where: { orderId: order.orderId },
          data: { status: "VERIFIED" },
        });

        // Also mark user verified as active RENTER
        await tx.user.update({
          where: { id: order.userId },
          data: {
            isWhatsappVerified: true,
            role: "RENTER",
            isSuspended: false,
          },
        });

        // Mark any pending contact verification as verified
        await tx.contactVerification.updateMany({
          where: { userId: order.userId, status: "PENDING" },
          data: {
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: session.email,
          },
        });

        if (order.submission) {
          await tx.paymentSubmission.update({
            where: { id: order.submission.id },
            data: {
              verifiedBy: session.email,
              verifiedAt: new Date(),
            },
          });
        }

        // Create or get Device
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

        // Create Subscription
        const subscription = await tx.subscription.create({
          data: {
            userId: order.userId,
            orderId: order.orderId,
            type: draft.planType || "SINGLE",
            priceINR: order.amount,
            startDate,
            endDate,
            deviceId: device.id,
            status: "ACTIVE",
          },
        });

        // Add games
        if (draft.gameIds && Array.isArray(draft.gameIds)) {
          for (const gameId of draft.gameIds) {
            await tx.planGame.create({
              data: {
                subscriptionId: subscription.id,
                gameId,
              },
            });
          }
        }

        // Create Grant (authorization for device for the plan period)
        await tx.grant.create({
          data: {
            userId: order.userId,
            subscriptionId: subscription.id,
            deviceLabel: device.deviceLabel,
            status: "ACTIVE",
            issuedAt: startDate,
            expiresAt: endDate,
          },
        });

        // Mark SlotReservation as CONSUMED
        await tx.slotReservation.updateMany({
          where: { userId: order.userId, status: "HOLD" },
          data: { status: "CONSUMED" },
        });

        // Create Admin Task for Setup Window Scheduling
        await tx.adminTask.create({
          data: {
            type: "CREDENTIAL_RELAY",
            subject: `Plan Activated: ${order.user.email} (${draft.planType}) — Schedule First Setup Window`,
            detailsJson: JSON.stringify({
              orderId: order.orderId,
              userId: order.userId,
              email: order.user.email,
              amount: order.amount,
              planType: draft.planType,
              device: device.deviceLabel,
              activatedAt: startDate.toISOString(),
            }),
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            adminId: session.userId,
            action: "VERIFY_UPI_PAYMENT",
            targetType: "ORDER",
            targetId: order.orderId,
            metadataJson: JSON.stringify({
              orderId: order.orderId,
              utr: order.submission?.utr,
              amount: order.amount,
            }),
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Order ${order.orderId} verified and 30-day subscription activated successfully.`,
      });
    }

    if (action === "REJECT") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { orderId: order.orderId },
          data: { status: "REJECTED" },
        });

        if (order.submission) {
          await tx.paymentSubmission.update({
            where: { id: order.submission.id },
            data: {
              rejectionReason: rejectionReason || "UTR not found in bank account or incorrect amount",
            },
          });
        }

        // Release slot reservation
        await tx.slotReservation.updateMany({
          where: { userId: order.userId, status: "HOLD" },
          data: { status: "RELEASED" },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            adminId: session.userId,
            action: "REJECT_PAYMENT",
            targetType: "ORDER",
            targetId: order.orderId,
            metadataJson: JSON.stringify({ rejectionReason }),
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Order ${order.orderId} rejected and slot released.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin payment review error:", error);
    return NextResponse.json({ error: "Failed to process payment review" }, { status: 500 });
  }
}

