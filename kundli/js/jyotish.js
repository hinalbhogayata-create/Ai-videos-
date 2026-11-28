/*
 * jyotish.js — पाराशरी नियम: राशि, नक्षत्र, गृह-बल, विंशोत्तरी दशा, योग, पंचांग
 */
(function (root) {
  "use strict";
  const A = root.Astro || (typeof require !== "undefined" ? require("./astro.js") : null);

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
  const ORD = (h) => ORDN[h - 1];
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
    if (EXALT[p] && EXALT[p][0] === sign) return { key: "exalt", label: "उच्च", score: 5 };
    if (EXALT[p] && (EXALT[p][0] + 6) % 12 === sign) return { key: "debil", label: "नीच", score: -5 };
    if (MOOLA[p] && MOOLA[p][0] === sign && deg >= MOOLA[p][1] && deg < MOOLA[p][2]) return { key: "moola", label: "मूलत्रिकोण", score: 4 };
    if (OWN[p] && OWN[p].includes(sign)) return { key: "own", label: "स्वराशि", score: 3 };
    const lord = RASHI_LORD[sign];
    const fr = FRIENDS[p];
    if (lord === p) return { key: "own", label: "स्वराशि", score: 3 };
    if (fr.f.includes(lord)) return { key: "friend", label: "मित्र राशि", score: 1 };
    if (fr.e.includes(lord)) return { key: "enemy", label: "शत्रु राशि", score: -2 };
    return { key: "neutral", label: "सम राशि", score: 0 };
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
    const paksha = tIdx < 15 ? "शुक्ल पक्ष" : "कृष्ण पक्ष";
    const t = tIdx % 15;
    const tithiName = t === 14 ? (tIdx < 15 ? "पूर्णिमा" : "अमावस्या") : TITHI[t];
    const yIdx = Math.floor(norm(sunLon + moonLon) / (360 / 27));
    const k = Math.floor(diff / 6);
    let karana;
    if (k === 0) karana = "किंस्तुघ्न";
    else if (k >= 57) karana = ["शकुनि", "चतुष्पद", "नाग"][k - 57];
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
      nakshatra: `${nk.name} (चरण ${nk.pada})`, nakLord: GRAHA[nk.lord],
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
  function detectYogas(r) {
    const P = r.planets, Y = [];
    const kendra = [1, 4, 7, 10], trikona = [1, 5, 9], dusthana = [6, 8, 12];
    const fromMoon = (p) => houseFrom(P.Moon.sign, P[p].sign);
    const lordOf = (h) => r.houses[h - 1].lord;
    const same = (a, b) => P[a].sign === P[b].sign;

    // गजकेसरी
    if (kendra.includes(fromMoon("Jupiter")) && P.Jupiter.dignity.key !== "debil")
      Y.push({ name: "गजकेसरी योग", good: true, text: "गुरु चन्द्रमा से केन्द्र में है। पाराशर के अनुसार ऐसा जातक तेजस्वी, धनवान, मेधावी, गुणी और राजप्रिय होता है; समाज में यश और स्थायी प्रतिष्ठा मिलती है।" });

    // पंच महापुरुष
    const MP = { Mars: ["रुचक", "साहसी, बलवान, सेनापति/नेतृत्व के गुण, भूमि-वाहन का स्वामी, शत्रुओं पर विजयी"], Mercury: ["भद्र", "बुद्धिमान, वाक्पटु, विद्वान, व्यापार-लेखन में निपुण, दीर्घायु"], Jupiter: ["हंस", "धर्मात्मा, ज्ञानी, सुन्दर, सम्मानित, सात्विक, गुरुजनों और शास्त्रों में आस्था"], Venus: ["मालव्य", "सुखी, ऐश्वर्यशाली, कलाप्रिय, सुन्दर जीवनसाथी, वाहन व भोग-विलास से युक्त"], Saturn: ["शश", "परिश्रमी, जन-नेता, प्रशासन में अधिकार, सेवकों से युक्त, न्यायप्रिय"] };
    for (const p in MP) {
      const x = P[p];
      if (kendra.includes(x.house) && ["exalt", "own", "moola"].includes(x.dignity.key))
        Y.push({ name: `${MP[p][0]} योग (पंच महापुरुष)`, good: true, text: `${GRAHA[p]} केन्द्र (${ORD(x.house)} भाव) में ${x.dignity.label} है। फल: ${MP[p][1]}।` });
    }
    // बुधादित्य
    if (same("Sun", "Mercury") && !P.Mercury.combust)
      Y.push({ name: "बुधादित्य योग", good: true, text: "सूर्य-बुध की युति (बुध अस्त नहीं)। जातक बुद्धिमान, कुशल वक्ता, शिक्षा में श्रेष्ठ और कार्यकुशल होता है।" });
    else if (same("Sun", "Mercury"))
      Y.push({ name: "बुधादित्य योग (आंशिक)", good: true, text: "सूर्य-बुध युति है, परन्तु बुध अस्त होने से योग का फल कुछ कम मिलेगा; बुद्धि तीव्र किन्तु निर्णय में जल्दबाज़ी सम्भव।" });
    // चन्द्र-मंगल
    if (same("Moon", "Mars"))
      Y.push({ name: "चन्द्र-मंगल (लक्ष्मी) योग", good: true, text: "चन्द्र-मंगल युति धन कमाने की प्रबल क्षमता देती है; व्यापार और साहसिक कार्यों से लाभ, परन्तु स्वभाव में उग्रता भी।" });
    // सुनफा/अनफा/दुरुधरा/केमद्रुम
    const cands = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const in2 = cands.filter((p) => fromMoon(p) === 2), in12 = cands.filter((p) => fromMoon(p) === 12);
    if (in2.length && in12.length) Y.push({ name: "दुरुधरा योग", good: true, text: `चन्द्रमा के दोनों ओर ग्रह (${in2.concat(in12).map((p) => GRAHA[p]).join(", ")})। जातक दानी, धनी, वाहन-सुख युक्त और प्रसिद्ध होता है।` });
    else if (in2.length) Y.push({ name: "सुनफा योग", good: true, text: `चन्द्रमा से द्वितीय में ${in2.map((p) => GRAHA[p]).join(", ")}। स्व-अर्जित धन, बुद्धि और प्रतिष्ठा देता है।` });
    else if (in12.length) Y.push({ name: "अनफा योग", good: true, text: `चन्द्रमा से द्वादश में ${in12.map((p) => GRAHA[p]).join(", ")}। सुन्दर व्यक्तित्व, सुख-साधन और अच्छा स्वास्थ्य देता है।` });
    else {
      const withMoon = cands.some((p) => same(p, "Moon"));
      const kendraFromLagna = cands.some((p) => kendra.includes(P[p].house)) || kendra.includes(P.Moon.house);
      if (!withMoon) Y.push({ name: "केमद्रुम योग", good: false, cancelled: kendraFromLagna, text: kendraFromLagna ? "चन्द्रमा के दोनों ओर कोई ग्रह नहीं, परन्तु केन्द्र में ग्रह होने से केमद्रुम भंग है — दोष का प्रभाव बहुत कम रहेगा।" : "चन्द्रमा के आगे-पीछे कोई ग्रह नहीं। मन में अस्थिरता, संघर्ष और आर्थिक उतार-चढ़ाव की सम्भावना। उपाय: सोमवार व्रत, शिव-आराधना।" });
    }
    // राजयोग — केन्द्रेश + त्रिकोणेश युति / परिवर्तन
    const seen = new Set(), raja = [];
    for (const k of [4, 7, 10, 1]) for (const t of [5, 9]) {
      const a = lordOf(k), b = lordOf(t);
      if (a === b) {
        if (k !== 1 && !seen.has("yk" + a)) { seen.add("yk" + a); Y.push({ name: `योगकारक ${GRAHA[a]}`, good: true, text: `${GRAHA[a]} केन्द्र (${k}) और त्रिकोण (${t}) दोनों का स्वामी होने से योगकारक है। इसकी दशा में विशेष उन्नति, पद और धन प्राप्ति होती है।` }); }
        continue;
      }
      const key = [a, b].sort().join("-");
      if (seen.has(key)) continue;
      if (same(a, b)) { seen.add(key); raja.push(`${ORD(k)} भाव के स्वामी ${GRAHA[a]} + ${ORD(t)} भाव के स्वामी ${GRAHA[b]} की युति (${ORD(P[a].house)} भाव में)`); }
      else if (RASHI_LORD[P[a].sign] === b && RASHI_LORD[P[b].sign] === a) { seen.add(key); Y.push({ name: "राजयोग (परिवर्तन)", good: true, text: `${ORD(k)} और ${ORD(t)} भाव के स्वामियों ${GRAHA[a]}-${GRAHA[b]} में राशि परिवर्तन है — प्रबल राजयोग।` }); }
    }
    if (raja.length) Y.push({ name: raja.length > 1 ? `राजयोग (केन्द्र-त्रिकोण) × ${raja.length}` : "राजयोग (केन्द्र-त्रिकोण)", good: true, text: raja.join("; ") + "। पाराशर (BPHS अ. 41) के अनुसार केन्द्रेश-त्रिकोणेश का सम्बन्ध पद, सत्ता और सम्मान देता है, विशेषकर इन ग्रहों की दशा-अन्तर्दशा में।" });
    // धन योग
    for (const d of [2, 11]) for (const t of [5, 9]) {
      const a = lordOf(d), b = lordOf(t);
      if (a !== b && same(a, b)) { const key = "dh" + [a, b].sort().join(); if (!seen.has(key)) { seen.add(key); Y.push({ name: "धन योग", good: true, text: `${ORD(d)} भाव के स्वामी ${GRAHA[a]} व ${ORD(t)} के स्वामी ${GRAHA[b]} की युति — धन-संचय और आर्थिक समृद्धि का योग।` }); } }
    }
    // विपरीत राजयोग
    const vr = { 6: "हर्ष", 8: "सरल", 12: "विमल" };
    for (const h of dusthana) {
      const l = lordOf(h);
      if (dusthana.includes(P[l].house)) Y.push({ name: `${vr[h]} विपरीत राजयोग`, good: true, text: `${ORD(h)} भाव का स्वामी ${GRAHA[l]} ${ORD(P[l].house)} (दुःस्थान) में है। कठिनाइयों के बाद अचानक उन्नति; शत्रु स्वयं नष्ट होते हैं।` });
    }
    // अमला
    const tenth = r.houses[9].occupants.filter((p) => ["Jupiter", "Venus", "Mercury"].includes(p));
    if (tenth.length) Y.push({ name: "अमला योग", good: true, text: `दशम भाव में शुभ ग्रह (${tenth.map((p) => GRAHA[p]).join(", ")})। निर्मल कीर्ति, सदाचार और कार्यक्षेत्र में स्थायी यश।` });
    // नीचभंग
    for (const p of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]) {
      if (P[p].dignity.key !== "debil") continue;
      const dl = RASHI_LORD[P[p].sign];
      const exLordSign = EXALT[p][0], el = RASHI_LORD[exLordSign];
      if (kendra.includes(P[dl].house) || kendra.includes(P[el].house) || kendra.includes(houseFrom(P.Moon.sign, P[dl].sign)))
        Y.push({ name: `नीचभंग राजयोग (${GRAHA[p]})`, good: true, text: `${GRAHA[p]} नीच है, किन्तु उसकी नीच राशि का स्वामी/उच्च राशि का स्वामी केन्द्र में होने से नीचभंग हुआ। आरम्भ में संघर्ष, फिर उल्लेखनीय सफलता।` });
    }
    // मांगलिक
    const mH = P.Mars.house, mM = fromMoon("Mars");
    const mangHouses = [1, 2, 4, 7, 8, 12];
    if (mangHouses.includes(mH) || mangHouses.includes(mM)) {
      const cancel = ["own", "exalt", "moola"].includes(P.Mars.dignity.key);
      const both = mangHouses.includes(mH) && mangHouses.includes(mM);
      Y.push({ name: "मांगलिक दोष", good: false, cancelled: cancel, text: `मंगल लग्न से ${ORD(mH)}${mangHouses.includes(mM) ? ` और चन्द्र से ${ORD(mM)}` : ""} भाव में है${both ? " (दोनों से — प्रबल)" : " (आंशिक)"}।${cancel ? " मंगल स्वराशि/उच्च होने से दोष का परिहार होता है।" : ""} विवाह हेतु मांगलिक जीवनसाथी से मिलान उत्तम। उपाय: हनुमान उपासना, मंगलवार व्रत। (28 वर्ष के बाद प्रभाव कम माना जाता है।)` });
    }
    // काल सर्प
    const rahu = P.Rahu.lon;
    const seven = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map((p) => norm(P[p].lon - rahu));
    if (seven.every((x) => x < 180) || seven.every((x) => x > 180))
      Y.push({ name: "काल सर्प योग", good: false, text: `सभी सात ग्रह राहु-केतु अक्ष के एक ओर हैं (राहु ${ORD(P.Rahu.house)} भाव में)। जीवन में अचानक उतार-चढ़ाव व विलम्ब, परन्तु परिश्रम से बड़ी सफलता भी। उपाय: महामृत्युंजय जप, नाग पंचमी पूजन। (नोट: यह योग पाराशर होरा शास्त्र में वर्णित नहीं, बाद की परम्परा का है।)` });
    // ग्रहण योग
    for (const n of ["Rahu", "Ketu"]) for (const l of ["Sun", "Moon"]) if (same(n, l))
      Y.push({ name: `ग्रहण योग (${GRAHA[l]}-${GRAHA[n]})`, good: false, text: `${GRAHA[l]} के साथ ${GRAHA[n]}। ${l === "Sun" ? "पिता/सरकारी क्षेत्र और आत्मविश्वास" : "मन, माता और भावनात्मक शान्ति"} के विषय में बाधाएँ। उपाय: ${l === "Sun" ? "आदित्य हृदय स्तोत्र" : "शिव जलाभिषेक, ॐ सोमाय नमः"}।` });
    // गुरु चाण्डाल
    if (same("Jupiter", "Rahu")) Y.push({ name: "गुरु चाण्डाल योग", good: false, text: "गुरु-राहु युति। धर्म, गुरु और नैतिक निर्णयों में भ्रम; परन्तु अपरम्परागत ज्ञान व विदेश से लाभ भी सम्भव। उपाय: गुरुवार व्रत, विष्णु सहस्रनाम।" });
    // शकट
    const jm = fromMoon("Jupiter");
    if ([6, 8, 12].includes(jm) && !kendra.includes(P.Moon.house)) Y.push({ name: "शकट योग", good: false, text: "गुरु चन्द्रमा से 6/8/12 में। भाग्य पहिये की तरह ऊपर-नीचे होता रहता है; धैर्य रखें।" });
    // सरस्वती
    const sv = ["Jupiter", "Venus", "Mercury"].every((p) => [1, 2, 4, 5, 7, 9, 10].includes(P[p].house));
    if (sv && ["exalt", "own", "moola", "friend"].includes(P.Jupiter.dignity.key)) Y.push({ name: "सरस्वती योग", good: true, text: "गुरु, शुक्र, बुध केन्द्र/त्रिकोण/द्वितीय में तथा गुरु बलवान। विद्वत्ता, कला, काव्य और वाणी में असाधारण प्रतिभा।" });
    // लक्ष्मी योग
    const l9 = lordOf(9);
    if ((kendra.includes(P[l9].house) || trikona.includes(P[l9].house)) && ["exalt", "own", "moola"].includes(P[l9].dignity.key) && ["exalt", "own", "moola", "friend"].includes(P[lordOf(1)].dignity.key))
      Y.push({ name: "लक्ष्मी योग", good: true, text: `भाग्येश ${GRAHA[l9]} केन्द्र/त्रिकोण में स्वराशि/उच्च तथा लग्नेश बलवान। लक्ष्मी की कृपा, वैभव, उत्तम कुल और कीर्ति।` });
    return Y;
  }

  // ------------- वर्तमान गोचर / साढ़ेसाती -------------
  function transitInfo(r) {
    const nowJd = A.dateToJd(new Date());
    const pos = A.siderealPositionsAt(nowJd);
    const sat = Math.floor(pos.Saturn / 30), jup = Math.floor(pos.Jupiter / 30);
    const fm = houseFrom(r.moonSign, sat);
    let sadeSati = null;
    if (fm === 12) sadeSati = "साढ़ेसाती का प्रथम चरण (उदय) चल रहा है — खर्च, भागदौड़ और मानसिक चिन्ता बढ़ सकती है।";
    else if (fm === 1) sadeSati = "साढ़ेसाती का द्वितीय चरण (शिखर) चल रहा है — स्वास्थ्य, मन और कार्य पर दबाव; धैर्य और परिश्रम से फल मिलेगा।";
    else if (fm === 2) sadeSati = "साढ़ेसाती का तृतीय चरण (अस्त) चल रहा है — परिवार और धन संबंधी परीक्षा, फिर स्थिरता।";
    let dhaiya = null;
    if (fm === 4) dhaiya = "शनि की ढैय्या (चतुर्थ — कण्टक शनि) चल रही है — घर, माता, सम्पत्ति और मन की शान्ति पर ध्यान दें।";
    if (fm === 8) dhaiya = "शनि की ढैय्या (अष्टम शनि) चल रही है — स्वास्थ्य और अचानक बाधाओं से सावधान रहें।";
    const jm = houseFrom(r.moonSign, jup);
    const jupGood = [2, 5, 7, 9, 11].includes(jm);
    return { nowJd, pos, satSign: sat, jupSign: jup, satFromMoon: fm, jupFromMoon: jm, sadeSati, dhaiya, jupGood };
  }

  const J = {
    RASHI, RASHI_SHORT, RASHI_LORD, GRAHA, GRAHA_SHORT, NAKSHATRA, DASHA_ORDER, DASHA_YEARS, YEAR_DAYS,
    NATURAL_BENEFIC, NATURAL_MALEFIC, ORD, FRIENDS, NAK_GANA, NAK_YONI, NAK_AKSHAR, RASHI_NATURE, analyze, nakshatraOf, dignity, vimshottari, findCurrent, houseFrom, dms, norm,
  };
  root.Jyotish = J;
  if (typeof module !== "undefined") module.exports = J;
})(typeof window !== "undefined" ? window : globalThis);
