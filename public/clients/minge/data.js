/* Ming·E — dati condivisi da tutte le versioni del sito (index.html e ordina/).
   Modificare QUI: prezzi, formati, ingredienti, menu sushi, numero WhatsApp. */
/* ═══════════════════════════════════════════════════════════════════════
   DATI — tutto quello che il locale può voler cambiare sta qui in alto.
   Prezzi in euro. `da_confermare` segnala i valori non ancora verificati
   con il menu cartaceo (vedi nota di consegna).
   ═══════════════════════════════════════════════════════════════════════ */
window.WHATSAPP = '393513328109';

window.TACOS = [
  { id: 'spicy-salmone', name: 'Spicy salmone', desc: 'Salmone, tabasco, maionese, sesamo', price: 4.5, tag: 'Più ordinato' },
  { id: 'salmone', name: 'Salmone', desc: 'Salmone, philadelphia, tobiko, sesamo', price: 4.5 },
  { id: 'spicy-tonno', name: 'Spicy tonno', desc: 'Tonno, tabasco, maionese, tobiko', price: 5 },
  { id: 'salmone-cotto', name: 'Salmone cotto', desc: 'Salmone scottato, philadelphia, salsa teriyaki', price: 4.5 },
  { id: 'pollo-piccante', name: 'Pollo piccante', desc: 'Pollo croccante, spicy mayo, cipolla croccante', price: 4.5 },
  { id: 'vegan', name: 'Vegan', desc: 'Avocado, cetriolo, insalata, sesamo', price: 4, tag: 'Vegano', veg: true },
]; // prezzi tacos: da_confermare

// Formati bowl: quanti pezzi di ogni gruppo sono inclusi nel prezzo.
window.SIZES = [
  { id: 'Piccola', price: 8.9, limits: { base: 1, ingredienti: 3, proteine: 1, salse: 1, topping: 1 } },   // da_confermare
  { id: 'Media', price: 10.9, limits: { base: 1, ingredienti: 4, proteine: 2, salse: 2, topping: 1 } },   // dal menu cartaceo
  { id: 'Grande', price: 12.9, limits: { base: 1, ingredienti: 5, proteine: 3, salse: 3, topping: 2 } },  // da_confermare
];
window.EXTRA = 1; // ogni aggiunta oltre gli inclusi

window.GROUPS = {
  base: [
    { name: 'Riso bianco', fill: '#f7f2e8' }, { name: 'Riso venere', fill: '#3a2b31' }, { name: 'Insalata', fill: '#bcd98d' }, { name: 'Riso + insalata', fill: '#dfe3b8' },
  ],
  ingredienti: [
    { name: 'Avocado', fill: '#8cc06f' }, { name: 'Edamame', fill: '#6fae5c' }, { name: 'Cetriolo', fill: '#bfe08a' }, { name: 'Carote', fill: '#f39a3b' },
    { name: 'Mango', fill: '#ffbe3d' }, { name: 'Pomodorini', fill: '#e8503c' }, { name: 'Mais', fill: '#f5d34f' }, { name: 'Cavolo viola', fill: '#7a4c8c' },
    { name: 'Alga wakame', fill: '#1f6f5f' }, { name: 'Ananas', fill: '#f7d96b' }, { name: 'Zenzero', fill: '#f3a6c1' }, { name: 'Cipolla rossa', fill: '#b25b8a' },
  ],
  proteine: [
    { name: 'Salmone', sub: 'Crudo, a cubetti', fill: '#ff7a59', h: 14 },
    { name: 'Tonno', sub: 'Crudo, a cubetti', fill: '#e04b5a', h: 352 },
    { name: 'Gambero cotto', sub: 'Al vapore', fill: '#ffa07a', h: 24 },
    { name: 'Surimi', sub: 'Polpa di granchio', fill: '#f4b7b0', h: 6 },
    { name: 'Salmone scottato', sub: 'Con salsa teriyaki', fill: '#d9784f', h: 20 },
    { name: 'Pollo', sub: 'Croccante o teriyaki', fill: '#c98a52', h: 34 },
    { name: 'Tofu', sub: 'Al sesamo · vegano', fill: '#f0d58c', h: 48 },
  ],
  salse: [
    { name: 'Soia', fill: '#5a3a22' }, { name: 'Teriyaki', fill: '#7a4a2a' }, { name: 'Spicy mayo', fill: '#ff9a6e' }, { name: 'Maionese', fill: '#f4ecc8' },
    { name: 'Salsa mango', fill: '#ffc24a' }, { name: 'Ponzu', fill: '#c9a34a' }, { name: 'Yogurt', fill: '#f7f4ec' },
  ],
  topping: [
    { name: 'Sesamo', fill: '#e9dcc3' }, { name: 'Cipolla croccante', fill: '#c9975a' }, { name: 'Semi misti', fill: '#8b7a55' }, { name: 'Tobiko', fill: '#ff8c2a' },
    { name: 'Kataifi', fill: '#e2b96f' }, { name: 'Mandorle', fill: '#d9c39a' },
  ],
};

