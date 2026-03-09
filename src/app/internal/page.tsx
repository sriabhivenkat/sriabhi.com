"use client";
import React, { useEffect, useState } from "react";
import { getStoredAccessToken } from "../../../functions/abhiPcCalls";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = getStoredAccessToken();
    setToken(t);
    setChecked(true);
  }, []);

  if (!checked) return null;

  return token ? (
    <Dashboard token={token} />
  ) : (
    <Login onLoginSuccess={(t) => setToken(t)} />
  );
}
