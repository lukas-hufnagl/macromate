/**
 * MacroMate – Navbar Component
 * Navigation mit Glassmorphism, Dark/Light Mode und i18n.
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useI18nStore } from '../stores/i18nStore';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  ChefHat,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { resolved, setMode, mode } = useThemeStore();
  const t = useI18nStore((s) => s.t);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard, tourId: 'nav-dashboard' },
    { path: '/recipes', label: t('nav.recipes'), icon: BookOpen, tourId: 'nav-recipes' },
    { path: '/meal-planner', label: t('nav.mealPlanner'), icon: Calendar, tourId: 'nav-mealplanner' },
    { path: '/shopping-list', label: t('nav.shoppingList'), icon: ShoppingCart, tourId: 'nav-shoppinglist' },
  ];

  const toggleTheme = () => {
    setMode(resolved === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-white/80 dark:bg-dark-950/80 backdrop-blur-2xl border-b border-gray-200 dark:border-dark-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20 group-hover:shadow-accent-500/40 transition-shadow">
                <ChefHat size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-dark-300 bg-clip-text text-transparent">
                MacroMate
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-tour={item.tourId}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-accent-500/15 text-accent-600 dark:text-accent-400 shadow-sm'
                        : 'text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800/50'
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                data-tour="theme-toggle"
                className="p-2 rounded-xl text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800/50 transition-all"
                title={resolved === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Profile */}
              <Link
                to="/profile"
                data-tour="nav-profile"
                className={clsx(
                  'flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all',
                  location.pathname === '/profile'
                    ? 'bg-accent-500/10 border-accent-500/30'
                    : 'bg-gray-50 dark:bg-dark-900/50 border-gray-200 dark:border-dark-800/50 hover:border-accent-500/30'
                )}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-600 to-accent-500 flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-dark-200">
                  {user?.username}
                </span>
                {user?.is_premium && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-500 dark:text-amber-400 text-[9px] font-bold">
                    👑 PRO
                  </span>
                )}
              </Link>

              <button
                onClick={logout}
                className="btn-ghost text-gray-400 dark:text-dark-500 hover:text-red-400"
                title={t('nav.logout')}
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-500 dark:text-dark-400"
              >
                {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800/50 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'md:hidden fixed inset-x-0 top-16 bg-white/95 dark:bg-dark-950/95 backdrop-blur-2xl border-b border-gray-200 dark:border-dark-800/50 transition-all duration-300 ease-out origin-top',
          mobileMenuOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        )}
      >
        <div className="px-3 py-3 space-y-0.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent-500/15 text-accent-600 dark:text-accent-400'
                    : 'text-gray-600 dark:text-dark-300 active:bg-gray-100 dark:active:bg-dark-800/50'
                )}
              >
                <item.icon size={19} />
                {item.label}
              </Link>
            );
          })}

          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              location.pathname === '/profile'
                ? 'bg-accent-500/15 text-accent-600 dark:text-accent-400'
                : 'text-gray-600 dark:text-dark-300 active:bg-gray-100 dark:active:bg-dark-800/50'
            )}
          >
            <User size={19} />
            {t('nav.profile')}
            {user?.is_premium && (
              <span className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-500 text-[9px] font-bold">
                👑 PRO
              </span>
            )}
          </Link>

          <div className="border-t border-gray-200/60 dark:border-dark-800/40 pt-2 mt-2 mx-2">
            <div className="flex items-center justify-between px-2 py-2.5">
              <span className="text-xs text-gray-400 dark:text-dark-500 font-medium">{user?.username}</span>
              <button
                onClick={logout}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 font-medium"
              >
                <LogOut size={14} />
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
