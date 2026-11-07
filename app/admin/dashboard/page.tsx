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
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    fetch("/api/admin/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) setData(resData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
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
          href="/admin/guide"
          className="bg-[#171a21] hover:bg-[#1f2d3d] border border-[#2a475e] p-5 rounded-xl space-y-2 shadow-sm transition-colors block"
        >
          <div className="flex items-center justify-between text-xs text-[#8f98a0]">
            <span className="font-bold uppercase">Setup Guide CMS</span>
            <BookOpen className="w-4 h-4 text-[#5ba32b]" />
          </div>
          <div className="text-3xl font-black text-[#5ba32b]">
            Protected
          </div>
          <p className="text-[11px] text-[#8f98a0]">
            Visual Walkthrough & Video Player Live →
          </p>
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
            The platform operates on the modern <strong>Independent PC Setup & Vault Guide</strong> framework. Users configure their games directly on their own systems using the guided walkthrough.
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
              <p className="font-bold text-white">245+ Verified Single-Player Titles</p>
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
                  <span className="text-[11px] text-[#8f98a0]">Update phone, email, and UPI VPA</span>
                </div>
                <Power className="w-4 h-4 text-[#5ba32b]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
