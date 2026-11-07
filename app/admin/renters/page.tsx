"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  RefreshCw,
  Laptop,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Ban,
  Check,
} from "lucide-react";

export default function AdminRentersPage() {
  const [registry, setRegistry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/renters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Updated successfully");
        fetchRegistry();
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

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
            Complete record of all pass holders, contact details, verification status, and one-click activation.
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
          {["ALL", "ACTIVE", "INACTIVE", "EXPIRING", "EXPIRED", "SUSPENDED"].map((st) => (
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
                  <th className="p-4">Customer</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Plan &amp; Device</th>
                  <th className="p-4">Order / Pass</th>
                  <th className="p-4">Active Period</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a475e]/40 text-[#c7d5e0]">
                {filteredRenters.map((renter) => {
                  const isVerified = renter.isWhatsappVerified;
                  const isSuspended = renter.isSuspended;

                  return (
                    <tr key={renter.userId} className="hover:bg-[#1b2838]/50">
                      <td className="p-4">
                        <span className="font-bold text-white block">{renter.displayName}</span>
                        <span className="text-[10px] text-[#8f98a0] font-mono">{renter.email}</span>
                      </td>

                      <td className="p-4 font-mono">
                        <span>{renter.whatsapp}</span>
                        {isVerified ? (
                          <span className="ml-1.5 text-[9px] text-[#5ba32b] bg-[#5ba32b]/10 border border-[#5ba32b]/30 px-1 py-0.2 rounded font-sans font-bold">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="ml-1.5 text-[9px] text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1 py-0.2 rounded font-sans font-bold">
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

                      <td className="p-4 text-[11px]">
                        {renter.latestOrderId ? (
                          <div className="space-y-0.5">
                            <Link
                              href={`/access/${renter.latestOrderId}`}
                              target="_blank"
                              className="text-[#66c0f4] hover:underline font-mono font-bold flex items-center gap-1"
                            >
                              {renter.latestOrderId} <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                            <span className="text-[10px] text-[#8f98a0]">
                              Order: {renter.latestOrderStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8f98a0]">No order yet</span>
                        )}
                      </td>

                      <td className="p-4 text-[11px] text-[#8f98a0]">
                        <div>{renter.startDate ? new Date(renter.startDate).toLocaleDateString() : "—"}</div>
                        <div>to {renter.endDate ? new Date(renter.endDate).toLocaleDateString() : "Lifetime"}</div>
                      </td>

                      <td className="p-4">
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

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isVerified && (
                            <button
                              onClick={() => handleAction(renter.userId, "VERIFY")}
                              disabled={actionLoading === renter.userId}
                              className="btn-steam-cta px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                              title="Mark verified and activate lifetime pass"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verify &amp; Activate
                            </button>
                          )}

                          <button
                            onClick={() => handleAction(renter.userId, "TOGGLE_SUSPEND")}
                            disabled={actionLoading === renter.userId}
                            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
                              isSuspended
                                ? "bg-emerald-700/80 hover:bg-emerald-600 text-white border-emerald-500/40"
                                : "bg-red-950/60 hover:bg-red-900/80 text-red-300 border-red-500/40"
                            }`}
                          >
                            {isSuspended ? "Unsuspend" : "Suspend"}
                          </button>
                        </div>
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
