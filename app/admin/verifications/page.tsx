"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Search,
  Key,
  ShieldCheck,
  Check,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Quick PIN / Order verification state
  const [quickQuery, setQuickQuery] = useState("");
  const [quickVerifying, setQuickVerifying] = useState(false);
  const [quickResult, setQuickResult] = useState<{
    success: boolean;
    message: string;
    user?: any;
    orderId?: string | null;
    accessUrl?: string | null;
  } | null>(null);

  const fetchVerifications = () => {
    fetch("/api/admin/verifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.verifications) setVerifications(data.verifications);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  // Handle Quick PIN / Code / Order ID verification
  const handleQuickVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;

    setQuickVerifying(true);
    setQuickResult(null);

    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "QUICK_VERIFY", query: quickQuery.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setQuickResult({
          success: true,
          message: data.message,
          user: data.user,
          orderId: data.orderId,
          accessUrl: data.accessUrl,
        });
        setQuickQuery("");
        fetchVerifications();
      } else {
        setQuickResult({
          success: false,
          message: data.error || "Verification failed. Please check the PIN or Order ID.",
        });
      }
    } catch {
      setQuickResult({
        success: false,
        message: "Network error occurred while verifying.",
      });
    } finally {
      setQuickVerifying(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId: id, action }),
      });
      if (res.ok) fetchVerifications();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#5ba32b]" /> CUSTOMER VERIFICATION & PIN ACTIVATION
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Instantly verify renter PINs shared on WhatsApp and activate lifetime vault passes.
          </p>
        </div>

        <button
          onClick={fetchVerifications}
          className="btn-steam-panel px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 border border-[#2a475e]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* QUICK PIN / ORDER VERIFICATION TOOL */}
      <div className="bg-gradient-to-r from-[#171a21] via-[#16202d] to-[#171a21] border border-[#2a475e] rounded-xl p-5 shadow-panelGlow space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#5ba32b]/20 text-[#5ba32b] rounded">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Instant PIN / Order Verification & Activation
              </h3>
              <p className="text-[11px] text-[#8f98a0]">
                Enter the customer&apos;s 4-digit PIN (e.g. &quot;4821&quot; or &quot;VERIFY 4821&quot;), Order ID, Email, or WhatsApp number:
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-[#5ba32b]/20 text-[#5ba32b] px-2 py-0.5 rounded font-bold border border-[#5ba32b]/30">
            One-Click Unlock
          </span>
        </div>

        <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="e.g. 4821, VERIFY 4821, STR-2026-..., or customer@gmail.com"
              className="w-full bg-[#121922] border border-[#2a475e] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#8f98a0] focus:outline-none focus:border-[#66c0f4] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={quickVerifying || !quickQuery.trim()}
            className="btn-steam-cta px-5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-ctaGlow disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {quickVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Verify &amp; Activate Customer
              </>
            )}
          </button>
        </form>

        {/* Quick Result Feedback Banner */}
        {quickResult && (
          <div
            className={`p-4 rounded-lg text-xs border flex items-start justify-between gap-3 ${
              quickResult.success
                ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
                : "bg-red-950/70 border-red-500/50 text-red-200"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {quickResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{quickResult.message}</p>
                {quickResult.user && (
                  <p className="text-[11px] text-[#c7d5e0]">
                    Email: <strong>{quickResult.user.email}</strong> • WhatsApp: <strong>{quickResult.user.whatsappNumber || "—"}</strong>
                  </p>
                )}
              </div>
            </div>

            {quickResult.accessUrl && (
              <a
                href={quickResult.accessUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-steam-cta px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shadow-sm"
              >
                Open Pass <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* VERIFICATIONS QUEUE TABLE */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#2a475e]/60 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Verification Queue ({verifications.length} Total Requests)
          </h2>
          <span className="text-[11px] text-[#8f98a0]">
            Pending requests can be verified with one click
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8f98a0]">
            No contact verification requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b24] text-[#8f98a0] border-b border-[#2a475e]/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">WhatsApp Number</th>
                  <th className="p-4">Verification PIN / Code</th>
                  <th className="p-4">Latest Order</th>
                  <th className="p-4">Requested At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a475e]/40 text-[#c7d5e0]">
                {verifications.map((v) => {
                  const cleanPhone = (v.user?.whatsappNumber || "").replace(/\D/g, "");
                  const isPending = v.status === "PENDING";
                  const latestOrder = v.user?.orders?.[0];

                  return (
                    <tr key={v.id} className="hover:bg-[#1b2838]/50">
                      <td className="p-4">
                        <span className="font-bold text-white block">{v.user?.profile?.displayName || "Renter"}</span>
                        <span className="text-[10px] text-[#8f98a0]">{v.user?.email}</span>
                      </td>

                      <td className="p-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{v.user?.whatsappNumber || "—"}</span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#66c0f4] hover:underline text-[10px] flex items-center gap-0.5"
                            >
                              Chat <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-black text-[#66c0f4] text-sm">
                        <span className="bg-[#121922] border border-[#2a475e] px-2 py-0.5 rounded">
                          {v.code}
                        </span>
                      </td>

                      <td className="p-4 text-[11px]">
                        {latestOrder ? (
                          <div>
                            <Link
                              href={`/access/${latestOrder.orderId}`}
                              target="_blank"
                              className="text-[#66c0f4] hover:underline font-mono font-bold"
                            >
                              {latestOrder.orderId}
                            </Link>
                            <span className="block text-[10px] text-[#8f98a0]">
                              Status: {latestOrder.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8f98a0]">—</span>
                        )}
                      </td>

                      <td className="p-4 text-[11px] text-[#8f98a0]">
                        {new Date(v.requestedAt).toLocaleString()}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            v.status === "VERIFIED"
                              ? "bg-[#5ba32b]/20 text-[#5ba32b]"
                              : v.status === "REJECTED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(v.id, "VERIFY")}
                              disabled={actionLoading === v.id}
                              className="btn-steam-cta px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verify &amp; Activate
                            </button>
                            <button
                              onClick={() => handleAction(v.id, "REJECT")}
                              disabled={actionLoading === v.id}
                              className="bg-red-600/80 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verified
                            </span>
                            <span className="text-[9px] text-[#8f98a0]">
                              by {v.verifiedBy || "Admin"}
                            </span>
                          </div>
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
