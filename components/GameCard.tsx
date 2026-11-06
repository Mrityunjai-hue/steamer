"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck, Gamepad2, ArrowRight } from "lucide-react";

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

  // Check if "Offline OK" verified or "Not yet verified"
  const isVerifiedOffline = offlineTag === "Offline OK" && !!testedOfflineOn;
  const displayOfflineTag = isVerifiedOffline
    ? "Offline Verified"
    : offlineTag === "Offline OK"
    ? "Offline Compatible"
    : offlineTag;

  // Tier color configuration
  const getTierBadge = () => {
    switch (hypeTier) {
      case "Hot":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300">
            🔥 Hot
          </span>
        );
      case "Popular":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
            ⚡ Popular
          </span>
        );
      case "Standard":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#2a475e]/80 border border-[#66c0f4]/30 text-[#66c0f4]">
            Classic
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1b2838]/80 border border-[#2a475e] text-[#8f98a0]">
            Vault Title
          </span>
        );
    }
  };

  const getOfflineBadge = () => {
    if (offlineTag === "Online required") {
      return (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-900/60 border border-red-700/40 text-red-300">
          Online Only
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#5ba32b]/20 border border-[#5ba32b]/40 text-[#5ba32b] flex items-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        <span>{displayOfflineTag}</span>
      </span>
    );
  };

  return (
    <div className="steam-card flex flex-col h-full bg-[#171a21] border border-[#2a475e]/60 hover:border-[#66c0f4] rounded-lg overflow-hidden transition-all duration-300 group shadow-md hover:shadow-panelGlow">
      <Link href={`/game/${id}`} className="block relative">
        {/* Cover Artwork Container */}
        <div className="relative aspect-[460/215] w-full overflow-hidden bg-[#0d131b]">
          {!imageError && headerImage ? (
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
            {steamPriceINR && (
              <span className="text-[10px] text-[#8f98a0]/80 line-through">
                ₹{steamPriceINR.toLocaleString("en-IN")} on Steam
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Access Label (Replaces per-game price tags) */}
      <div className="px-3 pb-3 pt-1 flex items-center justify-between mt-auto border-t border-[#171a21]/50 bg-[#16202d]/50">
        <div className="inline-flex items-center gap-1.5 bg-[#5ba32b]/15 border border-[#5ba32b]/40 text-[#5ba32b] px-2.5 py-1 rounded text-xs font-bold">
          <Check className="w-3.5 h-3.5" />
          <span>Included in Guide</span>
        </div>

        <Link
          href={`/game/${id}`}
          className="text-xs text-[#8f98a0] hover:text-white flex items-center gap-1 transition-colors group-hover:text-[#66c0f4]"
        >
          <span>View Info</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
