import { HostingDashboardHostingList } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hosting List | GM Consultations Hosting",
};

export default function Page() {
  return <HostingDashboardHostingList />;
}
