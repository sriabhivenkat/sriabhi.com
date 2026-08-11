"use client";
import React from "react";
import { getStoredAccessToken } from "../../../functions/abhiPcCalls";
import Dashboard from "@/components/Dashboard";

export default function Page() {
  return <Dashboard token={getStoredAccessToken()!} />;
}
