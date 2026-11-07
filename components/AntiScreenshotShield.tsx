"use client";

import React, { useEffect, useState, useCallback } from "react";
import { EyeOff, ShieldAlert } from "lucide-react";

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

  const activateBlackout = useCallback((reason?: string) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("steamer-blackout");
    }
    setIsShieldActive(true);
    if (reason) setAlertMsg(reason);
  }, []);

  const deactivateBlackout = useCallback(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("steamer-blackout");
    }
    setIsShieldActive(false);
    setAlertMsg(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("steamer-blackout");
      }
      return;
    }

    // 1. Loss of focus / Snipping Tool activation / Mobile app switcher
    const handleBlur = () => {
      activateBlackout("Window focus changed. Content protected.");
    };

    const handleFocus = () => {
      // On focus return, hold blackout for 2 seconds to defeat rapid snipping / mobile capture tools
      setTimeout(deactivateBlackout, 2000);
    };

    // 2. Visibility change (tab switch, window minimized, screen recording overlay, iOS control center)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        activateBlackout("Screen capture or background switch detected.");
      } else {
        setTimeout(deactivateBlackout, 2000);
      }
    };

    // 2b. Page hide / iOS swipe gesture
    const handlePageHide = () => {
      activateBlackout("System navigation detected. Content protected.");
    };

    // 3. Mouse leaving the viewport towards system taskbar or corners
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        activateBlackout();
      }
    };

    const handleMouseEnter = () => {
      deactivateBlackout();
    };

    // 4. Keyboard shortcuts: PrintScreen, Windows key, Ctrl/Cmd+Shift combos, DevTools, Print
    const handleKeyAction = (e: KeyboardEvent) => {
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
        activateBlackout("Screenshot shortcut detected. Screen blacked out.");
        setTimeout(deactivateBlackout, 4000);
        return;
      }

      // Windows key (alone or during Win+Shift+S, Win+PrtScn, Win+G)
      if (e.key === "Meta" || e.metaKey) {
        activateBlackout("System capture key detected. Content protected.");
        setTimeout(deactivateBlackout, 3000);
        return;
      }

      // Windows + Shift + S or Mac Cmd + Shift + 3/4/5 or F12
      if ((e.shiftKey && (e.metaKey || e.ctrlKey)) || e.key === "F12") {
        activateBlackout("Capture utility shortcut detected. Content protected.");
        setTimeout(deactivateBlackout, 3000);
        return;
      }

      // Ctrl + P (Print to PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        activateBlackout("Printing is disabled for protected guide content.");
        setTimeout(deactivateBlackout, 3000);
        return;
      }

      // Ctrl + S (Save page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return;
      }

      // Ctrl + U (View source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        return;
      }
    };

    // 5. Printing interception
    const handleBeforePrint = () => {
      activateBlackout("Printing is strictly prohibited.");
    };

    // 6. Copy / Cut interception
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
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("keydown", handleKeyAction, true);
    window.addEventListener("keyup", handleKeyAction, true);
    window.addEventListener("beforeprint", handleBeforePrint);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);

    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("steamer-blackout");
      }
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("keydown", handleKeyAction, true);
      window.removeEventListener("keyup", handleKeyAction, true);
      window.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
    };
  }, [enabled, watermarkText, activateBlackout, deactivateBlackout]);

  return (
    <div
      className="relative select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Global CSS Print Killer & Pure Solid Blackout Styles */}
      <style jsx global>{`
        img {
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          user-select: none !important;
        }

        @media print {
          html, body {
            display: none !important;
            visibility: hidden !important;
          }
        }

        html.steamer-blackout,
        html.steamer-blackout body {
          background-color: #000000 !important;
          color: transparent !important;
          overflow: hidden !important;
        }

        html.steamer-blackout body * {
          visibility: hidden !important;
          opacity: 0 !important;
        }

        html.steamer-blackout #steamer-blackout-shield,
        html.steamer-blackout #steamer-blackout-shield * {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Prominent Anti-Leak Forensic Watermark Grid */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none opacity-15 sm:opacity-20 flex flex-wrap gap-24 p-6 items-center justify-around transform -rotate-12">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="text-white font-mono text-xs sm:text-sm font-bold tracking-widest whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          >
            🔒 {watermarkText} • STEAMER PASS • NO SHARING
          </div>
        ))}
      </div>

      {/* 100% Solid Pitch-Blackout Shield Overlay */}
      {isShieldActive && (
        <div
          id="steamer-blackout-shield"
          className="fixed inset-0 z-[9999999] bg-[#000000] flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center mb-4">
            <EyeOff className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase mb-2">
            PROTECTED STEAMER CONTENT
          </h3>
          <p className="text-xs text-neutral-400 max-w-md leading-relaxed mb-6 font-mono">
            SCREEN CAPTURE SHIELD ACTIVE • ALL CONTENT BLACKED OUT
            <br />
            Return cursor and focus to this browser window to resume viewing.
          </p>
          <button
            type="button"
            onClick={deactivateBlackout}
            className="px-6 py-2.5 bg-[#1b2838] hover:bg-[#2a475e] text-white text-xs font-bold rounded-lg border border-[#2a475e] shadow-lg cursor-pointer"
          >
            Click to Resume
          </button>
        </div>
      )}

      {/* Notification Toast */}
      {alertMsg && !isShieldActive && (
        <div className="fixed bottom-6 right-6 z-[110] bg-red-950/90 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-xs font-bold shadow-2xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {children}
    </div>
  );
}
