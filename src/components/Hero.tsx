"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  { eyebrow: "MOBILE PUMP", title: "Emergency water supply", lines: ["Mobile pump for flood control", "Mobile pump for emergency dewatering"], href: "/products/mobile-pump-unit/" },
  { eyebrow: "FIRE PUMP SYSTEM", title: "Integrated pump packages", lines: ["Electric, diesel and jockey pump systems", "Built for dependable water delivery"], href: "/fire-pump-system/" },
  { eyebrow: "DIESEL FIRE PUMP", title: "Independent power", lines: ["Fire water supply for critical sites", "Explore the product range"], href: "/products/diesel-fire-pump/" },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000); return () => window.clearInterval(timer); }, []);
  const slide = slides[index];
  return <section className="site-hero" aria-label="Featured products">
    <div className="site-hero-shade" />
    <div className="site-wrap hero-inner" key={index}><p className="hero-eyebrow">{slide.eyebrow}</p><h1>{slide.title}</h1><ul>{slide.lines.map((line) => <li key={line}>{line}</li>)}</ul><Link href={slide.href}>Explore products <span>→</span></Link></div>
    <div className="hero-controls"><button aria-label="Previous slide" onClick={() => setIndex((index + slides.length - 1) % slides.length)}>‹</button>{slides.map((_, i) => <button key={i} className={i === index ? "dot active" : "dot"} aria-label={`Slide ${i + 1}`} onClick={() => setIndex(i)} />)}<button aria-label="Next slide" onClick={() => setIndex((index + 1) % slides.length)}>›</button></div>
  </section>;
}
