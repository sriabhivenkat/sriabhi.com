  "use client";

  import Link from "next/link";
  import { useRouter } from "next/navigation";
  import React, { useState } from "react";
  import { logoutAdmin } from "../../functions/abhiPcCalls";

  export default function DashNav() {
    const [open, setOpen] = useState(false);

    return (
      <nav className="fixed top-0 left-0 w-full h-12 z-50 bg-[#F4F2F3]/80 backdrop-blur-md rounded-b-lg">
        <div className="mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo / Title */}
          <Link href="/">
            <h1 className="text-[#3D2B2E] font-serif-custom text-2xl sm:text-2xl leading-tight">
                Bookkeeper <span className="text-xs font-serif-custom">by</span><span className="text-xs font-serif-custom font-black"> sriabhi.com</span>
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
    const router = useRouter();
    const cls = mobile
      ? "py-1 text-black text-base bg-[#F4F2F3]/90 backdrop-blur-md"
      : "text-black hover:text-gray-600 transition";

    const handleLogout = async () => {
      setOpen(false);
      await logoutAdmin();
      router.replace("/internal/login");
    };

    return (
      <>
        <Link href="/internal" onClick={() => setOpen(false)}><p className={cls}>Home</p></Link>
        <Link href="/internal/finance_tools" onClick={() => setOpen(false)}><p className={cls}>Finance Tools</p></Link>
        <Link href="/internal/blog_tools" onClick={() => setOpen(false)}><p className={cls}>Blog Tools</p></Link>
        <Link href="/internal/photo_tools" onClick={() => setOpen(false)}><p className={cls}>Photo Tools</p></Link>
        <Link href="/internal/health_tools" onClick={() => setOpen(false)}><p className={cls}>Health Tools</p></Link>
        <button onClick={handleLogout} className={`${cls} text-left cursor-pointer bg-transparent border-0 p-0`}>Log out</button>
      </>
    );
  }
