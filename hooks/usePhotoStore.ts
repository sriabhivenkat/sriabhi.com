// src/hooks/usePhotoStore.ts
import { create } from "zustand";
import { getAccessToken, getPhotoUrls } from "../functions/abhiPcCalls";

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

interface PhotoStore {
  photoPaths: Record<string, PhotoWithMetadata[]>;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
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
  "trips/oklahoma"
];

export const usePhotoStore = create<PhotoStore>((set, get) => {
  let initializing = false;

  const initialize = async () => {
    const { photoPaths } = get();
    if (Object.keys(photoPaths).length > 0 || initializing) return;

    initializing = true;
    set({ loading: true, error: null });

    try {
      // Fetch one access token for all folders
      const { access_token } = await getAccessToken();

      const results = await Promise.all(
        DEFAULT_SUBFOLDERS.map(async (folder) => {
          const photos = await getPhotoUrls(folder, access_token);
          const typedPhotos: PhotoWithMetadata[] = photos.map((p) => ({
            url: p.url,
            metadata: p.metadata || null,
          }));
          return [folder, typedPhotos] as const;
        })
      );

      set({ photoPaths: Object.fromEntries(results) });
    } catch (err: any) {
      console.error("Error initializing photos:", err);
      set({ error: err.message || "Unknown error" });
    } finally {
      set({ loading: false });
      initializing = false;
    }
  };

  return {
    photoPaths: {},
    loading: false,
    error: null,
    initialize,
  };
});
