import type { ReactNode } from "react";
import { contactPath, menuCategories, parentPage, references, type InteriorPage } from "@/lib/interior";
import { Action, Icon, LocalLink, Photo } from "./ui";

const navigation = [
  ["Applications", "/application"], ["Resources", "/faq"], ["News", "/industry-news"],
  ["About", "/company-profile.html"], ["Support", "/service.html"],
] as const;

const categories = references(menuCategories);

export function InteriorShell({ page, children }: { page: InteriorPage; children: ReactNode }) {
  const parent = parentPage(page);
  return <div className="interior" data-interior={page.t}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-head">
      <LocalLink className="wordmark" href="/" aria-label="119pumps home"><Icon name="cog" size={25} /><span>119PUMPS<small>INDUSTRIAL PUMPS</small></span></LocalLink>
      <nav className="nav" aria-label="Main navigation">
        <details className="nav-menu">
          <summary>Products <Icon name="chevron-down" /></summary>
          <div className="menu-panel">
            <LocalLink href="/products"><strong>View all products</strong></LocalLink>
            {categories.map((category) => {
              const photo = Object.values(category.thumbs ?? {})[0];
              return <LocalLink key={category.p} href={category.p}>{photo ? <Photo src={photo} alt="" /> : <Icon name="boxes" />}{category.name}</LocalLink>;
            })}
          </div>
        </details>
        {navigation.map(([label, href]) => <LocalLink key={href} href={href} aria-current={href === page.p ? "page" : undefined}>{label}</LocalLink>)}
        <LocalLink href="/search" aria-label="Search"><Icon name="search" /></LocalLink>
      </nav>
      <details className="nav-mobile">
        <summary aria-label="Open navigation"><Icon name="menu" size={24} /></summary>
        <nav className="nav-mobile-links" aria-label="Mobile navigation">
          <LocalLink href="/products">Products</LocalLink>
          {navigation.map(([label, href]) => <LocalLink key={href} href={href}>{label}</LocalLink>)}
          <LocalLink href="/search">Search</LocalLink>
          <LocalLink href={contactPath}>Contact</LocalLink>
        </nav>
      </details>
      <div className="head-rfq"><Action href={contactPath} primary>Request a quote</Action></div>
    </header>
    <main id="main-content">
      <nav className="wrap crumb" aria-label="Breadcrumb"><LocalLink href="/">Home</LocalLink><Icon name="chevron-right" />
        {parent && parent.p !== page.p && <><LocalLink href={parent.p}>{parent.name}</LocalLink><Icon name="chevron-right" /></>}
        <span aria-current="page">{page.name}</span>
      </nav>
      {children}
    </main>
    <footer className="site-foot"><div className="wrap">
      <span>119pumps · Industrial pumps</span>
      <nav aria-label="Footer"><LocalLink href="/site-index.html">Site index</LocalLink><LocalLink href="/product-index.html">Product index</LocalLink><LocalLink href={contactPath}>Contact</LocalLink></nav>
    </div></footer>
  </div>;
}
