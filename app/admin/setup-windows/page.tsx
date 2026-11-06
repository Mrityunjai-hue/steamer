"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
  Plus,
  XCircle,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export default function AdminSetupWindowsPage() {
  const [windows, setWindows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Task card checklist state for active windows: { [windowId]: { credsSent: bool, codeSent: bool, confirmed: bool, offlineDone: bool } }
  const [checklistState, setChecklistState] = useState<Record<string, any>>({});

  const fetchWindows = () => {
    fetch("/api/admin/setup-windows")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.windows) setWindows(data.windows);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWindows();
  }, []);

  const handleAction = async (windowId: string, action: string, extendMinutes = 60) => {
    setActionLoading(windowId);
    try {
      const res = await fetch("/api/admin/setup-windows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ windowId, action, extendMinutes }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchWindows();
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Network error performing setup window action");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleChecklist = (windowId: string, step: string) => {
    setChecklistState((prev) => {
      const current = prev[windowId] || {};
      return {
        ...prev,
        [windowId]: { ...current, [step]: !current[step] },
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#66c0f4]" /> SETUP-WINDOW CONSOLE & TASK CARDS
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Manage exclusive download slots, relay credentials on WhatsApp, and confirm offline mode transitions.
          </p>
        </div>

        <button
          onClick={fetchWindows}
          className="btn-steam-panel px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 border border-[#2a475e]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Console
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
        </div>
      ) : windows.length === 0 ? (
        <div className="bg-[#171a21] border border-[#2a475e] p-12 text-center rounded-xl space-y-3">
          <p className="text-white font-bold text-sm">No Active or Queued Setup Windows</p>
          <p className="text-xs text-[#8f98a0]">
            Renters request windows from their dashboard when ready to download their authorized games.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {windows.map((w) => {
            const isActive = w.status === "ACTIVE";
            const cl = checklistState[w.id] || {};

            return (
              <div
                key={w.id}
                className={`border rounded-xl p-6 space-y-5 shadow-xl ${
                  isActive
                    ? "bg-[#171a21] border-[#5ba32b]/60"
                    : "bg-[#141b24] border-[#2a475e]/60 opacity-90"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isActive
                          ? "bg-[#5ba32b]/20 text-[#5ba32b] border border-[#5ba32b]/40 animate-pulse"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {isActive ? "ACTIVE WINDOW" : `QUEUED #${w.queuePosition}`}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[160px]">
                      {w.displayName}
                    </span>
                  </div>

                  {isActive && (
                    <span className="text-sm font-mono font-black text-[#5ba32b]">
                      {w.minutesLeft}m Left
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-[#c7d5e0]">
                  <div className="flex justify-between">
                    <span className="text-[#8f98a0]">Email:</span>
                    <span className="font-mono text-white">{w.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8f98a0]">WhatsApp:</span>
                    <span className="font-mono text-white">{w.maskedWhatsapp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8f98a0]">Target Device:</span>
                    <strong className="text-white">{w.deviceLabel}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8f98a0]">Authorized Games:</span>
                    <span className="text-right truncate max-w-[200px] text-white">
                      {w.games}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Task Action Button per Section 4 */}
                <div className="pt-2">
                  <a
                    href={w.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full btn-steam-accent py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Open WhatsApp Chat (Pre-Filled Template)
                  </a>
                </div>

                {/* Admin Task Checklist (Section 4) */}
                {isActive && (
                  <div className="bg-[#16202d] border border-[#2a475e] p-4 rounded-lg space-y-2.5 text-xs text-[#c7d5e0]">
                    <span className="text-[10px] font-bold uppercase text-[#8f98a0] block">
                      Admin Operational Checklist
                    </span>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!cl.credsSent}
                        onChange={() => toggleChecklist(w.id, "credsSent")}
                        className="rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21]"
                      />
                      <span>1. Credentials sent on WhatsApp</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!cl.codeSent}
                        onChange={() => toggleChecklist(w.id, "codeSent")}
                        className="rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21]"
                      />
                      <span>2. Steam Guard code relayed manually</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!cl.confirmed}
                        onChange={() => toggleChecklist(w.id, "confirmed")}
                        className="rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21]"
                      />
                      <span>3. Renter confirmed download started</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!cl.offlineDone}
                        onChange={() => toggleChecklist(w.id, "offlineDone")}
                        className="rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21]"
                      />
                      <span className="font-bold text-white">
                        4. Renter switched Steam to Offline Mode
                      </span>
                    </label>
                  </div>
                )}

                {/* Control Action Buttons */}
                <div className="border-t border-[#2a475e]/60 pt-3 flex items-center justify-between gap-2">
                  {!isActive ? (
                    <button
                      onClick={() => handleAction(w.id, "START")}
                      disabled={actionLoading === w.id}
                      className="w-full btn-steam-cta py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Setup Window (3 Hours)
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full gap-2">
                      <button
                        onClick={() => handleAction(w.id, "EXTEND", 60)}
                        disabled={actionLoading === w.id}
                        className="btn-steam-panel py-2 px-3 rounded text-xs font-bold border border-[#2a475e] flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> +60m
                      </button>
                      <button
                        onClick={() => handleAction(w.id, "CLOSE")}
                        disabled={actionLoading === w.id}
                        className="btn-steam-cta py-2 px-4 rounded text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Offline & Close Window
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

