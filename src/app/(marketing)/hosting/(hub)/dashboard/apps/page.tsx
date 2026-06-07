import { HostingDashboardApps } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apps | GM Consultations Hosting",
};

export default function Page() {
  return <HostingDashboardApps />;
}
