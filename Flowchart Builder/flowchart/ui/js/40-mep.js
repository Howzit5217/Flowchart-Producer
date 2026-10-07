// ---------------------------------------------------------------------------
//  40-mep.js -- a building's services as one network, from where each part
//  of it actually stands: the water from the main and the hot water from
//  the water heater to every tap, its length, and how long the hot takes to
//  come; the gas from the meter on the outside wall to every appliance that
//  burns it, each run sized; the flues, the vents -- and the code's checks
//  on all of it, put right for what Start building makes
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update this so things like the water heater are
  // properly hooked up in the simulations from where it is and everything is
  // up to code in all the make it from the website too ... and to if not
  // already there to remember gas lines in the buildings where necessary")
  //
  // The figures, from the codes (the International Plumbing, Fuel Gas and
  // Residential Codes, the National Electrical Code):
  //   hot water: past 50 ft (15.24 m) of pipe from the heater to the
  //     farthest fixture, a circulating loop or heat trace (IPC 607.2);
  //   gas: sized by the longest run, Schedule 40 steel, under 2 psi, a drop
  //     of 0.5 in of water, gas of 0.60 (IFGC Table 402.4(2)); natural gas
  //     1,000 Btu a cubic foot; appliances as Table 402.2 has them; a shutoff
  //     within 6 ft (1.8 m) of each, in its room (409.5); a sediment trap at
  //     each but a range, a dryer, a fireplace and a grill (408.4);
  //   no gas water heater or furnace in a bedroom or a bathroom unless it is
  //     sealed, drawing its air from outdoors (IFGC 303.3); in a garage, its
  //     flame 18 in (0.46 m) up, a guard where a car could hit it (305.3, 305.5);
  //   a water heater's relief valve piped to within 6 in of the floor, a pan
  //     under it where a leak would do damage, an expansion tank on a closed
  //     system, two straps;
  //   a carbon monoxide alarm outside each sleeping area in a home with
  //     anything burning fuel, or a garage built on (IRC R315);
  //   a dryer's duct out of doors, at most 35 ft (10.7 m), less 1 ft 9 in a
  //     bend (IRC M1502.4.5);
  //   GFCI outlets in kitchens, bathrooms, garages, laundries, by sinks (NEC 210.8);
  //   the fixtures a building needs for the people in it (IPC Table 2902.1):
  //     an office 1 toilet per 25 (a sex) for the first 50, 1 per 50 after,
  //     1 basin per 40 for the first 80, 1 per 80 after, a drinking fountain
  //     per 100; a shop 1 per 500, 1 per 750, 1 per 1,000; a restaurant 1 per
  //     75, 1 per 200, 1 per 500; a school 1 per 50, 1 per 50, 1 per 100 --
  //     and a service sink each; people by floor area (IBC Table 1004.5).
  var MP_P = function () { return FLOOR_PX; };
  var MP_FT = 0.3048;
  var MP_BTU = { i_furnace: 100000, i_waterheater: 50000, i_stove: 65000, i_oven: 25000, i_dryer: 35000, i_fireplace: 40000 };
  var MP_NO_TRAP = { i_stove: 1, i_oven: 1, i_dryer: 1, i_fireplace: 1 };
  var MP_GAS_LEN = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150];
  var MP_GAS = [["1/2", [172, 118, 95, 81, 72, 65, 60, 56, 52, 50, 44, 40]],
                ["3/4", [360, 247, 199, 170, 151, 137, 126, 117, 110, 104, 92, 83]],
                ["1", [678, 466, 374, 320, 284, 257, 237, 220, 207, 195, 173, 157]],
                ["1-1/4", [1390, 957, 768, 657, 583, 528, 486, 452, 424, 400, 355, 322]],
                ["1-1/2", [2090, 1430, 1150, 985, 873, 791, 728, 677, 635, 600, 532, 482]],
                ["2", [4020, 2760, 2220, 1900, 1680, 1520, 1400, 1300, 1220, 1160, 1020, 928]]];
  var MP_MM = { "1/2": 15, "3/4": 20, "1": 25, "1-1/4": 32, "1-1/2": 40, "2": 50 };
  // litres a minute (the flows of fixtures sold now) and a ½-inch pipe's litres a metre
  var MP_FLOW = { i_sink: 5.7, i_vanity: 5.7, i_kitchensink: 6.8, i_utilitysink: 8.3, i_shower: 7.6, i_bathtub: 15, i_cornertub: 15 };
  var MP_PIPE_L = 0.114, MP_HOT_MAX = 15.24, MP_DRYER_MAX = 10.67, MP_BEND = 0.53, MP_STAND = 0.46;
  var MP_WET = { i_sink: "basin", i_vanity: "basin", i_kitchensink: "basin", i_utilitysink: "basin", i_bathtub: "tub", i_cornertub: "tub",
                 i_shower: "shower", i_toilet: "toilet", i_washer: "washer", i_dishwasher: "dish", i_fountain: "fountain" };
  var MP_COLD_ONLY = { i_toilet: 1, i_fountain: 1 };
  var MP_GFCI_ROOMS = { kitchen: 1, bath: 1, ensuite: 1, garage: 1, laundry: 1, utility: 1 };
  // people a square metre for each kind of room (IBC Table 1004.5)
  var MP_LOAD = { sales: 5.57, boutique: 5.57, fitting: 5.57, cafe: 1.39, cafekitchen: 18.58, openoffice: 13.94, office: 13.94, meeting: 13.94,
                  reception: 13.94, staff: 13.94, kitchenette: 13.94, classroom: 1.86, stock: 27.87, lobby: 13.94 };
  // the fixtures a building needs (IPC Table 2902.1): toilets, basins (a sex: [per, first, then per]), fountains, service sinks
  var MP_NEED = {
    business: { wc: [25, 50, 50], lav: [40, 80, 80], df: 100 },
    mercantile: { wc: [500, 0, 500], lav: [750, 0, 750], df: 1000 },
    restaurant: { wc: [75, 0, 75], lav: [200, 0, 200], df: 500 },
    educational: { wc: [50, 0, 50], lav: [50, 0, 50], df: 100 }
  };
  var MP_OCC = { office: "business", shop: "mercantile", boutique: "mercantile", cafe: "restaurant", school: "educational", mall: "mercantile" };

  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.fuel = "gas"; }
  var MP_FUELS = ["gas", "electric"];
  function mpFuel() { return houseOpt("fuel") === "electric" ? "electric" : "gas"; }
  var mpBuilding = null;                 // what Start building is making, while it is (its mark comes after)
  function mpType() {
    if (mpBuilding) { return mpBuilding.type || "house"; }
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, b) { return b.id - a.id; });
    return marks.length ? marks[0].madeWith.type || "house" : "house";
  }
  function mpTowerUse() {
    if (mpBuilding) { return mpBuilding.towerUse || "offices"; }
    var marks = hand.nodes.filter(function (n) { return n.madeWith && n.madeWith.type === "tower"; });
    return marks.length ? marks[marks.length - 1].madeWith.towerUse || "offices" : "";
  }
  function mpStoreys() {
    var fl = typeof floorsOf === "function" ? floorsOf() : [], lv = {};
    fl.forEach(function (f) { if (f.level >= 0) { lv[f.level] = 1; } });
    return Math.max(1, Object.keys(lv).length);
  }
  // Whether a thing burns gas: as it is set, or as the building does -- a
  // block over three storeys cooks with electricity (its gas the boiler room's)
  function mpGas(n) {
    if (!n || !MP_BTU[n.kind]) { return false; }
    if (n.fuel) { return n.fuel === "gas"; }
    if (mpFuel() !== "gas") { return false; }
    if ((n.kind === "i_stove" || n.kind === "i_oven") && mpStoreys() > 3 && mpType() !== "cafe") {
      var r = mpRoomOf(n);
      if (!r || r.use !== "cafekitchen") { return false; }
    }
    if (n.kind === "i_oven") { return false; }          // (a wall oven: electric, almost always)
    if (n.kind === "i_fireplace") { return false; }     // (a fireplace with a chimney burns wood: gas only where it is set so)
    return true;
  }
  function mpRoomOf(n) {
    // (what hangs on a wall is in the room it faces: a panel on a hall's wall is the hall's, not the
    // closet's behind it -- the smallest room either side was taken, 2026-10-04)
    if (ON_THE_WALL[n.kind]) {
      var t = (n.turn || 0) * Math.PI / 180, d = (n.h || 12) / 2 + 8, fx = n.x - Math.sin(t) * d, fy = n.y + Math.cos(t) * d;
      var faced = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, fx, fy); })
        .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
      if (faced) { return faced; }
    }
    return hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, n.x, n.y, -14); })
      .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0] || null;
  }
  function mpPipe(cfh, lenFt) {
    var i = 0;
    while (i < MP_GAS_LEN.length - 1 && MP_GAS_LEN[i] < lenFt) { i++; }
    for (var k = 0; k < MP_GAS.length; k++) { if (MP_GAS[k][1][i] >= cfh) { return MP_GAS[k][0]; } }
    return "2";
  }
  function mpSay(size) {
    var feet = typeof feetHere === "function" && feetHere();
    return feet ? size + " in" : MP_MM[size] + " mm";
  }
  function mpLen(m) {
    var feet = typeof feetHere === "function" && feetHere();
    return feet ? Math.round(m / MP_FT) + " ft" : (m < 10 ? m.toFixed(1) : Math.round(m)) + " m";
  }

  // ---- the network, as the building stands -------------------------------------------------------------
  var mpKept = { key: null, net: null };
  function mpQuick() {
    var n = hand.nodes, h = 0;
    for (var i = 0; i < n.length; i++) {
      var m = n[i];
      h = (h * 31 + m.id * 7 + Math.round(m.x) * 13 + Math.round(m.y) * 17 + Math.round(m.w || 0) + Math.round(m.h || 0) * 3 + (m.turn || 0) +
           (m.fuel === "gas" ? 5 : m.fuel ? 9 : 0) + (m.recirc ? 11 : 0) + (m.stand ? 19 : 0)) | 0;
    }
    return n.length + ":" + h + ":" + mpFuel() + ":" + hand.links.length;
  }
  function mpNet() {
    var key = mpQuick();
    if (mpKept.key === key && mpKept.net) { return mpKept.net; }
    var P = MP_P(), F = xrayFloors(), all = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    var fb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    all.forEach(function (r) { var q = F.at(r), t = turned(r); fb.l = Math.min(fb.l, q[0] - t.w / 2); fb.r = Math.max(fb.r, q[0] + t.w / 2); fb.t = Math.min(fb.t, q[1] - t.h / 2); fb.b = Math.max(fb.b, q[1] + t.h / 2); });
    var net = { F: F, fb: fb, heaters: [], fixtures: [], gas: [], ok: fb.l < Infinity };
    if (!net.ok) { mpKept = { key: key, net: net }; return net; }
    net.main = [(fb.l + fb.r) / 2, fb.b + 0.4 * P, -0.18 * P];
    net.sewer = [(fb.l + fb.r) / 2 + 0.6 * P, fb.b + 0.4 * P, -0.45 * P];
    function ceilAt(n) { var r = mpRoomOf(n); return ceilOf(r || n) * P; }
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_waterheater") { return; }
      var p = F.at(n), stand = n.stand ? MP_STAND * P : 0;
      net.heaters.push({ n: n, p: p, top: p[2] + stand + (typeof pieceHigh === "function" ? pieceHigh(n) : 1.5) * P, gas: mpGas(n) });
    });
    // every tap: its cold from the main, its hot from the nearest heater, how far, how long
    hand.nodes.forEach(function (n) {
      if (!MP_WET[n.kind]) { return; }
      var p = F.at(n), kind = MP_WET[n.kind], tapZ = p[2] + (kind === "shower" ? 1.0 : kind === "tub" ? 0.55 : kind === "fountain" ? 0.9 : 0.5) * P, below = p[2] - 0.12 * P;
      var cold = (Math.abs(net.main[2] - below) + Math.abs(p[0] - net.main[0]) + Math.abs(p[1] - net.main[1]) + Math.abs(tapZ - below)) / P;
      var best = null, len = Infinity;
      if (!MP_COLD_ONLY[n.kind]) {
        net.heaters.forEach(function (h) {
          var l = (Math.abs(h.top - below) + Math.abs(p[0] - h.p[0]) + Math.abs(p[1] - h.p[1]) + Math.abs(tapZ - below)) / P;
          if (l < len) { len = l; best = h; }
        });
      }
      var flow = MP_FLOW[n.kind] || 6, wait = best ? (best.n.recirc ? 2 + Math.min(4, 0.6 * 0.114 * 60 / flow * 3) : len * MP_PIPE_L / (flow / 60)) : null;
      net.fixtures.push({ n: n, p: p, kind: kind, tap: [p[0], p[1], tapZ], below: below, heater: best, hot: best ? len : null, cold: cold, wait: wait,
                          far: !!best && len > MP_HOT_MAX && !best.n.recirc });
    });
    net.farthest = net.fixtures.reduce(function (m, f) { return f.hot !== null && f.hot > m ? f.hot : m; }, 0);
    // the gas: what burns it, the meter on the outside wall nearest them, each run sized by the longest
    var apps = hand.nodes.filter(mpGas);
    if (apps.length) {
      var cx = 0, cy = 0;
      apps.forEach(function (a) { var q = F.at(a); cx += q[0] / apps.length; cy += q[1] / apps.length; });
      net.meter = mpMeterSpot(F, fb, cx, cy);
      var longest = 0;
      apps.forEach(function (a) {
        var q = F.at(a), stand = a.kind === "i_waterheater" && a.stand ? MP_STAND * P : 0, z = q[2] + stand + 0.3 * P, run = q[2] - 0.08 * P;
        var m = (Math.abs(net.meter[2] - run) + Math.abs(q[0] - net.meter[0]) + Math.abs(q[1] - net.meter[1]) + Math.abs(z - run)) / P;
        longest = Math.max(longest, m);
        net.gas.push({ n: a, p: q, at: [q[0], q[1], z], run: run, len: m, btu: MP_BTU[a.kind], trap: !MP_NO_TRAP[a.kind], room: mpRoomOf(a) });
      });
      var ft = longest / MP_FT * 1.1;                       // (and a tenth more for the fittings)
      net.gas.forEach(function (g) { g.size = mpPipe(g.btu / 1000, ft); });
      net.load = apps.reduce(function (s, a) { return s + MP_BTU[a.kind]; }, 0);
      net.trunk = mpPipe(net.load / 1000, ft);
      net.longest = longest;
    }
    mpKept = { key: key, net: net };
    return net;
  }
  // The meter: on the side wall nearer the gas, a third of the way back,
  // slid along clear of every door and window (a metre each way).
  function mpMeterSpot(F, fb, cx, cy) {
    var P = MP_P(), east = Math.abs(cx - fb.r) < Math.abs(cx - fb.l), x = east ? fb.r + 0.15 * P : fb.l - 0.15 * P;
    var opens = hand.nodes.filter(function (n) { return WALK_DOORS[n.kind] || n.kind === "i_window"; }).map(function (n) { return F.at(n); })
      .filter(function (q) { return q[3] === 0 && Math.abs(q[0] - x) < 0.6 * P; });
    var y0 = fb.b - (fb.b - fb.t) / 3, best = y0, bd = Infinity;
    for (var s = 0; s < 40; s++) {
      var y = y0 + (s % 2 ? 1 : -1) * Math.ceil(s / 2) * 0.5 * P;
      if (y < fb.t + 0.5 * P || y > fb.b - 0.5 * P) { continue; }
      if (opens.every(function (q) { return Math.abs(q[1] - y) > 1.0 * P; })) { if (Math.abs(y - y0) < bd) { bd = Math.abs(y - y0); best = y; } break; }
    }
    return [x, best, 0.6 * P];
  }
  // which heater a tap is fed from (39-xray.js asks, drawing the hot)
  function mpHeaterFor(n) {
    var net = mpNet(), f = net.fixtures.filter(function (x) { return x.n === n; })[0];
    return f && f.heater ? [f.heater.p[0], f.heater.p[1], f.heater.top] : null;
  }

  // ---- the code's checks: what is wanted, and the fix -------------------------------------------------------
  function mpDwelling() { var t = mpType(); return t === "house" || t === "cabin" || t === "duplex" || t === "townhouses" || t === "apartments" || t === "condos" || (t === "tower" && mpTowerUse() !== "offices"); }
  function mpIssues() {
    var out = [], net = mpNet(), plan = walkPlan(), P = MP_P(), rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && (!n.attic || n.attic === "room"); });
    if (!net.ok || rooms.length < 2) { return out; }
    function kindOf(r) { return r ? wireKindOf(plan, r) : ""; }
    function add(key, words, node, fix) { out.push({ key: key, text: say(key, words || {}), id: node ? node.id : null, fix: fix }); }
    var wet = net.fixtures.filter(function (f) { return !MP_COLD_ONLY[f.n.kind]; });
    // a water heater, where there is hot water to give
    if (wet.length && !net.heaters.length) { add("mp_no_heater", {}, null, mpPutHeater); }
    net.heaters.forEach(function (h) {
      var r = mpRoomOf(h.n), k = kindOf(r);
      if (h.gas && (k === "bed" || k === "main" || k === "bath" || k === "ensuite" || k === "closet") && h.n.vent !== "direct") {
        add("mp_heater_room", { room: roomName(plan, r) }, h.n, function () { h.n.vent = "direct"; });
      }
      if (h.gas && k === "garage" && !h.n.stand) { add("mp_heater_garage", {}, h.n, function () { h.n.stand = true; h.n.bollard = true; }); }
    });
    // hot water that takes too long: a loop round
    var far = net.fixtures.filter(function (f) { return f.far; });
    if (far.length) {
      var worst = far.sort(function (a, b) { return b.hot - a.hot; })[0];
      add("mp_hot_far", { what: kindName(worst.n.kind), len: mpLen(worst.hot), most: mpLen(MP_HOT_MAX) }, worst.heater.n, function () {
        net.heaters.forEach(function (h) { h.n.recirc = true; });
      });
    }
    // forced air with nothing to blow it: a furnace (gas, or an electric one in an all-electric house)
    if (hand.nodes.some(function (n) { return n.kind === "i_vent"; }) && !hand.nodes.some(function (n) { return n.kind === "i_furnace" || n.kind === "i_heatpump"; })) {
      add("mp_no_furnace", {}, null, mpPutFurnace);
    }
    // a furnace that burns gas in a bedroom
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_furnace" || !mpGas(n)) { return; }
      var r = mpRoomOf(n), k = kindOf(r);
      if ((k === "bed" || k === "main" || k === "bath" || k === "ensuite") && n.vent !== "direct") { add("mp_furnace_room", { room: roomName(plan, r) }, n, function () { n.vent = "direct"; }); }
      if (k === "garage" && !n.stand) { add("mp_heater_garage", {}, n, function () { n.stand = true; n.bollard = true; }); }
    });
    if (mpDwelling()) {
      // carbon monoxide alarms, outside every sleeping area
      var burns = hand.nodes.some(mpGas) || hand.nodes.some(function (n) { return n.kind === "i_fireplace"; });
      var garage = rooms.some(function (r) { return kindOf(r) === "garage"; });
      if (burns || garage) {
        mpCoSpots(plan, rooms, kindOf).forEach(function (s) {
          if (!s.has) { add("mp_co", { room: roomName(plan, s.room) }, s.room, function () { mpPutCo(s); }); }
        });
      }
    }
    // a dryer's duct
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_dryer" || n.booster) { return; }
      var d = mpDryerRun(n, plan);
      if (d !== null && d > MP_DRYER_MAX) { add("mp_dryer_long", { len: mpLen(d), most: mpLen(MP_DRYER_MAX) }, n, function () { n.booster = true; }); }
    });
    // a hood over every range
    hand.nodes.forEach(function (s) {
      if (s.kind !== "i_stove") { return; }
      var r = mpRoomOf(s);
      if (!r || hand.nodes.some(function (h) { return h.kind === "i_hood" && insideArea(r, h.x, h.y, -14) && Math.hypot(h.x - s.x, h.y - s.y) < 2.5 * P; })) { return; }
      add("mp_hood", { room: roomName(plan, r) }, s, function () { mpHoodOver(s); });
    });
    // GFCI where water is near
    var need = mpGfciNeeded(plan);
    if (need.length) { add("mp_gfci", { n: need.length }, need[0], function () { need.forEach(function (o) { o.gfci = true; }); }); }
    // the panel: not in a bathroom or a closet
    hand.nodes.forEach(function (b) {
      if (b.kind !== "i_breaker") { return; }
      var k = kindOf(mpRoomOf(b));
      if (k === "bath" || k === "ensuite" || k === "closet") { add("mp_panel_room", {}, b, function () { mpMovePanel(b, plan, rooms, kindOf); }); }
    });
    // the fixtures the people in it need
    mpFixtureNeeds(plan, rooms, kindOf).forEach(function (q) { out.push(q); });
    return out;
  }
  function mpAlong(r, kind, near) {
    var go = typeof starterAlong === "function" ? starterAlong(r, kind, near || null) : null;
    if (!go) { return null; }
    go();
    var n = nodeById(picked);
    if (n && n.kind === kind) { n.own = true; n.mp = true; return n; }
    return null;
  }
  // a hood over a range: on the wall behind it, as wide as it, its own way round
  function mpHoodOver(s) {
    var P = MP_P(), a = (s.turn || 0) * Math.PI / 180, bx = Math.sin(a), by = -Math.cos(a), back = (s.h || 60) / 2 - 0.1 * P;
    var h = adviceAdd("i_hood", Math.round(s.x + bx * back), Math.round(s.y + by * back), s.turn || 0);
    h.w = Math.max(s.w || 60, 0.76 * P); h.h = 0.5 * P; h.own = true; h.mp = true;
    return h;
  }
  // The rooms an appliance may go in, the likeliest first: those of the kinds asked for, in that
  // order, then the rest but bedrooms and bathrooms, the biggest first. (Only the first of the kind
  // was tried: a full utility closet left a house with no water heater, 2026-10-04.)
  function mpRoomsFor(kinds) {
    var plan = walkPlan(), P = MP_P(), rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && !n.attic; }), out = [];
    kinds.forEach(function (k) {
      rooms.filter(function (r) { var rk = wireKindOf(plan, r); return (rk === k || r.use === k || r.starter === k) && Math.min(r.w, r.h) >= 1.2 * P && out.indexOf(r) < 0; })
        .sort(function (a, b) { return b.w * b.h - a.w * a.h; }).forEach(function (r) { out.push(r); });
    });
    rooms.filter(function (r) { var rk = wireKindOf(plan, r); return out.indexOf(r) < 0 && !/^(bed|main|bath|ensuite)$/.test(rk) && r.use !== "washroom" && r.use !== "restroom"; })
      .sort(function (a, b) { return b.w * b.h - a.w * a.h; }).forEach(function (r) { out.push(r); });
    return out;
  }
  // In a corner of the room, clear of what stands there and inside its walls; null where none is.
  function mpCorner(r, kind) {
    var P2 = MP_P(), b = tieBox(r), T = roomWallOf(r), probe = { kind: kind, x: 0, y: 0, w: 140, h: 46 };
    measure(probe);
    var hw = probe.w / 2 + T + 2, hh = probe.h / 2 + T + 2, spots = [[b.l + hw, b.t + hh], [b.r - hw, b.t + hh], [b.l + hw, b.b - hh], [b.r - hw, b.b - hh]];
    for (var i = 0; i < spots.length; i++) {
      probe.x = Math.round(spots[i][0]); probe.y = Math.round(spots[i][1]);
      if (probe.x - probe.w / 2 < b.l + T || probe.x + probe.w / 2 > b.r - T || probe.y - probe.h / 2 < b.t + T || probe.y + probe.h / 2 > b.b - T) { continue; }
      var clear = !hand.nodes.some(function (m) {
        if (m === r || !(isSolid(m.kind) || WALK_DOORS[m.kind])) { return false; }
        var f = WALK_DOORS[m.kind] ? starterDoorFlip(m) : null;
        return boxesTouch(probe, m, WALK_DOORS[m.kind] ? 0.3 * P2 : 2) || (f && boxesTouch(probe, f, 0.3 * P2));
      });
      if (clear) {
        var n = adviceAdd(kind, probe.x, probe.y);
        n.own = true; n.mp = true;
        return n;
      }
    }
    return null;
  }
  function mpPutIn(kinds, kind, nearOf) {
    var list = mpRoomsFor(kinds);
    for (var i = 0; i < list.length; i++) {
      var b = tieBox(list[i]), n = mpAlong(list[i], kind, nearOf(b));
      if (n) { return n; }
    }
    for (var k = 0; k < list.length; k++) { var m = mpCorner(list[k], kind); if (m) { return m; } }
    return null;
  }
  function mpPutHeater() {
    var h = mpPutIn(["utility", "laundry", "garage", "storage", "stock", "staff", "kitchenette", "closet"], "i_waterheater", function (b) { return { x: b.r, y: b.t }; });
    if (h) { h.wired = true; }
    return h;
  }
  function mpPutFurnace() {
    // (beside the water heater where it can: one closet for both)
    var wh = hand.nodes.filter(function (n) { return n.kind === "i_waterheater"; })[0], whRoom = wh ? mpRoomOf(wh) : null;
    if (whRoom) {
      var first = mpAlong(whRoom, "i_furnace", { x: tieBox(whRoom).l, y: tieBox(whRoom).t });
      if (first) { first.wired = true; return first; }
    }
    // (in a corner where no wall is free -- never stood on what is there: a furnace through the
    // closet's shelves, 2026-10-04)
    var n = mpPutIn(["utility", "laundry", "garage", "storage", "stock", "closet", "hall"], "i_furnace", function (b) { return { x: b.l, y: b.t }; });
    if (n) { n.wired = true; }
    return n;
  }
  // Where the CO alarms go: the halls the bedrooms open onto (each its own
  // sleeping area), and a bedroom with a fire in it.
  function mpCoSpots(plan, rooms, kindOf) {
    var spots = [], seen = {};
    rooms.forEach(function (r) {
      var k = kindOf(r);
      if (k !== "bed" && k !== "main") { return; }
      var halls = (plan.joins || []).filter(function (j) { return j.rooms.indexOf(r) >= 0 && j.rooms.length === 2; })
        .map(function (j) { return j.rooms[0] === r ? j.rooms[1] : j.rooms[0]; })
        .filter(function (o) { var ok = kindOf(o); return ok !== "bed" && ok !== "main" && ok !== "bath" && ok !== "ensuite" && ok !== "closet"; });
      var hall = halls.filter(function (o) { return kindOf(o) === "hall"; })[0] || halls[0];
      var at = hall || r;
      if (!seen[at.id]) { seen[at.id] = true; spots.push({ room: at, near: hall ? null : r }); }
      // (in the room first, then whether it burns gas: a tower of flats asked every stove of every bedroom)
      if (!seen[r.id] && hand.nodes.some(function (n) { return (n.kind === "i_fireplace" || n.kind === "i_stove") && insideArea(r, n.x, n.y) && mpGas(n); })) {
        seen[r.id] = true; spots.push({ room: r });
      }
    });
    spots.forEach(function (s) { s.has = hand.nodes.some(function (n) { return n.kind === "i_smoke" && n.co && insideArea(s.room, n.x, n.y, -14); }); });
    return spots;
  }
  function mpPutCo(s) {
    var alarm = hand.nodes.filter(function (n) { return n.kind === "i_smoke" && insideArea(s.room, n.x, n.y, -14); })[0];
    if (!alarm) { alarm = adviceAdd("i_smoke", Math.round(s.room.x + s.room.w * 0.15), Math.round(s.room.y)); alarm.own = true; alarm.wired = true; }
    alarm.co = true;
    alarm.text = TXT.mp_co_name;
    return alarm;
  }
  // A dryer's duct: to the nearest outside wall of its room, and two bends
  function mpDryerRun(n, plan) {
    var r = mpRoomOf(n);
    if (!r) { return null; }
    var P = MP_P(), b = tieBox(r), all = hand.nodes.filter(function (m) { return m.kind === "i_room" && m !== r; }), best = Infinity;
    [["l", b.l, n.y], ["r", b.r, n.y], ["t", n.x, b.t], ["b", n.x, b.b]].forEach(function (e) {
      var ox = e[0] === "l" ? -12 : e[0] === "r" ? 12 : 0, oy = e[0] === "t" ? -12 : e[0] === "b" ? 12 : 0;
      var x = e[1] + ox, y = e[2] + oy;
      if (e[0] === "t" || e[0] === "b") { x = n.x; y = e[2] + oy; }
      if (all.some(function (m) { return insideArea(m, x, y); })) {
        // (through the next room to its outside wall: a longer run)
        var far = 0, k = 1;
        while (k < 30 && all.some(function (m) { return insideArea(m, x + Math.sign(ox) * k * 0.5 * P, y + Math.sign(oy) * k * 0.5 * P); })) { k++; }
        far = k * 0.5 * P;
        best = Math.min(best, (Math.abs(x - n.x) + Math.abs(y - n.y) + far) / P);
        return;
      }
      best = Math.min(best, (Math.abs(x - n.x) + Math.abs(y - n.y)) / P);
    });
    return best === Infinity ? null : best + 2 * MP_BEND + 1.2;   // (up behind it, and out: two bends)
  }
  function mpGfciNeeded(plan) {
    var P = MP_P(), sinks = hand.nodes.filter(function (n) { return MP_WET[n.kind] === "basin" || n.kind === "i_bathtub" || n.kind === "i_shower"; });
    return hand.nodes.filter(function (o) {
      if (o.kind !== "i_outlet" || o.gfci) { return false; }
      var r = mpRoomOf(o), k = r ? wireKindOf(plan, r) : "";
      if (MP_GFCI_ROOMS[k] || (r && (r.use === "restroom" || r.use === "cafekitchen" || r.use === "kitchenette" || r.use === "flatbath"))) { return true; }
      return sinks.some(function (s) { return Math.hypot(s.x - o.x, s.y - o.y) < 1.83 * P; });
    });
  }
  function mpMovePanel(b, plan, rooms, kindOf) {
    // (a garage, a utility room, a laundry, a hall -- or, in a cabin or a duplex with none, the
    // biggest room that is not a bathroom, a closet or a bedroom)
    var order = rooms.filter(function (r) { var k = kindOf(r); return k === "garage" || k === "utility" || k === "laundry"; })
      .concat(rooms.filter(function (r) { return kindOf(r) === "hall"; }))
      .concat(rooms.filter(function (r) { var k = kindOf(r); return !/^(bath|ensuite|closet|bed|main|garage|utility|laundry|hall)$/.test(k); })
        .sort(function (p, q) { return q.w * q.h - p.w * p.h; }));
    var was = hand.nodes.indexOf(b);
    hand.nodes = hand.nodes.filter(function (n) { return n !== b; });
    for (var i = 0; i < order.length; i++) {
      var bb = tieBox(order[i]), n = mpAlong(order[i], "i_breaker", { x: bb.l, y: bb.t });
      if (n) { n.wired = true; return; }
    }
    hand.nodes.splice(Math.max(0, was), 0, b);              // (nowhere better: where it was)
  }
  // The fixtures for the people in it: toilets, basins, fountains, a service sink.
  function mpPeople(rooms) {
    var P = MP_P(), occ = 0;
    rooms.forEach(function (r) {
      var k = r.use || r.starter, f = MP_LOAD[k];
      if (!f) { return; }
      // (a room cut to a shape, 40-shaped.js: its floor as cut -- a tower's open plan's box was half outside its glass)
      occ += (r.shape && typeof shpArea === "function" ? shpArea(r.shape) : r.w * r.h) / (P * P) / f;
    });
    return Math.ceil(occ);
  }
  function mpFixtureNeeds(plan, rooms, kindOf) {
    var out = [], type = mpType(), occType = MP_OCC[type] || (type === "tower" && mpTowerUse() !== "homes" ? "business" : null);
    if (!occType) { return out; }
    var N = MP_NEED[occType], people = mpPeople(rooms);
    if (people < 1) { return out; }
    function per(n, rule) { if (!rule[1] || n <= rule[1]) { return Math.ceil(n / rule[0]); } return Math.ceil(rule[1] / rule[0]) + Math.ceil((n - rule[1]) / rule[2]); }
    // (one for all where few: a shop of 100 or fewer, an office of 25 or fewer, any of 15)
    var together = people <= 15 || (occType === "mercantile" && people <= 100) || (occType === "business" && people <= 25);
    var half = Math.ceil(people / 2);
    var wc = together ? per(people, N.wc) : 2 * per(half, N.wc), lav = together ? per(people, N.lav) : 2 * per(half, N.lav), df = Math.ceil(people / N.df);
    var publicRooms = rooms.filter(function (r) { return r.use !== "flat" && r.use !== "flatbath" && r.use !== "flatbed" && r.use !== "flatbed2"; });
    function count(kinds, where) {
      return hand.nodes.filter(function (n) { return kinds.indexOf(n.kind) >= 0 && publicRooms.some(function (r) { return insideArea(r, n.x, n.y) && (!where || where(r)); }); }).length;
    }
    // (a washroom's stalls each a toilet, and its urinals standing in for some: IPC 424.2, two
    // thirds of them in a school or a hall, half anywhere else -- 40-stalls.js)
    function isRest(r) { return r.use === "restroom" || r.use === "washroom"; }
    var rest = publicRooms.filter(isRest);
    var urinalShare = occType === "educational" || occType === "assembly" ? 2 / 3 : 1 / 2;
    var haveWc = count(["i_toilet", "i_toiletstall"]);
    haveWc += Math.min(count(["i_urinal"]), Math.floor(wc * urinalShare));
    var haveLav = count(["i_sink", "i_vanity"], isRest);
    var haveDf = count(["i_fountain"]), haveSs = count(["i_utilitysink"]);
    var words = { people: people };
    if (haveWc < wc) { out.push({ key: "mp_need_wc", text: say("mp_need_wc", Object.assign({ need: wc, have: haveWc }, words)), id: rest[0] ? rest[0].id : null, fix: function () { mpAddInto(rest, function (r) { return (r.use || r.starter) === "washroom" && ICONS.i_toiletstall ? "i_toiletstall" : "i_toilet"; }, wc - haveWc); } }); }
    if (haveLav < lav) { out.push({ key: "mp_need_lav", text: say("mp_need_lav", Object.assign({ need: lav, have: haveLav }, words)), id: rest[0] ? rest[0].id : null, fix: function () { mpAddInto(rest, "i_sink", lav - haveLav); } }); }
    if (haveDf < df) {
      var hall = publicRooms.filter(function (r) { var k = r.use || r.starter; return k === "lobby" || k === "landing" || k === "staff" || k === "reception" || kindOf(r) === "hall"; });
      out.push({ key: "mp_need_df", text: say("mp_need_df", Object.assign({ need: df, have: haveDf }, words)), id: hall[0] ? hall[0].id : null, fix: function () { mpAddInto(hall.length ? hall : rest, "i_fountain", df - haveDf); } });
    }
    if (haveSs < 1) {
      var back = publicRooms.filter(function (r) { var k = r.use || r.starter; return k === "stock" || k === "staff" || k === "kitchenette" || k === "cafekitchen" || k === "restroom" || k === "washroom"; });
      out.push({ key: "mp_need_ss", text: say("mp_need_ss", words), id: back[0] ? back[0].id : null, fix: function () { mpAddInto(back, "i_utilitysink", 1); } });
    }
    return out;
  }
  // as many as wanted, one room after the next, each where it fits
  function mpAddInto(rooms, kind, many) {
    var put = 0, tries = 0;
    while (put < many && tries < many * 3 + rooms.length) {
      var r = rooms[tries % Math.max(1, rooms.length)];
      tries++;
      if (!r) { break; }
      // (what goes in may be the room's to say: a washroom's toilets in stalls)
      if (mpAlong(r, typeof kind === "function" ? kind(r) : kind, null)) { put++; }
    }
    return put;
  }
  // All of it put right (Start building; the automatic services)
  function mpFixAll() {
    var done = 0;
    for (var round = 0; round < 3; round++) {
      var list = mpIssues().filter(function (q) { return q.fix; });
      if (!list.length) { break; }
      list.forEach(function (q) { try { q.fix(); done++; } catch (e) { /* the next */ } });
      mpKept.key = null;
    }
    // GFCI where the code wants it, and every hall alarm outside the bedrooms a CO alarm too
    return done;
  }
  // (one check, the storeys counted once: asked again for every stove in
  // every bedroom, the floors stacked afresh each time, they were most of a
  // block of flats' first check -- a second, as it was opened: 2026-10-05)
  var mpStoreysOnce = null;
  var mpStoreysEach = mpStoreys;
  mpStoreys = function () { return mpStoreysOnce !== null ? mpStoreysOnce : mpStoreysEach(); };
  var mpIssuesEach = mpIssues;
  mpIssues = function () {
    mpStoreysOnce = mpStoreysEach();
    try { return mpIssuesEach.apply(this, arguments); } finally { mpStoreysOnce = null; }
  };
  if (typeof homeAdvice === "function") {
    var homeAdviceMp = homeAdvice;
    homeAdvice = function () {
      var tips = homeAdviceMp.apply(this, arguments);
      try {
        mpIssues().forEach(function (q) {
          tips.push({ text: q.text, id: q.id, warn: true, key: "s_advice",
                      fix: q.fix ? { auto: true, says: TXT.mp_fix, go: function () {
                        keepUndo(); q.fix(); mpKept.key = null;
                        if (typeof handKeep === "function") { handKeep(); }
                        drawHand(); drawHandPanel(); showReport();
                      } } : null });
        });
      } catch (e) { /* the advice as it was */ }
      return tips;
    };
  }
  // Start building: put right as it is made, unless it is all left to you
  // (inside the replace-or-add question, as every step is: 40-hood.js)
  if (typeof STARTER_WRAPS === "object") {
    var mpWrap = function* (inner, want) {
      var out = yield* inner(want);
      try {
        houseSetOpt("fuel", want && want.fuel === "electric" ? "electric" : "gas");
        mpBuilding = { type: want && want.type || "house", towerUse: want && want.towerUse };
        if (!want || want.services !== "diy") { mpKept.key = null; mpFixAll(); yield ["wire", 1]; }
        mpBuilding = null;
      } catch (e) { mpBuilding = null; if (window.console && console.warn) { console.warn("services:", e && e.message); } }
      return out;
    };
    var hoodAtMp = -1;
    STARTER_WRAPS.forEach(function (fn, i) { if (hoodAtMp < 0 && (String(fn).indexOf("hoodBuild") >= 0 || String(fn).indexOf("hoodAsk") >= 0)) { hoodAtMp = i; } });
    if (hoodAtMp >= 0) { STARTER_WRAPS.splice(hoodAtMp, 0, mpWrap); } else { STARTER_WRAPS.push(mpWrap); }
  }
  // Start building asks how it is heated and cooked on, after its services
  if (typeof sysAsk === "function") {
    var sysAskMp = sysAsk;
    sysAsk = function (ui, want) {
      var out = sysAskMp.apply(this, arguments);
      if (!want.fuel) { want.fuel = "gas"; }
      ui.head(TXT.mp_fuel_head);
      ui.tiles();
      MP_FUELS.forEach(function (k) {
        ui.tile(TXT["mp_fuel_" + k], "mp_fuel_" + k, function () { return (want.fuel || "gas") === k; }, function () { want.fuel = k; }, true);
      });
      return out;
    };
  }
  // and the view's settings
  if (typeof HOUSE_TAB_MORE === "object") {
    HOUSE_TAB_MORE.push(function (sheet, head, tiles, draw) {
      head(TXT.mp_fuel_head);
      if (typeof worldPicker === "function") {
        worldPicker(sheet, MP_FUELS, mpFuel(), "mp_fuel_", function (k) {
          keepUndo();
          houseSetOpt("fuel", k);
          mpKept.key = null;
          if (houseOpt("services") !== "diy") { mpFixAll(); }
          if (typeof handKeep === "function") { handKeep(); }
          if (V3) { V3.dirty = true; V3.xrayKept = null; }
          try { drawHand(); showReport(); } catch (e) { /* later */ }
          if (draw) { draw(); }
        });
      }
    });
  }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.mp_fuel_gas = '<path d="M10 17.4a5 5 0 0 0 5-5c0-3.4-3-4.6-3.6-8.2C9 6 6 8.6 6 12.2a4 4 0 0 0 4 5.2z"/><path d="M10 17.4a2 2 0 0 1-2-2c0-1.4 1.2-2 2-3.4.8 1.4 2 2 2 3.4a2 2 0 0 1-2 2z"/>';
    HOUSE_ICONS.mp_fuel_electric = '<path d="M11.2 2.6 5 11.2h4.6l-1 6.2 6.4-8.8H10.4z"/>';
  }

  // ---- seen: in the walls (X-ray), and where it shows in the rooms -------------------------------------------
  function mpRing(x, y, r, n) { var out = []; for (var i = 0; i < (n || 12); i++) { var a = i / (n || 12) * Math.PI * 2; out.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return out; }
  // The gas: the meter and its regulator on the outside wall, bonded; a
  // trunk in and a run to each appliance under the floor, each its size;
  // at each its shutoff and (but a range, a dryer, a fireplace) its trap.
  function mpGasDraw(faces, labels, look) {
    var net = mpNet(), P = MP_P();
    if (!net.ok || !net.gas.length || !net.meter) { return; }
    var gas = look(XRAY_COLORS.gas), m = net.meter, yellow = look("#f2c230"), steel = look("#8f969c", { pat: 22 });
    var out = m[0] < (net.fb.l + net.fb.r) / 2 ? -1 : 1;
    v3Prism(faces, [[m[0], m[1] - 0.18 * P], [m[0] + out * 0.28 * P, m[1] - 0.18 * P], [m[0] + out * 0.28 * P, m[1] + 0.18 * P], [m[0], m[1] + 0.18 * P]], 0.55 * P, 1.0 * P, look("#c9b04a"));
    v3Prism(faces, mpRing(m[0] + out * 0.14 * P, m[1] + 0.32 * P, 0.1 * P, 10), 0.45 * P, 0.58 * P, steel);       // the regulator
    xraySeg(faces, [m[0] + out * 0.14 * P, m[1], 0.1 * P], [m[0] + out * 0.14 * P, m[1], 0.55 * P], 0.02 * P, gas);   // (in from the street)
    xraySeg(faces, [m[0], m[1] - 0.25 * P, 0.7 * P], [m[0], m[1] - 0.25 * P, 0.05 * P], 0.006 * P, look("#c87533")); // its bond to the ground
    labels.push({ x: m[0] + out * 0.14 * P, y: m[1], z: 1.25 * P, text: TXT.xr_meter + " · " + mpSay(net.trunk) });
    net.gas.forEach(function (g) {
      var r = (MP_MM[g.size] || 15) / 1000 * P * 0.6;
      xrayRoute(faces, [m[0], m[1], 0.6 * P], g.at, g.run, r, gas);
      // its shutoff, by it, and the trap under the tee
      var v = [g.at[0] + 0.12 * P, g.at[1], g.at[2]];
      v3Prism(faces, [[v[0] - 0.05 * P, v[1] - 0.012 * P], [v[0] + 0.05 * P, v[1] - 0.012 * P], [v[0] + 0.05 * P, v[1] + 0.012 * P], [v[0] - 0.05 * P, v[1] + 0.012 * P]], v[2] + 0.03 * P, v[2] + 0.05 * P, yellow);
      if (g.trap) { xraySeg(faces, [g.at[0], g.at[1], g.at[2]], [g.at[0], g.at[1], g.at[2] - 0.15 * P], r, gas); v3Prism(faces, mpRing(g.at[0], g.at[1], r * 1.4, 8), g.at[2] - 0.17 * P, g.at[2] - 0.14 * P, steel); }
      labels.push({ x: g.at[0], y: g.at[1], z: g.at[2] + 0.35 * P, text: say("mp_gas_label", { size: mpSay(g.size), kbtu: Math.round(g.btu / 1000) }) });
      // a flue up through the roof from what burns in a room (not a range, nor a sealed one: its pipes out the wall)
      if (g.n.kind === "i_waterheater" || g.n.kind === "i_furnace") {
        var top = g.p[2] + (typeof pieceHigh === "function" ? pieceHigh(g.n) : 1.5) * P + (g.n.stand ? MP_STAND * P : 0), ceil = g.p[2] + ceilOf(g.room || g.n) * P;
        if (g.n.vent === "direct") {
          var w = mpNearWall(g.n), to = [w[0], w[1], top];
          xrayRoute(faces, [g.p[0], g.p[1], top], to, top + 0.1 * P, 0.04 * P, steel);
          labels.push({ x: to[0], y: to[1], z: top + 0.4 * P, text: TXT.mp_direct });
        } else {
          xraySeg(faces, [g.p[0], g.p[1], top], [g.p[0], g.p[1], ceil + 1.8 * P], 0.05 * P, steel);
          v3Prism(faces, mpRing(g.p[0], g.p[1], 0.11 * P, 10), ceil + 1.8 * P, ceil + 1.95 * P, look("#3b3e42"));
          labels.push({ x: g.p[0], y: g.p[1], z: ceil + 2.2 * P, text: TXT.mp_flue });
        }
      }
    });
  }
  // the outside wall nearest a thing (its room's), for a sealed appliance's pipes or a dryer's duct
  function mpNearWall(n) {
    var F = xrayFloors(), r = mpRoomOf(n), q = F.at(n);
    if (!r) { return [q[0], q[1]]; }
    var b = tieBox(r), f = F.of(r), dx = f ? f.dx : 0, dy = f ? f.dy : 0;
    var opts = [[b.l + dx, q[1], Math.abs(q[0] - b.l - dx)], [b.r + dx, q[1], Math.abs(q[0] - b.r - dx)], [q[0], b.t + dy, Math.abs(q[1] - b.t - dy)], [q[0], b.b + dy, Math.abs(q[1] - b.b - dy)]];
    opts.sort(function (a, c) { return a[2] - c[2]; });
    return [opts[0][0], opts[0][1]];
  }
  // A water heater as it is put in: its stand and a guard in a garage, a
  // pan under it elsewhere, two straps, its expansion tank on the cold, the
  // relief valve's pipe down to a hand's breadth off the floor, the pipes up
  // into the ceiling (a loop and its pump where the far taps wait too long).
  function mpHeaterFaces(faces, h, look, xray, lab) {
    var P = MP_P(), p = h.p, n = h.n, R = Math.min(n.w || 40, n.h || 40) / 2, base = p[2] + (n.stand ? MP_STAND * P : 0), top = h.top;
    var steel = look("#9aa1a8", { pat: 22 }), copper = look("#c87533", { pat: 23 }), white = look("#eceae4"), yellow = look("#f2c230"), red = look("#d43c3c"), blue = look("#3f86d9");
    if (n.stand) {
      v3Prism(faces, [[p[0] - R - 2, p[1] - R - 2], [p[0] + R + 2, p[1] - R - 2], [p[0] + R + 2, p[1] + R + 2], [p[0] - R - 2, p[1] + R + 2]], base - 0.06 * P, base, steel);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { var x = p[0] + c[0] * (R - 1), y = p[1] + c[1] * (R - 1); v3Prism(faces, [[x - 1.5, y - 1.5], [x + 1.5, y - 1.5], [x + 1.5, y + 1.5], [x - 1.5, y + 1.5]], p[2], base - 0.06 * P, steel); });
    } else {
      v3Prism(faces, mpRing(p[0], p[1], R + 3, 16), p[2], p[2] + 0.06 * P, look("#b9bec2"));      // the pan
    }
    if (n.bollard) {
      var room = mpRoomOf(n), c = room ? xrayFloors().at(room) : p, dxr = c[0] - p[0], dyr = c[1] - p[1], l = Math.hypot(dxr, dyr) || 1;
      var bx = p[0] + dxr / l * (R + 0.35 * P), by = p[1] + dyr / l * (R + 0.35 * P);
      v3Prism(faces, mpRing(bx, by, 0.07 * P, 10), p[2], p[2] + 1.0 * P, yellow);
      lab(bx, by, p[2] + 1.25 * P, TXT.mp_bollard);
    }
    // straps, a third and two thirds of the way up
    [0.33, 0.66].forEach(function (k) { var z = base + (top - base) * k; v3Prism(faces, mpRing(p[0], p[1], R + 0.6, 16), z, z + 0.03 * P, steel); });
    // the relief valve on its side, its pipe down to 15 cm off the floor
    var sx = p[0] + R + 0.02 * P, sz = top - 0.2 * P;
    v3Prism(faces, [[sx - 0.03 * P, p[1] - 0.03 * P], [sx + 0.04 * P, p[1] - 0.03 * P], [sx + 0.04 * P, p[1] + 0.03 * P], [sx - 0.03 * P, p[1] + 0.03 * P]], sz - 0.04 * P, sz + 0.04 * P, copper);
    xraySeg(faces, [sx + 0.03 * P, p[1], sz], [sx + 0.03 * P, p[1], p[2] + 0.15 * P], 0.012 * P, copper);
    // the cold in (its shutoff), the hot out, up into the ceiling
    var ceil = p[2] + ceilOf(mpRoomOf(n) || n) * P;
    xraySeg(faces, [p[0] - R * 0.45, p[1], top], [p[0] - R * 0.45, p[1], ceil], 0.012 * P, blue);
    xraySeg(faces, [p[0] + R * 0.45, p[1], top], [p[0] + R * 0.45, p[1], ceil], 0.012 * P, red);
    v3Prism(faces, [[p[0] - R * 0.45 - 0.04 * P, p[1] - 0.01 * P], [p[0] - R * 0.45 + 0.04 * P, p[1] - 0.01 * P], [p[0] - R * 0.45 + 0.04 * P, p[1] + 0.01 * P], [p[0] - R * 0.45 - 0.04 * P, p[1] + 0.01 * P]], top + 0.12 * P, top + 0.14 * P, red);
    // the expansion tank, on the cold over it
    var ex = [p[0] - R * 0.45 - 0.14 * P, p[1]];
    xraySeg(faces, [p[0] - R * 0.45, p[1], top + 0.3 * P], [ex[0], ex[1], top + 0.3 * P], 0.01 * P, blue);
    v3Prism(faces, mpRing(ex[0], ex[1], 0.1 * P, 12), top + 0.3 * P, top + 0.62 * P, look("#3f6fb0"));
    if (n.recirc) {
      // the loop's pump on the return, by the heater
      var pp = [p[0] + R * 0.45 + 0.14 * P, p[1]];
      v3Prism(faces, [[pp[0] - 0.06 * P, pp[1] - 0.06 * P], [pp[0] + 0.06 * P, pp[1] - 0.06 * P], [pp[0] + 0.06 * P, pp[1] + 0.06 * P], [pp[0] - 0.06 * P, pp[1] + 0.06 * P]], top + 0.25 * P, top + 0.4 * P, look("#2d7a46"));
      xraySeg(faces, [pp[0], pp[1], top + 0.4 * P], [pp[0], pp[1], ceil], 0.01 * P, look("#d97a7a"));
      lab(pp[0], pp[1], top + 0.65 * P, TXT.mp_recirc);
    }
    // a gas one: its shutoff and trap at the floor, the flue up from its top (or a sealed one's pipes out the wall)
    if (h.gas && !xray) {
      var gx = p[0] - R - 0.05 * P;
      xraySeg(faces, [gx, p[1], p[2] + 0.1 * P], [gx, p[1], p[2] + 0.5 * P], 0.012 * P, look(XRAY_COLORS.gas));
      v3Prism(faces, [[gx - 0.05 * P, p[1] - 0.01 * P], [gx + 0.05 * P, p[1] - 0.01 * P], [gx + 0.05 * P, p[1] + 0.01 * P], [gx - 0.05 * P, p[1] + 0.01 * P]], p[2] + 0.42 * P, p[2] + 0.44 * P, yellow);
      if (n.vent !== "direct") { xraySeg(faces, [p[0], p[1], top], [p[0], p[1], ceil], 0.05 * P, steel); }
    }
  }
  // inside the walls (X-ray): the heaters as put in, the hot water's loop,
  // a dryer's duct, and a bigger building's own -- its backflow preventer,
  // a cafe's grease interceptor, a tower's booster pumps and its zones
  if (typeof xrayBuild === "function") {
    var xrayBuildMp = xrayBuild;
    xrayBuild = function (model) {
      var made = xrayBuildMp.apply(this, arguments);
      try { mpXray(made); } catch (e) { if (window.console && console.warn) { console.warn("services in the walls:", e && e.message); } }
      return made;
    };
  }
  function mpXray(made) {
    var net = mpNet(), P = MP_P(), faces = made.faces, labels = made.labels, start = faces.length;
    if (!net.ok) { return; }
    function look(color, extra) { return Object.assign({ piece: true, color: color, edge: v3Mix(color, "#000000", 0.3), bare: true, xray: true }, extra || {}); }
    function lab(x, y, z, t) { labels.push({ x: x, y: y, z: z, text: t }); }
    var shown = function (n) { return xrayShownLevel(net.F.at(n)[3], net.F); };
    if (xrayLayer("water")) {
      net.heaters.forEach(function (h) {
        if (!shown(h.n)) { return; }
        mpHeaterFaces(faces, h, look, true, lab);
        lab(h.p[0], h.p[1], h.top + 0.95 * P, TXT.mp_tpr + " · " + TXT.mp_expansion);
        // the loop: out along the hot, back to the heater, round the farthest taps
        if (h.n.recirc) {
          net.fixtures.filter(function (f) { return f.heater === h; }).forEach(function (f) {
            xrayRoute(faces, [f.tap[0] + 0.12 * P, f.tap[1], f.below + 0.1 * P], [h.p[0] + 0.2 * P, h.p[1], h.top + 0.3 * P], f.below + 0.1 * P, 0.012 * P, look("#d97a7a"));
          });
        }
      });
      // what the code wants a bigger building to have at its main
      var t = mpType();
      if (t !== "house" && t !== "cabin" && t !== "duplex") {
        var m = net.main;
        v3Prism(faces, [[m[0] - 0.35 * P, m[1] - 0.6 * P], [m[0] + 0.35 * P, m[1] - 0.6 * P], [m[0] + 0.35 * P, m[1] - 0.4 * P], [m[0] - 0.35 * P, m[1] - 0.4 * P]], 0.3 * P, 0.55 * P, look("#3f86d9"));
        lab(m[0], m[1] - 0.5 * P, 0.9 * P, TXT.mp_backflow);
      }
      if (mpStoreys() > 5) {
        var plantRoom = net.heaters[0] ? net.heaters[0].p : [net.main[0], net.main[1] - 2 * P, 0];
        v3Prism(faces, [[plantRoom[0] + 0.5 * P, plantRoom[1] - 0.3 * P], [plantRoom[0] + 1.5 * P, plantRoom[1] - 0.3 * P], [plantRoom[0] + 1.5 * P, plantRoom[1] + 0.3 * P], [plantRoom[0] + 0.5 * P, plantRoom[1] + 0.3 * P]], plantRoom[2], plantRoom[2] + 0.8 * P, look("#2d7a46"));
        lab(plantRoom[0] + P, plantRoom[1], plantRoom[2] + 1.1 * P, TXT.mp_booster);
        // a pressure-reducing valve every ten storeys or so (the water's own weight: 0.43 psi a foot)
        var floors = net.F.floors.filter(function (f) { return f.level > 0 && f.level % 10 === 0; });
        floors.forEach(function (f) {
          if (!xrayShownLevel(f.level, net.F)) { return; }
          lab(plantRoom[0] + f.dx, plantRoom[1] + f.dy, f.z + 0.9 * P, TXT.mp_prv);
          v3Prism(faces, mpRing(plantRoom[0] + f.dx, plantRoom[1] + f.dy, 0.08 * P, 8), f.z + 0.4 * P, f.z + 0.6 * P, look("#3f86d9"));
        });
      }
    }
    if (xrayLayer("drain") && mpType() === "cafe") {
      var k = hand.nodes.filter(function (r) { return r.kind === "i_room" && r.use === "cafekitchen"; })[0];
      if (k) {
        var q = net.F.at(k), gx = q[0], gy = net.fb.b + 1.4 * P;
        v3Prism(faces, [[gx - 0.6 * P, gy - 0.4 * P], [gx + 0.6 * P, gy - 0.4 * P], [gx + 0.6 * P, gy + 0.4 * P], [gx - 0.6 * P, gy + 0.4 * P]], -1.2 * P, 0.02 * P, look("#8a8f95"));
        xrayRoute(faces, [q[0], q[1], -0.3 * P], [gx, gy, -0.5 * P], -0.5 * P, 0.05 * P, look(XRAY_COLORS.drain));
        lab(gx, gy, 0.5 * P, TXT.mp_grease);
      }
    }
    if (xrayLayer("air")) {
      hand.nodes.forEach(function (n) {
        if (n.kind !== "i_dryer" || !shown(n)) { return; }
        var p = net.F.at(n), w = mpNearWall(n), duct = look("#c9ced3", { pat: 22 });
        xrayRoute(faces, [p[0], p[1], p[2] + 0.4 * P], [w[0], w[1], p[2] + 0.5 * P], p[2] + 0.5 * P, 0.05 * P, duct);
        lab(w[0], w[1], p[2] + 0.9 * P, n.booster ? TXT.mp_dryer_fan : TXT.mp_dryer_duct);
      });
    }
    for (var i = start; i < faces.length; i++) { if (!faces[i].src) { faces[i].src = faces[i]; } }
  }
  // In the rooms, without X-ray: the heater as put in, a gas meter on the wall
  if (typeof v3Build === "function") {
    var v3BuildMp = v3Build;
    v3Build = function () {
      var model = v3BuildMp.apply(this, arguments);
      try { if (model && model.faces && V3 && V3.scene !== "space" && !(typeof bpSite !== "undefined" && bpSite)) { mpRoomFaces(model); } } catch (e) { /* as it is */ }
      return model;
    };
  }
  var mpFacesKept = { key: null, faces: null, lift: null };
  function mpRoomFaces(model) {
    var net = mpNet(), P = MP_P();
    if (!net.ok) { return; }
    var key = mpKept.key + "|" + (V3.mode || "") + "|" + (V3.upTo === undefined ? "" : V3.upTo);
    if (mpFacesKept.key !== key) {
      var faces = [];
      function look(color, extra) { return Object.assign({ piece: true, color: color, edge: v3Mix(color, "#000000", 0.3) }, extra || {}); }
      net.heaters.forEach(function (h) { mpHeaterFaces(faces, h, look, false, function () {}); });
      if (net.meter && net.gas.length) {
        var m = net.meter, out = m[0] < (net.fb.l + net.fb.r) / 2 ? -1 : 1;
        v3Prism(faces, [[m[0], m[1] - 0.17 * P], [m[0] + out * 0.26 * P, m[1] - 0.17 * P], [m[0] + out * 0.26 * P, m[1] + 0.17 * P], [m[0], m[1] + 0.17 * P]], 0.6 * P, 1.0 * P, look("#c9cdc6", { pat: 22 }));
        v3Prism(faces, mpRing(m[0] + out * 0.13 * P, m[1] + 0.3 * P, 0.09 * P, 10), 0.48 * P, 0.6 * P, look("#8f969c", { pat: 22 }));
        v3Prism(faces, [[m[0] + out * 0.1 * P, m[1] - 0.02 * P], [m[0] + out * 0.16 * P, m[1] - 0.02 * P], [m[0] + out * 0.16 * P, m[1] + 0.02 * P], [m[0] + out * 0.1 * P, m[1] + 0.02 * P]], 0.02 * P, 0.6 * P, look("#d6b84a", { pat: 22 }));
      }
      faces.forEach(function (f) { f.src = f; });
      var lift = {};
      net.heaters.forEach(function (h) { if (h.n.stand) { lift[h.n.id] = MP_STAND * P; } });
      hand.nodes.forEach(function (n) { if (n.kind === "i_furnace" && n.stand) { lift[n.id] = MP_STAND * P; } });
      mpFacesKept = { key: key, faces: faces, lift: lift };
    }
    // (the heater up on its stand)
    var L = mpFacesKept.lift;
    if (L && Object.keys(L).length) {
      for (var i = 0; i < model.faces.length; i++) {
        var f = model.faces[i], up = f.node ? L[f.node.id] : 0;
        if (up) { model.faces[i] = Object.assign({}, f, { pts: f.pts.map(function (p) { return [p[0], p[1], (p[2] || 0) + up]; }) }); }
      }
    }
    Array.prototype.push.apply(model.faces, mpFacesKept.faces);
  }

  // ---- used: hot water as far off as it is, gas that burns blue ----------------------------------------------
  function mpFixtureOf(n) { return mpNet().fixtures.filter(function (f) { return f.n === n; })[0] || null; }
  function mpHotSays(f) {
    if (!f || MP_COLD_ONLY[f.n.kind]) { return ""; }
    if (!f.heater) { return TXT.mp_cold_only; }
    var r = mpRoomOf(f.heater.n), plan = walkPlan(), where = r ? roomName(plan, r) : "";
    if (f.heater.n.recirc) { return say("mp_hot_now", { len: mpLen(f.hot), room: where }); }
    return say("mp_hot_wait", { s: Math.max(1, Math.round(f.wait)), len: mpLen(f.hot), room: where });
  }
  function mpBurnSays(n) {
    if (!MP_BTU[n.kind]) { return ""; }
    if (mpGas(n)) {
      var g = mpNet().gas.filter(function (x) { return x.n === n; })[0];
      return g ? say("mp_gas_on", { what: useName(n), size: mpSay(g.size), kbtu: Math.round(g.btu / 1000) }) : say("mp_no_gas", { what: useName(n) });
    }
    var amps = typeof SYS_AMPS === "object" && SYS_AMPS[n.kind] ? SYS_AMPS[n.kind] : 30;
    return say("mp_elec_on", { what: useName(n), amps: amps });
  }
  if (typeof useIt === "function") {
    var useItMp = useIt;
    useIt = function (n) {
      var out = useItMp.apply(this, arguments);
      try {
        var U = typeof useState === "function" ? useState() : null;
        if (n && U && U.on[n.id]) {
          var said = MP_WET[n.kind] ? mpHotSays(mpFixtureOf(n)) : MP_BTU[n.kind] || n.kind === "i_waterheater" ? mpBurnSays(n) : "";
          if (said) { setTimeout(function () { v3Say(said); }, 900); }
        }
      } catch (e) { /* said as it was */ }
      return out;
    };
  }
  // running hot once the hot has come: steam off it; the gas's flames blue
  if (typeof useScene === "function") {
    var useSceneMp = useScene;
    useScene = function (model) {
      var out = useSceneMp.apply(this, arguments);
      try { mpUseFaces(model); } catch (e) { /* as it is */ }
      return out;
    };
  }
  function mpUseFaces(model) {
    var U = V3 && V3.use, P = MP_P();
    if (!U || V3.mode !== "walk") { return; }
    var now = performance.now(), t = now / 1000, F = xrayFloors();
    hand.nodes.forEach(function (n) {
      if (!U.on[n.id]) { return; }
      var p = F.at(n);
      if (MP_WET[n.kind] && MP_FLOW[n.kind]) {
        var f = mpFixtureOf(n), since = U.since && U.since[n.id] ? (now - U.since[n.id]) / 1000 : 0;
        if (!f || !f.heater || since < f.wait) { return; }
        var steam = { piece: true, color: "#f4f6f8", edge: "#f4f6f8", bare: true, alpha: 0.22, late: true };
        var high = (typeof pieceHigh === "function" ? pieceHigh(n) : 0.9) * P, base = p[2] + (n.kind === "i_shower" ? 1.2 * P : high);
        for (var k = 0; k < 5; k++) {
          var ph = (t * 0.6 + k / 5) % 1, rr = (0.08 + ph * 0.25) * P, x = p[0] + Math.sin(k * 2.1 + t) * 0.08 * P, y = p[1] + Math.cos(k * 1.7 + t) * 0.08 * P;
          v3Prism(model.faces, mpRing(x, y, rr, 8), base + ph * 0.8 * P, base + ph * 0.8 * P + rr * 0.8, Object.assign({}, steam, { alpha: 0.25 * (1 - ph) }));
        }
        V3.useMoving = true;
        return;
      }
      if (n.kind === "i_stove" && mpGas(n)) {
        // blue gas flames: on the range's burners, at a heater's foot behind its little window
        var blue = { piece: true, color: "#5aa8ff", edge: "#5aa8ff", pat: 31, bare: true, alpha: 0.7, late: true };
        var core = { piece: true, color: "#c9e6ff", edge: "#c9e6ff", pat: 31, bare: true, alpha: 0.85, late: true };
        if (n.kind === "i_stove") {
          var high2 = (typeof pieceHigh === "function" ? pieceHigh(n) : 0.9) * P;
          [[-0.25, -0.22], [0.25, -0.22], [-0.25, 0.2], [0.25, 0.2]].forEach(function (o, i) {
            var cx = p[0] + o[0] * n.w, cy = p[1] + o[1] * n.h, rr = Math.min(n.w, n.h) * 0.12;
            // (a ring of thin tongues, leaning out a little, flickering)
            for (var j = 0; j < 18; j++) {
              var a = j / 18 * Math.PI * 2, ux = Math.cos(a), uy = Math.sin(a), fx = cx + ux * rr, fy = cy + uy * rr, z0 = p[2] + high2 + 1.1;
              var hh = (0.02 + 0.01 * Math.sin(t * 23 + j * 1.7 + i)) * P, half = 0.32;
              model.faces.push({ pts: [[fx - uy * half, fy + ux * half, z0], [fx + uy * half, fy - ux * half, z0], [fx + ux * hh * 0.35, fy + uy * hh * 0.35, z0 + hh]],
                                 n: [ux, uy, 0.3], how: blue });
              model.faces.push({ pts: [[fx - uy * half * 0.5, fy + ux * half * 0.5, z0], [fx + uy * half * 0.5, fy - ux * half * 0.5, z0], [fx + ux * hh * 0.2, fy + uy * hh * 0.2, z0 + hh * 0.55]],
                                 n: [ux, uy, 0.3], how: core });
            }
          });
        } else {
          var z0 = p[2] + (n.stand ? MP_STAND * P : 0) + 0.08 * P, w = Math.min(n.w || 40, n.h || 40) * 0.18;
          v3Prism(model.faces, [[p[0] - w, p[1] - w], [p[0] + w, p[1] - w], [p[0] + w, p[1] + w], [p[0] - w, p[1] + w]], z0, z0 + (0.05 + 0.02 * Math.sin(t * 14)) * P, blue);
        }
        V3.useMoving = true;
      }
    });
    // (a gas range's orange glow put out: its flames are blue)
    var gasStoves = hand.nodes.filter(function (n) { return n.kind === "i_stove" && U.on[n.id] && mpGas(n); }).map(function (n) { return F.at(n).concat([n.w, n.h]); });
    if (gasStoves.length) {
      model.faces = model.faces.filter(function (f) {
        if (!f.how || f.how.color !== "#ff8a3d" || !f.pts) { return true; }
        var c = f.pts[0];
        return !gasStoves.some(function (s) { return Math.abs(c[0] - s[0]) < s[4] && Math.abs(c[1] - s[1]) < s[5]; });
      });
    }
  }
  // Run in the plan: said as each is used -- how long the hot water took, what the burner burns
  if (typeof simLight === "function") {
    var simLightMp = simLight;
    simLight = function (id, how) {
      var out = simLightMp.apply(this, arguments);
      try {
        if (how === "now") {
          var n = nodeById(id), said = "";
          if (n && MP_WET[n.kind] && MP_FLOW[n.kind]) { var f = mpFixtureOf(n); said = f && f.heater ? say("mp_run_hot", { what: kindName(n.kind).toLowerCase(), s: Math.max(1, Math.round(f.heater.n.recirc ? 2 : f.wait)), len: mpLen(f.hot) }) : f ? TXT.mp_cold_only : ""; }
          else if (n && MP_BTU[n.kind]) { said = mpBurnSays(n); }
          if (said) { setTimeout(function () { simSay(said); }, 60); }
        }
      } catch (e) { /* as it was */ }
      return out;
    };
  }

  // The models lit as they burn (40-open3d.js): a gas range's rings not red
  // hot (its flames are blue, over its grates: above); an electric water
  // heater or furnace with no flame to see through its window.
  if (typeof MODELS === "object") {
    ["i_stove", "i_waterheater", "i_furnace"].forEach(function (kind) {
      var lit = MODELS[kind];
      if (!lit) { return; }
      MODELS[kind] = function (M, W, D, H, C, n, X) {
        var gas = n && mpGas(n), unlit = X && X.state && X.state.on && (kind === "i_stove" ? gas : !gas);
        if (unlit) { X = Object.assign({}, X, { state: Object.assign({}, X.state, { on: false }) }); }
        return lit.call(this, M, W, D, H, C, n, X);
      };
    });
  }
  // ---- a drinking fountain, for the buildings that must have one ---------------------------------------------
  if (typeof V3_HIGH === "object") { V3_HIGH.i_fountain = 0.95; }
  if (typeof XRAY_WET === "object") { XRAY_WET.i_fountain = "basin"; }
  if (typeof mDef === "function") {
    mDef("i_fountain", function (M, W, D, H, C) {
      // a steel basin out from the wall, its bubbler, a push bar in front, its trap below
      C = mPick(C, "#c9ced3", "#8f969c");
      var steel = M.mat("chrome", C.main), dark = M.mat("metal", C.frame), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2, top = H, bowl = 12 * cm;
      M.box(x0, x1, y0, y1, top - bowl, top - bowl + 2 * cm, steel, 1 * cm);
      M.box(x0, x0 + 2 * cm, y0, y1, top - bowl, top, steel, 0.5 * cm);
      M.box(x1 - 2 * cm, x1, y0, y1, top - bowl, top, steel, 0.5 * cm);
      M.box(x0, x1, y0, y0 + 2 * cm, top - bowl, top + 4 * cm, steel, 0.5 * cm);
      M.box(x0, x1, y1 - 2 * cm, y1, top - bowl, top, steel, 0.5 * cm);
      M.box(-1.5 * cm, 1.5 * cm, y0 + 4 * cm, y0 + 7 * cm, top - bowl, top - 2 * cm, dark, 0.5 * cm);
      M.box(x0 + 4 * cm, x1 - 4 * cm, y1 - 1 * cm, y1 + 1.5 * cm, top - bowl - 6 * cm, top - bowl - 2 * cm, dark, 0.5 * cm);
      M.box(-4 * cm, 4 * cm, y0, y0 + 8 * cm, 0, top - bowl, dark, 1 * cm);
    });
  }
