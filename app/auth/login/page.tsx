"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, Key, AlertTriangle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code2FA, setCode2FA] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code2FA: require2FA ? code2FA : undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.require2FA) {
        setRequire2FA(true);
        setLoading(false);
        return;
      }

      // If user is Admin, redirect to admin dashboard, else library
      if (data.user?.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto relative">
          <Image src="/brand/icon.svg" alt="Steamer" width={48} height={48} priority />
        </div>
        <h1 className="text-2xl font-black text-white tracking-wide">SIGN IN TO STEAMER</h1>
        <p className="text-xs text-[#8f98a0]">
          Access your All-Access Pass, setup guide walkthrough, and game vault.
        </p>
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-5 shadow-panelGlow">
        {error && (
          <div className="bg-red-950/60 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={require2FA}
                className="w-full bg-[#16202d] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={require2FA}
                className="w-full bg-[#16202d] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4] disabled:opacity-50"
              />
            </div>
          </div>

          {require2FA && (
            <div className="space-y-1 p-3 bg-[#16202d] border border-[#66c0f4]/40 rounded-lg">
              <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#66c0f4]" /> 6-Digit Authenticator Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code2FA}
                onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                autoFocus
                className="w-full bg-[#171a21] border border-[#2a475e] rounded px-3 py-2 text-xs font-mono text-center tracking-widest text-white focus:outline-none focus:border-[#66c0f4]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-steam-cta py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-ctaGlow disabled:opacity-40"
          >
            {loading ? "Authenticating..." : require2FA ? "Verify 2FA & Sign In" : "Sign In"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-[#2a475e]/60 pt-4 text-center text-xs text-[#8f98a0]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#66c0f4] font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

