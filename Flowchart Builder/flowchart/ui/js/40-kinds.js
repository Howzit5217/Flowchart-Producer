// ---------------------------------------------------------------------------
//  40-kinds.js -- what a building is for, room by room: a shop that sells
//  something in particular (groceries, tools, books, flowers ...) and is
//  fitted out for it; an office whose floors are not all the same (the
//  reception and the training room, open plan, cubicles, the boardroom);
//  a school whose rooms are for their subjects (a science lab, a computer
//  lab, an art room, a music room, a library) -- and a projector and its
//  screen wherever people meet to be shown something
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "the store you can set what type of store it is
  // selling", "each floor should be different ... for like schools and
  // office buildings ... some are science, math, etc and some are meeting
  // rooms, cubicles, etc. It needs to cover all bases ... and to add
  // projectors too")
  var kindsWant = null;                  // what the building being made was asked to be
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var was = kindsWant;
      kindsWant = want;
      try { return yield* inner(want); } finally { kindsWant = was; }
    });
  }
  // A piece of a given size put where it fits in the room being furnished
  // (typeRoom, 39-types.js), clear of the rest -- or null.
  function kindsPut(kind, x, y, turn, gap, w, h) {
    var icon = ICONS[kind];
    if (!icon) { return null; }
    var spot = { kind: kind, x: Math.round(x), y: Math.round(y), w: w || icon.box[0], h: h || icon.box[1], turn: turn || 0 };
    if (typeRoom) {
      var q = turned(spot), b = tieBox(typeRoom), T = roomWallOf(typeRoom) + 2;
      if (spot.x - q.w / 2 < b.l + T || spot.x + q.w / 2 > b.r - T || spot.y - q.h / 2 < b.t + T || spot.y + q.h / 2 > b.b - T) { return null; }
    }
    if (!FROM_CEILING[kind] && !ON_THE_WALL[kind] && !typeClear(spot, gap === undefined ? 3 : gap)) { return null; }
    var n = adviceAdd(kind, spot.x, spot.y, spot.turn);
    if (w || h) { n.w = spot.w; n.h = spot.h; n.own = true; }
    return n;
  }
  // The door into a room from the street or the hall: the way in to keep clear.
  function kindsDoor(r) {
    var P = FLOOR_PX;
    return hand.nodes.filter(function (d) { return WALK_DOORS[d.kind] && insideArea(r, d.x, d.y, -2 * P); })
      .sort(function (p, q) { return q.y - p.y; })[0] || null;
  }
  // Against a wall, its back to it, as near `near` as there is room (starterAlong).
  function kindsAlong(r, kind, near) {
    var put = typeof starterAlong === "function" ? starterAlong(r, kind, near) : null;
    if (!put) { return null; }
    var before = hand.nodes.length;
    put();
    return hand.nodes.length > before ? hand.nodes[hand.nodes.length - 1] : null;
  }
  // Something to show things on: a screen on the wall `near` is by (or
  // the wall across from the door), and a projector on the ceiling three
  // metres out from it.
  function kindsShow(r, near) {
    var P = FLOOR_PX, b = tieBox(r);
    var screen = kindsAlong(r, "i_proscreen", near || { x: r.x, y: b.t });
    if (!screen) { screen = kindsAlong(r, "i_walltv", near || { x: r.x, y: b.t }); }
    if (!screen) { return null; }
    var a = (screen.turn || 0) * Math.PI / 180, fx = -Math.sin(a), fy = Math.cos(a);
    var reach = Math.min(3.2 * P, (Math.abs(fx) > 0.5 ? r.w : r.h) * 0.45);
    if (screen.kind === "i_proscreen") { adviceAdd("i_projector", Math.round(screen.x + fx * reach), Math.round(screen.y + fy * reach), screen.turn || 0); }
    return screen;
  }

  // ---- shops: what each sells ---------------------------------------------------------------
  var TRADE_KINDS = ["grocery", "convenience", "pharmacy", "hardware", "electronics", "books", "furniture", "florist", "toys", "sports", "pets"];
  // The till: checkouts in a row for a big shop, a counter with its
  // register for a small one -- by the way in, a way left open to the door.
  function tradeTill(r, lanes) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), door = kindsDoor(r), dx = door ? door.x : r.x;
    if (lanes) {
      var kw = ICONS.i_checkout.box[0], kh = ICONS.i_checkout.box[1], ky = b.b - T - 2.0 * P - kh / 2, made = 0;
      for (var k = 0; k < 12 && made < lanes; k++) {
        var cx = dx - 2.0 * P - kw / 2 - k * (kw + 1.2 * P);
        if (cx - kw / 2 < b.l + T + 0.6 * P) { break; }
        if (kindsPut("i_checkout", cx, ky, 180)) { made++; }
      }
      return ky - kh / 2;
    }
    var side = dx > r.x ? -1 : 1, cx2 = dx + side * 2.6 * P, cy = b.b - T - 2.2 * P;
    var c = kindsPut("i_counter", cx2, cy, 180) || kindsPut("i_counter", dx - side * 2.6 * P, cy, 180);
    if (c) { adviceAdd("i_register", c.x, c.y); }
    return cy - 0.4 * P;
  }
  // Rows of one piece across a stretch of the room, `gap` between rows.
  function tradeRows(r, kind, turn, y0, y1, gapX, gapY, edge) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), icon = ICONS[kind], q = turned({ w: icon.box[0], h: icon.box[1], turn: turn });
    var door = kindsDoor(r), out = [];
    for (var y = y0 + q.h / 2; y <= y1 - q.h / 2; y += q.h + gapY) {
      for (var x = b.l + T + (edge || 1.4) * P + q.w / 2; x <= b.r - T - (edge || 1.4) * P - q.w / 2; x += q.w + gapX) {
        if (door && Math.abs(x - door.x) < q.w / 2 + 1.2 * P && y > b.b - T - 4 * P) { continue; }   // the way in
        var n = kindsPut(kind, x, y, turn, 2);
        if (n) { out.push(n); }
      }
    }
    return out;
  }
  // Along the walls: the back, then the sides, as many as fit.
  function tradeWalls(r, kind, count) {
    var b = tieBox(r), out = [];
    [{ x: r.x, y: b.t }, { x: b.l, y: r.y }, { x: b.r, y: r.y }, { x: b.l, y: b.t }, { x: b.r, y: b.t }].forEach(function (near) {
      for (var i = 0; i < count && out.length < count * 3; i++) {
        var n = kindsAlong(r, kind, near);
        if (!n) { break; }
        out.push(n);
      }
    });
    return out;
  }
  var TRADE_FIT = {
    // a corner shop: coolers along the back, a counter by the door with its
    // coffee, a few short aisles, snacks on a stand by the way in
    convenience: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), ch = ICONS.i_cooler.box[1];
      for (var x = b.l + T + 0.4 * P + 60; x < b.r - T - 60; x += 122) { kindsPut("i_cooler", x, b.t + T + ch / 2 + 2, 0); }
      var front = tradeTill(r, 0);
      var c = hand.nodes.filter(function (n) { return n.kind === "i_counter" && insideArea(r, n.x, n.y); })[0];
      if (c) { kindsPut("i_counter", c.x + (c.x > r.x ? -100 : 100), c.y, 180) && adviceAdd("i_coffeemaker", c.x + (c.x > r.x ? -100 : 100), c.y); }
      tradeRows(r, "i_gondola", 90, b.t + T + ch + 1.6 * P, front - 1.8 * P, 1.4 * P, 0.0, 1.6);
      var door = kindsDoor(r);
      if (door) { kindsPut("i_display", door.x + (door.x > r.x ? -2.6 : 2.6) * P, front - 0.6 * P, 0); }
    },
    // a chemist's: the pharmacy counter at the back with its shelves behind,
    // chairs to wait in by it, aisles, the till at the front
    pharmacy: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      for (var x = r.x - 2 * 100; x <= r.x + 2 * 100; x += 102) { kindsPut("i_shelving", x, b.t + T + 22, 0, 1); }
      for (var x2 = r.x - 100; x2 <= r.x + 100; x2 += 100) {
        var c = kindsPut("i_counter", x2, b.t + T + 2.3 * P, 180, 1);
        if (c && x2 === r.x) { adviceAdd("i_register", c.x, c.y); adviceAdd("i_monitor", c.x + 30, c.y); }
      }
      for (var k = 0; k < 3; k++) { kindsPut("i_chair", b.l + T + 1.0 * P + k * 0.7 * P, b.t + T + 3.4 * P, 0, 1); }
      var front = tradeTill(r, Math.max(1, Math.min(3, Math.floor(r.w / (8 * FLOOR_PX)))));
      tradeRows(r, "i_gondola", 90, b.t + T + 4.6 * P, front - 1.8 * P, 1.6 * P, 0, 1.8);
    },
    // a hardware store: tall racks in rows, wide aisles for a flatbed cart,
    // the trade counter where keys are cut and paint mixed, tool chests on show
    hardware: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      tradeWalls(r, "i_shelving", 4);
      var bench = kindsAlong(r, "i_workbench", { x: b.r, y: b.t + 3 * P });
      var front = tradeTill(r, Math.max(1, Math.min(4, Math.floor(r.w / (7 * P)))));
      tradeRows(r, "i_shelving", 90, b.t + T + 2.2 * P, front - 2.2 * P, 2.0 * P, 0, 2.2);
      var door = kindsDoor(r);
      for (var k = 0; k < 3; k++) { kindsPut("i_toolchest", (door ? door.x : r.x) + (k - 1) * 1.6 * P + 3.2 * P, front - 1.2 * P, 180); }
      return bench;
    },
    // an electronics store: televisions along the walls, tables of laptops
    // and phones, speakers, a counter
    electronics: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      tradeWalls(r, "i_walltv", 4);
      // (a television on its own unit, as a house's: not stood inside a TV stand)
      tradeWalls(r, "i_tv", 2);
      var front = tradeTill(r, 0);
      tradePlain(tradeRows(r, "i_display", 0, b.t + T + 2.6 * P, front - 1.6 * P, 1.6 * P, 1.6 * P, 2.0)).forEach(function (t, i) {
        adviceAdd(i % 3 === 2 ? "i_tablet" : "i_laptop", t.x - 25, t.y);
        adviceAdd(i % 2 ? "i_phone" : "i_laptop", t.x + 25, t.y);
      });
      kindsAlong(r, "i_speaker", { x: b.l, y: b.t }); kindsAlong(r, "i_speaker", { x: b.r, y: b.t });
    },
    // a bookshop: bookcases round the walls and in rows, tables of new
    // books by the door, armchairs in a corner to read in
    books: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      tradeWalls(r, "i_bookcase", 6);
      var front = tradeTill(r, 0);
      for (var y = b.t + T + 2.4 * P; y < front - 4.6 * P; y += 2.8 * P) {
        for (var x = b.l + T + 2.2 * P; x < b.r - T - 2.2 * P; x += 52) {
          kindsPut("i_bookcase", x, y, 0, 1); kindsPut("i_bookcase", x, y + 22, 180, 1);
        }
      }
      tradePlain(tradeRows(r, "i_display", 0, front - 3.6 * P, front - 1.2 * P, 1.8 * P, 1 * P, 2.4)).forEach(function (t) { adviceAdd("i_books", t.x, t.y); });
      kindsPut("i_armchair", b.l + T + 1.0 * P, b.b - T - 3.6 * P, 90, 2); kindsPut("i_armchair", b.l + T + 1.0 * P, b.b - T - 2.6 * P, 90, 2);
    },
    // a furniture store: rooms set out to show -- a sofa on a rug with its
    // table and chair, a bed with its nightstands, a dining table and chairs
    furniture: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), front = tradeTill(r, 0);
      var sets = [["i_sofa", "i_coffee", "i_armchair"], ["i_bed", "i_nightstand", "i_nightstand"], ["i_dining"], ["i_sectional", "i_coffee"], ["i_bedking", "i_nightstand"], ["i_desk", "i_officechair", "i_bookcase"]];
      var cell = 5.2 * P, k = 0;
      for (var y = b.t + T + 0.4 * P + cell / 2; y < front - cell / 2; y += cell) {
        for (var x = b.l + T + 0.6 * P + cell / 2; x < b.r - T - cell / 2; x += cell + 0.8 * P) {
          var set = sets[k++ % sets.length];
          kindsPut("i_rug", x, y, 0, 0, 3.6 * P, 3.0 * P);
          var main = kindsPut(set[0], x, y - 0.6 * P, 0, 2);
          if (!main) { continue; }
          if (set[0] === "i_dining") { continue; }                     // (its chairs its own)
          if (set[1] === "i_nightstand") { kindsPut("i_nightstand", main.x - main.w / 2 - 18, main.y - main.h / 2 + 18, 0, 1); kindsPut("i_nightstand", main.x + main.w / 2 + 18, main.y - main.h / 2 + 18, 0, 1); continue; }
          if (set[1]) { kindsPut(set[1], x, y + 0.8 * P, 0, 2); }
          if (set[2]) { kindsPut(set[2], x + 1.6 * P, y + 0.6 * P, 270, 2); }
        }
      }
    },
    // a florist: flower coolers along the back, tables of flowers and pots,
    // plants round the walls, a bench to make up bouquets
    florist: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), ch = ICONS.i_cooler.box[1];
      for (var x = b.l + T + 0.4 * P + 60; x < b.r - T - 60; x += 122) { kindsPut("i_cooler", x, b.t + T + ch / 2 + 2, 0); }
      var front = tradeTill(r, 0);
      kindsAlong(r, "i_workbench", { x: b.r, y: r.y });
      tradePlain(tradeRows(r, "i_display", 0, b.t + T + ch + 1.4 * P, front - 1.4 * P, 1.6 * P, 1.4 * P, 1.6)).forEach(function (t, i) {
        // (flowers in vases and baskets, standing on the table -- a floor stand of flowers would go through it)
        adviceAdd(i % 2 ? "i_vase" : "i_basket", t.x - 25, t.y); adviceAdd(i % 2 ? "i_succulent" : "i_vase", t.x + 25, t.y);
      });
      tradeWalls(r, "i_plant", 3); tradeWalls(r, "i_palm", 1);
    },
    // a toy shop: shelves in rows, tables of toys, a corner to play in
    toys: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      tradeWalls(r, "i_cubeshelf", 4);
      var front = tradeTill(r, 0);
      tradeRows(r, "i_shelving", 90, b.t + T + 2.2 * P, front - 4.4 * P, 1.6 * P, 0, 2.0);
      tradePlain(tradeRows(r, "i_display", 0, front - 3.6 * P, front - 1.2 * P, 1.8 * P, 1 * P, 2.4)).forEach(function (t) { adviceAdd("i_gift", t.x, t.y); });
      kindsPut("i_rug", b.l + T + 2.0 * P, b.b - T - 3.0 * P, 0, 0, 2.4 * P, 2.0 * P);
      kindsPut("i_toybox", b.l + T + 1.2 * P, b.b - T - 2.0 * P, 90, 2); kindsPut("i_beanbag", b.l + T + 2.6 * P, b.b - T - 3.0 * P, 0, 2);
    },
    // a sports shop: racks of gear, bikes in a rack, a treadmill and a
    // bike to try, tables of shoes and balls
    sports: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      tradeWalls(r, "i_shelving", 3);
      var front = tradeTill(r, 0);
      kindsAlong(r, "i_bikerack", { x: b.r, y: b.t + 3 * P });
      kindsPut("i_treadmill", b.l + T + 2.0 * P, b.t + T + 2.6 * P, 90, 3); kindsPut("i_exbike", b.l + T + 2.0 * P, b.t + T + 5.0 * P, 90, 3);
      tradeRows(r, "i_shelving", 90, b.t + T + 2.4 * P, front - 4.4 * P, 1.8 * P, 0, 4.0);
      tradePlain(tradeRows(r, "i_display", 0, front - 3.6 * P, front - 1.2 * P, 1.8 * P, 1 * P, 2.4));
    },
    // a pet shop: tanks of fish along a wall, shelves of food in rows,
    // beds and scratching posts on show
    pets: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      tradeWalls(r, "i_aquarium", 3);
      var front = tradeTill(r, 0);
      tradeRows(r, "i_shelving", 90, b.t + T + 2.4 * P, front - 3.4 * P, 1.6 * P, 0, 2.4);
      var door = kindsDoor(r), dx = door ? door.x : r.x;
      kindsPut("i_dogbed", dx + 3.0 * P, front - 1.2 * P, 0, 2); kindsPut("i_cattree", dx + 4.4 * P, front - 1.2 * P, 0, 2);
      kindsPut("i_dogbed", dx - 3.0 * P, front - 1.2 * P, 0, 2);
    }
  };
  // A display table that is not for fruit: a plain top and a shelf under
  // it, for laptops, books, toys (its kind in its colors, so the model kept
  // for the one is not taken for the other: 40-struct.js does so for posts).
  if (typeof modelColors === "function") {
    var tradeColorsWas = modelColors;
    modelColors = function (n) {
      var C = tradeColorsWas.apply(this, arguments);
      if (n && n.kind === "i_display" && n.plain) { C.kind = "plain"; }
      return C;
    };
  }
  if (typeof MODELS === "object" && MODELS.i_display) {
    var tradeDisplayWas = MODELS.i_display;
    mDef("i_display", function (M, W, D, H, C, n) {
      if (!C || C.kind !== "plain") { return tradeDisplayWas.apply(this, arguments); }
      var cm = MODEL_CM, P2 = mPick(C, "#efede8", "#5d6166"), top = M.mat("wood", P2.main), leg = M.mat("metal", P2.frame);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
        M.box(s[0] * (W / 2 - 3 * cm) - 2 * cm, s[0] * (W / 2 - 3 * cm) + 2 * cm, s[1] * (D / 2 - 3 * cm) - 2 * cm, s[1] * (D / 2 - 3 * cm) + 2 * cm, 0, H - 3 * cm, leg);
      });
      M.box(-W / 2, W / 2, -D / 2, D / 2, H - 3 * cm, H, top, 0.6 * cm);
      M.box(-W / 2 + 4 * cm, W / 2 - 4 * cm, -D / 2 + 4 * cm, D / 2 - 4 * cm, 18 * cm, 20 * cm, top);
    });
  }
  function tradePlain(list) { list.forEach(function (t) { t.plain = true; }); return list; }
  if (typeof typeStore === "function") {
    var tradeStoreWas = typeStore;
    typeStore = function (r, rnd) {
      var k = kindsWant && kindsWant.storeKind;
      if (!k || k === "grocery" || !TRADE_FIT[k]) { return tradeStoreWas.apply(this, arguments); }
      TRADE_FIT[k](r, rnd);
      // (named for what it sells)
      if (TXT["tk_floor_" + k]) { r.text = TXT["tk_floor_" + k]; }
    };
  }
  if (typeof BUILDING_TYPES === "object" && BUILDING_TYPES.shop) {
    var tradeAskWas = BUILDING_TYPES.shop.ask;
    BUILDING_TYPES.shop.ask = function (ui) {
      if (tradeAskWas) { tradeAskWas.apply(this, arguments); }
      if (!ui.want) { return; }
      ui.head(TXT.tk_head);
      ui.tiles();
      TRADE_KINDS.forEach(function (k) {
        ui.tile(TXT["tk_" + k], "tk_" + k, function () { return (ui.want.storeKind || "grocery") === k; }, function () { ui.want.storeKind = k; }, true);
      });
    };
  }

  // (the line pictures for what a shop sells)
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      tk_grocery: '<path d="M2.6 4.4h2.4l1.8 8.2h8.4l1.6-6H6"/><circle cx="7.6" cy="15.6" r="1.2"/><circle cx="14" cy="15.6" r="1.2"/>',
      tk_convenience: '<path d="M3.4 8.4 4.6 4h10.8l1.2 4.4M3.4 8.4h13.2v8.2H3.4zM8.4 16.6v-4.4h3.2v4.4M3.4 8.4c0 1.4 1.6 2 2.6 1.2 1 .8 2.4.8 3.4 0 1 .8 2.4.8 3.4 0 1 .8 2.6.2 2.6-1.2"/>',
      tk_pharmacy: '<rect x="3.4" y="3.4" width="13.2" height="13.2" rx="2"/><path d="M10 6.4v7.2M6.4 10h7.2"/>',
      tk_hardware: '<path d="M11.6 4.2a3.4 3.4 0 0 0 4.2 4.2l-7.4 7.4a1.8 1.8 0 0 1-2.6-2.6zM4.4 4.4l3.2 3.2M3.6 6.8l1.6-1.6"/>',
      tk_electronics: '<rect x="2.6" y="4" width="14.8" height="9.6" rx="1.2"/><path d="M7.4 16.6h5.2M10 13.6v3"/>',
      tk_books: '<path d="M3.4 4.6c2.4-.8 4.6-.6 6.6.8v11c-2-1.4-4.2-1.6-6.6-.8zM16.6 4.6c-2.4-.8-4.6-.6-6.6.8v11c2-1.4 4.2-1.6 6.6-.8z"/>',
      tk_furniture: '<path d="M4 10V7.4a1.6 1.6 0 0 1 1.6-1.6h8.8A1.6 1.6 0 0 1 16 7.4V10"/><path d="M2.6 10.4a1.4 1.4 0 0 1 2.8 0v1.6h9.2v-1.6a1.4 1.4 0 0 1 2.8 0v4.2H2.6zM4.4 14.6v1.6M15.6 14.6v1.6"/>',
      tk_florist: '<circle cx="10" cy="6.6" r="2.2"/><path d="M10 8.8v8M10 12.4c-2.2 0-3.6-1.2-3.6-3 2 0 3.6 1.2 3.6 3zM10 14c2.2 0 3.6-1.2 3.6-3-2 0-3.6 1.2-3.6 3zM7.6 4.6 8.8 5.4M12.4 4.6l-1.2.8"/>',
      tk_toys: '<rect x="3.4" y="8.6" width="8" height="8" rx="1"/><path d="M5.4 8.6V6.4M9.4 8.6V6.4"/><circle cx="14.6" cy="13.6" r="2.6"/><path d="M14.6 3.4l1.8 3.6h-3.6z"/>',
      tk_sports: '<circle cx="10" cy="10" r="6.6"/><path d="M3.6 8.6c3.8.8 8.6-1.8 9.6-5.6M6.8 16.2c1-3.8 5.8-6.4 9.6-5.6"/>',
      tk_pets: '<circle cx="10" cy="12.6" r="3"/><circle cx="5.4" cy="9" r="1.6"/><circle cx="14.6" cy="9" r="1.6"/><circle cx="7.6" cy="5.4" r="1.6"/><circle cx="12.4" cy="5.4" r="1.6"/>'
    });
  }

  // ---- offices: each floor its own -----------------------------------------------------------------
  // The ground floor the reception, a client meeting room and the training
  // room; the floors over it open plan, cubicles, or meeting rooms round a
  // room to train in; the top floor, in a building of three or more, the
  // directors' -- private offices and the boardroom.
  if (typeof STARTER_ROOMS === "object") {
    Object.assign(STARTER_ROOMS, {
      training: { w: 7.0, h: 4.4, bw: 7.0, max: 12, wall: [], mid: [] },
      boardroom: { w: 7.0, h: 4.4, bw: 7.0, max: 10, wall: [], mid: [] },
      cubicles: { w: 12, h: 6, bw: 12, max: 60, wall: ["i_printer", "i_plant"], mid: [] },
      phone: { w: 1.8, h: 4.4, bw: 1.8, max: 2.0, wall: [], mid: [] },
      directors: { w: 4.6, h: 4.4, bw: 4.6, max: 6, wall: [], mid: [] }
    });
  }
  if (typeof TYPE_USE === "object") { Object.assign(TYPE_USE, { training: 1, boardroom: 1, cubicles: 1, phone: 1, directors: 1 }); }
  if (typeof TYPE_LIT === "object") { Object.assign(TYPE_LIT, { training: 1, boardroom: 1, cubicles: 1 }); }
  if (typeof STARTER_LABEL === "object") { Object.assign(STARTER_LABEL, { training: "pg_training", boardroom: "pg_boardroom", cubicles: "pg_cubicles", phone: "pg_phone", directors: "pg_directors" }); }
  if (typeof STARTER_ZONE === "object") { Object.assign(STARTER_ZONE, { training: "day", boardroom: "night", cubicles: "day", phone: "night", directors: "night" }); }
  if (typeof STARTER_VENTED === "object") { Object.assign(STARTER_VENTED, { training: 1, boardroom: 1, cubicles: 1, directors: 1 }); }
  if (typeof STARTER_CEILING === "object") { Object.assign(STARTER_CEILING, { phone: "i_pendant", directors: "i_pendant" }); }
  if (typeof FRONT_GLASS === "object") {
    Object.assign(FRONT_GLASS, { training: FRONT_GLASS.meeting, boardroom: { sill: 0.3, head: 2.7, pane: 2.4, most: 0.75 }, cubicles: FRONT_GLASS.openoffice,
                                 directors: { sill: 0.5, head: 2.6, pane: 2.0, most: 0.6 } });
  }
  var PROG_FLOORS = ["open", "cubicles", "meetings", "open", "cubicles"];
  if (typeof BUILDING_TYPES === "object" && BUILDING_TYPES.office) {
    BUILDING_TYPES.office.plan = function (want) {
      var S = Math.max(1, Math.min(TYPE_MOST.storeys, want.storeys || 1)), s = Math.max(1, Math.min(3, want.size || 2)), W = [16, 22, 30][s - 1];
      var floors = [], label = function (k) { return { label: TXT["pg_" + k] || "" }; };
      var start = Math.abs((want.seed >>> 0) % PROG_FLOORS.length);
      for (var k = 0; k < S; k++) {
        var back = S > 1 ? typeCore(k, S - 1, true) : [], front;
        var prog = k === 0 ? "ground" : (k === S - 1 && S >= 3) ? "top" : PROG_FLOORS[(start + k - 1) % PROG_FLOORS.length];
        if (prog === "ground") {
          back.push(R("meeting", 4.6), R("training", 7.0, label("training")), R("kitchenette", 3.6), R("restroom", 2.2), R("restroom", 2.2));
          front = [R("reception", 4.8, { entry: true }), R("openoffice", W - 4.8)];
          if (S === 1) { back.splice(back.length - 3, 0, R("office", 3.4, { label: TXT.tr_office })); }
        } else if (prog === "top") {
          back.push(R("boardroom", 7.0, label("boardroom")), R("directors", 4.6, label("directors")), R("directors", 4.6, label("directors")),
                    R("kitchenette", 3.6), R("restroom", 2.2), R("restroom", 2.2));
          front = [R("staff", 4.8, { label: TXT.tr_breakout }), R("directors", 4.6, label("directors")), R("meeting", 4.6), R("openoffice", Math.max(4, W - 14))];
        } else if (prog === "cubicles") {
          back.push(R("meeting", 4.6), R("phone", 1.8, label("phone")), R("phone", 1.8, label("phone")), R("office", 3.4, { label: TXT.tr_office }),
                    R("kitchenette", 3.6), R("restroom", 2.2), R("restroom", 2.2));
          front = [R("staff", 4.8, { label: TXT.tr_breakout }), R("cubicles", W - 4.8, label("cubicles"))];
        } else if (prog === "meetings") {
          back.push(R("meeting", 4.6), R("meeting", 4.6), R("training", 7.0, label("training")), R("phone", 1.8, label("phone")),
                    R("kitchenette", 3.6), R("restroom", 2.2), R("restroom", 2.2));
          front = [R("staff", 4.8, { label: TXT.tr_breakout }), R("openoffice", W - 4.8)];
        } else {
          back.push(R("meeting", 4.6), R("office", 3.4, { label: TXT.tr_office }), R("office", 3.4, { label: TXT.tr_office }),
                    R("kitchenette", 3.6), R("restroom", 2.2), R("restroom", 2.2));
          front = [R("staff", 4.8, { label: TXT.tr_breakout }), R("openoffice", W - 4.8)];
        }
        while (typeWidth(back) + 3.4 <= W) { back.splice(back.length - 3, 0, R("office", 3.4, { label: TXT.tr_office })); }
        floors.push({ level: k, back: back, front: front.filter(function (f) { return f.w > 0.5; }), H: 1.8, Db: 4.4, Df: 6.4 });
      }
      var Wd = 0;
      floors.forEach(function (f) { Wd = Math.max(Wd, typeWidth(f.back), typeWidth(f.front)); });
      floors.forEach(function (f) {
        typeFill(f.back, Wd, ["meeting", "boardroom", "training"]);
        typeFill(f.front, Wd, ["openoffice", "cubicles", "meeting"]);
      });
      return { floors: floors, W: Wd, two: S > 1, noGarage: true };
    };
  }

  // ---- schools: rooms for their subjects -------------------------------------------------------------
  // Of the classrooms, in order through the building: a library, an art
  // room and a music room downstairs; a science lab, a computer lab and a
  // maths room up the stairs (or downstairs, in a school of one floor);
  // the rest for English and history and the like, every other one.
  var PROG_SPECIAL = [["library", 0], ["science", -1], ["computers", 1], ["art", 0], ["music", 0], ["math", 1]];
  function progSubjects(rooms) {
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var list = rooms.map(function (r) { var f = floors.length ? floorAt(floors, r.x, r.y) : null; return { r: r, level: f ? f.level : 0 }; });
    var top = list.reduce(function (m, o) { return Math.max(m, o.level); }, 0), out = new Map(), free = list.slice();
    PROG_SPECIAL.slice(0, Math.max(0, Math.min(PROG_SPECIAL.length, list.length - 1))).forEach(function (sp) {
      var want = sp[1] < 0 ? top : Math.min(sp[1], top);
      var pick = free.filter(function (o) { return o.level === want; })[0] || free[0];
      if (!pick) { return; }
      out.set(pick.r, sp[0]);
      free.splice(free.indexOf(pick), 1);
    });
    free.forEach(function (o, i) { out.set(o.r, ["general", "english", "history"][i % 3]); });
    return out;
  }
  var progNow = null;                      // this school's subjects, room by room
  // A classroom as its subject has it -- every one with the board, a
  // screen and a projector.
  var PROG_FIT = {
    // benches with stools, a sink at each end of the back, the teacher's bench at the front
    science: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      var board = kindsAlong(r, "i_whiteboard", { x: b.l, y: r.y });
      var front = kindsPut("i_island", b.l + T + 1.8 * P, r.y, 90, 2);
      if (front) { front.text = TXT.pg_labbench || ""; }
      for (var x = b.l + T + 4.2 * P; x < b.r - T - 1.2 * P; x += 2.6 * P) {
        for (var y = b.t + T + 1.4 * P; y < b.b - T - 1.4 * P; y += 2.2 * P) {
          var bench = kindsPut("i_island", x, y, 90, 2);
          if (!bench) { continue; }
          bench.text = TXT.pg_labbench || "";
          [-0.75, 0.75].forEach(function (o) { kindsPut("i_stool", bench.x - bench.h / 2 - 0.35 * P, bench.y + o * P, 90, 1); });
        }
      }
      kindsAlong(r, "i_utilitysink", { x: b.r, y: b.t }); kindsAlong(r, "i_utilitysink", { x: b.r, y: b.b });
      kindsAlong(r, "i_shelving", { x: b.r, y: r.y });
      return board;
    },
    // computers on desks round the walls and in rows, a chair at each
    computers: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), dw = ICONS.i_desk.box[0], dh = ICONS.i_desk.box[1];
      var board = kindsAlong(r, "i_whiteboard", { x: b.l, y: r.y });
      kindsPut("i_desk", b.l + T + 1.5 * P, r.y, 90, 2);
      for (var x = b.l + T + 3.8 * P; x < b.r - T - 1.2 * P; x += dh + 1.6 * P) {
        for (var y = b.t + T + 0.4 * P + dw / 2; y < b.b - T - dw / 2; y += dw + 0.1 * P) {
          var d = kindsPut("i_desk", x, y, 270, 1);
          if (!d) { continue; }
          adviceAdd("i_monitor", d.x, d.y, 270);
          kindsPut("i_officechair", d.x - dh / 2 - 0.4 * P, d.y, 90, 1);
        }
      }
      return board;
    },
    // big tables with stools, easels along a wall, a sink, shelves of materials
    art: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      var board = kindsAlong(r, "i_whiteboard", { x: b.l, y: r.y });
      for (var x = b.l + T + 3.0 * P; x < b.r - T - 2.0 * P; x += 3.4 * P) {
        for (var y = b.t + T + 1.8 * P; y < b.b - T - 1.6 * P; y += 2.8 * P) {
          var t = kindsPut("i_island", x, y, 0, 3);
          if (t) { t.text = TXT.pg_worktable || ""; }
          if (t) { [-0.6, 0.6].forEach(function (o) { kindsPut("i_stool", t.x + o * P, t.y - t.h / 2 - 0.35 * P, 0, 1); kindsPut("i_stool", t.x + o * P, t.y + t.h / 2 + 0.35 * P, 0, 1); }); }
        }
      }
      tradeWalls(r, "i_easel", 2);
      kindsAlong(r, "i_utilitysink", { x: b.r, y: b.t }); kindsAlong(r, "i_cubeshelf", { x: b.r, y: b.b });
      return board;
    },
    // the piano, chairs in rows facing the teacher, a stand of instruments, speakers
    music: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      var board = kindsAlong(r, "i_whiteboard", { x: b.l, y: r.y });
      kindsPut("i_piano", b.l + T + 1.2 * P, b.t + T + 1.4 * P, 90, 2);
      for (var x = b.l + T + 3.4 * P; x < b.r - T - 1.0 * P; x += 1.3 * P) {
        for (var y = b.t + T + 1.0 * P; y < b.b - T - 0.8 * P; y += 0.9 * P) { kindsPut("i_chair", x, y, 270, 2); }
      }
      kindsAlong(r, "i_speaker", { x: b.l, y: b.t }); kindsAlong(r, "i_speaker", { x: b.l, y: b.b }); kindsAlong(r, "i_cubeshelf", { x: b.r, y: r.y });
      return board;
    },
    // books round the walls, tables to read at, armchairs, the librarian's desk
    library: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      tradeWalls(r, "i_bookcase", 6);
      var desk = kindsPut("i_counter", b.l + T + 1.6 * P, b.b - T - 1.6 * P, 90, 2);
      if (desk) { adviceAdd("i_computer", desk.x, desk.y); }
      for (var x = b.l + T + 3.2 * P; x < b.r - T - 2.0 * P; x += 2.6 * P) {
        for (var y = b.t + T + 2.0 * P; y < b.b - T - 1.6 * P; y += 2.6 * P) {
          var t = kindsPut("i_roundtable", x, y, 0, 30);
          if (t) { typeChairs(t, "i_chair", true); }
        }
      }
      kindsPut("i_armchair", b.r - T - 1.0 * P, b.b - T - 1.0 * P, 270, 2); kindsPut("i_armchair", b.r - T - 2.0 * P, b.b - T - 1.0 * P, 0, 2);
      return null;
    },
    // a second board for working through it on; the desks in rows
    math: function (r) {
      var b = tieBox(r), board = null;
      board = kindsAlong(r, "i_whiteboard", { x: b.l, y: r.y - r.h * 0.25 });
      kindsAlong(r, "i_whiteboard", { x: b.l, y: r.y + r.h * 0.25 });
      progDesks(r);
      return board;
    }
  };
  // The pupils' desks in rows facing the board (a desk turned is 1.5 m
  // front to back with its chair: rows that close lost every other one).
  function progDesks(r) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), q = turned({ w: ICONS.i_schooldesk.box[0], h: ICONS.i_schooldesk.box[1], turn: 270 });
    kindsPut("i_desk", b.l + T + 1.2 * P, r.y, 90, 2);
    for (var x = b.l + T + 2.4 * P + q.w / 2; x <= b.r - T - 0.4 * P - q.w / 2; x += q.w + 0.1 * P) {
      for (var y = b.t + T + 0.5 * P + q.h / 2; y <= b.b - T - 0.5 * P - q.h / 2; y += q.h + 0.1 * P) { kindsPut("i_schooldesk", x, y, 270, 1); }
    }
  }
  if (typeof typeClassroom === "function") {
    var progClassWas = typeClassroom;
    typeClassroom = function (r) {
      var subject = progNow && progNow.get(r) || "general", n = String(r.text || "").replace(/[^0-9]/g, "");
      if (TXT["pg_" + subject + "_n"] && subject !== "general") { r.text = n ? say("pg_" + subject + "_n", { n: n }) : TXT["pg_" + subject] || r.text; }
      if (subject === "library") { r.text = TXT.pg_library; }
      var board = null, b = tieBox(r);
      if (PROG_FIT[subject]) { board = PROG_FIT[subject](r); }
      else {
        board = kindsAlong(r, "i_whiteboard", { x: b.l, y: r.y });
        progDesks(r);
      }
      // the screen beside the board, the projector on the ceiling before it
      if (subject !== "library") { kindsShow(r, board ? { x: board.x, y: board.y + (board.y < r.y ? 1 : -1) * 0.1 } : { x: b.l, y: r.y }); }
    };
  }

  // A school of four classrooms or more has its cafeteria downstairs, and
  // every one a nurse's room by the office.
  if (typeof STARTER_ROOMS === "object") {
    Object.assign(STARTER_ROOMS, {
      cafeteria: { w: 9.0, h: 7.0, bw: 9.0, max: 16, wall: [], mid: [] },
      nurse: { w: 3.0, h: 4.0, bw: 3.0, max: 3.6, wall: [], mid: [] }
    });
  }
  if (typeof TYPE_USE === "object") { Object.assign(TYPE_USE, { cafeteria: 1, nurse: 1 }); }
  // (what each is, for what Check asks of it: a cafeteria's counters are no kitchen's, 38-advice.js)
  if (typeof ROOM_USE === "object") { Object.assign(ROOM_USE, { cafeteria: "work", nurse: "work", training: "work", boardroom: "work", cubicles: "work", phone: "closet", directors: "work" }); }
  if (typeof TYPE_LIT === "object") { TYPE_LIT.cafeteria = 1; }
  if (typeof STARTER_LABEL === "object") { Object.assign(STARTER_LABEL, { cafeteria: "pg_cafeteria", nurse: "pg_nurse" }); }
  if (typeof STARTER_ZONE === "object") { Object.assign(STARTER_ZONE, { cafeteria: "day", nurse: "wet" }); }
  if (typeof STARTER_VENTED === "object") { Object.assign(STARTER_VENTED, { cafeteria: 1, nurse: 1 }); }
  if (typeof STARTER_CEILING === "object") { STARTER_CEILING.nurse = "i_pendant"; }
  if (typeof FRONT_GLASS === "object") { FRONT_GLASS.cafeteria = FRONT_GLASS.cafe; FRONT_GLASS.nurse = FRONT_GLASS.staff; }
  if (typeof BUILDING_TYPES === "object" && BUILDING_TYPES.school) {
    var progSchoolWas = BUILDING_TYPES.school.plan;
    BUILDING_TYPES.school.plan = function (want) {
      var plan = progSchoolWas.apply(this, arguments), g = plan.floors.filter(function (f) { return f.level === 0; })[0];
      if (!g) { return plan; }
      var n = Math.max(2, Math.min(TYPE_MOST.classrooms, want.rooms || 4));
      g.back.splice(g.back.length - 2, 0, R("nurse", 3.0, { label: TXT.pg_nurse }));
      if (n >= 4) { g.front.splice(1, 0, R("cafeteria", 12.0, { label: TXT.pg_cafeteria })); }
      var W = 0;
      plan.floors.forEach(function (f) { W = Math.max(W, typeWidth(f.back), typeWidth(f.front)); });
      plan.floors.forEach(function (f) { typeFill(f.back, W, ["classroom"]); typeFill(f.front, W, ["classroom", "cafeteria"]); });
      plan.W = W;
      return plan;
    };
  }
  if (typeof starterDecor === "function") {
    var progDecorWas = starterDecor;
    starterDecor = function () {
      var was = typeof STARTER_CEILING === "object" ? STARTER_CEILING.lobby : null, school = kindsWant && kindsWant.type === "school";
      if (school) { STARTER_CEILING.lobby = "i_pendant"; }
      try { return progDecorWas.apply(this, arguments); } finally { if (school) { STARTER_CEILING.lobby = was; } }
    };
  }
  var PROG_SCHOOL = {
    // a serving line along the back, a cooler of drinks, long tables in rows
    cafeteria: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      for (var x = r.x - 150; x <= r.x + 150; x += 100) { kindsPut("i_counter", x, b.t + T + 0.4 * P, 0, 1); }
      kindsPut("i_cooler", r.x + 260, b.t + T + 0.8 * P, 0, 1);
      for (var y = b.t + T + 2.8 * P; y < b.b - T - 1.0 * P; y += 2.5 * P) {
        for (var tx = b.l + T + 1.9 * P; tx < b.r - T - 1.6 * P; tx += 3.4 * P) { kindsPut("i_dining", tx, y, 0, 4, 140, 80); }
      }
      kindsAlong(r, "i_trash", { x: b.r, y: b.b });
    },
    // a cot, a desk and its chair, a basin, the medicine cabinet over it
    nurse: function (r) {
      var b = tieBox(r);
      kindsAlong(r, "i_bed1", { x: b.l, y: b.t });
      var desk = kindsAlong(r, "i_desk", { x: b.r, y: b.b });
      if (desk) { var a = (desk.turn || 0) * Math.PI / 180; kindsPut("i_officechair", desk.x - Math.sin(a) * 38, desk.y + Math.cos(a) * 38, (desk.turn || 0) + 180, 0); }
      kindsAlong(r, "i_sink", { x: b.r, y: b.t }); kindsAlong(r, "i_medicine", { x: b.r, y: b.t }); kindsAlong(r, "i_chair", { x: b.l, y: b.b });
    },
    // the school office: a counter for whoever comes in, a desk behind it,
    // filing, chairs to wait on -- its light a plain one, not a chandelier
    lobby: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      hand.nodes.forEach(function (n) { if (n.kind === "i_chandelier" && insideArea(r, n.x, n.y)) { n.kind = "i_pendant"; measure(n, true); } });
      var c = kindsPut("i_counter", r.x, r.y - 0.4 * P, 0, 3) || kindsPut("i_counter", r.x, r.y + 0.4 * P, 0, 3);
      if (c) { adviceAdd("i_computer", c.x + 30, c.y); }
      var desk = kindsPut("i_desk", r.x, b.t + T + 0.9 * P, 180, 2) || kindsPut("i_desk", b.l + T + 0.9 * P, r.y, 270, 2) ||
                 kindsPut("i_desk", b.r - T - 0.9 * P, r.y, 90, 2) || kindsPut("i_desk", r.x - 1.2 * P, b.t + T + 0.9 * P, 180, 2) ||
                 kindsAlong(r, "i_desk", { x: r.x, y: b.t });
      if (desk) {
        var da = (desk.turn || 0) * Math.PI / 180;
        kindsPut("i_officechair", desk.x + Math.sin(da) * 0.75 * P, desk.y - Math.cos(da) * 0.75 * P, (desk.turn || 0) + 180, 0);
        adviceAdd("i_monitor", desk.x, desk.y, desk.turn || 0);
      }
      kindsAlong(r, "i_filing", { x: b.l, y: b.t }); kindsAlong(r, "i_filing", { x: b.r, y: b.t });
      for (var k = 0; k < 3; k++) { kindsPut("i_chair", b.l + T + 0.8 * P, b.b - T - 1.0 * P - k * 0.7 * P, 90, 1); }
    }
  };

  // ---- furnished: the rooms that are new here ------------------------------------------------------
  var PROG_FLOORING = { training: ["carpet", "#7f8794"], boardroom: ["parquet", "#a77a50"], cubicles: ["carpet", "#7f8794"],
                        phone: ["carpet", "#7f8794"], directors: ["carpet", "#8a8378"] };
  var PROG_FIT_ROOMS = {
    // rows of tables facing the screen, a chair at each, a lectern
    training: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), dw = ICONS.i_desk.box[0], dh = ICONS.i_desk.box[1];
      var screen = kindsShow(r, { x: b.l, y: r.y });
      kindsPut("i_standdesk", b.l + T + 1.4 * P, b.t + T + 1.0 * P, 90, 2);
      for (var x = b.l + T + 3.2 * P; x < b.r - T - 1.0 * P; x += dh + 1.4 * P) {
        for (var y = b.t + T + 0.5 * P + dw / 2; y < b.b - T - dw / 2; y += dw + 0.3 * P) {
          var d = kindsPut("i_desk", x, y, 270, 1);
          if (d) { kindsPut("i_officechair", d.x - dh / 2 - 0.4 * P, d.y, 90, 1); }
        }
      }
      return screen;
    },
    // a long table for twelve, a credenza, the screen at its end
    boardroom: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), along = r.w >= r.h;
      var len = Math.min(212, (along ? r.w : r.h) - 2 * T - 3.4 * P), deep = 88;
      var t = kindsPut("i_dining", r.x, r.y, along ? 0 : 90, 6, Math.max(104, len), deep);
      kindsShow(r, along ? { x: b.l, y: r.y } : { x: r.x, y: b.t });
      kindsAlong(r, "i_sideboard", along ? { x: r.x, y: b.t } : { x: b.r, y: r.y });
      kindsAlong(r, "i_plant", { x: b.r, y: b.b });
      return t;
    },
    // a desk each in a pod of four, low screens between them, a chair at each
    cubicles: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), cell = 1.7 * P, part = 0.06 * P;
      for (var y = b.t + T + 1.0 * P + cell; y + cell <= b.b - T - 1.0 * P; y += 2 * cell + 1.6 * P) {
        for (var x = b.l + T + 1.2 * P; x + cell < b.r - T - 1.0 * P; x += cell) {
          // the spine between the two rows, and a side screen at the start of each cell
          kindsPartition(x + cell / 2, y, cell, part, 0);
          kindsPartition(x, y - cell / 2, part, cell, 0); kindsPartition(x, y + cell / 2, part, cell, 0);
          [[-1, 180], [1, 0]].forEach(function (s) {
            var dy = s[0] * (0.36 * P), d = kindsPut("i_desk", x + cell / 2, y + dy + s[0] * 2, s[1], 0, 1.4 * P, 0.65 * P);
            if (!d) { return; }
            adviceAdd("i_monitor", d.x, d.y, s[1]);
            kindsPut("i_officechair", d.x, d.y + s[0] * 0.75 * P, s[1] === 0 ? 180 : 0, 0);
          });
        }
        kindsPartition(Math.min(x, b.r - T - 1.0 * P), y - cell / 2, part, cell, 0); kindsPartition(Math.min(x, b.r - T - 1.0 * P), y + cell / 2, part, cell, 0);
      }
    },
    // a booth for a call: a little desk and a chair, or an armchair
    phone: function (r) {
      var b = tieBox(r);
      if (!kindsAlong(r, "i_standdesk", { x: r.x, y: b.t })) { kindsAlong(r, "i_armchair", { x: r.x, y: b.t }); }
    },
    // a director's office: a big desk facing the door, chairs before it, a bookcase, a sofa
    directors: function (r) {
      var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
      var desk = kindsPut("i_lshapedesk", r.x, b.t + T + 1.4 * P, 0, 3) || kindsPut("i_desk", r.x, b.t + T + 1.2 * P, 0, 3) ||
                 kindsPut("i_desk", r.x, b.b - T - 1.2 * P, 180, 3) || kindsPut("i_desk", b.l + T + 1.2 * P, r.y, 90, 3) || kindsPut("i_desk", b.r - T - 1.2 * P, r.y, 270, 3);
      if (desk) {
        var da = (desk.turn || 0) * Math.PI / 180;
        kindsPut("i_officechair", desk.x + Math.sin(da) * 0.75 * P, desk.y - Math.cos(da) * 0.75 * P, (desk.turn || 0) + 180, 0);
        adviceAdd("i_monitor", desk.x, desk.y, desk.turn || 0);
      }
      kindsPut("i_chair", r.x - 0.5 * P, r.y + 0.6 * P, 180, 2); kindsPut("i_chair", r.x + 0.5 * P, r.y + 0.6 * P, 180, 2);
      kindsAlong(r, "i_bookcase", { x: b.l, y: b.t }); kindsAlong(r, "i_loveseat", { x: b.r, y: r.y }); kindsAlong(r, "i_plant", { x: b.l, y: b.b });
    }
  };
  // A low screen between desks: a wall a desk's height and a half, thin.
  function kindsPartition(x, y, w, h, turn) {
    var n = adviceAdd("i_wall", Math.round(x), Math.round(y), turn || 0);
    n.w = Math.max(2, Math.round(w)); n.h = Math.max(2, Math.round(h)); n.own = true; n.tall = 1.35; n.screen = true;
    return n;
  }
  if (typeof typeFurnish === "function") {
    var progFurnishWas = typeFurnish;
    typeFurnish = function (made, rnd, want) {
      var T = typeof typeOf === "function" ? typeOf(want) : {};
      progNow = want && want.type === "school" ? progSubjects(made.filter(function (r) { return r.starter === "classroom"; })) : null;
      var out = progFurnishWas.apply(this, arguments);
      if (!T || !T.plan) { return out; }
      made.forEach(function (r) {
        var fit = PROG_FIT_ROOMS[r.starter] || (want && want.type === "school" ? PROG_SCHOOL[r.starter] : null);
        if (!fit && r.starter !== "meeting") { return; }
        typeRoom = r;
        try {
          if (PROG_FLOORING[r.starter]) {
            var m = Object.assign({}, r.mat || {});
            m.floor = PROG_FLOORING[r.starter][0]; m.floorC = PROG_FLOORING[r.starter][1]; m.wall = "paint"; m.wallC = "#f2efe8";
            r.mat = m;
          }
          if (fit) { fit(r); }
          else { kindsShow(r, { x: tieBox(r).l, y: r.y }); }          // a meeting room's screen and projector
        } finally { typeRoom = null; }
      });
      progNow = null;
      return out;
    };
  }
