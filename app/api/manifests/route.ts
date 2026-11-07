import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const launcher = searchParams.get("launcher");
    const search = searchParams.get("search");
    const steamAppId = searchParams.get("steamAppId");

    const where: any = {};

    if (launcher && launcher !== "ALL") {
      where.launcher = launcher;
    }

    if (steamAppId) {
      where.steamAppId = steamAppId;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { steamAppId: { contains: search.trim() } },
        { launcher: { contains: search.trim(), mode: "insensitive" } },
        { sourceToolkit: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const manifests = await prisma.gameFixManifest.findMany({
      where,
      orderBy: [
        { launcher: "asc" },
        { title: "asc" },
      ],
      include: {
        game: {
          select: {
            id: true,
            title: true,
            headerImage: true,
            hypeTier: true,
            offlineTag: true,
          },
        },
      },
    });

    return NextResponse.json({ manifests, count: manifests.length });
  } catch (err: any) {
    console.error("GET /api/manifests error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve game fix manifests", details: err?.message },
      { status: 500 }
    );
  }
}

