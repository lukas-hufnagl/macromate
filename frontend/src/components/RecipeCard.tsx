/**
 * MacroMate – RecipeCard Component
 * Premium-Karte mit Hover-Animation, Makro-Pills, Kategorie-Badge und Dietary Labels.
 */

import { useState } from 'react';
import type { Recipe } from '../types';
import { Flame, Beef, Droplets, Wheat, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
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
function getDietaryLabels(recipe: Recipe): { label: string; color: string }[] {
  const labels: { label: string; color: string }[] = [];
  if (recipe.protein >= 30) labels.push({ label: 'High Protein', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' });
  if (recipe.calories <= 300) labels.push({ label: 'Low Calorie', color: 'bg-green-500/15 text-green-600 dark:text-green-400' });
  if (recipe.carbs <= 20) labels.push({ label: 'Low Carb', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' });
  if (recipe.fat <= 8) labels.push({ label: 'Low Fat', color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400' });
  if (recipe.protein >= 20 && recipe.calories <= 400) labels.push({ label: 'Fitness', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' });
  return labels;
}

export default function RecipeCard({ recipe, onEdit, onDelete, compact }: Props) {
  const [expanded, setExpanded] = useState(false);
  const dietaryLabels = getDietaryLabels(recipe);

  return (
    <div className="glass-card-hover group relative overflow-hidden">
      {/* Top Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className={clsx('p-5', compact && 'p-4')}>
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
          <div className="flex gap-1">
            {(onEdit || onDelete) && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(recipe)}
                    className="p-2 rounded-lg text-gray-400 dark:text-dark-400 hover:text-accent-400 hover:bg-accent-500/10 transition-all"
                    title="Bearbeiten"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(recipe)}
                    className="p-2 rounded-lg text-gray-400 dark:text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Löschen"
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
              {recipe.servings} Portionen
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
        <div className="grid grid-cols-4 gap-2">
          <MacroPill
            icon={<Flame size={14} />}
            label="Kalorien"
            value={recipe.calories}
            unit="kcal"
            color="text-fire-400"
          />
          <MacroPill
            icon={<Beef size={14} />}
            label="Protein"
            value={recipe.protein}
            unit="g"
            color="text-blue-400"
          />
          <MacroPill
            icon={<Droplets size={14} />}
            label="Fett"
            value={recipe.fat}
            unit="g"
            color="text-yellow-400"
          />
          <MacroPill
            icon={<Wheat size={14} />}
            label="Carbs"
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
            {expanded ? 'Weniger' : 'Details anzeigen'}
          </button>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-800/30 space-y-3 animate-fade-in">
            {/* Ingredients */}
            {recipe.ingredients?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Zutaten</p>
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
                  <BookOpen size={12} /> Zubereitung
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
