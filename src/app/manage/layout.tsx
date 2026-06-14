import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isBusinessAdmin } from "@/lib/business-admin";
import { ManageShell } from "@/components/manage/ManageShell";
import { ManageAccessDenied } from "@/components/manage/ManageGate";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email;

  if (!session?.user) {
    redirect("/business/login?callbackUrl=/manage");
  }

  if (!isBusinessAdmin(email)) {
    return <ManageAccessDenied email={email} />;
  }

  return (
    <ManageShell userLabel={session.user.name || email || "Skyrapay Admin"}>
      {children}
    </ManageShell>
  );
}
