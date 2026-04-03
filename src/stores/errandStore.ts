import { create } from 'zustand';
import { Errand, ErrandCategory } from '@/types/database.types';

interface ErrandDraft {
  category: ErrandCategory | null;
  description: string;
  photoUrl: string | null;
  estimatedItemValue: number | null;
  pickupAddress: string;
  pickupReference: string;
  deliveryAddress: string;
  deliveryReference: string;
  estimatedKm: number | null;
  basePrice: number | null;
  distancePrice: number | null;
  totalPrice: number | null;
}

interface ErrandState {
  draft: ErrandDraft;
  activeErrand: Errand | null;
  errandHistory: Errand[];
  isLoading: boolean;
  updateDraft: (updates: Partial<ErrandDraft>) => void;
  resetDraft: () => void;
  setActiveErrand: (errand: Errand | null) => void;
  setErrandHistory: (errands: Errand[]) => void;
  setLoading: (loading: boolean) => void;
}

const initialDraft: ErrandDraft = {
  category: null,
  description: '',
  photoUrl: null,
  estimatedItemValue: null,
  pickupAddress: '',
  pickupReference: '',
  deliveryAddress: '',
  deliveryReference: '',
  estimatedKm: null,
  basePrice: null,
  distancePrice: null,
  totalPrice: null,
};

export const useErrandStore = create<ErrandState>((set) => ({
  draft: initialDraft,
  activeErrand: null,
  errandHistory: [],
  isLoading: false,

  updateDraft: (updates) =>
    set((state) => ({ draft: { ...state.draft, ...updates } })),

  resetDraft: () => set({ draft: initialDraft }),

  setActiveErrand: (errand) => set({ activeErrand: errand }),

  setErrandHistory: (errands) => set({ errandHistory: errands }),

  setLoading: (isLoading) => set({ isLoading }),
}));
