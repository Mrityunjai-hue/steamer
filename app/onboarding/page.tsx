"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, BookOpen } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  const steps = [
    "I understand all 370+ single-player PC games run 100% offline with permanent local saves on my PC.",
    "I will follow the click-by-click Setup Guide walkthrough in my dashboard to configure titles in my personal library.",
    "I understand this pass gives me direct, independent access on my PC with zero queues and zero account sharing.",
    "I will keep my secret access link confidential to protect my personal dashboard and setup guide access.",
    "I have access to dedicated 1-on-1 WhatsApp support (+91 99369 29997) if I ever need setup or troubleshooting assistance.",
  ];

  const [checkedSteps, setCheckedSteps] = useState<boolean[]>(new Array(5).fill(false));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStep = (index: number) => {
    const updated = [...checkedSteps];
    updated[index] = !updated[index];
    setCheckedSteps(updated);
  };

  const allChecked = checkedSteps.every(Boolean);

  const handleSubmit = async () => {
    if (!allChecked) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepsAccepted: checkedSteps.map((_, i) => i + 1),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save onboarding acceptance");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to complete onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-6 shadow-panelGlow">
        <div className="border-b border-[#2a475e]/60 pb-4 space-y-2">
          <div className="flex items-center gap-2 text-[#66c0f4]">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Quick Start Setup Guide</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            WELCOME TO STEAMER ALL-ACCESS
          </h1>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            Please review and confirm the 5 core operating points below before opening your personal Setup Guide and game vault.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-500/50 p-3.5 rounded-lg flex items-center gap-2 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* 5 Checklist Steps */}
        <div className="space-y-3">
          {steps.map((text, idx) => (
            <label
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                checkedSteps[idx]
                  ? "bg-[#16202d] border-[#5ba32b]/50 text-white"
                  : "bg-[#16202d]/40 border-[#2a475e]/40 text-[#c7d5e0] hover:bg-[#16202d]"
              }`}
            >
              <input
                type="checkbox"
                checked={checkedSteps[idx]}
                onChange={() => toggleStep(idx)}
                className="mt-0.5 rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21] w-4 h-4"
              />
              <span className="text-xs leading-relaxed">
                <strong>Point {idx + 1}:</strong> {text}
              </span>
            </label>
          ))}
        </div>

        <div className="border-t border-[#2a475e]/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#8f98a0]">
            {checkedSteps.filter(Boolean).length} of 5 points confirmed
          </span>

          <button
            onClick={handleSubmit}
            disabled={!allChecked || submitting}
            className="w-full sm:w-auto btn-steam-cta px-6 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-ctaGlow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Confirming..." : "Open Setup Guide"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
