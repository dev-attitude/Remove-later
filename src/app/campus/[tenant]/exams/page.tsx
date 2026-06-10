import { CampusModuleStub } from "@/components/campus/CampusModuleStub";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";

type Props = { params: Promise<{ tenant: string }> };

export default async function ExamsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        title="Smart Examination Centre"
        description={`Online and physical exams, invigilation, seating plans, and AI integrity detection for ${tenant.name}.`}
      />
      <CampusModuleStub
        title="Examination suite"
        description="End-to-end exam lifecycle with integrity analytics."
        features={[
          "Online and paper-based exam scheduling",
          "Automated seating plan generator",
          "Invigilator roster and venue management",
          "AI flags for copying patterns and unusual mark distributions",
        ]}
      />
    </div>
  );
}
