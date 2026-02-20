/**
 * MacroMate – Dashboard Page
 * Hauptübersicht mit aktuellen Tagesdaten, Quick-Stats und dem heutigen Plan.
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
  Sparkles,
  ChevronRight,
  Utensils,
  Target,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  const { mealPlans, fetchPlans, deletePlan } = useMealPlanStore();
  const { goals } = useGoalStore();
  const [showGoalForm, setShowGoalForm] = useState(false);

  // Heutiges Datum
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchRecipes();
    fetchPlans({ start_date: today, end_date: today });
  }, []);

  const todayPlan = mealPlans.find((p) => p.date === today);

  // Quick Stats
  const stats = [
    {
      label: 'Rezepte',
      value: recipes.length,
      icon: <BookOpen size={20} />,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
      link: '/recipes',
    },
    {
      label: 'Tagespläne',
      value: mealPlans.length,
      icon: <Calendar size={20} />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      link: '/meal-planner',
    },
    {
      label: 'Kalorien-Ziel',
      value: `${goals.calories}`,
      icon: <Target size={20} />,
      color: 'text-fire-400',
      bg: 'bg-fire-400/10',
      link: '#',
      onClick: () => setShowGoalForm(!showGoalForm),
    },
    {
      label: 'Protein-Ziel',
      value: `${goals.protein}g`,
      icon: <TrendingUp size={20} />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      link: '#',
      onClick: () => setShowGoalForm(!showGoalForm),
    },
  ];

  // Begrüßung je nach Tageszeit
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 via-gray-50 to-accent-50 dark:from-dark-900 dark:via-dark-850 dark:to-accent-950/30 border border-gray-200/80 dark:border-dark-800/50 p-6 sm:p-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-float" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-600/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 animate-float" style={{ animationDelay: '-3s' }} />
        <div className="relative">
          <div className="flex items-center gap-2 text-accent-400 mb-2">
            <Sparkles size={15} className="animate-glow" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">{greeting}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight">
            {user?.username} 👋
          </h1>
          <p className="text-gray-500 dark:text-dark-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Hier ist dein Überblick für heute. Plane deine Mahlzeiten, tracke deine Makros
            und erreiche deine Ziele.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            to={stat.link}
            onClick={stat.onClick}
            className="glass-card-hover p-4 sm:p-5 group animate-scale-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <ChevronRight
                size={15}
                className="text-gray-400 dark:text-dark-600 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-400">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Macro Goals Form (togglebar) */}
      {showGoalForm && (
        <div className="animate-slide-up">
          <MacroGoalForm />
        </div>
      )}

      {/* Heutiger Plan */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Utensils size={20} className="text-accent-400" />
            Heutiger Plan
          </h2>
          {!todayPlan && (
            <Link to="/meal-planner" className="btn-primary text-sm">
              <Sparkles size={14} />
              Plan generieren
            </Link>
          )}
        </div>

        {todayPlan ? (
          <MealPlanView plan={todayPlan} onDelete={(id) => deletePlan(id)} />
        ) : (
          <div className="glass-card p-8 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-dark-800/50 flex items-center justify-center mx-auto mb-4">
              <Calendar size={26} className="text-gray-400 dark:text-dark-500" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 dark:text-dark-300 mb-2">
              Kein Plan für heute
            </h3>
            <p className="text-sm text-gray-400 dark:text-dark-500 mb-6 max-w-md mx-auto leading-relaxed">
              Erstelle jetzt einen Tagesplan basierend auf deinen Makronährstoffzielen.
              Du brauchst mindestens ein Rezept.
            </p>
            <Link to="/meal-planner" className="btn-primary text-sm">
              <Sparkles size={15} />
              Tagesplan erstellen
            </Link>
          </div>
        )}
      </div>

      {/* Zuletzt hinzugefügte Rezepte */}
      {recipes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen size={20} className="text-accent-400" />
              Neueste Rezepte
            </h2>
            <Link to="/recipes" className="btn-ghost text-sm text-accent-400 group">
              Alle anzeigen
              <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recipes.slice(0, 3).map((recipe, i) => (
              <Link
                key={recipe.id}
                to="/recipes"
                className="glass-card-hover p-4 sm:p-5 animate-scale-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate text-sm sm:text-base">
                  {recipe.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-400 mb-3">
                  {recipe.calories} kcal · {recipe.protein}g Protein
                </p>
                <span className={`badge-${recipe.category}`}>
                  {recipe.category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
