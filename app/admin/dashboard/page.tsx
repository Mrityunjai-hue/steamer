"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  TrendingUp,
  BookOpen,
  FolderKanban,
  Check,
  ExternalLink,
  Key,
  Smartphone,
  Search,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = (isManual = false) => {
    if (isManual) setRefreshing(true);
    fetch("/api/admin/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) setData(resData);
      })
      .finally(() => {
        setLoading(false);
        if (isManual) setTimeout(() => setRefreshing(false), 500);
      });
  };

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh dashboard stats and pending orders every 10 seconds
    const interval = setInterval(() => {
      fetchDashboard();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOnboarding = async (newState: boolean) => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_onboarding", onboardingPaused: newState }),
      });
      if (res.ok) fetchDashboard();
    } catch {
      alert("Failed to toggle onboarding");
    }
  };

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

      const resData = await res.json();
      if (res.ok) {
        setQuickResult({
          success: true,
          message: resData.message,
          user: resData.user,
          orderId: resData.orderId,
          accessUrl: resData.accessUrl,
        });
        setQuickQuery("");
        fetchDashboard();
      } else {
        setQuickResult({
          success: false,
          message: resData.error || "Verification failed. Check the PIN or Order ID.",
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

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
      </div>
    );
  }

  const capacity = data?.capacity || { activeRenters: 0, totalSlots: 99999, slotsLeft: 99999, onboardingPaused: false };

  return (
    <div className="space-y-8">
      {/* Top Banner: Storefront Master Switch */}
      <div
        className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg ${
          capacity.onboardingPaused
            ? "bg-red-950/70 border-red-500/80 text-white"
            : "bg-[#171a21] border-[#2a475e] text-[#c7d5e0]"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-lg ${
              capacity.onboardingPaused ? "bg-red-900/80 text-red-200" : "bg-[#2a475e] text-[#5ba32b]"
            }`}
          >
            <Power className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              STOREFRONT INTAKE: {capacity.onboardingPaused ? "PAUSED (MAINTENANCE MODE)" : "ACTIVE (UNLIMITED INTAKE)"}
            </h3>
            <p className="text-xs text-[#8f98a0]">
              {capacity.onboardingPaused
                ? "New checkouts are temporarily paused for maintenance."
                : "Storefront is live. Users can purchase the ₹300 All-Access Pass with instant setup delivery."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded text-xs font-bold bg-[#16202d] hover:bg-[#2a475e] text-white border border-[#2a475e] flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#66c0f4] ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
          </button>

          <button
            onClick={() => handleToggleOnboarding(!capacity.onboardingPaused)}
            className={`px-4 py-2 rounded text-xs font-bold transition-all shadow-md ${
              capacity.onboardingPaused
                ? "bg-[#5ba32b] hover:bg-[#68b831] text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {capacity.onboardingPaused ? "Resume Store Intake" : "Pause Store Intake"}
          </button>
        </div>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          href="/admin/renters"
          className="bg-[#171a21] hover:bg-[#1f2d3d] border border-[#2a475e] p-5 rounded-xl space-y-2 shadow-sm transition-colors block"
        >
          <div className="flex items-center justify-between text-xs text-[#8f98a0]">
            <span className="font-bold uppercase">Active Pass Holders</span>
            <Users className="w-4 h-4 text-[#66c0f4]" />
          </div>
          <div className="text-3xl font-black text-white">
            {capacity.activeRenters} <span className="text-sm font-normal text-[#5ba32b]">Active</span>
          </div>
          <p className="text-[11px] text-[#5ba32b]">
            Unlimited Capacity • No queues or caps
          </p>
        </Link>

        <Link
          href="/admin/payments"
          className="bg-[#171a21] hover:bg-[#1f2d3d] border border-[#2a475e] p-5 rounded-xl space-y-2 shadow-sm transition-colors block"
        >
          <div className="flex items-center justify-between text-xs text-[#8f98a0]">
            <span className="font-bold uppercase">Pending Payments</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {data?.pendingPaymentsCount || 0}
          </div>
          <p className="text-[11px] text-[#8f98a0]">Requires UTR bank verification →</p>
        </Link>

        <Link
          href="/admin/verifications"
          className="bg-[#171a21] hover:bg-[#1f2d3d] border border-[#2a475e] p-5 rounded-xl space-y-2 shadow-sm transition-colors block"
        >
          <div className="flex items-center justify-between text-xs text-[#8f98a0]">
            <span className="font-bold uppercase">WhatsApp Verifications</span>
            <Smartphone className="w-4 h-4 text-[#5ba32b]" />
          </div>
          <div className="text-3xl font-black text-[#5ba32b]">
            {data?.pendingVerificationsCount || 0}
          </div>
          <p className="text-[11px] text-[#8f98a0]">Review incoming renter PINs →</p>
        </Link>

        <div className="bg-[#171a21] border border-[#2a475e] p-5 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8f98a0]">
            <span className="font-bold uppercase">Revenue This Month</span>
            <TrendingUp className="w-4 h-4 text-[#5ba32b]" />
          </div>
          <div className="text-3xl font-black text-[#5ba32b]">
            ₹{(data?.monthlyRevenue || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#8f98a0]">Direct UPI collections</p>
        </div>
      </div>

      {/* QUICK PIN / ORDER VERIFICATION BAR */}
      <div className="bg-gradient-to-r from-[#171a21] via-[#16202d] to-[#171a21] border border-[#2a475e] rounded-xl p-5 shadow-panelGlow space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#5ba32b]/20 text-[#5ba32b] rounded">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Instant Customer / PIN / Order Verification
              </h3>
              <p className="text-[11px] text-[#8f98a0]">
                Quickly unlock a customer who shared their PIN on WhatsApp, Order ID, Email, or Phone:
              </p>
            </div>
          </div>
          <Link
            href="/admin/verifications"
            className="text-[10px] text-[#66c0f4] hover:underline flex items-center gap-1 font-bold"
          >
            Full Queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Enter PIN (e.g. 4821 or VERIFY 4821), Order ID (STR-2026-...), or Email..."
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
                <CheckCircle2 className="w-4 h-4" /> Verify &amp; Activate Renter
              </>
            )}
          </button>
        </form>

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

      {/* Main Grid: Platform Health & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Modern Architecture Overview */}
        <div className="lg:col-span-7 bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-panelGlow">
          <div className="border-b border-[#2a475e]/60 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Platform Architecture & Delivery Mode
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              MODERN MODEL ACTIVE
            </span>
          </div>

          <p className="text-xs text-[#8f98a0] leading-relaxed">
            The platform operates on the modern <strong>Independent PC Setup & Vault Guide</strong> framework. Users configure their games directly on their Steam accounts using the guided walkthrough.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#16202d] border border-[#2a475e]/60 rounded space-y-1">
              <span className="text-[#8f98a0] text-[10px] uppercase font-bold block">Delivery Method</span>
              <p className="font-bold text-white">Visual Click-by-Click Guide + Protected Player</p>
            </div>
            <div className="p-3 bg-[#16202d] border border-[#2a475e]/60 rounded space-y-1">
              <span className="text-[#8f98a0] text-[10px] uppercase font-bold block">Queue Status</span>
              <p className="font-bold text-emerald-400">Zero Queues (Direct Access)</p>
            </div>
            <div className="p-3 bg-[#16202d] border border-[#2a475e]/60 rounded space-y-1">
              <span className="text-[#8f98a0] text-[10px] uppercase font-bold block">Pricing Structure</span>
              <p className="font-bold text-white">Flat ₹300 (Lifetime Vault Access)</p>
            </div>
            <div className="p-3 bg-[#16202d] border border-[#2a475e]/60 rounded space-y-1">
              <span className="text-[#8f98a0] text-[10px] uppercase font-bold block">Catalog Scope</span>
              <p className="font-bold text-white">265+ Verified Single-Player Titles</p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <Link
              href="/admin/guide"
              className="btn-steam-panel px-4 py-2 rounded text-xs font-bold border border-[#2a475e] flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#66c0f4]" /> Edit Setup Guide Content
            </Link>
            <Link
              href="/admin/catalog"
              className="btn-steam-panel px-4 py-2 rounded text-xs font-bold border border-[#2a475e] flex items-center gap-1.5"
            >
              <FolderKanban className="w-3.5 h-3.5 text-amber-400" /> Manage Catalog & Artworks
            </Link>
          </div>
        </div>

        {/* Quick Operational Tasks */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2a475e]/60 pb-3 flex items-center justify-between">
              <span>Quick Operational Tasks</span>
            </h3>

            <div className="space-y-3 text-xs">
              <Link
                href="/admin/payments"
                className="flex items-center justify-between p-3 bg-[#16202d] hover:bg-[#1f2d3d] border border-[#2a475e]/60 rounded transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">Review UPI Payments</span>
                  <span className="text-[11px] text-[#8f98a0]">{data?.pendingPaymentsCount || 0} pending verification</span>
                </div>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </Link>

              <Link
                href="/admin/verifications"
                className="flex items-center justify-between p-3 bg-[#16202d] hover:bg-[#1f2d3d] border border-[#2a475e]/60 rounded transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">WhatsApp Number Queue</span>
                  <span className="text-[11px] text-[#8f98a0]">{data?.pendingVerificationsCount || 0} pending approval</span>
                </div>
                <Smartphone className="w-4 h-4 text-[#5ba32b]" />
              </Link>

              <Link
                href="/admin/renters"
                className="flex items-center justify-between p-3 bg-[#16202d] hover:bg-[#1f2d3d] border border-[#2a475e]/60 rounded transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">Customer Access Roster</span>
                  <span className="text-[11px] text-[#8f98a0]">Search pass holders & export CSV</span>
                </div>
                <Users className="w-4 h-4 text-[#66c0f4]" />
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3 bg-[#16202d] hover:bg-[#1f2d3d] border border-[#2a475e]/60 rounded transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">UPI VPA & Contact Settings</span>
                  <span className="text-[11px] text-[#8f98a0]">Configure recipient UPI VPA</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#8f98a0]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
