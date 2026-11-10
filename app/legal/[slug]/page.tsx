import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ShieldCheck,
  Calendar,
  ArrowLeft,
  FileText,
  Clock,
  Lock,
  Sparkles,
  Scale,
  HeartHandshake,
  CreditCard,
  Gamepad2,
  Users,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Laptop,
  Check,
  Building,
  Shield,
  Layers,
} from "lucide-react";
import { brandConfig } from "@/config/brand";

export const revalidate = 300;

interface LegalNavEntry {
  slug: string;
  title: string;
  subtitle: string;
  icon: any;
}

const legalNav: LegalNavEntry[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    subtitle: "Core terms, scope & purchase conditions",
    icon: Scale,
  },
  {
    slug: "disclosure",
    title: "Pre-Purchase Disclosure & Trust Pledge",
    subtitle: "Read before you buy & fair-play pledge",
    icon: HeartHandshake,
  },
  {
    slug: "plan-conditions",
    title: "Plan & Purchase Conditions",
    subtitle: "₹300 lifetime pass & refund policy",
    icon: CreditCard,
  },
  {
    slug: "guidelines",
    title: "Offline Setup & Gaming Guidelines",
    subtitle: "45-min setup window & local play rules",
    icon: Gamepad2,
  },
  {
    slug: "community-rules",
    title: "Community Rules",
    subtitle: "Security, etiquette & fair use rules",
    icon: Users,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    subtitle: "DPDP Act 2023 & data fiduciary disclosure",
    icon: ShieldCheck,
  },
];

