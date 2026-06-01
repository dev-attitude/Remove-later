import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ConditionalDemoBanner } from "@/components/marketing/ConditionalDemoBanner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "GM Consultations | Expert Solutions for Success",
    template: "%s | GM Consultations",
  },
  description:
    "IT consulting, business consulting, gadgets, system development, web & app development, and the GM Research Suite.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "GM Research",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ConditionalDemoBanner />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
