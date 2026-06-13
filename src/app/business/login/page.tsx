import { Suspense } from "react";
import { BusinessManagerLogin } from "@/components/manage/BusinessManagerLogin";

export default function BusinessLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="manage-shell-bg flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      }
    >
      <BusinessManagerLogin />
    </Suspense>
  );
}
