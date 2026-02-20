/**
 * MacroMate – MealPlanView Component
 * Zeigt einen generierten Tagesplan als übersichtliche Karten-Ansicht.
 */

import type { MealPlan } from '../types';
import NutritionSummary from './NutritionSummary';
import { Clock, Utensils, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  plan: MealPlan;
  onDelete?: (id: number) => void;
}

const SLOT_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  frühstück: { label: 'Frühstück', emoji: '🌅', color: 'border-l-amber-400' },
  mittagessen: { label: 'Mittagessen', emoji: '☀️', color: 'border-l-green-400' },
  abendessen: { label: 'Abendessen', emoji: '🌙', color: 'border-l-blue-400' },
  snack: { label: 'Snack', emoji: '🍎', color: 'border-l-purple-400' },
};

export default function MealPlanView({ plan, onDelete }: Props) {
  const formattedDate = new Date(plan.date).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center">
              <Utensils size={20} className="text-accent-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Tagesplan</h3>
              <p className="text-sm text-gray-500 dark:text-dark-400 flex items-center gap-1.5">
                <Clock size={14} />
                {formattedDate}
              </p>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(plan.id)}
              className="btn-danger text-sm px-4 py-2"
            >
              <Trash2 size={14} />
              Löschen
            </button>
          )}
        </div>

        {/* Nährwert-Zusammenfassung */}
        <NutritionSummary
          actual={{
            calories: plan.actual_calories,
            protein: plan.actual_protein,
            fat: plan.actual_fat,
            carbs: plan.actual_carbs,
          }}
          target={{
            calories: plan.target_calories,
            protein: plan.target_protein,
            fat: plan.target_fat,
            carbs: plan.target_carbs,
          }}
        />
      </div>

      {/* Mahlzeiten */}
      <div className="p-6 space-y-3">
        {plan.entries.map((entry, index) => {
          const slot = SLOT_INFO[entry.meal_slot] || {
            label: entry.meal_slot,
            emoji: '🍽️',
            color: 'border-l-dark-600',
          };

          return (
            <div
              key={entry.id}
              className={clsx(
                'p-4 rounded-xl bg-gray-50 dark:bg-dark-900/30 border border-gray-200 dark:border-dark-800/30 border-l-4 transition-all hover:bg-gray-100 dark:hover:bg-dark-850/50',
                slot.color
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{slot.emoji}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      {slot.label}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{entry.recipe.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
                    {entry.servings} {entry.servings === 1 ? 'Portion' : 'Portionen'}
                  </p>
                </div>

                {/* Makros für diesen Eintrag */}
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-sm font-bold text-fire-400">
                      {Math.round(entry.total_calories)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-dark-500">kcal</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-400">
                      {Math.round(entry.total_protein)}g
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-dark-500">Protein</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-yellow-400">
                      {Math.round(entry.total_fat)}g
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-dark-500">Fett</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-400">
                      {Math.round(entry.total_carbs)}g
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-dark-500">Carbs</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {plan.entries.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-dark-500">
            Keine Mahlzeiten in diesem Plan.
          </div>
        )}
      </div>
    </div>
  );
}
