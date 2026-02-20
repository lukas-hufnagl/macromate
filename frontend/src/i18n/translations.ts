/**
 * MacroMate – i18n (Internationalization)
 * 
 * Unterstützte Sprachen: Deutsch (de), English (en), Español (es), Français (fr)
 * Translations werden lazy geladen, Sprache im localStorage gespeichert.
 */

export type Locale = 'de' | 'en' | 'es' | 'fr';

export const LOCALE_OPTIONS: { value: Locale; label: string; flag: string }[] = [
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
];

type TranslationKeys = {
  // Nav
  'nav.dashboard': string;
  'nav.recipes': string;
  'nav.mealPlanner': string;
  'nav.shoppingList': string;
  'nav.profile': string;
  'nav.logout': string;

  // Auth
  'auth.login': string;
  'auth.register': string;
  'auth.username': string;
  'auth.email': string;
  'auth.password': string;
  'auth.confirmPassword': string;
  'auth.loginTitle': string;
  'auth.registerTitle': string;
  'auth.noAccount': string;
  'auth.hasAccount': string;
  'auth.welcomeBack': string;
  'auth.createAccount': string;

  // Dashboard
  'dashboard.welcome': string;
  'dashboard.todaysPlan': string;
  'dashboard.quickStats': string;
  'dashboard.totalRecipes': string;
  'dashboard.mealPlans': string;
  'dashboard.avgCalories': string;
  'dashboard.recentRecipes': string;
  'dashboard.recommendations': string;
  'dashboard.basedOnYour': string;

  // Recipes
  'recipes.title': string;
  'recipes.addRecipe': string;
  'recipes.editRecipe': string;
  'recipes.searchPlaceholder': string;
  'recipes.allCategories': string;
  'recipes.allTypes': string;
  'recipes.noRecipes': string;
  'recipes.name': string;
  'recipes.description': string;
  'recipes.instructions': string;
  'recipes.instructionsPlaceholder': string;
  'recipes.category': string;
  'recipes.mealType': string;
  'recipes.servings': string;
  'recipes.calories': string;
  'recipes.protein': string;
  'recipes.fat': string;
  'recipes.carbs': string;
  'recipes.ingredients': string;
  'recipes.addIngredient': string;
  'recipes.save': string;
  'recipes.cancel': string;
  'recipes.delete': string;
  'recipes.edit': string;
  'recipes.uploadImage': string;
  'recipes.importFromApi': string;
  'recipes.perServing': string;
  'recipes.discover': string;
  'recipes.showDetails': string;
  'recipes.showLess': string;
  'recipes.preparation': string;

  // Macro Filter
  'macroFilter.title': string;
  'macroFilter.minProtein': string;
  'macroFilter.maxProtein': string;
  'macroFilter.minCalories': string;
  'macroFilter.maxCalories': string;
  'macroFilter.macros': string;
  'macroFilter.reset': string;

  // Meal Planner
  'mealPlanner.title': string;
  'mealPlanner.generate': string;
  'mealPlanner.macroGoals': string;
  'mealPlanner.dateRange': string;
  'mealPlanner.history': string;
  'mealPlanner.noPlan': string;
  'mealPlanner.breakfast': string;
  'mealPlanner.lunch': string;
  'mealPlanner.dinner': string;
  'mealPlanner.snack': string;
  'mealPlanner.dayView': string;
  'mealPlanner.weekView': string;
  'mealPlanner.thisWeek': string;
  'mealPlanner.noPlanForDay': string;
  'mealPlanner.generateForDay': string;
  'mealPlanner.weekSummary': string;
  'mealPlanner.planSubtitle': string;

  // Shopping List
  'shoppingList.title': string;
  'shoppingList.export': string;
  'shoppingList.exportPDF': string;
  'shoppingList.exportCSV': string;
  'shoppingList.progress': string;
  'shoppingList.allDone': string;
  'shoppingList.empty': string;

  // Profile
  'profile.title': string;
  'profile.settings': string;
  'profile.language': string;
  'profile.theme': string;
  'profile.themeDark': string;
  'profile.themeLight': string;
  'profile.themeSystem': string;
  'profile.account': string;
  'profile.memberSince': string;
  'profile.recipesCreated': string;
  'profile.plansGenerated': string;
  'profile.changePassword': string;

  // Premium
  'premium.title': string;
  'premium.comingSoon': string;
  'premium.subtitle': string;
  'premium.upgrade': string;

  // Confirm Dialog
  'confirm.delete': string;
  'confirm.deleteMessage': string;
  'confirm.yes': string;
  'confirm.no': string;
  'confirm.cancel': string;

  // General
  'general.loading': string;
  'general.error': string;
  'general.success': string;
  'general.save': string;
  'general.close': string;
  'general.search': string;
  'general.filter': string;
  'general.from': string;
  'general.to': string;
  'general.all': string;
  'general.add': string;
  'general.added': string;

  // Units
  'unit.g': string;
  'unit.ml': string;
  'unit.stk': string;
  'unit.el': string;
  'unit.tl': string;
  'unit.prise': string;
  'unit.scheibe': string;
  'unit.tasse': string;
  'unit.bund': string;
  'unit.dose': string;
  'unit.pkg': string;
  'unit.kg': string;
  'unit.l': string;
};

