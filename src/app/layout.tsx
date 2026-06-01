import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ConditionalDemoBanner } from "@/components/marketing/ConditionalDemoBanner";
import { BRAND } from "@/lib/brand";
import {
  DEFAULT_OG_TITLE,
  SITE_SEO_DESCRIPTION,
  SITE_SEO_KEYWORDS,
} from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ConditionalDemoBanner />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
