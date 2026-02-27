/**
 * MacroMate – Subscription Store
 * Zustand store für Abo-Status und Feature-Gates.
 */

import { create } from 'zustand';
import { subscriptionAPI, favoritesAPI } from '../services/api';
import type { SubscriptionStatus } from '../types';

interface SubscriptionState {
  status: SubscriptionStatus | null;
  favorites: Set<number>;
  isLoading: boolean;

  // Actions
  fetchStatus: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (recipeId: number) => Promise<void>;
  isFavorite: (recipeId: number) => boolean;
  canUseFeature: (feature: string) => boolean;
}

const FREE_LIMITS = {
  maxRecipes: 10,
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  status: null,
  favorites: new Set(),
  isLoading: false,

  fetchStatus: async () => {
    try {
      const status = await subscriptionAPI.getStatus();
      set({ status });
    } catch {
      // Fallback to free
      set({
        status: {
          plan: 'free',
          is_active: true,
          is_premium: false,
          features: [],
        },
      });
    }
  },

  fetchFavorites: async () => {
    try {
      const ids = await favoritesAPI.getAll();
      set({ favorites: new Set(ids) });
    } catch {
      // Ignore
    }
  },

  toggleFavorite: async (recipeId: number) => {
    const { favorites } = get();
    const isFav = favorites.has(recipeId);

    // Optimistic update
    const newFavs = new Set(favorites);
    if (isFav) {
      newFavs.delete(recipeId);
    } else {
      newFavs.add(recipeId);
    }
    set({ favorites: newFavs });

    try {
      if (isFav) {
        await favoritesAPI.remove(recipeId);
      } else {
        await favoritesAPI.add(recipeId);
      }
    } catch {
      // Revert on error
      set({ favorites });
    }
  },

  isFavorite: (recipeId: number) => {
    return get().favorites.has(recipeId);
  },

  canUseFeature: (feature: string) => {
    const { status } = get();
    if (!status) return true; // Loading state — allow
    if (status.is_premium) return true;

    // Free tier restrictions
    switch (feature) {
      case 'unlimited_recipes':
        return false;
      case 'weekly_plans':
        return false;
      case 'favorites':
        return false;
      default:
        return true;
    }
  },
}));
