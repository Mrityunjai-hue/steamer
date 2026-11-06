"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Plus,
  RefreshCw,
  Ban,
  UserX,
  CheckCircle2,
} from "lucide-react";

export default function AdminStrikesPage() {
  const [strikes, setStrikes] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Strike Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [level, setLevel] = useState("1");
  const [reason, setReason] = useState("");
  const [immediateBan, setImmediateBan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStrikes = () => {
    fetch("/api/admin/strikes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.strikes) setStrikes(data.strikes);
        if (data?.violations) setViolations(data.violations);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStrikes();
  }, []);

  const handleIssueStrike = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/strikes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, level, reason, immediateBan }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setIsModalOpen(false);
        setUserId("");
        setReason("");
        setImmediateBan(false);
        fetchStrikes();
      } else {
        alert(data.error || "Failed to issue strike");
      }
    } catch {
      alert("Error issuing strike");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" /> STRIKES, SUSPENSIONS & ENFORCEMENT
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Enforce the 3-strike escalation ladder (Warn → 7-Day Suspension → Permanent Ban).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded font-bold flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Issue Strike / Ban
        </button>
      </div>

      {/* Escalation Policy Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#171a21] border border-amber-500/40 p-4 rounded-xl space-y-1">
          <span className="font-bold text-amber-300">Strike 1: Formal Warning</span>
          <p className="text-[#8f98a0]">Notice logged, renter warned. Access continues uninterrupted.</p>
        </div>
        <div className="bg-[#171a21] border border-orange-500/40 p-4 rounded-xl space-y-1">
          <span className="font-bold text-orange-300">Strike 2: 7-Day Suspension</span>
          <p className="text-[#8f98a0]">Account locked for 7 days. Plan days continue to run.</p>
        </div>
        <div className="bg-[#171a21] border border-red-500/40 p-4 rounded-xl space-y-1">
          <span className="font-bold text-red-400">Strike 3: Permanent Ban</span>
          <p className="text-[#8f98a0]">Permanent termination with zero refund. Grants revoked.</p>
        </div>
      </div>

      {/* Strikes Table */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#141b24] border-b border-[#2a475e]/60 font-bold text-xs text-white uppercase">
          Strike Log History ({strikes.length})
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
          </div>
        ) : strikes.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8f98a0]">
            No strikes on record. The community is abiding by the Trust Pledge!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b24] text-[#8f98a0] border-b border-[#2a475e]/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Renter</th>
                  <th className="p-4">Strike Level</th>
                  <th className="p-4">Reason / Infraction</th>
                  <th className="p-4 text-right">Date Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a475e]/40 text-[#c7d5e0]">
                {strikes.map((s) => (
                  <tr key={s.id} className="hover:bg-[#1b2838]/50">
                    <td className="p-4">
                      <span className="font-bold text-white block">{s.user?.profile?.displayName}</span>
                      <span className="text-[10px] text-[#8f98a0]">{s.user?.email}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          s.level === 1
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : s.level === 2
                            ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        }`}
                      >
                        Level {s.level}
                      </span>
                    </td>
                    <td className="p-4">{s.reason}</td>
                    <td className="p-4 text-right text-[11px] text-[#8f98a0]">
                      {new Date(s.issuedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Strike Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171a21] border border-red-500/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Issue Renter Strike / Suspension
            </h3>

            <form onSubmit={handleIssueStrike} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Renter User ID *</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Paste User ID from Renter Registry"
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Strike Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={immediateBan}
                  className="w-full bg-[#16202d] border border-[#2a475e] text-xs text-white rounded p-2 focus:outline-none"
                >
                  <option value="1">Strike 1: Formal Warning</option>
                  <option value="2">Strike 2: 7-Day Suspension</option>
                  <option value="3">Strike 3: Permanent Ban</option>
                </select>
              </div>

              <div className="p-3 bg-red-950/40 border border-red-800/40 rounded">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-red-300 font-bold">
                  <input
                    type="checkbox"
                    checked={immediateBan}
                    onChange={(e) => setImmediateBan(e.target.checked)}
                    className="rounded border-red-700 text-red-600 focus:ring-0 bg-[#16202d]"
                  />
                  <span>Immediate Permanent Ban (Rule Breach)</span>
                </label>
                <p className="text-[10px] text-red-200/80 mt-1">
                  For sharing credentials, wallet/market tampering, or evasion attempts.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Reason & Evidence *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Detail the specific infraction..."
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded p-2.5 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#2a475e] text-white text-xs font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-bold rounded"
                >
                  {submitting ? "Applying..." : "Issue Strike"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

