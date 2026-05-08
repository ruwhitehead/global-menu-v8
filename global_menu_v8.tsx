import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";

// ── Fonts: Cormorant Garamond (display) + Inter (body) ───────────────────────
function useFonts() {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.media = "print";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap";
    l.onload = () => { l.media = "all"; };
    document.head.appendChild(l);
    const s = document.createElement("style");
    s.textContent = `
      * { font-family: 'Inter', sans-serif !important; -webkit-font-smoothing: antialiased; box-sizing: border-box; }
      .fd { font-family: 'Cormorant Garamond', Georgia, serif !important; }
      .fi { font-family: 'Cormorant Garamond', Georgia, serif !important; font-style: italic; }
    `;
    document.head.appendChild(s);
  }, []);
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  black:   "#0a0a0a",
  offBlack:"#111111",
  ink:     "#1a1a1a",
  charcoal:"#2a2a2a",
  mid:     "#555555",
  muted:   "#888888",
  rule:    "#e0e0e0",
  ruleLight:"#efefef",
  cream:   "#f9f7f4",
  white:   "#ffffff",
  gold:    "#c9a96e",
  goldLight:"#e8d5b0",
};

// ── Dish type classifier ──────────────────────────────────────────────────────
const DISH_TYPES = [
  { keys:["soup","broth","pho","tom yum","chowder","gazpacho","borscht","bouillabaisse","bisque","rosół","potage"], icon:"🍜", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["pizza","flatbread","pissaladière","focaccia"], icon:"🍕", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["pasta","carbonara","lasagne","lasagna","gnocchi","spaghetti","penne","tagliatelle","cacio e pepe","noodle","mì","ramen","maultaschen","spätzle","pierogi","dumpling","ravioli","kluski","wonton"], icon:"🍝", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["rice","biryani","risotto","paella","jollof","fried rice","pilaf","arroz","pulao","congee","cơm","xôi","炒饭"], icon:"🍚", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["curry","masala","tikka","makhani","korma","vindaloo","rogan","करी","แกง"], icon:"🍛", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["steak","beef","schnitzel","sauerbraten","churrasco","wellington","rouladen"], icon:"🥩", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["chicken","pollo","poulet","murgh","coq au vin","tandoori","ไก่","gà"], icon:"🍗", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["fish","chips","seafood","prawn","shrimp","crab","lobster","moqueca","salmon","cod","cá","ปลา","鱼"], icon:"🐟", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["bread","croissant","baguette","pretzel","brioche","scone","pão","roti","paratha","naan","bun","toast"], icon:"🥐", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["salad","slaw","som tam","papaya","niçoise","panzanella"], icon:"🥗", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["cake","dessert","tiramisu","brulee","pudding","tart","torte","gulab","churros","crepe","crêpe","panna cotta","mango sticky","brigadeiro","halwa","kheer","jalebi","kulfi","rasmalai"], icon:"🍰", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["sausage","bratwurst","kiełbasa","currywurst","chorizo","wurst","bangers"], icon:"🌭", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["egg","omelette","tortilla","quiche","frittata"], icon:"🍳", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["tofu","miso","mapo","豆腐"], icon:"🫘", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["wrap","taco","shawarma","kebab","sandwich","bánh mì","banh mi"], icon:"🌮", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["roast","sunday roast","grilled","barbecue","bbq","ย่าง","nướng","烤"], icon:"🍖", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["pork","bacon","ham","ribs","belly","heo","猪"], icon:"🥓", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["lamb","mutton","cordero","baranina","羊"], icon:"🐑", bg:"#1a1a1a", accent:"#c9a96e" },
  { keys:["stew","braise","hotpot","casserole","ragù","bigos","feijoada","cocido","goulash","火锅","lẩu"], icon:"🍲", bg:"#1a1a1a", accent:"#c9a96e" },
];
const styleCache = new Map();
function getDishStyle(local, english) {
  const key = `${local}|${english}`;
  if (styleCache.has(key)) return styleCache.get(key);
  const text = `${(english||"").toLowerCase()} ${(local||"").toLowerCase()}`;
  for (const t of DISH_TYPES) {
    if (t.keys.some(k => text.includes(k))) { styleCache.set(key, t); return t; }
  }
  const fb = { icon:"🍽️", bg:"#1a1a1a", accent:"#c9a96e" };
  styleCache.set(key, fb); return fb;
}

// ── Countries ─────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code:"FR", name:"France",         lang:"French",         color:"#002395", accent:"#ED2939" },
  { code:"IT", name:"Italy",          lang:"Italian",        color:"#008C45", accent:"#CE2B37" },
  { code:"DE", name:"Germany",        lang:"German",         color:"#1a1a1a", accent:"#DD0000" },
  { code:"ES", name:"Spain",          lang:"Spanish",        color:"#AA151B", accent:"#F1BF00" },
  { code:"CN", name:"China",          lang:"Chinese",        color:"#DE2910", accent:"#FFDE00" },
  { code:"BR", name:"Brazil",         lang:"Portuguese",     color:"#009C3B", accent:"#FFDF00" },
  { code:"NG", name:"Nigeria",        lang:"English/Yoruba", color:"#008751", accent:"#ffffff" },
  { code:"TH", name:"Thailand",       lang:"Thai",           color:"#A51931", accent:"#2D2A4A" },
  { code:"PL", name:"Poland",         lang:"Polish",         color:"#DC143C", accent:"#f5f5f5" },
  { code:"VN", name:"Vietnam",        lang:"Vietnamese",     color:"#DA251D", accent:"#FFCD00" },
  { code:"GB", name:"United Kingdom", lang:"English",        color:"#012169", accent:"#C8102E" },
  { code:"IN", name:"India",          lang:"Hindi/Regional", color:"#FF9933", accent:"#138808" },
];
const WC = ["#1a1a1a","#2a2a2a","#3a3a3a","#c9a96e","#8b6914","#d4a853","#444","#555","#666","#b8902a","#333","#777"];

