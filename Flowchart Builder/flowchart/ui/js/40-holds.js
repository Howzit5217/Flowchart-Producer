// ---------------------------------------------------------------------------
//  40-holds.js -- what holds a building together in a storm (40-storm.js),
//  to be seen inside its walls (39-xray.js): the steel that ties the roof
//  down to every wall it sits on, straps down the outside walls from roof
//  to sill, bolts and hold-downs into the foundation, panels nailed over
//  the outside walls to stiffen them, the safe room's concrete; and in a
//  tall building, its bracing, the outriggers that tie its core to its
//  outside columns, the damper at its top
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (my own, 2026-10-03, after the storm let loose: what is put in to hold
  // the house together was a word on a tile; now, looking inside the walls,
  // it is there -- where such things go, as many as go)
  var HX_STEEL = { piece: true, color: "#9ea7ad", edge: "#6d767c", bare: true, xray: true, pat: 22 };
  var HX_DARK = { piece: true, color: "#5f676d", edge: "#3e454a", bare: true, xray: true, pat: 22 };
  var HX_PANEL = { piece: true, color: "#c9a56b", edge: "#9a7b48", bare: true, xray: true, pat: 21, alpha: 0.42, late: true };
  var HX_CONCRETE = { piece: true, color: "#b4b1a9", edge: "#86837c", bare: true, xray: true, pat: 10, alpha: 0.6, late: true };
  var HX_DAMPER = { piece: true, color: "#c0392b", edge: "#7d241b", bare: true, xray: true, pat: 22 };
  // Each room's outside walls, a stretch at a time: where a spot along it
  // has no room of the same floor beyond it.
  function hxRooms() {
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && !((n.turn || 0) % 90) && n.partOf === undefined; });
    return rooms.map(function (r) {
      var f = floors.length ? floorAt(floors, r.x, r.y) : null;
      return { n: r, level: f ? f.level : 0, dx: f ? f.dx : 0, dy: f ? f.dy : 0, dz: f ? f.z : 0, top: ceilOf(r) * FLOOR_PX };
    });
  }
  function hxOutside(all, R, px, py) {
    return !all.some(function (o) { return o !== R && o.level === R.level && insideArea(o.n, px, py); });
  }
  function hxOver(all, R) {
    var cx = R.n.x + R.dx, cy = R.n.y + R.dy;
    return all.some(function (o) { return o.level > R.level && insideArea(o.n, cx - o.dx, cy - o.dy); });
  }
  // along each outside wall every `step` metres: the spot (in the picture),
  // the way out, and the wall's thickness
  function hxAlong(all, R, step, fn) {
    var P = FLOOR_PX, r = R.n, hw = r.w / 2, hh = r.h / 2, T = Math.max(1, Math.min(6, Math.min(r.w, r.h) * 0.06));
    var at = { x: r.x + R.dx, y: r.y + R.dy, turn: r.turn || 0 }, paper = { x: r.x, y: r.y, turn: r.turn || 0 };
    [["top", 2 * hw, function (a) { return [-hw + a, -hh + T / 2]; }, [0, -1]], ["foot", 2 * hw, function (a) { return [-hw + a, hh - T / 2]; }, [0, 1]],
     ["left", 2 * hh, function (a) { return [-hw + T / 2, -hh + a]; }, [-1, 0]], ["right", 2 * hh, function (a) { return [hw - T / 2, -hh + a]; }, [1, 0]]].forEach(function (e) {
      var len = e[1], n = Math.max(1, Math.floor(len / (step * P)));
      for (var k = 0; k < n; k++) {
        var a = (k + 0.5) * len / n, l = e[2](a), probe = v3Local(paper, l[0] + e[3][0] * (T / 2 + 0.3 * P), l[1] + e[3][1] * (T / 2 + 0.3 * P));
        if (!hxOutside(all, R, probe[0], probe[1])) { continue; }
        var w = v3Local(at, l[0], l[1]), o = v3Local(at, l[0] + e[3][0], l[1] + e[3][1]);
        fn([w[0], w[1]], [o[0] - w[0], o[1] - w[1]], T, e[0], a, len);
      }
    });
  }
  // a box standing at p, its face toward `out`, `w` across, `d` deep, z0..z1
  function hxBox(faces, p, out, w, d, z0, z1, how, off) {
    var ox = out[0], oy = out[1], ax = -oy, ay = ox, c = [p[0] + ox * (off || 0), p[1] + oy * (off || 0)];
    v3Prism(faces, [[c[0] - ax * w / 2 - ox * d / 2, c[1] - ay * w / 2 - oy * d / 2], [c[0] + ax * w / 2 - ox * d / 2, c[1] + ay * w / 2 - oy * d / 2],
                    [c[0] + ax * w / 2 + ox * d / 2, c[1] + ay * w / 2 + oy * d / 2], [c[0] - ax * w / 2 + ox * d / 2, c[1] - ay * w / 2 + oy * d / 2]], z0, z1, how);
  }
  function hxHouse(faces) {
    var P = FLOOR_PX, all = hxRooms(), made = 0, cap = 4000;
    var ties = smHold("ties") || smHold("straps"), straps = smHold("straps"), anchors = smHold("anchors"), shear = smHold("shear");
    all.forEach(function (R) {
      if (made > cap || !xrayShownLevel(R.level, null)) { return; }
      var top = R.dz + R.top, foot = R.dz;
      // the roof tied down where every rafter sits on a top storey's outside wall (24 in apart)
      if (ties && !hxOver(all, R)) {
        hxAlong(all, R, 0.61, function (p, out, T) { hxBox(faces, p, out, 0.05 * P, 0.012 * P, top - 0.14 * P, top + 0.1 * P, HX_STEEL, T / 2 + 0.006 * P); made++; });
      }
      // straps down the outside of the wall, top plate to sill (4 ft apart)
      if (straps) {
        hxAlong(all, R, 1.22, function (p, out, T) { hxBox(faces, p, out, 0.04 * P, 0.008 * P, foot + 0.02 * P, top, HX_STEEL, T / 2 + 0.01 * P); made++; });
      }
      // panels nailed over the outside walls, 4 ft wide, a seam between each
      if (shear) {
        hxAlong(all, R, 1.22, function (p, out, T, edge, a, len) {
          var n = Math.max(1, Math.floor(len / (1.22 * P)));
          hxBox(faces, p, out, len / n - 0.012 * P, 0.012 * P, foot + 0.02 * P, top - 0.02 * P, HX_PANEL, T / 2 + 0.02 * P); made++;
        });
      }
      // bolts into the foundation every 6 ft, and a hold-down at each end of the ground floor's outside walls
      if (anchors && R.level === 0) {
        hxAlong(all, R, 1.8, function (p, out) { hxBox(faces, p, out, 0.025 * P, 0.025 * P, foot - 0.18 * P, foot + 0.09 * P, HX_DARK); made++; });
        var r = R.n, at = { x: r.x + R.dx, y: r.y + R.dy, turn: r.turn || 0 }, hw = r.w / 2 - 0.12 * P, hh = r.h / 2 - 0.12 * P;
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
          var paper = v3Local({ x: r.x, y: r.y, turn: r.turn || 0 }, s[0] * (r.w / 2 + 0.3 * P), s[1] * (r.h / 2 + 0.3 * P));
          if (!hxOutside(all, R, paper[0], paper[1])) { return; }
          var c = v3Local(at, s[0] * hw, s[1] * hh);
          hxBox(faces, c, [s[0], 0], 0.07 * P, 0.07 * P, foot, foot + 0.45 * P, HX_STEEL); made++;
        });
      }
    });
    // the safe room: concrete, in the ground-floor room nearest the middle
    if (smHold("saferoom")) {
      var ground = all.filter(function (R) { return R.level === 0; });
      if (ground.length && xrayShownLevel(0, null)) {
        var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
        ground.forEach(function (R) { var q = tieBox(R.n); b.l = Math.min(b.l, q.l + R.dx); b.r = Math.max(b.r, q.r + R.dx); b.t = Math.min(b.t, q.t + R.dy); b.b = Math.max(b.b, q.b + R.dy); });
        var mx = (b.l + b.r) / 2, my = (b.t + b.b) / 2, near = ground.slice().sort(function (p, q) {
          return Math.hypot(p.n.x + p.dx - mx, p.n.y + p.dy - my) - Math.hypot(q.n.x + q.dx - mx, q.n.y + q.dy - my);
        })[0];
        var c = [near.n.x + near.dx, near.n.y + near.dy], h = Math.min(1.1 * P, near.n.w / 2 - 0.2 * P, near.n.h / 2 - 0.2 * P), t = 0.2 * P;
        if (h > 0.5 * P) {
          [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (s) {
            var p = [c[0] + s[0] * (h - t / 2), c[1] + s[1] * (h - t / 2)];
            hxBox(faces, p, s, 2 * h, t, near.dz, near.dz + 2.3 * P, HX_CONCRETE);
          });
        }
      }
    }
  }
  // A tall building: its four faces braced corner to corner every few
  // storeys; outriggers, deep steel from its middle out to its sides, at
  // its middle and its top; the damper, a great weight hung at its top.
  function hxTower(faces, B) {
    var P = FLOOR_PX, all = hxRooms(), ground = all.filter(function (R) { return R.level === 0; });
    if (!ground.length) { return; }
    var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity }, top = 0;
    ground.forEach(function (R) { var q = tieBox(R.n); b.l = Math.min(b.l, q.l + R.dx); b.r = Math.max(b.r, q.r + R.dx); b.t = Math.min(b.t, q.t + R.dy); b.b = Math.max(b.b, q.b + R.dy); });
    all.forEach(function (R) { top = Math.max(top, R.dz + R.top); });
    var cx = (b.l + b.r) / 2, cy = (b.t + b.b) / 2, w = 0.25 * P;
    function beam(A, Bp, how) {
      var d = [Bp[0] - A[0], Bp[1] - A[1], Bp[2] - A[2]], l = Math.hypot(d[0], d[1], d[2]) || 1, u = [d[0] / l, d[1] / l, d[2] / l];
      var side = Math.abs(u[2]) > 0.9 ? [1, 0, 0] : [-u[1], u[0], 0], sl = Math.hypot(side[0], side[1]) || 1;
      side = [side[0] / sl, side[1] / sl, 0];
      var up = [u[1] * side[2] - u[2] * side[1], u[2] * side[0] - u[0] * side[2], u[0] * side[1] - u[1] * side[0]];
      xrayBeam(faces, A, Bp, side, up, w, w, how);
    }
    if (smHold("brace")) {
      var every = 4 * 3.2 * P;
      [[b.l, b.t, b.r, b.t], [b.r, b.t, b.r, b.b], [b.r, b.b, b.l, b.b], [b.l, b.b, b.l, b.t]].forEach(function (s) {
        for (var z = 0; z + every * 0.5 < top; z += every) {
          var z1 = Math.min(top, z + every);
          beam([s[0], s[1], z], [s[2], s[3], z1], HX_STEEL); beam([s[2], s[3], z], [s[0], s[1], z1], HX_STEEL);
        }
      });
    }
    if (smHold("outrigger")) {
      [top * 0.5, top - 1.6 * P].forEach(function (z) {
        [[b.l, cy], [b.r, cy], [cx, b.t], [cx, b.b]].forEach(function (e) {
          beam([cx, cy, z - 1.4 * P], [e[0], e[1], z - 1.4 * P], HX_DARK); beam([cx, cy, z + 1.2 * P], [e[0], e[1], z + 1.2 * P], HX_DARK);
          beam([cx, cy, z - 1.4 * P], [e[0], e[1], z + 1.2 * P], HX_DARK);
        });
      });
    }
    if (smHold("damper")) {
      var s = Math.min(b.r - b.l, b.b - b.t) * 0.14, z0 = top - 3.4 * P;
      v3Prism(faces, [[cx - s, cy - s], [cx + s, cy - s], [cx + s, cy + s], [cx - s, cy + s]], z0, z0 + 1.6 * P, HX_DAMPER);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
        beam([cx + q[0] * s * 0.8, cy + q[1] * s * 0.8, z0 + 1.6 * P], [cx + q[0] * s * 0.8, cy + q[1] * s * 0.8, top - 0.2 * P], HX_STEEL);
        beam([cx + q[0] * s, cy + q[1] * s, z0 + 0.4 * P], [cx + q[0] * s * 1.6, cy + q[1] * s * 1.6, z0 + 0.4 * P], HX_DARK);
      });
    }
  }
  if (typeof xrayBuild === "function") {
    var xrayBuildHolds = xrayBuild;
    xrayBuild = function (model) {
      var made = xrayBuildHolds.apply(this, arguments);
      try {
        if (made && made.faces && xrayLayer("frame") && typeof smHold === "function" && houseOpt("hold")) {
          var B = typeof smBuilding === "function" ? smBuilding() : null;
          if (B && B.tall) { hxTower(made.faces, B); } else if (B) { hxHouse(made.faces); }
        }
      } catch (e) { /* the walls as they were */ }
      return made;
    };
  }
  // (what is inside the walls drawn again when what holds it changes: its key does not know)
  // (and a tall building's outside -- its panels and frames, not walls -- faint
  // too, inside the walls, or what holds it is behind them)
  var hxTallKept = { nodes: null, n: -1, tall: false }, hxFaintKept = new WeakMap();
  function hxTall() {
    if (hxTallKept.nodes !== hand.nodes || hxTallKept.n !== hand.nodes.length) {
      var B = typeof smBuilding === "function" ? smBuilding() : null;
      hxTallKept = { nodes: hand.nodes, n: hand.nodes.length, tall: !!(B && B.tall) };
    }
    return hxTallKept.tall;
  }
  if (typeof v3Build === "function") {
    var v3BuildHolds = v3Build, hxWas = null;
    v3Build = function () {
      var now = JSON.stringify(houseOpt("hold") || null);
      if (hxWas !== null && now !== hxWas && V3) { V3.xrayKept = null; }
      hxWas = now;
      var model = v3BuildHolds.apply(this, arguments);
      try {
        if (model && model.faces && typeof xrayOn === "function" && xrayOn() && houseOpt("hold") && hxTall()) {
          var faint = hxFaintKept, high = 6 * FLOOR_PX;
          model.faces.forEach(function (f) {
            var h = f.how;
            if (!h || h.xray || h.glass || f.mesh || !h.piece) { return; }
            // (a room's own -- or the tower's face, its bands and fins (40-towers.js), up off the street)
            if (f.node ? f.node.kind !== "i_room" : !f.pts || !f.pts.some(function (p) { return (p[2] || 0) > high; })) { return; }
            if (!faint.has(h)) { faint.set(h, Object.assign({}, h, { alpha: Math.min(0.18, h.alpha === undefined ? 1 : h.alpha), late: true })); }
            f.how = faint.get(h);
          });
        }
      } catch (e) { /* as drawn */ }
      return model;
    };
  }
