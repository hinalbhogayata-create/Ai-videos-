/* anim.js — एनिमेशन: राशि-चक्र, नवग्रह लोडर, खंडों का उभरना, चार्ट रेखांकन, गिनती */
(function () {
  "use strict";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

  // ---------- हेडर: घूमता राशि-चक्र + तारे ----------
  function zodiacWheel() {
    const R = 210, r2 = 168, cx = 230, cy = 230;
    let s = `<svg class="zwheel" viewBox="0 0 460 460" aria-hidden="true"><g>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="60" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 5"/>`;
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180, b = ((i + 0.5) * 30 - 90) * Math.PI / 180;
      s += `<line x1="${cx + r2 * Math.cos(a)}" y1="${cy + r2 * Math.sin(a)}" x2="${cx + R * Math.cos(a)}" y2="${cy + R * Math.sin(a)}" stroke="currentColor" stroke-width="1"/>`;
      s += `<text x="${cx + 189 * Math.cos(b)}" y="${cy + 189 * Math.sin(b) + 8}" text-anchor="middle" font-size="22" fill="currentColor">${SIGNS[i]}</text>`;
    }
    for (let i = 0; i < 36; i++) { const a = i * 10 * Math.PI / 180; s += `<line x1="${cx + 60 * Math.cos(a)}" y1="${cy + 60 * Math.sin(a)}" x2="${cx + 150 * Math.cos(a)}" y2="${cy + 150 * Math.sin(a)}" stroke="currentColor" stroke-width=".4" opacity=".6"/>`; }
    return s + `</g></svg>`;
  }
  function decorateHeader() {
    const top = document.querySelector(".top");
    if (!top || top.querySelector(".zwheel")) return;
    const deco = document.createElement("div");
    deco.className = "sky";
    deco.setAttribute("aria-hidden", "true");
    let stars = "";
    for (let i = 0; i < 28; i++) stars += `<i style="left:${(i * 37) % 100}%;top:${(i * 53) % 100}%;animation-delay:${(i % 7) * 0.6}s;transform:scale(${0.5 + (i % 3) * 0.35})"></i>`;
    deco.innerHTML = zodiacWheel() + zodiacWheel().replace('class="zwheel"', 'class="zwheel z2"') + stars;
    top.prepend(deco);
  }

  // ---------- नवग्रह लोडर ----------
  const ORBIT = [["#ff9d2e", "सू"], ["#f4f4f4", "चं"], ["#e0452c", "मं"], ["#4caf50", "बु"], ["#ffd23f", "गु"], ["#ffffff", "शु"], ["#4a5bd4", "श"], ["#7a7a7a", "रा"], ["#a1887f", "के"]];
  let overlay = null;
  function loading(cb, text) {
    if (reduce) { cb(); return; }
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "loader";
      overlay.setAttribute("role", "status");
      overlay.innerHTML = `<div class="orbit">${ORBIT.map(([c, t], i) => `<span class="pl" style="--i:${i};--c:${c}"><b>${t}</b></span>`).join("")}<div class="sun">ॐ</div></div><p class="ltext"></p>`;
      document.body.appendChild(overlay);
    }
    overlay.querySelector(".ltext").textContent = text || (window.I18N && window.I18N.lang === "en" ? "Calculating…" : "गणना हो रही है…");
    const SH = window.Jyotish && window.Jyotish.GRAHA_SHORT;
    if (SH) overlay.querySelectorAll(".pl b").forEach((b, i) => { b.textContent = SH[["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"][i]]; });
    overlay.classList.add("show");
    setTimeout(() => {
      try { cb(); } finally { overlay.classList.remove("show"); }
    }, 1150);
  }

  // ---------- रिपोर्ट आने पर ----------
  let io = null;
  function afterRender(root) {
    if (!root) return;
    const secs = root.querySelectorAll("section.card");
    if (reduce) return;
    if (!io && "IntersectionObserver" in window) {
      io = new IntersectionObserver((ents) => {
        for (const e of ents) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }, { threshold: 0.08 });
    }
    // खंड कभी छिपाए नहीं जाते — केवल हल्का उभार (सामग्री हमेशा दिखती रहे)
    secs.forEach((s, i) => { s.classList.remove("rise-in"); void s.offsetWidth; s.style.animationDelay = `${Math.min(i, 4) * 70}ms`; s.classList.add("rise-in"); });
    // चार्ट: ग्रह क्रम से प्रकट
    root.querySelectorAll(".chartbox svg").forEach((svg) => {
      svg.classList.add("draw");
      svg.querySelectorAll("text").forEach((t, i) => { t.style.animationDelay = `${0.6 + i * 0.035}s`; });
    });
    // बल पट्टियाँ
    root.querySelectorAll(".bar i").forEach((b, i) => { b.style.animationDelay = `${0.2 + i * 0.06}s`; });
    // गुण-मिलान गिनती
    root.querySelectorAll(".gun-ring").forEach((ring) => {
      const b = ring.querySelector("b"), target = parseFloat(b.textContent);
      const bg = ring.style.background, m = bg.match(/(#[0-9a-f]{3,6}|rgb\([^)]*\))\s+([\d.]+)%/i);
      const color = m ? m[1] : "#b5441b", pct = m ? parseFloat(m[2]) : (target / 36) * 100;
      const t0 = performance.now(), dur = 1300;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        b.textContent = (Math.round(target * e * 2) / 2).toString();
        ring.style.background = `conic-gradient(${color} ${pct * e}%, #f1e6d6 0)`;
        if (k < 1) requestAnimationFrame(step); else b.textContent = String(target);
      };
      requestAnimationFrame(step);
    });
  }

  // ---------- कार्यालय नाम: अक्षर-दर-अक्षर प्रकट + स्वर्ण-लहर ----------
  function splitLetters(el, cls) {
    if (!el || el.dataset.split) return;
    const txt = el.textContent;
    const seg = window.Intl && Intl.Segmenter ? [...new Intl.Segmenter("hi", { granularity: "grapheme" }).segment(txt)].map((x) => x.segment) : [...txt];
    // संयुक्ताक्षर (हलन्त ् से जुड़े) को एक साथ रखें, ताकि "ज्यो", "र्य" आदि सही बनें
    for (let k = seg.length - 2; k >= 0; k--) if (/\u094D$/.test(seg[k]) || /^[\u0900-\u0903\u093A-\u094F\u0962\u0963]/.test(seg[k + 1])) { seg[k] += seg[k + 1]; seg.splice(k + 1, 1); }
    let i = 0;
    el.innerHTML = seg.map((g) => (g === " " ? `<span class="sp"> </span>` : `<span class="ch" aria-hidden="true" style="--i:${i++}">${g}</span>`)).join("");
    el.dataset.split = "1";
    if (cls) el.classList.add(cls);
  }
  function decorateTitle() {
    splitLetters(document.querySelector(".brand-hi"), "split");
    splitLetters(document.querySelector(".brand-en"));
  }

  if (!reduce) {
    const go = () => { decorateHeader(); decorateTitle(); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
  }
  window.Anim = { loading, afterRender, reduce };
})();