// ── Menu data ─────────────────────────────────────────────────────────────────
const MENU_DATA = {
  FR:[
    {rank:1,local:"Steak Frites",english:"Steak and Chips",prep:"10 mins"},{rank:2,local:"Croque Monsieur",english:"Ham and Cheese Toast",prep:"10 mins"},{rank:3,local:"Soupe à l'Oignon",english:"French Onion Soup",prep:"15 mins"},{rank:4,local:"Salade Niçoise",english:"Niçoise Salad",prep:"20 mins"},{rank:5,local:"Quiche Lorraine",english:"Quiche Lorraine",prep:"20 mins"},{rank:6,local:"Bouillabaisse",english:"Seafood Stew",prep:"30 mins"},{rank:7,local:"Coq au Vin",english:"Chicken in Wine",prep:"20 mins"},{rank:8,local:"Confit de Canard",english:"Duck Confit",prep:"15 mins"},{rank:9,local:"Croissant",english:"Croissant",prep:"5 mins"},{rank:10,local:"Crêpes",english:"Pancakes",prep:"10 mins"},{rank:11,local:"Ratatouille",english:"Ratatouille",prep:"20 mins"},{rank:12,local:"Escargots",english:"Snails in Garlic Butter",prep:"15 mins"},{rank:13,local:"Foie Gras",english:"Foie Gras",prep:"10 mins"},{rank:14,local:"Moules Marinières",english:"Mussels in White Wine",prep:"10 mins"},{rank:15,local:"Boeuf Bourguignon",english:"Beef Bourguignon",prep:"30 mins"},{rank:16,local:"Tarte Tatin",english:"Upside-down Apple Tart",prep:"20 mins"},{rank:17,local:"Crème Brûlée",english:"Burnt Cream",prep:"15 mins"},{rank:18,local:"Soufflé au Fromage",english:"Cheese Soufflé",prep:"20 mins"},{rank:19,local:"Tartiflette",english:"Potato and Cheese Bake",prep:"20 mins"},{rank:20,local:"Cassoulet",english:"Bean and Meat Casserole",prep:"30 mins"},{rank:21,local:"Gratin Dauphinois",english:"Potato Gratin",prep:"20 mins"},{rank:22,local:"Vichyssoise",english:"Cold Leek and Potato Soup",prep:"20 mins"},{rank:23,local:"Île Flottante",english:"Floating Island Dessert",prep:"20 mins"},{rank:24,local:"Madeleines",english:"Shell-shaped Cakes",prep:"15 mins"},{rank:25,local:"Pain Perdu",english:"French Toast",prep:"10 mins"},{rank:26,local:"Blanquette de Veau",english:"White Veal Stew",prep:"20 mins"},{rank:27,local:"Pot-au-Feu",english:"Boiled Beef and Vegetables",prep:"30 mins"},{rank:28,local:"Clafoutis",english:"Cherry Batter Pudding",prep:"15 mins"},{rank:29,local:"Gougères",english:"Cheese Puffs",prep:"20 mins"},{rank:30,local:"Profiteroles",english:"Cream Puffs",prep:"30 mins"},{rank:31,local:"Mousse au Chocolat",english:"Chocolate Mousse",prep:"20 mins"},{rank:32,local:"Tarte aux Fraises",english:"Strawberry Tart",prep:"25 mins"},{rank:33,local:"Galette Bretonne",english:"Buckwheat Pancake",prep:"10 mins"},{rank:34,local:"Pissaladière",english:"Onion and Anchovy Tart",prep:"20 mins"},{rank:35,local:"Salade Lyonnaise",english:"Lyon Salad with Lardons",prep:"15 mins"},{rank:36,local:"Bisque de Homard",english:"Lobster Bisque",prep:"30 mins"},{rank:37,local:"Soupe de Poisson",english:"Fish Soup",prep:"25 mins"},{rank:38,local:"Aligot",english:"Mashed Potato with Cheese",prep:"20 mins"},{rank:39,local:"Flamiche",english:"Leek Tart",prep:"20 mins"},{rank:40,local:"Terrine de Campagne",english:"Country Pâté",prep:"30 mins"},{rank:41,local:"Daube Provençale",english:"Provençal Beef Stew",prep:"30 mins"},{rank:42,local:"Tapenade",english:"Olive Paste",prep:"10 mins"},{rank:43,local:"Brioche",english:"Enriched Bread",prep:"30 mins"},{rank:44,local:"Millefeuille",english:"Napoleon Pastry",prep:"30 mins"},{rank:45,local:"Pâté en Croûte",english:"Pâté in Pastry",prep:"40 mins"},{rank:46,local:"Ficelle Picarde",english:"Ham and Mushroom Crêpe",prep:"20 mins"},{rank:47,local:"Brandade de Morue",english:"Salt Cod Brandade",prep:"20 mins"},{rank:48,local:"Quenelles de Brochet",english:"Pike Dumplings",prep:"30 mins"},{rank:49,local:"Veau Marengo",english:"Veal Stew with Tomatoes",prep:"25 mins"},{rank:50,local:"Soupe au Pistou",english:"Vegetable Soup with Basil",prep:"25 mins"},
  ],
  IT:[
    {rank:1,local:"Pizza Margherita",english:"Margherita Pizza",prep:"20 mins"},{rank:2,local:"Pasta alla Carbonara",english:"Carbonara Pasta",prep:"10 mins"},{rank:3,local:"Risotto ai Funghi",english:"Mushroom Risotto",prep:"10 mins"},{rank:4,local:"Lasagne al Forno",english:"Baked Lasagne",prep:"30 mins"},{rank:5,local:"Tiramisù",english:"Tiramisu",prep:"20 mins"},{rank:6,local:"Bruschetta al Pomodoro",english:"Tomato Bruschetta",prep:"10 mins"},{rank:7,local:"Gnocchi al Pomodoro",english:"Potato Gnocchi in Tomato Sauce",prep:"20 mins"},{rank:8,local:"Osso Buco",english:"Braised Veal Shank",prep:"20 mins"},{rank:9,local:"Penne all'Arrabbiata",english:"Spicy Tomato Pasta",prep:"10 mins"},{rank:10,local:"Saltimbocca alla Romana",english:"Veal with Prosciutto",prep:"15 mins"},{rank:11,local:"Minestrone",english:"Vegetable Soup",prep:"20 mins"},{rank:12,local:"Spaghetti alle Vongole",english:"Spaghetti with Clams",prep:"15 mins"},{rank:13,local:"Arancini",english:"Stuffed Rice Balls",prep:"30 mins"},{rank:14,local:"Bistecca alla Fiorentina",english:"Florentine T-bone Steak",prep:"10 mins"},{rank:15,local:"Cacio e Pepe",english:"Cheese and Pepper Pasta",prep:"10 mins"},{rank:16,local:"Panna Cotta",english:"Cooked Cream Dessert",prep:"10 mins"},{rank:17,local:"Vitello Tonnato",english:"Veal with Tuna Sauce",prep:"20 mins"},{rank:18,local:"Ribollita",english:"Tuscan Bean Soup",prep:"20 mins"},{rank:19,local:"Insalata Caprese",english:"Tomato and Mozzarella Salad",prep:"10 mins"},{rank:20,local:"Tagliatelle al Ragù",english:"Tagliatelle Bolognese",prep:"15 mins"},{rank:21,local:"Spaghetti all'Amatriciana",english:"Pasta with Tomato and Guanciale",prep:"10 mins"},{rank:22,local:"Polenta e Funghi",english:"Polenta with Mushrooms",prep:"15 mins"},{rank:23,local:"Frittura di Paranza",english:"Fried Mixed Fish",prep:"15 mins"},{rank:24,local:"Cannoli",english:"Cannoli",prep:"20 mins"},{rank:25,local:"Torta Caprese",english:"Chocolate and Almond Cake",prep:"15 mins"},{rank:26,local:"Ravioli al Burro e Salvia",english:"Ravioli with Butter and Sage",prep:"20 mins"},{rank:27,local:"Porchetta",english:"Roast Pork",prep:"30 mins"},{rank:28,local:"Scaloppine al Limone",english:"Lemon Veal Escalope",prep:"10 mins"},{rank:29,local:"Caponata",english:"Sicilian Aubergine Stew",prep:"20 mins"},{rank:30,local:"Focaccia",english:"Focaccia Bread",prep:"20 mins"},{rank:31,local:"Polpette al Sugo",english:"Meatballs in Tomato Sauce",prep:"20 mins"},{rank:32,local:"Zuppa di Ceci",english:"Chickpea Soup",prep:"15 mins"},{rank:33,local:"Fritto Misto",english:"Mixed Fried Seafood",prep:"20 mins"},{rank:34,local:"Crostata di Marmellata",english:"Jam Tart",prep:"20 mins"},{rank:35,local:"Supplì",english:"Fried Rice Croquettes",prep:"25 mins"},{rank:36,local:"Peperonata",english:"Stewed Peppers",prep:"15 mins"},{rank:37,local:"Baccalà alla Livornese",english:"Salt Cod in Tomato Sauce",prep:"20 mins"},{rank:38,local:"Acqua Pazza",english:"Fish in Tomato Broth",prep:"15 mins"},{rank:39,local:"Torta della Nonna",english:"Grandmother's Cream Tart",prep:"30 mins"},{rank:40,local:"Coda alla Vaccinara",english:"Roman Oxtail Stew",prep:"30 mins"},{rank:41,local:"Stracciatella",english:"Egg Drop Soup",prep:"10 mins"},{rank:42,local:"Panzanella",english:"Tuscan Bread Salad",prep:"15 mins"},{rank:43,local:"Involtini di Melanzane",english:"Aubergine Rolls",prep:"20 mins"},{rank:44,local:"Pizzoccheri",english:"Buckwheat Pasta with Cabbage",prep:"20 mins"},{rank:45,local:"Bigne al Cioccolato",english:"Chocolate Cream Puffs",prep:"25 mins"},{rank:46,local:"Spiedini di Carne",english:"Meat Skewers",prep:"20 mins"},{rank:47,local:"Zeppole",english:"Fried Dough Balls",prep:"20 mins"},{rank:48,local:"Fagiolata",english:"Bean Stew",prep:"15 mins"},{rank:49,local:"Ciambotta",english:"Southern Italian Vegetable Stew",prep:"20 mins"},{rank:50,local:"Pappardelle al Cinghiale",english:"Pasta with Wild Boar",prep:"20 mins"},
  ],
  DE:[
    {rank:1,local:"Schnitzel",english:"Breaded Pork Cutlet",prep:"15 mins"},{rank:2,local:"Bratwurst",english:"Grilled Sausage",prep:"10 mins"},{rank:3,local:"Currywurst",english:"Curried Sausage",prep:"10 mins"},{rank:4,local:"Kartoffelsuppe",english:"Potato Soup",prep:"20 mins"},{rank:5,local:"Sauerbraten",english:"Pot-Roasted Beef",prep:"30 mins"},{rank:6,local:"Rouladen",english:"Rolled Beef",prep:"30 mins"},{rank:7,local:"Käsespätzle",english:"Cheese Noodles",prep:"20 mins"},{rank:8,local:"Brezel",english:"Pretzel",prep:"5 mins"},{rank:9,local:"Schweinsbraten",english:"Roast Pork",prep:"20 mins"},{rank:10,local:"Eisbein",english:"Pork Knuckle",prep:"20 mins"},{rank:11,local:"Kartoffelsalat",english:"Potato Salad",prep:"20 mins"},{rank:12,local:"Sauerkraut",english:"Fermented Cabbage",prep:"5 mins"},{rank:13,local:"Erbsensuppe",english:"Pea Soup",prep:"15 mins"},{rank:14,local:"Schwarzwälder Kirschtorte",english:"Black Forest Cake",prep:"30 mins"},{rank:15,local:"Rindergulasch",english:"Beef Goulash",prep:"20 mins"},{rank:16,local:"Flammkuchen",english:"Alsatian Tart",prep:"15 mins"},{rank:17,local:"Maultaschen",english:"Swabian Filled Pasta",prep:"20 mins"},{rank:18,local:"Königsberger Klopse",english:"Meatballs in Caper Sauce",prep:"20 mins"},{rank:19,local:"Kartoffelknödel",english:"Potato Dumplings",prep:"25 mins"},{rank:20,local:"Apfelstrudel",english:"Apple Strudel",prep:"30 mins"},{rank:21,local:"Grünkohl mit Pinkel",english:"Kale with Smoked Sausage",prep:"20 mins"},{rank:22,local:"Reibekuchen",english:"Potato Pancakes",prep:"20 mins"},{rank:23,local:"Rinderbraten",english:"Pot Roast Beef",prep:"20 mins"},{rank:24,local:"Hühnerfrikassee",english:"Chicken Fricassee",prep:"20 mins"},{rank:25,local:"Leberknödelsuppe",english:"Liver Dumpling Soup",prep:"20 mins"},{rank:26,local:"Leberkäse",english:"Meat Loaf",prep:"10 mins"},{rank:27,local:"Matjeshering",english:"Young Herring Salad",prep:"15 mins"},{rank:28,local:"Strammer Max",english:"Ham and Egg on Bread",prep:"10 mins"},{rank:29,local:"Dampfnudeln",english:"Steamed Sweet Dumplings",prep:"25 mins"},{rank:30,local:"Graupensuppe",english:"Barley Soup",prep:"20 mins"},{rank:31,local:"Zwiebelrostbraten",english:"Beef with Onions",prep:"20 mins"},{rank:32,local:"Rahmschnitzel",english:"Schnitzel in Cream Sauce",prep:"15 mins"},{rank:33,local:"Geschnetzeltes",english:"Sliced Meat in Cream Sauce",prep:"15 mins"},{rank:34,local:"Pflaumenkuchen",english:"Plum Cake",prep:"20 mins"},{rank:35,local:"Pichelsteiner Eintopf",english:"Mixed Meat Stew",prep:"25 mins"},{rank:36,local:"Scholle Finkenwerder",english:"Pan-Fried Plaice",prep:"15 mins"},{rank:37,local:"Falscher Hase",english:"Meatloaf",prep:"20 mins"},{rank:38,local:"Wurstsalat",english:"Sausage Salad",prep:"15 mins"},{rank:39,local:"Linsensuppe",english:"Lentil Soup",prep:"15 mins"},{rank:40,local:"Milchreis",english:"Rice Pudding",prep:"15 mins"},{rank:41,local:"Bienenstich",english:"Bee Sting Cake",prep:"30 mins"},{rank:42,local:"Quarkkuchen",english:"Quark Cheesecake",prep:"25 mins"},{rank:43,local:"Senfeier",english:"Eggs in Mustard Sauce",prep:"15 mins"},{rank:44,local:"Grießbrei",english:"Semolina Pudding",prep:"10 mins"},{rank:45,local:"Labskaus",english:"Corned Beef Hash",prep:"25 mins"},{rank:46,local:"Stollen",english:"German Fruit Bread",prep:"30 mins"},{rank:47,local:"Soleier",english:"Pickled Eggs",prep:"10 mins"},{rank:48,local:"Krautsalat",english:"Coleslaw",prep:"15 mins"},{rank:49,local:"Broiler",english:"Roast Chicken",prep:"15 mins"},{rank:50,local:"Bouillon mit Einlage",english:"Broth with Garnish",prep:"10 mins"},
  ],
  ES:[
    {rank:1,local:"Paella Valenciana",english:"Valencian Paella",prep:"20 mins"},{rank:2,local:"Tortilla Española",english:"Spanish Omelette",prep:"15 mins"},{rank:3,local:"Gazpacho",english:"Cold Tomato Soup",prep:"15 mins"},{rank:4,local:"Croquetas",english:"Croquettes",prep:"25 mins"},{rank:5,local:"Patatas Bravas",english:"Spicy Potatoes",prep:"15 mins"},{rank:6,local:"Gambas al Ajillo",english:"Garlic Prawns",prep:"10 mins"},{rank:7,local:"Jamón Ibérico",english:"Iberian Cured Ham",prep:"5 mins"},{rank:8,local:"Pulpo a la Gallega",english:"Galician Octopus",prep:"20 mins"},{rank:9,local:"Churros",english:"Fried Dough Sticks",prep:"20 mins"},{rank:10,local:"Salmorejo",english:"Thick Cold Tomato Soup",prep:"10 mins"},{rank:11,local:"Cocido Madrileño",english:"Madrid Chickpea Stew",prep:"30 mins"},{rank:12,local:"Albóndigas",english:"Meatballs",prep:"20 mins"},{rank:13,local:"Fabada Asturiana",english:"Asturian Bean Stew",prep:"20 mins"},{rank:14,local:"Pan con Tomate",english:"Bread Rubbed with Tomato",prep:"5 mins"},{rank:15,local:"Pisto",english:"Spanish Ratatouille",prep:"20 mins"},{rank:16,local:"Lentejas",english:"Lentil Stew",prep:"15 mins"},{rank:17,local:"Cazuela de Mariscos",english:"Seafood Casserole",prep:"20 mins"},{rank:18,local:"Fideuà",english:"Noodle Paella",prep:"20 mins"},{rank:19,local:"Pollo al Ajillo",english:"Garlic Chicken",prep:"15 mins"},{rank:20,local:"Pimientos de Padrón",english:"Padron Peppers",prep:"10 mins"},{rank:21,local:"Caldo Gallego",english:"Galician Broth",prep:"20 mins"},{rank:22,local:"Berenjenas con Miel",english:"Aubergine with Honey",prep:"15 mins"},{rank:23,local:"Rabo de Toro",english:"Oxtail Stew",prep:"30 mins"},{rank:24,local:"Arroz con Leche",english:"Rice Pudding",prep:"10 mins"},{rank:25,local:"Crema Catalana",english:"Catalan Cream",prep:"20 mins"},{rank:26,local:"Ensaladilla Rusa",english:"Russian Salad",prep:"20 mins"},{rank:27,local:"Bacalao a la Vizcaína",english:"Basque Salt Cod",prep:"20 mins"},{rank:28,local:"Tarta de Santiago",english:"Almond Tart",prep:"20 mins"},{rank:29,local:"Huevos Rotos",english:"Broken Eggs with Chips",prep:"15 mins"},{rank:30,local:"Migas",english:"Fried Breadcrumbs",prep:"15 mins"},{rank:31,local:"Escalivada",english:"Grilled Vegetables",prep:"15 mins"},{rank:32,local:"Suquet de Peix",english:"Catalan Fish Stew",prep:"25 mins"},{rank:33,local:"Boquerones en Vinagre",english:"Marinated Anchovies",prep:"10 mins"},{rank:34,local:"Garbanzos con Espinacas",english:"Chickpeas with Spinach",prep:"15 mins"},{rank:35,local:"Arroz Negro",english:"Black Rice",prep:"25 mins"},{rank:36,local:"Leche Frita",english:"Fried Milk Dessert",prep:"20 mins"},{rank:37,local:"Natillas",english:"Spanish Custard",prep:"15 mins"},{rank:38,local:"Buñuelos",english:"Fritters",prep:"20 mins"},{rank:39,local:"Calçots",english:"Grilled Spring Onions",prep:"15 mins"},{rank:40,local:"Menestra de Verduras",english:"Vegetable Medley",prep:"20 mins"},{rank:41,local:"Caldereta de Cordero",english:"Lamb Stew",prep:"25 mins"},{rank:42,local:"Pipirrana",english:"Andalusian Salad",prep:"15 mins"},{rank:43,local:"Caldo de Pollo",english:"Chicken Broth",prep:"15 mins"},{rank:44,local:"Puchero",english:"Southern Stew",prep:"25 mins"},{rank:45,local:"Riñones al Jerez",english:"Kidneys in Sherry",prep:"15 mins"},{rank:46,local:"Soldaditos de Pavía",english:"Battered Salt Cod",prep:"20 mins"},{rank:47,local:"Perdiz Estofada",english:"Braised Partridge",prep:"25 mins"},{rank:48,local:"Brazo de Gitano",english:"Swiss Roll",prep:"25 mins"},{rank:49,local:"Cabrito Asado",english:"Roast Kid",prep:"20 mins"},{rank:50,local:"Tripa a la Madrileña",english:"Madrid-style Tripe",prep:"25 mins"},
  ],
  CN:[
    {rank:1,local:"北京烤鸭",english:"Peking Duck",prep:"30 mins"},{rank:2,local:"宫保鸡丁",english:"Kung Pao Chicken",prep:"20 mins"},{rank:3,local:"麻婆豆腐",english:"Mapo Tofu",prep:"15 mins"},{rank:4,local:"叉烧",english:"Char Siu Pork",prep:"20 mins"},{rank:5,local:"饺子",english:"Dumplings",prep:"30 mins"},{rank:6,local:"炒饭",english:"Fried Rice",prep:"15 mins"},{rank:7,local:"点心",english:"Dim Sum",prep:"30 mins"},{rank:8,local:"炒面",english:"Chow Mein",prep:"15 mins"},{rank:9,local:"红烧肉",english:"Red Braised Pork Belly",prep:"20 mins"},{rank:10,local:"糖醋里脊",english:"Sweet and Sour Pork",prep:"20 mins"},{rank:11,local:"火锅",english:"Hot Pot",prep:"20 mins"},{rank:12,local:"包子",english:"Steamed Buns",prep:"30 mins"},{rank:13,local:"鱼香肉丝",english:"Fish-Fragrant Shredded Pork",prep:"20 mins"},{rank:14,local:"酸辣汤",english:"Hot and Sour Soup",prep:"15 mins"},{rank:15,local:"小笼包",english:"Soup Dumplings",prep:"30 mins"},{rank:16,local:"回锅肉",english:"Twice-cooked Pork",prep:"20 mins"},{rank:17,local:"烤羊肉串",english:"Lamb Skewers",prep:"20 mins"},{rank:18,local:"东坡肉",english:"Dongpo Pork",prep:"30 mins"},{rank:19,local:"水煮鱼",english:"Boiled Fish in Chilli Broth",prep:"25 mins"},{rank:20,local:"干煸四季豆",english:"Dry-Fried Green Beans",prep:"15 mins"},{rank:21,local:"葱油饼",english:"Scallion Pancake",prep:"20 mins"},{rank:22,local:"清蒸鱼",english:"Steamed Fish",prep:"15 mins"},{rank:23,local:"蛋炒饭",english:"Egg Fried Rice",prep:"10 mins"},{rank:24,local:"油泼面",english:"Noodles with Chilli Oil",prep:"20 mins"},{rank:25,local:"白斩鸡",english:"Poached Chicken",prep:"20 mins"},{rank:26,local:"三杯鸡",english:"Three Cup Chicken",prep:"20 mins"},{rank:27,local:"拍黄瓜",english:"Smashed Cucumber Salad",prep:"10 mins"},{rank:28,local:"担担面",english:"Dan Dan Noodles",prep:"20 mins"},{rank:29,local:"夫妻肺片",english:"Sliced Beef in Chilli Sauce",prep:"20 mins"},{rank:30,local:"虾饺",english:"Har Gow Prawn Dumplings",prep:"30 mins"},{rank:31,local:"口水鸡",english:"Saliva Chicken",prep:"20 mins"},{rank:32,local:"春卷",english:"Spring Rolls",prep:"25 mins"},{rank:33,local:"糯米鸡",english:"Sticky Rice Chicken in Lotus Leaf",prep:"30 mins"},{rank:34,local:"腊肠炒饭",english:"Lap Cheong Fried Rice",prep:"15 mins"},{rank:35,local:"粉丝汤",english:"Glass Noodle Soup",prep:"15 mins"},{rank:36,local:"蚝油生菜",english:"Oyster Sauce Lettuce",prep:"10 mins"},{rank:37,local:"佛跳墙",english:"Buddha Jumps Over the Wall",prep:"40 mins"},{rank:38,local:"烧麦",english:"Siu Mai",prep:"25 mins"},{rank:39,local:"萝卜糕",english:"Turnip Cake",prep:"30 mins"},{rank:40,local:"糖葫芦",english:"Candied Hawthorn",prep:"15 mins"},{rank:41,local:"汤圆",english:"Glutinous Rice Balls",prep:"20 mins"},{rank:42,local:"凉皮",english:"Cold Skin Noodles",prep:"20 mins"},{rank:43,local:"豆腐脑",english:"Tofu Pudding",prep:"20 mins"},{rank:44,local:"粢饭团",english:"Rice Ball",prep:"15 mins"},{rank:45,local:"酱牛肉",english:"Soy Braised Beef",prep:"25 mins"},{rank:46,local:"冰糖银耳",english:"Snow Fungus Dessert Soup",prep:"20 mins"},{rank:47,local:"豆沙包",english:"Red Bean Bun",prep:"30 mins"},{rank:48,local:"东北乱炖",english:"Northeast Mixed Stew",prep:"25 mins"},{rank:49,local:"龙井虾仁",english:"Shrimp with Dragon Well Tea",prep:"20 mins"},{rank:50,local:"芋泥",english:"Taro Paste",prep:"20 mins"},
  ],
  BR:[
    {rank:1,local:"Feijoada",english:"Black Bean and Pork Stew",prep:"30 mins"},{rank:2,local:"Churrasco",english:"Brazilian BBQ",prep:"20 mins"},{rank:3,local:"Pão de Queijo",english:"Cheese Bread",prep:"15 mins"},{rank:4,local:"Coxinha",english:"Chicken Croquette",prep:"30 mins"},{rank:5,local:"Moqueca",english:"Brazilian Fish Stew",prep:"25 mins"},{rank:6,local:"Brigadeiro",english:"Chocolate Truffle",prep:"15 mins"},{rank:7,local:"Picanha",english:"Sirloin Cap Steak",prep:"15 mins"},{rank:8,local:"Arroz e Feijão",english:"Rice and Beans",prep:"20 mins"},{rank:9,local:"Pastel",english:"Deep-Fried Pastry",prep:"25 mins"},{rank:10,local:"Vatapá",english:"Spiced Seafood Paste",prep:"30 mins"},{rank:11,local:"Acarajé",english:"Black-eyed Pea Fritter",prep:"30 mins"},{rank:12,local:"Tapioca",english:"Tapioca Pancake",prep:"10 mins"},{rank:13,local:"Bolinho de Bacalhau",english:"Salt Cod Fritters",prep:"25 mins"},{rank:14,local:"Frango Assado",english:"Roast Chicken",prep:"20 mins"},{rank:15,local:"Quibe",english:"Kibbe",prep:"25 mins"},{rank:16,local:"Farofa",english:"Toasted Cassava Flour",prep:"10 mins"},{rank:17,local:"Escondidinho",english:"Meat and Cassava Pie",prep:"25 mins"},{rank:18,local:"Canjica",english:"White Corn Pudding",prep:"20 mins"},{rank:19,local:"Frango à Parmegiana",english:"Chicken Parmesan",prep:"25 mins"},{rank:20,local:"Pudim de Leite",english:"Milk Caramel Flan",prep:"20 mins"},{rank:21,local:"Xinxim de Galinha",english:"Chicken in Peanut Sauce",prep:"25 mins"},{rank:22,local:"Tutu de Feijão",english:"Bean Purée",prep:"20 mins"},{rank:23,local:"Empadão",english:"Chicken Pie",prep:"30 mins"},{rank:24,local:"Bolo de Cenoura",english:"Carrot Cake",prep:"20 mins"},{rank:25,local:"Virado à Paulista",english:"São Paulo Bean Dish",prep:"25 mins"},{rank:26,local:"Dobradinha",english:"Tripe Stew",prep:"30 mins"},{rank:27,local:"Caldeirada",english:"Fish Stew",prep:"25 mins"},{rank:28,local:"Rabada",english:"Oxtail Stew",prep:"30 mins"},{rank:29,local:"Romeu e Julieta",english:"Cheese and Guava Paste",prep:"5 mins"},{rank:30,local:"Pamonha",english:"Corn Tamale",prep:"30 mins"},{rank:31,local:"Salpicão",english:"Chicken Salad",prep:"20 mins"},{rank:32,local:"Bolo de Milho",english:"Corn Cake",prep:"20 mins"},{rank:33,local:"Macarrão ao Sugo",english:"Pasta in Tomato Sauce",prep:"15 mins"},{rank:34,local:"Linguiça Acebolada",english:"Sausage with Onions",prep:"15 mins"},{rank:35,local:"Cocada",english:"Coconut Candy",prep:"20 mins"},{rank:36,local:"Queijo Coalho Grelhado",english:"Grilled Cheese",prep:"10 mins"},{rank:37,local:"Caldo Verde",english:"Green Soup",prep:"15 mins"},{rank:38,local:"Moqueca de Camarão",english:"Prawn Moqueca",prep:"25 mins"},{rank:39,local:"Arroz com Leite",english:"Rice Pudding",prep:"15 mins"},{rank:40,local:"Torta de Frango",english:"Chicken Tart",prep:"30 mins"},{rank:41,local:"Bolo Queijadinha",english:"Coconut Cheese Cake",prep:"20 mins"},{rank:42,local:"Cuscuz Nordestino",english:"Northeast Couscous",prep:"15 mins"},{rank:43,local:"Fritada de Camarão",english:"Prawn Omelette",prep:"20 mins"},{rank:44,local:"Sorvete de Açaí",english:"Açaí Ice Cream",prep:"10 mins"},{rank:45,local:"Peixe Assado",english:"Baked Fish",prep:"15 mins"},{rank:46,local:"Vatapá de Galinha",english:"Chicken in Spiced Sauce",prep:"25 mins"},{rank:47,local:"Caldo de Mocotó",english:"Cow Foot Broth",prep:"30 mins"},{rank:48,local:"Bolo de Rolo",english:"Roll Cake",prep:"30 mins"},{rank:49,local:"Peito de Peru",english:"Turkey Breast",prep:"25 mins"},{rank:50,local:"Sopa de Feijão",english:"Bean Soup",prep:"20 mins"},
  ],
  NG:[
    {rank:1,local:"Jollof Rice",english:"Jollof Rice",prep:"20 mins"},{rank:2,local:"Egusi Soup",english:"Melon Seed Soup",prep:"30 mins"},{rank:3,local:"Pounded Yam",english:"Pounded Yam",prep:"20 mins"},{rank:4,local:"Suya",english:"Spiced Grilled Meat",prep:"20 mins"},{rank:5,local:"Fried Rice",english:"Nigerian Fried Rice",prep:"20 mins"},{rank:6,local:"Pepper Soup",english:"Spiced Meat Broth",prep:"25 mins"},{rank:7,local:"Okra Soup",english:"Okra Soup",prep:"25 mins"},{rank:8,local:"Moin Moin",english:"Steamed Bean Pudding",prep:"25 mins"},{rank:9,local:"Akara",english:"Bean Fritters",prep:"20 mins"},{rank:10,local:"Afang Soup",english:"Afang Leaf Soup",prep:"30 mins"},{rank:11,local:"Edikang Ikong",english:"Vegetable Soup",prep:"30 mins"},{rank:12,local:"Banga Soup",english:"Palm Fruit Soup",prep:"30 mins"},{rank:13,local:"Ogbono Soup",english:"Wild Mango Seed Soup",prep:"25 mins"},{rank:14,local:"Efo Riro",english:"Stewed Spinach",prep:"25 mins"},{rank:15,local:"Ofe Onugbu",english:"Bitter Leaf Soup",prep:"30 mins"},{rank:16,local:"Nkwobi",english:"Spiced Cow Foot",prep:"30 mins"},{rank:17,local:"Isi Ewu",english:"Spiced Goat Head",prep:"35 mins"},{rank:18,local:"Dodo",english:"Fried Sweet Plantain",prep:"10 mins"},{rank:19,local:"Puff Puff",english:"Fried Dough Balls",prep:"20 mins"},{rank:20,local:"Bole",english:"Roasted Plantain",prep:"15 mins"},{rank:21,local:"Eba",english:"Cassava Swallow",prep:"10 mins"},{rank:22,local:"Groundnut Soup",english:"Peanut Soup",prep:"30 mins"},{rank:23,local:"Ewedu Soup",english:"Jute Leaf Soup",prep:"20 mins"},{rank:24,local:"Ayamase",english:"Green Pepper Stew",prep:"25 mins"},{rank:25,local:"Oha Soup",english:"Oha Leaf Soup",prep:"30 mins"},{rank:26,local:"Tuwo Shinkafa",english:"Rice Pudding Swallow",prep:"20 mins"},{rank:27,local:"Miyan Kuka",english:"Baobab Leaf Soup",prep:"25 mins"},{rank:28,local:"Kilishi",english:"Dried Spiced Meat",prep:"30 mins"},{rank:29,local:"Ofada Rice",english:"Local Brown Rice",prep:"25 mins"},{rank:30,local:"Stewed Chicken",english:"Nigerian Stewed Chicken",prep:"25 mins"},{rank:31,local:"Asun",english:"Spicy Smoked Goat",prep:"25 mins"},{rank:32,local:"Chin Chin",english:"Fried Pastry Snack",prep:"25 mins"},{rank:33,local:"Yam Porridge",english:"Asaro Yam Porridge",prep:"25 mins"},{rank:34,local:"Coconut Rice",english:"Coconut Rice",prep:"20 mins"},{rank:35,local:"Miyan Taushe",english:"Pumpkin Soup",prep:"25 mins"},{rank:36,local:"Ekpang Nkukwo",english:"Cocoyam Porridge",prep:"30 mins"},{rank:37,local:"Fish Stew",english:"Nigerian Fish Stew",prep:"20 mins"},{rank:38,local:"Dan Wake",english:"Bean Flour Dumplings",prep:"20 mins"},{rank:39,local:"Masa",english:"Rice Cake",prep:"20 mins"},{rank:40,local:"Fura da Nono",english:"Millet Ball with Yoghurt",prep:"20 mins"},{rank:41,local:"Fried Plantain",english:"Fried Plantain",prep:"10 mins"},{rank:42,local:"Scotch Egg",english:"Nigerian Scotch Egg",prep:"25 mins"},{rank:43,local:"Nigerian Salad",english:"Nigerian Party Salad",prep:"20 mins"},{rank:44,local:"Baked Beans",english:"Nigerian Baked Beans",prep:"20 mins"},{rank:45,local:"Abak Atama",english:"Palm Nut Soup",prep:"30 mins"},{rank:46,local:"Nkanghi",english:"Banga Spice Soup",prep:"25 mins"},{rank:47,local:"Owo Soup",english:"Palm Nut and Fish Soup",prep:"30 mins"},{rank:48,local:"Zobo Drink",english:"Hibiscus Drink",prep:"15 mins"},{rank:49,local:"Miyan Kubewa",english:"Okra Soup Northern Style",prep:"25 mins"},{rank:50,local:"Abula Soup",english:"Mixed Soup",prep:"30 mins"},
  ],
  TH:[
    {rank:1,local:"ผัดไทย",english:"Pad Thai",prep:"15 mins"},{rank:2,local:"แกงเขียวหวาน",english:"Green Curry",prep:"20 mins"},{rank:3,local:"ต้มยำกุ้ง",english:"Tom Yum Soup",prep:"20 mins"},{rank:4,local:"ข้าวผัด",english:"Thai Fried Rice",prep:"15 mins"},{rank:5,local:"ส้มตำ",english:"Papaya Salad",prep:"10 mins"},{rank:6,local:"แกงมัสมั่น",english:"Massaman Curry",prep:"25 mins"},{rank:7,local:"ข้าวมันไก่",english:"Hainanese Chicken Rice",prep:"20 mins"},{rank:8,local:"ต้มข่าไก่",english:"Coconut Chicken Soup",prep:"20 mins"},{rank:9,local:"ผัดกะเพรา",english:"Basil Stir-fry",prep:"10 mins"},{rank:10,local:"แกงแดง",english:"Red Curry",prep:"20 mins"},{rank:11,local:"ยำวุ้นเส้น",english:"Glass Noodle Salad",prep:"15 mins"},{rank:12,local:"ข้าวเหนียวมะม่วง",english:"Mango Sticky Rice",prep:"20 mins"},{rank:13,local:"ผัดซีอิ๊ว",english:"Pad See Ew",prep:"15 mins"},{rank:14,local:"สะเต๊ะ",english:"Satay",prep:"20 mins"},{rank:15,local:"ข้าวหมูแดง",english:"Red Pork with Rice",prep:"15 mins"},{rank:16,local:"หอยทอด",english:"Oyster Omelette",prep:"15 mins"},{rank:17,local:"ปอเปี๊ยะ",english:"Spring Rolls",prep:"25 mins"},{rank:18,local:"แกงป่า",english:"Jungle Curry",prep:"20 mins"},{rank:19,local:"ยำทะเล",english:"Seafood Salad",prep:"15 mins"},{rank:20,local:"ราดหน้า",english:"Gravy Noodles",prep:"15 mins"},{rank:21,local:"ไก่ทอด",english:"Thai Fried Chicken",prep:"20 mins"},{rank:22,local:"ลาบหมู",english:"Minced Pork Salad",prep:"15 mins"},{rank:23,local:"ข้าวต้ม",english:"Rice Congee",prep:"20 mins"},{rank:24,local:"ผักบุ้งไฟแดง",english:"Morning Glory Stir-fry",prep:"10 mins"},{rank:25,local:"ข้าวซอย",english:"Khao Soi Noodle Curry",prep:"25 mins"},{rank:26,local:"กระเพราหมูสับไข่ดาว",english:"Basil Pork with Fried Egg",prep:"10 mins"},{rank:27,local:"ทอดมันปลา",english:"Fish Cake",prep:"20 mins"},{rank:28,local:"หมูกรอบ",english:"Crispy Pork",prep:"20 mins"},{rank:29,local:"ยำเนื้อ",english:"Beef Salad",prep:"15 mins"},{rank:30,local:"ไก่ย่าง",english:"Grilled Chicken",prep:"20 mins"},{rank:31,local:"หมูปิ้ง",english:"Grilled Pork Skewers",prep:"20 mins"},{rank:32,local:"แกงกะหรี่",english:"Thai Yellow Curry",prep:"20 mins"},{rank:33,local:"ต้มยำทะเล",english:"Seafood Tom Yum",prep:"20 mins"},{rank:34,local:"ขนมจีน",english:"Thai Rice Noodles",prep:"20 mins"},{rank:35,local:"ปลาสามรส",english:"Three-Flavour Fish",prep:"20 mins"},{rank:36,local:"น้ำตกหมู",english:"Waterfall Pork Salad",prep:"20 mins"},{rank:37,local:"กุ้งอบวุ้นเส้น",english:"Baked Prawns with Glass Noodles",prep:"20 mins"},{rank:38,local:"บัวลอย",english:"Floating Lotus Dessert",prep:"20 mins"},{rank:39,local:"สังขยา",english:"Thai Custard",prep:"20 mins"},{rank:40,local:"ข้าวเหนียวสังขยา",english:"Sticky Rice with Custard",prep:"20 mins"},{rank:41,local:"วุ้นกะทิ",english:"Coconut Jelly",prep:"15 mins"},{rank:42,local:"ทับทิมกรอบ",english:"Ruby Water Chestnut Dessert",prep:"15 mins"},{rank:43,local:"ลอดช่อง",english:"Pandan Jelly Dessert",prep:"20 mins"},{rank:44,local:"ไข่พะโล้",english:"Five-Spice Braised Eggs",prep:"20 mins"},{rank:45,local:"เฉาก๊วยนมสด",english:"Grass Jelly with Milk",prep:"10 mins"},{rank:46,local:"ผัดเผ็ดหมู",english:"Spicy Stir-fried Pork",prep:"15 mins"},{rank:47,local:"ข้าวผัดกะเพรา",english:"Basil Fried Rice",prep:"15 mins"},{rank:48,local:"ปลาทอด",english:"Fried Fish",prep:"15 mins"},{rank:49,local:"แกงเลียง",english:"Spicy Vegetable Soup",prep:"20 mins"},{rank:50,local:"หมูสะเต๊ะ",english:"Pork Satay",prep:"20 mins"},
  ],
  PL:[
    {rank:1,local:"Pierogi",english:"Stuffed Dumplings",prep:"30 mins"},{rank:2,local:"Bigos",english:"Hunter's Stew",prep:"30 mins"},{rank:3,local:"Barszcz",english:"Beetroot Soup",prep:"20 mins"},{rank:4,local:"Kotlet Schabowy",english:"Breaded Pork Cutlet",prep:"15 mins"},{rank:5,local:"Żurek",english:"Sour Rye Soup",prep:"20 mins"},{rank:6,local:"Gołąbki",english:"Stuffed Cabbage Rolls",prep:"30 mins"},{rank:7,local:"Kiełbasa",english:"Polish Sausage",prep:"10 mins"},{rank:8,local:"Rosół",english:"Chicken Broth",prep:"20 mins"},{rank:9,local:"Flaki",english:"Tripe Soup",prep:"30 mins"},{rank:10,local:"Kapuśniak",english:"Sauerkraut Soup",prep:"20 mins"},{rank:11,local:"Zrazy",english:"Beef Rolls",prep:"25 mins"},{rank:12,local:"Krokiety",english:"Polish Croquettes",prep:"25 mins"},{rank:13,local:"Kopytka",english:"Potato Dumplings",prep:"25 mins"},{rank:14,local:"Placki Ziemniaczane",english:"Potato Pancakes",prep:"20 mins"},{rank:15,local:"Zupa Grzybowa",english:"Mushroom Soup",prep:"20 mins"},{rank:16,local:"Biała Kiełbasa",english:"White Sausage",prep:"15 mins"},{rank:17,local:"Kaczka Pieczona",english:"Roast Duck",prep:"20 mins"},{rank:18,local:"Ogórkowa",english:"Dill Pickle Soup",prep:"20 mins"},{rank:19,local:"Naleśniki",english:"Crepes",prep:"15 mins"},{rank:20,local:"Łazanki",english:"Cabbage and Pasta",prep:"20 mins"},{rank:21,local:"Kluski Śląskie",english:"Silesian Dumplings",prep:"25 mins"},{rank:22,local:"Śledź w Śmietanie",english:"Herring in Cream",prep:"15 mins"},{rank:23,local:"Makowiec",english:"Poppy Seed Roll",prep:"40 mins"},{rank:24,local:"Sernik",english:"Polish Cheesecake",prep:"25 mins"},{rank:25,local:"Paczki",english:"Polish Doughnuts",prep:"30 mins"},{rank:26,local:"Fasolka po Bretońsku",english:"Bretonian Beans",prep:"20 mins"},{rank:27,local:"Pasztet",english:"Pâté",prep:"30 mins"},{rank:28,local:"Mizeria",english:"Cucumber Salad",prep:"10 mins"},{rank:29,local:"Grochówka",english:"Pea Soup",prep:"20 mins"},{rank:30,local:"Zupa Pomidorowa",english:"Tomato Soup",prep:"15 mins"},{rank:31,local:"Gulasz",english:"Goulash",prep:"25 mins"},{rank:32,local:"Żeberka",english:"Spare Ribs",prep:"20 mins"},{rank:33,local:"Karp Smażony",english:"Fried Carp",prep:"20 mins"},{rank:34,local:"Linsensuppe",english:"Lentil Soup",prep:"15 mins"},{rank:35,local:"Babka",english:"Easter Cake",prep:"30 mins"},{rank:36,local:"Czernina",english:"Duck Blood Soup",prep:"30 mins"},{rank:37,local:"Twaróg ze Szczypiorkiem",english:"Cottage Cheese with Chives",prep:"5 mins"},{rank:38,local:"Rolada Śląska",english:"Silesian Beef Roll",prep:"25 mins"},{rank:39,local:"Krupnik",english:"Barley Soup",prep:"20 mins"},{rank:40,local:"Pyzy",english:"Potato Dumplings",prep:"25 mins"},{rank:41,local:"Uszka",english:"Small Dumplings in Broth",prep:"30 mins"},{rank:42,local:"Piernik",english:"Gingerbread",prep:"25 mins"},{rank:43,local:"Szarlotka",english:"Apple Cake",prep:"25 mins"},{rank:44,local:"Kartacze",english:"Potato Cakes",prep:"30 mins"},{rank:45,local:"Maczanka",english:"Cracow Pulled Pork Roll",prep:"25 mins"},{rank:46,local:"Sztuka Mięsa",english:"Boiled Beef",prep:"25 mins"},{rank:47,local:"Kluski z Makiem",english:"Noodles with Poppy Seeds",prep:"15 mins"},{rank:48,local:"Smalec",english:"Lard Spread",prep:"5 mins"},{rank:49,local:"Baba Wielkanocna",english:"Easter Babka",prep:"35 mins"},{rank:50,local:"Kompot",english:"Stewed Fruit Drink",prep:"15 mins"},
  ],
  VN:[
    {rank:1,local:"Phở",english:"Vietnamese Noodle Soup",prep:"20 mins"},{rank:2,local:"Bánh Mì",english:"Vietnamese Baguette",prep:"10 mins"},{rank:3,local:"Cơm Tấm",english:"Broken Rice",prep:"20 mins"},{rank:4,local:"Bún Bò Huế",english:"Hue Beef Noodle Soup",prep:"25 mins"},{rank:5,local:"Gỏi Cuốn",english:"Fresh Spring Rolls",prep:"20 mins"},{rank:6,local:"Bánh Xèo",english:"Sizzling Rice Pancake",prep:"20 mins"},{rank:7,local:"Chả Giò",english:"Fried Spring Rolls",prep:"25 mins"},{rank:8,local:"Bún Chả",english:"Grilled Pork with Noodles",prep:"20 mins"},{rank:9,local:"Cao Lầu",english:"Hoi An Noodles",prep:"20 mins"},{rank:10,local:"Cháo",english:"Rice Porridge",prep:"15 mins"},{rank:11,local:"Bún Thịt Nướng",english:"Grilled Pork Noodle Bowl",prep:"20 mins"},{rank:12,local:"Mì Quảng",english:"Quang Noodles",prep:"25 mins"},{rank:13,local:"Bánh Cuốn",english:"Steamed Rice Rolls",prep:"25 mins"},{rank:14,local:"Bò Lúc Lắc",english:"Shaking Beef",prep:"15 mins"},{rank:15,local:"Lẩu",english:"Vietnamese Hot Pot",prep:"25 mins"},{rank:16,local:"Cá Kho Tộ",english:"Braised Fish in Clay Pot",prep:"20 mins"},{rank:17,local:"Nem Lụi",english:"Lemongrass Pork Skewers",prep:"20 mins"},{rank:18,local:"Xôi",english:"Sticky Rice",prep:"20 mins"},{rank:19,local:"Cơm Gà Hội An",english:"Hoi An Chicken Rice",prep:"20 mins"},{rank:20,local:"Hủ Tiếu",english:"Southern Clear Noodle Soup",prep:"20 mins"},{rank:21,local:"Thịt Kho Tàu",english:"Pork and Egg in Caramel Sauce",prep:"20 mins"},{rank:22,local:"Tôm Rim",english:"Caramelised Prawns",prep:"15 mins"},{rank:23,local:"Bún Riêu",english:"Crab Noodle Soup",prep:"25 mins"},{rank:24,local:"Bánh Khọt",english:"Mini Savoury Pancakes",prep:"20 mins"},{rank:25,local:"Chè",english:"Sweet Soup Dessert",prep:"20 mins"},{rank:26,local:"Gà Nướng Sả",english:"Lemongrass Grilled Chicken",prep:"20 mins"},{rank:27,local:"Bánh Tráng Nướng",english:"Grilled Rice Paper",prep:"10 mins"},{rank:28,local:"Vịt Quay",english:"Roast Duck",prep:"25 mins"},{rank:29,local:"Mực Chiên Giòn",english:"Crispy Fried Squid",prep:"15 mins"},{rank:30,local:"Bánh Flan",english:"Caramel Flan",prep:"20 mins"},{rank:31,local:"Gỏi Đu Đủ",english:"Green Papaya Salad",prep:"15 mins"},{rank:32,local:"Mì Hoành Thánh",english:"Wonton Noodle Soup",prep:"20 mins"},{rank:33,local:"Sườn Nướng",english:"Grilled Ribs",prep:"20 mins"},{rank:34,local:"Bánh Canh",english:"Thick Noodle Soup",prep:"20 mins"},{rank:35,local:"Cơm Niêu",english:"Clay Pot Rice",prep:"20 mins"},{rank:36,local:"Cà Ri Gà",english:"Chicken Curry",prep:"25 mins"},{rank:37,local:"Rau Muống Xào Tỏi",english:"Stir-fried Morning Glory",prep:"10 mins"},{rank:38,local:"Chả Cá",english:"Turmeric Fish with Dill",prep:"20 mins"},{rank:39,local:"Bò Nướng Lá Lốt",english:"Beef in Betel Leaves",prep:"20 mins"},{rank:40,local:"Lẩu Thái",english:"Thai-Style Hot Pot",prep:"25 mins"},{rank:41,local:"Đậu Hũ Xào",english:"Stir-fried Tofu",prep:"15 mins"},{rank:42,local:"Cơm Hến",english:"Hue Mussel Rice",prep:"20 mins"},{rank:43,local:"Bún Mắm",english:"Fermented Fish Noodle Soup",prep:"25 mins"},{rank:44,local:"Bánh Ít",english:"Glutinous Rice Cake",prep:"25 mins"},{rank:45,local:"Bắp Xào",english:"Stir-fried Corn",prep:"10 mins"},{rank:46,local:"Ốc Hút",english:"Stir-fried Snails",prep:"20 mins"},{rank:47,local:"Cơm Chiên Dương Châu",english:"Yangzhou Fried Rice",prep:"15 mins"},{rank:48,local:"Bánh Đúc",english:"Savoury Rice Cake",prep:"20 mins"},{rank:49,local:"Cháo Vịt",english:"Duck Rice Porridge",prep:"25 mins"},{rank:50,local:"Bánh Bao",english:"Steamed Buns",prep:"30 mins"},
  ],
  GB:[
    {rank:1,local:"Fish and Chips",english:"Fish and Chips",prep:"15 mins"},{rank:2,local:"Full English Breakfast",english:"Full English Breakfast",prep:"15 mins"},{rank:3,local:"Sunday Roast",english:"Sunday Roast",prep:"30 mins"},{rank:4,local:"Chicken Tikka Masala",english:"Chicken Tikka Masala",prep:"20 mins"},{rank:5,local:"Shepherd's Pie",english:"Shepherd's Pie",prep:"25 mins"},{rank:6,local:"Bangers and Mash",english:"Bangers and Mash",prep:"15 mins"},{rank:7,local:"Beef Wellington",english:"Beef Wellington",prep:"30 mins"},{rank:8,local:"Pie and Mash",english:"Pie and Mash",prep:"20 mins"},{rank:9,local:"Welsh Rarebit",english:"Cheese Toast",prep:"10 mins"},{rank:10,local:"Ploughman's Lunch",english:"Ploughman's Lunch",prep:"10 mins"},{rank:11,local:"Cornish Pasty",english:"Cornish Pasty",prep:"30 mins"},{rank:12,local:"Scotch Egg",english:"Scotch Egg",prep:"20 mins"},{rank:13,local:"Prawn Cocktail",english:"Prawn Cocktail",prep:"10 mins"},{rank:14,local:"Bubble and Squeak",english:"Potato and Cabbage Cake",prep:"15 mins"},{rank:15,local:"Steak and Kidney Pudding",english:"Steak and Kidney Pudding",prep:"30 mins"},{rank:16,local:"Toad in the Hole",english:"Sausages in Yorkshire Pudding",prep:"15 mins"},{rank:17,local:"Cauliflower Cheese",english:"Cauliflower Cheese",prep:"15 mins"},{rank:18,local:"Jacket Potato",english:"Baked Potato",prep:"10 mins"},{rank:19,local:"Ham, Egg and Chips",english:"Ham, Egg and Chips",prep:"15 mins"},{rank:20,local:"Kedgeree",english:"Smoked Fish and Rice",prep:"20 mins"},{rank:21,local:"Lancashire Hotpot",english:"Lancashire Hotpot",prep:"20 mins"},{rank:22,local:"Beef Stew and Dumplings",english:"Beef Stew and Dumplings",prep:"25 mins"},{rank:23,local:"Macaroni Cheese",english:"Macaroni Cheese",prep:"15 mins"},{rank:24,local:"Smoked Salmon and Scrambled Eggs",english:"Smoked Salmon Scrambled Eggs",prep:"10 mins"},{rank:25,local:"Eton Mess",english:"Strawberry and Cream Dessert",prep:"10 mins"},{rank:26,local:"Sticky Toffee Pudding",english:"Sticky Toffee Pudding",prep:"20 mins"},{rank:27,local:"Bread and Butter Pudding",english:"Bread and Butter Pudding",prep:"15 mins"},{rank:28,local:"Rhubarb Crumble",english:"Rhubarb Crumble",prep:"20 mins"},{rank:29,local:"Scones with Cream",english:"Scones with Clotted Cream",prep:"20 mins"},{rank:30,local:"Coronation Chicken",english:"Coronation Chicken",prep:"15 mins"},{rank:31,local:"Cullen Skink",english:"Scottish Smoked Haddock Soup",prep:"15 mins"},{rank:32,local:"Haggis, Neeps and Tatties",english:"Haggis with Turnip and Potato",prep:"20 mins"},{rank:33,local:"Cawl",english:"Welsh Lamb Stew",prep:"25 mins"},{rank:34,local:"Scampi",english:"Deep-Fried Langoustine",prep:"15 mins"},{rank:35,local:"Potted Shrimps",english:"Potted Shrimps",prep:"15 mins"},{rank:36,local:"Black Pudding",english:"Black Pudding",prep:"10 mins"},{rank:37,local:"Devilled Kidneys",english:"Devilled Kidneys",prep:"15 mins"},{rank:38,local:"Poached Salmon",english:"Poached Salmon",prep:"15 mins"},{rank:39,local:"Spotted Dick",english:"Suet Pudding with Currants",prep:"20 mins"},{rank:40,local:"Bakewell Tart",english:"Bakewell Tart",prep:"25 mins"},{rank:41,local:"Victoria Sponge",english:"Victoria Sponge Cake",prep:"20 mins"},{rank:42,local:"Chelsea Bun",english:"Chelsea Bun",prep:"30 mins"},{rank:43,local:"Battenberg Cake",english:"Marzipan-Wrapped Sponge Cake",prep:"30 mins"},{rank:44,local:"Clootie Dumpling",english:"Scottish Steamed Fruit Pudding",prep:"30 mins"},{rank:45,local:"Faggots in Gravy",english:"Pork Meatballs in Gravy",prep:"20 mins"},{rank:46,local:"Bara Brith",english:"Welsh Fruit Bread",prep:"30 mins"},{rank:47,local:"Pork Scratchings",english:"Pork Scratchings",prep:"5 mins"},{rank:48,local:"Stottie Cake",english:"North East Bread Roll",prep:"25 mins"},{rank:49,local:"Mushy Peas",english:"Mushy Peas",prep:"10 mins"},{rank:50,local:"Cheese on Toast",english:"Cheese on Toast",prep:"5 mins"},
  ],
  IN:[
    {rank:1,local:"बटर चिकन",english:"Butter Chicken",prep:"20 mins"},{rank:2,local:"बिरयानी",english:"Biryani",prep:"30 mins"},{rank:3,local:"समोसा",english:"Samosa",prep:"30 mins"},{rank:4,local:"दाल मखनी",english:"Dal Makhani",prep:"20 mins"},{rank:5,local:"पालक पनीर",english:"Palak Paneer",prep:"20 mins"},{rank:6,local:"मसाला दोसा",english:"Masala Dosa",prep:"20 mins"},{rank:7,local:"तंदूरी चिकन",english:"Tandoori Chicken",prep:"20 mins"},{rank:8,local:"नान",english:"Naan Bread",prep:"20 mins"},{rank:9,local:"चना मसाला",english:"Chana Masala",prep:"20 mins"},{rank:10,local:"आलू गोबी",english:"Aloo Gobi",prep:"20 mins"},{rank:11,local:"रोगन जोश",english:"Rogan Josh",prep:"25 mins"},{rank:12,local:"मटर पनीर",english:"Matar Paneer",prep:"20 mins"},{rank:13,local:"गुलाब जामुन",english:"Gulab Jamun",prep:"20 mins"},{rank:14,local:"राजमा",english:"Kidney Bean Curry",prep:"20 mins"},{rank:15,local:"छोले भटूरे",english:"Chickpea Curry with Fried Bread",prep:"25 mins"},{rank:16,local:"पाव भाजी",english:"Pav Bhaji",prep:"20 mins"},{rank:17,local:"इडली सांभर",english:"Idli with Sambar",prep:"20 mins"},{rank:18,local:"वड़ा पाव",english:"Spicy Potato Fritter Bun",prep:"20 mins"},{rank:19,local:"कोरमा",english:"Korma",prep:"25 mins"},{rank:20,local:"खिचड़ी",english:"Rice and Lentil Porridge",prep:"15 mins"},{rank:21,local:"आलू परांठा",english:"Stuffed Potato Flatbread",prep:"20 mins"},{rank:22,local:"शाही पनीर",english:"Shahi Paneer",prep:"20 mins"},{rank:23,local:"फिश करी",english:"Fish Curry",prep:"20 mins"},{rank:24,local:"कुल्फी",english:"Indian Ice Cream",prep:"10 mins"},{rank:25,local:"दही वड़ा",english:"Lentil Fritters in Yoghurt",prep:"25 mins"},{rank:26,local:"हलीम",english:"Haleem",prep:"30 mins"},{rank:27,local:"ढोकला",english:"Steamed Chickpea Cake",prep:"20 mins"},{rank:28,local:"भेल पुरी",english:"Puffed Rice Snack",prep:"10 mins"},{rank:29,local:"मिसल पाव",english:"Sprouted Bean Curry with Bread",prep:"20 mins"},{rank:30,local:"सरसों दा साग",english:"Mustard Leaf Curry",prep:"25 mins"},{rank:31,local:"हैदराबादी बिरयानी",english:"Hyderabadi Biryani",prep:"30 mins"},{rank:32,local:"रसगुल्ला",english:"Cheese Ball in Syrup",prep:"30 mins"},{rank:33,local:"मालाई कोफ्ता",english:"Malai Kofta",prep:"25 mins"},{rank:34,local:"उत्तपम",english:"Thick Rice Pancake",prep:"15 mins"},{rank:35,local:"पुलाव",english:"Pulao",prep:"20 mins"},{rank:36,local:"केरल फिश करी",english:"Kerala Fish Curry",prep:"20 mins"},{rank:37,local:"मक्के दी रोटी",english:"Cornmeal Flatbread",prep:"20 mins"},{rank:38,local:"जलेबी",english:"Fried Batter in Syrup",prep:"25 mins"},{rank:39,local:"खीर",english:"Rice Pudding",prep:"20 mins"},{rank:40,local:"रसमलाई",english:"Cheese Dumplings in Cream",prep:"30 mins"},{rank:41,local:"लस्सी",english:"Yoghurt Drink",prep:"5 mins"},{rank:42,local:"पायसम",english:"South Indian Kheer",prep:"20 mins"},{rank:43,local:"पोंगल",english:"Rice and Lentil Dish",prep:"20 mins"},{rank:44,local:"अप्पम",english:"Fermented Rice Pancake",prep:"20 mins"},{rank:45,local:"एग करी",english:"Egg Curry",prep:"15 mins"},{rank:46,local:"मटन करी",english:"Mutton Curry",prep:"30 mins"},{rank:47,local:"बेसन का हलवा",english:"Chickpea Flour Pudding",prep:"20 mins"},{rank:48,local:"गुजराती थाली",english:"Gujarati Thali",prep:"30 mins"},{rank:49,local:"बाटी चोखा",english:"Baked Wheat Balls with Mash",prep:"30 mins"},{rank:50,local:"मक्की दी खिचड़ी",english:"Cornmeal Porridge",prep:"20 mins"},
  ],
};

