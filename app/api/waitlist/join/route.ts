import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to join the waitlist" }, { status: 401 });
    }

    const existing = await prisma.waitlistEntry.findFirst({
      where: {
        userId: session.userId,
        status: { in: ["WAITING", "OFFERED"] },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You are already on the priority waitlist",
        position: existing.position,
        status: existing.status,
      });
    }

    const currentMax = await prisma.waitlistEntry.aggregate({
      _max: { position: true },
      where: { status: "WAITING" },
    });

    const nextPosition = (currentMax._max.position || 0) + 1;

    const entry = await prisma.waitlistEntry.create({
      data: {
        userId: session.userId,
        position: nextPosition,
        status: "WAITING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "You have joined the priority waitlist",
      position: entry.position,
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}

