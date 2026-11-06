"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User as UserIcon, Mail, Lock, Phone, AlertTriangle, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { brandConfig } from "@/config/brand";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password, whatsappNumber }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setVerificationData(data.verification);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto relative">
          <Image src="/brand/icon.svg" alt="Steamer" width={48} height={48} priority />
        </div>
        <h1 className="text-2xl font-black text-white tracking-wide">JOIN STEAMER</h1>
        <p className="text-xs text-[#8f98a0]">
          Create your account to start renting and playing offline.
        </p>
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-5 shadow-panelGlow">
        {error && (
          <div className="bg-red-950/60 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {verificationData ? (
          /* Number Verification Screen without OTP per Addendum 3b */
          <div className="text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#5ba32b]/20 text-[#5ba32b] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Account Created!</h3>
              <p className="text-xs text-[#8f98a0]">
                Per Addendum 3b, verify your WhatsApp number directly with the admin:
              </p>
            </div>

            <div className="bg-[#16202d] border border-[#2a475e] p-4 rounded-lg space-y-2">
              <span className="text-[11px] text-[#8f98a0]">Your Personal Verification Code:</span>
              <div className="text-2xl font-mono font-black text-[#66c0f4] tracking-wider">
                {verificationData.code}
              </div>
            </div>

            <a
              href={verificationData.waLink}
              target="_blank"
              rel="noreferrer"
              className="w-full btn-steam-cta py-3 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-ctaGlow"
            >
              Send on WhatsApp to Admin <ExternalLink className="w-4 h-4" />
            </a>

            <div className="pt-2">
              <Link href="/catalog" className="text-xs text-[#66c0f4] hover:underline block">
                Continue to Store Catalog →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white block">Your Name / Gamer Tag</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. AlexViper"
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white block">Password (min 8 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white block">WhatsApp Number (for setup window credentials)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>
              <p className="text-[10px] text-[#8f98a0]">
                Admin will manually send login credentials to this number during your setup window.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-steam-cta py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-ctaGlow disabled:opacity-40"
            >
              {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="border-t border-[#2a475e]/60 pt-4 text-center text-xs text-[#8f98a0]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#66c0f4] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

