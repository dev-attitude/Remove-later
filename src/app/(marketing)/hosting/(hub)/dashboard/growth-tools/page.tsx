import { HostingDashboardGrowthTools } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Growth Tools | Skyrapay Hosting",
};

export default function Page() {
  return <HostingDashboardGrowthTools />;
}
