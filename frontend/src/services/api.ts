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
  SubscriptionStatus,
  Subscription,
  ProfileData,
  TDEEResult,
  Household,
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

  discover: async (category?: string, mealType?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (mealType) params.meal_type = mealType;
    const res = await api.get('/recipes/discover', { params });
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

  share: async (planId: number): Promise<string> => {
    const res = await api.post<{ share_token: string }>(`/mealplans/${planId}/share`);
    return res.data.share_token;
  },

  unshare: async (planId: number): Promise<void> => {
    await api.delete(`/mealplans/${planId}/share`);
  },

  getShared: async (shareToken: string): Promise<MealPlan> => {
    const res = await api.get<MealPlan>(`/mealplans/shared/${shareToken}`);
    return res.data;
  },
};

export default api;

// ── Subscription API ──

export const subscriptionAPI = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const res = await api.get<SubscriptionStatus>('/subscriptions/status');
    return res.data;
  },

  getSubscription: async (): Promise<Subscription | null> => {
    const res = await api.get<Subscription | null>('/subscriptions/');
    return res.data;
  },

  getCheckoutUrl: async (variantId: string): Promise<string> => {
    const res = await api.post<{ checkout_url: string }>(`/subscriptions/checkout-url?variant_id=${variantId}`);
    return res.data.checkout_url;
  },
};

// ── Favorites API ──

export const favoritesAPI = {
  getAll: async (): Promise<number[]> => {
    const res = await api.get<{ favorites: number[] }>('/favorites/');
    return res.data.favorites;
  },

  add: async (recipeId: number): Promise<void> => {
    await api.post(`/favorites/${recipeId}`);
  },

  remove: async (recipeId: number): Promise<void> => {
    await api.delete(`/favorites/${recipeId}`);
  },
};

// ── Profile API ──

export const profileAPI = {
  get: async (): Promise<ProfileData> => {
    const res = await api.get<ProfileData>('/profile');
    return res.data;
  },

  update: async (data: Partial<ProfileData>): Promise<ProfileData> => {
    const res = await api.put<ProfileData>('/profile', data);
    return res.data;
  },

  getTDEE: async (): Promise<TDEEResult> => {
    const res = await api.get<TDEEResult>('/profile/tdee');
    return res.data;
  },

  previewTDEE: async (data: Partial<ProfileData>): Promise<TDEEResult> => {
    const res = await api.post<TDEEResult>('/profile/tdee/preview', data);
    return res.data;
  },
};

// ── Household API ──

export const householdAPI = {
  create: async (name: string): Promise<Household> => {
    const res = await api.post<Household>('/households', { name });
    return res.data;
  },

  getMine: async (): Promise<Household | null> => {
    const res = await api.get<Household | null>('/households/mine');
    return res.data;
  },

  join: async (inviteCode: string): Promise<Household> => {
    const res = await api.post<Household>('/households/join', { invite_code: inviteCode });
    return res.data;
  },

  leave: async (): Promise<void> => {
    await api.post('/households/leave');
  },

  regenerateCode: async (): Promise<Household> => {
    const res = await api.post<Household>('/households/regenerate-code');
    return res.data;
  },

  removeMember: async (userId: number): Promise<void> => {
    await api.delete(`/households/remove-member/${userId}`);
  },

  getMealPlans: async (householdId: number) => {
    const res = await api.get(`/households/${householdId}/mealplans`);
    return res.data;
  },
};
