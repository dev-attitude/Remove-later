"use client";

import { useParams } from "next/navigation";
import { isPortalId, type PortalId } from "@/lib/portals";

export function usePortalId(fallback: PortalId = "student"): PortalId {
  const params = useParams();
  const p = params?.portal;
  if (typeof p === "string" && isPortalId(p)) return p;
  return fallback;
}
