// ---------------------------------------------------------------------------
//  40-clean.js -- Start building leaves nothing for Check to find: rooms
//  that open off a room they meet, no flight of stairs going nowhere, and
//  a last look over what was made, putting right what Check would say
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "when it is done being built by the engine it is
  // saying to fix things. Can you update this so no matter what is being
  // built there are no issues found and they are all addressed in the
  // initial build of whatever is being built")
  //
  // The causes are put right where they are (40-stalls.js, 40-mep.js,
  // 38-walk.js, 40-attic.js, 40-garage.js, 40-kinds.js); this part does what
  // no one part can: it reads every type's plan after all the parts have had
  // it, and it looks the finished building over once all of them are done.

  // ---- the plan: each room opening off a room it meets --------------------------------------------------
  // A room opens off another (`via`) through the wall between them.  Where
  // the plan's widths changed after it was written -- washrooms grown for
  // their stalls, bands filled out to the longest -- a back room could be
  // left opening off a front room it no longer met (a superstore's receiving
  // off the middle of the floor, its door put through another room), or off
  // a room along its row that is not beside it.  Without a hall between the
  // rows, each such is opened off the room across from it that it meets most.
  var CL_MEET = 1.2;                                 // metres of wall two rooms share, for a door between them
  function clSpans(band) {
    var at = 0;
    return band.map(function (r) { var s = { r: r, a: at, b: at + (r.w || 0) }; at += r.w || 0; return s; });
  }
  function clVias(plan) {
    var next = 0;
    function named(s, byId) { if (!s.r.id) { s.r.id = "_cl" + (next++); byId[s.r.id] = s; } return s.r.id; }
    (plan.floors || []).forEach(function (f) {
      if (f.open) { return; }
      var rows = [f.back || []].concat(f.mid || [], [f.front || []]).map(clSpans), byId = {};
      rows.forEach(function (row) { row.forEach(function (s) { if (s.r.id) { byId[s.r.id] = s; } }); });
      function meet(p, q) { return Math.min(p.b, q.b) - Math.max(p.a, q.a); }
      // (no hall between the back and front rows: each opens off the other where they meet)
      var facing = !(f.H > 0) && !(f.mid && f.mid.length);
      rows.forEach(function (mine, ri) {
        mine.forEach(function (s, i) {
          var r = s.r;
          if (!r.via || r.via === "-" || !byId[r.via] || r.kind === "suite") { return; }
          var t = byId[r.via], j = mine.indexOf(t);
          if (j >= 0 ? Math.abs(j - i) === 1 : !facing || meet(s, t) >= CL_MEET) { return; }
          // off the room across from it where the rows meet, else (along its own row) off the one
          // beside it that way, which leads on to it -- a food court's second kitchen behind the
          // first, 2026-10-04
          var other = facing ? rows[ri === 0 ? rows.length - 1 : 0] : [];
          var best = other.slice().sort(function (p, q) { return meet(s, q) - meet(s, p); })[0];
          if (best && meet(s, best) >= CL_MEET) { r.via = named(best, byId); return; }
          if (j >= 0) { r.via = named(mine[i + (j > i ? 1 : -1)], byId); }
        });
      });
    });
    return plan;
  }
  if (typeof BUILDING_TYPES === "object") {
    Object.keys(BUILDING_TYPES).forEach(function (t) {
      var T = BUILDING_TYPES[t];
      if (!T || typeof T.plan !== "function" || T.clVias) { return; }
      var plain = T.plan;
      T.plan = function () {
        var plan = plain.apply(this, arguments);
        try { if (plan && plan.floors) { clVias(plan); } } catch (e) { if (window.console && console.warn) { console.warn("clean:", e && e.message); } }
        return plan;
      };
      T.clVias = true;
    });
  }

  // ---- the finished building: no stairs going nowhere -------------------------------------------------
  // A stairwell's flights stand one over the other on every floor; the top
  // floor's spare is left for an attic's stairs to join (40-attic.js) -- and
  // where no attic takes it, it went nowhere.  Taken out; its bay, empty,
  // made a storeroom.
  function clLooseStairs() {
    var plan = walkPlan(), linked = {}, gone = [];
    plan.links.forEach(function (pair) { linked[pair[0].id] = linked[pair[1].id] = true; });
    hand.nodes.forEach(function (s) {
      if ((s.kind !== "i_stairs" && s.kind !== "i_spiral") || linked[s.id]) { return; }
      gone.push(s);
    });
    if (!gone.length) { return 0; }
    hand.nodes = hand.nodes.filter(function (n) { return gone.indexOf(n) < 0; });
    hand.links = hand.links.filter(function (l) { return !gone.some(function (s) { return s.id === l.from || s.id === l.to; }); });
    gone.forEach(function (s) {
      var bay = hand.nodes.filter(function (r) { return r.kind === "i_room" && r.starter === "stairs" && insideArea(r, s.x, s.y); })[0];
      if (!bay || hand.nodes.some(function (o) { return BETWEEN_FLOORS[o.kind] && insideArea(bay, o.x, o.y); })) { return; }
      bay.starter = "storage";
      if (!String(bay.text || "").trim() || bay.text === TXT.st_stairs) { bay.text = TXT.st_storage; }
    });
    return gone.length;
  }

  // ---- the finished building: what Check says, put right ------------------------------------------------
  // Check's findings with a fix of their own are fixed the way its button
  // would; a piece of furniture still in another's way, in a wall, across a
  // doorway or where nobody can reach it is taken out (what a room cannot do
  // without is put back where it fits, by Check's next finding).  A few
  // rounds, until Check has nothing to say.  What is never taken out: rooms,
  // walls, doors, windows, stairs, lifts -- what the building is.
  var CL_ROUNDS = 5;
  function clRemovable(n) {
    return !!n && n.kind !== "i_room" && n.kind !== "i_floor" && n.kind !== "i_lot" && n.kind !== "i_window" && n.kind !== "i_wall" &&
           !WALK_DOORS[n.kind] && !BETWEEN_FLOORS[n.kind] && !isArea(n.kind) && n.kind !== "i_driveway" && n.kind !== "i_path";
  }
  function clSaid() {
    try { return checkDesign() || []; } catch (e) { if (window.console && console.warn) { console.warn("clean check:", e && e.message); } return []; }
  }
  function clTidy() {
    var left = [];
    clDid.fixed.length = 0; clDid.taken.length = 0;        // (kept the same lists: read from outside)
    for (var round = 0; round < CL_ROUNDS; round++) {
      var said = clSaid(), acted = 0, taken = {};
      left = said;
      if (!said.length) { break; }
      said.forEach(function (b) {
        // (not a floor drawn above for the stairs: they are taken out instead, clLooseStairs)
        if (b.fix && typeof b.fix.go === "function" && b.fix.says !== TXT.ad_fix_upstairs) {
          try { b.fix.go(); acted++; clDid.fixed.push(b.text); return; } catch (e) { /* taken out, below */ }
        }
        var n = b.id ? nodeById(b.id) : null;
        // (a door that swings into something, and cannot swing the other way: what it swings into)
        if (n && WALK_DOORS[n.kind]) {
          n = hand.nodes.filter(function (p) { return p !== n && clRemovable(p) && isSolid(p.kind) && boxesTouch(n, p, -3); })[0] || null;
        }
        if (!clRemovable(n) || taken[n.id]) { return; }
        taken[n.id] = true;
        clDid.taken.push(n.kind + ": " + b.text);
        hand.nodes = hand.nodes.filter(function (m) { return m !== n; });
        hand.links = hand.links.filter(function (l) { return l.from !== n.id && l.to !== n.id; });
        acted++;
      });
      if (typeof mpKept === "object" && mpKept) { mpKept.key = null; }
      if (!acted) { break; }
      left = [];
    }
    if (!left.length) { left = clSaid(); }
    // (what is left said where the sweep reads it, tests and the console)
    clLeft.length = 0;
    left.forEach(function (b) { clLeft.push(b.text); });
    if (clLeft.length && window.console && console.info) { console.info("clean: left " + clLeft.length + ": " + clLeft.slice(0, 4).join(" / ")); }
    return clLeft.length;
  }
  var clLeft = [], clDid = { fixed: [], taken: [] };

  // Start building: last of all its steps, inside the replace-or-add question (40-hood.js)
  if (typeof STARTER_WRAPS === "object") {
    var clWrap = function* (inner, want) {
      var out = yield* inner(want);
      // (or left as made: everything left to you, or a test looking at what the parts made, window.CL_OFF)
      if ((want && want.services === "diy") || window.CL_OFF) { return out; }
      try {
        clLooseStairs();
        clTidy();
      } catch (e) { if (window.console && console.warn) { console.warn("clean:", e && e.message); } }
      return out;
    };
    var clHoodAt = -1;
    STARTER_WRAPS.forEach(function (fn, i) { if (clHoodAt < 0 && (String(fn).indexOf("hoodBuild") >= 0 || String(fn).indexOf("hoodAsk") >= 0)) { clHoodAt = i; } });
    if (clHoodAt >= 0) { STARTER_WRAPS.splice(clHoodAt, 0, clWrap); } else { STARTER_WRAPS.push(clWrap); }
  }
