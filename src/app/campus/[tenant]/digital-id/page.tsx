import { CampusModuleStub } from "@/components/campus/CampusModuleStub";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";

type Props = { params: Promise<{ tenant: string }> };

export default async function DigitalIdPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        title="Digital Campus ID"
        description={`Mobile student ID for ${tenant.name} — QR, NFC, attendance, library, hostel, and exam verification.`}
      />
      <div className="mb-6 flex justify-center">
        <div className="rounded-2xl border-2 border-slate-300 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto h-32 w-32 rounded-lg bg-slate-900 p-2">
            <div className="grid h-full grid-cols-5 grid-rows-5 gap-0.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={i % 3 === 0 ? "bg-white" : "bg-slate-900"} />
              ))}
            </div>
          </div>
          <p className="mt-4 font-semibold text-slate-900">Demo Student</p>
          <p className="text-sm text-slate-500">MC2021045 · Valid 2026</p>
        </div>
      </div>
      <CampusModuleStub
        title="Mobile ID capabilities"
        description="Replace expensive physical cards with a secure mobile credential."
        features={[
          "QR code for attendance and exams",
          "NFC tap for hostel and library access",
          "Real-time revocation if card is lost",
          "Flutter super app integration",
        ]}
      />
    </div>
  );
}
