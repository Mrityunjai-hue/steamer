"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  WifiOff,
} from "lucide-react";

export interface FeaturedGame {
  id: string;
  title: string;
  steamAppId?: string | null;
  headerImage?: string | null;
  ourMonthlyPriceINR?: number;
  steamPriceINR?: number | null;
  hypeTier: string;
  series?: { name: string } | null;
  offlineTag?: string | null;
}

interface FeaturedHeroCarouselProps {
  games: FeaturedGame[];
}

export default function FeaturedHeroCarousel({ games }: FeaturedHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = games.length;

  // Auto-rotation timer (4.5s)
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused]);

  if (!games || games.length === 0) {
    return null;
  }

  const currentGame = games[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const steamPrice = currentGame.steamPriceINR || 3499;

  return (
    <div
      className="bg-[#171a21] border border-[#2a475e] hover:border-[#66c0f4]/70 rounded-xl p-4 sm:p-5 shadow-panelGlow hover:shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_25px_rgba(102,192,244,0.25)] space-y-4 transition-all duration-300 relative overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle background ambient glow matching active game */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#1a9fff]/20 rounded-full blur-3xl pointer-events-none animate-steam-pulse" />

      {/* Header bar: Badge, Live Counter, Included Status */}
      <div className="flex items-center justify-between gap-2 border-b border-[#2a475e]/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse text-amber-400" />
            <span>FEATURED SHOWCASE</span>
          </span>
          <span className="text-xs font-mono text-[#8f98a0]">
            {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Authentic Steam Price Capsule */}
        <div className="flex items-center bg-[#000000]/70 rounded-sm overflow-hidden border border-black/50 shadow-sm">
          <span className="text-[11px] text-[#738895] line-through px-2 py-0.5 font-mono">
            ₹{steamPrice.toLocaleString("en-IN")}
          </span>
          <span className="bg-[#4c6b22] text-[#beee11] group-hover:bg-[#5ba32b] group-hover:text-white font-extrabold text-[11px] px-2.5 py-0.5 tracking-tight uppercase transition-colors duration-200">
            INCLUDED
          </span>
        </div>
      </div>

      {/* Main Image Showcase with Overlays & Navigation Chevrons */}
      <div
        key={currentGame.id}
        className="relative aspect-[460/215] w-full rounded-lg overflow-hidden bg-[#0d131b] border border-[#2a475e]/60 group/image steam-sheen animate-steam-fade shadow-inner"
      >
        <Image
          src={currentGame.headerImage || "/brand/icon.svg"}
          alt={currentGame.title}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover transition-transform duration-700 ease-out group-hover/image:scale-108"
          priority
        />

        {/* Bottom-Left: Offline Ready Tag */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#171a21]/90 backdrop-blur border border-[#66c0f4]/40 text-[#66c0f4] text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md">
          <WifiOff className="w-3 h-3" />
          <span>100% Single-Player Offline</span>
        </div>

        {/* Navigation Chevron Overlay (Prev) */}
        <button
          onClick={handlePrev}
          aria-label="Previous Featured Game"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#171a21]/80 hover:bg-[#66c0f4] text-white hover:text-black border border-[#2a475e] hover:border-[#66c0f4] flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg backdrop-blur"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Navigation Chevron Overlay (Next) */}
        <button
          onClick={handleNext}
          aria-label="Next Featured Game"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#171a21]/80 hover:bg-[#66c0f4] text-white hover:text-black border border-[#2a475e] hover:border-[#66c0f4] flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg backdrop-blur"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Clean Title & Metadata */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="space-y-0.5 min-w-0">
          <h3 className="font-black text-white text-base tracking-wide line-clamp-1 group-hover:text-[#66c0f4] transition-colors">
            {currentGame.title}
          </h3>
          <p className="text-xs text-[#8f98a0] flex items-center gap-1.5">
            <span>{currentGame.series?.name || "Blockbuster Series"}</span>
            <span className="text-[#2a475e]">·</span>
            <span className="text-emerald-400 font-semibold">Ready to Play Offline</span>
          </p>
        </div>

        <Link
          href={`/catalog?search=${encodeURIComponent(currentGame.title)}`}
          className="text-xs text-[#66c0f4] hover:underline flex-shrink-0 font-bold transition-transform hover:translate-x-0.5"
        >
          View in Catalog →
        </Link>
      </div>

      {/* Steam Multi-Thumbnail Strip with Active Progress Bar */}
      <div className="pt-2 border-t border-[#2a475e]/40 space-y-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
          {games.slice(0, 5).map((g, idx) => (
            <button
              key={g.id}
              onClick={() => setCurrentIndex(idx)}
              onMouseEnter={() => setCurrentIndex(idx)}
              title={g.title}
              className={`relative aspect-[460/215] rounded overflow-hidden border transition-all duration-200 group/thumb ${
                idx === currentIndex
                  ? "border-[#66c0f4] shadow-[0_0_12px_rgba(102,192,244,0.7)] scale-[1.03] z-10"
                  : "border-[#2a475e]/60 opacity-60 hover:opacity-100 hover:border-[#8f98a0]"
              }`}
            >
              <Image
                src={g.headerImage || "/brand/icon.svg"}
                alt={g.title}
                fill
                sizes="120px"
                className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
              />
              {idx === currentIndex && (
                <span
                  key={`thumb-progress-${idx}`}
                  className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#66c0f4] to-emerald-400 ${
                    isPaused ? "w-full" : "steam-progress-bar"
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
