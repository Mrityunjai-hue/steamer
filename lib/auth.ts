import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { syncCloudToDatabase } from "./cloud-sync";

type NextRequest = any;

const JWT_SECRET = process.env.JWT_SECRET || "steamer-super-secret-jwt-token-signing-key-32chars";
const COOKIE_NAME = "steamer_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "RENTER" | "ADMIN" | "MODERATOR";
  twoFactorVerified?: boolean;
}

/**
 * Hash password securely
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT session token
 */
export function signToken(payload: SessionPayload, expiresIn = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

/**
 * Verify a signed JWT session token
 */
export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Get current session from Next.js cookies (server components / route handlers)
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    // Verify user in the database
    let user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user && payload.email) {
      user = await prisma.user.findUnique({
        where: { email: payload.email.toLowerCase().trim() },
        select: { id: true, email: true, role: true },
      });
    }

    // If missing from this container, sync from persistent cloud vault
    if (!user) {
      try {
        await syncCloudToDatabase();
        user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true },
        });
        if (!user && payload.email) {
          user = await prisma.user.findUnique({
            where: { email: payload.email.toLowerCase().trim() },
            select: { id: true, email: true, role: true },
          });
        }
      } catch (syncErr) {
        console.warn("Cloud sync non-fatal error in getSession:", syncErr);
      }
    }

    if (!user && payload.role === "ADMIN") {
      // Auto-bootstrap admin user record in this container if missing
      try {
        const passHash = await hashPassword(process.env.ADMIN_INITIAL_PASSWORD?.trim() || "SteamerAdmin#2026!Secure");
        user = await prisma.user.create({
          data: {
            id: payload.userId,
            email: (payload.email || "admin@steamer.live").toLowerCase().trim(),
            passwordHash: passHash,
            role: "ADMIN",
            isEmailVerified: true,
            isWhatsappVerified: true,
            profile: { create: { displayName: "Steamer Lead Administrator" } },
          },
          select: { id: true, email: true, role: true },
        });
      } catch {
        user = await prisma.user.findFirst({
          where: { role: "ADMIN" },
          select: { id: true, email: true, role: true },
        });
      }
    }

    if (!user) {
      if (payload.role === "ADMIN") {
        return payload;
      }
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: (user.role as any) || payload.role,
      twoFactorVerified: payload.twoFactorVerified,
    };
  } catch {
    return null;
  }
}

/**
 * Get current session from a NextRequest object
 */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Set session cookie
 */
export function getSessionCookieOptions(remember = true) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: remember ? 7 * 24 * 60 * 60 : undefined,
  };
}

/**
 * Load full user details for the active session
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      subscriptions: {
        where: { status: "ACTIVE" },
        include: {
          planGames: {
            include: { game: true },
          },
          device: true,
        },
      },
      devices: true,
      strikes: true,
    },
  });

  return user;
}
