import { AdvisorChat } from "@/components/campus/AdvisorChat";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";

type Props = { params: Promise<{ tenant: string }> };

export default async function ChatbotPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        badge="24/7"
        title="Campus AI Chatbot"
        description={`Students and staff get instant answers at ${tenant.name} — fees, results, timetables, leave, and payroll queries.`}
      />
      <AdvisorChat />
      <p className="mt-4 text-xs text-muted">
        Production: connect to institutional data via secure APIs and OpenAI for natural language.
      </p>
    </div>
  );
}
