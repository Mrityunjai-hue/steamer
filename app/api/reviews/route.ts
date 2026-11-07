import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const filterWithProof = searchParams.get("proofOnly") === "true";

    const where: any = {};
    if (filterWithProof) {
      where.imageUrl = { not: null };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate aggregate score
    const allRatings = await prisma.review.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    });

    const averageRating = allRatings._avg.rating ? Number(allRatings._avg.rating.toFixed(1)) : 5.0;
    const totalCount = allRatings._count.id || 0;

    return NextResponse.json({
      success: true,
      reviews,
      total,
      totalCount,
      averageRating,
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let userName = "";
    let userEmail: string | null = null;
    let rating = 5;
    let title: string | null = null;
    let comment = "";
    let gameTitle: string | null = null;
    let imageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      userName = (formData.get("userName") as string) || "";
      userEmail = (formData.get("userEmail") as string) || null;
      rating = parseInt((formData.get("rating") as string) || "5", 10);
      title = (formData.get("title") as string) || null;
      comment = (formData.get("comment") as string) || "";
      gameTitle = (formData.get("gameTitle") as string) || null;

      const file = formData.get("screenshot") as File | null;
      if (file && file.size > 0) {
        if (file.size > 4 * 1024 * 1024) {
          return NextResponse.json({ error: "Proof screenshot must be less than 4 MB" }, { status: 400 });
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = file.type || "image/jpeg";
        // Convert to data URI for durable cross-container serverless persistence in SQLite
        imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else {
        const rawImageUrl = formData.get("imageUrl") as string | null;
        if (rawImageUrl?.trim()) imageUrl = rawImageUrl.trim();
      }
    } else {
      const body = await req.json();
      userName = body.userName || "";
      userEmail = body.userEmail || null;
      rating = parseInt(body.rating || "5", 10);
      title = body.title || null;
      comment = body.comment || "";
      gameTitle = body.gameTitle || null;
      imageUrl = body.imageUrl || null;
    }

    if (!userName.trim()) {
      return NextResponse.json({ error: "Please enter your name or gamer tag" }, { status: 400 });
    }

    if (!comment.trim() || comment.trim().length < 5) {
      return NextResponse.json({ error: "Please write at least a short review comment" }, { status: 400 });
    }

    // Clamp rating between 1 and 5
    const finalRating = Math.max(1, Math.min(5, isNaN(rating) ? 5 : rating));

    const newReview = await prisma.review.create({
      data: {
        userName: userName.trim(),
        userEmail: userEmail?.trim() || null,
        rating: finalRating,
        title: title?.trim() || null,
        comment: comment.trim(),
        gameTitle: gameTitle?.trim() || null,
        imageUrl,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your verified review has been published.",
      review: newReview,
    });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: error?.message || "Failed to submit review" }, { status: 500 });
  }
}
