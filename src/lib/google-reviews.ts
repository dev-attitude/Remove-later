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
  configured: boolean;
  googleStatus?: string;
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
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type PlacesNewResponse = {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesNewReview[];
  error?: { message?: string; status?: string };
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

function dedupeReviews(reviews: GoogleReview[]): GoogleReview[] {
  const seen = new Set<string>();
  const out: GoogleReview[] = [];
  for (const r of reviews) {
    const key = `${r.authorName.toLowerCase()}::${r.text.slice(0, 80).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

async function fetchLegacyPlaceReviews(
  apiKey: string,
  placeId: string,
  reviewsSort?: "most_relevant" | "newest"
): Promise<{ reviews: GoogleReview[]; result?: PlacesDetailsResponse["result"] } | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,rating,reviews,user_ratings_total");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "en");
  if (reviewsSort) url.searchParams.set("reviews_sort", reviewsSort);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;

  const data = (await res.json()) as PlacesDetailsResponse;
  if (data.status !== "OK" || !data.result) return null;

  const reviews = (data.result.reviews ?? [])
    .map(mapLegacyReview)
    .filter((r): r is GoogleReview => r !== null);

  return { reviews, result: data.result };
}

async function fetchPlacesNewReviewList(
  apiKey: string,
  placeId: string
): Promise<GoogleReview[]> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "reviews",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as PlacesNewResponse;
  if (data.error) return [];

  return (data.reviews ?? [])
    .map(mapNewReview)
    .filter((r): r is GoogleReview => r !== null);
}

async function fetchAllAvailableReviews(
  apiKey: string,
  placeId: string
): Promise<{
  reviews: GoogleReview[];
  placeName: string;
  rating: number | null;
  totalReviews: number;
} | null> {
  const [relevant, newest, newApiReviews] = await Promise.all([
    fetchLegacyPlaceReviews(apiKey, placeId, "most_relevant"),
    fetchLegacyPlaceReviews(apiKey, placeId, "newest"),
    fetchPlacesNewReviewList(apiKey, placeId),
  ]);

  const base = relevant ?? newest;
  if (!base?.result) return null;

  const merged = dedupeReviews([
    ...(relevant?.reviews ?? []),
    ...(newest?.reviews ?? []),
    ...newApiReviews,
  ]);

  return {
    reviews: merged,
    placeName: base.result.name?.trim() || COMPANY.shortName,
    rating: base.result.rating ?? null,
    totalReviews: base.result.user_ratings_total ?? merged.length,
  };
}

/** Fetches public Google reviews via Places API (server-only). */
export async function fetchGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return failure(false);
  }

  const placeId = process.env.GOOGLE_PLACE_ID?.trim() || COMPANY.googlePlaceId;

  try {
    const bundle = await fetchAllAvailableReviews(apiKey, placeId);
    if (bundle && bundle.reviews.length > 0) {
      return {
        placeName: bundle.placeName,
        rating: bundle.rating,
        totalReviews: bundle.totalReviews,
        reviews: bundle.reviews,
        live: true,
        configured: true,
      };
    }

    const legacy = await fetchLegacyPlaceReviews(apiKey, placeId);
    if (legacy?.result) {
      return {
        placeName: legacy.result.name?.trim() || COMPANY.shortName,
        rating: legacy.result.rating ?? null,
        totalReviews: legacy.result.user_ratings_total ?? legacy.reviews.length,
        reviews: legacy.reviews,
        live: true,
        configured: true,
      };
    }

    return failure(true, "NO_REVIEWS", "No Google reviews returned for this place.");
  } catch (err) {
    console.error("[google-reviews] fetch failed", err);
    return failure(true, "FETCH_ERROR", "Could not reach Google Places API.");
  }
}
