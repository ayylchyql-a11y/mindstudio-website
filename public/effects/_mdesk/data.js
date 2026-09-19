/* M Desk demo data.
   MENU: real dishes, prices and photos from Mumi Sushi Vimercate's live menu (public API, Sept 2026).
   STATS: the restaurant's real last-30-days aggregates with every figure scaled and
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
  // top sellers, last 30 days (real ranking; quantities scaled like everything else)
  top: [["Componi Poke Regular", "Poke", "componi-poke-regular.webp", 415], ["Componi Poke Large", "Poke", "componi-poke-large.webp", 197], ["Componi Poke Small", "Poke", "componi-poke-small.webp", 40], ["Ravioli artigianali di carne 3 pz", "Ravioli / Bao", "ravioli-di-carne-3-pz.webp", 28], ["Pad Thai", "Ravioli / Bao", "pad-thai.webp", 19]],
  // ── last 30 days, shape real, figures scaled (see header) ──
  stats: {"days": [{"d": "2026-08-20","n": 15,"rev": 319.8},{"d": "2026-08-21","n": 6,"rev": 215.5},{"d": "2026-08-22","n": 19,"rev": 465.3},{"d": "2026-08-23","n": 14,"rev": 481.5},{"d": "2026-08-24","n": 13,"rev": 253.2},{"d": "2026-08-25","n": 14,"rev": 390.4},{"d": "2026-08-26","n": 15,"rev": 337.5},{"d": "2026-08-27","n": 12,"rev": 234.3},{"d": "2026-08-28","n": 16,"rev": 337.0},{"d": "2026-08-29","n": 14,"rev": 456.1},{"d": "2026-08-30","n": 19,"rev": 612.8},{"d": "2026-08-31","n": 19,"rev": 625.3},{"d": "2026-09-01","n": 17,"rev": 492.8},{"d": "2026-09-02","n": 21,"rev": 660.8},{"d": "2026-09-03","n": 22,"rev": 640.3},{"d": "2026-09-04","n": 24,"rev": 605.9},{"d": "2026-09-05","n": 27,"rev": 728.6},{"d": "2026-09-06","n": 22,"rev": 669.3},{"d": "2026-09-07","n": 14,"rev": 330.0},{"d": "2026-09-08","n": 21,"rev": 595.3},{"d": "2026-09-09","n": 11,"rev": 350.6},{"d": "2026-09-10","n": 15,"rev": 392.3},{"d": "2026-09-11","n": 21,"rev": 667.8},{"d": "2026-09-12","n": 20,"rev": 579.6},{"d": "2026-09-13","n": 21,"rev": 524.2},{"d": "2026-09-14","n": 17,"rev": 492.7},{"d": "2026-09-15","n": 19,"rev": 596.4},{"d": "2026-09-16","n": 17,"rev": 497.6},{"d": "2026-09-17","n": 14,"rev": 331.1},{"d": "2026-09-18","n": 28,"rev": 732.9}],"channels": [["Deliveroo",43],["Chiosco",34],["Just Eat",18],["Sito",3],["App",1],["Cassa",1]],"types": [["Consegna",61],["Ritiro",30],["Al tavolo",8]],"hours": [[9,1],[10,2],[11,13],[12,25],[13,20],[14,4],[17,2],[18,22],[19,40],[20,40],[21,18],[22,3]],"pay": [["Piattaforma",60],["Alla cassa",35],["Contanti",4],["Carta",1],["Pos",1]],"prepMin": 17},
};
