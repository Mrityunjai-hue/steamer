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

    const window = await prisma.setupWindow.findFirst({
      where: {
        userId: session.userId,
        status: "ACTIVE",
        ...(setupWindowId ? { id: setupWindowId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (!window) {
      return NextResponse.json({ error: "Active setup window not found" }, { status: 404 });
    }

    // Close window
    const updated = await prisma.setupWindow.update({
      where: { id: window.id },
      data: {
        status: "COMPLETED",
        closedAt: new Date(),
        offlineConfirmed: true,
      },
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
      message: "Setup window completed! Steam is safely set to Offline Mode. You can now enjoy playing your games anytime.",
      setupWindow: updated,
    });
  } catch (error) {
    console.error("Offline confirmation error:", error);
    return NextResponse.json({ error: "Failed to confirm offline mode" }, { status: 500 });
  }
}

