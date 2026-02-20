/**
 * Theme Store – Dark/Light Mode mit System-Erkennung
 * 
 * Speichert die Theme-Preference im localStorage.
 * Unterstützt: 'light' | 'dark' | 'system'
 */
import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  init: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: (localStorage.getItem('macromate-theme') as ThemeMode) || 'dark',
  resolved: 'dark',

  setMode: (mode) => {
    const resolved = resolveTheme(mode);
    localStorage.setItem('macromate-theme', mode);
    applyTheme(resolved);
    set({ mode, resolved });
  },

  init: () => {
    const mode = get().mode;
    const resolved = resolveTheme(mode);
    applyTheme(resolved);
    set({ resolved });

    // System-Theme-Änderungen hören
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const current = get().mode;
      if (current === 'system') {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
        set({ resolved: newResolved });
      }
    });
  },
}));
