import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GuideConfig, DEFAULT_GUIDE_CONFIG } from "@/lib/guide";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "setup_guide_content" },
    });

    if (!setting || !setting.value) {
      return NextResponse.json({ success: true, guide: DEFAULT_GUIDE_CONFIG });
    }

    const guide: GuideConfig = JSON.parse(setting.value);
    return NextResponse.json({ success: true, guide });
  } catch (error) {
    console.error("Failed to load guide config:", error);
    return NextResponse.json({ success: true, guide: DEFAULT_GUIDE_CONFIG });
  }
}
