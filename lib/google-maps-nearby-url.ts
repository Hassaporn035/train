/**
 * ลิงก์เปิด Google Maps / แอปแผนที่ทันที (หมุด + ซูมประมาณรัศมี)
 * ใช้ q + ll + z — รูปแบบที่มือถือมักส่งต่อเข้าแอป Google Maps ได้ดี
 */

const EARTH_M_PER_PX_BASE = 156543.03392804097;
const REF_MAP_WIDTH_PX = 480;

function zoomLevelForRadiusMeters(latDeg: number, radiusM: number): number {
  const latRad = (latDeg * Math.PI) / 180;
  const cosLat = Math.max(1e-5, Math.cos(latRad));
  const diameterWithPadding = 2 * radiusM * 1.35;
  const metersPerPixel = diameterWithPadding / REF_MAP_WIDTH_PX;
  const raw = Math.log2((EARTH_M_PER_PX_BASE * cosLat) / metersPerPixel);
  return Math.min(18, Math.max(11, Math.round(raw)));
}

function parseCoord(s: string): number | null {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * เปิดแผนที่ทันที: หมุดที่พิกัด + ระดับซูมให้กรอบประมาณ 2×รัศมี
 */
export function googleMapsUrlNearbyFrame(
  lat: string,
  lng: string,
  radiusKm: number
): string {
  const latN = parseCoord(lat);
  const lngN = parseCoord(lng);
  if (latN == null || lngN == null) {
    return googleMapsUrlPinOnly(lat, lng);
  }
  if (latN < -90 || latN > 90 || lngN < -180 || lngN > 180) {
    return googleMapsUrlPinOnly(lat, lng);
  }
  const rKm = Number.isFinite(radiusKm) && radiusKm > 0 ? radiusKm : 1;
  const radiusM = Math.min(Math.max(rKm, 0.05), 50) * 1000;
  const z = zoomLevelForRadiusMeters(latN, radiusM);
  const q = encodeURIComponent(`${latN},${lngN}`);
  return `https://www.google.com/maps?q=${q}&ll=${latN},${lngN}&z=${z}`;
}

/** สำรอง — ค้นหาตามพิกัด (Maps URLs อย่างเป็นทางการ) */
export function googleMapsUrlPinOnly(lat: string, lng: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}
