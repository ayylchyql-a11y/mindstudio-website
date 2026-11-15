/* Shiomi · dati del sito (tutto di fantasia) */
window.SO_DATA = {
  /* Dishes that appear inside the set menus. Key → label. */
  dishes: {
    edamame: "Edamame al sale di Cervia",
    sashimiTonno: "Sashimi di tonno e ventresca, ponzu ed erba cipollina",
    salmone: "Nigiri di salmone, sesamo tostato",
    ricciola: "Nigiri di ricciola, limone",
    branzino: "Nigiri di branzino, sale agli agrumi",
    gambero: "Nigiri di gambero rosso",
    toro: "Nigiri di ventresca di tonno",
    capesante: "Nigiri di capasanta, yuzu ponzu",
    ikura: "Gunkan di ikura",
    temaki: "Temaki di salmone",
    hoso: "Hosomaki di cetriolo",
    anguilla: "Nigiri di anguilla, salsa kabayaki"
  },
  /* The three fixed sets. items: [dish, pieces] — pieces 0 = one portion. */
  sets: [
    { id: "lite", name: "Fidati Lite", tag: "Il più leggero", img: "assets/nigiri-misto.webp",
      price: { pranzo: 22, cena: 26 },
      items: [["edamame", 0], ["sashimiTonno", 0], ["salmone", 1], ["ricciola", 1], ["branzino", 1], ["temaki", 0]] },
    { id: "fidati", name: "Fidati", tag: "Il classico", img: "assets/sushi-mix.webp",
      price: { pranzo: 29, cena: 34 },
      items: [["edamame", 0], ["sashimiTonno", 0], ["salmone", 2], ["ricciola", 2], ["branzino", 1], ["gambero", 1], ["temaki", 0], ["hoso", 0]] },
    { id: "grande", name: "Il Grande Fidati", tag: "Per chi ha fame", img: "assets/sashimi-misto.webp",
      price: { pranzo: 37, cena: 44 },
      items: [["edamame", 0], ["sashimiTonno", 0], ["salmone", 2], ["ricciola", 2], ["branzino", 2], ["gambero", 1], ["toro", 2], ["capesante", 1], ["ikura", 1], ["temaki", 0], ["hoso", 0]] }
  ],
  maestro: { id: "maestro", name: "Non pensare. Fidati.", price: { pranzo: 58, cena: 58 } },
  /* À la carte, grouped like the original's gold accordion bars. */
  carta: [
    { id: "sashimi", name: "Sashimi + edamame", items: [
      { id: "c-edamame", name: "Edamame", desc: "Baccelli di soia al vapore, sale di Cervia", price: 4.5, img: "assets/edamame.webp" },
      { id: "c-sash-salmone", name: "Sashimi di salmone", desc: "Cinque fette, sesamo tostato", price: 9, img: "assets/sashimi-salmone.webp" },
      { id: "c-sash-tonno", name: "Sashimi di tonno", desc: "Cinque fette di tonno pinna gialla, ponzu", price: 12, img: "assets/sashimi-tonno-10-pz.webp" },
      { id: "c-tataki", name: "Tataki di salmone", desc: "Scottato fuori, crudo dentro, sesamo", price: 11, img: "assets/tataki-salmone-10-pz.webp" },
      { id: "c-tartare", name: "Tartare di tonno", desc: "Battuta al coltello, avocado, erba cipollina", price: 12, img: "assets/tartare-tonno.webp" } ] },
    { id: "nigiri", name: "Nigiri · 2 pezzi", items: [
      { id: "c-n-salmone", name: "Salmone", desc: "Sesamo tostato", price: 5, img: "assets/nigiri-salmone.webp" },
      { id: "c-n-tonno", name: "Tonno", desc: "Ponzu ed erba cipollina", price: 6, img: "assets/nigiri-tonno.webp" },
      { id: "c-n-branzino", name: "Branzino", desc: "Sale agli agrumi", price: 5.5, img: "assets/nigiri-branzino.webp" },
      { id: "c-n-gambero", name: "Gambero rosso", desc: "Crudo, una goccia di limone", price: 8, img: "assets/nigiri-gambero-rosso.webp" },
      { id: "c-n-anguilla", name: "Anguilla", desc: "Glassata, salsa kabayaki", price: 6.5, img: "assets/nigiri-anguilla.webp" },
      { id: "c-n-ikura", name: "Gunkan di ikura", desc: "Uova di salmone marinate", price: 7, img: "assets/gunkan-ikura.webp" } ] },
    { id: "rolls", name: "Temaki e maki", items: [
      { id: "c-temaki", name: "Temaki di salmone", desc: "Alga croccante, da mangiare subito", price: 5.5, img: "assets/temaki-salmone.webp" },
      { id: "c-hoso", name: "Hosomaki di cetriolo", desc: "Sei pezzi", price: 4, img: "assets/hoso-cetriolo.webp" },
      { id: "c-ura", name: "Uramaki di salmone", desc: "Otto pezzi, l'unico roll che facciamo", price: 10, img: "assets/ura-salmone.webp" } ] },
    { id: "limited", name: "Disponibilità limitata", note: "Finché dura il pesce del giorno.", items: [
      { id: "c-l-maz", name: "Zuppa di miso", desc: "Tofu, wakame, cipollotto", price: 3.5, img: "assets/miso.webp" },
      { id: "c-l-mochi", name: "Mochi", desc: "Tre pezzi: tè verde, sesamo nero, fragola", price: 6, img: "assets/mochi.webp" },
      { id: "c-l-dora", name: "Dorayaki", desc: "Pancake e anko di fagioli rossi", price: 5, img: "assets/dorayaki.webp" } ] },
    { id: "drinks", name: "Tè · acqua · sake", items: [
      { id: "c-d-te", name: "Tè verde caldo", desc: "Sencha, a volontà", price: 3 },
      { id: "c-d-acqua", name: "Acqua", desc: "Naturale o frizzante, 75 cl", price: 2.5 },
      { id: "c-d-birra", name: "Birra giapponese", desc: "Lager di riso, 33 cl", price: 5 },
      { id: "c-d-sake", name: "Sake caldo", desc: "Junmai, tokkuri da 18 cl", price: 8 } ] }
  ],
  /* Hours are minutes from midnight; close > 1440 runs past midnight into the next day.
     Index = day of week, 0 = domenica. */
  sedi: [
    { id: "marina", name: "Marina Centro", addr: "Viale Amerigo Vespucci 41, 47921 Rimini", tel: "+39 0541 380 214",
      tint: "#0f3a63", img: "assets/sede-marina.webp", perTable: 6, base: 3,
      note: "Parcheggio Kennedy a 200 m, gratis la prima mezz'ora.",
      hours: [[[690, 1380]], [[690, 1380]], [[690, 1380]], [[690, 1380]], [[690, 1380]], [[690, 1470]], [[690, 1470]]] },
    { id: "borgo", name: "Borgo San Giuliano", addr: "Via Marecchia 18, 47921 Rimini", tel: "+39 0541 380 377",
      tint: "#6e4424", img: "assets/sede-borgo.webp", perTable: 7, base: 2,
      note: "Zona pedonale: si arriva a piedi dal Ponte di Tiberio.",
      hours: [[[720, 900], [1110, 1380]], [], [[720, 900], [1110, 1380]], [[720, 900], [1110, 1380]], [[720, 900], [1110, 1380]], [[720, 900], [1110, 1410]], [[720, 900], [1110, 1410]]] },
    { id: "riccione", name: "Riccione", addr: "Viale Dante 112, 47838 Riccione", tel: "+39 0541 690 588",
      tint: "#1f5a50", img: "assets/sede-riccione.webp", perTable: 5, base: 4,
      note: "Aperti fino all'una: l'ultima lista si chiude a mezzanotte e mezza.",
      hours: [[[720, 900], [1080, 1500]], [[1080, 1500]], [[1080, 1500]], [[1080, 1500]], [[1080, 1500]], [[1080, 1500]], [[720, 900], [1080, 1500]]] }
  ]
};
