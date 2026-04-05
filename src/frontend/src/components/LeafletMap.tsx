import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

interface MapMarker {
  lat: number;
  lng: number;
  color?: string;
  label?: string;
}

interface Props {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routePoints?: [number, number][];
  className?: string;
  style?: CSSProperties;
}

declare global {
  interface Window {
    L: LeafletLib;
  }
}

interface LeafletLib {
  map: (el: HTMLElement, opts?: object) => LeafletMap;
  tileLayer: (
    url: string,
    opts?: object,
  ) => { addTo: (map: LeafletMap) => void };
  marker: (latlng: [number, number], opts?: object) => LeafletMarker;
  polyline: (
    latlngs: [number, number][],
    opts?: object,
  ) => { addTo: (map: LeafletMap) => void };
  divIcon: (opts?: object) => object;
}

interface LeafletMap {
  setView: (center: [number, number], zoom: number) => LeafletMap;
  addLayer: (layer: object) => LeafletMap;
  remove: () => void;
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (text: string) => LeafletMarker;
}

export default function LeafletMap({
  center = [17.385, 78.487],
  zoom = 12,
  markers = [],
  routePoints,
  className = "",
  style,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let mounted = true;

    const initMap = () => {
      if (!mapRef.current || !mounted || !window.L) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = window.L;
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add markers
      for (const marker of markers) {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 28px; height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${marker.color || "#2ECC71"};
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        `;
        const icon = L.divIcon({
          html: el.outerHTML,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        });
        L.marker([marker.lat, marker.lng], { icon })
          .addTo(map)
          .bindPopup(marker.label || "");
      }

      // Add route polyline
      if (routePoints && routePoints.length > 1) {
        L.polyline(routePoints, {
          color: "#2ECC71",
          weight: 4,
          opacity: 0.85,
          dashArray: "8, 4",
        }).addTo(map);
      }

      mapInstanceRef.current = map;
    };

    const loadLeaflet = () => {
      if (window.L) {
        initMap();
        return;
      }

      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        if (mounted) initMap();
      };
      document.head.appendChild(script);
    };

    loadLeaflet();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers, routePoints]);

  return (
    <div
      ref={mapRef}
      data-ocid="map.canvas_target"
      className={className}
      style={{ minHeight: "200px", ...style }}
    />
  );
}