export default async function LegalPage({
  params,
}: {
  params: { slug: string };
}) {
  const doc = await prisma.legalDocumentVersion.findFirst({
    where: { slug: params.slug },
    orderBy: { createdAt: "desc" },
  });

  if (!doc) {
    notFound();
  }

  const currentNav = legalNav.find((n) => n.slug === params.slug) || legalNav[0];
  const CurrentIcon = currentNav.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a475e]/40 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8f98a0] hover:text-[#66c0f4] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Store Home</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[#8f98a0]">
          <span className="text-[#66c0f4] font-medium">Legal Center</span>
          <span>/</span>
          <span className="text-white font-semibold">{doc.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[#171a21]/95 border border-[#2a475e] p-5 rounded-2xl shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a475e]/60">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#66c0f4]" /> Policy Documentation
              </span>
              <span className="bg-[#66c0f4]/10 text-[#66c0f4] text-[10px] font-mono px-2 py-0.5 rounded border border-[#66c0f4]/30 font-bold">
                v{doc.version}
              </span>
            </div>

            <nav className="space-y-1.5">
              {legalNav.map((item) => {
                const ItemIcon = item.icon;
                const isActive = params.slug === item.slug;
                return (
                  <Link
                    key={item.slug}
                    href={`/legal/${item.slug}`}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#1b2838] to-[#2a475e] text-white border-l-4 border-[#66c0f4] shadow-md"
                        : "text-[#c7d5e0] hover:bg-[#1b2838]/60 hover:text-white"
                    }`}
                  >
                    <ItemIcon
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isActive ? "text-[#66c0f4]" : "text-[#8f98a0]"
                      }`}
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold leading-tight">{item.title}</div>
                      <div className="text-[10px] text-[#8f98a0] line-clamp-1">
                        {item.subtitle}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Jurisdiction & Trust Summary Card */}
            <div className="border-t border-[#2a475e]/60 pt-4 space-y-3 text-[11px] text-[#8f98a0]">
              <div className="flex items-start gap-2">
                <Building className="w-3.5 h-3.5 text-[#66c0f4] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Operating Entity</strong>
                  <span>{brandConfig.legalBusinessName}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5ba32b] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Jurisdiction</strong>
                  <span>{brandConfig.city}, {brandConfig.state}, India</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#e5a93c] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Grievance & Support Desk</strong>
                  <span className="break-all">{brandConfig.grievanceEmail}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Assistance Pill */}
            <div className="pt-2">
              <a
                href={brandConfig.whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-bold py-2.5 px-3 rounded-xl transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with WhatsApp Support</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Legal Document Content Area */}
        <article className="lg:col-span-8 bg-[#171a21]/95 border border-[#2a475e] rounded-2xl p-6 sm:p-10 space-y-8 shadow-2xl backdrop-blur-sm">
          {/* Header Banner */}
          <div className="border-b border-[#2a475e]/60 pb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="bg-[#66c0f4]/15 text-[#66c0f4] px-2.5 py-1 rounded-md font-mono font-bold border border-[#66c0f4]/30 flex items-center gap-1.5">
                  <CurrentIcon className="w-3.5 h-3.5" />
                  VERSION {doc.version}
                </span>
                <span className="bg-[#5ba32b]/15 text-[#5ba32b] px-2.5 py-1 rounded-md font-semibold border border-[#5ba32b]/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Official Policy
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[#8f98a0]">
                <Calendar className="w-3.5 h-3.5 text-[#66c0f4]" /> Effective: {doc.effectiveDate}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {doc.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#8f98a0] mt-1.5">
                {currentNav.subtitle}
              </p>
            </div>

            {/* Quick Highlights Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="bg-[#1b2838]/80 border border-[#2a475e]/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-[#8f98a0] block uppercase font-bold tracking-wider">Plan</span>
                <span className="text-xs font-black text-[#66c0f4]">₹300 One-Time</span>
              </div>
              <div className="bg-[#1b2838]/80 border border-[#2a475e]/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-[#8f98a0] block uppercase font-bold tracking-wider">Guarantee</span>
                <span className="text-xs font-black text-[#5ba32b]">48-Hour Refund</span>
              </div>
              <div className="bg-[#1b2838]/80 border border-[#2a475e]/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-[#8f98a0] block uppercase font-bold tracking-wider">Gaming Mode</span>
                <span className="text-xs font-black text-[#c7d5e0]">100% Offline</span>
              </div>
              <div className="bg-[#1b2838]/80 border border-[#2a475e]/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-[#8f98a0] block uppercase font-bold tracking-wider">Saves</span>
                <span className="text-xs font-black text-[#e5a93c]">Permanent Local</span>
              </div>
            </div>
          </div>

          {/* Bespoke Styled Document Body */}
          <div className="space-y-6">
            {params.slug === "terms" && <TermsOfServiceView />}
            {params.slug === "disclosure" && <DisclosureView />}
            {params.slug === "plan-conditions" && <PlanConditionsView />}
            {params.slug === "guidelines" && <GuidelinesView />}
            {params.slug === "community-rules" && <CommunityRulesView />}
            {params.slug === "privacy" && <PrivacyPolicyView />}

            {/* Fallback structured parser if unexpected slug */}
            {![
              "terms",
              "disclosure",
              "plan-conditions",
              "guidelines",
              "community-rules",
              "privacy",
            ].includes(params.slug) && (
              <GenericLegalParser content={doc.contentMarkdown} />
            )}
          </div>

          {/* Legal Binding Disclaimer Footer */}
          <div className="border-t border-[#2a475e]/60 pt-6 space-y-4">
            <div className="flex items-start gap-3 bg-[#1b2838]/50 border border-[#2a475e]/60 p-4 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-[#5ba32b] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#8f98a0] space-y-1 leading-relaxed">
                <span className="font-bold text-white block">
                  Legally Binding Terms & Buyer Protection
                </span>
                <p>{brandConfig.disclaimer}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#8f98a0]">
              <div className="flex items-center gap-4">
                <span>Grievance Desk: {brandConfig.grievanceEmail}</span>
                <span>•</span>
                <span>Bengaluru, India</span>
              </div>
              <a
                href={brandConfig.whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#66c0f4] hover:underline"
              >
                <span>Need clarification? Message WhatsApp Admin</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

// ============================================================================
// Bespoke UI Renderers for each Legal Document
// ============================================================================

function TermsOfServiceView() {
  const clauses = [
    {
      num: "01",
      icon: Gamepad2,
      title: "Service Scope & Knowledge Base",
      tag: "CORE ACCESS",
      tagColor: "border-[#66c0f4]/40 bg-[#66c0f4]/10 text-[#66c0f4]",
      content:
        "Steamer provides comprehensive PC setup instructions, configuration files, and vault access for offline single-player gaming across 265+ catalog titles directly in your personal Steam client.",
    },
    {
      num: "02",
      icon: Clock,
      title: "One-Time 45-Minute Setup Window",
      tag: "SECURITY PROTOCOL",
      tagColor: "border-[#e5a93c]/40 bg-[#e5a93c]/10 text-[#e5a93c]",
      content:
        "Each purchase includes one dedicated 45-minute setup session. Upon clicking 'Process Completed' or when the timer expires, setup walkthrough credentials permanently lock to safeguard vault integrity and protect shared assets.",
    },
    {
      num: "03",
      icon: Lock,
      title: "Single-Use Activation Restriction",
      tag: "VAULT INTEGRITY",
      tagColor: "border-[#f43f5e]/40 bg-[#f43f5e]/10 text-[#f43f5e]",
      content:
        "Setup credentials cannot be autonomously re-opened after completion. All game installations and save data remain permanently playable on your personal PC in offline mode.",
    },
    {
      num: "04",
      icon: Laptop,
      title: "Device Renewal & Hardware Changes",
      tag: "SYSTEM UPGRADE",
      tagColor: "border-[#a855f7]/40 bg-[#a855f7]/10 text-[#a855f7]",
      content:
        "If you change your computer, replace primary hardware, or format your operating system, you can easily renew your setup window using the 'Renew Setup Window' option or message WhatsApp Admin for assistance.",
    },
    {
      num: "05",
      icon: ShieldCheck,
      title: "48-Hour Money-Back Guarantee",
      tag: "BUYER PROTECTION",
      tagColor: "border-[#5ba32b]/40 bg-[#5ba32b]/10 text-[#5ba32b]",
      content:
        "If the setup walkthrough cannot be successfully configured on your compatible Windows PC and our admin support team cannot resolve the issue, you are entitled to a full refund within 48 hours via direct UPI.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {clauses.map((c) => {
          const ItemIcon = c.icon;
          return (
            <div
              key={c.num}
              className="bg-[#1b2838]/70 hover:bg-[#1b2838] border border-[#2a475e]/80 hover:border-[#66c0f4]/50 rounded-xl p-5 transition-all shadow-md group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a475e] to-[#171a21] border border-[#66c0f4]/30 flex items-center justify-center text-[#66c0f4] font-mono font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                  {c.num}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <ItemIcon className="w-4 h-4 text-[#66c0f4]" />
                      <span>{c.title}</span>
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${c.tagColor}`}
                    >
                      {c.tag}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#c7d5e0] leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DisclosureView() {
  const disclosures = [
    {
      title: "One-Time ₹300 Payment",
      content:
        "You pay once for lifetime games access in your personal Steam. There are zero recurring monthly charges or hidden subscriptions.",
      icon: CreditCard,
      highlight: "₹300 Lifetime",
    },
    {
      title: "One-Time 45-Minute Setup Session",
      content:
        "Each purchase unlocks a dedicated 45-minute setup window to configure your PC with our visual click-by-click instructions.",
      icon: Clock,
      highlight: "45-Min Window",
    },
    {
      title: "Permanent Vault Lock Upon Completion",
      content:
        "Once you click 'Process Completed' or the 45-minute timer expires, walkthrough credentials permanently lock to safeguard vault security.",
      icon: Lock,
      highlight: "Secure Vault Lock",
    },
    {
      title: "No Autonomous Re-Activation",
      content:
        "Completed accounts cannot re-open setup sessions autonomously. Your configured games remain playable offline indefinitely on your PC.",
      icon: Shield,
      highlight: "Single-Use Token",
    },
    {
      title: "Renewal for New PCs & Formats",
      content:
        "If you upgrade hardware, change computers, or format your system, you can purchase a Setup Window Renewal or message WhatsApp Admin.",
      icon: RefreshCw,
      highlight: "Hardware Renewal",
    },
    {
      title: "Offline & Local Play Only",
      content:
        "All games run in offline single-player mode with permanent local saves stored on your personal PC. Online multiplayer is not supported.",
      icon: Gamepad2,
      highlight: "100% Offline Mode",
    },
    {
      title: "No Account Sharing Conflicts",
      content:
        "Setup is configured for your personal system so you won't get interrupted or kicked off by other users while playing.",
      icon: Users,
      highlight: "Zero Kick-Offs",
    },
    {
      title: "265+ Titles Supported",
      content:
        "The guide includes exact configuration steps and manifests for every single title listed in our comprehensive catalog.",
      icon: Layers,
      highlight: "All Titles Included",
    },
    {
      title: "Fast 10-Minute Setup",
      content:
        "Easy click-by-click visual instructions designed for beginners and experienced PC gamers alike with instant WhatsApp backup.",
      icon: CheckCircle2,
      highlight: "Beginner Friendly",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 9 Disclosures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {disclosures.map((d, i) => {
          const Icon = d.icon;
          return (
            <div
              key={i}
              className="bg-[#1b2838]/70 hover:bg-[#1b2838] border border-[#2a475e]/80 hover:border-[#66c0f4]/50 rounded-xl p-4 sm:p-5 transition-all shadow-md space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-white">
                    <Icon className="w-4 h-4 text-[#66c0f4]" />
                    <span>{d.title}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2a475e]/60 text-[#66c0f4] border border-[#66c0f4]/20 font-semibold">
                    {d.highlight}
                  </span>
                </div>
                <p className="text-xs text-[#c7d5e0] leading-relaxed">
                  {d.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* The Steamer Fair-Play Commitment Illuminated Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#17202d] via-[#1b2b3f] to-[#17202d] border border-[#66c0f4]/40 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-[#66c0f4] text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#e5a93c]" />
            <span>The Steamer Fair-Play Commitment</span>
          </div>

          <blockquote className="text-sm sm:text-base text-white font-medium italic leading-relaxed">
            &ldquo;Steamer provides honest, high-value setup knowledge for PC gamers. We respect your time, provide clean local configurations without account kick-offs, and stand behind our guide with dedicated WhatsApp support.&rdquo;
          </blockquote>

          <div className="pt-2 flex items-center justify-between text-xs text-[#8f98a0] border-t border-[#2a475e]/50">
            <span>Built on Trust Model · Customer First Philosophy</span>
            <span className="text-[#5ba32b] font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Verified Promise
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanConditionsView() {
  return (
    <div className="space-y-6">
      {/* C1. Pricing Plan Card */}
      <div className="bg-gradient-to-br from-[#1b2838] to-[#171a21] border-2 border-[#66c0f4]/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-[#66c0f4] tracking-wider">
              Section C1 · Single Unified Plan
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Complete PC Setup Guide & Lifetime Vault Access
            </h2>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-[#5ba32b]">
              ₹300
            </span>
            <span className="text-xs text-[#8f98a0] block uppercase font-mono">
              One-Time Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#171a21] border border-[#2a475e]/80 rounded-xl p-3.5 space-y-1">
            <CheckCircle2 className="w-4 h-4 text-[#5ba32b]" />
            <div className="text-xs font-bold text-white">Lifetime Access</div>
            <p className="text-[11px] text-[#8f98a0]">
              Unlimited access to setup walkthroughs across 265+ single-player PC titles.
            </p>
          </div>
          <div className="bg-[#171a21] border border-[#2a475e]/80 rounded-xl p-3.5 space-y-1">
            <CheckCircle2 className="w-4 h-4 text-[#5ba32b]" />
            <div className="text-xs font-bold text-white">Zero Subscriptions</div>
            <p className="text-[11px] text-[#8f98a0]">
              No monthly auto-debits, no hidden renewals, and no paywalls.
            </p>
          </div>
          <div className="bg-[#171a21] border border-[#2a475e]/80 rounded-xl p-3.5 space-y-1">
            <CheckCircle2 className="w-4 h-4 text-[#5ba32b]" />
            <div className="text-xs font-bold text-white">No Tier Upgrades</div>
            <p className="text-[11px] text-[#8f98a0]">
              All current and future catalog releases included under one single price.
            </p>
          </div>
        </div>
      </div>

      {/* C2. Refunds and Assistance Process */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase text-[#8f98a0] tracking-wider flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#66c0f4]" /> Section C2 · Verification, Assistance & Refund Policy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1b2838]/70 border border-[#2a475e]/80 rounded-xl p-4 sm:p-5 space-y-2 relative">
            <div className="w-7 h-7 rounded-lg bg-[#2a475e] text-[#66c0f4] flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Admin UPI Verification</h4>
            <p className="text-xs text-[#c7d5e0] leading-relaxed">
              Orders are verified via your UPI payment reference (UTR) within minutes to unlock your dashboard.
            </p>
          </div>

          <div className="bg-[#1b2838]/70 border border-[#2a475e]/80 rounded-xl p-4 sm:p-5 space-y-2 relative">
            <div className="w-7 h-7 rounded-lg bg-[#2a475e] text-[#66c0f4] flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-white">1-on-1 Support Guarantee</h4>
            <p className="text-xs text-[#c7d5e0] leading-relaxed">
              If you encounter any configuration roadblock or technical glitch, message our team on WhatsApp for hands-on assistance.
            </p>
          </div>

          <div className="bg-[#1b2838]/70 border border-[#5ba32b]/40 rounded-xl p-4 sm:p-5 space-y-2 relative bg-gradient-to-br from-[#1b2838] to-[#122416]">
            <div className="w-7 h-7 rounded-lg bg-[#5ba32b]/20 text-[#5ba32b] flex items-center justify-center font-mono font-bold text-xs border border-[#5ba32b]/40">
              03
            </div>
            <h4 className="text-sm font-bold text-[#5ba32b]">48-Hour Full Refund</h4>
            <p className="text-xs text-[#c7d5e0] leading-relaxed">
              If our setup guide cannot be successfully configured on your compatible system after admin assistance, a full refund is processed via direct UPI within 48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuidelinesView() {
  const steps = [
    {
      num: "1",
      title: "Offline & Single-Player Mode",
      content:
        "All games are configured strictly for offline play. Local save files and progress remain stored directly on your personal PC.",
      icon: Gamepad2,
    },
    {
      num: "2",
      title: "One-Time 45-Minute Setup Session",
      content:
        "Follow the step-by-step Setup Guide provided in your dashboard during your active 45-minute session.",
      icon: Clock,
    },
    {
      num: "3",
      title: "Mandatory Process Completion",
      content:
        "Complete all walkthrough steps and click 'Process Completed' to finalize your access and release the navigation lock.",
      icon: CheckCircle2,
    },
    {
      num: "4",
      title: "Single-Use Activation Policy",
      content:
        "Once confirmed or expired, setup sessions permanently close. Users who have completed the guide cannot request another activation window autonomously.",
      icon: Lock,
    },
    {
      num: "5",
      title: "Renewal Policy for Hardware Changes",
      content:
        "Users who switch to a new PC, reformat, or need a re-installation can renew their setup window via the 'Renew Setup Window' option.",
      icon: RefreshCw,
    },
    {
      num: "6",
      title: "Local Save Files Management",
      content:
        "Save files are stored directly on your personal computer; keep local backups of your game progress.",
      icon: Laptop,
    },
    {
      num: "7",
      title: "Independent Personal PC Use",
      content:
        "Access is for your own personal system only. Redistribution of guide materials or account credentials is strictly prohibited.",
      icon: Shield,
    },
    {
      num: "8",
      title: "Direct WhatsApp Support Desk",
      content:
        "Contact our team via WhatsApp for any 1-on-1 configuration or troubleshooting questions.",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="bg-[#1b2838]/70 hover:bg-[#1b2838] border border-[#2a475e]/80 hover:border-[#66c0f4]/50 rounded-xl p-4 sm:p-5 transition-all shadow-md flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-[#2a475e] text-[#66c0f4] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                {s.num}
              </div>
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#66c0f4]" />
                  <span>{s.title}</span>
                </div>
                <p className="text-xs text-[#c7d5e0] leading-relaxed">
                  {s.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommunityRulesView() {
  const rules = [
    {
      num: "01",
      title: "Be Respectful & Constructive",
      content:
        "Treat all members with courtesy. Constructive discussions on PC performance, modding, and offline gaming setups are warmly welcomed.",
      icon: HeartHandshake,
      badge: "COURTESY",
      badgeColor: "border-[#5ba32b]/40 text-[#5ba32b] bg-[#5ba32b]/10",
    },
    {
      num: "02",
      title: "Zero Credential Sharing",
      content:
        "Never post passwords, Steam Guard verification codes, or screenshots containing sensitive account info in public boards or chat.",
      icon: Lock,
      badge: "SECURITY",
      badgeColor: "border-[#f43f5e]/40 text-[#f43f5e] bg-[#f43f5e]/10",
    },
    {
      num: "03",
      title: "Strict Anti-Piracy Policy",
      content:
        "No piracy, crack discussion, keygens, or evasion tactics. We strictly share configuration knowledge for official launchers.",
      icon: ShieldCheck,
      badge: "LEGALITY",
      badgeColor: "border-[#e5a93c]/40 text-[#e5a93c] bg-[#e5a93c]/10",
    },
    {
      num: "04",
      title: "Authorized Pass Holders Only",
      content:
        "Access to community boards and support forums is exclusively reserved for active and verified Steamer vault pass holders.",
      icon: Users,
      badge: "MEMBERSHIP",
      badgeColor: "border-[#66c0f4]/40 text-[#66c0f4] bg-[#66c0f4]/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rules.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.num}
              className="bg-[#1b2838]/70 hover:bg-[#1b2838] border border-[#2a475e]/80 hover:border-[#66c0f4]/50 rounded-xl p-5 transition-all shadow-md space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#2a475e] text-[#66c0f4] flex items-center justify-center font-mono font-bold text-xs">
                      {r.num}
                    </div>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-[#66c0f4]" />
                      {r.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${r.badgeColor}`}
                  >
                    {r.badge}
                  </span>
                </div>
                <p className="text-xs text-[#c7d5e0] leading-relaxed">
                  {r.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrivacyPolicyView() {
  return (
    <div className="space-y-6">
      {/* Compliance Header Card */}
      <div className="bg-[#1b2838]/80 border border-[#2a475e] rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#66c0f4] uppercase tracking-wider">
          <Building className="w-4 h-4" /> Data Fiduciary Identification
        </div>
        <p className="text-xs sm:text-sm text-[#c7d5e0] leading-relaxed">
          <strong className="text-white">{brandConfig.legalBusinessName}</strong> ("we") is the data fiduciary for Steamer. We operate in strict compliance with the <strong className="text-white">Digital Personal Data Protection Act (DPDP), 2023</strong> of the Republic of India.
        </p>
      </div>

      {/* Two Column Collection vs Non-Collection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data We Collect */}
        <div className="bg-[#1b2838]/70 border border-[#5ba32b]/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5ba32b] uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Minimal Necessary Information
          </div>
          <p className="text-xs text-[#8f98a0]">
            Collected solely to administer your subscription, verify orders, and provide support:
          </p>
          <ul className="space-y-2 text-xs text-[#c7d5e0]">
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#5ba32b] mt-0.5 flex-shrink-0" />
              <span><strong>Name & Email:</strong> Account identification and order receipts.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#5ba32b] mt-0.5 flex-shrink-0" />
              <span><strong>WhatsApp Number:</strong> 1-on-1 configuration assistance and emergency recovery.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#5ba32b] mt-0.5 flex-shrink-0" />
              <span><strong>Device Label:</strong> Prevents concurrent conflict on your personal PC.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#5ba32b] mt-0.5 flex-shrink-0" />
              <span><strong>UPI Payment UTR:</strong> Order reconciliation and instant activation.</span>
            </li>
          </ul>
        </div>

        {/* Data We NEVER Store */}
        <div className="bg-[#1b2838]/70 border border-[#f43f5e]/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f43f5e] uppercase tracking-wider">
            <XCircle className="w-4 h-4" /> Zero-Trust Privacy Safeguards
          </div>
          <p className="text-xs text-[#8f98a0]">
            We never intercept, store, or process any of the following:
          </p>
          <ul className="space-y-2 text-xs text-[#c7d5e0]">
            <li className="flex items-start gap-2">
              <XCircle className="w-3.5 h-3.5 text-[#f43f5e] mt-0.5 flex-shrink-0" />
              <span><strong>No Credit Cards or Banking Data:</strong> Payments handled via peer-to-peer UPI.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-3.5 h-3.5 text-[#f43f5e] mt-0.5 flex-shrink-0" />
              <span><strong>No Personal Steam Passwords:</strong> We never ask for your personal credentials.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-3.5 h-3.5 text-[#f43f5e] mt-0.5 flex-shrink-0" />
              <span><strong>No Personal Computer Files:</strong> Zero access or monitoring of your device data.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CDN Disclosure Card */}
      <div className="bg-[#171a21] border border-[#2a475e]/80 rounded-xl p-4 flex items-start gap-3">
        <Layers className="w-4 h-4 text-[#66c0f4] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#8f98a0] space-y-0.5">
          <strong className="text-white block">Content & Storefront Asset Delivery</strong>
          <span>Game capsules and promotional screenshots are fetched directly from Valve's public Content Delivery Network (Akamai/Fastly). Steamer does not host copyrighted game binaries.</span>
        </div>
      </div>
    </div>
  );
}

// Fallback markdown parser to guarantee no raw '###' or '**' are ever shown on any custom slug
function GenericLegalParser({ content }: { content: string }) {
  const lines = content.split("\n");
  const parsedItems: { type: "heading" | "quote" | "item" | "para"; text: string; num?: string; title?: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
      parsedItems.push({
        type: "heading",
        text: trimmed.replace(/^#+\s*/, ""),
      });
    } else if (trimmed.startsWith('"') || trimmed.startsWith("&ldquo;")) {
      parsedItems.push({
        type: "quote",
        text: trimmed.replace(/^["“”]/, "").replace(/["“”]$/, ""),
      });
    } else if (/^\d+\.\s+\*\*(.+?)\:\*\*\s*(.*)$/.test(trimmed)) {
      const match = trimmed.match(/^\d+\.\s+\*\*(.+?)\:\*\*\s*(.*)$/);
      if (match) {
        parsedItems.push({
          type: "item",
          title: match[1],
          text: match[2],
        });
      }
    } else if (/^-\s+\*\*(.+?)\:\*\*\s*(.*)$/.test(trimmed)) {
      const match = trimmed.match(/^-\s+\*\*(.+?)\:\*\*\s*(.*)$/);
      if (match) {
        parsedItems.push({
          type: "item",
          title: match[1],
          text: match[2],
        });
      }
    } else if (/^\d+\.\s+(.+)$/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (match) {
        parsedItems.push({
          type: "item",
          num: match[1],
          text: match[2].replace(/\*\*/g, ""),
        });
      }
    } else {
      parsedItems.push({
        type: "para",
        text: trimmed.replace(/\*\*/g, ""),
      });
    }
  }

  return (
    <div className="space-y-4">
      {parsedItems.map((item, idx) => {
        if (item.type === "heading") {
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg font-bold text-white border-b border-[#2a475e]/60 pb-2 pt-2"
            >
              {item.text}
            </h3>
          );
        }
        if (item.type === "quote") {
          return (
            <div
              key={idx}
              className="bg-gradient-to-r from-[#17202d] to-[#1c2c3e] border border-[#66c0f4]/40 rounded-xl p-5 italic text-sm text-white"
            >
              &ldquo;{item.text}&rdquo;
            </div>
          );
        }
        if (item.type === "item") {
          return (
            <div
              key={idx}
              className="bg-[#1b2838]/70 border border-[#2a475e]/80 rounded-xl p-4 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-[#66c0f4] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#c7d5e0] leading-relaxed">
                {item.title && <strong className="text-white block mb-0.5">{item.title}</strong>}
                <span>{item.text}</span>
              </div>
            </div>
          );
        }
        return (
          <p key={idx} className="text-xs sm:text-sm text-[#c7d5e0] leading-relaxed">
            {item.text}
          </p>
        );
      })}
    </div>
  );
}
