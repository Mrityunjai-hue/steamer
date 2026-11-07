"use client";

import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, Zap } from "lucide-react";

const tickerItems = [
  { title: "Grand Theft Auto V", original: "₹3,499", tag: "Hot Tier" },
  { title: "Red Dead Redemption 2", original: "₹3,999", tag: "Masterpiece" },
  { title: "Cyberpunk 2077", original: "₹2,999", tag: "Phantom Liberty Ready" },
  { title: "Elden Ring", original: "₹3,599", tag: "Offline OK" },
  { title: "Black Myth: Wukong", original: "₹3,599", tag: "AAA Blockbuster" },
  { title: "Ghost of Tsushima", original: "₹3,999", tag: "Director's Cut" },
  { title: "God of War", original: "₹3,299", tag: "Local Saves" },
  { title: "Marvel's Spider-Man", original: "₹3,999", tag: "Verified" },
  { title: "Hogwarts Legacy", original: "₹3,999", tag: "100% Offline" },
  { title: "Silent Hill 2", original: "₹3,999", tag: "Latest Release" },
];

export default function SteamTickerBanner() {
  // Duplicate for seamless infinite loop
  const list = [...tickerItems, ...tickerItems];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#171a21] border-y border-[#2a475e]/70 py-2.5 shadow-inner">
      {/* Edge Blur Vignettes */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#171a21] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#171a21] to-transparent z-10 pointer-events-none" />

      <div className="animate-steam-marquee items-center gap-6 text-xs select-none">
        {list.map((item, idx) => (
          <Link
            key={idx}
            href={`/catalog?search=${encodeURIComponent(item.title)}`}
            className="flex items-center gap-2.5 px-3 py-1 bg-[#16202d]/80 hover:bg-[#203043] border border-[#2a475e]/70 hover:border-[#66c0f4] rounded transition-all duration-200 group flex-shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#66c0f4] group-hover:scale-125 transition-transform" />
            <span className="font-bold text-white group-hover:text-[#66c0f4] transition-colors whitespace-nowrap">
              {item.title}
            </span>
            <span className="text-[10px] text-[#738895] line-through font-mono">
              {item.original}
            </span>
            <span className="bg-[#4c6b22] group-hover:bg-[#5ba32b] text-[#beee11] group-hover:text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-sm tracking-tight uppercase transition-colors">
              INCLUDED
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

