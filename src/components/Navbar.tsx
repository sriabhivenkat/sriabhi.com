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
          <NavLinks setOpen={setOpen} />
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`sm:hidden grid transition-all duration-300 ease-in-out px-3 ${
          open ? "grid-rows-[1fr] opacity-100 pb-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col rounded-2xl bg-white/25 backdrop-blur-xl border border-white/40 shadow-lg px-3 py-2 mt-1">
            <NavLinks mobile setOpen={setOpen} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLinks({
  mobile = false,
  setOpen,
}: {
  mobile?: boolean;
  setOpen: (open: boolean) => void;
}) {
  const cls = mobile
    ? "block w-full py-2.5 px-2 rounded-lg text-black text-base transition-colors hover:bg-white/30 active:bg-white/40"
    : "text-black hover:text-gray-600 transition";

  return (
    <>
      <Link href="/" onClick={() => setOpen(false)}><p className={cls}>Home</p></Link>
      <Link href="/photos" onClick={() => setOpen(false)}><p className={cls}>Photos</p></Link>
      <Link href="/blog" onClick={() => setOpen(false)}><p className={cls}>Blog</p></Link>
      <Link href="/projects" onClick={() => setOpen(false)}><p className={cls}>Projects</p></Link>
      <Link href="/sriabhi" onClick={() => setOpen(false)}><p className={cls}>About me</p></Link>
      <Link href="/internal" onClick={() => setOpen(false)}><p className={cls}>Internal</p></Link>
    </>
  );
}