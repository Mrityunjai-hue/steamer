import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GameCard from "@/components/GameCard";
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  Star,
  Award,
  Sparkles,
  MessageCircle,
  WifiOff,
  Plus,
  ArrowLeft,
  Calendar,
  Layers,
} from "lucide-react";

export const revalidate = 60;

export default async function GameDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: {
      series: {
        include: {
          games: {
            where: { id: { not: params.id } },
            take: 4,
          },
        },
      },
      threads: {
        take: 3,
        include: {
          author: { select: { email: true, profile: { select: { displayName: true } } } },
          _count: { select: { posts: true } },
        },
      },
    },
  });

  if (!game) {
    notFound();
  }

  const isVerifiedOffline = game.offlineTag === "Offline OK" && !!game.testedOfflineOn;
  const savings = game.steamPriceINR ? Math.max(0, game.steamPriceINR - game.ourMonthlyPriceINR) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-xs text-[#8f98a0] hover:text-[#66c0f4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Big Header Art & Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-[460/215] w-full rounded-xl overflow-hidden bg-[#16202d] border border-[#2a475e] shadow-2xl">
            {game.headerImage ? (
              <Image
                src={game.headerImage}
                alt={game.title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#171a21] to-[#2a475e] text-center">
                <span className="text-3xl font-black text-white">{game.title}</span>
                <span className="text-sm text-[#8f98a0] mt-1">{game.series?.name} Series</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 text-xs font-black uppercase rounded bg-[#171a21]/90 text-white border border-[#2a475e]">
                {game.hypeTier} Tier
              </span>
              {isVerifiedOffline ? (
                <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-[#5ba32b]/90 text-white">
                  <ShieldCheck className="w-3.5 h-3.5" /> Offline OK (Verified)
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                  Not yet verified
                </span>
              )}
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
              {game.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8f98a0]">
              {game.series?.name && (
                <span className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-[#66c0f4]" />
                  <span>Series: <strong className="text-white">{game.series.name}</strong></span>
                </span>
              )}
              {game.releaseDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#66c0f4]" />
                  <span>Release: <strong className="text-white">{game.releaseDate}</strong></span>
                </span>
              )}
              {game.genres && (
                <span>Genres: <strong className="text-white">{game.genres}</strong></span>
              )}
            </div>
          </div>

          {/* Launcher & Offline Notice Box */}
          <div className="bg-[#171a21] border border-[#2a475e] rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-[#66c0f4]" /> Platform & Offline Requirements
            </h3>
            <ul className="text-xs text-[#c7d5e0] space-y-1.5 list-disc list-inside">
              <li>
                <strong>Launcher:</strong> {game.launcher} (shared business credentials relayed on WhatsApp)
              </li>
              <li>
                <strong>Offline Status:</strong> {isVerifiedOffline ? `Verified offline on ${game.testedOfflineOn ? new Date(game.testedOfflineOn).toLocaleDateString() : "test bench"}` : "Unverified. Single-player mode is intended for offline play."}
              </li>
              {game.adminNote && (
                <li className="text-amber-300 font-medium">
                  <strong>Notice:</strong> {game.adminNote}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column: Pricing & Add to Cart Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 shadow-xl space-y-6 sticky top-24">
            <div className="border-b border-[#2a475e]/60 pb-4 space-y-2">
              <span className="text-[11px] font-bold text-[#8f98a0] uppercase tracking-wider">
                Monthly Rental Access
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-[#5ba32b]">
                    ₹{game.ourMonthlyPriceINR}
                  </span>
                  <span className="text-xs text-[#8f98a0]"> / 30 days</span>
                </div>
                {game.steamPriceINR && (
                  <div className="text-right">
                    <span className="text-xs text-[#8f98a0] line-through block">
                      Steam: ₹{game.steamPriceINR.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Save ₹{savings.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bundle cap reminder */}
            <div className="bg-[#16202d] border border-[#2a475e]/50 p-3.5 rounded-lg text-xs text-[#c7d5e0] space-y-1">
              <p className="font-bold text-white">Combine & Save with Automatic Caps:</p>
              <p className="text-[11px] text-[#8f98a0]">
                • 2 games capped at ₹149 total<br />
                • 3 games capped at ₹199 total<br />
                • All-Access Pass (240+ games) for ₹300
              </p>
            </div>

            {/* Direct Action Buttons */}
            {game.purchasableAsSingle ? (
              <div className="space-y-3">
                <Link
                  href={`/checkout?gameId=${game.id}`}
                  className="w-full btn-steam-cta py-3 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow"
                >
                  <Plus className="w-4 h-4" /> Rent Single Game (₹{game.ourMonthlyPriceINR})
                </Link>
                <Link
                  href={`/cart`}
                  className="w-full btn-steam-panel py-2.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 border border-[#2a475e]"
                >
                  View Bundle in Cart
                </Link>
              </div>
            ) : (
              <div className="p-3 bg-red-950/40 border border-red-800/40 rounded text-center text-xs text-red-300">
                Online-only title. Not available for standalone offline rental.
              </div>
            )}

            <div className="text-[11px] text-[#8f98a0]/80 space-y-1 border-t border-[#2a475e]/40 pt-4">
              <p>✓ 1 registered gaming PC</p>
              <p>✓ Dedicated setup window for downloads</p>
              <p>✓ 1 free game swap per 30-day period</p>
              <p>✓ Built on Trust Pledge system</p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Games from Same Series */}
      {game.series?.games && game.series.games.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#2a475e]/60">
          <h3 className="text-lg font-black text-white tracking-wide">
            MORE FROM THE {game.series.name.toUpperCase()} SERIES
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {game.series.games.map((sg) => (
              <GameCard
                key={sg.id}
                id={sg.id}
                title={sg.title}
                series={game.series?.name}
                hypeTier={sg.hypeTier}
                ourMonthlyPriceINR={sg.ourMonthlyPriceINR}
                steamPriceINR={sg.steamPriceINR}
                offlineTag={sg.offlineTag}
                testedOfflineOn={sg.testedOfflineOn}
                launcher={sg.launcher}
                headerImage={sg.headerImage}
                purchasableAsSingle={sg.purchasableAsSingle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Community Discussion Tab */}
      <div className="space-y-4 pt-6 border-t border-[#2a475e]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#66c0f4]" />
            <h3 className="text-lg font-black text-white tracking-wide">
              COMMUNITY DISCUSSIONS FOR {game.title.toUpperCase()}
            </h3>
          </div>
          <Link
            href={`/community?gameId=${game.id}`}
            className="text-xs font-bold text-[#66c0f4] hover:underline"
          >
            Start a new thread
          </Link>
        </div>

        {game.threads.length === 0 ? (
          <div className="bg-[#171a21] border border-[#2a475e]/50 p-6 rounded-lg text-center text-xs text-[#8f98a0]">
            No discussion threads yet for this game. Be the first to share offline setup tips or performance advice!
          </div>
        ) : (
          <div className="space-y-2">
            {game.threads.map((t) => (
              <Link
                key={t.id}
                href={`/community/thread/${t.id}`}
                className="block bg-[#171a21] hover:bg-[#2a475e]/40 border border-[#2a475e] p-3.5 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white hover:text-[#66c0f4]">{t.title}</h4>
                  <span className="text-xs text-[#8f98a0]">{t._count.posts} replies</span>
                </div>
                <p className="text-[11px] text-[#8f98a0] mt-1">
                  Posted by {t.author.profile?.displayName || "Gamer"} · {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

