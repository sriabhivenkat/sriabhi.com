import Image from "next/image";
import { PhotoWithMetadata } from "../../hooks/usePhotoStore";
import { useState } from "react";

export default function PhotoCard({ photo, index }: { photo: PhotoWithMetadata; index: number }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="p-2 flex flex-col">
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-300">
        {/* Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
        )}

        {/* Actual image */}
        <Image
            src={photo.url}
            placeholder="blur"
            blurDataURL={photo.url}
            loading="eager"
            alt="..."
            className={`rounded-lg object-cover transition-opacity duration-700
            ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            height={500}
            width={600}
            priority={index < 6}
        />
      </div>

      {/* Metadata */}
      <div className="mt-2 flex justify-between items-center">
        <h2 className="text-2xl font-serif-custom font-black mb-1 text-black">
          {photo.location || "Unknown Location"}
        </h2>
        <p className="text-xl font-serif-custom font-bold mb-1 text-right text-black">
          {photo.metadata?.date_taken
            ? new Date(photo.metadata.date_taken).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })
            : ""}
        </p>
      </div>

      {/* Pills */}
      <div className="w-full rounded-md mt-1 flex flex-wrap overflow-x-auto gap-2 py-1 scrollbar-hidden">
        {photo.metadata?.model && (
          <div className="h-8 bg-gray-900 rounded-md flex items-center p-2 flex-shrink-0">
            <p className="text-white text-sm font-light">{photo.metadata.model}</p>
          </div>
        )}
        {photo.metadata?.film && (
          <div className="h-8 bg-gray-900 rounded-md flex items-center p-2 flex-shrink-0">
            <p className="text-white text-sm font-light">35mm Kodak Gold 200</p>
          </div>
        )}
        {photo.metadata?.aperture && (
          <div className="h-8 bg-gray-900 rounded-md flex items-center p-2 flex-shrink-0">
            <p className="text-white text-sm font-light">{photo.metadata.aperture}</p>
          </div>
        )}
        {photo.metadata?.shutter_speed && (
          <div className="h-8 bg-gray-900 rounded-md flex items-center p-2 flex-shrink-0">
            <p className="text-white text-sm font-light">
              1/{photo.metadata.shutter_speed}s
            </p>
          </div>
        )}
        {photo.metadata?.iso && (
          <div className="h-8 bg-gray-900 rounded-md flex items-center p-2 flex-shrink-0">
            <p className="text-white text-sm font-light">
              ISO <strong>{photo.metadata.iso}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
