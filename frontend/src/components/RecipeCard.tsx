/**
 * MacroMate – RecipeCard Component
 * Premium-Karte mit Hover-Animation, Makro-Pills, Kategorie-Badge und Dietary Labels.
 */

import { useState } from 'react';
import type { Recipe } from '../types';
import { Flame, Beef, Droplets, Wheat, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen, Heart } from 'lucide-react';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useI18nStore } from '../stores/i18nStore';
import clsx from 'clsx';

interface Props {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  compact?: boolean;
}

const CATEGORY_BADGE: Record<string, string> = {
  vegan: 'badge-vegan',
  vegetarisch: 'badge-vegetarisch',
  fleisch: 'badge-fleisch',
  fisch: 'badge-fisch',
};

const CATEGORY_EMOJI: Record<string, string> = {
  vegan: '🌱',
  vegetarisch: '🥚',
  fleisch: '🥩',
  fisch: '🐟',
};

// Auto-computed dietary labels
function getDietaryLabels(recipe: Recipe, t: (k: string) => string): { label: string; color: string }[] {
  const labels: { label: string; color: string }[] = [];
  const proteinCalPct = recipe.calories > 0 ? (recipe.protein * 4 / recipe.calories) * 100 : 0;
  if (proteinCalPct >= 30) labels.push({ label: `🏋️ ${t('recipes.highProtein')}`, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' });
  if (recipe.calories > 0 && recipe.calories <= 350) labels.push({ label: `🔥 ${t('recipes.lowCalorie')}`, color: 'bg-green-500/15 text-green-600 dark:text-green-400' });
  if (recipe.carbs <= 15) labels.push({ label: `🥗 ${t('recipes.lowCarb')}`, color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' });
  if (recipe.fat > 0 && recipe.fat <= 5) labels.push({ label: `💧 ${t('recipes.lowFat')}`, color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400' });
  if (proteinCalPct >= 25 && recipe.calories <= 500) labels.push({ label: `⚡ ${t('recipes.fitness')}`, color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' });
  return labels;
}

export default function RecipeCard({ recipe, onEdit, onDelete, compact }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { isFavorite, toggleFavorite } = useSubscriptionStore();
  const t = useI18nStore((s) => s.t);
  const dietaryLabels = getDietaryLabels(recipe, t);
  const isFav = isFavorite(recipe.id);

  return (
    <div className="glass-card-hover group relative overflow-hidden h-full flex flex-col">
      {/* Top Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className={clsx('p-5 flex-1 flex flex-col', compact && 'p-4')}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight truncate group-hover:text-accent-400 transition-colors">
              {recipe.name}
            </h3>
            {recipe.description && !compact && (
              <p className="text-gray-500 dark:text-dark-400 text-sm mt-1 line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 items-center">
            {/* Favorite heart */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
              className={clsx(
                'p-2 rounded-lg transition-all duration-200',
                isFav
                  ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 scale-100'
                  : 'text-gray-300 dark:text-dark-600 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 sm:opacity-0 sm:group-hover:opacity-100',
              )}
              title={isFav ? t('recipes.removeFav') : t('recipes.addFav')}
            >
              <Heart size={16} className={clsx('transition-all duration-200', isFav && 'fill-rose-500 stroke-rose-500')} />
            </button>
            {(onEdit || onDelete) && (
              <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(recipe)}
                    className="p-2 rounded-lg text-gray-400 dark:text-dark-400 hover:text-accent-400 hover:bg-accent-500/10 transition-all"
                    title={t('recipes.edit')}
                  >
                    <Pencil size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(recipe)}
                    className="p-2 rounded-lg text-gray-400 dark:text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title={t('recipes.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={CATEGORY_BADGE[recipe.category] || 'badge bg-dark-700 text-dark-300'}>
            {CATEGORY_EMOJI[recipe.category]} {recipe.category}
          </span>
          <span className="badge bg-gray-100 dark:bg-dark-800/50 text-gray-500 dark:text-dark-400 border border-gray-200 dark:border-dark-700/30">
            {recipe.meal_type}
          </span>
          {recipe.servings > 1 && (
            <span className="text-xs text-gray-400 dark:text-dark-500">
              {recipe.servings} {t('general.portions')}
            </span>
          )}
        </div>

        {/* Dietary Labels */}
        {dietaryLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {dietaryLabels.map((dl) => (
              <span key={dl.label} className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', dl.color)}>
                {dl.label}
              </span>
            ))}
          </div>
        )}

        {/* Macro Pills */}
        <div className="grid grid-cols-4 gap-2 mt-auto">
          <MacroPill
            icon={<Flame size={14} />}
            label={t('recipes.calories')}
            value={recipe.calories}
            unit="kcal"
            color="text-fire-400"
          />
          <MacroPill
            icon={<Beef size={14} />}
            label={t('recipes.protein')}
            value={recipe.protein}
            unit="g"
            color="text-blue-400"
          />
          <MacroPill
            icon={<Droplets size={14} />}
            label={t('recipes.fat')}
            value={recipe.fat}
            unit="g"
            color="text-yellow-400"
          />
          <MacroPill
            icon={<Wheat size={14} />}
            label={t('recipes.carbs')}
            value={recipe.carbs}
            unit="g"
            color="text-purple-400"
          />
        </div>

        {/* Expand button for instructions */}
        {(recipe.instructions || recipe.ingredients?.length > 0) && !compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 dark:text-dark-500 hover:text-accent-400 dark:hover:text-accent-400 transition-colors py-1"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? t('recipes.showLess') : t('recipes.showDetails')}
          </button>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-800/30 space-y-3 animate-fade-in">
            {/* Ingredients */}
            {recipe.ingredients?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">{t('recipes.ingredients')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-dark-800/40 text-gray-600 dark:text-dark-300">
                      {ing.quantity} {ing.unit} {ing.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <BookOpen size={12} /> {t('recipes.preparation')}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-300 whitespace-pre-line leading-relaxed">
                  {recipe.instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MacroPill({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="macro-pill">
      <span className={clsx('flex items-center gap-1', color)}>
        {icon}
        <span className="font-bold text-sm">{Math.round(value)}</span>
      </span>
      <span className="text-[10px] text-gray-400 dark:text-dark-500 uppercase tracking-wider">{unit}</span>
    </div>
  );
}
