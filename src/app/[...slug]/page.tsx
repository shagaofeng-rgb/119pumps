import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBody } from "@/components/PageBody";
import { getAllPages, getPage } from "@/lib/site";

type Props = { params: Promise<{ slug: string[] }> };

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
  return { title: page.title || "Page", description: pending ? "New brand information pending." : page.description || undefined, ...(pending ? { robots: { index: false, follow: false } } : {}) };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = getPage("/" + slug.join("/"));
  if (!page) notFound();
  return <PageBody page={page} />;
}