const recipeCache = new Map();

// ── API ───────────────────────────────────────────────────────────────────────
const AH = {"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"};
async function apiFetch(prompt, maxTok) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:AH,body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:maxTok,messages:[{role:"user",content:prompt}]})});
  if(!res.ok){const e=await res.json().catch(()=>{});throw new Error(e?.error?.message||"HTTP "+res.status);}
  return(await res.json()).content.map(b=>b.text||"").join("");
}
function xj(txt){const s=txt.indexOf("{"),e=txt.lastIndexOf("}");if(s<0||e<0)throw new Error("No JSON");return JSON.parse(txt.slice(s,e+1));}
function scaleIng(ings,srv){return ings.map(i=>i.replace(/(\d+(?:\.\d+)?)/g,m=>{const s=parseFloat(m)*srv/4;return s%1===0?s:parseFloat(s.toFixed(1));}));}

// ── Flag SVG ──────────────────────────────────────────────────────────────────
const FlagSVG = memo(function FlagSVG({code,size=40}){
  const s = {width:"100%",height:"100%"};
  if(code==="FR") return <svg viewBox="0 0 3 2" style={s}><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ED2939"/></svg>;
  if(code==="IT") return <svg viewBox="0 0 3 2" style={s}><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#CE2B37"/></svg>;
  if(code==="DE") return <svg viewBox="0 0 5 3" style={s}><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#D00"/><rect y="2" width="5" height="1" fill="#FFCE00"/></svg>;
  if(code==="ES") return <svg viewBox="0 0 3 2" style={s}><rect width="3" height="2" fill="#AA151B"/><rect y="0.5" width="3" height="1" fill="#F1BF00"/></svg>;
  if(code==="CN") return <svg viewBox="0 0 30 20" style={s}><rect width="30" height="20" fill="#DE2910"/><polygon points="5,2 6.18,5.09 9.51,5.09 6.9,7.18 7.94,10.27 5,8.35 2.06,10.27 3.1,7.18 0.49,5.09 3.82,5.09" fill="#FFDE00"/><polygon points="11,1 11.59,2.81 13.39,2.81 11.99,3.93 12.54,5.74 11,4.62 9.46,5.74 10.01,3.93 8.61,2.81 10.41,2.81" fill="#FFDE00"/><polygon points="14,3.5 14.59,5.31 16.39,5.31 14.99,6.43 15.54,8.24 14,7.12 12.46,8.24 13.01,6.43 11.61,5.31 13.41,5.31" fill="#FFDE00"/><polygon points="14,7.5 14.59,9.31 16.39,9.31 14.99,10.43 15.54,12.24 14,11.12 12.46,12.24 13.01,10.43 11.61,9.31 13.41,9.31" fill="#FFDE00"/><polygon points="11,10 11.59,11.81 13.39,11.81 11.99,12.93 12.54,14.74 11,13.62 9.46,14.74 10.01,12.93 8.61,11.81 10.41,11.81" fill="#FFDE00"/></svg>;
  if(code==="BR") return <svg viewBox="0 0 20 14" style={s}><rect width="20" height="14" fill="#009C3B"/><polygon points="10,1.5 18.5,7 10,12.5 1.5,7" fill="#FFDF00"/><circle cx="10" cy="7" r="2.8" fill="#002776"/><path d="M7.3,6.4 Q10,5 12.7,6.4" stroke="#fff" strokeWidth="0.5" fill="none"/></svg>;
  if(code==="NG") return <svg viewBox="0 0 3 2" style={s}><rect width="1" height="2" fill="#008751"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#008751"/></svg>;
  if(code==="TH") return <svg viewBox="0 0 6 4" style={s}><rect width="6" height="4" fill="#A51931"/><rect y="0.667" width="6" height="2.667" fill="#fff"/><rect y="1.333" width="6" height="1.333" fill="#2D2A4A"/></svg>;
  if(code==="PL") return <svg viewBox="0 0 8 5" style={s}><rect width="8" height="2.5" fill="#fff"/><rect y="2.5" width="8" height="2.5" fill="#DC143C"/></svg>;
  if(code==="VN") return <svg viewBox="0 0 3 2" style={s}><rect width="3" height="2" fill="#DA251D"/><polygon points="1.5,0.35 1.676,0.89 2.244,0.89 1.784,1.22 1.96,1.76 1.5,1.43 1.04,1.76 1.216,1.22 0.756,0.89 1.324,0.89" fill="#FFCD00"/></svg>;
  if(code==="GB") return <svg viewBox="0 0 60 30" style={s}><rect width="60" height="30" fill="#012169"/><line x1="0" y1="0" x2="60" y2="30" stroke="#fff" strokeWidth="6"/><line x1="60" y1="0" x2="0" y2="30" stroke="#fff" strokeWidth="6"/><line x1="0" y1="0" x2="60" y2="30" stroke="#C8102E" strokeWidth="2"/><line x1="60" y1="0" x2="0" y2="30" stroke="#C8102E" strokeWidth="2"/><rect x="25" y="0" width="10" height="30" fill="#fff"/><rect x="0" y="10" width="60" height="10" fill="#fff"/><rect x="27" y="0" width="6" height="30" fill="#C8102E"/><rect x="0" y="12" width="60" height="6" fill="#C8102E"/></svg>;
  if(code==="IN"){
    const sp=[];for(let i=0;i<24;i++){const a=(i*15)*Math.PI/180;sp.push(<line key={i} x1={4.5+0.12*Math.cos(a)} y1={3+0.12*Math.sin(a)} x2={4.5+0.72*Math.cos(a)} y2={3+0.72*Math.sin(a)} stroke="#000080" strokeWidth="0.05"/>);}
    return <svg viewBox="0 0 9 6" style={s}><rect width="9" height="2" fill="#FF9933"/><rect y="2" width="9" height="2" fill="#fff"/><rect y="4" width="9" height="2" fill="#138808"/><circle cx="4.5" cy="3" r="0.75" fill="none" stroke="#000080" strokeWidth="0.12"/><circle cx="4.5" cy="3" r="0.1" fill="#000080"/>{sp}</svg>;
  }
  return null;
});

