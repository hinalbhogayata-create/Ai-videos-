/* prashna-ui.js — प्रश्न कुंडली का UI (हिन्दी / English) */
(function () {
  "use strict";
  const A = window.Astro, J = window.Jyotish, Q = window.Prashna;
  const $ = (id) => document.getElementById(id);
  const tt = (hi, en) => (window.I18N && window.I18N.lang === "en" ? en : hi);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const place = window.PlaceSearch.bindPlace("q_");
  const KEY = "prashna-place-v1";
  let topic = Q.TOPICS[0].id, manualTime = false, last = null;

  // विषय बटन
  function drawTopics() {
    $("qTopics").innerHTML = Q.TOPICS.map((t) => `<button type="button" role="radio" aria-checked="${t.id === topic}" class="qt ${t.id === topic ? "on" : ""}" data-t="${t.id}">${t.label}</button>`).join("");
    for (const b of document.querySelectorAll(".qt")) b.addEventListener("click", () => {
      topic = b.dataset.t;
      for (const x of document.querySelectorAll(".qt")) { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", String(on)); }
    });
  }
  drawTopics();

  // "अभी" = प्रश्न-स्थान के समय-क्षेत्र में वर्तमान समय (फ़ोन की घड़ी किसी भी देश की हो)
  function nowNote() { $("qNow").textContent = manualTime ? tt("🕐 आपने समय स्वयं चुना है।", "🕐 You have set the time manually.") : tt(`🕐 प्रश्न-समय: अभी — ${$("q_tob").value} (प्रश्न-स्थान का स्थानीय समय), अपने आप अपडेट होता है।`, `🕐 Question time: now — ${$("q_tob").value} (local time at the place), updates automatically.`); }
  function setNow() {
    const nowMs = Date.now();
    let off = Math.round(parseFloat($("q_tz").value) * 60);
    const tzName = $("q_tzName").value;
    if (tzName) { try { off = A.tzOffsetMinutes(nowMs, tzName); } catch (e) { /* */ } }
    if (isNaN(off)) off = -new Date().getTimezoneOffset();
    const d = new Date(nowMs + off * 60000);
    $("q_dob").value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    $("q_tob").value = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    nowNote();
    $("q_dob").dispatchEvent(new Event("change"));
  }
  setNow();
  setInterval(() => { if (!manualTime) setNow(); }, 30000);
  ["q_dob", "q_tob"].forEach((id) => $(id).addEventListener("input", () => { manualTime = true; nowNote(); }));
  $("qNowBtn").addEventListener("click", () => { manualTime = false; setNow(); });

  $("q_place").addEventListener("blur", () => setTimeout(() => { if (!manualTime) setNow(); }, 250));
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved) { place.load(saved); setNow(); } } catch (e) { /* */ }

  $("qForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!place.ensure()) { const el = $("q_placeInfo"); el.innerHTML = tt("⚠️ स्थान चुनें (प्रश्न जहाँ पूछा गया)।", "⚠️ Choose the place (where the question is asked)."); el.hidden = false; el.classList.add("err"); return; }
    if (!manualTime) setNow();
    const [y, m, d] = $("q_dob").value.split("-").map(Number);
    const [hh, mm] = $("q_tob").value.split(":").map(Number);
    const inp = {
      name: $("q_name").value.trim() || tt("प्रश्नकर्ता", "Querent"), gender: "M", year: y, month: m, day: d, hour: hh, minute: mm,
      lat: parseFloat($("q_lat").value), lon: parseFloat($("q_lon").value), tzOffsetMin: Math.round(parseFloat($("q_tz").value) * 60),
      place: $("q_place").value.trim(), tzName: $("q_tzName").value,
    };
    try { localStorage.setItem(KEY, JSON.stringify(inp)); } catch (err) { /* */ }
    (window.Anim ? window.Anim.loading : (f) => f())(() => { render(inp); $("prashnaReport").scrollIntoView({ behavior: "smooth" }); }, tt("प्रश्न कुंडली का विचार हो रहा है…", "Reading the Prashna chart…"));
  });

  function render(inp) {
    last = inp;
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
    const DAYS = tt(["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"], ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);

    let html = `<section class="card qverdict" style="--vc:${v.color}">
      <div class="qv-top"><div class="qv-icon">${icon}</div><div>
        <p class="note" style="margin:0">${esc(t.label)}${qtext ? ` — “${esc(qtext)}”` : ""}</p>
        <h3 style="color:${v.color}">${v.label}</h3><p style="margin:2px 0 0">${v.sub}</p></div></div>
      <div class="qmeter"><i style="width:${Math.max(4, Math.min(100, (res.score + 8) / 16 * 100))}%;background:${v.color}"></i></div>
      <p class="note">${tt("प्रश्न-समय", "Question time")}: ${when} · ${esc(inp.place)} · ${tt("प्रश्न लग्न", "Prashna Lagna")} ${J.RASHI[r.lagnaSign]} · ${tt("लग्नेश", "Lagna lord")} ${G[res.lagnesh]} · ${tt(`कार्य-भाव ${ORD(res.kh)} (स्वामी ${G[res.karyesh]})`, `house of the matter: ${ORD(res.kh)} (lord ${G[res.karyesh]})`)} · ${tt("कुल अंक", "Score")} ${res.score > 0 ? "+" : ""}${res.score}</p>
      <p><b>⏰ ${tt("समय", "Timing")}:</b> ${res.when}</p></section>`;

    html += `<section class="card"><h2>${tt("प्रश्न कुंडली", "Prashna chart")}</h2><div class="charts qcharts">
      ${C.northChart(tt("प्रश्न लग्न कुंडली", "Prashna Lagna chart"), r.lagnaSign, (p) => P[p].house, (p) => C.planetLabel(r, p, true), true)}
      <div class="qpos"><table><thead><tr><th>${tt("ग्रह", "Planet")}</th><th>${tt("राशि", "Sign")}</th><th>${tt("भाव", "House")}</th><th>${tt("स्थिति", "Dignity")}</th></tr></thead><tbody>
      ${A.PLANETS.map((p) => `<tr${p === res.lagnesh || p === res.karyesh ? ' class="now"' : ""}><td>${G[p]}${p === res.lagnesh ? tt(" (लग्नेश)", " (Lagna lord)") : ""}${p === res.karyesh && p !== res.lagnesh ? tt(" (कार्येश)", " (karyesh)") : ""}</td><td>${J.RASHI[P[p].sign]} ${Math.floor(P[p].deg)}°</td><td>${P[p].house}</td><td><span class="tag ${P[p].dignity.key}">${P[p].dignity.label}</span>${P[p].retro && p !== "Rahu" && p !== "Ketu" ? `<span class="tag retro">${tt("वक्री", "Retro")}</span>` : ""}</td></tr>`).join("")}
      </tbody></table></div></div></section>`;

    html += `<section class="card"><h2>${tt("निर्णय के आधार (शास्त्र-नियम)", "Basis of the judgement (scriptural rules)")}</h2>
      ${pos.length ? `<h3 class="hp">✅ ${tt("अनुकूल संकेत", "Favourable signs")}</h3><ul class="flist">${pos.map(fl).join("")}</ul>` : ""}
      ${neg.length ? `<h3 class="hn">⚠️ ${tt("प्रतिकूल संकेत", "Unfavourable signs")}</h3><ul class="flist">${neg.map(fl).join("")}</ul>` : ""}
      ${neu.length ? `<h3>ℹ️ ${tt("अन्य", "Other")}</h3><ul class="flist">${neu.map(fl).join("")}</ul>` : ""}
      </section>`;

    html += `<section class="card"><h2>✨ ${tt("कार्य-सिद्धि हेतु उपाय", "Remedies for success")}</h2>
      <div class="rem"><ul>
        <li><span>📿</span><div><b>${tt(`कार्येश ${G[res.karyesh]} का मंत्र:`, `Mantra of the karyesh ${G[res.karyesh]}:`)}</b> ${rem.mantra.replace(/\s*\(.*\)/, "")} — ${tt("प्रतिदिन 108 बार, कार्य पूर्ण होने तक", "108 times daily until the work is done")}</div></li>
        <li><span>🙏</span><div><b>${tt(`लग्नेश ${G[res.lagnesh]} की प्रसन्नता:`, `To please the Lagna lord ${G[res.lagnesh]}:`)}</b> ${window.Phala.REMEDY[res.lagnesh].vrat}</div></li>
        <li><span>🐘</span><div><b>${tt("गणेश स्मरण:", "Remember Ganesha:")}</b> ${tt("कार्य आरम्भ से पहले “ॐ गं गणपतये नमः” 21 बार — विघ्न-निवारण", "chant “Om Gam Ganapataye Namah” 21 times before starting — removes obstacles")}</div></li>
        <li><span>📅</span><div><b>${tt("शुभ समय:", "Auspicious time:")}</b> ${tt(`कार्य का आरम्भ कार्येश के वार (${DAYS[["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].indexOf(res.karyesh)]}) को या शुभ मुहूर्त में करें`, `begin the work on the karyesh's weekday (${DAYS[["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].indexOf(res.karyesh)]}) or at an auspicious muhurta`)}</div></li>
      </ul></div>
      <p class="note">${tt("प्रश्न-शास्त्र का नियम: प्रश्न श्रद्धा और एकाग्र मन से, एक बार ही पूछें — एक ही प्रश्न बार-बार पूछने पर उत्तर विश्वसनीय नहीं माना जाता (प्रश्नमार्ग)। यह उत्तर संकेत मात्र है; अपना प्रयास और विवेक सर्वोपरि।", "Rule of prashna: ask with faith and a focused mind, only once — repeating the same question makes the answer unreliable (Prashna Marga). The answer is only an indication; your own effort and judgement come first.")}</p>
      <p><button type="button" class="ghost" id="qAgain">🔄 ${tt("नया प्रश्न", "New question")}</button></p></section>`;

    const rep = $("prashnaReport");
    rep.innerHTML = html;
    rep.hidden = false;
    $("qAgain").onclick = () => { $("prashnaForm").scrollIntoView({ behavior: "smooth" }); manualTime = false; setNow(); };
    if (window.Anim) window.Anim.afterRender(rep);
  }

  if (window.I18N) window.I18N.onChange(() => { drawTopics(); nowNote(); if (last && !$("prashnaReport").hidden) render(last); });
})();
