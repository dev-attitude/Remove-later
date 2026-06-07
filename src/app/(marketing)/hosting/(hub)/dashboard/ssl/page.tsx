import { SslPage } from "@/components/hosting/account/SslPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSL Certificates | GM Consultations Hosting",
};

export default function Page() {
  return <SslPage />;
}
