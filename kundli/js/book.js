/*
 * book.js — कुंडली "पुस्तक": निश्चित A4 पृष्ठ (794×1123 px) स्वयं बनाकर
 *   • स्क्रीन पर पुस्तक की तरह पन्ने पलटने वाला दर्शक (flip-book)
 *   • असली PDF फ़ाइल (हर पृष्ठ ठीक वैसा ही जैसा दर्शक में) — किसी भी ब्राउज़र/फ़ोन में खिसकता नहीं
 *   PDF खोलने पर पुस्तक-जैसा दो-पृष्ठ (spread) दृश्य: मुखपृष्ठ अकेला, फिर आमने-सामने पन्ने।
 * बाहरी पुस्तकालय (MIT): jsPDF, html2canvas — केवल PDF बनाते समय लोड होते हैं।
 */
(function () {
  "use strict";
  const PW = 794, PH = 1123;           // A4 @ 96dpi
  const PAD_X = 58, HEAD = 64, FOOT = 58; // पृष्ठ के भीतर हाशिया
  const BODY_H = PH - HEAD - FOOT - 18;
  const tt = (hi, en) => (window.I18N && window.I18N.lang === "en" ? en : hi);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const DEVA = (n) => tt(String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[d]), String(n));

  let stage = null;
  function getStage() {
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "bk-stage";
      stage.setAttribute("aria-hidden", "true");
      document.body.appendChild(stage);
    }
    stage.innerHTML = "";
    return stage;
  }

  // ---------- सामग्री तैयार करना ----------
  function cleanClone(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll(".no-print, .rtabs, .tb-btns, button.jump, script").forEach((x) => x.remove());
    c.querySelectorAll("details").forEach((d) => {
      const div = document.createElement("div");
      div.className = "bk-det " + d.className;
      for (const ch of [...d.childNodes]) {
        if (ch.nodeType === 1 && ch.tagName === "SUMMARY") { const s = document.createElement("div"); s.className = "bk-sum"; s.innerHTML = ch.innerHTML; div.appendChild(s); }
        else div.appendChild(ch);
      }
      d.replaceWith(div);
    });
    c.querySelectorAll("button").forEach((b) => { const s = document.createElement("div"); s.className = b.className + " bk-btn"; s.innerHTML = b.innerHTML; b.replaceWith(s); });
    c.querySelectorAll("[hidden]").forEach((x) => x.removeAttribute("hidden"));
    c.querySelectorAll(".rise-in, .fade, .in").forEach((x) => x.classList.remove("rise-in", "fade", "in"));
    c.querySelectorAll("[style*=animation]").forEach((x) => { x.style.animationDelay = ""; });
    return c;
  }

  function chaptersFor(rep, mode) {
    const brief = mode === "brief";
    const skip = brief ? ["yoga", "gochar", "granth"] : [];
    const out = [];
    for (const pn of rep.querySelectorAll(".rpanel")) {
      const k = pn.dataset.panel;
      if (skip.includes(k)) continue;
      const h = pn.querySelector(".chapter-h .ch-t");
      const title = h ? h.textContent.trim() : k;
      let secs = [...pn.querySelectorAll(":scope > section")];
      if (brief) {
        secs = secs.filter((s) => !s.classList.contains("brief-hide"));
        if (k === "phala") secs = secs.slice(0, 2);
      }
      const blocks = secs.map((s) => {
        const c = cleanClone(s);
        if (brief) c.querySelectorAll(".bk-det.absent, .bk-det.cancelled").forEach((x) => x.remove());
        return c;
      });
      out.push({ k, title, blocks });
    }
    return out;
  }

  // ---------- पृष्ठ बनाना ----------
  function newPage(st, info, opt = {}) {
    const p = document.createElement("div");
    p.className = "bk-page" + (opt.cls ? " " + opt.cls : "");
    p.innerHTML = opt.raw ? opt.raw : `<div class="bk-frame"><div class="bk-head"><span>${tt("नियति ज्योतिष कार्यालय", "Niyati Jyotish Karyalaya")}</span><span>${esc(info.name)} — ${tt("जन्म कुंडली", "Janma Kundli")}</span></div><div class="bk-body"></div><div class="bk-foot"><span class="bk-chap"></span><span class="bk-no"></span><span>NIYATI JYOTISH KARYALAYA</span></div></div>`;
    st.appendChild(p);
    return p;
  }
  const bodyOf = (p) => p.querySelector(".bk-body");
  const overflows = (body) => body.scrollHeight > body.clientHeight + 1;

  // ---- पृष्ठों में बहाव: हर पृष्ठ पर "आवरण-श्रृंखला" (card > details > table…) दोबारा बनती है ----
  const isHead = (n) => n && n.nodeType === 1 && (/^H[1-4]$/.test(n.tagName) || n.classList.contains("bk-sum") || n.classList.contains("dials-h") || n.classList.contains("bk-chh"));
  function target(ctx) {
    if (ctx.livePage !== ctx.page) { ctx.live = []; ctx.livePage = ctx.page; }
    while (ctx.live.length > ctx.chain.length) ctx.live.pop();
    for (let i = ctx.live.length; i < ctx.chain.length; i++) {
      const c = ctx.chain[i];
      let el = c.tpl.cloneNode(false), inner = el;
      if (c.started) el.classList.add("bk-cont");
      if (c.thead) el.appendChild(c.thead.cloneNode(true));
      (i ? ctx.live[i - 1].inner : bodyOf(ctx.page)).appendChild(el);
      c.started = true;
      ctx.live.push({ el, inner });
    }
    return ctx.live.length ? ctx.live[ctx.live.length - 1].inner : bodyOf(ctx.page);
  }
  function flow(el, ctx, depth = 0) {
    let t = target(ctx);
    t.appendChild(el);
    if (!overflows(bodyOf(ctx.page))) { ctx.placed = true; return; }
    t.removeChild(el);
    const rows = el.tagName === "TABLE" && el.tBodies[0] ? [...el.tBodies[0].rows] : null;
    const kids = [...el.childNodes].filter((k) => k.nodeType === 1 || (k.nodeType === 3 && k.textContent.trim()));
    const container = /^(DIV|SECTION|UL|OL|TABLE|ARTICLE)$/.test(el.tagName) && !el.classList.contains("dial") && !el.classList.contains("chartbox") && !el.classList.contains("sc") && !el.classList.contains("area") && !el.classList.contains("bk-chh");
    const canSplit = container && depth < 9 && (rows ? rows.length > 1 : kids.length >= 2 || (kids.length === 1 && kids[0].nodeType === 1));
    if (canSplit) {
      if (rows) {
        ctx.chain.push({ tpl: el.cloneNode(false), thead: el.tHead });
        // rowspan वाली पंक्तियाँ एक समूह (tbody) में — वे अलग पृष्ठों पर न बँटें
        let i = 0;
        while (i < rows.length) {
          let span = 1;
          for (let j = i; j < i + span && j < rows.length; j++) for (const c of rows[j].cells) span = Math.max(span, j - i + (c.rowSpan || 1));
          const g = document.createElement("tbody");
          for (let j = i; j < Math.min(rows.length, i + span); j++) g.appendChild(rows[j]);
          flow(g, ctx, depth + 1);
          i += span;
        }
      } else {
        ctx.chain.push({ tpl: el.cloneNode(false) });
        for (const k of kids) {
          if (k.nodeType === 3) { target(ctx).appendChild(k); continue; }
          flow(k, ctx, depth + 1);
        }
      }
      ctx.chain.pop();
      return;
    }
    // अखंड तत्व: नया पृष्ठ (शीर्षक को साथ ले जाएँ)
    if (ctx.placed) {
      // पृष्ठ के अन्त में अकेला रह गया शीर्षक साथ ले जाएँ — भीतर के खाली आवरणों (जैसे केवल thead वाली तालिका) के ऊपर भी देखें
      const meaningful = (e) => [...e.children].some((c) => c.tagName !== "THEAD");
      let carry = null, level = -1;
      if (isHead(t.lastElementChild)) { carry = t.lastElementChild; level = ctx.live.length; }
      else {
        for (let k = ctx.live.length - 1; k >= 0; k--) {
          const sh = ctx.live[k].el;
          if (meaningful(sh)) break;
          const pv = sh.previousElementSibling;
          if (isHead(pv)) { carry = pv; level = k; break; }
        }
      }
      if (carry) carry.remove();
      ctx.next();
      t = target(ctx);
      if (carry) {
        if (level >= ctx.live.length) t.appendChild(carry);
        else { const sh = ctx.live[level].el; sh.parentNode.insertBefore(carry, sh); }
      }
    }
    t.appendChild(el);
    ctx.placed = true;
  }
  function cleanupEmpty(page) {
    if (!page) return;
    let again = true;
    while (again) { again = false; for (const n of page.querySelectorAll(".bk-body *")) { if (!n.children.length && !n.textContent.trim() && !/^(IMG|SVG|BR|HR|TD|TH|I|CIRCLE|LINE|PATH|TEXT|IMAGE|G|RECT|POLYGON|POLYLINE|ELLIPSE|DEFS|STYLE|USE)$/i.test(n.tagName) && n.closest("svg") == null && (n.classList.contains("bk-cont") || n.tagName === "TBODY" || n.tagName === "TABLE")) { n.remove(); again = true; } }
      for (const tb of page.querySelectorAll(".bk-body table")) if (!tb.querySelector("tbody tr")) { tb.remove(); again = true; }
      for (const n of page.querySelectorAll(".bk-body .scroll, .bk-body section, .bk-body .bk-det")) if (!n.textContent.trim() && !n.querySelector("img,svg")) { n.remove(); again = true; }
    }
  }

  function build(rep, mode, info) {
    const st = getStage();
    st.classList.toggle("en", window.I18N && window.I18N.lang === "en");
    const pages = [];
    // मुखपृष्ठ
    const coverSrc = rep.querySelector(".book-cover .bc-frame");
    const cover = newPage(st, info, { cls: "bk-cover", raw: `<div class="bc-frame">${coverSrc ? coverSrc.innerHTML : ""}</div>` });
    pages.push(cover);
    // अनुक्रमणिका (पृष्ठ संख्या बाद में भरेंगे)
    const toc = newPage(st, info, { cls: "bk-tocpage" });
    pages.push(toc);
    const chapters = chaptersFor(rep, mode);
    const tocRows = [];
    const ctx = {
      page: null, chain: [], live: [], livePage: null, placed: false,
      chapTitle: "",
      next() { cleanupEmpty(this.page); this.page = newPage(st, info); this.page.querySelector(".bk-chap").textContent = this.chapTitle; pages.push(this.page); this.placed = false; },
    };
    chapters.forEach((ch, ci) => {
      ctx.chapTitle = ch.title;
      const needNew = !ctx.page || mode !== "brief" || bodyOf(ctx.page).scrollHeight > bodyOf(ctx.page).clientHeight * 0.62;
      if (needNew) ctx.next();
      const h = document.createElement("div");
      h.className = "bk-chh";
      h.innerHTML = `<span>${tt("अध्याय", "Chapter")} ${DEVA(ci + 1)}</span><b>${esc(ch.title)}</b>`;
      bodyOf(ctx.page).appendChild(h);
      ctx.placed = true;
      tocRows.push({ n: ci + 1, title: ch.title, page: pages.length });
      ctx.page.querySelector(".bk-chap").textContent = ch.title;
      for (const b of ch.blocks) flow(b, ctx);
    });
    // अन्तिम: आधार व अस्वीकरण
    const basis = rep.querySelector(".basis");
    const tail = document.createElement("div");
    tail.className = "bk-tail";
    tail.innerHTML = `${basis ? basis.innerHTML : ""}<p class="note">${tt("⚠️ यह ज्योतिष-परम्परा पर आधारित फलादेश है। महत्वपूर्ण निर्णयों में आचार्य श्री से व्यक्तिगत परामर्श अवश्य लें।", "⚠️ These predictions are based on the Jyotisha tradition. For important decisions please consult Acharya Shri personally.")}</p>
      <div class="bk-sign"><div>${tt("आचार्य श्री हिनलभाई भोगायता", "Acharya Shri Hinalbhai Bhogayata")}<small>M.A., B.Ed.</small></div><div>${tt("शास्त्री रविभाई राजगुरु", "Shastri Ravibhai Rajguru")}<small>${tt("ज्योतिषाचार्य · वास्तुशास्त्र निष्णात", "Jyotishacharya · Vastu Shastra Nishnat")}</small></div></div>
      <p class="bk-contact">📧 hinalbhogayata@gmail.com · www.niyatiweddings.co.uk/kundli</p>`;
    flow(tail, ctx);
    cleanupEmpty(ctx.page);
    // अनुक्रमणिका भरें
    bodyOf(toc).innerHTML = `<div class="bk-toc"><h2>${tt("अनुक्रमणिका", "Contents")}</h2><div class="bk-orn"></div>
      ${tocRows.map((r) => `<div class="bk-tr"><span class="n">${tt("अध्याय", "Chapter")} ${DEVA(r.n)}</span><span class="t">${esc(r.title)}</span><span class="dots"></span><span class="p">${DEVA(r.page)}</span></div>`).join("")}
      <p class="note">${tt("यह फलादेश बृहत् पाराशर होरा शास्त्र, बृहज्जातक, फलदीपिका, सारावली, जातक पारिजात एवं भृगु सूत्र के सिद्धान्तों पर आधारित है।", "Based on the principles of Brihat Parashara Hora Shastra, Brihat Jataka, Phaladeepika, Saravali, Jataka Parijata and Bhrigu Sutra.")}</p></div>`;
    toc.querySelector(".bk-chap").textContent = tt("अनुक्रमणिका", "Contents");
    // पृष्ठ संख्या
    pages.forEach((p, i) => { const n = p.querySelector(".bk-no"); if (n) n.textContent = `— ${DEVA(i + 1)} —`; });
    return pages;
  }

  // ---------- दर्शक (flip-book) ----------
  let viewer = null, cur = 0, pagesRef = [], infoRef = null, modeRef = "brief";
  function spreadMode() { return window.innerWidth >= 1000; }
  function openViewer(pages, info, mode) {
    pagesRef = pages; infoRef = info; modeRef = mode; cur = 0;
    if (viewer) viewer.remove();
    viewer = document.createElement("div");
    viewer.className = "bk-viewer no-print";
    viewer.innerHTML = `<div class="bkv-bar">
        <b>📖 ${tt("कुंडली पुस्तक", "Kundli book")} — ${esc(info.name)}</b>
        <span class="bkv-pg"></span>
        <span class="bkv-acts">
          <button type="button" class="primary bkv-dl">⬇️ ${tt("PDF डाउनलोड", "Download PDF")}</button>
          <button type="button" class="ghost bkv-x">✕ ${tt("बंद करें", "Close")}</button>
        </span></div>
      <div class="bkv-desk"><button type="button" class="bkv-nav prev" aria-label="Previous">‹</button><div class="bkv-book"></div><button type="button" class="bkv-nav next" aria-label="Next">›</button></div>
      <div class="bkv-thumbs"></div>
      <div class="bkv-msg" hidden></div>`;
    document.body.appendChild(viewer);
    document.documentElement.classList.add("bk-open");
    viewer.querySelector(".bkv-x").onclick = closeViewer;
    viewer.querySelector(".prev").onclick = () => turn(-1);
    viewer.querySelector(".next").onclick = () => turn(1);
    viewer.querySelector(".bkv-dl").onclick = () => downloadPdf();
    // अंगूठा-चित्र (पृष्ठ सूची)
    const th = viewer.querySelector(".bkv-thumbs");
    th.innerHTML = pages.map((_, i) => `<button type="button" data-i="${i}">${DEVA(i + 1)}</button>`).join("");
    th.onclick = (e) => { const b = e.target.closest("[data-i]"); if (b) go(+b.dataset.i); };
    // स्वाइप
    let x0 = null;
    const book = viewer.querySelector(".bkv-book");
    book.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    book.addEventListener("touchend", (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1); x0 = null; });
    book.addEventListener("click", (e) => { const r = book.getBoundingClientRect(); turn(e.clientX - r.left > r.width / 2 ? 1 : -1); });
    window.addEventListener("keydown", keyNav);
    window.addEventListener("resize", renderSpread);
    renderSpread();
  }
  function keyNav(e) { if (!viewer) return; if (e.key === "ArrowRight") turn(1); else if (e.key === "ArrowLeft") turn(-1); else if (e.key === "Escape") closeViewer(); }
  function closeViewer() { if (viewer) viewer.remove(); viewer = null; document.documentElement.classList.remove("bk-open"); window.removeEventListener("keydown", keyNav); window.removeEventListener("resize", renderSpread); }
  function spreadOf(i) { // पुस्तक: मुखपृष्ठ अकेला दाईं ओर, फिर (2,3), (4,5) …
    if (!spreadMode()) return [i];
    if (i === 0) return [null, 0];
    const l = i % 2 === 1 ? i : i - 1;
    return [l, l + 1 < pagesRef.length ? l + 1 : null];
  }
  function go(i) { cur = Math.max(0, Math.min(pagesRef.length - 1, i)); renderSpread(); }
  function turn(d) {
    if (!viewer) return;
    const step = spreadMode() ? (cur === 0 && d > 0 ? 1 : 2) : 1;
    let n = cur + d * step;
    if (spreadMode() && d < 0 && cur <= 2) n = 0;
    if (n < 0 || n >= pagesRef.length) return;
    const book = viewer.querySelector(".bkv-book");
    book.classList.remove("turn-next", "turn-prev"); void book.offsetWidth;
    book.classList.add(d > 0 ? "turn-next" : "turn-prev");
    setTimeout(() => { cur = n; renderSpread(); }, 230);
  }
  function renderSpread() {
    if (!viewer) return;
    const book = viewer.querySelector(".bkv-book");
    const sp = spreadOf(cur);
    const availW = viewer.clientWidth - (spreadMode() ? 140 : 24), availH = viewer.clientHeight - 150;
    const scale = Math.min(availH / PH, availW / (PW * sp.length));
    book.innerHTML = sp.map((i, k) => `<div class="bkv-slot ${sp.length === 2 ? (k === 0 ? "left" : "right") : "single"}" style="width:${PW * scale}px;height:${PH * scale}px">${i == null ? "" : `<div class="bkv-scale" style="transform:scale(${scale})"></div>`}</div>`).join("");
    const slots = book.querySelectorAll(".bkv-slot");
    sp.forEach((i, k) => { if (i != null) slots[k].querySelector(".bkv-scale").appendChild(pagesRef[i].cloneNode(true)); });
    const shown = sp.filter((x) => x != null).map((x) => DEVA(x + 1)).join("–");
    viewer.querySelector(".bkv-pg").textContent = `${tt("पृष्ठ", "Page")} ${shown} / ${DEVA(pagesRef.length)}`;
    viewer.querySelectorAll(".bkv-thumbs button").forEach((b) => b.classList.toggle("on", sp.includes(+b.dataset.i)));
    book.classList.remove("turn-next", "turn-prev");
  }

  // ---------- PDF ----------
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[data-src="${src}"]`)) return res();
      const s = document.createElement("script"); s.src = src; s.dataset.src = src; s.onload = res; s.onerror = () => rej(new Error("load " + src)); document.head.appendChild(s);
    });
  }
  const dataUrlCache = {};
  async function toDataUrl(url) {
    if (dataUrlCache[url]) return dataUrlCache[url];
    const img = new Image(); img.crossOrigin = "anonymous"; img.src = url;
    await img.decode().catch(() => {});
    const c = document.createElement("canvas"); c.width = img.naturalWidth || 1; c.height = img.naturalHeight || 1;
    c.getContext("2d").drawImage(img, 0, 0);
    let d = "";
    try { d = c.toDataURL("image/png"); } catch (e) { d = url; }
    return (dataUrlCache[url] = d);
  }
  // SVG (कुंडली चक्र, डायल) को PNG चित्र में बदलें ताकि PDF में सही आए
  async function rasterSvgs(page) {
    for (const svg of [...page.querySelectorAll("svg")]) {
      const clone = svg.cloneNode(true);
      for (const im of clone.querySelectorAll("image")) { const h = im.getAttribute("href") || im.getAttribute("xlink:href"); if (h && !h.startsWith("data:")) im.setAttribute("href", await toDataUrl(new URL(h, location.href).href)); }
      const r = svg.getBoundingClientRect();
      const w = Math.max(1, Math.round(svg.clientWidth || r.width)), h = Math.max(1, Math.round(svg.clientHeight || r.height));
      clone.setAttribute("width", w); clone.setAttribute("height", h);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      // SVG के भीतर पाठ के लिए फ़ॉन्ट शैली
      const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
      st.textContent = "text{font-family:'Mukta','Noto Sans Devanagari','Kohinoor Devanagari',sans-serif}";
      clone.insertBefore(st, clone.firstChild);
      clone.querySelectorAll("*").forEach((n) => { n.style && (n.style.animation = "none"); });
      const xml = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
      await img.decode().catch(() => {});
      const c = document.createElement("canvas"); const k = 2;
      c.width = w * k; c.height = h * k;
      const g = c.getContext("2d"); g.scale(k, k);
      try { g.drawImage(img, 0, 0, w, h); } catch (e) { continue; }
      const out = new Image(); out.src = c.toDataURL("image/png"); out.width = w; out.height = h; out.className = "bk-svgimg";
      out.style.cssText = `width:${w}px;height:${h}px;display:block;margin:0 auto;max-width:100%`;
      svg.replaceWith(out);
    }
  }
  async function downloadPdf() {
    const msg = viewer && viewer.querySelector(".bkv-msg");
    const show = (t) => { if (msg) { msg.hidden = false; msg.innerHTML = t; } };
    const btn = viewer && viewer.querySelector(".bkv-dl");
    if (btn) btn.disabled = true;
    try {
      show(`⏳ ${tt("PDF तैयार हो रही है…", "Preparing the PDF…")}`);
      await loadScript("js/vendor/html2canvas.min.js");
      await loadScript("js/vendor/jspdf.umd.min.js");
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
      pdf.setProperties({ title: `${infoRef.name} — Janma Kundli · Niyati Jyotish Karyalaya`, author: "Niyati Jyotish Karyalaya", creator: "Niyati Jyotish Karyalaya" });
      pdf.setDisplayMode("fullpage", "tworight"); // पुस्तक-जैसा: मुखपृष्ठ दाईं ओर, फिर आमने-सामने
      const host = document.createElement("div");
      host.className = "bk-stage bk-render";
      document.body.appendChild(host);
      for (let i = 0; i < pagesRef.length; i++) {
        show(`⏳ ${tt("PDF तैयार हो रही है…", "Preparing the PDF…")} ${tt("पृष्ठ", "page")} ${DEVA(i + 1)} / ${DEVA(pagesRef.length)}`);
        host.innerHTML = "";
        const pg = pagesRef[i].cloneNode(true);
        host.appendChild(pg);
        await rasterSvgs(pg);
        const canvas = await window.html2canvas(pg, { scale: 1.75, backgroundColor: "#ffffff", useCORS: true, logging: false, width: PW, height: PH, windowWidth: PW });
        const img = canvas.toDataURL("image/jpeg", 0.86);
        if (i) pdf.addPage("a4", "portrait");
        pdf.addImage(img, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }
      host.remove();
      const fname = `Kundli-${String(infoRef.name || "jatak").replace(/[\\/:*?"<>|]+/g, "").trim().replace(/\s+/g, "-")}${modeRef === "brief" ? "" : "-sampurna"}.pdf`;
      pdf.save(fname);
      show(`✅ ${tt(`PDF तैयार — “${esc(fname)}” डाउनलोड हो गई। iPhone पर: “फ़ाइलें / Files” ऐप में Downloads देखें।`, `PDF ready — “${esc(fname)}” downloaded. On iPhone: see Downloads in the Files app.`)}`);
    } catch (e) {
      console.error(e);
      show(`⚠️ ${tt("PDF नहीं बन सकी — कृपया पृष्ठ ताज़ा करके फिर प्रयास करें।", "Could not create the PDF — please refresh and try again.")}`);
    } finally { if (btn) btn.disabled = false; }
  }

  // ---------- सार्वजनिक ----------
  async function open(mode) {
    const rep = document.getElementById("report");
    if (!rep || rep.hidden) return;
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const name = (rep.querySelector(".person h2") || {}).textContent || "";
    const info = { name };
    const pages = build(rep, mode, info);
    openViewer(pages, info, mode);
  }
  window.KundliBook = { open, build, downloadPdf };
})();
