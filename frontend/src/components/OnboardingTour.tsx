/**
 * MacroMate – Onboarding Tour
 * Step-by-step Einführung mit driver.js – wird nur beim ersten Login angezeigt.
 */

import { useEffect, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useLocation } from 'react-router-dom';

const TOUR_DONE_KEY = 'macromate-tour-done';

export function useOnboardingTour() {
  const location = useLocation();

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0,0,0,0.65)',
      stagePadding: 8,
      stageRadius: 16,
      popoverClass: 'macromate-tour-popover',
      nextBtnText: 'Weiter →',
      prevBtnText: '← Zurück',
      doneBtnText: 'Los geht\'s! 🚀',
      progressText: '{{current}} von {{total}}',
      steps: [
        {
          popover: {
            title: '👋 Willkommen bei MacroMate!',
            description:
              'Dein Smart Meal Prep Planner. Lass mich dir kurz zeigen, wo du was findest.',
            side: 'over' as const,
            align: 'center' as const,
          },
        },
        {
          element: '[data-tour="nav-dashboard"]',
          popover: {
            title: '📊 Dashboard',
            description:
              'Deine Startseite – hier siehst du den Tagesüberblick, aktuelle Makros und den heutigen Plan.',
            side: 'bottom' as const,
            align: 'start' as const,
          },
        },
        {
          element: '[data-tour="nav-recipes"]',
          popover: {
            title: '📖 Rezepte',
            description:
              'Hier verwaltest du deine Rezepte. Du kannst eigene anlegen, importieren oder aus unserer Sammlung wählen.',
            side: 'bottom' as const,
            align: 'start' as const,
          },
        },
        {
          element: '[data-tour="nav-mealplanner"]',
          popover: {
            title: '📅 Meal Planner',
            description:
              'Setze deine Makro-Ziele und lass dir automatisch einen optimalen Tagesplan generieren!',
            side: 'bottom' as const,
            align: 'start' as const,
          },
        },
        {
          element: '[data-tour="nav-shoppinglist"]',
          popover: {
            title: '🛒 Einkaufsliste',
            description:
              'Generiere eine Einkaufsliste aus deinen Tagesplänen – mit Export als PDF oder CSV.',
            side: 'bottom' as const,
            align: 'start' as const,
          },
        },
        {
          element: '[data-tour="nav-profile"]',
          popover: {
            title: '👤 Profil & Einstellungen',
            description:
              'Theme, Sprache und Passwort ändern.',
            side: 'left' as const,
            align: 'start' as const,
          },
        },
        {
          element: '[data-tour="theme-toggle"]',
          popover: {
            title: '🌙 Dark / Light Mode',
            description:
              'Wechsle schnell zwischen Dark und Light Mode – ganz nach deinem Geschmack.',
            side: 'bottom' as const,
            align: 'end' as const,
          },
        },
        {
          popover: {
            title: '🎉 Alles klar!',
            description:
              'Du bist startklar! Tipp: Geh zuerst zu „Rezepte" und klick auf „Rezepte entdecken" um direkt loszulegen. Viel Spaß mit MacroMate!',
            side: 'over' as const,
            align: 'center' as const,
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem(TOUR_DONE_KEY, 'true');
      },
    });

    // Kurze Verzögerung, damit die Elemente gerendert sind
    setTimeout(() => {
      driverObj.drive();
    }, 600);
  }, []);

  useEffect(() => {
    // Nur auf Dashboard starten und nur beim ersten Mal
    if (location.pathname !== '/') return;
    const done = localStorage.getItem(TOUR_DONE_KEY);
    if (done) return;

    startTour();
  }, [location.pathname, startTour]);

  // Manuell starten (z.B. aus Profil-Seite oder Settings)
  return { startTour };
}

/**
 * Reset: Tour kann erneut angezeigt werden
 */
export function resetTour() {
  localStorage.removeItem(TOUR_DONE_KEY);
}
