/**
 * MacroMate – Landing Page
 * Premium SaaS landing with hero, features, how-it-works, pricing, testimonials, FAQ & CTA.
 * Inspired by MealPrepPro but distinctive.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChefHat,
  Zap,
  Target,
  Calendar,
  ShoppingCart,
  ArrowRight,
  Check,
  Star,
  ChevronDown,
  Play,
  BookOpen,
  Users,
  Menu,
  X,
  Utensils,
  Moon,
  Sun,
  Clock,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import clsx from 'clsx';

/* ── Data ────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: <Target size={24} />,
    title: 'Kalorien & Makros tracken',
    desc: 'Setze individuelle Ziele für Kalorien, Protein, Fett und Kohlenhydrate — MacroMate zeigt dir live, wie nah du dran bist.',
    color: 'text-accent-500',
    bg: 'bg-accent-500/10',
  },
  {
    icon: <Calendar size={24} />,
    title: 'Perfekte Pläne, ein Klick',
    desc: 'Automatische Tagespläne, optimiert auf dein Kalorienziel. Spare Zeit, spare Geld, erreiche deine Ziele.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: <BookOpen size={24} />,
    title: 'Tausende Rezepte',
    desc: 'Erstelle eigene Rezepte oder durchsuche die Datenbank. Alle Nährwerte werden automatisch berechnet.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: <Utensils size={24} />,
    title: 'OpenFoodFacts-Datenbank',
    desc: 'Über 3 Millionen Produkte mit Nährwertangaben — automatisch geladen aus der weltweit größten offenen Lebensmitteldatenbank.',
    color: 'text-fire-400',
    bg: 'bg-fire-400/10',
  },
  {
    icon: <ShoppingCart size={24} />,
    title: 'Alles an einem Ort',
    desc: 'Rezepte, Meal Plans und Einkaufslisten in einer App. Exportiere als CSV oder PDF und geh stressfrei einkaufen.',
    color: 'text-accent-500',
    bg: 'bg-accent-500/10',
  },
  {
    icon: <Users size={24} />,
    title: 'Gemeinsam planen',
    desc: 'Erstelle einen Haushalt und teile Essenspläne und Einkaufslisten mit deiner Familie oder WG.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: 'Für immer',
    desc: 'Perfekt zum Ausprobieren',
    features: [
      'Bis zu 10 Rezepte',
      'Tägliche Meal Plans',
      'Einkaufslisten-Export',
      'Nährwert-Tracking',
      'Deutsch & Englisch',
    ],
    cta: 'Kostenlos starten',
    popular: false,
    color: 'border-gray-200 dark:border-dark-700',
  },
  {
    name: 'Pro',
    price: '4.99',
    period: '/Monat',
    desc: 'Für ambitionierte Meal Prepper',
    features: [
      'Unbegrenzte Rezepte',
      'Wöchentliche Meal Plans',
      'Erweiterte Makro-Filter',
      'Favoriten & Sammlungen',
      'Nährwert-Datenbank (OpenFoodFacts)',
      'Prioritäts-Support',
    ],
    cta: 'Pro werden',
    popular: true,
    color: 'border-accent-500',
  },
  {
    name: 'Team',
    price: '9.99',
    period: '/Monat',
    desc: 'Für Familien & WGs',
    features: [
      'Alles aus Pro',
      'Bis zu 5 Mitglieder',
      'Geteilte Rezeptsammlungen',
      'Gemeinsame Meal Plans',
      'Familien-Einkaufslisten',
      'Admin-Dashboard',
      'Premium-Support',
    ],
    cta: 'Team starten',
    popular: false,
    color: 'border-purple-500',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Fitness-Enthusiastin',
    text: 'MacroMate hat mein Meal Prepping komplett verändert. Die automatischen Pläne sparen mir Stunden pro Woche!',
    rating: 5,
  },
  {
    name: 'Lukas K.',
    role: 'Hobby-Koch',
    text: 'Die Nährwert-Suche über OpenFoodFacts ist genial. Ich finde sofort alle Angaben pro Zutat.',
    rating: 5,
  },
  {
    name: 'Anna W.',
    role: 'Ernährungsberaterin',
    text: 'Empfehle ich jedem meiner Klienten. Die Nährwert-Analyse ist genau und die App super intuitiv.',
    rating: 5,
  },
];

const FAQS = [
  {
    q: 'Ist MacroMate wirklich kostenlos?',
    a: 'Ja! Der Free-Plan ist dauerhaft kostenlos mit bis zu 10 Rezepten und allen Basis-Features. Upgrade jederzeit auf Pro für unbegrenzte Rezepte und erweiterte Features.',
  },
  {
    q: 'Woher kommen die Nährwertdaten?',
    a: 'Wir nutzen OpenFoodFacts — die weltweit größte offene Lebensmitteldatenbank mit über 3 Millionen Produkten. Du kannst die Werte jederzeit manuell anpassen.',
  },
  {
    q: 'Kann ich meine Daten exportieren?',
    a: 'Ja, du kannst Einkaufslisten als CSV oder PDF exportieren. Deine Rezepte und Pläne gehören dir.',
  },
  {
    q: 'Welche Sprachen werden unterstützt?',
    a: 'MacroMate ist verfügbar in Deutsch und Englisch.',
  },
  {
    q: 'Kann ich das Abo jederzeit kündigen?',
    a: 'Absolut. Du kannst dein Abo jederzeit kündigen. Deine Daten bleiben erhalten und du kannst jederzeit wieder upgraden.',
  },
  {
    q: 'Was ist ein Haushalt?',
    a: 'Du kannst einen Haushalt erstellen und Familienmitglieder oder Mitbewohner per Einladungscode einladen. So seht ihr alle Essenspläne und bekommt eine gemeinsame Einkaufsliste.',
  },
];

/* ── Component ──────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();
  const { mode, setMode } = useThemeStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 text-gray-900 dark:text-dark-100 overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-lg shadow-accent-500/20">
                <ChefHat size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-accent-600 to-accent-400 bg-clip-text text-transparent">
                MacroMate
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 dark:text-dark-400 hover:text-accent-500 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600 dark:text-dark-400 hover:text-accent-500 transition-colors">So geht's</a>
              <a href="#pricing" className="text-sm text-gray-600 dark:text-dark-400 hover:text-accent-500 transition-colors">Preise</a>
              <a href="#faq" className="text-sm text-gray-600 dark:text-dark-400 hover:text-accent-500 transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
              >
                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-gray-600 dark:text-dark-300 hover:text-accent-500 transition-colors">
                Anmelden
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                Kostenlos starten
              </Link>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800">
                {mobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-gray-100 dark:border-dark-800/50 bg-white dark:bg-dark-950 animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              <a href="#features" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-gray-600 dark:text-dark-400">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-gray-600 dark:text-dark-400">So geht's</a>
              <a href="#pricing" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-gray-600 dark:text-dark-400">Preise</a>
              <a href="#faq" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-gray-600 dark:text-dark-400">FAQ</a>
              <Link to="/login" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-accent-500 font-medium">Anmelden</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-500/5 dark:bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20 text-accent-600 dark:text-accent-400 text-sm font-medium mb-8">
            <Sparkles size={14} />
            Smart Meal Planning für alle
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Gesund essen.{' '}
            <span className="bg-gradient-to-r from-accent-600 to-accent-400 bg-clip-text text-transparent">
              Gemeinsam.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tausende einfache Rezepte, angepasst an dein Kalorienziel.
            Plane die perfekten Mahlzeiten für deinen Alltag — allein oder mit deiner Familie.{' '}
            <span className="text-gray-700 dark:text-dark-300 font-medium">
              Spare Zeit. Spare Geld. Erreiche deine Ziele.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-xl shadow-accent-500/20">
              Kostenlos starten
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-3.5">
              <Play size={18} />
              Mehr erfahren
            </a>
          </div>

          {/* Value Props Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 pt-8 border-t border-gray-100 dark:border-dark-800/30 text-sm text-gray-500 dark:text-dark-400">
            <span className="flex items-center gap-2">
              <Check size={16} className="text-accent-500" />
              Kostenloser Start
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-accent-500" />
              Keine Kreditkarte nötig
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-accent-500" />
              Jederzeit kündbar
            </span>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <div className="flex -space-x-2">
              {['🧑‍🍳', '👨‍💻', '🏋️‍♀️', '👩‍⚕️', '🧑‍🎓'].map((emoji, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-800 border-2 border-white dark:border-dark-950 flex items-center justify-center text-lg">
                  {emoji}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-400">
              <div className="flex items-center gap-1 mb-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="font-semibold text-gray-900 dark:text-white ml-1">4.9/5</span>
              </div>
              Vertraut von <span className="font-semibold text-gray-900 dark:text-white">500+</span> Meal Preppern
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlight Strip ── */}
      <section className="py-6 bg-accent-500/5 dark:bg-accent-500/5 border-y border-accent-500/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: <Target size={20} />, label: 'Kalorien & Makros tracken' },
              { icon: <Calendar size={20} />, label: 'Automatische Meal Plans' },
              { icon: <ShoppingCart size={20} />, label: 'Einkaufslisten auf Knopfdruck' },
              { icon: <Users size={20} />, label: 'Gemeinsam als Familie planen' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center text-sm font-medium text-gray-700 dark:text-dark-300">
                <span className="text-accent-500">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 sm:py-28 px-4 bg-gray-50/50 dark:bg-dark-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent-500 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Alles an einem Ort.{' '}
              <span className="text-accent-500">Alles für dich.</span>
            </h2>
            <p className="text-gray-500 dark:text-dark-400 max-w-2xl mx-auto">
              Von der Rezeptverwaltung bis zur intelligenten Planung — MacroMate kümmert sich um alles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-dark-800/50 hover:border-accent-500/20 dark:hover:border-accent-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/5 hover:-translate-y-0.5"
              >
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center mb-4', feature.bg, feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Aktive Nutzer', icon: <Users size={20} /> },
              { value: '10K+', label: 'Rezepte erstellt', icon: <BookOpen size={20} /> },
              { value: '50K+', label: 'Meal Plans', icon: <Calendar size={20} /> },
              { value: '4.9★', label: 'Bewertung', icon: <Star size={20} /> },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 mx-auto mb-3">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-dark-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 bg-gray-50/50 dark:bg-dark-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent-500 uppercase tracking-wider">So funktioniert's</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              Plane die perfekten Mahlzeiten —{' '}
              <span className="text-accent-500">in 3 Schritten</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Profil einrichten',
                desc: 'Gib deine Körperdaten und Ziele ein. MacroMate errechnet deinen persönlichen Kalorienbedarf für dich.',
                icon: <Target size={28} />,
              },
              {
                step: '02',
                title: 'Rezepte hinzufügen',
                desc: 'Erstelle eigene Rezepte oder suche Zutaten über OpenFoodFacts. Nährwerte werden automatisch geladen.',
                icon: <ChefHat size={28} />,
              },
              {
                step: '03',
                title: 'Plan generieren',
                desc: 'Ein Klick und MacroMate erstellt dir den optimalen Tagesplan inkl. Einkaufsliste. Teile ihn mit deiner Familie.',
                icon: <Zap size={28} />,
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent-500/30 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center text-accent-500 mx-auto mb-4">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-accent-500 uppercase tracking-wider">{item.step}</span>
                <h3 className="text-xl font-bold mt-2 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Family / Household Highlight ── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-accent-500 uppercase tracking-wider">Für Familien & WGs</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6">
                Gesund essen. <span className="text-accent-500">Zusammen.</span>
              </h2>
              <p className="text-gray-500 dark:text-dark-400 leading-relaxed mb-8">
                Mit dem Haushalt-Feature plant ihr eure Mahlzeiten als Familie oder WG.
                Jeder hat individuelle Makroziele, aber die Einkaufsliste ist gemeinsam.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: <Users size={18} />, title: 'Bis zu 5 Mitglieder', desc: 'Lade deine Familie per Einladungscode ein.' },
                  { icon: <Calendar size={18} />, title: 'Gemeinsame Planung', desc: 'Seht alle Essenspläne des Haushalts auf einen Blick.' },
                  { icon: <ShoppingCart size={18} />, title: 'Eine Einkaufsliste für alle', desc: 'Automatisch zusammengefasst aus allen Plänen.' },
                  { icon: <Shield size={18} />, title: 'Sicher & privat', desc: 'Einladungscodes laufen nach 48h ab. Admins verwalten Mitglieder.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-dark-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-accent-500/10 via-purple-500/5 to-blue-500/10 border border-accent-500/10 dark:border-accent-500/20 p-8 sm:p-10">
                {/* Mock household card */}
                <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Familie Müller</h4>
                      <p className="text-xs text-gray-400">4/5 Mitglieder</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['Max', 'Lisa', 'Tom', 'Julia'].map((name, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-dark-800/50">
                        <div className="w-7 h-7 rounded-lg bg-accent-500/15 flex items-center justify-center text-accent-500 text-xs font-bold">
                          {name[0]}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-dark-300">{name}</span>
                        {i === 0 && <span className="text-[9px] bg-accent-500/15 text-accent-500 px-1.5 py-0.5 rounded-full ml-auto">Admin</span>}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-500/5 border border-accent-500/10">
                    <code className="text-accent-500 font-mono text-sm font-bold tracking-widest">A7X-KP2</code>
                    <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                      <Clock size={10} /> Gültig bis 18. Jul
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-20 sm:py-28 px-4 bg-gray-50/50 dark:bg-dark-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent-500 uppercase tracking-wider">Preise</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Starte kostenlos, upgrade wenn du bereit bist
            </h2>
            <p className="text-gray-500 dark:text-dark-400 max-w-2xl mx-auto">
              Kein Risiko. Kein Kreditkarten-Zwang. Jederzeit kündbar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={clsx(
                  'relative rounded-2xl p-6 lg:p-8 bg-white dark:bg-dark-900/60 border-2 transition-all',
                  plan.popular ? 'border-accent-500 shadow-xl shadow-accent-500/10 scale-[1.02]' : plan.color,
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-accent-600 to-accent-400 text-white text-xs font-bold shadow-lg">
                    Beliebteste Wahl
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">{plan.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  {plan.price !== '0' && <span className="text-sm text-gray-500">€</span>}
                  <span className="text-4xl font-extrabold">{plan.price === '0' ? 'Gratis' : plan.price}</span>
                  {plan.price !== '0' && <span className="text-sm text-gray-500 dark:text-dark-400">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm">
                      <Check size={16} className={clsx('mt-0.5 flex-shrink-0', plan.popular ? 'text-accent-500' : 'text-gray-400 dark:text-dark-500')} />
                      <span className="text-gray-600 dark:text-dark-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={clsx(
                    'w-full py-3 rounded-xl font-semibold text-sm transition-all',
                    plan.popular
                      ? 'btn-primary'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-200 hover:bg-gray-200 dark:hover:bg-dark-700',
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent-500 uppercase tracking-wider">Bewertungen</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Was unsere Nutzer sagen</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-dark-800/50">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-300 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-500 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 sm:py-28 px-4 bg-gray-50/50 dark:bg-dark-900/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent-500 uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Häufige Fragen</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 dark:border-dark-800/50 bg-white dark:bg-dark-900/60 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-semibold pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={clsx(
                      'text-gray-400 dark:text-dark-500 transition-transform duration-200 flex-shrink-0',
                      openFaq === i && 'rotate-180',
                    )}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1 animate-fade-in">
                    <p className="text-sm text-gray-500 dark:text-dark-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-accent-600 via-accent-500 to-accent-400 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Bereit, gesünder zu essen?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Starte jetzt kostenlos und erlebe, wie einfach Meal Planning sein kann — allein oder als Familie.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-accent-700 font-bold rounded-xl shadow-xl shadow-black/10 hover:bg-gray-50 transition-all active:scale-[0.97]"
              >
                Jetzt kostenlos starten
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-dark-800/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                  <ChefHat size={16} className="text-white" />
                </div>
                <span className="font-bold text-lg">MacroMate</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-dark-400">
                Dein smarter Meal Prep Planner — für dich und deine Familie.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Produkt</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-dark-400">
                <li><a href="#features" className="hover:text-accent-500 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-accent-500 transition-colors">Preise</a></li>
                <li><a href="#faq" className="hover:text-accent-500 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-dark-400">
                <li><a href="#" className="hover:text-accent-500 transition-colors">Impressum</a></li>
                <li><a href="#" className="hover:text-accent-500 transition-colors">Datenschutz</a></li>
                <li><a href="#" className="hover:text-accent-500 transition-colors">AGB</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-dark-400">
                <li><a href="mailto:support@macromate.app" className="hover:text-accent-500 transition-colors">Kontakt</a></li>
                <li><a href="#" className="hover:text-accent-500 transition-colors">Hilfe-Center</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 dark:border-dark-800/50 text-center text-sm text-gray-400 dark:text-dark-500">
            © {new Date().getFullYear()} MacroMate. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
