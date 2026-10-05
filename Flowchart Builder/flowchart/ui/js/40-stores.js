// ---------------------------------------------------------------------------
//  40-stores.js -- big stores: a shop the size of a supercentre, with two
//  or three ways in, each with its carts and baskets, its security gates
//  and a bank of checkouts; the floor one great room in departments --
//  groceries (produce islands by the doors, the bakery and the deli, the
//  meat along the back, freezers, aisles), clothes, electronics, home,
//  toys -- the customer service desk by a door, a pharmacy, a garden
//  centre; and behind, only what serves it: receiving, the dock, the
//  offices and the staff room
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "some stores could be massive like Walmart and
  // there needs to be more creative design and like 2 or 3 entrance doors")
  //
  // Start building's shop came in three sizes, the largest 26 m by 17.  Two
  // more now: a Big box (58 m by 36, two ways in) and a Superstore (96 m by
  // 46, a garden centre at one end, three ways in).  The sales floor is made
  // of parts that are one room (40-oddrooms.js: no wall between them), the
  // parts at the ends each a way in -- each gets its own front door
  // (39-starter.js gives every room that is a way in its own).
  var STO_SIZES = [[4, "sto_big", "size4"], [5, "sto_super", "size5"]];
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      size4: '<rect x="1.6" y="5" width="16.8" height="11.6" rx="1.2"/><path d="M6.4 16.6v-3.2h2.4v3.2M11.2 16.6v-3.2h2.4v3.2"/>',
      size5: '<rect x="1" y="6" width="18" height="10.6" rx="1"/><path d="M4 16.6v-2.8h2v2.8M9 16.6v-2.8h2v2.8M14 16.6v-2.8h2v2.8M1 9h18" stroke-dasharray="1.6 1.4"/>'
    });
  }
  if (typeof STARTER_ROOMS === "object") {
    STARTER_ROOMS.gardenctr = { w: 16, h: 30, bw: 16, max: 30, wall: [], mid: [] };
  }
  if (typeof STARTER_LABEL === "object") { STARTER_LABEL.gardenctr = "sto_garden"; }
  if (typeof STARTER_ZONE === "object") { STARTER_ZONE.gardenctr = "day"; }
  if (typeof STARTER_CEILING === "object") { STARTER_CEILING.gardenctr = "i_pendant"; }
  if (typeof STARTER_VENTED === "object") { STARTER_VENTED.gardenctr = 1; }
  if (typeof TYPE_USE === "object") { TYPE_USE.gardenctr = 1; }
  if (typeof ROOM_USE === "object") { ROOM_USE.gardenctr = "work"; }
  if (typeof FRONT_GLASS === "object" && FRONT_GLASS.sales) { FRONT_GLASS.gardenctr = FRONT_GLASS.sales; }

  // ---- the sizes asked for, and the plan --------------------------------------------------------------
  if (typeof BUILDING_TYPES === "object" && BUILDING_TYPES.shop) {
    var stoAskWas = BUILDING_TYPES.shop.ask;
    BUILDING_TYPES.shop.ask = function (ui) {
      // (two more tiles after Small, Medium and Large, in the same row)
      var sizesWas = typeSizes;
      typeSizes = function (u) {
        sizesWas.apply(this, arguments);
        STO_SIZES.forEach(function (t) {
          u.tile(TXT[t[1]], t[2], function () { return (u.want.size || 2) === t[0]; }, function () { u.want.size = t[0]; }, true);
        });
      };
      try { return stoAskWas.apply(this, arguments); } finally { typeSizes = sizesWas; }
    };
    var stoPlanWas = BUILDING_TYPES.shop.plan;
    BUILDING_TYPES.shop.plan = function (want) {
      var s = want.size || 2;
      if (s < 4) { return stoPlanWas.apply(this, arguments); }
      var big = s >= 5, W = big ? 96 : 58, Df = big ? 46 : 36, Db = big ? 13 : 11, G = big ? 16 : 0;
      // behind: receiving and its dock, the offices, the staff room, the restrooms, the cash office
      var back = [R("stock", big ? 18 : 14, { id: "st", via: "M", label: TXT.sto_receiving }), R("stock", big ? 12 : 9, { via: "st", label: TXT.sto_dock }),
                  R("office", 4.0, { via: "st", label: TXT.tr_office }), R("office", 3.6, { via: "st", label: TXT.sto_cash }),
                  R("staff", 6.0, { via: "st" }), R("restroom", 3.4, { via: "M" }), R("restroom", 3.4, { via: "M" })];
      if (big) { back.splice(2, 0, R("stock", 10, { via: "M", label: TXT.sto_backroom })); }
      W = Math.max(W, typeWidth(back) + G);
      typeFill(back, W, ["stock"]);
      // in front: the parts of the one sales floor -- a way in at each end -- and the garden centre
      var floor = W - G, front = [];
      if (big) { front.push(R("gardenctr", G, { id: "G", entry: true, via: "L", label: TXT.sto_garden })); }
      var parts = big ? [["L", 0.36, "grocery"], ["M", 0.28, "home"], ["R", 0.36, "general"]] : [["L", 0.5, "grocery"], ["M", 0.5, "general"]];
      parts.forEach(function (p) {
        var more = { id: p[0], dept: p[2], label: TXT["sto_" + p[2]] };
        if (p[0] !== "M") { more.nook = true; more.via = "M"; }
        if (p[0] !== "M" || !big) { more.entry = true; }
        front.push(R("sales", floor * p[1], more));
      });
      return { floors: [{ level: 0, back: back, front: front, H: 0, Db: Db, Df: Df }], W: W, noGarage: true, stoBig: s };
    };
  }
  // ---- furnished: a big store's floor, department by department -----------------------------------------
  function stoBigNow() { return typeof kindsWant !== "undefined" && kindsWant && kindsWant.type === "shop" && (kindsWant.size || 2) >= 4; }
  if (typeof typeStore === "function") {
    var stoStoreWas = typeStore;
    typeStore = function (r, rnd) {
      if (!stoBigNow()) { return stoStoreWas.apply(this, arguments); }
      var dept = stoDeptOf(r);
      try { stoFill(r, dept, rnd || Math.random); } catch (e) { if (window.console) { console.warn("store:", e && e.message); } }
      if (TXT["sto_" + dept]) { r.text = TXT["sto_" + dept]; }
    };
  }
  // Which department a part of the floor is: a store that sells one thing
  // (40-kinds.js) all of it -- tools and furniture the home store's, books,
  // toys, electronics and sport the general one's; else from its plan (its
  // label), else by where it is.
  var STO_TRADE_DEPT = { hardware: "home", furniture: "home", florist: "home", electronics: "general", books: "general", toys: "general",
                         sports: "general", pets: "general" };
  function stoDeptOf(r) {
    var trade = kindsWant && kindsWant.storeKind;
    if (trade && STO_TRADE_DEPT[trade]) { return STO_TRADE_DEPT[trade]; }
    var names = { grocery: 1, general: 1, home: 1 }, got = null;
    Object.keys(names).forEach(function (k) { if (!got && r.text && r.text === TXT["sto_" + k]) { got = k; } });
    if (got) { return got; }
    var rooms = hand.nodes.filter(function (o) { return o.kind === "i_room" && o.starter === "sales"; }).sort(function (a, b) { return a.x - b.x; });
    var i = rooms.indexOf(r);
    return i <= 0 ? "grocery" : i === rooms.length - 1 ? "general" : "home";
  }
  // its door to the street, if it has one
  function stoDoor(r) {
    var P = FLOOR_PX;
    return hand.nodes.filter(function (d) { return d.kind === "i_door" && Math.abs(d.x - r.x) < r.w / 2 && Math.abs(d.y - (r.y + r.h / 2)) < 3 * P; })[0] || null;
  }
  function stoPut(kind, x, y, turn, gap) { return typePut(kind, x, y, turn, gap === undefined ? 2 : gap); }
  // A run of one piece along a line from (x0, y) to (x1, y), as many as fit, `gap` apart.
  function stoRow(kind, x0, x1, y, turn, gap) {
    var icon = ICONS[kind], out = [];
    if (!icon) { return out; }
    var q = turned({ w: icon.box[0], h: icon.box[1], turn: turn || 0 }), step = q.w + (gap || 0);
    var n = Math.floor((x1 - x0 + (gap || 0)) / step);
    if (n < 1) { return out; }
    var start = (x0 + x1) / 2 - (n * step - (gap || 0)) / 2 + q.w / 2;
    for (var i = 0; i < n; i++) { var p = stoPut(kind, start + i * step, y, turn, 1); if (p) { out.push(p); } }
    return out;
  }
  // The same down a line from (x, y0) to (x, y1).
  function stoCol(kind, x, y0, y1, turn, gap) {
    var icon = ICONS[kind], out = [];
    if (!icon) { return out; }
    var q = turned({ w: icon.box[0], h: icon.box[1], turn: turn || 0 }), step = q.h + (gap || 0);
    var n = Math.floor((y1 - y0 + (gap || 0)) / step);
    for (var i = 0; i < n; i++) { var p = stoPut(kind, x, y0 + q.h / 2 + i * step, turn, 1); if (p) { out.push(p); } }
    return out;
  }
  // Aisles: runs of gondola shelving front to back across a stretch, a
  // cross aisle half way down a long one, an end cap at each end of a run.
  function stoAisles(x0, x1, y0, y1, aisle, caps) {
    var P = FLOOR_PX, g = ICONS.i_gondola, gw = g.box[1], gl = g.box[0], ec = ICONS.i_endcap, eh = ec ? ec.box[1] : 0, put = 0;
    var top = y0 + (caps ? eh : 0), foot = y1 - (caps ? eh : 0);
    for (var ax = x0 + gw / 2; ax <= x1 - gw / 2; ax += gw + aisle) {
      var units = Math.floor((foot - top) / gl), mid = units > 9 ? Math.floor(units / 2) : -1, runs = [[top, null]];
      for (var u = 0; u < units; u++) {
        if (u === mid) { runs.push([top + (u + 1) * gl, top + u * gl]); continue; }        // the cross aisle
        if (stoPut("i_gondola", ax, top + gl / 2 + u * gl, 90, 0)) { put++; }
      }
      if (caps && ec && units > 1) {
        stoPut("i_endcap", ax, top - eh / 2, 180, 0);
        stoPut("i_endcap", ax, top + units * gl + eh / 2, 0, 0);
        if (mid >= 0) { stoPut("i_endcap", ax, top + mid * gl + eh / 2 - 2, 0, 0); stoPut("i_endcap", ax, top + (mid + 1) * gl - eh / 2 + 2, 180, 0); }
      }
    }
    return put;
  }
  // Islands of one piece in a grid across a stretch, `gx` and `gy` apart.
  function stoIslands(kind, x0, x1, y0, y1, gx, gy, turn) {
    var icon = ICONS[kind], out = [];
    if (!icon) { return out; }
    var q = turned({ w: icon.box[0], h: icon.box[1], turn: turn || 0 });
    var cols = Math.floor((x1 - x0 + gx) / (q.w + gx)), rows = Math.floor((y1 - y0 + gy) / (q.h + gy));
    if (cols < 1 || rows < 1) { return out; }
    var sx = (x0 + x1) / 2 - (cols * (q.w + gx) - gx) / 2 + q.w / 2, sy = (y0 + y1) / 2 - (rows * (q.h + gy) - gy) / 2 + q.h / 2;
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) { var p = stoPut(kind, sx + i * (q.w + gx), sy + j * (q.h + gy), turn, 2); if (p) { out.push(p); } }
    }
    return out;
  }

  // A part of the floor fitted out, from the front: the way in (carts
  // nested each side of the doors, baskets, the security gates across
  // them, customer service and the cash machine beside them), the bank of
  // checkouts across the store -- an island of self-checkouts on the side
  // toward the middle of the store, staffed lanes the rest of the way to
  // the walls -- the main aisle behind them, and then the department.
  function stoFill(r, dept, rnd) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), L = b.l + T + 0.6 * P, Rr = b.r - T - 0.6 * P, top = b.t + T + 0.4 * P, foot = b.b - T;
    var door = stoDoor(r), dx = door ? door.x : null, wide = door ? Math.max(door.w, 2.4 * P) : 0;
    // (the outer side of the store, where the department's own counters go: -1 left, 1 right, 0 a middle part)
    var rooms = hand.nodes.filter(function (o) { return o.kind === "i_room" && o.starter === "sales"; });
    var outer = rooms.every(function (o) { return o.x >= r.x - 2; }) ? -1 : rooms.every(function (o) { return o.x <= r.x + 2; }) ? 1 : 0;
    var kw = ICONS.i_checkout.box[0], kh = ICONS.i_checkout.box[1], lineY = foot - 6.5 * P;
    if (door) {
      stoPut("i_secgate", dx, foot - 0.9 * P, 0, 0);
      [-1, 1].forEach(function (s) {
        var cx = dx + s * (wide / 2 + 2.0 * P);
        for (var k = 0; k < 6; k++) {
          stoPut("i_cart", cx + s * k * 0.34 * P, foot - 1.3 * P, s < 0 ? 90 : 270, -40);
          stoPut("i_cart", cx + s * k * 0.34 * P, foot - 2.4 * P, s < 0 ? 90 : 270, -40);
        }
        stoPut("i_basketstack", dx + s * (wide / 2 + 0.7 * P), foot - 1.0 * P, 0, 0);
      });
      var inSide = outer ? -outer : 1;                  // toward the middle of the store
      // customer service on the outer side, between the carts and the wall; the cash machine by it
      var svx = dx - inSide * (wide / 2 + 8.0 * P);
      var desk = stoPut("i_servicedesk", svx, foot - 1.4 * P, 180, 2) || stoPut("i_servicedesk", dx + inSide * (wide / 2 + 8.0 * P), foot - 1.4 * P, 180, 2);
      if (desk) { stoPut("i_stanchion", desk.x, desk.y - 1.9 * P, 0, 1); stoPut("i_atm", desk.x - inSide * (ICONS.i_servicedesk.box[0] / 2 + 1.0 * P), foot - 0.5 * P, 180, 1); }
      // self-checkouts: two rows back to back, eight in all, just inside the way in
      var s0 = dx + inSide * (wide / 2 + 1.6 * P), s1 = s0 + inSide * 6.4 * P;
      stoRow("i_selfcheckout", Math.min(s0, s1), Math.max(s0, s1), lineY - 0.9 * P, 0, 0.6 * P);
      stoRow("i_selfcheckout", Math.min(s0, s1), Math.max(s0, s1), lineY + 0.9 * P, 180, 0.6 * P);
      // staffed lanes: on from the self-checkouts to the wall, and from the doors to the other wall
      var lanes = 0;
      function laneRun(from, way, stop) {
        for (var x = from + way * kw / 2; way < 0 ? x - kw / 2 > stop : x + kw / 2 < stop; x += way * (kw + 1.2 * P)) {
          if (stoPut("i_checkout", x, lineY, 180, 1)) { lanes++; if (lanes % 3 === 0) { stoPut("i_magrack", x + way * (kw / 2 + 0.5 * P), lineY - kh / 2 - 0.6 * P, 0, 0); } }
        }
      }
      laneRun(s1 + inSide * 1.6 * P, inSide, inSide < 0 ? L : Rr);
      laneRun(dx - inSide * (wide / 2 + 2.0 * P), -inSide, inSide < 0 ? Rr : L);
      stoPut("i_vending", dx + inSide * (wide / 2 + 0.8 * P), foot - 3.7 * P, 180, 1);
    } else {
      lineY = foot + 1.0 * P;                          // (no doors of its own: the department runs to the front)
    }
    var deptFoot = door ? lineY - kh / 2 - 3.0 * P : foot - 1.4 * P;
    if (dept === "grocery") { stoGrocery(r, L, Rr, top, deptFoot, outer, dx, rnd); }
    else if (dept === "home") { stoHome(r, L, Rr, top, deptFoot); }
    else { stoGeneral(r, L, Rr, top, deptFoot, outer, dx, rnd); }
  }
  // Groceries: the meat along the back wall between runs of coolers; the
  // bakery, the deli and the pharmacy down the outer wall; wine down the
  // other; at the front produce islands on the side nearest the doors and
  // freezers on the other; aisles of everything else between.
  function stoGrocery(r, L, R2, top, foot, outer, dx, rnd) {
    var P = FLOOR_PX, side = outer || -1, mid = (L + R2) / 2, mc = ICONS.i_meatcase, cool = ICONS.i_cooler;
    var meatW = Math.min((R2 - L) * 0.3, 4 * mc.box[0]);
    stoRow("i_meatcase", mid - meatW / 2, mid + meatW / 2, top + mc.box[1] / 2, 0, 0);
    stoRow("i_cooler", L, mid - meatW / 2 - 0.3 * P, top + cool.box[1] / 2, 0, 0);
    stoRow("i_cooler", mid + meatW / 2 + 0.3 * P, R2, top + cool.box[1] / 2, 0, 0);
    // down the outer wall: the bakery, the deli, then the pharmacy -- its counter out from the wall, shelves behind, chairs
    var wx = side < 0 ? L : R2, turn = side < 0 ? 270 : 90, y = top + cool.box[1] + 2.4 * P;
    ["i_bakerycase", "i_bakerycase", "i_delicase", "i_delicase"].forEach(function (k, i) {
      var icon = ICONS[k], q = turned({ w: icon.box[0], h: icon.box[1], turn: turn });
      if (stoPut(k, wx - side * q.w / 2, y + q.h / 2, turn, 0)) { y += q.h; }
      if (i === 1) { y += 1.6 * P; }
    });
    var py = y + 2.4 * P;
    if (py + 6 * P < foot - 6 * P) {
      stoCol("i_shelving", wx - side * 0.45 * P, py, py + 6 * P, turn, 0);
      var pc = stoPut("i_counter", wx - side * 2.6 * P, py + 1.2 * P, turn, 1);
      stoPut("i_counter", wx - side * 2.6 * P, py + 3.3 * P, turn, 1);
      if (pc) { adviceAdd("i_register", pc.x, pc.y); }
      stoCol("i_chair", wx - side * 4.6 * P, py + 0.4 * P, py + 4.4 * P, side < 0 ? 270 : 90, 0.3 * P);
    }
    var ow = side < 0 ? R2 : L;
    stoCol("i_winerack", ow + side * 0.25 * P, top + cool.box[1] + 2.4 * P, top + cool.box[1] + 14 * P, side < 0 ? 90 : 270, 0);
    // the front band: produce by the doors, freezers away from them
    var x0 = side < 0 ? L + 6.4 * P : L + 1.6 * P, x1 = side < 0 ? R2 - 1.6 * P : R2 - 6.4 * P, fy0 = foot - 6.0 * P;
    var doorX = dx === null ? (x0 + x1) / 2 : dx, split = Math.max(x0 + 6 * P, Math.min(x1 - 6 * P, doorX + (doorX > (x0 + x1) / 2 ? -1 : 1) * 2 * P));
    var pa = doorX > (x0 + x1) / 2 ? [split, x1] : [x0, split], fa = doorX > (x0 + x1) / 2 ? [x0, split - 1.6 * P] : [split + 1.6 * P, x1];
    stoIslands("i_produce", pa[0], pa[1], fy0, foot, 1.6 * P, 1.5 * P, 0);
    stoIslands("i_chestfreezer", fa[0], fa[1], fy0, foot, 1.5 * P, 1.4 * P, 0);
    stoAisles(x0 + 1.0 * P, x1 - (side < 0 ? 2.0 : 1.0) * P, top + cool.box[1] + 2.6 * P, fy0 - 2.6 * P, 2.4 * P, true);
    void rnd;
  }
  // Home and hardware: pallet racking up the back wall, aisles with end caps.
  function stoHome(r, L, R2, top, foot) {
    var P = FLOOR_PX, pr = ICONS.i_palletrack;
    stoRow("i_palletrack", L, R2, top + pr.box[1] / 2, 0, 0);
    stoAisles(L + 1.4 * P, R2 - 1.4 * P, top + pr.box[1] + 3 * P, foot, 2.6 * P, true);
  }
  // Clothes and electronics at the front -- clothes on the outer side, round
  // racks with mannequins, rails down the wall; electronics toward the
  // middle, displays and glass cases -- jewelry between; toys, housewares
  // and the rest in aisles behind, TVs along the back wall.
  function stoGeneral(r, L, R2, top, foot, outer, dx, rnd) {
    var P = FLOOR_PX, side = outer || 1, wx = side < 0 ? L : R2, turn = side < 0 ? 270 : 90;
    var band = Math.min(13 * P, (foot - top) * 0.45), f0 = foot - band, half = (L + R2) / 2;
    var ax0 = side < 0 ? L + 2.6 * P : half + 1.0 * P, ax1 = side < 0 ? half - 1.0 * P : R2 - 2.6 * P;
    var racks = stoIslands("i_roundrack", ax0, ax1, f0 + 1.6 * P, foot, 1.3 * P, 1.3 * P, 0);
    if (racks.length) {
      var ys = racks.map(function (n) { return n.y; }), y0 = Math.min.apply(null, ys);
      racks.filter(function (n) { return n.y === y0; }).forEach(function (n, i) { if (i % 2 === 0) { stoPut("i_mannequin", n.x, y0 - 1.5 * P, 0, 1); } });
    }
    stoCol("i_closetrod", wx - side * 0.6 * P, f0, foot, turn, 0.2 * P);
    var ex0 = side < 0 ? half + 1.0 * P : L + 1.0 * P, ex1 = side < 0 ? R2 - 1.0 * P : half - 1.0 * P;
    stoIslands("i_display", ex0, ex1, f0 + 1.0 * P, foot - 2.2 * P, 2.2 * P, 2.0 * P, 0).forEach(function (n) { n.plain = true; });
    stoRow("i_glasscase", ex0, ex1, foot - 0.7 * P, 180, 0.8 * P);
    stoRow("i_jewelcase", half - 4 * P, half + 4 * P, f0 - 0.8 * P, 180, 0.3 * P);
    stoRow("i_walltv", L + 2 * P, R2 - 2 * P, top - 0.2 * P, 0, 1.4 * P);
    stoAisles(L + 1.4 * P, R2 - 1.4 * P, top + 2.4 * P, f0 - 2.6 * P, 2.4 * P, true);
    if (dx !== null) { stoPut("i_kidride", dx + side * 3.2 * P, foot + 2.6 * P, 0, 2); }
    void rnd;
  }
  // The garden centre: tables of plants in rows, trees in tubs, benches, pots along the walls.
  if (typeof typeFurnish === "function") {
    var stoFurnishWas = typeFurnish;
    typeFurnish = function (made, rnd, want, plan) {
      var out = stoFurnishWas.apply(this, arguments);
      try {
        made.forEach(function (r) {
          if (r.starter !== "gardenctr") { return; }
          typeRoom = r;
          var m = Object.assign({}, r.mat || {});
          m.floor = "concrete"; m.floorC = "#b9b6ae"; r.mat = m;
          stoGarden(r);
          if (typeof typeLights === "function") { typeLights(r); }
        });
      } catch (e) { if (window.console) { console.warn("garden centre:", e && e.message); } }
      typeRoom = null;
      return out;
    };
  }
  function stoGarden(r) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), L = b.l + T + 0.8 * P, R2 = b.r - T - 0.8 * P, top = b.t + T + 0.6 * P, foot = b.b - T;
    var door = stoDoor(r), dx = door ? door.x : r.x;
    stoRow("i_bigplanter", L, R2, top + 0.9 * P, 0, 1.6 * P);
    stoCol("i_plant", L + 0.4 * P, top + 3 * P, foot - 4 * P, 270, 0.3 * P);
    stoCol("i_plant", R2 - 0.4 * P, top + 3 * P, foot - 4 * P, 90, 0.3 * P);
    var tables = stoIslands("i_display", L + 2 * P, R2 - 2 * P, top + 4 * P, foot - 7 * P, 2.0 * P, 2.0 * P, 90);
    tables.forEach(function (n) { n.plain = false; });
    stoRow("i_planter", L + 2 * P, R2 - 2 * P, foot - 5.4 * P, 0, 0.8 * P);
    var till = stoPut("i_cashwrap", dx + 4 * P, foot - 2.2 * P, 180, 2) || stoPut("i_cashwrap", dx - 4 * P, foot - 2.2 * P, 180, 2);
    if (till) { adviceAdd("i_register", till.x, till.y); }
    stoPut("i_gardenbench", dx - 4 * P, foot - 1.4 * P, 180, 2);
  }

  // ---- the outside: tall enough, and a way in you can see from the road ---------------------------------
  // A big store is a tall box (seven metres to its roof, not a shop's
  // three and a half); each way in is a portal -- two piers rising past
  // the roof, a lit sign across their top, a canopy over the doors on two
  // slim posts -- and a band of the store's color runs the length of its
  // front.  The colors are the store's own, one of a few, by its number.
  if (typeof starterPlan === "function") {
    var stoCeilWas = starterPlan;
    starterPlan = function (want) {
      var plan = stoCeilWas.apply(this, arguments);
      if (plan && plan.stoBig) { plan.ceil = plan.stoBig >= 5 ? 7.0 : 6.2; }
      return plan;
    };
  }
  var STO_BRANDS = [["#1f5fa8", "#f2c94c"], ["#c43c3a", "#f4f4f1"], ["#2f7d4f", "#f4f4f1"], ["#e2731f", "#2f3236"], ["#5b3f8f", "#f2c94c"], ["#0f7d8c", "#f4f4f1"]];
  function stoBigLots() {
    return hand.nodes.filter(function (n) { return n.kind === "i_lot" && n.madeWith && n.madeWith.type === "shop" && (n.madeWith.size || 2) >= 4; });
  }
  if (typeof v3Build === "function") {
    var v3BuildSto = v3Build;
    v3Build = function () {
      var model = v3BuildSto.apply(this, arguments);
      try { if (V3 && V3.scene !== "space" && model && model.faces) { stoFronts(model.faces); } } catch (e) { /* the box as it is */ }
      return model;
    };
  }
  function stoFronts(faces) {
    var lots = stoBigLots();
    if (!lots.length) { return; }
    var P = FLOOR_PX;
    lots.forEach(function (lot) {
      var brand = STO_BRANDS[Math.abs(lot.madeWith.seed || 0) % STO_BRANDS.length];
      var main = { piece: true, color: brand[0], edge: v3Mix(brand[0], "#000000", 0.3), pat: 27 };
      var trim = { piece: true, color: "#e9e7e2", edge: "#b9b6ae", pat: 10 };
      var lit = { piece: true, color: "#f8f6ef", edge: "#f8f6ef", pat: 31 }, letter = { piece: true, color: brand[0], edge: brand[0], pat: 27 };
      var accent = { piece: true, color: brand[1], edge: v3Mix(brand[1], "#000000", 0.2), pat: 27 };
      var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room" && (r.use === "sales" || r.use === "gardenctr") && !r.turn && insideArea(lot, r.x, r.y); });
      if (!rooms.length) { return; }
      var ceil = Math.max.apply(null, rooms.map(function (r) { return (r.ceil || 3.4); })) * P;
      var x0 = Math.min.apply(null, rooms.map(function (r) { return r.x - r.w / 2; })), x1 = Math.max.apply(null, rooms.map(function (r) { return r.x + r.w / 2; }));
      var fy = Math.max.apply(null, rooms.map(function (r) { return r.y + r.h / 2; })) + 0.12 * P;
      // the band along the top of the front
      v3Prism(faces, [[x0, fy], [x1, fy], [x1, fy + 0.12 * P], [x0, fy + 0.12 * P]], ceil - 1.1 * P, ceil - 0.25 * P, main);
      v3Prism(faces, [[x0, fy + 0.12 * P], [x1, fy + 0.12 * P], [x1, fy + 0.16 * P], [x0, fy + 0.16 * P]], ceil - 0.4 * P, ceil - 0.25 * P, trim);
      hand.nodes.forEach(function (d) {
        if (!WALK_DOORS[d.kind] || !rooms.some(function (r) { return Math.abs(d.x - r.x) < r.w / 2 && Math.abs(d.y - (r.y + r.h / 2)) < 2 * P; })) { return; }
        var half = Math.max(d.w || 0, 2.6 * P) / 2 + 1.6 * P, top = ceil + 2.4 * P, deep = 1.1 * P, cx = d.x;
        // the piers, the head across them, its sign
        [-1, 1].forEach(function (s) {
          var px = cx + s * (half - 0.5 * P);
          v3Prism(faces, [[px - 0.5 * P, fy], [px + 0.5 * P, fy], [px + 0.5 * P, fy + deep], [px - 0.5 * P, fy + deep]], 0, top, main);
          v3Prism(faces, [[px - 0.56 * P, fy + deep - 0.06 * P], [px + 0.56 * P, fy + deep - 0.06 * P], [px + 0.56 * P, fy + deep + 0.04 * P], [px - 0.56 * P, fy + deep + 0.04 * P]], 0, 0.9 * P, trim);
        });
        v3Prism(faces, [[cx - half, fy], [cx + half, fy], [cx + half, fy + deep], [cx - half, fy + deep]], ceil - 0.6 * P, top, main);
        var sz0 = ceil + 0.3 * P, sz1 = top - 0.4 * P, sx0 = cx - half + 1.3 * P, sx1 = cx + half - 1.3 * P;
        v3Prism(faces, [[sx0, fy + deep], [sx1, fy + deep], [sx1, fy + deep + 0.06 * P], [sx0, fy + deep + 0.06 * P]], sz0, sz1, lit);
        // its name, in letters of the store's color, and a stroke of its second color under them
        var n = 6, lw = (sx1 - sx0 - 0.8 * P) / n;
        for (var k = 0; k < n; k++) {
          var lx = sx0 + 0.4 * P + k * lw + lw * 0.12, lh = (k % 3 === 1 ? 0.62 : 0.78) * (sz1 - sz0);
          v3Prism(faces, [[lx, fy + deep + 0.06 * P], [lx + lw * 0.76, fy + deep + 0.06 * P], [lx + lw * 0.76, fy + deep + 0.1 * P], [lx, fy + deep + 0.1 * P]],
                  sz0 + 0.3 * (sz1 - sz0) - 0.05 * P, sz0 + 0.3 * (sz1 - sz0) - 0.05 * P + lh * 0.62, letter);
        }
        v3Prism(faces, [[sx0 + 0.4 * P, fy + deep + 0.06 * P], [sx1 - 0.4 * P, fy + deep + 0.06 * P], [sx1 - 0.4 * P, fy + deep + 0.1 * P], [sx0 + 0.4 * P, fy + deep + 0.1 * P]],
                sz0 + 0.1 * (sz1 - sz0), sz0 + 0.2 * (sz1 - sz0), accent);
        // the canopy over the doors, out over the walk, on two posts
        var cz = Math.min(4.2 * P, ceil - 1.4 * P), out = 3.2 * P;
        v3Prism(faces, [[cx - half + 1.0 * P, fy + deep], [cx + half - 1.0 * P, fy + deep], [cx + half - 1.0 * P, fy + out], [cx - half + 1.0 * P, fy + out]], cz, cz + 0.35 * P, main);
        v3Prism(faces, [[cx - half + 1.0 * P, fy + out - 0.05 * P], [cx + half - 1.0 * P, fy + out - 0.05 * P], [cx + half - 1.0 * P, fy + out + 0.05 * P], [cx - half + 1.0 * P, fy + out + 0.05 * P]], cz + 0.05 * P, cz + 0.3 * P, lit);
        [-1, 1].forEach(function (s) {
          var px = cx + s * (half - 1.3 * P), py = fy + out - 0.3 * P;
          v3Prism(faces, [[px - 0.1 * P, py - 0.1 * P], [px + 0.1 * P, py - 0.1 * P], [px + 0.1 * P, py + 0.1 * P], [px - 0.1 * P, py + 0.1 * P]], 0, cz, trim);
        });
      });
    });
  }
