"use client";

import React, { useState, useEffect, useCallback } from "react";
import GameCard from "@/components/GameCard";
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";

interface GameItem {
  id: string;
  title: string;
  series?: string | null;
  hypeTier: string;
  ourMonthlyPriceINR: number;
  steamPriceINR?: number | null;
  offlineTag: string;
  testedOfflineOn?: string | null;
  launcher: string;
  headerImage?: string | null;
  purchasableAsSingle?: boolean;
}

export default function CatalogPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedLauncher, setSelectedLauncher] = useState("");
  const [selectedOfflineTag, setSelectedOfflineTag] = useState("");
  const [includeOnlineOnly, setIncludeOnlineOnly] = useState(false);
  const [sort, setSort] = useState("hype");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedTier) params.set("tier", selectedTier);
      if (selectedSeries) params.set("series", selectedSeries);
      if (selectedLauncher) params.set("launcher", selectedLauncher);
      if (selectedOfflineTag) params.set("offlineTag", selectedOfflineTag);
      if (includeOnlineOnly) params.set("includeOnlineOnly", "true");
      params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "24");

      const res = await fetch(`/api/catalog?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
        setSeriesList(data.seriesList || []);
        setTotalPages(data.totalPages || 1);
        setTotalGames(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedTier, selectedSeries, selectedLauncher, selectedOfflineTag, includeOnlineOnly, sort, page]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const clearFilters = () => {
    setSearch("");
    setSelectedTier("");
    setSelectedSeries("");
    setSelectedLauncher("");
    setSelectedOfflineTag("");
    setIncludeOnlineOnly(false);
    setSort("hype");
    setPage(1);
  };

  const hasActiveFilters = !!(search || selectedTier || selectedSeries || selectedLauncher || selectedOfflineTag || includeOnlineOnly);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            GAMES YOU CAN PLAY WITH THIS SETUP ({totalGames} TITLES)
          </h1>
          <p className="text-xs sm:text-sm text-[#8f98a0]">
            Browse our full vault of 245+ offline-ready single-player PC games included in the ₹300 Complete Setup Guide.
          </p>
        </div>

        {/* Live Search and Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by game or series..."
              className="w-full bg-[#16202d] border border-[#2a475e] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#8f98a0] focus:outline-none focus:border-[#66c0f4] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f98a0] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden p-2 bg-[#2a475e] text-white rounded-lg flex items-center gap-1.5 text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Showcase Value Callout Banner (Steam style) */}
      <div className="bg-[#1b2838] border border-[#2a475e] rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-[#5ba32b] text-[11px] font-bold uppercase">
            <span>● 245+ Titles Included</span>
          </div>
          <p className="text-sm font-bold text-white">
            Stop paying thousands for individual titles. Learn the setup once and play on your own PC forever.
          </p>
          <p className="text-xs text-[#8f98a0]">
            No account sharing · Local saves · Offline play · Single one-time ₹300 unlock
          </p>
        </div>
        <a
          href="/checkout"
          className="btn-steam-cta px-5 py-2.5 rounded-sm text-xs font-bold whitespace-nowrap shadow-ctaGlow"
        >
          Unlock the Full Guide – ₹300
        </a>
      </div>

      {/* Main Layout: Sidebar Filters + Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter Sidebar (Desktop) */}
        <aside
          className={`space-y-6 bg-[#171a21] border border-[#2a475e]/60 p-5 rounded-lg h-fit ${
            isMobileFilterOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
            <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#66c0f4]" /> Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-[#66c0f4] hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-[#8f98a0]">Sort By</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#16202d] border border-[#2a475e] text-xs text-white rounded p-2 focus:outline-none focus:border-[#66c0f4]"
            >
              <option value="hype">Hype / Popularity</option>
              <option value="title_asc">Title: A – Z</option>
              <option value="title_desc">Title: Z – A</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-[#8f98a0]">Hype Tier</label>
            <div className="space-y-1 text-xs">
              {["", "Hot", "Popular", "Standard", "Budget"].map((t) => (
                <button
                  key={t || "all"}
                  onClick={() => {
                    setSelectedTier(t);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${
                    selectedTier === t
                      ? "bg-[#66c0f4]/20 text-[#66c0f4] font-bold border border-[#66c0f4]/30"
                      : "text-[#c7d5e0] hover:bg-[#2a475e]/40"
                  }`}
                >
                  {t === "" ? "All Tiers" : `${t} Tier`}
                </button>
              ))}
            </div>
          </div>

          {/* Series Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-[#8f98a0]">Series / Franchise</label>
            <select
              value={selectedSeries}
              onChange={(e) => {
                setSelectedSeries(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#16202d] border border-[#2a475e] text-xs text-white rounded p-2 focus:outline-none focus:border-[#66c0f4]"
            >
              <option value="">All Series ({seriesList.length})</option>
              {seriesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Launcher Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-[#8f98a0]">Launcher</label>
            <select
              value={selectedLauncher}
              onChange={(e) => {
                setSelectedLauncher(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#16202d] border border-[#2a475e] text-xs text-white rounded p-2 focus:outline-none focus:border-[#66c0f4]"
            >
              <option value="">All Launchers</option>
              <option value="Steam only">Steam Only</option>
              <option value="Ubisoft Connect">Ubisoft Connect</option>
              <option value="EA app">EA App</option>
              <option value="Rockstar Games Launcher">Rockstar Launcher</option>
            </select>
          </div>

          {/* Offline Status */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-[#8f98a0]">Offline Status</label>
            <select
              value={selectedOfflineTag}
              onChange={(e) => {
                setSelectedOfflineTag(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#16202d] border border-[#2a475e] text-xs text-white rounded p-2 focus:outline-none focus:border-[#66c0f4]"
            >
              <option value="">All Statuses</option>
              <option value="Offline OK">Offline OK (Verified)</option>
              <option value="Mixed">Mixed (Solo Campaign)</option>
              <option value="Unverified">Unverified</option>
            </select>
          </div>

          {/* Online Only Toggle (Section 5.1 rule) */}
          <div className="pt-2 border-t border-[#2a475e]/40">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8f98a0] hover:text-white">
              <input
                type="checkbox"
                checked={includeOnlineOnly}
                onChange={(e) => {
                  setIncludeOnlineOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d]"
              />
              <span>Show Online-only (not supported)</span>
            </label>
          </div>
        </aside>

        {/* Game Grid Section */}
        <div className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
              <p className="text-xs text-[#8f98a0]">Loading Steamer vault catalog...</p>
            </div>
          ) : games.length === 0 ? (
            <div className="bg-[#171a21] border border-[#2a475e] rounded-lg p-12 text-center space-y-3">
              <p className="text-base font-bold text-white">No games found matching your filters</p>
              <p className="text-xs text-[#8f98a0]">Try broadening your search term or clearing filters.</p>
              <button
                onClick={clearFilters}
                className="btn-steam-cta text-xs px-4 py-2 rounded font-bold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    series={game.series}
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#2a475e]/60 pt-6">
                  <span className="text-xs text-[#8f98a0]">
                    Showing Page <strong className="text-white">{page}</strong> of{" "}
                    <strong className="text-white">{totalPages}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 bg-[#2a475e] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded text-xs flex items-center gap-1 font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 bg-[#2a475e] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded text-xs flex items-center gap-1 font-bold"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

