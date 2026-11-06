"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  QrCode,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ExternalLink,
  User,
  Key,
  MessageSquare,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();

  // Checkout phases: "HOLD" -> "CONSENT" -> "PAYMENT" -> "SUBMITTED"
  const [phase, setPhase] = useState<"HOLD" | "CONSENT" | "PAYMENT" | "SUBMITTED">("HOLD");

  // Cart & plan info
  const [cart, setCart] = useState<any[]>([]);
  const [isAllAccess, setIsAllAccess] = useState(false);
  const [deviceLabel, setDeviceLabel] = useState("Living Room PC");
  const [pricing, setPricing] = useState<any>(null);

  // Slot hold state
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [minutesRemaining, setMinutesRemaining] = useState<number>(30);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guest details state (if user is not signed in)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // 10 Mandatory Disclosure checkboxes (UNTICKED by default)
  const [checkboxes, setCheckboxes] = useState({
    offlinePlay: false,
    personalPcSetup: false,
    noAccountQueues: false,
    allAccessCatalog: false,
    systemRequirements: false,
    noOnlineMultiplayer: false,
    whatsappSupport: false,
    refundGuarantee: false,
    termsAndPrivacy: false,
    finalAccept: false,
  });

  // Separate Trust Pledge checkbox (required)
  const [trustPledge, setTrustPledge] = useState(false);
  const [consentId, setConsentId] = useState<string | null>(null);

  // Order & Addendum 6 UPI Payment details
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [upiDeepLink, setUpiDeepLink] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [vpa, setVpa] = useState<string>("");
  const [payeeName, setPayeeName] = useState<string>("");

  // "I have paid" form fields
  const [utr, setUtr] = useState("");
  const [payerName, setPayerName] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // 1. Initial Load: Check Auth, Cart, and Reserve Slot Hold
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("steamer_cart") || "[]");
    setCart(savedCart);

    // Check if user is logged in
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          setGuestEmail(data.user.email || "");
          setGuestName(data.user.displayName || data.user.email?.split("@")[0] || "");
          setGuestPhone(data.user.whatsappNumber || "");
        }
      })
      .catch(() => {});

    // Set phase to CONSENT directly (user cap removed for Setup Guide)
    setPhase("CONSENT");
    setLoading(false);

    // Calculate official pricing (₹300 flat)
    fetch("/api/cart/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameIds: [], isAllAccess: true }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.pricing) setPricing(data.pricing);
      });
  }, []);

  const handleCheckboxToggle = (key: keyof typeof checkboxes) => {
    setCheckboxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allCheckboxesTicked =
    Object.values(checkboxes).every(Boolean) && trustPledge && deviceLabel.trim().length >= 2;

  // Step 2: Submit Disclosure & Trust Pledge Consent -> Create UPI Order
  const handleProceedToPayment = async () => {
    if (!currentUser) {
      if (!guestEmail.trim() || !guestEmail.includes("@")) {
        setError("Please enter a valid email address so we can deliver your access link.");
        return;
      }
      if (!guestName.trim()) {
        setError("Please enter your name or gamer tag.");
        return;
      }
    }

    if (!allCheckboxesTicked) return;

    setError(null);
    setLoading(true);

    try {
      // 1. Save Consent Record
      const consentRes = await fetch("/api/checkout/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkboxes,
          trustPledge,
          holdToken,
          guestEmail: guestEmail.trim(),
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
        }),
      });

      const consentData = await consentRes.json();
      if (!consentRes.ok) {
        throw new Error(consentData.error || "Failed to record consent");
      }

      setConsentId(consentData.consentId);

      // 2. Create Order with Addendum 6 UPI Dynamic QR
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameIds: cart.map((g) => g.id),
          isAllAccess,
          deviceLabel,
          consentId: consentData.consentId,
          holdToken,
          guestEmail: guestEmail.trim(),
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      setOrderId(orderData.order.orderId);
      setAmount(orderData.order.amount);
      setUpiDeepLink(orderData.order.upiDeepLink);
      setQrDataUrl(orderData.order.qrDataUrl);
      setVpa(orderData.order.vpa);
      setPayeeName(orderData.order.payeeName);
      setPhase("PAYMENT");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit UTR & "I have paid" Form
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    if (utr.trim().replace(/\D/g, "").length !== 12) {
      setError("Please enter a valid 12-digit numeric UPI Transaction ID (UTR)");
      return;
    }

    if (!payerName.trim()) {
      setError("Please enter your name as shown on your UPI app");
      return;
    }

    setError(null);
    setSubmittingPayment(true);

    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("utr", utr.trim());
      formData.append("payerName", payerName.trim());
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const res = await fetch("/api/orders/submit-payment", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment submission failed");
      }

      // Clear cart
      localStorage.removeItem("steamer_cart");
      window.dispatchEvent(new Event("cartUpdated"));
      setPhase("SUBMITTED");
    } catch (err: any) {
      setError(err.message || "Failed to submit payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Full / Waitlist view
  if (isFull) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">ALL RENTAL SLOTS ARE FULL</h1>
        <p className="text-sm text-[#8f98a0] leading-relaxed">
          To maintain strict platform stability and avoid platform restrictions, Steamer caps concurrent active renters. All slots are currently occupied.
        </p>
        <button
          onClick={async () => {
            const res = await fetch("/api/waitlist/join", { method: "POST" });
            const data = await res.json();
            alert(data.message || "Added to waitlist!");
          }}
          className="btn-steam-cta px-6 py-3 rounded text-sm font-bold shadow-ctaGlow"
        >
          Join Priority Waitlist (FCFS)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Setup Guide Header */}
      <div className="bg-[#171a21] border border-[#2a475e] p-4 rounded-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#5ba32b]" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Lifetime PC Setup Guide & Vault Access (245+ Titles)
            </h3>
            <p className="text-[11px] text-[#8f98a0]">
              One-Time Payment · Permanent Personal PC Offline Setup · Zero Recurring Fees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#16202d] border border-[#2a475e] px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-[#5ba32b]">
          <CheckCircle2 className="w-4 h-4 text-[#5ba32b]" />
          <span>Flat ₹300 Total</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-xs text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* PHASE 1: DISCLOSURE & TRUST PLEDGE CHECKLIST */}
      {phase === "CONSENT" && (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-6 shadow-panelGlow">
          <div className="border-b border-[#2a475e]/60 pb-4 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              STEP 1: READ BEFORE YOU BUY & TRUST PLEDGE
            </h2>
            <p className="text-xs text-[#8f98a0]">
              Disclosure Version 1.0 · Every point must be individually reviewed and accepted.
            </p>
          </div>

          {/* Contact Details Card */}
          <div className="bg-[#16202d] border border-[#2a475e] p-5 rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a475e]/60 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#66c0f4]" /> Contact Information (Pass Delivery)
              </h3>
              {currentUser ? (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Logged in as {currentUser.email}
                </span>
              ) : (
                <span className="text-[10px] text-[#8f98a0]">
                  No password needed • Direct secret access link generated
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-white block">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  disabled={!!currentUser}
                  className="w-full bg-[#121922] border border-[#2a475e] rounded p-2 text-white disabled:opacity-60 focus:outline-none focus:border-[#66c0f4]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">Your Name / Gamer Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul S."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#121922] border border-[#2a475e] rounded p-2 text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-white block">
                  WhatsApp Number (Optional — For instant approval updates)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-[#121922] border border-[#2a475e] rounded p-2 text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>
            </div>
          </div>

          {/* 10 Individual Checkboxes */}
          <div className="space-y-3.5 text-xs text-[#c7d5e0]">
            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.offlinePlay}
                onChange={() => handleCheckboxToggle("offlinePlay")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>Offline Play:</strong> I understand all games are downloaded/installed locally and played in <strong>Offline Mode</strong> with permanent local save files on my PC.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.personalPcSetup}
                onChange={() => handleCheckboxToggle("personalPcSetup")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>Personal PC Setup:</strong> I will follow the visual, click-by-click walkthrough to configure the launcher tool and add titles directly to my library.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.noAccountQueues}
                onChange={() => handleCheckboxToggle("noAccountQueues")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>Zero Account Sharing or Queues:</strong> I understand this pass gives me direct, independent access on my PC without waiting in queues or sharing logins with other users.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.allAccessCatalog}
                onChange={() => handleCheckboxToggle("allAccessCatalog")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>All-Access Vault (245+ Titles):</strong> I understand my ₹300 pass unlocks access to all 245+ verified PC titles in the Steamer offline catalog.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.systemRequirements}
                onChange={() => handleCheckboxToggle("systemRequirements")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>System Compatibility:</strong> I confirm my computer meets basic system requirements (Windows 10/11 64-bit with adequate disk space for game downloads).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.noOnlineMultiplayer}
                onChange={() => handleCheckboxToggle("noOnlineMultiplayer")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>No Online Multiplayer:</strong> I understand that single-player offline gaming does not include live competitive multiplayer servers or online ranked leaderboards.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.whatsappSupport}
                onChange={() => handleCheckboxToggle("whatsappSupport")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>Direct WhatsApp Support:</strong> I understand I have access to dedicated 1-on-1 assistance via WhatsApp for any installation or setup questions.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.refundGuarantee}
                onChange={() => handleCheckboxToggle("refundGuarantee")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>48-Hour Money-Back Guarantee:</strong> I have read the policy: 100% full refund within 48 hours if setup cannot be completed on my PC.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.termsAndPrivacy}
                onChange={() => handleCheckboxToggle("termsAndPrivacy")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>Terms and Privacy:</strong> I have read and accept the{" "}
                <Link href="/legal/terms" target="_blank" className="text-[#66c0f4] underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" target="_blank" className="text-[#66c0f4] underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded hover:bg-[#16202d] transition-colors">
              <input
                type="checkbox"
                checked={checkboxes.finalAccept}
                onChange={() => handleCheckboxToggle("finalAccept")}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span className="font-bold text-white">
                Final: I confirm all details are correct and accept all terms above.
              </span>
            </label>
          </div>

          {/* Device Label Registration */}
          <div className="bg-[#16202d] border border-[#2a475e] p-4 rounded-lg space-y-2">
            <label className="text-xs font-bold text-white block">
              Register Device Label (e.g. &quot;My Main Gaming PC&quot;):
            </label>
            <input
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              placeholder="e.g. Living Room Gaming Rig"
              className="w-full bg-[#171a21] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
            />
            <p className="text-[10px] text-[#8f98a0]">
              Register your primary gaming rig for convenient device identification and support.
            </p>
          </div>

          {/* Mandatory Trust Pledge Box */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-[#16202d] to-sky-950/60 border border-emerald-500/50 p-5 rounded-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> THE STEAMER FAIR-PLAY PLEDGE (MANDATORY)
            </h4>
            <label className="flex items-start gap-3 cursor-pointer text-xs text-white leading-relaxed">
              <input
                type="checkbox"
                checked={trustPledge}
                onChange={(e) => setTrustPledge(e.target.checked)}
                className="mt-1 rounded border-emerald-500 text-emerald-500 focus:ring-0 bg-[#16202d] w-4 h-4"
              />
              <span>
                <strong>
                  &quot;Steamer is built on fair play and gamer trust. I will follow the guided setup instructions, keep my game client offline for offline play, and use my access link responsibly on my PC. I understand the 48-Hour Guarantee protects my purchase.&quot;
                </strong>
              </span>
            </label>
          </div>

          {/* Action to proceed to UPI payment */}
          <button
            onClick={handleProceedToPayment}
            disabled={!allCheckboxesTicked || loading}
            className="w-full btn-steam-cta py-3.5 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Recording Consent..." : "Proceed to UPI Payment"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PHASE 2: ADDENDUM 6 UPI DIRECT PAYMENT SCREEN */}
      {phase === "PAYMENT" && (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-8 shadow-panelGlow">
          <div className="border-b border-[#2a475e]/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                STEP 2: DIRECT UPI TRANSFER
              </h2>
              <p className="text-xs text-[#8f98a0]">
                Zero payment gateway fees. Transfer rent directly to owner via any UPI app.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-[#8f98a0] block">Order ID</span>
              <strong className="text-sm font-mono text-[#66c0f4]">{orderId}</strong>
            </div>
          </div>

          {/* QR Code and Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Dynamic QR Code */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#16202d] border border-[#2a475e] rounded-xl text-center space-y-4">
              <div className="p-3 bg-white rounded-lg shadow-md">
                {qrDataUrl ? (
                  <Image src={qrDataUrl} alt="UPI Payment QR Code" width={220} height={220} priority />
                ) : (
                  <div className="w-[220px] h-[220px] bg-slate-200 flex items-center justify-center text-xs text-black">
                    Generating UPI QR...
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[#8f98a0]">Exact Amount to Pay:</span>
                <div className="text-3xl font-black text-[#5ba32b]">₹{amount}</div>
              </div>
              {/* Deep Link Button for Mobile */}
              <a
                href={upiDeepLink}
                className="w-full btn-steam-accent py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Pay with UPI App (GPay/PhonePe/Paytm)
              </a>
            </div>

            {/* Right: Payment Instructions & VPA Copy */}
            <div className="space-y-5 text-xs text-[#c7d5e0]">
              <div className="bg-[#16202d] border border-[#2a475e] p-4 rounded-lg space-y-3">
                <span className="text-[11px] font-bold uppercase text-[#8f98a0] block">
                  Official UPI VPA Details
                </span>
                <div className="flex items-center justify-between bg-[#171a21] border border-[#2a475e]/80 p-2.5 rounded font-mono">
                  <span className="text-white font-bold">{vpa}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(vpa);
                      setCopiedVpa(true);
                      setTimeout(() => setCopiedVpa(false), 2000);
                    }}
                    className="text-[#66c0f4] hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedVpa ? <Check className="w-3.5 h-3.5 text-[#5ba32b]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedVpa ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="text-[11px] text-[#8f98a0]">
                  <span>Payee Name: </span>
                  <strong className="text-white">{payeeName}</strong>
                </div>
              </div>

              <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-lg space-y-1.5 text-amber-200">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Crucial Instruction:
                </p>
                <p className="leading-relaxed">
                  Put your Order ID <strong className="font-mono text-white underline">{orderId}</strong> in the payment note/remarks of your UPI app. After completing the payment, copy the 12-digit UPI UTR number and submit below.
                </p>
              </div>
            </div>
          </div>

          {/* "I Have Paid" Form */}
          <form onSubmit={handleSubmitPayment} className="border-t border-[#2a475e]/60 pt-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              STEP 3: SUBMIT YOUR PAYMENT DETAILS (&quot;I HAVE PAID&quot;)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  UPI Transaction ID / UTR (12 Digits) *
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 431289567123"
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#66c0f4]"
                />
                <p className="text-[10px] text-[#8f98a0]">
                  Found under transaction details in Google Pay, PhonePe, or Paytm.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  Your Name on UPI App *
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>
            </div>

            {/* Optional Screenshot */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#c7d5e0] block">
                Payment Screenshot (Optional, Max 3MB)
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#8f98a0] file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#2a475e] file:text-white hover:file:bg-[#3a6282] cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={submittingPayment || utr.length !== 12 || !payerName.trim()}
              className="w-full btn-steam-cta py-3.5 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submittingPayment ? "Submitting Payment..." : "I Have Paid — Submit for Admin Verification"}
            </button>
          </form>
        </div>
      )}

      {/* PHASE 3: SUBMITTED CONFIRMATION */}
      {phase === "SUBMITTED" && (
        <div className="bg-[#171a21] border border-emerald-500/40 rounded-xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#5ba32b]/20 text-[#5ba32b] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              PAYMENT SUBMITTED SUCCESSFULLY!
            </h2>
            <p className="text-xs text-[#8f98a0] max-w-md mx-auto">
              Your 12-digit UTR has been logged. Your Setup Pass has been generated and will unlock immediately upon admin verification.
            </p>
          </div>

          <div className="bg-[#16202d] border border-[#2a475e] p-5 rounded-lg max-w-md mx-auto text-xs text-[#c7d5e0] space-y-2 text-left">
            <div className="flex justify-between border-b border-[#2a475e]/40 pb-2">
              <span className="text-[#8f98a0]">Order ID:</span>
              <strong className="font-mono text-white">{orderId}</strong>
            </div>
            <div className="flex justify-between border-b border-[#2a475e]/40 pb-2">
              <span className="text-[#8f98a0]">UTR Reference:</span>
              <span className="font-mono text-emerald-400 font-bold">{utr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8f98a0]">Status:</span>
              <span className="text-amber-400 font-bold">Verification Pending</span>
            </div>
          </div>

          {/* Secret Access Pass Card */}
          <div className="bg-gradient-to-r from-sky-950/60 to-emerald-950/60 border border-[#66c0f4]/40 p-4 rounded-lg max-w-md mx-auto space-y-2 text-left">
            <p className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#66c0f4]" /> Your Secret Guide Access Link:
            </p>
            <p className="text-[11px] text-[#8f98a0]">
              Bookmark this link to access your unlocked setup guide and videos anytime:
            </p>
            <Link
              href={`/access/${orderId}`}
              className="text-xs text-[#66c0f4] hover:underline font-mono break-all block bg-[#121922] p-2.5 rounded border border-[#2a475e]"
            >
              /access/{orderId} &rarr;
            </Link>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/access/${orderId}`} className="btn-steam-cta px-6 py-2.5 rounded text-xs font-bold shadow-ctaGlow">
              Open My Setup Pass Link &rarr;
            </Link>
            <Link href="/support" className="btn-steam-panel px-6 py-2.5 rounded text-xs font-bold border border-[#2a475e] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#25d366]" /> Chat on WhatsApp for Instant Approval
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

