/** Canonical production origin for SEO (sitemap, robots, Open Graph fallbacks). */
export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const normalized = raw.replace(/\/+$/, "");
  return new URL(normalized.startsWith("http") ? normalized : `https://${normalized}`);
}

export function getSiteOrigin(): string {
  return getSiteUrl().origin;
}
