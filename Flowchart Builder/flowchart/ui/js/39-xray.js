// ---------------------------------------------------------------------------
//  39-xray.js -- what a house is wired with, and a look inside its walls:
//  outlets, switches and the breaker panel put where they go; and in 3D,
//  the walls seen through -- their studs and plates, the wires from the
//  panel, the water pipes hot and cold, the drains, the gas, the ducts
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "have it so there are outlets places too that
  // you can place in the house and other light switches and circuit
  // breakers in proper locations and when viewing the house the website
  // will let you see into the walls where all the wires, studs, plumbing is
  // and where it is going and the HVAC")

  // ---- wired: where the code puts things ----------------------------------------------
  // Outlets so that no point along a wall is more than 6 ft (1.8 m) from one
  // -- one every 12 ft (3.6 m) -- and one every 4 ft (1.2 m) over a kitchen's
  // counters, a hand over them; one by a bathroom's basin; a switch inside
  // every door into a room, on the side it opens from; the panel in the
  // garage (or the utility room, the laundry, the basement, a hall).
  var WIRE_SKIP = { closet: 1, stairs: 1, lift: 1, fitting: 1 };
  var WIRE_PANEL_ROOMS = ["garage", "utility", "laundry", "stock", "storage", "family", "hall"];
  function wireKindOf(plan, r) {
    var k = typeof roomKind === "function" ? roomKind(plan, r) : "room";
    if (r.use) { k = r.use === "stock" || r.use === "lift" ? r.use : k; }
    return k;
  }
  // (a room at a time, said as it goes: Start building runs it in slices, 40-work.js)
  function wireHouse(rooms) { return typeof stepsDrive === "function" ? stepsDrive(wireSteps(rooms)) : 0; }
  function* wireSteps(rooms) {
    if (typeof starterAlong !== "function") { return 0; }
    var plan = walkPlan(), P = FLOOR_PX, made = 0;
    rooms = rooms || hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    // what is wired already, taken down to be put up again
    hand.nodes = hand.nodes.filter(function (n) { return !n.wired; });
    var J = typeof tieLayout === "function" ? tieLayout() : null, doors = [];
    hand.nodes.forEach(function (d) {
      if (!WALK_DOORS[d.kind]) { return; }
      var m = J && J.moves[d.id];
      doors.push(m ? Object.assign({}, d, m) : d);
    });
    if (J && J.made) { J.made.forEach(function (one) { if (one.node && WALK_DOORS[one.node.kind]) { doors.push(one.node); } }); }
    // the doors as the house stands in 3D, in each room's own numbers on the paper
    function doorsBy(r) {
      var d0 = J && J.delta[r.id] ? J.delta[r.id] : [0, 0], rb = J && J.boxes[r.id] ? J.boxes[r.id] : tieBox(r);
      return doors.filter(function (d) {
        return d.x >= rb.l - 40 && d.x <= rb.r + 40 && d.y >= rb.t - 40 && d.y <= rb.b + 40;
      }).map(function (d) { return Object.assign({}, d, { x: d.x - d0[0], y: d.y - d0[1] }); });
    }
    function put(r, kind, near, lift) {
      var go = starterAlong(r, kind, near, doorsBy(r));
      if (!go) { return null; }
      go();
      var n = nodeById(picked);
      if (n && n.kind === kind) { n.wired = true; n.own = true; if (lift !== undefined) { n.lift = lift; } made++; }
      return n;
    }
    var wireRoom = function (r) {
      var kind = wireKindOf(plan, r), b = tieBox(r);
      if (WIRE_SKIP[kind] || WIRE_SKIP[r.use] || Math.min(r.w, r.h) < 1.2 * P) { return; }
      // a switch inside each door into it -- the doors as the house stands
      // (rooms drawn apart have theirs only where their arrows meet, 39-join.js)
      var d0 = J && J.delta[r.id] ? J.delta[r.id] : [0, 0], rb = J && J.boxes[r.id] ? J.boxes[r.id] : tieBox(r);
      doors.forEach(function (d) {
        if (d.kind === "i_garagedoor" || d.x < rb.l - 14 || d.x > rb.r + 14 || d.y < rb.t - 14 || d.y > rb.b + 14) { return; }
        var a = (d.turn || 0) * Math.PI / 180, lx = Math.cos(a), ly = Math.sin(a);
        var side = d.w / 2 + 0.18 * P;
        put(r, "i_lightswitch", { x: d.x + lx * side - d0[0], y: d.y + ly * side - d0[1] }, 1.15);
      });
      // counters: an outlet over each, a hand over the worktop
      hand.nodes.forEach(function (c) {
        if ((c.kind !== "i_counter" && c.kind !== "i_kitchensink" && c.kind !== "i_island") || !insideArea(r, c.x, c.y)) { return; }
        if (c.kind === "i_island") { return; }
        var many = Math.max(1, Math.round(c.w / (1.2 * P)));
        for (var k = 0; k < many; k++) {
          var a2 = (c.turn || 0) * Math.PI / 180, along = (k + 0.5) / many * c.w - c.w / 2;
          put(r, "i_outlet", { x: c.x + Math.cos(a2) * along, y: c.y + Math.sin(a2) * along }, 1.1);
        }
      });
      // by the basin
      var basin = hand.nodes.filter(function (s) { return (s.kind === "i_sink" || s.kind === "i_vanity") && insideArea(r, s.x, s.y); })[0];
      if (basin) { put(r, "i_outlet", { x: basin.x, y: basin.y }, 1.05); }
      // round the walls, every 3.6 m
      var per = 2 * ((b.r - b.l) + (b.b - b.t)), count = kind === "hall" || kind === "bath" ? 1 : Math.max(1, Math.round(per / (3.6 * P)));
      for (var i = 0; i < count; i++) {
        var t = (i + 0.5) / count * per, x, y;
        if (t < b.r - b.l) { x = b.l + t; y = b.t; }
        else if (t < (b.r - b.l) + (b.b - b.t)) { x = b.r; y = b.t + t - (b.r - b.l); }
        else if (t < 2 * (b.r - b.l) + (b.b - b.t)) { x = b.r - (t - (b.r - b.l) - (b.b - b.t)); y = b.b; }
        else { x = b.l; y = b.b - (t - 2 * (b.r - b.l) - (b.b - b.t)); }
        put(r, "i_outlet", { x: x, y: y });
      }
    };
    for (var wi = 0; wi < rooms.length; wi++) { wireRoom(rooms[wi]); yield ["wire", (wi + 1) / rooms.length]; }
    // the panel, once a house
    if (!hand.nodes.some(function (n) { return n.kind === "i_breaker" && !n.wired; })) {
      var home = null;
      WIRE_PANEL_ROOMS.some(function (k) {
        home = rooms.filter(function (r) { var rk = wireKindOf(plan, r); return rk === k || r.use === k; })[0] || null;
        return !!home;
      });
      home = home || rooms[0];
      if (home) { var bb = tieBox(home); put(home, "i_breaker", { x: bb.l, y: bb.t }); }
    }
    return made;
  }
  // Asked for from the 3D view's inside-the-walls panel, or by Start a house.
  function wireHouseNow() {
    keepUndo();
    var n = wireHouse();
    picked = null;
    if (typeof handKeep === "function") { handKeep(); }
    drawHand(); drawHandPanel(); showReport();
    if (V3) { V3.dirty = true; V3.ground = null; V3.xrayKept = null; }
    handSaysQuiet(say("xr_wired", { n: n }));
  }
  function handSaysQuiet(words) { if (V3 && typeof v3Say === "function") { v3Say(words); } else if (typeof handSays === "function") { handSays(words); } }
  // Start a house: wired, if asked
  if (starterWant.wire === undefined) { starterWant.wire = true; }
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var count = hand.nodes.length;
      var out = yield* inner(want);
      try {
        if (want && want.wire) {
          var mine = hand.nodes.slice(count).filter(function (n) { return n.kind === "i_room"; });
          if (!mine.length) { mine = (typeof starterLast === "object" ? starterLast : []).map(function (o) { return o.room; }); }
          yield* wireSteps(mine);
          picked = null;
          drawHand(); drawHandPanel(); showReport();
        }
      } catch (e) { /* unwired */ }
      return out;
    });
  }

  // ---- seen through: inside the walls ------------------------------------------------------
  // In 3D, the walls, floors and ceilings faint, and in them: the framing --
  // studs every 16 in (406 mm), plates top and bottom, a header over every
  // door and window, joists over every ceiling; the wiring, a color a
  // circuit, from the panel over the ceilings to each room and down the
  // walls to its outlets and switches and up to its lights; the water, cold
  // in blue from the main at the street and hot in red from the water
  // heater, under the floor to every tap; the drains, grey, down to the
  // sewer, and a vent up through the roof; the gas, yellow, to the stove,
  // the furnace and the heater; and the ducts from the furnace to every
  // vent.  Each can be shown or not.
  var XRAY_LAYERS = ["frame", "power", "water", "drain", "gas", "air"];
  var XRAY_COLORS = { frame: "#d6b383", water: "#3f86d9", hot: "#d9534f", drain: "#8a8f95", gas: "#e8c24a", air: "#b9c2c9" };
  var XRAY_CIRCUITS = ["#f2b134", "#e4572e", "#29a3a3", "#7a5cc7", "#4caf50", "#ec6fa8", "#3f86d9", "#c98a3f"];
  var XRAY_WET = { i_sink: "basin", i_vanity: "basin", i_kitchensink: "basin", i_utilitysink: "basin", i_bathtub: "tub", i_cornertub: "tub",
                   i_shower: "shower", i_toilet: "toilet", i_washer: "washer", i_dishwasher: "dish" };
  var XRAY_GAS = { i_stove: 1, i_oven: 1, i_furnace: 1, i_fireplace: 1, i_dryer: 1, i_grill: 0 };
  var XRAY_POWER = { i_stove: 1, i_oven: 1, i_dryer: 1, i_washer: 1, i_dishwasher: 1, i_fridge: 1, i_microwave: 1, i_furnace: 1, i_ac: 1,
                     i_evcharger: 1, i_freezer: 1, i_winecooler: 1, i_cooler: 1, i_checkout: 1 };
  var XRAY_LIGHTS = { i_pendant: 1, i_chandelier: 1, i_ceilingfan: 1, i_sconce: 1 };
  function xrayOn() { return !!(V3 && V3.xray && V3.scene !== "space"); }
  function xrayLayer(k) { var s = V3 && V3.xrayShow; return !s || s[k] !== false; }
  // A run of pipe or wire from one point to another, square in section,
  // the way the walls and the floors carry it.
  function xraySeg(faces, a, b, r, how) {
    var x0 = Math.min(a[0], b[0]) - r, x1 = Math.max(a[0], b[0]) + r, y0 = Math.min(a[1], b[1]) - r, y1 = Math.max(a[1], b[1]) + r;
    var z0 = Math.min(a[2], b[2]) - r, z1 = Math.max(a[2], b[2]) + r;
    if (x1 - x0 < 0.2 && y1 - y0 < 0.2 && z1 - z0 < 0.2) { return; }
    v3Prism(faces, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1, how);
  }
  // A route: up (or down) to a height, along x, along y, and down (or up) to the end.
  function xrayRoute(faces, a, b, at, r, how) {
    var p1 = [a[0], a[1], at], p2 = [b[0], a[1], at], p3 = [b[0], b[1], at];
    xraySeg(faces, a, p1, r, how); xraySeg(faces, p1, p2, r, how); xraySeg(faces, p2, p3, r, how); xraySeg(faces, p3, b, r, how);
  }
  function xrayFloors() {
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    return {
      floors: floors,
      of: function (n) { return floors.length ? floorAt(floors, n.x, n.y) : null; },
      at: function (n, lx, ly) {               // a point of a node, in the house as it stands, and its floor's height
        var f = floors.length ? floorAt(floors, n.x, n.y) : null;
        return [(lx === undefined ? n.x : lx) + (f ? f.dx : 0), (ly === undefined ? n.y : ly) + (f ? f.dy : 0), f ? f.z : 0, f ? f.level : 0];
      }
    };
  }
  function xrayShownLevel(level, F) {
    var inside = V3.mode === "walk", indoors = inside && !!V3.inRoom;
    if (inside) { return !indoors || level === (V3.myLevel || 0); }
    return V3.upTo === null || V3.upTo === undefined || level <= V3.upTo;
  }
  // The framing of one room's walls: studs, plates, headers -- and the
  // joists over its ceiling.
  function xrayFrame(faces, room, F, how) {
    var P = FLOOR_PX, T = Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06)), hw = room.w / 2, hh = room.h / 2;
    var f = F.of(room), dz = f ? f.z : 0, dx = f ? f.dx : 0, dy = f ? f.dy : 0;
    var top = ceilOf(room) * P, stud = 0.038 * P, every = 0.406 * P;
    var at = { x: room.x + dx, y: room.y + dy, turn: room.turn || 0 };
    function box(x0, x1, y0, y1, z0, z1) {
      var base = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (p) { return v3Local(at, p[0], p[1]); });
      v3Prism(faces, base, dz + z0, dz + z1, how);
    }
    WALL_EDGES.forEach(function (edge) {
      var len = edge === "top" || edge === "foot" ? room.w : room.h;
      // what stands in the wall: doors and windows (a header over each), and the stretches taken out
      var holes = [];
      hand.nodes.forEach(function (m) {
        if (!WALK_DOORS[m.kind] && m.kind !== "i_window") { return; }
        var hole = v3Hole(room, edge, T, m);
        if (hole) { hole.window = m.kind === "i_window"; holes.push(hole); }
      });
      var runs = typeof wallOpenRuns === "function" ? wallOpenRuns(room, edge) : [];
      function within(a) { return holes.some(function (h) { return a > h.a - 1 && a < h.b + 1; }) || runs.some(function (r) { return a > r.a && a < r.b; }); }
      function part(a, b, z0, z1) {
        if (edge === "top") { box(-hw + a, -hw + b, -hh, -hh + T, z0, z1); }
        else if (edge === "foot") { box(-hw + a, -hw + b, hh - T, hh, z0, z1); }
        else if (edge === "left") { box(-hw, -hw + T, -hh + a, -hh + b, z0, z1); }
        else { box(hw - T, hw, -hh + a, -hh + b, z0, z1); }
      }
      // plates: the bottom one, and the top one doubled, along every stretch that is wall
      var spans = [[0, len]];
      runs.forEach(function (r) {
        var next = [];
        spans.forEach(function (s) { if (r.b <= s[0] || r.a >= s[1]) { next.push(s); return; } if (r.a > s[0]) { next.push([s[0], r.a]); } if (r.b < s[1]) { next.push([r.b, s[1]]); } });
        spans = next;
      });
      spans.forEach(function (s) { part(s[0], s[1], top - 2 * stud, top); });
      spans.forEach(function (s) {
        var cut = [[s[0], s[1]]];
        holes.filter(function (h) { return !h.window; }).forEach(function (h) {
          var next = [];
          cut.forEach(function (c) { if (h.b <= c[0] || h.a >= c[1]) { next.push(c); return; } if (h.a > c[0]) { next.push([c[0], h.a]); } if (h.b < c[1]) { next.push([h.b, c[1]]); } });
          cut = next;
        });
        cut.forEach(function (c) { part(c[0], c[1], 0, stud); });
      });
      for (var a = stud / 2 + 1; a < len - 1; a += every) {
        if (within(a)) { continue; }
        part(a - stud / 2, a + stud / 2, stud, top - 2 * stud);
      }
      part(len - stud - 1, len - 1, stud, top - 2 * stud);
      holes.forEach(function (h) {
        var head = Math.min(DOOR_TALL * P, top - 0.1 * P);
        part(h.a - stud, h.b + stud, head, head + 0.24 * P);                        // the header
        part(h.a - stud, h.a, stud, head); part(h.b, h.b + stud, stud, head);        // king and jack studs
        if (h.window) { part(h.a, h.b, SILL * P - stud, SILL * P); }               // the sill plate
      });
    });
    // joists over the ceiling, across its shorter way
    var across = room.w <= room.h, n = Math.floor((across ? room.h : room.w) / every);
    for (var k = 1; k < n; k++) {
      var v = -(across ? hh : hw) + k * every;
      if (across) { box(-hw + T, hw - T, v - stud / 2, v + stud / 2, top, top + 0.235 * P); }
      else { box(v - stud / 2, v + stud / 2, -hh + T, hh - T, top, top + 0.235 * P); }
    }
  }
  // Where the panel, the water heater, the furnace are -- drawn where none is.
  function xrayPlant(F, rooms) {
    function pick(kinds) {
      var plan = walkPlan(), best = null;
      kinds.some(function (k) {
        best = rooms.filter(function (r) { var rk = wireKindOf(plan, r); return (rk === k || r.use === k) && F.at(r)[3] <= 0; })[0] || null;
        return !!best;
      });
      return best || rooms.filter(function (r) { return F.at(r)[3] === 0; })[0] || rooms[0];
    }
    var panel = hand.nodes.filter(function (n) { return n.kind === "i_breaker"; })[0];
    var furnace = hand.nodes.filter(function (n) { return n.kind === "i_furnace"; })[0];
    var room = pick(["utility", "laundry", "garage", "storage", "stock", "family", "hall"]);
    var b = room ? tieBox(room) : null, P = FLOOR_PX;
    function corner(dx, dy) { return b ? F.at(room, b.l + dx * P, b.t + dy * P) : [0, 0, 0, 0]; }
    return {
      room: room,
      panel: panel ? F.at(panel) : corner(0.3, 0.2),
      panelMade: !!panel,
      heater: corner(0.55, 0.55),
      furnace: furnace ? F.at(furnace) : corner(1.4, 0.55),
      furnaceMade: !!furnace
    };
  }
  function xrayBuild(model) {
    var P = FLOOR_PX, F = xrayFloors(), faces = [], labels = [];
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && xrayShownLevel(F.at(n)[3], F); });
    if (!rooms.length) { return { faces: faces, labels: labels }; }
    var plant = xrayPlant(F, hand.nodes.filter(function (n) { return n.kind === "i_room"; }));
    function look(color, extra) { return Object.assign({ piece: true, color: color, edge: v3Mix(color, "#000000", 0.3), bare: true, xray: true }, extra || {}); }
    function ceilAt(n) {
      var room = hand.nodes.filter(function (m) { return m.kind === "i_room" && insideArea(m, n.x, n.y); }).sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
      return ceilOf(room || n) * P;
    }
    function shown(n) { return xrayShownLevel(F.at(n)[3], F); }
    // the framing
    if (xrayLayer("frame")) {
      var wood = look(XRAY_COLORS.frame, { pat: 21 });
      rooms.forEach(function (r) { if (!((r.turn || 0) % 90)) { xrayFrame(faces, r, F, wood); } });
    }
    // the wiring: from the panel up, over the ceilings, to each room; down to each outlet and switch, up to each light
    if (xrayLayer("power")) {
      var pan = plant.panel, circuit = {};
      if (!plant.panelMade) {
        v3Prism(faces, [[pan[0] - 0.22 * P, pan[1] - 0.05 * P], [pan[0] + 0.22 * P, pan[1] - 0.05 * P], [pan[0] + 0.22 * P, pan[1] + 0.05 * P], [pan[0] - 0.22 * P, pan[1] + 0.05 * P]],
                pan[2] + 1.2 * P, pan[2] + 1.95 * P, look("#9aa3a8"));
      }
      labels.push({ x: pan[0], y: pan[1], z: pan[2] + 2.15 * P, text: TXT.xr_panel });
      hand.nodes.forEach(function (n) {
        var light = XRAY_LIGHTS[n.kind], dev = n.kind === "i_outlet" || n.kind === "i_lightswitch" || XRAY_POWER[n.kind] || light;
        if (!dev || !shown(n)) { return; }
        var room = hand.nodes.filter(function (m) { return m.kind === "i_room" && insideArea(m, n.x, n.y, 14); }).sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
        if (!room) { return; }
        if (circuit[room.id] === undefined) { circuit[room.id] = Object.keys(circuit).length % XRAY_CIRCUITS.length; }
        var wire = look(XRAY_CIRCUITS[circuit[room.id]]), p = F.at(n), top = p[2] + ceilAt(n) + 0.06 * P;
        var h = n.kind === "i_outlet" || n.kind === "i_lightswitch" ? wallHang(n)[0] * P + 0.06 * P : light ? ceilAt(n) : (XRAY_POWER[n.kind] ? 0.3 * P : 0.4 * P);
        var end = [p[0], p[1], p[2] + h];
        // the home run: up out of the panel to its floor's ceiling (to the floor over, a riser), across
        var start = [pan[0], pan[1], pan[2] + 1.95 * P];
        if (p[3] !== pan[3]) {
          xraySeg(faces, start, [pan[0], pan[1], top], 0.02 * P, wire);
          start = [pan[0], pan[1], top];
        }
        xrayRoute(faces, start, end, top, 0.016 * P, wire);
      });
    }
    // the water: from the main at the front of the house, and the heater, under the floor to every tap
    var wet = hand.nodes.filter(function (n) { return XRAY_WET[n.kind] && shown(n); });
    var fb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    rooms.forEach(function (r) { var q = F.at(r), t = turned(r); fb.l = Math.min(fb.l, q[0] - t.w / 2); fb.r = Math.max(fb.r, q[0] + t.w / 2); fb.t = Math.min(fb.t, q[1] - t.h / 2); fb.b = Math.max(fb.b, q[1] + t.h / 2); });
    var main = [(fb.l + fb.r) / 2, fb.b + 0.4 * P, -0.18 * P], sewer = [(fb.l + fb.r) / 2 + 0.6 * P, fb.b + 0.4 * P, -0.45 * P];
    if (wet.length && xrayLayer("water")) {
      var cold = look(XRAY_COLORS.water), hot = look(XRAY_COLORS.hot), heat = plant.heater;
      var tank = [];
      for (var k = 0; k < 14; k++) { var q = k / 14 * Math.PI * 2; tank.push([heat[0] + Math.cos(q) * 0.28 * P, heat[1] + Math.sin(q) * 0.28 * P]); }
      v3Prism(faces, tank, heat[2], heat[2] + 1.5 * P, look("#e8e6e1"));
      labels.push({ x: heat[0], y: heat[1], z: heat[2] + 1.75 * P, text: TXT.xr_heater });
      labels.push({ x: main[0], y: main[1], z: 0.3 * P, text: TXT.xr_main });
      xraySeg(faces, [main[0], main[1] + 1.2 * P, main[2]], main, 0.03 * P, cold);
      xrayRoute(faces, main, [heat[0], heat[1], heat[2] + 0.2 * P], main[2], 0.025 * P, cold);
      wet.forEach(function (n) {
        var p = F.at(n), tap = [p[0], p[1], p[2] + (XRAY_WET[n.kind] === "shower" ? 1.0 : 0.5) * P], below = p[2] - 0.12 * P;
        xrayRoute(faces, main, tap, below, 0.018 * P, cold);
        if (XRAY_WET[n.kind] !== "toilet") {
          xrayRoute(faces, [heat[0], heat[1], heat[2] + 1.5 * P], [tap[0] + 0.07 * P, tap[1], tap[2]], below + 0.05 * P, 0.018 * P, hot);
        }
      });
    }
    // the drains, down to the sewer; a vent up through the roof from the bathrooms
    if (wet.length && xrayLayer("drain")) {
      var grey = look(XRAY_COLORS.drain), vented = {};
      labels.push({ x: sewer[0], y: sewer[1], z: 0.15 * P, text: TXT.xr_sewer });
      xraySeg(faces, sewer, [sewer[0], sewer[1] + 1.5 * P, sewer[2]], 0.05 * P, grey);
      wet.forEach(function (n) {
        var p = F.at(n), drop = [p[0], p[1] - 0.12 * P, p[2] + 0.1 * P];
        xrayRoute(faces, drop, sewer, -0.3 * P, XRAY_WET[n.kind] === "toilet" ? 0.045 * P : 0.03 * P, grey);
        var room = hand.nodes.filter(function (m) { return m.kind === "i_room" && insideArea(m, n.x, n.y); })[0];
        if (room && !vented[room.id] && (XRAY_WET[n.kind] === "toilet" || XRAY_WET[n.kind] === "tub")) {
          vented[room.id] = true;
          xraySeg(faces, [p[0], p[1] - 0.12 * P, p[2]], [p[0], p[1] - 0.12 * P, p[2] + ceilAt(n) + 1.6 * P], 0.03 * P, grey);
        }
      });
    }
    // the gas
    if (xrayLayer("gas")) {
      var gas = look(XRAY_COLORS.gas), meter = [fb.r + 0.15 * P, (fb.t + fb.b) / 2, 0.6 * P], any = false;
      hand.nodes.forEach(function (n) {
        if (!XRAY_GAS[n.kind] || !shown(n)) { return; }
        any = true;
        var p = F.at(n);
        xrayRoute(faces, meter, [p[0], p[1], p[2] + 0.3 * P], p[2] - 0.08 * P, 0.016 * P, gas);
      });
      if (any || wet.length) {
        xrayRoute(faces, meter, [plant.heater[0], plant.heater[1], plant.heater[2] + 0.3 * P], -0.08 * P, 0.016 * P, gas);
        v3Prism(faces, [[meter[0], meter[1] - 0.15 * P], [meter[0] + 0.25 * P, meter[1] - 0.15 * P], [meter[0] + 0.25 * P, meter[1] + 0.15 * P], [meter[0], meter[1] + 0.15 * P]],
                0.5 * P, 0.9 * P, look("#c9b04a"));
        labels.push({ x: meter[0], y: meter[1], z: 1.1 * P, text: TXT.xr_meter });
      }
    }
    // the ducts: from the furnace up, a trunk over the ceiling, a branch to every vent
    var vents = hand.nodes.filter(function (n) { return n.kind === "i_vent" && shown(n); });
    if (vents.length && xrayLayer("air")) {
      var duct = look(XRAY_COLORS.air, { pat: 22 }), fu = plant.furnace;
      if (!plant.furnaceMade) {
        v3Prism(faces, [[fu[0] - 0.3 * P, fu[1] - 0.3 * P], [fu[0] + 0.3 * P, fu[1] - 0.3 * P], [fu[0] + 0.3 * P, fu[1] + 0.3 * P], [fu[0] - 0.3 * P, fu[1] + 0.3 * P]],
                fu[2], fu[2] + 1.3 * P, look("#d8d6d1"));
      }
      labels.push({ x: fu[0], y: fu[1], z: fu[2] + 1.6 * P, text: TXT.xr_furnace });
      vents.forEach(function (v) {
        var p = F.at(v), over = p[2] + ceilAt(v) + 0.14 * P;
        xrayRoute(faces, [fu[0], fu[1], fu[2] + 1.3 * P], [p[0], p[1], p[2] + ceilAt(v)], over, 0.08 * P, duct);
      });
    }
    return { faces: faces, labels: labels };
  }
  // Put into the picture: what is drawn faint, and what is inside -- the
  // latter kept while the house stays the same.
  function xrayApply(model) {
    if (!xrayOn() || (V3.flat && V3.flatDone)) { return; }
    if (V3.mode !== "walk" && (V3.rise === undefined ? 1 : V3.rise) < 0.98) { return; }
    var faint = new Map();
    model.faces.forEach(function (f) {
      var h = f.how;
      if (!h || h.xray || f.mesh) { return; }
      var a = h.wall ? 0.16 : h.floor ? 0.4 : h.ceiling ? 0.25 : h.roof ? 0.2 : null;
      if (a === null || f.ground) { return; }
      if (!faint.has(h)) { faint.set(h, Object.assign({}, h, { alpha: Math.min(a, h.alpha === undefined ? 1 : h.alpha), late: true })); }
      f.how = faint.get(h);
    });
    var key = JSON.stringify([V3.mode, V3.upTo, V3.myLevel, !!V3.inRoom, V3.xrayShow || null, hand.nodes.map(function (n) {
      return [n.id, n.kind, Math.round(n.x), Math.round(n.y), n.w, n.h, n.turn || 0, n.ceil || 0, n.open || 0, n.lift || 0];
    })]);
    if (!V3.xrayKept || V3.xrayKept.key !== key) { V3.xrayKept = { key: key, made: xrayBuild(model) }; }
    Array.prototype.push.apply(model.faces, V3.xrayKept.made.faces);
    if ((V3.labelV === undefined ? 1 : V3.labelV) > 0.01) { Array.prototype.push.apply(model.labels, V3.xrayKept.made.labels); }
  }
  if (typeof v3Build === "function") {
    var v3BuildXray = v3Build;
    v3Build = function () {
      var model = v3BuildXray.apply(this, arguments);
      try { xrayApply(model); } catch (e) { /* the house as it is */ }
      return model;
    };
  }

  // ---- its button, and what is shown -------------------------------------------------------
  HOUSE_ICONS.xray = '<rect x="3" y="3.5" width="14" height="13" rx="1.5"/><path d="M3 8.2h14M3 12.6h14M7.6 3.5v4.7M12.4 8.2v4.4M7.6 12.6v3.9" stroke-dasharray="1.6 1.4"/>';
  HOUSE_ICONS.xr_frame = '<path d="M4 17V3M8 17V3M12 17V3M16 17V3M2.6 3h14.8M2.6 17h14.8"/>';
  HOUSE_ICONS.xr_power = '<path d="M11.4 2.6 5 11h4.6l-1 6.4L15 9h-4.6z"/>';
  HOUSE_ICONS.xr_water = '<path d="M10 3.2s4.6 5.2 4.6 8.4a4.6 4.6 0 0 1-9.2 0C5.4 8.4 10 3.2 10 3.2z"/>';
  HOUSE_ICONS.xr_drain = '<path d="M6 3v7.4a4 4 0 0 0 4 4h7M3.4 17.4h4.4"/><path d="M14 11.6l3 2.8-3 2.8"/>';
  HOUSE_ICONS.xr_gas = '<path d="M10 17.4a5 5 0 0 0 5-5c0-3.4-3-4.6-3.6-8.2C9 6 6 8.6 6 12.2a4 4 0 0 0 4 5.2z"/>';
  HOUSE_ICONS.xr_air = '<path d="M3 7h9.6a2.4 2.4 0 1 0-2.4-2.4M3 11h12.6a2.4 2.4 0 1 1-2.4 2.4M3 15h6"/>';
  V3_GROUPS[2].push("xray");
  function xrayButton() {
    if (!V3 || !V3.box || V3.scene === "space") { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar || el('[data-v3="xray"]', bar)) { return; }
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn small";
    b.dataset.v3 = "xray";
    b.setAttribute("aria-pressed", "false");
    b.onclick = function (ev) {
      ev.stopPropagation();
      V3.xray = !V3.xray;
      V3.xrayKept = null;
      b.setAttribute("aria-pressed", V3.xray ? "true" : "false");
      b.classList.toggle("primary", V3.xray);
      xrayPanel();
      V3.dirty = true;
    };
    bar.insertBefore(b, el('[data-v3="shut"]', bar));
  }
  function xrayWords() {
    if (!V3 || !V3.box) { return; }
    var b = el('[data-v3="xray"]', V3.box);
    if (b) {
      var lbl = el(".v3-lbl", b);
      if (lbl) { if (lbl.textContent !== TXT.xr_button) { lbl.textContent = TXT.xr_button; } } else { b.textContent = TXT.xr_button; }
      b.title = TXT.xr_tip; b.setAttribute("aria-label", TXT.xr_tip);
      b.hidden = V3.scene === "space";
    }
    if (V3.xray) { xrayPanel(); }
  }
  // Over the view's corner: what each color is, each a switch.
  function xrayPanel() {
    if (!V3 || !V3.box) { return; }
    var box = el(".v3-xray", V3.box);
    if (!V3.xray) { if (box) { box.remove(); } return; }
    if (!box) {
      box = document.createElement("div");
      box.className = "v3-xray";
      box.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); });
      box.addEventListener("wheel", function (ev) { ev.stopPropagation(); });
      V3.box.appendChild(box);
    }
    V3.xrayShow = V3.xrayShow || {};
    box.innerHTML = '<div class="v3-xray-head"></div>';
    box.firstChild.textContent = TXT.xr_head;
    var swatch = { frame: XRAY_COLORS.frame, power: XRAY_CIRCUITS[0], water: XRAY_COLORS.water, drain: XRAY_COLORS.drain, gas: XRAY_COLORS.gas, air: XRAY_COLORS.air };
    XRAY_LAYERS.forEach(function (k) {
      var row = document.createElement("label");
      row.className = "switch wide v3-xray-row";
      row.innerHTML = '<span><i class="v3-xray-dot"></i>' + houseIcon("xr_" + k) + '<em></em></span><input type="checkbox">';
      row.querySelector(".v3-xray-dot").style.background = k === "water" ? "linear-gradient(90deg," + XRAY_COLORS.water + " 50%," + XRAY_COLORS.hot + " 50%)" : swatch[k];
      row.querySelector("em").textContent = TXT["xr_" + k];
      var input = row.querySelector("input");
      input.checked = V3.xrayShow[k] !== false;
      input.onchange = function () { V3.xrayShow[k] = input.checked; V3.xrayKept = null; V3.dirty = true; };
      box.appendChild(row);
    });
    var wired = hand.nodes.some(function (n) { return n.kind === "i_outlet" || n.kind === "i_lightswitch"; });
    var go = document.createElement("button");
    go.type = "button";
    go.className = "btn small v3-xray-wire";
    go.textContent = wired ? TXT.xr_rewire : TXT.xr_wire;
    go.title = TXT.xr_wire_tip;
    go.onclick = function (ev) { ev.stopPropagation(); wireHouseNow(); xrayPanel(); };
    box.appendChild(go);
  }
  if (typeof v3Open === "function") {
    var v3OpenXray = v3Open;
    v3Open = function () {
      var was = V3, out = v3OpenXray.apply(this, arguments);
      try { if (V3 && V3 !== was) { xrayButton(); xrayWords(); v3DressBar(); } } catch (e) { /* without it */ }
      return out;
    };
    var v3WordsXray = v3Words;
    v3Words = function () {
      var out = v3WordsXray.apply(this, arguments);
      try { xrayButton(); xrayWords(); v3DressBar(); } catch (e) { /* fine */ }
      return out;
    };
  }
