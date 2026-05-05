'use client';

import { googleMapsUrlNearbyFrame } from '@/lib/google-maps-nearby-url';

type Props = {
  lat: string | null;
  lng: string | null;
  /** รัศมีกิโลเมตร — ใช้คำนวณระดับซูมให้กรอบประมาณวงนี้ */
  radiusKm: number;
  className?: string;
  title?: string;
  children: React.ReactNode;
};

/**
 * ลิงก์ไป Google Maps โดยซูมให้เห็นประมาณรัศมีรอบจุด (consumer Maps ไม่รองรับ polygon/KML จาก URL)
 */
export default function GoogleMapsNearbyLink({
  lat,
  lng,
  radiusKm,
  className,
  title = 'เปิด Google Maps ทันที (หมุด + ซูมประมาณรัศมี)',
  children,
}: Props) {
  if (lat == null || lng == null) return null;

  const href = googleMapsUrlNearbyFrame(lat, lng, radiusKm);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
    >
      {children}
    </a>
  );
}
