import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteriorShell } from "@/components/interior/Shell";
import { InteriorContent } from "@/components/interior/Content";
import { canonicalSiteOrigin } from "@/config/site";
import { canonicalPagePath } from "@/lib/links";
import { getAllPages, getPage } from "@/lib/site";
import { interiorPage } from "@/lib/interior";

type Props = { params: Promise<{ slug: string[] }> };

// The archive supplies every valid slug; unlisted URLs use the site's 404.
export const dynamicParams = false;

export function generateStaticParams() {
  const seen = new Set<string>();
  return getAllPages().filter((page) => page.path !== "/" && !["/search", "/panorama"].includes(page.path)).map((page) => ({ slug: page.path.split("/").filter(Boolean) })).filter(({ slug }) => {
    const key = slug.join("/");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage("/" + slug.join("/"));
  if (!page) return {};
  const pending = page.type === "placeholder" || page.html.includes("identity-content-pending");
  const canonicalPath = canonicalPagePath(page.path);
  return {
    title: page.title || "Page",
    description: pending ? "New brand information pending." : page.description || undefined,
    alternates: { canonical: new URL(canonicalPath, `${canonicalSiteOrigin}/`).toString() },
    ...(pending ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = getPage("/" + slug.join("/"));
  if (!page) notFound();
  const view = interiorPage(page.path);
  if (!view) notFound();
  return <InteriorShell page={view}><InteriorContent page={view} /></InteriorShell>;
}
