"use client";
import React, { useEffect, useState } from "react";
import { getStoredAccessToken } from "../../../../functions/abhiPcCalls";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import Navbar from "@/components/Navbar";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = getStoredAccessToken();
    setToken(t);
    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <div className="flex min-h-screen p-3 bg-[#F4F2F3] flex-col">
        <Navbar />
    </div>
  )
}
