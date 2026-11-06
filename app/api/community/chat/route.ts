import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inspectContentSafety } from "@/lib/content-filter";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room") || "general";

    const messages = await prisma.chatMessage.findMany({
      where: { room, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "Failed to load chat" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to chat" }, { status: 401 });
    }

    const body = await req.json();
    const { content, room = "general" } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Safety check for credentials/Steam Guard
    const safety = inspectContentSafety(content);
    if (!safety.isSafe) {
      return NextResponse.json({ error: safety.warning }, { status: 400 });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        room,
        content: content.trim(),
        authorId: session.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

