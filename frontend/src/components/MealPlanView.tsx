/**
 * MacroMate – MealPlanView Component
 * Zeigt einen generierten Tagesplan als übersichtliche Karten-Ansicht.
 */

import { useState } from 'react';
import type { MealPlan } from '../types';
import { mealPlanAPI } from '../services/api';
import NutritionSummary from './NutritionSummary';
import { useI18nStore } from '../stores/i18nStore';
import { Clock, Utensils, Trash2, Share2, Link2, Check, X as XIcon } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Props {
  plan: MealPlan;
  onDelete?: (id: number) => void;
  /** Wenn true, wird der Plan im "shared/read-only" Modus angezeigt */
  isSharedView?: boolean;
}

const SLOT_EMOJI: Record<string, { emoji: string; color: string }> = {
  frühstück: { emoji: '🌅', color: 'border-l-amber-400' },
  mittagessen: { emoji: '☀️', color: 'border-l-green-400' },
  abendessen: { emoji: '🌙', color: 'border-l-blue-400' },
  snack: { emoji: '🍎', color: 'border-l-purple-400' },
};

const SLOT_KEYS: Record<string, string> = {
  frühstück: 'mealPlanner.slotBreakfast',
  mittagessen: 'mealPlanner.slotLunch',
  abendessen: 'mealPlanner.slotDinner',
  snack: 'mealPlanner.slotSnack',
};

export default function MealPlanView({ plan, onDelete, isSharedView }: Props) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = useI18nStore((s) => s.t);

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
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t('mealPlanner.dailyPlan')}</h3>
              <p className="text-sm text-gray-500 dark:text-dark-400 flex items-center gap-1.5">
                <Clock size={14} />
                {formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Share Button */}
            {!isSharedView && (
              plan.share_token ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      const url = `${window.location.origin}/shared/${plan.share_token}`;
                      await navigator.clipboard.writeText(url);
                      setCopied(true);
                      toast.success(t('mealPlanner.linkCopied'));
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="btn-secondary text-sm px-3 py-2"
                    title={t('general.copied')}
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
                    <span className="hidden sm:inline">{copied ? t('general.copied') : t('mealPlanner.share')}</span>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await mealPlanAPI.unshare(plan.id);
                        plan.share_token = null;
                        toast.success(t('mealPlanner.shareDisabled'));
                        setSharing(false);
                      } catch {
                        toast.error(t('general.error'));
                      }
                    }}
                    className="btn-ghost text-sm px-2 py-2 text-gray-400 hover:text-red-400"
                    title={t('mealPlanner.stopSharing')}
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    setSharing(true);
                    try {
                      const token = await mealPlanAPI.share(plan.id);
                      plan.share_token = token;
                      const url = `${window.location.origin}/shared/${token}`;
                      await navigator.clipboard.writeText(url);
                      setCopied(true);
                      toast.success(t('mealPlanner.linkCopied'));
                      setTimeout(() => setCopied(false), 2000);
                    } catch {
                      toast.error(t('mealPlanner.shareError'));
                    } finally {
                      setSharing(false);
                    }
                  }}
                  disabled={sharing}
                  className="btn-secondary text-sm px-3 py-2"
                >
                  <Share2 size={14} />
                  <span className="hidden sm:inline">{t('mealPlanner.share')}</span>
                </button>
              )
            )}
            {/* Shared badge */}
            {isSharedView && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-medium flex items-center gap-1.5">
                <Share2 size={12} />
                {t('mealPlanner.sharedPlan')}
              </span>
            )}
            {onDelete && !isSharedView && (
              <button
                onClick={() => onDelete(plan.id)}
                className="btn-danger text-sm px-4 py-2"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">{t('recipes.delete')}</span>
              </button>
            )}
          </div>
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
          const slotVisual = SLOT_EMOJI[entry.meal_slot] || {
            emoji: '🍽️',
            color: 'border-l-dark-600',
          };
          const slotLabel = SLOT_KEYS[entry.meal_slot] ? t(SLOT_KEYS[entry.meal_slot]) : entry.meal_slot;

          return (
            <div
              key={entry.id}
              className={clsx(
                'p-4 rounded-xl bg-gray-50 dark:bg-dark-900/30 border border-gray-200 dark:border-dark-800/30 border-l-4 transition-all hover:bg-gray-100 dark:hover:bg-dark-850/50',
                slotVisual.color
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{slotVisual.emoji}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      {slotLabel}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{entry.recipe.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
                    {entry.servings} {entry.servings === 1 ? t('general.portion') : t('general.portions')}
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
            {t('mealPlanner.noMeals')}
          </div>
        )}
      </div>
    </div>
  );
}
