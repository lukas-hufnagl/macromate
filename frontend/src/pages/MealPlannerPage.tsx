/**
 * MacroMate – Meal Planner Page
 * Tages- und Wochenplanung mit Makro-Zielen.
 */

import { useState, useEffect } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useRecipeStore } from '../stores/recipeStore';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { useAuthStore } from '../stores/authStore';
import { useI18nStore } from '../stores/i18nStore';
import { householdAPI } from '../services/api';
import MacroGoalForm from '../components/MacroGoalForm';
import MealPlanView from '../components/MealPlanView';
import WeeklyPlanner from '../components/WeeklyPlanner';
import { useConfirm } from '../components/ConfirmDialog';
import { CATEGORY_OPTIONS } from '../types';
import type { Household } from '../types';
import {
  Calendar,
  Zap,
  Loader2,
  ChevronDown,
  History,
  Trash2,
  CalendarDays,
  CalendarRange,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface HouseholdPlan {
  id: number;
  user_id: number;
  username: string;
  date: string;
  target_calories: number;
  target_protein: number;
  target_fat: number;
  target_carbs: number;
}

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
  const { user } = useAuthStore();
  const t = useI18nStore((s) => s.t);

  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showHousehold, setShowHousehold] = useState(false);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdPlans, setHouseholdPlans] = useState<HouseholdPlan[]>([]);
  const [loadingHousehold, setLoadingHousehold] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchRecipes();
    fetchPlans();
  }, []);

  // Fetch household if user belongs to one
  useEffect(() => {
    if (user?.household_id) {
      householdAPI.getMine().then((h) => setHousehold(h)).catch(() => {});
    }
  }, [user?.household_id]);

  // Fetch household plans when toggled on
  useEffect(() => {
    if (showHousehold && household) {
      setLoadingHousehold(true);
      householdAPI
        .getMealPlans(household.id)
        .then((plans: HouseholdPlan[]) => setHouseholdPlans(plans))
        .catch(() => toast.error(t('general.error')))
        .finally(() => setLoadingHousehold(false));
    }
  }, [showHousehold, household]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleGenerate = async () => {
    try {
      const plan = await generatePlan({
        date: selectedDate,
        goals,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      toast.success(t('mealPlanner.planGenerated'));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePlan = async (id: number) => {
    const ok = await confirm({
      title: t('mealPlanner.deletePlan'),
      message: t('mealPlanner.deleteConfirm'),
      confirmText: t('recipes.delete'),
      variant: 'danger',
    });
    if (ok) {
      await deletePlan(id);
      toast.success(t('mealPlanner.planDeleted'));
    }
  };

  const handleGenerateForDate = async (date: string) => {
    try {
      await generatePlan({
        date,
        goals,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      toast.success(t('mealPlanner.planGenerated'));
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
            {t('mealPlanner.title')}
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            {t('mealPlanner.planSubtitle')}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex rounded-xl border border-gray-200 dark:border-dark-700/30 overflow-hidden">
            <button
              onClick={() => setViewMode('day')}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all',
                viewMode === 'day' && !showHousehold
                  ? 'bg-accent-500/15 text-accent-600 dark:text-accent-400'
                  : 'text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
              )}
            >
              <CalendarDays size={16} />
              {t('mealPlanner.day')}
            </button>
            <button
              onClick={() => { setViewMode('week'); setShowHousehold(false); }}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all border-l border-gray-200 dark:border-dark-700/30',
                viewMode === 'week' && !showHousehold
                  ? 'bg-accent-500/15 text-accent-600 dark:text-accent-400'
                  : 'text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
              )}
            >
              <CalendarRange size={16} />
              {t('mealPlanner.week')}
            </button>
          </div>
          {household && (
            <button
              onClick={() => setShowHousehold(!showHousehold)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border transition-all',
                showHousehold
                  ? 'bg-accent-500/15 border-accent-500/40 text-accent-600 dark:text-accent-400'
                  : 'border-gray-200 dark:border-dark-700/30 text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
              )}
            >
              <Users size={16} />
              {t('mealPlanner.household')}
            </button>
          )}
        </div>
      </div>

      {/* Household Plans View */}
      {showHousehold && household ? (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <Users size={22} className="text-accent-400" />
              {household.name} – {t('mealPlanner.householdPlans')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-400 mb-6">
              {t('mealPlanner.householdDesc')}
            </p>

            {loadingHousehold ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-accent-400" />
                <span className="ml-2 text-gray-500 dark:text-dark-400">{t('mealPlanner.loadingPlans')}</span>
              </div>
            ) : householdPlans.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-300 dark:text-dark-600 mb-3" />
                <p className="text-gray-500 dark:text-dark-400">
                  {t('mealPlanner.noHouseholdPlans')}
                </p>
                <p className="text-sm text-gray-400 dark:text-dark-500 mt-1">
                  {t('mealPlanner.noHouseholdHint')}
                </p>
              </div>
            ) : (
              (() => {
                // Group plans by member
                const byMember = householdPlans.reduce((acc, p) => {
                  if (!acc[p.username]) acc[p.username] = [];
                  acc[p.username].push(p);
                  return acc;
                }, {} as Record<string, HouseholdPlan[]>);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(byMember).map(([username, plans]) => (
                      <div
                        key={username}
                        className="rounded-xl border border-gray-200 dark:border-dark-700/30 bg-white/50 dark:bg-dark-800/30 p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-accent-600 dark:text-accent-400">
                              {username[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{username}</span>
                          <span className="text-xs text-gray-400 dark:text-dark-500">
                            {plans.length} {plans.length === 1 ? 'Plan' : 'Pläne'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {plans.slice(0, 5).map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-800/50"
                            >
                              <span className="text-gray-600 dark:text-dark-300 font-medium">
                                {new Date(plan.date).toLocaleDateString('de-DE', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                              <div className="flex flex-wrap gap-1.5 sm:gap-3 text-xs">
                                <span className="text-fire-400 font-semibold">{plan.target_calories} kcal</span>
                                <span className="text-blue-400">{plan.target_protein}g P</span>
                                <span className="text-amber-400">{plan.target_fat}g F</span>
                                <span className="text-accent-400">{plan.target_carbs}g K</span>
                              </div>
                            </div>
                          ))}
                          {plans.length > 5 && (
                            <p className="text-xs text-gray-400 dark:text-dark-500 text-center mt-1">
                              +{plans.length - 5} {t('mealPlanner.morePlans')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      ) : (
      <>
      {/* Generator Section */}
      {viewMode === 'week' ? (
        /* ── Weekly View ── */
        <div className="space-y-6">
          <MacroGoalForm />

          {/* Category Filter */}
          <div className="glass-card p-4">
            <label className="input-label mb-2 block">{t('mealPlanner.categoryFilter')}</label>
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('mealPlanner.settings')}</h3>

            {/* Date Picker */}
            <div className="mb-5">
              <label className="input-label">{t('mealPlanner.date')}</label>
              <input
                type="date"
                className="input w-full sm:w-64"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="input-label">
                {t('mealPlanner.categoryFilter')}
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
                  {t('mealPlanner.categoryHint')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Generate Button & Info */}
        <div className="space-y-4">
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-500/20">
              <Zap size={28} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('mealPlanner.generate')}</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400 mb-6">
              {t('mealPlanner.algorithmDesc')}
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary w-full text-base"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {t('mealPlanner.generating')}
                </>
              ) : (
                <>
                  <Zap size={20} />
                  {t('mealPlanner.dailyPlan')}
                </>
              )}
            </button>
            {recipes.length === 0 && (
              <p className="text-xs text-accent-500 mt-3">
                ⚡ {t('mealPlanner.builtinHint')}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="glass-card p-5">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">{t('mealPlanner.availableRecipes')}</span>
                <span className="text-gray-900 dark:text-white font-semibold">{recipes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">{t('mealPlanner.savedPlans')}</span>
                <span className="text-gray-900 dark:text-white font-semibold">{mealPlans.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">{t('mealPlanner.targetCalories')}</span>
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
          {t('mealPlanner.previousPlans')} ({mealPlans.length})
          <ChevronDown
            size={18}
            className={clsx(
              'text-gray-400 dark:text-dark-400 transition-transform',
              showHistory && 'rotate-180'
            )}
          />
        </button>

        {showHistory && (
          <div className="animate-fade-in">
            {mealPlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mealPlans.map((plan) => {
                  const dateObj = new Date(plan.date);
                  const dayName = dateObj.toLocaleDateString('de-DE', { weekday: 'short' });
                  const dayNum = dateObj.getDate();
                  const month = dateObj.toLocaleDateString('de-DE', { month: 'short' });
                  const calPct = plan.target_calories > 0
                    ? Math.round((plan.actual_calories / plan.target_calories) * 100)
                    : 0;

                  return (
                    <div
                      key={plan.id}
                      className="glass-card p-4 hover:border-accent-500/30 transition-all group/card cursor-pointer"
                      onClick={() => setCurrentPlan(plan)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Date badge */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-500/10 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-semibold text-accent-500 uppercase">{dayName}</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white -mt-0.5">{dayNum}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {dayNum}. {month}
                            </p>
                            <span className={clsx(
                              'text-xs font-bold px-2 py-0.5 rounded-full',
                              calPct >= 90 && calPct <= 110
                                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                                : calPct > 110
                                ? 'bg-red-500/15 text-red-500'
                                : 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
                            )}>
                              {calPct}%
                            </span>
                          </div>
                          <div className="flex gap-3 mt-1 text-[11px]">
                            <span className="text-fire-400 font-semibold">{Math.round(plan.actual_calories)} kcal</span>
                            <span className="text-blue-400">{Math.round(plan.actual_protein)}g P</span>
                            <span className="text-yellow-400">{Math.round(plan.actual_fat)}g F</span>
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                          className="p-1.5 rounded-lg text-gray-300 dark:text-dark-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover/card:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Meal count */}
                      <div className="flex gap-1 mt-2">
                        {plan.entries.map((entry) => (
                          <span
                            key={entry.id}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-800/50 text-gray-500 dark:text-dark-400 truncate max-w-[100px]"
                            title={entry.recipe.name}
                          >
                            {entry.recipe.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-dark-500 text-center py-8">
                {t('mealPlanner.noPlanYet')}
              </p>
            )}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
