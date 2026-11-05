import type { InteriorPage } from "@/lib/interior";
import { Product } from "./Product";
import { ApplicationListing, Catalog, Directory, ResourceListing } from "./Listing";
import { Gallery, Reading } from "./Reading";
import { Contact, Pending } from "./Information";
import { Heading, Notice, Section } from "./ui";

export function InteriorContent({ page }: { page: InteriorPage }) {
  if (page.t === "contact") return <Contact page={page} />;
  if (page.pending || page.t === "placeholder") return <Pending page={page} />;
  switch (page.t) {
    case "product": return <Product page={page} />;
    case "product-list": return <Catalog page={page} />;
    case "case-list": return <ApplicationListing page={page} />;
    case "faq-list": case "news-list": return <ResourceListing page={page} />;
    case "case": case "faq": case "article": return <Reading page={page} />;
    case "gallery": return <Gallery page={page} />;
    case "index": return <Directory page={page} />;
    default: return <><Heading page={page} kicker="Information" />
      <Section>{page.body ? <div className="rich" dangerouslySetInnerHTML={{ __html: page.body }} /> : <Notice>Source content is pending.</Notice>}</Section></>;
  }
}
