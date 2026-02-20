/**
 * MacroMate – Meal Planner Page
 * Tages- und Wochenplanung mit Makro-Zielen.
 */

import { useState, useEffect } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useRecipeStore } from '../stores/recipeStore';
import { useMealPlanStore } from '../stores/mealPlanStore';
import MacroGoalForm from '../components/MacroGoalForm';
import MealPlanView from '../components/MealPlanView';
import WeeklyPlanner from '../components/WeeklyPlanner';
import { useConfirm } from '../components/ConfirmDialog';
import { CATEGORY_OPTIONS } from '../types';
import {
  Calendar,
  Sparkles,
  Loader2,
  ChevronDown,
  History,
  Trash2,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function MealPlannerPage() {
  const { goals } = useGoalStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  const {
    mealPlans,
    currentPlan,
    isGenerating,
    generatePlan,
    fetchPlans,
    deletePlan,
    setCurrentPlan,
  } = useMealPlanStore();

  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchRecipes();
    fetchPlans();
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleGenerate = async () => {
    if (recipes.length === 0) {
      toast.error('Bitte erst Rezepte anlegen!');
      return;
    }

    try {
      const plan = await generatePlan({
        date: selectedDate,
        goals,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      toast.success('Tagesplan generiert! 🎉');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePlan = async (id: number) => {
    const ok = await confirm({
      title: 'Plan löschen?',
      message: 'Möchtest du diesen Tagesplan wirklich löschen? Das kann nicht rückgängig gemacht werden.',
      confirmText: 'Löschen',
      variant: 'danger',
    });
    if (ok) {
      await deletePlan(id);
      toast.success('Plan gelöscht');
    }
  };

  const handleGenerateForDate = async (date: string) => {
    if (recipes.length === 0) {
      toast.error('Bitte erst Rezepte anlegen!');
      return;
    }
    try {
      await generatePlan({
        date,
        goals,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      toast.success('Tagesplan generiert! 🎉');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Calendar size={28} className="text-accent-400" />
            Meal Planner
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            Plane deine Mahlzeiten für den Tag oder die ganze Woche
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-xl border border-gray-200 dark:border-dark-700/30 overflow-hidden">
          <button
            onClick={() => setViewMode('day')}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all',
              viewMode === 'day'
                ? 'bg-accent-500/15 text-accent-600 dark:text-accent-400'
                : 'text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
            )}
          >
            <CalendarDays size={16} />
            Tag
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all border-l border-gray-200 dark:border-dark-700/30',
              viewMode === 'week'
                ? 'bg-accent-500/15 text-accent-600 dark:text-accent-400'
                : 'text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
            )}
          >
            <CalendarRange size={16} />
            Woche
          </button>
        </div>
      </div>

      {/* Generator Section */}
      {viewMode === 'week' ? (
        /* ── Weekly View ── */
        <div className="space-y-6">
          <MacroGoalForm />

          {/* Category Filter */}
          <div className="glass-card p-4">
            <label className="input-label mb-2 block">Kategorien filtern (optional)</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleCategory(opt.value)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                    selectedCategories.includes(opt.value)
                      ? 'bg-accent-500/20 border-accent-500/40 text-accent-400'
                      : 'bg-gray-100 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700/30 text-gray-500 dark:text-dark-400 hover:border-gray-300 dark:hover:border-dark-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <WeeklyPlanner
            mealPlans={mealPlans}
            onGenerateDay={handleGenerateForDate}
            onDeletePlan={handleDeletePlan}
            isGenerating={isGenerating}
          />
        </div>
      ) : (
      /* ── Day View ── */
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Macro Goals */}
          <MacroGoalForm />

          {/* Date & Filters */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Plan-Einstellungen</h3>

            {/* Date Picker */}
            <div className="mb-5">
              <label className="input-label">Datum</label>
              <input
                type="date"
                className="input w-full sm:w-64"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="input-label">
                Kategorien filtern (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleCategory(opt.value)}
                    className={clsx(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                      selectedCategories.includes(opt.value)
                        ? 'bg-accent-500/20 border-accent-500/40 text-accent-400'
                        : 'bg-gray-100 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700/30 text-gray-500 dark:text-dark-400 hover:border-gray-300 dark:hover:border-dark-600'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-dark-500 mt-2">
                  Nur Rezepte aus gewählten Kategorien werden berücksichtigt
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Generate Button & Info */}
        <div className="space-y-4">
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-500/20">
              <Sparkles size={28} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Plan generieren</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400 mb-6">
              Der Algorithmus wählt die besten Rezepte für deine Makroziele aus
              und berechnet optimale Portionsgrößen.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || recipes.length === 0}
              className="btn-primary w-full text-base"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Wird generiert...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Tagesplan generieren
                </>
              )}
            </button>
            {recipes.length === 0 && (
              <p className="text-xs text-red-400 mt-3">
                ⚠️ Du brauchst mindestens ein Rezept
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="glass-card p-5">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">Verfügbare Rezepte</span>
                <span className="text-gray-900 dark:text-white font-semibold">{recipes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">Gespeicherte Pläne</span>
                <span className="text-gray-900 dark:text-white font-semibold">{mealPlans.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">Ziel-Kalorien</span>
                <span className="text-fire-400 font-semibold">{goals.calories} kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Generated Plan */}
      {currentPlan && (
        <div className="animate-slide-up">
          <MealPlanView plan={currentPlan} onDelete={handleDeletePlan} />
        </div>
      )}

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4 group"
        >
          <History size={22} className="text-accent-400" />
          Bisherige Pläne ({mealPlans.length})
          <ChevronDown
            size={18}
            className={clsx(
              'text-gray-400 dark:text-dark-400 transition-transform',
              showHistory && 'rotate-180'
            )}
          />
        </button>

        {showHistory && (
          <div className="space-y-4 animate-fade-in">
            {mealPlans.length > 0 ? (
              mealPlans.map((plan) => (
                <MealPlanView
                  key={plan.id}
                  plan={plan}
                  onDelete={handleDeletePlan}
                />
              ))
            ) : (
              <p className="text-gray-400 dark:text-dark-500 text-center py-8">
                Noch keine Pläne generiert.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
