import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { brandConfig, hydrateLegalText } from "../config/brand.ts";

const prisma = new PrismaClient();

// Well-known steam app IDs for top games in the seed to show live official artwork out-of-the-box
const KNOWN_STEAM_APP_IDS: Record<string, { appId: string; steamPrice: number; releaseDate: string; genres: string }> = {
  "Grand Theft Auto V": { appId: "271590", steamPrice: 1978, releaseDate: "Apr 14, 2015", genres: "Action, Adventure" },
  "Black Myth: Wukong": { appId: "2358720", steamPrice: 3599, releaseDate: "Aug 20, 2024", genres: "Action, RPG" },
  "God of War": { appId: "1593500", steamPrice: 3299, releaseDate: "Jan 14, 2022", genres: "Action, Adventure, RPG" },
  "Ghost of Tsushima Director's Cut": { appId: "2215430", steamPrice: 3999, releaseDate: "May 16, 2024", genres: "Action, Adventure" },
  "The Last of Us Part I": { appId: "1888930", steamPrice: 3999, releaseDate: "Mar 28, 2023", genres: "Action, Adventure" },
  "Marvel's Spider-Man Remastered": { appId: "1817070", steamPrice: 3999, releaseDate: "Aug 12, 2022", genres: "Action, Adventure" },
  "Marvel's Spider-Man: Miles Morales": { appId: "1817190", steamPrice: 3299, releaseDate: "Nov 18, 2022", genres: "Action, Adventure" },
  "Red Dead Redemption 2": { appId: "1174180", steamPrice: 3199, releaseDate: "Dec 5, 2019", genres: "Action, Adventure" },
  "Red Dead Redemption": { appId: "2668510", steamPrice: 3799, releaseDate: "Oct 29, 2024", genres: "Action, Adventure" },
  "Hogwarts Legacy": { appId: "990080", steamPrice: 3999, releaseDate: "Feb 10, 2023", genres: "Action, Adventure, RPG" },
  "The Witcher 3: Wild Hunt": { appId: "292030", steamPrice: 1699, releaseDate: "May 18, 2015", genres: "RPG, Open World" },
  "Batman: Arkham Knight": { appId: "208650", steamPrice: 1349, releaseDate: "Jun 23, 2015", genres: "Action, Adventure" },
  "Batman: Arkham City": { appId: "200260", steamPrice: 565, releaseDate: "Sep 7, 2012", genres: "Action, Adventure" },
  "Batman: Arkham Asylum": { appId: "35140", steamPrice: 565, releaseDate: "Mar 26, 2010", genres: "Action, Adventure" },
  "Sekiro: Shadows Die Twice": { appId: "814380", steamPrice: 4999, releaseDate: "Mar 21, 2019", genres: "Action, Souls-like" },
  "Silent Hill 2": { appId: "2124490", steamPrice: 4199, releaseDate: "Oct 8, 2024", genres: "Action, Survival Horror" },
  "Resident Evil 4 (Remake)": { appId: "2050650", steamPrice: 2499, releaseDate: "Mar 23, 2023", genres: "Action, Horror" },
  "Resident Evil Village": { appId: "1196590", steamPrice: 2199, releaseDate: "May 6, 2021", genres: "Action, Horror" },
  "Resident Evil 7: Biohazard": { appId: "418370", steamPrice: 1499, releaseDate: "Jan 23, 2017", genres: "Action, Horror" },
  "Resident Evil 2 (Remake)": { appId: "883710", steamPrice: 1999, releaseDate: "Jan 24, 2019", genres: "Action, Horror" },
  "Resident Evil 3 (Remake)": { appId: "952060", steamPrice: 1999, releaseDate: "Apr 2, 2020", genres: "Action, Horror" },
  "Doom Eternal": { appId: "782330", steamPrice: 1799, releaseDate: "Mar 19, 2020", genres: "Action, FPS" },
  "Control Ultimate Edition": { appId: "870780", steamPrice: 2199, releaseDate: "Aug 27, 2020", genres: "Action, Sci-Fi" },
  "Days Gone": { appId: "1259420", steamPrice: 3299, releaseDate: "May 18, 2021", genres: "Action, Open World" },
  "Dying Light 2: Stay Human": { appId: "534380", steamPrice: 2499, releaseDate: "Feb 3, 2022", genres: "Action, Survival" },
  "Dying Light": { appId: "239140", steamPrice: 1099, releaseDate: "Jan 26, 2015", genres: "Action, Survival" },
  "Forza Horizon 5": { appId: "1551360", steamPrice: 3499, releaseDate: "Nov 8, 2021", genres: "Racing, Open World" },
  "Forza Horizon 4": { appId: "1293830", steamPrice: 1299, releaseDate: "Mar 9, 2021", genres: "Racing, Open World" },
  "Subnautica": { appId: "264710", steamPrice: 1499, releaseDate: "Jan 23, 2018", genres: "Adventure, Survival" },
  "Outlast": { appId: "238320", steamPrice: 850, releaseDate: "Sep 3, 2013", genres: "Action, Horror" },
  "Outlast 2": { appId: "414700", steamPrice: 1300, releaseDate: "Apr 24, 2017", genres: "Action, Horror" },
  "Little Nightmares": { appId: "424840", steamPrice: 999, releaseDate: "Apr 27, 2017", genres: "Adventure, Horror" },
  "Little Nightmares II": { appId: "860510", steamPrice: 1499, releaseDate: "Feb 10, 2021", genres: "Adventure, Horror" },
  "Sleeping Dogs": { appId: "307690", steamPrice: 729, releaseDate: "Oct 8, 2014", genres: "Action, Open World" },
  "Tekken 8": { appId: "1778820", steamPrice: 4199, releaseDate: "Jan 25, 2024", genres: "Fighting, Action" },
  "Tekken 7": { appId: "389730", steamPrice: 1699, releaseDate: "Jun 1, 2017", genres: "Fighting, Action" },
  "Mortal Kombat 11": { appId: "976310", steamPrice: 2699, releaseDate: "Apr 23, 2019", genres: "Fighting, Action" },
  "Rise of the Tomb Raider": { appId: "391220", steamPrice: 999, releaseDate: "Jan 28, 2016", genres: "Action, Adventure" },
  "Shadow of the Tomb Raider": { appId: "750920", steamPrice: 2199, releaseDate: "Sep 14, 2018", genres: "Action, Adventure" },
  "Tomb Raider (2013) GOTY Edition": { appId: "203160", steamPrice: 850, releaseDate: "Mar 4, 2013", genres: "Action, Adventure" },
  "Star Wars Jedi: Fallen Order": { appId: "1172380", steamPrice: 2199, releaseDate: "Nov 14, 2019", genres: "Action, Adventure" },
  "Star Wars Jedi: Survivor": { appId: "1774580", steamPrice: 3499, releaseDate: "Apr 28, 2023", genres: "Action, Adventure" },
  "A Plague Tale: Innocence": { appId: "752590", steamPrice: 1999, releaseDate: "May 14, 2019", genres: "Action, Adventure" },
  "Limbo": { appId: "48000", steamPrice: 450, releaseDate: "Aug 1, 2011", genres: "Puzzle, Platformer" },
  "Inside": { appId: "304430", steamPrice: 850, releaseDate: "Jul 7, 2016", genres: "Puzzle, Adventure" },
  "Garry's Mod": { appId: "4000", steamPrice: 480, releaseDate: "Nov 29, 2006", genres: "Sandbox" },
  "Geometry Dash": { appId: "322170", steamPrice: 199, releaseDate: "Dec 22, 2014", genres: "Rhythm, Action" },
  "Getting Over It with Bennett Foddy": { appId: "240720", steamPrice: 320, releaseDate: "Dec 6, 2017", genres: "Difficult, Physics" },
  "Lethal Company": { appId: "1966720", steamPrice: 480, releaseDate: "Oct 23, 2023", genres: "Horror, Co-op" },
};

