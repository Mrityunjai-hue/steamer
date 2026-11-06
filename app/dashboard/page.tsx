"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  WifiOff,
  AlertTriangle,
  Gamepad2,
  Calendar,
  Laptop,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupConsent, setGroupConsent] = useState(false);
  const [requestingWindow, setRequestingWindow] = useState(false);
  const [windowMsg, setWindowMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          window.location.href = "/auth/login";
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRequestSetupWindow = async () => {
    setRequestingWindow(true);
    setWindowMsg(null);
    try {
      const res = await fetch("/api/setup-window/request", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setWindowMsg(data.message);
        setTimeout(() => {
          window.location.href = "/setup-window";
        }, 1500);
      } else {
        setWindowMsg(data.error || "Failed to request setup window");
      }
    } catch {
      setWindowMsg("Network error requesting setup window");
    } finally {
      setRequestingWindow(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
        <p className="text-xs text-[#8f98a0]">Loading your Steamer Library...</p>
      </div>
    );
  }

  const activeSub = user?.activeSubscription;
  let daysLeft = 0;
  let isExpiringSoon = false;

  if (activeSub) {
    const now = Date.now();
    const end = new Date(activeSub.endDate).getTime();
    daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    isExpiringSoon = daysLeft <= 5;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome & Offline Reminder Banner */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-panelGlow">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-wide">
            WELCOME BACK, {user?.displayName?.toUpperCase()}
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Registered Account: <strong className="text-white">{user?.email}</strong>
          </p>
        </div>

        <div className="bg-[#16202d] border border-amber-500/40 px-4 py-2.5 rounded-lg flex items-center gap-3 text-xs text-amber-200">
          <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Golden Offline Rule:</strong> Go Offline in Steam before launching any game!
          </span>
        </div>
      </div>

      {/* Main Grid: Plan Status + Games In Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Plan Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5ba32b]" /> Active Subscription
              </span>
              {activeSub ? (
                <span className="bg-[#5ba32b]/20 text-[#5ba32b] border border-[#5ba32b]/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  ACTIVE
                </span>
              ) : (
                <span className="bg-slate-700/40 text-slate-300 border border-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  NO ACTIVE PLAN
                </span>
              )}
            </div>

            {activeSub ? (
              <div className="space-y-6">
                {/* Circular / Large Days Remaining Counter */}
                <div className="flex items-center justify-center p-6 bg-[#16202d] border border-[#2a475e] rounded-xl text-center">
                  <div>
                    <div className="text-5xl font-black text-[#5ba32b]">{daysLeft}</div>
                    <div className="text-xs font-bold uppercase text-[#8f98a0] mt-1">
                      Days Remaining in Cycle
                    </div>
                    <div className="text-[11px] text-[#8f98a0]/80 mt-1">
                      Expires: {new Date(activeSub.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Plan Meta */}
                <div className="space-y-2 text-xs text-[#c7d5e0]">
                  <div className="flex justify-between">
                    <span className="text-[#8f98a0]">Plan Type:</span>
                    <strong className="text-white">{activeSub.type}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8f98a0]">Registered Device:</span>
                    <span className="flex items-center gap-1 text-white">
                      <Laptop className="w-3.5 h-3.5 text-[#66c0f4]" /> {activeSub.deviceLabel}
                    </span>
                  </div>
                </div>

                {/* Renewal button (highlighted in last 5 days per Section 8) */}
                {isExpiringSoon && (
                  <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-lg space-y-2">
                    <p className="text-xs text-amber-200 font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" /> Plan Ending Soon ({daysLeft} days left)
                    </p>
                    <p className="text-[11px] text-[#8f98a0]">
                      Renew now to secure your slot before it is released to the priority waitlist.
                    </p>
                    <Link
                      href="/checkout"
                      className="block w-full text-center btn-steam-cta py-2 rounded text-xs font-bold mt-2"
                    >
                      Renew Subscription
                    </Link>
                  </div>
                )}

                {/* Setup Window Actions */}
                <div className="space-y-2 pt-2 border-t border-[#2a475e]/60">
                  <button
                    onClick={handleRequestSetupWindow}
                    disabled={requestingWindow}
                    className="w-full btn-steam-accent py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> Request Download Setup Window
                  </button>
                  {windowMsg && (
                    <p className="text-[11px] text-center text-[#66c0f4] font-medium pt-1">
                      {windowMsg}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <Gamepad2 className="w-12 h-12 text-[#66c0f4] mx-auto opacity-70" />
                <p className="text-xs text-[#8f98a0]">
                  You don&apos;t have an active subscription yet. Rent games to get started.
                </p>
                <Link href="/catalog" className="btn-steam-cta inline-block px-5 py-2.5 rounded text-xs font-bold">
                  Browse Game Catalog
                </Link>
              </div>
            )}
          </div>

          {/* Optional WhatsApp Group Invite (Addendum 3g) */}
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#5ba32b]" /> Steamer Announcements Group (Optional)
            </h4>
            <p className="text-[11px] text-[#8f98a0] leading-relaxed">
              Join the official community WhatsApp group for downtime notices, game additions, and community discussions.
            </p>

            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-[#c7d5e0]">
              <input
                type="checkbox"
                checked={groupConsent}
                onChange={(e) => setGroupConsent(e.target.checked)}
                className="mt-0.5 rounded border-[#2a475e] text-[#66c0f4] focus:ring-0 bg-[#16202d]"
              />
              <span>
                &quot;I agree to be added to the group; my number will be visible to other members.&quot;
              </span>
            </label>

            <a
              href="https://chat.whatsapp.com/G3Hk89SteamLive"
              target="_blank"
              rel="noreferrer"
              className={`w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                groupConsent
                  ? "bg-[#5ba32b] hover:bg-[#68b831] text-white"
                  : "bg-[#2a475e]/40 text-[#8f98a0] cursor-not-allowed pointer-events-none"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Join WhatsApp Group
            </a>
          </div>
        </div>

        {/* Right Column: Games in My Plan & Quick Guides */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Games in Your Plan
              </h3>
              <Link href="/my-games" className="text-xs text-[#66c0f4] hover:underline">
                View Full Installation Guides →
              </Link>
            </div>

            {activeSub?.games && activeSub.games.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeSub.games.map((g: any) => (
                  <div
                    key={g.id}
                    className="bg-[#16202d] border border-[#2a475e] rounded-lg p-3.5 flex items-center gap-3"
                  >
                    <div className="relative w-16 h-9 rounded overflow-hidden bg-[#2a475e] flex-shrink-0">
                      {g.headerImage ? (
                        <Image src={g.headerImage} alt={g.title} fill className="object-cover" />
                      ) : (
                        <Gamepad2 className="w-5 h-5 text-[#66c0f4] m-auto" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{g.title}</h4>
                      <p className="text-[10px] text-[#8f98a0]">
                        {g.launcher} · {g.offlineTag}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8f98a0]">
                {activeSub?.type === "ALL_ACCESS"
                  ? "You have full access to every game in the catalog with your All-Access Pass!"
                  : "No games allocated yet."}
              </p>
            )}

            {/* Quick Setup Checklist */}
            <div className="bg-[#16202d] border border-[#2a475e]/60 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Installation Quick Steps
              </h4>
              <ol className="text-xs text-[#8f98a0] space-y-2 list-decimal list-inside">
                <li>Request an exclusive setup window above.</li>
                <li>When your turn starts, admin will share account details on WhatsApp.</li>
                <li>Log in, check &quot;Remember my password&quot;, and download your games.</li>
                <li>Switch Steam to Offline Mode (Steam → Go Offline) <strong>before</strong> playing!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

