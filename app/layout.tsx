import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import LiveSupportWidget from "@/components/LiveSupportWidget";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ViewportResetManager from "@/components/ViewportResetManager";
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
    "Steamer provides the complete PC setup guide & vault access to 370+ single-player PC games offline with local saves.",
  applicationName: "Steamer",
  manifest: "/manifest.webmanifest",
  themeColor: "#0B0018",
  appleWebApp: {
    capable: true,
    title: "Steamer",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: "Steamer",
    title: "Steamer",
    description: "Steamer",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Steamer app logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steamer",
    description: "Steamer",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/brand/logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/brand/logo.png",
    apple: "/brand/logo.png",
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
        <ViewportResetManager />
      </body>
    </html>
  );
}

