/*
 * astro.js — ज्योतिषीय गणना इंजन (सायन ग्रह-स्थिति → निरयण / लाहिरी अयनांश)
 * ग्रह-स्थिति: Paul Schlyter की कक्षीय-तत्व विधि (चन्द्र, गुरु, शनि के मुख्य विक्षोभ सहित)
 * सटीकता: सूर्य/ग्रह ~1-2 कला, चन्द्र ~2-4 कला — कुंडली हेतु पर्याप्त।
 */
(function (root) {
  "use strict";
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const norm = (x) => ((x % 360) + 360) % 360;
  const sind = (x) => Math.sin(x * D2R), cosd = (x) => Math.cos(x * D2R);
  const atan2d = (y, x) => Math.atan2(y, x) * R2D;

  // ---------- जूलियन दिवस ----------
  function julianDay(y, m, d, hourUT) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = (y > 1582 || (y === 1582 && (m > 10 || (m === 10 && d >= 15)))) ? 2 - A + Math.floor(A / 4) : 0;
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + hourUT / 24;
  }
  function jdToDate(jd) { return new Date((jd - 2440587.5) * 86400000); }
  function dateToJd(date) { return date.getTime() / 86400000 + 2440587.5; }

  // ---------- लाहिरी अयनांश ----------
  function ayanamsaLahiri(jd) {
    const T = (jd - 2451545.0) / 36525;
    // J2000 पर 23°51'11" ; वार्षिक अयन-गति ~50.29"
    return 23.85305 + 1.39695 * T + 0.000308 * T * T;
  }

  // ---------- केप्लर ----------
  function solveKepler(M, e) {
    let E = M + e * R2D * sind(M) * (1 + e * cosd(M));
    for (let k = 0; k < 30; k++) {
      const dE = (E - e * R2D * sind(E) - M) / (1 - e * cosd(E));
      E -= dE;
      if (Math.abs(dE) < 1e-7) break;
    }
    return E;
  }

  function orbitalElements(name, d) {
    switch (name) {
      case "Sun": return { N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1, e: 0.016709 - 1.151e-9 * d, M: 356.047 + 0.9856002585 * d };
      case "Moon": return { N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.0549, M: 115.3654 + 13.0649929509 * d };
      case "Mercury": return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d };
      case "Venus": return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d };
      case "Mars": return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d };
      case "Jupiter": return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d };
      case "Saturn": return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d };
    }
  }

  function helio(el) {
    const M = norm(el.M);
    const E = solveKepler(M, el.e);
    const xv = el.a * (cosd(E) - el.e);
    const yv = el.a * Math.sqrt(1 - el.e * el.e) * sind(E);
    const v = atan2d(yv, xv), r = Math.hypot(xv, yv);
    const N = el.N, w = el.w, i = el.i;
    const x = r * (cosd(N) * cosd(v + w) - sind(N) * sind(v + w) * cosd(i));
    const y = r * (sind(N) * cosd(v + w) + cosd(N) * sind(v + w) * cosd(i));
    const z = r * sind(v + w) * sind(i);
    return { x, y, z, r, v };
  }

  // सायन (tropical) भूकेन्द्रीय भोगांश
  function tropicalLongitudes(jd) {
    const d = jd - 2451543.5;
    const out = {};
    // सूर्य
    const s = orbitalElements("Sun", d);
    const sM = norm(s.M);
    const sE = solveKepler(sM, s.e);
    const sxv = cosd(sE) - s.e, syv = Math.sqrt(1 - s.e * s.e) * sind(sE);
    const sv = atan2d(syv, sxv), sr = Math.hypot(sxv, syv);
    const sunLon = norm(sv + s.w);
    out.Sun = sunLon;
    const xs = sr * cosd(sunLon), ys = sr * sind(sunLon);

    // चन्द्र
    const m = orbitalElements("Moon", d);
    const mh = helio(m);
    let moonLon = atan2d(mh.y, mh.x);
    const Ms = sM, Mm = norm(m.M);
    const Ls = norm(s.w + sM), Lm = norm(m.N + m.w + m.M);
    const D = Lm - Ls, F = Lm - m.N;
    moonLon += -1.274 * sind(Mm - 2 * D) + 0.658 * sind(2 * D) - 0.186 * sind(Ms)
      - 0.059 * sind(2 * Mm - 2 * D) - 0.057 * sind(Mm - 2 * D + Ms) + 0.053 * sind(Mm + 2 * D)
      + 0.046 * sind(2 * D - Ms) + 0.041 * sind(Mm - Ms) - 0.035 * sind(D)
      - 0.031 * sind(Mm + Ms) - 0.015 * sind(2 * F - 2 * D) + 0.011 * sind(Mm - 4 * D);
    out.Moon = norm(moonLon);

    // ग्रह
    const MjM = norm(orbitalElements("Jupiter", d).M), MsM = norm(orbitalElements("Saturn", d).M);
    for (const p of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) {
      const h = helio(orbitalElements(p, d));
      let hx = h.x, hy = h.y;
      if (p === "Jupiter" || p === "Saturn") {
        let lon = atan2d(h.y, h.x), lat = atan2d(h.z, Math.hypot(h.x, h.y));
        const Mj = MjM, Mst = MsM;
        if (p === "Jupiter") {
          lon += -0.332 * sind(2 * Mj - 5 * Mst - 67.6) - 0.056 * sind(2 * Mj - 2 * Mst + 21)
            + 0.042 * sind(3 * Mj - 5 * Mst + 21) - 0.036 * sind(Mj - 2 * Mst)
            + 0.022 * cosd(Mj - Mst) + 0.023 * sind(2 * Mj - 3 * Mst + 52) - 0.016 * sind(Mj - 5 * Mst - 69);
        } else {
          lon += 0.812 * sind(2 * Mj - 5 * Mst - 67.6) - 0.229 * cosd(2 * Mj - 4 * Mst - 2)
            + 0.119 * sind(Mj - 2 * Mst - 3) + 0.046 * sind(2 * Mj - 6 * Mst - 69) + 0.014 * sind(Mj - 3 * Mst + 32);
          lat += -0.020 * cosd(2 * Mj - 4 * Mst - 2) + 0.018 * sind(2 * Mj - 6 * Mst - 49);
        }
        const rr = h.r * cosd(lat);
        hx = rr * cosd(lon); hy = rr * sind(lon);
      }
      out[p] = norm(atan2d(hy + ys, hx + xs));
    }
    // राहु (मध्यम पात) — केतु = राहु + 180
    out.Rahu = norm(m.N);
    out.Ketu = norm(m.N + 180);
    return out;
  }

  function obliquity(jd) {
    const T = (jd - 2451545) / 36525;
    return 23.4392911 - 0.0130042 * T;
  }
  function gmstDeg(jd) {
    const T = (jd - 2451545) / 36525;
    return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000);
  }
  // सायन लग्न
  function ascendantTropical(jd, lat, lon) {
    const ramc = norm(gmstDeg(jd) + lon);
    const eps = obliquity(jd);
    const asc = atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + Math.tan(lat * D2R) * sind(eps)));
    const mc = norm(atan2d(sind(ramc), cosd(ramc) * cosd(eps)));
    return { asc: norm(asc), mc };
  }

  // ---------- समय-क्षेत्र (IANA) से UTC अन्तर — ऐतिहासिक DST सहित ----------
  function tzOffsetMinutes(utcMs, timeZone) {
    const f = new Intl.DateTimeFormat("en-US", {
      timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const p = {};
    for (const part of f.formatToParts(new Date(utcMs))) p[part.type] = part.value;
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return Math.round((asUTC - utcMs) / 60000);
  }
  function offsetForLocal(y, mo, d, h, mi, timeZone) {
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    let off = tzOffsetMinutes(guess, timeZone);
    off = tzOffsetMinutes(guess - off * 60000, timeZone);
    return off;
  }

  // ---------- मुख्य: जन्म-कुंडली डेटा ----------
  const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  function computeChart({ year, month, day, hour, minute, lat, lon, tzOffsetMin }) {
    const localHours = hour + minute / 60;
    const utHours = localHours - tzOffsetMin / 60;
    const jd = julianDay(year, month, day, utHours);
    const ayan = ayanamsaLahiri(jd);
    const trop = tropicalLongitudes(jd);
    const tropNext = tropicalLongitudes(jd + 1 / 24);
    const tropPrev = tropicalLongitudes(jd - 1 / 24);
    const { asc } = ascendantTropical(jd, lat, lon);

    const planets = {};
    for (const p of PLANETS) {
      const sid = norm(trop[p] - ayan);
      let speed = norm(tropNext[p] - tropPrev[p] + 180) - 180; // प्रति 2 घण्टे
      speed = speed * 12; // प्रति दिन
      planets[p] = {
        lon: sid,
        sign: Math.floor(sid / 30),
        deg: sid % 30,
        speed,
        retro: (p === "Rahu" || p === "Ketu") ? true : speed < 0,
      };
    }
    const ascSid = norm(asc - ayan);
    return { jd, ayanamsa: ayan, ascendant: { lon: ascSid, sign: Math.floor(ascSid / 30), deg: ascSid % 30 }, planets };
  }

  function siderealPositionsAt(jd) {
    const ayan = ayanamsaLahiri(jd);
    const t = tropicalLongitudes(jd);
    const r = {};
    for (const p of PLANETS) r[p] = norm(t[p] - ayan);
    return r;
  }

  // ---------- सूर्योदय (सामान्य) ----------
  function sunriseSunset(year, month, day, lat, lon, tzOffsetMin) {
    // NOAA सरलीकृत विधि
    const n = Math.round(julianDay(year, month, day, 12) - 2451545.0);
    const Js = n - lon / 360;
    const M = norm(357.5291 + 0.98560028 * Js);
    const C = 1.9148 * sind(M) + 0.02 * sind(2 * M) + 0.0003 * sind(3 * M);
    const L = norm(M + C + 180 + 102.9372);
    const Jt = 2451545 + Js + 0.0053 * sind(M) - 0.0069 * sind(2 * L);
    const dec = Math.asin(sind(L) * sind(23.44)) * R2D;
    const cosH = (sind(-0.833) - sind(lat) * sind(dec)) / (cosd(lat) * cosd(dec));
    if (cosH < -1 || cosH > 1) return null;
    const H = Math.acos(cosH) * R2D;
    const rise = Jt - H / 360, set = Jt + H / 360;
    const toLocal = (jd) => { const ms = (jd - 2440587.5) * 86400000 + tzOffsetMin * 60000; const dt = new Date(ms); return { h: dt.getUTCHours(), m: dt.getUTCMinutes() }; };
    return { rise: toLocal(rise), set: toLocal(set), riseJd: rise };
  }

  root.Astro = {
    PLANETS, norm, julianDay, jdToDate, dateToJd, ayanamsaLahiri, tropicalLongitudes,
    ascendantTropical, computeChart, siderealPositionsAt, tzOffsetMinutes, offsetForLocal, sunriseSunset,
  };
  if (typeof module !== "undefined") module.exports = root.Astro;
})(typeof window !== "undefined" ? window : globalThis);
