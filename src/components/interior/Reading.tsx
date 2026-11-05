import { pagesOfType, parentPage, references, types, type InteriorPage } from "@/lib/interior";
import { Action, Banner, Card, Heading, Icon, LocalLink, Notice, Section, SectionHeading } from "./ui";
import { ProductMedia } from "./ProductMedia";

export function Reading({ page }: { page: InteriorPage }) {
  const isCase = page.t === "case";
  const isFaq = page.t === "faq";
  const parent = parentPage(page);
  const related = references(page.related).filter((p) => !p.pending && p.p !== page.p && !p.base);
  const fallback = parent ? pagesOfType(page.t).filter((p) => !p.pending && !p.base && p.p !== page.p && p.p.startsWith(parent.p + "/")) : [];
  const readMore = references([...related, ...fallback].map((p) => p.p)).slice(0, 4);
  return <div className="wrap reader">
    <article className="story">
      <p className="kicker">{types[page.t]?.[0]}</p><h1>{page.name}</h1>
      {page.date && <div className="meta"><Icon name="calendar" /><time dateTime={page.date}>{page.date}</time></div>}
      {page.body ? <div className="rich" dangerouslySetInnerHTML={{ __html: page.body }} /> : <Notice>Source text is not available.</Notice>}
      {isCase && <Banner title="Planning a similar project?">Share the site conditions and required performance once inquiry delivery is available.</Banner>}
      {isFaq && <div className="actions"><Action href="/products">Browse equipment</Action></div>}
    </article>
    <aside className="side-note">
      <h2>{isCase ? "Project navigation" : "Continue reading"}</h2>
      <p className="fine">{isFaq ? "Technical knowledge base" : isCase ? "Application examples" : "Industry resources"}</p>
      {readMore.map((p) => <LocalLink key={p.p} href={p.p}>{p.name}</LocalLink>)}
      {parent && <LocalLink className="text-link" href={parent.p}>Back to {parent.name}</LocalLink>}
    </aside>
  </div>;
}

export function Gallery({ page }: { page: InteriorPage }) {
  const overview = page.p === "/gellary";
  return <>
    <Heading page={page} kicker="Equipment media" summary="Browse the equipment image archive." />
    <Section>
      {overview ? <><SectionHeading>Browse equipment galleries</SectionHeading>
        <div className="grid">{pagesOfType("gallery").filter((p) => p.p !== page.p).map((p) => <Card key={p.p} page={p} action="Open gallery" />)}</div></>
        : <><ProductMedia key={page.p} name={page.name} photos={page.photos ?? []} detailGallery /><div className="actions"><Action href="/gellary" icon="arrow-left">All galleries</Action></div></>}
    </Section>
  </>;
}
