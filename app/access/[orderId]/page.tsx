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
  AlertTriangle,
  ArrowRight,
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

  // Setup completion & timer state
  const [completing, setCompleting] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState(false);
  const [showNavLockModal, setShowNavLockModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

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
        if (json.remainingSeconds !== undefined) {
          setRemainingTime(json.remainingSeconds);
        }
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
    // Auto-refresh every 20 seconds while unverified
    const interval = setInterval(() => {
      if (!data?.isVerified) {
        fetchOrderAccess();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [orderId, data?.isVerified]);

  // Live countdown timer
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) return;
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          fetchOrderAccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingTime]);

  const isSetupActive =
    data?.isVerified &&
    !data?.isCompleted &&
    !completeSuccess &&
    !data?.isExpired &&
    data?.windowStatus === "ACTIVE";

  // Navigation Lock: Prevent navigating away until "Process Completed" is confirmed
  useEffect(() => {
    if (!isSetupActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Setup in progress! You must click 'Process Completed' to finalize your setup before leaving.";
      return e.returnValue;
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      // Intercept and prevent navigation to external pages
      e.preventDefault();
      e.stopPropagation();
      setShowNavLockModal(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isSetupActive]);

  const handleCompleteProcess = async () => {
    const confirm = window.confirm(
      "Confirm that you have completed all setup steps, set Steam to Offline Mode, and launched your game?"
    );
    if (!confirm) return;

    setCompleting(true);
    try {
      const res = await fetch(`/api/orders/access/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPLETE_SETUP" }),
      });
      const result = await res.json();
      if (res.ok) {
        setCompleteSuccess(true);
        fetchOrderAccess();
      } else {
        alert(result.error || "Failed to confirm setup process");
      }
    } catch {
      alert("Network error confirming setup process");
    } finally {
      setCompleting(false);
    }
  };

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

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
        data?.isCompleted || completeSuccess ? (
          /* 1. COMPLETED VIEW: CLEAN SECURED STATE ONCE CONFIRMED */
          <div className="bg-[#171a21] border border-emerald-500/40 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                Setup Complete & Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                PROCESS COMPLETED & VAULT SECURED
              </h2>
              <p className="text-xs sm:text-sm text-[#8f98a0] max-w-xl mx-auto leading-relaxed">
                Your personal PC is now independently configured for permanent offline gameplay across all 265+ titles. To protect vault access and maintain account integrity, setup credentials and walkthrough materials are now safely locked.
              </p>
            </div>

            <div className="bg-[#16202d] border border-[#2a475e] p-5 rounded-xl max-w-md mx-auto text-xs text-[#c7d5e0] space-y-2 text-left shadow-inner">
              <div className="flex justify-between border-b border-[#2a475e]/60 pb-2">
                <span className="text-[#8f98a0]">Order ID:</span>
                <strong className="text-white font-mono">#{order.orderId}</strong>
              </div>
              <div className="flex justify-between border-b border-[#2a475e]/60 pb-2">
                <span className="text-[#8f98a0]">Registered Email:</span>
                <strong className="text-white">{order.user.email}</strong>
              </div>
              <div className="flex justify-between border-b border-[#2a475e]/60 pb-2">
                <span className="text-[#8f98a0]">Offline Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified & Permanent
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f98a0]">Included Titles:</span>
                <span className="text-[#66c0f4] font-bold">265+ PC Games Vault</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/catalog"
                className="w-full sm:w-auto btn-steam-cta text-xs px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-white shadow-ctaGlow"
              >
                <Gamepad2 className="w-4 h-4" /> Browse Included 265+ Games
              </Link>
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(
                  `Hi Admin, I completed setup for Order #${order.orderId}. I need assistance/re-activation in the future.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto btn-steam-panel text-xs px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-[#2a475e] text-white"
              >
                <MessageSquare className="w-4 h-4 text-[#25d366]" /> WhatsApp Support & Re-Activation
              </a>
            </div>
          </div>
        ) : data?.isExpired ? (
          /* 2. EXPIRED VIEW: TIME LIMIT REACHED */
          <div className="bg-[#171a21] border border-amber-500/40 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-500/30 px-3 py-1 rounded-full">
                Setup Window Concluded
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                SETUP SESSION EXPIRED
              </h2>
              <p className="text-xs sm:text-sm text-[#8f98a0] max-w-xl mx-auto leading-relaxed">
                The one-time setup session for Order <strong>#{order.orderId}</strong> has reached its time limit. If you already completed your setup, your titles will continue playing offline on your PC forever.
                <br /><br />
                If you were interrupted or need additional time, message our admin on WhatsApp with your Order ID to request a fresh activation window.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(
                  `Hi Admin, my setup session for Order #${order.orderId} expired. Please grant an activation extension.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-steam-cta text-xs px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 text-white shadow-ctaGlow"
              >
                <MessageSquare className="w-4 h-4 text-[#25d366]" /> Message Admin on WhatsApp to Reopen Window
              </a>
            </div>
          </div>
        ) : (
          /* 3. ACTIVE SETUP GUIDE WITH TIME LIMIT & MANDATORY CONFIRMATION */
          <AntiScreenshotShield
            enabled={guideConfig.protection?.antiScreenshot ?? true}
            watermarkText={`${order.user.email} • ORD #${order.orderId}`}
          >
            <div className="space-y-8 relative">
              {/* Countdown Timer & Navigation Lock Status Banner */}
              <div className="bg-gradient-to-r from-amber-950/80 via-[#16202d] to-emerald-950/80 border border-amber-500/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 animate-pulse">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                        ACTIVE SETUP SESSION:
                      </span>
                      <span className="font-mono font-black text-sm sm:text-base text-amber-400 bg-black/60 px-2.5 py-0.5 rounded border border-amber-500/40">
                        ⏱️ {formatTime(remainingTime)} REMAINING
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-[#c7d5e0]">
                      ⚠️ <strong>Navigation is locked:</strong> You cannot leave or open other pages until you complete setup and click &quot;Process Completed&quot; below.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("process-completed-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-steam-panel text-[11px] font-bold px-3 py-1.5 rounded border border-amber-500/40 text-amber-300 hover:text-white flex items-center gap-1.5 flex-shrink-0"
                >
                  Jump to &quot;Process Completed&quot; &darr;
                </button>
              </div>

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
                  <p className="font-bold">One-Time Setup Window</p>
                  <p className="text-[10px] text-[#8f98a0]">Locks automatically upon completion</p>
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

              {/* MANDATORY PROCESS COMPLETED CONFIRMATION SECTION */}
              <div
                id="process-completed-section"
                className="bg-[#171a21] border-2 border-emerald-500/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_0_35px_rgba(16,185,129,0.2)] scroll-mt-24"
              >
                {/* 1. Explicit Warning Box ABOVE Button */}
                <div className="bg-amber-950/50 border border-amber-500/50 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1 text-xs">
                    <h4 className="font-black text-amber-400 uppercase tracking-wider text-xs sm:text-sm">
                      ⚠️ MANDATORY FINAL REQUIREMENT BEFORE LEAVING
                    </h4>
                    <p className="leading-relaxed">
                      You <strong>cannot navigate away</strong> or visit any other page until you complete your Steam setup and click the confirmation button below.
                      Ensure that you have completed all 8 steps, switched Steam to <strong>Offline Mode</strong>, and launched your title at least once before confirming.
                    </p>
                  </div>
                </div>

                {/* 2. The Confirmation Button */}
                <button
                  type="button"
                  onClick={handleCompleteProcess}
                  disabled={completing}
                  className="w-full py-4 sm:py-5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm sm:text-lg tracking-wider uppercase shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                  <span>
                    {completing ? "Finalizing & Securing Setup..." : "Process Completed — Finalize & Lock Setup"}
                  </span>
                </button>

                {/* 3. Explicit Security Notice BELOW Button */}
                <div className="bg-[#121922] border border-[#2a475e]/80 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 text-[#8f98a0]">
                  <Lock className="w-5 h-5 text-[#66c0f4] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-[11px] sm:text-xs">
                    <h5 className="font-bold text-white uppercase tracking-wider">
                      🔒 SECURITY LOCK NOTICE (ONE-TIME SETUP WINDOW)
                    </h5>
                    <p className="leading-relaxed">
                      Clicking <strong>Process Completed</strong> finalizes your access, releases the page navigation lock, and <strong>permanently closes this setup window</strong> to protect vault credentials.
                      Once clicked, this walkthrough will not be shown again. If you ever switch PC or need a re-installation in the future, contact Admin on WhatsApp to request a fresh activation window.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Persistent Sticky Bottom Bar on Mobile/Desktop */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#171a21]/95 backdrop-blur-md border-t border-[#2a475e] py-2.5 px-4 flex items-center justify-between text-xs shadow-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[#8f98a0] hidden sm:inline">Active Setup Window:</span>
                <span className="font-mono font-bold text-white bg-black/60 px-2.5 py-0.5 rounded border border-[#2a475e]">
                  ⏱️ {formatTime(remainingTime)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const btn = document.getElementById("process-completed-section");
                  btn?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Scroll to &quot;Process Completed&quot; &darr;
              </button>
            </div>
          </AntiScreenshotShield>
        )
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

      {/* Navigation Lock Warning Modal */}
      {showNavLockModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowNavLockModal(false)}
        >
          <div
            className="bg-[#171a21] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Setup In Progress
              </h3>
              <p className="text-xs text-[#c7d5e0] leading-relaxed">
                You cannot navigate away or access other pages until you complete your Steam offline setup and click <strong>&quot;Process Completed&quot;</strong> below.
              </p>
            </div>

            <div className="bg-[#121922] p-3 rounded-lg border border-[#2a475e] text-[11px] text-[#8f98a0]">
              Leaving early without confirming will keep your access locked. Once confirmed, navigation will unlock automatically.
            </div>

            <button
              type="button"
              onClick={() => {
                setShowNavLockModal(false);
                const el = document.getElementById("process-completed-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full btn-steam-cta py-3 rounded-lg text-xs font-bold text-white shadow-ctaGlow flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Continue Setup &amp; Scroll to Confirmation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

