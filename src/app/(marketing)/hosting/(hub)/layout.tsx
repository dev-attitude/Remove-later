import { HostingCartProvider } from "@/lib/hosting-cart-context";
import { HostingDemoBanner } from "@/components/hosting/HostingDemoBanner";
import { HostingShell } from "@/components/hosting/HostingShell";

export default function HostingHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <HostingCartProvider>
      <HostingDemoBanner />
      <HostingShell>{children}</HostingShell>
    </HostingCartProvider>
  );
}
