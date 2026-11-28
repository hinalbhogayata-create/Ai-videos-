/*
 * prashna.js — प्रश्न कुंडली (होरारी): प्रश्न के क्षण की कुंडली से कार्य-सिद्धि का विचार
 * नियम-आधार:
 *  • षट्पञ्चाशिका (पृथुयशा) — शीर्षोदय/पृष्ठोदय लग्न, लग्न व केन्द्र में शुभ/पाप ग्रह
 *  • ताजिक नीलकण्ठी (प्रश्नतन्त्र) — लग्नेश-कार्येश का इत्थशाल / ईसराफ योग, दीप्तांश, समय-निर्धारण
 *  • प्रश्नमार्ग — चन्द्र बल, कार्य-भाव और उसके स्वामी का विचार
 */
(function (root) {
  "use strict";
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);
  const SEVEN = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const BEN = ["Jupiter", "Venus", "Mercury", "Moon"], MAL = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];

  const TOPICS = [
    { id: "vivah", label: "💍 विवाह / रिश्ता होगा या नहीं", h: 7, karaka: "Venus", sub: "विवाह/सम्बन्ध" },
    { id: "naukri", label: "💼 नौकरी / पदोन्नति / करियर", h: 10, karaka: "Sun", sub: "नौकरी/पद" },
    { id: "vyapar", label: "📈 व्यापार / धन-लाभ / सौदा", h: 11, karaka: "Jupiter", sub: "लाभ/सौदा" },
    { id: "rog", label: "🩺 रोग से मुक्ति / स्वास्थ्य", h: 1, karaka: "Sun", sub: "स्वास्थ्य-लाभ", disease: true },
    { id: "santan", label: "👶 संतान प्राप्ति", h: 5, karaka: "Jupiter", sub: "संतान" },
    { id: "pariksha", label: "📚 परीक्षा / शिक्षा / प्रवेश", h: 5, karaka: "Mercury", sub: "परीक्षा-सफलता" },
    { id: "yatra", label: "✈️ यात्रा / विदेश / वीज़ा", h: 9, karaka: "Moon", sub: "यात्रा", alt: 12 },
    { id: "sampatti", label: "🏠 मकान / भूमि / वाहन", h: 4, karaka: "Mars", sub: "सम्पत्ति" },
    { id: "mukadma", label: "⚖️ मुकदमा / विवाद में विजय", h: 7, karaka: "Mars", sub: "विवाद", lawsuit: true },
    { id: "vastu", label: "🔍 खोई वस्तु / धन वापसी", h: 2, karaka: "Moon", sub: "वस्तु/धन की प्राप्ति", lost: true },
    { id: "kary", label: "🙏 सामान्य कार्य / मनोकामना पूर्ण होगी?", h: 11, karaka: "Jupiter", sub: "मनोकामना" },
  ];

  // ताजिक दीप्तांश
  const DEEPTA = { Sun: 15, Moon: 12, Mars: 8, Mercury: 7, Jupiter: 9, Venus: 7, Saturn: 9 };
  const SPEED_ORDER = ["Moon", "Mercury", "Venus", "Sun", "Mars", "Jupiter", "Saturn"]; // तीव्र → मन्द
  const ASPECTS = [[0, "युति", "neutral"], [60, "षडष्टक-मित्र दृष्टि (60°)", "friend"], [90, "केन्द्र-शत्रु दृष्टि (90°)", "enemy"], [120, "त्रिकोण-मित्र दृष्टि (120°)", "friend"], [180, "प्रतियोग-शत्रु दृष्टि (180°)", "enemy"]];

  function tajikRelation(P, a, b) {
    if (a === b) return { type: "same" };
    const fast = SPEED_ORDER.indexOf(a) < SPEED_ORDER.indexOf(b) ? a : b, slow = fast === a ? b : a;
    const sep = Math.abs(J.norm(P[a].lon - P[b].lon + 180) - 180);
    const orb = (DEEPTA[a] + DEEPTA[b]) / 2;
    let best = null;
    for (const [ang, name, kind] of ASPECTS) {
      const d = Math.abs(sep - ang);
      if (d <= orb && (!best || d < best.d)) best = { ang, name, kind, d };
    }
    if (!best) return { type: "none", fast, slow };
    const fd = P[fast].deg, sd = P[slow].deg;
    const applying = P[fast].retro ? fd > sd : fd < sd; // तीव्र ग्रह कम अंशों पर → इत्थशाल
    return { type: applying ? "ithasala" : "easarapha", fast, slow, gap: Math.abs(sd - fd), ...best };
  }

  function judge(r, topic) {
    const P = r.planets, H = r.houses, L = r.lagnaSign;
    const lagnesh = H[0].lord;
    const kh = topic.h;
    const karyesh = H[kh - 1].lord;
    const F = [];
    let score = 0;
    const add = (pts, text, src) => { score += pts; F.push({ pts, text, src }); };
    const G = J.GRAHA, ORD = J.ORD;

    // 1. षट्पञ्चाशिका — लग्न का उदय
    const SHIRSHO = [2, 4, 5, 6, 7, 10], PRISHTHO = [0, 1, 3, 8, 9];
    if (SHIRSHO.includes(L)) add(2, `प्रश्न लग्न ${J.RASHI[L]} शीर्षोदय राशि है — कार्य सरलता से सिद्ध होने का संकेत।`, "षट्पञ्चाशिका");
    else if (PRISHTHO.includes(L)) add(-2, `प्रश्न लग्न ${J.RASHI[L]} पृष्ठोदय राशि है — कार्य में विलम्ब/बाधा।`, "षट्पञ्चाशिका");
    else add(0, `प्रश्न लग्न मीन (उभयोदय) — मिश्रित फल।`, "षट्पञ्चाशिका");

    // 2. लग्न व केन्द्र में शुभ/पाप ग्रह
    const inL = H[0].occupants;
    const benL = inL.filter((p) => BEN.includes(p)), malL = inL.filter((p) => MAL.includes(p));
    if (benL.length) add(2, `लग्न में शुभ ग्रह (${benL.map((p) => G[p]).join(", ")}) — प्रश्नकर्ता का पक्ष बलवान।`, "षट्पञ्चाशिका");
    if (malL.length) add(-2, `लग्न में पाप ग्रह (${malL.map((p) => G[p]).join(", ")}) — बाधा, चिन्ता।`, "षट्पञ्चाशिका");
    const benK = BEN.filter((p) => [4, 7, 10].includes(P[p].house) || [5, 9].includes(P[p].house));
    if (benK.length >= 2) add(1, `केन्द्र-त्रिकोण में शुभ ग्रह (${benK.map((p) => G[p]).join(", ")}) — शुभ।`, "षट्पञ्चाशिका / प्रश्नमार्ग");
    const malU = MAL.filter((p) => [3, 6, 11].includes(P[p].house));
    if (malU.length) add(1, `पाप ग्रह उपचय (3/6/11) में (${malU.map((p) => G[p]).join(", ")}) — विघ्नों पर विजय।`, "षट्पञ्चाशिका");
    const mal7 = H[6].occupants.filter((p) => MAL.includes(p));
    if (mal7.length && !topic.lawsuit) add(-1, `सप्तम में पाप ग्रह (${mal7.map((p) => G[p]).join(", ")}) — विरोध/अड़चन।`, "षट्पञ्चाशिका");

    // 3. लग्नेश व कार्येश की स्थिति
    const pos = (p) => {
      const h = P[p].house, dg = P[p].dignity.key;
      let v = [1, 4, 7, 10, 5, 9, 11].includes(h) ? 1 : [6, 8, 12].includes(h) ? -1.5 : 0;
      if (["exalt", "own", "moola"].includes(dg)) v += 1; if (dg === "debil") v -= 1;
      if (P[p].combust) v -= 1;
      return v;
    };
    const desc = (p) => `${G[p]} ${ORD(P[p].house)} भाव में ${P[p].dignity.label}${P[p].combust ? ", अस्त" : ""}${P[p].retro ? ", वक्री" : ""}`;
    const lv = pos(lagnesh);
    add(Math.round(lv * 10) / 10, `लग्नेश ${desc(lagnesh)} — ${lv > 0 ? "प्रश्नकर्ता सक्षम/प्रयत्नशील" : lv < 0 ? "प्रश्नकर्ता की स्थिति कमज़ोर" : "मध्यम"}।`, "ताजिक नीलकण्ठी");
    if (karyesh !== lagnesh) {
      const kv = pos(karyesh);
      add(Math.round(kv * 10) / 10, `कार्येश (${ORD(kh)} भाव — ${topic.sub} — का स्वामी) ${desc(karyesh)} — ${kv > 0 ? "कार्य का पक्ष बलवान" : kv < 0 ? "कार्य-पक्ष निर्बल" : "मध्यम"}।`, "ताजिक नीलकण्ठी / प्रश्नमार्ग");
      if (P[karyesh].retro) add(-1, `कार्येश वक्री — कार्य में दोबारा प्रयास/देरी, या बात लौटकर आएगी।`, "ताजिक नीलकण्ठी");
    }
    // कार्य-भाव में ग्रह
    const occ = H[kh - 1].occupants;
    const oBen = occ.filter((p) => BEN.includes(p)), oMal = occ.filter((p) => MAL.includes(p));
    if (oBen.length) add(1, `${ORD(kh)} भाव (कार्य-भाव) में शुभ ग्रह ${oBen.map((p) => G[p]).join(", ")}।`, "प्रश्नमार्ग");
    if (oMal.length && ![3, 6, 11].includes(kh)) add(-1, `${ORD(kh)} भाव (कार्य-भाव) में पाप ग्रह ${oMal.map((p) => G[p]).join(", ")}।`, "प्रश्नमार्ग");

    // 4. इत्थशाल / ईसराफ
    let timing = null;
    const rel = tajikRelation(P, lagnesh, karyesh);
    if (kh === 1) { /* स्वयं-विषयक प्रश्न: लग्न ही कार्य-भाव */ }
    else if (rel.type === "same") add(2, `लग्नेश और कार्येश एक ही ग्रह (${G[lagnesh]}) — कार्य प्रश्नकर्ता के अपने हाथ में; सिद्धि का योग।`, "ताजिक नीलकण्ठी");
    else if (rel.type === "ithasala") {
      add(rel.kind === "enemy" ? 2 : 3, `<b>इत्थशाल योग</b>: लग्नेश ${G[lagnesh]} और कार्येश ${G[karyesh]} में ${rel.name}, तीव्र ग्रह ${G[rel.fast]} मन्द ग्रह ${G[rel.slow]} की ओर बढ़ रहा है — ${rel.kind === "enemy" ? "कार्य सिद्ध होगा, परन्तु संघर्ष/प्रयास से" : "कार्य सहजता से सिद्ध होगा"}।`, "ताजिक नीलकण्ठी (षोडश योग)");
      timing = rel.gap;
    } else if (rel.type === "easarapha") add(-2, `<b>ईसराफ योग</b>: लग्नेश ${G[lagnesh]} और कार्येश ${G[karyesh]} का सम्बन्ध बिछड़ रहा है (${rel.name}) — अवसर निकल चुका या प्रयास अधूरा रहेगा।`, "ताजिक नीलकण्ठी (षोडश योग)");
    else {
      // चन्द्रमा द्वारा नक्त (मध्यस्थता)
      const m1 = tajikRelation(P, "Moon", lagnesh), m2 = tajikRelation(P, "Moon", karyesh);
      if (lagnesh !== "Moon" && karyesh !== "Moon" && (m1.type === "ithasala" || m1.type === "easarapha") && m2.type === "ithasala") {
        add(1, `लग्नेश-कार्येश में सीधा सम्बन्ध नहीं, परन्तु चन्द्रमा दोनों को जोड़ रहा है (नक्त योग) — किसी मध्यस्थ/तीसरे व्यक्ति की सहायता से कार्य।`, "ताजिक नीलकण्ठी");
        timing = m2.gap;
      } else add(-1, `लग्नेश ${G[lagnesh]} और कार्येश ${G[karyesh]} में कोई ताजिक दृष्टि-सम्बन्ध नहीं — कार्य के लिए अधिक प्रयास आवश्यक।`, "ताजिक नीलकण्ठी");
    }

    // 5. चन्द्र बल (प्रश्नमार्ग)
    const mh = P.Moon.house;
    const waxing = J.norm(P.Moon.lon - P.Sun.lon) < 180;
    if ([6, 8, 12].includes(mh)) add(-2, `चन्द्रमा ${ORD(mh)} भाव (दुःस्थान) में — मन में शंका, कार्य में हानि का भय।`, "प्रश्नमार्ग");
    else if ([1, 4, 7, 10, 5, 9, 11].includes(mh)) add(1, `चन्द्रमा ${ORD(mh)} भाव में — शुभ।`, "प्रश्नमार्ग");
    add(waxing ? 0.5 : -0.5, waxing ? "शुक्ल पक्ष का (बढ़ता) चन्द्रमा — बढ़ोत्तरी का संकेत।" : "कृष्ण पक्ष का (घटता) चन्द्रमा — फल में कमी।", "प्रश्नमार्ग");
    const mk = J.houseFrom(P.Moon.sign, (L + kh - 1) % 12);
    if (mk === 1 || [5, 9, 11].includes(mk)) add(0.5, `चन्द्रमा कार्य-भाव से शुभ सम्बन्ध में।`, "प्रश्नमार्ग");

    // 6. विशेष प्रश्न
    if (topic.lawsuit) {
      const l7 = H[6].lord;
      const a = r.strength[lagnesh], b = r.strength[l7];
      add(a > b + 5 ? 2 : a + 5 < b ? -2 : 0, `विवाद-प्रश्न: लग्नेश (आप) ${G[lagnesh]} बल ${a}, सप्तमेश (विरोधी) ${G[l7]} बल ${b} — ${a > b + 5 ? "आपका पक्ष बलवान, विजय सम्भव" : a + 5 < b ? "विरोधी पक्ष बलवान — समझौता हितकर" : "दोनों पक्ष समान — समझौते का योग"}।`, "ताजिक नीलकण्ठी (वाद-प्रश्न)");
    }
    if (topic.disease) {
      const l6 = H[5].lord;
      const a = r.strength[lagnesh], b = r.strength[l6];
      add(a > b ? 1.5 : -1.5, `रोग-प्रश्न: लग्नेश बल ${a}, रोगेश (षष्ठेश ${G[l6]}) बल ${b} — ${a > b ? "रोग पर विजय, स्वास्थ्य-लाभ" : "रोग अभी प्रबल — चिकित्सा में सावधानी"}।`, "प्रश्नमार्ग");
    }
    if (topic.lost) {
      const mov = P.Moon.sign % 3 === 0, fix = P.Moon.sign % 3 === 1;
      F.push({ pts: 0, text: `खोई वस्तु: चन्द्रमा ${J.RASHI[P.Moon.sign]} (${mov ? "चर — वस्तु दूर चली गई/स्थान बदला" : fix ? "स्थिर — वस्तु पास ही, घर/परिचित स्थान में" : "द्विस्वभाव — वस्तु पास के क्षेत्र में, खोज से मिल सकती है"})। चतुर्थ भाव ${J.RASHI[(L + 3) % 12]} — उस दिशा/स्थान में खोजें।`, src: "षट्पञ्चाशिका (नष्ट-प्रश्न)" });
    }
    // कारक
    const kr = topic.karaka;
    if (r.strength[kr] >= 60) add(0.5, `कारक ग्रह ${G[kr]} बलवान (${r.strength[kr]})।`, "प्रश्नमार्ग");
    else if (r.strength[kr] < 35) add(-0.5, `कारक ग्रह ${G[kr]} निर्बल (${r.strength[kr]})।`, "प्रश्नमार्ग");

    // निर्णय
    let verdict;
    if (score >= 4) verdict = { k: 4, label: "कार्य सिद्ध होगा", sub: "प्रबल योग — प्रयास करें, सफलता के अच्छे संकेत", color: "#2f7d4a" };
    else if (score >= 1.5) verdict = { k: 3, label: "प्रयास से कार्य सिद्ध", sub: "सम्भावना अच्छी, परन्तु कुछ विलम्ब/मेहनत", color: "#67993a" };
    else if (score >= -1) verdict = { k: 2, label: "अनिश्चित — विलम्ब सम्भव", sub: "मिश्रित संकेत; उपाय करके और उचित समय पर पुनः प्रयास", color: "#b8860b" };
    else verdict = { k: 1, label: "अभी कार्य-सिद्धि कठिन", sub: "वर्तमान समय अनुकूल नहीं; रुकें, उपाय करें", color: "#b3261e" };

    // समय
    const signType = (s) => (s % 3 === 0 ? "चर" : s % 3 === 1 ? "स्थिर" : "द्विस्वभाव");
    const st = signType(P[karyesh].sign);
    const unit = st === "चर" ? "दिन" : st === "स्थिर" ? "माह" : "सप्ताह";
    let when = verdict.k >= 3
      ? `कार्येश ${G[karyesh]} ${st} राशि (${J.RASHI[P[karyesh].sign]}) में — फल ${st === "चर" ? "शीघ्र" : st === "स्थिर" ? "देर से (परन्तु स्थायी)" : "मध्यम समय में"} मिलेगा।`
      : `कार्येश ${G[karyesh]} ${st} राशि (${J.RASHI[P[karyesh].sign]}) में — ${st === "चर" ? "परिस्थिति शीघ्र बदल सकती है; कुछ दिनों बाद उपाय सहित पुनः प्रयास करें" : st === "स्थिर" ? "स्थिति लम्बे समय तक बनी रह सकती है; धैर्य रखें और विकल्प भी देखें" : "कुछ सप्ताह बाद स्थिति में परिवर्तन सम्भव"}।`;
    if (timing != null && verdict.k >= 3) when += ` ताजिक नियम (इत्थशाल के अंश-अन्तर ≈ ${timing.toFixed(1)}°) से लगभग <b>${Math.max(1, Math.round(timing))} ${unit}</b> में।`;

    return { lagnesh, karyesh, kh, score: Math.round(score * 10) / 10, factors: F, verdict, when };
  }

  root.Prashna = { TOPICS, judge, tajikRelation };
  if (typeof module !== "undefined") module.exports = root.Prashna;
})(typeof window !== "undefined" ? window : globalThis);
