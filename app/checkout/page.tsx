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
  FileText,
  Shield,
  Laptop,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();

  // Checkout phases: "CONSENT" -> "PAYMENT" -> "SUBMITTED"
  const [phase, setPhase] = useState<"CONSENT" | "PAYMENT" | "SUBMITTED">("CONSENT");

  // Cart & plan info
  const [cart, setCart] = useState<any[]>([]);
  const [isAllAccess, setIsAllAccess] = useState(false);
  const [deviceLabel, setDeviceLabel] = useState("Living Room PC");
  const [pricing, setPricing] = useState<any>(null);

  // Slot hold & status
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guest details state (if user is not signed in)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Single simplified agreement checkbox
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [verificationPin, setVerificationPin] = useState<string | null>(null);
  const [consentId, setConsentId] = useState<string | null>(null);

  // Order & UPI Payment details
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(300);
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

  // 1. Initial Load: Check Auth, Cart, and Pricing
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
          if (data.user.verificationPending?.code) {
            setVerificationPin(data.user.verificationPending.code);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

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

  const canProceed = agreedToTerms && deviceLabel.trim().length >= 2;

  // Step 2: Submit Simplified Consent -> Create UPI Order
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

    if (!canProceed) {
      setError("Please check the agreement box to accept terms and proceed.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Save Consent Record
      const consentRes = await fetch("/api/checkout/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepted: true,
          trustPledge: true,
          holdToken: holdToken || null,
          guestEmail: guestEmail.trim() || undefined,
          guestName: guestName.trim() || undefined,
          guestPhone: guestPhone.trim() || undefined,
        }),
      });

      const consentData = await consentRes.json();
      if (!consentRes.ok) {
        throw new Error(consentData.error || "Failed to record consent");
      }

      setConsentId(consentData.consentId);
      if (consentData.pin) {
        setVerificationPin(consentData.pin);
      }

      // 2. Create Order with UPI Dynamic QR
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameIds: cart.map((g) => g.id),
          isAllAccess,
          deviceLabel: deviceLabel.trim() || "My Gaming PC",
          consentId: consentData.consentId,
          holdToken: holdToken || null,
          guestEmail: guestEmail.trim() || undefined,
          guestName: guestName.trim() || undefined,
          guestPhone: guestPhone.trim() || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      setOrderId(orderData.order.orderId);
      setAmount(orderData.order.amount || 300);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Setup Guide Header */}
      <div className="bg-[#171a21] border border-[#2a475e] p-4 rounded-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#5ba32b]" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Lifetime PC Setup Guide & Vault Access (265+ Titles)
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

      {/* PHASE 1: SIMPLIFIED AGREEMENT DIALOG & SINGLE CHECKBOX */}
      {phase === "CONSENT" && (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-6 shadow-panelGlow">
          <div className="border-b border-[#2a475e]/60 pb-4 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              STEP 1: REVIEW PURCHASE TERMS & ACCESS PLEDGE
            </h2>
            <p className="text-xs text-[#8f98a0]">
              Please review all terms below and check the agreement box to proceed to secure UPI payment.
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
                  No password needed • Secret direct pass link delivered
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
                  WhatsApp Number (For instant PIN verification & 1-on-1 support)
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

          {/* Unified Terms & Purchase Disclosure Dialog / Container */}
          <div className="bg-[#121922] border border-[#2a475e] rounded-lg p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#66c0f4]" /> Steamer Access & Purchase Terms (All Included)
              </span>
              <span className="text-[10px] text-[#5ba32b] bg-[#5ba32b]/20 border border-[#5ba32b]/30 px-2 py-0.5 rounded font-bold">
                100% Protected
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto pr-2 space-y-3 text-xs text-[#c7d5e0] scrollbar-thin scrollbar-thumb-[#2a475e] scrollbar-track-transparent">
              <div className="p-2.5 bg-[#16202d] rounded border border-[#2a475e]/40 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">1.</span> Offline Play & Permanent Local Saves
                </p>
                <p className="text-[#8f98a0] text-[11px] leading-relaxed">
                  All games are downloaded/installed locally on your PC and run in offline mode. Your progress, save states, and campaign files remain permanently stored on your local drive.
                </p>
              </div>

              <div className="p-2.5 bg-[#16202d] rounded border border-[#2a475e]/40 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">2.</span> Full Vault Access (265+ PC Titles)
                </p>
                <p className="text-[#8f98a0] text-[11px] leading-relaxed">
                  Your ₹300 unlock grants lifetime access to our entire verified PC catalog of 265+ single-player blockbusters including Call of Duty, Spider-Man, Sekiro, Tekken, and more.
                </p>
              </div>

              <div className="p-2.5 bg-[#16202d] rounded border border-[#2a475e]/40 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">3.</span> Zero Queues & Independent Personal Setup
                </p>
                <p className="text-[#8f98a0] text-[11px] leading-relaxed">
                  No queue waiting and no shared login credentials with other players. You follow the guided visual walkthrough to configure the launcher on your own PC.
                </p>
              </div>

              <div className="p-2.5 bg-[#16202d] rounded border border-[#2a475e]/40 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">4.</span> 48-Hour 100% Money-Back Guarantee
                </p>
                <p className="text-[#8f98a0] text-[11px] leading-relaxed">
                  If you cannot get the setup working on your PC, you receive a full 100% refund within 48 hours of purchase. Zero questions asked.
                </p>
              </div>

              <div className="p-2.5 bg-[#16202d] rounded border border-[#2a475e]/40 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">5.</span> Direct 1-on-1 WhatsApp Support
                </p>
                <p className="text-[#8f98a0] text-[11px] leading-relaxed">
                  Our team is available on WhatsApp daily (10:00 AM – 11:00 PM IST) to assist with any questions, verify your PIN, and ensure smooth installation.
                </p>
              </div>

              <div className="p-2.5 bg-[#16202d] rounded border border-[#2a475e]/40 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">6.</span> Legal Terms & Fair-Play Pledge
                </p>
                <p className="text-[#8f98a0] text-[11px] leading-relaxed">
                  Subject to Steamer&apos;s{" "}
                  <Link href="/legal/terms" target="_blank" className="text-[#66c0f4] underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" target="_blank" className="text-[#66c0f4] underline">
                    Privacy Policy
                  </Link>
                  . Users agree to keep the client offline and use their access link responsibly.
                </p>
              </div>
            </div>
          </div>

          {/* Device Label Registration */}
          <div className="bg-[#16202d] border border-[#2a475e] p-4 rounded-lg space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#66c0f4]" /> Primary Gaming PC Label:
            </label>
            <input
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              placeholder="e.g. My Gaming Rig / Windows 11 Laptop"
              className="w-full bg-[#171a21] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
            />
          </div>

          {/* SINGLE CONSOLIDATED ACCEPTANCE CHECKBOX */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-[#16202d] to-sky-950/70 border border-emerald-500/50 p-5 rounded-lg space-y-2 shadow-sm">
            <label className="flex items-start gap-3.5 cursor-pointer text-xs text-white leading-relaxed select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-emerald-500 text-emerald-500 focus:ring-0 bg-[#121922] w-5 h-5 flex-shrink-0 cursor-pointer"
              />
              <span className="font-semibold">
                I have read, understood, and accept all the conditions above — including <strong>Offline Play requirements</strong>, <strong>265+ Vault Access</strong>, the <strong>Steamer Fair-Play Pledge</strong>, and the <strong>48-Hour Money-Back Guarantee</strong>.
              </span>
            </label>
          </div>

          {/* Action to proceed to UPI payment */}
          <button
            onClick={handleProceedToPayment}
            disabled={!canProceed || loading}
            className="w-full btn-steam-cta py-3.5 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Preparing Payment..." : "Proceed to UPI Payment (₹300)"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PHASE 2: UPI PAYMENT & UTR SUBMISSION */}
      {phase === "PAYMENT" && (
        <div className="space-y-6">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-6 shadow-panelGlow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                  Order #{orderId}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-1">
                  PAY ₹{amount} VIA UPI
                </h2>
                <p className="text-xs text-[#8f98a0]">
                  Scan QR code with any UPI app (GPay, PhonePe, Paytm, BHIM, CRED)
                </p>
              </div>

              {verificationPin && (
                <div className="p-3 bg-[#121922] border border-[#66c0f4]/40 rounded-lg text-right">
                  <span className="text-[10px] uppercase font-bold text-[#8f98a0] block">Your Verification PIN</span>
                  <span className="text-base font-black font-mono text-[#66c0f4]">{verificationPin}</span>
                </div>
              )}
            </div>

            {/* QR Code & UPI Deep Link Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#121922] border border-[#2a475e] p-6 rounded-xl">
              <div className="flex flex-col items-center justify-center space-y-3">
                {qrDataUrl ? (
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    <img
                      src={qrDataUrl}
                      alt="UPI Payment QR Code"
                      width={220}
                      height={220}
                      className="rounded"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-[#171a21] rounded-xl flex items-center justify-center border border-[#2a475e]">
                    <QrCode className="w-12 h-12 text-[#8f98a0]" />
                  </div>
                )}
                <span className="text-[11px] text-[#8f98a0] font-mono">Scan with any UPI App</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[#8f98a0] text-[10px] uppercase font-bold block">UPI ID / VPA</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={vpa}
                      className="bg-[#171a21] border border-[#2a475e] rounded px-3 py-2 text-white font-mono text-xs flex-1 select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(vpa);
                        setCopiedVpa(true);
                        setTimeout(() => setCopiedVpa(false), 2000);
                      }}
                      className="btn-steam-panel px-3 py-2 rounded text-xs font-bold border border-[#2a475e] flex items-center gap-1"
                    >
                      {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedVpa ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8f98a0] text-[10px] uppercase font-bold block">Payee Name</span>
                  <p className="text-white font-bold bg-[#171a21] border border-[#2a475e] rounded px-3 py-2">
                    {payeeName || "Steamer Services"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8f98a0] text-[10px] uppercase font-bold block">Amount to Pay</span>
                  <p className="text-emerald-400 font-black text-lg bg-[#171a21] border border-[#2a475e] rounded px-3 py-1.5 font-mono">
                    ₹{amount} (Flat One-Time)
                  </p>
                </div>

                {upiDeepLink && (
                  <a
                    href={upiDeepLink}
                    className="sm:hidden block text-center btn-steam-cta py-2.5 rounded font-bold text-xs"
                  >
                    Tap to Open UPI App
                  </a>
                )}
              </div>
            </div>

            {/* Step 2 Form: Enter 12-digit UTR */}
            <form onSubmit={handleSubmitPayment} className="space-y-4 pt-4 border-t border-[#2a475e]/60">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#5ba32b]" /> Submit Payment Confirmation
                </h3>
                <p className="text-xs text-[#8f98a0]">
                  After paying in your UPI app, find the 12-digit <strong>UTR / UPI Ref Number</strong> in your transaction receipt and enter it below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">
                    12-Digit UPI Transaction ID (UTR) *
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 512345678901"
                    required
                    className="w-full bg-[#121922] border border-[#2a475e] rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#66c0f4]"
                  />
                  <p className="text-[10px] text-[#8f98a0]">Must be exactly 12 numeric digits.</p>
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
                    className="w-full bg-[#121922] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
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
            {verificationPin && (
              <div className="flex justify-between border-b border-[#2a475e]/40 pb-2">
                <span className="text-[#8f98a0]">Verification PIN:</span>
                <span className="font-mono text-[#66c0f4] font-bold">{verificationPin}</span>
              </div>
            )}
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
            <a
              href={`https://wa.me/919936929997?text=${encodeURIComponent(
                `Hi Steamer Support! I have completed payment for Order ${orderId}.${
                  verificationPin ? ` My verification PIN is ${verificationPin}.` : ""
                } UTR: ${utr}. Please verify and activate my pass.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-steam-panel px-6 py-2.5 rounded text-xs font-bold border border-[#2a475e] flex items-center gap-1.5 text-white"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25d366]" /> Share PIN & UTR on WhatsApp for Instant Approval
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
