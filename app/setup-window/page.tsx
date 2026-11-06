"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Laptop,
  Check,
  ShieldCheck,
} from "lucide-react";

export default function SetupWindowPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offlineChecklist, setOfflineChecklist] = useState({
    downloadFinished: false,
    clickedGoOffline: false,
    testedGameLaunch: false,
  });
  const [confirmingOffline, setConfirmingOffline] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const fetchStatus = () => {
    fetch("/api/setup-window/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.setupWindow) {
          setData(resData.setupWindow);
        } else {
          setData(null);
        }
      })
      .catch((err) => console.error("Error loading setup window:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Poll status every 15s
    return () => clearInterval(interval);
  }, []);

  const handleConfirmOffline = async () => {
    if (!data?.id) return;
    setConfirmingOffline(true);
    try {
      const res = await fetch("/api/setup-window/confirm-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupWindowId: data.id,
          checklistConfirmed: Object.values(offlineChecklist).every(Boolean),
        }),
      });

      const resJson = await res.json();
      if (res.ok) {
        setCompletionMessage(resJson.message);
        setData(null);
      } else {
        alert(resJson.error || "Failed to confirm offline mode");
      }
    } catch {
      alert("Network error confirming offline status");
    } finally {
      setConfirmingOffline(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
        <p className="text-xs text-[#8f98a0]">Connecting to Setup Window Queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {completionMessage ? (
        <div className="bg-[#171a21] border border-emerald-500/40 rounded-xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#5ba32b]/20 text-[#5ba32b] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">SETUP WINDOW COMPLETED!</h2>
          <p className="text-xs text-[#8f98a0] max-w-md mx-auto">{completionMessage}</p>
          <Link href="/dashboard" className="btn-steam-cta inline-block px-6 py-2.5 rounded text-xs font-bold">
            Return to Dashboard
          </Link>
        </div>
      ) : !data ? (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-8 text-center space-y-4">
          <Clock className="w-12 h-12 text-[#66c0f4] mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-white">No Active Setup Window</h3>
          <p className="text-xs text-[#8f98a0] max-w-md mx-auto">
            You do not currently have a setup window scheduled. Request one from your dashboard when you are ready to download games.
          </p>
          <Link href="/dashboard" className="btn-steam-cta inline-block px-5 py-2 rounded text-xs font-bold">
            Go to Library Dashboard
          </Link>
        </div>
      ) : data.status === "QUEUED" ? (
        /* QUEUED STATE */
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-8 space-y-6 shadow-panelGlow text-center">
          <div className="w-16 h-16 rounded-full bg-[#16202d] border border-[#66c0f4]/40 flex items-center justify-center mx-auto text-[#66c0f4]">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66c0f4]">
              First Come, First Served Queue
            </span>
            <h2 className="text-2xl font-black text-white">
              YOU ARE POSITION #{data.queuePosition} IN LINE
            </h2>
            <p className="text-xs text-[#8f98a0] max-w-md mx-auto">
              Only one renter is permitted online at a time to prevent session kicks. Our admin will message you on WhatsApp as soon as your turn begins.
            </p>
          </div>

          <div className="bg-[#16202d] border border-[#2a475e] p-4 rounded-lg max-w-md mx-auto text-xs text-[#c7d5e0] space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-[#8f98a0]">Target Device:</span>
              <strong className="text-white">{data.deviceLabel}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8f98a0]">Queued Games:</span>
              <span className="text-right truncate max-w-[200px]">
                {data.games.map((g: any) => g.title).join(", ")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE STATE */
        <div className="bg-[#171a21] border border-[#5ba32b]/50 rounded-xl p-6 sm:p-8 space-y-6 shadow-panelGlow">
          <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-4">
            <div>
              <span className="bg-[#5ba32b]/20 text-[#5ba32b] border border-[#5ba32b]/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                SETUP WINDOW ACTIVE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-1">
                EXCLUSIVE DOWNLOAD SLOT OPEN
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#8f98a0] uppercase block">Time Remaining</span>
              <span className="text-2xl font-mono font-black text-[#5ba32b]">
                {data.minutesLeft}m
              </span>
            </div>
          </div>

          {/* Golden Instruction */}
          <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-lg space-y-2 text-xs text-amber-200">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Mandatory Instructions:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Check your WhatsApp for the account credentials sent by admin.</li>
              <li>Log in to Steam on your registered PC: <strong>{data.deviceLabel}</strong>.</li>
              <li>Download ONLY your authorized games: {data.games.map((g: any) => g.title).join(", ")}.</li>
              <li>Once downloaded, go to <strong>Steam → Go Offline</strong> before running any game.</li>
            </ol>
          </div>

          {/* Checklist before closing window */}
          <div className="bg-[#16202d] border border-[#2a475e] p-5 rounded-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Offline Confirmation Checklist
            </h4>
            <div className="space-y-2 text-xs text-[#c7d5e0]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offlineChecklist.downloadFinished}
                  onChange={(e) =>
                    setOfflineChecklist((prev) => ({ ...prev, downloadFinished: e.target.checked }))
                  }
                  className="rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21]"
                />
                <span>My game download and installation is 100% complete.</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offlineChecklist.clickedGoOffline}
                  onChange={(e) =>
                    setOfflineChecklist((prev) => ({ ...prev, clickedGoOffline: e.target.checked }))
                  }
                  className="rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21]"
                />
                <span>I have clicked &quot;Steam → Go Offline&quot; in the Steam desktop client.</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offlineChecklist.testedGameLaunch}
                  onChange={(e) =>
                    setOfflineChecklist((prev) => ({ ...prev, testedGameLaunch: e.target.checked }))
                  }
                  className="rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21]"
                />
                <span>I am now safely running in Offline Mode and ready to release the setup window.</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleConfirmOffline}
            disabled={!Object.values(offlineChecklist).every(Boolean) || confirmingOffline}
            className="w-full btn-steam-cta py-3.5 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <WifiOff className="w-4 h-4" /> I Am Now in Offline Mode (Release Window)
          </button>
        </div>
      )}
    </div>
  );
}

