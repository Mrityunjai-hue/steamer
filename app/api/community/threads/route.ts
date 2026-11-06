import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inspectContentSafety } from "@/lib/content-filter";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const gameId = searchParams.get("gameId");

    const where: any = {};
    if (category) where.category = category;
    if (gameId) where.gameId = gameId;

    const threads = await prisma.thread.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        game: { select: { id: true, title: true } },
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json({ error: "Failed to load threads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to participate in the community" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category = "GENERAL", gameId } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Safety inspect content
    const safety = inspectContentSafety(`${title}\n${content}`);
    if (!safety.isSafe) {
      return NextResponse.json({ error: safety.warning }, { status: 400 });
    }

    const thread = await prisma.thread.create({
      data: {
        title: title.trim(),
        category,
        gameId: gameId || null,
        authorId: session.userId,
        posts: {
          create: {
            authorId: session.userId,
            content: content.trim(),
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, thread });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
  }
}

