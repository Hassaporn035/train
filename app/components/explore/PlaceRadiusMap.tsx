'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type NeighborPin = {
  id: number;
  lat: number;
  lng: number;
  name: string | null;
};

type Props = {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  neighbors: NeighborPin[];
  /** เปลี่ยนเมื่อรายการใกล้เคียงเปลี่ยน — ใช้กระตุ้น useEffect โดยไม่พึ่ง reference ของ array */
  neighborsKey: string;
  centerLabel?: string | null;
};

/**
 * แผนที่ OSM + วงกลมรัศมี (เมตร) รอบจุดกลาง + หมุดจุดใกล้เคียง
 */
export default function PlaceRadiusMap({
  centerLat,
  centerLng,
  radiusKm,
  neighbors,
  neighborsKey,
  centerLabel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const neighborsRef = useRef(neighbors);
  neighborsRef.current = neighbors;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let map: L.Map | null = null;
    let cancelled = false;
    let rafStart = 0;
    let rafFit = 0;

    const cleanup = () => {
      cancelled = true;
      cancelAnimationFrame(rafStart);
      cancelAnimationFrame(rafFit);
      if (map) {
        try {
          map.remove();
        } catch {
          /* หลุดจากสถานะ DOM / Strict mode */
        }
        map = null;
      }
    };

    // รอ layout ให้คอนเทนเนอร์มีขนาดก่อนสร้างแผนที่ (กัน projection ยังไม่พร้อม → getBounds พัง)
    rafStart = requestAnimationFrame(() => {
      if (cancelled || !containerRef.current) return;
      const node = containerRef.current;

      map = L.map(node, {
        zoomControl: true,
        scrollWheelZoom: false,
        preferCanvas: false,
      }).setView([centerLat, centerLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const radiusM = Math.max(radiusKm * 1000, 200);

      const circle = L.circle([centerLat, centerLng], {
        radius: radiusM,
        color: '#b91c1c',
        weight: 2,
        fillColor: '#fca5a5',
        fillOpacity: 0.22,
      }).addTo(map);

      L.circleMarker([centerLat, centerLng], {
        radius: 9,
        color: '#7f1d1d',
        fillColor: '#ef4444',
        fillOpacity: 1,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(centerLabel ?? 'จุดนี้');

      for (const n of neighborsRef.current) {
        L.circleMarker([n.lat, n.lng], {
          radius: 6,
          color: '#334155',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(n.name ?? 'สถานที่ใกล้เคียง');
      }

      const tryFit = () => {
        if (cancelled || !map) return;
        try {
          map.invalidateSize(true);
          const b = circle.getBounds();
          if (b && typeof b.isValid === 'function' && b.isValid()) {
            map.fitBounds(b, { padding: [28, 28] });
          } else {
            map.setView([centerLat, centerLng], 12);
          }
        } catch {
          map.setView([centerLat, centerLng], 12);
        }
      };

      map.whenReady(() => {
        if (cancelled || !map) return;
        rafFit = requestAnimationFrame(() => {
          if (cancelled || !map) return;
          tryFit();
        });
      });
    });

    return cleanup;
  }, [centerLat, centerLng, radiusKm, neighborsKey, centerLabel]);

  return (
    <div
      ref={containerRef}
      className="relative z-0 h-56 w-full min-h-[14rem] overflow-hidden rounded-xl border border-red-200/80 bg-stone-100 shadow-inner sm:h-64 sm:min-h-[16rem]"
      aria-label={`แผนที่รัศมี ${radiusKm} กิโลเมตรรอบจุดนี้`}
    />
  );
}
