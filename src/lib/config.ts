export type AppMode = "demo" | "production";

function env(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

export const config = {
  appMode: (env("GM_APP_MODE") as AppMode) || "demo",
  isDemoMode: () => {
    if (env("GM_APP_MODE") === "production") return false;
    if (env("NEXT_PUBLIC_DEMO_MODE") === "false") return false;
    return env("GM_APP_MODE") !== "production";
  },
  auth: {
    secret: env("AUTH_SECRET") || env("NEXTAUTH_SECRET"),
    url:
      env("NEXTAUTH_URL") ||
      env("AUTH_URL") ||
      env("NEXT_PUBLIC_APP_URL") ||
      "http://localhost:3000",
  },
  appUrl: env("NEXT_PUBLIC_APP_URL") || env("NEXTAUTH_URL") || "http://localhost:3000",
  openai: {
    apiKey: env("OPENAI_API_KEY"),
    model: env("OPENAI_MODEL") || "gpt-4o-mini",
    enabled: () => Boolean(env("OPENAI_API_KEY")),
  },
  stripe: {
    secretKey: env("STRIPE_SECRET_KEY"),
    webhookSecret: env("STRIPE_WEBHOOK_SECRET"),
    publishableKey: env("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    enabled: () => Boolean(env("STRIPE_SECRET_KEY")),
  },
  database: {
    url: env("DATABASE_URL") || "file:./dev.db",
  },
  upload: {
    dir: env("UPLOAD_DIR") || "./uploads",
  },
  semanticScholar: {
    apiKey: env("SEMANTIC_SCHOLAR_API_KEY"),
  },
} as const;

export function getRuntimeMode(): "demo" | "live" {
  if (config.appMode === "production" && config.openai.enabled()) return "live";
  if (config.appMode === "demo" && config.openai.enabled()) return "live";
  if (config.openai.enabled()) return "live";
  return "demo";
}
