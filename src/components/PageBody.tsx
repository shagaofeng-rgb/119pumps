import type { SitePage } from "@/lib/site";
import { normalizeLegacyHtmlLinks } from "@/lib/links";
import { Hero } from "./Hero";
import { LegacyInteractions } from "./LegacyInteractions";

export function PageBody({ page }: { page: SitePage }) {
  return <><Hero /><div className="legacy-content home-content" dangerouslySetInnerHTML={{ __html: normalizeLegacyHtmlLinks(page.html) }} /><LegacyInteractions path={page.path} /></>;
}
