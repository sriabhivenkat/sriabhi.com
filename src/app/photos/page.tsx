"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';

import Navbar from '@/components/Navbar';
import { PhotoWithMetadata, usePhotoStore } from '../../../hooks/usePhotoStore';
import Image from 'next/image';
import PhotoCard from '@/components/PhotoCard';

export default function Page() {
  const { photoPaths } = usePhotoStore();
  const [allPhotos, setAllPhotos] = useState<PhotoWithMetadata[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoWithMetadata[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);

  const [activeFilters, setActiveFilters] = useState<{
    model?: string;
    film?: boolean;
    city?: string;
  }>({});

  const locations = [
    { name: "New York City", grabPath: "trips/nyc" },
    { name: "Japan", grabPath: "trips/japan" },
    { name: "Banff", grabPath: "trips/banff" },
    { name: "Yosemite", grabPath: "trips/yosemite" },
    { name: "Dallas", grabPath: "trips/dallas" },
    { name: "Alaska", grabPath: "trips/alaska" },
    { name: "Mount Rainier", grabPath: "trips/rainier" },
    { name: "Austin", grabPath: "trips/austin" },
    { name: "New Orleans", grabPath: "trips/nola" },
    { name: "Cold Springs", grabPath: "trips/cold_springs" },
    { name: "Lake Murray State Park", grabPath: "trips/oklahoma" },
  ];

  // Aggregate photos and attach location
  useEffect(() => {
    const aggregated: PhotoWithMetadata[] = [];
    for (const location of locations) {
      const photos = photoPaths[location.grabPath];
      if (photos) {
        aggregated.push(
          ...photos.map(p => ({
            ...p,
            location: location.name || location.grabPath.split('/')[1],
          }))
        );
      }
    }
    setAllPhotos(aggregated);
    setFilteredPhotos(aggregated);
  }, [photoPaths]);

  // Filter photos based on active filters
  useEffect(() => {
    let filtered = allPhotos;

    if (activeFilters.model) filtered = filtered.filter(p => p.metadata?.model === activeFilters.model);
    if (activeFilters.film !== undefined) filtered = filtered.filter(p => p.metadata?.film === activeFilters.film);
    if (activeFilters.city) filtered = filtered.filter(p => p.location === activeFilters.city);

    setFilteredPhotos(filtered);
    setVisibleCount(6); // reset lazy load on filter change
  }, [activeFilters, allPhotos]);

  const toggleFilter = (category: 'model' | 'film' | 'city', value: string | boolean) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? undefined : value,
    }));
  };

  const uniqueModels = Array.from(new Set(allPhotos.map(p => p.metadata?.model).filter(Boolean)));
  const filmOptions = [true, false];
  const uniqueCities = Array.from(new Set(allPhotos.map(p => p.location).filter(Boolean)));

  const getLightSensitivityMessage = (iso: number) => {
    if (iso >= 50 && iso <= 200) return "Low light sensitive";
    if (iso >= 201 && iso <= 400) return "Moderately light sensitive";
    if (iso >= 401 && iso <= 800) return "High light sensitive";
    if (iso >= 801 && iso <= 1600) return "Very high light sensitive";
    if (iso >= 1601 && iso <= 3200) return "Extremely light sensitive";
    if (iso > 3200) return "Ultra light sensitive";
    return "Invalid ISO";
  };

  // Ref to avoid multiple triggers
  const loadingRef = useRef(false);

  // Infinite scroll with throttling and delay
  const handleScroll = useCallback(() => {
    if (loadingRef.current) return; // already waiting

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const fullHeight = document.body.offsetHeight;

    if (scrollTop + windowHeight >= fullHeight - 300) {
      loadingRef.current = true;
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 6, filteredPhotos.length));
        loadingRef.current = false;
      }, 500); // 1 second delay
    }
  }, [filteredPhotos.length]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  const store = usePhotoStore.getState();
  console.log('Raw photo URL from store:', store.photoPaths['trips/nyc']?.[0]?.url)
  return (
    <div className="min-h-screen flex p-3 sm:p-5 overflow-hidden bg-[#F4F2F3]">
      <div className="w-full p-2 px-5">
        <div className="ml-2 flex flex-col items-start justify-center mb-10">
          <div className="flex w-full justify-between items-center">
            <h1 className="text-6xl font-serif-custom font-black text-black">Memories</h1>
            <p className="mt-1 text-2xl font-serif-custom font-medium text-black">{filteredPhotos.length} photos</p>
          </div>
          <p className="mt-1 text-md font-inter font-light text-black">I try to keep a record of everywhere I've been!</p>

          {/* Filters */}
          <p className='mt-4 mb-2 text-md font-inter text-black'>Filters</p>
          <div className="flex flex-wrap gap-2">
            {uniqueModels.map(model => (
              <button
                key={model}
                onClick={() => toggleFilter("model", model as string)}
                className={`hover:cursor-pointer px-3 py-1 rounded-lg text-white font-light ${
                  activeFilters.model === model ? "bg-[#2A75BB]" : "bg-gray-900"
                }`}
              >{model}</button>
            ))}
            {filmOptions.map(film => (
              <button
                key={film.toString()}
                onClick={() => toggleFilter("film", film)}
                className={`hover:cursor-pointer px-3 py-1 rounded-lg text-white font-light ${
                  activeFilters.film === film ? "bg-blue-600" : "bg-gray-900"
                }`}
              >{film ? "Film" : "Digital"}</button>
            ))}
            {uniqueCities.map(city => (
              <button
                key={city}
                onClick={() => toggleFilter("city", city as string)}
                className={`hover:cursor-pointer px-3 py-1 rounded-lg text-white font-light ${
                  activeFilters.city === city ? "bg-blue-600" : "bg-gray-900"
                }`}
              >{city}</button>
            ))}
          </div>
        </div>

        {/* Photos grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.slice(0, visibleCount).map((photo, index) => (
            <PhotoCard photo={photo} key={index} index={index} />
          ))}
        </div>
      </div>
      <Navbar />
    </div>
  );
}
