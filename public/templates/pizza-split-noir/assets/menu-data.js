/* I Vesperini · dati del menu (di fantasia) */
window.VS_MENU = {
  viaggio: [
    { id: "marinara", cat: "rosse", name: "Marinara", desc: "Pomodoro San Marzano, aglio dell'Ufita, origano di Castelcivita, olio evo.", price: 7, img: "marinara" },
    { id: "margherita", cat: "rosse", name: "Margherita", desc: "Pomodoro, fior di latte di Agerola, basilico, olio evo, pecorino.", price: 8.5, img: "margherita" },
    { id: "cosacca", cat: "rosse", name: "Cosacca", desc: "Pomodoro, pecorino romano a scaglie, basilico, pepe nero. La più antica dopo la marinara.", price: 8, img: null },
    { id: "capricciosa", cat: "rosse", name: "Capricciosa", desc: "Pomodoro, fior di latte, prosciutto cotto, funghi, carciofini, olive di Gaeta.", price: 11, img: "capricciosa" },
    { id: "diavola", cat: "rosse", name: "Diavola", desc: "Pomodoro, fior di latte, salame piccante di Napoli, peperoncino fresco.", price: 10, img: "diavola" },
    { id: "provola", cat: "bianche", name: "Provola e pepe", desc: "Provola affumicata, fior di latte, pepe nero, basilico, olio evo.", price: 9, img: "formaggi" },
    { id: "salsiccia", cat: "bianche", name: "Salsiccia e friarielli", desc: "Fior di latte, friarielli saltati in padella, salsiccia di maiale nero casertano.", price: 11.5, img: "prosciutto-funghi" },
    { id: "rucola", cat: "bianche", name: "Salame e rucola", desc: "Fior di latte, salame napoletano, rucola selvatica, scaglie di grana in uscita.", price: 11, img: "salame-rucola" },
    { id: "montanara", cat: "fritti", name: "Montanara", desc: "Pizzetta fritta, ragù di pomodoro, parmigiano e basilico.", price: 5, img: null },
    { id: "ripieno", cat: "fritti", name: "Ripieno fritto", desc: "Ricotta, cicoli, provola e pepe, chiuso a mezzaluna e fritto.", price: 10, img: null },
    { id: "frittatina", cat: "fritti", name: "Frittatina di pasta", desc: "Bucatini, besciamella, piselli e provola, panata e fritta.", price: 4.5, img: null },
    { id: "babbà", cat: "dolci", name: "Babà al limoncello", desc: "Lievitato due giorni, bagna al limone della Costiera, crema chantilly.", price: 6, img: null },
    { id: "pannacotta", cat: "dolci", name: "Panna cotta e amarene", desc: "Latte di bufala, coulis di amarene di Pastena.", price: 6, img: null },
    { id: "graffa", cat: "dolci", name: "Graffa calda", desc: "Ciambella di patate fritta al momento, zucchero e cannella.", price: 4, img: null },
    { id: "fiano", cat: "cantina", name: "Fiano di Avellino DOCG", desc: "Bianco, Irpinia. Nocciola, pera, una punta di fumo.", price: 32, img: null, unit: "bottiglia" },
    { id: "tramonti", cat: "cantina", name: "Costa d'Amalfi Tramonti Rosso", desc: "Tintore e piedirosso da viti a piede franco.", price: 38, img: null, unit: "bottiglia" },
    { id: "aglianico", cat: "cantina", name: "Aglianico del Cilento", desc: "Rosso, morbido, frutti neri. Anche al calice.", price: 6, img: null, unit: "calice" },
    { id: "birra", cat: "cantina", name: "Birra artigianale di Paestum", desc: "Bionda non filtrata, 33 cl.", price: 6.5, img: null }
  ],
  cats: [
    { id: "tutte", label: "Tutte" },
    { id: "rosse", label: "Rosse" },
    { id: "bianche", label: "Bianche" },
    { id: "fritti", label: "Fritti" },
    { id: "dolci", label: "Dolci" },
    { id: "cantina", label: "Cantina" }
  ],
  /* Le stagioni: months are 0-based (JS) */
  seasons: [
    { id: "inverno", label: "Inverno", months: [11, 0, 1], range: "dicembre – febbraio",
      seq: { base: "#f1e6cf", baseName: "Crema di provola affumicata.", top: "Friarielli e salsiccia di maiale nero.", kind: "inverno" },
      pizzas: [
        { name: "Cipolla nera", price: 14, img: "fruttidimare", desc: "Cipolla ramata di Montoro caramellata, fonduta di provolone del Monaco, polvere di olive nere." },
        { name: "Fuoco d'inverno", price: 15, img: "salame", desc: "Salsiccia di maiale nero, friarielli, papaccella sott'aceto, fior di latte." },
        { name: "Neve sul Picentino", price: 15, img: "bianca", desc: "Crema di castagne, ricotta di bufala, rucola selvatica, riduzione di aglianico." }
      ] },
    { id: "primavera", label: "Primavera", months: [2, 3, 4], range: "marzo – maggio",
      seq: { base: "#a9c46a", baseName: "Crema di piselli e menta.", top: "Fave fresche, asparagi e pecorino.", kind: "primavera" },
      pizzas: [
        { name: "Prato di maggio", price: 14, img: "ortolana", desc: "Crema di piselli, fave, spinacino, ricotta salata, menta." },
        { name: "Asparago e tuorlo", price: 15, img: "formaggi", desc: "Asparagi di bosco, tuorlo marinato grattugiato, fior di latte, pepe." },
        { name: "Pomodorino giallo", price: 13, img: "margherita", desc: "Pomodorino giallo del Vesuvio, stracciatella, basilico greco." }
      ] },
    { id: "estate", label: "Estate", months: [5, 6, 7], range: "giugno – agosto",
      seq: { base: "#c8371f", baseName: "Passata di pomodorini al forno.", top: "Pomodorini gialli e alici di Cetara.", kind: "estate" },
      pizzas: [
        { name: "Mare di Cetara", price: 16, img: "mare", desc: "Alici di Cetara, olive di Gaeta, capperi, colatura in uscita, limone." },
        { name: "Marinara del futuro", price: 12, img: "marinara", desc: "Tre pomodori in tre cotture, aglio nero, origano fresco." },
        { name: "Orto d'agosto", price: 14, img: "salame-rucola", desc: "Melanzana affumicata, pomodorino, basilico, cacioricotta del Cilento." }
      ] },
    { id: "autunno", label: "Autunno", months: [8, 9, 10], range: "settembre – novembre",
      seq: { base: "#e08a2c", baseName: "Crema di zucca arrostita.", top: "Funghi cardoncelli e nocciole di Giffoni.", kind: "autunno" },
      pizzas: [
        { name: "Bosco e zucca", price: 15, img: "zucca", desc: "Crema di zucca, cardoncelli, fior di latte, nocciole di Giffoni tostate." },
        { name: "Verde d'ottobre", price: 14, img: "ortolana", desc: "Scarola ripassata, ricotta di bufala, uvetta, pinoli, alici." },
        { name: "Fichi e crudo", price: 16, img: "crudo", desc: "Fichi bianchi del Cilento, crudo di Pietraroja, rucola, provola." }
      ] }
  ],
  /* minuti dalla mezzanotte; >1440 = dopo mezzanotte (giorno seguente) — 0 = domenica */
  hours: {
    0: [[750, 900], [1140, 1440]],
    1: [],
    2: [[1140, 1440]],
    3: [[1140, 1440]],
    4: [[750, 900], [1140, 1440]],
    5: [[750, 900], [1140, 1470]],
    6: [[750, 900], [1140, 1470]]
  },
  slots: {
    pranzo: ["12:30", "13:00", "13:30", "14:00"],
    cena: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]
  }
};
