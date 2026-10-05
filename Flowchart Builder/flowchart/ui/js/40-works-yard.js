// ---------------------------------------------------------------------------
//  40-works-yard.js -- the yard put in by the crew as the building is
//  finished: a pool dug by the excavator, its shell formed and sprayed, its
//  coping laid and the water run in; the deck, the patio and the court laid
//  board by board; a gazebo, a pavilion or a shed framed and finished; the
//  hot tub set down; the grill, the loungers, the benches, the planters,
//  the trampoline and the rest carried out and set in their places.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "update it ... so the construction also includes
  // all things outside like pools, landscaping etc")  The paving, the
  // planting, the fences and the lawn are 40-works-site.js's (phase "site",
  // keys "site:..."); these are this phase's ("yard", keys "yard:...") --
  // agreed between the two, kind by kind.
  var YD_KINDS = { i_pool: "pool", i_hottub: "tub", i_deck: "deck", i_patio: "deck", i_court: "deck",
                   i_gazebo: "frame", i_pavilion: "frame", i_shed: "frame",
                   i_trampoline: "item", i_swing: "item", i_grill: "item", i_lounger: "item", i_gardenbench: "item",
                   i_bench: "item", i_planter: "item", i_firepit: "item", i_birdbath: "item" };
  var YD_WATER = { piece: true, color: "#1e8fc2", edge: "#1e8fc2", pat: 80, alpha: 0.62, bare: true };

  // ---- which of the yard each face is ----------------------------------------------------------------
  // (a pool in three: its basin -- the shell, tiled -- its coping and ladder, its water)
  function ydGroup(site, f) {
    var n = f.node, ramp = f.acRamp !== undefined;
    if (!(ramp || (n && YD_KINDS[n.kind])) || !f.pts || !f.pts.length) { return null; }
    var lo = Infinity, hi = -Infinity, cx = 0, cy = 0, k = f.pts.length;
    for (var i = 0; i < k; i++) { var p = f.pts[i], z = p[2] || 0; if (z < lo) { lo = z; } if (z > hi) { hi = z; } cx += p[0] / k; cy += p[1] / k; }
    // (a ramp's rails -- 40-access.js -- by which ramp)
    if (ramp) { return { key: "yard:ramp" + f.acRamp, lvl: 0, lo: lo, hi: hi, c: [cx, cy, (lo + hi) / 2], mesh: false, node: null, yard: true }; }
    var part = "";
    if (n.kind === "i_pool") { part = f.gpPool ? (f.how && f.how.pat === 80 ? ":water" : ":shell") : ":cope"; }
    return { key: "yard:" + n.id + part, lvl: 0, lo: lo, hi: hi, c: [cx, cy, (lo + hi) / 2], mesh: !!f.mesh, node: n, yard: true };
  }
  if (typeof WK === "object") {
    var ydClassifyWas = WK.classifyMore;
    WK.classifyMore = function (site, f) { return ydGroup(site, f) || (ydClassifyWas ? ydClassifyWas(site, f) : null); };
  }
  // The pool's basin and its water, the hot tub's water (40-gatespool.js),
  // the stalls' paint, signs and chargers and the ramps' rails
  // (40-access.js) are put into the picture after the build has made its
  // own: there from the first day -- a pool full of water, a blue stall on
  // the bare ground.  While a building goes up, put in before instead --
  // timed with the rest -- and not again after (model.ydBefore).
  if (typeof bpBuilding === "function") {
    var ydGpPut = typeof gpPut === "function" ? gpPut : null, ydGpTub = typeof gpTubFaces === "function" ? gpTubFaces : null;
    var ydBuildingWas = bpBuilding;
    if (ydGpPut) { gpPut = function (model) { if (model && model.ydBefore) { return; } return ydGpPut.apply(this, arguments); }; }
    if (ydGpTub) { gpTubFaces = function (model) { if (model && model.ydBefore) { return; } return ydGpTub.apply(this, arguments); }; }
    bpBuilding = function (model, t) {
      var m = model;
      if (model && model.faces && !model.ydBefore && V3 && V3.scene !== "space") {
        // (a copy: the model as built is kept as it is, for the next picture)
        m = Object.assign({}, model, { faces: model.faces.slice(),
                                       passing: model.passing ? { faces: model.passing.faces.slice(), stand: model.passing.stand } : undefined });
        try {
          if (!V3.flat) { if (ydGpPut) { ydGpPut(m); } if (ydGpTub) { ydGpTub(m); } }
          if (typeof acPutInto === "function") { acPutInto(m); }
          m.ydBefore = true;
        } catch (e) { m = model; }
      }
      var got = ydBuildingWas.apply(this, [m].concat(Array.prototype.slice.call(arguments, 1)));
      if (got && m.ydBefore) { got.ydBefore = true; }
      return got;
    };
  }

  // ---- the jobs ----------------------------------------------------------------------------------------
  // The parts of the yard, from the groups: each piece's keys, its box, its kind.
  function ydPieces(plan) {
    var by = {}, groups = plan.groups;
    Object.keys(groups).forEach(function (key) {
      if (key.indexOf("yard:") !== 0) { return; }
      var G = groups[key], id = key.split(":")[1], it = by[id], ramp = /^ramp/.test(id);
      if (!G.node && !ramp) { return; }
      if (!it) { it = by[id] = { node: G.node, kind: ramp ? "ramp" : YD_KINDS[G.node.kind], keys: [], x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, lo: Infinity, hi: -Infinity }; }
      it.keys.push(key);
      it.x0 = Math.min(it.x0, G.x0); it.x1 = Math.max(it.x1, G.x1); it.y0 = Math.min(it.y0, G.y0); it.y1 = Math.max(it.y1, G.y1);
      it.lo = Math.min(it.lo, G.lo); it.hi = Math.max(it.hi, G.hi);
    });
    var order = { pool: 0, frame: 1, ramp: 2, deck: 3, tub: 4, item: 5 };
    return Object.keys(by).map(function (id) {
      var it = by[id];
      it.c = [(it.x0 + it.x1) / 2, (it.y0 + it.y1) / 2];
      return it;
    }).sort(function (a, b) { return order[a.kind] - order[b.kind] || (b.x1 - b.x0) * (b.y1 - b.y0) - (a.x1 - a.x0) * (a.y1 - a.y0); });
  }
  // a point round a piece's edge, at ground level: the side nearest `from`, out by `out`
  function ydBeside(it, from, out, P) {
    var c = it.c, hw = (it.x1 - it.x0) / 2 + out, hh = (it.y1 - it.y0) / 2 + out;
    var dx = from[0] - c[0], dy = from[1] - c[1];
    var k = Math.min(hw / Math.max(1e-6, Math.abs(dx)), hh / Math.max(1e-6, Math.abs(dy)));
    var x = c[0] + dx * k, y = c[1] + dy * k;
    return [x, y, jbGround(x, y)];
  }
  // round a piece: n spots spread round its edge, out by `out`
  function ydRound(it, n, out) {
    var c = it.c, hw = (it.x1 - it.x0) / 2 + out, hh = (it.y1 - it.y0) / 2 + out, pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i + 0.5) / n * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
      var k = Math.min(hw / Math.max(1e-6, Math.abs(dx)), hh / Math.max(1e-6, Math.abs(dy)));
      var x = c[0] + dx * k, y = c[1] + dy * k;
      pts.push([x, y, jbGround(x, y)]);
    }
    return pts;
  }
  // carried out from the yard's stacks to it, `trips` times, by `ws`
  function ydCarry(plan, J, ws, it, trips, carry, t, P) {
    var yd = J.yard.w, end = t;
    for (var k = 0; k < trips; k++) {
      var w = ws[k % ws.length];
      wkGo(plan, w, [yd[0] + ((k % 3) - 1) * 0.6 * P, yd[1], 0], { after: t });
      wkDo(w, 0.8, "hold");
      var at = ydBeside(it, w.at, 0.7 * P, P);
      wkGo(plan, w, at, { carry: carry });
      wkDo(w, 1.0, "kneel", wkFace(at, it.c));
      end = Math.max(end, w.free);
    }
    return end;
  }
  // at work round it, each where they are, so long
  function ydWork(plan, ws, it, dur, pose, t, P) {
    var spots = ydRound(it, ws.length, 0.6 * P), end = t;
    ws.forEach(function (w, i) {
      wkGo(plan, w, spots[i], { after: t });
      wkDo(w, dur, pose, wkFace(spots[i], it.c));
      end = Math.max(end, w.free);
    });
    return end;
  }

  // A pool: dug, its shell formed and sprayed, the coping laid, filled.
  function ydPool(plan, J, it, t0) {
    var P = J.P, S = J.S, site = J.site, n = it.node, F = typeof gpFrame === "function" ? gpFrame(n) : null;
    if (!F) { F = { x: it.c[0], y: it.c[1], c: 1, s: 0, hw: (it.x1 - it.x0) / 2, hh: (it.y1 - it.y0) / 2, z: jbGround(it.c[0], it.c[1]) }; }
    var u = { x: F.x, y: F.y, hw: F.hw, hh: F.hh, c: F.c, s: F.s };
    var corners = [[-u.hw, -u.hh], [u.hw, -u.hh], [u.hw, u.hh], [-u.hw, u.hh]].map(function (q) { return jbRectPt(u, q[0], q[1]); });
    site.mark(corners, WK_PIT);
    var depth = Math.max(1.0 * P, F.z - it.lo + 0.15 * P), t = t0;
    // (2026-10-05: "make sure where things are being dug out is where the machine is digging")
    // The pit in squares of about two metres, each going down as the bucket bites into it --
    // one layer or two; the excavator moved from stand to stand so every bite is within its
    // reach; what no stand reaches dug by hand.  (It stood in one place, its bucket clamped to
    // reach, swinging at the air over the far end, the whole floor going down at once.)
    var side = Math.max(1.8 * P, Math.sqrt(4 * u.hw * u.hh / 24)), nx = Math.max(1, Math.round(2 * u.hw / side)), ny = Math.max(1, Math.round(2 * u.hh / side));
    var cw = 2 * u.hw / nx, ch = 2 * u.hh / ny, grid = [];
    for (var gi = 0; gi < nx; gi++) {
      for (var gj = 0; gj < ny; gj++) {
        var sq = { i: gi, j: gj, x0: -u.hw + cw * gi, x1: -u.hw + cw * (gi + 1), y0: -u.hh + ch * gj, y1: -u.hh + ch * (gj + 1), at: [] };
        sq.w = jbRectPt(u, (sq.x0 + sq.x1) / 2, (sq.y0 + sq.y1) / 2);
        grid.push(sq);                                     // (at gi * ny + gj)
      }
    }
    var passes = grid.length <= 12 ? 2 : 1;
    // its stands: each where its bucket reaches a run of what is left (its swing's foot a
    // metre ahead of its middle, the bucket 2-8 m out from that)
    function reaches(st, w) { var sw = jbWorld(J, [st.x, st.y]), d = Math.hypot(w[0] - sw[0], w[1] - sw[1]) / P; return d >= 3.4 && d <= 8.8; }
    function standFor(ws, from, min, reach) {
      var cx = 0, cy = 0;
      ws.forEach(function (w) { cx += w[0]; cy += w[1]; });
      var st = wkNearStand(plan, { len: 4.4 * P, wid: 2.9 * P, target: jbLocal(J, [cx / ws.length, cy / ws.length]), reach: reach || 6.5 * P, min: min || 3.2 * P, t0: from, t1: from + 400 });
      if (st) { st.cx = st.x; st.cy = st.y; }
      return st && reaches(st, ws[0]) ? st : null;
    }
    function nextStand(left, from) {
      for (var k = 0; k < Math.min(left.length, 8); k++) {
        var first = left[k], run = left.filter(function (q) { return Math.hypot(q.w[0] - first.w[0], q.w[1] - first.w[1]) < 6 * P; });
        var st = standFor(run.map(function (q) { return q.w; }), from) || standFor([first.w], from, 2.0 * P, 7.0 * P);
        if (st) { return { st: st, cells: left.filter(function (q) { return q === first || reaches(st, q.w); }) }; }
      }
      return null;
    }
    // (begun from the end nearest the street, where it is come at from)
    var left = grid.slice().sort(function (p, q) { return jbLocal(J, q.w)[1] - jbLocal(J, p.w)[1]; });
    var go = nextStand(left, t), dugAt = [], heaps = [], tDone = t, heapPc = null, shellAt = Infinity;
    if (go) {
      var ex = wkMachine(plan, "excavator", {});
      ex.site = site; ex.stand = go.st;
      // on a low loader, off it, round onto the lot to its first stand
      var lb = jbVehicle(plan, "lowboy", { len: 19 * P, wid: 2.6 * P, target: [ex.stand.x + 10 * P, S.kerb + 1.5 * P], street: true, t0: t - 30, t1: t + 60 });
      jbCome(plan, lb, lb.stand, 19 * P, t, { speed: 5, extra: { carrying: true } });
      var deck = [lb.stand.x + 9.1 * P, lb.stand.y, 1.0 * P], rear = [lb.stand.x + 17.5 * P, lb.stand.y];
      rear.back = true;
      var way = wkVehWay(site, [rear[0], site.lanes.w - 1.2 * P], [ex.stand.x, ex.stand.y], 2.3 * P);
      var path = [deck, rear].concat(way.slice(0, -1).map(function (q) { return [q[0], q[1]]; })).concat([[ex.stand.x, ex.stand.y]]);
      path.head = Math.PI;
      var tOff = t + 3;
      jbStay(lb, t, tOff, function () { return { carrying: true }; });
      lb.here = tOff;
      jbGo(plan, lb, tOff, { speed: 5, extra: { carrying: false } });
      var tc = jbTracked(plan, ex, path, tOff, 1.0, { working: false }) + 1, swPrev = ex.head, last = go.st;
      while (go && go.cells.length) {
        var st = go.st, stW = jbWorld(J, [st.x, st.y]), arrived = tc;
        ex.stand = st; last = st;
        var aimAt = (function (stW, hd) {
          return function (p, z) {
            var sw = Math.atan2(p[1] - stW[1], p[0] - stW[0]) - (S.a + hd);
            var f0 = [stW[0] + Math.cos(S.a + hd + sw) * 1.0 * P, stW[1] + Math.sin(S.a + hd + sw) * 1.0 * P, 1.95 * P];
            var r = Math.hypot(p[0] - f0[0], p[1] - f0[1]) / P - 0.3;
            return { sw: sw, r: Math.max(2.0, Math.min(8.0, r)), z: (z - f0[2]) / P };
          };
        })(stW, ex.head);
        // its heap: a clear patch within its reach, away from the pool -- or tipped beside it
        var outA = Math.atan2(stW[1] - u.y, stW[0] - u.x);
        var spot = jbSpot(J, 2.6, 2.6, jbLocal(J, [stW[0] + Math.cos(outA) * 5 * P, stW[1] + Math.sin(outA) * 5 * P]), 0.3);
        var heap = { w: spot.w, at: [] }, hd2 = Math.hypot(heap.w[0] - stW[0], heap.w[1] - stW[1]);
        if (hd2 > 7.6 * P || hd2 < 4.2 * P) { heap.w = [stW[0] + Math.cos(outA) * 5 * P, stW[1] + Math.sin(outA) * 5 * P, 0]; }
        heaps.push(heap);
        // the bites: from the far side of what it reaches back toward it, a layer at a time
        var mine = go.cells.slice().sort(function (p, q) { return Math.hypot(q.w[0] - stW[0], q.w[1] - stW[1]) - Math.hypot(p.w[0] - stW[0], p.w[1] - stW[1]); });
        for (var pass = 1; pass <= passes; pass++) {
          mine.forEach(function (sq2) {
            var dig = aimAt(sq2.w, F.z - depth * pass / passes), dump = aimAt([heap.w[0], heap.w[1]], 1.4 * P);
            var cyc = { sw0: dig.sw, r0: dig.r, z0: dig.z, sw1: dump.sw, r1: dump.r, z1: dump.z, swPrev: swPrev };
            (function (cyc, hd, sx, sy) { wkMSeg(ex, tc, tc + 9, function (k) { return Object.assign({ x: sx, y: sy, ang: hd, site: site, working: true }, jbCycle(cyc, k)); }); })(cyc, ex.head, st.x, st.y);
            // (the ground gives as the bucket closes in it; the heap grows as it is tipped)
            sq2.at.push(tc + 9 * 0.42); dugAt.push(tc + 9 * 0.42); heap.at.push(tc + 9 * 0.88);
            swPrev = dump.sw;
            tc += 9;
          });
        }
        plan.res.push({ rect: [st.cx, st.cy, 2.6 * P, 1.9 * P, st.ang], t0: arrived - 1, t1: tc + 1 });
        // on to the next stand, round what is in the way
        left = left.filter(function (q) { return go.cells.indexOf(q) < 0; });
        go = left.length ? nextStand(left, tc) : null;
        if (go) {
          var leg = wkVehWay(site, [st.x, st.y], [go.st.x, go.st.y], 2.0 * P).map(function (q) { return [q[0], q[1]]; });
          leg.head = ex.head;
          tc = jbTracked(plan, ex, leg, tc, 1.0, { working: false }) + 0.5;
        }
      }
      tDone = tc + 1;
      // back on the low loader, and away
      var back = wkVehWay(site, [last.x, last.y], [rear[0], site.lanes.w - 1.2 * P], 2.3 * P).map(function (q) { return [q[0], q[1]]; });
      back = back.concat([rear, deck]);
      back.head = ex.head;
      var lb2 = wkMachine(plan, "lowboy", {});
      lb2.site = site; lb2.stand = lb.stand;
      jbCome(plan, lb2, lb.stand, 19 * P, tDone - 2, { speed: 5, extra: { carrying: false } });
      var tOn = jbTracked(plan, ex, back, tDone, 1.0, {});
      ex.segs[ex.segs.length - 1].gone = true;
      jbStay(lb2, tDone - 2, tOn, function () { return { carrying: false }; });
      lb2.here = tOn;
      jbGo(plan, lb2, tOn + 1, { speed: 5, extra: { carrying: true } });
    }
    // what no stand reaches -- or all of it, where no machine can get round to it: dug by hand,
    // two of the crew with shovels, a square at a time, standing in it
    if (left.length) {
      var diggers = wkPick(plan, 2, [it.c[0], it.c[1], 0], J.crew), tHand = t;
      left.forEach(function (sq3, i) {
        var w = diggers[i % diggers.length];
        if (!w) { for (var k = 1; k <= passes; k++) { sq3.at.push(tDone); } return; }
        var at = [sq3.w[0], sq3.w[1], F.z];
        wkGo(plan, w, at, { after: t });
        for (var k2 = 1; k2 <= passes; k2++) {
          wkDo(w, 30 / passes, "shovel", wkFace(at, [u.x, u.y, 0]));
          sq3.at.push(w.free - 1); dugAt.push(w.free - 1);
        }
        tHand = Math.max(tHand, w.free);
      });
      dugAt.sort(function (p, q) { return p - q; });
      tDone = Math.max(tDone, tHand);
      left = [];
    }
    wkSay(plan, "jb_pooldig", t, tDone);
    // the heaps: each growing as the buckets are tipped on it; backfilled round the shell once
    // it is in, the rest taken away -- smaller, then gone
    if (heaps.length) {
      heapPc = wkPiece(plan, dugAt.length ? dugAt[0] : 1e9, [], { live: function (faces, T) {
        var keep = T < shellAt ? 1 : Math.max(0, 1 - (T - shellAt) / 40);
        if (keep <= 0.05) { return; }
        heaps.forEach(function (hp) {
          var k = 0; hp.at.forEach(function (tt) { if (T >= tt) { k++; } });
          if (k) { wkMound(faces, hp.w, Math.min(2.2, 0.7 + k * 0.1) * P * (0.4 + 0.6 * keep), Math.min(1.8, 0.3 + k * 0.1) * P * keep); }
        });
      } });
      heapPc.t1 = 1e9;
    }
    // the ground as dug: each square at its depth -- level with the lawn till it is bitten into --
    // its earth sides at the pool's edge, a step down to the square beside it; gone once the shell is in
    function sqDepth(sq4, T) { var k = 0; for (var i = 0; i < sq4.at.length; i++) { if (T >= sq4.at[i]) { k++; } } return depth * Math.min(passes, k) / passes; }
    function pitSide(faces, lx0, ly0, lx1, ly1, zLo, zHi, nl, live) {
      var a = jbRectPt(u, lx0, ly0), e = jbRectPt(u, lx1, ly1), nw = [nl[0] * u.c - nl[1] * u.s, nl[0] * u.s + nl[1] * u.c, 0];
      faces.push({ pts: [[a[0], a[1], zLo], [e[0], e[1], zLo], [e[0], e[1], zHi], [a[0], a[1], zHi]], n: nw, how: WK_DIRT, moves: live });
    }
    wkPiece(plan, 0, [], { live: function (faces, T) {
      if (T >= shellAt) { return; }
      var live = T < tDone + 1, D = grid.map(function (sq5) { return sqDepth(sq5, T); }), same = D.every(function (d) { return d === D[0]; });
      if (same) {
        faces.push({ pts: corners.map(function (q) { return [q[0], q[1], F.z - D[0]]; }), n: [0, 0, 1], how: WK_DIRT, moves: live });
      } else {
        grid.forEach(function (sq6, k) {
          faces.push({ pts: [[sq6.x0, sq6.y0], [sq6.x1, sq6.y0], [sq6.x1, sq6.y1], [sq6.x0, sq6.y1]].map(function (q) { var w = jbRectPt(u, q[0], q[1]); return [w[0], w[1], F.z - D[k]]; }), n: [0, 0, 1], how: WK_DIRT, moves: live });
        });
      }
      grid.forEach(function (sq7, k) {
        var d = D[k];
        if (d > 0) {
          if (sq7.i === 0) { pitSide(faces, -u.hw, sq7.y0, -u.hw, sq7.y1, F.z - d, F.z, [1, 0], live); }
          if (sq7.i === nx - 1) { pitSide(faces, u.hw, sq7.y0, u.hw, sq7.y1, F.z - d, F.z, [-1, 0], live); }
          if (sq7.j === 0) { pitSide(faces, sq7.x0, -u.hh, sq7.x1, -u.hh, F.z - d, F.z, [0, 1], live); }
          if (sq7.j === ny - 1) { pitSide(faces, sq7.x0, u.hh, sq7.x1, u.hh, F.z - d, F.z, [0, -1], live); }
        }
        if (sq7.i < nx - 1 && D[k + ny] !== d) { var dx = D[k + ny]; pitSide(faces, sq7.x1, sq7.y0, sq7.x1, sq7.y1, F.z - Math.max(d, dx), F.z - Math.min(d, dx), d > dx ? [-1, 0] : [1, 0], live); }
        if (sq7.j < ny - 1 && D[k + 1] !== d) { var dy = D[k + 1]; pitSide(faces, sq7.x0, sq7.y1, sq7.x1, sq7.y1, F.z - Math.max(d, dy), F.z - Math.min(d, dy), d > dy ? [0, -1] : [0, 1], live); }
      });
    } });
    // the shell: rebar and forms by hand down in it, then sprayed from a mixer at the kerb
    var crew = wkPick(plan, 3, [it.c[0], it.c[1], 0], J.crew);
    t = ydCarry(plan, J, crew, it, 3, { kind: "rebar", n: 4, len: 3.0 }, tDone + 2, P);
    t = ydWork(plan, crew, it, 24, "kneel", t, P);
    var mixer = wkMachine(plan, "mixer", { paint: "#f2f2ee" });
    mixer.site = site;
    // (at the kerb level with the pool, its line run in over the lot)
    var mx = wkStand(plan, { kind: "mixer", target: [jbLocal(J, it.c)[0], S.kerb + 1.4 * P], street: true, t0: t - 10, t1: t + 80 });
    var spray0 = t + 2, spray1 = spray0 + 40;
    wkVisit(plan, mixer, mx, 9.4 * P, spray0, [{ t0: spray0, t1: spray1, fn: function (k, T) { return { turn: T * 1.6, chute: 0.6 }; } }], spray1 + 1);
    t = ydWork(plan, crew, it, spray1 - spray0, "hold", spray0, P);
    shellAt = t;
    if (heapPc) { heapPc.t1 = shellAt + 40; }
    (it.keys.filter(function (k) { return /:shell$/.test(k); })).forEach(function (k) { wkReveal(plan, k, t - 6, t, "fade"); });
    wkSay(plan, "jb_poolshell", tDone + 2, t);
    // the coping round it, stone by stone
    t = ydCarry(plan, J, crew, it, 4, { kind: "board", n: 2, len: 1.0 }, t + 1, P);
    t = ydWork(plan, crew, it, 18, "kneel", t, P);
    (it.keys.filter(function (k) { return /:cope$/.test(k); })).forEach(function (k) { wkReveal(plan, k, t - 4, t, "pop"); });
    // filled from a hose at its edge: the water rising
    var hoser = crew[0], edge = ydBeside(it, hoser.at, 0.4 * P, P);
    wkGo(plan, hoser, edge, { after: t });
    var fill0 = hoser.free + 1, fill1 = fill0 + 60;
    wkDo(hoser, fill1 - hoser.free, "hold", wkFace(edge, it.c));
    var ix = u.hw - 0.3 * P, iy = u.hh - 0.3 * P, zTop = F.z - 0.12 * P, zLow = F.z - depth + 0.2 * P;
    var inner = [[-ix, -iy], [ix, -iy], [ix, iy], [-ix, iy]].map(function (q) { return jbRectPt(u, q[0], q[1]); });
    wkPiece(plan, fill0, [], { t1: fill1, live: function (faces, T) {
      var z = zLow + (zTop - zLow) * wkSmooth((T - fill0) / (fill1 - fill0));
      faces.push({ pts: inner.map(function (q) { return [q[0], q[1], z]; }), n: [0, 0, 1], how: YD_WATER, moves: true });
    } });
    (it.keys.filter(function (k) { return /:water$/.test(k); })).forEach(function (k) { wkReveal(plan, k, fill1, fill1, "pop"); });
    wkSay(plan, "jb_poolfill", fill0, fill1);
    return Math.max(fill1, hoser.free);
  }
  // A gazebo, a pavilion or a shed: the timber carried out, posts up, framed, finished.
  function ydFrame(plan, J, it, t0) {
    var P = J.P, ws = wkPick(plan, 3, [it.c[0], it.c[1], 0], J.crew), size = (it.x1 - it.x0) * (it.y1 - it.y0) / (P * P);
    var t = ydCarry(plan, J, ws, it, Math.max(3, Math.min(9, Math.round(size / 3))), { kind: "studs", n: 3, len: 2.4 }, t0, P);
    // its posts, up as the framing starts (the finished piece in their place once done)
    var top = Math.max(it.lo + 2.2 * P, it.hi - 0.4 * P), cs = [[it.x0, it.y0], [it.x1, it.y0], [it.x1, it.y1], [it.x0, it.y1]];
    var posts = wkPiece(plan, t, wkFacesOf(function (f) {
      cs.forEach(function (q) { cnBox(f, q[0] + Math.sign(it.c[0] - q[0]) * 0.1 * P, q[1] + Math.sign(it.c[1] - q[1]) * 0.1 * P, 0.06 * P, 0.06 * P, jbGround(q[0], q[1]), top, WK_TIMBER); });
    }));
    t = ydWork(plan, ws, it, Math.max(30, Math.min(90, size * 4)), "hammer", t, P);
    t = ydWork(plan, ws, it, 16, "up", t, P);
    posts.t1 = t;
    it.keys.forEach(function (k) { wkReveal(plan, k, t, t, "pop"); });
    return t;
  }
  // A deck, a patio, a court: laid from one end to the other.
  function ydDeck(plan, J, it, t0) {
    var P = J.P, ws = wkPick(plan, 2, [it.c[0], it.c[1], 0], J.crew), size = (it.x1 - it.x0) * (it.y1 - it.y0) / (P * P);
    var t = ydCarry(plan, J, ws, it, Math.max(2, Math.min(8, Math.round(size / 4))), { kind: "board", n: 4, len: 2.4 }, t0, P);
    var lay = Math.max(16, Math.min(80, size * 2.5)), along = (it.x1 - it.x0) >= (it.y1 - it.y0);
    var end = ydWork(plan, ws, it, lay, "kneel", t, P);
    var axis = along ? [it.x0, it.c[1], 1, 0] : [it.c[0], it.y0, 0, 1], len = along ? it.x1 - it.x0 : it.y1 - it.y0;
    it.keys.forEach(function (k) { wkReveal(plan, k, end - lay, end, "sweep", { axis: axis, len: len }); });
    return end;
  }
  // A ramp's rails (40-access.js): the tubes carried out, the posts set in, the rails run along their tops.
  function ydRamp(plan, J, it, t0) {
    var P = J.P, ws = wkPick(plan, 2, [it.c[0], it.c[1], 0], J.crew), span = (it.x1 - it.x0) + (it.y1 - it.y0);
    var t = ydCarry(plan, J, ws, it, Math.max(2, Math.min(8, Math.round(span / (4 * P)))), { kind: "rebar", n: 3, len: 3.0 }, t0, P);
    var fit = Math.max(20, Math.min(90, span / P * 2));
    t = ydWork(plan, ws, it, fit * 0.6, "kneel", t, P);
    var end = ydWork(plan, ws, it, fit * 0.4, "up", t, P), along = (it.x1 - it.x0) >= (it.y1 - it.y0);
    var axis = along ? [it.x0, it.c[1], 1, 0] : [it.c[0], it.y0, 0, 1], len = along ? it.x1 - it.x0 : it.y1 - it.y0;
    it.keys.forEach(function (k) { wkReveal(plan, k, end - fit, end, "sweep", { axis: axis, len: len }); });
    return end;
  }
  // A hot tub: carried out by two, set down.
  function ydTub(plan, J, it, t0) {
    var P = J.P, ws = wkPick(plan, 2, [it.c[0], it.c[1], 0], J.crew), yd = J.yard.w, t = t0;
    ws.forEach(function (w, i) { wkGo(plan, w, [yd[0] + i * 0.8 * P, yd[1], 0], { after: t0 }); });
    t = wkTogether(ws, t0);
    var at = ydBeside(it, ws[0].at, 0.5 * P, P);
    ws.forEach(function (w, i) { wkGo(plan, w, [at[0] + i * 0.9 * P, at[1], at[2]], { carry: { kind: "box" }, after: t }); });
    t = wkTogether(ws, t);
    ws.forEach(function (w) { wkDo(w, 3, "kneel", wkFace(w.at, it.c)); });
    t = wkTogether(ws, t);
    it.keys.forEach(function (k) { wkReveal(plan, k, t - 2, t, "drop", { drop: 0.5 * P }); });
    return t;
  }
  // The rest -- a grill, a lounger, a bench, a planter: carried out and set down.
  function ydItem(plan, J, it, t0) {
    var P = J.P, w = wkPick(plan, 1, [it.c[0], it.c[1], 0], J.crew)[0], yd = J.yard.w;
    wkGo(plan, w, [yd[0], yd[1], 0], { after: t0 });
    wkDo(w, 0.6, "hold");
    var at = ydBeside(it, w.at, 0.4 * P, P);
    wkGo(plan, w, at, { carry: { kind: "box" } });
    wkDo(w, 1.6, "kneel", wkFace(at, it.c));
    it.keys.forEach(function (k) { wkReveal(plan, k, w.free - 1, w.free, "drop", { drop: 0.3 * P }); });
    return w.free;
  }
  var YD_JOB = { pool: ydPool, frame: ydFrame, ramp: ydRamp, deck: ydDeck, tub: ydTub, item: ydItem };
  var YD_PHASE = { name: "yard", make: function (plan) {
    var J = jbJ(plan);
    if (!J.crew || !J.crew.length || !J.yard) { return; }
    var pieces = ydPieces(plan);
    if (!pieces.length) { return; }
    // once the outside of the building is done and the scaffold is down: the yard clear to work in
    var t0 = Math.max(J.scafDown || 0, J.shellDone || 0, J.roofDone || 0, J.slabAt || 0) + 4, end = t0;
    pieces.forEach(function (it) {
      try { end = Math.max(end, YD_JOB[it.kind](plan, J, it, t0)); }
      catch (e) {
        // (a job that would not work out: the piece there when the rest is done)
        if (window.console && console.warn) { console.warn("works, yard:", e && e.message); }
      }
    });
    wkSay(plan, "jb_yardbuild", t0, end);
    J.yardDone = end;
    plan.T = Math.max(plan.T, end);
  } };
  if (typeof WK_PHASES === "object") {
    // (before the paving and the planting -- 40-works-site.js -- or, without them, before moving in)
    var ydAt = -1;
    WK_PHASES.forEach(function (ph, i) { if (ydAt < 0 && (ph.name === "site" || ph.name === "movein")) { ydAt = i; } });
    if (ydAt >= 0) { WK_PHASES.splice(ydAt, 0, YD_PHASE); } else { WK_PHASES.push(YD_PHASE); }
  }
