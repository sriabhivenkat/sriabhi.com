import { create } from 'zustand';
import { getCollections } from '../functions/abhiPcCalls';

export interface PhotoLocation {
  name: string;
  grabPath: string;
}

interface CollectionStore {
  collections: PhotoLocation[];
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collections: [],
  loading: false,
  error: null,

  fetchCollections: async () => {
    if (get().collections.length > 0 || get().loading) return;
    set({ loading: true, error: null });
    try {
      const collections = await getCollections();
      set({ collections });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  }
}));