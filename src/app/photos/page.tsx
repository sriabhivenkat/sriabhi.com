"use client"
import React, { useState, useEffect } from 'react';
import { usePhotoStore } from '../../../hooks/usePhotoStore';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useCollectionStore } from '../../../hooks/useCollectionsStore';

export default function Page() {
  const { photoData, fetchFolder } = usePhotoStore();
  const { collections, fetchCollections } = useCollectionStore();
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => { fetchCollections(); }, []);

  useEffect(() => {
    collections.forEach((loc, i) => {
      setTimeout(() => fetchFolder(loc.grabPath), i * 100);
    });
  }, [collections]);

  const real_photos = collections.filter((c) => c.grabPath != "iphone_photos")
  const cards = real_photos.map(loc => ({
    ...loc,
    coverUrl: loc.cover_url ? "https://home.sriabhi.com" + loc.cover_url : null,
    photoCount: photoData[loc.grabPath]?.total,
    lastUpdated: photoData[loc.grabPath]?.lastUpdated,
  })).sort((a, b) => {
    if (!a.lastUpdated) return 1;
    if (!b.lastUpdated) return -1;
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  useEffect(() => {
    const total = cards.reduce((sum, item) => sum + (item.photoCount || 0), 0);
    setVisibleCount(total);
  }, [cards]);

  const allLoaded = cards.length > 0 && cards.every(c => !!photoData[c.grabPath]);
  const PLACEHOLDER_COUNT = 12;

  return (
    <div className="min-h-screen flex p-3 lg:px-2 overflow-hidden bg-[#F4F2F3]">
      <Navbar />
      <div className="mt-12 lg:mt-10 flex flex-col flex-1">
        <div className="w-full">
          <div className="ml-2 flex flex-col items-start justify-center mb-5">
            <div className="flex w-full justify-between items-center">
              <h1 className="text-5xl font-serif-custom font-black text-black">Memories</h1>
              <p className="mt-1 text-2xl font-serif-custom font-medium text-black">{visibleCount} photos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {!allLoaded && setTimeout(() => {}, 500)
              ? Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className="min-h-60 rounded-md relative overflow-hidden animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]"
                  />
                ))
              : cards.map((item, index) => (
                  <Link
                    key={item.grabPath}
                    className="min-h-60 rounded-md relative hover:cursor-pointer overflow-hidden"
                    href={`photos/${item.grabPath.split("/")[1]}`}
                  >
                    {item.coverUrl ? (
                      <Image
                        src={item.coverUrl}
                        fill
                        quality={60}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-md"
                        alt={item.name}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 rounded-md" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 rounded-md" />
                    <p className="absolute text-2xl bottom-2 left-3 font-serif-custom text-white font-semibold">{item.name}</p>
                    <div className="absolute bottom-2 right-3 text-right">
                      <p className="text-xl font-serif-custom text-white">
                        {item?.photoCount} {item?.photoCount === 1 ? "photo" : "photos"}
                      </p>
                      <p className="text-lg font-serif-custom text-white">
                        {item.lastUpdated
                          ? `Updated on ${new Date(item.lastUpdated).toLocaleDateString()}`
                          : "Updated a long time ago"}
                      </p>
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}