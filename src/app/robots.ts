import type { MetadataRoute } from "next";
import { canonicalSiteOrigin } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === "production";
  const base = isProduction ? canonicalSiteOrigin : "http://localhost:3000";
  return { rules: [{ userAgent: "*", ...(isProduction ? { allow: "/" } : { disallow: "/" }) }], sitemap: `${base}/sitemap.xml` };
}
