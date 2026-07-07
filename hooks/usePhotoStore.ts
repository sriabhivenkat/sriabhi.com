// src/hooks/usePhotoStore.ts
import { create } from "zustand";
import { getAccessToken, getCovers, getPhotoUrls } from "../functions/abhiPcCalls";

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
}

export interface PhotoWithMetadata {
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

const DEFAULT_SUBFOLDERS = [
  "trips/banff",
  "trips/dallas",
  "trips/nyc",
  "trips/japan",
  "trips/yosemite",
  "trips/alaska",
  "trips/rainier",
  "trips/austin",
  "trips/nola",
  "trips/cold_springs",
  "trips/oklahoma",
  "trips/new_mexico"
];

export const usePhotoStore = create<PhotoStore>((set, get) => ({
  photoData: {},
  loading: {},
  error: null,

  fetchFolder: async (folder: string) => {
    if (get().photoData[folder] || get().loading[folder]) return;
    set(state => ({ loading: { ...state.loading, [folder]: true } }));

    try {
      const { access_token } = await getAccessToken();
      const data = await getPhotoUrls(folder, access_token);
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