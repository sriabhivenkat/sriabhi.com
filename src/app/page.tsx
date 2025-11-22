'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { PhotoWithMetadata, usePhotoStore } from "../../hooks/usePhotoStore";
import Link from "next/link";

const MapComponent = dynamic(() => import("../components/MapComponent"), { ssr: false });

export interface Tab {
  title: string;
  markers?: {
    latitude: number;
    longitude: number;
    color?: string;
    city?: string;
    country?: string;
    grabPath?: string;
    photoPaths?: string[];
  }[];
}

export default function Home() {

  const { photoPaths } = usePhotoStore();
  const [allPhotos, setAllPhotos] = useState<PhotoWithMetadata[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoWithMetadata[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTiles, setShowTiles] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  
  console.log('Photo paths in store:', photoPaths);
  const tiles = [
    {
      title: "Photos",
      bg_img: "https://home.sriabhi.com/api/v1/photo/trips/nyc/_DSF0925.jpeg",
      link: "/photos"
    },
    {
      title: "Projects",
      bg_img: "https://home.sriabhi.com/api/v1/photo/trips/nyc/_DSF0583.JPG",
      link: "/projects"
    },
    {
      title: "Blog",
      bg_img: "https://home.sriabhi.com/api/v1/photo/trips/yosemite/0716414_0716414-R1-011-4.jpg",
      link: "/blog"
    },
    {
      title: "About me",
      bg_img: "https://home.sriabhi.com/api/v1/photo/trips/alaska/0722766_0722766-R2-057-27.jpg",
      link: "/sriabhi"
    }
  ]

  useEffect(() => {
    // Check if image is already loaded (cached)
    if (imgRef.current?.complete) {
      setImageLoaded(true);
    }
    
    // Fallback timer in case onLoad doesn't fire
    const fallbackTimer = setTimeout(() => {
      setImageLoaded(true);
    }, 100);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      // Start showing tiles after image has faded in
      const timer = setTimeout(() => setShowTiles(true), 300);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  return (
    <div className="flex min-h-screen flex-col relative bg-[#F4F2F3]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px] mix-blend-overlay"></div>

      <div className="h-screen flex flex-col justify-center items-center overflow-x-hidden">
        <div className="flex flex-col md:flex-row items-center justify-center gap-5 
          w-full
          px-5 
          flex-grow"
        >
          <img 
            ref={imgRef}
            src="https://home.sriabhi.com/api/v1/photo/trips/rainier/_DSF0746.JPG"
            className={`rounded-lg object-cover w-auto h-auto max-h-[400px] md:max-h-[500px] 
              transition-all duration-1000 ease-out
              ${imageLoaded ? 'opacity-100 translate-y-0 blur-0 [transition-duration:2000ms]' 
                  : 'opacity-0 translate-y-4 blur-sm'}
            `}
            onLoad={() => setImageLoaded(true)}
          />

          <div className="grid grid-rows-2 grid-cols-2 gap-5 w-fit">
            {tiles.map((tile, index) => (
              <Link
                key={index}
                href={tile.link}
                className={`
                  relative 
                  aspect-square 
                  rounded-lg 
                  overflow-hidden 
                  cursor-pointer 
                  transform 
                  transition-all
                  duration-800
                  ease-out
                  hover:scale-105 
                  p-3 
                  flex 
                  flex-col 
                  justify-end
                  w-[140px]
                  md:w-[180px]
                  ${showTiles ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{
                  backgroundImage: tile.bg_img ? `url(${tile.bg_img})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transitionDelay: showTiles ? `${index * 100}ms` : '0ms',
                }}
              >
                <div className="absolute inset-0 bg-black/40" />

                <h2 className="relative text-lg font-serif-custom text-white font-bold">
                  {tile.title}
                </h2>
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-between items-end p-5">
          <div className="flex flex-col">
            <Link href="/" className="hover:cursor-pointer">
              <p className="text-md font-inter font-light text-black">New York, NY</p>
              <h1 className="text-6xl font-serif-custom text-black">
                <span className="text-xl">sri</span> 
                Abhi 
                <span className="text-xl">nandan</span> 
                Venkat 
                <span className="text-xl">araman</span>
              </h1>
            </Link>
            <h2 className="text-lg font-inter font-light text-black">
              I'm a software engineer from <span className="font-bold text-[#500000]">Texas</span> who loves photography, hiking, football, and building cool things.
            </h2>
          </div>

          {/* Only show links on medium screens and up */}
          <div className="hidden md:flex items-end space-x-3">
            {["resume", "github", "linkedin"].map((label, i) => {
              const hrefs: Record<string, string> = {
                resume: "https://home.sriabhi.com/api/v1/files/blog/sriabhinandan_venkataraman_resume_final.pdf",
                github: "https://github.com/sriabhivenkat",
                linkedin: "https://www.linkedin.com/in/sriabhi-venkat/",
              };
              return (
                <Link key={label} href={hrefs[label]}>
                  <div
                    className={`relative group cursor-pointer font-inter text-black transform transition-all duration-800 ease-out
                      ${showTiles ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: showTiles ? `${i * 100}ms` : '0ms' }}
                  >
                    <p className="text-black">
                      {label}
                    </p>
                    <span className="absolute left-0 -bottom-1 w-0 h-[3px] bg-black transition-all duration-300 group-hover:w-full"></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}