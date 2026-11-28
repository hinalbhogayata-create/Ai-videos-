/*
 * yogdosh.js — योग विवरण एवं दोष-परीक्षण (हिन्दी / English)
 * प्रत्येक योग: कैसे बनता है, शास्त्र-स्रोत, किन ग्रहों की दशा में फल देगा।
 * प्रत्येक दोष: क्या है, कैसे बनता है, स्रोत, इस कुंडली में स्थिति (है / आंशिक / परिहार / नहीं),
 *   परिहार के नियम, प्रभाव, उपाय कितना आवश्यक, और निवारण।
 */
(function (root) {
  "use strict";
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);
  const T = (hi, en) => (root.I18N && root.I18N.lang === "en" ? en : hi);
  const SEVEN = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

  // ---------------- योग विवरण (id से) ----------------
  const BPHS_PMP = () => T("BPHS — पञ्चमहापुरुष योगाध्याय; फलदीपिका अ. 6", "BPHS — Pancha Mahapurusha chapter; Phaladeepika ch. 6");
  const VIP = () => T("BPHS एवं उत्तरकालामृत (विपरीत राजयोग)", "BPHS and Uttara Kalamrita (Viparita Raja Yoga)");
  const YOGA_INFO = {
    gajakesari: () => [T("चन्द्रमा से केन्द्र (1, 4, 7, 10) में गुरु हो और गुरु नीच न हो।", "Jupiter in a kendra (1, 4, 7, 10) from the Moon and not debilitated."), T("बृहत् पाराशर होरा शास्त्र (चन्द्रयोग प्रकरण); फलदीपिका अ. 6 (योगाध्याय)", "BPHS (lunar yogas); Phaladeepika ch. 6 (Yoga chapter)"), ["Jupiter", "Moon"]],
    ruchaka: () => [T("मंगल स्वराशि (मेष/वृश्चिक) या उच्च (मकर) में होकर लग्न से केन्द्र में।", "Mars in its own sign (Aries/Scorpio) or exaltation (Capricorn) in a kendra from the Lagna."), BPHS_PMP(), ["Mars"]],
    bhadra: () => [T("बुध स्वराशि (मिथुन/कन्या) या उच्च (कन्या) में होकर लग्न से केन्द्र में।", "Mercury in its own sign (Gemini/Virgo) or exaltation (Virgo) in a kendra from the Lagna."), BPHS_PMP(), ["Mercury"]],
    hamsa: () => [T("गुरु स्वराशि (धनु/मीन) या उच्च (कर्क) में होकर लग्न से केन्द्र में।", "Jupiter in its own sign (Sagittarius/Pisces) or exaltation (Cancer) in a kendra from the Lagna."), BPHS_PMP(), ["Jupiter"]],
    malavya: () => [T("शुक्र स्वराशि (वृषभ/तुला) या उच्च (मीन) में होकर लग्न से केन्द्र में।", "Venus in its own sign (Taurus/Libra) or exaltation (Pisces) in a kendra from the Lagna."), BPHS_PMP(), ["Venus"]],
    shasha: () => [T("शनि स्वराशि (मकर/कुम्भ) या उच्च (तुला) में होकर लग्न से केन्द्र में।", "Saturn in its own sign (Capricorn/Aquarius) or exaltation (Libra) in a kendra from the Lagna."), BPHS_PMP(), ["Saturn"]],
    budhaditya: () => [T("सूर्य और बुध एक ही राशि में (बुध अस्त न हो तो पूर्ण फल)।", "Sun and Mercury in the same sign (full results if Mercury is not combust)."), T("फलदीपिका एवं प्रचलित परम्परा", "Phaladeepika and common tradition"), ["Sun", "Mercury"]],
    chandramangal: () => [T("चन्द्रमा और मंगल की युति।", "Conjunction of the Moon and Mars."), T("फलदीपिका अ. 6; सारावली (द्विग्रह योग)", "Phaladeepika ch. 6; Saravali (two-planet yogas)"), ["Moon", "Mars"]],
    durudhara: () => [T("चन्द्रमा से द्वितीय और द्वादश दोनों में ग्रह (सूर्य, राहु, केतु छोड़कर)।", "Planets in both the 2nd and 12th from the Moon (excluding Sun, Rahu, Ketu)."), T("बृहज्जातक — चन्द्रयोगाध्याय; BPHS", "Brihat Jataka — lunar yogas chapter; BPHS"), ["Moon"]],
    sunapha: () => [T("चन्द्रमा से द्वितीय भाव में ग्रह (सूर्य, राहु, केतु छोड़कर)।", "A planet in the 2nd from the Moon (excluding Sun, Rahu, Ketu)."), T("बृहज्जातक — चन्द्रयोगाध्याय; BPHS", "Brihat Jataka — lunar yogas chapter; BPHS"), ["Moon"]],
    anapha: () => [T("चन्द्रमा से द्वादश भाव में ग्रह (सूर्य, राहु, केतु छोड़कर)।", "A planet in the 12th from the Moon (excluding Sun, Rahu, Ketu)."), T("बृहज्जातक — चन्द्रयोगाध्याय; BPHS", "Brihat Jataka — lunar yogas chapter; BPHS"), ["Moon"]],
    yogakaraka: () => [T("एक ही ग्रह केन्द्र (4/7/10) और त्रिकोण (5/9) दोनों का स्वामी हो।", "One planet lords both a kendra (4/7/10) and a trikona (5/9)."), T("BPHS — राजयोगाध्याय / योगकारक विचार", "BPHS — Raja Yoga chapter / yogakaraka"), null],
    rajayoga: () => [T("केन्द्र के स्वामी और त्रिकोण के स्वामी की युति या परस्पर राशि-परिवर्तन।", "Conjunction or sign-exchange between a kendra lord and a trikona lord."), T("BPHS — राजयोगाध्याय", "BPHS — Raja Yoga chapter"), null],
    dhana: () => [T("द्वितीय/एकादश के स्वामी का पंचम/नवम के स्वामी से सम्बन्ध।", "Link between the 2nd/11th lord and the 5th/9th lord."), T("BPHS — धनयोगाध्याय", "BPHS — Dhana Yoga chapter"), null],
    harsha: () => [T("षष्ठेश 6, 8 या 12 भाव में।", "The 6th lord in the 6th, 8th or 12th house."), VIP(), null],
    sarala: () => [T("अष्टमेश 6, 8 या 12 भाव में।", "The 8th lord in the 6th, 8th or 12th house."), VIP(), null],
    vimala: () => [T("द्वादशेश 6, 8 या 12 भाव में।", "The 12th lord in the 6th, 8th or 12th house."), VIP(), null],
    amala: () => [T("लग्न से दशम भाव में शुभ ग्रह (गुरु, शुक्र, बुध)।", "A benefic (Jupiter, Venus, Mercury) in the 10th from the Lagna."), T("फलदीपिका अ. 6", "Phaladeepika ch. 6"), null],
    neechabhanga: () => [T("नीच ग्रह की राशि का स्वामी या उसकी उच्च राशि का स्वामी लग्न/चन्द्र से केन्द्र में।", "The lord of the debilitation sign or of the exaltation sign is in a kendra from the Lagna/Moon."), T("फलदीपिका अ. 7; BPHS", "Phaladeepika ch. 7; BPHS"), null],
    saraswati: () => [T("गुरु, शुक्र, बुध केन्द्र/त्रिकोण/द्वितीय में तथा गुरु बलवान।", "Jupiter, Venus, Mercury in kendras/trikonas/2nd and Jupiter strong."), T("फलदीपिका अ. 6; जातक पारिजात", "Phaladeepika ch. 6; Jataka Parijata"), ["Jupiter", "Venus", "Mercury"]],
    lakshmi: () => [T("भाग्येश केन्द्र/त्रिकोण में स्वराशि/उच्च तथा लग्नेश बलवान।", "The 9th lord in its own/exaltation sign in a kendra/trikona and a strong Lagna lord."), "BPHS", null],
  };
  const DOSHA_IDS = ["kemadruma", "manglik", "kaalsarp", "grahan", "guruchandal", "shakat"];

  function planetsIn(text) {
    const G = J.GRAHA;
    return Object.keys(G).filter((p) => text.includes(G[p]));
  }
  function periods(r, planets, nowJd, tz, max = 3) {
    const fmt = (jd) => { const d = new Date((jd - 2440587.5) * 86400000 + tz * 60000); return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`; };
    const NOW = T(" ◀ अभी", " ◀ now");
    const out = [];
    for (const md of r.dasha.list) {
      if (md.end < nowJd) continue;
      if (planets.includes(md.lord)) {
        out.push(`${J.GRAHA[md.lord]} ${T("महादशा", "Mahadasha")} (${fmt(Math.max(md.start, r.chart.jd))} – ${fmt(md.end)})${nowJd >= md.start && nowJd < md.end ? NOW : ""}`);
      } else {
        for (const ad of md.antar) if (ad.end > nowJd && planets.includes(ad.lord)) { out.push(`${J.GRAHA[md.lord]}-${J.GRAHA[ad.lord]} (${fmt(ad.start)} – ${fmt(ad.end)})${nowJd >= ad.start && nowJd < ad.end ? NOW : ""}`); break; }
      }
      if (out.length >= max) break;
    }
    return out;
  }

  function yogaCards(r, nowJd) {
    return r.yogas.filter((y) => y.good && !DOSHA_IDS.includes(y.id)).map((y) => {
      const info = YOGA_INFO[y.id] ? YOGA_INFO[y.id]() : null;
      let pl = info && info[2] ? info[2] : y.planet ? [y.planet] : planetsIn(y.name + " " + y.text);
      pl = pl.filter((p) => p !== "Rahu" && p !== "Ketu");
      return { name: y.name, text: y.text, rule: info ? info[0] : "", src: info ? info[1] : T("शास्त्रीय योग", "Classical yoga"), when: periods(r, pl, nowJd, r.input.tzOffsetMin) };
    });
  }

  // ---------------- दोष ----------------
  const jupAspects = (r, p) => {
    const P = r.planets, h = J.houseFrom(P.Jupiter.sign, P[p].sign);
    return h === 1 || h === 5 || h === 7 || h === 9;
  };
  const KS = () => T(["अनन्त", "कुलिक", "वासुकि", "शंखपाल", "पद्म", "महापद्म", "तक्षक", "कर्कोटक", "शंखचूड़", "घातक", "विषधर", "शेषनाग"], ["Ananta", "Kulika", "Vasuki", "Shankhapala", "Padma", "Mahapadma", "Takshaka", "Karkotaka", "Shankhachuda", "Ghataka", "Vishadhara", "Sheshanaga"]);
  const GANDMOOL = [0, 8, 9, 17, 18, 26];
  const M = (ic, hk, ek, ht, et) => [ic, T(hk, ek), T(ht, et)];

  function DEFS() {
    const ORD = J.ORD, G = J.GRAHA, RASHI = J.RASHI;
    return [
      {
        id: "mangal", icon: "🔥", name: T("मांगलिक (कुज) दोष", "Manglik (Kuja) Dosha"),
        what: T("मंगल ऊर्जा, साहस और उग्रता का ग्रह है। विवाह-भाव से जुड़े स्थानों में मंगल होने पर दाम्पत्य में तनाव/उग्रता मानी जाती है — इसे कुज दोष या मांगलिक दोष कहते हैं।", "Mars is the planet of energy, courage and aggression. When Mars occupies houses linked with marriage, tension or harshness in married life is expected — this is called Kuja or Manglik dosha."),
        rule: T("लग्न, चन्द्र (और दक्षिण परम्परा में शुक्र) से 1, 2, 4, 7, 8, 12 भाव में मंगल।", "Mars in the 1st, 2nd, 4th, 7th, 8th or 12th from the Lagna, the Moon (and in the southern tradition, Venus)."),
        shloka: T("लग्ने व्यये च पाताले जामित्रे चाष्टमे कुजे। कन्या भर्तुर्विनाशाय भर्ता कन्याविनाशकः॥ (प्रचलित वचन — कुछ पाठों में “धने व्यये…” से द्वितीय भाव भी गिना जाता है)", "Lagne vyaye cha pātāle jāmitre chāṣṭame kuje… (a popular verse — some readings, “dhane vyaye…”, also count the 2nd house)"),
        src: T("मुहूर्त-ग्रंथों की विवाह-प्रकरण परम्परा एवं प्रचलित वचन (BPHS में यह नाम नहीं, पर सप्तम-अष्टम मंगल का अशुभ फल वर्णित है)", "Marriage chapters of the muhurta texts and popular verses (the name is not in BPHS, but adverse results of Mars in the 7th/8th are described)"),
        effect: T("विवाह में विलम्ब, दाम्पत्य में तनाव/क्रोध, जीवनसाथी के स्वास्थ्य की चिन्ता", "delay in marriage, tension/anger in married life, concern for the spouse's health"),
        rem: [M("📿", "मंत्र", "Mantra", "“ॐ क्रां क्रीं क्रौं सः भौमाय नमः” 108 बार, मंगलवार से आरम्भ", "“Om Kraam Kreem Kraum Sah Bhaumaya Namah” 108 times, starting on a Tuesday"), M("🙏", "पूजा / व्रत", "Puja / fast", "मंगलवार व्रत, हनुमान चालीसा/सुन्दरकाण्ड; मंगल शान्ति पूजा (उज्जैन मंगलनाथ प्रसिद्ध)", "Tuesday fast, Hanuman Chalisa/Sundarkand; Mangal shanti puja (Mangalnath, Ujjain is renowned)"), M("🎁", "दान", "Charity", "मंगलवार मसूर दाल, लाल वस्त्र, गुड़ का दान", "donate masoor dal, red cloth and jaggery on Tuesday"), M("💍", "विवाह-उपाय", "Marriage remedy", "मांगलिक जीवनसाथी से विवाह सर्वोत्तम परिहार; परम्परा में कुम्भ-विवाह/अर्क-विवाह का विधान (योग्य आचार्य से)", "marrying a Manglik partner is the best parihara; tradition prescribes Kumbha/Arka vivah (through a qualified acharya)")],
        check(r) {
          const P = r.planets, H = [1, 2, 4, 7, 8, 12];
          const fl = P.Mars.house, fm = J.houseFrom(P.Moon.sign, P.Mars.sign), fv = J.houseFrom(P.Venus.sign, P.Mars.sign);
          const from = [];
          if (H.includes(fl)) from.push(T(`लग्न से ${ORD(fl)}`, `${ORD(fl)} from the Lagna`));
          if (H.includes(fm)) from.push(T(`चन्द्र से ${ORD(fm)}`, `${ORD(fm)} from the Moon`));
          if (H.includes(fv)) from.push(T(`शुक्र से ${ORD(fv)}`, `${ORD(fv)} from Venus`));
          if (!from.length) return { status: "absent", detail: T(`मंगल लग्न से ${ORD(fl)}, चन्द्र से ${ORD(fm)} भाव में — मांगलिक दोष नहीं।`, `Mars is ${ORD(fl)} from the Lagna and ${ORD(fm)} from the Moon — no Manglik dosha.`) };
          const par = [];
          if (["own", "exalt", "moola"].includes(P.Mars.dignity.key)) par.push(T(`मंगल ${P.Mars.dignity.label} (${RASHI[P.Mars.sign]}) में है`, `Mars is ${P.Mars.dignity.label.toLowerCase()} (${RASHI[P.Mars.sign]})`));
          if (jupAspects(r, "Mars")) par.push(T("मंगल पर गुरु की युति/दृष्टि है", "Jupiter conjoins/aspects Mars"));
          if (P.Mars.sign === P.Moon.sign) par.push(T("मंगल चन्द्रमा के साथ है", "Mars is with the Moon"));
          const BH = { 2: [2, 5], 12: [1, 6], 4: [0, 7], 7: [3, 9], 8: [8, 11], 1: [0, 4, 3, 9] };
          if (H.includes(fl) && (BH[fl] || []).includes(P.Mars.sign)) par.push(T(`${ORD(fl)} भाव में ${RASHI[P.Mars.sign]} का मंगल (भाव-विशेष परिहार)`, `Mars in ${RASHI[P.Mars.sign]} in the ${ORD(fl)} house (house-specific parihara)`));
          const strong = H.includes(fl) && (H.includes(fm) || H.includes(fv));
          return { status: par.length ? "cancelled" : strong ? "present" : "partial", detail: T(`मंगल ${from.join(", ")} भाव में।`, `Mars is ${from.join(", ")}.`), parihara: par };
        },
        need: { present: T("विवाह से पूर्व कुंडली मिलान अनिवार्य; मांगलिक जीवनसाथी सर्वोत्तम। मंगल-शान्ति उपाय आवश्यक।", "Kundli matching before marriage is essential; a Manglik partner is best. Mangal-shanti remedies are needed."), partial: T("आंशिक दोष — सामान्य मंगल उपाय (हनुमान उपासना) पर्याप्त; मिलान में ध्यान रखें।", "Partial dosha — general Mars remedies (Hanuman worship) are enough; keep it in mind while matching."), cancelled: T("परिहार होने से दोष का प्रभाव नगण्य — विशेष अनुष्ठान आवश्यक नहीं; फिर भी मिलान में उल्लेख करें।", "Due to parihara the effect is negligible — no special ritual needed; still mention it during matching.") },
      },
      {
        id: "kaalsarp", icon: "🐍", name: T("काल सर्प दोष", "Kaal Sarp Dosha"),
        what: T("जब सातों ग्रह राहु और केतु के एक ही ओर आ जाते हैं, तो कुंडली राहु-केतु अक्ष में “घिरी” मानी जाती है। इससे जीवन में अचानक रुकावटें और उतार-चढ़ाव माने जाते हैं।", "When all seven planets fall on one side of Rahu and Ketu, the chart is considered “hemmed in” by the nodal axis, bringing sudden obstacles and ups and downs."),
        rule: T("सूर्य से शनि तक सातों ग्रह राहु से केतु के बीच (या केतु से राहु के बीच) एक ही ओर। एक ग्रह बाहर हो तो आंशिक।", "All seven planets from the Sun to Saturn lie between Rahu and Ketu on one side. If one planet is outside, it is partial."),
        src: T("उत्तरकालीन परम्परा — ध्यान दें: बृहत् पाराशर होरा शास्त्र, बृहज्जातक, फलदीपिका, सारावली या जातक पारिजात में “काल सर्प” का वर्णन नहीं मिलता। (सर्प योग अलग है — पाप ग्रह तीन केन्द्रों में)", "Later tradition — note: “Kaal Sarp” is not described in BPHS, Brihat Jataka, Phaladeepika, Saravali or Jataka Parijata. (Sarpa yoga is different — malefics in three kendras)"),
        effect: T("प्रयासों में अचानक रुकावट, विलम्ब, अज्ञात भय/बुरे स्वप्न, उतार-चढ़ाव भरा जीवन", "sudden obstacles to efforts, delays, unknown fears/bad dreams, a life of ups and downs"),
        rem: [M("📿", "मंत्र", "Mantra", "महामृत्युंजय मंत्र प्रतिदिन 108 बार; “ॐ नमः शिवाय” का जप", "Mahamrityunjaya mantra 108 times daily; japa of “Om Namah Shivaya”"), M("🙏", "पूजा", "Puja", "नाग पंचमी पर नाग-देवता पूजन; त्र्यम्बकेश्वर/उज्जैन में कालसर्प शान्ति पूजा; शिवलिंग पर चाँदी का नाग-नागिन जोड़ा अर्पण", "worship of the Naga deities on Nag Panchami; Kaal Sarp shanti puja at Trimbakeshwar/Ujjain; offer a silver serpent pair on the Shivalinga"), M("🎁", "दान", "Charity", "शनिवार नारियल बहते जल में प्रवाहित करें; काले तिल, कम्बल का दान", "on Saturday float a coconut in flowing water; donate black sesame and blankets")],
        check(r) {
          const P = r.planets, rahu = P.Rahu.lon;
          const d = SEVEN.map((p) => J.norm(P[p].lon - rahu));
          const a = d.filter((x) => x < 180).length;
          const type = T(`${KS()[P.Rahu.house - 1]} काल सर्प (राहु ${ORD(P.Rahu.house)} भाव में)`, `${KS()[P.Rahu.house - 1]} Kaal Sarp (Rahu in the ${ORD(P.Rahu.house)} house)`);
          if (a === 7 || a === 0) return { status: "present", detail: T(`सभी सात ग्रह राहु-केतु अक्ष के एक ओर — ${type}।`, `All seven planets on one side of the Rahu–Ketu axis — ${type}.`) };
          if (a === 6 || a === 1) return { status: "partial", detail: T(`छह ग्रह एक ओर, एक ग्रह बाहर — आंशिक ${type}।`, `Six planets on one side and one outside — partial ${type}.`) };
          return { status: "absent", detail: T("ग्रह राहु-केतु अक्ष के दोनों ओर फैले हैं — काल सर्प दोष नहीं।", "Planets are spread on both sides of the Rahu–Ketu axis — no Kaal Sarp dosha.") };
        },
        need: { present: T("शास्त्रीय ग्रंथों में अनिवार्यता नहीं; परम्परा में शान्ति-पूजा कराई जाती है। महामृत्युंजय जप और शिव उपासना पर्याप्त व सुरक्षित उपाय।", "Not mandatory per the classical texts; tradition performs a shanti puja. Mahamrityunjaya japa and Shiva worship are sufficient and safe remedies."), partial: T("आंशिक — केवल नियमित शिव उपासना पर्याप्त; किसी महँगे अनुष्ठान की आवश्यकता नहीं।", "Partial — regular Shiva worship is enough; no expensive ritual is needed.") },
      },
      {
        id: "pitru", icon: "🕯️", name: T("पितृ दोष", "Pitru Dosha"),
        what: T("सूर्य पिता/पूर्वजों का और नवम भाव पितृ-धर्म का कारक है। इन पर राहु-केतु का प्रभाव पितरों के ऋण/असन्तोष का संकेत माना जाता है।", "The Sun signifies the father/ancestors and the 9th house ancestral dharma. Rahu–Ketu's influence on these is read as a sign of ancestral debt or dissatisfaction."),
        rule: T("सूर्य के साथ राहु/केतु; या नवम भाव में राहु; या नवमेश राहु/केतु के साथ।", "Rahu/Ketu with the Sun; or Rahu in the 9th; or the 9th lord with Rahu/Ketu."),
        src: T("BPHS — पूर्वजन्म शाप/पितृ-शाप प्रकरण (सूर्य-राहु, नवम पीड़ा) एवं परम्परा", "BPHS — chapter on curses of past life/ancestors (Sun–Rahu, affliction of the 9th) and tradition"),
        effect: T("पितरों का असन्तोष — संतान, विवाह, उन्नति में बाधा; परिवार में कलह", "ancestral dissatisfaction — obstacles to children, marriage and progress; family discord"),
        rem: [M("🙏", "पूजा", "Puja", "प्रत्येक अमावस्या को पितृ-तर्पण; पितृ-पक्ष में श्राद्ध; आवश्यकता हो तो त्रिपिण्डी श्राद्ध/नारायण बलि (योग्य आचार्य से)", "pitru-tarpan on every Amavasya; shraddha during Pitru Paksha; if needed, Tripindi Shraddha/Narayan Bali (through a qualified acharya)"), M("🎁", "दान", "Charity", "अमावस्या को गाय, कौवे और कुत्ते को भोजन; ब्राह्मण भोजन", "feed cows, crows and dogs on Amavasya; feed Brahmins"), M("🌳", "सेवा", "Service", "पीपल को जल अर्पित करें; माता-पिता व वृद्धों की सेवा", "offer water to the Peepal tree; serve parents and elders"), M("📿", "मंत्र", "Mantra", "“ॐ पितृभ्यः नमः” / पितृ गायत्री; श्रीमद्भगवद्गीता का 11वाँ अध्याय", "“Om Pitribhyah Namah” / Pitru Gayatri; chapter 11 of the Bhagavad Gita")],
        check(r) {
          const P = r.planets, why = [];
          for (const n of ["Rahu", "Ketu"]) if (P.Sun.sign === P[n].sign) why.push(T(`सूर्य-${G[n]} युति`, `Sun–${G[n]} conjunction`));
          if (P.Rahu.house === 9) why.push(T("नवम भाव में राहु", "Rahu in the 9th house"));
          const l9 = r.houses[8].lord;
          for (const n of ["Rahu", "Ketu"]) if (P[l9].sign === P[n].sign && l9 !== "Sun") why.push(T(`नवमेश ${G[l9]} के साथ ${G[n]}`, `9th lord ${G[l9]} with ${G[n]}`));
          if (!why.length) return { status: "absent", detail: T("सूर्य और नवम भाव राहु-केतु से मुक्त — पितृ दोष नहीं।", "The Sun and the 9th house are free of Rahu–Ketu — no Pitru dosha.") };
          const par = jupAspects(r, "Sun") ? [T("सूर्य पर गुरु की दृष्टि/युति से दोष हल्का", "Jupiter's aspect/conjunction on the Sun lightens the dosha")] : [];
          return { status: par.length ? "partial" : "present", detail: why.join("; ") + T("।", "."), parihara: par };
        },
        need: { present: T("पितृ-तर्पण/श्राद्ध आवश्यक; अमावस्या के उपाय नियमित करें। विशेष समस्या हो तो योग्य आचार्य से नारायण बलि/त्रिपिण्डी श्राद्ध।", "Pitru-tarpan/shraddha is needed; do the Amavasya remedies regularly. For serious problems, Narayan Bali/Tripindi Shraddha through a qualified acharya."), partial: T("अमावस्या पर तर्पण व दान पर्याप्त।", "Tarpan and charity on Amavasya are sufficient.") },
      },
      {
        id: "grahan", icon: "🌘", name: T("ग्रहण दोष", "Grahan Dosha"),
        what: T("सूर्य या चन्द्रमा के साथ राहु/केतु होने से जन्म-कुंडली में “ग्रहण” जैसी स्थिति — आत्मबल (सूर्य) या मन (चन्द्र) पर छाया।", "Rahu/Ketu with the Sun or Moon creates an “eclipse” in the birth chart — a shadow over the soul's strength (Sun) or the mind (Moon)."),
        rule: T("सूर्य या चन्द्रमा की राहु/केतु से युति।", "Conjunction of the Sun or Moon with Rahu/Ketu."), src: T("परम्परा (BPHS में सूर्य/चन्द्र-राहु युति के अशुभ फल)", "Tradition (BPHS describes adverse results of Sun/Moon–Rahu conjunction)"),
        effect: T("सूर्य-ग्रहण: पिता/सरकारी कार्य/आत्मविश्वास में बाधा। चन्द्र-ग्रहण: मानसिक अशान्ति, भय, माता की चिन्ता", "Solar: obstacles regarding father/government/confidence. Lunar: mental unrest, fears, concern for mother"),
        rem: [M("📿", "मंत्र", "Mantra", "सूर्य हेतु आदित्य हृदय स्तोत्र; चन्द्र हेतु “ॐ सोमाय नमः” 108 बार", "for the Sun, Aditya Hridayam; for the Moon, “Om Somaya Namah” 108 times"), M("🙏", "पूजा", "Puja", "ग्रहण-काल में जप-ध्यान; सोमवार शिव जलाभिषेक", "japa and meditation during eclipses; water abhisheka to Shiva on Mondays"), M("🎁", "दान", "Charity", "सूर्य: गेहूँ, गुड़, ताँबा (रविवार); चन्द्र: चावल, दूध, चाँदी (सोमवार)", "Sun: wheat, jaggery, copper (Sunday); Moon: rice, milk, silver (Monday)")],
        check(r) {
          const P = r.planets, why = [];
          for (const l of ["Sun", "Moon"]) for (const n of ["Rahu", "Ketu"]) if (P[l].sign === P[n].sign) why.push(`${G[l]}-${G[n]}`);
          return why.length ? { status: "present", detail: T(`${why.join(", ")} युति।`, `${why.join(", ")} conjunction.`) } : { status: "absent", detail: T("सूर्य-चन्द्र राहु/केतु से युत नहीं।", "Sun and Moon are not conjoined with Rahu/Ketu.") };
        },
        need: { present: T("नियमित मंत्र-जप और दान पर्याप्त; किसी बड़े अनुष्ठान की अनिवार्यता नहीं।", "Regular mantra-japa and charity are sufficient; no major ritual is mandatory.") },
      },
      {
        id: "guruchandal", icon: "⚖️", name: T("गुरु चाण्डाल दोष", "Guru Chandal Dosha"),
        what: T("गुरु ज्ञान-धर्म के और राहु भ्रम के कारक हैं; दोनों के साथ होने से विवेक पर छाया मानी जाती है।", "Jupiter signifies wisdom and dharma, Rahu confusion; together they are believed to cloud discernment."),
        rule: T("गुरु और राहु (कुछ मत में केतु भी) एक राशि में।", "Jupiter and Rahu (some include Ketu) in the same sign."), src: T("परम्परा (उत्तरकालीन)", "Tradition (later)"),
        effect: T("गलत सलाह/संगति से हानि, नैतिक दुविधा, शिक्षा व गुरु-सम्बन्ध में बाधा", "loss through wrong advice/company, moral dilemmas, obstacles in education and with teachers"),
        rem: [M("📿", "मंत्र", "Mantra", "“ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः” 108 बार; विष्णु सहस्रनाम", "“Om Graam Greem Graum Sah Gurave Namah” 108 times; Vishnu Sahasranama"), M("🙏", "व्रत", "Fast", "गुरुवार व्रत; गुरु, ब्राह्मण, वृद्धों का सम्मान", "Thursday fast; respect teachers, Brahmins and elders"), M("🎁", "दान", "Charity", "गुरुवार चना दाल, हल्दी, पीला वस्त्र", "chana dal, turmeric, yellow cloth on Thursday")],
        check(r) {
          const P = r.planets;
          const strongJ = ["own", "exalt"].includes(P.Jupiter.dignity.key);
          if (P.Jupiter.sign === P.Rahu.sign) return { status: strongJ ? "cancelled" : "present", detail: T(`गुरु-राहु युति (${RASHI[P.Jupiter.sign]})।`, `Jupiter–Rahu conjunction (${RASHI[P.Jupiter.sign]}).`), parihara: strongJ ? [T("गुरु स्वराशि/उच्च होने से बलवान — दोष क्षीण", "Jupiter is strong in its own/exaltation sign — the dosha weakens")] : [] };
          if (P.Jupiter.sign === P.Ketu.sign) return { status: "partial", detail: T("गुरु-केतु युति (कुछ आचार्य इसे भी गिनते हैं)।", "Jupiter–Ketu conjunction (some acharyas count this too).") };
          return { status: "absent", detail: T("गुरु राहु-केतु से युत नहीं।", "Jupiter is not with Rahu/Ketu.") };
        },
        need: { present: T("गुरुवार व्रत और विष्णु उपासना नियमित करें; निर्णयों में अनुभवी की सलाह लें।", "Keep Thursday fasts and Vishnu worship regularly; seek experienced advice for decisions."), partial: T("सामान्य गुरु-उपासना पर्याप्त।", "General Jupiter worship is enough."), cancelled: T("विशेष उपाय आवश्यक नहीं।", "No special remedy needed.") },
      },
      {
        id: "kemadruma", icon: "🌑", name: T("केमद्रुम दोष", "Kemadruma Dosha"),
        what: T("चन्द्रमा मन है; उसके दोनों ओर कोई ग्रह न हो तो चन्द्रमा “अकेला” — मन व धन में असहायता का योग।", "The Moon is the mind; with no planets on either side it is “alone” — a combination of helplessness in mind and wealth."),
        rule: T("चन्द्रमा से द्वितीय और द्वादश में कोई ग्रह नहीं (सूर्य, राहु, केतु नहीं गिने जाते) और चन्द्रमा के साथ भी कोई ग्रह नहीं।", "No planet in the 2nd or 12th from the Moon (Sun, Rahu, Ketu not counted) and none with the Moon."),
        src: T("बृहज्जातक — चन्द्रयोगाध्याय; फलदीपिका अ. 6; BPHS", "Brihat Jataka — lunar yogas chapter; Phaladeepika ch. 6; BPHS"),
        effect: T("मानसिक अकेलापन, अस्थिरता, आर्थिक संघर्ष, सहयोग की कमी", "loneliness of mind, instability, financial struggle, lack of support"),
        rem: [M("📿", "मंत्र", "Mantra", "“ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः” 108 बार", "“Om Shraam Shreem Shraum Sah Chandramase Namah” 108 times"), M("🙏", "पूजा / व्रत", "Puja / fast", "सोमवार व्रत, शिवलिंग पर कच्चा दूध-जल; पूर्णिमा को सत्यनारायण कथा", "Monday fast, raw milk and water on the Shivalinga; Satyanarayan katha on Purnima"), M("🎁", "दान", "Charity", "सोमवार चावल, दूध, श्वेत वस्त्र", "rice, milk, white cloth on Monday"), M("🌱", "जीवनशैली", "Lifestyle", "माता की सेवा व आशीर्वाद, ध्यान (meditation), चाँदी का पात्र/आभूषण", "serve mother and seek her blessings, meditation, use silver vessels/ornaments")],
        check(r) {
          const P = r.planets, c = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
          const fm = (p) => J.houseFrom(P.Moon.sign, P[p].sign);
          if (c.some((p) => [1, 2, 12].includes(fm(p)))) return { status: "absent", detail: T("चन्द्रमा के साथ या आगे-पीछे ग्रह हैं — केमद्रुम नहीं।", "There are planets with or around the Moon — no Kemadruma.") };
          const par = [];
          if (c.some((p) => [1, 4, 7, 10].includes(P[p].house))) par.push(T("लग्न से केन्द्र में ग्रह", "planets in kendras from the Lagna"));
          if (c.some((p) => [4, 7, 10].includes(fm(p)))) par.push(T("चन्द्रमा से केन्द्र में ग्रह", "planets in kendras from the Moon"));
          if (jupAspects(r, "Moon")) par.push(T("चन्द्रमा पर गुरु की दृष्टि", "Jupiter aspects the Moon"));
          return { status: par.length ? "cancelled" : "present", detail: T("चन्द्रमा से 2 और 12 भाव ग्रह-रहित।", "The 2nd and 12th from the Moon are empty."), parihara: par };
        },
        need: { present: T("चन्द्र-उपाय आवश्यक: सोमवार व्रत, शिव उपासना, माता की सेवा।", "Moon remedies are needed: Monday fast, Shiva worship, serving mother."), cancelled: T("केमद्रुम भंग — उपाय आवश्यक नहीं।", "Kemadruma is cancelled — no remedy needed.") },
      },
      {
        id: "gandmool", icon: "⭐", name: T("गण्डमूल नक्षत्र दोष", "Gandmool Nakshatra Dosha"),
        what: T("राशि और नक्षत्र की सन्धि वाले छह नक्षत्र (अश्विनी, आश्लेषा, मघा, ज्येष्ठा, मूल, रेवती) गण्डान्त/गण्डमूल कहलाते हैं; इनमें जन्म पर शान्ति का विधान है।", "The six nakshatras at the junction of sign and nakshatra (Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati) are called Gandanta/Gandmool; a shanti is prescribed for birth in them."),
        rule: T("जन्म का चन्द्रमा अश्विनी, आश्लेषा, मघा, ज्येष्ठा, मूल या रेवती नक्षत्र में।", "The birth Moon in Ashwini, Ashlesha, Magha, Jyeshtha, Mula or Revati."),
        src: T("मुहूर्त चिन्तामणि एवं जातक-परम्परा (गण्डान्त विचार); BPHS में गण्डान्त जन्म का उल्लेख", "Muhurta Chintamani and jataka tradition (gandanta); BPHS mentions gandanta births"),
        effect: T("परम्परा अनुसार माता-पिता या स्वयं के स्वास्थ्य पर प्रारम्भिक प्रभाव; चरण-भेद से फल अलग", "traditionally an early effect on the health of parents or self; results differ by pada"),
        rem: [M("🙏", "शान्ति", "Shanti", "जन्म के 27वें दिन (जब वही नक्षत्र पुनः आए) गण्डमूल शान्ति पूजा — 27 कुओं/तीर्थों का जल, 27 वृक्षों के पत्ते, नक्षत्र-देवता का पूजन (योग्य आचार्य से)", "Gandmool shanti puja on the 27th day after birth (when the same nakshatra returns) — water from 27 wells/tirthas, leaves of 27 trees, worship of the nakshatra deity (through a qualified acharya)"), M("📿", "मंत्र", "Mantra", "नक्षत्र स्वामी का मंत्र-जप; बुध (आश्लेषा/ज्येष्ठा/रेवती) अथवा केतु (अश्विनी/मघा/मूल)", "japa of the nakshatra lord's mantra; Mercury (Ashlesha/Jyeshtha/Revati) or Ketu (Ashwini/Magha/Mula)"), M("🎁", "दान", "Charity", "नक्षत्र-दिवस पर अन्न व वस्त्र दान", "donate grain and clothes on the nakshatra day")],
        check(r) {
          const nk = r.moonNk;
          if (!GANDMOOL.includes(nk.idx)) return { status: "absent", detail: T(`जन्म नक्षत्र ${nk.name} — गण्डमूल नहीं।`, `Birth nakshatra ${nk.name} — not Gandmool.`) };
          const sandhi = [0, 9, 18].includes(nk.idx) ? nk.pada === 1 : nk.pada === 4;
          return { status: sandhi ? "present" : "partial", detail: T(`जन्म नक्षत्र ${nk.name}, चरण ${nk.pada}${sandhi ? " — राशि-सन्धि वाला चरण (प्रबल)" : " — सन्धि से दूर का चरण (हल्का)"}।`, `Birth nakshatra ${nk.name}, pada ${nk.pada}${sandhi ? " — the pada at the sign junction (strong)" : " — a pada away from the junction (mild)"}.`) };
        },
        need: { present: T("गण्डमूल शान्ति पूजा आवश्यक (यदि बचपन में नहीं हुई हो तो किसी भी जन्म-नक्षत्र दिवस पर कराई जा सकती है)।", "Gandmool shanti puja is needed (if not done in childhood, it can be done on any birth-nakshatra day)."), partial: T("हल्का प्रभाव — नक्षत्र-दिवस पर दान और मंत्र-जप पर्याप्त।", "Mild effect — charity and mantra-japa on the nakshatra day are enough.") },
      },
      {
        id: "vish", icon: "🌧️", name: T("विष योग (चन्द्र-शनि)", "Vish Yoga (Moon–Saturn)"),
        what: T("मन (चन्द्र) पर शनि की ठण्डक/भार — उदासी और मानसिक दबाव।", "Saturn's coldness/weight on the mind (Moon) — sadness and mental pressure."), rule: T("चन्द्रमा और शनि एक राशि में।", "Moon and Saturn in the same sign."), src: T("परम्परा; सारावली में चन्द्र-शनि युति के अशुभ फल", "Tradition; Saravali gives adverse results for Moon–Saturn conjunction"),
        effect: T("मानसिक तनाव, उदासी, निराशा, माता के स्वास्थ्य की चिन्ता", "mental stress, sadness, despair, concern for mother's health"),
        rem: [M("📿", "मंत्र", "Mantra", "महामृत्युंजय मंत्र 108 बार; “ॐ नमः शिवाय”", "Mahamrityunjaya mantra 108 times; “Om Namah Shivaya”"), M("🙏", "पूजा", "Puja", "सोमवार शिव जलाभिषेक, शनिवार हनुमान चालीसा", "water abhisheka to Shiva on Monday, Hanuman Chalisa on Saturday"), M("🌱", "जीवनशैली", "Lifestyle", "ध्यान-प्राणायाम, अकेलेपन से बचें, माता की सेवा", "meditation and pranayama, avoid isolation, serve mother")],
        check(r) { const P = r.planets; const j = jupAspects(r, "Moon"); return P.Moon.sign === P.Saturn.sign ? { status: j ? "cancelled" : "present", detail: T(`चन्द्र-शनि युति (${RASHI[P.Moon.sign]})।`, `Moon–Saturn conjunction (${RASHI[P.Moon.sign]}).`), parihara: j ? [T("गुरु की दृष्टि से दोष हल्का", "Jupiter's aspect lightens the dosha")] : [] } : { status: "absent", detail: T("चन्द्र-शनि युति नहीं।", "No Moon–Saturn conjunction.") }; },
        need: { present: T("शिव उपासना व महामृत्युंजय जप उपयोगी; मानसिक स्वास्थ्य का ध्यान रखें।", "Shiva worship and Mahamrityunjaya japa help; take care of mental health."), cancelled: T("सामान्य शिव-उपासना पर्याप्त।", "General Shiva worship is enough.") },
      },
      {
        id: "angarak", icon: "⚡", name: T("अंगारक योग (मंगल-राहु)", "Angarak Yoga (Mars–Rahu)"),
        what: T("मंगल की आग और राहु का भ्रम — उग्रता, जल्दबाज़ी, दुर्घटना।", "Mars's fire and Rahu's confusion — aggression, haste, accidents."), rule: T("मंगल और राहु एक राशि में।", "Mars and Rahu in the same sign."), src: T("परम्परा", "Tradition"),
        effect: T("अत्यधिक क्रोध, विवाद, दुर्घटना/चोट का भय, जल्दबाज़ी में निर्णय", "excessive anger, disputes, fear of accidents/injury, hasty decisions"),
        rem: [M("🙏", "पूजा", "Puja", "मंगलवार सुन्दरकाण्ड, हनुमान जी को चोला", "Sundarkand on Tuesday, offer chola to Hanumanji"), M("🎁", "दान", "Charity", "मंगलवार लाल मसूर, रक्तदान", "red masoor dal on Tuesday, blood donation"), M("🌱", "जीवनशैली", "Lifestyle", "वाहन सावधानी से चलाएँ, क्रोध आने पर मौन, नियमित व्यायाम", "drive carefully, keep silent when angry, exercise regularly")],
        check(r) { const P = r.planets; return P.Mars.sign === P.Rahu.sign ? { status: "present", detail: T(`मंगल-राहु युति (${RASHI[P.Mars.sign]})।`, `Mars–Rahu conjunction (${RASHI[P.Mars.sign]}).`) } : { status: "absent", detail: T("मंगल-राहु युति नहीं।", "No Mars–Rahu conjunction.") }; },
        need: { present: T("हनुमान उपासना और क्रोध-नियंत्रण आवश्यक; वाहन सावधानी से चलाएँ।", "Hanuman worship and anger control are needed; drive carefully.") },
      },
      {
        id: "shrapit", icon: "⛓️", name: T("श्रापित योग (शनि-राहु)", "Shrapit Yoga (Saturn–Rahu)"),
        what: T("शनि (कर्म-फल) और राहु की युति — पूर्व कर्मों का भार, विलम्ब।", "Saturn (fruits of karma) with Rahu — the weight of past karma, delays."), rule: T("शनि और राहु एक राशि में।", "Saturn and Rahu in the same sign."), src: T("परम्परा (उत्तरकालीन)", "Tradition (later)"),
        effect: T("कार्यों में लगातार विलम्ब, मेहनत का फल देर से, पुराने कर्मों का भार", "repeated delays, late rewards for effort, the burden of old karma"),
        rem: [M("📿", "मंत्र", "Mantra", "महामृत्युंजय जप; “ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः”", "Mahamrityunjaya japa; “Om Praam Preem Praum Sah Shanaishcharaya Namah”"), M("🙏", "पूजा", "Puja", "शनिवार पीपल दीपक, शनि-राहु शान्ति पूजा", "lamp under the Peepal on Saturday, Shani–Rahu shanti puja"), M("🎁", "सेवा", "Service", "श्रमिकों, दिव्यांगों, वृद्धाश्रम में सेवा-दान", "service and charity to labourers, the disabled and old-age homes")],
        check(r) { const P = r.planets; return P.Saturn.sign === P.Rahu.sign ? { status: "present", detail: T(`शनि-राहु युति (${RASHI[P.Saturn.sign]})।`, `Saturn–Rahu conjunction (${RASHI[P.Saturn.sign]}).`) } : { status: "absent", detail: T("शनि-राहु युति नहीं।", "No Saturn–Rahu conjunction.") }; },
        need: { present: T("शनिवार सेवा-दान और महामृत्युंजय जप पर्याप्त; किसी डर की आवश्यकता नहीं।", "Saturday service/charity and Mahamrityunjaya japa are sufficient; there is no need for fear.") },
      },
      {
        id: "shakat", icon: "🛞", name: T("शकट योग", "Shakata Yoga"),
        what: T("गुरु चन्द्रमा से छठे, आठवें या बारहवें — भाग्य पहिये (शकट) की तरह ऊपर-नीचे।", "Jupiter in the 6th, 8th or 12th from the Moon — fortune moves up and down like a cart-wheel (shakata)."), rule: T("चन्द्रमा से 6, 8, 12 में गुरु; चन्द्रमा लग्न से केन्द्र में हो तो भंग।", "Jupiter in the 6th/8th/12th from the Moon; cancelled if the Moon is in a kendra from the Lagna."), src: T("फलदीपिका अ. 6; सारावली", "Phaladeepika ch. 6; Saravali"),
        effect: T("भाग्य में बार-बार उतार-चढ़ाव, किए गए कार्य का फल स्थिर न रहना", "repeated rise and fall of fortune, results of work not staying stable"),
        rem: [M("📿", "मंत्र", "Mantra", "“ॐ बृं बृहस्पतये नमः” 108 बार", "“Om Brim Brihaspataye Namah” 108 times"), M("🙏", "पूजा", "Puja", "गुरुवार केले के वृक्ष की पूजा; सोमवार शिव पूजन", "worship the banana tree on Thursday; Shiva puja on Monday"), M("🌱", "जीवनशैली", "Lifestyle", "धैर्य, बचत, और बड़े निर्णय शुभ मुहूर्त में", "patience, saving, and big decisions at an auspicious muhurta")],
        check(r) {
          const P = r.planets, j = J.houseFrom(P.Moon.sign, P.Jupiter.sign);
          if (![6, 8, 12].includes(j)) return { status: "absent", detail: T(`गुरु चन्द्रमा से ${ORD(j)} भाव में — शकट नहीं।`, `Jupiter is ${ORD(j)} from the Moon — no Shakata.`) };
          return [1, 4, 7, 10].includes(P.Moon.house) ? { status: "cancelled", detail: T(`गुरु चन्द्रमा से ${ORD(j)} में।`, `Jupiter is ${ORD(j)} from the Moon.`), parihara: [T("चन्द्रमा लग्न से केन्द्र में — शकट भंग", "The Moon is in a kendra from the Lagna — Shakata cancelled")] } : { status: "present", detail: T(`गुरु चन्द्रमा से ${ORD(j)} भाव में।`, `Jupiter is ${ORD(j)} from the Moon.`) };
        },
        need: { present: T("गुरु उपासना और धैर्य; बड़े निर्णय शुभ मुहूर्त में।", "Jupiter worship and patience; big decisions at an auspicious muhurta."), cancelled: T("उपाय आवश्यक नहीं।", "No remedy needed.") },
      },
      {
        id: "sadesati", icon: "🪐", name: T("शनि साढ़ेसाती / ढैय्या (वर्तमान गोचर)", "Shani Sade Sati / Dhaiya (current transit)"),
        what: T("गोचर में शनि जब जन्म-राशि से 12, 1, 2 में हो तो साढ़े सात वर्ष (साढ़ेसाती); 4 या 8 में हो तो ढाई वर्ष (ढैय्या)। यह जन्म-दोष नहीं, समय-विशेष का प्रभाव है।", "When transiting Saturn is in the 12th, 1st or 2nd from the natal Moon sign it is the seven-and-a-half-year Sade Sati; in the 4th or 8th it is the two-and-a-half-year Dhaiya. It is not a birth dosha but the effect of a period."),
        rule: T("आज के शनि की जन्म-चन्द्र राशि से स्थिति।", "Today's Saturn position counted from the natal Moon sign."), src: T("गोचर-फल परम्परा (फलदीपिका अ. 26 गोचराध्याय: चन्द्र से शनि का गोचर)", "Transit tradition (Phaladeepika ch. 26, Gochara: Saturn's transit from the Moon)"),
        effect: T("कार्य-बाधा, मानसिक दबाव, स्वास्थ्य/धन की परीक्षा; परिश्रमी व ईमानदार को अन्त में उत्तम फल", "obstacles in work, mental pressure, tests of health/wealth; in the end good results for the hard-working and honest"),
        rem: [M("📿", "मंत्र", "Mantra", "“ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः” 108 बार; दशरथ-कृत शनि स्तोत्र", "“Om Praam Preem Praum Sah Shanaishcharaya Namah” 108 times; Dasharatha's Shani Stotra"), M("🙏", "पूजा", "Puja", "शनिवार पीपल के नीचे सरसों तेल का दीपक; हनुमान चालीसा", "mustard-oil lamp under the Peepal on Saturday; Hanuman Chalisa"), M("🎁", "दान", "Charity", "शनिवार छाया-दान, काले तिल, उड़द, लोहा", "chhaya-daan, black sesame, urad and iron on Saturday"), M("🌱", "आचरण", "Conduct", "सत्य, ईमानदारी, सेवकों-श्रमिकों से सद्व्यवहार", "truthfulness, honesty, kindness to servants and workers")],
        check(r) {
          const t = r.transit;
          if (t.sadeSati) return { status: t.satFromMoon === 1 ? "present" : "partial", detail: t.sadeSati };
          if (t.dhaiya) return { status: "partial", detail: t.dhaiya };
          return { status: "absent", detail: T(`अभी शनि चन्द्र राशि से ${ORD(t.satFromMoon)} भाव में — साढ़ेसाती/ढैय्या नहीं।`, `Saturn is now ${ORD(t.satFromMoon)} from the Moon sign — no Sade Sati/Dhaiya.`) };
        },
        need: { present: T("शिखर चरण — शनि उपाय नियमित करें, बड़े जोखिम टालें।", "Peak phase — do Saturn remedies regularly and avoid big risks."), partial: T("सामान्य शनि उपाय (शनिवार दीपक, हनुमान चालीसा) पर्याप्त।", "General Saturn remedies (Saturday lamp, Hanuman Chalisa) are sufficient.") },
      },
    ];
  }

  function STATUS() {
    return {
      present: { label: T("दोष है", "Present"), cls: "present", icon: "❗" },
      partial: { label: T("आंशिक / हल्का", "Partial / mild"), cls: "partial", icon: "⚠️" },
      cancelled: { label: T("परिहार हो गया", "Cancelled (parihara)"), cls: "cancelled", icon: "🛡️" },
      absent: { label: T("दोष नहीं", "Not present"), cls: "absent", icon: "✅" },
    };
  }

  function doshaReport(r) {
    const S = STATUS();
    return DEFS().map((d) => {
      const c = d.check(r);
      const need = c.status === "absent" ? T("कोई उपाय आवश्यक नहीं।", "No remedy needed.") : (d.need[c.status] || d.need.present || d.need.partial || "");
      return { ...d, result: c, st: S[c.status], needText: need };
    });
  }

  root.YogDosh = { yogaCards, doshaReport, periods };
  if (typeof module !== "undefined") module.exports = root.YogDosh;
})(typeof window !== "undefined" ? window : globalThis);
