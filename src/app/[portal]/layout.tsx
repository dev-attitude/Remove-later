import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { isPortalId } from "@/lib/portals";

/** Paths served by static routes — never treat as a research portal slug */
const RESERVED_PORTAL_SLUGS = new Set([
  "manage",
  "login",
  "register",
  "download",
  "research",
  "shop",
  "quote",
  "about",
  "contact",
  "api",
]);

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ portal: string }>;
}) {
  const { portal } = await params;
  if (RESERVED_PORTAL_SLUGS.has(portal)) {
    redirect(`/${portal}`);
  }
  if (!isPortalId(portal)) notFound();
  return <PortalShell portalId={portal}>{children}</PortalShell>;
}
