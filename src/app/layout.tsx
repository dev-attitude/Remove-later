import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { DemoBanner } from "@/components/DemoBanner";
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
  title: "GM Research Suite",
  description:
    "Multi-portal AI research platform — institution, student, analysis, and developer consoles",
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
          <DemoBanner />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
