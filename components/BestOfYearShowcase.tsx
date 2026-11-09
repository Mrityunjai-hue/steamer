"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Trophy, Flame, Play, ShieldCheck, ChevronRight, RefreshCw, Zap } from "lucide-react";

interface GameData {
  id: string;
  title: string;
  steamAppId?: string | null;
  steamPriceINR?: number | null;
  ourMonthlyPriceINR: number;
  releaseDate?: string | null;
  genres?: string | null;
  headerImage?: string | null;
  capsuleImage?: string | null;
  hypeTier: string;
  launcher: string;
}

interface TierData {
  title: string;
  subtitle: string;
  count: number;
  games: GameData[];
}

interface ApiResponse {
  year: string;
  category: string;
  total: number;
  tiers: {
    platinum: TierData;
    gold: TierData;
    silver: TierData;
    bronze: TierData;
  };
}

const CATEGORIES = [
  { id: "TOP_SELLERS", label: "TOP SELLERS" },
  { id: "NEW_RELEASES", label: "NEW RELEASES" },
  { id: "MOST_PLAYED", label: "MOST PLAYED" },
  { id: "STEAM_DECK", label: "STEAM DECK" },
  { id: "CONTROLLER", label: "CONTROLLER" },
  { id: "VR", label: "VR" },
  { id: "DEMOS", label: "DEMOS" },
];

const YEARS = [
  { id: "2026", label: "2026 (Upcoming)" },
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "2023", label: "2023" },
  { id: "ALL_TIME", label: "All-Time Legends" },
];

