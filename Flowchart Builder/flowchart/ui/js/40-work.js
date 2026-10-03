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
    decor: [6, "wk_decor"], wire: [16, "wk_wire"], arrange: [10, "wk_arrange"], yard: [3, "wk_yard"], draw: [5, "wk_draw"],
    land: [12, "wk_land"], house: [40, "wk_house"], models: [40, "wk_models"], scene: [8, "wk_scene"]
  };
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
                stopped: false, order: opt.stages || [], said: "", drawn: -1, slices: 0, busy: 0, longest: 0 };
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
      if (job.order.indexOf(stage) < 0) { job.order.push(stage); }
    }
    job.part = part;
    var all = 0, gone = 0;
    job.order.forEach(function (s) {
      var w = (WORK_STAGES[s] || [5])[0];
      all += w;
      if (job.done[s]) { gone += w; } else if (s === stage) { gone += w * part; }
    });
    job.at = Math.max(job.at, Math.min(0.99, all ? gone / all : 0));
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
                    '<div class="bb-track"><div class="bb-fill"></div><div class="bb-shine"></div></div>';
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
  }
  function workEnd(job, ok, value) {
    clearTimeout(job.show);
    if (workNow === job) { workNow = null; }
    if (job.veil) { job.veil.remove(); }
    var box = job.box;
    // the paper drawn, now, with all of it
    if (job.opt.quiet && typeof starterQuiet === "number") {
      if (ok && box) {
        job.at = 0.99; job.stage = "draw"; workPaint(job);
      }
      starterQuiet = Math.max(0, starterQuiet - 1);
      if (!starterQuiet) {
        if (job.stopped) { starterOwed = {}; }
        try { starterSettle(); } catch (e) { /* drawn as it can be */ }
      }
    }
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
    if (!job || job.stopped) { return; }
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
    stages.push("arrange", "yard", "draw");
    return workLive(gen, {
      quiet: true, stages: stages,
      putBack: function () {
        hand = JSON.parse(keep);
        if (undoAt >= 0 && wasLike.length > undoAt) { wasLike.length = undoAt; if (typeof showUndo === "function") { showUndo(); } }
        if (typeof tieSeen !== "undefined") { tieSeen = { H: null, key: null, J: null }; }
        picked = null; chosen = null; many = [];
      }
    });
  }
  function starterMakeLive(want) { return starterLive(starterSteps(want), want); }

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
