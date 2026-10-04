// ---------------------------------------------------------------------------
//  40-attic.js -- the space up under a roof: an attic kept for storage, a
//  ladder folding down to it out of a hall ceiling; or finished as a room,
//  stairs up to it, knee walls under the eaves, its ceiling sloping with the
//  roof and flat across the top, a window in each gable; the same over a
//  garage; and a loft in a shed -- each with the headroom it needs, the
//  roof made as steep as that takes
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "make it so you can also add attic spaces in the
  // house and attic like spaces above the garage and sheds things like that
  // to houses with the proper space")
  //
  // An attic is a storey of its own (an i_floor marked n.attic) over the
  // house's top floor, a room in it (room.attic "storage" or "room",
  // room.atticOf "house" or "garage") as big as the roof over the house
  // covers; its way up a pair of i_stairs joined by an arrow (n.attic), a
  // ladder's marked n.ladder.  The proper space, as the codes have it (IRC
  // R305): a room 7 ft (2.13 m) high over at least half its floor, its knee
  // walls 4 ft, a flat ceiling across the top; a storage attic high enough
  // to stand up in down the middle.
  //
  // (2026-10-04: "there should be nothing exterior showing ... it should just
  // have one of those panels in the ceiling that open with a ladder or
  // staircase and you go up into the space that is already there so it
  // should if it is there have that slanted roof but if the house type does
  // not have that slanted roof it should not be able to have an attic")
  // The attic is the space up in the house's own roof, not a storey with a
  // roof of its own: the roof is the one the house would have without it --
  // on the top floor's walls, and over a garage on the garage's -- made only
  // as steep as the attic needs.  What is in the attic is drawn from that roof
  // as it is drawn (atticRoofs), so nothing of it can come through.  A finished
  // attic's knee walls stand in under the slopes where the roof is 4 ft up;
  // storage runs out to the eaves.  A flat roof has no attic.  Over a garage
  // the way up is from the garage: a ladder out of its ceiling, or stairs.
  var ATTIC_KNEE = { room: 1.2, storage: 0 };               // metres
  var ATTIC_FLAT = { room: 2.3, storage: 2.0 };
  var ATTIC_HEAD = 2.13, ATTIC_STAND = 1.65, ATTIC_STEEPEST = Math.tan(62 * Math.PI / 180);
  var ATTIC_UNDER = 0.14;                                   // metres: the roof's own depth, its boards to its top
  var ATTIC_KINDS = ["none", "storage", "room"];
  var ATTIC_GABLED = { gable: true, gambrel: true, stepped: true, aframe: true };
  var ATTIC_LADDER = [0.64, 1.37];                          // metres: a folding ladder's opening, 25 x 54 in

  // The attic rooms (looked for again only when the drawing changes).
  // (while the roof is worked out without them, atticHiding: still these)
  var atticMemo = { list: null, count: -1, at: 0, rooms: [] }, atticHiding = null;
  function atticRooms() {
    if (atticHiding) { return atticHiding; }
    var K = atticMemo, list = hand.nodes, now = performance.now();
    if (K.list !== list || K.count !== list.length || now - K.at > 250) {
      K.list = list; K.count = list.length; K.at = now;
      K.rooms = list.filter(function (n) { return n.kind === "i_room" && (n.attic === "room" || n.attic === "storage"); });
    }
    return K.rooms;
  }
  // (and with them a school's open courtyard, 40-campus.js: rooms that are not rooms beyond a wall)
  var airMemo = { list: null, count: -1, at: 0, rooms: [] };
  function airRooms() {
    var K = airMemo, list = hand.nodes, now = performance.now();
    if (K.list !== list || K.count !== list.length || now - K.at > 250) {
      K.list = list; K.count = list.length; K.at = now;
      K.rooms = list.filter(function (n) { return n.kind === "i_room" && (n.attic || n.court); });
    }
    return K.rooms;
  }
  function atticKnee(r) { return ATTIC_KNEE[r && r.attic] || 0; }
  // How steep the roof over an attic must be, its slopes `half` metres from
  // the eaves to the ridge -- its floor where the roof starts: storage high
  // enough down the middle to stand in; a room with its 7 ft over half its
  // floor between knee walls 4 ft high, and at least 8 ft of it across.
  function atticSlope(kind, half) {
    if (!(half > 0.5)) { return 0; }
    var u = ATTIC_UNDER, D = 2 * half, k;
    if (kind === "room") {
      if (D <= 3.2) { return ATTIC_STEEPEST; }
      k = Math.max(2 * (2 * (ATTIC_HEAD + u) - (ATTIC_KNEE.room + u)) / D, 2 * (ATTIC_HEAD + u) / (D - 2.4));
    } else {
      k = (ATTIC_STAND + u) / half;
    }
    return Math.min(ATTIC_STEEPEST, k);
  }
  // A roof that is flat (39-styles.js): no attic under it.
  function atticFlat(shape) { return typeof STYLE_FLATS === "object" && !!STYLE_FLATS[shape]; }
  function atticShapeBare() {
    if (typeof styleRoofShapeAttic === "function") { return styleRoofShapeAttic(); }
    return typeof styleRoofShape === "function" ? styleRoofShape() : "hip";
  }
  function atticAllowed() { return !atticFlat(atticShapeBare()); }

  // ---- the roof over it ----------------------------------------------------------------------
  // A finished attic under a hip roof is gabled instead -- its ends walls, a
  // window in each.  Any other roof stays as the house's style has it; a
  // flat one is never changed to make room for an attic (there is none).
  if (typeof styleRoofShape === "function") {
    var styleRoofShapeAttic = styleRoofShape;
    styleRoofShape = function () {
      var shape = styleRoofShapeAttic.apply(this, arguments);
      if (ATTIC_GABLED[shape] || atticFlat(shape) || (shape !== "hip" && shape !== "pagoda")) { return shape; }
      return atticRooms().some(function (r) { return r.attic === "room" && r.atticOf !== "garage"; }) ? "gable" : shape;
    };
  }
  // The house roofed as it would be without its attics -- they are in its
  // roof, not under roofs of their own -- and each roof over one as steep as
  // it needs (all of a roof in one piece as steep, 39-house.js).
  if (typeof roofPlan === "function") {
    var roofPlanAttic = roofPlan;
    roofPlan = function (floors, upTo, wallTop) {
      var rooms = atticRooms();
      if (!rooms.length || atticHiding) { return roofPlanAttic.apply(this, arguments); }
      var keep = hand.nodes, out;
      atticHiding = rooms;
      try {
        hand.nodes = keep.filter(function (n) { return !(n.kind === "i_room" && n.attic); });
        out = roofPlanAttic.apply(this, arguments);
      } finally { hand.nodes = keep; atticHiding = null; }
      try {
        rooms.forEach(function (a) {
          var f = floors && floors.length ? floorAt(floors, a.x, a.y) : null, q = turned(a), x = a.x + (f ? f.dx : 0), y = a.y + (f ? f.dy : 0);
          atticSteepen(out, { x0: x - q.w / 2, x1: x + q.w / 2, y0: y - q.h / 2, y1: y + q.h / 2 }, a.attic);
        });
      } catch (e) { /* as steep as it was */ }
      return out;
    };
  }
  // Each roof over `A` (a rectangle in the ground floor's numbers) made as
  // steep as an attic of `kind` there needs -- and the rest of its roof with it.
  function atticSteepen(out, A, kind) {
    var P = FLOOR_PX, pitch = typeof stylePitch === "function" ? stylePitch() : ROOF_PITCH;
    out.forEach(function (R) {
      if (R.turn) { return; }
      var ox = Math.min(R.x1, A.x1) - Math.max(R.x0, A.x0), oy = Math.min(R.y1, A.y1) - Math.max(R.y0, A.y0);
      if (ox < 0.5 * P || oy < 0.5 * P) { return; }
      var k = atticSlope(kind, Math.min(R.x1 - R.x0, R.y1 - R.y0) / 2 / P);
      if (!(k > 0)) { return; }
      out.forEach(function (o) {
        if (o === R || (R.cover && o.cover === R.cover)) { o.k = Math.max(o.k || pitch, k); }
      });
    });
  }

  // ---- the roof as it is drawn ----------------------------------------------------------------
  // Every roof (roofPlan, its faces as roofFaces makes them): the planes of
  // its slopes, z = a x + b y + c in the ground floor's numbers.  Over a spot
  // a roof is the lowest of its planes (a gable's two, a hip's four, a
  // gambrel's or a mansard's more); where two roofs overlap, the higher.
  var atticRoofKept = { pic: null, key: "", list: [] };
  function atticWallTop(floors) {
    return function (r) {
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, up = f && typeof floorOver === "function" ? floorOver(floors, f) : null;
      return Math.max(ceilOf(r) * FLOOR_PX, up ? up.z - f.z : 0);
    };
  }
  function atticRoofs() {
    var pic = typeof V3 !== "undefined" && V3 ? V3.picture : null;
    var key = [hand.nodes.length, typeof styleRoofShape === "function" ? styleRoofShape() : "", typeof stylePitch === "function" ? stylePitch() : "", houseOpt("roof")].join("|");
    if (pic && atticRoofKept.pic === pic && atticRoofKept.key === key) { return atticRoofKept.list; }
    var list = atticRoofsWith(floorsOf(), []);
    atticRoofKept = { pic: pic, key: key, list: list };
    return list;
  }
  function atticRect3(floors, a) {
    var f = floors && floors.length ? floorAt(floors, a.x, a.y) : null, q = turned(a), x = a.x + (f ? f.dx : 0), y = a.y + (f ? f.dy : 0);
    return { x0: x - q.w / 2, x1: x + q.w / 2, y0: y - q.h / 2, y1: y + q.h / 2 };
  }
  // The roofs as roofPlan makes them with the attics there are, and those
  // about to be made (`extra`: [{ A, kind, of }], A in the ground floor's
  // numbers) -- each as steep as they need, its shape as it will be.
  function atticRoofsWith(floors, extra) {
    var rooms = atticRooms(), keep = hand.nodes, was = atticHiding, list = [];
    atticHiding = rooms.concat(extra.map(function (e) { return { kind: "i_room", attic: e.kind, atticOf: e.of }; }));
    try {
      hand.nodes = keep.filter(function (n) { return !(n.kind === "i_room" && n.attic); });
      var plan = roofPlan(floors, null, atticWallTop(floors));
      rooms.forEach(function (a) { atticSteepen(plan, atticRect3(floors, a), a.attic); });
      extra.forEach(function (e) { atticSteepen(plan, e.A, e.kind); });
      list = atticRoofsOf(plan);
    } finally { hand.nodes = keep; atticHiding = was; }
    return list;
  }
  // Where in `rect` ({ l, r, t, b }, the ground floor's numbers) an attic of
  // `kind` over a floor at `z0` has the roof over it high enough: a room
  // between its knee walls; storage wherever it can be stood in, or null.
  function atticFits(rect, z0, kind, of, floors) {
    var P = FLOOR_PX, A = { x0: rect.l, x1: rect.r, y0: rect.t, y1: rect.b };
    var list = atticRoofsWith(floors, [{ A: A, kind: kind, of: of }]).filter(function (o) {
      var R = o.R; return R.x0 < A.x1 - 1 && R.x1 > A.x0 + 1 && R.y0 < A.y1 - 1 && R.y1 > A.y0 + 1;
    });
    if (!list.length) { return null; }
    var need = kind === "room" ? (ATTIC_KNEE.room + ATTIC_UNDER) * P + 1 : (1.0 + ATTIC_UNDER) * P;
    var got = atticRoomUnder(list, A, z0, need);
    if (!got || got.x1 - got.x0 < (kind === "room" ? 2.4 : 0.8) * P || got.y1 - got.y0 < (kind === "room" ? 2.4 : 0.8) * P) { return null; }
    return kind === "room" ? { l: Math.round(got.x0), r: Math.round(got.x1), t: Math.round(got.y0), b: Math.round(got.y1) } : rect;
  }
  function atticRoofsOf(plan) {
    var probe = { roof: true, color: "#808080", edge: "#404040", atticProbe: true }, list = [];
    // (worked out, not drawn: the solar panels' list of roofs left as it was, 40-solar.js)
    var solarWas = typeof solarFaces !== "undefined" && solarFaces ? solarFaces.length : -1;
    try {
      plan.forEach(function (R) {
        if (R.turn) { return; }
        var tmp = [], planes = [];
        roofFaces(tmp, R, 0, probe);
        tmp.forEach(function (f) {
          if (!f.roof || !f.how || !f.how.atticProbe || !f.n || f.n[2] < 0.05 || !f.pts || f.pts.length < 3) { return; }
          var n = f.n, p = f.pts[0], a = -n[0] / n[2], b = -n[1] / n[2], c = p[2] - a * p[0] - b * p[1];
          if (planes.some(function (q) { return Math.abs(q[0] - a) < 1e-3 && Math.abs(q[1] - b) < 1e-3 && Math.abs(q[2] - c) < 0.5; })) { return; }
          planes.push([a, b, c]);
        });
        if (planes.length) { list.push({ R: R, planes: planes }); }
      });
    } finally { if (solarWas >= 0 && solarFaces.length > solarWas) { solarFaces.length = solarWas; } }
    return list;
  }
  function atticRoofZ(list, x, y) {
    var best = -Infinity;
    for (var i = 0; i < list.length; i++) {
      var o = list[i], R = o.R;
      if (x < R.x0 - 1 || x > R.x1 + 1 || y < R.y0 - 1 || y > R.y1 + 1) { continue; }
      var z = Infinity;
      for (var j = 0; j < o.planes.length; j++) { var p = o.planes[j]; z = Math.min(z, p[0] * x + p[1] * y + p[2]); }
      if (z > best) { best = z; }
    }
    return best;
  }
  // A flat polygon of [x, y] points, the part of it where a*x + b*y <= c.
  function atticCut(pts, a, b, c) {
    if (!pts) { return null; }
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], q = pts[(i + 1) % pts.length], dp = a * p[0] + b * p[1] - c, dq = a * q[0] + b * q[1] - c;
      if (dp <= 1e-6) { out.push(p); }
      if ((dp < -1e-6 && dq > 1e-6) || (dp > 1e-6 && dq < -1e-6)) { var t = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    if (out.length < 3) { return null; }
    var s = 0;
    for (var k = 0; k < out.length; k++) { var u = out[k], w = out[(k + 1) % out.length]; s += u[0] * w[1] - w[0] * u[1]; }
    return Math.abs(s) > 1 ? out : null;
  }
  function atticRectPoly(B) { return [[B.x0, B.y0], [B.x1, B.y0], [B.x1, B.y1], [B.x0, B.y1]]; }
  // The pieces of the roofs over a rectangle: each slope where it is the lowest of its roof's.
  function atticPieces(list, B) {
    var out = [];
    list.forEach(function (o) {
      var R = o.R, base = atticCut(atticCut(atticCut(atticCut(atticRectPoly(B), 1, 0, R.x1), -1, 0, -R.x0), 0, 1, R.y1), 0, -1, -R.y0);
      if (!base) { return; }
      o.planes.forEach(function (p, i) {
        var poly = base;
        o.planes.forEach(function (r, j) { if (j !== i && poly) { poly = atticCut(poly, p[0] - r[0], p[1] - r[1], r[2] - p[2]); } });
        if (poly) { out.push({ poly: poly, plane: p }); }
      });
    });
    return out;
  }
  // The rectangle within B where the roof is at least `h` over `z0` (the
  // biggest box of it, by the roof sampled across it), or null.
  function atticRoomUnder(list, B, z0, h) {
    var P = FLOOR_PX, step = 0.25 * P, nx = Math.max(2, Math.ceil((B.x1 - B.x0) / step)), ny = Math.max(2, Math.ceil((B.y1 - B.y0) / step));
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (var i = 0; i <= nx; i++) {
      for (var j = 0; j <= ny; j++) {
        var x = B.x0 + (B.x1 - B.x0) * i / nx, y = B.y0 + (B.y1 - B.y0) * j / ny;
        if (atticRoofZ(list, x, y) - z0 >= h) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      }
    }
    return x0 < x1 && y0 < y1 ? { x0: x0, x1: x1, y0: y0, y1: y1 } : null;
  }

  // ---- in 3D: inside it ---------------------------------------------------------------------------
  // A finished attic's walls only as high as its knee walls; over them the
  // underside of the roof (and flat across the top), its ends carried up to
  // it -- a window in each where the roof's gable has one.  A storage attic
  // has no walls: the roof comes down to its floor at the eaves.
  var atticWallHow = {};
  if (typeof v3Wall === "function") {
    var v3WallAttic = v3Wall;
    v3Wall = function (faces, room, edge, T, holes, how, low, wallTop, keep) {
      if (room && room.attic) {
        atticWallHow[room.id] = how;
        if (room.attic !== "room") { return; }
        if (!low) { wallTop = Math.min(wallTop || ceilOf(room) * FLOOR_PX, Math.max(1, atticKnee(room) * FLOOR_PX)); }
        return v3WallAttic.call(this, faces, room, edge, T, holes, how, low, wallTop, keep, arguments[9]);
      }
      return v3WallAttic.apply(this, arguments);
    };
  }
  if (typeof wallBeams === "function") {
    var wallBeamsAttic = wallBeams;
    wallBeams = function (faces, room, edge) {
      var out = wallBeamsAttic.apply(this, arguments);
      if (room && room.attic && edge === "top") {
        try { atticInside(faces, room); } catch (e) { if (window.console && console.warn) { console.warn("attic:", e && e.message); } }
      }
      return out;
    };
  }
  // A flat polygon of [s, z] points, the part of it where a*s + b*z <= c.
  function atticClip(pts, a, b, c) {
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], q = pts[(i + 1) % pts.length], dp = a * p[0] + b * p[1] - c, dq = a * q[0] + b * q[1] - c;
      if (dp <= 1e-6) { out.push(p); }
      if ((dp < -1e-6 && dq > 1e-6) || (dp > 1e-6 && dq < -1e-6)) { var t = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out.length >= 3 ? out : null;
  }
  // A polygon less rectangles ([s0, s1, z0, z1] each): what is left, in pieces.
  function atticMinus(poly, holes) {
    var pieces = [poly];
    holes.forEach(function (h) {
      var next = [];
      pieces.forEach(function (p) {
        [atticClip(p, 1, 0, h[0]), atticClip(p, -1, 0, -h[1]),
         atticClip(atticClip(atticClip(p, -1, 0, -h[0]) || [], 1, 0, h[1]) || [], 0, -1, -h[3]),
         atticClip(atticClip(atticClip(p, -1, 0, -h[0]) || [], 1, 0, h[1]) || [], 0, 1, h[2])].forEach(function (q) { if (q) { next.push(q); } });
      });
      pieces = next;
    });
    return pieces;
  }
  // What stands in a room's wall along `edge`: its doors and windows, as [a, b] along it.
  function atticHoles(room, edge, T, top) {
    var P = FLOOR_PX, out = [], reach = Math.max(room.w, room.h) / 2 + 40;
    hand.nodes.forEach(function (m) {
      if ((!WALK_DOORS[m.kind] && m.kind !== "i_window") || Math.abs(m.x - room.x) > reach || Math.abs(m.y - room.y) > reach) { return; }
      var h = v3Hole(room, edge, T, m);
      if (h) { out.push(m.kind === "i_window" ? [h.a, h.b, SILL * P, top] : [h.a, h.b, -1, DOOR_TALL * P + 0.03 * P]); }
    });
    return out;
  }
  // Inside, from the roof over it as it is drawn (atticRoofs): its
  // underside -- bare boards over storage, a ceiling over a room, flat across
  // the top -- just under the roof's own planes; a room's ends carried up to
  // it, less their windows; storage's rafters, its insulation and boards.
  function atticNormal(pts) {
    var nx = 0, ny = 0, nz = 0;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
    }
    var l = Math.hypot(nx, ny, nz) || 1;
    return [nx / l, ny / l, nz / l];
  }
  // (points [s, z] along a wall: those in a straight line with their neighbours left out)
  function atticSimplify(pts) {
    var out = [];
    pts.forEach(function (p) {
      var a = out[out.length - 2], b = out[out.length - 1];
      if (b && Math.abs(p[0] - b[0]) + Math.abs(p[1] - b[1]) < 0.2) { return; }
      if (a && b && Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) < 0.5) { out[out.length - 1] = p; return; }
      out.push(p);
    });
    return out;
  }
  function atticInside(faces, room) {
    var P = FLOOR_PX, finished = room.attic === "room", T = Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06));
    var ceil = ceilOf(room) * P, flat = finished ? ceil : Infinity, top = Math.min(DOOR_TALL * P, ceil - 0.1 * P);
    // (the room's own flat ceiling, put up just before, taken down: the roof's
    // underside in its place.  Found by its middle -- by its first corner, a
    // corner of the room, it was never inside it: it was left up, 2026-10-04,
    // and stood out of the roof along both eaves, dark from above.)
    var ceilHow = null;
    for (var i = faces.length - 1, seen = 0; i >= 0 && seen < 1500; i--, seen++) {
      var fc = faces[i];
      if (!fc.pts || !fc.pts.length || !(fc.ceiling || (fc.how && fc.how.caster)) || (fc.node && fc.node !== room)) { continue; }
      var p0 = [0, 0, fc.pts[0][2]];
      fc.pts.forEach(function (p) { p0[0] += p[0] / fc.pts.length; p0[1] += p[1] / fc.pts.length; });
      if (insideArea(room, p0[0], p0[1], -3) && p0[2] > ceil - 2 && p0[2] < ceil + 0.4 * P) {
        if (fc.ceiling) { ceilHow = ceilHow || fc.how; }
        faces.splice(i, 1);
      }
    }
    var wallHow = atticWallHow[room.id] || { wall: true, color: "#f2efe8", edge: "#9a958c" };
    if (!finished) { ceilHow = { piece: true, color: "#c9a877", edge: v3Mix("#c9a877", "#000000", 0.3), pat: 21, ceiling: true }; }   // the roof's boards, bare
    ceilHow = ceilHow || { ceiling: true, color: "#f4f2ee", edge: "#9a958c" };
    var floors = floorsOf(), f = floors.length ? floorAt(floors, room.x, room.y) : null;
    var dx = f ? f.dx : 0, dy = f ? f.dy : 0, z0 = f ? f.z : 0, q = turned(room);
    var B = { x0: room.x + dx - q.w / 2, x1: room.x + dx + q.w / 2, y0: room.y + dy - q.h / 2, y1: room.y + dy + q.h / 2 };
    var roofs = atticRoofs().filter(function (o) { var R = o.R; return R.x0 < B.x1 - 1 && R.x1 > B.x0 + 1 && R.y0 < B.y1 - 1 && R.y1 > B.y0 + 1; });
    if (!roofs.length) { return; }
    var under = ATTIC_UNDER * P, C = { faces: faces, room: room, B: B, roofs: roofs, dx: dx, dy: dy, z0: z0, under: under };
    function L(x, y, z) { return [x - dx, y - dy, z - z0]; }
    // (a ceiling facing down into the room, an end wall facing in across it)
    function face(pts3, how, down) {
      var n = atticNormal(pts3);
      if (down && n[2] > 0) { n = [-n[0], -n[1], -n[2]]; }
      if (!down && n[0] * (room.x - pts3[0][0]) + n[1] * (room.y - pts3[0][1]) < 0) { n = [-n[0], -n[1], -n[2]]; }
      faces.push({ pts: pts3, n: n, how: how, ceiling: down && how === ceilHow });
    }
    // the underside of each slope over it -- none of it under the floor, by the
    // eaves -- and in a room, flat across where the slopes are over its ceiling
    var hiZ = z0 + flat + under, pieces = atticPieces(roofs, B);
    // (the roof lifted off, looked at from above: no ceiling over it either -- looked into, as the rooms under it are)
    var lidded = typeof V3 === "undefined" || !V3 || V3.mode === "walk" || (V3.roof !== false && (V3.roofV === undefined || V3.roofV > 0.5));
    if (lidded) pieces.forEach(function (pc) {
      var p = pc.plane, poly = atticCut(pc.poly, -p[0], -p[1], p[2] - z0 - under - 0.02 * P);
      if (!poly) { return; }
      var low = finished ? atticCut(poly, p[0], p[1], hiZ - p[2]) : poly;
      if (low) { face(low.map(function (v) { return L(v[0], v[1], p[0] * v[0] + p[1] * v[1] + p[2] - under); }), ceilHow, true); }
      if (finished) {
        var high = atticCut(poly, -p[0], -p[1], p[2] - hiZ);
        if (high) { face(high.map(function (v) { return L(v[0], v[1], z0 + flat); }), ceilHow, true); }
      }
    });
    if (finished) {
      // its ends: the wall carried up from its knee walls to the slopes (or the
      // flat ceiling) along it -- where the roof rises along that side
      var knee = atticKnee(room) * P;
      [["top", true, -1], ["foot", true, 1], ["left", false, -1], ["right", false, 1]].forEach(function (e) {
        var along = e[1], side = e[2], len = along ? room.w : room.h;
        function W(s) {
          return v3Local(room, along ? -room.w / 2 + s : side * (room.w / 2 - T), along ? side * (room.h / 2 - T) : -room.h / 2 + s);
        }
        var prof = [], n = Math.max(8, Math.ceil(len / (0.2 * P)));
        for (var k = 0; k <= n; k++) {
          var s = len * k / n, w = W(s);
          prof.push([s, Math.min(flat, atticRoofZ(roofs, w[0] + dx, w[1] + dy) - z0 - under)]);
        }
        if (!prof.some(function (p) { return p[1] > knee + 0.1 * P; })) { return; }     // a knee wall's side: the slope comes down to it
        var outline = atticSimplify([[0, knee]].concat(prof.map(function (p) { return [p[0], Math.max(knee, p[1])]; }), [[len, knee]]));
        atticMinus(outline, atticHoles(room, e[0], T, top)).forEach(function (piece) {
          face(piece.map(function (v) { var w = W(v[0]); return [w[0], w[1], v[1]]; }), wallHow, false);
        });
      });
      if (lidded && typeof structShown === "function" && structShown()) {
        atticRafterRods(C, pieces, structLook(structKind() === "steel" ? "steel" : "timber"), 0.07 * P, 1.2 * P, hiZ);
      }
    } else {
      atticStorage(C, lidded ? pieces : []);
    }
  }
  // Rafters up each slope over the room, `gap` apart, just under its boards (and under `capZ`).
  function atticRafterRods(C, pieces, how, r, gap, capZ) {
    if (typeof powerRod !== "function") { return; }
    var P = FLOOR_PX;
    pieces.forEach(function (pc) {
      var p = pc.plane, g = Math.hypot(p[0], p[1]);
      if (g < 1e-4) { return; }                                   // a flat top: no rafters
      var ux = p[0] / g, uy = p[1] / g, tx = -uy, ty = ux;        // up the slope, and across it
      var poly = atticCut(pc.poly, -p[0], -p[1], p[2] - C.z0 - C.under - 0.08 * P);
      if (poly && capZ < Infinity) { poly = atticCut(poly, p[0], p[1], capZ - p[2]); }
      if (!poly) { return; }
      var s0 = Infinity, s1 = -Infinity;
      poly.forEach(function (v) { var s = v[0] * tx + v[1] * ty; s0 = Math.min(s0, s); s1 = Math.max(s1, s); });
      for (var s = s0 + gap / 2; s < s1; s += gap) {
        var u0 = Infinity, u1 = -Infinity;
        for (var i = 0; i < poly.length; i++) {
          var a = poly[i], b = poly[(i + 1) % poly.length], da = a[0] * tx + a[1] * ty - s, db = b[0] * tx + b[1] * ty - s;
          if ((da <= 0 && db >= 0) || (da >= 0 && db <= 0)) {
            var t = Math.abs(da - db) < 1e-9 ? 0 : da / (da - db), x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, u = x * ux + y * uy;
            u0 = Math.min(u0, u); u1 = Math.max(u1, u);
          }
        }
        if (!(u1 - u0 > 0.2 * P)) { continue; }
        var A = [s * tx + u0 * ux, s * ty + u0 * uy], Bp = [s * tx + u1 * ux, s * ty + u1 * uy];
        var zA = p[0] * A[0] + p[1] * A[1] + p[2] - C.under - r, zB = p[0] * Bp[0] + p[1] * Bp[1] + p[2] - C.under - r;
        powerRod(C.faces, [A[0] - C.dx, A[1] - C.dy, zA - C.z0], [Bp[0] - C.dx, Bp[1] - C.dy, zB - C.z0], r, how, 4);
      }
    });
  }
  // Storage: the rafters showing under the roof's boards, the joists' bays
  // filled with insulation wherever it is deep enough under the roof, boards
  // to walk on down the middle of where it is highest -- round the way up.
  function atticStorage(C, pieces) {
    var P = FLOOR_PX, faces = C.faces, room = C.room, B = C.B;
    var wood = { piece: true, color: "#b98e5c", edge: "#6b4f33", pat: 21 };
    var fluff = { piece: true, color: "#f2b6c1", edge: "#c98c98", insulation: true };
    var boards = { piece: true, color: "#d7b98c", edge: "#8a6d48", pat: 21 };
    atticRafterRods(C, pieces, wood, 0.035 * P, 0.6 * P, Infinity);
    // the way up through the floor, in the ground floor's numbers
    var hatch = hand.nodes.filter(function (n) { return n.kind === "i_stairs" && n.attic && insideArea(room, n.x, n.y); })[0], hx = null;
    if (hatch) { var t = turned(hatch); hx = [hatch.x + C.dx - t.w / 2 - 6, hatch.x + C.dx + t.w / 2 + 6, hatch.y + C.dy - t.h / 2 - 6, hatch.y + C.dy + t.h / 2 + 6]; }
    function hits(x0, x1, y0, y1) { return hx && x0 < hx[1] && x1 > hx[0] && y0 < hx[3] && y1 > hx[2]; }
    function slab(x0, x1, y0, y1, z1, how) {
      var parts = [[x0, x1, y0, y1]];
      if (hits(x0, x1, y0, y1)) {
        parts = [[x0, Math.min(x1, hx[0]), y0, y1], [Math.max(x0, hx[1]), x1, y0, y1],
                 [Math.max(x0, hx[0]), Math.min(x1, hx[1]), y0, Math.min(y1, hx[2])], [Math.max(x0, hx[0]), Math.min(x1, hx[1]), Math.max(y0, hx[3]), y1]];
      }
      parts.forEach(function (q) {
        if (q[1] - q[0] < 1 || q[3] - q[2] < 1) { return; }
        v3Prism(faces, [[q[0] - C.dx, q[2] - C.dy], [q[1] - C.dx, q[2] - C.dy], [q[1] - C.dx, q[3] - C.dy], [q[0] - C.dx, q[3] - C.dy]], 0.2, z1, how);
      });
    }
    // how high the roof's underside is over the floor, across it
    var cell = 0.6 * P, nx = Math.max(1, Math.round((B.x1 - B.x0) / cell)), ny = Math.max(1, Math.round((B.y1 - B.y0) / cell));
    var cw = (B.x1 - B.x0) / nx, ch = (B.y1 - B.y0) / ny, H = [], most = 0;
    for (var i = 0; i <= nx; i++) {
      H.push([]);
      for (var j = 0; j <= ny; j++) {
        var h = atticRoofZ(C.roofs, B.x0 + i * cw, B.y0 + j * ch) - C.z0 - C.under;
        H[i].push(h); most = Math.max(most, h);
      }
    }
    function low(i, j) { return Math.min(H[i][j], H[i + 1][j], H[i][j + 1], H[i + 1][j + 1]); }
    // the boards: down the middle of where it is highest, the long way of that
    var hb = null;
    for (i = 0; i < nx; i++) {
      for (j = 0; j < ny; j++) {
        if (low(i, j) < most * 0.7) { continue; }
        var x0 = B.x0 + i * cw, y0 = B.y0 + j * ch;
        hb = hb ? { x0: Math.min(hb.x0, x0), x1: Math.max(hb.x1, x0 + cw), y0: Math.min(hb.y0, y0), y1: Math.max(hb.y1, y0 + ch) } : { x0: x0, x1: x0 + cw, y0: y0, y1: y0 + ch };
      }
    }
    var walk = null;
    if (hb && most > 0.9 * P) {
      var mx = (hb.x0 + hb.x1) / 2, my = (hb.y0 + hb.y1) / 2, half = 0.35 * P;
      walk = hb.x1 - hb.x0 >= hb.y1 - hb.y0 ? { x0: Math.max(B.x0 + 0.2 * P, hb.x0), x1: Math.min(B.x1 - 0.2 * P, hb.x1), y0: my - half, y1: my + half }
                                            : { x0: mx - half, x1: mx + half, y0: Math.max(B.y0 + 0.2 * P, hb.y0), y1: Math.min(B.y1 - 0.2 * P, hb.y1) };
      slab(walk.x0, walk.x1, walk.y0, walk.y1, 0.25 * P, boards);
    }
    // the insulation, a row of bays at a time, wherever the roof is over its depth
    var deep = 0.24 * P;
    for (j = 0; j < ny; j++) {
      var run = null;
      for (i = 0; i <= nx; i++) {
        var cx0 = B.x0 + i * cw, cy0 = B.y0 + j * ch, ok = false;
        if (i < nx) {
          ok = low(i, j) >= deep + 0.06 * P;
          if (ok && walk && cx0 < walk.x1 && cx0 + cw > walk.x0 && cy0 < walk.y1 && cy0 + ch > walk.y0) { ok = false; }
        }
        if (ok) { if (run) { run[1] = cx0 + cw; } else { run = [cx0, cx0 + cw]; } continue; }
        if (run) { slab(run[0], run[1], cy0, cy0 + ch, deep, fluff); run = null; }
      }
    }
  }

  // ---- out of doors round it ----------------------------------------------------------------------
  // A wall is an outside wall where what is beyond it is no room at its own
  // height: the upstairs wall over a garage of one storey is in the open over
  // the garage's roof (the garage under it, and the loft up in its roof, made
  // it a wall indoors -- painted, panelled, over the garage, 2026-10-04).
  if (typeof gl3Outside === "function") {
    var gl3OutsideAttic = gl3Outside;
    // (an attic room's own wall too: where it stands in the gable, out to the
    // open, it is the gable's -- painted as indoors it showed through it, a
    // grey band over the garage roof; into the attic, indoors)
    gl3Outside = function (f, rooms) {
      if (gl3OutsideAttic.apply(this, arguments)) { return true; }
      if (!f.pts || !f.pts.length) { return false; }
      var cx = 0, cy = 0, cz = 0, P = FLOOR_PX, floors = floorsOf(), own = f.node && f.node.attic ? f.node : null;
      f.pts.forEach(function (p) { cx += p[0] / f.pts.length; cy += p[1] / f.pts.length; cz += p[2] / f.pts.length; });
      var x = cx + f.n[0] * 9, y = cy + f.n[1] * 9;
      var near = rooms.near ? rooms.near.around(x, y, x, y).map(function (o) { return o.r; }) : rooms;
      return !near.some(function (r) {
        if ((r.n && (r.n.attic || r.n.court) && r.n !== own) || !insideArea(r.n, x - r.dx, y - r.dy)) { return false; }
        var fl = floors.length ? floorAt(floors, r.n.x, r.n.y) : null, z0 = fl ? fl.z : 0;
        var up = fl && typeof floorOver === "function" ? floorOver(floors, fl) : null;
        return cz >= z0 - 2 && cz <= z0 + Math.max(ceilOf(r.n) * P, up ? up.z - fl.z : 0) + 2;
      });
    };
  }
  // From out of doors, roofed, only the walls with the open beyond them are
  // drawn (38-view3d.js): an attic beside a wall -- the loft up in the garage's
  // roof, beside the upstairs hall's end -- is not a room beyond it, and the
  // wall is drawn (it was left out, a gap in the wall over the garage roof).
  if (typeof wallKeepOpen === "function") {
    var wallKeepOpenAttic = wallKeepOpen;
    wallKeepOpen = function (room, edge, base) {
      if (base && room && !room.attic && !room.court && airRooms().length) { base = atticOpenOnly(room); }
      return wallKeepOpenAttic.call(this, room, edge, base);
    };
  }
  function atticOpenOnly(room) {
    var hw = room.w / 2, hh = room.h / 2, reach = Math.max(room.w, room.h) / 2 + 20;
    var others = hand.nodes.filter(function (o) {
      return o.kind === "i_room" && o !== room && !o.attic && !o.court && Math.abs(o.x - room.x) < reach + Math.max(o.w, o.h) / 2 && Math.abs(o.y - room.y) < reach + Math.max(o.w, o.h) / 2;
    });
    return function (edge, a, b) {
      var runs = [], start = null;
      for (var at = a; ; at = Math.min(b, at + 4)) {
        var lx = edge === "left" ? -hw - 6 : edge === "right" ? hw + 6 : -hw + at;
        var ly = edge === "top" ? -hh - 6 : edge === "foot" ? hh + 6 : -hh + at;
        var pt = v3Local(room, lx, ly);
        var open = !others.some(function (o) { return insideArea(o, pt[0], pt[1]); });
        if (open && start === null) { start = at; }
        if (!open && start !== null) { runs.push([start, at]); start = null; }
        if (at >= b) { break; }
      }
      if (start !== null) { runs.push([start, b]); }
      return runs;
    };
  }
  // Nothing in an attic up through the roof: a piece taller than the roof
  // where it stands is not drawn (the roof is the house's own, made steep
  // enough for the attic; what is put up there is put where it is highest).
  if (typeof v3Build === "function") {
    var v3BuildAtticKeep = v3Build;
    v3Build = function () {
      var model = v3BuildAtticKeep.apply(this, arguments);
      try {
        if (model && model.faces && typeof V3 !== "undefined" && V3 && V3.scene !== "space" && atticRooms().length) { atticKeepUnder(model); }
      } catch (e) { /* as it was */ }
      return model;
    };
  }
  function atticKeepUnder(model) {
    var floors = floorsOf(), rooms = atticRooms(), roofs = atticRoofs(), P = FLOOR_PX, held = new Map(), tops = new Map();
    if (!roofs.length) { return; }
    function holder(n) {
      if (held.has(n)) { return held.get(n); }
      var got = null;
      if (n.kind !== "i_room" && n.kind !== "i_floor" && n.kind !== "i_lot" && !WALK_DOORS[n.kind] && n.kind !== "i_window" && n.x !== undefined) {
        var f = floors.length ? floorAt(floors, n.x, n.y) : null;
        got = rooms.filter(function (r) { return (floors.length ? floorAt(floors, r.x, r.y) : null) === f && insideArea(r, n.x, n.y, 2); })[0] || null;
        if (got) { got = { f: f }; }
      }
      held.set(n, got);
      return got;
    }
    // each piece's top, from its faces (a model's from its own points)
    model.faces.forEach(function (fc) {
      var n = fc.node;
      if (!n || !fc.pts || !holder(n)) { return; }
      var top = -Infinity;
      if (fc.mesh && fc.mesh.p) {
        var m = fc.mesh, hi = m.zTop;
        if (hi === undefined) { hi = -Infinity; for (var i = 2; i < m.p.length; i += 3) { hi = Math.max(hi, m.p[i]); } m.zTop = hi; }
        top = fc.pts[0][2] - (m.base ? m.base[2] : 0) + ((m.xf && m.xf[4]) || 0) + hi;
      } else {
        fc.pts.forEach(function (p) { top = Math.max(top, p[2]); });
      }
      tops.set(n, Math.max(tops.get(n) === undefined ? -Infinity : tops.get(n), top));
    });
    var out = new Set();
    tops.forEach(function (top, n) {
      var h = holder(n), dx = h.f ? h.f.dx : 0, dy = h.f ? h.f.dy : 0, t = turned(n), lo = Infinity;
      [[0, 0], [-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (k) {
        lo = Math.min(lo, atticRoofZ(roofs, n.x + dx + k[0] * t.w / 2, n.y + dy + k[1] * t.h / 2));
      });
      if (top > lo - ATTIC_UNDER * P) { out.add(n); }
    });
    if (out.size) { model.faces = model.faces.filter(function (fc) { return !fc.node || !out.has(fc.node); }); }
  }

  // ---- a window in the roof's gable, where the attic has one --------------------------------------
  // (the roof's own end walls, 39-styles.js: cut round the window, as the
  // attic's inside ones are)
  var atticPics = { pic: null, wins: [] };
  function atticWindows() {
    var pic = typeof V3 !== "undefined" && V3 ? V3.picture : null;
    if (pic && atticPics.pic === pic) { return atticPics.wins; }
    var P = FLOOR_PX, floors = typeof floorsOf === "function" ? floorsOf() : [], wins = [];
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_window" || !n.attic) { return; }
      var f = floors.length ? floorAt(floors, n.x, n.y) : null, x = n.x + (f ? f.dx : 0), y = n.y + (f ? f.dy : 0), t = turned(n);
      var room = atticRooms().filter(function (r) { return insideArea(r, n.x, n.y, 12); })[0];
      var top = Math.min(DOOR_TALL * P, (room ? ceilOf(room) : 2.3) * P - 0.1 * P), z = f ? f.z : 0;
      // across its wall: the wall it stands in runs the long way of its box
      var upDown = t.h > t.w;
      wins.push({ x: x, y: y, plane: upDown ? "x" : "y", s0: (upDown ? y - t.h / 2 : x - t.w / 2), s1: (upDown ? y + t.h / 2 : x + t.w / 2),
                  z0: z + SILL * P, z1: z + top });
    });
    atticPics = { pic: pic, wins: wins };
    return wins;
  }
  if (typeof styleGable === "function") {
    var styleGableAttic = styleGable;
    styleGable = function (faces, R) {
      var f0 = faces.length, out = styleGableAttic.apply(this, arguments);
      try { if (atticRooms().length) { atticGableHoles(faces, f0); } } catch (e) { /* the ends whole */ }
      return out;
    };
  }
  function atticGableHoles(faces, f0) {
    var wins = atticWindows();
    if (!wins.length) { return; }
    for (var i = faces.length - 1; i >= f0; i--) {
      var f = faces[i];
      if (!f.how || !f.how.wall || !f.pts || f.pts.length < 3) { continue; }
      var xs = f.pts.map(function (p) { return p[0]; }), ys = f.pts.map(function (p) { return p[1]; });
      var flatX = Math.max.apply(null, xs) - Math.min.apply(null, xs) < 0.5, flatY = Math.max.apply(null, ys) - Math.min.apply(null, ys) < 0.5;
      if (!flatX && !flatY) { continue; }
      var at = flatX ? xs[0] : ys[0];
      var holes = wins.filter(function (w) { return w.plane === (flatX ? "x" : "y") && Math.abs((flatX ? w.x : w.y) - at) < 0.35 * FLOOR_PX; })
        .map(function (w) { return [w.s0, w.s1, w.z0, w.z1]; });
      if (!holes.length) { continue; }
      var poly = f.pts.map(function (p) { return [flatX ? p[1] : p[0], p[2]]; });
      var pieces = atticMinus(poly, holes).map(function (q) {
        return Object.assign({}, f, { pts: q.map(function (s) { return flatX ? [at, s[0], s[1]] : [s[0], at, s[1]]; }) });
      });
      Array.prototype.splice.apply(faces, [i, 1].concat(pieces));
    }
  }

  // ---- its ladder: folded down out of the ceiling ----------------------------------------------
  var atticEnds = { pic: null, ends: {} };
  function atticEndOf(n) {
    var pic = typeof V3 !== "undefined" && V3 ? V3.picture : null;
    if (!pic || atticEnds.pic !== pic) {
      var ends = {}, floors = floorsOf();
      floorLinks(floors).forEach(function (pair) {
        if (!pair[0].ladder && !pair[1].ladder) { return; }
        var fa = floorAt(floors, pair[0].x, pair[0].y), fb = floorAt(floors, pair[1].x, pair[1].y);
        ends[pair[0].id] = { end: "low", rise: fb && fa ? fb.z - fa.z : 2.9 * FLOOR_PX };
        ends[pair[1].id] = { end: "high" };
      });
      atticEnds = { pic: pic, ends: ends };
    }
    return atticEnds.ends[n.id] || null;
  }
  if (typeof v3ModelPut === "function") {
    var v3ModelPutAttic = v3ModelPut;
    v3ModelPut = function (faces, n, under, ceilAt) {
      if (n && n.kind === "i_stairs" && n.ladder && typeof modelsOn === "function" && modelsOn()) {
        try { if (atticLadder(faces, n, ceilAt)) { return true; } } catch (e) { /* as stairs */ }
      }
      return v3ModelPutAttic.apply(this, arguments);
    };
  }
  function atticLadder(faces, n, ceilAt) {
    var end = atticEndOf(n);
    if (!end) { return false; }
    var P = FLOOR_PX, hw = n.w / 2, hh = n.h / 2, pine = { piece: true, color: "#c9a26b", edge: "#7a5f3a", pat: 21 };
    var trim = { piece: true, color: typeof styleTrim === "function" ? styleTrim("#f1eee8") : "#f1eee8", edge: "#9a958c" };
    function at(lx, ly, z) { var w = v3Local(n, lx, ly); return [w[0], w[1], z]; }
    if (end.end === "high") {
      // the opening in the attic's floor, boxed round
      [[-hw - 2, hw + 2, -hh - 2, -hh], [-hw - 2, hw + 2, hh, hh + 2], [-hw - 2, -hw, -hh, hh], [hw, hw + 2, -hh, hh]].forEach(function (q) {
        v3Box(faces, n, q[0], q[1], q[2], q[3], 0, 0.12 * P, pine);
      });
      return true;
    }
    var ceil = ceilAt(n) * P;
    // its frame round the opening, under the ceiling
    [[-hw - 2.5, hw + 2.5, -hh - 2.5, -hh], [-hw - 2.5, hw + 2.5, hh, hh + 2.5], [-hw - 2.5, -hw, -hh, hh], [hw, hw + 2.5, -hh, hh]].forEach(function (q) {
      v3Box(faces, n, q[0], q[1], q[2], q[3], ceil - 0.03 * P, ceil, trim);
    });
    // the ladder: from the far end of the opening down past its near end to
    // the floor, three sections, its rails and treads; the hatch's door on
    // its top section, under it
    var x0 = -hw + 0.08 * P, x1 = hw - 0.08 * P, top = [-hh + 0.05 * P, ceil], foot = [hh + 0.45 * P, 0];
    if (typeof powerRod === "function") {
      [x0, x1].forEach(function (x) { powerRod(faces, at(x, top[0], top[1]), at(x, foot[0], foot[1]), 0.022 * P, pine, 4); });
    }
    var steps = Math.max(6, Math.round(ceil / (0.26 * P)));
    for (var s = 1; s < steps; s++) {
      var t = s / steps, y = top[0] + (foot[0] - top[0]) * t, z = top[1] + (foot[1] - top[1]) * t;
      v3Box(faces, n, x0, x1, y - 0.045 * P, y + 0.045 * P, z - 0.02 * P, z + 0.012 * P, pine);
    }
    var t1 = 0.36, dy = foot[0] - top[0], dz = foot[1] - top[1], back = 0.05 * P;
    var a = at(-hw + 1, top[0] - back * 0.3, top[1] + back), b = at(hw - 1, top[0] - back * 0.3, top[1] + back);
    var c = at(hw - 1, top[0] + dy * t1 - back * 0.3, top[1] + dz * t1 + back), d = at(-hw + 1, top[0] + dy * t1 - back * 0.3, top[1] + dz * t1 + back);
    faces.push({ pts: [a, b, c, d], n: typeof styleNormal === "function" ? styleNormal([a, b, c, d]) : [0, 0, -1], how: trim });
    return true;
  }

  // ---- made: the attic, and what is over the garage -------------------------------------------------
  // The biggest rectangle a set of boxes ({l, r, t, b}) covers between them.
  function atticBiggest(boxes) {
    if (!boxes.length) { return null; }
    function lines(a, b) {
      var v = [], out = [];
      boxes.forEach(function (q) { v.push(q[a], q[b]); });
      v.sort(function (p, q) { return p - q; });
      v.forEach(function (x) { if (!out.length || x - out[out.length - 1] > 3) { out.push(x); } });
      return out;
    }
    var X = lines("l", "r"), Y = lines("t", "b"), best = null, nx = X.length - 1, ny = Y.length - 1, cov = [];
    for (var i = 0; i < nx; i++) {
      cov.push([]);
      for (var j = 0; j < ny; j++) {
        var cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
        cov[i].push(boxes.some(function (q) { return cx > q.l - 2 && cx < q.r + 2 && cy > q.t - 2 && cy < q.b + 2; }));
      }
    }
    for (var i0 = 0; i0 < nx; i0++) {
      var ok = [];
      for (var k = 0; k < ny; k++) { ok.push(true); }
      for (var i1 = i0; i1 < nx; i1++) {
        var run = 0;
        for (k = 0; k < ny; k++) {
          ok[k] = ok[k] && cov[i1][k];
          if (!ok[k]) { run = 0; continue; }
          run++;
          var area = (X[i1 + 1] - X[i0]) * (Y[k + 1] - Y[k - run + 1]);
          if (!best || area > best.area) { best = { l: X[i0], r: X[i1 + 1], t: Y[k - run + 1], b: Y[k + 1], area: area }; }
        }
      }
    }
    return best;
  }
  // What an attic there is now: { attic, garage } -- "none", "storage" or "room".
  function atticNow() {
    var out = { attic: "none", garage: "none" };
    atticRooms().forEach(function (r) {
      if (r.atticOf === "garage") { out.garage = r.attic; } else { out.attic = r.attic; }
    });
    return out;
  }
  // Taken out: the attic rooms, everything in them, their ways up, their
  // windows, and an attic floor left with nothing on it.
  function atticClear() {
    var gone = {}, floors = floorsOf(), rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && n.attic; });
    rooms.forEach(function (r) {
      gone[r.id] = true;
      var fr = floors.length ? floorAt(floors, r.x, r.y) : null;
      hand.nodes.forEach(function (n) {
        if (n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || !insideArea(r, n.x, n.y, 2)) { return; }
        if ((floors.length ? floorAt(floors, n.x, n.y) : null) === fr) { gone[n.id] = true; }
      });
    });
    hand.nodes.forEach(function (n) { if (n.attic && n.kind !== "i_floor") { gone[n.id] = true; } });
    hand.nodes = hand.nodes.filter(function (n) { return !gone[n.id]; });
    // (an attic floor's own Floor, once nothing stands on it)
    hand.nodes = hand.nodes.filter(function (f) {
      if (f.kind !== "i_floor" || !f.attic) { return true; }
      var on = hand.nodes.some(function (n) { return n !== f && n.kind !== "i_floor" && insideArea(f, n.x, n.y); });
      if (!on) { gone[f.id] = true; }
      return on;
    });
    hand.links = hand.links.filter(function (l) { return !gone[l.from] && !gone[l.to]; });
  }
  // Made as asked (`want.attic`, `want.garage`: "none", "storage", "room"),
  // over the house `near` is part of (its rooms), or the house with the most rooms.
  function atticMake(want, near) {
    atticClear();
    var kind = ATTIC_KINDS.indexOf(want.attic) > 0 ? want.attic : "none", gkind = ATTIC_KINDS.indexOf(want.garage) > 0 ? want.garage : "none";
    if (kind === "none" && gkind === "none") { return 0; }
    if (!atticAllowed()) { return 0; }             // a flat roof: no space up in it
    var P = FLOOR_PX, made = 0;
    var floors = floorsOf();
    if (!floors.length) {
      // (one floor, never boxed: a Floor round it, to stand one over)
      var all = hand.nodes.filter(function (n) { return n.kind !== "i_lot"; }), b0 = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      all.forEach(function (n) { var q = turned(n); b0.l = Math.min(b0.l, n.x - q.w / 2); b0.r = Math.max(b0.r, n.x + q.w / 2); b0.t = Math.min(b0.t, n.y - q.h / 2); b0.b = Math.max(b0.b, n.y + q.h / 2); });
      if (b0.l === Infinity) { return 0; }
      var g = { id: hand.next++, kind: "i_floor", text: TXT.fl_ground, x: 0, y: 0, w: 140, h: 46 };
      measure(g);
      g.text = TXT.fl_ground; g.own = true; g.attic = true;
      g.x = Math.round((b0.l + b0.r) / 2); g.y = Math.round((b0.t + b0.b) / 2);
      g.w = Math.round(b0.r - b0.l + 4.8 * P); g.h = Math.round(b0.b - b0.t + 4.8 * P);
      hand.nodes.unshift(g);
      floors = floorsOf();
    }
    // the house: the one `near` is in, else the one with the most rooms
    var count = {}, roomsAll = hand.nodes.filter(function (n) { return n.kind === "i_room" && !n.attic; });
    roomsAll.forEach(function (r) { var f = floorAt(floors, r.x, r.y); if (f) { count[f.bldg] = (count[f.bldg] || 0) + 1; } });
    var bldg = null;
    (near || []).some(function (r) { var f = floorAt(floors, r.x, r.y); if (f) { bldg = f.bldg; } return f; });
    if (bldg === null) { Object.keys(count).forEach(function (k) { if (bldg === null || count[k] > count[bldg]) { bldg = +k; } }); }
    var mine = floors.filter(function (f) { return f.bldg === bldg && f.level >= 0; });
    if (!mine.length) { return 0; }
    var G0 = mine.filter(function (f) { return f.level === 0; })[0] || mine[0];
    var Tf = mine.slice().sort(function (a, b) { return b.level - a.level; })[0];
    var J = typeof tieLayout === "function" ? tieLayout() : null, plan = walkPlan();
    function box(r) {
      var q = (J && J.boxes[r.id]) || tieBox(r), f = floorAt(floors, r.x, r.y), dx = f ? f.dx : 0, dy = f ? f.dy : 0;
      return { l: q.l + dx, r: q.r + dx, t: q.t + dy, b: q.b + dy, f: f, room: r };
    }
    function pieceAt(n) {                // where a piece stands in the house as it stands
      var m = J && J.moves && J.moves[n.id], x = m ? m.x : n.x, y = m ? m.y : n.y;
      if (!m) {
        var holder = roomsAll.filter(function (r) { return insideArea(r, n.x, n.y, 4); }).sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
        var d = holder && J && J.delta[holder.id] ? J.delta[holder.id] : [0, 0];
        x += d[0]; y += d[1];
      }
      var f = floorAt(floors, n.x, n.y);
      return [x + (f ? f.dx : 0), y + (f ? f.dy : 0), f];
    }
    function kindOf(r) { return typeof roomKind === "function" ? roomKind(plan, r) : "room"; }
    var garages = roomsAll.filter(function (r) { var f = floorAt(floors, r.x, r.y); return f && f.bldg === bldg && kindOf(r) === "garage" && !((r.turn || 0) % 90); });
    // where each floor stands now, by its biggest room: after, each Floor put
    // back to it (a Floor grown round a room over the garage lets the house
    // put together come together round another middle, 39-join.js)
    var standing = mine.map(function (f) {
      var ref = roomsAll.filter(function (r) { return floorAt(floors, r.x, r.y) === f; }).sort(function (p, q) { return q.w * q.h - p.w * p.h; })[0];
      if (!ref) { return null; }
      var q = box(ref);
      return { floorNode: f.n, ref: ref, x: (q.l + q.r) / 2, y: (q.t + q.b) / 2 };
    }).filter(Boolean);
    // a Floor over the top one, beside the others on the paper
    var atticFloor = null;
    function floorOver(f) {
      var up = mine.filter(function (o) { return o.level === f.level + 1; })[0];
      if (up) { return { n: up.n, dx: up.dx, dy: up.dy, level: up.level }; }
      if (atticFloor) { return atticFloor; }
      var w = Tf.n.w, h = Tf.n.h, right = -Infinity, y = Tf.n.y;
      hand.nodes.forEach(function (n) {
        var q = turned(n);
        if (n.y + q.h / 2 > y - h / 2 && n.y - q.h / 2 < y + h / 2) { right = Math.max(right, n.x + q.w / 2); }
      });
      var A = { id: hand.next++, kind: "i_floor", text: TXT.fl_attic, x: 0, y: 0, w: 140, h: 46 };
      measure(A);
      A.text = TXT.fl_attic; A.own = true; A.attic = true; A.w = Math.round(w); A.h = Math.round(h);
      if (Tf.n.bldg !== undefined) { A.bldg = Tf.n.bldg; }
      // (room left beside the top floor for its Floor to grow round a room over the garage)
      A.x = Math.round(right + 9 * P + w / 2); A.y = Math.round(y);
      hand.nodes.unshift(A);
      atticFloor = { n: A, dx: G0.n.x - A.x, dy: G0.n.y - A.y, level: Tf.level + 1, made: true };
      return atticFloor;
    }
    function room(F, rect, kind2, of, text, free) {
      var n = { id: hand.next++, kind: "i_room", text: text, x: 0, y: 0, w: 140, h: 46 };
      measure(n);
      n.text = text; n.own = true;
      n.x = Math.round((rect.l + rect.r) / 2 - F.dx); n.y = Math.round((rect.t + rect.b) / 2 - F.dy);
      n.w = Math.round(rect.r - rect.l); n.h = Math.round(rect.b - rect.t);
      n.attic = kind2; n.atticOf = of; n.ceil = ATTIC_FLAT[kind2];
      if (free && !F.made) {
        // (drawn apart -- a house Start building spread out, joined by arrows
        // -- where it goes on the paper may be where another room is drawn:
        // drawn in the nearest place clear of them, its arrow putting it where
        // it goes; the house put together is not centred on it, 39-join.js)
        var fNow2 = floorAt(floors, F.n.x, F.n.y), mates = hand.nodes.filter(function (m) { return m.kind === "i_room" && floorAt(floors, m.x, m.y) === fNow2; });
        // (a floor drawn put together already -- a house Start building
        // folded -- has its rooms wall to wall: only over one is a clash
        // there.  Kept apart from them, it was drawn off its place, and the
        // house put together then centred it on the hall it opens off.)
        var together = !J || mates.every(function (m) { var d = J.delta[m.id]; return !d || Math.abs(d[0]) < 1 && Math.abs(d[1]) < 1; });
        var apart = together ? -4 : 1.2 * P;
        var clash = function (x, y) {
          return mates.some(function (m) { var q = turned(m); return Math.abs(m.x - x) * 2 < q.w + n.w + apart && Math.abs(m.y - y) * 2 < q.h + n.h + apart; });
        };
        // (out along the way it lies from the room its door opens off, as it
        // does in the house: drawn round another side, the house put
        // together turned it to match the drawing)
        if (clash(n.x, n.y) && free.room && J && J.boxes[free.room.id]) {
          var jb2 = J.boxes[free.room.id], vx = n.x - (jb2.l + jb2.r) / 2, vy = n.y - (jb2.t + jb2.b) / 2;
          for (var k2 = 1; k2 <= 4; k2 += 0.1) {
            var ax2 = free.room.x + vx * k2, ay2 = free.room.y + vy * k2;
            if (!clash(ax2, ay2)) { n.x = Math.round(ax2); n.y = Math.round(ay2); break; }
          }
        }
        if (clash(n.x, n.y)) {
          var best = null;
          for (var ox = -30; ox <= 30; ox++) {
            for (var oy = -30; oy <= 30; oy++) {
              var cx = n.x + ox * P, cy = n.y + oy * P, d = ox * ox + oy * oy;
              if ((!best || d < best.d) && !clash(cx, cy)) { best = { x: cx, y: cy, d: d }; }
            }
          }
          if (best) { n.x = Math.round(best.x); n.y = Math.round(best.y); }
        }
      }
      // (round where it goes too: the house put together keeps every room on its Floor, 39-join.js)
      var fl = F.n, rim = 1.2 * P, tx = (rect.l + rect.r) / 2 - F.dx, ty = (rect.t + rect.b) / 2 - F.dy;
      var halfW = Math.max(fl.w / 2, fl.x - (n.x - n.w / 2) + rim, n.x + n.w / 2 - fl.x + rim, fl.x - (tx - n.w / 2) + rim, tx + n.w / 2 - fl.x + rim);
      var halfH = Math.max(fl.h / 2, fl.y - (n.y - n.h / 2) + rim, n.y + n.h / 2 - fl.y + rim, fl.y - (ty - n.h / 2) + rim, ty + n.h / 2 - fl.y + rim);
      var gx = Math.ceil(halfW - fl.w / 2), gy = Math.ceil(halfH - fl.h / 2);
      if ((gx > 0 || gy > 0) && !F.made) {
        var right = fl.x + fl.w / 2, below = fl.y + fl.h / 2, fNow = floorAt(floors, fl.x, fl.y);
        // (what is on it known before anything moves: moved first, the Floor left behind what was near its edge)
        var onIt = new Set(hand.nodes.filter(function (m) { return m === fl || (m.kind !== "i_floor" && floorAt(floors, m.x, m.y) === fNow); }));
        hand.nodes.forEach(function (m) {
          if (m === n) { return; }
          var q = turned(m);
          if (onIt.has(m)) { m.x += gx; m.y += gy; return; }
          if (m.x - q.w / 2 >= right - 1) { m.x += 2 * gx; }
          if (m.y - q.h / 2 >= below - 1) { m.y += 2 * gy; }
        });
        if (atticFloor && atticFloor.n !== fl && atticFloor.n.x - atticFloor.n.w / 2 >= right - 1) { atticFloor.dx -= 2 * gx; }
        n.x += gx; n.y += gy;
        F.dx -= gx; F.dy -= gy;
        // (the floors and the house put together, as they now are on the paper)
        floors = floorsOf();
        J = typeof tieLayout === "function" ? tieLayout() : null;
      }
      fl.w = Math.round(2 * halfW); fl.h = Math.round(2 * halfH);
      var like = roomsAll.filter(function (r) { return r.mat; })[0];
      n.mat = Object.assign({}, like ? like.mat : {}, { floor: kind2 === "room" ? "carpet" : "boards" });
      delete n.mat.floorC;
      hand.nodes.push(n);
      made++;
      return n;
    }
    function flight(lowAt, F, high, ladder, turn, w, h) {
      // the way up: its foot where it is on the floor under, its top over it
      var low = { id: hand.next++, kind: "i_stairs", text: "", x: 0, y: 0, w: 140, h: 46 };
      measure(low);
      low.text = ""; low.w = w; low.h = h; low.own = true; low.x = Math.round(lowAt[0]); low.y = Math.round(lowAt[1]); low.attic = true;
      if (turn) { low.turn = turn; }
      if (ladder) { low.ladder = true; }
      hand.nodes.push(low);
      var top = Object.assign({}, low, { id: hand.next++, x: Math.round(high[0] - F.dx), y: Math.round(high[1] - F.dy) });
      hand.nodes.push(top);
      hand.links.push({ from: low.id, to: top.id, label: "" });
      return [low, top];
    }
    // A place along a room for a way up `len` long and `wide` across: along
    // its long way, against one side, clear of the doors in it (and, unless
    // `anyway`, of what stands there -- a ladder can fold down over a car).
    function spotIn(r, len, wide, within, anyway) {
      var B = box(r), long = B.r - B.l >= B.b - B.t, doors = hand.nodes.filter(function (d) { return WALK_DOORS[d.kind]; }).map(pieceAt);
      // (and clear of what stands in the room: a workbench, shelving, a car)
      var things = hand.nodes.filter(function (m) {
        return m.kind !== "i_room" && m.kind !== "i_floor" && m.kind !== "i_lot" && !WALK_DOORS[m.kind] && m.kind !== "i_window" &&
               !ON_THE_WALL[m.kind] && !FROM_CEILING[m.kind] && !LIES_FLAT[m.kind] && insideArea(r, m.x, m.y);
      }).map(function (m) { var at = pieceAt(m), t = turned(m); return { x: at[0], y: at[1], w: t.w, h: t.h }; });
      var tries = [];
      for (var k = 0; k <= 8; k++) { tries.push(k / 8); }
      var best = null;
      tries.forEach(function (t) {
        [0, 1].forEach(function (side) {
          var cx, cy, bw = long ? len : wide, bh = long ? wide : len, T2 = 0.12 * P;
          if (long) { cx = B.l + T2 + bw / 2 + t * (B.r - B.l - 2 * T2 - bw); cy = side ? B.b - T2 - bh / 2 : B.t + T2 + bh / 2; }
          else { cy = B.t + T2 + bh / 2 + t * (B.b - B.t - 2 * T2 - bh); cx = side ? B.r - T2 - bw / 2 : B.l + T2 + bw / 2; }
          if (within && (cx - bw / 2 < within.l || cx + bw / 2 > within.r || cy - bh / 2 < within.t || cy + bh / 2 > within.b)) { return; }
          var clear = doors.every(function (d) { return Math.abs(d[0] - cx) > bw / 2 + 0.7 * P || Math.abs(d[1] - cy) > bh / 2 + 0.7 * P; }) &&
                      (anyway || things.every(function (q) { return Math.abs(q.x - cx) * 2 >= q.w + bw + 0.4 * P || Math.abs(q.y - cy) * 2 >= q.h + bh + 0.4 * P; }));
          if (!clear) { return; }
          var score = Math.abs(t - 0.85);
          if (!best || score < best.score) { best = { x: cx, y: cy, long: long, score: score }; }
        });
      });
      return best;
    }
    // A room over the garage stands against the upstairs rooms beside it: a
    // window of theirs in that wall looked into it (2026-10-03, found by a
    // sweep).  Each such window moved to the nearest place in an outside
    // wall of its room -- along the same wall clear of it, else round in
    // another -- clear of the doors, the other windows and what hangs
    // there; where there is none, taken out if its room has another.
    function atticWindowsClear(rect, level) {
      var gap = 0.3 * P;
      hand.nodes.filter(function (w) { return w.kind === "i_window" && !w.attic; }).forEach(function (w) {
        var at = pieceAt(w), f = at[2];
        if (!f || f.level !== level) { return; }
        var t = (w.turn || 0) * Math.PI / 180, nx = Math.round(Math.sin(t)), ny = Math.round(-Math.cos(t));
        var into = [-1, 1].some(function (s) {
          var px = at[0] + nx * s * 14, py = at[1] + ny * s * 14;
          return px > rect.l && px < rect.r && py > rect.t && py < rect.b;
        });
        if (!into) { return; }
        var holder = roomsAll.filter(function (r) { return insideArea(r, w.x, w.y, -14) && floorAt(floors, r.x, r.y) === f; })
          .sort(function (p, q) { return Math.hypot(p.x - w.x, p.y - w.y) - Math.hypot(q.x - w.x, q.y - w.y); })[0];
        if (!holder) { return; }
        var B = box(holder);
        // what is beyond a wall: a room on this floor, or the one over the garage
        var beyond = roomsAll.filter(function (r) { return r !== holder && floorAt(floors, r.x, r.y) === f; }).map(box).concat([rect]);
        function outside(px, py) { return !beyond.some(function (q) { return px > q.l && px < q.r && py > q.t && py < q.b; }); }
        var busy = hand.nodes.filter(function (o) {
          return o !== w && (WALK_DOORS[o.kind] || o.kind === "i_window" || ON_THE_WALL[o.kind]);
        }).map(function (o) { var p = pieceAt(o), q = turned(o); return { x: p[0], y: p[1], w: q.w, h: q.h, f: p[2] }; }).filter(function (o) { return o.f === f; });
        var best = null;
        [{ across: true, line: B.t, out: -1, turn: 0 }, { across: true, line: B.b, out: 1, turn: 0 },
         { across: false, line: B.l, out: -1, turn: 90 }, { across: false, line: B.r, out: 1, turn: 90 }].forEach(function (e) {
          var lo = (e.across ? B.l : B.t) + w.w / 2 + gap, hi = (e.across ? B.r : B.b) - w.w / 2 - gap;
          var mine = busy.filter(function (o) { return Math.abs((e.across ? o.y : o.x) - e.line) < 24; });
          for (var s = lo; s <= hi; s += 4) {
            var x = e.across ? s : e.line, y = e.across ? e.line : s;
            // outside all along it, not only at its middle
            var clear = [-w.w / 2, 0, w.w / 2].every(function (k) {
              return outside(e.across ? x + k : x + e.out * 14, e.across ? y + e.out * 14 : y + k);
            });
            if (!clear) { continue; }
            if (mine.some(function (o) { var c = e.across ? o.x : o.y, half = (e.across ? o.w : o.h) / 2; return Math.abs(c - s) < half + w.w / 2 + gap; })) { continue; }
            var d = Math.hypot(x - at[0], y - at[1]);
            if (!best || d < best.d) { best = { x: x, y: y, d: d, turn: e.turn }; }
          }
        });
        if (best) {
          var p = toPaper(holder, [best.x, best.y]);
          w.x = Math.round(p[0]); w.y = Math.round(p[1]);
          if (best.turn) { w.turn = best.turn; } else { delete w.turn; }
          return;
        }
        var more = hand.nodes.some(function (o) { return o !== w && o.kind === "i_window" && insideArea(holder, o.x, o.y, -14); });
        if (more) { hand.nodes.splice(hand.nodes.indexOf(w), 1); }
      });
    }
    function toPaper(r, p) { var f = floorAt(floors, r.x, r.y), d = J && J.delta[r.id] ? J.delta[r.id] : [0, 0]; return [p[0] - (f ? f.dx : 0) - d[0], p[1] - (f ? f.dy : 0) - d[1]]; }
    // A window in each end of a room under a roof that is open to the air.
    function gableWindows(room2, rect, F) {
      var along = rect.r - rect.l >= rect.b - rect.t;
      [-1, 1].forEach(function (s) {
        var wx = along ? (s < 0 ? rect.l : rect.r) : (rect.l + rect.r) / 2, wy = along ? (rect.t + rect.b) / 2 : (s < 0 ? rect.t : rect.b);
        var px2 = wx + (along ? s * 0.5 * P : 0), py2 = wy + (along ? 0 : s * 0.5 * P);
        var outside = !hand.nodes.some(function (r) {
          if (r.kind !== "i_room" || r === room2) { return false; }
          if (r.attic && r.x - r.w / 2 + F.dx < px2 && r.x + r.w / 2 + F.dx > px2 && r.y - r.h / 2 + F.dy < py2 && r.y + r.h / 2 + F.dy > py2) { return true; }
          var f = floorAt(floors, r.x, r.y);
          if (!f || f.level < F.level) { return false; }
          var q = box(r);
          return px2 > q.l && px2 < q.r && py2 > q.t && py2 < q.b;
        });
        if (!outside) { return; }
        var win = adviceAdd("i_window", Math.round(wx - F.dx - (along ? s * 3 : 0)), Math.round(wy - F.dy - (along ? 0 : s * 3)), along ? 90 : 0);
        win.w = Math.round(1.0 * P); win.own = true; win.attic = true;
      });
    }
    // A few things in a finished one, where it is full height; boxes in a storage one.
    function furnish(n, kind2, busy) {
      var hw = n.w / 2, hh = n.h / 2, along = n.w >= n.h, T2 = 0.15 * P, placed = busy.slice();
      function free(k, x, y, turn) {
        var q = { kind: k, x: x, y: y, w: 140, h: 46 };
        measure(q);
        var t = (turn || 0) % 180 ? { w: q.h, h: q.w } : { w: q.w, h: q.h };
        if (x - t.w / 2 < n.x - hw + T2 || x + t.w / 2 > n.x + hw - T2 || y - t.h / 2 < n.y - hh + T2 || y + t.h / 2 > n.y + hh - T2) { return false; }
        return !placed.some(function (b) { return Math.abs(b.x - x) * 2 < b.w + t.w + 0.3 * P && Math.abs(b.y - y) * 2 < b.h + t.h + 0.3 * P; });
      }
      function put(k, spots) {
        if (!ICONS[k]) { return; }
        for (var i = 0; i < spots.length; i++) {
          var s = spots[i];
          if (!free(k, s[0], s[1], s[2])) { continue; }
          var m = adviceAdd(k, Math.round(s[0]), Math.round(s[1]), s[2] || 0);
          m.own = true;
          var t = (s[2] || 0) % 180 ? { w: m.h, h: m.w } : { w: m.w, h: m.h };
          placed.push({ x: m.x, y: m.y, w: t.w, h: t.h });
          return;
        }
      }
      var ends = along ? [[n.x - hw + 0.75 * P, n.y, 270], [n.x + hw - 0.75 * P, n.y, 90]] : [[n.x, n.y - hh + 0.75 * P, 0], [n.x, n.y + hh - 0.75 * P, 180]];
      if (kind2 === "room") {
        put("i_sofa", ends.concat(ends.map(function (e) { return along ? [e[0], e[1] + 0.9 * P, e[2]] : [e[0] + 0.9 * P, e[1], e[2]]; })));
        put("i_rug", [[n.x, n.y, along ? 90 : 0], [n.x + (along ? 0.8 * P : 0), n.y + (along ? 0 : 0.8 * P), along ? 90 : 0]]);
        put("i_desk", ends.slice().reverse().concat(ends));
        put("i_armchair", [[n.x + (along ? 0 : 1.1 * P), n.y + (along ? 1.1 * P : 0), along ? 180 : 270], [n.x - (along ? 0 : 1.1 * P), n.y - (along ? 1.1 * P : 0), along ? 0 : 90]]);
      } else {
        // a bare bulb over the way up
        var bulb = adviceAdd("i_pendant", Math.round(n.x), Math.round(n.y));
        bulb.own = true;
        for (var b = -2; b <= 2; b++) {
          var u = b * 1.1 * P, side = (b % 2 ? 1 : -1) * 0.75 * P;
          put("i_package", [along ? [n.x + u, n.y + side, 0] : [n.x + side, n.y + u, 0]]);
        }
      }
    }
    // the house's own attic: as big as the top floor's biggest rectangle
    var houseRoom = null;
    if (kind !== "none") {
      var tops = roomsAll.filter(function (r) { var f = floorAt(floors, r.x, r.y); return f === Tf && garages.indexOf(r) < 0 && !((r.turn || 0) % 90); }).map(box);
      var rect = atticBiggest(tops), F = null;
      if (rect && (rect.r - rect.l < 3 * P || rect.b - rect.t < 3 * P)) { rect = null; }
      if (rect) {
        F = floorOver(Tf);
        // (where under the roof it fits: a room between its knee walls --
        // too narrow for one, storage; no room under the roof at all, none)
        var fz = (floorsOf().filter(function (o) { return o.n === F.n; })[0] || { z: 0 }).z;
        var fit = atticFits(rect, fz, kind, "house", floorsOf());
        if (!fit && kind === "room") { kind = "storage"; fit = atticFits(rect, fz, kind, "house", floorsOf()); }
        rect = fit;
      }
      if (rect) {
        houseRoom = room(F, rect, kind, "house", kind === "room" ? TXT.at_room_name : TXT.at_store_name);
        var busy = [];
        if (kind === "room") {
          // stairs: the flight Start building left for it (unjoined), or one along a hall
          var linked = {}, byId = {};
          hand.nodes.forEach(function (m) { byId[m.id] = m; });
          hand.links.forEach(function (l) { var a = byId[l.from], b = byId[l.to]; if (a && b && BETWEEN_FLOORS[a.kind] && BETWEEN_FLOORS[b.kind]) { linked[a.id] = linked[b.id] = true; } });
          var spare = hand.nodes.filter(function (s) {
            if (s.kind !== "i_stairs" || linked[s.id] || s.attic) { return false; }
            var p = pieceAt(s);
            return p[2] === Tf && p[0] > rect.l && p[0] < rect.r && p[1] > rect.t && p[1] < rect.b;
          })[0];
          if (spare) {
            var sp = pieceAt(spare);
            var top = Object.assign({}, spare, { id: hand.next++, x: Math.round(sp[0] - F.dx), y: Math.round(sp[1] - F.dy), attic: true });
            hand.nodes.push(top);
            // (the flight itself Start building's: it stays when the attic goes, for it to come back to)
            hand.links.push({ from: spare.id, to: top.id, label: "" });
            busy.push({ x: top.x, y: top.y, w: turned(top).w + 1.2 * P, h: turned(top).h + 1.2 * P });
          } else {
            var halls = roomsAll.filter(function (r) { var f = floorAt(floors, r.x, r.y); return f === Tf && kindOf(r) === "hall"; });
            var host = halls.concat(roomsAll.filter(function (r) { var f = floorAt(floors, r.x, r.y); return f === Tf && garages.indexOf(r) < 0; })
              .sort(function (p, q) { return q.w * q.h - p.w * p.h; }));
            var len = 2.9 * P, wide = 0.95 * P;
            host.some(function (r) {
              var s = spotIn(r, len, wide, rect);
              if (!s) { return false; }
              var low = toPaper(r, [s.x, s.y]), pair = flight(low, F, [s.x, s.y], false, s.long ? 90 : 0, Math.round(wide), Math.round(len));
              busy.push({ x: pair[1].x, y: pair[1].y, w: (s.long ? len : wide) + 1.2 * P, h: (s.long ? wide : len) + 1.2 * P });
              return true;
            });
          }
          gableWindows(houseRoom, rect, F);
        } else {
          // storage: a ladder folding down out of a hall's ceiling
          var hosts = roomsAll.filter(function (r) { var f = floorAt(floors, r.x, r.y); return f === Tf && kindOf(r) === "hall"; })
            .concat(roomsAll.filter(function (r) { var f = floorAt(floors, r.x, r.y); return f === Tf && garages.indexOf(r) < 0 && kindOf(r) !== "bath"; })
              .sort(function (p, q) { return q.w * q.h - p.w * p.h; }));
          var lw = Math.round(ATTIC_LADDER[0] * P), ll = Math.round(ATTIC_LADDER[1] * P);
          hosts.some(function (r) {
            var B = box(r), long = B.r - B.l >= B.b - B.t, s = spotIn(r, ll + 0.5 * P, lw, rect);
            if (!s) { return false; }
            // (in the middle of a hall, not against its side)
            if (kindOf(r) === "hall") { if (long) { s.y = (B.t + B.b) / 2; } else { s.x = (B.l + B.r) / 2; } }
            var pair = flight(toPaper(r, [s.x, s.y]), F, [s.x, s.y], true, s.long ? 90 : 0, lw, ll);
            busy.push({ x: pair[1].x, y: pair[1].y, w: turned(pair[1]).w + 1.0 * P, h: turned(pair[1]).h + 1.0 * P });
            return true;
          });
        }
        furnish(houseRoom, kind, busy);
      }
    }
    // over the garage, up in its roof: storage up a ladder out of its
    // ceiling, or a room up stairs from it.  (No door into it from upstairs,
    // 2026-10-04: "it made an unnecessary door to that above area to the
    // garage when it should just have the same panel in the ceiling too".)
    if (gkind !== "none") {
      garages.forEach(function (gr) {
        var B = box(gr), F2 = floorOver(B.f || G0), rect2 = { l: B.l, r: B.r, t: B.t, b: B.b };
        // not where a room is already
        var taken = hand.nodes.some(function (r) {
          if (r.kind !== "i_room") { return false; }
          var f = floorAt(floors, r.x, r.y);
          if (!f || f.level !== F2.level) { return false; }
          var q = box(r);
          return Math.min(q.r, rect2.r) - Math.max(q.l, rect2.l) > 0.5 * P && Math.min(q.b, rect2.b) - Math.max(q.t, rect2.t) > 0.5 * P;
        });
        if (taken) { return; }
        // (the upstairs windows looking out over the garage moved first: its roof can then rise to give it room)
        atticWindowsClear(rect2, F2.level);
        var gz = (floorsOf().filter(function (o) { return o.n === F2.n; })[0] || { z: 0 }).z, gk = gkind;
        var fit2 = atticFits(rect2, gz, gk, "garage", floorsOf());
        if (!fit2 && gk === "room") { gk = "storage"; fit2 = atticFits(rect2, gz, gk, "garage", floorsOf()); }
        if (!fit2) { return; }
        rect2 = fit2;
        var over = room(F2, rect2, gk, "garage", gk === "room" ? TXT.at_bonus_name : TXT.at_garage_name, null);
        // (where it is drawn against where it goes: what is put in it, put by where it is drawn)
        var jx = (rect2.l + rect2.r) / 2 - F2.dx, jy = (rect2.t + rect2.b) / 2 - F2.dy;
        var F2b = { n: F2.n, dx: F2.dx - (over.x - jx), dy: F2.dy - (over.y - jy), level: F2.level };
        if (gk === "room") { gableWindows(over, rect2, F2b); }
        var busy2 = [];
        var ladder = gk === "storage", fw = ladder ? Math.round(ATTIC_LADDER[0] * P) : Math.round(0.95 * P), fl = ladder ? Math.round(ATTIC_LADDER[1] * P) : Math.round(2.9 * P);
        var s = spotIn(gr, fl + (ladder ? 0.5 * P : 0), fw, rect2) || spotIn(gr, fl + (ladder ? 0.5 * P : 0), fw, rect2, true);
        if (s) {
          var pair = flight(toPaper(gr, [s.x, s.y]), F2b, [s.x, s.y], ladder, s.long ? 90 : 0, fw, fl);
          busy2.push({ x: pair[1].x, y: pair[1].y, w: turned(pair[1]).w + 1.0 * P, h: turned(pair[1]).h + 1.0 * P });
        }
        furnish(over, gk, busy2);
      });
    }
    // (a Floor made for an attic that did not fit under the roof, taken out again)
    hand.nodes = hand.nodes.filter(function (fn) {
      return fn.kind !== "i_floor" || !fn.attic || hand.nodes.some(function (n) { return n !== fn && n.kind !== "i_floor" && insideArea(fn, n.x, n.y); });
    });
    if (made) {
      floors = floorsOf();
      J = typeof tieLayout === "function" ? tieLayout() : null;
      standing.forEach(function (st) {
        var q = box(st.ref), sx = (q.l + q.r) / 2 - st.x, sy = (q.t + q.b) / 2 - st.y;
        if (Math.abs(sx) < 0.5 && Math.abs(sy) < 0.5) { return; }
        st.floorNode.x = Math.round(st.floorNode.x + sx); st.floorNode.y = Math.round(st.floorNode.y + sy);
      });
    }
    return made;
  }
  // From the 3D view's settings: made again on the house as it is.
  function atticSet(want) {
    keepUndo();
    var now = atticNow();
    var made = atticMake({ attic: want.attic !== undefined ? want.attic : now.attic, garage: want.garage !== undefined ? want.garage : now.garage });
    picked = null; chosen = null; many = [];
    if (typeof handKeep === "function") { handKeep(); }
    drawHand(); drawHandPanel(); showReport();
    if (typeof V3 !== "undefined" && V3) { V3.kept = null; V3.xrayKept = null; V3.ground = null; V3.dirty = true; if (V3.gl) { V3.gl.scenery = null; } }
    return made;
  }

  // ---- Start building: asked, and made after the rest -------------------------------------------------
  // (put in under Start building's marking of what it made, 40-hood.js, so
  // a house made once the answer comes is given its attic too)
  if (typeof STARTER_WRAPS === "object") {
    var atticWrap = function* (inner, want) {
      var out = yield* inner(want);
      try {
        if (want && ((want.attic && want.attic !== "none") || (want.garageAttic && want.garageAttic !== "none"))) {
          var near = (typeof starterLast === "object" ? starterLast : []).map(function (o) { return o.room; });
          if (near.length) {
            atticMake({ attic: want.attic || "none", garage: want.garage ? want.garageAttic || "none" : "none" }, near);
            // (an open plan's walls taken out under it carry its floor now: their posts, 40-arrange.js)
            if (typeof arrangeOpenPosts === "function") { arrangeOpenPosts(); }
            yield ["attic", 1];
          }
        }
      } catch (e) { if (window.console && console.warn) { console.warn("attic:", e && e.message); } }
      return out;
    };
    var hoodAt = -1;
    STARTER_WRAPS.forEach(function (fn, i) { if (hoodAt < 0 && String(fn).indexOf("hoodBuild") >= 0) { hoodAt = i; } });
    if (hoodAt >= 0) { STARTER_WRAPS.splice(hoodAt, 0, atticWrap); } else { STARTER_WRAPS.push(atticWrap); }
  }
  // the asking (39-starter.js, after the house's extras)
  function atticAsk(ui, want) {
    if (want.attic === undefined) { want.attic = "none"; }
    if (want.garageAttic === undefined) { want.garageAttic = "none"; }
    ui.head(TXT.at_head);
    // (the style asked for has a flat roof: no space up in it -- said, not asked)
    var key = want.style !== undefined ? want.style : (typeof typeOf === "function" ? (typeOf(want) || {}).style || "" : "");
    var S = key && typeof HOUSE_STYLES === "object" ? HOUSE_STYLES[key] : null;
    if (S && atticFlat(S.shape)) {
      want.attic = "none"; want.garageAttic = "none";
      ui.tiles();
      ui.tile(TXT.at_flat, "at_none", function () { return true; }, function () {}, true);
      return;
    }
    ui.tiles();
    ATTIC_KINDS.forEach(function (k) {
      ui.tile(TXT["at_" + k], "at_" + k, function () { return (want.attic || "none") === k; }, function () { want.attic = k; }, true);
    });
    ui.head(TXT.at_garage_head);
    ui.tiles();
    ATTIC_KINDS.forEach(function (k) {
      ui.tile(TXT["atg_" + k], "atg_" + k, function () { return (want.garageAttic || "none") === k; }, function () { want.garageAttic = k; }, true);
    });
  }

  // ---- a shed's loft ------------------------------------------------------------------------------------
  // A shed with a loft is a little barn: its walls low, a gambrel roof over
  // a floor up under it, a loft door over the double doors.
  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.shedLoft = true; }
  if (typeof modelColors === "function") {
    var modelColorsAttic = modelColors;
    modelColors = function (n) {
      var C = modelColorsAttic.apply(this, arguments);
      if (n && n.kind === "i_shed") { C.loft = !!houseOpt("shedLoft"); }
      return C;
    };
  }
  if (typeof MODELS === "object" && MODELS.i_shed) {
    var shedPlain = MODELS.i_shed;
    mDef("i_shed", function (M, W, D, H, C) {
      if (!C.loft) { return shedPlain.apply(this, arguments); }
      var cm = FLOOR_PX / 100;
      C = mPick(C, "#9c4a3a", "#3f4246");
      var boards = M.mat("wood", C.main), white = M.mat("wood", "#f1eee6"), roof = M.mat("plastic", C.frame);
      var wall = Math.min(H * 0.8, 195 * cm), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
      var run = W / 2 * 0.36, zb = wall + run * Math.tan(58 * Math.PI / 180), top = zb + (W / 2 - run) * Math.tan(22 * Math.PI / 180);
      M.box(x0, x1, y0, y1, 0, wall, boards);
      // the gambrel: steep low down, shallow over, its ends boarded up under it
      var o = 9 * cm, prof = [[x0 - o, wall - o * 1.4], [x0 + run, zb], [0, top], [x1 - run, zb], [x1 + o, wall - o * 1.4]];
      for (var i = 0; i + 1 < prof.length; i++) {
        var a = prof[i], b = prof[i + 1];
        M.quad(roof, [a[0], y0 - o, a[1]], [b[0], y0 - o, b[1]], [b[0], y1 + o, b[1]], [a[0], y1 + o, a[1]]);
      }
      [[y0, -1], [y1, 1]].forEach(function (e) {
        var y = e[0], nrm = [0, e[1], 0];
        M.quad(boards, [x0, y, wall], [x1, y, wall], [x1 - run, y, zb], [x0 + run, y, zb]);
        M.quad(boards, [x0 + run, y, zb], [x1 - run, y, zb], [x1 - run * 0.4, y, (zb + top) / 2], [x0 + run * 0.4, y, (zb + top) / 2]);
        M.tri(boards, [x0 + run * 0.4, y, (zb + top) / 2], [x1 - run * 0.4, y, (zb + top) / 2], [0, y, top - 1 * cm], nrm, nrm, nrm);
      });
      // the double doors, white-trimmed with their cross braces; the loft door over them
      var dw = Math.min(W * 0.46, 150 * cm), dh = Math.min(wall - 8 * cm, 185 * cm), fy = y1 + 0.6 * cm;
      M.box(-dw / 2, dw / 2, y1, fy + 1 * cm, 0, dh, M.mat("wood", mShade(C.main, -0.12)), 0.3 * cm);
      [[-dw / 2, -dw / 2 + 5 * cm, 0, dh], [dw / 2 - 5 * cm, dw / 2, 0, dh], [-dw / 2, dw / 2, dh - 5 * cm, dh], [-1.5 * cm, 1.5 * cm, 0, dh], [-dw / 2, dw / 2, 0, 5 * cm]].forEach(function (q) {
        M.box(q[0], q[1], fy, fy + 2 * cm, q[2], q[3], white, 0.3 * cm);
      });
      [-1, 1].forEach(function (s) {
        M.tube([s * dw / 2 - s * 4 * cm, fy + 2.5 * cm, 6 * cm], [s * 3 * cm, fy + 2.5 * cm, dh - 6 * cm], 2 * cm, white, 4);
        M.tube([s * 3 * cm, fy + 2.5 * cm, 6 * cm], [s * dw / 2 - s * 4 * cm, fy + 2.5 * cm, dh - 6 * cm], 2 * cm, white, 4);
      });
      var lw = Math.min(W * 0.3, 90 * cm), lz0 = wall + 18 * cm, lz1 = Math.min(zb + 25 * cm, lz0 + 80 * cm);
      M.box(-lw / 2, lw / 2, y1, fy + 1 * cm, lz0, lz1, M.mat("wood", mShade(C.main, -0.12)), 0.3 * cm);
      [[-lw / 2, -lw / 2 + 4 * cm, lz0, lz1], [lw / 2 - 4 * cm, lw / 2, lz0, lz1], [-lw / 2, lw / 2, lz1 - 4 * cm, lz1], [-lw / 2, lw / 2, lz0, lz0 + 4 * cm], [-1.2 * cm, 1.2 * cm, lz0, lz1]].forEach(function (q) {
        M.box(q[0], q[1], fy, fy + 2 * cm, q[2], q[3], white, 0.3 * cm);
      });
      // a window each side, white-framed
      [x0, x1].forEach(function (x) {
        var s = x < 0 ? -1 : 1, gx = x + s * 0.6 * cm;
        M.box(Math.min(x, gx), Math.max(x, gx), -28 * cm, 28 * cm, wall * 0.48, wall * 0.82, M.mat("glass", "#bcd3de"));
        M.box(Math.min(x, gx + s * 1.5 * cm), Math.max(x, gx + s * 1.5 * cm), -32 * cm, 32 * cm, wall * 0.46, wall * 0.48, white);
      });
    });
  }

  // ---- in the view's settings ------------------------------------------------------------------------
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      at_none: '<path d="M2.6 9.4 10 3.4l7.4 6M4.4 8v8.6h11.2V8M7.6 12.4h4.8"/>',
      at_storage: '<path d="M2.6 9.4 10 3.4l7.4 6M4.4 8v8.6h11.2V8"/><rect x="7.2" y="8.6" width="5.6" height="3.6" rx=".4"/><path d="M7.2 10.2h5.6M4.4 13.6h11.2"/>',
      at_room: '<path d="M2.6 9.4 10 3.4l7.4 6M4.4 8v8.6h11.2V8M4.4 13.6h11.2"/><path d="M7.4 13.6v-2.4h5.2v2.4M8.6 7.6h2.8v2h-2.8z"/>',
      atg_none: '<path d="M2.8 8.6 10 4l7.2 4.6V16.6H2.8z"/><path d="M5.6 16.6v-5h8.8v5M5.6 13.4h8.8"/>',
      atg_storage: '<path d="M2.8 8.6 10 4l7.2 4.6V16.6H2.8z"/><path d="M5.6 16.6v-4.4h8.8v4.4"/><rect x="8" y="6.8" width="4" height="2.6" rx=".3"/>',
      atg_room: '<path d="M2.8 8.6 10 4l7.2 4.6V16.6H2.8z"/><path d="M5.6 16.6v-4.4h8.8v4.4M8.4 7v2.6h3.2V7"/>',
      at_shed: '<path d="M3 16.6V9.4l2-3.6h10l2 3.6v7.2z"/><path d="M8 16.6v-4.4h4v4.4M8.6 7.6h2.8v1.8H8.6z"/>'
    });
  }
  if (typeof HOUSE_TAB_MORE === "object") {
    HOUSE_TAB_MORE.push(function (sheet, head, tiles, draw) {
      if (typeof groundsNow === "function" && groundsNow() !== "home") { return; }
      var now = atticNow();
      head(TXT.at_head);
      if (!atticAllowed()) {
        var p = document.createElement("p");
        p.className = "hs-note";
        p.innerHTML = (typeof houseIcon === "function" ? houseIcon("at_none") : "") + "<span></span>";
        p.lastChild.textContent = TXT.at_flat;
        sheet.appendChild(p);
      } else if (typeof worldPicker === "function") {
        worldPicker(sheet, ATTIC_KINDS, now.attic, "at_", function (k) { atticSet({ attic: k }); if (draw) { draw(); } });
        head(TXT.at_garage_head);
        worldPicker(sheet, ATTIC_KINDS, now.garage, "atg_", function (k) { atticSet({ garage: k }); if (draw) { draw(); } });
      }
      tiles([{ icon: "at_shed", label: TXT.at_shed_loft, on: !!houseOpt("shedLoft"), set: function (v) { houseSetOpt("shedLoft", v); } }]);
    });
  }
