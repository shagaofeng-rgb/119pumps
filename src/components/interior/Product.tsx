import { contactPath, pagesOfType, productCategory, references, type InteriorPage } from "@/lib/interior";
import { Action, Banner, Card, Icon, Notice, SectionHeading } from "./ui";
import { ProductMedia } from "./ProductMedia";
import { ProductTabs } from "./ProductTabs";

function specIcon(name: string) {
  if (/flow/i.test(name)) return "droplet";
  if (/power|volt/i.test(name)) return "zap";
  if (/speed|head|pressure/i.test(name)) return "gauge";
  if (/size|caliber/i.test(name)) return "settings";
  return "circle-dot";
}

export function Product({ page }: { page: InteriorPage }) {
  const category = productCategory(page);
  const sections = page.sections ?? [];
  const technical = sections.findIndex(([name]) => /technical|specific|param|data/i.test(name));
  const related = references(page.related).filter((p) => p.t === "product" && p.p !== page.p && !p.pending && !p.hidden);
  const fallback = pagesOfType("product").filter((p) => p.p !== page.p && !p.pending && !p.hidden && productCategory(p)?.p === category?.p);
  const items = (related.length ? related : fallback).slice(0, 3);
  const noun = page.p.includes("/spare-parts-") ? "Part details" : page.p.startsWith("/fire-pump-system/") ? "Package configuration"
    : page.p.includes("/mobile-pump-") ? "Mobile unit configuration" : "Performance summary";
  const inquiry = `${contactPath}?product=${encodeURIComponent(page.name)}`;

  return <div className="wrap">
    <section className="product">
      <div className="product-heading"><p className="kicker">{category?.name ?? "Industrial pumps"}</p><h1>{page.name}</h1></div>
      <div className="product-gallery"><ProductMedia key={page.p} name={page.name} photos={page.photos ?? []} /></div>
      <div className="product-summary"><p className="lede">{noun}</p>
        {page.specs?.length ? <dl className="specs">{page.specs.map(([key, value], i) => <div className="spec" key={i}>
          <dt className="row"><Icon name={specIcon(key)} />{key}</dt><dd>{value}</dd>
        </div>)}</dl> : <Notice>Model specifications are pending.</Notice>}
        <div className="actions">
          <Action href={inquiry} primary>Request a quote</Action>
          {technical >= 0 ? <a href="#product-data" className="btn"><Icon name="clipboard-list" />Technical data</a>
            : category && <Action href={category.p} icon="arrow-left">Browse category</Action>}
        </div>
        <p className="fine spec-source">Values are from archived product information. Confirm the current model datasheet before selection.</p>
      </div>
    </section>
    {sections.length ? <ProductTabs key={page.p} labels={sections.map(([label]) => label)} technical={technical}
      panels={sections.map(([, html], i) => <div key={i} dangerouslySetInnerHTML={{ __html: html }} />)} />
      : <Notice>Detailed drawings and technical documents will appear here when available.</Notice>}
    {items.length > 0 && <section className="related">
      <SectionHeading action={category && <Action href={category.p}>View category</Action>}>Related equipment</SectionHeading>
      <div className="grid">{items.map((p) => <Card key={p.p} page={p} />)}</div>
    </section>}
    <section className="related"><Banner title="Need help specifying this pump?">Have your required flow, pressure and application ready for selection.</Banner></section>
  </div>;
}
