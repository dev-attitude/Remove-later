import { NextResponse } from "next/server";
import { fetchGoogleReviews } from "@/lib/google-reviews";

export const revalidate = 60;

/** Public Google reviews feed for the marketing site (cached 1 hour). */
export async function GET() {
  const data = await fetchGoogleReviews();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
