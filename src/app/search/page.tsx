import type { Metadata } from "next";
import { InteriorShell } from "@/components/interior/Shell";
import { Action, Heading, Icon, LocalLink, Notice, Row, Section } from "@/components/interior/ui";
import { findInteriorPages, interiorPage, type InteriorPage } from "@/lib/interior";

const page: InteriorPage = { p: "/search", t: "search", name: "Site search" };
export const metadata: Metadata = { title: "Site search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; scope?: string | string[] }> }) {
  const { q, scope } = await searchParams;
  const query = (typeof q === "string" ? q : q?.[0] ?? "").trim().slice(0, 150);
  const requested = typeof scope === "string" ? interiorPage(scope) : undefined;
  const category = requested && ["product-list", "faq-list", "news-list"].includes(requested.t) ? requested : undefined;
  const results = findInteriorPages(query, category?.p);
  return <InteriorShell page={page}>
    <Heading page={page} kicker="Find a resource" summary="Search products, applications, technical answers and articles." />
    <Section>
      <form className="inline-search" action="/search" method="get">
        <Icon name="search" />
        {category && <input type="hidden" name="scope" value={category.p} />}
        <input type="search" name="q" aria-label="Search the site" placeholder="Try diesel, jockey pump or commissioning" defaultValue={query} maxLength={150} />
        <button className="btn primary" type="submit">Search</button>
      </form>
      {category && <p className="fine section-note">Searching {category.name} · <LocalLink className="text-link" href="/search">Search the whole site</LocalLink></p>}
      {query ? <>
        <p className="section-note">{results.length} result{results.length === 1 ? "" : "s"} for “{query}”.{results.length > 100 && " Showing the first 100."}</p>
        {results.length ? <div className="rows">{results.slice(0, 100).map((result) => <Row key={result.p} page={result} />)}</div>
          : <Notice>No matching results. Try a broader term.</Notice>}
      </> : <div className="actions"><Action href="/products">Product catalog</Action><Action href="/application">Applications</Action><Action href="/faq">Technical FAQ</Action></div>}
    </Section>
  </InteriorShell>;
}
