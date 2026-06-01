import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-site min-h-screen bg-[#060b18] text-slate-200">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
