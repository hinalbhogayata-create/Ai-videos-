/*
 * access.js — सार्वजनिक दर्शक केवल "अनुरोध फ़ॉर्म" देखें; कुंडली बनाने के उपकरण केवल आचार्य (पासवर्ड से)।
 * पासवर्ड स्वयं कोड में नहीं है — केवल उसका SHA-256 (salt सहित) है।
 * होम बटन: शीर्ष पट्टी और नीचे बाएँ तैरता बटन — प्रारम्भिक पृष्ठ पर लौटाता है।
 */
(function () {
  "use strict";
  const HASH = "726641d49087d4c9ff612dbc80a9325ad3691e6d1ea4f00e681c08435c7a8b97";
  const SALT = "niyati-jyotish-karyalaya:";
  const KEY = "niyati-acharya";
  const EMAIL = "hinalbhogayata@gmail.com";
  const $ = (id) => document.getElementById(id);
  const L = (hi, en) => (window.I18N && window.I18N.lang === "en" ? en : hi);
  const root = document.documentElement;

  async function sha(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function login() {
    const pw = window.prompt(L("आचार्य पासवर्ड लिखें:", "Enter the Acharya password:"));
    if (pw === null) return;
    let h = "";
    try { h = await sha(SALT + pw.trim()); } catch (e) { alert(L("यह ब्राउज़र सुरक्षित लॉगिन नहीं कर सकता — https लिंक से खोलें।", "This browser cannot log in securely — open the https link.")); return; }
    if (h !== HASH) { alert(L("पासवर्ड ग़लत है।", "Wrong password.")); return; }
    try { localStorage.setItem(KEY, HASH); } catch (e) { /* */ }
    root.classList.add("is-acharya");
    goHome();
  }
  function logout() {
    try { localStorage.removeItem(KEY); } catch (e) { /* */ }
    root.classList.remove("is-acharya");
    for (const id of ["report", "milanReport", "prashnaReport"]) { const el = $(id); if (el) { el.hidden = true; el.innerHTML = ""; } }
    goHome();
  }

  function goHome() {
    if (root.classList.contains("is-acharya")) {
      const first = document.querySelector('.tab.svc[data-view="kundliView"]');
      if (first) first.click();
      const fc = $("formCard"); if (fc) fc.hidden = false;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- अनुरोध फ़ॉर्म ----
  const form = $("reqForm");
  const svc = () => (form.querySelector('input[name="rsvc"]:checked') || {}).value || "kundli";
  function onSvc() {
    const v = svc();
    form.querySelector(".req-partner").hidden = v !== "milan";
    for (const id of ["r2_name", "r2_dob", "r2_place"]) $(id).required = v === "milan";
  }
  for (const r of form.querySelectorAll('input[name="rsvc"]')) r.addEventListener("change", onSvc);
  onSvc();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = svc();
    const SV = { kundli: "जन्म कुंडली व फलादेश / Janma Kundli & Phaladesh", milan: "गुण मिलान / Gun Milan", prashna: "प्रश्न कुंडली / Prashna Kundli" };
    const g = $("r_gender").value === "F" ? "स्त्री / Female" : "पुरुष / Male";
    const lines = [
      `सेवा / Service: ${SV[v]}`,
      "",
      `नाम / Name: ${$("r_name").value}`,
      `लिंग / Gender: ${g}`,
      `जन्म तिथि / DOB: ${$("r_dob").value}`,
      `जन्म समय / Time: ${$("r_tob").value || "—"}`,
      `जन्म स्थान / Place: ${$("r_place").value}`,
    ];
    if (v === "milan") lines.push("", `दूसरा पक्ष / Partner: ${$("r2_name").value}`, `जन्म तिथि / DOB: ${$("r2_dob").value}`, `जन्म समय / Time: ${$("r2_tob").value || "—"}`, `जन्म स्थान / Place: ${$("r2_place").value}`);
    lines.push("", `मोबाइल / Mobile: ${$("r_phone").value}`, `ईमेल / Email: ${$("r_email").value || "—"}`);
    if ($("r_msg").value.trim()) lines.push("", `प्रश्न / संदेश: ${$("r_msg").value.trim()}`);
    lines.push("", `(${new Date().toLocaleString("en-IN")})`);
    const body = lines.join("\n");
    const subject = `कुंडली अनुरोध — ${$("r_name").value} (${SV[v].split(" / ")[1]})`;
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const done = $("reqDone");
    done.hidden = false;
    done.innerHTML = `<b>${L("🙏 धन्यवाद! आपका ईमेल ऐप अनुरोध के साथ खुल रहा है — कृपया उसमें “Send” दबाएँ।", "🙏 Thank you! Your email app is opening with the request — please press “Send” there.")}</b>
      <p class="note">${L(`ईमेल ऐप न खुले तो नीचे का विवरण कॉपी करके ${EMAIL} पर भेजें।`, `If no email app opens, copy the details below and send them to ${EMAIL}.`)}</p>
      <pre></pre><button type="button" class="ghost" id="reqCopy">${L("📋 विवरण कॉपी करें", "📋 Copy details")}</button>
      <a class="ghost" style="margin-left:8px" href="${href}">${L("📧 ईमेल फिर से खोलें", "📧 Open email again")}</a>`;
    done.querySelector("pre").textContent = body;
    $("reqCopy").onclick = () => { try { navigator.clipboard.writeText(body); $("reqCopy").textContent = L("✅ कॉपी हो गया", "✅ Copied"); } catch (er) { /* */ } };
    window.location.href = href;
  });

  // ---- बटन ----
  $("loginBtn").addEventListener("click", login);
  $("logoutBtn").addEventListener("click", logout);
  $("homeBtn").addEventListener("click", goHome);
  const fab = $("homeFab");
  fab.addEventListener("click", goHome);
  const onScroll = () => fab.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
