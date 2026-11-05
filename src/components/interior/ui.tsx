import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { productCategory, types, type InteriorPage } from "@/lib/interior";

export function LocalLink(props: ComponentProps<typeof Link>) {
  return <Link prefetch={false} {...props} />;
}

export function Icon({ name, size = 19 }: { name: string; size?: number }) {
  return <Image className="icon" src={`/interior/icons/${name}.svg`} width={size} height={size} unoptimized alt="" aria-hidden="true" />;
}

export function Photo({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return <Image src={src} alt={alt} width={800} height={560} unoptimized loading={eager ? "eager" : "lazy"} />;
}

export function Action({ href, children, primary = false, icon = "arrow-right" }: { href: string; children: ReactNode; primary?: boolean; icon?: string }) {
  return <LocalLink href={href} className={`btn${primary ? " primary" : ""}`}>{children}<Icon name={icon} /></LocalLink>;
}

export function Heading({ page, kicker, summary, dark = false, illustrated = false }: {
  page: InteriorPage; kicker: string; summary?: string; dark?: boolean; illustrated?: boolean;
}) {
  return <section className={`hero${dark ? " dark" : ""}${illustrated ? " has-photo" : ""}`}>
    <div className="wrap"><p className="kicker">{kicker}</p><h1>{page.name}</h1>
      {summary && <p>{summary}</p>}
      {illustrated && <small className="illustration-credit">Banner image: illustrative pump room.</small>}
    </div>
  </section>;
}

export function Section({ children }: { children: ReactNode }) {
  return <div className="wrap body-space">{children}</div>;
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="section-cap"><h2>{children}</h2>{action}</div>;
}

export function Chips({ pages, active }: { pages: InteriorPage[]; active: string }) {
  return <nav className="chips" aria-label="Related sections">
    {pages.map((p) => <LocalLink key={p.p} className="pill" aria-current={p.p === active ? "page" : undefined} href={p.p}>{p.name}</LocalLink>)}
  </nav>;
}

export function Card({ page, action = "View details", photo, editorial = false, eager = false }: {
  page: InteriorPage; action?: string; photo?: string; editorial?: boolean; eager?: boolean;
}) {
  const [type, icon] = types[page.t] ?? ["Information", "files"];
  const src = photo ?? page.photos?.[0];
  return <LocalLink href={page.p} className={`card${editorial ? " editorial" : ""}`}>
    <div className="card-image">{src ? <Photo src={src} alt="" eager={eager} /> : <Icon name={icon} />}</div>
    <div className="card-text">
      <small>{page.t === "product" ? productCategory(page)?.name ?? type : type}</small>
      <h3>{page.name}</h3>
      {page.t === "product" && page.specs?.[0] && <p className="fine">{page.specs[0].join(": ")}</p>}
      <span className="text-link">{action}<Icon name="arrow-right" /></span>
    </div>
  </LocalLink>;
}

export function Row({ page }: { page: InteriorPage }) {
  const [name, icon] = types[page.t] ?? ["Information", "files"];
  return <LocalLink href={page.p} className="list-row"><Icon name={icon} /><span><strong>{page.name}</strong>
    <small>{[page.date, page.pending ? "Content pending" : name].filter(Boolean).join(" · ")}</small></span><Icon name="chevron-right" /></LocalLink>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="notice">{children}</p>;
}

export function Slot({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return <div className="slot"><Icon name={icon} /><h3>{title}</h3><p>{children}</p></div>;
}

export function Banner({ title, children }: { title: string; children: ReactNode }) {
  return <div className="banner"><div><h2>{title}</h2><p>{children}</p></div><Action href="/contact.html" primary>Request a quote</Action></div>;
}
