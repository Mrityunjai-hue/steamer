"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("steamer_cookie_consent");
      if (!consent) {
        // Show after a slight delay for smooth page presentation
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable fallback
    }
  }, []);

  const handleConsent = (level: "all" | "essential") => {
    try {
      localStorage.setItem("steamer_cookie_consent", level);
      localStorage.setItem("steamer_cookie_consent_date", new Date().toISOString());
    } catch {
      // Ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-16 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[70] bg-[#171a21]/95 backdrop-blur-md border border-[#2a475e] rounded-xl shadow-2xl p-4 sm:p-5 text-xs text-[#c7d5e0] space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#2a475e]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#66c0f4]/15 border border-[#66c0f4]/30 flex items-center justify-center text-[#66c0f4] flex-shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">
              Cookie & Data Transparency
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Essential Session Security Only
            </span>
          </div>
        </div>
        <button
          onClick={() => handleConsent("essential")}
          className="text-[#8f98a0] hover:text-white p-1 rounded transition-colors"
          aria-label="Dismiss cookie notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-[#8f98a0] leading-relaxed">
        Steamer uses essential session cookies strictly to keep you securely signed in, authenticate checkout tokens, and save your games. We never use invasive third-party ad trackers or sell customer data.
      </p>

      <div className="text-[10px] text-[#8f98a0] flex items-center gap-2 pt-0.5">
        <span>Learn more in our</span>
        <Link href="/legal/privacy" className="text-[#66c0f4] hover:underline font-semibold">
          Privacy Policy
        </Link>
        <span>&middot;</span>
        <Link href="/legal/terms" className="text-[#66c0f4] hover:underline font-semibold">
          Terms of Service
        </Link>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleConsent("all")}
          className="flex-1 bg-[#5ba32b] hover:bg-[#68b832] text-white font-black py-2 px-3 rounded-lg text-xs transition-colors shadow-md text-center"
        >
          Accept All
        </button>
        <button
          onClick={() => handleConsent("essential")}
          className="flex-1 bg-[#16202d] hover:bg-[#1b2838] border border-[#2a475e] text-[#c7d5e0] hover:text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors text-center"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}

