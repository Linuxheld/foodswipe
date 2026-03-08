import { useState, useRef, useCallback, useEffect } from "react";

const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const getSlot = () => { const h=new Date().getHours(); if(h>=6&&h<11)return"morning"; if(h>=11&&h<15)return"lunch"; if(h>=15&&h<18)return"snack"; return"dinner"; };
const slotMap = { morning:"breakfast", lunch:"lunch", snack:"snack", dinner:"dinner" };
const load = (key, fallback) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── i18n TRANSLATIONS ─────────────────────────────────────────────────────
const TRANSLATIONS={
  de:{
    // Slot labels
    slot_morning:"Frühstücks-Ideen",slot_lunch:"Mittagsideen",slot_snack:"Schnelle Snacks",slot_dinner:"Dinner-Ideen",
    // Moods
    mood_time:"Zur Uhrzeit",mood_all:"Alles",mood_fast:"Schnell",mood_protein:"High Protein",mood_veggie:"Vegetarisch",mood_trending:"Trending",mood_lowcal:"Wenig Kalorien",
    // Onboarding
    ob_tagline:"Swipe dich zu deinem nächsten Lieblingsgericht.",ob_name_placeholder:"Wie heißt du?",ob_next:"Weiter →",
    ob_how_title:"So funktioniert's 👆",ob_how_sub:"Einfach wie Tinder – nur für Essen!",
    ob_swipe_right:"Rechts swipen",ob_swipe_right_sub:"Magst du → kommt in Favoriten",
    ob_swipe_left:"Links swipen",ob_swipe_left_sub:"Kein Interesse → nächstes Gericht",
    ob_favorites:"Favoriten",ob_favorites_sub:"Alle Gerichte + Kochanleitungen",
    ob_shopping:"Einkaufsliste",ob_shopping_sub:"Zutaten werden automatisch gesammelt",
    ob_back:"← Zurück",ob_start:"Los geht's 🚀",
    ob_lang_title:"Sprache wählen 🌍",ob_lang_sub:"Du kannst sie jederzeit in den Einstellungen ändern.",
    // Swipe
    swipe_nope:"NOPE",swipe_like:"LECKER!",swipe_recipe:"👨‍🍳 Rezept",swipe_dishes:"Gerichte",swipe_own:"➕ Eigenes",
    swipe_no_recipes:"Keine Rezepte",swipe_change_filter:"Anderen Filter wählen!",
    // Detail
    detail_ingredients:"🛒 Zutaten",detail_steps:"👨‍🍳 Zubereitung",
    detail_remove_fav:"🗑 Aus Favoriten entfernen",detail_add_fav:"❤️ Zu Favoriten hinzufügen",
    detail_delete_custom:"🗑 Eigenes Gericht löschen",detail_back:"← Zurück",
    detail_removed:"🗑 Entfernt",detail_saved_fav:"❤️ Favorit!",
    // Favorites
    fav_title:"Favoriten ❤️",fav_empty_title:"Noch keine Favoriten",fav_empty_sub:"Swipe Gerichte nach rechts, um sie zu speichern!",
    fav_history:"VERLAUF – antippen zum Öffnen",fav_clear_history:"Verlauf löschen",
    // Shopping
    shop_title:"Einkaufsliste 🛒",shop_open:"offen",shop_empty_sub:"Swipe Gerichte nach rechts!",
    shop_clear:"🗑 Liste leeren",shop_clear_checked:"Erledigte entfernen",
    // Settings
    set_title:"Einstellungen ⚙️",set_profile:"PROFIL",set_hey:"Hey",set_recipes:"Rezepte",set_favs:"Favoriten",set_seen:"gesehen",
    set_mealdb_title:"🌍 THEMEALDB – KOSTENLOSE REZEPTE",set_mealdb_sub:"100% gratis, kein Account nötig! Lade internationale Rezepte direkt in die App.",
    set_mealdb_loading:"⏳ Lädt...",set_mealdb_loaded:"Rezepte geladen",set_mealdb_btn:"🍽️ Rezepte laden (gratis!)",
    set_ai_title:"🤖 KI-REZEPT-SCANNER (optional)",set_ai_sub:"Fotografiere Rezeptkarten (HelloFresh etc.) und Claude erkennt Zutaten & Schritte automatisch.",set_ai_sub2:"Key auf",set_ai_sub3:"erstellen.",
    set_ai_saved:"✅ API Key gespeichert – Scan bereit!",set_ai_without:"Ohne Key: manuell Rezepte eingeben",
    set_allergens:"ALLERGIEN AUSSCHLIESSEN",set_allergen_input:"Eigene Allergie eingeben...",set_allergen_add:"+ Hinzufügen",
    set_reset_seen:"🔄 Gesehene zurücksetzen",set_redo_onboarding:"Onboarding wiederholen",
    set_lang_title:"🌍 SPRACHE / LANGUAGE",
    // Add dish
    add_title:"Eigenes Gericht 🍳",add_photo:"📷 Foto aufnehmen",add_gallery:"🖼️ Aus Galerie",
    add_scan:"🤖 Rezeptkarte scannen",add_scanning:"⏳ Scanne...",add_scanned:"✅ Erkannt!",
    add_name:"GERICHTNAME *",add_name_ph:"z.B. Mamas Bolognese",add_time:"KOCHZEIT",add_time_ph:"z.B. 30 Min",
    add_meal:"MAHLZEIT-KATEGORIE *",add_nutrition:"NÄHRWERTE (pro Portion)",
    add_cal:"KALORIEN (kcal)",add_protein:"PROTEIN (g)",add_carbs:"KOHLENHYDRATE (g)",add_fat:"FETT (g)",
    add_ingredients:"ZUTATEN (kommagetrennt: \"Nudeln 200g, Hackfleisch 300g\")",add_ingredients_ph:"Nudeln 200g, Hackfleisch 300g, Zwiebel 1 Stück",
    add_steps:"ZUBEREITUNG (jeder Schritt neue Zeile)",add_steps_ph:"Zwiebeln anbraten.\nHackfleisch dazu.\nSauce köcheln lassen.\nServieren!",
    add_save:"Gericht hinzufügen ✅",add_cancel:"Abbrechen",
    add_err_name:"❌ Bitte Gerichtname eingeben!",add_err_meal:"❌ Bitte Mahlzeit wählen!",add_success:"✅ Gericht hinzugefügt!",
    // Meals
    meal_breakfast:"🌅 Frühstück",meal_lunch:"☀️ Mittagessen",meal_dinner:"🌙 Abendessen",meal_snack:"🍎 Snack",
    // Toast
    toast_already_saved:"ist schon gespeichert!",toast_saved:"gespeichert!",toast_shuffled:"🔀 Neu gemischt!",toast_api_error:"❌ API Fehler – Internet prüfen",
    toast_allergen_added:"hinzugefügt",toast_reset:"🔄 Zurückgesetzt!",
    // TheMealDB fallback
    mdb_default_amount:"nach Bedarf",mdb_fallback_step1:"Alle Zutaten vorbereiten.",mdb_fallback_step2:"Rezept Schritt für Schritt folgen.",mdb_fallback_step3:"Anrichten & genießen! 🍽️",
    // Nav
    nav_swipe:"Swipen",nav_favorites:"Favoriten",nav_shopping:"Liste",nav_settings:"Mehr",
    // Protein/Carbs/Fat labels
    lbl_protein:"PROTEIN",lbl_carbs:"CARBS",lbl_fat:"FETT",
    // Misc
    min:"Min",kcal:"kcal",recipes_loaded:"Rezepte geladen!",
    // Translation
    trans_loading:"Wird übersetzt...",trans_done:"Übersetzt",trans_tap:"Tippen zum Übersetzen",trans_need_key:"API Key in Einstellungen für Übersetzung",trans_btn:"Übersetzen",
    share_btn:"📤 Teilen",share_text:"Schau dir dieses Rezept an",share_via:"Rezept teilen",
    mood_seasonal:"🌿 Saisonal",portions_label:"Portionen",set_taste_profile:"DEIN GESCHMACKSPROFIL",set_cal_title:"KALORIENTRACKER",set_cal_goal:"Tagesziel",set_cal_reset:"Zurücksetzen",set_paar_title:"PAAR-MODUS",set_paar_sub:"Beide swipen abwechselnd. Bei gegenseitigem ❤️ gibt's ein MATCH!",set_paar_on:"💞 Paar-Modus aktiv",set_paar_off:"💞 Aktivieren",set_paar_person:"Aktiv als Person",set_paar_reset:"Likes zurücksetzen",
    // Allergen names
    al_Gluten:"Gluten",al_Milch:"Milch",al_Ei:"Ei",al_Nüsse:"Nüsse",al_Fisch:"Fisch",al_Soja:"Soja",al_Schalentiere:"Schalentiere",al_Sesam:"Sesam",
  },
  pl:{
    slot_morning:"Pomysły na śniadanie",slot_lunch:"Pomysły na obiad",slot_snack:"Szybkie przekąski",slot_dinner:"Pomysły na kolację",
    mood_time:"Wg pory dnia",mood_all:"Wszystko",mood_fast:"Szybkie",mood_protein:"Dużo białka",mood_veggie:"Wegetariańskie",mood_trending:"Popularne",mood_lowcal:"Mało kalorii",
    ob_tagline:"Swipuj, by odkryć swoje następne ulubione danie.",ob_name_placeholder:"Jak masz na imię?",ob_next:"Dalej →",
    ob_how_title:"Jak to działa 👆",ob_how_sub:"Proste jak Tinder – ale z jedzeniem!",
    ob_swipe_right:"Swipe w prawo",ob_swipe_right_sub:"Lubisz → dodaje do ulubionych",
    ob_swipe_left:"Swipe w lewo",ob_swipe_left_sub:"Nie chcesz → następne danie",
    ob_favorites:"Ulubione",ob_favorites_sub:"Wszystkie dania + przepisy",
    ob_shopping:"Lista zakupów",ob_shopping_sub:"Składniki zbierane automatycznie",
    ob_back:"← Wstecz",ob_start:"Zaczynamy 🚀",
    ob_lang_title:"Wybierz język 🌍",ob_lang_sub:"Możesz go zmienić w ustawieniach w każdej chwili.",
    mood_seasonal:"🌿 Sezonowe",portions_label:"Porcje",set_taste_profile:"TWÓJ PROFIL SMAKOWY",set_cal_title:"TRACKER KALORII",set_cal_goal:"Cel dzienny",set_cal_reset:"Resetuj",set_paar_title:"TRYB PARY",set_paar_sub:"Oboje swipujecie na zmianę. Wzajemne ❤️ = MATCH!",set_paar_on:"💞 Tryb pary aktywny",set_paar_off:"💞 Aktywuj",set_paar_person:"Aktywny jako Osoba",set_paar_reset:"Resetuj polubienia",
    swipe_nope:"NIE",swipe_like:"PYSZNE!",swipe_recipe:"👨‍🍳 Przepis",swipe_dishes:"Dania",swipe_own:"➕ Własne",
    swipe_no_recipes:"Brak przepisów",swipe_change_filter:"Wybierz inny filtr!",
    detail_ingredients:"🛒 Składniki",detail_steps:"👨‍🍳 Przygotowanie",
    detail_remove_fav:"🗑 Usuń z ulubionych",detail_add_fav:"❤️ Dodaj do ulubionych",
    detail_delete_custom:"🗑 Usuń własne danie",detail_back:"← Wstecz",
    detail_removed:"🗑 Usunięto",detail_saved_fav:"❤️ Ulubione!",
    fav_title:"Ulubione ❤️",fav_empty_title:"Brak ulubionych",fav_empty_sub:"Swipuj dania w prawo, aby je zapisać!",
    fav_history:"HISTORIA – dotknij, by otworzyć",fav_clear_history:"Wyczyść historię",
    shop_title:"Lista zakupów 🛒",shop_open:"do kupienia",shop_empty_sub:"Swipuj dania w prawo!",
    shop_clear:"🗑 Wyczyść listę",shop_clear_checked:"Usuń zaznaczone",
    set_title:"Ustawienia ⚙️",set_profile:"PROFIL",set_hey:"Hej",set_recipes:"Przepisy",set_favs:"Ulubione",set_seen:"widziane",
    set_mealdb_title:"🌍 THEMEALDB – DARMOWE PRZEPISY",set_mealdb_sub:"100% za darmo, bez konta! Załaduj międzynarodowe przepisy do aplikacji.",
    set_mealdb_loading:"⏳ Ładowanie...",set_mealdb_loaded:"przepisów załadowanych",set_mealdb_btn:"🍽️ Załaduj przepisy (za darmo!)",
    set_ai_title:"🤖 SKANER PRZEPISÓW AI (opcjonalnie)",set_ai_sub:"Zrób zdjęcie karty przepisu (HelloFresh itp.) – Claude automatycznie rozpozna składniki i kroki.",set_ai_sub2:"Utwórz klucz na",set_ai_sub3:".",
    set_ai_saved:"✅ Klucz API zapisany – skan gotowy!",set_ai_without:"Bez klucza: ręczne dodawanie przepisów",
    set_allergens:"WYKLUCZ ALERGENY",set_allergen_input:"Wpisz własny alergen...",set_allergen_add:"+ Dodaj",
    set_reset_seen:"🔄 Resetuj widziane",set_redo_onboarding:"Powtórz intro",
    set_lang_title:"🌍 JĘZYK / LANGUAGE",
    add_title:"Własne danie 🍳",add_photo:"📷 Zrób zdjęcie",add_gallery:"🖼️ Z galerii",
    add_scan:"🤖 Skanuj kartę przepisu",add_scanning:"⏳ Skanowanie...",add_scanned:"✅ Rozpoznano!",
    add_name:"NAZWA DANIA *",add_name_ph:"np. Bigos babci",add_time:"CZAS GOTOWANIA",add_time_ph:"np. 30 Min",
    add_meal:"KATEGORIA POSIŁKU *",add_nutrition:"WARTOŚCI ODŻYWCZE (na porcję)",
    add_cal:"KALORIE (kcal)",add_protein:"BIAŁKO (g)",add_carbs:"WĘGLOWODANY (g)",add_fat:"TŁUSZCZ (g)",
    add_ingredients:"SKŁADNIKI (oddzielone przecinkami: \"Makaron 200g, Mięso 300g\")",add_ingredients_ph:"Makaron 200g, Mięso 300g, Cebula 1 szt.",
    add_steps:"PRZYGOTOWANIE (każdy krok w nowej linii)",add_steps_ph:"Podsmaż cebulę.\nDodaj mięso.\nGotuj sos.\nPodawaj!",
    add_save:"Dodaj danie ✅",add_cancel:"Anuluj",
    add_err_name:"❌ Wpisz nazwę dania!",add_err_meal:"❌ Wybierz kategorię!",add_success:"✅ Danie dodane!",
    meal_breakfast:"🌅 Śniadanie",meal_lunch:"☀️ Obiad",meal_dinner:"🌙 Kolacja",meal_snack:"🍎 Przekąska",
    toast_already_saved:"jest już zapisane!",toast_saved:"zapisane!",toast_shuffled:"🔀 Wymieszane!",toast_api_error:"❌ Błąd API – sprawdź internet",
    toast_allergen_added:"dodano",toast_reset:"🔄 Zresetowano!",
    mdb_default_amount:"wg potrzeby",mdb_fallback_step1:"Przygotuj wszystkie składniki.",mdb_fallback_step2:"Wykonaj przepis krok po kroku.",mdb_fallback_step3:"Podawaj i smacznego! 🍽️",
    nav_swipe:"Swipuj",nav_favorites:"Ulubione",nav_shopping:"Lista",nav_settings:"Więcej",
    lbl_protein:"BIAŁKO",lbl_carbs:"WĘGL.",lbl_fat:"TŁUSZCZ",
    min:"Min",kcal:"kcal",recipes_loaded:"przepisów załadowanych!",
    trans_loading:"Tłumaczenie...",trans_done:"Przetłumaczono",trans_tap:"Dotknij, aby przetłumaczyć",trans_need_key:"Klucz API w ustawieniach do tłumaczenia",trans_btn:"Tłumacz",
    share_btn:"📤 Udostępnij",share_text:"Sprawdź ten przepis",share_via:"Udostępnij przepis",
    al_Gluten:"Gluten",al_Milch:"Mleko",al_Ei:"Jajka",al_Nüsse:"Orzechy",al_Fisch:"Ryby",al_Soja:"Soja",al_Schalentiere:"Skorupiaki",al_Sesam:"Sezam",
  },
  ru:{
    slot_morning:"Идеи для завтрака",slot_lunch:"Идеи для обеда",slot_snack:"Быстрые перекусы",slot_dinner:"Идеи для ужина",
    mood_time:"По времени",mood_all:"Всё",mood_fast:"Быстро",mood_protein:"Много белка",mood_veggie:"Вегетарианское",mood_trending:"В тренде",mood_lowcal:"Мало калорий",
    ob_tagline:"Свайпай, чтобы найти своё следующее любимое блюдо.",ob_name_placeholder:"Как тебя зовут?",ob_next:"Далее →",
    ob_how_title:"Как это работает 👆",ob_how_sub:"Просто как Тиндер – только с едой!",
    ob_swipe_right:"Свайп вправо",ob_swipe_right_sub:"Нравится → в избранное",
    ob_swipe_left:"Свайп влево",ob_swipe_left_sub:"Не хочу → следующее блюдо",
    ob_favorites:"Избранное",ob_favorites_sub:"Все блюда + рецепты",
    ob_shopping:"Список покупок",ob_shopping_sub:"Ингредиенты собираются автоматически",
    ob_back:"← Назад",ob_start:"Поехали 🚀",
    ob_lang_title:"Выберите язык 🌍",ob_lang_sub:"Можно изменить в настройках в любое время.",
    swipe_nope:"НЕТ",swipe_like:"ВКУСНО!",swipe_recipe:"👨‍🍳 Рецепт",swipe_dishes:"Блюда",swipe_own:"➕ Своё",
    swipe_no_recipes:"Нет рецептов",swipe_change_filter:"Выберите другой фильтр!",
    detail_ingredients:"🛒 Ингредиенты",detail_steps:"👨‍🍳 Приготовление",
    detail_remove_fav:"🗑 Убрать из избранного",detail_add_fav:"❤️ В избранное",
    detail_delete_custom:"🗑 Удалить своё блюдо",detail_back:"← Назад",
    detail_removed:"🗑 Удалено",detail_saved_fav:"❤️ В избранном!",
    fav_title:"Избранное ❤️",fav_empty_title:"Пока пусто",fav_empty_sub:"Свайпайте блюда вправо, чтобы сохранить!",
    fav_history:"ИСТОРИЯ – нажмите, чтобы открыть",fav_clear_history:"Очистить историю",
    shop_title:"Список покупок 🛒",shop_open:"осталось",shop_empty_sub:"Свайпайте блюда вправо!",
    shop_clear:"🗑 Очистить список",shop_clear_checked:"Удалить купленное",
    set_title:"Настройки ⚙️",set_profile:"ПРОФИЛЬ",set_hey:"Привет",set_recipes:"Рецепты",set_favs:"Избранное",set_seen:"просмотрено",
    set_mealdb_title:"🌍 THEMEALDB – БЕСПЛАТНЫЕ РЕЦЕПТЫ",set_mealdb_sub:"100% бесплатно, без регистрации! Загружай международные рецепты в приложение.",
    set_mealdb_loading:"⏳ Загрузка...",set_mealdb_loaded:"рецептов загружено",set_mealdb_btn:"🍽️ Загрузить рецепты (бесплатно!)",
    set_ai_title:"🤖 AI-СКАНЕР РЕЦЕПТОВ (опционально)",set_ai_sub:"Сфотографируй карточку рецепта (HelloFresh и т.д.) – Claude автоматически распознает ингредиенты и шаги.",set_ai_sub2:"Создай ключ на",set_ai_sub3:".",
    set_ai_saved:"✅ API ключ сохранён – сканер готов!",set_ai_without:"Без ключа: добавлять рецепты вручную",
    set_allergens:"ИСКЛЮЧИТЬ АЛЛЕРГЕНЫ",set_allergen_input:"Введите свой аллерген...",set_allergen_add:"+ Добавить",
    mood_seasonal:"🌿 Сезонное",portions_label:"Порции",set_taste_profile:"ВАШИ ПРЕДПОЧТЕНИЯ",set_cal_title:"ТРЕКЕР КАЛОРИЙ",set_cal_goal:"Дневная цель",set_cal_reset:"Сбросить",set_paar_title:"РЕЖИМ ПАРЫ",set_paar_sub:"Оба свайпают по очереди. Взаимное ❤️ = МАТЧ!",set_paar_on:"💞 Режим пары активен",set_paar_off:"💞 Активировать",set_paar_person:"Активен как Персона",set_paar_reset:"Сбросить лайки",
    set_reset_seen:"🔄 Сбросить просмотренные",set_redo_onboarding:"Повторить введение",
    set_lang_title:"🌍 ЯЗЫК / LANGUAGE",
    add_title:"Своё блюдо 🍳",add_photo:"📷 Сделать фото",add_gallery:"🖼️ Из галереи",
    add_scan:"🤖 Сканировать рецепт",add_scanning:"⏳ Сканирование...",add_scanned:"✅ Распознано!",
    add_name:"НАЗВАНИЕ БЛЮДА *",add_name_ph:"напр. Мамин борщ",add_time:"ВРЕМЯ ГОТОВКИ",add_time_ph:"напр. 30 Мин",
    add_meal:"КАТЕГОРИЯ ПРИЁМА ПИЩИ *",add_nutrition:"ПИЩЕВАЯ ЦЕННОСТЬ (на порцию)",
    add_cal:"КАЛОРИИ (kcal)",add_protein:"БЕЛОК (г)",add_carbs:"УГЛЕВОДЫ (г)",add_fat:"ЖИРЫ (г)",
    add_ingredients:"ИНГРЕДИЕНТЫ (через запятую: \"Макароны 200г, Фарш 300г\")",add_ingredients_ph:"Макароны 200г, Фарш 300г, Лук 1 шт.",
    add_steps:"ПРИГОТОВЛЕНИЕ (каждый шаг с новой строки)",add_steps_ph:"Обжарить лук.\nДобавить фарш.\nТушить соус.\nПодавать!",
    add_save:"Добавить блюдо ✅",add_cancel:"Отмена",
    add_err_name:"❌ Введите название блюда!",add_err_meal:"❌ Выберите категорию!",add_success:"✅ Блюдо добавлено!",
    meal_breakfast:"🌅 Завтрак",meal_lunch:"☀️ Обед",meal_dinner:"🌙 Ужин",meal_snack:"🍎 Перекус",
    toast_already_saved:"уже сохранено!",toast_saved:"сохранено!",toast_shuffled:"🔀 Перемешано!",toast_api_error:"❌ Ошибка API – проверьте интернет",
    toast_allergen_added:"добавлен",toast_reset:"🔄 Сброшено!",
    mdb_default_amount:"по вкусу",mdb_fallback_step1:"Подготовить все ингредиенты.",mdb_fallback_step2:"Следовать рецепту пошагово.",mdb_fallback_step3:"Сервировать и наслаждаться! 🍽️",
    nav_swipe:"Свайп",nav_favorites:"Избранное",nav_shopping:"Список",nav_settings:"Ещё",
    lbl_protein:"БЕЛОК",lbl_carbs:"УГЛЕВ.",lbl_fat:"ЖИРЫ",
    min:"Мин",kcal:"kcal",recipes_loaded:"рецептов загружено!",
    trans_loading:"Перевод...",trans_done:"Переведено",trans_tap:"Нажмите для перевода",trans_need_key:"API ключ в настройках для перевода",trans_btn:"Перевести",
    share_btn:"📤 Поделиться",share_text:"Посмотри этот рецепт",share_via:"Поделиться рецептом",
    al_Gluten:"Глютен",al_Milch:"Молоко",al_Ei:"Яйца",al_Nüsse:"Орехи",al_Fisch:"Рыба",al_Soja:"Соя",al_Schalentiere:"Моллюски",al_Sesam:"Кунжут",
  }
};
const LANG_OPTIONS=[{id:"de",label:"🇩🇪 Deutsch"},{id:"pl",label:"🇵🇱 Polski"},{id:"ru",label:"🇷🇺 Русский"}];

const FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
const LOGO_URL = "/foodswift-logo.png";

// Direct per-recipe image URLs - each verified to match the dish
const IMG = {
  // ✅ Alle URLs verifiziert - passen zum Gericht
  teriyaki_bowl:  "https://images.unsplash.com/photo-1539755530862-00f623c00f52?w=800&q=80",
  carbonara:      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
  steak:          "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80",
  shakshuka:      "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&q=80",
  lachs:          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
  green_curry:    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
  greek_salad:    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
  egg_fried_rice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80",
  pancakes:       "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
  avocado_toast:  "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800&q=80",
  shawarma:       "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=800&q=80",
  smash_burger:   "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  overnight_oats: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80",
  buddha_bowl:    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  bulgogi:        "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80",
  granola:        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
  shrimp_bowl:    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
  pad_thai:       "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
  pizza:          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  french_toast:   "https://images.unsplash.com/photo-1484723091739-30990c20f6df?w=800&q=80",
  tikka_masala:   "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80",
  ramen:          "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
  sushi_bowl:     "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80",
  tacos:          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  pho:            "https://images.unsplash.com/photo-1582878826629-33b69f5a9f41?w=800&q=80",
  biryani:        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  falafel:        "https://images.unsplash.com/photo-1580584126903-c17d41830450?w=800&q=80",
  risotto:        "https://images.unsplash.com/photo-1633964913295-ceb43826e7c1?w=800&q=80",
  omelette:       "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80",
  lemon_chicken:  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80",
  gyoza:          "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80",
  hummus:         "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=800&q=80",
  tomatensuppe:   "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
  nachos:         "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80",
  waffles:        "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?w=800&q=80",
  chicken_wrap:   "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=800&q=80",
  schnitzel:      "https://images.unsplash.com/photo-1599921841143-819065a55cc5?w=800&q=80",
  bbq_chicken:    "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
  muffins:        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
  pasta_pesto:    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
  kimchi_rice:    "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
  smoothie_bowl:  "https://images.unsplash.com/photo-1494888427482-242d32babc0b?w=800&q=80",
  bbq_ribs:       "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  caprese:        "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80",
  pulled_pork:    "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80",
  eggs_benedict:  "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80",
  paella:         "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80",
  lo_mein:        "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80",
  quiche:         "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&q=80",
  bircher:        "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=800&q=80",
};

const R=(id,name,time,cal,protein,carbs,fat,meal,tags,src,srcColor,img,allergens,steps,ingredients)=>({id,name,time,cal,protein,carbs,fat,meal,tags,src,srcColor,img,allergens,steps,ingredients});

