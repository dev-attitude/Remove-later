import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { LiveChat } from "@/components/marketing/LiveChat";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-site">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <LiveChat />
    </div>
  );
}
