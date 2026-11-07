"use client";

import { useEffect } from "react";

/**
 * ViewportResetManager
 * 1. Prevents double-tap and pinch zooming on mobile devices.
 * 2. When keyboard opens/closes or inputs blur, automatically resets viewport zoom scale back to exactly 1.0.
 * 3. Keeps pages centered and prevents awkward zoomed states.
 */
export default function ViewportResetManager() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Reset viewport zoom back to 1.0
    const resetViewportScale = () => {
      // Fix horizontal shift
      if (window.scrollX !== 0) {
        window.scrollTo({ left: 0, top: window.scrollY });
      }

      // Re-assert 1.0 maximum scale on the meta tag
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no"
        );
        setTimeout(() => {
          meta.setAttribute(
            "content",
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
          );
        }, 100);
      }
    };

    // 1. On input blur (when keyboard closes or user taps outside)
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        setTimeout(() => {
          resetViewportScale();
        }, 150);
      }
    };

    // 2. VisualViewport resize listener (detects when keyboard closes)
    let previousHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const handleViewportResize = () => {
      if (!window.visualViewport) return;
      const currentHeight = window.visualViewport.height;
      const scale = window.visualViewport.scale;

      // If viewport expanded back (keyboard closed) or scale zoomed beyond 1.0
      if (currentHeight > previousHeight || scale > 1.02) {
        resetViewportScale();
      }
      previousHeight = currentHeight;
    };

    // 3. Prevent pinch zoom gestures
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    // 4. Prevent multi-touch pinch zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("gesturestart", handleGesture, { passive: false });
    document.addEventListener("gesturechange", handleGesture, { passive: false });
    document.addEventListener("gestureend", handleGesture, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, { passive: false });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
      window.visualViewport.addEventListener("scroll", resetViewportScale);
    }

    return () => {
      document.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("gesturestart", handleGesture);
      document.removeEventListener("gesturechange", handleGesture);
      document.removeEventListener("gestureend", handleGesture);
      document.removeEventListener("touchstart", handleTouchStart);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportResize);
        window.visualViewport.removeEventListener("scroll", resetViewportScale);
      }
    };
  }, []);

  return null;
}

