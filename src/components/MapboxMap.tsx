"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export const MAP_STYLE = "mapbox://styles/kastech/cmhsf9202002s01s9h22ndwoe";

export interface MapboxMapProps {
  /** Initial camera center, as [lng, lat]. */
  center: [number, number];
  zoom?: number;
  style?: string;
  /** Disables all built-in pan/zoom/rotate handlers. Defaults to true. */
  interactive?: boolean;
  projection?: "globe" | "mercator";
  /** Enables atmosphere fog once the style loads (only meaningful with projection="globe"). */
  fog?: boolean;
  navigationControl?: boolean;
  className?: string;
  /** Fired once, after the map's "load" event, with the live map instance. */
  onLoad?: (map: mapboxgl.Map) => void;
  onClick?: (e: mapboxgl.MapMouseEvent, map: mapboxgl.Map) => void;
  onError?: (message: string) => void;
}

/**
 * Shared Mapbox GL lifecycle shell: creates the map once, wires up resize
 * handling/cleanup, and hands the live instance back via onLoad so callers
 * can add their own markers/sources/layers imperatively.
 */
export default function MapboxMap({
  center,
  zoom = 12,
  style = MAP_STYLE,
  interactive = true,
  projection,
  fog = false,
  navigationControl = false,
  className = "w-full h-full",
  onLoad,
  onClick,
  onError,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Refs so the effect below can stay mount-only while callers still get
  // up-to-date closures for their event handlers.
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    if (!mapboxgl.accessToken) {
      onErrorRef.current?.("Missing NEXT_PUBLIC_MAPBOX_TOKEN.");
      return;
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      interactive,
      projection,
    });

    if (navigationControl) {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    map.on("load", () => {
      if (fog) map.setFog({});
      requestAnimationFrame(() => map.resize());
      onLoadRef.current?.(map);
    });

    map.on("error", (e) => {
      console.error("Mapbox error:", e.error);
      onErrorRef.current?.(e.error?.message ?? "Unknown map error.");
    });

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      onClickRef.current?.(e, map);
    };
    map.on("click", handleClick);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.off("click", handleClick);
      map.remove();
      mapRef.current = null;
    };
    // Intentionally mount-only: center/zoom/style are read once here. Callers
    // that need to move the camera after mount should key the component or
    // call the instance handed to them via onLoad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={className} />;
}
