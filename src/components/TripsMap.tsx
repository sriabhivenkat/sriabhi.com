"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxMap from "./MapboxMap";

export interface Geotag {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapMarker {
  postId: string;
  geotag: Geotag;
}

export default function SimpleMap({
  markers = [],
  onMarkerClick,
  center = [0, 20],
}: {
  markers?: MapMarker[];
  onMarkerClick?: (postId: string) => void;
  center?: Geotag | [number, number];
}) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Clear markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, []);

  // Add markers once the map + style are ready
  useEffect(() => {
    if (!map) return;

    const addMarkers = () => {
      // Clear any existing markers before adding new ones
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      markers.forEach(({ postId, geotag }) => {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", geotag.label || "View post");
        el.className = "cursor-pointer border-0 bg-transparent p-0";

        const dot = document.createElement("div");
        dot.className =
            "h-5 w-5 rounded-full bg-[#3D2B2E] border-2 border-white shadow-md transition-transform duration-150 hover:scale-125";
        el.appendChild(dot);

        if (onMarkerClick) {
            el.addEventListener("click", () => onMarkerClick(postId));
        }

        const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([geotag.lng, geotag.lat])
            .addTo(map);

        markersRef.current.push(marker);
      });
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.once("style.load", addMarkers);
    }
  }, [map, markers, onMarkerClick]);

  return (
    <MapboxMap
      center={Array.isArray(center) ? center : [center.lng, center.lat]}
      zoom={1.8}
      projection="globe"
      fog
      className="w-full h-full rounded-lg"
      onLoad={(m) => {
        setMap(m);
      }}
    />
  );
}
