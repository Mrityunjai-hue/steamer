import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import LiveSupportWidget from "@/components/LiveSupportWidget";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { brandConfig } from "@/config/brand";
import { getAppUrl } from "@/lib/url";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: `${brandConfig.name} — ${brandConfig.tagline}`,
    template: `%s | ${brandConfig.name}`,
  },
  description:
    "Steamer provides the complete PC setup guide & vault access to 265+ single-player PC games offline with local saves.",
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
    <html lang="en" className="dark overflow-x-hidden max-w-full w-full">
      <body className="bg-[#1b2838] text-[#c7d5e0] min-h-screen flex flex-col antialiased selection:bg-[#66c0f4]/30 selection:text-white overflow-x-hidden max-w-full w-full">
        <Navbar />
        <main className="flex-1 overflow-x-hidden max-w-full w-full">{children}</main>
        <Footer />
        <MobileNav />
        <LiveSupportWidget />
        <CookieConsentBanner />
      </body>
    </html>
  );
}

