"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { identity } from "@/config/identity";

const categories = [
  {
    name: "Fire Pump System",
    href: "/fire-pump-system/",
    image: "/assets/ad93e9c8deac6fe0a5c6.png",
    products: [
      ["UL-Listed Fire Pump Set", "/fire-pump-system/firepump.html"],
      ["EDJ End Suction Fire Pump Set", "/fire-pump-system/edj-fire-pump-set.html"],
      ["EDJ Fire Pump Set", "/fire-pump-system/60.html"],
      ["EJ Small Flow Fire Pump Set", "/fire-pump-system/fire-pump-unit.html"],
    ],
  },
  {
    name: "Mobile Pump Unit",
    href: "/products/mobile-pump-unit/",
    image: "/assets/4bd3fe5fd79db80a144e.jpg",
    products: [
      ["Split Case Series Mobile Pump Truck", "/products/mobile-pump-unit/split-case-series-mobile-pump-truck.html"],
      ["Self Priming Series Mobile Pump Truck", "/products/mobile-pump-unit/self-priming-series-mobile-pump-truck.html"],
      ["Centrifugal Diesel Driven Dewatering Pumps Open Frame Trailer", "/products/mobile-pump-unit/centrifugal-diesel-driven-dewatering-pumps-open-frame-trailer.html"],
      ["Flow-mixing Mobile Pump Truck", "/products/mobile-pump-unit/flow-mixing-mobile-pump-truck-1.html"],
    ],
  },
  {
    name: "Diesel Fire Pump",
    href: "/products/diesel-fire-pump/",
    image: "/assets/10860c8b237d3908a610.png",
    products: [
      ["UL Listed Diesel End Suction Fire Pump", "/products/diesel-fire-pump/68.html"],
      ["XBC-S Diesel Split Case Fire Pump", "/products/diesel-fire-pump/split-casing-diesel-fire-pump.html"],
      ["XBC-IS Diesel End Suction Fire Pump", "/products/diesel-fire-pump/end-suction-diesel-fire-pump.html"],
      ["XBC-D Diesel Multistage Fire Pump", "/products/diesel-fire-pump/multistage-fire-water-pump.html"],
    ],
  },
  {
    name: "Electric Fire Pump",
    href: "/products/electric-fire-pump/",
    image: "/assets/984e69592d9e75136354.png",
    products: [
      ["Horizontal Split Case Fire Pump", "/products/electric-fire-pump/split-casing-electric-fire-pump.html"],
      ["Series Horizontal Centrifugal Pump", "/products/electric-fire-pump/horizontal-electric-fire-pump.html"],
      ["Vertical Turbine Fire Pump", "/products/electric-fire-pump/vertical-turbine-fire-pump.html"],
      ["CDL Jockey Pump", "/products/electric-fire-pump/jockey-pump.html"],
    ],
  },
  {
    name: "Spare Parts for Fire Pump",
    href: "/products/spare-parts-for-fire-pump/",
    image: "/assets/2278f95462065f4e12e1.jpg",
    products: [
      ["Gear Box", "/products/spare-parts-for-fire-pump/gear-box.html"],
      ["Fire Pump Water Belt", "/products/spare-parts-for-fire-pump/fire-pump-water-belt.html"],
      ["Fire Pump Waste Cone", "/products/spare-parts-for-fire-pump/fire-pump-waste-cone.html"],
      ["Flow Meters", "/products/spare-parts-for-fire-pump/flow-meters.html"],
    ],
  },
  {
    name: "Water Pump",
    href: "/products/water-pump/",
    image: "/assets/3079ed273c4d85aa5bd1.jpg",
    products: [
      ["Submersible Sewage Pump", "/products/water-pump/submersible-sewage-pump.html"],
      ["Domestic Water Series", "/products/water-pump/domestic-water-series.html"],
      ["Submersible Sewage Pump with Automatic Coupling", "/products/water-pump/submersible-sewage-pump-with-automatic-coupling.html"],
      ["Vertical Multistage Pump", "/products/water-pump/vertical-multistage-pump.html"],
    ],
  },
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
  const [productsOpen, setProductsOpen] = useState(false);
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
        {navigation.map(([label, href]) => {
          const isProducts = label === "Products";
          const active = pathname === href || (href === "/products/" && pathname.startsWith("/products/"));

          return <div className={`menu-item ${active ? "active" : ""} ${isProducts ? "products-menu" : ""} ${isProducts && productsOpen ? "is-products-open" : ""}`} key={href}>
            <Link href={href} onClick={() => { setOpen(false); setProductsOpen(false); }}>{label}</Link>
            {isProducts && <>
              <button className="submenu-toggle" type="button" aria-label="Browse product categories" aria-expanded={productsOpen} onClick={() => setProductsOpen(!productsOpen)}>⌄</button>
              <div className="mega-menu">
                {categories.map((category) => <dl key={category.href}>
                  <dt className="category-title"><Link href={category.href} onClick={() => { setOpen(false); setProductsOpen(false); }}>{category.name}<i aria-hidden="true" /></Link></dt>
                  {category.products.map(([name, path]) => <dd key={path}><Link href={path} onClick={() => { setOpen(false); setProductsOpen(false); }}><i aria-hidden="true" />{name}</Link></dd>)}
                  <dt className="category-more"><Link href={category.href} onClick={() => { setOpen(false); setProductsOpen(false); }}><i aria-hidden="true" />More</Link></dt>
                  <dt className="category-picture"><Link className="category-image" href={category.href} aria-label={`See ${category.name}`} onClick={() => { setOpen(false); setProductsOpen(false); }}><Image src={category.image} alt={category.name} width={400} height={300} sizes="200px" loading="eager" unoptimized /></Link></dt>
                </dl>)}
              </div>
            </>}
          </div>;
        })}
      </nav>
    </div>
  </header>;
}
