// ---------------------------------------------------------------------------
//  40-sized.js -- furniture the size its room suits: a table for two in a
//  little dining room and for eight in a big one, a king bed where there
//  is the floor for it and a single where there is not, a sofa as long as
//  the wall it is on, a rug as big as the floor round the seats -- and
//  floor left to walk on
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "Rooms cramped, no room to walk: more room, and
  // furniture sized to the room (2-seat table vs 6/8-seat; same for sofas,
  // beds, desks...)")
  //
  // Start building puts each piece in by starterMid or starterAlong
  // (39-starter.js), and each asks furnFit first: what to put in, at what
  // size, which way round, and how much floor to keep round it -- or, for
  // what a room can do without (a plant, a second armchair), false once
  // the room has as much standing in it as it should.  Sizes are the ones
  // things are sold in; where the size picked finds no place, the next
  // size down is tried (`less`).
  var furnWant = null;                   // what the house being made was asked to be

  // A number from 0 to 1 that is the same for the same room and piece:
  // which of two sizes, where both fit, without a die thrown each time.
  function furnHash(r, salt) {
    var s = String(r.id) + ":" + salt, a = 2166136261;
    for (var i = 0; i < s.length; i++) { a = Math.imul(a ^ s.charCodeAt(i), 16777619); }
    return ((a >>> 0) % 1000) / 1000;
  }

  // How many live in it -- what a table is laid for.
  function furnHousehold() {
    var w = furnWant || {};
    if (w.type === "condos") { return w.condoBeds === 1 ? 1 : 2; }
    if (w.type === "tower") { return 2; }
    return Math.max(1, w.beds || 3);
  }

  // A room's floor, inside its walls, in pixels: the long way and the short.
  function furnFloor(r) {
    var q = turned(r), T = roomWallOf(r), w = q.w - 2 * T, h = q.h - 2 * T;
    return { w: w, h: h, long: Math.max(w, h), short: Math.min(w, h), tall: h > w };
  }

  // Tables, by the places laid (furnSeats, 38-models.js, draws the chairs).
  var FURN_TABLES = [[2, 60, 60], [4, 80, 72], [6, 104, 76], [8, 140, 80], [10, 176, 84], [12, 212, 88]];
  // Rugs, in metres, as they are sold: 4x6, 5x8, 6x9, 8x10, 9x12 and 10x13 feet.
  var FURN_RUGS = [[1.8, 1.2], [2.4, 1.5], [2.7, 1.8], [3.0, 2.4], [3.6, 2.7], [4.0, 3.0]];
  // Sofas, by their length in pixels (their seats as many as it holds, mSofa).
  var FURN_SOFAS = [75, 100, 116, 136];

  // What a room may go without: left out once a room has this much of its
  // floor stood on already (2026-10-03: "rooms cramped, no room to walk").
  var FURN_SPARE = { i_plant: 1, i_palm: 1, i_ottoman: 1, i_sidetable: 1, i_bookcase: 1, i_bench: 1, i_chest: 1, i_chaise: 1,
                     i_beanbag: 1, i_barcart: 1, i_printer: 1, i_armchair: 1, i_toolchest: 1, i_bikerack: 1, i_shoerack: 1,
                     i_hamper: 1, i_filing: 1, i_lamp: 1, i_speaker: 1, i_easel: 1, i_toybox: 1 };
  var FURN_MOST = 0.4;                   // of the floor, stood on
  // (rooms where things stand close by their nature, and are left as they are)
  var FURN_PACKED = { garage: 1, storage: 1, utility: 1, closet: 1, pantry: 1, laundry: 1, stock: 1, stairs: 1, hall: 1 };

  function furnStoodOn(r) {
    var got = 0;
    starterNear(r, 0).forEach(function (n) {
      if (n === r || isArea(n.kind) || !ICONS[n.kind] || LIES_FLAT[n.kind] || ON_THE_WALL[n.kind] || FROM_CEILING[n.kind] ||
          ON_TOP[n.kind] || WALK_DOORS[n.kind] || n.kind === "i_window" || n.id < 0 || !insideArea(r, n.x, n.y)) { return; }
      got += n.w * n.h;
    });
    return got;
  }

  // What to put in, and how big: { kind, w, h, turn, clear, less } -- or
  // null to put it in as it comes, or false to leave it out.  `along`: it
  // goes against a wall (starterAlong), not out in the room.
  function furnFit(r, kind, along) {
    var job = r && r.starter;
    if (!job || !STARTER_ROOMS[job]) { return null; }
    var at = String(kind).split("@"), base = at[0], most = at[1] ? parseInt(at[1], 10) : 0, tight = /!$/.test(kind);
    var F = furnFloor(r), P = FLOOR_PX, open = F.w * F.h;
    if (along && FURN_SPARE[base] && !FURN_PACKED[job]) {
      var icon = ICONS[base];
      if (icon && furnStoodOn(r) + icon.box[0] * icon.box[1] > FURN_MOST * open) { return false; }
      // (an armchair turned to the television, as the sofa is: a longer
      // sofa pushed it onto the television's own wall, its back to it)
      return base === "i_armchair" && along ? furnFacing(r, base) : null;
    }
    switch (base) {
      case "i_dining": case "i_roundtable": return furnTable(r, job, base, most, F, tight);
      case "i_rug": return furnRug(F, most);
      case "i_coffee": return { kind: base, w: F.long >= 6.2 * P ? 60 : F.long < 4.2 * P ? 40 : 50, h: F.long >= 6.2 * P ? 34 : F.long < 4.2 * P ? 26 : 30 };
      case "i_sofa": case "i_sectional": return furnSofa(r, job, base, most, F);
      case "i_bedking": case "i_bed": case "i_bed1": return furnBed(r, job, base, most, F);
      case "i_desk": return furnDesk(job, most, F);
      case "i_wardrobe": return furnRun(base, job === "main" ? (F.long >= 5 * P ? 90 : 70) : F.short < 3.2 * P ? 50 : 60, 30, most, [50]);
      case "i_dresser": return furnRun(base, job === "main" && F.long >= 5 * P ? 70 : 50, 30, most, [40]);
    }
    return null;
  }

  // A size along a wall, and the next smaller where that finds no place.
  function furnRun(kind, w, h, most, steps) {
    if (most) { w = Math.min(w, most); }
    var less = steps.filter(function (s) { return s < w; })[0];
    return { kind: kind, w: w, h: h, less: less ? kind + "@" + less : null };
  }

  // The table: as many places as live there (and two more, now and then,
  // for company) -- as many as there is floor for, with room to pull a
  // chair out and walk behind it; turned the long way of the room.  A
  // meeting room's as big as it holds.  Round, for four or fewer.  Where
  // none finds a place with the floor round it, one for four, then two,
  // put where it goes (`tight`: as a table was put before it was sized).
  function furnTable(r, job, kind, most, F, tight) {
    var P = FLOOR_PX, folk = furnHousehold();
    // (a staff room's or a kitchenette's a little round one, as it was)
    var work = job === "kitchenette" || job === "staff" || job === "breakfast";
    var want = job === "meeting" ? 12 : work ? 4 : folk <= 2 ? 4 : folk === 3 ? 6 : 8;
    if (job !== "meeting" && !work && furnHash(r, "guests") < 0.4) { want += 2; }
    if (most) { want = Math.min(want, most); }
    // a great room's table shares it with the kitchen: half its length
    // (a meeting room's chairs are walked round, to the plants in its corners)
    var clear = tight ? 0 : job === "great" ? 22 : job === "meeting" ? 36 : job === "breakfast" ? 12 : 28, room = 2 * (clear + 10);
    // (and a dining room's a sideboard's depth more along one side, and room to open it)
    var longWay = job === "great" ? F.long * 0.55 : F.long - room, shortWay = F.short - room - (job === "dining" ? 26 : 0);
    var fits = FURN_TABLES.filter(function (t) { return t[0] <= want && (tight || t[1] <= longWay && t[2] <= shortWay); });
    var t = fits.length ? fits[fits.length - 1] : FURN_TABLES[0];
    var smaller = FURN_TABLES.filter(function (u) { return u[0] < t[0] && u[0] >= 4; }).pop();
    var less = tight ? (t[0] > 2 ? "i_dining@2!" : null)
             : smaller ? "i_dining@" + smaller[0]
             : kind === "i_roundtable" && t[0] === 4 ? "i_roundtable@4!" : "i_dining@" + Math.min(4, t[0]) + "!";
    if (kind === "i_roundtable" && t[0] === 4) { return { kind: "i_roundtable", w: 80, h: 80, clear: clear, less: less }; }
    return { kind: "i_dining", w: t[1], h: t[2], turn: F.tall ? 90 : 0, clear: clear, less: less };
  }

  // The rug: the biggest that leaves a band of floor round it (the front
  // legs of a sofa against the wall stand on it, as they should).
  function furnRug(F, most) {
    var P = FLOOR_PX, edge = 1.3;
    var fits = FURN_RUGS.filter(function (s, i) { return (!most || i < most) && s[0] <= F.long / P - edge && s[1] <= F.short / P - edge; });
    var s = fits.length ? fits[fits.length - 1] : FURN_RUGS[0], i = FURN_RUGS.indexOf(s);
    // (smaller, where a door swings over the floor it would have: a door catches on a rug)
    return { kind: "i_rug", w: Math.round(s[0] * P), h: Math.round(s[1] * P), turn: F.tall ? 90 : 0, less: i > 0 ? "i_rug@" + i : null };
  }

  // A sofa as long as the room is: two seats in a little one, four in a
  // big one; a corner sofa only where it leaves room to get round it.
  function furnSofa(r, job, kind, most, F) {
    var P = FLOOR_PX;
    if (kind === "i_sectional" && !most) {
      if (F.short >= 4.0 * P) {
        var big = F.long >= 6.4 * P && F.short >= 4.6 * P;
        return { kind: "i_sectional", w: big ? 140 : 120, h: big ? 110 : 100, less: "i_sofa@136" };
      }
      kind = "i_sofa";
    }
    var len = F.long < 4.0 * P ? 75 : F.long < 5.2 * P ? 100 : F.long < 6.4 * P ? 116 : 136;
    // (a media room's faces the screen across the short way)
    if (job === "media") { len = Math.min(len, F.short - 1.6 * P); }
    if (most) { len = Math.min(len, most); }
    len = FURN_SOFAS.filter(function (s) { return s <= len; }).pop() || FURN_SOFAS[0];
    var less = FURN_SOFAS.filter(function (s) { return s < len; }).pop();
    return { kind: "i_sofa", w: len, h: len > 100 ? 44 : 40, less: less ? "i_sofa@" + less : null };
  }

  // The bed: a king for the main bedroom that has the floor for one -- a
  // nightstand and a way past either side, room at the foot -- else a
  // queen, a double, a single.
  var FURN_BEDS = [["i_bedking", 100, 110, 3.7, 3.9], ["i_bed", 80, 100, 3.0, 3.3], ["i_bed", 70, 100, 2.7, 3.0], ["i_bed1", 50, 100, 0, 0]];
  function furnBed(r, job, kind, most, F) {
    var P = FLOOR_PX, from = kind === "i_bedking" ? 0 : kind === "i_bed" ? 1 : 3;
    // (now and then a double, in a child's room that would take a queen)
    if (from === 1 && job === "bed" && furnHash(r, "bed") < 0.25) { from = 2; }
    if (most) { from = Math.max(from, most); }
    for (var i = from; i < FURN_BEDS.length; i++) {
      var b = FURN_BEDS[i];
      if (F.short >= b[3] * P && F.long >= b[4] * P || i === FURN_BEDS.length - 1) {
        return { kind: b[0], w: b[1], h: b[2], less: i < FURN_BEDS.length - 1 ? kind + "@" + (i + 1) : null };
      }
    }
    return null;
  }

  // A seat put against a wall where it faces the room's television, if it has one.
  function furnFacing(r, kind) {
    var tv = starterNear(r, 0).filter(function (n) { return (n.kind === "i_tv" || n.kind === "i_walltv") && insideArea(r, n.x, n.y); })[0];
    if (!tv) { return null; }
    var box = ICONS[kind].box;
    return { kind: kind, w: box[0], h: box[1], ok: function (spot) {
      var t = (spot.put || 0) * Math.PI / 180, dx = tv.x - spot.x, dy = tv.y - spot.y, len = Math.hypot(dx, dy) || 1;
      return (-Math.sin(t) * dx + Math.cos(t) * dy) / len > 0.35;
    } };
  }

  // A desk: a long one in a roomy study, a little one in a bedroom.
  function furnDesk(job, most, F) {
    var P = FLOOR_PX, w, h;
    if (job === "office") { w = F.short >= 3.6 * P ? 80 : F.short >= 2.8 * P ? 70 : 56; h = w >= 70 ? 40 : 30; }
    else { w = F.short >= 3.6 * P ? 60 : 56; h = 30; }
    if (most) { w = Math.min(w, most); h = w >= 70 ? 40 : 30; }
    return { kind: "i_desk", w: w, h: h, less: w > 50 ? "i_desk@50" : null };
  }

  // ---- room to walk ----------------------------------------------------------------
  // In front of a bed, room to walk round its foot: nothing that stands
  // (a dresser, a chest, a desk) closer to it than this -- and a bed not
  // put where that floor is already taken.
  var FURN_WALK = { i_bed: 0.6, i_bedking: 0.7, i_bed1: 0.5 };
  if (typeof starterFrontClash === "function") {
    starterFrontClash = (function (was) {
      function walk(p) {
        var c = FURN_WALK[p.kind];
        if (!c) { return null; }
        var t = (p.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t), d = p.h / 2 + c * FLOOR_PX / 2;
        return { kind: p.kind, x: p.x + ux * d, y: p.y + uy * d, w: p.w, h: c * FLOOR_PX, turn: p.turn || 0 };
      }
      // (what is beside a bed -- its nightstands, a bench at its foot -- belongs there)
      var BY_BED = { i_nightstand: 1, i_bench: 1, i_chest: 1, i_rug: 1 };
      return function (piece, others) {
        if (was(piece, others)) { return true; }
        var mine = walk(piece);
        if (mine && others.some(function (o) { return !BY_BED[o.kind] && blocksFront(o) && !WALK_DOORS[o.kind] && boxesTouch(mine, o, 1); })) { return true; }
        if (BY_BED[piece.kind] || !blocksFront(piece)) { return false; }
        return others.some(function (o) { var z = walk(o); return z && boxesTouch(z, piece, 1); });
      };
    })(starterFrontClash);
  }

  // ---- a size down, to make room ------------------------------------------------------
  // A table put in first, out in the room, can leave no wall for the
  // sideboard that goes with it: what goes against a wall finding no place,
  // the room's table is made a size smaller and it is tried again.
  function furnSmaller(n) {
    if (n.kind !== "i_dining") { return null; }
    var seats = furnSeats(n.w, n.h).chairs.length;
    var less = FURN_TABLES.filter(function (t) { return t[0] < seats; }).pop();
    return less ? "i_dining@" + less[0] : null;
  }
  if (typeof starterAlong === "function") {
    starterAlong = (function (was) {
      return function (r, kind, near, extra) {
        var put = was(r, kind, near, extra);
        if (put || !r || !r.starter || FURN_SPARE[kind] || ON_THE_WALL[kind] || !ICONS[kind]) { return put; }
        var table = starterNear(r, 0).filter(function (n) { return n.kind === "i_dining" && n.own && insideArea(r, n.x, n.y); })[0];
        var less = table && furnSmaller(table);
        if (!less) { return put; }
        var at = hand.nodes.indexOf(table);
        hand.nodes.splice(at, 1);
        if (!starterMid(r, less)) { hand.nodes.splice(at, 0, table); return put; }
        return starterAlong(r, kind, near, extra);
      };
    })(starterAlong);
  }

  // ---- what the house was asked to be --------------------------------------------
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var was = furnWant;
      furnWant = want;
      try { return yield* inner(want); } finally { furnWant = was; }
    });
  }
