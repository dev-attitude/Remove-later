import { OffersPage } from "@/components/hosting/account/OffersPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Offers | GM Consultations Hosting",
};

export default function Page() {
  return <OffersPage />;
}
