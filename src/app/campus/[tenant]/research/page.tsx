import Link from "next/link";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";

type Props = { params: Promise<{ tenant: string }> };

export default async function ResearchPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        title="Research & Innovation Hub"
        description={`Proposals, ethics clearance, publications, grants, and funding for ${tenant.name}.`}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Active proposals", value: "24" },
          { label: "Ethics pending", value: "7" },
          { label: "Grants awarded (YTD)", value: "N$ 4.2M" },
          { label: "Publications", value: "156" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-offwhite p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="text-2xl font-bold text-charcoal">{s.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        Integrates with{" "}
        <Link href="/research" className="font-medium text-blue-600 hover:underline">
          Skyrapay Research Suite
        </Link>{" "}
        for writing, plagiarism, and supervisor workflows.
      </p>
    </div>
  );
}
