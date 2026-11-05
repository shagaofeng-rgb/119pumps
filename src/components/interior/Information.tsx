import { Suspense } from "react";
import { identity } from "@/config/identity";
import { certificatePaths, companyPaths, mediaPaths, newsPaths, references, servicePaths, types, type InteriorPage } from "@/lib/interior";
import { Action, Chips, Heading, Notice, Section, SectionHeading, Slot } from "./ui";
import { InquiryFields, InquiryFieldsFromUrl } from "./InquiryFields";

type SlotData = [icon: string, title: string, description: string];

export function Contact({ page }: { page: InteriorPage }) {
  return <>
    <Heading page={page} kicker="Project inquiries" summary="Tell us about the pump, application or project you are working on." dark />
    <Section><div className="form-grid">
      <div className="rfq"><SectionHeading>Request a quote</SectionHeading>
        <Suspense fallback={<InquiryFields />}><InquiryFieldsFromUrl /></Suspense>
      </div>
      <div className="contact-channels"><SectionHeading>Contact channels</SectionHeading>
        <Slot icon="mail" title="Email">{identity.email || "Pending verified contact details"}</Slot>
        <Slot icon="phone" title="Telephone">{identity.telephone || "Pending verified contact details"}</Slot>
        <Slot icon="map-pin" title="Address">{identity.address || "Pending verified contact details"}</Slot>
      </div>
    </div></Section>
  </>;
}

function pendingSections(page: InteriorPage): { tabs?: string[]; summary: string; slots?: SlotData[] } {
  switch (page.t) {
    case "service": return {
      tabs: servicePaths, summary: page.p === servicePaths[0] ? "Product selection, order documentation and after-sales resources." : "Verified guidance and supporting documents will be added here.",
      slots: page.p === servicePaths[0] ? [["settings", "Selection support", "Product and application details"], ["file-text", "Order documentation", "Purchasing and contract resources"], ["wrench", "After-sales support", "Service and maintenance information"]]
        : [["file-text", "Verified guidance", "Content pending"], ["clipboard-list", "Supporting documents", "Attachments pending"]],
    };
    case "company": return {
      tabs: companyPaths, summary: "Company information and verified capabilities.",
      slots: page.p === "/history" ? [["calendar", "Milestones", "Verified dates and events pending"], ["factory", "Development", "Company records pending"]]
        : [["building-2", "Company overview", "Verified introduction pending"], ["factory", "Manufacturing", "Facility photos and capabilities pending"], ["shield-check", "Quality documentation", "Verified records pending"]],
    };
    case "certificate": return {
      tabs: certificatePaths, summary: "Verified certificates and their applicable product ranges will be listed here.",
      slots: [["shield-check", "Certificate record", "Verified document pending"], ["clipboard-list", "Model scope", "Reference details pending"], ["files", "Supporting documents", "Original files pending"]],
    };
    case "media": return {
      tabs: mediaPaths, summary: "Approved images and videos will be displayed here.",
      slots: [["camera", "Media gallery", "Approved photographs pending"], ["video", "Video resources", "Approved media pending"]],
    };
    case "panorama": return {
      tabs: mediaPaths, summary: "The virtual walkthrough will be available when facility panoramas are ready.",
      slots: [["compass", "Virtual walkthrough", "Viewer link and panoramic imagery pending"]],
    };
    case "news-list": return {
      tabs: newsPaths, summary: "Company news and event information.",
      slots: [["newspaper", "Company updates", "Verified releases pending"], ["calendar", "Events", "Confirmed dates and details pending"]],
    };
    default: return { summary: "Content for this page is not currently available." };
  }
}

export function Pending({ page }: { page: InteriorPage }) {
  const info = pendingSections(page);
  const faq = page.p.startsWith("/faq/");
  const news = page.p.startsWith("/industry-news/") || page.p.startsWith("/company-news");
  return <>
    <Heading page={page} kicker={types[page.t]?.[0] ?? "Information"} summary={info.summary} dark={page.t === "company" || page.t === "service"} />
    <Section>
      {info.tabs && <Chips pages={references(info.tabs)} active={page.p} />}
      {info.slots && <div className="slots">{info.slots.map(([icon, title, desc]) => <Slot key={title} icon={icon} title={title}>{desc}</Slot>)}</div>}
      <Notice>Content pending</Notice>
      <Action href={faq ? "/faq" : news ? "/industry-news" : "/products"}>{faq ? "Back to FAQ" : news ? "Read industry news" : "Browse products"}</Action>
    </Section>
  </>;
}

export function ErrorContent({ page }: { page: InteriorPage }) {
  return <><Heading page={page} kicker="404 · Page not found" summary="The address may have changed, or the page is unavailable." dark />
    <Section><SectionHeading>Find what you were looking for</SectionHeading>
      <div className="actions"><Action href="/search" primary>Search the site</Action><Action href="/products">Browse products</Action><Action href="/" icon="arrow-left">Return home</Action></div>
    </Section></>;
}
