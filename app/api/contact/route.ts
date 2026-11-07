import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { brandConfig } from "@/config/brand";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ["admin_phone", "admin_whatsapp", "admin_email"] } },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    const phone = map["admin_phone"] || brandConfig.whatsappNumber;
    const whatsapp = map["admin_whatsapp"] || brandConfig.whatsappNumber;
    const email = map["admin_email"] || brandConfig.supportEmail;

    const cleanPhone = (whatsapp || phone || "").replace(/\D/g, "");

    return NextResponse.json({
      phone,
      whatsapp,
      email,
      cleanPhone,
      displayPhone: phone || brandConfig.whatsappDisplay,
      whatsappUrl: cleanPhone ? `https://wa.me/${cleanPhone}` : brandConfig.whatsappHelpUrl,
    });
  } catch (error) {
    return NextResponse.json({
      phone: brandConfig.whatsappNumber,
      whatsapp: brandConfig.whatsappNumber,
      email: brandConfig.supportEmail,
      cleanPhone: brandConfig.whatsappNumber.replace(/\D/g, ""),
      displayPhone: brandConfig.whatsappDisplay,
      whatsappUrl: brandConfig.whatsappHelpUrl,
    });
  }
}

