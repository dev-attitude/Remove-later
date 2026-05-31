import { notFound } from "next/navigation";
import { getModuleComponent } from "@/features/modules/registry";
import { isPortalId, portalHasModule } from "@/lib/portals";

export default async function PortalModulePage({
  params,
}: {
  params: Promise<{ portal: string; module: string }>;
}) {
  const { portal, module } = await params;

  if (!isPortalId(portal) || !portalHasModule(portal, module)) {
    notFound();
  }

  const Component = getModuleComponent(module);
  if (!Component) notFound();

  return <Component />;
}
