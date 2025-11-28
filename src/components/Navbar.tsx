"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#F4F2F3]/80 backdrop-blur-md">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <Link href="/">
          <h1 className="text-lg font-semibold font-serif-custom tracking-wide text-black cursor-pointer">
            sriabhi.com
          </h1>
        </Link>

        {/* Hamburger (mobile only) */}
        <button
          className="sm:hidden text-3xl text-black"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "≡"}
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex space-x-8">
          <NavLinks setOpen={setOpen}/>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`sm:hidden transition-all duration-300 overflow-hidden ${
          open ? "max-h-60" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-start px-6 py-2 space-y-2 bg-[#F4F2F3]/90 backdrop-blur-md border-b border-black/5">
          <NavLinks mobile setOpen={setOpen}/>
        </div>
      </div>
    </nav>
  );
}

function NavLinks({ mobile = false, setOpen}: { mobile?: boolean, setOpen: any}) {
  const cls = mobile
    ? "py-1 text-black text-base bg-[#F4F2F3]/90 backdrop-blur-md"
    : "text-black hover:text-gray-600 transition";

  return (
    <>
      <Link href="/" onClick={() => setOpen(false)}><p className={cls}>Home</p></Link>
      <Link href="/photos" onClick={() => setOpen(false)}><p className={cls}>Photos</p></Link>
      <Link href="/blog" onClick={() => setOpen(false)}><p className={cls}>Blog</p></Link>
      <Link href="/projects" onClick={() => setOpen(false)}><p className={cls}>Projects</p></Link>
      <Link href="/sriabhi" onClick={() => setOpen(false)}><p className={cls}>About me</p></Link>
    </>
  );
}
