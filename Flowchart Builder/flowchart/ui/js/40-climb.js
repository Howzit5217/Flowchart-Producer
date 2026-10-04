// ---------------------------------------------------------------------------
//  40-climb.js -- going between floors, walking round in 3D: up a flight
//  of stairs a step at a time, round a spiral, and in a lift that comes when
//  it is called, shuts its doors, rides, and opens them on the floor asked for
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "update this so elevators work like normal
  // modern elevators and stairs work like stairs rather than teleporting
  // you place")  Stepping onto the foot of a flight had put you at the top
  // of it, on the floor above, in a blink.  Now:
  //  - a flight is walked up: the higher along it, the higher you are, the
  //    floor above open over it (a hole cut in its floor, and in the
  //    ceiling under it), and off the top onto that floor; down the same way;
  //  - a spiral is gone round, a step at a time, up or down;
  //  - a lift is a room (the one a lift stands in) with doors that slide:
  //    E at them calls it, inside its buttons ask which floor, the doors
  //    shut, it goes, the floors counting on its panel, and they open there.
  var CLIMB_END = 24;                    // px from the top of a flight within which it is stepped onto from above

  // The flights and the lifts, from the arrows between floors (floorLinks).
  function climbWays(plan) {
    var out = { flights: [], spirals: [], lifts: [] };
    (plan.links || []).forEach(function (pair) {
      var a = pair[0], b = pair[1], fa = floorAt(plan.floors, a.x, a.y), fb = floorAt(plan.floors, b.x, b.y);
      if (!fa || !fb || fa === fb) { return; }
      var low = fa.z <= fb.z ? { n: a, f: fa } : { n: b, f: fb }, high = fa.z <= fb.z ? { n: b, f: fb } : { n: a, f: fa };
      var one = { low: low.n, high: high.n, fl: low.f, fh: high.f, rise: high.f.z - low.f.z };
      if (a.kind === "i_elevator" || b.kind === "i_elevator") { out.lifts.push(one); }
      else if (a.kind === "i_spiral" || b.kind === "i_spiral") { out.spirals.push(one); }
      // (an escalator walked up as a flight is: its foot at +y, its top at -y -- 40-items.js)
      else if ((a.kind === "i_stairs" && b.kind === "i_stairs") || (a.kind === "i_escalator" && b.kind === "i_escalator")) { out.flights.push(one); }
    });
    return out;
  }
  // a spot in a piece's own numbers, and back
  function climbLocal(n, x, y) {
    var a = -(n.turn || 0) * Math.PI / 180, dx = x - n.x, dy = y - n.y;
    return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
  }
  function climbWorld(n, lx, ly) {
    var a = (n.turn || 0) * Math.PI / 180;
    return [n.x + lx * Math.cos(a) - ly * Math.sin(a), n.y + lx * Math.sin(a) + ly * Math.cos(a)];
  }
  // How far up a flight a spot is: 0 at its foot (+y), 1 at its top (-y), as its treads rise (v3Build).
  function climbAlong(n, x, y) { var l = climbLocal(n, x, y); return Math.max(0, Math.min(1, (n.h / 2 - l[1]) / n.h)); }

  // ---- each step of the walk ------------------------------------------------------------------------
  if (typeof v3Stairs === "function") {
    var v3StairsJump = v3Stairs;
    v3Stairs = function () {
      if (!V3 || !V3.me) { return; }
      try { climbStep(); } catch (e) { if (window.console && console.warn) { console.warn("climbing:", e && e.message); } }
    };
  }
  function climbStep() {
    var plan = v3Ground(), me = V3.me, W = climbWays(plan);
    if (V3.ride || V3.spiralGo) { return; }                     // carried: in a lift, round a spiral
    V3.stairZ = 0; V3.flightUp = undefined;
    // on a flight, from its foot: as high as far along it -- and nearly at
    // the top, onto the floor above, just inside where the top of the flight
    // meets it (the floor under the flight's top is often a wall)
    var on = null;
    W.flights.forEach(function (w) { if (!on && insideArea(w.low, me.x, me.y, -2)) { on = w; } });
    if (on) {
      var t = climbAlong(on.low, me.x, me.y), l = climbLocal(on.low, me.x, me.y);
      if (t >= 0.96) {
        var up = climbWorld(on.high, l[0], -on.high.h / 2 + 1);
        me.x = up[0]; me.y = up[1];
        V3.stairZ = 0; V3.flightUp = on.fl.level;                 // (looking back down the stairwell)
        v3Say(say("v3_went_up", { floor: floorName(on.fh) }));
      } else {
        V3.stairZ = t * on.rise;
        V3.flightUp = on.fh.level;                                // the floor above shown, over the stairwell
      }
      V3.dirty = true;
      return;
    }
    // at the top of a flight, on the floor above: a step in from its edge is
    // a step down onto it (and standing by it, the floor below shows through)
    W.flights.forEach(function (w) {
      if (on || !insideArea(w.high, me.x, me.y, -2)) { return; }
      var l = climbLocal(w.high, me.x, me.y), edge = -w.high.h / 2;
      on = w;
      V3.flightUp = w.fl.level;
      if (l[1] <= edge + 8 || l[1] > edge + CLIMB_END) { return; }
      var down = climbWorld(w.low, l[0], l[1]);
      me.x = down[0]; me.y = down[1];
      V3.stairZ = climbAlong(w.low, me.x, me.y) * w.rise;
      V3.flightUp = w.fh.level;
      v3Say(say("v3_went_down", { floor: floorName(w.fl) }));
    });
    if (on) { V3.dirty = true; return; }
    // a spiral, stepped onto at either floor: gone round, up or down
    W.spirals.forEach(function (w) {
      if (V3.spiralGo || V3.spiralOff === w.low.id) { return; }
      var atLow = insideArea(w.low, me.x, me.y, 4), atHigh = insideArea(w.high, me.x, me.y, 4);
      if (!atLow && !atHigh) { return; }
      V3.spiralGo = { w: w, up: atLow, t0: performance.now(), ms: 2600, from: [me.x, me.y], head: me.head };
      V3.dirty = true;
    });
    if (V3.spiralOff) {                                          // stepped off a spiral: not round it again until clear of it
      var s = W.spirals.filter(function (w) { return w.low.id === V3.spiralOff; })[0];
      if (!s || (!insideArea(s.low, me.x, me.y, 10) && !insideArea(s.high, me.x, me.y, 10))) { V3.spiralOff = null; }
    }
  }
  // round a spiral: the pole on your one hand, a step up every twelfth of the way round
  function climbSpiral(now) {
    var G = V3.spiralGo, w = G.w, me = V3.me, P = FLOOR_PX;
    var k = Math.min(1, (now - G.t0) / G.ms), e = k * k * (3 - 2 * k), turns = 1;
    var n = G.up ? w.low : w.high, r = Math.max(14, Math.min(n.w, n.h) / 4);
    var ang = (G.up ? e : 1 - e) * Math.PI * 2 * turns;
    // on the lower floor's numbers the whole way round, raised as it goes
    me.x = w.low.x + Math.cos(ang) * r; me.y = w.low.y + Math.sin(ang) * r;
    me.head = ang + Math.PI / 2;
    V3.stairZ = (G.up ? e : 1 - e) * w.rise;
    V3.flightUp = w.fh.level;
    if (k >= 1) {
      var to = G.up ? w.high : w.low, f = G.up ? w.fh : w.fl;
      // off it onto the floor: a step out from the pole, the way you were going
      var out = [Math.cos(ang), Math.sin(ang)], reach = Math.max(n.w, n.h) / 2 + WALK_BODY + 6;
      me.x = to.x + out[0] * reach; me.y = to.y + out[1] * reach;
      if (v3Blocked(me.x, me.y)) { me.x = to.x - out[0] * reach; me.y = to.y - out[1] * reach; }
      V3.stairZ = 0; V3.flightUp = undefined; V3.spiralGo = null; V3.spiralOff = w.low.id;
      v3Say(say(G.up ? "v3_went_up" : "v3_went_down", { floor: floorName(f) }));
    }
    V3.dirty = true;
  }

  // ---- the eye, as high as the climb ------------------------------------------------------------
  // (v3Draw adds V3.stairZ to the eye's height; the floor above is shown
  // while it is being climbed to -- see v3BuildSteps' `shown`)
  if (typeof v3Watch === "function") {
    var v3WatchClimb = v3Watch;
    v3Watch = function () {
      if (V3 && V3.mode === "walk") {
        var now = performance.now();
        try {
          if (V3.spiralGo) { climbSpiral(now); }
          if (V3.ride) { liftRide(now); }
        } catch (e) {
          V3.spiralGo = null; V3.ride = null;
          if (window.console && console.warn) { console.warn("between floors:", e && e.message); }
        }
      }
      return v3WatchClimb.apply(this, arguments);
    };
  }
  // carried, not walking: no steps taken meanwhile
  if (typeof v3Stride === "function") {
    var v3StrideClimb = v3Stride;
    v3Stride = function () {
      if (V3 && (V3.spiralGo || (V3.ride && V3.ride.state !== "open"))) { return !!(V3.spiralGo || V3.ride); }
      return v3StrideClimb.apply(this, arguments);
    };
  }
  // round the top of a flight, a rail: stepped into only from where it meets the floor
  if (typeof v3Blocked === "function") {
    var v3BlockedClimb = v3Blocked;
    v3Blocked = function (x, y) {
      if (v3BlockedClimb.apply(this, arguments)) { return true; }
      try {
        if (!V3 || V3.mode !== "walk") { return false; }
        var W = climbWays(v3Ground());
        return W.flights.some(function (w) {
          if (!insideArea(w.high, x, y, -1)) { return false; }
          return climbLocal(w.high, x, y)[1] > -w.high.h / 2 + CLIMB_END;
        });
      } catch (e) { return false; }
    };
  }

  // ---- lifts ------------------------------------------------------------------------------------------
  // The lift's car: the room a lift stands in (a lift's own room, 39-types.js);
  // its doors, the doors into that room.
  // (once a plan, each lift's room found among the few rooms near it: a
  // tower of forty floors asked every room for every lift every picture,
  // half a second a second walking -- 2026-10-03)
  var liftKept = typeof WeakMap === "function" ? new WeakMap() : null;
  function liftRooms(plan) {
    var got = liftKept && plan && typeof plan === "object" ? liftKept.get(plan) : null;
    if (got && got.nodes === hand.nodes && got.count === hand.nodes.length) { return got.out; }
    var out = [], near = typeof listNear === "function" ? listNear(plan.rooms || []) : null;
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_elevator") { return; }
      var room = (near ? near.around(n.x, n.y, n.x, n.y) : (plan.rooms || [])).filter(function (r) { return insideArea(r, n.x, n.y); })
        .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
      // (a lift drawn on its own, in no room of its own: it is its own car)
      out.push(room && room.w * room.h <= Math.pow(4.5 * FLOOR_PX, 2) ? { lift: n, room: room } : { lift: n, room: n, own: true });
    });
    if (liftKept && plan && typeof plan === "object") { liftKept.set(plan, { nodes: hand.nodes, count: hand.nodes.length, out: out }); }
    return out;
  }
  function liftCarOf(plan, door) {
    var hit = null;
    (plan.joins || []).forEach(function (j) {
      if (hit || j.door !== door) { return; }
      liftRooms(plan).forEach(function (c) { if (!hit && j.rooms.indexOf(c.room) >= 0) { hit = c; } });
    });
    return hit;
  }
  // every floor a lift goes to: the lifts linked to it, and theirs, floor by floor
  function liftStops(plan, lift) {
    var seen = {}, list = [lift];
    seen[lift.id] = true;
    for (var i = 0; i < list.length; i++) {
      (plan.links || []).forEach(function (pair) {
        [0, 1].forEach(function (e) {
          var a = pair[e], b = pair[1 - e];
          if (a === list[i] && b.kind === "i_elevator" && !seen[b.id]) { seen[b.id] = true; list.push(b); }
        });
      });
    }
    // one stop a floor: two cars side by side were linked one to the other
    // (a tower's, before 2026-10-03), and every floor came up twice -- the
    // one at the same place on its floor as this one is on its own kept
    var f0 = floorAt(plan.floors, lift.x, lift.y), byFloor = [];
    function offset(n, f) { return f && f0 ? Math.hypot(n.x - f.n.x - (lift.x - f0.n.x), n.y - f.n.y - (lift.y - f0.n.y)) : 0; }
    list.forEach(function (n) {
      var f = floorAt(plan.floors, n.x, n.y);
      if (!f) { return; }
      var was = byFloor.filter(function (s) { return s.f === f; })[0];
      if (!was) { byFloor.push({ n: n, f: f }); }
      else if (n === lift || (was.n !== lift && offset(n, f) < offset(was.n, f))) { was.n = n; }
    });
    return byFloor.sort(function (p, q) { return p.f.z - q.f.z; });
  }
  function liftDoors(plan, car) {
    return (plan.joins || []).filter(function (j) { return j.rooms.indexOf(car.room) >= 0; }).map(function (j) { return j.door; });
  }
  // the car's doors drawn as a lift's: two steel leaves that part from the
  // middle, a steel frame, and its buttons beside it on the way in
  if (typeof v3Door === "function") {
    var v3DoorLift = v3Door;
    v3Door = function (faces, n, open) {
      var car = null;
      try { car = V3 && V3.scene !== "space" && (n.kind === "i_door" || n.kind === "i_door2" || n.kind === "i_slide") ? liftCarOf(v3Ground(), n) : null; } catch (e) { car = null; }
      if (!car) { return v3DoorLift.apply(this, arguments); }
      liftDoorFaces(faces, n, Math.min(1, open / 90), car);
    };
  }
  function liftDoorFaces(faces, n, k, car) {
    var P = FLOOR_PX, H = DOOR_TALL * P, hw = n.w / 2, hh = n.h / 2, line = SNAP_IN_WALL[n.kind] === "swing" ? hh : 0;
    var steel = { piece: true, color: "#c8ccd1", edge: "#8d9298", pat: 23 }, dark = { piece: true, color: "#5e6369", edge: "#3e4247", pat: 22 };
    var deep = 6.5, J = 2.2;
    v3Box(faces, n, -hw, -hw + J, line - deep, line + deep, 0, H + 3, steel);
    v3Box(faces, n, hw - J, hw, line - deep, line + deep, 0, H + 3, steel);
    v3Box(faces, n, -hw, hw, line - deep, line + deep, H - 0.4, H + 3, steel);
    // (and its underside, looked up at from the car: a box is put up without one)
    faces.push({ pts: [[-hw, line - deep], [hw, line - deep], [hw, line + deep], [-hw, line + deep]]
                   .map(function (p) { var q = v3Local(n, p[0], p[1]); return [q[0], q[1], H - 0.4]; }), n: [0, 0, -1], how: steel });
    // the two leaves, apart by as much as they have opened
    var half = (n.w - 2 * J) / 2, slide = k * (half - 1);
    var lf = { leaf: true, color: "#d6dade", edge: "#8d9298", pat: 23 };
    v3Box(faces, n, -hw + J - slide, -hw + J + half - slide, line - 1.2, line + 1.2, 0, H - 0.4, lf);
    v3Box(faces, n, hw - J - half + slide, hw - J + slide, line - 1.2, line + 1.2, 0, H - 0.4, lf);
    // which way is out (into the hall, not the car): where the car room is not
    var mid = v3Local(n, 0, line - 10), outSide = insideArea(car.room, mid[0], mid[1]) ? 1 : -1;
    // the buttons, on the hall side, beside the frame: a plate, up over down, lit when it is called
    var called = V3.ride && V3.ride.car && V3.ride.car.room === car.room;
    var bx = hw + 4, by = line + outSide * (deep + 0.4), by1 = line + outSide * (deep + 1.0);
    v3Box(faces, n, bx - 1.6, bx + 1.6, Math.min(by, by1), Math.max(by, by1), 0.95 * P, 1.18 * P, dark);
    [[1.12, "#7fd0ff"], [1.01, "#7fd0ff"]].forEach(function (b, i) {
      var by2 = line + outSide * (deep + 1.3);
      v3Box(faces, n, bx - 0.7, bx + 0.7, Math.min(by1, by2), Math.max(by1, by2), b[0] * P - 0.7, b[0] * P + 0.7,
            { piece: true, color: called || i === 1 && k > 0.5 ? b[1] : "#e8e8e6", edge: "#3e4247", pat: called ? 31 : 22 });
    });
    // over the doors, the floor it is at
    v3Box(faces, n, -4, 4, line + outSide * (deep + 0.3), line + outSide * (deep + 0.9), H + 4, H + 8, dark);
  }

  // ---- the car, inside ------------------------------------------------------------------------------
  // (asked for, 2026-10-03: "the interior of the elevators also look bad and
  // there are no buttons that appear in the elevator and there is still that
  // weird blueish column")  It was the room's paint, and a box of glass the
  // ceiling's height where the lift stood.  Now the car is lined as a car
  // is: brushed steel walls in panels, a stone floor, a rail round three
  // sides, a mirror at the back, a lit ceiling, and by the doors its
  // buttons -- one a floor, the floor it is at lit, and open, close and the
  // alarm.  Not the room's whole depth (a lift's room in a tower is six
  // metres long): its back a wall of its own, walked up to and no further.
  var LIFT_STEEL = { piece: true, color: "#c5cad0", edge: "#8d9298", pat: 22 };
  var LIFT_SEAM = { piece: true, color: "#4f5358", edge: "#34383c", bare: true };
  var LIFT_KICK = { piece: true, color: "#6d7278", edge: "#4a4f55", pat: 22 };
  var LIFT_CHROME = { piece: true, color: "#e2e6ea", edge: "#9aa0a6", pat: 23 };
  var liftBacks = {};        // each car's own back wall, where walking stops: lift id -> its line, on its own floor
  function liftCarFaces(faces, n, H) {
    var plan = null, car = null;
    try { plan = v3Ground(); car = liftRooms(plan).filter(function (c) { return c.lift === n; })[0]; } catch (e) { car = null; }
    if (!car || car.own) { liftCab(faces, n, H); return; }
    var r = car.room, P = FLOOR_PX, T = Math.max(1, Math.min(6, Math.min(r.w, r.h) * 0.06)), hw = r.w / 2, hh = r.h / 2;
    var door = liftDoors(plan, car)[0];
    // the wall its doors are in, in the room's own numbers: `a` along it, `b` in from it
    var t0 = -(r.turn || 0) * Math.PI / 180, ca = Math.cos(t0), sa = Math.sin(t0);
    function local(x, y) { var dx = x - r.x, dy = y - r.y; return [dx * ca - dy * sa, dx * sa + dy * ca]; }
    var dl = door ? local(door.x, door.y) : [0, hh], nl = local(n.x, n.y), edge;
    if (Math.abs(dl[1]) / hh >= Math.abs(dl[0]) / hw) { edge = dl[1] < 0 ? "top" : "foot"; } else { edge = dl[0] < 0 ? "left" : "right"; }
    var across = edge === "top" || edge === "foot", A = across ? hw : hh, deep = across ? 2 * hh : 2 * hw;
    function ab(p) {
      return edge === "top" ? [p[0], p[1] + hh] : edge === "foot" ? [-p[0], hh - p[1]] : edge === "left" ? [-p[1], p[0] + hw] : [p[1], hw - p[0]];
    }
    function xy(a, b) {
      var q = edge === "top" ? [a, -hh + b] : edge === "foot" ? [-a, hh - b] : edge === "left" ? [-hw + b, -a] : [hw - b, a];
      return v3Local(r, q[0], q[1]);
    }
    function box(a0, a1, b0, b1, z0, z1, how) {
      v3Prism(faces, [xy(a0, b0), xy(a1, b0), xy(a1, b1), xy(a0, b1)], z0, z1, how);
      if (z0 > 1) { under(a0, a1, b0, b1, z0, how); }      // (up off the floor: seen from under it too)
    }
    function under(a0, a1, b0, b1, z, how) {
      faces.push({ pts: [xy(a0, b0), xy(a1, b0), xy(a1, b1), xy(a0, b1)].map(function (q) { return [q[0], q[1], z]; }), n: [0, 0, -1], how: how });
    }
    var da = ab(dl)[0], dw = door ? door.w / 2 : 0.5 * P, E = T + 0.4, top = H - 0.1 * P, doorTop = DOOR_TALL * P + 3.5;
    // how deep: a car's depth, or more where the lift was put further in (a plan of before)
    var D = Math.max(2.3 * P, ab(nl)[1] + 0.7 * P), own = D < deep - T - 2;
    if (!own) { D = deep - E; }
    if (own) {
      box(-A + T, A - T, D, D + 0.12 * P, 0, H, { piece: true, color: "#a9aeb4", edge: "#7c8187", pat: 22 });
      liftBacks[n.id] = { n: n, line: [xy(-A + T, D), xy(A - T, D)], H: H };
    } else {
      delete liftBacks[n.id];
    }
    // a lining: a dark backing, panels on it a hair apart
    function lining(a0, a1, b0, b1, z0, z1, alongA, parts, inward) {
      // `inward` (+1 or -1): which way the room is, across the lining's thickness
      var thin = 0.35;
      if (alongA) {
        var bb = inward > 0 ? [b0, b0 + thin, b0 + thin, b0 + 2 * thin] : [b1 - thin, b1, b1 - 2 * thin, b1 - thin];
        box(a0, a1, bb[0], bb[1], z0, z1, LIFT_SEAM);
        for (var k = 0; k < parts; k++) {
          var p0 = a0 + (a1 - a0) * k / parts + 0.3, p1 = a0 + (a1 - a0) * (k + 1) / parts - 0.3;
          box(p0, p1, bb[2], bb[3], z0, z1, LIFT_STEEL);
        }
      } else {
        var aa = inward > 0 ? [a0, a0 + thin, a0 + thin, a0 + 2 * thin] : [a1 - thin, a1, a1 - 2 * thin, a1 - thin];
        box(aa[0], aa[1], b0, b1, z0, z1, LIFT_SEAM);
        for (var j = 0; j < parts; j++) {
          var q0 = b0 + (b1 - b0) * j / parts + 0.3, q1 = b0 + (b1 - b0) * (j + 1) / parts - 0.3;
          box(aa[2], aa[3], q0, q1, z0, z1, LIFT_STEEL);
        }
      }
    }
    var K = 0.12 * P, wall = 0.7;
    // the sides, the back, the front either side of the doors and over them
    [-1, 1].forEach(function (s) {
      var a0 = s < 0 ? -A + E : A - E - wall, a1 = s < 0 ? -A + E + wall : A - E;
      lining(a0, a1, E, D, K, top, false, 3, s < 0 ? 1 : -1);
      box(a0, a1, E, D, 0, K, LIFT_KICK);
    });
    lining(-A + E + wall, A - E - wall, D - wall, D, K, top, true, 2, -1);
    box(-A + E + wall, A - E - wall, D - wall, D, 0, K, LIFT_KICK);
    var jl = da - dw - 0.4, jr = da + dw + 0.4;
    if (jl > -A + E + wall + 0.5) { lining(-A + E + wall, jl, E, E + wall, 0, top, true, 1, 1); }
    if (jr < A - E - wall - 0.5) { lining(jr, A - E - wall, E, E + wall, 0, top, true, 1, 1); }
    if (top > doorTop + 0.5) { lining(jl, jr, E, E + wall, doorTop, top, true, 1, 1); }
    // the floor: stone; a steel sill at the doors
    box(-A + E, A - E, E, D, 0.15, 0.6, { piece: true, color: "#55595f", edge: "#3a3d42", pat: 25 });
    box(jl, jr, E - 0.4, E + 0.18 * P, 0.15, 0.75, LIFT_CHROME);
    // the mirror over the rail at the back
    box(-A + E + 0.14 * P, A - E - 0.14 * P, D - wall - 0.3, D - wall, 0.98 * P, 2.1 * P, { piece: true, color: "#dfe6eb", edge: "#9aa0a6", pat: 23 });
    // the rail round the sides and the back, on its brackets
    var rz0 = 0.88 * P, rz1 = rz0 + 1.8, off = wall + 2.6, rt = 0.9;
    [-1, 1].forEach(function (s) {
      var ra = s * (A - E - off);
      box(ra - rt, ra + rt, E + 0.4 * P, D - wall - 0.2 * P, rz0, rz1, LIFT_CHROME);
      [E + 0.48 * P, D - wall - 0.28 * P].forEach(function (b) {
        box(Math.min(ra, s * (A - E - wall)), Math.max(ra, s * (A - E - wall)), b - 0.5, b + 0.5, rz0 - 0.6, rz0 + 0.6, LIFT_CHROME);
      });
    });
    var rb = D - off;
    box(-A + E + 0.2 * P, A - E - 0.2 * P, rb - rt, rb + rt, rz0, rz1, LIFT_CHROME);
    [-A + E + 0.28 * P, A - E - 0.28 * P].forEach(function (a) { box(a - 0.5, a + 0.5, rb, D - wall, rz0 - 0.6, rz0 + 0.6, LIFT_CHROME); });
    // the ceiling: a steel frame round a panel of light
    under(-A + E, A - E, E, D, top, { piece: true, color: "#9ba1a7", edge: "#6d7278", pat: 22 });
    under(-A + E + 0.16 * P, A - E - 0.16 * P, E + 0.2 * P, D - 0.2 * P, top - 0.3, { piece: true, color: "#f6f9ff", edge: "#d5dbe3", pat: 31, bare: true });
    // its buttons: on the wall beside the doors where there is room, else on a side by them
    var stops = [];
    try { stops = liftStops(plan, n); } catch (e) { stops = []; }
    var here = floorAt(plan.floors || [], n.x, n.y), N = Math.max(1, stops.length);
    var cols = N <= 12 ? 2 : N <= 30 ? 3 : 4, rows = Math.ceil(N / cols), pitch = 3.2, bw = 1.1;
    var plateW = cols * pitch / 2 + 2.2, z0 = 0.86 * P, zB = 0.98 * P, zF = zB + pitch * 1.2, zD = zF + rows * pitch + 1.2, z1 = zD + 0.1 * P + 2;
    var spaceR = A - E - wall - jr, spaceL = jl - (-A + E + wall), O, U, W;
    if (Math.max(spaceR, spaceL) >= 2 * plateW + 3) {
      var sR = spaceR >= spaceL;
      O = [sR ? (jr + A - E - wall) / 2 : (jl - A + E + wall) / 2, E + wall]; U = [1, 0]; W = [0, 1];
    } else {
      O = [A - E - wall, E + wall + 0.3 * P]; U = [0, 1]; W = [-1, 0];
    }
    function plate(u0, u1, w0, w1, za, zb, how) {
      var c = [[u0, w0], [u1, w0], [u1, w1], [u0, w1]].map(function (q) { return xy(O[0] + U[0] * q[0] + W[0] * q[1], O[1] + U[1] * q[0] + W[1] * q[1]); });
      v3Prism(faces, c, za, zb, how);
    }
    plate(-plateW, plateW, 0, 0.5, z0, z1, LIFT_CHROME);
    // a little screen up top, the floor shown in it lit
    plate(-plateW + 1, plateW - 1, 0.5, 0.75, zD, zD + 0.1 * P, { piece: true, color: "#15171a", edge: "#0b0c0d", bare: true });
    plate(-plateW + 2.2, plateW - 2.2, 0.75, 0.85, zD + 0.045 * P, zD + 0.06 * P, { piece: true, color: "#ffb347", edge: "#ffb347", pat: 31, bare: true });
    // a floor each, from the lowest, left to right and up; the floor it is at lit
    stops.forEach(function (st, i) {
      var c = i % cols, rw = Math.floor(i / cols), u = (c - (cols - 1) / 2) * pitch, z = zF + rw * pitch;
      var lit = here && st.f === here;
      plate(u - bw, u + bw, 0.5, 1.0, z, z + 2 * bw,
            lit ? { piece: true, color: "#8fd3ff", edge: "#3e4247", pat: 31, bare: true } : { piece: true, color: "#eef0f2", edge: "#5e6369", pat: 23, bare: true });
    });
    // open, close, and the alarm (yellow)
    [[-1, "#d9dde1"], [0, "#d9dde1"], [1, "#f2c230"]].forEach(function (b) {
      var u = b[0] * pitch;
      plate(u - bw, u + bw, 0.5, 1.0, zB, zB + 2 * bw, { piece: true, color: b[1], edge: "#5e6369", pat: b[1] === "#f2c230" ? 27 : 23, bare: true });
    });
  }
  // A lift standing on its own (a house's, in no room of its own): a cab of
  // glass in a steel frame, a floor and a top -- not a column of glass.
  function liftCab(faces, n, H) {
    var P = FLOOR_PX, hw = n.w / 2, hh = n.h / 2, post = Math.min(2.5, hw / 4), top = H - 0.06 * P;
    var frame = { piece: true, color: "#9aa1a8", edge: "#5e6369", pat: 22 };
    v3Box(faces, n, -hw, hw, -hh, hh, 0, 0.9, { piece: true, color: "#55595f", edge: "#3a3d42", pat: 25 });
    v3Box(faces, n, -hw, hw, -hh, hh, top, H, frame);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
      var x = c[0] * (hw - post / 2), y = c[1] * (hh - post / 2);
      v3Box(faces, n, x - post / 2, x + post / 2, y - post / 2, y + post / 2, 0.9, top, frame);
    });
    // its glass, a sliver between the posts, and a rail round at hand's height
    var g = 0.3, glass = { glass: true, bare: true };
    v3Box(faces, n, -hw + post, hw - post, -hh + post / 2 - g, -hh + post / 2 + g, 0.9, top, glass);
    v3Box(faces, n, -hw + post, hw - post, hh - post / 2 - g, hh - post / 2 + g, 0.9, top, glass);
    v3Box(faces, n, -hw + post / 2 - g, -hw + post / 2 + g, -hh + post, hh - post, 0.9, top, glass);
    v3Box(faces, n, hw - post / 2 - g, hw - post / 2 + g, -hh + post, hh - post, 0.9, top, glass);
    v3Box(faces, n, -hw + post, hw - post, -hh + post, -hh + post + 1.2, 0.88 * P, 0.88 * P + 1.6, LIFT_CHROME);
    faces.push({ pts: [[-hw + post, -hh + post], [hw - post, -hh + post], [hw - post, hh - post], [-hw + post, hh - post]]
                   .map(function (p) { var q = v3Local(n, p[0], p[1]); return [q[0], q[1], top - 0.2]; }),
                 n: [0, 0, -1], how: { piece: true, color: "#f6f9ff", edge: "#d5dbe3", pat: 31, bare: true } });
  }
  // walking: up to a car's back wall and no further
  if (typeof v3Solids === "function") {
    var v3SolidsLift = v3Solids;
    v3Solids = function () {
      var out = v3SolidsLift.apply(this, arguments);
      try {
        var floors = v3Ground().floors || [];
        Object.keys(liftBacks).forEach(function (id) {
          var B = liftBacks[id];
          if (hand.nodes.indexOf(B.n) < 0) { delete liftBacks[id]; return; }
          var f = floorAt(floors, B.n.x, B.n.y), dx = f ? f.dx : 0, dy = f ? f.dy : 0, dz = f ? f.z : 0;
          out.push([B.line[0][0] + dx, B.line[0][1] + dy, B.line[1][0] + dx, B.line[1][1] + dy, dz, dz + B.H]);
        });
      } catch (e) { /* walls as they were */ }
      return out;
    };
  }

  // Standing in the car: its buttons, one a floor, on the screen.
  function liftPanel(plan) {
    var box = V3 && V3.box;
    if (!box) { return; }
    var me = V3.me, car = V3.mode === "walk" && me ? liftRooms(plan).filter(function (c) { return insideArea(c.room, me.x, me.y); })[0] : null;
    var panel = el(".v3-lift", box);
    if (!car) { if (panel) { panel.remove(); } return; }
    var stops = liftStops(plan, car.lift), here = floorAt(plan.floors, me.x, me.y);
    if (stops.length < 2) { if (panel) { panel.remove(); } return; }
    var key = car.lift.id + "|" + stops.map(function (s) { return s.n.id; }).join(",") + "|" + (V3.ride ? V3.ride.state + V3.ride.shown : "") + "|" + (here ? here.level : "");
    if (panel && panel.dataset.key === key) { return; }
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "v3-lift";
      panel.setAttribute("role", "group");
      box.appendChild(panel);
    }
    panel.dataset.key = key;
    panel.setAttribute("aria-label", TXT.lf_panel);
    var R = V3.ride;
    panel.innerHTML = '<div class="v3-lift-at"></div><div class="v3-lift-keys"></div>';
    el(".v3-lift-at", panel).textContent = R && R.state !== "open" ? (R.dir > 0 ? "▲ " : "▼ ") + R.shown : (here ? floorName(here) : "");
    stops.slice().reverse().forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "v3-lift-key" + (here && s.f === here ? " here" : "") + (R && R.to === s ? " lit" : "");
      b.textContent = floorName(s.f);
      b.disabled = !!(R && R.state !== "open") || (here && s.f === here);
      b.onclick = function (ev) { ev.stopPropagation(); liftGo(plan, car, s); };
      el(".v3-lift-keys", panel).appendChild(b);
    });
  }
  function liftGo(plan, car, to) {
    var stops = liftStops(plan, car.lift), me = V3.me, here = floorAt(plan.floors, me.x, me.y);
    var from = stops.filter(function (s) { return s.f === here; })[0];
    to = stops.filter(function (s) { return s.n === to.n; })[0];      // (the one asked for, in this list of them)
    if (!to) { return; }
    if (!from || from === to) { return; }
    // the doors shut first
    liftDoors(plan, car).forEach(function (d) { doorOpen[d.id] = false; });
    var dir = to.f.z > from.f.z ? 1 : -1, between = Math.abs(stops.indexOf(to) - stops.indexOf(from));
    V3.ride = { car: car, from: from, to: to, dir: dir, floors: between, state: "shutting", t0: performance.now(), shown: floorName(from.f),
                stops: stops };
    v3Say(TXT.lf_going);
    V3.dirty = true;
  }
  function liftRide(now) {
    var R = V3.ride, plan = v3Ground(), me = V3.me;
    if (R.state === "shutting") {
      var shut = liftDoors(plan, R.car).every(function (d) { return (V3.doorAt[d.id] || 0) < 1; });
      if (shut && now - R.t0 > 650) { R.state = "riding"; R.t0 = now; R.ms = 1200 + 900 * R.floors; }
    } else if (R.state === "riding") {
      var k = Math.min(1, (now - R.t0) / R.ms), e = k * k * (3 - 2 * k);
      // the floors passed, on its panel; a little sway as it starts and stops
      var i0 = R.stops.indexOf(R.from), i1 = R.stops.indexOf(R.to), at = Math.round(i0 + (i1 - i0) * e);
      R.shown = floorName(R.stops[at].f);
      V3.stairZ = Math.sin(k * Math.PI * 2) * 0.012 * FLOOR_PX * (1 - Math.abs(2 * k - 1));
      if (k >= 1) {
        // there: the same spot in the car on that floor
        var l = climbLocal(R.from.n, me.x, me.y), p = climbWorld(R.to.n, l[0], l[1]);
        me.x = p[0]; me.y = p[1];
        V3.stairZ = 0;
        var arrived = liftRooms(plan).filter(function (c) { return c.lift === R.to.n; })[0];
        if (arrived) { liftDoors(plan, arrived).forEach(function (d) { doorOpen[d.id] = true; if (typeof DOOR_AJAR === "object") { DOOR_AJAR[d.id] = false; } }); }
        R.state = "open"; R.t0 = now; R.car = arrived || R.car;
        v3Say(say("lf_here", { floor: floorName(R.to.f) }));
      }
    } else if (R.state === "open" && now - R.t0 > 900) {
      V3.ride = null;
    }
    V3.dirty = true;
  }
  // E at a lift's doors calls it: they open all the way (not a little, 40-doors.js)
  if (typeof v3UseDoor === "function") {
    var v3UseDoorLift = v3UseDoor;
    v3UseDoor = function () {
      var before = {};
      Object.keys(doorOpen).forEach(function (k) { before[k] = doorOpen[k]; });
      var out = v3UseDoorLift.apply(this, arguments);
      try {
        var plan = v3Ground();
        Object.keys(doorOpen).forEach(function (k) {
          if (before[k] === doorOpen[k]) { return; }
          var d = nodeById(+k), car = d ? liftCarOf(plan, d) : null;
          if (!car) { return; }
          if (typeof DOOR_AJAR === "object") { DOOR_AJAR[k] = false; }
          if (doorOpen[k]) { v3Say(TXT.lf_called); }
        });
      } catch (e) { /* as a door */ }
      return out;
    };
  }
  // the panel kept up to date, each picture
  if (typeof v3Draw === "function") {
    var v3DrawLift = v3Draw;
    v3Draw = function () {
      var out = v3DrawLift.apply(this, arguments);
      try { if (V3) { liftPanel(v3Ground()); } } catch (e) { /* no buttons */ }
      return out;
    };
  }
