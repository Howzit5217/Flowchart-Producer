// ---------------------------------------------------------------------------
//  40-systems.js -- a house's systems, set and seen: put in for you, or by
//  you with the code's checks to go by; and inside its walls all of it --
//  the cables in the colors their size gives them, each box's black, white
//  and bare wires, the panel's ground rod; the insulation; the data, TV and
//  alarm wiring; a trap under every basin, a shutoff at every tap, the
//  main's valve, hose bibs; the return air, the AC unit outside and its
//  lines, the fans' ducts out through the roof
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "when you are designing your home you can have
  // it set to automatic plumbing, wiring, and HVAC or make it so you can do
  // it yourself and to make sure when you can see in the walls you can see
  // all the plumbing, wires (with proper colors), HVAC, Insulation, and
  // anything that I might be forgetting")

  // ---- the parts themselves, in 3D: 38-models.js (a smoke alarm, a thermostat, the water heater, a bathroom's fan)

  // ---- automatic, or by you -------------------------------------------------------------------------
  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.services = "auto"; }
  var SYS_KINDS = ["auto", "diy"];
  function sysDiy() { return houseOpt("services") === "diy"; }
  // Put in with the wiring (39-xray.js): a smoke alarm in every bedroom and
  // hall, a fan in every bathroom, a thermostat on a hall's wall, a water
  // heater by the panel -- each `wired`, so wired again it is put again.
  var SYS_SMOKE = { bed: 1, main: 1, hall: 1 };
  if (typeof wireSteps === "function") {
    var wireStepsSys = wireSteps;
    wireSteps = function* (rooms) {
      var made = yield* wireStepsSys(rooms);
      try { made += sysParts(rooms); } catch (e) { if (window.console && console.warn) { console.warn("systems:", e && e.message); } }
      return made;
    };
  }
  function sysParts(rooms) {
    if (typeof starterAlong !== "function") { return 0; }
    var plan = walkPlan(), P = FLOOR_PX, made = 0, floors = floorsOf();
    rooms = (rooms || hand.nodes.filter(function (n) { return n.kind === "i_room"; })).filter(function (r) { return !r.attic || r.attic === "room"; });
    function has(kind, r) { return hand.nodes.some(function (n) { return n.kind === kind && insideArea(r, n.x, n.y); }); }
    function put(kind, x, y) { var n = adviceAdd(kind, Math.round(x), Math.round(y)); n.wired = true; n.own = true; made++; return n; }
    var levels = {};
    rooms.forEach(function (r) {
      var kind = wireKindOf(plan, r), f = floors.length ? floorAt(floors, r.x, r.y) : null, lv = f ? f.level : 0;
      if (Math.min(r.w, r.h) < 1.2 * P) { return; }
      if ((SYS_SMOKE[kind] || r.attic === "room") && !has("i_smoke", r)) {
        // (off the middle where a fan or a light hangs)
        put("i_smoke", r.x + (r.w > r.h ? r.w * 0.2 : 0), r.y + (r.w > r.h ? 0 : r.h * 0.2));
        levels[lv] = true;
      }
      if ((kind === "bath" || kind === "ensuite") && !has("i_exhaustfan", r)) { put("i_exhaustfan", r.x, r.y - r.h * 0.2); }
    });
    // a level with nobody's bedroom nor hall still has one, in its biggest room
    rooms.forEach(function (r) {
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, lv = f ? f.level : 0;
      if (levels[lv] === undefined) { levels[lv] = false; }
    });
    Object.keys(levels).forEach(function (lv) {
      if (levels[lv]) { return; }
      var big = rooms.filter(function (r) { var f = floors.length ? floorAt(floors, r.x, r.y) : null; return String(f ? f.level : 0) === lv; })
        .sort(function (p, q) { return q.w * q.h - p.w * p.h; })[0];
      if (big && !has("i_smoke", big)) { put("i_smoke", big.x + big.w * 0.2, big.y); }
    });
    // the thermostat, once: on a hall's wall (else the living room's), at the height of an eye
    if (!hand.nodes.some(function (n) { return n.kind === "i_thermostat"; })) {
      var host = rooms.filter(function (r) { return wireKindOf(plan, r) === "hall"; })[0] || rooms.filter(function (r) { return wireKindOf(plan, r) === "living"; })[0];
      if (host) {
        var go = starterAlong(host, "i_thermostat", { x: host.x, y: host.y });
        if (go) { go(); var t = nodeById(picked); if (t && t.kind === "i_thermostat") { t.wired = true; t.own = true; made++; } }
      }
    }
    // the water heater, once: by the panel -- the garage, the utility room, the laundry
    if (!hand.nodes.some(function (n) { return n.kind === "i_waterheater"; })) {
      var spot = null;
      ["utility", "laundry", "garage", "storage", "stock"].some(function (k) {
        spot = rooms.filter(function (r) { var rk = wireKindOf(plan, r); return (rk === k || r.use === k) && Math.min(r.w, r.h) >= 1.5 * P; })[0] || null;
        return !!spot;
      });
      if (spot) {
        var b = tieBox(spot), wh = starterAlong(spot, "i_waterheater", { x: b.r, y: b.t });
        if (wh) { wh(); var h = nodeById(picked); if (h && h.kind === "i_waterheater") { h.wired = true; h.own = true; made++; } }
      }
    }
    return made;
  }
  // Start building: by you, its outlets and switches, its vents and the
  // rest left for you to put in (the checks say what is still wanted)
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      if (want && want.services === "diy") { want.wire = false; }
      // (automatic, as asked or as it always is: wired, the rest put in with it)
      else if (want && want.wire === undefined) { want.wire = true; }
      var before = hand.next, out = yield* inner(want);
      try {
        if (want && want.services === "diy") {
          hand.nodes = hand.nodes.filter(function (n) { return !(n.id >= before && (n.kind === "i_vent" || n.kind === "i_smoke" || n.kind === "i_exhaustfan" || n.kind === "i_thermostat")); });
          var h = Object.assign({}, hand.house || {}, { services: "diy" });
          hand.house = h;
        }
      } catch (e) { /* as made */ }
      return out;
    });
  }
  // The code's checks, for a house wired by you: what is still wanted, each
  // with a button to put it in.
  var SYS_LIVING = { living: 1, family: 1, bed: 1, main: 1, office: 1, kitchen: 1, dining: 1, great: 1, multi: 1, bath: 1, ensuite: 1, laundry: 1 };
  if (typeof homeAdvice === "function") {
    var homeAdviceSys = homeAdvice;
    homeAdvice = function () {
      var tips = homeAdviceSys.apply(this, arguments);
      try { if (sysDiy() && (typeof groundsNow !== "function" || groundsNow() === "home")) { sysChecks(tips); } } catch (e) { /* the advice as it was */ }
      return tips;
    };
  }
  function sysChecks(tips) {
    var plan = walkPlan(), P = FLOOR_PX, rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && (!n.attic || n.attic === "room"); });
    if (rooms.length < 2) { return; }
    function inRoom(kind, r) { return hand.nodes.some(function (n) { return n.kind === kind && insideArea(r, n.x, n.y, 14); }); }
    function tip(key, room, kind, place) {
      tips.push({ text: say(key, { room: room ? roomName(plan, room) : "" }), id: room ? room.id : null, warn: true, key: "s_advice",
                  fix: { auto: true, says: TXT.dy_fix, go: function () {
                    keepUndo();
                    var n = place();
                    if (n) { n.own = true; }
                    if (typeof handKeep === "function") { handKeep(); }
                    drawHand(); drawHandPanel(); showReport();
                  } } });
    }
    function along(r, kind, near) { return function () { var go = starterAlong(r, kind, near || null); if (go) { go(); return nodeById(picked); } return null; }; }
    function at(kind, x, y) { return function () { return adviceAdd(kind, Math.round(x), Math.round(y)); }; }
    if (!hand.nodes.some(function (n) { return n.kind === "i_breaker"; })) {
      var home = rooms.filter(function (r) { var k = wireKindOf(plan, r); return k === "garage" || k === "laundry" || k === "utility"; })[0] || rooms[0];
      tip("dy_no_panel", null, "i_breaker", along(home, "i_breaker"));
    }
    rooms.forEach(function (r) {
      var k = wireKindOf(plan, r);
      if (Math.min(r.w, r.h) < 1.2 * P) { return; }
      if (SYS_LIVING[k] && !inRoom("i_outlet", r)) { tip("dy_no_outlet", r, "i_outlet", along(r, "i_outlet")); }
      if (SYS_LIVING[k] && k !== "bath" && k !== "ensuite" && !inRoom("i_lightswitch", r)) { tip("dy_no_switch", r, "i_lightswitch", along(r, "i_lightswitch")); }
      if ((SYS_SMOKE[k] || r.attic === "room") && !inRoom("i_smoke", r)) { tip("dy_no_smoke", r, "i_smoke", at("i_smoke", r.x, r.y)); }
      if ((k === "bath" || k === "ensuite") && !inRoom("i_exhaustfan", r)) { tip("dy_no_fan", r, "i_exhaustfan", at("i_exhaustfan", r.x, r.y - r.h * 0.2)); }
      if (SYS_LIVING[k] && !inRoom("i_vent", r) && !inRoom("i_radiator", r) && !inRoom("i_heater", r)) { tip("dy_no_vent", r, "i_vent", at("i_vent", r.x - r.w * 0.3, r.y - r.h * 0.3)); }
    });
    var wet = hand.nodes.some(function (n) { return XRAY_WET[n.kind]; });
    if (wet && !hand.nodes.some(function (n) { return n.kind === "i_waterheater"; })) {
      var spot = rooms.filter(function (r) { var k = wireKindOf(plan, r); return k === "garage" || k === "laundry" || k === "utility"; })[0] || rooms[0];
      tip("dy_no_heater", spot, "i_waterheater", along(spot, "i_waterheater"));
    }
    if (hand.nodes.some(function (n) { return n.kind === "i_vent"; }) && !hand.nodes.some(function (n) { return n.kind === "i_thermostat"; })) {
      var hall = rooms.filter(function (r) { return wireKindOf(plan, r) === "hall"; })[0] || rooms[0];
      tip("dy_no_thermo", hall, "i_thermostat", along(hall, "i_thermostat"));
    }
  }

  // ---- inside the walls: all of it ---------------------------------------------------------------------
  // Cable (NM) comes in a jacket colored for its wire's size, which is for
  // the breaker it is on: white 14 gauge for 15 A (lights, most outlets),
  // yellow 12 for 20 A (a kitchen's counters, a bathroom, the laundry, the
  // garage, a fridge's or a dishwasher's own), orange 10 for 30 A (a dryer,
  // the water heater, the air conditioner), black 6-8 for 40-50 A (a range,
  // a car charger); grey (UF) where it runs outdoors.  In every box: the
  // hot black, the neutral white, the bare copper ground -- and a red, a
  // second hot, for 240 V.
  var SYS_AMPS = { i_stove: 50, i_oven: 40, i_evcharger: 50, i_dryer: 30, i_ac: 30, i_waterheater: 30, i_furnace: 15,
                   i_fridge: 20, i_dishwasher: 20, i_microwave: 20, i_washer: 20, i_freezer: 20, i_winecooler: 20, i_cooler: 20, i_checkout: 20 };
  var SYS_JACKET = { 15: "#efede6", 20: "#f2c53d", 30: "#f08a2c", 40: "#26282b", 50: "#26282b", out: "#8d9196" };
  var SYS_TWENTY_ROOMS = { kitchen: 1, great: 1, bath: 1, ensuite: 1, laundry: 1, garage: 1, utility: 1 };
  var SYS_OUT = { i_porchlight: 1, i_floodlight: 1, i_lamppost: 1, i_pathlight: 1 };
  XRAY_COLORS.insulation = "#f3a6b8";
  XRAY_COLORS.low = "#2f6fd6";
  ["insulation", "low"].forEach(function (k) { if (XRAY_LAYERS.indexOf(k) < 0) { XRAY_LAYERS.push(k); } });
  // (the wiring drawn here, not by 39-xray.js: the same layer's switch)
  var sysOwnPower = false;
  if (typeof xrayLayer === "function") {
    var xrayLayerSys = xrayLayer;
    xrayLayer = function (k) {
      if (k === "power" && sysOwnPower) { return false; }
      return xrayLayerSys.apply(this, arguments);
    };
  }
  if (typeof xrayBuild === "function") {
    var xrayBuildSys = xrayBuild;
    xrayBuild = function (model) {
      var wantPower = xrayLayerSys("power");
      sysOwnPower = true;
      var made;
      try { made = xrayBuildSys.apply(this, arguments); } finally { sysOwnPower = false; }
      try { sysInside(made, wantPower); } catch (e) { if (window.console && console.warn) { console.warn("inside the walls:", e && e.message); } }
      // (kept as made while the house stays the same: the picture keeps each face's corners too)
      if (made && made.faces) { made.faces.forEach(function (f) { if (!f.src) { f.src = f; } }); }
      return made;
    };
  }
  function sysLook(color, extra) {
    return Object.assign({ piece: true, color: color, edge: v3Mix(color, "#000000", 0.3), bare: true, xray: true }, extra || {});
  }
  function sysInside(made, wantPower) {
    var P = FLOOR_PX, F = xrayFloors(), faces = made.faces, labels = made.labels;
    var all = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    var rooms = all.filter(function (n) { return xrayShownLevel(F.at(n)[3], F); });
    if (!rooms.length) { return; }
    var plan = walkPlan(), plant = xrayPlant(F, all), looks = {};
    function look(c, x) { var k = c + (x ? JSON.stringify(x) : ""); return looks[k] || (looks[k] = sysLook(c, x)); }
    function shown(n) { return xrayShownLevel(F.at(n)[3], F); }
    function roomOf(n) {
      return all.filter(function (m) { return insideArea(m, n.x, n.y, 14); }).sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0] || null;
    }
    function ceilZ(n) { var r = roomOf(n); return ceilOf(r || n) * P; }
    // (the water heater where there is one)
    var wh = hand.nodes.filter(function (n) { return n.kind === "i_waterheater"; })[0];
    if (wh) { plant.heater = F.at(wh); }
    var fb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    rooms.forEach(function (r) { var q = F.at(r), t = turned(r); fb.l = Math.min(fb.l, q[0] - t.w / 2); fb.r = Math.max(fb.r, q[0] + t.w / 2); fb.t = Math.min(fb.t, q[1] - t.h / 2); fb.b = Math.max(fb.b, q[1] + t.h / 2); });
    if (wantPower) { sysPower(faces, labels, F, plan, plant, look, shown, roomOf, ceilZ, fb); }
    if (xrayLayer("insulation")) { sysInsulation(faces, F, rooms, all, look); }
    if (xrayLayer("frame")) { sysSheathing(faces, F, rooms, all, look); }
    if (xrayLayer("low")) { sysLow(faces, labels, F, plan, plant, look, shown, roomOf, ceilZ, rooms); }
    sysPlumbing(faces, labels, F, plant, look, shown, ceilZ, fb);
    sysAir(faces, labels, F, plan, plant, look, shown, ceilZ, rooms, fb);
  }
  // The wiring, as the code has it.
  function sysAmps(n, plan, roomOf) {
    if (SYS_AMPS[n.kind]) { return SYS_AMPS[n.kind]; }
    if (n.kind === "i_outlet") { var r = roomOf(n), k = r ? wireKindOf(plan, r) : ""; return SYS_TWENTY_ROOMS[k] ? 20 : 15; }
    return 15;
  }
  function sysPower(faces, labels, F, plan, plant, look, shown, roomOf, ceilZ, fb) {
    var P = FLOOR_PX, pan = plant.panel;
    if (!plant.panelMade) {
      v3Prism(faces, [[pan[0] - 0.22 * P, pan[1] - 0.05 * P], [pan[0] + 0.22 * P, pan[1] - 0.05 * P], [pan[0] + 0.22 * P, pan[1] + 0.05 * P], [pan[0] - 0.22 * P, pan[1] + 0.05 * P]],
              pan[2] + 1.2 * P, pan[2] + 1.95 * P, look("#9aa3a8"));
    }
    labels.push({ x: pan[0], y: pan[1], z: pan[2] + 2.15 * P, text: TXT.xr_panel });
    var top0 = pan[2] + 1.95 * P;
    // the service in, from the outside wall: three heavy conductors; and the ground rod, a copper wire down to it
    var outX = Math.abs(pan[0] - fb.l) < Math.abs(pan[0] - fb.r) ? fb.l - 0.1 * P : fb.r + 0.1 * P;
    xrayRoute(faces, [pan[0], pan[1], top0], [outX, pan[1], 2.6 * P], top0 + 0.15 * P, 0.03 * P, look("#1f2124"));
    var rod = [outX + (outX < pan[0] ? -0.3 : 0.3) * P, pan[1] + 0.4 * P];
    xrayRoute(faces, [pan[0], pan[1], pan[2] + 1.2 * P], [rod[0], rod[1], 0.05 * P], pan[2] + 0.1 * P, 0.008 * P, look("#c87533"));
    xraySeg(faces, [rod[0], rod[1], 0.1 * P], [rod[0], rod[1], -2.4 * P], 0.008 * P, look("#b8743f"));
    labels.push({ x: rod[0], y: rod[1], z: 0.35 * P, text: TXT.xs_ground });
    hand.nodes.forEach(function (n) {
      var light = XRAY_LIGHTS[n.kind] || n.kind === "i_smoke" || n.kind === "i_exhaustfan";
      var dev = n.kind === "i_outlet" || n.kind === "i_lightswitch" || XRAY_POWER[n.kind] || SYS_AMPS[n.kind] || light || SYS_OUT[n.kind];
      if (!dev || !shown(n)) { return; }
      var room = roomOf(n);
      if (!room && !SYS_OUT[n.kind]) { return; }
      var amps = sysAmps(n, plan, roomOf), outdoor = !!SYS_OUT[n.kind];
      var jacket = look(outdoor ? SYS_JACKET.out : SYS_JACKET[amps]), r = (amps >= 40 ? 0.024 : amps >= 30 ? 0.02 : amps >= 20 ? 0.017 : 0.015) * P;
      var p = F.at(n), top = p[2] + ceilZ(n) + 0.06 * P;
      var onWall = n.kind === "i_outlet" || n.kind === "i_lightswitch";
      var h = onWall ? wallHang(n)[0] * P + 0.06 * P : light ? ceilZ(n) : outdoor ? 0.05 * P : (amps >= 30 ? 0.5 * P : 0.35 * P);
      var end = [p[0], p[1], p[2] + h];
      var start = [pan[0], pan[1], top0];
      if (p[3] !== pan[3]) { xraySeg(faces, start, [pan[0], pan[1], top], 0.02 * P, jacket); start = [pan[0], pan[1], top]; }
      xrayRoute(faces, start, end, outdoor ? -0.3 * P : top, r, jacket);
      // its box, and the wires in it: black, white, bare (and red at 240 V)
      var bw = (light ? 0.05 : 0.035) * P, bz = light ? end[2] - 0.08 * P : end[2] - 0.05 * P;
      v3Prism(faces, [[end[0] - bw, end[1] - bw], [end[0] + bw, end[1] - bw], [end[0] + bw, end[1] + bw], [end[0] - bw, end[1] + bw]],
              bz, bz + (light ? 0.07 : 0.1) * P, look(light ? "#8f969c" : "#2f6fd6"));
      var tails = amps >= 30 ? ["#1d1e20", "#d43c3c", "#c87533"] : ["#1d1e20", "#f2f2ee", "#c87533"];
      if (n.kind === "i_lightswitch") { tails = ["#1d1e20", "#1d1e20", "#c87533"]; }
      tails.forEach(function (c, i) {
        var dx = (i - 1) * 0.022 * P;
        xraySeg(faces, [end[0] + dx, end[1], bz + 0.1 * P], [end[0] + dx * 1.6, end[1] + 0.05 * P, bz + 0.16 * P], 0.005 * P, look(c));
      });
    });
  }
  // A room's sides with the outdoors beyond them, as [edge, from, to] along each.
  function sysOutside(r, F, all) {
    var f = F.of(r), others = all.filter(function (o) { return o !== r && F.of(o) === f; }), out = [], P = FLOOR_PX;
    var hw = r.w / 2, hh = r.h / 2;
    WALL_EDGES.forEach(function (edge) {
      var len = edge === "top" || edge === "foot" ? r.w : r.h, step = 0.25 * P, start = null;
      for (var a = 0; a <= len + 0.01; a += step) {
        var at = Math.min(a, len), lx, ly;
        if (edge === "top") { lx = -hw + at; ly = -hh - 6; } else if (edge === "foot") { lx = -hw + at; ly = hh + 6; }
        else if (edge === "left") { lx = -hw - 6; ly = -hh + at; } else { lx = hw + 6; ly = -hh + at; }
        var w = v3Local(r, lx, ly), open = !others.some(function (o) { return insideArea(o, w[0], w[1]); });
        if (open && start === null) { start = at; }
        if ((!open || at >= len) && start !== null) { if (at - start > 0.3 * P) { out.push([edge, start, open ? at : at - step / 2]); } start = null; }
      }
    });
    return out;
  }
  function sysWallSlab(faces, r, F, edge, a, b, d0, d1, z0, z1, how) {
    var f = F.of(r), dz = f ? f.z : 0, at = { x: r.x + (f ? f.dx : 0), y: r.y + (f ? f.dy : 0), turn: r.turn || 0 }, hw = r.w / 2, hh = r.h / 2;
    var x0, x1, y0, y1;
    if (edge === "top") { x0 = -hw + a; x1 = -hw + b; y0 = -hh + d0; y1 = -hh + d1; }
    else if (edge === "foot") { x0 = -hw + a; x1 = -hw + b; y0 = hh - d1; y1 = hh - d0; }
    else if (edge === "left") { y0 = -hh + a; y1 = -hh + b; x0 = -hw + d0; x1 = -hw + d1; }
    else { y0 = -hh + a; y1 = -hh + b; x0 = hw - d1; x1 = hw - d0; }
    v3Box(faces, at, x0, x1, y0, y1, dz + z0, dz + z1, how);
  }
  // Insulation: batts in the walls, between the studs -- every wall, the
  // ones between rooms too (for quiet), round the doors and the windows,
  // not a garage's or a shed's (2026-10-03: "there should be insulation on
  // all walls for a building unless it is like a shed"); and over the top
  // floor's ceilings, blown in deep.
  var SYS_BARE = { garage: 1, carport: 1, shed: 1, barn: 1, porch: 1 };
  function sysBattRuns(r, edge, T) {
    var len = edge === "top" || edge === "foot" ? r.w : r.h, spans = [[0, len]];
    (typeof wallOpenRuns === "function" ? wallOpenRuns(r, edge) : []).forEach(function (o) {
      var next = [];
      spans.forEach(function (s) { if (o.b <= s[0] || o.a >= s[1]) { next.push(s); return; } if (o.a > s[0]) { next.push([s[0], o.a]); } if (o.b < s[1]) { next.push([o.b, s[1]]); } });
      spans = next;
    });
    var holes = [];
    hand.nodes.forEach(function (m) {
      if (!WALK_DOORS[m.kind] && m.kind !== "i_window") { return; }
      var h = typeof v3Hole === "function" ? v3Hole(r, edge, T, m) : null;
      if (h) { h.n = m; holes.push(h); }
    });
    return { spans: spans, holes: holes };
  }
  // The pieces of a stretch of wall a..b (z0..z1) round its openings: full
  // height between them, under a window's sill and over a head (`over`
  // above it: the header's depth) the rest.
  function sysAround(holes, a, b, top, z0, z1, over) {
    var out = [], cut = [[a, b]];
    holes.forEach(function (h) {
      var next = [];
      cut.forEach(function (c) { if (h.b <= c[0] || h.a >= c[1]) { next.push(c); return; } if (h.a > c[0]) { next.push([c[0], h.a]); } if (h.b < c[1]) { next.push([h.b, c[1]]); } });
      cut = next;
    });
    cut.forEach(function (c) { if (c[1] - c[0] > 2) { out.push([c[0], c[1], z0, z1]); } });
    holes.forEach(function (h) {
      var a0 = Math.max(a, h.a), b0 = Math.min(b, h.b);
      if (b0 - a0 < 2) { return; }
      var head = (typeof openHead === "function" ? openHead(h.n, top) : top * 0.8) + over;
      if (head < z1) { out.push([a0, b0, head, z1]); }
      if (h.n.kind === "i_window" && typeof openSill === "function") {
        var sill = openSill(h.n) - (over ? 0.04 * FLOOR_PX : 0);
        if (sill > z0 + 2) { out.push([a0, b0, z0, sill]); }
      }
    });
    return out;
  }
  function sysInsulation(faces, F, rooms, all, look) {
    // (seen through, as the rest of the walls are: from above, the blown-in over the ceilings hid all under it)
    var P = FLOOR_PX, batt = look(XRAY_COLORS.insulation, { insulation: true, alpha: 0.75, late: true }), loose = look("#e9dcbc", { insulation: true, alpha: 0.3, late: true });
    var plan = typeof walkPlan === "function" ? walkPlan() : null;
    rooms.forEach(function (r) {
      if ((r.turn || 0) % 90) { return; }
      var kind = plan && typeof wireKindOf === "function" ? wireKindOf(plan, r) : "", bare = SYS_BARE[kind] || /shed|barn|carport/i.test(String(r.text || ""));
      var T = Math.max(1, Math.min(6, Math.min(r.w, r.h) * 0.06)), top = ceilOf(r) * P, z0 = 0.05 * P, z1 = top - 0.09 * P;
      if (!bare) {
        WALL_EDGES.forEach(function (edge) {
          var R = sysBattRuns(r, edge, T);
          R.spans.forEach(function (s) {
            sysAround(R.holes, s[0] + 1, s[1] - 1, top, z0, z1, 0.24 * P).forEach(function (q) { sysWallSlab(faces, r, F, edge, q[0], q[1], T * 0.15, T * 0.85, q[2], q[3], batt); });
          });
        });
      }
      // over the ceiling, where nothing is built over it (an attic room's own slopes are its own)
      if (r.attic || bare) { return; }
      var f = F.of(r), up = f && typeof floorOver === "function" ? floorOver(F.floors, f) : null;
      var covered = up && all.some(function (o) { return F.of(o) === up && insideArea(o, r.x + (f.dx - up.dx), r.y + (f.dy - up.dy)) && o.attic !== "storage"; });
      if (covered) { return; }
      var q = F.at(r), t = turned(r), dz = f ? f.z : 0;
      v3Prism(faces, [[q[0] - t.w / 2 + T, q[1] - t.h / 2 + T], [q[0] + t.w / 2 - T, q[1] - t.h / 2 + T], [q[0] + t.w / 2 - T, q[1] + t.h / 2 - T], [q[0] - t.w / 2 + T, q[1] + t.h / 2 - T]],
              dz + top + 0.02 * P, dz + top + 0.3 * P, loose);
    });
  }
  // Sheathing: boards over the outside of the outside walls' studs.
  function sysSheathing(faces, F, rooms, all, look) {
    var P = FLOOR_PX, osb = look("#c9a877", { pat: 21 });
    rooms.forEach(function (r) {
      if ((r.turn || 0) % 90) { return; }
      var T = Math.max(1, Math.min(6, Math.min(r.w, r.h) * 0.06)), top = ceilOf(r) * P;
      // (cut round the windows and the doors: it covered them over)
      var holes = {};
      sysOutside(r, F, all).forEach(function (s) {
        if (!holes[s[0]]) { holes[s[0]] = sysBattRuns(r, s[0], T).holes; }
        sysAround(holes[s[0]], s[1], s[2], top, 0, top, 0).forEach(function (q) { sysWallSlab(faces, r, F, s[0], q[0], q[1], -0.012 * P, 0, q[2], q[3], osb); });
      });
    });
  }
  // Low voltage: a network box by the panel, a data cable (blue) to every
  // room people sit or sleep or work in and a TV cable (black) to the
  // living rooms and bedrooms; the smoke alarms joined to each other (red);
  // the thermostat's wire to the furnace; the doorbell.
  var SYS_DATA = { living: 1, family: 1, bed: 1, main: 1, office: 1, great: 1, multi: 1 };
  function sysLow(faces, labels, F, plan, plant, look, shown, roomOf, ceilZ, rooms) {
    var P = FLOOR_PX, pan = plant.panel, box = [pan[0] + 0.6 * P, pan[1], pan[2]];
    v3Prism(faces, [[box[0] - 0.18 * P, box[1] - 0.04 * P], [box[0] + 0.18 * P, box[1] - 0.04 * P], [box[0] + 0.18 * P, box[1] + 0.04 * P], [box[0] - 0.18 * P, box[1] + 0.04 * P]],
            box[2] + 0.9 * P, box[2] + 1.5 * P, look("#d9dcdf"));
    labels.push({ x: box[0], y: box[1], z: box[2] + 1.7 * P, text: TXT.xs_media });
    var data = look("#2f6fd6"), coax = look("#1b1c1e"), alarm = look("#d43c3c"), bell = look("#e8e2cf"), thermo = look("#cdb27a");
    rooms.forEach(function (r) {
      var k = wireKindOf(plan, r);
      if (!SYS_DATA[k]) { return; }
      var outlet = hand.nodes.filter(function (n) { return n.kind === "i_outlet" && insideArea(r, n.x, n.y, 14); })[0];
      var p = outlet ? F.at(outlet) : F.at(r, r.x - r.w / 2 + 6, r.y);
      var top = p[2] + ceilOf(r) * P + 0.1 * P, end = [p[0] + 0.12 * P, p[1], p[2] + 0.36 * P];
      var start = [box[0], box[1], box[2] + 1.5 * P];
      xrayRoute(faces, start, end, top, 0.01 * P, data);
      if (k !== "office") { xrayRoute(faces, [start[0] + 0.05 * P, start[1], start[2]], [end[0] + 0.08 * P, end[1], end[2]], top + 0.03 * P, 0.012 * P, coax); }
      v3Prism(faces, [[end[0] - 0.035 * P, end[1] - 0.02 * P], [end[0] + 0.12 * P, end[1] - 0.02 * P], [end[0] + 0.12 * P, end[1] + 0.02 * P], [end[0] - 0.035 * P, end[1] + 0.02 * P]],
              end[2] - 0.05 * P, end[2] + 0.05 * P, look("#f4f3ef"));
    });
    // the smoke alarms, one to the next (each also on a 15 A circuit: the wiring)
    var alarms = hand.nodes.filter(function (n) { return n.kind === "i_smoke" && shown(n); }).map(function (n) { return [F.at(n), n]; });
    for (var i = 1; i < alarms.length; i++) {
      var a = alarms[i - 1][0], b = alarms[i][0];
      xrayRoute(faces, [a[0], a[1], a[2] + ceilZ(alarms[i - 1][1])], [b[0], b[1], b[2] + ceilZ(alarms[i][1])], Math.max(a[2] + ceilZ(alarms[i - 1][1]), b[2] + ceilZ(alarms[i][1])) + 0.12 * P, 0.009 * P, alarm);
    }
    // the thermostat to the furnace
    var th = hand.nodes.filter(function (n) { return n.kind === "i_thermostat" && shown(n); })[0];
    if (th) {
      var tp = F.at(th), fu = plant.furnace;
      xrayRoute(faces, [tp[0], tp[1], tp[2] + wallHang(th)[0] * P], [fu[0], fu[1], fu[2] + 1.0 * P], tp[2] + ceilZ(th) + 0.08 * P, 0.007 * P, thermo);
    }
    // the doorbell: the button by the front door, the chime in the hall, the transformer by the panel
    var front = hand.nodes.filter(function (n) { return n.kind === "i_door" && shown(n) && F.at(n)[3] === 0; })
      .sort(function (p, q) { return q.y - p.y; })[0];
    if (front) {
      var fp = F.at(front), hall = rooms.filter(function (r) { return wireKindOf(plan, r) === "hall" && F.at(r)[3] === 0; })[0];
      var chime = hall ? F.at(hall) : [fp[0], fp[1] - 1.5 * P, fp[2]];
      xrayRoute(faces, [fp[0] + front.w / 2 + 0.15 * P, fp[1], 1.2 * P], [chime[0], chime[1], 2.0 * P], 2.5 * P, 0.006 * P, bell);
      xrayRoute(faces, [chime[0], chime[1], 2.0 * P], [pan[0], pan[1], pan[2] + 1.95 * P], 2.55 * P, 0.006 * P, bell);
      v3Prism(faces, [[chime[0] - 0.1 * P, chime[1] - 0.03 * P], [chime[0] + 0.1 * P, chime[1] - 0.03 * P], [chime[0] + 0.1 * P, chime[1] + 0.03 * P], [chime[0] - 0.1 * P, chime[1] + 0.03 * P]],
              1.9 * P, 2.1 * P, look("#f4f3ef"));
    }
  }
  // Plumbing's own: a trap under every basin, a shutoff where each pipe comes
  // to a fixture, the main's valve where it comes in, a hose bib front and
  // back, the cleanout at the stack's foot.
  function sysPlumbing(faces, labels, F, plant, look, shown, ceilZ, fb) {
    var P = FLOOR_PX, wet = hand.nodes.filter(function (n) { return XRAY_WET[n.kind] && shown(n); });
    if (!wet.length) { return; }
    var chrome = look("#c9ced3", { pat: 22 }), pvc = look("#eef0ee"), cold = look(XRAY_COLORS.water), red = look("#d43c3c");
    var main = [(fb.l + fb.r) / 2, fb.b + 0.4 * P, -0.18 * P];
    if (xrayLayer("drain")) {
      wet.forEach(function (n) {
        if (XRAY_WET[n.kind] !== "basin") { return; }
        var p = F.at(n), x = p[0], y = p[1] - 0.12 * P, z = p[2] + 0.45 * P;
        // the U: down, along, up, out to the wall
        xraySeg(faces, [x, y, z + 0.25 * P], [x, y, z], 0.022 * P, pvc);
        xraySeg(faces, [x, y, z], [x, y - 0.12 * P, z], 0.022 * P, pvc);
        xraySeg(faces, [x, y - 0.12 * P, z], [x, y - 0.12 * P, z + 0.1 * P], 0.022 * P, pvc);
      });
      var sewer = [(fb.l + fb.r) / 2 + 0.6 * P, fb.b + 0.4 * P, -0.45 * P];
      v3Prism(faces, [[sewer[0] - 0.06 * P, sewer[1] - 0.06 * P], [sewer[0] + 0.06 * P, sewer[1] - 0.06 * P], [sewer[0] + 0.06 * P, sewer[1] + 0.06 * P], [sewer[0] - 0.06 * P, sewer[1] + 0.06 * P]],
              sewer[2], 0.08 * P, pvc);
    }
    if (xrayLayer("water")) {
      wet.forEach(function (n) {
        var p = F.at(n), tap = [p[0], p[1], p[2] + (XRAY_WET[n.kind] === "shower" ? 1.0 : 0.5) * P];
        [[0, XRAY_WET[n.kind] === "toilet" ? 0 : 1]].forEach(function () {
          v3Prism(faces, [[tap[0] - 0.03 * P, tap[1] - 0.03 * P], [tap[0] + 0.03 * P, tap[1] - 0.03 * P], [tap[0] + 0.03 * P, tap[1] + 0.03 * P], [tap[0] - 0.03 * P, tap[1] + 0.03 * P]],
                  tap[2] - 0.03 * P, tap[2] + 0.03 * P, chrome);
        });
      });
      // the main's shutoff, its red handle, where it comes in
      var valve = [main[0], fb.b - 0.3 * P, 0.4 * P];
      xraySeg(faces, [main[0], main[1], main[2]], [valve[0], valve[1], main[2]], 0.03 * P, cold);
      xraySeg(faces, [valve[0], valve[1], main[2]], valve, 0.03 * P, cold);
      v3Prism(faces, [[valve[0] - 0.08 * P, valve[1] - 0.02 * P], [valve[0] + 0.08 * P, valve[1] - 0.02 * P], [valve[0] + 0.08 * P, valve[1] + 0.02 * P], [valve[0] - 0.08 * P, valve[1] + 0.02 * P]],
              valve[2] + 0.04 * P, valve[2] + 0.07 * P, red);
      labels.push({ x: valve[0], y: valve[1], z: valve[2] + 0.35 * P, text: TXT.xs_shutoff });
      // hose bibs, front and back, through the wall at knee height
      [[fb.l + 1.2 * P, fb.b + 0.08 * P], [fb.r - 1.2 * P, fb.t - 0.08 * P]].forEach(function (b) {
        xrayRoute(faces, main, [b[0], b[1], 0.55 * P], main[2], 0.016 * P, cold);
        v3Prism(faces, [[b[0] - 0.04 * P, b[1] - 0.04 * P], [b[0] + 0.04 * P, b[1] - 0.04 * P], [b[0] + 0.04 * P, b[1] + 0.04 * P], [b[0] - 0.04 * P, b[1] + 0.04 * P]],
                0.5 * P, 0.62 * P, chrome);
      });
    }
  }
  // Air's own: the return from each floor's hall back to the furnace, its
  // plenum over it, the AC unit outside and the two copper lines to it, the
  // fans' ducts up through the roof, the condensate's drain.
  function sysAir(faces, labels, F, plan, plant, look, shown, ceilZ, rooms, fb) {
    if (!xrayLayer("air")) { return; }
    var P = FLOOR_PX, fu = plant.furnace, ret = look("#7f878f", { pat: 22 }), flex = look("#c9ced3", { pat: 22 });
    if (!hand.nodes.some(function (n) { return n.kind === "i_vent"; }) && !hand.nodes.some(function (n) { return n.kind === "i_furnace"; })) { return; }
    v3Prism(faces, [[fu[0] - 0.32 * P, fu[1] - 0.32 * P], [fu[0] + 0.32 * P, fu[1] - 0.32 * P], [fu[0] + 0.32 * P, fu[1] + 0.32 * P], [fu[0] - 0.32 * P, fu[1] + 0.32 * P]],
            fu[2] + 1.3 * P, fu[2] + 1.75 * P, look("#b9c2c9", { pat: 22 }));
    var done = {};
    rooms.forEach(function (r) {
      var k = wireKindOf(plan, r), lv = F.at(r)[3];
      if (k !== "hall" || done[lv]) { return; }
      done[lv] = true;
      var p = F.at(r), grille = [p[0], p[1], p[2] + ceilOf(r) * P];
      xrayRoute(faces, [fu[0] + 0.25 * P, fu[1], fu[2] + 0.4 * P], grille, grille[2] + 0.22 * P, 0.14 * P, ret);
      labels.push({ x: grille[0], y: grille[1], z: grille[2] - 0.2 * P, text: TXT.xs_return });
    });
    // the AC unit outside, by the furnace's nearest outside wall, and its lines
    var east = Math.abs(fu[0] - fb.r) < Math.abs(fu[0] - fb.l), cx = east ? fb.r + 0.8 * P : fb.l - 0.8 * P, cy = Math.max(fb.t + 0.6 * P, Math.min(fb.b - 0.6 * P, fu[1]));
    v3Prism(faces, [[cx - 0.42 * P, cy - 0.42 * P], [cx + 0.42 * P, cy - 0.42 * P], [cx + 0.42 * P, cy + 0.42 * P], [cx - 0.42 * P, cy + 0.42 * P]], 0.05 * P, 0.85 * P, look("#d6d8d4"));
    v3Prism(faces, (function () { var g = []; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2; g.push([cx + Math.cos(a) * 0.3 * P, cy + Math.sin(a) * 0.3 * P]); } return g; })(),
            0.85 * P, 0.88 * P, look("#3b3e42"));
    labels.push({ x: cx, y: cy, z: 1.15 * P, text: TXT.xs_condenser });
    xrayRoute(faces, [cx, cy, 0.5 * P], [fu[0], fu[1], fu[2] + 1.5 * P], 0.25 * P, 0.012 * P, look("#c87533"));
    xrayRoute(faces, [cx, cy + 0.06 * P, 0.5 * P], [fu[0], fu[1] + 0.06 * P, fu[2] + 1.5 * P], 0.27 * P, 0.022 * P, look("#1f2124"));
    // the condensate, a thin white pipe down to the floor drain
    xraySeg(faces, [fu[0] + 0.33 * P, fu[1], fu[2] + 1.2 * P], [fu[0] + 0.33 * P, fu[1], fu[2] + 0.02 * P], 0.01 * P, look("#eef0ee"));
    // every bathroom fan, a flex duct up out through the roof to its cap
    hand.nodes.forEach(function (n) {
      if ((n.kind !== "i_exhaustfan" && n.kind !== "i_hood") || !shown(n)) { return; }
      var p = F.at(n), from = [p[0], p[1], p[2] + ceilZ(n)], up = [p[0], p[1], p[2] + ceilZ(n) + 2.2 * P];
      xraySeg(faces, from, up, (n.kind === "i_hood" ? 0.08 : 0.05) * P, flex);
      v3Prism(faces, [[up[0] - 0.12 * P, up[1] - 0.12 * P], [up[0] + 0.12 * P, up[1] - 0.12 * P], [up[0] + 0.12 * P, up[1] + 0.12 * P], [up[0] - 0.12 * P, up[1] + 0.12 * P]],
              up[2], up[2] + 0.12 * P, look("#3b3e42"));
    });
  }
  // The panel's switches for the two new layers, and the wiring's legend.
  HOUSE_ICONS.xr_insulation = '<path d="M3 4.6c2 0 2 2.2 4 2.2s2-2.2 4-2.2 2 2.2 4 2.2M3 9.4c2 0 2 2.2 4 2.2s2-2.2 4-2.2 2 2.2 4 2.2M3 14.2c2 0 2 2.2 4 2.2s2-2.2 4-2.2 2 2.2 4 2.2"/>';
  HOUSE_ICONS.xr_low = '<rect x="3.4" y="5" width="13.2" height="9.6" rx="1.4"/><path d="M6.4 10h2.4M11.2 10h2.4M8 14.6v2.2M12 14.6v2.2"/>';
  if (typeof xrayPanel === "function") {
    var xrayPanelSys = xrayPanel;
    xrayPanel = function () {
      var out = xrayPanelSys.apply(this, arguments);
      try {
        var box = V3 && V3.box ? el(".v3-xray", V3.box) : null;
        if (!box) { return out; }
        var rows = all(".v3-xray-row", box);
        XRAY_LAYERS.forEach(function (k, i) {
          var dot = rows[i] && el(".v3-xray-dot", rows[i]);
          if (dot && (k === "insulation" || k === "low")) { dot.style.background = XRAY_COLORS[k]; }
          if (k === "power" && rows[i] && !el(".v3-xray-legend", box)) {
            var leg = document.createElement("div");
            leg.className = "v3-xray-legend";
            [[15, SYS_JACKET[15]], [20, SYS_JACKET[20]], [30, SYS_JACKET[30]], [50, SYS_JACKET[50]]].forEach(function (q) {
              var s = document.createElement("span");
              s.innerHTML = '<i></i>';
              s.firstChild.style.background = q[1];
              s.appendChild(document.createTextNode(TXT["xs_" + q[0]]));
              leg.appendChild(s);
            });
            rows[i].parentNode.insertBefore(leg, rows[i].nextSibling);
          }
        });
      } catch (e) { /* as it was */ }
      return out;
    };
  }

  // ---- in the view's settings: automatic or by you ------------------------------------------------------
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.dy_auto = '<path d="M10 2.8v2.4M10 14.8v2.4M2.8 10h2.4M14.8 10h2.4M4.9 4.9l1.7 1.7M13.4 13.4l1.7 1.7M4.9 15.1l1.7-1.7M13.4 6.6l1.7-1.7"/><circle cx="10" cy="10" r="3.4"/>';
    HOUSE_ICONS.dy_diy = '<path d="M13.6 3.4a3.6 3.6 0 0 0-4.4 4.6L3.6 13.6a1.6 1.6 0 0 0 2.3 2.3L11.5 10.3a3.6 3.6 0 0 0 4.6-4.4l-2 2-2.1-.5-.5-2.1z"/>';
  }
  if (typeof HOUSE_TAB_MORE === "object") {
    HOUSE_TAB_MORE.push(function (sheet, head, tiles, draw) {
      head(TXT.dy_head);
      if (typeof worldPicker === "function") {
        worldPicker(sheet, SYS_KINDS, houseOpt("services"), "dy_", function (k) {
          houseSetOpt("services", k);
          // automatic: what the code wants put in now (by you: left as it is, the checks to go by)
          if (k === "auto" && typeof wireHouseNow === "function") { wireHouseNow(); }
          else { showReport(); }
          if (draw) { draw(); }
        });
      }
    });
  }
  // Start building asks too, after the rooms (39-starter.js's tiles)
  function sysAsk(ui, want) {
    if (!want.services) { want.services = "auto"; }
    ui.head(TXT.dy_head);
    ui.tiles();
    SYS_KINDS.forEach(function (k) {
      ui.tile(TXT["dy_" + k], "dy_" + k, function () { return (want.services || "auto") === k; }, function () { want.services = k; }, true);
    });
  }

  // ---- used, walking round (E, 39-inside.js) ---------------------------------------------------------
  // The bathroom's fan runs, the water heater heats; the smoke alarm, tested,
  // sounds its three beeps; the thermostat set a degree warmer each time,
  // round to cool again -- the furnace on while it is set over the room.
  if (typeof USE_FAN === "object") { USE_FAN.i_exhaustfan = 1; }
  if (typeof USE_HEAT === "object") { USE_HEAT.i_waterheater = 1; }
  if (typeof USE_SAYS === "object") { USE_SAYS.i_smoke = "us_smoke"; USE_SAYS.i_thermostat = "us_thermo"; }
  if (typeof useIt === "function") {
    var useItSys = useIt;
    useIt = function (n) {
      if (n && n.kind === "i_smoke") {
        V3.dirty = true;
        if (typeof useTone === "function") { useTone([3150, 3150, 3150], 0.75); }
        v3Say(TXT.us_smoke);
        return;
      }
      if (n && n.kind === "i_thermostat") {
        var U = useState(), feet = typeof feetHere === "function" && feetHere();
        U.temp = U.temp === undefined ? 20 : U.temp >= 24 ? 17 : U.temp + 1;
        var furnace = hand.nodes.filter(function (m) { return m.kind === "i_furnace"; })[0];
        if (furnace) { U.on[furnace.id] = U.temp > 20; }
        V3.dirty = true;
        v3Say(say("us_thermo", { t: feet ? Math.round(U.temp * 9 / 5 + 32) + " °F" : U.temp + " °C" }));
        return;
      }
      return useItSys.apply(this, arguments);
    };
  }
