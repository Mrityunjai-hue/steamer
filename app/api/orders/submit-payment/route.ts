import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    // Support guest orders or authenticated users

    // Support FormData for optional screenshot file or JSON
    const contentType = req.headers.get("content-type") || "";
    let orderId = "";
    let utr = "";
    let payerName = "";
    let screenshotPath: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      orderId = (formData.get("orderId") as string) || "";
      utr = (formData.get("utr") as string) || "";
      payerName = (formData.get("payerName") as string) || "";
      const file = formData.get("screenshot") as File | null;

      if (file && file.size > 0) {
        if (file.size > 3 * 1024 * 1024) {
          return NextResponse.json({ error: "Screenshot must be less than 3 MB" }, { status: 400 });
        }
        // Save file securely to uploads/payments/
        const fs = await import("fs");
        const path = await import("path");
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${orderId}_${Date.now()}.png`;
        const uploadDir = path.join(process.cwd(), "uploads", "payments");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        screenshotPath = `/uploads/payments/${fileName}`;
      }
    } else {
      const body = await req.json();
      orderId = body.orderId || "";
      utr = body.utr || "";
      payerName = body.payerName || "";
      screenshotPath = body.screenshotPath || null;
    }

    // 12-digit numeric validation for UPI UTR
    const cleanedUtr = utr.trim().replace(/\D/g, "");
    if (cleanedUtr.length !== 12) {
      return NextResponse.json(
        { error: "Please enter a valid 12-digit numeric UPI Transaction ID (UTR)" },
        { status: 400 }
      );
    }

    if (!payerName.trim()) {
      return NextResponse.json({ error: "Please enter your name as displayed in your UPI app" }, { status: 400 });
    }

    // Check duplicate UTR
    const existingUtr = await prisma.paymentSubmission.findUnique({
      where: { utr: cleanedUtr },
    });

    if (existingUtr) {
      return NextResponse.json(
        { error: "This UPI UTR reference has already been submitted. Duplicate submissions are not permitted." },
        { status: 409 }
      );
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (session && order.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized access to this order" }, { status: 403 });
    }

    if (order.status === "ACTIVE" || order.status === "VERIFIED") {
      return NextResponse.json({ error: "Order has already been verified" }, { status: 400 });
    }

    // Extend slot hold timer by 3 hours for admin verification per Addendum 2f
    const newExpiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      // Create payment submission record
      await tx.paymentSubmission.create({
        data: {
          orderId: order.orderId,
          utr: cleanedUtr,
          payerName: payerName.trim(),
          screenshotPath,
        },
      });

      // Update order status
      await tx.order.update({
        where: { orderId: order.orderId },
        data: {
          status: "PAYMENT_SUBMITTED",
          expiresAt: newExpiresAt,
        },
      });

      // Extend active user slot hold
      await tx.slotReservation.updateMany({
        where: { userId: order.userId, status: "HOLD" },
        data: { expiresAt: newExpiresAt },
      });

      // Create Admin Task
      await tx.adminTask.create({
        data: {
          type: "CREDENTIAL_RELAY",
          subject: `Verify UPI Payment: Order ${order.orderId} (₹${order.amount}, UTR: ${cleanedUtr})`,
          detailsJson: JSON.stringify({
            orderId: order.orderId,
            userId: order.userId,
            amount: order.amount,
            utr: cleanedUtr,
            payerName: payerName.trim(),
            submittedAt: new Date().toISOString(),
          }),
          dueAt: newExpiresAt,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully submitted. Your slot is held while admin confirms your UPI transfer.",
      orderId: order.orderId,
      status: "PAYMENT_SUBMITTED",
    });
  } catch (error) {
    console.error("Payment submission error:", error);
    return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 });
  }
}

