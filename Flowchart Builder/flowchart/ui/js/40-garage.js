// ---------------------------------------------------------------------------
//  40-garage.js -- a garage as it is: its door in sections, rolling up its
//  tracks under the ceiling on an opener, worked by a button on the wall by
//  the door into the house and taking as long as a real one does; the
//  opener's light, its safety sensor; and garages for one car up to four
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update it so things that normally run off of
  // buttons to make it so like the garage door there is a button in the
  // house you have to press for it to open and close and to update it so
  // all things are of accurate time and to add a setting so you can do 1, 2
  // etc. car garage too")
  //
  // A garage door is not pushed open: E at it says where its button is.
  // The button (i_garagebtn, put down anywhere -- or, where a garage has
  // none, one on the wall by the door into the house, put there in 3D)
  // runs the opener as a real one does: pressed, the door goes; pressed
  // again while it moves, it stops; again, it goes back the other way.  It
  // lifts at seven inches a second, about twelve seconds for a door seven
  // feet high; the opener's light comes on as it runs and stays on four
  // and a half minutes; closing on somebody in the doorway, the safety
  // sensor sends it back up.
  var GD_SPEED = 0.178;                  // m/s an opener lifts a door: seven inches a second
  var GD_LIGHT_MS = 270000;              // the opener's light, on this long after it runs
  var GD_SECTION = 0.53;                 // m: a section of the door about this tall
  // the doors a garage of so many cars has, metres wide: a single door is
  // nine feet, a double sixteen -- three cars a double and a single
  var GD_DOORS = { 1: [[2.74, 1]], 2: [[4.88, 2]], 3: [[4.88, 2], [2.74, 1]], 4: [[4.88, 2], [4.88, 2]] };
  var GD = { want: {}, set: {}, last: {}, lit: {}, litSeen: {} };

  // ---- which room, which side, which button ----------------------------------------------------------
  function gdCars(want) { return Math.max(1, Math.min(4, Math.round(+((want && want.cars) || 2)) || 2)); }
  function gdAxes(n) {
    var a = (n.turn || 0) * Math.PI / 180;
    return { u: [Math.cos(a), Math.sin(a)], v: [-Math.sin(a), Math.cos(a)] };
  }
  // The garage a garage door is in the wall of, and which way (along its own
  // y) is in: +1 or -1.
  function gdRoomOf(d) {
    var P = FLOOR_PX, A = gdAxes(d), best = null;
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room" || !insideArea(r, d.x, d.y, -4)) { return; }
      [1, -1].forEach(function (s) {
        var x = d.x + A.v[0] * s * 0.6 * P, y = d.y + A.v[1] * s * 0.6 * P;
        if (insideArea(r, x, y) && (!best || r.w * r.h < best.r.w * best.r.h)) { best = { r: r, s: s }; }
      });
    });
    return best;
  }
  // (asked every picture: worked out again only when the drawing's list of shapes changes)
  var gdDoorsKept = { list: null, n: -1, doors: [] };
  function gdDoors() {
    var L = hand.nodes;
    if (gdDoorsKept.list !== L || gdDoorsKept.n !== L.length) {
      gdDoorsKept = { list: L, n: L.length, doors: L.filter(function (n) { return n.kind === "i_garagedoor"; }) };
    }
    return gdDoorsKept.doors;
  }
  // The doors a button runs: the one it was put up for; else every garage
  // door of the garage it is in; else those of the nearest garage, near enough.
  function gdDoorsOf(b, doors) {
    doors = doors || gdDoors();
    if (b.gd !== undefined) {
      var own = doors.filter(function (d) { return d.id === b.gd; });
      if (own.length) { return own; }
    }
    var mine = doors.filter(function (d) { var g = gdRoomOf(d); return g && insideArea(g.r, b.x, b.y, -2); });
    if (mine.length) { return mine; }
    var near = null, far = 14 * FLOOR_PX;
    doors.forEach(function (d) { var k = Math.hypot(d.x - b.x, d.y - b.y); if (k < far) { far = k; near = d; } });
    if (!near) { return []; }
    var g0 = gdRoomOf(near);
    return doors.filter(function (d) { var g = gdRoomOf(d); return d === near || (g && g0 && g.r === g0.r); });
  }
  // the doors through the garage's walls into the house (and out of it):
  // each a point on its wall line, its axes, how wide
  function gdHouseDoors(g, doors) {
    var T = roomWallOf(g), out = [];
    (doors || hand.nodes).forEach(function (d) {
      if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor") { return; }
      var A = gdAxes(d), line = SNAP_IN_WALL[d.kind] === "swing" ? d.h / 2 : 0;
      var c = [d.x + A.v[0] * line, d.y + A.v[1] * line];
      if (!insideArea(g, c[0], c[1], -T - 3) || insideArea(g, c[0], c[1], T + 3)) { return; }
      // (one leading into another room first: the door into the house)
      var beyond = [1, -1].map(function (s) { return [c[0] + A.v[0] * s * 30, c[1] + A.v[1] * s * 30]; });
      var gs = insideArea(g, beyond[0][0], beyond[0][1]) ? 1 : -1, o = beyond[gs > 0 ? 1 : 0];
      var house = hand.nodes.some(function (r) { return r.kind === "i_room" && r !== g && insideArea(r, o[0], o[1]); });
      out.push({ d: d, c: c, A: A, gs: gs, house: house });
    });
    out.sort(function (p, q) { return (q.house ? 1 : 0) - (p.house ? 1 : 0); });
    return out;
  }
  // Where `count` buttons go on the garage's wall, side by side: by the door
  // into the house, on the garage's side, past its handle's edge and above
  // the light switch there (five feet up, out of a child's reach -- V3_WALL);
  // a garage with no such door, on the wall inside by its garage door.
  function gdSpots(g, count, gdoor, houses) {
    var P = FLOOR_PX, T = roomWallOf(g), h = 8, out = [];
    function line(c, A, s, start, off) {
      [1, -1].some(function (side) {
        var spots = [];
        for (var k = 0; k < count; k++) {
          var a = side * (start + k * 0.14 * P);
          var x = c[0] + A.u[0] * a + A.v[0] * s * off, y = c[1] + A.u[1] * a + A.v[1] * s * off;
          if (!insideArea(g, x, y, T + 2)) { return false; }
          spots.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, turn: (((gdAxesTurn(A) + (s > 0 ? 0 : 180)) % 360) + 360) % 360 });
        }
        out = spots;
        return true;
      });
      return out.length;
    }
    var H = houses && houses[0];
    if (H && line(H.c, H.A, H.gs, H.d.w / 2 + 0.22 * P, T + h / 2)) { return out; }
    if (gdoor) {
      var gr = gdRoomOf(gdoor), A = gdAxes(gdoor);
      if (gr && line([gdoor.x, gdoor.y], A, gr.s, gdoor.w / 2 + 0.45 * P, T / 2 + h / 2)) { return out; }
    }
    return [];
  }
  function gdAxesTurn(A) { return Math.round(Math.atan2(A.u[1], A.u[0]) * 180 / Math.PI); }
  // The buttons put up in 3D where a garage door has none: one a door, by
  // the door into the house -- not in the design, only in the picture.
  function gdAutoButtons() {
    var doors = gdDoors();
    if (!doors.length) { return []; }
    var placed = hand.nodes.filter(function (n) { return n.kind === "i_garagebtn"; }), run = {};
    placed.forEach(function (b) { gdDoorsOf(b, doors).forEach(function (d) { run[d.id] = true; }); });
    var byRoom = {}, out = [];
    doors.forEach(function (d) {
      if (run[d.id]) { return; }
      var g = gdRoomOf(d);
      if (!g) { return; }
      (byRoom[g.r.id] || (byRoom[g.r.id] = { g: g.r, doors: [] })).doors.push(d);
    });
    Object.keys(byRoom).forEach(function (id) {
      var B = byRoom[id];
      var spots = gdSpots(B.g, B.doors.length, B.doors[0], gdHouseDoors(B.g));
      B.doors.forEach(function (d, i) {
        var s = spots[i];
        if (!s) { return; }
        var n = { id: -880000 - d.id, kind: "i_garagebtn", text: "", x: s.x, y: s.y, turn: s.turn, gd: d.id, gdAuto: true };
        measure(n);
        out.push(n);
      });
    });
    return out;
  }

  // ---- the opener: going, stopped, back the other way ------------------------------------------------
  function gdAt(d) {
    var at = V3 && V3.doorAt ? V3.doorAt[d.id] : undefined;
    return at !== undefined ? at : (doorIsOpen(d) ? 90 : 0);
  }
  function gdWant(d) { return GD.want[d.id] !== undefined ? GD.want[d.id] : (doorIsOpen(d) ? 90 : 0); }
  function gdGo(d, to) {
    var at = gdAt(d);
    GD.want[d.id] = to;
    GD.last[d.id] = to > at ? 1 : -1;
    doorOpen[d.id] = to > 0;
    GD.set[d.id] = to > 0;
    gdLight(d);
    if (V3) { V3.dirty = true; }
  }
  function gdLight(d) {
    var secs = openHead(d) / FLOOR_PX / GD_SPEED;
    GD.lit[d.id] = performance.now() + secs * 1000 + GD_LIGHT_MS;
  }
  function gdLit(d) { return (GD.lit[d.id] || 0) > performance.now(); }
  // A press: going, it stops; stopped part way, it goes back the way it came;
  // shut, it opens; open, it shuts.  Said for the first door it runs.
  function gdPress(b) {
    var doors = gdDoorsOf(b);
    if (!doors.length) { v3Say(TXT.gd_no_door); return; }
    var word = null;
    doors.forEach(function (d) {
      if (typeof doorLocked === "function" && doorLocked(d)) { word = word || TXT.o3_locked; return; }
      var at = gdAt(d), want = gdWant(d);
      if (Math.abs(at - want) > 0.5) {
        GD.want[d.id] = at; GD.set[d.id] = !!doorOpen[d.id]; gdLight(d);
        word = word || TXT.gd_stopped;
      } else {
        var up = at <= 0.5 ? true : at >= 89.5 ? false : GD.last[d.id] < 0;
        gdGo(d, up ? 90 : 0);
        word = word || (up ? TXT.gd_opening : TXT.gd_closing);
      }
    });
    if (word) { v3Say(word); }
    if (V3) { V3.dirty = true; }
  }
  // What the button would do now, for the mark in the middle of the view.
  function gdVerb(b) {
    var d = gdDoorsOf(b)[0];
    if (!d) { return TXT.gd_open; }
    var at = gdAt(d), want = gdWant(d);
    if (Math.abs(at - want) > 0.5) { return TXT.gd_stop; }
    return at <= 0.5 || (at < 89.5 && GD.last[d.id] < 0) ? TXT.gd_open : TXT.gd_close;
  }

  // How far a garage door stands open now (40-doors.js): where its opener
  // has it going -- or, set some other way (a lorry moving in, 40-movein.js;
  // somebody walking through on a run), as that says.
  if (typeof doorSwingTo === "function") {
    var doorSwingToGd = doorSwingTo;
    doorSwingTo = function (n) {
      if (!n || n.kind !== "i_garagedoor" || GD.want[n.id] === undefined) { return doorSwingToGd.apply(this, arguments); }
      if (!!doorOpen[n.id] !== GD.set[n.id]) { delete GD.want[n.id]; delete GD.set[n.id]; return doorSwingToGd.apply(this, arguments); }
      return GD.want[n.id];
    };
  }
  // and how fast: at the opener's speed (38-view3d.js)
  if (typeof doorRate === "function") {
    var doorRateGd = doorRate;
    doorRate = function (n) {
      if (n && n.kind === "i_garagedoor") { return 90 / Math.max(1, openHead(n) / FLOOR_PX / GD_SPEED); }
      return doorRateGd.apply(this, arguments);
    };
  }
  // Each picture: closing on somebody standing in the doorway, the safety
  // sensor sends it back up; the opener's light, gone out, drawn out.
  // (in the house as it stands -- rooms drawn apart put together, 39-join.js --
  // where you are walking)
  var gdFrame = (typeof tieWith === "function" ? tieWith : function (f) { return f; })(function () {
    if (!V3 || !V3.doorAt || V3.scene === "space") { return; }
    var now = performance.now();
    gdDoors().forEach(function (d) {
      var at = V3.doorAt[d.id];
      if (at === undefined) { return; }
      if (GD.want[d.id] === 0 && at > 0.5 && V3.mode === "walk" && V3.me && gdInWay(d)) {
        gdGo(d, 90);
        v3Say(TXT.gd_eye);
      }
      var lit = (GD.lit[d.id] || 0) > now;
      if (GD.litSeen[d.id] !== lit) {
        GD.litSeen[d.id] = lit;
        // (its picture kept while it has not moved: moved a hair, it is made again with the light as it is)
        V3.doorAt[d.id] = at + (at >= 90 ? -1e-6 : 1e-6);
        V3.dirty = true;
      }
    });
  }, 1);
  if (typeof v3Watch === "function") {
    var v3WatchGd = v3Watch;
    v3Watch = function () {
      try { gdFrame(); } catch (e) { /* the doors as they were */ }
      return v3WatchGd.apply(this, arguments);
    };
  }
  function gdInWay(d) {
    var me = V3.me, P = FLOOR_PX, A = gdAxes(d), dx = me.x - d.x, dy = me.y - d.y;
    var along = dx * A.u[0] + dy * A.u[1], across = dx * A.v[0] + dy * A.v[1];
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    if (floors.length && floorAt(floors, me.x, me.y) !== floorAt(floors, d.x, d.y)) { return false; }
    return Math.abs(along) < d.w / 2 && Math.abs(across) < 0.45 * P;
  }

  // ---- used, walking round -----------------------------------------------------------------------------
  // the button is something to use (39-inside.js): it presses the opener's button
  if (typeof useKind === "function") {
    var useKindGd = useKind;
    useKind = function (n) { return n && n.kind === "i_garagebtn" ? "opener" : useKindGd.apply(this, arguments); };
  }
  if (typeof useIt === "function") {
    var useItGd = useIt;
    useIt = function (n) {
      if (n && n.kind === "i_garagebtn") { gdPress(n); return; }
      return useItGd.apply(this, arguments);
    };
  }
  if (typeof o3Verb === "function") {
    var o3VerbGd = o3Verb;
    o3Verb = function (a) {
      if (a && a.n && a.n.kind === "i_garagebtn") { return gdVerb(a.n); }
      if (a && a.door && a.n && a.n.kind === "i_garagedoor") { return TXT.gd_door_verb; }
      return o3VerbGd.apply(this, arguments);
    };
  }
  // E (or a click) at the garage door itself: where its button is, and no
  // more -- before any hand reaches out to push it (40-hands.js)
  if (typeof o3Act === "function") {
    var o3ActGd = o3Act;
    o3Act = function (a) {
      if (a && a.door && a.n && a.n.kind === "i_garagedoor" && a.near) {
        v3Say(TXT.gd_use_button);
        return true;
      }
      return o3ActGd.apply(this, arguments);
    };
  }
  // and E with no aim (the old way, the painted view): a garage door it
  // would have pushed is let be, and said so
  if (typeof v3UseDoor === "function") {
    var v3UseDoorGd = v3UseDoor;
    v3UseDoor = function () {
      var before = {}, doors = [];
      try { doors = gdDoors(); doors.forEach(function (d) { before[d.id] = doorOpen[d.id]; }); } catch (e) { doors = []; }
      var out = v3UseDoorGd.apply(this, arguments);
      doors.forEach(function (d) {
        if (doorOpen[d.id] === before[d.id] || (GD.set[d.id] !== undefined && GD.set[d.id] === !!doorOpen[d.id])) { return; }
        if (before[d.id] === undefined) { delete doorOpen[d.id]; } else { doorOpen[d.id] = before[d.id]; }
        v3Say(TXT.gd_use_button);
      });
      return out;
    };
  }

  // ---- drawn ---------------------------------------------------------------------------------------------
  // The buttons a garage has only in the picture: put up with the rest, as
  // a piece is (its model, 38-models.js), and taken out again after.
  if (typeof v3Build === "function") {
    var v3BuildGd = v3Build;
    v3Build = function () {
      var add = [];
      try { if (V3 && V3.scene !== "space") { add = gdAutoButtons(); } } catch (e) { add = []; }
      if (!add.length) { return v3BuildGd.apply(this, arguments); }
      var list = hand.nodes;
      Array.prototype.push.apply(list, add);
      try { return v3BuildGd.apply(this, arguments); }
      finally { for (var i = list.length - 1; i >= 0; i--) { if (list[i].gdAuto) { list.splice(i, 1); } } }
    };
  }
  // A box in the door's own numbers turned up on its edge: from A to B (each
  // [y, z], across the wall and up), x0 to x1 along the wall, t thick.
  function gdSlab(faces, n, x0, x1, A, B, t, how) {
    var a = (n.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var dy = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dy, dz) || 1;
    dy /= L; dz /= L;
    var py = -dz * t / 2, pz = dy * t / 2;
    function W(x, q) { var p = v3Local(n, x, q[0]); return [p[0], p[1], q[1]]; }
    function N(nx, ny, nz) { return [nx * c - ny * s, nx * s + ny * c, nz]; }
    var c1 = [A[0] - py, A[1] - pz], c2 = [B[0] - py, B[1] - pz], c3 = [B[0] + py, B[1] + pz], c4 = [A[0] + py, A[1] + pz];
    function quad(p, nn) { faces.push({ pts: p, n: nn, how: how, side: Math.abs(nn[2]) < 0.7, top: nn[2] >= 0.7 }); }
    quad([W(x0, c1), W(x1, c1), W(x1, c2), W(x0, c2)], N(0, dz, -dy));
    quad([W(x0, c4), W(x1, c4), W(x1, c3), W(x0, c3)], N(0, -dz, dy));
    quad([W(x0, c1), W(x1, c1), W(x1, c4), W(x0, c4)], N(0, -dy, -dz));
    quad([W(x0, c2), W(x1, c2), W(x1, c3), W(x0, c3)], N(0, dy, dz));
    quad([W(x0, c1), W(x0, c2), W(x0, c3), W(x0, c4)], N(-1, 0, 0));
    quad([W(x1, c1), W(x1, c2), W(x1, c3), W(x1, c4)], N(1, 0, 0));
  }
  // The way a garage door's sections run, as a point [y, z] at `u` along it
  // from the floor: up the door's line, round the bend (radius r), and in
  // under the ceiling -- s the way in.
  function gdTrack(u, yd, H, r, s) {
    if (u <= H) { return [yd, u]; }
    var bend = Math.PI * r / 2;
    if (u <= H + bend) { var th = (u - H) / r; return [yd + s * r * (1 - Math.cos(th)), H + r * Math.sin(th)]; }
    return [yd + s * (r + u - H - bend), H + r];
  }
  // A garage door as it is made: sections that roll up their tracks on
  // rollers and in under the ceiling, the tracks hung from it, and the
  // opener on its rail in the middle -- the arm from its carriage to the
  // top section, its light under it (lit as it runs, and for a while
  // after), the safety sensors low on the tracks.
  function gdDoor(faces, n, open) {
    var P = FLOOR_PX, cm = P / 100, own = simLook(n), H = openHead(n), hw = n.w / 2, J = 1.5, deep = 6.5;
    var g = gdRoomOf(n), s = g ? g.s : 1, k = Math.max(0, Math.min(1, open / 90));
    var ceil = g ? ceilOf(g.r) * P : H + 0.8 * P;
    var trimC = typeof styleTrim === "function" ? styleTrim("#f1eee8") : "#f1eee8";
    var trim = { piece: true, color: trimC, edge: own.line };
    // the frame round the opening, as it was
    v3Box(faces, n, -hw, -hw + J, -deep, deep, 0, H, trim);
    v3Box(faces, n, hw - J, hw, -deep, deep, 0, H, trim);
    v3Box(faces, n, -hw, hw, -deep, deep, H - 0.4, H + 1.2, trim);
    // the sections, just inside the opening
    var t = 2.2, yd = s * (deep + 1.4), r = Math.max(0.15 * P, Math.min(0.38 * P, ceil - H - 0.12 * P));
    var count = Math.max(3, Math.round(H / (GD_SECTION * P))), hs = H / count, gap = 0.3, u0 = k * H;
    var look = { leaf: true, color: own.fill, edge: own.line };
    var inset = { leaf: true, color: v3Mix(own.fill, "#000000", 0.07), edge: own.line };
    var cols = Math.max(2, Math.round(n.w / (0.78 * P))), cw = (n.w - 2.4) / cols;
    for (var i = 0; i < count; i++) {
      var A = gdTrack(u0 + i * hs + gap / 2, yd, H, r, s), B = gdTrack(u0 + (i + 1) * hs - gap / 2, yd, H, r, s);
      gdSlab(faces, n, -hw + 1.2, hw - 1.2, A, B, t, look);
      // its panels, pressed into the face to the street (s: which face that is, as it turns)
      var dy = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dy, dz) || 1, oy = -s * dz / L * (t / 2 + 0.15), oz = s * dy / L * (t / 2 + 0.15);
      var A2 = [A[0] + (B[0] - A[0]) * 0.14 + oy, A[1] + (B[1] - A[1]) * 0.14 + oz], B2 = [A[0] + (B[0] - A[0]) * 0.86 + oy, A[1] + (B[1] - A[1]) * 0.86 + oz];
      for (var c = 0; c < cols; c++) {
        var x0 = -hw + 1.2 + c * cw + cw * 0.08, x1 = -hw + 1.2 + (c + 1) * cw - cw * 0.08;
        gdSlab(faces, n, x0, x1, A2, B2, 0.3, inset);
      }
      // the seal along the bottom, and a handle on the bottom section
      if (i === 0) {
        var Ab = gdTrack(u0, yd, H, r, s), Bb = gdTrack(u0 + 1.2, yd, H, r, s);
        gdSlab(faces, n, -hw + 1.2, hw - 1.2, Ab, Bb, t + 0.6, { piece: true, color: "#2a2b2d", edge: "#1a1b1d" });
      }
    }
    // the tracks: up each side, round the bend, in under the ceiling, and hung from it
    var metal = { piece: true, color: "#b9bec3", edge: "#7d8287", pat: 22 };
    var deepIn = H + 0.5 * P, steps = [0, H];
    for (var b = 1; b <= 4; b++) { steps.push(H + Math.PI * r / 2 * b / 4); }
    steps.push(H + Math.PI * r / 2 + deepIn);
    [-1, 1].forEach(function (side) {
      var xa = side > 0 ? hw - 0.2 : -hw - 1.4, xb = side > 0 ? hw + 1.4 : -hw + 0.2;
      for (var q = 0; q + 1 < steps.length; q++) {
        gdSlab(faces, n, xa, xb, gdTrack(steps[q], yd, H, r, s), gdTrack(steps[q + 1], yd, H, r, s), 3.0, metal);
      }
      // a hanger down from the ceiling at the far end, and the safety sensor low on the track
      var end = gdTrack(steps[steps.length - 1], yd, H, r, s);
      if (ceil - (H + r) > 1.5) { gdSlab(faces, n, xa, xb, [end[0] - s * 1.0, H + r + 1.5], [end[0] - s * 1.0, ceil], 1.0, metal); }
      gdSlab(faces, n, side > 0 ? hw + 1.4 : -hw - 3.4, side > 0 ? hw + 3.4 : -hw - 1.4, [yd + s * 1.6, 0.13 * P], [yd + s * 1.6, 0.19 * P], 2.4,
             { piece: true, color: "#2f3236", edge: "#1a1b1d" });
      gdSlab(faces, n, side > 0 ? hw + 2.0 : -hw - 2.8, side > 0 ? hw + 2.8 : -hw - 2.0, [yd + s * 2.9, 0.155 * P], [yd + s * 2.9, 0.165 * P], 0.4,
             { piece: true, color: side > 0 ? "#45d16a" : "#ff8a3d", edge: "#1a1b1d", pat: 31 });
    });
    // the opener: its rail down the middle from over the door, the motor at
    // the far end hung from the ceiling, its light, and the arm from the
    // carriage on the rail to the top section
    var zr = Math.min(ceil - 0.22 * P, H + r + 0.06 * P), farY = yd + s * (r + H - Math.PI * r / 2 + 0.55 * P);
    var rail = { piece: true, color: "#8d9298", edge: "#5d6166", pat: 22 };
    gdSlab(faces, n, -1.2, 1.2, [yd + s * 2.5, zr + 1.0], [farY, zr + 1.0], 2.0, rail);
    gdSlab(faces, n, -3.0, 3.0, [yd + s * 1.0, H + 1.0], [yd + s * 2.6, H + 1.0], 3.0, rail);        // the bracket over the door
    var motor = { piece: true, color: "#e9e8e4", edge: "#9ea3a8" };
    var mz0 = zr - 0.08 * P, mz1 = Math.min(ceil - 0.06 * P, zr + 0.12 * P);
    gdSlab(faces, n, -0.19 * P, 0.19 * P, [farY, (mz0 + mz1) / 2], [farY + s * 0.55 * P, (mz0 + mz1) / 2], mz1 - mz0, motor);
    gdSlab(faces, n, -0.12 * P, 0.12 * P, [farY + s * 0.08 * P, mz0 - 0.5], [farY + s * 0.42 * P, mz0 - 0.5], 1.0,
           { piece: true, color: gdLit(n) ? "#fff4d6" : "#d9d6cc", edge: "#b8b4a8", pat: gdLit(n) ? 31 : 0 });
    if (ceil - mz1 > 0.5) {
      [-0.16 * P, 0.16 * P].forEach(function (x) { gdSlab(faces, n, x - 0.6, x + 0.6, [farY + s * 0.27 * P, mz1], [farY + s * 0.27 * P, ceil], 0.6, rail); });
    }
    var top = gdTrack(u0 + H - 0.12 * P, yd, H, r, s), ty = yd + s * (0.32 * P + u0);
    gdSlab(faces, n, -2.0, 2.0, [ty - s * 1.6, zr], [ty + s * 1.6, zr], 1.8, motor);                  // the carriage
    gdSlab(faces, n, -0.6, 0.6, [ty, zr - 0.4], [top[0] + s * (t / 2 + 0.6), top[1]], 1.0, rail);    // the arm
  }
  if (typeof v3Door === "function") {
    var v3DoorGd = v3Door;
    v3Door = function (faces, n, open) {
      if (!n || n.kind !== "i_garagedoor") { return v3DoorGd.apply(this, arguments); }
      var f0 = faces.length;
      try { gdDoor(faces, n, Math.min(90, Math.max(0, open))); }
      catch (e) { faces.length = f0; return v3DoorGd.apply(this, arguments); }
      // (on its way up or down, a dozen seconds: put in apart, with what moves,
      // so the rest of the house is kept as it was each picture -- 38-view3d-gl.js)
      if (open > 0.01 && open < 89.99) { for (var i = f0; i < faces.length; i++) { faces[i].moves = true; } }
    };
  }

  // ---- Start a house: a garage for so many cars --------------------------------------------------------
  // (39-starter.js makes the garage as wide as the cars need, starterGarageW)
  // Its doors -- a double for two, a single for one, side by side -- its
  // cars, one in each bay nose in, the drive as wide as the doors, and a
  // button for each door on the wall by the door into the house.
  function gdFurnish(want) {
    var P = FLOOR_PX, cars = gdCars(want), plan = GD_DOORS[cars];
    var made = (typeof starterLast === "object" ? starterLast : []).filter(function (o) { return o && o.kind === "garage" && o.room; });
    made.forEach(function (o) {
      var g = o.room, b = tieBox(g);
      var olds = hand.nodes.filter(function (n) { return n.kind === "i_garagedoor" && insideArea(g, n.x, n.y, -4); });
      if (!olds.length) { return; }
      var d0 = olds[0], A = gdAxes(d0), gr = gdRoomOf(d0), s = gr ? gr.s : 1, T = roomWallOf(g);
      // along its wall: the garage from end to end, the door as it was
      var lo = Infinity, hi = -Infinity;
      [[b.l, b.t], [b.r, b.t], [b.l, b.b], [b.r, b.b]].forEach(function (p) {
        var q = (p[0] - d0.x) * A.u[0] + (p[1] - d0.y) * A.u[1];
        lo = Math.min(lo, q); hi = Math.max(hi, q);
      });
      var oldLo = Infinity, oldHi = -Infinity;
      olds.forEach(function (d) { var q = (d.x - d0.x) * A.u[0] + (d.y - d0.y) * A.u[1]; oldLo = Math.min(oldLo, q - d.w / 2); oldHi = Math.max(oldHi, q + d.w / 2); });
      hand.nodes = hand.nodes.filter(function (n) { return olds.indexOf(n) < 0 && !(n.kind === "i_parked" && insideArea(g, n.x, n.y)); });
      var post = 0.6 * P, total = plan.reduce(function (sum, p) { return sum + p[0] * P; }, 0) + post * (plan.length - 1);
      var at = (lo + hi) / 2 - total / 2, doors = [], bays = [];
      plan.forEach(function (p) {
        var w = Math.round(p[0] * P), mid = at + w / 2;
        var nd = adviceAdd("i_garagedoor", Math.round(d0.x + A.u[0] * mid), Math.round(d0.y + A.u[1] * mid), d0.turn || 0);
        nd.w = w; nd.h = d0.h; nd.own = true; nd.text = d0.text || "";
        if (!nd.turn) { delete nd.turn; }
        doors.push(nd);
        for (var c = 0; c < p[1]; c++) { bays.push(mid + (p[1] > 1 ? (c - (p[1] - 1) / 2) * w / p[1] : 0)); }
        at += w + post;
      });
      var span = [(lo + hi) / 2 - total / 2, (lo + hi) / 2 + total / 2], across = !((d0.turn || 0) % 180);
      // nothing in the way of a door or a car: what was put against the wall
      // the doors are in now (the garage is furnished before it has its
      // doors -- a workbench stood across the door), or out where the cars
      // stand, put against another wall instead; left out, with no room
      var keep = doors.map(function (d) {
        var depth = 0.25 * P + 4.0 * P + 0.2 * P, mid = T / 2 + depth / 2, along = d.w + 0.3 * P;     // (the door shut behind a car, and a step past its nose)
        return { id: -1, kind: "i_door", text: "", x: d.x + A.v[0] * s * mid, y: d.y + A.v[1] * s * mid,
                 w: across ? along : depth, h: across ? depth : along };
      });
      hand.nodes.filter(function (n) {
        return n !== g && insideArea(g, n.x, n.y, -4) && !isArea(n.kind) && !WALK_DOORS[n.kind] && n.kind !== "i_window" &&
               !FROM_CEILING[n.kind] && !LIES_FLAT[n.kind] && n.kind !== "i_parked" && n.kind !== "i_garagebtn" &&
               // (the way up to the loft over it, 40-attic.js: a ladder folds up into the ceiling over the car;
               // taken away, its top was left going nowhere -- the stairs are kept clear of the cars there)
               !n.attic &&
               keep.some(function (z) { return boxesTouch(n, z, 2); });
      }).forEach(function (m) {
        hand.nodes = hand.nodes.filter(function (n) { return n !== m; });
        var go = typeof starterAlong === "function" ? starterAlong(g, m.kind, null, keep) : null;
        if (!go) { return; }
        go();
        var nn = nodeById(picked);
        if (!nn || nn.kind !== m.kind) { return; }
        Object.keys(m).forEach(function (key) {
          if (["id", "x", "y", "turn", "w", "h", "own"].indexOf(key) < 0) { nn[key] = m[key]; }
        });
      });
      // the drive, as wide as the doors now are
      hand.nodes.forEach(function (dv) {
        if (dv.kind !== "i_driveway" || ((dv.turn || 0) % 180)) { return; }
        var q = (dv.x - d0.x) * A.u[0] + (dv.y - d0.y) * A.u[1], out = (dv.x - d0.x) * A.v[0] + (dv.y - d0.y) * A.v[1];
        if (q < oldLo - 20 || q > oldHi + 20 || out * s > 0) { return; }
        var mid = (span[0] + span[1]) / 2;
        if (across) { dv.x = Math.round(d0.x + A.u[0] * mid); dv.w = Math.round(span[1] - span[0] + 10); }
        else { dv.y = Math.round(d0.y + A.u[1] * mid); dv.h = Math.round(span[1] - span[0] + 10); }
        dv.own = true;
      });
      // a car in each bay, nose in, as near the door as lets the door shut
      // behind it, clear of what stands in the garage
      var others = hand.nodes.filter(function (n) {
        return n !== g && insideArea(g, n.x, n.y, -30) && !isArea(n.kind) && !ON_THE_WALL[n.kind] && !LIES_FLAT[n.kind] &&
               n.kind !== "i_window" && !FROM_CEILING[n.kind] && (n.kind !== "i_garagedoor");
      });
      bays.forEach(function (q) {
        var car = { kind: "i_parked", text: "", x: 0, y: 0 };
        measure(car);
        var turn = (((d0.turn || 0) + (s > 0 ? 180 : 0)) % 360 + 360) % 360, len = car.h;
        var spot = null;
        for (var dIn = T / 2 + 0.25 * P + len / 2; dIn < 12 * P && !spot; dIn += 0.1 * P) {
          var x = d0.x + A.u[0] * q + A.v[0] * s * dIn, y = d0.y + A.u[1] * q + A.v[1] * s * dIn;
          var probe = { kind: "i_parked", x: x, y: y, w: car.w, h: car.h, turn: turn };
          var tq = turned(probe);
          if (!insideArea(g, x - tq.w / 2, y - tq.h / 2, T + 2) || !insideArea(g, x + tq.w / 2, y + tq.h / 2, T + 2)) { break; }
          if (others.some(function (n) { return boxesTouch(probe, n, 3); })) { continue; }
          spot = probe;
        }
        if (!spot) { return; }
        var node = adviceAdd("i_parked", Math.round(spot.x), Math.round(spot.y), turn || 0);
        if (!node.turn) { delete node.turn; }
        others.push(node);
      });
      // a button for each door by the door into the house -- the doors as
      // the house will stand (39-join.js), in the garage's own numbers here
      var J = typeof tieLayout === "function" ? tieLayout() : null, shift = J && J.delta && J.delta[g.id] ? J.delta[g.id] : [0, 0];
      var near = hand.nodes.slice();
      if (J) {
        near = near.map(function (d) { var m = J.moves && J.moves[d.id]; return m && WALK_DOORS[d.kind] ? Object.assign({}, d, m) : d; });
        (J.made || []).forEach(function (one) { if (one.node && WALK_DOORS[one.node.kind]) { near.push(one.node); } });
        near = near.map(function (d) { return WALK_DOORS[d.kind] ? Object.assign({}, d, { x: d.x - shift[0], y: d.y - shift[1] }) : d; });
      }
      var spots = gdSpots(g, doors.length, doors[0], gdHouseDoors(g, near));
      doors.forEach(function (d, i) {
        var sp = spots[i];
        if (!sp) { return; }
        var bt = adviceAdd("i_garagebtn", sp.x, sp.y, sp.turn || 0);
        bt.text = ""; bt.gd = d.id; bt.own = true;
        if (!bt.turn) { delete bt.turn; }
      });
    });
  }
  if (typeof STARTER_WRAPS === "object") {
    var gdWrap = function* (inner, want) {
      var out = yield* inner(want);
      // (what was picked before kept picked: not the last button put up)
      var was = typeof picked !== "undefined" ? picked : null;
      try { if (want && want.garage && (!want.type || want.type === "house")) { gdFurnish(want); yield ["garage", 1]; } }
      catch (e) { if (window.console && console.warn) { console.warn("garage:", e && e.message); } }
      finally { picked = was !== null && nodeById(was) ? was : null; }
      return out;
    };
    var gdHoodAt = -1;
    STARTER_WRAPS.forEach(function (fn, i) { if (gdHoodAt < 0 && (String(fn).indexOf("hoodBuild") >= 0 || String(fn).indexOf("hoodAsk") >= 0)) { gdHoodAt = i; } });
    if (gdHoodAt >= 0) { STARTER_WRAPS.splice(gdHoodAt, 0, gdWrap); } else { STARTER_WRAPS.unshift(gdWrap); }
  }
  // Asked with the garage: for how many cars (shown while there is a garage)
  if (typeof roomsAsk === "function") {
    var roomsAskGd = roomsAsk;
    roomsAsk = function (ui, want) {
      try {
        if (want.cars === undefined) { want.cars = 2; }
        ui.head(TXT.gd_cars_head);
        ui.tiles();
        [1, 2, 3, 4].forEach(function (c) {
          ui.tile(TXT["gd_cars_" + c], "gd_car" + c, function () { return gdCars(want) === c; }, function () { want.cars = c; }, true);
        });
        // (the row and its heading kept out of the way while there is no garage --
        // found once the sheet is up: it is made before it is put on the page)
        setTimeout(function () { gdCarsShown(want); }, 0);
      } catch (e) { /* asked without it */ }
      return roomsAskGd.apply(this, arguments);
    };
  }
  function gdCarsShown(want) {
    var marks = document.querySelectorAll(".st-tile [data-gd-car]");
    if (!marks.length) { return; }
    var grid = marks[0].closest(".st-tiles"), heading = grid ? grid.previousElementSibling : null;
    function show() {
      var on = !!want.garage;
      if (grid) { grid.style.display = on ? "" : "none"; }
      if (heading && heading.classList.contains("st-head")) { heading.style.display = on ? "" : "none"; }
    }
    // (every tile on the sheet is refreshed when any is pressed: the garage's own too)
    Array.prototype.forEach.call(document.querySelectorAll(".st-pick .st-tile"), function (b) {
      if (b.gdShown) { return; }
      b.gdShown = true;
      var was = b.refresh;
      b.refresh = function () { if (was) { was(); } show(); };
    });
    show();
  }
  if (typeof HOUSE_ICONS === "object") {
    [1, 2, 3, 4].forEach(function (c) {
      var w = (13.6 - (c - 1) * 1.2) / c, out = "";
      for (var i = 0; i < c; i++) {
        var x = 3.2 + i * (w + 1.2);
        out += '<rect x="' + x.toFixed(2) + '" y="5.4" width="' + w.toFixed(2) + '" height="10.6" rx="' + Math.min(1.4, w / 3).toFixed(2) + '"/>' +
               '<path d="M' + (x + w * 0.2).toFixed(2) + ' 8.4h' + (w * 0.6).toFixed(2) + '"/>';
      }
      HOUSE_ICONS["gd_car" + c] = '<path data-gd-car="' + c + '" d="M2 4.2h16"/>' + out;
    });
  }
