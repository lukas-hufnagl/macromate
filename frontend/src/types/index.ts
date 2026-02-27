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
  plan?: string;
  onboarding_completed?: boolean;
  household_id?: number | null;
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

// ── Profile / Onboarding ──

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 'lose' | 'maintain' | 'gain';

export interface ProfileData {
  gender: Gender | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: ActivityLevel | null;
  goal: FitnessGoal | null;
  allergies: string[];
  diet_type: string | null;
  onboarding_completed: boolean;
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  target_calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  goal: string;
}

// ── Household ──

export interface HouseholdMember {
  id: number;
  username: string;
}

export interface Household {
  id: number;
  name: string;
  invite_code: string;
  invite_expires_at?: string | null;
  max_members: number;
  created_by: number;
  members: HouseholdMember[];
  created_at?: string;
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

// ── Ingredient Search ──

export interface IngredientSuggestion {
  name: string;
  calories_100g: number;
  protein_100g: number;
  fat_100g: number;
  carbs_100g: number;
  image_url?: string;
  brand?: string;
  source: 'openfoodfacts' | 'local' | 'manual';
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
  share_token?: string | null;
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

// ── Allergy & Diet Options ──

export const ALLERGY_OPTIONS: SelectOption[] = [
  { value: 'gluten', label: '🌾 Gluten' },
  { value: 'laktose', label: '🥛 Laktose' },
  { value: 'nüsse', label: '🥜 Nüsse' },
  { value: 'erdnüsse', label: '🥜 Erdnüsse' },
  { value: 'soja', label: '🫘 Soja' },
  { value: 'ei', label: '🥚 Eier' },
  { value: 'fisch', label: '🐟 Fisch' },
  { value: 'schalentiere', label: '🦐 Schalentiere' },
  { value: 'sellerie', label: '🥬 Sellerie' },
  { value: 'senf', label: '🟡 Senf' },
  { value: 'sesam', label: '⚪ Sesam' },
  { value: 'fructose', label: '🍎 Fruktose' },
];

export const DIET_OPTIONS: SelectOption[] = [
  { value: 'keine', label: '🍽️ Keine Einschränkung' },
  { value: 'vegetarisch', label: '🥚 Vegetarisch' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'pescetarisch', label: '🐟 Pescetarisch' },
  { value: 'keto', label: '🥑 Keto' },
  { value: 'paleo', label: '🍖 Paleo' },
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

// ── Subscription ──

export interface SubscriptionStatus {
  plan: string;
  is_active: boolean;
  is_premium: boolean;
  features: string[];
}

export interface Subscription {
  id: number;
  plan: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string;
  created_at?: string;
}
