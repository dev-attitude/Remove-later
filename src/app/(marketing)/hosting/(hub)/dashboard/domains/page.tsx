import { DomainsPage } from "@/components/hosting/account/DomainsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Domain List | GM Consultations Hosting",
};

export default function Page() {
  return <DomainsPage />;
}
