/**
 * MacroMate – TypeScript Type Definitions
 * Zentrale Interface-Definitionen, die Frontend-weit verwendet werden.
 */

// ── Auth ──

export interface User {
  id: number;
  username: string;
  email: string;
  is_premium?: boolean;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ── Ingredients ──

export interface Ingredient {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  // Per-ingredient nutrition (per 100g, auto-loaded from search, user-editable)
  calories_100g?: number;
  protein_100g?: number;
  fat_100g?: number;
  carbs_100g?: number;
  // Computed totals based on quantity
  calories_total?: number;
  protein_total?: number;
  fat_total?: number;
  carbs_total?: number;
}

// ── Recipes ──

export type RecipeCategory = 'vegan' | 'vegetarisch' | 'fleisch' | 'fisch';
export type MealType = 'frühstück' | 'hauptgericht' | 'snack' | 'dessert';

export interface Recipe {
  id: number;
  user_id: number;
  name: string;
  description: string;
  instructions: string;
  category: RecipeCategory;
  meal_type: MealType;
  image_url: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servings: number;
  ingredients: Ingredient[];
  created_at?: string;
  updated_at?: string;
}

export interface RecipeCreate {
  name: string;
  description?: string;
  instructions?: string;
  category: RecipeCategory;
  meal_type?: MealType;
  image_url?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  servings?: number;
  ingredients?: IngredientCreate[];
}

export interface IngredientCreate {
  name: string;
  quantity: number;
  unit: string;
}

// ── Ingredient Search (OpenFoodFacts + Gemini) ──

export interface IngredientSuggestion {
  name: string;
  calories_100g: number;
  protein_100g: number;
  fat_100g: number;
  carbs_100g: number;
  image_url?: string;
  brand?: string;
  source: 'openfoodfacts' | 'gemini' | 'usda';
}

export interface RecipeUpdate extends Partial<RecipeCreate> {}

// ── Macro Goals ──

export interface MacroGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

// ── Meal Plans ──

export interface MealPlanEntry {
  id: number;
  recipe_id: number;
  recipe: Recipe;
  servings: number;
  meal_slot: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
}

export interface MealPlan {
  id: number;
  date: string;
  target_calories: number;
  target_protein: number;
  target_fat: number;
  target_carbs: number;
  entries: MealPlanEntry[];
  actual_calories: number;
  actual_protein: number;
  actual_fat: number;
  actual_carbs: number;
  created_at?: string;
}

export interface MealPlanGenerateRequest {
  date: string;
  goals: MacroGoals;
  categories?: string[];
}

// ── Shopping List ──

export interface ShoppingListItem {
  name: string;
  total_quantity: number;
  unit: string;
}

export interface ShoppingList {
  items: ShoppingListItem[];
  start_date: string;
  end_date: string;
}

// ── UI Helpers ──

export interface SelectOption {
  value: string;
  label: string;
}

export const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'vegetarisch', label: '🥚 Vegetarisch' },
  { value: 'fleisch', label: '🥩 Fleisch' },
  { value: 'fisch', label: '🐟 Fisch' },
];

export const MEAL_TYPE_OPTIONS: SelectOption[] = [
  { value: 'frühstück', label: '🌅 Frühstück' },
  { value: 'hauptgericht', label: '🍽️ Hauptgericht' },
  { value: 'snack', label: '🍎 Snack' },
  { value: 'dessert', label: '🍰 Dessert' },
];

export const UNIT_OPTIONS: SelectOption[] = [
  { value: 'g', label: 'Gramm (g)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'Stück', label: 'Stück' },
  { value: 'EL', label: 'Esslöffel (EL)' },
  { value: 'TL', label: 'Teelöffel (TL)' },
  { value: 'Tasse', label: 'Tasse' },
  { value: 'Prise', label: 'Prise' },
  { value: 'Scheibe', label: 'Scheibe(n)' },
  { value: 'Bund', label: 'Bund' },
  { value: 'Dose', label: 'Dose(n)' },
  { value: 'Packung', label: 'Packung(en)' },
  { value: 'kg', label: 'Kilogramm (kg)' },
  { value: 'l', label: 'Liter (l)' },
];

// ── Macro Filter (for advanced search) ──

export interface MacroFilter {
  min_calories?: number;
  max_calories?: number;
  min_protein?: number;
  max_protein?: number;
  min_fat?: number;
  max_fat?: number;
  min_carbs?: number;
  max_carbs?: number;
}
