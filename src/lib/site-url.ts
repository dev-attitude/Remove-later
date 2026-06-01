/** Canonical public site URL (no trailing slash). Used for sitemap, robots, and Open Graph. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://www.gmconsultations.com";
  return raw.replace(/\/$/, "");
}
