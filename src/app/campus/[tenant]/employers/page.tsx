import { CampusModuleStub } from "@/components/campus/CampusModuleStub";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import Link from "next/link";

type Props = { params: Promise<{ tenant: string }> };

export default async function EmployersPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        title="Employers & Graduate Portal"
        description={`Verify qualifications, post jobs, and recruit ${tenant.name} graduates.`}
      />
      <CampusModuleStub
        title="Graduate employability"
        description="Bridge institution, employers, and alumni careers."
        features={[
          "Instant qualification verification",
          "Employer job board and graduate applications",
          "Graduate portfolios and CV uploads",
          "Internship and graduate programme matching",
        ]}
      />
      <Link
        href={`/campus/${slug}/verify`}
        className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
      >
        Open verification hub →
      </Link>
    </div>
  );
}
