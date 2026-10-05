// ---------------------------------------------------------------------------
//  40-works-day.js -- the building site's calendar: the crews' hours, the
//  nights and weekends, the weather and what else goes wrong -- the sun
//  across the sky as the days go by, and a clock of how long it has taken
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "to add a day night cycle to things with an
  // accurate build timer and for the workers to have their hours and stuff
  // and unfortunate weather for slowing down their work a long with other
  // things just to make things more complicated because I like it that way")
  //
  // The building's timetable (40-works.js) is in seconds of work.  Here the
  // work is laid out on a calendar: so many working days for a building of
  // its size and kind (a house of 190 m2 about seven months), each 7:00 to
  // 15:30 with half an hour for lunch, Monday to Friday, none on a holiday;
  // each day its weather -- rain and snow stop the work until the building
  // is closed in, and slow it after; wind stands the crane down -- and now
  // and then a delivery late, a machine broken down, the crew short, an
  // inspector to wait for (the footings before the pour, the framing before
  // the drywall, the final before anyone moves in; now and then failed, and
  // put right).  The site's clock (WK.calendar, read by 40-works.js) plays
  // the working hours as they are and the rest faster -- a night goes by in
  // a moment, like a film of a building going up -- the sun crossing the
  // sky each day, dusk, the dark, the dawn; the crews there only in their
  // hours.  A card in the corner says the day, the date and the time, and
  // what is going on.
  var JC_ON = 7 * 3600, JC_LUNCH = 12 * 3600, JC_BACK = 12.5 * 3600, JC_OFF = 15.5 * 3600, JC_DAY = 86400;
  var JC_WORKED = (JC_LUNCH - JC_ON) + (JC_OFF - JC_BACK);          // 8 hours
  var JC_NIGHT_K = 10, JC_PAUSE_K = 3, JC_STOP_K = 3;                 // days off, pauses, days rained off: played this many times faster
  // (2026-10-05: "the day night cycle is good but it kind of freezes then goes back to being day rather
  // than having night time") A night played unevenly: the evening and the dawn quickly, the dark hours
  // themselves slowly enough to be seen -- it had all gone by ten times faster, a fifth of a second of
  // dusk at the usual speed, never dark.
  var JC_DUSK_K = 10, JC_DARK_K = 2.4, JC_DARK0 = 18.5 * 3600, JC_DARK1 = 5.5 * 3600;
  // working days by floor area: [k, power] -- a wood house of 200 m2 about 130 days, of 500 m2 about 190;
  // a steel office of 1,500 m2 about 220, a mall of 20,000 m2 about 450; a tower of 10,000 m2 about 470
  var JC_FRAME = { wood: [14.5, 0.414], steel: [29, 0.28], tall: [30, 0.3] };
  // (a garage, a hall, a store room: quicker to build than a room lived in)
  var JC_QUICK = { garage: 0.5, hall: 0.5, storage: 0.5, stock: 0.6, stairs: 0.7, lift: 0.7, court: 0.2, void: 0 };
  // the weather, month by month (a temperate place): how likely each kind is
  var JC_WX_KINDS = ["clear", "cloudy", "drizzle", "rain", "storm", "snow", "wind"];
  var JC_WX = [[30, 30, 5, 5, 0, 22, 8], [30, 28, 6, 6, 0, 20, 10], [30, 26, 12, 12, 2, 8, 10], [32, 24, 16, 16, 4, 1, 7],
               [38, 22, 14, 14, 7, 0, 5], [45, 20, 10, 10, 10, 0, 5], [50, 18, 8, 8, 12, 0, 4], [48, 20, 8, 8, 11, 0, 5],
               [46, 22, 10, 10, 6, 0, 6], [40, 26, 12, 12, 3, 1, 6], [30, 30, 12, 12, 2, 6, 8], [28, 30, 6, 6, 0, 20, 10]];
  // what each does to the work: [before the building is closed in, after]  (0: no work at all)
  var JC_WX_RATE = { clear: [1, 1], cloudy: [1, 1], drizzle: [0.75, 0.95], rain: [0, 0.85], storm: [0, 0.7], snow: [0, 0.7], wind: [0.6, 0.95] };
  // how dark the sky is, how much the sun is hidden
  var JC_WX_DIM = { clear: 0, cloudy: 0.35, drizzle: 0.5, rain: 0.65, storm: 0.8, snow: 0.55, wind: 0.2 };
  // the inspections: the first time the timetable says each (40-works*.js's jb_ words)
  var JC_CHECKS = [["jb_pour", "jc_insp_footing"], ["jb_drywall", "jc_insp_frame"], ["jb_movein", "jc_insp_final"]];

  // ---- the calendar laid out ----------------------------------------------------------------------
  function jcArea(plan) {
    var P = plan.site.P, a = 0;
    (plan.site.levels || []).forEach(function (L) {
      (L.rooms || []).forEach(function (o) {
        var k = JC_QUICK[o.r.use];
        if (k === undefined) { k = JC_QUICK[jcKindOf(o.r)]; }
        a += (o.r.w * o.r.h) / (P * P) * (k === undefined ? 1 : k);
      });
    });
    return Math.max(20, a);
  }
  function jcKindOf(r) {
    var t = String(r.text || "").toLowerCase();
    return /garage/.test(t) ? "garage" : /hall|corridor|landing/.test(t) ? "hall" : /storage|closet|store room/.test(t) ? "storage" : /stair/.test(t) ? "stairs" : "";
  }
  function jcFrame(plan) {
    var f = plan.J && plan.J.frame;
    return JC_FRAME[f] ? f : (plan.site.levels || []).length > 6 ? "tall" : "wood";
  }
  // The working days a building like this takes.
  function jcDaysFor(plan) {
    var k = JC_FRAME[jcFrame(plan)];
    return Math.max(15, Math.round(k[0] * Math.pow(jcArea(plan), k[1])));
  }
  // The days off: Saturdays, Sundays, and the holidays of the year (US: the site shut).
  function jcHoliday(d) {
    var y = d.getFullYear(), m = d.getMonth(), day = d.getDate(), wd = d.getDay();
    function nth(month, weekday, n) {
      var first = new Date(y, month, 1).getDay(), at = 1 + (weekday - first + 7) % 7 + (n - 1) * 7;
      return at;
    }
    function last(month, weekday) { var dd = new Date(y, month + 1, 0), at = dd.getDate() - (dd.getDay() - weekday + 7) % 7; return at; }
    if ((m === 0 && day === 1) || (m === 6 && day === 4) || (m === 11 && (day === 24 || day === 25 || day === 31))) { return true; }
    if (m === 4 && day === last(4, 1)) { return true; }                         // Memorial Day
    if (m === 8 && day === nth(8, 1, 1)) { return true; }                       // Labor Day
    if (m === 10 && (day === nth(10, 4, 4) || day === nth(10, 4, 4) + 1)) { return true; }   // Thanksgiving, and the day after
    void wd;
    return false;
  }
  function jcPick(weights, r) {
    var sum = weights.reduce(function (s, v) { return s + v; }, 0), x = r * sum;
    for (var i = 0; i < weights.length; i++) { x -= weights[i]; if (x < 0) { return i; } }
    return weights.length - 1;
  }
  // Every stretch of the site's time, in order: its seconds on the site's clock (s), the work done
  // (w), the calendar (c, seconds from the first midnight), whether the crews are there, and why.
  function jcLay(plan) {
    var T = plan.T, D = jcDaysFor(plan), perSec = T / (D * JC_WORKED);   // work-seconds for each second worked
    var seed = (Math.round(T * 7) ^ Math.round(jcArea(plan) * 13)) >>> 0, rnd = gl3Rand(seed % 100000 + 11);
    var start = new Date(); start.setHours(0, 0, 0, 0);
    while (start.getDay() === 0 || start.getDay() === 6) { start.setDate(start.getDate() + 1); }
    var checks = JC_CHECKS.map(function (c) {
      var at = Infinity;
      (plan.say || []).forEach(function (s) { if (s.key === c[0] && s.t0 < at) { at = s.t0; } });
      return { at: at, say: c[1] };
    }).filter(function (c) { return isFinite(c.at) && c.at > 0 && c.at < T; });
    var closed = isFinite(plan.closedAt) && plan.closedAt > 0 ? plan.closedAt : T * 0.55;
    var segs = [], s = 0, w = 0, worked = 0, wx = "clear", stats = { days: 0, lost: 0, rain: 0, snow: 0, storm: 0, wind: 0, late: 0, broke: 0, short: 0, insp: 0, failed: 0 };
    function push(c0, c1, k, rate, pres, state, extra) {
      if (c1 <= c0) { return; }
      var ds = (c1 - c0) * perSec / k, dw = rate * (c1 - c0) * perSec;
      segs.push(Object.assign({ s0: s, s1: s + ds, w0: w, w1: w + dw, c0: c0, c1: c1, pres: pres, state: state, wx: wx, day: Math.max(1, stats.days) }, extra || {}));
      s += ds; w += dw;
    }
    // the hours off at night: quick through the evening and the dawn, slow through the dark
    function rest(c0, c1, state) {
      var day0 = Math.floor(c0 / JC_DAY) * JC_DAY, cuts = [c0, Math.max(c0, Math.min(c1, day0 + JC_DARK1)), Math.max(c0, Math.min(c1, day0 + JC_DARK0)), c1];
      for (var i = 0; i + 1 < cuts.length; i++) {
        var a = cuts[i], b = cuts[i + 1], h = ((a + b) / 2 - day0) / 3600;
        push(a, b, h < 5.5 || h >= 18.5 ? JC_DARK_K : JC_DUSK_K, 0, 0, state);
      }
    }
    // a worked stretch: as far as the work goes, an inspection where it comes to one, ended where the work is
    function work(c0, c1, rate, state) {
      var c = c0;
      while (c < c1 && w < T - 1e-9) {
        var next = checks[0], room = (c1 - c) * rate * perSec, need = T - w;
        if (next && rate > 0 && next.at - w <= room && next.at - w <= need) {
          var cAt = c + (next.at - w) / (rate * perSec);
          push(c, cAt, 1, rate, 1, state);
          w = next.at;
          checks.shift();
          // the inspector's two hours, the crew off the site; now and then failed: three hours put right
          var cEnd = Math.min(c1, cAt + 2 * 3600);
          push(cAt, cEnd, JC_PAUSE_K, 0, 0, "jc_inspect", { say: next.say });
          stats.insp++;
          c = cEnd;
          if (rnd() < 0.12) {
            stats.failed++;
            var cFix = Math.min(c1, c + 3 * 3600);
            push(c, cFix, 1, rate * 0.3, 1, "jc_fail", { say: next.say });
            c = cFix;
          }
          continue;
        }
        if (rate > 0 && need <= room) {
          var cDone = c + need / (rate * perSec);
          push(c, cDone, 1, rate, 1, state);
          w = T;
          return cDone;
        }
        push(c, c1, rate > 0 ? 1 : JC_PAUSE_K, rate, rate > 0 ? 1 : 0, state);
        c = c1;
      }
      return c;
    }
    for (var d = 0; d < 4000 && w < T - 1e-9; d++) {
      var date = new Date(start); date.setDate(start.getDate() + d);
      var day0 = d * JC_DAY, month = date.getMonth();
      // the day's weather: much like yesterday's, half the time
      var was = wx;
      wx = rnd() < 0.45 ? was : JC_WX_KINDS[jcPick(JC_WX[month], rnd())];
      if (wx === "snow" && JC_WX[month][5] === 0) { wx = "rain"; }
      var off = date.getDay() === 0 || date.getDay() === 6 ? "jc_weekend" : jcHoliday(date) ? "jc_holiday" : null;
      if (off) { push(day0 + (segs.length ? 0 : JC_ON), day0 + JC_DAY, JC_NIGHT_K, 0, 0, off); continue; }
      stats.days++;
      if (segs.length) { rest(day0, day0 + JC_ON, "jc_night"); }
      var rates = JC_WX_RATE[wx] || [1, 1], rate = w < closed ? rates[0] : rates[1];
      if (rate === 0) {
        // rained off (snowed off, a storm): the crews do not come
        stats.lost++; stats[wx] = (stats[wx] || 0) + 1;
        push(day0 + JC_ON, day0 + JC_OFF, JC_STOP_K, 0, 0, "jc_off_" + wx);
        rest(day0 + JC_OFF, day0 + JC_DAY, "jc_home");
        continue;
      }
      var why = rate < 1 ? "jc_slow_" + wx : "jc_work";
      if (rate < 1) { stats[wx] = (stats[wx] || 0) + 1; }
      var r = rnd(), from = day0 + JC_ON;
      if (r < 0.05) { stats.short++; rate *= 0.75; why = "jc_short"; }
      else if (r < 0.09) {
        // a delivery late: the morning waited out in the site office
        stats.late++;
        push(from, day0 + 9.5 * 3600, JC_PAUSE_K, 0, 0, "jc_late");
        from = day0 + 9.5 * 3600;
      } else if (r < 0.115 && w < closed) {
        // a machine broken down until its fitter came
        stats.broke++;
        push(from, day0 + 11 * 3600, JC_PAUSE_K, 0, 0, "jc_broke");
        from = day0 + 11 * 3600;
      }
      var at = from < day0 + JC_LUNCH ? work(from, day0 + JC_LUNCH, rate, why) : from;
      if (w >= T - 1e-9) { break; }
      push(Math.max(at, day0 + JC_LUNCH), day0 + JC_BACK, JC_PAUSE_K, 0, 1, "jc_lunch");
      at = work(Math.max(day0 + JC_BACK, from), day0 + JC_OFF, rate, why);
      if (w >= T - 1e-9) { break; }
      rest(day0 + JC_OFF, day0 + JC_DAY, "jc_home");
      worked++;
    }
    var endC = segs.length ? segs[segs.length - 1].c1 : 0;
    // (the days it was reckoned to take, made as many as it does take: the rain, the late lorries, the
    // inspections, a longer job than reckoned -- "Day 205 of about 192" was wrong by the end)
    D = Math.max(D, segs.length ? segs[segs.length - 1].day : 1);
    return { T: T, D: D, segs: segs, length: s, start: start, end: endC, stats: stats, perSec: perSec };
  }
  function jcOf(plan) {
    if (!plan || !plan.done || !(plan.T > 0) || !plan.site) { return null; }
    if (plan.jc && plan.jc.T === plan.T) { return plan.jc; }
    try { plan.jc = jcLay(plan); } catch (e) { if (window.console && console.warn) { console.warn("calendar:", e && e.message); } plan.jc = null; }
    return plan.jc;
  }
  // The stretch at s on the site's clock, and how far into it.
  function jcAt(J, s) {
    var segs = J.segs, lo = 0, hi = segs.length - 1;
    if (!segs.length) { return null; }
    if (s <= segs[0].s0) { return { seg: segs[0], k: 0 }; }
    if (s >= segs[hi].s1) { return { seg: segs[hi], k: 1 }; }
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (segs[mid].s0 <= s) { lo = mid; } else { hi = mid - 1; } }
    var g = segs[lo];
    return { seg: g, k: g.s1 > g.s0 ? (s - g.s0) / (g.s1 - g.s0) : 0 };
  }
  function jcCal(a) { return a.seg.c0 + (a.seg.c1 - a.seg.c0) * a.k; }
  if (typeof WK === "object") {
    WK.calendar = {
      length: function (plan) { var J = jcOf(plan); jcRunFor(plan); return J ? J.length : plan.T; },
      work: function (s, plan) {
        var J = jcOf(plan), a = J && jcAt(J, s);
        return a ? a.seg.w0 + (a.seg.w1 - a.seg.w0) * a.k : s;
      },
      present: function (s, plan) { var J = jcOf(plan), a = J && jcAt(J, s); return a ? a.seg.pres : 1; }
    };
  }

  // ---- the sky: the sun across it, dusk, the dark, the dawn, the weather -----------------------------
  var jcSky = null;                       // { h: hour of the day, dim: 0..1 } while a site's calendar plays
  // How dark it is at an hour: 0 day, 1 evening, 2 night (V3.tod's own measure).
  function jcTod(h) {
    if (h >= 7 && h <= 17) { return 0; }
    if (h > 17 && h < 18.5) { return (h - 17) / 1.5 * 2; }
    if (h >= 5.5 && h < 7) { return (7 - h) / 1.5 * 2; }
    return 2;
  }
  if (typeof gl3SkyNow === "function") {
    var gl3SkyNowJc = gl3SkyNow;
    gl3SkyNow = function () {
      var out = gl3SkyNowJc.apply(this, arguments);
      if (!jcSky || !out || !out.sun) { return out; }
      try {
        // (risen in the east, high at noon, set in the west: its own heading turned round with the day)
        var h = jcSky.h, el = Math.max(0.1, Math.sin(Math.PI * (h - 6) / 12)) * 62 * Math.PI / 180;
        var head = Math.atan2(out.sun[1], out.sun[0]) + Math.PI * (Math.max(5, Math.min(19, h)) - 12) / 12 * 0.85;
        out = Object.assign({}, out, { sun: [Math.cos(el) * Math.cos(head), Math.cos(el) * Math.sin(head), Math.sin(el)] });
        var dim = jcSky.dim;
        if (dim > 0) {
          var grey = function (c, k) { var m = (c[0] + c[1] + c[2]) / 3; return c.map(function (v) { return (v + (m - v) * k) * (1 - k * 0.3); }); };
          if (out.sunCol) { out.sunCol = out.sunCol.map(function (v) { return v * (1 - dim * 0.75); }); }
          ["zenith", "horizon", "cloud", "glow"].forEach(function (k) { if (out[k]) { out[k] = grey(out[k], dim); } });
          if (out.skyAmb) { out.skyAmb = out.skyAmb.map(function (v) { return v * (1 + dim * 0.15); }); }
        }
      } catch (e) { /* as it was */ }
      return out;
    };
  }

  // ---- while it plays: the sky, the rain, the card ---------------------------------------------------
  var jcRunning = null;
  function jcRunFor(plan) {
    if (!plan || !plan.bp || jcRunning === plan.bp || !V3 || !V3.box) { return; }
    var me = plan.bp, box = V3.box;
    jcRunning = me;
    var last = { text: "", wx: null };
    (function tick() {
      var live = bpSite === me && V3 && V3.box === box && WK.plan === plan && plan.ok;
      if (!live) {
        // (done, or skipped to the end: how long it took, said for a while)
        var Jd = jcOf(plan), keep = Jd && V3 && V3.box === box && WK.plan === plan;
        if (keep) { jcCard(box, Jd, { seg: Jd.segs[Jd.segs.length - 1], k: 1 }, Jd.end, true, last); }
        jcStop(box, keep ? 9000 : 0);
        if (jcRunning === me) { jcRunning = null; }
        return;
      }
      var J = jcOf(plan);
      if (J) {
        var now = performance.now(), B = me, L = B.T || J.length;
        var s = B.start > now ? 0 : Math.max(0, Math.min(1, (now - B.start) / B.ms)) * L;
        if (Math.abs(L - J.length) > 1e-6 && isFinite(plan.siteNow)) { s = plan.siteNow; }
        var a = jcAt(J, s);
        if (a) {
          var c = jcCal(a), h = (c % JC_DAY) / 3600, seg = a.seg, ended = s >= J.length - 1e-6;
          // (the nights as dark as they are -- softened only when days go by faster than about two a
          // second, where night and day would flash)
          var dayReal = J.end > 0 ? (J.length / (J.end / JC_DAY)) * (B.ms / 1000) / L : 9;
          var depth = Math.max(0, Math.min(1, (dayReal - 0.35) / 0.4));
          jcSky = { h: ended ? 13 : h, dim: JC_WX_DIM[seg.wx] || 0 };
          V3.tod = ended ? (V3.todAim || 0) : Math.max(jcTod(h) * depth, seg.wx === "storm" ? 0.6 : 0);
          jcWeather(box, ended ? null : seg.wx);
          jcCard(box, J, a, c, ended, last);
        }
      }
      requestAnimationFrame(tick);
    })();
  }
  function jcStop(box, keepMs) {
    jcSky = null;
    if (V3) { V3.tod = V3.todAim || 0; V3.dirty = true; }
    jcWxNow = null;
    if (!box) { return; }
    all(".v3-jcwx", box).forEach(function (n) { n.remove(); });
    var card = el(".v3-jc", box);
    if (!card) { return; }
    if (!keepMs) { card.remove(); return; }
    card.classList.add("jc-ended");
    setTimeout(function () { if (card.isConnected && !jcRunning) { card.remove(); } }, keepMs);
  }
  // The card: the working day (of about how many), the date, the time, what is happening.
  function jcLocale() { return { de: "de-DE", es: "es-ES", fr: "fr-FR" }[typeof LANG === "string" ? LANG : "en"] || "en-US"; }
  function jcCard(box, J, a, c, ended, last) {
    var card = el(".v3-jc", box);
    if (!card) {
      card = document.createElement("div");
      card.className = "v3-jc";
      card.setAttribute("role", "status");
      card.innerHTML = '<div class="jc-top"><span class="jc-day"></span><span class="jc-wx"></span></div><div class="jc-when"></div><div class="jc-say"></div>';
      box.appendChild(card);
    }
    var seg = a.seg, day = seg.day, date = new Date(J.start.getTime() + c * 1000);
    var loc = jcLocale();
    var when = date.toLocaleDateString(loc, { weekday: "short", month: "short", day: "numeric" }) + " · " +
               date.toLocaleTimeString(loc, { hour: "numeric", minute: "2-digit" });
    var says = ended ? jcDone(J) : jcSays(seg, (c % JC_DAY) / 3600);
    var head = ended ? say("jc_done_head", {}) : say("jc_day", { n: day, d: J.D });
    if (!ended) { card.classList.remove("jc-ended"); }
    var text = head + "|" + when + "|" + says + "|" + seg.wx;
    if (text === last.text) { return; }
    last.text = text;
    el(".jc-day", card).textContent = head;
    el(".jc-when", card).textContent = ended ? date.toLocaleDateString(loc, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : when;
    el(".jc-say", card).textContent = says;
    if (last.wx !== seg.wx) {
      last.wx = seg.wx;
      var wx = el(".jc-wx", card);
      wx.innerHTML = JC_WX_ICON[seg.wx] ? '<svg viewBox="0 0 20 20" aria-hidden="true">' + JC_WX_ICON[seg.wx] + "</svg>" : "";
      wx.title = TXT["jc_wx_" + seg.wx] || "";
      wx.setAttribute("aria-label", TXT["jc_wx_" + seg.wx] || "");
    }
  }
  function jcSays(seg, h) {
    if (seg.state === "jc_inspect" || seg.state === "jc_fail") { return say(seg.state, { what: TXT[seg.say] || "" }); }
    if (seg.state === "jc_night" || seg.state === "jc_home") { return h >= 15.5 && h < 17 ? TXT.jc_home : TXT.jc_night; }
    return TXT[seg.state] || TXT.jc_work;
  }
  function jcDone(J) {
    var st = J.stats, weeks = Math.max(1, Math.round((J.end / JC_DAY) / 7));
    var out = say("jc_done", { days: Math.max(1, st.days - st.lost), weeks: weeks });
    if (st.lost) { out += " " + say("jc_done_lost", { n: st.lost }); }
    if (st.insp) { out += " " + say(st.failed ? "jc_done_insp_fail" : "jc_done_insp", { n: st.insp, f: st.failed }); }
    return out;
  }
  // plain line pictures of the weather (black-and-white icons: the palette's own color)
  var JC_WX_ICON = {
    clear: '<circle cx="10" cy="10" r="3.6"/><path d="M10 2.4v2M10 15.6v2M2.4 10h2M15.6 10h2M4.6 4.6l1.4 1.4M14 14l1.4 1.4M4.6 15.4 6 14M14 6l1.4-1.4"/>',
    cloudy: '<path d="M5.4 15.2h9a3.2 3.2 0 0 0 .3-6.4 4.6 4.6 0 0 0-8.9 1.2 2.6 2.6 0 0 0-.4 5.2z"/>',
    drizzle: '<path d="M5.4 12.2h9a3 3 0 0 0 .3-6 4.4 4.4 0 0 0-8.5 1.1 2.5 2.5 0 0 0-.8 4.9z"/><path d="M7.4 14.6l-.4 1.2M11.4 14.6l-.4 1.2"/>',
    rain: '<path d="M5.4 11.6h9a3 3 0 0 0 .3-6 4.4 4.4 0 0 0-8.5 1.1 2.5 2.5 0 0 0-.8 4.9z"/><path d="M6.6 13.8l-.9 2.6M10 13.8l-.9 2.6M13.4 13.8l-.9 2.6"/>',
    storm: '<path d="M5.4 11h9a3 3 0 0 0 .3-6 4.4 4.4 0 0 0-8.5 1.1A2.5 2.5 0 0 0 5.4 11z"/><path d="M10.6 11.6 8.6 14.6h2.4l-1.6 3"/>',
    snow: '<path d="M5.4 11.4h9a3 3 0 0 0 .3-6 4.4 4.4 0 0 0-8.5 1.1 2.5 2.5 0 0 0-.8 4.9z"/><path d="M7 14.4v2.4M5.8 15.6h2.4M12.6 14.4v2.4M11.4 15.6h2.4"/>',
    wind: '<path d="M2.6 8.2h9.2a2.2 2.2 0 1 0-2.2-2.2M2.6 11.4h12.6a2.4 2.4 0 1 1-2.4 2.4M2.6 14.6h6"/>'
  };
  // Rain and snow, drawn over the view while the day's weather is so -- the site's own, not the
  // weather setting's (which would make the whole scene again, each day).
  var jcWxNow = null;
  function jcWeather(box, wx) {
    var wet = wx === "drizzle" || wx === "rain" || wx === "storm" || wx === "snow";
    var cv = el(".v3-jcwx", box);
    if (!wet || (typeof STILL !== "undefined" && STILL)) { if (cv) { cv.remove(); } jcWxNow = null; return; }
    if (jcWxNow && jcWxNow.wx === wx && cv) { return; }
    if (!cv) {
      cv = document.createElement("canvas");
      cv.className = "v3-jcwx";
      cv.setAttribute("aria-hidden", "true");
      var after = el(".v3-bar", box);
      box.insertBefore(cv, after || box.firstChild);
    }
    var rnd = gl3Rand(23), n = wx === "drizzle" ? 140 : wx === "snow" ? 220 : wx === "storm" ? 520 : 360, drops = [];
    for (var i = 0; i < n; i++) { drops.push({ x: rnd(), y: rnd(), s: 0.6 + rnd() * 0.8, p: rnd() * 6.28 }); }
    var me = jcWxNow = { wx: wx, cv: cv, drops: drops, t0: performance.now() };
    (function frame(now) {
      if (jcWxNow !== me || !cv.isConnected) { return; }
      var dpr = window.devicePixelRatio || 1, W = Math.max(1, box.clientWidth), H = Math.max(1, box.clientHeight);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      var g = cv.getContext("2d"), t = (now - me.t0) / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      if (wx === "snow") {
        g.fillStyle = "rgba(245,248,252,0.85)";
        drops.forEach(function (d) {
          var y = ((d.y + t * 0.06 * d.s) % 1) * H, x = ((d.x + Math.sin(t * 0.8 + d.p) * 0.01) % 1) * W;
          g.beginPath(); g.arc(x, y, 1.2 + d.s, 0, 6.283); g.fill();
        });
      } else {
        g.strokeStyle = wx === "drizzle" ? "rgba(205,215,228,0.35)" : "rgba(200,212,228,0.5)";
        g.lineWidth = wx === "storm" ? 1.3 : 1;
        g.beginPath();
        var len = wx === "drizzle" ? 8 : 16, fall = wx === "storm" ? 1.6 : 1.1, lean = wx === "storm" ? 0.35 : 0.12;
        drops.forEach(function (d) {
          var y = ((d.y + t * fall * d.s) % 1) * H, x = ((d.x + t * 0.05) % 1) * W;
          g.moveTo(x, y); g.lineTo(x - len * lean, y + len);
        });
        g.stroke();
      }
      requestAnimationFrame(frame);
    })(performance.now());
  }
