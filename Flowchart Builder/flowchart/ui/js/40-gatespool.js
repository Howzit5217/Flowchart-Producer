// ---------------------------------------------------------------------------
//  40-gatespool.js -- what is opened and gone into out of doors and through
//  the back wall: a sliding door as it is made (two framed panes of glass on
//  their tracks, one fixed, one sliding past it on its rollers); a gate in a
//  fence swung open and walked through; and a pool dug into the ground --
//  its tiled walls and floor sloping from the shallow end to the deep, steps
//  down into it, the light through the water in a net on its floor, the
//  water itself see-through, moving, the sky in it -- that is gone into and
//  swum in
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update this so the sliding doors actually
  // function properly and are shown properly to the person and to also update
  // it so like fences can have gates and you can open them and go into the
  // pools that have proper like water rather than just a blank texture")

  // ---- a sliding door --------------------------------------------------------------------------------
  // In its own numbers, x along the wall: a frame round the opening (jambs, a
  // head, an aluminum sill with its two tracks); a fixed panel on the outer
  // track over one half, a sliding one on the inner track over the other,
  // the two overlapping at the meeting stiles; opened, the sliding panel runs
  // along its track behind the fixed one -- half the opening clear, not a
  // gap down one side of a door that never shut.
  var GP_SLIDE_TRIM = "#f3f2ee", GP_SLIDE_SILL = "#b9bdc1";
  function gpSlider(faces, n, open) {
    var H = openHead(n), hw = n.w / 2, J = 2.4, deep = 6.5, P = FLOOR_PX, own = simLook(n);
    var trimC = typeof styleTrim === "function" ? styleTrim(GP_SLIDE_TRIM) : GP_SLIDE_TRIM;
    var frame = { piece: true, color: trimC, edge: own.line };
    var sill = { piece: true, color: GP_SLIDE_SILL, edge: own.line, pat: 22 };
    var glass = { leaf: true, glass: true, edge: own.line };
    var dark = { piece: true, color: "#2c2e31", edge: "#1a1b1d", pat: 22 };
    var top = H + 0.03 * P;
    // the frame round the opening, through the wall
    v3Box(faces, n, -hw, -hw + J, -deep, deep, 0, top, frame);
    v3Box(faces, n, hw - J, hw, -deep, deep, 0, top, frame);
    v3Box(faces, n, -hw, hw, -deep, deep, H - 0.4, top + 1.2, frame);
    v3Box(faces, n, -hw + J, hw - J, -deep, deep, 0, 1.0, sill);
    // the panels: each its frame -- stiles up the sides, rails across -- and the glass in it
    var ov = 2.6, inner = hw - J, half = inner + ov / 2;           // (each panel's width, overlapping at the middle)
    var k = Math.max(0, Math.min(1, open / 90)), r = n.dd && n.dd.hand === "r" ? -1 : 1;
    var run = k * (half * 2 - inner - ov) * 0.98;                 // (as far as it runs: over the fixed one)
    function panel(x0, x1, y0, y1, handle) {
      var st = 2.6, rb = 3.4, rt = 2.6, z0 = 1.0, z1 = H - 0.6;
      v3Box(faces, n, x0, x0 + st, y0, y1, z0, z1, frame);
      v3Box(faces, n, x1 - st, x1, y0, y1, z0, z1, frame);
      v3Box(faces, n, x0 + st, x1 - st, y0, y1, z0, z0 + rb, frame);
      v3Box(faces, n, x0 + st, x1 - st, y0, y1, z1 - rt, z1, frame);
      var gm = (y0 + y1) / 2;
      v3Box(faces, n, x0 + st, x1 - st, gm - 0.25, gm + 0.25, z0 + rb, z1 - rt, glass);
      if (handle !== undefined) {
        // its handle, a bar up the stile it is pulled by, either face
        var hx = handle, hz = H * 0.44;
        [[y0 - 1.0, y0], [y1, y1 + 1.0]].forEach(function (q) { v3Box(faces, n, hx - 0.5, hx + 0.5, q[0], q[1], hz, hz + 0.16 * P, dark); });
      }
    }
    // (r: which side slides -- the sliding panel on the left as drawn, or mirrored)
    function X(x) { return x * r; }
    var fixA = X(-ov / 2), fixB = X(inner);
    panel(Math.min(fixA, fixB), Math.max(fixA, fixB), 0.6, 2.4);
    var sA = X(-inner) + X(run), sB = X(ov / 2) + X(run);
    panel(Math.min(sA, sB), Math.max(sA, sB), -2.4, -0.6, X(-inner + 4) + X(run));
  }
  if (typeof v3Door === "function") {
    var v3DoorGp = v3Door;
    v3Door = function (faces, n, open) {
      if (n && n.kind === "i_slide") { try { return gpSlider(faces, n, open); } catch (e) { /* as it was */ } }
      return v3DoorGp.apply(this, arguments);
    };
  }

  // ---- a gate, open: walked through ------------------------------------------------------------------
  // (its leaf swings on its hinges, 40-fences.js and 40-open3d.js; what a
  // body bumps into round it -- the box it stands in -- let go while it is open)
  if (typeof v3Solids === "function") {
    var v3SolidsGp = v3Solids;
    v3Solids = function (model) {
      if (model && model.faces && typeof o3IsOpen === "function") {
        var open = {};
        hand.nodes.forEach(function (n) { if (n.kind === "i_gate" && o3IsOpen(n.id, 0)) { open[n.id] = true; } });
        if (Object.keys(open).length) {
          var keep = model.faces.filter(function (f) { return !(f.node && open[f.node.id] && f.how && f.how.ghost); });
          return v3SolidsGp.call(this, Object.assign({}, model, { faces: keep }));
        }
      }
      return v3SolidsGp.apply(this, arguments);
    };
  }

  // ---- a pool, dug in ---------------------------------------------------------------------------------------
  // Metres: the stone coping round it; the water under the coping's top; how
  // deep at the shallow end and the deep; the steps down at the shallow end.
  var GP_COPE = 0.3, GP_WATER = 0.12, GP_SHALLOW = 1.05, GP_DEEP = 1.95, GP_STEP = [0.3, 0.27], GP_STEPS = 3;
  var GP_TILE = { piece: true, color: "#9fd6e6", edge: "#7cb9cc", pat: 81, bare: true };
  var GP_BAND = { piece: true, color: "#2f6f9a", edge: "#24597d", pat: 81, bare: true };
  var GP_LANE = { piece: true, color: "#1f4f7a", edge: "#1a4266", pat: 81, bare: true };
  var GP_WATERHOW = { piece: true, color: "#1e8fc2", edge: "#1e8fc2", pat: 80, alpha: 0.62, late: true, bare: true };
  var GP = { kept: new Map(), swim: 0, pace: null, inWater: false };
  function gpPools() { return hand.nodes.filter(function (n) { return n.kind === "i_pool" && n.w > 1.2 * FLOOR_PX && n.h > 1.2 * FLOOR_PX; }); }
  // Where a pool stands in the picture: its middle, its way round, the ground it is dug into.
  function gpFrame(n) {
    var floors = typeof floorsOf === "function" ? floorsOf() : [], f = floors.length ? floorAt(floors, n.x, n.y) : null;
    if (f && f.level !== 0) { return null; }
    var x = n.x + (f ? f.dx : 0), y = n.y + (f ? f.dy : 0), a = (n.turn || 0) * Math.PI / 180;
    var z = (f ? f.z : 0) + (typeof TERR_ON !== "undefined" && TERR_ON && typeof terrAt === "function" ? terrAt(x, y) : 0);
    return { n: n, x: x, y: y, c: Math.cos(a), s: Math.sin(a), hw: n.w / 2, hh: n.h / 2, z: z };
  }
  function gpLocal(F, x, y) { var dx = x - F.x, dy = y - F.y; return [dx * F.c + dy * F.s, -dx * F.s + dy * F.c]; }
  function gpWorld(F, lx, ly) { return [F.x + lx * F.c - ly * F.s, F.y + lx * F.s + ly * F.c]; }
  // the floor's depth under the water's top along the pool (lx, px): shallow, a slope, deep
  function gpFloorAt(F, lx) {
    var P = FLOOR_PX, ix0 = -F.hw + GP_COPE * P, ix1 = F.hw - GP_COPE * P, L = ix1 - ix0, t = (lx - ix0) / (L || 1);
    var k = t < 0.42 ? 0 : t > 0.62 ? 1 : (t - 0.42) / 0.2;
    return (GP_SHALLOW + (GP_DEEP - GP_SHALLOW) * k * k * (3 - 2 * k)) * P;
  }
  // The basin and its water, in the picture: made once for where the pool is.
  function gpFaces(F) {
    var P = FLOOR_PX, key = [F.n.id, Math.round(F.x), Math.round(F.y), Math.round(F.hw), Math.round(F.hh), Math.round(F.c * 1000), Math.round(F.s * 1000), Math.round(F.z)].join("|");
    var kept = GP.kept.get(F.n.id);
    if (kept && kept.key === key) { return kept.faces; }
    var out = [], node = F.n;
    var ix0 = -F.hw + GP_COPE * P, ix1 = F.hw - GP_COPE * P, iy0 = -F.hh + GP_COPE * P, iy1 = F.hh - GP_COPE * P;
    var top = F.z, zw = F.z - GP_WATER * P;
    function W(lx, ly, z) { var p = gpWorld(F, lx, ly); return [p[0], p[1], z]; }
    function N(lx, ly, lz) { return [lx * F.c - ly * F.s, lx * F.s + ly * F.c, lz]; }
    function face(pts, n, how) { out.push({ pts: pts, n: n, how: how, node: node, gpPool: true }); }
    // the floor along its length, a few strips: flat, the slope, flat
    var xs = [], steps = 14;
    for (var i = 0; i <= steps; i++) { xs.push(ix0 + (ix1 - ix0) * i / steps); }
    var zf = function (lx) { return zw - gpFloorAt(F, lx); };
    for (var j = 0; j < steps; j++) {
      var a = xs[j], b = xs[j + 1], za = zf(a), zb = zf(b), dz = (zb - za) / (b - a), nl = Math.hypot(dz, 1);
      face([W(a, iy0, za), W(b, iy0, zb), W(b, iy1, zb), W(a, iy1, za)], N(-dz / nl, 0, 1 / nl), GP_TILE);
      // (a dark line of tiles down the middle, as pools are marked)
      if (a > ix0 + 0.6 * P && b < ix1 - 0.4 * P) {
        face([W(a, -0.12 * P, za + 0.4), W(b, -0.12 * P, zb + 0.4), W(b, 0.12 * P, zb + 0.4), W(a, 0.12 * P, za + 0.4)], N(-dz / nl, 0, 1 / nl), GP_LANE);
      }
      // the long walls, their foot following the floor -- tiled, a dark band of mosaic along the waterline
      face([W(a, iy0, za), W(b, iy0, zb), W(b, iy0, top), W(a, iy0, top)], N(0, 1, 0), GP_TILE);
      face([W(b, iy1, zb), W(a, iy1, za), W(a, iy1, top), W(b, iy1, top)], N(0, -1, 0), GP_TILE);
      face([W(a, iy0 + 0.4, zw - 0.16 * P), W(b, iy0 + 0.4, zw - 0.16 * P), W(b, iy0 + 0.4, top), W(a, iy0 + 0.4, top)], N(0, 1, 0), GP_BAND);
      face([W(b, iy1 - 0.4, zw - 0.16 * P), W(a, iy1 - 0.4, zw - 0.16 * P), W(a, iy1 - 0.4, top), W(b, iy1 - 0.4, top)], N(0, -1, 0), GP_BAND);
    }
    // the ends
    var zs = zf(ix0), zd = zf(ix1);
    face([W(ix0, iy1, zs), W(ix0, iy0, zs), W(ix0, iy0, top), W(ix0, iy1, top)], N(1, 0, 0), GP_TILE);
    face([W(ix1, iy0, zd), W(ix1, iy1, zd), W(ix1, iy1, top), W(ix1, iy0, top)], N(-1, 0, 0), GP_TILE);
    face([W(ix0 + 0.4, iy1, zw - 0.16 * P), W(ix0 + 0.4, iy0, zw - 0.16 * P), W(ix0 + 0.4, iy0, top), W(ix0 + 0.4, iy1, top)], N(1, 0, 0), GP_BAND);
    face([W(ix1 - 0.4, iy0, zw - 0.16 * P), W(ix1 - 0.4, iy1, zw - 0.16 * P), W(ix1 - 0.4, iy1, top), W(ix1 - 0.4, iy0, top)], N(-1, 0, 0), GP_BAND);
    // the steps down at the shallow end, the whole way across: each a tread and its riser
    var sz = zw, sx = ix0;
    for (var s = 0; s < GP_STEPS; s++) {
      var tread = sz - GP_STEP[1] * P;
      if (tread <= zs + 0.08 * P) { break; }
      var x1 = sx + GP_STEP[0] * P * (GP_STEPS - s);
      face([W(sx, iy0, tread), W(x1, iy0, tread), W(x1, iy1, tread), W(sx, iy1, tread)], N(0, 0, 1), GP_TILE);
      face([W(x1, iy0, zs), W(x1, iy1, zs), W(x1, iy1, tread), W(x1, iy0, tread)], N(1, 0, 0), GP_TILE);
      // (its nose marked dark, to be seen under the water)
      face([W(x1 - 0.06 * P, iy0, tread + 0.3), W(x1, iy0, tread + 0.3), W(x1, iy1, tread + 0.3), W(x1 - 0.06 * P, iy1, tread + 0.3)], N(0, 0, 1), GP_LANE);
      sz = tread;
    }
    // the water: level under the coping, see-through, moving (38-view3d-gl.js, pattern 80)
    face([W(ix0, iy0, zw), W(ix1, iy0, zw), W(ix1, iy1, zw), W(ix0, iy1, zw)], [0, 0, 1], GP_WATERHOW);
    GP.kept.set(F.n.id, { key: key, faces: out });
    return out;
  }
  // The coping round it, the ladder at the deep end, a rail down the steps: its model (38-models.js)
  if (typeof mDef === "function") {
    mDef("i_pool", function (M, W, D, H, C) {
      C = mPick(C, "#4fa3c7", "#d9d3c7");
      var cope = Math.min(GP_COPE * 100 * cm, W * 0.12), stone = M.mat("stone", C.frame), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2, ht = 5 * cm;
      M.box(x0, x1, y0, y0 + cope, 0, ht, stone, 1.6 * cm);
      M.box(x0, x1, y1 - cope, y1, 0, ht, stone, 1.6 * cm);
      M.box(x0, x0 + cope, y0 + cope, y1 - cope, 0, ht, stone, 1.6 * cm);
      M.box(x1 - cope, x1, y0 + cope, y1 - cope, 0, ht, stone, 1.6 * cm);
      var chrome = M.mat("chrome", "#dfe3e8"), deepZ = -(GP_DEEP - 0.3) * 100 * cm, lx = x1 - cope - 14 * cm;
      // the ladder in, at the deep end: its rails over the coping and down the wall, its treads under the water
      [y0 + cope + D * 0.2, y0 + cope + D * 0.2 + 50 * cm].forEach(function (y) {
        M.tube([x1 - cope + 18 * cm, y, ht], [x1 - cope + 18 * cm, y, 82 * cm], 1.5 * cm, chrome, 8);
        M.tube([x1 - cope + 18 * cm, y, 82 * cm], [lx + 4 * cm, y, 82 * cm], 1.5 * cm, chrome, 8);
        M.tube([lx + 4 * cm, y, 82 * cm], [lx + 4 * cm, y, deepZ * 0.45], 1.5 * cm, chrome, 8);
        M.tube([lx + 4 * cm, y, deepZ * 0.45], [x1 - cope - 2 * cm, y, deepZ * 0.45 - 6 * cm], 1.5 * cm, chrome, 8);
      });
      for (var t = 0; t < 3; t++) {
        var tz = -(22 + t * 28) * cm;
        M.box(lx - 6 * cm, lx + 8 * cm, y0 + cope + D * 0.2, y0 + cope + D * 0.2 + 50 * cm, tz - 1.5 * cm, tz, M.mat("plastic", "#e8ecef"));
      }
      // a rail down the steps at the shallow end
      var sx = x0 + cope + 25 * cm, sy = y1 - cope - 35 * cm;
      M.tube([sx - 40 * cm, sy, ht], [sx - 40 * cm, sy, 88 * cm], 1.5 * cm, chrome, 8);
      M.tube([sx - 40 * cm, sy, 88 * cm], [sx + 30 * cm, sy, 60 * cm], 1.5 * cm, chrome, 8);
      M.tube([sx + 30 * cm, sy, 60 * cm], [sx + 50 * cm, sy, -40 * cm], 1.5 * cm, chrome, 8);
    });
  }
  // In each picture: the basin and its water put in; the pool's flat picture
  // of water taken away; the lawn cut open over it (where the land is not
  // its own mesh -- 40-land.js cuts that); and you, swimming, the water
  // stirred round you.
  if (typeof v3Build === "function") {
    var v3BuildGp = v3Build;
    v3Build = function () {
      var model = v3BuildGp.apply(this, arguments);
      try { if (model && model.faces && V3 && V3.scene !== "space" && !V3.flat) { gpPut(model); } } catch (e) { /* as it was */ }
      return model;
    };
  }
  function gpPut(model) {
    var pools = gpPools().map(gpFrame).filter(Boolean);
    if (!pools.length) { return; }
    var ids = {};
    pools.forEach(function (F) { ids[F.n.id] = F; });
    // (the pool's picture laid flat -- the water as a blank sheet of blue -- not drawn: the water is its own now)
    model.faces = model.faces.filter(function (f) { return !(f.node && ids[f.node.id] && !f.mesh && !f.gpPool && (f.tex || (f.how && !f.how.ghost))); });
    // the lawn, where it is the drawing's own (no land of its own on): a hole in it for each pool
    if (!(typeof TERR_ON !== "undefined" && TERR_ON)) {
      var cut = [];
      model.faces.forEach(function (f) {
        if (!f.ground) { cut.push(f); return; }
        var parts = [f];
        pools.forEach(function (F) { parts = [].concat.apply([], parts.map(function (g) { return gpHole(g, F); })); });
        Array.prototype.push.apply(cut, parts);
      });
      model.faces = cut;
    }
    pools.forEach(function (F) { Array.prototype.push.apply(model.faces, gpFaces(F)); });
    gpRipples(model, pools);
  }
  // A face of ground with a pool's box cut out of it: the pieces of it outside
  // (clipped by each of the box's four sides in turn), keeping the lawn's own
  // stripes as they were (f.uvs, 38-view3d-gl.js)
  var gpHoles = new WeakMap();
  function gpHole(f, F) {
    var key = F.n.id + "|" + Math.round(F.x) + "|" + Math.round(F.y) + "|" + Math.round(F.hw) + "|" + Math.round(F.hh) + "|" + Math.round(F.c * 1000);
    var was = gpHoles.get(f);
    if (was && was.key === key) { return was.parts; }
    var loc = f.pts.map(function (p) { var q = gpLocal(F, p[0], p[1]); return [q[0], q[1], p[2] || 0]; });
    var out = [];
    // (the box: inside means |lx| <= hw and |ly| <= hh)
    var lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
    loc.forEach(function (p) { lo[0] = Math.min(lo[0], p[0]); lo[1] = Math.min(lo[1], p[1]); hi[0] = Math.max(hi[0], p[0]); hi[1] = Math.max(hi[1], p[1]); });
    if (hi[0] <= -F.hw || lo[0] >= F.hw || hi[1] <= -F.hh || lo[1] >= F.hh) { gpHoles.set(f, { key: key, parts: [f] }); return [f]; }
    var uvOf = gpLawnUv(f);
    var rest = loc, sides = [[1, 0, F.hw], [-1, 0, F.hw], [0, 1, F.hh], [0, -1, F.hh]];
    sides.forEach(function (sd) {
      if (rest.length < 3) { return; }
      var outside = gpClip(rest, sd[0], sd[1], sd[2], true), inside = gpClip(rest, sd[0], sd[1], sd[2], false);
      if (outside.length >= 3) { out.push(outside); }
      rest = inside;
    });
    var parts = out.map(function (poly) {
      var pts = poly.map(function (q) { var w = gpWorld(F, q[0], q[1]); return [w[0], w[1], q[2]]; });
      var g = Object.assign({}, f, { pts: pts });
      if (uvOf) { g.uvs = pts.map(uvOf); }
      return g;
    });
    gpHoles.set(f, { key: key, parts: parts });
    return parts;
  }
  // keep the side of a·p > d (outside) or a·p <= d (inside), in the pool's own numbers
  function gpClip(poly, ax, ay, d, keepOut) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var p = poly[i], q = poly[(i + 1) % poly.length], vp = ax * p[0] + ay * p[1] - d, vq = ax * q[0] + ay * q[1] - d;
      var pin = keepOut ? vp > 0 : vp <= 0, qin = keepOut ? vq > 0 : vq <= 0;
      if (pin) { out.push(p); }
      if (pin !== qin) { var t = vp / (vp - vq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]); }
    }
    return out;
  }
  // the lawn's stripes, in metres from its first corner, as 38-view3d-gl.js lays them on a whole face of four corners
  function gpLawnUv(f) {
    if (f.pts.length !== 4) { return null; }
    var o = f.pts[0], e1 = [f.pts[1][0] - o[0], f.pts[1][1] - o[1]], e3 = [f.pts[3][0] - o[0], f.pts[3][1] - o[1]];
    var l1 = Math.hypot(e1[0], e1[1]) || 1, l3 = Math.hypot(e3[0], e3[1]) || 1, P = FLOOR_PX;
    return function (p) { var dx = p[0] - o[0], dy = p[1] - o[1]; return [(dx * e1[0] + dy * e1[1]) / l1 / P, (dx * e3[0] + dy * e3[1]) / l3 / P]; };
  }

  // ---- swimming --------------------------------------------------------------------------------------------
  // Whether a spot is over a pool's water (pad: metres in from its edge), and which.
  function gpWaterAt(x, y, pad) {
    var P = FLOOR_PX, hit = null;
    gpPools().forEach(function (n) {
      if (hit) { return; }
      var F = gpFrame(n);
      if (!F) { return; }
      var q = gpLocal(F, x, y), m = (GP_COPE + (pad || 0)) * P;
      if (Math.abs(q[0]) <= F.hw - m && Math.abs(q[1]) <= F.hh - m) { hit = F; }
    });
    return hit;
  }
  function gpOnPool(x, y) {
    var hit = null;
    gpPools().forEach(function (n) {
      var F = gpFrame(n);
      if (!F || hit) { return; }
      var q = gpLocal(F, x, y);
      if (Math.abs(q[0]) <= F.hw + 2 && Math.abs(q[1]) <= F.hh + 2) { hit = F; }
    });
    return hit;
  }
  // Walking onto the coping and into the water: the pool is no longer in the way.
  if (typeof v3Blocked === "function") {
    var v3BlockedGp = v3Blocked;
    v3Blocked = function (x, y) {
      try {
        var on = !V3 || V3.mode !== "walk" || !hand.nodes.some(function (n) { return n.kind === "i_pool"; }) ? null
               : typeof tieWith === "function" ? tieWith(function () { return gpOnPool(x, y); }, 1)() : gpOnPool(x, y);
        if (V3 && V3.mode === "walk" && on) { return typeof v3Bumps === "function" ? v3Bumps(x, y) : false; }
      } catch (e) { /* as it was */ }
      return v3BlockedGp.apply(this, arguments);
    };
  }
  // In the water: the eye down to just over it, swimming along slower than walking; out, back up.
  if (typeof terrEye === "function") {
    var terrEyeGp = terrEye;
    terrEye = function (here) {
      var z = terrEyeGp.apply(this, arguments);
      try { z += gpSwimDrop(here); } catch (e) { /* standing */ }
      return z;
    };
  }
  function gpSwimDrop(here) {
    if (GP.pace === null && typeof WALK_PACE === "number") { GP.pace = WALK_PACE; }
    var F = V3 && V3.mode === "walk" && V3.me && !(here && here.level !== 0) ? gpWaterAt(V3.me.x, V3.me.y, 0.05) : null, want = 0;
    if (F) {
      // (the eye a hand over the water: the water's top less where the eye would stand on the ground round it)
      var ground = typeof TERR_ON !== "undefined" && TERR_ON && typeof terrAt === "function" ? terrAt(V3.me.x, V3.me.y) : 0;
      want = (F.z - ground) - GP_WATER * FLOOR_PX + (0.2 - EYE_TALL) * FLOOR_PX;
    }
    var was = GP.swim, now = was + (want - was) * 0.22;
    if (Math.abs(want - now) < 0.3) { now = want; } else { V3.dirty = true; }
    GP.swim = now;
    var inWater = !!F;
    if (inWater !== GP.inWater) {
      GP.inWater = inWater;
      if (typeof WALK_PACE === "number" && GP.pace !== null) { WALK_PACE = inWater ? GP.pace * 0.45 : GP.pace; }
      if (typeof v3Say === "function") { v3Say(inWater ? TXT.gp_in : TXT.gp_out); }
      if (inWater && typeof useTone === "function") { useTone([180, 120], 0.35, true); }
    }
    return now;
  }
  // the water stirred round you as you swim: rings going out
  var GP_RING = { piece: true, color: "#eaf6fb", edge: "#eaf6fb", bare: true, alpha: 0.32, late: true };
  function gpRipples(model, pools) {
    if (!GP.inWater || !V3 || !V3.me) { return; }
    var F = gpWaterAt(V3.me.x, V3.me.y, 0.05);
    if (!F) { return; }
    var P = FLOOR_PX, t = performance.now() / 1000, zw = F.z - GP_WATER * P + 0.3;
    var faces = model.passing ? model.passing.faces : (model.passing = { faces: [], stand: [] }).faces;
    for (var k = 0; k < 3; k++) {
      var ph = (t * 0.6 + k / 3) % 1, r0 = (0.3 + ph * 1.4) * P, r1 = r0 + 0.05 * P, seg = 28;
      var how = Object.assign({}, GP_RING, { alpha: 0.32 * (1 - ph) });
      for (var i = 0; i < seg; i++) {
        var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
        faces.push({ pts: [[V3.me.x + Math.cos(a0) * r0, V3.me.y + Math.sin(a0) * r0, zw], [V3.me.x + Math.cos(a1) * r0, V3.me.y + Math.sin(a1) * r0, zw],
                           [V3.me.x + Math.cos(a1) * r1, V3.me.y + Math.sin(a1) * r1, zw], [V3.me.x + Math.cos(a0) * r1, V3.me.y + Math.sin(a0) * r1, zw]], n: [0, 0, 1], how: how });
      }
    }
  }
  // E at the pool: in, by the nearest edge -- or, swimming, out over it.
  if (typeof useIt === "function") {
    var useItGp = useIt;
    useIt = function (n) {
      if (n && n.kind === "i_pool" && V3 && V3.mode === "walk" && V3.me) {
        try {
          var F = gpFrame(n), P = FLOOR_PX;
          if (F) {
            var q = gpLocal(F, V3.me.x, V3.me.y), inner = [F.hw - GP_COPE * P, F.hh - GP_COPE * P];
            var swimming = Math.abs(q[0]) < inner[0] && Math.abs(q[1]) < inner[1];
            // the nearest side
            var dx = inner[0] - Math.abs(q[0]), dy = inner[1] - Math.abs(q[1]), to;
            if (swimming) {
              to = dx < dy ? [Math.sign(q[0] || 1) * (F.hw + 0.45 * P), q[1]] : [q[0], Math.sign(q[1] || 1) * (F.hh + 0.45 * P)];
            } else {
              var cx = Math.max(-inner[0] + 0.7 * P, Math.min(inner[0] - 0.7 * P, q[0])), cy = Math.max(-inner[1] + 0.7 * P, Math.min(inner[1] - 0.7 * P, q[1]));
              to = [cx, cy];
            }
            var w = gpWorld(F, to[0], to[1]);
            V3.me.x = w[0]; V3.me.y = w[1]; V3.dirty = true;
            return true;
          }
        } catch (e) { /* as it was */ }
      }
      return useItGp.apply(this, arguments);
    };
  }

  // ---- the ground of the scenery, on level land: cut open over each pool ---------------------------------
  // (on land that rises and falls the land's own mesh leaves the pool out,
  // 40-land.js; level, the scenery lays a disc of grass, and the lot's lawn,
  // just under the floor -- over the water, until cut)
  var gpCutNow = null;
  function gpCutPoly(pts) {
    var out = [pts];
    gpCutNow.forEach(function (F) {
      var next = [];
      out.forEach(function (poly) {
        var loc = poly.map(function (p) { var q = gpLocal(F, p[0], p[1]); return [q[0], q[1], p[2] || 0]; });
        var lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
        loc.forEach(function (p) { lo[0] = Math.min(lo[0], p[0]); lo[1] = Math.min(lo[1], p[1]); hi[0] = Math.max(hi[0], p[0]); hi[1] = Math.max(hi[1], p[1]); });
        if (hi[0] <= -F.hw || lo[0] >= F.hw || hi[1] <= -F.hh || lo[1] >= F.hh) { next.push(poly); return; }
        var rest = loc;
        [[1, 0, F.hw], [-1, 0, F.hw], [0, 1, F.hh], [0, -1, F.hh]].forEach(function (sd) {
          if (rest.length < 3) { return; }
          var o = gpClip(rest, sd[0], sd[1], sd[2], true);
          if (o.length >= 3) { next.push(o.map(function (q) { var w = gpWorld(F, q[0], q[1]); return [w[0], w[1], q[2]]; })); }
          rest = gpClip(rest, sd[0], sd[1], sd[2], false);
        });
      });
      out = next;
    });
    return out;
  }
  if (typeof gl3Poly === "function") {
    var gl3PolyGp = gl3Poly;
    gl3Poly = function (v, pts, n, c, a, uvs, pat) {
      if (gpCutNow && !uvs && n && n[2] > 0.99 && pts.length >= 3 && pts.every(function (p) { return (p[2] || 0) <= 0.5 && (p[2] || 0) >= -8; })) {
        var self = this, args = arguments;
        gpCutPoly(pts).forEach(function (piece) { gl3PolyGp.call(self, v, piece, n, c, a, null, pat); });
        return;
      }
      return gl3PolyGp.apply(this, arguments);
    };
  }
  if (typeof gl3Scenery === "function") {
    var gl3SceneryGp = gl3Scenery;
    gl3Scenery = function () {
      var pools = [];
      try { if (!(typeof TERR_ON !== "undefined" && TERR_ON)) { pools = gpPools().map(gpFrame).filter(Boolean); } } catch (e) { pools = []; }
      gpCutNow = pools.length ? pools : null;
      try { return gl3SceneryGp.apply(this, arguments); } finally { gpCutNow = null; }
    };
  }
  // (the scenery kept as it was made: made again once a pool is moved)
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyGp = houseSceneKey;
    houseSceneKey = function () {
      var k = "";
      try { gpPools().forEach(function (n) { k += "|p" + n.id + ":" + Math.round(n.x) + "," + Math.round(n.y) + "," + Math.round(n.w) + "," + Math.round(n.h) + "," + (n.turn || 0); }); } catch (e) { k = ""; }
      return houseSceneKeyGp.apply(this, arguments) + k;
    };
  }

  // ---- a pool's gate: opening out, closing and latching by itself ------------------------------------------
  // (the codes for a pool's barrier, ISPSC 305: its gates open outward, away
  // from the water, and are self-closing and self-latching -- a child let
  // through behind someone does not find it standing open)
  function gpNearPool(n, far) {
    var best = null, bd = far * FLOOR_PX;
    gpPools().forEach(function (p) { var d = Math.hypot(p.x - n.x, p.y - n.y) - Math.max(p.w, p.h) / 2; if (d < bd) { bd = d; best = p; } });
    return best;
  }
  function gpGateSign(n) {
    var p = gpNearPool(n, 5);
    if (!p) { return 1; }
    var a = (n.turn || 0) * Math.PI / 180, ly = -(p.x - n.x) * Math.sin(a) + (p.y - n.y) * Math.cos(a);
    return ly > 0 ? -1 : 1;          // (+ swings toward its own +y: the pool there, the other way)
  }
  var GP_SHUT = {};                  // gate id -> when you were last near it, open
  (function gpTick() {
    try {
      if (V3 && V3.mode === "walk" && V3.me && V3.use && typeof o3IsOpen === "function") {
        var now = performance.now();
        hand.nodes.forEach(function (n) {
          if (n.kind !== "i_gate" || !o3IsOpen(n.id, 0) || !gpNearPool(n, 5)) { delete GP_SHUT[n.id]; return; }
          var near = Math.hypot(V3.me.x - n.x, V3.me.y - n.y) < 1.4 * FLOOR_PX;
          if (near || GP_SHUT[n.id] === undefined) { GP_SHUT[n.id] = now; return; }
          if (now - GP_SHUT[n.id] > 1800) {
            delete GP_SHUT[n.id];
            o3Set(n.id, 0, false);
            if (typeof useTone === "function") { useTone([520, 1400], 0.08, true); }
            if (typeof v3Say === "function") { v3Say(TXT.gp_gate_shut); }
          }
        });
      }
    } catch (e) { /* left as it is */ }
    setTimeout(gpTick, 250);
  })();

  // ---- a hot tub: its shell hollow, seats round it, water you see into, bubbling when on, steaming -------------
  var GP_TUB_RIM = 0.14, GP_TUB_WATER = 0.13;      // m: the shell's rim; the water under its top
  if (typeof mDef === "function") {
    mDef("i_hottub", function (M, W, D, H, C) {
      C = mPick(C, "#7a5c45", "#4fa3c7");
      var t = GP_TUB_RIM * 100 * cm, wood = M.mat("wood", C.main), shell = M.mat("ceramic", "#e9eef0"), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
      // the cabinet round it, in boards; the shell's rim over it
      M.box(x0, x1, y0, y0 + t, 0, H - 5 * cm, wood, 1 * cm);
      M.box(x0, x1, y1 - t, y1, 0, H - 5 * cm, wood, 1 * cm);
      M.box(x0, x0 + t, y0 + t, y1 - t, 0, H - 5 * cm, wood, 1 * cm);
      M.box(x1 - t, x1, y0 + t, y1 - t, 0, H - 5 * cm, wood, 1 * cm);
      M.box(x0 - 1 * cm, x1 + 1 * cm, y0 - 1 * cm, y0 + t, H - 5 * cm, H, shell, 2 * cm);
      M.box(x0 - 1 * cm, x1 + 1 * cm, y1 - t, y1 + 1 * cm, H - 5 * cm, H, shell, 2 * cm);
      M.box(x0 - 1 * cm, x0 + t, y0 + t, y1 - t, H - 5 * cm, H, shell, 2 * cm);
      M.box(x1 - t, x1 + 1 * cm, y0 + t, y1 - t, H - 5 * cm, H, shell, 2 * cm);
      // inside: its floor, and a seat along each side, the corners deeper for lying back
      var ix0 = x0 + t, ix1 = x1 - t, iy0 = y0 + t, iy1 = y1 - t, seat = 40 * cm, sz = H - 48 * cm;
      M.box(ix0, ix1, iy0, iy1, 0, 14 * cm, shell);
      M.box(ix0, ix1, iy0, iy0 + seat, 14 * cm, sz, shell, 3 * cm);
      M.box(ix0, ix1, iy1 - seat, iy1, 14 * cm, sz, shell, 3 * cm);
      M.box(ix0, ix0 + seat, iy0 + seat, iy1 - seat, 14 * cm, sz - 8 * cm, shell, 3 * cm);
      M.box(ix1 - seat, ix1, iy0 + seat, iy1 - seat, 14 * cm, sz - 8 * cm, shell, 3 * cm);
      // the jets: dark rounds in the seat backs
      var jet = M.mat("chrome", "#9aa3aa");
      [[ix0 + W * 0.25, iy0 + 0.6 * cm], [ix1 - W * 0.25, iy0 + 0.6 * cm], [ix0 + W * 0.25, iy1 - 0.6 * cm], [ix1 - W * 0.25, iy1 - 0.6 * cm]].forEach(function (j) {
        M.box(j[0] - 3 * cm, j[0] + 3 * cm, j[1] - 0.6 * cm, j[1] + 0.6 * cm, sz + 12 * cm, sz + 18 * cm, jet, 1 * cm);
      });
    });
  }
  function gpTubs() { return hand.nodes.filter(function (n) { return n.kind === "i_hottub" && n.w > 1.0 * FLOOR_PX && n.h > 1.0 * FLOOR_PX; }); }
  var GP_TUBWATER = { piece: true, color: "#2aa3c8", edge: "#2aa3c8", pat: 80, alpha: 0.55, late: true, bare: true };
  var GP_FOAM = { piece: true, color: "#f2fbff", edge: "#f2fbff", bare: true, alpha: 0.55, late: true };
  var GP_STEAM = { piece: true, color: "#eef2f4", edge: "#eef2f4", bare: true, alpha: 0.12, late: true };
  function gpTubFaces(model) {
    var tubs = gpTubs();
    if (!tubs.length) { return; }
    var P = FLOOR_PX, t = performance.now() / 1000, U = V3 && V3.use;
    var passing = model.passing ? model.passing.faces : (model.passing = { faces: [], stand: [] }).faces;
    tubs.forEach(function (n) {
      var F = gpFrame(n);
      if (!F) { return; }
      var H = (typeof pieceHigh === "function" ? pieceHigh(n) : 0.9) * P, zw = F.z + H - GP_TUB_WATER * P, rim = GP_TUB_RIM * P;
      var hw = F.hw - rim, hh = F.hh - rim;
      function W(lx, ly, z) { var p = gpWorld(F, lx, ly); return [p[0], p[1], z]; }
      // its old water -- a lid of blue over a solid block -- gone with the old model; the water itself
      model.faces.push({ pts: [W(-hw, -hh, zw), W(hw, -hh, zw), W(hw, hh, zw), W(-hw, hh, zw)], n: [0, 0, 1], how: GP_TUBWATER, node: n, gpPool: true });
      var on = !!(U && U.on && U.on[n.id]);
      // bubbling over the jets, the water white with it, when it is on
      if (on) {
        for (var k = 0; k < 26; k++) {
          var ph = (t * (0.9 + (k % 5) * 0.13) + k * 0.37) % 1, jx = (k % 2 ? 1 : -1) * hw * 0.5, jy = (k % 4 < 2 ? 1 : -1) * (hh - 0.15 * P);
          var bx = jx + Math.sin(k * 3.1 + t) * 0.25 * P * ph, by = jy * (1 - ph * 0.7), r = (0.05 + 0.07 * (1 - ph)) * P;
          var c = W(bx, by, zw + 0.4), seg = 7, ring = [];
          for (var i = 0; i < seg; i++) { var a = i / seg * Math.PI * 2; ring.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]]); }
          passing.push({ pts: ring, n: [0, 0, 1], how: Object.assign({}, GP_FOAM, { alpha: 0.6 * (1 - ph) }) });
        }
      }
      // steam rising off it -- more on a cold day, and while it is on
      if (typeof wfPuff === "function") {
        var many = on ? 6 : 3;
        for (var s = 0; s < many; s++) {
          var age = (t * 0.18 + s / many) % 1, sx = (Math.sin(s * 2.3) * 0.5) * hw, sy = (Math.cos(s * 1.7) * 0.5) * hh;
          var sc = W(sx + age * 0.3 * P, sy, zw + (0.2 + age * 1.4) * P);
          wfPuff(passing, sc[0], sc[1], sc[2], (0.18 + age * 0.45) * P, Object.assign({}, GP_STEAM, { alpha: (on ? 0.14 : 0.09) * (1 - age) }));
        }
      }
    });
  }
  if (typeof v3Build === "function") {
    var v3BuildTub = v3Build;
    v3Build = function () {
      var model = v3BuildTub.apply(this, arguments);
      try { if (model && model.faces && V3 && V3.scene !== "space" && !V3.flat) { gpTubFaces(model); } } catch (e) { /* as it was */ }
      return model;
    };
  }
  // (the tub's flat picture -- its blue square -- not drawn under the water: the water is its own now)
  if (typeof v3Build === "function") {
    var v3BuildTub2 = v3Build;
    v3Build = function () {
      var model = v3BuildTub2.apply(this, arguments);
      try {
        if (model && model.faces && V3 && !V3.flat && gpTubs().length) {
          var ids = {};
          gpTubs().forEach(function (n) { ids[n.id] = true; });
          model.faces = model.faces.filter(function (f) { return !(f.node && ids[f.node.id] && !f.mesh && !f.gpPool && f.tex); });
        }
      } catch (e) { /* as it was */ }
      return model;
    };
  }

  // ---- a barn door: hung from a rail over the doorway, rolled aside along the wall -----------------------------------
  // (one of the styles a door is made in, 40-doors.js -- but swung on hinges
  // like any other; a barn door hangs on two rollers on a black rail over
  // the opening, on the room's side of the wall, and slides along it)
  function gpBarn(faces, n, open) {
    var P = FLOOR_PX, D = doorDesign(n), H = openHead(n), hw = n.w / 2, hh = n.h / 2, own = simLook(n), big = typeof v3Big === "function" && v3Big();
    // the frame and casing as any door has them -- no leaf in the opening
    var leafWas = doorLeaf;
    doorLeaf = function () {};
    try { doorBuild(faces, n, 0); } finally { doorLeaf = leafWas; }
    var deep = 6.5, t = 3, L = n.w + 6, face = hh - deep - 1.2 - t / 2, k = Math.max(0, Math.min(1, open / Math.max(1, D.op || 90)));
    var dir = D.hand === "r" ? 1 : -1, x0 = -hw - 3 + dir * k * (L - 4);
    var steel = { piece: true, color: "#232426", edge: "#111214", pat: 22 };
    // the rail, the length of the door and the opening, on brackets
    var r0 = Math.min(-hw - 3, -hw - 3 + dir * (L - 4)), r1 = Math.max(hw + 3, hw + 3 + dir * (L - 4));
    v3Box(faces, n, r0, r1, face - 1.0, face + 0.2, H + 0.12 * P, H + 0.12 * P + 1.4, steel);
    [r0 + 2, (r0 + r1) / 2, r1 - 2].forEach(function (bx) { v3Box(faces, n, bx - 0.6, bx + 0.6, face - 0.2, hh - deep - 0.2, H + 0.1 * P, H + 0.16 * P, steel); });
    // the leaf, flat to the wall, where it has rolled to; its two hangers and their wheels on the rail
    var hinge = v3Local(n, x0, face);
    doorLeaf(faces, { kind: n.kind, x: hinge[0], y: hinge[1], turn: n.turn || 0 }, L, H + 0.06 * P, t, Object.assign({}, D, { st: "barn", hd: "pull" }), own, big, -1);
    [x0 + L * 0.15, x0 + L * 0.85].forEach(function (hx) {
      v3Box(faces, n, hx - 0.9, hx + 0.9, face - t / 2 - 0.6, face - t / 2, H - 0.25 * P, H + 0.12 * P + 0.7, steel);
      v3Box(faces, n, hx - 1.8, hx + 1.8, face - t / 2 - 1.4, face - t / 2 - 0.6, H + 0.12 * P + 1.0, H + 0.12 * P + 4.4, steel);
    });
  }
  if (typeof v3Door === "function") {
    var v3DoorBarn = v3Door;
    v3Door = function (faces, n, open) {
      if (n && n.kind === "i_door" && typeof doorDesign === "function" && doorDesign(n).st === "barn" && typeof doorBuild === "function") {
        try { return gpBarn(faces, n, open); } catch (e) { /* as it was */ }
      }
      return v3DoorBarn.apply(this, arguments);
    };
  }

  // (E at a hot tub: its jets on, the water bubbling -- and off again)
  if (typeof useIt === "function") {
    var useItTub = useIt;
    useIt = function (n) {
      if (n && n.kind === "i_hottub" && V3) {
        var U = useState();
        U.on[n.id] = !U.on[n.id];
        V3.dirty = true;
        if (typeof useTone === "function") { useTone(U.on[n.id] ? [140, 90] : [90], U.on[n.id] ? 0.6 : 0.2, true); }
        v3Say(TXT[U.on[n.id] ? "gp_jets_on" : "gp_jets_off"]);
        return true;
      }
      return useItTub.apply(this, arguments);
    };
  }
  // (the bubbles move: drawn again each picture while they are on)
  (function gpTubTick() {
    try { if (V3 && V3.use && V3.use.on && hand.nodes.some(function (n) { return n.kind === "i_hottub" && V3.use.on[n.id]; })) { V3.dirty = true; } } catch (e) { /* still */ }
    requestAnimationFrame(gpTubTick);
  })();
