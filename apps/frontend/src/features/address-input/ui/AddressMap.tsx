"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const DEFAULT_STYLE = "mapbox://styles/mapbox/streets-v12";
const DEFAULT_ZOOM = 14;

const ZOOM_BY_TYPE: Record<string, number> = {
  address:  16,
  locality: 13,
  place:    12,
  district: 10,
  region:   7,
  country:  5,
};

function getZoom(featureType?: string) {
  return featureType ? (ZOOM_BY_TYPE[featureType] ?? DEFAULT_ZOOM) : DEFAULT_ZOOM;
}

interface AddressMapProps {
  accessToken: string;
  lat?: number;
  lng?: number;
  showMarker?: boolean;
  featureType?: string;
  language?: string;
  mapStyle?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  className?: string;
}

export function AddressMap({
  accessToken,
  lat,
  lng,
  showMarker = false,
  featureType,
  language,
  mapStyle = DEFAULT_STYLE,
  defaultCenter = [37.618, 55.752],
  defaultZoom = 10,
  className,
}: AddressMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);

  useEffect(() => {
    if (!containerRef.current || !accessToken) return;

    let cancelled = false;

    import("mapbox-gl").then((module) => {
      if (cancelled || !containerRef.current) return;
      const mapboxgl = module.default;
      mapboxgl.accessToken = accessToken;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: mapStyle,
        center: lat != null && lng != null ? [lng, lat] : defaultCenter,
        zoom: lat != null ? getZoom(featureType) : defaultZoom,
      });
      mapRef.current = map;

      if (language) {
        map.on("load", () => map.setLanguage(language));
      }

      if (showMarker && lat != null && lng != null) {
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map);
      }
    });

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat == null || lng == null) return;

    map.flyTo({ center: [lng, lat], zoom: getZoom(featureType) });

    if (!showMarker) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    import("mapbox-gl").then((module) => {
      const mapboxgl = module.default;
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map);
      }
    });
  }, [lat, lng, featureType, showMarker]);

  return <div ref={containerRef} className={className} />;
}
