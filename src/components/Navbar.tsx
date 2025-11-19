"use client";

import Link from 'next/link';
import { useState } from 'react';


type NavbarPosition = 'top-right' | 'bottom-center';

interface NavbarProps {
  position?: NavbarPosition;
}

export default function Navbar({ position = 'bottom-center' }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const positionClasses = {
    'top-right': 'top-4 right-4 -translate-x-0',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <header
      className={`fixed ${positionClasses[position]} z-50 w-[85%] sm:w-[40%]
      backdrop-blur-lg bg-white/30 border border-white/10 rounded-2xl shadow-lg 
      flex flex-col sm:flex-row items-center py-3  px-4`}
    >
      {/* Mobile + Desktop unified top row */}
      <div className="w-full flex justify-center items-center sm:justify-evenly">
        {/* Center toggle button on mobile */}
        <button
          className="sm:hidden text-black text-2xl font-bold font-inter sm:bg-white/40 sm:backdrop-blur-lg sm:border sm:border-white/20 sm:shadow-lg sm:rounded-full p-1"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "≡"}
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex w-full justify-evenly items-center">
          <Link href="/"><h1 className="text-md tracking-wide cursor-pointer hover:text-white delay-100 text-black">Home</h1></Link>
          <Link href="/photos"><h1 className="text-md tracking-wide cursor-pointer hover:text-white delay-100 text-black">Photos</h1></Link>
          <Link href="/blog"><h1 className="text-md tracking-wide cursor-pointer hover:text-white delay-100 text-black">Blog</h1></Link>
          <Link href="/projects"><h1 className="text-md tracking-wide cursor-pointer hover:text-white delay-100 text-black">Projects</h1></Link>
          <Link href="/sriabhi"><h1 className="text-md tracking-wide cursor-pointer hover:text-white delay-100 text-black">About me</h1></Link>
        </div>
      </div>

      {/* Full mobile menu under the button */}
      <div
        className={`sm:hidden flex flex-col items-center mt-3 transition-all duration-300 overflow-hidden 
        ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <Link href="/"><p className="py-1 text-black">Home</p></Link>
        <Link href="/photos"><p className="py-1 text-black">Photos</p></Link>
        <Link href="/blog"><p className="py-1 text-black">Blog</p></Link>
        <Link href="/projects"><p className="py-1 text-black">Projects</p></Link>
        <Link href="/sriabhi"><p className="py-1 text-black">About me</p></Link>
      </div>
    </header>
  );
}
