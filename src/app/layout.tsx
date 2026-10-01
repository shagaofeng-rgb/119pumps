import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./legacy.css";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Industrial Pump Solutions", template: "%s | Industrial Pump Solutions" }, description: "Industrial pump products, systems, applications and technical resources." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></body></html>;
}
