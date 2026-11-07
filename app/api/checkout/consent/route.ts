import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const consentSchema = z.object({
  checkboxes: z.record(z.boolean()).nullable().optional(),
  trustPledge: z.boolean().nullable().optional(),
  accepted: z.boolean().nullable().optional(),
  holdToken: z.string().nullable().optional(),
  disclosureVersion: z.string().default("1.0"),
  termsVersion: z.string().default("1.0"),
  guidelinesVersion: z.string().default("1.0"),
  guestEmail: z.string().nullable().optional(),
  guestName: z.string().nullable().optional(),
  guestPhone: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const parsed = consentSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Consent validation failure:", parsed.error);
      return NextResponse.json({ error: "Invalid consent payload" }, { status: 400 });
    }

    const {
      checkboxes,
      trustPledge,
      accepted,
      holdToken,
      disclosureVersion,
      termsVersion,
      guidelinesVersion,
      guestEmail,
      guestName,
      guestPhone,
    } = parsed.data;

    let userId = session?.userId;

    if (!userId) {
      const cleanEmail = (guestEmail || "").toLowerCase().trim();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return NextResponse.json(
          { error: "A valid email address is required so we can deliver your access link" },
          { status: 400 }
        );
      }

      let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            whatsappNumber: guestPhone?.trim() || "",
            passwordHash: "",
            role: "GUEST_RENTER",
            profile: {
              create: {
                displayName: guestName?.trim() || "Steamer Buyer",
              },
            },
          },
        });
      }
      userId = user.id;
    }

    // Single acceptance validation: either accepted === true, or trustPledge === true, or all checkboxes checked
    const isConsentGiven = Boolean(accepted || trustPledge || (checkboxes && Object.values(checkboxes).length > 0 && Object.values(checkboxes).every(Boolean)));
    if (!isConsentGiven) {
      return NextResponse.json(
        { error: "You must accept the terms, offline play conditions, and 48-Hour Money-Back Guarantee to proceed." },
        { status: 400 }
      );
    }

    // Ensure contact verification record exists for WhatsApp PIN reference
    const existingVerif = await prisma.contactVerification.findFirst({
      where: { userId },
      orderBy: { requestedAt: "desc" },
    });

    let verificationPin = existingVerif?.code;
    if (!existingVerif) {
      const randomCode = `VERIFY ${Math.floor(1000 + Math.random() * 9000)}`;
      const newVerif = await prisma.contactVerification.create({
        data: {
          userId,
          channel: "WHATSAPP",
          code: randomCode,
          status: "PENDING",
        },
      });
      verificationPin = newVerif.code;
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    // Save ConsentRecord
    const record = await prisma.consentRecord.create({
      data: {
        userId,
        disclosureVersion,
        termsVersion,
        guidelinesVersion,
        checkboxesJson: JSON.stringify(checkboxes || { accepted: true, trustPledge: true }),
        trustPledgeAccepted: true,
        ipAddress: ip,
        userAgent,
      },
    });

    // Also record legal document acceptance
    await prisma.legalAcceptance.createMany({
      data: [
        { userId, documentSlug: "terms", version: termsVersion, ipAddress: ip, userAgent },
        { userId, documentSlug: "disclosure", version: disclosureVersion, ipAddress: ip, userAgent },
        { userId, documentSlug: "guidelines", version: guidelinesVersion, ipAddress: ip, userAgent },
      ],
    });

    return NextResponse.json({
      success: true,
      consentId: record.id,
      userId,
      pin: verificationPin,
    });
  } catch (error: any) {
    console.error("Consent recording error:", error);
    return NextResponse.json({ error: error?.message || "Failed to record consent" }, { status: 500 });
  }
}
