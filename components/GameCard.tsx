"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";

export interface GameCardProps {
  id: string;
  title: string;
  series?: string | null;
  hypeTier: string;
  ourMonthlyPriceINR?: number;
  steamPriceINR?: number | null;
  offlineTag: string;
  testedOfflineOn?: string | Date | null;
  launcher: string;
  headerImage?: string | null;
  purchasableAsSingle?: boolean;
}

export default function GameCard({
  id,
  title,
  series,
  hypeTier,
  steamPriceINR,
  offlineTag,
  testedOfflineOn,
  launcher,
  headerImage,
}: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  const isVerifiedOffline = offlineTag === "Offline OK" && !!testedOfflineOn;

  // Clean, official-looking Steam tier badges (no tacky emojis)
  const getTierBadge = () => {
    switch (hypeTier) {
      case "Hot":
        return (
          <span className="bg-[#a62222] text-white font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded-sm tracking-wider shadow">
            HOT
          </span>
        );
      case "Popular":
        return (
          <span className="bg-[#1b4369] text-[#66c0f4] font-bold text-[9px] uppercase px-1.5 py-0.5 rounded-sm tracking-wider shadow border border-[#66c0f4]/20">
            POPULAR
          </span>
        );
      case "Standard":
        return null;
      default:
        return null;
    }
  };

  const getOfflineBadge = () => {
    if (offlineTag === "Online required") {
      return (
        <span className="bg-[#6b2222]/90 text-[#ff8080] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
          Online Only
        </span>
      );
    }
    if (isVerifiedOffline) {
      return (
        <span className="bg-[#4c6b22]/90 text-[#a4d007] text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide">
          Offline OK
        </span>
      );
    }
    return (
      <span className="bg-black/60 text-[#8f98a0] text-[9px] font-medium px-1.5 py-0.5 rounded-sm">
        Offline Ready
      </span>
    );
  };

  return (
    <Link
      href={`/game/${id}`}
      className="group relative bg-[#16202d] hover:bg-[#1e2a38] border border-[#2a475e]/70 hover:border-[#66c0f4] rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(102,192,244,0.3)] flex flex-col justify-between h-full"
    >
      {/* Cover Artwork Container (460x215 Steam Ratio with Sheen Sweep) */}
      <div className="relative aspect-[460/215] w-full bg-[#0d131b] overflow-hidden flex-shrink-0 before:absolute before:inset-0 before:-translate-x-full group-hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:transition-transform before:duration-700 before:z-20">
        {headerImage && !imageError ? (
          <Image
            src={headerImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b2838] to-[#0e1620] p-2 text-center select-none">
            <Gamepad2 className="w-6 h-6 text-[#66c0f4]/50 mb-1 animate-pulse" />
            <span className="text-[11px] font-bold text-[#c7d5e0]/80 tracking-wide line-clamp-1">
              {title}
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 z-10 pointer-events-none">
          {getTierBadge()}
          {getOfflineBadge()}
        </div>

        {/* Launcher badge (if not standard Steam) */}
        {launcher && launcher !== "Steam only" && (
          <div className="absolute top-1.5 right-1.5 z-10 bg-black/80 text-[9px] text-amber-200 px-1.5 py-0.5 rounded-sm border border-amber-500/30">
            {launcher}
          </div>
        )}
      </div>

      {/* Title & Metadata Section */}
      <div className="p-2.5 space-y-1">
        <h3
          className="text-xs sm:text-[13px] font-bold text-[#c7d5e0] group-hover:text-white transition-colors truncate leading-snug"
          title={title}
        >
          {title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-[#626d7b]">
          <span className="truncate max-w-[70%]">{series || "Single-player"}</span>
          <span className="text-[#5ba32b] font-medium">Local Play</span>
        </div>
      </div>

      {/* Classic Steam Price & Included Capsule Widget */}
      <div className="px-2.5 pb-2.5 pt-1 flex items-center justify-between mt-auto border-t border-[#1b2838] bg-[#121922]">
        {/* Windows Platform Icon */}
        <div className="flex items-center gap-1 text-[#626d7b]" title="Windows PC Supported">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 12.402l35.687-4.86.016 34.423-35.67.202L0 12.402zm35.67 33.529l.028 34.453L.028 75.48.016 46.126l35.682-.195zm4.326-39.04L87.914 0v41.525l-47.918.318V6.891zm47.918 39.52v41.541l-47.918-6.758v-34.99l47.918.207z" />
          </svg>
          <span className="text-[9px] text-[#76808c] font-medium uppercase tracking-wider">PC</span>
        </div>

        {/* Authentic Steam Price Capsule */}
        <div className="flex items-center bg-[#000000]/60 rounded-sm overflow-hidden border border-black/40">
          {steamPriceINR ? (
            <span className="text-[10px] text-[#738895] line-through px-1.5 py-0.5 font-mono">
              ₹{steamPriceINR.toLocaleString("en-IN")}
            </span>
          ) : null}
          <span className="bg-[#4c6b22] text-[#beee11] group-hover:bg-[#5ba32b] group-hover:text-white font-extrabold text-[10px] px-2 py-0.5 tracking-tight uppercase transition-colors duration-200">
            INCLUDED
          </span>
        </div>
      </div>
    </Link>
  );
}
