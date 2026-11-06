import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import GameCard from "@/components/GameCard";
import FeaturedHeroCarousel from "@/components/FeaturedHeroCarousel";
import { brandConfig } from "@/config/brand";
import {
  ShieldCheck,
  Flame,
  Star,
  Award,
  Sparkles,
  ChevronRight,
  WifiOff,
  CheckCircle2,
  Lock,
  BookOpen,
  Laptop,
  Check,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let hotGames: any[] = [];
  let popularGames: any[] = [];
  let standardGames: any[] = [];
  let budgetGames: any[] = [];
  let sortedHeroGames: any[] = [];

  try {
    const [hot, pop, std, bud] = await Promise.all([
      prisma.game.findMany({
        where: { hypeTier: "Hot", offlineTag: { not: "Online required" } },
        take: 6,
        include: { series: true },
      }),
      prisma.game.findMany({
        where: { hypeTier: "Popular", offlineTag: { not: "Online required" } },
        take: 6,
        include: { series: true },
      }),
      prisma.game.findMany({
        where: { hypeTier: "Standard", offlineTag: { not: "Online required" } },
        take: 6,
        include: { series: true },
      }),
      prisma.game.findMany({
        where: { hypeTier: "Budget", offlineTag: { not: "Online required" } },
        take: 6,
        include: { series: true },
      }),
    ]);
    hotGames = hot;
    popularGames = pop;
    standardGames = std;
    budgetGames = bud;

    const highHypeTitles = [
      "Black Myth: Wukong",
      "Ghost of Tsushima DIRECTOR'S CUT",
      "Red Dead Redemption 2",
      "God of War",
      "Marvel's Spider-Man Remastered",
      "Grand Theft Auto V",
      "Hogwarts Legacy",
      "Silent Hill 2",
      "Cyberpunk 2077",
      "Elden Ring",
      "Dragon Ball: Sparking! Zero",
      "Dying Light: The Beast",
    ];

    const featuredGamesRaw = await prisma.game.findMany({
      where: {
        OR: [
          { title: { in: highHypeTitles } },
          { hypeTier: "Hot" }
        ],
        offlineTag: { not: "Online required" }
      },
      take: 12,
      include: { series: true }
    });

    sortedHeroGames = [...featuredGamesRaw].sort((a, b) => {
      const idxA = highHypeTitles.indexOf(a.title);
      const idxB = highHypeTitles.indexOf(b.title);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    }).slice(0, 8);
  } catch (err) {
    console.error("HomePage database query error:", err);
  }

  return (
    <div className="space-y-14 pb-16">
      {/* 1. Hero Showcase / Main Hook */}
      <section className="relative bg-gradient-to-b from-[#171a21] via-[#1b2838] to-[#1b2838] border-b border-[#2a475e]/40 pt-8 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Value Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#16202d]/90 border border-[#2a475e] rounded-lg p-3.5 mb-8 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5ba32b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5ba32b]"></span>
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#c7d5e0]">
                <strong>Instant Access:</strong>{" "}
                <span className="text-[#5ba32b] font-bold">245+ Full Titles</span> Included · Single One-Time ₹300 Setup
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8f98a0]">
              <WifiOff className="w-4 h-4 text-[#66c0f4]" />
              <span>100% Single-Player Offline Mode · Local Saves</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a475e]/50 border border-[#66c0f4]/40 rounded-full text-xs font-bold text-[#66c0f4]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>245+ Blockbuster PC Games · Zero Account Sharing</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                PLAY PREMIUM PC GAMES.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66c0f4] via-[#1a9fff] to-emerald-400">
                  ON YOUR OWN PC. FOREVER.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#c7d5e0] leading-relaxed max-w-2xl font-medium">
                Stop paying thousands for individual titles or dealing with shared Steam accounts. Get the ultimate, step-by-step guide to unlocking and playing premium PC games forever on your own system.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/checkout"
                  className="btn-steam-cta px-7 py-3.5 rounded text-sm font-black shadow-ctaGlow flex items-center gap-2 text-white"
                >
                  <span>Unlock the Full Guide – ₹300</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href="#games-showcase"
                  className="btn-steam-panel px-5 py-3.5 rounded text-sm font-bold flex items-center gap-2 border border-[#2a475e] text-[#c7d5e0] hover:text-white"
                >
                  <span>Browse 245+ Included Titles</span>
                </a>
              </div>
            </div>

            {/* Dynamic Featured Showcase Carousel */}
            <div className="lg:col-span-5">
              <FeaturedHeroCarousel games={sortedHeroGames} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. What You Get (Value & Security Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-[#2a475e]/60 pb-4">
            <span className="text-xs font-bold text-[#66c0f4] uppercase tracking-wider">
              Complete Transparency
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              What You Get With Your ₹300 One-Time Unlock
            </h2>
            <p className="text-xs sm:text-sm text-[#8f98a0] mt-1">
              No hidden fees, no recurring subscriptions, and no lock-in. Everything you need to play immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefit 1 */}
            <div className="bg-[#16202d] border border-[#2a475e]/80 rounded-lg p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#66c0f4]/10 border border-[#66c0f4]/30 flex items-center justify-center text-[#66c0f4]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-black text-white text-sm">The Complete Setup Guide</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Easy, step-by-step instructions to set up your offline library on your own PC in under 10 minutes.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#16202d] border border-[#2a475e]/80 rounded-lg p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#5ba32b]/10 border border-[#5ba32b]/30 flex items-center justify-center text-[#5ba32b]">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-black text-white text-sm">No Account Sharing</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Play directly on your own PC without getting kicked off by other users or fighting for online slots.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#16202d] border border-[#2a475e]/80 rounded-lg p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="font-black text-white text-sm">Offline & Local Play</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Full access to single-player story modes, deep campaigns, and permanent local save files on your drive.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-[#16202d] border border-[#2a475e]/80 rounded-lg p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-black text-white text-sm">Lifetime Access</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Learn the method once, and use it for all 245+ supported games and future additions forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Catalog Showcase Header */}
      <section id="games-showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-4">
        <div className="bg-gradient-to-r from-[#171a21] via-[#2a475e]/40 to-[#171a21] border border-[#66c0f4]/30 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-panelGlow">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5ba32b] flex items-center gap-1.5">
              <Check className="w-4 h-4" /> 100% Included With ₹300 Unlock
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Games You Can Play With This Setup
            </h2>
            <p className="text-xs sm:text-sm text-[#8f98a0] max-w-2xl leading-relaxed">
              Every title below is supported by our setup method. Zero individual game purchases required &mdash; unlock all 245+ games for a single ₹300.
            </p>
          </div>

          <Link
            href="/checkout"
            className="btn-steam-cta px-6 py-3 rounded text-sm font-black whitespace-nowrap shadow-ctaGlow text-white flex-shrink-0"
          >
            Unlock All 245+ Titles – ₹300
          </Link>
        </div>
      </section>

      {/* 4. Hot Releases (Included) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400 fill-red-400" />
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
              HOT BLOCKBUSTERS · INCLUDED
            </h3>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-[#66c0f4] hover:underline flex items-center gap-1"
          >
            View all 245+ games <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {hotGames.map((game) => (
            <GameCard
              key={game.id}
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
          ))}
        </div>
      </section>

      {/* 5. Popular Blockbusters (Included) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#66c0f4] fill-[#66c0f4]" />
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
              POPULAR HITS · INCLUDED
            </h3>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-[#66c0f4] hover:underline flex items-center gap-1"
          >
            View all ({popularGames.length}+) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularGames.map((game) => (
            <GameCard
              key={game.id}
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
          ))}
        </div>
      </section>

      {/* 6. Standard Masterpieces (Included) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-300" />
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
              STANDARD MASTERPIECES · INCLUDED
            </h3>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-[#66c0f4] hover:underline flex items-center gap-1"
          >
            View all ({standardGames.length}+) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {standardGames.map((game) => (
            <GameCard
              key={game.id}
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
          ))}
        </div>
      </section>

      {/* 7. Classic Favorites (Included) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
              CLASSIC FAVORITES · INCLUDED
            </h3>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-[#66c0f4] hover:underline flex items-center gap-1"
          >
            View all ({budgetGames.length}+) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {budgetGames.map((game) => (
            <GameCard
              key={game.id}
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
          ))}
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950/80 via-[#16202d] to-sky-950/80 border border-emerald-500/40 rounded-xl p-8 text-center space-y-4 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
            Ready to Play Over 245+ Blockbuster PC Games?
          </h2>
          <p className="text-sm sm:text-base text-[#c7d5e0] max-w-2xl mx-auto leading-relaxed">
            Get the full setup walkthrough, complete game library access, and play on your own system without paying full retail or sharing active logins.
          </p>
          <div className="pt-2">
            <Link
              href="/checkout"
              className="btn-steam-cta text-base px-8 py-4 rounded-lg font-black shadow-ctaGlow inline-flex items-center gap-2 text-white"
            >
              <span>Unlock the Full Guide – ₹300</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
