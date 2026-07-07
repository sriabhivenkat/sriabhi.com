'use client';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTiles, setShowTiles] = useState(false);
  const [photoHeight, setPhotoHeight] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const tiles = [
    {
      title: "Photos",
      bg_img: "https://home.sriabhi.com/api/v1/photo/trips/nyc/_DSF0925_thumb.jpg",
      link: "/photos"
    },
    {
      title: "Projects",
      bg_img: "https://home.sriabhi.com/api/v1/photo/trips/nyc/_DSF0583_thumb.jpg",
      link: "/projects"
    },
    {
      title: "Blog",
      bg_img: "https://home.sriabhi.com/api/v1/photo/trips/yosemite/0716414_0716414-R1-011-4_thumb.jpg",
      link: "/blog"
    },
    {
      title: "About me",
      bg_img: "https://home.sriabhi.com/api/v1/photo/trips/alaska/0722766_0722766-R2-057-27_thumb.jpg",
      link: "/sriabhi"
    }
  ];

  const [photoDimensions, setPhotoDimensions] = useState<{ width: number; height: number } | null>(null);

  const updateDimensions = () => {
    if (imgRef.current) {
      setPhotoDimensions({
        width: imgRef.current.offsetWidth,
        height: imgRef.current.offsetHeight,
      });
    }
  };

  useEffect(() => {
    if (imgRef.current?.complete) {
      setImageLoaded(true);
      updateDimensions();
    }

    const fallbackTimer = setTimeout(() => setImageLoaded(true), 100);
    window.addEventListener('resize', updateDimensions);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => setShowTiles(true), 750);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  const tileSize = photoDimensions
  ? window.innerWidth >= 768
    ? (photoDimensions.height - 20) / 2  // half height minus gap
    : (photoDimensions.width - 20) / 2   // half width minus gap
  : 140;

  return (
    <div className="flex min-h-screen flex-col relative bg-[#F4F2F3]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px] mix-blend-overlay" />

      <div className="min-h-screen flex flex-col justify-center items-center overflow-x-hidden">
        <div className="flex flex-col md:flex-row items-center justify-center gap-5 w-full px-5 flex-grow">
          <Image
            ref={imgRef}
            src="https://home.sriabhi.com/api/v1/photo/trips/rainier/_DSF0746.JPG"
            width={600}
            height={500}
            alt=""
            className={`rounded-lg object-cover w-auto h-auto max-h-[400px] md:max-h-[500px] 
              transition-all duration-1000 ease-out
              ${imageLoaded ? 'opacity-100 translate-y-0 blur-0 [transition-duration:2000ms]' : 'opacity-0 translate-y-4 blur-sm'}
            `}
            onLoad={() => {
              setImageLoaded(true);
              updateDimensions();
            }}
          />

          <div
            className="grid grid-rows-2 grid-cols-2 gap-5 w-fit"
            style={{
              // On mobile (vertical stack): match photo width
              // On desktop (horizontal stack): match photo height
              width: photoDimensions && window.innerWidth < 768 ? `${photoDimensions.width}px` : undefined,
              height: photoDimensions && window.innerWidth >= 768 ? `${photoDimensions.height}px` : undefined,
            }}
          >
            {tiles.map((tile, index) => (
              <Link
                key={index}
                href={tile.link}
                className={`
                  relative
                  rounded-lg
                  overflow-hidden
                  cursor-pointer
                  transform
                  transition-all
                  ease-out
                  hover:scale-105
                  flex
                  flex-col
                  justify-end
                  ${showTiles ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{
                  width: `${tileSize}px`,
                  height: `${tileSize}px`,
                  backgroundImage: tile.bg_img ? `url(${tile.bg_img})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transitionDelay: showTiles ? `${index * 100}ms` : '0ms',
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <h2 className="relative text-lg font-serif-custom text-white font-bold p-3">
                  {tile.title}
                </h2>
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-between items-end p-5">
          <div className="flex flex-col">
            <Link href="/" className="hover:cursor-pointer">
              <p className="text-md font-inter font-light text-black flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="#4D7C56">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.992 3.5-8.327a8 8 0 10-16 0c0 3.335 1.556 6.324 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742z" clipRule="evenodd" />
                  <circle cx="12" cy="10" r="2.5" fill="white" />
                </svg>
                New York, NY
              </p>
              <h1 className="text-6xl font-serif-custom text-black">
                Abhi Venkat
              </h1>
            </Link>
            <h2 className="text-lg font-inter font-light text-black">
              I'm a software engineer from <span className="font-bold text-[#500000]">Texas</span> who loves photography, hiking, football, and building cool things.
            </h2>
          </div>

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
                    <p className="text-black">{label}</p>
                    <span className="absolute left-0 -bottom-1 w-0 h-[3px] bg-black transition-all duration-300 group-hover:w-full" />
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