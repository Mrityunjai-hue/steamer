"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Laptop,
} from "lucide-react";

export default function SetupWindowPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-8 space-y-6 shadow-panelGlow text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Direct Personal PC Setup Active
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            ZERO WAITING QUEUES
          </h1>
          <p className="text-xs text-[#8f98a0] max-w-lg mx-auto leading-relaxed">
            Steamer has upgraded to independent personal PC setup. You do not need to wait in a queue or schedule a download slot. You have immediate, lifetime access to configure any title in our 245+ game vault.
          </p>
        </div>

        <div className="bg-[#16202d] border border-[#2a475e] p-5 rounded-lg max-w-md mx-auto text-xs text-[#c7d5e0] space-y-3 text-left">
          <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-[#2a475e]/60">
            <BookOpen className="w-4 h-4 text-[#66c0f4]" />
            <span>Setup Guide Walkthrough</span>
          </div>
          <p className="text-[11px] text-[#8f98a0]">
            Open your personal dashboard to view the protected click-by-click visual guide and video walkthrough.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="w-full btn-steam-cta py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-ctaGlow"
            >
              Open Setup Guide & Vault <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
