/**
 * MacroMate – Recipe Store (Zustand)
 * Verwaltet alle Rezepte des Users inkl. CRUD-Operationen.
 */

import { create } from 'zustand';
import type { Recipe, RecipeCreate, RecipeUpdate } from '../types';
import { recipesAPI } from '../services/api';

interface RecipeState {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRecipes: (params?: { category?: string; meal_type?: string; search?: string }) => Promise<void>;
  createRecipe: (data: RecipeCreate) => Promise<Recipe>;
  updateRecipe: (id: number, data: RecipeUpdate) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  isLoading: false,
  error: null,

  fetchRecipes: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const recipes = await recipesAPI.getAll(params);
      set({ recipes, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Fehler beim Laden der Rezepte',
        isLoading: false,
      });
    }
  },

  createRecipe: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const recipe = await recipesAPI.create(data);
      set((state) => ({
        recipes: [recipe, ...state.recipes],
        isLoading: false,
      }));
      return recipe;
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Fehler beim Erstellen',
        isLoading: false,
      });
      throw err;
    }
  },

  updateRecipe: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await recipesAPI.update(id, data);
      set((state) => ({
        recipes: state.recipes.map((r) => (r.id === id ? updated : r)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Fehler beim Aktualisieren',
        isLoading: false,
      });
      throw err;
    }
  },

  deleteRecipe: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await recipesAPI.delete(id);
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Fehler beim Löschen',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
