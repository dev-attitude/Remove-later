import { auth } from "@/auth";
import { isBusinessAdmin } from "@/lib/business-admin";
import { ManageShell } from "@/components/manage/ManageShell";
import { ManageAccessDenied, ManageSignInPrompt } from "@/components/manage/ManageGate";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    return <ManageSignInPrompt />;
  }

  if (!isBusinessAdmin(email, role)) {
    return <ManageAccessDenied email={email} />;
  }

  return (
    <ManageShell userLabel={session.user.name || email || "Skyrapay Admin"}>
      {children}
    </ManageShell>
  );
}
