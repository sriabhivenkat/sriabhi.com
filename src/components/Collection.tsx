"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Navbar from "./Navbar";
import { PhotoWithMetadata, usePhotoStore } from "../../hooks/usePhotoStore";
import PhotoCard from "./PhotoCard";
import Image from "next/image";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCollectionStore } from "../../hooks/useCollectionsStore";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

function GeotagMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/kastech/cmhsf9202002s01s9h22ndwoe",
      center: [lng, lat],
      zoom: 11,
      interactive: false,
    });

    new mapboxgl.Marker({ color: "#1B998B" })
      .setLngLat([lng, lat])
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return <div ref={containerRef} className="h-48 w-full rounded-lg" />;
}

export default function Collection({ path }: { path: string }) {
  const { photoData, fetchFolder, loading } = usePhotoStore();
  const grabPath = `trips/${path}`;
  const isLoading = loading[grabPath];
  const { collections, fetchCollections } = useCollectionStore();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithMetadata | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []); // don't re-run this every time photoData changes

  useEffect(() => {
    fetchFolder(grabPath);
  }, [grabPath]);

  const name = useMemo(
    () => collections.find((c) => c.grabPath === grabPath)?.name ?? "",
    [collections, grabPath]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhoto(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll while the modal is open so there's only one
  // scrollable region on screen (the modal itself), not two competing ones.
  useEffect(() => {
    if (selectedPhoto) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedPhoto]);

  const photos = photoData[grabPath]?.photos.slice().sort((a, b) => {
    const aDate = a.metadata?.date_taken ? new Date(a.metadata.date_taken).getTime() : 0;
    const bDate = b.metadata?.date_taken ? new Date(b.metadata.date_taken).getTime() : 0;
    return bDate - aDate;
  }) ?? [];

  return (
    <div className="min-h-screen flex p-3 lg:px-2 overflow-hidden bg-[#F4F2F3]">
      <Navbar />
      <div className="flex flex-col">
        <div className="w-full mt-12 lg:mt-10 ml-2 my-2">
          <h1 className="text-5xl font-serif-custom font-black text-black">
            {name}
          </h1>
          <p className="mt-1 text-2xl font-serif-custom font-medium text-black">
            {isLoading ? "Loading..." : `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`}
          </p>
        </div>

        {isLoading ? (
          <div className="columns-1 md:columns-3 lg:columns-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4 rounded-lg bg-gray-200 animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="columns-1 md:columns-3 lg:columns-3 gap-4">
            {photos.slice().sort((a, b) => {
                if (a.metadata?.date_taken && b.metadata?.date_taken) {
                    return new Date(b.metadata.date_taken).getTime() - new Date(a.metadata.date_taken).getTime();
                }
                return 0;
            }).map((photo, index) => {
                const hasDetails = photo.metadata?.description && photo.metadata?.geotag;
                return (
                  <div
                    key={index}
                    className={`break-inside-avoid ${hasDetails ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (hasDetails) setSelectedPhoto(photo);
                    }}
                  >
                      <PhotoCard photo={photo} index={index} needsLocation={false} />
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {selectedPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative flex h-[85dvh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl md:h-auto md:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="relative h-[45dvh] w-full shrink-0 bg-[#F4F2F3] md:h-[50vh]">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.metadata?.description || "Photo"}
                fill
                className="object-contain"
                priority
                quality={80}
              />
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              {selectedPhoto.metadata?.description ? (
                <p className="text-base text-[#2F2428]">{selectedPhoto.metadata.description}</p>
              ) : null}
              {selectedPhoto.metadata?.date_taken ? (
                <p className="text-sm text-[#7A6B70]">
                  {new Date(selectedPhoto.metadata.date_taken).toLocaleString()}
                </p>
              ) : null}
              {selectedPhoto.metadata?.geotag ? (
                <GeotagMap
                  lat={selectedPhoto.metadata.geotag[0]}
                  lng={selectedPhoto.metadata.geotag[1]}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}