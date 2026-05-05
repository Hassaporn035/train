'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  HeartIcon,
  ChevronRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { MapIcon } from '@heroicons/react/24/solid';
import { isTrustedGoogleMyMapUrl } from '@/lib/trusted-google-mymap-url';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import type { ExplorePlace, ExploreStation, PlaceReview } from '@/lib/route-explore';
import { parseCoord } from '@/lib/geo';
import GoogleMapsNearbyLink from './GoogleMapsNearbyLink';

const PlaceRadiusMap = dynamic(() => import('./PlaceRadiusMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full items-center justify-center rounded-xl border border-red-200/60 bg-stone-100 text-xs text-stone-500 sm:h-64">
      กำลังโหลดแผนที่…
    </div>
  ),
});

type Props = {
  station: ExploreStation;
  reviewsByPlaceId: Record<string, PlaceReview[]>;
  currentUserId: number;
  initialFavoriteIds: number[];
  /** รัศมีคำนวณ “ใกล้เคียง” (กม.) — ต้องตรงกับค่าที่ใช้ enrich บนเซิร์ฟเวอร์ */
  nearbyRadiusKm: number;
};

function reviewsFor(
  byId: Record<string, PlaceReview[]>,
  placeId: number
): PlaceReview[] {
  return byId[String(placeId)] ?? [];
}

function StarsDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} จาก 5 ดาว`}>
      {[1, 2, 3, 4, 5].map((n) =>
        n <= rating ? (
          <StarSolid key={n} className="h-4 w-4 text-red-500" />
        ) : (
          <StarIcon key={n} className="h-4 w-4 text-stone-300" />
        )
      )}
    </span>
  );
}

function ReviewForm({
  placeId,
  existingMine,
  onDone,
}: {
  placeId: number;
  existingMine: PlaceReview | undefined;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(existingMine?.rating ?? 5);
  const [comment, setComment] = useState(existingMine?.comment ?? '');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setRating(existingMine?.rating ?? 5);
    setComment(existingMine?.comment ?? '');
  }, [existingMine?.id, existingMine?.rating, existingMine?.comment]);

  const submit = async () => {
    setSending(true);
    setErr(null);
    try {
      const res = await fetch(`/api/places/${placeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === 'string' ? data.error : 'บันทึกไม่สำเร็จ');
        return;
      }
      onDone();
    } catch {
      setErr('เครือข่ายผิดพลาด');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-red-900/15 bg-red-50/60 p-4">
      <h4 className="text-sm font-semibold text-red-950">เขียนรีวิว</h4>
      {existingMine && (
        <p className="mt-1 text-xs text-red-800/80">
          คุณเคยรีวิวแล้ว — ส่งอีกครั้งเพื่ออัปเดตคะแนนหรือข้อความ
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-stone-600">คะแนน</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="rounded p-0.5 transition hover:bg-white/80"
              aria-label={`${n} ดาว`}
            >
              {n <= rating ? (
                <StarSolid className="h-7 w-7 text-red-500" />
              ) : (
                <StarIcon className="h-7 w-7 text-stone-300" />
              )}
            </button>
          ))}
        </div>
      </div>
      <label className="mt-3 block">
        <span className="text-xs text-stone-600">ความคิดเห็น (ไม่บังคับ)</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          className="mt-1 w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-inner outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          placeholder="เล่าประสบการณ์ของคุณที่นี่..."
        />
      </label>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      <button
        type="button"
        disabled={sending}
        onClick={submit}
        className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
      >
        {sending ? 'กำลังส่ง…' : 'ส่งรีวิว'}
      </button>
    </div>
  );
}

