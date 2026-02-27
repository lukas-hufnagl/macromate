/**
 * MacroMate – Pricing & Subscription Management
 * Zeigt aktuelle Plan-Info, Subscription-Details und Upgrade-Optionen.
 */

import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { subscriptionAPI } from '../services/api';
import type { Subscription } from '../types';
import { Check, Zap, Crown, ArrowRight, Loader2, Calendar, CreditCard, Shield, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: 'Für immer',
    desc: 'Perfekt zum Ausprobieren',
    features: [
      'Bis zu 10 Rezepte',
      'Tägliche Meal Plans',
      'Einkaufslisten-Export',
      'Nährwert-Tracking',
      '4 Sprachen',
    ],
    variantId: null,
    popular: false,
  },
  {
    name: 'Pro',
    price: '4.99',
    period: '/Monat',
    desc: 'Für ambitionierte Meal Prepper',
    features: [
      'Unbegrenzte Rezepte',
      'Wöchentliche Meal Plans',
      'Erweiterte Makro-Filter',
      'Favoriten & Sammlungen',
      'Nährwert-Datenbank (OpenFoodFacts)',
      'Prioritäts-Support',
    ],
    variantId: 'pro',  // Replace with real Lemon Squeezy variant ID
    popular: true,
  },
  {
    name: 'Team',
    price: '9.99',
    period: '/Monat',
    desc: 'Für Familien & Teams',
    features: [
      'Alles aus Pro',
      'Bis zu 5 Mitglieder',
      'Geteilte Rezeptsammlungen',
      'Gemeinsame Meal Plans',
      'Familien-Einkaufslisten',
      'Premium-Support',
    ],
    variantId: 'team',  // Replace with real Lemon Squeezy variant ID
    popular: false,
  },
];

export default function PricingPage() {
  const { status } = useSubscriptionStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  const currentPlan = status?.plan || 'free';
  const isPremium = status?.is_premium || false;

  useEffect(() => {
    subscriptionAPI.getSubscription()
      .then(setSubscription)
      .catch(() => {})
      .finally(() => setSubLoading(false));
  }, []);

  const handleUpgrade = async (variantId: string | null) => {
    if (!variantId) return;
    setLoadingPlan(variantId);
    try {
      const url = await subscriptionAPI.getCheckoutUrl(variantId);
      window.location.href = url;
    } catch {
      toast.error('Checkout konnte nicht gestartet werden');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Abo & Preise</h1>
        <p className="page-subtitle">
          Dein aktueller Plan: <span className="font-semibold text-accent-600 dark:text-accent-400 capitalize">{currentPlan}</span>
        </p>
      </div>

      {/* ── Active Subscription Card ── */}
      {isPremium && !subLoading && subscription && (
        <div className="glass-card p-6 border-l-4 border-l-accent-500 animate-slide-up">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-accent-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                </h3>
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  subscription.status === 'active'
                    ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
                )}>
                  {subscription.status === 'active' ? 'Aktiv' : subscription.status === 'cancelled' ? 'Gekündigt' : subscription.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                {subscription.current_period_start && (
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-dark-400">
                    <Calendar size={14} />
                    Seit {new Date(subscription.current_period_start).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {subscription.current_period_end && (
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-dark-400">
                    <RefreshCw size={14} />
                    Nächste Abrechnung: {new Date(subscription.current_period_end).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
                  </div>
                )}
              </div>

              {/* Features */}
              {status?.features && status.features.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {status.features.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-lg bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-800/50 text-gray-500 dark:text-dark-400">
                <Shield size={14} />
                Jederzeit kündbar
              </div>
            </div>
          </div>

          {subscription.cancelled_at && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-800/30">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Dein Abo wurde am {new Date(subscription.cancelled_at).toLocaleDateString('de-DE')} gekündigt.
                {subscription.current_period_end && ` Du hast noch Zugang bis ${new Date(subscription.current_period_end).toLocaleDateString('de-DE')}.`}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentPlan;
          return (
            <div
              key={plan.name}
              className={clsx(
                'card p-6 relative',
                plan.popular && 'border-accent-500 ring-1 ring-accent-500/20',
                isCurrent && 'bg-accent-50/50 dark:bg-accent-500/5',
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent-600 text-white text-[11px] font-bold">
                  Beliebt
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  {plan.name === 'Pro' && <Crown size={18} className="text-accent-500" />}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-dark-400">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-5">
                {plan.price !== '0' && <span className="text-sm text-gray-400">€</span>}
                <span className="text-3xl font-extrabold">{plan.price === '0' ? 'Gratis' : plan.price}</span>
                {plan.price !== '0' && <span className="text-sm text-gray-400">{plan.period}</span>}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className={clsx('mt-0.5 flex-shrink-0', plan.popular ? 'text-accent-500' : 'text-gray-400 dark:text-dark-500')} />
                    <span className="text-gray-600 dark:text-dark-300">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20">
                  Aktueller Plan
                </div>
              ) : plan.variantId ? (
                <button
                  onClick={() => handleUpgrade(plan.variantId)}
                  disabled={!!loadingPlan}
                  className={clsx(
                    'w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                    plan.popular
                      ? 'btn-primary'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-200 hover:bg-gray-200 dark:hover:bg-dark-700',
                  )}
                >
                  {loadingPlan === plan.variantId ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Upgraden <ArrowRight size={14} />
                    </>
                  )}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-dark-500 pt-4">
        Alle Preise inkl. MwSt. · Jederzeit kündbar · Powered by Lemon Squeezy
      </p>
    </div>
  );
}
