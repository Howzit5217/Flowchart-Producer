// ---------------------------------------------------------------------------
//  40-work.js -- long work done a slice at a time, the page answering in
//  between: a building made (Start building), the house put up in 3D;
//  the same bar over the paper a long flowchart has, and a Stop on it
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "whenever I hit make it can you update it so it
  // does not freeze the whole site", "when hitting the 3d button also stop
  // the website from freezing and have it show that same progress bar")
  //
  // The work is steps (a generator: starterWork, 39-starter.js, and what
  // other parts wrap round it); each says what it is doing and how far
  // along it is (yield [stage, part]).  Here they are run for about a
  // frame's worth of time, then the page is let go -- to paint, to move the
  // bar, to hear the Stop -- and run on.  The paper is drawn once, at the
  // end.  Stopped, the drawing is put back as it was before.
  var WORK_SLICE = 12;                   // ms of work between the page's turns
  var WORK_SHOW = 250;                   // ms before the bar comes up at all
  // How much of the whole each stage is, roughly, and what the bar says meanwhile.
  var WORK_STAGES = {
    plan: [4, "wk_plan"], furnish: [40, "wk_furnish"], extras: [7, "wk_extras"], windows: [9, "wk_windows"],
    decor: [6, "wk_decor"], wire: [16, "wk_wire"], arrange: [10, "wk_arrange"], yard: [3, "wk_yard"], tidy: [14, "wk_tidy"], draw: [5, "wk_draw"],
    land: [12, "wk_land"], house: [40, "wk_house"], models: [40, "wk_models"], scene: [8, "wk_scene"]
  };
  // (asked for, 2026-11-12: "shows proper and accurate loading times and a time for how long or what
  // time things will be finished generating at as a rough guess")  How long each kind of work took
  // here before -- the whole of it, and each stage's share -- kept in the browser, so the bar moves on
  // at the pace the time goes, and says how long it has been, about how long is left and when it will
  // be done.  The first time, a guess from how big it is (opt.guess), made right for this computer by
  // how the guesses before came out (`speed`).
  var WORK_TIMES = "flowchart-work-times";
  var workTimes = null;
  function workTimesNow() {
    if (workTimes) { return workTimes; }
    try { workTimes = JSON.parse(localStorage.getItem(WORK_TIMES) || "null"); } catch (e) { workTimes = null; }
    if (!workTimes || typeof workTimes !== "object" || !workTimes.kinds) { workTimes = { speed: 1, kinds: {} }; }
    return workTimes;
  }
  function workTimesKeep() {
    try {
      var T = workTimesNow(), names = Object.keys(T.kinds);
      // (the most recent forty kinds kept)
      if (names.length > 40) { names.sort(function (a, b) { return (T.kinds[a].when || 0) - (T.kinds[b].when || 0); }).slice(0, names.length - 40).forEach(function (k) { delete T.kinds[k]; }); }
      localStorage.setItem(WORK_TIMES, JSON.stringify(T));
    } catch (e) { /* this visit only */ }
  }
  // m:ss (h:mm:ss over an hour)
  function workClock(ms) {
    var s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }
  // the time of day it will be in `ms`: to the minute -- to the second when that is soon
  function workAt(ms) {
    var when = new Date(Date.now() + ms), loc = { de: "de-DE", es: "es-ES", fr: "fr-FR" }[typeof LANG === "string" ? LANG : ""] || undefined;
    var soon = ms < 3 * 60 * 1000, how = soon ? { hour: "numeric", minute: "2-digit", second: "2-digit" } : { hour: "numeric", minute: "2-digit" };
    when = new Date(Math.round(when.getTime() / (soon ? 5000 : 60000)) * (soon ? 5000 : 60000));   // (a guess: to five seconds, or the minute)
    try { return when.toLocaleTimeString(loc, how); } catch (e) { return when.toTimeString().slice(0, ms < 600000 ? 8 : 5); }
  }
  var workNow = null, workLast = null;   // the work under way, if any; and the last (how it went)
  var workTurn = (function () {          // the page's next turn, soon: a message, not a 4 ms timer
    try {
      var ch = new MessageChannel(), waiting = [];
      ch.port1.onmessage = function () { var fn = waiting.shift(); if (fn) { fn(); } };
      return function (fn) { waiting.push(fn); ch.port2.postMessage(0); };
    } catch (e) { return function (fn) { setTimeout(fn, 0); }; }
  })();

  // Run steps a slice at a time.  opt: { stages: [what it will do, in order],
  // put back: a function that undoes it, on Stop; quiet: hold the paper's
  // drawing until done }.  The first slice runs at once (what it reads, it
  // reads now).
  function workLive(gen, opt) {
    opt = opt || {};
    if (workNow) { workStop(workNow); }
    var job = { gen: gen, opt: opt, t0: performance.now(), at: 0, done: {}, stage: null, part: 0, box: null,
                stopped: false, order: opt.stages || [], said: "", drawn: -1, slices: 0, busy: 0, longest: 0,
                kind: opt.kind || null, guess: opt.guess || 0, marks: [], timeSaid: "" };
    // how it went last time, here: the whole, and each stage's share of it
    var past = job.kind ? workTimesNow().kinds[job.kind] : null;
    if (past && past.ms > 0 && past.share && job.order.every(function (s) { return past.share[s] !== undefined; })) { job.hist = past; }
    workNow = workLast = job;
    if (opt.quiet && typeof starterQuiet === "number") { starterQuiet++; }
    job.show = setTimeout(function () { workShow(job); }, WORK_SHOW);
    return new Promise(function (resolve) {
      job.resolve = resolve;
      workSlice(job);
    });
  }
  function workSlice(job) {
    if (job.stopped) { return; }
    var t0 = performance.now(), r = { done: false }, paintFirst = false;
    try {
      while (true) {
        r = job.gen.next();
        if (r.done) { break; }
        workSaw(job, r.value);
        // (a step that will take a while in one piece -- the 3D view's
        // shaders, made the first time -- asks for the bar to be up first)
        if (r.value && r.value[2] === "paint" && !job.painted) { job.painted = paintFirst = true; break; }
        if (performance.now() - t0 > WORK_SLICE) { break; }
      }
    } catch (e) {
      if (window.console && console.error) { console.error("work stopped by a fault:", e); }
      workEnd(job, false);
      return;
    }
    var took = performance.now() - t0;
    job.slices++; job.busy += took; job.longest = Math.max(job.longest, took);
    if (r.done) { workEnd(job, true, r.value); return; }
    if (paintFirst) {
      if (!job.box) { clearTimeout(job.show); workShow(job); }
      var went = false, go = function () { if (!went) { went = true; workSlice(job); } };
      requestAnimationFrame(function () { setTimeout(go, 0); });
      setTimeout(go, 150);             // (a hidden page paints nothing: on anyway)
      return;
    }
    workPaint(job);
    workTurn(function () { workSlice(job); });
  }
  // How far along: the stages done, and this one's part, out of all.
  function workSaw(job, said) {
    if (!said || !said[0]) { return; }
    var stage = said[0], part = Math.max(0, Math.min(1, +said[1] || 0));
    if (stage !== job.stage) {
      if (job.stage) { job.done[job.stage] = true; }
      job.stage = stage;
      if (job.order.indexOf(stage) < 0) { job.order.push(stage); if (job.hist && job.hist.share[stage] === undefined) { job.hist = null; } }
      job.marks.push([stage, performance.now() - job.t0]);
    }
    job.part = part;
    var all = 0, gone = 0, H = job.hist;
    job.order.forEach(function (s) {
      // (each stage as long as it took last time, where that is known: the bar at the pace of the time)
      var w = H ? H.share[s] * 100 + 0.2 : (WORK_STAGES[s] || [5])[0];
      all += w;
      if (job.done[s]) { gone += w; } else if (s === stage) { gone += w * part; }
    });
    job.at = Math.max(job.at, Math.min(0.99, all ? gone / all : 0));
  }
  // About how long is left: what it took before (or the guess, made right for this computer), and the
  // pace so far, the more of it done the more the pace counts -- counted down as shown, not jumping about.
  function workLeft(job) {
    var now = performance.now(), el = now - job.t0, at = job.at;
    var prior = job.hist ? job.hist.ms : job.guess ? job.guess * workTimesNow().speed : 0;
    var byPace = at > 0.03 && el > 400 ? el / at : 0, total;
    if (prior && byPace) { var w = Math.min(0.85, at * 1.3); total = prior * (1 - w) + byPace * w; }
    else { total = prior || byPace; }
    if (!total) { return null; }
    var left = Math.max(0, total - el);
    if (job.left !== undefined && job.left !== null) {
      // (eased toward the new guess over most of a second, however often the bar is painted)
      var shown = Math.max(0, job.left - (now - job.leftAt));
      left = shown + (left - shown) * (1 - Math.exp(-(now - job.leftAt) / 700));
    }
    job.left = Math.max(left, 250 * (1 - at)); job.leftAt = now;
    return job.left;
  }
  function workShow(job) {
    if (job.stopped || job !== workNow || job.box) { return; }
    var V = typeof V3 !== "undefined" && V3 && V3.box && document.body.contains(V3.box) ? V3.box : null;
    var stage = el("#stage"), host = V || (stage && stage.parentNode);
    if (!host) { return; }
    var old = el("#build-bar");
    if (old) { old.remove(); }
    var box = document.createElement("div");
    box.id = "build-bar";
    box.className = "work-bar";
    box.setAttribute("role", "progressbar");
    box.setAttribute("aria-valuemin", "0");
    box.setAttribute("aria-valuemax", "100");
    box.innerHTML = '<div class="bb-top"><span class="bb-said"></span><span class="bb-pct"></span>' +
                    '<button type="button" class="work-stop"></button></div>' +
                    '<div class="bb-track"><div class="bb-fill"></div><div class="bb-shine"></div></div>' +
                    '<div class="bb-time" aria-live="off"><span class="bb-gone"></span><span class="bb-left"></span></div>';
    var stop = el(".work-stop", box);
    stop.textContent = TXT.wk_stop;
    stop.onclick = function () { workStop(job); };
    host.appendChild(box);
    // nothing else to be done on the paper meanwhile: a veil over it
    var veil = document.createElement("div");
    veil.className = "work-veil";
    host.appendChild(veil);
    job.box = box; job.veil = veil;
    workPaint(job);
  }
  function workPaint(job) {
    var box = job.box;
    if (!box) { return; }
    var key = (WORK_STAGES[job.stage] || [0, "wk_plan"])[1], said = TXT[key] || "";
    if (said !== job.said) { el(".bb-said", box).textContent = said; job.said = said; }
    var pct = Math.floor(job.at * 100);
    if (pct !== job.drawn) {
      el(".bb-pct", box).textContent = pct + "%";
      el(".bb-fill", box).style.transform = "scaleX(" + job.at.toFixed(3) + ")";
      el(".bb-shine", box).style.clipPath = "inset(0 " + ((1 - job.at) * 100).toFixed(1) + "% 0 0)";
      box.setAttribute("aria-valuenow", String(pct));
      box.setAttribute("aria-label", said);
      job.drawn = pct;
    }
    // how long it has been, and about how long more (once there has been a second of it to go by)
    var since = performance.now() - job.t0;
    if (since > 900) {
      var left = job.settling ? null : workLeft(job), gone = workClock(since), more = "";
      if (left !== null && job.at < 0.995) {
        more = left < 1500 ? TXT.wk_nearly : say("wk_left", { t: workClock(left), at: workAt(left) });
      } else if (job.settling) { more = TXT.wk_nearly; }
      else if (left === null) { more = TXT.wk_guessing; }
      var line = gone + "|" + more;
      if (line !== job.timeSaid) {
        job.timeSaid = line;
        el(".bb-gone", box).textContent = gone;
        el(".bb-left", box).textContent = more;
        box.classList.add("timed");
        if (more) { box.setAttribute("aria-valuetext", pct + "% · " + more); }
      }
    }
  }
  function workEnd(job, ok, value) {
    clearTimeout(job.show);
    var box = job.box;
    // the paper drawn, now, with all of it
    if (job.opt.quiet && typeof starterQuiet === "number") {
      if (ok && box) {
        if (job.stage !== "draw") { job.marks.push(["draw", performance.now() - job.t0]); }
        job.at = 0.99; job.stage = "draw"; workPaint(job);
      }
      starterQuiet = Math.max(0, starterQuiet - 1);
      if (!starterQuiet) {
        if (job.stopped) { starterOwed = {}; }
        // (2026-11-12) a part at a time -- the plan, its panel, the report -- the bar up over the paper
        // and painted between them: a tower's plan drawn and looked over at once was a second and a half
        if (ok && box && typeof starterSettleSteps === "function") {
          job.settling = true;
          var steps = starterSettleSteps();
          var next = function () {
            var r;
            try { r = steps.next(); } catch (e) { r = { done: true }; if (window.console && console.warn) { console.warn("drawing:", e && e.message); } }
            if (r.done) { workFinish(job, ok, value); return; }
            workPaint(job);
            workPaintThen(next);
          };
          workPaintThen(next);
          return;
        }
        try { starterSettle(); } catch (e) { /* drawn as it can be */ }
      }
    }
    workFinish(job, ok, value);
  }
  // fn, once the page has painted (or soon, where a hidden page paints nothing)
  function workPaintThen(fn) {
    var went = false, go = function () { if (!went) { went = true; fn(); } };
    try { requestAnimationFrame(function () { setTimeout(go, 0); }); } catch (e) { /* the timer */ }
    setTimeout(go, 120);
  }
  // How long it took, kept for next time: the whole, each stage's share, and how the guess came out.
  function workRemember(job) {
    if (!job.kind) { return; }
    var total = performance.now() - job.t0;
    if (total < 300) { return; }
    var T = workTimesNow(), was = T.kinds[job.kind], share = {};
    job.marks.forEach(function (m, i) {
      var end = i + 1 < job.marks.length ? job.marks[i + 1][1] : total;
      share[m[0]] = (share[m[0]] || 0) + Math.max(0, end - m[1]) / total;
    });
    job.order.forEach(function (s) { if (share[s] === undefined) { share[s] = 0; } });
    var prior = was ? was.ms : job.guess ? job.guess * T.speed : 0;
    T.kinds[job.kind] = { ms: was ? was.ms * 0.35 + total * 0.65 : total, share: share, n: (was ? was.n || 0 : 0) + 1, when: Date.now() };
    // this computer against the guesses: slower or quicker than they say
    if (job.guess && prior) {
      var ratio = Math.max(0.05, Math.min(20, (total / prior) * T.speed));
      T.speed = Math.max(0.05, Math.min(20, T.speed * 0.6 + ratio * 0.4));
    }
    workTimesKeep();
  }
  function workFinish(job, ok, value) {
    job.settling = false;
    if (workNow === job) { workNow = null; }
    if (job.veil) { job.veil.remove(); }
    var box = job.box;
    if (ok && !job.stopped) { try { workRemember(job); } catch (e) { /* not kept */ } }
    if (job.opt.after) { try { job.opt.after(ok, value); } catch (e) { /* done anyway */ } }
    if (box) {
      if (ok) {
        job.at = 1; workPaint(job);
        box.classList.add("full");
        setTimeout(function () { box.classList.add("going"); }, 260);
        setTimeout(function () { box.remove(); }, 520);
      } else { box.remove(); }
    }
    if (job.resolve) { job.resolve(ok ? value : undefined); }
  }
  function workStop(job) {
    if (!job || job.stopped || job.settling) { return; }      // (all made: only being drawn now)
    job.stopped = true;
    try { job.gen.return(); } catch (e) { /* stopped where it stood */ }
    if (job.opt.putBack) { try { job.opt.putBack(); } catch (e) { /* as it is */ } }
    workEnd(job, false);
    if (typeof handSaysSoft === "function") { handSaysSoft(TXT.wk_stopped); }
  }
  // Esc, while work is under way, is Stop; nothing else reaches the page.
  document.addEventListener("keydown", function (ev) {
    if (!workNow || !workNow.box) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); workStop(workNow); }
    ev.stopPropagation();
  }, true);

  // ---- a building, made a slice at a time --------------------------------------------------------
  // Stopped part way, the drawing goes back to what it was, and the step
  // for Undo the making put down is taken off again.
  function starterLive(gen, want) {
    var keep = JSON.stringify(hand), undoAt = typeof wasLike === "object" && wasLike ? wasLike.length : -1;
    var stages = ["plan", "furnish", "extras", "windows", "decor"];
    if (!want || want.wire) { stages.push("wire"); }
    stages.push("arrange");
    if (!(want && want.services === "diy") && !window.CL_OFF) { stages.push("tidy"); }
    stages.push("yard", "draw");
    var size = starterHowBig(want);
    // (2026-11-12) The making one step to Undo: the drawing as it was kept once, when it begins
    // (starterWork), and not again by each thing put right on the way (40-clean.js, 40-mep.js) -- each
    // of those had kept the whole drawing, a tower's dozens of times, and Undo went back to the last.
    var undoWas = typeof keepUndo === "function" ? keepUndo : null, undoKept = false, undoOnce = null;
    if (undoWas) {
      undoOnce = function () { if (undoKept) { return undefined; } undoKept = true; return undoWas.apply(this, arguments); };
      keepUndo = undoOnce;
    }
    function undoBack() { if (undoOnce && keepUndo === undoOnce) { keepUndo = undoWas; } }
    return workLive(gen, {
      quiet: true, stages: stages, kind: size.kind, guess: size.guess,
      after: undoBack,
      putBack: function () {
        undoBack();
        hand = JSON.parse(keep);
        if (undoAt >= 0 && wasLike.length > undoAt) { wasLike.length = undoAt; if (typeof showUndo === "function") { showUndo(); } }
        if (typeof tieSeen !== "undefined") { tieSeen = { H: null, key: null, J: null }; }
        picked = null; chosen = null; many = [];
      }
    });
  }
  function starterMakeLive(want) { return starterLive(starterSteps(want), want); }
  // How big a building will be, before it is made: its rooms, as the sheet sketches them -- what kind
  // of work it is, for the times kept (the type, how many rooms to the nearest power of two, what it is
  // made with), and a first guess at how long it takes on a computer as quick as the one the guess was
  // measured on (WORK_PER_ROOM: headless Edge on a laptop, 2026-11-12, every building type).
  var WORK_PER_ROOM = [9, 1.18];         // ms = 9 * rooms ^ 1.18, more or less
  function starterHowBig(want) {
    var rooms = 0;
    try {
      if (want && typeof starterSketch === "function") { starterSketch(want).forEach(function (f) { rooms += f.rooms.length; }); }
    } catch (e) { rooms = 0; }
    if (!rooms) { rooms = 12; }
    var type = (want && want.type) || "house", bits = [type, Math.round(Math.log(rooms) / Math.LN2)];
    if (want) { bits.push(want.wire ? "w" : "", want.services === "diy" ? "d" : "", want.floors || "", want.storeys || "", want.mallFloors || ""); }
    return { rooms: rooms, kind: "make:" + bits.join(":"), guess: Math.round(WORK_PER_ROOM[0] * Math.pow(rooms, WORK_PER_ROOM[1])) + 250 };
  }

  // ---- the paper held back while a house is made ----------------------------------------------------
  // (drawn once at the end by starterSettle, 39-starter.js: each part that
  // wraps the making drew it again for itself, a quarter of a second a time
  // on a big house)
  ["drawHand", "drawHandPanel", "showReport"].forEach(function (name) {
    var was = { drawHand: drawHand, drawHandPanel: drawHandPanel, showReport: showReport }[name];
    if (typeof was !== "function") { return; }
    var held = function () {
      if (typeof starterQuiet === "number" && starterQuiet > 0) { starterOwed[name] = true; return undefined; }
      return was.apply(this, arguments);
    };
    if (name === "drawHand") { drawHand = held; } else if (name === "drawHandPanel") { drawHandPanel = held; } else { showReport = held; }
  });
  if (typeof handKeep === "function") {
    var handKeepWork = handKeep;
    handKeep = function () {
      if (typeof starterQuiet === "number" && starterQuiet > 0) { starterOwed.keep = true; return undefined; }
      return handKeepWork.apply(this, arguments);
    };
  }
