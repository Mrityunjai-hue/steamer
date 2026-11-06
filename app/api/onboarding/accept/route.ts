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
    const { stepsAccepted = [] } = body;

    // Must have checked all 12 onboarding steps
    if (stepsAccepted.length < 12) {
      return NextResponse.json(
        { error: "You must complete and check all 12 onboarding rules before proceeding" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    await prisma.legalAcceptance.create({
      data: {
        userId: session.userId,
        documentSlug: "onboarding-wizard",
        version: "1.0",
        ipAddress: ip,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding successfully completed! You are now eligible to request your setup window.",
    });
  } catch (error) {
    console.error("Onboarding acceptance error:", error);
    return NextResponse.json({ error: "Failed to record onboarding completion" }, { status: 500 });
  }
}

