import { PortalSidebar } from "./PortalSidebar";
import type { PortalId } from "@/lib/portals";

export function PortalShell({
  portalId,
  children,
}: {
  portalId: PortalId;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <PortalSidebar portalId={portalId} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