const de: TranslationKeys = {
  'nav.dashboard': 'Dashboard',
  'nav.recipes': 'Rezepte',
  'nav.mealPlanner': 'Essensplaner',
  'nav.shoppingList': 'Einkaufsliste',
  'nav.profile': 'Profil',
  'nav.logout': 'Abmelden',

  'auth.login': 'Anmelden',
  'auth.register': 'Registrieren',
  'auth.username': 'Benutzername',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort',
  'auth.confirmPassword': 'Passwort bestätigen',
  'auth.loginTitle': 'Willkommen zurück',
  'auth.registerTitle': 'Konto erstellen',
  'auth.noAccount': 'Noch kein Konto?',
  'auth.hasAccount': 'Bereits ein Konto?',
  'auth.welcomeBack': 'Schön, dich wieder zu sehen! 👋',
  'auth.createAccount': 'Starte deine Meal-Prep-Reise 🚀',

  'dashboard.welcome': 'Willkommen zurück',
  'dashboard.todaysPlan': 'Heutiger Plan',
  'dashboard.quickStats': 'Schnellübersicht',
  'dashboard.totalRecipes': 'Rezepte gesamt',
  'dashboard.mealPlans': 'Essenspläne',
  'dashboard.avgCalories': 'Ø Kalorien',
  'dashboard.recentRecipes': 'Neueste Rezepte',
  'dashboard.recommendations': 'Empfehlungen für dich',
  'dashboard.basedOnYour': 'Basierend auf deinen bisherigen Rezepten',

  'recipes.title': 'Meine Rezepte',
  'recipes.addRecipe': 'Rezept hinzufügen',
  'recipes.editRecipe': 'Rezept bearbeiten',
  'recipes.searchPlaceholder': 'Rezepte durchsuchen...',
  'recipes.allCategories': 'Alle Kategorien',
  'recipes.allTypes': 'Alle Typen',
  'recipes.noRecipes': 'Noch keine Rezepte. Erstelle dein erstes!',
  'recipes.name': 'Name',
  'recipes.description': 'Beschreibung',
  'recipes.instructions': 'Zubereitung / Anleitung',
  'recipes.instructionsPlaceholder': 'Schritt-für-Schritt Anleitung...',
  'recipes.category': 'Kategorie',
  'recipes.mealType': 'Mahlzeit',
  'recipes.servings': 'Portionen',
  'recipes.calories': 'Kalorien',
  'recipes.protein': 'Protein',
  'recipes.fat': 'Fett',
  'recipes.carbs': 'Kohlenhydrate',
  'recipes.ingredients': 'Zutaten',
  'recipes.addIngredient': 'Zutat hinzufügen',
  'recipes.save': 'Speichern',
  'recipes.cancel': 'Abbrechen',
  'recipes.delete': 'Löschen',
  'recipes.edit': 'Bearbeiten',
  'recipes.uploadImage': 'Bild/Datei hochladen',
  'recipes.importFromApi': 'Rezept importieren',
  'recipes.perServing': 'pro Portion',
  'recipes.discover': 'Rezepte entdecken',
  'recipes.showDetails': 'Details anzeigen',
  'recipes.showLess': 'Weniger anzeigen',
  'recipes.preparation': 'Zubereitung',

  'macroFilter.title': 'Makro-Filter',
  'macroFilter.minProtein': 'Min. Protein',
  'macroFilter.maxProtein': 'Max. Protein',
  'macroFilter.minCalories': 'Min. Kalorien',
  'macroFilter.maxCalories': 'Max. Kalorien',
  'macroFilter.macros': 'Makros',
  'macroFilter.reset': 'Filter zurücksetzen',

  'mealPlanner.title': 'Essensplaner',
  'mealPlanner.generate': 'Plan generieren',
  'mealPlanner.macroGoals': 'Makro-Ziele',
  'mealPlanner.dateRange': 'Zeitraum',
  'mealPlanner.history': 'Verlauf',
  'mealPlanner.noPlan': 'Kein Plan vorhanden',
  'mealPlanner.breakfast': 'Frühstück',
  'mealPlanner.lunch': 'Mittagessen',
  'mealPlanner.dinner': 'Abendessen',
  'mealPlanner.snack': 'Snack',
  'mealPlanner.dayView': 'Tagesansicht',
  'mealPlanner.weekView': 'Wochenansicht',
  'mealPlanner.thisWeek': 'Diese Woche',
  'mealPlanner.noPlanForDay': 'Kein Plan für diesen Tag',
  'mealPlanner.generateForDay': 'Plan generieren',
  'mealPlanner.weekSummary': 'Wochenübersicht',
  'mealPlanner.planSubtitle': 'Plane deine Mahlzeiten für die Woche',

  'shoppingList.title': 'Einkaufsliste',
  'shoppingList.export': 'Exportieren',
  'shoppingList.exportPDF': 'Als PDF exportieren',
  'shoppingList.exportCSV': 'Als CSV exportieren',
  'shoppingList.progress': 'Fortschritt',
  'shoppingList.allDone': 'Alles erledigt! 🎉',
  'shoppingList.empty': 'Keine Einträge',

  'profile.title': 'Mein Profil',
  'profile.settings': 'Einstellungen',
  'profile.language': 'Sprache',
  'profile.theme': 'Darstellung',
  'profile.themeDark': 'Dunkel',
  'profile.themeLight': 'Hell',
  'profile.themeSystem': 'System',
  'profile.account': 'Konto',
  'profile.memberSince': 'Mitglied seit',
  'profile.recipesCreated': 'Rezepte erstellt',
  'profile.plansGenerated': 'Pläne generiert',
  'profile.changePassword': 'Passwort ändern',

  'premium.title': 'MacroMate Premium',
  'premium.comingSoon': 'Demnächst verfügbar',
  'premium.subtitle': 'Schalte alle Features frei und erreiche deine Ziele schneller',
  'premium.upgrade': 'Mehr erfahren',

  'confirm.delete': 'Löschen bestätigen',
  'confirm.deleteMessage': 'Bist du sicher? Das kann nicht rückgängig gemacht werden.',
  'confirm.yes': 'Ja, löschen',
  'confirm.no': 'Nein',
  'confirm.cancel': 'Abbrechen',

  'general.loading': 'Laden...',
  'general.error': 'Fehler',
  'general.success': 'Erfolg',
  'general.save': 'Speichern',
  'general.close': 'Schließen',
  'general.search': 'Suchen',
  'general.filter': 'Filtern',
  'general.from': 'Von',
  'general.to': 'Bis',
  'general.all': 'Alle',
  'general.add': 'Hinzufügen',
  'general.added': 'Hinzugefügt',

  'unit.g': 'g',
  'unit.ml': 'ml',
  'unit.stk': 'Stück',
  'unit.el': 'EL',
  'unit.tl': 'TL',
  'unit.prise': 'Prise',
  'unit.scheibe': 'Scheibe(n)',
  'unit.tasse': 'Tasse(n)',
  'unit.bund': 'Bund',
  'unit.dose': 'Dose(n)',
  'unit.pkg': 'Packung(en)',
  'unit.kg': 'kg',
  'unit.l': 'l',
};

