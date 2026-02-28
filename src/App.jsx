import { useState, useRef, useCallback, useEffect } from "react";

const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const getSlot = () => { const h=new Date().getHours(); if(h>=6&&h<11)return"morning"; if(h>=11&&h<15)return"lunch"; if(h>=15&&h<18)return"snack"; return"dinner"; };
const slotLabel = { morning:{emoji:"🌅",sub:"Frühstücks-Ideen"}, lunch:{emoji:"☀️",sub:"Mittagsideen"}, snack:{emoji:"🌆",sub:"Schnelle Snacks"}, dinner:{emoji:"🌙",sub:"Dinner-Ideen"} };
const slotMap = { morning:"breakfast", lunch:"lunch", snack:"snack", dinner:"dinner" };
const load = (key, fallback) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
const IMGS = {
  bowl:       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  pasta:      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
  steak:      "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80",
  shakshuka:  "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&q=80",
  salmon:     "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
  curry:      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
  salad:      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
  rice:       "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80",
  pancakes:   "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
  avocado:    "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800&q=80",
  shawarma:   "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=800&q=80",
  burger:     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  oats:       "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80",
  buddha:     "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  bulgogi:    "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
  granola:    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
  shrimp:     "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80",
  padthai:    "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
  pizza:      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  toast:      "https://images.unsplash.com/photo-1484723091739-30990c20f6df?w=800&q=80",
  tikka:      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80",
  ramen:      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
  sushi:      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80",
  sandwich:   "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800&q=80",
  smoothie:   "https://images.unsplash.com/photo-1494888427482-242d32babc0b?w=800&q=80",
  ribs:       "https://images.unsplash.com/photo-1544025162-d76538b2a681?w=800&q=80",
  falafel:    "https://images.unsplash.com/photo-1580584126903-c17d41830450?w=800&q=80",
  risotto:    "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80",
  omelette:   "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80",
  chicken:    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80",
  tacos:      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  pho:        "https://images.unsplash.com/photo-1582878826629-33b69f5a9f41?w=800&q=80",
  gyoza:      "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80",
  biryani:    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  hummus:     "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=800&q=80",
  soup:       "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
  nachos:     "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80",
  waffles:    "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?w=800&q=80",
  wrap:       "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=800&q=80",
  schnitzel:  "https://images.unsplash.com/photo-1599921841143-819065a55cc5?w=800&q=80",
  grill:      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
  muffin:     "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
  caprese:    "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80",
  pulled:     "https://images.unsplash.com/photo-1544025162-d76538b2a681?w=800&q=80",
  kimchi:     "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80",
  pesto:      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
  benedict:   "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80",
  paella:     "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80",
};

const R=(id,name,time,cal,protein,carbs,fat,meal,tags,src,srcColor,img,allergens,steps,ingredients)=>({id,name,time,cal,protein,carbs,fat,meal,tags,src,srcColor,img,allergens,steps,ingredients});

