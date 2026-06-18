"use client";

import { signOut } from "next-auth/react";

export function CampusSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/campus/login" })}
      className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:bg-line"
    >
      Sign out
    </button>
  );
}
