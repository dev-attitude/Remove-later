import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/** Portal and API routes are not useful in public search results */
const DISALLOW = [
  "/api/",
  "/login",
  "/register",
  "/student",
  "/institution",
  "/analysis",
  "/developer",
  "/download",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOW,
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl(),
  };
}
