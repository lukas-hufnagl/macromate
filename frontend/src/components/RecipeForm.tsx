/**
 * MacroMate – RecipeForm Component (v2)
 * Per-ingredient editable nutrition with auto-sum from OpenFoodFacts data.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Recipe, RecipeCreate, RecipeUpdate, Ingredient, IngredientSuggestion } from '../types';
import { CATEGORY_OPTIONS, MEAL_TYPE_OPTIONS, UNIT_OPTIONS } from '../types';
import { X, Plus, Trash2, Loader2, Save, Zap, ChevronDown, ChevronUp, Info, GripVertical } from 'lucide-react';
import { recipesAPI } from '../services/api';
import IngredientAutocomplete from './IngredientAutocomplete';
import CustomSelect from './CustomSelect';
import clsx from 'clsx';

interface Props {
  recipe?: Recipe | null;
  onSubmit: (data: RecipeCreate | RecipeUpdate) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

const EMPTY_INGREDIENT: Ingredient = {
  name: '',
  quantity: 100,
  unit: 'g',
  calories_100g: 0,
  protein_100g: 0,
  fat_100g: 0,
  carbs_100g: 0,
};

/** Computes total macros for a single ingredient based on quantity + per-100g values */
function computeIngredientTotals(ing: Ingredient): Ingredient {
  // For gram-based units, compute proportionally; for non-gram units, use per-100g as estimate
  const factor = ing.unit === 'g' || ing.unit === 'ml' ? ing.quantity / 100 : ing.quantity;
  return {
    ...ing,
    calories_total: Math.round((ing.calories_100g || 0) * factor),
    protein_total: Math.round((ing.protein_100g || 0) * factor * 10) / 10,
    fat_total: Math.round((ing.fat_100g || 0) * factor * 10) / 10,
    carbs_total: Math.round((ing.carbs_100g || 0) * factor * 10) / 10,
  };
}

