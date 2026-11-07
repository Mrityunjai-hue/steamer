import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import GameCard from "@/components/GameCard";
import FeaturedHeroCarousel from "@/components/FeaturedHeroCarousel";
import ReviewsSection from "@/components/ReviewsSection";
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
  Gamepad2,
  MessageSquare,
  Key,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { brandConfig } from "@/config/brand";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  let userCompleted = false;
  if (session?.userId) {
    const completedWindow = await prisma.setupWindow.findFirst({
      where: {
        userId: session.userId,
        OR: [{ status: "COMPLETED" }, { offlineConfirmed: true }],
      },
    });
    const completedOrder = await prisma.order.findFirst({
      where: { userId: session.userId, status: "COMPLETED" },
    });
    if (completedWindow || completedOrder) {
      userCompleted = true;
    }
  }

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
                <strong className="text-white">STEAMER ALL-ACCESS PASS:</strong>{" "}
                <span className="text-[#5ba32b] font-bold">265+ Blockbuster Titles</span> · ₹300 Flat One-Time Unlock · Zero Account Sharing
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a475e]/50 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-[#5ba32b] animate-pulse" />
                <span>Get 265 Games of Your Choice for ₹300</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                GET 265 GAMES OF YOUR CHOICE{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66c0f4] via-[#1a9fff] to-emerald-400">
                  FOR ₹300.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#c7d5e0] leading-relaxed max-w-2xl">
                Stop paying thousands for individual titles or dealing with shared account collisions. Choose any of our 265+ blockbuster PC games and play them on your Steam account directly with permanent local saves.
              </p>

              {/* Amenity Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#c7d5e0] pt-1">
                <div className="flex items-center gap-1.5 bg-[#16202d] border border-[#2a475e]/60 px-2.5 py-1.5 rounded">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#66c0f4]" />
                  <span>265+ Premium Titles</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#16202d] border border-[#2a475e]/60 px-2.5 py-1.5 rounded">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>10-Min Fast-Track Setup</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#16202d] border border-[#2a475e]/60 px-2.5 py-1.5 rounded">
                  <Laptop className="w-3.5 h-3.5 text-[#5ba32b]" />
                  <span>Zero Account Sharing</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#16202d] border border-[#2a475e]/60 px-2.5 py-1.5 rounded">
                  <WifiOff className="w-3.5 h-3.5 text-sky-400" />
                  <span>Permanent Local Saves</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#16202d] border border-[#2a475e]/60 px-2.5 py-1.5 rounded">
                  <MessageSquare className="w-3.5 h-3.5 text-[#25d366]" />
                  <span>1-on-1 WhatsApp Support</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#16202d] border border-[#2a475e]/60 px-2.5 py-1.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>48-Hr Money-Back Guarantee</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {userCompleted ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="btn-steam-cta px-7 py-3 rounded text-sm font-bold shadow-ctaGlow flex items-center gap-2 text-white"
                    >
                      <span>Open Your Vault &amp; Library</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/checkout?renew=true"
                      className="btn-steam-panel px-5 py-3 rounded text-sm font-bold flex items-center gap-2 border border-[#2a475e] text-[#66c0f4] hover:text-white"
                    >
                      <span>Renew Setup Window</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/checkout"
                      className="btn-steam-cta px-7 py-3 rounded text-sm font-bold shadow-ctaGlow flex items-center gap-2 text-white"
                    >
                      <span>Get 265 Games for ₹300</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#amenities-breakdown"
                      className="btn-steam-panel px-5 py-3 rounded text-sm font-bold flex items-center gap-2 border border-[#2a475e] text-[#c7d5e0] hover:text-white"
                    >
                      <span>See What&apos;s Included</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Dynamic Featured Showcase Carousel */}
            <div className="lg:col-span-5">
              <FeaturedHeroCarousel games={sortedHeroGames} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. What You Get (All-Access Plan Amenities & Inclusions) */}
      <section id="amenities-breakdown" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1b2838] border border-[#2a475e] rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-[#2a475e]/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                THE STEAMER ALL-ACCESS AMENITIES (₹300 FLAT)
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Everything Included In Your Setup Pass
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white font-bold bg-[#16202d] border border-emerald-500/40 px-3 py-1 rounded-full text-emerald-400">
                ₹300 One-Time · Lifetime games access in your personal Steam
              </span>
            </div>
          </div>

          {/* 6 Comprehensive Amenities Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Amenity 1 */}
            <div className="bg-[#16202d] border border-[#2a475e]/70 p-5 rounded-lg space-y-2 hover:border-[#66c0f4] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#66c0f4]/10 border border-[#66c0f4]/30 flex items-center justify-center text-[#66c0f4]">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">265+ AAA & Indie Games</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Play blockbusters like GTA V, RDR 2, Cyberpunk 2077, Elden Ring, Black Myth: Wukong, God of War, Spider-Man, and hundreds more without buying separate copies.
              </p>
            </div>

            {/* Amenity 2 */}
            <div className="bg-[#16202d] border border-[#2a475e]/70 p-5 rounded-lg space-y-2 hover:border-[#5ba32b] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#5ba32b]/10 border border-[#5ba32b]/30 flex items-center justify-center text-[#5ba32b]">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Zero Account Sharing & No Queues</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                No waiting for someone else to log out. No scheduled setup queues. The guide links manifests to your personal machine so you play independently anytime.
              </p>
            </div>

            {/* Amenity 3 */}
            <div className="bg-[#16202d] border border-[#2a475e]/70 p-5 rounded-lg space-y-2 hover:border-amber-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Visual Walkthrough & Video Tutorial</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Step-by-step instructions with enlarged screenshot previews, highlighted buttons, and an embedded video player for a foolproof 10-minute setup.
              </p>
            </div>

            {/* Amenity 4 */}
            <div className="bg-[#16202d] border border-[#2a475e]/70 p-5 rounded-lg space-y-2 hover:border-sky-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">100% Offline Mode & Local Saves</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Enjoy complete single-player campaigns, story modes, and mods. All progress and save files are activated on your Steam account directly with permanent local saves.
              </p>
            </div>

            {/* Amenity 5 */}
            <div className="bg-[#16202d] border border-[#2a475e]/70 p-5 rounded-lg space-y-2 hover:border-emerald-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Instant Secret Access Link</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Zero friction: guest checkout available without needing to create a password upfront. Receive your private access URL immediately after payment.
              </p>
            </div>

            {/* Amenity 6 */}
            <div className="bg-[#16202d] border border-[#2a475e]/70 p-5 rounded-lg space-y-2 hover:border-[#25d366] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#25d366]/10 border border-[#25d366]/30 flex items-center justify-center text-[#25d366]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">1-on-1 WhatsApp Support</h3>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Direct admin assistance on WhatsApp daily from 10:00 AM to 11:00 PM IST. If you ever get stuck, we walk you through until your games are ready to play.
              </p>
            </div>
          </div>

          {/* Value Comparison Strip */}
          <div className="bg-[#16202d] border border-[#2a475e] p-5 rounded-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Why Gamers Choose the Steamer All-Access Pass:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#171a21] border border-[#2a475e]/50 rounded space-y-1">
                <span className="text-[#8f98a0] font-bold block">Buying Separately</span>
                <p className="text-red-400 font-extrabold text-sm">₹50,000+ Total</p>
                <p className="text-[11px] text-[#8f98a0]">
                  Buying 265+ AAA games individually at retail costs a fortune.
                </p>
              </div>
              <div className="p-3 bg-[#171a21] border border-[#2a475e]/50 rounded space-y-1">
                <span className="text-[#8f98a0] font-bold block">Account Rentals</span>
                <p className="text-amber-400 font-extrabold text-sm">High Frustration</p>
                <p className="text-[11px] text-[#8f98a0]">
                  Frequent kicks, login collisions, queue delays, and lost save files.
                </p>
              </div>
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded space-y-1">
                <span className="text-emerald-400 font-bold block">Steamer All-Access Pass</span>
                <p className="text-emerald-300 font-extrabold text-sm">₹300 One-Time Flat</p>
                <p className="text-[11px] text-[#c7d5e0]">
                  Directly to your Steam account, offline forever, 265+ titles, and 48-Hour Money-Back Guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5. How It Works (3 Simple Steps to Trust & Play) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a475e]/60 pb-3">
            <div>
              <span className="text-xs font-bold text-[#66c0f4] uppercase tracking-wider block">
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
            <div className="bg-[#1b2838] border border-[#2a475e]/70 p-4 rounded-lg space-y-2 relative group hover:border-[#66c0f4] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-xs">
                  01
                </span>
                <span className="text-[10px] text-[#8f98a0] font-mono">STEP 1</span>
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">One-Time UPI Transfer (₹300)</h3>
              <p className="text-[11px] text-[#8f98a0] leading-relaxed">
                Scan our official UPI QR code or pay to VPA. No credit cards needed, no hidden fees, and zero recurring monthly charges.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1b2838] border border-[#2a475e]/70 p-4 rounded-lg space-y-2 relative group hover:border-[#66c0f4] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-xs">
                  02
                </span>
                <span className="text-[10px] text-[#8f98a0] font-mono">STEP 2</span>
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">Instant Access Link</h3>
              <p className="text-[11px] text-[#8f98a0] leading-relaxed">
                Submit your 12-digit UTR and get your private secret access link immediately. No mandatory password required.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1b2838] border border-[#2a475e]/70 p-4 rounded-lg space-y-2 relative group hover:border-[#5ba32b] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded bg-[#5ba32b] text-white font-black flex items-center justify-center text-xs">
                  03
                </span>
                <span className="text-[10px] text-[#5ba32b] font-mono font-bold">READY</span>
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">Play 265+ Titles On Your Steam Account Directly</h3>
              <p className="text-[11px] text-[#8f98a0] leading-relaxed">
                Follow the 10-minute visual guide. Play story modes offline with local saves on your Steam account directly without getting kicked off.
              </p>
            </div>
          </div>

          {/* Transparent Live Admin Support Bar */}
          <div className="bg-[#121922] border border-[#2a475e]/60 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25d366]"></span>
              </span>
              <p className="text-[#c7d5e0]">
                <strong>Questions before purchasing?</strong> Our team is online on WhatsApp (Primary Channel) to assist you.
              </p>
            </div>
            <a
              href={brandConfig.whatsappHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#25d366] hover:underline font-bold whitespace-nowrap"
            >
              <span>Chat on WhatsApp →</span>
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
              GET 265 GAMES OF YOUR CHOICE FOR ₹300
            </h2>
            <p className="text-xs text-[#8f98a0] mt-0.5">
              All 265+ blockbuster titles below are included directly on your Steam account. No individual purchases needed.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-[#66c0f4] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Browse All 265+ Titles <ChevronRight className="w-3.5 h-3.5" />
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

      {/* 3.5. Verified Gamer Reviews & Proof */}
      <ReviewsSection />

      {/* 4. Bottom CTA Banner (Clean Steam Store Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-[#1b2838] border border-[#2a475e] rounded-sm p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-wide">
            Ready to Play Over 265+ PC Games Directly on Your Steam Account?
          </h2>
          <p className="text-xs sm:text-sm text-[#c7d5e0] max-w-2xl mx-auto leading-relaxed">
            Get the full setup walkthrough, complete game library access, and play directly to your Steam account forever without paying thousands or fighting for shared accounts.
          </p>
          <div className="pt-2">
            {userCompleted ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="btn-steam-cta text-sm px-8 py-3.5 rounded-sm font-bold shadow-ctaGlow inline-flex items-center gap-2 text-white"
                >
                  <span>Vault Active • Open Library</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/checkout?renew=true"
                  className="btn-steam-panel text-sm px-6 py-3.5 rounded-sm font-bold border border-[#2a475e] inline-flex items-center gap-2 text-[#66c0f4] hover:text-white"
                >
                  <span>Switched PC? Renew Setup Window</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/checkout"
                className="btn-steam-cta text-sm px-8 py-3.5 rounded-sm font-bold shadow-ctaGlow inline-flex items-center gap-2 text-white"
              >
                <span>Get 265 Games of Your Choice for ₹300</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
