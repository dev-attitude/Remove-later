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
    return (
      <div className="min-h-screen bg-slate-50">
        <ManageSignInPrompt />
      </div>
    );
  }

  if (!isBusinessAdmin(email, role)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManageAccessDenied email={email} />
      </div>
    );
  }

  return (
    <ManageShell userLabel={session.user.name || email || "Skyrapay Admin"}>
      {children}
    </ManageShell>
  );
}
