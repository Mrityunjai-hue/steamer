import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verifications = await prisma.contactVerification.findMany({
      orderBy: { requestedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            whatsappNumber: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    return NextResponse.json({ verifications });
  } catch (error) {
    console.error("Admin verifications error:", error);
    return NextResponse.json({ error: "Failed to load verifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { verificationId, action } = body;

    const verification = await prisma.contactVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    if (action === "VERIFY") {
      await prisma.$transaction([
        prisma.contactVerification.update({
          where: { id: verification.id },
          data: {
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: session.email,
          },
        }),
        prisma.user.update({
          where: { id: verification.userId },
          data: { isWhatsappVerified: true },
        }),
        prisma.auditLog.create({
          data: {
            adminId: session.userId,
            action: "VERIFY_WHATSAPP_CONTACT",
            targetType: "USER",
            targetId: verification.userId,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "WhatsApp number verified successfully" });
    }

    if (action === "REJECT") {
      await prisma.contactVerification.update({
        where: { id: verification.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, message: "Verification rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Verification action error:", error);
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  }
}

