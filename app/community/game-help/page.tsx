"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Terminal,
  Copy,
  Check,
  Search,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileCode,
  FolderArchive,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface GameFix {
  id: string;
  gameId?: string | null;
  steamAppId: string;
  title: string;
  launcher: string;
  fixType: string;
  manifestVersion: string;
  downloadUrl: string;
  mirrorUrl?: string | null;
  fileSizeBytes: number;
  sha256: string;
  instructions: string;
  launchArguments?: string | null;
  targetDirectory: string;
  sourceToolkit: string;
  testedWorkingDate: string;
  verifiedByAdmin: boolean;
  game?: {
    id: string;
    title: string;
    headerImage?: string | null;
    hypeTier: string;
    offlineTag: string;
  } | null;
}

const LAUNCHERS = [
  { label: "All Fixes", value: "ALL" },
  { label: "Ubisoft Connect (Assassin's Creed)", value: "Ubisoft Connect" },
  { label: "Call of Duty / Activision", value: "Activision / Steam" },
  { label: "Rockstar Games (GTA / RDR)", value: "Rockstar Games Launcher" },
  { label: "EA App", value: "EA app" },
  { label: "PlayStation PC", value: "PlayStation PC" },
  { label: "Steam Only", value: "Steam only" },
];

export default function GameHelpPage() {
  const [fixes, setFixes] = useState<GameFix[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLauncher, setSelectedLauncher] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedArg, setCopiedArg] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFixes();
  }, [selectedLauncher]);

  const fetchFixes = async () => {
    setLoading(true);
    try {
      const url =
        selectedLauncher === "ALL"
          ? "/api/manifests"
          : `/api/manifests?launcher=${encodeURIComponent(selectedLauncher)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFixes(data.manifests || []);
      }
    } catch (err) {
      console.error("Failed to load game fixes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArg(id);
    setTimeout(() => setCopiedArg(null), 2500);
  };

  const filteredFixes = fixes.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.steamAppId.includes(q) ||
      f.launcher.toLowerCase().includes(q) ||
      f.sourceToolkit.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#66c0f4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16202d] border border-[#66c0f4]/40 rounded-full text-xs font-bold text-[#66c0f4]">
              <Cpu className="w-3.5 h-3.5" />
              <span>COMMUNITY GAME HELP &amp; MANIFEST FIXES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Game Manifests &amp; Launcher Fixes Directory
            </h1>
            <p className="text-xs sm:text-sm text-[#c7d5e0] leading-relaxed">
              Fixes, depot manifests, and launcher bypasses for games requiring third-party clients (Ubisoft Connect for Assassin&apos;s Creed titles, EA Desktop, Rockstar Social Club, and PlayStation PC). Verified via <strong>lua.tool</strong> and our testing team.
            </p>
            <div className="flex items-center gap-2 p-2.5 bg-[#121922] border border-[#2a475e] rounded text-xs text-[#c7d5e0]">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Refer this link in case of failures:{" "}
                <a
                  href="https://lua.tools/fixes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#66c0f4] hover:underline font-bold inline-flex items-center gap-1"
                >
                  https://lua.tools/fixes
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </div>
          </div>

          {/* 1-Click Helper Download Button */}
          <div className="flex-shrink-0 bg-[#16202d] border border-[#2a475e] p-4 rounded-lg space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold text-[#8f98a0] block uppercase tracking-wider">
              AUTOMATIC MANIFEST INJECTOR
            </span>
            <a
              href="/scripts/steamer-helper.ps1"
              download
              className="btn-steam-cta text-xs px-5 py-2.5 rounded font-bold inline-flex items-center gap-2 shadow-ctaGlow"
            >
              <Download className="w-4 h-4" />
              <span>Download 1-Click Helper (.ps1)</span>
            </a>
            <p className="text-[10px] text-[#8f98a0]">
              Detects Steam directory &amp; automatically places \`.acf\` manifests.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls: Search Bar & Launcher Tabs */}
      <div className="space-y-4">
        {/* Launcher Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#2a475e]/60 pb-3">
          {LAUNCHERS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedLauncher(tab.value)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-bold transition-all ${
                selectedLauncher === tab.value
                  ? "bg-[#66c0f4] text-[#171a21] shadow-[0_0_12px_rgba(102,192,244,0.5)]"
                  : "bg-[#16202d] text-[#c7d5e0] hover:bg-[#203043] border border-[#2a475e]/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8f98a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by game title, Steam AppID (e.g. 2208920 for Valhalla), or launcher..."
            className="w-full bg-[#16202d] border border-[#2a475e] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8f98a0] focus:outline-none focus:border-[#66c0f4] transition-colors"
          />
        </div>
      </div>

      {/* 3. Game Fix Manifests Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#8f98a0]">
          Loading verified game fix manifests...
        </div>
      ) : filteredFixes.length === 0 ? (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-12 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-[#66c0f4] mx-auto" />
          <h3 className="text-white font-bold text-sm">No Manifest Fixes Found</h3>
          <p className="text-xs text-[#8f98a0] max-w-md mx-auto">
            Try adjusting your search terms or switch launcher category. If you need a custom manifest for an unlisted title, reach out on WhatsApp.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFixes.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-[#171a21] border border-[#2a475e]/80 hover:border-[#66c0f4]/70 rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Header Image or Capsule */}
                <div className="relative aspect-[460/215] w-full bg-[#0d131b] overflow-hidden border-b border-[#2a475e]/60">
                  {item.game?.headerImage ? (
                    <Image
                      src={item.game.headerImage}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1b2838] to-[#121922]">
                      <FileCode className="w-8 h-8 text-[#66c0f4]/60 mb-2" />
                      <span className="text-xs font-bold text-white text-center">
                        {item.title}
                      </span>
                    </div>
                  )}

                  {/* Launcher Badge */}
                  <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#66c0f4]" />
                    <span>{item.launcher}</span>
                  </div>

                  {/* Toolkit Tag */}
                  <div className="absolute top-2 right-2 z-10 bg-[#5ba32b]/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                    {item.sourceToolkit}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-white group-hover:text-[#66c0f4] transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-mono text-[#8f98a0] bg-[#16202d] px-1.5 py-0.5 rounded border border-[#2a475e]/60 whitespace-nowrap">
                        AppID: {item.steamAppId}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="bg-[#2a475e]/60 text-[#c7d5e0] px-2 py-0.5 rounded font-mono">
                        {item.fixType}
                      </span>
                      <span className="bg-[#16202d] text-[#8f98a0] px-2 py-0.5 rounded">
                        {item.manifestVersion}
                      </span>
                    </div>

                    {/* Launch Arguments with 1-Click Copy */}
                    {item.launchArguments && (
                      <div className="bg-[#121922] border border-[#2a475e]/60 rounded p-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#8f98a0]">
                          <span className="font-mono flex items-center gap-1">
                            <Terminal className="w-3 h-3 text-[#66c0f4]" />
                            Launch Arguments:
                          </span>
                          <button
                            onClick={() => handleCopy(item.launchArguments!, item.id)}
                            className="text-[#66c0f4] hover:text-white flex items-center gap-1 font-bold"
                          >
                            {copiedArg === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <code className="text-[11px] font-mono text-emerald-300 block truncate">
                          {item.launchArguments}
                        </code>
                      </div>
                    )}

                    {/* Target Folder */}
                    <p className="text-[10px] text-[#8f98a0]">
                      <strong className="text-[#c7d5e0]">Install Target:</strong>{" "}
                      <span className="font-mono text-[9px] text-amber-200/90">
                        {item.targetDirectory}
                      </span>
                    </p>
                  </div>

                  {/* Expandable Step-by-Step Instructions */}
                  <div className="pt-2 border-t border-[#2a475e]/40 space-y-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-[#66c0f4] hover:underline"
                    >
                      <span>{isExpanded ? "Hide Instructions" : "View Step-by-Step Fix"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-[#121922] border border-[#2a475e]/60 rounded text-[11px] text-[#c7d5e0] leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                        {item.instructions}
                      </div>
                    )}

                    {/* Action Bar: Direct Download */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`/api/manifests/download/${item.steamAppId}`}
                        download={`appmanifest_${item.steamAppId}.acf`}
                        className="btn-steam-cta flex-1 py-2 rounded text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Manifest (.acf)</span>
                      </a>
                      {item.game?.id && (
                        <Link
                          href={`/game/${item.game.id}`}
                          title="View Game Store Page"
                          className="p-2 bg-[#16202d] hover:bg-[#203043] border border-[#2a475e] rounded text-[#66c0f4] hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

