/**
 * MacroMate – ProfilePage (Redesigned)
 * Cooles Profil mit Hero-Header, Stats-Karten, Achievements und Einstellungen.
 */
import { useEffect, useState } from 'react';
import {
  Settings,
  Globe,
  Moon,
  Sun,
  Monitor,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Trophy,
  Zap,
  BookOpen,
  Calendar,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useI18nStore } from '../stores/i18nStore';
import { LOCALE_OPTIONS } from '../i18n/translations';
import { useRecipeStore } from '../stores/recipeStore';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { useGoalStore } from '../stores/goalStore';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { PremiumBanner } from '../components/PremiumBanner';

type ThemeMode = 'light' | 'dark' | 'system';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { mode, setMode } = useThemeStore();
  const { locale, setLocale, t } = useI18nStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  const { mealPlans, fetchPlans } = useMealPlanStore();
  const { goals } = useGoalStore();

  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchRecipes();
    fetchPlans();
  }, []);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return;
    if (newPassword.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    setChangingPassword(true);
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      toast.success(t('general.success'));
      setOldPassword('');
      setNewPassword('');
    } catch {
      toast.error(t('general.error'));
    } finally {
      setChangingPassword(false);
    }
  };

  const themes: { value: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
    { value: 'dark', label: t('profile.themeDark'), icon: Moon, desc: 'Augen schonen' },
    { value: 'light', label: t('profile.themeLight'), icon: Sun, desc: 'Hell & klar' },
    { value: 'system', label: t('profile.themeSystem'), icon: Monitor, desc: 'Automatisch' },
  ];

  // Achievements basierend auf Aktivität
  const achievements = [
    { name: 'Erste Schritte', emoji: '🌱', unlocked: true, desc: 'Account erstellt' },
    { name: 'Koch-Anfänger', emoji: '🍳', unlocked: recipes.length >= 1, desc: '1 Rezept erstellt' },
    { name: 'Rezeptsammler', emoji: '📖', unlocked: recipes.length >= 5, desc: '5 Rezepte erstellt' },
    { name: 'Meisterkoch', emoji: '👨‍🍳', unlocked: recipes.length >= 15, desc: '15 Rezepte erstellt' },
    { name: 'Planer', emoji: '📅', unlocked: mealPlans.length >= 1, desc: '1 Tagesplan erstellt' },
    { name: 'Meal Prep Pro', emoji: '🏆', unlocked: mealPlans.length >= 7, desc: '7 Tagespläne erstellt' },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Member since
  const memberDays = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 via-accent-500 to-emerald-500 p-6 sm:p-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl shadow-black/20">
            <span className="text-4xl sm:text-5xl font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.username}</h1>
            <p className="text-white/70 text-sm sm:text-base">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                <Zap size={12} />
                {memberDays === 0 ? 'Heute beigetreten' : `${memberDays} Tage dabei`}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                <Trophy size={12} />
                {unlockedCount}/{achievements.length} Achievements
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<BookOpen size={18} />} label="Rezepte" value={recipes.length} color="text-accent-400" bg="bg-accent-500/10" />
        <StatCard icon={<Calendar size={18} />} label="Tagespläne" value={mealPlans.length} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard icon={<Target size={18} />} label="Kalorien-Ziel" value={`${goals.calories}`} color="text-fire-400" bg="bg-fire-400/10" />
        <StatCard icon={<TrendingUp size={18} />} label="Protein-Ziel" value={`${goals.protein}g`} color="text-purple-400" bg="bg-purple-500/10" />
      </div>

      {/* ── Achievements ── */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-4">
          <Trophy size={20} className="text-yellow-400" />
          <h2 className="text-lg font-bold">Achievements</h2>
          <span className="ml-auto text-sm text-gray-400 dark:text-dark-500">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {achievements.map((a) => (
            <div
              key={a.name}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-xl border transition-all',
                a.unlocked
                  ? 'bg-white dark:bg-dark-850/60 border-gray-200 dark:border-dark-700/50'
                  : 'bg-gray-50 dark:bg-dark-900/30 border-gray-100 dark:border-dark-800/20 opacity-40 grayscale'
              )}
            >
              <span className="text-2xl flex-shrink-0">{a.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.name}</p>
                <p className="text-[11px] text-gray-400 dark:text-dark-500 truncate">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Premium Banner ── */}
      <PremiumBanner />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Settings ── */}
        <div className="glass-card p-5 sm:p-6 space-y-6" id="tour-settings">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Settings size={20} className="text-accent-400" />
            <h2 className="text-lg font-bold">{t('profile.settings')}</h2>
          </div>

          {/* Theme */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-2 block">
              {t('profile.theme')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={clsx(
                    'flex flex-col items-center gap-1 rounded-xl p-3 text-xs font-medium transition-all border',
                    mode === value
                      ? 'border-accent-500/50 bg-accent-500/10 text-accent-600 dark:text-accent-400 shadow-sm'
                      : 'border-gray-200 dark:border-dark-700/30 text-gray-500 dark:text-dark-400 hover:border-accent-500/30'
                  )}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                  <span className="text-[10px] text-gray-400 dark:text-dark-500 hidden sm:block">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-2 block">
              <Globe size={14} className="inline mr-1" />
              {t('profile.language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LOCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLocale(opt.value)}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl p-3 text-sm font-medium transition-all border',
                    locale === opt.value
                      ? 'border-accent-500/50 bg-accent-500/10 text-accent-600 dark:text-accent-400 shadow-sm'
                      : 'border-gray-200 dark:border-dark-700/30 text-gray-500 dark:text-dark-400 hover:border-accent-500/30'
                  )}
                >
                  <span className="text-lg">{opt.flag}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Change Password ── */}
        <div className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Lock size={20} className="text-fire-400" />
            <h2 className="text-lg font-bold">{t('profile.changePassword')}</h2>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password') + ' (alt)'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.password') + ' (neu)'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
            />
            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !oldPassword || !newPassword}
              className="btn-primary w-full"
            >
              {changingPassword ? t('general.loading') : t('profile.changePassword')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Account Info (footer) ── */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-4">
          <Shield size={20} className="text-accent-400" />
          <h2 className="text-lg font-bold">{t('profile.account')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InfoRow label={t('auth.username')} value={user?.username || '—'} />
          <InfoRow label={t('auth.email')} value={user?.email || '—'} />
          <InfoRow
            label={t('profile.memberSince')}
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString(locale) : '—'}
          />
          <InfoRow label={t('profile.recipesCreated')} value={String(recipes.length)} accent />
        </div>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} mx-auto mb-2`}>
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-dark-400">{label}</p>
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-dark-850/50 border border-gray-100 dark:border-dark-800/30">
      <span className="text-xs text-gray-400 dark:text-dark-500 mb-1">{label}</span>
      <span className={clsx('text-sm font-semibold truncate', accent ? 'text-accent-400' : 'text-gray-900 dark:text-white')}>
        {value}
      </span>
    </div>
  );
}
