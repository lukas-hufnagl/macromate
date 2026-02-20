/**
 * MacroMate – Recipes Page
 * Vollständige Rezeptverwaltung mit Filter, Suche, CRUD, Import & Upload.
 */

import { useEffect, useState } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import { useI18nStore } from '../stores/i18nStore';
import { useConfirm } from '../components/ConfirmDialog';
import RecipeCard from '../components/RecipeCard';
import RecipeForm from '../components/RecipeForm';
import RecipeUploadModal from '../components/RecipeUploadModal';
import type { Recipe, RecipeCreate, RecipeUpdate } from '../types';
import { CATEGORY_OPTIONS, MEAL_TYPE_OPTIONS } from '../types';
import { Plus, Search, Filter, BookOpen, Loader2, Upload, SlidersHorizontal, X as XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function RecipesPage() {
  const { recipes, isLoading, fetchRecipes, createRecipe, updateRecipe, deleteRecipe } =
    useRecipeStore();
  const t = useI18nStore((s) => s.t);
  const { confirm } = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMacroFilter, setShowMacroFilter] = useState(false);
  const [macroFilters, setMacroFilters] = useState({
    minProtein: '',
    maxCalories: '',
    minCalories: '',
    maxProtein: '',
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Gefilterte Rezepte (Client-Side für sofortiges Feedback)
  const filtered = recipes.filter((r) => {
    const matchSearch =
      !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      !categoryFilter || r.category === categoryFilter;
    const matchMealType =
      !mealTypeFilter || r.meal_type === mealTypeFilter;
    const matchMinProtein =
      !macroFilters.minProtein || r.protein >= Number(macroFilters.minProtein);
    const matchMaxCalories =
      !macroFilters.maxCalories || r.calories <= Number(macroFilters.maxCalories);
    const matchMinCalories =
      !macroFilters.minCalories || r.calories >= Number(macroFilters.minCalories);
    const matchMaxProtein =
      !macroFilters.maxProtein || r.protein <= Number(macroFilters.maxProtein);
    return matchSearch && matchCategory && matchMealType && matchMinProtein && matchMaxCalories && matchMinCalories && matchMaxProtein;
  });

  const handleSubmit = async (data: RecipeCreate | RecipeUpdate) => {
    setIsSubmitting(true);
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, data);
        toast.success('Rezept aktualisiert! ✏️');
      } else {
        await createRecipe(data as RecipeCreate);
        toast.success('Rezept erstellt! 🎉');
      }
      setShowForm(false);
      setEditingRecipe(null);
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDelete = async (recipe: Recipe) => {
    const ok = await confirm({
      title: t('confirm.delete'),
      message: `"${recipe.name}" ${t('confirm.deleteMessage')}`,
      variant: 'danger',
    });
    if (ok) {
      await deleteRecipe(recipe.id);
      toast.success(t('recipes.delete') + ' ✓');
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  const activeMacroFilters = Object.values(macroFilters).filter(Boolean).length;
  const activeFilters = [categoryFilter, mealTypeFilter].filter(Boolean).length + activeMacroFilters;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BookOpen size={24} className="text-accent-400 sm:w-7 sm:h-7" />
              {t('recipes.title')}
            </h1>
            <p className="text-gray-500 dark:text-dark-400 mt-1 text-sm">
              {recipes.length} {recipes.length === 1 ? 'Rezept' : t('nav.recipes')}
            </p>
          </div>
          {/* Primary action always visible */}
          <button
            onClick={() => {
              setEditingRecipe(null);
              setShowForm(true);
            }}
            className="btn-primary text-sm sm:text-base"
            id="tour-add-recipe"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('recipes.addRecipe')}</span>
          </button>
        </div>
        {/* Secondary actions row */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowUpload(true)} className="btn-secondary text-sm flex-1 sm:flex-none">
            <Upload size={16} />
            <span className="hidden xs:inline">{t('recipes.uploadImage')}</span>
            <span className="xs:hidden">Upload</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500"
            />
            <input
              type="text"
              className="input pl-11"
              placeholder="Rezept suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="select w-full sm:w-44"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Alle Kategorien</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Meal Type Filter */}
          <select
            className="select w-full sm:w-44"
            value={mealTypeFilter}
            onChange={(e) => setMealTypeFilter(e.target.value)}
          >
            <option value="">Alle Typen</option>
            {MEAL_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Active Filter Count */}
          {activeFilters > 0 && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setMealTypeFilter('');
                setSearch('');
                setMacroFilters({ minProtein: '', maxCalories: '', minCalories: '', maxProtein: '' });
                setShowMacroFilter(false);
              }}
              className="btn-ghost text-sm text-accent-400 whitespace-nowrap"
            >
              <Filter size={14} />
              Filter löschen ({activeFilters})
            </button>
          )}

          {/* Macro Filter Toggle */}
          <button
            onClick={() => setShowMacroFilter(!showMacroFilter)}
            className={clsx(
              'btn-secondary text-sm whitespace-nowrap',
              showMacroFilter && 'ring-2 ring-accent-500/30'
            )}
          >
            <SlidersHorizontal size={14} />
            Makros
            {activeMacroFilters > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center">{activeMacroFilters}</span>
            )}
          </button>
        </div>

        {/* Macro Filter Panel */}
        {showMacroFilter && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-800/30 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-dark-300 flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-accent-400" />
                Makronährstoff-Filter
              </h4>
              {activeMacroFilters > 0 && (
                <button
                  onClick={() => setMacroFilters({ minProtein: '', maxCalories: '', minCalories: '', maxProtein: '' })}
                  className="text-xs text-gray-400 hover:text-accent-400 transition-colors"
                >
                  Zurücksetzen
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-dark-400 mb-1 block">Min. Protein (g)</label>
                <input
                  type="number"
                  className="input text-center text-sm"
                  placeholder="z.B. 30"
                  min={0}
                  value={macroFilters.minProtein}
                  onChange={(e) => setMacroFilters(prev => ({ ...prev, minProtein: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-dark-400 mb-1 block">Max. Protein (g)</label>
                <input
                  type="number"
                  className="input text-center text-sm"
                  placeholder="z.B. 50"
                  min={0}
                  value={macroFilters.maxProtein}
                  onChange={(e) => setMacroFilters(prev => ({ ...prev, maxProtein: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-dark-400 mb-1 block">Min. Kalorien</label>
                <input
                  type="number"
                  className="input text-center text-sm"
                  placeholder="z.B. 200"
                  min={0}
                  value={macroFilters.minCalories}
                  onChange={(e) => setMacroFilters(prev => ({ ...prev, minCalories: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-dark-400 mb-1 block">Max. Kalorien</label>
                <input
                  type="number"
                  className="input text-center text-sm"
                  placeholder="z.B. 500"
                  min={0}
                  value={macroFilters.maxCalories}
                  onChange={(e) => setMacroFilters(prev => ({ ...prev, maxCalories: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipes Grid */}
      {isLoading && recipes.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-400" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe, index) => (
            <div
              key={recipe.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RecipeCard
                recipe={recipe}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 sm:p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-800/50 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-gray-400 dark:text-dark-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-dark-300 mb-2">
            {search || categoryFilter || mealTypeFilter
              ? 'Keine Rezepte gefunden'
              : t('recipes.noRecipes')}
          </h3>
          <p className="text-gray-400 dark:text-dark-500 mb-6">
            {search || categoryFilter || mealTypeFilter
              ? 'Passe deine Filter an oder erstelle ein neues Rezept.'
              : 'Erstelle dein erstes Rezept, um mit dem Meal Prepping zu starten!'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            {t('recipes.addRecipe')}
          </button>
        </div>
      )}

      {/* Recipe Form Modal */}
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={handleSubmit}
          onClose={handleClose}
          isLoading={isSubmitting}
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <RecipeUploadModal
          onImport={(data) => createRecipe(data)}
          onClose={() => setShowUpload(false)}
        />
      )}

    </div>
  );
}
