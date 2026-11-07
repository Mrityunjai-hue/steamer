"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  CreditCard,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Settings,
  History,
  Lock,
  BookOpen,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role === "ADMIN") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) {
    return (
      <div className="py-32 flex justify-center text-xs text-[#8f98a0]">
        Verifying Administrative Credentials...
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-[#8f98a0]">
          Administrative privileges and two-factor authentication required.
        </p>
        <Link href="/auth/login" className="btn-steam-cta px-4 py-2 rounded text-xs font-bold inline-block">
          Log In as Admin
        </Link>
      </div>
    );
  }

  const tabs = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "UPI Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Customer Roster", href: "/admin/renters", icon: Users },
    { name: "Setup Guide Editor", href: "/admin/guide", icon: BookOpen },
    { name: "Catalog", href: "/admin/catalog", icon: FolderKanban },
    { name: "Settings & Playbook", href: "/admin/settings", icon: Settings },
    { name: "Audit Log", href: "/admin/audit", icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#10141a]">
      {/* Admin Top Header Bar */}
      <div className="bg-[#171a21] border-b border-amber-500/40 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-300">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <span className="text-sm font-black text-white tracking-wider flex items-center gap-2">
                STEAMER COMMAND CONSOLE
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                  HARDENED ADMIN
                </span>
              </span>
            </div>
          </div>
          <Link href="/" className="text-xs text-[#8f98a0] hover:text-white transition-colors">
            Exit to Storefront →
          </Link>
        </div>
      </div>

      {/* Admin Navigation Ribbon */}
      <div className="bg-[#141b24] border-b border-[#2a475e]/60 px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#2a475e] text-white shadow-sm"
                    : "text-[#8f98a0] hover:text-[#c7d5e0] hover:bg-[#1b2838]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-[#66c0f4]" : "text-[#8f98a0]"}`} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}

