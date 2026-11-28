/*
 * nivaran.js — दोषों के अतिरिक्त समस्याएँ एवं उनका निवारण (हिन्दी / English)
 * निर्बल ग्रह, कमज़ोर जीवन-क्षेत्र और कठिन दशा — प्रत्येक के लिए कारण, सम्भावित प्रभाव,
 * सावधानी का समय और शास्त्रीय उपाय (मंत्र, पूजा/व्रत, दान, जीवनशैली)।
 * (दोष — मांगलिक, काल सर्प, पितृ आदि — yogdosh.js में हैं।)
 * उपाय-आधार: BPHS ग्रह-शान्ति अध्याय (जप, दान, होम), पुराणोक्त स्तोत्र एवं लोक-परम्परा।
 */
(function (root) {
  "use strict";
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);
  const T = (hi, en) => (root.I18N && root.I18N.lang === "en" ? en : hi);
  const F = () => root.Phala;

  const KARAKA = () => ({
    Sun: T("पिता, सरकारी कार्य, आत्मविश्वास, मान-सम्मान; हृदय, नेत्र, हड्डियाँ", "father, government work, confidence, honour; heart, eyes, bones"),
    Moon: T("मन की शान्ति, माता, नींद, भावनाएँ; कफ, जल-तत्व के रोग", "peace of mind, mother, sleep, emotions; phlegm and watery ailments"),
    Mars: T("साहस, भाई, भूमि-सम्पत्ति, ऊर्जा; रक्त, चोट, क्रोध", "courage, siblings, land and property, energy; blood, injury, anger"),
    Mercury: T("बुद्धि, वाणी, व्यापार, शिक्षा; त्वचा, नसें, घबराहट", "intellect, speech, trade, education; skin, nerves, anxiety"),
    Jupiter: T("विद्या, संतान, धर्म, गुरु, धन-वृद्धि; यकृत, मोटापा, मधुमेह", "learning, children, dharma, teachers, growth of wealth; liver, obesity, diabetes"),
    Venus: T("विवाह, दाम्पत्य-सुख, वाहन, कला, सुख-सुविधा; मूत्र-प्रजनन तंत्र", "marriage, marital happiness, vehicles, arts, comforts; urinary/reproductive system"),
    Saturn: T("कर्म, धैर्य, स्थायित्व, आयु; विलम्ब, जोड़ों-हड्डियों का दर्द, थकान", "work, patience, stability, longevity; delays, joint/bone pain, fatigue"),
    Rahu: T("भ्रम, अचानक घटनाएँ, विदेश; अज्ञात भय, व्यसन, धोखा", "confusion, sudden events, foreign lands; unknown fears, addictions, deception"),
    Ketu: T("वैराग्य, अलगाव, अचानक परिवर्तन; अज्ञात रोग, चोट", "detachment, separation, sudden change; unknown ailments, injury"),
  });
  const DEITY = () => ({
    Sun: T("सूर्य देव को ताँबे के लोटे से जल-अर्घ्य (लाल पुष्प, रोली सहित), आदित्य हृदय स्तोत्र", "water arghya to the Sun from a copper pot (with red flowers and roli), Aditya Hridayam"),
    Moon: T("सोमवार को शिवलिंग पर दूध-जल अभिषेक, चन्द्रशेखर स्तोत्र", "milk-water abhisheka on the Shivalinga on Monday, Chandrashekhara Stotra"),
    Mars: T("मंगलवार हनुमान जी को सिन्दूर-चोला, सुन्दरकाण्ड / हनुमान चालीसा", "sindoor-chola to Hanumanji on Tuesday, Sundarkand / Hanuman Chalisa"),
    Mercury: T("बुधवार गणेश जी को दूर्वा, विष्णु सहस्रनाम", "durva grass to Ganeshji on Wednesday, Vishnu Sahasranama"),
    Jupiter: T("गुरुवार भगवान विष्णु/बृहस्पति पूजन, केले के वृक्ष में जल, गुरुजनों का आशीर्वाद", "worship of Vishnu/Brihaspati on Thursday, water to the banana tree, blessings of teachers"),
    Venus: T("शुक्रवार माँ लक्ष्मी पूजन, श्री सूक्त पाठ", "Lakshmi puja on Friday, recitation of Shri Suktam"),
    Saturn: T("शनिवार पीपल के नीचे सरसों तेल का दीपक, दशरथ-कृत शनि स्तोत्र, हनुमान उपासना", "mustard-oil lamp under the Peepal on Saturday, Dasharatha's Shani Stotra, Hanuman worship"),
    Rahu: T("शनिवार दुर्गा सप्तशती/दुर्गा कवच, भैरव उपासना", "Durga Saptashati/Durga Kavach on Saturday, Bhairava worship"),
    Ketu: T("गणेश उपासना, मंगलवार/शनिवार गणपति अथर्वशीर्ष", "Ganesha worship, Ganapati Atharvashirsha on Tuesday/Saturday"),
  });
  const DAY = () => ({ Sun: T("रविवार", "Sunday"), Moon: T("सोमवार", "Monday"), Mars: T("मंगलवार", "Tuesday"), Mercury: T("बुधवार", "Wednesday"), Jupiter: T("गुरुवार", "Thursday"), Venus: T("शुक्रवार", "Friday"), Saturn: T("शनिवार", "Saturday"), Rahu: T("शनिवार", "Saturday"), Ketu: T("मंगलवार", "Tuesday") });

  function planetRemedy(p) {
    const r = F().REMEDY[p];
    const m = r.mantra.match(/\((\d+)/);
    return [
      ["📿", T("मंत्र", "Mantra"), `${r.mantra.replace(/\s*\(.*\)/, "")} — ${T("प्रतिदिन 108 बार", "108 times daily")}${m ? T(` (शास्त्रोक्त कुल जप-संख्या ${m[1]})`, ` (prescribed total japa ${m[1]})`) : ""}`],
      ["🙏", T("पूजा / व्रत", "Puja / fast"), DEITY()[p]],
      ["🎁", T("दान", "Charity"), `${r.daan} — ${T(`${DAY()[p]} को सूर्यास्त से पहले`, `on ${DAY()[p]} before sunset`)}`],
    ];
  }

  const AREA = () => ({
    health: {
      effect: T("बार-बार अस्वस्थता, ऊर्जा व आत्मविश्वास में कमी, रोग-प्रतिरोधक क्षमता कमज़ोर", "frequent illness, low energy and confidence, weak immunity"), houses: [1],
      rem: [["📿", T("मंत्र", "Mantra"), T("महामृत्युंजय मंत्र — “ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥” प्रतिदिन 108 बार", "Mahamrityunjaya mantra — “Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat” 108 times daily")], ["🙏", T("पूजा", "Puja"), T("प्रातः सूर्य को अर्घ्य, आदित्य हृदय स्तोत्र; सोमवार शिव जलाभिषेक", "morning arghya to the Sun, Aditya Hridayam; water abhisheka to Shiva on Monday")], ["🌱", T("जीवनशैली", "Lifestyle"), T("सूर्योदय से पहले उठना, योग-प्राणायाम, सात्विक भोजन; वर्ष में एक बार पूर्ण स्वास्थ्य जाँच — ज्योतिषीय उपाय चिकित्सा का विकल्प नहीं", "rise before sunrise, yoga-pranayama, sattvic food; a full health check-up yearly — astrological remedies are not a substitute for medical care")]],
    },
    education: {
      effect: T("पढ़ाई में मन न लगना, परीक्षा में बाधा, विषय-परिवर्तन, एकाग्रता की कमी", "difficulty concentrating on studies, obstacles in exams, changes of subject"), houses: [4, 5],
      rem: [["📿", T("मंत्र", "Mantra"), T("“ॐ ऐं सरस्वत्यै नमः” — पढ़ाई से पहले 21 बार; बसन्त पंचमी पर सरस्वती पूजन", "“Om Aim Saraswatyai Namah” — 21 times before studying; Saraswati puja on Vasant Panchami")], ["🙏", T("पूजा", "Puja"), T("बुधवार गणेश जी को दूर्वा; गुरुवार गुरुजनों/शिक्षकों का आशीर्वाद", "durva to Ganeshji on Wednesday; blessings of teachers on Thursday")], ["🌱", T("जीवनशैली", "Lifestyle"), T("पढ़ते समय मुख पूर्व या उत्तर दिशा में; अध्ययन-कक्ष ईशान कोण में, व्यवस्थित और प्रकाशयुक्त", "face east or north while studying; a tidy, well-lit study room in the north-east")]],
    },
    wealth: {
      effect: T("आय में अस्थिरता, बचत न होना, अनावश्यक व्यय या ऋण", "unstable income, no savings, unnecessary expenses or debt"), houses: [2, 11],
      rem: [["📿", T("मंत्र", "Mantra"), T("“ॐ श्रीं महालक्ष्म्यै नमः” 108 बार; शुक्रवार श्री सूक्त का पाठ", "“Om Shreem Mahalakshmyai Namah” 108 times; Shri Suktam on Friday")], ["🙏", T("पूजा", "Puja"), T("शुक्रवार माँ लक्ष्मी को खीर/सफ़ेद मिठाई; दीपावली व अक्षय तृतीया पर कुबेर-लक्ष्मी पूजन", "kheer/white sweets to Lakshmi on Friday; Kubera-Lakshmi puja on Diwali and Akshaya Tritiya")], ["🎁", T("दान", "Charity"), T("आय का एक अंश (दशांश) धर्म-कार्य/ज़रूरतमन्दों में — शास्त्र में धन-शुद्धि का उपाय", "give a tenth of income to dharma/the needy — the scriptural purification of wealth")], ["🌱", T("जीवनशैली", "Lifestyle"), T("हर माह निश्चित बचत; बिना सोचे ऋण/जोखिम भरे निवेश से बचें", "fixed monthly saving; avoid hasty loans and risky investments")]],
    },
    career: {
      effect: T("नौकरी/व्यवसाय में अस्थिरता, पदोन्नति में विलम्ब, परिश्रम का पूरा फल न मिलना", "instability in job/business, delayed promotion, not getting full reward for effort"), houses: [10],
      rem: [["📿", T("मंत्र", "Mantra"), ""], ["🙏", T("पूजा", "Puja"), T("प्रतिदिन सूर्य अर्घ्य; शनिवार हनुमान चालीसा; नए कार्य का आरम्भ शुभ मुहूर्त में", "daily arghya to the Sun; Hanuman Chalisa on Saturday; begin new work at an auspicious muhurta")], ["🎁", T("दान", "Charity"), T("शनिवार श्रमिकों/ज़रूरतमन्दों को भोजन — कर्म-भाव को बल", "feed workers/the needy on Saturday — strengthens the house of karma")], ["🌱", T("जीवनशैली", "Lifestyle"), T("कार्यस्थल पर पूर्व/उत्तर मुख बैठें; अनुशासन और समय-पालन (शनि का प्रिय गुण)", "sit facing east/north at work; discipline and punctuality (qualities dear to Saturn)")]],
    },
    marriage: {
      effect: T("विवाह में विलम्ब, योग्य सम्बन्ध न मिलना, दाम्पत्य में मतभेद", "delay in marriage, not finding a suitable match, marital differences"), houses: [7],
      rem: [["📿", T("मंत्र", "Mantra"), T("कन्याओं हेतु कात्यायनी मंत्र — “कात्यायनि महामाये महायोगिन्यधीश्वरि। नन्दगोपसुतं देवि पतिं मे कुरु ते नमः॥”; पुरुषों हेतु “ॐ शुं शुक्राय नमः” 108 बार", "for girls the Katyayani mantra — “Katyayani Mahamaye Mahayoginyadhishvari, Nandagopasutam Devi Patim Me Kuru Te Namah”; for men “Om Shum Shukraya Namah” 108 times")], ["🙏", T("पूजा / व्रत", "Puja / fast"), T("सोमवार शिव-पार्वती पूजन (16 सोमवार व्रत), गुरुवार व्रत", "Shiva-Parvati puja on Monday (16 Mondays fast), Thursday fast")], ["🎁", T("दान", "Charity"), T("शुक्रवार सुहाग-सामग्री/श्वेत वस्त्र का दान; गुरुवार पीली वस्तुएँ", "donate suhag items/white cloth on Friday; yellow items on Thursday")], ["🌱", T("जीवनशैली", "Lifestyle"), T("विवाह से पहले कुंडली मिलान अवश्य; संवाद, धैर्य और एक-दूसरे के परिवार का सम्मान", "always match kundlis before marriage; communication, patience and respect for each other's family")]],
    },
    children: {
      effect: T("संतान-प्राप्ति में विलम्ब या संतान के स्वास्थ्य/शिक्षा की चिन्ता", "delay in having children or concern for their health/education"), houses: [5],
      rem: [["📿", T("मंत्र", "Mantra"), T("संतान गोपाल मंत्र — “ॐ देवकीसुत गोविन्द वासुदेव जगत्पते। देहि मे तनयं कृष्ण त्वामहं शरणं गतः॥” 108 बार", "Santan Gopal mantra — “Om Devakisuta Govinda Vasudeva Jagatpate, Dehi Me Tanayam Krishna Tvamaham Sharanam Gatah” 108 times")], ["🙏", T("पूजा / व्रत", "Puja / fast"), T("गुरुवार व्रत, बाल-गोपाल पूजन; हरिवंश पुराण का श्रवण", "Thursday fast, Bal-Gopal puja; listening to the Harivamsha Purana")], ["🌱", T("जीवनशैली", "Lifestyle"), T("चिकित्सकीय परामर्श के साथ उपाय करें; गौ-सेवा और बच्चों की सहायता शुभ", "do remedies alongside medical advice; serving cows and helping children is auspicious")]],
    },
    fortune: {
      effect: T("प्रयासों के बाद भी भाग्य का साथ कम, पिता/गुरु से मतभेद", "little support from fortune despite effort, differences with father/teacher"), houses: [9],
      rem: [["📿", T("मंत्र", "Mantra"), T("विष्णु सहस्रनाम पाठ (गुरुवार) या “ॐ नमो भगवते वासुदेवाय” 108 बार", "Vishnu Sahasranama (Thursday) or “Om Namo Bhagavate Vasudevaya” 108 times")], ["🙏", T("पूजा", "Puja"), T("पिता, गुरु और वृद्धों की सेवा व आशीर्वाद; वर्ष में एक तीर्थ-यात्रा", "serve and seek blessings of father, teachers and elders; one pilgrimage a year")], ["🎁", T("दान", "Charity"), T("गुरुवार चना दाल, हल्दी, धार्मिक पुस्तकों का दान", "chana dal, turmeric and religious books on Thursday")]],
    },
  });

  function upcomingPeriods(r, planets, nowJd, tzMin) {
    const out = [];
    for (const md of r.dasha.list) for (const ad of md.antar) {
      if (ad.end < nowJd || ad.start > nowJd + 12 * 365.25) continue;
      if (planets.includes(ad.lord) || (planets.includes(md.lord) && ad.lord === md.lord)) out.push({ md: md.lord, ad: ad.lord, start: ad.start, end: ad.end, now: nowJd >= ad.start && nowJd < ad.end });
    }
    const fmt = (jd) => { const d = new Date((jd - 2440587.5) * 86400000 + tzMin * 60000); return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`; };
    return out.slice(0, 3).map((x) => `${J.GRAHA[x.md]}-${J.GRAHA[x.ad]} (${fmt(x.start)} – ${fmt(x.end)})${x.now ? T(" ◀ अभी", " ◀ now") : ""}`);
  }

  function analyze(r, ctx) {
    const P = r.planets, G = J.GRAHA, ORD = J.ORD, list = [];
    const nowJd = ctx.nowJd, tz = r.input.tzOffsetMin;
    const add = (o) => { o.when = o.when || (o.planets ? upcomingPeriods(r, o.planets, nowJd, tz) : []); list.push(o); };
    const K = KARAKA();

    // 1. कठिन वर्तमान दशा
    if (ctx.cur && ctx.cur.ad) {
      const pr = ctx.periodRating(r, ctx.cur.md.lord, ctx.cur.ad.lord);
      if (pr.r <= 2) {
        const w = ctx.lordQuality(r, ctx.cur.ad.lord) <= ctx.lordQuality(r, ctx.cur.md.lord) ? ctx.cur.ad.lord : ctx.cur.md.lord;
        add({ sev: pr.r === 1 ? 3 : 2, icon: "⏳", title: T(`वर्तमान दशा: ${G[ctx.cur.md.lord]} महादशा – ${G[ctx.cur.ad.lord]} अन्तर्दशा (${pr.label})`, `Current dasha: ${G[ctx.cur.md.lord]} Mahadasha – ${G[ctx.cur.ad.lord]} Antardasha (${pr.label})`), cause: T(`${G[w]} ${ORD(P[w].house)} भाव में ${P[w].dignity.label} है — इस अवधि में उसके विषय प्रभावित।`, `${G[w]} is in the ${ORD(P[w].house)} house, ${P[w].dignity.label.toLowerCase()} — its matters are affected in this period.`), effect: T(`${K[w]} से जुड़े विषयों में सावधानी`, `care in matters of ${K[w]}`), rem: planetRemedy(w), planets: null, when: [T(`${ctx.fmtDate(ctx.cur.ad.end, tz)} तक`, `until ${ctx.fmtDate(ctx.cur.ad.end, tz)}`)] });
      }
    }
    // 2. निर्बल / पीड़ित ग्रह
    for (const p of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]) {
      const x = P[p], st = r.strength[p];
      const why = [];
      if (x.dignity.key === "debil") why.push(T("नीच राशि में", "debilitated"));
      if (x.combust) why.push(T("अस्त (सूर्य के निकट)", "combust (close to the Sun)"));
      if (x.dignity.key === "enemy") why.push(T("शत्रु राशि में", "in an enemy sign"));
      if ([6, 8, 12].includes(x.house)) why.push(T(`${ORD(x.house)} (दुःस्थान) भाव में`, `in the ${ORD(x.house)} house (a dusthana)`));
      const isNeech = x.dignity.key === "debil" && !r.yogas.some((y) => y.id === "neechabhanga" && y.planet === p);
      if (!(st < 38 || isNeech)) continue;
      const own = r.houses.filter((h) => h.lord === p).map((h) => h.h);
      add({ sev: st < 28 || isNeech ? 2 : 1, icon: "🪔", title: T(`निर्बल ${G[p]} (बल ${st}/100)`, `Weak ${G[p]} (strength ${st}/100)`), cause: T(`${G[p]} ${why.join(", ") || "कमज़ोर स्थिति में"}${own.length ? `; यह ${own.map(ORD).join(", ")} भाव का स्वामी है` : ""}।`, `${G[p]} is ${why.join(", ") || "weakly placed"}${own.length ? `; it lords the ${own.map(ORD).join(", ")} house(s)` : ""}.`), effect: `${K[p]}${own.length ? T(`; तथा ${own.map((h) => F().BHAVA[h - 1].k.split(",")[0]).join(", ")} के विषयों में बाधा`, `; and obstacles regarding ${own.map((h) => F().BHAVA[h - 1].k.split(",")[0]).join(", ")}`) : ""}`, rem: planetRemedy(p), planets: [p] });
    }
    // 3. कमज़ोर जीवन-क्षेत्र
    const AR = AREA();
    for (const a of ctx.areas) {
      const def = AR[a.id];
      if (!def || a.s >= 50) continue;
      const lords = [...new Set(def.houses.map((h) => r.houses[h - 1].lord))];
      const rem = def.rem.map((x) => x.slice());
      if (a.id === "career") rem[0][2] = T(`दशमेश ${G[lords[0]]}: ${F().REMEDY[lords[0]].mantra}; साथ में “ॐ घृणिः सूर्याय नमः” प्रातः 108 बार`, `10th lord ${G[lords[0]]}: ${F().REMEDY[lords[0]].mantra}; with “Om Ghrinih Suryaya Namah” 108 times in the morning`);
      add({ sev: a.s < 40 ? 2 : 1, icon: "📉", title: T(`${a.t} — ${a.s < 40 ? "संघर्षपूर्ण" : "कमज़ोर"} क्षेत्र`, `${a.t} — ${a.s < 40 ? "a difficult" : "a weak"} area`), cause: T(`${def.houses.map(ORD).join(" व ")} भाव तथा उसके स्वामी ${lords.map((l) => `${G[l]} (${ORD(P[l].house)} भाव, ${P[l].dignity.label})`).join(", ")} अपेक्षाकृत निर्बल।`, `The ${def.houses.map(ORD).join(" and ")} house(s) and lord(s) ${lords.map((l) => `${G[l]} (${ORD(P[l].house)} house, ${P[l].dignity.label.toLowerCase()})`).join(", ")} are relatively weak.`), effect: def.effect, rem, planets: lords });
    }
    list.sort((a, b) => b.sev - a.sev);
    return list;
  }

  const GENERAL = () => [
    ["🌅", T("प्रतिदिन प्रातः सूर्य को जल अर्पित करें और गायत्री मंत्र 11 बार जपें — सभी ग्रहों के लिए शुभ।", "Offer water to the Sun every morning and chant the Gayatri mantra 11 times — good for all planets.")],
    ["🙏", T("माता-पिता, गुरु और वृद्धों का आशीर्वाद — शास्त्रों में सबसे बड़ा ग्रह-शान्ति उपाय।", "The blessings of parents, teachers and elders — the greatest graha-shanti remedy in the scriptures.")],
    ["🐄", T("गौ, पक्षियों और ज़रूरतमन्दों को भोजन; अपनी आय का एक अंश दान।", "Feed cows, birds and the needy; give a portion of your income in charity.")],
    ["🕉️", T("अपने इष्टदेव/कुलदेवता की नियमित पूजा; घर में प्रतिदिन दीपक।", "Regular worship of your ishta-devata/kuladevata; light a lamp at home daily.")],
    ["⚠️", T("रत्न, विशेषकर नीलम/गोमेद/लहसुनिया, केवल योग्य ज्योतिषी की सलाह और परीक्षण के बाद ही धारण करें।", "Wear gemstones, especially Blue Sapphire/Hessonite/Cat's Eye, only after advice and a trial with a qualified astrologer.")],
  ];

  root.Nivaran = { analyze, planetRemedy, get GENERAL() { return GENERAL(); } };
  if (typeof module !== "undefined") module.exports = root.Nivaran;
})(typeof window !== "undefined" ? window : globalThis);
