import type { MetadataRoute } from "next";
import { canonicalSiteOrigin } from "@/config/site";
import { getAllPages } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const seen = new Set<string>();

  return getAllPages().flatMap((page) => {
    if (page.type === "placeholder" || page.html.includes("identity-content-pending")) return [];

    const path = page.path.startsWith("/") ? page.path : `/${page.path}`;
    const canonicalPath = path === "/" ? "/" : path.replace(/\/+$/, "");
    if (seen.has(canonicalPath)) return [];
    seen.add(canonicalPath);

    return [{
      url: new URL(canonicalPath, `${canonicalSiteOrigin}/`).toString(),
      changeFrequency: page.type === "home" ? "weekly" : "monthly",
      priority: page.type === "home" ? 1 : 0.6,
    }];
  });
}
