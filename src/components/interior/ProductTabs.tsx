"use client";

import { useEffect, useState, type ReactNode, type KeyboardEvent } from "react";

export function ProductTabs({ labels, panels, technical }: { labels: string[]; panels: ReactNode[]; technical: number }) {
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (technical < 0) return;
    const open = () => { if (window.location.hash === "#product-data") setSelected(technical); };
    const activate = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href="#product-data"]')) setSelected(technical);
    };
    open();
    window.addEventListener("hashchange", open);
    document.addEventListener("click", activate);
    return () => {
      window.removeEventListener("hashchange", open);
      document.removeEventListener("click", activate);
    };
  }, [technical]);

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const n = labels.length;
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % n;
    else if (event.key === "ArrowLeft") next = (index + n - 1) % n;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = n - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(`product-tab-${next}`)?.focus();
  }

  return <div id="product-data">
    <div className="tabs" role="tablist" aria-label="Product information">
      {labels.map((label, i) => <button key={i} type="button" id={`product-tab-${i}`} role="tab" aria-controls={`product-panel-${i}`}
        aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={(event) => onTabKey(event, i)}>{label}</button>)}
    </div>
    {panels.map((panel, i) => <div key={i} className="panel rich" id={`product-panel-${i}`} role="tabpanel"
      aria-labelledby={`product-tab-${i}`} tabIndex={0} hidden={selected !== i}>{panel}</div>)}
  </div>;
}
