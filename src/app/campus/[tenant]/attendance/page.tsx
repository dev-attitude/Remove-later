import { CampusModuleStub } from "@/components/campus/CampusModuleStub";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";

type Props = { params: Promise<{ tenant: string }> };

export default async function AttendancePage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="AI"
        title="AI Attendance System"
        description={`Face recognition and QR attendance for ${tenant.name} — automatic class logs or lecturer-generated QR scans.`}
      />
      <CampusModuleStub
        title="Attendance modes"
        description="Choose face recognition, QR scan, or hybrid per venue."
        features={[
          "Face recognition at lecture hall entrances",
          "Lecturer-generated session QR codes",
          "Sync to Student Success AI risk models",
          "Export for accreditation audits",
        ]}
      />
    </div>
  );
}
