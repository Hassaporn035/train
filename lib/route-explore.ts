import { pool } from '@/lib/db';
import { haversineKm, parseCoord } from '@/lib/geo';
import {
  NEARBY_PLACES_MIN_RADIUS_KM,
  NEARBY_PLACES_RADIUS_KM,
} from '@/lib/nearby-constants';

export { NEARBY_PLACES_MIN_RADIUS_KM, NEARBY_PLACES_RADIUS_KM } from '@/lib/nearby-constants';

export type NearbyPlaceSummary = {
  id: number;
  name: string | null;
  distanceKm: number;
  stationId: number | null;
  stationName: string | null;
  latitude: number;
  longitude: number;
};

export type ExplorePlace = {
  id: number;
  name: string | null;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  imageUrl: string | null;
  /** สถานที่อื่นที่อยู่ในรัศมี (เรียงจากใกล้ไปไกล) — เติมจาก enrichStationPlacesWithNearby */
  nearby?: NearbyPlaceSummary[];
};

export type ExploreStation = {
  id: number;
  name: string | null;
  sequence: number | null;
  latitude: string | null;
  longitude: string | null;
  arrivalTime: string | null;
  departureTime: string | null;
  imageUrl: string | null;
  /** ลิงก์ Google My Maps จากคอลัมน์ link_google_mymap */
  linkGoogleMymap: string | null;
  places: ExplorePlace[];
};

function bufferToDataUrl(buf: unknown): string | null {
  if (!buf || !(buf instanceof Buffer) || buf.length === 0) return null;
  const isPng =
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const mime = isPng ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function formatTime(t: unknown): string | null {
  if (t == null) return null;
  const s = typeof t === 'string' ? t : String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

function numToString(v: unknown): string | null {
  if (v == null) return null;
  return String(v);
}

function nullableLink(v: unknown): string | null {
  if (v == null) return null;
  const s = typeof v === 'string' ? v.trim() : String(v).trim();
  return s.length > 0 ? s : null;
}

type StationRow = {
  id: number;
  name: string | null;
  sequence: number | null;
  latitude: unknown;
  longitude: unknown;
  arrival_time: unknown;
  departure_time: unknown;
  image: Buffer | null;
  link_google_mymap: string | null;
};

type PlaceRow = {
  id: number;
  name: string | null;
  description: string | null;
  latitude: unknown;
  longitude: unknown;
  station_id: number | null;
  image: Buffer | null;
};

export async function getStationsWithPlaces(): Promise<ExploreStation[]> {
  const stationRes = await pool.query(`
    SELECT id, name, sequence, latitude, longitude, arrival_time, departure_time, image, link_google_mymap
    FROM stations
    ORDER BY sequence ASC NULLS LAST, id ASC
  `);
  const stations = stationRes.rows as StationRow[];

  const placeRes = await pool.query(`
    SELECT id, name, description, latitude, longitude, station_id, image
    FROM places
    ORDER BY id ASC
  `);
  const places = placeRes.rows as PlaceRow[];

  const byStation = new Map<number, PlaceRow[]>();
  for (const p of places) {
    const sid = p.station_id;
    if (sid == null) continue;
    if (!byStation.has(sid)) byStation.set(sid, []);
    byStation.get(sid)!.push(p);
  }

  return stations.map((s) => ({
    id: s.id,
    name: s.name,
    sequence: s.sequence,
    latitude: numToString(s.latitude),
    longitude: numToString(s.longitude),
    arrivalTime: formatTime(s.arrival_time),
    departureTime: formatTime(s.departure_time),
    imageUrl: bufferToDataUrl(s.image),
    linkGoogleMymap: nullableLink(s.link_google_mymap),
    places: (byStation.get(s.id) || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      latitude: numToString(p.latitude),
      longitude: numToString(p.longitude),
      imageUrl: bufferToDataUrl(p.image),
    })),
  }));
}

export async function getFavoritePlaceIds(userId: number): Promise<number[]> {
  try {
    const { rows } = await pool.query(
      `SELECT place_id FROM user_favorite_places WHERE user_id = $1`,
      [userId]
    );
    return (rows as { place_id: number }[]).map((r) => r.place_id);
  } catch {
    return [];
  }
}

export type FavoritePlaceRow = ExplorePlace & {
  stationId: number | null;
  stationName: string | null;
  stationSequence: number | null;
};

type FavoriteJoinRow = {
  id: number;
  name: string | null;
  description: string | null;
  latitude: unknown;
  longitude: unknown;
  image: Buffer | null;
  station_id: number | null;
  station_name: string | null;
  station_sequence: number | null;
};

