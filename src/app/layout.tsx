import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Hanken_Grotesk } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ConditionalDemoBanner } from "@/components/marketing/ConditionalDemoBanner";
import { HostingCurrencyProvider } from "@/lib/hosting-currency-context";
import {
  COUNTRY_COOKIE,
  detectCountryFromHeaders,
} from "@/lib/hosting-currency";
import { BRAND } from "@/lib/brand";
import {
  DEFAULT_OG_TITLE,
  SITE_SEO_DESCRIPTION,
  SITE_SEO_KEYWORDS,
} from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Camera Plain Variable is a proprietary typeface; Hanken Grotesk is a humanist,
// warm-feeling variable sans that closely matches its rounded terminals and
// editorial rhythm. Used for both body and display for a unified voice.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const hankenDisplay = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: DEFAULT_OG_TITLE,
    template: `%s | ${BRAND.companyName}`,
  },
  description: SITE_SEO_DESCRIPTION,
  keywords: [...SITE_SEO_KEYWORDS],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_NA",
    siteName: BRAND.companyName,
    title: DEFAULT_OG_TITLE,
    description: SITE_SEO_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 640,
        height: 360,
        alt: BRAND.companyLegal,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_OG_TITLE,
    description: SITE_SEO_DESCRIPTION,
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Skyrapay Research",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const country = detectCountryFromHeaders(
    headerStore.get("x-vercel-ip-country") ?? headerStore.get("cf-ipcountry"),
    cookieStore.get(COUNTRY_COOKIE)?.value
  );

  return (
    <html
      lang="en"
      className={`${hanken.variable} ${hankenDisplay.variable} bg-cream`}
    >
      <body className="overflow-x-hidden bg-cream font-sans text-charcoal antialiased">
        <SessionProvider>
          <HostingCurrencyProvider initialCountry={country}>
            <ConditionalDemoBanner />
            {children}
          </HostingCurrencyProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
