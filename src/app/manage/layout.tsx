import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isBusinessAdmin } from "@/lib/business-admin";
import { ManageShell } from "@/components/manage/ManageShell";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login?callbackUrl=/manage");
  }

  if (!isBusinessAdmin(email, role)) {
    redirect("/?error=business-admin");
  }

  return (
    <ManageShell userLabel={session.user.name || email || "Skyrapay Admin"}>
      {children}
    </ManageShell>
  );
}
