"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2,
  RefreshCw,
  WifiOff,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Clock,
  BookOpen,
  Layers,
} from "lucide-react";

export default function MyGamesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          window.location.href = "/auth/login";
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
        <p className="text-xs text-[#8f98a0]">Loading your offline vault...</p>
      </div>
    );
  }

  const activeSub = user?.activeSubscription;
  const games = activeSub?.games || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            MY GAMES & OFFLINE PLAY GUIDES
          </h1>
          <p className="text-xs sm:text-sm text-[#8f98a0]">
            Authorized games in your active {activeSub?.type || "None"} rental cycle.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="btn-steam-accent text-xs px-4 py-2 rounded font-bold flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4" /> Setup Guide Walkthrough
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <Gamepad2 className="w-12 h-12 text-[#66c0f4] mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-white">No Games in Your Plan</h3>
          <p className="text-xs text-[#8f98a0]">
            {activeSub?.type === "ALL_ACCESS"
              ? "With All-Access, you can configure and play any of the 265+ games in the catalog on your Steam account directly!"
              : "Unlock the All-Access Pass to start playing."}
          </p>
          <Link href="/catalog" className="btn-steam-cta inline-block px-5 py-2.5 rounded text-xs font-bold">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {games.map((game: any) => (
            <div
              key={game.id}
              className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 shadow-panelGlow grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-4 relative aspect-[460/215] w-full rounded-lg overflow-hidden bg-[#16202d]">
                {game.headerImage ? (
                  <Image src={game.headerImage} alt={game.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2a475e] text-white font-bold">
                    {game.title}
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a475e]/60 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{game.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#8f98a0] mt-0.5">
                      <span className="text-[#66c0f4]">{game.launcher}</span>
                      <span>•</span>
                      <span>{game.offlineTag}</span>
                    </div>
                  </div>
                  <Link
                    href={`/game/${game.id}`}
                    className="text-xs text-[#66c0f4] hover:underline"
                  >
                    View Game Page →
                  </Link>
                </div>

                {/* Per-game installation & offline guide */}
                <div className="space-y-2 text-xs text-[#c7d5e0]">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5 text-[#5ba32b]" /> How to Install and Play Offline:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-[#8f98a0]">
                    <li>Open your Steamer Setup Guide from your Dashboard or Secret Access Link.</li>
                    <li>
                      In the desktop launcher app, click <strong>+ Add</strong> and search for <strong>{game.title}</strong>.
                    </li>
                    <li>Click <strong>Fetch</strong> to link the manifest directly into your library.</li>
                    <li>Install the game and launch in Offline Mode with permanent local saves on your Steam account directly.</li>
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

