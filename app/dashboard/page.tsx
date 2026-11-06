"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  WifiOff,
  Gamepad2,
  Laptop,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Download,
  Key,
  HardDrive,
  Users,
  MessageSquare,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupConsent, setGroupConsent] = useState(false);
  const [requestingWindow, setRequestingWindow] = useState(false);
  const [windowMsg, setWindowMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          window.location.href = "/auth/login";
        }
      })
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
              : "No Active Plan — Unlock All 245+ Games for ₹300"}
          </span>
        </div>
      </div>

      {activeSub ? (
        /* UNLOCKED VIEW: THE COMPLETE CLICK-BY-CLICK SETUP GUIDE */
        <div className="space-y-8">
          {/* Status Bar */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-[#16202d] to-sky-950/80 border border-emerald-500/40 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                Lifetime Access Active
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Complete PC Setup Guide & 245+ Titles Unlocked
              </h2>
              <p className="text-xs text-[#c7d5e0]">
                Follow the 4 simple steps below to set up your offline games in under 10 minutes.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleRequestSetupWindow}
                disabled={requestingWindow}
                className="btn-steam-cta text-xs px-5 py-2.5 rounded font-black shadow-ctaGlow flex items-center gap-2"
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

          {/* Step-by-Step Guide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#66c0f4]/20 border border-[#66c0f4]/40 text-[#66c0f4] font-black flex items-center justify-center text-sm">
                  1
                </span>
                <h3 className="font-black text-white text-base">Client Preparation</h3>
              </div>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Ensure Steam is installed on your PC. Close any background game sessions. You will run your games directly through your local client without third-party bloat.
              </p>
              <div className="bg-[#16202d] border border-[#2a475e]/60 rounded p-3 text-[11px] text-[#c7d5e0] space-y-1">
                <p className="font-semibold text-white">Prerequisites:</p>
                <p>• Windows 10/11 64-bit</p>
                <p>• Official Steam Desktop Client installed</p>
                <p>• Sufficient disk space for game downloads</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black flex items-center justify-center text-sm">
                  2
                </span>
                <h3 className="font-black text-white text-base">Setup Window & Download</h3>
              </div>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Tap <strong>&quot;Request Activation Window&quot;</strong> above. You will be scheduled for a 15-minute exclusive session to download and verify your game files.
              </p>
              <div className="bg-[#16202d] border border-[#2a475e]/60 rounded p-3 text-[11px] text-[#c7d5e0] space-y-1">
                <p className="font-semibold text-white">What happens in this step:</p>
                <p>• Admin shares the single-use login securely via WhatsApp</p>
                <p>• Start game download from Steam servers at full speed</p>
                <p>• Launch game once to verify first-time directX/runtime setup</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center text-sm">
                  3
                </span>
                <h3 className="font-black text-white text-base">Permanent Offline Mode</h3>
              </div>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Click <strong>Steam (top left) &rarr; Go Offline... &rarr; Restart in Offline Mode</strong>. Once offline, you can play forever on your PC without getting kicked off.
              </p>
              <div className="bg-[#16202d] border border-amber-500/30 rounded p-3 text-[11px] text-amber-200/90 space-y-1">
                <p className="font-semibold text-amber-300">The Golden Rule:</p>
                <p>• Never click &quot;Go Online&quot; when launching your games</p>
                <p>• Enjoy uninterrupted single-player campaigns and story modes</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 font-black flex items-center justify-center text-sm">
                  4
                </span>
                <h3 className="font-black text-white text-base">Local Saves & Enjoyment</h3>
              </div>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                All game progress, checkpoints, and settings are saved locally in your Windows User profile (`Saved Games` or `AppData`). Your saves belong exclusively to you.
              </p>
              <div className="bg-[#16202d] border border-[#2a475e]/60 rounded p-3 text-[11px] text-[#c7d5e0] space-y-1">
                <p className="font-semibold text-white">Save Safety:</p>
                <p>• 100% private to your local Windows user</p>
                <p>• Compatible with all 245+ catalog games</p>
                <p>• Never overwritten or affected by other users</p>
              </div>
            </div>
          </div>

          {/* Catalog Access Quick Links */}
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#66c0f4]" /> All 245+ Titles Included in Your Setup
              </h3>
              <Link href="/catalog" className="text-xs font-bold text-[#66c0f4] hover:underline">
                View Full Catalog &rarr;
              </Link>
            </div>
            <p className="text-xs text-[#8f98a0]">
              Browse the library anytime to check offline compatibility, file sizes, and specific game notes for your rig.
            </p>
          </div>
        </div>
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
              Get the ultimate, step-by-step instructions to unlock and play 245+ premium PC games on your own system forever with zero account conflicts.
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
    </div>
  );
}
