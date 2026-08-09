"use client";
import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { Metadata, usePhotoStore, type PhotoWithMetadata } from "../../../../hooks/usePhotoStore";
import { useCollectionStore } from "../../../../hooks/useCollectionsStore";
import "mapbox-gl/dist/mapbox-gl.css";
import Fuse from 'fuse.js'
import PhotoRow from "@/components/PhotoRow";
import { Search } from "lucide-react";

export default function Page() {
  const [checked, setChecked] = useState(false);
  const { photoData, fetchFolder } = usePhotoStore();
  const { collections, fetchCollections } = useCollectionStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    setChecked(Boolean(t));
  }, []);

  useEffect(() => {
    collections.forEach((loc, i) => {
      setTimeout(() => fetchFolder(loc.grabPath), i * 100);
    });
  }, [collections, fetchFolder]);

  const photoRows = collections.filter((c) => c.grabPath != "iphone_photos").flatMap((loc) => {
    const photos = photoData[loc.grabPath]?.photos ?? [];
    return photos.map((photo) => ({
      ...photo,
      collectionName: loc.name || loc.grabPath,
    }));
  });

  const sortedPhotos = [...photoRows].sort((a, b) => {
      const dateA = a.metadata?.date_taken ? Date.parse(a.metadata.date_taken) : null;
      const dateB = b.metadata?.date_taken ? Date.parse(b.metadata.date_taken) : null;

      if (dateA === null && dateB === null) return 0;
      if (dateA === null) return 1;
      if (dateB === null) return -1;

      return dateB - dateA;
    });

  const fuse = useMemo(
    () => new Fuse(sortedPhotos, { keys: ["collectionName"], includeScore: true, threshold: 0.4 }),
    [sortedPhotos]
  );

  const displayRows = useMemo(() => {
    if (query.trim().length === 0) return sortedPhotos;
    return fuse.search(query).map((result) => result.item);
  }, [query, fuse, sortedPhotos]);

  if (!checked) return null;
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F2F3] p-3 sm:p-6">
      <Navbar />
      <div className="mb-2 mt-12 items-start lg:mt-10">
        <div className="flex w-full justify-between">
          <h1 className="font-serif-custom text-2xl sm:text-3xl font-black text-black">Edit Photos</h1>
        </div>
        <div className="relative mt-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6B70]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-[#3D2B2E]/30 w-full py-2 pl-9 pr-3 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B2E]/30 focus:border-[#3D2B2E]"
            placeholder="Search a collection"
          />
        </div>
      </div>
      <div className="mt-2 overflow-hidden rounded-2xl border border-[#D8D0D3] bg-white shadow-sm">
        {displayRows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-[#7A6B70]">
              Olroit... What&apos;s awl dis den? Where are the photos?
            </p>
          </div>
        ) : (
          displayRows.map((photo, index) => <PhotoRow key={`${photo.collectionName}-${photo.url}-${index}`} photo={photo} index={index} />)
        )}
      </div>
    </div>
  );
}