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
  var ATTIC_KNEE = { room: 1.2, storage: 0.15 };            // metres
  var ATTIC_FLAT = { room: 2.3, storage: 2.0 };
  var ATTIC_HEAD = 2.13, ATTIC_STAND = 1.65, ATTIC_STEEPEST = Math.tan(62 * Math.PI / 180);
  var ATTIC_KINDS = ["none", "storage", "room"];
  var ATTIC_GABLED = { gable: true, gambrel: true, stepped: true, aframe: true };
  var ATTIC_LADDER = [0.64, 1.37];                          // metres: a folding ladder's opening, 25 x 54 in

  // The attic rooms (looked for again only when the drawing changes).
  var atticMemo = { list: null, count: -1, at: 0, rooms: [] };
  function atticRooms() {
    var K = atticMemo, list = hand.nodes, now = performance.now();
    if (K.list !== list || K.count !== list.length || now - K.at > 250) {
      K.list = list; K.count = list.length; K.at = now;
      K.rooms = list.filter(function (n) { return n.kind === "i_room" && (n.attic === "room" || n.attic === "storage"); });
    }
    return K.rooms;
  }
  function atticKnee(r) { return ATTIC_KNEE[r && r.attic] || 0; }
  // How steep the roof over an attic `half` metres across to the middle must be.
  function atticSlope(kind, half) {
    if (!(half > 0.5)) { return 0; }
    var knee = ATTIC_KNEE[kind] || 0;
    var k = kind === "room" ? Math.max((ATTIC_HEAD - knee) / (half / 2), (ATTIC_FLAT.room + 0.25 - knee) / half)
                            : (ATTIC_STAND - knee) / half;
    return Math.min(ATTIC_STEEPEST, k);
  }

  // ---- the roof over it ----------------------------------------------------------------------
  // Over an attic the roof starts at the top of its knee walls, and is as
  // steep as the attic needs (never less steep than the house's style).
  // A finished attic's roof is gabled -- its ends walls, a window in each --
  // and any roof over an attic slopes: a flat one would leave none.
  if (typeof styleRoofShape === "function") {
    var styleRoofShapeAttic = styleRoofShape;
    styleRoofShape = function () {
      var shape = styleRoofShapeAttic.apply(this, arguments), rooms = atticRooms();
      if (!rooms.length || ATTIC_GABLED[shape]) { return shape; }
      var finished = rooms.some(function (r) { return r.attic === "room"; });
      if (!finished && (shape === "hip" || shape === "pagoda")) { return shape; }
      return "gable";
    };
  }
  function atticUnder(R, floors, rooms) {
    if (R.turn) { return null; }
    var best = null;
    rooms.forEach(function (r) {
      var f = floors && floors.length ? floorAt(floors, r.x, r.y) : null, x = r.x + (f ? f.dx : 0), y = r.y + (f ? f.dy : 0);
      if ((f ? f.level : 0) !== R.level || x < R.x0 || x > R.x1 || y < R.y0 || y > R.y1) { return; }
      if (!best || (best.attic !== "room" && r.attic === "room")) { best = r; }
    });
    return best;
  }
  if (typeof roofPlan === "function") {
    var roofPlanAttic = roofPlan;
    roofPlan = function (floors, upTo, wallTop) {
      var rooms = atticRooms();
      if (!rooms.length) { return roofPlanAttic.apply(this, arguments); }
      var out = roofPlanAttic.call(this, floors, upTo, function (r) { return r && r.attic ? atticKnee(r) * FLOOR_PX : wallTop(r); });
      out.forEach(function (R) {
        var a = atticUnder(R, floors, rooms);
        if (!a) { return; }
        var half = Math.min(R.x1 - R.x0, R.y1 - R.y0) / 2 / FLOOR_PX;
        R.k = Math.max(R.k || (typeof stylePitch === "function" ? stylePitch() : ROOF_PITCH), atticSlope(a.attic, half));
      });
      return out;
    };
  }
  // The roof's profile across an attic room, as the roof over it is drawn:
  // [distance in from the wall, height over its floor] in px, to the middle.
  function atticProfile(room) {
    var P = FLOOR_PX, half = Math.min(room.w, room.h) / 2, knee = atticKnee(room) * P, shape = styleRoofShape();
    var pitch = typeof stylePitch === "function" ? stylePitch() : ROOF_PITCH;
    var one = houseOpt("roof") === "one" || shape !== "hip";
    if (one) { var ridge = typeof styleRidge === "function" ? styleRidge() : ROOF_RIDGE; pitch = Math.min(pitch, ridge * P / half); }
    var k = Math.max(pitch, atticSlope(room.attic, half / P));
    if (shape === "aframe") { k = Math.tan(60 * Math.PI / 180); }
    if (shape === "gambrel") {
      var k1 = Math.tan(62 * Math.PI / 180), k2 = Math.tan(24 * Math.PI / 180), run = half * 0.32;
      return { pts: [[0, knee], [run, knee + run * k1], [half, knee + run * k1 + (half - run) * k2]], k: k1, hip: false };
    }
    return { pts: [[0, knee], [half, knee + half * k]], k: k, hip: shape === "hip" || shape === "pagoda" };
  }
  function atticHeightAt(prof, d) {
    var p = prof.pts;
    for (var i = 1; i < p.length; i++) {
      if (d <= p[i][0]) { return p[i - 1][1] + (p[i][1] - p[i - 1][1]) * (d - p[i - 1][0]) / Math.max(1e-6, p[i][0] - p[i - 1][0]); }
    }
    return p[p.length - 1][1];
  }

  // ---- in 3D: inside it ---------------------------------------------------------------------------
  // Its walls only as high as its knee walls; over them the ceiling under
  // the roof (and, finished, flat across the top), its ends carried up to
  // it -- a window in each where the roof's gable has one.
  var atticWallHow = {};
  if (typeof v3Wall === "function") {
    var v3WallAttic = v3Wall;
    v3Wall = function (faces, room, edge, T, holes, how, low, wallTop, keep) {
      if (room && room.attic && !low) {
        atticWallHow[room.id] = how;
        wallTop = Math.min(wallTop || ceilOf(room) * FLOOR_PX, Math.max(1, atticKnee(room) * FLOOR_PX));
        return v3WallAttic.call(this, faces, room, edge, T, holes, how, low, wallTop, keep);
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
  function atticInside(faces, room) {
    var P = FLOOR_PX, prof = atticProfile(room), along = room.w >= room.h;
    var hu = (along ? room.w : room.h) / 2, hv = (along ? room.h : room.w) / 2;
    var T = Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06)), finished = room.attic === "room";
    var flat = finished ? ceilOf(room) * P : Infinity, top = Math.min(DOOR_TALL * P, ceilOf(room) * P - 0.1 * P);
    // (the room's own flat ceiling, put up just before: taken down, this one in its place)
    var ceilHow = null;
    for (var i = faces.length - 1, seen = 0; i >= 0 && !faces[i].node && seen < 600; i--, seen++) {
      var p0 = faces[i].ceiling && faces[i].pts && faces[i].pts[0];
      if (p0 && insideArea(room, p0[0], p0[1], 3)) { ceilHow = ceilHow || faces[i].how; faces.splice(i, 1); }
    }
    var wallHow = atticWallHow[room.id] || { wall: true, color: "#f2efe8", edge: "#9a958c" };
    if (!finished) {
      ceilHow = { piece: true, color: "#c9a877", edge: v3Mix("#c9a877", "#000000", 0.3), pat: 21, ceiling: true };   // the roof's boards, bare
    }
    ceilHow = ceilHow || { ceiling: true, color: "#f4f2ee", edge: "#9a958c" };
    function W(u, v) { return along ? v3Local(room, u, v) : v3Local(room, v, u); }
    // (a ceiling facing down into the room, an end wall facing in across it)
    function face(pts3, how, down) {
      var n = typeof styleNormal === "function" ? styleNormal(pts3) : [0, 0, -1];
      if (down && n[2] > 0) { n = [-n[0], -n[1], -n[2]]; }
      if (!down && n[0] * (room.x - pts3[0][0]) + n[1] * (room.y - pts3[0][1]) < 0) { n = [-n[0], -n[1], -n[2]]; }
      faces.push({ pts: pts3, n: n, how: how, ceiling: down && how === ceilHow });
    }
    function at(u, v, z) { var w = W(u, v); return [w[0], w[1], z]; }
    var u0 = -hu + T, u1 = hu - T, capD = null;
    // (under the roof by the roof's own thickness: laid in its very planes,
    // the attic's boards showed through the roof over them, 2026-10-03)
    var under = 0.14 * P, hAt = function (d) { return atticHeightAt(prof, d) - under; }, ridgeZ = hAt(hv);
    // the slopes, from each long wall up -- to the flat ceiling, or the ridge
    var stops = prof.pts.map(function (p) { return p[0]; }).filter(function (d) { return d > T && d < hv; });
    if (flat < ridgeZ) {
      for (var d = 0; d <= hv; d += 1) { if (hAt(d) >= flat) { capD = d; break; } }
      stops = stops.filter(function (d) { return d < capD; }).concat([capD]);
    } else { stops = stops.concat([hv]); }
    var ds = [T].concat(stops);
    if (prof.hip && !finished && hu > hv) {
      // hipped: its ends sloping up too, to a ridge shorter than the room
      var kz = prof.pts[0][1] - under;
      [-1, 1].forEach(function (s) {
        face([at(-hu, s * hv, kz), at(hu, s * hv, kz), at(hu - hv, 0, ridgeZ), at(-hu + hv, 0, ridgeZ)], ceilHow, true);
        face([at(s * hu, -hv, kz), at(s * hu, hv, kz), at(s * (hu - hv), 0, ridgeZ)], ceilHow, true);
      });
    } else {
      // (from the wall's outside line, as the roof is: begun at its inside
      // face, the wall's top showed a strip of the sky over it)
      var dsS = [0].concat(stops);
      [-1, 1].forEach(function (s) {
        for (var j = 0; j + 1 < dsS.length; j++) {
          var a = dsS[j], b = dsS[j + 1], za = hAt(a), zb = hAt(b);
          face([at(u0, s * (hv - a), za), at(u1, s * (hv - a), za), at(u1, s * (hv - b), zb), at(u0, s * (hv - b), zb)], ceilHow, true);
        }
      });
      if (capD !== null && hv - capD > 0.5) {
        face([at(u0, -(hv - capD), flat), at(u1, -(hv - capD), flat), at(u1, hv - capD, flat), at(u0, hv - capD, flat)], ceilHow, true);
      }
      // the ends: the wall carried up under the slopes, less its windows and doors
      var outline = [[-hv + T, hAt(T) - 0.5]];
      ds.forEach(function (d) { outline.push([-hv + d, Math.min(flat, hAt(d))]); });
      ds.slice().reverse().forEach(function (d) { outline.push([hv - d, Math.min(flat, hAt(d))]); });
      outline.push([hv - T, hAt(T) - 0.5]);
      var knee = prof.pts[0][1];
      outline = [[-hv + T, knee]].concat(outline.slice(1, -1), [[hv - T, knee]]);
      [["neg", -1], ["pos", 1]].forEach(function (end) {
        var s = end[1], edge = along ? (s < 0 ? "left" : "right") : (s < 0 ? "top" : "foot");
        // (along the wall as v3Hole measures it: from the room's left, or its top)
        var holes = atticHoles(room, edge, T, top).map(function (h) { return [h[0] - hv, h[1] - hv, h[2], h[3]]; });
        var how = finished ? wallHow : ceilHow;
        atticMinus(outline, holes).forEach(function (piece) {
          face(piece.map(function (q) { return at(s * (hu - T), q[0], q[1]); }), how, false);
        });
      });
    }
    if (!finished) { atticStorage(faces, room, prof, along, hu, hv, ridgeZ); }
    else if (typeof structShown === "function" && structShown()) { atticRafters(faces, room, prof, along, hu, hv, flat, capD); }
  }
  // Storage: the rafters showing under the roof's boards, the joists' bays
  // filled with insulation, boards down the middle to walk on.
  function atticStorage(faces, room, prof, along, hu, hv, ridgeZ) {
    var P = FLOOR_PX, wood = { piece: true, color: "#b98e5c", edge: "#6b4f33", pat: 21 };
    var fluff = { piece: true, color: "#f2b6c1", edge: "#c98c98", insulation: true };
    function W(u, v) { return along ? v3Local(room, u, v) : v3Local(room, v, u); }
    function at(u, v, z) { var w = W(u, v); return [w[0], w[1], z]; }
    if (typeof powerRod === "function") {
      for (var u = -hu + 0.3 * P; u < hu - 0.2 * P; u += 0.6 * P) {
        [-1, 1].forEach(function (s) {
          var lo = Math.min(hv, prof.hip && hu > hv ? Math.min(hv, hu - Math.abs(u)) : hv);
          powerRod(faces, at(u, s * hv, atticHeightAt(prof, 0) - 0.05 * P), at(u, s * (hv - lo), atticHeightAt(prof, lo) - 0.06 * P), 0.035 * P, wood, 4);
        });
      }
      powerRod(faces, at(-hu + (prof.hip && hu > hv ? hv : 0.1 * P), 0, ridgeZ - 0.08 * P), at(hu - (prof.hip && hu > hv ? hv : 0.1 * P), 0, ridgeZ - 0.08 * P), 0.05 * P, wood, 4);
    }
    // the insulation each side of the boards, round the way up through the floor
    var walk = 0.35 * P, hatch = hand.nodes.filter(function (n) { return n.kind === "i_stairs" && n.attic && insideArea(room, n.x, n.y); })[0];
    var hx = null;
    if (hatch) {
      var dx = hatch.x - room.x, dy = hatch.y - room.y, a = -(room.turn || 0) * Math.PI / 180;
      var lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a), t = turned(hatch);
      hx = along ? [lx - t.w / 2 - 6, lx + t.w / 2 + 6, ly - t.h / 2 - 6, ly + t.h / 2 + 6] : [ly - t.h / 2 - 6, ly + t.h / 2 + 6, lx - t.w / 2 - 6, lx + t.w / 2 + 6];
    }
    function slab(u0, u1, v0, v1, z0, z1, how) {
      var parts = [[u0, u1, v0, v1]];
      if (hx) {
        parts = [];
        [[u0, Math.min(u1, hx[0]), v0, v1], [Math.max(u0, hx[1]), u1, v0, v1],
         [Math.max(u0, hx[0]), Math.min(u1, hx[1]), v0, Math.min(v1, hx[2])], [Math.max(u0, hx[0]), Math.min(u1, hx[1]), Math.max(v0, hx[3]), v1]]
          .forEach(function (q) { if (q[1] - q[0] > 1 && q[3] - q[2] > 1) { parts.push(q); } });
      }
      parts.forEach(function (q) {
        var base = [W(q[0], q[2]), W(q[1], q[2]), W(q[1], q[3]), W(q[0], q[3])];
        v3Prism(faces, base, z0, z1, how);
      });
    }
    // (kept in from the walls as far as the roof is lower than the fluff is
    // deep: out to the wall's face it showed pink along the eaves, 2026-10-03)
    var Tw = Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06)), knee0 = atticHeightAt(prof, 0);
    var inset = Tw + Math.max(2, (0.24 * P - knee0) / Math.max(0.2, prof.k || 0.5) + 3);
    slab(-hu + inset, hu - inset, -hv + inset, -walk, 0.2, 0.24 * P, fluff);
    slab(-hu + inset, hu - inset, walk, hv - inset, 0.2, 0.24 * P, fluff);
    slab(-hu + 0.2 * P, hu - 0.2 * P, -walk, walk, 0.2, 0.25 * P, { piece: true, color: "#d7b98c", edge: "#8a6d48", pat: 21 });
  }
  // A finished attic with its beams on show (40-struct.js): its rafters
  // down the slopes and a collar tie across under the flat ceiling.
  function atticRafters(faces, room, prof, along, hu, hv, flat, capD) {
    if (typeof powerRod !== "function") { return; }
    var P = FLOOR_PX, look = structLook(structKind() === "steel" ? "steel" : "timber");
    function at(u, v, z) { var w = along ? v3Local(room, u, v) : v3Local(room, v, u); return [w[0], w[1], z]; }
    var top = capD === null ? hv : capD;
    for (var u = -hu + 0.8 * P; u < hu - 0.5 * P; u += 1.2 * P) {
      [-1, 1].forEach(function (s) {
        powerRod(faces, at(u, s * (hv - 0.1 * P), atticHeightAt(prof, 0.1 * P) - 0.09 * P), at(u, s * (hv - top), Math.min(flat, atticHeightAt(prof, top)) - 0.09 * P), 0.07 * P, look, 4);
      });
      if (capD !== null) { powerRod(faces, at(u, -(hv - capD), flat - 0.09 * P), at(u, hv - capD, flat - 0.09 * P), 0.07 * P, look, 4); }
    }
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
    // its long way, against one side, clear of the doors in it.
    function spotIn(r, len, wide, within) {
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
                      things.every(function (q) { return Math.abs(q.x - cx) * 2 >= q.w + bw + 0.4 * P || Math.abs(q.y - cy) * 2 >= q.h + bh + 0.4 * P; });
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
      var rect = atticBiggest(tops);
      if (rect && rect.r - rect.l >= 3 * P && rect.b - rect.t >= 3 * P) {
        var F = floorOver(Tf);
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
    // over the garage: storage up a ladder, or a room -- a door into it
    // from the floor beside it, else stairs up from the garage
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
        // a door into it from the floor beside it, where a room there meets it
        // (storage too: a walk-in loft) -- found before it is drawn: with a
        // door it may be drawn where there is room, its arrow putting it over
        // the garage; with none it is drawn where it goes
        var door = hand.nodes.filter(function (r) {
          if (r.kind !== "i_room") { return false; }
          var f = r === houseRoom ? { level: F2.level } : floorAt(floors, r.x, r.y);
          if (!f || f.level !== F2.level) { return false; }
          var q = r === houseRoom ? { l: r.x - r.w / 2 + F2.dx, r: r.x + r.w / 2 + F2.dx, t: r.y - r.h / 2 + F2.dy, b: r.y + r.h / 2 + F2.dy } : box(r);
          var side = Math.min(q.b, rect2.b) - Math.max(q.t, rect2.t), across = Math.min(q.r, rect2.r) - Math.max(q.l, rect2.l);
          return (Math.abs(q.r - rect2.l) < 8 || Math.abs(q.l - rect2.r) < 8) && side > 1.0 * P ||
                 (Math.abs(q.b - rect2.t) < 8 || Math.abs(q.t - rect2.b) < 8) && across > 1.0 * P;
        }).sort(function (p, q) { return (kindOf(q) === "hall" ? 1 : 0) - (kindOf(p) === "hall" ? 1 : 0); })[0] || null;
        var over = room(F2, rect2, gkind, "garage", gkind === "room" ? TXT.at_bonus_name : TXT.at_garage_name, door ? { room: door === houseRoom ? null : door } : null);
        atticWindowsClear(rect2, F2.level);
        // (where it is drawn against where it goes: what is put in it, put by where it is drawn)
        var jx = (rect2.l + rect2.r) / 2 - F2.dx, jy = (rect2.t + rect2.b) / 2 - F2.dy;
        var F2b = { n: F2.n, dx: F2.dx - (over.x - jx), dy: F2.dy - (over.y - jy), level: F2.level };
        if (gkind === "room") { gableWindows(over, rect2, F2b); }
        var busy2 = [];
        if (door) {
          var dq = door === houseRoom ? [door.x, door.y] : (J && J.boxes[door.id] ? [(J.boxes[door.id].l + J.boxes[door.id].r) / 2, (J.boxes[door.id].t + J.boxes[door.id].b) / 2] : [door.x, door.y]);
          hand.links.push({ from: door.id, to: over.id, label: "", fit: [jx - dq[0], jy - dq[1]], attic: true });
        } else {
          var ladder = gkind === "storage", fw = ladder ? Math.round(ATTIC_LADDER[0] * P) : Math.round(0.95 * P), fl = ladder ? Math.round(ATTIC_LADDER[1] * P) : Math.round(2.9 * P);
          var s = spotIn(gr, fl + (ladder ? 0.5 * P : 0), fw, rect2);
          if (s) {
            var pair = flight(toPaper(gr, [s.x, s.y]), F2b, [s.x, s.y], ladder, s.long ? 90 : 0, fw, fl);
            busy2.push({ x: pair[1].x, y: pair[1].y, w: turned(pair[1]).w + 1.0 * P, h: turned(pair[1]).h + 1.0 * P });
          }
        }
        furnish(over, gkind, busy2);
      });
    }
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
      if (typeof worldPicker === "function") {
        worldPicker(sheet, ATTIC_KINDS, now.attic, "at_", function (k) { atticSet({ attic: k }); if (draw) { draw(); } });
        head(TXT.at_garage_head);
        worldPicker(sheet, ATTIC_KINDS, now.garage, "atg_", function (k) { atticSet({ garage: k }); if (draw) { draw(); } });
      }
      tiles([{ icon: "at_shed", label: TXT.at_shed_loft, on: !!houseOpt("shedLoft"), set: function (v) { houseSetOpt("shedLoft", v); } }]);
    });
  }
