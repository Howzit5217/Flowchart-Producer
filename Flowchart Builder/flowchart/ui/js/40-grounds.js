// ---------------------------------------------------------------------------
//  40-grounds.js -- what goes round a building, for what it is: a house's
//  yard, a block's parking and playground, an office's benches and bike
//  racks, a school's, a shop's carts, a cafe's tables out front -- and the
//  settings that follow what has been built
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "make it so you can put in other things too
  // that could be important too to any build type", and "depending on what
  // you have built the settings change")
  //
  // What has been built: the building type the last Start building made it
  // as (its mark's madeWith, 40-hood.js), as one of a few kinds of grounds.
  var GROUNDS_OF = { house: "home", cabin: "home", duplex: "home", townhouses: "home", apartments: "flats", condos: "flats",
                     office: "office", school: "school", shop: "store", boutique: "store", cafe: "eat" };
  var GROUNDS_FOR = {
    home: ["deck", "porch", "pool", "hottub", "grill", "firepit", "trampoline", "swing", "gazebo", "shed", "garden"],
    flats: ["parking", "bikes", "benches", "playground", "sharedpool", "bbq", "lamps", "planters", "garden"],
    office: ["parking", "bikes", "benches", "seating", "lamps", "planters", "garden"],
    school: ["parking", "bikes", "playground", "benches", "garden", "lamps", "planters"],
    store: ["parking", "carts", "bikes", "benches", "planters", "lamps"],
    eat: ["parking", "seating", "bikes", "planters", "lamps", "benches"]
  };
  function groundsKindOf(type) { return GROUNDS_OF[type || "house"] || "home"; }
  function groundsNow() {
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, b) { return b.id - a.id; });
    return groundsKindOf(marks.length ? marks[0].madeWith.type : "house");
  }

  // ---- what there is to put round it: in a row, each a step from the last ----------------------------
  // [key, its pieces, the size of the first (metres) or null, where on the lot]; GROUNDS_ROW: metres apart
  [["parking", ["i_parked", "i_parked", "i_parked", "i_parked", "i_parked", "i_parked"], null, "front"],
   ["bikes", ["i_bikerack", "i_bikerack"], null, "front"],
   ["benches", ["i_gardenbench", "i_gardenbench", "i_gardenbench"], null, "front"],
   ["lamps", ["i_lamppost", "i_lamppost", "i_lamppost", "i_lamppost"], null, "front"],
   ["planters", ["i_planter", "i_planter", "i_planter", "i_planter"], null, "front"],
   ["seating", ["i_roundtable", "i_roundtable", "i_roundtable"], null, "front"],
   ["playground", ["i_swing", "i_trampoline", "i_gardenbench"], null, "back"],
   ["sharedpool", ["i_pool", "i_lounger", "i_lounger", "i_lounger", "i_lounger"], [9, 4.5], "back"],
   ["bbq", ["i_grill", "i_roundtable", "i_gardenbench"], null, "back"],
   ["carts", ["i_cart", "i_cart", "i_cart", "i_cart", "i_cart"], null, "front"]
  ].forEach(function (Y) {
    if (!YARD_OF[Y[0]]) { YARD_KINDS.push(Y); YARD_OF[Y[0]] = Y; }
  });
  var GROUNDS_ROW = { parking: 2.6, bikes: 1.6, benches: 2.6, lamps: 5, planters: 2.0, seating: 2.4, playground: 4.0, bbq: 2.6, carts: 0.75 };
  if (typeof yardPut === "function") {
    var yardPutOne = yardPut;
    yardPut = function (key, houses) {
      var gap = GROUNDS_ROW[key];
      if (!gap && key !== "sharedpool") { return yardPutOne.apply(this, arguments); }
      return groundsRow(key, houses, gap);
    };
  }
  // A row of them: room found for the whole row at once, then each put
  // along it (along the lot's front); a pool's loungers along its side.
  function groundsRow(key, houses, gap) {
    var Y = YARD_OF[key], P = FLOOR_PX, put = 0;
    (houses || yardHouses()).forEach(function (H) {
      var taken = [], kinds = Y[1].filter(function (k) { return ICONS[k]; });
      if (!kinds.length) { return; }
      var a = (H.lot.turn || 0) * Math.PI / 180, ax = Math.cos(a), ay = Math.sin(a);
      if (key === "sharedpool") {
        var pw = Y[2][0] * P, ph = Y[2][1] * P, lw = ICONS.i_lounger.box[0], lh = ICONS.i_lounger.box[1];
        var spot = yardSpot(H, pw, ph + lh + 1.2 * P, Y[3], taken);
        if (!spot) { return; }
        var pool = adviceAdd("i_pool", spot.x - Math.sin(a) * (lh + 1.2 * P) / 2 * -1, spot.y + Math.cos(a) * (lh + 1.2 * P) / 2 * -1, spot.turn || 0);
        pool.w = Math.round(pw); pool.h = Math.round(ph); pool.own = true; pool.yard = key; put++;
        for (var i = 0; i < kinds.length - 1; i++) {
          var along = -pw / 2 + lw / 2 + i * (pw - lw) / Math.max(1, kinds.length - 2);
          var bx = pool.x + ax * along - Math.sin(a) * (ph / 2 + 0.6 * P + lh / 2), by = pool.y + ay * along + Math.cos(a) * (ph / 2 + 0.6 * P + lh / 2);
          var l = adviceAdd("i_lounger", Math.round(bx), Math.round(by), (spot.turn || 0) + 180);
          l.own = true; l.yard = key; put++;
        }
        return;
      }
      var w = ICONS[kinds[0]].box[0], h = Math.max.apply(null, kinds.map(function (k) { return ICONS[k].box[1]; }));
      var step = Math.max(gap * P, w + 0.3 * P), len = step * (kinds.length - 1) + w;
      var at = yardSpot(H, len, h, Y[3], taken);
      if (!at) { return; }
      kinds.forEach(function (kind, i) {
        var off = -len / 2 + w / 2 + i * step;
        var n = adviceAdd(kind, Math.round(at.x + ax * off), Math.round(at.y + ay * off), at.turn || 0);
        n.own = true; n.yard = key; put++;
      });
    });
    return put;
  }

  // ---- in the view's settings: the grounds of what has been built ---------------------------------
  // (40-yard.js's tiles, the house's; another building's, its own)
  if (typeof HOUSE_TAB_MORE === "object") {
    var yardTabAt = -1;
    HOUSE_TAB_MORE.forEach(function (fn, i) { if (String(fn).indexOf("yd_head") >= 0) { yardTabAt = i; } });
    var groundsTab = function (sheet, head, tiles) {
      var keys = GROUNDS_FOR[groundsNow()] || GROUNDS_FOR.home;
      head(groundsNow() === "home" ? TXT.yd_head : TXT.gr_head);
      tiles(keys.filter(function (k) { return YARD_OF[k]; }).map(function (key) {
        return { icon: "yd_" + key, label: TXT["yd_" + key], on: key === "porch" ? !!houseOpt("frontPorch") : yardHas(key),
                 set: function () { yardToggle(key); } };
      }));
    };
    if (yardTabAt >= 0) { HOUSE_TAB_MORE[yardTabAt] = groundsTab; } else { HOUSE_TAB_MORE.push(groundsTab); }
  }

  // ---- and in Start building, for the kind of building picked --------------------------------------
  // (a house's yard is asked there already, 39-starter.js: the others ask theirs after what they are)
  function groundsAsk(ui, want) {
    var kind = groundsKindOf(want.type);
    if (kind === "home") { return; }
    want.yard = Object.assign({}, want.yard && typeof want.yard === "object" ? want.yard : {});
    ui.head(TXT.gr_head);
    ui.tiles();
    GROUNDS_FOR[kind].forEach(function (key) {
      if (!YARD_OF[key]) { return; }
      ui.tile(TXT["yd_" + key], "yd_" + key, function () { return !!want.yard[key]; }, function () { want.yard[key] = !want.yard[key]; });
    });
  }

  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      yd_parking: '<rect x="3" y="3" width="14" height="14" rx="2.4"/><path d="M8 14V6h2.8a2.4 2.4 0 0 1 0 4.8H8"/>',
      yd_bikes: '<circle cx="5.4" cy="12.6" r="2.8"/><circle cx="14.6" cy="12.6" r="2.8"/><path d="M5.4 12.6 8.4 7.4h4.4l1.8 5.2M8.4 7.4 10 12.6l2.8-5.2M7.4 5.6h2.4"/>',
      yd_benches: '<path d="M3 9.6h14M3 12.4h14M4.6 12.4v4M15.4 12.4v4M4.6 6.6v3M15.4 6.6v3M3 6.6h14"/>',
      yd_lamps: '<path d="M10 17.4V6.4M7.6 17.4h4.8M7 6.4h6l-1-2.8H8z"/><path d="M8.6 8.4l-.6 1.4M11.4 8.4l.6 1.4" stroke-dasharray="1 1"/>',
      yd_planters: '<path d="M5 10.4h10l-1.4 6.2H6.4z"/><path d="M10 10.4V6.6M10 6.6c-1.8 0-2.6-1.2-2.6-2.8 1.6 0 2.6 1 2.6 2.8zM10 7.4c1.6 0 2.6-.8 2.6-2.4-1.4 0-2.6.8-2.6 2.4z"/>',
      yd_seating: '<circle cx="10" cy="8.4" r="4"/><path d="M10 12.4v4.4M7.4 16.8h5.2M3 9.6v6M3 12.4h2.4M17 9.6v6M17 12.4h-2.4"/>',
      yd_playground: '<path d="M2.6 16.6 5.6 4.6h8.8l3 12M9 4.6v6.4M7.4 11h3.2"/><path d="M14.4 4.6c-1 3-1 6 1.6 8.4"/>',
      yd_sharedpool: '<rect x="2.6" y="4" width="14.8" height="8" rx="2"/><path d="M5 8c1-.7 2-.7 3 0s2 .7 3 0 2-.7 3 0M4 15.6h4.4M11.6 15.6H16M4 15.6l1-1.6M11.6 15.6l1-1.6"/>',
      yd_bbq: '<path d="M4.4 7.4h11.2a5.6 5.6 0 0 1-11.2 0z"/><path d="M6.8 12 5.6 16.4M13.2 12l1.2 4.4M8 4.4v1.4M10 3.6v2.2M12 4.4v1.4"/>',
      yd_carts: '<path d="M2.6 4.4h2.4l1.8 8.2h8.4l1.6-6H6"/><circle cx="7.6" cy="15.6" r="1.2"/><circle cx="14" cy="15.6" r="1.2"/>'
    });
  }
