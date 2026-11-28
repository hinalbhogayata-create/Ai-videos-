/*
 * jyotish.js — पाराशरी नियम: राशि, नक्षत्र, गृह-बल, विंशोत्तरी दशा, योग, पंचांग
 */
(function (root) {
  "use strict";
  const A = root.Astro || (typeof require !== "undefined" ? require("./astro.js") : null);
  const L = (hi, en) => (root.I18N && root.I18N.lang === "en" ? en : hi);

  const RASHI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"];
  const RASHI_SHORT = ["मे", "वृ", "मि", "क", "सिं", "क", "तु", "वृ", "ध", "म", "कु", "मी"];
  const RASHI_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  const RASHI_TATTVA = ["अग्नि", "पृथ्वी", "वायु", "जल"];
  const RASHI_NATURE = ["चर", "स्थिर", "द्विस्वभाव"];

  const GRAHA = { Sun: "सूर्य", Moon: "चन्द्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" };
  const GRAHA_SHORT = { Sun: "सू", Moon: "चं", Mars: "मं", Mercury: "बु", Jupiter: "गु", Venus: "शु", Saturn: "श", Rahu: "रा", Ketu: "के" };
  const NATURAL_BENEFIC = { Jupiter: 1, Venus: 1, Mercury: 1, Moon: 1 };
  const NATURAL_MALEFIC = { Sun: 1, Mars: 1, Saturn: 1, Rahu: 1, Ketu: 1 };

  // उच्च राशि व परम उच्च अंश (BPHS अध्याय 3)
  const EXALT = { Sun: [0, 10], Moon: [1, 3], Mars: [9, 28], Mercury: [5, 15], Jupiter: [3, 5], Venus: [11, 27], Saturn: [6, 20], Rahu: [1, 20], Ketu: [7, 20] };
  const MOOLA = { Sun: [4, 0, 20], Moon: [1, 3, 30], Mars: [0, 0, 12], Mercury: [5, 15, 20], Jupiter: [8, 0, 10], Venus: [6, 0, 15], Saturn: [10, 0, 20] };
  const OWN = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10], Rahu: [10], Ketu: [7] };
  // नैसर्गिक मैत्री (BPHS)
  const FRIENDS = {
    Sun: { f: ["Moon", "Mars", "Jupiter"], n: ["Mercury"], e: ["Venus", "Saturn"] },
    Moon: { f: ["Sun", "Mercury"], n: ["Mars", "Jupiter", "Venus", "Saturn"], e: [] },
    Mars: { f: ["Sun", "Moon", "Jupiter"], n: ["Venus", "Saturn"], e: ["Mercury"] },
    Mercury: { f: ["Sun", "Venus"], n: ["Mars", "Jupiter", "Saturn"], e: ["Moon"] },
    Jupiter: { f: ["Sun", "Moon", "Mars"], n: ["Saturn"], e: ["Mercury", "Venus"] },
    Venus: { f: ["Mercury", "Saturn"], n: ["Mars", "Jupiter"], e: ["Sun", "Moon"] },
    Saturn: { f: ["Mercury", "Venus"], n: ["Jupiter"], e: ["Sun", "Moon", "Mars"] },
    Rahu: { f: ["Mercury", "Venus", "Saturn"], n: ["Jupiter"], e: ["Sun", "Moon", "Mars"] },
    Ketu: { f: ["Mars", "Venus", "Saturn"], n: ["Mercury", "Jupiter"], e: ["Sun", "Moon"] },
  };
  // अस्त अंश
  const COMBUST = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };

  const NAKSHATRA = ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वा भाद्रपद", "उत्तरा भाद्रपद", "रेवती"];
  const NAK_GANA = ["देव", "मनुष्य", "राक्षस", "मनुष्य", "देव", "मनुष्य", "देव", "देव", "राक्षस", "राक्षस", "मनुष्य", "मनुष्य", "देव", "राक्षस", "देव", "राक्षस", "देव", "राक्षस", "राक्षस", "मनुष्य", "मनुष्य", "देव", "राक्षस", "राक्षस", "मनुष्य", "मनुष्य", "देव"];
  const NAK_YONI = ["अश्व", "गज", "मेष", "सर्प", "सर्प", "श्वान", "मार्जार", "मेष", "मार्जार", "मूषक", "मूषक", "गौ", "महिष", "व्याघ्र", "महिष", "व्याघ्र", "मृग", "मृग", "श्वान", "वानर", "नकुल", "वानर", "सिंह", "अश्व", "सिंह", "गौ", "गज"];
  const NAK_NADI = ["आदि", "मध्य", "अन्त्य"];
  const NAK_DEITY = ["अश्विनी कुमार", "यम", "अग्नि", "ब्रह्मा", "चन्द्र", "रुद्र", "अदिति", "बृहस्पति", "सर्प", "पितर", "भग", "अर्यमा", "सविता", "विश्वकर्मा", "वायु", "इन्द्राग्नि", "मित्र", "इन्द्र", "निऋति", "आपः", "विश्वेदेव", "विष्णु", "वसु", "वरुण", "अजैकपाद", "अहिर्बुध्न्य", "पूषा"];
  // नामाक्षर (प्रत्येक नक्षत्र के 4 चरण)
  const NAK_AKSHAR = [
    ["चू", "चे", "चो", "ला"], ["ली", "लू", "ले", "लो"], ["अ", "ई", "उ", "ए"], ["ओ", "वा", "वी", "वू"], ["वे", "वो", "का", "की"],
    ["कु", "घ", "ङ", "छ"], ["के", "को", "हा", "ही"], ["हु", "हे", "हो", "डा"], ["डी", "डू", "डे", "डो"], ["मा", "मी", "मू", "मे"],
    ["मो", "टा", "टी", "टू"], ["टे", "टो", "पा", "पी"], ["पू", "ष", "ण", "ठ"], ["पे", "पो", "रा", "री"], ["रू", "रे", "रो", "ता"],
    ["ती", "तू", "ते", "तो"], ["ना", "नी", "नू", "ने"], ["नो", "या", "यी", "यू"], ["ये", "यो", "भा", "भी"], ["भू", "धा", "फा", "ढा"],
    ["भे", "भो", "जा", "जी"], ["खी", "खू", "खे", "खो"], ["गा", "गी", "गु", "गे"], ["गो", "सा", "सी", "सू"], ["से", "सो", "दा", "दी"],
    ["दू", "थ", "झ", "ञ"], ["दे", "दो", "चा", "ची"],
  ];
  const RASHI_VARNA = ["क्षत्रिय", "वैश्य", "शूद्र", "ब्राह्मण"];
  const RASHI_VASHYA = ["चतुष्पद", "चतुष्पद", "द्विपद", "जलचर", "वनचर", "द्विपद", "द्विपद", "कीट", "द्विपद/चतुष्पद", "चतुष्पद/जलचर", "द्विपद", "जलचर"];

  // विंशोत्तरी
  const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  const YEAR_DAYS = 365.2425;

  const TITHI = ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी"];
  const YOGA_P = ["विष्कुम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान", "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"];
  const KARANA = ["बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)"];
  const VAAR = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

  const ORDN = ["प्रथम", "द्वितीय", "तृतीय", "चतुर्थ", "पंचम", "षष्ठ", "सप्तम", "अष्टम", "नवम", "दशम", "एकादश", "द्वादश"];

  // ---------- English नाम-सूचियाँ (भाषा बदलने पर ऊपर की सूचियाँ इन्हीं स्थानों पर बदल दी जाती हैं) ----------
  const EN = {
    RASHI: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
    RASHI_TATTVA: ["Fire", "Earth", "Air", "Water"],
    RASHI_NATURE: ["Movable", "Fixed", "Dual"],
    GRAHA: { Sun: "Sun", Moon: "Moon", Mars: "Mars", Mercury: "Mercury", Jupiter: "Jupiter", Venus: "Venus", Saturn: "Saturn", Rahu: "Rahu", Ketu: "Ketu" },
    GRAHA_SHORT: { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" },
    NAKSHATRA: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
    NAK_NADI: ["Adi", "Madhya", "Antya"],
    NAK_DEITY: ["Ashwini Kumaras", "Yama", "Agni", "Brahma", "Soma (Chandra)", "Rudra", "Aditi", "Brihaspati", "Sarpa (Nagas)", "Pitris", "Bhaga", "Aryaman", "Savitar", "Vishvakarma", "Vayu", "Indra-Agni", "Mitra", "Indra", "Nirriti", "Apas", "Vishvedevas", "Vishnu", "Vasus", "Varuna", "Aja Ekapada", "Ahirbudhnya", "Pushan"],
    NAK_AKSHAR: [["Chu", "Che", "Cho", "La"], ["Li", "Lu", "Le", "Lo"], ["A", "I", "U", "E"], ["O", "Va", "Vi", "Vu"], ["Ve", "Vo", "Ka", "Ki"], ["Ku", "Gha", "Na", "Chha"], ["Ke", "Ko", "Ha", "Hi"], ["Hu", "He", "Ho", "Da"], ["Di", "Du", "De", "Do"], ["Ma", "Mi", "Mu", "Me"], ["Mo", "Ta", "Ti", "Tu"], ["Te", "To", "Pa", "Pi"], ["Pu", "Sha", "Na", "Tha"], ["Pe", "Po", "Ra", "Ri"], ["Ru", "Re", "Ro", "Ta"], ["Ti", "Tu", "Te", "To"], ["Na", "Ni", "Nu", "Ne"], ["No", "Ya", "Yi", "Yu"], ["Ye", "Yo", "Bha", "Bhi"], ["Bhu", "Dha", "Pha", "Dha"], ["Bhe", "Bho", "Ja", "Ji"], ["Khi", "Khu", "Khe", "Kho"], ["Ga", "Gi", "Gu", "Ge"], ["Go", "Sa", "Si", "Su"], ["Se", "So", "Da", "Di"], ["Du", "Tha", "Jha", "Na"], ["De", "Do", "Cha", "Chi"]],
    RASHI_VARNA: ["Kshatriya", "Vaishya", "Shudra", "Brahmin"],
    RASHI_VASHYA: ["Chatushpada (quadruped)", "Chatushpada (quadruped)", "Dwipada (human)", "Jalachara (aquatic)", "Vanachara (wild)", "Dwipada (human)", "Dwipada (human)", "Keeta (insect)", "Dwipada / Chatushpada", "Chatushpada / Jalachara", "Dwipada (human)", "Jalachara (aquatic)"],
    TITHI: ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"],
    YOGA_P: ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"],
    KARANA: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)"],
    VAAR: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    ORDN: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"],
  };
  const GANA_EN = { "देव": "Deva", "मनुष्य": "Manushya", "राक्षस": "Rakshasa" };
  const YONI_EN = { "अश्व": "Horse", "गज": "Elephant", "मेष": "Sheep", "सर्प": "Serpent", "श्वान": "Dog", "मार्जार": "Cat", "मूषक": "Rat", "गौ": "Cow", "महिष": "Buffalo", "व्याघ्र": "Tiger", "मृग": "Deer", "वानर": "Monkey", "नकुल": "Mongoose", "सिंह": "Lion" };
  const GANA_IDX = [], YONI_IDX = []; // भाषा-निरपेक्ष सूचकांक (गुण मिलान हेतु)
  const ORD = (h) => ORDN[h - 1];
  const TABLES = { RASHI, RASHI_TATTVA, RASHI_NATURE, GRAHA, GRAHA_SHORT, NAKSHATRA, NAK_NADI, NAK_DEITY, NAK_AKSHAR, RASHI_VARNA, RASHI_VASHYA, TITHI, YOGA_P, KARANA, VAAR, ORDN };
  NAK_GANA.forEach((g) => GANA_IDX.push(["देव", "मनुष्य", "राक्षस"].indexOf(g)));
  NAK_YONI.forEach((y) => YONI_IDX.push(Object.keys(YONI_EN).indexOf(y)));
  EN.NAK_GANA = NAK_GANA.map((g) => GANA_EN[g]); EN.NAK_YONI = NAK_YONI.map((y) => YONI_EN[y]);
  TABLES.NAK_GANA = NAK_GANA; TABLES.NAK_YONI = NAK_YONI;
  const HI = JSON.parse(JSON.stringify(TABLES));
  function setLang(lang) {
    const src = lang === "en" ? EN : HI;
    for (const k in TABLES) {
      const t = TABLES[k], v = src[k];
      if (Array.isArray(t)) v.forEach((x, i) => { t[i] = Array.isArray(x) ? x.slice() : x; });
      else Object.assign(t, v);
    }
  }
  const norm = (x) => ((x % 360) + 360) % 360;
  const houseFrom = (fromSign, sign) => ((sign - fromSign + 12) % 12) + 1;

  function dms(deg) {
    const d = Math.floor(deg), mf = (deg - d) * 60, m = Math.floor(mf), s = Math.floor((mf - m) * 60);
    return `${d}° ${String(m).padStart(2, "0")}′ ${String(s).padStart(2, "0")}″`;
  }

  function nakshatraOf(lon) {
    const span = 360 / 27;
    const idx = Math.floor(lon / span);
    const within = lon - idx * span;
    const pada = Math.floor(within / (span / 4)) + 1;
    return { idx, name: NAKSHATRA[idx], pada, lord: DASHA_ORDER[idx % 9], fraction: within / span };
  }

  function dignity(p, sign, deg) {
    if (EXALT[p] && EXALT[p][0] === sign) return { key: "exalt", label: L("उच्च", "Exalted"), score: 5 };
    if (EXALT[p] && (EXALT[p][0] + 6) % 12 === sign) return { key: "debil", label: L("नीच", "Debilitated"), score: -5 };
    if (MOOLA[p] && MOOLA[p][0] === sign && deg >= MOOLA[p][1] && deg < MOOLA[p][2]) return { key: "moola", label: L("मूलत्रिकोण", "Moolatrikona"), score: 4 };
    if (OWN[p] && OWN[p].includes(sign)) return { key: "own", label: L("स्वराशि", "Own sign"), score: 3 };
    const lord = RASHI_LORD[sign];
    const fr = FRIENDS[p];
    if (lord === p) return { key: "own", label: L("स्वराशि", "Own sign"), score: 3 };
    if (fr.f.includes(lord)) return { key: "friend", label: L("मित्र राशि", "Friendly sign"), score: 1 };
    if (fr.e.includes(lord)) return { key: "enemy", label: L("शत्रु राशि", "Enemy sign"), score: -2 };
    return { key: "neutral", label: L("सम राशि", "Neutral sign"), score: 0 };
  }

  // ------------- विंशोत्तरी दशा -------------
  function vimshottari(moonLon, birthJd) {
    const nk = nakshatraOf(moonLon);
    const startIdx = DASHA_ORDER.indexOf(nk.lord);
    const balanceYears = DASHA_YEARS[nk.lord] * (1 - nk.fraction);
    // दशा का काल्पनिक आरम्भ (जन्म से पहले)
    let t = birthJd - (DASHA_YEARS[nk.lord] - balanceYears) * YEAR_DAYS;
    const list = [];
    for (let k = 0; k < 9 * 2; k++) {
      const lord = DASHA_ORDER[(startIdx + k) % 9];
      const len = DASHA_YEARS[lord] * YEAR_DAYS;
      const md = { lord, start: t, end: t + len, antar: [] };
      let at = t;
      const aStart = DASHA_ORDER.indexOf(lord);
      for (let j = 0; j < 9; j++) {
        const al = DASHA_ORDER[(aStart + j) % 9];
        const alen = len * DASHA_YEARS[al] / 120;
        const ad = { lord: al, start: at, end: at + alen, pratyantar: [] };
        let pt = at;
        for (let q = 0; q < 9; q++) {
          const pl = DASHA_ORDER[(DASHA_ORDER.indexOf(al) + q) % 9];
          const plen = alen * DASHA_YEARS[pl] / 120;
          ad.pratyantar.push({ lord: pl, start: pt, end: pt + plen });
          pt += plen;
        }
        md.antar.push(ad);
        at += alen;
      }
      list.push(md);
      t += len;
      if (t > birthJd + 120 * YEAR_DAYS) break;
    }
    return { balance: { lord: nk.lord, years: balanceYears }, list };
  }

  function findCurrent(dasha, jd) {
    for (const md of dasha.list) if (jd >= md.start && jd < md.end) {
      for (const ad of md.antar) if (jd >= ad.start && jd < ad.end) {
        for (const pd of ad.pratyantar) if (jd >= pd.start && jd < pd.end) return { md, ad, pd };
        return { md, ad };
      }
      return { md };
    }
    return null;
  }

  // ------------- पंचांग -------------
  function panchang(sunLon, moonLon, weekday) {
    const diff = norm(moonLon - sunLon);
    const tIdx = Math.floor(diff / 12);
    const paksha = tIdx < 15 ? L("शुक्ल पक्ष", "Shukla Paksha") : L("कृष्ण पक्ष", "Krishna Paksha");
    const t = tIdx % 15;
    const tithiName = t === 14 ? (tIdx < 15 ? L("पूर्णिमा", "Purnima") : L("अमावस्या", "Amavasya")) : TITHI[t];
    const yIdx = Math.floor(norm(sunLon + moonLon) / (360 / 27));
    const k = Math.floor(diff / 6);
    let karana;
    if (k === 0) karana = L("किंस्तुघ्न", "Kimstughna");
    else if (k >= 57) karana = L(["शकुनि", "चतुष्पद", "नाग"], ["Shakuni", "Chatushpada", "Naga"])[k - 57];
    else karana = KARANA[(k - 1) % 7];
    return { tithi: `${paksha} ${tithiName}`, tithiNum: tIdx + 1, paksha, yoga: YOGA_P[yIdx], karana, vaar: VAAR[weekday] };
  }

  // ------------- सम्पूर्ण विश्लेषण -------------
  function analyze(input) {
    const chart = A.computeChart(input);
    const lagnaSign = chart.ascendant.sign;
    const P = chart.planets;
    const sunLon = P.Sun.lon;

    const planets = {};
    for (const p of A.PLANETS) {
      const x = P[p];
      const house = houseFrom(lagnaSign, x.sign);
      const nk = nakshatraOf(x.lon);
      const dig = dignity(p, x.sign, x.deg);
      let combust = false;
      if (COMBUST[p]) {
        let lim = COMBUST[p];
        if (p === "Mercury" && x.retro) lim = 12;
        if (p === "Venus" && x.retro) lim = 8;
        const sep = Math.abs(norm(x.lon - sunLon + 180) - 180);
        combust = sep < lim;
      }
      const navSign = Math.floor(x.lon / (30 / 9)) % 12;
      planets[p] = { ...x, house, nak: nk, dignity: dig, combust, navamsa: navSign, vargottama: navSign === x.sign };
    }
    const ascNk = nakshatraOf(chart.ascendant.lon);
    const ascNav = Math.floor(chart.ascendant.lon / (30 / 9)) % 12;

    // भाव स्वामी
    const houses = [];
    for (let h = 1; h <= 12; h++) {
      const sign = (lagnaSign + h - 1) % 12;
      const lord = RASHI_LORD[sign];
      const occupants = A.PLANETS.filter((p) => planets[p].house === h);
      houses.push({ h, sign, lord, lordHouse: planets[lord].house, occupants });
    }

    const moonNk = nakshatraOf(P.Moon.lon);
    const dasha = vimshottari(P.Moon.lon, chart.jd);

    const wd = new Date(Date.UTC(input.year, input.month - 1, input.day)).getUTCDay();
    const pan = panchang(P.Sun.lon, P.Moon.lon, wd);
    const sun = A.sunriseSunset(input.year, input.month, input.day, input.lat, input.lon, input.tzOffsetMin);

    const res = {
      input, chart, lagnaSign, ascNk, ascNav, planets, houses, moonNk, dasha, panchang: pan, sun,
      moonSign: P.Moon.sign, sunSign: P.Sun.sign,
    };
    res.avakhada = avakhada(res);
    res.yogas = detectYogas(res);
    res.strength = planetStrength(res);
    res.transit = transitInfo(res);
    return res;
  }

  function avakhada(r) {
    const nk = r.moonNk, ms = r.moonSign;
    return {
      lagna: RASHI[r.lagnaSign], lagnaLord: GRAHA[RASHI_LORD[r.lagnaSign]],
      rashi: RASHI[ms], rashiLord: GRAHA[RASHI_LORD[ms]],
      nakshatra: `${nk.name} (${L("चरण", "Pada")} ${nk.pada})`, nakLord: GRAHA[nk.lord],
      gana: NAK_GANA[nk.idx], yoni: NAK_YONI[nk.idx],
      nadi: NAK_NADI[[0, 1, 2, 2, 1, 0][nk.idx % 6]],
      varna: RASHI_VARNA[ms % 4], // अग्नि→क्षत्रिय, पृथ्वी→वैश्य, वायु→शूद्र, जल→ब्राह्मण
      vashya: RASHI_VASHYA[ms],
      tattva: RASHI_TATTVA[ms % 4],
      namAkshar: NAK_AKSHAR[nk.idx][nk.pada - 1],
      deity: NAK_DEITY[nk.idx],
      sunSign: RASHI[r.sunSign],
    };
  }

  // ------------- ग्रह-बल (सरल अंक-पद्धति) -------------
  function planetStrength(r) {
    const out = {};
    for (const p of A.PLANETS) {
      const x = r.planets[p];
      let s = 50 + x.dignity.score * 7;
      if ([1, 4, 7, 10].includes(x.house)) s += 10;
      if ([5, 9].includes(x.house)) s += 8;
      if ([6, 8, 12].includes(x.house)) s -= 10;
      if (x.combust) s -= 15;
      if (x.vargottama) s += 8;
      if (x.retro && p !== "Rahu" && p !== "Ketu") s += 5; // चेष्टा बल
      // दिग्बल
      const dig = { Sun: 10, Mars: 10, Jupiter: 1, Mercury: 1, Moon: 4, Venus: 4, Saturn: 7 };
      if (dig[p] === x.house) s += 8;
      out[p] = Math.max(5, Math.min(100, Math.round(s)));
    }
    return out;
  }

  // ------------- योग -------------
  // प्रत्येक योग में स्थायी id — भाषा बदलने पर भी अन्य मॉड्यूल id से पहचानते हैं
  function detectYogas(r) {
    const P = r.planets, Y = [];
    const G = GRAHA;
    const kendra = [1, 4, 7, 10], trikona = [1, 5, 9], dusthana = [6, 8, 12];
    const fromMoon = (p) => houseFrom(P.Moon.sign, P[p].sign);
    const lordOf = (h) => r.houses[h - 1].lord;
    const same = (a, b) => P[a].sign === P[b].sign;
    const list = (arr) => arr.map((p) => G[p]).join(", ");

    // गजकेसरी
    if (kendra.includes(fromMoon("Jupiter")) && P.Jupiter.dignity.key !== "debil")
      Y.push({ id: "gajakesari", name: L("गजकेसरी योग", "Gajakesari Yoga"), good: true, text: L("गुरु चन्द्रमा से केन्द्र में है। पाराशर के अनुसार ऐसा जातक तेजस्वी, धनवान, मेधावी, गुणी और राजप्रिय होता है; समाज में यश और स्थायी प्रतिष्ठा मिलती है।", "Jupiter is in a kendra from the Moon. According to Parashara such a native is radiant, wealthy, intelligent, virtuous and favoured by authority, earning lasting fame and respect.") });

    // पंच महापुरुष
    const MP = {
      Mars: ["ruchaka", L("रुचक", "Ruchaka"), L("साहसी, बलवान, सेनापति/नेतृत्व के गुण, भूमि-वाहन का स्वामी, शत्रुओं पर विजयी", "courageous, strong, a commander/leader, owner of land and vehicles, victorious over enemies")],
      Mercury: ["bhadra", L("भद्र", "Bhadra"), L("बुद्धिमान, वाक्पटु, विद्वान, व्यापार-लेखन में निपुण, दीर्घायु", "intelligent, eloquent, learned, skilled in trade and writing, long-lived")],
      Jupiter: ["hamsa", L("हंस", "Hamsa"), L("धर्मात्मा, ज्ञानी, सुन्दर, सम्मानित, सात्विक, गुरुजनों और शास्त्रों में आस्था", "righteous, wise, handsome, respected, sattvic, devoted to teachers and scriptures")],
      Venus: ["malavya", L("मालव्य", "Malavya"), L("सुखी, ऐश्वर्यशाली, कलाप्रिय, सुन्दर जीवनसाथी, वाहन व भोग-विलास से युक्त", "happy, prosperous, fond of the arts, blessed with a beautiful spouse, vehicles and comforts")],
      Saturn: ["shasha", L("शश", "Shasha"), L("परिश्रमी, जन-नेता, प्रशासन में अधिकार, सेवकों से युक्त, न्यायप्रिय", "hard-working, a leader of people, holds administrative authority, has many helpers, just")],
    };
    for (const p in MP) {
      const x = P[p];
      if (kendra.includes(x.house) && ["exalt", "own", "moola"].includes(x.dignity.key))
        Y.push({ id: MP[p][0], name: L(`${MP[p][1]} योग (पंच महापुरुष)`, `${MP[p][1]} Yoga (Pancha Mahapurusha)`), good: true, text: L(`${G[p]} केन्द्र (${ORD(x.house)} भाव) में ${x.dignity.label} है। फल: ${MP[p][2]}।`, `${G[p]} is ${x.dignity.label.toLowerCase()} in a kendra (${ORD(x.house)} house). Result: ${MP[p][2]}.`) });
    }
    // बुधादित्य
    if (same("Sun", "Mercury") && !P.Mercury.combust)
      Y.push({ id: "budhaditya", name: L("बुधादित्य योग", "Budhaditya Yoga"), good: true, text: L("सूर्य-बुध की युति (बुध अस्त नहीं)। जातक बुद्धिमान, कुशल वक्ता, शिक्षा में श्रेष्ठ और कार्यकुशल होता है।", "Sun–Mercury conjunction (Mercury not combust). The native is intelligent, a skilled speaker, excels in education and is efficient at work.") });
    else if (same("Sun", "Mercury"))
      Y.push({ id: "budhaditya", name: L("बुधादित्य योग (आंशिक)", "Budhaditya Yoga (partial)"), good: true, text: L("सूर्य-बुध युति है, परन्तु बुध अस्त होने से योग का फल कुछ कम मिलेगा; बुद्धि तीव्र किन्तु निर्णय में जल्दबाज़ी सम्भव।", "Sun–Mercury conjunction, but Mercury is combust, so the yoga gives reduced results: sharp intellect but possible haste in decisions.") });
    // चन्द्र-मंगल
    if (same("Moon", "Mars"))
      Y.push({ id: "chandramangal", name: L("चन्द्र-मंगल (लक्ष्मी) योग", "Chandra–Mangal (Lakshmi) Yoga"), good: true, text: L("चन्द्र-मंगल युति धन कमाने की प्रबल क्षमता देती है; व्यापार और साहसिक कार्यों से लाभ, परन्तु स्वभाव में उग्रता भी।", "Moon–Mars conjunction gives a strong capacity to earn; gains through business and bold ventures, though the temperament can be fiery.") });
    // सुनफा/अनफा/दुरुधरा/केमद्रुम
    const cands = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const in2 = cands.filter((p) => fromMoon(p) === 2), in12 = cands.filter((p) => fromMoon(p) === 12);
    if (in2.length && in12.length) Y.push({ id: "durudhara", name: L("दुरुधरा योग", "Durudhara Yoga"), good: true, text: L(`चन्द्रमा के दोनों ओर ग्रह (${list(in2.concat(in12))})। जातक दानी, धनी, वाहन-सुख युक्त और प्रसिद्ध होता है।`, `Planets on both sides of the Moon (${list(in2.concat(in12))}). The native is generous, wealthy, enjoys vehicles and becomes well known.`) });
    else if (in2.length) Y.push({ id: "sunapha", name: L("सुनफा योग", "Sunapha Yoga"), good: true, text: L(`चन्द्रमा से द्वितीय में ${list(in2)}। स्व-अर्जित धन, बुद्धि और प्रतिष्ठा देता है।`, `${list(in2)} in the 2nd from the Moon. Gives self-earned wealth, intelligence and reputation.`) });
    else if (in12.length) Y.push({ id: "anapha", name: L("अनफा योग", "Anapha Yoga"), good: true, text: L(`चन्द्रमा से द्वादश में ${list(in12)}। सुन्दर व्यक्तित्व, सुख-साधन और अच्छा स्वास्थ्य देता है।`, `${list(in12)} in the 12th from the Moon. Gives a pleasing personality, comforts and good health.`) });
    else {
      const withMoon = cands.some((p) => same(p, "Moon"));
      const kendraFromLagna = cands.some((p) => kendra.includes(P[p].house)) || kendra.includes(P.Moon.house);
      if (!withMoon) Y.push({ id: "kemadruma", name: L("केमद्रुम योग", "Kemadruma Yoga"), good: false, cancelled: kendraFromLagna, text: kendraFromLagna ? L("चन्द्रमा के दोनों ओर कोई ग्रह नहीं, परन्तु केन्द्र में ग्रह होने से केमद्रुम भंग है — दोष का प्रभाव बहुत कम रहेगा।", "No planets on either side of the Moon, but planets in kendras cancel Kemadruma — its effect will be very small.") : L("चन्द्रमा के आगे-पीछे कोई ग्रह नहीं। मन में अस्थिरता, संघर्ष और आर्थिक उतार-चढ़ाव की सम्भावना। उपाय: सोमवार व्रत, शिव-आराधना।", "No planets around the Moon. Possible restlessness of mind, struggle and financial ups and downs. Remedy: Monday fast, worship of Shiva.") });
    }
    // राजयोग — केन्द्रेश + त्रिकोणेश युति / परिवर्तन
    const seen = new Set(), raja = [];
    for (const k of [4, 7, 10, 1]) for (const t of [5, 9]) {
      const a = lordOf(k), b = lordOf(t);
      if (a === b) {
        if (k !== 1 && !seen.has("yk" + a)) { seen.add("yk" + a); Y.push({ id: "yogakaraka", planet: a, name: L(`योगकारक ${G[a]}`, `Yogakaraka ${G[a]}`), good: true, text: L(`${G[a]} केन्द्र (${k}) और त्रिकोण (${t}) दोनों का स्वामी होने से योगकारक है। इसकी दशा में विशेष उन्नति, पद और धन प्राप्ति होती है।`, `${G[a]} lords both a kendra (${k}) and a trikona (${t}), making it the yogakaraka. Its dasha brings special progress, position and wealth.`) }); }
        continue;
      }
      const key = [a, b].sort().join("-");
      if (seen.has(key)) continue;
      if (same(a, b)) { seen.add(key); raja.push(L(`${ORD(k)} भाव के स्वामी ${G[a]} + ${ORD(t)} भाव के स्वामी ${G[b]} की युति (${ORD(P[a].house)} भाव में)`, `${ORD(k)} lord ${G[a]} conjoins ${ORD(t)} lord ${G[b]} (in the ${ORD(P[a].house)} house)`)); }
      else if (RASHI_LORD[P[a].sign] === b && RASHI_LORD[P[b].sign] === a) { seen.add(key); Y.push({ id: "rajayoga", name: L("राजयोग (परिवर्तन)", "Raja Yoga (exchange)"), good: true, text: L(`${ORD(k)} और ${ORD(t)} भाव के स्वामियों ${G[a]}-${G[b]} में राशि परिवर्तन है — प्रबल राजयोग।`, `The ${ORD(k)} and ${ORD(t)} lords ${G[a]} and ${G[b]} exchange signs — a powerful Raja Yoga.`) }); }
    }
    if (raja.length) Y.push({ id: "rajayoga", name: raja.length > 1 ? L(`राजयोग (केन्द्र-त्रिकोण) × ${raja.length}`, `Raja Yoga (kendra–trikona) × ${raja.length}`) : L("राजयोग (केन्द्र-त्रिकोण)", "Raja Yoga (kendra–trikona)"), good: true, text: raja.join("; ") + L("। पाराशर (BPHS अ. 41) के अनुसार केन्द्रेश-त्रिकोणेश का सम्बन्ध पद, सत्ता और सम्मान देता है, विशेषकर इन ग्रहों की दशा-अन्तर्दशा में।", ". According to Parashara (BPHS), a link between kendra and trikona lords gives position, authority and honour, especially in the dashas of these planets.") });
    // धन योग
    for (const d of [2, 11]) for (const t of [5, 9]) {
      const a = lordOf(d), b = lordOf(t);
      if (a !== b && same(a, b)) { const key = "dh" + [a, b].sort().join(); if (!seen.has(key)) { seen.add(key); Y.push({ id: "dhana", name: L("धन योग", "Dhana Yoga"), good: true, text: L(`${ORD(d)} भाव के स्वामी ${G[a]} व ${ORD(t)} के स्वामी ${G[b]} की युति — धन-संचय और आर्थिक समृद्धि का योग।`, `${ORD(d)} lord ${G[a]} conjoins ${ORD(t)} lord ${G[b]} — a combination for accumulating wealth and prosperity.`) }); } }
    }
    // विपरीत राजयोग
    const vr = { 6: ["harsha", L("हर्ष", "Harsha")], 8: ["sarala", L("सरल", "Sarala")], 12: ["vimala", L("विमल", "Vimala")] };
    for (const h of dusthana) {
      const l = lordOf(h);
      if (dusthana.includes(P[l].house)) Y.push({ id: vr[h][0], name: L(`${vr[h][1]} विपरीत राजयोग`, `${vr[h][1]} Viparita Raja Yoga`), good: true, text: L(`${ORD(h)} भाव का स्वामी ${G[l]} ${ORD(P[l].house)} (दुःस्थान) में है। कठिनाइयों के बाद अचानक उन्नति; शत्रु स्वयं नष्ट होते हैं।`, `The ${ORD(h)} lord ${G[l]} is in the ${ORD(P[l].house)} house (a dusthana). Sudden rise after difficulties; enemies defeat themselves.`) });
    }
    // अमला
    const tenth = r.houses[9].occupants.filter((p) => ["Jupiter", "Venus", "Mercury"].includes(p));
    if (tenth.length) Y.push({ id: "amala", name: L("अमला योग", "Amala Yoga"), good: true, text: L(`दशम भाव में शुभ ग्रह (${list(tenth)})। निर्मल कीर्ति, सदाचार और कार्यक्षेत्र में स्थायी यश।`, `Benefic(s) in the 10th house (${list(tenth)}). Spotless reputation, virtuous conduct and lasting fame in one's work.`) });
    // नीचभंग
    for (const p of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]) {
      if (P[p].dignity.key !== "debil") continue;
      const dl = RASHI_LORD[P[p].sign];
      const el = RASHI_LORD[EXALT[p][0]];
      if (kendra.includes(P[dl].house) || kendra.includes(P[el].house) || kendra.includes(houseFrom(P.Moon.sign, P[dl].sign)))
        Y.push({ id: "neechabhanga", planet: p, name: L(`नीचभंग राजयोग (${G[p]})`, `Neechabhanga Raja Yoga (${G[p]})`), good: true, text: L(`${G[p]} नीच है, किन्तु उसकी नीच राशि का स्वामी/उच्च राशि का स्वामी केन्द्र में होने से नीचभंग हुआ। आरम्भ में संघर्ष, फिर उल्लेखनीय सफलता।`, `${G[p]} is debilitated, but the lord of its debilitation or exaltation sign is in a kendra, cancelling the debility. Struggle at first, then notable success.`) });
    }
    // मांगलिक
    const mH = P.Mars.house, mM = fromMoon("Mars");
    const mangHouses = [1, 2, 4, 7, 8, 12];
    if (mangHouses.includes(mH) || mangHouses.includes(mM)) {
      const cancel = ["own", "exalt", "moola"].includes(P.Mars.dignity.key);
      const both = mangHouses.includes(mH) && mangHouses.includes(mM);
      Y.push({ id: "manglik", strong: both, name: L("मांगलिक दोष", "Manglik Dosha"), good: false, cancelled: cancel, text: L(`मंगल लग्न से ${ORD(mH)}${mangHouses.includes(mM) ? ` और चन्द्र से ${ORD(mM)}` : ""} भाव में है${both ? " (दोनों से — प्रबल)" : " (आंशिक)"}।${cancel ? " मंगल स्वराशि/उच्च होने से दोष का परिहार होता है।" : ""} विवाह हेतु मांगलिक जीवनसाथी से मिलान उत्तम। उपाय: हनुमान उपासना, मंगलवार व्रत। (28 वर्ष के बाद प्रभाव कम माना जाता है।)`, `Mars is in the ${ORD(mH)} house from the Lagna${mangHouses.includes(mM) ? ` and the ${ORD(mM)} from the Moon` : ""}${both ? " (from both — strong)" : " (partial)"}.${cancel ? " Mars in its own/exaltation sign cancels the dosha." : ""} Matching with a Manglik partner is best. Remedy: Hanuman worship, Tuesday fast. (Its effect is considered to reduce after age 28.)`) });
    }
    // काल सर्प
    const rahu = P.Rahu.lon;
    const seven = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map((p) => norm(P[p].lon - rahu));
    if (seven.every((x) => x < 180) || seven.every((x) => x > 180))
      Y.push({ id: "kaalsarp", name: L("काल सर्प योग", "Kaal Sarp Yoga"), good: false, text: L(`सभी सात ग्रह राहु-केतु अक्ष के एक ओर हैं (राहु ${ORD(P.Rahu.house)} भाव में)। जीवन में अचानक उतार-चढ़ाव व विलम्ब, परन्तु परिश्रम से बड़ी सफलता भी।`, `All seven planets lie on one side of the Rahu–Ketu axis (Rahu in the ${ORD(P.Rahu.house)} house). Sudden ups and downs and delays, yet great success through effort.`) });
    // ग्रहण योग
    for (const n of ["Rahu", "Ketu"]) for (const l of ["Sun", "Moon"]) if (same(n, l))
      Y.push({ id: "grahan", name: L(`ग्रहण योग (${G[l]}-${G[n]})`, `Grahan Yoga (${G[l]}–${G[n]})`), good: false, text: L(`${G[l]} के साथ ${G[n]}। ${l === "Sun" ? "पिता/सरकारी क्षेत्र और आत्मविश्वास" : "मन, माता और भावनात्मक शान्ति"} के विषय में बाधाएँ।`, `${G[n]} with the ${G[l]}. Obstacles concerning ${l === "Sun" ? "father, government matters and self-confidence" : "the mind, mother and emotional peace"}.`) });
    // गुरु चाण्डाल
    if (same("Jupiter", "Rahu")) Y.push({ id: "guruchandal", name: L("गुरु चाण्डाल योग", "Guru Chandal Yoga"), good: false, text: L("गुरु-राहु युति। धर्म, गुरु और नैतिक निर्णयों में भ्रम; परन्तु अपरम्परागत ज्ञान व विदेश से लाभ भी सम्भव।", "Jupiter–Rahu conjunction. Confusion in dharma, with teachers and in moral choices; yet gains from unconventional knowledge and foreign lands are possible.") });
    // शकट
    const jm = fromMoon("Jupiter");
    if ([6, 8, 12].includes(jm) && !kendra.includes(P.Moon.house)) Y.push({ id: "shakat", name: L("शकट योग", "Shakata Yoga"), good: false, text: L("गुरु चन्द्रमा से 6/8/12 में। भाग्य पहिये की तरह ऊपर-नीचे होता रहता है; धैर्य रखें।", "Jupiter in the 6th/8th/12th from the Moon. Fortune rises and falls like a cart-wheel; patience is needed.") });
    // सरस्वती
    const sv = ["Jupiter", "Venus", "Mercury"].every((p) => [1, 2, 4, 5, 7, 9, 10].includes(P[p].house));
    if (sv && ["exalt", "own", "moola", "friend"].includes(P.Jupiter.dignity.key)) Y.push({ id: "saraswati", name: L("सरस्वती योग", "Saraswati Yoga"), good: true, text: L("गुरु, शुक्र, बुध केन्द्र/त्रिकोण/द्वितीय में तथा गुरु बलवान। विद्वत्ता, कला, काव्य और वाणी में असाधारण प्रतिभा।", "Jupiter, Venus and Mercury in kendras/trikonas/2nd with a strong Jupiter. Exceptional talent in learning, arts, poetry and speech.") });
    // लक्ष्मी योग
    const l9 = lordOf(9);
    if ((kendra.includes(P[l9].house) || trikona.includes(P[l9].house)) && ["exalt", "own", "moola"].includes(P[l9].dignity.key) && ["exalt", "own", "moola", "friend"].includes(P[lordOf(1)].dignity.key))
      Y.push({ id: "lakshmi", name: L("लक्ष्मी योग", "Lakshmi Yoga"), good: true, text: L(`भाग्येश ${G[l9]} केन्द्र/त्रिकोण में स्वराशि/उच्च तथा लग्नेश बलवान। लक्ष्मी की कृपा, वैभव, उत्तम कुल और कीर्ति।`, `The 9th lord ${G[l9]} is in its own/exaltation sign in a kendra/trikona and the Lagna lord is strong. Blessings of Lakshmi, affluence, noble family and fame.`) });
    return Y;
  }

  // ------------- वर्तमान गोचर / साढ़ेसाती -------------
  function transitInfo(r) {
    const nowJd = A.dateToJd(new Date());
    const pos = A.siderealPositionsAt(nowJd);
    const sat = Math.floor(pos.Saturn / 30), jup = Math.floor(pos.Jupiter / 30);
    const fm = houseFrom(r.moonSign, sat);
    let sadeSati = null;
    if (fm === 12) sadeSati = L("साढ़ेसाती का प्रथम चरण (उदय) चल रहा है — खर्च, भागदौड़ और मानसिक चिन्ता बढ़ सकती है।", "First phase of Sade Sati (rising) is running — expenses, running around and worry may increase.");
    else if (fm === 1) sadeSati = L("साढ़ेसाती का द्वितीय चरण (शिखर) चल रहा है — स्वास्थ्य, मन और कार्य पर दबाव; धैर्य और परिश्रम से फल मिलेगा।", "Second phase of Sade Sati (peak) is running — pressure on health, mind and work; patience and effort will bring results.");
    else if (fm === 2) sadeSati = L("साढ़ेसाती का तृतीय चरण (अस्त) चल रहा है — परिवार और धन संबंधी परीक्षा, फिर स्थिरता।", "Third phase of Sade Sati (setting) is running — tests in family and finances, then stability.");
    let dhaiya = null;
    if (fm === 4) dhaiya = L("शनि की ढैय्या (चतुर्थ — कण्टक शनि) चल रही है — घर, माता, सम्पत्ति और मन की शान्ति पर ध्यान दें।", "Saturn's Dhaiya (4th — Kantaka Shani) is running — take care of home, mother, property and peace of mind.");
    if (fm === 8) dhaiya = L("शनि की ढैय्या (अष्टम शनि) चल रही है — स्वास्थ्य और अचानक बाधाओं से सावधान रहें।", "Saturn's Dhaiya (8th Saturn) is running — be careful about health and sudden obstacles.");
    const jm = houseFrom(r.moonSign, jup);
    const jupGood = [2, 5, 7, 9, 11].includes(jm);
    return { nowJd, pos, satSign: sat, jupSign: jup, satFromMoon: fm, jupFromMoon: jm, sadeSati, dhaiya, jupGood };
  }

  const J = {
    RASHI, RASHI_SHORT, RASHI_LORD, GRAHA, GRAHA_SHORT, NAKSHATRA, DASHA_ORDER, DASHA_YEARS, YEAR_DAYS,
    NATURAL_BENEFIC, NATURAL_MALEFIC, ORD, FRIENDS, NAK_GANA, NAK_YONI, NAK_AKSHAR, RASHI_NATURE, GANA_IDX, YONI_IDX, setLang, L, analyze, nakshatraOf, dignity, vimshottari, findCurrent, houseFrom, dms, norm,
  };
  root.Jyotish = J;
  if (typeof module !== "undefined") module.exports = J;
})(typeof window !== "undefined" ? window : globalThis);
