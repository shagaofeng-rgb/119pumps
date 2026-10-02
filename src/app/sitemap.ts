import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://119pumps.com" : "http://localhost:3000")).replace(/\/$/, "");
  return getAllPages().filter((page) => page.type !== "placeholder" && !page.html.includes("identity-content-pending")).map((page) => ({ url: base + page.path, changeFrequency: page.type === "home" ? "weekly" : "monthly", priority: page.type === "home" ? 1 : 0.6 }));
}