export async function getFavoritePlacesForUser(
  userId: number
): Promise<FavoritePlaceRow[]> {
  const { rows } = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.latitude,
      p.longitude,
      p.image,
      p.station_id,
      s.name AS station_name,
      s.sequence AS station_sequence
    FROM user_favorite_places f
    JOIN places p ON p.id = f.place_id
    LEFT JOIN stations s ON s.id = p.station_id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC
    `,
    [userId]
  );

  return (rows as FavoriteJoinRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    latitude: numToString(r.latitude),
    longitude: numToString(r.longitude),
    imageUrl: bufferToDataUrl(r.image),
    stationId: r.station_id,
    stationName: r.station_name,
    stationSequence: r.station_sequence,
  }));
}

export async function getStationById(stationId: number): Promise<ExploreStation | null> {
  const stationRes = await pool.query(
    `
    SELECT id, name, sequence, latitude, longitude, arrival_time, departure_time, image, link_google_mymap
    FROM stations
    WHERE id = $1
    `,
    [stationId]
  );
  const rows = stationRes.rows as StationRow[];
  if (rows.length === 0) return null;
  const s = rows[0];

  const placeRes = await pool.query(
    `
    SELECT id, name, description, latitude, longitude, station_id, image
    FROM places
    WHERE station_id = $1
    ORDER BY id ASC
    `,
    [stationId]
  );
  const places = placeRes.rows as PlaceRow[];

  return {
    id: s.id,
    name: s.name,
    sequence: s.sequence,
    latitude: numToString(s.latitude),
    longitude: numToString(s.longitude),
    arrivalTime: formatTime(s.arrival_time),
    departureTime: formatTime(s.departure_time),
    imageUrl: bufferToDataUrl(s.image),
    linkGoogleMymap: nullableLink(s.link_google_mymap),
    places: places.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      latitude: numToString(p.latitude),
      longitude: numToString(p.longitude),
      imageUrl: bufferToDataUrl(p.image),
    })),
  };
}

type PlaceCoordRow = {
  id: number;
  name: string | null;
  latitude: unknown;
  longitude: unknown;
  station_id: number | null;
  station_name: string | null;
};

/** พิกัดทุกสถานที่ (มีชื่อสถานี) สำหรับคำนวณใกล้เคียง */
export async function getPlacesCoordsForNearby(): Promise<
  Array<{
    id: number;
    name: string | null;
    lat: number;
    lng: number;
    stationId: number | null;
    stationName: string | null;
  }>
> {
  const { rows } = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.latitude,
      p.longitude,
      p.station_id,
      s.name AS station_name
    FROM places p
    LEFT JOIN stations s ON s.id = p.station_id
    WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
    `
  );
  const out: Array<{
    id: number;
    name: string | null;
    lat: number;
    lng: number;
    stationId: number | null;
    stationName: string | null;
  }> = [];
  for (const r of rows as PlaceCoordRow[]) {
    const lat = parseCoord(numToString(r.latitude));
    const lng = parseCoord(numToString(r.longitude));
    if (lat == null || lng == null) continue;
    out.push({
      id: r.id,
      name: r.name,
      lat,
      lng,
      stationId: r.station_id,
      stationName: r.station_name,
    });
  }
  return out;
}

export function enrichStationPlacesWithNearby(
  station: ExploreStation,
  allCoords: Awaited<ReturnType<typeof getPlacesCoordsForNearby>>,
  radiusKm: number = NEARBY_PLACES_RADIUS_KM
): ExploreStation {
  const minRadiusKm = NEARBY_PLACES_MIN_RADIUS_KM;
  const maxList = 12;
  return {
    ...station,
    places: station.places.map((place) => {
      const lat = parseCoord(place.latitude);
      const lng = parseCoord(place.longitude);
      if (lat == null || lng == null) {
        return { ...place, nearby: [] };
      }
      const nearby: NearbyPlaceSummary[] = [];
      for (const o of allCoords) {
        if (o.id === place.id) continue;
        const d = haversineKm(lat, lng, o.lat, o.lng);
        if (d >= minRadiusKm && d <= radiusKm) {
          nearby.push({
            id: o.id,
            name: o.name,
            distanceKm: Math.round(d * 10) / 10,
            stationId: o.stationId,
            stationName: o.stationName,
            latitude: o.lat,
            longitude: o.lng,
          });
        }
      }
      nearby.sort((a, b) => a.distanceKm - b.distanceKm);
      return { ...place, nearby: nearby.slice(0, maxList) };
    }),
  };
}

export type PlaceReview = {
  id: number;
  placeId: number;
  userId: number;
  reviewerLabel: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type ReviewRow = {
  id: number;
  place_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: Date | string;
  user_name: string | null;
  user_surname: string | null;
};

function mapReviewRow(r: ReviewRow): PlaceReview {
  const name = (r.user_name ?? '').trim();
  const sur = (r.user_surname ?? '').trim();
  const reviewerLabel = [name, sur].filter(Boolean).join(' ') || 'ผู้ใช้';
  const createdAt =
    r.created_at instanceof Date
      ? r.created_at.toISOString()
      : String(r.created_at);
  return {
    id: r.id,
    placeId: r.place_id,
    userId: r.user_id,
    reviewerLabel,
    rating: r.rating,
    comment: r.comment,
    createdAt,
  };
}

export async function getReviewsForPlaceIds(placeIds: number[]): Promise<PlaceReview[]> {
  if (placeIds.length === 0) return [];
  try {
    const { rows } = await pool.query(
      `
      SELECT
        r.id,
        r.place_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name,
        u.surname AS user_surname
      FROM place_reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.place_id = ANY($1::int[])
      ORDER BY r.place_id ASC, r.created_at DESC
      `,
      [placeIds]
    );
    return (rows as ReviewRow[]).map(mapReviewRow);
  } catch {
    return [];
  }
}

export function groupReviewsByPlaceId(
  reviews: PlaceReview[]
): Record<string, PlaceReview[]> {
  const out: Record<string, PlaceReview[]> = {};
  for (const r of reviews) {
    const k = String(r.placeId);
    if (!out[k]) out[k] = [];
    out[k].push(r);
  }
  return out;
}
