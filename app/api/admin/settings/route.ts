import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const CACHE_FILE = path.join("/tmp", "admin_settings_cache.json");

function readCachedSettings(): Record<string, string> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function writeCachedSettings(settings: Record<string, string>) {
  try {
    const existing = readCachedSettings();
    const merged = { ...existing, ...settings };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.systemSetting.findMany();
    const dbMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const cachedMap = readCachedSettings();

    // Merge cached and DB settings (DB takes precedence if present, cached covers cold restarts)
    const settingsMap = { ...cachedMap, ...dbMap };

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Admin settings get error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { settings = {}, action } = body;

    // Trigger Account-Lost Playbook (Section 9)
    if (action === "TRIGGER_ACCOUNT_LOST_PLAYBOOK") {
      // 1. Immediately pause onboarding
      await prisma.systemSetting.upsert({
        where: { key: "onboarding_paused" },
        update: { value: "true", updatedAt: new Date() },
        create: { key: "onboarding_paused", value: "true", description: "Account-lost emergency pause" },
      });
      writeCachedSettings({ onboarding_paused: "true" });

      // 2. Fetch all active subscribers
      const activeSubs = await prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: {
          user: { select: { email: true, whatsappNumber: true, profile: { select: { displayName: true } } } },
          planGames: { include: { game: { select: { title: true } } } },
        },
      });

      // 3. Create Admin Broadcast Tasks
      const broadcastList = activeSubs.map((sub) => {
        const cleanPhone = (sub.user.whatsappNumber || "").replace(/\D/g, "");
        const text = `Hello ${sub.user.profile?.displayName || "Gamer"}, this is Steamer Management. We have temporarily lost access to the shared vault account and are working to restore it. Your active plan days are protected under our refund and credit policy. We will update you within 7 days.`;
        return {
          email: sub.user.email,
          whatsapp: sub.user.whatsappNumber,
          waLink: cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : null,
          games: sub.planGames.map((pg) => pg.game.title).join(", "),
        };
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "TRIGGER_ACCOUNT_LOST_PLAYBOOK",
          targetType: "SETTINGS",
          metadataJson: JSON.stringify({ activeSubscribersAffected: activeSubs.length }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Account-Lost Playbook triggered! Onboarding paused. Broadcast task list prepared.",
        broadcastList,
      });
    }

    // Standard settings update: write to local cache and DB
    writeCachedSettings(settings);

    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "string") {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value, updatedAt: new Date() },
          create: { key, value, description: "Admin configured setting" },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "UPDATE_SYSTEM_SETTINGS",
        targetType: "SETTINGS",
        metadataJson: JSON.stringify(settings),
      },
    });

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

