// ---------------------------------------------------------------------------
//  40-struct.js -- what holds a building up, to be seen: a wood frame or a
//  steel one; the beams in its ceilings and the posts under them, out of
//  sight in the walls and ceilings (seen through them, 39-xray.js) or out
//  on show in the rooms -- timber beams across a ceiling, steel I-beams
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "so you can see either the poles or metal beams
  // supporting the house in the walls and ceilings and things of the sort")
  //
  // What it is framed in: "" as the building is -- a home in wood, anything
  // bigger in steel -- or picked.  Its beams: boxed in out of sight, or on
  // show ("shown").
  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.frame = ""; HOUSE_PLAIN.beams = ""; }
  var STRUCT_KINDS = ["wood", "steel"];
  var structMemo = { pic: null, kind: "wood" };
  function structKind() {
    var k = houseOpt("frame");
    if (STRUCT_KINDS.indexOf(k) >= 0) { return k; }
    // (once a picture: every room's every wall asks)
    var pic = typeof V3 !== "undefined" && V3 ? V3.picture : null;
    if (pic && structMemo.pic === pic) { return structMemo.kind; }
    var kind = typeof groundsNow === "function" && groundsNow() !== "home" ? "steel" : "wood";
    structMemo = { pic: pic, kind: kind };
    return kind;
  }
  // (2026-10-04) "open": an open plan's, Start building -- on show over its
  // living space, where its walls came out, and nowhere else (a room asked
  // about: whether it is part of that space; asked of the house: "shown" only)
  function structShown(room) {
    var b = houseOpt("beams");
    return b === "shown" || (b === "open" && !!room && !!((room.open && room.open.length) || (room.openTo && room.openTo.length)));
  }
  function structSeen(room) { return structShown(room) || (typeof xrayOn === "function" && xrayOn()); }

  // ---- a beam ---------------------------------------------------------------------------
  // In a shape's own numbers, along x (or y) from a0 to a1, its middle at
  // `mid` across, from z0 up to z1: steel an I -- a flange top and bottom,
  // a web between -- and timber one solid piece; each with its underside.
  function structBeam(faces, n, alongX, a0, a1, mid, z0, z1, wide, steel, how) {
    function box(c0, c1, za, zb) {
      if (alongX) { v3Box(faces, n, a0, a1, mid + c0, mid + c1, za, zb, how); }
      else { v3Box(faces, n, mid + c0, mid + c1, a0, a1, za, zb, how); }
      var q = alongX ? [[a0, mid + c0], [a1, mid + c0], [a1, mid + c1], [a0, mid + c1]] : [[mid + c0, a0], [mid + c1, a0], [mid + c1, a1], [mid + c0, a1]];
      faces.push({ pts: q.map(function (p) { var w = v3Local(n, p[0], p[1]); return [w[0], w[1], za]; }), n: [0, 0, -1], how: how });
    }
    if (!steel) { box(-wide / 2, wide / 2, z0, z1); return; }
    var tf = Math.max(0.6, (z1 - z0) * 0.07), tw = Math.max(0.45, wide * 0.09);
    box(-wide / 2, wide / 2, z1 - tf, z1);
    box(-tw / 2, tw / 2, z0 + tf, z1 - tf);
    box(-wide / 2, wide / 2, z0, z0 + tf);
  }
  // How each looks: steel dark and brushed; timber in its grain -- a
  // stained beam on show, a laminated one (LVL) pale; or, out of sight,
  // boxed in and painted as the ceiling's trim.
  var STRUCT_LOOKS = {};
  function structLook(what) {
    if (!STRUCT_LOOKS[what]) {
      var c = { steel: "#34383d", timber: "#7b5434", lvl: "#c9a273", boxed: typeof styleTrim === "function" ? styleTrim("#f1eee8") : "#f1eee8" }[what];
      STRUCT_LOOKS[what] = { piece: true, color: c, edge: v3Mix(c, "#000000", 0.35), beam: true, pat: what === "steel" ? 22 : what === "boxed" ? 0 : 21 };
      if (what === "boxed") { delete STRUCT_LOOKS[what].pat; }
    }
    return STRUCT_LOOKS[what];
  }
  if (typeof styleApply === "function") {
    var styleApplyStruct = styleApply;
    styleApply = function () { STRUCT_LOOKS = {}; return styleApplyStruct.apply(this, arguments); };
  }

  // ---- over a wall taken out, and across a ceiling ---------------------------------------
  // (in place of 39-inside.js's own: a steel beam an I, and on show -- or
  // seen through the walls -- as what it is, not boxed in)
  if (typeof wallBeams === "function") {
    wallBeams = function (faces, room, edge) {
      var px = FLOOR_PX, ceil = ceilOf(room) * px, steel = structKind() === "steel";
      if (edge === "top" && structShown(room)) { structCeiling(faces, room, steel, ceil); }
      wallOpenRuns(room, edge).forEach(function (r) {
        if (r.other.id < room.id) { return; }
        // (on show where either room is: an open plan's, over its living space)
        var shown = structShown(room) || structShown(r.other), seen = shown || structSeen();
        var s = wallStructure(room, r);
        // (a wall that carried nothing: a beam where it was only to be seen)
        if (!s.bearing && !shown) { return; }
        var iron = steel || s.steel, deep = (s.bearing ? s.depth : 241) / 1000 * px;
        var wide = iron ? Math.max(0.13, Math.min(0.2, deep / px * 0.5)) * px : 0.045 * (s.bearing ? s.plies : 2) * px;
        var look = !seen ? structLook("boxed") : iron ? structLook("steel") : structLook(shown ? "timber" : "lvl");
        if (!seen) { wide += 0.026 * px; deep += 0.013 * px; }       // its drywall round it
        var hw = room.w / 2, hh = room.h / 2, along = edge === "top" || edge === "foot";
        var mid = edge === "top" ? -hh : edge === "foot" ? hh : edge === "left" ? -hw : hw, off = along ? hw : hh;
        structBeam(faces, room, along, r.a - off, r.b - off, mid, ceil - deep, ceil - 0.5, wide, iron && seen, look);
      });
    };
  }
  // Beams on show across a room's ceiling, the short way, from wall to wall:
  // timber every 1.2 m, steel every 2.4 m; across a wide room a girder down
  // the middle the long way, the beams framed into it.
  function structCeiling(faces, room, steel, ceil) {
    var P = FLOOR_PX;
    // (an attic's ceiling slopes with its roof: its rafters, 40-attic.js)
    if ((room.turn || 0) % 90 || Math.min(room.w, room.h) < 1.8 * P || room.use === "lift" || room.attic) { return; }
    var T = Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06)), hw = room.w / 2, hh = room.h / 2;
    var alongX = room.w <= room.h, span = (alongX ? room.w : room.h) / P, long = alongX ? room.h : room.w;
    var every = (steel ? 2.4 : 1.2) * P, count = Math.max(1, Math.round(long / every));
    var deep = (steel ? (span > 6 ? 0.3 : 0.2) : (span > 5 ? 0.3 : 0.22)) * P, wide = (steel ? (span > 6 ? 0.17 : 0.13) : 0.14) * P;
    var look = structLook(steel ? "steel" : "timber"), reach = (alongX ? hw : hh) - T, gap = long / count;
    // (clear of what hangs from the ceiling -- a fan, a light over the table:
    // the beams put half a space along where one would be in the way, 2026-10-04)
    var shift = 0;
    if (!(room.turn || 0) && typeof FROM_CEILING === "object") {
      var hung = hand.nodes.filter(function (n) { return FROM_CEILING[n.kind] && insideArea(room, n.x, n.y); })
        .map(function (n) { return alongX ? n.y - room.y : n.x - room.x; });
      var clash = function (o) {
        var c = 0;
        for (var j = 0; j <= count; j++) {
          var a = -long / 2 + (j + 0.5) * gap + o;
          if (a > -long / 2 + 0.2 * gap && a < long / 2 - 0.2 * gap) { hung.forEach(function (h) { if (Math.abs(h - a) < 0.3 * P) { c++; } }); }
        }
        return c;
      };
      if (hung.length && clash(gap / 2) < clash(0)) { shift = gap / 2; }
    }
    for (var k = 0; k <= count; k++) {
      var at = -long / 2 + (k + 0.5) * gap + shift;
      if (at <= -long / 2 + 0.2 * gap || at >= long / 2 - 0.2 * gap) { continue; }
      structBeam(faces, room, alongX, -reach, reach, at, ceil - deep, ceil - 0.4, wide, steel, look);
    }
    if (span > 6.5) {
      var gd = deep * 1.4, gw = wide * 1.3, ends = (alongX ? hh : hw) - T;
      // (to one side of a fan in the middle, not through it)
      var across = (room.turn || 0) || typeof FROM_CEILING !== "object" ? [] : hand.nodes.filter(function (n) { return FROM_CEILING[n.kind] && insideArea(room, n.x, n.y); })
        .map(function (n) { return alongX ? n.x - room.x : n.y - room.y; });
      var gm = [0, 0.7 * P, -0.7 * P].filter(function (o) { return !across.some(function (h) { return Math.abs(h - o) < 0.35 * P; }); })[0] || 0;
      structBeam(faces, room, !alongX, -ends, ends, gm, ceil - gd, ceil - 0.3, gw, steel, look);
    }
  }

  // ---- a post: wood or steel -----------------------------------------------------------------
  // (its kind in its colors, so the model kept for one is not taken for the other)
  if (typeof modelColors === "function") {
    var modelColorsStruct = modelColors;
    modelColors = function (n) {
      var C = modelColorsStruct.apply(this, arguments);
      if (n && n.kind === "i_post") { C.kind = structKind(); }
      return C;
    };
  }
  if (typeof MODELS === "object" && MODELS.i_post) {
    var postPlain = MODELS.i_post;
    mDef("i_post", function (M, W, D, H, C) {
      var cm = FLOOR_PX / 100;
      if (C.kind === "steel") {
        // a square steel column (HSS), a plate bolted down under it and one on top under the beam
        var s = Math.min(W, D, 12 * cm) / 2, plate = M.mat("metal", "#5b6067"), col = M.mat("metal", C.main || "#3a3e44");
        M.box(-s - 4 * cm, s + 4 * cm, -s - 4 * cm, s + 4 * cm, 0, 2 * cm, plate, 0.2 * cm);
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
          M.cyl(q[0] * (s + 2.4 * cm), q[1] * (s + 2.4 * cm), 2 * cm, 3.4 * cm, 0.9 * cm, plate, { seg: 6 });
        });
        M.box(-s, s, -s, s, 2 * cm, H - 2 * cm, col, 0.3 * cm);
        M.box(-s - 3 * cm, s + 3 * cm, -s - 3 * cm, s + 3 * cm, H - 2 * cm, H, plate, 0.2 * cm);
        return;
      }
      if (C.kind === "wood") {
        // a 6x6 timber post in a steel base, a steel cap under the beam
        var w = Math.min(W, D, 14 * cm) / 2, wood = M.mat("wood", C.main || "#a8784c"), iron = M.mat("metal", "#44474c");
        M.box(-w - 0.6 * cm, w + 0.6 * cm, -w - 0.6 * cm, w + 0.6 * cm, 0, 9 * cm, iron, 0.2 * cm);
        M.box(-w, w, -w, w, 2 * cm, H - 8 * cm, wood, 0.5 * cm);
        M.box(-w - 0.6 * cm, w + 0.6 * cm, -w - 0.6 * cm, w + 0.6 * cm, H - 12 * cm, H, iron, 0.2 * cm);
        return;
      }
      return postPlain.apply(this, arguments);
    });
  }

  // ---- seen through the walls (39-xray.js): steel studs, columns and girders ----------------
  // A steel frame's studs are light steel; at each corner of a room a
  // column, and over each wall in the ceiling a girder from column to column.
  var structXrayHow = { src: null, how: null };
  var structCols = { faces: null, seen: null };
  if (typeof xrayFrame === "function") {
    var xrayFrameStruct = xrayFrame;
    xrayFrame = function (faces, room, F, how) {
      if (structKind() !== "steel") { return xrayFrameStruct.apply(this, arguments); }
      if (structXrayHow.src !== how) {
        structXrayHow = { src: how, how: Object.assign({}, how, { color: "#aeb6bd", edge: v3Mix("#aeb6bd", "#000000", 0.3), pat: 22 }) };
      }
      xrayFrameStruct.call(this, faces, room, F, structXrayHow.how);
      structSteelFrame(faces, room, F);
    };
  }
  function structSteelFrame(faces, room, F) {
    if (structCols.faces !== faces) { structCols = { faces: faces, seen: {} }; }
    var P = FLOOR_PX, f = F.of(room), dz = f ? f.z : 0, dx = f ? f.dx : 0, dy = f ? f.dy : 0;
    var T = Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06)), hw = room.w / 2, hh = room.h / 2;
    var top = ceilOf(room) * P, at = { x: room.x + dx, y: room.y + dy, turn: room.turn || 0 }, look = structLook("steel");
    var c = 0.1 * P, deep = 0.25 * P;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
      var lx = q[0] * (hw - T / 2), ly = q[1] * (hh - T / 2), w = v3Local(at, lx, ly);
      var key = Math.round(w[0] / 15) + "," + Math.round(w[1] / 15) + "," + Math.round(dz);
      if (structCols.seen[key]) { return; }
      structCols.seen[key] = true;
      // an H: two flanges and the web between, floor to the girders over
      v3Box(faces, at, lx - c, lx + c, ly - c, ly - c + 0.6, dz, dz + top + deep, look);
      v3Box(faces, at, lx - c, lx + c, ly + c - 0.6, ly + c, dz, dz + top + deep, look);
      v3Box(faces, at, lx - 0.3, lx + 0.3, ly - c, ly + c, dz, dz + top + deep, look);
    });
    WALL_EDGES.forEach(function (edge) {
      var along = edge === "top" || edge === "foot";
      var mid = edge === "top" ? -hh + T / 2 : edge === "foot" ? hh - T / 2 : edge === "left" ? -hw + T / 2 : hw - T / 2;
      var key = edge + Math.round((along ? at.y + mid : at.x + mid) / 15) + "," + Math.round((along ? at.x : at.y) / 15) + "," + Math.round(dz);
      if (structCols.seen[key]) { return; }
      structCols.seen[key] = true;
      var reach = (along ? hw : hh) - T / 2;
      structBeam(faces, at, along, -reach, reach, mid, dz + top, dz + top + deep, 0.13 * P, true, look);
    });
  }

  // ---- changed: the house put up again --------------------------------------------------------
  // (what the 3D view keeps from one picture to the next does not know of
  // the frame, the beams on show or the walls seen through)
  var structSig = null;
  if (typeof v3Build === "function") {
    var v3BuildStruct = v3Build;
    v3Build = function () {
      if (typeof V3 !== "undefined" && V3) {
        var sig = [houseOpt("frame"), houseOpt("beams"), structSeen() ? 1 : 0].join("|");
        if (structSig !== null && sig !== structSig) { V3.kept = null; V3.xrayKept = null; STRUCT_LOOKS = {}; }
        structSig = sig;
      }
      return v3BuildStruct.apply(this, arguments);
    };
  }

  // ---- in the view's settings ------------------------------------------------------------------
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      sx_wood: '<rect x="2.6" y="5.6" width="14.8" height="8.8" rx="1"/><path d="M4.6 8.6c3.4-1.4 7 1.4 10.8 0M4.6 11.4c3-1.2 6.4 1.2 10.8 0"/>',
      sx_steel: '<path d="M4.4 3.6h11.2v2.2h-4.4v8.4h4.4v2.2H4.4v-2.2h4.4V5.8H4.4z"/>',
      sx_shown: '<path d="M2.4 4h15.2M4.4 4v3.4h2.4V4M8.8 4v3.4h2.4V4M13.2 4v3.4h2.4V4M5.6 16.6v-6M14.4 16.6v-6M3.6 16.6h4M12.4 16.6h4"/>'
    });
  }
  if (typeof HOUSE_TAB_MORE === "object") {
    HOUSE_TAB_MORE.push(function (sheet, head, tiles, draw) {
      head(TXT.sx_head);
      if (typeof worldPicker === "function") {
        worldPicker(sheet, STRUCT_KINDS, structKind(), "sx_", function (k) { houseSetOpt("frame", k); if (draw) { draw(); } });
      }
      tiles([{ icon: "sx_shown", label: TXT.sx_shown, on: houseOpt("beams") === "shown" || houseOpt("beams") === "open", set: function (v) { houseSetOpt("beams", v ? "shown" : ""); } }]);
    });
  }
