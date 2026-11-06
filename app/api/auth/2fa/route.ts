import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";
import qrcode from "qrcode";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.totpEnabled) {
    return NextResponse.json({ enabled: true });
  }

  // Generate new TOTP secret if not exists
  const secret = user.totpSecret || authenticator.generateSecret();
  if (!user.totpSecret) {
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret },
    });
  }

  const otpauth = authenticator.keyuri(user.email, "Steamer Vault", secret);
  const qrDataUrl = await qrcode.toDataURL(otpauth);

  return NextResponse.json({
    enabled: false,
    secret,
    qrDataUrl,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { code, enable } = body;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || !user.totpSecret) {
    return NextResponse.json({ error: "2FA not initialized" }, { status: 400 });
  }

  const isValid = authenticator.verify({
    token: code,
    secret: user.totpSecret,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid 6-digit authenticator code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: !!enable },
  });

  return NextResponse.json({
    success: true,
    enabled: !!enable,
    message: enable ? "Two-factor authentication enabled successfully" : "2FA disabled",
  });
}

