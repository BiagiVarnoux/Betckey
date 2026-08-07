'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export type MapLocation = {
  lat: number;
  lng: number;
  address: string;
};

type Props = {
  value: MapLocation | null;
  onChange: (loc: MapLocation) => void;
  city?: string; // ciudad inicial para centrar el mapa
};

// Departamentos de Bolivia con sus coordenadas
const BOLIVIA_CITIES: Record<string, [number, number]> = {
  'Santa Cruz':    [-17.7833, -63.1822],
  'La Paz':        [-16.5000, -68.1500],
  'Cochabamba':    [-17.3895, -66.1568],
  'Oruro':         [-17.9833, -67.1500],
  'Potosí':        [-19.5836, -65.7531],
  'Sucre':         [-19.0431, -65.2591],
  'Tarija':        [-21.5355, -64.7296],
  'Trinidad':      [-14.8333, -64.9000],
  'Cobija':        [-11.0333, -68.7667],
};

const DEFAULT_CENTER: [number, number] = [-17.7833, -63.1822]; // Santa Cruz

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
      { headers: { 'User-Agent': 'BetckeyBolivia/1.0' } },
    );
    const data = await res.json();
    // Armar dirección corta
    const r = data.address ?? {};
    const parts = [
      r.road ?? r.pedestrian ?? r.footway,
      r.house_number,
      r.suburb ?? r.neighbourhood ?? r.quarter,
      r.city ?? r.town ?? r.village ?? r.county,
    ].filter(Boolean);
    return parts.length ? parts.join(', ') + ', Bolivia' : data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export default function MapPicker({ value, onChange, city }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Cargar CSS de Leaflet dinámicamente
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      if (!mapRef.current || leafletMap.current) return;

      // Centro inicial: ciudad seleccionada o Santa Cruz
      const center = (city && BOLIVIA_CITIES[city]) ? BOLIVIA_CITIES[city] : DEFAULT_CENTER;

      const map = L.map(mapRef.current, {
        center,
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Ícono personalizado
      const icon = L.divIcon({
        html: `<div style="background:#ef4444;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: '',
      });

      // Marcador inicial si ya hay valor
      if (value) {
        const m = L.marker([value.lat, value.lng], { icon, draggable: true }).addTo(map);
        map.setView([value.lat, value.lng], 15);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (m as any).on('dragend', async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pos = (m as any).getLatLng();
          setLoading(true);
          const address = await reverseGeocode(pos.lat, pos.lng);
          onChange({ lat: pos.lat, lng: pos.lng, address });
          setLoading(false);
        });
        markerRef.current = m;
      }

      // Click en el mapa
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).on('click', async (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        setLoading(true);

        // Actualizar o crear marcador
        if (markerRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (markerRef.current as any).setLatLng([lat, lng]);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const m = (L as any).marker([lat, lng], { icon, draggable: true }).addTo(map);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (m as any).on('dragend', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pos = (m as any).getLatLng();
            setLoading(true);
            const addr = await reverseGeocode(pos.lat, pos.lng);
            onChange({ lat: pos.lat, lng: pos.lng, address: addr });
            setLoading(false);
          });
          markerRef.current = m;
        }

        const address = await reverseGeocode(lat, lng);
        onChange({ lat, lng, address });
        setLoading(false);
      });

      leafletMap.current = map;
      setMapReady(true);
    });

    return () => {
      if (leafletMap.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (leafletMap.current as any).remove();
        leafletMap.current = null;
        markerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar centro cuando cambia la ciudad
  useEffect(() => {
    if (!leafletMap.current || !city) return;
    const coords = BOLIVIA_CITIES[city];
    if (coords) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (leafletMap.current as any).setView(coords, 14);
    }
  }, [city]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500">Hacé clic en el mapa para marcar tu ubicación exacta. También podés arrastrar el marcador.</p>
      <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 240 }}>
        <div ref={mapRef} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        )}
      </div>
      {value ? (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          {loading ? (
            <Loader2 size={14} className="text-blue-500 animate-spin mt-0.5 shrink-0" />
          ) : (
            <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
          )}
          <p className="text-sm text-blue-800 leading-snug">{loading ? 'Obteniendo dirección...' : value.address}</p>
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center">Ninguna ubicación seleccionada</p>
      )}
    </div>
  );
}
