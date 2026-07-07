'use client'
import { useState } from 'react';

interface Album {
    title: string
    artist: string
    cover: string
    releaseYear: string
    favoriteSong: string
    favoriteSongLink: string
}

export default function AlbumCard({ title, cover, artist, releaseYear, favoriteSong, favoriteSongLink }: Album) {
    const [tapped, setTapped] = useState(false);

    return (
        <div className="flex flex-col">
            <div
                className="relative rounded-xl bg-gray-100 border border-gray-200 p-7 group flex items-center justify-center overflow-hidden"
                onClick={() => setTapped(t => !t)}
            >
                {/* Vinyl */}
                <div className={`
                    absolute
                    w-[45%] md:w-[45%] aspect-square
                    rounded-full bg-[#111]
                    flex items-center justify-center
                    z-10
                    transition-transform duration-500 ease-in-out
                    ${tapped ? 'translate-x-[70%]' : 'translate-x-0 group-hover:translate-x-[70%]'}
                `}>
                    <div className="absolute inset-0 rounded-full" style={{
                        background: `repeating-radial-gradient(circle, #1a1a1a 0px, #111 2px, #1a1a1a 4px, #111 6px)`
                    }} />
                    <div className="relative w-[38%] aspect-square rounded-full overflow-hidden border-2 border-[#222] z-10">
                        <img src={cover} alt={title} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute w-[4%] aspect-square rounded-full bg-[#333] z-20" />
                </div>

                {/* Album cover */}
                <div className="relative z-20 w-[75%] md:w-[55%] rounded-lg overflow-hidden">
                    <img src={cover} alt={title} className="w-full object-contain" />
                </div>
            </div>

            <div className="mt-4 px-2">
                <p className="lg:text-2xl text-lg font-bold font-serif-custom text-black leading-tight">
                    {title} <span className="lg:text-sm text-xs font-normal">{releaseYear}</span>
                </p>
                <p className="lg:text-sm text-xs text-gray-600 mt-1">
                    {artist} | <a href={favoriteSongLink} target="_blank" rel="noopener noreferrer">
                        <span className="underline italic hover:cursor-pointer">{favoriteSong}</span>
                    </a>
                </p>
            </div>
        </div>
    )
}