// ---------------------------------------------------------------------------
//  40-firesafe.js -- a building people live or work in together kept safe
//  from fire, as the codes have it: a lit EXIT sign over every way out,
//  an emergency light by it, an extinguisher on the wall beside it, an
//  EXIT sign hung over each stair; and inside the ceilings (39-xray.js),
//  the sprinklers -- red mains along each room, a head every three metres
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (my own, 2026-10-03: flats, offices, schools, shops with not one way
  // out marked)  Only what the codes ask of a building shared or open to
  // the public: not a house, a cabin, a duplex or a row of townhouses.
  var FS_HOMES = { house: 1, cabin: 1, duplex: 1, townhouses: 1 };
  var FS_EVERY = 3.0;                 // m: sprinkler heads apart, each way
  var FS_SIGN = { piece: true, color: "#f4f7f2", edge: "#b9c0b8", pat: 31 };
  var FS_RED = { piece: true, color: "#c8281e", edge: "#7d1712" };
  var FS_DARK = { piece: true, color: "#2c2f33", edge: "#15171a" };
  var FS_LAMP = { piece: true, color: "#e9ecee", edge: "#9aa1a6" };
  var FS_BULB = { piece: true, color: "#fff4d6", edge: "#e0cfa0", pat: 31 };
  function fsKind() {
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, b) { return b.id - a.id; });
    return marks.length ? marks[0].madeWith.type || "house" : "house";
  }
  function fsWanted() { return !FS_HOMES[fsKind()] && hand.nodes.some(function (n) { return n.kind === "i_room"; }); }
  if (typeof XRAY_COLORS === "object") { XRAY_COLORS.fire = "#c8281e"; }
  if (typeof XRAY_LAYERS === "object" && XRAY_LAYERS.indexOf("fire") < 0) { XRAY_LAYERS.push("fire"); }

  // ---- the ways out, and what is by each --------------------------------------------------------
  function fsExits(model) {
    var P = FLOOR_PX, faces = [], floors = typeof floorsOf === "function" ? floorsOf() : [];
    function ground(n) { var f = floors.length ? floorAt(floors, n.x, n.y) : null; return !f || f.level === 0; }
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && ground(n); });
    var lowest = {};
    model.faces.forEach(function (f) {
      if (!f.node || !f.pts || f.mesh) { return; }
      var id = f.node.id;
      f.pts.forEach(function (p) { var z = p[2] || 0; if (lowest[id] === undefined || z < lowest[id]) { lowest[id] = z; } });
    });
    var exit = typeof adrPic === "function" ? adrPic(TXT.fs_exit, 0.34, 0.14, "#c8281e", "#f4f7f2", false) : null;
    hand.nodes.forEach(function (d) {
      if ((d.kind !== "i_door" && d.kind !== "i_door2" && d.kind !== "i_slide") || !ground(d)) { return; }
      // (a door out: a room on one side of it, none on the other)
      var t = (d.turn || 0) * Math.PI / 180, u = [-Math.sin(t), Math.cos(t)], al = [Math.cos(t), Math.sin(t)], hh = d.h / 2 + 0.7 * P;
      var aIn = rooms.some(function (r) { return insideArea(r, d.x + u[0] * hh, d.y + u[1] * hh); }), bIn = rooms.some(function (r) { return insideArea(r, d.x - u[0] * hh, d.y - u[1] * hh); });
      if (aIn === bIn) { return; }
      var inward = aIn ? u : [-u[0], -u[1]], z0 = lowest[d.id] !== undefined ? lowest[d.id] : 0;
      // its threshold, where the wall is, and a hair into the room from it
      var th = [d.x - inward[0] * (d.h / 2 - 0.16 * P), d.y - inward[1] * (d.h / 2 - 0.16 * P)];
      if (exit && typeof adrPlate === "function") { adrPlate(faces, th, inward, 0.36 * P, 0.16 * P, z0 + 2.32 * P, exit, FS_SIGN, false); }
      // the emergency light over it: a box, two lamps on it
      var lt = [th[0] + inward[0] * 0.06 * P, th[1] + inward[1] * 0.06 * P], s = 0.17 * P;
      v3Prism(faces, [[lt[0] - al[0] * s, lt[1] - al[1] * s], [lt[0] + al[0] * s, lt[1] + al[1] * s],
                      [lt[0] + al[0] * s + inward[0] * 0.08 * P, lt[1] + al[1] * s + inward[1] * 0.08 * P], [lt[0] - al[0] * s + inward[0] * 0.08 * P, lt[1] - al[1] * s + inward[1] * 0.08 * P]],
              z0 + 2.48 * P, z0 + 2.58 * P, FS_LAMP);
      [-1, 1].forEach(function (k) {
        var c = [lt[0] + al[0] * k * 0.1 * P + inward[0] * 0.09 * P, lt[1] + al[1] * k * 0.1 * P + inward[1] * 0.09 * P];
        v3Prism(faces, fsRing(c, 0.045 * P, 6), z0 + 2.46 * P, z0 + 2.53 * P, FS_BULB);
      });
      // the extinguisher on the wall beside it, and its sign over it
      var side = d.w / 2 + 0.45 * P, ex = [th[0] + al[0] * side + inward[0] * 0.1 * P, th[1] + al[1] * side + inward[1] * 0.1 * P];
      v3Prism(faces, fsRing(ex, 0.075 * P, 8), z0 + 0.9 * P, z0 + 1.38 * P, FS_RED);
      v3Prism(faces, fsRing(ex, 0.03 * P, 6), z0 + 1.38 * P, z0 + 1.48 * P, FS_DARK);
      v3Prism(faces, fsRing([ex[0] - inward[0] * 0.07 * P, ex[1] - inward[1] * 0.07 * P], 0.04 * P, 4), z0 + 1.5 * P, z0 + 1.72 * P, FS_RED);
    });
    // over each stair, an EXIT sign hung from the ceiling, read from both ways
    hand.nodes.forEach(function (st) {
      if (st.kind !== "i_stairs" || !exit) { return; }
      var f = floors.length ? floorAt(floors, st.x, st.y) : null, z0 = (f ? f.z : 0) + (lowest[st.id] !== undefined && !f ? lowest[st.id] : 0);
      var c = [st.x + (f ? f.dx : 0), st.y + (f ? f.dy : 0)], t = (st.turn || 0) * Math.PI / 180, along = [-Math.sin(t), Math.cos(t)];
      adrPlate(faces, c, along, 0.36 * P, 0.16 * P, z0 + 2.3 * P, exit, FS_SIGN, true);
    });
    return faces;
  }
  function fsRing(c, r, n) { var o = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; o.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } return o; }
  if (typeof v3Build === "function") {
    var v3BuildFire = v3Build;
    v3Build = function () {
      var model = v3BuildFire.apply(this, arguments);
      try {
        if (model && model.faces && V3 && V3.scene !== "space" && !(V3.flat && V3.flatDone) && fsWanted()) {
          var add = fsExits(model);
          for (var i = 0; i < add.length; i++) { model.faces.push(add[i]); }
        }
      } catch (e) { /* the building without them */ }
      return model;
    };
  }

  // ---- the sprinklers, inside the ceilings ------------------------------------------------------
  // In each room shown: mains across it every FS_EVERY metres, just under its
  // ceiling, joined along one side; a head on each every FS_EVERY metres;
  // from the room nearest the street's corner, the riser up every floor.
  function fsSprinklers(made) {
    var P = FLOOR_PX, F = xrayFloors(), faces = made.faces, red = { piece: true, color: XRAY_COLORS.fire, edge: "#7d1712", bare: true, xray: true, pat: 22 };
    var chrome = { piece: true, color: "#d9dde1", edge: "#8d949a", bare: true, xray: true, pat: 23 }, heads = 0, every = FS_EVERY * P, r = 0.03 * P;
    function pipe(A, B) {
      var d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], l = Math.hypot(d[0], d[1], d[2]) || 1, u = [d[0] / l, d[1] / l, d[2] / l];
      var side = Math.abs(u[2]) > 0.9 ? [1, 0, 0] : [-u[1], u[0], 0], sl = Math.hypot(side[0], side[1]) || 1;
      side = [side[0] / sl, side[1] / sl, 0];
      var up = [u[1] * side[2] - u[2] * side[1], u[2] * side[0] - u[0] * side[2], u[0] * side[1] - u[1] * side[0]];
      xrayBeam(faces, A, B, side, up, 2 * r, 2 * r, red);
    }
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && xrayShownLevel(F.at(n)[3], F); });
    rooms.forEach(function (room) {
      if (heads > 2500) { return; }          // (a tower: so many and no more, not a hundred thousand faces)
      var at = F.at(room), q = turned(room), z = at[2] + ceilOf(room) * P - 0.25 * P, a = (room.turn || 0) % 180 !== 0;
      var w = q.w, h = q.h, x0 = at[0] - w / 2, y0 = at[1] - h / 2;
      var alongX = w >= h, nLines = Math.max(1, Math.round((alongX ? h : w) / every)), nHeads = Math.max(1, Math.round((alongX ? w : h) / every));
      var lines = [];
      for (var i = 0; i < nLines; i++) {
        var off = (i + 0.5) * (alongX ? h : w) / nLines;
        var A = alongX ? [x0 + 0.3 * P, y0 + off, z] : [x0 + off, y0 + 0.3 * P, z], B = alongX ? [x0 + w - 0.3 * P, y0 + off, z] : [x0 + off, y0 + h - 0.3 * P, z];
        pipe(A, B);
        lines.push(A);
        for (var j = 0; j < nHeads; j++) {
          var s = (j + 0.5) / nHeads, hx = A[0] + (B[0] - A[0]) * s, hy = A[1] + (B[1] - A[1]) * s;
          v3Prism(faces, fsRing([hx, hy], 0.025 * P, 6), z - 0.12 * P, z, chrome);
          v3Prism(faces, fsRing([hx, hy], 0.055 * P, 8), z - 0.135 * P, z - 0.12 * P, chrome);
          heads++;
        }
      }
      // the lines joined, along the room's one side
      if (lines.length > 1) { pipe(lines[0], lines[lines.length - 1]); }
      void a;
    });
    return heads;
  }
  if (typeof xrayBuild === "function") {
    var xrayBuildFire = xrayBuild;
    xrayBuild = function (model) {
      var made = xrayBuildFire.apply(this, arguments);
      try {
        if (made && made.faces && xrayLayer("fire") && fsWanted()) {
          var from = made.faces.length;
          fsSprinklers(made);
          for (var i = from; i < made.faces.length; i++) { if (!made.faces[i].src) { made.faces[i].src = made.faces[i]; } }
        }
      } catch (e) { /* no sprinklers */ }
      return made;
    };
  }
  if (typeof xrayPanel === "function") {
    var xrayPanelFire = xrayPanel;
    xrayPanel = function () {
      var out = xrayPanelFire.apply(this, arguments);
      try {
        var box = V3 && V3.box ? el(".v3-xray", V3.box) : null;
        if (box) {
          all(".v3-xray-row", box).forEach(function (row, i) {
            if (XRAY_LAYERS[i] !== "fire") { return; }
            var dot = el(".v3-xray-dot", row);
            if (dot) { dot.style.background = XRAY_COLORS.fire; }
            // (only where there are sprinklers to show: not a house)
            row.hidden = !fsWanted();
          });
        }
      } catch (e) { /* as it is */ }
      return out;
    };
  }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.xr_fire = '<path d="M3 5h14M7 5v3.6M13 5v3.6M5.6 8.6h2.8M11.6 8.6h2.8"/><path d="M5.4 11.4l-1.2 2M7 11.6v2.4M8.6 11.4l1.2 2M11.4 11.4l-1.2 2M13 11.6v2.4M14.6 11.4l1.2 2"/>';
  }
