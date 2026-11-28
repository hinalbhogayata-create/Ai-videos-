/*
 * gochar.js — गोचर (ग्रहों का राशि-परिवर्तन) गणना
 *  • शनि, गुरु, राहु-केतु के राशि-प्रवेश की तिथियाँ (वक्री गति सहित)
 *  • जीवन भर की साढ़ेसाती (तीनों चरण) और ढैय्या की तिथियाँ
 *  • वर्ष-वार गोचर तालिका
 *  • आज सभी ग्रहों का गोचर — चन्द्र राशि से भाव और शुभ/अशुभ (फलदीपिका, गोचराध्याय)
 * तिथि-सटीकता: लगभग ±1–3 दिन (ग्रह-गणना की सटीकता के अनुसार)।
 */
(function (root) {
  "use strict";
  const A = root.Astro || (typeof require !== "undefined" ? require("./astro.js") : null);
  const J = root.Jyotish || (typeof require !== "undefined" ? require("./jyotish.js") : null);

  const sid = (p, jd) => {
    const t = A.tropicalLongitudes(jd)[p];
    return J.norm(t - A.ayanamsaLahiri(jd));
  };
  const signAt = (p, jd) => Math.floor(sid(p, jd) / 30);

  // राशि-अवधियाँ: [{sign, start, end}]
  const cache = {};
  function signPeriods(p, jd0, jd1) {
    const key = `${p}|${Math.round(jd0)}|${Math.round(jd1)}`;
    if (cache[key]) return cache[key];
    const step = { Saturn: 4, Jupiter: 2, Rahu: 4, Ketu: 4, Mars: 1 }[p] || 1;
    const out = [];
    let s = signAt(p, jd0), start = jd0, prev = jd0;
    for (let jd = jd0 + step; jd <= jd1 + step; jd += step) {
      const t = Math.min(jd, jd1);
      const ns = signAt(p, t);
      if (ns !== s) {
        let a = prev, b = t; // द्विभाजन से प्रवेश-क्षण
        for (let k = 0; k < 20; k++) { const m = (a + b) / 2; if (signAt(p, m) === s) a = m; else b = m; }
        out.push({ sign: s, start, end: b });
        s = ns; start = b;
      }
      prev = t;
      if (t >= jd1) break;
    }
    out.push({ sign: s, start, end: jd1 });
    cache[key] = out;
    return out;
  }

  // कुछ राशियों में रहने के निरन्तर काल (वक्री आवागमन मिलाकर)
  function runs(periods, signSet, mergeGapDays) {
    const res = [];
    for (const p of periods) {
      if (!signSet.includes(p.sign)) continue;
      const last = res[res.length - 1];
      if (last && p.start - last.end <= mergeGapDays) { last.end = p.end; last.parts.push(p); }
      else res.push({ start: p.start, end: p.end, parts: [p] });
    }
    return res;
  }

  function sadeSati(r, jd0, jd1) {
    const m = r.moonSign;
    const s12 = (m + 11) % 12, s1 = m, s2 = (m + 1) % 12;
    const per = signPeriods("Saturn", jd0, jd1);
    const cycles = runs(per, [s12, s1, s2], 400).map((c) => {
      const phase = (sg) => {
        const ps = c.parts.filter((p) => p.sign === sg);
        return ps.length ? { start: ps[0].start, end: ps[ps.length - 1].end } : null;
      };
      return { start: c.start, end: c.end, p1: phase(s12), p2: phase(s1), p3: phase(s2) };
    });
    const en = root.I18N && root.I18N.lang === "en";
    const dh4 = runs(per, [(m + 3) % 12], 400).map((x) => ({ ...x, kind: en ? "4th (Kantaka) Dhaiya" : "चतुर्थ (कण्टक) ढैय्या" }));
    const dh8 = runs(per, [(m + 7) % 12], 400).map((x) => ({ ...x, kind: en ? "8th Dhaiya" : "अष्टम ढैय्या" }));
    return { cycles, dhaiya: dh4.concat(dh8).sort((a, b) => a.start - b.start) };
  }

  // फलदीपिका (गोचराध्याय) — चन्द्र राशि से शुभ भाव
  const GOOD = {
    Sun: [3, 6, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [3, 6, 11], Mercury: [2, 4, 6, 8, 10, 11],
    Jupiter: [2, 5, 7, 9, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], Saturn: [3, 6, 11], Rahu: [3, 6, 11], Ketu: [3, 6, 11],
  };
  const JUP_FX = ["स्थान-परिवर्तन, व्यय, मन अशान्त", "धन-लाभ, परिवार-सुख, वाणी प्रभावी", "कार्य में बाधा, पद/स्थान की हानि", "चिन्ता, स्वजनों से कष्ट", "संतान-सुख, बुद्धि, शुभ समाचार", "शत्रु व रोग से कष्ट", "विवाह/साझेदारी, यात्रा, सुख", "कष्ट, रोग, धन-हानि का भय", "भाग्योदय, धर्म-कार्य, उन्नति", "पद/कार्य में परिवर्तन, मध्यम फल", "लाभ, पद-प्राप्ति, इच्छापूर्ति", "व्यय, दूर यात्रा, दुःख"];
  const SAT_FX = ["साढ़ेसाती शिखर — स्वास्थ्य, चिन्ता, अधिक परिश्रम", "साढ़ेसाती अन्तिम चरण — धन/परिवार की परीक्षा", "लाभ, साहस, शत्रु-विजय", "कण्टक शनि (ढैय्या) — गृह-सुख, माता, मन पर प्रभाव", "संतान/बुद्धि सम्बन्धी चिन्ता", "शत्रु पर विजय, रोग-मुक्ति, लाभ", "यात्रा, दाम्पत्य/साझेदारी में तनाव", "अष्टम शनि (ढैय्या) — कष्ट, रोग, अचानक बाधा", "भाग्य व धर्म-कार्य में रुकावट", "कार्य में कठिनाई/परिवर्तन", "लाभ, उन्नति, धन-वृद्धि", "साढ़ेसाती आरम्भ — व्यय, भागदौड़, नींद में कमी"];
  const RAHU_FX = ["मानसिक भ्रम, स्वास्थ्य", "धन-हानि, वाणी-दोष", "साहस, लाभ, सफलता", "गृह-अशान्ति", "संतान-चिन्ता, भ्रम", "शत्रु-विजय, लाभ", "दाम्पत्य/साझेदारी में भ्रम", "अचानक कष्ट", "धर्म में संशय, पिता से मतभेद", "कार्य में उथल-पुथल", "अचानक लाभ, इच्छापूर्ति", "व्यय, विदेश, अनिद्रा"];
  const FX_HI = { Jupiter: JUP_FX, Saturn: SAT_FX, Rahu: RAHU_FX };
  const FX_EN = {
    Jupiter: ["change of place, expenses, restless mind", "gain of wealth, family happiness, effective speech", "obstacles in work, loss of position/place", "worry, trouble from relatives", "happiness from children, intellect, good news", "trouble from enemies and disease", "marriage/partnership, travel, happiness", "hardship, illness, fear of financial loss", "rise of fortune, religious work, progress", "change in position/work, moderate results", "gains, attainment of position, wishes fulfilled", "expenses, distant travel, sorrow"],
    Saturn: ["Sade Sati peak — health, worry, extra effort", "Sade Sati last phase — tests of wealth/family", "gains, courage, victory over enemies", "Kantaka Shani (Dhaiya) — effect on home, mother, mind", "worry about children/intellect", "victory over enemies, recovery, gains", "travel, strain in marriage/partnership", "8th Saturn (Dhaiya) — hardship, illness, sudden obstacles", "obstacles in fortune and religious work", "difficulty/changes at work", "gains, progress, growth of wealth", "Sade Sati begins — expenses, running around, less sleep"],
    Rahu: ["mental confusion, health", "loss of wealth, faults of speech", "courage, gains, success", "unrest at home", "worry about children, confusion", "victory over enemies, gains", "confusion in marriage/partnership", "sudden trouble", "doubts in dharma, differences with father", "upheaval at work", "sudden gains, wishes fulfilled", "expenses, foreign lands, insomnia"],
  };
  const FX = Object.assign({}, FX_HI);

  function today(r, nowJd) {
    const pos = A.siderealPositionsAt(nowJd), next = A.siderealPositionsAt(nowJd + 1);
    return A.PLANETS.map((p) => {
      const sign = Math.floor(pos[p] / 30);
      const fm = J.houseFrom(r.moonSign, sign), fl = J.houseFrom(r.lagnaSign, sign);
      const retro = p === "Rahu" || p === "Ketu" ? false : J.norm(next[p] - pos[p] + 180) - 180 < 0;
      return { p, sign, deg: pos[p] % 30, fm, fl, good: GOOD[p].includes(fm), retro };
    });
  }

  function yearTable(r, y0, y1, tz) {
    const jd0 = A.julianDay(y0, 1, 1, 0), jd1 = A.julianDay(y1 + 1, 1, 1, 0);
    const per = { Saturn: signPeriods("Saturn", jd0 - 800, jd1), Jupiter: signPeriods("Jupiter", jd0 - 400, jd1), Rahu: signPeriods("Rahu", jd0 - 600, jd1) };
    const rows = [];
    for (let y = y0; y <= y1; y++) {
      const a = A.julianDay(y, 1, 1, 0), b = A.julianDay(y + 1, 1, 1, 0);
      const row = { year: y };
      for (const p of ["Saturn", "Jupiter", "Rahu"]) {
        row[p] = per[p].filter((x) => x.end > a && x.start < b).map((x) => ({ sign: x.sign, start: x.start, from: x.start > a ? x.start : null, fm: J.houseFrom(r.moonSign, x.sign), good: GOOD[p].includes(J.houseFrom(r.moonSign, x.sign)) }));
      }
      rows.push(row);
    }
    return rows;
  }

  root.Gochar = { signPeriods, sadeSati, today, yearTable, GOOD, FX, setLang(l) { Object.assign(FX, l === "en" ? FX_EN : FX_HI); } };
  if (typeof module !== "undefined") module.exports = root.Gochar;
})(typeof window !== "undefined" ? window : globalThis);
