import { EmailPage } from "@/components/hosting/account/EmailPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Email | GM Consultations Hosting",
};

export default function Page() {
  return <EmailPage />;
}
