/**
 * MacroMate – Register Page
 * Registrierung mit Passwort-Validierung und visueller Stärke-Anzeige.
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ChefHat, Eye, EyeOff, Loader2, ArrowRight, Check, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Passwort-Stärke berechnen
  const passwordChecks = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      number: /[0-9]/.test(p),
      match: p.length > 0 && p === form.confirmPassword,
    };
  }, [form.password, form.confirmPassword]);

  const isFormValid =
    form.username.length >= 3 &&
    form.email.includes('@') &&
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.number &&
    passwordChecks.match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      toast.success('Registrierung erfolgreich! 🚀');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const CheckItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {ok ? (
        <Check size={13} className="text-accent-400" />
      ) : (
        <X size={13} className="text-gray-400 dark:text-dark-600" />
      )}
      <span className={ok ? 'text-gray-700 dark:text-dark-300' : 'text-gray-400 dark:text-dark-600'}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gray-50 dark:bg-dark-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern dark:bg-hero-pattern-dark" />
        <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 -left-24 w-[400px] h-[400px] bg-accent-600/6 rounded-full blur-[80px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-2xl shadow-accent-500/30 mb-5 animate-glow">
            <ChefHat size={36} className="text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Konto erstellen</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-2 text-sm sm:text-base">Starte jetzt mit smartem Meal Prepping</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-4">
          {/* Username */}
          <div>
            <label className="input-label">Benutzername</label>
            <input
              type="text"
              className="input"
              placeholder="Min. 3 Zeichen"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Email */}
          <div>
            <label className="input-label">E-Mail</label>
            <input
              type="email"
              className="input"
              placeholder="deine@email.de"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="input-label">Passwort</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-12"
                placeholder="Sicheres Passwort wählen"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-500 hover:text-gray-600 dark:hover:text-dark-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="input-label">Passwort bestätigen</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Passwort wiederholen"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          {/* Password Strength Checks */}
          {form.password.length > 0 && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-dark-800/30 space-y-2 animate-fade-in">
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2">
                Passwort-Anforderungen
              </p>
              <CheckItem ok={passwordChecks.length} label="Mindestens 8 Zeichen" />
              <CheckItem ok={passwordChecks.upper} label="Ein Großbuchstabe" />
              <CheckItem ok={passwordChecks.number} label="Eine Zahl" />
              <CheckItem ok={passwordChecks.match} label="Passwörter stimmen überein" />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="btn-primary w-full text-base group"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                Registrieren
                <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/60 dark:border-dark-800/60" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white/60 dark:bg-dark-900/60 text-gray-400 dark:text-dark-500 rounded-full">
                Bereits ein Konto?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="btn-secondary w-full text-center text-sm"
          >
            Zum Login
          </Link>
        </form>

        <p className="text-center text-[11px] text-gray-400 dark:text-dark-600 mt-6">
          MacroMate — Dein smarter Ernährungsbegleiter
        </p>
      </div>
    </div>
  );
}
