import data from "@/data/interior.json";
import { canonicalPagePath } from "./links";

export type InteriorPage = {
  p: string;
  t: string;
  name: string;
  base?: string;
  page?: number;
  pending?: boolean;
  hidden?: boolean;
  photos?: string[];
  specs?: [string, string][];
  sections?: [string, string][];
  links?: string[];
  related?: string[];
  thumbs?: Record<string, string>;
  body?: string;
  date?: string;
  excerpt?: string;
};

// The generator writes two-value tuples; JSON imports infer these as string arrays.
const pages = data as unknown as Record<string, InteriorPage>;
const all = Object.values(pages);
const byType = new Map<string, InteriorPage[]>();
const pagination = new Map<string, InteriorPage[]>();
for (const page of all) {
  if (!byType.has(page.t)) byType.set(page.t, []);
  byType.get(page.t)?.push(page);
  if (page.base) {
    if (!pagination.has(page.base)) pagination.set(page.base, []);
    pagination.get(page.base)?.push(page);
  }
}
for (const list of pagination.values()) list.sort((a, b) => (a.page ?? 1) - (b.page ?? 1));

export const contactPath = "/contact.html";
export const servicePaths = ["/service.html", "/service-guarantee.html", "/shopping-guide.html", "/method-of-payment.html", "/the-contract-sample"];
export const certificatePaths = ["/certificate", "/certificate/domestic", "/certificate/international"];
export const companyPaths = ["/company-profile.html", "/history", "/factory-show", "/customer-witness", "/certificate"];
export const mediaPaths = ["/factory-show", "/video", "/test-video", "/panorama", "/gellary"];
export const newsPaths = ["/industry-news", "/company-news", "/company-news/dispatch-news", "/company-news/exhibition-news", "/company-news/installation-news"];
export const menuCategories = ["/fire-pump-system", "/products/diesel-fire-pump", "/products/electric-fire-pump", "/products/mobile-pump-unit", "/products/water-pump", "/products/spare-parts-for-fire-pump"];
export const sectionPaths = ["/products", "/application", "/faq", "/industry-news", "/company-profile.html", "/service.html"];
export const panoramaPage: InteriorPage = { p: "/panorama", t: "panorama", name: "Panorama", pending: true };
export const notFoundPage: InteriorPage = { p: "/404", t: "error", name: "Page not found" };

export const types: Record<string, [string, string]> = {
  "product-list": ["Product catalog", "boxes"], product: ["Product detail", "settings"],
  "case-list": ["Applications", "factory"], case: ["Project case", "building-2"],
  "faq-list": ["Technical FAQ", "circle-help"], faq: ["Technical answer", "book-open"],
  "news-list": ["News center", "newspaper"], article: ["Industry insight", "file-text"],
  company: ["Company", "building-2"], certificate: ["Certificates", "shield-check"],
  service: ["Support", "wrench"], contact: ["Contact", "mail"],
  gallery: ["Equipment gallery", "image"], media: ["Media center", "video"],
  index: ["Index", "list"], search: ["Search", "search"], panorama: ["Virtual tour", "compass"],
  placeholder: ["Resource pending", "folder-open"], error: ["Page not found", "circle-alert"],
};

export function interiorPage(path: string) {
  const key = canonicalPagePath(path);
  if (key === "/panorama") return panoramaPage;
  return Object.hasOwn(pages, key) ? pages[key] : undefined;
}

export function pagesOfType(type: string) {
  return byType.get(type) ?? [];
}

export function references(paths: readonly string[] = []) {
  return [...new Set(paths)].flatMap((path) => {
    const page = interiorPage(path);
    return page ? [page] : [];
  });
}

export const productCategories = pagesOfType("product-list").filter((p) => !p.base && !p.pending);
export const applicationCategories = pagesOfType("case-list");

export function productCategory(page: InteriorPage) {
  const group = page.p.startsWith("/fire-pump-system/") ? "/fire-pump-system" : page.p.split("/").slice(0, 3).join("/");
  return interiorPage(group) ?? interiorPage("/products");
}

export function parentPage(page: InteriorPage): InteriorPage | undefined {
  if (page.base) return interiorPage(page.base);
  const parent = page.p.slice(0, page.p.lastIndexOf("/"));
  if (page.t === "product") return productCategory(page);
  if (page.t === "product-list" && page.p !== "/products") return interiorPage("/products");
  if (page.t === "case" || (page.t === "case-list" && parent)) return interiorPage(parent);
  if (page.t === "faq" || page.p.startsWith("/faq/")) return interiorPage("/faq");
  if (page.t === "article" || (page.t === "news-list" && parent) || page.p.startsWith("/industry-news/")) return interiorPage(parent) ?? interiorPage("/industry-news");
  if (servicePaths.indexOf(page.p) > 0) return interiorPage(servicePaths[0]);
  if (certificatePaths.indexOf(page.p) > 0) return interiorPage(certificatePaths[0]);
  if (page.t === "media" || page.t === "panorama" || page.p === "/history") return interiorPage(companyPaths[0]);
  if (page.t === "gallery" && parent) return interiorPage(parent);
}

export function archivedPages(page: InteriorPage) {
  const base = page.base ?? page.p;
  const extra = pagination.get(base);
  return extra?.length ? [...references([base]), ...extra] : [];
}

export function listScope(page: InteriorPage) {
  const base = page.base ?? page.p;
  if (page.t === "product-list") return pagesOfType("product").filter((p) => !p.pending && !p.hidden && (base === "/products" || p.p.startsWith(base + "/")));
  if (page.t === "faq-list") return pagesOfType("faq").filter((p) => !p.pending);
  if (page.t === "news-list") return pagesOfType("article").filter((p) => !p.pending && p.p.startsWith(base + "/"));
  return [];
}

export function listingEntries(page: InteriorPage) {
  const scope = listScope(page);
  const paths = new Set(scope.map((item) => item.p));
  const archived = references(page.links).filter((item) => paths.has(item.p));
  return archivedPages(page).length ? archived : (archived.length ? archived : scope);
}

export function findInteriorPages(query: string, scope?: string) {
  const tokens = query.toLowerCase().split(/\s+/u).filter(Boolean);
  if (!tokens.length) return [];
  const category = scope ? interiorPage(scope) : undefined;
  const source = category && ["product-list", "news-list", "faq-list"].includes(category.t) ? listScope(category) : all;
  const available = source.filter((page) => !page.pending && !page.hidden && !page.base);
  return available.filter((page) => {
    const text = [page.name, page.p, page.excerpt, ...page.specs?.flat() ?? []].join(" ").toLowerCase();
    return tokens.every((word) => text.includes(word));
  });
}
