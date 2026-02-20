/**
 * RecipeUploadModal – KI-gestützte Rezepterkennung aus Bildern
 * Nutzt Google Gemini Vision API über das Backend für:
 * - Gericht erkennen
 * - Zutaten + Nährwerte automatisch ermitteln
 * - Kochanleitung generieren
 * User kann danach alles bearbeiten.
 */
import { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, FileText, Loader2, Sparkles, Zap, Check, AlertTriangle, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18nStore } from '../stores/i18nStore';
import toast from 'react-hot-toast';
import type { RecipeCreate, IngredientCreate } from '../types';
import { recognitionAPI } from '../services/api';
import IngredientAutocomplete from './IngredientAutocomplete';
import clsx from 'clsx';

interface Props {
  onImport: (recipe: RecipeCreate) => void;
  onClose: () => void;
}

export default function RecipeUploadModal({ onImport, onClose }: Props) {
  const t = useI18nStore((s) => s.t);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<RecipeCreate | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [fileName, setFileName] = useState('');
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [showEditSection, setShowEditSection] = useState(false);
  const [editData, setEditData] = useState<RecipeCreate | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Check AI availability on mount
  useEffect(() => {
    recognitionAPI.getStatus()
      .then((s) => setAiAvailable(s.available))
      .catch(() => setAiAvailable(false));
  }, []);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setParsed(null);
    setEditData(null);
    setShowEditSection(false);

    if (file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setTextContent('');
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await file.text();
      setTextContent(text);
      setPreview(null);
      setImageFile(null);
    } else {
      toast.error('Nur Bilder (.jpg, .png, .webp) oder Textdateien (.txt, .md) werden unterstützt');
      return;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const parseTextRecipe = async (): Promise<RecipeCreate> => {
    const lines = textContent.split('\n').filter((l) => l.trim());
    const name = lines[0]?.replace(/^#\s*/, '').trim() || 'Importiertes Rezept';

    const ingredients: IngredientCreate[] = [];
    let inIngredients = false;
    let inInstructions = false;
    let description = '';
    let instructions = '';

    for (const line of lines.slice(1)) {
      const lower = line.toLowerCase().trim();
      if (lower.includes('zutat') || lower.includes('ingredient') || lower === '---') {
        inIngredients = true;
        inInstructions = false;
        continue;
      }
      if (lower.includes('zubereitung') || lower.includes('instruction') || lower.includes('anleitung') || lower.includes('steps') || lower.includes('schritte')) {
        inIngredients = false;
        inInstructions = true;
        continue;
      }

      if (inIngredients) {
        const cleaned = line.replace(/^[-*•]\s*/, '').trim();
        const match = cleaned.match(/^([\d.,/]+)\s*(g|ml|Stück|EL|TL|kg|l|Prise|Tasse|Dose|Bund)?\s+(.+)/i);
        if (match) {
          let qty = parseFloat(match[1].replace(',', '.'));
          if (isNaN(qty)) qty = 1;
          ingredients.push({ name: match[3].trim(), quantity: qty, unit: match[2] || 'Stück' });
        } else if (cleaned) {
          ingredients.push({ name: cleaned, quantity: 1, unit: 'Stück' });
        }
      } else if (inInstructions) {
        instructions += line.trim() + '\n';
      } else if (!inIngredients && line.trim() && !line.startsWith('#')) {
        description += line.trim() + ' ';
      }
    }

    return {
      name,
      description: description.trim().slice(0, 500),
      instructions: instructions.trim(),
      category: 'vegetarisch',
      meal_type: 'hauptgericht',
      servings: 4,
      calories: 350,
      protein: 20,
      fat: 12,
      carbs: 40,
      ingredients: ingredients.length > 0 ? ingredients : [{ name: 'Zutat eintragen', quantity: 1, unit: 'Stück' }],
    };
  };

  const recognizeRecipe = async () => {
    setParsing(true);

    try {
      if (imageFile && aiAvailable) {
        // 🤖 KI-Erkennung via Backend → Gemini Vision
        const result = await recognitionAPI.recognizeImage(imageFile);
        const conf = (result as any).confidence || 0.8;
        setConfidence(conf);

        const recipe: RecipeCreate = {
          name: result.name,
          description: result.description,
          instructions: result.instructions || '',
          category: result.category as any,
          meal_type: result.meal_type as any,
          servings: result.servings || 2,
          calories: result.calories,
          protein: result.protein,
          fat: result.fat,
          carbs: result.carbs,
          ingredients: result.ingredients || [],
        };

        setParsed(recipe);
        setEditData({ ...recipe });
        toast.success(`🤖 Gericht erkannt: "${recipe.name}" (${Math.round(conf * 100)}% sicher)`);
      } else if (imageFile && !aiAvailable) {
        // Fallback: Template erstellen
        const recipe: RecipeCreate = {
          name: fileName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          description: 'Aus Bild importiert – bitte Werte anpassen',
          instructions: '',
          category: 'vegetarisch',
          meal_type: 'hauptgericht',
          servings: 2,
          calories: 400,
          protein: 25,
          fat: 15,
          carbs: 45,
          ingredients: [{ name: 'Zutat eintragen', quantity: 1, unit: 'Stück' }],
        };
        setParsed(recipe);
        setEditData({ ...recipe });
        setShowEditSection(true);
        toast('📝 KI nicht verfügbar – Vorlage erstellt zum Bearbeiten', { icon: '⚠️' });
      } else if (textContent) {
        const recipe = await parseTextRecipe();
        setParsed(recipe);
        setEditData({ ...recipe });
        setConfidence(0.6);
        toast.success('📄 Textdatei erfolgreich geparst!');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error.message || 'Erkennung fehlgeschlagen';
      toast.error(`❌ ${msg}`);
      console.error('Recognition error:', error);
    }

    setParsing(false);
  };

  const handleImport = () => {
    const data = editData || parsed;
    if (data) {
      onImport(data);
      toast.success(`"${data.name}" importiert! 🎉`);
      onClose();
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const newIngredients = [...(prev.ingredients || [])];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      return { ...prev, ingredients: newIngredients };
    });
  };

  const addIngredient = () => {
    setEditData((prev) => {
      if (!prev) return prev;
      return { ...prev, ingredients: [...(prev.ingredients || []), { name: '', quantity: 1, unit: 'g' }] };
    });
  };

  const removeIngredient = (index: number) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const newIngredients = (prev.ingredients || []).filter((_, i) => i !== index);
      return { ...prev, ingredients: newIngredients };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-2xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            {aiAvailable ? (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
            ) : (
              <Upload size={20} className="text-accent" />
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {aiAvailable ? 'KI-Rezepterkennung' : t('recipes.uploadImage')}
              </h2>
              {aiAvailable && (
                <p className="text-xs text-gray-500 dark:text-dark-400">Powered by Google Gemini Vision</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* AI Status Badge */}
          {aiAvailable !== null && (
            <div className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium',
              aiAvailable
                ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
            )}>
              {aiAvailable ? (
                <>
                  <Zap size={12} />
                  KI-Erkennung aktiv – Bild hochladen und Rezept automatisch erkennen
                </>
              ) : (
                <>
                  <AlertTriangle size={12} />
                  KI nicht konfiguriert – Textdateien werden geparst, Bilder als Vorlage erstellt
                </>
              )}
            </div>
          )}

          {/* Drop Zone */}
          {!preview && !textContent && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                aiAvailable
                  ? 'border-purple-300 dark:border-purple-500/30 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-500/5'
                  : 'border-gray-300 dark:border-dark-600 hover:border-accent'
              )}
            >
              {aiAvailable ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mx-auto mb-3">
                    <Camera size={32} className="text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-200">
                    📸 Foto von deinem Essen hochladen
                  </p>
                  <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
                    JPEG, PNG, WebP · Die KI erkennt Gericht, Zutaten & Nährwerte
                  </p>
                  <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
                    Oder Textdatei (.txt, .md) per Drag & Drop
                  </p>
                </>
              ) : (
                <>
                  <Camera size={40} className="mx-auto mb-3 text-gray-400 dark:text-dark-500" />
                  <p className="text-sm text-gray-500 dark:text-dark-400">
                    Textdatei (.txt, .md) oder Bild hierher ziehen
                  </p>
                  <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
                    Textdateien werden automatisch geparst
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,.txt,.md"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* Image Preview */}
          {preview && (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              {aiAvailable && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs flex items-center gap-1">
                  <Sparkles size={10} />
                  KI-Erkennung bereit
                </div>
              )}
              <button
                onClick={() => { setPreview(null); setFileName(''); setParsed(null); setEditData(null); setImageFile(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Text Preview */}
          {textContent && (
            <div className="relative">
              <div className="bg-gray-50 dark:bg-dark-900 rounded-xl p-4 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-accent" />
                  <span className="text-xs font-medium text-gray-500 dark:text-dark-400">{fileName}</span>
                </div>
                <pre className="text-xs text-gray-600 dark:text-dark-300 whitespace-pre-wrap">{textContent.slice(0, 500)}</pre>
              </div>
              <button
                onClick={() => { setTextContent(''); setFileName(''); setParsed(null); setEditData(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Recognize Button */}
          {(preview || textContent) && !parsed && (
            <button
              onClick={recognizeRecipe}
              disabled={parsing}
              className={clsx(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all',
                parsing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : aiAvailable && imageFile
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/20'
                    : 'bg-accent-500 hover:bg-accent-600'
              )}
            >
              {parsing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {aiAvailable && imageFile ? 'KI analysiert Bild...' : 'Rezept wird erkannt...'}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {aiAvailable && imageFile ? '🤖 Mit KI erkennen' : 'Rezept erkennen'}
                </>
              )}
            </button>
          )}

          {/* Recognized Result */}
          {parsed && editData && (
            <div className="space-y-3">
              {/* Confidence Badge */}
              {confidence > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all duration-1000', {
                        'bg-green-500': confidence >= 0.8,
                        'bg-amber-500': confidence >= 0.5 && confidence < 0.8,
                        'bg-red-500': confidence < 0.5,
                      })}
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <span className={clsx('text-xs font-bold', {
                    'text-green-600 dark:text-green-400': confidence >= 0.8,
                    'text-amber-600 dark:text-amber-400': confidence >= 0.5 && confidence < 0.8,
                    'text-red-600 dark:text-red-400': confidence < 0.5,
                  })}>
                    {Math.round(confidence * 100)}% sicher
                  </span>
                </div>
              )}

              {/* Result Card */}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">{editData.name}</h3>
                <p className="text-xs text-gray-500 dark:text-dark-400 mb-3">{editData.description}</p>

                {/* Macros */}
                <div className="flex gap-2 flex-wrap text-xs">
                  <span className="px-2 py-1 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-semibold">
                    🔥 {editData.calories} kcal
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-semibold">
                    💪 {editData.protein}g Protein
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-semibold">
                    🧈 {editData.fat}g Fett
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold">
                    🌾 {editData.carbs}g Carbs
                  </span>
                </div>

                {/* Ingredients Preview */}
                {editData.ingredients && editData.ingredients.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-600 dark:text-dark-300">Zutaten ({editData.ingredients.length}):</p>
                    {editData.ingredients.slice(0, 5).map((ing, i) => (
                      <p key={i} className="text-xs text-gray-500 dark:text-dark-400">
                        • {ing.quantity} {ing.unit} {ing.name}
                      </p>
                    ))}
                    {editData.ingredients.length > 5 && (
                      <p className="text-xs text-gray-400">... +{editData.ingredients.length - 5} weitere</p>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Toggle */}
              <button
                onClick={() => setShowEditSection(!showEditSection)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 dark:text-dark-400 hover:text-accent transition-colors"
              >
                <Pencil size={14} />
                Werte anpassen
                {showEditSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Edit Section */}
              {showEditSection && (
                <div className="space-y-3 animate-fade-in">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-dark-300">Name</label>
                    <input
                      type="text"
                      className="input mt-1"
                      value={editData.name}
                      onChange={(e) => updateEditField('name', e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-dark-300">Beschreibung</label>
                    <textarea
                      className="input mt-1"
                      rows={2}
                      value={editData.description}
                      onChange={(e) => updateEditField('description', e.target.value)}
                    />
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'calories', label: 'Kalorien (kcal)', icon: '🔥' },
                      { key: 'protein', label: 'Protein (g)', icon: '💪' },
                      { key: 'fat', label: 'Fett (g)', icon: '🧈' },
                      { key: 'carbs', label: 'Carbs (g)', icon: '🌾' },
                    ].map(({ key, label, icon }) => (
                      <div key={key}>
                        <label className="text-xs text-gray-500 dark:text-dark-400">{icon} {label}</label>
                        <input
                          type="number"
                          className="input mt-1 text-center"
                          value={(editData as any)[key]}
                          onChange={(e) => updateEditField(key, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Servings + Category + MealType */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-dark-400">Portionen</label>
                      <input
                        type="number"
                        className="input mt-1 text-center"
                        min={1}
                        value={editData.servings}
                        onChange={(e) => updateEditField('servings', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-dark-400">Kategorie</label>
                      <select
                        className="select mt-1 w-full"
                        value={editData.category}
                        onChange={(e) => updateEditField('category', e.target.value)}
                      >
                        <option value="vegan">🌱 Vegan</option>
                        <option value="vegetarisch">🥚 Veggie</option>
                        <option value="fleisch">🥩 Fleisch</option>
                        <option value="fisch">🐟 Fisch</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-dark-400">Mahlzeit</label>
                      <select
                        className="select mt-1 w-full"
                        value={editData.meal_type}
                        onChange={(e) => updateEditField('meal_type', e.target.value)}
                      >
                        <option value="frühstück">🌅 Morgens</option>
                        <option value="hauptgericht">🍽️ Haupt</option>
                        <option value="snack">🍎 Snack</option>
                        <option value="dessert">🍰 Dessert</option>
                      </select>
                    </div>
                  </div>

                  {/* Ingredients Edit */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600 dark:text-dark-300">Zutaten</label>
                      <button onClick={addIngredient} className="text-xs text-accent hover:underline">+ Zutat</button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {editData.ingredients?.map((ing, i) => (
                        <div key={i} className="flex gap-1 items-center">
                          <input
                            type="number"
                            className="input w-16 text-center text-xs px-1"
                            value={ing.quantity}
                            onChange={(e) => updateIngredient(i, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                          <input
                            type="text"
                            className="input w-14 text-center text-xs px-1"
                            value={ing.unit}
                            onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                          />
                          <IngredientAutocomplete
                            value={ing.name}
                            onChange={(name) => updateIngredient(i, 'name', name)}
                            onSelect={(suggestion) => updateIngredient(i, 'name', suggestion.name)}
                            placeholder="Zutat suchen..."
                            className="text-xs"
                          />
                          <button
                            onClick={() => removeIngredient(i)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-dark-300">Anleitung</label>
                    <textarea
                      className="input mt-1 text-xs"
                      rows={4}
                      value={editData.instructions}
                      onChange={(e) => updateEditField('instructions', e.target.value)}
                      placeholder="Schritt-für-Schritt Anleitung..."
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 btn-secondary">
                  {t('recipes.cancel')}
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-500/20"
                >
                  <Check size={16} />
                  Rezept speichern
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
