/* app.js — UI, कुंडली चार्ट (उत्तर भारतीय शैली) और फलादेश रिपोर्ट */
(function () {
  "use strict";
  const A = window.Astro, J = window.Jyotish, F = window.Phala;
  const G = J.GRAHA, ORD = J.ORD;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const BENEFIC = ["Jupiter", "Venus", "Mercury", "Moon"];
  const KENDRA = [1, 4, 7, 10], TRIKONA = [1, 5, 9], DUSTHANA = [6, 8, 12];

  // ---------------- फ़ॉर्म ----------------
  const dl = $("cityList");
  dl.innerHTML = window.CITIES.map((c) => `<option value="${esc(c.name)}">${esc(c.region)}</option>`).join("");
  let tzManual = false;

  function setPlace(c) {
    $("place").value = c.name;
    $("lat").value = (+c.lat).toFixed(4);
    $("lon").value = (+c.lon).toFixed(4);
    $("tzName").value = c.tz || "";
    tzManual = false;
    updateTz();
  }
  function updateTz() {
    const tzName = $("tzName").value;
    if (!tzName || tzManual) return;
    const [y, m, d] = ($("dob").value || "2000-01-01").split("-").map(Number);
    const [hh, mm] = ($("tob").value || "12:00").split(":").map(Number);
    try {
      const off = A.offsetForLocal(y, m, d, hh, mm, tzName);
      $("tz").value = off / 60;
      $("tzHint").textContent = `समय-क्षेत्र: ${tzName} → UTC ${off >= 0 ? "+" : "−"}${fmtOffset(Math.abs(off))} (इस तिथि के लिए, DST सहित)। आवश्यकता हो तो बदल सकते हैं।`;
    } catch (e) { /* अमान्य समय-क्षेत्र */ }
  }
  const fmtOffset = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;

  $("place").addEventListener("input", () => {
    const v = $("place").value.trim();
    const c = window.CITIES.find((x) => x.name === v);
    if (c) setPlace(c);
  });
  $("place").addEventListener("change", () => {
    const v = $("place").value.trim().toLowerCase();
    if (!v) return;
    const c = window.CITIES.find((x) => x.name.toLowerCase() === v) || window.CITIES.find((x) => x.name.toLowerCase().includes(v));
    if (c) setPlace(c);
  });
  ["dob", "tob"].forEach((id) => $(id).addEventListener("change", updateTz));
  $("tz").addEventListener("input", () => { tzManual = true; });

  $("searchBtn").addEventListener("click", async () => {
    const q = $("place").value.trim().replace(/\s*\(.*\)\s*/, "");
    const box = $("searchResults");
    if (!q) { box.innerHTML = `<span class="note">पहले स्थान का नाम लिखें।</span>`; return; }
    box.innerHTML = `<span class="note">खोज रहे हैं…</span>`;
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=hi&format=json`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.results || !data.results.length) { box.innerHTML = `<span class="note">कोई परिणाम नहीं मिला। अंग्रेज़ी में लिखकर देखें, या अक्षांश/देशान्तर स्वयं भरें।</span>`; return; }
      box.innerHTML = "";
      for (const r of data.results) {
        const b = document.createElement("button");
        b.type = "button";
        const region = [r.admin2, r.admin1, r.country].filter(Boolean).join(", ");
        b.textContent = `${r.name} — ${region} (${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)})`;
        b.onclick = () => { setPlace({ name: `${r.name}, ${r.admin1 || r.country || ""}`, lat: r.latitude, lon: r.longitude, tz: r.timezone }); box.innerHTML = ""; };
        box.appendChild(b);
      }
    } catch (e) {
      box.innerHTML = `<span class="note">ऑनलाइन खोज उपलब्ध नहीं (इंटरनेट/अनुमति)। सूची से शहर चुनें या अक्षांश-देशान्तर स्वयं भरें।</span>`;
    }
  });

  $("demoBtn").addEventListener("click", () => {
    $("name").value = "उदाहरण जातक";
    $("gender").value = "M";
    $("dob").value = "1990-03-21";
    $("tob").value = "14:30";
    setPlace(window.CITIES.find((c) => c.name.startsWith("मुंबई")));
    $("birthForm").requestSubmit();
  });

  $("birthForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const [y, m, d] = $("dob").value.split("-").map(Number);
    const [hh, mm] = $("tob").value.split(":").map(Number);
    const data = {
      name: $("name").value.trim() || "जातक", gender: $("gender").value,
      year: y, month: m, day: d, hour: hh, minute: mm,
      lat: parseFloat($("lat").value), lon: parseFloat($("lon").value),
      tzOffsetMin: Math.round(parseFloat($("tz").value) * 60), place: $("place").value.trim(), tzName: $("tzName").value,
    };
    if ([data.lat, data.lon, data.tzOffsetMin].some(isNaN)) { alert("कृपया स्थान चुनें या अक्षांश/देशान्तर भरें।"); return; }
    saveProfile(data);
    render(data);
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
    box.innerHTML = `<span class="note">सहेजी गई कुंडलियाँ: </span>`;
    list.forEach((d, i) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      const open = document.createElement("a");
      open.href = "#"; open.textContent = `${d.name} (${d.day}/${d.month}/${d.year})`;
      open.onclick = (e) => { e.preventDefault(); fillForm(d); render(d); };
      const del = document.createElement("button");
      del.type = "button"; del.title = "हटाएँ"; del.textContent = "✕";
      del.onclick = () => { const l = loadSaved(); l.splice(i, 1); localStorage.setItem(KEY, JSON.stringify(l)); showSaved(); };
      chip.append(open, del);
      box.appendChild(chip);
    });
  }
  function fillForm(d) {
    $("name").value = d.name; $("gender").value = d.gender || "M";
    $("dob").value = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
    $("tob").value = `${String(d.hour).padStart(2, "0")}:${String(d.minute).padStart(2, "0")}`;
    $("place").value = d.place || ""; $("lat").value = d.lat; $("lon").value = d.lon;
    $("tz").value = d.tzOffsetMin / 60; $("tzName").value = d.tzName || ""; tzManual = true;
  }
  showSaved();

  // ---------------- सहायक ----------------
  function fmtDate(jd, tzMin) {
    const dt = new Date((jd - 2440587.5) * 86400000 + tzMin * 60000);
    return `${String(dt.getUTCDate()).padStart(2, "0")}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${dt.getUTCFullYear()}`;
  }
  const hm = (t) => t ? `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}` : "—";
  const ownedHouses = (r, p) => r.houses.filter((h) => h.lord === p).map((h) => h.h);

  // ---------------- उत्तर भारतीय चार्ट ----------------
  function northChart(title, lagnaSign, houseOf, labelOf, highlightAsc) {
    const W = 400, q = W / 4, h = W / 2;
    const P = { TL: [0, 0], TR: [W, 0], BR: [W, W], BL: [0, W], T: [h, 0], R: [W, h], B: [h, W], L: [0, h], C: [h, h], a: [q, q], b: [3 * q, q], c: [3 * q, 3 * q], d: [q, 3 * q] };
    const H = {
      1: ["T", "b", "C", "a"], 2: ["TL", "T", "a"], 3: ["TL", "a", "L"], 4: ["L", "a", "C", "d"], 5: ["L", "d", "BL"], 6: ["BL", "d", "B"],
      7: ["B", "d", "C", "c"], 8: ["B", "c", "BR"], 9: ["BR", "c", "R"], 10: ["R", "c", "C", "b"], 11: ["R", "b", "TR"], 12: ["TR", "b", "T"],
    };
    const inner = { 1: "C", 4: "C", 7: "C", 10: "C", 2: "a", 3: "a", 5: "d", 6: "d", 8: "c", 9: "c", 11: "b", 12: "b" };
    const groups = {};
    for (const p of A.PLANETS) { const hh = houseOf(p); (groups[hh] = groups[hh] || []).push(labelOf(p)); }
    let svg = `<svg viewBox="-4 -4 ${W + 8} ${W + 8}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}">`;
    svg += `<rect x="0" y="0" width="${W}" height="${W}" fill="#fffaf2" stroke="#8a3a17" stroke-width="2.5"/>`;
    svg += `<path d="M0 0L${W} ${W}M${W} 0L0 ${W}M${h} 0L${W} ${h}L${h} ${W}L0 ${h}Z" fill="none" stroke="#8a3a17" stroke-width="1.6"/>`;
    if (highlightAsc) svg += `<polygon points="${H[1].map((k) => P[k].join(",")).join(" ")}" fill="#fde8c8" opacity=".55"/>`;
    for (let k = 1; k <= 12; k++) {
      const pts = H[k].map((n) => P[n]);
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const iv = P[inner[k]];
      const t = KENDRA.includes(k) ? 0.62 : 0.74;
      const nx = cx + (iv[0] - cx) * t, ny = cy + (iv[1] - cy) * t;
      const sign = (lagnaSign + k - 1) % 12;
      svg += `<text x="${nx}" y="${ny + 5}" text-anchor="middle" font-size="14" fill="#b5441b" font-weight="700">${sign + 1}</text>`;
      const tri = !KENDRA.includes(k);
      let items = groups[k] || [];
      if (items.length > (tri ? 2 : 4)) items = items.map((o) => ({ ...o, t: o.t.replace(/ \d+°/, "") }));
      const side = [3, 5, 9, 11].includes(k);
      const fs = items.length > 3 ? 11.5 : tri ? 12.5 : 13.5;
      const lh = fs + 2;
      const cols = tri && !side && items.length > 3 ? 2 : 1;
      const rows = Math.ceil(items.length / cols);
      let ox = cx, oy = cy;
      if (tri) { ox = cx - (iv[0] - cx) * 0.05; oy = cy - (iv[1] - cy) * 0.05; }
      if (k === 1) oy -= 12; if (k === 7) oy += 12; if (k === 4) ox -= 14; if (k === 10) ox += 14;
      items.forEach((txt, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = ox + (cols === 2 ? (col === 0 ? -20 : 20) : 0);
        const y = oy - ((rows - 1) * lh) / 2 + row * lh + fs / 3;
        svg += `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${txt.color}">${esc(txt.t)}</text>`;
      });
    }
    if (highlightAsc) svg += `<text x="${h}" y="${q - 52}" text-anchor="middle" font-size="11" fill="#8a3a17">लग्न</text>`;
    svg += `</svg>`;
    return `<div class="chartbox"><h3>${esc(title)}</h3>${svg}</div>`;
  }
  function planetLabel(r, p, withDeg) {
    const x = r.planets[p];
    let t = J.GRAHA_SHORT[p];
    if (withDeg) t += ` ${Math.floor(x.deg)}°`;
    if (x.retro && p !== "Rahu" && p !== "Ketu") t += "(व)";
    if (x.combust) t += "(अ)";
    const color = x.dignity.key === "exalt" ? "#1e7a3c" : x.dignity.key === "debil" ? "#b3261e" : "#2b1d14";
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
    if (s >= 66) return { label: "उत्तम", color: "#2f7d4a" };
    if (s >= 52) return { label: "अच्छा", color: "#67993a" };
    if (s >= 40) return { label: "मध्यम", color: "#b8860b" };
    return { label: "संघर्षपूर्ण", color: "#b3261e" };
  }
  const CAREER = {
    Sun: "सरकारी सेवा, प्रशासन, राजनीति, चिकित्सा", Moon: "जनसेवा, होटल/खाद्य, नर्सिंग, जल-सम्बन्धी व्यापार, डेयरी",
    Mars: "इंजीनियरिंग, सेना/पुलिस, भूमि-भवन, खेल, शल्य-चिकित्सा", Mercury: "व्यापार, लेखा, आईटी, लेखन, मीडिया, शिक्षण",
    Jupiter: "अध्यापन, विधि, बैंकिंग/वित्त, धर्म-कार्य, परामर्श", Venus: "कला, फैशन, फ़िल्म, सौन्दर्य, होटल, वाहन, विलासिता",
    Saturn: "उद्योग, तेल/खनिज, निर्माण, न्याय, श्रम-प्रबन्धन, लोहा", Rahu: "तकनीक, विदेशी कम्पनियाँ, राजनीति, शोध, विमानन",
    Ketu: "आध्यात्म, ज्योतिष, चिकित्सा, कोडिंग, गूढ़ शोध",
  };

  function lifeAreas(r) {
    const P = r.planets, H = r.houses, female = r.input.gender === "F";
    const L = (h) => H[h - 1].lord;
    const lordLine = (h) => `${ORD(h)} भाव (${J.RASHI[H[h - 1].sign]}) का स्वामी ${G[L(h)]} ${ORD(P[L(h)].house)} भाव में ${P[L(h)].dignity.label} है`;
    const occ = (h) => H[h - 1].occupants.length ? `${ORD(h)} भाव में ${H[h - 1].occupants.map((p) => G[p]).join(", ")} स्थित हैं।` : "";
    const out = [];

    let s = areaScore(r, [1], ["Sun", L(1)]);
    const mal68 = H[5].occupants.concat(H[7].occupants).filter((p) => !BENEFIC.includes(p));
    out.push({ t: "स्वास्थ्य एवं व्यक्तित्व", s, txt: `${lordLine(1)}। ${occ(1)} ${s >= 52 ? "शरीर सामान्यतः स्वस्थ और ऊर्जावान रहेगा, रोग-प्रतिरोधक क्षमता अच्छी।" : "स्वास्थ्य के प्रति सजग रहें; नियमित दिनचर्या, योग और संतुलित आहार आवश्यक।"} ${mal68.length ? `छठे/आठवें भाव में पाप ग्रह (${mal68.map((p) => G[p]).join(", ")}) होने से स्वास्थ्य के प्रति विशेष सावधानी रखें।` : ""}` });

    s = areaScore(r, [4, 5], ["Mercury", "Jupiter"]);
    out.push({ t: "शिक्षा एवं बुद्धि", s, txt: `${lordLine(5)}। ${occ(5)} बुध ${P.Mercury.dignity.label}, गुरु ${P.Jupiter.dignity.label}। ${s >= 52 ? "शिक्षा में अच्छी सफलता, स्मरण-शक्ति और विश्लेषण क्षमता उत्तम; उच्च शिक्षा के योग।" : "शिक्षा में बाधाएँ या रुचि-परिवर्तन सम्भव; निरन्तर अभ्यास से सफलता मिलेगी। सरस्वती वंदना लाभकारी।"}` });

    s = areaScore(r, [2, 11], ["Jupiter"]);
    out.push({ t: "धन एवं सम्पत्ति", s, txt: `${lordLine(2)}; ${lordLine(11)}। ${occ(2)} ${occ(11)} ${s >= 66 ? "धन-संचय के प्रबल योग, आय के अनेक स्रोत।" : s >= 52 ? "आय अच्छी, धीरे-धीरे सम्पत्ति बढ़ेगी।" : s >= 40 ? "आय सामान्य; बचत और निवेश में अनुशासन आवश्यक।" : "धन में उतार-चढ़ाव; ऋण और जोखिम भरे निवेश से बचें।"} चतुर्थ भाव ${tier(houseScore(r, 4)).label} — भूमि/वाहन सुख ${houseScore(r, 4) >= 52 ? "मिलेगा" : "देर से मिलेगा"}।` });

    s = areaScore(r, [10], ["Sun", "Saturn"]);
    const yk = A.PLANETS.filter((p) => { const o = ownedHouses(r, p); return o.some((h) => [4, 7, 10].includes(h)) && o.some((h) => [5, 9].includes(h)); });
    const cpKeys = [...new Set([...H[9].occupants, L(10), ...yk])];
    out.push({ t: "करियर एवं व्यवसाय", s, txt: `${lordLine(10)}। ${occ(10)} ${s >= 66 ? "कार्यक्षेत्र में उच्च पद, नेतृत्व और प्रतिष्ठा के प्रबल योग।" : s >= 52 ? "कर्म-क्षेत्र में अच्छी उन्नति; परिश्रम का पूरा फल मिलेगा।" : "करियर में संघर्ष और परिवर्तन सम्भव; धैर्य और निरन्तरता से स्थायित्व आएगा।"} अनुकूल क्षेत्र: ${cpKeys.map((k) => CAREER[k]).join("; ")}। ${P[L(10)].house === 7 || H[6].occupants.includes(L(10)) ? "व्यापार/साझेदारी विशेष लाभकारी।" : [6, 10].includes(P[L(10)].house) ? "नौकरी/सेवा क्षेत्र अधिक अनुकूल।" : ""}` });

    const kar = female ? "Jupiter" : "Venus";
    s = areaScore(r, [7], [kar]);
    const mang = r.yogas.find((y) => y.name === "मांगलिक दोष");
    out.push({ t: "विवाह एवं दाम्पत्य", s, txt: `${lordLine(7)}। ${occ(7)} ${female ? "पति-कारक गुरु" : "पत्नी-कारक शुक्र"} ${P[kar].dignity.label} (${ORD(P[kar].house)} भाव)। ${s >= 52 ? "दाम्पत्य जीवन सामान्यतः सुखी, जीवनसाथी सहयोगी।" : "दाम्पत्य में धैर्य और संवाद आवश्यक; कुंडली मिलान ध्यान से करें।"} ${H[6].occupants.includes("Saturn") || P[L(7)].house === 12 || P[L(7)].house === 8 ? "विवाह में कुछ विलम्ब सम्भव।" : ""} ${mang ? (mang.cancelled ? "मांगलिक दोष है परन्तु परिहार होता है।" : "मांगलिक दोष विचारणीय।") : "मांगलिक दोष नहीं।"} ${marriageTiming(r)}` });

    s = areaScore(r, [5], ["Jupiter"]);
    out.push({ t: "संतान", s, txt: `${lordLine(5)}। ${occ(5)} ${s >= 52 ? "संतान सुख के अच्छे योग; संतान बुद्धिमान और आज्ञाकारी।" : "संतान-सुख में विलम्ब या चिन्ता सम्भव; संतान गोपाल मंत्र और गुरुवार व्रत लाभकारी।"}` });

    s = areaScore(r, [9], ["Jupiter", "Sun"]);
    out.push({ t: "भाग्य एवं धर्म", s, txt: `${lordLine(9)}। ${occ(9)} ${s >= 52 ? "भाग्य प्रबल, गुरुजनों और पिता का आशीर्वाद; धार्मिक कार्यों में रुचि।" : "भाग्य परिश्रम के बाद साथ देगा; पिता/गुरु से सम्बन्धों में संवेदनशीलता रखें।"}` });

    const fsig = [P.Rahu.house === 12 || P.Rahu.house === 9 || P.Rahu.house === 7 || P.Rahu.house === 10, [6, 8, 12].includes(P[L(12)].house) || P[L(12)].house === 9, H[11].occupants.length > 0, P[L(9)].house === 12, P[L(1)].house === 12].filter(Boolean).length;
    out.push({ t: "विदेश यात्रा / वास", s: 30 + fsig * 15, txt: fsig >= 3 ? "विदेश यात्रा और विदेश में निवास/कार्य के प्रबल योग (राहु, द्वादश भाव व भाग्येश के संकेत)।" : fsig >= 2 ? "विदेश यात्रा के अच्छे योग; कार्यवश विदेश जाने के अवसर मिलेंगे।" : fsig === 1 ? "विदेश यात्रा सम्भव, परन्तु स्थायी वास के योग कमज़ोर।" : "जन्मस्थान/स्वदेश में ही उन्नति के योग अधिक।" });
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
  function periodRating(r, md, ad) {
    let v = lordQuality(r, md) * 0.5 + lordQuality(r, ad);
    const rel = J.houseFrom(r.planets[md].sign, r.planets[ad].sign);
    if ([6, 8, 12].includes(rel)) v -= 1; else if ([1, 4, 5, 7, 9, 10, 11].includes(rel)) v += 0.7;
    if (v >= 3) return { r: 4, label: "उत्तम" };
    if (v >= 1) return { r: 3, label: "शुभ" };
    if (v >= -1) return { r: 2, label: "मिश्रित" };
    return { r: 1, label: "सावधानी" };
  }
  function periodThemes(r, p) {
    const hs = new Set([r.planets[p].house, ...ownedHouses(r, p)]);
    if (p === "Rahu" || p === "Ketu") hs.add(r.planets[J.RASHI_LORD[r.planets[p].sign]].house); // राशीश का भाव
    return [...hs].sort((a, b) => a - b).map((h) => `${F.BHAVA[h - 1].k.split(",").slice(0, 2).join(",")} (${ORD(h)})`).join("; ");
  }
  const RATING_TEXT = {
    4: "अत्यन्त अनुकूल समय — नए कार्य, निवेश, विवाह या पद-वृद्धि के लिए श्रेष्ठ।",
    3: "अनुकूल समय — प्रयासों में सफलता, मान-सम्मान और लाभ।",
    2: "मिश्रित समय — कुछ उपलब्धियाँ, कुछ बाधाएँ; सोच-समझकर निर्णय लें।",
    1: "चुनौतीपूर्ण समय — स्वास्थ्य, धन और विवादों में सावधानी; उपाय करें।",
  };

  function marriageTiming(r) {
    const female = r.input.gender === "F";
    const sig = new Set([r.houses[6].lord, female ? "Jupiter" : "Venus", ...r.houses[6].occupants, r.houses[1].lord]);
    const birth = r.chart.jd, Y = J.YEAR_DAYS, now = A.dateToJd(new Date());
    const hits = [];
    for (const md of r.dasha.list) for (const ad of md.antar) {
      const age = (ad.start - birth) / Y, ageEnd = (ad.end - birth) / Y;
      if (ageEnd < 21 || age > 38 || ad.end < now) continue;
      if (sig.has(ad.lord) && (sig.has(md.lord) || ["Venus", "Jupiter", "Moon"].includes(ad.lord))) hits.push(`${G[md.lord]}-${G[ad.lord]} (${fmtDate(ad.start, r.input.tzOffsetMin)} से ${fmtDate(ad.end, r.input.tzOffsetMin)})`);
    }
    if (!hits.length) for (const md of r.dasha.list) for (const ad of md.antar) {
      const age = (ad.start - birth) / Y;
      if (age >= 21 && age <= 36 && ad.end > now && sig.has(ad.lord)) hits.push(`${G[md.lord]}-${G[ad.lord]} (${fmtDate(ad.start, r.input.tzOffsetMin)} से ${fmtDate(ad.end, r.input.tzOffsetMin)})`);
    }
    return hits.length ? `विवाह के सम्भावित काल (दशा-अन्तर्दशा): ${hits.slice(0, 3).join(", ")}।` : "";
  }

  // ---------------- रिपोर्ट ----------------
  function render(input) {
    const r = J.analyze(input);
    const P = r.planets, tz = input.tzOffsetMin, av = r.avakhada;
    const nowJd = A.dateToJd(new Date());
    const cur = J.findCurrent(r.dasha, nowJd);
    const birthStr = `${String(input.day).padStart(2, "0")}-${String(input.month).padStart(2, "0")}-${input.year}, ${String(input.hour).padStart(2, "0")}:${String(input.minute).padStart(2, "0")}`;
    const ageNow = (nowJd - r.chart.jd) / J.YEAR_DAYS;

    let html = "";
    // शीर्ष
    html += `<section class="card"><div class="toolbar"><div class="person"><h2>${esc(input.name)}</h2>
      <p>${input.gender === "F" ? "स्त्री" : "पुरुष"} · जन्म: ${birthStr} (UTC ${tz >= 0 ? "+" : "−"}${fmtOffset(Math.abs(tz))}) · ${esc(input.place || "")}</p>
      <p>अक्षांश ${input.lat.toFixed(4)}°, देशान्तर ${input.lon.toFixed(4)}° · लाहिरी अयनांश ${J.dms(r.chart.ayanamsa)} · वर्तमान आयु ~${ageNow > 0 ? Math.floor(ageNow) : 0} वर्ष</p></div>
      <div class="no-print"><button class="ghost" onclick="window.print()">🖨️ प्रिंट / PDF</button> <button class="ghost" id="editBtn">✏️ बदलें</button></div></div></section>`;

    // अवकहड़ा + पंचांग
    html += `<section class="card"><h2>अवकहड़ा चक्र एवं पंचांग</h2><div class="kv">
      ${[["लग्न", `${av.lagna} ${J.dms(r.chart.ascendant.deg)}`], ["लग्नेश", av.lagnaLord], ["राशि (चन्द्र)", av.rashi], ["राशि स्वामी", av.rashiLord], ["नक्षत्र", av.nakshatra], ["नक्षत्र स्वामी", av.nakLord], ["नक्षत्र देवता", av.deity], ["नामाक्षर", av.namAkshar], ["गण", av.gana], ["योनि", av.yoni], ["नाड़ी", av.nadi], ["वर्ण", av.varna], ["वश्य", av.vashya], ["तत्त्व (राशि)", av.tattva], ["सूर्य राशि", av.sunSign],
        ["वार", r.panchang.vaar], ["तिथि", r.panchang.tithi], ["योग", r.panchang.yoga], ["करण", r.panchang.karana], ["सूर्योदय / सूर्यास्त", r.sun ? `${hm(r.sun.rise)} / ${hm(r.sun.set)}` : "—"],
        ["दशा शेष (जन्म पर)", `${G[r.dasha.balance.lord]} ${Math.floor(r.dasha.balance.years)} वर्ष ${Math.floor((r.dasha.balance.years % 1) * 12)} मास`]]
        .map(([k, v]) => `<div><span>${k}</span><span>${esc(v)}</span></div>`).join("")}
      </div>${r.sun && (input.hour * 60 + input.minute) < r.sun.rise.h * 60 + r.sun.rise.m ? `<p class="note">ध्यान दें: जन्म सूर्योदय से पहले है — वैदिक परम्परा में वार पिछले दिन का (${["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"][(new Date(Date.UTC(input.year, input.month - 1, input.day)).getUTCDay() + 6) % 7]}) माना जाता है।</p>` : ""}</section>`;

    // चार्ट
    html += `<section class="card"><h2>कुंडली चक्र</h2><div class="charts">
      ${northChart("लग्न कुंडली (D1)", r.lagnaSign, (p) => P[p].house, (p) => planetLabel(r, p, true), true)}
      ${northChart("चन्द्र कुंडली", r.moonSign, (p) => J.houseFrom(r.moonSign, P[p].sign), (p) => planetLabel(r, p, false), true)}
      ${northChart("नवांश कुंडली (D9)", r.ascNav, (p) => J.houseFrom(r.ascNav, P[p].navamsa), (p) => ({ t: J.GRAHA_SHORT[p] + (P[p].vargottama ? "*" : ""), color: "#2b1d14" }), true)}
      </div><p class="note">अंक = राशि (1 मेष … 12 मीन)। (व) वक्री, (अ) अस्त, ↑ उच्च, ↓ नीच, * वर्गोत्तम। ऊपर का मध्य कोष्ठ प्रथम भाव (लग्न) है; भाव वामावर्त (anticlockwise) चलते हैं।</p></section>`;

    // ग्रह स्पष्ट
    html += `<section class="card"><h2>ग्रह स्पष्ट</h2><div style="overflow-x:auto"><table><thead><tr><th>ग्रह</th><th>राशि</th><th>अंश</th><th>नक्षत्र (चरण)</th><th class="hide-sm">नक्षत्र स्वामी</th><th>भाव</th><th>स्थिति</th><th>बल</th></tr></thead><tbody>
      <tr><td><b>लग्न</b></td><td>${J.RASHI[r.lagnaSign]}</td><td>${J.dms(r.chart.ascendant.deg)}</td><td>${r.ascNk.name} (${r.ascNk.pada})</td><td class="hide-sm">${G[r.ascNk.lord]}</td><td>1</td><td></td><td></td></tr>
      ${A.PLANETS.map((p) => {
        const x = P[p], st = r.strength[p];
        const col = st >= 65 ? "#2f7d4a" : st >= 45 ? "#b8860b" : "#b3261e";
        return `<tr><td><b>${G[p]}</b></td><td>${J.RASHI[x.sign]}</td><td>${J.dms(x.deg)}</td><td>${x.nak.name} (${x.nak.pada})</td><td class="hide-sm">${G[x.nak.lord]}</td><td>${x.house}</td>
        <td><span class="tag ${x.dignity.key}">${x.dignity.label}</span>${x.retro && p !== "Rahu" && p !== "Ketu" ? `<span class="tag retro">वक्री</span>` : ""}${x.combust ? `<span class="tag combust">अस्त</span>` : ""}${x.vargottama ? `<span class="tag varg">वर्गोत्तम</span>` : ""}</td>
        <td><div class="bar" title="${st}/100"><i style="width:${st}%;background:${col}"></i></div><span class="note">${st}</span></td></tr>`;
      }).join("")}
      </tbody></table></div><p class="note">बल: स्थान (उच्च/स्व/मित्र/शत्रु/नीच), केन्द्र-त्रिकोण-दुःस्थान, दिग्बल, अस्त, वक्री व वर्गोत्तम के आधार पर सरल गणना।</p></section>`;

    // मुख्य फलादेश
    html += `<section class="card phala"><h2>फलादेश — स्वभाव एवं व्यक्तित्व</h2>
      <h3>लग्न फल</h3><p>${F.LAGNA[r.lagnaSign]}</p>
      <h3>राशि फल</h3><p>${F.RASHI[r.moonSign]}</p>
      <h3>जन्म नक्षत्र फल</h3><p>${F.NAK[r.moonNk.idx]} नक्षत्र स्वामी ${G[r.moonNk.lord]} होने से जीवन की प्रथम दशा ${G[r.dasha.balance.lord]} की रही।</p></section>`;

    // जीवन क्षेत्र
    html += `<section class="card"><h2>जीवन के प्रमुख क्षेत्र — सार</h2><div class="areas">
      ${lifeAreas(r).map((a) => { const t = tier(a.s); return `<div class="area"><h4>${a.t}<span class="score" style="background:${t.color}">${t.label}</span></h4><p>${a.txt.replace(/\s+/g, " ")}</p></div>`; }).join("")}
      </div><p class="note">यह सार भावेश की स्थिति, भाव में स्थित ग्रह, गुरु-शनि-मंगल की दृष्टि और कारक ग्रह के बल के पाराशरी सिद्धान्तों पर आधारित है।</p></section>`;

    // वर्तमान दशा
    if (cur) {
      const pr = periodRating(r, cur.md.lord, cur.ad.lord);
      html += `<section class="card"><h2>वर्तमान दशा एवं भविष्य</h2><div class="dasha-current">
        <p><b>महादशा:</b> ${G[cur.md.lord]} (${fmtDate(cur.md.start, tz)} – ${fmtDate(cur.md.end, tz)}) · <b>अन्तर्दशा:</b> ${G[cur.ad.lord]} (${fmtDate(cur.ad.start, tz)} – ${fmtDate(cur.ad.end, tz)})${cur.pd ? ` · <b>प्रत्यन्तर:</b> ${G[cur.pd.lord]} (${fmtDate(cur.pd.end, tz)} तक)` : ""} <span class="rating r${pr.r}">${pr.label}</span></p>
        <p>${F.DASHA[cur.md.lord]}</p>
        <p>इस जन्मकुंडली में ${G[cur.md.lord]} ${ORD(P[cur.md.lord].house)} भाव में ${P[cur.md.lord].dignity.label} है${ownedHouses(r, cur.md.lord).length ? ` और ${ownedHouses(r, cur.md.lord).map(ORD).join(", ")} भाव का स्वामी है` : ""}। अतः यह दशा मुख्यतः <b>${periodThemes(r, cur.md.lord)}</b> से जुड़े फल देगी। ${F.DIGNITY_TEXT[P[cur.md.lord].dignity.key]}</p>
        <p>वर्तमान ${G[cur.ad.lord]} अन्तर्दशा: ${RATING_TEXT[pr.r]} विषय: ${periodThemes(r, cur.ad.lord)}।</p>
        </div>`;
      // आगामी अवधियाँ
      const upcoming = [];
      for (const md of r.dasha.list) for (const ad of md.antar) if (ad.end > nowJd && upcoming.length < 14) upcoming.push({ md, ad });
      html += `<h3>आगामी समय-फल (अन्तर्दशा अनुसार)</h3><div style="overflow-x:auto"><table><thead><tr><th>अवधि</th><th>दशा</th><th>फल</th><th>प्रमुख विषय</th></tr></thead><tbody>
        ${upcoming.map(({ md, ad }) => { const pr2 = periodRating(r, md.lord, ad.lord); const isNow = nowJd >= ad.start && nowJd < ad.end; return `<tr class="${isNow ? "now" : ""}"><td style="white-space:nowrap">${fmtDate(Math.max(ad.start, r.chart.jd), tz)}<br>${fmtDate(ad.end, tz)}</td><td>${G[md.lord]}–${G[ad.lord]}</td><td><span class="rating r${pr2.r}">${pr2.label}</span></td><td>${periodThemes(r, ad.lord)}</td></tr>`; }).join("")}
        </tbody></table></div></section>`;
    }

    // गोचर
    const tr = r.transit;
    html += `<section class="card"><h2>वर्तमान गोचर (आज की ग्रह-स्थिति)</h2>
      <p>आज शनि ${J.RASHI[tr.satSign]} में है — आपकी चन्द्र राशि से ${ORD(tr.satFromMoon)} भाव में। ${tr.sadeSati ? `<b style="color:var(--bad)">${tr.sadeSati}</b>` : tr.dhaiya ? `<b style="color:var(--warn)">${tr.dhaiya}</b>` : "अभी साढ़ेसाती या ढैय्या नहीं है।"} ${[3, 6, 11].includes(tr.satFromMoon) ? "शनि का गोचर शुभ है — परिश्रम का अच्छा फल।" : ""}</p>
      <p>गुरु ${J.RASHI[tr.jupSign]} में — चन्द्र राशि से ${ORD(tr.jupFromMoon)} भाव में। ${tr.jupGood ? "गुरु का गोचर शुभ है: धन, शुभ कार्य, विवाह/संतान और उन्नति के अवसर।" : "गुरु का गोचर सामान्य/प्रतिकूल है: बड़े निर्णयों में सावधानी, गुरु उपासना लाभकारी।"}</p>
      <p>राहु ${J.RASHI[Math.floor(tr.pos.Rahu / 30)]} में, केतु ${J.RASHI[Math.floor(tr.pos.Ketu / 30)]} में (चन्द्र से क्रमशः ${ORD(J.houseFrom(r.moonSign, Math.floor(tr.pos.Rahu / 30)))} व ${ORD(J.houseFrom(r.moonSign, Math.floor(tr.pos.Ketu / 30)))} भाव)।</p></section>`;

    // योग
    html += `<section class="card"><h2>योग एवं दोष</h2>${r.yogas.length ? r.yogas.map((y) => `<div class="yoga ${y.cancelled ? "cancel" : y.good ? "good" : "bad"}"><h4>${y.good ? "✅" : y.cancelled ? "⚠️" : "❗"} ${y.name}${y.cancelled ? " (परिहार/भंग)" : ""}</h4><div>${y.text}</div></div>`).join("") : "<p>कोई प्रमुख योग नहीं मिला।</p>"}</section>`;

    // ग्रह फल
    html += `<section class="card phala"><h2>ग्रह फल (भाव अनुसार)</h2>
      ${A.PLANETS.map((p) => { const x = P[p]; return `<div class="planet-phala"><b>${G[p]}</b> — ${J.RASHI[x.sign]} ${Math.floor(x.deg)}°, ${ORD(x.house)} भाव, ${x.nak.name} नक्षत्र<br>${F.GB[p][x.house - 1]} ${p !== "Rahu" && p !== "Ketu" ? `${G[p]} ${F.DIGNITY_TEXT[x.dignity.key]}` : ""} ${x.combust ? `${G[p]} सूर्य के निकट होने से अस्त है — इसके फल में कमी आएगी।` : ""} ${x.retro && p !== "Rahu" && p !== "Ketu" ? `वक्री ${G[p]} अपने कारकत्व में असामान्य, विलम्बित पर गहन फल देता है।` : ""} ${x.vargottama ? "वर्गोत्तम होने से यह ग्रह विशेष बलवान है।" : ""}${ownedHouses(r, p).length ? ` <span class="note">(${ownedHouses(r, p).map(ORD).join(", ")} भाव का स्वामी)</span>` : ""}</div>`; }).join("")}</section>`;

    // भाव फल
    html += `<section class="card phala"><h2>द्वादश भाव फल</h2><div style="overflow-x:auto"><table><thead><tr><th>भाव</th><th>राशि</th><th>विषय</th><th>स्थित ग्रह</th><th>भावेश फल</th><th>स्थिति</th></tr></thead><tbody>
      ${r.houses.map((hs) => { const t = tier(houseScore(r, hs.h)); return `<tr><td><b>${hs.h}</b> ${F.BHAVA[hs.h - 1].name}</td><td>${J.RASHI[hs.sign]}</td><td class="note">${F.BHAVA[hs.h - 1].k}</td><td>${hs.occupants.map((p) => G[p]).join(", ") || "—"}</td><td>भावेश ${G[hs.lord]} ${F.LORD_IN[P[hs.lord].house - 1]}</td><td><span class="rating" style="background:${t.color}">${t.label}</span></td></tr>`; }).join("")}
      </tbody></table></div></section>`;

    // विंशोत्तरी
    html += `<section class="card"><h2>विंशोत्तरी दशा (120 वर्ष)</h2><p class="note">महादशा पर क्लिक करके अन्तर्दशाएँ देखें।</p>
      ${r.dasha.list.filter((md) => md.end > r.chart.jd && (md.start - r.chart.jd) / J.YEAR_DAYS < 120).map((md) => { const isNow = cur && cur.md === md; return `<details class="${isNow ? "now" : ""}" ${isNow ? "open" : ""}><summary><span>${G[md.lord]} महादशा (${J.DASHA_YEARS[md.lord]} वर्ष)</span><span class="note">${fmtDate(Math.max(md.start, r.chart.jd), tz)} – ${fmtDate(md.end, tz)} · आयु ${Math.max(0, Math.floor((md.start - r.chart.jd) / J.YEAR_DAYS))}–${Math.floor((md.end - r.chart.jd) / J.YEAR_DAYS)}</span></summary>
        <table><thead><tr><th>अन्तर्दशा</th><th>आरम्भ</th><th>समाप्ति</th><th>फल</th></tr></thead><tbody>${md.antar.filter((ad) => ad.end > r.chart.jd).map((ad) => { const pr3 = periodRating(r, md.lord, ad.lord); const n = cur && cur.ad === ad; return `<tr class="${n ? "now" : ""}"><td>${G[md.lord]}–${G[ad.lord]}</td><td>${fmtDate(Math.max(ad.start, r.chart.jd), tz)}</td><td>${fmtDate(ad.end, tz)}</td><td><span class="rating r${pr3.r}">${pr3.label}</span></td></tr>`; }).join("")}</tbody></table></details>`; }).join("")}</section>`;

    // उपाय
    const weak = A.PLANETS.filter((p) => r.strength[p] < 42 || P[p].dignity.key === "debil" || P[p].combust);
    const curLords = cur ? [cur.md.lord, cur.ad.lord] : [];
    const remedyFor = [...new Set([...weak, ...curLords.filter((p) => lordQuality(r, p) < 0)])];
    html += `<section class="card"><h2>उपाय (शान्ति)</h2>
      <p>निर्बल/पीड़ित ग्रह: <b>${remedyFor.map((p) => G[p]).join(", ") || "कोई विशेष नहीं"}</b>। लग्नेश ${G[r.houses[0].lord]}, पंचमेश ${G[r.houses[4].lord]} और नवमेश ${G[r.houses[8].lord]} आपके लिए शुभ ग्रह हैं — इनका रत्न सामान्यतः अनुकूल रहता है।</p>
      ${remedyFor.length ? `<div style="overflow-x:auto"><table><thead><tr><th>ग्रह</th><th>मंत्र</th><th>दान</th><th>व्रत / उपासना</th></tr></thead><tbody>${remedyFor.map((p) => `<tr><td><b>${G[p]}</b></td><td>${F.REMEDY[p].mantra}</td><td>${F.REMEDY[p].daan}</td><td>${F.REMEDY[p].vrat}</td></tr>`).join("")}</tbody></table></div>` : ""}
      <h3>शुभ रत्न (लग्न अनुसार)</h3><p>${[r.houses[0].lord, r.houses[4].lord, r.houses[8].lord].filter((v, i, a) => a.indexOf(v) === i).map((p) => `${G[p]}: ${F.REMEDY[p].ratna}`).join("<br>")}</p>
      <p class="note">नीच/अस्त ग्रह का रत्न बिना विशेषज्ञ सलाह के न पहनें। मंत्र-जप, दान और सदाचार सबसे सुरक्षित उपाय हैं।</p></section>`;

    html += `<section class="card"><p class="note">गणना-विधि: ग्रहों के सायन भोगांश खगोलीय कक्षीय सूत्रों से (सटीकता ~1-3 कला), लाहिरी (चित्रपक्ष) अयनांश, सम्पूर्ण-राशि भाव पद्धति (पाराशरी), मध्यम राहु। फलादेश BPHS, फलदीपिका, सारावली के सिद्धान्तों का सरल सार है; अन्तिम निर्णय में सम्पूर्ण कुंडली का समग्र विचार आवश्यक है।</p></section>`;

    const rep = $("report");
    rep.innerHTML = html;
    rep.hidden = false;
    $("formCard").hidden = true;
    $("editBtn").onclick = () => { $("formCard").hidden = false; $("formCard").scrollIntoView({ behavior: "smooth" }); };
    rep.scrollIntoView({ behavior: "smooth" });
  }
  window.__renderKundli = render;
})();
