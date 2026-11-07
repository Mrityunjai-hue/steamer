"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameCard from "./GameCard";

interface SteamCategoryRowProps {
  title: string;
  icon: React.ReactNode;
  badgeText?: string;
  accentColor?: string;
  games: any[];
}

export default function SteamCategoryRow({
  title,
  icon,
  badgeText = "Included in Guide",
  accentColor = "#66c0f4",
  games,
}: SteamCategoryRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -480 : 480;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  if (!games || games.length === 0) return null;

  return (
    <section className="space-y-3 group/section relative">
      {/* Category Header with Title, Accent Bar, Badge & Navigation Controls */}
      <div className="relative flex items-center justify-between border-b border-[#2a475e]/40 pb-2.5">
        {/* Animated Steam Section Accent Line */}
        <span
          className="absolute -bottom-[1px] left-0 w-16 group-hover/section:w-36 h-[2px] transition-all duration-500 ease-out"
          style={{
            background: `linear-gradient(to right, ${accentColor}, transparent)`,
          }}
        />

        {/* Title and Icon */}
        <div className="flex items-center gap-2">
          <div className="group-hover/section:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            {title}
          </h3>
        </div>

        {/* Right Controls: Badge + Steam Paging Arrows */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#5ba32b] font-medium hidden sm:inline-block">
            {badgeText}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              aria-label={`Scroll ${title} left`}
              className="w-7 h-7 rounded bg-[#171a21] hover:bg-[#66c0f4] text-[#c7d5e0] hover:text-[#171a21] border border-[#2a475e] hover:border-[#66c0f4] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm hover:shadow-[0_0_10px_rgba(102,192,244,0.5)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label={`Scroll ${title} right`}
              className="w-7 h-7 rounded bg-[#171a21] hover:bg-[#66c0f4] text-[#c7d5e0] hover:text-[#171a21] border border-[#2a475e] hover:border-[#66c0f4] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm hover:shadow-[0_0_10px_rgba(102,192,244,0.5)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Horizontal Scrolling Shelf */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-3 pt-1 -mx-1 px-1 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="w-[170px] sm:w-[200px] md:w-[220px] flex-shrink-0"
          >
            <GameCard
              id={game.id}
              title={game.title}
              series={game.series?.name}
              hypeTier={game.hypeTier}
              steamPriceINR={game.steamPriceINR}
              offlineTag={game.offlineTag}
              testedOfflineOn={game.testedOfflineOn}
              launcher={game.launcher}
              headerImage={game.headerImage}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

