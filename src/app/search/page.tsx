import Link from "next/link";
import { getAllPages } from "@/lib/site";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = query ? getAllPages().filter((page) => (page.title + " " + page.description).toLowerCase().includes(query)).slice(0, 100) : [];
  return <div className="site-wrap search-page"><h1>Search results</h1><p>{query ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : "Enter a search term above."}</p><ul>{results.map((page) => <li key={page.path}><Link href={page.path}>{page.title}</Link><small>{page.type}</small></li>)}</ul></div>;
}
