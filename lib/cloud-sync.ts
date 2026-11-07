import { prisma } from "./prisma";
import fs from "fs";
import path from "path";

const VAULT_ID = "ff808181a09d98f701a1b6088aab5c26";
const VAULT_URL = `https://api.restful-api.dev/objects/${VAULT_ID}`;
const LOCAL_CACHE_FILE = path.join("/tmp", "cloud_vault_backup.json");

interface CloudVaultData {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    role: string;
    whatsappNumber?: string | null;
    displayName?: string | null;
    createdAt?: string;
  }>;
  orders: Array<{
    id: string;
    orderId: string;
    userId: string;
    amount: number;
    status: string;
    guestEmail?: string | null;
    guestPhone?: string | null;
    subscriptionDraft?: string | null;
    createdAt?: string;
  }>;
  settings: Record<string, string>;
  lastUpdated: number;
}

function readLocalBackup(): CloudVaultData {
  try {
    if (fs.existsSync(LOCAL_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_CACHE_FILE, "utf-8"));
    }
  } catch {}
  return { users: [], orders: [], settings: {}, lastUpdated: 0 };
}

function writeLocalBackup(data: CloudVaultData) {
  try {
    fs.writeFileSync(LOCAL_CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

/**
 * Fetch the central persistent vault state
 */
export async function fetchCloudVault(): Promise<CloudVaultData> {
  try {
    const res = await fetch(VAULT_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data.users)) {
        writeLocalBackup(json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn("[CloudSync] Remote fetch failed, falling back to local cache:", err);
  }
  return readLocalBackup();
}

/**
 * Save updated vault state to remote store
 */
export async function saveCloudVault(data: CloudVaultData): Promise<boolean> {
  data.lastUpdated = Date.now();
  writeLocalBackup(data);

  try {
    const res = await fetch(VAULT_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "steamer_vault_sync",
        data,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[CloudSync] Remote save error:", err);
    return false;
  }
}

/**
 * Sync Cloud Vault with local SQLite container
 * Ensures every serverless container immediately has all registered users and orders
 */
export async function syncCloudToDatabase() {
  try {
    const vault = await fetchCloudVault();
    if (!vault.users || vault.users.length === 0) return;

    for (const u of vault.users) {
      try {
        const existing = await prisma.user.findFirst({
          where: { OR: [{ id: u.id }, { email: u.email.toLowerCase() }] },
        });

        if (!existing) {
          await prisma.user.create({
            data: {
              id: u.id,
              email: u.email.toLowerCase(),
              passwordHash: u.passwordHash,
              role: u.role || "RENTER",
              whatsappNumber: u.whatsappNumber || null,
              createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
              profile: {
                create: {
                  displayName: u.displayName || "Gamer",
                  avatarUrl: "/brand/icon.svg",
                },
              },
            },
          });
        }
      } catch {
        // Ignore single record sync conflicts
      }
    }

    // Sync settings
    if (vault.settings) {
      for (const [key, value] of Object.entries(vault.settings)) {
        try {
          await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value, description: "Cloud synced setting" },
          });
        } catch {}
      }
    }
  } catch (err) {
    console.error("[CloudSync] syncCloudToDatabase error:", err);
  }
}

/**
 * Record a newly registered user into the central cloud vault
 */
export async function registerUserInCloud(user: {
  id: string;
  email: string;
  passwordHash: string;
  role?: string;
  whatsappNumber?: string | null;
  displayName?: string | null;
}) {
  try {
    const vault = await fetchCloudVault();
    const existingIndex = vault.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    
    const entry = {
      id: user.id,
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      role: user.role || "RENTER",
      whatsappNumber: user.whatsappNumber || null,
      displayName: user.displayName || "Gamer",
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      vault.users[existingIndex] = { ...vault.users[existingIndex], ...entry };
    } else {
      vault.users.unshift(entry);
    }

    await saveCloudVault(vault);
  } catch (err) {
    console.error("[CloudSync] registerUserInCloud error:", err);
  }
}

/**
 * Record a newly created order into the central cloud vault
 */
export async function registerOrderInCloud(order: {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  subscriptionDraft?: string | null;
}) {
  try {
    const vault = await fetchCloudVault();
    const existingIndex = vault.orders.findIndex((o) => o.orderId === order.orderId);
    
    const entry = {
      ...order,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      vault.orders[existingIndex] = { ...vault.orders[existingIndex], ...entry };
    } else {
      vault.orders.unshift(entry);
    }

    await saveCloudVault(vault);
  } catch (err) {
    console.error("[CloudSync] registerOrderInCloud error:", err);
  }
}

