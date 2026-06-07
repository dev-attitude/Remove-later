import { HostingCartProvider } from "@/lib/hosting-cart-context";
import { HostingShell } from "@/components/hosting/HostingShell";

export default function HostingHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <HostingCartProvider>
      <HostingShell>{children}</HostingShell>
    </HostingCartProvider>
  );
}
