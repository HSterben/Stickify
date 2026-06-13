import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: ["/dashboard/", "/api/", "/auth/", "/b/"],
      },
    ],
    host: origin,
    sitemap: `${origin}/sitemap.xml`,
  };
}
