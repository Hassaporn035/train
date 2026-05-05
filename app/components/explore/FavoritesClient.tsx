'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPinIcon, HeartIcon as HeartOutline, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { NEARBY_PLACES_RADIUS_KM } from '@/lib/nearby-constants';
import type { FavoritePlaceRow } from '@/lib/route-explore';
import GoogleMapsNearbyLink from '@/app/components/explore/GoogleMapsNearbyLink';

type Props = {
  initialItems: FavoritePlaceRow[];
};

export default function FavoritesClient({ initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const remove = useCallback(
    async (placeId: number) => {
      setRemovingId(placeId);
      try {
        const res = await fetch(`/api/favorites?placeId=${placeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        setItems((prev) => prev.filter((p) => p.id !== placeId));
        router.refresh();
      } catch {
        // keep item; could toast
      } finally {
        setRemovingId(null);
      }
    },
    [router]
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-rose-200/80 bg-white/80 px-6 py-14 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
          <HeartOutline className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="mt-6 font-serif text-xl font-semibold text-stone-900">ยังไม่มีรายการโปรด</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          เปิดหน้าสถานีแล้วกดไอคอนหัวใจที่สถานที่เพื่อเก็บไว้ดูภายหลัง
        </p>
      </div>
    );
  }

  return (
    <ul className="mx-auto max-w-2xl space-y-4">
      {items.map((place) => {
        const loading = removingId === place.id;
        return (
          <li
            key={place.id}
            className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-black/5"
          >
            <div className="flex gap-3 p-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                {place.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={place.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 to-red-50">
                    <HeartSolid className="h-10 w-10 text-rose-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-red-800/80">
                      {place.stationName
                        ? `สถานี · ${place.stationName}`
                        : 'สถานที่แนะนำ'}
                    </p>
                    <h2 className="mt-0.5 font-serif text-lg font-semibold text-stone-900">
                      {place.name ?? 'สถานที่'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => remove(place.id)}
                    className="shrink-0 rounded-full p-2 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                    aria-label="ลบออกจากรายการโปรด"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                {place.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-stone-600">{place.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {place.stationId != null && (
                    <Link
                      href={`/stations/${place.stationId}`}
                      className="text-xs font-medium text-red-900 hover:underline"
                    >
                      ดูสถานีและรีวิว
                    </Link>
                  )}
                  {place.latitude != null && place.longitude != null && (
                    <GoogleMapsNearbyLink
                      lat={place.latitude}
                      lng={place.longitude}
                      radiusKm={NEARBY_PLACES_RADIUS_KM}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-800 hover:underline"
                      title="เปิด Google Maps ทันที"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      Google Maps
                    </GoogleMapsNearbyLink>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
