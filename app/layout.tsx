import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { brandConfig } from "@/config/brand";
import { getAppUrl } from "@/lib/url";

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: `${brandConfig.name} — ${brandConfig.tagline}`,
    template: `%s | ${brandConfig.name}`,
  },
  description:
    "Steamer rents time-limited access to games on a dedicated shared vault account. 100% offline single-player play built on trust.",
  icons: {
    icon: "/brand/icon.svg",
    shortcut: "/brand/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#1b2838] text-[#c7d5e0] min-h-screen flex flex-col antialiased selection:bg-[#66c0f4]/30 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}

