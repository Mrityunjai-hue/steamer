"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Download,
  RefreshCw,
  Laptop,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function AdminRentersPage() {
  const [registry, setRegistry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchRegistry = () => {
    fetch(`/api/admin/renters?search=${encodeURIComponent(search)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.registry) setRegistry(data.registry);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRegistry();
  }, [search]);

  const filteredRenters = registry.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-[#66c0f4]" /> CUSTOMER ACCESS ROSTER (PASS HOLDERS)
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Complete record of all pass holders, contact details, and lifetime vault access grants.
          </p>
        </div>

        <a
          href="/api/admin/renters?format=csv"
          download
          className="btn-steam-cta text-xs px-4 py-2 rounded font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Registry (CSV)
        </a>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or WhatsApp..."
            className="w-full bg-[#171a21] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "EXPIRING", "EXPIRED", "SUSPENDED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-[#2a475e] text-white"
                  : "bg-[#16202d] text-[#8f98a0] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Renter Registry Table */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
          </div>
        ) : filteredRenters.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8f98a0]">
            No renters found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b24] text-[#8f98a0] border-b border-[#2a475e]/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Renter</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Plan & Device</th>
                  <th className="p-4">Games Held</th>
                  <th className="p-4">Start / End Date</th>
                  <th className="p-4">Days Left</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a475e]/40 text-[#c7d5e0]">
                {filteredRenters.map((renter) => (
                  <tr key={renter.userId} className="hover:bg-[#1b2838]/50">
                    <td className="p-4">
                      <span className="font-bold text-white block">{renter.displayName}</span>
                      <span className="text-[10px] text-[#8f98a0] font-mono">{renter.email}</span>
                    </td>

                    <td className="p-4 font-mono">
                      <span>{renter.whatsapp}</span>
                      {renter.isWhatsappVerified ? (
                        <span className="ml-1.5 text-[9px] text-[#5ba32b] bg-[#5ba32b]/10 border border-[#5ba32b]/30 px-1 py-0.2 rounded font-sans">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="ml-1.5 text-[9px] text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1 py-0.2 rounded font-sans">
                          PENDING
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-white block">{renter.planType}</span>
                      <span className="text-[10px] text-[#8f98a0] flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-[#66c0f4]" /> {renter.deviceLabel}
                      </span>
                    </td>

                    <td className="p-4 max-w-xs truncate" title={renter.games}>
                      {renter.games}
                    </td>

                    <td className="p-4 text-[11px] text-[#8f98a0]">
                      <div>{renter.startDate ? new Date(renter.startDate).toLocaleDateString() : "—"}</div>
                      <div>to {renter.endDate ? new Date(renter.endDate).toLocaleDateString() : "—"}</div>
                    </td>

                    <td className="p-4 font-bold text-white">
                      {renter.daysLeft > 0 ? (
                        <span className={renter.daysLeft <= 5 ? "text-amber-400" : "text-[#5ba32b]"}>
                          {renter.daysLeft} days
                        </span>
                      ) : (
                        <span className="text-[#8f98a0]">0 days</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          renter.status === "ACTIVE"
                            ? "bg-[#5ba32b]/20 text-[#5ba32b] border-[#5ba32b]/40"
                            : renter.status === "EXPIRING"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : renter.status === "SUSPENDED"
                            ? "bg-red-500/20 text-red-400 border-red-500/40"
                            : "bg-slate-700/40 text-slate-300 border-slate-600"
                        }`}
                      >
                        {renter.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

