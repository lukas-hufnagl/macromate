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
import type { Recipe, RecipeCreate, RecipeUpdate } from '../types';
import { CATEGORY_OPTIONS, MEAL_TYPE_OPTIONS } from '../types';
import { recipesAPI } from '../services/api';
import CustomSelect from '../components/CustomSelect';
import { Plus, Search, Filter, BookOpen, Loader2, SlidersHorizontal, X as XIcon, Sparkles, Download, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function RecipesPage() {
  const { recipes, isLoading, fetchRecipes, createRecipe, updateRecipe, deleteRecipe } =
    useRecipeStore();
  const t = useI18nStore((s) => s.t);
  const { confirm } = useConfirm();

  const [showForm, setShowForm] = useState(false);
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
  const [activeTab, setActiveTab] = useState<'mine' | 'discover'>('mine');
  const [discoverRecipes, setDiscoverRecipes] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [addingRecipe, setAddingRecipe] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Discover-Rezepte laden
  useEffect(() => {
    if (activeTab === 'discover') {
      setDiscoverLoading(true);
      recipesAPI.discover()
        .then(setDiscoverRecipes)
        .catch(() => toast.error('Entdecker-Rezepte konnten nicht geladen werden'))
        .finally(() => setDiscoverLoading(false));
    }
  }, [activeTab]);

  const handleAddDiscover = async (recipe: any) => {
    setAddingRecipe(recipe.name);
    try {
      await createRecipe({
        name: recipe.name,
        description: recipe.description || '',
        instructions: recipe.instructions || '',
        category: recipe.category || 'sonstiges',
        meal_type: recipe.meal_type || 'snack',
        calories: recipe.calories,
        protein: recipe.protein,
        fat: recipe.fat,
        carbs: recipe.carbs,
        servings: recipe.servings || 1,
        ingredients: recipe.ingredients || [],
      });
      toast.success(`"${recipe.name}" zu deinem Kochbuch hinzugefügt! 📖`);
    } catch {
      toast.error('Rezept konnte nicht hinzugefügt werden');
    } finally {
      setAddingRecipe(null);
    }
  };

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
          {activeTab === 'mine' && (
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
          )}
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-dark-800/50 w-fit">
          <button
            onClick={() => setActiveTab('mine')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === 'mine'
                ? 'bg-white dark:bg-dark-700 text-accent-600 dark:text-accent-400 shadow-sm'
                : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
            )}
          >
            <BookOpen size={16} />
            Meine Rezepte
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === 'discover'
                ? 'bg-white dark:bg-dark-700 text-accent-600 dark:text-accent-400 shadow-sm'
                : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
            )}
          >
            <Sparkles size={16} />
            Entdecken
          </button>
        </div>
      </div>

      {activeTab === 'mine' ? (
        <>
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
          <CustomSelect
            className="w-full sm:w-44"
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Alle Kategorien"
            options={[{ value: '', label: 'Alle Kategorien' }, ...CATEGORY_OPTIONS]}
          />

          {/* Meal Type Filter */}
          <CustomSelect
            className="w-full sm:w-44"
            value={mealTypeFilter}
            onChange={setMealTypeFilter}
            placeholder="Alle Typen"
            options={[{ value: '', label: 'Alle Typen' }, ...MEAL_TYPE_OPTIONS]}
          />

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filtered.map((recipe, index) => (
            <div
              key={recipe.id}
              className="animate-slide-up h-full"
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
        </>
      ) : (
        /* ── Discover Tab ── */
        discoverLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-accent-400" />
          </div>
        ) : discoverRecipes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-dark-400">
              {discoverRecipes.length} vordefinierte Rezepte – passend zu deinen Vorlieben
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoverRecipes.map((recipe, index) => {
                const alreadyAdded = recipes.some(r => r.name === recipe.name);
                return (
                  <div
                    key={recipe.name + index}
                    className="glass-card p-5 animate-slide-up group hover:shadow-lg hover:shadow-accent-500/5 transition-all duration-300"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-accent-500 transition-colors">
                          {recipe.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-medium">
                            {recipe.meal_type}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-dark-500">
                            {recipe.category}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
                        <ChefHat size={18} className="text-white" />
                      </div>
                    </div>

                    {recipe.description && (
                      <p className="text-sm text-gray-500 dark:text-dark-400 line-clamp-2 mb-3">
                        {recipe.description}
                      </p>
                    )}

                    {/* Macro Bar */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
                        <p className="text-xs text-gray-500 dark:text-dark-500">kcal</p>
                        <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{recipe.calories}</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <p className="text-xs text-gray-500 dark:text-dark-500">Protein</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{recipe.protein}g</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                        <p className="text-xs text-gray-500 dark:text-dark-500">Carbs</p>
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{recipe.carbs}g</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10">
                        <p className="text-xs text-gray-500 dark:text-dark-500">Fett</p>
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{recipe.fat}g</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddDiscover(recipe)}
                      disabled={addingRecipe === recipe.name || alreadyAdded}
                      className={clsx(
                        'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        alreadyAdded
                          ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 cursor-default'
                          : addingRecipe === recipe.name
                          ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-400 cursor-wait'
                          : 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-500/20 hover:shadow-md active:scale-[0.98]'
                      )}
                    >
                      {alreadyAdded ? (
                        <>✓ Bereits im Kochbuch</>
                      ) : addingRecipe === recipe.name ? (
                        <><Loader2 size={14} className="animate-spin" /> Wird hinzugefügt...</>
                      ) : (
                        <><Download size={14} /> Zum Kochbuch hinzufügen</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 sm:p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-800/50 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-gray-400 dark:text-dark-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-dark-300 mb-2">
              Keine passenden Rezepte
            </h3>
            <p className="text-gray-400 dark:text-dark-500">
              Passe deine Allergien und Ernährungsweise im Profil an, um passende Rezepte zu entdecken.
            </p>
          </div>
        )
      )}

    </div>
  );
}
