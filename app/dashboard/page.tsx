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

  const activeSub = user?.activeSubscription;
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
              ? "All-Access Pass: Unlocked & Active (Lifetime Access)"
              : "No Active Plan — Unlock All 265+ Games for ₹300"}
          </span>
        </div>
      </div>

      {activeSub ? (
        /* UNLOCKED VIEW: THE COMPLETE DYNAMIC VISUAL SETUP GUIDE WITH ANTI-SCREENSHOT SHIELD */
        <AntiScreenshotShield
          enabled={guide.protection?.antiScreenshot ?? true}
          watermarkText={`${user?.email || "STEAMER USER"} • ID: ${user?.id?.slice(0, 8) || "VERIFIED"}`}
        >
          <div className="space-y-8 relative">
            {/* Guide Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-[#16202d] to-sky-950/80 border border-emerald-500/40 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                    Lifetime Pass Verified
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

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleRequestSetupWindow}
                  disabled={requestingWindow}
                  className="btn-steam-cta text-xs px-5 py-2.5 rounded font-black shadow-ctaGlow flex items-center gap-2 text-white"
                >
                  <Clock className="w-4 h-4" /> Request Activation Window
                </button>
              </div>
            </div>

            {windowMsg && (
              <div className="p-3 bg-[#66c0f4]/10 border border-[#66c0f4]/40 rounded-lg text-xs text-[#66c0f4] text-center font-bold">
                {windowMsg}
              </div>
            )}

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
                  All 265+ verified PC titles are permanently included in your ₹300 setup plan.
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
        </AntiScreenshotShield>
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
              Get the ultimate, step-by-step instructions to unlock and play 265+ premium PC games on your own system forever with zero account conflicts.
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
    </div>
  );
}
