"use client";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { PhotoWithMetadata, usePhotoStore } from "../../hooks/usePhotoStore";
import PhotoCard from "./PhotoCard";


export default function Collection({path}: {path: string}) {
    const { photoPaths } = usePhotoStore();
    const [photos, setPhotos] = useState<PhotoWithMetadata[]>([]);

    useEffect(() => {
        const grabPath = "trips/"+path
        const photosFromPath = photoPaths[grabPath]
        const sorted = photosFromPath?.sort((a,b) => {
            const aDate = a.metadata?.date_taken ? new Date(a.metadata.date_taken).getTime() : 0
            const bDate = b.metadata?.date_taken ? new Date(b.metadata.date_taken).getTime() : 0

            return bDate - aDate
        })
        setPhotos(sorted)
    }, [photoPaths])

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
    return(
        <div className="min-h-screen flex p-3 lg:px-2 overflow-hidden bg-[#F4F2F3]">
            <Navbar />
            <div className="flex flex-col">
                <div className="w-full mt-12 lg:mt-10 ml-2 my-2">
                    <h1 className="text-5xl font-serif-custom font-black text-black">{PATH_NAMES[path]}</h1>
                    <p className="mt-1 text-2xl font-serif-custom font-medium text-black">
                        {photos?.length} {photos?.length === 1 ? "photo" : "photos"}
                    </p>
                </div>
                <div className="columns-1 md:columns-3 lg:columns-3 gap-4">
                    {photos
                        ?.map((photo, index) => (
                            <div key={index} className="break-inside-avoid">
                                <PhotoCard photo={photo} index={index} needsLocation={false}/>
                            </div>
                    ))}
                </div>
            </div>
        </div>
    )
}