// ── Spin Wheel ────────────────────────────────────────────────────────────────
function SpinWheel({ items, onResult, onClose, label="name" }) {
  const cvs=useRef(null), ang=useRef(0), vel=useRef(0), raf=useRef(null);
  const [spinning,setSpinning]=useState(false), [winner,setWinner]=useState(null);
  const n=items.length, arc=(2*Math.PI)/n;
  const draw=useCallback((a)=>{
    const c=cvs.current; if(!c) return;
    const ctx=c.getContext("2d"),cx=c.width/2,cy=c.height/2,r=cx-4;
    ctx.clearRect(0,0,c.width,c.height);
    const colors=["#111","#1a1a1a","#222","#2a2a2a","#333","#3a3a3a","#444","#4a4a4a","#c9a96e","#b8902a","#d4a853","#8b6914"];
    for(let i=0;i<n;i++){
      const s=a+i*arc,e=s+arc;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,s,e);ctx.fillStyle=colors[i%colors.length];ctx.fill();
      ctx.strokeStyle="rgba(201,169,110,0.3)";ctx.lineWidth=0.5;ctx.stroke();
      ctx.save();ctx.translate(cx,cy);ctx.rotate(s+arc/2);ctx.textAlign="right";ctx.fillStyle=i%8===8?"#111":"rgba(255,255,255,0.85)";
      ctx.font=`300 ${n>20?8:10}px 'Inter',sans-serif`;
      const txt=(items[i][label]||"")+"";ctx.fillText(txt.length>16?txt.slice(0,15)+"…":txt,r-8,3.5);ctx.restore();
    }
    // Centre hub
    ctx.beginPath();ctx.arc(cx,cy,16,0,2*Math.PI);ctx.fillStyle="#c9a96e";ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,10,0,2*Math.PI);ctx.fillStyle="#0a0a0a";ctx.fill();
    // Pointer
    ctx.beginPath();ctx.moveTo(c.width-2,cy);ctx.lineTo(c.width-20,cy-10);ctx.lineTo(c.width-20,cy+10);ctx.closePath();
    ctx.fillStyle="#c9a96e";ctx.fill();
  },[items,n,arc]);
  useEffect(()=>{draw(ang.current);},[draw]);
  const spin=useCallback(()=>{
    if(spinning) return;
    setWinner(null);setSpinning(true);vel.current=0.3+Math.random()*0.2;
    const decel=0.993+Math.random()*0.004;
    function step(){
      ang.current+=vel.current;vel.current*=decel;draw(ang.current);
      if(vel.current>0.001){raf.current=requestAnimationFrame(step);}
      else{setSpinning(false);const norm=((-ang.current%(2*Math.PI))+(2*Math.PI))%(2*Math.PI);setWinner(items[Math.floor(norm/arc)%n]);}
    }
    raf.current=requestAnimationFrame(step);
  },[spinning,draw,items,arc,n]);
  useEffect(()=>()=>cancelAnimationFrame(raf.current),[]);

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f0f0f",border:"1px solid #2a2a2a",borderRadius:4,padding:"2rem",maxWidth:360,width:"93%",textAlign:"center"}}>
        <p style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T.muted,margin:"0 0 1.25rem"}}>spin to discover</p>
        <canvas ref={cvs} width={280} height={280} style={{borderRadius:"50%",border:"1px solid #2a2a2a"}}/>
        {winner&&(
          <div style={{margin:"1.5rem 0 0.75rem",padding:"1rem 1.25rem",background:"#0a0a0a",border:"1px solid #2a2a2a",borderRadius:2}}>
            <p style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:T.gold,margin:"0 0 6px"}}>your selection</p>
            <p className="fd" style={{fontSize:22,fontWeight:400,color:T.white,margin:0,lineHeight:1.2}}>{winner[label]||""}</p>
            {winner.english&&winner.english!==(winner[label]||"")&&<p style={{fontSize:12,color:T.muted,margin:"4px 0 0",fontWeight:300}}>{winner.english}</p>}
          </div>
        )}
        <div style={{display:"flex",gap:8,marginTop:"1.25rem"}}>
          <button onClick={onClose} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #2a2a2a",cursor:"pointer",fontSize:12,color:T.muted,letterSpacing:"0.05em"}}>Cancel</button>
          {winner
            ?<button onClick={()=>onResult(winner)} style={{flex:2,padding:"10px",background:T.gold,border:"none",cursor:"pointer",fontSize:12,color:T.black,fontWeight:500,letterSpacing:"0.08em"}}>EXPLORE DISH →</button>
            :<button onClick={spin} disabled={spinning} style={{flex:2,padding:"10px",background:spinning?"#222":T.gold,border:"none",cursor:spinning?"not-allowed":"pointer",fontSize:12,color:spinning?T.muted:T.black,fontWeight:500,letterSpacing:"0.08em"}}>{spinning?"SPINNING…":"SPIN"}</button>}
        </div>
        {winner&&<button onClick={spin} style={{marginTop:8,width:"100%",padding:"8px",background:"transparent",border:"none",cursor:"pointer",fontSize:11,color:T.muted,letterSpacing:"0.05em"}}>spin again</button>}
      </div>
    </div>
  );
}

