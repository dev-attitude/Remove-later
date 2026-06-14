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
  error?: { message?: string };
};

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
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error("[google-reviews] Places (New) HTTP", res.status);
    return null;
  }

  const data = (await res.json()) as PlacesNewResponse;
  if (data.error) {
    console.error("[google-reviews] Places (New)", data.error.message);
    return null;
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

function emptyReviews(configured = false): GoogleReviewsData {
  return {
    placeName: COMPANY.shortName,
    rating: null,
    totalReviews: 0,
    reviews: [],
    live: false,
    configured,
  };
}

/** Fetches public Google reviews via Places API (server-only). Cached 1 hour. */
export async function fetchGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return emptyReviews(false);
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
      return emptyReviews(true);
    }

    const data = (await res.json()) as PlacesDetailsResponse;
    if (data.status !== "OK" || !data.result) {
      console.error("[google-reviews]", data.status, data.error_message);
      return emptyReviews(true);
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
      if (fromNewApi?.reviews.length) return { ...fromNewApi, configured: true };
    }

    return payload;
  } catch (err) {
    console.error("[google-reviews] fetch failed", err);
    return emptyReviews(true);
  }
}