async function main() {
  console.log("--- Starting Steamer Database Seed ---");

  // 1. Create Default Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@steamer.live";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || "SteamerAdmin#2026!Secure", 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        isEmailVerified: true,
        isWhatsappVerified: true,
        whatsappNumber: "+919876543210",
        profile: {
          create: {
            displayName: "Steamer Lead Administrator",
            avatarUrl: "/brand/icon.svg",
            bio: "Platform Administrator & Operations Custodian",
          },
        },
      },
    });
    console.log(`✓ Admin user created: ${admin.email}`);
  } else {
    console.log(`✓ Admin user exists: ${existingAdmin.email}`);
  }

  // 2. Create Pricing Tiers
  const pricingTiers = [
    { name: "Hot", rentPriceINR: 99, description: "Brand-new releases and mega-blockbusters" },
    { name: "Popular", rentPriceINR: 79, description: "Critically acclaimed hits and top-seller essentials" },
    { name: "Standard", rentPriceINR: 59, description: "Evergreen favorites and story masterpieces" },
    { name: "Budget", rentPriceINR: 39, description: "Classic franchise hits and beloved indie gems" },
  ];

  for (const tier of pricingTiers) {
    await prisma.pricingTier.upsert({
      where: { name: tier.name },
      update: { rentPriceINR: tier.rentPriceINR, description: tier.description },
      create: tier,
    });
  }
  console.log("✓ Pricing tiers seeded (Hot: ₹99, Popular: ₹79, Standard: ₹59, Budget: ₹39)");

  // 3. Create Default System Settings (Addendum 6 & Capacity Controls)
  const defaultSettings: Array<{ key: string; value: string; description: string }> = [
    { key: "upi_vpa", value: "steamer@upi", description: "Admin UPI VPA address for rent collections" },
    { key: "upi_payee_name", value: brandConfig.legalBusinessName, description: "Official Payee Name for UPI transactions" },
    { key: "upi_static_qr_path", value: "", description: "Fallback path to static UPI QR code image" },
    { key: "admin_phone", value: brandConfig.whatsappNumber, description: "Official admin contact phone number" },
    { key: "admin_whatsapp", value: brandConfig.whatsappNumber, description: "Admin WhatsApp number for credential relay" },
    { key: "admin_email", value: brandConfig.supportEmail, description: "Official support and contact email" },
    { key: "whatsapp_group_invite", value: "https://chat.whatsapp.com/G3Hk89SteamLive", description: "Optional announcement WhatsApp group invite link" },
    { key: "payment_instructions", value: "Scan the QR code with GPay, PhonePe, Paytm or BHIM. Enter your Order ID in the payment remarks/notes. Enter the 12-digit UPI UTR number below to submit.", description: "Instructions displayed during UPI payment" },
    { key: "max_active_renters", value: "8", description: "Maximum concurrent active subscribers permitted" },
    { key: "max_new_renters_per_month", value: "8", description: "Monthly onboarding intake limit" },
    { key: "max_setup_windows_per_day", value: "2", description: "Maximum setup windows scheduled per calendar day" },
    { key: "setup_window_max_minutes", value: "180", description: "Setup window duration limit in minutes (default 3 hours)" },
    { key: "onboarding_paused", value: "false", description: "Emergency pause master switch for new subscriptions" },
    { key: "slot_hold_minutes_payment", value: "30", description: "Minutes a slot is held while renter pays and enters UTR" },
    { key: "slot_hold_hours_verification", value: "3", description: "Hours a slot is held while admin verifies the payment" },
    { key: "active_renters_count", value: "3", description: "Current count of active renters holding slots" },
    { key: "steam_presence_poll_seconds", value: "60", description: "Frequency to poll Steam Web API for account presence" },
    { key: "playtime_audit_enabled", value: "false", description: "Delayed playtime audit toggle (OFF by default)" },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✓ System settings & capacity controls initialized");

  // 4. Import Catalog from `/data/catalog_seed.csv`
  const csvPath = path.join(process.cwd(), "data", "catalog_seed.csv");
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Parsing ${records.length} titles from catalog_seed.csv...`);

    // Load generated full artwork map if present
    let resolvedArtworkMap: Record<string, any> = {};
    const artworkJsonPath = path.join(process.cwd(), "data", "steam_resolved_artwork.json");
    if (fs.existsSync(artworkJsonPath)) {
      try {
        resolvedArtworkMap = JSON.parse(fs.readFileSync(artworkJsonPath, "utf8"));
      } catch {
        // fallback to KNOWN_STEAM_APP_IDS
      }
    }

    let importedCount = 0;
    for (const row of records) {
      const title = row.title;
      const seriesName = row.series || "Other";
      const hypeTier = row.hypeTier || "Standard";
      const ourMonthlyPriceINR = parseInt(row.ourMonthlyPriceINR, 10) || 59;
      const suggestedOfflineTag = row.suggestedOfflineTag || null;
      const launcher = row.launcher || "Steam only";
      const purchasableAsSingle = row.purchasableAsSingle ? row.purchasableAsSingle.toUpperCase() === "TRUE" : true;
      const adminNote = row.adminNote || null;

      // Rule 5.1: Offline OK badge may be shown ONLY if testedOfflineOn is set. Otherwise Unverified!
      let offlineTag = row.offlineTag || "Unverified";
      let testedOfflineOn: Date | null = null;

      if (row.testedOfflineOn) {
        testedOfflineOn = new Date(row.testedOfflineOn);
      } else if (offlineTag === "Offline OK") {
        offlineTag = "Unverified";
      }

      // Check if we have known steam info or if row already has steamAppId
      const knownInfo = KNOWN_STEAM_APP_IDS[title] || resolvedArtworkMap[title];
      const steamAppId = row.steamAppId || knownInfo?.appId || null;
      const steamPriceINR = row.steamPriceINR ? parseInt(row.steamPriceINR, 10) : (knownInfo?.steamPrice || null);
      const releaseDate = knownInfo?.releaseDate || null;
      const genres = knownInfo?.genres || null;

      // Construct official Steam CDN artwork urls (hotlinked per Rule 5.4)
      const headerImage = steamAppId ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg` : null;
      const capsuleImage = steamAppId ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/library_600x900.jpg` : null;

      // Upsert Series
      const series = await prisma.series.upsert({
        where: { name: seriesName },
        update: {},
        create: { name: seriesName },
      });

      // Upsert Game
      await prisma.game.upsert({
        where: { title },
        update: {
          seriesId: series.id,
          hypeTier,
          ourMonthlyPriceINR,
          offlineTag,
          suggestedOfflineTag,
          testedOfflineOn,
          launcher,
          purchasableAsSingle,
          steamAppId,
          steamPriceINR,
          adminNote,
          releaseDate,
          genres,
          headerImage,
          capsuleImage,
        },
        create: {
          title,
          seriesId: series.id,
          hypeTier,
          ourMonthlyPriceINR,
          offlineTag,
          suggestedOfflineTag,
          testedOfflineOn,
          launcher,
          purchasableAsSingle,
          steamAppId,
          steamPriceINR,
          adminNote,
          releaseDate,
          genres,
          headerImage,
          capsuleImage,
        },
      });

      importedCount++;
    }
    console.log(`✓ Successfully seeded ${importedCount} catalog games`);
  } else {
    console.warn("! Warning: catalog_seed.csv not found at data/catalog_seed.csv");
  }

  // 5. Seed Versioned Legal Documents
  const legalDocs = [
    {
      slug: "terms",
      version: "1.0",
      title: "Terms of Service",
      effectiveDate: brandConfig.effectiveDate,
      contentMarkdown: hydrateLegalText(`
## 1. Who we are
Steamer is operated by [BUSINESS] ("we", "us"). We provide a digital knowledge base and PC configuration guide service described below. Steamer is an independent service. We are **not affiliated with, endorsed by or sponsored by Valve Corporation, Steam, or any game publisher**. All game names, images and trademarks belong to their respective owners.

## 2. Who can use the service
You must be **18 or older** and able to enter a binding contract in India. You must provide accurate details including your name, email, and WhatsApp number. One person, one account.

## 3. What you are buying
You are purchasing **The Complete PC Setup Guide & Lifetime Vault Access Pass** for a single one-time fee of ₹300. You receive our curated, step-by-step instructions for configuring and playing 245+ single-player PC games on your own system in offline mode. You are **not** buying game licenses or ownership of game software. We do not sell, crack, or distribute pirated software files.

## 4. No Account Sharing
Unlike shared-account rental services where multiple users battle for the same login, our setup guide teaches you how to configure games directly on your personal computer so you never get kicked off by other players.

## 5. Offline & Local Play
All setup instructions are intended strictly for **offline, single-player campaigns and story modes**. Online multiplayer, live co-op, online leaderboards, and in-game microtransactions are not supported. Save files are preserved locally on your PC.

## 6. Setup Instructions & Delivery
Upon completing your one-time ₹300 payment via direct UPI and submitting your UTR reference, our admin confirms the order and your dashboard immediately unlocks the click-by-click Setup Guide. Setup takes under 10 minutes to complete.

## 7. Pricing and Payment
- Pricing is flat ₹300 INR (one-time payment). There are **no recurring monthly fees or auto-renewals**.
- Payment is collected via direct UPI to our verified UPI VPA with zero payment gateway processing fees.
- Lifetime access to current and future guide updates for all 245+ supported catalog titles is included.

## 8. Refunds & Guarantee
If the setup guide fails to work on your compatible Windows PC and our admin support team cannot resolve the issue within 48 hours of purchase, you are eligible for a full refund via direct UPI.

## 9. Contact and Grievance
Support: [SUPPORT_EMAIL] · WhatsApp: [WHATSAPP_NUMBER] · Grievance Officer: [GRIEVANCE_OFFICER], [SUPPORT_EMAIL].
`),
    },
    {
      slug: "disclosure",
      version: "1.0",
      title: "Read Before You Buy Disclosure & Trust Pledge",
      effectiveDate: brandConfig.effectiveDate,
      contentMarkdown: hydrateLegalText(`
### Essential Pre-Purchase Disclosures
- **One-Time ₹300 Payment:** You pay once for lifetime access. There are no recurring subscriptions.
- **Offline & Local Play:** All games run in offline single-player mode with local saves stored on your PC.
- **No Account Sharing:** Setup is configured for your personal system so you won't get interrupted by other users.
- **245+ Titles Supported:** The guide includes configuration steps for every title listed in the catalog.
- **Fast 10-Minute Setup:** Easy click-by-click instructions designed for beginners and experienced PC gamers alike.

### The Steamer Commitment
"Steamer provides honest, high-value setup knowledge for PC gamers. We respect your time, provide clean local configurations without account kick-offs, and stand behind our guide with dedicated WhatsApp support."
`),
    },
    {
      slug: "plan-conditions",
      version: "1.0",
      title: "Plan and Purchase Conditions",
      effectiveDate: brandConfig.effectiveDate,
      contentMarkdown: hydrateLegalText(`
## C1. Pricing Plan
- **Complete PC Setup Guide & Lifetime Vault Access:** Flat ₹300 INR (One-time payment).
- Grants unlimited lifetime access to the step-by-step setup walkthrough for all 245+ single-player PC games.
- No individual game fees, no tier upgrades, and no recurring monthly charges.

## C2. Refunds and Assistance
1. **Admin Verification:** Orders are verified via UPI UTR within minutes.
2. **Support Guarantee:** If you encounter any configuration roadblock, contact our team on WhatsApp for 1-on-1 assistance.
3. **Refund Policy:** If our guide cannot be successfully configured on your system after admin assistance, a full refund is processed via UPI within 48 hours.
`),
    },
    {
      slug: "guidelines",
      version: "1.0",
      title: "Renter Guidelines & Onboarding",
      effectiveDate: brandConfig.effectiveDate,
      contentMarkdown: hydrateLegalText(`
1. Go Offline before you play (Steam -> Go Offline).
2. Never click "Go Online" outside of an authorized setup window.
3. Play only your chosen games.
4. Never change account details (password, email, Steam Guard, profile).
5. No social, trading, or market features.
6. One person, one registered device.
7. Keep credentials strictly confidential.
8. Back up your save files locally.
`),
    },
    {
      slug: "community-rules",
      version: "1.0",
      title: "Community Rules",
      effectiveDate: brandConfig.effectiveDate,
      contentMarkdown: hydrateLegalText(`
1. Be respectful and constructive.
2. Never post passwords, Steam Guard codes, or screenshots containing sensitive account info.
3. No piracy, crack discussion, or evasion tactics.
4. Access is reserved for active and recently active renters.
`),
    },
    {
      slug: "privacy",
      version: "1.0",
      title: "Privacy Policy",
      effectiveDate: brandConfig.effectiveDate,
      contentMarkdown: hydrateLegalText(`
[BUSINESS] ("we") is the data fiduciary for Steamer. We comply with the Digital Personal Data Protection Act, 2023.

We collect your name, email, WhatsApp number, device label, and UPI payment reference (UTR) solely to administer your subscription. We never store credit cards, personal Steam credentials, or device files.
Images are served directly from Valve's public CDN.
`),
    },
  ];

  for (const doc of legalDocs) {
    await prisma.legalDocumentVersion.upsert({
      where: { slug_version: { slug: doc.slug, version: doc.version } },
      update: {
        title: doc.title,
        contentMarkdown: doc.contentMarkdown,
        effectiveDate: doc.effectiveDate,
      },
      create: doc,
    });
  }
  console.log("✓ Versioned legal documents (v1.0) seeded and hydrated");

  // 6. Seed Sample Community Threads
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) {
    const announcementThread = await prisma.thread.upsert({
      where: { id: "seed-thread-announcement-1" },
      update: {},
      create: {
        id: "seed-thread-announcement-1",
        category: "ANNOUNCEMENTS",
        title: "Welcome to Steamer — Offline Gaming Built on Trust",
        authorId: admin.id,
        isPinned: true,
        posts: {
          create: {
            authorId: admin.id,
            content: "Welcome to Steamer! Please review our Renter Guidelines and always switch Steam to Offline Mode before launching your games. Enjoy gaming!",
          },
        },
      },
    });

    await prisma.thread.upsert({
      where: { id: "seed-thread-setup-help-1" },
      update: {},
      create: {
        id: "seed-thread-setup-help-1",
        category: "SETUP_HELP",
        title: "How to properly set Steam to Offline Mode on Windows",
        authorId: admin.id,
        isPinned: true,
        posts: {
          create: {
            authorId: admin.id,
            content: "Step 1: Finish downloading your games during your setup window.\\nStep 2: Click 'Steam' in the top left menu.\\nStep 3: Click 'Go Offline...'.\\nStep 4: Click 'Restart in Offline Mode'. Now you are safe to play anytime!",
          },
        },
      },
    });

    console.log("✓ Pinned community threads created");
  }

  console.log("--- Steamer Database Seed Completed Successfully ---");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
