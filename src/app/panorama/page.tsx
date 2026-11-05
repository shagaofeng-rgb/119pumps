import type { Metadata } from "next";
import { Pending } from "@/components/interior/Information";
import { InteriorShell } from "@/components/interior/Shell";
import { panoramaPage } from "@/lib/interior";

export const metadata: Metadata = { title: "Panorama", robots: { index: false, follow: true } };

export default function Panorama() {
  return <InteriorShell page={panoramaPage}><Pending page={panoramaPage} /></InteriorShell>;
}
