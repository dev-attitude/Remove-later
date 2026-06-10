import { CampusModuleStub } from "@/components/campus/CampusModuleStub";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";

type Props = { params: Promise<{ tenant: string }> };

export default async function AccreditationPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        title="Accreditation & Quality Assurance"
        description={`NQA requirements, programme accreditation, faculty audits, and QA indicators for ${tenant.name}.`}
      />
      <CampusModuleStub
        title="Quality assurance"
        description="Track compliance and audit readiness in one place."
        features={[
          "NQA and CHE requirement checklists",
          "Programme accreditation status and renewals",
          "Faculty audit schedules and evidence repository",
          "QA dashboards for executive reporting",
        ]}
      />
    </div>
  );
}
