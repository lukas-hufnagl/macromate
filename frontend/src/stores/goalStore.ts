/**
 * MacroMate – Goal Store (Zustand)
 * Speichert die persönlichen Kalorien- und Makronährstoffziele.
 * Persistiert im localStorage.
 */

import { create } from 'zustand';
import type { MacroGoals } from '../types';

const DEFAULT_GOALS: MacroGoals = {
  calories: 2000,
  protein: 150,
  fat: 65,
  carbs: 250,
};

interface GoalState {
  goals: MacroGoals;
  setGoals: (goals: MacroGoals) => void;
  resetGoals: () => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: (() => {
    try {
      const stored = localStorage.getItem('macromate_goals');
      return stored ? JSON.parse(stored) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  })(),

  setGoals: (goals) => {
    localStorage.setItem('macromate_goals', JSON.stringify(goals));
    set({ goals });
  },

  resetGoals: () => {
    localStorage.setItem('macromate_goals', JSON.stringify(DEFAULT_GOALS));
    set({ goals: DEFAULT_GOALS });
  },
}));
