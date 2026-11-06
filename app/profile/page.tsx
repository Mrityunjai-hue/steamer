"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Smartphone,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Key,
  ExternalLink,
} from "lucide-react";
import { brandConfig } from "@/config/brand";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2FA state
  const [totpData, setTotpData] = useState<any>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpMessage, setTotpMessage] = useState<string | null>(null);

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
      .finally(() => setLoading(false));

    // Load 2FA status
    fetch("/api/auth/2fa")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTotpData(data);
      });
  }, []);

  const handleToggle2FA = async (enable: boolean) => {
    setTotpMessage(null);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode, enable }),
      });
      const data = await res.json();
      if (res.ok) {
        setTotpMessage(data.message);
        setTotpData((prev: any) => ({ ...prev, enabled: enable }));
        setTotpCode("");
      } else {
        setTotpMessage(data.error || "Failed to update 2FA");
      }
    } catch {
      setTotpMessage("Error updating 2FA");
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `steamer_account_data_${user?.userId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#2a475e]/60 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          PROFILE & ACCOUNT SECURITY
        </h1>
        <p className="text-xs sm:text-sm text-[#8f98a0]">
          Manage your personal details, authenticator 2FA, verified WhatsApp, and privacy rights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Account Details & WhatsApp */}
        <div className="space-y-6">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-panelGlow">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#2a475e]/60 pb-2">
              Account Overview
            </h3>

            <div className="space-y-3 text-xs text-[#c7d5e0]">
              <div className="flex justify-between">
                <span className="text-[#8f98a0]">Display Name:</span>
                <strong className="text-white">{user?.displayName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f98a0]">Email Address:</span>
                <span className="font-mono text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f98a0]">Account Role:</span>
                <span className="bg-[#2a475e] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp Verification Status */}
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-panelGlow">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#5ba32b]" /> Verified WhatsApp
              </h3>
              {user?.isWhatsappVerified ? (
                <span className="bg-[#5ba32b]/20 text-[#5ba32b] text-[10px] font-bold px-2 py-0.5 rounded border border-[#5ba32b]/40">
                  VERIFIED
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40">
                  PENDING
                </span>
              )}
            </div>

            <p className="text-xs text-[#8f98a0] leading-relaxed">
              Your WhatsApp number is used exclusively by admin to manually relay your setup window credentials.
            </p>

            <div className="bg-[#16202d] border border-[#2a475e] p-3 rounded-lg text-xs flex justify-between items-center">
              <span className="text-[#8f98a0]">Number:</span>
              <strong className="text-white font-mono">{user?.whatsappNumber || "—"}</strong>
            </div>

            {!user?.isWhatsappVerified && user?.verificationPending && (
              <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-lg space-y-2 text-xs text-amber-200">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Complete Number Verification:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Send the verification code <strong className="font-mono text-white">{user.verificationPending.code}</strong> to the admin WhatsApp. Admin will mark your number verified upon receipt.
                </p>
                <a
                  href={`https://wa.me/${brandConfig.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(user.verificationPending.code)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-steam-cta py-2 px-3 rounded text-xs font-bold inline-flex items-center gap-1.5 mt-1"
                >
                  Send Verification on WhatsApp <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Two-Factor Authentication & Data Rights */}
        <div className="space-y-6">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-5 shadow-panelGlow">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#66c0f4]" /> Authenticator 2FA (TOTP)
              </h3>
              {totpData?.enabled ? (
                <span className="bg-[#5ba32b]/20 text-[#5ba32b] text-[10px] font-bold px-2 py-0.5 rounded border border-[#5ba32b]/40">
                  ENABLED
                </span>
              ) : (
                <span className="bg-slate-700/40 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-600">
                  DISABLED
                </span>
              )}
            </div>

            <p className="text-xs text-[#8f98a0] leading-relaxed">
              Add an extra layer of security using Google Authenticator, Authy, or 1Password. (Mandatory for Admin accounts).
            </p>

            {totpMessage && (
              <div className="p-3 bg-[#16202d] border border-[#66c0f4]/40 rounded text-xs text-[#66c0f4]">
                {totpMessage}
              </div>
            )}

            {!totpData?.enabled ? (
              <div className="space-y-4">
                {totpData?.qrDataUrl && (
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg w-fit mx-auto shadow-md">
                    <Image src={totpData.qrDataUrl} alt="2FA QR Code" width={180} height={180} priority />
                    <span className="text-[10px] text-slate-600 mt-2 font-mono">
                      Secret: {totpData.secret}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Enter 6-Digit Code from App to Enable:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 123456"
                      className="flex-1 bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#66c0f4]"
                    />
                    <button
                      onClick={() => handleToggle2FA(true)}
                      disabled={totpCode.length !== 6}
                      className="btn-steam-cta px-4 py-2 rounded text-xs font-bold disabled:opacity-40"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#5ba32b] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Two-factor authentication is active on your account.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Enter 6-Digit Code to Disable:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 123456"
                      className="flex-1 bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#66c0f4]"
                    />
                    <button
                      onClick={() => handleToggle2FA(false)}
                      disabled={totpCode.length !== 6}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-xs font-bold disabled:opacity-40"
                    >
                      Disable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Data Rights (DPDP Act) */}
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-panelGlow">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#2a475e]/60 pb-2">
              Privacy & Data Rights (DPDP Act)
            </h3>

            <p className="text-xs text-[#8f98a0] leading-relaxed">
              Under Indian personal data protection regulations, you can download a complete JSON copy of your profile, consent records, and rental history at any time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleExportData}
                className="btn-steam-panel py-2 px-4 rounded text-xs font-bold flex items-center justify-center gap-1.5 border border-[#2a475e]"
              >
                <Download className="w-3.5 h-3.5 text-[#66c0f4]" /> Export My Account Data
              </button>
              <button
                onClick={() =>
                  alert("To request complete account deletion, please open a support ticket under category 'Other' or email support@steamer.live. Note that active subscriptions must finish or be terminated before erasure.")
                }
                className="text-xs text-red-400 hover:text-red-300 py-2 px-3 border border-red-900/40 rounded flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Request Account Deletion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

