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
  const lookup = (key: string) => {
    const alternate = key.endsWith("/") ? key.slice(0, -1) : key + "/";
    return pages[key] ?? pages[alternate] ?? (key.startsWith("/") && key !== "/" ? pages[key.slice(1)] ?? pages[alternate.slice(1)] : undefined);
  };
  const exact = lookup(path);
  if (exact) return exact;
  try { return lookup(decodeURIComponent(path)); } catch { return undefined; }
}

export function getAllPages(): SitePage[] {
  return Object.values(pages);
}

export function titleFromPath(path: string): string {
  return path.replace(/\/?$/, "").split("/").pop()?.replace(/\.html$/, "").replace(/[-_]/g, " ") || "Home";
}