// ── Menu Card ─────────────────────────────────────────────────────────────────
const MenuCard = memo(function MenuCard({item, onClick}){
  const {icon} = getDishStyle(item.local, item.english);
  const [hov,setHov] = useState(false);
  return(
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?"#161616":"#111111",border:`1px solid ${hov?"#3a3a3a":"#1e1e1e"}`,borderRadius:2,padding:0,cursor:"pointer",textAlign:"left",overflow:"hidden",display:"flex",flexDirection:"column",width:"100%",transition:"background 0.2s,border-color 0.2s"}}>
      {/* Visual area */}
      <div style={{width:"100%",paddingTop:"55%",position:"relative",background:"#0d0d0d",borderBottom:"1px solid #1e1e1e"}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,opacity:0.7}}>{icon}</div>
        <div style={{position:"absolute",top:10,left:10,fontSize:10,letterSpacing:"0.1em",color:T.gold,fontWeight:400}}>{String(item.rank).padStart(2,"0")}</div>
        {item.prep&&<div style={{position:"absolute",bottom:10,right:10,fontSize:9,letterSpacing:"0.08em",color:T.muted,fontWeight:300}}>{item.prep}</div>}
      </div>
      {/* Text area */}
      <div style={{padding:"14px 16px 16px"}}>
        <p style={{fontSize:15,fontWeight:400,color:T.white,margin:"0 0 4px",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",lineHeight:1.35}}>{item.local}</p>
        {item.english!==item.local&&<p style={{fontSize:12,color:T.muted,margin:0,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontWeight:300,letterSpacing:"0.02em"}}>{item.english}</p>}
      </div>
    </button>
  );
});

