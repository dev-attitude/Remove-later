import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ConditionalDemoBanner } from "@/components/marketing/ConditionalDemoBanner";
import { BRAND } from "@/lib/brand";
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
  title: {
    default: `${BRAND.companyName} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.companyName}`,
  },
  description:
    `IT consulting, business consulting, gadgets, system development, web & app development, and ${BRAND.productName}.`,
  manifest: "/manifest.json",
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
