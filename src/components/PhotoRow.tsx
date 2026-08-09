import React, { useEffect, useState, useRef } from "react";
import { PhotoWithMetadata } from "../../hooks/usePhotoStore";
import mapboxgl from "mapbox-gl";
import Image from "next/image";
type PhotoRowProps = {
  photo: PhotoWithMetadata & { collectionName: string };
  index: number;
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
export default function PhotoRow({ photo, index }: PhotoRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [geotagPoint, setGeotagPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [orientation, setOrientation] = useState<"landscape" | "portrait" | "square" | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const rowKey = `${photo.collectionName}-${photo.url}-${index}`;
  useEffect(() => {
    if (photo.metadata?.description) {
      setDescriptionDraft(photo.metadata.description);
    }
    if (photo.metadata?.geotag) {
      const [lat, lng] = photo.metadata.geotag;
      setGeotagPoint({ lat, lng });
    }
  }, [photo.metadata]);

  const placeMarker = (lngLat: mapboxgl.LngLat, map: mapboxgl.Map) => {
    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ draggable: true, color: "#1B998B" })
        .setLngLat(lngLat)
        .addTo(map);

      markerRef.current.on("dragend", () => {
        const { lng, lat } = markerRef.current!.getLngLat();
        setGeotagPoint({ lat, lng });
      });
    } else {
      markerRef.current.setLngLat(lngLat);
    }
    setGeotagPoint({ lat: lngLat.lat, lng: lngLat.lng });
  };

  // Initialize / tear down the map whenever the panel opens/closes
  useEffect(() => {
    if (isExpanded && mapContainerRef.current && !mapRef.current) {
      const hasExistingGeotag = geotagPoint !== null;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/kastech/cmhsf9202002s01s9h22ndwoe",
        center: hasExistingGeotag ? [geotagPoint!.lng, geotagPoint!.lat] : [-73.9464717, 40.7132148],
        zoom: 12,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      if (hasExistingGeotag) {
        map.on("load", () => {
          placeMarker(new mapboxgl.LngLat(geotagPoint!.lng, geotagPoint!.lat), map);
        });
      }
      // Click anywhere on the map to drop or move the marker there
      map.on("click", (e) => {
        placeMarker(e.lngLat, map);
      });

      // Handles the map mounting inside a still-animating expand panel,
      // where the container's initial measured size can be off.
      requestAnimationFrame(() => map.resize());

      mapRef.current = map;
    }

    if (!isExpanded && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isExpanded]);

  const handleClearMarker = () => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    setGeotagPoint(null);
  };

  const handleSave = async() => {
    if (descriptionDraft.trim() === "" || !geotagPoint) {
      alert("Please provide a description or select a geotag point before saving.");
      return;
    }
    const token = await fetch("/api/access-token").then(res => res.json()).then(data => data.access_token);
    console.log("Access token for saving metadata:", token);
    console.log("Saving photo metadata:", {
        photo_id: photo.pid,
        description: descriptionDraft.trim() || null,
        geotag: geotagPoint || null,
    })

    const res = await fetch("/api/photo/update_metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        photo_id: photo.pid,
        description: descriptionDraft.trim() || null,
        // @ts-ignore
        geotag: [geotagPoint?.lat, geotagPoint?.lng] || null, 
      }),
    }).then((response) => {
      console.log("Response from update_metadata API:", response);
      return response.json();
    });

    if (res.success) {
      alert("Photo metadata updated successfully!");
      setDescriptionDraft("");
      setGeotagPoint(null);
      setIsExpanded(false);
    } else {
      alert("Failed to update photo metadata. Please try again.");
    }
  };

  const charCountColor =
    descriptionDraft.length >= 300
      ? "text-red-500"
      : descriptionDraft.length >= 250
      ? "text-yellow-500"
      : "text-[#7A6B70]";

  return (
    <div className="border-b border-[#F0EBEC] px-3 sm:px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:block w-8 shrink-0 text-sm text-[#6F6065]">{index + 1}</div>
        <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg bg-[#F4F2F3]">
          <Image
            src={photo.url}
            alt={`${photo.collectionName} photo ${index + 1}`}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#2F2428]">{photo.collectionName}</p>
          {photo.metadata?.date_taken ? (
            <p className="text-xs text-[#7A6B70]">{new Date(photo.metadata.date_taken).toLocaleString()}</p>
          ) : null}
          <div className="flex flex-wrap gap-1 mt-1">
              {photo.metadata?.description &&
                <p className="text-[10px] sm:text-xs text-[#7A6B70] border border-[#E8E2E4] rounded-md py-0.5 px-1.5 sm:p-1 sm:px-2 text-center">
                  Has description!
                </p>
              }
              {photo.metadata?.geotag &&
                <p className="text-[10px] sm:text-xs text-[#7A6B70] border border-[#E8E2E4] rounded-md py-0.5 px-1.5 sm:p-1 sm:px-2 text-center">
                  Has geotag!
                </p>
              }
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="shrink-0 cursor-pointer rounded-lg bg-[#3D2B2E] px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm text-white transition hover:bg-[#2F2428]"
        >
          {isExpanded ? "Hide" : "Add info"}
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-3 rounded-xl border border-[#E8E2E4] bg-[#F8F6F7] flex flex-col p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div
              className={`relative overflow-hidden rounded-lg bg-[#F4F2F3] w-full aspect-video sm:aspect-[4/3] lg:aspect-auto lg:w-auto ${
                orientation === "portrait"
                  ? "lg:flex-[0.7] lg:aspect-[3/4]"
                  : orientation === "landscape"
                  ? "lg:flex-[1.4] lg:aspect-[4/3]"
                  : "lg:flex-[1] lg:aspect-square"
              }`}
            >
              <Image
                src={photo.url}
                alt={`${photo.collectionName} photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 300px"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth > img.naturalHeight) {
                    setOrientation("landscape");
                  } else if (img.naturalWidth < img.naturalHeight) {
                    setOrientation("portrait");
                  } else {
                    setOrientation("square");
                  }
                }}
              />
            </div>

            <div className="lg:hidden border-t border-[#E8E2E4]" />

            <div className="flex flex-col flex-1 lg:flex-[1] gap-1.5 text-black">
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                placeholder="Enter description..."
                className="border border-gray-300 p-2 text-black rounded-lg w-full text-sm bg-[#F4F2F3] resize-none min-h-24 lg:min-h-0 lg:flex-1"
                maxLength={300}
              />
              <p className={`text-xs ${charCountColor}`}>{descriptionDraft.length}/300</p>
            </div>

            <div className="hidden lg:block w-px bg-gray-300" />
            <div className="lg:hidden border-t border-[#E8E2E4]" />

            <div className="flex flex-col flex-1 lg:flex-[2] gap-2 text-black">
              <div
                key={rowKey}
                ref={mapContainerRef}
                className="h-56 lg:h-full w-full rounded-lg"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[#7A6B70] truncate">
                  {geotagPoint
                    ? `Selected: ${geotagPoint.lat.toFixed(6)}, ${geotagPoint.lng.toFixed(6)}`
                    : "No point selected yet"}
                </p>
                {geotagPoint ? (
                  <button
                    type="button"
                    onClick={handleClearMarker}
                    className="shrink-0 cursor-pointer text-xs text-[#7A6B70] underline hover:text-[#4B3940]"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto cursor-pointer rounded-lg bg-[#3D2B2E] px-4 py-2 text-sm text-white transition hover:bg-[#2F2428]"
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}