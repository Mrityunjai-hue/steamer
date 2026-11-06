import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      where: session.role === "ADMIN" ? {} : { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, profile: { select: { displayName: true } } } },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to load support tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category = "LOGIN_HELP", subject, message, priority = "MEDIUM" } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticketNumber = `TCK-${Date.now().toString().slice(-6)}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        userId: session.userId,
        category,
        subject: subject.trim(),
        priority,
        messages: {
          create: {
            senderId: session.userId,
            senderRole: session.role,
            message: message.trim(),
          },
        },
      },
    });

    // Create Admin task for support ticket
    await prisma.adminTask.create({
      data: {
        type: "CREDENTIAL_RELAY",
        subject: `New Support Ticket [${ticketNumber}]: ${subject.trim()} (${category})`,
        detailsJson: JSON.stringify({
          ticketId: ticket.id,
          ticketNumber,
          userId: session.userId,
          category,
          subject,
        }),
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 });
  }
}

