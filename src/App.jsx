import { useState, useRef, useCallback, useEffect } from "react";

// ─── UTILS ───────────────────────────────────────────────────────────────────
const shuffle = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const getSlot = () => { const h=new Date().getHours(); if(h>=6&&h<11)return"morning"; if(h>=11&&h<15)return"lunch"; if(h>=15&&h<18)return"snack"; return"dinner";};
const slotLabel = {morning:{emoji:"🌅",sub:"Frühstücks-Ideen"},lunch:{emoji:"☀️",sub:"Mittagsideen"},snack:{emoji:"🌆",sub:"Schnelle Snacks"},dinner:{emoji:"🌙",sub:"Dinner-Ideen"}};
const slotMap = {morning:"breakfast",lunch:"lunch",snack:"snack",dinner:"dinner"};
const lsGet = (k,fb) => { try{const v=localStorage.getItem(k); return v?JSON.parse(v):fb;}catch{return fb;}};
const lsSet = (k,v) => { try{localStorage.setItem(k,JSON.stringify(v));}catch{}};

// ─── RECIPES ─────────────────────────────────────────────────────────────────
const LOCAL_RECIPES = [
  {id:1, name:"Teriyaki Chicken Bowl", time:"25 Min", cal:540, protein:42, carbs:48, fat:12, meal:["lunch","dinner"], tags:["Hähnchen","Protein"], src:"HelloFresh", srcColor:"#7cb518",
   img:"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
   allergens:["Soja","Sesam"],
   ingredients:[{name:"Hähnchenbrust",amount:"300g"},{name:"Jasminreis",amount:"150g"},{name:"Sojasoße",amount:"3 EL"},{name:"Honig",amount:"2 EL"},{name:"Sesam",amount:"1 TL"},{name:"Ingwer",amount:"1 Stück"}],
   steps:["Reis nach Packungsanleitung kochen (ca. 15 Min).", "Hähnchen in Streifen schneiden und in heißem Öl 5–6 Min goldbraun braten.", "Sojasoße, Honig und geriebenen Ingwer mischen – Sauce über das Hähnchen gießen und 2 Min einkochen.", "Alles über dem Reis anrichten und mit Sesam bestreuen."]},

  {id:2, name:"Spaghetti Carbonara", time:"20 Min", cal:680, protein:28, carbs:72, fat:28, meal:["lunch","dinner"], tags:["Pasta","Klassiker"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop",
   allergens:["Gluten","Ei","Milch"],
   ingredients:[{name:"Spaghetti",amount:"200g"},{name:"Guanciale",amount:"100g"},{name:"Pecorino Romano",amount:"60g"},{name:"Eier",amount:"3 Stück"},{name:"Schwarzer Pfeffer",amount:"nach Geschmack"}],
   steps:["Spaghetti in gesalzenem Wasser al dente kochen. 1 Tasse Nudelwasser aufheben!", "Guanciale in Streifen ohne Öl goldbraun und knusprig braten.", "Eier und geriebenen Pecorino cremig verrühren, pfeffern.", "Pasta zur Pfanne geben (Herd aus!), Ei-Käse-Mischung einrühren, Nudelwasser schlückchenweise zugeben bis cremig.", "Sofort servieren – nie erhitzen sonst gerinnt das Ei."]},

  {id:3, name:"Beef Steak & Gemüse", time:"30 Min", cal:620, protein:55, carbs:18, fat:32, meal:["dinner"], tags:["Rind","Protein","Grill"], src:"HelloFresh", srcColor:"#7cb518",
   img:"https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop",
   allergens:[],
   ingredients:[{name:"Rindersteak",amount:"250g"},{name:"Broccoli",amount:"200g"},{name:"Karotten",amount:"2 Stück"},{name:"Olivenöl",amount:"2 EL"},{name:"Knoblauch",amount:"2 Zehen"},{name:"Rosmarin",amount:"2 Zweige"}],
   steps:["Steak 30 Min vor dem Braten aus dem Kühlschrank nehmen – Raumtemperatur ist wichtig!", "Pfanne sehr stark erhitzen. Steak trocken tupfen, salzen und 2–3 Min pro Seite scharf anbraten.", "Butter, Knoblauch und Rosmarin zugeben – Steak immer wieder übergießen (Basting) für 1 Min.", "Steak 5 Min ruhen lassen (wichtig!) bevor du es anschneidest.", "Gemüse im selben Fett 5 Min schwenken, salzen und pfeffern."]},

  {id:4, name:"Shakshuka", time:"20 Min", cal:380, protein:22, carbs:28, fat:18, meal:["breakfast","lunch"], tags:["Vegetarisch","Frühstück"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&h=600&fit=crop",
   allergens:["Ei"],
   ingredients:[{name:"Eier",amount:"4 Stück"},{name:"Tomaten (Dose)",amount:"400g"},{name:"Paprika",amount:"2 Stück"},{name:"Zwiebel",amount:"1 Stück"},{name:"Kreuzkümmel",amount:"1 TL"},{name:"Paprikapulver",amount:"1 TL"}],
   steps:["Zwiebel und Paprika in Olivenöl 5 Min weich dünsten.", "Kreuzkümmel und Paprikapulver zugeben – 1 Min mitrösten bis es duftet.", "Tomaten aus der Dose zugeben, salzen, 8 Min köcheln bis die Sauce eindickt.", "Mulden in die Sauce drücken und Eier vorsichtig hineingleiten lassen.", "Deckel drauf, 4–5 Min pochieren bis das Eiweiß fest, das Eigelb noch weich ist. Mit Brot servieren!"]},

  {id:5, name:"Lachs Teriyaki", time:"25 Min", cal:510, protein:46, carbs:22, fat:24, meal:["lunch","dinner"], tags:["Fisch","Protein"], src:"HelloFresh", srcColor:"#7cb518",
   img:"https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
   allergens:["Fisch","Soja"],
   ingredients:[{name:"Lachsfilet",amount:"200g"},{name:"Sojasoße",amount:"3 EL"},{name:"Mirin",amount:"2 EL"},{name:"Sake",amount:"1 EL"},{name:"Zucker",amount:"1 TL"},{name:"Frühlingszwiebeln",amount:"2 Stück"}],
   steps:["Sojasoße, Mirin, Sake und Zucker mischen – das ist deine Teriyaki-Sauce.", "Lachs trocken tupfen und in Öl Hautseite zuerst 3 Min braten.", "Wenden, Sauce angießen und 2 Min karamellisieren lassen.", "Mit Frühlingszwiebeln und Reis servieren."]},

  {id:6, name:"Thai Green Curry", time:"35 Min", cal:580, protein:34, carbs:44, fat:26, meal:["dinner"], tags:["Thai","Scharf"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop",
   allergens:["Nüsse"],
   ingredients:[{name:"Hähnchenbrust",amount:"300g"},{name:"Kokosmilch",amount:"400ml"},{name:"Green Curry Paste",amount:"2 EL"},{name:"Jasminreis",amount:"150g"},{name:"Zucchini",amount:"1 Stück"},{name:"Thai Basilikum",amount:"1 Bund"}],
   steps:["Curry-Paste in etwas Öl 1–2 Min unter Rühren anrösten bis sie intensiv duftet.", "Hähnchen in Stücken zugeben und rundum anbraten.", "Kokosmilch angießen und alles 15 Min köcheln.", "Zucchini in den letzten 5 Min zugeben.", "Thai-Basilikum am Ende einrühren (nicht kochen!). Mit Reis servieren."]},

  {id:7, name:"Greek Salad & Hähnchen", time:"15 Min", cal:420, protein:38, carbs:14, fat:22, meal:["lunch","snack"], tags:["Salat","Protein"], src:"Eigene DB", srcColor:"#9b59b6",
   img:"https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
   allergens:["Milch"],
   ingredients:[{name:"Hähnchenbrust",amount:"200g"},{name:"Römersalat",amount:"150g"},{name:"Feta",amount:"80g"},{name:"Oliven",amount:"50g"},{name:"Gurke",amount:"0.5 Stück"},{name:"Olivenöl",amount:"2 EL"}],
   steps:["Hähnchen dünn klopfen, mit Salz, Pfeffer und Oregano würzen.", "In einer heißen Pfanne 3–4 Min pro Seite golden braten.", "Salat grob schneiden, Gurke würfeln, Feta zerbröseln.", "Alles in einer Schüssel mischen, Olivenöl und Zitronensaft drüber – fertig!"]},

  {id:8, name:"Egg Fried Rice", time:"20 Min", cal:490, protein:20, carbs:68, fat:16, meal:["lunch","dinner","snack"], tags:["Reis","Schnell"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop",
   allergens:["Ei","Soja"],
   ingredients:[{name:"Reis (Vortag)",amount:"300g"},{name:"Eier",amount:"3 Stück"},{name:"Sojasoße",amount:"2 EL"},{name:"Frühlingszwiebeln",amount:"3 Stück"},{name:"Sesamöl",amount:"1 TL"},{name:"Erbsen",amount:"80g"}],
   steps:["Wok oder große Pfanne sehr stark erhitzen – das ist das Geheimnis!", "Eier aufschlagen und 30 Sek rühren, dann zur Seite schieben.", "Kalten Vortags-Reis zugeben und aufbrechen – 2–3 Min bei Höchsthitze braten.", "Sojasoße, Erbsen und Frühlingszwiebeln zugeben, alles 1 Min schwenken.", "Am Ende Sesamöl drüber – nicht mitbraten, nur als Aroma!"]},

  {id:9, name:"Protein Pancakes", time:"15 Min", cal:440, protein:40, carbs:42, fat:10, meal:["breakfast"], tags:["Frühstück","Protein"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&h=600&fit=crop",
   allergens:["Ei","Milch","Gluten"],
   ingredients:[{name:"Proteinpulver",amount:"60g"},{name:"Haferflocken",amount:"100g"},{name:"Eier",amount:"2 Stück"},{name:"Banane",amount:"1 Stück"},{name:"Milch",amount:"100ml"},{name:"Backpulver",amount:"1 TL"}],
   steps:["Haferflocken kurz im Mixer zu feinem Mehl mahlen.", "Alle Zutaten zusammen glatt mixen – Teig 5 Min quellen lassen.", "Pfanne bei mittlerer Hitze mit wenig Öl erhitzen.", "Je 2–3 EL Teig pro Pancake, wenn Blasen entstehen wenden (ca. 2 Min pro Seite).", "Mit griechischem Joghurt und Beeren servieren."]},

  {id:10, name:"Avocado Toast Deluxe", time:"10 Min", cal:390, protein:14, carbs:34, fat:24, meal:["breakfast","snack"], tags:["Vegetarisch","Schnell"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800&h=600&fit=crop",
   allergens:["Gluten","Ei"],
   ingredients:[{name:"Sauerteigbrot",amount:"2 Scheiben"},{name:"Avocado",amount:"1 Stück"},{name:"Eier (pochiert)",amount:"2 Stück"},{name:"Chilliflocken",amount:"1 Prise"},{name:"Zitronensaft",amount:"1 TL"},{name:"Meersalz",amount:"nach Geschmack"}],
   steps:["Brot im Toaster goldbraun rösten.", "Avocado halbieren, mit Gabel zerdrücken, Zitronensaft, Salz und Pfeffer einarbeiten.", "Für pochierte Eier: Wasser sanft köcheln (nicht sprudeln!), Schuss Essig rein, Ei in eine Tasse schlagen und vorsichtig eingleiten. 3 Min pochieren.", "Avocado auf Toast, Ei drauf, Chiliflocken und Meersalz darüber."]},

  {id:11, name:"Hähnchen Shawarma", time:"30 Min", cal:580, protein:44, carbs:52, fat:20, meal:["lunch","dinner"], tags:["Hähnchen","Wrap"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=800&h=600&fit=crop",
   allergens:["Gluten","Milch"],
   ingredients:[{name:"Hähnchenbrust",amount:"300g"},{name:"Flatbread",amount:"2 Stück"},{name:"Joghurt-Sauce",amount:"3 EL"},{name:"Tomaten",amount:"2 Stück"},{name:"Gurke",amount:"0.5 Stück"},{name:"Shawarma-Gewürz",amount:"2 TL"}],
   steps:["Hähnchen mit Shawarma-Gewürz, Öl und Zitronensaft mind. 15 Min marinieren.", "Bei hoher Hitze 4–5 Min pro Seite braten bis innen 75°C.", "Ruhen lassen, dann in Streifen schneiden.", "Flatbread kurz in der Pfanne erwärmen. Mit Joghurt-Sauce bestreichen, Hähnchen und Gemüse drauf, einrollen."]},

  {id:12, name:"Lemon Herb Chicken", time:"30 Min", cal:460, protein:48, carbs:8, fat:24, meal:["lunch","dinner"], tags:["Hähnchen","Keto"], src:"HelloFresh", srcColor:"#7cb518",
   img:"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop",
   allergens:[],
   ingredients:[{name:"Hähnchenschenkel",amount:"400g"},{name:"Zitrone",amount:"2 Stück"},{name:"Knoblauch",amount:"4 Zehen"},{name:"Thymian",amount:"4 Zweige"},{name:"Olivenöl",amount:"3 EL"},{name:"Dijon Senf",amount:"1 EL"}],
   steps:["Ofen auf 200°C vorheizen.", "Zitronensaft, Olivenöl, Senf, zerdrückten Knoblauch und Thymian mischen.", "Hähnchen salzen, pfeffern und Marinade einreiben.", "30 Min im Ofen backen, in den letzten 5 Min Grill zuschalten für knusprige Haut."]},

  {id:13, name:"Overnight Oats", time:"5 Min", cal:380, protein:18, carbs:56, fat:10, meal:["breakfast"], tags:["Frühstück","Prep"], src:"Eigene DB", srcColor:"#9b59b6",
   img:"https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&h=600&fit=crop",
   allergens:["Gluten","Milch"],
   ingredients:[{name:"Haferflocken",amount:"80g"},{name:"Milch",amount:"200ml"},{name:"Chia-Samen",amount:"1 EL"},{name:"Honig",amount:"1 EL"},{name:"Beeren",amount:"100g"},{name:"Mandelmus",amount:"1 EL"}],
   steps:["Haferflocken, Chia-Samen, Milch und Honig in ein Glas geben.", "Gut umrühren und über Nacht (mind. 6 Std.) im Kühlschrank quellen lassen.", "Morgens mit frischen Beeren und Mandelmus toppen – fertig, keine Arbeit!"]},

  {id:14, name:"Veggie Buddha Bowl", time:"20 Min", cal:430, protein:18, carbs:62, fat:16, meal:["lunch","snack"], tags:["Vegetarisch","Bowl"], src:"Eigene DB", srcColor:"#9b59b6",
   img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
   allergens:["Sesam"],
   ingredients:[{name:"Kichererbsen",amount:"200g"},{name:"Süßkartoffel",amount:"1 Stück"},{name:"Quinoa",amount:"100g"},{name:"Tahini",amount:"2 EL"},{name:"Spinat",amount:"80g"},{name:"Rote Bete",amount:"1 Stück"}],
   steps:["Quinoa 15 Min kochen. Süßkartoffel würfeln und 20 Min bei 200°C im Ofen rösten.", "Kichererbsen abtropfen, mit Öl und Gewürzen 10 Min rösten.", "Tahini mit Zitronensaft und Wasser zu Sauce verrühren.", "Alles in einer Bowl anrichten – Spinat, Quinoa, Süßkartoffel, Kichererbsen, Sauce drüber."]},

  {id:15, name:"Beef Bulgogi", time:"35 Min", cal:560, protein:48, carbs:38, fat:22, meal:["dinner"], tags:["Korea","Rind"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop",
   allergens:["Soja","Sesam"],
   ingredients:[{name:"Rindfleisch (dünn)",amount:"300g"},{name:"Birne",amount:"0.5 Stück"},{name:"Sojasoße",amount:"4 EL"},{name:"Sesamöl",amount:"2 EL"},{name:"Knoblauch",amount:"3 Zehen"},{name:"Jasminreis",amount:"150g"}],
   steps:["Birne reiben – der Fruchtzucker macht das Fleisch zart (Geheimtipp!).", "Fleisch mit geriebener Birne, Sojasoße, Sesamöl und Knoblauch 20 Min marinieren.", "Wok sehr stark erhitzen, Fleisch portionsweise 2–3 Min braten (nicht zu viel auf einmal!).", "Mit Reis und eingelegtem Kimchi servieren."]},

  {id:16, name:"Joghurt & Granola Bowl", time:"5 Min", cal:320, protein:20, carbs:42, fat:8, meal:["breakfast","snack"], tags:["Frühstück","Schnell"], src:"Eigene DB", srcColor:"#9b59b6",
   img:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop",
   allergens:["Milch","Gluten","Nüsse"],
   ingredients:[{name:"Griech. Joghurt",amount:"200g"},{name:"Granola",amount:"50g"},{name:"Honig",amount:"1 EL"},{name:"Beeren",amount:"80g"},{name:"Chiasamen",amount:"1 TL"}],
   steps:["Joghurt in eine Schüssel geben.", "Granola gleichmäßig drüber verteilen.", "Frische Beeren arrangieren, Chiasamen und Honig drüber träufeln.", "Sofort servieren – Granola knusprig halten, nicht zu lange stehen lassen."]},

  {id:17, name:"Mango Shrimp Bowl", time:"25 Min", cal:480, protein:36, carbs:54, fat:14, meal:["lunch","dinner"], tags:["Meeresfrüchte","Sommer"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
   allergens:["Schalentiere"],
   ingredients:[{name:"Garnelen",amount:"250g"},{name:"Mango",amount:"1 Stück"},{name:"Basmatireis",amount:"150g"},{name:"Koriander",amount:"0.5 Bund"},{name:"Limette",amount:"1 Stück"},{name:"Chili",amount:"1 Stück"}],
   steps:["Reis kochen. Garnelen mit Salz, Pfeffer und Chili würzen.", "Garnelen in heißer Pfanne 1–2 Min pro Seite scharf braten – nicht zu lang, sie werden zäh!", "Mango würfeln, Limettensaft und Koriander mischen.", "Reis in Bowl, Garnelen drauf, Mango-Salsa obendrauf."]},

  {id:18, name:"Rührei & Räucherlachs", time:"10 Min", cal:360, protein:32, carbs:8, fat:22, meal:["breakfast"], tags:["Frühstück","Protein"], src:"Eigene DB", srcColor:"#9b59b6",
   img:"https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop",
   allergens:["Ei","Fisch","Milch"],
   ingredients:[{name:"Eier",amount:"3 Stück"},{name:"Räucherlachs",amount:"80g"},{name:"Butter",amount:"1 EL"},{name:"Frischkäse",amount:"30g"},{name:"Schnittlauch",amount:"1 Bund"}],
   steps:["Eier mit einer Prise Salz aufschlagen.", "Butter bei niedriger Hitze schmelzen – nicht heiß werden lassen!", "Eier eingießen und mit Spatel langsam und cremig rühren (2–3 Min – kein Stress!)", "Vom Herd nehmen wenn noch leicht feucht, Frischkäse einrühren.", "Auf Toast mit Räucherlachs und Schnittlauch anrichten."]},

  {id:19, name:"Pizza Margherita", time:"25 Min", cal:620, protein:22, carbs:80, fat:22, meal:["lunch","dinner"], tags:["Pizza","Vegetarisch"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
   allergens:["Gluten","Milch"],
   ingredients:[{name:"Pizzateig",amount:"1 Stück"},{name:"Tomatensoße",amount:"100ml"},{name:"Mozzarella",amount:"150g"},{name:"Basilikum",amount:"1 Bund"},{name:"Olivenöl",amount:"1 EL"}],
   steps:["Ofen auf Maximum (250–280°C) vorheizen, Blech mit aufheizen!", "Teig dünn ausrollen. Tomatensoße gleichmäßig verteilen – Rand freilassen.", "Mozzarella in Stücken drauf verteilen, Olivenöl drüber träufeln.", "8–10 Min auf dem heißen Blech backen bis der Rand blasig und gold ist.", "Basilikum erst nach dem Backen drauflegen – nie vorher, er verbrennt!"]},

  {id:20, name:"Chicken Tikka Masala", time:"40 Min", cal:590, protein:42, carbs:36, fat:28, meal:["dinner"], tags:["Indien","Hähnchen"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&h=600&fit=crop",
   allergens:["Milch"],
   ingredients:[{name:"Hähnchenbrust",amount:"300g"},{name:"Tomaten (Dose)",amount:"400g"},{name:"Sahne",amount:"100ml"},{name:"Tikka-Gewürz",amount:"2 EL"},{name:"Basmati",amount:"150g"},{name:"Zwiebel",amount:"1 Stück"}],
   steps:["Hähnchen würfeln und in Joghurt + Tikka-Gewürz 10 Min marinieren.", "Hähnchen scharf anbraten, herausnehmen.", "Zwiebel glasig dünsten, Gewürze 1 Min rösten, Tomaten zugeben.", "10 Min köcheln, dann Sahne einrühren und Hähnchen zurück.", "5 Min alles zusammen simmern. Mit Basmatireis und Naan servieren."]},

  {id:21, name:"Pad Thai", time:"25 Min", cal:560, protein:28, carbs:72, fat:18, meal:["lunch","dinner"], tags:["Thai","Nudeln"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&h=600&fit=crop",
   allergens:["Gluten","Soja","Ei"],
   ingredients:[{name:"Reisnudeln",amount:"200g"},{name:"Garnelen",amount:"150g"},{name:"Eier",amount:"2 Stück"},{name:"Tamarindenpaste",amount:"2 EL"},{name:"Erdnüsse",amount:"40g"},{name:"Limette",amount:"1 Stück"}],
   steps:["Reisnudeln 10 Min in lauwarmem Wasser einweichen, abtropfen.", "Garnelen 2 Min braten, zur Seite schieben. Eier in die Pfanne – scramble.", "Nudeln zugeben, Tamarindenpaste, Sojasoße, Chili verrühren.", "Alles 2 Min bei Höchsthitze anbraten.", "Mit Erdnüssen, Limettensaft und Koriander servieren."]},

  {id:22, name:"Tacos al Pastor", time:"30 Min", cal:540, protein:32, carbs:58, fat:20, meal:["lunch","dinner"], tags:["Mexiko","Schwein"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop",
   allergens:["Gluten"],
   ingredients:[{name:"Schweinefleisch",amount:"300g"},{name:"Tortillas",amount:"6 Stück"},{name:"Ananas",amount:"100g"},{name:"Koriander",amount:"0.5 Bund"},{name:"Chilipulver",amount:"2 TL"},{name:"Zwiebel",amount:"1 Stück"}],
   steps:["Schweinefleisch dünn schneiden und mit Achiote, Chili, Zitrone und Knoblauch 20 Min marinieren.", "In einer heißen gusseisernen Pfanne 2–3 Min pro Seite braten.", "Ananas kurz in der Pfanne karamellisieren.", "Tortillas warm machen. Mit Fleisch, Ananas, Zwiebel und Koriander belegen."]},

  {id:23, name:"Tonkotsu Ramen", time:"45 Min", cal:640, protein:38, carbs:66, fat:26, meal:["dinner"], tags:["Japan","Nudeln"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
   allergens:["Gluten","Ei","Soja"],
   ingredients:[{name:"Ramen-Nudeln",amount:"180g"},{name:"Chashu-Schwein",amount:"200g"},{name:"Weichgekochtes Ei",amount:"2 Stück"},{name:"Tonkotsu-Brühe",amount:"400ml"},{name:"Nori",amount:"2 Blatt"},{name:"Frühlingszwiebeln",amount:"2 Stück"}],
   steps:["Ei 6 Min köcheln, dann 10 Min in Eiswasser – perfekt wachsweiches Eigelb!", "Tonkotsu-Brühe erhitzen (Fertigprodukt oder selbst 3 Std. Schweineknochen kochen).", "Ramen-Nudeln 2 Min kochen, in Schüsseln verteilen.", "Heiße Brühe drüber, Chashu-Schwein aufslicen und drappieren.", "Nori, halbes Ei und Frühlingszwiebeln als Topping – sofort servieren!"]},

  {id:24, name:"Sushi Bowl", time:"20 Min", cal:480, protein:30, carbs:62, fat:12, meal:["lunch","dinner"], tags:["Japan","Fisch"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop",
   allergens:["Fisch","Soja","Sesam"],
   ingredients:[{name:"Sushireis",amount:"200g"},{name:"Lachs (roh)",amount:"150g"},{name:"Avocado",amount:"1 Stück"},{name:"Gurke",amount:"0.5 Stück"},{name:"Sriracha-Mayo",amount:"2 EL"},{name:"Sesam",amount:"1 TL"}],
   steps:["Sushireis kochen, mit Reisessig, Zucker und Salz würzen, abkühlen lassen.", "Lachs in Würfel schneiden (Sashimi-Qualität verwenden!).", "Avocado und Gurke in Scheiben schneiden.", "Reis in die Bowl, alles farbig anrichten, Sriracha-Mayo und Sesam drüber."]},

  {id:25, name:"Falafel Wrap", time:"25 Min", cal:510, protein:18, carbs:68, fat:20, meal:["lunch","snack"], tags:["Nahostküche","Vegetarisch"], src:"Eigene DB", srcColor:"#9b59b6",
   img:"https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?w=800&h=600&fit=crop",
   allergens:["Gluten","Sesam"],
   ingredients:[{name:"Falafel",amount:"6 Stück"},{name:"Pita",amount:"2 Stück"},{name:"Hummus",amount:"3 EL"},{name:"Tomaten",amount:"2 Stück"},{name:"Tzatziki",amount:"3 EL"},{name:"Rotkohl",amount:"50g"}],
   steps:["Falafel nach Packung in Öl goldbraun braten ODER 15 Min bei 200°C im Ofen backen.", "Pita kurz in der Pfanne erwärmen bis sie weich wird.", "Hummus dick auf dem Pita verteilen.", "Falafel hineinlegen, Tomaten, Rotkohl und Tzatziki drauf. Einrollen und genießen!"]},

  {id:26, name:"Pilz-Risotto", time:"40 Min", cal:550, protein:16, carbs:74, fat:18, meal:["dinner"], tags:["Vegetarisch","Risotto"], src:"HelloFresh", srcColor:"#7cb518",
   img:"https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop",
   allergens:["Milch"],
   ingredients:[{name:"Arborio-Reis",amount:"200g"},{name:"Champignons",amount:"250g"},{name:"Parmesan",amount:"60g"},{name:"Weißwein",amount:"100ml"},{name:"Butter",amount:"30g"},{name:"Gemüsebrühe",amount:"700ml"}],
   steps:["Brühe warm halten! Das ist das A und O beim Risotto.", "Zwiebel glasig dünsten, Reis 2 Min mitrösten bis er leicht transparent wird.", "Mit Weißwein ablöschen – warten bis er verdampft, dann erste Brühen-Kelle.", "Immer rühren, immer wenn fast trocken neue Kelle dazu. Geduld: 18–20 Min.", "Vom Herd: Butter und Parmesan einrühren – das macht es cremig. 2 Min stehen lassen."]},

  {id:27, name:"BBQ Pork Ribs", time:"120 Min", cal:780, protein:58, carbs:28, fat:48, meal:["dinner"], tags:["BBQ","Schwein"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1544025162-d76538b2a681?w=800&h=600&fit=crop",
   allergens:[],
   ingredients:[{name:"Schweinerippchen",amount:"800g"},{name:"BBQ-Sauce",amount:"150ml"},{name:"Paprikapulver",amount:"2 TL"},{name:"Knoblauchpulver",amount:"1 TL"},{name:"Brauner Zucker",amount:"2 EL"},{name:"Salz & Pfeffer",amount:"nach Geschmack"}],
   steps:["Silberhaut auf der Rückseite der Ribs entfernen (Küchenpapier hilft!).", "Trockenmarinade (Paprika, Knoblauch, Zucker, Salz) einreiben.", "In Alufolie wickeln und 90 Min bei 150°C im Ofen schmoren.", "Folie öffnen, BBQ-Sauce draufstreichen, 15 Min bei 220°C karamellisieren.", "Zwischen den Knochen aufschneiden – Fleisch soll vom Knochen fallen!"]},

  {id:28, name:"French Toast", time:"15 Min", cal:480, protein:16, carbs:62, fat:18, meal:["breakfast"], tags:["Frühstück","Süß"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1484723091739-30990c20f6df?w=800&h=600&fit=crop",
   allergens:["Gluten","Ei","Milch"],
   ingredients:[{name:"Toastbrot",amount:"4 Scheiben"},{name:"Eier",amount:"3 Stück"},{name:"Milch",amount:"100ml"},{name:"Zimt",amount:"1 TL"},{name:"Ahornsirup",amount:"2 EL"},{name:"Butter",amount:"1 EL"}],
   steps:["Eier, Milch, Zimt und Prise Salz verquirlen.", "Brotscheiben je 30 Sek von beiden Seiten eintauchen – sie sollen sattgetränkt sein.", "Butter in der Pfanne bei mittlerer Hitze schmelzen.", "Brot 2–3 Min pro Seite golden braten.", "Mit Ahornsirup, Puderzucker und frischen Beeren servieren."]},

  {id:29, name:"Smash Burger", time:"20 Min", cal:680, protein:42, carbs:48, fat:34, meal:["lunch","dinner"], tags:["Burger","Rind"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
   allergens:["Gluten","Milch","Ei"],
   ingredients:[{name:"Rinderhackfleisch",amount:"200g"},{name:"Brioche-Bun",amount:"1 Stück"},{name:"Cheddar",amount:"2 Scheiben"},{name:"Caramelized Onions",amount:"50g"},{name:"Spezial-Sauce",amount:"2 EL"},{name:"Salat & Tomate",amount:"nach Geschmack"}],
   steps:["Hackfleisch in 2 Kugeln teilen (NICHT würzen – erst danach!).", "Gusseisen- oder Stahlpfanne auf Maximum erhitzen – wirklich heiß!", "Kugel in die Pfanne, sofort mit Spatel FLACH drücken (Smash!) – 2 Min.", "Salzen, wenden, sofort Cheddar drauf – 60 Sek. Deckel drauf zum Schmelzen.", "Bun toasten, Special Sauce drauf, Burger-Stack bauen – sofort essen!"]},

  {id:30, name:"Smoothie Bowl", time:"10 Min", cal:340, protein:12, carbs:58, fat:8, meal:["breakfast","snack"], tags:["Frühstück","Gesund"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1494888427482-242d32babc0b?w=800&h=600&fit=crop",
   allergens:["Milch","Nüsse"],
   ingredients:[{name:"Gefrorene Beeren",amount:"200g"},{name:"Banane",amount:"1 Stück"},{name:"Kokosmilch",amount:"100ml"},{name:"Granola",amount:"40g"},{name:"Chia-Samen",amount:"1 EL"},{name:"Honig",amount:"1 TL"}],
   steps:["Gefrorene Beeren und Banane mit Kokosmilch kurz mixen – dickflüssig halten, wenig Flüssigkeit!", "In eine Schüssel gießen – Basis ist wichtig: dick wie Softeis.", "Granola als Streifen legen, dann Beeren, Chia, Honig drüber.", "Sofort essen – Toppings sollen noch knusprig sein!"]},

  {id:31, name:"Pho Bo", time:"60 Min", cal:420, protein:32, carbs:52, fat:10, meal:["lunch","dinner"], tags:["Vietnam","Suppe"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1582878826629-33b69f5a9f41?w=800&h=600&fit=crop",
   allergens:["Gluten","Soja"],
   ingredients:[{name:"Reisnudeln",amount:"200g"},{name:"Rinderbrühe",amount:"600ml"},{name:"Rindfleisch (dünn)",amount:"200g"},{name:"Bohnenkeim",amount:"80g"},{name:"Thai Basilikum",amount:"1 Bund"},{name:"Limette",amount:"1 Stück"}],
   steps:["Brühe mit Sternanis, Zimt und Ingwer 30 Min köcheln – oder Fertigbrühe verwenden.", "Reisnudeln 8 Min einweichen, abtropfen.", "Rindfleisch hauchdünn aufschneiden (am besten halb gefroren).", "Nudeln in Schüsseln, kochend heiße Brühe drüber – das garte das Fleisch!", "Basilikum, Bohnenkeim, Limette und Sriracha dazu servieren."]},

  {id:32, name:"Spinat-Omelette", time:"10 Min", cal:320, protein:28, carbs:6, fat:20, meal:["breakfast","snack"], tags:["Frühstück","Protein"], src:"Eigene DB", srcColor:"#9b59b6",
   img:"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop",
   allergens:["Ei","Milch"],
   ingredients:[{name:"Eier",amount:"3 Stück"},{name:"Spinat",amount:"80g"},{name:"Feta",amount:"40g"},{name:"Tomaten",amount:"1 Stück"},{name:"Butter",amount:"1 EL"}],
   steps:["Eier mit Salz und Pfeffer verquirlen.", "Spinat kurz in Butter zusammenfallen lassen, herausnehmen.", "Eimischung in die Pfanne bei mittlerer Hitze – Ränder nach innen ziehen.", "Wenn fast fest: Spinat, Feta und Tomaten auf eine Hälfte legen, zuklappen.", "Auf Teller gleiten lassen – nicht zu lange braten, innen darf es noch cremig sein!"]},

  {id:33, name:"Lamb Kebab", time:"35 Min", cal:560, protein:46, carbs:38, fat:24, meal:["lunch","dinner"], tags:["Nahostküche","Lamm"], src:"YouTube", srcColor:"#cc0000",
   img:"https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop",
   allergens:["Gluten"],
   ingredients:[{name:"Lammhackfleisch",amount:"300g"},{name:"Pita",amount:"2 Stück"},{name:"Zwiebel",amount:"1 Stück"},{name:"Kreuzkümmel",amount:"1 TL"},{name:"Koriander gemahlen",amount:"1 TL"},{name:"Joghurt-Sauce",amount:"3 EL"}],
   steps:["Hackfleisch mit geriebener Zwiebel, Gewürzen und Kräutern gut verkneten.", "Auf Holzspieße formen und 20 Min kalt stellen (hält besser zusammen).", "Auf heißem Grill oder Grillpfanne 3–4 Min pro Seite drehen.", "Joghurt-Sauce mit Knoblauch, Gurke und Minze anrühren.", "Im Pita mit roher Zwiebel und frischen Kräutern servieren."]},

  {id:34, name:"Zucchini-Nudeln Pesto", time:"15 Min", cal:340, protein:12, carbs:22, fat:24, meal:["lunch","dinner"], tags:["Vegetarisch","Low Carb"], src:"KI-Vorschlag", srcColor:"#ff6b35",
   img:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=600&fit=crop",
   allergens:["Nüsse","Milch"],
   ingredients:[{name:"Zucchini",amount:"3 Stück"},{name:"Basilikum-Pesto",amount:"4 EL"},{name:"Kirschtomaten",amount:"100g"},{name:"Parmesan",amount:"40g"},{name:"Pinienkerne",amount:"30g"}],
   steps:["Zucchini mit Spiralschneider oder Sparschäler zu langen Nudeln schneiden.", "Pinienkerne in der trockenen Pfanne goldbraun rösten – Achtung: verbrennen schnell!", "Kirschtomaten kurz in Olivenöl anbraten, 2 Min.", "Zucchini-Nudeln zugeben, nur 1 Min kurz anwärmen – sie sollen Biss haben!", "Pesto unterrühren, Parmesan und Pinienkerne drüber."]},
];

const ALLERGENS_LIST = ["Gluten","Milch","Ei","Nüsse","Fisch","Soja","Schalentiere","Sesam"];
const MOODS = ["Zur Uhrzeit","Alles","Schnell","High Protein","Vegetarisch","Trending","Wenig Kalorien"];
const MAX_HISTORY = 30;

export default function FoodSwipe() {
  const slot = getSlot();
  const slotInfo = slotLabel[slot];

  // ── Onboarding ─────────────────────────────────────────────────────────────
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem("fs_onboarded"));
  const [obStep, setObStep] = useState(0);
  const [userName, setUserName] = useState(() => localStorage.getItem("fs_name") || "");
  const [prefDiet, setPrefDiet] = useState("Alles");

  // ── Persistent state (localStorage) ───────────────────────────────────────
  const [liked, setLiked] = useState(() => lsGet("fs_liked", []));
  const [history, setHistory] = useState(() => lsGet("fs_history", []));
  const [shoppingList, setShoppingList] = useState(() => lsGet("fs_shopping", []));
  const [checkedItems, setCheckedItems] = useState(() => lsGet("fs_checked", {}));
  const [selectedAllergens, setSelectedAllergens] = useState(() => lsGet("fs_allergens", []));
  const [moodFilter, setMoodFilter] = useState(() => lsGet("fs_mood", "Zur Uhrzeit"));
  const [customRecipes, setCustomRecipes] = useState(() => lsGet("fs_custom", []));

  // Save to localStorage on change
  useEffect(() => { lsSet("fs_liked", liked); }, [liked]);
  useEffect(() => { lsSet("fs_history", history); }, [history]);
  useEffect(() => { lsSet("fs_shopping", shoppingList); }, [shoppingList]);
  useEffect(() => { lsSet("fs_checked", checkedItems); }, [checkedItems]);
  useEffect(() => { lsSet("fs_allergens", selectedAllergens); }, [selectedAllergens]);
  useEffect(() => { lsSet("fs_mood", moodFilter); }, [moodFilter]);
  useEffect(() => { lsSet("fs_custom", customRecipes); }, [customRecipes]);

  // ── Spoonacular ────────────────────────────────────────────────────────────
  const [spoonKey, setSpoonKey] = useState(() => localStorage.getItem("fs_spoon") || "");
  const [spoonRecipes, setSpoonRecipes] = useState([]);
  const [spoonLoading, setSpoonLoading] = useState(false);

  const allRecipes = [
    ...LOCAL_RECIPES,
    ...customRecipes,
    ...spoonRecipes.map(r => ({
      id:`sp_${r.id}`, name:r.title, time:`${r.readyInMinutes||30} Min`,
      cal:Math.round(r.nutrition?.nutrients?.find(n=>n.name==="Calories")?.amount||500),
      protein:Math.round(r.nutrition?.nutrients?.find(n=>n.name==="Protein")?.amount||25),
      carbs:Math.round(r.nutrition?.nutrients?.find(n=>n.name==="Carbohydrates")?.amount||40),
      fat:Math.round(r.nutrition?.nutrients?.find(n=>n.name==="Fat")?.amount||20),
      meal:["breakfast","lunch","dinner","snack"], tags:r.dishTypes||[],
      src:"Spoonacular", srcColor:"#e67e22",
      img:r.image||"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
      allergens:[], ingredients:(r.extendedIngredients||[]).map(i=>({name:i.name,amount:`${i.amount} ${i.unit}`})),
      steps: r.analyzedInstructions?.[0]?.steps?.map(s=>s.step) || ["Siehe Originalrezept auf Spoonacular."],
    }))
  ];

  const buildDeck = useCallback((mood, allergens) => {
    let list = allRecipes.filter(r => {
      if (!allergens.every(a => !r.allergens.includes(a))) return false;
      if (mood==="Zur Uhrzeit") return r.meal.includes(slotMap[slot]);
      if (mood==="Schnell") return parseInt(r.time)<=20;
      if (mood==="High Protein") return r.protein>=35;
      if (mood==="Vegetarisch") return r.tags.some(t=>t.toLowerCase().includes("vegetar")||t.toLowerCase().includes("vegan"))||r.ingredients.every(i=>!["Hähnchen","Rind","Schwein","Lachs","Garnelen","Fisch","Fleisch"].some(m=>i.name.includes(m)));
      if (mood==="Trending") return r.src==="YouTube";
      if (mood==="Wenig Kalorien") return r.cal<420;
      return true;
    });
    return shuffle(list);
  }, [allRecipes, slot]);

  const [deck, setDeck] = useState(() => buildDeck("Zur Uhrzeit", []));
  const [deckIndex, setDeckIndex] = useState(0);
  const [screen, setScreen] = useState("swipe");
  const [swipeDir, setSwipeDir] = useState(null);
  const [matchCard, setMatchCard] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState(null);
  const [detailFrom, setDetailFrom] = useState("favorites");
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDish, setNewDish] = useState({name:"",time:"",cal:"",protein:"",carbs:"",fat:"",img:"",ingredients:""});
  const dragStart = useRef(null);

  const current = deck[deckIndex % Math.max(deck.length,1)];
  const next = deck[(deckIndex+1) % Math.max(deck.length,1)];

  const applyFilter = useCallback((mood, allergens) => {
    setDeck(buildDeck(mood, allergens));
    setDeckIndex(0);
  }, [buildDeck]);

  const fetchSpoonacular = async (key) => {
    if(!key) return;
    setSpoonLoading(true);
    try {
      const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&number=50&addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true&addRecipeInstructions=true`);
      const data = await res.json();
      if(data.results) { setSpoonRecipes(data.results); localStorage.setItem("fs_spoon",key); }
    } catch(e) { console.error(e); }
    setSpoonLoading(false);
  };

  const doSwipe = (dir) => {
    if(!current) return;
    setSwipeDir(dir);
    setTimeout(() => {
      if(dir==="right") {
        setLiked(p=>[...p.filter(x=>x.id!==current.id),current]);
        setShoppingList(p=>[...p,...current.ingredients.filter(i=>!p.find(x=>x.name===i.name))]);
        setMatchCard(current); setScreen("match");
      }
      setHistory(p=>[{...current,action:dir},...p].slice(0,MAX_HISTORY));
      setDeckIndex(i=>i+1); setSwipeDir(null); setDragX(0);
    },320);
  };

  const onDS=e=>{dragStart.current=e.type==="touchstart"?e.touches[0].clientX:e.clientX;setIsDragging(true);};
  const onDM=e=>{if(!isDragging||dragStart.current===null)return;setDragX((e.type==="touchmove"?e.touches[0].clientX:e.clientX)-dragStart.current);};
  const onDE=()=>{if(Math.abs(dragX)>80)doSwipe(dragX>0?"right":"left");else setDragX(0);setIsDragging(false);dragStart.current=null;};

  const cardAnim = swipeDir?{transform:`translateX(${swipeDir==="right"?600:-600}px) rotate(${swipeDir==="right"?25:-25}deg)`,transition:"transform 0.32s cubic-bezier(.6,.05,.7,.2)",opacity:0}
    :isDragging?{transform:`translateX(${dragX}px) rotate(${dragX*0.06}deg)`,transition:"none"}
    :{transform:"none",transition:"transform 0.28s ease"};
  const likeOp=Math.min(1,Math.max(0,dragX/80));
  const nopeOp=Math.min(1,Math.max(0,-dragX/80));

  const FONT=<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>;

  const BG=({img})=>(
    <div style={{position:"fixed",inset:0,zIndex:0}}>
      <img src={img||"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
      <div style={{position:"absolute",inset:0,backdropFilter:"blur(45px) saturate(1.3)",background:"rgba(4,4,10,0.78)"}}/>
    </div>
  );

  const BackBtn=({to})=>(<button onClick={()=>setScreen(to)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",color:"white",width:40,height:40,fontSize:"1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>);

  // ── ONBOARDING ─────────────────────────────────────────────────────────────
  if(!onboarded){
    const steps=[
      <div key={0} style={{display:"flex",flexDirection:"column",height:"100%",padding:"2rem 1.5rem"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",gap:"1rem"}}>
          <div style={{fontSize:"4rem"}}>🍽️</div>
          <div style={{fontSize:"2.2rem",fontWeight:"900",background:"linear-gradient(90deg,#ff6b35,#ffcc02)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FoodSwipe</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:"1rem",lineHeight:1.6}}>Swipe dich zu deinem nächsten Lieblingsgericht.</div>
          <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Wie heißt du?" style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"14px",color:"white",padding:"0.9rem 1.2rem",fontSize:"1rem",width:"100%",fontFamily:"inherit",textAlign:"center",outline:"none",marginTop:"1rem",boxSizing:"border-box"}}/>
        </div>
        <button onClick={()=>setObStep(1)} style={{background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1.1rem",fontSize:"1rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(255,107,53,0.4)"}}>Weiter →</button>
      </div>,
      <div key={1} style={{display:"flex",flexDirection:"column",height:"100%",padding:"2rem 1.5rem"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:"1.5rem",fontWeight:"900",marginBottom:"0.5rem"}}>Deine Ernährung 💪</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem",marginBottom:"1.5rem"}}>Wir zeigen dir passende Gerichte</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.6rem"}}>
            {["Alles","Vegetarisch","High Protein","Low Carb","Schnell (<20 Min)"].map(d=>(
              <button key={d} onClick={()=>setPrefDiet(d)} style={{background:prefDiet===d?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"rgba(255,255,255,0.08)",border:`1px solid ${prefDiet===d?"transparent":"rgba(255,255,255,0.12)"}`,borderRadius:"50px",color:"white",padding:"0.6rem 1.1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem",fontWeight:prefDiet===d?"700":"400"}}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:"0.8rem"}}>
          <button onClick={()=>setObStep(0)} style={{flex:0.4,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",color:"white",padding:"1rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"700",fontSize:"0.95rem"}}>← Zurück</button>
          <button onClick={()=>{localStorage.setItem("fs_onboarded","1");localStorage.setItem("fs_name",userName);setOnboarded(true);}} style={{flex:1,background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1rem",fontSize:"0.95rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(255,107,53,0.4)"}}>Los geht's 🚀</button>
        </div>
      </div>,
    ];
    return(
      <div style={{height:"100vh",height:"100dvh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",color:"white",overflow:"hidden",position:"relative",background:"#07070f"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%,#3a1200 0%,#07070f 70%)",zIndex:0}}/>
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

  // ── ADD DISH ───────────────────────────────────────────────────────────────
  if(showAddDish){
    const inp=(label,key,placeholder,type="text")=>(
      <div style={{marginBottom:"0.8rem"}}>
        <div style={{fontSize:"0.65rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.3rem"}}>{label}</div>
        <input value={newDish[key]} onChange={e=>setNewDish(p=>({...p,[key]:e.target.value}))} placeholder={placeholder} type={type}
          style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"white",padding:"0.75rem 1rem",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
      </div>
    );
    return(
      <div style={{minHeight:"100vh",minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
        <BG img={current?.img}/>
        <div style={{position:"relative",zIndex:1,padding:"1.2rem 1.4rem",paddingBottom:"3rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem"}}><BackBtn to="swipe"/><h1 style={{margin:0,fontSize:"1.4rem",fontWeight:"800"}}>Eigenes Gericht ➕</h1></div>
          {inp("GERICHTNAME","name","z.B. Mamas Bolognese")}
          {inp("FOTO-URL","img","https://images.unsplash.com/...")}
          {inp("KOCHZEIT","time","z.B. 30 Min")}
          {inp("KALORIEN","cal","z.B. 520","number")}
          {inp("PROTEIN (g)","protein","z.B. 38","number")}
          {inp("CARBS (g)","carbs","z.B. 45","number")}
          {inp("FETT (g)","fat","z.B. 18","number")}
          <div style={{marginBottom:"1.2rem"}}>
            <div style={{fontSize:"0.65rem",letterSpacing:"1.5px",color:"rgba(255,255,255,0.35)",marginBottom:"0.3rem"}}>ZUTATEN (kommagetrennt: "Nudeln 200g, Hackfleisch 300g")</div>
            <textarea value={newDish.ingredients} onChange={e=>setNewDish(p=>({...p,ingredients:e.target.value}))} rows={3}
              style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"white",padding:"0.75rem 1rem",fontSize:"0.9rem",fontFamily:"inherit",outline:"none",resize:"none",boxSizing:"border-box"}}/>
          </div>
          <button onClick={()=>{
            if(!newDish.name)return;
            const dish={id:Date.now(),name:newDish.name,time:newDish.time||"? Min",cal:+newDish.cal||0,protein:+newDish.protein||0,carbs:+newDish.carbs||0,fat:+newDish.fat||0,meal:["breakfast","lunch","dinner","snack"],tags:["Eigene DB"],src:"Eigene DB",srcColor:"#8e44ad",img:newDish.img||"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",allergens:[],ingredients:newDish.ingredients.split(",").map(s=>{const p=s.trim().split(" ");return{name:p.slice(0,-1).join(" ")||s.trim(),amount:p[p.length-1]||""};}).filter(i=>i.name),steps:["Eigenes Rezept – kein Kochschritte hinterlegt."],_custom:true};
            const u=[...customRecipes,dish];
            setCustomRecipes(u);
            setNewDish({name:"",time:"",cal:"",protein:"",carbs:"",fat:"",img:"",ingredients:""});
            setShowAddDish(false);
            applyFilter(moodFilter,selectedAllergens);
          }} style={{width:"100%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1.1rem",fontSize:"1rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(255,107,53,0.4)",marginBottom:"0.8rem"}}>Gericht hinzufügen ✅</button>
          <button onClick={()=>setShowAddDish(false)} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",color:"white",padding:"1rem",fontFamily:"inherit",cursor:"pointer"}}>Abbrechen</button>
        </div>
        {FONT}
      </div>
    );
  }

  // ── DETAIL VIEW ─────────────────────────────────────────────────────────────
  if(screen==="detail"&&detailRecipe){
    const r=detailRecipe;
    const isLiked=liked.some(x=>x.id===r.id);
    return(
      <div style={{minHeight:"100vh",minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative",overflowY:"auto"}}>
        <BG img={r.img}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{height:"40vh",position:"relative",overflow:"hidden"}}>
            <img src={r.img} alt={r.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(4,4,10,0.97))"}}/>
            <button onClick={()=>setScreen(detailFrom)} style={{position:"absolute",top:"1rem",left:"1rem",background:"rgba(0,0,0,0.5)",border:"none",borderRadius:"50%",color:"white",width:40,height:40,fontSize:"1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)"}}>←</button>
            <div style={{position:"absolute",bottom:"1rem",left:"1.2rem",right:"1.2rem"}}>
              <span style={{background:r.srcColor,borderRadius:"20px",padding:"0.2rem 0.75rem",fontSize:"0.68rem",fontWeight:"800"}}>{r.src}</span>
              <div style={{fontSize:"1.9rem",fontWeight:"900",marginTop:"0.4rem"}}>{r.name}</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.82rem"}}>⏱ {r.time} · 🔥 {r.cal} kcal · <span style={{color:"#4ade80"}}>💪 {r.protein}g Protein</span></div>
            </div>
          </div>
          <div style={{padding:"1.2rem 1.4rem",paddingBottom:"3rem"}}>
            {/* Macros */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.7rem",marginBottom:"1.2rem"}}>
              {[{l:"Protein",v:r.protein,c:"#4ade80",icon:"💪"},{l:"Carbs",v:r.carbs,c:"#60a5fa",icon:"⚡"},{l:"Fett",v:r.fat,c:"#fb923c",icon:"🔥"}].map(m=>(
                <div key={m.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:"16px",padding:"1rem 0.5rem",textAlign:"center",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div style={{fontSize:"1.2rem",marginBottom:"0.2rem"}}>{m.icon}</div>
                  <div style={{fontSize:"1.3rem",fontWeight:"900",color:m.c}}>{m.v}g</div>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",letterSpacing:"1px"}}>{m.l.toUpperCase()}</div>
                </div>
              ))}
            </div>
            {/* Ingredients */}
            {r.ingredients.length>0&&(
              <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"20px",padding:"1.2rem",marginBottom:"1.2rem",border:"1px solid rgba(255,255,255,0.1)"}}>
                <div style={{fontSize:"0.65rem",letterSpacing:"2px",color:"rgba(255,255,255,0.4)",marginBottom:"1rem"}}>🛒 ZUTATEN</div>
                {r.ingredients.map((ing,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.5rem 0",borderBottom:i<r.ingredients.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
                    <span style={{fontSize:"0.92rem"}}>{ing.name}</span>
                    <span style={{background:"rgba(255,255,255,0.1)",borderRadius:"20px",padding:"0.18rem 0.65rem",fontSize:"0.8rem",fontWeight:"700",color:"rgba(255,255,255,0.7)"}}>{ing.amount}</span>
                  </div>
                ))}
              </div>
            )}
            {/* ✅ COOKING STEPS */}
            {r.steps&&r.steps.length>0&&(
              <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"20px",padding:"1.2rem",marginBottom:"1.2rem",border:"1px solid rgba(255,255,255,0.1)"}}>
                <div style={{fontSize:"0.65rem",letterSpacing:"2px",color:"rgba(255,255,255,0.4)",marginBottom:"1rem"}}>👨‍🍳 ZUBEREITUNG</div>
                {r.steps.map((step,i)=>(
                  <div key={i} style={{display:"flex",gap:"0.9rem",marginBottom:i<r.steps.length-1?"1rem":"0",paddingBottom:i<r.steps.length-1?"1rem":"0",borderBottom:i<r.steps.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:"900",flexShrink:0,marginTop:"0.1rem"}}>{i+1}</div>
                    <p style={{margin:0,fontSize:"0.9rem",lineHeight:1.6,color:"rgba(255,255,255,0.85)"}}>{step}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Action buttons */}
            <button onClick={()=>{isLiked?setLiked(p=>p.filter(x=>x.id!==r.id)):setLiked(p=>[...p.filter(x=>x.id!==r.id),r]);}}
              style={{width:"100%",background:isLiked?"rgba(255,68,68,0.15)":"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:isLiked?"1px solid rgba(255,68,68,0.3)":"none",borderRadius:"16px",color:isLiked?"#ff8888":"white",padding:"1rem",fontSize:"0.95rem",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem",boxShadow:isLiked?"none":"0 8px 30px rgba(255,107,53,0.4)"}}>
              {isLiked?"🗑 Aus Favoriten entfernen":"❤️ Zu Favoriten hinzufügen"}
            </button>
            {r._custom&&(
              <button onClick={()=>{const u=customRecipes.filter(x=>x.id!==r.id);setCustomRecipes(u);setScreen(detailFrom);}}
                style={{width:"100%",background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"16px",color:"rgba(255,120,120,0.8)",padding:"0.9rem",fontSize:"0.85rem",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>
                🗑 Eigenes Gericht löschen
              </button>
            )}
          </div>
        </div>
        {FONT}
      </div>
    );
  }

  // ── MATCH ──────────────────────────────────────────────────────────────────
  if(screen==="match"&&matchCard)return(
    <div style={{minHeight:"100vh",minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative",overflowY:"auto"}}>
      <BG img={matchCard.img}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{height:"42vh",position:"relative",overflow:"hidden"}}>
          <img src={matchCard.img} alt={matchCard.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(5,5,12,0.98))"}}/>
          <div style={{position:"absolute",bottom:"1.5rem",left:"1.5rem",right:"1.5rem"}}>
            <div style={{display:"inline-block",background:"linear-gradient(135deg,#ff6b35,#ffcc02)",borderRadius:"50px",padding:"0.3rem 1rem",fontSize:"0.75rem",fontWeight:"800",marginBottom:"0.5rem",letterSpacing:"1px"}}>🎉 MATCH!</div>
            <div style={{fontSize:"2rem",fontWeight:"900",lineHeight:1.1}}>{matchCard.name}</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.82rem",marginTop:"0.3rem"}}>⏱ {matchCard.time} · 🔥 {matchCard.cal} kcal · <span style={{color:"#4ade80"}}>💪 {matchCard.protein}g</span></div>
          </div>
        </div>
        <div style={{padding:"1.2rem 1.4rem",paddingBottom:"3rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.7rem",marginBottom:"1.2rem"}}>
            {[{l:"Protein",v:matchCard.protein,c:"#4ade80",icon:"💪"},{l:"Carbs",v:matchCard.carbs,c:"#60a5fa",icon:"⚡"},{l:"Fett",v:matchCard.fat,c:"#fb923c",icon:"🔥"}].map(m=>(
              <div key={m.l} style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",borderRadius:"16px",padding:"1rem 0.5rem",textAlign:"center",border:"1px solid rgba(255,255,255,0.1)"}}>
                <div style={{fontSize:"1.2rem",marginBottom:"0.2rem"}}>{m.icon}</div>
                <div style={{fontSize:"1.3rem",fontWeight:"900",color:m.c}}>{m.v}g</div>
                <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)",letterSpacing:"1px"}}>{m.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
          {/* Ingredients */}
          <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(10px)",borderRadius:"20px",padding:"1.2rem",marginBottom:"1rem",border:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{fontSize:"0.65rem",letterSpacing:"2px",color:"rgba(255,255,255,0.4)",marginBottom:"1rem"}}>🛒 ZUTATEN</div>
            {matchCard.ingredients.map((ing,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.5rem 0",borderBottom:i<matchCard.ingredients.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
                <span style={{fontSize:"0.92rem"}}>{ing.name}</span>
                <span style={{background:"rgba(255,255,255,0.1)",borderRadius:"20px",padding:"0.18rem 0.65rem",fontSize:"0.8rem",fontWeight:"700",color:"rgba(255,255,255,0.7)"}}>{ing.amount}</span>
              </div>
            ))}
          </div>
          {/* Steps preview */}
          {matchCard.steps&&matchCard.steps.length>0&&(
            <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"20px",padding:"1.2rem",marginBottom:"1.2rem",border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{fontSize:"0.65rem",letterSpacing:"2px",color:"rgba(255,255,255,0.4)",marginBottom:"1rem"}}>👨‍🍳 SCHRITT 1</div>
              <div style={{display:"flex",gap:"0.9rem",alignItems:"flex-start"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:"900",flexShrink:0}}>1</div>
                <p style={{margin:0,fontSize:"0.88rem",lineHeight:1.6,color:"rgba(255,255,255,0.8)"}}>{matchCard.steps[0]}</p>
              </div>
              {matchCard.steps.length>1&&<div style={{marginTop:"0.8rem",fontSize:"0.78rem",color:"rgba(255,255,255,0.35)"}}>+ {matchCard.steps.length-1} weitere Schritte im Rezept</div>}
            </div>
          )}
          <div style={{display:"flex",gap:"0.8rem"}}>
            <button onClick={()=>{setDetailRecipe(matchCard);setDetailFrom("swipe");setScreen("detail");setMatchCard(null);}} style={{flex:1,background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"16px",color:"white",padding:"1.1rem",fontSize:"0.95rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit"}}>📖 Vollständiges Rezept</button>
            <button onClick={()=>{setScreen("swipe");setMatchCard(null);}} style={{flex:1,background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",borderRadius:"16px",color:"white",padding:"1.1rem",fontSize:"0.95rem",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(255,107,53,0.4)"}}>Weiter 🔥</button>
          </div>
        </div>
      </div>
      {FONT}
    </div>
  );

  // ── SHOPPING ──────────────────────────────────────────────────────────────
  if(screen==="shopping")return(
    <div style={{minHeight:"100vh",minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
      <BG img={current?.img}/>
      <div style={{position:"relative",zIndex:1,padding:"1.4rem",paddingBottom:"3rem"}}>
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
                <div onClick={()=>setCheckedItems(p=>({...p,[item.name]:!p[item.name]}))} style={{width:24,height:24,borderRadius:7,border:`2px solid ${checkedItems[item.name]?"#4ade80":"rgba(255,255,255,0.25)"}`,background:checkedItems[item.name]?"#4ade80":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.2s"}}>
                  {checkedItems[item.name]&&<span style={{color:"#000",fontSize:"0.72rem",fontWeight:"900"}}>✓</span>}
                </div>
                <span onClick={()=>setCheckedItems(p=>({...p,[item.name]:!p[item.name]}))} style={{flex:1,textDecoration:checkedItems[item.name]?"line-through":"none",opacity:checkedItems[item.name]?0.4:1,cursor:"pointer",fontSize:"0.92rem"}}>{item.name}</span>
                <span style={{background:"rgba(255,255,255,0.1)",borderRadius:"20px",padding:"0.18rem 0.65rem",fontSize:"0.78rem",fontWeight:"700",color:"rgba(255,255,255,0.6)",opacity:checkedItems[item.name]?0.4:1}}>{item.amount}</span>
                <button onClick={()=>setShoppingList(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:"1rem",cursor:"pointer",padding:"0 0.2rem"}}>✕</button>
              </div>
            ))}
            <button onClick={()=>{setShoppingList([]);setCheckedItems({});}} style={{width:"100%",marginTop:"1rem",background:"rgba(255,68,68,0.12)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"14px",color:"rgba(255,120,120,0.8)",padding:"0.9rem",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>🗑 Liste leeren</button>
          </>}
      </div>
      {FONT}
    </div>
  );

  // ── FAVORITES ─────────────────────────────────────────────────────────────
  if(screen==="favorites")return(
    <div style={{minHeight:"100vh",minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
      <BG img={current?.img}/>
      <div style={{position:"relative",zIndex:1,padding:"1.4rem",paddingBottom:"3rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem"}}><BackBtn to="swipe"/><h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800"}}>Favoriten ❤️</h1></div>
        {liked.length===0
          ?<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",marginTop:"4rem"}}><div style={{fontSize:"3rem"}}>🍽️</div><p>Noch keine Favoriten.</p></div>
          :<div style={{display:"grid",gap:"0.8rem",marginBottom:"2rem"}}>
            {liked.map((r,i)=>(
              <div key={i} onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");}}
                style={{borderRadius:"16px",overflow:"hidden",background:"rgba(255,255,255,0.07)",backdropFilter:"blur(10px)",display:"flex",height:"90px",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.transform="scale(1.01)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.transform="scale(1)";}}>
                <img src={r.img} alt={r.name} style={{width:90,height:90,objectFit:"cover",flexShrink:0}}/>
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
          <div style={{fontSize:"0.65rem",letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"0.8rem"}}>VERLAUF – tippen zum Öffnen</div>
          {history.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"0.8rem",padding:"0.55rem 0.6rem",borderRadius:"12px",marginBottom:"0.3rem",background:"rgba(255,255,255,0.03)",cursor:"pointer",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              <img onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");}} src={r.img} alt={r.name} style={{width:42,height:42,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
              <span onClick={()=>{setDetailRecipe(r);setDetailFrom("favorites");setScreen("detail");}} style={{flex:1,fontSize:"0.88rem"}}>{r.name}</span>
              <span style={{marginRight:"0.3rem"}}>{r.action==="right"?"❤️":"✖️"}</span>
              <button onClick={e=>{e.stopPropagation();setHistory(p=>p.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:"0.85rem",cursor:"pointer",padding:"0.2rem 0.4rem"}}>✕</button>
            </div>
          ))}
          <button onClick={()=>setHistory([])} style={{width:"100%",marginTop:"0.8rem",background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:"12px",color:"rgba(255,120,120,0.7)",padding:"0.75rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem"}}>Verlauf löschen</button>
        </>}
      </div>
      {FONT}
    </div>
  );

  // ── SETTINGS ──────────────────────────────────────────────────────────────
  if(screen==="settings")return(
    <div style={{minHeight:"100vh",minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"white",position:"relative"}}>
      <BG img={current?.img}/>
      <div style={{position:"relative",zIndex:1,padding:"1.4rem",paddingBottom:"3rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"2rem"}}><BackBtn to="swipe"/><h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800"}}>Einstellungen ⚙️</h1></div>
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1.2rem",border:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.8rem"}}>PROFIL</div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.9rem"}}>👋 Hallo, <strong style={{color:"white"}}>{userName||"Foodie"}</strong>!</div>
          <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.78rem",marginTop:"0.3rem"}}>{allRecipes.length} Rezepte · {liked.length} Favoriten · {history.length} Verlauf</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"16px",padding:"1rem",marginBottom:"1.2rem",border:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"0.5rem"}}>SPOONACULAR API 🚀</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.78rem",marginBottom:"0.8rem",lineHeight:1.5}}>Gratis auf <strong style={{color:"#e67e22"}}>spoonacular.com/food-api</strong> anmelden → API Key kopieren</div>
          <input value={spoonKey} onChange={e=>setSpoonKey(e.target.value)} placeholder="API Key eingeben..."
            style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"10px",color:"white",padding:"0.7rem 1rem",fontSize:"0.85rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:"0.6rem"}}/>
          <button onClick={()=>fetchSpoonacular(spoonKey)} disabled={spoonLoading||!spoonKey}
            style={{width:"100%",background:spoonKey?"linear-gradient(135deg,#e67e22,#f39c12)":"rgba(255,255,255,0.05)",border:"none",borderRadius:"10px",color:"white",padding:"0.75rem",fontSize:"0.85rem",fontWeight:"700",cursor:spoonKey?"pointer":"default",fontFamily:"inherit",opacity:spoonKey?1:0.5}}>
            {spoonLoading?"⏳ Lädt...":spoonRecipes.length>0?`✅ ${spoonRecipes.length} Rezepte geladen`:"Rezepte laden 🍽️"}
          </button>
        </div>
        <div style={{fontSize:"0.62rem",letterSpacing:"2px",color:"rgba(255,107,53,0.9)",marginBottom:"1rem"}}>ALLERGIEN</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.6rem",marginBottom:"1.5rem"}}>
          {ALLERGENS_LIST.map(a=>(
            <button key={a} onClick={()=>{const n=selectedAllergens.includes(a)?selectedAllergens.filter(x=>x!==a):[...selectedAllergens,a];setSelectedAllergens(n);applyFilter(moodFilter,n);}}
              style={{background:selectedAllergens.includes(a)?"rgba(255,68,68,0.25)":"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:`1px solid ${selectedAllergens.includes(a)?"#ff4444":"rgba(255,255,255,0.12)"}`,borderRadius:"50px",color:selectedAllergens.includes(a)?"#ff8888":"rgba(255,255,255,0.7)",padding:"0.55rem 1.1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem"}}>
              {selectedAllergens.includes(a)?"✗ ":""}{a}
            </button>
          ))}
        </div>
        <button onClick={()=>{localStorage.removeItem("fs_onboarded");setOnboarded(false);setObStep(0);}} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",color:"rgba(255,255,255,0.3)",padding:"0.8rem",cursor:"pointer",fontFamily:"inherit",marginBottom:"0.8rem"}}>Onboarding wiederholen</button>
        <button onClick={()=>{if(window.confirm("Alle Daten löschen?")){["fs_liked","fs_history","fs_shopping","fs_checked","fs_onboarded","fs_name","fs_spoon","fs_custom","fs_allergens","fs_mood"].forEach(k=>localStorage.removeItem(k));window.location.reload();}}} style={{width:"100%",background:"rgba(255,68,68,0.08)",border:"1px solid rgba(255,68,68,0.15)",borderRadius:"14px",color:"rgba(255,120,120,0.5)",padding:"0.8rem",cursor:"pointer",fontFamily:"inherit"}}>Alle Daten zurücksetzen</button>
      </div>
      {FONT}
    </div>
  );

  // ── MAIN SWIPE ─────────────────────────────────────────────────────────────
  return(
    <div style={{height:"100vh",height:"100dvh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",color:"white",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",inset:0,zIndex:0}}>
        {current&&<>
          <img key={current.id} src={current.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,backdropFilter:"blur(50px) saturate(1.4)",background:"rgba(4,4,10,0.72)"}}/>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(0,0,0,0.5) 100%)"}}/>
        </>}
      </div>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",height:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1rem 1.2rem 0.2rem"}}>
          <button onClick={()=>setScreen("favorites")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 1rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>❤️ <span style={{color:"rgba(255,255,255,0.5)"}}>{liked.length}</span></button>
          <div style={{fontSize:"1.2rem",fontWeight:"900",background:"linear-gradient(90deg,#ff6b35,#ffcc02)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{userName?`Hey ${userName}! 👋`:"FoodSwipe"}</div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <button onClick={()=>setScreen("shopping")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 0.85rem",cursor:"pointer",fontSize:"0.95rem",position:"relative"}}>
              🛒{shoppingList.length>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#ff6b35",borderRadius:"50%",width:16,height:16,fontSize:"0.5rem",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700"}}>{shoppingList.length}</span>}
            </button>
            <button onClick={()=>setScreen("settings")} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50px",color:"white",padding:"0.4rem 0.85rem",cursor:"pointer",fontSize:"0.95rem"}}>⚙️</button>
          </div>
        </div>
        {moodFilter==="Zur Uhrzeit"&&<div style={{padding:"0.15rem 1.2rem 0",display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span>{slotInfo.emoji}</span><span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{slotInfo.sub}</span>
          <span style={{marginLeft:"auto",fontSize:"0.68rem",color:"rgba(255,255,255,0.22)"}}>{allRecipes.length} Gerichte</span>
        </div>}
        <div style={{padding:"0.25rem 1rem 0.35rem",display:"flex",gap:"0.4rem",overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
          {MOODS.map(m=>(
            <button key={m} onClick={()=>{setMoodFilter(m);applyFilter(m,selectedAllergens);}}
              style={{background:moodFilter===m?"linear-gradient(135deg,#ff6b35,#ff9a3c)":"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:`1px solid ${moodFilter===m?"transparent":"rgba(255,255,255,0.1)"}`,borderRadius:"50px",color:"white",padding:"0.28rem 0.85rem",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",fontSize:"0.72rem",fontWeight:moodFilter===m?"700":"400",flexShrink:0}}>
              {m==="Zur Uhrzeit"?`${slotInfo.emoji} ${m}`:m}
            </button>
          ))}
          <button onClick={()=>setShowAddDish(true)} style={{background:"rgba(142,68,173,0.3)",backdropFilter:"blur(10px)",border:"1px solid rgba(142,68,173,0.4)",borderRadius:"50px",color:"#c39bd3",padding:"0.28rem 0.85rem",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",fontSize:"0.72rem",fontWeight:"700",flexShrink:0}}>➕ Eigenes</button>
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0.2rem 1.2rem",position:"relative",minHeight:0}}>
          {next&&current?.id!==next?.id&&(
            <div style={{position:"absolute",width:"100%",maxWidth:"420px",borderRadius:"28px",overflow:"hidden",transform:"scale(0.93) translateY(14px)",zIndex:1}}>
              <img src={next.img} alt="" style={{width:"100%",height:"360px",objectFit:"cover",filter:"brightness(0.3) blur(2px)"}}/>
            </div>
          )}
          {current?(
            <div style={{position:"relative",width:"100%",maxWidth:"420px",zIndex:2,borderRadius:"28px",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.7)",cursor:isDragging?"grabbing":"grab",...cardAnim}}
              onMouseDown={onDS} onMouseMove={onDM} onMouseUp={onDE} onMouseLeave={onDE}
              onTouchStart={onDS} onTouchMove={onDM} onTouchEnd={onDE}>
              <div style={{position:"relative",height:"280px",overflow:"hidden"}}>
                <img src={current.img} alt={current.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",pointerEvents:"none",transform:isDragging?`scale(1.04) translateX(${dragX*0.015}px)`:"scale(1)",transition:isDragging?"none":"transform 0.3s ease"}} draggable={false}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,transparent 30%,transparent 45%,rgba(4,4,10,1) 100%)"}}/>
                <div style={{position:"absolute",top:"1rem",right:"1rem",background:current.srcColor,borderRadius:"20px",padding:"0.22rem 0.8rem",fontSize:"0.68rem",fontWeight:"800",color:"white"}}>{current.src}</div>
                <div style={{position:"absolute",top:"1.1rem",left:"1.1rem",border:"2.5px solid #ff4444",borderRadius:"8px",padding:"0.2rem 0.7rem",color:"#ff4444",fontWeight:"900",fontSize:"1rem",letterSpacing:"2px",opacity:nopeOp,transform:"rotate(-14deg)",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}}>NOPE</div>
                <div style={{position:"absolute",top:"1.1rem",right:"5.5rem",border:"2.5px solid #4ade80",borderRadius:"8px",padding:"0.2rem 0.7rem",color:"#4ade80",fontWeight:"900",fontSize:"1rem",letterSpacing:"2px",opacity:likeOp,transform:"rotate(14deg)",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}}>LECKER!</div>
                <div style={{position:"absolute",bottom:"1rem",left:"1.1rem",right:"1.1rem"}}>
                  <div style={{fontSize:"1.5rem",fontWeight:"900",lineHeight:1.15}}>{current.name}</div>
                  <div style={{display:"flex",gap:"0.9rem",marginTop:"0.25rem",fontSize:"0.78rem",color:"rgba(255,255,255,0.7)"}}>
                    <span>⏱ {current.time}</span><span>🔥 {current.cal} kcal</span><span style={{color:"#4ade80"}}>💪 {current.protein}g</span>
                  </div>
                </div>
              </div>
              <div style={{background:"rgba(8,8,18,0.96)",backdropFilter:"blur(20px)",padding:"0.7rem 1.1rem 0.9rem"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem",marginBottom:"0.6rem"}}>
                  {[{l:"Protein",v:current.protein,c:"#4ade80"},{l:"Carbs",v:current.carbs,c:"#60a5fa"},{l:"Fett",v:current.fat,c:"#fb923c"}].map(m=>(
                    <div key={m.l} style={{background:"rgba(255,255,255,0.06)",borderRadius:"10px",padding:"0.35rem",textAlign:"center"}}>
                      <div style={{fontSize:"0.9rem",fontWeight:"800",color:m.c}}>{m.v}g</div>
                      <div style={{fontSize:"0.56rem",color:"rgba(255,255,255,0.3)",letterSpacing:"1px"}}>{m.l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>
                  {current.ingredients.slice(0,4).map((ing,i)=>(
                    <span key={i} style={{background:"rgba(255,255,255,0.07)",borderRadius:"20px",padding:"0.15rem 0.55rem",fontSize:"0.68rem",color:"rgba(255,255,255,0.6)"}}>{ing.name}</span>
                  ))}
                  {current.steps&&<span style={{background:"rgba(255,107,53,0.12)",borderRadius:"20px",padding:"0.15rem 0.55rem",fontSize:"0.68rem",color:"rgba(255,107,53,0.8)",border:"1px solid rgba(255,107,53,0.2)"}}>👨‍🍳 {current.steps.length} Schritte</span>}
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
          <button onClick={()=>doSwipe("left")} style={{width:60,height:60,borderRadius:"50%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"2px solid rgba(255,68,68,0.7)",color:"#ff6666",fontSize:"1.4rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.12)";e.currentTarget.style.background="rgba(255,68,68,0.2)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.background="rgba(255,255,255,0.08)";}}>✕</button>
          <button onClick={()=>{setDeck(shuffle(deck));setDeckIndex(0);}} style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)",color:"#ffcc02",fontSize:"1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔀</button>
          <button onClick={()=>doSwipe("right")} style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#ff6b35,#ff9a3c)",border:"none",color:"white",fontSize:"1.4rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",boxShadow:"0 4px 28px rgba(255,107,53,0.5)"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.12)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>❤️</button>
        </div>
      </div>
      {FONT}
    </div>
  );
}