export default function BestOfYearShowcase() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedCategory, setSelectedCategory] = useState("TOP_SELLERS");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/catalog/best-of-year?year=${selectedYear}&category=${selectedCategory}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (isMounted && resData) {
          setData(resData);
        }
      })
      .catch((err) => console.error("Failed to load Best of Year:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedYear, selectedCategory]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Steam Top Sub-Navigation Menu (Exact match to Steam Screenshot) */}
      <div className="bg-[#121922] border-b border-[#2a475e]/70 px-4 py-3 rounded-lg flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-black tracking-wider uppercase transition-all rounded-sm ${
                  isActive
                    ? "text-white border-b-2 border-[#66c0f4] bg-[#1b2838]"
                    : "text-[#8f98a0] hover:text-white hover:bg-[#16202d]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Year Selector Pills */}
        <div className="flex items-center gap-1.5 bg-[#16202d] p-1 rounded border border-[#2a475e]/80">
          {YEARS.map((y) => {
            const isYearActive = selectedYear === y.id;
            return (
              <button
                key={y.id}
                onClick={() => setSelectedYear(y.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                  isYearActive
                    ? "bg-[#66c0f4] text-[#171a21] shadow-sm font-black"
                    : "text-[#c7d5e0] hover:text-white hover:bg-[#203043]"
                }`}
              >
                {y.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sub-Headline Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a475e]/50 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Top 100 products released in {selectedYear === "ALL_TIME" ? "Steam History" : selectedYear}, by revenue
          </h2>
          <p className="text-xs text-[#8f98a0]">
            Official Steam Best of the Year rankings · Included directly with Steamer ₹300 Lifetime Vault Access.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-[#5ba32b] bg-[#5ba32b]/10 border border-[#5ba32b]/30 px-2.5 py-1 rounded">
            ● 100 Titles Ranked in 4 Tiers
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin mx-auto" />
          <p className="text-xs text-[#8f98a0]">Loading Steam Best of {selectedYear} Showcase...</p>
        </div>
      ) : !data ? (
        <div className="py-16 text-center text-xs text-[#8f98a0]">
          Unable to load Best of Year rankings. Please try again.
        </div>
      ) : (
        <div className="space-y-10">
          {/* TIER 1: PLATINUM */}
          <TierSection
            tierKey="platinum"
            tier={data.tiers.platinum}
            containerClass="border border-[#93a9be]/70 bg-gradient-to-b from-[#243446]/95 via-[#1a2532]/90 to-[#121922]/98 shadow-[0_0_35px_rgba(147,169,190,0.18)]"
            headerBg="bg-gradient-to-r from-[#2c3d50] via-[#3a4f66] to-[#202d3b] text-white border-b border-[#93a9be]/40"
            titleColor="text-white"
            subColor="text-[#b9d2e8]"
          />

          {/* TIER 2: GOLD */}
          <TierSection
            tierKey="gold"
            tier={data.tiers.gold}
            containerClass="border border-[#d4af37]/80 bg-gradient-to-b from-[#4a3500]/40 via-[#261b00]/30 to-[#121922]/98 shadow-[0_0_35px_rgba(212,175,55,0.22)]"
            headerBg="bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#aa8010] text-[#171a21] border-b border-[#d4af37]/60"
            titleColor="text-[#171a21]"
            subColor="text-[#3a2800]"
          />

          {/* TIER 3: SILVER */}
          <TierSection
            tierKey="silver"
            tier={data.tiers.silver}
            containerClass="border border-[#a0aec0]/70 bg-gradient-to-b from-[#3a4454]/45 via-[#252d38]/30 to-[#121922]/98 shadow-[0_0_30px_rgba(160,174,192,0.18)]"
            headerBg="bg-gradient-to-r from-[#8a99ad] via-[#a0aec0] to-[#718096] text-[#171a21] border-b border-[#a0aec0]/50"
            titleColor="text-[#171a21]"
            subColor="text-[#2d3748]"
          />

          {/* TIER 4: BRONZE */}
          <TierSection
            tierKey="bronze"
            tier={data.tiers.bronze}
            containerClass="border border-[#cd7f32]/80 bg-gradient-to-b from-[#5c2a10]/40 via-[#2d1408]/30 to-[#121922]/98 shadow-[0_0_30px_rgba(205,127,50,0.22)]"
            headerBg="bg-gradient-to-r from-[#b35e20] via-[#cd7f32] to-[#8c4315] text-white border-b border-[#cd7f32]/60"
            titleColor="text-white"
            subColor="text-amber-100/90"
          />
        </div>
      )}
    </div>
  );
}

function TierSection({
  tierKey,
  tier,
  containerClass,
  headerBg,
  titleColor,
  subColor,
}: {
  tierKey: string;
  tier: TierData;
  containerClass: string;
  headerBg: string;
  titleColor: string;
  subColor: string;
}) {
  if (!tier || !tier.games || tier.games.length === 0) return null;

  return (
    <div className={`rounded-xl overflow-hidden ${containerClass} transition-all`}>
      {/* Tier Header Band */}
      <div className={`px-5 py-3.5 flex items-center justify-between ${headerBg}`}>
        <div>
          <h3 className={`text-lg sm:text-xl font-black tracking-wider uppercase leading-none ${titleColor}`}>
            {tier.title}
          </h3>
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${subColor}`}>
            {tier.subtitle}
          </p>
        </div>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/20 ${titleColor}`}>
          {tier.games.length} Titles
        </span>
      </div>

      {/* Grid of Games */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tier.games.map((game, idx) => (
          <TierGameCard key={`${tierKey}-${game.id}-${idx}`} game={game} />
        ))}
      </div>
    </div>
  );
}

function TierGameCard({ game }: { game: GameData }) {
  const [imgError, setImgError] = useState(false);

  // Steam CDN primary header image
  const steamAppId = game.steamAppId;
  const headerUrl = steamAppId
    ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/header.jpg`
    : game.headerImage || "/brand/logo.png";

  const retailPrice = game.steamPriceINR || 3999;
  // Calculate discount percentage relative to standard retail
  const discountPercent = retailPrice > 300 ? Math.min(85, Math.max(30, Math.round(((retailPrice - 300) / retailPrice) * 100))) : 50;

  return (
    <Link
      href={`/game/${game.id}`}
      className="group block bg-[#16202d] hover:bg-[#1f2d3d] rounded-md overflow-hidden border border-[#2a475e]/70 hover:border-[#66c0f4] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
    >
      {/* Capsule Banner Image */}
      <div className="relative aspect-[460/215] w-full bg-[#0d131b] overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#171a21]">
            <span className="text-xs font-bold text-white line-clamp-2">{game.title}</span>
            <span className="text-[10px] text-[#8f98a0] mt-1">{game.genres || "Action"}</span>
          </div>
        ) : (
          <img
            src={headerUrl}
            alt={game.title}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Launcher Badge if not Steam only */}
        {game.launcher && game.launcher !== "Steam only" && (
          <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur text-[9px] font-bold text-white px-1.5 py-0.5 rounded border border-white/10">
            {game.launcher}
          </div>
        )}
      </div>

      {/* Steam Price Footer (Matches Screenshot 1, 2, 3, 4) */}
      <div className="p-2.5 bg-[#0e141c] flex items-center justify-between border-t border-[#2a475e]/40 gap-2">
        <span className="text-xs font-bold text-white group-hover:text-[#66c0f4] transition-colors truncate flex-1">
          {game.title}
        </span>

        {/* Price Tag Pill */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="bg-[#5ba32b] text-black font-black text-[10px] px-1.5 py-0.5 rounded-sm">
            -{discountPercent}%
          </span>
          <div className="text-right leading-none">
            <span className="text-[9px] text-[#8f98a0] line-through block">
              ₹{retailPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] font-mono font-bold text-[#66c0f4] block">
              ₹300 Pass
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

