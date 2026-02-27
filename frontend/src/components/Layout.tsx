/**
 * MacroMate – Layout Component
 * Sidebar navigation (desktop) + bottom tab bar (mobile).
 * Gives a real app feel, not a generic website.
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useI18nStore } from '../stores/i18nStore';
import { useOnboardingTour } from './OnboardingTour';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ShoppingCart,
  User,
  LogOut,
  Sun,
  Moon,
  ChefHat,
  Heart,
  BarChart3,
} from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  useOnboardingTour();

  const { user, logout } = useAuthStore();
  const { resolved, setMode } = useThemeStore();
  const t = useI18nStore((s) => s.t);
  const location = useLocation();

  const NAV_ITEMS = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/recipes', label: t('nav.recipes'), icon: BookOpen },
    { path: '/meal-planner', label: t('nav.mealPlanner'), icon: Calendar },
    { path: '/shopping-list', label: t('nav.shoppingList'), icon: ShoppingCart },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];

  const SIDEBAR_EXTRA = [
    { path: '/recipes?tab=favorites', label: t('nav.favorites'), icon: Heart },
  ];

  const MOBILE_NAV = NAV_ITEMS;

  const toggleTheme = () => setMode(resolved === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[240px] fixed inset-y-0 left-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-r border-gray-100 dark:border-dark-800/50">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 dark:border-dark-800">
          <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
            <ChefHat size={17} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">MacroMate</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400'
                    : 'text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-850'
                )}
              >
                <item.icon size={18} className={isActive ? 'text-accent-600 dark:text-accent-400' : ''} />
                {item.label}
              </Link>
            );
          })}

          {/* Separator */}
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-dark-800/50">
            <p className="px-3 text-[10px] font-semibold text-gray-400 dark:text-dark-600 uppercase tracking-wider mb-2">
              {t('nav.shortcuts')}
            </p>
            {SIDEBAR_EXTRA.map((item) => {
              const isActive = location.pathname + location.search === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400'
                      : 'text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-850'
                  )}
                >
                  <item.icon size={18} className={isActive ? 'text-accent-600 dark:text-accent-400' : ''} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-dark-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-850 transition-all"
          >
            {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {resolved === 'dark' ? t('general.lightMode') : t('general.darkMode')}
          </button>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-500/15 flex items-center justify-center text-accent-700 dark:text-accent-400 text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username}</p>
              <p className="text-[11px] text-gray-400 dark:text-dark-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-gray-400 dark:text-dark-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              title={t('nav.logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center">
            <ChefHat size={15} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white">MacroMate</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-400 dark:text-dark-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-[240px]">
        <div className="pt-16 lg:pt-6 pb-24 lg:pb-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800 safe-area-pb">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {MOBILE_NAV.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px]',
                  isActive
                    ? 'text-accent-600 dark:text-accent-400'
                    : 'text-gray-400 dark:text-dark-500'
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
