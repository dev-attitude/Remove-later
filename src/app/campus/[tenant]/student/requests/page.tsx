import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { StudentRequests } from "@/components/campus/StudentRequests";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { EXISTING_REQUESTS } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function RequestsPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Online Requests"
        description={`Self-service requests at ${tenant.name} — transcripts, letters, appeals, programme changes, and complaints with status tracking.`}
      />
      <StudentRequests existing={EXISTING_REQUESTS} />
    </div>
  );
}
