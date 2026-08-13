import Image from "next/image";
import { PhotoWithMetadata } from "../../hooks/usePhotoStore";
import { useState } from "react";
import { LocateFixed, NotepadText, Type } from "lucide-react";

function formatAperture(aperture: string) {
  const match = aperture.match(/[\d.]+/);
  if (!match) return aperture;
  const rounded = parseFloat(match[0]).toFixed(1);
  return aperture.replace(match[0], rounded);
}

function formatShutterSpeed(shutterSpeed: string) {
  const num = parseFloat(shutterSpeed);
  return isNaN(num) ? shutterSpeed : num.toFixed(1);
}

export default function PhotoCard({ photo, index, needsLocation }: { photo: PhotoWithMetadata; index: number, needsLocation: boolean}) {
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
            className={`rounded-lg object-cover transition-opacity duration-700 w-full
            ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            height={500}
            width={600}
            priority={index < 6}
        />
      </div>

      {/* Metadata */}
      <div className="mt-2 flex justify-between items-center">
        <p className="text-2xl font-serif-custom font-bold mb-1 text-right text-black">
          {photo.metadata?.date_taken &&
            new Date(photo.metadata.date_taken).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })
            }
        </p>
        {photo.metadata?.description && photo.metadata?.geotag && (
          <div className="flex border border-[#E8E2E4] rounded-md p-1 px-2 text-center gap-x-2">
            <Type 
              size={15}
              color="#3D2B2E"
            />
            <LocateFixed 
              size={15}
              color="#3D2B2E"
            />
          </div>
        )}
      </div>

      {/* Pills */}
      <div className="w-full rounded-md flex flex-wrap overflow-x-auto gap-1 scrollbar-hidden">
        {photo.metadata?.model && (
          <div className="h-8 flex font-serif-custom items-center flex-shrink-0">
            <p className={`text-black ${needsLocation ? "text-md" : "text-xl"} font-black`}>{photo.metadata.model} |</p> 
          </div>
        )}
        {photo.metadata?.film && (
          <div className="h-8 flex font-serif-custom items-center flex-shrink-0">
            <p className={`text-black ${needsLocation ? "text-md" : "text-xl"} font-black`}>35mm Kodak Gold 200 |</p>
          </div>
        )}
        {photo.metadata?.aperture && (
          <div className="h-8 flex font-serif-custom items-center flex-shrink-0">
            <p className={`text-black ${needsLocation ? "text-md" : "text-xl"} font-black`}><strong>{formatAperture(photo.metadata.aperture)} |</strong></p>
          </div>
        )}
        {photo.metadata?.shutter_speed && (
          <div className="h-8 flex font-serif-custom items-center flex-shrink-0">
            <p className={`text-black ${needsLocation ? "text-md" : "text-xl"} font-black`}>
              <strong>1/{formatShutterSpeed(photo.metadata.shutter_speed)}s |</strong>
            </p>
          </div>
        )}
        {photo.metadata?.iso && (
          <div className="h-8 flex font-serif-custom items-center flex-shrink-0">
             <p className={`text-black ${needsLocation ? "text-md" : "text-xl"} font-black`}>
              <strong>ISO {photo.metadata.iso}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
