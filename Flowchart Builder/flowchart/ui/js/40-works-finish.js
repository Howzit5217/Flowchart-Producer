// ---------------------------------------------------------------------------
//  40-works-finish.js -- the building closed in and finished, by hand: the
//  scaffold put up round it bay by bay; the walls sheathed; each window
//  carried to its opening and fitted, each door hung; the siding put on
//  course by course from the scaffold; the scaffold taken down; inside,
//  the wiring and pipes, the plasterboard sheet by sheet, the ceilings, the
//  floors, the kitchen and bathrooms fitted, the lights and switches put
//  in; the furniture brought in from the removal lorry -- as many loads as
//  it takes, the lorry going and coming back -- and the family home; the
//  site cleared, the crew gone.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  var WK_SCAF = { piece: true, color: "#9aa0a6", edge: "#6b7177", bare: true, pat: 22 };
  var WK_PLANK = { piece: true, color: "#b8925e", edge: "#7d6240", bare: true, pat: 21 };
  var WK_DRY = { piece: true, color: "#e9e6df", edge: "#b9b5ac", pat: 0 };
  var WK_TRUCK_M3 = 30;                  // what one load of the removal lorry holds (cubic metres)

  // ---- 8. the scaffold, round the outside walls ----------------------------------------------------------
  WK_PHASES.push({ name: "scaffold", make: function (plan) {
    var J = jbJ(plan), P = J.P, S = J.S, t = (J.roofDone ? Math.min(J.roofDone, (plan.wallsAt[J.levels.length - 1] || 0) + 10) : plan.T);
    var lines = jbWalls(J, J.g).filter(function (W) { return W.ext; }), top = J.levels[J.levels.length - 1].top, bays = [];
    lines.forEach(function (W) {
      var n = Math.max(1, Math.round(W.len / (2.4 * P))), out = [-W.lay[0], -W.lay[1]];
      for (var k = 0; k < n; k++) {
        var s0 = W.len * k / n, s1 = W.len * (k + 1) / n;
        bays.push({ a: [W.a[0] + W.u[0] * s0 + out[0] * 0.95 * P, W.a[1] + W.u[1] * s0 + out[1] * 0.95 * P], b: [W.a[0] + W.u[0] * s1 + out[0] * 0.95 * P, W.a[1] + W.u[1] * s1 + out[1] * 0.95 * P], out: out, W: W });
      }
    });
    J.scafTop = top;
    var lifts = [];
    for (var z = 2.0 * P; z < top - 0.3 * P; z += 2.0 * P) { lifts.push(z); }
    if (!lifts.length) { lifts.push(Math.max(1.0 * P, top - 0.5 * P)); }
    J.lifts = lifts;
    function bayFaces(f, B) {
      [B.a, B.b].forEach(function (p) {
        cnBox(f, p[0], p[1], 0.03 * P, 0.03 * P, 0, top + 1.0 * P, WK_SCAF);
        cnBox(f, p[0] + B.out[0] * 0.75 * P, p[1] + B.out[1] * 0.75 * P, 0.03 * P, 0.03 * P, 0, top + 1.0 * P, WK_SCAF);
      });
      lifts.forEach(function (z) {
        var m = [(B.a[0] + B.b[0]) / 2 + B.out[0] * 0.38 * P, (B.a[1] + B.b[1]) / 2 + B.out[1] * 0.38 * P], len = Math.hypot(B.b[0] - B.a[0], B.b[1] - B.a[1]);
        cnBox(f, m[0], m[1], len / 2, 0.36 * P, z - 0.05 * P, z, WK_PLANK, Math.atan2(B.b[1] - B.a[1], B.b[0] - B.a[0]));
        cnBeam(f, [B.a[0] + B.out[0] * 0.75 * P, B.a[1] + B.out[1] * 0.75 * P, z + 1.0 * P], [B.b[0] + B.out[0] * 0.75 * P, B.b[1] + B.out[1] * 0.75 * P, z + 1.0 * P], 0.04 * P, WK_SCAF);
      });
      cnBeam(f, [B.a[0] + B.out[0] * 0.75 * P, B.a[1] + B.out[1] * 0.75 * P, 0.2 * P], [B.b[0] + B.out[0] * 0.75 * P, B.b[1] + B.out[1] * 0.75 * P, Math.min(top, 4 * P)], 0.035 * P, WK_SCAF);
    }
    var yd = J.yard.w, up = t, crew = J.crew;
    // put up, a bay at a time: tubes and boards carried from the yard
    bays.forEach(function (B, i) {
      var w = wkPick(plan, 1, [B.a[0], B.a[1], 0])[0];
      wkGo(plan, w, [yd[0] + ((i % 3) - 1) * 0.6 * P, yd[1], 0], { after: t });
      wkDo(w, 0.8, "hold");
      var at = [(B.a[0] + B.b[0]) / 2 + B.out[0] * 1.6 * P, (B.a[1] + B.b[1]) / 2 + B.out[1] * 1.6 * P, 0];
      wkGo(plan, w, at, { carry: { kind: "studs", n: 3, len: 2.4, how: WK_SCAF } });
      wkDo(w, 4.0, "up", Math.atan2(-B.out[1], -B.out[0]));
      B.pc = wkPiece(plan, w.free, wkFacesOf(function (f) { bayFaces(f, B); }));
      B.upAt = w.free;
      up = Math.max(up, w.free);
    });
    J.bays = bays;
    J.scafUp = up;
    wkSay(plan, "jb_scaffold", t, up);
  } });

  // ---- 9. sheathed, windowed, doors hung, sided ----------------------------------------------------------
  WK_PHASES.push({ name: "envelope", make: function (plan) {
    var J = jbJ(plan), P = J.P, S = J.S, crew = J.crew, groups = plan.groups;
    var t = Math.max(J.scafUp || 0, (J.roofDone || 0) - 60);
    var lines = Object.keys(groups).filter(function (k) { return k.indexOf("wo:") === 0 && groups[k].lvl > (J.base >= 0 ? J.base : -1); });
    // each outside wall line: its sheathing put on by a pair moving along it, foot to top
    var sEnd = t;
    lines.forEach(function (k) {
      var G = groups[k], pair = wkPick(plan, 2, [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, 0]);
      var area = Math.hypot(G.x1 - G.x0, G.y1 - G.y0) * (G.hi - G.lo) / (P * P), dur = Math.max(12, Math.min(60, area * 0.5));
      var s0 = wkTogether(pair, t);
      jbAlongWall(plan, J, G, pair, s0, dur, { kind: "sheet", w: 1.2, h: 2.4, how: WK_SHEET }, "hammer");
      var R = wkReveal(plan, k, 1e9, 1e9, "cut");
      R.pre = { t0: s0, t1: s0 + dur, how: WK_WRAP, cut: true, lo: G.lo, hi: G.hi };
      G.sheathAt = s0 + dur;
      sEnd = Math.max(sEnd, s0 + dur);
    });
    wkSay(plan, "jb_sheath", t, sEnd);
    // the windows: one at a time from the crate in the yard to its opening
    var wins = Object.keys(groups).filter(function (k) { return k.indexOf("glass:") === 0; }), wEnd = t;
    var crate = jbWorld(J, [J.yard.l[0] + J.yard.hw * 0.6, J.yard.l[1]], 0);
    wins.forEach(function (k, i) {
      var G = groups[k], c = [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2], line = jbLineOf(groups, k);
      var w = wkPick(plan, 1, [c[0], c[1], 0])[0], after = line && groups[line] ? (groups[line].sheathAt || t) - 15 : t;
      var L = J.levels[G.lvl] || J.levels[J.g], out = jbOutward(J, G);
      // stood outside it: on the ground, or on the scaffold's lift nearest it
      var zStand = G.lvl === J.g ? 0 : jbLiftFor(J, G.lo - 0.4 * P), at = [c[0] + out[0] * 0.9 * P, c[1] + out[1] * 0.9 * P, zStand];
      if (G.lvl !== J.g && !J.lifts) { at = [c[0] - out[0] * 0.7 * P, c[1] - out[1] * 0.7 * P, L.z]; }
      wkGo(plan, w, [crate[0], crate[1], 0], { after: after });
      wkDo(w, 0.8, "hold");
      var wm = Math.max(0.6, Math.min(2.4, Math.hypot(G.x1 - G.x0, G.y1 - G.y0) / P)), hm = Math.max(0.6, Math.min(2.4, (G.hi - G.lo) / P));
      wkGo(plan, w, at, { carry: { kind: "window", w: wm, h: hm } });
      var face = Math.atan2(-out[1], -out[0]);
      wkDo(w, 2.5, "up", face, { hold: null });
      wkDo(w, 2.0, "hammer", face);
      wkReveal(plan, k, w.free, w.free, "pop");
      wEnd = Math.max(wEnd, w.free);
    });
    wkSay(plan, "jb_windows", t + 10, wEnd);
    // the doors, by two
    var doors = Object.keys(groups).filter(function (k) { return k.indexOf("door:") === 0; }), dEnd = t;
    doors.forEach(function (k) {
      var G = groups[k], c = [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2], L = J.levels[G.lvl] || J.levels[J.g];
      var pair = wkPick(plan, 2, [c[0], c[1], L.z]);
      pair.forEach(function (w, i) {
        wkGo(plan, w, [crate[0] + i * 0.7 * P, crate[1], 0], { after: Math.max(sEnd - 40, t) });
        wkDo(w, 0.8, "hold");
        wkGo(plan, w, [c[0] + (i ? 0.5 : -0.5) * P, c[1] + (i ? 0.4 : -0.4) * P, L.z], { carry: { kind: "sheet", w: 0.9, h: 2.1, how: { piece: true, color: "#8a6a4a", edge: "#5d4630", pat: 21 } } });
      });
      var t0 = wkTogether(pair);
      pair.forEach(function (w) { wkDo(w, 3.0, "hammer"); });
      wkReveal(plan, k, t0 + 1, t0 + 3, "fade");
      dEnd = Math.max(dEnd, t0 + 3);
    });
    wkSay(plan, "jb_doors", sEnd - 20, dEnd);
    // the siding: course after course up each line, from the scaffold
    var cEnd = sEnd;
    lines.forEach(function (k) {
      var G = groups[k], pair = wkPick(plan, 2, [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, 0]);
      var area = Math.hypot(G.x1 - G.x0, G.y1 - G.y0) * (G.hi - G.lo) / (P * P), dur = Math.max(16, Math.min(90, area * 0.8));
      var s0 = wkTogether(pair, Math.max(G.sheathAt || sEnd, wEnd - 30));
      jbAlongWall(plan, J, G, pair, s0, dur, { kind: "board", n: 3, len: 3.6, how: { piece: true, color: "#c9c4b8", edge: "#9a958a", pat: 13 } }, "hammer");
      var R = plan.rv[k];
      R.t0 = s0; R.t1 = s0 + dur; R.lo = G.lo; R.hi = G.hi;
      cEnd = Math.max(cEnd, s0 + dur);
    });
    wkSay(plan, "jb_siding", sEnd, cEnd);
    if (J.frame !== "wood") { plan.closedAt = cEnd; }
    // the scaffold down again, bay by bay
    var down = cEnd;
    (J.bays || []).forEach(function (B) {
      var w = wkPick(plan, 1, [B.a[0], B.a[1], 0])[0];
      var at = [(B.a[0] + B.b[0]) / 2 + B.out[0] * 1.6 * P, (B.a[1] + B.b[1]) / 2 + B.out[1] * 1.6 * P, 0];
      wkGo(plan, w, at, { after: cEnd });
      wkDo(w, 3.0, "up", Math.atan2(-B.out[1], -B.out[0]));
      if (B.pc) { B.pc.t1 = w.free; }
      wkGo(plan, w, [J.yard.w[0], J.yard.w[1], 0], { carry: { kind: "studs", n: 3, len: 2.4, how: WK_SCAF } });
      down = Math.max(down, w.free);
    });
    if (J.bays && J.bays.length) { wkSay(plan, "jb_scaffold_down", cEnd, down); }
    if (J.upLadderPc) { J.upLadderPc.t1 = down; }
    // (the outside walls' studs, covered over now: no longer drawn)
    (J.wallPieces || []).forEach(function (W) { if (W.ext && W.piece) { W.piece.t1 = Math.max(W.piece.t0 + 1, cEnd); } });
    J.shellDone = Math.max(cEnd, dEnd, wEnd);
    J.scafDown = down;
    plan.T = Math.max(plan.T, down);
  } });
  // which outside line a window's glass is in
  function jbLineOf(groups, gk) { var parts = gk.split(":"); return "wo:" + parts[1] + ":" + parts[2] + ":" + parts[3]; }
  // which way is out from a group of faces (its faces' own way, averaged)
  function jbOutward(J, G) {
    var nx = 0, ny = 0;
    G.faces.forEach(function (f) { if (f.n) { nx += f.n[0]; ny += f.n[1]; } });
    var l = Math.hypot(nx, ny);
    if (l < 1e-6) { var c = [(G.x0 + G.x1) / 2 - J.ctx.cx, (G.y0 + G.y1) / 2 - J.ctx.cy], m = Math.hypot(c[0], c[1]) || 1; return [c[0] / m, c[1] / m]; }
    // (a wall's outside faces point out; its glass is drawn both ways -- the half pointing away from the middle)
    var out = [nx / l, ny / l], cc = [(G.x0 + G.x1) / 2 - J.ctx.cx, (G.y0 + G.y1) / 2 - J.ctx.cy];
    if (out[0] * cc[0] + out[1] * cc[1] < 0) { out = [-out[0], -out[1]]; }
    return out;
  }
  // the scaffold's lift (its boards' height) nearest under a height
  function jbLiftFor(J, z) {
    var best = 0;
    (J.lifts || []).forEach(function (l) { if (l <= z + 0.3 * J.P && l > best) { best = l; } });
    return best;
  }
  // A pair working along an outside wall line, from its foot to its top: on
  // the ground, then up on the scaffold's lifts, a bundle carried each time.
  function jbAlongWall(plan, J, G, pair, t0, dur, carry, pose) {
    var P = J.P, out = jbOutward(J, G), along = [-out[1], out[0]];
    var c = [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2], len = Math.abs(G.x1 - G.x0) * Math.abs(along[0]) + Math.abs(G.y1 - G.y0) * Math.abs(along[1]);
    var steps = Math.max(2, Math.round(dur / 7)), yd = J.yard.w;
    pair.forEach(function (w, i) {
      for (var s = 0; s < steps; s++) {
        var k = (s + 0.5) / steps, h = G.lo + (G.hi - G.lo) * k, z = jbLiftFor(J, h - 1.2 * P);
        var u = ((s + i) % 2 ? 0.25 : -0.25) + (i ? 0.12 : -0.12);
        var at = [c[0] + along[0] * len * u + out[0] * (z > 0.5 * P ? 1.3 : 1.0) * P, c[1] + along[1] * len * u + out[1] * (z > 0.5 * P ? 1.3 : 1.0) * P, z];
        if (s % 3 === 0) {
          wkGo(plan, w, [yd[0], yd[1], 0], { after: t0 + dur * s / steps - 12 });
          wkDo(w, 0.6, "hold");
          wkGo(plan, w, at, { carry: carry });
        } else {
          // (along the wall, from the last spot: straight there -- up or down the scaffold if need be)
          var lvlNow = Math.abs((w.at[2] || 0) - z) < 0.3 * P;
          wkGo(plan, w, lvlNow ? at : [w.at[0], w.at[1], z], { after: t0 + dur * s / steps, straight: true });
          if (!lvlNow) { wkGo(plan, w, at, { straight: true }); }
        }
        wkDo(w, Math.max(0.6, t0 + dur * (s + 1) / steps - w.free), h - z > 1.6 * P ? "up" : pose, Math.atan2(-out[1], -out[0]));
      }
    });
  }

  // ---- 10. the inside: wiring and pipes, plasterboard, ceilings, floors, fittings, fixtures ---------------
  WK_PHASES.push({ name: "inside", make: function (plan) {
    var J = jbJ(plan), P = J.P, crew = J.crew, groups = plan.groups;
    var t = Math.max(J.roofDone || 0, J.shellDone ? J.shellDone - 120 : 0, J.frameDone || 0);
    var yd = J.yard.w, keys = Object.keys(groups), end = t;
    function room(G) { return [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, J.levels[G.lvl] ? J.levels[G.lvl].z : 0]; }
    // wiring and pipes: two going round each storey
    keys.filter(function (k) { return k.indexOf("mep:") === 0; }).forEach(function (k) {
      var G = groups[k], pair = wkPick(plan, 2, room(G)), lvl = J.levels[G.lvl] || J.levels[J.g];
      var rooms = lvl.rooms.slice(0, 10), s0 = wkTogether(pair, t);
      pair.forEach(function (w, i) {
        rooms.forEach(function (o, j) {
          if ((j + i) % 2) { return; }
          var c = [o.r.x + o.dx, o.r.y + o.dy, o.z];
          wkGo(plan, w, c, { carry: { kind: "roll", how: { piece: true, color: i ? "#c9822a" : "#e8e3d8", edge: "#8a6a3a", pat: 27 } } });
          wkDo(w, 4, j % 3 ? "up" : "kneel");
        });
      });
      var s1 = wkTogether(pair);
      wkReveal(plan, k, s0, s1, "fade");
      end = Math.max(end, s1);
    });
    // (the plasterboard after the wiring -- in the last rooms as it finishes -- and never before
    // the inside is begun: with nothing wired it started twenty seconds before the roof was on)
    var tR = Math.max(t, end - 20);
    if (end > t + 0.5) { wkSay(plan, "jb_mep", t, end); }
    // plasterboard: each room's walls a sheet at a time, round the room
    var dEnd = tR;
    keys.filter(function (k) { return k.indexOf("wi:") === 0; }).forEach(function (k) {
      var G = groups[k], c = room(G), w = wkPick(plan, 1, c)[0];
      var n = Math.max(2, Math.min(8, Math.round(Math.hypot(G.x1 - G.x0, G.y1 - G.y0) / (1.6 * P)))), s0 = Math.max(w.free, tR);
      for (var s = 0; s < n; s++) {
        var a = s / n * Math.PI * 2, r = Math.min(G.x1 - G.x0, G.y1 - G.y0) * 0.3;
        if (s % 2 === 0) { wkGo(plan, w, [yd[0], yd[1], 0], { after: s0 }); wkDo(w, 0.6, "hold"); }
        wkGo(plan, w, [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]], { carry: s % 2 === 0 ? { kind: "sheet", w: 1.2, h: 2.4, how: WK_DRY } : null });
        wkDo(w, 2.4, s % 2 ? "up" : "hammer", a);
      }
      var R = wkReveal(plan, k, s0 + 4, w.free, "sweep");
      R.axis = [G.x0, G.y0, 1, 0]; R.len = Math.max(1, G.x1 - G.x0);
      R.angle = [c[0], c[1]];
      dEnd = Math.max(dEnd, w.free);
    });
    // the trim between, the tops of the walls: with the plasterboard
    keys.filter(function (k) { return k.indexOf("in:") === 0 || k.indexOf("wtop:") === 0; }).forEach(function (k) { wkReveal(plan, k, dEnd - 10, dEnd, "fade"); });
    wkSay(plan, "jb_drywall", tR, dEnd);
    (J.wallPieces || []).forEach(function (W) { if (W.piece && W.piece.t1 > dEnd) { W.piece.t1 = Math.max(W.piece.t0 + 1, dEnd); } });
    // ceilings: two with their arms up
    var cEnd = dEnd;
    keys.filter(function (k) { return k.indexOf("ceil:") === 0; }).forEach(function (k) {
      var G = groups[k], c = room(G), pair = wkPick(plan, 2, c);
      pair.forEach(function (w, i) { wkGo(plan, w, [c[0] + (i ? 0.6 : -0.6) * P, c[1], c[2]], { after: dEnd - 40, carry: { kind: "sheet", w: 1.2, h: 2.4, how: WK_DRY } }); });
      var s0 = wkTogether(pair);
      pair.forEach(function (w) { wkDo(w, 5, "up"); });
      wkReveal(plan, k, s0 + 1, s0 + 5, "fade");
      cEnd = Math.max(cEnd, s0 + 5);
    });
    wkSay(plan, "jb_ceilings", dEnd - 30, cEnd);
    // floors: laid across each room by one on their knees
    var fEnd = cEnd;
    keys.filter(function (k) { return k.indexOf("floor:") === 0; }).forEach(function (k) {
      var G = groups[k], c = room(G), w = wkPick(plan, 1, c)[0];
      var s0 = Math.max(w.free, cEnd - 40), wide = G.x1 - G.x0 >= G.y1 - G.y0, n = 3;
      wkGo(plan, w, [yd[0], yd[1], 0], { after: s0 });
      for (var s = 0; s < n; s++) {
        var q = (s + 0.5) / n, at = wide ? [G.x0 + (G.x1 - G.x0) * q, c[1], c[2]] : [c[0], G.y0 + (G.y1 - G.y0) * q, c[2]];
        wkGo(plan, w, at, { carry: s === 0 ? { kind: "box", size: 0.4, how: WK_CARD } : null });
        wkDo(w, 4, "kneel");
      }
      var R = wkReveal(plan, k, s0 + 2, w.free, "sweep");
      R.axis = wide ? [G.x0, G.y0, 1, 0] : [G.x0, G.y0, 0, 1]; R.len = Math.max(1, wide ? G.x1 - G.x0 : G.y1 - G.y0);
      fEnd = Math.max(fEnd, w.free);
    });
    wkSay(plan, "jb_floors", cEnd - 30, fEnd);
    // the kitchen, the bathrooms, the closets: fitted -- (2026-10-05: "dollies, forklifts, the works")
    // delivered first on pallets, the flatbed's own forklift taking them off its back into the yard
    // (40-works-haul.js), then wheeled in from there on a hand truck, a carton carried beside it
    var kEnd = fEnd, fits = keys.filter(function (k) { return k.indexOf("fit:") === 0; });
    var del = null;
    if (fits.length && typeof whDeliver === "function") {
      try { del = whDeliver(plan, { at: fEnd - 200, n: Math.min(3, Math.max(1, Math.ceil(fits.length / 2))), kind: "cab" }); } catch (eDel) { del = null; }
    }
    fits.forEach(function (k, fi) {
      var G = groups[k], c = room(G), pair = wkPick(plan, 2, c), pl = del && del.pallets.length ? del.pallets[fi % del.pallets.length] : null;
      var from = pl ? pl.w : [yd[0], yd[1], 0], after = Math.max(fEnd - 60, pl ? pl.at + 2 : 0);
      pair.forEach(function (w, i) {
        wkGo(plan, w, [from[0] + (i ? 0.9 : -0.9) * P, from[1] + 0.9 * P, 0], { after: after });
        wkDo(w, i ? 0.6 : 1.4, "hold");
        if (pl) { pl.taken.push(w.free - 0.2); }
        wkGo(plan, w, [c[0] + (i ? 0.6 : -0.6) * P, c[1] + 0.5 * P, c[2]], { carry: i === 0 && pl ? { kind: "truck", n: 2, size: 0.5 } : { kind: "box", size: 0.6, how: WK_CARD } });
      });
      var s0 = wkTogether(pair);
      pair.forEach(function (w) { wkDo(w, 3, "hammer"); });
      wkReveal(plan, k, s0, s0 + 1.5, "drop", { drop: 0.3 * P });
      kEnd = Math.max(kEnd, s0 + 3);
    });
    // (the empty pallets stacked and taken off with the rest)
    if (del) { del.pallets.forEach(function (pl) { pl.taken.sort(function (a, b) { return a - b; }); pl.end = kEnd + 20; }); wkSay(plan, "jb_deliver", del.pallets.length ? del.pallets[0].up - 20 : fEnd - 200, del.doneAt); }
    wkSay(plan, "jb_fittings", fEnd - 50, kEnd);
    // lights, switches, sockets, alarms: the electrician round them all
    var xEnd = kEnd, fx = keys.filter(function (k) { return k.indexOf("fix:") === 0; });
    var sparks = wkPick(plan, 2, null);
    fx.forEach(function (k, i) {
      var G = groups[k], w = sparks[i % sparks.length], c = [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, J.levels[G.lvl] ? J.levels[G.lvl].z : 0];
      wkGo(plan, w, c, { after: kEnd - 80 });
      wkDo(w, 2.2, G.lo - c[2] > 1.4 * P ? "up" : "kneel");
      wkReveal(plan, k, w.free, w.free, "pop");
      xEnd = Math.max(xEnd, w.free);
    });
    wkSay(plan, "jb_fixtures", kEnd - 60, xEnd);
    // the stairs' own faces, the posts, the fireplace -- built up where no carpenter did them
    keys.filter(function (k) { return k.indexOf("rise:") === 0 && !plan.rv[k]; }).forEach(function (k) { wkReveal(plan, k, dEnd, dEnd + 8, "cut"); });
    J.insideDone = xEnd;
    plan.doneAt = xEnd;
    plan.T = Math.max(plan.T, xEnd);
  } });

  // ---- 11. moving in: the removal lorry, as many loads as it takes; the family home ------------------------
  WK_PHASES.push({ name: "movein", make: function (plan) {
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, ctx = J.ctx, groups = plan.groups;
    if (typeof moPlan !== "function") { return; }
    // (once the site is paved and planted, 40-works-site.js: its lorry was in the drive as it was being laid)
    var M = moPlan(ctx), t = Math.max((J.insideDone || plan.T) + 5, plan.jwAt ? plan.jwAt[1] : 0);
    if (!M.items.length && !M.residents.length) { return; }
    // the lorry's stand: at the kerb by the path to the door, clear of the parked cars
    var tractorX = M.vanRear - 16.8 * P, stand = { x: tractorX, y: S.kerb + 1.55 * P, ang: Math.PI, street: true, hl: 9.5 * P, hw: 1.4 * P };
    var free = wkStand(plan, { kind: "semi", target: [tractorX + 6.65 * P, S.kerb], street: true, t0: t, t1: t + 9000 });
    stand = free;
    if (Math.abs(free.x - tractorX) > 0.5 * P) {
      tractorX = free.x;
      M.vanRear = tractorX + 16.8 * P;
      jbMoveOutside(J, M);
    }
    // the loads: the pieces in their order, as many as fill the lorry each time
    var loads = [], cur = [], vol = 0;
    M.items.forEach(function (it) {
      var v = Math.max(0.15, (it.w / P) * (it.h / P) * Math.max(0.3, (typeof pieceHigh === "function" ? pieceHigh(it.n) : 0.8)));
      if (cur.length && vol + v > WK_TRUCK_M3) { loads.push(cur); cur = []; vol = 0; }
      cur.push(it); vol += v;
    });
    if (cur.length) { loads.push(cur); }
    var teams = Math.max(2, Math.min(5, Math.round(M.items.length / 14) + 2)), pace = 1.6 * P, at = t, last = t;
    var openFrom = t, openTo = t;
    loads.forEach(function (load, li) {
      var semi = wkMachine(plan, "semi", { paint: "#f2f2ee", stripe: "#2f5d8a" });
      semi.site = site;
      var ready = at;
      jbCome(plan, semi, stand, 19 * P, ready, { speed: 5, extra: { box: true, open: false } });
      jbStay(semi, ready, ready + 4, function (k) { return { box: true, open: k > 0.4, ramp: wkSmooth((k - 0.4) / 0.6) }; });
      var free2 = [];
      for (var q = 0; q < teams; q++) { free2.push(ready + 4 + q * 3); }
      var done = ready + 4;
      load.forEach(function (it) {
        // the team free soonest carries it: out of the lorry, along the way in, set down where it goes
        var tm = 0;
        for (var q2 = 1; q2 < teams; q2++) { if (free2[q2] < free2[tm]) { tm = q2; } }
        var r = moRoute(ctx, it), len = r ? r.len : 15 * P, dur = Math.max(6, len / pace + 3), back = Math.max(4, len / (1.9 * P));
        var t0 = free2[tm], t1 = t0 + dur;
        it.wk = { t0: t0, t1: t1, back: back };
        free2[tm] = t1 + back;
        done = Math.max(done, t1);
        // the piece itself, kept from the drawing till it is set down
        var gk = "item:" + it.id;
        if (groups[gk]) { var R = wkReveal(plan, gk, t1, t1, "pop"); R.carry = it; }
        // carried: moved with those carrying it each picture
        (function (it, t0, t1, back) {
          wkPiece(plan, t0, [], { t1: t1 + back, live: function (faces, T) {
            if (!r) { return; }
            if (T < t1) {
              var u = wkClamp((T - t0) / (t1 - t0)), pose = moPose(ctx, it, u);
              if (!pose) { return; }
              var list = plan.fly && plan.fly[gk];
              // (a piece the view does not draw just now -- down in the basement -- made for carrying)
              if (!list || !list.length) { list = jbMadeFaces(it); }
              if (list && list.length) {
                if (it.z0 === undefined) {
                  var lo = Infinity, hi = -Infinity;
                  list.forEach(function (f) { if (f.how && f.how.ghost) { return; } f.pts.forEach(function (p) { lo = Math.min(lo, p[2] || 0); hi = Math.max(hi, p[2] || 0); }); });
                  if (lo < Infinity) { it.z0 = lo; it.H = Math.max(2, hi - lo); }
                }
                moMoveFaces(faces, moBare(it, list), it, pose);
              }
              moMoverBudget = 6;
              moCarriers(faces, ctx, it, pose, u, r.len / Math.max(0.5, (t1 - t0) * 0.82));
            } else {
              moMoverBudget = 6;
              moGoingBack(faces, ctx, it, (T - t1) / back);
            }
          } });
        })(it, t0, t1, back);
      });
      // the lorry closed and away once its load is all out of it; the next one in
      var empty = Math.max(done - 5, ready + 6);
      jbStay(semi, ready + 4, empty, function () { return { box: true, open: true, ramp: 1 }; });
      jbStay(semi, empty, empty + 4, function (k) { return { box: true, open: k < 0.6, ramp: 1 - wkSmooth(k / 0.6) }; });
      semi.here = empty + 4;
      jbGo(plan, semi, empty + 4, { speed: 5, extra: { box: true } });
      at = empty + 4 + (li < loads.length - 1 ? 14 : 0);
      last = Math.max(last, Math.max.apply(null, free2));
      openTo = Math.max(openTo, done);
    });
    // the front door open for them all the while (40-movein.js)
    if (M.door) {
      var did = M.door.d.id;
      wkPiece(plan, openFrom, [], { t1: openTo + 4, live: function (faces, T) { if (T < openTo + 3) { moOpen(did); } else if (typeof moDone === "function") { moDone(); } } });
    }
    wkSay(plan, "jb_movein", t - 10, last);
    // the family, walking in
    var home = last + 2;
    M.residents.forEach(function (it, i) {
      var gk = "res:" + it.id, r = moRoute(ctx, it, false), t0 = home + i * 2.5, t1 = t0 + Math.max(6, (r ? r.len : 12 * P) / (1.3 * P));
      if (groups[gk]) { wkReveal(plan, gk, t1, t1, "pop"); }
      wkPiece(plan, t0, [], { t1: t1, live: function (faces, T) {
        if (!r || typeof peopleBody !== "function") { return; }
        var u = wkClamp((T - t0) / (t1 - t0)), start = it.lift ? 0 : r.L[2] || 0, d = start + (r.len - start) * moPace(u), a = moAt(r, d);
        var look = typeof simLook === "function" ? simLook(it.n) : null;
        peopleBody(faces, it.n, a.x, a.y, a.z, u > 0.94 ? peopleFacing(it.n) : Math.atan2(a.dir[1], a.dir[0]), u > 0.94 ? 0 : moStep(d - start, 3 * P), look, Math.min(1, u / 0.1));
      } });
      home = Math.max(home, t1);
    });
    if (M.residents.length) { wkSay(plan, "jb_family", last, home); }
    J.moveDone = home;
    plan.labelsAt = home;
    plan.T = Math.max(plan.T, home);
  } });
  // A piece's own model, made where it stands, for carrying when the view has none of its faces
  function jbMadeFaces(it) {
    if (it.made !== undefined) { return it.made; }
    it.made = null;
    var n = it.n, z0 = it.fz || 0;
    if (!n || typeof v3ModelPut !== "function") { return null; }
    var made = [];
    try { if (!v3ModelPut(made, n, function () { return z0 / FLOOR_PX; }, function () { return z0 / FLOOR_PX + 3; }, function () { return []; })) { made = []; } }
    catch (e) { made = []; }
    var dx = it.cx - n.x, dy = it.cy - n.y;
    made = made.filter(function (f) { return !(f.how && f.how.ghost); }).map(function (f) {
      f.pts = f.pts.map(function (q) { return [q[0] + dx, q[1] + dy, q[2]]; });
      if (f.mesh) { f.mesh = Object.assign({}, f.mesh, { base: [f.mesh.base[0] + dx, f.mesh.base[1] + dy, f.mesh.base[2]], xf: [f.mesh.xf[0] + dx, f.mesh.xf[1] + dy, f.mesh.xf[2], f.mesh.xf[3], f.mesh.xf[4]] }); }
      f.node = n;
      return f;
    });
    it.made = made.length ? made : null;
    return it.made;
  }
  // the lorry's back moved along: the way out of it to the path, recomputed (as moPlan made it)
  function jbMoveOutside(J, M) {
    var P = J.P, street = M.street, door = M.door, g0 = J.ctx.zs[0] || 0;
    var back = street.W(M.vanRear - 1.0 * P, street.park), foot = street.W(M.vanRear + 2.8 * P, street.park), walk = street.W(M.vanRear + 2.8 * P, street.hy + 0.8 * P);
    M.outside = [[back[0], back[1], 1.25 * P + 0.03 * P], [foot[0], foot[1], 0], [walk[0], walk[1], 0]];
    if (door) {
      var round = moOutsideWay(M.plan, walk, door.out);
      round.forEach(function (p) { M.outside.push([p[0], p[1], 0]); });
      M.outside.push([door.out[0], door.out[1], g0], [door.d.x, door.d.y, g0]);
      M.doorIdx = M.outside.length - 2;
    }
    M.items.forEach(function (it) { it.route = undefined; });
    M.residents.forEach(function (it) { it.route = undefined; });
  }

  // ---- 12. the site cleared: the telehandler gone, the skip and the toilet taken, the crew home ------------
  WK_PHASES.push({ name: "clear", make: function (plan) {
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site;
    var t = Math.max(J.insideDone || 0, J.scafDown || 0);
    // the telehandler: away once the last of the timber is up
    if (J.tele) {
      var m = J.tele, tl = Math.max(m.free, J.roofDone || 0) + 2;
      var st = wkNearStand(plan, { len: 5.2 * P, wid: 2.5 * P, target: [m.stand.x, m.stand.y], reach: 3 * P, t0: tl, t1: tl + 20 }) || m.stand;
      tl = jbTeleDrive(plan, m, [m.stand.x, m.stand.y], tl, m.stand.ang, { boom: 0.05 });
      var away = wkLeave(site, m.stand, 5.2 * P), dur = away.len / (4 * P) + 2;
      wkMSeg(m, tl, tl + dur, function (k) { return Object.assign({ site: site, moving: true, boom: 0.05 }, wkPoseOn(away, away.len * wkEaseDrive(k, true), false)); }).gone = true;
      void st;
    }
    // what is left in the yard, into the skip; the skip and the toilet onto a flatbed and away
    var crew = J.crew, end = t;
    crew.forEach(function (w, i) {
      if (i % 3) { return; }
      wkGo(plan, w, [J.yard.w[0], J.yard.w[1], 0], { after: t });
      wkDo(w, 1, "hold");
      wkGo(plan, w, [J.skip.w[0], J.skip.w[1] + 1.4 * P, 0], { carry: { kind: "studs", n: 2, len: 2.0 } });
      wkDo(w, 1.5, "hold");
      end = Math.max(end, w.free);
    });
    // the yard's stacks, cleared
    plan.pieces.forEach(function (pc) { if (pc.t1 === 1e9) { pc.t1 = end; } });
    if (J.skipM) { J.skipM.segs[0].t1 = end + 6; }
    (J.looMs || (J.looM ? [J.looM] : [])).forEach(function (m) { m.segs[0].t1 = end + 6; });
    wkSay(plan, "jb_clean", t, end + 6);
    // each to their pickup, and away
    var home = end + 4;
    crew.forEach(function (w, i) {
      var pk = J.pickups[Math.floor(i / 3)], at = jbWorld(J, [pk.stand.x + ((i % 3) - 1) * 1.2 * P, pk.stand.y - 1.3 * P], 0);
      wkGo(plan, w, at, { after: end });
      wkDo(w, 0.6, "stand");
      w.gone = true;
      home = Math.max(home, w.free);
    });
    J.pickups.forEach(function (pk, i) {
      var go = home + 1 + i * 2;
      pk.here = pk.arrived;
      jbGo(plan, pk, go, { speed: 7 });
    });
    plan.T = Math.max(plan.T, home + 12, J.moveDone || 0);
  } });
