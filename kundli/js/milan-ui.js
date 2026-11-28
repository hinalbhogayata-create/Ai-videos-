/* milan-ui.js — टैब और गुण मिलान का UI */
(function () {
  "use strict";
  const A = window.Astro, J = window.Jyotish, M = window.Milan;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- टैब ----------
  function show(view) {
    for (const t of document.querySelectorAll(".tab")) t.classList.toggle("active", t.dataset.view === view);
    $("kundliView").hidden = view !== "kundliView";
    $("milanView").hidden = view !== "milanView";
    try { history.replaceState(null, "", view === "milanView" ? "#milan" : "#kundli"); } catch (e) { /* sandbox */ }
  }
  for (const t of document.querySelectorAll(".tab")) t.addEventListener("click", () => show(t.dataset.view));
  if (location.hash === "#milan") show("milanView");

  // ---------- स्थान ----------
  const places = { b_: window.PlaceSearch.bindPlace("b_"), g_: window.PlaceSearch.bindPlace("g_") };

  function read(pre, gender) {
    const [y, m, d] = $(pre + "dob").value.split("-").map(Number);
    const [hh, mm] = $(pre + "tob").value.split(":").map(Number);
    return {
      name: $(pre + "name").value.trim() || (gender === "M" ? "वर" : "कन्या"), gender,
      year: y, month: m, day: d, hour: hh, minute: mm,
      lat: parseFloat($(pre + "lat").value), lon: parseFloat($(pre + "lon").value),
      tzOffsetMin: Math.round(parseFloat($(pre + "tz").value) * 60),
      place: $(pre + "place").value.trim(), tzName: $(pre + "tzName").value,
    };
  }

  $("mDemo").addEventListener("click", () => {
    const fill = (pre, name, dob, tob, city) => {
      $(pre + "name").value = name; $(pre + "dob").value = dob; $(pre + "tob").value = tob;
      places[pre].setCity(city);
    };
    fill("b_", "उदाहरण वर", "1990-03-21", "14:30", "मुंबई");
    fill("g_", "उदाहरण कन्या", "1992-07-09", "08:10", "जयपुर");
    $("mForm").requestSubmit();
  });

  $("mForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const okB = places.b_.ensure(), okG = places.g_.ensure();
    if (!okB || !okG) { const el = $((okB ? "g_" : "b_") + "placeInfo"); el.innerHTML = "⚠️ यह स्थान सूची में नहीं मिला। पास के बड़े शहर का नाम लिखकर सूची से चुनें।"; el.hidden = false; return; }
    const bi = read("b_", "M"), gi = read("g_", "F");
    if ([bi.lat, bi.lon, gi.lat, gi.lon].some(isNaN)) { $("milanReport").hidden = false; $("milanReport").innerHTML = `<section class="card"><p>कृपया दोनों के जन्म स्थान चुनें या अक्षांश/देशान्तर भरें।</p></section>`; return; }
    (window.Anim ? window.Anim.loading : (f) => f())(() => render(bi, gi), "गुण मिलान हो रहा है…");
  });

  function render(bi, gi) {
    const rB = J.analyze(bi), rG = J.analyze(gi);
    const m = M.match(rB, rG);
    const pct = (m.total / 36) * 100;
    const info = (p, r, inp, who) => `<div class="area"><h4>${who}: ${esc(inp.name)}</h4><p>
      जन्म: ${String(inp.day).padStart(2, "0")}-${String(inp.month).padStart(2, "0")}-${inp.year}, ${String(inp.hour).padStart(2, "0")}:${String(inp.minute).padStart(2, "0")} · ${esc(inp.place)}<br>
      लग्न: <b>${J.RASHI[r.lagnaSign]}</b> · राशि: <b>${J.RASHI[p.sign]}</b> (स्वामी ${J.GRAHA[p.lord]})<br>
      नक्षत्र: <b>${J.NAKSHATRA[p.nak]}</b> चरण ${p.pada} · गण ${J.NAK_GANA[p.nak]} · योनि ${J.NAK_YONI[p.nak]} · नाड़ी ${["आदि", "मध्य", "अन्त्य"][[0, 1, 2, 2, 1, 0][p.nak % 6]]}<br>
      मंगल ${J.ORD(p.marsHouse)} भाव में · ${p.manglik ? (p.manglik.cancelled ? "मांगलिक (परिहार सहित)" : '<b style="color:var(--bad)">मांगलिक</b>') : "मांगलिक नहीं"}</p>
      <p><button type="button" class="ghost" data-open="${who === "वर" ? "b" : "g"}">पूरी कुंडली देखें →</button></p></div>`;

    let html = `<section class="card"><div class="gun-head">
      <div class="gun-ring" style="background:conic-gradient(${m.verdict.color} ${pct}%, #f1e6d6 0)"><div><b>${m.total}</b><span>36 में से</span></div></div>
      <div><h3 style="color:${m.verdict.color}">${m.verdict.label}</h3><p style="margin:0">${m.verdict.text}</p>
      <p class="note" style="margin:6px 0 0">${esc(bi.name)} ♥ ${esc(gi.name)}</p></div></div></section>`;

    html += `<section class="card"><h2>वर-कन्या विवरण</h2><div class="couple">${info(m.B, rB, bi, "वर")}${info(m.G, rG, gi, "कन्या")}</div></section>`;

    html += `<section class="card"><h2>अष्टकूट तालिका</h2><div style="overflow-x:auto"><table><thead><tr><th>कूट</th><th>वर</th><th>कन्या</th><th>प्राप्त / अधिकतम</th><th class="hide-sm">किस बात का मेल</th></tr></thead><tbody>
      ${m.K.map((k) => { const c = k.s === k.max ? "#2f7d4a" : k.s === 0 ? "#b3261e" : "#b8860b"; return `<tr><td><b>${k.k}</b></td><td>${esc(k.b)}</td><td>${esc(k.g)}</td><td class="num" style="color:${c}">${k.s} / ${k.max}</td><td class="hide-sm note">${k.about}</td></tr>`; }).join("")}
      <tr class="now"><td><b>कुल</b></td><td></td><td></td><td class="num">${m.total} / 36</td><td class="hide-sm"></td></tr>
      </tbody></table></div>
      <p class="note">मानदण्ड: 18 से कम — अनुशंसित नहीं · 18–24 मध्यम · 25–32 उत्तम · 33–36 अति उत्तम। तारा कूट में कोष्ठक में दूसरे के नक्षत्र से गिनी गई तारा है।</p></section>`;

    html += `<section class="card"><h2>दोष एवं परिहार</h2>
      ${m.doshas.length ? m.doshas.map((d) => `<div class="yoga ${d.cancelled ? "cancel" : "bad"}"><h4>${d.cancelled ? "⚠️" : "❗"} ${d.name}${d.cancelled ? " — परिहार" : ""}</h4><div>${d.text}</div></div>`).join("") : `<div class="yoga good"><h4>✅ कोई कूट-दोष नहीं</h4><div>नाड़ी, भकूट और गण — तीनों प्रमुख दोषों से मुक्त मेल।</div></div>`}
      <div class="yoga ${m.manglik.ok ? "good" : "bad"}"><h4>${m.manglik.ok ? "✅" : "❗"} मांगलिक विचार</h4><div>${m.manglik.text}</div></div>
      <p class="note">गुण मिलान केवल चन्द्र राशि-नक्षत्र पर आधारित है। विवाह-निर्णय में दोनों कुंडलियों का सप्तम भाव, सप्तमेश, शुक्र/गुरु, दशा और आयु का भी विचार किया जाता है; अन्तिम निर्णय अनुभवी ज्योतिषी और परिवार के विवेक से करें।</p></section>`;

    const rep = $("milanReport");
    rep.innerHTML = html;
    rep.hidden = false;
    for (const b of rep.querySelectorAll("[data-open]")) b.addEventListener("click", () => {
      show("kundliView");
      window.__renderKundli(b.dataset.open === "b" ? bi : gi);
    });
    rep.scrollIntoView({ behavior: "smooth" });
    if (window.Anim) window.Anim.afterRender(rep);
  }
})();
