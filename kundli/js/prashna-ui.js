/* prashna-ui.js — प्रश्न कुंडली का UI */
(function () {
  "use strict";
  const A = window.Astro, J = window.Jyotish, Q = window.Prashna;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const place = window.PlaceSearch.bindPlace("q_");
  const KEY = "prashna-place-v1";
  let topic = Q.TOPICS[0].id, manualTime = false;

  // विषय बटन
  $("qTopics").innerHTML = Q.TOPICS.map((t, i) => `<button type="button" role="radio" aria-checked="${i ? "false" : "true"}" class="qt ${i ? "" : "on"}" data-t="${t.id}">${t.label}</button>`).join("");
  for (const b of document.querySelectorAll(".qt")) b.addEventListener("click", () => {
    topic = b.dataset.t;
    for (const x of document.querySelectorAll(".qt")) { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", String(on)); }
  });

  // समय: अभी
  // "अभी" = प्रश्न-स्थान के समय-क्षेत्र में वर्तमान समय (फ़ोन की घड़ी किसी भी देश की हो)
  function setNow() {
    const nowMs = Date.now();
    let off = Math.round(parseFloat($("q_tz").value) * 60);
    const tzName = $("q_tzName").value;
    if (tzName) { try { off = A.tzOffsetMinutes(nowMs, tzName); } catch (e) { /* */ } }
    if (isNaN(off)) off = -new Date().getTimezoneOffset();
    const d = new Date(nowMs + off * 60000);
    $("q_dob").value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    $("q_tob").value = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    $("qNow").textContent = `🕐 प्रश्न-समय: अभी — ${$("q_tob").value} (प्रश्न-स्थान का स्थानीय समय), अपने आप अपडेट होता है।`;
    $("q_dob").dispatchEvent(new Event("change"));
  }
  setNow();
  setInterval(() => { if (!manualTime) setNow(); }, 30000);
  ["q_dob", "q_tob"].forEach((id) => $(id).addEventListener("input", () => { manualTime = true; $("qNow").textContent = "🕐 आपने समय स्वयं चुना है।"; }));
  $("qNowBtn").addEventListener("click", () => { manualTime = false; setNow(); });

  $("q_place").addEventListener("blur", () => setTimeout(() => { if (!manualTime) setNow(); }, 250));
  // पिछला स्थान याद रखें
  try { const last = JSON.parse(localStorage.getItem(KEY)); if (last) { place.load(last); setNow(); } } catch (e) { /* */ }

  $("qForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!place.ensure()) { const el = $("q_placeInfo"); el.innerHTML = "⚠️ स्थान चुनें (प्रश्न जहाँ पूछा गया)।"; el.hidden = false; el.classList.add("err"); return; }
    if (!manualTime) setNow();
    const [y, m, d] = $("q_dob").value.split("-").map(Number);
    const [hh, mm] = $("q_tob").value.split(":").map(Number);
    const inp = {
      name: $("q_name").value.trim() || "प्रश्नकर्ता", gender: "M", year: y, month: m, day: d, hour: hh, minute: mm,
      lat: parseFloat($("q_lat").value), lon: parseFloat($("q_lon").value), tzOffsetMin: Math.round(parseFloat($("q_tz").value) * 60),
      place: $("q_place").value.trim(), tzName: $("q_tzName").value,
    };
    try { localStorage.setItem(KEY, JSON.stringify(inp)); } catch (err) { /* */ }
    (window.Anim ? window.Anim.loading : (f) => f())(() => render(inp), "प्रश्न कुंडली का विचार हो रहा है…");
  });

  function render(inp) {
    const r = J.analyze(inp);
    const t = Q.TOPICS.find((x) => x.id === topic);
    const res = Q.judge(r, t);
    const G = J.GRAHA, ORD = J.ORD, P = r.planets, C = window.__chart;
    const v = res.verdict;
    const qtext = $("q_text").value.trim();
    const when = `${String(inp.day).padStart(2, "0")}-${String(inp.month).padStart(2, "0")}-${inp.year}, ${String(inp.hour).padStart(2, "0")}:${String(inp.minute).padStart(2, "0")}`;
    const icon = ["", "⛔", "⏳", "👍", "✅"][v.k];
    const pos = res.factors.filter((f) => f.pts > 0), neg = res.factors.filter((f) => f.pts < 0), neu = res.factors.filter((f) => f.pts === 0);
    const fl = (f) => `<li class="${f.pts > 0 ? "fp" : f.pts < 0 ? "fn" : "f0"}"><span class="fsym">${f.pts > 0 ? "＋" : f.pts < 0 ? "－" : "•"}</span><div>${f.text} <span class="ftag">${f.src}</span></div></li>`;
    const rem = window.Phala.REMEDY[res.karyesh];

    let html = `<section class="card qverdict" style="--vc:${v.color}">
      <div class="qv-top"><div class="qv-icon">${icon}</div><div>
        <p class="note" style="margin:0">${esc(t.label)}${qtext ? ` — “${esc(qtext)}”` : ""}</p>
        <h3 style="color:${v.color}">${v.label}</h3><p style="margin:2px 0 0">${v.sub}</p></div></div>
      <div class="qmeter"><i style="width:${Math.max(4, Math.min(100, (res.score + 8) / 16 * 100))}%;background:${v.color}"></i></div>
      <p class="note">प्रश्न-समय: ${when} · ${esc(inp.place)} · प्रश्न लग्न ${J.RASHI[r.lagnaSign]} · लग्नेश ${G[res.lagnesh]} · कार्य-भाव ${ORD(res.kh)} (स्वामी ${G[res.karyesh]}) · कुल अंक ${res.score > 0 ? "+" : ""}${res.score}</p>
      <p><b>⏰ समय:</b> ${res.when}</p></section>`;

    html += `<section class="card"><h2>प्रश्न कुंडली</h2><div class="charts qcharts">
      ${C.northChart("प्रश्न लग्न कुंडली", r.lagnaSign, (p) => P[p].house, (p) => C.planetLabel(r, p, true), true)}
      <div class="qpos"><table><thead><tr><th>ग्रह</th><th>राशि</th><th>भाव</th><th>स्थिति</th></tr></thead><tbody>
      ${A.PLANETS.map((p) => `<tr${p === res.lagnesh || p === res.karyesh ? ' class="now"' : ""}><td>${G[p]}${p === res.lagnesh ? " (लग्नेश)" : ""}${p === res.karyesh && p !== res.lagnesh ? " (कार्येश)" : ""}</td><td>${J.RASHI[P[p].sign]} ${Math.floor(P[p].deg)}°</td><td>${P[p].house}</td><td><span class="tag ${P[p].dignity.key}">${P[p].dignity.label}</span>${P[p].retro && p !== "Rahu" && p !== "Ketu" ? '<span class="tag retro">वक्री</span>' : ""}</td></tr>`).join("")}
      </tbody></table></div></div></section>`;

    html += `<section class="card"><h2>निर्णय के आधार (शास्त्र-नियम)</h2>
      ${pos.length ? `<h3 class="hp">✅ अनुकूल संकेत</h3><ul class="flist">${pos.map(fl).join("")}</ul>` : ""}
      ${neg.length ? `<h3 class="hn">⚠️ प्रतिकूल संकेत</h3><ul class="flist">${neg.map(fl).join("")}</ul>` : ""}
      ${neu.length ? `<h3>ℹ️ अन्य</h3><ul class="flist">${neu.map(fl).join("")}</ul>` : ""}
      </section>`;

    html += `<section class="card"><h2>✨ कार्य-सिद्धि हेतु उपाय</h2>
      <div class="rem"><ul>
        <li><span>📿</span><div><b>कार्येश ${G[res.karyesh]} का मंत्र:</b> ${rem.mantra.replace(/\s*\(.*\)/, "")} — प्रतिदिन 108 बार, कार्य पूर्ण होने तक</div></li>
        <li><span>🙏</span><div><b>लग्नेश ${G[res.lagnesh]} की प्रसन्नता:</b> ${window.Phala.REMEDY[res.lagnesh].vrat}</div></li>
        <li><span>🐘</span><div><b>गणेश स्मरण:</b> कार्य आरम्भ से पहले “ॐ गं गणपतये नमः” 21 बार — विघ्न-निवारण</div></li>
        <li><span>📅</span><div><b>शुभ समय:</b> कार्य का आरम्भ कार्येश के वार (${["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"][["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].indexOf(res.karyesh)]}) को या शुभ मुहूर्त में करें</div></li>
      </ul></div>
      <p class="note">प्रश्न-शास्त्र का नियम: प्रश्न श्रद्धा और एकाग्र मन से, एक बार ही पूछें — एक ही प्रश्न बार-बार पूछने पर उत्तर विश्वसनीय नहीं माना जाता (प्रश्नमार्ग)। यह उत्तर संकेत मात्र है; अपना प्रयास और विवेक सर्वोपरि।</p>
      <p><button type="button" class="ghost" id="qAgain">🔄 नया प्रश्न</button></p></section>`;

    const rep = $("prashnaReport");
    rep.innerHTML = html;
    rep.hidden = false;
    $("qAgain").onclick = () => { $("prashnaForm").scrollIntoView({ behavior: "smooth" }); manualTime = false; setNow(); };
    rep.scrollIntoView({ behavior: "smooth" });
    if (window.Anim) window.Anim.afterRender(rep);
  }
})();
