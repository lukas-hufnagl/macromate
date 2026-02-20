/**
 * MacroMate – Auth Store (Zustand)
 * Verwaltet Login-State, Token-Persistenz und User-Daten.
 */

import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ── Initial State (aus localStorage wiederherstellen) ──
  user: (() => {
    try {
      const stored = localStorage.getItem('macromate_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('macromate_token'),
  isAuthenticated: !!localStorage.getItem('macromate_token'),
  isLoading: false,
  error: null,

  // ── Login ──
  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(data);
      localStorage.setItem('macromate_token', response.access_token);
      localStorage.setItem('macromate_user', JSON.stringify(response.user));
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login fehlgeschlagen';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // ── Registrierung ──
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(data);
      localStorage.setItem('macromate_token', response.access_token);
      localStorage.setItem('macromate_user', JSON.stringify(response.user));
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Registrierung fehlgeschlagen';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // ── Logout ──
  logout: () => {
    localStorage.removeItem('macromate_token');
    localStorage.removeItem('macromate_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // ── Auth-Status prüfen (beim App-Start) ──
  checkAuth: async () => {
    const token = localStorage.getItem('macromate_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    try {
      const user = await authAPI.getMe();
      localStorage.setItem('macromate_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, token });
    } catch {
      localStorage.removeItem('macromate_token');
      localStorage.removeItem('macromate_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
