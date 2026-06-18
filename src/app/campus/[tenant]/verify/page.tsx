import { resolveCampusTenant } from "@/lib/campus/tenant";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { VerifyForm } from "@/components/campus/VerifyForm";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ tenant: string }> };

export default async function VerifyPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  const dbTenant = await prisma.campusTenant.findUnique({ where: { slug } });
  const sample = dbTenant
    ? await prisma.campusCredential.findFirst({ where: { tenantId: dbTenant.id } })
    : null;

  return (
    <div>
      <CampusPageHeader
        title="Digital Transcript Verification Hub"
        description={`Employers and graduates verify ${tenant.name} qualifications instantly — QR code, blockchain hash, and public portal.`}
      />

      <VerifyForm tenantSlug={slug} />

      {sample && (
        <p className="mt-4 text-xs text-muted">
          Demo code: <code className="rounded bg-line px-1">{sample.verifyCode}</code>
        </p>
      )}

      <ul className="mt-8 space-y-2 text-sm text-muted">
        <li>• Every transcript includes a unique verification code and optional blockchain anchor</li>
        <li>• Employers access this portal without institutional login</li>
        <li>• Integrates with graduation and registrar workflows</li>
      </ul>
    </div>
  );
}
