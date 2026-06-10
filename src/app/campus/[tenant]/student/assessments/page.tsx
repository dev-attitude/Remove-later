import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { StudentAssessments } from "@/components/campus/StudentAssessments";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { ASSESSMENTS } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function AssessmentsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Assignment & Assessment Centre"
        description={`Assignments, quizzes, and tests at ${tenant.name} — submit work and track grades with feedback.`}
      />
      <StudentAssessments assessments={ASSESSMENTS} />
    </div>
  );
}