export default function RecipeForm({ recipe, onSubmit, onClose, isLoading }: Props) {
  const isEditing = !!recipe;

  const [form, setForm] = useState({
    name: '',
    description: '',
    instructions: '',
    category: 'vegan' as string,
    meal_type: 'hauptgericht' as string,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    servings: 1,
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { ...EMPTY_INGREDIENT },
  ]);

  const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null);
  const [useAutoSum, setUseAutoSum] = useState(true);
  const [steps, setSteps] = useState<string[]>(['']);

  // Beim Bearbeiten: Formular mit bestehenden Daten befüllen
  useEffect(() => {
    if (recipe) {
      setForm({
        name: recipe.name,
        description: recipe.description || '',
        instructions: recipe.instructions || '',
        category: recipe.category,
        meal_type: recipe.meal_type,
        calories: recipe.calories,
        protein: recipe.protein,
        fat: recipe.fat,
        carbs: recipe.carbs,
        servings: recipe.servings,
      });
      // Parse instructions into steps
      const instrText = recipe.instructions || '';
      const parsed = instrText
        .split(/\n/)
        .map((s) => s.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(Boolean);
      setSteps(parsed.length > 0 ? parsed : ['']);
      setIngredients(
        recipe.ingredients.length > 0
          ? recipe.ingredients.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unit: i.unit,
              calories_100g: i.calories_100g || 0,
              protein_100g: i.protein_100g || 0,
              fat_100g: i.fat_100g || 0,
              carbs_100g: i.carbs_100g || 0,
            }))
          : [{ ...EMPTY_INGREDIENT }],
      );
      // If existing recipe has no ingredient nutrition, disable auto-sum
      const hasNutritionData = recipe.ingredients.some((i) => (i.calories_100g || 0) > 0);
      if (!hasNutritionData && recipe.calories > 0) {
        setUseAutoSum(false);
      }
    }
  }, [recipe]);

  // Compute per-ingredient totals
  const ingredientsWithTotals = useMemo(
    () => ingredients.map(computeIngredientTotals),
    [ingredients],
  );

  // Auto-sum total macros from all ingredients
  const autoSumTotals = useMemo(() => {
    const totals = ingredientsWithTotals.reduce(
      (acc, ing) => ({
        calories: acc.calories + (ing.calories_total || 0),
        protein: acc.protein + (ing.protein_total || 0),
        fat: acc.fat + (ing.fat_total || 0),
        carbs: acc.carbs + (ing.carbs_total || 0),
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 },
    );
    const servings = form.servings || 1;
    return {
      calories: Math.round(totals.calories / servings),
      protein: Math.round(totals.protein / servings * 10) / 10,
      fat: Math.round(totals.fat / servings * 10) / 10,
      carbs: Math.round(totals.carbs / servings * 10) / 10,
    };
  }, [ingredientsWithTotals, form.servings]);

  // Apply auto-sum when enabled and ingredients change
  useEffect(() => {
    if (useAutoSum) {
      const hasAnyNutrition = ingredients.some((i) => (i.calories_100g || 0) > 0);
      if (hasAnyNutrition) {
        setForm((prev) => ({
          ...prev,
          calories: autoSumTotals.calories,
          protein: autoSumTotals.protein,
          fat: autoSumTotals.fat,
          carbs: autoSumTotals.carbs,
        }));
      }
    }
  }, [autoSumTotals, useAutoSum]);

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
    );
  };

  const handleIngredientSelect = (index: number, suggestion: IngredientSuggestion) => {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? {
              ...ing,
              name: suggestion.name,
              calories_100g: suggestion.calories_100g,
              protein_100g: suggestion.protein_100g,
              fat_100g: suggestion.fat_100g,
              carbs_100g: suggestion.carbs_100g,
            }
          : ing,
      ),
    );
    // Enable auto-sum when user selects from search
    setUseAutoSum(true);
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
    if (expandedIngredient === index) setExpandedIngredient(null);
  };

  // ── Step Management ──
  const updateStep = useCallback((index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  }, []);

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, '']);
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveStep = useCallback((from: number, to: number) => {
    setSteps((prev) => {
      const newSteps = [...prev];
      const [moved] = newSteps.splice(from, 1);
      newSteps.splice(to, 0, moved);
      return newSteps;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter((i) => i.name.trim() !== '');
    const validSteps = steps.filter((s) => s.trim() !== '');
    const instructions = validSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    await onSubmit({
      ...form,
      instructions,
      ingredients: validIngredients,
    } as RecipeCreate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] dark:backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800/50 rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 sm:p-6 pb-4 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-800/50 rounded-t-2xl">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Rezept bearbeiten' : 'Neues Rezept'}
            </h2>
            <p className="text-xs text-gray-400 dark:text-dark-500 mt-0.5">
              Nährwerte werden automatisch aus den Zutaten berechnet
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Name & Beschreibung */}
          <div className="space-y-4">
            <div>
              <label className="input-label">Rezeptname *</label>
              <input
                type="text"
                className="input"
                placeholder="z.B. Protein-Porridge"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="input-label">Beschreibung</label>
              <textarea
                className="input min-h-[72px] resize-none"
                placeholder="Kurze Beschreibung des Rezepts..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </div>

          {/* Kategorie & Mahlzeittyp & Portionen */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="input-label">Kategorie *</label>
              <CustomSelect
                options={CATEGORY_OPTIONS}
                value={form.category}
                onChange={(val) => updateField('category', val)}
                size="sm"
              />
            </div>
            <div>
              <label className="input-label">Mahlzeittyp</label>
              <CustomSelect
                options={MEAL_TYPE_OPTIONS}
                value={form.meal_type}
                onChange={(val) => updateField('meal_type', val)}
                size="sm"
              />
            </div>
            <div>
              <label className="input-label">Portionen</label>
              <input
                type="number"
                className="input text-center text-sm"
                min={1}
                value={form.servings}
                onChange={(e) => updateField('servings', Number(e.target.value))}
              />
            </div>
          </div>

          {/* ═══════ ZUTATEN MIT INLINE-NÄHRWERTEN ═══════ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-200 flex items-center gap-2">
                  Zutaten
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-dark-500 mt-0.5">
                  Nährwerte werden beim Auswählen automatisch geladen
                </p>
              </div>
              <button
                type="button"
                onClick={addIngredient}
                className="btn-ghost text-accent-400 text-sm"
              >
                <Plus size={16} />
                Hinzufügen
              </button>
            </div>

            <div className="space-y-2">
              {ingredientsWithTotals.map((ing, index) => {
                const hasNutrition = (ing.calories_100g || 0) > 0;
                const isExpanded = expandedIngredient === index;

                return (
                  <div
                    key={index}
                    className={clsx(
                      'rounded-xl border transition-all duration-200',
                      hasNutrition
                        ? 'bg-accent-50/30 dark:bg-accent-500/5 border-accent-200/50 dark:border-accent-500/20'
                        : 'bg-gray-50 dark:bg-dark-900/30 border-gray-200 dark:border-dark-800/30',
                    )}
                  >
                    {/* Main row: name + quantity + unit + delete */}
                    <div className="flex items-center gap-2 p-3">
                      <IngredientAutocomplete
                        value={ing.name}
                        onChange={(name) => updateIngredient(index, 'name', name)}
                        onSelect={(suggestion) => handleIngredientSelect(index, suggestion)}
                        placeholder="Zutat suchen..."
                        compact
                      />
                      <input
                        type="number"
                        className="input w-20 sm:w-24 text-center text-sm py-2 px-2"
                        placeholder="Menge"
                        min={0}
                        step={0.1}
                        value={ing.quantity || ''}
                        onChange={(e) =>
                          updateIngredient(index, 'quantity', Number(e.target.value))
                        }
                      />
                      <CustomSelect
                        className="w-20 sm:w-24"
                        options={UNIT_OPTIONS}
                        value={ing.unit}
                        onChange={(val) => updateIngredient(index, 'unit', val)}
                        size="sm"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-1.5 text-gray-400 dark:text-dark-500 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {/* Nutrition summary mini-bar (always visible when data exists) */}
                    {hasNutrition && (
                      <div className="px-3 pb-2">
                        <button
                          type="button"
                          onClick={() => setExpandedIngredient(isExpanded ? null : index)}
                          className="w-full flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-white/60 dark:bg-dark-800/40 hover:bg-white dark:hover:bg-dark-800/60 transition-colors group"
                        >
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-fire-400 font-bold">{ing.calories_total} kcal</span>
                            <span className="text-gray-500 dark:text-dark-400">
                              <span className="text-blue-400 font-semibold">P</span> {ing.protein_total}g
                            </span>
                            <span className="text-gray-500 dark:text-dark-400">
                              <span className="text-yellow-400 font-semibold">F</span> {ing.fat_total}g
                            </span>
                            <span className="text-gray-500 dark:text-dark-400">
                              <span className="text-purple-400 font-semibold">C</span> {ing.carbs_total}g
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-dark-500 group-hover:text-accent-400 transition-colors">
                            <span>{isExpanded ? 'Weniger' : 'Bearbeiten'}</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </div>
                        </button>

                        {/* Expanded: editable per-100g values */}
                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-lg bg-white/80 dark:bg-dark-800/60 border border-gray-100 dark:border-dark-700/30 animate-fade-in">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Info size={12} className="text-gray-400 dark:text-dark-500" />
                              <span className="text-[10px] text-gray-400 dark:text-dark-500 uppercase tracking-wider font-medium">
                                Nährwerte pro 100g — manuell anpassbar
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] text-fire-400 font-medium block mb-1">kcal</label>
                                <input
                                  type="number"
                                  className="input text-center text-xs py-1.5 px-2"
                                  min={0}
                                  value={ing.calories_100g || ''}
                                  onChange={(e) =>
                                    updateIngredient(index, 'calories_100g', Number(e.target.value))
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-blue-400 font-medium block mb-1">Protein (g)</label>
                                <input
                                  type="number"
                                  className="input text-center text-xs py-1.5 px-2"
                                  min={0}
                                  step={0.1}
                                  value={ing.protein_100g || ''}
                                  onChange={(e) =>
                                    updateIngredient(index, 'protein_100g', Number(e.target.value))
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-yellow-400 font-medium block mb-1">Fett (g)</label>
                                <input
                                  type="number"
                                  className="input text-center text-xs py-1.5 px-2"
                                  min={0}
                                  step={0.1}
                                  value={ing.fat_100g || ''}
                                  onChange={(e) =>
                                    updateIngredient(index, 'fat_100g', Number(e.target.value))
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-purple-400 font-medium block mb-1">Carbs (g)</label>
                                <input
                                  type="number"
                                  className="input text-center text-xs py-1.5 px-2"
                                  min={0}
                                  step={0.1}
                                  value={ing.carbs_100g || ''}
                                  onChange={(e) =>
                                    updateIngredient(index, 'carbs_100g', Number(e.target.value))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══════ NÄHRWERTE GESAMT ═══════ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-200 uppercase tracking-wider">
                Nährwerte pro Portion
              </h3>
              <div className="flex items-center gap-2">
                {/* Auto-sum toggle */}
                <button
                  type="button"
                  onClick={() => setUseAutoSum(!useAutoSum)}
                  className={clsx(
                    'text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1',
                    useAutoSum
                      ? 'bg-accent-100 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-dark-400',
                  )}
                >
                  <Zap size={12} />
                  Auto-Summe {useAutoSum ? 'AN' : 'AUS'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <div className="p-3 rounded-xl bg-fire-400/10 border border-fire-400/20 text-center">
                <label className="text-[10px] text-fire-400 font-medium block mb-1">🔥 Kalorien</label>
                <input
                  type="number"
                  className="input text-center text-sm font-bold py-1.5"
                  placeholder="kcal"
                  min={0}
                  value={form.calories || ''}
                  onChange={(e) => {
                    updateField('calories', Number(e.target.value));
                    setUseAutoSum(false);
                  }}
                />
              </div>
              <div className="p-3 rounded-xl bg-blue-400/10 border border-blue-400/20 text-center">
                <label className="text-[10px] text-blue-400 font-medium block mb-1">💪 Protein</label>
                <input
                  type="number"
                  className="input text-center text-sm font-bold py-1.5"
                  placeholder="g"
                  min={0}
                  step={0.1}
                  value={form.protein || ''}
                  onChange={(e) => {
                    updateField('protein', Number(e.target.value));
                    setUseAutoSum(false);
                  }}
                />
              </div>
              <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-center">
                <label className="text-[10px] text-yellow-400 font-medium block mb-1">🫧 Fett</label>
                <input
                  type="number"
                  className="input text-center text-sm font-bold py-1.5"
                  placeholder="g"
                  min={0}
                  step={0.1}
                  value={form.fat || ''}
                  onChange={(e) => {
                    updateField('fat', Number(e.target.value));
                    setUseAutoSum(false);
                  }}
                />
              </div>
              <div className="p-3 rounded-xl bg-purple-400/10 border border-purple-400/20 text-center">
                <label className="text-[10px] text-purple-400 font-medium block mb-1">🌾 Carbs</label>
                <input
                  type="number"
                  className="input text-center text-sm font-bold py-1.5"
                  placeholder="g"
                  min={0}
                  step={0.1}
                  value={form.carbs || ''}
                  onChange={(e) => {
                    updateField('carbs', Number(e.target.value));
                    setUseAutoSum(false);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Zubereitung – Step by Step */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-200 flex items-center gap-2">
                  <span className="text-accent-400">📝</span>
                  Zubereitung
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-dark-500 mt-0.5">
                  Schritt für Schritt Anleitung
                </p>
              </div>
              <button
                type="button"
                onClick={addStep}
                className="btn-ghost text-accent-400 text-sm"
              >
                <Plus size={16} />
                Schritt
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <div className="flex flex-col items-center pt-2.5 gap-1">
                    <span className="w-6 h-6 rounded-full bg-accent-500/10 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveStep(index, index - 1)}
                        className="p-0.5 text-gray-300 dark:text-dark-600 hover:text-accent-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Nach oben"
                      >
                        <ChevronUp size={12} />
                      </button>
                    )}
                    {index < steps.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveStep(index, index + 1)}
                        className="p-0.5 text-gray-300 dark:text-dark-600 hover:text-accent-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Nach unten"
                      >
                        <ChevronDown size={12} />
                      </button>
                    )}
                  </div>
                  <textarea
                    className="input min-h-[44px] resize-none text-sm flex-1"
                    placeholder={`Schritt ${index + 1}...`}
                    value={step}
                    rows={1}
                    onChange={(e) => {
                      updateStep(index, e.target.value);
                      // Auto-resize
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (index === steps.length - 1) {
                          addStep();
                        }
                        // Focus next step after render
                        setTimeout(() => {
                          const nextInput = e.currentTarget.parentElement?.nextElementSibling?.querySelector('textarea');
                          nextInput?.focus();
                        }, 50);
                      }
                    }}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-1.5 mt-2 text-gray-300 dark:text-dark-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-800/50">
            <button type="button" onClick={onClose} className="btn-secondary">
              Abbrechen
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? 'Aktualisieren' : 'Rezept erstellen'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
