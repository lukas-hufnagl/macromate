import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Ruler, Activity, Target, ChevronRight, ChevronLeft, Flame, Check } from 'lucide-react';
import { profileAPI } from '../services/api';
import { useGoalStore } from '../stores/goalStore';
import { useAuthStore } from '../stores/authStore';
import type { Gender, ActivityLevel, FitnessGoal, TDEEResult } from '../types';

interface Props {
  onComplete: () => void;
}

const STEPS = ['Willkommen', 'Körperdaten', 'Aktivität', 'Ziel', 'Dein Plan'];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string; icon: string }[] = [
  { value: 'sedentary', label: 'Wenig aktiv', desc: 'Schreibtischjob, kaum Sport', icon: '🪑' },
  { value: 'light', label: 'Leicht aktiv', desc: '1–2x Sport pro Woche', icon: '🚶' },
  { value: 'moderate', label: 'Moderat aktiv', desc: '3–4x Sport pro Woche', icon: '🏃' },
  { value: 'active', label: 'Sehr aktiv', desc: '5–6x Sport pro Woche', icon: '💪' },
  { value: 'very_active', label: 'Extrem aktiv', desc: 'Täglich intensives Training', icon: '🏋️' },
];

const GOAL_OPTIONS: { value: FitnessGoal; label: string; desc: string; icon: string }[] = [
  { value: 'lose', label: 'Abnehmen', desc: 'Körperfett reduzieren', icon: '📉' },
  { value: 'maintain', label: 'Halten', desc: 'Gewicht und Form beibehalten', icon: '⚖️' },
  { value: 'gain', label: 'Aufbauen', desc: 'Muskelmasse aufbauen', icon: '📈' },
];

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState<number>(25);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(75);
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const [result, setResult] = useState<TDEEResult | null>(null);
  const [saving, setSaving] = useState(false);

  const setGoals = useGoalStore((s) => s.setGoals);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const canNext = () => {
    if (step === 1) return gender !== null && age > 0 && heightCm > 0 && weightKg > 0;
    if (step === 2) return activity !== null;
    if (step === 3) return goal !== null;
    return true;
  };

  const handleNext = async () => {
    if (step === 3 && gender && activity && goal) {
      try {
        const tdee = await profileAPI.previewTDEE({
          gender, age, height_cm: heightCm, weight_kg: weightKg,
          activity_level: activity, goal,
        });
        setResult(tdee);
      } catch { /* fallthrough */ }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        gender: gender!, age, height_cm: heightCm, weight_kg: weightKg,
        activity_level: activity!, goal: goal!,
      });
      if (result) {
        setGoals({
          calories: result.target_calories,
          protein: result.protein_g,
          fat: result.fat_g,
          carbs: result.carbs_g,
        });
      }
      await checkAuth();
      onComplete();
    } catch {
      setSaving(false);
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = async () => { setDirection(1); await handleNext(); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/95 backdrop-blur-xl">
      <div className="w-full max-w-lg mx-4">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-accent-500' : 'bg-dark-700'
            }`} />
          ))}
        </div>

        <div className="bg-dark-850 rounded-3xl p-8 border border-dark-700 min-h-[420px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {step === 0 && <StepWelcome />}
              {step === 1 && (
                <StepBody
                  gender={gender} setGender={setGender}
                  age={age} setAge={setAge}
                  heightCm={heightCm} setHeightCm={setHeightCm}
                  weightKg={weightKg} setWeightKg={setWeightKg}
                />
              )}
              {step === 2 && <StepActivity activity={activity} setActivity={setActivity} />}
              {step === 3 && <StepGoal goal={goal} setGoal={setGoal} />}
              {step === 4 && <StepResult result={result} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={goBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
                <ChevronLeft className="w-4 h-4" /> Zurück
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-600 disabled:opacity-60 transition-all"
              >
                {saving ? 'Speichert...' : 'Los geht\'s!'} <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepWelcome() {
  return (
    <div className="text-center space-y-6 pt-6">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-accent-500/20 flex items-center justify-center">
        <Flame className="w-10 h-10 text-accent-500" />
      </div>
      <h2 className="text-3xl font-bold text-white">Willkommen bei MacroMate</h2>
      <p className="text-gray-400 text-lg leading-relaxed max-w-sm mx-auto">
        In wenigen Schritten erstellen wir deinen persönlichen Ernährungsplan — genau auf dich zugeschnitten.
      </p>
    </div>
  );
}

function StepBody({ gender, setGender, age, setAge, heightCm, setHeightCm, weightKg, setWeightKg }: {
  gender: Gender | null; setGender: (g: Gender) => void;
  age: number; setAge: (n: number) => void;
  heightCm: number; setHeightCm: (n: number) => void;
  weightKg: number; setWeightKg: (n: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Ruler className="w-6 h-6 text-accent-500" />
        <h2 className="text-xl font-bold text-white">Körperdaten</h2>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Geschlecht</label>
        <div className="grid grid-cols-3 gap-3">
          {([['male', '♂ Männlich'], ['female', '♀ Weiblich'], ['other', '⚧ Divers']] as [Gender, string][]).map(([val, label]) => (
            <button key={val} onClick={() => setGender(val)}
              className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                gender === val ? 'bg-accent-500/20 border-accent-500 text-accent-400' : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-dark-500'
              }`}
            >{label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Alter</label>
          <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} min={14} max={99}
            className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-center focus:border-accent-500 focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Größe (cm)</label>
          <input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} min={100} max={250}
            className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-center focus:border-accent-500 focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Gewicht (kg)</label>
          <input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} min={30} max={300}
            className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-center focus:border-accent-500 focus:outline-none transition-colors" />
        </div>
      </div>
    </div>
  );
}

