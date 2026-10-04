// ---------------------------------------------------------------------------
//  39-types.js -- Start a house, for other buildings too: a cabin,
//  townhouses in a row, a duplex, a block of apartments, a grocery store,
//  a clothes shop, a cafe, an office, a school
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "let the website design houses, apartments, and
  // other types of buildings too", "let you design things in stores with
  // shelves, aisles things like that", "allow for ALL different house and
  // or building types")
  //
  // Each is laid out the way Start a house lays a house out (39-starter.js)
  // -- floors of two bands of rooms, a hall between them or not -- by a
  // plan of its own: the rooms of each home of a row opening off each
  // other, a stairwell climbing the building bay by bay, a shop floor as
  // deep as a shop's.  What stands in the big rooms is set out in rows: a
  // store's aisles and checkouts, a cafe's tables, an office's desks, a
  // classroom's.
  //
  // In a plan, a room may say: `id`, a name for others to open off it;
  // `via`, the room it opens off (else the hall); `entry`, a way in from
  // the street (its own front door); and, a stairwell's bay, `bay` and
  // `go` -- a flight up, down, or none.
  Object.assign(STARTER_ROOMS, {
    lobby: { w: 4.8, h: 4.6, bw: 4.8, max: 8, wall: ["i_bench", "i_plant", "i_consoletable|i_plant"], mid: ["i_rug"] },
    landing: { w: 4.8, h: 4.6, bw: 4.8, max: 8, wall: ["i_plant", "i_bench"], mid: [] },
    lift: { w: 2.0, h: 4.6, bw: 2.0, max: 2.0, wall: [], mid: [] },
    flat: { w: 6.0, h: 4.6, bw: 6.0, max: 7.2, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_sofa|i_loveseat", "i_tv"], mid: [] },
    flatbed: { w: 3.8, h: 4.6, bw: 3.8, max: 4.6, wall: ["i_bed", "i_nightstand", "i_wardrobe|i_dresser"], mid: [] },
    flatbed2: { w: 4.6, h: 2.6, bw: 4.6, max: 4.6, wall: ["i_bed1|i_bed", "i_nightstand", "i_chest|i_plant"], mid: [] },     // a small one: a single bed
    flatbath: { w: 2.4, h: 2.6, bw: 2.4, max: 3.0, wall: ["i_shower|i_bathtub", "i_toilet", "i_sink"], mid: [] },
    sales: { w: 14, h: 12, bw: 14, max: 60, wall: [], mid: [] },
    stock: { w: 5, h: 4.2, bw: 5, max: 30, wall: ["i_shelving"], mid: [] },
    restroom: { w: 2.2, h: 4.2, bw: 2.2, max: 2.8, wall: ["i_toilet", "i_sink"], mid: [] },
    staff: { w: 3.6, h: 4.2, bw: 3.6, max: 6, wall: ["i_counter", "i_fridge", "i_sofa|i_loveseat"], mid: ["i_roundtable"] },
    fitting: { w: 1.6, h: 3.4, bw: 1.6, max: 1.8, wall: ["i_stool", "i_hooks"], mid: [] },
    boutique: { w: 10, h: 8, bw: 10, max: 40, wall: ["i_shelving", "i_floormirror", "i_plant"], mid: [] },
    cafe: { w: 10, h: 8, bw: 10, max: 40, wall: ["i_plant"], mid: [] },
    cafekitchen: { w: 5.6, h: 4, bw: 5.6, max: 14, wall: ["i_counter", "i_stove", "i_kitchensink", "i_fridge", "i_dishwasher"], mid: [] },
    reception: { w: 4.8, h: 6, bw: 4.8, max: 8, wall: ["i_counter", "i_armchair", "i_armchair", "i_plant"], mid: ["i_coffee"] },
    openoffice: { w: 12, h: 6, bw: 12, max: 60, wall: ["i_printer", "i_plant", "i_filing"], mid: [] },
    meeting: { w: 4.6, h: 4.4, bw: 4.6, max: 7, wall: ["i_plant"], mid: ["i_dining"] },
    kitchenette: { w: 3.6, h: 4.4, bw: 3.6, max: 4.6, wall: ["i_fridge", "i_kitchensink", "i_counter"], mid: ["i_roundtable"] },
    classroom: { w: 8, h: 7, bw: 8, max: 11, wall: ["i_bookcase", "i_plant"], mid: [] }
  });
  Object.assign(STARTER_LABEL, { lobby: "tr_lobby", landing: "tr_landing", lift: "tr_lift", flat: "tr_flat", flatbed: "rl_bed", flatbed2: "rl_bed", flatbath: "rl_bath",
                                 sales: "tr_sales", stock: "tr_stock", restroom: "tr_restroom", staff: "tr_staff", fitting: "tr_fitting",
                                 boutique: "tr_boutique", cafe: "tr_cafe", cafekitchen: "rl_kitchen", reception: "tr_reception",
                                 openoffice: "tr_openoffice", meeting: "tr_meeting", kitchenette: "tr_kitchenette", classroom: "tr_classroom" });
  Object.assign(STARTER_ZONE, { lobby: "hall", landing: "hall", lift: "hall", flat: "day", flatbed: "night", flatbed2: "night", flatbath: "wet", sales: "day",
                                stock: "car", restroom: "wet", staff: "day", fitting: "night", boutique: "day", cafe: "day", cafekitchen: "wet",
                                reception: "hall", openoffice: "day", meeting: "night", kitchenette: "wet", classroom: "day" });
  Object.assign(STARTER_FLOOR_OF, { lobby: "living", landing: "living", lift: "living", flat: "living", flatbed: "bed", flatbed2: "bed", flatbath: "wet",
                                    restroom: "wet", kitchenette: "kitchen", cafekitchen: "kitchen", stock: "garage" });
  Object.assign(STARTER_CEILING, { flat: "i_pendant", flatbed: "i_ceilingfan", flatbed2: "i_pendant", lobby: "i_chandelier", reception: "i_pendant", meeting: "i_pendant",
                                   staff: "i_pendant", landing: "i_pendant", restroom: "i_pendant", stock: "i_pendant", fitting: "i_pendant",
                                   kitchenette: "i_pendant", cafekitchen: "i_pendant", flatbath: "i_pendant" });
  Object.assign(STARTER_WALLS, { flat: [["i_picture", "i_sofa"]], flatbed: [["i_picture", "i_bed"]], flatbed2: [["i_picture", "i_bed1|i_bed"]], flatbath: [["i_mirror", "i_sink"]],
                                 restroom: [["i_mirror", "i_sink"]], lobby: [["i_picture", null], ["i_wallclock", null]],
                                 meeting: [["i_whiteboard", null], ["i_walltv", null]], reception: [["i_picture", null]],
                                 openoffice: [["i_whiteboard", null], ["i_wallclock", null]], cafe: [["i_picture", null], ["i_picture", null], ["i_wallclock", null]],
                                 boutique: [["i_mirror", null]], fitting: [["i_mirror", null]], classroom: [["i_wallclock", null]],
                                 staff: [["i_wallclock", null]], kitchenette: [["i_wallclock", null]] });
  Object.assign(STARTER_VENTED, { flat: 1, flatbed: 1, flatbed2: 1, flatbath: 1, lobby: 1, sales: 1, boutique: 1, cafe: 1, cafekitchen: 1, reception: 1,
                                  openoffice: 1, meeting: 1, classroom: 1, staff: 1, kitchenette: 1, restroom: 1 });
  // no window: a store room, a fitting room, a lift shaft, a stairwell's bay
  var TYPE_DARK = { stock: 1, fitting: 1, lift: 1, restroom: 1 };

  // ---- the plans ---------------------------------------------------------------------
  function typeWidth(band) { return band.reduce(function (s, r) { return s + r.w; }, 0); }
  // A band grown out to W: the rooms that may grow, as far as each may.
  function typeFill(band, W, grow) {
    var short = W - typeWidth(band);
    if (short <= 0.01) { return; }
    var can = band.filter(function (r) { return grow.indexOf(r.kind) >= 0; });
    if (!can.length) { can = [band[band.length - 1]]; }
    can.forEach(function (r) { r.w += short / can.length; });
  }
  function R(kind, w, more) { return Object.assign({ kind: kind, label: "", w: w }, more || {}); }
  // A stairwell: two bays and the lift, a flight up in one bay and the
  // flight down from the floor over it in the other, turn and turn about
  // -- each flight a stair to one other, as a house's are.
  function typeCore(level, top, lift) {
    var A = level % 2 === 0, up = level < top, down = level > 0;
    var core = [R("stairs", 1.4, { bay: "A", go: A ? (up ? "up" : "none") : (down ? "down" : "none"), label: TXT.st_stairs }),
                R("stairs", 1.4, { bay: "B", go: A ? (down ? "down" : "none") : (up ? "up" : "none"), label: TXT.st_stairs })];
    if (lift) { core.push(R("lift", 2.0)); }
    return core;
  }
  // (2026-10-03) as many as anyone could want: typed in past the steps
  var TYPE_MOST = { units: 40, storeys: 60, side: 20, school: 8, classrooms: 40 };
  var BUILDING_TYPES = {
    house: { icon: "floor1" },
    cabin: {
      icon: "cabin", style: "logcabin",
      plan: function (want, rnd) {
        var great = R("great", 6.6 + rnd() * 0.8, { id: "g", entry: true });
        // (the bathroom off the bedroom, not off the kitchen)
        var back = [R("flatbed", 3.8, { id: "m", via: "g", label: want.beds > 1 ? TXT.st_main : "" }), R("bath", 2.4, { via: "m" })];
        if (want.beds > 1) { back.push(R("flatbed", 3.4, { via: "g", label: say("st_bed_n", { n: 2 }) })); }
        var W = Math.max(typeWidth(back), great.w);
        typeFill(back, W, ["flatbed"]); great.w = W;
        return { floors: [{ level: 0, back: back, front: [great], H: 0, Db: 4.0, Df: 5.0 }], W: W, noGarage: true };
      },
      ask: function (ui) { ui.stepper("beds", TXT.st_beds, "bed", 1, 2); }
    },
    townhouses: {
      icon: "row", style: "georgian", together: true,
      plan: function (want) {
        var n = Math.max(2, Math.min(TYPE_MOST.units, want.units || 3)), U = 5.4, G = { level: 0, back: [], front: [], H: 0, Db: 4.2, Df: 4.6 };
        var F1 = { level: 1, back: [], front: [], H: 0, Db: 4.2, Df: 4.6 };
        for (var i = 0; i < n; i++) {
          var l = "l" + i, s = "s" + i, b = "b" + i;
          G.front.push(R("living", U, { id: l, entry: true, label: say("ty_home_n", { n: i + 1 }) }));
          G.back.push(R("stairs", 1.4, { id: s, via: l, bay: "u" + i, go: "up", label: TXT.st_stairs }), R("kitchen", U - 1.4, { via: l }));
          F1.back.push(R("stairs", 1.4, { id: s, bay: "u" + i, go: "down", label: TXT.st_stairs }), R("flatbed", U - 1.4, { id: b, via: s, label: TXT.st_main }));
          F1.front.push(R("flatbed", 3.0, { via: s }), R("bath", U - 3.0, { via: b }));
        }
        return { floors: [G, F1], W: n * U, two: true, noGarage: true };
      },
      ask: function (ui) { ui.stepper("units", TXT.ty_units, "row", 2, TYPE_MOST.units); }
    },
    duplex: {
      icon: "duplex", style: "craftsman", together: true,
      plan: function () {
        var G = { level: 0, back: [], front: [], H: 0, Db: 4.0, Df: 4.6 };
        // two homes back to back across the wall between them, the second the first mirrored
        G.front.push(R("living", 5.2, { id: "l0", entry: true, label: say("ty_home_n", { n: 1 }) }), R("kitchen", 4.4, { id: "k0", via: "l0" }));
        G.back.push(R("flatbed", 3.8, { via: "l0", label: TXT.st_main }), R("bath", 2.4, { via: "l0" }), R("flatbed", 3.4, { via: "k0" }));
        G.front.push(R("kitchen", 4.4, { id: "k1", via: "l1" }), R("living", 5.2, { id: "l1", entry: true, label: say("ty_home_n", { n: 2 }) }));
        G.back.push(R("flatbed", 3.4, { via: "k1" }), R("bath", 2.4, { via: "l1" }), R("flatbed", 3.8, { via: "l1", label: TXT.st_main }));
        return { floors: [G], W: 19.2, noGarage: true };
      }
    },
    apartments: {
      icon: "flats", style: "modern", ceil: 2.7,
      plan: function (want, rnd) {
        var S = Math.max(2, Math.min(TYPE_MOST.storeys, want.storeys || 4)), K = Math.max(1, Math.min(TYPE_MOST.side, want.flatsSide || 2)), B = want.flatBeds > 1 ? 2 : 1;
        var floors = [], W = 0;
        for (var k = 0; k < S; k++) {
          var f = { level: k, back: typeCore(k, S - 1, true), front: [k ? R("landing", 4.8) : R("lobby", 4.8, { entry: true })], H: 1.6, Db: 4.6, Df: 4.6 };
          ["back", "front"].forEach(function (side, si) {
            for (var u = 0; u < K; u++) {
              var id = "a" + k + side + u, name = say("ty_flat_n", { n: (k + 1) + String.fromCharCode(65 + si * K + u) });
              // the bathroom off a bedroom, not off the kitchen: one bedroom and its
              // bathroom beyond it, or a second bedroom and its own over it
              var flat = R("flat", 6.0, { id: id, label: name }), bed = R("flatbed", 3.8, { id: id + "b", via: id, label: B > 1 ? TXT.st_main : "" });
              var unit;
              if (B > 1) {
                var two = { kind: "suite", w: 4.6, parts: [R("flatbed2", 4.6, { id: id + "c", via: id }), R("flatbath", 4.6, { via: id + "c" })] };
                unit = (u + si) % 2 ? [two, flat, bed] : [bed, flat, two];
              } else {
                var bath = R("flatbath", 2.4, { via: id + "b" });
                unit = (u + si) % 2 ? [bath, bed, flat] : [flat, bed, bath];
              }
              Array.prototype.push.apply(f[side], unit);
            }
          });
          floors.push(f);
        }
        floors.forEach(function (f) { W = Math.max(W, typeWidth(f.back), typeWidth(f.front)); });
        floors.forEach(function (f) { typeFill(f.back, W, ["flat"]); typeFill(f.front, W, ["flat", "lobby", "landing"]); });
        void rnd;
        return { floors: floors, W: W, two: S > 1, noGarage: true };
      },
      ask: function (ui) {
        ui.stepper("storeys", TXT.ty_storeys, "flats", 2, TYPE_MOST.storeys);
        ui.stepper("flatsSide", TXT.ty_flats_side, "door", 1, TYPE_MOST.side);
        ui.stepper("flatBeds", TXT.ty_flat_beds, "bed", 1, 2);
      }
    },
    shop: {
      icon: "cart", style: "modern", ceil: 3.4,
      plan: function (want) {
        var s = Math.max(1, Math.min(3, want.size || 2)), W = [14, 19, 26][s - 1], Df = [11, 14, 17][s - 1];
        var back = [R("office", 3.0, { via: "st", label: TXT.tr_office }), R("stock", 5.0, { id: "st", via: "S" }), R("staff", 3.6, { via: "st" }),
                    R("restroom", 2.2, { via: "S" }), R("restroom", 2.2, { via: "S" })];
        W = Math.max(W, typeWidth(back));
        typeFill(back, W, ["stock"]);
        return { floors: [{ level: 0, back: back, front: [R("sales", W, { id: "S", entry: true })], H: 0, Db: 4.2, Df: Df }], W: W, noGarage: true };
      },
      ask: function (ui) { typeSizes(ui); }
    },
    boutique: {
      icon: "hanger", style: "french", ceil: 3.2,
      plan: function (want) {
        var s = Math.max(1, Math.min(3, want.size || 2)), W = [9, 12, 16][s - 1], Df = [7, 9, 11][s - 1];
        var back = [R("fitting", 1.6, { via: "B" }), R("fitting", 1.6, { via: "B" })];
        if (s > 1) { back.push(R("fitting", 1.6, { via: "B" })); }
        back.push(R("stock", 3.0, { id: "st", via: "B" }), R("office", 3.2, { via: "st", label: TXT.tr_office }), R("restroom", 2.2, { via: "B" }));
        W = Math.max(W, typeWidth(back));
        typeFill(back, W, ["stock"]);
        return { floors: [{ level: 0, back: back, front: [R("boutique", W, { id: "B", entry: true })], H: 0, Db: 3.4, Df: Df }], W: W, noGarage: true };
      },
      ask: function (ui) { typeSizes(ui); }
    },
    cafe: {
      icon: "cup", style: "provencal", ceil: 3.2,
      plan: function (want) {
        var s = Math.max(1, Math.min(3, want.size || 2)), W = [9, 12, 16][s - 1], Df = [7, 8.5, 10][s - 1];
        var back = [R("stock", 2.6, { via: "K" }), R("cafekitchen", 5.6, { id: "K", via: "C" }), R("restroom", 2.2, { via: "C" }), R("restroom", 2.2, { via: "C" })];
        W = Math.max(W, typeWidth(back));
        typeFill(back, W, ["cafekitchen"]);
        return { floors: [{ level: 0, back: back, front: [R("cafe", W, { id: "C", entry: true })], H: 0, Db: 4.0, Df: Df }], W: W, noGarage: true };
      },
      ask: function (ui) { typeSizes(ui); }
    },
    office: {
      icon: "office", style: "contemporary", ceil: 3.0,
      plan: function (want) {
        var S = Math.max(1, Math.min(TYPE_MOST.storeys, want.storeys || 1)), s = Math.max(1, Math.min(3, want.size || 2)), W = [16, 22, 30][s - 1];
        var floors = [];
        for (var k = 0; k < S; k++) {
          var back = S > 1 ? typeCore(k, S - 1, true) : [];
          back.push(R("meeting", 4.6), R("office", 3.4, { label: TXT.tr_office }), R("office", 3.4, { label: TXT.tr_office }),
                    R("kitchenette", 3.6), R("restroom", 2.2), R("restroom", 2.2));
          while (typeWidth(back) + 3.4 <= W) { back.splice(back.length - 3, 0, R("office", 3.4, { label: TXT.tr_office })); }
          var front = [k ? R("staff", 4.8, { label: TXT.tr_breakout }) : R("reception", 4.8, { entry: true }), R("openoffice", W - 4.8)];
          floors.push({ level: k, back: back, front: front, H: 1.8, Db: 4.4, Df: 6.4 });
        }
        var Wd = 0;
        floors.forEach(function (f) { Wd = Math.max(Wd, typeWidth(f.back), typeWidth(f.front)); });
        floors.forEach(function (f) { typeFill(f.back, Wd, ["meeting"]); typeFill(f.front, Wd, ["openoffice"]); });
        return { floors: floors, W: Wd, two: S > 1, noGarage: true };
      },
      ask: function (ui) { ui.stepper("storeys", TXT.ty_storeys, "flats", 1, TYPE_MOST.storeys); typeSizes(ui); }
    },
    school: {
      icon: "school", style: "georgian", ceil: 3.0,
      plan: function (want) {
        var S = Math.max(1, Math.min(TYPE_MOST.school, want.storeys || 1)), n = Math.max(2, Math.min(TYPE_MOST.classrooms, want.rooms || 4));
        var floors = [];
        for (var k = 0; k < S; k++) {
          var back = (S > 1 ? typeCore(k, S - 1, false) : []).concat([R("restroom", 2.6), R("restroom", 2.6)]);
          var front = [k ? R("staff", 5.0) : R("lobby", 5.0, { entry: true, label: TXT.tr_school_office })];
          for (var c = 0; c < n; c++) { (c % 2 ? back : front).push(R("classroom", 8.0, { label: say("ty_class_n", { n: (k + 1) * 100 + c + 1 }) })); }
          floors.push({ level: k, back: back, front: front, H: 2.4, Db: 7.0, Df: 7.0 });
        }
        var W = 0;
        floors.forEach(function (f) { W = Math.max(W, typeWidth(f.back), typeWidth(f.front)); });
        floors.forEach(function (f) { typeFill(f.back, W, ["classroom"]); typeFill(f.front, W, ["classroom"]); });
        return { floors: floors, W: W, two: S > 1, noGarage: true };
      },
      ask: function (ui) { ui.stepper("storeys", TXT.ty_storeys, "flats", 1, TYPE_MOST.school); ui.stepper("rooms", TXT.ty_classrooms, "school", 2, TYPE_MOST.classrooms); }
    }
  };
  var TYPE_WANT = { type: "house", units: 3, storeys: 4, flatsSide: 2, flatBeds: 1, size: 2, rooms: 4 };
  var TYPE_ORDER = ["house", "cabin", "townhouses", "duplex", "apartments", "shop", "boutique", "cafe", "office", "school"];
  // (what was picked last time, kept in the browser by 39-starter.js, stays picked)
  Object.keys(TYPE_WANT).forEach(function (k) { if (starterWant[k] === undefined) { starterWant[k] = TYPE_WANT[k]; } });
  function typeOf(want) { return BUILDING_TYPES[want && want.type] || BUILDING_TYPES.house; }
  // small, medium or large
  function typeSizes(ui) {
    ui.head(TXT.ty_size);
    ui.tiles();
    [[1, TXT.ty_small, "size1"], [2, TXT.ty_medium, "size2"], [3, TXT.ty_large, "size3"]].forEach(function (t) {
      ui.tile(t[1], t[2], function () { return (ui.want.size || 2) === t[0]; }, function () { ui.want.size = t[0]; }, true);
    });
  }
  if (typeof starterPlan === "function") {
    var starterPlanHouse = starterPlan;
    starterPlan = function (want, rnd) {
      var T = typeOf(want);
      if (!T.plan) { return starterPlanHouse.apply(this, arguments); }
      var plan = T.plan(want, rnd || starterRand(1));
      plan.ceil = T.ceil;
      // the rooms of kinds a house has not, named for what they are
      plan.floors.forEach(function (f) {
        f.back.concat(f.front).forEach(function (r) {
          (r.kind === "suite" ? r.parts : [r]).forEach(function (q) {
            var key = STARTER_LABEL[q.kind];
            if (!q.label && key && key.indexOf("tr_") === 0) { q.label = TXT[key] || ""; }
          });
        });
      });
      return plan;
    };
  }

  // ---- what stands in the big rooms ------------------------------------------------------
  // Spots in a grid over a room, each taken where it is clear of what is
  // there (and of the doors' swings, stood in for while a house is made).
  function typeClear(spot, gap) {
    // (only what stands near: anything that can touch the spot, or the
    // room in front of either, is within a metre and the gap of it)
    var near = typeof starterNear === "function" ? starterNear(spot, Math.max(8, gap || 0) + FLOOR_PX + 8) : hand.nodes;
    var others = near.filter(function (o) {
      return o !== spot && !isArea(o.kind) && !ON_THE_WALL[o.kind] && !FROM_CEILING[o.kind] && o.kind !== "i_window" && !LIES_FLAT[o.kind];
    });
    if (others.some(function (o) { return boxesTouch(spot, o, WALK_DOORS[o.kind] ? 8 : gap); })) { return false; }
    // nor in front of an oven, a drawer, a desk -- nor needing room something takes
    return !(typeof starterFrontClash === "function" && starterFrontClash(spot, others));
  }
  var typeRoom = null;                   // the room being furnished: nothing put through its walls
  function typePut(kind, x, y, turn, gap) {
    var icon = ICONS[kind];
    if (!icon) { return null; }
    var spot = { kind: kind, x: Math.round(x), y: Math.round(y), w: icon.box[0], h: icon.box[1], turn: turn || 0 };
    if (typeRoom) {
      var q = turned(spot), b = tieBox(typeRoom), T = roomWallOf(typeRoom) + 2;
      if (spot.x - q.w / 2 < b.l + T || spot.x + q.w / 2 > b.r - T || spot.y - q.h / 2 < b.t + T || spot.y + q.h / 2 > b.b - T) { return null; }
    }
    if (!typeClear(spot, gap === undefined ? 3 : gap)) { return null; }
    return adviceAdd(kind, spot.x, spot.y, turn || 0);
  }
  // Turned to face a spot: a chair at a table, a pupil at the board.
  function typeFacing(from, to) {
    var t = Math.atan2(-(to.x - from.x), to.y - from.y) * 180 / Math.PI;
    return ((Math.round(t / 90) * 90) % 360 + 360) % 360;
  }
  function typeChairs(table, kinds, round) {
    var P = FLOOR_PX, w = table.w, h = table.h, out = [];
    var spots = round ? [[0, -h / 2 - 0.42 * P], [0, h / 2 + 0.42 * P], [-w / 2 - 0.42 * P, 0], [w / 2 + 0.42 * P, 0]]
                      : [[-w / 4, -h / 2 - 0.4 * P], [w / 4, -h / 2 - 0.4 * P], [-w / 4, h / 2 + 0.4 * P], [w / 4, h / 2 + 0.4 * P]];
    if (!round && w > 2.0 * P) { spots.push([-w / 2 - 0.4 * P, 0], [w / 2 + 0.4 * P, 0]); }
    spots.forEach(function (s) {
      var x = table.x + s[0], y = table.y + s[1], t = typeFacing({ x: x, y: y }, table);
      var c = typePut(kinds || "i_chair", x, y, t, 1);
      if (c) { out.push(c); }
    });
    return out;
  }
  // A grocery store: coolers along the back wall, checkouts by the way
  // in, a table of fruit and vegetables by the door, and between them
  // aisles of shelving -- 1.4 m apart, wide enough for two carts to pass.
  function typeStore(r, rnd) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
    var door = hand.nodes.filter(function (d) { return d.kind === "i_door" && Math.abs(d.x - r.x) < r.w / 2 && Math.abs(d.y - (r.y + r.h / 2)) < 3 * P; })[0];
    var dx = door ? door.x : r.x;
    // the coolers, back to the back wall
    var cw = ICONS.i_cooler.box[0], ch = ICONS.i_cooler.box[1];
    for (var x = b.l + T + 0.4 * P + cw / 2; x < b.r - T - cw / 2 - 0.3 * P; x += cw + 2) { typePut("i_cooler", x, b.t + T + ch / 2 + 2, 0); }
    // the checkouts, in a row by the front, a way left open to the door
    var kw = ICONS.i_checkout.box[0], kh = ICONS.i_checkout.box[1], ky = b.b - T - 2.0 * P - kh / 2, made = 0;
    var lanes = Math.max(2, Math.min(5, Math.floor(r.w / (6 * P))));
    for (var k = 0; k < 12 && made < lanes; k++) {
      var cx = dx - 2.0 * P - kw / 2 - k * (kw + 1.2 * P);
      if (cx - kw / 2 < b.l + T + 0.6 * P) { break; }
      if (typePut("i_checkout", cx, ky, 180)) { made++; }
    }
    // fruit and vegetables on the other side of the door
    for (var d = 0; d < 3; d++) { typePut("i_display", dx + 2.4 * P + d * 1.9 * P, b.b - T - 2.4 * P, 0); }
    // the aisles: runs of shelving, front to back
    var gw = ICONS.i_gondola.box[1], gl = ICONS.i_gondola.box[0];      // turned: 0.9 m across, 1.2 m along
    var y0 = b.t + T + ch + 1.6 * P, y1 = ky - kh / 2 - 2.2 * P;
    for (var ax = b.l + T + 1.6 * P + gw / 2; ax < b.r - T - 1.2 * P - gw / 2; ax += gw + 1.4 * P) {
      var units = Math.floor((y1 - y0) / gl), mid = units > 7 ? Math.floor(units / 2) : -1;
      for (var u = 0; u < units; u++) {
        if (u === mid) { continue; }                              // a cross aisle half way
        typePut("i_gondola", ax, y0 + gl / 2 + u * gl, 90, 0);
      }
    }
  }
  // A clothes shop: rails of clothes in rows, a counter with its till at
  // the back, mirrors by the fitting rooms.
  function typeBoutique(r) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
    var counter = typePut("i_counter", r.x + r.w * 0.22, b.t + T + 0.9 * P, 0);
    if (counter) { adviceAdd("i_register", counter.x, counter.y); }
    var rw = ICONS.i_closetrod.box[0];
    for (var y = b.t + T + 2.8 * P; y < b.b - T - 2.0 * P; y += 1.9 * P) {
      for (var x = b.l + T + 1.4 * P + rw / 2; x < b.r - T - 1.0 * P - rw / 2; x += rw + 1.3 * P) {
        if (Math.abs(x - r.x) < rw && y > b.b - T - 3.4 * P) { continue; }   // the way in
        typePut("i_closetrod", x, y, 0, 4);
      }
    }
    typePut("i_floormirror", b.l + T + 0.5 * P, b.t + T + 1.2 * P, 90);
  }
  // A cafe: the counter along the back, its till and its coffee machine,
  // a case of cakes, and tables, each with its chairs.
  function typeCafe(r) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
    var len = Math.min(r.w * 0.5, 6 * P), cw = ICONS.i_counter.box[0];
    var cx0 = r.x - len / 2;
    for (var x = cx0 + cw / 2; x <= cx0 + len - cw / 2 + 1; x += cw) {
      var c = typePut("i_counter", x, b.t + T + ICONS.i_counter.box[1] / 2 + 2, 0, 0);
      if (c && x === cx0 + cw / 2) { adviceAdd("i_register", c.x, c.y); }
      else if (c && !hand.nodes.some(function (n) { return n.kind === "i_coffeemaker" && insideArea(r, n.x, n.y); })) { adviceAdd("i_coffeemaker", c.x, c.y); }
    }
    typePut("i_display", cx0 + len + 1.0 * P, b.t + T + 1.0 * P, 0);
    for (var y = b.t + T + 2.9 * P; y < b.b - T - 1.4 * P; y += 2.3 * P) {
      for (var tx = b.l + T + 1.3 * P; tx < b.r - T - 1.2 * P; tx += 2.3 * P) {
        if (Math.abs(tx - r.x) < 1.6 * P && y > b.b - T - 3.2 * P) { continue; }  // the way in
        var t = typePut("i_roundtable", tx, y, 0, 30);
        if (t) { typeChairs(t, "i_chair", true); }
      }
    }
  }
  // An office: desks in pairs facing each other, a chair at each.
  function typeOffice(r) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), dw = ICONS.i_desk.box[0], dh = ICONS.i_desk.box[1];
    for (var y = b.t + T + 1.5 * P + dh; y < b.b - T - 1.4 * P - dh; y += 2 * dh + 2.4 * P) {
      for (var x = b.l + T + 1.4 * P + dw / 2; x < b.r - T - 1.2 * P - dw / 2; x += dw + 0.15 * P) {
        [[y - dh / 2, 180], [y + dh / 2, 0]].forEach(function (s) {
          var d = typePut("i_desk", x, s[0], s[1], 0);
          if (!d) { return; }
          var away = s[1] === 0 ? 1 : -1;
          typePut("i_officechair", x, s[0] + away * (dh / 2 + 0.38 * P), s[1] === 0 ? 180 : 0, 1);
          adviceAdd("i_monitor", d.x, d.y);
        });
      }
    }
  }
  // A classroom: the board on the side wall, the teacher's desk before it,
  // the pupils' desks in rows facing it.
  function typeClassroom(r) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r);
    var board = typeof starterAlong === "function" ? starterAlong(r, "i_whiteboard", { x: b.l, y: r.y }) : null;
    if (board) { board(); }
    typePut("i_desk", b.l + T + 1.5 * P, r.y, 90);
    for (var x = b.l + T + 3.2 * P; x < b.r - T - 0.7 * P; x += 1.15 * P) {
      for (var y = b.t + T + 1.0 * P; y < b.b - T - 0.8 * P; y += 1.35 * P) {
        typePut("i_schooldesk", x, y, 270, 2);
      }
    }
  }
  // A sofa that ended up with its back to the television: set out in front
  // of it instead, facing it -- or a loveseat there; or, with no room for
  // either, the television taken away.
  function typeSofaFacing(r) {
    var P = FLOOR_PX;
    var tv = hand.nodes.filter(function (n) { return (n.kind === "i_tv" || n.kind === "i_walltv") && insideArea(r, n.x, n.y); })[0];
    var seat = hand.nodes.filter(function (n) { return (n.kind === "i_sofa" || n.kind === "i_loveseat") && insideArea(r, n.x, n.y); })[0];
    if (!tv || !seat) { return; }
    // facing it as Check has it (38-advice.js): the set within 70 degrees or so of straight ahead
    function faces(s, t) {
      var a = (s.turn || 0) * Math.PI / 180, dx = t.x - s.x, dy = t.y - s.y, len = Math.hypot(dx, dy) || 1;
      return (-Math.sin(a) * dx + Math.cos(a) * dy) / len > 0.35;
    }
    if (faces(seat, tv)) { return; }
    var ta = (tv.turn || 0) * Math.PI / 180, fx = -Math.sin(ta), fy = Math.cos(ta), sx = Math.cos(ta), sy = Math.sin(ta);
    hand.nodes = hand.nodes.filter(function (n) { return n !== seat; });
    var kinds = [seat.kind, "i_loveseat", "i_armchair"];
    for (var k = 0; k < kinds.length; k++) {
      for (var d = 2.8; d >= 1.4; d -= 0.2) {
        for (var side = 0; side <= 1.6; side += 0.4) {
          var picks = side ? [side, -side] : [0];
          for (var q = 0; q < picks.length; q++) {
            var x = tv.x + fx * d * P + sx * picks[q] * P, y = tv.y + fy * d * P + sy * picks[q] * P;
            var put = typePut(kinds[k], x, y, typeFacing({ x: x, y: y }, tv), 2);
            if (put && faces(put, tv)) { return; }
            if (put) { hand.nodes = hand.nodes.filter(function (n) { return n !== put; }); }
          }
        }
      }
    }
    // no room for a seat before it: the seat back where it was, the
    // television to the wall in front of the seat instead
    hand.nodes.push(seat);
    var a = (seat.turn || 0) * Math.PI / 180;
    hand.nodes = hand.nodes.filter(function (n) { return n !== tv; });
    var again = starterAlong(r, tv.kind, { x: seat.x - Math.sin(a) * r.w, y: seat.y + Math.cos(a) * r.h });
    if (again) {
      again();
      var moved = hand.nodes[hand.nodes.length - 1];
      if (moved && moved.kind === tv.kind && faces(seat, moved)) { return; }
      if (moved && moved.kind === tv.kind) { hand.nodes.pop(); }
    }
    hand.nodes.push(tv);
  }
  // A table somewhere it fits, as near as can be to what it goes with (the
  // kitchen), with its chairs.
  function typeTableBy(r, near) {
    var P = FLOOR_PX, b = tieBox(r), aim = hand.nodes.filter(function (n) { return n.kind === near && insideArea(r, n.x, n.y); })[0] || r, spots = [];
    for (var x = b.l + 0.9 * P; x < b.r - 0.9 * P; x += 0.2 * P) {
      for (var y = b.t + 0.9 * P; y < b.b - 0.9 * P; y += 0.2 * P) { spots.push([x, y]); }
    }
    spots.sort(function (p, q) { return Math.hypot(p[0] - aim.x, p[1] - aim.y) - Math.hypot(q[0] - aim.x, q[1] - aim.y); });
    for (var i = 0; i < spots.length; i++) {
      var t = typePut("i_roundtable", spots[i][0], spots[i][1], 0, 0.9 * P);
      if (t) { typeChairs(t, "i_chair", true); return t; }
    }
    return null;
  }
  // A big room's lights: in rows across its ceiling, four metres apart.
  var TYPE_LIT = { sales: 1, boutique: 1, cafe: 1, openoffice: 1, classroom: 1 };
  function typeLights(r) {
    var P = FLOOR_PX, b = tieBox(r), nx = Math.max(1, Math.round((b.r - b.l) / (4 * P))), ny = Math.max(1, Math.round((b.b - b.t) / (4 * P)));
    for (var i = 0; i < nx; i++) {
      for (var j = 0; j < ny; j++) {
        adviceAdd("i_pendant", Math.round(b.l + (i + 0.5) * (b.r - b.l) / nx), Math.round(b.t + (j + 0.5) * (b.b - b.t) / ny));
      }
    }
  }
  function typeFurnish(made, rnd, want, plan) {
    var T = typeOf(want);
    if (!T.plan) { return; }
    var floorsOfRoom = { sales: ["tiles", "#dfe2e4"], boutique: ["herringbone", "#b48a5e"], cafe: ["checker", "#f2f0ea"],
                         openoffice: ["carpet", "#7f8794"], meeting: ["carpet", "#7f8794"], reception: ["terrazzo", "#e7e2d8"],
                         lobby: ["terrazzo", "#e7e2d8"], landing: ["terrazzo", "#e7e2d8"], classroom: ["tiles", "#c9c3b6"],
                         stock: ["concrete", "#a8a8a4"], cafekitchen: ["tiles", "#dfe2e4"], restroom: ["tiles", "#f4f4f1"],
                         staff: ["boards", "#b98d63"], kitchenette: ["tiles", "#dfe2e4"], fitting: ["carpet", "#a9a39a"], lift: ["concrete", "#8c8c88"] };
    var lifts = [];
    made.forEach(function (r) {
      var kind = r.starter;
      typeRoom = r;
      if (TYPE_USE[kind]) { r.use = kind; }
      if (plan && plan.ceil) { r.ceil = plan.ceil; }
      if (floorsOfRoom[kind]) {
        var m = Object.assign({}, r.mat || {});
        m.floor = floorsOfRoom[kind][0]; m.floorC = floorsOfRoom[kind][1];
        if (kind !== "staff" && kind !== "flat" && kind !== "flatbed") { m.wall = "paint"; m.wallC = kind === "cafe" ? "#e8e4da" : "#f2efe8"; }
        r.mat = m;
      }
      try {
        if (kind === "sales") { typeStore(r, rnd); }
        else if (kind === "boutique") { typeBoutique(r); }
        else if (kind === "cafe") { typeCafe(r); }
        else if (kind === "openoffice") { typeOffice(r); }
        else if (kind === "classroom") { typeClassroom(r); }
        else if (kind === "stock") {
          for (var more = 0; more < 6; more++) { var put = starterAlong(r, "i_shelving", null); if (!put) { break; } put(); }
        }
        else if (kind === "lift" && ICONS.i_elevator) { var at = typeLiftAt(r); lifts.push(adviceAdd("i_elevator", Math.round(at[0]), Math.round(at[1]))); }
        if (kind === "flat") { typeSofaFacing(r); typeTableBy(r, "i_counter"); }
        if (TYPE_LIT[kind]) { typeLights(r); }
        if (kind === "meeting" || kind === "staff" || kind === "kitchenette" || kind === "flat") {
          hand.nodes.filter(function (t) { return (t.kind === "i_dining" || t.kind === "i_roundtable") && insideArea(r, t.x, t.y); })
            .forEach(function (t) { typeChairs(t, "i_chair", t.kind === "i_roundtable"); });
        }
      } catch (e) { /* the room as it is */ }
    });
    typeRoom = null;
    // the lift, from each floor to the one over it (made floor by floor, in
    // order) -- each car to the one at the same place on the next floor: two
    // side by side were linked one to the other, and each floor came twice
    var fls = floorsOf(), byFloor = [];
    lifts.forEach(function (l) {
      var f = floorAt(fls, l.x, l.y), last = byFloor[byFloor.length - 1];
      if (f && last && last.f === f) { last.l.push(l); } else { byFloor.push({ f: f, l: [l] }); }
    });
    if (byFloor.some(function (g) { return !g.f; })) { byFloor = lifts.map(function (l) { return { l: [l] }; }); }
    for (var i = 0; i + 1 < byFloor.length; i++) {
      byFloor[i].l.forEach(function (l, j) {
        var up = byFloor[i + 1].l[j] || byFloor[i + 1].l[byFloor[i + 1].l.length - 1];
        hand.links.push({ from: l.id, to: up.id, label: "" });
      });
    }
  }
  // Where in its room a lift stands: a car's depth in from its doors, not
  // the middle of a room six metres long (the car is drawn round it, 40-climb.js).
  function typeLiftAt(r) {
    var door = hand.nodes.filter(function (d) { return WALK_DOORS[d.kind] && insideArea(r, d.x, d.y, 14); })
      .sort(function (p, q) { return Math.hypot(p.x - r.x, p.y - r.y) - Math.hypot(q.x - r.x, q.y - r.y); })[0];
    if (!door || r.turn) { return [r.x, r.y]; }
    var hw = r.w / 2, hh = r.h / 2, lx = door.x - r.x, ly = door.y - r.y, b = 1.15 * FLOOR_PX;
    if (Math.abs(ly) / hh >= Math.abs(lx) / hw) { return [r.x, ly < 0 ? r.y - hh + Math.min(b, hh) : r.y + hh - Math.min(b, hh)]; }
    return [lx < 0 ? r.x - hw + Math.min(b, hw) : r.x + hw - Math.min(b, hw), r.y];
  }
  // what each of these rooms is for, kept on it (roomKind, 38-advice.js)
  var TYPE_USE = { restroom: 1, cafekitchen: 1, sales: 1, boutique: 1, cafe: 1, reception: 1, staff: 1, meeting: 1, openoffice: 1,
                   classroom: 1, lobby: 1, landing: 1, lift: 1, stock: 1, fitting: 1, kitchenette: 1, flatbath: 1, flatbed: 1, flatbed2: 1, flat: 1 };
  // Made: its style put on (the type's own unless another was picked),
  // and the house's settings a shop or a block of flats wants.
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      if (typeOf(want).together && want.spread) { want = Object.assign({}, want, { spread: false }); }
      var out = yield* inner(want);
      try {
        var T = typeOf(want), key = want.style !== undefined ? want.style : (T.style || "");
        if (key && typeof HOUSE_STYLES === "object" && HOUSE_STYLES[key]) { styleApplyQuiet(key); }
      } catch (e) { /* as made */ }
      return out;
    });
  }
  function styleApplyQuiet(key) {
    var keep = keepUndo;
    try { keepUndo = function () {}; styleApply(key); } finally { keepUndo = keep; }
  }

  // ---- asked -----------------------------------------------------------------------------
  // What to build, at the top of Start a house: a picture each.
  Object.assign(HOUSE_ICONS, {
    cabin: '<path d="M2.4 10.6 10 3.4l7.6 7.2"/><path d="M4.4 9v7.6h11.2V9M8.4 16.6v-4h3.2v4M4.4 12h3M12.6 12h3"/>',
    row: '<path d="M1.6 8.4 4.6 5.4l3 3 3-3 3 3 3-3 3 3"/><path d="M2.6 7.4v9.2h14.8V7.4M5.6 16.6v-3h2v3M12.4 16.6v-3h2v3M7.6 8.4v8.2M12.4 8.4v8.2"/>',
    duplex: '<path d="M2 9.4 10 3.4l8 6"/><path d="M3.6 8.2v8.4h12.8V8.2M10 6v10.6M5.6 16.6v-3.4h2.2v3.4M12.2 16.6v-3.4h2.2v3.4"/>',
    flats: '<path d="M4 17.4V3h12v14.4M2.6 17.4h14.8M6.6 5.6h1.6M11.8 5.6h1.6M6.6 8.6h1.6M11.8 8.6h1.6M6.6 11.6h1.6M11.8 11.6h1.6M8.6 17.4v-2.8h2.8v2.8"/>',
    cart: '<path d="M2.4 3.6h2.2l2 9.4h9l1.8-6.6H5.4"/><circle cx="7.8" cy="15.8" r="1.3"/><circle cx="14.2" cy="15.8" r="1.3"/>',
    hanger: '<path d="M10 6.4a1.8 1.8 0 1 0-1.8-1.8M10 6.4v1.2L2.6 13a.9.9 0 0 0 .5 1.6h13.8a.9.9 0 0 0 .5-1.6L10 7.6"/>',
    cup: '<path d="M3.4 7.4h10.2v4.4a4 4 0 0 1-4 4H7.4a4 4 0 0 1-4-4zM13.6 8.6h1.2a2 2 0 0 1 0 4h-1.2M6 2.8v2.4M9 2.8v2.4"/>',
    office: '<path d="M3 17.4V4.6h9v12.8M12 8.4h5v9M2 17.4h16M5.4 7h1.4M8.2 7h1.4M5.4 10h1.4M8.2 10h1.4M5.4 13h1.4M8.2 13h1.4M14 11h1.4M14 14h1.4"/>',
    school: '<path d="M2.4 8.2 10 3.6l7.6 4.6M4.4 7.4v10h11.2v-10M8.4 17.4v-3.8h3.2v3.8M6.4 10.4h1.6M12 10.4h1.6M10 3.6V1.8h2.4"/>',
    door: '<path d="M5 17.4V3h10v14.4M3.4 17.4h13.2M12 10.4h.8"/>',
    size1: '<rect x="7" y="9" width="6" height="6" rx="1"/>',
    size2: '<rect x="5.2" y="6.4" width="9.6" height="9.6" rx="1.2"/>',
    size3: '<rect x="3" y="3.6" width="14" height="13" rx="1.4"/>'
  });
  function typeChips(pick, want, rebuild) {
    var h = document.createElement("div");
    h.className = "st-head";
    h.textContent = TXT.ty_head;
    pick.appendChild(h);
    var row = document.createElement("div");
    row.className = "ty-chips";
    row.setAttribute("role", "radiogroup");
    row.setAttribute("aria-label", TXT.ty_head);
    TYPE_ORDER.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      var on = (want.type || "house") === k;
      b.className = "ty-chip" + (on ? " on" : "");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.innerHTML = houseIcon(BUILDING_TYPES[k].icon) + "<span></span>";
      b.lastChild.textContent = TXT["ty_" + k];
      b.onclick = function () {
        if ((want.type || "house") === k) { return; }
        want.type = k;
        delete want.style;                  // the new type's own style, until another is picked
        rebuild();
      };
      row.appendChild(b);
    });
    pick.appendChild(row);
  }
  // The style, picked with arrows either side of a picture of it.
  function typeStyleRow(pick, want, redraw) {
    if (typeof HOUSE_STYLES !== "object") { return; }
    var keys = [""].concat(Object.keys(HOUSE_STYLES));
    function now() { return want.style !== undefined ? want.style : (typeOf(want).style || ""); }
    var h = document.createElement("div");
    h.className = "st-head";
    h.textContent = TXT.sy_head;
    pick.appendChild(h);
    var row = document.createElement("div");
    row.className = "ty-style";
    row.innerHTML = '<button type="button" class="st-step-btn" data-d="-1"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.6 5.6 8l4.4 4.4"/></svg></button>' +
                    '<span class="ty-style-pic"></span><span class="ty-style-words"><b></b><span></span></span>' +
                    '<button type="button" class="st-step-btn" data-d="1"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.6 10.4 8 6 12.4"/></svg></button>';
    var less = row.querySelector('[data-d="-1"]'), more = row.querySelector('[data-d="1"]');
    less.setAttribute("aria-label", TXT.ty_style_prev);
    more.setAttribute("aria-label", TXT.ty_style_next);
    function show() {
      var k = now(), S = HOUSE_STYLES[k];
      row.querySelector(".ty-style-pic").innerHTML = styleArt(k || "plain");
      row.querySelector("b").textContent = S ? TXT["sy_" + k] || k : TXT.sy_plain;
      row.querySelector(".ty-style-words span").textContent = S ? TXT["sy_r_" + S.at] : TXT.sy_plain_sub;
    }
    function step(d) {
      var i = keys.indexOf(now());
      want.style = keys[(i + d + keys.length) % keys.length];
      show(); redraw();
    }
    less.onclick = function () { step(-1); };
    more.onclick = function () { step(1); };
    show();
    pick.appendChild(row);
  }