const LOCAL_RECIPES=[
  R(1,"Teriyaki Chicken Bowl","25 Min",540,42,48,12,["lunch","dinner"],["Hähnchen","Protein"],"HelloFresh","#7cb518",IMGS.bowl,["Soja","Sesam"],
    ["Reis 15 Min kochen.","Hähnchen würfeln, salzen & pfeffern.","Sojasoße, Honig, Ingwer zu Marinade rühren.","Hähnchen 4-5 Min goldbraun anbraten.","Marinade dazu, 2-3 Min einkochen.","Anrichten, mit Sesam & Frühlingszwiebeln bestreuen."],
    [{name:"Hähnchenbrust",amount:"300g"},{name:"Jasminreis",amount:"150g"},{name:"Sojasoße",amount:"3 EL"},{name:"Honig",amount:"2 EL"},{name:"Sesam",amount:"1 TL"},{name:"Ingwer",amount:"1 Stück"}]),
  R(2,"Spaghetti Carbonara","20 Min",680,28,72,28,["lunch","dinner"],["Pasta","Klassiker"],"YouTube","#cc0000",IMGS.pasta,["Gluten","Ei","Milch"],
    ["Pasta kochen, 1 Tasse Nudelwasser aufheben!","Guanciale in kalter Pfanne knusprig braten.","Eier + Pecorino + Pfeffer verquirlen.","Pfanne vom Herd, Pasta rein.","Ei-Mix unterrühren, mit Nudelwasser cremig machen.","Sofort servieren!"],
    [{name:"Spaghetti",amount:"200g"},{name:"Guanciale",amount:"100g"},{name:"Pecorino",amount:"60g"},{name:"Eier",amount:"3 Stück"},{name:"Schwarzer Pfeffer",amount:"reichlich"}]),
  R(3,"Beef Steak & Gemüse","30 Min",620,55,18,32,["dinner"],["Rind","Protein"],"HelloFresh","#7cb518",IMGS.steak,[],
    ["Steak 30 Min auf Raumtemperatur kommen lassen.","Gemüse mit Öl + Gewürzen bei 200°C 20 Min rösten.","Pfanne sehr heiß, Steak 2-3 Min pro Seite anbraten.","5 Min ruhen lassen – nicht anschneiden!","Aufschneiden, mit Gemüse servieren."],
    [{name:"Rindersteak",amount:"250g"},{name:"Broccoli",amount:"200g"},{name:"Karotten",amount:"2 Stück"},{name:"Olivenöl",amount:"2 EL"},{name:"Rosmarin",amount:"2 Zweige"}]),
  R(4,"Shakshuka","20 Min",380,22,28,18,["breakfast","lunch"],["Vegetarisch","Eier"],"YouTube","#cc0000",IMGS.shakshuka,["Ei"],
    ["Zwiebel + Paprika 5 Min dünsten.","Knoblauch + Kreuzkümmel 1 Min anrösten.","Tomaten dazu, 5 Min köcheln & würzen.","4 Mulden in Sauce drücken, Eier reingleiten lassen.","Deckel drauf, 5-7 Min bei niedriger Hitze.","Mit frischem Koriander & Fladenbrot servieren."],
    [{name:"Eier",amount:"4 Stück"},{name:"Tomaten Dose",amount:"400g"},{name:"Paprika",amount:"2 Stück"},{name:"Zwiebel",amount:"1 Stück"},{name:"Kreuzkümmel",amount:"1 TL"}]),
  R(5,"Lachs Teriyaki","25 Min",510,46,22,24,["lunch","dinner"],["Fisch","Protein"],"HelloFresh","#7cb518",IMGS.salmon,["Fisch","Soja"],
    ["Teriyaki-Sauce aus Sojasoße, Mirin & Zucker rühren.","Lachs trocken tupfen, Haut zuerst in heiße Pfanne.","3-4 Min bis Haut knusprig, dann wenden.","Sauce dazugeben, 2-3 Min glasieren.","Mit Jasminreis & Frühlingszwiebeln servieren."],
    [{name:"Lachsfilet",amount:"200g"},{name:"Sojasoße",amount:"3 EL"},{name:"Mirin",amount:"2 EL"},{name:"Jasminreis",amount:"150g"},{name:"Frühlingszwiebeln",amount:"2 Stück"}]),
  R(6,"Thai Green Curry","35 Min",580,34,44,26,["dinner"],["Thai","Scharf"],"YouTube","#cc0000",IMGS.curry,["Nüsse"],
    ["Curry-Paste in Kokosöl 1 Min anrösten bis es duftet.","Hähnchen dazu, 3 Min anbraten.","Kokosmilch angießen, aufkochen.","Zucchini & Gemüse dazu, 10 Min köcheln.","Mit Fischsoße & Limette abschmecken.","Mit Jasminreis & Thai-Basilikum servieren."],
    [{name:"Hähnchenbrust",amount:"300g"},{name:"Kokosmilch",amount:"400ml"},{name:"Grüne Curry Paste",amount:"2 EL"},{name:"Jasminreis",amount:"150g"},{name:"Zucchini",amount:"1 Stück"}]),
  R(7,"Greek Salad Bowl","15 Min",420,38,14,22,["lunch","snack"],["Salat","Protein"],"Eigene DB","#9b59b6",IMGS.salad,["Milch"],
    ["Hähnchen mit Oregano & Olivenöl würzen, grillen.","Gurke & Tomaten würfeln, Paprika in Streifen.","Alles mischen, mit Olivenöl + Zitrone anmachen.","Feta in Stücken drüber bröckeln.","Gegrilltes Hähnchen drauflegen.","Mit Oliven & Pita servieren."],
    [{name:"Hähnchenbrust",amount:"200g"},{name:"Feta",amount:"80g"},{name:"Gurke",amount:"0.5 Stück"},{name:"Oliven",amount:"50g"},{name:"Olivenöl",amount:"2 EL"}]),
  R(8,"Egg Fried Rice","20 Min",490,20,68,16,["lunch","dinner","snack"],["Reis","Schnell"],"YouTube","#cc0000",IMGS.rice,["Ei","Soja"],
    ["Wok auf maximale Hitze erhitzen.","Eier rein, schnell rühren, beiseite stellen.","Kalten Reis 3-4 Min scharf anrösten.","Erbsen & Frühlingszwiebeln 2 Min mitbraten.","Rührei wieder dazu, Sojasoße + Sesamöl.","Sofort servieren – wird schnell schlechter!"],
    [{name:"Gekochter Reis (Vortag)",amount:"300g"},{name:"Eier",amount:"3 Stück"},{name:"Sojasoße",amount:"2 EL"},{name:"Erbsen",amount:"80g"},{name:"Sesamöl",amount:"1 TL"}]),
  R(9,"Protein Pancakes","15 Min",440,40,42,10,["breakfast"],["Frühstück","Protein"],"KI-Vorschlag","#ff6b35",IMGS.pancakes,["Ei","Milch","Gluten"],
    ["Hafermehl + Proteinpulver + Backpulver mischen.","Eier + zerdrückte Banane + Milch verrühren.","Trockene + feuchte Zutaten zusammenmischen.","In Butterpfanne bei mittlerer Hitze je 2-3 Min backen.","Warten bis Blasen entstehen, dann wenden.","Mit frischen Beeren & Ahornsirup servieren."],
    [{name:"Proteinpulver",amount:"60g"},{name:"Haferflocken gemahlen",amount:"100g"},{name:"Eier",amount:"2 Stück"},{name:"Banane",amount:"1 Stück"},{name:"Milch",amount:"100ml"}]),
  R(10,"Avocado Toast Deluxe","10 Min",390,14,34,24,["breakfast","snack"],["Vegetarisch","Schnell"],"KI-Vorschlag","#ff6b35",IMGS.avocado,["Gluten","Ei"],
    ["Brot goldbraun toasten.","Avocado mit Zitronensaft, Salz & Chilliflocken zerdrücken.","Wasser mit Essig erhitzen, Ei pochieren.","4 Min pochieren, mit Schaumkelle herausheben.","Avocado-Creme auf Toast streichen.","Pochiertes Ei drauf, mit Meersalz & Microgreens garnieren."],
    [{name:"Sauerteigbrot",amount:"2 Scheiben"},{name:"Avocado",amount:"1 Stück"},{name:"Eier",amount:"2 Stück"},{name:"Zitronensaft",amount:"1 TL"},{name:"Chilliflocken",amount:"1 Prise"}]),
  R(11,"Hähnchen Shawarma","30 Min",580,44,52,20,["lunch","dinner"],["Hähnchen","Wrap"],"YouTube","#cc0000",IMGS.shawarma,["Gluten","Milch"],
    ["Hähnchen mit Shawarma-Gewürz, Öl & Zitrone marinieren.","Mind. 30 Min marinieren lassen.","5-6 Min pro Seite goldbraun braten.","Tomaten & Gurke kleinschneiden.","Joghurt-Knoblauch-Sauce rühren.","Flatbread erwärmen, belegen & einwickeln."],
    [{name:"Hähnchenbrust",amount:"300g"},{name:"Flatbread",amount:"2 Stück"},{name:"Joghurt-Sauce",amount:"3 EL"},{name:"Tomaten",amount:"2 Stück"},{name:"Shawarma-Gewürz",amount:"2 TL"}]),
  R(12,"Smash Burger","20 Min",680,42,48,34,["lunch","dinner"],["Burger","Rind"],"YouTube","#cc0000",IMGS.burger,["Gluten","Milch","Ei"],
    ["Hackfleisch zu 2 Kugeln formen – NICHT würzen!","Gusseisenpfanne auf maximale Hitze bringen.","Kugel rein, sofort mit schwerem Pfannenwender platt drücken.","30 Sek warten bis Kruste entsteht, dann wenden.","Cheddar drauf, 30 Sek schmelzen lassen.","Buns toasten, mit Special Sauce belegen & servieren."],
    [{name:"Rinderhackfleisch 80/20",amount:"200g"},{name:"Brioche Bun",amount:"1 Stück"},{name:"Cheddar",amount:"2 Scheiben"},{name:"Salat & Tomate",amount:"nach Wahl"},{name:"Special Sauce",amount:"2 EL"}]),
  R(13,"Overnight Oats","5 Min",380,18,56,10,["breakfast"],["Frühstück","Meal Prep"],"Eigene DB","#9b59b6",IMGS.oats,["Gluten","Milch"],
    ["Haferflocken in ein Glas oder Schüssel geben.","Milch + Joghurt + Chiasamen dazugeben.","Honig + Vanille-Extrakt einrühren.","Gut vermischen, Deckel drauf.","Über Nacht (mind. 6 Std) in den Kühlschrank.","Morgens mit Beeren + Granola toppen & genießen!"],
    [{name:"Haferflocken",amount:"80g"},{name:"Milch",amount:"200ml"},{name:"Chiasamen",amount:"1 EL"},{name:"Honig",amount:"1 EL"},{name:"Beeren",amount:"100g"}]),
  R(14,"Veggie Buddha Bowl","20 Min",430,18,62,16,["lunch","snack"],["Vegetarisch","Bowl"],"Eigene DB","#9b59b6",IMGS.buddha,["Sesam"],
    ["Quinoa in Gemüsebrühe 15 Min kochen.","Süßkartoffel würfeln, mit Paprikaöl bei 200°C 20 Min rösten.","Kichererbsen mit Kreuzkümmel in Pfanne knusprig braten.","Tahini + Zitrone + Knoblauch zu Dressing rühren.","Bowl aufbauen: Quinoa als Basis.","Alles bunt anrichten, Dressing großzügig drüber."],
    [{name:"Kichererbsen",amount:"200g"},{name:"Süßkartoffel",amount:"1 Stück"},{name:"Quinoa",amount:"100g"},{name:"Tahini",amount:"2 EL"},{name:"Spinat",amount:"80g"}]),
  R(15,"Beef Bulgogi","35 Min",560,48,38,22,["dinner"],["Korea","Rind"],"YouTube","#cc0000",IMGS.bulgogi,["Soja","Sesam"],
    ["Rindfleisch sehr dünn schneiden (halb gefroren = einfacher!).","Marinade: Sojasoße + geriebene Birne + Sesamöl + Zucker.","Mind. 30 Min marinieren, besser 2 Stunden.","Wok sehr heiß, Fleisch PORTIONSWEISE anbraten.","2-3 Min – soll leicht karamellisieren.","Mit Jasminreis + Kimchi + Sesam servieren."],
    [{name:"Rindfleisch dünn geschnitten",amount:"300g"},{name:"Sojasoße",amount:"4 EL"},{name:"Sesamöl",amount:"2 EL"},{name:"Jasminreis",amount:"150g"},{name:"Birne gerieben",amount:"0.5 Stück"}]),
  R(16,"Joghurt Granola Bowl","5 Min",320,20,42,8,["breakfast","snack"],["Frühstück","Schnell"],"Eigene DB","#9b59b6",IMGS.granola,["Milch","Gluten","Nüsse"],
    ["Griechischen Joghurt in eine tiefe Schüssel geben.","Mit etwas Honig süßen und kurz verrühren.","Granola großzügig drüber streuen.","Frische Beeren verteilen.","Chiasamen & Mandelblättchen drüber.","Sofort essen – Granola wird sonst weich!"],
    [{name:"Griech. Joghurt",amount:"200g"},{name:"Granola",amount:"50g"},{name:"Honig",amount:"1 EL"},{name:"Beeren",amount:"80g"},{name:"Chiasamen",amount:"1 TL"}]),
  R(17,"Mango Shrimp Bowl","25 Min",480,36,54,14,["lunch","dinner"],["Meeresfrüchte","Sommer"],"KI-Vorschlag","#ff6b35",IMGS.shrimp,["Schalentiere"],
    ["Basmatireis kochen.","Mango in Würfel schneiden, Limette auspressen.","Garnelen in heißer Pfanne 2 Min pro Seite braten.","Mango + Limettensaft + Chili + Koriander zu Salsa.","Reis in Bowl, Garnelen drauf.","Mango-Salsa großzügig verteilen & servieren."],
    [{name:"Garnelen",amount:"250g"},{name:"Mango",amount:"1 Stück"},{name:"Basmatireis",amount:"150g"},{name:"Koriander",amount:"0.5 Bund"},{name:"Limette",amount:"1 Stück"}]),
  R(18,"Pad Thai","25 Min",560,28,72,18,["lunch","dinner"],["Thai","Nudeln"],"YouTube","#cc0000",IMGS.padthai,["Gluten","Soja","Ei"],
    ["Reisnudeln nur einweichen – NICHT kochen!","Sauce mischen: Tamarinde + Fischsoße + Zucker (1:1:1).","Garnelen 2 Min in heißem Wok anbraten.","Eier rein, scramble, mit Garnelen mischen.","Nudeln + Sauce dazu, 2-3 Min bei hoher Hitze rühren.","Mit Erdnüssen, Bohnenkeim & Limette servieren."],
    [{name:"Reisnudeln",amount:"200g"},{name:"Garnelen",amount:"150g"},{name:"Eier",amount:"2 Stück"},{name:"Tamarindenpaste",amount:"2 EL"},{name:"Erdnüsse",amount:"40g"}]),
  R(19,"Pizza Margherita","25 Min",620,22,80,22,["lunch","dinner"],["Pizza","Vegetarisch"],"KI-Vorschlag","#ff6b35",IMGS.pizza,["Gluten","Milch"],
    ["Ofen auf 250°C vorheizen – so heiß wie möglich!","Teig auf bemehlter Fläche dünn ausrollen.","Tomatensoße mit Olivenöl & Salz dünn auftragen.","Mozzarella in Stücke reißen (nicht schneiden!) & verteilen.","Auf heißem Blech 8-10 Min backen bis Rand goldbraun.","Frischen Basilikum erst NACH dem Backen drauflegen!"],
    [{name:"Pizzateig",amount:"1 Stück"},{name:"Tomatensoße",amount:"100ml"},{name:"Mozzarella",amount:"150g"},{name:"Basilikum",amount:"1 Bund"},{name:"Olivenöl",amount:"1 EL"}]),
  R(20,"French Toast","15 Min",480,16,62,18,["breakfast"],["Frühstück","Süß"],"KI-Vorschlag","#ff6b35",IMGS.toast,["Gluten","Ei","Milch"],
    ["Eier + Milch + Zimt + Vanille verquirlen.","Brotscheiben 30 Sek pro Seite einweichen.","Butter in Pfanne bei mittlerer Hitze schmelzen.","Brot einlegen, 2-3 Min goldbraun braten.","Wenden, weitere 2 Min backen.","Mit Puderzucker, Ahornsirup & Beeren servieren."],
    [{name:"Toastbrot",amount:"4 Scheiben"},{name:"Eier",amount:"3 Stück"},{name:"Milch",amount:"100ml"},{name:"Zimt",amount:"1 TL"},{name:"Ahornsirup",amount:"2 EL"}]),
  R(21,"Chicken Tikka Masala","40 Min",590,42,36,28,["dinner"],["Indien","Hähnchen"],"YouTube","#cc0000",IMGS.tikka,["Milch"],
    ["Hähnchen in Joghurt + Tikka-Gewürz mind. 1 Std marinieren.","Scharf anbraten bis Röstaromen entstehen, beiseitestellen.","Zwiebeln goldbraun, Knoblauch & Ingwer 2 Min dazu.","Tomaten + Gewürze, 10 Min köcheln.","Sahne einrühren, Hähnchen dazu, 10 Min ziehen lassen.","Mit Basmatireis & Naan servieren. Koriander drüber!"],
    [{name:"Hähnchenbrust",amount:"300g"},{name:"Tomaten Dose",amount:"400g"},{name:"Sahne",amount:"100ml"},{name:"Tikka-Gewürz",amount:"2 EL"},{name:"Basmatireis",amount:"150g"}]),
  R(22,"Tonkotsu Ramen","45 Min",640,38,66,26,["dinner"],["Japan","Nudeln"],"YouTube","#cc0000",IMGS.ramen,["Gluten","Ei","Soja"],
    ["Eier 6:30 Min kochen, in Eiswasser abschrecken, in Sojasoße marinieren.","Tonkotsu-Brühe aufkochen, mit Miso & Sojasoße würzen.","Ramen-Nudeln nach Packung kochen.","Brühe in tiefe Schüsseln füllen.","Nudeln einlegen, Chashu-Scheiben drauflegen.","Ei halbieren, mit Nori & Frühlingszwiebeln garnieren."],
    [{name:"Ramen-Nudeln",amount:"180g"},{name:"Tonkotsu-Brühe",amount:"400ml"},{name:"Mariniertes Ei",amount:"2 Stück"},{name:"Chashu-Schwein",amount:"100g"},{name:"Nori",amount:"2 Blatt"}]),
  R(23,"Sushi Bowl","20 Min",480,30,62,12,["lunch","dinner"],["Japan","Fisch"],"KI-Vorschlag","#ff6b35",IMGS.sushi,["Fisch","Soja","Sesam"],
    ["Sushireis kochen, mit Reisessig + Zucker + Salz würzen.","Lachs in dünne Scheiben schneiden (Sushi-Qualität!).","Gurke in Scheiben, Avocado in Spalten schneiden.","Reis in Bowl, Sesam drüber streuen.","Lachs, Avocado & Gurke schön anrichten.","Mit Sojasoße, Sriracha-Mayo & Wasabi servieren."],
    [{name:"Sushireis",amount:"200g"},{name:"Lachs (roh, Sushi-Qual.)",amount:"150g"},{name:"Avocado",amount:"1 Stück"},{name:"Gurke",amount:"0.5 Stück"},{name:"Sriracha-Mayo",amount:"2 EL"}]),
  R(24,"Tacos al Pastor","30 Min",540,32,58,20,["lunch","dinner"],["Mexiko","Schwein"],"YouTube","#cc0000",IMGS.tacos,["Gluten"],
    ["Schweinefleisch mit Chili, Cumin & Achiote marinieren.","In sehr heißer Pfanne 3-4 Min pro Seite anbraten.","Ananasscheiben kurz mitgrillen bis karamellisiert.","Tortillas in trockener Pfanne erwärmen.","Fleisch + Ananas in die Tortilla legen.","Mit Koriander, Zwiebel & Limette servieren. Salsa optional!"],
    [{name:"Schweinefleisch",amount:"300g"},{name:"Mais-Tortillas",amount:"6 Stück"},{name:"Ananas",amount:"100g"},{name:"Koriander",amount:"0.5 Bund"},{name:"Chilipulver",amount:"2 TL"}]),
  R(25,"Pho Bo","60 Min",420,32,52,10,["lunch","dinner"],["Vietnam","Suppe"],"YouTube","#cc0000",IMGS.pho,["Gluten","Soja"],
    ["Rinderbrühe mit Sternanis, Zimt & Ingwer 30 Min köcheln.","Reisnudeln 5 Min einweichen, abgießen.","Rindfleisch sehr dünn schneiden (halb gefroren einfacher).","Brühe durch Sieb gießen, mit Fischsoße abschmecken.","Nudeln in Schüsseln, heiße Brühe drüber gießen.","Rohes Fleisch drauflegen – gart in der heißen Brühe!"],
    [{name:"Reisnudeln",amount:"200g"},{name:"Rinderbrühe",amount:"600ml"},{name:"Rindfleisch (dünn)",amount:"200g"},{name:"Bohnenkeim",amount:"80g"},{name:"Sternanis",amount:"2 Stück"}]),
  R(26,"Chicken Biryani","50 Min",620,42,68,18,["dinner"],["Indien","Hähnchen"],"YouTube","#cc0000",IMGS.biryani,["Milch"],
    ["Hähnchen mit Biryani-Gewürz + Joghurt 1 Std marinieren.","Basmatireis vorkochen (halbgar), abgießen.","Hähnchen in Ghee goldbraun anbraten.","Schichten: Reis – Hähnchen – Röstzwiebeln – Reis.","Safranmilch drüber, abgedeckt 20 Min bei 160°C.","Mit Raita & frischer Minze servieren."],
    [{name:"Hähnchenbrust",amount:"400g"},{name:"Basmatireis",amount:"300g"},{name:"Joghurt",amount:"150g"},{name:"Biryani-Gewürz",amount:"2 EL"},{name:"Safran",amount:"1 Prise"}]),
  R(27,"Falafel Wrap","25 Min",510,18,68,20,["lunch","snack"],["Nahostküche","Vegetarisch"],"Eigene DB","#9b59b6",IMGS.falafel,["Gluten","Sesam"],
    ["Kichererbsen + Zwiebel + Petersilie + Gewürze im Mixer zerkleinern.","Zu kleinen Bällchen formen, in Mehl wälzen.","In heißem Öl 3-4 Min goldbraun frittieren.","Tzatziki aus Joghurt, Gurke, Knoblauch & Dill rühren.","Pita anwärmen, Hummus einstreichen.","Falafel + Tzatziki + Gemüse einfüllen & einwickeln."],
    [{name:"Falafel",amount:"6 Stück"},{name:"Pita-Brot",amount:"2 Stück"},{name:"Hummus",amount:"3 EL"},{name:"Tzatziki",amount:"3 EL"},{name:"Tomaten + Gurke",amount:"nach Wahl"}]),
  R(28,"Pilz-Risotto","40 Min",550,16,74,18,["dinner"],["Vegetarisch","Risotto"],"HelloFresh","#7cb518",IMGS.risotto,["Milch"],
    ["Brühe warm halten. Zwiebel in Butter glasig dünsten.","Arborio-Reis dazu, 2 Min unter Rühren anrösten.","Weißwein angießen, komplett einkochen lassen.","Schöpfkelle für Schöpfkelle Brühe zugeben – immer rühren! Ca. 18 Min.","Pilze separat in Butter goldbraun anbraten.","Parmesan + kalte Butter unterrühren, Pilze drauf – sofort servieren!"],
    [{name:"Arborio-Reis",amount:"200g"},{name:"Champignons",amount:"250g"},{name:"Parmesan",amount:"60g"},{name:"Weißwein",amount:"100ml"},{name:"Gemüsebrühe",amount:"600ml"}]),
  R(29,"Spinat-Omelette","10 Min",320,28,6,20,["breakfast","snack"],["Frühstück","Protein"],"Eigene DB","#9b59b6",IMGS.omelette,["Ei","Milch"],
    ["Eier mit Salz, Pfeffer & Milch verquirlen.","Butter in beschichteter Pfanne bei mittlerer Hitze schmelzen.","Eimasse einfüllen, Pfanne schwenken.","Wenn Ränder fest werden: Spinat + Feta auf eine Hälfte.","Zusammenklappen.","Auf Teller gleiten lassen – mit Tomaten servieren."],
    [{name:"Eier",amount:"3 Stück"},{name:"Spinat",amount:"80g"},{name:"Feta",amount:"40g"},{name:"Tomaten",amount:"1 Stück"},{name:"Butter",amount:"1 EL"}]),
  R(30,"Lemon Herb Chicken","30 Min",460,48,8,24,["lunch","dinner"],["Hähnchen","Keto"],"HelloFresh","#7cb518",IMGS.chicken,[],
    ["Marinade: Olivenöl + Zitronenschale & -saft + Knoblauch + Thymian + Senf.","Hähnchen mind. 30 Min marinieren.","Ofen auf 200°C vorheizen.","35-40 Min backen bis Haut goldbraun & knusprig.","Kerntemperatur prüfen: 75°C = perfekt.","Mit geröstetem Gemüse oder frischem Salat servieren."],
    [{name:"Hähnchenschenkel",amount:"400g"},{name:"Zitrone",amount:"2 Stück"},{name:"Knoblauch",amount:"4 Zehen"},{name:"Thymian",amount:"4 Zweige"},{name:"Dijon Senf",amount:"1 EL"}]),
  R(31,"Gyoza","30 Min",380,22,42,14,["lunch","dinner","snack"],["Japan","Fingerfood"],"YouTube","#cc0000",IMGS.gyoza,["Gluten","Soja"],
    ["Füllung: Hackfleisch + Kohl + Ingwer + Sojasoße mischen.","Je 1 TL Füllung in Teigblatt mittig setzen.","Ränder befeuchten, falten & gut andrücken.","In Pfanne mit Öl goldbraun anbraten (Boden).","Wasser angießen, Deckel drauf – 3 Min dämpfen.","Mit Ponzu- oder Gyoza-Dipsoße servieren."],
    [{name:"Gyoza-Blätter",amount:"20 Stück"},{name:"Schweinehackfleisch",amount:"200g"},{name:"Chinakohl",amount:"100g"},{name:"Ingwer",amount:"1 Stück"},{name:"Sojasoße",amount:"2 EL"}]),
  R(32,"Hummus Bowl","15 Min",410,18,52,16,["lunch","snack"],["Nahostküche","Vegetarisch"],"Eigene DB","#9b59b6",IMGS.hummus,["Sesam"],
    ["Hummus auf großem Teller großzügig verteilen.","Mit dem Löffelrücken eine Mulde in die Mitte drücken.","Olivenöl in die Mulde laufen lassen.","Kichererbsen + Paprika + Gurke schön anrichten.","Mit Paprikapulver + Kreuzkümmel bestreuen.","Mit warmem Pita-Brot servieren."],
    [{name:"Hummus",amount:"200g"},{name:"Kichererbsen",amount:"100g"},{name:"Olivenöl",amount:"3 EL"},{name:"Paprikapulver",amount:"1 TL"},{name:"Pita",amount:"2 Stück"}]),
  R(33,"Tomatensuppe","25 Min",280,8,38,10,["lunch","dinner","snack"],["Vegetarisch","Suppe"],"HelloFresh","#7cb518",IMGS.soup,["Milch"],
    ["Zwiebel + Knoblauch in Olivenöl weich dünsten.","Dosentomaten + Gemüsebrühe dazu, aufkochen.","15 Min köcheln lassen.","Alles pürieren bis glatt.","Sahne einrühren, mit Salz & Pfeffer abschmecken.","Mit frischem Basilikum & Croutons servieren."],
    [{name:"Tomaten Dose",amount:"800g"},{name:"Gemüsebrühe",amount:"400ml"},{name:"Sahne",amount:"100ml"},{name:"Basilikum",amount:"1 Bund"},{name:"Zwiebel",amount:"1 Stück"}]),
  R(34,"Nachos Deluxe","20 Min",580,22,64,28,["snack","dinner"],["Mexiko","Fingerfood"],"YouTube","#cc0000",IMGS.nachos,["Milch","Gluten"],
    ["Nachos auf Backblech verteilen.","Geriebenen Cheddar großzügig drüberstreuen.","Bei 180°C 8-10 Min bis Käse schmilzt & leicht bräunt.","Guacamole + Sauerrahm drauflegen.","Jalapeños + Kirschtomaten + Koriander drüber.","Sofort heiß servieren – wird schnell weich!"],
    [{name:"Nachos",amount:"200g"},{name:"Cheddar gerieben",amount:"150g"},{name:"Guacamole",amount:"100g"},{name:"Jalapeños",amount:"50g"},{name:"Sauerrahm",amount:"80g"}]),
  R(35,"Waffeln","20 Min",520,14,72,20,["breakfast","snack"],["Frühstück","Süß"],"KI-Vorschlag","#ff6b35",IMGS.waffles,["Gluten","Ei","Milch"],
    ["Mehl + Backpulver + Zucker + Salz in Schüssel mischen.","Eier + Milch + geschmolzene Butter + Vanille einrühren.","Waffeleisen vorheizen und leicht einölen.","Teig einfüllen (nicht zu viel!), 3-4 Min backen.","Goldbraun herausnehmen.","Mit frischen Früchten, Puderzucker & Sirup servieren."],
    [{name:"Mehl",amount:"200g"},{name:"Eier",amount:"2 Stück"},{name:"Milch",amount:"250ml"},{name:"Butter",amount:"50g"},{name:"Backpulver",amount:"1 TL"}]),
  R(36,"Chicken Wrap","15 Min",490,38,48,16,["lunch","snack"],["Hähnchen","Schnell"],"Eigene DB","#9b59b6",IMGS.wrap,["Gluten","Milch"],
    ["Hähnchen mit Paprika + Knoblauch würzen.","4 Min pro Seite in heißer Pfanne goldbraun braten.","In dünne Streifen schneiden.","Tortilla mit Joghurt-Knoblauch-Sauce bestreichen.","Hähnchen + Salat + Tomaten + Gurke darauflegen.","Fest einrollen, diagonal schneiden & servieren."],
    [{name:"Hähnchenbrust",amount:"250g"},{name:"Weizentortilla",amount:"2 Stück"},{name:"Joghurt-Sauce",amount:"3 EL"},{name:"Eisbergsalat",amount:"2 Blatt"},{name:"Tomaten",amount:"1 Stück"}]),
  R(37,"Wiener Schnitzel","25 Min",580,42,44,24,["lunch","dinner"],["Österreich","Klassiker"],"HelloFresh","#7cb518",IMGS.schnitzel,["Gluten","Ei","Milch"],
    ["Kalbsschnitzel zwischen Frischhaltefolie dünn klopfen.","Durch Mehl – Ei – Semmelbrösel panieren.","Öl in Pfanne auf 170°C erhitzen.","Schnitzel 2-3 Min pro Seite goldbraun ausbacken.","Auf Küchenpapier abtropfen lassen.","Mit Zitronenspalte + Petersilienkartoffeln servieren."],
    [{name:"Kalbsschnitzel",amount:"300g"},{name:"Semmelbrösel",amount:"80g"},{name:"Eier",amount:"2 Stück"},{name:"Mehl",amount:"50g"},{name:"Zitrone",amount:"1 Stück"}]),
  R(38,"BBQ Chicken","35 Min",520,48,22,24,["dinner"],["BBQ","Hähnchen"],"YouTube","#cc0000",IMGS.grill,[],
    ["Hähnchen mit BBQ-Sauce + Paprika + Knoblauchpulver einreiben.","Mind. 30 Min marinieren, besser über Nacht.","Grill auf mittlere Hitze (ca. 180°C).","Hähnchen 6-7 Min pro Seite grillen.","Letzte 5 Min nochmals BBQ-Sauce auftragen & karamellisieren.","Mit Coleslaw & Maiskolben servieren."],
    [{name:"Hähnchenschenkel",amount:"400g"},{name:"BBQ-Sauce",amount:"100ml"},{name:"Paprikapulver",amount:"2 TL"},{name:"Knoblauchpulver",amount:"1 TL"}]),
  R(39,"Blueberry Muffins","30 Min",380,6,58,14,["breakfast","snack"],["Frühstück","Backen"],"KI-Vorschlag","#ff6b35",IMGS.muffin,["Gluten","Ei","Milch"],
    ["Mehl + Backpulver + Zucker + Salz mischen.","Eier + Milch + geschmolzene Butter + Vanille verrühren.","Feuchte + trockene Zutaten NUR KURZ zusammenrühren (Klumpen OK!).","Blaubeeren vorsichtig unterheben.","Zu 2/3 in Muffinformen füllen.","Bei 190°C 20-22 Min backen – Stäbchenprobe!"],
    [{name:"Mehl",amount:"250g"},{name:"Blaubeeren",amount:"150g"},{name:"Eier",amount:"2 Stück"},{name:"Milch",amount:"120ml"},{name:"Zucker",amount:"100g"}]),
  R(40,"Pasta Pesto","15 Min",560,18,72,22,["lunch","dinner"],["Pasta","Schnell"],"Eigene DB","#9b59b6",IMGS.pesto,["Gluten","Nüsse","Milch"],
    ["Pasta al dente kochen, 2 EL Nudelwasser aufheben.","Pesto mit Zitronensaft + etwas Olivenöl glatt rühren.","Pasta abgießen (nicht ausspülen!).","Pesto + Nudelwasser untermengen – macht es cremig!","Kirschtomaten halbieren & dazugeben.","Mit geriebenem Parmesan + Pinienkernen servieren."],
    [{name:"Penne oder Spaghetti",amount:"200g"},{name:"Basilikum-Pesto",amount:"4 EL"},{name:"Kirschtomaten",amount:"100g"},{name:"Parmesan",amount:"40g"},{name:"Pinienkerne",amount:"30g"}]),
  R(41,"Kimchi Fried Rice","20 Min",480,22,62,18,["lunch","dinner"],["Korea","Würzig"],"YouTube","#cc0000",IMGS.rice,["Soja","Ei"],
    ["Kimchi grob hacken.","In Pfanne mit Sesamöl bei mittlerer Hitze anbraten bis karamellisiert.","Kalten Reis dazu, kräftig anrösten (nicht rühren!).","Gochujang + Sojasoße einrühren.","Spiegelei separat braten.","Reis anrichten, Spiegelei drauflegen & mit Sesam bestreuen."],
    [{name:"Kimchi",amount:"200g"},{name:"Gekochter Reis (Vortag)",amount:"300g"},{name:"Eier",amount:"2 Stück"},{name:"Gochujang",amount:"1 EL"},{name:"Sojasoße",amount:"2 EL"}]),
  R(42,"Smoothie Bowl","10 Min",340,12,58,8,["breakfast","snack"],["Frühstück","Gesund"],"KI-Vorschlag","#ff6b35",IMGS.smoothie,["Milch","Nüsse"],
    ["Gefrorene Beeren + Banane in den Mixer geben.","Nur wenig Kokosmilch – die Bowl soll DICK bleiben!","Mixen bis ganz glatt und cremig.","In eine Bowl füllen – Masse soll fest sein.","Granola, Beeren, Bananenscheiben & Chiasamen drauf.","Mandelmus in Streifen drüberträufeln – sofort essen!"],
    [{name:"Gefrorene Beeren",amount:"200g"},{name:"Banane (gefroren)",amount:"1 Stück"},{name:"Kokosmilch",amount:"80ml"},{name:"Granola",amount:"40g"},{name:"Chiasamen",amount:"1 EL"}]),
  R(43,"BBQ Ribs","120 Min",780,58,28,48,["dinner"],["BBQ","Schwein"],"YouTube","#cc0000",IMGS.ribs,[],
    ["Silberhaut auf der Rückseite mit Messer lösen und abziehen.","Rub aus Paprika + braunem Zucker + Gewürzen einreiben.","Mind. 1 Std marinieren (besser über Nacht).","In Alufolie wickeln, 2 Std bei 150°C im Ofen schmoren.","Folie öffnen, BBQ-Sauce auftragen, 15 Min grillen bis karamellisiert.","An den Knochen schneiden & sofort servieren. Coleslaw dazu!"],
    [{name:"Schweinerippchen",amount:"800g"},{name:"BBQ-Sauce",amount:"150ml"},{name:"Paprikapulver",amount:"2 TL"},{name:"Brauner Zucker",amount:"2 EL"}]),
  R(44,"Caprese Salat","10 Min",320,18,12,22,["lunch","snack"],["Vegetarisch","Italienisch"],"Eigene DB","#9b59b6",IMGS.caprese,["Milch"],
    ["Tomaten & Mozzarella in gleich dicke Scheiben schneiden.","Abwechselnd auf einer Platte überlappend anrichten.","Frische Basilikumblätter dazwischenstecken.","Großzügig bestes Olivenöl drüber.","Balsamico-Creme in feinen Streifen drüberträufeln.","Mit Meersalz + frischem Pfeffer würzen – fertig!"],
    [{name:"Große Tomaten",amount:"3 Stück"},{name:"Büffelmozzarella",amount:"250g"},{name:"Basilikum",amount:"1 Bund"},{name:"Olivenöl extra vergine",amount:"3 EL"},{name:"Balsamico-Creme",amount:"1 EL"}]),
  R(45,"Pulled Pork Sandwich","180 Min",680,48,62,26,["lunch","dinner"],["BBQ","Schwein"],"YouTube","#cc0000",IMGS.pulled,["Gluten"],
    ["Schweineschulter rundherum mit BBQ-Rub einreiben.","Bei 120°C (Niedrigtemperatur) 3-4 Std im Ofen schmoren.","Bis Kerntemperatur 90°C erreicht ist.","Fleisch mit 2 Gabeln auseinanderzupfen.","BBQ-Sauce untermengen, mit Salz abschmecken.","In Brioche-Buns mit Coleslaw & Pickles servieren."],
    [{name:"Schweineschulter",amount:"1 kg"},{name:"BBQ-Sauce",amount:"200ml"},{name:"Brioche Buns",amount:"4 Stück"},{name:"Coleslaw",amount:"150g"}]),
  R(46,"Eggs Benedict","25 Min",540,28,34,30,["breakfast"],["Frühstück","Klassiker"],"YouTube","#cc0000",IMGS.benedict,["Gluten","Ei","Milch"],
    ["English Muffins golden toasten.","Hollandaise: Eigelb + Zitrone über Wasserbad aufschlagen, Butter langsam einrühren.","Wasser + Schuss Essig zum Sieden bringen (nicht kochen!).","Eier einzeln pochieren: 4 Min, dann herausheben.","Kochschinken auf Muffins, pochiertes Ei drauf.","Hollandaise großzügig drüber – sofort servieren!"],
    [{name:"English Muffins",amount:"2 Stück"},{name:"Eier",amount:"4 Stück"},{name:"Kochschinken",amount:"4 Scheiben"},{name:"Butter",amount:"100g"},{name:"Zitrone",amount:"0.5 Stück"}]),
  R(47,"Vegetarische Paella","45 Min",520,16,78,14,["lunch","dinner"],["Spanien","Vegetarisch"],"HelloFresh","#7cb518",IMGS.paella,["Gluten"],
    ["Zwiebel + bunte Paprika + Knoblauch in Olivenöl anschwitzen.","Paella-Reis dazu, 2 Min unter Rühren anrösten.","Safran + Paprikapulver + Gemüsebrühe angießen.","20 Min köcheln – NICHT rühren!","Artischocken & Erbsen dekorativ einlegen.","Letzte 2 Min Hitze erhöhen für den Socarrat (Kruste)."],
    [{name:"Paella-Reis",amount:"300g"},{name:"Bunte Paprika",amount:"2 Stück"},{name:"Gemüsebrühe",amount:"600ml"},{name:"Safran",amount:"1 Prise"},{name:"Artischocken",amount:"100g"}]),
  R(48,"Lo Mein Noodles","25 Min",510,24,68,16,["lunch","dinner"],["China","Nudeln"],"YouTube","#cc0000",IMGS.ramen,["Gluten","Soja"],
    ["Eiernudeln in Salzwasser kochen, abgießen.","Gemüse in sehr heißem Wok mit Öl 2 Min anbraten.","Hähnchen in Streifen dazu, 3 Min bei hoher Hitze.","Nudeln dazugeben.","Sojasoße + Austernsoße + Sesamöl einrühren.","2 Min alles zusammen bei hoher Hitze schwenken & servieren."],
    [{name:"Eiernudeln",amount:"200g"},{name:"Hähnchenbrust",amount:"200g"},{name:"Pak Choi",amount:"150g"},{name:"Sojasoße",amount:"3 EL"},{name:"Austernsoße",amount:"2 EL"}]),
  R(49,"Quiche Lorraine","45 Min",540,22,38,32,["lunch","dinner"],["Französisch","Klassiker"],"HelloFresh","#7cb518",IMGS.caprese,["Gluten","Ei","Milch"],
    ["Mürbeteig in Quicheform drücken, mit Gabel einstechen, 10 Min vorbacken.","Speck in Würfeln knusprig braten, auf Teig verteilen.","Eier + Sahne + geriebenen Käse verquirlen, würzen.","Ei-Mix über den Speck gießen.","Bei 180°C 30 Min backen bis gestockt und goldbraun.","10 Min abkühlen, dann anschneiden & servieren."],
    [{name:"Mürbeteig",amount:"1 Rolle"},{name:"Speck gewürfelt",amount:"150g"},{name:"Eier",amount:"3 Stück"},{name:"Sahne",amount:"200ml"},{name:"Gruyère",amount:"80g"}]),
  R(50,"Overnight Bircher Müsli","5 Min",360,16,54,10,["breakfast"],["Frühstück","Gesund"],"Eigene DB","#9b59b6",IMGS.oats,["Gluten","Milch","Nüsse"],
    ["Haferflocken mit Milch & Joghurt verrühren.","Geriebenen Apfel untermischen (verhindert Bräunen).","Honig + Zimt + Vanille einrühren.","Gehackte Nüsse dazu.","Über Nacht kühlen.","Morgens mit Beeren & einem Spritzer Zitrone servieren."],
    [{name:"Haferflocken",amount:"80g"},{name:"Milch",amount:"150ml"},{name:"Joghurt",amount:"80g"},{name:"Apfel gerieben",amount:"1 Stück"},{name:"Nüsse gehackt",amount:"30g"}]),
];

