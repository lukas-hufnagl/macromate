/**
 * MacroMate – App Component
 * Root-Komponente mit React Router, Theme, i18n und Toast-Notifications.
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { ConfirmProvider } from './components/ConfirmDialog';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingWizard from './components/OnboardingWizard';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RecipesPage from './pages/RecipesPage';
import MealPlannerPage from './pages/MealPlannerPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import SharedPlanPage from './pages/SharedPlanPage';

export default function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const initTheme = useThemeStore((s) => s.init);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAuth();
    initTheme();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && !user.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, user]);

  return (
    <BrowserRouter>
      <ConfirmProvider>
        {showOnboarding && (
          <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
        )}

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg, #1e1e2e)',
              color: 'var(--toast-color, #ececf1)',
              border: '1px solid var(--toast-border, rgba(78, 78, 100, 0.3))',
              borderRadius: '16px',
              padding: '14px 20px',
              fontSize: '14px',
              backdropFilter: 'blur(20px)',
            },
            success: {
              iconTheme: { primary: '#3B82F6', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Landing Page — unauthenticated users */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />}
          />

          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />

          {/* Shared Plan — public, no auth required */}
          <Route path="/shared/:shareToken" element={<SharedPlanPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/meal-planner" element={<MealPlannerPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Route>

          {/* Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ConfirmProvider>
    </BrowserRouter>
  );
}
