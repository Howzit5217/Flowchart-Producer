// ---------------------------------------------------------------------------
//  40-works-steel.js -- a steel building put up: the steel delivered and
//  lifted off its lorries into the yard; a crane -- a mobile crane at the
//  kerb for a low building, a tower crane on the lot for a tall one, put up
//  first and climbing as the building rises -- setting each frame of
//  columns and beams where it goes, a pair of ironworkers bolting it at
//  each end; each floor's metal deck lifted up in bundles and laid sheet by
//  sheet, then poured -- from the pump, or by the crane's bucket up high;
//  the stairs; the walls between the rooms in metal studs; a tower's skin
//  lifted on panel by panel; the roof decked and its membrane rolled out.
//  Workers go up and down by a ladder, or a tower's hoist.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  var WK_STEELF = { piece: true, color: "#56606b", edge: "#353b42", pat: 22 };
  var WK_BRACE = { piece: true, color: "#b4452f", edge: "#7a2e1f", pat: 22 };
  var WK_DECKM = { piece: true, color: "#a3a9ae", edge: "#7b8186", pat: 23 };
  var WK_SLAB = { piece: true, color: "#b9b6ae", edge: "#8d8a83", pat: 10 };
  var WK_MEMB = { color: "#3a3d42", edge: "#2a2c30", pat: 0, roof: false, piece: true };
  var WK_CORE = { piece: true, color: "#a7a49c", edge: "#7f7c75", pat: 10 };

  // ---- a crane, either kind: lifts in turn, each picked up at one place and set down at another -------------
  // J.crane: { m (the machine), kind, pose (now), free (when it can next lift) }
  function jbCraneSetup(plan, J, t) {
    var P = J.P, S = J.S, site = J.site, ctx = J.ctx, top = J.levels[J.levels.length - 1].top;
    // how far it must reach: every corner of the building, from the kerb
    var mid = [(S.box[0] + S.box[1]) / 2, S.kerb + 1.4 * P], far = 0;
    [[ctx.x0, ctx.y0], [ctx.x1, ctx.y0], [ctx.x1, ctx.y1], [ctx.x0, ctx.y1]].forEach(function (c) { var l = jbLocal(J, c); far = Math.max(far, Math.hypot(l[0] - mid[0], l[1] - mid[1])); });
    var C = { kind: far < 31 * P && top < 22 * P && J.frame !== "tall" ? "mobile" : "tower", free: t };
    J.crane = C;
    if (C.kind === "mobile") {
      var m = jbVehicle(plan, "crane", { len: 13 * P, wid: 2.8 * P, target: [mid[0] - 3 * P, S.kerb + 1.4 * P], street: true, t0: t - 40, t1: 1e9 });
      C.m = m;
      jbCome(plan, m, m.stand, 13 * P, t - 14, { speed: 5 });
      jbStay(m, t - 14, t, function (k) { return { legs: wkSmooth(k), luff: 0.15 + 0.7 * wkSmooth((k - 0.4) / 0.6), len: 12, hook: 4, swing: 0 }; });
      C.st = { x: m.stand.x, y: m.stand.y, ang: m.stand.ang, site: site };
      C.pose = { swing: 0, luff: 0.85, len: 12, hook: 4 };
      C.aim = function (target, hookZ) { return wkCraneAim(C.st, plan, target, hookZ); };
      C.mix = function (a, b, k) { return { swing: wkTurnTo(a.swing, b.swing, k), luff: a.luff + (b.luff - a.luff) * k, len: a.len + (b.len - a.len) * k, hook: a.hook + (b.hook - a.hook) * k }; };
      C.seg = function (t0, t1, fn) { wkMSeg(m, t0, t1, function (k, T) { return Object.assign({ x: C.st.x, y: C.st.y, ang: C.st.ang, site: site, legs: 1 }, fn(k, T)); }); };
      C.free = t;
      return C;
    }
    // a tower crane: on the lot beside the building, as near the middle of it as it can stand
    var cl = jbLocal(J, [ctx.cx, ctx.cy]), st = null;
    var spots = [[mid[0], (S.box[3] + S.hy) / 2], [S.box[0] - 5 * P, cl[1]], [S.box[1] + 5 * P, cl[1]], [cl[0], S.box[2] - 5 * P]];
    spots.some(function (sp) { st = wkNearStand(plan, { len: 5 * P, wid: 5 * P, target: sp, reach: 12 * P, t0: 0, t1: 1e9 }); return !!st; });
    if (!st) { st = { x: mid[0], y: (S.box[3] + S.hy) / 2, ang: 0, hl: 2.8 * P, hw: 2.8 * P }; }
    wkReserve(plan, st, 0, 1e9);
    site.mark([[st.x - 2.6 * P, st.y - 2.6 * P], [st.x + 2.6 * P, st.y - 2.6 * P], [st.x + 2.6 * P, st.y + 2.6 * P], [st.x - 2.6 * P, st.y + 2.6 * P]].map(function (q) { return S.W(q[0], q[1]); }), WK_THING);
    var reach = 0;
    [[ctx.x0, ctx.y0], [ctx.x1, ctx.y0], [ctx.x1, ctx.y1], [ctx.x0, ctx.y1]].forEach(function (c) { var l = jbLocal(J, c); reach = Math.max(reach, Math.hypot(l[0] - st.x, l[1] - st.y)); });
    reach = Math.max(reach, Math.hypot(J.yard.l[0] - st.x, J.yard.l[1] - st.y), Math.hypot(mid[0] - st.x, S.kerb + 1.5 * P - st.y));
    var tm = wkMachine(plan, "towercrane", {});
    tm.site = site;
    C.m = tm; C.st = { x: st.x, y: st.y, ang: 0, site: site }; C.jib = Math.max(30, Math.min(70, reach / P + 4));
    // the height it stands at, climbing: ten metres over the highest storey framed so far
    C.tops = [];
    C.h = function (T) { var h = 18; C.tops.forEach(function (q) { if (T >= q[0]) { h = Math.max(h, q[1] / P + 10); } }); return h; };
    // put up by a mobile crane at the kerb: the mast section by section, then its jib
    var helper = jbVehicle(plan, "crane", { len: 13 * P, wid: 2.8 * P, target: [st.x, S.kerb + 1.4 * P], street: true, t0: t - 200, t1: t });
    var t0 = t - 150;
    jbCome(plan, helper, helper.stand, 13 * P, t0, { speed: 5 });
    var hst = { x: helper.stand.x, y: helper.stand.y, ang: helper.stand.ang, site: site }, tw = S.W(st.x, st.y);
    var aimTop = wkCraneAim(hst, plan, tw, 20 * P);
    wkMSeg(helper, t0, t, function (k) {
      var lift = (k * 7) % 1;
      return Object.assign({}, hst, { legs: Math.min(1, k * 6), swing: aimTop.swing, luff: aimTop.luff, len: aimTop.len, hook: aimTop.hook + (1 - Math.sin(lift * Math.PI)) * 10 });
    });
    helper.here = t;
    jbGo(plan, helper, t + 6, { speed: 5, extra: { legs: 0 } });
    wkMSeg(tm, t0 + 10, t, function (k) { return Object.assign({}, C.st, { h: Math.max(3, 18 * Math.min(1, k * 1.1)), swing: 0, r: 8, hook: 16, jib: k > 0.85 ? C.jib : 4 }); });
    C.pose = { swing: 0, r: 8, hook: 16 };
    C.aim = function (target, hookZ) { return wkTowerAim(C.st, plan, target, hookZ); };
    C.mix = function (a, b, k) {
      // (the trolley out first, then round, then the hook down)
      return { swing: wkTurnTo(a.swing, b.swing, k), r: a.r + (b.r - a.r) * k, hook: a.hook + (b.hook - a.hook) * k };
    };
    C.seg = function (t0b, t1b, fn) { wkMSeg(tm, t0b, t1b, function (k, T) { return Object.assign({ jib: C.jib, h: C.h(T) }, C.st, fn(k, T)); }); };
    C.free = t;
    return C;
  }
  // one lift: from `from` (world, height zFrom) to `to` (world, height zTo), the load drawn by
  // load(faces, hook) while it hangs; held there `hold` seconds; returns when it is set down
  function jbLift(plan, J, from, to, load, opt) {
    var C = J.crane, P = J.P;
    opt = opt || {};
    var t = Math.max(C.free, opt.after || 0);
    var up = Math.max(from[2], to[2], opt.over || 0) + 3 * P;
    var a0 = C.pose, a1 = C.aim(from, from[2] + 0.4 * P), a2 = C.aim(from, up), a3 = C.aim(to, up), a4 = C.aim(to, to[2] + 0.5 * P);
    var swing1 = Math.abs(((a1.swing - a0.swing) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI), swing2 = Math.abs(((a3.swing - a2.swing) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
    var d1 = 2 + swing1 * 2.2, d2 = 1.5, d3 = 2 + Math.abs(up - from[2]) / P * 0.12, d4 = 2.5 + swing2 * 2.4, d5 = 2 + Math.abs(up - to[2]) / P * 0.12, d6 = opt.hold || 3;
    var k0 = t, kA = k0 + d1, kB = kA + d2, kC = kB + d3, kD = kC + d4, kE = kD + d5, kF = kE + d6;
    var ld = { draw: load };
    C.seg(k0, kA, function (k) { return C.mix(a0, a1, wkSmooth(k)); });
    C.seg(kA, kB, function () { return a1; });
    C.seg(kB, kC, function (k) { return Object.assign(C.mix(a1, a2, wkSmooth(k)), { load: ld }); });
    C.seg(kC, kD, function (k) { return Object.assign(C.mix(a2, a3, wkSmooth(k)), { load: ld }); });
    C.seg(kD, kE, function (k) { return Object.assign(C.mix(a3, a4, wkSmooth(k)), { load: ld }); });
    C.seg(kE, kF, function () { return Object.assign({}, a4, { load: opt.keep ? ld : null }); });
    C.pose = a4; C.free = kF;
    return { picked: kB, landed: kE, free: kF };
  }
  // a frame line (two columns and the beam over them) as it hangs, turned along its line
  function jbFrameDraw(faces, W, z0, H, P, dx, dy, dz) {
    var a = [W.a[0] + (dx || 0), W.a[1] + (dy || 0)], b = [W.b[0] + (dx || 0), W.b[1] + (dy || 0)], z = z0 + (dz || 0);
    cnBox(faces, a[0], a[1], 0.1 * P, 0.1 * P, z, z + H, WK_STEELF, W.ang);
    cnBox(faces, b[0], b[1], 0.1 * P, 0.1 * P, z, z + H, WK_STEELF, W.ang);
    cnBeam(faces, [a[0], a[1], z + H - 0.18 * P], [b[0], b[1], z + H - 0.18 * P], 0.16 * P, WK_STEELF, 0.32 * P);
    if (W.brace) {
      cnBeam(faces, [a[0], a[1], z + 0.2 * P], [b[0], b[1], z + H - 0.35 * P], 0.08 * P, WK_BRACE);
      cnBeam(faces, [b[0], b[1], z + 0.2 * P], [a[0], a[1], z + H - 0.35 * P], 0.08 * P, WK_BRACE);
    }
  }

  // ---- the steel phase -----------------------------------------------------------------------------------
  var WK_STEEL_PHASE = { name: "steel", make: function (plan) {
    var J = jbJ(plan);
    if (J.frame === "wood") { return; }
    var P = J.P, S = J.S, site = J.site, crew = J.crew, levels = J.levels, g = J.g, ctx = J.ctx;
    var t = Math.max(J.foundAt || plan.T, J.startAt + 60);
    J.frameAt = t;
    plan.closedAt = Infinity;
    var C = jbCraneSetup(plan, J, t);
    t = C.free;
    // going up and down: a ladder by the yard for a low building, a hoist up the side of a tall one
    var yd = J.yard.w, best = null, bd = Infinity;
    jbWalls(J, g).filter(function (W) { return W.ext; }).forEach(function (W) { var d = Math.hypot(W.mid[0] - yd[0], W.mid[1] - yd[1]); if (d < bd) { bd = d; best = W; } });
    var tall = levels[levels.length - 1].top > 14 * P;
    if (best) {
      var outN = [-best.lay[0], -best.lay[1]], foot = [best.mid[0] + outN[0] * (tall ? 2.0 : 0.9) * P, best.mid[1] + outN[1] * (tall ? 2.0 : 0.9) * P];
      J.upLadder = function (li, lj) {
        var hi = Math.max(li, lj), L = levels[hi];
        if (!L) { return null; }
        var z = L.z, inn = [best.mid[0] - outN[0] * 0.9 * P, best.mid[1] - outN[1] * 0.9 * P, z], f0 = [foot[0], foot[1], 0], f1 = [foot[0], foot[1], z];
        return { foot: f0, top: inn, pts: [f0, f1, [best.mid[0], best.mid[1], z], inn], hoist: tall };
      };
      plan.ladder = function (li, lj) { return (li === J.base || lj === J.base) && J.pitLadder ? J.pitLadder : J.upLadder(li, lj); };
      plan.hoist = tall;
      var topZ = levels[levels.length - 1].z + 1.0 * P;
      J.upLadderPc = wkPiece(plan, t, wkFacesOf(function (f) {
        if (tall) {
          // the hoist: its mast up the side, its cage
          cnBox(f, foot[0], foot[1], 0.4 * P, 0.4 * P, 0, topZ + 2 * P, WK_STEELY, S.a);
          cnBox(f, foot[0] + outN[0] * 0.9 * P, foot[1] + outN[1] * 0.9 * P, 0.7 * P, 0.7 * P, 0, 2.3 * P, { piece: true, color: "#f2b81e", edge: "#a77d12", pat: 27 }, S.a);
        } else {
          var bx = foot[0] - outN[0] * 0.35 * P, by = foot[1] - outN[1] * 0.35 * P, sx = -outN[1] * 0.25 * P, sy = outN[0] * 0.25 * P;
          [-1, 1].forEach(function (s2) { cnBeam(f, [bx + sx * s2 + outN[0] * 0.4 * P, by + sy * s2 + outN[1] * 0.4 * P, 0], [bx + sx * s2, by + sy * s2, topZ], 0.05 * P, WK_STEELY); });
          for (var r = 0; r * 0.3 * P < topZ; r++) { var q = r * 0.3 * P / topZ; cnBeam(f, [bx - sx + outN[0] * 0.4 * P * (1 - q), by - sy + outN[1] * 0.4 * P * (1 - q), r * 0.3 * P], [bx + sx + outN[0] * 0.4 * P * (1 - q), by + sy + outN[1] * 0.4 * P * (1 - q), r * 0.3 * P], 0.03 * P, WK_STEELY); }
        }
      }), { t1: 1e9 });
    }
    // the pump for the decks low enough to reach; up high, the crane's bucket
    var pumpReach = 26 * P;
    var steelTruck = null, deckEnds = {}, ironA = crew.slice(1, 3), ironB = crew.slice(3, 5);
    var nLines = 0;
    for (var li = g; li < levels.length; li++) {
      var L = levels[li], walls = jbWalls(J, li), H = L.top - L.z;
      // the steel for this storey: a lorry of it, lifted off into the yard in bundles
      // (in once the last floor's pump and mixer have gone from the kerb)
      var tTruck = Math.max(t - 30, C.free - 20, li > g && deckEnds[li - 1] ? deckEnds[li - 1] + 30 : 0);
      var semi = jbVehicle(plan, "semi", { len: 19 * P, wid: 2.6 * P, target: [J.yard.l[0] + 9 * P, S.kerb + 1.4 * P], street: true, t0: tTruck - 20, t1: tTruck + 300 }, { paint: "#b83a2c", stripe: "#3b4350", cargo: "steel" });
      jbCome(plan, semi, semi.stand, 19 * P, tTruck, { speed: 5, extra: { load: 1 } });
      var bundles = 3, offAt = [];
      for (var bi = 0; bi < bundles; bi++) {
        var bedW = jbWorld(J, [semi.stand.x + (3 + bi * 3.4) * P, semi.stand.y], 1.7 * P);
        var dropW = jbWorld(J, [J.yard.l[0] + (bi - 1) * 2 * P, J.yard.l[1]], 0.1 * P);
        var lf = jbLift(plan, J, bedW, dropW, function (faces, hook) {
          cnBox(faces, hook[0], hook[1], 1.6 * P, 0.5 * P, hook[2] - 1.4 * P, hook[2] - 0.9 * P, WK_STEELF, S.a);
          cnBeam(faces, [hook[0], hook[1], hook[2]], [hook[0] - 1.2 * P, hook[1], hook[2] - 0.9 * P], 0.02 * P, WK_STEELY);
          cnBeam(faces, [hook[0], hook[1], hook[2]], [hook[0] + 1.2 * P, hook[1], hook[2] - 0.9 * P], 0.02 * P, WK_STEELY);
        }, { after: Math.max(tTruck + 2, C.free) });
        offAt.push(lf.picked);
        (function (dw, when) {
          wkPiece(plan, when, wkFacesOf(function (f) { cnBox(f, dw[0], dw[1], 1.6 * P, 0.5 * P, 0, 0.45 * P, WK_STEELF, S.a); }), { t1: 1e9 });
        })(dropW, lf.landed);
      }
      jbStay(semi, semi.here, C.free, function (k, T) { var n = 0; offAt.forEach(function (x) { if (T >= x) { n++; } }); return { load: 1 - n / bundles }; });
      semi.here = C.free;
      jbGo(plan, semi, C.free + 1, { speed: 5, extra: { load: 0 } });
      // each frame line set by the crane, bolted by a pair at each end
      var from = jbWorld(J, J.yard.l, 0.6 * P), lineDone = C.free, nW = 0;
      walls.forEach(function (W, wi) {
        if (W.len < 0.5 * P) { return; }
        W.brace = W.ext && W.len > 4 * P && (wi % 3 === 0);
        var mid = [W.mid[0], W.mid[1], L.z];
        var lf = jbLift(plan, J, from, [mid[0], mid[1], L.z + H], function (faces, hook) {
          var dx = hook[0] - W.mid[0], dy = hook[1] - W.mid[1], dz = hook[2] - (L.z + H) - 0.6 * P;
          jbFrameDraw(faces, W, L.z, H, P, dx, dy, dz);
          cnBeam(faces, hook, [W.a[0] + dx, W.a[1] + dy, L.z + H + dz], 0.02 * P, WK_STEELY);
          cnBeam(faces, hook, [W.b[0] + dx, W.b[1] + dy, L.z + H + dz], 0.02 * P, WK_STEELY);
        }, { hold: 3.5 });
        var pairs = nW % 2 ? ironB : ironA;
        pairs.forEach(function (w, k) {
          var end = k ? W.b : W.a, inn = [end[0] + W.lay[0] * 0.6 * P, end[1] + W.lay[1] * 0.6 * P, L.z];
          wkGo(plan, w, inn, { after: lf.landed - 8 });
          wkDo(w, Math.max(0.5, lf.landed - w.free), "up", wkFace(inn, end));
          wkDo(w, 4, "hammer", wkFace(inn, end));
        });
        wkPiece(plan, lf.landed, wkFacesOf(function (f) { jbFrameDraw(f, W, L.z, H, P); }), { t1: 1e9 });
        lineDone = Math.max(lineDone, lf.landed + 4);
        nW++; nLines++;
      });
      C.tops && C.tops.push([lineDone, L.top]);
      plan.wallsAt[li] = Infinity;
      // the deck over it: the next storey's floor, or the roof
      var deckZ = L.top, roofDeck = li === levels.length - 1, tD = lineDone + 2, deckDone = tD;
      L.rooms.forEach(function (o, ri) {
        var r = o.r, tt = (r.turn || 0) * Math.PI / 180, c = Math.cos(tt), s = Math.sin(tt), cx = r.x + o.dx, cy = r.y + o.dy;
        function at(lx, ly) { return [cx + lx * c - ly * s, cy + lx * s + ly * c]; }
        // its bundle lifted up onto the beams
        var dest = [cx, cy, deckZ];
        var lf = jbLift(plan, J, from, dest, function (faces, hook) { cnBox(faces, hook[0], hook[1], 1.5 * P, 0.5 * P, hook[2] - 1.0 * P, hook[2] - 0.7 * P, WK_DECKM, S.a); }, { after: tD });
        // spread sheet by sheet by two, from one side across
        var pair = wkPick(plan, 2, dest, crew.slice(1));
        var nS = Math.max(2, Math.min(10, Math.round(r.w * r.h / (P * P) / 6)));
        pair.forEach(function (w, k) {
          for (var q = 0; q < nS; q += 2) {
            var u = -r.w / 2 + r.w * (q + k + 0.5) / nS, p = at(u, 0);
            wkGo(plan, w, [p[0], p[1], deckZ], { after: lf.landed, carry: { kind: "sheet", w: 0.9, h: 2.4, how: WK_DECKM } });
            wkDo(w, 2.2, "kneel");
          }
        });
        var sp0 = lf.landed, sp1 = wkTogether(pair);
        (function (r, cx, cy, sp0, sp1) {
          wkPiece(plan, sp0, [], { live: function (faces, T) {
            var k = wkClamp((T - sp0) / Math.max(1, sp1 - sp0)), x1 = -r.w / 2 + r.w * k;
            if (k <= 0) { return; }
            v3Prism(faces, [at(-r.w / 2, -r.h / 2), at(x1, -r.h / 2), at(x1, r.h / 2), at(-r.w / 2, r.h / 2)], deckZ - 0.06 * P, deckZ - 0.04 * P, WK_DECKM);
          }, t1: sp1 });
          wkPiece(plan, sp1, wkFacesOf(function (f) { v3Prism(f, [at(-r.w / 2, -r.h / 2), at(r.w / 2, -r.h / 2), at(r.w / 2, r.h / 2), at(-r.w / 2, r.h / 2)], deckZ - 0.06 * P, deckZ - 0.04 * P, WK_DECKM); }), { t1: 1e9 });
        })(r, cx, cy, sp0, sp1);
        deckDone = Math.max(deckDone, sp1);
      });
      // poured: the pump's boom over it (low enough), or the crane's bucket from a mixer at the kerb
      var tP = deckDone + 2, pourDur = Math.max(30, Math.min(120, L.rooms.reduce(function (m2, o) { return m2 + o.r.w * o.r.h; }, 0) / (P * P) * 0.25));
      var cxy = [ctx.cx, ctx.cy, deckZ + 1.2 * P], kerbW = jbWorld(J, [jbLocal(J, [ctx.cx, ctx.cy])[0], S.kerb + 1.5 * P], 0);
      if (deckZ < pumpReach && !roofDeck) {
        var pump = wkMachine(plan, "pump", {});
        pump.site = site;
        pump.stand = wkStand(plan, { kind: "pumpmix", target: [jbLocal(J, [ctx.cx, ctx.cy])[0], S.kerb], street: true, t0: tP - 40, t1: tP + pourDur + 40 });
        jbCome(plan, pump, pump.stand, 11 * P, tP - 16, { speed: 5 });
        var pts = L.rooms.map(function (o) { return [o.r.x + o.dx, o.r.y + o.dy, deckZ + 1.5 * P]; });
        var tipAt = function (k) { var n2 = pts.length, f2 = Math.min(n2 - 1, Math.floor(k * n2)), q2 = k * n2 - f2; return wkLerp(pts[f2], pts[Math.min(n2 - 1, f2 + 1)], q2); };
        jbStay(pump, tP - 16, tP, function (k) { return { legs: wkSmooth(k), fold: 1 - wkSmooth((k - 0.4) / 0.6), tip: tipAt(0) }; });
        jbStay(pump, tP, tP + pourDur, function (k) { return { legs: 1, fold: 0, tip: tipAt(k), pour: 1, pourZ: deckZ }; });
        jbStay(pump, tP + pourDur, tP + pourDur + 12, function (k) { return { legs: 1 - wkSmooth((k - 0.5) * 2), fold: wkSmooth(k * 2), tip: tipAt(1) }; });
        pump.here = tP + pourDur + 12;
        jbGo(plan, pump, pump.here, { speed: 5 });
        var mx = wkMachine(plan, "mixer", { paint: li % 2 ? "#f2f2ee" : "#2f5d8a" });
        mx.site = site;
        var mst = { x: pump.stand.x + 11.8 * P, y: pump.stand.y, ang: 0, street: true, hl: 5 * P, hw: 1.5 * P, cx: pump.stand.x + 11.8 * P, cy: pump.stand.y };
        jbCome(plan, mx, mst, 9.4 * P, tP - 1, { speed: 6, extra: { turn: 0 } });
        jbStay(mx, tP - 1, tP + pourDur, function (k, T) { return { turn: T * 2.2, pour: 1, pourZ: 1.6 * P }; });
        mx.here = tP + pourDur;
        jbGo(plan, mx, tP + pourDur + 0.5, { extra: { turn: 0 } });
      } else {
        // the bucket: filled from the mixer at the kerb, lifted up, tipped over the deck, back down
        var mx2 = wkMachine(plan, "mixer", { paint: "#f2f2ee" });
        mx2.site = site;
        var mst2 = wkStand(plan, { kind: "mixer", target: jbLocal(J, kerbW), street: true, t0: tP - 20, t1: tP + 400 });
        jbCome(plan, mx2, mst2, 9.4 * P, tP - 1, { speed: 6, extra: { turn: 0 } });
        var cycles = Math.max(2, Math.min(6, Math.round(pourDur / 25))), tb = tP;
        var bucketW = jbWorld(J, [mst2.x + Math.cos(mst2.ang) * -5.5 * P, mst2.y], 0.2 * P);
        for (var cyc = 0; cyc < cycles; cyc++) {
          var o2 = L.rooms[cyc % L.rooms.length];
          var lf2 = jbLift(plan, J, bucketW, [o2.r.x + o2.dx, o2.r.y + o2.dy, deckZ + 0.8 * P], function (faces, hook) {
            cnBox(faces, hook[0], hook[1], 0.55 * P, 0.55 * P, hook[2] - 1.6 * P, hook[2] - 0.5 * P, { piece: true, color: "#f2b81e", edge: "#a77d12", pat: 27 }, S.a);
          }, { after: tb, hold: 4 });
          tb = lf2.free;
        }
        pourDur = tb - tP;
        jbStay(mx2, tP - 1, tb, function (k, T) { return { turn: T * 2.2, pour: (T % 30) < 6 ? 1 : 0, pourZ: 0.4 * P }; });
        mx2.here = tb;
        jbGo(plan, mx2, tb + 0.5, { extra: { turn: 0 } });
      }
      // the concrete across each room, as it is poured; two raking it level
      var rakers = wkPick(plan, 2, cxy, crew.slice(1));
      rakers.forEach(function (w, k) {
        L.rooms.forEach(function (o, ri) {
          if ((ri + k) % 2) { return; }
          wkGo(plan, w, [o.r.x + o.dx, o.r.y + o.dy, deckZ], { after: tP + pourDur * ri / Math.max(1, L.rooms.length) });
          wkDo(w, 4, "kneel");
        });
      });
      (function (L, tP, pourDur, deckZ) {
        wkPiece(plan, tP, [], { live: function (faces, T) {
          var k = wkClamp((T - tP) / pourDur), n2 = L.rooms.length;
          L.rooms.forEach(function (o, ri) {
            if (k * n2 <= ri) { return; }
            var poly = o.poly;
            v3Prism(faces, poly.map(function (p) { return [p[0], p[1]]; }), deckZ - 0.04 * P, deckZ - 0.012 * P, T < tP + pourDur + 30 ? WK_WET : WK_SLAB);
          });
        }, t1: 1e9 });
      })(L, tP, pourDur, deckZ);
      deckEnds[li] = tP + pourDur;
      // the inside walls in metal studs, once the floor over them is poured
      walls.filter(function (W) { return !W.ext; }).forEach(function (W) {
        W.metal = true;
        jbFrameWall(plan, J, W, [J.yard.w[0], J.yard.w[1], 0], tP + pourDur + 20);
      });
      plan.wallsAt[li] = crew.reduce(function (m3, w) { return Math.max(m3, w.free); }, tP + pourDur);
      // a tower's skin on this storey, panel by panel, two storeys behind the frame
      Object.keys(plan.groups).filter(function (k) { return (k.indexOf("skin:" + li + ":") === 0 || k.indexOf("deck:" + li + ":") === 0); }).forEach(function (k) {
        var G = plan.groups[k], c = [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, (G.lo + G.hi) / 2];
        if (k.indexOf("deck:") === 0) { wkReveal(plan, k, tP, tP + pourDur, "fade"); return; }
        var lf3 = jbLift(plan, J, from, c, function (faces, hook) {
          var dx = hook[0] - c[0], dy = hook[1] - c[1], dz = hook[2] - c[2] - 0.6 * P;
          G.faces.slice(0, 40).forEach(function (f) { faces.push(Object.assign({}, f, { pts: f.pts.map(function (q) { return [q[0] + dx, q[1] + dy, (q[2] || 0) + dz]; }), moves: true, src: undefined, mesh: undefined })); });
        }, { after: tP + pourDur, hold: 3 });
        wkReveal(plan, k, lf3.landed, lf3.landed + 0.5, "fade");
      });
      t = Math.max(C.free, tP + 4);
    }
    // the roof: its membrane rolled out by two, plane by plane
    var top = levels[levels.length - 1], rEnd = deckEnds[levels.length - 1] || t;
    Object.keys(plan.groups).filter(function (k) { return k.indexOf("roof:") === 0; }).forEach(function (k) {
      var G = plan.groups[k], pair = wkPick(plan, 2, [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, top.top]);
      var dur = Math.max(20, Math.min(90, (G.x1 - G.x0) * (G.y1 - G.y0) / (P * P) * 0.3)), s0 = wkTogether(pair, rEnd);
      pair.forEach(function (w, i) {
        for (var q = 0; q < 4; q++) {
          var x = G.x0 + (G.x1 - G.x0) * (q + 0.5) / 4, y = i ? G.y1 - 1 * P : G.y0 + 1 * P;
          wkGo(plan, w, [x, y, G.hi], { after: s0 + dur * q / 4, carry: q === 0 ? { kind: "roll", how: { piece: true, color: "#3a3d42", edge: "#2a2c30", pat: 0 } } : null });
          wkDo(w, Math.max(0.5, s0 + dur * (q + 1) / 4 - w.free), "kneel");
        }
      });
      var R = wkReveal(plan, k, s0, s0 + dur, "sweep");
      R.axis = [G.x0, G.y0, 1, 0]; R.len = Math.max(1, G.x1 - G.x0);
      rEnd = Math.max(rEnd, s0 + dur);
    });
    if (plan.groups.rtrim) { wkReveal(plan, "rtrim", rEnd - 10, rEnd, "fade"); }
    // the core of a tower: its concrete going up a storey at a time with the frame
    Object.keys(plan.groups).filter(function (k) { return k.indexOf("in:") === 0; }).forEach(function (k) { wkReveal(plan, k, deckEnds[plan.groups[k].lvl] || rEnd, (deckEnds[plan.groups[k].lvl] || rEnd) + 10, "fade"); });
    // the stairs, a carpenter (a fitter) each, once their floors are poured
    var stairs = Object.keys(plan.groups).filter(function (k) { return k.indexOf("rise:") === 0; });
    stairs.forEach(function (k) {
      var G = plan.groups[k], to = [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, levels[G.lvl] ? levels[G.lvl].z : 0];
      var w = wkPick(plan, 1, to, crew.slice(1))[0];
      wkGo(plan, w, to, { carry: { kind: "studs", n: 2, len: 2.4, how: WK_STEELF }, after: deckEnds[Math.min(levels.length - 1, G.lvl)] || J.frameAt });
      var t0 = w.free;
      wkDo(w, 14, "hammer");
      wkReveal(plan, k, t0, w.free, "cut");
    });
    if (stairs.length) { plan.stairsAt = Math.max.apply(null, stairs.map(function (k) { return plan.rv[k].t1; })); }
    // the crane: away once the last is up (a tower crane taken down, a mobile one driven off)
    var cDone = C.free + 2;
    if (C.kind === "mobile") {
      var p0 = C.pose;
      C.seg(cDone, cDone + 14, function (k) { return { legs: 1 - wkSmooth((k - 0.5) * 2), swing: wkTurnTo(p0.swing, 0, wkSmooth(k)), luff: p0.luff + (0.15 - p0.luff) * wkSmooth(k), len: p0.len + (10 - p0.len) * wkSmooth(k), hook: 3 }; });
      C.m.here = cDone + 14;
      jbGo(plan, C.m, cDone + 14, { speed: 5 });
    } else {
      var hEnd = C.h(cDone);
      wkMSeg(C.m, cDone, cDone + 90, function (k) { return Object.assign({}, C.st, { h: Math.max(3, hEnd * (1 - k)), swing: C.pose.swing, r: 8, hook: Math.max(2, hEnd * (1 - k) - 4), jib: k < 0.1 ? C.jib : 4 }); }).gone = true;
    }
    J.frameDone = Math.max(rEnd, crew.reduce(function (m4, w) { return Math.max(m4, w.free); }, 0));
    J.roofDone = rEnd;
    wkSay(plan, J.frame === "tall" ? "jb_core" : "jb_steel", J.frameAt, J.frameDone);
    wkSay(plan, "jb_deckpour", J.frameAt + 60, rEnd);
    plan.T = Math.max(plan.T, J.frameDone, cDone);
  } };
  // in after the wood jobs (each does nothing for the other kind of building)
  (function () {
    var at = 0;
    WK_PHASES.forEach(function (ph, i) { if (ph.name === "roof") { at = i + 1; } });
    WK_PHASES.splice(at, 0, WK_STEEL_PHASE);
  })();
