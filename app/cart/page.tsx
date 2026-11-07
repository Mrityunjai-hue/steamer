"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShieldCheck, ArrowRight, CheckCircle2, ShoppingCart, BookOpen } from "lucide-react";
import { ALL_ACCESS_PRICE } from "@/lib/pricing";

interface CartItem {
  id: string;
  title: string;
  hypeTier: string;
  launcher: string;
  offlineTag: string;
  headerImage?: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userStatus, setUserStatus] = useState<{ isCompleted?: boolean; hasPurchased?: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserStatus({
            isCompleted: data.user.isCompleted,
            hasPurchased: data.user.hasPurchased,
          });
        }
      })
      .catch(() => {});

    try {
      const saved = JSON.parse(localStorage.getItem("steamer_cart") || "[]");
      setCart(saved);
    } catch {
      setCart([]);
    }
  }, []);

  const removeItem = (id: string) => {
    const updated = cart.filter((g) => g.id !== id);
    setCart(updated);
    localStorage.setItem("steamer_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("steamer_cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-[#66c0f4]" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              YOUR ACCESS SELECTION
            </h1>
            <p className="text-xs text-[#8f98a0]">
              Unlock the complete setup guide and play 265+ premium PC titles forever.
            </p>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Preview List
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: All-Access Guide Banner + Selected Titles Preview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main All-Access Guide Feature Card (Steam style) */}
          <div className="bg-[#1b2838] border border-[#2a475e] rounded-sm p-6 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a475e]/60 pb-3">
              <span className="bg-[#4c6b22] text-[#beee11] text-[10px] font-extrabold px-2.5 py-1 rounded-sm uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lifetime games access in your personal Steam
              </span>
              <span className="text-xs text-[#8f98a0]">One-Time Payment · No Recurring Fees</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Complete PC Setup Guide & 265+ Titles Vault
              </h2>
              <p className="text-xs sm:text-sm text-[#c7d5e0] leading-relaxed">
                Stop paying thousands for individual titles or dealing with shared accounts. Get the ultimate, step-by-step guide to unlocking and playing premium PC games forever directly on your Steam account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-[#c7d5e0]">
              <div className="bg-[#16202d] border border-[#2a475e] p-3 rounded-sm flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#66c0f4] flex-shrink-0" />
                <span>Step-by-step setup in under 10 minutes</span>
              </div>
              <div className="bg-[#16202d] border border-[#2a475e] p-3 rounded-sm flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#5ba32b] flex-shrink-0" />
                <span>No account sharing · Local saves & offline play</span>
              </div>
            </div>
          </div>

          {/* Selected Game Previews (if any) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f98a0]">
                {cart.length > 0 ? `Games in Your Preview List (${cart.length})` : "All 265+ Games Included"}
              </h3>
              <Link href="/catalog" className="text-xs text-[#66c0f4] hover:underline">
                Browse Full Catalog →
              </Link>
            </div>

            {cart.length === 0 ? (
              <div className="bg-[#171a21] border border-[#2a475e] rounded-lg p-6 text-center space-y-2">
                <p className="text-xs text-[#8f98a0]">
                  You have not bookmarked any individual titles yet, but <strong>all 265+ games in our vault are automatically included</strong> with your ₹{ALL_ACCESS_PRICE} setup guide.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((game) => (
                  <div
                    key={game.id}
                    className="bg-[#171a21] border border-[#2a475e] p-3.5 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-20 h-10 rounded overflow-hidden bg-[#16202d] flex-shrink-0">
                        {game.headerImage ? (
                          <Image src={game.headerImage} alt={game.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#2a475e] flex items-center justify-center text-[10px] font-bold text-white">
                            GAME
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{game.title}</h4>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          Included in Setup Guide
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                        Included
                      </span>
                      <button
                        onClick={() => removeItem(game.id)}
                        className="p-1 text-[#8f98a0] hover:text-red-400 rounded transition-colors"
                        title="Remove from preview"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-[#1b2838] border border-[#2a475e] rounded-sm p-6 shadow-xl space-y-6 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#2a475e]/60 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-[#c7d5e0]">
              <div className="flex justify-between items-center">
                <span className="text-[#8f98a0]">Plan:</span>
                <strong className="text-white text-right">
                  {userStatus?.isCompleted
                    ? "Setup Window Renewal (New PC / Re-Activation)"
                    : "Lifetime games access in your personal Steam"}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8f98a0]">Catalog Coverage:</span>
                <span className="text-emerald-400 font-semibold">265+ Titles Included</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8f98a0]">Access Type:</span>
                <span className="text-white">
                  {userStatus?.isCompleted ? "Fresh 45-Min Setup Session" : "Lifetime in personal Steam"}
                </span>
              </div>

              <div className="border-t border-[#2a475e]/60 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Amount:</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-[#5ba32b]">
                    ₹{ALL_ACCESS_PRICE}
                  </span>
                  <span className="text-[10px] text-[#8f98a0] block">
                    One-time direct UPI · No subscription
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {userStatus?.isCompleted ? (
                <>
                  <Link
                    href="/checkout?renew=true"
                    className="w-full btn-steam-cta py-3.5 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow"
                  >
                    Renew Setup Window – ₹{ALL_ACCESS_PRICE} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full btn-steam-panel py-2 rounded text-xs font-bold flex items-center justify-center border border-[#2a475e] text-white"
                  >
                    Open Your Library &amp; Guide
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/checkout"
                    className="w-full btn-steam-cta py-3.5 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow"
                  >
                    Unlock the Full Guide – ₹{ALL_ACCESS_PRICE} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/catalog"
                    className="w-full btn-steam-panel py-2 rounded text-xs font-bold flex items-center justify-center border border-[#2a475e]"
                  >
                    Browse All 265+ Games
                  </Link>
                </>
              )}
            </div>

            <div className="text-[11px] text-[#8f98a0] space-y-1.5 border-t border-[#2a475e]/40 pt-4">
              <p className="flex items-center gap-1.5 text-white font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> What You Get:
              </p>
              <p>• The Complete Setup Guide (under 10 mins)</p>
              <p>• No account sharing · Directly on your Steam account</p>
              <p>• Full offline & local saves support</p>
              <p>• Direct UPI payment with instant admin verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
