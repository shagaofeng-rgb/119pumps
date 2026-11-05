"use client";

import { useState, type ReactNode } from "react";

export function ListFilter({ items, labels, grid, scope, initialCount, placeholder }: {
  items: ReactNode[]; labels: string[]; grid: boolean; scope: string; initialCount: string; placeholder: string;
}) {
  const [filter, setFilter] = useState("");
  const terms = filter.trim().toLowerCase().split(/\s+/u).filter(Boolean);
  const visible = items.filter((_, i) => terms.every((token) => labels[i].includes(token)));
  return <div className="catalog-list">
    <div className="list-tools">
      <strong aria-live="polite">{terms.length ? `${visible.length} ${visible.length === 1 ? "match" : "matches"} on this page` : initialCount}</strong>
      <form className="page-filter" action="/search" method="get">
        <input type="hidden" name="scope" value={scope} />
        <input type="search" aria-label={placeholder} placeholder={placeholder} value={filter} name="q"
          onChange={(event) => setFilter(event.currentTarget.value)} maxLength={150} />
        <button className="btn" type="submit">Search all</button>
      </form>
    </div>
    {visible.length ? <div className={grid ? "grid" : "rows"}>{visible}</div>
      : <p className="notice">No matching items on this page. Use Search all to check the full section.</p>}
  </div>;
}
