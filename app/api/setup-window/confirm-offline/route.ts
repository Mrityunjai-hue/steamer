import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { setupWindowId, checklistConfirmed } = body;

    if (!checklistConfirmed) {
      return NextResponse.json(
        { error: "Please complete and confirm all Offline Mode checklist items before finishing" },
        { status: 400 }
      );
    }

    // Find any active or queued window for this user
    let window = await prisma.setupWindow.findFirst({
      where: {
        userId: session.userId,
        status: { in: ["ACTIVE", "QUEUED"] },
        ...(setupWindowId ? { id: setupWindowId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (!window) {
      // Find subscription or create completed window record directly
      const subscription = await prisma.subscription.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });

      if (subscription) {
        window = await prisma.setupWindow.create({
          data: {
            userId: session.userId,
            subscriptionId: subscription.id,
            status: "COMPLETED",
            startedAt: new Date(),
            closedAt: new Date(),
            offlineConfirmed: true,
          },
        });
      } else {
        // Even if no subscription, check for order
        const order = await prisma.order.findFirst({
          where: { userId: session.userId },
          orderBy: { createdAt: "desc" },
        });

        // Ensure user orders are marked COMPLETED
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "COMPLETED" },
          });
        }

        return NextResponse.json({
          success: true,
          message: "Setup completed successfully! Lifetime games access in your personal Steam is active.",
        });
      }
    } else {
      // Close window
      window = await prisma.setupWindow.update({
        where: { id: window.id },
        data: {
          status: "COMPLETED",
          closedAt: new Date(),
          offlineConfirmed: true,
        },
      });
    }

    // Mark any active/verified orders as COMPLETED
    await prisma.order.updateMany({
      where: {
        userId: session.userId,
        status: { in: ["VERIFIED", "ACTIVE"] },
      },
      data: { status: "COMPLETED" },
    });

    // Check if next in queue can be alerted
    const nextInQueue = await prisma.setupWindow.findFirst({
      where: { status: "QUEUED" },
      orderBy: { queuePosition: "asc" },
      include: { user: true },
    });

    if (nextInQueue) {
      await prisma.adminTask.create({
        data: {
          type: "CREDENTIAL_RELAY",
          subject: `Next Window Ready: ${nextInQueue.user.email} (Ready to start window)`,
          detailsJson: JSON.stringify({
            setupWindowId: nextInQueue.id,
            userId: nextInQueue.userId,
            email: nextInQueue.user.email,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Setup completed successfully! Lifetime games access in your personal Steam is active.",
      setupWindow: window,
    });
  } catch (error) {
    console.error("Offline confirmation error:", error);
    return NextResponse.json({ error: "Failed to confirm offline mode" }, { status: 500 });
  }
}

