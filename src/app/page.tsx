import { PageBody } from "@/components/PageBody";
import { getPage } from "@/lib/site";

export default function Home() { const page = getPage("/"); return page ? <PageBody page={page} /> : null; }
