import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import GameCard from "@/components/GameCard";
import {
  ShieldCheck,
  CheckCircle2,
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
      fixManifests: {
        take: 1,
      },
    },
  });

  if (!game) {
    notFound();
  }

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

  const isVerifiedOffline = game.offlineTag === "Offline OK" && !!game.testedOfflineOn;
  const guidePrice = 300;
  const savings = game.steamPriceINR ? Math.max(0, game.steamPriceINR - guidePrice) : 0;

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
              <WifiOff className="w-4 h-4 text-[#66c0f4]" /> Platform & Setup Requirements
            </h3>
            <ul className="text-xs text-[#c7d5e0] space-y-1.5 list-disc list-inside">
              <li>
                <strong>Launcher:</strong> {game.launcher} (Offline Mode configuration)
              </li>
              <li>
                <strong>Offline Status:</strong> {isVerifiedOffline ? `Verified offline on ${game.testedOfflineOn ? new Date(game.testedOfflineOn).toLocaleDateString() : "test bench"}` : "Single-player story mode supported for offline play."}
              </li>
              <li>
                <strong>Access:</strong> Included in the ₹300 Complete PC Setup Guide along with 265+ other games.
              </li>
              {game.adminNote && (
                <li className="text-amber-300 font-medium">
                  <strong>Notice:</strong> {game.adminNote}
                </li>
              )}
            </ul>
          </div>

          {/* Verified Manifest Fix Callout Box */}
          {game.fixManifests?.[0] && (
            <div className="bg-[#121922] border border-[#66c0f4]/50 rounded-lg p-4 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#66c0f4] flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#66c0f4]" /> Verified Manifest Fix Available
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {game.fixManifests[0].sourceToolkit}
                </span>
              </div>
              <p className="text-xs text-[#c7d5e0] leading-relaxed">
                Requires <strong>{game.fixManifests[0].launcher}</strong> offline manifest bypass. Verified working for single-player story mode on personal machines.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-[#2a475e]/40">
                <code className="text-[10px] font-mono text-[#8f98a0]">
                  Target: {game.fixManifests[0].targetDirectory}
                </code>
                <Link
                  href={`/community/game-help?search=${encodeURIComponent(game.title)}`}
                  className="text-xs font-bold text-[#66c0f4] hover:underline flex items-center gap-1"
                >
                  View Fix &amp; Manifest →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Add to Cart Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1b2838] border border-[#2a475e] rounded-sm p-6 shadow-xl space-y-6 sticky top-24">
            <div className="border-b border-[#2a475e]/60 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#beee11] uppercase tracking-wider bg-[#4c6b22] px-2 py-0.5 rounded-sm">
                  INCLUDED IN GUIDE
                </span>
                <span className="text-[11px] text-[#8f98a0]">Lifetime games access in your personal Steam</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-3xl font-black text-[#5ba32b]">
                    ₹{guidePrice}
                  </span>
                  <span className="text-xs text-[#8f98a0]"> / full guide</span>
                </div>
                {game.steamPriceINR && (
                  <div className="text-right">
                    <span className="text-xs text-[#8f98a0] line-through block font-mono">
                      Steam: ₹{game.steamPriceINR.toLocaleString("en-IN")}
                    </span>
                    {savings > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Save ₹{savings.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Value Highlights */}
            <div className="bg-[#16202d] border border-[#2a475e]/50 p-3.5 rounded-sm text-xs text-[#c7d5e0] space-y-2">
              <p className="font-bold text-white">What You Get for ₹{guidePrice}:</p>
              <ul className="text-[11px] text-[#8f98a0] space-y-1">
                <li>• Complete Setup Guide (under 10 mins)</li>
                <li>• Play <strong>{game.title}</strong> + 245 more games</li>
                <li>• No account sharing · Directly on your Steam account</li>
                <li>• Offline & local saves with lifetime updates</li>
              </ul>
            </div>

            {/* Direct Action Buttons */}
            <div className="space-y-3">
              {userCompleted ? (
                <>
                  <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded text-center space-y-1">
                    <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Game Included in Your Vault
                    </p>
                    <p className="text-[10px] text-[#8f98a0]">
                      Lifetime offline access active in your personal Steam.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="w-full btn-steam-cta py-3.5 rounded-sm text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow"
                  >
                    Open Your Library &amp; Guide
                  </Link>
                  <Link
                    href="/checkout?renew=true"
                    className="w-full btn-steam-panel py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1.5 border border-[#2a475e] text-[#66c0f4] hover:text-white"
                  >
                    Switched PC? Renew Setup Window
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/checkout"
                    className="w-full btn-steam-cta py-3.5 rounded-sm text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow"
                  >
                    Unlock the Full Guide – ₹{guidePrice}
                  </Link>
                  <Link
                    href="/catalog"
                    className="w-full btn-steam-panel py-2.5 rounded-sm text-xs font-bold flex items-center justify-center gap-1.5 border border-[#2a475e]"
                  >
                    Browse All 265+ Included Games
                  </Link>
                </>
              )}
            </div>

            <div className="text-[11px] text-[#8f98a0]/80 space-y-1 border-t border-[#2a475e]/40 pt-4">
              <p>✓ Play directly on your Steam account</p>
              <p>✓ One-time flat payment via UPI</p>
              <p>✓ Admin verification & instant guide unlock</p>
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