function StepActivity({ activity, setActivity }: {
  activity: ActivityLevel | null; setActivity: (a: ActivityLevel) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Activity className="w-6 h-6 text-accent-500" />
        <h2 className="text-xl font-bold text-white">Aktivitätslevel</h2>
      </div>

      <div className="space-y-3">
        {ACTIVITY_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setActivity(opt.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border ${
              activity === opt.value
                ? 'bg-accent-500/15 border-accent-500 text-white'
                : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-dark-500'
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <div>
              <p className="font-semibold text-sm">{opt.label}</p>
              <p className="text-xs opacity-70">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepGoal({ goal, setGoal }: {
  goal: FitnessGoal | null; setGoal: (g: FitnessGoal) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Target className="w-6 h-6 text-accent-500" />
        <h2 className="text-xl font-bold text-white">Dein Ziel</h2>
      </div>

      <div className="space-y-3">
        {GOAL_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setGoal(opt.value)}
            className={`w-full flex items-center gap-4 p-5 rounded-xl text-left transition-all border ${
              goal === opt.value
                ? 'bg-accent-500/15 border-accent-500 text-white'
                : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-dark-500'
            }`}
          >
            <span className="text-3xl">{opt.icon}</span>
            <div>
              <p className="font-bold">{opt.label}</p>
              <p className="text-sm opacity-70">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepResult({ result }: { result: TDEEResult | null }) {
  if (!result) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Berechnung läuft...</p>
      </div>
    );
  }

  const macros = [
    { label: 'Kalorien', value: result.target_calories, unit: 'kcal', color: 'text-accent-500' },
    { label: 'Protein', value: result.protein_g, unit: 'g', color: 'text-blue-400' },
    { label: 'Fett', value: result.fat_g, unit: 'g', color: 'text-yellow-400' },
    { label: 'Kohlenhydrate', value: result.carbs_g, unit: 'g', color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">Dein persönlicher Plan</h2>
        <p className="text-gray-400 text-sm">Basierend auf deinen Angaben</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {macros.map((m) => (
          <div key={m.label} className="bg-dark-800 rounded-2xl p-4 text-center border border-dark-600">
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500">{m.unit}</p>
            <p className="text-sm text-gray-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-600">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Grundumsatz (BMR)</span>
          <span className="text-white font-medium">{Math.round(result.bmr)} kcal</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-400">Gesamtumsatz (TDEE)</span>
          <span className="text-white font-medium">{Math.round(result.tdee)} kcal</span>
        </div>
      </div>

      <p className="text-center text-gray-500 text-xs">
        Du kannst diese Werte jederzeit in deinem Profil anpassen.
      </p>
    </div>
  );
}
