import { JunAccountPage } from "@/components/hosting/account/JunAccountPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | GM Consultations Hosting",
};

export default function Page() {
  return <JunAccountPage />;
}