const LOCAL_RECIPES=[
  R(1,"Teriyaki Chicken Bowl","25 Min",540,42,48,12,["lunch","dinner"],["Hähnchen","Protein"],"HelloFresh","#7cb518",IMG.teriyaki_bowl,["Soja","Sesam"],
    ["Reis 15 Min kochen.","Hähnchen würfeln, salzen & pfeffern.","Sojasoße, Honig, Ingwer zu Marinade rühren.","Hähnchen 4-5 Min goldbraun anbraten.","Marinade dazu, 2-3 Min einkochen.","Anrichten, mit Sesam & Frühlingszwiebeln bestreuen."],
    [{name:"Hähnchenbrust",amount:"300g"},{name:"Jasminreis",amount:"150g"},{name:"Sojasoße",amount:"3 EL"},{name:"Honig",amount:"2 EL"},{name:"Sesam",amount:"1 TL"},{name:"Ingwer",amount:"1 Stück"}]),
  R(2,"Spaghetti Carbonara","20 Min",680,28,72,28,["lunch","dinner"],["Pasta","Klassiker"],"YouTube","#cc0000",IMG.carbonara,["Gluten","Ei","Milch"],
    ["Pasta kochen, 1 Tasse Nudelwasser aufheben!","Guanciale in kalter Pfanne knusprig braten.","Eier + Pecorino + Pfeffer verquirlen.","Pfanne vom Herd, Pasta rein.","Ei-Mix unterrühren, mit Nudelwasser cremig machen.","Sofort servieren!"],
    [{name:"Spaghetti",amount:"200g"},{name:"Guanciale",amount:"100g"},{name:"Pecorino",amount:"60g"},{name:"Eier",amount:"3 Stück"},{name:"Schwarzer Pfeffer",amount:"reichlich"}]),
  R(3,"Beef Steak & Gemüse","30 Min",620,55,18,32,["dinner"],["Rind","Protein"],"HelloFresh","#7cb518",IMG.steak,[],
    ["Steak 30 Min auf Raumtemperatur kommen lassen.","Gemüse mit Öl + Gewürzen bei 200°C 20 Min rösten.","Pfanne sehr heiß, Steak 2-3 Min pro Seite anbraten.","5 Min ruhen lassen – nicht anschneiden!","Aufschneiden, mit Gemüse servieren."],
    [{name:"Rindersteak",amount:"250g"},{name:"Broccoli",amount:"200g"},{name:"Karotten",amount:"2 Stück"},{name:"Olivenöl",amount:"2 EL"},{name:"Rosmarin",amount:"2 Zweige"}]),
  R(4,"Shakshuka","20 Min",380,22,28,18,["breakfast","lunch"],["Vegetarisch","Eier"],"YouTube","#cc0000",IMG.shakshuka,["Ei"],
    ["Zwiebel + Paprika 5 Min dünsten.","Knoblauch + Kreuzkümmel 1 Min anrösten.","Tomaten dazu, 5 Min köcheln & würzen.","4 Mulden in Sauce drücken, Eier reingleiten lassen.","Deckel drauf, 5-7 Min bei niedriger Hitze.","Mit frischem Koriander & Fladenbrot servieren."],
    [{name:"Eier",amount:"4 Stück"},{name:"Tomaten Dose",amount:"400g"},{name:"Paprika",amount:"2 Stück"},{name:"Zwiebel",amount:"1 Stück"},{name:"Kreuzkümmel",amount:"1 TL"}]),
  R(5,"Lachs Teriyaki","25 Min",510,46,22,24,["lunch","dinner"],["Fisch","Protein"],"HelloFresh","#7cb518",IMG.lachs,["Fisch","Soja"],
    ["Teriyaki-Sauce aus Sojasoße, Mirin & Zucker rühren.","Lachs trocken tupfen, Haut zuerst in heiße Pfanne.","3-4 Min bis Haut knusprig, dann wenden.","Sauce dazugeben, 2-3 Min glasieren.","Mit Jasminreis & Frühlingszwiebeln servieren."],
    [{name:"Lachsfilet",amount:"200g"},{name:"Sojasoße",amount:"3 EL"},{name:"Mirin",amount:"2 EL"},{name:"Jasminreis",amount:"150g"},{name:"Frühlingszwiebeln",amount:"2 Stück"}]),
  R(6,"Thai Green Curry","35 Min",580,34,44,26,["dinner"],["Thai","Scharf"],"YouTube","#cc0000",IMG.green_curry,["Nüsse"],
    ["Curry-Paste in Kokosöl 1 Min anrösten bis es duftet.","Hähnchen dazu, 3 Min anbraten.","Kokosmilch angießen, aufkochen.","Zucchini & Gemüse dazu, 10 Min köcheln.","Mit Fischsoße & Limette abschmecken.","Mit Jasminreis & Thai-Basilikum servieren."],
    [{name:"Hähnchenbrust",amount:"300g"},{name:"Kokosmilch",amount:"400ml"},{name:"Grüne Curry Paste",amount:"2 EL"},{name:"Jasminreis",amount:"150g"},{name:"Zucchini",amount:"1 Stück"}]),
  R(7,"Greek Salad Bowl","15 Min",420,38,14,22,["lunch","snack"],["Salat","Protein"],"Eigene DB","#9b59b6",IMG.greek_salad,["Milch"],
    ["Hähnchen mit Oregano & Olivenöl würzen, grillen.","Gurke & Tomaten würfeln, Paprika in Streifen.","Alles mischen, mit Olivenöl + Zitrone anmachen.","Feta in Stücken drüber bröckeln.","Gegrilltes Hähnchen drauflegen.","Mit Oliven & Pita servieren."],
    [{name:"Hähnchenbrust",amount:"200g"},{name:"Feta",amount:"80g"},{name:"Gurke",amount:"0.5 Stück"},{name:"Oliven",amount:"50g"},{name:"Olivenöl",amount:"2 EL"}]),
  R(8,"Egg Fried Rice","20 Min",490,20,68,16,["lunch","dinner","snack"],["Reis","Schnell"],"YouTube","#cc0000",IMG.egg_fried_rice,["Ei","Soja"],
    ["Wok auf maximale Hitze erhitzen.","Eier rein, schnell rühren, beiseite stellen.","Kalten Reis 3-4 Min scharf anrösten.","Erbsen & Frühlingszwiebeln 2 Min mitbraten.","Rührei wieder dazu, Sojasoße + Sesamöl.","Sofort servieren – wird schnell schlechter!"],
    [{name:"Gekochter Reis (Vortag)",amount:"300g"},{name:"Eier",amount:"3 Stück"},{name:"Sojasoße",amount:"2 EL"},{name:"Erbsen",amount:"80g"},{name:"Sesamöl",amount:"1 TL"}]),
  R(9,"Protein Pancakes","15 Min",440,40,42,10,["breakfast"],["Frühstück","Protein"],"KI-Vorschlag","#ff6b35",IMG.pancakes,["Ei","Milch","Gluten"],
    ["Hafermehl + Proteinpulver + Backpulver mischen.","Eier + zerdrückte Banane + Milch verrühren.","Trockene + feuchte Zutaten zusammenmischen.","In Butterpfanne bei mittlerer Hitze je 2-3 Min backen.","Warten bis Blasen entstehen, dann wenden.","Mit frischen Beeren & Ahornsirup servieren."],
    [{name:"Proteinpulver",amount:"60g"},{name:"Haferflocken gemahlen",amount:"100g"},{name:"Eier",amount:"2 Stück"},{name:"Banane",amount:"1 Stück"},{name:"Milch",amount:"100ml"}]),
  R(10,"Avocado Toast Deluxe","10 Min",390,14,34,24,["breakfast","snack"],["Vegetarisch","Schnell"],"KI-Vorschlag","#ff6b35",IMG.avocado_toast,["Gluten","Ei"],
    ["Brot goldbraun toasten.","Avocado mit Zitronensaft, Salz & Chilliflocken zerdrücken.","Wasser mit Essig erhitzen, Ei pochieren.","4 Min pochieren, mit Schaumkelle herausheben.","Avocado-Creme auf Toast streichen.","Pochiertes Ei drauf, mit Meersalz & Microgreens garnieren."],
    [{name:"Sauerteigbrot",amount:"2 Scheiben"},{name:"Avocado",amount:"1 Stück"},{name:"Eier",amount:"2 Stück"},{name:"Zitronensaft",amount:"1 TL"},{name:"Chilliflocken",amount:"1 Prise"}]),
  R(11,"Hähnchen Shawarma","30 Min",580,44,52,20,["lunch","dinner"],["Hähnchen","Wrap"],"YouTube","#cc0000",IMG.shawarma,["Gluten","Milch"],
    ["Hähnchen mit Shawarma-Gewürz, Öl & Zitrone marinieren.","Mind. 30 Min marinieren lassen.","5-6 Min pro Seite goldbraun braten.","Tomaten & Gurke kleinschneiden.","Joghurt-Knoblauch-Sauce rühren.","Flatbread erwärmen, belegen & einwickeln."],
    [{name:"Hähnchenbrust",amount:"300g"},{name:"Flatbread",amount:"2 Stück"},{name:"Joghurt-Sauce",amount:"3 EL"},{name:"Tomaten",amount:"2 Stück"},{name:"Shawarma-Gewürz",amount:"2 TL"}]),
  R(12,"Smash Burger","20 Min",680,42,48,34,["lunch","dinner"],["Burger","Rind"],"YouTube","#cc0000",IMG.smash_burger,["Gluten","Milch","Ei"],
    ["Hackfleisch zu 2 Kugeln formen – NICHT würzen!","Gusseisenpfanne auf maximale Hitze bringen.","Kugel rein, sofort mit schwerem Pfannenwender platt drücken.","30 Sek warten bis Kruste entsteht, dann wenden.","Cheddar drauf, 30 Sek schmelzen lassen.","Buns toasten, mit Special Sauce belegen & servieren."],
    [{name:"Rinderhackfleisch 80/20",amount:"200g"},{name:"Brioche Bun",amount:"1 Stück"},{name:"Cheddar",amount:"2 Scheiben"},{name:"Salat & Tomate",amount:"nach Wahl"},{name:"Special Sauce",amount:"2 EL"}]),
  R(13,"Overnight Oats","5 Min",380,18,56,10,["breakfast"],["Frühstück","Meal Prep"],"Eigene DB","#9b59b6",IMG.overnight_oats,["Gluten","Milch"],
    ["Haferflocken in ein Glas oder Schüssel geben.","Milch + Joghurt + Chiasamen dazugeben.","Honig + Vanille-Extrakt einrühren.","Gut vermischen, Deckel drauf.","Über Nacht (mind. 6 Std) in den Kühlschrank.","Morgens mit Beeren + Granola toppen & genießen!"],
    [{name:"Haferflocken",amount:"80g"},{name:"Milch",amount:"200ml"},{name:"Chiasamen",amount:"1 EL"},{name:"Honig",amount:"1 EL"},{name:"Beeren",amount:"100g"}]),
  R(14,"Veggie Buddha Bowl","20 Min",430,18,62,16,["lunch","snack"],["Vegetarisch","Bowl"],"Eigene DB","#9b59b6",IMG.buddha_bowl,["Sesam"],
    ["Quinoa in Gemüsebrühe 15 Min kochen.","Süßkartoffel würfeln, mit Paprikaöl bei 200°C 20 Min rösten.","Kichererbsen mit Kreuzkümmel in Pfanne knusprig braten.","Tahini + Zitrone + Knoblauch zu Dressing rühren.","Bowl aufbauen: Quinoa als Basis.","Alles bunt anrichten, Dressing großzügig drüber."],
    [{name:"Kichererbsen",amount:"200g"},{name:"Süßkartoffel",amount:"1 Stück"},{name:"Quinoa",amount:"100g"},{name:"Tahini",amount:"2 EL"},{name:"Spinat",amount:"80g"}]),
  R(15,"Beef Bulgogi","35 Min",560,48,38,22,["dinner"],["Korea","Rind"],"YouTube","#cc0000",IMG.bulgogi,["Soja","Sesam"],
    ["Rindfleisch sehr dünn schneiden (halb gefroren = einfacher!).","Marinade: Sojasoße + geriebene Birne + Sesamöl + Zucker.","Mind. 30 Min marinieren, besser 2 Stunden.","Wok sehr heiß, Fleisch PORTIONSWEISE anbraten.","2-3 Min – soll leicht karamellisieren.","Mit Jasminreis + Kimchi + Sesam servieren."],
    [{name:"Rindfleisch dünn geschnitten",amount:"300g"},{name:"Sojasoße",amount:"4 EL"},{name:"Sesamöl",amount:"2 EL"},{name:"Jasminreis",amount:"150g"},{name:"Birne gerieben",amount:"0.5 Stück"}]),
  R(16,"Joghurt Granola Bowl","5 Min",320,20,42,8,["breakfast","snack"],["Frühstück","Schnell"],"Eigene DB","#9b59b6",IMG.granola,["Milch","Gluten","Nüsse"],
    ["Griechischen Joghurt in eine tiefe Schüssel geben.","Mit etwas Honig süßen und kurz verrühren.","Granola großzügig drüber streuen.","Frische Beeren verteilen.","Chiasamen & Mandelblättchen drüber.","Sofort essen – Granola wird sonst weich!"],
    [{name:"Griech. Joghurt",amount:"200g"},{name:"Granola",amount:"50g"},{name:"Honig",amount:"1 EL"},{name:"Beeren",amount:"80g"},{name:"Chiasamen",amount:"1 TL"}]),
  R(17,"Mango Shrimp Bowl","25 Min",480,36,54,14,["lunch","dinner"],["Meeresfrüchte","Sommer"],"KI-Vorschlag","#ff6b35",IMG.shrimp_bowl,["Schalentiere"],
    ["Basmatireis kochen.","Mango in Würfel schneiden, Limette auspressen.","Garnelen in heißer Pfanne 2 Min pro Seite braten.","Mango + Limettensaft + Chili + Koriander zu Salsa.","Reis in Bowl, Garnelen drauf.","Mango-Salsa großzügig verteilen & servieren."],
    [{name:"Garnelen",amount:"250g"},{name:"Mango",amount:"1 Stück"},{name:"Basmatireis",amount:"150g"},{name:"Koriander",amount:"0.5 Bund"},{name:"Limette",amount:"1 Stück"}]),
  R(18,"Pad Thai","25 Min",560,28,72,18,["lunch","dinner"],["Thai","Nudeln"],"YouTube","#cc0000",IMG.pad_thai,["Gluten","Soja","Ei"],
    ["Reisnudeln nur einweichen – NICHT kochen!","Sauce mischen: Tamarinde + Fischsoße + Zucker (1:1:1).","Garnelen 2 Min in heißem Wok anbraten.","Eier rein, scramble, mit Garnelen mischen.","Nudeln + Sauce dazu, 2-3 Min bei hoher Hitze rühren.","Mit Erdnüssen, Bohnenkeim & Limette servieren."],
    [{name:"Reisnudeln",amount:"200g"},{name:"Garnelen",amount:"150g"},{name:"Eier",amount:"2 Stück"},{name:"Tamarindenpaste",amount:"2 EL"},{name:"Erdnüsse",amount:"40g"}]),
  R(19,"Pizza Margherita","25 Min",620,22,80,22,["lunch","dinner"],["Pizza","Vegetarisch"],"KI-Vorschlag","#ff6b35",IMG.pizza,["Gluten","Milch"],
    ["Ofen auf 250°C vorheizen – so heiß wie möglich!","Teig auf bemehlter Fläche dünn ausrollen.","Tomatensoße mit Olivenöl & Salz dünn auftragen.","Mozzarella in Stücke reißen (nicht schneiden!) & verteilen.","Auf heißem Blech 8-10 Min backen bis Rand goldbraun.","Frischen Basilikum erst NACH dem Backen drauflegen!"],
    [{name:"Pizzateig",amount:"1 Stück"},{name:"Tomatensoße",amount:"100ml"},{name:"Mozzarella",amount:"150g"},{name:"Basilikum",amount:"1 Bund"},{name:"Olivenöl",amount:"1 EL"}]),
  R(20,"French Toast","15 Min",480,16,62,18,["breakfast"],["Frühstück","Süß"],"KI-Vorschlag","#ff6b35",IMG.french_toast,["Gluten","Ei","Milch"],
    ["Eier + Milch + Zimt + Vanille verquirlen.","Brotscheiben 30 Sek pro Seite einweichen.","Butter in Pfanne bei mittlerer Hitze schmelzen.","Brot einlegen, 2-3 Min goldbraun braten.","Wenden, weitere 2 Min backen.","Mit Puderzucker, Ahornsirup & Beeren servieren."],
    [{name:"Toastbrot",amount:"4 Scheiben"},{name:"Eier",amount:"3 Stück"},{name:"Milch",amount:"100ml"},{name:"Zimt",amount:"1 TL"},{name:"Ahornsirup",amount:"2 EL"}]),
  R(21,"Chicken Tikka Masala","40 Min",590,42,36,28,["dinner"],["Indien","Hähnchen"],"YouTube","#cc0000",IMG.tikka_masala,["Milch"],
    ["Hähnchen in Joghurt + Tikka-Gewürz mind. 1 Std marinieren.","Scharf anbraten bis Röstaromen entstehen, beiseitestellen.","Zwiebeln goldbraun, Knoblauch & Ingwer 2 Min dazu.","Tomaten + Gewürze, 10 Min köcheln.","Sahne einrühren, Hähnchen dazu, 10 Min ziehen lassen.","Mit Basmatireis & Naan servieren. Koriander drüber!"],
    [{name:"Hähnchenbrust",amount:"300g"},{name:"Tomaten Dose",amount:"400g"},{name:"Sahne",amount:"100ml"},{name:"Tikka-Gewürz",amount:"2 EL"},{name:"Basmatireis",amount:"150g"}]),
  R(22,"Tonkotsu Ramen","45 Min",640,38,66,26,["dinner"],["Japan","Nudeln"],"YouTube","#cc0000",IMG.ramen,["Gluten","Ei","Soja"],
    ["Eier 6:30 Min kochen, in Eiswasser abschrecken, in Sojasoße marinieren.","Tonkotsu-Brühe aufkochen, mit Miso & Sojasoße würzen.","Ramen-Nudeln nach Packung kochen.","Brühe in tiefe Schüsseln füllen.","Nudeln einlegen, Chashu-Scheiben drauflegen.","Ei halbieren, mit Nori & Frühlingszwiebeln garnieren."],
    [{name:"Ramen-Nudeln",amount:"180g"},{name:"Tonkotsu-Brühe",amount:"400ml"},{name:"Mariniertes Ei",amount:"2 Stück"},{name:"Chashu-Schwein",amount:"100g"},{name:"Nori",amount:"2 Blatt"}]),
  R(23,"Sushi Bowl","20 Min",480,30,62,12,["lunch","dinner"],["Japan","Fisch"],"KI-Vorschlag","#ff6b35",IMG.sushi_bowl,["Fisch","Soja","Sesam"],
    ["Sushireis kochen, mit Reisessig + Zucker + Salz würzen.","Lachs in dünne Scheiben schneiden (Sushi-Qualität!).","Gurke in Scheiben, Avocado in Spalten schneiden.","Reis in Bowl, Sesam drüber streuen.","Lachs, Avocado & Gurke schön anrichten.","Mit Sojasoße, Sriracha-Mayo & Wasabi servieren."],
    [{name:"Sushireis",amount:"200g"},{name:"Lachs (roh, Sushi-Qual.)",amount:"150g"},{name:"Avocado",amount:"1 Stück"},{name:"Gurke",amount:"0.5 Stück"},{name:"Sriracha-Mayo",amount:"2 EL"}]),
  R(24,"Tacos al Pastor","30 Min",540,32,58,20,["lunch","dinner"],["Mexiko","Schwein"],"YouTube","#cc0000",IMG.tacos,["Gluten"],
    ["Schweinefleisch mit Chili, Cumin & Achiote marinieren.","In sehr heißer Pfanne 3-4 Min pro Seite anbraten.","Ananasscheiben kurz mitgrillen bis karamellisiert.","Tortillas in trockener Pfanne erwärmen.","Fleisch + Ananas in die Tortilla legen.","Mit Koriander, Zwiebel & Limette servieren. Salsa optional!"],
    [{name:"Schweinefleisch",amount:"300g"},{name:"Mais-Tortillas",amount:"6 Stück"},{name:"Ananas",amount:"100g"},{name:"Koriander",amount:"0.5 Bund"},{name:"Chilipulver",amount:"2 TL"}]),
  R(25,"Pho Bo","60 Min",420,32,52,10,["lunch","dinner"],["Vietnam","Suppe"],"YouTube","#cc0000",IMG.pho,["Gluten","Soja"],
    ["Rinderbrühe mit Sternanis, Zimt & Ingwer 30 Min köcheln.","Reisnudeln 5 Min einweichen, abgießen.","Rindfleisch sehr dünn schneiden (halb gefroren einfacher).","Brühe durch Sieb gießen, mit Fischsoße abschmecken.","Nudeln in Schüsseln, heiße Brühe drüber gießen.","Rohes Fleisch drauflegen – gart in der heißen Brühe!"],
    [{name:"Reisnudeln",amount:"200g"},{name:"Rinderbrühe",amount:"600ml"},{name:"Rindfleisch (dünn)",amount:"200g"},{name:"Bohnenkeim",amount:"80g"},{name:"Sternanis",amount:"2 Stück"}]),
  R(26,"Chicken Biryani","50 Min",620,42,68,18,["dinner"],["Indien","Hähnchen"],"YouTube","#cc0000",IMG.biryani,["Milch"],
    ["Hähnchen mit Biryani-Gewürz + Joghurt 1 Std marinieren.","Basmatireis vorkochen (halbgar), abgießen.","Hähnchen in Ghee goldbraun anbraten.","Schichten: Reis – Hähnchen – Röstzwiebeln – Reis.","Safranmilch drüber, abgedeckt 20 Min bei 160°C.","Mit Raita & frischer Minze servieren."],
    [{name:"Hähnchenbrust",amount:"400g"},{name:"Basmatireis",amount:"300g"},{name:"Joghurt",amount:"150g"},{name:"Biryani-Gewürz",amount:"2 EL"},{name:"Safran",amount:"1 Prise"}]),
  R(27,"Falafel Wrap","25 Min",510,18,68,20,["lunch","snack"],["Nahostküche","Vegetarisch"],"Eigene DB","#9b59b6",IMG.falafel,["Gluten","Sesam"],
    ["Kichererbsen + Zwiebel + Petersilie + Gewürze im Mixer zerkleinern.","Zu kleinen Bällchen formen, in Mehl wälzen.","In heißem Öl 3-4 Min goldbraun frittieren.","Tzatziki aus Joghurt, Gurke, Knoblauch & Dill rühren.","Pita anwärmen, Hummus einstreichen.","Falafel + Tzatziki + Gemüse einfüllen & einwickeln."],
    [{name:"Falafel",amount:"6 Stück"},{name:"Pita-Brot",amount:"2 Stück"},{name:"Hummus",amount:"3 EL"},{name:"Tzatziki",amount:"3 EL"},{name:"Tomaten + Gurke",amount:"nach Wahl"}]),
  R(28,"Pilz-Risotto","40 Min",550,16,74,18,["dinner"],["Vegetarisch","Risotto"],"HelloFresh","#7cb518",IMG.risotto,["Milch"],
    ["Brühe warm halten. Zwiebel in Butter glasig dünsten.","Arborio-Reis dazu, 2 Min unter Rühren anrösten.","Weißwein angießen, komplett einkochen lassen.","Schöpfkelle für Schöpfkelle Brühe zugeben – immer rühren! Ca. 18 Min.","Pilze separat in Butter goldbraun anbraten.","Parmesan + kalte Butter unterrühren, Pilze drauf – sofort servieren!"],
    [{name:"Arborio-Reis",amount:"200g"},{name:"Champignons",amount:"250g"},{name:"Parmesan",amount:"60g"},{name:"Weißwein",amount:"100ml"},{name:"Gemüsebrühe",amount:"600ml"}]),
  R(29,"Spinat-Omelette","10 Min",320,28,6,20,["breakfast","snack"],["Frühstück","Protein"],"Eigene DB","#9b59b6",IMG.omelette,["Ei","Milch"],
    ["Eier mit Salz, Pfeffer & Milch verquirlen.","Butter in beschichteter Pfanne bei mittlerer Hitze schmelzen.","Eimasse einfüllen, Pfanne schwenken.","Wenn Ränder fest werden: Spinat + Feta auf eine Hälfte.","Zusammenklappen.","Auf Teller gleiten lassen – mit Tomaten servieren."],
    [{name:"Eier",amount:"3 Stück"},{name:"Spinat",amount:"80g"},{name:"Feta",amount:"40g"},{name:"Tomaten",amount:"1 Stück"},{name:"Butter",amount:"1 EL"}]),
  R(30,"Lemon Herb Chicken","30 Min",460,48,8,24,["lunch","dinner"],["Hähnchen","Keto"],"HelloFresh","#7cb518",IMG.lemon_chicken,[],
    ["Marinade: Olivenöl + Zitronenschale & -saft + Knoblauch + Thymian + Senf.","Hähnchen mind. 30 Min marinieren.","Ofen auf 200°C vorheizen.","35-40 Min backen bis Haut goldbraun & knusprig.","Kerntemperatur prüfen: 75°C = perfekt.","Mit geröstetem Gemüse oder frischem Salat servieren."],
    [{name:"Hähnchenschenkel",amount:"400g"},{name:"Zitrone",amount:"2 Stück"},{name:"Knoblauch",amount:"4 Zehen"},{name:"Thymian",amount:"4 Zweige"},{name:"Dijon Senf",amount:"1 EL"}]),
  R(31,"Gyoza","30 Min",380,22,42,14,["lunch","dinner","snack"],["Japan","Fingerfood"],"YouTube","#cc0000",IMG.gyoza,["Gluten","Soja"],
    ["Füllung: Hackfleisch + Kohl + Ingwer + Sojasoße mischen.","Je 1 TL Füllung in Teigblatt mittig setzen.","Ränder befeuchten, falten & gut andrücken.","In Pfanne mit Öl goldbraun anbraten (Boden).","Wasser angießen, Deckel drauf – 3 Min dämpfen.","Mit Ponzu- oder Gyoza-Dipsoße servieren."],
    [{name:"Gyoza-Blätter",amount:"20 Stück"},{name:"Schweinehackfleisch",amount:"200g"},{name:"Chinakohl",amount:"100g"},{name:"Ingwer",amount:"1 Stück"},{name:"Sojasoße",amount:"2 EL"}]),
  R(32,"Hummus Bowl","15 Min",410,18,52,16,["lunch","snack"],["Nahostküche","Vegetarisch"],"Eigene DB","#9b59b6",IMG.hummus,["Sesam"],
    ["Hummus auf großem Teller großzügig verteilen.","Mit dem Löffelrücken eine Mulde in die Mitte drücken.","Olivenöl in die Mulde laufen lassen.","Kichererbsen + Paprika + Gurke schön anrichten.","Mit Paprikapulver + Kreuzkümmel bestreuen.","Mit warmem Pita-Brot servieren."],
    [{name:"Hummus",amount:"200g"},{name:"Kichererbsen",amount:"100g"},{name:"Olivenöl",amount:"3 EL"},{name:"Paprikapulver",amount:"1 TL"},{name:"Pita",amount:"2 Stück"}]),
  R(33,"Tomatensuppe","25 Min",280,8,38,10,["lunch","dinner","snack"],["Vegetarisch","Suppe"],"HelloFresh","#7cb518",IMG.tomatensuppe,["Milch"],
    ["Zwiebel + Knoblauch in Olivenöl weich dünsten.","Dosentomaten + Gemüsebrühe dazu, aufkochen.","15 Min köcheln lassen.","Alles pürieren bis glatt.","Sahne einrühren, mit Salz & Pfeffer abschmecken.","Mit frischem Basilikum & Croutons servieren."],
    [{name:"Tomaten Dose",amount:"800g"},{name:"Gemüsebrühe",amount:"400ml"},{name:"Sahne",amount:"100ml"},{name:"Basilikum",amount:"1 Bund"},{name:"Zwiebel",amount:"1 Stück"}]),
  R(34,"Nachos Deluxe","20 Min",580,22,64,28,["snack","dinner"],["Mexiko","Fingerfood"],"YouTube","#cc0000",IMG.nachos,["Milch","Gluten"],
    ["Nachos auf Backblech verteilen.","Geriebenen Cheddar großzügig drüberstreuen.","Bei 180°C 8-10 Min bis Käse schmilzt & leicht bräunt.","Guacamole + Sauerrahm drauflegen.","Jalapeños + Kirschtomaten + Koriander drüber.","Sofort heiß servieren – wird schnell weich!"],
    [{name:"Nachos",amount:"200g"},{name:"Cheddar gerieben",amount:"150g"},{name:"Guacamole",amount:"100g"},{name:"Jalapeños",amount:"50g"},{name:"Sauerrahm",amount:"80g"}]),
  R(35,"Waffeln","20 Min",520,14,72,20,["breakfast","snack"],["Frühstück","Süß"],"KI-Vorschlag","#ff6b35",IMG.waffles,["Gluten","Ei","Milch"],
    ["Mehl + Backpulver + Zucker + Salz in Schüssel mischen.","Eier + Milch + geschmolzene Butter + Vanille einrühren.","Waffeleisen vorheizen und leicht einölen.","Teig einfüllen (nicht zu viel!), 3-4 Min backen.","Goldbraun herausnehmen.","Mit frischen Früchten, Puderzucker & Sirup servieren."],
    [{name:"Mehl",amount:"200g"},{name:"Eier",amount:"2 Stück"},{name:"Milch",amount:"250ml"},{name:"Butter",amount:"50g"},{name:"Backpulver",amount:"1 TL"}]),
  R(36,"Chicken Wrap","15 Min",490,38,48,16,["lunch","snack"],["Hähnchen","Schnell"],"Eigene DB","#9b59b6",IMG.chicken_wrap,["Gluten","Milch"],
    ["Hähnchen mit Paprika + Knoblauch würzen.","4 Min pro Seite in heißer Pfanne goldbraun braten.","In dünne Streifen schneiden.","Tortilla mit Joghurt-Knoblauch-Sauce bestreichen.","Hähnchen + Salat + Tomaten + Gurke darauflegen.","Fest einrollen, diagonal schneiden & servieren."],
    [{name:"Hähnchenbrust",amount:"250g"},{name:"Weizentortilla",amount:"2 Stück"},{name:"Joghurt-Sauce",amount:"3 EL"},{name:"Eisbergsalat",amount:"2 Blatt"},{name:"Tomaten",amount:"1 Stück"}]),
  R(37,"Wiener Schnitzel","25 Min",580,42,44,24,["lunch","dinner"],["Österreich","Klassiker"],"HelloFresh","#7cb518",IMG.schnitzel,["Gluten","Ei","Milch"],
    ["Kalbsschnitzel zwischen Frischhaltefolie dünn klopfen.","Durch Mehl – Ei – Semmelbrösel panieren.","Öl in Pfanne auf 170°C erhitzen.","Schnitzel 2-3 Min pro Seite goldbraun ausbacken.","Auf Küchenpapier abtropfen lassen.","Mit Zitronenspalte + Petersilienkartoffeln servieren."],
    [{name:"Kalbsschnitzel",amount:"300g"},{name:"Semmelbrösel",amount:"80g"},{name:"Eier",amount:"2 Stück"},{name:"Mehl",amount:"50g"},{name:"Zitrone",amount:"1 Stück"}]),
  R(38,"BBQ Chicken","35 Min",520,48,22,24,["dinner"],["BBQ","Hähnchen"],"YouTube","#cc0000",IMG.bbq_chicken,[],
    ["Hähnchen mit BBQ-Sauce + Paprika + Knoblauchpulver einreiben.","Mind. 30 Min marinieren, besser über Nacht.","Grill auf mittlere Hitze (ca. 180°C).","Hähnchen 6-7 Min pro Seite grillen.","Letzte 5 Min nochmals BBQ-Sauce auftragen & karamellisieren.","Mit Coleslaw & Maiskolben servieren."],
    [{name:"Hähnchenschenkel",amount:"400g"},{name:"BBQ-Sauce",amount:"100ml"},{name:"Paprikapulver",amount:"2 TL"},{name:"Knoblauchpulver",amount:"1 TL"}]),
  R(39,"Blueberry Muffins","30 Min",380,6,58,14,["breakfast","snack"],["Frühstück","Backen"],"KI-Vorschlag","#ff6b35",IMG.muffins,["Gluten","Ei","Milch"],
    ["Mehl + Backpulver + Zucker + Salz mischen.","Eier + Milch + geschmolzene Butter + Vanille verrühren.","Feuchte + trockene Zutaten NUR KURZ zusammenrühren (Klumpen OK!).","Blaubeeren vorsichtig unterheben.","Zu 2/3 in Muffinformen füllen.","Bei 190°C 20-22 Min backen – Stäbchenprobe!"],
    [{name:"Mehl",amount:"250g"},{name:"Blaubeeren",amount:"150g"},{name:"Eier",amount:"2 Stück"},{name:"Milch",amount:"120ml"},{name:"Zucker",amount:"100g"}]),
  R(40,"Pasta Pesto","15 Min",560,18,72,22,["lunch","dinner"],["Pasta","Schnell"],"Eigene DB","#9b59b6",IMG.pasta_pesto,["Gluten","Nüsse","Milch"],
    ["Pasta al dente kochen, 2 EL Nudelwasser aufheben.","Pesto mit Zitronensaft + etwas Olivenöl glatt rühren.","Pasta abgießen (nicht ausspülen!).","Pesto + Nudelwasser untermengen – macht es cremig!","Kirschtomaten halbieren & dazugeben.","Mit geriebenem Parmesan + Pinienkernen servieren."],
    [{name:"Penne oder Spaghetti",amount:"200g"},{name:"Basilikum-Pesto",amount:"4 EL"},{name:"Kirschtomaten",amount:"100g"},{name:"Parmesan",amount:"40g"},{name:"Pinienkerne",amount:"30g"}]),
  R(41,"Kimchi Fried Rice","20 Min",480,22,62,18,["lunch","dinner"],["Korea","Würzig"],"YouTube","#cc0000",IMG.kimchi_rice,["Soja","Ei"],
    ["Kimchi grob hacken.","In Pfanne mit Sesamöl bei mittlerer Hitze anbraten bis karamellisiert.","Kalten Reis dazu, kräftig anrösten (nicht rühren!).","Gochujang + Sojasoße einrühren.","Spiegelei separat braten.","Reis anrichten, Spiegelei drauflegen & mit Sesam bestreuen."],
    [{name:"Kimchi",amount:"200g"},{name:"Gekochter Reis (Vortag)",amount:"300g"},{name:"Eier",amount:"2 Stück"},{name:"Gochujang",amount:"1 EL"},{name:"Sojasoße",amount:"2 EL"}]),
  R(42,"Smoothie Bowl","10 Min",340,12,58,8,["breakfast","snack"],["Frühstück","Gesund"],"KI-Vorschlag","#ff6b35",IMG.smoothie_bowl,["Milch","Nüsse"],
    ["Gefrorene Beeren + Banane in den Mixer geben.","Nur wenig Kokosmilch – die Bowl soll DICK bleiben!","Mixen bis ganz glatt und cremig.","In eine Bowl füllen – Masse soll fest sein.","Granola, Beeren, Bananenscheiben & Chiasamen drauf.","Mandelmus in Streifen drüberträufeln – sofort essen!"],
    [{name:"Gefrorene Beeren",amount:"200g"},{name:"Banane (gefroren)",amount:"1 Stück"},{name:"Kokosmilch",amount:"80ml"},{name:"Granola",amount:"40g"},{name:"Chiasamen",amount:"1 EL"}]),
  R(43,"BBQ Ribs","120 Min",780,58,28,48,["dinner"],["BBQ","Schwein"],"YouTube","#cc0000",IMG.bbq_ribs,[],
    ["Silberhaut auf der Rückseite mit Messer lösen und abziehen.","Rub aus Paprika + braunem Zucker + Gewürzen einreiben.","Mind. 1 Std marinieren (besser über Nacht).","In Alufolie wickeln, 2 Std bei 150°C im Ofen schmoren.","Folie öffnen, BBQ-Sauce auftragen, 15 Min grillen bis karamellisiert.","An den Knochen schneiden & sofort servieren. Coleslaw dazu!"],
    [{name:"Schweinerippchen",amount:"800g"},{name:"BBQ-Sauce",amount:"150ml"},{name:"Paprikapulver",amount:"2 TL"},{name:"Brauner Zucker",amount:"2 EL"}]),
  R(44,"Caprese Salat","10 Min",320,18,12,22,["lunch","snack"],["Vegetarisch","Italienisch"],"Eigene DB","#9b59b6",IMG.caprese,["Milch"],
    ["Tomaten & Mozzarella in gleich dicke Scheiben schneiden.","Abwechselnd auf einer Platte überlappend anrichten.","Frische Basilikumblätter dazwischenstecken.","Großzügig bestes Olivenöl drüber.","Balsamico-Creme in feinen Streifen drüberträufeln.","Mit Meersalz + frischem Pfeffer würzen – fertig!"],
    [{name:"Große Tomaten",amount:"3 Stück"},{name:"Büffelmozzarella",amount:"250g"},{name:"Basilikum",amount:"1 Bund"},{name:"Olivenöl extra vergine",amount:"3 EL"},{name:"Balsamico-Creme",amount:"1 EL"}]),
  R(45,"Pulled Pork Sandwich","180 Min",680,48,62,26,["lunch","dinner"],["BBQ","Schwein"],"YouTube","#cc0000",IMG.pulled_pork,["Gluten"],
    ["Schweineschulter rundherum mit BBQ-Rub einreiben.","Bei 120°C (Niedrigtemperatur) 3-4 Std im Ofen schmoren.","Bis Kerntemperatur 90°C erreicht ist.","Fleisch mit 2 Gabeln auseinanderzupfen.","BBQ-Sauce untermengen, mit Salz abschmecken.","In Brioche-Buns mit Coleslaw & Pickles servieren."],
    [{name:"Schweineschulter",amount:"1 kg"},{name:"BBQ-Sauce",amount:"200ml"},{name:"Brioche Buns",amount:"4 Stück"},{name:"Coleslaw",amount:"150g"}]),
  R(46,"Eggs Benedict","25 Min",540,28,34,30,["breakfast"],["Frühstück","Klassiker"],"YouTube","#cc0000",IMG.eggs_benedict,["Gluten","Ei","Milch"],
    ["English Muffins golden toasten.","Hollandaise: Eigelb + Zitrone über Wasserbad aufschlagen, Butter langsam einrühren.","Wasser + Schuss Essig zum Sieden bringen (nicht kochen!).","Eier einzeln pochieren: 4 Min, dann herausheben.","Kochschinken auf Muffins, pochiertes Ei drauf.","Hollandaise großzügig drüber – sofort servieren!"],
    [{name:"English Muffins",amount:"2 Stück"},{name:"Eier",amount:"4 Stück"},{name:"Kochschinken",amount:"4 Scheiben"},{name:"Butter",amount:"100g"},{name:"Zitrone",amount:"0.5 Stück"}]),
  R(47,"Vegetarische Paella","45 Min",520,16,78,14,["lunch","dinner"],["Spanien","Vegetarisch"],"HelloFresh","#7cb518",IMG.paella,["Gluten"],
    ["Zwiebel + bunte Paprika + Knoblauch in Olivenöl anschwitzen.","Paella-Reis dazu, 2 Min unter Rühren anrösten.","Safran + Paprikapulver + Gemüsebrühe angießen.","20 Min köcheln – NICHT rühren!","Artischocken & Erbsen dekorativ einlegen.","Letzte 2 Min Hitze erhöhen für den Socarrat (Kruste)."],
    [{name:"Paella-Reis",amount:"300g"},{name:"Bunte Paprika",amount:"2 Stück"},{name:"Gemüsebrühe",amount:"600ml"},{name:"Safran",amount:"1 Prise"},{name:"Artischocken",amount:"100g"}]),
  R(48,"Lo Mein Noodles","25 Min",510,24,68,16,["lunch","dinner"],["China","Nudeln"],"YouTube","#cc0000",IMG.lo_mein,["Gluten","Soja"],
    ["Eiernudeln in Salzwasser kochen, abgießen.","Gemüse in sehr heißem Wok mit Öl 2 Min anbraten.","Hähnchen in Streifen dazu, 3 Min bei hoher Hitze.","Nudeln dazugeben.","Sojasoße + Austernsoße + Sesamöl einrühren.","2 Min alles zusammen bei hoher Hitze schwenken & servieren."],
    [{name:"Eiernudeln",amount:"200g"},{name:"Hähnchenbrust",amount:"200g"},{name:"Pak Choi",amount:"150g"},{name:"Sojasoße",amount:"3 EL"},{name:"Austernsoße",amount:"2 EL"}]),
  R(49,"Quiche Lorraine","45 Min",540,22,38,32,["lunch","dinner"],["Französisch","Klassiker"],"HelloFresh","#7cb518",IMG.quiche,["Gluten","Ei","Milch"],
    ["Mürbeteig in Quicheform drücken, mit Gabel einstechen, 10 Min vorbacken.","Speck in Würfeln knusprig braten, auf Teig verteilen.","Eier + Sahne + geriebenen Käse verquirlen, würzen.","Ei-Mix über den Speck gießen.","Bei 180°C 30 Min backen bis gestockt und goldbraun.","10 Min abkühlen, dann anschneiden & servieren."],
    [{name:"Mürbeteig",amount:"1 Rolle"},{name:"Speck gewürfelt",amount:"150g"},{name:"Eier",amount:"3 Stück"},{name:"Sahne",amount:"200ml"},{name:"Gruyère",amount:"80g"}]),

  R(51,"Baked Feta Pasta","25 Min",580,22,68,24,["lunch","dinner"],["TikTok","Pasta","Vegetarisch"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",["Milch","Gluten"],
    ["Ofen auf 200°C vorheizen.","Feta in die Mitte einer Auflaufform, Kirschtomaten drumherum verteilen.","Olivenöl, Knoblauch, Chiliflocken und Honig darüber.","25 Min backen bis Tomaten aufplatzen und Feta golden ist.","Alles mit einer Gabel zerdrücken und gut vermischen.","Gekochte Pasta unterheben, mit frischem Basilikum servieren."],
    [{name:"Feta",amount:"200g"},{name:"Kirschtomaten",amount:"400g"},{name:"Pasta (Penne)",amount:"250g"},{name:"Knoblauch",amount:"3 Zehen"},{name:"Basilikum",amount:"1 Bund"}]),

  R(52,"Smash Burger","15 Min",650,42,38,36,["lunch","dinner"],["Burger","Trending","Protein"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",["Gluten","Milch"],
    ["Hackfleisch in 4 Kugeln formen – NICHT würzen!","Gusseisenpfanne auf maximale Hitze bringen.","Kugel in die Pfanne, mit Spatel FLACH drücken (smash!).","Salz + Pfeffer JETZT drauf. 2 Min braten bis Kruste entsteht.","Umdrehen, Käse drauf, 1 Min fertig braten.","Auf getoastetem Brioche-Bun mit Pickles, Senf, Ketchup servieren."],
    [{name:"Rinderhack",amount:"400g"},{name:"Cheddar",amount:"4 Scheiben"},{name:"Brioche Buns",amount:"4 Stück"},{name:"Gewürzgurken",amount:"4 Stück"},{name:"Zwiebel",amount:"1 Stück"}]),

  R(53,"Dubai Schokoladen-Crêpes","20 Min",480,8,62,22,["breakfast","snack"],["Dessert","Viral","Schokolade"],"Instagram","#e4405f","https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80",["Gluten","Milch","Ei","Nüsse"],
    ["Crêpe-Teig: Mehl, Ei, Milch, Prise Salz glatt rühren.","Dünne Crêpes in beschichteter Pfanne ausbacken.","Pistaziencreme dünn auf warmem Crêpe verstreichen.","Gehackte Pistazien und Kadayif-Fäden darüber streuen.","Mit geschmolzener Schokolade beträufeln.","Einrollen, diagonal halbieren und sofort servieren."],
    [{name:"Mehl",amount:"100g"},{name:"Ei",amount:"1 Stück"},{name:"Milch",amount:"200ml"},{name:"Pistaziencreme",amount:"100g"},{name:"Zartbitterschokolade",amount:"50g"}]),

  R(54,"Birria Tacos","45 Min",620,38,42,32,["dinner"],["Mexikanisch","Trending","Fleisch"],"YouTube","#cc0000","https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800&q=80",["Gluten"],
    ["Rindfleisch in Würfel schneiden, mit Chipotle-Paste, Kreuzkümmel und Oregano marinieren.","In einem Topf mit Tomaten, Zwiebeln und Brühe 30 Min köcheln lassen.","Fleisch mit Gabel zerrupfen, Brühe als Consommé beiseite stellen.","Maistortillas in der Birria-Brühe kurz eintauchen.","Tortillas in Pfanne mit Käse und Fleisch knusprig braten.","Mit Consommé zum Dippen, Limette und Koriander servieren."],
    [{name:"Rindfleisch",amount:"500g"},{name:"Chipotle-Paste",amount:"2 EL"},{name:"Maistortillas",amount:"8 Stück"},{name:"Mozzarella",amount:"150g"},{name:"Koriander",amount:"1 Bund"}]),

  R(55,"Butter Chicken","35 Min",560,42,28,30,["dinner"],["Indisch","Curry","Protein"],"KI-Vorschlag","#ff6b35","https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",[],
    ["Hähnchen in Joghurt + Garam Masala 20 Min marinieren.","In heißer Pfanne scharf anbraten, beiseite stellen.","Butter schmelzen, Zwiebeln, Knoblauch, Ingwer anbraten.","Tomatenpassata + Sahne + Gewürze dazu, 10 Min köcheln.","Hähnchen zurück in die Sauce geben.","Mit Basmatireis und Naan servieren."],
    [{name:"Hähnchenbrust",amount:"500g"},{name:"Sahne",amount:"200ml"},{name:"Tomatenpassata",amount:"400g"},{name:"Garam Masala",amount:"2 EL"},{name:"Basmatireis",amount:"200g"}]),

  R(56,"Korean Corn Dogs","30 Min",420,16,52,18,["snack"],["Koreanisch","Street Food","Trending"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1619881590738-a111d176d936?w=800&q=80",["Gluten","Milch","Ei"],
    ["Würstchen auf Holzspieße stecken, Mozzarella-Sticks dazwischen optional.","Teig: Mehl, Hefe, Zucker, Ei – dickflüssig anrühren.","Würstchen durch den Teig ziehen, gleichmäßig ummanteln.","In Panko-Bröseln wälzen für extra Crunch.","In heißem Öl (180°C) goldbraun frittieren, ca. 4 Min.","Sofort mit Ketchup + Senf-Swirl und Zucker bestreut servieren."],
    [{name:"Würstchen",amount:"6 Stück"},{name:"Mozzarella-Sticks",amount:"3 Stück"},{name:"Mehl",amount:"150g"},{name:"Panko",amount:"100g"},{name:"Ei",amount:"1 Stück"}]),

  R(57,"Salmon Rice Bowl","15 Min",520,38,48,18,["lunch","dinner"],["TikTok","Bowl","Fisch"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",["Fisch","Soja","Sesam"],
    ["Sushireis kochen und mit Reisessig würzen.","Lachs in kleine Würfel schneiden (Sashimi-Qualität).","Sriracha-Mayo mischen: Mayo + Sriracha + Sesamöl.","Reis in Bowl, Lachs-Würfel drauf verteilen.","Avocado-Scheiben, Edamame und Nori-Streifen dazu.","Sriracha-Mayo drüber, Sesam und Frühlingszwiebeln obendrauf."],
    [{name:"Lachs (frisch)",amount:"200g"},{name:"Sushireis",amount:"150g"},{name:"Avocado",amount:"1 Stück"},{name:"Sriracha",amount:"1 EL"},{name:"Sesam",amount:"1 EL"}]),

  R(58,"Crispy Chilli Beef","25 Min",540,35,48,22,["dinner"],["Chinesisch","Scharf","Knusprig"],"YouTube","#cc0000","https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80",["Gluten","Soja"],
    ["Rindfleisch in dünne Streifen schneiden.","In Speisestärke wälzen, überschüssiges abklopfen.","In heißem Öl portionsweise knusprig frittieren (3 Min).","Süß-scharfe Sauce: Sojasauce + Honig + Chili + Essig aufkochen.","Knuspriges Fleisch in die Sauce geben, kurz schwenken.","Mit Jasminreis, Frühlingszwiebeln und Sesam servieren."],
    [{name:"Rinderfilet",amount:"400g"},{name:"Speisestärke",amount:"4 EL"},{name:"Sojasauce",amount:"3 EL"},{name:"Honig",amount:"2 EL"},{name:"Chilischoten",amount:"3 Stück"}]),

  R(59,"Shakshuka","20 Min",380,22,28,20,["breakfast","lunch"],["Orientalisch","Vegetarisch","Frühling"],"Eigene DB","#9b59b6","https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&q=80",["Ei"],
    ["Zwiebel und Paprika in Olivenöl anbraten.","Knoblauch, Kreuzkümmel und Paprikapulver dazu.","Stückige Tomaten eingießen, 10 Min köcheln lassen.","Mulden formen, Eier vorsichtig reingleiten lassen.","Deckel drauf, 5-7 Min bis Eiweiß fest, Eigelb noch weich.","Mit Feta zerbröselt, Petersilie und warmem Fladenbrot servieren."],
    [{name:"Eier",amount:"4 Stück"},{name:"Stückige Tomaten",amount:"400g"},{name:"Paprika",amount:"2 Stück"},{name:"Kreuzkümmel",amount:"1 TL"},{name:"Feta",amount:"50g"}]),

  R(60,"Dalgona Coffee","5 Min",180,4,28,6,["breakfast","snack"],["Getränk","Viral","Kaffee"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80",["Milch"],
    ["Instantkaffee, Zucker und heißes Wasser (je 2 EL) in eine Schüssel.","Mit Handrührer 3-5 Min aufschlagen bis steife, cremige Masse entsteht.","Je fester der Schaum, desto besser!","Glas mit Eiswürfeln füllen.","Kalte Milch eingießen (ca. 200ml).","Kaffee-Schaum obendrauf löffeln – nicht umrühren!"],
    [{name:"Instantkaffee",amount:"2 EL"},{name:"Zucker",amount:"2 EL"},{name:"Heißes Wasser",amount:"2 EL"},{name:"Milch (kalt)",amount:"200ml"},{name:"Eiswürfel",amount:"6 Stück"}]),

  R(61,"Turkish Pasta","30 Min",620,38,62,22,["dinner"],["Türkisch","Pasta","Trending"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80",["Gluten","Milch"],
    ["Pasta al dente kochen, abgießen.","Hackfleisch mit Zwiebeln, Knoblauch und Tomatenmark scharf anbraten.","Mit Paprikapulver, Kreuzkümmel und Chiliflocken würzen.","Joghurt-Sauce: Griech. Joghurt + gepresster Knoblauch + Salz verrühren.","Pasta auf Teller, Joghurt drüber, dann das Hackfleisch.","Paprika-Butter: Butter mit Paprikapulver erhitzen, darüber träufeln."],
    [{name:"Hackfleisch",amount:"300g"},{name:"Pasta (Ditalini)",amount:"250g"},{name:"Griech. Joghurt",amount:"200g"},{name:"Butter",amount:"30g"},{name:"Paprikapulver",amount:"2 TL"}]),

  R(62,"Protein Muffins","25 Min",220,20,18,8,["breakfast","snack"],["Protein","Meal Prep","Fitness"],"Instagram","#e4405f","https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&q=80",["Gluten","Milch","Ei"],
    ["Ofen auf 180°C vorheizen, Muffinform einfetten.","Banane zerdrücken, Ei und Joghurt unterrühren.","Proteinpulver, Hafermehl und Backpulver trocken mischen.","Trockene + nasse Zutaten zusammenrühren, nicht über-mischen!","Teig in 8 Förmchen verteilen, optional Blaubeeren obendrauf.","18-22 Min backen bis goldbraun. Perfekt für Meal Prep – 3 Tage haltbar!"],
    [{name:"Proteinpulver",amount:"60g"},{name:"Banane",amount:"2 Stück"},{name:"Griech. Joghurt",amount:"100g"},{name:"Hafermehl",amount:"80g"},{name:"Eier",amount:"2 Stück"}]),

  R(63,"Cloud Toast","10 Min",310,16,32,14,["breakfast"],["Frühstück","Viral","Frühling"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80",["Gluten","Ei","Milch"],
    ["Eiweiß vom Eigelb trennen (2 Eier).","Eiweiß steif schlagen mit einer Prise Salz.","Toast leicht vorrösten, damit er stabil wird.","Eischnee-Wolke auf den Toast türmen, Mulde in die Mitte.","Eigelb vorsichtig in die Mulde setzen.","Im Ofen bei 200°C 5-7 Min backen bis golden. Mit Avocado servieren."],
    [{name:"Eier",amount:"2 Stück"},{name:"Toastbrot",amount:"2 Scheiben"},{name:"Avocado",amount:"0.5 Stück"},{name:"Honig",amount:"1 TL"},{name:"Microgreens",amount:"1 Handvoll"}]),

  R(64,"Dumpling Lasagne","40 Min",520,28,52,20,["dinner"],["Fusion","Viral","Nudeln"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80",["Gluten","Soja"],
    ["Füllung: Hackfleisch + Ingwer + Knoblauch + Sojasauce + Sesamöl mischen.","Dumpling-Wrappers als Lasagne-Platten in Auflaufform schichten.","Abwechselnd Füllung und Wrapper schichten (3-4 Lagen).","Sauce: Sojasauce + Reisessig + Chiliöl + Zucker verrühren.","Sauce gleichmäßig drüber gießen, mit Käse bestreuen.","Bei 180°C 25 Min backen. Mit Frühlingszwiebeln und Sesam garnieren."],
    [{name:"Hackfleisch",amount:"400g"},{name:"Dumpling-Wrapper",amount:"30 Stück"},{name:"Sojasauce",amount:"4 EL"},{name:"Ingwer (frisch)",amount:"1 Stück"},{name:"Mozzarella",amount:"150g"}]),

  R(65,"Japanese Cheesecake (2 Zutaten)","15 Min",280,8,38,12,["snack"],["Dessert","Viral 2026","Japanisch"],"TikTok Viral","#ff0050","https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80",["Milch"],
    ["Griechischen Joghurt (500g) in eine Schüssel geben.","Kekse (Lotus Biscoff oder Oreo) fein zerbröseln.","Joghurt und Kekskrümel gründlich vermischen.","In eine mit Backpapier ausgelegte Form füllen.","Mindestens 4 Stunden oder über Nacht im Kühlschrank fest werden lassen.","Stürzen, in Stücke schneiden. Optional: Kakaopulver oder Beeren oben drauf."],
    [{name:"Griech. Joghurt",amount:"500g"},{name:"Lotus Biscoff Kekse",amount:"150g"},{name:"Kakaopulver",amount:"1 EL"},{name:"Beeren",amount:"100g"},{name:"Minze",amount:"Deko"}]),
  R(50,"Overnight Bircher Müsli","5 Min",360,16,54,10,["breakfast"],["Frühstück","Gesund"],"Eigene DB","#9b59b6",IMG.overnight_oats,["Gluten","Milch","Nüsse"],
    ["Haferflocken mit Milch & Joghurt verrühren.","Geriebenen Apfel untermischen (verhindert Bräunen).","Honig + Zimt + Vanille einrühren.","Gehackte Nüsse dazu.","Über Nacht kühlen.","Morgens mit Beeren & einem Spritzer Zitrone servieren."],
    [{name:"Haferflocken",amount:"80g"},{name:"Milch",amount:"150ml"},{name:"Joghurt",amount:"80g"},{name:"Apfel gerieben",amount:"1 Stück"},{name:"Nüsse gehackt",amount:"30g"}]),
];

const ALLERGENS_LIST=["Gluten","Milch","Ei","Nüsse","Fisch","Soja","Schalentiere","Sesam"];

export default function FoodSwipe(){
  const slot=getSlot(), slotType=slotMap[slot];

  const [lang,setLang]=useState(()=>load("fs_lang","de"));
  const t=key=>TRANSLATIONS[lang]?.[key]||TRANSLATIONS.de[key]||key;
  const saveLang=l=>{setLang(l);save("fs_lang",l);};
  const tA=a=>TRANSLATIONS[lang]?.[`al_${a}`]||a; // translate allergen name
  const slotInfo={morning:{emoji:"🌅"},lunch:{emoji:"☀️"},snack:{emoji:"🌆"},dinner:{emoji:"🌙"}}[slot];
  const slotSub=t(`slot_${slot}`);
  const MOODS_T=[{id:"Zur Uhrzeit",l:t("mood_time")},{id:"Alles",l:t("mood_all")},{id:"Schnell",l:t("mood_fast")},{id:"High Protein",l:t("mood_protein")},{id:"Vegetarisch",l:t("mood_veggie")},{id:"Trending",l:t("mood_trending")},{id:"Wenig Kalorien",l:t("mood_lowcal")},{id:"Saisonal",l:t("mood_seasonal")}];
  const MEAL_OPTIONS_T=[{id:"breakfast",label:t("meal_breakfast")},{id:"lunch",label:t("meal_lunch")},{id:"dinner",label:t("meal_dinner")},{id:"snack",label:t("meal_snack")}];

  const [onboarded,setOnboarded]=useState(()=>!!load("fs_onboarded",false));
  const [obStep,setObStep]=useState(0);
  const [userName,setUserName]=useState(()=>load("fs_name",""));
  const [liked,setLiked]=useState(()=>load("fs_liked",[]));
  const [history,setHistory]=useState(()=>load("fs_history",[]));
  const [shoppingList,setShoppingList]=useState(()=>load("fs_shopping",[]));
  const [checkedItems,setCheckedItems]=useState(()=>load("fs_checked",{}));
  const [selectedAllergens,setSelectedAllergens]=useState(()=>load("fs_allergens",[]));
  const [customRecipes,setCustomRecipes]=useState(()=>load("fs_custom",[]));
  const [seenIds,setSeenIds]=useState(()=>load("fs_seen",[]));
  const [spoonRecipes,setSpoonRecipes]=useState([]);
  const [spoonLoading,setSpoonLoading]=useState(false);
  const [spoonLoaded,setSpoonLoaded]=useState(false);
  const [claudeKey,setClaudeKey]=useState(()=>load("fs_claude_key",""));
  const [scanning,setScanning]=useState(false);
  const [translating,setTranslating]=useState(false);
  const [transCache,setTransCache]=useState(()=>load("fs_trans",{}));
  // Aufgabe 4: Lernender Algorithmus
  const [tagScores,setTagScores]=useState(()=>load("fs_tag_scores",{}));
  // Aufgabe 5: Kalorientracking
  const [calGoal,setCalGoal]=useState(()=>load("fs_cal_goal",2000));
  const [dailyCals,setDailyCals]=useState(()=>{const saved=load("fs_daily_cals",{date:"",total:0});const today=new Date().toDateString();return saved.date===today?saved:{date:today,total:0};});
  // Aufgabe 6: Paar-Modus
  const [paarMode,setPaarMode]=useState(()=>load("fs_paar_mode",false));
  const [currentPerson,setCurrentPerson]=useState(()=>load("fs_paar_person","A"));
  const [paarLikesA,setPaarLikesA]=useState(()=>load("fs_paar_a",[]));
  const [paarLikesB,setPaarLikesB]=useState(()=>load("fs_paar_b",[]));
  // Aufgabe 3: Portionsrechner
  const [portions,setPortions]=useState(2);

  useEffect(()=>{save("fs_liked",liked);},[liked]);
  useEffect(()=>{save("fs_tag_scores",tagScores);},[tagScores]);
  useEffect(()=>{save("fs_paar_mode",paarMode);},[paarMode]);
  useEffect(()=>{save("fs_paar_person",currentPerson);},[currentPerson]);
  useEffect(()=>{save("fs_paar_a",paarLikesA);},[paarLikesA]);
  useEffect(()=>{save("fs_paar_b",paarLikesB);},[paarLikesB]);
  useEffect(()=>{save("fs_history",history);},[history]);
  useEffect(()=>{save("fs_shopping",shoppingList);},[shoppingList]);
  useEffect(()=>{save("fs_checked",checkedItems);},[checkedItems]);
  useEffect(()=>{save("fs_allergens",selectedAllergens);},[selectedAllergens]);
  useEffect(()=>{save("fs_custom",customRecipes);},[customRecipes]);
  useEffect(()=>{save("fs_seen",seenIds);},[seenIds]);
  useEffect(()=>{save("fs_claude_key",claudeKey);},[claudeKey]);
  useEffect(()=>{save("fs_trans",transCache);},[transCache]);

  // ── AUTO-TRANSLATE RECIPE ──────────────────────────────────────────────
  const LANG_NAMES={de:"Deutsch",pl:"Polnisch",ru:"Russisch"};
  const needsTranslation=(recipe)=>{
    if(lang==="de"&&!String(recipe.id).startsWith("mdb_"))return false; // local recipes already in DE
    if(lang==="de"&&String(recipe.id).startsWith("mdb_"))return true; // TheMealDB → translate EN→DE
    return true; // PL/RU always need translation
  };
  const getTransKey=(recipe)=>`${lang}_${recipe.id}`;
  const translateRecipe=async(recipe)=>{
    const key=getTransKey(recipe);
    if(transCache[key])return transCache[key];
    if(!claudeKey){return null;}
    setTranslating(true);
    try{
      const ings=recipe.ingredients.map(i=>`${i.name} (${i.amount})`).join(", ");
      const steps=recipe.steps?.join("\n")||"";
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":claudeKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:2000,
          messages:[{role:"user",content:`Übersetze dieses Rezept ins ${LANG_NAMES[lang]||"Deutsche"}. Antworte NUR mit JSON, keine Backticks:
{"name":"übersetzter Name","ingredients":[{"name":"Zutat","amount":"Menge"}],"steps":["Schritt 1","Schritt 2"]}

Rezept: ${recipe.name}
Zutaten: ${ings}
Schritte:
${steps}

Regeln:
- Übersetze ALLE Zutaten-Namen und Mengenangaben
- Übersetze ALLE Zubereitungsschritte vollständig
- Behalte die Reihenfolge bei
- Koche-Fachbegriffe korrekt übersetzen`}]
        })
      });
      if(!res.ok)throw new Error(`API ${res.status}`);
      const data=await res.json();
      const text=data.content?.map(c=>c.text||"").join("")||"";
      const clean=text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      const result={name:parsed.name||recipe.name,ingredients:parsed.ingredients||recipe.ingredients,steps:parsed.steps||recipe.steps};
      setTransCache(p=>{const n={...p,[key]:result};return n;});
      return result;
    }catch(e){console.error("Translation error:",e);return null;}
    finally{setTranslating(false);}
  };
  // Auto-translate when opening detail
  useEffect(()=>{
    if(screen==="detail"&&detailRecipe&&needsTranslation(detailRecipe)&&claudeKey&&!transCache[getTransKey(detailRecipe)]){
      translateRecipe(detailRecipe);
    }
  },[screen,detailRecipe,lang]);
  // Helper: get translated name/ingredients if available
  const trName=(recipe)=>transCache[`${lang}_${recipe.id}`]?.name||recipe.name;
  const trIngs=(recipe)=>transCache[`${lang}_${recipe.id}`]?.ingredients||recipe.ingredients;

  // ── SHARE RECIPE ──────────────────────────────────────────────────────
  const shareRecipe=async(recipe)=>{
    const name=trName(recipe);
    const ings=(trIngs(recipe)||recipe.ingredients).map(i=>`• ${i.name} (${i.amount})`).join("\n");
    const text=`🍽️ ${name}\n⏱ ${recipe.time} · 🔥 ${recipe.cal||"?"} kcal · 💪 ${recipe.protein||"?"}g Protein\n\n${t("detail_ingredients")}:\n${ings}\n\n${t("share_text")} – via FoodSwipe 🧡`;
    if(navigator.share){
      try{await navigator.share({title:name,text});}catch(e){}
    }else{
      try{await navigator.clipboard.writeText(text);showToast("📋 Kopiert!","#4ade80");}catch(e){showToast("⚠️ Konnte nicht kopieren","#f39c12");}
    }
  };

  const allRecipes=[...LOCAL_RECIPES,...customRecipes,...spoonRecipes];

  const buildDeck=useCallback((mood,allergens,seen)=>{
    let list=allRecipes.filter(r=>{
      if(!allergens.every(a=>!r.allergens.includes(a)))return false;
      if(mood==="Zur Uhrzeit")return r.meal.includes(slotType);
      if(mood==="Schnell")return parseInt(r.time)<=20;
      if(mood==="High Protein")return r.protein>=35;
      if(mood==="Vegetarisch")return r.tags.some(t=>t.toLowerCase().includes("vegetar"));
      if(mood==="Trending")return r.src==="YouTube"||r.src==="TheMealDB";
      if(mood==="Wenig Kalorien")return r.cal<420;
      if(mood==="Saisonal"){const m=new Date().getMonth();const season=[11,0,1].includes(m)?"winter":[2,3,4].includes(m)?"spring":[5,6,7].includes(m)?"summer":"autumn";const tags={winter:["Winter","Eintopf","Suppe","Braten"],spring:["Frühling","Spargel","Salat","Leicht","Shakshuka","Frühling"],summer:["Sommer","Grill","Bowl","Salat","Erfrischend"],autumn:["Herbst","Kürbis","Eintopf","Pilze"]}[season];return r.tags.some(t=>tags.some(st=>t.toLowerCase().includes(st.toLowerCase())));}
      return true;
    });
    // Deduplicate by normalized name
    const seen2=new Set();
    list=list.filter(r=>{
      const key=r.name.toLowerCase().replace(/[^a-zäöüß0-9]/g,"");
      if(seen2.has(key))return false;
      seen2.add(key);
      return true;
    });
    const scored=list.map(r=>({...r,_score:(r.tags||[]).reduce((s,tg)=>s+(tagScores[tg]||0),0)}));
    scored.sort((a,b)=>b._score-a._score);
    const top=scored.slice(0,Math.ceil(scored.length*0.3));
    const rest=scored.slice(Math.ceil(scored.length*0.3));
    const unseen=shuffle(top.filter(r=>!seen.includes(String(r.id))));
    const unseenRest=shuffle(rest.filter(r=>!seen.includes(String(r.id))));
    const seenL=shuffle(list.filter(r=>seen.includes(String(r.id))));
    return [...unseen,...unseenRest,...seenL];
  },[allRecipes,slotType]);

  const [moodFilter,setMoodFilter]=useState("Zur Uhrzeit");
  const [deck,setDeck]=useState(()=>buildDeck("Zur Uhrzeit",load("fs_allergens",[]),load("fs_seen",[])));
  const [deckIndex,setDeckIndex]=useState(0);
  const [screen,setScreen]=useState("swipe");
  const [swipeDir,setSwipeDir]=useState(null);
  const [dragX,setDragX]=useState(0);
  const [isDragging,setIsDragging]=useState(false);
  const [detailRecipe,setDetailRecipe]=useState(null);
  const [detailFrom,setDetailFrom]=useState("favorites");
  const [showAddDish,setShowAddDish]=useState(false);
  const [newDish,setNewDish]=useState({name:"",time:"15 Min",cal:"",protein:"",carbs:"",fat:"",img:"",ingredients:"",steps:"",meal:["dinner"]});
  const [toast,setToast]=useState(null);
  const [activeTab,setActiveTab]=useState("ingredients");
  const dragStart=useRef(null);

  const current=deck[deckIndex%Math.max(deck.length,1)];
  const next=deck[(deckIndex+1)%Math.max(deck.length,1)];

  const showToast=(msg,color="#4ade80")=>{setToast({msg,color});setTimeout(()=>setToast(null),2000);};

  const fetchSpoonacular=async ()=>{
    if(spoonLoaded)return;
    setSpoonLoading(true);
    try{
      const cats=["Beef","Chicken","Seafood","Pasta","Vegetarian","Breakfast","Dessert","Lamb","Pork","Side"];
      let allIds=[];
      for(const cat of cats.slice(0,6)){
        const res=await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
        const data=await res.json();
        if(data.meals)allIds.push(...data.meals.slice(0,8).map(m=>({id:m.idMeal,thumb:m.strMealThumb,_cat:cat})));
      }
      // Fetch full details for each meal (ingredients + instructions)
      const detailPromises=allIds.map(m=>fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.id}`).then(r=>r.json()).then(d=>({...d.meals?.[0],_cat:m._cat})).catch(()=>null));
      const details=(await Promise.all(detailPromises)).filter(Boolean);
      if(details.length){
        const mealMap={Beef:["lunch","dinner"],Chicken:["lunch","dinner"],Seafood:["lunch","dinner"],Pasta:["lunch","dinner"],Vegetarian:["lunch","dinner","snack"],Breakfast:["breakfast"],Dessert:["snack"],Lamb:["dinner"],Pork:["lunch","dinner"],Side:["lunch","snack"]};
        const spoon=details.map(m=>{
          // Extract real ingredients
          const ings=[];
          for(let i=1;i<=20;i++){
            const name=m[`strIngredient${i}`];
            const amount=m[`strMeasure${i}`];
            if(name&&name.trim())ings.push({name:name.trim(),amount:(amount||"").trim()||t("mdb_default_amount")});
          }
          // Extract real steps from instructions – filter out "STEP 1" headers
          const rawSteps=(m.strInstructions||"").split(/\r?\n/).map(s=>s.trim()).filter(s=>s.length>3&&!/^step\s*\d+$/i.test(s));
          const steps=rawSteps.length>0?rawSteps.slice(0,8):[t("mdb_fallback_step1"),t("mdb_fallback_step2"),t("mdb_fallback_step3")];
          return {
            id:`mdb_${m.idMeal}`,name:m.strMeal,time:`${15+Math.floor(Math.random()*30)} ${t("min")}`,
            cal:300+Math.floor(Math.random()*400),
            protein:10+Math.floor(Math.random()*40),
            carbs:20+Math.floor(Math.random()*60),
            fat:5+Math.floor(Math.random()*30),
            meal:mealMap[m._cat]||["lunch","dinner"],tags:[m._cat,m.strArea||"International"],
            src:"TheMealDB",srcColor:"#e67e22",
            img:m.strMealThumb||FALLBACK,allergens:[],
            steps,ingredients:ings.length>0?ings:[{name:m.strMeal,amount:t("mdb_default_amount")}],
          };
        });
        setSpoonRecipes(spoon);
        setSpoonLoaded(true);
        showToast(`🍽️ ${spoon.length} ${t("recipes_loaded")}`,"#e67e22");
        setDeck(d=>shuffle([...d,...spoon]));
      }
    }catch(e){showToast(t("toast_api_error"),"#ff4444");}
    setSpoonLoading(false);
  };

  useEffect(()=>{if(!spoonLoaded)fetchSpoonacular();},[]);

  const applyFilter=useCallback((mood,allergens)=>{
    setDeck(buildDeck(mood,allergens,seenIds));setDeckIndex(0);
  },[buildDeck,seenIds]);

  const doSwipe=dir=>{
    if(!current)return;
    setSwipeDir(dir);
    const newSeen=seenIds.includes(String(current.id))?seenIds:[...seenIds,String(current.id)];
    setSeenIds(newSeen);
    setTimeout(()=>{
      if(dir==="right"){
        const nameKey=current.name.toLowerCase().replace(/[^a-zäöüß0-9]/g,"");
        const alreadyLiked=p=>p.some(x=>x.name.toLowerCase().replace(/[^a-zäöüß0-9]/g,"")===nameKey);
        setLiked(p=>{
          if(alreadyLiked(p)){showToast(`⚠️ ${trName(current)} ${t("toast_already_saved")}`,"#f39c12");return p;}
          return [...p.filter(x=>x.id!==current.id),current];
        });
        if(!liked.some(x=>x.name.toLowerCase().replace(/[^a-zäöüß0-9]/g,"")===nameKey)){
          setShoppingList(p=>[...p,...current.ingredients.filter(i=>!p.find(x=>x.name===i.name))]);
          showToast(`❤️ ${trName(current)} ${t("toast_saved")}`);
          // Aufgabe 4: Tag-Scores lernen
          setTagScores(prev=>{const s={...prev};(current.tags||[]).forEach(tg=>{s[tg]=(s[tg]||0)+1;});return s;});
          // Aufgabe 5: Kalorien tracken
          if(current.cal){setDailyCals(prev=>{const today=new Date().toDateString();const updated={date:today,total:(prev.date===today?prev.total:0)+Number(current.cal)};save("fs_daily_cals",updated);return updated;});}
          // Aufgabe 6: Paar-Modus
          if(paarMode){if(currentPerson==="A"){setPaarLikesA(p=>[...p,current.id]);if(paarLikesB.includes(current.id)){showToast(`💞 MATCH! Ihr mögt beide ${trName(current)}!`,"#ff69b4");}setCurrentPerson("B");}else{setPaarLikesB(p=>[...p,current.id]);if(paarLikesA.includes(current.id)){showToast(`💞 MATCH! Ihr mögt beide ${trName(current)}!`,"#ff69b4");}setCurrentPerson("A");}}
        }
      }
      setHistory(p=>[{...current,action:dir},...p].slice(0,50));
      setDeckIndex(i=>{
        const n=i+1;
        if(n>=deck.length){setDeck(buildDeck(moodFilter,selectedAllergens,newSeen));return 0;}
        return n;
      });
      setSwipeDir(null);setDragX(0);
    },300);
  };

  const onDS=e=>{dragStart.current=e.type==="touchstart"?e.touches[0].clientX:e.clientX;setIsDragging(true);};
  const onDM=e=>{if(!isDragging||dragStart.current===null)return;setDragX((e.type==="touchmove"?e.touches[0].clientX:e.clientX)-dragStart.current);};
  const onDE=()=>{if(Math.abs(dragX)>80)doSwipe(dragX>0?"right":"left");else setDragX(0);setIsDragging(false);dragStart.current=null;};

  const cardAnim=swipeDir?{transform:`translateX(${swipeDir==="right"?700:-700}px) rotate(${swipeDir==="right"?30:-30}deg)`,transition:"transform 0.3s ease",opacity:0}
    :isDragging?{transform:`translateX(${dragX}px) rotate(${dragX*0.06}deg)`,transition:"none"}
    :{transform:"none",transition:"transform 0.25s ease"};
  const likeOp=Math.min(1,Math.max(0,dragX/80));
  const nopeOp=Math.min(1,Math.max(0,-dragX/80));

  const FONT=<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>;
  const BG=({img})=>(
    <div style={{position:"fixed",inset:0,zIndex:0}}>
      <img src={img||FALLBACK} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.src=FALLBACK;}}/>
      <div style={{position:"absolute",inset:0,backdropFilter:"blur(45px) saturate(1.3)",background:"rgba(4,4,10,0.78)"}}/>
    </div>
  );
  const BackBtn=({to,onBack})=>(
    <button onClick={()=>{if(onBack)onBack();setScreen(to);}} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",color:"white",width:40,height:40,fontSize:"1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
  );
  const ToastEl=()=>toast?(
    <div style={{position:"fixed",top:"1.2rem",left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#000",padding:"0.6rem 1.4rem",borderRadius:"50px",fontSize:"0.85rem",fontWeight:"800",zIndex:9999,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 20px rgba(0,0,0,0.4)",whiteSpace:"nowrap"}}>
      {toast.msg}
    </div>
  ):null;

  // ── ONBOARDING ──────────────────────────────────────────────────────────
  if(!onboarded){
    const steps=[
      <div key={0} style={{display:"flex",flexDirection:"column",height:"100%",padding:"2rem 1.5rem"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",gap:"1rem"}}>
          <div style={{fontSize:"5rem"}}><img src={LOGO_URL} alt="FoodSwipe" style={{width:80,height:80,borderRadius:18}} onError={e=>{e.target.outerHTML="🍽️";}}/></div>
          <div style={{fontSize:"2.4rem",fontWeight:"900",background:"linear-gradient(90deg,#ff6b35,#ffcc02)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FoodSwipe</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:"1rem",lineHeight:1.6,maxWidth:"280px"}}>{t("ob_tagline")}</div>
          <div style={{width:"100%",marginTop:"0.5rem"}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.6rem"}}>{t("ob_lang_title")}</div>
            <select value={lang} onChange={e=>saveLang(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"14px",color:"white",padding:"0.9rem 1.2rem",fontSize:"1rem",fontFamily:"inherit",outline:"none",appearance:"none",WebkitAppearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(255,255,255,0.5)' viewBox='0 0 16 16'%3E%3Cpath d='M1.5 5.5l6.5 6.5 6.5-6.5'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 1rem center",cursor:"pointer",textAlign:"center"}}>
              {LANG_OPTIONS.map(lo=>(
                <option key={lo.id} value={lo.id} style={{background:"#1a1a2e",color:"white"}}>{lo.label}</option>
              ))}
            </select>
            <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.72rem",marginTop:"0.4rem"}}>{t("ob_lang_sub")}</div>
          </div>
          <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder={t("ob_name_placeholder")} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"14px",color:"white",padding:"0.9rem 1.2rem",fontSize:"1rem",width:"100%",fontFamily:"inherit",textAlign:"center",outline:"none",marginTop:"0.5rem"}}/>
        </div>
        <button onClick={()=>setObStep(1)} style={{background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1.1rem",fontSize:"1rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(255,107,53,0.4)"}}>{t("ob_next")}</button>
      </div>,
      <div key={1} style={{display:"flex",flexDirection:"column",height:"100%",padding:"2rem 1.5rem"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:"1.5rem",fontWeight:"900",marginBottom:"0.3rem"}}>{t("ob_how_title")}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem",marginBottom:"2rem"}}>{t("ob_how_sub")}</div>
          {[["👉",t("ob_swipe_right"),t("ob_swipe_right_sub")],["👈",t("ob_swipe_left"),t("ob_swipe_left_sub")],["❤️",t("ob_favorites"),t("ob_favorites_sub")],["🛒",t("ob_shopping"),t("ob_shopping_sub")]].map(([ico,tt,s])=>(
            <div key={tt} style={{display:"flex",gap:"1rem",alignItems:"center",marginBottom:"1.2rem"}}>
              <div style={{fontSize:"1.5rem",width:40,textAlign:"center"}}>{ico}</div>
              <div><div style={{fontWeight:"700",fontSize:"0.9rem"}}>{tt}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.8rem"}}>{s}</div></div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"0.8rem"}}>
          <button onClick={()=>setObStep(0)} style={{flex:0.4,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",color:"white",padding:"1rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit"}}>{t("ob_back")}</button>
          <button onClick={()=>{save("fs_onboarded",1);save("fs_name",userName);setOnboarded(true);}} style={{flex:1,background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1rem",fontSize:"0.95rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(255,107,53,0.4)"}}>{t("ob_start")}</button>
        </div>
      </div>,
    ];
    return(
      <div style={{height:"100dvh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",color:"white",overflow:"hidden",position:"relative",background:"#07070f"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%,#3a1200,#07070f 70%)",zIndex:0}}/>
        <div style={{position:"relative",zIndex:1,height:"100%"}}>
          <div style={{display:"flex",justifyContent:"center",gap:"0.4rem",padding:"1.2rem 0 0"}}>
            {[0,1].map(i=><div key={i} style={{width:obStep===i?24:8,height:8,borderRadius:4,background:obStep===i?"#ff6b35":"rgba(255,255,255,0.2)",transition:"all 0.3s"}}/>)}
          </div>
          {steps[obStep]}
        </div>
        {FONT}
      </div>
    );
  }

  // ── DETAIL ──────────────────────────────────────────────────────────────
  if(screen==="detail"&&detailRecipe){
    const r=detailRecipe, isLiked=liked.some(x=>x.id===r.id);
    const tk=getTransKey(r);
    const tr=transCache[tk]; // cached translation
    const showName=tr?.name||r.name;
    const showIngs=tr?.ingredients||r.ingredients;
    const showSteps=tr?.steps||r.steps;
    const canTranslate=needsTranslation(r);
    const isTranslated=!!tr;
    return(
      <div style={{minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
        <BG img={r.img}/><ToastEl/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{height:"40vh",position:"relative",overflow:"hidden"}}>
            <img src={r.img} alt={r.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.src=FALLBACK;}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(4,4,10,0.97))"}}/>
            <button onClick={()=>setScreen(detailFrom)} style={{position:"absolute",top:"1rem",left:"1rem",background:"rgba(0,0,0,0.5)",border:"none",borderRadius:"50%",color:"white",width:40,height:40,fontSize:"1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)"}}>←</button>
            <div style={{position:"absolute",bottom:"1rem",left:"1.2rem",right:"1.2rem"}}>
              <span style={{background:r.srcColor,borderRadius:"20px",padding:"0.2rem 0.75rem",fontSize:"0.68rem",fontWeight:"800"}}>{r.src}</span>
              <div style={{fontSize:"1.8rem",fontWeight:"900",marginTop:"0.4rem",lineHeight:1.15}}>{showName}</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.82rem",marginTop:"0.2rem"}}>⏱ {r.time} · 🔥 {r.cal||"?"} kcal · <span style={{color:"#4ade80"}}>💪 {r.protein?`${r.protein}g`:"?"}</span></div>
            </div>
          </div>
          <div style={{padding:"1rem 1.4rem"}}>
            {/* Translation status bar */}
            {canTranslate&&(
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.8rem",padding:"0.5rem 0.8rem",background:isTranslated?"rgba(74,222,128,0.1)":translating?"rgba(96,165,250,0.1)":"rgba(255,255,255,0.05)",borderRadius:"10px",border:`1px solid ${isTranslated?"rgba(74,222,128,0.2)":translating?"rgba(96,165,250,0.2)":"rgba(255,255,255,0.08)"}`}}>
                <span style={{fontSize:"0.75rem"}}>{translating?"⏳":isTranslated?"✅":"🌍"}</span>
                <span style={{fontSize:"0.72rem",color:isTranslated?"rgba(74,222,128,0.8)":translating?"rgba(96,165,250,0.8)":"rgba(255,255,255,0.4)",flex:1}}>
                  {translating?t("trans_loading"):isTranslated?t("trans_done"):claudeKey?t("trans_tap"):t("trans_need_key")}
                </span>
                {!isTranslated&&!translating&&claudeKey&&(
                  <button onClick={()=>translateRecipe(r)} style={{background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"8px",color:"white",padding:"0.3rem 0.7rem",fontSize:"0.7rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit"}}>{t("trans_btn")}</button>
                )}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.6rem",marginBottom:"1rem"}}>
              {[{l:t("lbl_protein"),v:r.protein,c:"#4ade80",icon:"💪"},{l:t("lbl_carbs"),v:r.carbs,c:"#60a5fa",icon:"⚡"},{l:t("lbl_fat"),v:r.fat,c:"#fb923c",icon:"🔥"}].map(m=>(
                <div key={m.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:"14px",padding:"0.8rem 0.5rem",textAlign:"center",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div style={{fontSize:"1.1rem"}}>{m.icon}</div>
                  <div style={{fontSize:"1.2rem",fontWeight:"900",color:m.c}}>{m.v?`${m.v}g`:"—"}</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.4)",letterSpacing:"1px"}}>{m.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",background:"rgba(255,255,255,0.07)",borderRadius:"12px",padding:"4px",marginBottom:"1rem"}}>
              {[["ingredients",t("detail_ingredients")],["steps",t("detail_steps")]].map(([tab,label])=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} style={{flex:1,background:activeTab===tab?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"transparent",border:"none",borderRadius:"9px",color:"white",padding:"0.55rem",fontSize:"0.82rem",fontWeight:activeTab===tab?"800":"500",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{label}</button>
              ))}
            </div>
            {activeTab==="ingredients"&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.8rem",background:"rgba(255,255,255,0.05)",borderRadius:"12px",padding:"0.55rem 1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",marginRight:"0.3rem"}}>{t("portions_label")}:</span>
                  {[1,2,4,6].map(p=>(
                    <button key={p} onClick={()=>setPortions(p)}
                      style={{background:portions===p?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"rgba(255,255,255,0.08)",border:"none",borderRadius:"8px",color:"white",padding:"0.35rem 0.7rem",fontSize:"0.8rem",fontWeight:portions===p?"700":"400",cursor:"pointer",fontFamily:"inherit"}}>{p}</button>
                  ))}
                </div>
                <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"18px",padding:"1.1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
                  {showIngs.map((ing,i)=>{
                    const factor=portions/2;
                    const scaledAmt=String(ing.amount||"").replace(/([0-9]+[.,]?[0-9]*)/g,n=>{const v=parseFloat(n.replace(",","."));const s=Math.round(v*factor*10)/10;return s%1===0?String(s):String(s);});
                    return(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.48rem 0",borderBottom:i<showIngs.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
                      <span style={{fontSize:"0.92rem"}}>{ing.name}</span>
                      <span style={{background:"rgba(255,255,255,0.1)",borderRadius:"20px",padding:"0.18rem 0.65rem",fontSize:"0.8rem",fontWeight:"700",color:"rgba(255,255,255,0.7)"}}>{scaledAmt}</span>
                    </div>
                  );})}
                </div>
              </div>
            )}
            {activeTab==="steps"&&(
              <div style={{marginBottom:"1rem"}}>
                {(showSteps?.length?showSteps:[t("mdb_fallback_step1"),t("mdb_fallback_step2"),t("mdb_fallback_step3")]).map((step,i)=>(
                  <div key={i} style={{display:"flex",gap:"0.9rem",marginBottom:"0.9rem",background:"rgba(255,255,255,0.05)",borderRadius:"14px",padding:"0.9rem 1rem",border:"1px solid rgba(255,255,255,0.07)"}}>
                    <div style={{minWidth:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:"900",flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:"0.9rem",lineHeight:1.55,color:"rgba(255,255,255,0.88)"}}>{step}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={()=>{isLiked?setLiked(p=>p.filter(x=>x.id!==r.id)):setLiked(p=>[...p.filter(x=>x.id!==r.id),r]);showToast(isLiked?t("detail_removed"):t("detail_saved_fav"),isLiked?"#ff6666":"#4ade80");}}
              style={{width:"100%",background:isLiked?"rgba(255,68,68,0.15)":"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:isLiked?"1px solid rgba(255,68,68,0.3)":"none",borderRadius:"16px",color:isLiked?"#ff8888":"white",padding:"1rem",fontSize:"0.95rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>
              {isLiked?t("detail_remove_fav"):t("detail_add_fav")}
            </button>
            <button onClick={()=>shareRecipe(r)}
              style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",color:"rgba(255,255,255,0.8)",padding:"0.9rem",fontSize:"0.9rem",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>{t("share_btn")}
            </button>
            {r._custom&&<button onClick={()=>{setCustomRecipes(p=>p.filter(x=>x.id!==r.id));setScreen(detailFrom);}} style={{width:"100%",background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"16px",color:"rgba(255,120,120,0.8)",padding:"0.9rem",fontSize:"0.85rem",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>{t("detail_delete_custom")}</button>}
            <button onClick={()=>setScreen(detailFrom)} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",color:"white",padding:"0.9rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",marginBottom:"2rem"}}>{t("detail_back")}</button>
          </div>
        </div>
        {FONT}
      </div>
    );
  }

  // ── ADD DISH ────────────────────────────────────────────────────────────
  if(showAddDish){
    const MEAL_OPTIONS=MEAL_OPTIONS_T;
    const toggleMeal=m=>{
      const cur=newDish.meal;
      const updated=cur.includes(m)?cur.filter(x=>x!==m):[...cur,m];
      if(updated.length>0)setNewDish(p=>({...p,meal:updated}));
    };
    // Photo optimization: crop, resize, warm food-photography look
    const optimizePhoto=(dataUrl)=>new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>{
        const c=document.createElement("canvas");
        const size=Math.min(img.width,img.height,1200);
        const sx=(img.width-size)/2,sy=(img.height-size)/2;
        c.width=800;c.height=800;
        const ctx=c.getContext("2d");
        // Draw cropped & resized
        ctx.drawImage(img,sx,sy,size,size,0,0,800,800);
        // Apply food-style color grading via pixel manipulation
        const imageData=ctx.getImageData(0,0,800,800);
        const d=imageData.data;
        for(let i=0;i<d.length;i+=4){
          // Brightness +5%
          let r=d[i]*1.05, g=d[i+1]*1.05, b=d[i+2]*1.05;
          // Warm shift: boost reds slightly, reduce blues slightly
          r=r*1.06; g=g*1.02; b=b*0.96;
          // Contrast boost (10%)
          r=((r/255-0.5)*1.1+0.5)*255;
          g=((g/255-0.5)*1.1+0.5)*255;
          b=((b/255-0.5)*1.1+0.5)*255;
          // Saturation boost (15%)
          const avg=(r+g+b)/3;
          r=avg+(r-avg)*1.15;
          g=avg+(g-avg)*1.15;
          b=avg+(b-avg)*1.15;
          d[i]=Math.max(0,Math.min(255,r));
          d[i+1]=Math.max(0,Math.min(255,g));
          d[i+2]=Math.max(0,Math.min(255,b));
        }
        ctx.putImageData(imageData,0,0);
        // Subtle warm vignette
        const grad=ctx.createRadialGradient(400,400,200,400,400,500);
        grad.addColorStop(0,"rgba(0,0,0,0)");
        grad.addColorStop(1,"rgba(20,10,0,0.2)");
        ctx.fillStyle=grad;
        ctx.fillRect(0,0,800,800);
        resolve(c.toDataURL("image/jpeg",0.85));
      };
      img.src=dataUrl;
    });
    const handlePhoto=e=>{
      const file=e.target.files[0];
      if(!file)return;
      const reader=new FileReader();
      reader.onload=async ev=>{
        showToast("📸 Foto wird optimiert...","#60a5fa");
        const optimized=await optimizePhoto(ev.target.result);
        setNewDish(p=>({...p,img:optimized}));
        showToast("✅ Foto optimiert!","#4ade80");
      };
      reader.readAsDataURL(file);
    };
    // AI Recipe Scan: analyze photo with Claude Vision to extract full recipe
    const handleRecipeScan=async e=>{
      const file=e.target.files[0];
      if(!file)return;
      if(!claudeKey){showToast("⚠️ Bitte Claude API Key in Einstellungen eingeben","#f39c12");return;}
      setScanning(true);
      showToast("🤖 Rezept wird erkannt...","#60a5fa");
      const reader=new FileReader();
      reader.onload=async ev=>{
        const base64=ev.target.result.split(",")[1];
        const mediaType=file.type||"image/jpeg";
        // Also optimize and set as dish photo
        const optimized=await optimizePhoto(ev.target.result);
        setNewDish(p=>({...p,img:optimized}));
        try{
          const res=await fetch("https://api.anthropic.com/v1/messages",{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              "x-api-key":claudeKey,
              "anthropic-version":"2023-06-01",
              "anthropic-dangerous-direct-browser-access":"true"
            },
            body:JSON.stringify({
              model:"claude-sonnet-4-20250514",
              max_tokens:2000,
              messages:[{role:"user",content:[
                {type:"image",source:{type:"base64",media_type:mediaType,data:base64}},
                {type:"text",text:`Du bist ein Rezept-Scanner. Analysiere dieses Foto genau. Es kann eine Rezeptkarte (HelloFresh, Chefkoch etc.), ein Screenshot, oder ein Foto von einem Gericht sein.

Extrahiere ALLE sichtbaren Informationen und antworte NUR mit diesem JSON (keine Backticks, kein Text davor/danach):
{"name":"Gerichtname","time":"z.B. 25 Min","cal":520,"protein":35,"carbs":45,"fat":18,"ingredients":"Zutat1 Menge1, Zutat2 Menge2, Zutat3 Menge3","steps":"Schritt 1 ausführlich.\\nSchritt 2 ausführlich.\\nSchritt 3 ausführlich.","meal":["lunch","dinner"]}

Wichtige Regeln:
- Wenn Zutaten auf dem Foto sichtbar sind: übernimm sie ALLE mit Mengenangaben
- Wenn Zubereitungsschritte sichtbar sind: übernimm sie wörtlich und ausführlich
- Wenn nur ein Foto vom Gericht ohne Text zu sehen ist: erkenne das Gericht und schreibe ein passendes Rezept mit typischen Zutaten und Schritten
- Schätze Nährwerte realistisch basierend auf den Zutaten
- meal: ["breakfast"] für Frühstück, ["lunch"] für Mittag, ["dinner"] für Abend, ["snack"] für Snacks
- Schreibe auf Deutsch`}
              ]}]
            })
          });
          if(!res.ok){const errText=await res.text();throw new Error(`API ${res.status}: ${errText}`);}
          const data=await res.json();
          const text=data.content?.map(c=>c.text||"").join("")||"";
          const clean=text.replace(/```json|```/g,"").trim();
          const parsed=JSON.parse(clean);
          setNewDish(p=>({
            ...p,
            name:parsed.name||p.name,
            time:parsed.time||p.time,
            cal:String(parsed.cal||p.cal),
            protein:String(parsed.protein||p.protein),
            carbs:String(parsed.carbs||p.carbs),
            fat:String(parsed.fat||p.fat),
            ingredients:parsed.ingredients||p.ingredients,
            steps:parsed.steps||p.steps,
            meal:Array.isArray(parsed.meal)?parsed.meal:p.meal,
          }));
          showToast("✅ Rezept erkannt! Prüfe & ergänze die Daten.","#4ade80");
        }catch(err){
          console.error("Scan error:",err);
          showToast("⚠️ Konnte Rezept nicht lesen – füll manuell aus","#f39c12");
        }
        setScanning(false);
      };
      reader.readAsDataURL(file);
    };
    const inp=(label,key,ph,type="text")=>(
      <div style={{marginBottom:"0.75rem"}}>
        <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.3rem"}}>{label}</div>
        <input value={newDish[key]} onChange={e=>setNewDish(p=>({...p,[key]:e.target.value}))} placeholder={ph} type={type}
          style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"white",padding:"0.7rem 1rem",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
      </div>
    );
    return(
      <div style={{minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
        <BG img={current?.img}/>
        <div style={{position:"relative",zIndex:1,padding:"1.2rem 1.4rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem"}}>
            <BackBtn to="swipe" onBack={()=>setShowAddDish(false)}/><h1 style={{margin:0,fontSize:"1.4rem",fontWeight:"800"}}>{t("add_title")}</h1>
          </div>

          {/* 🤖 AI REZEPT-SCAN */}
          <div style={{marginBottom:"1.2rem",background:claudeKey?"linear-gradient(135deg,rgba(96,165,250,0.15),rgba(139,92,246,0.15))":"rgba(255,255,255,0.04)",borderRadius:"16px",padding:"1rem",border:`1px solid ${claudeKey?"rgba(96,165,250,0.25)":"rgba(255,255,255,0.08)"}`}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:claudeKey?"rgba(96,165,250,0.9)":"rgba(255,255,255,0.25)",marginBottom:"0.5rem"}}>🤖 REZEPT PER FOTO ERKENNEN</div>
            {claudeKey?(
              <>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.75rem",marginBottom:"0.7rem",lineHeight:1.5}}>{t("set_ai_sub")}</div>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  <label style={{flex:1,background:scanning?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#60a5fa,#8b5cf6)",border:"none",borderRadius:"12px",color:"white",padding:"0.7rem",fontSize:"0.82rem",fontWeight:"700",cursor:scanning?"default":"pointer",textAlign:"center",display:"block",opacity:scanning?0.5:1}}>
                    {scanning?t("add_scanning"):t("add_scan")}
                    <input type="file" accept="image/*" capture="environment" onChange={handleRecipeScan} disabled={scanning} style={{display:"none"}}/>
                  </label>
                  <label style={{flex:1,background:scanning?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.08)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:"12px",color:"rgba(255,255,255,0.7)",padding:"0.7rem",fontSize:"0.82rem",cursor:scanning?"default":"pointer",textAlign:"center",display:"block",opacity:scanning?0.5:1}}>
                    {scanning?"⏳ ...":"🖼️ Foto aus Galerie"}
                    <input type="file" accept="image/*" onChange={handleRecipeScan} disabled={scanning} style={{display:"none"}}/>
                  </label>
                </div>
              </>
            ):(
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.78rem",lineHeight:1.5}}>{t("set_ai_without")}</div>
            )}
          </div>

          <div style={{position:"relative",marginBottom:"1.2rem"}}>
            <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",top:"-0.1rem",background:"#07070f",padding:"0 0.8rem",zIndex:1}}>
              <span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.2)",letterSpacing:"2px"}}>ODER MANUELL</span>
            </div>
            <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:"0.5rem"}}/>
          </div>

          {/* FOTO UPLOAD (manuell) */}
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.5rem"}}>FOTO (wird automatisch optimiert)</div>
            <div style={{display:"flex",gap:"0.6rem",alignItems:"flex-start"}}>
              {newDish.img&&<img src={newDish.img} alt="preview" style={{width:72,height:72,borderRadius:12,objectFit:"cover",flexShrink:0}}/>}
              <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",flex:1}}>
                <label style={{background:"linear-gradient(135deg,#8e44ad,#9b59b6)",border:"none",borderRadius:"12px",color:"white",padding:"0.65rem",fontSize:"0.82rem",fontWeight:"700",cursor:"pointer",textAlign:"center",display:"block"}}>
                  {t("add_photo")}
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/>
                </label>
                <label style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"12px",color:"rgba(255,255,255,0.7)",padding:"0.65rem",fontSize:"0.82rem",cursor:"pointer",textAlign:"center",display:"block"}}>
                  {t("add_gallery")}
                  <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
                </label>
              </div>
            </div>
          </div>

          {inp(t("add_name"),"name",t("add_name_ph"))}
          {inp(t("add_time"),"time",t("add_time_ph"))}

          {/* MAHLZEIT-ZUORDNUNG */}
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.5rem"}}>{t("add_meal")}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
              {MEAL_OPTIONS.map(({id,label})=>(
                <button key={id} onClick={()=>toggleMeal(id)}
                  style={{background:newDish.meal.includes(id)?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"rgba(255,255,255,0.08)",border:`1px solid ${newDish.meal.includes(id)?"transparent":"rgba(255,255,255,0.15)"}`,borderRadius:"50px",color:"white",padding:"0.45rem 0.9rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.8rem",fontWeight:newDish.meal.includes(id)?"700":"400"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* NÄHRWERTE */}
          <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.5rem"}}>{t("add_nutrition")}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"1rem"}}>
            {[[t("add_cal"),"cal","520"],[t("add_protein"),"protein","35"],[t("add_carbs"),"carbs","45"],[t("add_fat"),"fat","18"]].map(([label,key,ph])=>(
              <div key={key}>
                <div style={{fontSize:"0.58rem",letterSpacing:"1px",color:"rgba(255,255,255,0.3)",marginBottom:"0.25rem"}}>{label}</div>
                <input value={newDish[key]} onChange={e=>setNewDish(p=>({...p,[key]:e.target.value}))} placeholder={ph} type="number"
                  style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"10px",color:"white",padding:"0.6rem 0.8rem",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>

          {/* Nährwert Vorschau */}
          {(newDish.protein||newDish.carbs||newDish.fat)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.4rem",marginBottom:"1rem"}}>
              {[{l:t("lbl_protein"),v:newDish.protein||0,c:"#4ade80"},{l:t("lbl_carbs"),v:newDish.carbs||0,c:"#60a5fa"},{l:t("lbl_fat"),v:newDish.fat||0,c:"#fb923c"}].map(m=>(
                <div key={m.l} style={{background:"rgba(255,255,255,0.06)",borderRadius:"10px",padding:"0.5rem",textAlign:"center"}}>
                  <div style={{fontSize:"1rem",fontWeight:"800",color:m.c}}>{m.v}g</div>
                  <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.3)"}}>{m.l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{marginBottom:"0.75rem"}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.3rem"}}>{t("add_ingredients")}</div>
            <textarea value={newDish.ingredients} onChange={e=>setNewDish(p=>({...p,ingredients:e.target.value}))} rows={2}
              placeholder={t("add_ingredients_ph")}
              style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"white",padding:"0.7rem 1rem",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",resize:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:"1.2rem"}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.3rem"}}>{t("add_steps")}</div>
            <textarea value={newDish.steps} onChange={e=>setNewDish(p=>({...p,steps:e.target.value}))} rows={4}
              placeholder={t("add_steps_ph")}
              style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"white",padding:"0.7rem 1rem",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",resize:"none",boxSizing:"border-box"}}/>
          </div>
          <button onClick={()=>{
            if(!newDish.name)return showToast(t("add_err_name"),"#ff4444");
            if(!newDish.meal||newDish.meal.length===0)return showToast(t("add_err_meal"),"#ff4444");
            const dish={
              id:Date.now(),
              name:newDish.name,
              time:newDish.time||"? Min",
              cal:parseInt(newDish.cal)||0,
              protein:parseInt(newDish.protein)||0,
              carbs:parseInt(newDish.carbs)||0,
              fat:parseInt(newDish.fat)||0,
              meal:newDish.meal,
              tags:["Eigene DB"],
              src:"Eigene DB",
              srcColor:"#8e44ad",
              img:newDish.img||FALLBACK,
              allergens:[],
              steps:newDish.steps.split("\n").filter(s=>s.trim()),
              ingredients:newDish.ingredients.split(",").map(s=>{
                const parts=s.trim().split(" ");
                const amount=parts[parts.length-1];
                const name=parts.slice(0,-1).join(" ")||s.trim();
                return{name,amount};
              }).filter(i=>i.name),
              _custom:true
            };
            setCustomRecipes(p=>[...p,dish]);
            setNewDish({name:"",time:"15 Min",cal:"",protein:"",carbs:"",fat:"",img:"",ingredients:"",steps:"",meal:["dinner"]});
            setShowAddDish(false);
            applyFilter(moodFilter,selectedAllergens);
            showToast(t("add_success"));
          }} style={{width:"100%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1.1rem",fontSize:"1rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>
            {t("add_save")}
          </button>
          <button onClick={()=>setShowAddDish(false)} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",color:"white",padding:"1rem",fontFamily:"inherit",cursor:"pointer",marginBottom:"2rem"}}>{t("add_cancel")}</button>
        </div>
        {FONT}
      </div>
    );
  }

  // ── SHOPPING ────────────────────────────────────────────────────────────
  if(screen==="shopping")return(
    <div style={{minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
      <BG img={current?.img}/>
      <div style={{position:"relative",zIndex:1,padding:"1.4rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem"}}>
          <BackBtn to="swipe"/>
          <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800"}}>{t("shop_title")}</h1>
          {shoppingList.length>0&&<span style={{background:"#ff6b35",borderRadius:"50px",padding:"0.2rem 0.75rem",fontSize:"0.75rem",fontWeight:"700",marginLeft:"auto"}}>{shoppingList.filter(i=>!checkedItems[i.name]).length} {t("shop_open")}</span>}
        </div>
        {shoppingList.length===0
          ?<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",marginTop:"6rem"}}><div style={{fontSize:"3rem"}}>🛒</div><p>{t("shop_empty_sub")}</p></div>
          :<>
            {shoppingList.map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"1rem",padding:"0.9rem 1rem",background:"rgba(255,255,255,0.07)",backdropFilter:"blur(10px)",borderRadius:"14px",marginBottom:"0.5rem",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div onClick={()=>setCheckedItems(p=>({...p,[item.name]:!p[item.name]}))} style={{width:24,height:24,borderRadius:7,border:`2px solid ${checkedItems[item.name]?"#4ade80":"rgba(255,255,255,0.25)"}`,background:checkedItems[item.name]?"#4ade80":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                  {checkedItems[item.name]&&<span style={{color:"#000",fontSize:"0.72rem",fontWeight:"900"}}>✓</span>}
                </div>
                <span onClick={()=>setCheckedItems(p=>({...p,[item.name]:!p[item.name]}))} style={{flex:1,textDecoration:checkedItems[item.name]?"line-through":"none",opacity:checkedItems[item.name]?0.4:1,cursor:"pointer",fontSize:"0.92rem"}}>{item.name}</span>
                <span style={{background:"rgba(255,255,255,0.1)",borderRadius:"20px",padding:"0.18rem 0.65rem",fontSize:"0.78rem",fontWeight:"700",color:"rgba(255,255,255,0.6)"}}>{item.amount}</span>
                <button onClick={()=>setShoppingList(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:"1rem",cursor:"pointer"}}>✕</button>
              </div>
            ))}
            <button onClick={()=>{setShoppingList([]);setCheckedItems({});}} style={{width:"100%",marginTop:"1rem",background:"rgba(255,68,68,0.12)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"14px",color:"rgba(255,120,120,0.8)",padding:"0.9rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",marginBottom:"2rem"}}>{t("shop_clear")}</button>
          </>}
      </div>
      {FONT}
    </div>
  );

  // ── FAVORITES ───────────────────────────────────────────────────────────
  if(screen==="favorites")return(
    <div style={{minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
      <BG img={current?.img}/>
      <div style={{position:"relative",zIndex:1,padding:"1.4rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem"}}>
          <BackBtn to="swipe"/>
          <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800"}}>{t("fav_title")}</h1>
          {liked.length>0&&<span style={{marginLeft:"auto",background:"rgba(255,107,53,0.3)",borderRadius:"50px",padding:"0.2rem 0.75rem",fontSize:"0.75rem",fontWeight:"700",color:"#ff9a3c"}}>{liked.length}</span>}
        </div>
        {liked.length===0
          ?<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",marginTop:"4rem"}}><div style={{fontSize:"3rem"}}>🍽️</div><p>{t("fav_empty_sub")}</p></div>
          :<div style={{display:"grid",gap:"0.8rem",marginBottom:"1.5rem"}}>
            {liked.map((r,i)=>(
              <div key={i} onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");setActiveTab("ingredients");}} style={{borderRadius:"16px",overflow:"hidden",background:"rgba(255,255,255,0.07)",backdropFilter:"blur(10px)",display:"flex",height:"90px",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer"}}>
                <img src={r.img} alt={r.name} style={{width:90,height:90,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.src=FALLBACK;}}/>
                <div style={{padding:"0.8rem 1rem",flex:1}}>
                  <div style={{fontWeight:"700",fontSize:"0.95rem",marginBottom:"0.25rem"}}>{trName(r)}</div>
                  <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.78rem"}}>⏱ {r.time} · 🔥 {r.cal||"?"} kcal</div>
                  <div style={{color:"#4ade80",fontSize:"0.78rem",marginTop:"0.2rem"}}>💪 {r.protein?`${r.protein}g`:""} {t("lbl_protein")}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",paddingRight:"1rem",color:"rgba(255,255,255,0.3)"}}>›</div>
              </div>
            ))}
          </div>}
        {history.length>0&&<>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"0.8rem"}}>{t("fav_history")}</div>
          {history.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"0.8rem",padding:"0.5rem",borderRadius:"12px",marginBottom:"0.3rem",background:"rgba(255,255,255,0.03)",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              <img onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");setActiveTab("ingredients");}} src={r.img} alt={r.name} style={{width:42,height:42,borderRadius:8,objectFit:"cover"}} onError={e=>{e.target.src=FALLBACK;}}/>
              <span onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");}} style={{flex:1,fontSize:"0.88rem"}}>{trName(r)}</span>
              <span>{r.action==="right"?"❤️":"✖️"}</span>
              <button onClick={()=>setHistory(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:"0.85rem",cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <button onClick={()=>setHistory([])} style={{width:"100%",marginTop:"0.8rem",background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"12px",color:"rgba(255,120,120,0.7)",padding:"0.75rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem",marginBottom:"2rem"}}>{t("fav_clear_history")}</button>
        </>}
      </div>
      {FONT}
    </div>
  );

  // ── SETTINGS ────────────────────────────────────────────────────────────
  if(screen==="settings")return(
    <div style={{minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
      <BG img={current?.img}/><ToastEl/>
      <div style={{position:"relative",zIndex:1,padding:"1.4rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem"}}>
          <BackBtn to="swipe"/>
          <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800"}}>{t("set_title")}</h1>
        </div>
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.6rem"}}>{t("set_profile")}</div>
          <div style={{color:"rgba(255,255,255,0.6)"}}>👋 {t("set_hey")} <strong style={{color:"white"}}>{userName||"Foodie"}</strong>!</div>
          <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.78rem",marginTop:"0.25rem"}}>{allRecipes.length} {t("set_recipes")} · {liked.length} {t("set_favs")} · {seenIds.length} {t("set_seen")}</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.5rem"}}>{t("set_mealdb_title")}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.78rem",marginBottom:"0.8rem",lineHeight:1.5}}>{t("set_mealdb_sub")}</div>
          <button onClick={()=>fetchSpoonacular()} disabled={spoonLoading}
            style={{width:"100%",background:spoonLoaded?"rgba(46,204,113,0.2)":"linear-gradient(135deg,#e67e22,#f39c12)",border:spoonLoaded?"1px solid rgba(46,204,113,0.3)":"none",borderRadius:"10px",color:"white",padding:"0.75rem",fontSize:"0.85rem",fontWeight:"700",cursor:spoonLoading?"default":"pointer",fontFamily:"inherit",opacity:spoonLoading?0.5:1}}>
            {spoonLoading?t("set_mealdb_loading"):spoonLoaded?`✅ ${spoonRecipes.length} ${t("set_mealdb_loaded")}`:t("set_mealdb_btn")}
          </button>
        </div>
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(96,165,250,0.15)"}}>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(96,165,250,0.9)",marginBottom:"0.5rem"}}>{t("set_ai_title")}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.78rem",marginBottom:"0.8rem",lineHeight:1.5}}>{t("set_ai_sub")} {t("set_ai_sub2")} <strong style={{color:"#60a5fa"}}>console.anthropic.com</strong> {t("set_ai_sub3")}</div>
          <input value={claudeKey} onChange={e=>setClaudeKey(e.target.value)} placeholder="sk-ant-api03-..." type="password"
            style={{width:"100%",background:"rgba(255,255,255,0.08)",border:`1px solid ${claudeKey?"rgba(96,165,250,0.3)":"rgba(255,255,255,0.15)"}`,borderRadius:"10px",color:"white",padding:"0.7rem 1rem",fontSize:"0.85rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:"0.5rem"}}/>
          <div style={{color:claudeKey?"rgba(96,165,250,0.7)":"rgba(255,255,255,0.25)",fontSize:"0.72rem"}}>{claudeKey?t("set_ai_saved"):t("set_ai_without")}</div>
        </div>
        {/* LANGUAGE PICKER */}
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.6rem"}}>{t("set_lang_title")}</div>
          <select value={lang} onChange={e=>saveLang(e.target.value)}
            style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"12px",color:"white",padding:"0.8rem 1rem",fontSize:"1rem",fontFamily:"inherit",outline:"none",appearance:"none",WebkitAppearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(255,255,255,0.5)' viewBox='0 0 16 16'%3E%3Cpath d='M1.5 5.5l6.5 6.5 6.5-6.5'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 1rem center",cursor:"pointer"}}>
            {LANG_OPTIONS.map(lo=>(
              <option key={lo.id} value={lo.id} style={{background:"#1a1a2e",color:"white"}}>{lo.label}</option>
            ))}
          </select>
        </div>
        <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.8rem"}}>{t("set_allergens")}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.6rem",marginBottom:"0.8rem"}}>
          {[...new Set([...ALLERGENS_LIST,...selectedAllergens])].map(a=>(
            <button key={a} onClick={()=>{const n=selectedAllergens.includes(a)?selectedAllergens.filter(x=>x!==a):[...selectedAllergens,a];setSelectedAllergens(n);applyFilter(moodFilter,n);}}
              style={{background:selectedAllergens.includes(a)?"rgba(255,68,68,0.25)":"rgba(255,255,255,0.08)",border:`1px solid ${selectedAllergens.includes(a)?"#ff4444":"rgba(255,255,255,0.12)"}`,borderRadius:"50px",color:selectedAllergens.includes(a)?"#ff8888":"rgba(255,255,255,0.7)",padding:"0.55rem 1.1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem"}}>
              {selectedAllergens.includes(a)?"✗ ":""}{tA(a)}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.5rem"}}>
          <input id="customAllergen" placeholder={t("set_allergen_input")} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"10px",color:"white",padding:"0.6rem 0.8rem",fontSize:"0.85rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          <button onClick={()=>{const inp=document.getElementById("customAllergen");const v=inp?.value?.trim();if(!v)return;if(!selectedAllergens.includes(v)){const n=[...selectedAllergens,v];setSelectedAllergens(n);applyFilter(moodFilter,n);showToast(`✅ "${v}" ${t("toast_allergen_added")}`);}inp.value="";}} style={{background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"10px",color:"white",padding:"0.6rem 1rem",fontSize:"0.85rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{t("set_allergen_add")}</button>
        </div>
        <button onClick={()=>{setSeenIds([]);showToast(t("toast_reset"));}} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",color:"rgba(255,255,255,0.5)",padding:"0.8rem",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>{t("set_reset_seen")}</button>
        {/* AUFGABE 5: Kalorientracker */}
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.6rem"}}>📊 {t("set_cal_title")}</div>
          <div style={{display:"flex",gap:"0.4rem",marginBottom:"0.8rem"}}>
            {[1500,1800,2000,2500].map(g=>(
              <button key={g} onClick={()=>{setCalGoal(g);save("fs_cal_goal",g);}}
                style={{flex:1,background:calGoal===g?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"rgba(255,255,255,0.08)",border:"none",borderRadius:"8px",color:"white",padding:"0.45rem 0",fontSize:"0.72rem",fontWeight:calGoal===g?"700":"400",cursor:"pointer",fontFamily:"inherit"}}>{g}</button>
            ))}
          </div>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"10px",padding:"0.7rem",position:"relative",overflow:"hidden",marginBottom:"0.5rem"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${Math.min((dailyCals.total/calGoal)*100,100)}%`,background:"linear-gradient(90deg,rgba(255,107,53,0.4),rgba(255,107,53,0.15))",borderRadius:"10px",transition:"width 0.5s"}}/>
            <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"1.2rem",fontWeight:"800",color:dailyCals.total>calGoal?"#ff6666":"#4ade80"}}>{dailyCals.total} kcal</span>
              <span style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.4)"}}>/ {calGoal} kcal</span>
            </div>
          </div>
          <button onClick={()=>{const d={date:new Date().toDateString(),total:0};setDailyCals(d);save("fs_daily_cals",d);}} style={{background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"10px",color:"rgba(255,120,120,0.7)",padding:"0.4rem 1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem"}}>{t("set_cal_reset")}</button>
        </div>

        {/* AUFGABE 4: Geschmacksprofil */}
        {Object.keys(tagScores).length>0&&(
          <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.6rem"}}>🧠 {t("set_taste_profile")}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginBottom:"0.6rem"}}>
              {Object.entries(tagScores).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([tag,score])=>(
                <span key={tag} style={{background:`rgba(255,107,53,${Math.min(0.1+score*0.05,0.4)})`,border:"1px solid rgba(255,107,53,0.3)",borderRadius:"20px",padding:"0.3rem 0.7rem",fontSize:"0.78rem",color:"white"}}>{tag} <span style={{color:"rgba(255,255,255,0.4)"}}>{score}×</span></span>
              ))}
            </div>
            <button onClick={()=>{setTagScores({});save("fs_tag_scores",{});}} style={{background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"10px",color:"rgba(255,120,120,0.7)",padding:"0.4rem 1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem"}}>Reset</button>
          </div>
        )}

        {/* AUFGABE 6: Paar-Modus */}
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(255,107,157,0.15)"}}>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.5rem"}}>👫 {t("set_paar_title")}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.78rem",marginBottom:"0.8rem",lineHeight:1.5}}>{t("set_paar_sub")}</div>
          <button onClick={()=>setPaarMode(p=>!p)}
            style={{width:"100%",background:paarMode?"linear-gradient(135deg,#ff6b9d,#ff85b3)":"rgba(255,255,255,0.08)",border:`1px solid ${paarMode?"rgba(255,107,157,0.4)":"rgba(255,255,255,0.12)"}`,borderRadius:"12px",color:"white",padding:"0.7rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.6rem"}}>
            {paarMode?t("set_paar_on"):t("set_paar_off")}
          </button>
          {paarMode&&(
            <div>
              <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem"}}>
                {["A","B"].map(p=>(
                  <button key={p} onClick={()=>setCurrentPerson(p)}
                    style={{flex:1,background:currentPerson===p?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"rgba(255,255,255,0.07)",border:"none",borderRadius:"10px",color:"white",padding:"0.55rem",fontWeight:currentPerson===p?"800":"400",cursor:"pointer",fontFamily:"inherit"}}>Person {p}</button>
                ))}
              </div>
              <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.35)",textAlign:"center",marginBottom:"0.5rem"}}>{t("set_paar_person")} {currentPerson} · A: {paarLikesA.length} ❤️ · B: {paarLikesB.length} ❤️</div>
              <button onClick={()=>{setPaarLikesA([]);setPaarLikesB([]);save("fs_paar_a",[]);save("fs_paar_b",[]);}} style={{background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"10px",color:"rgba(255,120,120,0.7)",padding:"0.4rem 1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem"}}>{t("set_paar_reset")}</button>
            </div>
          )}
        </div>

        <button onClick={()=>{localStorage.removeItem("fs_onboarded");setOnboarded(false);setObStep(0);}} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",color:"rgba(255,255,255,0.3)",padding:"0.8rem",cursor:"pointer",fontFamily:"inherit",marginBottom:"2rem"}}>{t("set_redo_onboarding")}</button>
      </div>
      {FONT}
    </div>
  );

  // ── MAIN SWIPE ───────────────────────────────────────────────────────────
  return(
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",color:"white",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",inset:0,zIndex:0}}>
        {current&&<>
          <img key={current.id} src={current.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.src=FALLBACK;}}/>
          <div style={{position:"absolute",inset:0,backdropFilter:"blur(50px) saturate(1.4)",background:"rgba(4,4,10,0.72)"}}/>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(0,0,0,0.5) 100%)"}}/>
        </>}
      </div>
      <ToastEl/>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",height:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"max(1rem,env(safe-area-inset-top,1rem)) 1.2rem 0.2rem"}}>
          <button onClick={()=>setScreen("favorites")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>❤️ <span style={{color:"rgba(255,255,255,0.5)"}}>{liked.length}</span></button>
          <div style={{display:"flex",alignItems:"center",gap:"0.4rem",flexDirection:"column"}}>{paarMode&&<div style={{fontSize:"0.6rem",color:"#ff69b4",fontWeight:"700"}}>👫 Person {currentPerson}</div>}<div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}><img src={LOGO_URL} alt="FoodSwipe" style={{width:28,height:28,borderRadius:6}} onError={e=>{e.target.style.display="none";}}/><span style={{fontSize:"1.1rem",fontWeight:"900",background:"linear-gradient(90deg,#ff6b35,#ffcc02)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{userName?`Hey ${userName.split(" ")[0]}!`:"FoodSwipe"}</span></div></div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <button onClick={()=>setScreen("shopping")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 0.85rem",cursor:"pointer",fontSize:"0.95rem",position:"relative"}}>
              🛒{shoppingList.length>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#ff6b35",borderRadius:"50%",width:16,height:16,fontSize:"0.5rem",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700"}}>{shoppingList.length}</span>}
            </button>
            <button onClick={()=>setScreen("settings")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 0.85rem",cursor:"pointer",fontSize:"0.95rem"}}>⚙️</button>
          </div>
        </div>
        <div style={{padding:"0.3rem 1rem 0.35rem",display:"flex",gap:"0.4rem",overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
          {MOODS_T.map(m=>(
            <button key={m.id} onClick={()=>{setMoodFilter(m.id);applyFilter(m.id,selectedAllergens);}}
              style={{background:moodFilter===m.id?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:`1px solid ${moodFilter===m.id?"transparent":"rgba(255,255,255,0.1)"}`,borderRadius:"50px",color:"white",padding:"0.3rem 0.9rem",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",fontSize:"0.73rem",fontWeight:moodFilter===m.id?"700":"400",flexShrink:0}}>
              {m.id==="Zur Uhrzeit"?`${slotInfo.emoji} ${m.l}`:m.l}
            </button>
          ))}
          <button onClick={()=>setShowAddDish(true)} style={{background:"rgba(142,68,173,0.3)",backdropFilter:"blur(10px)",border:"1px solid rgba(142,68,173,0.4)",borderRadius:"50px",color:"#c39bd3",padding:"0.3rem 0.9rem",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",fontSize:"0.73rem",fontWeight:"700",flexShrink:0}}>{t("swipe_own")}</button>
        </div>
        <div style={{padding:"0 1.2rem 0.1rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.22)"}}>{allRecipes.length} {t("swipe_dishes")}</span>
          {spoonLoaded&&<span style={{fontSize:"0.65rem",background:"rgba(230,126,34,0.2)",color:"#e67e22",borderRadius:"20px",padding:"0.1rem 0.5rem"}}>+MealDB</span>}
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0.2rem 1.2rem",position:"relative",minHeight:0}}>
          {next&&current?.id!==next?.id&&(
            <div style={{position:"absolute",width:"100%",maxWidth:"420px",borderRadius:"28px",overflow:"hidden",transform:"scale(0.93) translateY(14px)",zIndex:1}}>
              <img src={next.img} alt="" style={{width:"100%",height:"360px",objectFit:"cover",filter:"brightness(0.25) blur(2px)"}} onError={e=>{e.target.src=FALLBACK;}}/>
            </div>
          )}
          {current?(
            <div style={{position:"relative",width:"100%",maxWidth:"420px",zIndex:2,borderRadius:"28px",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.7)",cursor:isDragging?"grabbing":"grab",...cardAnim}}
              onMouseDown={onDS} onMouseMove={onDM} onMouseUp={onDE} onMouseLeave={onDE}
              onTouchStart={onDS} onTouchMove={onDM} onTouchEnd={onDE}>
              <div style={{position:"relative",height:"285px",overflow:"hidden"}}>
                <img src={current.img} alt={current.name} draggable={false}
                  style={{width:"100%",height:"100%",objectFit:"cover",display:"block",pointerEvents:"none",transform:isDragging?`scale(1.04) translateX(${dragX*0.015}px)`:"scale(1)",transition:isDragging?"none":"transform 0.3s"}}
                  onError={e=>{e.target.src=FALLBACK;}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,transparent 35%,transparent 45%,rgba(4,4,10,1) 100%)"}}/>
                <div style={{position:"absolute",top:"1rem",right:"1rem",background:current.srcColor,borderRadius:"20px",padding:"0.22rem 0.8rem",fontSize:"0.68rem",fontWeight:"800",color:"white"}}>{current.src}</div>
                <div style={{position:"absolute",top:"1.1rem",left:"1.1rem",border:"2.5px solid #ff4444",borderRadius:"8px",padding:"0.2rem 0.7rem",color:"#ff4444",fontWeight:"900",fontSize:"1rem",letterSpacing:"2px",opacity:nopeOp,transform:"rotate(-14deg)",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}}>{t("swipe_nope")}</div>
                <div style={{position:"absolute",top:"1.1rem",left:"5rem",border:"2.5px solid #4ade80",borderRadius:"8px",padding:"0.2rem 0.7rem",color:"#4ade80",fontWeight:"900",fontSize:"1rem",letterSpacing:"2px",opacity:likeOp,transform:"rotate(14deg)",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}}>{t("swipe_like")}</div>
                <button onClick={()=>{setDetailRecipe(current);setDetailFrom("swipe");setScreen("detail");setActiveTab("ingredients");}} style={{position:"absolute",bottom:"3.5rem",right:"0.8rem",background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"20px",color:"rgba(255,255,255,0.7)",padding:"0.25rem 0.7rem",fontSize:"0.68rem",cursor:"pointer",fontFamily:"inherit",backdropFilter:"blur(10px)"}}>{t("swipe_recipe")}</button>
                <div style={{position:"absolute",bottom:"1rem",left:"1.1rem",right:"1.1rem"}}>
                  <div style={{fontSize:"1.55rem",fontWeight:"900",lineHeight:1.15}}>{trName(current)}</div>
                  <div style={{display:"flex",gap:"0.9rem",marginTop:"0.3rem",fontSize:"0.8rem",color:"rgba(255,255,255,0.7)"}}>
                    <span>⏱ {current.time}</span><span>🔥 {current.cal||"?"} kcal</span><span style={{color:"#4ade80"}}>💪 {current.protein?`${current.protein}g`:"?"}</span>
                  </div>
                </div>
              </div>
              <div style={{background:"rgba(8,8,18,0.96)",backdropFilter:"blur(20px)",padding:"0.75rem 1.1rem 0.9rem"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem",marginBottom:"0.65rem"}}>
                  {[{l:t("lbl_protein"),v:current.protein,c:"#4ade80"},{l:t("lbl_carbs"),v:current.carbs,c:"#60a5fa"},{l:t("lbl_fat"),v:current.fat,c:"#fb923c"}].map(m=>(
                    <div key={m.l} style={{background:"rgba(255,255,255,0.06)",borderRadius:"10px",padding:"0.38rem",textAlign:"center"}}>
                      <div style={{fontSize:"0.92rem",fontWeight:"800",color:m.c}}>{m.v?`${m.v}g`:"—"}</div>
                      <div style={{fontSize:"0.56rem",color:"rgba(255,255,255,0.3)",letterSpacing:"1px"}}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>
                  {trIngs(current).slice(0,4).map((ing,i)=>(
                    <span key={i} style={{background:"rgba(255,255,255,0.07)",borderRadius:"20px",padding:"0.16rem 0.58rem",fontSize:"0.7rem",color:"rgba(255,255,255,0.6)"}}>{ing.name} <span style={{color:"rgba(255,255,255,0.28)"}}>{ing.amount}</span></span>
                  ))}
                  {current.ingredients.length>4&&<span style={{background:"rgba(255,255,255,0.04)",borderRadius:"20px",padding:"0.16rem 0.58rem",fontSize:"0.7rem",color:"rgba(255,255,255,0.22)"}}>+{current.ingredients.length-4}</span>}
                </div>
              </div>
            </div>
          ):(
            <div style={{textAlign:"center",color:"rgba(255,255,255,0.4)",padding:"2rem"}}>
              <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🍴</div>
              <div style={{fontSize:"1.1rem",fontWeight:"700"}}>{t("swipe_no_recipes")}</div>
              <div style={{fontSize:"0.85rem",marginTop:"0.5rem"}}>{t("swipe_change_filter")}</div>
            </div>
          )}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:"1.5rem",padding:"0.5rem 1.5rem max(1.2rem,env(safe-area-inset-bottom,1.2rem))",alignItems:"center",flexShrink:0}}>
          <button onClick={()=>doSwipe("left")} style={{width:60,height:60,borderRadius:"50%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"2px solid rgba(255,68,68,0.7)",color:"#ff6666",fontSize:"1.4rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",boxShadow:"0 4px 20px rgba(255,68,68,0.2)"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.12)";e.currentTarget.style.background="rgba(255,68,68,0.2)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.background="rgba(255,255,255,0.08)";}}>✕</button>
          <button onClick={()=>{setDeck(shuffle(buildDeck(moodFilter,selectedAllergens,seenIds)));setDeckIndex(0);showToast(t("toast_shuffled"));}} style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)",color:"#ffcc02",fontSize:"0.95rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔀</button>
          <button onClick={()=>doSwipe("right")} style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",color:"white",fontSize:"1.4rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",boxShadow:"0 4px 28px rgba(255,107,53,0.5)"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.12)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>❤️</button>
        </div>
      </div>
      {FONT}
    </div>
  );
}
