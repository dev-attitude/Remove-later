import { resolveCampusTenant } from "@/lib/campus/tenant";
import { getCrmLeads } from "@/lib/campus/data";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";

type Props = { params: Promise<{ tenant: string }> };

const STAGE_COLORS: Record<string, string> = {
  application: "bg-blue-100 text-blue-800",
  negotiation: "bg-amber-100 text-amber-800",
  engaged: "bg-emerald-100 text-emerald-800",
  active: "bg-violet-100 text-violet-800",
};

export default async function CrmPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);
  const leads = await getCrmLeads(slug);

  return (
    <div>
      <CampusPageHeader
        title="Institutional CRM"
        description={`Track prospects, parents, sponsors, alumni, and industry partners for ${tenant.name}.`}
      />

      <div className="overflow-x-auto rounded-xl border border-line bg-offwhite">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-cream-50 text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-charcoal">{lead.name}</td>
                <td className="px-4 py-3 capitalize text-muted">{lead.leadType}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      STAGE_COLORS[lead.stage] ?? "bg-line text-charcoal"
                    }`}
                  >
                    {lead.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{lead.email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
