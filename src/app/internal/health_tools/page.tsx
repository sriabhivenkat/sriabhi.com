"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import DashNav from "@/components/DashNav";
import { Route, Trash2, Save, Heart, Activity, Moon, Footprints, Brush, Undo2, MapPin, Waypoints, Timer, Share } from "lucide-react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const HOME_COORDS: [number, number] = [-73.9438914, 40.7132148];
type LngLat = [number, number];

function Tile({
    className = "",
    title,
    icon,
    subtitle,
    children,
}: {
    className?: string;
    title?: string;
    icon?: React.ReactNode;
    subtitle?: string;
    children?: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-2xl backdrop-blur-xl bg-white/40 border border-white/50
                        shadow-lg p-5 flex flex-col min-h-0 gap-3 ${className}`}
        >
            {title && (
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-[#6B4C51]">{icon}</span>}
                        <h3 className="font-serif-custom text-lg text-[#3D2B2E]">{title}</h3>
                    </div>
                    {subtitle && (
                        <span className="text-xs text-[#6B4C51]">{subtitle}</span>
                    )}
                </div>
            )}
            <div className="flex-1 min-h-0 flex items-center justify-center text-[#6B4C51]/50 text-sm font-serif-custom italic">
                {children ?? "Coming soon"}
            </div>
        </div>
    );
}

function ToolbarButton({
    onClick,
    disabled,
    variant = "outline",
    children,
}: {
    onClick?: () => void;
    disabled?: boolean;
    variant?: "outline" | "filled";
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium
                whitespace-nowrap shrink-0 snap-start transition-all active:scale-95
                disabled:opacity-40 disabled:active:scale-100
                ${variant === "filled"
                    ? "bg-[#3D2B2E] text-[#F4F2F3] hover:bg-[#6B4C51]"
                    : "border border-[#3D2B2E]/30 text-[#3D2B2E] hover:bg-[#3D2B2E]/5"}`}
        >
            {children}
        </button>
    );
}

