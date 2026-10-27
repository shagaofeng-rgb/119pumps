import type { Metadata } from "next";
import { PageBody } from "@/components/PageBody";
import { getPage } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() { const page = getPage("/"); return page ? <PageBody page={page} /> : null; }
