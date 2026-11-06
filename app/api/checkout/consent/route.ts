import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const consentSchema = z.object({
  checkboxes: z.record(z.boolean()),
  trustPledge: z.boolean(),
  holdToken: z.string().optional(),
  disclosureVersion: z.string().default("1.0"),
  termsVersion: z.string().default("1.0"),
  guidelinesVersion: z.string().default("1.0"),
  guestEmail: z.string().optional(),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const parsed = consentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid consent payload" }, { status: 400 });
    }

    const {
      checkboxes,
      trustPledge,
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

    // Verify all mandatory disclosures are checked
    const requiredCheckboxes = [
      "offlinePlay",
      "personalPcSetup",
      "noAccountQueues",
      "allAccessCatalog",
      "systemRequirements",
      "noOnlineMultiplayer",
      "whatsappSupport",
      "refundGuarantee",
      "termsAndPrivacy",
      "finalAccept",
    ];

    for (const key of requiredCheckboxes) {
      if (!checkboxes[key]) {
        return NextResponse.json(
          { error: `You must acknowledge and accept all items: missing "${key}"` },
          { status: 400 }
        );
      }
    }

    if (!trustPledge) {
      return NextResponse.json(
        { error: "You must accept the Steamer Trust Pledge to proceed" },
        { status: 400 }
      );
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
        checkboxesJson: JSON.stringify(checkboxes),
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
    });
  } catch (error) {
    console.error("Consent recording error:", error);
    return NextResponse.json({ error: "Failed to record consent" }, { status: 500 });
  }
}
