/**
 * MacroMate – MacroGoalForm Component
 * Eingabe für tägliche Kalorien- und Makronährstoffziele.
 * Slider + Input-Combo für intuitive Bedienung.
 */

import { useState, useEffect } from 'react';
import { useGoalStore } from '../stores/goalStore';
import type { MacroGoals } from '../types';
import { Target, Flame, Beef, Droplets, Wheat, Save, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onSave?: (goals: MacroGoals) => void;
  compact?: boolean;
}

export default function MacroGoalForm({ onSave, compact }: Props) {
  const { goals, setGoals, resetGoals } = useGoalStore();
  const [localGoals, setLocalGoals] = useState<MacroGoals>(goals);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  const handleSave = () => {
    setGoals(localGoals);
    onSave?.(localGoals);
    toast.success('Ziele gespeichert! 🎯');
  };

  const handleReset = () => {
    resetGoals();
    toast('Ziele zurückgesetzt', { icon: '🔄' });
  };

  const GoalSlider = ({
    icon,
    label,
    value,
    unit,
    min,
    max,
    step,
    color,
    bgColor,
    onChange,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    step: number;
    color: string;
    bgColor: string;
    onChange: (v: number) => void;
  }) => (
    <div className={`p-4 rounded-xl border border-gray-200 dark:border-dark-800/30 ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          <span className="text-sm font-medium text-gray-600 dark:text-dark-300">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            className="w-20 px-2 py-1 bg-white dark:bg-dark-900/80 border border-gray-300 dark:border-dark-700/50 rounded-lg text-center text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-500/50"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <span className="text-xs text-gray-400 dark:text-dark-500">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        className="w-full h-1.5 bg-gray-200 dark:bg-dark-800 rounded-full appearance-none cursor-pointer accent-current"
        style={{ accentColor: color.includes('fire') ? '#fb923c' : color.includes('blue') ? '#60a5fa' : color.includes('yellow') ? '#facc15' : '#c084fc' }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-dark-600 mt-1">
        <span>{min}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );

  return (
    <div className={compact ? '' : 'glass-card p-6'}>
      {!compact && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center">
            <Target size={20} className="text-accent-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tagesziele</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400">Passe deine Makronährstoffziele an</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GoalSlider
          icon={<Flame size={16} />}
          label="Kalorien"
          value={localGoals.calories}
          unit="kcal"
          min={1000}
          max={5000}
          step={50}
          color="text-fire-400"
          bgColor="bg-fire-400/5"
          onChange={(v) => setLocalGoals({ ...localGoals, calories: v })}
        />
        <GoalSlider
          icon={<Beef size={16} />}
          label="Protein"
          value={localGoals.protein}
          unit="g"
          min={30}
          max={400}
          step={5}
          color="text-blue-400"
          bgColor="bg-blue-400/5"
          onChange={(v) => setLocalGoals({ ...localGoals, protein: v })}
        />
        <GoalSlider
          icon={<Droplets size={16} />}
          label="Fett"
          value={localGoals.fat}
          unit="g"
          min={20}
          max={200}
          step={5}
          color="text-yellow-400"
          bgColor="bg-yellow-400/5"
          onChange={(v) => setLocalGoals({ ...localGoals, fat: v })}
        />
        <GoalSlider
          icon={<Wheat size={16} />}
          label="Kohlenhydrate"
          value={localGoals.carbs}
          unit="g"
          min={50}
          max={600}
          step={5}
          color="text-purple-400"
          bgColor="bg-purple-400/5"
          onChange={(v) => setLocalGoals({ ...localGoals, carbs: v })}
        />
      </div>

      <div className="flex items-center justify-end gap-3 mt-5">
        <button type="button" onClick={handleReset} className="btn-ghost text-sm">
          <RotateCcw size={14} />
          Zurücksetzen
        </button>
        <button type="button" onClick={handleSave} className="btn-primary text-sm">
          <Save size={14} />
          Ziele speichern
        </button>
      </div>
    </div>
  );
}