// ── App ───────────────────────────────────────────────────────────────────────
export default function App(){
  useFonts();
  const [screen,setScreen]=useState("home");
  const [country,setCountry]=useState(null);
  const [dish,setDish]=useState(null);
  const [detail,setDetail]=useState(null);
  const [detailLoading,setDetailLoading]=useState(false);
  const [diners,setDiners]=useState(4);
  const [showCW,setShowCW]=useState(false);
  const [showDW,setShowDW]=useState(false);
  const [showShare,setShowShare]=useState(false);
  const [copied,setCopied]=useState(false);

  const menu=useMemo(()=>country?(MENU_DATA[country.code]||[]):[],[country]);
  const {icon:dishIcon}=dish?getDishStyle(dish.local,dish.english):{icon:"🍽️"};
  const sc=useMemo(()=>detail?scaleIng(detail.ingredients,diners):[],[detail,diners]);

  const openCountry=useCallback((c)=>{setCountry(c);setScreen("menu");},[]);
  const openDish=useCallback(async(d)=>{
    setDish(d);setDetail(null);setDetailLoading(true);setScreen("dish");
    const ck=`${country.code}:${d.rank}`;
    if(recipeCache.has(ck)){setDetail(recipeCache.get(ck));setDetailLoading(false);return;}
    try{
      const raw=await apiFetch(`BBC Good Food style recipe for "${d.english}" (${d.local}) from ${country.name}. Return ONLY a JSON object, no markdown: {"description":"2 sentences","ingredients":["qty ingredient",...max 10],"prep_time":"X mins","cook_time":"X mins","steps":["step",...max 6]}`,1200);
      const parsed=xj(raw);recipeCache.set(ck,parsed);setDetail(parsed);
    }catch{setDetail({description:"Could not load recipe.",ingredients:[],prep_time:d.prep||"-",cook_time:"-",steps:[]});}
    setDetailLoading(false);
  },[country]);

  const shareUrl="https://claude.ai/artifacts";
  const shareText=country?`Explore authentic ${country.name} dishes — Global Menu Explorer`:"Explore authentic dishes from 12 countries — Global Menu Explorer";
  const encText=encodeURIComponent(shareText),encUrl=encodeURIComponent(shareUrl);
  const socials=[
    {label:"WhatsApp",color:"#25D366",href:`https://wa.me/?text=${encText}%20${encUrl}`},
    {label:"Twitter / X",color:"#000",href:`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`},
    {label:"Facebook",color:"#1877F2",href:`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`},
    {label:"Email",color:"#444",href:`mailto:?subject=Global Menu Explorer&body=${encText}%20${encUrl}`},
  ];
  function handleCopy(){try{const ta=document.createElement("textarea");ta.value=shareUrl;ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);setCopied(true);setTimeout(()=>setCopied(false),2200);}catch{}}

  // ── Shared nav button style ───────────────────────────────────────────────
  const GhostBtn = ({onClick,children})=>(
    <button onClick={onClick} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.18)",borderRadius:2,padding:"5px 14px",cursor:"pointer",fontSize:11,color:"rgba(255,255,255,0.7)",letterSpacing:"0.08em",whiteSpace:"nowrap",transition:"border-color 0.15s"}}>
      {children}
    </button>
  );

  // ── Share modal ───────────────────────────────────────────────────────────
  function ShareModal(){return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}} onClick={e=>{if(e.target===e.currentTarget)setShowShare(false);}}>
      <div style={{background:"#0f0f0f",border:"1px solid #2a2a2a",borderRadius:4,padding:"2rem",maxWidth:340,width:"92%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
          <p style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T.gold,margin:0}}>share this app</p>
          <button onClick={()=>setShowShare(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.muted,lineHeight:1}}>×</button>
        </div>
        <p style={{fontSize:13,color:T.muted,margin:"0 0 1.25rem",lineHeight:1.6,fontWeight:300}}>{shareText}</p>
        <div style={{display:"flex",gap:8,marginBottom:"1rem",background:"#0a0a0a",border:"1px solid #2a2a2a",borderRadius:2,padding:"8px 12px",alignItems:"center"}}>
          <span style={{flex:1,fontSize:11,color:T.muted,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontWeight:300}}>{shareUrl}</span>
          <button onClick={handleCopy} style={{flexShrink:0,padding:"5px 12px",background:copied?"#1a2a1a":"transparent",border:`1px solid ${copied?"#2a5a2a":"#3a3a3a"}`,cursor:"pointer",fontSize:11,color:copied?"#5a9a5a":T.muted,letterSpacing:"0.05em"}}>{copied?"✓ copied":"copy"}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {socials.map(s=>(<a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px",border:"1px solid #2a2a2a",borderRadius:2,color:T.muted,textDecoration:"none",fontSize:11,letterSpacing:"0.05em",background:"transparent",transition:"border-color 0.15s"}}>
            {s.label}
          </a>))}
        </div>
      </div>
    </div>
  );}

  const bs={fontFamily:"'Inter',sans-serif",color:T.white,maxWidth:720,margin:"0 auto",background:T.black,minHeight:"100vh"};

  // ── HOME ──────────────────────────────────────────────────────────────────
  if(screen==="home") return(
    <div style={bs}>
      {showShare&&<ShareModal/>}
      {showCW&&<SpinWheel items={COUNTRIES} label="name" onResult={c=>{setShowCW(false);openCountry(c);}} onClose={()=>setShowCW(false)}/>}

      {/* Hero */}
      <div style={{padding:"3.5rem 2rem 3rem",borderBottom:"1px solid #1e1e1e",position:"relative"}}>
        <div style={{position:"absolute",top:20,right:20}}><GhostBtn onClick={()=>setShowShare(true)}>Share</GhostBtn></div>
        <p style={{fontSize:11,letterSpacing:"0.25em",textTransform:"uppercase",color:T.gold,margin:"0 0 1rem",fontWeight:400}}>Global Menu Explorer</p>
        <h1 className="fd" style={{fontSize:52,fontWeight:400,color:T.white,margin:"0 0 1rem",lineHeight:1.05,letterSpacing:"-0.02em"}}>Discover the world<br/><span className="fi" style={{color:T.muted}}>through its food</span></h1>
        <p style={{fontSize:16,color:T.muted,margin:"0 0 2rem",fontWeight:300,maxWidth:440,lineHeight:1.65}}>Explore 600 authentic dishes from 12 countries, with recipes and preparation guides.</p>
        <button onClick={()=>setShowCW(true)} style={{background:"transparent",border:"1px solid #c9a96e",borderRadius:2,padding:"10px 24px",color:T.gold,fontSize:11,fontWeight:400,cursor:"pointer",letterSpacing:"0.15em",textTransform:"uppercase"}}>
          ✦ Let the wheel decide
        </button>
      </div>

      {/* Country grid */}
      <div style={{padding:"2rem"}}>
        <p style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T.muted,margin:"0 0 1.5rem",fontWeight:400}}>Select a country</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:1}}>
          {COUNTRIES.map((c)=>(
            <button key={c.code} onClick={()=>openCountry(c)}
              style={{background:"#0d0d0d",border:"none",borderRadius:0,padding:0,cursor:"pointer",overflow:"hidden",textAlign:"left",display:"flex",flexDirection:"column",transition:"background 0.2s",outline:"1px solid #1a1a1a"}}
              onMouseEnter={e=>e.currentTarget.style.background="#141414"}
              onMouseLeave={e=>e.currentTarget.style.background="#0d0d0d"}>
              {/* Flag — letterboxed with matte surround */}
              <div style={{width:"100%",paddingTop:"60%",position:"relative",background:"#080808",overflow:"hidden"}}>
                {/* Subtle vignette mat behind flag */}
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"14px 20px"}}>
                  {/* Drop-shadow frame */}
                  <div style={{width:"100%",height:"100%",position:"relative",boxShadow:"0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)",overflow:"hidden",borderRadius:1}}>
                    <FlagSVG code={c.code}/>
                  </div>
                </div>
                {/* Country code watermark */}
                <p className="fd" style={{position:"absolute",bottom:8,right:10,fontSize:11,color:"rgba(255,255,255,0.2)",margin:0,letterSpacing:"0.1em",fontStyle:"italic"}}>{c.code}</p>
              </div>
              {/* Label */}
              <div style={{padding:"12px 14px 14px",borderTop:"1px solid #1a1a1a"}}>
                <p style={{fontSize:15,fontWeight:400,color:T.white,margin:"0 0 3px",letterSpacing:"-0.01em"}}>{c.name}</p>
                <p style={{fontSize:11,color:T.muted,margin:0,fontWeight:300,letterSpacing:"0.04em"}}>{c.lang}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── MENU ──────────────────────────────────────────────────────────────────
  if(screen==="menu") return(
    <div style={bs}>
      {showShare&&<ShareModal/>}
      {showDW&&<SpinWheel items={menu} label="local" onResult={d=>{setShowDW(false);openDish(d);}} onClose={()=>setShowDW(false)}/>}

      {/* Header */}
      <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #1e1e1e",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,background:T.black,zIndex:10}}>
        <button onClick={()=>setScreen("home")} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:11,color:T.muted,letterSpacing:"0.05em",padding:"4px 0",flexShrink:0}}>← Back</button>
        <div style={{width:1,height:20,background:"#2a2a2a",flexShrink:0}}/>
        <div style={{width:36,height:22,borderRadius:1,overflow:"hidden",flexShrink:0,opacity:0.9}}>
          <FlagSVG code={country.code}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:14,fontWeight:400,margin:0,color:T.white,letterSpacing:"-0.01em"}}>{country.name}</p>
          <p style={{fontSize:10,color:T.muted,margin:0,letterSpacing:"0.05em"}}>Top {menu.length} dishes by popularity</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <GhostBtn onClick={()=>setShowDW(true)}>✦ Pick</GhostBtn>
          <GhostBtn onClick={()=>setShowShare(true)}>Share</GhostBtn>
        </div>
      </div>

      <div style={{padding:"1.5rem",paddingTop:"1rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:1}}>
          {menu.map(item=><MenuCard key={item.rank} item={item} onClick={()=>openDish(item)}/>)}
        </div>
      </div>
    </div>
  );

  // ── DISH ──────────────────────────────────────────────────────────────────
  if(screen==="dish") return(
    <div style={bs}>
      {showShare&&<ShareModal/>}

      {/* Header */}
      <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #1e1e1e",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,background:T.black,zIndex:10}}>
        <button onClick={()=>setScreen("menu")} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:11,color:T.muted,letterSpacing:"0.05em",padding:"4px 0"}}>← Menu</button>
        <div style={{width:1,height:20,background:"#2a2a2a"}}/>
        <div style={{width:36,height:22,borderRadius:1,overflow:"hidden",opacity:0.9}}>
          <FlagSVG code={country.code}/>
        </div>
        <p style={{flex:1,fontSize:12,color:T.muted,margin:0,fontWeight:300}}>{country.name}</p>
        <GhostBtn onClick={()=>setShowShare(true)}>Share</GhostBtn>
      </div>

      {/* Hero dish */}
      <div style={{padding:"3rem 2rem 2rem",borderBottom:"1px solid #1e1e1e",display:"flex",gap:"2rem",alignItems:"flex-start"}}>
        <div style={{width:100,height:100,flexShrink:0,background:"#111",border:"1px solid #2a2a2a",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>
          {dishIcon}
        </div>
        <div style={{flex:1}}>
          <p style={{fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",color:T.gold,margin:"0 0 10px",fontWeight:400}}>{country.name} · #{dish.rank}</p>
          <h2 className="fd" style={{fontSize:36,fontWeight:400,margin:"0 0 6px",color:T.white,lineHeight:1.1,letterSpacing:"-0.01em"}}>{dish.local}</h2>
          {dish.english!==dish.local&&<p style={{fontSize:16,color:T.muted,margin:0,fontWeight:300}}>{dish.english}</p>}
        </div>
      </div>

      {detailLoading&&(
        <div style={{textAlign:"center",padding:"3rem",color:T.muted}}>
          <p style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase"}}>preparing recipe…</p>
        </div>
      )}

      {detail&&(
        <div style={{padding:"2rem"}}>
          {/* Description */}
          <p style={{fontSize:15,lineHeight:1.75,color:T.muted,margin:"0 0 2rem",fontWeight:300,borderLeft:`2px solid ${T.gold}`,paddingLeft:"1rem"}}>{detail.description}</p>

          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,marginBottom:"2rem",border:"1px solid #1e1e1e"}}>
            {[["Prep",detail.prep_time],["Cook",detail.cook_time],["Serves",`${diners} ${diners===1?"person":"people"}`]].map(([lbl,val])=>(
              <div key={lbl} style={{padding:"1rem",background:"#0d0d0d",textAlign:"center"}}>
                <p style={{fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:T.muted,margin:"0 0 6px",fontWeight:400}}>{lbl}</p>
                <p style={{fontSize:15,fontWeight:400,color:T.white,margin:0}}>{val}</p>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div style={{marginBottom:"2rem"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem",paddingBottom:"0.75rem",borderBottom:"1px solid #1e1e1e"}}>
              <p style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:T.gold,margin:0}}>Ingredients</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,color:T.muted,fontWeight:300}}>Diners</span>
                <select value={diners} onChange={e=>setDiners(Number(e.target.value))}
                  style={{fontSize:12,padding:"4px 8px",background:"#111",border:"1px solid #2a2a2a",borderRadius:2,color:T.white,cursor:"pointer",fontFamily:"inherit"}}>
                  {Array.from({length:20},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            {sc.map((ing,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"8px 0",borderBottom:i<sc.length-1?"1px solid #141414":"none"}}>
                <span style={{width:4,height:4,borderRadius:"50%",background:T.gold,marginTop:7,flexShrink:0}}/>
                <span style={{fontSize:14,color:T.muted,lineHeight:1.5,fontWeight:300}}>{ing}</span>
              </div>
            ))}
          </div>

          {/* Method */}
          <div>
            <p style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:T.gold,margin:"0 0 1rem",paddingBottom:"0.75rem",borderBottom:"1px solid #1e1e1e"}}>Method</p>
            {detail.steps.map((step,i)=>(
              <div key={i} style={{display:"flex",gap:16,marginBottom:"1.25rem",alignItems:"flex-start"}}>
                <span className="fd" style={{fontSize:20,color:"#2a2a2a",flexShrink:0,lineHeight:1.2,minWidth:24,textAlign:"right"}}>{i+1}</span>
                <p style={{fontSize:14,color:T.muted,margin:0,lineHeight:1.75,fontWeight:300,flex:1}}>{step.replace(/^Step \d+:\s*/i,"")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  return null;
}
