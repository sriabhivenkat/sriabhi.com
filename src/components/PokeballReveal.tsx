"use client";

import { useState } from "react";

interface PokeballRevealProps {
  src: string;
  alt?: string;
  onClick: () => void;
}

export default function PokeballReveal({ src, alt = "pokemon", onClick}: PokeballRevealProps) {
  const [show, setShow] = useState(false); // Pokémon shown
  const [flash, setFlash] = useState(false); // Light flash
  const [shake, setShake] = useState(false); // Pokéball shaking

  const triggerReveal = () => {
    if (show) return;

    setShake(true); // start shaking

    // stop shaking after 0.8s, then flash
    setTimeout(() => {
      setShake(false);
      setFlash(true);
    }, 800);

    // finally show Pokémon
    setTimeout(() => {
      setFlash(false);
      setShow(true);
    }, 1050);
  };

  return (
    <div
      className="relative w-28 h-28 flex items-center justify-center cursor-pointer"
      onClick={triggerReveal}
    >
      {/* Smaller Pokéball image */}
      <img
        src="https://github.com/msikma/pokesprite/blob/master/icons/ball/poke.png?raw=true"
        alt="Pokéball"
        className={`
          absolute w-16 h-16 z-10
          transition-all duration-300
          ${shake ? "animate-pokeball-shake" : ""}
          ${show ? "opacity-0 scale-50" : "opacity-100 scale-100"}
        `}
      />

      {/* Light flash effect */}
      {flash && (
        <div
          className="absolute w-6 h-6 bg-white rounded-full animate-flash-expand z-20"
        />
      )}

      {/* Pokémon sprite stays full size */}
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        className={`
          absolute transition-all duration-500 z-30
          ${show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-100 -translate-y-6"}
        `}
      />
    </div>
  );
}
