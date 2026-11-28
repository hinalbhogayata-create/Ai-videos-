/*
 * milan.js — अष्टकूट गुण मिलान (36 गुण)
 * वर्ण 1 · वश्य 2 · तारा 3 · योनि 4 · ग्रह मैत्री 5 · गण 6 · भकूट 7 · नाड़ी 8
 * आधार: मुहूर्त चिन्तामणि (विवाह प्रकरण) एवं प्रचलित पंचांग-परम्परा की तालिकाएँ
 */
(function (root) {
  "use strict";
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);

  const VARNA = ["शूद्र", "वैश्य", "क्षत्रिय", "ब्राह्मण"]; // अंक = श्रेणी
  // राशि → वर्ण: जल=ब्राह्मण, अग्नि=क्षत्रिय, पृथ्वी=वैश्य, वायु=शूद्र
  const varnaOf = (sign) => [2, 1, 0, 3][sign % 4];

  const VASHYA = ["चतुष्पद", "मानव", "जलचर", "वनचर", "कीट"];
  function vashyaOf(sign, deg) {
    if (sign === 8) return deg < 15 ? 1 : 0; // धनु: पूर्वार्ध मानव, उत्तरार्ध चतुष्पद
    if (sign === 9) return deg < 15 ? 0 : 2; // मकर: पूर्वार्ध चतुष्पद, उत्तरार्ध जलचर
    return [0, 0, 1, 2, 3, 1, 1, 4, 1, 0, 1, 2][sign];
  }
  // पंक्ति = वर, स्तम्भ = कन्या
  const VASHYA_T = [
    [2, 1, 1, 0.5, 1],
    [1, 2, 0.5, 0, 1],
    [1, 0.5, 2, 1, 1],
    [0.5, 0, 1, 2, 0],
    [1, 1, 1, 0, 2],
  ];

  const YONI = ["अश्व", "गज", "मेष", "सर्प", "श्वान", "मार्जार", "मूषक", "गौ", "महिष", "व्याघ्र", "मृग", "वानर", "नकुल", "सिंह"];
  const YONI_T = [
    [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
    [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
    [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
    [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
    [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
    [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
    [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
    [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
    [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
    [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
    [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
    [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
    [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
  ];

  const GANA = ["देव", "मनुष्य", "राक्षस"];
  // पंक्ति = वर, स्तम्भ = कन्या
  const GANA_T = [[6, 6, 0], [5, 6, 0], [1, 0, 6]];

  const NADI = ["आदि", "मध्य", "अन्त्य"];
  const nadiOf = (nak) => [0, 1, 2, 2, 1, 0][nak % 6];

  const TARA_NAMES = ["जन्म", "सम्पत्", "विपत्", "क्षेम", "प्रत्यरि", "साधक", "वध", "मित्र", "अतिमित्र"];

  function rel(a, b) { // a की दृष्टि से b
    if (a === b) return "f";
    const f = J.FRIENDS[a];
    return f.f.includes(b) ? "f" : f.e.includes(b) ? "e" : "n";
  }
  function maitri(a, b) {
    if (a === b) return 5;
    const k = [rel(a, b), rel(b, a)].sort().join("");
    return { ff: 5, fn: 4, nn: 3, ef: 1, en: 0.5, ee: 0 }[k];
  }

  function person(r) {
    const m = r.planets.Moon;
    const nk = r.moonNk;
    return {
      name: r.input.name, sign: m.sign, deg: m.deg, nak: nk.idx, pada: nk.pada,
      lord: J.RASHI_LORD[m.sign], varna: varnaOf(m.sign), vashya: vashyaOf(m.sign, m.deg),
      yoni: YONI.indexOf(J.NAK_YONI[nk.idx]), gana: GANA.indexOf(J.NAK_GANA[nk.idx]), nadi: nadiOf(nk.idx),
      manglik: r.yogas.find((y) => y.name === "मांगलिक दोष") || null,
      marsHouse: r.planets.Mars.house,
    };
  }

  function match(rB, rG) {
    const B = person(rB), Gi = person(rG);
    const K = [];
    // 1. वर्ण
    K.push({ k: "वर्ण", max: 1, b: VARNA[B.varna], g: VARNA[Gi.varna], s: B.varna >= Gi.varna ? 1 : 0, about: "कार्य-क्षमता, अहं एवं आध्यात्मिक स्तर का मेल" });
    // 2. वश्य
    K.push({ k: "वश्य", max: 2, b: VASHYA[B.vashya], g: VASHYA[Gi.vashya], s: VASHYA_T[B.vashya][Gi.vashya], about: "परस्पर आकर्षण और एक-दूसरे पर प्रभाव" });
    // 3. तारा
    const t1 = ((B.nak - Gi.nak + 27) % 27) % 9, t2 = ((Gi.nak - B.nak + 27) % 27) % 9; // 0-आधारित तारा
    const bad = (t) => [2, 4, 6].includes(t);
    const taraS = (bad(t1) ? 0 : 1.5) + (bad(t2) ? 0 : 1.5);
    K.push({ k: "तारा", max: 3, b: `${J.NAKSHATRA[B.nak]} (${TARA_NAMES[t2]})`, g: `${J.NAKSHATRA[Gi.nak]} (${TARA_NAMES[t1]})`, s: taraS, about: "भाग्य, स्वास्थ्य और दीर्घायु" });
    // 4. योनि
    K.push({ k: "योनि", max: 4, b: YONI[B.yoni], g: YONI[Gi.yoni], s: YONI_T[B.yoni][Gi.yoni], about: "शारीरिक व स्वभावगत अनुकूलता, दाम्पत्य-सुख" });
    // 5. ग्रह मैत्री
    const gm = maitri(B.lord, Gi.lord);
    K.push({ k: "ग्रह मैत्री", max: 5, b: J.GRAHA[B.lord], g: J.GRAHA[Gi.lord], s: gm, about: "मानसिक मेल, विचारों की समानता और मित्रता" });
    // 6. गण
    K.push({ k: "गण", max: 6, b: GANA[B.gana], g: GANA[Gi.gana], s: GANA_T[B.gana][Gi.gana], about: "स्वभाव और व्यवहार का मेल" });
    // 7. भकूट
    const d = J.houseFrom(B.sign, Gi.sign); // वर से कन्या
    const bhGood = [1, 7, 3, 11, 4, 10].includes(d);
    const pairName = { 1: "सम-सप्तक/एक राशि", 7: "सम-सप्तक", 3: "तृतीय-एकादश", 11: "तृतीय-एकादश", 4: "चतुर्थ-दशम", 10: "चतुर्थ-दशम", 2: "द्विर्द्वादश", 12: "द्विर्द्वादश", 5: "नव-पंचम", 9: "नव-पंचम", 6: "षडाष्टक", 8: "षडाष्टक" }[d];
    K.push({ k: "भकूट", max: 7, b: J.RASHI[B.sign], g: J.RASHI[Gi.sign], s: bhGood ? 7 : 0, about: `प्रेम, परिवार-वृद्धि और आर्थिक समृद्धि (${pairName})` });
    // 8. नाड़ी
    K.push({ k: "नाड़ी", max: 8, b: NADI[B.nadi], g: NADI[Gi.nadi], s: B.nadi === Gi.nadi ? 0 : 8, about: "स्वास्थ्य, संतान और आनुवंशिक अनुकूलता" });

    const total = K.reduce((a, x) => a + x.s, 0);

    // दोष एवं परिहार
    const doshas = [];
    if (B.nadi === Gi.nadi) {
      const exc = [];
      if (B.sign === Gi.sign && B.nak !== Gi.nak) exc.push("दोनों की राशि एक, परन्तु नक्षत्र भिन्न");
      if (B.nak === Gi.nak && B.sign !== Gi.sign) exc.push("नक्षत्र एक, परन्तु राशि भिन्न");
      if (B.nak === Gi.nak && B.pada !== Gi.pada) exc.push("नक्षत्र एक, परन्तु चरण भिन्न");
      doshas.push({ name: "नाड़ी दोष", cancelled: exc.length > 0, text: exc.length ? `दोनों की ${NADI[B.nadi]} नाड़ी है, परन्तु परिहार है: ${exc.join("; ")}। दोष का प्रभाव नगण्य माना जाता है।` : `दोनों की ${NADI[B.nadi]} नाड़ी — इसे सबसे गम्भीर दोष माना जाता है (स्वास्थ्य और संतान के विषय में)। उपाय: महामृत्युंजय जप, नाड़ी दोष निवारण पूजा, स्वर्ण/अन्न दान।` });
    }
    if (!bhGood) {
      const lordOk = B.lord === Gi.lord || maitri(B.lord, Gi.lord) >= 4;
      doshas.push({ name: `भकूट दोष (${pairName})`, cancelled: lordOk, text: lordOk ? `राशि स्वामी ${J.GRAHA[B.lord]} और ${J.GRAHA[Gi.lord]} ${B.lord === Gi.lord ? "एक ही हैं" : "परस्पर मित्र हैं"} — भकूट दोष का परिहार हो जाता है।` : `${pairName} भकूट — ${d === 6 || d === 8 ? "षडाष्टक: विवाद और स्वास्थ्य-चिन्ता" : d === 5 || d === 9 ? "नव-पंचम: संतान-विषय में चिन्ता" : "द्विर्द्वादश: आर्थिक व्यय"}। राशि स्वामी मित्र नहीं, अतः दोष विचारणीय।` });
    }
    if (GANA_T[B.gana][Gi.gana] <= 1) {
      const ok = gm >= 4 || bhGood;
      doshas.push({ name: "गण दोष", cancelled: ok, text: ok ? `गण भिन्न (${GANA[B.gana]}–${GANA[Gi.gana]}), परन्तु ${gm >= 4 ? "ग्रह मैत्री उत्तम" : "भकूट शुभ"} होने से परिहार।` : `वर ${GANA[B.gana]} गण, कन्या ${GANA[Gi.gana]} गण — स्वभाव में टकराव सम्भव।` });
    }
    // मांगलिक
    const mB = B.manglik && !B.manglik.cancelled, mG = Gi.manglik && !Gi.manglik.cancelled;
    let manglik;
    if (mB && mG) manglik = { ok: true, text: "दोनों मांगलिक हैं — मांगलिक दोष परस्पर निरस्त हो जाता है। उत्तम मेल।" };
    else if (!mB && !mG) manglik = { ok: true, text: `दोनों में प्रभावी मांगलिक दोष नहीं है${B.manglik || Gi.manglik ? " (जहाँ है वहाँ परिहार हो चुका है)" : ""}।` };
    else manglik = { ok: false, text: `${mB ? "वर" : "कन्या"} मांगलिक है, ${mB ? "कन्या" : "वर"} नहीं। परम्परा के अनुसार विचारणीय; दूसरे की कुंडली में शनि/राहु/मंगल 1, 4, 7, 8, 12 में हों तो परिहार माना जाता है। अनुभवी ज्योतिषी से सलाह लें।` };
    if (!manglik.ok) {
      const other = mB ? rG : rB;
      const cancelP = ["Saturn", "Rahu", "Mars"].filter((p) => [1, 4, 7, 8, 12].includes(other.planets[p].house));
      if (cancelP.length) manglik = { ok: true, text: `${mB ? "वर" : "कन्या"} मांगलिक है; ${mB ? "कन्या" : "वर"} की कुंडली में ${cancelP.map((p) => J.GRAHA[p]).join(", ")} 1/4/7/8/12 भाव में होने से मांगलिक दोष का परिहार होता है।` };
    }

    let verdict;
    if (total < 18) verdict = { label: "अनुशंसित नहीं", color: "#b3261e", text: "18 से कम गुण — शास्त्र के अनुसार विवाह के लिए उपयुक्त नहीं माना जाता।" };
    else if (total < 25) verdict = { label: "मध्यम", color: "#b8860b", text: "18–24 गुण — सामान्य मेल; दोषों का परिहार देखकर विवाह किया जा सकता है।" };
    else if (total < 33) verdict = { label: "उत्तम", color: "#67993a", text: "25–32 गुण — अच्छा मेल; सुखी दाम्पत्य के योग।" };
    else verdict = { label: "अति उत्तम", color: "#2f7d4a", text: "33–36 गुण — श्रेष्ठ मेल।" };
    const activeDosha = doshas.filter((x) => !x.cancelled);
    if (total >= 18 && activeDosha.some((x) => x.name === "नाड़ी दोष")) verdict = { ...verdict, label: verdict.label + " (नाड़ी दोष सहित)", text: verdict.text + " परन्तु नाड़ी दोष प्रभावी है — उपाय/विशेषज्ञ परामर्श आवश्यक।" };

    return { B, G: Gi, K, total, doshas, manglik, verdict };
  }

  root.Milan = { match, person, YONI_T, VASHYA_T };
  if (typeof module !== "undefined") module.exports = root.Milan;
})(typeof window !== "undefined" ? window : globalThis);
