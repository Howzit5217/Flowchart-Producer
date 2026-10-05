// ---------------------------------------------------------------------------
//  40-stalls.js -- washrooms with stalls: a school's, an office's, a
//  mall's, a big store's -- a girls' and a boys' (a women's and a men's),
//  as many toilets in each as the floor's people need, the accessible stall
//  at the end, basins along the end wall, urinals in the boys'
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update this too so you can have bathroom stalls
  // for schools and other places like that so there can be multiple toilets
  // in one room")
  //
  // Each pair of one-toilet restrooms on a floor of a public building
  // becomes a pair of washrooms.  How many toilets each, by the plumbing
  // code's counts (IPC table 2902.1) for the people the floor holds: a
  // school's classrooms 25 each, a toilet for every 30 of each sex (a little
  // over the code's 50, as schools are built); an office one for every 25 of
  // the first 50, every 50 after, a person to 14 m2 of it; a shop or a mall,
  // a person to 5 m2, a toilet for every 150.  Never fewer than two a room.
  var SL_TYPES = { school: "school", office: "work", tower: "work", mall: "shop", shop: "shop" };
  var SL_STALL = 0.92, SL_WIDE = 1.55, SL_BASINS = 1.3;        // metres: a stall's width, the accessible one's, the basins' end
  if (typeof STARTER_ROOMS === "object") { STARTER_ROOMS.washroom = { w: 4.4, h: 4.2, bw: 4.4, max: 14, wall: [], mid: [] }; }
  if (typeof TYPE_USE === "object") { TYPE_USE.washroom = 1; }
  if (typeof ROOM_USE === "object") { ROOM_USE.washroom = "bath"; }
  if (typeof TYPE_DARK === "object") { TYPE_DARK.washroom = 1; }
  if (typeof STARTER_ZONE === "object") { STARTER_ZONE.washroom = "wet"; }
  if (typeof STARTER_VENTED === "object") { STARTER_VENTED.washroom = 1; }
  if (typeof STARTER_CEILING === "object") { STARTER_CEILING.washroom = "i_pendant"; }

  // ---- in the plan: the pairs of restrooms made washrooms, as big as they need -------------------------
  if (typeof BUILDING_TYPES === "object") {
    Object.keys(SL_TYPES).forEach(function (t) {
      var T = BUILDING_TYPES[t];
      if (!T || typeof T.plan !== "function" || T.slStalls) { return; }
      var plain = T.plan;
      T.plan = function (want) {
        var plan = plain.apply(this, arguments);
        try { slPlan(plan, t, want || {}); } catch (e) { if (window.console && console.warn) { console.warn("stalls:", e && e.message); } }
        return plan;
      };
      T.slStalls = true;
    });
  }
  // How many people a floor holds, roughly, by what is on it.
  function slPeople(f, kind) {
    var all = [].concat(f.back || [], f.front || [], f.mid ? [].concat.apply([], f.mid) : []), n = 0;
    var deep = { back: f.Db || 7, front: f.Df || 7 };
    all.forEach(function (r) {
      var D = (f.back || []).indexOf(r) >= 0 ? deep.back : (f.front || []).indexOf(r) >= 0 ? deep.front : (f.Dm || 7), area = (r.w || 0) * D;
      if (kind === "school") { n += r.kind === "classroom" ? 25 : r.kind === "cafeteria" || r.kind === "gym" ? area / 3 : 0; }
      else if (kind === "work") { n += /office|meeting|training|cubicles|boardroom/.test(r.kind) ? area / 14 : 0; }
      else { n += /sales|mallunit|mallanchor|cafe|foodcourt/.test(r.kind) ? area / 5 : 0; }
    });
    return n;
  }
  function slToilets(kind, people) {
    var each = people / 2, n;
    if (kind === "school") { n = each / 30; }
    else if (kind === "work") { n = each <= 50 ? each / 25 : 2 + (each - 50) / 50; }
    else { n = each / 150; }
    return Math.max(2, Math.min(9, Math.ceil(n)));
  }
  function slPlan(plan, t, want) {
    var kind = SL_TYPES[t], changed = false;
    if (t === "shop" && (want.size || 2) < 4) { return; }          // (a corner shop: its two restrooms)
    plan.floors.forEach(function (f) {
      ["back", "front"].forEach(function (side) {
        var band = f[side] || [], rooms = band.filter(function (r) { return r.kind === "restroom"; });
        if (rooms.length < 2) { return; }
        var n = slToilets(kind, slPeople(f, kind));
        rooms.slice(0, 2).forEach(function (r, i) {
          var boys = i === 1;
          r.kind = "washroom";
          r.label = kind === "school" ? (boys ? TXT.sl_boys : TXT.sl_girls) : (boys ? TXT.sl_men : TXT.sl_women);
          r.slBoys = boys;
          r.slToilets = n;
          // (along the room: the stalls, the accessible one, the basins' end)
          r.w = Math.max(r.w, Math.round(((n - 1) * SL_STALL + SL_WIDE + SL_BASINS + 0.3) * 10) / 10);
        });
        changed = true;
      });
    });
    if (!changed) { return; }
    // every band as long as the longest again: the biggest room of each grown
    var W = plan.W || 0;
    plan.floors.forEach(function (f) {
      [f.back, f.front].concat(f.mid || []).forEach(function (b) { if (b) { W = Math.max(W, typeWidth(b)); } });
    });
    plan.floors.forEach(function (f) {
      [f.back, f.front].concat(f.mid || []).forEach(function (b) {
        if (!b || !b.length) { return; }
        var short = W - typeWidth(b);
        if (short < 0.05) { return; }
        // (past the band's last stairwell where it can: the flights stay one over the other)
        var can = b.filter(function (r) { return r.kind !== "washroom" && r.kind !== "stairs" && r.kind !== "lift" && r.kind !== "suite"; });
        var lastWell = -1;
        b.forEach(function (r, j) { if (r.kind === "stairs" || r.kind === "lift") { lastWell = j; } });
        var after = can.filter(function (r) { return b.indexOf(r) > lastWell; });
        var grow = (after.length ? after : can).slice().sort(function (p, q) { return q.w - p.w; })[0] || b[b.length - 1];
        grow.w += short;
      });
    });
    plan.W = W;
  }

  // ---- furnished: the stalls along the far wall, the basins at the end -----------------------------------
  if (typeof typeFurnish === "function") {
    var slFurnishWas = typeFurnish;
    typeFurnish = function (made, rnd, want, plan) {
      var out = slFurnishWas.apply(this, arguments);
      try { made.forEach(function (r) { if (r.starter === "washroom") { slFit(r, made, plan); } }); }
      catch (e) { if (window.console && console.warn) { console.warn("stalls:", e && e.message); } }
      return out;
    };
  }
  // Which of its walls a room's way in is in: the side a hall (or the room it opens off) is on.
  function slInSide(r, made) {
    var b = tieBox(r), best = null;
    made.forEach(function (o) {
      if (o === r || o.kind !== "i_room" || (o.starter !== "hall" && o.starter !== "lobby" && o.starter !== "landing" && o.starter !== "sales" && o.starter !== "commons")) { return; }
      var q = tieBox(o), ox = Math.min(b.r, q.r) - Math.max(b.l, q.l), oy = Math.min(b.b, q.b) - Math.max(b.t, q.t);
      var side = Math.abs(q.t - b.b) < 4 && ox > 20 ? "foot" : Math.abs(q.b - b.t) < 4 && ox > 20 ? "top" :
                 Math.abs(q.l - b.r) < 4 && oy > 20 ? "right" : Math.abs(q.r - b.l) < 4 && oy > 20 ? "left" : null;
      if (side && (!best || o.starter === "hall")) { best = side; }
    });
    return best || "foot";
  }
  // The room's walls inside, each with the way into the room from it and the turn of a piece
  // standing with its back to it (as alongWall turns them, 38-advice.js).
  function slWalls(r) {
    var f = roomInside(r);
    return [{ name: "top", across: true, line: f.t, into: 1, from: f.l, to: f.r, turn: 0 },
            { name: "foot", across: true, line: f.b, into: -1, from: f.l, to: f.r, turn: 180 },
            { name: "left", across: false, line: f.l, into: 1, from: f.t, to: f.b, turn: 270 },
            { name: "right", across: false, line: f.r, into: -1, from: f.t, to: f.b, turn: 90 }];
  }
  // A spot against wall `e` at `at` along it, `w` along the wall and `d` out from it.
  function slSpot(kind, e, at, w, d, off) {
    var o = e.line + e.into * ((off || 0) + d / 2 + 1);
    return { kind: kind, x: e.across ? at : o, y: e.across ? o : at, w: w, h: d, turn: e.turn };
  }
  // Inside the room, clear of every door's swing and of what stands there.
  function slFree(spot, f, doors, gap) {
    var t = turned(spot);
    if (spot.x - t.w / 2 < f.l - 0.5 || spot.x + t.w / 2 > f.r + 0.5 || spot.y - t.h / 2 < f.t - 0.5 || spot.y + t.h / 2 > f.b + 0.5) { return false; }
    if (doors.some(function (d) { var f = starterDoorFlip(d); return boxesTouch(spot, d, 0.4 * FLOOR_PX) || (f && boxesTouch(spot, f, 0.4 * FLOOR_PX)); })) { return false; }
    return typeClear(spot, gap === undefined ? 2 : gap);
  }
  // (a stall as wide as its spot, kept so; anything else its own size, in the middle of its spot)
  function slPutAt(spot, sized) {
    var n = adviceAdd(spot.kind, Math.round(spot.x), Math.round(spot.y), spot.turn);
    if (n && sized) { n.w = Math.round(spot.w); n.h = Math.round(spot.h); n.own = true; }
    return n;
  }
  // The stalls in a row along the longest wall with no door in it, the accessible one at the far
  // end from the way in; the basins (and a boys' urinals) across from them, by the door -- or,
  // where the room is too narrow for that, along the end wall by the door.
  function slFit(r, made) {
    var P = FLOOR_PX, f = roomInside(r);
    if ((r.turn || 0) % 90) { return; }
    r.mat = Object.assign({}, r.mat || {}, { floor: "tiles", floorC: "#e6e8e6", wall: "tiles", wallC: "#f4f4f1" });
    var boys = !!r.slBoys || String(r.text || "") === TXT.sl_boys || String(r.text || "") === TXT.sl_men;
    var B = tieBox(r), T = roomWallOf(r);
    var doors = hand.nodes.filter(function (d) {
      if (!WALK_DOORS[d.kind]) { return false; }
      var t = turned(d);
      return d.x + t.w / 2 > B.l - T - 4 && d.x - t.w / 2 < B.r + T + 4 && d.y + t.h / 2 > B.t - T - 4 && d.y - t.h / 2 < B.b + T + 4;
    });
    var walls = slWalls(r);
    function onWall(d, e) {
      var t = turned(d), lo = e.across ? d.x - t.w / 2 : d.y - t.h / 2, hi = e.across ? d.x + t.w / 2 : d.y + t.h / 2;
      var near = e.across ? Math.min(Math.abs(d.y - t.h / 2 - e.line), Math.abs(d.y + t.h / 2 - e.line)) : Math.min(Math.abs(d.x - t.w / 2 - e.line), Math.abs(d.x + t.w / 2 - e.line));
      return near <= T + 6 && hi > e.from && lo < e.to;
    }
    // (the way in: a door, or where the hall is when the doors come later)
    var inSide = slInSide(r, made), mid = { x: (f.l + f.r) / 2, y: (f.t + f.b) / 2 };
    var door = doors[0] ? { x: doors[0].x, y: doors[0].y } :
      { x: inSide === "left" ? f.l : inSide === "right" ? f.r : mid.x, y: inSide === "top" ? f.t : inSide === "foot" ? f.b : mid.y };
    walls.forEach(function (e) {
      e.len = e.to - e.from;
      e.door = doors.some(function (d) { return onWall(d, e); }) || (!doors.length && e.name === inSide);
      e.away = Math.abs((e.across ? door.y : door.x) - e.line);
    });
    var st = ICONS.i_toiletstall, deep = st ? st.box[1] : 75, wide = Math.max(st ? st.box[0] : 45, Math.round(SL_STALL * P)), acc = Math.round(SL_WIDE * P);
    var wall = walls.filter(function (e) { return !e.door && e.len >= acc + wide; })
      .sort(function (p, q) { return (q.len - p.len) || (q.away - p.away); })[0];
    if (!wall) { return; }
    // from the end away from the door, along the wall
    var dAlong = wall.across ? door.x : door.y, fromFar = Math.abs(dAlong - wall.from) > Math.abs(dAlong - wall.to);
    var start = fromFar ? wall.from : wall.to, step = fromFar ? 1 : -1;
    var want = Math.max(2, r.slToilets || 2), urinals = boys ? Math.max(1, Math.floor(want / 2)) : 0;
    var stalls = Math.max(2, want - urinals), at = start, put = 0;
    for (var i = 0; i < stalls + 3; i++) {
      var w = put === 0 ? acc : wide, spot = slSpot("i_toiletstall", wall, at + step * w / 2, w, deep);
      if (!slFree(spot, f, doors, 0.5)) { break; }
      var s = slPutAt(spot, true);
      if (put === 0 && s) { s.text = TXT.sl_accessible || ""; }
      put++;
      at += step * (w + 1);
      // (more than asked for where the wall has room and the room is short of toilets: never fewer than wanted)
      if (put >= stalls) { break; }
    }
    // across from the stalls, by the door: the basins, the dryer, then a boys' urinals further in
    var opp = walls.filter(function (e) { return e.across === wall.across && e !== wall; })[0];
    var aisle = Math.abs(opp.line - wall.line) - deep;
    var sinks = Math.max(2, Math.ceil(want / 2)), sk = ICONS.i_sink, sw = sk ? sk.box[0] : 30, sd = sk ? sk.box[1] : 20;
    var row = [];
    for (var k = 0; k < sinks; k++) { row.push(["i_sink", Math.max(sw, 0.7 * P), sd]); }
    if (ICONS.i_handdryer) { row.push(["i_handdryer", ICONS.i_handdryer.box[0] + 0.3 * P, ICONS.i_handdryer.box[1]]); }
    for (var u = 0; u < urinals; u++) { row.push(["i_urinal", Math.max(ICONS.i_urinal ? ICONS.i_urinal.box[0] : 24, 0.75 * P), ICONS.i_urinal ? ICONS.i_urinal.box[1] : 20]); }
    var lines = [];
    if (aisle >= 1.2 * P + sd) { lines.push({ e: opp, from: fromFar ? opp.to : opp.from, step: -step }); }
    // (or along the end wall by the door, then the far end)
    walls.filter(function (e) { return e.across !== wall.across; }).sort(function (p, q) { return p.away - q.away; }).forEach(function (e) {
      // (out of the stalls' row: from the side away from the stalls' wall)
      var awayFromStalls = Math.abs(e.from - wall.line) > Math.abs(e.to - wall.line);
      lines.push({ e: e, from: awayFromStalls ? e.from : e.to, step: awayFromStalls ? 1 : -1, stop: wall.line - wall.into * 0 + wall.into * (deep + 0.9 * P) });
    });
    var li = 0, pos = lines[0] ? lines[0].from : 0;
    row.forEach(function (it) {
      while (li < lines.length) {
        var L = lines[li], e = L.e, w = it[1], spot = slSpot(it[0], e, pos + L.step * w / 2, w, it[2]);
        var past = L.step > 0 ? pos + w > e.to : pos - w < e.from;
        if (L.stop !== undefined) { var cc = e.across ? spot.x : spot.y; if (wall.into > 0 ? cc - w / 2 < L.stop : cc + w / 2 > L.stop) { past = true; } }
        if (!past && slFree(spot, f, doors, it[0] === "i_handdryer" ? 0 : 1)) {
          slPutAt(spot, false);
          pos += L.step * (w + 1);
          return;
        }
        if (past) { li++; pos = lines[li] ? lines[li].from : 0; continue; }
        pos += L.step * 0.1 * P;
      }
    });
  }
