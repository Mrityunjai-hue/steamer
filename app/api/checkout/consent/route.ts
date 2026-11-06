import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const consentSchema = z.object({
  checkboxes: z.record(z.boolean()),
  trustPledge: z.boolean(),
  holdToken: z.string(),
  disclosureVersion: z.string().default("1.0"),
  termsVersion: z.string().default("1.0"),
  guidelinesVersion: z.string().default("1.0"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = consentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid consent payload" }, { status: 400 });
    }

    const { checkboxes, trustPledge, holdToken, disclosureVersion, termsVersion, guidelinesVersion } = parsed.data;

    // Verify all mandatory disclosures are checked
    const requiredCheckboxes = [
      "offlineOnly",
      "noOnlineFeatures",
      "onlyMyGames",
      "tagsMatter",
      "extraLaunchers",
      "setupWindows",
      "oneDevice",
      "sharedAccount",
      "platformRisk",
      "refundRules",
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
        { error: "The Trust Pledge is mandatory for subscription activation on Steamer" },
        { status: 400 }
      );
    }

    // Verify the slot reservation hold is valid and belongs to user
    const hold = await prisma.slotReservation.findFirst({
      where: {
        holdToken,
        userId: session.userId,
        status: "HOLD",
        expiresAt: { gt: new Date() },
      },
    });

    if (!hold) {
      return NextResponse.json(
        { error: "Your 30-minute slot hold has expired or is invalid. Please reserve a new slot." },
        { status: 408 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    // Save ConsentRecord
    const record = await prisma.consentRecord.create({
      data: {
        userId: session.userId,
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
        { userId: session.userId, documentSlug: "terms", version: termsVersion, ipAddress: ip, userAgent },
        { userId: session.userId, documentSlug: "disclosure", version: disclosureVersion, ipAddress: ip, userAgent },
        { userId: session.userId, documentSlug: "guidelines", version: guidelinesVersion, ipAddress: ip, userAgent },
      ],
    });

    return NextResponse.json({
      success: true,
      consentId: record.id,
    });
  } catch (error) {
    console.error("Consent recording error:", error);
    return NextResponse.json({ error: "Failed to record consent" }, { status: 500 });
  }
}

