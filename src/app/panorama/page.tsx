import { Pending } from "@/components/interior/Information";
import { InteriorShell } from "@/components/interior/Shell";
import { panoramaPage } from "@/lib/interior";

export default function Panorama() {
  return <InteriorShell page={panoramaPage}><Pending page={panoramaPage} /></InteriorShell>;
}