// Menu sushi — trascritto dal menu cartaceo. `cols` = intestazioni dei prezzi multipli.
window.SUSHI = [
  { id: 'tartare', name: 'Tartare', items: [
    { n: 'Tartare salmone', d: 'Salmone, avocado, sesamo e salsa ponzu', p: [6] },
    { n: 'Tartare tonno', d: 'Tonno, avocado, sesamo e salsa ponzu', p: [7] },
    { n: 'Tartare mango', d: 'Riso bianco, salmone, mango, salsa mango e kataifi', p: [6] },
    { n: 'Goma wakame', d: 'Alghe giapponesi piccanti', p: [3.5] },
    { n: 'Riso bianco', d: 'Riso di sushi', p: [2] },
  ] },
  { id: 'nigiri', name: 'Nigiri', cols: ['2 pz', '6 pz'], items: [
    { n: 'Salmone', p: [3, 8] }, { n: 'Tonno', p: [3, 8] }, { n: 'Surimi', p: [3, 8] }, { n: 'Gambero cotto', p: [3, 8] },
    { n: 'Sake special', d: 'Salmone scottato, maionese, salsa teriyaki e cipolla croccante', p: [3.5, 9] },
    { n: 'Sake crispy', d: 'Salmone scottato, spicy maionese, philadelphia, salsa teriyaki e cipolla croccante', p: [4, 10] },
    { n: 'Tuna special', d: 'Tonno scottato, philadelphia, salsa teriyaki e pistacchio', p: [3.5, 9] },
    { n: 'Sake mango', d: 'Salmone, philadelphia, mango e salsa mango', p: [3.5, 9] },
  ] },
  { id: 'sashimi', name: 'Sashimi', cols: ['5 pz'], items: [
    { n: 'Salmone', p: [6] }, { n: 'Tonno', p: [7] },
  ] },
  { id: 'gunkan', name: 'Gunkan', sub: '2 pz', items: [
    { n: 'Tobiko', d: 'Uova di pesce', p: [3.5] }, { n: 'Wakame', d: 'Alghe wakame', p: [3.5] },
    { n: 'Flambé', d: 'Salmone, spicy maionese', p: [4] }, { n: 'Gio phila out', d: 'Salmone e philadelphia', p: [4] },
    { n: 'Gio mango out', d: 'Salmone, philadelphia, mango e salsa mango', p: [4.5] },
    { n: 'Gio spicy sake', d: 'Salmone, tabasco, maionese e tobiko', p: [4] },
    { n: 'Gio spicy tuna', d: 'Tonno, tabasco, maionese e tobiko', p: [4.5] },
  ] },
  { id: 'temaki', name: 'Temaki', cols: ['1 pz', '2 pz'], items: [
    { n: 'Salmone', d: 'Salmone, avocado, philadelphia e sesamo', p: [3.5, 6.5] },
    { n: 'Tonno', d: 'Tonno, avocado, maionese e sesamo', p: [4, 7.5] },
    { n: 'California', d: 'Surimi di granchio, avocado, maionese, sesamo', p: [3.5, 6.5] },
    { n: 'Vegan', d: 'Cetriolo, avocado e sesamo', p: [3, 5.5], veg: true },
    { n: 'Ebi', d: 'Gambero cotto, avocado, maionese e sesamo', p: [3.5, 6.5] },
    { n: 'Ebiten', d: 'Gambero fritti, insalata, maionese, salsa teriyaki e kataifi', p: [3.5, 6.5] },
    { n: 'Spicy sake', d: 'Salmone, tabasco, maionese e tobiko', p: [4, 7] },
    { n: 'Spicy tonno', d: 'Tonno, tabasco, maionese e tobiko', p: [4.5, 8] },
  ] },
  { id: 'hosomaki', name: 'Hosomaki', sub: '8 pz', items: [
    { n: 'Salmone', p: [4] }, { n: 'Tonno', p: [4.5] }, { n: 'Avocado', p: [3.5], veg: true }, { n: 'Cetriolo', p: [3.5], veg: true },
    { n: 'Gambero cotto', p: [4] }, { n: 'Surimi di granchio', p: [4] },
    { n: 'Ebiten', d: 'Gambero fritti, maionese, salsa teriyaki e kataifi', p: [5] },
  ] },
  { id: 'uramaki', name: 'Uramaki', sub: '8 pz · riso bianco o venere', items: [
    { n: 'Salmone', d: 'Salmone, avocado e philadelphia', p: [8] },
    { n: 'Tonno', d: 'Tonno, avocado e maionese', p: [9] },
    { n: 'California', d: 'Surimi di granchio, avocado e maionese', p: [7.5] },
    { n: 'Gambero cotto', d: 'Gambero cotto, avocado e maionese', p: [7.5] },
    { n: 'Spicy salmone', d: 'Salmone, tabasco, tobiko e spicy maionese', p: [9] },
    { n: 'Spicy tonno', d: 'Tonno, tabasco, tobiko e spicy maionese', p: [9.5] },
    { n: 'Ebiten', d: 'Gambero fritti, maionese, salsa teriyaki e kataifi', p: [8.5] },
    { n: 'Miura', d: 'Salmone cotto, philadelphia, kataifi e salsa teriyaki', p: [8.5] },
    { n: 'Spicy chicken', d: 'Pollo piccante, cetriolo, spicy maionese, teriyaki e cipolla croccante', p: [8.5] },
    { n: 'Avocado', d: 'Avocado', p: [7], veg: true },
    { n: 'Crispy ebiten', d: 'Gambero fritti, spicy maionese, salsa teriyaki e cipolla croccante', p: [8.5] },
  ] },
  { id: 'special', name: 'Uramaki special', sub: '8 pz', items: [
    { n: 'Sake mango', d: 'Salmone e avocado con sopra philadelphia, mango e salsa mango', p: [10] },
    { n: 'Tiger roll', d: 'Gambero fritti, cetriolo, maionese con sopra salmone, salsa teriyaki e pistacchio', p: [10] },
    { n: 'Fresh sake', d: 'Salmone, avocado, philadelphia', p: [10] },
    { n: 'Red dragon', d: 'Gambero fritti, cetriolo, avocado con sopra tonno, salsa teriyaki e pistacchio', p: [10.5] },
    { n: 'Cheese roll', d: 'Gambero fritti, cetriolo con sopra cheddar, salsa teriyaki e cipolla croccante', p: [10] },
    { n: 'Rainbow roll', d: 'Surimi di granchio, avocado con sopra pesce misto e salsa teriyaki', p: [10] },
    { n: 'Green dragon', d: 'Gambero fritti, cetriolo, maionese con sopra avocado, salsa teriyaki e kataifi', p: [10] },
    { n: 'Wakame roll', d: 'Gambero cotto, avocado, maionese con sopra wakame e salsa teriyaki', p: [10] },
    { n: 'Flambé roll', d: 'Gambero fritti, cetriolo con sopra salmone scottato, philadelphia e salsa teriyaki', p: [10] },
    { n: 'Tuna special', d: 'Tonno, avocado con sopra tonno, maionese, salsa teriyaki e tobiko', p: [11] },
  ] },
  { id: 'futomaki', name: 'Futomaki', cols: ['5 pz', '10 pz'], items: [
    { n: 'Salmone', d: 'Salmone, avocado, philadelphia e salsa teriyaki', p: [5, 10] },
    { n: 'Gambero fritti', d: 'Gambero fritti, avocado, maionese, salsa teriyaki e kataifi', p: [5.5, 10] },
    { n: 'Misto', d: 'Pesce misto, avocado e salsa teriyaki', p: [6, 11] },
    { n: 'Vegan', d: 'Avocado, cetriolo e insalata, maionese vegana', p: [4.5, 8], veg: true },
    { n: 'California', d: 'Surimi di granchio, avocado, maionese e salsa teriyaki', p: [5, 9] },
  ] },
];

