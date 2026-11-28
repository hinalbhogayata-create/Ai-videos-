/*
 * yogdosh.js — योग विवरण एवं दोष-परीक्षण
 * प्रत्येक योग: कैसे बनता है, शास्त्र-स्रोत, किन ग्रहों की दशा में फल देगा।
 * प्रत्येक दोष: क्या है, कैसे बनता है, स्रोत, इस कुंडली में स्थिति (है / आंशिक / परिहार / नहीं),
 *   परिहार के नियम, प्रभाव, उपाय कितना आवश्यक, और निवारण।
 */
(function (root) {
  "use strict";
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);
  const N = () => root.Nivaran;
  const SEVEN = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

  // ---------------- योग विवरण ----------------
  const YOGA_INFO = [
    ["गजकेसरी", "चन्द्रमा से केन्द्र (1, 4, 7, 10) में गुरु हो और गुरु नीच न हो।", "बृहत् पाराशर होरा शास्त्र (चन्द्रयोग प्रकरण); फलदीपिका अ. 6 (योगाध्याय)"],
    ["रुचक", "मंगल स्वराशि (मेष/वृश्चिक) या उच्च (मकर) में होकर लग्न से केन्द्र में।", "BPHS — पञ्चमहापुरुष योगाध्याय; फलदीपिका अ. 6"],
    ["भद्र", "बुध स्वराशि (मिथुन/कन्या) या उच्च (कन्या) में होकर लग्न से केन्द्र में।", "BPHS — पञ्चमहापुरुष योगाध्याय; फलदीपिका अ. 6"],
    ["हंस", "गुरु स्वराशि (धनु/मीन) या उच्च (कर्क) में होकर लग्न से केन्द्र में।", "BPHS — पञ्चमहापुरुष योगाध्याय; फलदीपिका अ. 6"],
    ["मालव्य", "शुक्र स्वराशि (वृषभ/तुला) या उच्च (मीन) में होकर लग्न से केन्द्र में।", "BPHS — पञ्चमहापुरुष योगाध्याय; फलदीपिका अ. 6"],
    ["शश", "शनि स्वराशि (मकर/कुम्भ) या उच्च (तुला) में होकर लग्न से केन्द्र में।", "BPHS — पञ्चमहापुरुष योगाध्याय; फलदीपिका अ. 6"],
    ["बुधादित्य", "सूर्य और बुध एक ही राशि में (बुध अस्त न हो तो पूर्ण फल)।", "फलदीपिका एवं प्रचलित परम्परा"],
    ["चन्द्र-मंगल", "चन्द्रमा और मंगल की युति।", "फलदीपिका अ. 6; सारावली (द्विग्रह योग)"],
    ["दुरुधरा", "चन्द्रमा से द्वितीय और द्वादश दोनों में ग्रह (सूर्य, राहु, केतु छोड़कर)।", "बृहज्जातक — चन्द्रयोगाध्याय; BPHS"],
    ["सुनफा", "चन्द्रमा से द्वितीय भाव में ग्रह (सूर्य, राहु, केतु छोड़कर)।", "बृहज्जातक — चन्द्रयोगाध्याय; BPHS"],
    ["अनफा", "चन्द्रमा से द्वादश भाव में ग्रह (सूर्य, राहु, केतु छोड़कर)।", "बृहज्जातक — चन्द्रयोगाध्याय; BPHS"],
    ["योगकारक", "एक ही ग्रह केन्द्र (4/7/10) और त्रिकोण (5/9) दोनों का स्वामी हो।", "BPHS — राजयोगाध्याय / योगकारक विचार"],
    ["राजयोग", "केन्द्र के स्वामी और त्रिकोण के स्वामी की युति या परस्पर राशि-परिवर्तन।", "BPHS — राजयोगाध्याय"],
    ["धन योग", "द्वितीय/एकादश के स्वामी का पंचम/नवम के स्वामी से सम्बन्ध।", "BPHS — धनयोगाध्याय"],
    ["हर्ष विपरीत राजयोग", "षष्ठेश 6, 8 या 12 भाव में।", "BPHS एवं उत्तरकालामृत (विपरीत राजयोग)"],
    ["सरल विपरीत राजयोग", "अष्टमेश 6, 8 या 12 भाव में।", "BPHS एवं उत्तरकालामृत (विपरीत राजयोग)"],
    ["विमल विपरीत राजयोग", "द्वादशेश 6, 8 या 12 भाव में।", "BPHS एवं उत्तरकालामृत (विपरीत राजयोग)"],
    ["अमला", "लग्न से दशम भाव में शुभ ग्रह (गुरु, शुक्र, बुध)।", "फलदीपिका अ. 6"],
    ["नीचभंग राजयोग", "नीच ग्रह की राशि का स्वामी या उसकी उच्च राशि का स्वामी लग्न/चन्द्र से केन्द्र में।", "फलदीपिका अ. 7; BPHS"],
    ["सरस्वती", "गुरु, शुक्र, बुध केन्द्र/त्रिकोण/द्वितीय में तथा गुरु बलवान।", "फलदीपिका अ. 6; जातक पारिजात"],
    ["लक्ष्मी", "भाग्येश केन्द्र/त्रिकोण में स्वराशि/उच्च तथा लग्नेश बलवान।", "BPHS"],
  ];
  const DOSHA_NAMES = ["केमद्रुम", "मांगलिक", "काल सर्प", "ग्रहण", "गुरु चाण्डाल", "शकट"];

  function planetsIn(text) {
    const G = J.GRAHA;
    return Object.keys(G).filter((p) => text.includes(G[p]));
  }
  function periods(r, planets, nowJd, tz, max = 3) {
    const fmt = (jd) => { const d = new Date((jd - 2440587.5) * 86400000 + tz * 60000); return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`; };
    const out = [];
    for (const md of r.dasha.list) {
      if (md.end < nowJd) continue;
      if (planets.includes(md.lord)) {
        out.push(`${J.GRAHA[md.lord]} महादशा (${fmt(Math.max(md.start, r.chart.jd))} – ${fmt(md.end)})${nowJd >= md.start && nowJd < md.end ? " ◀ अभी" : ""}`);
      } else {
        for (const ad of md.antar) if (ad.end > nowJd && planets.includes(ad.lord)) { out.push(`${J.GRAHA[md.lord]}-${J.GRAHA[ad.lord]} (${fmt(ad.start)} – ${fmt(ad.end)})${nowJd >= ad.start && nowJd < ad.end ? " ◀ अभी" : ""}`); break; }
      }
      if (out.length >= max) break;
    }
    return out;
  }

  function yogaCards(r, nowJd) {
    return r.yogas.filter((y) => y.good && !DOSHA_NAMES.some((d) => y.name.includes(d))).map((y) => {
      const info = YOGA_INFO.filter(([k]) => y.name.includes(k)).sort((a, b) => b[0].length - a[0].length)[0];
      let pl = planetsIn(y.name + " " + y.text).filter((p) => p !== "Rahu" && p !== "Ketu");
      if (y.name.startsWith("गजकेसरी")) pl = ["Jupiter", "Moon"];
      return { name: y.name, text: y.text, rule: info ? info[1] : "", src: info ? info[2] : "शास्त्रीय योग", when: periods(r, pl, nowJd, r.input.tzOffsetMin) };
    });
  }

  // ---------------- दोष ----------------
  const jupAspects = (r, p) => {
    const P = r.planets, h = J.houseFrom(P.Jupiter.sign, P[p].sign);
    return h === 1 || h === 5 || h === 7 || h === 9;
  };
  const KS_NAMES = ["अनन्त", "कुलिक", "वासुकि", "शंखपाल", "पद्म", "महापद्म", "तक्षक", "कर्कोटक", "शंखचूड़", "घातक", "विषधर", "शेषनाग"];
  const GANDMOOL = { 0: "अश्विनी", 8: "आश्लेषा", 9: "मघा", 17: "ज्येष्ठा", 18: "मूल", 26: "रेवती" };

  function DEFS() {
    const NV = N();
    const D = NV.DOSHA, C = NV.COMBO;
    const combo = (name) => C.find((c) => c.name.startsWith(name));
    return [
      {
        id: "mangal", name: "मांगलिक (कुज) दोष", icon: "🔥",
        what: "मंगल ऊर्जा, साहस और उग्रता का ग्रह है। विवाह-भाव से जुड़े स्थानों में मंगल होने पर दाम्पत्य में तनाव/उग्रता मानी जाती है — इसे कुज दोष या मांगलिक दोष कहते हैं।",
        rule: "लग्न, चन्द्र (और दक्षिण परम्परा में शुक्र) से 1, 2, 4, 7, 8, 12 भाव में मंगल।",
        shloka: "लग्ने व्यये च पाताले जामित्रे चाष्टमे कुजे। कन्या भर्तुर्विनाशाय भर्ता कन्याविनाशकः॥ (प्रचलित वचन — कुछ पाठों में “धने व्यये…” से द्वितीय भाव भी गिना जाता है)",
        src: "मुहूर्त-ग्रंथों की विवाह-प्रकरण परम्परा एवं प्रचलित वचन (BPHS में यह नाम नहीं, पर सप्तम-अष्टम मंगल का अशुभ फल वर्णित है)",
        effect: D["मांगलिक दोष"].effect, rem: D["मांगलिक दोष"].rem,
        check(r) {
          const P = r.planets, H = [1, 2, 4, 7, 8, 12];
          const fl = P.Mars.house, fm = J.houseFrom(P.Moon.sign, P.Mars.sign), fv = J.houseFrom(P.Venus.sign, P.Mars.sign);
          const from = [];
          if (H.includes(fl)) from.push(`लग्न से ${J.ORD(fl)}`);
          if (H.includes(fm)) from.push(`चन्द्र से ${J.ORD(fm)}`);
          if (H.includes(fv)) from.push(`शुक्र से ${J.ORD(fv)}`);
          if (!from.length) return { status: "absent", detail: `मंगल लग्न से ${J.ORD(fl)}, चन्द्र से ${J.ORD(fm)} भाव में — मांगलिक दोष नहीं।` };
          const par = [];
          if (["own", "exalt", "moola"].includes(P.Mars.dignity.key)) par.push(`मंगल ${P.Mars.dignity.label} (${J.RASHI[P.Mars.sign]}) में है`);
          if (jupAspects(r, "Mars")) par.push("मंगल पर गुरु की युति/दृष्टि है");
          if (P.Mars.sign === P.Moon.sign) par.push("मंगल चन्द्रमा के साथ है");
          const BH = { 2: [2, 5], 12: [1, 6], 4: [0, 7], 7: [3, 9], 8: [8, 11], 1: [0, 4, 3, 9] };
          if (H.includes(fl) && (BH[fl] || []).includes(P.Mars.sign)) par.push(`${J.ORD(fl)} भाव में ${J.RASHI[P.Mars.sign]} का मंगल (भाव-विशेष परिहार)`);
          const strong = H.includes(fl) && (H.includes(fm) || H.includes(fv));
          return { status: par.length ? "cancelled" : strong ? "present" : "partial", detail: `मंगल ${from.join(", ")} भाव में।`, parihara: par };
        },
        need: { present: "विवाह से पूर्व कुंडली मिलान अनिवार्य; मांगलिक जीवनसाथी सर्वोत्तम। मंगल-शान्ति उपाय आवश्यक।", partial: "आंशिक दोष — सामान्य मंगल उपाय (हनुमान उपासना) पर्याप्त; मिलान में ध्यान रखें।", cancelled: "परिहार होने से दोष का प्रभाव नगण्य — विशेष अनुष्ठान आवश्यक नहीं; फिर भी मिलान में उल्लेख करें।" },
      },
      {
        id: "kaalsarp", name: "काल सर्प दोष", icon: "🐍",
        what: "जब सातों ग्रह राहु और केतु के एक ही ओर आ जाते हैं, तो कुंडली राहु-केतु अक्ष में “घिरी” मानी जाती है। इससे जीवन में अचानक रुकावटें और उतार-चढ़ाव माने जाते हैं।",
        rule: "सूर्य से शनि तक सातों ग्रह राहु से केतु के बीच (या केतु से राहु के बीच) एक ही ओर। एक ग्रह बाहर हो तो आंशिक।",
        src: "उत्तरकालीन परम्परा — ध्यान दें: बृहत् पाराशर होरा शास्त्र, बृहज्जातक, फलदीपिका, सारावली या जातक पारिजात में “काल सर्प” का वर्णन नहीं मिलता। (सर्प योग अलग है — पाप ग्रह तीन केन्द्रों में)",
        effect: D["काल सर्प योग"].effect, rem: D["काल सर्प योग"].rem,
        check(r) {
          const P = r.planets, rahu = P.Rahu.lon;
          const d = SEVEN.map((p) => J.norm(P[p].lon - rahu));
          const a = d.filter((x) => x < 180).length;
          const type = `${KS_NAMES[P.Rahu.house - 1]} काल सर्प (राहु ${J.ORD(P.Rahu.house)} भाव में)`;
          if (a === 7 || a === 0) return { status: "present", detail: `सभी सात ग्रह राहु-केतु अक्ष के एक ओर — ${type}।` };
          if (a === 6 || a === 1) return { status: "partial", detail: `छह ग्रह एक ओर, एक ग्रह बाहर — आंशिक ${type}।` };
          return { status: "absent", detail: "ग्रह राहु-केतु अक्ष के दोनों ओर फैले हैं — काल सर्प दोष नहीं।" };
        },
        need: { present: "शास्त्रीय ग्रंथों में अनिवार्यता नहीं; परम्परा में शान्ति-पूजा कराई जाती है। महामृत्युंजय जप और शिव उपासना पर्याप्त व सुरक्षित उपाय।", partial: "आंशिक — केवल नियमित शिव उपासना पर्याप्त; किसी महँगे अनुष्ठान की आवश्यकता नहीं।" },
      },
      {
        id: "pitru", name: "पितृ दोष", icon: "🕯️",
        what: "सूर्य पिता/पूर्वजों का और नवम भाव पितृ-धर्म का कारक है। इन पर राहु-केतु का प्रभाव पितरों के ऋण/असन्तोष का संकेत माना जाता है।",
        rule: "सूर्य के साथ राहु/केतु; या नवम भाव में राहु; या नवमेश राहु/केतु के साथ।",
        src: "BPHS — पूर्वजन्म शाप/पितृ-शाप प्रकरण (सूर्य-राहु, नवम पीड़ा) एवं परम्परा",
        effect: combo("पितृ").effect, rem: combo("पितृ").rem,
        check(r) {
          const P = r.planets, why = [];
          for (const n of ["Rahu", "Ketu"]) if (P.Sun.sign === P[n].sign) why.push(`सूर्य-${J.GRAHA[n]} युति`);
          if (P.Rahu.house === 9) why.push("नवम भाव में राहु");
          const l9 = r.houses[8].lord;
          for (const n of ["Rahu", "Ketu"]) if (P[l9].sign === P[n].sign && l9 !== "Sun") why.push(`नवमेश ${J.GRAHA[l9]} के साथ ${J.GRAHA[n]}`);
          if (!why.length) return { status: "absent", detail: "सूर्य और नवम भाव राहु-केतु से मुक्त — पितृ दोष नहीं।" };
          const par = jupAspects(r, "Sun") ? ["सूर्य पर गुरु की दृष्टि/युति से दोष हल्का"] : [];
          return { status: par.length ? "partial" : "present", detail: why.join("; ") + "।", parihara: par };
        },
        need: { present: "पितृ-तर्पण/श्राद्ध आवश्यक; अमावस्या के उपाय नियमित करें। विशेष समस्या हो तो योग्य आचार्य से नारायण बलि/त्रिपिण्डी श्राद्ध।", partial: "अमावस्या पर तर्पण व दान पर्याप्त।" },
      },
      {
        id: "grahan", name: "ग्रहण दोष", icon: "🌘",
        what: "सूर्य या चन्द्रमा के साथ राहु/केतु होने से जन्म-कुंडली में “ग्रहण” जैसी स्थिति — आत्मबल (सूर्य) या मन (चन्द्र) पर छाया।",
        rule: "सूर्य या चन्द्रमा की राहु/केतु से युति।", src: "परम्परा (BPHS में सूर्य/चन्द्र-राहु युति के अशुभ फल)",
        effect: "सूर्य-ग्रहण: पिता/सरकारी कार्य/आत्मविश्वास में बाधा। चन्द्र-ग्रहण: मानसिक अशान्ति, भय, माता की चिन्ता।",
        rem: [["📿", "मंत्र", "सूर्य हेतु आदित्य हृदय स्तोत्र; चन्द्र हेतु “ॐ सोमाय नमः” 108 बार"], ["🙏", "पूजा", "ग्रहण-काल में जप-ध्यान; सोमवार शिव जलाभिषेक"], ["🎁", "दान", "सूर्य: गेहूँ, गुड़, ताँबा (रविवार); चन्द्र: चावल, दूध, चाँदी (सोमवार)"]],
        check(r) {
          const P = r.planets, why = [];
          for (const l of ["Sun", "Moon"]) for (const n of ["Rahu", "Ketu"]) if (P[l].sign === P[n].sign) why.push(`${J.GRAHA[l]}-${J.GRAHA[n]}`);
          return why.length ? { status: "present", detail: `${why.join(", ")} युति।` } : { status: "absent", detail: "सूर्य-चन्द्र राहु/केतु से युत नहीं।" };
        },
        need: { present: "नियमित मंत्र-जप और दान पर्याप्त; किसी बड़े अनुष्ठान की अनिवार्यता नहीं।" },
      },
      {
        id: "guruchandal", name: "गुरु चाण्डाल दोष", icon: "⚖️",
        what: "गुरु ज्ञान-धर्म के और राहु भ्रम के कारक हैं; दोनों के साथ होने से विवेक पर छाया मानी जाती है।",
        rule: "गुरु और राहु (कुछ मत में केतु भी) एक राशि में।", src: "परम्परा (उत्तरकालीन)",
        effect: D["गुरु चाण्डाल योग"].effect, rem: D["गुरु चाण्डाल योग"].rem,
        check(r) {
          const P = r.planets;
          if (P.Jupiter.sign === P.Rahu.sign) return { status: ["own", "exalt"].includes(P.Jupiter.dignity.key) ? "cancelled" : "present", detail: `गुरु-राहु युति (${J.RASHI[P.Jupiter.sign]})।`, parihara: ["own", "exalt"].includes(P.Jupiter.dignity.key) ? ["गुरु स्वराशि/उच्च होने से बलवान — दोष क्षीण"] : [] };
          if (P.Jupiter.sign === P.Ketu.sign) return { status: "partial", detail: "गुरु-केतु युति (कुछ आचार्य इसे भी गिनते हैं)।" };
          return { status: "absent", detail: "गुरु राहु-केतु से युत नहीं।" };
        },
        need: { present: "गुरुवार व्रत और विष्णु उपासना नियमित करें; निर्णयों में अनुभवी की सलाह लें।", partial: "सामान्य गुरु-उपासना पर्याप्त।", cancelled: "विशेष उपाय आवश्यक नहीं।" },
      },
      {
        id: "kemadruma", name: "केमद्रुम दोष", icon: "🌑",
        what: "चन्द्रमा मन है; उसके दोनों ओर कोई ग्रह न हो तो चन्द्रमा “अकेला” — मन व धन में असहायता का योग।",
        rule: "चन्द्रमा से द्वितीय और द्वादश में कोई ग्रह नहीं (सूर्य, राहु, केतु नहीं गिने जाते) और चन्द्रमा के साथ भी कोई ग्रह नहीं।",
        src: "बृहज्जातक — चन्द्रयोगाध्याय; फलदीपिका अ. 6; BPHS",
        effect: D["केमद्रुम योग"].effect, rem: D["केमद्रुम योग"].rem,
        check(r) {
          const P = r.planets, c = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
          const fm = (p) => J.houseFrom(P.Moon.sign, P[p].sign);
          if (c.some((p) => [1, 2, 12].includes(fm(p)))) return { status: "absent", detail: "चन्द्रमा के साथ या आगे-पीछे ग्रह हैं — केमद्रुम नहीं।" };
          const par = [];
          if (c.some((p) => [1, 4, 7, 10].includes(P[p].house))) par.push("लग्न से केन्द्र में ग्रह");
          if (c.some((p) => [4, 7, 10].includes(fm(p)))) par.push("चन्द्रमा से केन्द्र में ग्रह");
          if (jupAspects(r, "Moon")) par.push("चन्द्रमा पर गुरु की दृष्टि");
          return { status: par.length ? "cancelled" : "present", detail: "चन्द्रमा से 2 और 12 भाव ग्रह-रहित।", parihara: par };
        },
        need: { present: "चन्द्र-उपाय आवश्यक: सोमवार व्रत, शिव उपासना, माता की सेवा।", cancelled: "केमद्रुम भंग — उपाय आवश्यक नहीं।" },
      },
      {
        id: "gandmool", name: "गण्डमूल नक्षत्र दोष", icon: "⭐",
        what: "राशि और नक्षत्र की सन्धि वाले छह नक्षत्र (अश्विनी, आश्लेषा, मघा, ज्येष्ठा, मूल, रेवती) गण्डान्त/गण्डमूल कहलाते हैं; इनमें जन्म पर शान्ति का विधान है।",
        rule: "जन्म का चन्द्रमा अश्विनी, आश्लेषा, मघा, ज्येष्ठा, मूल या रेवती नक्षत्र में।",
        src: "मुहूर्त चिन्तामणि एवं जातक-परम्परा (गण्डान्त विचार); BPHS में गण्डान्त जन्म का उल्लेख",
        effect: "परम्परा अनुसार माता-पिता या स्वयं के स्वास्थ्य पर प्रारम्भिक प्रभाव; चरण-भेद से फल अलग।",
        rem: [["🙏", "शान्ति", "जन्म के 27वें दिन (जब वही नक्षत्र पुनः आए) गण्डमूल शान्ति पूजा — 27 कुओं/तीर्थों का जल, 27 वृक्षों के पत्ते, नक्षत्र-देवता का पूजन (योग्य आचार्य से)"], ["📿", "मंत्र", "नक्षत्र स्वामी का मंत्र-जप; बुध (आश्लेषा/ज्येष्ठा/रेवती) अथवा केतु (अश्विनी/मघा/मूल)"], ["🎁", "दान", "नक्षत्र-दिवस पर अन्न व वस्त्र दान"]],
        check(r) {
          const nk = r.moonNk;
          if (GANDMOOL[nk.idx] === undefined) return { status: "absent", detail: `जन्म नक्षत्र ${nk.name} — गण्डमूल नहीं।` };
          const sandhi = [0, 9, 18].includes(nk.idx) ? nk.pada === 1 : nk.pada === 4; // राशि-सन्धि वाला चरण
          return { status: sandhi ? "present" : "partial", detail: `जन्म नक्षत्र ${nk.name}, चरण ${nk.pada}${sandhi ? " — राशि-सन्धि वाला चरण (प्रबल)" : " — सन्धि से दूर का चरण (हल्का)"}।` };
        },
        need: { present: "गण्डमूल शान्ति पूजा आवश्यक (यदि बचपन में नहीं हुई हो तो किसी भी जन्म-नक्षत्र दिवस पर कराई जा सकती है)।", partial: "हल्का प्रभाव — नक्षत्र-दिवस पर दान और मंत्र-जप पर्याप्त।" },
      },
      {
        id: "vish", name: "विष योग (चन्द्र-शनि)", icon: "🌧️",
        what: "मन (चन्द्र) पर शनि की ठण्डक/भार — उदासी और मानसिक दबाव।", rule: "चन्द्रमा और शनि एक राशि में।", src: "परम्परा; सारावली में चन्द्र-शनि युति के अशुभ फल",
        effect: combo("विष").effect, rem: combo("विष").rem,
        check(r) { const P = r.planets; return P.Moon.sign === P.Saturn.sign ? { status: jupAspects(r, "Moon") ? "cancelled" : "present", detail: `चन्द्र-शनि युति (${J.RASHI[P.Moon.sign]})।`, parihara: jupAspects(r, "Moon") ? ["गुरु की दृष्टि से दोष हल्का"] : [] } : { status: "absent", detail: "चन्द्र-शनि युति नहीं।" }; },
        need: { present: "शिव उपासना व महामृत्युंजय जप उपयोगी; मानसिक स्वास्थ्य का ध्यान रखें।", cancelled: "सामान्य शिव-उपासना पर्याप्त।" },
      },
      {
        id: "angarak", name: "अंगारक योग (मंगल-राहु)", icon: "⚡",
        what: "मंगल की आग और राहु का भ्रम — उग्रता, जल्दबाज़ी, दुर्घटना।", rule: "मंगल और राहु एक राशि में।", src: "परम्परा",
        effect: combo("अंगारक").effect, rem: combo("अंगारक").rem,
        check(r) { const P = r.planets; return P.Mars.sign === P.Rahu.sign ? { status: "present", detail: `मंगल-राहु युति (${J.RASHI[P.Mars.sign]})।` } : { status: "absent", detail: "मंगल-राहु युति नहीं।" }; },
        need: { present: "हनुमान उपासना और क्रोध-नियंत्रण आवश्यक; वाहन सावधानी से चलाएँ।" },
      },
      {
        id: "shrapit", name: "श्रापित योग (शनि-राहु)", icon: "⛓️",
        what: "शनि (कर्म-फल) और राहु की युति — पूर्व कर्मों का भार, विलम्ब।", rule: "शनि और राहु एक राशि में।", src: "परम्परा (उत्तरकालीन)",
        effect: combo("श्रापित").effect, rem: combo("श्रापित").rem,
        check(r) { const P = r.planets; return P.Saturn.sign === P.Rahu.sign ? { status: "present", detail: `शनि-राहु युति (${J.RASHI[P.Saturn.sign]})।` } : { status: "absent", detail: "शनि-राहु युति नहीं।" }; },
        need: { present: "शनिवार सेवा-दान और महामृत्युंजय जप पर्याप्त; किसी डर की आवश्यकता नहीं।" },
      },
      {
        id: "shakat", name: "शकट योग", icon: "🛞",
        what: "गुरु चन्द्रमा से छठे, आठवें या बारहवें — भाग्य पहिये (शकट) की तरह ऊपर-नीचे।", rule: "चन्द्रमा से 6, 8, 12 में गुरु; चन्द्रमा लग्न से केन्द्र में हो तो भंग।", src: "फलदीपिका अ. 6; सारावली",
        effect: D["शकट योग"].effect, rem: D["शकट योग"].rem,
        check(r) {
          const P = r.planets, j = J.houseFrom(P.Moon.sign, P.Jupiter.sign);
          if (![6, 8, 12].includes(j)) return { status: "absent", detail: `गुरु चन्द्रमा से ${J.ORD(j)} भाव में — शकट नहीं।` };
          return [1, 4, 7, 10].includes(P.Moon.house) ? { status: "cancelled", detail: `गुरु चन्द्रमा से ${J.ORD(j)} में।`, parihara: ["चन्द्रमा लग्न से केन्द्र में — शकट भंग"] } : { status: "present", detail: `गुरु चन्द्रमा से ${J.ORD(j)} भाव में।` };
        },
        need: { present: "गुरु उपासना और धैर्य; बड़े निर्णय शुभ मुहूर्त में।", cancelled: "उपाय आवश्यक नहीं।" },
      },
      {
        id: "sadesati", name: "शनि साढ़ेसाती / ढैय्या (वर्तमान गोचर)", icon: "🪐",
        what: "गोचर में शनि जब जन्म-राशि से 12, 1, 2 में हो तो साढ़े सात वर्ष (साढ़ेसाती); 4 या 8 में हो तो ढाई वर्ष (ढैय्या)। यह जन्म-दोष नहीं, समय-विशेष का प्रभाव है।",
        rule: "आज के शनि की जन्म-चन्द्र राशि से स्थिति।", src: "गोचर-फल परम्परा (फलदीपिका अ. 26 गोचराध्याय: चन्द्र से शनि का गोचर)",
        effect: "कार्य-बाधा, मानसिक दबाव, स्वास्थ्य/धन की परीक्षा; परिश्रमी व ईमानदार को अन्त में उत्तम फल।",
        rem: [["📿", "मंत्र", "“ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः” 108 बार; दशरथ-कृत शनि स्तोत्र"], ["🙏", "पूजा", "शनिवार पीपल के नीचे सरसों तेल का दीपक; हनुमान चालीसा"], ["🎁", "दान", "शनिवार छाया-दान, काले तिल, उड़द, लोहा"], ["🌱", "आचरण", "सत्य, ईमानदारी, सेवकों-श्रमिकों से सद्व्यवहार"]],
        check(r) {
          const t = r.transit;
          if (t.sadeSati) return { status: t.satFromMoon === 1 ? "present" : "partial", detail: t.sadeSati };
          if (t.dhaiya) return { status: "partial", detail: t.dhaiya };
          return { status: "absent", detail: `अभी शनि चन्द्र राशि से ${J.ORD(t.satFromMoon)} भाव में — साढ़ेसाती/ढैय्या नहीं।` };
        },
        need: { present: "शिखर चरण — शनि उपाय नियमित करें, बड़े जोखिम टालें।", partial: "सामान्य शनि उपाय (शनिवार दीपक, हनुमान चालीसा) पर्याप्त।" },
      },
    ];
  }

  const STATUS = {
    present: { label: "दोष है", cls: "present", icon: "❗" },
    partial: { label: "आंशिक / हल्का", cls: "partial", icon: "⚠️" },
    cancelled: { label: "परिहार हो गया", cls: "cancelled", icon: "🛡️" },
    absent: { label: "दोष नहीं", cls: "absent", icon: "✅" },
  };

  function doshaReport(r) {
    return DEFS().map((d) => {
      const c = d.check(r);
      const need = c.status === "absent" ? "कोई उपाय आवश्यक नहीं।" : (d.need[c.status] || d.need.present || d.need.partial || "");
      return { ...d, result: c, st: STATUS[c.status], needText: need };
    });
  }

  root.YogDosh = { yogaCards, doshaReport, STATUS, periods };
  if (typeof module !== "undefined") module.exports = root.YogDosh;
})(typeof window !== "undefined" ? window : globalThis);
