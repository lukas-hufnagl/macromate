/**
 * MacroMate – App Component
 * Root-Komponente mit React Router, Theme, i18n und Toast-Notifications.
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { ConfirmProvider } from './components/ConfirmDialog';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RecipesPage from './pages/RecipesPage';
import MealPlannerPage from './pages/MealPlannerPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const initTheme = useThemeStore((s) => s.init);

  // Beim Start: Auth-Status prüfen + Theme initialisieren
  useEffect(() => {
    checkAuth();
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <ConfirmProvider>
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
              iconTheme: { primary: '#18b363', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/meal-planner" element={<MealPlannerPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ConfirmProvider>
    </BrowserRouter>
  );
}