const en: TranslationKeys = {
  'nav.dashboard': 'Dashboard',
  'nav.recipes': 'Recipes',
  'nav.mealPlanner': 'Meal Planner',
  'nav.shoppingList': 'Shopping List',
  'nav.profile': 'Profile',
  'nav.logout': 'Logout',

  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.username': 'Username',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm Password',
  'auth.loginTitle': 'Welcome Back',
  'auth.registerTitle': 'Create Account',
  'auth.noAccount': "Don't have an account?",
  'auth.hasAccount': 'Already have an account?',
  'auth.welcomeBack': 'Good to see you again! 👋',
  'auth.createAccount': 'Start your meal prep journey 🚀',

  'dashboard.welcome': 'Welcome back',
  'dashboard.todaysPlan': "Today's Plan",
  'dashboard.quickStats': 'Quick Stats',
  'dashboard.totalRecipes': 'Total Recipes',
  'dashboard.mealPlans': 'Meal Plans',
  'dashboard.avgCalories': 'Avg Calories',
  'dashboard.recentRecipes': 'Recent Recipes',
  'dashboard.recommendations': 'Recommended for you',
  'dashboard.basedOnYour': 'Based on your existing recipes',

  'recipes.title': 'My Recipes',
  'recipes.addRecipe': 'Add Recipe',
  'recipes.editRecipe': 'Edit Recipe',
  'recipes.searchPlaceholder': 'Search recipes...',
  'recipes.allCategories': 'All Categories',
  'recipes.allTypes': 'All Types',
  'recipes.noRecipes': 'No recipes yet. Create your first!',
  'recipes.name': 'Name',
  'recipes.description': 'Description',
  'recipes.instructions': 'Instructions',
  'recipes.instructionsPlaceholder': 'Step-by-step instructions...',
  'recipes.category': 'Category',
  'recipes.mealType': 'Meal Type',
  'recipes.servings': 'Servings',
  'recipes.calories': 'Calories',
  'recipes.protein': 'Protein',
  'recipes.fat': 'Fat',
  'recipes.carbs': 'Carbs',
  'recipes.ingredients': 'Ingredients',
  'recipes.addIngredient': 'Add Ingredient',
  'recipes.save': 'Save',
  'recipes.cancel': 'Cancel',
  'recipes.delete': 'Delete',
  'recipes.edit': 'Edit',
  'recipes.uploadImage': 'Upload Image/File',
  'recipes.importFromApi': 'Import Recipe',
  'recipes.perServing': 'per serving',
  'recipes.discover': 'Discover Recipes',
  'recipes.showDetails': 'Show Details',
  'recipes.showLess': 'Show Less',
  'recipes.preparation': 'Preparation',

  'macroFilter.title': 'Macro Filter',
  'macroFilter.minProtein': 'Min Protein',
  'macroFilter.maxProtein': 'Max Protein',
  'macroFilter.minCalories': 'Min Calories',
  'macroFilter.maxCalories': 'Max Calories',
  'macroFilter.macros': 'Macros',
  'macroFilter.reset': 'Reset Filters',

  'mealPlanner.title': 'Meal Planner',
  'mealPlanner.generate': 'Generate Plan',
  'mealPlanner.macroGoals': 'Macro Goals',
  'mealPlanner.dateRange': 'Date Range',
  'mealPlanner.history': 'History',
  'mealPlanner.noPlan': 'No plan available',
  'mealPlanner.breakfast': 'Breakfast',
  'mealPlanner.lunch': 'Lunch',
  'mealPlanner.dinner': 'Dinner',
  'mealPlanner.snack': 'Snack',
  'mealPlanner.dayView': 'Day View',
  'mealPlanner.weekView': 'Week View',
  'mealPlanner.thisWeek': 'This Week',
  'mealPlanner.noPlanForDay': 'No plan for this day',
  'mealPlanner.generateForDay': 'Generate Plan',
  'mealPlanner.weekSummary': 'Week Summary',
  'mealPlanner.planSubtitle': 'Plan your meals for the week',

  'shoppingList.title': 'Shopping List',
  'shoppingList.export': 'Export',
  'shoppingList.exportPDF': 'Export as PDF',
  'shoppingList.exportCSV': 'Export as CSV',
  'shoppingList.progress': 'Progress',
  'shoppingList.allDone': 'All done! 🎉',
  'shoppingList.empty': 'No items',

  'profile.title': 'My Profile',
  'profile.settings': 'Settings',
  'profile.language': 'Language',
  'profile.theme': 'Appearance',
  'profile.themeDark': 'Dark',
  'profile.themeLight': 'Light',
  'profile.themeSystem': 'System',
  'profile.account': 'Account',
  'profile.memberSince': 'Member since',
  'profile.recipesCreated': 'Recipes created',
  'profile.plansGenerated': 'Plans generated',
  'profile.changePassword': 'Change Password',

  'premium.title': 'MacroMate Premium',
  'premium.comingSoon': 'Coming Soon',
  'premium.subtitle': 'Unlock all features and reach your goals faster',
  'premium.upgrade': 'Learn More',

  'confirm.delete': 'Confirm Deletion',
  'confirm.deleteMessage': 'Are you sure? This cannot be undone.',
  'confirm.yes': 'Yes, delete',
  'confirm.no': 'No',
  'confirm.cancel': 'Cancel',

  'general.loading': 'Loading...',
  'general.error': 'Error',
  'general.success': 'Success',
  'general.save': 'Save',
  'general.close': 'Close',
  'general.search': 'Search',
  'general.filter': 'Filter',
  'general.from': 'From',
  'general.to': 'To',
  'general.all': 'All',
  'general.add': 'Add',
  'general.added': 'Added',

  'unit.g': 'g',
  'unit.ml': 'ml',
  'unit.stk': 'pcs',
  'unit.el': 'tbsp',
  'unit.tl': 'tsp',
  'unit.prise': 'pinch',
  'unit.scheibe': 'slice(s)',
  'unit.tasse': 'cup(s)',
  'unit.bund': 'bunch',
  'unit.dose': 'can(s)',
  'unit.pkg': 'package(s)',
  'unit.kg': 'kg',
  'unit.l': 'l',
};

