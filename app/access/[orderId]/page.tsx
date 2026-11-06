"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  Gamepad2,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  ZoomIn,
  X,
  MousePointerClick,
  Shield,
  ExternalLink,
  Lock,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { GuideConfig, DEFAULT_GUIDE_CONFIG, GuideStep } from "@/lib/guide";
import GuideVideoPlayer from "@/components/GuideVideoPlayer";
import AntiScreenshotShield from "@/components/AntiScreenshotShield";

export default function OrderAccessPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Set password state for guest buyers
  const [password, setPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [accountCreatedMsg, setAccountCreatedMsg] = useState<string | null>(null);

  const fetchOrderAccess = async () => {
    try {
      const res = await fetch(`/api/orders/access/${orderId}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.error || "Order not found");
      }
    } catch {
      setError("Failed to load order access");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAccess();
    // Auto-refresh every 15 seconds if payment is submitted but pending verification
    const interval = setInterval(() => {
      fetchOrderAccess();
    }, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleClaimAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setPasswordSubmitting(true);
    try {
      const res = await fetch(`/api/orders/access/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (res.ok) {
        setAccountCreatedMsg("Account created! You can now log in with your email anytime.");
        fetchOrderAccess();
      } else {
        alert(result.error || "Failed to create account");
      }
    } catch {
      alert("Error creating account");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
        <p className="text-xs text-[#8f98a0]">Loading your Steamer Access Pass...</p>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-white">Order Not Found</h1>
        <p className="text-xs text-[#8f98a0]">
          We could not find an order matching #{orderId}. If you just made a payment, please message us on WhatsApp with your UTR.
        </p>
        <Link href="/" className="btn-steam-panel px-4 py-2 rounded text-xs font-bold inline-block">
          Return to Store
        </Link>
      </div>
    );
  }

  const { order, isVerified, guide } = data;
  const guideConfig: GuideConfig = guide || DEFAULT_GUIDE_CONFIG;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
      {/* Top Order Information Banner */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-panelGlow">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2a475e] text-white px-2 py-0.5 rounded">
              Order #{order.orderId}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                isVerified
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                  : "bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse"
              }`}
            >
              {isVerified ? "Verified & Active" : "Pending Admin Verification"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            {order.user.displayName?.toUpperCase()} &apos;S SETUP PASS
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Registered Contact: <strong className="text-white">{order.user.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/support"
            className="btn-steam-panel text-xs px-4 py-2 rounded font-bold border border-[#2a475e] flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#25d366]" /> Live Support
          </Link>
        </div>
      </div>

      {isVerified ? (
        /* UNLOCKED VIEW: THE SETUP GUIDE */
        <AntiScreenshotShield
          enabled={guideConfig.protection?.antiScreenshot ?? true}
          watermarkText={`${order.user.email} • ORD #${order.orderId}`}
        >
          <div className="space-y-8 relative">
            {/* Guide Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-[#16202d] to-sky-950/80 border border-emerald-500/40 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                    Lifetime Pass Unlocked
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#66c0f4]/20 text-[#66c0f4] border border-[#66c0f4]/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Protected Walkthrough
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {guideConfig.title || "Complete PC Setup Guide"}
                </h2>
                <p className="text-xs text-[#c7d5e0]">
                  {guideConfig.description ||
                    "Follow the step-by-step instructions below to configure and play your titles."}
                </p>
              </div>

              <div className="text-xs text-right text-emerald-300 bg-[#16202d] p-3 rounded-lg border border-emerald-500/30">
                <p className="font-bold">Bookmark This Page</p>
                <p className="text-[10px] text-[#8f98a0]">Direct lifetime access link</p>
              </div>
            </div>

            {/* Optional: Claim to Permanent Account */}
            {order.user.isGuest && (
              <div className="bg-[#171a21] border border-[#66c0f4]/40 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#66c0f4]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Optional: Save to Permanent Account
                  </h3>
                </div>
                <p className="text-xs text-[#8f98a0]">
                  You checked out as a guest. Set a password below if you want to log in anytime with <strong>{order.user.email}</strong>.
                </p>
                {accountCreatedMsg ? (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{accountCreatedMsg}</span>
                  </div>
                ) : (
                  <form onSubmit={handleClaimAccount} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="password"
                      placeholder="Choose a secure password (min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white flex-1 focus:outline-none focus:border-[#66c0f4]"
                    />
                    <button
                      type="submit"
                      disabled={passwordSubmitting}
                      className="btn-steam-cta text-xs px-5 py-2 rounded font-bold text-white shadow-ctaGlow disabled:opacity-50"
                    >
                      {passwordSubmitting ? "Creating..." : "Set Password"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Video Walkthrough Player */}
            {guideConfig.videoUrl && (
              <div className="space-y-2">
                <GuideVideoPlayer
                  videoUrl={guideConfig.videoUrl}
                  title={guideConfig.videoTitle || "Step-by-Step Video Walkthrough"}
                  watermarkText={`${order.user.email} • ORD #${order.orderId}`}
                />
              </div>
            )}

            {/* Click-by-Click Guide Steps */}
            <div className="space-y-8">
              {guideConfig.steps.map((step: GuideStep) => (
                <div
                  key={step.id || step.stepNumber}
                  className="bg-[#171a21] border border-[#2a475e] hover:border-[#66c0f4]/60 transition-all rounded-xl p-6 sm:p-8 space-y-6 shadow-panelGlow relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#66c0f4] to-[#1b2838] border border-[#66c0f4]/60 text-white font-black flex items-center justify-center text-lg shadow-md flex-shrink-0">
                        {step.stepNumber}
                      </span>
                      <div>
                        <h3 className="font-black text-white text-lg sm:text-xl tracking-wide">
                          {step.title}
                        </h3>
                        {step.subtitle && (
                          <p className="text-xs font-semibold text-[#66c0f4] uppercase tracking-wider">
                            {step.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-[#8f98a0] bg-[#16202d] border border-[#2a475e]/60 px-2.5 py-1 rounded hidden sm:inline-block">
                      Step {step.stepNumber} of {guideConfig.steps.length}
                    </span>
                  </div>

                  <div className="text-sm text-[#c7d5e0] leading-relaxed whitespace-pre-line font-normal">
                    {step.instructions}
                  </div>

                  {step.clickHighlight && (
                    <div className="bg-[#16202d] border-l-4 border-amber-400 p-4 rounded-r-lg flex items-start gap-3">
                      <MousePointerClick className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                          Exact Click Action:
                        </p>
                        <p className="text-xs text-white font-medium">
                          {step.clickHighlight}
                        </p>
                      </div>
                    </div>
                  )}

                  {step.imageUrl && (
                    <div className="space-y-2">
                      <div className="relative group rounded-lg overflow-hidden border border-[#2a475e] bg-[#0e141b] shadow-inner">
                        <img
                          src={step.imageUrl}
                          alt={step.title}
                          className="w-full h-auto max-h-[500px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = "0.4";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImage(step.imageUrl || null)}
                          className="absolute bottom-3 right-3 bg-[#171a21]/90 hover:bg-[#66c0f4] hover:text-[#171a21] text-white border border-[#2a475e] px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-md"
                        >
                          <ZoomIn className="w-3.5 h-3.5" /> Enlarge Screenshot
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AntiScreenshotShield>
      ) : (
        /* PENDING VERIFICATION VIEW */
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-8 sm:p-12 text-center space-y-6 shadow-xl max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Payment Verification In Progress
            </h2>
            <p className="text-sm text-[#8f98a0] max-w-md mx-auto leading-relaxed">
              We received your payment details for Order <strong>#{order.orderId}</strong>. Our admin is verifying the UPI transaction.
            </p>
          </div>

          <div className="p-4 bg-[#16202d] border border-[#2a475e] rounded-lg max-w-md mx-auto text-xs text-[#c7d5e0] space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-[#8f98a0]">Plan:</span>
              <strong className="text-white">₹300 Lifetime All-Access Setup</strong>
            </div>
            {order.utr && (
              <div className="flex justify-between">
                <span className="text-[#8f98a0]">Submitted UTR:</span>
                <strong className="text-emerald-400 font-mono">{order.utr}</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#8f98a0]">Status:</span>
              <span className="text-amber-400 font-bold">Verification Pending</span>
            </div>
          </div>

          <p className="text-xs text-[#8f98a0]">
            ⚡ This page automatically refreshes and will unlock the complete walkthrough as soon as payment is confirmed.
          </p>

          <div className="pt-2">
            <Link
              href="/support"
              className="btn-steam-cta text-xs px-6 py-3 rounded-lg font-bold inline-flex items-center gap-2 text-white shadow-ctaGlow"
            >
              <MessageSquare className="w-4 h-4 text-[#25d366]" /> Chat with Admin on WhatsApp for Instant Activation
            </Link>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-[#66c0f4] text-white hover:text-black p-2 rounded-full transition-all z-10"
              title="Close Image"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged guide step"
              className="w-full h-auto max-h-[85vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

