export type Locale = 'de' | 'en';

export const LOCALE_OPTIONS: { value: Locale; label: string; flag: string }[] = [
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

type TranslationKeys = {
  'nav.dashboard': string;
  'nav.recipes': string;
  'nav.mealPlanner': string;
  'nav.shoppingList': string;
  'nav.profile': string;
  'nav.logout': string;
  'nav.favorites': string;
  'nav.statistics': string;
  'nav.shortcuts': string;

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

  'dashboard.welcome': string;
  'dashboard.todaysPlan': string;
  'dashboard.quickStats': string;
  'dashboard.totalRecipes': string;
  'dashboard.mealPlans': string;
  'dashboard.avgCalories': string;
  'dashboard.recentRecipes': string;
  'dashboard.recommendations': string;
  'dashboard.basedOnYour': string;
  'dashboard.noPlanToday': string;
  'dashboard.noPlanDesc': string;
  'dashboard.generatePlan': string;
  'dashboard.remainingKcal': string;
  'dashboard.adjustGoals': string;
  'dashboard.hideGoals': string;
  'dashboard.tipOfDay': string;
  'dashboard.viewList': string;
  'dashboard.ofKcal': string;
  'dashboard.goodMorning': string;
  'dashboard.goodAfternoon': string;
  'dashboard.goodEvening': string;
  'dashboard.overview': string;
  'dashboard.viewAll': string;
  'dashboard.noPlanHint': string;
  'dashboard.gettingStarted': string;
  'dashboard.step1': string;
  'dashboard.step2': string;
  'dashboard.step3': string;
  'dashboard.startNow': string;

  'recipes.title': string;
  'recipes.addRecipe': string;
  'recipes.editRecipe': string;
  'recipes.newRecipe': string;
  'recipes.searchPlaceholder': string;
  'recipes.allCategories': string;
  'recipes.allTypes': string;
  'recipes.noRecipes': string;
  'recipes.noMatch': string;
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
  'recipes.step': string;
  'recipes.addedToBook': string;
  'recipes.nutritionAuto': string;
  'recipes.nutritionLoaded': string;
  'recipes.nutritionManual': string;
  'recipes.creating': string;
  'recipes.updating': string;
  'recipes.removeFav': string;
  'recipes.addFav': string;
  'recipes.highProtein': string;
  'recipes.lowCalorie': string;
  'recipes.lowCarb': string;
  'recipes.lowFat': string;
  'recipes.fitness': string;

  'macroFilter.title': string;
  'macroFilter.minProtein': string;
  'macroFilter.maxProtein': string;
  'macroFilter.minCalories': string;
  'macroFilter.maxCalories': string;
  'macroFilter.macros': string;
  'macroFilter.reset': string;

  'mealPlanner.title': string;
  'mealPlanner.generate': string;
  'mealPlanner.generating': string;
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
  'mealPlanner.dailyPlan': string;
  'mealPlanner.planGenerated': string;
  'mealPlanner.deletePlan': string;
  'mealPlanner.deleteConfirm': string;
  'mealPlanner.planDeleted': string;
  'mealPlanner.settings': string;
  'mealPlanner.date': string;
  'mealPlanner.categoryFilter': string;
  'mealPlanner.categoryHint': string;
  'mealPlanner.algorithmDesc': string;
  'mealPlanner.builtinHint': string;
  'mealPlanner.availableRecipes': string;
  'mealPlanner.savedPlans': string;
  'mealPlanner.targetCalories': string;
  'mealPlanner.previousPlans': string;
  'mealPlanner.noPlanYet': string;
  'mealPlanner.household': string;
  'mealPlanner.householdPlans': string;
  'mealPlanner.householdDesc': string;
  'mealPlanner.loadingPlans': string;
  'mealPlanner.noHouseholdPlans': string;
  'mealPlanner.noHouseholdHint': string;
  'mealPlanner.morePlans': string;
  'mealPlanner.pastDayHint': string;
  'mealPlanner.noMeals': string;
  'mealPlanner.day': string;
  'mealPlanner.week': string;
  'mealPlanner.toCurrentWeek': string;
  'mealPlanner.share': string;
  'mealPlanner.linkCopied': string;
  'mealPlanner.shareError': string;
  'mealPlanner.sharedPlan': string;
  'mealPlanner.slotBreakfast': string;
  'mealPlanner.slotLunch': string;
  'mealPlanner.slotDinner': string;
  'mealPlanner.slotSnack': string;
  'mealPlanner.shareDisabled': string;
  'mealPlanner.stopSharing': string;

  'shoppingList.title': string;
  'shoppingList.export': string;
  'shoppingList.exportPDF': string;
  'shoppingList.exportCSV': string;
  'shoppingList.progress': string;
  'shoppingList.allDone': string;
  'shoppingList.empty': string;
  'shoppingList.created': string;
  'shoppingList.selectRange': string;
  'shoppingList.ingredient': string;
  'shoppingList.amount': string;

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
  'profile.household': string;
  'profile.allergies': string;
  'profile.dietType': string;
  'profile.bodyData': string;
  'profile.noRestriction': string;

  'goals.title': string;
  'goals.subtitle': string;
  'goals.saved': string;
  'goals.reset': string;
  'goals.saveGoals': string;

  'premium.title': string;
  'premium.comingSoon': string;
  'premium.subtitle': string;
  'premium.upgrade': string;

  'confirm.delete': string;
  'confirm.deleteMessage': string;
  'confirm.yes': string;
  'confirm.no': string;
  'confirm.cancel': string;

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
  'general.portion': string;
  'general.portions': string;
  'general.searchIngredient': string;
  'general.amount': string;
  'general.copied': string;
  'general.notFound': string;
  'general.manualEntry': string;
  'general.results': string;
  'general.per100g': string;
  'general.lightMode': string;
  'general.darkMode': string;

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
  'nav.favorites': 'Favoriten',
  'nav.statistics': 'Statistiken',
  'nav.shortcuts': 'Schnellzugriff',

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
  'dashboard.noPlanToday': 'Kein Plan für heute',
  'dashboard.noPlanDesc': 'Erstelle einen nutri-optimierten Tagesplan basierend auf deinen Makrozielen.',
  'dashboard.generatePlan': 'Tagesplan generieren',
  'dashboard.remainingKcal': 'Noch übrig heute',
  'dashboard.adjustGoals': 'Ziele anpassen',
  'dashboard.hideGoals': 'Ziele ausblenden',
  'dashboard.tipOfDay': 'Tipp des Tages',
  'dashboard.viewList': 'Anzeigen',
  'dashboard.ofKcal': 'von',
  'dashboard.goodMorning': 'Guten Morgen',
  'dashboard.goodAfternoon': 'Guten Tag',
  'dashboard.goodEvening': 'Guten Abend',
  'dashboard.overview': 'Übersicht',
  'dashboard.viewAll': 'Alle',
  'dashboard.noPlanHint': 'Erstelle einen nutri-optimierten Tagesplan basierend auf deinen Makrozielen.',
  'dashboard.gettingStarted': 'So startest du durch',
  'dashboard.step1': 'Setze deine Makroziele im Profil',
  'dashboard.step2': 'Füge eigene Rezepte hinzu oder entdecke Vorlagen',
  'dashboard.step3': 'Generiere deinen ersten Tagesplan',
  'dashboard.startNow': 'Profil einrichten',

  'recipes.title': 'Meine Rezepte',
  'recipes.addRecipe': 'Rezept hinzufügen',
  'recipes.editRecipe': 'Rezept bearbeiten',
  'recipes.newRecipe': 'Neues Rezept',
  'recipes.searchPlaceholder': 'Rezepte durchsuchen...',
  'recipes.allCategories': 'Alle Kategorien',
  'recipes.allTypes': 'Alle Typen',
  'recipes.noRecipes': 'Noch keine Rezepte. Erstelle dein erstes!',
  'recipes.noMatch': 'Keine passenden Rezepte',
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
  'recipes.step': 'Schritt',
  'recipes.addedToBook': 'Zu deinem Kochbuch hinzugefügt!',
  'recipes.nutritionAuto': 'Nährwerte werden automatisch aus den Zutaten berechnet',
  'recipes.nutritionLoaded': 'Nährwerte werden beim Auswählen automatisch geladen',
  'recipes.nutritionManual': 'Nährwerte pro 100g — manuell anpassbar',
  'recipes.creating': 'Erstellen...',
  'recipes.updating': 'Aktualisieren',
  'recipes.removeFav': 'Favorit entfernen',
  'recipes.addFav': 'Als Favorit markieren',
  'recipes.highProtein': 'High Protein',
  'recipes.lowCalorie': 'Low Calorie',
  'recipes.lowCarb': 'Low Carb',
  'recipes.lowFat': 'Low Fat',
  'recipes.fitness': 'Fitness',

  'macroFilter.title': 'Makro-Filter',
  'macroFilter.minProtein': 'Min. Protein',
  'macroFilter.maxProtein': 'Max. Protein',
  'macroFilter.minCalories': 'Min. Kalorien',
  'macroFilter.maxCalories': 'Max. Kalorien',
  'macroFilter.macros': 'Makros',
  'macroFilter.reset': 'Filter zurücksetzen',

  'mealPlanner.title': 'Essensplaner',
  'mealPlanner.generate': 'Plan generieren',
  'mealPlanner.generating': 'Wird generiert...',
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
  'mealPlanner.planSubtitle': 'Plane deine Mahlzeiten für den Tag oder die ganze Woche',
  'mealPlanner.dailyPlan': 'Tagesplan generieren',
  'mealPlanner.planGenerated': 'Tagesplan generiert! 🎉',
  'mealPlanner.deletePlan': 'Plan löschen?',
  'mealPlanner.deleteConfirm': 'Möchtest du diesen Tagesplan wirklich löschen? Das kann nicht rückgängig gemacht werden.',
  'mealPlanner.planDeleted': 'Plan gelöscht',
  'mealPlanner.settings': 'Plan-Einstellungen',
  'mealPlanner.date': 'Datum',
  'mealPlanner.categoryFilter': 'Kategorien filtern (optional)',
  'mealPlanner.categoryHint': 'Nur Rezepte aus gewählten Kategorien werden berücksichtigt',
  'mealPlanner.algorithmDesc': 'Der Algorithmus wählt die besten Rezepte für deine Makroziele aus und berechnet optimale Portionsgrößen.',
  'mealPlanner.builtinHint': 'Wir nutzen vorgefertigte Rezepte für deinen Plan',
  'mealPlanner.availableRecipes': 'Verfügbare Rezepte',
  'mealPlanner.savedPlans': 'Gespeicherte Pläne',
  'mealPlanner.targetCalories': 'Ziel-Kalorien',
  'mealPlanner.previousPlans': 'Bisherige Pläne',
  'mealPlanner.noPlanYet': 'Noch keine Pläne generiert.',
  'mealPlanner.household': 'Haushalt',
  'mealPlanner.householdPlans': 'Pläne',
  'mealPlanner.householdDesc': 'Übersicht der Ernährungspläne aller Haushaltsmitglieder',
  'mealPlanner.loadingPlans': 'Pläne werden geladen...',
  'mealPlanner.noHouseholdPlans': 'Noch keine Pläne im Haushalt vorhanden.',
  'mealPlanner.noHouseholdHint': 'Erstelle einen Plan und deine Mitbewohner sehen ihn hier.',
  'mealPlanner.morePlans': 'weitere Pläne',
  'mealPlanner.pastDayHint': 'Für vergangene Tage kann kein Plan erstellt werden.',
  'mealPlanner.noMeals': 'Keine Mahlzeiten in diesem Plan.',
  'mealPlanner.day': 'Tag',
  'mealPlanner.week': 'Woche',
  'mealPlanner.toCurrentWeek': 'Zur aktuellen Woche',
  'mealPlanner.share': 'Teilen',
  'mealPlanner.linkCopied': 'Link kopiert!',
  'mealPlanner.shareError': 'Fehler beim Teilen',
  'mealPlanner.sharedPlan': 'Geteilter Plan',
  'mealPlanner.slotBreakfast': 'Frühstück',
  'mealPlanner.slotLunch': 'Mittagessen',
  'mealPlanner.slotDinner': 'Abendessen',
  'mealPlanner.slotSnack': 'Snack',
  'mealPlanner.shareDisabled': 'Sharing deaktiviert',
  'mealPlanner.stopSharing': 'Sharing beenden',

  'shoppingList.title': 'Einkaufsliste',
  'shoppingList.export': 'Exportieren',
  'shoppingList.exportPDF': 'Als PDF exportieren',
  'shoppingList.exportCSV': 'Als CSV exportieren',
  'shoppingList.progress': 'Fortschritt',
  'shoppingList.allDone': 'Alles erledigt! 🎉',
  'shoppingList.empty': 'Keine Einträge',
  'shoppingList.created': 'Einkaufsliste erstellt!',
  'shoppingList.selectRange': 'Wähle einen Zeitraum und erstelle eine Einkaufsliste.',
  'shoppingList.ingredient': 'Zutat',
  'shoppingList.amount': 'Menge',

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
  'profile.household': 'Haushalt',
  'profile.allergies': 'Allergien & Ernährung',
  'profile.dietType': 'Ernährungsform',
  'profile.bodyData': 'Deine Körperdaten',
  'profile.noRestriction': 'Keine Einschränkung',

  'goals.title': 'Tagesziele',
  'goals.subtitle': 'Passe deine Makronährstoffziele an',
  'goals.saved': 'Ziele gespeichert! 🎯',
  'goals.reset': 'Ziele zurückgesetzt',
  'goals.saveGoals': 'Ziele speichern',

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
  'general.portion': 'Portion',
  'general.portions': 'Portionen',
  'general.searchIngredient': 'Zutat suchen...',
  'general.amount': 'Menge',
  'general.copied': 'Kopiert!',
  'general.notFound': 'Nicht gefunden',
  'general.manualEntry': 'Manuell eingeben',
  'general.results': 'Ergebnisse',
  'general.per100g': 'pro 100g',
  'general.lightMode': 'Light Mode',
  'general.darkMode': 'Dark Mode',

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
  'nav.favorites': 'Favorites',
  'nav.statistics': 'Statistics',
  'nav.shortcuts': 'Shortcuts',

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
  'dashboard.noPlanToday': 'No plan for today',
  'dashboard.noPlanDesc': 'Create a nutrition-optimized daily plan based on your macro goals.',
  'dashboard.generatePlan': 'Generate Daily Plan',
  'dashboard.remainingKcal': 'Remaining today',
  'dashboard.adjustGoals': 'Adjust Goals',
  'dashboard.hideGoals': 'Hide Goals',
  'dashboard.tipOfDay': 'Tip of the Day',
  'dashboard.viewList': 'View',
  'dashboard.ofKcal': 'of',
  'dashboard.goodMorning': 'Good Morning',
  'dashboard.goodAfternoon': 'Good Afternoon',
  'dashboard.goodEvening': 'Good Evening',
  'dashboard.overview': 'Overview',
  'dashboard.viewAll': 'View All',
  'dashboard.noPlanHint': 'Create a nutri-optimized daily plan based on your macro goals.',
  'dashboard.gettingStarted': 'Get started',
  'dashboard.step1': 'Set your macro goals in your profile',
  'dashboard.step2': 'Add your own recipes or browse templates',
  'dashboard.step3': 'Generate your first daily plan',
  'dashboard.startNow': 'Set up profile',

  'recipes.title': 'My Recipes',
  'recipes.addRecipe': 'Add Recipe',
  'recipes.editRecipe': 'Edit Recipe',
  'recipes.newRecipe': 'New Recipe',
  'recipes.searchPlaceholder': 'Search recipes...',
  'recipes.allCategories': 'All Categories',
  'recipes.allTypes': 'All Types',
  'recipes.noRecipes': 'No recipes yet. Create your first!',
  'recipes.noMatch': 'No matching recipes',
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
  'recipes.step': 'Step',
  'recipes.addedToBook': 'Added to your cookbook!',
  'recipes.nutritionAuto': 'Nutrition values are calculated automatically from ingredients',
  'recipes.nutritionLoaded': 'Nutrition values are loaded automatically when selecting',
  'recipes.nutritionManual': 'Nutrition per 100g — manually adjustable',
  'recipes.creating': 'Creating...',
  'recipes.updating': 'Update',
  'recipes.removeFav': 'Remove favorite',
  'recipes.addFav': 'Add to favorites',
  'recipes.highProtein': 'High Protein',
  'recipes.lowCalorie': 'Low Calorie',
  'recipes.lowCarb': 'Low Carb',
  'recipes.lowFat': 'Low Fat',
  'recipes.fitness': 'Fitness',

  'macroFilter.title': 'Macro Filter',
  'macroFilter.minProtein': 'Min Protein',
  'macroFilter.maxProtein': 'Max Protein',
  'macroFilter.minCalories': 'Min Calories',
  'macroFilter.maxCalories': 'Max Calories',
  'macroFilter.macros': 'Macros',
  'macroFilter.reset': 'Reset Filters',

  'mealPlanner.title': 'Meal Planner',
  'mealPlanner.generate': 'Generate Plan',
  'mealPlanner.generating': 'Generating...',
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
  'mealPlanner.planSubtitle': 'Plan your meals for the day or the entire week',
  'mealPlanner.dailyPlan': 'Generate Daily Plan',
  'mealPlanner.planGenerated': 'Daily plan generated! 🎉',
  'mealPlanner.deletePlan': 'Delete plan?',
  'mealPlanner.deleteConfirm': 'Do you really want to delete this daily plan? This cannot be undone.',
  'mealPlanner.planDeleted': 'Plan deleted',
  'mealPlanner.settings': 'Plan Settings',
  'mealPlanner.date': 'Date',
  'mealPlanner.categoryFilter': 'Filter categories (optional)',
  'mealPlanner.categoryHint': 'Only recipes from selected categories will be considered',
  'mealPlanner.algorithmDesc': 'The algorithm selects the best recipes for your macro goals and calculates optimal portion sizes.',
  'mealPlanner.builtinHint': 'We use pre-built recipes for your plan',
  'mealPlanner.availableRecipes': 'Available Recipes',
  'mealPlanner.savedPlans': 'Saved Plans',
  'mealPlanner.targetCalories': 'Target Calories',
  'mealPlanner.previousPlans': 'Previous Plans',
  'mealPlanner.noPlanYet': 'No plans generated yet.',
  'mealPlanner.household': 'Household',
  'mealPlanner.householdPlans': 'Plans',
  'mealPlanner.householdDesc': 'Overview of meal plans from all household members',
  'mealPlanner.loadingPlans': 'Loading plans...',
  'mealPlanner.noHouseholdPlans': 'No plans in the household yet.',
  'mealPlanner.noHouseholdHint': 'Create a plan and your roommates will see it here.',
  'mealPlanner.morePlans': 'more plans',
  'mealPlanner.pastDayHint': 'Plans cannot be created for past days.',
  'mealPlanner.noMeals': 'No meals in this plan.',
  'mealPlanner.day': 'Day',
  'mealPlanner.week': 'Week',
  'mealPlanner.toCurrentWeek': 'Go to current week',
  'mealPlanner.share': 'Share',
  'mealPlanner.linkCopied': 'Link copied!',
  'mealPlanner.shareError': 'Error sharing',
  'mealPlanner.sharedPlan': 'Shared Plan',
  'mealPlanner.slotBreakfast': 'Breakfast',
  'mealPlanner.slotLunch': 'Lunch',
  'mealPlanner.slotDinner': 'Dinner',
  'mealPlanner.slotSnack': 'Snack',
  'mealPlanner.shareDisabled': 'Sharing disabled',
  'mealPlanner.stopSharing': 'Stop sharing',

  'shoppingList.title': 'Shopping List',
  'shoppingList.export': 'Export',
  'shoppingList.exportPDF': 'Export as PDF',
  'shoppingList.exportCSV': 'Export as CSV',
  'shoppingList.progress': 'Progress',
  'shoppingList.allDone': 'All done! 🎉',
  'shoppingList.empty': 'No items',
  'shoppingList.created': 'Shopping list created!',
  'shoppingList.selectRange': 'Select a date range and create a shopping list.',
  'shoppingList.ingredient': 'Ingredient',
  'shoppingList.amount': 'Amount',

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
  'profile.household': 'Household',
  'profile.allergies': 'Allergies & Diet',
  'profile.dietType': 'Diet type',
  'profile.bodyData': 'Your Body Data',
  'profile.noRestriction': 'No restriction',

  'goals.title': 'Daily Goals',
  'goals.subtitle': 'Adjust your macronutrient goals',
  'goals.saved': 'Goals saved! 🎯',
  'goals.reset': 'Goals reset',
  'goals.saveGoals': 'Save Goals',

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
  'general.portion': 'Serving',
  'general.portions': 'Servings',
  'general.searchIngredient': 'Search ingredient...',
  'general.amount': 'Amount',
  'general.copied': 'Copied!',
  'general.notFound': 'Not found',
  'general.manualEntry': 'Enter manually',
  'general.results': 'Results',
  'general.per100g': 'per 100g',
  'general.lightMode': 'Light Mode',
  'general.darkMode': 'Dark Mode',

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

const translations: Record<Locale, TranslationKeys> = { de, en };

export default translations;
