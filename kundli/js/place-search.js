/*
 * place-search.js — जन्म स्थान की स्वतः खोज (हिन्दी / ગુજરાતી / English)
 * नाम लिखते ही सुझाव; चुनते ही अक्षांश, देशान्तर और समय-क्षेत्र अपने आप भर जाते हैं।
 * मिलान "व्यंजन-ढाँचे" (consonant skeleton) से — इसलिए "मोरबी", "મોરબી", "morbi", "morvi" सब मिलते हैं।
 */
(function (root) {
  "use strict";

  // ---------- देवनागरी → ढाँचा ----------
  const DEV = {
    "क": "K", "ख": "K", "ग": "G", "घ": "G", "ङ": "N", "च": "C", "छ": "C", "ज": "J", "झ": "J", "ञ": "N",
    "ट": "T", "ठ": "T", "ड": "D", "ढ": "D", "ण": "N", "त": "T", "थ": "T", "द": "D", "ध": "D", "न": "N",
    "प": "P", "फ": "P", "ब": "B", "भ": "B", "म": "M", "य": "", "र": "R", "ल": "L", "ळ": "L", "व": "B",
    "श": "S", "ष": "S", "स": "S", "ह": "H", "ऋ": "R", "ृ": "R",
  };
  const NUKTA = { "क़": "K", "ख़": "K", "ग़": "G", "ज़": "J", "ड़": "R", "ढ़": "R", "फ़": "P", "य़": "" };
  function devSkel(s) {
    // गुजराती → देवनागरी (यूनिकोड खण्ड का अन्तर 0x180)
    s = s.replace(/[઀-૿]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x180));
    s = s.normalize("NFC");
    let out = "";
    const ch = [...s];
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i], nx = ch[i + 1];
      if (nx === "़") { out += NUKTA[c + nx] ?? DEV[c] ?? ""; i++; continue; }
      if (NUKTA[c] !== undefined) { out += NUKTA[c]; continue; }
      if (c === "ं") { // अनुस्वार — आगे प/ब/म हो तो म
        const n2 = DEV[nx];
        out += n2 === "P" || n2 === "B" || n2 === "M" ? "M" : "N";
        continue;
      }
      if (DEV[c] !== undefined) {
        out += DEV[c];
        if (DEV[c] && nx !== "\u094D") out += "."; // बीच में स्वर (निहित/मात्रा) है
      } else if (/[\u0905-\u0914]/.test(c)) out += ".";
    }
    return collapse(out);
  }

  // ---------- रोमन → ढाँचा ----------
  const DIG = [["chh", "C"], ["ch", "C"], ["sh", "S"], ["kh", "K"], ["gh", "G"], ["jh", "J"], ["th", "T"], ["dh", "D"], ["ph", "P"], ["bh", "B"], ["rh", "R"], ["ck", "K"]];
  const ONE = { k: "K", g: "G", j: "J", t: "T", d: "D", n: "N", p: "P", f: "P", b: "B", v: "B", w: "B", m: "M", r: "R", l: "L", s: "S", z: "J", q: "K", x: "KS", h: "H" };
  function latSkel(s) {
    s = s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
    let out = "", i = 0, prevCons = false;
    while (i < s.length) {
      let hit = null;
      for (const [d, v] of DIG) if (s.startsWith(d, i)) { hit = [d, v]; break; }
      if (hit) { out += hit[1]; i += hit[0].length; prevCons = true; continue; }
      const c = s[i];
      if (c === "c") { out += "ei".includes(s[i + 1]) ? "S" : "K"; prevCons = true; }
      else if (c === "h") { if (!prevCons) out += "H"; prevCons = false; }
      else if (ONE[c]) { out += ONE[c]; prevCons = true; }
      else { out += "."; prevCons = false; } // स्वर, y
      i++;
    }
    return collapse(out);
  }
  // देवनागरी → सरल रोमन (क्रम-निर्धारण हेतु)
  const TR = { "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n", "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n", "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n", "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ल": "l", "ळ": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h" };
  const VS = { "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ृ": "ri", "ॉ": "o", "ॅ": "e" };
  const VI = { "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri", "ऑ": "o" };
  function devRoman(s) {
    s = s.replace(/[\u0A80-\u0AFF]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x180)).normalize("NFC").replace(/\u093C/g, "");
    const ch = [...s];
    let out = "";
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i], nx = ch[i + 1];
      if (TR[c]) {
        out += TR[c];
        if (nx === "\u094D") { i++; continue; }
        if (VS[nx]) { out += VS[nx]; i++; continue; }
        if (nx && (TR[nx] || nx === "\u0902") && i + 2 < ch.length) out += "a"; // मध्य का अ (अन्तिम अ लुप्त)
        continue;
      }
      if (VI[c]) out += VI[c];
      else if (c === "\u0902") out += "n";
      else if (c === " ") out += " ";
    }
    return out;
  }
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  const collapse = (s) => s.replace(/([A-Z])\1+/g, "$1").replace(/\./g, "");
  const isIndic = (s) => /[ऀ-ॿ઀-૿]/.test(s);
  const plain = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // ---------- सूचकांक ----------
  let INDEX = null;
  function build() {
    INDEX = [];
    const S = root.IN_STATES || [], D = root.IN_DISTS || [];
    for (const c of root.CITIES || []) {
      const m = c.name.match(/^(.*?)\s*\((.*)\)$/);
      const hi = m ? m[1] : c.name, en = m ? m[2] : c.name;
      INDEX.push({ label: hi, en, region: c.region, lat: c.lat, lon: c.lon, tz: c.tz, major: true, lp: plain(en), sk: latSkel(en), hk: devSkel(hi) });
    }
    for (const [name, lat, lon, si, di] of root.IN_PLACES || []) {
      const st = S[si] || ["", ""];
      INDEX.push({ label: name, en: name, region: [D[di], st[1]].filter(Boolean).join(", "), lat, lon, tz: "Asia/Kolkata", major: false, lp: plain(name), sk: latSkel(name), hk: "" });
    }
  }

  function search(q, limit = 8) {
    if (!INDEX) build();
    q = q.trim();
    if (q.length < 2) return [];
    const indic = isIndic(q);
    const qs = indic ? devSkel(q) : latSkel(q);
    const qp = plain(q);
    const qr = (indic ? devRoman(q) : qp).replace(/[^a-z]/g, "").replace(/w/g, "v");
    if (!qs && !qp) return [];
    const res = [];
    for (const e of INDEX) {
      let s = 0;
      if (indic) {
        if (e.label === q || e.label.startsWith(q)) s = 100;
        else if (qs && e.hk === qs) s = 92;
        else if (qs && e.sk === qs) s = 85;
        else if (qs.length >= 2 && (e.sk.startsWith(qs) || e.hk.startsWith(qs))) s = 55;
      } else {
        if (e.lp === qp) s = 100;
        else if (e.lp.startsWith(qp)) s = 88;
        else if (qs && e.sk === qs) s = 80;
        else if (qp.length >= 3 && e.lp.includes(" " + qp)) s = 66;
        else if (qs.length >= 2 && e.sk.startsWith(qs)) s = 50;
      }
      if (!s) continue;
      if (e.major) s += 12;
      const nm = e.lp.replace(/[^a-z]/g, "").replace(/w/g, "v");
      s -= Math.min(lev(qr, nm.slice(0, qr.length + 2)), 8) * 2.5;
      res.push([s - e.en.length * 0.05, e]);
    }
    res.sort((a, b) => b[0] - a[0]);
    const out = [], seen = new Set();
    for (const [, e] of res) {
      const k = e.en.toLowerCase().replace(/[^a-z]/g, "") + "|" + (e.region || "").split(",").pop().trim();
      if (seen.has(k)) continue;
      seen.add(k); out.push(e);
      if (out.length >= limit) break;
    }
    return out;
  }

  // ---------- ड्रॉपडाउन ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function attach(input, onPick) {
    const wrap = document.createElement("div");
    wrap.className = "ps-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.removeAttribute("list");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");
    const list = document.createElement("ul");
    list.className = "ps-list";
    list.setAttribute("role", "listbox");
    list.hidden = true;
    wrap.appendChild(list);
    let items = [], active = -1, timer = null, picked = null;

    function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); active = -1; }
    function draw(note) {
      list.innerHTML = items.map((e, i) => `<li role="option" data-i="${i}" class="${i === active ? "on" : ""}" style="animation-delay:${i * 30}ms"><span class="ps-pin">📍</span><span><b>${esc(e.label)}</b>${e.label !== e.en ? ` <i>${esc(e.en)}</i>` : ""}<small>${esc(e.region || "")}</small></span></li>`).join("")
        + (note ? `<li class="ps-note">${note}</li>` : "");
      list.hidden = !items.length && !note;
      input.setAttribute("aria-expanded", String(!list.hidden));
    }
    function pick(e) {
      picked = e;
      input.value = e.label === e.en ? `${e.en}${e.region ? ", " + e.region : ""}` : `${e.label} (${e.en})`;
      close();
      onPick(e);
    }
    async function online(q) {
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=hi&format=json`);
        const d = await r.json();
        if (input.value.trim() !== q || !d.results) return;
        items = d.results.map((x) => ({ label: x.name, en: x.name, region: [x.admin1, x.country].filter(Boolean).join(", "), lat: x.latitude, lon: x.longitude, tz: x.timezone }));
        active = 0; draw(items.length ? "🌐 इंटरनेट से" : "");
      } catch (err) {
        if (input.value.trim() === q) { items = []; draw("कोई स्थान नहीं मिला। पास के बड़े शहर का नाम लिखें, या नीचे अक्षांश-देशान्तर स्वयं भरें।"); }
      }
    }
    input.addEventListener("input", () => {
      picked = null;
      clearTimeout(timer);
      const q = input.value.trim();
      timer = setTimeout(() => {
        items = search(q);
        active = items.length ? 0 : -1;
        if (!items.length && q.length >= 3) { draw("खोज रहे हैं…"); online(q); }
        else draw("");
      }, 120);
    });
    input.addEventListener("keydown", (ev) => {
      if (list.hidden || !items.length) return;
      if (ev.key === "ArrowDown") { active = (active + 1) % items.length; draw(""); ev.preventDefault(); }
      else if (ev.key === "ArrowUp") { active = (active - 1 + items.length) % items.length; draw(""); ev.preventDefault(); }
      else if (ev.key === "Enter") { if (active >= 0) { pick(items[active]); ev.preventDefault(); } }
      else if (ev.key === "Escape") close();
    });
    list.addEventListener("mousedown", (ev) => {
      const li = ev.target.closest("li[data-i]");
      if (li) { ev.preventDefault(); pick(items[+li.dataset.i]); }
    });
    input.addEventListener("blur", () => setTimeout(close, 150));
    return {
      // सबमिट से पहले: स्थान लिखा है पर चुना नहीं — सबसे अच्छा मेल स्वयं चुन लें
      ensure() {
        if (picked) return true;
        const r = search(input.value.replace(/\s*\(.*\)\s*$/, "").split(",")[0], 1);
        if (r.length) { pick(r[0]); return true; }
        return false;
      },
      setPicked(e) { picked = e; },
    };
  }

  // ---------- फ़ॉर्म से जोड़ना: pre+"place", "lat", "lon", "tz", "tzName", "dob", "tob", "placeInfo" ----------
  function bindPlace(pre) {
    const $ = (id) => document.getElementById(pre + id);
    let manualTz = false;
    const fmt = (min) => `${min >= 0 ? "+" : "−"}${Math.floor(Math.abs(min) / 60)}:${String(Math.abs(min) % 60).padStart(2, "0")}`;
    function updateTz() {
      const tzName = $("tzName").value;
      if (!tzName || manualTz || !root.Astro) return;
      const [y, m, d] = ($("dob").value || "2000-01-01").split("-").map(Number);
      const [hh, mm] = ($("tob").value || "12:00").split(":").map(Number);
      try { $("tz").value = root.Astro.offsetForLocal(y, m, d, hh, mm, tzName) / 60; } catch (e) { /* अमान्य */ }
      info();
    }
    function info() {
      const box = $("placeInfo"), lat = parseFloat($("lat").value), lon = parseFloat($("lon").value), tz = parseFloat($("tz").value);
      if (!box) return;
      if (isNaN(lat) || isNaN(lon)) { box.hidden = true; return; }
      box.innerHTML = `✅ <b>${esc($("place").value.split(",")[0])}</b> · ${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"} · UTC ${fmt(Math.round(tz * 60))}${$("tzName").value === "Asia/Kolkata" ? " (IST)" : ""}`;
      box.hidden = false;
      box.classList.remove("pop"); void box.offsetWidth; box.classList.add("pop");
    }
    function set(e) {
      $("lat").value = (+e.lat).toFixed(4);
      $("lon").value = (+e.lon).toFixed(4);
      $("tzName").value = e.tz || "";
      manualTz = false;
      updateTz(); info();
    }
    const ctl = attach($("place"), set);
    $("place").addEventListener("input", () => { const b = $("placeInfo"); if (b) b.hidden = true; });
    ["dob", "tob"].forEach((f) => $(f) && $(f).addEventListener("change", updateTz));
    $("tz").addEventListener("input", () => { manualTz = true; info(); });
    ["lat", "lon"].forEach((f) => $(f).addEventListener("input", info));
    return {
      // सबमिट से पहले: स्थान चुना न गया हो तो सबसे अच्छा मेल लें; सफल होने पर true
      ensure() {
        const hasCoords = !isNaN(parseFloat($("lat").value)) && !isNaN(parseFloat($("lon").value));
        if (hasCoords && !$("place").value.trim()) return true;
        if (ctl.ensure()) return true;
        return hasCoords;
      },
      setCity(name) { const r = search(name, 1); if (r.length) { $("place").value = r[0].label === r[0].en ? r[0].en : `${r[0].label} (${r[0].en})`; ctl.setPicked(r[0]); set(r[0]); } },
      load(d) { $("place").value = d.place || ""; $("lat").value = d.lat; $("lon").value = d.lon; $("tz").value = d.tzOffsetMin / 60; $("tzName").value = d.tzName || ""; manualTz = true; ctl.setPicked({}); info(); },
    };
  }

  root.PlaceSearch = { search, attach, bindPlace, devSkel, latSkel };
  if (typeof module !== "undefined") module.exports = root.PlaceSearch;
})(typeof window !== "undefined" ? window : globalThis);
