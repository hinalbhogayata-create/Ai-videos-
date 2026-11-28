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
    const r = J.analyze({ name: "", gender: "M", year: y, month: m, day: d, hour: rise.h, minute: rise.m, lat: UJJAIN.lat, lon: UJJAIN.lon, tzOffsetMin: UJJAIN.tz });
    const hm = (t) => `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}`;
    return { r, sun, date: new Date(Date.UTC(y, m - 1, d)), hm };
  }
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
    const { r, sun, date, hm } = t, p = r.panchang;
    const ds = date.toLocaleDateString(tt("hi-IN", "en-IN"), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    const items = [
      ["🗓️", tt("वार", "Day"), p.vaar],
      ["🌙", tt("तिथि", "Tithi"), p.tithi],
      ["✨", tt("नक्षत्र", "Nakshatra"), r.moonNk.name],
      ["🪷", tt("योग", "Yoga"), p.yoga],
      ["🔱", tt("करण", "Karana"), p.karana],
      ["♒", tt("चन्द्र राशि", "Moon sign"), J.RASHI[r.planets.Moon.sign]],
      ["🌅", tt("सूर्योदय", "Sunrise"), sun ? hm(sun.rise) : "—"],
      ["🌇", tt("सूर्यास्त", "Sunset"), sun ? hm(sun.set) : "—"],
    ];
    el.innerHTML = `<div class="ts-head"><span class="ts-diya" aria-hidden="true"><i></i></span><div><b>${tt("आज का पंचांग", "Today's Panchang")}</b><small>${ds} · ${tt("उज्जैन, सूर्योदय-कालीन", "Ujjain, at sunrise")}</small></div></div>
      <div class="ts-items">${items.map(([i, k, v], n) => `<div class="ts-it" style="--n:${n}"><span class="ts-ic">${i}</span><span class="ts-k">${k}</span><span class="ts-v">${v}</span></div>`).join("")}</div>`;
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

  renderStrip();
  if (window.I18N) window.I18N.onChange(renderStrip);
})();
