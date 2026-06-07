import { HostingDashboardBackups } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backups | Skyrapay Hosting",
};

export default function Page() {
  return <HostingDashboardBackups />;
}
