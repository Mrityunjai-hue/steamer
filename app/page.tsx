import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import GameCard from "@/components/GameCard";
import FeaturedHeroCarousel from "@/components/FeaturedHeroCarousel";
import {
  Flame,
  Star,
  Award,
  Sparkles,
  ChevronRight,
  WifiOff,
  BookOpen,
  Laptop,
  Zap,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let hotGames: any[] = [];
  let popularGames: any[] = [];
  let standardGames: any[] = [];
  let budgetGames: any[] = [];
  let verifiedOfflineGames: any[] = [];
  let sortedHeroGames: any[] = [];

  try {
    const [hot, pop, std, bud, ver] = await Promise.all([
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
      prisma.game.findMany({
        where: { testedOfflineOn: { not: null }, offlineTag: "Offline OK" },
        take: 6,
        include: { series: true },
      }),
    ]);
    hotGames = hot;
    popularGames = pop;
    standardGames = std;
    budgetGames = bud;
    verifiedOfflineGames = ver;

    // Curated high-profile blockbusters for the Steam Hero Showcase
    const highHypeTitles = [
      "Grand Theft Auto V",
      "Red Dead Redemption 2",
      "Cyberpunk 2077",
      "Elden Ring",
      "Black Myth: Wukong",
      "Ghost of Tsushima DIRECTOR'S CUT",
      "God of War",
      "Marvel's Spider-Man Remastered",
      "Hogwarts Legacy",
      "Silent Hill 2",
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
    <div className="space-y-10 pb-16">
      {/* 1. Hero Showcase / Featured Section (Authentic Steam Store Style) */}
      <section className="relative bg-gradient-to-b from-[#171a21] via-[#1b2838] to-[#171a21] border-b border-[#2a475e]/40 pt-6 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Steam Live Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#16202d] border border-[#2a475e]/80 rounded-sm px-4 py-2.5 shadow-sm text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5ba32b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5ba32b]"></span>
              </span>
              <p className="text-[#c7d5e0]">
                <strong className="text-white">Store Vault Status:</strong>{" "}
                <span className="text-[#5ba32b] font-bold">245+ Titles</span> Included in Setup Guide · Single One-Time ₹300 Unlock
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[#8f98a0]">
              <WifiOff className="w-3.5 h-3.5 text-[#66c0f4]" />
              <span>100% Single-Player Offline Mode · Local PC Saves</span>
            </div>
          </div>

          {/* Hero Grid: Marketing Copy Left + Steam Carousel Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a475e]/40 border border-[#66c0f4]/30 rounded-sm text-xs font-bold text-[#66c0f4]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>245+ PC Games · Zero Account Sharing</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                PLAY PREMIUM PC GAMES.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66c0f4] via-[#1a9fff] to-emerald-400">
                  ON YOUR OWN PC. FOREVER.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#c7d5e0] leading-relaxed max-w-2xl">
                Stop paying thousands for individual titles or dealing with shared Steam accounts. Get the ultimate, step-by-step guide to unlocking and playing premium PC games forever on your own system.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/checkout"
                  className="btn-steam-cta px-7 py-3 rounded-sm text-sm font-bold shadow-ctaGlow flex items-center gap-2 text-white"
                >
                  <span>Unlock the Full Guide – ₹300</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href="#games-showcase"
                  className="btn-steam-panel px-5 py-3 rounded-sm text-sm font-bold flex items-center gap-2 border border-[#2a475e] text-[#c7d5e0] hover:text-white"
                >
                  <span>Browse 245+ Titles</span>
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

      {/* 2. What You Get (Clean Steam Feature Capsule Strip) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1b2838] border border-[#2a475e] rounded-sm p-5 shadow-lg space-y-4">
          <div className="border-b border-[#2a475e]/60 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-[#66c0f4] uppercase tracking-wider block">
                WHAT YOU GET FOR ₹300
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                Everything You Need to Play Immediately
              </h2>
            </div>
            <span className="text-xs text-[#8f98a0]">
              One-Time Payment · Lifetime Access · No Recurring Fees
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Benefit 1 */}
            <div className="bg-[#16202d] border border-[#2a475e]/60 p-3.5 rounded-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#66c0f4]/10 border border-[#66c0f4]/30 flex items-center justify-center text-[#66c0f4] flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">The Complete Setup Guide</h3>
                <p className="text-[11px] text-[#8f98a0] mt-0.5 leading-snug">
                  Easy, step-by-step instructions to configure your library in under 10 minutes.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#16202d] border border-[#2a475e]/60 p-3.5 rounded-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#5ba32b]/10 border border-[#5ba32b]/30 flex items-center justify-center text-[#5ba32b] flex-shrink-0">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">No Account Sharing</h3>
                <p className="text-[11px] text-[#8f98a0] mt-0.5 leading-snug">
                  Play directly on your own PC without being kicked off by other users.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#16202d] border border-[#2a475e]/60 p-3.5 rounded-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">Offline & Local Play</h3>
                <p className="text-[11px] text-[#8f98a0] mt-0.5 leading-snug">
                  Full access to single-player story modes, campaigns, and permanent local saves.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-[#16202d] border border-[#2a475e]/60 p-3.5 rounded-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">Lifetime Access</h3>
                <p className="text-[11px] text-[#8f98a0] mt-0.5 leading-snug">
                  Learn the method once and use it for all 245+ games with zero monthly charges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5. How It Works (3 Simple Steps to Trust & Play) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#171a21] border border-[#2a475e] rounded-sm p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a475e]/60 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#66c0f4] uppercase tracking-wider block">
                SIMPLE 3-STEP PROCESS
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                How to Unlock & Play in Under 10 Minutes
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#5ba32b] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#5ba32b]" />
              <span>48-Hour Money-Back Guarantee</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-[#1b2838] border border-[#2a475e]/70 p-4 rounded-sm space-y-2 relative group hover:border-[#66c0f4] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-sm bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-xs">
                  01
                </span>
                <span className="text-[10px] text-[#8f98a0] font-mono">STEP 1</span>
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">One-Time UPI Transfer (₹300)</h3>
              <p className="text-[11px] text-[#8f98a0] leading-relaxed">
                Scan our official UPI QR code or pay to VPA. No cards, no hidden charges, and zero recurring monthly fees.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1b2838] border border-[#2a475e]/70 p-4 rounded-sm space-y-2 relative group hover:border-[#66c0f4] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-sm bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-xs">
                  02
                </span>
                <span className="text-[10px] text-[#8f98a0] font-mono">STEP 2</span>
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">Fast-Track Admin Verification</h3>
              <p className="text-[11px] text-[#8f98a0] leading-relaxed">
                Submit your 12-digit UTR. Our admin verifies it within minutes and unlocks your full visual Setup Dashboard.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1b2838] border border-[#2a475e]/70 p-4 rounded-sm space-y-2 relative group hover:border-[#5ba32b] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-sm bg-[#5ba32b] text-white font-black flex items-center justify-center text-xs">
                  03
                </span>
                <span className="text-[10px] text-[#5ba32b] font-mono font-bold">READY</span>
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">Play 245+ Titles On Your PC</h3>
              <p className="text-[11px] text-[#8f98a0] leading-relaxed">
                Follow the 10-minute visual guide. Play story modes offline with local saves on your PC without getting kicked off.
              </p>
            </div>
          </div>

          {/* Transparent Live Admin Support Bar */}
          <div className="bg-[#121922] border border-[#2a475e]/60 rounded-sm p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25d366]"></span>
              </span>
              <p className="text-[#c7d5e0]">
                <strong>Need pre-purchase help or setup guidance?</strong> Admin is online 24/7 on WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#25d366] hover:underline font-bold whitespace-nowrap"
            >
              <span>Chat with Admin on WhatsApp →</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Catalog Section: Games You Can Play With This Setup */}
      <div id="games-showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-2">
        {/* Section Header */}
        <div className="border-b border-[#2a475e] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              GAMES YOU CAN PLAY WITH THIS SETUP
            </h2>
            <p className="text-xs text-[#8f98a0] mt-0.5">
              All 245+ titles below are included with your ₹300 setup guide. No individual purchases needed.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-[#66c0f4] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Browse All 245+ Titles <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category 1: Hot Blockbusters */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#2a475e]/40 pb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400 fill-red-400" />
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Hot Blockbusters
              </h3>
            </div>
            <span className="text-[11px] text-[#5ba32b] font-medium">Included in Guide</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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

        {/* Category 2: Popular Franchises */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#2a475e]/40 pb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#66c0f4] fill-[#66c0f4]" />
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Popular Franchises
              </h3>
            </div>
            <span className="text-[11px] text-[#5ba32b] font-medium">Included in Guide</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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

        {/* Category 3: Acclaimed Masterpieces */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#2a475e]/40 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-300" />
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Acclaimed Masterpieces
              </h3>
            </div>
            <span className="text-[11px] text-[#5ba32b] font-medium">Included in Guide</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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

        {/* Category 4: Verified Offline OK */}
        {verifiedOfflineGames.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#2a475e]/40 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5ba32b]" />
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  Verified Offline OK
                </h3>
              </div>
              <span className="text-[11px] text-[#5ba32b] font-medium">Tested on Hardware</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {verifiedOfflineGames.map((game) => (
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
        )}

        {/* Category 5: Classic Favorites */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#2a475e]/40 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Classic Favorites & Indies
              </h3>
            </div>
            <span className="text-[11px] text-[#5ba32b] font-medium">Included in Guide</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
      </div>

      {/* 4. Bottom CTA Banner (Clean Steam Store Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-[#1b2838] border border-[#2a475e] rounded-sm p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-wide">
            Ready to Play Over 245+ PC Games On Your Own System?
          </h2>
          <p className="text-xs sm:text-sm text-[#c7d5e0] max-w-2xl mx-auto leading-relaxed">
            Get the full setup walkthrough, complete game library access, and play forever without paying thousands or fighting for shared accounts.
          </p>
          <div className="pt-2">
            <Link
              href="/checkout"
              className="btn-steam-cta text-sm px-8 py-3.5 rounded-sm font-bold shadow-ctaGlow inline-flex items-center gap-2 text-white"
            >
              <span>Unlock the Full Guide – ₹300</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
