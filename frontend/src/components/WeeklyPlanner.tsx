/**
 * MacroMate – Weekly Planner Component
 * Wochenansicht mit einzelnen Tagen, Pläne generieren pro Tag.
 */

import { useState, useMemo } from 'react';
import type { MealPlan } from '../types';
import MealPlanView from './MealPlanView';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  mealPlans: MealPlan[];
  onGenerateDay: (date: string) => Promise<void>;
  onDeletePlan: (id: number) => void;
  isGenerating: boolean;
}

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DAY_NAMES_FULL = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

function getWeekDates(offset: number): { date: string; dayName: string; dayNameFull: string; isToday: boolean }[] {
  const today = new Date();
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      dayName: DAY_NAMES[i],
      dayNameFull: DAY_NAMES_FULL[i],
      isToday: dateStr === today.toISOString().split('T')[0],
    };
  });
}

export default function WeeklyPlanner({ mealPlans, onGenerateDay, onDeletePlan, isGenerating }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [generatingDate, setGeneratingDate] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const plansByDate = useMemo(() => {
    const map: Record<string, MealPlan> = {};
    mealPlans.forEach((p) => {
      map[p.date] = p;
    });
    return map;
  }, [mealPlans]);

  const weekLabel = useMemo(() => {
    const start = new Date(weekDates[0].date);
    const end = new Date(weekDates[6].date);
    return `${start.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [weekDates]);

  const handleGenerateDay = async (date: string) => {
    setGeneratingDate(date);
    try {
      await onGenerateDay(date);
    } finally {
      setGeneratingDate(null);
    }
  };

  // Calculate weekly totals
  const weeklyTotals = useMemo(() => {
    let cal = 0, pro = 0, fat = 0, carb = 0, days = 0;
    weekDates.forEach((wd) => {
      const plan = plansByDate[wd.date];
      if (plan) {
        cal += plan.actual_calories;
        pro += plan.actual_protein;
        fat += plan.actual_fat;
        carb += plan.actual_carbs;
        days++;
      }
    });
    return { cal: Math.round(cal), pro: Math.round(pro), fat: Math.round(fat), carb: Math.round(carb), days };
  }, [weekDates, plansByDate]);

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="p-2 rounded-xl text-gray-400 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{weekLabel}</h3>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-accent-400 hover:underline mt-0.5">
              Zur aktuellen Woche
            </button>
          )}
        </div>

        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="p-2 rounded-xl text-gray-400 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDates.map((wd) => {
          const plan = plansByDate[wd.date];
          const isSelected = selectedDay === wd.date;
          const isGen = generatingDate === wd.date && isGenerating;

          return (
            <button
              key={wd.date}
              onClick={() => setSelectedDay(isSelected ? null : wd.date)}
              className={clsx(
                'relative rounded-xl p-2 sm:p-3 transition-all text-center border',
                isSelected
                  ? 'bg-accent-500/15 border-accent-500/40 ring-2 ring-accent-500/20'
                  : wd.isToday
                  ? 'bg-accent-500/5 border-accent-500/20'
                  : 'bg-white dark:bg-dark-900/40 border-gray-100 dark:border-dark-800/30 hover:border-gray-200 dark:hover:border-dark-700/50',
              )}
            >
              <span className={clsx(
                'text-[10px] sm:text-xs font-semibold uppercase tracking-wider',
                wd.isToday ? 'text-accent-400' : 'text-gray-400 dark:text-dark-500'
              )}>
                {wd.dayName}
              </span>
              <p className={clsx(
                'text-base sm:text-lg font-bold mt-0.5',
                wd.isToday ? 'text-accent-400' : 'text-gray-900 dark:text-white'
              )}>
                {new Date(wd.date).getDate()}
              </p>

              {/* Plan indicator */}
              {plan ? (
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 mx-auto" />
                  <p className="text-[9px] sm:text-[10px] text-fire-400 font-medium mt-0.5">{Math.round(plan.actual_calories)}</p>
                </div>
              ) : (
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-dark-700 mx-auto" />
                  <p className="text-[9px] sm:text-[10px] text-gray-300 dark:text-dark-600 mt-0.5">–</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Weekly Summary */}
      {weeklyTotals.days > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">
              Woche ({weeklyTotals.days} Tage)
            </span>
            <div className="flex gap-4 text-xs">
              <span className="text-fire-400 font-semibold">{weeklyTotals.cal} kcal</span>
              <span className="text-blue-400 font-semibold">{weeklyTotals.pro}g P</span>
              <span className="text-yellow-400 font-semibold">{weeklyTotals.fat}g F</span>
              <span className="text-purple-400 font-semibold">{weeklyTotals.carb}g K</span>
            </div>
          </div>
          {weeklyTotals.days > 0 && (
            <p className="text-[10px] text-gray-400 dark:text-dark-500 mt-1">
              Ø {Math.round(weeklyTotals.cal / weeklyTotals.days)} kcal/Tag · Ø {Math.round(weeklyTotals.pro / weeklyTotals.days)}g Protein/Tag
            </p>
          )}
        </div>
      )}

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="animate-slide-up">
          {plansByDate[selectedDay] ? (
            <MealPlanView plan={plansByDate[selectedDay]} onDelete={onDeletePlan} />
          ) : (
            <div className="glass-card p-6 text-center">
              <Calendar size={32} className="mx-auto mb-3 text-gray-300 dark:text-dark-600" />
              <h4 className="font-semibold text-gray-600 dark:text-dark-300 mb-2">
                {weekDates.find((wd) => wd.date === selectedDay)?.dayNameFull}, {new Date(selectedDay).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
              </h4>
              <p className="text-sm text-gray-400 dark:text-dark-500 mb-4">Noch kein Plan für diesen Tag</p>
              <button
                onClick={() => handleGenerateDay(selectedDay)}
                disabled={isGenerating}
                className="btn-primary"
              >
                {generatingDate === selectedDay && isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Wird generiert...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Tagesplan generieren
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
