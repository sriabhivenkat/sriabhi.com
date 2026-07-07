'use client'
import React, { useState, useEffect } from 'react';
interface Movie {
    title: string,
    cover: string,
    movieYear: string
}

export default function MovieCard({ title, cover, movieYear }: Movie) {
    return(
        <div className="flex flex-col">
            <div className="rounded-xl bg-gray-100 border border-gray-200 p-4 md:p-14">
             <img src={cover} alt={title} className="rounded-[3px] w-full max-h-[280px] object-contain" />
            </div>
            <div className="mt-4 px-2">
                <p className="lg:text-2xl text-lg font-bold font-serif-custom text-black leading-tight">{title} </p>
                <p className="lg:text-sm text-xs text-gray-600 mt-1">{movieYear}</p>
            </div>
        </div>
    )
}