const es: TranslationKeys = {
  'nav.dashboard': 'Panel',
  'nav.recipes': 'Recetas',
  'nav.mealPlanner': 'Planificador',
  'nav.shoppingList': 'Lista de compras',
  'nav.profile': 'Perfil',
  'nav.logout': 'Cerrar sesión',

  'auth.login': 'Iniciar sesión',
  'auth.register': 'Registrarse',
  'auth.username': 'Usuario',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.confirmPassword': 'Confirmar contraseña',
  'auth.loginTitle': 'Bienvenido de nuevo',
  'auth.registerTitle': 'Crear cuenta',
  'auth.noAccount': '¿No tienes cuenta?',
  'auth.hasAccount': '¿Ya tienes cuenta?',
  'auth.welcomeBack': '¡Qué bueno verte de nuevo! 👋',
  'auth.createAccount': 'Comienza tu viaje de meal prep 🚀',

  'dashboard.welcome': 'Bienvenido de nuevo',
  'dashboard.todaysPlan': 'Plan de hoy',
  'dashboard.quickStats': 'Estadísticas rápidas',
  'dashboard.totalRecipes': 'Total de recetas',
  'dashboard.mealPlans': 'Planes de comida',
  'dashboard.avgCalories': 'Calorías promedio',
  'dashboard.recentRecipes': 'Recetas recientes',
  'dashboard.recommendations': 'Recomendados para ti',
  'dashboard.basedOnYour': 'Basado en tus recetas existentes',

  'recipes.title': 'Mis Recetas',
  'recipes.addRecipe': 'Añadir receta',
  'recipes.editRecipe': 'Editar receta',
  'recipes.searchPlaceholder': 'Buscar recetas...',
  'recipes.allCategories': 'Todas las categorías',
  'recipes.allTypes': 'Todos los tipos',
  'recipes.noRecipes': 'Sin recetas aún. ¡Crea la primera!',
  'recipes.name': 'Nombre',
  'recipes.description': 'Descripción',
  'recipes.instructions': 'Instrucciones',
  'recipes.instructionsPlaceholder': 'Instrucciones paso a paso...',
  'recipes.category': 'Categoría',
  'recipes.mealType': 'Tipo de comida',
  'recipes.servings': 'Porciones',
  'recipes.calories': 'Calorías',
  'recipes.protein': 'Proteína',
  'recipes.fat': 'Grasa',
  'recipes.carbs': 'Carbohidratos',
  'recipes.ingredients': 'Ingredientes',
  'recipes.addIngredient': 'Añadir ingrediente',
  'recipes.save': 'Guardar',
  'recipes.cancel': 'Cancelar',
  'recipes.delete': 'Eliminar',
  'recipes.edit': 'Editar',
  'recipes.uploadImage': 'Subir imagen/archivo',
  'recipes.importFromApi': 'Importar receta',
  'recipes.perServing': 'por porción',
  'recipes.discover': 'Descubrir recetas',
  'recipes.showDetails': 'Mostrar detalles',
  'recipes.showLess': 'Mostrar menos',
  'recipes.preparation': 'Preparación',

  'macroFilter.title': 'Filtro de macros',
  'macroFilter.minProtein': 'Proteína mín.',
  'macroFilter.maxProtein': 'Proteína máx.',
  'macroFilter.minCalories': 'Calorías mín.',
  'macroFilter.maxCalories': 'Calorías máx.',
  'macroFilter.macros': 'Macros',
  'macroFilter.reset': 'Restablecer filtros',

  'mealPlanner.title': 'Planificador de comidas',
  'mealPlanner.generate': 'Generar plan',
  'mealPlanner.macroGoals': 'Objetivos macro',
  'mealPlanner.dateRange': 'Rango de fechas',
  'mealPlanner.history': 'Historial',
  'mealPlanner.noPlan': 'Sin plan disponible',
  'mealPlanner.breakfast': 'Desayuno',
  'mealPlanner.lunch': 'Almuerzo',
  'mealPlanner.dinner': 'Cena',
  'mealPlanner.snack': 'Snack',
  'mealPlanner.dayView': 'Vista diaria',
  'mealPlanner.weekView': 'Vista semanal',
  'mealPlanner.thisWeek': 'Esta semana',
  'mealPlanner.noPlanForDay': 'Sin plan para este día',
  'mealPlanner.generateForDay': 'Generar plan',
  'mealPlanner.weekSummary': 'Resumen semanal',
  'mealPlanner.planSubtitle': 'Planifica tus comidas de la semana',

  'shoppingList.title': 'Lista de compras',
  'shoppingList.export': 'Exportar',
  'shoppingList.exportPDF': 'Exportar como PDF',
  'shoppingList.exportCSV': 'Exportar como CSV',
  'shoppingList.progress': 'Progreso',
  'shoppingList.allDone': '¡Todo listo! 🎉',
  'shoppingList.empty': 'Sin artículos',

  'profile.title': 'Mi Perfil',
  'profile.settings': 'Configuración',
  'profile.language': 'Idioma',
  'profile.theme': 'Apariencia',
  'profile.themeDark': 'Oscuro',
  'profile.themeLight': 'Claro',
  'profile.themeSystem': 'Sistema',
  'profile.account': 'Cuenta',
  'profile.memberSince': 'Miembro desde',
  'profile.recipesCreated': 'Recetas creadas',
  'profile.plansGenerated': 'Planes generados',
  'profile.changePassword': 'Cambiar contraseña',

  'premium.title': 'MacroMate Premium',
  'premium.comingSoon': 'Próximamente',
  'premium.subtitle': 'Desbloquea todas las funciones y alcanza tus metas más rápido',
  'premium.upgrade': 'Más información',

  'confirm.delete': 'Confirmar eliminación',
  'confirm.deleteMessage': '¿Estás seguro? Esto no se puede deshacer.',
  'confirm.yes': 'Sí, eliminar',
  'confirm.no': 'No',
  'confirm.cancel': 'Cancelar',

  'general.loading': 'Cargando...',
  'general.error': 'Error',
  'general.success': 'Éxito',
  'general.save': 'Guardar',
  'general.close': 'Cerrar',
  'general.search': 'Buscar',
  'general.filter': 'Filtrar',
  'general.from': 'Desde',
  'general.to': 'Hasta',
  'general.all': 'Todos',
  'general.add': 'Añadir',
  'general.added': 'Añadido',

  'unit.g': 'g',
  'unit.ml': 'ml',
  'unit.stk': 'uds',
  'unit.el': 'cda',
  'unit.tl': 'cdta',
  'unit.prise': 'pizca',
  'unit.scheibe': 'rebanada(s)',
  'unit.tasse': 'taza(s)',
  'unit.bund': 'manojo',
  'unit.dose': 'lata(s)',
  'unit.pkg': 'paquete(s)',
  'unit.kg': 'kg',
  'unit.l': 'l',
};

