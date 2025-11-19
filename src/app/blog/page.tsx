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
                        <h1 className="text-6xl font-serif-custom font-black text-black">Blog</h1>
                    </div>
                    <div className="max-w-130">
                        <p className="mt-2 text-sm font-inter font-light text-black">i lowk be sayin wtv here lmao</p>
                    </div>
                </div>
            </div>
            <Navbar />
        </div>
    )
}