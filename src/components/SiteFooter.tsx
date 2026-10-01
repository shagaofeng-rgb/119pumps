import Link from "next/link";
import { identity } from "@/config/identity";

const categories = [
  ["Fire Pump System", "/fire-pump-system/"],
  ["Mobile Pump Unit", "/products/mobile-pump-unit/"],
  ["Diesel Fire Pump", "/products/diesel-fire-pump/"],
  ["Electric Fire Pump", "/products/electric-fire-pump/"],
  ["Spare Parts for Fire Pump", "/products/spare-parts-for-fire-pump/"],
  ["Water Pump", "/products/water-pump/"],
] as const;

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-wrap footer-cta"><Link href="/contact.html">SEND MESSAGES</Link><span>CONTACT DETAILS PENDING</span></div>
    <div className="site-wrap footer-grid">
      <section><h2><Link href="/products/">PRODUCTS LIST</Link></h2>{categories.map(([name, href]) => <Link key={href} href={href}>{name}</Link>)}</section>
      <section><h2><Link href="/contact.html">CONTACT US</Link></h2><p>Email</p><p className="pending-value">{identity.email || "To be provided"}</p><p>Telephone</p><p className="pending-value">{identity.telephone || "To be provided"}</p><p>Address</p><p className="pending-value">{identity.address || "To be provided"}</p></section>
      <section><h2>QUICK LINKS</h2><Link href="/service-guarantee.html">Service Guarantee</Link><Link href="/shopping-guide.html">Shopping Guide</Link><Link href="/method-of-payment.html">Method of Payment</Link><Link href="/the-contract-sample/">The Contract Sample</Link></section>
    </div>
    <div className="site-footer-bottom"><div className="site-wrap"><span>© {new Date().getFullYear()} · {identity.legalName || "Brand details pending"}</span><div><Link href="/site-index.html">Site Index</Link><Link href="/product-index.html">Product Index</Link></div></div></div>
  </footer>;
}
