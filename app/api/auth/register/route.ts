import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, getSessionCookieOptions } from "@/lib/auth";
import { brandConfig } from "@/config/brand";
import { registerUserInCloud } from "@/lib/cloud-sync";

const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  displayName: z.string().min(2, "Name must be at least 2 characters").max(40),
  whatsappNumber: z.string().min(10, "Please provide a valid 10-digit WhatsApp number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { email, password, displayName, whatsappNumber } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // Clean phone number
    const cleanedPhone = whatsappNumber.replace(/\D/g, "");
    const formattedPhone = cleanedPhone.startsWith("91") && cleanedPhone.length > 10 ? `+${cleanedPhone}` : `+91${cleanedPhone.slice(-10)}`;

    const passwordHash = await hashPassword(password);
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    // Generate short verification code (e.g. "VERIFY 4821")
    const randomCode = `VERIFY ${Math.floor(1000 + Math.random() * 9000)}`;

    // Create user and profile transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          whatsappNumber: formattedPhone,
          ipAddress: ip,
          userAgent,
          profile: {
            create: {
              displayName,
              avatarUrl: "/brand/icon.svg",
            },
          },
        },
      });

      // Create contact verification entry
      await tx.contactVerification.create({
        data: {
          userId: newUser.id,
          channel: "WHATSAPP",
          code: randomCode,
          status: "PENDING",
        },
      });

      return newUser;
    });

    // Ensure user is permanently backed up to the central cloud vault
    try {
      await registerUserInCloud({
        id: user.id,
        email: user.email,
        passwordHash,
        role: "RENTER",
        whatsappNumber: formattedPhone,
        displayName,
      });
    } catch (syncErr) {
      console.warn("Cloud sync non-fatal warning on register:", syncErr);
    }

    // Create session token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: "RENTER",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName,
        whatsappNumber: formattedPhone,
        isWhatsappVerified: false,
      },
      verification: {
        code: randomCode,
        adminWhatsapp: brandConfig.whatsappNumber,
        waLink: `https://wa.me/${brandConfig.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(randomCode)}`,
      },
    });

    response.cookies.set({
      ...getSessionCookieOptions(true),
      value: token,
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}

