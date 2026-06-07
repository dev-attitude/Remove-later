import { HostingDashboardProfile } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | GM Consultations Hosting",
};

export default function Page() {
  return <HostingDashboardProfile />;
}
