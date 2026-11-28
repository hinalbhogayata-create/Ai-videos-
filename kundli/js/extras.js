/*
 * extras.js — आज का पंचांग (उज्जैन, सूर्योदय-कालीन — उदया तिथि), स्क्रॉल-प्रगति रेखा, बटन-लहर प्रभाव
 */
(function () {
  "use strict";
  const J = window.Jyotish, A = window.Astro;
  const tt = (hi, en) => (window.I18N && window.I18N.lang === "en" ? en : hi);
  const UJJAIN = { lat: 23.1765, lon: 75.7885, tz: 330 };

  // ---------- आज का पंचांग ----------
  function todayPanchang() {
    const now = new Date(Date.now() + UJJAIN.tz * 60000); // IST
    const y = now.getUTCFullYear(), m = now.getUTCMonth() + 1, d = now.getUTCDate();
    const sun = A.sunriseSunset(y, m, d, UJJAIN.lat, UJJAIN.lon, UJJAIN.tz);
    const rise = sun ? sun.rise : { h: 6, m: 0 };
    const riseJd = sun ? sun.riseJd : A.dateToJd(new Date(Date.UTC(y, m - 1, d, 0, 30)));
    const r = J.analyze({ name: "", gender: "M", year: y, month: m, day: d, hour: rise.h, minute: rise.m, lat: UJJAIN.lat, lon: UJJAIN.lon, tzOffsetMin: UJJAIN.tz });
    const masa = hinduMonth(riseJd, y, m);
    const hm = (t) => `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}`;
    return { r, sun, date: new Date(Date.UTC(y, m - 1, d)), hm, masa };
  }
  // ---------- हिन्दू मास (अमान्त / पूर्णिमान्त), अधिक मास, विक्रम व शक संवत ----------
  const MASA = [["चैत्र", "Chaitra"], ["वैशाख", "Vaishakha"], ["ज्येष्ठ", "Jyeshtha"], ["आषाढ़", "Ashadha"], ["श्रावण", "Shravana"], ["भाद्रपद", "Bhadrapada"], ["आश्विन", "Ashvin"], ["कार्तिक", "Kartika"], ["मार्गशीर्ष", "Margashirsha"], ["पौष", "Pausha"], ["माघ", "Magha"], ["फाल्गुन", "Phalguna"]];
  const elong = (jd) => { const s = A.siderealPositionsAt(jd); return ((s.Moon - s.Sun) % 360 + 360) % 360; };
  const sunSign = (jd) => Math.floor(A.siderealPositionsAt(jd).Sun / 30);
  function newMoon(jd, dir) { // dir -1: पिछली अमावस्या, +1: अगली
    let a = jd, e0 = elong(jd);
    // दैनिक कदम से उस दिन तक जाएँ जहाँ elongation 360→0 पार करता है
    for (let i = 0; i < 32; i++) {
      const b = a + dir, eb = elong(b);
      const crossed = dir < 0 ? eb > e0 + 180 || (eb > e0 && e0 < 15) : eb < e0 - 180;
      if (crossed) { let lo = Math.min(a, b), hi = Math.max(a, b);
        for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (elong(mid) > 180) lo = mid; else hi = mid; }
        return (lo + hi) / 2; }
      a = b; e0 = eb;
    }
    return jd;
  }
  function hinduMonth(jd, y, gm) {
    const prev = newMoon(jd, -1), next = newMoon(jd, 1);
    const s1 = sunSign(prev + 0.01), s2 = sunSign(next + 0.01);
    const idx = (s1 + 1) % 12;
    const adhika = s1 === s2;
    const krishna = elong(jd) >= 180;
    const purn = krishna ? (idx + 1) % 12 : idx; // पूर्णिमान्त: कृष्ण पक्ष में अगला मास
    const vs = y + (gm <= 4 && idx >= 9 ? 56 : 57);
    return { amanta: idx, purnimanta: purn, adhika, krishna, vs, shaka: vs - 135 };
  }
  const SIGN_IC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

  function renderStrip() {
    let el = document.getElementById("todayStrip");
    if (!el) {
      el = document.createElement("section");
      el.id = "todayStrip";
      el.className = "today-strip no-print";
      const nav = document.querySelector("nav.services");
      const req = document.getElementById("requestView");
      (req || nav).parentNode.insertBefore(el, req && nav && nav.compareDocumentPosition(req) & Node.DOCUMENT_POSITION_PRECEDING ? req : nav);
    }
    let t;
    try { t = todayPanchang(); } catch (e) { el.hidden = true; return; }
    const { r, sun, date, hm, masa } = t, p = r.panchang;
    const M = (i) => tt(MASA[i][0], MASA[i][1]);
    const adh = masa.adhika ? tt("अधिक ", "Adhika ") : "";
    const masaTxt = masa.amanta === masa.purnimanta ? adh + M(masa.amanta) : tt(`${adh}${M(masa.amanta)} (अमान्त) · ${M(masa.purnimanta)} (पूर्णिमान्त)`, `${adh}${M(masa.amanta)} (amanta) · ${M(masa.purnimanta)} (purnimanta)`);
    const ds = date.toLocaleDateString(tt("hi-IN", "en-IN"), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    const items = [
      ["🛕", tt("हिन्दू मास", "Hindu month"), masaTxt, "wide"],
      ["📜", tt("संवत", "Samvat"), tt(`विक्रम ${masa.vs} · शक ${masa.shaka}`, `Vikram ${masa.vs} · Shaka ${masa.shaka}`)],
      ["🗓️", tt("वार", "Day"), p.vaar],
      ["🌙", tt("तिथि", "Tithi"), p.tithi],
      ["✨", tt("नक्षत्र", "Nakshatra"), r.moonNk.name],
      ["🪷", tt("योग", "Yoga"), p.yoga],
      ["🔱", tt("करण", "Karana"), p.karana],
      [SIGN_IC[r.planets.Moon.sign], tt("चन्द्र राशि", "Moon sign"), J.RASHI[r.planets.Moon.sign]],
      ["🌅", tt("सूर्योदय / सूर्यास्त", "Sunrise / Sunset"), sun ? `${hm(sun.rise)} / ${hm(sun.set)}` : "—"],
    ];
    el.innerHTML = `<div class="ts-head"><span class="ts-diya" aria-hidden="true"><i></i></span><div><b>${tt("आज का पंचांग", "Today's Panchang")}</b><small>${ds} · ${tt("उज्जैन, सूर्योदय-कालीन", "Ujjain, at sunrise")}</small></div></div>
      <div class="ts-items">${items.map(([i, k, v, cls], n) => `<div class="ts-it ${cls || ""}" style="--n:${n}"><span class="ts-ic">${i}</span><span class="ts-k">${k}</span><span class="ts-v">${v}</span></div>`).join("")}</div>`;
  }

  // ---------- स्क्रॉल प्रगति ----------
  const bar = document.createElement("div");
  bar.className = "scroll-prog no-print";
  document.body.appendChild(bar);
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- बटन लहर ----------
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest("button.primary, button.ghost, .rtabs button, .tab.svc, .tbtn");
    if (!b || (window.Anim && window.Anim.reduce)) return;
    const rc = b.getBoundingClientRect(), s = Math.max(rc.width, rc.height) * 1.4;
    const w = document.createElement("span");
    w.className = "ripple";
    w.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - rc.left - s / 2}px;top:${e.clientY - rc.top - s / 2}px`;
    b.appendChild(w);
    setTimeout(() => w.remove(), 650);
  });

  window.__hinduMonth = hinduMonth;
  renderStrip();
  if (window.I18N) window.I18N.onChange(renderStrip);
})();
