// ---------------------------------------------------------------------------
//  40-mall.js -- a shopping mall: a long concourse down the middle of each
//  floor with shops along both sides of it, a department store at each end,
//  two or three ways in off the parking, a food court upstairs, stairs and
//  a lift, restrooms -- and escalators, a pair from each floor to the next,
//  rising through wells in the floor over them; kiosks, benches, planters,
//  the directory by each way in, a fountain
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "there needs to be more creative design and
  // like 2 or 3 entrance doors and escalators for malls")
  //
  // Start building's bands (39-starter.js): the back row of rooms, the hall,
  // the front row.  A mall is those, wide: the hall a concourse twelve metres
  // across, the rows shops; the shops fitted out each for its trade
  // (40-kinds.js), the department stores as a big store's floor is
  // (40-stores.js).  The escalators stand in the concourse, one pair to each
  // floor over the first, at alternate ends so that each floor's pair down
  // and its pair up are not in one place; each pair is linked to its top on
  // the floor over it, as a flight of stairs is to its top, so that the
  // floor over has a well cut for it (38-view3d.js) and it is walked up
  // (40-climb.js).
  var MALL_TRADES = ["boutique", "electronics", "books", "toys", "sports", "cafe", "florist", "pharmacy", "pets", "convenience", "boutique", "furniture"];
  var MALL_W = [72, 104, 140];             // metres long, by size
  var MALL_MOST = 4;                       // floors
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.mall = '<path d="M1.8 17.4h16.4M3 17.4V7.6h14v9.8M3 7.6 10 3l7 4.6M8 17.4v-4.2a2 2 0 0 1 4 0v4.2M5 10.4h2M13 10.4h2"/>';
  }
  if (typeof STARTER_ROOMS === "object") {
    STARTER_ROOMS.mallunit = { w: 9, h: 12, bw: 9, max: 30, wall: [], mid: [] };
    STARTER_ROOMS.mallanchor = { w: 22, h: 14, bw: 22, max: 40, wall: [], mid: [] };
  }
  if (typeof STARTER_ZONE === "object") { STARTER_ZONE.mallunit = "day"; STARTER_ZONE.mallanchor = "day"; }
  if (typeof STARTER_CEILING === "object") { STARTER_CEILING.mallunit = "i_pendant"; STARTER_CEILING.mallanchor = "i_pendant"; }
  if (typeof STARTER_VENTED === "object") { STARTER_VENTED.mallunit = 1; STARTER_VENTED.mallanchor = 1; }
  if (typeof TYPE_USE === "object") { TYPE_USE.mallunit = 1; TYPE_USE.mallanchor = 1; }
  // (shops, read by Check as places of work -- not a kitchen for the counter in them, 38-advice.js)
  if (typeof ROOM_USE === "object") { ROOM_USE.mallunit = "work"; ROOM_USE.mallanchor = "work"; }
  if (typeof TYPE_LIT === "object") { TYPE_LIT.mallunit = 1; TYPE_LIT.mallanchor = 1; }
  if (typeof FRONT_GLASS === "object" && FRONT_GLASS.sales) { FRONT_GLASS.mallunit = FRONT_GLASS.sales; FRONT_GLASS.mallanchor = FRONT_GLASS.sales; }
  // what else knows a building by its type: a mall is a store's
  if (typeof GROUNDS_OF === "object") { GROUNDS_OF.mall = "store"; }
  if (typeof FRONT_DOORS === "object") { FRONT_DOORS.mall = 2.8; }
  if (typeof YB_SHOPS === "object") { YB_SHOPS.mall = 1; }
  if (typeof LW_STORES === "object") { LW_STORES.mall = 1; }
  if (typeof MP_OCC === "object") { MP_OCC.mall = "mercantile"; }
  if (typeof CIVIC_FOR === "object") { CIVIC_FOR.mall = ["modern", "contemporary", "international", "artdeco", "hightech", "mission"]; }
  if (typeof starterWant === "object" && starterWant.mallFloors === undefined) { starterWant.mallFloors = 2; }

  // ---- the plan ----------------------------------------------------------------------------------
  if (typeof BUILDING_TYPES === "object") {
    BUILDING_TYPES.mall = {
      icon: "mall", style: "modern", ceil: 4.6,
      plan: function (want) {
        var S = Math.max(1, Math.min(MALL_MOST, want.mallFloors || 2)), s = Math.max(1, Math.min(3, want.size || 2)), W = MALL_W[s - 1];
        var ways = s >= 2 ? 3 : 2, floors = [], A = 22, unit = 9;
        function units(width, n0, k, row) {
          var n = Math.max(1, Math.round(width / unit)), out = [];
          for (var i = 0; i < n; i++) { out.push(R("mallunit", width / n, { label: say("mall_unit_n", { n: (k + 1) * 100 + n0 + i + (row ? 50 : 0) }) })); }
          return out;
        }
        for (var k = 0; k < S; k++) {
          // behind the concourse: a department store at each end; the core,
          // the restrooms -- and upstairs at the top, the food court -- between shops
          var core = (S > 1 ? typeCore(k, S - 1, true) : []).concat([R("restroom", 3.2), R("restroom", 3.2)]);
          // (the core the same distance along on every floor -- the food court put beside it, out of the
          // shops' side, not pushing it along: its stairs and lift stood apart from the floor's under them,
          // 2026-10-04)
          var side = (W - 2 * A - typeWidth(core)) / 2, food = [];
          if (k === S - 1 && S > 1) {
            var kit = side >= 17 ? 2 : side >= 12.6 ? 1 : 0, fw = Math.min(18, side - kit * 4.6);
            food.push(R("cafe", fw, { id: "fc" + k, label: TXT.mall_food }));
            for (var q = 0; q < kit; q++) { food.push(R("cafekitchen", 4.6, { via: q ? "fk" + k : "fc" + k, id: q ? undefined : "fk" + k })); }
          }
          var left = units(side, 1, k, false), rightW = side - typeWidth(food);
          var right = food.concat(rightW >= 3 ? units(rightW, 1 + left.length, k, false) : []);
          if (rightW > 0.01 && rightW < 3 && food.length) { food[0].w += rightW; }
          var back = [R("mallanchor", A, { label: TXT.mall_anchor })].concat(left, core, right, [R("mallanchor", A, { label: TXT.mall_anchor })]);
          // in front of it: shops, and on the ground floor the ways in between them
          var front = [];
          if (k === 0) {
            var seg = (W - ways * 8) / (ways + 1), n0 = 1;
            for (var w = 0; w <= ways; w++) {
              var u = units(seg, n0, k, true);
              n0 += u.length;
              Array.prototype.push.apply(front, u);
              if (w < ways) { front.push(R("lobby", 8, { entry: true, label: TXT.mall_entrance })); }
            }
          } else {
            front = units(W, 1, k, true);
          }
          floors.push({ level: k, back: back, front: front, H: 12, Db: 14, Df: 12 });
        }
        floors.forEach(function (f) { typeFill(f.back, W, ["mallunit"]); typeFill(f.front, W, ["mallunit"]); });
        return { floors: floors, W: W, two: S > 1, noGarage: true, mall: S };
      },
      ask: function (ui) {
        ui.stepper("mallFloors", TXT.ty_storeys, "flats", 1, MALL_MOST);
        typeSizes(ui);
      }
    };
    if (typeof TYPE_ORDER !== "undefined" && TYPE_ORDER.indexOf("mall") < 0) {
      var mallAt = TYPE_ORDER.indexOf("shop");
      TYPE_ORDER.splice(mallAt >= 0 ? mallAt + 1 : TYPE_ORDER.length, 0, "mall");
    }
  }

  // ---- fitted out ---------------------------------------------------------------------------------
  if (typeof typeFurnish === "function") {
    var mallFurnishWas = typeFurnish;
    typeFurnish = function (made, rnd, want, plan) {
      var out = mallFurnishWas.apply(this, arguments);
      if (!want || want.type !== "mall") { return out; }
      rnd = rnd || Math.random;
      try {
        // (the escalators first: what goes in the concourse after keeps clear of them)
        mallEscalators(made);
        var i = 0;
        made.forEach(function (r) {
          typeRoom = r;
          try {
            if (r.starter === "mallunit") { mallUnit(r, MALL_TRADES[i++ % MALL_TRADES.length], rnd); }
            else if (r.starter === "mallanchor") { mallAnchor(r, rnd); }
            else if (r.starter === "hall") { mallConcourse(r, made); }
            else if (r.starter === "lobby") { mallLobby(r); }
          } catch (e) { if (window.console) { console.warn("mall:", r.starter, e && e.message); } }
        });
      } catch (e) { if (window.console) { console.warn("mall:", e && e.message); } }
      typeRoom = null;
      return out;
    };
  }
  function mallMat(r, floor, color) {
    var m = Object.assign({}, r.mat || {});
    m.floor = floor; m.floorC = color; m.wall = "paint"; m.wallC = "#f2efe8";
    r.mat = m;
  }
  // A shop, for its trade (40-kinds.js's fittings, or a clothes shop's or a
  // cafe's, 39-types.js) -- and, where the concourse is behind it (the
  // front row: its way in at its back), turned round to face its door.
  function mallUnit(r, trade, rnd) {
    mallMat(r, trade === "boutique" ? "herringbone" : trade === "cafe" ? "checker" : "tiles", trade === "boutique" ? "#b48a5e" : trade === "cafe" ? "#f2f0ea" : "#dfe2e4");
    var before = hand.next, door = hand.nodes.filter(function (d) { return WALK_DOORS[d.kind] && insideArea(r, d.x, d.y, -2 * FLOOR_PX); })[0];
    var flip = door && door.y < r.y;
    if (trade === "boutique") { typeBoutique(r); }
    else if (trade === "cafe") { typeCafe(r); }
    else if (typeof TRADE_FIT === "object" && TRADE_FIT[trade]) {
      // (its fittings worked out from its door at the front: the door, while
      // they are, put where it would be in a shop facing the street)
      var keep = null;
      if (flip) { keep = door.y; door.y = r.y + (r.y - door.y); }
      try { TRADE_FIT[trade](r, rnd); } finally { if (flip) { door.y = keep; } }
    }
    if (flip) {
      hand.nodes.forEach(function (n) {
        if (n.id < before || WALK_DOORS[n.kind] || n.kind === "i_window" || !insideArea(r, n.x, n.y)) { return; }
        n.y = Math.round(r.y - (n.y - r.y));
        n.turn = ((180 - (n.turn || 0)) % 360 + 360) % 360;
      });
    }
    if (TXT["tk_floor_" + trade]) { r.text = TXT["tk_floor_" + trade]; }
    else if (trade === "boutique" && TXT.tr_boutique) { r.text = TXT.tr_boutique; }
    else if (trade === "cafe" && TXT.tr_cafe) { r.text = TXT.tr_cafe; }
  }
  // A department store: a big store's clothes, electronics and the rest.
  function mallAnchor(r, rnd) {
    mallMat(r, "terrazzo", "#e7e2d8");
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
    if (typeof stoGeneral === "function") {
      var outer = hand.nodes.some(function (o) { return o.kind === "i_room" && o.starter === "mallanchor" && o !== r && o.x < r.x && Math.abs(o.y - r.y) < 4 * P; }) ? 1 : -1;
      stoGeneral(r, b.l + T + 0.6 * P, b.r - T - 0.6 * P, b.t + T + 0.4 * P, b.b - T - 3.0 * P, outer, null, rnd);
      var c = typePut("i_cashwrap", r.x, b.b - T - 1.6 * P, 180, 2);
      if (c) { adviceAdd("i_register", c.x, c.y); }
    }
  }
  // A way in: the directory, benches, plants either side.
  function mallLobby(r) {
    mallMat(r, "terrazzo", "#e7e2d8");
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
    typePut("i_directory", r.x, r.y - 1.0 * P, 0, 2);
    [-1, 1].forEach(function (s) {
      typePut("i_bigplanter", r.x + s * (r.w / 2 - T - 1.0 * P), b.t + T + 1.0 * P, 0, 2);
      typePut("i_mallbench", r.x + s * (r.w / 2 - T - 0.5 * P), r.y + 0.6 * P, s < 0 ? 270 : 90, 2);
    });
  }
  // The concourse: down its middle, kiosks, then benches back to back round
  // a planter, a bin by them; a fountain on the ground floor; the cash
  // machines, the vending and lockers by the restrooms.
  function mallConcourse(r, made) {
    mallMat(r, "terrazzo", "#ece7dc");
    r.text = TXT.mall_concourse;
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), L = b.l + T + 3 * P, R2 = b.r - T - 3 * P, y = r.y;
    var ground = !hand.nodes.some(function (n) { return n.kind === "i_escalator" && n.escEnd === "high" && insideArea(r, n.x, n.y); });
    if (ground) { typePut("i_mallfountain", r.x + r.w * 0.22, y, 0, 4) || typePut("i_mallfountain", r.x, y, 0, 4); }
    var step = 16 * P, k = 0;
    for (var x = L + 4 * P; x <= R2 - 4 * P; x += step / 2, k++) {
      if (k % 2 === 0) { typePut("i_kiosk", x, y, 0, 3 * P); }
      else {
        var pl = typePut("i_bigplanter", x, y, 0, 1.5 * P);
        if (pl) {
          typePut("i_mallbench", x - 2.2 * P, y, 90, 0.5 * P); typePut("i_mallbench", x + 2.2 * P, y, 270, 0.5 * P);
          typePut("i_bin3", x, y + 2.2 * P, 0, 0.5 * P);
        }
      }
    }
    // along the walls by the restrooms: the cash machines, a vending machine, lockers
    hand.nodes.filter(function (n) { return n.kind === "i_room" && n.starter === "restroom" && Math.abs(n.y - r.y) < r.h / 2 + n.h / 2 + 4 && Math.abs(n.x - r.x) < r.w / 2; })
      .slice(0, 1).forEach(function (w) {
        var wy = b.t + T + 0.5 * P;
        typePut("i_atm", w.x - 3.2 * P, wy, 0, 1); typePut("i_vending", w.x + 3.2 * P, wy, 0, 1); typePut("i_lockers", w.x + 6.0 * P, wy, 0, 1);
      });
    void made;
  }
  // The escalators: a pair at one end of each floor's concourse, its top in
  // the concourse over it (where the next pair up is at the other end).
  function mallEscalators(made) {
    var all = made.filter(function (r) { return r.starter === "hall" && !r.starterCross; });
    if (all.length < 2 || !ICONS.i_escalator) { return; }
    var fl = typeof floorsOf === "function" ? floorsOf() : [];
    function level(r) { var f = fl.length ? floorAt(fl, r.x, r.y) : null; return f ? f.level : all.indexOf(r); }
    // (one concourse a floor -- the first of a floor folded round more than one, 40-forms.js --
    // or a pair was put from a concourse to the one beside it on the same floor)
    var byLevel = {}, halls = [];
    all.forEach(function (r) { var lv = level(r); if (!byLevel[lv] || r.y < byLevel[lv].y) { byLevel[lv] = r; } });
    Object.keys(byLevel).forEach(function (lv) { halls.push(byLevel[lv]); });
    if (halls.length < 2) { return; }
    halls.sort(function (a, c) { return level(a) - level(c); });
    for (var k = 0; k + 1 < halls.length; k++) {
      var lo = halls[k], hi = halls[k + 1], off = (k % 2 ? 1 : -1) * Math.min(lo.w * 0.22, 26 * FLOOR_PX);
      var a = adviceAdd("i_escalator", Math.round(lo.x + off), Math.round(lo.y), 90);
      var c = adviceAdd("i_escalator", Math.round(hi.x + off), Math.round(hi.y), 90);
      c.escEnd = "high"; a.own = c.own = true;
      hand.links.push({ from: a.id, to: c.id, label: "" });
    }
  }
  // As high as the storey it climbs, once the floors stand where they go.
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var out = yield* inner(want);
      if (want && want.type === "mall") {
        try {
          // (worked out afresh: the floors kept from before the ceilings were raised are a storey of a house, 40-smooth.js)
          var fl = typeof floorsOfSmooth === "function" ? floorsOfSmooth() : floorsOf();
          hand.links.forEach(function (l) {
            var a = nodeById(l.from), c = nodeById(l.to);
            if (!a || !c || a.kind !== "i_escalator" || c.kind !== "i_escalator") { return; }
            var fa = floorAt(fl, a.x, a.y), fc = floorAt(fl, c.x, c.y);
            if (fa && fc && fc.z > fa.z) { a.tall = c.tall = Math.round((fc.z - fa.z) / FLOOR_PX * 100) / 100; }
          });
        } catch (e) { /* as high as a storey usually is */ }
      }
      return out;
    });
  }
