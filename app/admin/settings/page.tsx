"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  AlertTriangle,
  RefreshCw,
  Power,
  CreditCard,
  Phone,
  Users,
  ShieldAlert,
  Download,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { brandConfig } from "@/config/brand";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playbookResult, setPlaybookResult] = useState<any | null>(null);

  const fetchSettings = () => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Settings saved successfully!");
        fetchSettings();
      } else {
        alert(data.error || "Failed to save settings");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerPlaybook = async () => {
    if (
      !confirm(
        "EMERGENCY ACTION: Are you sure you want to trigger the Account-Lost Playbook? This will pause sales, prepare WhatsApp refund broadcasts, and export data."
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TRIGGER_ACCOUNT_LOST_PLAYBOOK" }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlaybookResult(data);
        fetchSettings();
      } else {
        alert(data.error || "Playbook execution failed");
      }
    } catch {
      alert("Error triggering playbook");
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-[#2a475e]/60 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#66c0f4]" /> SYSTEM SETTINGS & PLATFORM CONTROLS
        </h1>
        <p className="text-xs text-[#8f98a0]">
          Configure UPI collection VPAs, contact channels, platform scale, and emergency broadcast playbooks.
        </p>
      </div>

      {/* Emergency Store Maintenance Playbook */}
      <div className="bg-red-950/40 border border-red-500/60 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-red-300 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" /> STORE MAINTENANCE & BROADCAST PLAYBOOK
          </h3>
          <button
            onClick={handleTriggerPlaybook}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded font-bold shadow-md"
          >
            Trigger Broadcast Playbook
          </button>
        </div>
        <p className="text-xs text-red-200/90 leading-relaxed">
          If store maintenance or an emergency update is required, one click pauses new checkouts and generates ready-made WhatsApp broadcast links to notify active pass holders.
        </p>

        {playbookResult && (
          <div className="bg-[#171a21] border border-red-500/40 p-4 rounded-lg space-y-3 text-xs">
            <p className="font-bold text-white">{playbookResult.message}</p>
            <span className="text-[#8f98a0]">
              Broadcast Task List ({playbookResult.broadcastList?.length || 0} Pass Holders):
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {playbookResult.broadcastList?.map((r: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-[#16202d] p-2 rounded">
                  <span>{r.email} ({r.whatsapp})</span>
                  {r.waLink && (
                    <a
                      href={r.waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#66c0f4] hover:underline flex items-center gap-1 font-bold"
                    >
                      Open WhatsApp Broadcast <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* UPI Collection Settings (Addendum 2a) */}
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-panelGlow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-[#2a475e]/60 pb-3">
            <CreditCard className="w-4 h-4 text-[#5ba32b]" /> Direct UPI Collection Settings (Addendum 2a)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-white block">UPI VPA Address *</label>
              <input
                type="text"
                value={settings["upi_vpa"] || ""}
                onChange={(e) => handleChange("upi_vpa", e.target.value)}
                placeholder="e.g. steamer@okaxis"
                required
                className="w-full bg-[#16202d] border border-[#2a475e] rounded p-2 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white block">Official Payee Name *</label>
              <input
                type="text"
                value={settings["upi_payee_name"] || ""}
                onChange={(e) => handleChange("upi_payee_name", e.target.value)}
                placeholder="e.g. Steamer Gaming Services"
                required
                className="w-full bg-[#16202d] border border-[#2a475e] rounded p-2 text-white"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-white block">Payment Instructions Text</label>
            <textarea
              value={settings["payment_instructions"] || ""}
              onChange={(e) => handleChange("payment_instructions", e.target.value)}
              rows={2}
              className="w-full bg-[#16202d] border border-[#2a475e] rounded p-2 text-white"
            />
          </div>
        </div>

        {/* Contact & WhatsApp Channels (Addendum 3a) */}
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-panelGlow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-[#2a475e]/60 pb-3">
            <Phone className="w-4 h-4 text-[#66c0f4]" /> Personal Contact & WhatsApp Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-white block">Admin Phone Number</label>
              <input
                type="text"
                value={settings["admin_phone"] || ""}
                onChange={(e) => handleChange("admin_phone", e.target.value)}
                className="w-full bg-[#16202d] border border-[#2a475e] rounded p-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white block">Admin WhatsApp Number (Customer Support & Orders)</label>
              <input
                type="text"
                value={settings["admin_whatsapp"] || ""}
                onChange={(e) => handleChange("admin_whatsapp", e.target.value)}
                className="w-full bg-[#16202d] border border-[#2a475e] rounded p-2 text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-white block">Optional WhatsApp Group Invite Link</label>
              <input
                type="url"
                value={settings["whatsapp_group_invite"] || ""}
                onChange={(e) => handleChange("whatsapp_group_invite", e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-[#16202d] border border-[#2a475e] rounded p-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Platform Scale & Architecture Controls */}
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-panelGlow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a475e]/60 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Platform Scale & Delivery Architecture
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
              🟢 Unlimited Customer Access Active
            </span>
          </div>

          <div className="p-3 bg-[#16202d] border border-emerald-500/30 rounded text-xs text-[#c7d5e0] space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Independent Offline PC Setup Guide
            </p>
            <p className="text-[11px] text-[#8f98a0]">
              Users configure their games directly on their Steam accounts using the visual Setup Guide. There are no shared accounts, no login collisions, no queues, and no user limits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-white block">Platform Model</label>
              <input
                type="text"
                disabled
                value="Independent PC Setup & Vault Access"
                className="w-full bg-[#121922] border border-[#2a475e] rounded p-2 text-emerald-400 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white block">Intake Capacity</label>
              <input
                type="text"
                disabled
                value="Unlimited (No User Caps)"
                className="w-full bg-[#121922] border border-[#2a475e] rounded p-2 text-emerald-400 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white block">Pass Pricing</label>
              <input
                type="text"
                disabled
                value="Flat ₹300 (Lifetime Vault Access)"
                className="w-full bg-[#121922] border border-[#2a475e] rounded p-2 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white block">Catalog Scope</label>
              <input
                type="text"
                disabled
                value="265+ Verified Single-Player Titles"
                className="w-full bg-[#121922] border border-[#2a475e] rounded p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-steam-cta px-6 py-2.5 rounded text-xs font-bold flex items-center gap-2 shadow-ctaGlow disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

