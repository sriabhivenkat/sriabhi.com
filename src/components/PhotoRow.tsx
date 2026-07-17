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

  return (
    <div className="border-b border-[#F0EBEC] px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="w-12 text-sm text-[#6F6065]">{index + 1}</div>
        <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-[#F4F2F3]">
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
          <div className="flex gap-x-1 mt-1">
              {photo.metadata?.description &&
                <p className="text-xs text-[#7A6B70] border border-[#E8E2E4] rounded-md p-1 px-2 text-center">
                  Has description!
                </p>
              }
              {photo.metadata?.geotag &&
                <p className="text-xs text-[#7A6B70] border border-[#E8E2E4] rounded-md p-1 px-2 text-center">
                  Has geotag!
                </p>
              }
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
            <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => {
                console.log("PHTOO: ", photo);
                setIsExpanded((prev) => !prev)
              }}
              className="cursor-pointer rounded-lg bg-[#3D2B2E] px-3 py-1.5 text-sm text-white transition hover:bg-[#2F2428]"
            >
              {isExpanded ? "Hide information" : "Add information"}
            </button>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div className="mt-3 rounded-xl border border-[#E8E2E4] bg-[#F8F6F7] flex flex-col p-4">
          <div className="flex gap-x-3">
            <div
              className={`relative overflow-hidden rounded-lg bg-[#F4F2F3] ${
                orientation === "portrait"
                  ? "flex-[0.7] aspect-[3/4]"
                  : orientation === "landscape"
                  ? "flex-[1.4] aspect-[4/3]"
                  : "flex-[1] aspect-square"
              }`}
            >
              <Image
                src={photo.url}
                alt={`${photo.collectionName} photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
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
            <div className="flex flex-[1] flex-col gap-3 border border-gray-300 rounded-md p-2 text-black">
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                placeholder="Enter description..."
                className="border border-gray-500 p-2 text-black rounded-lg w-full text-sm bg-[#F4F2F3] flex flex-1 resize-none"
                maxLength={300}
              />
              <p className={`text-xs ${descriptionDraft.length >= 250 ? descriptionDraft.length >= 300 ? 'text-red-500' :  'text-yellow-500' :  'text-[#7A6B70]'} `}>{descriptionDraft.length}/300</p>
            </div>
            <div className="w-px bg-gray-300" />
            <div className="flex flex-[2] flex-col gap-3 rounded-md text-black">
              <div
                key={rowKey}
                ref={mapContainerRef}
                className="h-64 h-full w-full rounded-lg"
              />
              <div className="flex items-center">
              <p className="text-xs text-[#7A6B70]">
                {geotagPoint
                  ? `Selected: ${geotagPoint.lat.toFixed(6)}, ${geotagPoint.lng.toFixed(6)}`
                  : "No point selected yet"}
              </p>
              <div className="flex items-center justify-between">
                {geotagPoint ? (
                  <button
                    type="button"
                    onClick={handleClearMarker}
                    className="cursor-pointer text-xs text-[#7A6B70] underline hover:text-[#4B3940] ml-2"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="cursor-pointer rounded-lg bg-[#3D2B2E] px-4 py-2 text-sm text-white transition hover:bg-[#2F2428]"
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}