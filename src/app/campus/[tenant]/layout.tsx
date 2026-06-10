import { CampusShell } from "@/components/campus/CampusShell";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import type { CampusRole } from "@/lib/campus/types";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
};

async function resolveRole(slug: string): Promise<CampusRole> {
  const session = await auth();
  if (!session?.user?.id) return "vc";

  const tenant = await prisma.campusTenant.findUnique({ where: { slug } });
  if (!tenant) return "vc";

  const membership = await prisma.campusMembership.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId: session.user.id } },
  });
  return (membership?.role as CampusRole) ?? "vc";
}

export default async function CampusTenantLayout({ children, params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const role = await resolveRole(slug);

  return (
    <CampusShell tenant={tenant} role={role}>
      {children}
    </CampusShell>
  );
}
