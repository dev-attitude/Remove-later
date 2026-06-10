import { CampusModuleStub } from "@/components/campus/CampusModuleStub";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";

type Props = { params: Promise<{ tenant: string }> };

export default async function AlumniPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        title="Alumni & Fundraising"
        description={`Directory, donations, campaigns, and events for ${tenant.name} alumni.`}
      />
      <CampusModuleStub
        title="Alumni engagement"
        description="Turn graduates into lifelong supporters."
        features={[
          "Searchable alumni directory with privacy controls",
          "Online donations and campaign tracking",
          "Event management and reunions",
          "CRM sync for major donor cultivation",
        ]}
      />
    </div>
  );
}
