/**
 * MacroMate – Shared Plan Page
 * Öffentliche Ansicht eines geteilten Tagesplans (kein Login nötig).
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { MealPlan } from '../types';
import { mealPlanAPI } from '../services/api';
import MealPlanView from '../components/MealPlanView';
import { Loader2, ChefHat, ArrowLeft } from 'lucide-react';

export default function SharedPlanPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) return;
    setLoading(true);
    mealPlanAPI
      .getShared(shareToken)
      .then(setPlan)
      .catch(() => setError('Dieser Link ist ungültig oder der Plan wurde nicht mehr geteilt.'))
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <Loader2 size={40} className="animate-spin text-accent-400" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 p-4">
        <div className="glass-card p-8 sm:p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <ChefHat size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Plan nicht gefunden
          </h2>
          <p className="text-gray-500 dark:text-dark-400 mb-6">
            {error || 'Dieser geteilte Plan existiert nicht.'}
          </p>
          <Link to="/" className="btn-primary inline-flex">
            <ArrowLeft size={16} />
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Branding Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <ChefHat size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">MacroMate</span>
          </div>
          <Link
            to="/register"
            className="btn-primary text-sm"
          >
            Kostenlos starten
          </Link>
        </div>

        <MealPlanView plan={plan} isSharedView />
      </div>
    </div>
  );
}
