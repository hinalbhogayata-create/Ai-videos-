/* app.js — UI, कुंडली चार्ट (उत्तर भारतीय शैली) और फलादेश रिपोर्ट (हिन्दी / English) */
(function () {
  "use strict";
  const A = window.Astro, J = window.Jyotish;
  const F = () => window.Phala;
  const G = J.GRAHA, ORD = J.ORD;
  const tt = (hi, en) => (window.I18N && window.I18N.lang === "en" ? en : hi);
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const BENEFIC = ["Jupiter", "Venus", "Mercury", "Moon"];
  const KENDRA = [1, 4, 7, 10], TRIKONA = [1, 5, 9], DUSTHANA = [6, 8, 12];
  let lastInput = null, lastTab = "sum";

  // ---------------- फ़ॉर्म ----------------
  const fmtOffset = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
  const place = window.PlaceSearch.bindPlace("");
  const formMsg = (t) => { const el = $("placeInfo"); el.innerHTML = t; el.hidden = false; el.classList.add("err"); setTimeout(() => el.classList.remove("err"), 1200); };

  $("demoBtn").addEventListener("click", () => {
    $("name").value = tt("उदाहरण जातक", "Sample native");
    $("gender").value = "M";
    $("dob").value = "1990-03-21";
    $("tob").value = "14:30";
    place.setCity("मुंबई");
    $("birthForm").requestSubmit();
  });

  $("birthForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!place.ensure()) { formMsg(tt("⚠️ यह स्थान सूची में नहीं मिला। पास के बड़े शहर का नाम लिखकर सूची से चुनें, या “अक्षांश · देशान्तर” खोलकर स्वयं भरें।", "⚠️ This place was not found. Type a nearby larger town and pick it from the list, or open “Latitude · Longitude” and fill it in.")); return; }
    const [y, m, d] = $("dob").value.split("-").map(Number);
    const [hh, mm] = $("tob").value.split(":").map(Number);
    const data = {
      name: $("name").value.trim() || tt("जातक", "Native"), gender: $("gender").value,
      year: y, month: m, day: d, hour: hh, minute: mm,
      lat: parseFloat($("lat").value), lon: parseFloat($("lon").value),
      tzOffsetMin: Math.round(parseFloat($("tz").value) * 60), place: $("place").value.trim(), tzName: $("tzName").value,
    };
    if ([data.lat, data.lon, data.tzOffsetMin].some(isNaN)) { formMsg(tt("⚠️ कृपया जन्म स्थान चुनें।", "⚠️ Please choose the place of birth.")); return; }
    saveProfile(data);
    lastTab = "sum";
    (window.Anim ? window.Anim.loading : (f) => f())(() => renderAndShow(data), tt("कुंडली बन रही है…", "Casting the horoscope…"));
  });

  // ---------------- सहेजी गई कुंडलियाँ ----------------
  const KEY = "kundli-saved-v1";
  const loadSaved = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  function saveProfile(d) {
    try {
      const list = loadSaved().filter((x) => !(x.name === d.name && x.year === d.year && x.month === d.month && x.day === d.day));
      list.unshift(d);
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
      showSaved();
    } catch (e) { /* storage अनुपलब्ध */ }
  }
  function showSaved() {
    const list = loadSaved();
    const box = $("saved");
    if (!list.length) { box.innerHTML = ""; return; }
    box.innerHTML = `<span class="note">${tt("सहेजी गई कुंडलियाँ:", "Saved charts:")} </span>`;
    list.forEach((d, i) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      const open = document.createElement("a");
      open.href = "#"; open.textContent = `${d.name} (${d.day}/${d.month}/${d.year})`;
      open.onclick = (e) => { e.preventDefault(); fillForm(d); lastTab = "sum"; renderAndShow(d); };
      const del = document.createElement("button");
      del.type = "button"; del.title = tt("हटाएँ", "Remove"); del.textContent = "✕";
      del.onclick = () => { const l = loadSaved(); l.splice(i, 1); localStorage.setItem(KEY, JSON.stringify(l)); showSaved(); };
      chip.append(open, del);
      box.appendChild(chip);
    });
  }
  function fillForm(d) {
    $("name").value = d.name; $("gender").value = d.gender || "M";
    $("dob").value = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
    $("tob").value = `${String(d.hour).padStart(2, "0")}:${String(d.minute).padStart(2, "0")}`;
    place.load(d);
  }

  // ---------------- सहायक ----------------
  function fmtDate(jd, tzMin) {
    const dt = new Date((jd - 2440587.5) * 86400000 + tzMin * 60000);
    return `${String(dt.getUTCDate()).padStart(2, "0")}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${dt.getUTCFullYear()}`;
  }
  const hm = (t) => t ? `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}` : "—";
  const ownedHouses = (r, p) => r.houses.filter((h) => h.lord === p).map((h) => h.h);
  const HOUSE = () => tt("भाव", "house");

  // ---------------- उत्तर भारतीय चार्ट (केसरिया, घुमावदार ओगी-रेखाएँ, गणेश व मण्डल) ----------------
  // निर्देशांक मूल डिज़ाइन-चित्र (1075×850) के अनुसार; चार्ट-आयत (82,114)–(980,752)
  const FX = 82, FY = 114, FW = 898, FH = 638;
  const nx = (x) => FX + x * FW, ny = (y) => FY + y * FH;
  // एक चतुर्थांश (ऊपर-बायाँ) का वक्र: मध्य-ऊपर → विकर्ण-बिन्दु → मध्य-बायाँ, शेष तीन दर्पण-प्रतिबिम्ब
  const QCURVE = [[0.5, 0], [0.5, 0.09], [0.33, 0.14], [0.25, 0.25], [0.15, 0.33], [0.07, 0.5], [0, 0.5]];
  function curvePath(fx, fy) {
    const pt = ([x, y]) => `${nx(fx ? 1 - x : x).toFixed(1)} ${ny(fy ? 1 - y : y).toFixed(1)}`;
    const c = QCURVE;
    return `M${pt(c[0])}C${pt(c[1])} ${pt(c[2])} ${pt(c[3])}C${pt(c[4])} ${pt(c[5])} ${pt(c[6])}`;
  }
  // भावों के लेबल-केन्द्र, राशि-अंक की जगह और ग्रह-सूची का प्रकार
  const HOUSE_POS = {
    1: [0.5, 0.36], 2: [0.25, 0.085], 3: [0.085, 0.27], 4: [0.25, 0.5], 5: [0.085, 0.73], 6: [0.25, 0.915],
    7: [0.5, 0.73], 8: [0.75, 0.915], 9: [0.915, 0.73], 10: [0.75, 0.5], 11: [0.915, 0.27], 12: [0.75, 0.085],
  };
  const SIGN_POS = {
    1: [0.5, 0.455], 2: [0.25, 0.195], 3: [0.19, 0.25], 4: [0.425, 0.5], 5: [0.19, 0.75], 6: [0.25, 0.805],
    7: [0.5, 0.56], 8: [0.75, 0.805], 9: [0.81, 0.75], 10: [0.575, 0.5], 11: [0.81, 0.25], 12: [0.75, 0.195],
  };
  let chartSeq = 0;
  function northChart(title, lagnaSign, houseOf, labelOf) {
    const id = "k" + (++chartSeq);
    const groups = {};
    for (const p of A.PLANETS) { const hh = houseOf(p); (groups[hh] = groups[hh] || []).push(labelOf(p)); }
    const STROKE = "#e5721f", FILL = "#fdc477";
    const house1 = `M${nx(0.5)} ${ny(0)}C${nx(0.5)} ${ny(0.09)} ${nx(0.33)} ${ny(0.14)} ${nx(0.25)} ${ny(0.25)}L${nx(0.5)} ${ny(0.5)}L${nx(0.75)} ${ny(0.25)}C${nx(0.67)} ${ny(0.14)} ${nx(0.5)} ${ny(0.09)} ${nx(0.5)} ${ny(0)}Z`;
    let svg = `<svg class="kchart" viewBox="30 40 1015 775" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}">`;
    svg += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fecb82"/><stop offset="1" stop-color="#fcbf72"/></linearGradient></defs>`;
    svg += `<image href="img/mandala-tl.png" x="0" y="0" width="420" height="409" opacity=".95"/>`;
    svg += `<image href="img/mandala-br.png" x="660" y="420" width="412" height="413" opacity=".95"/>`;
    svg += `<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" fill="url(#${id}g)"/>`;
    svg += `<path d="${house1}" fill="#ffd89e" opacity=".55"/>`;
    svg += `<image href="img/ganesha.png" x="${nx(0.5) - 52}" y="${ny(0.075)}" width="104" height="116" opacity=".72"/>`;
    svg += `<g fill="none" stroke="${STROKE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">`;
    svg += `<path d="M${nx(0)} ${ny(0)}L${nx(1)} ${ny(1)}M${nx(1)} ${ny(0)}L${nx(0)} ${ny(1)}"/>`;
    svg += [[0, 0], [1, 0], [0, 1], [1, 1]].map(([fx, fy]) => `<path d="${curvePath(fx, fy)}"/>`).join("");
    svg += `<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" stroke-width="7"/></g>`;
    for (let k = 1; k <= 12; k++) {
      const sign = (lagnaSign + k - 1) % 12;
      const [sx, sy] = SIGN_POS[k];
      svg += `<text x="${nx(sx)}" y="${ny(sy) + 11}" text-anchor="middle" font-size="31" font-weight="700" fill="#a3260f">${sign + 1}</text>`;
      const side = [3, 5, 9, 11].includes(k), flat = [2, 6, 8, 12].includes(k);
      let items = groups[k] || [];
      if (items.length > (side ? 1 : flat ? 2 : 4) || (side && items.some((o) => o.t.length > 7))) items = items.map((o) => ({ ...o, t: o.t.replace(/ \d+°/, "") }));
      const fs = items.length > 4 ? 32 : items.length > 2 ? 36 : 40;
      const lh = fs + 5;
      const cols = flat && items.length > 2 ? 2 : (k === 1 || k === 4 || k === 7 || k === 10) && items.length > 4 ? 2 : 1;
      const rows = Math.ceil(items.length / cols);
      let [cx, cy] = HOUSE_POS[k];
      let ox = nx(cx), oy = ny(cy);
      if (k === 1) oy = ny(0.355) - ((rows - 1) * lh) / 2 + (rows > 2 ? lh * 0.6 : 0);
      items.forEach((txt, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = ox + (cols === 2 ? (col === 0 ? -68 : 68) : 0);
        const y = (k === 1 ? oy : oy - ((rows - 1) * lh) / 2) + row * lh + fs / 3;
        svg += `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="${txt.color}">${esc(txt.t)}</text>`;
      });
    }
    svg += `</svg>`;
    return `<div class="chartbox"><h3>${esc(title)}</h3>${svg}</div>`;
  }
  function planetLabel(r, p, withDeg) {
    const x = r.planets[p];
    let t = J.GRAHA_SHORT[p];
    if (withDeg) t += ` ${Math.floor(x.deg)}°`;
    if (x.retro && p !== "Rahu" && p !== "Ketu") t += tt("(व)", "(R)");
    if (x.combust) t += tt("(अ)", "(C)");
    const color = x.dignity.key === "exalt" ? "#1d6b34" : x.dignity.key === "debil" ? "#b3170e" : "#4a1606";
    if (x.dignity.key === "exalt") t += "↑"; else if (x.dignity.key === "debil") t += "↓";
    return { t, color };
  }

  // ---------------- भाव बल / क्षेत्रीय फल ----------------
  function houseScore(r, h) {
    const hs = r.houses[h - 1];
    let s = 50;
    s += (r.strength[hs.lord] - 50) * 0.35;
    const lh = r.planets[hs.lord].house;
    if (DUSTHANA.includes(h)) { if (DUSTHANA.includes(lh)) s += 6; }
    else if ([1, 4, 5, 7, 9, 10, 11].includes(lh)) s += 8;
    else if (DUSTHANA.includes(lh)) s -= 10;
    for (const o of hs.occupants) {
      if (BENEFIC.includes(o)) s += r.strength[o] >= 40 ? 7 : 3;
      else if ([3, 6, 10, 11].includes(h)) s += 4;
      else s -= 6;
    }
    const asp = (p, list) => list.includes(J.houseFrom(r.planets[p].sign, (r.lagnaSign + h - 1) % 12));
    if (asp("Jupiter", [5, 7, 9])) s += 6;
    if (![3, 6, 11].includes(h)) { if (asp("Saturn", [3, 7, 10])) s -= 4; if (asp("Mars", [4, 7, 8])) s -= 3; }
    return Math.max(10, Math.min(95, s));
  }
  function areaScore(r, houses, karakas) {
    let s = houses.reduce((a, h) => a + houseScore(r, h), 0) / houses.length;
    for (const k of karakas) s += (r.strength[k] - 50) * 0.2;
    return Math.round(Math.max(10, Math.min(95, s)));
  }
  function tier(s) {
    if (s >= 66) return { label: tt("उत्तम", "Excellent"), color: "#2f7d4a" };
    if (s >= 52) return { label: tt("अच्छा", "Good"), color: "#67993a" };
    if (s >= 40) return { label: tt("मध्यम", "Average"), color: "#b8860b" };
    return { label: tt("संघर्षपूर्ण", "Challenging"), color: "#b3261e" };
  }
  const CAREER = () => ({
    Sun: tt("सरकारी सेवा, प्रशासन, राजनीति, चिकित्सा", "government service, administration, politics, medicine"), Moon: tt("जनसेवा, होटल/खाद्य, नर्सिंग, जल-सम्बन्धी व्यापार, डेयरी", "public service, hotels/food, nursing, water-related trade, dairy"),
    Mars: tt("इंजीनियरिंग, सेना/पुलिस, भूमि-भवन, खेल, शल्य-चिकित्सा", "engineering, army/police, real estate, sports, surgery"), Mercury: tt("व्यापार, लेखा, आईटी, लेखन, मीडिया, शिक्षण", "trade, accounts, IT, writing, media, teaching"),
    Jupiter: tt("अध्यापन, विधि, बैंकिंग/वित्त, धर्म-कार्य, परामर्श", "teaching, law, banking/finance, religious work, counselling"), Venus: tt("कला, फैशन, फ़िल्म, सौन्दर्य, होटल, वाहन, विलासिता", "art, fashion, film, beauty, hospitality, vehicles, luxury"),
    Saturn: tt("उद्योग, तेल/खनिज, निर्माण, न्याय, श्रम-प्रबन्धन, लोहा", "industry, oil/minerals, construction, judiciary, labour management, iron"), Rahu: tt("तकनीक, विदेशी कम्पनियाँ, राजनीति, शोध, विमानन", "technology, foreign companies, politics, research, aviation"),
    Ketu: tt("आध्यात्म, ज्योतिष, चिकित्सा, कोडिंग, गूढ़ शोध", "spirituality, astrology, medicine, coding, occult research"),
  });

  function lifeAreas(r) {
    const P = r.planets, H = r.houses, female = r.input.gender === "F";
    const L = (h) => H[h - 1].lord;
    const names = (a) => a.map((p) => G[p]).join(", ");
    const lordLine = (h) => tt(`${ORD(h)} भाव (${J.RASHI[H[h - 1].sign]}) का स्वामी ${G[L(h)]} ${ORD(P[L(h)].house)} भाव में ${P[L(h)].dignity.label} है`, `The ${ORD(h)} lord (${J.RASHI[H[h - 1].sign]}) ${G[L(h)]} is in the ${ORD(P[L(h)].house)} house, ${P[L(h)].dignity.label.toLowerCase()}`);
    const occ = (h) => H[h - 1].occupants.length ? tt(`${ORD(h)} भाव में ${names(H[h - 1].occupants)} स्थित हैं।`, `${names(H[h - 1].occupants)} occupy the ${ORD(h)} house.`) : "";
    const dot = tt("।", ".");
    const out = [];

    let s = areaScore(r, [1], ["Sun", L(1)]);
    const mal68 = H[5].occupants.concat(H[7].occupants).filter((p) => !BENEFIC.includes(p));
    out.push({ id: "health", t: tt("स्वास्थ्य एवं व्यक्तित्व", "Health & personality"), s, txt: `${lordLine(1)}${dot} ${occ(1)} ${s >= 52 ? tt("शरीर सामान्यतः स्वस्थ और ऊर्जावान रहेगा, रोग-प्रतिरोधक क्षमता अच्छी।", "The body will generally be healthy and energetic with good immunity.") : tt("स्वास्थ्य के प्रति सजग रहें; नियमित दिनचर्या, योग और संतुलित आहार आवश्यक।", "Stay mindful of health; a regular routine, yoga and a balanced diet are needed.")} ${mal68.length ? tt(`छठे/आठवें भाव में पाप ग्रह (${names(mal68)}) होने से स्वास्थ्य के प्रति विशेष सावधानी रखें।`, `Malefics in the 6th/8th (${names(mal68)}) call for special care of health.`) : ""}` });

    s = areaScore(r, [4, 5], ["Mercury", "Jupiter"]);
    out.push({ id: "education", t: tt("शिक्षा एवं बुद्धि", "Education & intellect"), s, txt: `${lordLine(5)}${dot} ${occ(5)} ${tt(`बुध ${P.Mercury.dignity.label}, गुरु ${P.Jupiter.dignity.label}।`, `Mercury: ${P.Mercury.dignity.label.toLowerCase()}, Jupiter: ${P.Jupiter.dignity.label.toLowerCase()}.`)} ${s >= 52 ? tt("शिक्षा में अच्छी सफलता, स्मरण-शक्ति और विश्लेषण क्षमता उत्तम; उच्च शिक्षा के योग।", "Good success in education, fine memory and analysis; higher education is indicated.") : tt("शिक्षा में बाधाएँ या रुचि-परिवर्तन सम्भव; निरन्तर अभ्यास से सफलता मिलेगी। सरस्वती वंदना लाभकारी।", "Obstacles or changes of interest in studies are possible; steady practice brings success. Saraswati vandana helps.")}` });

    s = areaScore(r, [2, 11], ["Jupiter"]);
    const h4 = houseScore(r, 4);
    out.push({ id: "wealth", t: tt("धन एवं सम्पत्ति", "Wealth & property"), s, txt: `${lordLine(2)}; ${lordLine(11)}${dot} ${occ(2)} ${occ(11)} ${s >= 66 ? tt("धन-संचय के प्रबल योग, आय के अनेक स्रोत।", "Strong combinations for wealth, many sources of income.") : s >= 52 ? tt("आय अच्छी, धीरे-धीरे सम्पत्ति बढ़ेगी।", "Good income; property will grow steadily.") : s >= 40 ? tt("आय सामान्य; बचत और निवेश में अनुशासन आवश्यक।", "Average income; discipline in saving and investing is needed.") : tt("धन में उतार-चढ़ाव; ऋण और जोखिम भरे निवेश से बचें।", "Fluctuating finances; avoid loans and risky investments.")} ${tt(`चतुर्थ भाव ${tier(h4).label} — भूमि/वाहन सुख ${h4 >= 52 ? "मिलेगा" : "देर से मिलेगा"}।`, `4th house: ${tier(h4).label.toLowerCase()} — land/vehicle comforts will come ${h4 >= 52 ? "in time" : "later"}.`)}` });

    s = areaScore(r, [10], ["Sun", "Saturn"]);
    const yk = A.PLANETS.filter((p) => { const o = ownedHouses(r, p); return o.some((h) => [4, 7, 10].includes(h)) && o.some((h) => [5, 9].includes(h)); });
    const cpKeys = [...new Set([...H[9].occupants, L(10), ...yk])];
    const C = CAREER();
    out.push({ id: "career", t: tt("करियर एवं व्यवसाय", "Career & profession"), s, txt: `${lordLine(10)}${dot} ${occ(10)} ${s >= 66 ? tt("कार्यक्षेत्र में उच्च पद, नेतृत्व और प्रतिष्ठा के प्रबल योग।", "Strong indications of high position, leadership and prestige at work.") : s >= 52 ? tt("कर्म-क्षेत्र में अच्छी उन्नति; परिश्रम का पूरा फल मिलेगा।", "Good progress in career; effort will be fully rewarded.") : tt("करियर में संघर्ष और परिवर्तन सम्भव; धैर्य और निरन्तरता से स्थायित्व आएगा।", "Struggle and changes in career are possible; patience and consistency bring stability.")} ${tt("अनुकूल क्षेत्र:", "Suitable fields:")} ${cpKeys.map((k) => C[k]).join("; ")}${dot} ${P[L(10)].house === 7 || H[6].occupants.includes(L(10)) ? tt("व्यापार/साझेदारी विशेष लाभकारी।", "Business/partnership is especially beneficial.") : [6, 10].includes(P[L(10)].house) ? tt("नौकरी/सेवा क्षेत्र अधिक अनुकूल।", "Employment/service suits better.") : ""}` });

    const kar = female ? "Jupiter" : "Venus";
    s = areaScore(r, [7], [kar]);
    const mang = r.yogas.find((y) => y.id === "manglik");
    out.push({ id: "marriage", t: tt("विवाह एवं दाम्पत्य", "Marriage & married life"), s, txt: `${lordLine(7)}${dot} ${occ(7)} ${tt(`${female ? "पति-कारक गुरु" : "पत्नी-कारक शुक्र"} ${P[kar].dignity.label} (${ORD(P[kar].house)} भाव)।`, `${female ? "Husband-significator Jupiter" : "Wife-significator Venus"}: ${P[kar].dignity.label.toLowerCase()} (${ORD(P[kar].house)} house).`)} ${s >= 52 ? tt("दाम्पत्य जीवन सामान्यतः सुखी, जीवनसाथी सहयोगी।", "Married life is generally happy with a supportive spouse.") : tt("दाम्पत्य में धैर्य और संवाद आवश्यक; कुंडली मिलान ध्यान से करें।", "Patience and communication are needed in marriage; match kundlis carefully.")} ${H[6].occupants.includes("Saturn") || P[L(7)].house === 12 || P[L(7)].house === 8 ? tt("विवाह में कुछ विलम्ब सम्भव।", "Some delay in marriage is possible.") : ""} ${mang ? (mang.cancelled ? tt("मांगलिक दोष है परन्तु परिहार होता है।", "Manglik dosha exists but is cancelled.") : tt("मांगलिक दोष विचारणीय।", "Manglik dosha needs consideration.")) : tt("मांगलिक दोष नहीं।", "No Manglik dosha.")} ${marriageTiming(r)}` });

    s = areaScore(r, [5], ["Jupiter"]);
    out.push({ id: "children", t: tt("संतान", "Children"), s, txt: `${lordLine(5)}${dot} ${occ(5)} ${s >= 52 ? tt("संतान सुख के अच्छे योग; संतान बुद्धिमान और आज्ञाकारी।", "Good indications of happiness from children; intelligent and obedient children.") : tt("संतान-सुख में विलम्ब या चिन्ता सम्भव; संतान गोपाल मंत्र और गुरुवार व्रत लाभकारी।", "Delay or worry regarding children is possible; Santan Gopal mantra and Thursday fasts help.")}` });

    s = areaScore(r, [9], ["Jupiter", "Sun"]);
    out.push({ id: "fortune", t: tt("भाग्य एवं धर्म", "Fortune & dharma"), s, txt: `${lordLine(9)}${dot} ${occ(9)} ${s >= 52 ? tt("भाग्य प्रबल, गुरुजनों और पिता का आशीर्वाद; धार्मिक कार्यों में रुचि।", "Strong fortune, blessings of elders and father; interest in religious work.") : tt("भाग्य परिश्रम के बाद साथ देगा; पिता/गुरु से सम्बन्धों में संवेदनशीलता रखें।", "Fortune supports after effort; be sensitive in relations with father/teacher.")}` });

    const fsig = [P.Rahu.house === 12 || P.Rahu.house === 9 || P.Rahu.house === 7 || P.Rahu.house === 10, [6, 8, 12].includes(P[L(12)].house) || P[L(12)].house === 9, H[11].occupants.length > 0, P[L(9)].house === 12, P[L(1)].house === 12].filter(Boolean).length;
    out.push({ id: "foreign", t: tt("विदेश यात्रा / वास", "Foreign travel / settlement"), s: 30 + fsig * 15, txt: fsig >= 3 ? tt("विदेश यात्रा और विदेश में निवास/कार्य के प्रबल योग (राहु, द्वादश भाव व भाग्येश के संकेत)।", "Strong indications of foreign travel and living/working abroad (signals from Rahu, the 12th house and the 9th lord).") : fsig >= 2 ? tt("विदेश यात्रा के अच्छे योग; कार्यवश विदेश जाने के अवसर मिलेंगे।", "Good chances of foreign travel; opportunities to go abroad for work.") : fsig === 1 ? tt("विदेश यात्रा सम्भव, परन्तु स्थायी वास के योग कमज़ोर।", "Foreign travel is possible, but settling abroad is weakly indicated.") : tt("जन्मस्थान/स्वदेश में ही उन्नति के योग अधिक।", "Progress is more likely in the homeland.") });
    return out;
  }

  // ---------------- दशा फल ----------------
  function lordQuality(r, p) {
    const x = r.planets[p];
    let q = (r.strength[p] - 50) / 10;
    const nodes = p === "Rahu" || p === "Ketu";
    if (nodes) q += [3, 6, 11].includes(x.house) ? 2 : DUSTHANA.includes(x.house) ? -1.5 : KENDRA.concat(TRIKONA).includes(x.house) ? 0.5 : 0;
    else {
      q += [1, 4, 5, 7, 9, 10].includes(x.house) ? 2 : [2, 3, 11].includes(x.house) ? 1 : -2;
      const own = ownedHouses(r, p);
      if (own.some((h) => [4, 7, 10].includes(h)) && own.some((h) => [5, 9].includes(h))) q += 2;
      if (own.length && own.every((h) => DUSTHANA.includes(h) || h === 3)) q -= 1;
      if (own.some((h) => [5, 9, 1].includes(h))) q += 1;
    }
    return q;
  }
  const RLABEL = () => ({ 4: tt("उत्तम", "Excellent"), 3: tt("शुभ", "Favourable"), 2: tt("मिश्रित", "Mixed"), 1: tt("सावधानी", "Caution") });
  function periodRating(r, md, ad) {
    let v = lordQuality(r, md) * 0.5 + lordQuality(r, ad);
    const rel = J.houseFrom(r.planets[md].sign, r.planets[ad].sign);
    if ([6, 8, 12].includes(rel)) v -= 1; else if ([1, 4, 5, 7, 9, 10, 11].includes(rel)) v += 0.7;
    const k = v >= 3 ? 4 : v >= 1 ? 3 : v >= -1 ? 2 : 1;
    return { r: k, label: RLABEL()[k] };
  }
  function periodThemes(r, p) {
    const hs = new Set([r.planets[p].house, ...ownedHouses(r, p)]);
    if (p === "Rahu" || p === "Ketu") hs.add(r.planets[J.RASHI_LORD[r.planets[p].sign]].house); // राशीश का भाव
    return [...hs].sort((a, b) => a - b).map((h) => `${F().BHAVA[h - 1].k.split(",").slice(0, 2).join(",")} (${ORD(h)})`).join("; ");
  }
  const RATING_TEXT = () => ({
    4: tt("अत्यन्त अनुकूल समय — नए कार्य, निवेश, विवाह या पद-वृद्धि के लिए श्रेष्ठ।", "A very favourable time — excellent for new ventures, investment, marriage or promotion."),
    3: tt("अनुकूल समय — प्रयासों में सफलता, मान-सम्मान और लाभ।", "A favourable time — success in efforts, honour and gains."),
    2: tt("मिश्रित समय — कुछ उपलब्धियाँ, कुछ बाधाएँ; सोच-समझकर निर्णय लें।", "A mixed time — some achievements, some obstacles; decide thoughtfully."),
    1: tt("चुनौतीपूर्ण समय — स्वास्थ्य, धन और विवादों में सावधानी; उपाय करें।", "A challenging time — care with health, money and disputes; do remedies."),
  });

  function marriageTiming(r) {
    const female = r.input.gender === "F";
    const sig = new Set([r.houses[6].lord, female ? "Jupiter" : "Venus", ...r.houses[6].occupants, r.houses[1].lord]);
    const birth = r.chart.jd, Y = J.YEAR_DAYS, now = A.dateToJd(new Date()), tz = r.input.tzOffsetMin;
    const fmtP = (md, ad) => tt(`${G[md.lord]}-${G[ad.lord]} (${fmtDate(ad.start, tz)} से ${fmtDate(ad.end, tz)})`, `${G[md.lord]}-${G[ad.lord]} (${fmtDate(ad.start, tz)} to ${fmtDate(ad.end, tz)})`);
    const hits = [];
    for (const md of r.dasha.list) for (const ad of md.antar) {
      const age = (ad.start - birth) / Y, ageEnd = (ad.end - birth) / Y;
      if (ageEnd < 21 || age > 38 || ad.end < now) continue;
      if (sig.has(ad.lord) && (sig.has(md.lord) || ["Venus", "Jupiter", "Moon"].includes(ad.lord))) hits.push(fmtP(md, ad));
    }
    if (!hits.length) for (const md of r.dasha.list) for (const ad of md.antar) {
      const age = (ad.start - birth) / Y;
      if (age >= 21 && age <= 36 && ad.end > now && sig.has(ad.lord)) hits.push(fmtP(md, ad));
    }
    return hits.length ? tt(`विवाह के सम्भावित काल (दशा-अन्तर्दशा): ${hits.slice(0, 3).join(", ")}।`, `Likely periods for marriage (dasha–antardasha): ${hits.slice(0, 3).join(", ")}.`) : "";
  }

  function avTable(av) {
    const hd = Array.from({ length: 12 }, (_, i) => `<th>${i + 1}</th>`).join("");
    const row = (name, arr, b) => `<tr${b ? ' class="now"' : ""}><td>${name}</td>${arr.map((v) => `<td style="text-align:center;${b ? (v >= 28 ? "color:#2f7d4a" : v < 25 ? "color:#b3261e" : "") : ""}">${v}</td>`).join("")}</tr>`;
    return `<div class="scroll" style="margin-top:8px"><table class="av"><thead><tr><th>${tt("भाव →", "House →")}</th>${hd}</tr></thead><tbody>
      ${["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map((p) => row(G[p], av.bavHouse[p])).join("")}
      ${row(`<b>${tt("सर्वाष्टक", "Sarvashtaka")}</b>`, av.savHouse, true)}</tbody></table></div>`;
  }

  // ---------------- टैब सामग्री ----------------
  function summaryCard(r, cur, DR) {
    const av = r.avakhada, tz = r.input.tzOffsetMin;
    const goodY = window.YogDosh.yogaCards(r, A.dateToJd(new Date()));
    const present = DR.filter((d) => d.result.status === "present"), partial = DR.filter((d) => d.result.status === "partial");
    const chip = (k, v) => `<div class="sc"><span>${k}</span><b>${v}</b></div>`;
    const ss = r.transit.sadeSati ? tt("चल रही है", "running") : r.transit.dhaiya ? tt("ढैय्या चल रही", "Dhaiya running") : tt("नहीं", "no");
    return `<section class="card"><h2>📋 ${tt("कुंडली सारांश", "Chart summary")}</h2><div class="sgrid">
      ${chip(tt("लग्न", "Lagna"), `${av.lagna} (${av.lagnaLord})`)}${chip(tt("राशि", "Moon sign"), `${av.rashi} (${av.rashiLord})`)}${chip(tt("नक्षत्र", "Nakshatra"), av.nakshatra)}${chip(tt("नामाक्षर", "Name syllable"), av.namAkshar)}
      ${chip(tt("महादशा / अन्तर्दशा", "Mahadasha / Antardasha"), cur ? `${G[cur.md.lord]} / ${G[cur.ad.lord]}` : "—")}${chip(tt("प्रत्यन्तर", "Pratyantar"), cur && cur.pd ? tt(`${G[cur.pd.lord]} (${fmtDate(cur.pd.end, tz)} तक)`, `${G[cur.pd.lord]} (till ${fmtDate(cur.pd.end, tz)})`) : "—")}
      ${chip(tt("साढ़ेसाती", "Sade Sati"), ss)}${chip(tt("गण / नाड़ी", "Gana / Nadi"), `${av.gana} / ${av.nadi}`)}
      </div>
      <div class="sbox">
        <button type="button" class="sbtn good" data-goto="yoga">🌟 <b>${goodY.length}</b> ${tt("शुभ योग", "auspicious yogas")}<small>${goodY.slice(0, 3).map((y) => y.name.replace(/\s*\(.*\)/, "")).join(", ")}${goodY.length > 3 ? "…" : ""}</small></button>
        <button type="button" class="sbtn ${present.length ? "bad" : "ok"}" data-goto="dosha">⚠️ <b>${present.length}</b> ${tt("दोष", "doshas")}${partial.length ? tt(` + ${partial.length} आंशिक`, ` + ${partial.length} partial`) : ""}<small>${present.concat(partial).map((d) => d.name.replace(/\s*\(.*\)/, "")).slice(0, 3).join(", ") || tt("कोई प्रमुख दोष नहीं", "no major dosha")}</small></button>
        <button type="button" class="sbtn" data-goto="dasha">⏳ ${tt("महादशा-अन्तर्दशा", "Mahadasha–Antardasha")}<small>${cur ? tt(`${G[cur.md.lord]}–${G[cur.ad.lord]}, ${fmtDate(cur.ad.end, tz)} तक`, `${G[cur.md.lord]}–${G[cur.ad.lord]}, till ${fmtDate(cur.ad.end, tz)}`) : ""}</small></button>
        <button type="button" class="sbtn" data-goto="gochar">🪐 ${tt("गोचर / साढ़ेसाती", "Transits / Sade Sati")}<small>${r.transit.sadeSati ? tt("साढ़ेसाती चल रही है", "Sade Sati is running") : r.transit.dhaiya ? tt("ढैय्या चल रही है", "Dhaiya is running") : tt("साढ़ेसाती नहीं — वर्ष-वार गोचर देखें", "No Sade Sati — see year-wise transits")}</small></button>
      </div></section>`;
  }
  function yogaTab(r, nowJd) {
    const Y = window.YogDosh.yogaCards(r, nowJd);
    return `<section class="card"><h2>🌟 ${tt("कुंडली में बनने वाले शुभ योग", "Auspicious yogas in the chart")}</h2>
      <p class="note">${tt("प्रत्येक योग: कैसे बनता है, क्या फल देता है, शास्त्र-स्रोत, और किन ग्रहों की दशा में विशेष फलित होगा। (दोष “दोष एवं निवारण” टैब में; अन्य ग्रंथोक्त योग “ग्रंथ अनुसार” टैब में।)", "Each yoga: how it forms, what it gives, its scriptural source, and in whose dasha it will fructify. (Doshas are in the “Doshas & Remedies” tab; other classical yogas in the “By the Granthas” tab.)")}</p>
      ${Y.length ? Y.map((y) => `<div class="ycard"><h4>✨ ${y.name}</h4>
        ${y.rule ? `<p><b>${tt("कैसे बनता है:", "How it forms:")}</b> ${y.rule}</p>` : ""}
        <p><b>${tt("इस कुंडली में / फल:", "In this chart / result:")}</b> ${y.text}</p>
        ${y.when.length ? `<p><b>⏰ ${tt("फलित होने का समय (दशा):", "When it gives results (dasha):")}</b> ${y.when.join("; ")}</p>` : ""}
        <p class="srcline">📜 ${tt("स्रोत:", "Source:")} ${y.src}</p></div>`).join("") : `<p>${tt("इस कुंडली में कोई प्रमुख शास्त्रीय योग पूर्ण रूप से नहीं बनता। ग्रहों का सामान्य फल “फलादेश” टैब में देखें।", "No major classical yoga is fully formed in this chart. See the planets' general results in the “Phaladesh” tab.")}</p>`}
      <p class="note">${tt("शास्त्र-नियम: योग अपना पूर्ण फल तभी देता है जब उसके ग्रह बलवान हों (अस्त/नीच न हों) और उनकी दशा-अन्तर्दशा आए।", "Scriptural rule: a yoga gives full results only when its planets are strong (not combust/debilitated) and their dasha–antardasha arrives.")}</p></section>`;
  }
  function doshaTab(DR) {
    const order = { present: 0, partial: 1, cancelled: 2, absent: 3 };
    const list = DR.slice().sort((a, b) => order[a.result.status] - order[b.result.status]);
    const cnt = (k) => DR.filter((d) => d.result.status === k).length;
    return `<section class="card"><h2>⚠️ ${tt("दोष परीक्षण — क्या है, कितना आवश्यक, निवारण", "Dosha check — what it is, how necessary, remedies")}</h2>
      <div class="dlegend"><span class="dl present">❗ ${tt("दोष है", "Present")}: ${cnt("present")}</span><span class="dl partial">⚠️ ${tt("आंशिक", "Partial")}: ${cnt("partial")}</span><span class="dl cancelled">🛡️ ${tt("परिहार", "Cancelled")}: ${cnt("cancelled")}</span><span class="dl absent">✅ ${tt("नहीं", "Absent")}: ${cnt("absent")}</span></div>
      <p class="note">${tt(`कुंडली के ${DR.length} प्रमुख दोषों की जाँच की गई। जिस दोष पर क्लिक करें — उसकी परिभाषा, नियम, इस कुंडली की स्थिति, परिहार, उपाय की आवश्यकता और निवारण दिखेगा।`, `${DR.length} major doshas were checked. Click any dosha to see its definition, rule, status in this chart, parihara, need for remedies and the remedies.`)}</p>
      ${list.map((d, i) => `<details class="dcard ${d.st.cls}" ${i < 2 && d.result.status !== "absent" ? "open" : ""}><summary><span class="pi">${d.icon}</span><span class="pt">${d.name}</span><span class="dst ${d.st.cls}">${d.st.icon} ${d.st.label}</span></summary>
        <div class="pbody">
          <p><b>📖 ${tt("क्या है:", "What it is:")}</b> ${d.what}</p>
          <p><b>📐 ${tt("कैसे बनता है:", "How it forms:")}</b> ${d.rule}</p>
          ${d.shloka ? `<p class="shloka">${d.shloka}</p>` : ""}
          <p class="dstate ${d.st.cls}"><b>🔎 ${tt("इस कुंडली में:", "In this chart:")}</b> ${d.result.detail}${d.result.parihara && d.result.parihara.length ? `<br><b>🛡️ ${tt("परिहार:", "Parihara:")}</b> ${d.result.parihara.join("; ")}` : ""}</p>
          ${d.result.status !== "absent" ? `<p><b>⚡ ${tt("सम्भावित प्रभाव:", "Possible effects:")}</b> ${d.effect}${tt("।", ".")}</p>
          <p class="need"><b>❓ ${tt("उपाय कितना आवश्यक:", "How necessary are remedies:")}</b> ${d.needText}</p>
          <div class="rem"><b>✨ ${tt("निवारण", "Remedies")}</b><ul>${d.rem.map(([ic, k, t]) => `<li><span>${ic}</span><div><b>${k}:</b> ${t}</div></li>`).join("")}</ul></div>` : `<p class="need"><b>❓ ${tt("उपाय:", "Remedy:")}</b> ${d.needText}</p>`}
          <p class="srcline">📜 ${tt("स्रोत:", "Source:")} ${d.src}</p>
        </div></details>`).join("")}
    </section>`;
  }

  // ---------------- दशा टैब ----------------
  function ymd(days) { const y = Math.floor(days / J.YEAR_DAYS), m = Math.floor((days - y * J.YEAR_DAYS) / 30.44); return tt(`${y ? y + " वर्ष " : ""}${m} माह`, `${y ? y + " y " : ""}${m} m`); }
  function progRow(label, lord, start, end, nowJd, tz) {
    const pct = Math.max(0, Math.min(100, ((nowJd - start) / (end - start)) * 100));
    return `<div class="dprog"><div class="dp-h"><b>${label}: ${G[lord]}</b><span>${fmtDate(start, tz)} – ${fmtDate(end, tz)}</span></div>
      <div class="dp-bar"><i style="width:${pct.toFixed(1)}%"></i></div><div class="dp-f"><span>${pct.toFixed(0)}% ${tt("बीता", "elapsed")}</span><span>${tt("शेष", "Remaining")}: ${ymd(end - nowJd)}</span></div></div>`;
  }
  function dashaTab(r, cur, nowJd) {
    const P = r.planets, tz = r.input.tzOffsetMin, b = r.chart.jd, FF = F();
    const age = (jd) => Math.max(0, Math.floor((jd - b) / J.YEAR_DAYS));
    const NOW = tt(" ◀ अभी", " ◀ now"), MD = tt("महादशा", "Mahadasha"), AD = tt("अन्तर्दशा", "Antardasha");
    let h = "";
    if (cur) {
      const pr = periodRating(r, cur.md.lord, cur.ad.lord);
      const own = ownedHouses(r, cur.md.lord);
      h += `<section class="card"><h2>⏳ ${tt("अभी चल रही दशा", "Currently running dasha")} <span class="rating r${pr.r}">${pr.label}</span></h2>
        ${progRow(MD, cur.md.lord, cur.md.start, cur.md.end, nowJd, tz)}
        ${progRow(AD, cur.ad.lord, cur.ad.start, cur.ad.end, nowJd, tz)}
        ${cur.pd ? progRow(tt("प्रत्यन्तर दशा", "Pratyantar dasha"), cur.pd.lord, cur.pd.start, cur.pd.end, nowJd, tz) : ""}
        <div class="dasha-current">
        <p>${FF.DASHA[cur.md.lord]}</p>
        <p>${tt(`इस जन्मकुंडली में ${G[cur.md.lord]} ${ORD(P[cur.md.lord].house)} भाव में ${P[cur.md.lord].dignity.label} है${own.length ? ` और ${own.map(ORD).join(", ")} भाव का स्वामी है` : ""}। अतः यह महादशा मुख्यतः <b>${periodThemes(r, cur.md.lord)}</b> से जुड़े फल देगी।`, `In this chart ${G[cur.md.lord]} is in the ${ORD(P[cur.md.lord].house)} house, ${P[cur.md.lord].dignity.label.toLowerCase()}${own.length ? `, and lords the ${own.map(ORD).join(", ")} house(s)` : ""}. So this Mahadasha mainly gives results concerning <b>${periodThemes(r, cur.md.lord)}</b>.`)} ${G[cur.md.lord]} ${FF.DIGNITY_TEXT[P[cur.md.lord].dignity.key]}</p>
        <p><b>${G[cur.ad.lord]} ${AD}:</b> ${RATING_TEXT()[pr.r]} ${tt("विषय:", "Themes:")} ${periodThemes(r, cur.ad.lord)}${tt("।", ".")}</p>
        <p class="srcline">📜 ${tt("आधार: BPHS — विंशोत्तरी दशा एवं दशाफलाध्याय (दशानाथ की भाव-स्थिति, स्वामित्व, बल)", "Basis: BPHS — Vimshottari dasha and dasha-phala chapters (the dasha lord's house, lordship and strength)")}</p></div></section>`;
      if (cur.pd) {
        h += `<section class="card"><h2>${tt(`प्रत्यन्तर दशाएँ — ${G[cur.md.lord]}–${G[cur.ad.lord]} अन्तर्दशा में`, `Pratyantar dashas — within ${G[cur.md.lord]}–${G[cur.ad.lord]} antardasha`)}</h2><div class="scroll"><table><thead><tr><th>${tt("प्रत्यन्तर", "Pratyantar")}</th><th>${tt("आरम्भ", "Start")}</th><th>${tt("समाप्ति", "End")}</th><th>${tt("फल", "Result")}</th></tr></thead><tbody>
          ${cur.ad.pratyantar.map((pd) => { const pr2 = periodRating(r, cur.ad.lord, pd.lord); return `<tr class="${pd === cur.pd ? "now" : ""}"><td>${G[cur.md.lord]}–${G[cur.ad.lord]}–${G[pd.lord]}${pd === cur.pd ? NOW : ""}</td><td>${fmtDate(pd.start, tz)}</td><td>${fmtDate(pd.end, tz)}</td><td><span class="rating r${pr2.r}">${pr2.label}</span></td></tr>`; }).join("")}
          </tbody></table></div></section>`;
      }
    }
    const mds = r.dasha.list.filter((md) => md.end > b && (md.start - b) / J.YEAR_DAYS < 120);
    const RL = RLABEL();
    h += `<section class="card"><h2>📅 ${tt("विंशोत्तरी महादशा क्रम (जीवन भर)", "Vimshottari Mahadasha sequence (lifetime)")}</h2>
      <p class="note">${tt(`जन्म नक्षत्र ${r.moonNk.name} (स्वामी ${G[r.moonNk.lord]}) — जन्म के समय ${G[r.dasha.balance.lord]} महादशा का शेष ${ymd(r.dasha.balance.years * J.YEAR_DAYS)}।`, `Birth nakshatra ${r.moonNk.name} (lord ${G[r.moonNk.lord]}) — balance of ${G[r.dasha.balance.lord]} Mahadasha at birth: ${ymd(r.dasha.balance.years * J.YEAR_DAYS)}.`)}</p>
      <div class="scroll"><table><thead><tr><th>${MD}</th><th>${tt("वर्ष", "Years")}</th><th>${tt("आरम्भ", "Start")}</th><th>${tt("समाप्ति", "End")}</th><th>${tt("आयु", "Age")}</th><th>${tt("सामान्य फल", "General result")}</th></tr></thead><tbody>
      ${mds.map((md) => { const q = lordQuality(r, md.lord); const k = q >= 2 ? 4 : q >= 0.5 ? 3 : q >= -1 ? 2 : 1; const n = cur && cur.md === md; return `<tr class="${n ? "now" : ""}"><td><b>${G[md.lord]}</b>${n ? NOW : ""}</td><td>${J.DASHA_YEARS[md.lord]}</td><td>${fmtDate(Math.max(md.start, b), tz)}</td><td>${fmtDate(md.end, tz)}</td><td>${age(md.start)}–${age(md.end)}</td><td><span class="rating r${k}">${RL[k]}</span></td></tr>`; }).join("")}
      </tbody></table></div></section>`;
    h += `<section class="card"><h2>📆 ${tt("अन्तर्दशाएँ (प्रत्येक महादशा में)", "Antardashas (in each Mahadasha)")}</h2><p class="note">${tt("किसी भी महादशा पर क्लिक करके उसकी सभी अन्तर्दशाएँ देखें। वर्तमान महादशा खुली है।", "Click any Mahadasha to see all its Antardashas. The current Mahadasha is open.")}</p>
      ${mds.map((md) => { const isNow = cur && cur.md === md; return `<details class="${isNow ? "now" : ""}" ${isNow ? "open" : ""}><summary><span>${G[md.lord]} ${MD} (${J.DASHA_YEARS[md.lord]} ${tt("वर्ष", "years")})</span><span class="note">${fmtDate(Math.max(md.start, b), tz)} – ${fmtDate(md.end, tz)} · ${tt("आयु", "age")} ${age(md.start)}–${age(md.end)}</span></summary>
        <div class="scroll"><table><thead><tr><th>${AD}</th><th>${tt("आरम्भ", "Start")}</th><th>${tt("समाप्ति", "End")}</th><th>${tt("फल", "Result")}</th><th class="hide-sm">${tt("प्रमुख विषय", "Main themes")}</th></tr></thead><tbody>${md.antar.filter((ad) => ad.end > b).map((ad) => { const pr3 = periodRating(r, md.lord, ad.lord); const n = cur && cur.ad === ad; return `<tr class="${n ? "now" : ""}"><td>${G[md.lord]}–${G[ad.lord]}${n ? " ◀" : ""}</td><td>${fmtDate(Math.max(ad.start, b), tz)}</td><td>${fmtDate(ad.end, tz)}</td><td><span class="rating r${pr3.r}">${pr3.label}</span></td><td class="hide-sm note">${periodThemes(r, ad.lord)}</td></tr>`; }).join("")}</tbody></table></div></details>`; }).join("")}
      <p class="note">${tt("फल-निर्धारण: महादशा व अन्तर्दशा स्वामी का बल, भाव-स्थिति (केन्द्र/त्रिकोण शुभ, 6/8/12 अशुभ), योगकारकत्व तथा दोनों की परस्पर स्थिति (षडाष्टक आदि)।", "Rating basis: strength of the Mahadasha and Antardasha lords, house placement (kendra/trikona good, 6/8/12 adverse), yogakaraka status and their mutual placement (6/8 etc.).")}</p></section>`;
    return h;
  }

  // ---------------- गोचर टैब ----------------
  function gocharTab(r, nowJd) {
    const GC = window.Gochar, tz = r.input.tzOffsetMin, b = r.chart.jd;
    const age = (jd) => Math.max(0, Math.floor((jd - b) / J.YEAR_DAYS));
    const td = GC.today(r, nowJd);
    const NOW = tt(" ◀ अभी", " ◀ now");
    let h = `<section class="card"><h2>🪐 ${tt("आज का गोचर", "Today's transits")} (${fmtDate(nowJd, tz)})</h2>
      <p class="note">${tt(`जन्म राशि (चन्द्र) ${J.RASHI[r.moonSign]} से गिने भाव के अनुसार शुभ/अशुभ — फलदीपिका, गोचराध्याय।`, `Favourable/unfavourable by house counted from the natal Moon sign ${J.RASHI[r.moonSign]} — Phaladeepika, Gochara chapter.`)}</p>
      <div class="scroll"><table><thead><tr><th>${tt("ग्रह", "Planet")}</th><th>${tt("राशि", "Sign")}</th><th>${tt("चन्द्र से", "From Moon")}</th><th>${tt("लग्न से", "From Lagna")}</th><th>${tt("फल", "Result")}</th></tr></thead><tbody>
      ${td.map((t) => `<tr><td><b>${G[t.p]}</b>${t.retro ? ` <span class="tag retro">${tt("वक्री", "Retro")}</span>` : ""}</td><td>${J.RASHI[t.sign]} ${Math.floor(t.deg)}°</td><td>${ORD(t.fm)}</td><td>${ORD(t.fl)}</td><td><span class="rating ${t.good ? "r4" : "r1"}">${t.good ? tt("शुभ", "Good") : tt("अशुभ", "Adverse")}</span>${GC.FX[t.p] ? ` <span class="note">${GC.FX[t.p][t.fm - 1]}</span>` : ""}</td></tr>`).join("")}
      </tbody></table></div></section>`;

    const ss = GC.sadeSati(r, b, b + 100 * J.YEAR_DAYS);
    const curSS = ss.cycles.find((c) => nowJd >= c.start && nowJd < c.end);
    const nextSS = ss.cycles.find((c) => c.start > nowJd);
    const curDh = ss.dhaiya.find((d) => nowJd >= d.start && nowJd < d.end);
    const ph = (x) => (x ? `${fmtDate(x.start, tz)} – ${fmtDate(x.end, tz)}` : "—");
    const phase = curSS ? (curSS.p1 && nowJd < curSS.p1.end ? tt("प्रथम चरण (उदय)", "first phase (rising)") : curSS.p2 && nowJd < curSS.p2.end ? tt("द्वितीय चरण (शिखर)", "second phase (peak)") : tt("तृतीय चरण (अस्त)", "third phase (setting)")) : "";
    const status = curSS ? `<div class="ssnow bad">🔴 <b>${tt("अभी साढ़ेसाती चल रही है", "Sade Sati is running now")}</b> — ${tt(`${fmtDate(curSS.start, tz)} से ${fmtDate(curSS.end, tz)} तक। ${phase}।`, `from ${fmtDate(curSS.start, tz)} to ${fmtDate(curSS.end, tz)}; ${phase}.`)}</div>`
      : curDh ? `<div class="ssnow warn">🟠 <b>${tt(`अभी शनि की ${curDh.kind} चल रही है`, `Saturn's ${curDh.kind} is running now`)}</b> — ${tt(`${fmtDate(curDh.start, tz)} से ${fmtDate(curDh.end, tz)} तक।`, `from ${fmtDate(curDh.start, tz)} to ${fmtDate(curDh.end, tz)}.`)}</div>`
      : `<div class="ssnow good">🟢 <b>${tt("अभी साढ़ेसाती या ढैय्या नहीं है।", "No Sade Sati or Dhaiya right now.")}</b>${nextSS ? tt(` अगली साढ़ेसाती: ${fmtDate(nextSS.start, tz)} से (आयु ~${age(nextSS.start)} वर्ष)।`, ` Next Sade Sati: from ${fmtDate(nextSS.start, tz)} (age ~${age(nextSS.start)}).`) : ""}</div>`;
    const s12 = J.RASHI[(r.moonSign + 11) % 12], s1 = J.RASHI[r.moonSign], s2 = J.RASHI[(r.moonSign + 1) % 12];
    h += `<section class="card"><h2>🪐 ${tt("शनि साढ़ेसाती (7½ वर्ष) — जीवन भर", "Shani Sade Sati (7½ years) — lifetime")}</h2>${status}
      <p class="note">${tt(`शनि जब जन्म राशि से 12वीं (${s12}), जन्म राशि (${s1}) और 2री (${s2}) राशि में गोचर करता है, तब साढ़ेसाती होती है। वक्री होकर लौटने की अवधि भी जोड़ी गई है।`, `Sade Sati occurs while Saturn transits the 12th (${s12}), the natal sign (${s1}) and the 2nd (${s2}) from the natal Moon. Retrograde returns are included.`)}</p>
      <div class="scroll"><table><thead><tr><th>#</th><th>${tt("आरम्भ – समाप्ति", "Start – End")}</th><th>${tt("आयु", "Age")}</th><th>${tt("प्रथम चरण (उदय)", "Phase 1 (rising)")}<br><small>${s12}</small></th><th>${tt("द्वितीय चरण (शिखर)", "Phase 2 (peak)")}<br><small>${s1}</small></th><th>${tt("तृतीय चरण (अस्त)", "Phase 3 (setting)")}<br><small>${s2}</small></th></tr></thead><tbody>
      ${ss.cycles.map((c, i) => `<tr class="${c === curSS ? "now" : ""}"><td>${i + 1}${c === curSS ? NOW : ""}</td><td>${fmtDate(c.start, tz)} – ${fmtDate(c.end, tz)}</td><td>${age(c.start)}–${age(c.end)}</td><td>${ph(c.p1)}</td><td>${ph(c.p2)}</td><td>${ph(c.p3)}</td></tr>`).join("")}
      </tbody></table></div>
      <h3>${tt("शनि ढैय्या (2½ वर्ष)", "Shani Dhaiya (2½ years)")}</h3>
      <div class="scroll"><table><thead><tr><th>${tt("ढैय्या", "Dhaiya")}</th><th>${tt("आरम्भ", "Start")}</th><th>${tt("समाप्ति", "End")}</th><th>${tt("आयु", "Age")}</th></tr></thead><tbody>
      ${ss.dhaiya.map((d) => `<tr class="${d === curDh ? "now" : ""}"><td>${d.kind}${d === curDh ? NOW : ""}</td><td>${fmtDate(d.start, tz)}</td><td>${fmtDate(d.end, tz)}</td><td>${age(d.start)}–${age(d.end)}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="srcline">📜 ${tt("आधार: फलदीपिका गोचराध्याय (चन्द्र से 12/1/2 तथा 4/8 में शनि अशुभ)। तिथियाँ ±1–3 दिन।", "Basis: Phaladeepika, Gochara chapter (Saturn adverse in the 12th/1st/2nd and 4th/8th from the Moon). Dates ±1–3 days.")}</p></section>`;

    const yNow = new Date().getFullYear();
    const rows = GC.yearTable(r, yNow - 1, yNow + 15, tz);
    const FROM = (d) => tt(`${d} से`, `from ${d}`);
    const cell = (list, p, pre) => list.map((x) => `<div class="gy ${x.good ? "g" : "b"}">${pre || ""}${J.RASHI[x.sign]} <small>(${ORD(x.fm)})</small>${x.from ? ` <small>${FROM(fmtDate(x.from, tz).slice(0, 5))}</small>` : ""}${p === "Saturn" && [12, 1, 2].includes(x.fm) ? ` <span class="tag debil">${tt("साढ़ेसाती", "Sade Sati")}</span>` : p === "Saturn" && [4, 8].includes(x.fm) ? ` <span class="tag enemy">${tt("ढैय्या", "Dhaiya")}</span>` : ""}</div>`).join("");
    const ketu = (list) => list.map((x) => { const k = (x.sign + 6) % 12, fm = J.houseFrom(r.moonSign, k); return `<div class="gy ${[3, 6, 11].includes(fm) ? "g" : "b"}">${tt("के: ", "Ke: ")}${J.RASHI[k]} <small>(${ORD(fm)})</small></div>`; }).join("");
    h += `<section class="card"><h2>📅 ${tt("वर्ष-वार गोचर", "Year-wise transits")} (${yNow - 1} – ${yNow + 15})</h2>
      <p class="note">${tt("प्रत्येक वर्ष शनि, गुरु, राहु-केतु किस राशि में रहेंगे; कोष्ठक में जन्म राशि से भाव।", "Where Saturn, Jupiter and Rahu–Ketu will be each year; the house from the natal Moon sign is in brackets.")} <span class="gy g">${tt("हरा = शुभ", "green = good")}</span> <span class="gy b">${tt("लाल = अशुभ", "red = adverse")}</span>${tt("। राशि बदलने की तिथि (दिन-माह) भी दी है।", ". The date (day-month) of each sign change is also shown.")}</p>
      <div class="scroll"><table class="ytab"><thead><tr><th>${tt("वर्ष", "Year")}</th><th>${G.Saturn}</th><th>${G.Jupiter}</th><th>${G.Rahu} / ${G.Ketu}</th></tr></thead><tbody>
      ${rows.map((row) => `<tr class="${row.year === yNow ? "now" : ""}"><td><b>${row.year}</b></td><td>${cell(row.Saturn, "Saturn")}</td><td>${cell(row.Jupiter, "Jupiter")}</td><td>${cell(row.Rahu, "Rahu", tt("रा: ", "Ra: "))}${ketu(row.Rahu)}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="note">${tt("गोचर का फल दशा के साथ मिलाकर देखा जाता है — शुभ दशा में अशुभ गोचर का कष्ट कम, और अशुभ दशा में शुभ गोचर का लाभ कम होता है।", "Transits are read together with the dasha — a good dasha softens an adverse transit, and a difficult dasha reduces the benefit of a good transit.")}</p></section>`;
    return h;
  }

  // ---------------- रिपोर्ट ----------------
  function render(input) {
    lastInput = input;
    const FF = F();
    const r = J.analyze(input);
    const P = r.planets, tz = input.tzOffsetMin, av = r.avakhada;
    const nowJd = A.dateToJd(new Date());
    const cur = J.findCurrent(r.dasha, nowJd);
    const birthStr = `${String(input.day).padStart(2, "0")}-${String(input.month).padStart(2, "0")}-${input.year}, ${String(input.hour).padStart(2, "0")}:${String(input.minute).padStart(2, "0")}`;
    const ageNow = (nowJd - r.chart.jd) / J.YEAR_DAYS;
    const dot = tt("।", ".");

    const areas = lifeAreas(r);
    let html = "";
    const TB = { sum: "", chart: "", yoga: "", dosha: "", phala: "", granth: "", dasha: "", gochar: "" };
    html += `<section class="card person-card"><div class="toolbar"><div class="person"><div class="pk">${tt("जन्म कुंडली", "Janma Kundli")}</div><h2>${esc(input.name)}</h2>
      <p>${input.gender === "F" ? tt("स्त्री", "Female") : tt("पुरुष", "Male")} · ${tt("जन्म", "Born")}: ${birthStr} (UTC ${tz >= 0 ? "+" : "−"}${fmtOffset(Math.abs(tz))}) · ${esc(input.place || "")}</p>
      <p>${tt("अक्षांश", "Lat")} ${input.lat.toFixed(4)}°, ${tt("देशान्तर", "Lon")} ${input.lon.toFixed(4)}° · ${tt("लाहिरी अयनांश", "Lahiri ayanamsa")} ${J.dms(r.chart.ayanamsa)} · ${tt("वर्तमान आयु", "Current age")} ~${ageNow > 0 ? Math.floor(ageNow) : 0} ${tt("वर्ष", "years")}</p></div>
      <div class="no-print tb-btns"><button class="ghost jump" id="jumpNiv">⚠️ ${tt("दोष एवं निवारण", "Doshas & Remedies")}</button> <button class="ghost" onclick="window.print()">📖 ${tt("पुस्तक PDF / प्रिंट", "Book PDF / Print")}</button> <button class="ghost" id="editBtn">✏️ ${tt("बदलें", "Edit")}</button></div></div></section>`;

    const sunriseNote = r.sun && (input.hour * 60 + input.minute) < r.sun.rise.h * 60 + r.sun.rise.m;
    const prevDay = tt(["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"], ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])[(new Date(Date.UTC(input.year, input.month - 1, input.day)).getUTCDay() + 6) % 7];
    TB.chart += `<section class="card"><h2>${tt("अवकहड़ा चक्र एवं पंचांग", "Avakahada Chakra & Panchang")}</h2><div class="kv">
      ${[[tt("लग्न", "Lagna"), `${av.lagna} ${J.dms(r.chart.ascendant.deg)}`], [tt("लग्नेश", "Lagna lord"), av.lagnaLord], [tt("राशि (चन्द्र)", "Moon sign (Rashi)"), av.rashi], [tt("राशि स्वामी", "Rashi lord"), av.rashiLord], [tt("नक्षत्र", "Nakshatra"), av.nakshatra], [tt("नक्षत्र स्वामी", "Nakshatra lord"), av.nakLord], [tt("नक्षत्र देवता", "Nakshatra deity"), av.deity], [tt("नामाक्षर", "Name syllable"), av.namAkshar], [tt("गण", "Gana"), av.gana], [tt("योनि", "Yoni"), av.yoni], [tt("नाड़ी", "Nadi"), av.nadi], [tt("वर्ण", "Varna"), av.varna], [tt("वश्य", "Vashya"), av.vashya], [tt("तत्त्व (राशि)", "Element (sign)"), av.tattva], [tt("सूर्य राशि", "Sun sign"), av.sunSign],
        [tt("वार", "Weekday"), r.panchang.vaar], [tt("तिथि", "Tithi"), r.panchang.tithi], [tt("योग", "Yoga"), r.panchang.yoga], [tt("करण", "Karana"), r.panchang.karana], [tt("सूर्योदय / सूर्यास्त", "Sunrise / Sunset"), r.sun ? `${hm(r.sun.rise)} / ${hm(r.sun.set)}` : "—"],
        [tt("दशा शेष (जन्म पर)", "Dasha balance at birth"), `${G[r.dasha.balance.lord]} ${ymd(r.dasha.balance.years * J.YEAR_DAYS)}`]]
        .map(([k, v]) => `<div><span>${k}</span><span>${esc(v)}</span></div>`).join("")}
      </div>${sunriseNote ? `<p class="note">${tt(`ध्यान दें: जन्म सूर्योदय से पहले है — वैदिक परम्परा में वार पिछले दिन का (${prevDay}) माना जाता है।`, `Note: the birth is before sunrise — in Vedic tradition the weekday is taken as the previous day (${prevDay}).`)}</p>` : ""}</section>`;

    TB.chart += `<section class="card"><h2>${tt("कुंडली चक्र", "Birth charts")}</h2><div class="charts">
      ${northChart(tt("लग्न कुंडली (D1)", "Lagna chart (D1)"), r.lagnaSign, (p) => P[p].house, (p) => planetLabel(r, p, true), true)}
      ${northChart(tt("चन्द्र कुंडली", "Chandra chart"), r.moonSign, (p) => J.houseFrom(r.moonSign, P[p].sign), (p) => planetLabel(r, p, false), true)}
      ${northChart(tt("नवांश कुंडली (D9)", "Navamsa chart (D9)"), r.ascNav, (p) => J.houseFrom(r.ascNav, P[p].navamsa), (p) => ({ t: J.GRAHA_SHORT[p] + (P[p].vargottama ? "*" : ""), color: "#4a1606" }), true)}
      </div><p class="note">${tt("अंक = राशि (1 मेष … 12 मीन)। (व) वक्री, (अ) अस्त, ↑ उच्च, ↓ नीच, * वर्गोत्तम। ऊपर का मध्य कोष्ठ (गणेश जी वाला) प्रथम भाव (लग्न) है; भाव वामावर्त (anticlockwise) चलते हैं।", "Numbers = signs (1 Aries … 12 Pisces). (R) retrograde, (C) combust, ↑ exalted, ↓ debilitated, * vargottama. The top centre box (with Shri Ganesha) is the 1st house (Lagna); houses run anticlockwise.")}</p></section>`;

    TB.chart += `<section class="card"><h2>${tt("ग्रह स्पष्ट", "Planetary positions")}</h2><div class="scroll"><table><thead><tr><th>${tt("ग्रह", "Planet")}</th><th>${tt("राशि", "Sign")}</th><th>${tt("अंश", "Degree")}</th><th>${tt("नक्षत्र (चरण)", "Nakshatra (pada)")}</th><th class="hide-sm">${tt("नक्षत्र स्वामी", "Nak. lord")}</th><th>${tt("भाव", "House")}</th><th>${tt("स्थिति", "Dignity")}</th><th>${tt("बल", "Strength")}</th></tr></thead><tbody>
      <tr><td><b>${tt("लग्न", "Lagna")}</b></td><td>${J.RASHI[r.lagnaSign]}</td><td>${J.dms(r.chart.ascendant.deg)}</td><td>${r.ascNk.name} (${r.ascNk.pada})</td><td class="hide-sm">${G[r.ascNk.lord]}</td><td>1</td><td></td><td></td></tr>
      ${A.PLANETS.map((p) => {
        const x = P[p], st = r.strength[p];
        const col = st >= 65 ? "#2f7d4a" : st >= 45 ? "#b8860b" : "#b3261e";
        return `<tr><td><b>${G[p]}</b></td><td>${J.RASHI[x.sign]}</td><td>${J.dms(x.deg)}</td><td>${x.nak.name} (${x.nak.pada})</td><td class="hide-sm">${G[x.nak.lord]}</td><td>${x.house}</td>
        <td><span class="tag ${x.dignity.key}">${x.dignity.label}</span>${x.retro && p !== "Rahu" && p !== "Ketu" ? `<span class="tag retro">${tt("वक्री", "Retro")}</span>` : ""}${x.combust ? `<span class="tag combust">${tt("अस्त", "Combust")}</span>` : ""}${x.vargottama ? `<span class="tag varg">${tt("वर्गोत्तम", "Vargottama")}</span>` : ""}</td>
        <td><div class="bar" title="${st}/100"><i style="width:${st}%;background:${col}"></i></div><span class="note">${st}</span></td></tr>`;
      }).join("")}
      </tbody></table></div><p class="note">${tt("बल: स्थान (उच्च/स्व/मित्र/शत्रु/नीच), केन्द्र-त्रिकोण-दुःस्थान, दिग्बल, अस्त, वक्री व वर्गोत्तम के आधार पर सरल गणना।", "Strength: a simple score from dignity (exalted/own/friendly/enemy/debilitated), kendra–trikona–dusthana placement, directional strength, combustion, retrogression and vargottama.")}</p></section>`;

    TB.phala += `<section class="card phala"><h2>${tt("फलादेश — स्वभाव एवं व्यक्तित्व", "Phaladesh — nature & personality")}</h2>
      <h3>${tt("लग्न फल", "Lagna")}</h3><p>${FF.LAGNA[r.lagnaSign]}</p>
      <h3>${tt("राशि फल", "Moon sign")}</h3><p>${FF.RASHI[r.moonSign]}</p>
      <h3>${tt("जन्म नक्षत्र फल", "Birth nakshatra")}</h3><p>${FF.NAK[r.moonNk.idx]} ${tt(`नक्षत्र स्वामी ${G[r.moonNk.lord]} होने से जीवन की प्रथम दशा ${G[r.dasha.balance.lord]} की रही।`, `As the nakshatra lord is ${G[r.moonNk.lord]}, the first dasha of life was that of ${G[r.dasha.balance.lord]}.`)}</p></section>`;

    TB.sum += summaryCard(r, cur, window.YogDosh.doshaReport(r));
    TB.sum += `<section class="card"><h2>${tt("जीवन के प्रमुख क्षेत्र — सार", "Main areas of life — summary")}</h2><div class="areas">
      ${areas.map((a) => { const t = tier(a.s); return `<div class="area"><h4>${a.t}<span class="score" style="background:${t.color}">${t.label}</span></h4><p>${a.txt.replace(/\s+/g, " ")}</p></div>`; }).join("")}
      </div><p class="note">${tt("यह सार भावेश की स्थिति, भाव में स्थित ग्रह, गुरु-शनि-मंगल की दृष्टि और कारक ग्रह के बल के पाराशरी सिद्धान्तों पर आधारित है।", "This summary is based on Parashari principles: the house lord's placement, occupants, aspects of Jupiter/Saturn/Mars and the strength of the karaka.")}</p></section>`;

    const DR = window.YogDosh.doshaReport(r);
    TB.dosha += doshaTab(DR);
    const probs = window.Nivaran.analyze(r, { nowJd, cur, areas, periodRating, lordQuality, fmtDate });
    const SEV = { 3: [tt("प्रमुख", "Major"), "sev3"], 2: [tt("मध्यम", "Moderate"), "sev2"], 1: [tt("हल्का", "Mild"), "sev1"] };
    const cS = (k) => probs.filter((x) => x.sev === k).length;
    TB.dosha += `<section class="card nivaran" id="nivaran"><h2>🩺 ${tt("अन्य समस्याएँ एवं निवारण", "Other problems & remedies")} <span class="src">${tt("निर्बल ग्रह · कमज़ोर भाव · कठिन दशा", "weak planets · weak houses · difficult dasha")}</span></h2>
      <div class="prob-sum">${probs.length ? tt(`दोषों के अतिरिक्त <b>${probs.length}</b> विषय ध्यान देने योग्य पाए गए — <b style="color:var(--bad)">${cS(3)} प्रमुख</b>, ${cS(2)} मध्यम, ${cS(1)} हल्के। प्रत्येक पर क्लिक करके कारण और उपाय देखें।`, `Besides the doshas, <b>${probs.length}</b> matters need attention — <b style="color:var(--bad)">${cS(3)} major</b>, ${cS(2)} moderate, ${cS(1)} mild. Click each to see the cause and remedies.`) : tt("✅ दोषों के अतिरिक्त कोई अन्य गम्भीर समस्या नहीं मिली। नीचे दिए सामान्य उपाय जीवन को और शुभ बनाएँगे।", "✅ Apart from the doshas no other serious problem was found. The general remedies below will make life even more auspicious.")}</div>
      ${probs.map((pb, i) => `<details class="prob ${SEV[pb.sev][1]}" ${i < 2 ? "open" : ""}><summary><span class="pi">${pb.icon}</span><span class="pt">${pb.title}</span><span class="sev">${SEV[pb.sev][0]}</span></summary>
        <div class="pbody">
          <p><b>${tt("कारण (ग्रह-योग):", "Cause (planetary):")}</b> ${pb.cause}</p>
          <p><b>${tt("सम्भावित समस्या:", "Possible problems:")}</b> ${pb.effect}${dot}</p>
          ${pb.when && pb.when.length ? `<p><b>⏰ ${tt("विशेष सावधानी का समय:", "Time for special care:")}</b> ${pb.when.join("; ")}</p>` : ""}
          <div class="rem"><b>✨ ${tt("निवारण", "Remedies")}</b><ul>${pb.rem.map(([ic, k, t]) => `<li><span>${ic}</span><div><b>${k}:</b> ${t}</div></li>`).join("")}</ul></div>
        </div></details>`).join("")}
      <h3>${tt("सामान्य शुभ उपाय (सभी के लिए)", "General auspicious remedies (for everyone)")}</h3><ul class="gen">${window.Nivaran.GENERAL.map(([ic, t]) => `<li><span>${ic}</span>${t}</li>`).join("")}</ul>
      <p class="note">${tt("उपाय श्रद्धा और नियमितता से करें; किसी भी पूजा-अनुष्ठान के लिए योग्य आचार्य का मार्गदर्शन लें। स्वास्थ्य/कानूनी/आर्थिक समस्याओं में विशेषज्ञ की सलाह भी अवश्य लें।", "Do remedies with faith and regularity; take a qualified acharya's guidance for any puja or ritual. For health, legal or financial problems, always consult the relevant expert too.")}</p></section>`;

    const lords = [r.houses[0].lord, r.houses[4].lord, r.houses[8].lord].filter((v, i, a) => a.indexOf(v) === i);
    TB.dosha += `<section class="card"><h2>💎 ${tt("शुभ रत्न (लग्न अनुसार)", "Auspicious gemstones (by Lagna)")}</h2>
      <p>${tt(`लग्नेश ${G[r.houses[0].lord]}, पंचमेश ${G[r.houses[4].lord]} और नवमेश ${G[r.houses[8].lord]} आपकी कुंडली के कारक/शुभ ग्रह हैं — इनके रत्न सामान्यतः अनुकूल रहते हैं:`, `The Lagna lord ${G[r.houses[0].lord]}, 5th lord ${G[r.houses[4].lord]} and 9th lord ${G[r.houses[8].lord]} are the benefic planets of your chart — their gemstones are generally favourable:`)}</p>
      <p>${lords.map((p) => `<b>${G[p]}</b>: ${FF.REMEDY[p].ratna}${P[p].dignity.key === "debil" || P[p].combust ? ` <span class="note">${tt("(यह ग्रह नीच/अस्त है — रत्न से पहले विशेषज्ञ सलाह आवश्यक)", "(this planet is debilitated/combust — expert advice is needed before wearing)")}</span>` : ""}`).join("<br>")}</p>
      <p class="note">${tt("रत्न शुद्ध, उचित वज़न (रत्ती) में, शुभ मुहूर्त में अभिमंत्रित करके धारण करें।", "Wear a genuine stone of proper weight (ratti), energised at an auspicious muhurta.")}</p></section>`;

    TB.dasha += dashaTab(r, cur, nowJd);
    TB.gochar += gocharTab(r, nowJd);
    TB.yoga += yogaTab(r, nowJd);

    const GR = window.Granth.analyze(r);
    if (window.Bhrigu) GR.splice(1, 0, window.Bhrigu.analyze(r));
    TB.granth += `<section class="card granth"><h2>📜 ${tt("ग्रंथ अनुसार फलादेश", "Predictions by the classical texts")}</h2>
      <p class="note">${tt("प्रत्येक फल के साथ उसका ग्रंथ लिखा है। पाठ मूल संस्कृत वचनों का सरल हिन्दी भावार्थ है, शब्दशः अनुवाद नहीं।", "Each result names its text. The wording is a simple rendering of the meaning of the Sanskrit originals, not a word-for-word translation.")}</p>
      ${GR.map((g) => `<details open><summary><span>📜 ${g.granth}</span><span class="note">${g.author}</span></summary><div class="gbody">
        ${g.note ? `<p class="note">${g.note}</p>` : ""}
        ${g.items.map((it) => `<div class="yoga ${it.good ? "good" : "bad"}"><h4>${it.title}</h4><div>${it.text}</div>${it.table ? avTable(g.av) : ""}</div>`).join("")}
      </div></details>`).join("")}</section>`;

    TB.phala += `<section class="card phala"><h2>${tt("ग्रह फल (भाव अनुसार)", "Planets in houses")} <span class="src">${tt("फलदीपिका भावफलाध्याय एवं BPHS", "Phaladeepika (bhava-phala) & BPHS")}</span></h2>
      ${A.PLANETS.map((p) => { const x = P[p]; const own = ownedHouses(r, p); return `<div class="planet-phala"><b>${G[p]}</b> — ${J.RASHI[x.sign]} ${Math.floor(x.deg)}°, ${tt(`${ORD(x.house)} भाव, ${x.nak.name} नक्षत्र`, `${ORD(x.house)} house, ${x.nak.name} nakshatra`)}<br>${FF.GB[p][x.house - 1]} ${p !== "Rahu" && p !== "Ketu" ? `${G[p]} ${FF.DIGNITY_TEXT[x.dignity.key]}` : ""} ${x.combust ? tt(`${G[p]} सूर्य के निकट होने से अस्त है — इसके फल में कमी आएगी।`, `${G[p]} is combust (too close to the Sun) — its results will be reduced.`) : ""} ${x.retro && p !== "Rahu" && p !== "Ketu" ? tt(`वक्री ${G[p]} अपने कारकत्व में असामान्य, विलम्बित पर गहन फल देता है।`, `Retrograde ${G[p]} gives unusual, delayed but deep results in its significations.`) : ""} ${x.vargottama ? tt("वर्गोत्तम होने से यह ग्रह विशेष बलवान है।", "Being vargottama, this planet is especially strong.") : ""}${own.length ? ` <span class="note">(${tt(`${own.map(ORD).join(", ")} भाव का स्वामी`, `lord of the ${own.map(ORD).join(", ")}`)})</span>` : ""}</div>`; }).join("")}</section>`;

    TB.phala += `<section class="card phala"><h2>${tt("द्वादश भाव फल", "The twelve houses")} <span class="src">${tt("बृहत् पाराशर होरा शास्त्र — भावेश फलाध्याय", "BPHS — results of house lords")}</span></h2><div class="scroll"><table><thead><tr><th>${tt("भाव", "House")}</th><th>${tt("राशि", "Sign")}</th><th>${tt("विषय", "Signifies")}</th><th>${tt("स्थित ग्रह", "Occupants")}</th><th>${tt("भावेश फल", "House-lord result")}</th><th>${tt("स्थिति", "Status")}</th></tr></thead><tbody>
      ${r.houses.map((hs) => { const t = tier(houseScore(r, hs.h)); return `<tr><td><b>${hs.h}</b> ${FF.BHAVA[hs.h - 1].name}</td><td>${J.RASHI[hs.sign]}</td><td class="note">${FF.BHAVA[hs.h - 1].k}</td><td>${hs.occupants.map((p) => G[p]).join(", ") || "—"}</td><td><b>${tt(`भावेश ${G[hs.lord]} ${ORD(P[hs.lord].house)} भाव में`, `Lord ${G[hs.lord]} in the ${ORD(P[hs.lord].house)}`)}</b> — ${window.Granth.BHAVESH[hs.h - 1][P[hs.lord].house - 1]} <span class="note">(${tt("पराशर", "Parashara")})</span></td><td><span class="rating" style="background:${t.color}">${t.label}</span></td></tr>`; }).join("")}
      </tbody></table></div></section>`;

    const TABS = [["all", `📚 ${tt("सम्पूर्ण फलादेश", "Complete report")}`], ["sum", `📋 ${tt("सारांश", "Summary")}`], ["chart", `🪐 ${tt("कुंडली", "Charts")}`], ["yoga", `🌟 ${tt("योग", "Yogas")}`], ["dosha", `⚠️ ${tt("दोष एवं निवारण", "Doshas & Remedies")}`], ["phala", `📖 ${tt("फलादेश", "Phaladesh")}`], ["dasha", `⏳ ${tt("दशा", "Dasha")}`], ["gochar", `🪐 ${tt("गोचर / साढ़ेसाती", "Transits / Sade Sati")}`], ["granth", `📜 ${tt("ग्रंथ अनुसार", "By the Granthas")}`]];
    TB.all = "";
    if (!TABS.some(([k]) => k === lastTab)) lastTab = "sum";
    const CH = TABS.filter(([k]) => k !== "all");
    const num = (i) => tt(String(i).replace(/\d/g, (d) => "०१२३४५६७८९"[d]), String(i));
    // पुस्तक-शैली (प्रिंट/PDF): मुखपृष्ठ + अनुक्रमणिका
    html += `<section class="print-only book-cover">
      <div class="bc-frame">
        <div class="bc-inv">${tt("॥ श्री गणेशाय नमः ॥", "॥ Shri Ganeshaya Namah ॥")}</div>
        <img class="bc-ganesha" src="img/ganesha.png" alt="">
        <div class="bc-title">${tt("जन्म कुंडली एवं फलादेश", "Janma Kundli & Phaladesh")}</div>
        <div class="bc-name">${esc(input.name)}</div>
        <div class="bc-birth">${tt("जन्म", "Born")}: ${birthStr} · ${esc(input.place || "")}</div>
        <div class="bc-birth">${tt("लग्न", "Lagna")}: ${av.lagna} · ${tt("राशि", "Rashi")}: ${av.rashi} · ${tt("नक्षत्र", "Nakshatra")}: ${av.nakshatra}</div>
        <div class="bc-orn"></div>
        <img class="bc-photo" src="img/acharya.webp" alt="">
        <div class="bc-brand">नियति ज्योतिष कार्यालय</div>
        <div class="bc-brand-en">NIYATI JYOTISH KARYALAYA</div>
        <div class="bc-ach">${tt("आचार्य श्री हिनलभाई भोगायता", "Acharya Shri Hinalbhai Bhogayata")} · M.A., B.Ed.</div>
        <div class="bc-date">${tt("दिनांक", "Date")}: ${new Date().toLocaleDateString(tt("hi-IN", "en-IN"), { day: "numeric", month: "long", year: "numeric" })}</div>
      </div></section>
      <section class="print-only book-toc"><h2>${tt("अनुक्रमणिका", "Contents")}</h2><ol>${CH.map(([, l], i) => `<li><span class="tn">${tt("अध्याय", "Chapter")} ${num(i + 1)}</span><span class="tl">${l.replace(/^\S+\s/, "")}</span></li>`).join("")}</ol>
      <p class="note">${tt("यह फलादेश बृहत् पाराशर होरा शास्त्र, बृहज्जातक, फलदीपिका, सारावली, जातक पारिजात एवं भृगु सूत्र के सिद्धान्तों पर आधारित है।", "These predictions are based on the principles of Brihat Parashara Hora Shastra, Brihat Jataka, Phaladeepika, Saravali, Jataka Parijata and Bhrigu Sutra.")}</p></section>`;
    html += `<nav class="rtabs no-print" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" data-rt="${k}" class="${k === lastTab ? "on" : ""}">${l}</button>`).join("")}</nav>`;
    html += CH.map(([k, l], i) => `<div class="rpanel" data-panel="${k}" ${k === lastTab || lastTab === "all" ? "" : "hidden"}><h2 class="ptitle chapter-h"><span class="ch-no">${tt("अध्याय", "Chapter")} ${num(i + 1)}</span><span class="ch-t">${l.replace(/^\S+\s/, "")}</span></h2>${TB[k]}</div>`).join("");
    html += `<section class="card basis"><p class="note">${tt("ग्रंथ-आधार: बृहत् पाराशर होरा शास्त्र (पराशर), बृहज्जातक (वराहमिहिर), फलदीपिका (मंत्रेश्वर), सारावली (कल्याणवर्मा), जातक पारिजात (वैद्यनाथ दीक्षित)। गणना-विधि: ग्रहों के सायन भोगांश खगोलीय कक्षीय सूत्रों से (सटीकता ~1-3 कला), लाहिरी (चित्रपक्ष) अयनांश, सम्पूर्ण-राशि भाव पद्धति (पाराशरी), मध्यम राहु। फलादेश इन ग्रंथों के सिद्धान्तों का सरल सार है; अन्तिम निर्णय में सम्पूर्ण कुंडली का समग्र विचार आवश्यक है।", "Textual basis: Brihat Parashara Hora Shastra (Parashara), Brihat Jataka (Varahamihira), Phaladeepika (Mantreshwara), Saravali (Kalyanavarma), Jataka Parijata (Vaidyanatha Dikshita). Method: tropical longitudes from orbital formulae (accuracy ~1–3′), Lahiri (Chitrapaksha) ayanamsa, whole-sign houses (Parashari), mean Rahu. The predictions summarise these texts' principles; a final judgement needs a holistic view of the whole chart.")}</p></section>`;

    const rep = $("report");
    rep.innerHTML = html;
    rep.hidden = false;
    $("formCard").hidden = true;
    $("editBtn").onclick = () => { $("formCard").hidden = false; $("formCard").scrollIntoView({ behavior: "smooth" }); };
    const showTab = (k) => {
      lastTab = k;
      for (const b of rep.querySelectorAll("[data-rt]")) b.classList.toggle("on", b.dataset.rt === k);
      rep.classList.toggle("all-mode", k === "all");
      for (const pn of rep.querySelectorAll(".rpanel")) { const on = k === "all" || pn.dataset.panel === k; pn.hidden = !on; if (on) { pn.classList.remove("fade"); void pn.offsetWidth; pn.classList.add("fade"); if (window.Anim) window.Anim.afterRender(pn); } }
    };
    const goTab = (k) => { showTab(k); rep.querySelector(".rtabs").scrollIntoView({ behavior: "smooth", block: "start" }); };
    for (const b of rep.querySelectorAll("[data-rt]")) b.addEventListener("click", () => goTab(b.dataset.rt));
    for (const b of rep.querySelectorAll("[data-goto]")) b.addEventListener("click", () => goTab(b.dataset.goto));
    $("jumpNiv").onclick = () => goTab("dosha");
    rep.classList.toggle("all-mode", lastTab === "all");
    if (window.Anim) window.Anim.afterRender(lastTab === "all" ? rep : rep.querySelector(`.rpanel[data-panel="${lastTab}"]`));
    setPageHeader(tt(`नियति ज्योतिष कार्यालय  ·  ${input.name} — जन्म कुंडली`, `Niyati Jyotish Karyalaya  ·  ${input.name} — Janma Kundli`));
    return rep;
  }
  // प्रिंट पृष्ठ का शीर्ष-लेख (हर पृष्ठ पर) — @page margin box
  function setPageHeader(text) {
    let st = document.getElementById("pageHeadStyle");
    if (!st) { st = document.createElement("style"); st.id = "pageHeadStyle"; document.head.appendChild(st); }
    const safe = String(text).replace(/[\\"]/g, "").replace(/[\n\r]/g, " ");
    st.textContent = `@page { @top-center { content: "${safe}"; } } @page :first { @top-center { content: none; } }`;
  }
  window.__setPageHeader = setPageHeader;
  function renderAndShow(input) { const rep = render(input); rep.scrollIntoView({ behavior: "smooth" }); }

  // भाषा बदलने पर: खुली रिपोर्ट उसी टैब पर नई भाषा में
  if (window.I18N) window.I18N.onChange(() => { showSaved(); if (lastInput && !$("report").hidden) render(lastInput); });
  showSaved();

  window.__renderKundli = renderAndShow;
  window.__chart = { northChart, planetLabel, esc };
})();
