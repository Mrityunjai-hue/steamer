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
  AlertTriangle,
  Lock,
} from "lucide-react";
import { GuideConfig, DEFAULT_GUIDE_CONFIG, GuideStep } from "@/lib/guide";
import GuideVideoPlayer from "@/components/GuideVideoPlayer";
import AntiScreenshotShield from "@/components/AntiScreenshotShield";
import { brandConfig } from "@/config/brand";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<GuideConfig>(DEFAULT_GUIDE_CONFIG);
  const [requestingWindow, setRequestingWindow] = useState(false);
  const [windowMsg, setWindowMsg] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Setup completion, timer & navigation locking state
  const [completing, setCompleting] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [showNavLockModal, setShowNavLockModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("steamer_setup_dashboard_expires");
      if (cached) {
        const diff = Math.max(0, Math.floor((new Date(cached).getTime() - Date.now()) / 1000));
        return diff;
      }
    }
    return null;
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
          } else {
            window.location.href = "/auth/login";
          }
        }),
      fetch("/api/guide")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.guide) {
            setGuide(data.guide);
          }
        }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.latestSetupWindow?.expiresAt) {
      if (typeof window !== "undefined") {
        localStorage.setItem("steamer_setup_dashboard_expires", user.latestSetupWindow.expiresAt);
      }
      const diff = Math.max(
        0,
        Math.floor((new Date(user.latestSetupWindow.expiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainingTime(diff);
    }
  }, [user]);

  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  const activeSub = user?.activeSubscription;
  const isCompleted = user?.latestSetupWindow?.status === "COMPLETED" || completeSuccess;
  const isSetupActive = activeSub && !isCompleted;

  // Navigation Lock: Prevent navigating away until "Process Completed" is confirmed
  useEffect(() => {
    if (!isSetupActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "WARNING: If you leave this page, your one-time setup session is permanently terminated and you will NEVER be allowed to view this guide again unless you purchase a renewal!";
      return e.returnValue;
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

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
    setCompleting(true);
    setCompleteError(null);
    try {
      const res = await fetch("/api/setup-window/confirm-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklistConfirmed: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompleteSuccess(true);
        fetch("/api/auth/me")
          .then((r) => r.json())
          .then((d) => d?.user && setUser(d.user));
      } else {
        setCompleteError(data.error || "Failed to confirm process. Please try again.");
      }
    } catch {
      setCompleteError("Network error confirming setup process. Please check your connection.");
    } finally {
      setCompleting(false);
    }
  };

  const handleForfeitAndLeave = async () => {
    try {
      await fetch("/api/setup-window/confirm-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklistConfirmed: true }),
      });
    } catch {}
    window.location.href = "/dashboard";
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRequestSetupWindow = async () => {
    setRequestingWindow(true);
    setWindowMsg(null);
    try {
      const res = await fetch("/api/setup-window/request", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setWindowMsg(data.message);
        setTimeout(() => {
          window.location.href = "/setup-window";
        }, 1500);
      } else {
        setWindowMsg(data.error || "Failed to request setup window");
      }
    } catch {
      setWindowMsg("Network error requesting setup window");
    } finally {
      setRequestingWindow(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
        <p className="text-xs text-[#8f98a0]">Loading your Steamer Library...</p>
      </div>
    );
  }

  const isProtected = guide.protection?.disableCopy ?? true;

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 ${
        isProtected ? "select-none" : ""
      }`}
      onContextMenu={(e) => {
        if (guide.protection?.disableRightClick) {
          e.preventDefault();
        }
      }}
    >
      {/* Top Welcome Banner */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-panelGlow">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-wide">
            WELCOME BACK, {user?.displayName?.toUpperCase()}
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Registered Account: <strong className="text-white">{user?.email}</strong>
          </p>
        </div>

        <div className="bg-[#16202d] border border-[#5ba32b]/40 px-4 py-2.5 rounded-lg flex items-center gap-3 text-xs text-[#5ba32b]">
          <CheckCircle2 className="w-4 h-4 text-[#5ba32b] flex-shrink-0" />
          <span>
            {activeSub
              ? "All-Access Pass: Lifetime games access in your personal Steam"
              : "No Active Plan — Unlock All 370+ Games for ₹300"}
          </span>
        </div>
      </div>

      {activeSub ? (
        isCompleted ? (
          /* COMPLETED VIEW: CLEAN SECURED STATE */
          <div className="bg-[#171a21] border border-emerald-500/40 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                Setup Complete & Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                ALL-ACCESS VAULT ACTIVE ON YOUR PC
              </h2>
              <p className="text-xs sm:text-sm text-[#8f98a0] max-w-xl mx-auto leading-relaxed">
                Your personal PC is independently configured for offline gameplay across all 370+ titles. To protect vault access and maintain account integrity, setup credentials and walkthrough materials are now safely locked.
              </p>
            </div>

            {windowMsg && (
              <div className="p-3 bg-[#66c0f4]/10 border border-[#66c0f4]/40 rounded-lg text-xs text-[#66c0f4] text-center font-bold">
                {windowMsg}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/catalog"
                className="w-full sm:w-auto btn-steam-cta text-xs px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-white shadow-ctaGlow"
              >
                <Gamepad2 className="w-4 h-4" /> Browse Included 370+ Games
              </Link>
              <Link
                href="/checkout?renew=true"
                className="w-full sm:w-auto btn-steam-panel text-xs px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-[#2a475e] text-[#66c0f4] hover:text-white hover:border-[#66c0f4]"
              >
                <RefreshCw className="w-4 h-4" /> Renew Setup Window (New PC)
              </Link>
            </div>

            <p className="text-[11px] text-[#8f98a0] max-w-md mx-auto pt-1">
              🔒 <strong>Single-Use Policy:</strong> Setup sessions cannot be re-opened once confirmed. If you switched computers, formatted your PC, or need a re-installation, click <strong>Renew Setup Window</strong> above or contact Admin on WhatsApp.
            </p>
          </div>
        ) : (
          /* UNLOCKED VIEW: THE COMPLETE DYNAMIC VISUAL SETUP GUIDE WITH ANTI-SCREENSHOT SHIELD */
          <AntiScreenshotShield
            enabled={guide.protection?.antiScreenshot ?? true}
            watermarkText={`${user?.email || "STEAMER USER"} • ID: ${user?.id?.slice(0, 8) || "VERIFIED"}`}
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
                      Lifetime games access in your personal Steam
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#66c0f4]/20 text-[#66c0f4] border border-[#66c0f4]/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Protected Content
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {guide.title || "Complete PC Setup Guide"}
                  </h2>
                  <p className="text-xs text-[#c7d5e0]">
                    {guide.description ||
                      "Follow the step-by-step instructions below to configure and play your titles."}
                  </p>
                </div>

                <div className="text-xs text-right text-emerald-300 bg-[#16202d] p-3 rounded-lg border border-emerald-500/30 flex-shrink-0">
                  <p className="font-bold">One-Time Setup Window</p>
                  <p className="text-[10px] text-[#8f98a0]">Active Session • Locks upon completion</p>
                </div>
              </div>

              {/* Video Walkthrough Player (If configured by admin) */}
              {guide.videoUrl && (
                <div className="space-y-2">
                  <GuideVideoPlayer
                    videoUrl={guide.videoUrl}
                    title={guide.videoTitle || "Step-by-Step Video Walkthrough"}
                    watermarkText={`${user?.email || "STEAMER USER"} • STEAMER PASS`}
                  />
                </div>
              )}

              {/* Click-by-Click Guide Steps */}
              <div className="space-y-8">
                {guide.steps.map((step: GuideStep) => (
                  <div
                    key={step.id || step.stepNumber}
                    className="bg-[#171a21] border border-[#2a475e] hover:border-[#66c0f4]/60 transition-all rounded-xl p-6 sm:p-8 space-y-6 shadow-panelGlow relative overflow-hidden"
                  >
                    {/* Step Header */}
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
                        Step {step.stepNumber} of {guide.steps.length}
                      </span>
                    </div>

                    {/* Instructions Text */}
                    <div className="text-sm text-[#c7d5e0] leading-relaxed whitespace-pre-line font-normal">
                      {step.instructions}
                    </div>

                    {/* Click Highlight Box */}
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

                    {/* Step Screenshot with Lightbox Zoom */}
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
                      You <strong>cannot navigate away</strong> or visit any other page until you complete your setup and click the confirmation button below.
                      Ensure that you have completed all the walkthrough steps above before confirming.
                    </p>
                  </div>
                </div>

                {completeError && (
                  <div className="bg-red-950/80 border border-red-500/60 rounded-xl p-4 text-red-200 text-xs text-center font-bold">
                    {completeError}
                  </div>
                )}

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

              {/* Quick Support & Catalog Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-white text-base flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-[#66c0f4]" /> Included Catalog
                    </h3>
                    <Link href="/catalog" className="text-xs font-bold text-[#66c0f4] hover:underline">
                      Browse Catalog &rarr;
                    </Link>
                  </div>
                  <p className="text-xs text-[#8f98a0]">
                    All 370+ verified PC titles are permanently included in your ₹300 setup plan.
                  </p>
                </div>

                <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-white text-base flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-400" /> Need 1-on-1 Assistance?
                    </h3>
                    <a
                      href={brandConfig.whatsappHelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      WhatsApp Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-[#8f98a0]">
                    Our support team is active daily from 10:00 AM to 11:00 PM IST to assist with any questions.
                  </p>
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
        /* LOCKED VIEW: PROMPT TO UNLOCK ₹300 GUIDE */
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-8 sm:p-12 text-center space-y-6 shadow-xl max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#66c0f4]/10 border border-[#66c0f4]/30 text-[#66c0f4] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Unlock the Complete PC Setup Guide
            </h2>
            <p className="text-sm text-[#8f98a0] max-w-lg mx-auto leading-relaxed">
              Get the ultimate, step-by-step instructions to unlock and play 370+ premium PC games directly on your Steam account forever with zero account conflicts.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/checkout"
              className="btn-steam-cta text-sm px-8 py-3.5 rounded-lg font-black shadow-ctaGlow inline-flex items-center gap-2 text-white"
            >
              <span>Unlock the Full Guide – ₹300</span>
              <ShieldCheck className="w-4 h-4" />
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
                You cannot navigate away or access other pages until you complete the setup steps and click <strong>&quot;Process Completed&quot;</strong> below.
              </p>
            </div>

            <div className="bg-red-950/60 border border-red-500/50 p-3.5 rounded-lg text-[11px] text-red-200 text-left space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> STRICT ONE-TIME ACCESS POLICY
              </p>
              <p className="leading-relaxed">
                If you leave this page, your setup session is immediately terminated and permanently locked. You will <strong>never be allowed to view this setup guide again</strong> unless you purchase a renewal.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowNavLockModal(false);
                  const el = document.getElementById("process-completed-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full btn-steam-cta py-3.5 rounded-lg text-xs font-bold text-white shadow-ctaGlow flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Stay on Page &amp; Continue Setup
              </button>
              <button
                type="button"
                onClick={handleForfeitAndLeave}
                className="w-full py-2 text-[11px] text-red-400 hover:text-red-300 hover:underline transition-colors block text-center"
              >
                Forfeit Session &amp; Leave (Locks Guide Permanently)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
