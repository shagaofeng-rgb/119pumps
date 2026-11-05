import type { Metadata } from "next";
import { canonicalSiteOrigin } from "@/config/site";
import "./legacy.css";
import "./globals.css";
import "./interior.css";

export const metadata: Metadata = { metadataBase: new URL(canonicalSiteOrigin), title: { default: "Industrial Pump Solutions", template: "%s | Industrial Pump Solutions" }, description: "Industrial pump products, systems, applications and technical resources." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
