"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  Sparkles,
  ArrowRight,
  Tag,
} from "lucide-react";

export interface FeaturedGame {
  id: string;
  title: string;
  steamAppId?: string | null;
  headerImage?: string | null;
  ourMonthlyPriceINR: number;
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

  // Savings calculation
  const steamPrice = currentGame.steamPriceINR || 3499;
  const ourPrice = currentGame.ourMonthlyPriceINR || 99;
  const savingsPercent = Math.max(
    80,
    Math.round(((steamPrice - ourPrice) / steamPrice) * 100)
  );

  return (
    <div
      className="bg-[#171a21] border border-[#2a475e] hover:border-[#66c0f4]/50 rounded-xl p-4 sm:p-5 shadow-panelGlow space-y-4 transition-all relative overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle background ambient glow matching active game */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#66c0f4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar: Badge, Live Counter, Rent Price */}
      <div className="flex items-center justify-between gap-2 border-b border-[#2a475e]/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse text-amber-400" />
            <span>FEATURED RELEASE</span>
          </span>
          <span className="text-xs font-mono text-[#8f98a0]">
            {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8f98a0] line-through hidden sm:inline">
            ₹{steamPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-sm font-black text-[#5ba32b] bg-[#5ba32b]/10 border border-[#5ba32b]/30 px-2.5 py-0.5 rounded">
            Rent ₹{ourPrice}/mo
          </span>
        </div>
      </div>

      {/* Main Image Showcase with Overlays & Navigation Chevrons */}
      <div className="relative aspect-[460/215] w-full rounded-lg overflow-hidden bg-[#0d131b] border border-[#2a475e]/60 group/image">
        <Image
          key={currentGame.id}
          src={currentGame.headerImage || "/brand/icon.svg"}
          alt={currentGame.title}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />

        {/* Top-Right: Savings Tag */}
        <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-md tracking-wider flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span>SAVE {savingsPercent}%</span>
        </div>

        {/* Bottom-Left: Offline Ready Badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#171a21]/90 backdrop-blur border border-[#66c0f4]/40 text-[#66c0f4] text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md">
          <WifiOff className="w-3 h-3" />
          <span>100% Single-Player Offline</span>
        </div>

        {/* Navigation Chevron Overlay (Prev) */}
        <button
          onClick={handlePrev}
          aria-label="Previous Featured Game"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#171a21]/80 hover:bg-[#66c0f4] text-white hover:text-black border border-[#2a475e] hover:border-[#66c0f4] flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-lg backdrop-blur"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Navigation Chevron Overlay (Next) */}
        <button
          onClick={handleNext}
          aria-label="Next Featured Game"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#171a21]/80 hover:bg-[#66c0f4] text-white hover:text-black border border-[#2a475e] hover:border-[#66c0f4] flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-lg backdrop-blur"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Metadata & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="space-y-0.5">
          <h3 className="font-black text-white text-base tracking-wide line-clamp-1 group-hover:text-[#66c0f4] transition-colors">
            {currentGame.title}
          </h3>
          <p className="text-xs text-[#8f98a0] flex items-center gap-1.5">
            <span>{currentGame.series?.name || "Blockbuster"}</span>
            <span className="text-[#2a475e]">·</span>
            <span className="text-emerald-400 font-semibold">Immediate Setup Window</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/game/${currentGame.id}`}
            className="btn-steam-cta text-xs px-4 py-2 rounded font-bold shadow-sm flex items-center gap-1.5"
          >
            <span>Rent Game</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Slide Indicators / Thumbnails Row */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2a475e]/30">
        <div className="flex items-center gap-1.5">
          {games.map((g, idx) => (
            <button
              key={g.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to ${g.title}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? "w-7 bg-gradient-to-r from-[#66c0f4] to-[#1a9fff]"
                  : "w-2 bg-[#2a475e] hover:bg-[#8f98a0]"
              }`}
            />
          ))}
        </div>

        <span className="text-[11px] text-[#8f98a0]">
          Auto-shuffling ({isPaused ? "Paused" : "Active"})
        </span>
      </div>
    </div>
  );
}

