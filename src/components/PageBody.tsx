import Link from "next/link";
import type { SitePage } from "@/lib/site";
import { Hero } from "./Hero";
import { LegacyInteractions } from "./LegacyInteractions";
import { identity } from "@/config/identity";

const brandPages = new Set(["/company-profile.html", "/factory-show/", "/customer-witness/", "/certificate/", "/certificate/domestic/", "/certificate/international/", "/service.html", "/contact.html", "/service-guarantee.html", "/shopping-guide.html", "/method-of-payment.html", "/the-contract-sample/", "/video/", "/test-video/"]);

function PendingContent({ page }: { page: SitePage }) {
  const isContact = page.path === "/contact.html";
  return <div className="pending-content site-wrap"><div className="breadcrumb"><Link href="/">Home</Link> &gt; {page.title || "Contact"}</div><div className="pending-panel"><p className="pending-kicker">CONTENT PENDING</p><h1>{isContact ? "Contact us" : page.title}</h1><p>{isContact ? "New contact details and inquiry destination will be added here." : "This section is reserved for the new brand's information, images and supporting documents."}</p>{isContact && <div className="contact-placeholders"><div><span>Email</span><strong>{identity.email || "To be provided"}</strong></div><div><span>Telephone</span><strong>{identity.telephone || "To be provided"}</strong></div><div><span>Address</span><strong>{identity.address || "To be provided"}</strong></div></div>}</div></div>;
}

export function PageBody({ page }: { page: SitePage }) {
  if (page.path === "/") return <><Hero /><div className="legacy-content home-content" dangerouslySetInnerHTML={{ __html: page.html }} /><LegacyInteractions path={page.path} /></>;
  return <>
    <div className="sub-hero"><div className="site-wrap"><span>{page.type === "product" || page.type === "product-list" ? "PRODUCT" : page.type === "article" || page.type === "news-list" ? "NEWS" : page.type === "case" || page.type === "case-list" ? "APPLICATION" : page.type.startsWith("faq") ? "FAQ" : "ABOUT"}</span><p>Industrial pump solutions</p></div></div>
    {page.type === "placeholder" || brandPages.has(page.path) || page.path.includes("history") || page.path.startsWith("/company-news/") || page.path.startsWith("/social-media/") ? <PendingContent page={page} /> : <><div className={`legacy-content page-type-${page.type}`} dangerouslySetInnerHTML={{ __html: page.html }} /><LegacyInteractions path={page.path} /></>}
  </>;
}
