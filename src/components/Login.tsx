"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { loginAdmin } from "../../functions/abhiPcCalls";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      await loginAdmin(user, pass);
      setError("");
      onLoginSuccess();
    } catch (e: any) {
      setError(e?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F4F2F3] flex flex-col justify-center items-center p-2">
      <Navbar />
      <div className="mt-4 lg:w-1/4 w-8/10 flex flex-col">
        <h1 className="text-3xl text-black mb-2 font-serif-custom text-left">Login</h1>
        <input
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="border p-2 text-black rounded-md"
        />
        <input
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          type="password"
          className="border p-2 text-black rounded-md mt-2"
        />
        <button
          className="rounded-md border p-1 text-black mt-2 hover:cursor-pointer"
          onClick={handleSubmit}
        >
          Submit
        </button>
        {error && <h1 className="text-red-400 text-md mt-2">{error}</h1>}
      </div>
    </div>
  );
}
