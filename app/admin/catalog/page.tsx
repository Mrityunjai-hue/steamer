"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FolderKanban,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ShieldCheck,
} from "lucide-react";

export default function AdminCatalogPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState<any | null>(null);

  const fetchGames = () => {
    fetch(`/api/catalog?search=${encodeURIComponent(search)}&limit=50&includeOnlineOnly=true`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.games) setGames(data.games);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGames();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#66c0f4]" /> CATALOG & OFFLINE VERIFICATION MANAGER
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Review all 245+ games, manage pricing tiers, and certify offline testing dates per Rule 5.1.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search catalog titles..."
          className="w-full bg-[#171a21] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
        />
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b24] text-[#8f98a0] border-b border-[#2a475e]/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Title & Series</th>
                  <th className="p-4">Hype Tier</th>
                  <th className="p-4">Rent Price</th>
                  <th className="p-4">Launcher</th>
                  <th className="p-4">Offline Tag</th>
                  <th className="p-4">Tested Offline Date</th>
                  <th className="p-4 text-right">Single Purchase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a475e]/40 text-[#c7d5e0]">
                {games.map((g) => {
                  const isVerified = g.offlineTag === "Offline OK" && !!g.testedOfflineOn;
                  return (
                    <tr key={g.id} className="hover:bg-[#1b2838]/50">
                      <td className="p-4">
                        <span className="font-bold text-white block">{g.title}</span>
                        <span className="text-[10px] text-[#8f98a0]">{g.series || "Standalone"}</span>
                      </td>

                      <td className="p-4">
                        <span className="bg-[#2a475e] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          {g.hypeTier}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-[#5ba32b]">
                        ₹{g.ourMonthlyPriceINR}
                      </td>

                      <td className="p-4 text-[11px] text-[#8f98a0]">
                        {g.launcher}
                      </td>

                      <td className="p-4">
                        {isVerified ? (
                          <span className="text-[#5ba32b] bg-[#5ba32b]/10 border border-[#5ba32b]/30 px-1.5 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3" /> Offline OK
                          </span>
                        ) : g.offlineTag === "Online required" ? (
                          <span className="text-red-400 bg-red-950/40 border border-red-800/40 px-1.5 py-0.5 rounded font-bold text-[10px]">
                            Online required
                          </span>
                        ) : (
                          <span className="text-[#8f98a0] bg-slate-800/40 px-1.5 py-0.5 rounded text-[10px]">
                            {g.offlineTag}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-[11px] text-[#8f98a0]">
                        {g.testedOfflineOn ? new Date(g.testedOfflineOn).toLocaleDateString() : "—"}
                      </td>

                      <td className="p-4 text-right">
                        {g.purchasableAsSingle ? (
                          <span className="text-[#5ba32b] font-bold">YES</span>
                        ) : (
                          <span className="text-red-400 font-bold">NO (Bundle/Online)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

