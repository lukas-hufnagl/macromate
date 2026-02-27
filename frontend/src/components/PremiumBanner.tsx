/**
 * MacroMate – Premium Banner Component
 * Subtile UI-Vorbereitung für ein zukünftiges Abo-Modell.
 */

import { Crown, Zap, Lock, ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../stores/authStore';

interface Props {
  variant?: 'banner' | 'inline' | 'badge';
  feature?: string;
}

export function PremiumBanner({ variant = 'banner', feature }: Props) {
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.is_premium;

  if (variant === 'badge') {
    return isPremium ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-500 dark:text-amber-400 text-[10px] font-bold shadow-sm">
        <Crown size={10} />
        PRO
      </span>
    ) : null;
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <Lock size={14} className="text-amber-500" />
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          {feature || 'Premium Feature'} — {isPremium ? 'freigeschaltet ✓' : 'bald verfügbar'}
        </span>
      </div>
    );
  }

  // Active Premium Banner
  if (isPremium) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/15 border border-amber-400/30 p-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/20">
            <Crown size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              MacroMate Pro
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                <Check size={8} />
                Aktiv
              </span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
              Alle Premium-Features freigeschaltet. Viel Spaß! 🎉
            </p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Zap size={20} />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'USDA-Datenbank', icon: '📊', active: true },
            { label: 'Unbegrenzte Pläne', icon: '♾️', active: true },
            { label: 'Nährwert-Tracking', icon: '🍎', active: true },
            { label: 'Export & Sync', icon: '☁️', active: true },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-dark-900/40 text-xs text-gray-700 dark:text-dark-200 font-medium border border-green-500/10">
              <span>{f.icon}</span>
              {f.label}
              <Check size={10} className="text-green-500 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Non-Premium Banner
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Crown size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            MacroMate Pro
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold uppercase">Coming Soon</span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
            Erweiterte Ernährungsplanung, unbegrenzte Rezepte, detaillierte Analysen und mehr.
          </p>
        </div>
        <button className="btn-secondary text-sm whitespace-nowrap opacity-60 cursor-not-allowed" disabled>
          <Zap size={14} />
          Upgrade
        </button>
      </div>

      <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'USDA-Datenbank', icon: '📊' },
          { label: 'Unbegrenzte Pläne', icon: '♾️' },
          { label: 'Nährwert-Tracking', icon: '🍎' },
          { label: 'Export & Sync', icon: '☁️' },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-dark-900/30 text-xs text-gray-600 dark:text-dark-300">
            <span>{f.icon}</span>
            {f.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PremiumFeatureGate({ children, feature }: { children: React.ReactNode; feature: string }) {
  // For now, all features are unlocked (no paywall). This wraps features that
  // will become premium-only once the subscription system is implemented.
  return <>{children}</>;
}
