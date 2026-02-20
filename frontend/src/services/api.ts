/**
 * MacroMate – API Service
 * Zentraler HTTP-Client für alle Backend-Kommunikation.
 * Nutzt Axios mit automatischem Token-Handling.
 */

import axios, { AxiosError } from 'axios';
import type {
  TokenResponse,
  LoginRequest,
  RegisterRequest,
  Recipe,
  RecipeCreate,
  RecipeUpdate,
  MealPlan,
  MealPlanGenerateRequest,
  ShoppingList,
  User,
  MacroFilter,
  IngredientSuggestion,
} from '../types';

// ── Axios Instance ──
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: JWT-Token automatisch anhängen ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('macromate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Bei 401 → Token löschen & Redirect ──
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('macromate_token');
      localStorage.removeItem('macromate_user');
      // Nur redirecten wenn nicht schon auf Login/Register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──

export const authAPI = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>('/auth/login', data);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};

// ── Recipes API ──

export const recipesAPI = {
  getAll: async (params?: {
    category?: string;
    meal_type?: string;
    search?: string;
  } & MacroFilter): Promise<Recipe[]> => {
    const res = await api.get<Recipe[]>('/recipes/', { params });
    return res.data;
  },

  getById: async (id: number): Promise<Recipe> => {
    const res = await api.get<Recipe>(`/recipes/${id}`);
    return res.data;
  },

  create: async (data: RecipeCreate): Promise<Recipe> => {
    const res = await api.post<Recipe>('/recipes/', data);
    return res.data;
  },

  update: async (id: number, data: RecipeUpdate): Promise<Recipe> => {
    const res = await api.put<Recipe>(`/recipes/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/recipes/${id}`);
  },

  calculateNutrition: async (ingredients: { name: string; quantity: number; unit: string }[], servings: number = 1): Promise<{ calories: number; protein: number; fat: number; carbs: number }> => {
    const res = await api.post<{ calories: number; protein: number; fat: number; carbs: number }>('/recipes/calculate-nutrition', {
      ingredients,
      servings,
    });
    return res.data;
  },
};

// ── Ingredients Search API ──

export const ingredientsAPI = {
  search: async (query: string, lang: string = 'de', limit: number = 8): Promise<IngredientSuggestion[]> => {
    const res = await api.get<{ results: IngredientSuggestion[]; query: string; lang: string }>('/ingredients/search', {
      params: { q: query, lang, limit },
    });
    return res.data.results;
  },
};

// ── Image Recognition API ──

export const recognitionAPI = {
  recognizeImage: async (file: File): Promise<RecipeCreate & { confidence?: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/recognize/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return res.data;
  },

  getStatus: async (): Promise<{ available: boolean; provider: string | null }> => {
    const res = await api.get('/recognize/status');
    return res.data;
  },
};

// ── MealPlan API ──

export const mealPlanAPI = {
  generate: async (data: MealPlanGenerateRequest): Promise<MealPlan> => {
    const res = await api.post<MealPlan>('/mealplans/generate', data);
    return res.data;
  },

  getAll: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<MealPlan[]> => {
    const res = await api.get<MealPlan[]>('/mealplans/', { params });
    return res.data;
  },

  getById: async (id: number): Promise<MealPlan> => {
    const res = await api.get<MealPlan>(`/mealplans/${id}`);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/mealplans/${id}`);
  },

  getShoppingList: async (
    startDate: string,
    endDate: string
  ): Promise<ShoppingList> => {
    const res = await api.get<ShoppingList>('/mealplans/shopping-list/', {
      params: { start_date: startDate, end_date: endDate },
    });
    return res.data;
  },
};

export default api;
