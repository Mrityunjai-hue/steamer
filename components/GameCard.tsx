"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check, AlertTriangle, ShieldCheck, Gamepad2 } from "lucide-react";

export interface GameCardProps {
  id: string;
  title: string;
  series?: string | null;
  hypeTier: string;
  ourMonthlyPriceINR: number;
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
  ourMonthlyPriceINR,
  steamPriceINR,
  offlineTag,
  testedOfflineOn,
  launcher,
  headerImage,
  purchasableAsSingle = true,
}: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Check if "Offline OK" verified or "Not yet verified"
  const isVerifiedOffline = offlineTag === "Offline OK" && !!testedOfflineOn;
  const displayOfflineTag = isVerifiedOffline ? "Offline OK" : offlineTag === "Offline OK" ? "Not yet verified" : offlineTag;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const existing = JSON.parse(localStorage.getItem("steamer_cart") || "[]");
      const found = existing.some((item: { id: string }) => item.id === id);
      if (!found) {
        existing.push({
          id,
          title,
          hypeTier,
          price: ourMonthlyPriceINR,
          launcher,
          offlineTag: displayOfflineTag,
          headerImage,
        });
        localStorage.setItem("steamer_cart", JSON.stringify(existing));
        window.dispatchEvent(new Event("cartUpdated"));
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  // Tier color configuration
  const getTierBadge = () => {
    switch (hypeTier) {
      case "Hot":
        return <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">HOT</span>;
      case "Popular":
        return <span className="bg-[#66c0f4]/20 text-[#66c0f4] border border-[#66c0f4]/40 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">POPULAR</span>;
      case "Standard":
        return <span className="bg-blue-400/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">STANDARD</span>;
      default:
        return <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">BUDGET</span>;
    }
  };

  // Offline status badge
  const getOfflineBadge = () => {
    if (isVerifiedOffline) {
      return (
        <span className="flex items-center gap-1 bg-[#5ba32b]/20 text-[#5ba32b] border border-[#5ba32b]/40 text-[10px] font-semibold px-1.5 py-0.5 rounded">
          <ShieldCheck className="w-3 h-3" /> Offline OK
        </span>
      );
    }
    if (displayOfflineTag === "Mixed") {
      return (
        <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold px-1.5 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3" /> Mixed
        </span>
      );
    }
    if (displayOfflineTag === "Online required") {
      return (
        <span className="bg-red-600/30 text-red-400 border border-red-600/40 text-[10px] font-semibold px-1.5 py-0.5 rounded">
          Online Only
        </span>
      );
    }
    return (
      <span className="bg-slate-700/40 text-slate-300 border border-slate-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
        Not yet verified
      </span>
    );
  };

  return (
    <div className="group relative bg-[#2a475e]/40 hover:bg-[#2a475e]/70 border border-[#2a475e]/60 rounded-md overflow-hidden card-steam-hover flex flex-col justify-between">
      <Link href={`/game/${id}`} className="block">
        {/* Cover Art (460x215 ratio) */}
        <div className="relative aspect-[460/215] w-full bg-[#16202d] overflow-hidden">
          {headerImage && !imageError ? (
            <Image
              src={headerImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1b2838] via-[#2a475e] to-[#16202d] text-center">
              <Gamepad2 className="w-8 h-8 text-[#66c0f4] mb-2 opacity-80" />
              <span className="text-sm font-bold text-white line-clamp-2 px-2">{title}</span>
              {series && <span className="text-[11px] text-[#8f98a0]">{series}</span>}
            </div>
          )}

          {/* Top Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
            {getTierBadge()}
            {getOfflineBadge()}
          </div>

          {/* Launcher badge */}
          {launcher && launcher !== "Steam only" && (
            <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur text-[10px] text-amber-200 px-1.5 py-0.5 rounded border border-amber-500/30">
              {launcher}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3">
          <h3 className="text-sm font-bold text-white group-hover:text-[#66c0f4] transition-colors truncate" title={title}>
            {title}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-[#8f98a0] mt-1">
            <span>{series || "Standalone"}</span>
            {launcher && launcher === "Steam only" && <span className="text-[10px] text-[#8f98a0]/80">Steam Offline</span>}
          </div>
        </div>
      </Link>

      {/* Pricing Chip & Action Box (Steam style) */}
      <div className="px-3 pb-3 pt-1 flex items-center justify-between mt-auto border-t border-[#171a21]/50 bg-[#16202d]/50">
        <div className="flex flex-col">
          {steamPriceINR ? (
            <span className="text-[10px] text-[#8f98a0] line-through">
              Steam: ₹{steamPriceINR.toLocaleString("en-IN")}
            </span>
          ) : (
            <span className="text-[10px] text-[#8f98a0]">Steam: —</span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-[#5ba32b]">
              ₹{ourMonthlyPriceINR}
            </span>
            <span className="text-[10px] text-[#8f98a0]">/ mo</span>
          </div>
        </div>

        {purchasableAsSingle ? (
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-all shadow-sm ${
              isAdded
                ? "bg-[#5ba32b] text-white"
                : "btn-steam-cta"
            }`}
            title="Add game to your monthly rental plan"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Rent
              </>
            )}
          </button>
        ) : (
          <span className="text-[10px] font-semibold text-red-400 bg-red-950/40 px-2 py-1 rounded border border-red-800/40">
            Online Only
          </span>
        )}
      </div>
    </div>
  );
}

