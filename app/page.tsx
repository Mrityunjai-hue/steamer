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
  Users,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch featured tiers and verified offline games from DB
  const [hotGames, popularGames, standardGames, budgetGames, verifiedOfflineGames] =
    await Promise.all([
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

  // Capacity stats
  const maxRentersSetting = await prisma.systemSetting.findUnique({
    where: { key: "max_active_renters" },
  });
  const totalSlots = maxRentersSetting ? parseInt(maxRentersSetting.value, 10) : 8;
  const activeSubs = await prisma.subscription.count({ where: { status: "ACTIVE" } });
  const slotsLeft = Math.max(0, totalSlots - activeSubs);

  // Curated list of high-hype flagship blockbusters for the Hero Carousel
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

  // Fetch premier hero games specifically, with fallback to any Hot games
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

  const sortedHeroGames = [...featuredGamesRaw].sort((a, b) => {
    const idxA = highHypeTitles.indexOf(a.title);
    const idxB = highHypeTitles.indexOf(b.title);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  }).slice(0, 8);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Showcase Carousel / Feature Banner */}
      <section className="relative bg-gradient-to-b from-[#171a21] via-[#1b2838] to-[#1b2838] border-b border-[#2a475e]/40 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Trust & Live Capacity Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#16202d]/80 border border-[#2a475e]/80 rounded-lg p-3.5 mb-8 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5ba32b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5ba32b]"></span>
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#c7d5e0]">
                <strong>Capacity Status:</strong>{" "}
                <span className="text-[#5ba32b] font-bold">{slotsLeft} of {totalSlots} active slots</span> available this month
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8f98a0]">
              <WifiOff className="w-4 h-4 text-[#66c0f4]" />
              <span>100% Single-Player Offline Mode Only</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a475e]/50 border border-[#66c0f4]/40 rounded-full text-xs font-bold text-[#66c0f4]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>245+ Blockbuster PC Games · 30-Day Flexible Rentals</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                RENT GAMES. PLAY OFFLINE.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66c0f4] via-[#1a9fff] to-emerald-400">
                  BUILT ON TRUST.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#8f98a0] leading-relaxed max-w-2xl">
                Experience AAA single-player masterpieces without paying full price. Rent individual games from ₹39/mo, build bundles capped at ₹149 & ₹199, or unlock the entire vault with our All-Access Pass for just ₹300/month.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/catalog"
                  className="btn-steam-cta px-6 py-3 rounded text-sm font-bold shadow-ctaGlow flex items-center gap-2"
                >
                  Browse 245+ Titles <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/legal/disclosure"
                  className="btn-steam-panel px-5 py-3 rounded text-sm font-bold flex items-center gap-2 border border-[#2a475e]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#66c0f4]" /> Read Trust Model
                </Link>
              </div>
            </div>

            {/* Dynamic Shuffling Featured Hero Carousel */}
            <div className="lg:col-span-5">
              <FeaturedHeroCarousel games={sortedHeroGames} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Built on Trust Banner (Mandatory Rule) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#171a21] via-[#2a475e]/50 to-[#171a21] border border-[#66c0f4]/30 rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-panelGlow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#66c0f4]/10 border border-[#66c0f4]/30 rounded-lg flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#66c0f4]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                BUILT ON TRUST ARCHITECTURE
              </h3>
              <p className="text-xs sm:text-sm text-[#c7d5e0] leading-relaxed max-w-3xl">
                {brandConfig.trustBanner}
              </p>
            </div>
          </div>
          <Link
            href="/legal/disclosure"
            className="flex-shrink-0 text-xs font-bold text-white bg-[#2a475e] hover:bg-[#3a6282] border border-[#66c0f4]/40 px-4 py-2.5 rounded transition-all"
          >
            Read Our Trust Pledge
          </Link>
        </div>
      </section>

      {/* 3. All-Access Pass Banner (₹300/Month) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/80 via-[#16202d] to-sky-950/80 border border-emerald-500/40 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              Best Value Subscription
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ALL-ACCESS PASS — PLAY EVERYTHING
            </h2>
            <p className="text-xs sm:text-sm text-[#c7d5e0] max-w-2xl leading-relaxed">
              Why pick just one or two? Get unlimited monthly rental access to all 240+ purchasable titles across every series — GTA, God of War, Spider-Man, Resident Evil, Assassin&apos;s Creed, and more.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            <div className="text-center sm:text-right">
              <div className="text-3xl font-black text-[#5ba32b]">₹300</div>
              <div className="text-xs text-[#8f98a0]">per 30 days · No auto-renew</div>
            </div>
            <Link
              href="/checkout?allAccess=true"
              className="btn-steam-cta text-sm px-6 py-3 rounded font-bold whitespace-nowrap shadow-ctaGlow"
            >
              Get All-Access Pass
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Hot Releases (₹99/Month) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400 fill-red-400" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
              HOT RELEASES (₹99 / MO)
            </h2>
          </div>
          <Link
            href="/catalog?tier=Hot"
            className="text-xs font-bold text-[#66c0f4] hover:underline flex items-center gap-1"
          >
            View all ({hotGames.length}+) <ChevronRight className="w-3.5 h-3.5" />
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
              ourMonthlyPriceINR={game.ourMonthlyPriceINR}
              steamPriceINR={game.steamPriceINR}
              offlineTag={game.offlineTag}
              testedOfflineOn={game.testedOfflineOn}
              launcher={game.launcher}
              headerImage={game.headerImage}
              purchasableAsSingle={game.purchasableAsSingle}
            />
          ))}
        </div>
      </section>

      {/* 5. Popular Blockbusters (₹79/Month) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#66c0f4] fill-[#66c0f4]" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
              POPULAR HITS (₹79 / MO)
            </h2>
          </div>
          <Link
            href="/catalog?tier=Popular"
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
              ourMonthlyPriceINR={game.ourMonthlyPriceINR}
              steamPriceINR={game.steamPriceINR}
              offlineTag={game.offlineTag}
              testedOfflineOn={game.testedOfflineOn}
              launcher={game.launcher}
              headerImage={game.headerImage}
              purchasableAsSingle={game.purchasableAsSingle}
            />
          ))}
        </div>
      </section>

      {/* 6. Standard & Evergreen (₹59/Month) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
              STANDARD MASTERPIECES (₹59 / MO)
            </h2>
          </div>
          <Link
            href="/catalog?tier=Standard"
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
              ourMonthlyPriceINR={game.ourMonthlyPriceINR}
              steamPriceINR={game.steamPriceINR}
              offlineTag={game.offlineTag}
              testedOfflineOn={game.testedOfflineOn}
              launcher={game.launcher}
              headerImage={game.headerImage}
              purchasableAsSingle={game.purchasableAsSingle}
            />
          ))}
        </div>
      </section>

      {/* 7. Budget Classics (₹39/Month) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
              BUDGET CLASSICS (₹39 / MO)
            </h2>
          </div>
          <Link
            href="/catalog?tier=Budget"
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
              ourMonthlyPriceINR={game.ourMonthlyPriceINR}
              steamPriceINR={game.steamPriceINR}
              offlineTag={game.offlineTag}
              testedOfflineOn={game.testedOfflineOn}
              launcher={game.launcher}
              headerImage={game.headerImage}
              purchasableAsSingle={game.purchasableAsSingle}
            />
          ))}
        </div>
      </section>

      {/* 8. Verified Offline OK Showcase */}
      {verifiedOfflineGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#5ba32b]" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                TESTED & VERIFIED OFFLINE OK
              </h2>
            </div>
            <span className="text-xs text-[#8f98a0]">Tested directly on hardware</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {verifiedOfflineGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                series={game.series?.name}
                hypeTier={game.hypeTier}
                ourMonthlyPriceINR={game.ourMonthlyPriceINR}
                steamPriceINR={game.steamPriceINR}
                offlineTag={game.offlineTag}
                testedOfflineOn={game.testedOfflineOn}
                launcher={game.launcher}
                headerImage={game.headerImage}
                purchasableAsSingle={game.purchasableAsSingle}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. Simple 4-Step How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-[#171a21] border border-[#2a475e]/80 rounded-xl p-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-white text-center tracking-wide">
            HOW STEAMER WORKS IN 4 EASY STEPS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#16202d] border border-[#2a475e]/40 p-5 rounded-lg space-y-2">
              <div className="w-7 h-7 rounded-full bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Choose Your Games</h4>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Pick 1, 2, or 3 games or the ₹300 All-Access Pass. Caps apply automatically to save you money.
              </p>
            </div>

            <div className="bg-[#16202d] border border-[#2a475e]/40 p-5 rounded-lg space-y-2">
              <div className="w-7 h-7 rounded-full bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Consent & Direct UPI</h4>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Accept the Trust Pledge and transfer rent via your UPI app with your unique Order ID.
              </p>
            </div>

            <div className="bg-[#16202d] border border-[#2a475e]/40 p-5 rounded-lg space-y-2">
              <div className="w-7 h-7 rounded-full bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Setup Window</h4>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Admin shares account access over WhatsApp for your exclusive download slot.
              </p>
            </div>

            <div className="bg-[#16202d] border border-[#2a475e]/40 p-5 rounded-lg space-y-2">
              <div className="w-7 h-7 rounded-full bg-[#5ba32b] text-white font-black flex items-center justify-center text-sm">
                4
              </div>
              <h4 className="font-bold text-white text-sm">Switch to Offline Mode</h4>
              <p className="text-xs text-[#8f98a0] leading-relaxed">
                Switch Steam to Offline Mode, confirm in the app, and play all month on your own time!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

