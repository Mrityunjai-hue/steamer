import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { guide } = body;

    if (!guide || !Array.isArray(guide.steps)) {
      return NextResponse.json({ error: "Invalid guide format" }, { status: 400 });
    }

    const serialized = JSON.stringify(guide);

    await prisma.systemSetting.upsert({
      where: { key: "setup_guide_content" },
      update: { value: serialized, updatedAt: new Date() },
      create: {
        key: "setup_guide_content",
        value: serialized,
        description: "Dynamic custom setup guide content managed by admin",
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "UPDATE_SETUP_GUIDE",
        targetType: "SETTINGS",
        metadataJson: JSON.stringify({ stepCount: guide.steps.length, updatedAt: new Date().toISOString() }),
      },
    });

    return NextResponse.json({ success: true, message: "Guide saved successfully" });
  } catch (error) {
    console.error("Admin guide save error:", error);
    return NextResponse.json({ error: "Failed to save guide" }, { status: 500 });
  }
}
