/**
 * MacroMate – NutritionSummary Component
 * Visuelle Darstellung der Nährwerte mit Fortschrittsbalken.
 * Zeigt IST vs SOLL an.
 */

import type { MacroGoals } from '../types';
import { Flame, Beef, Droplets, Wheat } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  actual: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  target: MacroGoals;
  compact?: boolean;
}

export default function NutritionSummary({ actual, target, compact }: Props) {
  const macros = [
    {
      label: 'Kalorien',
      icon: <Flame size={16} />,
      actual: actual.calories,
      target: target.calories,
      unit: 'kcal',
      color: 'from-orange-500 to-fire-400',
      textColor: 'text-fire-400',
      bgColor: 'bg-fire-400/10',
    },
    {
      label: 'Protein',
      icon: <Beef size={16} />,
      actual: actual.protein,
      target: target.protein,
      unit: 'g',
      color: 'from-blue-500 to-blue-400',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: 'Fett',
      icon: <Droplets size={16} />,
      actual: actual.fat,
      target: target.fat,
      unit: 'g',
      color: 'from-yellow-500 to-yellow-400',
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      label: 'Carbs',
      icon: <Wheat size={16} />,
      actual: actual.carbs,
      target: target.carbs,
      unit: 'g',
      color: 'from-purple-500 to-purple-400',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
  ];

  return (
    <div className={clsx('grid gap-3', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4')}>
      {macros.map((macro) => {
        const percent = macro.target > 0 ? Math.min((macro.actual / macro.target) * 100, 100) : 0;
        const isOver = macro.actual > macro.target;

        return (
          <div
            key={macro.label}
            className={clsx(
              'p-4 rounded-xl border border-gray-200 dark:border-dark-800/30 transition-all',
              macro.bgColor
            )}
          >
            {/* Label & Icon */}
            <div className="flex items-center gap-2 mb-2">
              <span className={macro.textColor}>{macro.icon}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                {macro.label}
              </span>
            </div>

            {/* Values */}
            <div className="flex items-baseline gap-1 mb-3">
              <span className={clsx('text-2xl font-bold', macro.textColor)}>
                {Math.round(macro.actual)}
              </span>
              <span className="text-sm text-gray-400 dark:text-dark-500">
                / {Math.round(macro.target)} {macro.unit}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-200 dark:bg-dark-800 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r',
                  isOver ? 'from-red-500 to-red-400' : macro.color
                )}
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Percentage */}
            <p className={clsx('text-xs mt-1.5 font-medium', isOver ? 'text-red-400' : 'text-gray-400 dark:text-dark-500')}>
              {Math.round(percent)}%
              {isOver && ' – Überschritten!'}
            </p>
          </div>
        );
      })}
    </div>
  );
}
