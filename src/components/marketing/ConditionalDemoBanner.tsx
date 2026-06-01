"use client";

import { usePathname } from "next/navigation";
import { DemoBanner } from "@/components/DemoBanner";

const RESEARCH_PREFIXES = [
  "/research",
  "/institution",
  "/student",
  "/analysis",
  "/developer",
  "/login",
  "/register",
  "/download",
];

export function ConditionalDemoBanner() {
  const pathname = usePathname() ?? "";
  const show = RESEARCH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!show) return null;
  return <DemoBanner />;
}
