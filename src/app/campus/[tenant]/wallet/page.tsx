import { CampusModuleStub } from "@/components/campus/CampusModuleStub";
import { CampusPageHeader } from "@/components/campus/CampusPageHeader";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import { formatCampusCurrency } from "@/lib/campus/data";

type Props = { params: Promise<{ tenant: string }> };

export default async function WalletPage({ params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return (
    <div>
      <CampusPageHeader
        title="Student Digital Wallet"
        description={`Unified payments for tuition, hostel, printing, cafeteria, and library fines at ${tenant.name}.`}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Wallet balance</p>
          <p className="text-2xl font-bold">{formatCampusCurrency(1250)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tuition due</p>
          <p className="text-2xl font-bold text-rose-700">{formatCampusCurrency(4200)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Printing credits</p>
          <p className="text-2xl font-bold">340 pages</p>
        </div>
      </div>
      <CampusModuleStub
        title="Payment integrations"
        description="Connect bank cards, mobile money, EFT, and QR payments."
        features={[
          "Top-up via bank card or mobile money",
          "Pay hostel and cafeteria from one balance",
          "Automatic tuition instalment reminders",
          "Receipts and statements for sponsors",
        ]}
      />
    </div>
  );
}
