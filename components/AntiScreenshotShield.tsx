"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, EyeOff, ShieldCheck } from "lucide-react";

interface AntiScreenshotShieldProps {
  enabled?: boolean;
  watermarkText?: string;
  children: React.ReactNode;
}

export default function AntiScreenshotShield({
  enabled = true,
  watermarkText = "STEAMER CONFIDENTIAL",
  children,
}: AntiScreenshotShieldProps) {
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 1. Defend against screenshot utilities & Snipping Tool that steal focus
    const handleBlur = () => {
      setIsShieldActive(true);
    };

    const handleFocus = () => {
      setIsShieldActive(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsShieldActive(true);
      } else {
        setIsShieldActive(false);
      }
    };

    // 2. Mouse leave window protection: When user moves mouse outside viewport (e.g. to open Snipping Tool or click another app)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        setIsShieldActive(true);
      }
    };

    const handleMouseEnter = () => {
      setIsShieldActive(false);
    };

    // 3. Intercept PrintScreen and hotkeys
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        try {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(
              `PROTECTED STEAMER WALKTHROUGH • ACCOUNT: ${watermarkText} • SCREENSHOTS PROHIBITED`
            );
          }
        } catch {}
        setIsShieldActive(true);
        setAlertMsg("Screenshots are blocked to protect guide integrity.");
        setTimeout(() => {
          setIsShieldActive(false);
          setAlertMsg(null);
        }, 3000);
      }

      // Windows + Shift + S or Mac Command + Shift + 3/4
      if ((e.shiftKey && (e.metaKey || e.ctrlKey)) || e.key === "F12") {
        setIsShieldActive(true);
        setTimeout(() => setIsShieldActive(false), 2000);
      }

      // Ctrl + P (Print to PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setAlertMsg("Printing this protected guide is disabled.");
        setTimeout(() => setAlertMsg(null), 3000);
      }

      // Ctrl + S (Save page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }

      // Ctrl + U (View source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
      }
    };

    // 4. Prevent Copy / Cut
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData(
          "text/plain",
          "This setup guide is private and confidential to authorized Steamer customers."
        );
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
    };
  }, [enabled, watermarkText]);

  return (
    <div
      className="relative select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* CSS Print killer */}
      <style jsx global>{`
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>

      {/* Prominent Anti-Leak Forensic Watermark Grid */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none opacity-15 sm:opacity-20 flex flex-wrap gap-24 p-6 items-center justify-around transform -rotate-12">
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="text-white font-mono text-xs sm:text-sm font-bold tracking-widest whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            🔒 {watermarkText} • STEAMER PASS • NO SHARING
          </div>
        ))}
      </div>

      {/* Focus / Snipping Tool Shield Overlay */}
      {isShieldActive && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
          <EyeOff className="w-16 h-16 text-amber-400 mb-4 animate-pulse" />
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
            SCREEN CAPTURE SHIELD ACTIVE
          </h3>
          <p className="text-xs text-[#8f98a0] max-w-md leading-relaxed mb-4">
            This setup walkthrough is protected by Steamer anti-leak policies. Please return your
            cursor and focus to this browser window to resume viewing.
          </p>
          <button
            onClick={() => setIsShieldActive(false)}
            className="btn-steam-cta text-xs px-6 py-2 rounded font-bold text-white shadow-ctaGlow"
          >
            Click to Resume
          </button>
        </div>
      )}

      {/* Notification Toast */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 z-[110] bg-red-950/90 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-xs font-bold shadow-2xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {children}
    </div>
  );
}
