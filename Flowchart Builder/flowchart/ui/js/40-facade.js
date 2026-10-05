// ---------------------------------------------------------------------------
//  40-facade.js -- a tall building's windows in rows and columns: the same
//  places on every floor, one size, one height, whatever the rooms behind
//  each floor's wall are -- the way a block of flats, an office or a school
//  is drawn by an architect, not a window put where each room happens to be
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "These windows do not look so good on the main
  // building and should be designed to be the same for all the floors even
  // if the layout is different internally but it has to make sure it works
  // for all the layouts in all the tall buildings")
  //
  // Start building puts each room's windows in its own share of each outside
  // wall (39-starter.js, then 40-fronts.js for a building's kinds of room):
  // a floor of flats and the lobby under it, a landing here and a flat there,
  // each had theirs somewhere else, of another width.  Here, once a building
  // of two storeys or more is made: each face of it (each line of outside
  // wall, on every floor -- its courtyards too, 40-shapes.js) is given one
  // row of places, as far apart on every floor, and every floor has a window
  // at each of those places where its wall is there and the window can go:
  // wholly in one room's wall (not across the wall between two rooms), not
  // in a room that has none (a lift, a store, a washroom), not over a door
  // or behind something tall against the wall.  The places are picked so as
  // many of them as can be are windows on every floor, and every room that
  // wants one has at least one.
  var FC_SPEC = {
    apartments: { w: 1.5, m: 3.0, sill: 0.7, head: 2.3 },
    condos: { w: 1.5, m: 3.0, sill: 0.7, head: 2.3 },
    office: { w: 2.0, m: 2.7, sill: 0.75, head: 2.6 },
    school: { w: 2.0, m: 3.0, sill: 0.8, head: 2.6 }
  };
  var FC_MIN_STOREYS = 2;
  // rooms that want a window of their own (the rest may have one, or not)
  var FC_WANTS = { flat: 1, flatbed: 1, flatbed2: 1, openoffice: 1, office: 1, meeting: 1, classroom: 1, staff: 1, lobby: 1, reception: 1,
                   kitchenette: 1, living: 1, kitchen: 1, training: 1, cubicles: 1, boardroom: 1, directors: 1, cafeteria: 1, nurse: 1, gym: 1 };
  // rooms that have none: a lift's shaft, a store, a washroom, a courtyard (open to the sky)
  var FC_NONE = { lift: 1, stock: 1, fitting: 1, restroom: 1, washroom: 1, court: 1 };
  // and of those, the ones that must (a bedroom, a home's living room: 38-advice.js asks it) -- the
  // rest are let go dark before a face's rows are let out of line with the rest of its side
  var FC_MUSTS = { flat: 1, flatbed: 1, flatbed2: 1, living: 1, kitchen: 1 };
  var FC_TALL = 1.1;                     // metres: what stands taller than this against the wall keeps a window off it

  // (Start building draws a floor's rooms apart on the paper, joined by
  // arrows; they are put together in 3D -- 39-join.js's tieLayout -- and it
  // is put together that a wall is outside or not.  Where each room, and each
  // thing in it, is put together, on its floor stacked over the ground floor's.)
  function fcBox(J, floors, r) {
    var g = floorAt(floors, r.x, r.y), B = (J && J.boxes && J.boxes[r.id]) || tieBox(r), dx = g ? g.dx || 0 : 0, dy = g ? g.dy || 0 : 0;
    return { l: B.l + dx, r: B.r + dx, t: B.t + dy, b: B.b + dy };
  }
  function fcAt(J, f, n) {
    var m = J && J.moves && J.moves[n.id], sh = m ? fcShift.get(n) : null;
    return [(m ? m.x + (sh ? sh[0] : 0) : n.x) + (f.dx || 0), (m ? m.y + (sh ? sh[1] : 0) : n.y) + (f.dy || 0)];
  }
  function fcRooms(floors, f) {
    return hand.nodes.filter(function (r) {
      if (r.kind !== "i_room" || r.shVoid || (r.turn || 0) % 90) { return false; }
      var g = floorAt(floors, r.x, r.y);
      return g && g.z === f.z;
    });
  }
  // Each room's outside walls, as runs along them -- in the building's own
  // numbers (the floors stacked, floorsOf's dx, dy) -- and which face each is on.
  function fcRuns(floors, f, list, P, J) {
    var out = [], step = 0.2 * P;
    var boxes = list.map(function (r) { return fcBox(J, floors, r); });
    list.forEach(function (r, i) {
      if (floorAt(floors, r.x, r.y) !== f) { return; }
      var b = boxes[i], T = roomWallOf(r), off = T + 0.35 * P;
      [{ side: "t", across: true, line: b.t, out: -1 }, { side: "b", across: true, line: b.b, out: 1 },
       { side: "l", across: false, line: b.l, out: -1 }, { side: "r", across: false, line: b.r, out: 1 }].forEach(function (e) {
        var lo = e.across ? b.l : b.t, hi = e.across ? b.r : b.b, runA = null;
        function outside(s) {
          var x = e.across ? s : e.line + e.out * off, y = e.across ? e.line + e.out * off : s;
          for (var j = 0; j < boxes.length; j++) {
            if (j === i) { continue; }
            var q = boxes[j];
            if (x > q.l + 0.5 && x < q.r - 0.5 && y > q.t + 0.5 && y < q.b - 0.5) { return false; }
          }
          return true;
        }
        for (var s = lo + step / 2; s <= hi; s += step) {
          var o = outside(s);
          if (o && runA === null) { runA = Math.max(lo, s - step / 2); }
          if ((!o || s + step > hi) && runA !== null) {
            var runB = o ? hi : s - step / 2;
            if (runB - runA > 0.6 * P) { out.push({ room: r, f: f, side: e.side, across: e.across, line: e.line, a: runA, b: runB, T: T }); }
            runA = null;
          }
        }
      });
    });
    return out;
  }
  // What keeps a window off a stretch of wall: a door in it, something tall
  // against it, something hung on it as high as the glass.
  function fcBlocks(pieces, f, run, spec, P, J) {
    var out = [];
    pieces.forEach(function (n) {
      var q = turned(n), at = fcAt(J, f, n), x = at[0], y = at[1];
      var along = run.across ? x : y, half = (run.across ? q.w : q.h) / 2;
      if (along + half < run.a || along - half > run.b) { return; }
      var gap = Math.abs((run.across ? y : x) - run.line) - (run.across ? q.h : q.w) / 2;
      if (WALK_DOORS[n.kind] || n.kind === "i_slide") {
        if (gap <= run.T + 8) { out.push([along - half - 0.35 * P, along + half + 0.35 * P, "door"]); }
        return;
      }
      if (ON_THE_WALL[n.kind]) {
        if (gap > 0.3 * P) { return; }
        var hang = typeof wallHang === "function" ? wallHang(n) : null;
        if (hang && (hang[1] < spec.sill || hang[0] > spec.head)) { return; }
        out.push([along - half - 0.05 * P, along + half + 0.05 * P, "piece", n]);
        return;
      }
      if (LIES_FLAT[n.kind] || FROM_CEILING[n.kind] || gap > 0.9 * P) { return; }
      var tall = typeof pieceHigh === "function" ? pieceHigh(n) : 1;
      if (tall > FC_TALL) { out.push([along - half - 0.1 * P, along + half + 0.1 * P, "piece", n]); }
    });
    return out;
  }
  // A row's place on one floor (the window `c` along the face, `hw` either
  // side): null where the floor has no wall there; a door's (the place left
  // to it); or the glass in it -- one window, wholly in one room; or, where
  // the wall between two rooms meets it, each room's share of it, a window
  // each, the frame between them over the end of that wall (as an
  // architect's partition meets a mullion); none in a room that has no
  // windows, or behind something tall against the wall -- that part blind.
  var FC_MIN_PIECE = 0.45;               // metres: the narrowest share of a window made a window
  function fcSlot(F, c, hw, P, soft) {
    var lo = c - hw, hi = c + hw, here = [], i, j;
    for (i = 0; i < F.runs.length; i++) { var r = F.runs[i]; if (hi > r.a && lo < r.b) { here.push(r); } }
    if (!here.length) { return null; }
    for (i = 0; i < here.length; i++) {
      for (j = 0; j < here[i].blocks.length; j++) { var k = here[i].blocks[j]; if (k[2] === "door" && hi > k[0] && lo < k[1]) { return { door: true, pieces: [], whole: false }; } }
    }
    var pieces = [];
    here.forEach(function (r) {
      if (FC_NONE[r.room.use]) { return; }
      var a = Math.max(lo, r.a + r.T + 0.08 * P), b = Math.min(hi, r.b - r.T - 0.08 * P);
      if (b - a < FC_MIN_PIECE * P) { return; }
      var by = [];
      for (var q = 0; q < r.blocks.length; q++) {
        var kb = r.blocks[q];
        if (b > kb[0] && a < kb[1]) { if (!soft) { return; } if (by.indexOf(kb[3]) < 0) { by.push(kb[3]); } }
      }
      pieces.push({ run: r, a: a, b: b, by: by });
    });
    var whole = pieces.length === 1 && pieces[0].a <= lo + 0.5 && pieces[0].b >= hi - 0.5;
    return { door: false, pieces: pieces, whole: whole };
  }
  // One face: its row of places -- how far apart, and where the first is.
  // First that every room on it that must have daylight (a bedroom, a living
  // room, an office: 38-advice.js) has a window, on every floor; then as many
  // windows as can be.  As far apart as the kind of building has them, or
  // closer where that is what it takes.
  function fcPick(face, spec, P, lock) {
    var hw = spec.w * P / 2, edge = hw + 0.5 * P, A = face.A + edge, B = face.B - edge;
    if (B < A) { return null; }
    // (the same rows as the face it is in line with, on the same side -- a floor stepped back, a
    // wing set forward: its columns over the rest, as long as that leaves no room dark)
    if (lock) {
      var cs0 = [], first = lock.phase + Math.ceil((A - 0.5 - lock.phase) / lock.m) * lock.m;
      for (var c0 = first; c0 <= B + 0.5; c0 += lock.m) { cs0.push(c0); }
      if (cs0.length) {
        var held = fcScore(face, cs0, hw, P, 0);
        if (!held.strict) { return { cost: held.cost, dark: held.dark, cs: cs0, m: lock.m, locked: true }; }
      }
    }
    var best = null;
    [0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8, -1.0].forEach(function (dm) {
      if (spec.m + dm < spec.w + 0.5) { return; }
      var m = (spec.m + dm) * P, span = B - A, n = Math.floor(span / m) + 1;
      // (from where the row is in the middle of the face, a step either way at a time)
      var mid = A + (span - (n - 1) * m) / 2;
      for (var so = -m / 2; so < m / 2; so += 0.1 * P) {
        var o = mid + so, cs = [];
        for (var c = o; c <= B + 0.5; c += m) { if (c >= A - 0.5) { cs.push(c); } }
        if (!cs.length) { continue; }
        // (as far apart as the kind of building has them, unless that leaves rooms dark: worth a little blind glass on every floor)
        var got = fcScore(face, cs, hw, P, Math.abs(so) / P * 0.05 + Math.abs(dm) * 2.5 * face.floors.size);
        if (!best || got.dark < best.dark || (got.dark === best.dark && got.cost < best.cost)) { best = { cost: got.cost, dark: got.dark, cs: cs, m: m }; }
      }
    });
    return best;
  }
  // A row of places on a face: how much is not glass (and what must be moved), and how many rooms it leaves dark.
  function fcScore(face, cs, hw, P, cost) {
    var dark = 0, strict = 0;
    face.kinds.forEach(function (F) {
      var lit = new Map();
      cs.forEach(function (c) {
        var s = fcSlot(F, c, hw, P, true);
        if (s === null || s.door) { return; }
        // (what would have to be moved off it; a window shared by two rooms; a part of it, or all, blind)
        s.pieces.forEach(function (p) { cost += F.n * 0.3 * p.by.length; });
        if (s.whole) { lit.set(s.pieces[0].run.room, true); return; }
        var glass = 0;
        s.pieces.forEach(function (p) { glass += p.b - p.a; if (p.b - p.a >= 0.6 * P) { lit.set(p.run.room, true); } });
        cost += F.n * (0.25 * (s.pieces.length > 1) + (1 - glass / (2 * hw)));
      });
      F.wants.forEach(function (room) {
        if (lit.has(room)) { return; }
        if (FC_MUSTS[room.use]) { strict += F.n; dark += 10 * F.n; } else { dark += F.n; }
      });
    });
    return { cost: cost, dark: dark, strict: strict };
  }
  // (what this making of the rows has moved, and by how much -- where the layout put together, made before, does not know it)
  var fcShift = new WeakMap(), fcMovedOn = new WeakMap(), fcMovedList = [];
  // A piece in front of a window, moved along its wall to the nearest spot
  // clear of the room's windows on that wall, its doors, and what else stands
  // there (or hangs there, for what hangs); false if there is none.
  function fcSlide(n, run, shares, F, J, floors, P) {
    if (fcMovedOn.get(n) === F) { return true; }
    var f = F.f, q = turned(n), at = fcAt(J, f, n), along0 = run.across ? at[0] : at[1], half = (run.across ? q.w : q.h) / 2;
    var B = fcBox(J, floors, run.room), T = run.T, lo = (run.across ? B.l : B.t) + T + half + 0.03 * P, hi = (run.across ? B.r : B.b) - T - half - 0.03 * P;
    if (hi < lo) { return false; }
    var keep = [];
    shares.forEach(function (s) { if (s.run.room === run.room && Math.abs(s.run.line - run.line) < 2) { keep.push([s.a - 0.05 * P, s.b + 0.05 * P]); } });
    run.blocks.forEach(function (k) { if (k[2] === "door") { keep.push([k[0], k[1]]); } });
    var hangs = !!ON_THE_WALL[n.kind];
    // (what else is in the room, worked out once a room -- and of it, only what is in the band
    // along the wall the piece slides in)
    var inRoom = F.inRoom || (F.inRoom = new Map()), mineAll = inRoom.get(run.room);
    if (!mineAll) {
      mineAll = (F.pieces || []).filter(function (o) {
        if (LIES_FLAT[o.kind] || FROM_CEILING[o.kind] || o.kind === "i_rug") { return false; }
        var p = fcAt(J, f, o);
        return p[0] > B.l && p[0] < B.r && p[1] > B.t && p[1] < B.b;
      });
      inRoom.set(run.room, mineAll);
    }
    var a0 = run.across ? at[1] - q.h / 2 : at[0] - q.w / 2, a1 = run.across ? at[1] + q.h / 2 : at[0] + q.w / 2;
    var others = [];
    mineAll.forEach(function (o) {
      if (o === n || !!ON_THE_WALL[o.kind] !== hangs) { return; }
      var p = fcAt(J, f, o), u = turned(o), bx = { l: p[0] - u.w / 2, r: p[0] + u.w / 2, t: p[1] - u.h / 2, b: p[1] + u.h / 2 };
      if ((run.across ? bx.b : bx.r) <= a0 || (run.across ? bx.t : bx.l) >= a1) { return; }
      others.push(bx);
    });
    function fits(c) {
      if (c < lo || c > hi) { return false; }
      for (var i = 0; i < keep.length; i++) { if (c + half > keep[i][0] && c - half < keep[i][1]) { return false; } }
      var bx = run.across ? { l: c - q.w / 2, r: c + q.w / 2, t: at[1] - q.h / 2, b: at[1] + q.h / 2 } : { l: at[0] - q.w / 2, r: at[0] + q.w / 2, t: c - q.h / 2, b: c + q.h / 2 };
      return !others.some(function (o) { return tieOver(bx, o, 1); });
    }
    for (var d = 0; d <= (hi - lo) + 1; d += 0.1 * P) {
      var c = fits(along0 + d) ? along0 + d : fits(along0 - d) ? along0 - d : null;
      if (c === null) { continue; }
      var by = c - along0;
      var was = [n.x, n.y];
      if (!fcShift.has(n)) { fcMovedList.push([n, n.x, n.y]); }
      if (run.across) { n.x = Math.round(n.x + by); } else { n.y = Math.round(n.y + by); }
      var sh = fcShift.get(n) || [0, 0];
      fcShift.set(n, [sh[0] + n.x - was[0], sh[1] + n.y - was[1]]);
      fcMovedOn.set(n, F);
      return true;
    }
    return false;
  }
  // whether a room must have daylight of its own: what it is made as (the bedrooms and living
  // rooms 38-advice.js asks a window of, and the rooms people work and learn in) -- not from what
  // is in it, which wants the whole plan walked (its arrows routed: seconds, a tall office)
  function fcMust(r) { return !FC_NONE[r.use] && !!FC_WANTS[r.use]; }
  function fcRedo(made, type) {
    var t0 = performance.now();
    try { return fcRedoNow(made, type); } finally { FC_LAST.ms = Math.round(performance.now() - t0); }
  }
  var FC_LAST = { ms: 0 };
  function fcRedoNow(made, type) {
    var spec = FC_SPEC[type];
    FC_LAST.faces = [];
    if (!spec) { return 0; }
    var P = FLOOR_PX, floors = floorsOf();
    if (floors.length < FC_MIN_STOREYS) { return 0; }
    // the buildings just made, each with its floors
    var byB = {};
    made.forEach(function (r) {
      if (!r || r.kind !== "i_room") { return; }
      var f = floorAt(floors, r.x, r.y);
      if (f) { (byB[f.bldg] = byB[f.bldg] || {})[f.level] = f; }
    });
    var placed = 0, J = typeof tieLayout === "function" ? tieLayout() : null, nodesWas = hand.nodes.slice();
    fcShift = new WeakMap(); fcMovedOn = new WeakMap(); fcMovedList = [];
    var fcLooked = [];
    Object.keys(byB).forEach(function (bk) {
      var fl = Object.keys(byB[bk]).map(function (k) { return byB[bk][k]; });
      if (fl.length < FC_MIN_STOREYS) { return; }
      // each floor's outside walls, and the faces they make, every floor's together
      var faces = {}, all = [], pieces = new Map();
      fl.forEach(function (f) { pieces.set(f, []); });
      // (what stands on each floor, sorted out once)
      hand.nodes.forEach(function (n) {
        if (n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || n.kind === "i_window" || isArea(n.kind) || !ICONS[n.kind]) { return; }
        var g = floorAt(floors, n.x, n.y), L = g && pieces.get(g);
        if (L) { L.push(n); }
      });
      fl.forEach(function (f) {
        var list = fcRooms(floors, f);
        fcRuns(floors, f, list, P, J).forEach(function (run) {
          run.blocks = fcBlocks(pieces.get(f), f, run, spec, P, J);
          var key = run.side + ":" + Math.round(run.line / (0.3 * P));
          var face = faces[key] || (faces[key] = { key: key, side: run.side, across: run.across, A: Infinity, B: -Infinity, floors: new Map() });
          face.A = Math.min(face.A, run.a); face.B = Math.max(face.B, run.b);
          var F = face.floors.get(f) || { f: f, runs: [], pieces: pieces.get(f) };
          F.runs.push(run); face.floors.set(f, F);
          all.push(run);
        });
      });
      // (the windows there were along these faces -- anywhere along them, the stretches
      // between two rooms too: the new ones in their places)
      var old = hand.nodes.filter(function (w) {
        if (w.kind !== "i_window" || w.attic) { return false; }
        var f = floorAt(floors, w.x, w.y);
        if (!f || fl.indexOf(f) < 0) { return false; }
        var at = fcAt(J, f, w), x = at[0], y = at[1], across = !((w.turn || 0) % 180);
        return Object.keys(faces).some(function (k) {
          var face = faces[k], F = face.floors.get(f);
          if (!F || face.across !== across) { return false; }
          var along = across ? x : y, line = across ? y : x;
          return F.runs.some(function (run) { return Math.abs(line - run.line) <= run.T + 14; }) && along >= face.A - 20 && along <= face.B + 20;
        });
      });
      // the longest faces first; a room given its window on one is not looked to the next for one
      var must = new Map(), lit = new Set(), rowsBy = {};
      all.forEach(function (run) { if (!must.has(run.room)) { must.set(run.room, fcMust(run.room)); } });
      Object.keys(faces).map(function (k) { return faces[k]; }).sort(function (p, q) { return (q.B - q.A) * q.floors.size - (p.B - p.A) * p.floors.size; }).forEach(function (face) {
        // floors alike on this face (most of a tall building's are): weighed together, worked out once
        var kinds = new Map();
        face.floors.forEach(function (F) {
          var sig = F.runs.map(function (r) {
            var say = FC_NONE[r.room.use] ? 0 : must.get(r.room) && !lit.has(r.room) ? 2 : 1;
            return [Math.round(r.a), Math.round(r.b), say].concat(r.blocks.map(function (q) { return Math.round(q[0]) + "-" + Math.round(q[1]); })).join(",");
          }).sort().join("|");
          var K = kinds.get(sig);
          if (!K) {
            K = { n: 0, runs: F.runs, sig: sig,
                  wants: F.runs.filter(function (r) { return must.get(r.room) && !lit.has(r.room) && r.b - r.a >= (spec.w + 0.6) * P; }).map(function (r) { return r.room; }) };
            kinds.set(sig, K);
          }
          K.n++;
        });
        face.kinds = [];
        kinds.forEach(function (K) { face.kinds.push(K); });
        face.pick = fcPick(face, spec, P, rowsBy[face.side]);
        if (face.pick && !rowsBy[face.side]) { rowsBy[face.side] = { m: face.pick.m, phase: face.pick.cs[0] }; }
        // (what each face was given: for looking into it)
        if (face.pick) { FC_LAST.faces.push([face.key, face.floors.size, Math.round(face.A), Math.round(face.B), Math.round(face.pick.m), Math.round(face.pick.cs[0]), face.pick.dark, !!face.pick.locked]); }
        // (the rooms it gives a window to, on every floor)
        if (face.pick) {
          face.floors.forEach(function (F) {
            face.pick.cs.forEach(function (c) {
              var s = fcSlot(F, c, spec.w * P / 2, P, true);
              if (s) { s.pieces.forEach(function (p) { if (p.b - p.a >= 0.6 * P) { lit.add(p.run.room); } }); }
            });
          });
        }
      });
      // (where each room's first windows were: kept on it, for what leads it being put together, 39-join.js)
      var roomsAll = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
      old.forEach(function (w) {
        var r = null;
        if (SNAP_IN_WALL[w.kind] && typeof tieWalled === "function") { roomsAll.some(function (o) { if (tieWalled(w, o)) { r = o; return true; } return false; }); }
        if (!r) { roomsAll.forEach(function (o) { if (insideArea(o, w.x, w.y) && (!r || o.w * o.h < r.w * r.h)) { r = o; } }); }
        if (!r || !doorIn(w, r)) { return; }
        if (!r.fcLooks) { fcLooked.push(r); r.fcLooks = []; }
        r.fcLooks.push([Math.round(w.x - r.x), Math.round(w.y - r.y)]);
      });
      hand.nodes = hand.nodes.filter(function (w) { return old.indexOf(w) < 0; });
      Object.keys(faces).forEach(function (k) {
        var face = faces[k], pick = face.pick;
        if (!pick) { return; }
        face.floors.forEach(function (F) {
          var f = F.f, dx = f.dx || 0, dy = f.dy || 0;
          var shares = [];
          pick.cs.forEach(function (c) {
            var s = fcSlot(F, c, spec.w * P / 2, P, true);
            if (s) { s.pieces.forEach(function (p) { p.c = c; shares.push(p); }); }
          });
          // (what stands in front of a window moved along its wall, clear of every window and door
          // in it and of what else is in the room; what cannot be moved, the share of the window
          // narrowed to beside it, where that leaves enough -- the rest of the place blind)
          shares = shares.filter(function (p) {
            p.by.forEach(function (n) {
              if (fcSlide(n, p.run, shares, F, J, floors, P)) { return; }
              var q = turned(n), at = fcAt(J, F.f, n), along = p.run.across ? at[0] : at[1], half = (p.run.across ? q.w : q.h) / 2;
              var x0 = along - half - 0.1 * P, x1 = along + half + 0.1 * P;
              if (x1 <= p.a || x0 >= p.b) { return; }
              var left = [p.a, Math.min(p.b, x0)], right = [Math.max(p.a, x1), p.b];
              var keep = left[1] - left[0] >= right[1] - right[0] ? left : right;
              p.a = keep[0]; p.b = keep[1];
            });
            return p.b - p.a >= FC_MIN_PIECE * P;
          });
          shares.forEach(function (p) {
            var c = p.c, run = p.run, mid = (p.a + p.b) / 2;
              // (a shop's, a lobby's glass taller than the rest -- in the same places, 40-fronts.js)
            var G = typeof FRONT_GLASS === "object" && FRONT_GLASS[run.room.use] && f.level === 0 ? FRONT_GLASS[run.room.use] : null;
            // (back on the paper: where its room is drawn, not where it is put together)
            var d = J && J.delta && J.delta[run.room.id] || [0, 0];
            var x = (run.across ? mid : run.line) - dx - d[0], y = (run.across ? run.line : mid) - dy - d[1];
            var w = adviceAdd("i_window", Math.round(x), Math.round(y), run.across ? 0 : 90);
            w.w = Math.max(10, Math.round(p.b - p.a)); w.own = true;
            w.sill = G ? Math.min(spec.sill, G.sill) : spec.sill; w.head = G ? Math.max(spec.head, G.head) : spec.head;
            // (the row's place it is in, from it: its middle, and how wide -- for the blind panels, fcPanels)
            w.facade = true; w.slotOff = Math.round((c - mid) * 10) / 10; w.slotW = Math.round(spec.w * P);
            placed++;
          });
        });
      });
    });
    picked = null; chosen = null; many = [];
    if (placed && J && J.boxes && typeof tieLayout === "function") {
      var J2 = tieLayout(), moved = 0;
      FC_LAST.moved = [];
      Object.keys(J.boxes).forEach(function (id) {
        var a = J.boxes[id], b = J2.boxes && J2.boxes[id];
        if (!b || Math.abs(a.l - b.l) > 2 || Math.abs(a.t - b.t) > 2) {
          moved++;
          var r = nodeById(+id);
          if (FC_LAST.moved.length < 8) { FC_LAST.moved.push((r ? r.use : "?") + " " + Math.round(a.l) + "," + Math.round(a.t) + " -> " + (b ? Math.round(b.l) + "," + Math.round(b.t) : "gone")); }
        }
      });
      if (moved) {
        if (window.console && console.warn) { console.warn("facade: the windows moved " + moved + " rooms as they are put together -- left as they were"); }
        hand.nodes = nodesWas;
        fcMovedList.forEach(function (m) { m[0].x = m[1]; m[0].y = m[2]; });
        fcLooked.forEach(function (r) { delete r.fcLooks; });
        return 0;
      }
    }
    return placed;
  }
  // Put into Start building: after each room's own (and a shop's glass,
  // 40-fronts.js), before the drawing is looked over and put right (40-clean.js)
  if (typeof STARTER_WRAPS === "object") {
    var fcWrap = function* (inner, want) {
      var out = yield* inner(want);
      try {
        var type = want && want.type || "house";
        if (FC_SPEC[type]) { fcRedo((starterLast || []).map(function (o) { return o.room; }).filter(Boolean), type); }
      } catch (e) { if (window.console && console.warn) { console.warn("facade:", e && e.stack || e); } }
      return out;
    };
    // (and after the windows, the outlets looked over: what was moved in front of one since it
    // was wired -- the furniture arranged again, or slid clear of a window here -- 39-xray.js)
    var fcWireWrap = function* (inner, want) {
      var out = yield* inner(want);
      try { if (want && want.wire && typeof wireTidy === "function") { wireTidy(); } } catch (e) { if (window.console && console.warn) { console.warn("outlets:", e && e.message); } }
      return out;
    };
    var fcWrapAt = typeof clWrap === "function" ? STARTER_WRAPS.indexOf(clWrap) : -1;
    if (fcWrapAt < 0) { STARTER_WRAPS.forEach(function (fn, i) { if (fcWrapAt < 0 && (String(fn).indexOf("hoodBuild") >= 0 || String(fn).indexOf("hoodAsk") >= 0)) { fcWrapAt = i; } }); }
    if (fcWrapAt >= 0) { STARTER_WRAPS.splice(fcWrapAt, 0, fcWrap, fcWireWrap); } else { STARTER_WRAPS.push(fcWrap, fcWireWrap); }
  }

  // ---- where a floor has no window in a row's place: the same window seen from outside ---------------
  // A row's place on a floor where the window cannot go -- across the wall
  // between two rooms, a lift's shaft, a store, something tall against the
  // wall -- is not left blank: from the street it is the same frame, sill
  // and glass as the rest (an architect's spandrel panel), on the wall's
  // outside face only; inside, the wall is whole.  Worked out from the
  // windows themselves (those made in rows, w.facade), so it keeps up with
  // what is moved or taken out; made with the rest of the house
  // (38-view3d.js v3BuildSteps, with `hand` put together, 39-join.js).
  var FC_PANEL = { piece: true, color: "#6d808c", edge: "#4a5961" };
  function fcPanels(faces, floors, isShown) {
    var P = FLOOR_PX, wins = hand.nodes.filter(function (w) { return w.kind === "i_window" && w.facade; });
    if (!wins.length || !floors.length) { return; }
    var bset = {};
    wins.forEach(function (w) { var f = floorAt(floors, w.x, w.y); if (f) { bset[f.bldg] = true; } });
    var trimC = typeof styleTrim === "function" ? styleTrim("#f4f2ed") : "#f4f2ed";
    var trim = { piece: true, color: trimC, edge: v3Mix(trimC, "#000000", 0.35) };
    var T0 = typeof terrBegin === "function" ? terrBegin() : null;
    Object.keys(bset).forEach(function (bk) {
      var fl = floors.filter(function (g) { return String(g.bldg) === bk; });
      var facesBy = {};
      fl.forEach(function (f) {
        fcRuns(floors, f, fcRooms(floors, f), P, null).forEach(function (run) {
          var key = run.side + ":" + Math.round(run.line / (0.3 * P));
          var face = facesBy[key] || (facesBy[key] = { side: run.side, across: run.across, A: Infinity, B: -Infinity, floors: new Map(), slots: [] });
          face.A = Math.min(face.A, run.a); face.B = Math.max(face.B, run.b);
          var F = face.floors.get(f) || { f: f, runs: [], wins: [], doors: [] };
          F.runs.push(run); face.floors.set(f, F);
        });
      });
      var list = Object.keys(facesBy).map(function (k) { return facesBy[k]; });
      // each row window to its face: the face's places, and which floors have a window in each
      wins.forEach(function (w) {
        var f = floorAt(floors, w.x, w.y);
        if (!f || String(f.bldg) !== bk) { return; }
        var x = w.x + (f.dx || 0), y = w.y + (f.dy || 0), across = !((w.turn || 0) % 180);
        list.some(function (face) {
          var F = face.floors.get(f);
          if (face.across !== across || !F) { return false; }
          var along = across ? x : y, line = across ? y : x;
          if (!F.runs.some(function (r) { return Math.abs(line - r.line) <= r.T + 14 && along >= r.a - 10 && along <= r.b + 10; })) { return false; }
          // (the place it is in: its own middle, or the place's it is a share of)
          var c = along + (w.slotOff || 0), sw = w.slotW || w.w;
          F.wins.push({ c: c, a: along - w.w / 2, b: along + w.w / 2 });
          var s = face.slots.filter(function (q) { return Math.abs(q.c - c) < 0.15 * P; })[0];
          if (!s) { face.slots.push({ c: c, w: sw, sill: w.sill, head: w.head, n: 1 }); }
          else { s.n++; s.w = Math.max(s.w, sw); if ((w.sill || 0) > (s.sill || 0)) { s.sill = w.sill; s.head = w.head; } }
          return true;
        });
      });
      // the doors in each face (a door's place stays a door)
      hand.nodes.forEach(function (d) {
        if (!WALK_DOORS[d.kind] && d.kind !== "i_slide") { return; }
        var f = floorAt(floors, d.x, d.y);
        if (!f || String(f.bldg) !== bk) { return; }
        var q = turned(d), x = d.x + (f.dx || 0), y = d.y + (f.dy || 0);
        list.forEach(function (face) {
          var F = face.floors.get(f);
          if (!F) { return; }
          var along = face.across ? x : y, half = (face.across ? q.w : q.h) / 2, line = face.across ? y : x;
          if (F.runs.some(function (r) { return Math.abs(line - r.line) <= r.T + (face.across ? q.h : q.w) / 2 + 8; })) { F.doors.push([along - half - 0.3 * P, along + half + 0.3 * P]); }
        });
      });
      list.forEach(function (face) {
        if (face.slots.length < 2) { return; }
        var o = face.side === "t" ? [0, -1] : face.side === "b" ? [0, 1] : face.side === "l" ? [-1, 0] : [1, 0];
        face.floors.forEach(function (F) {
          var f = F.f;
          if (isShown && !isShown(f)) { return; }
          face.slots.forEach(function (s) {
            var c = s.c, hw = (s.w || 1.5 * P) / 2;
            // (the glass this floor has in this place: the rest of it is what is blind)
            var mine = F.wins.filter(function (q) { return Math.abs(q.c - c) < 0.15 * P; });
            var open = [[c - hw, c + hw]];
            mine.forEach(function (q) {
              var next = [];
              open.forEach(function (g) {
                if (q.b <= g[0] || q.a >= g[1]) { next.push(g); return; }
                if (q.a > g[0]) { next.push([g[0], q.a]); }
                if (q.b < g[1]) { next.push([q.b, g[1]]); }
              });
              open = next;
            });
            open = open.filter(function (g) { return g[1] - g[0] > 1; });
            if (!open.length) { return; }
            // (the wall there, on this floor -- one room's or two -- and no door in it)
            var cover = F.runs.filter(function (r) { return r.a < c + hw && r.b > c - hw; });
            var lo = Infinity, hi = -Infinity;
            cover.forEach(function (r) { lo = Math.min(lo, r.a); hi = Math.max(hi, r.b); });
            if (!cover.length || lo > c - hw - 2 || hi < c + hw + 2) { return; }
            if (F.doors.some(function (q) { return q[1] > c - hw && q[0] < c + hw; })) { return; }
            var run = cover[0], L = T0 && typeof terrNodeLift === "function" ? terrNodeLift(T0, run.room) : null;
            var z = (f.z || 0) + (L && !L.drape && L.z ? L.z : 0), sill = (s.sill === undefined ? 0.9 : s.sill) * P, head = (s.head === undefined ? 2.1 : s.head) * P;
            var line = run.line, F2 = 1.6;
            function box(p0, p1, d0, d1, z0, z1, how) {
              var pts = face.across ? [[p0, line + o[1] * d0], [p1, line + o[1] * d0], [p1, line + o[1] * d1], [p0, line + o[1] * d1]]
                                    : [[line + o[0] * d0, p0], [line + o[0] * d1, p0], [line + o[0] * d1, p1], [line + o[0] * d0, p1]];
              v3Prism(faces, pts, z + z0, z + z1, how);
            }
            // each blind stretch of the place: its sill, its frame (the windows beside it frame
            // the rest), its bars, its glass -- a whole window's look where there is no glass at all
            open.forEach(function (g) {
              var a = g[0], b = g[1], left = a <= c - hw + 0.5, right = b >= c + hw - 0.5;
              box(a - (left ? 2 : 0), b + (right ? 2 : 0), 0, 2.5, sill - 0.04 * P, sill + 0.4, trim);      // the sill
              box(a, a + F2, 0, 0.9, sill, head, trim); box(b - F2, b, 0, 0.9, sill, head, trim);
              box(a, b, 0, 0.9, head - F2, head, trim); box(a, b, 0, 0.9, sill, sill + F2, trim);
              var lights = b - a > 1.2 * P ? Math.round((b - a) / (0.9 * P)) : 1;
              for (var m = 1; m < lights; m++) { var at = a + (b - a) * m / lights; box(at - 0.6, at + 0.6, 0, 0.8, sill + F2, head - F2, trim); }
              if (b - a > 2 * F2 + 0.5) { box(a + F2, b - F2, 0, 0.45, sill + F2, head - F2, FC_PANEL); }     // the glass, dark, on the wall
            });
          });
        });
      });
    });
  }
