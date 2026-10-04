// ---------------------------------------------------------------------------
//  40-build.js -- the building put up before your eyes, the way buildings
//  are: the site dug and the slab poured, the frame of it up (timber for a
//  house, steel for a shop or an office, steel round a concrete core for a
//  tower), then closed in -- its outside walls, its windows, its roof or
//  its skin -- and only then the inside: the walls between the rooms, the
//  floors and ceilings, and what goes in them; diggers, a mixer, cranes
//  and the crew at work all through.  And what is changed in 3D afterwards
//  is built again where it is, by builders who come to do it; what is taken
//  away knocked down -- by a wrecking ball, or blown apart.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "for in the 3d mode to have builders come in and
  // fix the issue you are changing ... and for it to have builders, cranes
  // and stuff building the building fast when you load it into 3d or when
  // you edit something in 3d" -- "the current watch it being built ... is
  // too simplistic ... update it so it works for all types of buildings and
  // to also make it so there is an animation for when you delete a thing in
  // 3d ... a wrecking ball or it just explodes ... fun and high quality" --
  // "normally the stuff on the outside is done first then the inside")
  //
  // When each part of the building goes up, as a share of the whole time:
  // [from, to] for each stage, by how it is built.
  var CN_STAGES = {
    wood:  { site: [0, 0.05], found: [0.04, 0.13], frame: [0.12, 0.38], truss: [0.34, 0.44], shell: [0.42, 0.6], roof: [0.5, 0.68], inside: [0.68, 0.86], furnish: [0.82, 0.96] },
    steel: { site: [0, 0.05], found: [0.04, 0.12], frame: [0.11, 0.42], truss: [0.4, 0.44], shell: [0.3, 0.66], roof: [0.6, 0.7], inside: [0.66, 0.86], furnish: [0.82, 0.96] },
    tall:  { site: [0, 0.04], found: [0.03, 0.1], frame: [0.09, 0.56], truss: [0.55, 0.56], shell: [0.18, 0.7], roof: [0.66, 0.72], inside: [0.6, 0.88], furnish: [0.8, 0.97] }
  };
  // how long it takes (ms): opened in 3D, fast; watched, slower
  var CN_MS = { fast: { wood: 5200, steel: 6000, tall: 8000 }, watch: { wood: 11000, steel: 13000, tall: 17000 } };
  var CN_DIRT = { piece: true, color: "#7d6849", edge: "#5d4c34", bare: true, pat: 30 };
  var CN_CONCRETE = { piece: true, color: "#b9b6ae", edge: "#8d8a83", pat: 10 };
  var CN_FORM = { piece: true, color: "#a9824f", edge: "#76592f", bare: true, pat: 21 };
  var CN_STUD = { piece: true, color: "#d9b77e", edge: "#a88857", pat: 21 };
  var CN_STEEL = { piece: true, color: "#56606b", edge: "#353b42", pat: 22 };
  var CN_RED = { piece: true, color: "#b4452f", edge: "#7a2e1f", pat: 22 };
  var CN_CORE = { piece: true, color: "#a7a49c", edge: "#7f7c75", pat: 10 };
  var CN_YELLOW = { piece: true, color: "#f2b81e", edge: "#a77d12", pat: 27 };
  var CN_DARK = { piece: true, color: "#2f3338", edge: "#1c1f22", pat: 32 };
  var CN_WHITE = { piece: true, color: "#e9ecee", edge: "#a5abb0", pat: 27 };
  var CN_GLASS = { glass: true, bare: true };
  var CN_DUST = { piece: true, color: "#a89a82", edge: "#a89a82", bare: true, alpha: 0.35, late: true };

  // ---- a beam between two points: rafters, braces, a crane's boom ---------------------------------
  function cnBeam(faces, a, b, w, how, h) {
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]);
    if (l < 0.01) { return; }
    d = [d[0] / l, d[1] / l, d[2] / l];
    var up = Math.abs(d[2]) > 0.95 ? [1, 0, 0] : [0, 0, 1];
    var u = [d[1] * up[2] - d[2] * up[1], d[2] * up[0] - d[0] * up[2], d[0] * up[1] - d[1] * up[0]], ul = Math.hypot(u[0], u[1], u[2]);
    u = [u[0] / ul, u[1] / ul, u[2] / ul];
    var v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
    var hw = w / 2, hh = (h || w) / 2, corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    function at(p, c) { return [p[0] + u[0] * c[0] * hw + v[0] * c[1] * hh, p[1] + u[1] * c[0] * hw + v[1] * c[1] * hh, p[2] + u[2] * c[0] * hw + v[2] * c[1] * hh]; }
    for (var i = 0; i < 4; i++) {
      var c0 = corners[i], c1 = corners[(i + 1) % 4], mid = [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2];
      var n = [u[0] * mid[0] + v[0] * mid[1], u[1] * mid[0] + v[1] * mid[1], u[2] * mid[0] + v[2] * mid[1]];
      faces.push({ pts: [at(a, c0), at(a, c1), at(b, c1), at(b, c0)], n: n, how: how });
    }
    faces.push({ pts: corners.map(function (c) { return at(b, c); }), n: d, how: how });
    faces.push({ pts: corners.slice().reverse().map(function (c) { return at(a, c); }), n: [-d[0], -d[1], -d[2]], how: how });
  }
  function cnBox(faces, x, y, hw, hd, z0, z1, how, ang) {
    var c = Math.cos(ang || 0), s = Math.sin(ang || 0);
    v3Prism(faces, [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(function (q) { return [x + q[0] * c - q[1] * s, y + q[0] * s + q[1] * c]; }), z0, z1, how);
  }
  function cnFade(how, a) { return a >= 0.999 ? how : Object.assign({}, how, { alpha: Math.max(0.02, a), late: true }); }
  function cnEase(k) { k = Math.max(0, Math.min(1, k)); return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function cnOut(k) { k = Math.max(0, Math.min(1, k)); return 1 - Math.pow(1 - k, 3); }
  function cnBounce(k) {
    k = Math.max(0, Math.min(1, k));
    if (k < 1 / 2.75) { return 7.5625 * k * k; }
    if (k < 2 / 2.75) { k -= 1.5 / 2.75; return 7.5625 * k * k + 0.75; }
    if (k < 2.5 / 2.75) { k -= 2.25 / 2.75; return 7.5625 * k * k + 0.9375; }
    k -= 2.625 / 2.75; return 7.5625 * k * k + 0.984375;
  }

  // ---- the plan: what each face of the building is, and when it goes up -----------------------------
  var cnKept = { sig: "", ctx: null, by: new WeakMap() };
  function cnSig() {
    var n = hand.nodes, last = n.length ? n[n.length - 1] : null;
    return n.length + ":" + (last ? last.id : "") + ":" + (V3 ? V3.mode + ":" + (V3.upTo === undefined ? "" : V3.upTo) : "");
  }
  function cnContext(model) {
    var sig = cnSig();
    if (cnKept.sig === sig && cnKept.ctx) { return cnKept.ctx; }
    var P = FLOOR_PX, floors = typeof floorsOf === "function" ? floorsOf() : [];
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    var B = typeof smBuilding === "function" ? smBuilding() : null, frame = B ? B.frame : "wood";
    if (frame !== "wood" && frame !== "steel" && frame !== "tall") { frame = "steel"; }
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, top = 0, roofTop = -Infinity, roofLow = Infinity;
    model.faces.forEach(function (f) {
      if (!f.pts || f.mesh) { return; }
      var roofy = f.how && (f.how.roof || f.roof);
      if (roofy) { f.pts.forEach(function (p) { roofTop = Math.max(roofTop, p[2] || 0); roofLow = Math.min(roofLow, p[2] || 0); }); return; }
      if (!f.node || f.node.kind !== "i_room") { return; }
      f.pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); top = Math.max(top, p[2] || 0); });
    });
    // (a tower's skin stands out past its rooms: the site round that)
    if (frame === "tall" && typeof towerFaces === "function") {
      model.faces.forEach(function (f) {
        if (!f.pts || !f.how || !f.how.tower) { return; }
        f.pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); top = Math.max(top, p[2] || 0); });
      });
    }
    if (x0 === Infinity) { cnKept = { sig: sig, ctx: null, by: new WeakMap() }; return null; }
    // the storeys, by the height each floor stands at
    var zs = [];
    (floors.length ? floors : [{ z: 0, level: 0 }]).forEach(function (f) { if (zs.indexOf(f.z) < 0) { zs.push(f.z); } });
    zs.sort(function (a, b) { return a - b; });
    if (!zs.length) { zs = [0]; }
    var byLevel = zs.map(function () { return []; });
    rooms.forEach(function (r) {
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, z = f ? f.z : 0, i = Math.max(0, zs.indexOf(z));
      byLevel[i].push({ r: r, dx: f ? f.dx : 0, dy: f ? f.dy : 0, z: z, ceil: ceilOf(r) * P });
    });
    var ctx = { P: P, frame: frame, B: B, x0: x0, x1: x1, y0: y0, y1: y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, top: top, zs: zs, L: zs.length,
                rooms: rooms, byLevel: byLevel, floors: floors, roofTop: roofTop, roofLow: roofLow, S: CN_STAGES[frame], ours: new Map(), pieces: null };
    cnKept = { sig: sig, ctx: ctx, by: new WeakMap() };
    return ctx;
  }
  // whether a shape is part of the building (not the yard, the street, the trees)
  function cnOurs(ctx, n) {
    if (!n) { return true; }
    if (ctx.ours.has(n)) { return ctx.ours.get(n); }
    if (n.kind === "i_lot" || n.kind === "i_zone" || n.kind === "i_floor") { ctx.ours.set(n, false); return false; }
    var yes = n.kind === "i_room" || !!WALK_DOORS[n.kind] || n.kind === "i_window" ||
              ctx.rooms.some(function (r) { return insideArea(r, n.x, n.y); });
    ctx.ours.set(n, yes);
    return yes;
  }
  function cnLevel(ctx, z) {
    var i = 0;
    for (var k = 0; k < ctx.zs.length; k++) { if (z >= ctx.zs[k] - 2) { i = k; } }
    return i;
  }
  // a stage's slot for one storey: [from, length]
  function cnSlot(ctx, stage, i) {
    var s = ctx.S[stage], L = Math.max(1, ctx.L), d = (s[1] - s[0]) / L;
    if (ctx.frame === "tall" && stage === "shell") {
      // (the skin follows the frame up, a few storeys behind it)
      var fr = ctx.S.frame, fd = (fr[1] - fr[0]) / L;
      return [Math.min(s[1] - fd, fr[0] + fd * (i + 3)), Math.max(fd, d)];
    }
    if (ctx.frame === "tall" && stage === "inside") {
      var sh = cnSlot(ctx, "shell", i);
      return [Math.min(s[1] - d, Math.max(s[0], sh[0] + sh[1] * 2)), Math.max(d, 0.04)];
    }
    return [s[0] + d * i, d];
  }
  // round the building: 0 to 1, the way the crews go
  function cnRound(ctx, x, y) { return (Math.atan2(y - ctx.cy, x - ctx.cx) + Math.PI) / (2 * Math.PI); }
  // a wall's face with no room behind it: the outside
  function cnOutside(ctx, f, c, lvl) {
    var n = f.n || [0, 0, 1], x = c[0] + n[0] * 9, y = c[1] + n[1] * 9;
    var list = ctx.byLevel[lvl] || [];
    for (var i = 0; i < list.length; i++) { var o = list[i]; if (insideArea(o.r, x - o.dx, y - o.dy)) { return false; } }
    return true;
  }
  // When one face goes up, and how: { kind, t0, t1, lo, hi }
  function cnEntry(ctx, f) {
    var key = f.src || f, got = cnKept.by.get(key);
    if (got) { return got; }
    var e = null;
    if (f.pts && cnOurs(ctx, f.node) && !f.person) {
      var h = f.how || {}, P = ctx.P, lo = Infinity, hi = -Infinity, cx = 0, cy = 0, n = f.pts.length;
      for (var i = 0; i < n; i++) { var p = f.pts[i], z = p[2] || 0; if (z < lo) { lo = z; } if (z > hi) { hi = z; } cx += p[0] / n; cy += p[1] / n; }
      var lvl = cnLevel(ctx, lo + 0.5 * P), round = cnRound(ctx, cx, cy), kind, slot;
      var node = f.node, roomy = node && node.kind === "i_room";
      if (h.roof || f.roof) { kind = "roof"; slot = [ctx.S.roof[0], ctx.S.roof[1] - ctx.S.roof[0]]; round = Math.max(0, Math.min(1, (lo - ctx.roofLow) / Math.max(1, ctx.roofTop - ctx.roofLow))) * 0.5 + round * 0.5; }
      else if (h.tower) {
        if (f.n && Math.abs(f.n[2]) > 0.9) { kind = "deck"; slot = cnSlot(ctx, "frame", lvl); }
        else { kind = "skin"; slot = lvl >= ctx.L - 1 && lo > ctx.top - 1 * P ? [ctx.S.roof[0], ctx.S.roof[1] - ctx.S.roof[0]] : cnSlot(ctx, "shell", lvl); }
      }
      else if (h.glass && !roomy) { kind = "glass"; slot = cnSlot(ctx, "shell", lvl); round = 0.6 + round * 0.4; }
      else if (roomy && h.wall) {
        var mid = [cx, cy, (lo + hi) / 2];
        if (cnOutside(ctx, f, mid, lvl)) { kind = "wall"; slot = cnSlot(ctx, "shell", lvl); round = round * 0.7; }
        else { kind = "wall"; slot = cnSlot(ctx, "inside", lvl); round = round * 0.6; }
      }
      else if (roomy && h.floor) { kind = lvl > 0 || ctx.frame === "tall" ? "deck" : "fade"; slot = lvl > 0 ? cnSlot(ctx, "frame", lvl) : cnSlot(ctx, "inside", lvl); round = lvl > 0 ? 0.9 : round * 0.3; }
      else if (roomy && h.ceiling) { kind = "fade"; slot = cnSlot(ctx, "inside", lvl); round = 0.3 + round * 0.3; }
      else if (roomy) { kind = "fade"; slot = cnSlot(ctx, "inside", lvl); round = 0.5 + round * 0.4; }
      else if (node && (WALK_DOORS[node.kind] || node.kind === "i_window")) {
        kind = node.kind === "i_window" ? "fade" : "door";
        slot = node.kind === "i_window" ? cnSlot(ctx, "shell", lvl) : cnSlot(ctx, "inside", lvl); round = 0.7 + round * 0.3;
      }
      else if (node) { kind = "drop"; slot = cnSlot(ctx, "furnish", lvl); round = cnRound(ctx, node.x, node.y) * 0.8 + ((node.id * 7) % 10) / 50; }
      else { kind = "fade"; slot = cnSlot(ctx, "shell", lvl); round = 0.8 + round * 0.2; }
      var span = kind === "drop" ? Math.min(0.06, slot[1] * 0.5 + 0.02) : kind === "roof" ? slot[1] * 0.3 : Math.max(slot[1] * 0.35, 0.02);
      var t0 = slot[0] + Math.max(0, slot[1] - span) * Math.max(0, Math.min(1, round));
      e = { kind: kind, t0: t0, t1: t0 + span, lo: lo, hi: hi, lvl: lvl };
    }
    cnKept.by.set(key, e || false);
    return e || false;
  }

  // ---- the frame: what the walls and the roof are built on, standing till they cover it --------------
  function cnPieces(ctx) {
    if (ctx.pieces) { return ctx.pieces; }
    var P = ctx.P, out = [], seen = {};
    function add(kind, lvl, round, z0, z1, draw) { out.push({ kind: kind, lvl: lvl, round: round, z0: z0, z1: z1, draw: draw }); }
    ctx.byLevel.forEach(function (list, lvl) {
      list.forEach(function (o) {
        var r = o.r, T = Math.max(1, Math.min(6, Math.min(r.w, r.h) * 0.06)), hw = r.w / 2, hh = r.h / 2, top = o.z + o.ceil;
        var edges = [[-hw, -hh + T / 2, hw, -hh + T / 2], [hw - T / 2, -hh, hw - T / 2, hh], [hw, hh - T / 2, -hw, hh - T / 2], [-hw + T / 2, hh, -hw + T / 2, -hh]];
        edges.forEach(function (e) {
          var a = v3Local(r, e[0], e[1]), b = v3Local(r, e[2], e[3]);
          a = [a[0] + o.dx, a[1] + o.dy]; b = [b[0] + o.dx, b[1] + o.dy];
          // (the same line of wall from both rooms: framed once)
          var k = [Math.round((a[0] + b[0]) / 2 / (0.5 * P)), Math.round((a[1] + b[1]) / 2 / (0.5 * P)), lvl].join(":");
          if (seen[k]) { return; }
          seen[k] = true;
          var len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len, ang = Math.atan2(uy, ux);
          var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, round = cnRound(ctx, mx, my);
          if (ctx.frame === "wood") {
            // studs every 60 cm, a plate along the foot and the head
            var nst = Math.max(2, Math.round(len / (0.6 * P)) + 1);
            add("frame", lvl, round, o.z, top, function (faces, k) {
              var z1 = o.z + (top - o.z) * k;
              for (var s = 0; s < nst; s++) {
                var t = s / (nst - 1), x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
                cnBox(faces, x, y, 0.022 * P, 0.045 * P, o.z + 0.04 * P, z1, CN_STUD, ang);
              }
              cnBox(faces, mx, my, len / 2, 0.045 * P, o.z, o.z + 0.04 * P, CN_STUD, ang);
              if (k > 0.98) { cnBox(faces, mx, my, len / 2, 0.045 * P, top - 0.08 * P, top, CN_STUD, ang); }
            });
          } else {
            // steel: a column at each end, a beam along the head, now and then braced
            add("frame", lvl, round, o.z, top, function (faces, k) {
              var z1 = o.z + (top - o.z) * Math.min(1, k * 1.4);
              [a, b].forEach(function (q) { cnBox(faces, q[0], q[1], 0.09 * P, 0.09 * P, o.z, z1, CN_STEEL, ang); });
              if (k > 0.7) {
                var bk = Math.min(1, (k - 0.7) / 0.3), e2 = [a[0] + (b[0] - a[0]) * bk, a[1] + (b[1] - a[1]) * bk];
                cnBeam(faces, [a[0], a[1], top - 0.15 * P], [e2[0], e2[1], top - 0.15 * P], 0.16 * P, CN_STEEL, 0.3 * P);
                if (len > 3 * P && (lvl + Math.round(mx + my)) % 3 === 0 && bk > 0.99) {
                  cnBeam(faces, [a[0], a[1], o.z + 0.2 * P], [b[0], b[1], top - 0.3 * P], 0.08 * P, CN_RED);
                  cnBeam(faces, [b[0], b[1], o.z + 0.2 * P], [a[0], a[1], top - 0.3 * P], 0.08 * P, CN_RED);
                }
              }
            });
          }
        });
      });
    });
    // a tower: its core of concrete going up ahead of the steel round it
    if (ctx.frame === "tall") {
      ctx.byLevel.forEach(function (list, lvl) {
        var core = list.filter(function (o) { return o.r.starter === "stairs" || o.r.starter === "lift" || /stair|lift|elev/i.test(o.r.text || ""); });
        if (!core.length) { return; }
        var bx = [Infinity, -Infinity, Infinity, -Infinity], z = core[0].z, top = z + Math.max.apply(null, core.map(function (o) { return o.ceil; })) + 0.3 * P;
        core.forEach(function (o) { var q = turned(o.r); bx[0] = Math.min(bx[0], o.r.x + o.dx - q.w / 2); bx[1] = Math.max(bx[1], o.r.x + o.dx + q.w / 2); bx[2] = Math.min(bx[2], o.r.y + o.dy - q.h / 2); bx[3] = Math.max(bx[3], o.r.y + o.dy + q.h / 2); });
        add("core", lvl, 0, z, top, function (faces, k) {
          var z1 = z + (top - z) * k, t = 0.25 * P;
          [[bx[0], bx[1], bx[2], bx[2] + t], [bx[0], bx[1], bx[3] - t, bx[3]], [bx[0], bx[0] + t, bx[2], bx[3]], [bx[1] - t, bx[1], bx[2], bx[3]]].forEach(function (w) {
            v3Prism(faces, [[w[0], w[2]], [w[1], w[2]], [w[1], w[3]], [w[0], w[3]]], z, z1, CN_CORE);
          });
        });
      });
    }
    // a tower's columns round its edge, just in from the skin, slab to slab;
    // its edge beam along their heads (40-towers.js: the outline at each floor)
    if (ctx.frame === "tall" && typeof towerBuildings === "function" && typeof towerSkin === "function") {
      towerBuildings().forEach(function (b) {
        var sk = towerSkin(b, ctx.rooms);
        if (!sk) { return; }
        sk.plates.forEach(function (p, i) {
          var t0 = sk.plates.length > 1 ? i / (sk.plates.length - 1) : 0, lo = towerOutline(b.form, sk.c, sk.S, t0, 40), per = 0;
          lo.forEach(function (q, j) { var r = lo[(j + 1) % lo.length]; per += Math.hypot(r[0] - q[0], r[1] - q[1]); });
          var count = Math.max(8, Math.round(per / (7.5 * P))), cols = [];
          for (var k = 0; k < count; k++) {
            var q = lo[Math.round(k * lo.length / count) % lo.length], dx = q[0] - sk.c[0], dy = q[1] - sk.c[1], l = Math.hypot(dx, dy) || 1;
            cols.push([q[0] - dx / l * 0.5 * P, q[1] - dy / l * 0.5 * P]);
          }
          var z0 = p.z0 - 0.06 * P, z1 = p.z1 - 0.3 * P, lvl = cnLevel(ctx, p.z0 + 0.5 * P);
          add("frame", lvl, 0.1, z0, z1, function (faces, k) {
            var zt = z0 + (z1 - z0) * Math.min(1, k * 1.3);
            cols.forEach(function (c) { cnBox(faces, c[0], c[1], 0.2 * P, 0.2 * P, z0, zt, CN_STEEL); });
            if (k > 0.8) {
              cols.forEach(function (c, j) { var d = cols[(j + 1) % cols.length]; cnBeam(faces, [c[0], c[1], z1 - 0.2 * P], [d[0], d[1], z1 - 0.2 * P], 0.18 * P, CN_STEEL, 0.4 * P); });
            }
          });
        });
      });
    }
    // a pitched roof: its trusses, every 60 cm along the house
    if (ctx.frame !== "tall" && ctx.roofTop > ctx.roofLow + 0.5 * P) {
      var alongX = ctx.x1 - ctx.x0 >= ctx.y1 - ctx.y0, len = alongX ? ctx.x1 - ctx.x0 : ctx.y1 - ctx.y0, span = alongX ? ctx.y1 - ctx.y0 : ctx.x1 - ctx.x0;
      var nt = Math.max(3, Math.round(len / (0.6 * P))), zl = ctx.roofLow, zr = ctx.roofTop;
      for (var q = 0; q < nt; q++) {
        (function (q) {
          var s = q / (nt - 1), at = (alongX ? ctx.x0 : ctx.y0) + len * s;
          add("truss", ctx.L - 1, s, zl, zr, function (faces, k) {
            var lift = (1 - cnOut(k)) * 2.5 * P;
            function p(u, z) { return alongX ? [at, ctx.y0 + span * u, z + lift] : [ctx.x0 + span * u, at, z + lift]; }
            cnBeam(faces, p(0, zl), p(1, zl), 0.07 * P, CN_STUD);
            cnBeam(faces, p(0, zl), p(0.5, zr), 0.07 * P, CN_STUD);
            cnBeam(faces, p(1, zl), p(0.5, zr), 0.07 * P, CN_STUD);
            cnBeam(faces, p(0.5, zl), p(0.5, zr), 0.05 * P, CN_STUD);
          });
        })(q);
      }
    }
    ctx.pieces = out;
    return out;
  }

  // ---- each picture while it goes up ------------------------------------------------------------------
  function cnBuilding(model, t) {
    var ctx = cnContext(model);
    if (!ctx) { return model; }
    var P = ctx.P, S = ctx.S, faces = [], shellTop = -Infinity;
    for (var i = 0; i < model.faces.length; i++) {
      var f = model.faces[i], e = cnEntry(ctx, f);
      if (!e) { faces.push(f); continue; }
      if (t < e.t0) { continue; }
      if (t >= e.t1) { faces.push(f); if (e.kind === "wall" || e.kind === "skin") { shellTop = Math.max(shellTop, e.hi); } continue; }
      var k = (t - e.t0) / (e.t1 - e.t0), g = cnAnimate(f, e, k, P);
      if (g) { faces.push(g); }
      if (e.kind === "wall" || e.kind === "skin") { shellTop = Math.max(shellTop, e.lo + (e.hi - e.lo) * k); }
    }
    var out = Object.assign({}, model, { faces: faces });
    var site = out.passing = { faces: model.passing ? model.passing.faces.slice() : [], stand: model.passing ? model.passing.stand.slice() : [] };
    try { cnSite(site.faces, ctx, t, shellTop); } catch (err) { /* the building alone */ }
    // (the names of rooms not yet built, not floating over the site)
    if (out.labels && t < S.inside[0]) { out.labels = out.labels.filter(function (l) { return !l.room; }); }
    return out;
  }
  function cnMovePts(f, dx, dy, dz) {
    return Object.assign({}, f, { pts: f.pts.map(function (p) { return [p[0] + dx, p[1] + dy, (p[2] || 0) + dz]; }) });
  }
  function cnAnimate(f, e, k, P) {
    var how = f.how || {};
    switch (e.kind) {
      case "wall": {
        // raised from its foot
        var cut = e.lo + (e.hi - e.lo) * cnEase(k);
        if (f.mesh) { return k > 0.5 ? f : null; }
        return Object.assign({}, f, { pts: f.pts.map(function (p) { return [p[0], p[1], Math.min(p[2] || 0, cut)]; }) });
      }
      case "roof": {
        // lowered into place by the crane, a sheet at a time
        var g = cnMovePts(f, 0, 0, (1 - cnOut(k)) * 3 * P);
        if (!f.mesh) { g.how = cnFade(how, Math.min(1, k * 2.5)); }
        return g;
      }
      case "skin": {
        // a panel swung in from out past where it goes, set into place
        var n = f.n || [0, 0, 0], q = 1 - cnOut(k), m = cnMovePts(f, n[0] * q * 4 * P, n[1] * q * 4 * P, q * 1.5 * P);
        m.how = cnFade(how, Math.min(1, k * 2));
        return m;
      }
      case "deck": {
        var d = cnMovePts(f, 0, 0, (1 - cnOut(k)) * 0.8 * P);
        d.how = cnFade(how, Math.min(1, k * 2));
        return d;
      }
      case "drop": {
        // set down where it goes: dropped in, a little bounce
        var z = (1 - cnBounce(k)) * 1.4 * P;
        var dr = cnMovePts(f, 0, 0, z);
        if (!f.mesh && k < 0.3) { dr.how = cnFade(how, k / 0.3); }
        return dr;
      }
      case "door": {
        if (f.mesh) { return k > 0.4 ? f : null; }
        return Object.assign({}, f, { how: cnFade(how, k) });
      }
      default: {
        if (f.mesh) { return k > 0.5 ? f : null; }
        if (how.glass) { return k > 0.4 ? f : null; }
        return Object.assign({}, f, { how: cnFade(how, k) });
      }
    }
  }

  // ---- the site: the ground, the slab, the frame, the scaffold, the machines and the crew ---------------
  function cnSite(faces, ctx, t, shellTop) {
    var P = ctx.P, S = ctx.S, x0 = ctx.x0, x1 = ctx.x1, y0 = ctx.y0, y1 = ctx.y1, done = Math.max(0, Math.min(1, (t - 0.95) / 0.05));
    var tall = ctx.frame === "tall", m = 2 * P;
    // the ground dug over round it -- gone again, grass, as it is finished
    if (done < 1) {
      var g0 = ctx.zs[0] - 0.6;
      faces.push({ pts: [[x0 - m, y0 - m, g0], [x1 + m, y0 - m, g0], [x1 + m, y1 + m, g0], [x0 - m, y1 + m, g0]], n: [0, 0, 1], how: cnFade(CN_DIRT, 1 - done) });
    }
    // stakes and lines, marking it out
    if (t < S.found[1]) {
      var a = Math.min(1, t / 0.02 + 0.1);
      [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(function (c, i, all) {
        cnBox(faces, c[0], c[1], 0.03 * P, 0.03 * P, 0, 0.8 * P, cnFade(CN_FORM, a));
        var d = all[(i + 1) % 4];
        cnBeam(faces, [c[0], c[1], 0.7 * P], [d[0], d[1], 0.7 * P], 0.012 * P, cnFade({ piece: true, color: "#f25f3a", edge: "#f25f3a", bare: true }, a));
      });
    }
    // the slab: poured, the forms round it, and under the building till it is done
    var fk = Math.max(0, Math.min(1, (t - S.found[0]) / (S.found[1] - S.found[0])));
    if (fk > 0 && done < 1) {
      var zTop = ctx.zs[0] - 0.5, zBot = zTop - 0.35 * P, zNow = zBot + (zTop - zBot) * cnEase(fk);
      v3Prism(faces, [[x0 - 0.2 * P, y0 - 0.2 * P], [x1 + 0.2 * P, y0 - 0.2 * P], [x1 + 0.2 * P, y1 + 0.2 * P], [x0 - 0.2 * P, y1 + 0.2 * P]], zBot, Math.max(zBot + 0.5, zNow), cnFade(CN_CONCRETE, 1 - done));
      if (fk < 1) {
        [[x0 - 0.3 * P, y0 - 0.3 * P, x1 + 0.3 * P, y0 - 0.2 * P], [x0 - 0.3 * P, y1 + 0.2 * P, x1 + 0.3 * P, y1 + 0.3 * P],
         [x0 - 0.3 * P, y0 - 0.3 * P, x0 - 0.2 * P, y1 + 0.3 * P], [x1 + 0.2 * P, y0 - 0.3 * P, x1 + 0.3 * P, y1 + 0.3 * P]].forEach(function (b) {
          v3Prism(faces, [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]], zBot, zTop + 0.15 * P, CN_FORM);
        });
      }
    }
    // the frame, storey by storey; standing until what covers it is up
    cnPieces(ctx).forEach(function (pc) {
      var slot = pc.kind === "truss" ? [S.truss[0], S.truss[1] - S.truss[0]] : pc.kind === "core" ? cnSlot(ctx, "frame", Math.max(0, pc.lvl - 2)) : cnSlot(ctx, "frame", pc.lvl);
      var span = Math.max(slot[1] * 0.4, 0.015), s0 = slot[0] + (slot[1] - span) * pc.round;
      if (t < s0) { return; }
      // (a tower's steel, once its skin is round it, not seen again: not drawn)
      var ins = cnSlot(ctx, "inside", pc.lvl), sh = cnSlot(ctx, "shell", pc.lvl);
      var gone = pc.kind === "truss" ? S.roof[1] : ctx.frame === "tall" && pc.kind !== "core" ? sh[0] + sh[1] + 0.01 : ins[0] + ins[1];
      if (t > gone) { return; }
      pc.draw(faces, Math.min(1, (t - s0) / span));
    });
    // the scaffold round a low building, as high as the walls have got
    if (!tall && t > S.frame[0] && t < S.inside[0] + 0.04) {
      var sh = Math.max(ctx.zs[0] + 1 * P, Math.min(ctx.top, shellTop > -Infinity ? shellTop : ctx.zs[0] + ((t - S.frame[0]) / (S.shell[1] - S.frame[0])) * (ctx.top - ctx.zs[0])));
      var down = t > S.inside[0] ? 1 - (t - S.inside[0]) / 0.04 : 1;
      cnScaffold(faces, ctx, Math.max(ctx.zs[0] + 0.5 * P, sh * down));
    }
    // the machines: a digger, the mixer, a crane -- and the crew
    if (t < S.found[1] + 0.03) { cnDigger(faces, x0 - 6 * P, y1 + 4 * P, t, P); }
    if (t > S.found[0] - 0.02 && t < S.found[1] + 0.06) { cnMixer(faces, x1 + 5 * P, y1 + 3 * P, t, P); }
    if (tall || ctx.frame === "steel") {
      var frameTop = ctx.zs[0] + (ctx.top - ctx.zs[0]) * Math.max(0, Math.min(1, (t - S.frame[0]) / (S.frame[1] - S.frame[0])));
      if (t > S.frame[0] - 0.02 && t < S.inside[1]) { cnTowerCrane(faces, ctx, frameTop, t, P); }
    } else if (t > S.truss[0] - 0.04 && t < S.roof[1] + 0.02) {
      cnTruckCrane(faces, ctx, t, P);
    }
    if (t > S.site[0] + 0.01) { cnMaterials(faces, ctx, t, P); }
    cnCrew(faces, ctx, t, shellTop, P);
  }
  function cnScaffold(faces, ctx, h) {
    var P = ctx.P, off = 0.8 * P, ring = [[ctx.x0 - off, ctx.y0 - off], [ctx.x1 + off, ctx.y0 - off], [ctx.x1 + off, ctx.y1 + off], [ctx.x0 - off, ctx.y1 + off]];
    var steel = { piece: true, color: "#9aa0a6", edge: "#6b7177", bare: true, pat: 22 }, board = { piece: true, color: "#b8925e", edge: "#7d6240", bare: true, pat: 21 };
    for (var i = 0; i < 4; i++) {
      var a = ring[i], b = ring[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / (2 * P)));
      for (var k = 0; k < n; k++) {
        var x = a[0] + (b[0] - a[0]) * k / n, y = a[1] + (b[1] - a[1]) * k / n;
        cnBox(faces, x, y, 0.03 * P, 0.03 * P, 0, h + 1.0 * P, steel);
      }
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, along = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
      // boards at each lift of two metres, a rail over the top one, a brace across
      for (var z = 2 * P; z <= h + 0.1 * P; z += 2 * P) {
        cnBox(faces, mx, my, along ? len / 2 : 0.3 * P, along ? 0.3 * P : len / 2, z - 0.05 * P, z, board);
      }
      cnBox(faces, mx, my, along ? len / 2 : 0.02 * P, along ? 0.02 * P : len / 2, h + 0.95 * P, h + 1.0 * P, steel);
      cnBeam(faces, [a[0], a[1], 0.2 * P], [b[0], b[1], Math.min(h, 4 * P)], 0.03 * P, steel);
    }
  }
  // a digger: tracks, the body turning, its arm digging
  function cnDigger(faces, x, y, t, P) {
    var sw = Math.sin(t * 40) * 0.6, dig = 0.5 + 0.5 * Math.sin(t * 55);
    cnBox(faces, x, y, 1.6 * P, 1.2 * P, 0, 0.7 * P, CN_DARK);
    cnBox(faces, x, y, 1.4 * P, 1.1 * P, 0.7 * P, 1.6 * P, CN_YELLOW, sw);
    cnBox(faces, x + Math.cos(sw) * 0.5 * P, y + Math.sin(sw) * 0.5 * P, 0.6 * P, 0.55 * P, 1.6 * P, 2.6 * P, CN_YELLOW, sw);
    var ux = Math.cos(sw), uy = Math.sin(sw), base = [x + ux * 1.2 * P, y + uy * 1.2 * P, 1.4 * P];
    var elbow = [base[0] + ux * 2.6 * P, base[1] + uy * 2.6 * P, 3.2 * P - dig * 0.8 * P];
    var tip = [elbow[0] + ux * 1.8 * P, elbow[1] + uy * 1.8 * P, 0.4 * P + (1 - dig) * 1.2 * P];
    cnBeam(faces, base, elbow, 0.35 * P, CN_YELLOW);
    cnBeam(faces, elbow, tip, 0.25 * P, CN_YELLOW);
    cnBox(faces, tip[0], tip[1], 0.45 * P, 0.4 * P, tip[2] - 0.4 * P, tip[2], CN_DARK, sw);
    // and the heap it has dug
    v3Prism(faces, [[x - 3 * P, y + 2 * P], [x - 1 * P, y + 2.4 * P], [x - 1.4 * P, y + 4 * P], [x - 3.4 * P, y + 3.6 * P]], 0, 0.9 * P, CN_DIRT);
  }
  // a mixer: its cab, its drum turning, the chute out to the slab
  function cnMixer(faces, x, y, t, P) {
    cnBox(faces, x, y, 4 * P, 1.2 * P, 0.5 * P, 1.0 * P, CN_DARK);
    cnBox(faces, x - 3.2 * P, y, 0.8 * P, 1.2 * P, 1.0 * P, 2.8 * P, CN_WHITE);
    [-3.2, -0.6, 2.6].forEach(function (u) { [-1, 1].forEach(function (s) { cnBox(faces, x + u * P, y + s * 1.1 * P, 0.45 * P, 0.15 * P, 0, 0.9 * P, CN_DARK); }); });
    var spin = t * 30, sides = 10;
    for (var i = 0; i < sides; i++) {
      var a0 = i / sides * Math.PI * 2 + spin, a1 = (i + 1) / sides * Math.PI * 2 + spin, r = 1.05 * P;
      var c = i % 2 ? CN_WHITE : { piece: true, color: "#e0662f", edge: "#9d4520", pat: 27 };
      var p = function (u, a, rr) { return [x + u * P, y + Math.cos(a) * rr, 2.2 * P + Math.sin(a) * rr]; };
      faces.push({ pts: [p(-1.6, a0, r * 0.7), p(-1.6, a1, r * 0.7), p(1.6, a1, r), p(1.6, a0, r)], n: [0, Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2)], how: c });
    }
    cnBeam(faces, [x + 2 * P, y, 1.6 * P], [x + 3.6 * P, y - 1.5 * P, 0.6 * P], 0.25 * P, CN_DARK);
  }
  // a tower crane, as high as the frame and more; its jib turning, its load going up
  function cnTowerCrane(faces, ctx, frameTop, t, P) {
    var x = ctx.x1 + 5 * P, y = ctx.y0 - 4 * P, h = Math.max(14 * P, frameTop + 10 * P), mast = 1.0 * P;
    for (var k = 0; k < 4; k++) {
      var sx = k % 2 ? 1 : -1, sy = k < 2 ? 1 : -1;
      cnBox(faces, x + sx * mast / 2, y + sy * mast / 2, 0.06 * P, 0.06 * P, 0, h, CN_YELLOW);
    }
    for (var z = 1.5 * P; z < h; z += 1.5 * P) {
      cnBeam(faces, [x - mast / 2, y - mast / 2, z], [x + mast / 2, y - mast / 2, z + 1.5 * P], 0.04 * P, CN_YELLOW);
      cnBeam(faces, [x + mast / 2, y + mast / 2, z], [x - mast / 2, y + mast / 2, z + 1.5 * P], 0.04 * P, CN_YELLOW);
    }
    var a = t * Math.PI * 3.2 + 2.2, ux = Math.cos(a), uy = Math.sin(a), jib = Math.max(22 * P, (ctx.x1 - ctx.x0) * 0.9), tail = 8 * P;
    var top = [x, y, h + 0.6 * P];
    cnBeam(faces, [x - ux * tail, y - uy * tail, h + 0.5 * P], [x + ux * jib, y + uy * jib, h + 0.5 * P], 0.9 * P, CN_YELLOW, 1.0 * P);
    cnBeam(faces, [top[0], top[1], h], [top[0], top[1], h + 4 * P], 0.4 * P, CN_YELLOW);
    cnBeam(faces, [top[0], top[1], h + 4 * P], [x + ux * jib * 0.7, y + uy * jib * 0.7, h + 1 * P], 0.05 * P, CN_DARK);
    cnBox(faces, x - ux * tail * 0.85, y - uy * tail * 0.85, 1.4 * P, 1.4 * P, h - 1.2 * P, h + 0.1 * P, CN_CORE);
    cnBox(faces, x + ux * 1.5 * P, y + uy * 1.5 * P, 0.9 * P, 0.9 * P, h - 1.6 * P, h, CN_WHITE, a);
    // the hook and what it carries: a bundle of steel, up and set down
    var trip = (t * 7) % 1, out = 0.35 + 0.5 * trip, lift = Math.sin(trip * Math.PI);
    var hx = x + ux * jib * out, hy = y + uy * jib * out, hz = Math.max(1 * P, frameTop * lift + 1 * P);
    cnBeam(faces, [hx, hy, h + 0.4 * P], [hx, hy, hz + 0.6 * P], 0.03 * P, CN_DARK);
    cnBox(faces, hx, hy, 1.4 * P, 0.3 * P, hz, hz + 0.3 * P, ctx.frame === "tall" ? CN_STEEL : CN_FORM, a);
  }
  // a truck crane by a house, its boom up over the roof, the trusses lifted on
  function cnTruckCrane(faces, ctx, t, P) {
    var x = ctx.x0 - 5 * P, y = ctx.cy, h = ctx.roofTop > -Infinity ? ctx.roofTop : ctx.top;
    cnBox(faces, x, y, 1.3 * P, 4 * P, 0.5 * P, 1.4 * P, CN_YELLOW);
    cnBox(faces, x, y - 3.4 * P, 1.2 * P, 0.9 * P, 1.4 * P, 2.8 * P, CN_YELLOW);
    [-2.6, 0, 2.6].forEach(function (u) { [-1, 1].forEach(function (s) { cnBox(faces, x + s * 1.2 * P, y + u * P, 0.2 * P, 0.5 * P, 0, 1.0 * P, CN_DARK); }); });
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { cnBeam(faces, [x + q[0] * 1.2 * P, y + q[1] * 3.6 * P, 0.9 * P], [x + q[0] * 2.4 * P, y + q[1] * 3.6 * P, 0.05 * P], 0.15 * P, CN_DARK); });
    var sw = Math.sin(t * 60) * 0.5, tipX = ctx.cx + Math.cos(sw) * (ctx.x1 - ctx.x0) * 0.2, tipY = ctx.cy + Math.sin(sw) * (ctx.y1 - ctx.y0) * 0.3;
    var tip = [tipX, tipY, h + 5 * P];
    cnBeam(faces, [x, y + 1 * P, 1.8 * P], tip, 0.45 * P, CN_YELLOW);
    var lift = 0.5 + 0.5 * Math.sin(t * 90);
    cnBeam(faces, tip, [tipX, tipY, h + 1 * P + lift * 2 * P], 0.03 * P, CN_DARK);
    cnBox(faces, tipX, tipY, 2.4 * P, 0.25 * P, h + 0.6 * P + lift * 2 * P, h + 1 * P + lift * 2 * P, CN_STUD, sw);
  }
  // what is stacked round the site: boards, blocks, a skip
  function cnMaterials(faces, ctx, t, P) {
    var x = ctx.x1 + 3 * P, y = ctx.y1 + 6 * P, left = Math.max(0.2, 1 - Math.max(0, t - ctx.S.frame[0]) / (ctx.S.inside[1] - ctx.S.frame[0]));
    if (t > 0.97) { return; }
    for (var i = 0; i < 3; i++) {
      var hgt = (0.9 * left) * P;
      cnBox(faces, x + i * 2.4 * P, y, 1.0 * P, 0.6 * P, 0, 0.15 * P, CN_FORM);
      cnBox(faces, x + i * 2.4 * P, y, 0.9 * P, 0.5 * P, 0.15 * P, 0.15 * P + hgt, i === 1 ? CN_CONCRETE : CN_STUD);
    }
    cnBox(faces, ctx.x0 - 4 * P, ctx.y0 - 5 * P, 2.0 * P, 1.0 * P, 0, 1.2 * P, { piece: true, color: "#3f7a4a", edge: "#28502f", pat: 22 });
  }
  // the crew: walking between the stack and where the work is, some at it,
  // in hard hats and bright vests -- going home when it is done
  function cnCrew(faces, ctx, t, shellTop, P) {
    if (typeof peopleBody !== "function") { return; }
    var S = ctx.S, cx = ctx.cx, cy = ctx.cy, rx = (ctx.x1 - ctx.x0) / 2 + 2.2 * P, ry = (ctx.y1 - ctx.y0) / 2 + 2.2 * P;
    var crew = Math.max(5, Math.min(14, Math.round((rx + ry) / (4 * P)))), secs = t * (ctx.frame === "tall" ? 16 : 10);
    var leave = t > 0.95 ? (t - 0.95) / 0.05 : 0, fade = Math.min(1, t / 0.03 + 0.1) * (1 - leave);
    if (fade <= 0.02) { return; }
    var stack = [ctx.x1 + 3 * P, ctx.y1 + 6 * P], hat = { piece: true, color: "#f2c230", edge: "#a8861f", bare: true };
    for (var i = 0; i < crew; i++) {
      var x, y, head, z = ctx.zs[0], phase = secs * 7 + i;
      if (i % 3 === 0) {
        // fetching: from the stack to the building and back, a board carried one way
        var trip = (secs * (0.12 + (i % 4) * 0.02) + i * 0.37) % 2, k = trip < 1 ? trip : 2 - trip, a = i / crew * Math.PI * 2;
        var to = [cx + Math.cos(a) * rx * 0.95, cy + Math.sin(a) * ry * 0.95];
        x = stack[0] + (to[0] - stack[0]) * k; y = stack[1] + (to[1] - stack[1]) * k;
        head = Math.atan2(to[1] - stack[1], to[0] - stack[0]) + (trip < 1 ? 0 : Math.PI);
        if (trip < 1) {
          var fx = Math.cos(head), fy = Math.sin(head);
          cnBeam(faces, [x - fx * 1.1 * P, y - fy * 1.1 * P, z + 1.5 * P], [x + fx * 1.1 * P, y + fy * 1.1 * P, z + 1.5 * P], 0.1 * P, cnFade(CN_STUD, fade), 0.05 * P);
        }
      } else {
        // at work round the building, where the walls are getting to; hammering
        var way = i % 2 ? 1 : -1, b = i / crew * Math.PI * 2 + way * secs * 0.02;
        x = cx + Math.cos(b) * rx; y = cy + Math.sin(b) * ry; head = b + Math.PI;
        if (ctx.frame !== "tall" && i % 3 === 2 && shellTop > ctx.zs[0] + 2 * P && t < S.inside[0]) {
          z = Math.floor((shellTop - ctx.zs[0]) / (2 * P)) * 2 * P + ctx.zs[0];   // up on the scaffold's boards
        }
        phase = (Math.sin(secs * 9 + i) > 0 ? 0.25 : 0.75) + i;                  // (standing, swinging)
      }
      if (leave > 0) { var away = leave * 30 * P; x += Math.cos(i) * away; y += Math.sin(i) * away; }
      var f0 = faces.length;
      peopleBody(faces, { kind: "i_builder", id: 400 + i }, x, y, z, head, phase, { own: true, fill: i % 3 ? "#f08a24" : "#d9e84a", line: "#2e3846" }, fade);
      var ring = [];
      for (var q = 0; q < 10; q++) { var c = q / 10 * Math.PI * 2; ring.push([x + Math.cos(c) * 0.15 * P, y + Math.sin(c) * 0.15 * P]); }
      v3Prism(faces, ring, z + 1.66 * P, z + 1.79 * P, cnFade(hat, fade));
      for (var m = f0; m < faces.length; m++) { faces[m].person = true; }
    }
  }

  // ---- put up: opened in 3D (fast), or watched (40-blueprint.js's button) -----------------------------
  // (the old way, the walls cut at one height going up: given over to this)
  if (typeof bpBuilding === "function") {
    bpBuilding = function (model, t) { return cnBuilding(model, t); };
  }
  function cnFrameNow() {
    var B = typeof smBuilding === "function" ? smBuilding() : null;
    return B && (B.frame === "tall" || B.frame === "steel") ? B.frame : "wood";
  }
  if (typeof bpGo === "function") {
    var bpGoBuild = bpGo;
    bpGo = function (tall, wait, fast) {
      var out = bpGoBuild.apply(this, arguments);
      try {
        if (bpSite) {
          bpSite.ms = CN_MS[fast ? "fast" : "watch"][cnFrameNow()];
          if (V3 && !fast) { v3Say(TXT.cn_skip); }
        }
      } catch (e) { /* as it was */ }
      return out;
    };
  }
  // every time the building is opened in 3D: put up before your eyes, quickly
  // (a press on the view or any key skips it; not where motion is kept still)
  if (typeof v3Open === "function") {
    var v3OpenBuild = v3Open;
    v3Open = function () {
      var was = typeof V3 !== "undefined" ? V3 : null, out = v3OpenBuild.apply(this, arguments);
      try {
        if (V3 && V3 !== was && !bpSite && V3.scene !== "space" && !bpStill() && !V3.storm &&
            hand.nodes.some(function (n) { return n.kind === "i_room"; }) && cnOpenOn()) {
          if (V3.tw) { delete V3.tw.rise; }
          V3.rise = 1;
          bpGo(cnFrameNow() === "tall", 300, true);
          v3Say(TXT.cn_skip);
        }
      } catch (e) { /* opened as it is */ }
      return out;
    };
  }
  function cnOpenOn() { return !(hand.house && hand.house.buildIn === false); }
  // (every kind of building, the biggest too: a tower was left out)
  if (typeof bpWatch === "function") {
    var bpWatchBuild = bpWatch;
    bpWatch = function () {
      if (!V3 || V3.scene === "space") { return; }
      if (typeof v3Big === "function" && v3Big()) {
        if (V3.tw) { delete V3.tw.rise; }
        V3.rise = 1;
        bpGo(cnFrameNow() === "tall", 150);
        return;
      }
      return bpWatchBuild.apply(this, arguments);
    };
  }
  function cnShowWatch() {
    var b = V3 && V3.box ? el('[data-v3="watch"]', V3.box) : null;
    if (b && b.hidden) { b.hidden = false; if (typeof v3DressBar === "function") { v3DressBar(); } }
  }

  // ---- built again where it is changed; knocked down where it is taken away ---------------------------
  // Each picture, what has changed since the last: a piece added, moved,
  // turned, made bigger, its look changed -- built there again, builders
  // coming to it; a piece gone -- knocked down where it stood.
  var cnWatch = { by: null, last: null, jobs: [], wrecks: [] };
  function cnNodeSig(n) {
    return n.kind + "|" + Math.round(n.x) + "|" + Math.round(n.y) + "|" + Math.round(n.w || 0) + "|" + Math.round(n.h || 0) + "|" + (n.turn || 0) + "|" +
           (n.mat ? JSON.stringify(n.mat) : "") + "|" + (n.look ? JSON.stringify(n.look) : "") + "|" + (n.ceil || 0);
  }
  // (cheap, each picture: whether anything may have changed at all -- the
  // undo list growing, a piece moved; the whole comparison only once it
  // has settled, a quarter second after -- not while a piece is dragged)
  function cnQuick() {
    var n = hand.nodes, h = 0;
    for (var i = 0; i < n.length; i++) {
      var m = n[i];
      h = (h * 31 + m.id * 7 + Math.round(m.x) * 13 + Math.round(m.y) * 17 + Math.round(m.w || 0) + Math.round(m.h || 0) * 3 + (m.turn || 0)) | 0;
    }
    return n.length + ":" + h + ":" + (typeof wasLike !== "undefined" ? wasLike.length : 0);
  }
  function cnSigs() {
    var now = new Map();
    hand.nodes.forEach(function (n) { now.set(n.id, cnNodeSig(n)); });
    return now;
  }
  function cnDiff(model) {
    if (!V3 || V3.scene === "space" || bpSite || (typeof fxOn === "function" && fxOn())) { cnWatch.by = null; return; }
    var q = cnQuick(), t = performance.now();
    if (!cnWatch.by) { cnWatch.by = cnSigs(); cnWatch.q = q; cnWatch.last = model; cnWatch.pendQ = null; return; }
    if (q === cnWatch.q) { cnWatch.last = model; cnWatch.pendQ = null; return; }
    V3.dirty = true;
    if (q !== cnWatch.pendQ) { cnWatch.pendQ = q; cnWatch.pendAt = t; return; }
    if (t - cnWatch.pendAt < 250) { return; }
    var now = cnSigs(), was = cnWatch.by, changed = [], gone = [];
    now.forEach(function (s, id) { if (was.get(id) !== s) { changed.push(id); } });
    was.forEach(function (s, id) { if (!now.has(id)) { gone.push(id); } });
    // (a whole building made or undone at once: not each piece of it -- a
    // room taken away with all that is in it is one job)
    if (changed.length + gone.length > 0 && changed.length <= 12 && gone.length <= 80) {
      changed.forEach(function (id) {
        var n = nodeById(id);
        if (!n || n.kind === "i_lot" || n.kind === "i_floor" || n.kind === "i_zone") { return; }
        cnWatch.jobs = cnWatch.jobs.filter(function (j) { return j.id !== id; });
        cnWatch.jobs.push({ id: id, t0: t, ms: n.kind === "i_room" ? 2600 : 1500, room: n.kind === "i_room" });
      });
      if (cnWatch.last && gone.length) { cnWrecks(cnWatch.last, gone, t); }
    }
    cnWatch.by = now; cnWatch.q = q; cnWatch.pendQ = null; cnWatch.last = model;
  }
  // A builder's job: the piece put up again over a second or two
  function cnJobs(model) {
    var t = performance.now();
    cnWatch.jobs = cnWatch.jobs.filter(function (j) { return t - j.t0 < j.ms + 900; });
    cnWatch.wrecks = cnWatch.wrecks.filter(function (w) { return t - w.t0 < w.ms; });
    if (!cnWatch.jobs.length && !cnWatch.wrecks.length) { return model; }
    var P = FLOOR_PX, by = {}, faces = [];
    cnWatch.jobs.forEach(function (j) { by[j.id] = j; });
    for (var i = 0; i < model.faces.length; i++) {
      var f = model.faces[i], j = f.node ? by[f.node.id] : null;
      if (!j) { faces.push(f); continue; }
      var k = (t - j.t0 - 600) / j.ms;                     // (the builders get there first)
      if (k >= 1) { faces.push(f); continue; }
      if (k <= 0) { if (!j.room) { continue; } k = 0; }
      var lo = Infinity, hi = -Infinity;
      f.pts.forEach(function (p) { lo = Math.min(lo, p[2] || 0); hi = Math.max(hi, p[2] || 0); });
      var g = j.room ? (f.how && f.how.wall ? cnAnimate(f, { kind: "wall", lo: lo, hi: hi }, k, P) : cnAnimate(f, { kind: "fade" }, k, P))
                     : cnAnimate(f, { kind: "drop" }, k, P);
      if (g) { faces.push(g); }
    }
    var out = Object.assign({}, model, { faces: faces });
    var passing = out.passing = { faces: model.passing ? model.passing.faces.slice() : [], stand: model.passing ? model.passing.stand.slice() : [] };
    cnWatch.jobs.forEach(function (j) { cnJobCrew(passing.faces, j, t, P); });
    cnWatch.wrecks.forEach(function (w) { cnWreckDraw(passing.faces, w, t, P); });
    V3.dirty = true;
    return out;
  }
  // two builders to each job: walking in from outside, at it, going again
  function cnJobCrew(faces, j, t, P) {
    var n = nodeById(j.id);
    if (!n || typeof peopleBody !== "function") { return; }
    var floors = typeof floorsOf === "function" ? floorsOf() : [], f = floors.length ? floorAt(floors, n.x, n.y) : null;
    var x = n.x + (f ? f.dx : 0), y = n.y + (f ? f.dy : 0), z = f ? f.z : 0, e = t - j.t0, end = j.ms + 600;
    var hat = { piece: true, color: "#f2c230", edge: "#a8861f", bare: true };
    for (var i = 0; i < 2; i++) {
      var side = i ? 1 : -1, off = (j.room ? Math.max(n.w, n.h) / 2 + 0.6 * P : Math.max(n.w || 40, n.h || 40) / 2 + 0.6 * P);
      var at = [x + side * off * 0.7, y + off * 0.7], from = [at[0] + side * 9 * P, at[1] + 9 * P];
      var come = Math.min(1, e / 600), go = Math.max(0, (e - end) / 900), k = come * (1 - go);
      var px = from[0] + (at[0] - from[0]) * k, py = from[1] + (at[1] - from[1]) * k;
      var head = go > 0 ? Math.atan2(from[1] - at[1], from[0] - at[0]) : come < 1 ? Math.atan2(at[1] - from[1], at[0] - from[0]) : Math.atan2(y - at[1], x - at[0]);
      var fade = Math.min(1, e / 200) * (1 - go);
      if (fade < 0.02) { continue; }
      var phase = come < 1 || go > 0 ? e / 1000 * 7 + i : (Math.sin(e / 90 + i * 2) > 0 ? 0.25 : 0.75);
      var f0 = faces.length;
      peopleBody(faces, { kind: "i_builder", id: 500 + i + (j.id % 50) * 2 }, px, py, z, head, phase, { own: true, fill: i ? "#f08a24" : "#d9e84a", line: "#2e3846" }, fade);
      var ring = [];
      for (var q = 0; q < 10; q++) { var c = q / 10 * Math.PI * 2; ring.push([px + Math.cos(c) * 0.15 * P, py + Math.sin(c) * 0.15 * P]); }
      v3Prism(faces, ring, z + 1.66 * P, z + 1.79 * P, cnFade(hat, fade));
      for (var m = f0; m < faces.length; m++) { faces[m].person = true; }
    }
    // dust as it is finished
    var dk = (e - end + 200) / 700;
    if (dk > 0 && dk < 1) { cnPuff(faces, x, y, z, dk, j.room ? 2.2 * P : 0.9 * P, P); }
  }
  function cnPuff(faces, x, y, z, k, r, P) {
    var a = (1 - k) * 0.45, rr = r * (0.6 + k * 0.9);
    for (var i = 0; i < 10; i++) {
      var b0 = i / 10 * Math.PI * 2, b1 = (i + 1) / 10 * Math.PI * 2, h = (0.4 + k * 1.2) * P;
      faces.push({ pts: [[x + Math.cos(b0) * rr * 0.6, y + Math.sin(b0) * rr * 0.6, z + 0.05 * P], [x + Math.cos(b1) * rr * 0.6, y + Math.sin(b1) * rr * 0.6, z + 0.05 * P],
                         [x + Math.cos(b1) * rr, y + Math.sin(b1) * rr, z + h], [x + Math.cos(b0) * rr, y + Math.sin(b0) * rr, z + h]],
                   n: [Math.cos((b0 + b1) / 2), Math.sin((b0 + b1) / 2), 0.3], how: cnFade(CN_DUST, a / 0.35 * 0.35) });
    }
  }
  // ---- knocked down -----------------------------------------------------------------------------
  // What was there, from the last picture: in pieces, each its own way --
  // a room's walls by a wrecking ball swung from a crane into them, a piece
  // of furniture blown apart -- falling, bouncing, turning over, and gone.
  // what was taken away, from the last picture: each room with what was in
  // it knocked down together; the rest each on its own, blown apart
  function cnWrecks(model, ids, t) {
    var nodes = {}, set = {};
    ids.forEach(function (id) { set[id] = true; });
    model.faces.forEach(function (f) { if (f.node && set[f.node.id] && !nodes[f.node.id]) { nodes[f.node.id] = f.node; } });
    var rooms = ids.map(function (id) { return nodes[id]; }).filter(function (n) { return n && n.kind === "i_room"; }), used = {};
    rooms.forEach(function (r) {
      var group = ids.filter(function (id) { var n = nodes[id]; return n && !used[id] && (n === r || (n.kind !== "i_room" && insideArea(r, n.x, n.y))); });
      group.forEach(function (id) { used[id] = true; });
      cnWreck(model, group, t, true);
    });
    var rest = ids.filter(function (id) { return !used[id] && nodes[id]; }).slice(0, 8);
    rest.forEach(function (id, i) { cnWreck(model, [id], t + i * 90, false); });
  }
  function cnWreck(model, ids, t, room) {
    var P = FLOOR_PX, set = {};
    ids.forEach(function (id) { set[id] = true; });
    var own = model.faces.filter(function (f) { return f.node && set[f.node.id] && f.pts && !f.person; });
    if (!own.length || own.length > 6000) { return; }
    var b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
    function grow(p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.max(b[1], p[0]); b[2] = Math.min(b[2], p[1]); b[3] = Math.max(b[3], p[1]); b[4] = Math.min(b[4], p[2] || 0); b[5] = Math.max(b[5], p[2] || 0); }
    var meshBox = new Map();
    own.forEach(function (f) {
      if (f.mesh) {
        var mb = cnMeshBox(f);
        meshBox.set(f, mb);
        grow([mb[0], mb[2], mb[4]]); grow([mb[1], mb[3], mb[5]]);
      } else { f.pts.forEach(grow); }
    });
    var big = !!room || Math.max(b[1] - b[0], b[3] - b[2]) > 3 * P;
    var c = [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2], rnd = gl3Rand(ids[0] * 31 + 7), pieces = [];
    // (the ball comes in from a side: where it hits, and which way it goes on)
    var dir = rnd() < 0.5 ? [1, 0] : [0, 1], hit = big ? [c[0] - dir[0] * (b[1] - b[0]) / 2, c[1] - dir[1] * (b[3] - b[2]) / 2, b[4] + (b[5] - b[4]) * 0.55] : c;
    function speed(m, small) {
      var away = [m[0] - hit[0], m[1] - hit[1], m[2] - hit[2]], d = Math.hypot(away[0], away[1], away[2]) || 1;
      if (big) {
        var push = 9 / (1 + d / (3 * P));
        return { v: [dir[0] * push + away[0] / d * 2 + (rnd() - 0.5) * 2, dir[1] * push + away[1] / d * 2 + (rnd() - 0.5) * 2, 1.5 + rnd() * 3.5], delay: 700 + Math.min(600, d / P * 70) };
      }
      var s = (small ? 9 : 6) * (0.6 + rnd() * 0.8);
      return { v: [away[0] / d * s + (rnd() - 0.5) * 4, away[1] / d * s + (rnd() - 0.5) * 4, 4 + rnd() * 6], delay: 150 };
    }
    own.forEach(function (f) {
      if (f.mesh) {
        // a piece of furniture: blown into chunks of what it was made of
        var mb = meshBox.get(f), col = (f.how && f.how.color) || "#8a7a66", n = big ? 4 : 9;
        for (var k = 0; k < n; k++) {
          var m = [mb[0] + (mb[1] - mb[0]) * rnd(), mb[2] + (mb[3] - mb[2]) * rnd(), mb[4] + (mb[5] - mb[4]) * rnd()];
          var sz = Math.max(0.06 * P, Math.min(0.35 * P, Math.max(mb[1] - mb[0], mb[3] - mb[2], mb[5] - mb[4]) * (0.12 + rnd() * 0.18)));
          var sp = speed(m, true);
          pieces.push({ cube: sz, how: { piece: true, color: col, edge: col, pat: (f.how && GL3_MAT[f.how.mat]) || 0 }, c: m, v: sp.v,
                        w: [(rnd() - 0.5) * 12, (rnd() - 0.5) * 12, (rnd() - 0.5) * 12], delay: sp.delay, floor: b[4] });
        }
        return;
      }
      // a big face in pieces about a metre across
      cnChunks(f, big ? 1.2 * P : 0.5 * P).forEach(function (q) {
        var m = [0, 0, 0];
        q.pts.forEach(function (p) { m[0] += p[0] / q.pts.length; m[1] += p[1] / q.pts.length; m[2] += (p[2] || 0) / q.pts.length; });
        var sp = speed(m, false);
        pieces.push({ f: q, c: m, v: sp.v, w: [(rnd() - 0.5) * 8, (rnd() - 0.5) * 8, (rnd() - 0.5) * 8], delay: sp.delay, floor: b[4] });
      });
    });
    cnWatch.wrecks.push({ id: ids[0], t0: t, ms: big ? 4600 : 3000, big: big, box: b, c: c, hit: hit, dir: dir, pieces: pieces.slice(0, 1200), rnd: rnd });
  }
  // a model's box, where it stands (40-stormfx.js has its points where they are)
  function cnMeshBox(f) {
    var b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
    try {
      var W = typeof fxMeshWorld === "function" ? fxMeshWorld(f) : null;
      if (W) {
        for (var i = 0; i < W.p.length; i += 3) {
          b[0] = Math.min(b[0], W.p[i]); b[1] = Math.max(b[1], W.p[i]); b[2] = Math.min(b[2], W.p[i + 1]); b[3] = Math.max(b[3], W.p[i + 1]);
          b[4] = Math.min(b[4], W.p[i + 2]); b[5] = Math.max(b[5], W.p[i + 2]);
        }
        if (b[0] < Infinity) { return b; }
      }
    } catch (e) { /* by its spot */ }
    var p = f.pts[0], n = f.node || {}, hw = (n.w || 40) / 2, hh = (n.h || 40) / 2;
    return [p[0] - hw, p[0] + hw, p[1] - hh, p[1] + hh, p[2] || 0, (p[2] || 0) + 0.8 * FLOOR_PX];
  }
  function cnChunks(f, size) {
    if (f.mesh || f.pts.length !== 4) { return [f]; }
    var p = f.pts, e1 = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1], (p[1][2] || 0) - (p[0][2] || 0)), e2 = Math.hypot(p[3][0] - p[0][0], p[3][1] - p[0][1], (p[3][2] || 0) - (p[0][2] || 0));
    var nu = Math.max(1, Math.min(6, Math.round(e1 / size))), nv = Math.max(1, Math.min(6, Math.round(e2 / size))), out = [];
    function at(u, v) {
      var a = [p[0][0] + (p[1][0] - p[0][0]) * u, p[0][1] + (p[1][1] - p[0][1]) * u, (p[0][2] || 0) + ((p[1][2] || 0) - (p[0][2] || 0)) * u];
      var d = [p[3][0] + (p[2][0] - p[3][0]) * u, p[3][1] + (p[2][1] - p[3][1]) * u, (p[3][2] || 0) + ((p[2][2] || 0) - (p[3][2] || 0)) * u];
      return [a[0] + (d[0] - a[0]) * v, a[1] + (d[1] - a[1]) * v, a[2] + (d[2] - a[2]) * v];
    }
    for (var i = 0; i < nu; i++) {
      for (var j = 0; j < nv; j++) {
        out.push(Object.assign({}, f, { pts: [at(i / nu, j / nv), at((i + 1) / nu, j / nv), at((i + 1) / nu, (j + 1) / nv), at(i / nu, (j + 1) / nv)], src: undefined }));
      }
    }
    return out;
  }
  function cnWreckDraw(faces, w, t, P) {
    var e = t - w.t0;
    if (w.big) { cnBall(faces, w, e, P); }
    else if (e < 450) { cnBlast(faces, w, e, P); }
    if (!w.big && e > 80 && e < 2200) { cnSmoke(faces, w, e, P); }
    w.pieces.forEach(function (pc) {
      var s = Math.max(0, (e - pc.delay) / 1000), f = pc.f;
      // (still standing, till the ball or the blast gets to it -- a chunk not there till it is blown off)
      if (s <= 0) { if (f) { faces.push(f); } return; }
      if (pc.cube) { cnCube(faces, pc, s, w, e, P); return; }
      var g = 9.81, x = pc.c[0] + pc.v[0] * s * P, y = pc.c[1] + pc.v[1] * s * P, z = pc.c[2] + (pc.v[2] * s - g * s * s / 2) * P;
      var vz = pc.v[2] - g * s, lowZ = pc.floor;
      if (z < lowZ) {
        // down: a bounce, sliding to a stop
        var tHit = (pc.v[2] + Math.sqrt(Math.max(0, pc.v[2] * pc.v[2] + 2 * g * (pc.c[2] - lowZ) / P))) / g, r = Math.max(0, s - tHit);
        x = pc.c[0] + pc.v[0] * (tHit + r * 0.25 * (1 - Math.min(1, r))) * P; y = pc.c[1] + pc.v[1] * (tHit + r * 0.25 * (1 - Math.min(1, r))) * P;
        z = lowZ + Math.max(0, Math.abs(Math.sin(r * 6)) * Math.exp(-r * 4) * 0.6 * P);
        vz = 0;
      }
      var ang = s * 1.2, rot = cnRot(pc.w, z > lowZ + 1 ? ang : Math.min(ang, 1.5));
      var fade = Math.max(0, Math.min(1, (w.ms - e) / 900));
      var pts = f.mesh ? f.pts.map(function (p) { return [p[0] + x - pc.c[0], p[1] + y - pc.c[1], (p[2] || 0) + z - pc.c[2]]; })
                       : f.pts.map(function (p) { var d = [p[0] - pc.c[0], p[1] - pc.c[1], (p[2] || 0) - pc.c[2]], q = cnApply(rot, d); return [x + q[0], y + q[1], z + q[2]]; });
      var how = f.mesh ? f.how : cnFade(f.how || CN_CONCRETE, fade);
      if (f.mesh && fade < 0.3) { return; }
      faces.push(Object.assign({}, f, { pts: pts, n: f.mesh ? f.n : cnApply(rot, f.n || [0, 0, 1]), how: how, src: undefined }));
      void vz;
    });
    // the dust it raises
    var dk = (e - (w.big ? 900 : 100)) / (w.big ? 2600 : 1600);
    if (dk > 0 && dk < 1) { cnPuff(faces, w.c[0], w.c[1], w.box[4], dk, Math.max(w.box[1] - w.box[0], w.box[3] - w.box[2]) * 0.6 + 0.6 * P, P); }
  }
  // where a piece is after s seconds of flying: falling, bouncing, sliding to a stop
  function cnFly(pc, s, P) {
    var g = 9.81, lowZ = pc.floor, x = pc.c[0] + pc.v[0] * s * P, y = pc.c[1] + pc.v[1] * s * P, z = pc.c[2] + (pc.v[2] * s - g * s * s / 2) * P, landed = false;
    if (z < lowZ) {
      var tHit = (pc.v[2] + Math.sqrt(Math.max(0, pc.v[2] * pc.v[2] + 2 * g * (pc.c[2] - lowZ) / P))) / g, r = Math.max(0, s - tHit), slide = tHit + 0.25 * Math.min(1, r) * (2 - Math.min(1, r));
      x = pc.c[0] + pc.v[0] * slide * P; y = pc.c[1] + pc.v[1] * slide * P;
      z = lowZ + Math.max(0, Math.abs(Math.sin(r * 7)) * Math.exp(-r * 5) * 0.5 * P);
      landed = true;
    }
    return [x, y, z, landed];
  }
  function cnCube(faces, pc, s, w, e, P) {
    var at = cnFly(pc, s, P), h = pc.cube / 2, rot = cnRot(pc.w, at[3] ? Math.min(s * 1.4, 2.2) : s * 1.4);
    var fade = Math.max(0, Math.min(1, (w.ms - e) / 900)), how = cnFade(pc.how, fade);
    var cs = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(function (c) {
      var q = cnApply(rot, [c[0] * h, c[1] * h, c[2] * h]); return [at[0] + q[0], at[1] + q[1], Math.max(pc.floor, at[2] + h + q[2])];
    });
    [[0, 1, 2, 3, [0, 0, -1]], [4, 7, 6, 5, [0, 0, 1]], [0, 4, 5, 1, [0, -1, 0]], [1, 5, 6, 2, [1, 0, 0]], [2, 6, 7, 3, [0, 1, 0]], [3, 7, 4, 0, [-1, 0, 0]]].forEach(function (q) {
      faces.push({ pts: [cs[q[0]], cs[q[1]], cs[q[2]], cs[q[3]]], n: cnApply(rot, q[4]), how: how });
    });
  }
  // smoke: grey puffs rolling up and out, thinning
  function cnSmoke(faces, w, e, P) {
    var k = (e - 80) / 2100, rnd = gl3Rand(w.id * 7 + 3);
    for (var i = 0; i < 7; i++) {
      var a = rnd() * Math.PI * 2, d = (0.3 + rnd() * 0.8) * P * (0.5 + k * 1.5), x = w.c[0] + Math.cos(a) * d, y = w.c[1] + Math.sin(a) * d;
      var z = w.c[2] + (0.2 + rnd() * 0.6 + k * 2.2) * P, r = (0.35 + rnd() * 0.3 + k * 0.9) * P, ring = [];
      for (var q = 0; q < 8; q++) { var b = q / 8 * Math.PI * 2; ring.push([x + Math.cos(b) * r, y + Math.sin(b) * r]); }
      v3Prism(faces, ring, z - r * 0.7, z + r * 0.7, { piece: true, color: "#6f6a64", edge: "#6f6a64", bare: true, alpha: Math.max(0.02, 0.45 * (1 - k)), late: true });
    }
  }
  function cnRot(axis, ang) {
    var l = Math.hypot(axis[0], axis[1], axis[2]) || 1, x = axis[0] / l, y = axis[1] / l, z = axis[2] / l, c = Math.cos(ang), s = Math.sin(ang), C = 1 - c;
    return [c + x * x * C, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, c + y * y * C, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, c + z * z * C];
  }
  function cnApply(R, v) { return [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]]; }
  // the wrecking ball: a crane beside it, the ball swung back and into the wall
  function cnBall(faces, w, e, P) {
    var b = w.box, dir = w.dir, h = Math.max(b[5] + 4 * P, 9 * P);
    var base = [w.hit[0] - dir[0] * 9 * P, w.hit[1] - dir[1] * 9 * P], arrive = Math.min(1, e / 400), leave = Math.max(0, (e - (w.ms - 900)) / 900);
    var shift = (1 - arrive + leave) * 14 * P, bx = base[0] - dir[0] * shift, by = base[1] - dir[1] * shift;
    var side = [-dir[1], dir[0]];
    cnBox(faces, bx, by, 1.4 * P, 1.4 * P, 0.4 * P, 1.6 * P, CN_YELLOW, Math.atan2(dir[1], dir[0]));
    cnBox(faces, bx - dir[0] * 0.6 * P, by - dir[1] * 0.6 * P, 1.6 * P, 1.6 * P, 0, 0.5 * P, CN_DARK, Math.atan2(dir[1], dir[0]));
    var tip = [w.hit[0] - dir[0] * 2.5 * P - dir[0] * shift, w.hit[1] - dir[1] * 2.5 * P - dir[1] * shift, h];
    cnBeam(faces, [bx, by, 1.6 * P], tip, 0.5 * P, CN_YELLOW);
    // the swing: back, then into the wall at 700 ms, rebounding a little
    var sw = e < 700 ? -0.9 * Math.sin(Math.min(1, e / 700) * Math.PI / 2) * (1 - Math.min(1, e / 700)) - 0.9 + 1.0 * Math.pow(Math.min(1, e / 700), 2) * 1.0
                     : 0.1 - 0.35 * Math.sin((e - 700) / 260) * Math.exp(-(e - 700) / 700);
    var len = Math.max(3 * P, h - w.hit[2]), ang = Math.max(-1.1, Math.min(0.25, sw));
    var ball = [tip[0] + dir[0] * Math.sin(ang) * len, tip[1] + dir[1] * Math.sin(ang) * len, h - Math.cos(ang) * len];
    cnBeam(faces, tip, ball, 0.04 * P, CN_DARK);
    var r = 0.55 * P, ring = [];
    for (var q = 0; q < 12; q++) { var a = q / 12 * Math.PI * 2; ring.push([ball[0] + Math.cos(a) * r, ball[1] + Math.sin(a) * r]); }
    v3Prism(faces, ring, ball[2] - r, ball[2] + r, CN_DARK);
    void side;
  }
  // a blast: a flash of light, sparks thrown out, a cloud of smoke rolling up
  function cnBlast(faces, w, e, P) {
    var k = e / 450, c = w.c, r = (0.4 + k * 2.4) * P;
    // sparks
    var rnd = gl3Rand(w.id * 13 + 5), spark = { piece: true, color: "#ffe9a8", edge: "#ffe9a8", bare: true, pat: 31, alpha: Math.max(0.02, 1 - k), late: true };
    for (var i = 0; i < 26; i++) {
      var a = rnd() * Math.PI * 2, up = rnd() * 1.2, sp = (3 + rnd() * 6) * P * (e / 1000), sx = c[0] + Math.cos(a) * sp, sy = c[1] + Math.sin(a) * sp, sz = c[2] + up * sp - 4.9 * Math.pow(e / 1000, 2) * P;
      cnBeam(faces, [sx, sy, sz], [sx - Math.cos(a) * 0.25 * P, sy - Math.sin(a) * 0.25 * P, sz - up * 0.2 * P], 0.04 * P, spark);
    }
    var flash = { piece: true, color: "#ffd27a", edge: "#ffd27a", bare: true, pat: 31, alpha: Math.max(0.02, 0.9 * (1 - k)), late: true };
    for (var i = 0; i < 12; i++) {
      var a0 = i / 12 * Math.PI * 2, a1 = (i + 1) / 12 * Math.PI * 2;
      faces.push({ pts: [[c[0], c[1], c[2] + r * 0.9], [c[0] + Math.cos(a0) * r, c[1] + Math.sin(a0) * r, c[2]], [c[0] + Math.cos(a1) * r, c[1] + Math.sin(a1) * r, c[2]]],
                   n: [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2), 0.5], how: flash });
      faces.push({ pts: [[c[0], c[1], c[2] - r * 0.7], [c[0] + Math.cos(a1) * r, c[1] + Math.sin(a1) * r, c[2]], [c[0] + Math.cos(a0) * r, c[1] + Math.sin(a0) * r, c[2]]],
                   n: [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2), -0.5], how: flash });
    }
  }
  // the picture: the diff each time, the jobs and the wrecks drawn
  if (typeof v3Build === "function") {
    var v3BuildCn = v3Build;
    v3Build = function () {
      var model = v3BuildCn.apply(this, arguments);
      try {
        if (!model || !model.faces || !V3 || V3.scene === "space") { return model; }
        if (!bpSite) { cnDiff(model); }
        return cnJobs(model);
      } catch (e) { return model; }
    };
  }
  // taken away in 3D: knocked down, said so (the diff above does the rest)
  if (typeof v3Open === "function") {
    var v3OpenCn = v3Open;
    v3Open = function () {
      var out = v3OpenCn.apply(this, arguments);
      cnWatch.by = null; cnWatch.jobs = []; cnWatch.wrecks = [];
      try { cnShowWatch(); } catch (e) { /* the button as it is */ }
      return out;
    };
  }
