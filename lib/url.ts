/**
 * Resolves the application base URL dynamically across environments:
 * 1. Checks window.location.origin (if running in client browser)
 * 2. Checks process.env.NEXT_PUBLIC_APP_URL (user explicit override)
 * 3. Checks process.env.VERCEL_PROJECT_PRODUCTION_URL (Vercel production e.g. your-app.vercel.app)
 * 4. Checks process.env.VERCEL_URL (Vercel preview deployment URL)
 * 5. Falls back to http://localhost:3000 for local development
 */
export function getAppUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url.replace(/\/$/, "");
    }
    return `https://${url}`.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

