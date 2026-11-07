import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating SystemSetting table...");

  const settingsToUpdate = [
    { key: "max_active_renters", value: "99999", description: "Unlimited customer access (no caps)" },
    { key: "max_new_renters_per_month", value: "99999", description: "Unlimited monthly intake" },
    { key: "max_setup_windows_per_day", value: "99999", description: "Unlimited access windows" },
    { key: "setup_window_max_minutes", value: "99999", description: "Lifetime access duration" },
    { key: "onboarding_paused", value: "false", description: "Storefront active" },
  ];

  for (const s of settingsToUpdate) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description, updatedAt: new Date() },
      create: { key: s.key, value: s.value, description: s.description },
    });
  }

  console.log("Updating LegalDocumentVersion table...");
  const disclosureMarkdown = `### Essential Pre-Purchase Disclosures (v1.0)
- **One-Time ₹300 Payment:** You pay once for lifetime access. There are no recurring subscriptions.
- **Offline & Local Play:** All games run in offline single-player mode with local saves stored on your PC.
- **No Account Sharing:** Setup is configured for your personal system so you won't get interrupted by other users.
- **245+ Titles Supported:** The guide includes configuration steps for every title listed in the catalog.
- **Fast 10-Minute Setup:** Easy click-by-click instructions designed for beginners and experienced PC gamers alike.

### The Steamer Fair-Play Commitment
"Steamer provides honest, high-value setup knowledge for PC gamers. We respect your time, provide clean local configurations without account kick-offs, and stand behind our guide with dedicated WhatsApp support."`;

  const guidelinesMarkdown = `### Offline Setup & Gaming Guidelines (v1.0)
1. **Offline & Single-Player:** All games are configured for offline play with permanent local save files on your PC.
2. **Follow the Visual Walkthrough:** Follow the step-by-step Setup Guide provided in your dashboard.
3. **Local Save Files:** Save files are stored directly on your personal computer; keep local backups of your game progress.
4. **Independent Personal PC Use:** Access is for your own system; do not redistribute guide materials or files.
5. **Direct Support:** Contact our team via WhatsApp (+91 99369 29997) for any 1-on-1 configuration or troubleshooting questions.`;

  await prisma.legalDocumentVersion.upsert({
    where: { slug_version: { slug: "disclosure", version: "1.0" } },
    update: {
      title: "Read Before You Buy Disclosure & Trust Pledge",
      contentMarkdown: disclosureMarkdown,
    },
    create: {
      slug: "disclosure",
      version: "1.0",
      title: "Read Before You Buy Disclosure & Trust Pledge",
      contentMarkdown: disclosureMarkdown,
      effectiveDate: "2026-11-06",
    },
  });

  await prisma.legalDocumentVersion.upsert({
    where: { slug_version: { slug: "guidelines", version: "1.0" } },
    update: {
      title: "Offline Setup & Gaming Guidelines",
      contentMarkdown: guidelinesMarkdown,
    },
    create: {
      slug: "guidelines",
      version: "1.0",
      title: "Offline Setup & Gaming Guidelines",
      contentMarkdown: guidelinesMarkdown,
      effectiveDate: "2026-11-06",
    },
  });

  console.log("✓ Database updated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Synchronize to prisma_seed/steamer.db
    const sourceDb = path.join(process.cwd(), "prisma", "steamer.db");
    const destDb = path.join(process.cwd(), "prisma_seed", "steamer.db");
    if (fs.existsSync(sourceDb)) {
      fs.copyFileSync(sourceDb, destDb);
      console.log("✓ Synchronized prisma/steamer.db to prisma_seed/steamer.db");
    }
  });
