import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteriorShell } from "@/components/interior/Shell";
import { InteriorContent } from "@/components/interior/Content";
import { canonicalSiteOrigin } from "@/config/site";
import { canonicalPagePath } from "@/lib/links";
import { getAllPages, getPage } from "@/lib/site";
import { interiorPage, listingEntries, productCategory } from "@/lib/interior";

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
  const view = interiorPage(page.path);
  const pending = view?.pending || page.type === "placeholder" || page.html.includes("identity-content-pending");
  const canonicalPath = canonicalPagePath(page.path);
  const isResourceHub = ["/service.html", "/shopping-guide.html", "/company-profile.html"].includes(canonicalPath);
  let title = page.title || "Page";
  let description = page.description || undefined;
  if (view?.t === "product") {
    title = view.name;
    const category = productCategory(view)?.name;
    const materials = view.sections?.length ? "View product images, specifications and technical information." : "View the product images and available specifications.";
    description = `${view.name}${category && !view.name.toLowerCase().includes(category.toLowerCase()) ? ` in ${category}` : ""}. ${materials}`;
  } else if (view && ["product-list", "faq-list", "news-list", "index", "gallery"].includes(view.t)) {
    title = view.name;
    const firstItems = listingEntries(view).slice(0, 2).map((entry) => entry.name).join("; ");
    if (firstItems) description = `${view.name}. Includes ${firstItems}.`.slice(0, 180);
  }
  return {
    title,
    description: pending ? "Information and related resources." : description,
    alternates: { canonical: new URL(canonicalPath, `${canonicalSiteOrigin}/`).toString() },
    ...(pending ? { robots: { index: false, follow: isResourceHub } } : {}),
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
