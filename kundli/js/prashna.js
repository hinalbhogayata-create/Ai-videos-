/*
 * prashna.js — प्रश्न कुंडली (होरारी): प्रश्न के क्षण की कुंडली से कार्य-सिद्धि का विचार (हिन्दी / English)
 * नियम-आधार:
 *  • षट्पञ्चाशिका (पृथुयशा) — शीर्षोदय/पृष्ठोदय लग्न, लग्न व केन्द्र में शुभ/पाप ग्रह
 *  • ताजिक नीलकण्ठी (प्रश्नतन्त्र) — लग्नेश-कार्येश का इत्थशाल / ईसराफ योग, दीप्तांश, समय-निर्धारण
 *  • प्रश्नमार्ग — चन्द्र बल, कार्य-भाव और उसके स्वामी का विचार
 */
(function (root) {
  "use strict";
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);
  const T = (hi, en) => (root.I18N && root.I18N.lang === "en" ? en : hi);
  const BEN = ["Jupiter", "Venus", "Mercury", "Moon"], MAL = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];

  const TOPICS = () => [
    { id: "vivah", label: T("💍 विवाह / रिश्ता होगा या नहीं", "💍 Will the marriage/relationship happen?"), h: 7, karaka: "Venus", sub: T("विवाह/सम्बन्ध", "marriage/relationship") },
    { id: "naukri", label: T("💼 नौकरी / पदोन्नति / करियर", "💼 Job / promotion / career"), h: 10, karaka: "Sun", sub: T("नौकरी/पद", "job/position") },
    { id: "vyapar", label: T("📈 व्यापार / धन-लाभ / सौदा", "📈 Business / gain / deal"), h: 11, karaka: "Jupiter", sub: T("लाभ/सौदा", "gain/deal") },
    { id: "rog", label: T("🩺 रोग से मुक्ति / स्वास्थ्य", "🩺 Recovery / health"), h: 1, karaka: "Sun", sub: T("स्वास्थ्य-लाभ", "recovery"), disease: true },
    { id: "santan", label: T("👶 संतान प्राप्ति", "👶 Children"), h: 5, karaka: "Jupiter", sub: T("संतान", "children") },
    { id: "pariksha", label: T("📚 परीक्षा / शिक्षा / प्रवेश", "📚 Exam / education / admission"), h: 5, karaka: "Mercury", sub: T("परीक्षा-सफलता", "exam success") },
    { id: "yatra", label: T("✈️ यात्रा / विदेश / वीज़ा", "✈️ Travel / abroad / visa"), h: 9, karaka: "Moon", sub: T("यात्रा", "travel") },
    { id: "sampatti", label: T("🏠 मकान / भूमि / वाहन", "🏠 House / land / vehicle"), h: 4, karaka: "Mars", sub: T("सम्पत्ति", "property") },
    { id: "mukadma", label: T("⚖️ मुकदमा / विवाद में विजय", "⚖️ Lawsuit / winning a dispute"), h: 7, karaka: "Mars", sub: T("विवाद", "dispute"), lawsuit: true },
    { id: "vastu", label: T("🔍 खोई वस्तु / धन वापसी", "🔍 Lost item / money recovery"), h: 2, karaka: "Moon", sub: T("वस्तु/धन की प्राप्ति", "recovery of item/money"), lost: true },
    { id: "kary", label: T("🙏 सामान्य कार्य / मनोकामना पूर्ण होगी?", "🙏 Will my wish / work succeed?"), h: 11, karaka: "Jupiter", sub: T("मनोकामना", "wish") },
  ];

  // ताजिक दीप्तांश
  const DEEPTA = { Sun: 15, Moon: 12, Mars: 8, Mercury: 7, Jupiter: 9, Venus: 7, Saturn: 9 };
  const SPEED_ORDER = ["Moon", "Mercury", "Venus", "Sun", "Mars", "Jupiter", "Saturn"]; // तीव्र → मन्द
  const ASPECTS = () => [[0, T("युति", "conjunction"), "neutral"], [60, T("षडष्टक-मित्र दृष्टि (60°)", "friendly sextile (60°)"), "friend"], [90, T("केन्द्र-शत्रु दृष्टि (90°)", "inimical square (90°)"), "enemy"], [120, T("त्रिकोण-मित्र दृष्टि (120°)", "friendly trine (120°)"), "friend"], [180, T("प्रतियोग-शत्रु दृष्टि (180°)", "inimical opposition (180°)"), "enemy"]];

  function tajikRelation(P, a, b) {
    if (a === b) return { type: "same" };
    const fast = SPEED_ORDER.indexOf(a) < SPEED_ORDER.indexOf(b) ? a : b, slow = fast === a ? b : a;
    const sep = Math.abs(J.norm(P[a].lon - P[b].lon + 180) - 180);
    const orb = (DEEPTA[a] + DEEPTA[b]) / 2;
    let best = null;
    for (const [ang, name, kind] of ASPECTS()) {
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
    const lagnesh = H[0].lord, kh = topic.h, karyesh = H[kh - 1].lord;
    const F = [];
    let score = 0;
    const add = (pts, text, src) => { score += pts; F.push({ pts, text, src }); };
    const G = J.GRAHA, ORD = J.ORD, R = J.RASHI;
    const names = (a) => a.map((p) => G[p]).join(", ");
    const S56 = T("षट्पञ्चाशिका", "Shatpanchashika"), TN = T("ताजिक नीलकण्ठी", "Tajika Neelakanthi"), PM = T("प्रश्नमार्ग", "Prashna Marga");

    // 1. षट्पञ्चाशिका — लग्न का उदय
    if ([2, 4, 5, 6, 7, 10].includes(L)) add(2, T(`प्रश्न लग्न ${R[L]} शीर्षोदय राशि है — कार्य सरलता से सिद्ध होने का संकेत।`, `The Prashna Lagna ${R[L]} is a shirshodaya (head-rising) sign — the matter should succeed easily.`), S56);
    else if ([0, 1, 3, 8, 9].includes(L)) add(-2, T(`प्रश्न लग्न ${R[L]} पृष्ठोदय राशि है — कार्य में विलम्ब/बाधा।`, `The Prashna Lagna ${R[L]} is a prishthodaya (back-rising) sign — delay/obstacles.`), S56);
    else add(0, T("प्रश्न लग्न मीन (उभयोदय) — मिश्रित फल।", "The Prashna Lagna is Pisces (ubhayodaya) — mixed results."), S56);

    // 2. लग्न व केन्द्र में शुभ/पाप ग्रह
    const inL = H[0].occupants;
    const benL = inL.filter((p) => BEN.includes(p)), malL = inL.filter((p) => MAL.includes(p));
    if (benL.length) add(2, T(`लग्न में शुभ ग्रह (${names(benL)}) — प्रश्नकर्ता का पक्ष बलवान।`, `Benefic(s) in the Lagna (${names(benL)}) — the querent's side is strong.`), S56);
    if (malL.length) add(-2, T(`लग्न में पाप ग्रह (${names(malL)}) — बाधा, चिन्ता।`, `Malefic(s) in the Lagna (${names(malL)}) — obstacles and worry.`), S56);
    const benK = BEN.filter((p) => [4, 7, 10, 5, 9].includes(P[p].house));
    if (benK.length >= 2) add(1, T(`केन्द्र-त्रिकोण में शुभ ग्रह (${names(benK)}) — शुभ।`, `Benefics in kendras/trikonas (${names(benK)}) — favourable.`), `${S56} / ${PM}`);
    const malU = MAL.filter((p) => [3, 6, 11].includes(P[p].house));
    if (malU.length) add(1, T(`पाप ग्रह उपचय (3/6/11) में (${names(malU)}) — विघ्नों पर विजय।`, `Malefics in upachaya (3/6/11) (${names(malU)}) — victory over obstacles.`), S56);
    const mal7 = H[6].occupants.filter((p) => MAL.includes(p));
    if (mal7.length && !topic.lawsuit) add(-1, T(`सप्तम में पाप ग्रह (${names(mal7)}) — विरोध/अड़चन।`, `Malefic(s) in the 7th (${names(mal7)}) — opposition/hurdles.`), S56);

    // 3. लग्नेश व कार्येश की स्थिति
    const pos = (p) => {
      const h = P[p].house, dg = P[p].dignity.key;
      let v = [1, 4, 7, 10, 5, 9, 11].includes(h) ? 1 : [6, 8, 12].includes(h) ? -1.5 : 0;
      if (["exalt", "own", "moola"].includes(dg)) v += 1; if (dg === "debil") v -= 1;
      if (P[p].combust) v -= 1;
      return v;
    };
    const desc = (p) => T(`${G[p]} ${ORD(P[p].house)} भाव में ${P[p].dignity.label}${P[p].combust ? ", अस्त" : ""}${P[p].retro ? ", वक्री" : ""}`, `${G[p]} in the ${ORD(P[p].house)} house, ${P[p].dignity.label.toLowerCase()}${P[p].combust ? ", combust" : ""}${P[p].retro ? ", retrograde" : ""}`);
    const lv = pos(lagnesh);
    add(Math.round(lv * 10) / 10, T(`लग्नेश ${desc(lagnesh)} — ${lv > 0 ? "प्रश्नकर्ता सक्षम/प्रयत्नशील" : lv < 0 ? "प्रश्नकर्ता की स्थिति कमज़ोर" : "मध्यम"}।`, `Lagna lord: ${desc(lagnesh)} — ${lv > 0 ? "the querent is capable and striving" : lv < 0 ? "the querent's position is weak" : "moderate"}.`), TN);
    if (karyesh !== lagnesh) {
      const kv = pos(karyesh);
      add(Math.round(kv * 10) / 10, T(`कार्येश (${ORD(kh)} भाव — ${topic.sub} — का स्वामी) ${desc(karyesh)} — ${kv > 0 ? "कार्य का पक्ष बलवान" : kv < 0 ? "कार्य-पक्ष निर्बल" : "मध्यम"}।`, `Karyesh (lord of the ${ORD(kh)} house — ${topic.sub}): ${desc(karyesh)} — ${kv > 0 ? "the matter's side is strong" : kv < 0 ? "the matter's side is weak" : "moderate"}.`), `${TN} / ${PM}`);
      if (P[karyesh].retro) add(-1, T("कार्येश वक्री — कार्य में दोबारा प्रयास/देरी, या बात लौटकर आएगी।", "The karyesh is retrograde — repeated attempts/delay, or the matter will come back."), TN);
    }
    const occ = H[kh - 1].occupants;
    const oBen = occ.filter((p) => BEN.includes(p)), oMal = occ.filter((p) => MAL.includes(p));
    if (oBen.length) add(1, T(`${ORD(kh)} भाव (कार्य-भाव) में शुभ ग्रह ${names(oBen)}।`, `Benefic(s) ${names(oBen)} in the ${ORD(kh)} house (house of the matter).`), PM);
    if (oMal.length && ![3, 6, 11].includes(kh)) add(-1, T(`${ORD(kh)} भाव (कार्य-भाव) में पाप ग्रह ${names(oMal)}।`, `Malefic(s) ${names(oMal)} in the ${ORD(kh)} house (house of the matter).`), PM);

    // 4. इत्थशाल / ईसराफ
    let timing = null;
    const rel = tajikRelation(P, lagnesh, karyesh);
    const SY = T("ताजिक नीलकण्ठी (षोडश योग)", "Tajika Neelakanthi (sixteen yogas)");
    if (kh === 1) { /* स्वयं-विषयक प्रश्न: लग्न ही कार्य-भाव */ }
    else if (rel.type === "same") add(2, T(`लग्नेश और कार्येश एक ही ग्रह (${G[lagnesh]}) — कार्य प्रश्नकर्ता के अपने हाथ में; सिद्धि का योग।`, `The Lagna lord and karyesh are the same planet (${G[lagnesh]}) — the matter is in the querent's own hands; success is indicated.`), TN);
    else if (rel.type === "ithasala") {
      add(rel.kind === "enemy" ? 2 : 3, T(`<b>इत्थशाल योग</b>: लग्नेश ${G[lagnesh]} और कार्येश ${G[karyesh]} में ${rel.name}, तीव्र ग्रह ${G[rel.fast]} मन्द ग्रह ${G[rel.slow]} की ओर बढ़ रहा है — ${rel.kind === "enemy" ? "कार्य सिद्ध होगा, परन्तु संघर्ष/प्रयास से" : "कार्य सहजता से सिद्ध होगा"}।`, `<b>Ithasala yoga</b>: ${rel.name} between the Lagna lord ${G[lagnesh]} and the karyesh ${G[karyesh]}, the faster ${G[rel.fast]} applying to the slower ${G[rel.slow]} — ${rel.kind === "enemy" ? "the matter will succeed, but with struggle/effort" : "the matter will succeed smoothly"}.`), SY);
      timing = rel.gap;
    } else if (rel.type === "easarapha") add(-2, T(`<b>ईसराफ योग</b>: लग्नेश ${G[lagnesh]} और कार्येश ${G[karyesh]} का सम्बन्ध बिछड़ रहा है (${rel.name}) — अवसर निकल चुका या प्रयास अधूरा रहेगा।`, `<b>Easarapha yoga</b>: the Lagna lord ${G[lagnesh]} and karyesh ${G[karyesh]} are separating (${rel.name}) — the opportunity has passed or the effort will stay incomplete.`), SY);
    else {
      const m1 = tajikRelation(P, "Moon", lagnesh), m2 = tajikRelation(P, "Moon", karyesh);
      if (lagnesh !== "Moon" && karyesh !== "Moon" && (m1.type === "ithasala" || m1.type === "easarapha") && m2.type === "ithasala") {
        add(1, T("लग्नेश-कार्येश में सीधा सम्बन्ध नहीं, परन्तु चन्द्रमा दोनों को जोड़ रहा है (नक्त योग) — किसी मध्यस्थ/तीसरे व्यक्ति की सहायता से कार्य।", "No direct link between the Lagna lord and karyesh, but the Moon connects them (Nakta yoga) — success through an intermediary/third person."), TN);
        timing = m2.gap;
      } else add(-1, T(`लग्नेश ${G[lagnesh]} और कार्येश ${G[karyesh]} में कोई ताजिक दृष्टि-सम्बन्ध नहीं — कार्य के लिए अधिक प्रयास आवश्यक।`, `No Tajika aspect between the Lagna lord ${G[lagnesh]} and the karyesh ${G[karyesh]} — more effort is needed.`), TN);
    }

    // 5. चन्द्र बल (प्रश्नमार्ग)
    const mh = P.Moon.house;
    const waxing = J.norm(P.Moon.lon - P.Sun.lon) < 180;
    if ([6, 8, 12].includes(mh)) add(-2, T(`चन्द्रमा ${ORD(mh)} भाव (दुःस्थान) में — मन में शंका, कार्य में हानि का भय।`, `The Moon is in the ${ORD(mh)} house (a dusthana) — doubts and fear of loss.`), PM);
    else if ([1, 4, 7, 10, 5, 9, 11].includes(mh)) add(1, T(`चन्द्रमा ${ORD(mh)} भाव में — शुभ।`, `The Moon is in the ${ORD(mh)} house — favourable.`), PM);
    add(waxing ? 0.5 : -0.5, waxing ? T("शुक्ल पक्ष का (बढ़ता) चन्द्रमा — बढ़ोत्तरी का संकेत।", "Waxing Moon (Shukla Paksha) — a sign of growth.") : T("कृष्ण पक्ष का (घटता) चन्द्रमा — फल में कमी।", "Waning Moon (Krishna Paksha) — reduced results."), PM);
    const mk = J.houseFrom(P.Moon.sign, (L + kh - 1) % 12);
    if (mk === 1 || [5, 9, 11].includes(mk)) add(0.5, T("चन्द्रमा कार्य-भाव से शुभ सम्बन्ध में।", "The Moon is favourably related to the house of the matter."), PM);

    // 6. विशेष प्रश्न
    if (topic.lawsuit) {
      const l7 = H[6].lord, a = r.strength[lagnesh], b = r.strength[l7];
      add(a > b + 5 ? 2 : a + 5 < b ? -2 : 0, T(`विवाद-प्रश्न: लग्नेश (आप) ${G[lagnesh]} बल ${a}, सप्तमेश (विरोधी) ${G[l7]} बल ${b} — ${a > b + 5 ? "आपका पक्ष बलवान, विजय सम्भव" : a + 5 < b ? "विरोधी पक्ष बलवान — समझौता हितकर" : "दोनों पक्ष समान — समझौते का योग"}।`, `Dispute question: Lagna lord (you) ${G[lagnesh]} strength ${a}, 7th lord (opponent) ${G[l7]} strength ${b} — ${a > b + 5 ? "your side is stronger, victory is possible" : a + 5 < b ? "the opponent is stronger — a settlement is wise" : "both sides are equal — a settlement is indicated"}.`), T("ताजिक नीलकण्ठी (वाद-प्रश्न)", "Tajika Neelakanthi (dispute questions)"));
    }
    if (topic.disease) {
      const l6 = H[5].lord, a = r.strength[lagnesh], b = r.strength[l6];
      add(a > b ? 1.5 : -1.5, T(`रोग-प्रश्न: लग्नेश बल ${a}, रोगेश (षष्ठेश ${G[l6]}) बल ${b} — ${a > b ? "रोग पर विजय, स्वास्थ्य-लाभ" : "रोग अभी प्रबल — चिकित्सा में सावधानी"}।`, `Disease question: Lagna lord strength ${a}, lord of disease (6th lord ${G[l6]}) strength ${b} — ${a > b ? "victory over illness, recovery" : "the illness is still strong — take care with treatment"}.`), PM);
    }
    if (topic.lost) {
      const mov = P.Moon.sign % 3 === 0, fix = P.Moon.sign % 3 === 1;
      F.push({ pts: 0, text: T(`खोई वस्तु: चन्द्रमा ${R[P.Moon.sign]} (${mov ? "चर — वस्तु दूर चली गई/स्थान बदला" : fix ? "स्थिर — वस्तु पास ही, घर/परिचित स्थान में" : "द्विस्वभाव — वस्तु पास के क्षेत्र में, खोज से मिल सकती है"})। चतुर्थ भाव ${R[(L + 3) % 12]} — उस दिशा/स्थान में खोजें।`, `Lost item: Moon in ${R[P.Moon.sign]} (${mov ? "movable — the item has gone far/changed place" : fix ? "fixed — the item is nearby, at home or a familiar place" : "dual — the item is in the vicinity and may be found by searching"}). The 4th house is ${R[(L + 3) % 12]} — search in that direction/place.`), src: T("षट्पञ्चाशिका (नष्ट-प्रश्न)", "Shatpanchashika (lost-object questions)") });
    }
    const kr = topic.karaka;
    if (r.strength[kr] >= 60) add(0.5, T(`कारक ग्रह ${G[kr]} बलवान (${r.strength[kr]})।`, `The karaka ${G[kr]} is strong (${r.strength[kr]}).`), PM);
    else if (r.strength[kr] < 35) add(-0.5, T(`कारक ग्रह ${G[kr]} निर्बल (${r.strength[kr]})।`, `The karaka ${G[kr]} is weak (${r.strength[kr]}).`), PM);

    let verdict;
    if (score >= 4) verdict = { k: 4, label: T("कार्य सिद्ध होगा", "The matter will succeed"), sub: T("प्रबल योग — प्रयास करें, सफलता के अच्छे संकेत", "Strong indications — go ahead, success is likely"), color: "#2f7d4a" };
    else if (score >= 1.5) verdict = { k: 3, label: T("प्रयास से कार्य सिद्ध", "Success with effort"), sub: T("सम्भावना अच्छी, परन्तु कुछ विलम्ब/मेहनत", "Good chances, but some delay/effort"), color: "#67993a" };
    else if (score >= -1) verdict = { k: 2, label: T("अनिश्चित — विलम्ब सम्भव", "Uncertain — delay likely"), sub: T("मिश्रित संकेत; उपाय करके और उचित समय पर पुनः प्रयास", "Mixed signs; do remedies and try again at the right time"), color: "#b8860b" };
    else verdict = { k: 1, label: T("अभी कार्य-सिद्धि कठिन", "Success is difficult right now"), sub: T("वर्तमान समय अनुकूल नहीं; रुकें, उपाय करें", "The present time is not favourable; wait and do remedies"), color: "#b3261e" };

    const stIdx = P[karyesh].sign % 3;
    const st = T(["चर", "स्थिर", "द्विस्वभाव"], ["movable", "fixed", "dual"])[stIdx];
    const unit = T(["दिन", "माह", "सप्ताह"], ["days", "months", "weeks"])[stIdx];
    let when = verdict.k >= 3
      ? T(`कार्येश ${G[karyesh]} ${st} राशि (${R[P[karyesh].sign]}) में — फल ${["शीघ्र", "देर से (परन्तु स्थायी)", "मध्यम समय में"][stIdx]} मिलेगा।`, `The karyesh ${G[karyesh]} is in a ${st} sign (${R[P[karyesh].sign]}) — results will come ${["quickly", "late (but lasting)", "in a moderate time"][stIdx]}.`)
      : T(`कार्येश ${G[karyesh]} ${st} राशि (${R[P[karyesh].sign]}) में — ${["परिस्थिति शीघ्र बदल सकती है; कुछ दिनों बाद उपाय सहित पुनः प्रयास करें", "स्थिति लम्बे समय तक बनी रह सकती है; धैर्य रखें और विकल्प भी देखें", "कुछ सप्ताह बाद स्थिति में परिवर्तन सम्भव"][stIdx]}।`, `The karyesh ${G[karyesh]} is in a ${st} sign (${R[P[karyesh].sign]}) — ${["the situation can change soon; try again with remedies after a few days", "the situation may persist for long; be patient and consider alternatives", "a change is possible in a few weeks"][stIdx]}.`);
    if (timing != null && verdict.k >= 3) when += T(` ताजिक नियम (इत्थशाल के अंश-अन्तर ≈ ${timing.toFixed(1)}°) से लगभग <b>${Math.max(1, Math.round(timing))} ${unit}</b> में।`, ` By the Tajika rule (ithasala gap ≈ ${timing.toFixed(1)}°), in about <b>${Math.max(1, Math.round(timing))} ${unit}</b>.`);

    return { lagnesh, karyesh, kh, score: Math.round(score * 10) / 10, factors: F, verdict, when };
  }

  root.Prashna = { get TOPICS() { return TOPICS(); }, judge, tajikRelation };
  if (typeof module !== "undefined") module.exports = root.Prashna;
})(typeof window !== "undefined" ? window : globalThis);
