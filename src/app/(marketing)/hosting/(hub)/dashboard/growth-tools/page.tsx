import { HostingDashboardGrowthTools } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Growth Tools | GM Consultations Hosting",
};

export default function Page() {
  return <HostingDashboardGrowthTools />;
}
