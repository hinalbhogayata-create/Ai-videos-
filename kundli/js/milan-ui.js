/* milan-ui.js — मुख्य टैब और गुण मिलान का UI (हिन्दी / English) */
(function () {
  "use strict";
  const J = window.Jyotish, M = window.Milan;
  const $ = (id) => document.getElementById(id);
  const tt = (hi, en) => (window.I18N && window.I18N.lang === "en" ? en : hi);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let last = null;

  // ---------- टैब ----------
  function show(view) {
    for (const t of document.querySelectorAll(".tab")) t.classList.toggle("active", t.dataset.view === view);
    for (const v of ["kundliView", "milanView", "prashnaView"]) $(v).hidden = view !== v;
    try { history.replaceState(null, "", "#" + view.replace("View", "")); } catch (e) { /* sandbox */ }
  }
  for (const t of document.querySelectorAll(".tab")) t.addEventListener("click", () => show(t.dataset.view));
  if (location.hash === "#milan") show("milanView");
  if (location.hash === "#prashna") show("prashnaView");
  window.__showView = show;

  // ---------- स्थान ----------
  const places = { b_: window.PlaceSearch.bindPlace("b_"), g_: window.PlaceSearch.bindPlace("g_") };

  function read(pre, gender) {
    const [y, m, d] = $(pre + "dob").value.split("-").map(Number);
    const [hh, mm] = $(pre + "tob").value.split(":").map(Number);
    return {
      name: $(pre + "name").value.trim() || (gender === "M" ? tt("वर", "Groom") : tt("कन्या", "Bride")), gender,
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
    fill("b_", tt("उदाहरण वर", "Sample groom"), "1990-03-21", "14:30", "मुंबई");
    fill("g_", tt("उदाहरण कन्या", "Sample bride"), "1992-07-09", "08:10", "जयपुर");
    $("mForm").requestSubmit();
  });

  $("mForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const okB = places.b_.ensure(), okG = places.g_.ensure();
    if (!okB || !okG) { const el = $((okB ? "g_" : "b_") + "placeInfo"); el.innerHTML = tt("⚠️ यह स्थान सूची में नहीं मिला। पास के बड़े शहर का नाम लिखकर सूची से चुनें।", "⚠️ Place not found. Type a nearby larger town and pick it from the list."); el.hidden = false; return; }
    const bi = read("b_", "M"), gi = read("g_", "F");
    (window.Anim ? window.Anim.loading : (f) => f())(() => { render(bi, gi); $("milanReport").scrollIntoView({ behavior: "smooth" }); }, tt("गुण मिलान हो रहा है…", "Matching the charts…"));
  });

  function render(bi, gi) {
    last = [bi, gi];
    const rB = J.analyze(bi), rG = J.analyze(gi);
    const m = M.match(rB, rG);
    const pct = (m.total / 36) * 100;
    const NADI = tt(["आदि", "मध्य", "अन्त्य"], ["Adi", "Madhya", "Antya"]);
    const info = (p, r, inp, isGroom) => `<div class="area"><h4>${isGroom ? tt("👨 वर", "👨 Groom") : tt("👩 कन्या", "👩 Bride")}: ${esc(inp.name)}</h4><p>
      ${tt("जन्म", "Born")}: ${String(inp.day).padStart(2, "0")}-${String(inp.month).padStart(2, "0")}-${inp.year}, ${String(inp.hour).padStart(2, "0")}:${String(inp.minute).padStart(2, "0")} · ${esc(inp.place)}<br>
      ${tt("लग्न", "Lagna")}: <b>${J.RASHI[r.lagnaSign]}</b> · ${tt("राशि", "Moon sign")}: <b>${J.RASHI[p.sign]}</b> (${tt("स्वामी", "lord")} ${J.GRAHA[p.lord]})<br>
      ${tt("नक्षत्र", "Nakshatra")}: <b>${J.NAKSHATRA[p.nak]}</b> ${tt("चरण", "pada")} ${p.pada} · ${tt("गण", "Gana")} ${J.NAK_GANA[p.nak]} · ${tt("योनि", "Yoni")} ${J.NAK_YONI[p.nak]} · ${tt("नाड़ी", "Nadi")} ${NADI[[0, 1, 2, 2, 1, 0][p.nak % 6]]}<br>
      ${tt(`मंगल ${J.ORD(p.marsHouse)} भाव में`, `Mars in the ${J.ORD(p.marsHouse)} house`)} · ${p.manglik ? (p.manglik.cancelled ? tt("मांगलिक (परिहार सहित)", "Manglik (cancelled)") : `<b style="color:var(--bad)">${tt("मांगलिक", "Manglik")}</b>`) : tt("मांगलिक नहीं", "not Manglik")}</p>
      <p><button type="button" class="ghost" data-open="${isGroom ? "b" : "g"}">${tt("पूरी कुंडली देखें →", "View full chart →")}</button></p></div>`;

    let html = `<section class="card"><div class="gun-head">
      <div class="gun-ring" style="background:conic-gradient(${m.verdict.color} ${pct}%, #f1e6d6 0)"><div><b>${m.total}</b><span>${tt("36 में से", "out of 36")}</span></div></div>
      <div><h3 style="color:${m.verdict.color}">${m.verdict.label}</h3><p style="margin:0">${m.verdict.text}</p>
      <p class="note" style="margin:6px 0 0">${esc(bi.name)} ♥ ${esc(gi.name)}</p></div></div></section>`;

    html += `<section class="card"><h2>${tt("वर-कन्या विवरण", "Groom & bride")}</h2><div class="couple">${info(m.B, rB, bi, true)}${info(m.G, rG, gi, false)}</div></section>`;

    html += `<section class="card"><h2>${tt("अष्टकूट तालिका", "Ashtakoot table")}</h2><div class="scroll"><table><thead><tr><th>${tt("कूट", "Koota")}</th><th>${tt("वर", "Groom")}</th><th>${tt("कन्या", "Bride")}</th><th>${tt("प्राप्त / अधिकतम", "Got / Max")}</th><th class="hide-sm">${tt("किस बात का मेल", "Matches")}</th></tr></thead><tbody>
      ${m.K.map((k) => { const c = k.s === k.max ? "#2f7d4a" : k.s === 0 ? "#b3261e" : "#b8860b"; return `<tr><td><b>${k.k}</b></td><td>${esc(k.b)}</td><td>${esc(k.g)}</td><td class="num" style="color:${c}">${k.s} / ${k.max}</td><td class="hide-sm note">${k.about}</td></tr>`; }).join("")}
      <tr class="now"><td><b>${tt("कुल", "Total")}</b></td><td></td><td></td><td class="num">${m.total} / 36</td><td class="hide-sm"></td></tr>
      </tbody></table></div>
      <p class="note">${tt("मानदण्ड: 18 से कम — अनुशंसित नहीं · 18–24 मध्यम · 25–32 उत्तम · 33–36 अति उत्तम। तारा कूट में कोष्ठक में दूसरे के नक्षत्र से गिनी गई तारा है।", "Scale: below 18 — not recommended · 18–24 average · 25–32 good · 33–36 excellent. In Tara koota, the bracket shows the tara counted from the other person's nakshatra.")}</p></section>`;

    html += `<section class="card"><h2>${tt("दोष एवं परिहार", "Doshas & pariharas")}</h2>
      ${m.doshas.length ? m.doshas.map((d) => `<div class="yoga ${d.cancelled ? "cancel" : "bad"}"><h4>${d.cancelled ? "⚠️" : "❗"} ${d.name}${d.cancelled ? tt(" — परिहार", " — cancelled") : ""}</h4><div>${d.text}</div></div>`).join("") : `<div class="yoga good"><h4>✅ ${tt("कोई कूट-दोष नहीं", "No koota dosha")}</h4><div>${tt("नाड़ी, भकूट और गण — तीनों प्रमुख दोषों से मुक्त मेल।", "Free of all three major doshas — Nadi, Bhakoot and Gana.")}</div></div>`}
      <div class="yoga ${m.manglik.ok ? "good" : "bad"}"><h4>${m.manglik.ok ? "✅" : "❗"} ${tt("मांगलिक विचार", "Manglik check")}</h4><div>${m.manglik.text}</div></div>
      <p class="note">${tt("गुण मिलान केवल चन्द्र राशि-नक्षत्र पर आधारित है। विवाह-निर्णय में दोनों कुंडलियों का सप्तम भाव, सप्तमेश, शुक्र/गुरु, दशा और आयु का भी विचार किया जाता है; अन्तिम निर्णय अनुभवी ज्योतिषी और परिवार के विवेक से करें।", "Guna milan is based only on the Moon sign and nakshatra. A marriage decision also considers both charts' 7th house and lord, Venus/Jupiter, dashas and longevity; make the final decision with an experienced astrologer and the family's judgement.")}</p></section>`;

    const rep = $("milanReport");
    rep.innerHTML = html;
    rep.hidden = false;
    for (const b of rep.querySelectorAll("[data-open]")) b.addEventListener("click", () => {
      show("kundliView");
      window.__renderKundli(b.dataset.open === "b" ? bi : gi);
    });
    if (window.Anim) window.Anim.afterRender(rep);
  }

  if (window.I18N) window.I18N.onChange(() => { if (last && !$("milanReport").hidden) render(last[0], last[1]); });
})();
