// src/hooks/usePhotoStore.ts
import { create } from "zustand";

export interface Metadata {
  aperture?: string;
  date_taken?: string;
  model?: string;
  uploaded_at?: string;
  iso?: number;
  focal_length?: string;
  exposure_time?: string;
  film?: boolean;
  film_type?: string;
  shutter_speed?: string;
  description?: string;
  geotag?: number[];
}

export interface PhotoWithMetadata {
  pid: string;
  url: string;
  metadata: Metadata | null;
  location?: string;
}

export interface PhotoUrlsResponse {
  photos: PhotoWithMetadata[],
  total: number,
  coverUrl: string,
  lastUpdated: string
}

interface PhotoStore {
  photoData: Record<string, {
    photos: PhotoWithMetadata[];
    total: number;
    coverUrl: string | null;
    lastUpdated: string | null;
  }>;
  loading: Record<string, boolean>;
  error: string | null;
  fetchFolder: (folder: string) => Promise<void>;
}


export const usePhotoStore = create<PhotoStore>((set, get) => ({
  photoData: {},
  loading: {},
  error: null,

  fetchFolder: async (folder: string) => {
    if (get().photoData[folder] || get().loading[folder]) return;
    set(state => ({ loading: { ...state.loading, [folder]: true } }));

    try {
      const res = await fetch(`/api/list-photos?folder=${encodeURIComponent(folder)}`);
      const data = await res.json();
      set(state => ({
        photoData: { ...state.photoData, [folder]: data },
        loading: { ...state.loading, [folder]: false },
      }));
    } catch (err: any) {
      set(state => ({
        loading: { ...state.loading, [folder]: false },
        error: err.message,
      }));
    }
  }
}));