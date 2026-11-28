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
    overlay.querySelector(".ltext").textContent = text || "गणना हो रही है…";
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
    secs.forEach((s, i) => {
      s.classList.add("reveal");
      s.style.transitionDelay = `${Math.min(i, 3) * 80}ms`;
      if (io) io.observe(s); else s.classList.add("in");
    });
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

  if (!reduce) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorateHeader);
    else decorateHeader();
  }
  window.Anim = { loading, afterRender, reduce };
})();
