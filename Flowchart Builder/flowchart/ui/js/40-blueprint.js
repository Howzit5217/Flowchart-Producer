// ---------------------------------------------------------------------------
//  40-blueprint.js -- a building just made, put on the paper the way a
//  chart is: the lot ruled first, each room's walls drawn on at one pen
//  speed in turn, its doors and windows set in, its furniture brought in
//  room by room, the view held still; and in 3D, the first time it is
//  looked at, built: the walls going up out of the ground course by
//  course under scaffolding, the builders at work round it (a crane by a
//  tower), the roof going on last.  A press, a key or the wheel finishes
//  either.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "update the so when building the house
  // blueprints there is a neat animation like the flowchart one and to also
  // have one where there are people like building the house for the 3d one
  // too")
  var BP_PEN = 2600;                         // px of the paper a second a wall is drawn at
  var BP_EASY = 1800, BP_CAP = 3200;         // ms a drawing may take, and about the most it takes
  var bpPending = null, bpRun = null, bpFresh = null;
  function bpStill() {
    return (typeof STILL !== "undefined" && STILL) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  // A building made (any Start building, Change this house): what it made, to draw in.
  if (typeof STARTER_WRAPS === "object") {
    STARTER_WRAPS.unshift(function* (inner, want) {
      var before = hand.next, out = yield* inner(want);
      if (hand.nodes.some(function (n) { return n.id >= before && n.kind === "i_room"; })) {
        bpPending = { from: before };
        bpFresh = { from: before, type: (want && want.type) || "house" };
      }
      return out;
    });
  }

  // ---- on the paper ------------------------------------------------------------------------------
  // The order: the lot and the floors' frames, then the rooms by where they
  // are (top to bottom, left to right, a floor at a time), then what is set
  // in their walls, then what stands in them, a room at a time.
  // (a big building -- past BP_MANY pieces -- swept on in one stroke, the
  // whole drawing at once: thousands of pieces each with an entrance of
  // its own made the page work out every one's look again, half a second
  // on a block of flats)
  var BP_MANY = 1200;
  function bpPlan(from) {
    var P = FLOOR_PX, made = hand.nodes.filter(function (n) { return n.id >= from; });
    if (!made.length) { return null; }
    if (made.length > BP_MANY) { return { sweep: true, total: 1300 }; }
    var rooms = made.filter(function (n) { return n.kind === "i_room"; });
    rooms.sort(function (a, b) { return Math.round((a.y - a.h / 2) / (2 * P)) - Math.round((b.y - b.h / 2) / (2 * P)) || a.x - b.x; });
    var steps = [];
    made.forEach(function (n) { if (n.kind === "i_lot" || n.kind === "i_floor") { steps.push({ n: n, how: "wipe", len: Math.max(n.w, n.h) }); } });
    rooms.forEach(function (r) { steps.push({ n: r, how: "wipe", len: r.w + r.h }); });
    var inWall = made.filter(function (n) { return WALK_DOORS[n.kind] || n.kind === "i_window" || SNAP_IN_WALL[n.kind]; });
    inWall.forEach(function (n) { steps.push({ n: n, how: "pop", len: 0 }); });
    var placed = {};
    inWall.forEach(function (n) { placed[n.id] = true; });
    steps.forEach(function (s) { placed[s.n.id] = true; });
    rooms.forEach(function (r) {
      made.forEach(function (n) {
        if (placed[n.id] || n.kind === "i_room" || !insideArea(r, n.x, n.y)) { return; }
        placed[n.id] = true;
        steps.push({ n: n, how: "pop", len: 0, room: r.id });
      });
    });
    made.forEach(function (n) { if (!placed[n.id]) { steps.push({ n: n, how: "pop", len: 0 }); } });
    // its times: walls at the pen's speed, the rest in a wave behind them --
    // the whole of it hurried to fit, the longest drawing about BP_CAP
    var wallMs = 0, pops = 0;
    steps.forEach(function (s) { if (s.how === "wipe") { s.dur = Math.max(140, s.len / BP_PEN * 1000); wallMs += s.dur * 0.55; } else { pops++; } });
    var full = wallMs + pops * 18 + 400, want = full <= BP_EASY ? full : BP_EASY + (BP_CAP - BP_EASY) * (1 - BP_EASY / full);
    var k = want / full, t = 0, out = {};
    steps.forEach(function (s) {
      if (s.how === "wipe") { out[s.n.id] = { at: t, dur: s.dur * Math.max(0.35, k), how: "wipe" }; t += s.dur * 0.55 * k; }
      else { out[s.n.id] = { at: t, dur: 300, how: "pop" }; t += 18 * k; }
    });
    return { steps: out, total: t + 400 };
  }
  // Put on each drawing of the paper while it is going (a drag or a hover
  // draws it all again: each piece carries on from where it had got to).
  function bpApply() {
    var R = bpRun;
    if (!R) { return; }
    var svg = el("#sheet svg#chart") || el("svg#chart");
    if (!svg) { return; }
    var age = performance.now() - R.start;
    if (age > R.plan.total + 50) { bpRun = null; bpListen(false); return; }
    if (R.plan.sweep) {
      // (a sheet of paper's own color drawn off it from the left: one
      // piece moving, not the thousands under it -- an entrance on the
      // drawing's whole layer made the page restyle all of it)
      var cur = el(".bp-curtain", svg);
      if (!cur) {
        cur = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        cur.setAttribute("class", "bp-curtain");
        cur.setAttribute("width", "100%"); cur.setAttribute("height", "100%");
        cur.setAttribute("fill", (typeof style === "object" && style.sheet) || "#ffffff");
        cur.setAttribute("pointer-events", "none");
        svg.appendChild(cur);
      }
      cur.style.setProperty("--bp-delay", -age.toFixed(0) + "ms");
      return;
    }
    all(".node[data-i]", svg).forEach(function (g) {
      var id = +String(g.dataset.i || "").replace(/^h/, ""), s = R.plan.steps[id];
      if (!s) { return; }
      g.classList.remove("born");
      if (age > s.at + s.dur + 30) { g.classList.remove("bp-wipe", "bp-pop"); return; }
      g.classList.add(s.how === "wipe" ? "bp-wipe" : "bp-pop");
      g.style.setProperty("--bp-delay", (s.at - age).toFixed(0) + "ms");
      g.style.setProperty("--bp-dur", s.dur.toFixed(0) + "ms");
    });
    // (the arrows between, faded in as the rooms they join are there)
    all(".link[data-link]", svg).forEach(function (g) { g.classList.remove("born"); });
  }
  function bpEnd() {
    if (!bpRun) { return; }
    bpRun = null;
    bpListen(false);
    var svg = el("svg#chart");
    if (svg) {
      all(".bp-wipe, .bp-pop", svg).forEach(function (g) { g.classList.remove("bp-wipe", "bp-pop"); });
      all(".bp-curtain", svg).forEach(function (c) { c.remove(); });
    }
  }
  function bpStop(ev) { if (ev && ev.type === "keydown" && /^(Shift|Control|Alt|Meta)$/.test(ev.key)) { return; } bpEnd(); }
  function bpListen(on) {
    var how = on ? "addEventListener" : "removeEventListener";
    document[how]("pointerdown", bpStop, true);
    document[how]("keydown", bpStop, true);
    document[how]("wheel", bpStop, { capture: true, passive: true });
  }
  if (typeof drawHand === "function") {
    var drawHandBlue = drawHand;
    drawHand = function () {
      // (a building just made comes in as a whole, below: not as thousands
      // of pieces "just put down", each line of them measured to be drawn on
      // -- half a second on a block of flats -- 26-motion.js)
      if (bpPending && !(typeof starterQuiet === "number" && starterQuiet > 0) && typeof handSeen !== "undefined") { handSeen = null; }
      var out = drawHandBlue.apply(this, arguments);
      try {
        if (bpPending && !(typeof starterQuiet === "number" && starterQuiet > 0)) {
          var plan = bpStill() ? null : bpPlan(bpPending.from);
          bpPending = null;
          if (plan) { bpRun = { start: performance.now(), plan: plan }; bpListen(true); setTimeout(function () { if (bpRun && bpRun.plan === plan) { bpEnd(); } }, plan.total + 80); }
        }
        bpApply();
      } catch (e) { bpRun = null; }
      return out;
    };
  }

  // ---- in 3D: built ------------------------------------------------------------------------------
  var BP_BUILD = 6500, BP_BUILD_TALL = 9000;       // ms the building takes to go up
  var bpSite = null;                               // the building going up: when it began, how tall
  function bpSiteNow() {
    if (!bpSite || !V3) { return null; }
    var t = (performance.now() - bpSite.start) / bpSite.ms;
    if (t >= 1) { bpSite = null; V3.dirty = true; return null; }
    return t;
  }
  if (typeof v3Open === "function") {
    var v3OpenBuilt = v3Open;
    v3Open = function () {
      var was = typeof V3 !== "undefined" ? V3 : null, out = v3OpenBuilt.apply(this, arguments);
      try {
        if (V3 && V3 !== was && bpFresh && V3.scene !== "space" && !bpStill() && !(typeof v3Big === "function" && v3Big())) {
          var tall = bpFresh.type === "tower" || bpFresh.type === "apartments" || bpFresh.type === "office";
          bpFresh = null;
          // (the house's own rise from the paper, 38-view3d.js, given over to this)
          if (V3.tw) { delete V3.tw.rise; }
          V3.rise = 1;
          bpGo(tall, 500);
        } else if (V3 && V3 !== was) { bpFresh = null; }
      } catch (e) { bpSite = null; }
      return out;
    };
  }
  // It going up, from the ground: stopped by a press on the view or a key.
  function bpGo(tall, wait) {
    bpSite = { start: performance.now() + (wait || 0), ms: tall ? BP_BUILD_TALL : BP_BUILD, tall: tall };
    var box = V3.box, me = bpSite;
    var stop = function () { if (bpSite === me) { bpSite = null; } if (V3) { V3.dirty = true; } box.removeEventListener("pointerdown", stop, true); document.removeEventListener("keydown", stop, true); };
    box.addEventListener("pointerdown", stop, true);
    document.addEventListener("keydown", stop, true);
    (function tick() {
      if (bpSite !== me || !V3 || V3.box !== box) { stop(); return; }
      V3.dirty = true;
      requestAnimationFrame(tick);
    })();
  }
  // (my own, 2026-10-03) Watched again, whenever asked: the view's button.
  function bpWatch() {
    if (!V3 || V3.scene === "space" || (typeof v3Big === "function" && v3Big())) { return; }
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, b) { return b.id - a.id; });
    var type = marks.length ? marks[0].madeWith.type || "house" : "house";
    if (V3.tw) { delete V3.tw.rise; }
    V3.rise = 1;
    bpGo(type === "tower" || type === "apartments" || type === "office", 150);
  }
  if (typeof V3_GROUPS !== "undefined") { V3_GROUPS[4].unshift("watch"); }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.watch = '<path d="M4 17.4V3.4h10.4M4 5.6l3.4-2.2M14.4 3.4v3.4"/><rect x="11.8" y="6.8" width="5.2" height="3.6" rx=".6"/><path d="M2.6 17.4h14.8M8 17.4v-4.4h4v4.4"/>';
  }
  function bpButton() {
    if (!V3 || !V3.box || V3.scene === "space") { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar || el('[data-v3="watch"]', bar)) { return; }
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn small";
    b.dataset.v3 = "watch";
    b.textContent = TXT.bp_watch;
    b.title = TXT.bp_watch_tip;
    b.setAttribute("aria-label", TXT.bp_watch_tip);
    b.hidden = typeof v3Big === "function" && v3Big();
    b.onclick = function (ev) { ev.stopPropagation(); bpWatch(); };
    bar.insertBefore(b, el('[data-v3="shut"]', bar));
    if (typeof v3DressBar === "function") { v3DressBar(); }
  }
  if (typeof v3Open === "function") {
    var v3OpenWatch = v3Open;
    v3Open = function () {
      var out = v3OpenWatch.apply(this, arguments);
      try { bpButton(); } catch (e) { /* no button */ }
      return out;
    };
  }
  // Each picture while it goes up: everything over the height reached so
  // far laid down at it (walls cut off there; what is wholly above, not
  // yet there), the roof on at the end; the scaffold at the height it has
  // got to, the builders round it, a crane by a tall one.
  if (typeof v3Build === "function") {
    var v3BuildBuilt = v3Build;
    v3Build = function () {
      var model = v3BuildBuilt.apply(this, arguments);
      var t = bpSiteNow();
      if (t === null || !model || !model.faces) { return model; }
      try { return bpBuilding(model, Math.max(0, t)); } catch (e) { return model; }
    };
  }
  function bpEase(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function bpBuilding(model, t) {
    var P = FLOOR_PX, top = 0, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    model.faces.forEach(function (f) {
      if (!f.pts || (f.how && (f.how.roof || f.roof)) || !f.node || f.node.kind !== "i_room") { return; }
      f.pts.forEach(function (p) { top = Math.max(top, p[2] || 0); });
      if (f.node && f.node.kind === "i_room") { f.pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); }
    });
    if (x0 === Infinity || top <= 0) { return model; }
    var grow = Math.min(1, t / 0.82), cut = top * bpEase(grow), roofOn = Math.max(0, (t - 0.82) / 0.18);
    // (only the building goes up: the trees, the cars, the yard are there)
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; }), ours = new Map();
    function building(n) {
      if (!n) { return true; }
      if (ours.has(n)) { return ours.get(n); }
      var yes = n.kind === "i_room" || !!WALK_DOORS[n.kind] || n.kind === "i_window" || rooms.some(function (r) { return insideArea(r, n.x, n.y); });
      ours.set(n, yes);
      return yes;
    }
    var faces = [];
    model.faces.forEach(function (f) {
      if (!f.pts || !building(f.node)) { faces.push(f); return; }
      var roofy = f.how && (f.how.roof || f.roof);
      if (roofy) {
        if (roofOn <= 0.02) { return; }
        faces.push(roofOn >= 0.98 ? f : Object.assign({}, f, { how: Object.assign({}, f.how, { alpha: roofOn, late: true }) }));
        return;
      }
      var lo = Infinity, hi = -Infinity;
      f.pts.forEach(function (p) { var z = p[2] || 0; if (z < lo) { lo = z; } if (z > hi) { hi = z; } });
      if (lo > cut + 0.5) { return; }                            // not built yet
      if (hi <= cut) { faces.push(f); return; }
      faces.push(Object.assign({}, f, { pts: f.pts.map(function (p) { return [p[0], p[1], Math.min(p[2] || 0, cut)]; }) }));
    });
    var out = Object.assign({}, model, { faces: faces });
    // (those at work and their scaffold: not what the view is fitted to)
    var passing = out.passing = { faces: (model.passing ? model.passing.faces.slice() : []), stand: model.passing ? model.passing.stand.slice() : [] };
    var site = bpSite || { tall: false };
    if (grow < 1) { bpScaffold(passing.faces, x0, x1, y0, y1, cut, P); }
    bpBuilders(passing.faces, x0, x1, y0, y1, t, P);
    if (site.tall) { bpCrane(passing.faces, x0, x1, y0, y1, top, t, P); }
    return out;
  }
  var BP_STEEL = { piece: true, color: "#9aa0a6", edge: "#6b7177", bare: true };
  var BP_PLANK = { piece: true, color: "#b8925e", edge: "#7d6240", bare: true, pat: 21 };
  var BP_YELLOW = { piece: true, color: "#f2c230", edge: "#a8861f", bare: true };
  function bpBox(faces, x, y, hw, hd, z0, z1, how) {
    v3Prism(faces, [[x - hw, y - hd], [x + hw, y - hd], [x + hw, y + hd], [x - hw, y + hd]], z0, z1, how);
  }
  // Poles every two metres a little out from the walls, up past where the
  // walls have got to, and boards round at that height to stand on.
  function bpScaffold(faces, x0, x1, y0, y1, cut, P) {
    var off = 0.7 * P, z1 = cut + 1.0 * P, ring = [[x0 - off, y0 - off], [x1 + off, y0 - off], [x1 + off, y1 + off], [x0 - off, y1 + off]];
    for (var i = 0; i < 4; i++) {
      var a = ring[i], b = ring[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / (2 * P)));
      for (var k = 0; k < n; k++) {
        var x = a[0] + (b[0] - a[0]) * k / n, y = a[1] + (b[1] - a[1]) * k / n;
        bpBox(faces, x, y, 0.03 * P, 0.03 * P, 0, z1, BP_STEEL);
      }
      // the boards, and a rail
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, along = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
      bpBox(faces, mx, my, along ? len / 2 : 0.3 * P, along ? 0.3 * P : len / 2, cut - 0.05 * P, cut, BP_PLANK);
      bpBox(faces, mx, my, along ? len / 2 : 0.02 * P, along ? 0.02 * P : len / 2, z1 - 0.06 * P, z1, BP_STEEL);
    }
  }
  // Builders in hard hats and bright vests, walking the site round the
  // house -- some with a board on the shoulder -- the faster ones further out.
  function bpBuilders(faces, x0, x1, y0, y1, t, P) {
    if (typeof peopleBody !== "function") { return; }
    var fade = t > 0.9 ? Math.max(0, (1 - t) / 0.1) : Math.min(1, t / 0.05 + 0.2), secs = t * 8;
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + 2.4 * P, ry = (y1 - y0) / 2 + 2.4 * P;
    var crew = Math.max(4, Math.min(10, Math.round((rx + ry) / (5 * P))));
    for (var i = 0; i < crew; i++) {
      // round the house on a loop just outside the scaffold, each their own pace and way round
      var way = i % 2 ? 1 : -1, pace = 0.035 + (i % 3) * 0.012, a = i / crew * Math.PI * 2 + way * secs * pace * Math.PI * 2;
      var x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, head = a + way * Math.PI / 2;
      var f0 = faces.length;
      peopleBody(faces, { kind: "i_builder", id: 300 + i }, x, y, 0, head, secs * 7 + i, { own: true, fill: i % 3 ? "#f08a24" : "#d9e84a", line: "#2e3846" }, fade);
      // the hard hat
      var hat = [];
      for (var q = 0; q < 10; q++) { var b = q / 10 * Math.PI * 2; hat.push([x + Math.cos(b) * 0.15 * P, y + Math.sin(b) * 0.15 * P]); }
      v3Prism(faces, hat, 1.66 * P, 1.79 * P, fade < 0.999 ? Object.assign({}, BP_YELLOW, { alpha: fade, late: true }) : BP_YELLOW);
      // and now and then a board carried
      if (i % 3 === 1) {
        var fx = Math.cos(head), fy = Math.sin(head);
        v3Prism(faces, [[x - fx * 1.2 * P - fy * 0.08 * P, y - fy * 1.2 * P + fx * 0.08 * P], [x + fx * 1.2 * P - fy * 0.08 * P, y + fy * 1.2 * P + fx * 0.08 * P],
                        [x + fx * 1.2 * P + fy * 0.08 * P, y + fy * 1.2 * P - fx * 0.08 * P], [x - fx * 1.2 * P + fy * 0.08 * P, y - fy * 1.2 * P - fx * 0.08 * P]],
                1.5 * P, 1.56 * P, fade < 0.999 ? Object.assign({}, BP_PLANK, { alpha: fade, late: true }) : BP_PLANK);
      }
      for (var m = f0; m < faces.length; m++) { faces[m].person = true; }
    }
  }
  // A tower crane at one corner: its mast up past the top, the jib turning.
  function bpCrane(faces, x0, x1, y0, y1, top, t, P) {
    var x = x1 + 4 * P, y = y0 - 3 * P, h = top + 8 * P, mast = 0.9 * P, yellow = Object.assign({}, BP_YELLOW);
    for (var k = 0; k < 4; k++) {
      var sx = k % 2 ? 1 : -1, sy = k < 2 ? 1 : -1;
      bpBox(faces, x + sx * mast / 2, y + sy * mast / 2, 0.06 * P, 0.06 * P, 0, h, yellow);
    }
    for (var z = 2 * P; z < h; z += 3 * P) { bpBox(faces, x, y, mast / 2 + 0.05 * P, mast / 2 + 0.05 * P, z, z + 0.12 * P, yellow); }
    var a = t * Math.PI * 1.2 - 0.6, ux = Math.cos(a), uy = Math.sin(a), jib = 26 * P, tail = 8 * P;
    function arm(len, w, z0, z1, how) {
      var px = -uy, py = ux;
      v3Prism(faces, [[x - ux * tail - px * w, y - uy * tail - py * w], [x + ux * len - px * w, y + uy * len - py * w],
                      [x + ux * len + px * w, y + uy * len + py * w], [x - ux * tail + px * w, y - uy * tail + py * w]], z0, z1, how);
    }
    arm(jib, 0.45 * P, h, h + 0.9 * P, yellow);
    bpBox(faces, x - ux * tail * 0.8, y - uy * tail * 0.8, 1.2 * P, 1.2 * P, h - 1.4 * P, h, { piece: true, color: "#8a8f94", edge: "#5a5f64", bare: true });
    // the hook, out along the jib, on its line
    var hx = x + ux * jib * 0.6, hy = y + uy * jib * 0.6, hz = top * 0.5 + h * 0.3;
    bpBox(faces, hx, hy, 0.02 * P, 0.02 * P, hz, h, BP_STEEL);
    bpBox(faces, hx, hy, 0.6 * P, 0.15 * P, hz - 0.3 * P, hz, BP_PLANK);
  }
