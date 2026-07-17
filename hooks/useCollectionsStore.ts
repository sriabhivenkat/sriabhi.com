import { create } from 'zustand';
import { getCollections } from '../functions/abhiPcCalls';

export interface Collection {
  name: string;
  grabPath: string;
  collection_id?: string;
  cover_url?: string;
}

interface CollectionStore {
  collections: Collection[];
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