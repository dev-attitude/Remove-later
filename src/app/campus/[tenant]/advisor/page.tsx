import { resolveCampusTenant } from "@/lib/campus/tenant";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { AdvisorChat } from "@/components/campus/AdvisorChat";

type Props = { params: Promise<{ tenant: string }> };

export default async function AdvisorPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="AI"
        title="AI Academic Advisor"
        description={`Personalised module recommendations and graduation pathways for ${tenant.name} students.`}
      />
      <AdvisorChat />
    </div>
  );
}
