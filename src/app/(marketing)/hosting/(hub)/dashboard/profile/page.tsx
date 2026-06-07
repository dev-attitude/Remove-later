import { ProfilePage } from "@/components/hosting/account/ProfilePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | GM Consultations Hosting",
};

export default function Page() {
  return <ProfilePage />;
}