function NearbyBlock({
  place,
  stationId,
  radiusKm,
}: {
  place: ExplorePlace;
  stationId: number;
  radiusKm: number;
}) {
  const clat = parseCoord(place.latitude);
  const clng = parseCoord(place.longitude);
  if (clat == null || clng == null) return null;

  const list = place.nearby ?? [];
  const pins = useMemo(
    () =>
      list.map((n) => ({
        id: n.id,
        lat: n.latitude,
        lng: n.longitude,
        name: n.name,
      })),
    [list]
  );
  const neighborsKey = useMemo(
    () => pins.map((p) => `${p.id}:${p.lat},${p.lng}`).join('|'),
    [pins]
  );

  return (
    <div className="border-t border-dashed border-red-200/80 bg-red-50/40 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-red-950">
        <MapPinIcon className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
        แผนที่รัศมีใกล้เคียง 500 ม. ถึง {radiusKm} กม.
      </p>
      <div className="mt-2">
        <PlaceRadiusMap
          centerLat={clat}
          centerLng={clng}
          radiusKm={radiusKm}
          neighbors={pins}
          neighborsKey={neighborsKey}
          centerLabel={place.name}
        />
      </div>
      {list.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {list.map((n) => (
            <li
              key={n.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-red-100/90 bg-white/90 px-2.5 py-2 text-sm"
            >
              <span className="min-w-0">
                {n.stationId === stationId ? (
                  <a
                    href={`#place-${n.id}`}
                    className="font-medium text-red-800 hover:underline"
                  >
                    {n.name ?? 'สถานที่'}
                  </a>
                ) : n.stationId != null ? (
                  <Link
                    href={`/stations/${n.stationId}#place-${n.id}`}
                    className="font-medium text-red-800 hover:underline"
                  >
                    {n.name ?? 'สถานที่'}
                  </Link>
                ) : (
                  <span className="font-medium text-stone-800">{n.name ?? 'สถานที่'}</span>
                )}
                {n.stationId != null && n.stationId !== stationId && n.stationName && (
                  <span className="mt-0.5 block truncate text-xs text-stone-500">
                    สถานี {n.stationName}
                  </span>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-xs font-medium text-stone-500">
                {n.distanceKm} กม.
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-stone-500">
          ยังไม่มีสถานที่อื่นในช่วง 500 ม. ถึง {radiusKm} กม. — แผนที่แสดงขอบเขตการค้นหาเท่านั้น
        </p>
      )}
    </div>
  );
}

export default function StationPlacesClient({
  station,
  reviewsByPlaceId: initialReviewsByPlaceId,
  currentUserId,
  initialFavoriteIds,
  nearbyRadiusKm,
}: Props) {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(initialFavoriteIds));
  const [busyFav, setBusyFav] = useState<number | null>(null);

  const toggleFavorite = useCallback(
    async (placeId: number) => {
      const was = favoriteIds.has(placeId);
      setBusyFav(placeId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (was) next.delete(placeId);
        else next.add(placeId);
        return next;
      });
      try {
        if (was) {
          const res = await fetch(`/api/favorites?placeId=${placeId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error();
        } else {
          const res = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placeId }),
          });
          if (!res.ok) throw new Error();
        }
      } catch {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (was) next.add(placeId);
          else next.delete(placeId);
          return next;
        });
      } finally {
        setBusyFav(null);
      }
    },
    [favoriteIds]
  );

  const onReviewSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fef5f5] pb-6 text-stone-900">
      <div className="border-b border-stone-200 bg-white/90 px-4 py-3 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-red-900 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          กลับเส้นทาง
        </Link>
      </div>

      <header className="relative overflow-hidden border-b border-red-950/20 bg-gradient-to-br from-[#450a0a] via-[#7f1d1d] to-[#991b1b] px-4 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-red-200/90">
            สถานี
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">
            {station.name ?? 'สถานี'}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-red-100/95">
            {station.sequence != null && (
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
                ลำดับ {station.sequence}
              </span>
            )}
            {station.arrivalTime && station.departureTime && (
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {station.arrivalTime} – {station.departureTime}
              </span>
            )}
            {station.latitude != null && station.longitude != null && (
              <GoogleMapsNearbyLink
                lat={station.latitude}
                lng={station.longitude}
                radiusKm={nearbyRadiusKm}
                className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs font-medium hover:bg-white/25"
                title="เปิด Google Maps ทันที (หมุด + ซูมประมาณรัศมี)"
              >
                <MapPinIcon className="h-4 w-4" />
                แผนที่สถานี
              </GoogleMapsNearbyLink>
            )}
            {station.linkGoogleMymap &&
              isTrustedGoogleMyMapUrl(station.linkGoogleMymap) && (
                <a
                  href={station.linkGoogleMymap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs font-medium text-white hover:bg-white/25"
                  aria-label="เปิด Google My Map"
                  title="Google My Map"
                >
                  <MapIcon className="h-4 w-4 text-white" />
                  My Map
                </a>
              )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="font-serif text-lg font-semibold text-stone-900">
          สถานที่ท่องเที่ยว
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          อ่านรีวิวจากผู้เดินทางคนอื่น หรือแชร์ประสบการณ์ของคุณ
        </p>

        {station.places.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white/60 p-6 text-center text-sm text-stone-600">
            ยังไม่มีสถานที่ผูกกับสถานีนี้ในฐานข้อมูล
          </p>
        ) : (
          <ul className="mt-6 space-y-10">
            {station.places.map((place) => {
              const list = reviewsFor(initialReviewsByPlaceId, place.id);
              const mine = list.find((r) => r.userId === currentUserId);
              const fav = favoriteIds.has(place.id);
              const loading = busyFav === place.id;

              return (
                <li
                  id={`place-${place.id}`}
                  key={place.id}
                  className="scroll-mt-24 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row">
                    <div className="relative h-40 shrink-0 overflow-hidden rounded-xl bg-stone-200 sm:h-32 sm:w-40">
                      {place.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={place.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-900/20 to-rose-700/15">
                          <MapPinIcon className="h-12 w-12 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-xl font-semibold text-stone-900">
                          {place.name ?? 'สถานที่'}
                        </h3>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => toggleFavorite(place.id)}
                          className="shrink-0 rounded-full p-1.5 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                          aria-label={fav ? 'เลิกชอบ' : 'เพิ่มในรายการโปรด'}
                        >
                          {fav ? (
                            <HeartSolid className="h-6 w-6" />
                          ) : (
                            <HeartIcon className="h-6 w-6" />
                          )}
                        </button>
                      </div>
                      {place.description && (
                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          {place.description}
                        </p>
                      )}
                      {place.latitude != null && place.longitude != null && (
                        <GoogleMapsNearbyLink
                          lat={place.latitude}
                          lng={place.longitude}
                          radiusKm={nearbyRadiusKm}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-red-800 hover:underline"
                          title="เปิด Google Maps ทันที (หมุด + ซูมประมาณรัศมี)"
                        >
                          เปิดใน Google Maps
                          <ChevronRightIcon className="h-4 w-4" />
                        </GoogleMapsNearbyLink>
                      )}
                    </div>
                  </div>

                  <NearbyBlock
                    place={place}
                    stationId={station.id}
                    radiusKm={nearbyRadiusKm}
                  />

                  <div className="border-t border-stone-100 bg-rose-50/50 px-4 py-4">
                    <h4 className="text-sm font-semibold text-stone-800">
                      รีวิว ({list.length})
                    </h4>
                    {list.length === 0 ? (
                      <p className="mt-2 text-sm text-stone-500">ยังไม่มีรีวิว — เป็นคนแรก!</p>
                    ) : (
                      <ul className="mt-3 space-y-3">
                        {list.map((r) => (
                          <li
                            key={r.id}
                            className="rounded-lg border border-stone-200/80 bg-white px-3 py-2.5 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-medium text-stone-900">
                                {r.reviewerLabel}
                              </span>
                              <StarsDisplay rating={r.rating} />
                            </div>
                            {r.comment && (
                              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                                {r.comment}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-stone-400">
                              {new Date(r.createdAt).toLocaleString('th-TH', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}

                    <ReviewForm
                      placeId={place.id}
                      existingMine={mine}
                      onDone={onReviewSaved}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