export default function HealthTools() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [waypoints, setWaypoints] = useState<LngLat[]>([HOME_COORDS]);
    const waypointsRef = useRef<LngLat[]>([HOME_COORDS]);
    const isDrawingRef = useRef(false);
    const [directionsLoading, setDirectionsLoading] = useState(false);
    const [directionsError, setDirectionsError] = useState<string | null>(null);
    const [routeStats, setRouteStats] = useState<{ distance: number; duration: number } | null>(null);
    const [displayDistance, setDisplayDistance] = useState<string>("No route");
    const [displayDuration, setDisplayDuration] = useState<string>("");
    const [activities, setActivities] = useState<any[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [activitiesError, setActivitiesError] = useState<string | null>(null);

    useEffect(() => {
        isDrawingRef.current = isDrawing;
    }, [isDrawing]);

    useEffect(() => {
        waypointsRef.current = waypoints;
    }, [waypoints]);

    const addMarker = useCallback((lngLat: LngLat, index: number) => {
        if (waypointsRef.current.length >= 25) return;
        const marker = new mapboxgl.Marker({ draggable: true, color: "#3D2B2E" })
            .setLngLat(lngLat)
            .addTo(mapRef.current!);

        marker.on("dragend", () => {
            const { lng, lat } = marker.getLngLat();
            setWaypoints((prev) => {
                const updated = [...prev];
                updated[index] = [lng, lat];
                return updated;
            });
        });

        markersRef.current.push(marker);
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded) return;

        const handleClick = (e: mapboxgl.MapMouseEvent) => {
            if (!isDrawingRef.current) return;
            if (waypointsRef.current.length >= 25) return;
            const lngLat: LngLat = [e.lngLat.lng, e.lngLat.lat];
            const nextIndex = waypointsRef.current.length;

            addMarker(lngLat, nextIndex);
            setWaypoints((prev) => [...prev, lngLat]);
        };

        map.on("click", handleClick);
        return () => {
            map.off("click", handleClick);
        };
    }, [mapLoaded, addMarker]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        if (!mapboxgl.accessToken || mapboxgl.accessToken === "undefined") {
            setMapError("Missing NEXT_PUBLIC_MAPBOX_TOKEN — check your env config on this route.");
            return;
        }

        const frame = requestAnimationFrame(() => {
            if (!mapContainerRef.current) return;

            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/kastech/cmhsf9202002s01s9h22ndwoe",
                center: HOME_COORDS,
                zoom: 13.5,
            });

            map.addControl(new mapboxgl.NavigationControl(), "top-right");

            const homePopup = new mapboxgl.Popup({ offset: 25, closeOnClick: false }).setHTML(
                `<div style="font-family: inherit; color: #3D2B2E;">
                    <strong>Home</strong><br/>310 Graham Ave
                </div>`
            );

            map.on("load", () => {
                const homeMarker = new mapboxgl.Marker({ color: "#B45309" })
                    .setLngLat(HOME_COORDS)
                    .setPopup(homePopup)
                    .addTo(map);
                markersRef.current[0] = homeMarker;

                map.addSource("route", {
                    type: "geojson",
                    data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
                });
                map.addLayer({
                    id: "route-line",
                    type: "line",
                    source: "route",
                    layout: { "line-join": "round", "line-cap": "round" },
                    paint: { "line-color": "#2A9D8F", "line-width": 4, "line-opacity": 1 },
                });
                setMapLoaded(true);
            });

            map.on("error", (e) => {
                console.error("Mapbox error:", e.error);
                setMapError(e.error?.message ?? "Unknown map error — check console.");
            });

            const resizeObserver = new ResizeObserver(() => map.resize());
            resizeObserver.observe(mapContainerRef.current);

            mapRef.current = map;
            (map as any)._resizeObserver = resizeObserver;
        });

        return () => {
            cancelAnimationFrame(frame);
            if (mapRef.current) {
                (mapRef.current as any)._resizeObserver?.disconnect();
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const handleClear = () => {
        markersRef.current.slice(1).forEach((m) => m.remove());
        markersRef.current = markersRef.current.slice(0, 1);
        setWaypoints([HOME_COORDS]);
        setRouteStats(null);
        setDirectionsError(null);
        const source = mapRef.current?.getSource("route") as mapboxgl.GeoJSONSource | undefined;
        source?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } });
    };

    const handleUndo = () => {
        if (waypoints.length === 0) return;

        const lastMarker = markersRef.current.pop();
        lastMarker?.remove();

        const updatedWaypoints = waypoints.slice(0, -1);
        setWaypoints(updatedWaypoints);

        if (updatedWaypoints.length < 2) {
            const source = mapRef.current?.getSource("route") as mapboxgl.GeoJSONSource | undefined;
            source?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } });
            setRouteStats(null);
            setDirectionsError(null);
        } else {
            routeMe(updatedWaypoints);
        }
    };

    const routeMe = useCallback(async (points: LngLat[]) => {
        setDirectionsLoading(true);
        setDirectionsError(null);

        try {
            const coordString = points.map(([lng, lat]) => `${lng},${lat}`).join(";");
            const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordString}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok || !data.routes || data.routes.length === 0) {
                throw new Error(data.message || "No route found between these points.");
            }
            const routeGeometry = data.routes[0].geometry;
            const distance = data.routes[0].distance;
            const duration = data.routes[0].duration;

            const source = mapRef.current?.getSource("route") as mapboxgl.GeoJSONSource | undefined;
            source?.setData({ type: "Feature", properties: {}, geometry: routeGeometry });
            setRouteStats({ distance, duration });
        } catch (err: any) {
            console.error("Directions API Error: ", err);
            setDirectionsError(err.message ?? "Failed to fetch route.");
        } finally {
            setDirectionsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!routeStats) {
            setDisplayDistance("No route");
            setDisplayDuration("");
            return;
        }
        const miles = routeStats.distance / 1609.34;
        setDisplayDistance(`${miles.toFixed(2)} mi`);
        const totalMinutes = Math.round(routeStats.duration / 60);
        if (totalMinutes < 60) {
            setDisplayDuration(`${totalMinutes} min`);
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            setDisplayDuration(`${hours}h ${mins}m`);
        }
    }, [routeStats]);

    function buildGoogleMapsUrl(points: LngLat[]): string {
        if (points.length < 2) return "";
        const toLatLng = ([lng, lat]: LngLat) => `${lat},${lng}`;

        const origin = toLatLng(points[0]);
        const destination = toLatLng(points[points.length - 1]);
        const middle = points.slice(1, -1).map(toLatLng).join("|");
        const params = new URLSearchParams({
            api: "1",
            origin,
            destination,
            travelmode: "walking",
        });
        if (middle) params.set("waypoints", middle);
        return `https://www.google.com/maps/dir/?${params.toString()}`;
    }

    useEffect(() => {
        const fetchActivities = async() => {
            setActivitiesLoading(true);
            setActivitiesError(null);
            try {
                // const tokenRes = await fetch("https://www.sriabhi.com/api/strava/token");
                // if (!tokenRes.ok) {
                //     throw new Error(`Failed to fetch Strava token (status ${tokenRes.status})`);
                // }
                // const tokenData = await tokenRes.json();
                // const accessToken = tokenData.access_token;

                // if (!accessToken) {
                //     throw new Error("No access_token found in token response.");
                // }
                const accessToken = "9c23e6367bb2dc0ae5f42ea69ad944c98262a947"

                const activitiesRes = await fetch(
                    "https://www.strava.com/api/v3/athlete/activities?per_page=30",
                    {
                        "headers": { Authorization: `Bearer ${accessToken}` }
                    }
                )
                const activitiesData = await activitiesRes.json()
                console.log("DATA: ", activitiesData)
                setActivities(activitiesData);
            } catch (err: any) {
                console.error("Strava fetch error:", err);
                setActivitiesError(err.message ?? "Failed to load Strava activities.");
            } finally {
                setActivitiesLoading(false);
            }
        }
        fetchActivities()
    }, [])
    return (
        <div className="min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden bg-[#F4F2F3] flex flex-col p-2">
            <DashNav />

            <div className="w-full flex-1 lg:min-h-0 mt-12 lg:mt-12 flex flex-col lg:flex-row gap-4">

                <div className="flex flex-col gap-4 lg:flex-[3] lg:min-h-0">

                    {/* Map card — fixed 75vh on mobile, flex-shared height on desktop */}
                    <div className="h-[75vh] lg:h-auto lg:flex-[3] lg:min-h-0 rounded-2xl overflow-hidden
                            backdrop-blur-xl bg-white/40 border border-white/50
                            shadow-lg flex flex-col shrink-0 lg:shrink"
                    >
                        <div className="shrink-0 flex items-center justify-between px-4 py-3
                                border-b border-white/50 bg-white/20"
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <Route size={16} className="text-[#6B4C51]" />
                                    <h2 className="font-serif-custom text-base text-[#3D2B2E]">Route Map</h2>
                                </div>
                                <div className="flex items-center">
                                    <MapPin size={16} className={`${waypoints.length >= 20 ? "text-red-500" : "text-[#3D2B2E]"} mr-1`} />
                                    <h3 className={`font-serif-custom text-base ${waypoints.length >= 20 ? "text-red-500" : "text-[#3D2B2E]"}`}>{waypoints.length} / 25</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center">
                                        <Waypoints size={16} className="text-[#6B4C51] mr-1" />
                                        <h3 className="font-serif-custom text-base text-[#3D2B2E]">{routeStats ? displayDistance : "No route"}</h3>
                                    </div>
                                    <div className="flex items-center">
                                        <Timer size={16} className="text-[#6B4C51] mr-1" />
                                        <h3 className="font-serif-custom text-base text-[#3D2B2E]">{routeStats ? displayDuration + " to walk" : "No route"}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 min-h-0">
                            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

                            {!mapLoaded && !mapError && (
                                <div className="absolute inset-0 flex items-center justify-center
                                    bg-[#F4F2F3]/60 text-[#3D2B2E] font-serif-custom animate-pulse"
                                >
                                    Loading map...
                                </div>
                            )}

                            {mapError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2
                                    bg-[#F4F2F3]/90 text-[#3D2B2E] font-serif-custom text-center px-6"
                                >
                                    <span className="text-sm font-semibold">Map failed to load</span>
                                    <span className="text-xs text-[#6B4C51]">{mapError}</span>
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2 px-3 py-2
                                border-t border-white/50 bg-white/20
                                overflow-x-auto snap-x snap-mandatory lg:flex-wrap lg:overflow-visible"
                        >
                            <div className="flex items-center gap-2 shrink-0">
                                <ToolbarButton onClick={() => setIsDrawing(!isDrawing)}>
                                    <Brush size={14} /> {isDrawing ? "Stop drawing" : "Draw Route"}
                                </ToolbarButton>

                                {isDrawing && (
                                    <ToolbarButton variant="filled" onClick={() => routeMe(waypoints)}>
                                        <Route size={14} /> Route me!
                                    </ToolbarButton>
                                )}

                                {isDrawing && waypoints.length >= 2 && (
                                    <ToolbarButton onClick={handleUndo}>
                                        <Undo2 size={14} /> Undo
                                    </ToolbarButton>
                                )}

                                <ToolbarButton onClick={handleClear}>
                                    <Trash2 size={14} /> Clear
                                </ToolbarButton>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 lg:ml-auto">
                                <ToolbarButton
                                    disabled={waypoints.length < 2}
                                    onClick={() => window.open(buildGoogleMapsUrl(waypoints), "_blank")}
                                >
                                    <Share size={14} /> Google Maps
                                </ToolbarButton>
                                <ToolbarButton>
                                    <Save size={14} /> Save
                                </ToolbarButton>
                            </div>
                        </div>
                    </div>

                    <Tile className="min-h-[150px] lg:flex-1 lg:min-h-0" title="Strava Data" icon={<Activity size={16} />} />
                </div>

                <div className="flex flex-col gap-4 lg:flex-[2] lg:min-h-0">
                    <Tile className="min-h-[120px] lg:flex-1 lg:min-h-0" title="Trends" icon={<Heart size={16} />} />
                    <Tile className="min-h-[120px] lg:flex-1 lg:min-h-0" title="Exercise Data" icon={<Moon size={16} />} />
                    <Tile className="min-h-[120px] lg:flex-1 lg:min-h-0" title="Steps" icon={<Footprints size={16} />} />
                </div>
            </div>
        </div>
    );
}