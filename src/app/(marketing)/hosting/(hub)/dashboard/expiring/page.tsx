import { HostingDashboardExpiring } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expiring / Expired | GM Consultations Hosting",
};

export default function Page() {
  return <HostingDashboardExpiring />;
}
