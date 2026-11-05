"use client";

import { useSearchParams } from "next/navigation";

export function InquiryFields({ initialProduct }: { initialProduct?: string }) {
  return <div className="rfq-fields">
    <label>Product / model<input key={initialProduct} defaultValue={initialProduct} placeholder="Product or model of interest" maxLength={150} /></label>
    <label>Work email<input type="email" autoComplete="off" placeholder="name@example.com" /></label>
    <label>Project requirements<textarea placeholder="Flow, pressure or head, drive type, destination and quantity" /></label>
    <button className="btn primary" type="button" disabled>Inquiry delivery unavailable</button>
    <p className="fine">Online inquiry delivery will be available once the contact details are configured. Information entered here is not sent.</p>
  </div>;
}

export function InquiryFieldsFromUrl() {
  const search = useSearchParams();
  return <InquiryFields initialProduct={search.get("product")?.slice(0, 150)} />;
}
