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
  Wifi,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [warningSigns, setWarningSigns] = useState({
    steamGuardAlert: false,
    unusualLoginEmail: false,
    featureRestrictions: false,
    steamSupportMessage: false,
    rentersReportingLogouts: false,
  });

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

  const handleCheckWarningSign = async (key: keyof typeof warningSigns) => {
    const updated = { ...warningSigns, [key]: !warningSigns[key] };
    setWarningSigns(updated);

    // If any warning sign is checked, auto-enable onboarding paused per Section 3.2!
    if (!warningSigns[key]) {
      await fetch("/api/admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warningSignTriggered: true }),
      });
      fetchDashboard();
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
      </div>
    );
  }

  const capacity = data?.capacity || { activeRenters: 0, totalSlots: 8, slotsLeft: 8, onboardingPaused: false };

  return (
    <div className="space-y-8">
      {/* Top Banner: Emergency Master Switch */}
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
              MASTER ONBOARDING SWITCH: {capacity.onboardingPaused ? "PAUSED (PROTECTING ACCOUNT)" : "ACTIVE"}
            </h3>
            <p className="text-xs text-[#8f98a0]">
              {capacity.onboardingPaused
                ? "New purchases and registrations are blocked to protect account safety."
                : "New renters can reserve available slots normally."}
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
          {capacity.onboardingPaused ? "Resume Onboarding" : "Pause Onboarding"}
        </button>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#171a21] border border-[#2a475e] p-5 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8f98a0]">
            <span className="font-bold uppercase">Active Setup Passes</span>
            <Users className="w-4 h-4 text-[#66c0f4]" />
          </div>
          <div className="text-3xl font-black text-white">
            {capacity.activeRenters} <span className="text-sm font-normal text-[#5ba32b]">Active</span>
          </div>
          <p className="text-[11px] text-[#5ba32b]">
            Unlimited Capacity • No user intake limits
          </p>
        </div>

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
          <p className="text-[11px] text-[#8f98a0]">Requires bank confirmation check →</p>
        </Link>

        <Link
          href="/admin/setup-windows"
          className="bg-[#171a21] hover:bg-[#1f2d3d] border border-[#2a475e] p-5 rounded-xl space-y-2 shadow-sm transition-colors block"
        >
          <div className="flex items-center justify-between text-xs text-[#8f98a0]">
            <span className="font-bold uppercase">Setup Window Queue</span>
            <Clock className="w-4 h-4 text-[#66c0f4]" />
          </div>
          <div className="text-3xl font-black text-[#66c0f4]">
            {data?.queueCount || 0}
          </div>
          <p className="text-[11px] text-[#8f98a0]">
            {data?.activeWindow ? "1 Active window running" : "No active window right now"}
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
          <p className="text-[11px] text-[#8f98a0]">Direct UPI bank deposits</p>
        </div>
      </div>

      {/* Main Grid: Warning Signs Checklist & Active Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Warning Signs Checklist (Rule 3.2: Ticking any item auto-enables onboarding_paused) */}
        <div className="lg:col-span-7 bg-[#171a21] border border-amber-500/40 rounded-xl p-6 space-y-4 shadow-panelGlow">
          <div className="border-b border-[#2a475e]/60 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Operational Warning-Signs Checklist
            </h3>
            <span className="text-[10px] text-amber-200/80">Auto-engages Emergency Pause</span>
          </div>

          <p className="text-xs text-[#8f98a0] leading-relaxed">
            Monitor the business Steam account closely. If any red flag occurs, tick it immediately to halt new customer intake and protect active renter sessions.
          </p>

          <div className="space-y-2.5 text-xs text-[#c7d5e0]">
            <label className="flex items-center gap-3 p-2.5 bg-[#16202d] border border-[#2a475e]/50 rounded cursor-pointer hover:bg-[#16202d]/80">
              <input
                type="checkbox"
                checked={warningSigns.steamGuardAlert}
                onChange={() => handleCheckWarningSign("steamGuardAlert")}
                className="rounded border-[#2a475e] text-red-500 focus:ring-0 bg-[#171a21]"
              />
              <span>Steam Guard alert email received outside a known window</span>
            </label>

            <label className="flex items-center gap-3 p-2.5 bg-[#16202d] border border-[#2a475e]/50 rounded cursor-pointer hover:bg-[#16202d]/80">
              <input
                type="checkbox"
                checked={warningSigns.unusualLoginEmail}
                onChange={() => handleCheckWarningSign("unusualLoginEmail")}
                className="rounded border-[#2a475e] text-red-500 focus:ring-0 bg-[#171a21]"
              />
              <span>Unusual-login email notification from Valve</span>
            </label>

            <label className="flex items-center gap-3 p-2.5 bg-[#16202d] border border-[#2a475e]/50 rounded cursor-pointer hover:bg-[#16202d]/80">
              <input
                type="checkbox"
                checked={warningSigns.featureRestrictions}
                onChange={() => handleCheckWarningSign("featureRestrictions")}
                className="rounded border-[#2a475e] text-red-500 focus:ring-0 bg-[#171a21]"
              />
              <span>Feature restriction notice or trading cooldown in client</span>
            </label>

            <label className="flex items-center gap-3 p-2.5 bg-[#16202d] border border-[#2a475e]/50 rounded cursor-pointer hover:bg-[#16202d]/80">
              <input
                type="checkbox"
                checked={warningSigns.steamSupportMessage}
                onChange={() => handleCheckWarningSign("steamSupportMessage")}
                className="rounded border-[#2a475e] text-red-500 focus:ring-0 bg-[#171a21]"
              />
              <span>Steam Support ticket or direct communication opened</span>
            </label>

            <label className="flex items-center gap-3 p-2.5 bg-[#16202d] border border-[#2a475e]/50 rounded cursor-pointer hover:bg-[#16202d]/80">
              <input
                type="checkbox"
                checked={warningSigns.rentersReportingLogouts}
                onChange={() => handleCheckWarningSign("rentersReportingLogouts")}
                className="rounded border-[#2a475e] text-red-500 focus:ring-0 bg-[#171a21]"
              />
              <span>Multiple renters reporting simultaneous session kicks</span>
            </label>
          </div>
        </div>

        {/* Live Setup Window & Expiring Renters */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Window Card */}
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <span>Active Setup Window</span>
              {data?.activeWindow && (
                <span className="text-[#5ba32b] text-[10px] font-bold">ONLINE IN WINDOW</span>
              )}
            </h3>

            {data?.activeWindow ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8f98a0]">Renter:</span>
                  <strong className="text-white">{data.activeWindow.email}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f98a0]">WhatsApp:</span>
                  <span className="font-mono text-white">{data.activeWindow.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f98a0]">Games:</span>
                  <span className="text-right truncate max-w-[180px]">
                    {data.activeWindow.games.join(", ")}
                  </span>
                </div>
                <Link
                  href="/admin/setup-windows"
                  className="w-full btn-steam-accent py-2 rounded text-xs font-bold flex items-center justify-center mt-2 block"
                >
                  Manage Active Window Console →
                </Link>
              </div>
            ) : (
              <p className="text-xs text-[#8f98a0] py-4 text-center">
                Account is currently completely idle / offline.
              </p>
            )}
          </div>

          {/* Expiring Soon (5 days) */}
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#2a475e]/60 pb-3 flex items-center justify-between">
              <span>Expiring in Next 5 Days</span>
              <span className="text-amber-400 text-xs font-bold">
                {data?.expiringSoon?.length || 0}
              </span>
            </h3>

            {data?.expiringSoon && data.expiringSoon.length > 0 ? (
              <div className="space-y-2">
                {data.expiringSoon.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-2.5 bg-[#16202d] border border-[#2a475e]/50 rounded text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white block">{sub.email}</span>
                      <span className="text-[10px] text-[#8f98a0]">
                        {sub.daysLeft} days remaining · {sub.whatsapp}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${(sub.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hi ${sub.displayName}! Your Steamer plan expires in ${sub.daysLeft} days. Renew now to retain your slot before it opens to the waitlist.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#66c0f4] hover:underline flex items-center gap-1"
                    >
                      Remind <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8f98a0] py-2 text-center">
                No renter plans expiring within 5 days.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

