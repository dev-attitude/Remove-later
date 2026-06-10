"use client";

import { signOut } from "next-auth/react";

export function CampusSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/campus/login" })}
      className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
    >
      Sign out
    </button>
  );
}
