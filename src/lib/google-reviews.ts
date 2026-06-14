import { COMPANY } from "@/lib/site-content";

export type GoogleReview = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhotoUrl?: string;
  authorUrl?: string;
};

export type GoogleReviewsData = {
  placeName: string;
  rating: number | null;
  totalReviews: number;
  reviews: GoogleReview[];
  live: boolean;
};

type PlacesDetailsResponse = {
  status: string;
  error_message?: string;
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: Array<{
      author_name?: string;
      author_url?: string;
      language?: string;
      profile_photo_url?: string;
      rating?: number;
      relative_time_description?: string;
      text?: string;
      time?: number;
    }>;
  };
};

function emptyReviews(): GoogleReviewsData {
  return {
    placeName: COMPANY.shortName,
    rating: null,
    totalReviews: 0,
    reviews: [],
    live: false,
  };
}

/** Fetches public Google reviews via Places API (server-only). Cached 1 hour. */
export async function fetchGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return emptyReviews();
  }

  const placeId = process.env.GOOGLE_PLACE_ID?.trim() || COMPANY.googlePlaceId;
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,rating,reviews,user_ratings_total");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "en");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("[google-reviews] HTTP", res.status);
      return emptyReviews();
    }

    const data = (await res.json()) as PlacesDetailsResponse;
    if (data.status !== "OK" || !data.result) {
      console.error("[google-reviews]", data.status, data.error_message);
      return emptyReviews();
    }

    const { result } = data;
    const reviews: GoogleReview[] = (result.reviews ?? [])
      .filter((r) => r.text?.trim())
      .map((r, index) => ({
        id: `${r.time ?? index}-${r.author_name ?? "review"}`,
        authorName: r.author_name?.trim() || "Google user",
        rating: Math.min(5, Math.max(1, r.rating ?? 5)),
        text: r.text!.trim(),
        relativeTime: r.relative_time_description?.trim() || "",
        profilePhotoUrl: r.profile_photo_url,
        authorUrl: r.author_url,
      }));

    return {
      placeName: result.name?.trim() || COMPANY.shortName,
      rating: result.rating ?? null,
      totalReviews: result.user_ratings_total ?? reviews.length,
      reviews,
      live: true,
    };
  } catch (err) {
    console.error("[google-reviews] fetch failed", err);
    return emptyReviews();
  }
}
