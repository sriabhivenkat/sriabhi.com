"use client";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { PhotoWithMetadata, usePhotoStore } from "../../hooks/usePhotoStore";
import PhotoCard from "./PhotoCard";

const PATH_NAMES: Record<string, string> = {
  "banff": "Banff",
  "dallas": "Dallas",
  "nyc": "New York City",
  "japan": "Japan",
  "yosemite": "Yosemite",
  "alaska": "Alaska",
  "rainier": "Mount Rainier",
  "austin": "Austin",
  "nola": "New Orleans",
  "cold_springs": "Cold Springs",
  "oklahoma": "Lake Murray State Park",
  "new_mexico": "New Mexico"
};

export default function Collection({ path }: { path: string }) {
  const { photoData, fetchFolder, loading } = usePhotoStore();
  const grabPath = `trips/${path}`;
  const isLoading = loading[grabPath];

  useEffect(() => {
    fetchFolder(grabPath);
  }, [grabPath]);

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
            {PATH_NAMES[path]}
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
            }).map((photo, index) => (
                <div key={index} className="break-inside-avoid">
                    <PhotoCard photo={photo} index={index} needsLocation={false} />
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}