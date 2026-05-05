'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinSolidIcon } from '@heroicons/react/24/solid';
import { isTrustedGoogleMyMapUrl } from '@/lib/trusted-google-mymap-url';
import { NEARBY_PLACES_RADIUS_KM } from '@/lib/nearby-constants';
import type { ExploreStation } from '@/lib/route-explore';
import GoogleMapsNearbyLink from '@/app/components/explore/GoogleMapsNearbyLink';

type Props = {
  userFirstName: string;
  stations: ExploreStation[];
};

export default function HomeExplore({ userFirstName, stations }: Props) {
  const totalPlaces = useMemo(
    () => stations.reduce((n, s) => n + s.places.length, 0),
    [stations]
  );
  const [expandedStationIds, setExpandedStationIds] = useState<number[]>([]);

  const toggleStation = (stationId: number) => {
    setExpandedStationIds((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  return (
    <div className="min-h-screen bg-[#fef5f5] text-stone-900 pb-6">
      <header className="relative overflow-hidden border-b border-red-950/20 bg-gradient-to-br from-[#450a0a] via-[#7f1d1d] to-[#991b1b] px-4 pb-10 pt-8 text-white shadow-md">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-rose-400/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-64 rounded-full bg-red-300/15 blur-2xl"
          aria-hidden
        />
        <p className="relative text-xs font-medium uppercase tracking-[0.2em] text-red-200/90">
          เส้นทางแนะนำ
        </p>
        <h1 className="relative mt-2 font-serif text-2xl font-semibold leading-tight sm:text-3xl">
          ธนบุรี — น้ำตก
        </h1>
        <p className="relative mt-2 max-w-xl text-sm leading-relaxed text-red-100/90">
          สวัสดี {userFirstName} แตะที่สถานีเพื่อดูสถานที่ท่องเที่ยวและรีวิวจากผู้เดินทาง
        </p>
        <dl className="relative mt-6 flex flex-wrap gap-4 text-sm">
          <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
            <dt className="text-red-200/80">สถานี</dt>
            <dd className="text-lg font-semibold tabular-nums">{stations.length}</dd>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
            <dt className="text-red-200/80">จุดแนะนำ</dt>
            <dd className="text-lg font-semibold tabular-nums">{totalPlaces}</dd>
          </div>
        </dl>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {stations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-8 text-center text-stone-600">
            <p className="font-medium text-stone-800">ยังไม่มีข้อมูลสถานี</p>
            <p className="mt-2 text-sm">
              เพิ่มแถวในตาราง <code className="rounded bg-stone-100 px-1">stations</code> และ{' '}
              <code className="rounded bg-stone-100 px-1">places</code> ใน PostgreSQL
            </p>
          </div>
        ) : (
          <ol className="relative space-y-0 border-l-2 border-red-800/30 pl-6 sm:pl-8">
            {stations.map((station, idx) => {
              const expanded = expandedStationIds.includes(station.id);
              const previewNames = station.places
                .slice(0, 3)
                .map((p) => p.name)
                .filter(Boolean)
                .join(' · ');
              const hasMyMap =
                station.linkGoogleMymap &&
                isTrustedGoogleMyMapUrl(station.linkGoogleMymap);
              return (
                <li key={station.id} className="relative pb-12 last:pb-0">
                  <span
                    className="absolute -left-[calc(0.5rem+5px)] top-1 flex h-3 w-3 -translate-x-1/2 rounded-full border-2 border-red-900/50 bg-red-500 shadow sm:-left-[calc(1rem+5px)]"
                    aria-hidden
                  />
                  <article className="relative rounded-2xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-black/5">
                    {hasMyMap && station.linkGoogleMymap && (
                      <a
                        href={station.linkGoogleMymap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-2 z-10 rounded-full bg-white/95 p-2 text-red-700 shadow-sm ring-1 ring-stone-200/90 transition hover:bg-red-50 hover:text-red-800"
                        aria-label="เปิด Google My Map ของสถานีนี้"
                        title="Google My Map"
                      >
                        <MapPinSolidIcon className="h-6 w-6" aria-hidden />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleStation(station.id)}
                      className={`flex w-full flex-col gap-3 border-b border-stone-100 p-4 text-left transition hover:bg-red-50/40 sm:flex-row sm:items-start sm:justify-between ${hasMyMap ? 'pr-12 sm:pr-12' : ''}`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-900">
                            ลำดับ {station.sequence ?? idx + 1}
                          </span>
                          {station.arrivalTime && station.departureTime && (
                            <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                              <ClockIcon className="h-3.5 w-3.5" />
                              {station.arrivalTime} – {station.departureTime}
                            </span>
                          )}
                        </div>
                        <h2 className="mt-2 font-serif text-xl font-semibold text-stone-900">
                          {station.name ?? 'สถานี'}
                        </h2>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-red-800">
                        {expanded ? 'ซ่อนรายชื่อสถานที่' : 'คลิกเพื่อดูรายชื่อสถานที่'}
                        <ChevronRightIcon
                          className={`h-3.5 w-3.5 transition ${expanded ? 'rotate-90' : ''}`}
                        />
                      </span>
                    </button>

                    <div className="p-4">
                      {station.places.length === 0 ? (
                        <p className="text-sm text-stone-500">ยังไม่มีสถานที่แนะนำสำหรับสถานีนี้</p>
                      ) : (
                        <div className="space-y-3">
                          {previewNames && (
                            <p className="text-sm leading-relaxed text-stone-600">
                              <span className="font-medium text-stone-700">ตัวอย่าง: </span>
                              {previewNames}
                              {station.places.length > 3 ? ' …' : ''}
                            </p>
                          )}
                          {expanded && (
                            <ul className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-sm text-stone-700">
                              {station.places.map((place) => (
                                <li key={place.id} className="flex items-center justify-between gap-3 py-1">
                                  <Link
                                    href={`/stations/${station.id}#place-${place.id}`}
                                    className="min-w-0 truncate hover:text-red-800 hover:underline"
                                  >
                                    {place.name ?? 'สถานที่'}
                                  </Link>
                                  {place.latitude != null && place.longitude != null && (
                                    <GoogleMapsNearbyLink
                                      lat={place.latitude}
                                      lng={place.longitude}
                                      radiusKm={NEARBY_PLACES_RADIUS_KM}
                                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                                      title="เปิด Google Maps ทันที"
                                    >
                                      <MapPinIcon className="h-3.5 w-3.5 text-red-800" />
                                      แมพ
                                    </GoogleMapsNearbyLink>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/stations/${station.id}`}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
                            >
                              เข้าชมสถานที่ท่องเที่ยวและรีวิว
                              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
                                {station.places.length} แห่ง
                              </span>
                              <ChevronRightIcon className="h-4 w-4 opacity-90" />
                            </Link>
                            {/* {(placesMaps ?? stationMaps) && (
                              <a
                                href={placesMaps ?? stationMaps ?? '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                              >
                                <MapPinIcon className="h-4 w-4 text-red-800" />
                                เปิดแมพสถานที่ท่องเที่ยว
                              </a>
                            )} */}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
