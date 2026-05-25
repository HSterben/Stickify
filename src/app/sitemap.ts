import type { MetadataRoute } from "next";
import { getSiteOrigin, getSiteUrl } from "@/lib/site";

/** Public marketing routes only — dashboard content is auth-gated and private. */
const publicRoutes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/login", changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const origin = getSiteOrigin();
  const lastModified = new Date();
  const previewImage = new URL("/web-preview.jpg", site).toString();

  return publicRoutes.map(({ path, changeFrequency, priority }) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: new URL(path, origin).toString(),
      lastModified,
      changeFrequency,
      priority,
    };

    if (path === "/") {
      entry.images = [previewImage];
    }

    return entry;
  });
}
