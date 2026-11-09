"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, User as UserIcon, Shield, Menu, X, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

interface UserSession {
  userId: string;
  email: string;
  role: string;
  hasPurchased?: boolean;
  isCompleted?: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch session status
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setSession(data.user);
        }
      })
      .catch(() => {});

    // Read cart count from local storage
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("steamer_cart") || "[]");
        setCartCount(cart.length);
      } catch {
        setCartCount(0);
      }
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    window.addEventListener("cartUpdated", updateCart);

    return () => {
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("cartUpdated", updateCart);
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const navLinks = [
    { name: "STORE", href: "/" },
    { name: "CATALOG", href: "/catalog" },
    { name: "GAME HELP & FIXES", href: "/community/game-help" },
    { name: "LIBRARY", href: "/dashboard" },
    { name: "REVIEWS", href: "/#reviews" },
    { name: "SUPPORT", href: "/support" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#171a21]/95 backdrop-blur border-b border-[#2a475e]/60 shadow-lg w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/brand/logo.png"
                alt="Steamer Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-widest text-white group-hover:text-[#66c0f4] transition-colors leading-none">
                STEAMER
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#66c0f4] uppercase leading-tight">
                Offline Vault
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-bold tracking-wider rounded transition-all ${
                    active
                      ? "text-white bg-[#2a475e] shadow-sm"
                      : "text-[#c7d5e0] hover:text-white hover:bg-[#2a475e]/50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Badges, Cart, User Auth, and Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Instant All-Access / Renew Badge (Desktop) */}
          {session?.isCompleted ? (
            <Link
              href="/checkout?renew=true"
              title="Renew Setup Window (New PC / Re-Activation)"
              className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#16202d] border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-400 hover:border-emerald-400 transition-all shadow-sm h-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#5ba32b]" />
              <span>Vault Active • Renew Pass</span>
            </Link>
          ) : (
            <Link
              href="/checkout"
              title="Instant ₹300 All-Access Setup Pass"
              className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#16202d] border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-400 hover:border-emerald-400 transition-all shadow-sm h-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#5ba32b] animate-pulse" />
              <span>₹300 All-Access • 370+ Titles</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative h-8 w-8 flex items-center justify-center text-[#c7d5e0] hover:text-[#66c0f4] hover:bg-[#2a475e]/40 rounded-lg transition-colors border border-transparent hover:border-[#2a475e]/60"
            title="View Cart"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#75b022] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth / Profile */}
          {session ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {session.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 rounded hover:bg-amber-900/60 transition-colors h-8"
                >
                  <Shield className="w-3.5 h-3.5" />
                  ADMIN
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold text-[#c7d5e0] bg-[#2a475e]/70 hover:bg-[#2a475e] hover:text-white rounded transition-colors h-8"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#66c0f4]" />
                <span className="hidden sm:inline max-w-[100px] truncate">{session.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="h-8 w-8 flex items-center justify-center text-[#8f98a0] hover:text-red-400 hover:bg-[#2a475e]/40 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex px-3 py-1 text-xs font-bold text-[#c7d5e0] hover:text-white hover:bg-[#2a475e]/50 rounded transition-colors h-8 items-center"
              >
                LOGIN
              </Link>
              <Link
                href="/auth/register"
                className="px-2.5 sm:px-3.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#1a9fff] to-[#66c0f4] hover:brightness-110 rounded shadow transition-all h-8 flex items-center"
              >
                SIGN UP
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu (three bars) - perfectly sized and aligned */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden h-8 w-8 flex items-center justify-center text-[#c7d5e0] hover:text-white bg-[#2a475e]/40 hover:bg-[#2a475e] border border-[#2a475e] rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#171a21] border-b border-[#2a475e] px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between py-2 border-b border-[#2a475e]/50 text-xs">
            <span className="text-[#8f98a0]">
              {session?.isCompleted ? "Vault Active (Lifetime)" : "All-Access Vault Pass"}
            </span>
            {session?.isCompleted ? (
              <Link
                href="/checkout?renew=true"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-bold text-[#66c0f4] hover:underline"
              >
                Renew Setup Window &rarr;
              </Link>
            ) : (
              <span className="font-bold text-[#5ba32b]">₹300 Instant Unlock (370+ Titles)</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#2a475e]/50 sm:hidden">
            {!session && (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-white bg-[#2a475e]/60 hover:bg-[#2a475e] rounded border border-[#2a475e]"
                >
                  LOGIN
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-white bg-gradient-to-r from-[#1a9fff] to-[#66c0f4] rounded shadow"
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-bold rounded transition-colors ${
                  isActive(link.href)
                    ? "text-white bg-[#2a475e]"
                    : "text-[#c7d5e0] hover:bg-[#2a475e]/40"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {session?.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold text-amber-300 bg-amber-950/40 rounded border border-amber-500/30"
            >
              Admin Console
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
