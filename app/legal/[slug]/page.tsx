import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Calendar, ArrowLeft, FileText } from "lucide-react";
import { brandConfig } from "@/config/brand";

export const revalidate = 300;

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

  const legalNav = [
    { slug: "terms", title: "Terms of Service" },
    { slug: "disclosure", title: "Pre-Purchase Disclosure & Trust Pledge" },
    { slug: "plan-conditions", title: "Plan & Purchase Conditions" },
    { slug: "guidelines", title: "Renter Guidelines (Offline Rules)" },
    { slug: "community-rules", title: "Community Rules" },
    { slug: "privacy", title: "Privacy Policy" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#8f98a0] hover:text-[#66c0f4]"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Store
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 bg-[#171a21] border border-[#2a475e] p-5 rounded-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#66c0f4]" /> Policy Pack (Version 1.0)
          </span>

          <nav className="space-y-1 text-xs">
            {legalNav.map((item) => (
              <Link
                key={item.slug}
                href={`/legal/${item.slug}`}
                className={`block px-3 py-2 rounded transition-colors ${
                  params.slug === item.slug
                    ? "bg-[#2a475e] text-white font-bold border-l-2 border-[#66c0f4]"
                    : "text-[#c7d5e0] hover:bg-[#2a475e]/40"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="border-t border-[#2a475e]/40 pt-4 text-[11px] text-[#8f98a0] space-y-1">
            <p>
              <strong>Jurisdiction:</strong> {brandConfig.city}, India
            </p>
            <p>
              <strong>Grievance:</strong> {brandConfig.grievanceEmail}
            </p>
          </div>
        </aside>

        {/* Legal Document Content Area */}
        <article className="lg:col-span-8 bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-10 space-y-6 shadow-panelGlow">
          <div className="border-b border-[#2a475e]/60 pb-4 space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8f98a0]">
              <span className="bg-[#2a475e] text-[#66c0f4] px-2 py-0.5 rounded font-mono font-bold">
                VERSION {doc.version}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Effective: {doc.effectiveDate}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{doc.title}</h1>
          </div>

          <div className="text-xs sm:text-sm text-[#c7d5e0] leading-relaxed space-y-4 whitespace-pre-line font-sans">
            {doc.contentMarkdown}
          </div>

          <div className="border-t border-[#2a475e]/60 pt-6 text-[11px] text-[#8f98a0] space-y-2">
            <p className="flex items-center gap-1.5 text-[#5ba32b] font-semibold">
              <ShieldCheck className="w-4 h-4" /> Legally Binding Terms & Conditions
            </p>
            <p className="text-[10px] text-[#8f98a0]/80">
              {brandConfig.disclaimer}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

