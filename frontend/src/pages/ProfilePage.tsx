/**
 * MacroMate – ProfilePage
 * Structured profile: Personal data, Household, Settings, Security.
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
  Zap,
  BookOpen,
  Calendar,
  Target,
  TrendingUp,
  Users,
  Copy,
  LogOut,
  Plus,
  UserPlus,
  RefreshCw,
  UserMinus,
  Clock,
  AlertTriangle,
  Edit3,
  Activity,
  AlertCircle,
  Leaf,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useI18nStore } from '../stores/i18nStore';
import { LOCALE_OPTIONS } from '../i18n/translations';
import { useRecipeStore } from '../stores/recipeStore';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { useGoalStore } from '../stores/goalStore';
import { authAPI, householdAPI, profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { PremiumBanner } from '../components/PremiumBanner';
import type { Household, ProfileData, TDEEResult } from '../types';
import { ALLERGY_OPTIONS, DIET_OPTIONS } from '../types';

type ThemeMode = 'light' | 'dark' | 'system';
type ProfileTab = 'overview' | 'household' | 'settings';

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Wenig aktiv',
  light: 'Leicht aktiv',
  moderate: 'Moderat aktiv',
  active: 'Sehr aktiv',
  very_active: 'Extrem aktiv',
};
const GOAL_LABELS: Record<string, string> = { lose: 'Abnehmen', maintain: 'Halten', gain: 'Aufbauen' };
const GENDER_LABELS: Record<string, string> = { male: 'Männlich', female: 'Weiblich', other: 'Divers' };

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { mode, setMode } = useThemeStore();
  const { locale, setLocale, t } = useI18nStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  const { mealPlans, fetchPlans } = useMealPlanStore();
  const { goals } = useGoalStore();

  const [tab, setTab] = useState<ProfileTab>('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tdee, setTdee] = useState<TDEEResult | null>(null);

  // Household
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showHouseholdCreate, setShowHouseholdCreate] = useState(false);
  const [showHouseholdJoin, setShowHouseholdJoin] = useState(false);

  // Allergies & diet
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [tempAllergies, setTempAllergies] = useState<string[]>([]);
  const [tempDietType, setTempDietType] = useState<string>('');

  useEffect(() => {
    fetchRecipes();
    fetchPlans();
    loadProfile();
    loadHousehold();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await profileAPI.get();
      setProfile(p);
      if (p.onboarding_completed) {
        const t = await profileAPI.getTDEE();
        setTdee(t);
      }
    } catch { /* not completed */ }
  };

  const loadHousehold = async () => {
    try {
      const h = await householdAPI.getMine();
      setHousehold(h);
    } catch { /* no household */ }
  };

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) return;
    try {
      const h = await householdAPI.create(householdName.trim());
      setHousehold(h);
      setHouseholdName('');
      setShowHouseholdCreate(false);
      toast.success('Haushalt erstellt!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Fehler beim Erstellen');
    }
  };

  const handleJoinHousehold = async () => {
    if (!inviteCode.trim()) return;
    try {
      const h = await householdAPI.join(inviteCode.trim());
      setHousehold(h);
      setInviteCode('');
      setShowHouseholdJoin(false);
      toast.success('Haushalt beigetreten!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Ungültiger oder abgelaufener Code');
    }
  };

  const handleLeaveHousehold = async () => {
    try {
      await householdAPI.leave();
      setHousehold(null);
      toast.success('Haushalt verlassen');
    } catch { toast.error('Fehler'); }
  };

  const handleRegenerateCode = async () => {
    try {
      const h = await householdAPI.regenerateCode();
      setHousehold(h);
      toast.success('Neuer Einladungscode generiert!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Fehler');
    }
  };

  const handleRemoveMember = async (userId: number, username: string) => {
    try {
      await householdAPI.removeMember(userId);
      await loadHousehold();
      toast.success(`${username} entfernt`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Fehler');
    }
  };

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

  const startEditingAllergies = () => {
    setTempAllergies(profile?.allergies || []);
    setTempDietType(profile?.diet_type || '');
    setEditingAllergies(true);
  };

  const toggleAllergy = (allergy: string) => {
    setTempAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const saveAllergies = async () => {
    try {
      await profileAPI.update({
        allergies: tempAllergies,
        diet_type: tempDietType || null,
      });
      setProfile((prev) => prev ? { ...prev, allergies: tempAllergies, diet_type: tempDietType || null } : prev);
      setEditingAllergies(false);
      toast.success('Gespeichert!');
    } catch {
      toast.error('Fehler beim Speichern');
    }
  };

  const themes: { value: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
    { value: 'dark', label: t('profile.themeDark'), icon: Moon, desc: 'Augen schonen' },
    { value: 'light', label: t('profile.themeLight'), icon: Sun, desc: 'Hell & klar' },
    { value: 'system', label: t('profile.themeSystem'), icon: Monitor, desc: 'Automatisch' },
  ];

  const memberDays = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)
    : 0;

  const isCreator = household && household.created_by === user?.id;
  const inviteExpired = household?.invite_expires_at && new Date(household.invite_expires_at) < new Date();

  const TABS: { id: ProfileTab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: 'Übersicht', icon: Target },
    { id: 'household', label: 'Haushalt', icon: Users },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 via-accent-500 to-accent-400 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-center gap-5">
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
              {household && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                  <Users size={12} />
                  {household.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex rounded-xl border border-gray-200 dark:border-dark-700/30 overflow-hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all',
              tab === id
                ? 'bg-accent-500/15 text-accent-600 dark:text-accent-400'
                : 'text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: Overview ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<BookOpen size={18} />} label="Rezepte" value={recipes.length} color="text-accent-400" bg="bg-accent-500/10" />
            <StatCard icon={<Calendar size={18} />} label="Tagespläne" value={mealPlans.length} color="text-blue-400" bg="bg-blue-500/10" />
            <StatCard icon={<Target size={18} />} label="Kalorien-Ziel" value={`${goals.calories}`} color="text-fire-400" bg="bg-fire-400/10" />
            <StatCard icon={<TrendingUp size={18} />} label="Protein-Ziel" value={`${goals.protein}g`} color="text-purple-400" bg="bg-purple-500/10" />
          </div>

          <PremiumBanner />

          {/* Allergies & Diet Preferences */}
          <div className="glass-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <AlertCircle size={20} className="text-amber-400" />
                <h2 className="text-lg font-bold">Allergien & Ernährung</h2>
              </div>
              {!editingAllergies && (
                <button onClick={startEditingAllergies} className="text-xs text-accent-400 hover:underline flex items-center gap-1">
                  <Edit3 size={12} /> Bearbeiten
                </button>
              )}
            </div>

            {editingAllergies ? (
              <div className="space-y-4">
                {/* Diet Type */}
                <div>
                  <label className="input-label">Ernährungsform</label>
                  <div className="flex flex-wrap gap-2">
                    {DIET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTempDietType(opt.value)}
                        className={clsx(
                          'px-3 py-2 sm:py-1.5 rounded-xl text-sm font-medium transition-all border min-h-[44px] sm:min-h-0',
                          tempDietType === opt.value
                            ? 'bg-accent-500/20 border-accent-500/40 text-accent-600 dark:text-accent-400'
                            : 'bg-gray-100 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700/30 text-gray-500 dark:text-dark-400 hover:border-gray-300 dark:hover:border-dark-600'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label className="input-label">Unverträglichkeiten & Allergien</label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleAllergy(opt.value)}
                        className={clsx(
                          'px-3 py-2 sm:py-1.5 rounded-xl text-sm font-medium transition-all border min-h-[44px] sm:min-h-0',
                          tempAllergies.includes(opt.value)
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400'
                            : 'bg-gray-100 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700/30 text-gray-500 dark:text-dark-400 hover:border-gray-300 dark:hover:border-dark-600'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={saveAllergies} className="btn-primary">Speichern</button>
                  <button onClick={() => setEditingAllergies(false)} className="btn-secondary">Abbrechen</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Leaf size={14} className="text-accent-400" />
                  <span className="text-sm text-gray-500 dark:text-dark-400">Ernährungsform:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile?.diet_type
                      ? DIET_OPTIONS.find((d) => d.value === profile.diet_type)?.label || 'Keine Einschränkung'
                      : 'Keine Einschränkung'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle size={14} className="text-amber-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-dark-400">Allergien:</span>
                    {profile?.allergies && profile.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {profile.allergies.map((a) => (
                          <span key={a} className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                            {ALLERGY_OPTIONS.find((o) => o.value === a)?.label || a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">Keine</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Personal Body Data */}
          {profile?.onboarding_completed && tdee ? (
            <div className="glass-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Activity size={20} className="text-accent-400" />
                  <h2 className="text-lg font-bold">Deine Körperdaten</h2>
                </div>
                <button onClick={() => setTab('settings')} className="text-xs text-accent-400 hover:underline flex items-center gap-1">
                  <Edit3 size={12} /> Bearbeiten
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <DataPill label="Geschlecht" value={GENDER_LABELS[profile.gender || ''] || '–'} />
                <DataPill label="Alter" value={profile.age ? `${profile.age} J.` : '–'} />
                <DataPill label="Größe" value={profile.height_cm ? `${profile.height_cm} cm` : '–'} />
                <DataPill label="Gewicht" value={profile.weight_kg ? `${profile.weight_kg} kg` : '–'} />
                <DataPill label="Aktivität" value={ACTIVITY_LABELS[profile.activity_level || ''] || '–'} />
                <DataPill label="Ziel" value={GOAL_LABELS[profile.goal || ''] || '–'} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-dark-800/30">
                <MacroPill label="Grundumsatz" value={`${Math.round(tdee.bmr)} kcal`} color="text-gray-500" />
                <MacroPill label="Tagesbedarf" value={`${tdee.target_calories} kcal`} color="text-fire-400" />
                <MacroPill label="Protein" value={`${tdee.protein_g}g`} color="text-blue-400" />
                <MacroPill label="Kohlenhydrate" value={`${tdee.carbs_g}g`} color="text-purple-400" />
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <Activity size={32} className="mx-auto mb-3 text-gray-300 dark:text-dark-600" />
              <p className="text-sm text-gray-500 dark:text-dark-400">
                Schließe das Onboarding ab, um deinen persönlichen Ernährungsplan zu sehen.
              </p>
            </div>
          )}

          {/* Account Info */}
          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-4">
              <Shield size={20} className="text-accent-400" />
              <h2 className="text-lg font-bold">{t('profile.account')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <InfoRow label={t('auth.username')} value={user?.username || '—'} />
              <InfoRow label={t('auth.email')} value={user?.email || '—'} />
              <InfoRow label={t('profile.memberSince')} value={user?.created_at ? new Date(user.created_at).toLocaleDateString(locale) : '—'} />
              <InfoRow label={t('profile.recipesCreated')} value={String(recipes.length)} accent />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: Household ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {tab === 'household' && (
        <div className="space-y-6">
          {household ? (
            <>
              {/* Household Info Card */}
              <div className="glass-card p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Users size={20} className="text-accent-400" />
                    <h2 className="text-lg font-bold">{household.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-dark-500">
                      {household.members.length}/{household.max_members} Mitglieder
                    </span>
                    <button
                      onClick={handleLeaveHousehold}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} /> Verlassen
                    </button>
                  </div>
                </div>

                {/* Invite Code Section */}
                <div className="bg-gray-50 dark:bg-dark-850/50 rounded-xl p-4 border border-gray-100 dark:border-dark-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">Einladungscode</span>
                    {inviteExpired && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                        <AlertTriangle size={10} /> Abgelaufen
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className={clsx(
                      'text-lg font-mono font-bold tracking-widest',
                      inviteExpired ? 'text-gray-400 line-through' : 'text-accent-400'
                    )}>
                      {household.invite_code}
                    </code>
                    {!inviteExpired && (
                      <button
                        onClick={() => { navigator.clipboard.writeText(household.invite_code); toast.success('Kopiert!'); }}
                        className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                  {household.invite_expires_at && (
                    <p className="text-[10px] text-gray-400 dark:text-dark-500 flex items-center gap-1">
                      <Clock size={10} />
                      {inviteExpired ? 'Abgelaufen' : `Gültig bis ${new Date(household.invite_expires_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  )}
                  {isCreator && (
                    <button
                      onClick={handleRegenerateCode}
                      className="flex items-center gap-1.5 text-xs text-accent-400 hover:underline"
                    >
                      <RefreshCw size={12} /> Neuen Code generieren
                    </button>
                  )}
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">Mitglieder</p>
                  {household.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-850/30 border border-gray-100 dark:border-dark-800/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent-500/15 flex items-center justify-center text-accent-400 text-sm font-bold">
                          {m.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{m.username}</span>
                          {m.id === household.created_by && (
                            <span className="ml-2 text-[10px] bg-accent-500/15 text-accent-400 px-2 py-0.5 rounded-full">Admin</span>
                          )}
                        </div>
                      </div>
                      {isCreator && m.id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(m.id, m.username)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Mitglied entfernen"
                        >
                          <UserMinus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works info */}
              <div className="glass-card p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">So funktioniert der Haushalt</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <HowItWorksItem
                    step="1"
                    title="Persönliche Pläne"
                    desc="Jedes Mitglied erstellt eigene Essenspläne mit individuellen Makrozielen."
                  />
                  <HowItWorksItem
                    step="2"
                    title="Gemeinsam planen"
                    desc="Seht die Pläne aller Mitglieder im Meal Planner unter 'Haushalt'."
                  />
                  <HowItWorksItem
                    step="3"
                    title="Zusammen einkaufen"
                    desc="Die Einkaufsliste fasst die Zutaten aller Haushaltsmitglieder zusammen."
                  />
                </div>
              </div>
            </>
          ) : (
            /* No Household — Create or Join */
            <div className="glass-card p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-accent-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gemeinsam essen, gemeinsam planen</h2>
                <p className="text-sm text-gray-500 dark:text-dark-400 max-w-md mx-auto">
                  Erstelle einen Haushalt oder tritt einem bei. So könnt ihr als Familie oder WG zusammen Essenspläne machen und eine gemeinsame Einkaufsliste nutzen.
                </p>
              </div>

              {showHouseholdCreate ? (
                <div className="max-w-sm mx-auto space-y-3">
                  <input
                    type="text"
                    placeholder="Name des Haushalts (z.B. 'Familie Müller')"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="input"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateHousehold()}
                    maxLength={50}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleCreateHousehold} className="btn-primary flex-1" disabled={!householdName.trim()}>
                      Erstellen
                    </button>
                    <button onClick={() => setShowHouseholdCreate(false)} className="btn-secondary px-4">
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : showHouseholdJoin ? (
                <div className="max-w-sm mx-auto space-y-3">
                  <input
                    type="text"
                    placeholder="Einladungscode eingeben"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="input font-mono text-center tracking-widest text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinHousehold()}
                    maxLength={20}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleJoinHousehold} className="btn-primary flex-1" disabled={!inviteCode.trim()}>
                      Beitreten
                    </button>
                    <button onClick={() => setShowHouseholdJoin(false)} className="btn-secondary px-4">
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => setShowHouseholdCreate(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-accent-500/30 bg-accent-500/10 text-accent-600 dark:text-accent-400 hover:bg-accent-500/20 transition-all text-sm font-semibold"
                  >
                    <Plus size={18} /> Haushalt erstellen
                  </button>
                  <button
                    onClick={() => setShowHouseholdJoin(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800 text-gray-600 dark:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600 transition-all text-sm font-semibold"
                  >
                    <UserPlus size={18} /> Mit Code beitreten
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: Settings ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {tab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme & Language */}
            <div className="glass-card p-5 sm:p-6 space-y-6" id="tour-settings">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Settings size={20} className="text-accent-400" />
                <h2 className="text-lg font-bold">{t('profile.settings')}</h2>
              </div>

              {/* Theme */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-2 block">{t('profile.theme')}</label>
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

            {/* Change Password */}
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
        </div>
      )}
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

function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-dark-850/50 border border-gray-100 dark:border-dark-800/30">
      <span className="text-[10px] text-gray-400 dark:text-dark-500 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function MacroPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-dark-850/50 border border-gray-100 dark:border-dark-800/30">
      <span className="text-[10px] text-gray-400 dark:text-dark-500 uppercase tracking-wider mb-1">{label}</span>
      <span className={clsx('text-sm font-bold', color)}>{value}</span>
    </div>
  );
}

function HowItWorksItem({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-400 text-sm font-bold mx-auto mb-2">
        {step}
      </div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-dark-400">{desc}</p>
    </div>
  );
}
