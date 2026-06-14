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
  /** True when GOOGLE_PLACES_API_KEY is set (does not expose the key). */
  configured: boolean;
  /** Google API status when the fetch failed (e.g. REQUEST_DENIED). */
  googleStatus?: string;
  /** Human-readable hint for fixing configuration (no secrets). */
  hint?: string;
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

type PlacesNewReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
  publishTime?: string;
};

type PlacesNewResponse = {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesNewReview[];
  error?: { message?: string; status?: string };
};

function hintForGoogleStatus(status: string, message?: string): string {
  if (status === "REQUEST_DENIED") {
    if (message?.toLowerCase().includes("referer")) {
      return "Set API key Application restrictions to None (HTTP referrers block server-side requests from Vercel).";
    }
    return "Enable Places API on the same Google Cloud project as this key, and set Application restrictions to None.";
  }
  if (status === "INVALID_REQUEST") {
    return "Check GOOGLE_PLACE_ID matches your Google Business location.";
  }
  if (status === "OVER_QUERY_LIMIT") {
    return "Google Places API quota exceeded — try again later.";
  }
  return message || "Google Places API request failed — check key restrictions and enabled APIs.";
}

function mapLegacyReview(
  r: NonNullable<PlacesDetailsResponse["result"]>["reviews"] extends (infer T)[] | undefined
    ? T
    : never,
  index: number
): GoogleReview | null {
  const rating = r.rating ?? 0;
  const text = r.text?.trim();
  if (!text && rating <= 0) return null;

  return {
    id: `${r.time ?? index}-${r.author_name ?? "review"}`,
    authorName: r.author_name?.trim() || "Google user",
    rating: Math.min(5, Math.max(1, rating || 5)),
    text: text || "Left a star rating on Google.",
    relativeTime: r.relative_time_description?.trim() || "",
    profilePhotoUrl: r.profile_photo_url,
    authorUrl: r.author_url,
  };
}

function mapNewReview(r: PlacesNewReview, index: number): GoogleReview | null {
  const rating = r.rating ?? 0;
  const text = r.text?.text?.trim() || r.originalText?.text?.trim();
  if (!text && rating <= 0) return null;

  return {
    id: r.name ?? `new-${index}-${r.authorAttribution?.displayName ?? "review"}`,
    authorName: r.authorAttribution?.displayName?.trim() || "Google user",
    rating: Math.min(5, Math.max(1, rating || 5)),
    text: text || "Left a star rating on Google.",
    relativeTime: r.relativePublishTimeDescription?.trim() || "",
    profilePhotoUrl: r.authorAttribution?.photoUri,
    authorUrl: r.authorAttribution?.uri,
  };
}

function failure(
  configured: boolean,
  googleStatus?: string,
  hint?: string
): GoogleReviewsData {
  return {
    placeName: COMPANY.shortName,
    rating: null,
    totalReviews: 0,
    reviews: [],
    live: false,
    configured,
    googleStatus,
    hint,
  };
}

async function fetchPlacesNewReviews(
  apiKey: string,
  placeId: string
): Promise<GoogleReviewsData | null> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[google-reviews] Places (New) HTTP", res.status);
    return null;
  }

  const data = (await res.json()) as PlacesNewResponse;
  if (data.error) {
    console.error("[google-reviews] Places (New)", data.error.message);
    return failure(true, data.error.status ?? "ERROR", data.error.message);
  }

  const reviews = (data.reviews ?? [])
    .map(mapNewReview)
    .filter((r): r is GoogleReview => r !== null);

  return {
    placeName: data.displayName?.text?.trim() || COMPANY.shortName,
    rating: data.rating ?? null,
    totalReviews: data.userRatingCount ?? reviews.length,
    reviews,
    live: true,
    configured: true,
  };
}

/** Fetches public Google reviews via Places API (server-only). */
export async function fetchGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return failure(false);
  }

  const placeId = process.env.GOOGLE_PLACE_ID?.trim() || COMPANY.googlePlaceId;
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,rating,reviews,user_ratings_total");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "en");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      console.error("[google-reviews] HTTP", res.status);
      const fromNew = await fetchPlacesNewReviews(apiKey, placeId);
      if (fromNew?.live) return fromNew;
      return failure(true, `HTTP_${res.status}`, "Google Places API HTTP error.");
    }

    const data = (await res.json()) as PlacesDetailsResponse;
    if (data.status !== "OK" || !data.result) {
      console.error("[google-reviews]", data.status, data.error_message);
      const fromNew = await fetchPlacesNewReviews(apiKey, placeId);
      if (fromNew?.live) return fromNew;
      return failure(
        true,
        data.status,
        hintForGoogleStatus(data.status, data.error_message)
      );
    }

    const { result } = data;
    const reviews = (result.reviews ?? [])
      .map(mapLegacyReview)
      .filter((r): r is GoogleReview => r !== null);

    const payload: GoogleReviewsData = {
      placeName: result.name?.trim() || COMPANY.shortName,
      rating: result.rating ?? null,
      totalReviews: result.user_ratings_total ?? reviews.length,
      reviews,
      live: true,
      configured: true,
    };

    if (reviews.length === 0 && (payload.totalReviews ?? 0) > 0) {
      const fromNewApi = await fetchPlacesNewReviews(apiKey, placeId);
      if (fromNewApi?.live) return fromNewApi;
    }

    return payload;
  } catch (err) {
    console.error("[google-reviews] fetch failed", err);
    return failure(true, "FETCH_ERROR", "Could not reach Google Places API.");
  }
}
