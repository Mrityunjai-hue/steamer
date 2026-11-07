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

    let user = null;
    if (session?.userId) {
      user = await prisma.user.findUnique({ where: { id: session.userId } });
    }

    if (!user) {
      const cleanEmail = (guestEmail || session?.email || "").toLowerCase().trim();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return NextResponse.json(
          { error: "A valid email address is required so we can deliver your access link" },
          { status: 400 }
        );
      }

      user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            whatsappNumber: guestPhone?.trim() || "",
            passwordHash: "",
            role: "GUEST_RENTER",
            profile: {
              create: {
                displayName: guestName?.trim() || cleanEmail.split("@")[0] || "Steamer Buyer",
              },
            },
          },
        });

        // Sync new buyer to cloud vault - REMOVED (PostgreSQL handles persistence)
      } else if (guestPhone?.trim() && !user.whatsappNumber) {
        await prisma.user.update({
          where: { id: user.id },
          data: { whatsappNumber: guestPhone.trim() },
        });
      }
    }

    const userId = user.id;

    // Single acceptance validation: either accepted === true, or trustPledge === true, or all checkboxes checked
    const isConsentGiven = Boolean(accepted || trustPledge || (checkboxes && Object.values(checkboxes).length > 0 && Object.values(checkboxes).every(Boolean)));
    if (!isConsentGiven) {
      return NextResponse.json(
        { error: "You must accept the terms, offline play conditions, and 48-Hour Money-Back Guarantee to proceed." },
        { status: 400 }
      );
    }

    // Ensure contact verification record exists for WhatsApp PIN reference
    let verificationPin = `VERIFY ${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const existingVerif = await prisma.contactVerification.findFirst({
        where: { userId },
        orderBy: { requestedAt: "desc" },
      });

      if (existingVerif) {
        verificationPin = existingVerif.code;
      } else {
        const newVerif = await prisma.contactVerification.create({
          data: {
            userId,
            channel: "WHATSAPP",
            code: verificationPin,
            status: "PENDING",
          },
        });
        verificationPin = newVerif.code;
      }
    } catch (verifErr) {
      console.warn("Contact verification non-fatal warning:", verifErr);
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
    try {
      await prisma.legalAcceptance.createMany({
        data: [
          { userId, documentSlug: "terms", version: termsVersion, ipAddress: ip, userAgent },
          { userId, documentSlug: "disclosure", version: disclosureVersion, ipAddress: ip, userAgent },
          { userId, documentSlug: "guidelines", version: guidelinesVersion, ipAddress: ip, userAgent },
        ],
      });
    } catch (legalErr) {
      console.warn("Legal acceptance non-fatal warning:", legalErr);
    }

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
