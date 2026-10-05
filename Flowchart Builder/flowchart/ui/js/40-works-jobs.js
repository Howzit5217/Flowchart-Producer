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
    // where the timber, the blocks and the windows are stacked: the front yard if it can be
    var front = [(S.box[0] + S.box[1]) / 2, (S.box[3] + S.hy) / 2];
    J.yard = jbSpot(J, 7, 4.5, front, 1.0);
    J.skip = jbSpot(J, 4.2, 2.2, [J.yard.l[0] + 7 * P, J.yard.l[1]], 0.6);
    J.loo = jbSpot(J, 1.5, 1.5, [J.yard.l[0] - 5 * P, J.yard.l[1]], 0.4);
    [J.skip, J.loo].forEach(function (q) {
      site.mark([[q.l[0] - q.hw, q.l[1] - q.hh], [q.l[0] + q.hw, q.l[1] - q.hh], [q.l[0] + q.hw, q.l[1] + q.hh], [q.l[0] - q.hw, q.l[1] + q.hh]].map(function (c) { return S.W(c[0], c[1]); }), WK_THING);
    });
    // the skip and the toilet, there from the start
    [["skip", J.skip], ["loo", J.loo]].forEach(function (a) {
      var m = wkMachine(plan, a[0], {});
      m.site = site;
      var st = { x: a[1].l[0], y: a[1].l[1], ang: 0 };
      wkMSeg(m, 0, 1e9, function () { return { x: st.x, y: st.y, ang: st.ang, site: site }; });
      J[a[0] + "M"] = m;
    });
    // the crew in their pickups, parked along the kerb; out of them, to the yard
    var picks = Math.ceil(n / 3), looks = [];
    J.pickups = [];
    for (var p = 0; p < picks; p++) {
      // (along the kerb past the lot's sides: its own frontage kept for the deliveries)
      var lotHw = site.lot ? site.lot.w / 2 : (S.box[1] - S.box[0]) / 2 + 8 * P, side = p % 2 ? 1 : -1, nth = Math.floor(p / 2);
      var m2 = jbVehicle(plan, "pickup", { len: 5.6 * P, wid: 2.0 * P, target: [side * (lotHw + 7 * P + nth * 6.5 * P), S.kerb + 1.2 * P], street: true, t0: 0, t1: 1e9 },
                         { paint: WK_PAINT[p % WK_PAINT.length] });
      var way0 = wkArrive(site, m2.stand, 5.6 * P), tf0 = way0.fwd.len / (8 * P) + 2 + (way0.back ? way0.back.len / (2 * P) + 2 : 0);
      var ready = Math.max(3 + p * 5, (J.lastPickStart === undefined ? -Infinity : J.lastPickStart + 3.5) + tf0);
      J.lastPickStart = jbCome(plan, m2, m2.stand, 5.6 * P, ready, { speed: 8 });
      (function (st) {
        var c = Math.cos(st.ang), s2 = Math.sin(st.ang), cx = st.cx === undefined ? st.x : st.cx, cy = st.cy === undefined ? st.y : st.cy, hl = 2.9 * P, hw = 1.0 * P;
        site.mark([[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]].map(function (q) { return S.W(cx + q[0] * c - q[1] * s2, cy + q[0] * s2 + q[1] * c); }), WK_CAR);
      })(m2.stand);
      wkReserve(plan, m2.stand, ready - 2, 1e9);
      J.pickups.push(m2);
    }
    J.crew = [];
    for (var q = 0; q < n; q++) {
      var pk = J.pickups[Math.floor(q / 3)], st2 = pk.stand;
      var look = { own: true, fill: WK_VEST[q % WK_VEST.length], line: "#2e3846", outfit: "vest", hardhat: true,
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
    var targets = [];
    if (basement) {
      pits.forEach(function (u) {
        for (var gx = -u.hw + 1 * P; gx <= u.hw - 1 * P; gx += 2.2 * P) {
          for (var gy = -u.hh + 1 * P; gy <= u.hh - 1 * P; gy += 2.2 * P) { targets.push(jbRectPt(u, gx, gy)); }
        }
        if (!targets.length) { targets.push([u.x, u.y]); }
      });
    } else {
      // the trench for the footings, round the outside of the ground floor
      var per = [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]];
      per.forEach(function (a, i) {
        var e = per[(i + 1) % 4], len = Math.hypot(e[0] - a[0], e[1] - a[1]), n = Math.max(1, Math.round(len / (2.5 * P)));
        for (var k = 0; k < n; k++) { targets.push([a[0] + (e[0] - a[0]) * (k + 0.5) / n, a[1] + (e[1] - a[1]) * (k + 0.5) / n]); }
      });
    }
    var cycles = Math.max(10, Math.min(basement ? 34 : 18, targets.length));
    // the excavator's stand: backed in from the street, its back to the dig
    var near = basement ? jbLocal(J, [pits[0].x, pits[0].y]) : [(S.box[0] + S.box[1]) / 2, S.box[3]];
    if (basement) {
      // (the pit's side nearest the street)
      var bestD = Infinity;
      pits.forEach(function (u) {
        [[0, u.hh], [0, -u.hh], [u.hw, 0], [-u.hw, 0]].forEach(function (o) { var w = jbRectPt(u, o[0], o[1]), l = jbLocal(J, w); if (-l[1] < bestD) { bestD = -l[1]; near = l; } });
      });
    }
    var t0 = Math.max(J.stakedAt || 0, J.startAt) + 4;
    // (the pit marked: no machine stands in it)
    pits.forEach(function (u) { site.mark([[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, u.hh], [-u.hw, u.hh]].map(function (q) { return jbRectPt(u, q[0], q[1]); }), WK_PIT); });
    // (tracked: it can stand anywhere beside the pit it can crawl to -- not only where a lorry could back in)
    var ex = wkMachine(plan, "excavator", {});
    ex.site = site;
    var exSt = wkNearStand(plan, { len: 4.4 * P, wid: 2.9 * P, target: near, reach: 7 * P, min: 2.4 * P, t0: t0, t1: t0 + 900 });
    if (exSt) { exSt.ang = Math.atan2(near[1] - exSt.y, near[0] - exSt.x) + Math.PI; exSt.cx = exSt.x; exSt.cy = exSt.y; ex.stand = exSt; }
    else { ex.stand = wkStand(plan, { kind: "excavator", target: near, reach: 3.5 * P, t0: t0, t1: t0 + 600, ground: true }); }
    var lb = jbVehicle(plan, "lowboy", { len: 19 * P, wid: 2.6 * P, target: [ex.stand.x + 10 * P, S.kerb + 1.5 * P], street: true, t0: t0 - 30, t1: t0 + 60 });
    var arriveLow = t0;
    jbCome(plan, lb, lb.stand, 19 * P, arriveLow, { speed: 5, extra: { carrying: true } });
    // off the low loader, round onto the lot, to its stand
    var deck = [lb.stand.x + 9.1 * P, lb.stand.y, 1.0 * P];
    var rear = [lb.stand.x + 17.5 * P, lb.stand.y];
    rear.back = true;
    var way = wkVehWay(site, [rear[0], site.lanes.w - 1.2 * P], [ex.stand.x, ex.stand.y], 2.3 * P);
    var path = [deck, rear].concat(way.slice(0, -1).map(function (q) { return [q[0], q[1]]; })).concat([[ex.stand.x, ex.stand.y]]);
    path.head = Math.PI;
    var tOff = arriveLow + 3;
    jbStay(lb, arriveLow, tOff, function () { return { carrying: true }; });
    lb.here = tOff;
    var lbBack = lb;
    var tAt = jbTracked(plan, ex, path, tOff, 1.0, { working: false });
    var exRes = { rect: [ex.stand.cx === undefined ? ex.stand.x : ex.stand.cx, ex.stand.cy === undefined ? ex.stand.y : ex.stand.cy, 2.6 * P, 1.9 * P, ex.stand.ang], t0: tAt - 5, t1: 1e9 };
    plan.res.push(exRes);
    // the lorry's stand: by the excavator, within its reach
    var exW = jbWorld(J, [ex.stand.x, ex.stand.y]);
    var trk = wkStand(plan, { kind: "dumper", target: [ex.stand.x, ex.stand.y], reach: 7 * P, t0: tAt, t1: tAt + 600, ground: true });
    var trkW = jbWorld(J, [trk.x + Math.cos(trk.ang) * -2.4 * P, trk.y + Math.sin(trk.ang) * -2.4 * P]);
    var useTrucks = Math.hypot(trkW[0] - exW[0], trkW[1] - exW[1]) < 8.5 * P;
    // the heap: by the excavator, for what is put back round the walls
    var heap = jbSpot(J, 4.5, 4.0, [ex.stand.x + (ex.stand.x > (S.box[0] + S.box[1]) / 2 ? 5.5 : -5.5) * P, ex.stand.y - 1 * P], 0.4);
    var heapW = jbWorld(J, heap.l, 0);
    var t = tAt + 1, dugAt = [], heapAt = [], trucks = [], cur = null, inTruck = 0, swPrev = ex.head;
    var exFoot = function (sw) { return [exW[0] + Math.cos(S.a + ex.head + sw) * 1.0 * P, exW[1] + Math.sin(S.a + ex.head + sw) * 1.0 * P, 1.95 * P]; };
    function aimAt(p, z) {
      var sw = Math.atan2(p[1] - exW[1], p[0] - exW[0]) - (S.a + ex.head);
      var foot = exFoot(sw), r = Math.hypot(p[0] - foot[0], p[1] - foot[1]) / P - 0.3;
      return { sw: sw, r: Math.max(2.0, Math.min(8.0, r)), z: (z - foot[2]) / P };
    }
    var groundZ = jbGround(exW[0], exW[1]);
    for (var c = 0; c < cycles; c++) {
      var tgt = targets[Math.floor(c * targets.length / cycles) % targets.length];
      var depthNow = depth * (c + 0.5) / cycles;
      var dig = aimAt(tgt, groundZ - depthNow);
      var toTruck = useTrucks && (c % 8) < 6;
      if (toTruck && !cur) {
        // a lorry backed in for these
        cur = jbVehicle(plan, "dumper", { len: 8.6 * P, wid: 2.6 * P, target: [ex.stand.x, ex.stand.y], reach: 7 * P, t0: t - 5, t1: t + 80 }, { paint: "#c9ced3" });
        cur.stand = trk;
        var ready = Math.max(t, (trucks.length ? trucks[trucks.length - 1].goneAt + 4 : t));
        jbCome(plan, cur, trk, 8.6 * P, ready, { speed: 6 });
        cur.loads = [];
        trucks.push(cur);
        t = Math.max(t, ready);
        inTruck = 0;
      }
      var dumpP = toTruck ? jbWorld(J, [trk.x + Math.cos(trk.ang) * -1.0 * P, trk.y + Math.sin(trk.ang) * -1.0 * P], 2.6 * P) : [heapW[0], heapW[1], 1.4 * P];
      var dump = aimAt(dumpP, dumpP[2]);
      var cyc = { sw0: dig.sw, r0: dig.r, z0: dig.z, sw1: dump.sw, r1: dump.r, z1: dump.z, swPrev: swPrev }, dur = 9;
      (function (cyc, c, hd) { wkMSeg(ex, t, t + dur, function (k) { return Object.assign({ x: ex.stand.x, y: ex.stand.y, ang: hd, site: site, working: true }, jbCycle(cyc, k)); }); })(cyc, c, ex.head);
      dugAt.push(t + dur * 0.45);
      if (toTruck) { cur.loads.push(t + dur * 0.88); inTruck++; }
      else { heapAt.push(t + dur * 0.88); }
      swPrev = dump.sw;
      t += dur;
      if (toTruck && (inTruck >= 6 || c === cycles - 1)) {
        // full: away with it
        var me = cur, loads = me.loads.slice();
        jbStay(me, me.here, t + 0.5, function (k, T) { var n = 0; loads.forEach(function (tt) { if (T >= tt) { n++; } }); return { fill: n / 6 }; });
        me.here = t + 0.5;
        var gone = jbGo(plan, me, t + 0.5, { extra: { fill: loads.length / 6 } });
        me.goneAt = t + 0.5 + Math.min(16, (gone - t) * 0.45);
        cur = null;
      }
    }
    // back on the low loader, and away
    var tDone = t + 1;
    var back = way.slice().reverse().map(function (q) { return [q[0], q[1]]; });
    back[0] = [ex.stand.x, ex.stand.y];
    back = back.concat([rear, deck]);
    back.head = ex.head;
    // (the low loader went once the excavator was off it -- after it had driven clear -- and comes back now)
    var offClear = tAt;
    lb.here = offClear;
    jbGo(plan, lb, offClear, { speed: 5, extra: { carrying: false } });
    lbBack = wkMachine(plan, "lowboy", {});
    lbBack.site = site;
    lbBack.stand = lb.stand;
    jbCome(plan, lbBack, lb.stand, 19 * P, tDone - 2, { speed: 5, extra: { carrying: false } });
    var tOn = jbTracked(plan, ex, back, tDone, 1.0, {});
    ex.segs[ex.segs.length - 1].gone = true;
    exRes.t1 = tOn;
    jbStay(lbBack, tDone - 2, tOn, function () { return { carrying: false }; });
    lbBack.here = tOn;
    jbGo(plan, lbBack, tOn + 1, { speed: 5, extra: { carrying: true } });
    // the ground as dug: the pit going down, its earth sides; the heap growing
    var digT0 = dugAt[0], digT1 = dugAt[dugAt.length - 1];
    function dugNow(T) { var n = 0; for (var i = 0; i < dugAt.length; i++) { if (T >= dugAt[i]) { n++; } } return n / dugAt.length; }
    J.dugAt = tDone;
    J.depth = depth;
    J.pitFaces = function (faces, T, keepWalls) {
      var d = depth * dugNow(T);
      if (basement) {
        pits.forEach(function (u) {
          var cs = [[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, u.hh], [-u.hw, u.hh]].map(function (q) { var w = jbRectPt(u, q[0], q[1]); return [w[0], w[1], jbGround(w[0], w[1])]; });
          var floorZ = Math.min.apply(null, cs.map(function (q) { return q[2]; })) - d;
          if (J.slabAt === undefined || T < J.slabAt) { faces.push({ pts: cs.map(function (q) { return [q[0], q[1], floorZ]; }), n: [0, 0, 1], how: WK_DIRT, moves: d > 0 && T < digT1 + 1 }); }
          if (keepWalls) {
            for (var i = 0; i < 4; i++) {
              var a = cs[i], e = cs[(i + 1) % 4], mx = (a[0] + e[0]) / 2 - u.x, my = (a[1] + e[1]) / 2 - u.y, l = Math.hypot(mx, my) || 1;
              faces.push({ pts: [[a[0], a[1], floorZ], [e[0], e[1], floorZ], [e[0], e[1], e[2]], [a[0], a[1], a[2]]], n: [-mx / l, -my / l, 0], how: WK_DIRT, moves: d > 0 && T < digT1 + 1 });
            }
          }
        });
      } else if (d > 0) {
        // the trench, a dark band round the footprint
        var per2 = [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]], k2 = d / depth;
        per2.forEach(function (a, i) {
          var e = per2[(i + 1) % 4], ex2 = [a[0] + (e[0] - a[0]) * Math.min(1, k2 * 4 - i), a[1] + (e[1] - a[1]) * Math.min(1, k2 * 4 - i)];
          if (k2 * 4 - i <= 0) { return; }
          cnBeam(faces, [a[0], a[1], 0.03 * P], [ex2[0], ex2[1], 0.03 * P], 0.6 * P, WK_DIRT, 0.04 * P);
        });
      }
    };
    // (the pit: there from the start -- level with the ground till it is dug -- till the foundation walls are up)
    wkPiece(plan, 0, [], { live: function (faces, T) { J.pitFaces(faces, T, J.wallsUpAt === undefined || T < J.wallsUpAt); } });
    // the heap: a mound growing as the buckets are tipped on it
    var heapPc = wkPiece(plan, heapAt.length ? heapAt[0] : 1e9, [], { live: function (faces, T) {
      var n = 0; heapAt.forEach(function (tt) { if (T >= tt) { n++; } });
      if (!n) { return; }
      var h = Math.min(2.2, 0.4 + n * 0.12) * P, r = Math.min(2.4, 0.8 + n * 0.1) * P;
      wkMound(faces, heapW, r, h);
    } });
    J.heapPc = heapPc; J.heapW = heapW; J.heap = heap;
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
    jbStay(pump, tUp - 12, tUp, function (k) { return { legs: wkSmooth(k), fold: 1 - wkSmooth((k - 0.5) * 2) }; });
    jbStay(pump, tUp, tPour, function (k) { return { legs: 1, fold: 0, tip: wkLerp(wkLerp(pumpW, tipAt(0), 0.5), tipAt(0), wkSmooth(k)), pour: 0 }; });
    jbStay(pump, tPour, tPour + pourDur, function (k) { return { legs: 1, fold: 0, tip: tipAt(k), pour: 1, pourZ: basement ? formZ0 : -0.3 * P }; });
    jbStay(pump, tPour + pourDur, tPour + pourDur + 12, function (k) { return { legs: 1 - wkSmooth((k - 0.5) * 2), fold: wkSmooth(k * 2), tip: tipAt(1), pour: 0 }; });
    pump.here = tPour + pourDur + 12;
    jbGo(plan, pump, pump.here, { speed: 5 });
    // the mixers, each in turn backed up behind the pump
    var mstand = { x: pump.stand.x + 11.8 * P, y: pump.stand.y, ang: 0, street: true, hl: 5 * P, hw: 1.5 * P, cx: pump.stand.x + 11.8 * P, cy: pump.stand.y };
    var gap = 24, each = Math.max(12, (pourDur - gap * (mixers - 1)) / mixers);
    for (var mi = 0; mi < mixers; mi++) {
      var mx = wkMachine(plan, "mixer", { paint: mi % 2 ? "#f2f2ee" : "#2f5d8a" });
      mx.site = site;
      var r0 = tPour + mi * (each + gap), r1 = r0 + each;
      jbCome(plan, mx, mstand, 9.4 * P, r0 - 1, { speed: 6, extra: { turn: 0 } });
      (function (mx, r0, r1) {
        jbStay(mx, r0 - 1, r1, function (k, T) { return { turn: T * 2.2, pour: k > 0.02 && k < 0.98 ? 1 : 0, chute: 0, pourZ: 1.6 * P }; });
        mx.here = r1;
        jbGo(plan, mx, r1 + 0.5, { extra: { turn: 0 } });
      })(mx, r0, r1);
      // (the next can only back in once this one has gone)
      wkReserve(plan, mstand, r0 - 30, r1 + 10);
    }
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
