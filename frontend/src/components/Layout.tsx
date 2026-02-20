/**
 * MacroMate – Layout Component
 * Wrapper mit Navbar und Content-Bereich.
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useOnboardingTour } from './OnboardingTour';

export default function Layout() {
  // Onboarding Tour – startet automatisch beim ersten Login
  useOnboardingTour();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Navbar />
      {/* Content mit Padding-Top für fixe Navbar */}
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
