import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { StudentMessages } from "@/components/campus/StudentMessages";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { MESSAGE_THREADS } from "@/lib/campus/student-data";

type Props = { params: Promise<{ tenant: string }> };

export default async function MessagesPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="Student portal"
        title="Messages"
        description={`Direct communication with lecturers, the registrar, finance, and student affairs at ${tenant.name}.`}
      />
      <StudentMessages threads={MESSAGE_THREADS} />
    </div>
  );
}
