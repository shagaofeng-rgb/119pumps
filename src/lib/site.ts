import data from "@/data/site.json";

export type SitePage = {
  path: string;
  type: string;
  title: string;
  description: string;
  html: string;
};

const pages = data as Record<string, SitePage>;

export function getPage(path: string): SitePage | undefined {
  const decoded = decodeURIComponent(path);
  return pages[decoded] ?? pages[decoded.endsWith("/") ? decoded.slice(0, -1) : decoded + "/"];
}

export function getAllPages(): SitePage[] {
  return Object.values(pages);
}

export function titleFromPath(path: string): string {
  return path.replace(/\/?$/, "").split("/").pop()?.replace(/\.html$/, "").replace(/[-_]/g, " ") || "Home";
}
