/* M Desk demo data.
   MENU: real dishes, prices and photos from Mumi Sushi Vimercate's live menu (public API, Sept 2026).
   STATS: shaped like the restaurant's real last-30-days aggregates, with every figure scaled and
   rounded — the curve, the channel mix and the hour profile are real, the euros are not. */
window.MDESK = {
  menu: [
 {
  "code": "800",
  "name": "Componi Poke Small",
  "cat": "Poke",
  "price": 10.5,
  "img": "componi-poke-small.webp",
  "allergens": []
 },
 {
  "code": "801",
  "name": "Componi Poke Regular",
  "cat": "Poke",
  "price": 12.5,
  "img": "componi-poke-regular.webp",
  "allergens": []
 },
 {
  "code": "802",
  "name": "Componi Poke Large",
  "cat": "Poke",
  "price": 14.5,
  "img": "componi-poke-large.webp",
  "allergens": []
 },
 {
  "code": "182",
  "name": "Tori CBT Poke",
  "cat": "Poke",
  "price": 12.0,
  "img": "tori-cbt-poke.webp",
  "allergens": []
 },
 {
  "code": "26",
  "name": "Ravioli di Verdure 3 pz",
  "cat": "Ravioli / Bao",
  "price": 3.0,
  "img": "ravioli-di-verdure-3-pz.webp",
  "allergens": []
 },
 {
  "code": "31",
  "name": "Bao Charsiu",
  "cat": "Ravioli / Bao",
  "price": 3.5,
  "img": "bao-charsiu.webp",
  "allergens": []
 },
 {
  "code": "23",
  "name": "Chicken Gyoza 3pz",
  "cat": "Ravioli / Bao",
  "price": 3.5,
  "img": "chicken-gyoza-3pz.webp",
  "allergens": []
 },
 {
  "code": "3",
  "name": "Edamame",
  "cat": "Antipasti / Fritti",
  "price": 4.0,
  "img": "edamame.webp",
  "allergens": []
 },
 {
  "code": "11",
  "name": "Tacos Salmon 2 pz",
  "cat": "Antipasti / Fritti",
  "price": 6.0,
  "img": "tacos-salmon-2-pz.webp",
  "allergens": []
 },
 {
  "code": "1111",
  "name": "Ebi Salmon",
  "cat": "Antipasti / Fritti",
  "price": 8.0,
  "img": "ebi-salmon.webp",
  "allergens": []
 },
 {
  "code": "158",
  "name": "Dragon Maki 8 pz",
  "cat": "Uramaki Special",
  "price": 13.0,
  "img": "dragon-maki-8-pz.webp",
  "allergens": []
 },
 {
  "code": "141",
  "name": "Ura Black Venus Plus",
  "cat": "Uramaki Special",
  "price": 13.0,
  "img": "ura-black-venus-plus.webp",
  "allergens": []
 },
 {
  "code": "155",
  "name": "Special Salmon Maki 8 pz",
  "cat": "Uramaki Special",
  "price": 12.0,
  "img": "special-salmon-maki-8-pz.webp",
  "allergens": []
 },
 {
  "code": "1023",
  "name": "Double Gambero Maki",
  "cat": "Uramaki Special",
  "price": 14.0,
  "img": "double-gambero-maki.webp",
  "allergens": []
 },
 {
  "code": "131",
  "name": "Ura Salmone 8 pz",
  "cat": "Uramaki",
  "price": 9.0,
  "img": "ura-salmone-8-pz.webp",
  "allergens": []
 },
 {
  "code": "133",
  "name": "Ura Ebiten 8 pz",
  "cat": "Uramaki",
  "price": 9.5,
  "img": "ura-ebiten-8-pz.webp",
  "allergens": []
 },
 {
  "code": "755",
  "name": "Nighiri Gambero Rosso 2 pz",
  "cat": "Nigiri",
  "price": 5.0,
  "img": "nighiri-gambero-rosso-2-pz.webp",
  "allergens": []
 },
 {
  "code": "71",
  "name": "Nighiri Salmone 2 pz",
  "cat": "Nigiri",
  "price": 3.5,
  "img": "nighiri-salmone-2-pz.webp",
  "allergens": []
 },
 {
  "code": "75",
  "name": "Nighiri GambCotto 2 pz",
  "cat": "Nigiri",
  "price": 3.5,
  "img": "nighiri-gambcotto-2-pz.webp",
  "allergens": []
 },
 {
  "code": "111",
  "name": "Sashimi Salmone 10 pz",
  "cat": "Sashimi / Carpaccio",
  "price": 12.0,
  "img": "sashimi-salmone-10-pz.webp",
  "allergens": []
 },
 {
  "code": "1911",
  "name": "Gunkan Mazara",
  "cat": "Tartare / Gunkan",
  "price": 6.0,
  "img": "gunkan-mazara.webp",
  "allergens": []
 },
 {
  "code": "209",
  "name": "Gunkan Misto 6 pz",
  "cat": "Tartare / Gunkan",
  "price": 15.0,
  "img": "gunkan-misto-6-pz.webp",
  "allergens": []
 },
 {
  "code": "1081",
  "name": "Hoso Fritto Salmone 6 pz",
  "cat": "Hosomaki / Temaki",
  "price": 5.0,
  "img": "hoso-fritto-salmone-6-pz.webp",
  "allergens": []
 },
 {
  "code": "246",
  "name": "Temaki Tonno",
  "cat": "Hosomaki / Temaki",
  "price": 4.5,
  "img": "temaki-tonno.webp",
  "allergens": []
 },
 {
  "code": "215",
  "name": "Medium Sushi Mix",
  "cat": "Sushi Mix",
  "price": 13.0,
  "img": "medium-sushi-mix.webp",
  "allergens": []
 },
 {
  "code": "216",
  "name": "Big SushiMix",
  "cat": "Sushi Mix",
  "price": 22.0,
  "img": "big-sushimix.webp",
  "allergens": []
 },
 {
  "code": "",
  "name": "Mini Rice Crackers al Pepe Nero",
  "cat": "Dolci e Snack",
  "price": 2.3,
  "img": "mini-rice-crackers-al-pepe-n.webp",
  "allergens": []
 },
 {
  "code": "",
  "name": "Mochi Anguria",
  "cat": "Dolci e Snack",
  "price": 2.0,
  "img": "mochi-anguria.webp",
  "allergens": []
 },
 {
  "code": "",
  "name": "OKF Bevanda Frizzante alla Fragola",
  "cat": "Bevande",
  "price": 2.0,
  "img": "okf-bevanda-frizzante-alla-f.webp",
  "allergens": []
 },
],
  // ── placeholder stats (to be replaced by the anonymised aggregate) ──
  stats: (function () {
    let s = 5; const r = () => (s = (s * 48271) % 2147483647) / 2147483647;
    const days = [];
    const start = new Date(2026, 7, 20);
    for (let i = 0; i < 30; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const wd = d.getDay(); const w = wd === 5 || wd === 6 ? 1.45 : wd === 0 ? 1.2 : wd === 1 ? 0.7 : 1;
      const n = Math.round((34 + r() * 14) * w);
      days.push({ d: d.toISOString().slice(0, 10), n, rev: Math.round(n * (21 + r() * 6) * 10) / 10 });
    }
    return {
      days,
      channels: [["Sito", 31], ["App", 14], ["Chiosco", 19], ["Cassa", 12], ["Deliveroo", 13], ["Just Eat", 11]],
      types: [["Consegna", 38], ["Ritiro", 41], ["Al tavolo", 21]],
      hours: [[11, 6], [12, 22], [13, 26], [14, 9], [18, 14], [19, 31], [20, 38], [21, 27], [22, 8]],
      pay: [["Carta", 46], ["Contanti", 22], ["Alla cassa", 19], ["Piattaforma", 13]],
      prepMin: 17,
    };
  })(),
};
