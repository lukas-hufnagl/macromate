/**
 * MacroMate – Dashboard Page
 * Yazio/MFP-inspired overview with calorie ring, today's plan, and quick actions.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useRecipeStore } from '../stores/recipeStore';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { useGoalStore } from '../stores/goalStore';
import MealPlanView from '../components/MealPlanView';
import MacroGoalForm from '../components/MacroGoalForm';
import {
  BookOpen,
  Calendar,
  TrendingUp,
  ChevronRight,
  Utensils,
  Target,
  Plus,
  Flame,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { useI18nStore } from '../stores/i18nStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  const { mealPlans, fetchPlans, deletePlan } = useMealPlanStore();
  const { goals } = useGoalStore();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [animateRing, setAnimateRing] = useState(false);
  const t = useI18nStore((s) => s.t);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchRecipes();
    fetchPlans({ start_date: today, end_date: today });
    // Trigger ring animation after mount
    const t = setTimeout(() => setAnimateRing(true), 100);
    return () => clearTimeout(t);
  }, []);

  const todayPlan = mealPlans.find((p) => p.date === today);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = t(hour < 12 ? 'dashboard.goodMorning' : hour < 18 ? 'dashboard.goodAfternoon' : 'dashboard.goodEvening');
  const emoji = hour < 12 ? '☀️' : hour < 18 ? '💪' : '🌙';

  // Today's macros from plan
  const todayMacros = todayPlan
    ? {
        calories: todayPlan.actual_calories,
        protein: todayPlan.actual_protein,
        fat: todayPlan.actual_fat,
        carbs: todayPlan.actual_carbs,
      }
    : { calories: 0, protein: 0, fat: 0, carbs: 0 };

  const calPct = goals.calories > 0 ? Math.min((todayMacros.calories / goals.calories) * 100, 100) : 0;
  const remaining = Math.max(goals.calories - todayMacros.calories, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 dark:text-dark-500 font-medium">{greeting} {emoji}</p>
          <h1 className="page-title mt-0.5">{user?.username} 👋</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/recipes" className="btn-secondary text-sm">
            <Plus size={16} />
            {t('recipes.title')}
          </Link>
          <Link to="/meal-planner" className="btn-primary text-sm">
            <Calendar size={16} />
            {t('dashboard.generatePlan')}
          </Link>
        </div>
      </div>

      {/* Getting Started Hint for new users */}
      {recipes.length === 0 && !todayPlan && (
        <div className="card p-5 border-accent-500/30 bg-accent-50/50 dark:bg-accent-500/5 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-accent-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {t('dashboard.gettingStarted')}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-dark-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span>{t('dashboard.step1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-500/60 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span>{t('dashboard.step2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-500/30 text-accent-700 dark:text-accent-300 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span>{t('dashboard.step3')}</span>
                </div>
              </div>
              <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 dark:text-accent-400 hover:underline mt-3">
                {t('dashboard.startNow')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero: Calorie Ring + Macro Pills ── */}
      <div className="card p-6 sm:p-8 overflow-hidden relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/[0.03] via-transparent to-violet-500/[0.03] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative">
          {/* Calorie Ring */}
          <div className="relative flex-shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="80" cy="80" r="68"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-gray-100 dark:text-dark-800"
              />
              {/* Progress ring */}
              <circle
                cx="80" cy="80" r="68"
                fill="none"
                stroke="url(#calGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 68}`}
                strokeDashoffset={`${2 * Math.PI * 68 * (1 - (animateRing ? calPct / 100 : 0))}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="calGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                {Math.round(todayMacros.calories)}
              </span>
              <span className="text-xs text-gray-400 dark:text-dark-500 font-medium -mt-0.5">
                {t('dashboard.ofKcal')} {goals.calories} kcal
              </span>
              {todayMacros.calories > 0 && (
                <span className="text-[10px] mt-1 px-2 py-0.5 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-semibold">
                  {Math.round(calPct)}%
                </span>
              )}
            </div>
          </div>

          {/* Macro Pills - Vertical Stack */}
          <div className="grid grid-cols-3 sm:grid-cols-1 gap-3 flex-1 w-full">
            <MacroPill
              label={t('recipes.protein')}
              value={todayMacros.protein}
              target={goals.protein}
              color="blue"
              animate={animateRing}
            />
            <MacroPill
              label={t('recipes.fat')}
              value={todayMacros.fat}
              target={goals.fat}
              color="amber"
              animate={animateRing}
            />
            <MacroPill
              label={t('recipes.carbs')}
              value={todayMacros.carbs}
              target={goals.carbs}
              color="violet"
              animate={animateRing}
            />
          </div>
        </div>

        {/* Remaining calories badge */}
        {remaining > 0 && todayPlan && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-800/50 flex items-center justify-center gap-2 text-sm">
            <Zap size={14} className="text-accent-500" />
            <span className="text-gray-500 dark:text-dark-400">
              {Math.round(remaining)} kcal {t('dashboard.remainingKcal')}
            </span>
          </div>
        )}
      </div>

      {/* Macro Goals Editor (toggle) */}
      {showGoalForm && (
        <div className="animate-slide-up">
          <MacroGoalForm />
        </div>
      )}

      <button
        onClick={() => setShowGoalForm(!showGoalForm)}
        className="text-xs text-gray-400 dark:text-dark-500 hover:text-accent-600 dark:hover:text-accent-400 transition-colors font-medium"
      >
        {showGoalForm ? t('dashboard.hideGoals') : t('dashboard.adjustGoals')}
      </button>

      {/* ── Two Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Plan — takes 2 cols */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Utensils size={18} className="text-accent-600 dark:text-accent-400" />
              {t('dashboard.noPlanToday')}
            </h2>
            {todayPlan && (
              <Link to="/meal-planner" className="text-xs text-accent-600 dark:text-accent-400 hover:underline font-medium flex items-center gap-1">
                {t('recipes.edit')} <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {todayPlan ? (
            <MealPlanView plan={todayPlan} onDelete={(id) => deletePlan(id)} />
          ) : (
            <div className="card p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/[0.03] to-violet-500/[0.03] pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mx-auto mb-4 animate-float">
                  <Calendar size={24} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-dark-200 mb-1">
                  {t('dashboard.noPlanDesc')}
                </h3>
                <p className="text-sm text-gray-400 dark:text-dark-500 mb-6 max-w-sm mx-auto">
                  {t('dashboard.noPlanHint')}
                </p>
                <Link to="/meal-planner" className="btn-primary text-sm">
                  <Sparkles size={15} />
                  {t('dashboard.generatePlan')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="card p-4">
            <h3 className="section-title">{t('dashboard.overview')}</h3>
            <div className="space-y-3">
              <QuickStatRow icon={<BookOpen size={16} />} label={t('recipes.title')} value={String(recipes.length)} to="/recipes" />
              <QuickStatRow icon={<Calendar size={16} />} label={t('nav.mealPlanner')} value={String(mealPlans.length)} to="/meal-planner" />
              <QuickStatRow icon={<ShoppingCart size={16} />} label={t('nav.shoppingList')} value={t('dashboard.viewList')} to="/shopping-list" />
            </div>
          </div>

          {/* Recent Recipes */}
          {recipes.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title mb-0">{t('dashboard.recentRecipes')}</h3>
                <Link to="/recipes" className="text-[11px] text-accent-600 dark:text-accent-400 hover:underline font-medium">
                  {t('dashboard.viewAll')} →
                </Link>
              </div>
              <div className="space-y-2">
                {recipes.slice(0, 4).map((recipe) => (
                  <Link
                    key={recipe.id}
                    to="/recipes"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-850 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{recipe.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-dark-500">
                        {recipe.calories} kcal · {recipe.protein}g P
                      </p>
                    </div>
                    <span className={`badge-${recipe.category} ml-2 flex-shrink-0`}>
                      {recipe.category}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tip of the Day */}
          <div className="card p-4 bg-gradient-to-br from-accent-50 to-white dark:from-accent-500/5 dark:to-dark-900">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={16} className="text-accent-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{t('dashboard.tipOfDay')}</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400 leading-relaxed">
                  {getTipOfTheDay()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function MacroPill({
  label,
  value,
  target,
  color,
  animate,
}: {
  label: string;
  value: number;
  target: number;
  color: 'blue' | 'amber' | 'violet';
  animate: boolean;
}) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-400', track: 'bg-blue-100 dark:bg-blue-500/20' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-400', track: 'bg-amber-100 dark:bg-amber-500/20' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', bar: 'bg-violet-400', track: 'bg-violet-100 dark:bg-violet-500/20' },
  };
  const c = colorMap[color];

  return (
    <div className={clsx('rounded-xl p-3 flex items-center gap-3', c.bg)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600 dark:text-dark-300">{label}</span>
          <span className={clsx('text-xs font-bold tabular-nums', c.text)}>
            {Math.round(value)}<span className="font-normal text-gray-400 dark:text-dark-500">/{target}g</span>
          </span>
        </div>
        <div className={clsx('h-1.5 rounded-full overflow-hidden', c.track)}>
          <div
            className={clsx('h-full rounded-full transition-all duration-700 ease-out', c.bar)}
            style={{ width: animate ? `${pct}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

function QuickStatRow({ icon, label, value, to }: { icon: React.ReactNode; label: string; value: string; to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between py-2 px-1 group hover:bg-gray-50 dark:hover:bg-dark-850 rounded-lg transition-colors -mx-1"
    >
      <div className="flex items-center gap-2.5 text-gray-500 dark:text-dark-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
        <ChevronRight size={14} className="text-gray-300 dark:text-dark-600 group-hover:text-accent-500 transition-colors" />
      </div>
    </Link>
  );
}

function getTipOfTheDay(): string {
  const tips = [
    'Trinke mindestens 2 Liter Wasser am Tag – das steigert deinen Stoffwechsel um bis zu 30%!',
    'Meal Prep am Sonntag spart dir unter der Woche bis zu 5 Stunden Kochzeit.',
    'Proteinreiche Snacks wie Skyr oder Nüsse helfen gegen das Nachmittagstief.',
    'Plane deine Mahlzeiten für die ganze Woche – so bleibst du auf Kurs!',
    'Vollkornprodukte halten dich länger satt als Weißmehlprodukte.',
    'Bewege dich nach dem Essen 15 Minuten – das reguliert deinen Blutzucker.',
    'Bunte Teller = gesunde Teller. Mixe verschiedene Gemüsefarben!',
  ];
  const dayIndex = new Date().getDay();
  return tips[dayIndex % tips.length];
}
