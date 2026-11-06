import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type (images and videos)
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|png|jpg|jpeg|webp)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, GIF, MP4, and WEBM are supported." },
        { status: 400 }
      );
    }

    // Ensure upload dir exists
    const uploadDir = path.join(process.cwd(), "public", "guide");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique safe filename
    const ext = path.extname(file.name) || (file.type.startsWith("video/") ? ".mp4" : ".png");
    const isVideo = file.type.startsWith("video/") || ext === ".mp4" || ext === ".webm";
    const prefix = isVideo ? "video_" : "guide_";
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `${prefix}${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/guide/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fileName: uniqueName,
      isVideo,
    });
  } catch (error) {
    console.error("Admin guide upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
