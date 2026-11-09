export interface BrandConfig {
  name: string;
  tagline: string;
  legalBusinessName: string;
  city: string;
  state: string;
  country: string;
  supportEmail: string;
  legalEmail: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappHelpUrl: string;
  grievanceOfficer: string;
  grievanceEmail: string;
  effectiveDate: string;
  supportHours: string;
  hostingProvider: string;
  emailProvider: string;
  disclaimer: string;
  trustBanner: string;
  slotCounterText: (left: number, total: number) => string;
  offlineReminder: string;
  bannerBuiltOnTrust: string;
}

const envPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || process.env.ADMIN_WHATSAPP || "";
const cleanEnvPhone = envPhone.replace(/\D/g, "");

export const brandConfig: BrandConfig = {
  name: "Steamer",
  tagline: "Rent Games. Play Offline. Built on Trust.",
  legalBusinessName: "Steamer Digital Gaming Services LLP",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  supportEmail: "steamer.support365@gmail.com",
  legalEmail: "steamer.support365@gmail.com",
  whatsappNumber: envPhone,
  whatsappDisplay: "WhatsApp Direct (Primary Support Channel)",
  whatsappHelpUrl: cleanEnvPhone ? `https://wa.me/${cleanEnvPhone}` : "/support",
  grievanceOfficer: "Steamer Support Desk",
  grievanceEmail: "steamer.support365@gmail.com",
  effectiveDate: "November 1, 2026",
  supportHours: "10:00 AM – 11:00 PM IST (Monday to Sunday)",
  hostingProvider: "Cloudflare & Secure Dedicated Cloud Infrastructure",
  emailProvider: "Transactional SMTP Delivery Network",
  disclaimer:
    "Game images and trademarks belong to their respective owners. Steamer is an independent service and is not affiliated with, endorsed by, or sponsored by Valve Corporation, Steam, or any game publisher.",
  trustBanner:
    "We don't lock your library. You pay for the games you choose, and we trust you to play only those. Trust is everything here.",
  slotCounterText: (left: number, total: number) =>
    `${left} of ${total} slots left this month · First come, first served.`,
  offlineReminder: "Go Offline before you launch. Never click Go Online.",
  bannerBuiltOnTrust: "Steamer is built on trust. Play offline, keep logins confidential, and enjoy your games."
};

/**
 * Utility to replace placeholders in text content with values from brandConfig
 */
export function hydrateLegalText(template: string): string {
  return template
    .replace(/\[BUSINESS\]/g, brandConfig.legalBusinessName)
    .replace(/\[CITY\]/g, brandConfig.city)
    .replace(/\[SUPPORT_EMAIL\]/g, brandConfig.supportEmail)
    .replace(/\[WHATSAPP_NUMBER\]/g, brandConfig.whatsappDisplay)
    .replace(/\[GRIEVANCE_OFFICER\]/g, brandConfig.grievanceOfficer)
    .replace(/\[EFFECTIVE_DATE\]/g, brandConfig.effectiveDate)
    .replace(/\[SUPPORT_HOURS\]/g, brandConfig.supportHours)
    .replace(/\[HOSTING_PROVIDER\]/g, brandConfig.hostingProvider)
    .replace(/\[EMAIL_PROVIDER\]/g, brandConfig.emailProvider);
}