const ALLERGENS_LIST=["Gluten","Milch","Ei","Nüsse","Fisch","Soja","Schalentiere","Sesam"];
const MOODS=["Zur Uhrzeit","Alles","Schnell","High Protein","Vegetarisch","Trending","Wenig Kalorien"];

export default function FoodSwipe(){
  const slot=getSlot(), slotInfo=slotLabel[slot], slotType=slotMap[slot];

  const [onboarded,setOnboarded]=useState(()=>!!load("fs_onboarded",false));
  const [obStep,setObStep]=useState(0);
  const [userName,setUserName]=useState(()=>load("fs_name",""));
  const [liked,setLiked]=useState(()=>load("fs_liked",[]));
  const [history,setHistory]=useState(()=>load("fs_history",[]));
  const [shoppingList,setShoppingList]=useState(()=>load("fs_shopping",[]));
  const [checkedItems,setCheckedItems]=useState(()=>load("fs_checked",{}));
  const [selectedAllergens,setSelectedAllergens]=useState(()=>load("fs_allergens",[]));
  const [customRecipes,setCustomRecipes]=useState(()=>load("fs_custom",[]));
  const [spoonKey,setSpoonKey]=useState(()=>load("fs_spoon_key",""));
  const [seenIds,setSeenIds]=useState(()=>load("fs_seen",[]));
  const [spoonRecipes,setSpoonRecipes]=useState([]);
  const [spoonLoading,setSpoonLoading]=useState(false);
  const [spoonLoaded,setSpoonLoaded]=useState(false);

  useEffect(()=>{save("fs_liked",liked);},[liked]);
  useEffect(()=>{save("fs_history",history);},[history]);
  useEffect(()=>{save("fs_shopping",shoppingList);},[shoppingList]);
  useEffect(()=>{save("fs_checked",checkedItems);},[checkedItems]);
  useEffect(()=>{save("fs_allergens",selectedAllergens);},[selectedAllergens]);
  useEffect(()=>{save("fs_custom",customRecipes);},[customRecipes]);
  useEffect(()=>{save("fs_seen",seenIds);},[seenIds]);

  const allRecipes=[...LOCAL_RECIPES,...customRecipes,...spoonRecipes];

  const buildDeck=useCallback((mood,allergens,seen)=>{
    let list=allRecipes.filter(r=>{
      if(!allergens.every(a=>!r.allergens.includes(a)))return false;
      if(mood==="Zur Uhrzeit")return r.meal.includes(slotType);
      if(mood==="Schnell")return parseInt(r.time)<=20;
      if(mood==="High Protein")return r.protein>=35;
      if(mood==="Vegetarisch")return r.tags.some(t=>t.toLowerCase().includes("vegetar"));
      if(mood==="Trending")return r.src==="YouTube";
      if(mood==="Wenig Kalorien")return r.cal<420;
      return true;
    });
    const unseen=shuffle(list.filter(r=>!seen.includes(String(r.id))));
    const seenL=shuffle(list.filter(r=>seen.includes(String(r.id))));
    return [...unseen,...seenL];
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
  const [newDish,setNewDish]=useState({name:"",time:"",cal:"",protein:"",carbs:"",fat:"",img:"",ingredients:"",steps:""});
  const [toast,setToast]=useState(null);
  const [activeTab,setActiveTab]=useState("ingredients");
  const dragStart=useRef(null);

  const current=deck[deckIndex%Math.max(deck.length,1)];
  const next=deck[(deckIndex+1)%Math.max(deck.length,1)];

  const showToast=(msg,color="#4ade80")=>{setToast({msg,color});setTimeout(()=>setToast(null),2000);};

  const fetchSpoonacular=async key=>{
    if(!key||spoonLoaded)return;
    setSpoonLoading(true);
    try{
      const res=await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&number=100&addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true`);
      const data=await res.json();
      if(data.results?.length){
        const spoon=data.results.map(r=>({
          id:`sp_${r.id}`,name:r.title,time:`${r.readyInMinutes||30} Min`,
          cal:Math.round(r.nutrition?.nutrients?.find(n=>n.name==="Calories")?.amount||500),
          protein:Math.round(r.nutrition?.nutrients?.find(n=>n.name==="Protein")?.amount||25),
          carbs:Math.round(r.nutrition?.nutrients?.find(n=>n.name==="Carbohydrates")?.amount||40),
          fat:Math.round(r.nutrition?.nutrients?.find(n=>n.name==="Fat")?.amount||20),
          meal:["breakfast","lunch","dinner","snack"],tags:r.dishTypes||[],
          src:"Spoonacular",srcColor:"#e67e22",
          img:r.image||FALLBACK,allergens:[],
          steps:["Alle Zutaten bereitstellen.","Gemäß Rezept Schritt für Schritt vorgehen.","Guten Appetit! 🍽️"],
          ingredients:(r.extendedIngredients||[]).slice(0,8).map(i=>({name:i.name,amount:`${Math.round(i.amount)} ${i.unit}`})),
        }));
        save("fs_spoon_key",key);
        setSpoonRecipes(spoon);
        setSpoonLoaded(true);
        showToast(`🍽️ ${spoon.length} API-Rezepte geladen!`,"#e67e22");
        setDeck(d=>shuffle([...d,...spoon]));
      }
    }catch(e){showToast("❌ API Fehler – Key prüfen","#ff4444");}
    setSpoonLoading(false);
  };

  useEffect(()=>{if(spoonKey&&!spoonLoaded)fetchSpoonacular(spoonKey);},[]);

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
        setLiked(p=>[...p.filter(x=>x.id!==current.id),current]);
        setShoppingList(p=>[...p,...current.ingredients.filter(i=>!p.find(x=>x.name===i.name))]);
        showToast(`❤️ ${current.name} gespeichert!`);
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
  const BackBtn=({to})=>(
    <button onClick={()=>setScreen(to)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",color:"white",width:40,height:40,fontSize:"1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
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
          <div style={{fontSize:"5rem"}}>🍽️</div>
          <div style={{fontSize:"2.4rem",fontWeight:"900",background:"linear-gradient(90deg,#ff6b35,#ffcc02)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FoodSwipe</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:"1rem",lineHeight:1.6,maxWidth:"280px"}}>Swipe dich zu deinem nächsten Lieblingsgericht.</div>
          <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Wie heißt du?" style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"14px",color:"white",padding:"0.9rem 1.2rem",fontSize:"1rem",width:"100%",fontFamily:"inherit",textAlign:"center",outline:"none",marginTop:"1rem"}}/>
        </div>
        <button onClick={()=>setObStep(1)} style={{background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1.1rem",fontSize:"1rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(255,107,53,0.4)"}}>Weiter →</button>
      </div>,
      <div key={1} style={{display:"flex",flexDirection:"column",height:"100%",padding:"2rem 1.5rem"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:"1.5rem",fontWeight:"900",marginBottom:"0.3rem"}}>So funktioniert's 👆</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem",marginBottom:"2rem"}}>Einfach wie Tinder – nur für Essen!</div>
          {[["👉","Rechts swipen","Magst du → kommt in Favoriten"],["👈","Links swipen","Kein Interesse → nächstes Gericht"],["❤️","Favoriten","Alle Gerichte + Kochanleitungen"],["🛒","Einkaufsliste","Zutaten werden automatisch gesammelt"]].map(([ico,t,s])=>(
            <div key={t} style={{display:"flex",gap:"1rem",alignItems:"center",marginBottom:"1.2rem"}}>
              <div style={{fontSize:"1.5rem",width:40,textAlign:"center"}}>{ico}</div>
              <div><div style={{fontWeight:"700",fontSize:"0.9rem"}}>{t}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.8rem"}}>{s}</div></div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"0.8rem"}}>
          <button onClick={()=>setObStep(0)} style={{flex:0.4,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",color:"white",padding:"1rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit"}}>← Zurück</button>
          <button onClick={()=>{save("fs_onboarded",1);save("fs_name",userName);setOnboarded(true);}} style={{flex:1,background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1rem",fontSize:"0.95rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(255,107,53,0.4)"}}>Los geht's 🚀</button>
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
              <div style={{fontSize:"1.8rem",fontWeight:"900",marginTop:"0.4rem",lineHeight:1.15}}>{r.name}</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.82rem",marginTop:"0.2rem"}}>⏱ {r.time} · 🔥 {r.cal} kcal · <span style={{color:"#4ade80"}}>💪 {r.protein}g</span></div>
            </div>
          </div>
          <div style={{padding:"1rem 1.4rem"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.6rem",marginBottom:"1rem"}}>
              {[{l:"Protein",v:r.protein,c:"#4ade80",icon:"💪"},{l:"Carbs",v:r.carbs,c:"#60a5fa",icon:"⚡"},{l:"Fett",v:r.fat,c:"#fb923c",icon:"🔥"}].map(m=>(
                <div key={m.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:"14px",padding:"0.8rem 0.5rem",textAlign:"center",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div style={{fontSize:"1.1rem"}}>{m.icon}</div>
                  <div style={{fontSize:"1.2rem",fontWeight:"900",color:m.c}}>{m.v}g</div>
                  <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.4)",letterSpacing:"1px"}}>{m.l.toUpperCase()}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",background:"rgba(255,255,255,0.07)",borderRadius:"12px",padding:"4px",marginBottom:"1rem"}}>
              {[["ingredients","🛒 Zutaten"],["steps","👨‍🍳 Zubereitung"]].map(([tab,label])=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} style={{flex:1,background:activeTab===tab?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"transparent",border:"none",borderRadius:"9px",color:"white",padding:"0.55rem",fontSize:"0.82rem",fontWeight:activeTab===tab?"800":"500",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{label}</button>
              ))}
            </div>
            {activeTab==="ingredients"&&(
              <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"18px",padding:"1.1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
                {r.ingredients.map((ing,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.48rem 0",borderBottom:i<r.ingredients.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
                    <span style={{fontSize:"0.92rem"}}>{ing.name}</span>
                    <span style={{background:"rgba(255,255,255,0.1)",borderRadius:"20px",padding:"0.18rem 0.65rem",fontSize:"0.8rem",fontWeight:"700",color:"rgba(255,255,255,0.7)"}}>{ing.amount}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab==="steps"&&(
              <div style={{marginBottom:"1rem"}}>
                {(r.steps?.length?r.steps:["Zutaten vorbereiten.","Schritt für Schritt kochen.","Guten Appetit! 🍽️"]).map((step,i)=>(
                  <div key={i} style={{display:"flex",gap:"0.9rem",marginBottom:"0.9rem",background:"rgba(255,255,255,0.05)",borderRadius:"14px",padding:"0.9rem 1rem",border:"1px solid rgba(255,255,255,0.07)"}}>
                    <div style={{minWidth:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:"900",flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:"0.9rem",lineHeight:1.55,color:"rgba(255,255,255,0.88)"}}>{step}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={()=>{isLiked?setLiked(p=>p.filter(x=>x.id!==r.id)):setLiked(p=>[...p.filter(x=>x.id!==r.id),r]);showToast(isLiked?"🗑 Entfernt":"❤️ Favorit!",isLiked?"#ff6666":"#4ade80");}}
              style={{width:"100%",background:isLiked?"rgba(255,68,68,0.15)":"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:isLiked?"1px solid rgba(255,68,68,0.3)":"none",borderRadius:"16px",color:isLiked?"#ff8888":"white",padding:"1rem",fontSize:"0.95rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>
              {isLiked?"🗑 Aus Favoriten entfernen":"❤️ Zu Favoriten hinzufügen"}
            </button>
            {r._custom&&<button onClick={()=>{setCustomRecipes(p=>p.filter(x=>x.id!==r.id));setScreen(detailFrom);}} style={{width:"100%",background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"16px",color:"rgba(255,120,120,0.8)",padding:"0.9rem",fontSize:"0.85rem",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>🗑 Eigenes Gericht löschen</button>}
            <button onClick={()=>setScreen(detailFrom)} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",color:"white",padding:"0.9rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",marginBottom:"2rem"}}>← Zurück</button>
          </div>
        </div>
        {FONT}
      </div>
    );
  }

  // ── ADD DISH ────────────────────────────────────────────────────────────
  if(showAddDish){
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
            <BackBtn to="swipe"/><h1 style={{margin:0,fontSize:"1.4rem",fontWeight:"800"}}>Eigenes Gericht ➕</h1>
          </div>
          {inp("GERICHTNAME","name","z.B. Mamas Bolognese")}
          {inp("FOTO-URL (Unsplash)","img","https://images.unsplash.com/...")}
          {inp("KOCHZEIT","time","z.B. 30 Min")}
          {inp("KALORIEN","cal","z.B. 520","number")}
          {inp("PROTEIN (g)","protein","z.B. 38","number")}
          {inp("CARBS (g)","carbs","z.B. 45","number")}
          {inp("FETT (g)","fat","z.B. 18","number")}
          <div style={{marginBottom:"0.75rem"}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.3rem"}}>ZUTATEN (kommagetrennt: "Nudeln 200g, Hackfleisch 300g")</div>
            <textarea value={newDish.ingredients} onChange={e=>setNewDish(p=>({...p,ingredients:e.target.value}))} rows={2} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"white",padding:"0.7rem 1rem",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",resize:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:"1.2rem"}}>
            <div style={{fontSize:"0.62rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.3rem"}}>ZUBEREITUNG (jeder Schritt neue Zeile)</div>
            <textarea value={newDish.steps} onChange={e=>setNewDish(p=>({...p,steps:e.target.value}))} rows={4} placeholder={"Zwiebeln anbraten.\nHackfleisch dazu.\n..."} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"white",padding:"0.7rem 1rem",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",resize:"none",boxSizing:"border-box"}}/>
          </div>
          <button onClick={()=>{
            if(!newDish.name)return;
            const dish={id:Date.now(),name:newDish.name,time:newDish.time||"? Min",cal:+newDish.cal||0,protein:+newDish.protein||0,carbs:+newDish.carbs||0,fat:+newDish.fat||0,meal:["breakfast","lunch","dinner","snack"],tags:["Eigene DB"],src:"Eigene DB",srcColor:"#8e44ad",img:newDish.img||FALLBACK,allergens:[],steps:newDish.steps.split("\n").filter(s=>s.trim()),ingredients:newDish.ingredients.split(",").map(s=>{const p=s.trim().split(" ");return{name:p.slice(0,-1).join(" ")||s.trim(),amount:p[p.length-1]||""};}).filter(i=>i.name),_custom:true};
            setCustomRecipes(p=>[...p,dish]);
            setNewDish({name:"",time:"",cal:"",protein:"",carbs:"",fat:"",img:"",ingredients:"",steps:""});
            setShowAddDish(false);applyFilter(moodFilter,selectedAllergens);showToast("✅ Gericht hinzugefügt!");
          }} style={{width:"100%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1.1rem",fontSize:"1rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>Gericht hinzufügen ✅</button>
          <button onClick={()=>setShowAddDish(false)} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",color:"white",padding:"1rem",fontFamily:"inherit",cursor:"pointer",marginBottom:"2rem"}}>Abbrechen</button>
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
          <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800"}}>Einkaufsliste 🛒</h1>
          {shoppingList.length>0&&<span style={{background:"#ff6b35",borderRadius:"50px",padding:"0.2rem 0.75rem",fontSize:"0.75rem",fontWeight:"700",marginLeft:"auto"}}>{shoppingList.filter(i=>!checkedItems[i.name]).length} offen</span>}
        </div>
        {shoppingList.length===0
          ?<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",marginTop:"6rem"}}><div style={{fontSize:"3rem"}}>🛒</div><p>Swipe Gerichte nach rechts!</p></div>
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
            <button onClick={()=>{setShoppingList([]);setCheckedItems({});}} style={{width:"100%",marginTop:"1rem",background:"rgba(255,68,68,0.12)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"14px",color:"rgba(255,120,120,0.8)",padding:"0.9rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600",marginBottom:"2rem"}}>🗑 Liste leeren</button>
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
          <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800"}}>Favoriten ❤️</h1>
          {liked.length>0&&<span style={{marginLeft:"auto",background:"rgba(255,107,53,0.3)",borderRadius:"50px",padding:"0.2rem 0.75rem",fontSize:"0.75rem",fontWeight:"700",color:"#ff9a3c"}}>{liked.length}</span>}
        </div>
        {liked.length===0
          ?<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",marginTop:"4rem"}}><div style={{fontSize:"3rem"}}>🍽️</div><p>Noch keine Favoriten – swipe rechts!</p></div>
          :<div style={{display:"grid",gap:"0.8rem",marginBottom:"1.5rem"}}>
            {liked.map((r,i)=>(
              <div key={i} onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");setActiveTab("ingredients");}} style={{borderRadius:"16px",overflow:"hidden",background:"rgba(255,255,255,0.07)",backdropFilter:"blur(10px)",display:"flex",height:"90px",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer"}}>
                <img src={r.img} alt={r.name} style={{width:90,height:90,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.src=FALLBACK;}}/>
                <div style={{padding:"0.8rem 1rem",flex:1}}>
                  <div style={{fontWeight:"700",fontSize:"0.95rem",marginBottom:"0.25rem"}}>{r.name}</div>
                  <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.78rem"}}>⏱ {r.time} · 🔥 {r.cal} kcal</div>
                  <div style={{color:"#4ade80",fontSize:"0.78rem",marginTop:"0.2rem"}}>💪 {r.protein}g Protein</div>
                </div>
                <div style={{display:"flex",alignItems:"center",paddingRight:"1rem",color:"rgba(255,255,255,0.3)"}}>›</div>
              </div>
            ))}
          </div>}
        {history.length>0&&<>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"0.8rem"}}>VERLAUF – antippen zum Öffnen</div>
          {history.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"0.8rem",padding:"0.5rem",borderRadius:"12px",marginBottom:"0.3rem",background:"rgba(255,255,255,0.03)",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              <img onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");setActiveTab("ingredients");}} src={r.img} alt={r.name} style={{width:42,height:42,borderRadius:8,objectFit:"cover"}} onError={e=>{e.target.src=FALLBACK;}}/>
              <span onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");}} style={{flex:1,fontSize:"0.88rem"}}>{r.name}</span>
              <span>{r.action==="right"?"❤️":"✖️"}</span>
              <button onClick={()=>setHistory(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:"0.85rem",cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <button onClick={()=>setHistory([])} style={{width:"100%",marginTop:"0.8rem",background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"12px",color:"rgba(255,120,120,0.7)",padding:"0.75rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem",marginBottom:"2rem"}}>Verlauf löschen</button>
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
          <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800"}}>Einstellungen ⚙️</h1>
        </div>
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.6rem"}}>PROFIL</div>
          <div style={{color:"rgba(255,255,255,0.6)"}}>👋 Hey <strong style={{color:"white"}}>{userName||"Foodie"}</strong>!</div>
          <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.78rem",marginTop:"0.25rem"}}>{allRecipes.length} Rezepte · {liked.length} Favoriten · {seenIds.length} gesehen</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.5rem"}}>🚀 SPOONACULAR – 300.000+ REZEPTE</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.78rem",marginBottom:"0.8rem",lineHeight:1.5}}>Gratis auf <strong style={{color:"#e67e22"}}>spoonacular.com/food-api</strong> anmelden → Key einfügen</div>
          <input value={spoonKey} onChange={e=>setSpoonKey(e.target.value)} placeholder="API Key eingeben..."
            style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"10px",color:"white",padding:"0.7rem 1rem",fontSize:"0.85rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:"0.6rem"}}/>
          <button onClick={()=>fetchSpoonacular(spoonKey)} disabled={spoonLoading||!spoonKey}
            style={{width:"100%",background:spoonKey?"linear-gradient(135deg,#e67e22,#f39c12)":"rgba(255,255,255,0.05)",border:"none",borderRadius:"10px",color:"white",padding:"0.75rem",fontSize:"0.85rem",fontWeight:"700",cursor:spoonKey?"pointer":"default",fontFamily:"inherit",opacity:spoonKey?1:0.5}}>
            {spoonLoading?"⏳ Lädt...":spoonLoaded?`✅ ${spoonRecipes.length} Rezepte geladen`:"Rezepte laden 🍽️"}
          </button>
        </div>
        <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.8rem"}}>ALLERGIEN AUSSCHLIESSEN</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.6rem",marginBottom:"1.5rem"}}>
          {ALLERGENS_LIST.map(a=>(
            <button key={a} onClick={()=>{const n=selectedAllergens.includes(a)?selectedAllergens.filter(x=>x!==a):[...selectedAllergens,a];setSelectedAllergens(n);applyFilter(moodFilter,n);}}
              style={{background:selectedAllergens.includes(a)?"rgba(255,68,68,0.25)":"rgba(255,255,255,0.08)",border:`1px solid ${selectedAllergens.includes(a)?"#ff4444":"rgba(255,255,255,0.12)"}`,borderRadius:"50px",color:selectedAllergens.includes(a)?"#ff8888":"rgba(255,255,255,0.7)",padding:"0.55rem 1.1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem"}}>
              {selectedAllergens.includes(a)?"✗ ":""}{a}
            </button>
          ))}
        </div>
        <button onClick={()=>{setSeenIds([]);showToast("🔀 Alle Gerichte zurückgesetzt!");}} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",color:"rgba(255,255,255,0.5)",padding:"0.8rem",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>🔀 Gesehene zurücksetzen</button>
        <button onClick={()=>{localStorage.removeItem("fs_onboarded");setOnboarded(false);setObStep(0);}} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",color:"rgba(255,255,255,0.3)",padding:"0.8rem",cursor:"pointer",fontFamily:"inherit",marginBottom:"2rem"}}>Onboarding wiederholen</button>
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
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1rem 1.2rem 0.2rem"}}>
          <button onClick={()=>setScreen("favorites")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>❤️ <span style={{color:"rgba(255,255,255,0.5)"}}>{liked.length}</span></button>
          <div style={{fontSize:"1.3rem",fontWeight:"900",background:"linear-gradient(90deg,#ff6b35,#ffcc02)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{userName?`Hey ${userName.split(" ")[0]}! 👋`:"FoodSwipe"}</div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <button onClick={()=>setScreen("shopping")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 0.85rem",cursor:"pointer",fontSize:"0.95rem",position:"relative"}}>
              🛒{shoppingList.length>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#ff6b35",borderRadius:"50%",width:16,height:16,fontSize:"0.5rem",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700"}}>{shoppingList.length}</span>}
            </button>
            <button onClick={()=>setScreen("settings")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 0.85rem",cursor:"pointer",fontSize:"0.95rem"}}>⚙️</button>
          </div>
        </div>
        <div style={{padding:"0.3rem 1rem 0.35rem",display:"flex",gap:"0.4rem",overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
          {MOODS.map(m=>(
            <button key={m} onClick={()=>{setMoodFilter(m);applyFilter(m,selectedAllergens);}}
              style={{background:moodFilter===m?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:`1px solid ${moodFilter===m?"transparent":"rgba(255,255,255,0.1)"}`,borderRadius:"50px",color:"white",padding:"0.3rem 0.9rem",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",fontSize:"0.73rem",fontWeight:moodFilter===m?"700":"400",flexShrink:0}}>
              {m==="Zur Uhrzeit"?`${slotInfo.emoji} ${m}`:m}
            </button>
          ))}
          <button onClick={()=>setShowAddDish(true)} style={{background:"rgba(142,68,173,0.3)",backdropFilter:"blur(10px)",border:"1px solid rgba(142,68,173,0.4)",borderRadius:"50px",color:"#c39bd3",padding:"0.3rem 0.9rem",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",fontSize:"0.73rem",fontWeight:"700",flexShrink:0}}>➕ Eigenes</button>
        </div>
        <div style={{padding:"0 1.2rem 0.1rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.22)"}}>{allRecipes.length} Gerichte</span>
          {spoonLoaded&&<span style={{fontSize:"0.65rem",background:"rgba(230,126,34,0.2)",color:"#e67e22",borderRadius:"20px",padding:"0.1rem 0.5rem"}}>+API</span>}
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
                <div style={{position:"absolute",top:"1.1rem",left:"1.1rem",border:"2.5px solid #ff4444",borderRadius:"8px",padding:"0.2rem 0.7rem",color:"#ff4444",fontWeight:"900",fontSize:"1rem",letterSpacing:"2px",opacity:nopeOp,transform:"rotate(-14deg)",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}}>NOPE</div>
                <div style={{position:"absolute",top:"1.1rem",left:"5rem",border:"2.5px solid #4ade80",borderRadius:"8px",padding:"0.2rem 0.7rem",color:"#4ade80",fontWeight:"900",fontSize:"1rem",letterSpacing:"2px",opacity:likeOp,transform:"rotate(14deg)",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}}>LECKER!</div>
                <button onClick={()=>{setDetailRecipe(current);setDetailFrom("swipe");setScreen("detail");setActiveTab("ingredients");}} style={{position:"absolute",bottom:"3.5rem",right:"0.8rem",background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"20px",color:"rgba(255,255,255,0.7)",padding:"0.25rem 0.7rem",fontSize:"0.68rem",cursor:"pointer",fontFamily:"inherit",backdropFilter:"blur(10px)"}}>👨‍🍳 Rezept</button>
                <div style={{position:"absolute",bottom:"1rem",left:"1.1rem",right:"1.1rem"}}>
                  <div style={{fontSize:"1.55rem",fontWeight:"900",lineHeight:1.15}}>{current.name}</div>
                  <div style={{display:"flex",gap:"0.9rem",marginTop:"0.3rem",fontSize:"0.8rem",color:"rgba(255,255,255,0.7)"}}>
                    <span>⏱ {current.time}</span><span>🔥 {current.cal} kcal</span><span style={{color:"#4ade80"}}>💪 {current.protein}g</span>
                  </div>
                </div>
              </div>
              <div style={{background:"rgba(8,8,18,0.96)",backdropFilter:"blur(20px)",padding:"0.75rem 1.1rem 0.9rem"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem",marginBottom:"0.65rem"}}>
                  {[{l:"Protein",v:current.protein,c:"#4ade80"},{l:"Carbs",v:current.carbs,c:"#60a5fa"},{l:"Fett",v:current.fat,c:"#fb923c"}].map(m=>(
                    <div key={m.l} style={{background:"rgba(255,255,255,0.06)",borderRadius:"10px",padding:"0.38rem",textAlign:"center"}}>
                      <div style={{fontSize:"0.92rem",fontWeight:"800",color:m.c}}>{m.v}g</div>
                      <div style={{fontSize:"0.56rem",color:"rgba(255,255,255,0.3)",letterSpacing:"1px"}}>{m.l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>
                  {current.ingredients.slice(0,4).map((ing,i)=>(
                    <span key={i} style={{background:"rgba(255,255,255,0.07)",borderRadius:"20px",padding:"0.16rem 0.58rem",fontSize:"0.7rem",color:"rgba(255,255,255,0.6)"}}>{ing.name} <span style={{color:"rgba(255,255,255,0.28)"}}>{ing.amount}</span></span>
                  ))}
                  {current.ingredients.length>4&&<span style={{background:"rgba(255,255,255,0.04)",borderRadius:"20px",padding:"0.16rem 0.58rem",fontSize:"0.7rem",color:"rgba(255,255,255,0.22)"}}>+{current.ingredients.length-4} mehr</span>}
                </div>
              </div>
            </div>
          ):(
            <div style={{textAlign:"center",color:"rgba(255,255,255,0.4)",padding:"2rem"}}>
              <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🍴</div>
              <div style={{fontSize:"1.1rem",fontWeight:"700"}}>Keine Rezepte</div>
              <div style={{fontSize:"0.85rem",marginTop:"0.5rem"}}>Anderen Filter wählen!</div>
            </div>
          )}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:"1.5rem",padding:"0.5rem 1.5rem 1.2rem",alignItems:"center",flexShrink:0}}>
          <button onClick={()=>doSwipe("left")} style={{width:60,height:60,borderRadius:"50%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"2px solid rgba(255,68,68,0.7)",color:"#ff6666",fontSize:"1.4rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",boxShadow:"0 4px 20px rgba(255,68,68,0.2)"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.12)";e.currentTarget.style.background="rgba(255,68,68,0.2)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.background="rgba(255,255,255,0.08)";}}>✕</button>
          <button onClick={()=>{setDeck(shuffle(buildDeck(moodFilter,selectedAllergens,seenIds)));setDeckIndex(0);showToast("🔀 Neu gemischt!");}} style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)",color:"#ffcc02",fontSize:"0.95rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔀</button>
          <button onClick={()=>doSwipe("right")} style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",color:"white",fontSize:"1.4rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",boxShadow:"0 4px 28px rgba(255,107,53,0.5)"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.12)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>❤️</button>
        </div>
      </div>
      {FONT}
    </div>
  );
}