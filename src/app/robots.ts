import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://119pumps.com" : undefined);
  const base = (configured || "http://localhost:3000").replace(/\/$/, "");
  return { rules: [{ userAgent: "*", ...(configured && !configured.includes("localhost") ? { allow: "/" } : { disallow: "/" }) }], sitemap: `${base}/sitemap.xml` };
}
