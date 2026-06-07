import { ExpiringPage } from "@/components/hosting/account/DashboardPages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expiring / Expired | GM Consultations Hosting",
};

export default function Page() {
  return <ExpiringPage />;
}
