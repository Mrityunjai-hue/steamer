import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const { appId } = params;
    if (!appId || isNaN(Number(appId))) {
      return NextResponse.json({ error: "Invalid Steam AppID" }, { status: 400 });
    }

    const fileName = `appmanifest_${appId}.acf`;
    const filePath = path.join(process.cwd(), "public", "manifests", fileName);

    let content: string;

    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, "ascii");
    } else {
      // Dynamic fallback generation if file not pre-generated
      const game = await prisma.game.findFirst({
        where: { steamAppId: appId },
        select: { title: true },
      });
      const title = game?.title?.replace(/"/g, "") || `Steamer Game ${appId}`;
      const timestamp = Math.floor(Date.now() / 1000);
      content = `"AppState"
{
	"appid"		"${appId}"
	"Universe"		"1"
	"name"		"${title}"
	"StateFlags"		"4"
	"installdir"		"${title}"
	"LastUpdated"		"${timestamp}"
	"UpdateResult"		"0"
	"BytesToDownload"		"0"
	"BytesDownloaded"		"0"
	"AutoUpdateBehavior"		"1"
	"AllowOtherDownloadsWhileRunning"		"0"
	"ScheduledAutoUpdate"		"0"
	"InstalledDepots"
	{
	}
	"UserConfig"
	{
		"language"		"english"
	}
}
`;
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    console.error("GET /api/manifests/download/[appId] error:", err);
    return NextResponse.json(
      { error: "Failed to download manifest", details: err?.message },
      { status: 500 }
    );
  }
}

