import { AppsPage } from "@/components/hosting/account/AppsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apps | GM Consultations Hosting",
};

export default function Page() {
  return <AppsPage />;
}
