"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, X, ShieldCheck, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { brandConfig } from "@/config/brand";

export default function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [contact, setContact] = useState({
    cleanPhone: brandConfig.whatsappNumber.replace(/\D/g, ""),
    displayPhone: brandConfig.whatsappDisplay,
  });

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.cleanPhone) {
          setContact({
            cleanPhone: data.cleanPhone,
            displayPhone: data.displayPhone || data.phone,
          });
        }
      })
      .catch(() => {});
  }, []);

  const whatsappUrl = `https://wa.me/${contact.cleanPhone}?text=${encodeURIComponent(
    "Hi Steamer Admin! I'm interested in the 265 Games for ₹300 pass. Can you help me with a quick question?"
  )}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 flex flex-col items-end">
      {/* Expanded Trust Card */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-1.5rem)] max-w-sm bg-[#171a21] border border-[#2a475e] rounded-xl shadow-2xl p-5 text-xs space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25d366]"></span>
              </span>
              <strong className="text-white text-sm font-black tracking-wide">Steamer Live Support</strong>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8f98a0] hover:text-white p-1 rounded transition-colors"
              aria-label="Close live support"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[#c7d5e0] leading-relaxed text-xs">
            Have questions about the <strong>₹300 setup walkthrough</strong>, game titles, or activating on your Steam account directly? Our admin is active on WhatsApp to assist you.
          </p>

          <div className="bg-[#16202d] border border-[#2a475e]/60 rounded-lg p-3.5 space-y-2 text-xs text-[#8f98a0]">
            <p className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 100% Gamer Protection Pledge
            </p>
            <div className="space-y-1.5 pl-1 pt-0.5">
              <p className="flex items-center gap-2 text-[#c7d5e0]">
                <CheckCircle className="w-3.5 h-3.5 text-[#5ba32b] flex-shrink-0" />
                <span>1-on-1 walkthrough on your Steam account directly</span>
              </p>
              <p className="flex items-center gap-2 text-[#c7d5e0]">
                <CheckCircle className="w-3.5 h-3.5 text-[#5ba32b] flex-shrink-0" />
                <span>48-Hour Full Money-Back Guarantee</span>
              </p>
              <p className="flex items-center gap-2 text-[#c7d5e0]">
                <Clock className="w-3.5 h-3.5 text-[#66c0f4] flex-shrink-0" />
                <span>Fast replies (typically within 2–3 minutes)</span>
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25d366] hover:bg-[#20ba5a] text-black font-black py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-xs tracking-wide"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.193-.548-1.787-.74-2.935-2.55-3.024-2.67-.089-.12-1.071-1.425-1.071-2.716 0-1.291.677-1.925.918-2.186.241-.261.528-.326.704-.326.176 0 .352.002.505.01.162.008.379-.061.593.453.221.529.754 1.839.82 1.974.066.135.11.293.022.47-.088.176-.132.287-.264.441-.132.154-.277.345-.395.463-.133.133-.271.277-.117.542.154.264.685 1.13 1.471 1.83 1.011.902 1.864 1.182 2.128 1.314.264.133.418.11.572-.066.154-.176.66-.77 836-1.034.176-.264.352-.22.593-.132.242.088 1.54.726 1.804.858.264.132.44.198.506.308.066.11.066.638-.078 1.043z" />
            </svg>
            <span>Chat on WhatsApp (Direct Support)</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Floating Action Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group bg-[#171a21] hover:bg-[#1f2937] border border-[#2a475e] hover:border-[#25d366] text-white px-3.5 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl transition-all hover:scale-105"
        title="Live Support & Inquiries"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25d366]"></span>
        </span>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <MessageSquare className="w-3.5 h-3.5 text-[#25d366]" />
          <span>Live Support</span>
        </div>
        <span className="text-[10px] text-[#8f98a0] bg-[#16202d] px-1.5 py-0.5 rounded border border-[#2a475e]">
          Online
        </span>
      </button>
    </div>
  );
}
