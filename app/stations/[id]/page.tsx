import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
  NEARBY_PLACES_RADIUS_KM,
  enrichStationPlacesWithNearby,
  getFavoritePlaceIds,
  getPlacesCoordsForNearby,
  getReviewsForPlaceIds,
  getStationById,
  groupReviewsByPlaceId,
} from '@/lib/route-explore';
import StationPlacesClient from '@/app/components/explore/StationPlacesClient';

export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id: raw } = await params;
  const id = parseInt(raw, 10);
  if (!Number.isFinite(id)) {
    notFound();
  }

  const rawStation = await getStationById(id);
  if (!rawStation) {
    notFound();
  }

  let allCoords: Awaited<ReturnType<typeof getPlacesCoordsForNearby>> = [];
  try {
    allCoords = await getPlacesCoordsForNearby();
  } catch {
    allCoords = [];
  }
  const station = enrichStationPlacesWithNearby(
    rawStation,
    allCoords,
    NEARBY_PLACES_RADIUS_KM
  );

  const placeIds = station.places.map((p) => p.id);
  const reviews = await getReviewsForPlaceIds(placeIds);
  const reviewsByPlaceId = groupReviewsByPlaceId(reviews);
  let favoriteIds: number[] = [];
  try {
    favoriteIds = await getFavoritePlaceIds(Number(user.id));
  } catch {
    favoriteIds = [];
  }

  return (
    <StationPlacesClient
      station={station}
      reviewsByPlaceId={reviewsByPlaceId}
      currentUserId={Number(user.id)}
      initialFavoriteIds={favoriteIds}
      nearbyRadiusKm={NEARBY_PLACES_RADIUS_KM}
    />
  );
}
