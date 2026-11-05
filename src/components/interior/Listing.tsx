import {
  applicationCategories, archivedPages, listingEntries, listScope, newsPaths, pagesOfType, productCategories, references, type InteriorPage,
} from "@/lib/interior";
import { Banner, Card, Chips, Heading, Icon, LocalLink, Row, Section, SectionHeading } from "./ui";
import { ListFilter } from "./ListFilter";

function Pagination({ page }: { page: InteriorPage }) {
  const ordered = archivedPages(page);
  if (!ordered.length) return null;
  const n = page.page ?? 1;
  const current = ordered.findIndex((item) => item.p === page.p);
  const nearby = ordered.filter((item, i) => i === 0 || i === ordered.length - 1 || Math.abs((item.page ?? 1) - n) <= 2);
  const prev = ordered[current - 1];
  const next = ordered[current + 1];
  return <nav className="pagination" aria-label="Pagination">
    {prev && <a className="btn" rel="prev" href={prev.p}>Previous</a>}
    {nearby.map((item) => <a className="btn" key={item.p} href={item.p} aria-current={item.p === page.p ? "page" : undefined}
      aria-label={`Page ${item.page ?? 1}`}>{item.page ?? 1}</a>)}
    {next && <a className="btn" rel="next" href={next.p}>Next</a>}
    <span className="fine">Page {n} / {ordered.length}</span>
  </nav>;
}

function FilteredEntries({ page, items, grid, count, placeholder, news = false, scope }: {
  page: InteriorPage; items: InteriorPage[]; grid: boolean; count: string; placeholder: string; news?: boolean; scope?: string;
}) {
  return <ListFilter key={page.p} scope={scope ?? page.base ?? page.p} grid={grid} initialCount={count} placeholder={placeholder}
    labels={items.map((p) => [p.name, p.p, ...p.specs?.flat() ?? []].join(" ").toLowerCase())}
    items={items.map((p, i) => grid ? <Card key={p.p} page={p} action={news ? "Read article" : "View specifications"} editorial={news} photo={page.thumbs?.[p.p]} eager={i < 3} />
      : <Row key={p.p} page={p} />)} />;
}

export function Catalog({ page }: { page: InteriorPage }) {
  const base = page.base ?? page.p;
  const allProducts = base === "/products";
  return <>
    <Heading page={page} kicker="Equipment catalog" dark summary={allProducts ? "Browse fire protection, water supply and industrial pumping equipment." : "Browse available equipment and compare published specifications."} />
    <Section><div className="catalog">
      <nav className="filters" aria-label="Equipment categories"><h2>Equipment categories</h2>
        {[...productCategories].sort((a, b) => Number(b.p === "/products") - Number(a.p === "/products")).map((p) => <LocalLink key={p.p} href={p.p} aria-current={p.p === base ? "page" : undefined}>{p.name}<Icon name="chevron-right" /></LocalLink>)}
      </nav>
      <div>
        {allProducts && !page.page && <Chips pages={references(["/fire-pump-system", "/products/diesel-fire-pump", "/products/electric-fire-pump", "/products/mobile-pump-unit", "/products/water-pump"])} active={base} />}
        <FilteredEntries page={page} items={listingEntries(page)} grid count={`${listScope(page).length} products in catalog`} placeholder="Filter by model or name" />
        <Pagination page={page} />
      </div>
    </div></Section>
  </>;
}

export function ResourceListing({ page }: { page: InteriorPage }) {
  const faq = page.t === "faq-list";
  return <>
    <Heading page={page} kicker={faq ? "Knowledge base" : "News and resources"} dark={!faq}
      summary={faq ? "Answers about selection, installation, testing and maintenance." : "Updates and practical reading on pumps and fire protection."} />
    <Section>
      {!faq && <Chips pages={references(newsPaths)} active={page.base ?? page.p} />}
      <FilteredEntries page={page} items={listingEntries(page)} grid={!faq} news={!faq} count={faq ? "Browse technical questions" : "Browse articles"} placeholder="Filter by topic" />
      <Pagination page={page} />
    </Section>
  </>;
}

export function ApplicationListing({ page }: { page: InteriorPage }) {
  const overview = page.p === "/application";
  const cases = references([...page.links ?? [], ...pagesOfType("case").filter((p) => p.p.startsWith(page.p + "/")).map((p) => p.p)]).filter((p) => p.t === "case" && !p.pending);
  return <>
    <Heading page={page} kicker="Application engineering" summary="Browse equipment applications and documented projects." dark illustrated={overview} />
    <Section>
      <Chips pages={applicationCategories} active={page.p} />
      {overview && <section className="application-group">
        <SectionHeading>Browse by application</SectionHeading>
        <div className="grid">{applicationCategories.filter((p) => p.p !== page.p).map((p) => <Card key={p.p} page={p} action="Explore application" editorial eager photo={Object.values(p.thumbs ?? {})[0]} />)}</div>
      </section>}
      <SectionHeading>{overview ? "Project examples" : "Project cases"}</SectionHeading>
      <div className="grid">{cases.map((p) => <Card key={p.p} page={p} action="Read case" editorial photo={page.thumbs?.[p.p]} />)}</div>
      <Banner title="Discuss your application">Tell us what you need the pumping system to do.</Banner>
    </Section>
  </>;
}

export function Directory({ page }: { page: InteriorPage }) {
  const products = page.p === "/product-index.html";
  const links = page.links ?? [];
  const entries = products
    ? references([...links, ...pagesOfType("product").map((p) => p.p)]).filter((p) => p.t === "product" && !p.pending && !p.hidden)
    : references([...links, ...productCategories.map((p) => p.p), ...applicationCategories.map((p) => p.p), "/faq", "/industry-news", "/service.html", "/gellary", "/product-index.html"]).filter((p) => p.p !== page.p && !p.base);
  return <>
    <Heading page={page} kicker="Directory" summary={products ? "Browse the complete equipment index." : "Find products, applications and resources by section."} />
    <Section><FilteredEntries page={page} items={entries} grid={false} count={products ? "Products" : "Site sections"} placeholder="Filter this index" scope={products ? "/products" : undefined} /></Section>
  </>;
}
