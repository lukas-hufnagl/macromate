/**
 * MacroMate – Login Page
 * Premium fullscreen login with animated background, glassmorphism, and smooth UX.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ChefHat, Eye, EyeOff, Loader2, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success('Willkommen zurück! 🎉');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-50 dark:bg-dark-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern dark:bg-hero-pattern-dark" />
        <div className="absolute top-1/4 -left-24 w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 -right-24 w-[400px] h-[400px] bg-accent-600/6 rounded-full blur-[80px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-400/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in">
        {/* Logo & Welcome */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-2xl shadow-accent-500/30 mb-5 animate-glow">
            <ChefHat size={36} className="text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
              <Zap size={12} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Willkommen zurück
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-2 text-sm sm:text-base">
            Dein persönlicher Ernährungsplaner wartet auf dich
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
          {/* Username */}
          <div>
            <label className="input-label">Benutzername</label>
            <input
              type="text"
              className="input"
              placeholder="Dein Benutzername"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <label className="input-label">Passwort</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-12"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-500 hover:text-gray-600 dark:hover:text-dark-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full text-base group"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Wird eingeloggt...
              </>
            ) : (
              <>
                Einloggen
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
                Noch kein Konto?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="btn-secondary w-full text-center text-sm"
          >
            Kostenlos registrieren
          </Link>
        </form>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-gray-400 dark:text-dark-600 mt-6">
          MacroMate — Dein smarter Ernährungsbegleiter
        </p>
      </div>
    </div>
  );
}
