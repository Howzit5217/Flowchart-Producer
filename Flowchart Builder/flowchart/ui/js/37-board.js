// ---------------------------------------------------------------------------
//  37-board.js -- what a drawing is, and Run running it as that
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ================================================= what is on the paper ==
  // Drawn by hand, the paper used to hold one kind of thing: a flowchart,
  // which Run runs as a program.  With the icons (03-icon-art.js) it can
  // hold a home seen from above, the people in a kitchen and who passes
  // what to whom, a network, a circuit, the planets.  None of those is a
  // program, and every one of them can still be run -- as what it is
  // (asked for, 2026-10-01: "it can tell what you are making like a home
  // interior ... and it will update the run command to adapt").
  //
  // So the drawing is read for what it is made of, every time it changes,
  // and Run says what it will do and does it:
  //
  //   a program      Run                  -- the program, as always
  //   a floor plan   Walk through         -- somebody walks it, room by
  //                                          room, using what is there
  //                                          (38-walk.js), in 3D if asked
  //                                          (38-view3d.js)
  //   people         Pass the work on     -- the work goes from hand to
  //                                          hand along the arrows, each
  //                                          doing their part (39-flows.js)
  //   a network      Send data            -- packets from every device to
  //                                          the servers and back
  //   travel         Drive                -- the vehicles go their routes
  //   a circuit      Switch on            -- worked out, and lit (39-circuit.js)
  //   space          Launch               -- orbits, and the rocket's trip
  //                                          (39-orbit.js)
  //   anything else  Follow the arrows    -- along them, shape by shape
  //
  // The list beside Run says what the drawing was read as, and can be told
  // otherwise.  What each one does when run, and what Check says about it,
  // is the part named beside it, each filling in SCENES.
  var SCENES = {};                       // name -> { run, check, sum, tidy }
  var BOARD_ORDER = ["home", "circuit", "space", "network", "city", "team", "flow"];
  var BOARD_OF_SET = { ic_people: "team", ic_rooms: "home", ic_living: "home", ic_bedroom: "home",
                       ic_kitchen: "home", ic_bath: "home", ic_decor: "home", ic_walls: "home",
                       ic_tech: "home", ic_outdoor: "home", ic_devices: "network",
                       ic_circuit: "circuit", ic_travel: "city", ic_space: "space",
                       ic_things: "flow" };
  // Shapes that are a note beside a drawing as often as a part of it, and
  // say nothing about what it is.
  var BOARD_NEUTRAL = { text: true, note: true, callout: true, i_zone: true };
  var boardChoice = "auto";              // or one of the names, said in the list
  try { boardChoice = sessionStorage.getItem("flowchart-board") || "auto"; }
  catch (e) { boardChoice = "auto"; }

  // What one shape says the drawing is.  An astronaut is somebody, and is
  // in space; a person drawn as the Person shape is somebody.
  function boardVotes(n) {
    if (BOARD_NEUTRAL[n.kind]) { return []; }
    if (n.kind === "i_astronaut") { return ["team", "space"]; }
    if (n.kind === "actor") { return ["team"]; }
    if (ICONS[n.kind]) { return [BOARD_OF_SET[ICON_SET_OF[n.kind]] || "flow"]; }
    return ["program"];
  }

  function boardTally() {
    var t = { program: 0 };
    BOARD_ORDER.forEach(function (name) { t[name] = 0; });
    hand.nodes.forEach(function (n) {
      boardVotes(n).forEach(function (name) { t[name] += 1; });
    });
    return t;
  }

  // What the drawing is, of itself: a program while the flowchart's own
  // shapes outnumber the icons -- a flowchart with a person drawn beside
  // it is still a flowchart -- and otherwise whatever most of its icons
  // are, the earlier in BOARD_ORDER winning a tie (a home with people in
  // it is a home they walk through).
  function boardGuess() {
    var t = boardTally(), best = null;
    BOARD_ORDER.forEach(function (name) {
      if (t[name] && (!best || t[name] > t[best])) { best = name; }
    });
    var icons = hand.nodes.filter(function (n) {
      return boardVotes(n).some(function (v) { return v !== "program"; });
    }).length;
    if (!icons || t.program > icons) { return "program"; }
    // things alone (money, a parcel, a clock) are only followed along
    // their arrows once nothing more particular is there
    if (best === "flow") {
      BOARD_ORDER.forEach(function (name) {
        if (name !== "flow" && t[name] && best === "flow") { best = name; }
      });
    }
    return best || "program";
  }

  var boardSeen = { key: null, name: "program" };
  // The name of what the drawing is being run as: what it was told, or
  // what it reads as.  "program" is the program, as before.
  function boardName() {
    if (!byHand || !hand.nodes.length) { return "program"; }
    // a flowchart is a program, whatever pictures are beside it; a design
    // is never one (39-design.js)
    var made = typeof makingNow === "function" ? makingNow() : "";
    var key = made + "|" + boardChoice + "|" + hand.links.length + "|" +
              hand.nodes.map(function (n) { return n.kind; }).join(",");
    if (boardSeen.key !== key) {
      var name = made === "flowchart" ? "program" : boardChoice !== "auto" ? boardChoice : boardGuess();
      if (made === "design" && (name === "program" || !SCENES[name])) { name = "flow"; }
      boardSeen = { key: key, name: SCENES[name] || name === "program" ? name : "program" };
    }
    return boardSeen.name;
  }

  // The scene the drawing is run as, or null when it is a program.
  function boardNow() {
    var name = boardName();
    return name === "program" ? null : SCENES[name] ? { name: name, is: SCENES[name] } : null;
  }

  // ---- a flowchart with pictures beside it ---------------------------------
  // An icon standing on its own beside a flowchart -- nobody's arrow in or
  // out of it -- is a picture of what the flowchart is about, not a step of
  // it; and a container drawn round some of the steps is a frame.  Neither
  // is asked about, written, or run.
  function decorOf() {
    var joined = {}, out = {};
    hand.links.forEach(function (l) { joined[l.from] = joined[l.to] = true; });
    hand.nodes.forEach(function (n) {
      if (ICONS[n.kind] && (ICONS[n.kind].area || !joined[n.id])) { out[n.id] = true; }
    });
    return out;
  }
  function withoutDecor(fn) {
    var decor = decorOf();
    if (!Object.keys(decor).length) { return fn(); }
    var every = hand.nodes;
    hand.nodes = every.filter(function (n) { return !decor[n.id]; });
    try { return fn(); } finally { hand.nodes = every; }
  }

  // =================================================== running a scene ==
  // A run of a scene is like a run of a program: Run says Stop while it
  // goes, the pace beside it is kept to (All at once, Slowly, A step at a
  // time with Next, or its own time), the tape says what happened, and the
  // shapes it is at light up the way a program's do (.now).  What moves
  // about -- somebody walking, a parcel, a packet, a rocket -- is drawn
  // over the paper in a layer of its own (.sim-layer), which nothing is
  // saved from and which goes when the run does.
  function SimStop() {}
  var simNow = null;                     // the run going now, if one is
  var simReach = null;                   // paper a run needs past the shapes (drawHand)

  function simPace() { return el("#r-pace") ? el("#r-pace").value : "slow"; }
  function simFast() { return !simNow || simPace() === "fast"; }

  function simFrame(fn) {
    // A hidden page gets no frames (the pane this was built in, mostly):
    // a timer keeps the run going all the same.
    if (document.visibilityState === "visible") { requestAnimationFrame(fn); }
    else { setTimeout(fn, 33); }
  }

  // Waiting, the way a run waits: no time at all All at once, and given
  // up the moment Stop is pressed.
  function simWait(ms) {
    var my = simNow;
    if (!my || my.stopping) { return Promise.reject(new SimStop()); }
    if (simFast()) { return Promise.resolve(); }
    return new Promise(function (go, fail) {
      var t = setTimeout(done, ms);
      my.wake = done;
      function done() {
        clearTimeout(t);
        if (my.wake === done) { my.wake = null; }
        if (my.stopping || simNow !== my) { fail(new SimStop()); } else { go(); }
      }
    });
  }

  // A step at a time: Next, and nothing goes on until it is pressed.
  function simStep() {
    var my = simNow;
    if (!my || my.stopping) { return Promise.reject(new SimStop()); }
    if (simPace() !== "press") { return Promise.resolve(); }
    showNext(true);
    return new Promise(function (go, fail) {
      stepOn = function () {
        stepOn = null;
        showNext(false);
        if (my.stopping || simNow !== my) { fail(new SimStop()); } else { go(); }
      };
    });
  }

  // `frame` called with how far along it is, 0 to 1, for `ms` -- or once,
  // at 1, where nothing is to be seen moving (All at once, or a system
  // asked to keep still).
  function simAnimate(ms, frame) {
    var my = simNow;
    if (!my || my.stopping) { return Promise.reject(new SimStop()); }
    if (simFast() || STILL || ms <= 0) { simKeep(); frame(1); return Promise.resolve(); }
    return new Promise(function (go, fail) {
      var t0 = performance.now();
      function tick() {
        if (simNow !== my || my.stopping) { fail(new SimStop()); return; }
        simKeep();
        var t = Math.min(1, (performance.now() - t0) / ms);
        try { frame(t); } catch (e) { fail(e); return; }
        if (t >= 1) { go(); return; }
        simFrame(tick);
      }
      simFrame(tick);
    });
  }

  // Going on by itself until Stop: a circuit switched on, planets going
  // round.  `frame(dt, seconds)` -- dt in seconds since the last frame.
  function simLoop(frame) {
    var my = simNow;
    if (!my || my.stopping) { return Promise.reject(new SimStop()); }
    return new Promise(function (go, fail) {
      var t0 = performance.now(), last = t0;
      function tick() {
        if (simNow !== my || my.stopping) { fail(new SimStop()); return; }
        simKeep();
        var now = performance.now(), dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        var more;
        try { more = frame(STILL ? 0 : dt, (now - t0) / 1000); } catch (e) { fail(e); return; }
        if (more === false) { go(); return; }
        simFrame(tick);
      }
      simFrame(tick);
    });
  }

  // The layer things move about in, over the paper, in the drawing's own
  // numbers.  Drawn again -- a shape moved while it runs, the paper grown
  // -- the chart is a new one, and the layer is put back on it, along with
  // the shapes that were lit.
  function simLayer() {
    if (!simNow) { return null; }
    simKeep();
    return simNow.layer;
  }
  function simKeep() {
    var my = simNow;
    if (!my || !chart) { return; }
    if (!my.layer) {
      my.layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      my.layer.setAttribute("class", "sim-layer");
      my.layer.setAttribute("pointer-events", "none");
    }
    if (my.layer.ownerSVGElement !== chart) { chart.appendChild(my.layer); my.litOn = null; }
    my.layer.setAttribute("transform", "translate(" + handOrigin.x + "," + handOrigin.y + ")");
    if (my.litOn !== chart) {
      my.litOn = chart;
      Object.keys(my.lit).forEach(function (id) { simMark(id, my.lit[id]); });
    }
  }
  function simMark(id, how) {
    var g = el('.node[data-i="h' + id + '"]', chart);
    if (!g) { return; }
    g.classList.remove("now", "sim-used", "sim-off");
    if (how) { g.classList.add(how); }
  }
  // A shape lit (`how` "now", the run's own light), marked as used, put
  // out of sight while a copy of it moves (sim-off) -- or let go of.
  function simLight(id, how) {
    if (!simNow) { return; }
    if (how) { simNow.lit[id] = how === true ? "now" : how; } else { delete simNow.lit[id]; }
    simMark(id, simNow.lit[id]);
  }

  // Something drawn into the layer, by its markup; handed back, to be
  // moved about (simPut) and taken away.
  function simAdd(markup, cls) {
    var layer = simLayer();
    if (!layer) { return null; }
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    if (cls) { g.setAttribute("class", cls); }
    g.innerHTML = markup;
    layer.appendChild(g);
    return g;
  }
  function simPut(g, x, y, turn, scale) {
    if (!g) { return; }
    g.setAttribute("transform", "translate(" + (Math.round(x * 10) / 10) + "," + (Math.round(y * 10) / 10) + ")" +
                   (turn ? " rotate(" + Math.round(turn) + ")" : "") + (scale && scale !== 1 ? " scale(" + scale + ")" : ""));
  }

  // The colors a moving copy is drawn in: the paper's and the ink's, as
  // the shapes are, since paint() does not reach into the layer.
  function simInk() { return style.ink || "#10151b"; }
  function simSheet() { return style.sheet || "#ffffff"; }

  // A shape's own colors, as the paper shows them: its own, else its
  // kind's (kindColors, 02-paint.js), else the paper's and the ink's.
  function simLook(n) {
    var mine = (n && style.nodes["h" + n.id]) || {}, k = n ? kindColors(n.kind) : {};
    return { fill: mine.fill || k.fill || simSheet(), line: mine.line || k.line || simInk() };
  }

  // An icon, `size` across, round 0,0, to be moved about in the layer --
  // in the colors `look` gives it (simLook), or the paper's.
  function simIcon(kind, size, w, h, look) {
    var icon = ICONS[kind];
    if (!icon) { return ""; }
    if (!icon.fig && w === undefined) {
      var s = size / Math.max(icon.box[0], icon.box[1]);
      w = icon.box[0] * s; h = icon.box[1] * s;
    }
    var fill = (look && look.fill) || simSheet(), line = (look && look.line) || simInk();
    var art = iconArt(kind, 0, 0, w || size, h || size, fill)
      .replace(/class="inked" fill="#000000"/g, 'class="inked" fill="' + line + '"')
      .replace(/<text[\s\S]*?<\/text>/g, "");
    return '<g stroke="' + line + '" stroke-width="1.3" stroke-linecap="round" ' +
           'stroke-linejoin="round" fill="none">' + art + "</g>";
  }

  // A few words over something, in a bubble, for a while.
  function simBubble(x, y, words, ms) {
    var pen = measure.pen || (measure.pen = document.createElement("canvas").getContext("2d"));
    pen.font = "12px " + (FACES[lettersOf().face] || FACES.sans);
    var w = Math.ceil(pen.measureText(words).width) + 14, h = 20;
    var g = simAdd('<path class="sim-bubble" d="M' + (-w / 2) + " " + (-h - 7) + " h" + w + " v" + h +
                   " h" + (-w / 2 + 6) + " l-6 6 l-6 -6 h" + (-w / 2 + 6) + ' z" fill="' + simSheet() +
                   '" stroke="' + simInk() + '" stroke-width="1.1"/>' +
                   '<text x="0" y="' + (-h / 2 - 3) + '" text-anchor="middle" font-size="12" ' +
                   'fill="' + simInk() + '" stroke="none">' + escaped(words) + "</text>", "sim-say");
    simPut(g, x, y);
    if (ms && g) {
      setTimeout(function () { if (g.parentNode) { g.parentNode.removeChild(g); } }, simFast() ? 0 : ms);
    }
    return g;
  }

  function simDrop(g) { if (g && g.parentNode) { g.parentNode.removeChild(g); } }

  // Where along a list of points a point is, `t` of the way by length.
  function simAlong(pts, t) {
    if (!pts || !pts.length) { return { x: 0, y: 0, a: 0 }; }
    if (pts.length === 1) { return { x: pts[0][0], y: pts[0][1], a: 0 }; }
    var len = 0, legs = [];
    for (var i = 1; i < pts.length; i++) {
      var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      legs.push(d); len += d;
    }
    var want = Math.max(0, Math.min(1, t)) * len;
    for (var k = 0; k < legs.length; k++) {
      if (want <= legs[k] || k === legs.length - 1) {
        var f = legs[k] ? Math.min(1, want / legs[k]) : 1, a = pts[k], b = pts[k + 1];
        return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f,
                 a: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI };
      }
      want -= legs[k];
    }
    var end = pts[pts.length - 1];
    return { x: end[0], y: end[1], a: 0 };
  }
  function simLength(pts) {
    var len = 0;
    for (var i = 1; i < (pts || []).length; i++) {
      len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    }
    return len;
  }

  // The way an arrow is drawn, in the drawing's numbers: the corners
  // routeAll found for it, or straight across where it has none.
  function simRoute(link) {
    var at = hand.links.indexOf(link), routes = routeAll();
    var pts = at >= 0 && routes[at];
    if (pts && pts.length > 1) { return pts.map(function (p) { return [p[0], p[1]]; }); }
    var a = nodeById(link.from), b = nodeById(link.to);
    return a && b ? [[a.x, a.y], [b.x, b.y]] : [];
  }

  // The name a shape goes by in what the run says: its words, or what it is.
  function simName(n) {
    var said = String((n && n.text) || "").replace(/\s+/g, " ").trim();
    return said || (n ? kindName(n.kind) : "?");
  }

  function simSay(what, how) { if (simNow) { talk(what, how); } }

  async function sceneRun(scene) {
    if (simNow) { simStopNow(); return; }
    if (running) { return; }
    var my = simNow = { scene: scene, lit: {}, layer: null, stopping: false, wake: null };
    document.body.classList.add("simulating");
    markFault(null);
    freshTape();
    tapeSays("bd_" + scene.name, TXT["bd_" + scene.name] || scene.name, "");
    runSays(TXT.r_stop);
    simKeep();
    var broke = false;
    try {
      await scene.is.run();
    } catch (thrown) {
      if (!(thrown instanceof SimStop)) {
        broke = true;
        talk(String(thrown && thrown.message ? thrown.message : thrown), "bad");
        if (typeof console !== "undefined") { console.error(thrown); }
      }
    } finally {
      if (simNow === my) { simEnd(); }
      if (!broke) { talk(TXT.r_done, "good"); }
    }
  }

  // Everything the run put on the paper taken off it again, and the
  // shapes it lit put out.
  function simEnd() {
    var my = simNow;
    if (!my) { return; }
    if (my.ending) { my.ending(); }
    simNow = null;
    if (stepOn) { var go = stepOn; stepOn = null; try { go(); } catch (e) { /* gone */ } }
    showNext(false);
    if (my.layer && my.layer.parentNode) { my.layer.parentNode.removeChild(my.layer); }
    all(".node.now, .node.sim-used, .node.sim-off", chart).forEach(function (g) {
      g.classList.remove("now", "sim-used", "sim-off");
    });
    document.body.classList.remove("simulating");
    if (simReach) { simReach = null; if (byHand) { drawHand(); } }
    runSays(TXT.r_run);
    dressBoard();
  }

  function simStopNow() {
    var my = simNow;
    if (!my) { return; }
    my.stopping = true;
    if (my.wake) { my.wake(); }
    if (stepOn) { stepOn(); }
    // A run waiting on nothing -- one that only goes round -- is let go
    // of here rather than at its next frame, in case it never gets one.
    setTimeout(function () { if (simNow === my) { simEnd(); } }, 400);
  }

  // =================================================== the run's buttons ==
  // Run, the note under it, and the list of what the drawing is, kept in
  // step with the drawing (handChanged, every time it is drawn) and with
  // the way of working (by hand or not).
  function dressBoard() {
    var pick = el("#r-board"), view = el("#view3d-open");
    var scene = boardNow();
    if (pick) {
      var guess = byHand && hand.nodes.length ? boardGuess() : "program";
      var auto = pick.querySelector('option[value="auto"]');
      if (auto) { auto.textContent = say("bd_auto_is", { what: TXT["bd_" + guess] || guess }); }
      if (pick.value !== boardChoice) { pick.value = boardChoice; }
    }
    if (view) { view.hidden = !(scene && (scene.name === "home" || scene.name === "space")); }
    var runs = all("#run, #tape-run");
    if (simNow) {
      // running: Stop is always there to be pressed, whatever a redraw on
      // the way said about there being no program to run
      runs.forEach(function (b) { b.disabled = false; });
      if (el("#run-note")) { el("#run-note").textContent = ""; }
      return;
    }
    if (running) { return; }
    if (byHand && scene) {
      runs.forEach(function (b) { b.disabled = false; b.textContent = TXT["go_" + scene.name] || TXT.r_run; });
      var says = el("#run-note");
      if (says) { says.textContent = scene.is.note ? scene.is.note() : ""; }
    } else {
      runs.forEach(function (b) {
        // with a puzzle open, Run is what marks it, and says Check (28-puzzles.js)
        var word = b.id === "run" && onPuzzle ? (TXT.pz_check || "Check") : TXT.r_run;
        if (b.textContent !== word) { b.textContent = word; }
      });
    }
  }

  if (el("#r-board")) {
    el("#r-board").onchange = function () {
      boardChoice = el("#r-board").value;
      try { sessionStorage.setItem("flowchart-board", boardChoice); } catch (e) { /* this visit */ }
      boardSeen.key = null;
      if (simNow) { simStopNow(); }
      forgetProgram();                   // read again, as whatever it is now
      if (typeof handWas !== "undefined") { handWas = null; }
      if (byHand) { drawHand(); showReport(); readHandSoon(); }
    };
  }

  // Run runs the scene, where there is one; Stop stops it.  The handlers
  // already on the two buttons are kept for everything else -- the
  // program, and a puzzle's marking (28-puzzles.js).
  ["#run", "#tape-run"].forEach(function (which) {
    var b = el(which);
    if (!b) { return; }
    var before = b.onclick;
    b.onclick = function (ev) {
      if (simNow) { simStopNow(); return; }
      var scene = byHand && !onPuzzle && boardNow();
      if (scene) { sceneRun(scene); return; }
      return before ? before.call(this, ev) : undefined;
    };
  });
  // and anything else that runs by calling runIt (a menu, a saved run)
  var runIfProgram = runIt;
  runIt = function () {
    var scene = byHand && !quiet && !onPuzzle && boardNow();
    if (simNow) { simStopNow(); return Promise.resolve(); }
    if (scene && !running) { return sceneRun(scene); }
    return runIfProgram.apply(this, arguments);
  };

  var dressRunnerUnboarded = dressRunner;
  dressRunner = function () {
    dressRunnerUnboarded.apply(this, arguments);
    dressBoard();
  };

  // A drawing that is a scene is not read as a program at all -- not
  // read in Python, not written into the pseudocode on leaving the tab --
  // and Check says what the scene's own check says.
  var readyHandUnboarded = readyHandProgram;
  readyHandProgram = function (how) {
    if (byHand && boardNow()) {
      if (AST) { forgetProgram(); }
      handWas = null;
      dressRunner();
      return;
    }
    // (its checking and its writing leave the pictures out themselves:
    // the design's key it is read under is the whole drawing's)
    return readyHandUnboarded(how);
  };

  var handChangedUnboarded = handChanged;
  handChanged = function () {
    handChangedUnboarded.apply(this, arguments);
    dressBoard();
  };

  var checkUnboarded = checkDesign;
  checkDesign = function (leaveOut) {
    var scene = byHand && boardNow();
    if (scene) {
      // what is wrong with it, then what would make it better (38-advice.js)
      var said = (scene.is.check ? scene.is.check(leaveOut) : []).concat(boardAdvice());
      return said.map(function (bit) {
        return { text: bit.text, id: bit.id || null, key: bit.key || "s_scene",
                 warn: bit.warn !== false, fix: bit.fix || null };
      });
    }
    return withoutDecor(function () { return checkUnboarded(leaveOut); });
  };

  var handAsUnboarded = handAsPseudocode;
  handAsPseudocode = function () {
    return withoutDecor(function () { return handAsUnboarded(); });
  };

  // What Check says about a scene: its findings, as a design's are, and
  // over them a line saying what it is and how much of it there is.
  var showReportUnboarded = showReport;
  showReport = function () {
    showReportUnboarded.apply(this, arguments);
    var scene = byHand && boardNow(), box = el("#report");
    if (!scene || !box || !scene.is.sum) { return; }
    var line = document.createElement("p");
    line.className = "good scene-sum";
    line.textContent = scene.is.sum();
    box.insertBefore(line, box.firstChild);
    // nothing found: the design's "no problems" under the summary says it
  };

  if (typeof handToPseudo === "function") {
    var handToPseudoUnboarded = handToPseudo;
    handToPseudo = function () {
      if (byHand && boardNow()) { return Promise.resolve(false); }   // a home has no pseudocode
      return handToPseudoUnboarded.apply(this, arguments);
    };
  }

  var dropRunUnboarded = dropRun;
  dropRun = function () {
    if (simNow) { simStopNow(); simEnd(); }
    return dropRunUnboarded.apply(this, arguments);
  };

  // ---- Tidy up, for what it is -----------------------------------------
  // Tidy up lays a flowchart out the way its pseudocode is laid out, which
  // a floor plan or a sky has none of: those were put where they are on
  // purpose, and are left there.  People, a network, anything joined by
  // arrows, are laid out in rows instead -- whoever the arrows start from
  // at the top, each the row below the one before it -- the way an
  // organisation chart is.
  if (el("#hand-tidy")) {
    var tidyUnboarded = el("#hand-tidy").onclick;
    el("#hand-tidy").onclick = function (ev) {
      var scene = byHand && boardNow();
      if (!scene) { return tidyUnboarded ? tidyUnboarded.call(this, ev) : undefined; }
      if (scene.name === "home" || scene.name === "space" ||
          hand.nodes.some(function (n) { return isArea(n.kind); })) {
        handSays(TXT.bd_tidy_kept, true);
        return;
      }
      boardTidy();
    };
  }

  function boardTidy() {
    var nodes = hand.nodes.slice();
    if (!nodes.length) { return; }
    var outs = {}, ins = {};
    nodes.forEach(function (n) { outs[n.id] = []; ins[n.id] = []; });
    hand.links.forEach(function (l) {
      if (outs[l.from] && ins[l.to] && l.from !== l.to) { outs[l.from].push(l.to); ins[l.to].push(l.from); }
    });
    // Rows by the longest way in from a start, an arrow back up (a loop)
    // not counted.
    var row = {}, state = {}, order = [];
    function visit(id) {                 // depth first, marking the arrows back
      state[id] = 1;
      outs[id].forEach(function (to) { if (!state[to]) { visit(to); } });
      state[id] = 2;
      order.push(id);
    }
    var starts = nodes.filter(function (n) { return !ins[n.id].length; });
    (starts.length ? starts : [nodes[0]]).forEach(function (n) { if (!state[n.id]) { visit(n.id); } });
    nodes.forEach(function (n) { if (!state[n.id]) { visit(n.id); } });
    order.reverse();                     // each before everything it leads to
    var at = {};
    order.forEach(function (id, k) { at[id] = k; });
    order.forEach(function (id) {
      row[id] = row[id] || 0;
      outs[id].forEach(function (to) {
        if (at[to] > at[id]) { row[to] = Math.max(row[to] || 0, row[id] + 1); }
      });
    });
    var rows = [];
    order.forEach(function (id) { (rows[row[id]] = rows[row[id]] || []).push(id); });
    // Each row in the order of the middles of what leads into it, twice
    // over, so lines cross as little as they can.
    var place = {};
    rows.forEach(function (ids, r) { ids.forEach(function (id, k) { place[id] = k; }); });
    for (var sweep = 0; sweep < 2; sweep++) {
      rows.forEach(function (ids, r) {
        if (!r) { return; }
        ids.sort(function (p, q) {
          function mid(id) {
            var from = ins[id].filter(function (f) { return row[f] < r; });
            if (!from.length) { return place[id]; }
            return from.reduce(function (s, f) { return s + place[f]; }, 0) / from.length;
          }
          return mid(p) - mid(q);
        });
        ids.forEach(function (id, k) { place[id] = k; });
      });
    }
    var GAP_X = 50, GAP_Y = 70, top = 60, before = tidyLook();
    keepUndo();
    var widest = 0;
    rows.forEach(function (ids) {
      var w = ids.reduce(function (s, id) { return s + turned(nodeById(id)).w; }, 0) + GAP_X * (ids.length - 1);
      widest = Math.max(widest, w);
    });
    rows.forEach(function (ids) {
      var w = ids.reduce(function (s, id) { return s + turned(nodeById(id)).w; }, 0) + GAP_X * (ids.length - 1);
      var x = 60 + (widest - w) / 2, tall = 0;
      ids.forEach(function (id) {
        var n = nodeById(id), t = turned(n);
        n.x = Math.round((x + t.w / 2) / HAND_GRID) * HAND_GRID;
        n.y = Math.round((top + t.h / 2) / HAND_GRID) * HAND_GRID;
        x += t.w + GAP_X;
        tall = Math.max(tall, t.h);
      });
      top += tall + GAP_Y;
    });
    glideHeld++;
    try { drawHand(); } finally { glideHeld--; }
    drawHandPanel();
    tidyMotion(before, order, "fore");
    showReport();
    handSays(say("h_tidied", { n: nodes.length }));
  }

  // The scene's own way of saying what it is: shown under Run before it
  // is run, and as the summary over what Check finds.  The parts that
  // follow fill in SCENES; dressed once they all have.
  setTimeout(dressBoard, 0);
