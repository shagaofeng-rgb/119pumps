import { Suspense } from "react";
import { identity } from "@/config/identity";
import { certificatePaths, companyPaths, mediaPaths, newsPaths, references, servicePaths, types, type InteriorPage } from "@/lib/interior";
import { Action, Chips, Heading, Icon, LocalLink, Notice, Section, SectionHeading, Slot } from "./ui";
import { InquiryFields, InquiryFieldsFromUrl } from "./InquiryFields";

type SlotData = [icon: string, title: string, description: string];
type Topic = [href: string, icon: string, title: string, description: string];

const supportTopics: Topic[] = [
  ["/shopping-guide.html", "clipboard-list", "Prepare a pump enquiry", "Gather the design duty, drive, site conditions and documentation requirements."],
  ["/faq", "circle-help", "Technical answers", "Find existing guides on pump selection, installation, testing and maintenance."],
  ["/application", "factory", "Applications and case studies", "Explore documented fire protection, water supply and wastewater installations."],
];

const companyTopics: Topic[] = [
  ["/products", "boxes", "Product catalog", "Browse fire pump packages, diesel and electric pumps, and industrial equipment."],
  ["/application", "building-2", "Project examples", "Read installation cases grouped by application."],
  ["/gellary", "image", "Equipment gallery", "Browse photographs of pump systems and related equipment."],
];

function TopicCards({ title, topics }: { title: string; topics: Topic[] }) {
  return <section className="topic-section">
    <SectionHeading>{title}</SectionHeading>
    <div className="topic-grid">{topics.map(([href, icon, name, description]) => <LocalLink key={href} href={href} className="topic-card">
      <Icon name={icon} size={22} />
      <div><h3>{name}</h3><p>{description}</p></div>
      <Icon name="arrow-right" />
    </LocalLink>)}</div>
  </section>;
}

const enquirySteps = [
  ["Set the duty point", "Record required flow and pressure or head at that flow. Include units and the application."],
  ["Describe the installation", "State the drive preference, electrical supply if applicable, suction conditions, and space available for the equipment."],
  ["List the documents you need", "Specify the requested drawing, performance curve, controller details and any required standards or approvals. Confirm availability for the exact model."],
];

function InformationHub({ page }: { page: InteriorPage }) {
  const support = page.p === "/service.html";
  return <>
    <Heading page={page} kicker={support ? "Product support" : "119pumps"} dark
      summary={support ? "Find the information you need to specify a pump and prepare a project enquiry." : "Explore the equipment catalog, application cases and product photography."} />
    <Section>
      <TopicCards title={support ? "What do you need help with?" : "Explore the site"} topics={support ? supportTopics : companyTopics} />
      <section className="topic-section">
        <SectionHeading>{support ? "Order and service documents" : "Company documentation"}</SectionHeading>
        <p className="fine">{support ? "Check the availability of service terms, payment information and contract documents." : "Check the availability of company, factory and certification records."}</p>
        <Chips pages={references(support ? servicePaths : companyPaths).filter((item) => item.p !== page.p && item.p !== "/shopping-guide.html")} active={page.p} />
      </section>
    </Section>
  </>;
}

function EnquiryGuide({ page }: { page: InteriorPage }) {
  return <>
    <Heading page={{ ...page, name: "Pump enquiry checklist" }} kicker="Purchasing guide"
      summary="Prepare the information needed to compare equipment and request model-specific documents." />
    <Section>
      <ol className="enquiry-steps">{enquirySteps.map(([name, description]) => <li key={name}><h2>{name}</h2><p>{description}</p></li>)}</ol>
      <TopicCards title="Continue with your selection" topics={[
        ["/products", "boxes", "Compare equipment", "Open product pages for their photographs and available specifications."],
        ["/faq/how-to-calculate-fire-pump-flow-rate-requirements.html", "gauge", "Read about fire pump flow", "Review the site guide on defining a flow requirement."],
        ["/service.html", "wrench", "Return to support", "Browse technical answers and document availability."],
      ]} />
    </Section>
  </>;
}

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
      tabs: servicePaths, summary: "Verified guidance and supporting documents will be added here.",
      slots: [["file-text", "Verified guidance", "Content pending"], ["clipboard-list", "Supporting documents", "Attachments pending"]],
    };
    case "company": return {
      tabs: companyPaths, summary: "Company information and verified capabilities.",
      slots: [["calendar", "Milestones", "Verified dates and events pending"], ["factory", "Development", "Company records pending"]],
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
  if (page.p === "/service.html" || page.p === "/company-profile.html") return <InformationHub page={page} />;
  if (page.p === "/shopping-guide.html") return <EnquiryGuide page={page} />;
  const info = pendingSections(page);
  const faq = page.p.startsWith("/faq/");
  const news = page.p.startsWith("/industry-news/") || page.p.startsWith("/company-news");
  const related: Topic[] = page.t === "service"
    ? [supportTopics[0], ["/service.html", "wrench", "Support center", "Find technical guides and check document availability."]]
    : ["media", "company", "certificate", "panorama"].includes(page.t) ? companyTopics : [];
  return <>
    <Heading page={page} kicker={types[page.t]?.[0] ?? "Information"} summary={info.summary} dark={page.t === "company" || page.t === "service"} />
    <Section>
      {info.tabs && <Chips pages={references(info.tabs).filter((item) => item.p !== page.p)} active={page.p} />}
      {info.slots && <div className="slots">{info.slots.map(([icon, title, desc]) => <Slot key={title} icon={icon} title={title}>{desc}</Slot>)}</div>}
      <Notice>Content pending</Notice>
      {related.length ? <TopicCards title="Available resources" topics={related} />
        : <Action href={faq ? "/faq" : news ? "/industry-news" : "/products"}>{faq ? "Back to FAQ" : news ? "Read industry news" : "Browse products"}</Action>}
    </Section>
  </>;
}

export function ErrorContent({ page }: { page: InteriorPage }) {
  return <><Heading page={page} kicker="404 · Page not found" summary="The address may have changed, or the page is unavailable." dark />
    <Section><SectionHeading>Find what you were looking for</SectionHeading>
      <div className="actions"><Action href="/search" primary>Search the site</Action><Action href="/products">Browse products</Action><Action href="/" icon="arrow-left">Return home</Action></div>
    </Section></>;
}
