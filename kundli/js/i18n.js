/*
 * i18n.js — हिन्दी / English भाषा-व्यवस्था
 *  • L(hi, en): वर्तमान भाषा का पाठ लौटाता है (सभी मॉड्यूल गणना के समय इसे पढ़ते हैं)
 *  • setLang(): नाम-सूचियाँ (ग्रह, राशि, नक्षत्र…) बदलता है, स्थिर पाठ [data-en] बदलता है,
 *    और खुली रिपोर्ट को नई भाषा में दोबारा बनवाता है।
 */
(function (root) {
  "use strict";
  const KEY = "kundli-lang";
  let lang = "hi";
  try { lang = localStorage.getItem(KEY) || "hi"; } catch (e) { /* */ }
  const subs = [];

  const I18N = {
    get lang() { return lang; },
    L: (hi, en) => (lang === "en" ? en : hi),
    onChange(fn) { subs.push(fn); },
    setLang(l) {
      lang = l === "en" ? "en" : "hi";
      try { localStorage.setItem(KEY, lang); } catch (e) { /* */ }
      I18N.apply();
      for (const fn of subs) { try { fn(lang); } catch (e) { console.error(e); } }
    },
    // स्थिर पाठ: तत्व में data-en="English" हो तो मूल हिन्दी data-hi में सुरक्षित रखकर बदलें
    applyStatic(scope) {
      if (typeof document === "undefined") return;
      document.documentElement.lang = lang;
      document.documentElement.dataset.lang = lang;
      for (const el of (scope || document).querySelectorAll("[data-en]")) {
        if (el.dataset.hi === undefined) el.dataset.hi = el.innerHTML;
        el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.hi;
      }
      for (const el of (scope || document).querySelectorAll("[data-en-ph]")) {
        if (el.dataset.hiPh === undefined) el.dataset.hiPh = el.getAttribute("placeholder") || "";
        el.setAttribute("placeholder", lang === "en" ? el.dataset.enPh : el.dataset.hiPh);
      }
      for (const el of (scope || document).querySelectorAll("[data-en-title]")) {
        if (el.dataset.hiTitle === undefined) el.dataset.hiTitle = el.getAttribute("title") || "";
        el.setAttribute("title", lang === "en" ? el.dataset.enTitle : el.dataset.hiTitle);
      }
      for (const b of document.querySelectorAll("[data-setlang]")) b.classList.toggle("on", b.dataset.setlang === lang);
      if (document.title && root.__titles) document.title = lang === "en" ? root.__titles.en : root.__titles.hi;
    },
    apply() {
      if (root.Jyotish && root.Jyotish.setLang) root.Jyotish.setLang(lang);
      if (root.Phala && root.Phala.setLang) root.Phala.setLang(lang);
      if (root.Granth && root.Granth.setLang) root.Granth.setLang(lang);
      if (root.Gochar && root.Gochar.setLang) root.Gochar.setLang(lang);
      I18N.applyStatic();
    },
  };
  root.I18N = I18N;
  root.L = I18N.L;
  if (typeof module !== "undefined") module.exports = I18N;
})(typeof window !== "undefined" ? window : globalThis);
