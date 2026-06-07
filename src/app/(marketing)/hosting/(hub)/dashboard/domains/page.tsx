import { HostingDashboardDomains } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Domain List | Skyrapay Hosting",
};

export default function Page() {
  return <HostingDashboardDomains />;
}
