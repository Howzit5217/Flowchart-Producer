// ---------------------------------------------------------------------------
//  40-works-jobs.js -- the jobs on the building site, first to last: the
//  crew arriving, the corners staked out, the ground dug (a basement's pit
//  by the excavator, loading the lorries that take the earth away), the
//  footings and the foundation walls formed and poured (the pump's boom
//  over them, the mixers feeding it), the slab -- and the timber delivered,
//  the telehandler taking it off the lorry.  The framing and the roof:
//  40-works-frame.js; closing it in, the inside, moving in, clearing up:
//  40-works-finish.js.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  var WK_CONC = { piece: true, color: "#b9b6ae", edge: "#8d8a83", pat: 10 };
  var WK_WET = { piece: true, color: "#8f8c86", edge: "#76736d", pat: 10 };
  var WK_FORM = { piece: true, color: "#a9824f", edge: "#76592f", bare: true, pat: 21 };
  var WK_PLY = { piece: true, color: "#c98f3a", edge: "#9a6a2a", pat: 21 };
  var WK_DIRT = { piece: true, color: "#7d6849", edge: "#5d4c34", bare: true, pat: 30 };
  var WK_STRING = { piece: true, color: "#f25f3a", edge: "#f25f3a", bare: true };
  var WK_STEELY = { piece: true, color: "#9aa0a6", edge: "#6b7177", bare: true, pat: 22 };
  var WK_PAINT = ["#e05a2a", "#2f5d8a", "#d9dcdf", "#3f7a4a", "#b83a2c", "#f2f2ee"];

  // ---- the job site's own sums ----------------------------------------------------------------------
  function jbJ(plan) {
    if (plan.J) { return plan.J; }
    var site = plan.site, ctx = site.ctx, P = site.P, S = site.S;
    var J = plan.J = { plan: plan, site: site, ctx: ctx, P: P, S: S, levels: site.levels, g: site.ground };
    J.base = site.levels[0] && site.levels[0].z < -1 ? 0 : -1;
    J.box = [ctx.x0, ctx.x1, ctx.y0, ctx.y1];
    J.frame = ctx.frame;
    J.area = (ctx.x1 - ctx.x0) * (ctx.y1 - ctx.y0) / (P * P);
    J.rnd = wkRand(Math.round(Math.abs(ctx.cx) * 3 + Math.abs(ctx.cy) * 7) + 17);
    return J;
  }
  function jbLocal(J, p) { return J.S.L(p[0], p[1]); }
  function jbWorld(J, l, z) { var w = J.S.W(l[0], l[1]); return [w[0], w[1], z || 0]; }
  // a clear patch of the lot (lot-local), near `near`, kept clear of the
  // building by `gap` -- marked as taken (what is stacked there)
  function jbSpot(J, wm, hm, near, gap) {
    var site = J.site, P = J.P, G = site.G, best = null, hw = wm * P / 2, hh = hm * P / 2, g = (gap === undefined ? 1.2 : gap) * P;
    for (var r = 0; r < 60 * P && !best; r += 0.5 * P) {
      var steps = Math.max(1, Math.round(2 * Math.PI * r / (0.5 * P)));
      for (var k = 0; k < steps && !best; k++) {
        var a = k / steps * Math.PI * 2, x = near[0] + Math.cos(a) * r, y = near[1] + Math.sin(a) * r;
        if (wkRectFree(site, x, y, hw + g, hh + g, 0, [WK_LOT, WK_PAVED], null) || (g > 0 && wkRectFree(site, x, y, hw + 0.3 * P, hh + 0.3 * P, 0, [WK_LOT, WK_PAVED], null) && r > 20 * P)) {
          best = [x, y];
        }
      }
    }
    if (!best) { best = [near[0], near[1]]; }
    site.mark([[best[0] - hw, best[1] - hh], [best[0] + hw, best[1] - hh], [best[0] + hw, best[1] + hh], [best[0] - hw, best[1] + hh]].map(function (q) { return J.S.W(q[0], q[1]); }), WK_STACK);
    return { l: best, w: jbWorld(J, best, 0), hw: hw, hh: hh };
  }
  // a vehicle's coming, its staying, its going (40-works.js wkArrive / wkLeave)
  function jbCome(plan, m, stand, len, tReady, opt) {
    opt = opt || {};
    var site = plan.site, P = site.P, way = wkArrive(site, stand, len), speed = (opt.speed || 6) * P, slow = 2.0 * P;
    var tf = way.fwd.len / speed + 2, tb = way.back ? way.back.len / slow + 2 : 0, t0 = tReady - tb - tf;
    function put(pose, extra) { return Object.assign({ x: pose.x, y: pose.y, ang: pose.ang, tang: pose.tang, site: site }, extra || {}); }
    var x0 = opt.extra || {};
    wkMSeg(m, t0, t0 + tf, function (k) { return put(wkPoseOn(way.fwd, way.fwd.len * wkEaseDrive(k), false), Object.assign({ moving: true }, x0)); });
    if (way.back) { wkMSeg(m, t0 + tf, tReady, function (k) { return put(wkPoseOn(way.back, way.back.len * wkSmooth(k), true), Object.assign({ moving: true, reversing: true }, x0)); }); }
    m.stand = stand; m.len = len; m.here = tReady; m.arrived = tReady;
    return t0;
  }
  function jbStay(m, t0, t1, fn) {
    var st = m.stand;
    wkMSeg(m, t0, t1, function (k, T) { return Object.assign({ x: st.x, y: st.y, ang: st.ang, site: m.site }, fn ? fn(k, T) : {}); });
  }
  function jbGo(plan, m, t, opt) {
    opt = opt || {};
    var site = plan.site, P = site.P, st = m.stand, away = wkLeave(site, st, m.len), speed = (opt.speed || 6) * P, tl = away.len / speed + 2;
    var x0 = opt.extra || {};
    // (standing there from when it came till it goes)
    if (t > m.here + 0.01) { var hold = m.here; wkMSeg(m, hold, t, function () { return Object.assign({ x: st.x, y: st.y, ang: st.ang, site: site }, x0); }); }
    wkMSeg(m, t, t + tl, function (k) { return Object.assign({ site: site, moving: true }, wkPoseOn(away, away.len * wkEaseDrive(k, true), false), x0); }).gone = true;
    wkReserve(plan, st, (m.arrived === undefined ? m.here : m.arrived) - 1, t + 2);
    return t + tl;
  }
  // a fresh vehicle, coming to a stand found for it near a spot
  function jbVehicle(plan, kind, spec, opt) {
    var m = wkMachine(plan, kind, opt || {});
    m.site = plan.site;
    var stand = wkStand(plan, Object.assign({ kind: kind }, spec));
    m.stand = stand;
    if (spec.t0 !== undefined && spec.t1 !== undefined) { wkReserve(plan, stand, spec.t0, spec.t1); }
    return m;
  }
  // Spots for the crew's pickups on the lot (lot-local stands), backed in, nose to the street:
  // on a drive, just inside the lot, side by side as wide as it is; in a parking lot, a row
  // along its front, a stall apart, each with its way out to the street clear -- drives
  // first, up to `most` of them
  function jbDriveStands(J, most) {
    var site = J.site, P = J.P, S = J.S, out = [], len = 5.7 * P, wid = 2.0 * P;
    // (2026-10-05, "machines clipping into one another": the machines' way onto the lot kept -- a
    // spot taken only if it costs the ground they can get to from the street little more than the
    // pickup's own room; the drive filled, the excavator and the telehandler squeezed past the
    // pickups in it, scraping them)
    var G = site.G, need = Math.ceil(1.75 * P / G.c), gate = wkCell(site, 0, S.kerb + 1.0 * P);
    function reach() {
      if (gate < 0) { return 0; }
      var D = wkVehClear(site), lab = wkParts(site, "veh" + need, function (i) { return D[i] >= need; });
      var c = gate, best = lab[c];
      // (the street in front: its own run of ground, whatever square of it the gate is)
      if (!best) { for (var dx = -40; dx <= 40 && !best; dx++) { var i2 = wkCell(site, dx * G.c, S.kerb + 1.0 * P); if (i2 >= 0 && lab[i2]) { best = lab[i2]; } } }
      if (!best) { return 0; }
      var n = 0;
      for (var i = 0; i < lab.length; i++) { if (lab[i] === best && G.t[i] !== WK_ROAD && G.t[i] !== WK_WALKWAY && G.t[i] !== WK_OFF) { n++; } }
      return n;
    }
    var before = reach(), own = Math.ceil((len / G.c + 2 * need) * (wid / G.c + 2 * need) * 1.6);
    function keepsWay(st) {
      var c = Math.cos(st.ang), s2 = Math.sin(st.ang), hl = len / 2, hw = wid / 2, cells = [], G2 = site.G;
      // (put there for a moment, the ground measured, then as it was)
      var x0 = st.cx - hl - hw, x1 = st.cx + hl + hw, y0 = st.cy - hl - hw, y1 = st.cy + hl + hw;
      for (var y = y0; y <= y1; y += G2.c * 0.5) {
        for (var x = x0; x <= x1; x += G2.c * 0.5) {
          var dx = x - st.cx, dy = y - st.cy, u = dx * c + dy * s2, v = -dx * s2 + dy * c;
          if (Math.abs(u) > hl || Math.abs(v) > hw) { continue; }
          var i = wkCell(site, x, y);
          if (i >= 0 && cells.indexOf(i) < 0) { cells.push(i); }
        }
      }
      var was = cells.map(function (i) { return G2.t[i]; });
      cells.forEach(function (i) { G2.t[i] = WK_CAR; });
      site.gridGen = (site.gridGen || 0) + 1;
      var after = reach();
      cells.forEach(function (i, k) { G2.t[i] = was[k]; });
      site.gridGen++;
      return before - after <= own;
    }
    var areas = hand.nodes.filter(function (d) { return (d.kind === "i_driveway" || d.kind === "i_parking" || d.kind === "i_asphalt") && !cnOurs(J.ctx, d); })
                          .sort(function (a, b) { return (a.kind === "i_driveway" ? 0 : 1) - (b.kind === "i_driveway" ? 0 : 1); });
    areas.forEach(function (d) {
      if (out.length >= most) { return; }
      // (a parking lot or its aisle: one, its way in from the street kept half open for the rest)
      var drive = d.kind === "i_driveway", gap = drive ? 0.5 * P : 0.6 * P, had = out.length;
      var loc = wkNodePoly(d, 0).map(function (p) { return S.L(p[0], p[1]); });
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      loc.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
      // (a drive out to the street in front, and deep enough for one)
      if (drive && y1 < S.hy - 1.0 * P) { return; }
      // (on a drive, set back from the street where the drive is deep enough: a lorry swinging into
      // the kerb in front brushed their noses, 2026-10-05)
      var front = Math.min(y1, S.hy) - (drive ? 1.2 : 0.8) * P, cy = front - len / 2, cols = Math.floor((x1 - x0 - 0.2 * P + gap) / (wid + gap));
      if (drive && cy - len / 2 < y0 - 0.3 * P) { front = Math.min(y1, S.hy) - 0.3 * P; cy = front - len / 2; }
      if (cy - len / 2 < y0 - 0.3 * P || cols < 1) { return; }
      for (var k = 0; k < cols && out.length < most && (drive || out.length === had); k++) {
        var cx = (x0 + x1) / 2 + (k - (cols - 1) / 2) * (wid + gap);
        // (not in the way out of one already put, nor it in the way of this one's: backed in
        // straight from the street, two in one line would be)
        if (out.some(function (o) { return Math.abs(o.cx - cx) < wid + 0.3 * P; })) { continue; }
        if (!wkRectFree(site, cx, cy, len / 2, wid / 2, Math.PI / 2, drive ? [WK_LOT, WK_PAVED, WK_STACK, WK_WALKWAY] : [WK_PAVED], null)) { continue; }
        // (and in a parking lot, nothing between it and the street)
        if (!drive && !wkRectFree(site, cx, (cy + len / 2 + S.kerb) / 2, (S.kerb - cy - len / 2) / 2, wid / 2, Math.PI / 2, [WK_LOT, WK_PAVED, WK_WALKWAY, WK_ROAD], null)) { continue; }
        var cand = { x: cx, y: cy, cx: cx, cy: cy, ang: Math.PI / 2, hl: len / 2 + 0.2 * P, hw: wid / 2 + 0.2 * P, drive: true };
        // (and the machines' way onto the lot left open: those put already counted in)
        own = Math.ceil((len / G.c + 2 * need) * (wid / G.c + 2 * need) * 1.6) * (out.length + 1);
        if (!keepsWay(cand)) { continue; }
        out.push(cand);
        jbMarkCar(J, cand);
      }
    });
    return out;
  }
  // a parked vehicle's squares: not driven through by the others
  // (or, `v`, what its squares are marked instead -- kept for one to come, given back once it has gone)
  function jbMarkCar(J, st, v, only) {
    var S = J.S, P = J.P, c = Math.cos(st.ang), s2 = Math.sin(st.ang), cx = st.cx === undefined ? st.x : st.cx, cy = st.cy === undefined ? st.y : st.cy, hl = 2.9 * P, hw = 1.0 * P;
    J.site.mark([[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]].map(function (q) { return S.W(cx + q[0] * c - q[1] * s2, cy + q[0] * s2 + q[1] * c); }), v === undefined ? WK_CAR : v, only);
  }

  // ---- 1. the crew arrives -----------------------------------------------------------------------------
  WK_PHASES.push({ name: "setup", make: function (plan) {
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, ctx = J.ctx;
    var frame = J.frame, n = frame === "tall" ? 24 : frame === "steel" ? Math.round(Math.max(12, Math.min(22, 10 + J.area / 120))) : Math.round(Math.max(8, Math.min(14, 6 + J.area / 45)));
    J.n = n;
    // a ring round the building kept for the scaffold and the work: walked, not driven
    var hb = [S.box[0] - 2.2 * P, S.box[1] + 2.2 * P, S.box[2] - 2.2 * P, S.box[3] + 2.2 * P];
    for (var r = 0; r < site.G.rows; r++) {
      for (var k = 0; k < site.G.cols; k++) {
        var i = r * site.G.cols + k, v = site.G.t[i];
        if (v !== WK_LOT && v !== WK_PAVED) { continue; }
        var c = wkCellMid(site, i), lx = c[0], ly = c[1];
        if (lx < hb[0] || lx > hb[1] || ly < hb[2] || ly > hb[3]) { continue; }
        // (near a wall of the building: within 2.2 m of one of its squares)
        var near = false;
        for (var dr = -4; dr <= 4 && !near; dr++) {
          for (var dk = -4; dk <= 4 && !near; dk++) {
            var rr = r + dr, kk = k + dk;
            if (rr >= 0 && kk >= 0 && rr < site.G.rows && kk < site.G.cols && site.G.t[rr * site.G.cols + kk] === WK_HOUSE) { near = true; }
          }
        }
        if (near) { site.G.t[i] = WK_STACK; }
      }
    }
    // (2026-10-05: "make it so the trucks can park in the driveway") the crew's pickups on the
    // drive, put there before anything is stacked -- the rest in the parking lots, or along the kerb
    var picks = Math.ceil(n / 3), drives = jbDriveStands(J, picks);
    // (kept for them -- nothing stacked there, nothing standing there -- but driven over till they come:
    // on the kerb while the ground is dug and the foundations go in, onto the drive after, "parkin" below)
    drives.forEach(function (st) { jbMarkCar(J, st, WK_STACK, [WK_CAR]); });
    J.driveStands = drives;
    // where the timber, the blocks and the windows are stacked: the front yard if it can be
    var front = [(S.box[0] + S.box[1]) / 2, (S.box[3] + S.hy) / 2];
    J.yard = jbSpot(J, 7, 4.5, front, 1.0);
    // (its stacks walked into, never driven over or stood on: 40-works.js WK_YARD)
    site.mark([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return S.W(J.yard.l[0] + q[0] * J.yard.hw, J.yard.l[1] + q[1] * J.yard.hh); }), WK_YARD, [WK_STACK]);
    J.skip = jbSpot(J, 4.2, 2.2, [J.yard.l[0] + 7 * P, J.yard.l[1]], 0.6);
    // (2026-10-05: "for the scale should have the appropriate amount of
    // outhouses") the toilets: one to every ten of the crew, and one more for
    // every 1,500 square metres of a big job -- side by side in a row
    var loos = Math.max(1, Math.min(8, Math.ceil(n / 10) + Math.floor((J.area || 0) / 1500)));
    J.loo = jbSpot(J, 1.5 * loos, 1.5, [J.yard.l[0] - 5 * P, J.yard.l[1]], 0.4);
    [J.skip, J.loo].forEach(function (q) {
      site.mark([[q.l[0] - q.hw, q.l[1] - q.hh], [q.l[0] + q.hw, q.l[1] - q.hh], [q.l[0] + q.hw, q.l[1] + q.hh], [q.l[0] - q.hw, q.l[1] + q.hh]].map(function (c) { return S.W(c[0], c[1]); }), WK_THING);
    });
    // the skip and the toilets, there from the start
    var spots = [["skip", J.skip.l]];
    for (var li = 0; li < loos; li++) { spots.push(["loo", [J.loo.l[0] + (li - (loos - 1) / 2) * 1.5 * P, J.loo.l[1]]]); }
    J.looMs = [];
    spots.forEach(function (a) {
      var m = wkMachine(plan, a[0], {});
      m.site = site;
      var st = { x: a[1][0], y: a[1][1], ang: 0 };
      wkMSeg(m, 0, 1e9, function () { return { x: st.x, y: st.y, ang: st.ang, site: site }; });
      if (a[0] === "loo") { J.looMs.push(m); if (!J.looM) { J.looM = m; } } else { J[a[0] + "M"] = m; }
    });
    // the crew in their pickups along the kerb, past the lot's sides; out of them, to the yard.  Onto
    // the drive or the lot once the earth movers are done (spots kept for them above, "parkin"
    // below); moved off before the paving (40-works-site.js).
    var looks = [];
    J.pickups = [];
    var kerbN = 0;
    for (var p = 0; p < picks; p++) {
      // (along the kerb past the lot's sides: its own frontage kept for the deliveries)
      var lotHw = site.lot ? site.lot.w / 2 : (S.box[1] - S.box[0]) / 2 + 8 * P, side, nth;
      var m2 = null;
      if (!m2) {
        side = kerbN % 2 ? 1 : -1; nth = Math.floor(kerbN / 2); kerbN++;
        m2 = jbVehicle(plan, "pickup", { len: 5.6 * P, wid: 2.0 * P, target: [side * (lotHw + 7 * P + nth * 6.5 * P), S.kerb + 1.2 * P], street: true, t0: 0, t1: 1e9 },
                       { paint: WK_PAINT[p % WK_PAINT.length] });
      }
      var way0 = wkArrive(site, m2.stand, 5.6 * P), tf0 = way0.fwd.len / (8 * P) + 2 + (way0.back ? way0.back.len / (2 * P) + 2 : 0);
      var ready = Math.max(3 + p * 5, (J.lastPickStart === undefined ? -Infinity : J.lastPickStart + 3.5) + tf0);
      J.lastPickStart = jbCome(plan, m2, m2.stand, 5.6 * P, ready, { speed: 8 });
      jbMarkCar(J, m2.stand);
      wkReserve(plan, m2.stand, ready - 2, 1e9);
      J.pickups.push(m2);
    }
    J.crew = [];
    for (var q = 0; q < n; q++) {
      var pk = J.pickups[Math.floor(q / 3)], st2 = pk.stand;
      var look = { own: true, fill: WK_VEST[q % WK_VEST.length], line: "#2e3846", outfit: "vest", hardhat: true, ppe: true,
                   hardhatColor: q === 0 ? "#f4f4f2" : ["#f2c230", "#f2c230", "#e8812a", "#2f6fb0"][q % 4] };
      var door = jbWorld(J, [st2.x + ((q % 3) - 1) * 1.2 * P, st2.y - 1.3 * P], 0);
      var w = wkWorker(plan, q, look);
      w.at = door; w.free = pk.here + 1 + (q % 3) * 0.8; w.fadeIn = true; w.gone = true;
      w.segs.push({ t0: w.free - 0.01, t1: w.free, at: door.slice(), pose: "stand", face: S.a - Math.PI / 2 });
      var spotL = [J.yard.l[0] + ((q % 5) - 2) * 1.2 * P, J.yard.l[1] + (Math.floor(q / 5) - 1) * 1.2 * P - J.yard.hh - 1.2 * P];
      wkGo(plan, w, jbWorld(J, spotL, 0));
      J.crew.push(w);
    }
    J.startAt = J.crew.reduce(function (m3, w) { return Math.max(m3, w.free); }, 0);
    wkSay(plan, "jb_arrive", 0, J.startAt);
    plan.T = J.startAt;
  } });

  // ---- 2. staked out ----------------------------------------------------------------------------------
  WK_PHASES.push({ name: "stakes", make: function (plan) {
    var J = jbJ(plan), P = J.P, b = J.box, foreman = J.crew[0], t0 = J.startAt;
    var corners = [[b[0], b[1]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]];
    corners = [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]];
    var made = [];
    corners.forEach(function (c, i) {
      var spot = [c[0] + (i === 0 || i === 3 ? -0.8 : 0.8) * P, c[1] + (i < 2 ? -0.8 : 0.8) * P, 0];
      wkGo(plan, foreman, [spot[0] + (i === 0 || i === 3 ? -0.5 : 0.5) * P, spot[1], 0], { carry: { kind: "board", n: 2, len: 1.0 }, after: t0 });
      wkDo(foreman, 2.2, "kneel", wkFace(foreman.at, spot));
      var st = wkPiece(plan, foreman.free, wkFacesOf(function (f) { cnBox(f, spot[0], spot[1], 0.03 * P, 0.03 * P, 0, 0.85 * P, WK_FORM); }));
      made.push({ p: spot, pc: st });
    });
    // the string round them, at knee height
    var strung = foreman.free + 1;
    var lines = wkPiece(plan, strung, wkFacesOf(function (f) {
      made.forEach(function (m, i) { var d = made[(i + 1) % made.length].p; cnBeam(f, [m.p[0], m.p[1], 0.7 * P], [d[0], d[1], 0.7 * P], 0.012 * P, WK_STRING); });
    }));
    J.stakes = made.map(function (m) { return m.pc; }).concat([lines]);
    J.stakedAt = strung;
    wkSay(plan, "jb_stakes", t0, strung);
  } });

  // ---- 3. dug: the basement's pit, or the footings' trench ----------------------------------------------
  // The excavator comes on a low loader, drives off it to where it can reach;
  // each bucket: swung round, down into the ground, filled, up, swung over
  // the lorry (or the heap), tipped.  The lorries take it away six buckets each.
  function jbPits(J) {
    var P = J.P, out = [];
    if (typeof TERR !== "undefined" && TERR && TERR.under && TERR.under.length) {
      TERR.under.forEach(function (u) { out.push({ x: u.x, y: u.y, hw: u.hw, hh: u.hh, c: u.c, s: u.s, z: u.z }); });
    } else if (J.base >= 0) {
      J.levels[J.base].rooms.forEach(function (o) {
        var r = o.r, t = (r.turn || 0) * Math.PI / 180;
        out.push({ x: r.x + o.dx, y: r.y + o.dy, hw: r.w / 2, hh: r.h / 2, c: Math.cos(t), s: Math.sin(t), z: o.z });
      });
    }
    return out;
  }
  function jbRectPt(R, lx, ly) { return [R.x + lx * R.c - ly * R.s, R.y + lx * R.s + ly * R.c]; }
  function jbGround(x, y) { try { return typeof terrAt === "function" ? terrAt(x, y) : 0; } catch (e) { return 0; } }
  // a digging cycle: swung to the dig, down, filled, up, swung to the drop, tipped
  function jbCycle(c, k) {
    function seg(a, b) { return wkSmooth((k - a) / (b - a)); }
    var st = { swing: c.sw0, reach: c.r0, lift: c.z0, curl: 0, load: 0, drop: 0 };
    var sPrev = c.swPrev === undefined ? c.sw1 : c.swPrev;
    if (k < 0.25) {
      var a = seg(0, 0.25);
      st.swing = wkTurnTo(sPrev, c.sw0, a); st.reach = c.r1 + (c.r0 + 0.8 - c.r1) * a; st.lift = c.z1 + 1.2 + (c.z0 + 0.8 - c.z1 - 1.2) * a; st.curl = 0.25 * (1 - a);
    } else if (k < 0.45) {
      var b = seg(0.25, 0.45);
      st.reach = c.r0 + 0.8 - 1.6 * b; st.lift = c.z0 + 0.8 - 0.8 * Math.sin(b * Math.PI) - 0.1 * b; st.curl = b; st.load = b;
    } else if (k < 0.6) {
      var d = seg(0.45, 0.6);
      st.reach = c.r0 - 0.8 + (c.r1 - c.r0 + 0.8) * d; st.lift = c.z0 + (c.z1 + 1.2 - c.z0) * d; st.curl = 1; st.load = 1;
    } else if (k < 0.8) {
      var e = seg(0.6, 0.8);
      st.swing = wkTurnTo(c.sw0, c.sw1, e); st.reach = c.r1; st.lift = c.z1 + 1.2; st.curl = 1; st.load = 1;
    } else if (k < 0.92) {
      var f = seg(0.8, 0.92);
      st.swing = c.sw1; st.reach = c.r1; st.lift = c.z1 + 1.2; st.curl = 1 - f * 1.1; st.load = 1 - f; st.drop = f;
    } else {
      st.swing = c.sw1; st.reach = c.r1; st.lift = c.z1 + 1.2; st.curl = 0;
    }
    if (k >= 0.6 && k < 0.8) { st.swing = wkTurnTo(c.sw0, c.sw1, seg(0.6, 0.8)); }
    return st;
  }
  function wkTurnTo(a, b, k) { var d = ((b - a) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; }
  // a tracked machine's way: legs, each turned to in place, then driven
  function jbTracked(plan, m, pts, t0, speed, base) {
    var site = plan.site, P = site.P, t = t0, head = pts.head === undefined ? Math.PI : pts.head;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], h = Math.atan2(b[1] - a[1], b[0] - a[0]), back = b.back;
      var want = back ? h + Math.PI : h, turn = Math.abs(((want - head) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
      if (turn > 0.05) {
        var h0 = head, h1 = want, dt = 0.6 + turn * 1.2;
        (function (a2, h0, h1) { wkMSeg(m, t, t + dt, function (k) { return Object.assign({ x: a2[0], y: a2[1], ang: wkTurnTo(h0, h1, wkSmooth(k)), site: site, moving: true }, base || {}); }); })(a, h0, h1);
        t += dt;
      }
      head = want;
      var len = Math.hypot(b[0] - a[0], b[1] - a[1]), dur = Math.max(0.5, len / ((speed || 1.1) * P));
      (function (a2, b2, hh) { wkMSeg(m, t, t + dur, function (k) { var q = wkSmooth(k); return Object.assign({ x: a2[0] + (b2[0] - a2[0]) * q, y: a2[1] + (b2[1] - a2[1]) * q, z: (a2[2] || 0) + ((b2[2] || 0) - (a2[2] || 0)) * q, ang: hh, site: site, moving: true }, base || {}); }); })(a, b, head);
      t += dur;
    }
    m.head = head;
    return t;
  }
  WK_PHASES.push({ name: "dig", make: function (plan) {
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, b = J.box, pits = jbPits(J);
    var basement = pits.length > 0;
    J.pits = pits;
    // what is dug: the pit's bottom (a basement's floor and its slab under it), or a trench
    var depth = basement ? Math.max(1.2 * P, -Math.min.apply(null, pits.map(function (u) { return u.z; })) + 0.25 * P) : 0.8 * P;
    // (2026-10-05: "make sure where things are being dug out is where the machine is digging")
    // Dug bite by bite where the bucket goes in: a basement's pit in squares, each going down
    // as it is dug (in two layers where there are few), or the trench under the outside walls
    // as they really go, a stretch a bite -- the excavator crawling round from stand to stand
    // to reach each.  (It stood in the one place and reached 8 m: the far side of a house was
    // dug from nowhere near it, a whole pit going down at once.)
    var cells = [], passes = 1;
    if (basement) {
      var area = pits.reduce(function (s, u) { return s + 4 * u.hw * u.hh; }, 0), side = Math.max(2.2 * P, Math.sqrt(area / 32));
      pits.forEach(function (u, pi) {
        var nx = Math.max(1, Math.round(2 * u.hw / side)), ny = Math.max(1, Math.round(2 * u.hh / side)), cw = 2 * u.hw / nx, ch = 2 * u.hh / ny;
        var cs = [[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, u.hh], [-u.hw, u.hh]].map(function (q) { var w = jbRectPt(u, q[0], q[1]); return jbGround(w[0], w[1]); });
        u.gz = Math.min.apply(null, cs);
        u.grid = [];
        for (var i = 0; i < nx; i++) {
          for (var j = 0; j < ny; j++) {
            var cl = { u: u, pi: pi, i: i, j: j, x0: -u.hw + cw * i, x1: -u.hw + cw * (i + 1), y0: -u.hh + ch * j, y1: -u.hh + ch * (j + 1), at: [] };
            cl.w = jbRectPt(u, (cl.x0 + cl.x1) / 2, (cl.y0 + cl.y1) / 2);
            u.grid[i * ny + j] = cl;
            cells.push(cl);
          }
        }
        u.nx = nx; u.ny = ny;
      });
      passes = cells.length <= 18 ? 2 : 1;
    } else {
      // the trench under the outside walls: each room's sides that face out, a stretch at a time, round the building
      var rooms = J.levels[J.g].rooms.map(function (o) { var r = o.r, tt = (r.turn || 0) * Math.PI / 180; return { x: r.x + o.dx, y: r.y + o.dy, hw: r.w / 2, hh: r.h / 2, c: Math.cos(tt), s: Math.sin(tt) }; });
      var inRoom = function (p) {
        return rooms.some(function (u) { var dx = p[0] - u.x, dy = p[1] - u.y, lx = dx * u.c + dy * u.s, ly = -dx * u.s + dy * u.c; return Math.abs(lx) < u.hw && Math.abs(ly) < u.hh; });
      };
      var mid0 = [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2];
      rooms.forEach(function (u) {
        var cs = [[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, u.hh], [-u.hw, u.hh]].map(function (q) { return jbRectPt(u, q[0], q[1]); });
        for (var e = 0; e < 4; e++) {
          var a = cs[e], z = cs[(e + 1) % 4], len = Math.hypot(z[0] - a[0], z[1] - a[1]), n = Math.max(1, Math.round(len / (2.5 * P)));
          var ox = (z[1] - a[1]) / len, oy = -(z[0] - a[0]) / len;
          for (var k = 0; k < n; k++) {
            var p0 = [a[0] + (z[0] - a[0]) * k / n, a[1] + (z[1] - a[1]) * k / n], p1 = [a[0] + (z[0] - a[0]) * (k + 1) / n, a[1] + (z[1] - a[1]) * (k + 1) / n];
            var m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
            if (inRoom([m[0] + ox * 0.4 * P, m[1] + oy * 0.4 * P])) { continue; }        // (a wall between two rooms: no trench)
            cells.push({ w: m, seg: [p0, p1], out: [ox, oy], ang: Math.atan2(m[1] - mid0[1], m[0] - mid0[0]), at: [] });
          }
        }
      });
      cells.sort(function (p, q) { return p.ang - q.ang; });
      if (!cells.length) { cells.push({ w: mid0, seg: [[b[0], mid0[1]], [b[1], mid0[1]]], at: [] }); }
    }
    var t0 = Math.max(J.stakedAt || 0, J.startAt) + 4;
    // (the pit marked: no machine stands in it)
    pits.forEach(function (u) { site.mark([[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, u.hh], [-u.hw, u.hh]].map(function (q) { return jbRectPt(u, q[0], q[1]); }), WK_PIT); });
    // the stands: one near each run of what is left to dig, from which the bucket reaches it
    // (its swing's foot a metre ahead of the machine's middle: 2-8 m out from that)
    function reaches(st, w) { var sw = jbWorld(J, [st.x, st.y]), d = Math.hypot(w[0] - sw[0], w[1] - sw[1]) / P; return d >= 3.4 && d <= 8.8; }
    function standFor(ws, from, min, reach) {
      var cx = 0, cy = 0;
      ws.forEach(function (w) { cx += w[0]; cy += w[1]; });
      var st = wkNearStand(plan, { len: 4.4 * P, wid: 2.9 * P, target: jbLocal(J, [cx / ws.length, cy / ws.length]), reach: reach || 6.5 * P, min: min || 3.2 * P, t0: from, t1: from + 400 });
      if (st) { st.cx = st.x; st.cy = st.y; }
      return st && reaches(st, ws[0]) ? st : null;
    }
    function nextStand(left, from) {
      // (begun from the first left that some stand reaches -- one not reached now is come back to)
      for (var k = 0; k < Math.min(left.length, 8); k++) {
        var first = left[k], run = basement ? left.filter(function (c) { return Math.hypot(c.w[0] - first.w[0], c.w[1] - first.w[1]) < 6 * P; }) : left.slice(k, k + 4);
        // (its middle some 1.5 m behind the spot it is found at: 2-7 m off is 3.5-8.5 m to its middle)
        var st = standFor(run.map(function (c) { return c.w; }), from) || standFor([first.w], from, 2.0 * P, 7.0 * P);
        if (!st) { continue; }
        var mine = [];
        if (basement) { mine = left.filter(function (c) { return c === first || reaches(st, c.w); }); }
        else { for (var i = k; i < left.length && (i === k || reaches(st, left[i].w)); i++) { mine.push(left[i]); } }
        return { st: st, cells: mine };
      }
      // (none reaches any: a trench's stretch is dug by hand; a pit's, from as near as it can stand)
      return basement ? nearestStand(left, from) : null;
    }
    function nearestStand(left, from) {
      var st2 = wkStand(plan, { kind: "excavator", target: jbLocal(J, left[0].w), reach: 3.5 * P, t0: from, t1: from + 400, ground: true });
      st2.cx = st2.cx === undefined ? st2.x : st2.cx; st2.cy = st2.cy === undefined ? st2.y : st2.cy;
      return { st: st2, cells: [left[0]].concat(left.slice(1).filter(function (c) { return reaches(st2, c.w); })) };
    }
    // the dug pit's start: the cells nearest the street first (where it is come at from)
    if (basement) { cells.sort(function (p, q) { return jbLocal(J, q.w)[1] - jbLocal(J, p.w)[1]; }); }
    var ex = wkMachine(plan, "excavator", {});
    ex.site = site;
    var firstGo = nextStand(cells, t0) || nearestStand(cells, t0);
    ex.stand = firstGo.st;
    var lb = jbVehicle(plan, "lowboy", { len: 19 * P, wid: 2.6 * P, target: [ex.stand.x + 10 * P, S.kerb + 1.5 * P], street: true, t0: t0 - 30, t1: t0 + 60 });
    var arriveLow = t0;
    jbCome(plan, lb, lb.stand, 19 * P, arriveLow, { speed: 5, extra: { carrying: true } });
    // off the low loader, round onto the lot, to its first stand
    var deck = [lb.stand.x + 9.1 * P, lb.stand.y, 1.0 * P];
    var rear = [lb.stand.x + 17.5 * P, lb.stand.y];
    rear.back = true;
    var way = wkVehWay(site, [rear[0], site.lanes.w - 1.2 * P], [ex.stand.x, ex.stand.y], 2.3 * P, true);   // (nothing of the building up yet: its ground driven over too)
    var path = [deck, rear].concat(way.slice(0, -1).map(function (q) { return [q[0], q[1]]; })).concat([[ex.stand.x, ex.stand.y]]);
    path.head = Math.PI;
    var tOff = arriveLow + 3;
    jbStay(lb, arriveLow, tOff, function () { return { carrying: true }; });
    lb.here = tOff;
    var lbBack = lb;
    var t = jbTracked(plan, ex, path, tOff, 1.0, { working: false }) + 1, tAt = t;
    var dugAt = [], heaps = [], trucks = [], cur = null, inTruck = 0, swPrev = ex.head, left = cells.slice(), go = firstGo, stands = [];
    function sendOff(at) {
      // full, or the excavator moving on: away with it
      var me = cur, loads = me.loads.slice();
      jbStay(me, me.here, at + 0.5, function (k, T) { var n = 0; loads.forEach(function (tt) { if (T >= tt) { n++; } }); return { fill: n / 6 }; });
      me.here = at + 0.5;
      var gone = jbGo(plan, me, at + 0.5, { extra: { fill: loads.length / 6 } });
      me.goneAt = at + 0.5 + Math.min(16, (gone - at) * 0.45);
      cur = null;
    }
    while (go && go.cells.length) {
      var st = go.st, stW = jbWorld(J, [st.x, st.y]), arrived = t;
      ex.stand = st;
      var exFoot = function (sw) { return [stW[0] + Math.cos(S.a + ex.head + sw) * 1.0 * P, stW[1] + Math.sin(S.a + ex.head + sw) * 1.0 * P, 1.95 * P]; };
      var aimAt = function (p, z) {
        var sw = Math.atan2(p[1] - stW[1], p[0] - stW[0]) - (S.a + ex.head);
        var foot = exFoot(sw), r = Math.hypot(p[0] - foot[0], p[1] - foot[1]) / P - 0.3;
        return { sw: sw, r: Math.max(2.0, Math.min(8.0, r)), z: (z - foot[2]) / P };
      };
      // where what it lifts goes: a lorry backed in within its reach (a pit's worth: most of it away), or a heap beside it
      var trk = basement ? wkStand(plan, { kind: "dumper", target: [st.x, st.y], reach: 7 * P, t0: t, t1: t + 400, ground: true }) : null;
      var trkP = trk ? jbWorld(J, [trk.x + Math.cos(trk.ang) * -1.0 * P, trk.y + Math.sin(trk.ang) * -1.0 * P], 2.6 * P) : null;
      var useTrucks = !!trkP && Math.hypot(trkP[0] - stW[0], trkP[1] - stW[1]) < 8.4 * P;
      var outA = Math.atan2(stW[1] - (b[2] + b[3]) / 2, stW[0] - (b[0] + b[1]) / 2);
      var spot = jbSpot(J, 2.6, 2.6, jbLocal(J, [stW[0] + Math.cos(outA) * 5 * P, stW[1] + Math.sin(outA) * 5 * P]), 0.3);
      var heap = { w: spot.w, at: [] }, hd = Math.hypot(heap.w[0] - stW[0], heap.w[1] - stW[1]);
      if (hd > 7.6 * P || hd < 4.2 * P) {
        // (no clear patch within its reach: tipped beside it, away from the building)
        heap.w = [stW[0] + Math.cos(outA) * 5 * P, stW[1] + Math.sin(outA) * 5 * P, 0];
      }
      heaps.push(heap);
      // the bites: from the far side of what it reaches back toward it, a layer at a time
      var mine = go.cells.slice().sort(function (p, q) { return Math.hypot(q.w[0] - stW[0], q.w[1] - stW[1]) - Math.hypot(p.w[0] - stW[0], p.w[1] - stW[1]); });
      if (!basement) { mine = go.cells.slice(); }
      for (var pass = 1; pass <= passes; pass++) {
        mine.forEach(function (cl, ci) {
          var gz = basement ? cl.u.gz : jbGround(cl.w[0], cl.w[1]);
          var dig = aimAt(cl.w, gz - depth * pass / passes + (basement ? 0 : 0.2 * P));
          var toTruck = useTrucks && (ci % 8) < 6;
          if (toTruck && !cur) {
            cur = jbVehicle(plan, "dumper", { len: 8.6 * P, wid: 2.6 * P, target: [st.x, st.y], reach: 7 * P, t0: t - 5, t1: t + 80 }, { paint: "#c9ced3" });
            cur.stand = trk;
            var ready = Math.max(t, (trucks.length ? trucks[trucks.length - 1].goneAt + 4 : t));
            jbCome(plan, cur, trk, 8.6 * P, ready, { speed: 6 });
            cur.loads = [];
            trucks.push(cur);
            t = Math.max(t, ready);
            inTruck = 0;
          }
          var dumpP = toTruck ? trkP : [heap.w[0], heap.w[1], 1.4 * P];
          var dump = aimAt(dumpP, dumpP[2]);
          var cyc = { sw0: dig.sw, r0: dig.r, z0: dig.z, sw1: dump.sw, r1: dump.r, z1: dump.z, swPrev: swPrev }, dur = 9;
          (function (cyc, hd, sx, sy) { wkMSeg(ex, t, t + dur, function (k) { return Object.assign({ x: sx, y: sy, ang: hd, site: site, working: true }, jbCycle(cyc, k)); }); })(cyc, ex.head, st.x, st.y);
          // (the ground gives as the bucket closes in it)
          cl.at.push(t + dur * 0.42); cl.st = st;
          dugAt.push(t + dur * 0.42);
          if (toTruck) { cur.loads.push(t + dur * 0.88); inTruck++; }
          else { heap.at.push(t + dur * 0.88); }
          swPrev = dump.sw;
          t += dur;
          if (toTruck && inTruck >= 6) { sendOff(t); }
        });
      }
      if (cur) { sendOff(t); }
      stands.push({ st: st, t0: arrived - 1, t1: t + 1 });
      plan.res.push({ rect: [st.cx, st.cy, 2.6 * P, 1.9 * P, st.ang], t0: arrived - 1, t1: t + 1 });
      // on to the next stand, round what is in the way
      left = left.filter(function (c) { return go.cells.indexOf(c) < 0; });
      go = left.length ? nextStand(left, t) : null;
      if (go) {
        var leg = wkVehWay(site, [st.x, st.y], [go.st.x, go.st.y], 2.0 * P, true).map(function (q) { return [q[0], q[1]]; });
        leg.head = ex.head;
        t = jbTracked(plan, ex, leg, t, 1.0, { working: false }) + 0.5;
      }
    }
    // what no machine can get beside (a narrow side, the yard's stacks): dug with shovels
    var tHand = tAt;
    if (left.length) {
      var diggers = J.crew.slice(1);
      left.forEach(function (cl, i) {
        var w = wkPick(plan, 1, [cl.w[0], cl.w[1], 0], diggers)[0];
        if (!w) { cl.at.push(t); dugAt.push(t); return; }
        var o = cl.out || [0, 1], at = [cl.w[0] + o[0] * 0.7 * P, cl.w[1] + o[1] * 0.7 * P, 0];
        wkGo(plan, w, at, { after: tAt + (i % 2) * 6 });
        wkDo(w, 30, "shovel", wkFace(at, [cl.w[0], cl.w[1], 0]));
        cl.at.push(w.free - 1);
        dugAt.push(w.free - 1);
        tHand = Math.max(tHand, w.free);
      });
      dugAt.sort(function (p, q) { return p - q; });
      left = [];
    }
    t = Math.max(t, tHand);
    // back on the low loader, and away
    var last = stands.length ? stands[stands.length - 1].st : ex.stand;
    var tDone = t + 1;
    var back = wkVehWay(site, [last.x, last.y], [rear[0], site.lanes.w - 1.2 * P], 2.3 * P, true).map(function (q) { return [q[0], q[1]]; });
    back = back.concat([rear, deck]);
    back.head = ex.head;
    // (the low loader went once the excavator was off it -- after it had driven clear -- and comes back now)
    lb.here = tAt;
    jbGo(plan, lb, tAt, { speed: 5, extra: { carrying: false } });
    lbBack = wkMachine(plan, "lowboy", {});
    lbBack.site = site;
    lbBack.stand = lb.stand;
    jbCome(plan, lbBack, lb.stand, 19 * P, tDone - 2, { speed: 5, extra: { carrying: false } });
    var tOn = jbTracked(plan, ex, back, tDone, 1.0, {});
    ex.segs[ex.segs.length - 1].gone = true;
    jbStay(lbBack, tDone - 2, tOn, function () { return { carrying: false }; });
    lbBack.here = tOn;
    jbGo(plan, lbBack, tOn + 1, { speed: 5, extra: { carrying: true } });
    // the ground as dug: each square of the pit at its depth, its earth sides and steps; the trench, stretch by stretch
    var digT1 = dugAt.length ? dugAt[dugAt.length - 1] : t;
    function cellD(cl, T) { var n = 0; for (var i = 0; i < cl.at.length; i++) { if (T >= cl.at[i]) { n++; } } return depth * Math.min(passes, n) / passes; }
    J.dugAt = tDone;
    J.depth = depth;
    function wall(faces, u, lx0, ly0, lx1, ly1, zLo, zHi0, zHi1, nl, live) {
      var a = jbRectPt(u, lx0, ly0), e = jbRectPt(u, lx1, ly1), n = [nl[0] * u.c - nl[1] * u.s, nl[0] * u.s + nl[1] * u.c, 0];
      faces.push({ pts: [[a[0], a[1], zLo], [e[0], e[1], zLo], [e[0], e[1], zHi1], [a[0], a[1], zHi0]], n: n, how: WK_DIRT, moves: live });
    }
    J.pitFaces = function (faces, T, keepWalls) {
      var live = T < digT1 + 1;
      if (basement) {
        pits.forEach(function (u) {
          var G = u.grid, ny = u.ny, nx = u.nx, D = G.map(function (cl) { return cellD(cl, T); }), same = D.every(function (d) { return d === D[0]; });
          if (J.slabAt === undefined || T < J.slabAt) {
            if (same) {
              faces.push({ pts: [[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, u.hh], [-u.hw, u.hh]].map(function (q) { var w = jbRectPt(u, q[0], q[1]); return [w[0], w[1], u.gz - D[0]]; }), n: [0, 0, 1], how: WK_DIRT, moves: live });
            } else {
              G.forEach(function (cl, k) {
                faces.push({ pts: [[cl.x0, cl.y0], [cl.x1, cl.y0], [cl.x1, cl.y1], [cl.x0, cl.y1]].map(function (q) { var w = jbRectPt(u, q[0], q[1]); return [w[0], w[1], u.gz - D[k]]; }), n: [0, 0, 1], how: WK_DIRT, moves: live });
              });
            }
          }
          if (!keepWalls) { return; }
          G.forEach(function (cl, k) {
            var d = D[k];
            // its sides at the pit's edge, up to the ground there
            if (d > 0) {
              if (cl.i === 0) { wall(faces, u, -u.hw, cl.y0, -u.hw, cl.y1, u.gz - d, u.gz, u.gz, [1, 0], live); }
              if (cl.i === nx - 1) { wall(faces, u, u.hw, cl.y0, u.hw, cl.y1, u.gz - d, u.gz, u.gz, [-1, 0], live); }
              if (cl.j === 0) { wall(faces, u, cl.x0, -u.hh, cl.x1, -u.hh, u.gz - d, u.gz, u.gz, [0, 1], live); }
              if (cl.j === ny - 1) { wall(faces, u, cl.x0, u.hh, cl.x1, u.hh, u.gz - d, u.gz, u.gz, [0, -1], live); }
            }
            // a step down to the square beside it, dug deeper or less
            if (cl.i < nx - 1) {
              var dx = D[k + ny];
              if (dx !== d) { var deepL = d > dx; wall(faces, u, cl.x1, cl.y0, cl.x1, cl.y1, u.gz - Math.max(d, dx), u.gz - Math.min(d, dx), u.gz - Math.min(d, dx), deepL ? [-1, 0] : [1, 0], live); }
            }
            if (cl.j < ny - 1) {
              var dy = D[k + 1];
              if (dy !== d) { var deepB = d > dy; wall(faces, u, cl.x0, cl.y1, cl.x1, cl.y1, u.gz - Math.max(d, dy), u.gz - Math.min(d, dy), u.gz - Math.min(d, dy), deepB ? [0, -1] : [0, 1], live); }
            }
          });
        });
      } else {
        // the trench, a dark band under the outside walls, a stretch as each is dug
        cells.forEach(function (cl) {
          if (!cl.at.length || T < cl.at[0]) { return; }
          var f0 = faces.length;
          cnBeam(faces, [cl.seg[0][0], cl.seg[0][1], 0.03 * P], [cl.seg[1][0], cl.seg[1][1], 0.03 * P], 0.6 * P, WK_DIRT, 0.04 * P);
          if (live) { for (var i = f0; i < faces.length; i++) { faces[i].moves = true; } }
        });
      }
    };
    // (the pit: there from the start -- level with the ground till it is dug -- till the foundation walls are up)
    wkPiece(plan, 0, [], { live: function (faces, T) { J.pitFaces(faces, T, J.wallsUpAt === undefined || T < J.wallsUpAt); } });
    // the heaps: each growing as the buckets are tipped on it; put back round the walls once they are in
    var heapPc = wkPiece(plan, dugAt.length ? dugAt[0] : 1e9, [], { live: function (faces, T) {
      var back = J.wallsUpAt !== undefined ? J.wallsUpAt : J.foundAt, keep = back === undefined ? 1 : 1 - wkClamp((T - back) / 90);
      if (keep <= 0.02) { return; }
      heaps.forEach(function (hp) {
        var n = 0; hp.at.forEach(function (tt) { if (T >= tt) { n++; } });
        if (!n) { return; }
        wkMound(faces, hp.w, Math.min(2.4, 0.8 + n * 0.1) * P * (0.45 + 0.55 * keep), Math.min(2.2, 0.4 + n * 0.12) * P * keep);
      });
    } });
    J.heapPc = heapPc; J.heaps = heaps; J.heapW = heaps.length ? heaps[0].w : null;
    J.excavator = ex;
    wkSay(plan, basement ? "jb_dig" : "jb_trench", tAt - 30, tDone);
    plan.T = Math.max(plan.T, tDone);
  } });
  // a heap of earth: a low many-sided mound
  function wkMound(faces, c, r, h) {
    var n = 9, ring = [], top = [];
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, rr = r * (0.85 + 0.15 * Math.sin(i * 2.7));
      ring.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr, 0]);
      top.push([c[0] + Math.cos(a) * rr * 0.35, c[1] + Math.sin(a) * rr * 0.35, h]);
    }
    for (var j = 0; j < n; j++) {
      var a2 = ring[j], b2 = ring[(j + 1) % n], c2 = top[(j + 1) % n], d2 = top[j];
      var mx = (a2[0] + b2[0]) / 2 - c[0], my = (a2[1] + b2[1]) / 2 - c[1], l = Math.hypot(mx, my) || 1;
      faces.push({ pts: [a2, b2, c2, d2], n: [mx / l * 0.7, my / l * 0.7, 0.7], how: WK_DIRT, moves: true });
    }
    faces.push({ pts: top, n: [0, 0, 1], how: WK_DIRT, moves: true });
  }

  // ---- 4. the foundation: footings, walls, the slab; poured from the pump ------------------------------
  // Forms set by hand, board by board; the concrete pump's boom out over
  // them, a mixer backed up to its hopper, then the next; the forms struck.
  WK_PHASES.push({ name: "foundation", make: function (plan) {
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, b = J.box, t = Math.max(J.dugAt || 0, J.stakedAt || 0) + 2;
    var basement = J.pits && J.pits.length > 0, crew = J.crew.slice(1), yardW = J.yard.w;
    // the outline the forms go round: the basement's rects, or the ground floor's rooms
    var rects = basement ? J.pits : J.levels[J.g].rooms.map(function (o) { var r = o.r, tt = (r.turn || 0) * Math.PI / 180; return { x: r.x + o.dx, y: r.y + o.dy, hw: r.w / 2, hh: r.h / 2, c: Math.cos(tt), s: Math.sin(tt), z: o.z }; });
    var edges = [];
    rects.forEach(function (u) {
      var cs = [[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, u.hh], [-u.hw, u.hh]].map(function (q) { return jbRectPt(u, q[0], q[1]); });
      for (var i = 0; i < 4; i++) { edges.push({ a: cs[i], b: cs[(i + 1) % 4], u: u }); }
    });
    var floorZ = basement ? Math.min.apply(null, rects.map(function (u) { return u.z; })) : J.levels[J.g].z;
    var low = basement ? floorZ - 0.25 * P : -0.6 * P;
    // the stakes come out as the forms go in
    (J.stakes || []).forEach(function (pc) { pc.t1 = t + 3; });
    // a ladder down into the pit, on the side nearest the yard
    if (basement) {
      var yl = J.yard.w, bestE = null, bd2 = Infinity;
      J.pits.forEach(function (u) {
        [[0, u.hh, 0, -1], [0, -u.hh, 0, 1], [u.hw, 0, -1, 0], [-u.hw, 0, 1, 0]].forEach(function (o) {
          var w = jbRectPt(u, o[0], o[1]), d = Math.hypot(w[0] - yl[0], w[1] - yl[1]);
          if (d < bd2) { bd2 = d; var inw = jbRectPt(u, o[0] + o[2] * 0.6 * P, o[1] + o[3] * 0.6 * P), outw = jbRectPt(u, o[0] - o[2] * 0.7 * P, o[1] - o[3] * 0.7 * P); bestE = { edge: w, inn: inw, out: outw, z: u.z }; }
        });
      });
      if (bestE) {
        var fz = bestE.z - 0.02 * P, foot = [bestE.out[0], bestE.out[1], 0], top = [bestE.inn[0], bestE.inn[1], fz];
        J.pitLadder = { foot: foot, top: top, pts: [foot, [bestE.edge[0], bestE.edge[1], 0], [bestE.edge[0], bestE.edge[1], fz], top] };
        plan.ladder = function (li, lj) { return (li === J.base || lj === J.base) && J.pitLadder ? J.pitLadder : (J.upLadder ? J.upLadder(li, lj) : null); };
        wkPiece(plan, t, wkFacesOf(function (f) {
          var e = bestE.edge, d = [bestE.inn[0] - e[0], bestE.inn[1] - e[1]], l = Math.hypot(d[0], d[1]) || 1, sx = -d[1] / l * 0.25 * P, sy = d[0] / l * 0.25 * P;
          [-1, 1].forEach(function (s2) { cnBeam(f, [e[0] + sx * s2 + d[0] * 0.25, e[1] + sy * s2 + d[1] * 0.25, fz], [e[0] + sx * s2, e[1] + sy * s2, 1.0 * P], 0.05 * P, WK_STEELY); });
          for (var r2 = 0; r2 < 9; r2++) { var q = r2 / 8, z = fz + (1.0 * P - fz) * q; cnBeam(f, [e[0] - sx + d[0] * 0.25 * (1 - q), e[1] - sy + d[1] * 0.25 * (1 - q), z], [e[0] + sx + d[0] * 0.25 * (1 - q), e[1] + sy + d[1] * 0.25 * (1 - q), z], 0.03 * P, WK_STEELY); }
        }), { t1: 1e9 });
        J.pitLadderPc = plan.pieces[plan.pieces.length - 1];
      }
    }
    // forms: a board a trip, round every edge, two at a time
    var boards = [];
    edges.forEach(function (e) {
      var len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]), n = Math.max(1, Math.round(len / (2.4 * P)));
      for (var k = 0; k < n; k++) { boards.push({ a: wkLerp([e.a[0], e.a[1], 0], [e.b[0], e.b[1], 0], k / n), b: wkLerp([e.a[0], e.a[1], 0], [e.b[0], e.b[1], 0], (k + 1) / n), u: e.u }); }
    });
    var formH = basement ? (J.levels[J.base].top - floorZ) + 0.05 * P : 0.45 * P, formZ0 = basement ? floorZ - 0.25 * P : -0.4 * P;
    if (basement) { wkSay(plan, "jb_forms_wall", t, t + 1); } else { wkSay(plan, "jb_forms", t, t + 1); }
    var formPcs = [], lastForm = t;
    boards.forEach(function (bd, i) {
      var w = wkPick(plan, 1, bd.a, crew)[0], mid = wkLerp(bd.a, bd.b, 0.5), cx = mid[0] - bd.u.x, cy = mid[1] - bd.u.y, l = Math.hypot(cx, cy) || 1;
      var out = basement ? [mid[0] - cx / l * 0.8 * P, mid[1] - cy / l * 0.8 * P, floorZ] : [mid[0] + cx / l * 0.7 * P, mid[1] + cy / l * 0.7 * P, 0];
      wkGo(plan, w, [yardW[0] + ((i % 5) - 2) * 0.6 * P, yardW[1], 0], { after: t });
      wkDo(w, 1.0, "hold");
      wkGo(plan, w, out, { carry: { kind: basement ? "sheet" : "board", n: 1, len: 2.4, w: formH / P, h: 2.4, how: WK_PLY } });
      wkDo(w, 2.5, basement ? "hammer" : "kneel", wkFace(out, mid));
      var dx = bd.b[0] - bd.a[0], dy = bd.b[1] - bd.a[1], ang = Math.atan2(dy, dx), len2 = Math.hypot(dx, dy);
      var pc = wkPiece(plan, w.free, wkFacesOf(function (f) {
        cnBox(f, mid[0] + cx / l * 0.12 * P, mid[1] + cy / l * 0.12 * P, len2 / 2, 0.025 * P, formZ0, formZ0 + formH, basement ? WK_PLY : WK_FORM, ang);
        // its stakes or its walers behind
        cnBox(f, mid[0] + cx / l * 0.22 * P, mid[1] + cy / l * 0.22 * P, len2 / 2, 0.04 * P, formZ0 + formH * 0.3, formZ0 + formH * 0.3 + 0.09 * P, WK_TIMBER, ang);
        if (basement) { cnBox(f, mid[0] + cx / l * 0.22 * P, mid[1] + cy / l * 0.22 * P, len2 / 2, 0.04 * P, formZ0 + formH * 0.75, formZ0 + formH * 0.75 + 0.09 * P, WK_TIMBER, ang); }
      }));
      formPcs.push(pc);
      lastForm = Math.max(lastForm, w.free);
    });
    // rebar: mats across the slab (no basement) / bars in the wall forms
    var t2 = lastForm + 1;
    if (!basement) {
      var bars = [], ny = Math.max(2, Math.round((b[3] - b[2]) / (1.2 * P)));
      for (var k = 0; k <= ny; k++) { bars.push([[b[0] + 0.3 * P, b[2] + (b[3] - b[2]) * k / ny], [b[1] - 0.3 * P, b[2] + (b[3] - b[2]) * k / ny]]); }
      var nx = Math.max(2, Math.round((b[1] - b[0]) / (1.2 * P)));
      for (var k2 = 0; k2 <= nx; k2++) { bars.push([[b[0] + (b[1] - b[0]) * k2 / nx, b[2] + 0.3 * P], [b[0] + (b[1] - b[0]) * k2 / nx, b[3] - 0.3 * P]]); }
      bars.forEach(function (br, i) {
        var w = wkPick(plan, 1, [br[0][0], br[0][1], 0], crew)[0];
        wkGo(plan, w, [yardW[0], yardW[1] + ((i % 3) - 1) * 0.6 * P, 0], { after: t2 });
        wkDo(w, 0.8, "hold");
        var mid = [(br[0][0] + br[1][0]) / 2, (br[0][1] + br[1][1]) / 2, 0];
        wkGo(plan, w, mid, { carry: { kind: "rebar", n: 2, len: 3 } });
        wkDo(w, 1.8, "kneel");
        wkPiece(plan, w.free, wkFacesOf(function (f) { cnBeam(f, [br[0][0], br[0][1], -0.22 * P], [br[1][0], br[1][1], -0.22 * P], 0.025 * P, WK_REBAR); }), { t1: 1e9 });
      });
      wkSay(plan, "jb_rebar", t2, t2 + 1);
    }
    var tPour = crew.reduce(function (m, w) { return Math.max(m, w.free); }, t2) + 2;
    // the pour: the pump, its boom over the forms; the mixers one after another
    var target = jbLocal(J, [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2]);
    var pours = [];
    if (basement) {
      // the walls: along every edge, at the top of the forms
      edges.forEach(function (e) { pours.push({ a: [e.a[0], e.a[1], formZ0 + formH + 0.6 * P], b: [e.b[0], e.b[1], formZ0 + formH + 0.6 * P], len: Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]) }); });
    } else {
      // the slab: to and fro across it
      var rows = Math.max(2, Math.round((b[3] - b[2]) / (2.2 * P)));
      for (var r = 0; r < rows; r++) {
        var y = b[2] + (b[3] - b[2]) * (r + 0.5) / rows, x0 = r % 2 ? b[1] - 0.5 * P : b[0] + 0.5 * P, x1 = r % 2 ? b[0] + 0.5 * P : b[1] - 0.5 * P;
        pours.push({ a: [x0, y, 1.2 * P], b: [x1, y, 1.2 * P], len: Math.abs(x1 - x0) });
      }
    }
    var total = pours.reduce(function (m, p) { return m + p.len; }, 0), vol = basement ? total / P * 0.25 * formH / P : (b[1] - b[0]) * (b[3] - b[2]) / (P * P) * 0.12;
    var mixers = Math.max(1, Math.min(6, Math.ceil(vol / 8))), pourDur = Math.max(30, Math.min(160, total / P * 2.2));
    // (the pump in the street, its boom out over the lot; the mixers backed up behind it, tail to tail)
    var pump = wkMachine(plan, "pump", {});
    pump.site = site;
    pump.stand = wkStand(plan, { kind: "pumpmix", target: [target[0], S.kerb], street: true, t0: tPour - 40, t1: tPour + pourDur + 40 });
    var tUp = tPour - 4;
    jbCome(plan, pump, pump.stand, 11 * P, tUp - 12, { speed: 5 });
    var pumpW = jbWorld(J, [pump.stand.x, pump.stand.y]);
    // the boom's tip along the pours, hose down to the concrete
    function tipAt(k) {
      var s = total * wkClamp(k), i = 0;
      while (i < pours.length - 1 && s > pours[i].len) { s -= pours[i].len; i++; }
      var p = pours[i], q = wkClamp(s / Math.max(1, p.len));
      return wkLerp(p.a, p.b, q);
    }
    // the mixers, each in turn backed up behind the pump
    var mstand = { x: pump.stand.x + 11.8 * P, y: pump.stand.y, ang: 0, street: true, hl: 5 * P, hw: 1.5 * P, cx: pump.stand.x + 11.8 * P, cy: pump.stand.y };
    var gap = 24, each = Math.max(12, (pourDur - gap * (mixers - 1)) / mixers), later = 0, lastOut = tPour;
    for (var mi = 0; mi < mixers; mi++) {
      var mx = wkMachine(plan, "mixer", { paint: mi % 2 ? "#f2f2ee" : "#2f5d8a" });
      mx.site = site;
      var r0 = tPour + mi * (each + gap) + later, r1 = r0 + each;
      // (2026-10-06: backed round wide of the lamps at the kerb -- wkArrive -- one waited in the far lane
      // to back in as the one before drove off along it, through it.  Each comes later then, four
      // seconds at a time, till its way in is clear of all but the pump it backs up to; those after it
      // too, and the pump pumps on till the last is done.)
      for (var late = 0, segsAt = mx.segs.length; late < 10; late++) {
        var tA = jbCome(plan, mx, mstand, 9.4 * P, r0 - 1, { speed: 6, extra: { turn: 0 } });
        if (mi === 0 || late === 9 || jbTripClear(plan, mx, tA, r0 - 5, [pump])) { break; }
        mx.segs.length = segsAt; r0 += 4; r1 += 4; later += 4;
      }
      (function (mx, r0, r1) {
        jbStay(mx, r0 - 1, r1, function (k, T) { return { turn: T * 2.2, pour: k > 0.02 && k < 0.98 ? 1 : 0, chute: 0, pourZ: 1.6 * P }; });
        mx.here = r1;
        jbGo(plan, mx, r1 + 0.5, { extra: { turn: 0 } });
      })(mx, r0, r1);
      // (the next can only back in once this one has gone)
      wkReserve(plan, mstand, r0 - 30, r1 + 10);
      lastOut = r1;
    }
    // (the pump pouring till the last mixer is empty: six of them, and the waits between, ran past it)
    pourDur = Math.max(pourDur, lastOut - tPour);
    jbStay(pump, tUp - 12, tUp, function (k) { return { legs: wkSmooth(k), fold: 1 - wkSmooth((k - 0.5) * 2) }; });
    jbStay(pump, tUp, tPour, function (k) { return { legs: 1, fold: 0, tip: wkLerp(wkLerp(pumpW, tipAt(0), 0.5), tipAt(0), wkSmooth(k)), pour: 0 }; });
    jbStay(pump, tPour, tPour + pourDur, function (k) { return { legs: 1, fold: 0, tip: tipAt(k), pour: 1, pourZ: basement ? formZ0 : -0.3 * P }; });
    jbStay(pump, tPour + pourDur, tPour + pourDur + 12, function (k) { return { legs: 1 - wkSmooth((k - 0.5) * 2), fold: wkSmooth(k * 2), tip: tipAt(1), pour: 0 }; });
    pump.here = tPour + pourDur + 12;
    jbGo(plan, pump, pump.here, { speed: 5 });
    // the concrete: up the forms (walls), across (the slab), as the boom passes
    var conc = wkPiece(plan, tPour, [], { live: function (faces, T) {
      var k = wkClamp((T - tPour) / pourDur), wet = T < tPour + pourDur + 40;
      var how = wet ? WK_WET : WK_CONC;
      if (basement) {
        edges.forEach(function (e, i) {
          var a = i / edges.length, b2 = (i + 1) / edges.length;
          if (k <= a) { return; }
          var q = wkClamp((k - a) / (b2 - a)), end = [e.a[0] + (e.b[0] - e.a[0]) * q, e.a[1] + (e.b[1] - e.a[1]) * q];
          var mx2 = (e.a[0] + e.b[0]) / 2 - e.u.x, my2 = (e.a[1] + e.b[1]) / 2 - e.u.y, l2 = Math.hypot(mx2, my2) || 1;
          cnBox(faces, (e.a[0] + end[0]) / 2 - mx2 / l2 * 0.05 * P, (e.a[1] + end[1]) / 2 - my2 / l2 * 0.05 * P, Math.hypot(end[0] - e.a[0], end[1] - e.a[1]) / 2, 0.1 * P, formZ0, formZ0 + formH * Math.min(1, q * 1.4 + 0.2), how, Math.atan2(e.b[1] - e.a[1], e.b[0] - e.a[0]));
        });
      } else {
        var y1 = b[2] + (b[3] - b[2]) * k;
        if (k > 0) { v3Prism(faces, [[b[0], b[2]], [b[1], b[2]], [b[1], y1], [b[0], y1]], -0.6 * P, -0.12 * P, how); }
      }
    } });
    var cured = tPour + pourDur + 40;
    conc.t1 = basement ? cured + 6 : 1e9;
    // finishing the slab behind the pour: two on their knees, troweling
    if (!basement) {
      var fin = wkPick(plan, 2, [b[0], b[2], 0], crew);
      fin.forEach(function (w, i) {
        wkGo(plan, w, [b[0] - 0.8 * P, b[2] + (i + 0.5) * 2 * P, 0], { after: tPour - 4 });
        var steps = 6;
        for (var s = 0; s < steps; s++) {
          var tt = tPour + pourDur * (s + 0.5) / steps, yy = b[2] + (b[3] - b[2]) * (s + 0.3) / steps;
          wkGo(plan, w, [i ? b[1] + 0.6 * P : b[0] - 0.6 * P, yy, 0], { after: tt - 6, straight: true });
          wkDo(w, 5, "kneel", i ? Math.PI + J.S.a * 0 : 0);
        }
      });
    }
    // forms struck once it has set: each board back to the yard
    var strike = cured;
    formPcs.forEach(function (pc, i) {
      var w = wkPick(plan, 1, null, crew)[0], f0 = pc.faces[0].pts[0];
      wkGo(plan, w, [f0[0], f0[1], basement ? floorZ : 0], { after: strike });
      wkDo(w, 1.5, "hammer");
      pc.t1 = w.free;
      wkGo(plan, w, [yardW[0], yardW[1], 0], { carry: { kind: "board", n: 1, len: 2.4, how: basement ? WK_PLY : WK_FORM } });
    });
    var struck = crew.reduce(function (m, w) { return Math.max(m, w.free); }, strike);
    // the slab poured, the foundation walls standing: the building's own
    if (basement) {
      J.wallsUpAt = conc.t1;
      // the basement's floor slab: the pump's job again would be another visit -- poured by barrow down a ramp
      J.slabAt = struck + 30;
      var slabPc = wkPiece(plan, struck + 2, [], { live: function (faces, T) {
        var k = wkClamp((T - struck - 2) / 28);
        J.pits.forEach(function (u) {
          var cs = [[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, -u.hh + 2 * u.hh * k], [-u.hw, -u.hh + 2 * u.hh * k]].map(function (q) { return jbRectPt(u, q[0], q[1]); });
          v3Prism(faces, cs, u.z - 0.25 * P, u.z - 0.02 * P, T < J.slabAt + 30 ? WK_WET : WK_CONC);
        });
      } });
      slabPc.t1 = 1e9;
      // (barrows of it, wheeled down the ramp by two)
      var bar = wkPick(plan, 2, null, crew), pitC = [J.pits[0].x, J.pits[0].y, floorZ];
      bar.forEach(function (w, i) {
        for (var s = 0; s < 5; s++) {
          wkGo(plan, w, [yardW[0], yardW[1] + i * P, 0], { after: struck });
          wkDo(w, 1, "hold");
          wkGo(plan, w, [pitC[0] + (s - 2) * P, pitC[1] + (i - 0.5) * 2 * P, floorZ], { carry: { kind: "bucket" } });
          wkDo(w, 1.5, "kneel");
        }
      });
      // foundation walls and the footing faces of the building: there once the forms are struck
      Object.keys(plan.groups).forEach(function (k) {
        var G = plan.groups[k];
        if (k === "found" || (G.lvl === J.base && k.indexOf("wo:") === 0)) { wkReveal(plan, k, conc.t1, conc.t1 + 0.5, "fade"); }
      });
    } else {
      Object.keys(plan.groups).forEach(function (k) { if (k === "found") { wkReveal(plan, k, struck, struck + 1, "fade"); } });
      J.slabAt = cured;
    }
    J.foundAt = Math.max(struck, J.slabAt || 0) + 2;
    wkSay(plan, "jb_pour", tPour - 10, tPour + pourDur);
    wkSay(plan, "jb_strike", strike, struck);
    plan.T = Math.max(plan.T, J.foundAt);
  } });

  // ---- 4b. the crew's pickups onto the drive -----------------------------------------------------------
  // (a vehicle's own trip, t0 to t1, against every other machine there then: true when it meets none)
  function jbTripClear(plan, m, t0, t1, skip) {
    var P = plan.site.P, others = plan.machines.filter(function (o) { return o !== m && WK_FOOT[o.kind] && o.kind !== "towercrane" && !(skip && skip.indexOf(o) >= 0); });
    function box(o, st) {
      var f = WK_FOOT[o.kind], c = Math.cos(st.ang), s = Math.sin(st.ang);
      return [st.x + c * f[0] * P, st.y + s * f[0] * P, f[1] * P + 0.3 * P, f[2] * P + 0.3 * P, st.ang];
    }
    for (var T = t0; T <= t1; T += 0.5) {
      var a = wkMachineAt(m, T);
      if (!a || a.x === undefined) { continue; }
      var me = box(m, a);
      for (var i = 0; i < others.length; i++) {
        var b = wkMachineAt(others[i], T);
        if (b && b.x !== undefined && !b.onTrailer && wkRectsMeet(me, box(others[i], b))) { return false; }
      }
    }
    return true;
  }
  // (2026-10-05: parked on the drive from the first day, the low loader and the excavator had no way
  // past them onto the lot, and drove through them.)  On the kerb while the ground is dug and the
  // foundations go in; then, one after another, each driven off round the block and backed onto the
  // drive -- or into the parking lot -- its place at the kerb given back.  Those after drive round them.
  WK_PHASES.push({ name: "parkin", make: function (plan) {
    var J = jbJ(plan), P = J.P, site = J.site, spots = (J.driveStands || []).slice();
    if (!spots.length || !J.pickups || !J.pickups.length) { return; }
    var t = Math.max(J.foundAt || 0, J.slabAt || 0, J.dugAt || 0) + 10, next = t;
    J.pickups.forEach(function (m) {
      if (!spots.length || m.onLot || !m.stand) { return; }
      var st = spots.shift();
      // (still free from then on: nothing reserved there since, nothing stood or stacked on it)
      if (!wkRectFree(site, st.cx, st.cy, 2.85 * P, 1.0 * P, st.ang, [WK_STACK, WK_LOT, WK_PAVED, WK_WALKWAY], plan.res, t, 1e9)) { return; }
      var go = next, kerb = m.stand, kc = [kerb.cx === undefined ? kerb.x : kerb.cx, kerb.cy === undefined ? kerb.y : kerb.cy];
      // (2026-10-05, machines clipping: pulled out of the kerb into a lorry driving away along the
      // street, or backed onto the drive through one stood at the kerb in front of it -- now each
      // waits, ten seconds at a time, till its way off and back is clear of what is there then)
      var keep = { segs: m.segs.length, res: plan.res.length, stand: m.stand, len: m.len, here: m.here, arrived: m.arrived };
      for (var tries = 0; tries < 60; tries++) {
        jbGo(plan, m, go, { speed: 6 });
        jbCome(plan, m, st, 5.6 * P, go + 50, { speed: 6 });
        if (tries === 59 || jbTripClear(plan, m, go, go + 51)) { break; }
        m.segs.length = keep.segs; plan.res.length = keep.res;
        m.stand = keep.stand; m.len = keep.len; m.here = keep.here; m.arrived = keep.arrived;
        go += 10;
      }
      next = go + 30;
      plan.res.forEach(function (r) { if (r.t1 >= 1e8 && Math.abs(r.rect[0] - kc[0]) < 1 && Math.abs(r.rect[1] - kc[1]) < 1) { r.t1 = go + 10; } });
      jbMarkCar(J, kerb, WK_ROAD, [WK_CAR]);
      m.onLot = true;
      jbMarkCar(J, st);
      wkReserve(plan, st, go + 30, 1e9);
    });
  } });
