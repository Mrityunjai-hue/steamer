"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShieldCheck, ArrowRight, Sparkles, Tag, ShoppingCart } from "lucide-react";

interface CartItem {
  id: string;
  title: string;
  hypeTier: string;
  price: number;
  launcher: string;
  offlineTag: string;
  headerImage?: string;
}

interface PricingBreakdown {
  gameCount: number;
  individualSum: number;
  finalPrice: number;
  savings: number;
  planType: string;
  planLabel: string;
  nudge?: string;
  isAllAccessBetterValue: boolean;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isAllAccess, setIsAllAccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load cart from local storage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("steamer_cart") || "[]");
      setCart(saved);
    } catch {
      setCart([]);
    }
  }, []);

  // Calculate pricing whenever cart changes
  useEffect(() => {
    if (cart.length === 0 && !isAllAccess) {
      setPricing(null);
      return;
    }

    setLoading(true);
    fetch("/api/cart/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameIds: cart.map((g) => g.id),
        isAllAccess,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.pricing) {
          setPricing(data.pricing);
        }
      })
      .catch((err) => console.error("Pricing calculation failed:", err))
      .finally(() => setLoading(false));
  }, [cart, isAllAccess]);

  const removeItem = (id: string) => {
    const updated = cart.filter((g) => g.id !== id);
    setCart(updated);
    localStorage.setItem("steamer_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const clearCart = () => {
    setCart([]);
    setIsAllAccess(false);
    localStorage.removeItem("steamer_cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-[#66c0f4]" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            YOUR RENTAL SELECTION
          </h1>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Selection
          </button>
        )}
      </div>

      {cart.length === 0 && !isAllAccess ? (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#2a475e]/40 flex items-center justify-center mx-auto text-[#66c0f4]">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your rental cart is empty</h3>
          <p className="text-xs text-[#8f98a0]">
            Browse our catalog of 245+ games and add your favorites to build your personalized 30-day rental plan.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/catalog" className="btn-steam-cta px-6 py-2.5 rounded text-xs font-bold">
              Browse Catalog
            </Link>
            <button
              onClick={() => setIsAllAccess(true)}
              className="btn-steam-panel px-6 py-2.5 rounded text-xs font-bold border border-[#2a475e]"
            >
              Pick All-Access (₹300/mo)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Games List */}
          <div className="lg:col-span-8 space-y-4">
            {isAllAccess ? (
              <div className="bg-[#171a21] border border-emerald-500/40 rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    All-Access Pass
                  </span>
                  <button
                    onClick={() => setIsAllAccess(false)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Switch back to individual games
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white">Complete Vault All-Access Pass</h3>
                <p className="text-xs text-[#8f98a0]">
                  Gives you rental access to all 240+ single-player PC games in the catalog for 30 days. No need to select games individually.
                </p>
              </div>
            ) : (
              cart.map((game) => (
                <div
                  key={game.id}
                  className="bg-[#171a21] border border-[#2a475e] p-4 rounded-lg flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-24 h-12 rounded overflow-hidden bg-[#16202d] flex-shrink-0">
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
                      <div className="flex items-center gap-2 text-[10px] text-[#8f98a0]">
                        <span className="text-[#66c0f4]">{game.hypeTier}</span>
                        <span>•</span>
                        <span>{game.launcher}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-bold text-[#5ba32b]">₹{game.price}</span>
                    <button
                      onClick={() => removeItem(game.id)}
                      className="p-1.5 text-[#8f98a0] hover:text-red-400 rounded transition-colors"
                      title="Remove game"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Smart Pricing Nudge / Recommendations */}
            {pricing?.nudge && (
              <div className="bg-[#16202d] border border-[#66c0f4]/40 p-4 rounded-lg flex items-center gap-3 text-xs text-[#c7d5e0]">
                <Sparkles className="w-5 h-5 text-[#66c0f4] flex-shrink-0" />
                <p>
                  <strong>Savings Tip:</strong> {pricing.nudge}
                </p>
              </div>
            )}
          </div>

          {/* Pricing Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 shadow-xl space-y-6 sticky top-24">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#2a475e]/60 pb-3">
                Order Summary
              </h3>

              {pricing && (
                <div className="space-y-3 text-xs text-[#c7d5e0]">
                  <div className="flex justify-between">
                    <span className="text-[#8f98a0]">Plan Allocation:</span>
                    <strong className="text-white">{pricing.planLabel}</strong>
                  </div>

                  {!isAllAccess && (
                    <div className="flex justify-between">
                      <span className="text-[#8f98a0]">Individual Sum:</span>
                      <span>₹{pricing.individualSum}</span>
                    </div>
                  )}

                  {pricing.savings > 0 && (
                    <div className="flex justify-between text-[#5ba32b]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Tag className="w-3.5 h-3.5" /> Bundle Cap Discount:
                      </span>
                      <span>-₹{pricing.savings}</span>
                    </div>
                  )}

                  <div className="border-t border-[#2a475e]/60 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Monthly Rent:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#5ba32b]">
                        ₹{pricing.finalPrice}
                      </span>
                      <span className="text-[10px] text-[#8f98a0] block">
                        30 days · Direct UPI
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full btn-steam-cta py-3 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-ctaGlow"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/catalog"
                  className="w-full btn-steam-panel py-2 rounded text-xs font-bold flex items-center justify-center border border-[#2a475e]"
                >
                  + Add More Games
                </Link>
              </div>

              <div className="text-[11px] text-[#8f98a0] space-y-1 border-t border-[#2a475e]/40 pt-4">
                <p className="flex items-center gap-1.5 text-white font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5ba32b]" /> Built on Trust Model
                </p>
                <p>• Atomic 30-minute slot reservation at checkout</p>
                <p>• 100% offline single-player access only</p>
                <p>• Direct UPI payment with zero gateway fees</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