const fr: TranslationKeys = {
  'nav.dashboard': 'Tableau de bord',
  'nav.recipes': 'Recettes',
  'nav.mealPlanner': 'Planificateur',
  'nav.shoppingList': 'Liste de courses',
  'nav.profile': 'Profil',
  'nav.logout': 'Déconnexion',

  'auth.login': 'Connexion',
  'auth.register': "S'inscrire",
  'auth.username': "Nom d'utilisateur",
  'auth.email': 'E-mail',
  'auth.password': 'Mot de passe',
  'auth.confirmPassword': 'Confirmer le mot de passe',
  'auth.loginTitle': 'Bienvenue',
  'auth.registerTitle': 'Créer un compte',
  'auth.noAccount': "Pas encore de compte ?",
  'auth.hasAccount': 'Déjà un compte ?',
  'auth.welcomeBack': 'Content de te revoir ! 👋',
  'auth.createAccount': 'Lance ton parcours meal prep 🚀',

  'dashboard.welcome': 'Bienvenue',
  'dashboard.todaysPlan': "Plan d'aujourd'hui",
  'dashboard.quickStats': 'Aperçu rapide',
  'dashboard.totalRecipes': 'Total recettes',
  'dashboard.mealPlans': 'Plans repas',
  'dashboard.avgCalories': 'Calories moy.',
  'dashboard.recentRecipes': 'Recettes récentes',
  'dashboard.recommendations': 'Recommandé pour vous',
  'dashboard.basedOnYour': 'Basé sur vos recettes existantes',

  'recipes.title': 'Mes Recettes',
  'recipes.addRecipe': 'Ajouter une recette',
  'recipes.editRecipe': 'Modifier la recette',
  'recipes.searchPlaceholder': 'Rechercher des recettes...',
  'recipes.allCategories': 'Toutes les catégories',
  'recipes.allTypes': 'Tous les types',
  'recipes.noRecipes': 'Pas encore de recettes. Créez la première !',
  'recipes.name': 'Nom',
  'recipes.description': 'Description',
  'recipes.instructions': 'Instructions',
  'recipes.instructionsPlaceholder': 'Instructions étape par étape...',
  'recipes.category': 'Catégorie',
  'recipes.mealType': 'Type de repas',
  'recipes.servings': 'Portions',
  'recipes.calories': 'Calories',
  'recipes.protein': 'Protéines',
  'recipes.fat': 'Lipides',
  'recipes.carbs': 'Glucides',
  'recipes.ingredients': 'Ingrédients',
  'recipes.addIngredient': 'Ajouter un ingrédient',
  'recipes.save': 'Enregistrer',
  'recipes.cancel': 'Annuler',
  'recipes.delete': 'Supprimer',
  'recipes.edit': 'Modifier',
  'recipes.uploadImage': 'Importer image/fichier',
  'recipes.importFromApi': 'Importer une recette',
  'recipes.perServing': 'par portion',
  'recipes.discover': 'Découvrir des recettes',
  'recipes.showDetails': 'Afficher les détails',
  'recipes.showLess': 'Afficher moins',
  'recipes.preparation': 'Préparation',

  'macroFilter.title': 'Filtre macros',
  'macroFilter.minProtein': 'Protéines min.',
  'macroFilter.maxProtein': 'Protéines max.',
  'macroFilter.minCalories': 'Calories min.',
  'macroFilter.maxCalories': 'Calories max.',
  'macroFilter.macros': 'Macros',
  'macroFilter.reset': 'Réinitialiser les filtres',

  'mealPlanner.title': 'Planificateur de repas',
  'mealPlanner.generate': 'Générer un plan',
  'mealPlanner.macroGoals': 'Objectifs macros',
  'mealPlanner.dateRange': 'Période',
  'mealPlanner.history': 'Historique',
  'mealPlanner.noPlan': 'Aucun plan disponible',
  'mealPlanner.breakfast': 'Petit-déjeuner',
  'mealPlanner.lunch': 'Déjeuner',
  'mealPlanner.dinner': 'Dîner',
  'mealPlanner.snack': 'Collation',
  'mealPlanner.dayView': 'Vue journalière',
  'mealPlanner.weekView': 'Vue hebdomadaire',
  'mealPlanner.thisWeek': 'Cette semaine',
  'mealPlanner.noPlanForDay': 'Aucun plan pour ce jour',
  'mealPlanner.generateForDay': 'Générer un plan',
  'mealPlanner.weekSummary': 'Résumé de la semaine',
  'mealPlanner.planSubtitle': 'Planifiez vos repas pour la semaine',

  'shoppingList.title': 'Liste de courses',
  'shoppingList.export': 'Exporter',
  'shoppingList.exportPDF': 'Exporter en PDF',
  'shoppingList.exportCSV': 'Exporter en CSV',
  'shoppingList.progress': 'Progression',
  'shoppingList.allDone': 'Tout est fait ! 🎉',
  'shoppingList.empty': 'Aucun article',

  'profile.title': 'Mon Profil',
  'profile.settings': 'Paramètres',
  'profile.language': 'Langue',
  'profile.theme': 'Apparence',
  'profile.themeDark': 'Sombre',
  'profile.themeLight': 'Clair',
  'profile.themeSystem': 'Système',
  'profile.account': 'Compte',
  'profile.memberSince': 'Membre depuis',
  'profile.recipesCreated': 'Recettes créées',
  'profile.plansGenerated': 'Plans générés',
  'profile.changePassword': 'Changer le mot de passe',

  'premium.title': 'MacroMate Premium',
  'premium.comingSoon': 'Bientôt disponible',
  'premium.subtitle': 'Débloquez toutes les fonctionnalités et atteignez vos objectifs plus vite',
  'premium.upgrade': 'En savoir plus',

  'confirm.delete': 'Confirmer la suppression',
  'confirm.deleteMessage': 'Êtes-vous sûr ? Cette action est irréversible.',
  'confirm.yes': 'Oui, supprimer',
  'confirm.no': 'Non',
  'confirm.cancel': 'Annuler',

  'general.loading': 'Chargement...',
  'general.error': 'Erreur',
  'general.success': 'Succès',
  'general.save': 'Enregistrer',
  'general.close': 'Fermer',
  'general.search': 'Rechercher',
  'general.filter': 'Filtrer',
  'general.from': 'De',
  'general.to': 'À',
  'general.all': 'Tous',
  'general.add': 'Ajouter',
  'general.added': 'Ajouté',

  'unit.g': 'g',
  'unit.ml': 'ml',
  'unit.stk': 'pce',
  'unit.el': 'c.à.s.',
  'unit.tl': 'c.à.c.',
  'unit.prise': 'pincée',
  'unit.scheibe': 'tranche(s)',
  'unit.tasse': 'tasse(s)',
  'unit.bund': 'botte',
  'unit.dose': 'boîte(s)',
  'unit.pkg': 'paquet(s)',
  'unit.kg': 'kg',
  'unit.l': 'l',
};

const translations: Record<Locale, TranslationKeys> = { de, en, es, fr };

export default translations;
