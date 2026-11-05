import { ErrorContent } from "@/components/interior/Information";
import { InteriorShell } from "@/components/interior/Shell";
import { notFoundPage } from "@/lib/interior";

export default function NotFound() {
  return <InteriorShell page={notFoundPage}><ErrorContent page={notFoundPage} /></InteriorShell>;
}
