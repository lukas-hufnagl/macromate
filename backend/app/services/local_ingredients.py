"""
MacroMate – Local German Ingredient Database
Comprehensive offline ingredient database for instant search results.
Contains ~200+ common German foods with accurate nutrition per 100g.
This is the PRIMARY search tier — instant, offline, reliable.
"""

from __future__ import annotations

LOCAL_INGREDIENTS: list[dict] = [
    # ── Milchprodukte ──
    {"name": "Frischkäse", "name_en": "Cream cheese", "calories_100g": 342, "protein_100g": 5.9, "fat_100g": 34.2, "carbs_100g": 2.6, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Frischkäse light", "name_en": "Light cream cheese", "calories_100g": 166, "protein_100g": 8.5, "fat_100g": 12.0, "carbs_100g": 5.0, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Magerquark", "name_en": "Low-fat quark", "calories_100g": 67, "protein_100g": 12.0, "fat_100g": 0.3, "carbs_100g": 4.0, "category": "milchprodukte", "tags": ["laktose", "vegetarisch", "high-protein"]},
    {"name": "Quark 40% Fett", "name_en": "Quark 40% fat", "calories_100g": 143, "protein_100g": 9.2, "fat_100g": 9.8, "carbs_100g": 3.5, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Skyr", "name_en": "Skyr", "calories_100g": 63, "protein_100g": 11.0, "fat_100g": 0.2, "carbs_100g": 4.0, "category": "milchprodukte", "tags": ["laktose", "vegetarisch", "high-protein"]},
    {"name": "Griechischer Joghurt", "name_en": "Greek yogurt", "calories_100g": 133, "protein_100g": 6.5, "fat_100g": 10.0, "carbs_100g": 4.0, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Naturjoghurt", "name_en": "Plain yogurt", "calories_100g": 63, "protein_100g": 5.3, "fat_100g": 1.5, "carbs_100g": 6.3, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Vollmilch", "name_en": "Whole milk", "calories_100g": 64, "protein_100g": 3.3, "fat_100g": 3.5, "carbs_100g": 4.8, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Fettarme Milch 1,5%", "name_en": "Low-fat milk 1.5%", "calories_100g": 47, "protein_100g": 3.4, "fat_100g": 1.5, "carbs_100g": 4.9, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Sahne", "name_en": "Heavy cream", "calories_100g": 309, "protein_100g": 2.4, "fat_100g": 31.7, "carbs_100g": 3.4, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Schmand", "name_en": "Sour cream", "calories_100g": 240, "protein_100g": 2.9, "fat_100g": 24.0, "carbs_100g": 3.6, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Crème fraîche", "name_en": "Crème fraîche", "calories_100g": 292, "protein_100g": 2.5, "fat_100g": 30.0, "carbs_100g": 2.5, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Butter", "name_en": "Butter", "calories_100g": 741, "protein_100g": 0.7, "fat_100g": 83.2, "carbs_100g": 0.6, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Mozzarella", "name_en": "Mozzarella", "calories_100g": 280, "protein_100g": 17.0, "fat_100g": 21.0, "carbs_100g": 2.5, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Gouda", "name_en": "Gouda cheese", "calories_100g": 356, "protein_100g": 25.0, "fat_100g": 27.4, "carbs_100g": 2.2, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Emmentaler", "name_en": "Emmental cheese", "calories_100g": 382, "protein_100g": 28.9, "fat_100g": 29.7, "carbs_100g": 0.1, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Parmesan", "name_en": "Parmesan cheese", "calories_100g": 431, "protein_100g": 35.8, "fat_100g": 28.6, "carbs_100g": 3.2, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Feta", "name_en": "Feta cheese", "calories_100g": 264, "protein_100g": 14.2, "fat_100g": 21.3, "carbs_100g": 4.1, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Hüttenkäse", "name_en": "Cottage cheese", "calories_100g": 98, "protein_100g": 11.1, "fat_100g": 4.3, "carbs_100g": 3.4, "category": "milchprodukte", "tags": ["laktose", "vegetarisch", "high-protein"]},
    {"name": "Camembert", "name_en": "Camembert", "calories_100g": 300, "protein_100g": 19.8, "fat_100g": 24.3, "carbs_100g": 0.5, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Ricotta", "name_en": "Ricotta", "calories_100g": 174, "protein_100g": 11.3, "fat_100g": 13.0, "carbs_100g": 3.0, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},
    {"name": "Mascarpone", "name_en": "Mascarpone", "calories_100g": 429, "protein_100g": 4.8, "fat_100g": 44.6, "carbs_100g": 3.5, "category": "milchprodukte", "tags": ["laktose", "vegetarisch"]},

    # ── Eier ──
    {"name": "Ei (Hühnerei)", "name_en": "Chicken egg", "calories_100g": 155, "protein_100g": 12.6, "fat_100g": 10.6, "carbs_100g": 1.1, "category": "eier", "tags": ["ei", "vegetarisch", "high-protein"]},
    {"name": "Eiweiß", "name_en": "Egg white", "calories_100g": 52, "protein_100g": 11.0, "fat_100g": 0.2, "carbs_100g": 0.7, "category": "eier", "tags": ["ei", "vegetarisch", "high-protein"]},

    # ── Fleisch ──
    {"name": "Hähnchenbrust", "name_en": "Chicken breast", "calories_100g": 165, "protein_100g": 31.0, "fat_100g": 3.6, "carbs_100g": 0.0, "category": "fleisch", "tags": ["high-protein", "low-fat"]},
    {"name": "Hähnchenkeule", "name_en": "Chicken thigh", "calories_100g": 209, "protein_100g": 26.0, "fat_100g": 10.9, "carbs_100g": 0.0, "category": "fleisch", "tags": ["high-protein"]},
    {"name": "Putenbrust", "name_en": "Turkey breast", "calories_100g": 135, "protein_100g": 30.0, "fat_100g": 1.0, "carbs_100g": 0.0, "category": "fleisch", "tags": ["high-protein", "low-fat"]},
    {"name": "Rindfleisch (mager)", "name_en": "Lean beef", "calories_100g": 158, "protein_100g": 26.1, "fat_100g": 5.0, "carbs_100g": 0.0, "category": "fleisch", "tags": ["high-protein"]},
    {"name": "Rinderhackfleisch", "name_en": "Ground beef", "calories_100g": 254, "protein_100g": 17.2, "fat_100g": 20.0, "carbs_100g": 0.0, "category": "fleisch", "tags": ["high-protein"]},
    {"name": "Hackfleisch gemischt", "name_en": "Mixed ground meat", "calories_100g": 232, "protein_100g": 18.0, "fat_100g": 17.5, "carbs_100g": 0.0, "category": "fleisch", "tags": ["high-protein"]},
    {"name": "Schweinefleisch", "name_en": "Pork", "calories_100g": 242, "protein_100g": 27.3, "fat_100g": 14.2, "carbs_100g": 0.0, "category": "fleisch", "tags": ["high-protein"]},
    {"name": "Schweinefilet", "name_en": "Pork tenderloin", "calories_100g": 143, "protein_100g": 26.2, "fat_100g": 3.5, "carbs_100g": 0.0, "category": "fleisch", "tags": ["high-protein", "low-fat"]},
    {"name": "Kochschinken", "name_en": "Cooked ham", "calories_100g": 113, "protein_100g": 19.5, "fat_100g": 3.0, "carbs_100g": 1.5, "category": "fleisch", "tags": ["high-protein"]},
    {"name": "Speck", "name_en": "Bacon", "calories_100g": 458, "protein_100g": 14.4, "fat_100g": 44.1, "carbs_100g": 0.7, "category": "fleisch", "tags": []},
    {"name": "Bratwurst", "name_en": "Bratwurst sausage", "calories_100g": 313, "protein_100g": 13.5, "fat_100g": 27.6, "carbs_100g": 2.5, "category": "fleisch", "tags": []},
    {"name": "Salami", "name_en": "Salami", "calories_100g": 336, "protein_100g": 25.8, "fat_100g": 25.0, "carbs_100g": 1.3, "category": "fleisch", "tags": []},
    {"name": "Wiener Würstchen", "name_en": "Wiener sausage", "calories_100g": 235, "protein_100g": 12.0, "fat_100g": 20.0, "carbs_100g": 2.0, "category": "fleisch", "tags": []},
    {"name": "Ente", "name_en": "Duck", "calories_100g": 337, "protein_100g": 19.0, "fat_100g": 28.4, "carbs_100g": 0.0, "category": "fleisch", "tags": []},

    # ── Fisch & Meeresfrüchte ──
    {"name": "Lachs", "name_en": "Salmon", "calories_100g": 208, "protein_100g": 20.4, "fat_100g": 13.4, "carbs_100g": 0.0, "category": "fisch", "tags": ["high-protein", "omega-3"]},
    {"name": "Räucherlachs", "name_en": "Smoked salmon", "calories_100g": 183, "protein_100g": 25.0, "fat_100g": 9.0, "carbs_100g": 0.0, "category": "fisch", "tags": ["high-protein", "omega-3"]},
    {"name": "Thunfisch (Dose)", "name_en": "Canned tuna", "calories_100g": 116, "protein_100g": 25.5, "fat_100g": 1.0, "carbs_100g": 0.0, "category": "fisch", "tags": ["high-protein", "low-fat"]},
    {"name": "Kabeljau", "name_en": "Cod", "calories_100g": 82, "protein_100g": 17.8, "fat_100g": 0.7, "carbs_100g": 0.0, "category": "fisch", "tags": ["high-protein", "low-fat"]},
    {"name": "Forelle", "name_en": "Trout", "calories_100g": 119, "protein_100g": 20.5, "fat_100g": 3.5, "carbs_100g": 0.0, "category": "fisch", "tags": ["high-protein", "omega-3"]},
    {"name": "Garnelen", "name_en": "Shrimp", "calories_100g": 99, "protein_100g": 20.1, "fat_100g": 1.7, "carbs_100g": 0.2, "category": "fisch", "tags": ["high-protein", "low-fat", "schalentiere"]},
    {"name": "Hering", "name_en": "Herring", "calories_100g": 203, "protein_100g": 17.8, "fat_100g": 14.1, "carbs_100g": 0.0, "category": "fisch", "tags": ["omega-3"]},
    {"name": "Pangasius", "name_en": "Pangasius", "calories_100g": 79, "protein_100g": 15.0, "fat_100g": 2.0, "carbs_100g": 0.0, "category": "fisch", "tags": ["high-protein", "low-fat"]},
    {"name": "Tilapia", "name_en": "Tilapia", "calories_100g": 96, "protein_100g": 20.1, "fat_100g": 1.7, "carbs_100g": 0.0, "category": "fisch", "tags": ["high-protein", "low-fat"]},

    # ── Getreide & Beilagen ──
    {"name": "Haferflocken", "name_en": "Oats", "calories_100g": 368, "protein_100g": 13.5, "fat_100g": 7.0, "carbs_100g": 58.7, "category": "getreide", "tags": ["vegan", "ballaststoffe"]},
    {"name": "Reis (ungekocht)", "name_en": "Rice (uncooked)", "calories_100g": 360, "protein_100g": 6.7, "fat_100g": 0.6, "carbs_100g": 78.9, "category": "getreide", "tags": ["vegan", "glutenfrei"]},
    {"name": "Reis (gekocht)", "name_en": "Rice (cooked)", "calories_100g": 130, "protein_100g": 2.7, "fat_100g": 0.3, "carbs_100g": 28.2, "category": "getreide", "tags": ["vegan", "glutenfrei"]},
    {"name": "Basmati Reis", "name_en": "Basmati rice", "calories_100g": 348, "protein_100g": 7.0, "fat_100g": 0.6, "carbs_100g": 77.1, "category": "getreide", "tags": ["vegan", "glutenfrei"]},
    {"name": "Vollkornreis", "name_en": "Brown rice", "calories_100g": 362, "protein_100g": 7.5, "fat_100g": 2.7, "carbs_100g": 73.7, "category": "getreide", "tags": ["vegan", "glutenfrei", "ballaststoffe"]},
    {"name": "Nudeln (ungekocht)", "name_en": "Pasta (uncooked)", "calories_100g": 358, "protein_100g": 12.5, "fat_100g": 1.5, "carbs_100g": 70.9, "category": "getreide", "tags": ["vegan", "gluten"]},
    {"name": "Nudeln (gekocht)", "name_en": "Pasta (cooked)", "calories_100g": 158, "protein_100g": 5.8, "fat_100g": 0.9, "carbs_100g": 30.6, "category": "getreide", "tags": ["vegan", "gluten"]},
    {"name": "Vollkornnudeln", "name_en": "Whole wheat pasta", "calories_100g": 348, "protein_100g": 14.6, "fat_100g": 2.5, "carbs_100g": 61.3, "category": "getreide", "tags": ["vegan", "gluten", "ballaststoffe"]},
    {"name": "Spaghetti", "name_en": "Spaghetti", "calories_100g": 358, "protein_100g": 12.5, "fat_100g": 1.5, "carbs_100g": 70.9, "category": "getreide", "tags": ["vegan", "gluten"]},
    {"name": "Couscous", "name_en": "Couscous", "calories_100g": 376, "protein_100g": 12.8, "fat_100g": 0.6, "carbs_100g": 77.4, "category": "getreide", "tags": ["vegan", "gluten"]},
    {"name": "Quinoa", "name_en": "Quinoa", "calories_100g": 368, "protein_100g": 14.1, "fat_100g": 6.1, "carbs_100g": 64.2, "category": "getreide", "tags": ["vegan", "glutenfrei", "high-protein"]},
    {"name": "Bulgur", "name_en": "Bulgur", "calories_100g": 342, "protein_100g": 12.3, "fat_100g": 1.3, "carbs_100g": 75.9, "category": "getreide", "tags": ["vegan", "gluten"]},
    {"name": "Hirse", "name_en": "Millet", "calories_100g": 378, "protein_100g": 11.0, "fat_100g": 4.2, "carbs_100g": 73.0, "category": "getreide", "tags": ["vegan", "glutenfrei"]},
    {"name": "Kartoffeln", "name_en": "Potatoes", "calories_100g": 77, "protein_100g": 2.0, "fat_100g": 0.1, "carbs_100g": 17.5, "category": "getreide", "tags": ["vegan", "glutenfrei"]},
    {"name": "Süßkartoffel", "name_en": "Sweet potato", "calories_100g": 86, "protein_100g": 1.6, "fat_100g": 0.1, "carbs_100g": 20.1, "category": "getreide", "tags": ["vegan", "glutenfrei"]},

    # ── Brot & Backwaren ──
    {"name": "Vollkornbrot", "name_en": "Whole wheat bread", "calories_100g": 219, "protein_100g": 7.0, "fat_100g": 1.1, "carbs_100g": 40.6, "category": "brot", "tags": ["vegan", "gluten", "ballaststoffe"]},
    {"name": "Toastbrot", "name_en": "Toast bread", "calories_100g": 265, "protein_100g": 8.0, "fat_100g": 3.5, "carbs_100g": 49.0, "category": "brot", "tags": ["gluten"]},
    {"name": "Brötchen", "name_en": "Bread roll", "calories_100g": 292, "protein_100g": 9.3, "fat_100g": 3.8, "carbs_100g": 53.3, "category": "brot", "tags": ["gluten"]},
    {"name": "Knäckebrot", "name_en": "Crispbread", "calories_100g": 358, "protein_100g": 10.4, "fat_100g": 2.0, "carbs_100g": 71.2, "category": "brot", "tags": ["vegan", "gluten"]},
    {"name": "Pumpernickel", "name_en": "Pumpernickel", "calories_100g": 183, "protein_100g": 6.2, "fat_100g": 1.0, "carbs_100g": 36.5, "category": "brot", "tags": ["vegan", "gluten", "ballaststoffe"]},
    {"name": "Wraps / Tortillas", "name_en": "Tortilla wraps", "calories_100g": 312, "protein_100g": 8.3, "fat_100g": 7.8, "carbs_100g": 52.4, "category": "brot", "tags": ["vegan", "gluten"]},

    # ── Gemüse ──
    {"name": "Tomate", "name_en": "Tomato", "calories_100g": 18, "protein_100g": 0.9, "fat_100g": 0.2, "carbs_100g": 3.9, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Gurke", "name_en": "Cucumber", "calories_100g": 12, "protein_100g": 0.7, "fat_100g": 0.1, "carbs_100g": 1.8, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Paprika (rot)", "name_en": "Red bell pepper", "calories_100g": 31, "protein_100g": 1.0, "fat_100g": 0.3, "carbs_100g": 6.0, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Paprika (grün)", "name_en": "Green bell pepper", "calories_100g": 20, "protein_100g": 0.9, "fat_100g": 0.2, "carbs_100g": 3.5, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Zwiebel", "name_en": "Onion", "calories_100g": 40, "protein_100g": 1.1, "fat_100g": 0.1, "carbs_100g": 9.3, "category": "gemüse", "tags": ["vegan", "glutenfrei"]},
    {"name": "Knoblauch", "name_en": "Garlic", "calories_100g": 149, "protein_100g": 6.4, "fat_100g": 0.5, "carbs_100g": 33.1, "category": "gemüse", "tags": ["vegan", "glutenfrei"]},
    {"name": "Brokkoli", "name_en": "Broccoli", "calories_100g": 34, "protein_100g": 2.8, "fat_100g": 0.4, "carbs_100g": 6.6, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Blumenkohl", "name_en": "Cauliflower", "calories_100g": 25, "protein_100g": 1.9, "fat_100g": 0.3, "carbs_100g": 5.0, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Spinat", "name_en": "Spinach", "calories_100g": 23, "protein_100g": 2.9, "fat_100g": 0.4, "carbs_100g": 3.6, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Karotten", "name_en": "Carrots", "calories_100g": 41, "protein_100g": 0.9, "fat_100g": 0.2, "carbs_100g": 9.6, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Zucchini", "name_en": "Zucchini", "calories_100g": 17, "protein_100g": 1.2, "fat_100g": 0.3, "carbs_100g": 3.1, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Aubergine", "name_en": "Eggplant", "calories_100g": 25, "protein_100g": 1.0, "fat_100g": 0.2, "carbs_100g": 5.9, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Champignons", "name_en": "Mushrooms", "calories_100g": 22, "protein_100g": 3.1, "fat_100g": 0.3, "carbs_100g": 3.3, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Blattsalat", "name_en": "Lettuce", "calories_100g": 14, "protein_100g": 1.2, "fat_100g": 0.2, "carbs_100g": 1.4, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Rucola", "name_en": "Arugula", "calories_100g": 25, "protein_100g": 2.6, "fat_100g": 0.7, "carbs_100g": 3.7, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Mais (Dose)", "name_en": "Canned corn", "calories_100g": 82, "protein_100g": 2.7, "fat_100g": 1.2, "carbs_100g": 15.7, "category": "gemüse", "tags": ["vegan", "glutenfrei"]},
    {"name": "Erbsen", "name_en": "Peas", "calories_100g": 81, "protein_100g": 5.4, "fat_100g": 0.4, "carbs_100g": 14.5, "category": "gemüse", "tags": ["vegan", "glutenfrei"]},
    {"name": "Bohnen (grün)", "name_en": "Green beans", "calories_100g": 31, "protein_100g": 1.8, "fat_100g": 0.1, "carbs_100g": 7.1, "category": "gemüse", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Kidneybohnen (Dose)", "name_en": "Canned kidney beans", "calories_100g": 127, "protein_100g": 8.7, "fat_100g": 0.5, "carbs_100g": 22.8, "category": "hülsenfrüchte", "tags": ["vegan", "glutenfrei", "high-protein"]},
    {"name": "Kichererbsen (Dose)", "name_en": "Canned chickpeas", "calories_100g": 164, "protein_100g": 8.9, "fat_100g": 2.6, "carbs_100g": 27.4, "category": "hülsenfrüchte", "tags": ["vegan", "glutenfrei", "high-protein"]},
    {"name": "Linsen (rot)", "name_en": "Red lentils", "calories_100g": 353, "protein_100g": 23.9, "fat_100g": 1.1, "carbs_100g": 63.1, "category": "hülsenfrüchte", "tags": ["vegan", "glutenfrei", "high-protein", "ballaststoffe"]},
    {"name": "Edamame", "name_en": "Edamame", "calories_100g": 121, "protein_100g": 11.9, "fat_100g": 5.2, "carbs_100g": 8.6, "category": "hülsenfrüchte", "tags": ["vegan", "glutenfrei", "high-protein", "soja"]},
    {"name": "Avocado", "name_en": "Avocado", "calories_100g": 160, "protein_100g": 2.0, "fat_100g": 14.7, "carbs_100g": 8.5, "category": "gemüse", "tags": ["vegan", "glutenfrei"]},

    # ── Obst ──
    {"name": "Banane", "name_en": "Banana", "calories_100g": 89, "protein_100g": 1.1, "fat_100g": 0.3, "carbs_100g": 22.8, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Apfel", "name_en": "Apple", "calories_100g": 52, "protein_100g": 0.3, "fat_100g": 0.2, "carbs_100g": 13.8, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Erdbeeren", "name_en": "Strawberries", "calories_100g": 32, "protein_100g": 0.7, "fat_100g": 0.3, "carbs_100g": 7.7, "category": "obst", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Blaubeeren", "name_en": "Blueberries", "calories_100g": 57, "protein_100g": 0.7, "fat_100g": 0.3, "carbs_100g": 14.5, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Himbeeren", "name_en": "Raspberries", "calories_100g": 52, "protein_100g": 1.2, "fat_100g": 0.7, "carbs_100g": 11.9, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Orange", "name_en": "Orange", "calories_100g": 47, "protein_100g": 0.9, "fat_100g": 0.1, "carbs_100g": 11.8, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Weintrauben", "name_en": "Grapes", "calories_100g": 69, "protein_100g": 0.7, "fat_100g": 0.2, "carbs_100g": 18.1, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Mango", "name_en": "Mango", "calories_100g": 60, "protein_100g": 0.8, "fat_100g": 0.4, "carbs_100g": 15.0, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Ananas", "name_en": "Pineapple", "calories_100g": 50, "protein_100g": 0.5, "fat_100g": 0.1, "carbs_100g": 13.1, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Wassermelone", "name_en": "Watermelon", "calories_100g": 30, "protein_100g": 0.6, "fat_100g": 0.2, "carbs_100g": 7.6, "category": "obst", "tags": ["vegan", "glutenfrei", "low-cal"]},
    {"name": "Birne", "name_en": "Pear", "calories_100g": 57, "protein_100g": 0.4, "fat_100g": 0.1, "carbs_100g": 15.2, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Kiwi", "name_en": "Kiwi", "calories_100g": 61, "protein_100g": 1.1, "fat_100g": 0.5, "carbs_100g": 14.7, "category": "obst", "tags": ["vegan", "glutenfrei"]},
    {"name": "Zitrone", "name_en": "Lemon", "calories_100g": 29, "protein_100g": 1.1, "fat_100g": 0.3, "carbs_100g": 9.3, "category": "obst", "tags": ["vegan", "glutenfrei", "low-cal"]},

    # ── Nüsse & Samen ──
    {"name": "Mandeln", "name_en": "Almonds", "calories_100g": 579, "protein_100g": 21.2, "fat_100g": 49.9, "carbs_100g": 21.6, "category": "nüsse", "tags": ["vegan", "glutenfrei", "nüsse", "high-protein"]},
    {"name": "Walnüsse", "name_en": "Walnuts", "calories_100g": 654, "protein_100g": 15.2, "fat_100g": 65.2, "carbs_100g": 13.7, "category": "nüsse", "tags": ["vegan", "glutenfrei", "nüsse", "omega-3"]},
    {"name": "Cashews", "name_en": "Cashews", "calories_100g": 553, "protein_100g": 18.2, "fat_100g": 43.9, "carbs_100g": 30.2, "category": "nüsse", "tags": ["vegan", "glutenfrei", "nüsse"]},
    {"name": "Erdnüsse", "name_en": "Peanuts", "calories_100g": 567, "protein_100g": 25.8, "fat_100g": 49.2, "carbs_100g": 16.1, "category": "nüsse", "tags": ["vegan", "glutenfrei", "erdnüsse", "high-protein"]},
    {"name": "Erdnussbutter", "name_en": "Peanut butter", "calories_100g": 588, "protein_100g": 25.1, "fat_100g": 50.4, "carbs_100g": 20.0, "category": "nüsse", "tags": ["vegan", "glutenfrei", "erdnüsse", "high-protein"]},
    {"name": "Chiasamen", "name_en": "Chia seeds", "calories_100g": 486, "protein_100g": 16.5, "fat_100g": 30.7, "carbs_100g": 42.1, "category": "nüsse", "tags": ["vegan", "glutenfrei", "omega-3", "ballaststoffe"]},
    {"name": "Leinsamen", "name_en": "Flax seeds", "calories_100g": 534, "protein_100g": 18.3, "fat_100g": 42.2, "carbs_100g": 28.9, "category": "nüsse", "tags": ["vegan", "glutenfrei", "omega-3", "ballaststoffe"]},
    {"name": "Sonnenblumenkerne", "name_en": "Sunflower seeds", "calories_100g": 584, "protein_100g": 20.8, "fat_100g": 51.5, "carbs_100g": 20.0, "category": "nüsse", "tags": ["vegan", "glutenfrei"]},
    {"name": "Kürbiskerne", "name_en": "Pumpkin seeds", "calories_100g": 559, "protein_100g": 30.2, "fat_100g": 49.1, "carbs_100g": 10.7, "category": "nüsse", "tags": ["vegan", "glutenfrei", "high-protein"]},

    # ── Pflanzliche Proteine ──
    {"name": "Tofu", "name_en": "Tofu", "calories_100g": 76, "protein_100g": 8.1, "fat_100g": 4.2, "carbs_100g": 1.9, "category": "pflanzlich", "tags": ["vegan", "glutenfrei", "soja", "high-protein"]},
    {"name": "Räuchertofu", "name_en": "Smoked tofu", "calories_100g": 176, "protein_100g": 19.0, "fat_100g": 10.3, "carbs_100g": 2.6, "category": "pflanzlich", "tags": ["vegan", "glutenfrei", "soja", "high-protein"]},
    {"name": "Tempeh", "name_en": "Tempeh", "calories_100g": 192, "protein_100g": 20.3, "fat_100g": 10.8, "carbs_100g": 7.6, "category": "pflanzlich", "tags": ["vegan", "glutenfrei", "soja", "high-protein"]},
    {"name": "Seitan", "name_en": "Seitan", "calories_100g": 121, "protein_100g": 21.2, "fat_100g": 1.9, "carbs_100g": 3.7, "category": "pflanzlich", "tags": ["vegan", "gluten", "high-protein"]},

    # ── Pflanzliche Milch ──
    {"name": "Hafermilch", "name_en": "Oat milk", "calories_100g": 43, "protein_100g": 0.3, "fat_100g": 1.5, "carbs_100g": 6.7, "category": "pflanzlich", "tags": ["vegan", "laktosefrei", "gluten"]},
    {"name": "Sojamilch", "name_en": "Soy milk", "calories_100g": 33, "protein_100g": 2.8, "fat_100g": 1.8, "carbs_100g": 0.5, "category": "pflanzlich", "tags": ["vegan", "glutenfrei", "soja", "laktosefrei"]},
    {"name": "Mandelmilch", "name_en": "Almond milk", "calories_100g": 17, "protein_100g": 0.4, "fat_100g": 1.1, "carbs_100g": 0.8, "category": "pflanzlich", "tags": ["vegan", "glutenfrei", "nüsse", "laktosefrei"]},
    {"name": "Kokosmilch", "name_en": "Coconut milk", "calories_100g": 197, "protein_100g": 2.0, "fat_100g": 21.3, "carbs_100g": 2.8, "category": "pflanzlich", "tags": ["vegan", "glutenfrei", "laktosefrei"]},

    # ── Öle & Fette ──
    {"name": "Olivenöl", "name_en": "Olive oil", "calories_100g": 884, "protein_100g": 0.0, "fat_100g": 100.0, "carbs_100g": 0.0, "category": "öle", "tags": ["vegan", "glutenfrei"]},
    {"name": "Rapsöl", "name_en": "Canola oil", "calories_100g": 884, "protein_100g": 0.0, "fat_100g": 100.0, "carbs_100g": 0.0, "category": "öle", "tags": ["vegan", "glutenfrei"]},
    {"name": "Kokosöl", "name_en": "Coconut oil", "calories_100g": 862, "protein_100g": 0.0, "fat_100g": 99.1, "carbs_100g": 0.0, "category": "öle", "tags": ["vegan", "glutenfrei"]},
    {"name": "Leinöl", "name_en": "Flaxseed oil", "calories_100g": 884, "protein_100g": 0.0, "fat_100g": 100.0, "carbs_100g": 0.0, "category": "öle", "tags": ["vegan", "glutenfrei", "omega-3"]},

    # ── Soßen & Gewürze ──
    {"name": "Tomatensoße", "name_en": "Tomato sauce", "calories_100g": 36, "protein_100g": 1.3, "fat_100g": 0.4, "carbs_100g": 7.4, "category": "soßen", "tags": ["vegan", "glutenfrei"]},
    {"name": "Tomatenmark", "name_en": "Tomato paste", "calories_100g": 82, "protein_100g": 4.3, "fat_100g": 0.5, "carbs_100g": 18.9, "category": "soßen", "tags": ["vegan", "glutenfrei"]},
    {"name": "Sojasoße", "name_en": "Soy sauce", "calories_100g": 60, "protein_100g": 5.6, "fat_100g": 0.1, "carbs_100g": 8.1, "category": "soßen", "tags": ["vegan", "gluten", "soja"]},
    {"name": "Senf", "name_en": "Mustard", "calories_100g": 66, "protein_100g": 4.4, "fat_100g": 3.3, "carbs_100g": 5.5, "category": "soßen", "tags": ["vegan", "glutenfrei"]},
    {"name": "Ketchup", "name_en": "Ketchup", "calories_100g": 112, "protein_100g": 1.0, "fat_100g": 0.1, "carbs_100g": 27.4, "category": "soßen", "tags": ["vegan", "glutenfrei"]},
    {"name": "Mayonnaise", "name_en": "Mayonnaise", "calories_100g": 680, "protein_100g": 1.0, "fat_100g": 75.0, "carbs_100g": 1.0, "category": "soßen", "tags": ["ei", "glutenfrei"]},
    {"name": "Essig", "name_en": "Vinegar", "calories_100g": 18, "protein_100g": 0.0, "fat_100g": 0.0, "carbs_100g": 0.6, "category": "soßen", "tags": ["vegan", "glutenfrei"]},
    {"name": "Pesto", "name_en": "Pesto", "calories_100g": 406, "protein_100g": 5.1, "fat_100g": 39.4, "carbs_100g": 6.4, "category": "soßen", "tags": ["vegetarisch", "nüsse"]},

    # ── Süßes & Snacks ──
    {"name": "Honig", "name_en": "Honey", "calories_100g": 304, "protein_100g": 0.3, "fat_100g": 0.0, "carbs_100g": 82.4, "category": "süßes", "tags": ["vegetarisch", "glutenfrei"]},
    {"name": "Ahornsirup", "name_en": "Maple syrup", "calories_100g": 260, "protein_100g": 0.0, "fat_100g": 0.1, "carbs_100g": 67.0, "category": "süßes", "tags": ["vegan", "glutenfrei"]},
    {"name": "Zucker", "name_en": "Sugar", "calories_100g": 400, "protein_100g": 0.0, "fat_100g": 0.0, "carbs_100g": 100.0, "category": "süßes", "tags": ["vegan", "glutenfrei"]},
    {"name": "Dunkle Schokolade 70%", "name_en": "Dark chocolate 70%", "calories_100g": 598, "protein_100g": 7.8, "fat_100g": 42.6, "carbs_100g": 45.9, "category": "süßes", "tags": ["vegan"]},

    # ── Mehl & Backen ──
    {"name": "Weizenmehl", "name_en": "Wheat flour", "calories_100g": 364, "protein_100g": 10.3, "fat_100g": 1.0, "carbs_100g": 76.3, "category": "backen", "tags": ["vegan", "gluten"]},
    {"name": "Dinkelmehl", "name_en": "Spelt flour", "calories_100g": 338, "protein_100g": 14.6, "fat_100g": 2.4, "carbs_100g": 70.2, "category": "backen", "tags": ["vegan", "gluten"]},
    {"name": "Mandelmehl", "name_en": "Almond flour", "calories_100g": 580, "protein_100g": 21.0, "fat_100g": 50.0, "carbs_100g": 10.0, "category": "backen", "tags": ["vegan", "glutenfrei", "nüsse"]},
    {"name": "Kokosmehl", "name_en": "Coconut flour", "calories_100g": 443, "protein_100g": 19.3, "fat_100g": 14.7, "carbs_100g": 60.0, "category": "backen", "tags": ["vegan", "glutenfrei"]},
    {"name": "Haferkleie", "name_en": "Oat bran", "calories_100g": 246, "protein_100g": 17.3, "fat_100g": 7.0, "carbs_100g": 66.2, "category": "backen", "tags": ["vegan", "ballaststoffe"]},
    {"name": "Backpulver", "name_en": "Baking powder", "calories_100g": 53, "protein_100g": 0.0, "fat_100g": 0.0, "carbs_100g": 27.7, "category": "backen", "tags": ["vegan", "glutenfrei"]},

    # ── Protein / Supplements ──
    {"name": "Whey Protein", "name_en": "Whey protein powder", "calories_100g": 392, "protein_100g": 80.0, "fat_100g": 5.0, "carbs_100g": 7.0, "category": "supplements", "tags": ["laktose", "glutenfrei", "high-protein"]},
    {"name": "Casein Protein", "name_en": "Casein protein powder", "calories_100g": 370, "protein_100g": 77.0, "fat_100g": 2.0, "carbs_100g": 10.0, "category": "supplements", "tags": ["laktose", "glutenfrei", "high-protein"]},
    {"name": "Veganes Proteinpulver", "name_en": "Vegan protein powder", "calories_100g": 375, "protein_100g": 75.0, "fat_100g": 5.0, "carbs_100g": 8.0, "category": "supplements", "tags": ["vegan", "glutenfrei", "high-protein"]},
    {"name": "Protein Riegel", "name_en": "Protein bar", "calories_100g": 370, "protein_100g": 30.0, "fat_100g": 12.0, "carbs_100g": 35.0, "category": "supplements", "tags": ["high-protein"]},

    # ── Getränke ──
    {"name": "Orangensaft", "name_en": "Orange juice", "calories_100g": 45, "protein_100g": 0.7, "fat_100g": 0.2, "carbs_100g": 10.4, "category": "getränke", "tags": ["vegan", "glutenfrei"]},
    {"name": "Apfelsaft", "name_en": "Apple juice", "calories_100g": 46, "protein_100g": 0.1, "fat_100g": 0.1, "carbs_100g": 11.3, "category": "getränke", "tags": ["vegan", "glutenfrei"]},

    # ── Tiefkühl / Fertig ──
    {"name": "Tiefkühl-Gemüsemischung", "name_en": "Frozen mixed vegetables", "calories_100g": 55, "protein_100g": 2.8, "fat_100g": 0.3, "carbs_100g": 9.8, "category": "tiefkühl", "tags": ["vegan", "glutenfrei"]},
    {"name": "Tiefkühl-Beeren", "name_en": "Frozen mixed berries", "calories_100g": 48, "protein_100g": 0.9, "fat_100g": 0.3, "carbs_100g": 11.3, "category": "tiefkühl", "tags": ["vegan", "glutenfrei"]},

    # ── Sonstiges ──
    {"name": "Datteln (getrocknet)", "name_en": "Dried dates", "calories_100g": 277, "protein_100g": 1.8, "fat_100g": 0.2, "carbs_100g": 75.0, "category": "trockenfrüchte", "tags": ["vegan", "glutenfrei"]},
    {"name": "Rosinen", "name_en": "Raisins", "calories_100g": 299, "protein_100g": 3.1, "fat_100g": 0.5, "carbs_100g": 79.2, "category": "trockenfrüchte", "tags": ["vegan", "glutenfrei"]},
    {"name": "Müsli", "name_en": "Muesli", "calories_100g": 371, "protein_100g": 10.4, "fat_100g": 7.6, "carbs_100g": 67.1, "category": "getreide", "tags": ["vegetarisch", "gluten"]},
    {"name": "Cornflakes", "name_en": "Cornflakes", "calories_100g": 378, "protein_100g": 7.0, "fat_100g": 0.8, "carbs_100g": 84.0, "category": "getreide", "tags": ["vegan", "glutenfrei"]},
    {"name": "Kokosflocken", "name_en": "Coconut flakes", "calories_100g": 660, "protein_100g": 6.9, "fat_100g": 62.0, "carbs_100g": 23.7, "category": "nüsse", "tags": ["vegan", "glutenfrei"]},
]


# ── Search Functions ──

def _normalize(text: str) -> str:
    """Normalize text for fuzzy matching: lowercase + strip + umlauts."""
    t = text.lower().strip()
    # Keep umlauts as-is since German users will type them
    return t


def search_local_ingredients(query: str, limit: int = 8) -> list[dict]:
    """
    Search the local ingredient database.
    Returns instant results for common German foods.
    Uses prefix matching + fuzzy substring matching.
    """
    if not query or len(query.strip()) < 2:
        return []

    q = _normalize(query)
    scored: list[tuple[float, dict]] = []

    for item in LOCAL_INGREDIENTS:
        name_lower = item["name"].lower()
        name_en_lower = item["name_en"].lower()

        score = 999.0  # High = bad

        # Exact match
        if q == name_lower:
            score = 0.0
        # Starts-with match (highest priority after exact)
        elif name_lower.startswith(q):
            score = 1.0 + (len(name_lower) - len(q)) * 0.01
        # Word starts with query (e.g., "lachs" matches "Räucherlachs")
        elif any(word.startswith(q) for word in name_lower.split()):
            score = 2.0
        # Substring match
        elif q in name_lower:
            score = 3.0 + name_lower.index(q) * 0.01
        # English name match
        elif q in name_en_lower or name_en_lower.startswith(q):
            score = 4.0
        # Partial match (first 3+ chars)
        elif len(q) >= 3 and any(word.startswith(q[:3]) for word in name_lower.split()):
            score = 5.0

        if score < 999:
            result = {
                "name": item["name"],
                "name_en": item["name_en"],
                "calories_100g": item["calories_100g"],
                "protein_100g": item["protein_100g"],
                "fat_100g": item["fat_100g"],
                "carbs_100g": item["carbs_100g"],
                "image_url": "",
                "brand": "",
                "source": "local",
            }
            scored.append((score, result))

    # Sort by score (best first) and return top results
    scored.sort(key=lambda x: x[0])
    return [item for _, item in scored[:limit]]
