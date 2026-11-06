import React from "react";
import Link from "next/link";
import Image from "next/image";
import { brandConfig } from "../config/brand";
import { ShieldCheck, Mail, Phone, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#171a21] border-t border-[#2a475e]/60 text-[#8f98a0] text-xs pt-12 pb-24 md:pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#2a475e]/40">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex-shrink-0">
                <Image
                  src="/brand/icon.svg"
                  alt="Steamer Icon"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-black tracking-widest text-white">STEAMER</span>
            </div>
            <p className="text-[#8f98a0] leading-relaxed">
              {brandConfig.tagline} Fair, time-limited rental access for offline story immersion.
            </p>
            <div className="flex items-center gap-2 text-[#5ba32b] bg-[#5ba32b]/10 border border-[#5ba32b]/30 px-3 py-1.5 rounded text-[11px] font-semibold w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Built on Trust Model</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#66c0f4] transition-colors">
                  Store Home
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-[#66c0f4] transition-colors">
                  Game Catalog (245+ Titles)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#66c0f4] transition-colors">
                  My Library & Active Plan
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[#66c0f4] transition-colors">
                  Community Hub & Lounge
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[#66c0f4] transition-colors">
                  Support & Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Pages (Versioned) */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Policies & Conditions (v1.0)
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="hover:text-[#66c0f4] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/disclosure" className="hover:text-[#66c0f4] transition-colors">
                  Pre-Purchase Disclosure & Trust Pledge
                </Link>
              </li>
              <li>
                <Link href="/legal/plan-conditions" className="hover:text-[#66c0f4] transition-colors">
                  Plan Conditions & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/guidelines" className="hover:text-[#66c0f4] transition-colors">
                  Renter Offline Guidelines
                </Link>
              </li>
              <li>
                <Link href="/legal/community-rules" className="hover:text-[#66c0f4] transition-colors">
                  Community Rules
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-[#66c0f4] transition-colors">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie" className="hover:text-[#66c0f4] transition-colors">
                  Cookie Notice
                </Link>
              </li>
            </ul>
          </div>

          {/* Personal Contact & Jurisdiction (Addendum 6) */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Contact & Grievance</h4>
            <div className="space-y-2 text-[11px] text-[#8f98a0]">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#66c0f4]" />
                <a href={`mailto:${brandConfig.supportEmail}`} className="hover:text-white">
                  {brandConfig.supportEmail}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#66c0f4]" />
                <span>{brandConfig.whatsappDisplay}</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#5ba32b]" />
                <a
                  href={brandConfig.whatsappHelpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#66c0f4] hover:underline"
                >
                  Direct WhatsApp Chat
                </a>
              </p>
              <div className="pt-2 text-[10px] text-[#8f98a0]/80">
                <p><strong>Grievance Officer:</strong> {brandConfig.grievanceOfficer}</p>
                <p><strong>Email:</strong> {brandConfig.grievanceEmail}</p>
                <p><strong>Jurisdiction:</strong> Courts at {brandConfig.city}, {brandConfig.country}</p>
                <p><strong>Support Hours:</strong> {brandConfig.supportHours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Independent Disclaimer & Copyright */}
        <div className="pt-6 space-y-3 text-center sm:text-left text-[11px] leading-relaxed">
          <p className="text-[#8f98a0]/90">
            <strong>Mandatory Platform Disclaimer:</strong> {brandConfig.disclaimer}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[#8f98a0]/70 pt-2 border-t border-[#2a475e]/20 text-[10px]">
            <p>
              © {new Date().getFullYear()} {brandConfig.legalBusinessName}. All rights reserved. Registered in {brandConfig.city}, {brandConfig.country}.
            </p>
            <p className="text-[#66c0f4]">
              Independent Time-Limited Offline Gaming Access · Dedicated Shared Vault Infrastructure
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

