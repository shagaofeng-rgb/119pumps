import type { Metadata } from "next";
import { PageBody } from "@/components/PageBody";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPage } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  const page = getPage("/");
  return <><SiteHeader /><main id="main-content">{page && <PageBody page={page} />}</main><SiteFooter /></>;
}
