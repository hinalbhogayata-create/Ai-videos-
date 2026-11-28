/*
 * milan.js — अष्टकूट गुण मिलान (36 गुण)
 * वर्ण 1 · वश्य 2 · तारा 3 · योनि 4 · ग्रह मैत्री 5 · गण 6 · भकूट 7 · नाड़ी 8
 * आधार: मुहूर्त चिन्तामणि (विवाह प्रकरण) एवं प्रचलित पंचांग-परम्परा की तालिकाएँ
 */
(function (root) {
  "use strict";
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);
  const T = (hi, en) => (root.I18N && root.I18N.lang === "en" ? en : hi);

  const VARNA = () => T(["शूद्र", "वैश्य", "क्षत्रिय", "ब्राह्मण"], ["Shudra", "Vaishya", "Kshatriya", "Brahmin"]); // अंक = श्रेणी
  // राशि → वर्ण: जल=ब्राह्मण, अग्नि=क्षत्रिय, पृथ्वी=वैश्य, वायु=शूद्र
  const varnaOf = (sign) => [2, 1, 0, 3][sign % 4];

  const VASHYA = () => T(["चतुष्पद", "मानव", "जलचर", "वनचर", "कीट"], ["Chatushpada", "Manava", "Jalachara", "Vanachara", "Keeta"]);
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

  // क्रम: अश्व, गज, मेष, सर्प, श्वान, मार्जार, मूषक, गौ, महिष, व्याघ्र, मृग, वानर, नकुल, सिंह
  const YONI = () => T(["अश्व", "गज", "मेष", "सर्प", "श्वान", "मार्जार", "मूषक", "गौ", "महिष", "व्याघ्र", "मृग", "वानर", "नकुल", "सिंह"], ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion"]);
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

  const GANA = () => T(["देव", "मनुष्य", "राक्षस"], ["Deva", "Manushya", "Rakshasa"]);
  // पंक्ति = वर, स्तम्भ = कन्या
  const GANA_T = [[6, 6, 0], [5, 6, 0], [1, 0, 6]];

  const NADI = () => T(["आदि", "मध्य", "अन्त्य"], ["Adi", "Madhya", "Antya"]);
  const nadiOf = (nak) => [0, 1, 2, 2, 1, 0][nak % 6];

  const TARA_NAMES = () => T(["जन्म", "सम्पत्", "विपत्", "क्षेम", "प्रत्यरि", "साधक", "वध", "मित्र", "अतिमित्र"], ["Janma", "Sampat", "Vipat", "Kshema", "Pratyari", "Sadhaka", "Vadha", "Mitra", "Atimitra"]);

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
      yoni: J.YONI_IDX[nk.idx], gana: J.GANA_IDX[nk.idx], nadi: nadiOf(nk.idx),
      manglik: r.yogas.find((y) => y.id === "manglik") || null,
      marsHouse: r.planets.Mars.house,
    };
  }

  function match(rB, rG) {
    const B = person(rB), Gi = person(rG);
    const VA = VARNA(), VS = VASHYA(), YO = YONI(), GA = GANA(), NA = NADI(), TN = TARA_NAMES(), G = J.GRAHA;
    const K = [];
    K.push({ k: T("वर्ण", "Varna"), max: 1, b: VA[B.varna], g: VA[Gi.varna], s: B.varna >= Gi.varna ? 1 : 0, about: T("कार्य-क्षमता, अहं एवं आध्यात्मिक स्तर का मेल", "work capacity, ego and spiritual level") });
    K.push({ k: T("वश्य", "Vashya"), max: 2, b: VS[B.vashya], g: VS[Gi.vashya], s: VASHYA_T[B.vashya][Gi.vashya], about: T("परस्पर आकर्षण और एक-दूसरे पर प्रभाव", "mutual attraction and influence") });
    const t1 = ((B.nak - Gi.nak + 27) % 27) % 9, t2 = ((Gi.nak - B.nak + 27) % 27) % 9; // 0-आधारित तारा
    const bad = (t) => [2, 4, 6].includes(t);
    const taraS = (bad(t1) ? 0 : 1.5) + (bad(t2) ? 0 : 1.5);
    K.push({ k: T("तारा", "Tara"), max: 3, b: `${J.NAKSHATRA[B.nak]} (${TN[t2]})`, g: `${J.NAKSHATRA[Gi.nak]} (${TN[t1]})`, s: taraS, about: T("भाग्य, स्वास्थ्य और दीर्घायु", "fortune, health and longevity") });
    K.push({ k: T("योनि", "Yoni"), max: 4, b: YO[B.yoni], g: YO[Gi.yoni], s: YONI_T[B.yoni][Gi.yoni], about: T("शारीरिक व स्वभावगत अनुकूलता, दाम्पत्य-सुख", "physical and temperamental compatibility, marital happiness") });
    const gm = maitri(B.lord, Gi.lord);
    K.push({ k: T("ग्रह मैत्री", "Graha Maitri"), max: 5, b: G[B.lord], g: G[Gi.lord], s: gm, about: T("मानसिक मेल, विचारों की समानता और मित्रता", "mental harmony, like-mindedness and friendship") });
    K.push({ k: T("गण", "Gana"), max: 6, b: GA[B.gana], g: GA[Gi.gana], s: GANA_T[B.gana][Gi.gana], about: T("स्वभाव और व्यवहार का मेल", "temperament and behaviour") });
    const d = J.houseFrom(B.sign, Gi.sign); // वर से कन्या
    const bhGood = [1, 7, 3, 11, 4, 10].includes(d);
    const PN = T({ 1: "सम-सप्तक/एक राशि", 7: "सम-सप्तक", 3: "तृतीय-एकादश", 11: "तृतीय-एकादश", 4: "चतुर्थ-दशम", 10: "चतुर्थ-दशम", 2: "द्विर्द्वादश", 12: "द्विर्द्वादश", 5: "नव-पंचम", 9: "नव-पंचम", 6: "षडाष्टक", 8: "षडाष्टक" }, { 1: "same sign", 7: "1/7 (sama-saptaka)", 3: "3/11", 11: "3/11", 4: "4/10", 10: "4/10", 2: "2/12 (dvirdvadasha)", 12: "2/12 (dvirdvadasha)", 5: "5/9 (nava-panchama)", 9: "5/9 (nava-panchama)", 6: "6/8 (shadashtaka)", 8: "6/8 (shadashtaka)" });
    const pairName = PN[d];
    K.push({ k: T("भकूट", "Bhakoot"), max: 7, b: J.RASHI[B.sign], g: J.RASHI[Gi.sign], s: bhGood ? 7 : 0, about: T(`प्रेम, परिवार-वृद्धि और आर्थिक समृद्धि (${pairName})`, `love, family growth and prosperity (${pairName})`) });
    K.push({ k: T("नाड़ी", "Nadi"), max: 8, b: NA[B.nadi], g: NA[Gi.nadi], s: B.nadi === Gi.nadi ? 0 : 8, about: T("स्वास्थ्य, संतान और आनुवंशिक अनुकूलता", "health, progeny and hereditary compatibility") });
    const total = K.reduce((a, x) => a + x.s, 0);

    const doshas = [];
    if (B.nadi === Gi.nadi) {
      const exc = [];
      if (B.sign === Gi.sign && B.nak !== Gi.nak) exc.push(T("दोनों की राशि एक, परन्तु नक्षत्र भिन्न", "same sign but different nakshatras"));
      if (B.nak === Gi.nak && B.sign !== Gi.sign) exc.push(T("नक्षत्र एक, परन्तु राशि भिन्न", "same nakshatra but different signs"));
      if (B.nak === Gi.nak && B.pada !== Gi.pada) exc.push(T("नक्षत्र एक, परन्तु चरण भिन्न", "same nakshatra but different padas"));
      doshas.push({ id: "nadi", name: T("नाड़ी दोष", "Nadi Dosha"), cancelled: exc.length > 0, text: exc.length ? T(`दोनों की ${NA[B.nadi]} नाड़ी है, परन्तु परिहार है: ${exc.join("; ")}। दोष का प्रभाव नगण्य माना जाता है।`, `Both have ${NA[B.nadi]} nadi, but there is a parihara: ${exc.join("; ")}. The dosha's effect is considered negligible.`) : T(`दोनों की ${NA[B.nadi]} नाड़ी — इसे सबसे गम्भीर दोष माना जाता है (स्वास्थ्य और संतान के विषय में)। उपाय: महामृत्युंजय जप, नाड़ी दोष निवारण पूजा, स्वर्ण/अन्न दान।`, `Both have ${NA[B.nadi]} nadi — considered the most serious dosha (regarding health and progeny). Remedies: Mahamrityunjaya japa, Nadi dosha nivaran puja, donation of gold/grain.`) });
    }
    if (!bhGood) {
      const lordOk = B.lord === Gi.lord || maitri(B.lord, Gi.lord) >= 4;
      const kind = d === 6 || d === 8 ? T("षडाष्टक: विवाद और स्वास्थ्य-चिन्ता", "6/8: disputes and health worries") : d === 5 || d === 9 ? T("नव-पंचम: संतान-विषय में चिन्ता", "5/9: concerns about children") : T("द्विर्द्वादश: आर्थिक व्यय", "2/12: financial drain");
      doshas.push({ id: "bhakoot", name: T(`भकूट दोष (${pairName})`, `Bhakoot Dosha (${pairName})`), cancelled: lordOk, text: lordOk ? T(`राशि स्वामी ${G[B.lord]} और ${G[Gi.lord]} ${B.lord === Gi.lord ? "एक ही हैं" : "परस्पर मित्र हैं"} — भकूट दोष का परिहार हो जाता है।`, `The sign lords ${G[B.lord]} and ${G[Gi.lord]} ${B.lord === Gi.lord ? "are the same" : "are mutual friends"} — the Bhakoot dosha is cancelled.`) : T(`${pairName} भकूट — ${kind}। राशि स्वामी मित्र नहीं, अतः दोष विचारणीय।`, `${pairName} bhakoot — ${kind}. The sign lords are not friends, so the dosha needs consideration.`) });
    }
    if (GANA_T[B.gana][Gi.gana] <= 1) {
      const ok = gm >= 4 || bhGood;
      doshas.push({ id: "gana", name: T("गण दोष", "Gana Dosha"), cancelled: ok, text: ok ? T(`गण भिन्न (${GA[B.gana]}–${GA[Gi.gana]}), परन्तु ${gm >= 4 ? "ग्रह मैत्री उत्तम" : "भकूट शुभ"} होने से परिहार।`, `Different ganas (${GA[B.gana]}–${GA[Gi.gana]}), but cancelled because ${gm >= 4 ? "graha maitri is excellent" : "bhakoot is favourable"}.`) : T(`वर ${GA[B.gana]} गण, कन्या ${GA[Gi.gana]} गण — स्वभाव में टकराव सम्भव।`, `Groom ${GA[B.gana]} gana, bride ${GA[Gi.gana]} gana — temperamental clashes are possible.`) });
    }
    const groom = T("वर", "The groom"), bride = T("कन्या", "the bride"), Bride = T("कन्या", "The bride"), groomL = T("वर", "the groom");
    const mB = B.manglik && !B.manglik.cancelled, mG = Gi.manglik && !Gi.manglik.cancelled;
    let manglik;
    if (mB && mG) manglik = { ok: true, text: T("दोनों मांगलिक हैं — मांगलिक दोष परस्पर निरस्त हो जाता है। उत्तम मेल।", "Both are Manglik — the dosha cancels out mutually. A good match.") };
    else if (!mB && !mG) manglik = { ok: true, text: T(`दोनों में प्रभावी मांगलिक दोष नहीं है${B.manglik || Gi.manglik ? " (जहाँ है वहाँ परिहार हो चुका है)" : ""}।`, `Neither has an effective Manglik dosha${B.manglik || Gi.manglik ? " (where present, it is cancelled)" : ""}.`) };
    else manglik = { ok: false, text: T(`${mB ? "वर" : "कन्या"} मांगलिक है, ${mB ? "कन्या" : "वर"} नहीं। परम्परा के अनुसार विचारणीय; दूसरे की कुंडली में शनि/राहु/मंगल 1, 4, 7, 8, 12 में हों तो परिहार माना जाता है। अनुभवी ज्योतिषी से सलाह लें।`, `${mB ? groom : Bride} is Manglik, ${mB ? bride : groomL} is not. Traditionally this needs consideration; Saturn/Rahu/Mars in the 1st, 4th, 7th, 8th or 12th of the other chart is accepted as a parihara. Consult an experienced astrologer.`) };
    if (!manglik.ok) {
      const other = mB ? rG : rB;
      const cancelP = ["Saturn", "Rahu", "Mars"].filter((p) => [1, 4, 7, 8, 12].includes(other.planets[p].house));
      if (cancelP.length) manglik = { ok: true, text: T(`${mB ? "वर" : "कन्या"} मांगलिक है; ${mB ? "कन्या" : "वर"} की कुंडली में ${cancelP.map((p) => G[p]).join(", ")} 1/4/7/8/12 भाव में होने से मांगलिक दोष का परिहार होता है।`, `${mB ? groom : Bride} is Manglik; ${cancelP.map((p) => G[p]).join(", ")} in the 1st/4th/7th/8th/12th of ${mB ? bride : groomL}'s chart cancels the Manglik dosha.`) };
    }

    let verdict;
    if (total < 18) verdict = { label: T("अनुशंसित नहीं", "Not recommended"), color: "#b3261e", text: T("18 से कम गुण — शास्त्र के अनुसार विवाह के लिए उपयुक्त नहीं माना जाता।", "Fewer than 18 gunas — per the texts not considered suitable for marriage.") };
    else if (total < 25) verdict = { label: T("मध्यम", "Average"), color: "#b8860b", text: T("18–24 गुण — सामान्य मेल; दोषों का परिहार देखकर विवाह किया जा सकता है।", "18–24 gunas — an ordinary match; marriage can proceed after checking pariharas.") };
    else if (total < 33) verdict = { label: T("उत्तम", "Good"), color: "#67993a", text: T("25–32 गुण — अच्छा मेल; सुखी दाम्पत्य के योग।", "25–32 gunas — a good match; indications of a happy marriage.") };
    else verdict = { label: T("अति उत्तम", "Excellent"), color: "#2f7d4a", text: T("33–36 गुण — श्रेष्ठ मेल।", "33–36 gunas — an excellent match.") };
    if (total >= 18 && doshas.some((x) => x.id === "nadi" && !x.cancelled)) verdict = { ...verdict, label: verdict.label + T(" (नाड़ी दोष सहित)", " (with Nadi dosha)"), text: verdict.text + T(" परन्तु नाड़ी दोष प्रभावी है — उपाय/विशेषज्ञ परामर्श आवश्यक।", " But Nadi dosha is active — remedies/expert advice are needed.") };

    return { B, G: Gi, K, total, doshas, manglik, verdict };
  }

  root.Milan = { match, person, YONI_T, VASHYA_T };
  if (typeof module !== "undefined") module.exports = root.Milan;
})(typeof window !== "undefined" ? window : globalThis);
