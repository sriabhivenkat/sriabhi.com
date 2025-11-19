// src/components/PhotoInitializer.tsx
"use client";

import { useEffect } from "react";
import { usePhotoStore } from "../../hooks/usePhotoStore";

export default function PhotoInitializer() {
  const initialize = usePhotoStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null; // this component just triggers the fetch
}
