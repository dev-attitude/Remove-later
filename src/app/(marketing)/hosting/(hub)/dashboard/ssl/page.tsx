import { HostingDashboardSsl } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSL Certificates | Skyrapay Hosting",
};

export default function Page() {
  return <HostingDashboardSsl />;
}
