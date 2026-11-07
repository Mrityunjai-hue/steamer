"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Compass, Library, MessageCircle, HelpCircle } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Store", href: "/", icon: Store, isLiveSupport: false },
    { name: "Catalog", href: "/catalog", icon: Compass, isLiveSupport: false },
    { name: "Library", href: "/dashboard", icon: Library, isLiveSupport: false },
    { name: "Community", href: "/community", icon: MessageCircle, isLiveSupport: false },
    { name: "Support", href: "/support", icon: HelpCircle, isLiveSupport: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171a21]/95 backdrop-blur border-t border-[#2a475e] py-2 px-3 flex items-center justify-around shadow-2xl">
      {links.map((link) => {
        const Icon = link.icon;
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
              active ? "text-[#66c0f4] bg-[#2a475e]/60" : "text-[#8f98a0] hover:text-[#c7d5e0]"
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 ${active ? "text-[#66c0f4]" : "text-[#8f98a0]"}`} />
              {link.isLiveSupport && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#25d366] ring-2 ring-[#171a21]" />
              )}
            </div>
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

