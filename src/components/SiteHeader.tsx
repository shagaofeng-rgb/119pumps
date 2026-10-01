"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { identity } from "@/config/identity";

const categories = [
  ["Fire Pump System", "/fire-pump-system/"],
  ["Mobile Pump Unit", "/products/mobile-pump-unit/"],
  ["Diesel Fire Pump", "/products/diesel-fire-pump/"],
  ["Electric Fire Pump", "/products/electric-fire-pump/"],
  ["Spare Parts for Fire Pump", "/products/spare-parts-for-fire-pump/"],
  ["Water Pump", "/products/water-pump/"],
] as const;

const navigation = [
  ["Home", "/"],
  ["Products", "/products/"],
  ["About", "/company-profile.html"],
  ["Application", "/application/"],
  ["FAQ", "/faq/"],
  ["News", "/industry-news/"],
  ["Service", "/service.html"],
  ["Contact", "/contact.html"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return <header className="site-header">
    <div className="site-top"><div className="site-wrap site-top-inner">
      <div><Link href="/contact.html">Contact us</Link><span className="top-separator">|</span><Link href="/contact.html">Send inquiry</Link></div>
      <div className="site-top-right"><Link href="/panorama">Panorama</Link><span className="language-indicator">Language: English</span>
        <form className="search-form" onSubmit={(event) => {event.preventDefault(); router.push(`/search?q=${encodeURIComponent(search.trim())}`);}}>
          <input aria-label="Search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products & articles" />
          <button aria-label="Search" type="submit">⌕</button>
        </form>
      </div>
    </div></div>
    <div className="site-wrap nav-inner">
      <Link className="brand-placeholder" href="/" aria-label="Home"><span className="brand-symbol" aria-hidden="true">✦</span><span>{identity.brandName}</span></Link>
      <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">☰</button>
      <nav className={open ? "site-menu is-open" : "site-menu"} aria-label="Main navigation">
        <form className="mobile-search" onSubmit={(event) => {event.preventDefault(); setOpen(false); router.push(`/search?q=${encodeURIComponent(search.trim())}`);}}><input aria-label="Search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" /><button type="submit">Search</button></form>
        {navigation.map(([label, href]) => <div className={`menu-item ${pathname === href || (href === "/products/" && pathname.startsWith("/products/")) ? "active" : ""}`} key={href}>
          <Link href={href} onClick={() => setOpen(false)}>{label}</Link>
          {label === "Products" && <div className="mega-menu">{categories.map(([name, path]) => <Link href={path} key={path} onClick={() => setOpen(false)}>{name}</Link>)}</div>}
        </div>)}
      </nav>
    </div>
  </header>;
}
