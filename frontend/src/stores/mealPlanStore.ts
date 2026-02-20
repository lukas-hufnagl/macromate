/**
 * MacroMate – MealPlan Store (Zustand)
 * Verwaltet generierte Tagespläne und Einkaufslisten.
 */

import { create } from 'zustand';
import type { MealPlan, MealPlanGenerateRequest, ShoppingList } from '../types';
import { mealPlanAPI } from '../services/api';

interface MealPlanState {
  mealPlans: MealPlan[];
  currentPlan: MealPlan | null;
  shoppingList: ShoppingList | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  generatePlan: (data: MealPlanGenerateRequest) => Promise<MealPlan>;
  fetchPlans: (params?: { start_date?: string; end_date?: string }) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  fetchShoppingList: (startDate: string, endDate: string) => Promise<void>;
  setCurrentPlan: (plan: MealPlan | null) => void;
  clearError: () => void;
}

export const useMealPlanStore = create<MealPlanState>((set) => ({
  mealPlans: [],
  currentPlan: null,
  shoppingList: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  generatePlan: async (data) => {
    set({ isGenerating: true, error: null });
    try {
      const plan = await mealPlanAPI.generate(data);
      set((state) => ({
        currentPlan: plan,
        mealPlans: [plan, ...state.mealPlans.filter((p) => p.date !== plan.date)],
        isGenerating: false,
      }));
      return plan;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Fehler bei Plan-Generierung';
      set({ error: message, isGenerating: false });
      throw new Error(message);
    }
  },

  fetchPlans: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const plans = await mealPlanAPI.getAll(params);
      set({ mealPlans: plans, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Fehler beim Laden der Pläne',
        isLoading: false,
      });
    }
  },

  deletePlan: async (id) => {
    try {
      await mealPlanAPI.delete(id);
      set((state) => ({
        mealPlans: state.mealPlans.filter((p) => p.id !== id),
        currentPlan: state.currentPlan?.id === id ? null : state.currentPlan,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Fehler beim Löschen' });
    }
  },

  fetchShoppingList: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const list = await mealPlanAPI.getShoppingList(startDate, endDate);
      set({ shoppingList: list, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Fehler bei Einkaufsliste',
        isLoading: false,
      });
    }
  },

  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  clearError: () => set({ error: null }),
}));
