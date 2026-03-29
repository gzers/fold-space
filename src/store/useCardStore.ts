import { create } from 'zustand';
import type { Fold } from '../db';
import { dbHooks } from '../db/hooks';

interface CardState {
  folds: Fold[];
  selectedFoldId: number | null;
  isLoading: boolean;
  loadFolds: () => Promise<void>;
  addFold: (fold: Omit<Fold, 'id'>) => Promise<void>;
  updateFoldPosition: (id: number, position: { x: number; y: number; z?: number }) => Promise<void>;
  updateFoldContent: (id: number, content: string, tags: string[], emotion: string) => Promise<void>;
  addConnection: (fromId: number, toId: number) => Promise<void>;
  removeFold: (id: number) => Promise<void>;
  setSelectedFoldId: (id: number | null) => void;
}

export const useCardStore = create<CardState>((set, get) => ({
  folds: [],
  selectedFoldId: null,
  isLoading: true,

  loadFolds: async () => {
    set({ isLoading: true });
    const folds = await dbHooks.getAllFolds();
    set({ folds, isLoading: false });
  },

  addFold: async (foldData) => {
    const id = await dbHooks.saveFold(foldData as Fold);
    const newFold = { ...foldData, id };
    set((state) => ({ folds: [...state.folds, newFold] }));
  },

  updateFoldPosition: async (id, position) => {
    const { folds } = get();
    const fold = folds.find(f => f.id === id);
    if (fold) {
      const updatedFold = { ...fold, position };
      await dbHooks.saveFold(updatedFold);
      set((state) => ({
        folds: state.folds.map(f => f.id === id ? updatedFold : f)
      }));
    }
  },

  updateFoldContent: async (id, content, tags, emotion) => {
    const { folds } = get();
    const fold = folds.find(f => f.id === id);
    if (fold) {
      const updatedFold = { ...fold, content, tags, emotion };
      await dbHooks.saveFold(updatedFold);
      set((state) => ({
        folds: state.folds.map(f => f.id === id ? updatedFold : f)
      }));
    }
  },

  addConnection: async (fromId, toId) => {
    const { folds } = get();
    const fromFold = folds.find(f => f.id === fromId);
    if (fromFold && !fromFold.connections.includes(toId)) {
      const updatedFold = { ...fromFold, connections: [...fromFold.connections, toId] };
      await dbHooks.saveFold(updatedFold);
      set((state) => ({
        folds: state.folds.map(f => f.id === fromId ? updatedFold : f)
      }));
    }
  },

  removeFold: async (id) => {
    await dbHooks.moveToTrash(id);
    set((state) => ({
      folds: state.folds.filter(f => f.id !== id),
      selectedFoldId: state.selectedFoldId === id ? null : state.selectedFoldId
    }));
  },

  setSelectedFoldId: (id) => set({ selectedFoldId: id }),
}));
