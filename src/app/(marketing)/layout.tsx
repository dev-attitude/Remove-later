import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { LiveChat } from "@/components/marketing/LiveChat";
import { SeoJsonLd } from "@/components/marketing/SeoJsonLd";
import { HostingCurrencyBar } from "@/components/hosting/HostingCurrencyBar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-site">
      <SeoJsonLd />
      <SiteHeader />
      <HostingCurrencyBar />
      <main>{children}</main>
      <SiteFooter />
      <LiveChat />
    </div>
  );
}
