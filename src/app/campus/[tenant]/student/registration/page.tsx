import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { StudentRegistration } from "@/components/campus/StudentRegistration";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { AVAILABLE_MODULES, REGISTERED_MODULES } from "@/lib/campus/student";

type Props = { params: Promise<{ tenant: string }> };

export default async function RegistrationPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Module Registration"
        description={`Register for Semester 2, 2026 at ${tenant.name}. The AI Advisor checks prerequisites automatically.`}
      />
      <StudentRegistration registered={REGISTERED_MODULES} available={AVAILABLE_MODULES} />
    </div>
  );
}
