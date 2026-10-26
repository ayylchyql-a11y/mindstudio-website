/* Legna E Farina — il menù, una volta sola, per tutti i design di questa cartella.
 *
 * Prezzi:
 *   src "banco"  = letto dalla lavagna sopra il banco (foto del locale, 2026).
 *   src "online" = la lavagna non ha questa voce (pizze, calzoni, focacce, formato famiglia,
 *                  qualche fritto): prezzo del listino Deliveroo, che di solito è più alto.
 * Immagini: `img` è il nome del file in assets/ senza estensione. Le "-top" sono pizze viste
 * dall'alto, ritagliate sul centro della pizza (non della foto) — vedi CREDITS.md.
 */
(function () {
  "use strict";
  const CATS = [
    { id: "classiche", t: "Pizze classiche", short: "Classiche", img: "margherita-top", tint: "#f6e1d0", color: "#E8392B", ink: "#fff8ec" },
    { id: "casa", t: "Pizze della casa", short: "Della casa", img: "salame-rucola-top", tint: "#f4d6bf", color: "#F27A1A", ink: "#1b1b1b" },
    { id: "pesce", t: "Pizze con il pesce", short: "Pesce", img: "fruttidimare-top", tint: "#dde6e4", color: "#3A7BD5", ink: "#fff8ec" },
    { id: "bianche", t: "Pizze bianche", short: "Bianche", img: "bianca-top", tint: "#f3efe4", color: "#FFF8EC", ink: "#1b1b1b" },
    { id: "famiglia", t: "Formato famiglia", short: "Famiglia", img: "famiglia-top", tint: "#f2e4c4", color: "#FFD447", ink: "#1b1b1b" },
    { id: "calzoni", t: "Calzoni", short: "Calzoni", img: "calzone", tint: "#eed9c6", color: "#C9772E", ink: "#fff8ec" },
    { id: "focacce", t: "Focacce", short: "Focacce", img: "focaccia", tint: "#ece5cc", color: "#E9C46A", ink: "#1b1b1b" },
    { id: "panini", t: "I paninozzi", short: "Panini", img: "panino", tint: "#ecdbcf", color: "#B5446E", ink: "#fff8ec" },
    { id: "piadine", t: "Le nostre piade", short: "Piade", img: "piadina-kebab", tint: "#efe1d0", color: "#D94F30", ink: "#fff8ec" },
    { id: "sfiziosita", t: "Le sfiziosità", short: "Kebab", img: "piatto-kebab", tint: "#e9d3c5", color: "#8C3B1F", ink: "#fff8ec" },
    { id: "fritti", t: "I fritti", short: "Fritti", img: "patatine", tint: "#f4e5bb", color: "#FFD447", ink: "#1b1b1b" },
    { id: "insalatone", t: "Insalatone", short: "Insalatone", img: "insalata", tint: "#e0e9d5", color: "#2F8F4E", ink: "#fff8ec" },
    { id: "dolci", t: "Dolci del giorno", short: "Dolci", img: "nutella", tint: "#efdcd6", color: "#F4B6C2", ink: "#1b1b1b" },
  ];

  const ITEMS = [];
  const POP = "più ordinata";
  // [id, nome, ingredienti, prezzo, src, img, tag]
  const put = (cat, rows) => rows.forEach(([id, n, d, p, src, img, tag]) => ITEMS.push({ cat, id, n, d, p, src, img, tag }));

  put("classiche", [
    ["margherita", "Margherita", "Pomodoro e mozzarella", 6, "online", "margherita-top", POP],
    ["diavola", "Diavola", "Pomodoro, mozzarella e salame piccante", 8, "online", "diavola-top", POP],
    ["prosciutto-funghi", "Prosciutto e funghi", "Pomodoro, mozzarella, prosciutto cotto e funghi", 8, "online", "prosciutto-funghi-top", POP],
    ["prosciutto", "Prosciutto", "Pomodoro, mozzarella e prosciutto cotto", 7, "online", "prosciutto-funghi-top"],
    ["patatona", "Patatona", "Pomodoro, mozzarella e patatine fritte", 8, "online", "famiglia-top"],
    ["wurstel", "Würstel", "Pomodoro, mozzarella e würstel", 7, "online", "salame-top"],
    ["marinara", "Marinara", "Pomodoro, aglio, olio d'oliva e origano", 5.5, "online", "marinara-top"],
    ["lombarda", "Lombarda", "Pomodoro, mozzarella, rucola, bresaola e scaglie di grana", 10, "online", "crudo-top"],
    ["capricciosa", "Capricciosa", "Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi e capperi", 9, "online", "capricciosa-top"],
    ["quattro-formaggi", "Quattro formaggi", "Pomodoro, mozzarella e formaggi misti", 9, "online", "formaggi-top"],
    ["crudo", "Crudo", "Pomodoro, mozzarella e prosciutto crudo", 9, "online", "crudo-top"],
    ["funghi", "Funghi", "Pomodoro, mozzarella e funghi champignon", 7.5, "online", "funghi-top"],
    ["quattro-stagioni", "Quattro stagioni", "Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi e olive", 9, "online", "capricciosa-top"],
    ["ortolana", "Ortolana", "Pomodoro, mozzarella, melanzane, zucchine e peperoni", 9, "online", "ortolana-top"],
    ["salsiccia-friarielli", "Salsiccia e friarielli", "Pomodoro, mozzarella, salsiccia e friarielli", 9.5, "online", "ortolana-top"],
    ["romana", "Romana", "Pomodoro, mozzarella, capperi, acciughe, origano e olive", 8.5, "online", "salame-top"],
    ["napoli", "Napoli", "Pomodoro, mozzarella, acciughe e origano", 8, "online", "marinara-top"],
    ["parmigiana", "Parmigiana", "Pomodoro, mozzarella, melanzane e parmigiano", 8, "online", "ortolana-top"],
    ["siciliana", "Siciliana", "Pomodoro, capperi, acciughe e olive", 7.5, "online", "marinara-top"],
    ["gorgonzola-speck", "Gorgonzola e speck", "Pomodoro, mozzarella, gorgonzola e speck", 9.5, "online", "formaggi-top"],
    ["bismark", "Bismark", "Pomodoro, mozzarella, prosciutto cotto e uovo", 8.5, "online", "prosciutto-funghi-top"],
    ["panna-prosciutto", "Panna e prosciutto", "Pomodoro, mozzarella, prosciutto cotto e panna", 8, "online", "prosciutto-funghi-top"],
    ["porcini", "Porcini", "Pomodoro, mozzarella e funghi porcini", 10, "online", "funghi-top"],
  ]);
  put("casa", [
    ["kebab-pizza", "La nostra pizza kebab", "Doppia pasta, pomodoro, mozzarella, kebab, insalata, cipolla e salse", 11, "online", "salame-rucola-top", "specialità"],
    ["topolino", "Topolino", "Pomodoro, mozzarella, würstel e patatine", 9, "online", "famiglia-top", POP],
    ["campagnola", "Campagnola", "Pomodoro, mozzarella, salsiccia, peperone e brie", 10, "online", "peperoni-top"],
    ["pluto", "Pluto", "Pomodoro, mozzarella, melanzane, gorgonzola e salame", 9.5, "online", "salame-top"],
    ["affumicata", "Affumicata", "Pomodoro, mozzarella, insalata trevisana, salsiccia e scamorza", 9.5, "online", "capricciosa-top"],
    ["lupo-alberto", "Lupo Alberto", "Pomodoro, mozzarella, luganega, peperoni e olive", 9.5, "online", "peperoni-top"],
    ["nonna-silvana", "Nonna Silvana", "Pomodoro, mozzarella, porcini, bresaola e scaglie di grana", 10.5, "online", "funghi-top"],
    ["ricca", "Ricca", "Pomodoro, mozzarella, melanzane grigliate, porcini, salsiccia e parmigiano", 11, "online", "ortolana-top"],
    ["tirolese", "Tirolese", "Pomodoro, mozzarella, brie e speck", 9.5, "online", "formaggi-top"],
    ["cappuccetto-rosso", "Cappuccetto Rosso", "Pomodoro, mozzarella di bufala e pomodorini", 9.5, "online", "margherita-top"],
  ]);
  put("pesce", [
    ["imperiale", "Imperiale", "Pomodoro, mozzarella, gamberetti, panna e salmone", 11, "online", "mare-top"],
    ["tonno-cipolla", "Tonno e cipolla", "Pomodoro, mozzarella, cipolla e tonno", 8.5, "online", "fruttidimare-top"],
    ["vichinga", "Vichinga bianca", "Mozzarella, salmone, rucola e grana", 10, "online", "bianca-top"],
    ["gamberetti-zucchine", "Gamberetti e zucchine", "Pomodoro, mozzarella, gamberetti e zucchine grigliate", 10, "online", "mare-top"],
    ["mare-monti", "Mare e monti", "Pomodoro, mozzarella, funghi porcini e gamberetti", 10.5, "online", "mare-top"],
    ["frutti-di-mare", "Frutti di mare", "Pomodoro, mozzarella e frutti di mare", 10, "online", "fruttidimare-top"],
  ]);
  put("bianche", [
    ["regina", "Regina", "Mozzarella, brie e peperoni grigliati", 9, "online", "formaggi-top"],
    ["primavera-bianca", "Primavera", "Mozzarella, rucola, pomodorini e scaglie di grana", 9, "online", "bianca-top"],
    ["sfiziosa", "Sfiziosa", "Mozzarella, radicchio, gorgonzola e speck", 9.5, "online", "formaggi-top"],
  ]);
  put("famiglia", [
    ["margherita-famiglia", "Margherita formato famiglia", "Pomodoro e mozzarella, da dividere in tanti", 23, "online", "famiglia-top"],
    ["kebab-famiglia", "Pizza kebab formato famiglia", "La specialità della casa, in grande: kebab, insalata, cipolla e salse", 31, "online", "salame-rucola-top"],
  ]);
  put("calzoni", [
    ["calzone-lf", "Calzone Legna e Farina", "Pomodoro, mozzarella, kebab, cipolla e salse", 10, "online", "calzone", "della casa"],
    ["calzone-vesuvio", "Calzone Vesuvio", "Doppia pasta, pomodoro, mozzarella, salsiccia, salame piccante, olive e peperoncino", 10.5, "online", "calzone"],
    ["calzone-4f", "Calzone quattro formaggi", "Pomodoro e formaggi misti", 9.5, "online", "calzone"],
    ["calzone-farcito", "Calzone farcito", "Pomodoro, mozzarella, prosciutto cotto, funghi e carciofi", 9.5, "online", "calzone"],
    ["calzone-liscio", "Calzone liscio", "Pomodoro, mozzarella e prosciutto cotto", 7.5, "online", "calzone"],
    ["calzone-dolce", "Calzone dolce", "Farcito con Nutella", 7.5, "online", "calzone"],
  ]);
  put("focacce", [
    ["focaccia-origano", "Olio e origano", "Focaccia con olio e origano", 5, "online", "focaccia"],
    ["focaccia-rosmarino", "Rosmarino", "Focaccia con rosmarino", 5, "online", "focaccia"],
    ["focaccia-fresca", "Fresca", "Pomodorini ciliegini, rucola e scaglie di grana", 8, "online", "focaccia"],
    ["focaccia-simpatica", "Simpatica", "Funghi porcini, zucchine e rucola", 9.5, "online", "focaccia"],
  ]);
  put("panini", [
    ["panino-kebab", "Panino kebab", "Kebab, insalata, pomodoro e cipolla", 4, "banco", "panino", POP],
    ["panino-falafel", "Panino falafel", "Falafel, insalata, pomodoro e cipolla", 4, "banco", "falafel"],
    ["panino-primavera", "Panino primavera", "Tonno, insalata e mozzarella", 4, "banco", "toast"],
    ["panino-nostrano", "Panino nostrano", "Affettato a scelta, insalata e mozzarella", 4, "banco", "toast"],
    ["panino-cotoletta", "Panino cotoletta", "Farcito con cotoletta", 4, "banco", "panino"],
    ["hot-dog", "Hot dog", "Panino con würstel", 2.5, "banco", "hotdog", POP],
    ["maxi-toast", "Maxi toast", "Tre ingredienti a scelta", 4.5, "banco", "toast"],
  ]);
  put("piadine", [
    ["romagnola", "Romagnola", "Crudo, squacquerone e rucola", 5, "banco", "piadina-kebab"],
    ["piadina-chicken", "Chicken", "Straccetti di pollo, insalata, pomodoro e cipolla", 5, "banco", "piadina-kebab"],
    ["piadina-fish", "Fish", "Tonno, insalata, pomodoro e mozzarella", 5, "banco", "piadina-kebab"],
    ["arrotolata-kebab", "Kebab arrotolata", "Kebab, insalata, pomodoro e cipolla", 4.5, "banco", "piadina-kebab"],
    ["arrotolata-falafel", "Falafel arrotolata", "Falafel, insalata, pomodoro e cipolla", 4.5, "banco", "piadina-kebab"],
    ["piadina-nutella", "Nutella", "Piadina farcita con Nutella", 3.5, "banco", "nutella"],
  ]);
  put("sfiziosita", [
    ["kebab-box", "Kebab box", "Kebab, salse e patatine fritte", 4, "banco", "piatto-kebab", POP],
    ["piatto-barbara", "Piatto Barbara", "Kebab, verdure grigliate, insalata e patatine fritte", 7, "banco", "piatto-kebab"],
    ["vaschetta", "Vaschetta falafel o kebab", "Una vaschetta, a scelta", 9, "online", "falafel"],
  ]);
  put("fritti", [
    ["patatine", "Patatine fritte", "Porzione croccante", 2, "banco", "patatine"],
    ["nuggets-6", "Nuggets 6 pezzi", "Bocconcini di pollo impanati", 3.5, "banco", "nuggets"],
    ["nuggets-12", "Nuggets 12 pezzi", "Bocconcini di pollo impanati", 6, "banco", "nuggets"],
    ["nuggets-24", "Nuggets 24 pezzi", "Per il tavolo intero", 10, "banco", "nuggets"],
    ["falafel", "Falafel", "Porzione di falafel", 5, "banco", "falafel"],
    ["arancino", "Arancino", "Un pezzo", 1, "banco", "arancini"],
    ["arancini-5", "Arancini 5 pezzi", "Cinque arancini fritti", 4, "banco", "arancini"],
    ["mozzarelline", "Mozzarelline impanate", "Mozzarelline fritte", 3, "banco", "mozzarelline"],
    ["fagottini", "Fagottini 3 pezzi", "Tre fagottini fritti", 4, "online", "arancini"],
  ]);
  put("insalatone", [
    ["insalata-basic", "Basic", "Insalata mista, uovo sodo, pomodoro, mais e mozzarella", 4.5, "banco", "insalata"],
    ["insalata-mediterranea", "Mediterranea", "Insalata mista, olive, tonno e pomodoro", 5, "banco", "insalata"],
    ["insalata-chicken", "Chicken", "Insalata mista, pomodoro, mais e straccetti di pollo", 5, "banco", "insalata"],
    ["insalata-fish", "Fish", "Insalata verde, pomodoro, salmone e bufala", 6.5, "banco", "insalata"],
  ]);
  put("dolci", [
    ["dolce-1", "Dolce del giorno", "Un pezzo", 1, "banco", "nutella"],
    ["dolce-4", "Dolci del giorno", "Quattro pezzi", 2.5, "banco", "nutella"],
  ]);

  /* "Cosa ti va?" — ingredienti cliccabili. Ogni voce trova le pizze leggendo gli ingredienti,
     così non c'è una seconda lista da tenere allineata. */
  const INGREDIENTS = [
    { id: "bufala", t: "Bufala", re: /bufala/i, emoji: "🧀" },
    { id: "funghi", t: "Funghi", re: /funghi|porcini|champignon/i, emoji: "🍄" },
    { id: "salame", t: "Salame piccante", re: /salame/i, emoji: "🌶️" },
    { id: "salsiccia", t: "Salsiccia", re: /salsiccia|luganega/i, emoji: "🌭" },
    { id: "cotto", t: "Prosciutto cotto", re: /prosciutto cotto/i, emoji: "🥓" },
    { id: "crudo", t: "Crudo e speck", re: /crudo|speck|bresaola/i, emoji: "🥩" },
    { id: "kebab", t: "Kebab", re: /kebab/i, emoji: "🥙" },
    { id: "tonno", t: "Tonno", re: /tonno/i, emoji: "🐟" },
    { id: "mare", t: "Gamberi e mare", re: /gamberetti|frutti di mare|salmone|acciughe/i, emoji: "🦐" },
    { id: "verdure", t: "Verdure", re: /melanzane|zucchine|peperon|friarielli|radicchio|trevisana/i, emoji: "🫑" },
    { id: "rucola", t: "Rucola", re: /rucola/i, emoji: "🌿" },
    { id: "formaggi", t: "Formaggi", re: /gorgonzola|brie|formaggi|scamorza|grana|parmigiano/i, emoji: "🧀" },
    { id: "patatine", t: "Patatine", re: /patatine/i, emoji: "🍟" },
    { id: "olive", t: "Olive e capperi", re: /olive|capperi/i, emoji: "🫒" },
  ];

  // [apre, chiude] in minuti dalla mezzanotte di quel giorno (chiude > 1440 = dopo mezzanotte). 0 = domenica.
  const HOURS = [[660, 1620], [600, 1620], [600, 1620], [600, 1620], [600, 1620], [600, 1650], [600, 1680]];
  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

  window.LF_MENU = { CATS, ITEMS, INGREDIENTS, HOURS, DAYS, PHONE: "039 668840", ADDRESS: "Piazzale Guglielmo Marconi 7/D, 20871 Vimercate (MB)" };
})();
