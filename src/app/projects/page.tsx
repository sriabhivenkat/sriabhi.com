"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';

import Navbar from '@/components/Navbar';
import { PhotoWithMetadata, usePhotoStore } from '../../../hooks/usePhotoStore';

export default function Page() {
    return (
        <div className="min-h-screen flex p-5 overflow-hidden bg-[#F4F2F3]">
            <div className="w-full p-2">
                <div className="ml-2 flex flex-col items-start justify-center mb-10">
                    <div className="flex w-full justify-between items-center">
                        <h1 className="text-3xl font-inter font-black text-black">Blog</h1>
                    </div>
                    <div className="max-w-130">
                        <p className="mt-1 text-lg font-inter font-light text-black">I write about my thoughts a little. Sometimes it's about what I feel, sometimes it's about a nice day I had or a cool thing I built!</p>
                        <p className="text-lg font-inter font-light text-black">I hope you get to know about me a little through what I write.</p>
                    </div>
                </div>
            </div>
            <Navbar />
        </div>
    )
}