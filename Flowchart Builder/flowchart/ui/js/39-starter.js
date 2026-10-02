// ---------------------------------------------------------------------------
//  39-starter.js -- Start a house: a home laid out and furnished from a few
//  choices, to begin a floor plan from
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-01: "add more things icons and features ... to make
  // it better")  A floor plan from nothing is a lot of rooms to put down and
  // a lot of furniture to put in them.  Start a house asks how many bedrooms
  // and bathrooms, and which of a few more rooms, lays the house out, and
  // furnishes it -- spread out on the paper, joined by arrows, or put
  // together as it stands.  The windows go in walls that are outside once it
  // is put together, a front door off the living room, and it is one step
  // for Undo.
  //
  // (2026-10-01: "make it so the layout is actually reasonable", "allow 2
  // stories and a basement")  It is laid out in bands, the way a house is: a
  // hall the width of the house, the rooms at the back along one side of it
  // and those at the front along the other -- every room opening off the
  // hall, the outside a rectangle, a band's walls in line.  The bedrooms are
  // at the back, or upstairs; the living room at the front with the front
  // door; the garage at the end of the front, through the laundry room.  On
  // every floor the stairs are at the same end of the hall, one over the
  // other.  Each arrow keeps where its two rooms go together (`fit`,
  // 39-join.js), so 3D puts the house together just as it was laid out.
  var STARTER_ROOMS = {
    // metres across and deep, and what goes in: against a wall, or in the
    // middle; `bw` the width it has in a band of the house and `max` the
    // most it grows to, filling a band out
    living: { w: 5.2, h: 4.2, bw: 5.8, max: 8.2, wall: ["i_sofa", "i_tv", "i_armchair", "i_lamp", "i_plant"], mid: ["i_rug", "i_coffee"] },
    kitchen: { w: 3.8, h: 3.4, bw: 4.2, max: 5.6, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_dishwasher"], mid: [] },
    great: { w: 6.4, h: 4.0, bw: 7.0, max: 9.2, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_dishwasher"], mid: ["i_dining"] },
    dining: { w: 4.0, h: 3.6, bw: 4.4, max: 5.6, wall: ["i_sideboard|i_hutch|i_consoletable", "i_plant"], mid: ["i_dining|i_roundtable"] },
    main: { w: 4.4, h: 4.2, bw: 5.2, max: 6.2, wall: ["i_bedking", "i_nightstand", "i_nightstand", "i_wardrobe", "i_dresser"], mid: [] },
    bed: { w: 3.4, h: 3.4, bw: 3.8, max: 4.8, wall: ["i_bed", "i_nightstand", "i_wardrobe", "i_desk"], mid: [] },
    bath: { w: 3.0, h: 2.4, bw: 2.8, max: 3.4, wall: ["i_bathtub", "i_toilet", "i_vanity|i_sink", "i_sconce"], mid: [] },
    ensuite: { w: 2.4, h: 2.2, wall: ["i_shower", "i_toilet", "i_sink", "i_sconce"], mid: [] },
    office: { w: 3.0, h: 3.0, bw: 3.4, max: 4.2, wall: ["i_desk", "i_bookcase", "i_filing"], mid: ["i_officechair"] },
    laundry: { w: 3.0, h: 2.6, bw: 2.6, max: 3.4, wall: ["i_washer", "i_dryer", "i_utilitysink|i_hamper"], mid: [] },
    garage: { w: 6.0, h: 6.2, wall: ["i_workbench", "i_shelving"], mid: ["i_parked"] },
    closet: { w: 2.6, h: 2.0, wall: ["i_closetrod|i_closetshelves"], mid: [] },
    hall: { w: 6.0, h: 1.4, wall: ["i_sconce", "i_sconce"], mid: [] },
    stairs: { w: 1.4, h: 4.2, bw: 1.4, max: 1.4, wall: ["i_sconce"], mid: [] },
    family: { w: 5.0, h: 4.2, bw: 5.4, max: 14, wall: ["i_sectional|i_sofa", "i_tv", "i_lamp"], mid: ["i_rug", "i_coffee"] },
    storage: { w: 3.0, h: 4.2, bw: 3.0, max: 9, wall: ["i_shelving", "i_shelving", "i_sconce"], mid: [] },
    utility: { w: 3.0, h: 4.2, bw: 3.0, max: 3.4, wall: ["i_furnace", "i_shelving", "i_sconce"], mid: [] }
  };
  var STARTER_GAP = 100;                 // px between rooms spread out: room for the arrows
  var STARTER_HALL = 1.5;                // metres, the hall across
  var STARTER_BAND = 4.4;                // metres, a band of rooms deep
  var starterLast = [];                  // the rooms last made, and what each was to be
  var starterWant = { beds: 3, baths: 2, open: true, office: false, laundry: true, garage: true, closet: true, spread: true,
                      floors: 1, basement: false, roofOne: true, lot: true };

  // ---- each house its own --------------------------------------------------------------
  // (2026-10-01: "when I make a house with the same toggles active it makes
  // the same house interior and not something different because it is not
  // seeded")  A house is made from a seed, new each time: the same choices
  // make another house -- mirrored or not, its rooms in another order, a
  // little bigger or smaller, a look of its own (what the floors, the walls,
  // the outside and the roof are made of, and in what colors), the
  // furniture's own colors, which of two pieces it has, and a few more.
  function starterRand(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function starterPick(rnd, list) { return list[Math.floor(rnd() * list.length) % list.length]; }
  function starterShuffle(rnd, list) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = out[i]; out[i] = out[j]; out[j] = t; }
    return out;
  }
  // The looks a house can have: what each kind of floor is, the walls
  // inside (and now and then one room's in something else), the outside and
  // the roof -- each in one of the colors it comes in (HOUSE_TINTS).
  var STARTER_LOOKS = [
    { living: ["boards", "parquet"], bed: ["carpet", "boards"], wet: ["tiles", "hextiles"], kitchen: ["tiles", "checker"],
      wall: ["paint"], accent: ["wallpaper"], out: ["siding", "brick"], roof: ["shingles"] },                       // classic
    { living: ["concrete", "terrazzo", "boards"], bed: ["boards"], wet: ["tiles", "terrazzo"], kitchen: ["terrazzo", "tiles"],
      wall: ["plaster", "paint"], accent: ["concrete"], out: ["cladding", "stucco", "concrete"], roof: ["metal", "solar"] },   // modern
    { living: ["boards", "herringbone"], bed: ["boards", "carpet"], wet: ["hextiles", "checker"], kitchen: ["checker", "tiles"],
      wall: ["paint", "shiplap"], accent: ["beadboard", "shiplap"], out: ["boards", "siding"], roof: ["metal", "shingles"] },  // farmhouse
    { living: ["cork", "parquet"], bed: ["carpet"], wet: ["hextiles"], kitchen: ["checker"],
      wall: ["wallpaper", "paint"], accent: ["panels"], out: ["stone", "shakes"], roof: ["slate", "thatch", "woodshakes"] },  // cottage
    { living: ["boards"], bed: ["boards", "carpet"], wet: ["tiles"], kitchen: ["slate"],
      wall: ["panels", "plaster"], accent: ["stone"], out: ["logs"], roof: ["metal", "woodshakes"] },                          // cabin
    { living: ["herringbone", "parquet"], bed: ["carpet"], wet: ["marble", "tiles"], kitchen: ["marble", "tiles"],
      wall: ["paint"], accent: ["brick"], out: ["brick"], roof: ["tiles", "slate"] }                                         // brick
  ];
  var STARTER_FLOOR_OF = { living: "living", great: "living", dining: "living", office: "living", family: "living", hall: "living",
                           stairs: "living", main: "bed", bed: "bed", closet: "bed", bath: "wet", ensuite: "wet", laundry: "wet",
                           utility: "wet", kitchen: "kitchen", garage: "garage", storage: "garage" };
  // what may be added to a room as well, now and then
  var STARTER_EXTRA = {
    living: ["i_bookcase", "i_sidetable", "i_palm|i_plant", "i_ottoman"], great: ["i_plant"], dining: ["i_barcart|i_plant"],
    main: ["i_bench|i_chest", "i_armchair|i_chaise", "i_plant"], bed: ["i_chest|i_bench", "i_plant"],
    office: ["i_plant", "i_printer"], family: ["i_bookcase", "i_beanbag", "i_plant"], bath: ["i_hamper"], laundry: ["i_hamper"],
    garage: ["i_toolchest", "i_bikerack"], closet: ["i_shoerack"]
  };
  // the furniture's own colors: what is soft, and what is wood
  var STARTER_SOFT = { i_sofa: 1, i_armchair: 1, i_sectional: 1, i_loveseat: 1, i_bedking: 1, i_bed: 1, i_ottoman: 1, i_beanbag: 1, i_chaise: 1 };
  var STARTER_WOOD = { i_dining: 1, i_roundtable: 1, i_desk: 1, i_nightstand: 1, i_dresser: 1, i_wardrobe: 1, i_sideboard: 1,
                       i_hutch: 1, i_consoletable: 1, i_bookcase: 1, i_coffee: 1, i_chest: 1, i_bench: 1, i_sidetable: 1 };
  var STARTER_WOODS = ["#c29a6b", "#8a6240", "#4b3627", "#efede8", "#2a2a2a", "#a98563", "#d8c3a0"];

  // ---- the house, laid out -----------------------------------------------------------
  // Each floor: { level, back: [...], front: [...] }, each room in a band
  // { kind, label, w } in metres, the main bedroom's own rooms a column
  // { kind: "suite", parts, w } beside it; W the width of the house.
  function starterPlan(want, rnd) {
    rnd = rnd || starterRand(1);
    // a little bigger or smaller, each house its own
    function it(kind, label) {
      var s = STARTER_ROOMS[kind], w = s.bw || s.w;
      if (s.max && s.max > w && kind !== "stairs") { w = Math.min(s.max, w * (1 + rnd() * 0.1)); }
      return { kind: kind, label: label || "", w: w };
    }
    function width(band) { return band.reduce(function (s, r) { return s + r.w; }, 0); }
    var two = want.floors > 1;
    var beds = [];
    for (var b = 0; b < want.beds; b++) {
      beds.push(it(b ? "bed" : "main", want.beds > 1 ? (b ? say("st_bed_n", { n: b + 1 }) : TXT.st_main) : ""));
    }
    var main = beds.shift(), suite = [];
    if (want.baths > 1) { suite.push(it("ensuite", TXT.st_ensuite)); }
    if (want.closet) { suite.push(it("closet")); }
    var col = suite.length ? { kind: "suite", parts: suite, w: suite.length > 1 || suite[0].kind === "ensuite" ? 2.6 : 2.0 } : null;
    var baths = [];
    for (var t = 0; t < want.baths - (want.baths > 1 ? 1 : 0); t++) { baths.push(it("bath")); }
    var office = want.office ? it("office") : null, living = it("living"), kitchen = it(want.open ? "great" : "kitchen");
    var dining = want.open ? null : it("dining"), laundry = want.laundry ? it("laundry") : null;
    var G = { level: 0, back: [], front: [] }, floors = [G];
    if (!two) {
      // one floor: the bedrooms along the back, the rest along the front --
      // the main bedroom (its own rooms either side of it) at one end or
      // the other, the rest in any order; the office by the living room or
      // past the kitchen
      var suiteBlock = col ? (rnd() < 0.5 ? [main, col] : [col, main]) : [main];
      var rest = starterShuffle(rnd, beds.concat(baths));
      G.back = rnd() < 0.5 ? suiteBlock.concat(rest) : rest.concat(suiteBlock);
      var chain = [living, kitchen, dining].filter(Boolean);
      G.front = (office && rnd() < 0.5 ? [office].concat(chain) : chain.concat(office ? [office] : [])).concat(laundry ? [laundry] : []);
      // the two about as long as each other: a bedroom brought round to
      // the front, or the office and the laundry room to the back
      while (width(G.back) - width(G.front) > 3 && G.back.some(function (r) { return r.kind === "bed"; })) {
        var last = G.back.filter(function (r) { return r.kind === "bed"; }).pop();
        G.back.splice(G.back.indexOf(last), 1);
        G.front.unshift(last);
      }
      [office, laundry].forEach(function (r) {
        if (r && width(G.front) - width(G.back) > 3) { G.front.splice(G.front.indexOf(r), 1); G.back.push(r); }
      });
    } else {
      // two: the kitchen at the back downstairs, the living room at the
      // front; the bedrooms upstairs, the stairs at the end of the hall
      var U = { level: 1, back: [it("stairs", TXT.st_stairs)].concat(col && rnd() < 0.5 ? [col, main] : [main].concat(col ? [col] : [])), front: [] };
      beds = starterShuffle(rnd, beds);
      G.back = [it("stairs", TXT.st_stairs), kitchen].concat(dining ? [dining] : []);
      G.front = [living].concat(office ? [office] : []);
      if (baths.length > 1) { (width(G.back) <= width(G.front) ? G.back : G.front).push(baths.shift()); }
      if (laundry) { G.front.push(laundry); }
      beds.concat(baths).forEach(function (r) { (width(U.back) <= width(U.front) ? U.back : U.front).push(r); });
      floors.push(U);
    }
    if (want.basement) {
      // down from the front band, its foot in the hall; a family room,
      // a utility room and storage below
      G.front.unshift(it("stairs", TXT.st_stairs));
      floors.push({ level: -1, back: [it("family", TXT.st_family)],
                    front: [it("stairs", TXT.st_stairs)].concat(starterShuffle(rnd, [it("utility", TXT.st_utility), it("storage", TXT.st_storage)])) });
    }
    // as wide as the widest band; each band grown out to that, the floor
    // under another and the front by the garage all the way
    var W = 0;
    floors.forEach(function (f) { W = Math.max(W, width(f.back), width(f.front)); });
    function fill(band, must) {
      for (var pass = 0; pass < 4; pass++) {
        var short = W - width(band);
        if (short < 0.01) { break; }
        var grow = band.filter(function (r) { return r.kind !== "suite" && (STARTER_ROOMS[r.kind].max || r.w) - r.w > 0.01; });
        var room = grow.reduce(function (s, r) { return s + STARTER_ROOMS[r.kind].max - r.w; }, 0);
        if (!room) { break; }
        grow.forEach(function (r) { r.w += (STARTER_ROOMS[r.kind].max - r.w) * Math.min(1, short / room); });
      }
      var left = W - width(band);
      if (!must || left < 0.01) { return; }
      if (left >= 2.6) { var fam = it("family", TXT.st_family); fam.w = left; band.push(fam); return; }
      var wide = band.filter(function (r) { return r.kind !== "suite" && r.kind !== "stairs"; }).pop() || band[band.length - 1];
      wide.w += left;
    }
    // (every floor of a house of two the whole width: an upstairs narrower
    // than the ground floor left parts of it sticking out, roofed apart,
    // and a notch in the middle of the house -- 2026-10-01)
    floors.forEach(function (f) {
      var whole = two && f.level >= 0;
      fill(f.back, whole);
      fill(f.front, whole || (f.level === 0 && want.garage));
    });
    return { floors: floors, W: W, two: two };
  }

  // ---- the house, made ---------------------------------------------------------------
  function starterMake(want) {
    var P = FLOOR_PX, G = want.spread ? STARTER_GAP : 0, made = [], links = [];
    keepUndo();
    // its seed: given (the same house again), or new (another house)
    var seed = want.seed !== undefined ? want.seed >>> 0 : Math.floor(Math.random() * 4294967295);
    var rnd = starterRand(seed);
    var plan = starterPlan(want, rnd), W = plan.W, H = STARTER_HALL;
    var D = starterPick(rnd, [STARTER_BAND, STARTER_BAND + 0.2, STARTER_BAND + 0.4]);   // its rooms this deep
    var flip = rnd() < 0.5;                                         // mirrored: the garage on the other side
    function X(m) { return Math.round(m * P); }
    var floors = [];
    function room(f, kind, label, x0, y0, x1, y1, sx, sy, spec) {
      if (flip) { var was = x0; x0 = -x1; x1 = -was; sx = -sx; }
      var n = { id: hand.next++, kind: "i_room", text: label || "", x: 0, y: 0, w: 140, h: 46 };
      measure(n);
      n.w = x1 - x0; n.h = y1 - y0; n.own = true;
      n.text = label || "";
      n.starter = kind;
      n.local = [x0, y0, x1, y1];
      // (other buildings, 39-types.js: a room may open off another of its
      // own home's rather than the hall, be a way in from the street, or be
      // a stairwell's bay -- a flight up or down in it, or none)
      if (spec) { n.starterId = spec.id; n.starterVia = spec.via; n.starterEntry = spec.entry; n.starterGo = spec.go; n.starterBay = spec.bay; }
      n.home = [(x0 + x1) / 2, (y0 + y1) / 2];           // where it is put together
      n.x = n.home[0] + sx; n.y = n.home[1] + sy;        // and where on the paper
      made.push(n);
      f.nodes.push(n);
      return n;
    }
    function join(a, b) {
      links.push({ from: a.id, to: b.id, label: "", fit: [b.home[0] - a.home[0], b.home[1] - a.home[1]] });
    }
    // a flight of stairs in the bay at the end of the hall, its foot by the
    // hall -- a door's swing back from it
    function flight(f, bay, foot) {
      var s = { id: hand.next++, kind: "i_stairs", text: "", x: 0, y: 0, w: 140, h: 46 };
      measure(s);
      s.w = 50; s.h = 150;
      s.x = bay.x;
      s.y = Math.round(foot > 0 ? bay.y + bay.h / 2 - X(1.05) - s.h / 2 : bay.y - bay.h / 2 + X(1.05) + s.h / 2);
      if (foot < 0) { s.turn = 180; }
      f.nodes.push(s);
      return s;
    }
    plan.floors.forEach(function (fp) {
      var f = { level: fp.level, nodes: [], back: [], front: [], hall: null, ups: [] };
      floors.push(f);
      var across = Math.max(fp.back.length, fp.front.length);
      // (each band as deep as the floor has it -- a shop's floor deeper
      // than a bedroom -- and the hall none at all where the building's
      // rooms open off each other, 39-types.js)
      var Db = fp.Db || D, Df = fp.Df || D, Hh = fp.H === undefined ? H : fp.H;
      f.depth = Db + Hh + Df;
      // the back band, the main bedroom's own rooms one over the other
      var at = 0;
      fp.back.forEach(function (r, i) {
        var x0 = X(at), x1 = X(at + r.w);
        at += r.w;
        if (r.kind === "suite") {
          var low = r.parts.length > 1 ? Db - 2.0 : 0;
          r.parts.forEach(function (p, k) {
            var y0 = k ? X(low) : 0, y1 = k || r.parts.length === 1 ? X(Db) : X(low);
            f.back.push(room(f, p.kind, p.label, x0, y0, x1, y1, i * G, -G - (r.parts.length > 1 && !k ? G / 2 : 0) + (k ? G / 2 : 0), p));
          });
          return;
        }
        f.back.push(room(f, r.kind, r.label, x0, 0, x1, X(Db), i * G, -G, r));
      });
      var wide = Math.max(fp.back.reduce(function (s, r) { return s + r.w; }, 0), fp.front.reduce(function (s, r) { return s + r.w; }, 0));
      if (Hh > 0) { f.hall = room(f, "hall", TXT.st_hall, 0, X(Db), X(wide), X(Db + Hh), (across - 1) * G / 2, 0); }
      at = 0;
      fp.front.forEach(function (r, i) {
        if (r.kind === "suite") {
          var y0 = Db + Hh, near = r.parts.length > 1 ? 2.0 : 0;
          r.parts.forEach(function (p, k) {
            var a = k ? X(y0) : X(y0 + near), b = k ? X(y0 + near) : X(y0 + Df);
            f.front.push(room(f, p.kind, p.label, X(at), a, X(at + r.w), b, i * G, G + (r.parts.length > 1 && !k ? G / 2 : 0) - (k ? G / 2 : 0), p));
          });
          at += r.w;
          return;
        }
        f.front.push(room(f, r.kind, r.label, X(at), X(Db + Hh), X(at + r.w), X(Db + Hh + Df), i * G, G, r));
        at += r.w;
      });
      if (fp.level === 0 && want.garage && !plan.noGarage && f.hall) {
        f.garage = room(f, "garage", "", X(W), X(Db), X(W) + X(6.0), X(Db) + X(6.2), fp.front.length * G, G);
      }
      // the stairs in their bays: up from the back, down from the front --
      // or, in a stairwell, a flight up or down as its bay says, or none
      f.back.concat(f.front).forEach(function (r) {
        if (r.starter === "stairs" && r.starterGo !== "none") {
          f.ups.push({ s: flight(f, r, f.back.indexOf(r) >= 0 ? 1 : -1), back: f.back.indexOf(r) >= 0, go: r.starterGo, bay: r.starterBay });
        }
      });
    });
    // which opens into which: everything off the hall, but the kitchen off
    // the living room beside it, the dining room off the kitchen, the main
    // bedroom's own rooms off it, and the garage through the laundry room
    floors.forEach(function (f) {
      var main = f.back.filter(function (m) { return m.starter === "main"; })[0], byId = {};
      f.back.concat(f.front).forEach(function (r) { if (r.starterId) { byId[r.starterId] = r; } });
      [f.back, f.front].forEach(function (band) {
        band.forEach(function (r, i) {
          var kind = r.starter, prev = i ? band[i - 1] : null;
          if (r.starterVia && byId[r.starterVia]) { join(byId[r.starterVia], r); }
          else if (r.starterVia || (!f.hall && r.starterEntry)) { return; }
          else if ((kind === "ensuite" || kind === "closet") && main) { join(main, r); }
          else if ((kind === "kitchen" || kind === "great") && prev && prev.starter === "living") { join(prev, r); }
          else if (kind === "dining" && prev && (prev.starter === "kitchen" || prev.starter === "great")) { join(prev, r); }
          else if (f.hall) { join(f.hall, r); }
        });
      });
      if (f.garage) {
        var end = f.front[f.front.length - 1];
        join(end && end.starter === "laundry" ? end : f.hall, f.garage);
      }
    });
    // the stairs, each flight to the one over it
    var byLevel = {};
    floors.forEach(function (f) { byLevel[f.level] = f; });
    var wells = floors.some(function (f) { return f.ups.some(function (u) { return !!u.go; }); });
    floors.forEach(function (f) {
      var over = byLevel[f.level + 1];
      if (!over || !wells) { return; }
      f.ups.forEach(function (u) {
        if (u.go !== "up") { return; }
        var mate = over.ups.filter(function (o) { return o.go === "down" && o.bay === u.bay && !o.taken; })[0];
        if (!mate) { return; }
        mate.taken = true;
        links.push({ from: u.s.id, to: mate.s.id, label: "" });
      });
    });
    floors.forEach(function (f) {
      var over = byLevel[f.level + 1];
      if (!over || wells) { return; }
      f.ups.forEach(function (u) {
        // up from the back band to the floor over; down to the one under from the front
        var mate = over.ups.filter(function (o) { return o.back === u.back && !o.taken; })[0];
        if (f.level === -1) { mate = over.ups.filter(function (o) { return !o.back && !o.taken; })[0]; }
        if (f.level === 0 && !u.back) { return; }
        if (!mate) { return; }
        mate.taken = true;
        links.push({ from: u.s.id, to: mate.s.id, label: "" });
      });
    });
    // the front door, out of the living room's front wall
    // (or, in a building of other kinds, out of each room that is a way in:
    // each home of a row its own, a shop its own, 39-types.js)
    var ground = byLevel[0], fronts = [];
    var ways = ground.front.concat(ground.back).filter(function (r) { return r.starterEntry; });
    if (!ways.length) { ways = [made.filter(function (r) { return r.starter === "living"; })[0] || ground.front[0] || ground.hall]; }
    ways.forEach(function (living) {
      var front = { id: hand.next++, kind: "i_door", text: firstWords("i_door"), x: 0, y: 0, w: 140, h: 46 };
      measure(front);
      front.x = Math.round(living.x); front.y = Math.round(living.y + living.h / 2 + STARTER_GAP * 0.9);
      ground.nodes.push(front);
      links.push({ from: living.id, to: front.id, label: "" });
      fronts.push(front);
    });

    // on the paper: beside anything already there, each floor beside the
    // last, in a Floor of its own where there is more than one or a lot
    var right = -Infinity;
    hand.nodes.forEach(function (n) { var q = turned(n); right = Math.max(right, n.x + q.w / 2); });
    var cursor = right === -Infinity ? 140 : right + 240, rim = X(2.4);
    var boxed = floors.length > 1 || want.lot;
    function boxOf(list) {
      var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      list.forEach(function (n) {
        var q = turned(n);
        b.l = Math.min(b.l, n.x - q.w / 2); b.r = Math.max(b.r, n.x + q.w / 2);
        b.t = Math.min(b.t, n.y - q.h / 2); b.b = Math.max(b.b, n.y + q.h / 2);
      });
      return b;
    }
    function shift(f, dx, dy) {
      f.nodes.forEach(function (n) {
        n.x = Math.round(n.x + dx); n.y = Math.round(n.y + dy);
        if (n.home) { n.home = [n.home[0] + dx, n.home[1] + dy]; }
      });
      if (f.box) { f.box.x = Math.round(f.box.x + dx); f.box.y = Math.round(f.box.y + dy); }
    }
    floors.forEach(function (f) {             // first well apart, to be worked out
      var b = boxOf(f.nodes);
      shift(f, cursor - b.l + rim, 160 + rim - b.t);
      cursor += b.r - b.l + 2 * rim + 4000;
      f.nodes.forEach(function (n) { hand.nodes.push(n); });
    });
    links.forEach(function (l) { hand.links.push(l); });
    var LEVEL_NAME = { "-1": TXT.fl_basement, "0": TXT.fl_ground, "1": TXT.fl_up_name };
    if (boxed) {
      floors.forEach(function (f) {
        var b = boxOf(f.nodes);
        f.box = { id: hand.next++, kind: "i_floor", text: LEVEL_NAME[f.level], x: 0, y: 0, w: 140, h: 46 };
        measure(f.box);
        f.box.text = LEVEL_NAME[f.level]; f.box.own = true;
        f.box.bldg = seed;                   // this house's floors, stacked on each other and no other (38-walk.js)
        f.box.x = Math.round((b.l + b.r) / 2); f.box.y = Math.round((b.t + b.b) / 2);
        f.box.w = Math.round(b.r - b.l + 2 * rim); f.box.h = Math.round(b.b - b.t + 2 * rim);
        hand.nodes.unshift(f.box);           // under what is on it
      });
      // each Floor round the floor as it is put together, the same way on
      // every one, so that in 3D each stands square on the one under it
      tieHeld = null;
      var J0 = typeof tieLayout === "function" ? tieLayout() : null;
      floors.forEach(function (f) {
        // the middle of the house put together -- worked out from where the
        // hall goes (or, with no hall, the first room), knowing where in the
        // house that is
        var a = f.hall || f.back[0] || f.front[0];
        var m = J0 && J0.moves[a.id], hx = m ? m.x : a.x, hy = m ? m.y : a.y;
        var cx = hx - (a.local[0] + a.local[2]) / 2 + (flip ? -X(W) / 2 : X(W) / 2);
        var cy = hy - (a.local[1] + a.local[3]) / 2 + X(f.depth) / 2;
        var b = boxOf(f.nodes);
        // round the rooms both as drawn and as put together (the garage too)
        var half = Math.max(cx - b.l, b.r - cx, X(W) / 2 + (f.garage ? X(6.0) : 0)) + rim;
        var tall = Math.max(cy - b.t, b.b - cy, X(f.depth) / 2 + (f.garage ? X(1.0) : 0)) + rim;
        f.box.x = Math.round(cx); f.box.y = Math.round(cy);
        f.box.w = Math.round(2 * half); f.box.h = Math.round(2 * tall);
      });
    }
    // a lot round the ground floor as it stands, its setbacks kept, a
    // garden behind; and the floors drawn close up beside one another
    var lot = null;
    if (want.lot) {
      var J1 = typeof tieLayout === "function" ? tieLayout() : null, fb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      ground.nodes.forEach(function (n) {
        if (n.kind !== "i_room") { return; }
        var m = J1 && J1.moves[n.id], x = m ? m.x : n.x, y = m ? m.y : n.y;
        fb.l = Math.min(fb.l, x - n.w / 2); fb.r = Math.max(fb.r, x + n.w / 2);
        fb.t = Math.min(fb.t, y - n.h / 2); fb.b = Math.max(fb.b, y + n.h / 2);
      });
      var sb = lotSetbacks(null), step = feetHere() ? 5 * 0.3048 * P : P;
      var lw = Math.ceil((fb.r - fb.l + 2 * (sb.side + 1.5) * P) / step) * step;
      var lh = Math.ceil((fb.b - fb.t + (sb.front + sb.back + 6) * P) / step) * step;
      lot = { id: hand.next++, kind: "i_lot", text: "", x: 0, y: 0, w: 140, h: 46 };
      measure(lot);
      lot.text = ""; lot.own = true;
      lot.w = Math.round(lw); lot.h = Math.round(lh);
      lot.x = Math.round((fb.l + fb.r) / 2);
      lot.y = Math.round(fb.b + sb.front * P + 0.5 * P - lot.h / 2);     // the street half a metre past the setback
      hand.nodes.unshift(lot);
      ground.lot = lot;
    }
    // close up: each floor (and the lot with the ground floor) beside the last
    cursor = right === -Infinity ? 140 : right + 240;
    floors.forEach(function (f) {
      var parts = f.box ? [f.box] : f.nodes;
      if (f.lot) { parts = parts.concat([f.lot]); }
      var b = boxOf(parts);
      var dx = cursor - b.l, dy = 160 - b.t;
      shift(f, dx, dy);
      if (f.lot) { f.lot.x = Math.round(f.lot.x + dx); f.lot.y = Math.round(f.lot.y + dy); }
      cursor += b.r - b.l + 240;
    });
    tieSeen = { H: null, key: null, J: null };
    if (want.roofOne) { hand.house = Object.assign({}, hand.house || {}, { roof: "one" }); }
    else if (hand.house && hand.house.roof) { hand.house = Object.assign({}, hand.house); delete hand.house.roof; }

    // put together on the paper too, where that was asked for: the front
    // door (and anything else) where 3D puts it, and drawn (tieTidy) each
    // arrow becomes a door
    if (!want.spread && typeof tieLayout === "function") {
      var J = tieLayout();
      made.concat(fronts).forEach(function (n) {
        var m = J.moves[n.id];
        if (m) { n.x = m.x; n.y = m.y; if (m.turn) { n.turn = m.turn; } else { delete n.turn; } }
      });
      tieTidy();
    }

    // furnished: against the walls, clear of every door -- the doors 3D
    // will put between rooms drawn apart too, stood in for meanwhile
    var stand = [];
    // the house as it will be put together, held still meanwhile: every piece
    // put in would have it worked out again, the stand-ins with it
    tieHeld = null;
    if (typeof tieLayout === "function") { tieHeld = tieLayout(); }
    setTimeout(function () { tieHeld = null; }, 0);   // let go, whatever happens below
    if (want.spread && typeof tieLayout === "function") {
      var L = tieLayout(), doors = [];
      L.made.forEach(function (one) { doors.push(one.node); });
      Object.keys(L.moves).forEach(function (id) {
        var n = nodeById(+id);
        if (n && WALK_DOORS[n.kind]) { doors.push(Object.assign({}, n, L.moves[id])); }
      });
      doors.forEach(function (d, i) {
        L.rooms.forEach(function (r) {
          var box = L.boxes[r.id];
          if (d.x < box.l - 30 || d.x > box.r + 30 || d.y < box.t - 30 || d.y > box.b + 30) { return; }
          var dl = L.delta[r.id] || [0, 0];
          stand.push({ id: -1 - stand.length - i * 7, kind: d.kind, text: "", x: d.x - dl[0], y: d.y - dl[1],
                       w: d.w, h: d.h, turn: d.turn });
        });
      });
    }
    // and the floor either side of every door kept clear: a sofa backed
    // up to the far side of a doorway shut it as surely as a wall
    // (a swinging door's own box is the floor it swings over, one side of
    // its threshold; the other side is kept the same.  One in the wall, a
    // sliding door, keeps a strip either side.)
    hand.nodes.concat(stand).forEach(function (d) {
      if (!WALK_DOORS[d.kind]) { return; }
      var t = (d.turn || 0) * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t);
      var swing = SNAP_IN_WALL[d.kind] === "swing";
      (swing ? [-d.h / 2 - 16] : [-(d.h / 2 + 16), d.h / 2 + 16]).forEach(function (off) {
        stand.push({ id: -1000 - stand.length, kind: "i_door", text: "", x: d.x + ux * off, y: d.y + uy * off,
                     w: d.w + 6, h: 32, turn: d.turn });
      });
    });
    Array.prototype.push.apply(hand.nodes, stand);
    var plan = walkPlan();
    made.forEach(function (r) {
      var spec = STARTER_ROOMS[r.starter];
      spec.mid.forEach(function (one) { starterShuffle(rnd, one.split("|")).some(function (kind) { return !!starterMid(r, kind); }); });
      spec.wall.forEach(function (one) {
        // the first of "this|or that" there is room for, the two in either order
        starterShuffle(rnd, one.split("|")).some(function (kind) {
          // nightstands by the bed; the television across the room from the
          // sofa; what is big, into the corner furthest from the door --
          // a bathtub against the middle of a wall left no room for a sink
          var near = kind === "i_nightstand" ? starterBedOf(r) : STARTER_CORNER[kind] ? starterCorner(r, rnd) : null;
          // the sink and the stove by the counter, the dryer by the washer
          if (STARTER_BY[kind]) {
            near = hand.nodes.filter(function (n) { return n.kind === STARTER_BY[kind] && insideArea(r, n.x, n.y); })[0] || near;
          }
          if (kind === "i_tv") {
            var sofa = hand.nodes.filter(function (n) { return n.kind === "i_sofa" && insideArea(r, n.x, n.y); })[0];
            if (sofa) { near = { x: 2 * r.x - sofa.x, y: 2 * r.y - sofa.y }; }
          }
          var put = starterAlong(r, kind, near);
          if (put) { put(); }
          return !!put;
        });
      });
    });
    // and now and then a little more: a bookcase, a plant, a chest at the
    // foot of the bed -- each taken back if it boxed anything in
    var extras = [];
    made.forEach(function (r) {
      (STARTER_EXTRA[r.starter] || []).forEach(function (one) {
        if (rnd() < 0.45) { return; }
        starterShuffle(rnd, one.split("|")).some(function (kind) {
          var put = ICONS[kind] && starterAlong(r, kind, null);
          if (put) { put(); var n = nodeById(picked); if (n) { extras.push(n); } }
          return !!put;
        });
      });
    });
    for (var tries = 0; tries < 4 && extras.length && typeof boxedPieces === "function"; tries++) {
      var boxed = boxedPieces(walkPlan());
      if (!boxed.length) { break; }
      var gone = extras.filter(function (x) { return boxed.some(function (b) { return insideArea(b.room, x.x, x.y); }); });
      if (!gone.length) { break; }
      hand.nodes = hand.nodes.filter(function (n) { return gone.indexOf(n) < 0; });
      extras = extras.filter(function (x) { return gone.indexOf(x) < 0; });
    }
    starterDress(made, rnd);
    // a shop's aisles, an office's desks, a classroom's (39-types.js)
    if (typeof typeFurnish === "function") { typeFurnish(made, rnd, want, plan); }
    // daylight: a window in an outside wall of every room that is lived in,
    // and the garage's door
    var lot = ground.lot || null;
    made.forEach(function (r) {
      // (a hall and a stairway too, where no light would go on its walls;
      // a closet, a store room, a utility room and the garage go without)
      var lit = (r.starter === "hall" || r.starter === "stairs") &&
                hand.nodes.some(function (n) { return n.kind === "i_sconce" && insideArea(r, n.x, n.y, -14); });
      var dark = Object.assign({ closet: 1, garage: 1, storage: 1, utility: 1 }, typeof TYPE_DARK === "object" ? TYPE_DARK : {});
      var want1 = lit || dark[r.starter] ? null : "i_window";
      var put = want1 && starterIntoWall(r, want1, null);
      if (put) { put(); }
      if (r.starter === "garage") {
        // its door on the front, to the street
        var gate = starterIntoWall(r, "i_garagedoor", "foot");
        if (gate) {
          gate();
          // and a drive up to it: to the front of the lot, where the door
          // will be once the house is put together
          var door = nodeById(picked);
          if (door && door.kind === "i_garagedoor") {
            if (lot && !((door.turn || 0) % 180)) {
              var d = (tieHeld && tieHeld.delta[r.id]) || [0, 0];
              var from = door.y + door.h / 2 + 2, len = Math.max(2 * P, lot.y + lot.h / 2 - d[1] - from);
              var drv = adviceAdd("i_driveway", Math.round(door.x), Math.round(from + len / 2));
              drv.w = Math.round(door.w + 10); drv.h = Math.round(len); drv.own = true;
            } else {
              var drive = drivewayFor(walkPlan(), door);
              if (drive) { drive(); }
            }
          }
        }
      }
    });
    starterDecor(made, rnd);
    // whoever sits in a room with a television, facing it
    made.forEach(function (r) {
      var tv = hand.nodes.filter(function (n) { return (n.kind === "i_tv" || n.kind === "i_walltv") && insideArea(r, n.x, n.y); })[0];
      if (!tv) { return; }
      hand.nodes.forEach(function (seat) {
        if ((seat.kind !== "i_sofa" && seat.kind !== "i_armchair") || !insideArea(r, seat.x, seat.y)) { return; }
        var dx = tv.x - seat.x, dy = tv.y - seat.y, best = seat.turn || 0, most = -Infinity, b = tieBox(r), T = roomWallOf(r);
        [0, 90, 180, 270].forEach(function (q) {
          var a = q * Math.PI / 180, dot = -Math.sin(a) * dx + Math.cos(a) * dy;
          // (only where, turned so, it is still in the room -- not half through its wall)
          var t = turned({ w: seat.w, h: seat.h, turn: q });
          if (seat.x - t.w / 2 < b.l + T || seat.x + t.w / 2 > b.r - T || seat.y - t.h / 2 < b.t + T || seat.y + t.h / 2 > b.b - T) { return; }
          if (dot > most) { most = dot; best = q; }
        });
        if (best) { seat.turn = best; } else { delete seat.turn; }
        // still facing away (it could not turn that way in the room): the
        // television moved instead, to the wall in front of it
        var a = (seat.turn || 0) * Math.PI / 180, fx = -Math.sin(a), fy = Math.cos(a);
        if (fx * (tv.x - seat.x) + fy * (tv.y - seat.y) > 0) { return; }
        var keepTv = { x: tv.x, y: tv.y, turn: tv.turn };
        tv.x = -99999; tv.y = -99999;
        var put = starterAlong(r, tv.kind, { x: seat.x + fx * r.w, y: seat.y + fy * r.h });
        tv.x = keepTv.x; tv.y = keepTv.y;
        if (!put) { return; }
        var was = hand.nodes.length;
        put();
        var moved = hand.nodes[hand.nodes.length - 1];
        if (hand.nodes.length > was && moved && moved.kind === tv.kind && fx * (moved.x - seat.x) + fy * (moved.y - seat.y) > 0) {
          hand.nodes = hand.nodes.filter(function (n) { return n !== tv; });
          tv = moved;
        } else if (hand.nodes.length > was) {
          hand.nodes.pop();
        }
      });
    });
    hand.nodes = hand.nodes.filter(function (n) { return stand.indexOf(n) < 0; });
    tieHeld = null;
    starterLast = made.map(function (r) { return { room: r, kind: r.starter }; });
    made.forEach(function (r) {
      delete r.starter; delete r.home; delete r.local;
      delete r.starterId; delete r.starterVia; delete r.starterEntry; delete r.starterGo; delete r.starterBay;
    });
    picked = null; chosen = null; many = [];
    drawHand(); drawHandPanel(); showReport();
    if (el("#fit")) { el("#fit").click(); }
    handSays(say("st_made", { rooms: made.length }));
  }
  // Something that stands out in the room -- a table, a rug, the car --
  // as near the middle as it can be and still clear of every door's swing
  // and of what stands there already (a rug is walked over, and may be under).
  function starterMid(r, kind) {
    var probe = { kind: kind, text: "", x: r.x, y: r.y, w: 140, h: 46 };
    measure(probe);
    var flat = !!LIES_FLAT[kind], inner = 8 + roomWallOf(r);
    var others = hand.nodes.filter(function (o) {
      return o !== r && !isArea(o.kind) && !ON_THE_WALL[o.kind] && o.kind !== "i_window" &&
             (WALK_DOORS[o.kind] || (!flat && !LIES_FLAT[o.kind]));
    });
    for (var ring = 0; ring <= 8; ring++) {
      for (var k = 0; k < (ring ? 8 : 1); k++) {
        var a = k * Math.PI / 4, x = Math.round(r.x + Math.cos(a) * ring * 12), y = Math.round(r.y + Math.sin(a) * ring * 12);
        var spot = { kind: kind, x: x, y: y, w: probe.w, h: probe.h };
        if (!insideArea(r, x, y, Math.max(probe.w, probe.h) / 2 + inner)) { continue; }
        if (others.some(function (o) { return boxesTouch(spot, o, WALK_DOORS[o.kind] ? 6 : 2); }) || starterFrontClash(spot, others)) { continue; }
        return adviceAdd(kind, x, y);
      }
    }
    return null;
  }

  // A place against one of a room's walls, its back to the wall, clear of
  // everything there and of every door's swing (and of the stand-ins): the
  // nearest to `near` (or the middle of the room) -- alongWall
  // (38-advice.js), looked along in finer steps, which a crowded small room
  // needs: in tens there was no room for a washer between two doors.
  function starterAlong(r, kind, near) {
    var icon = ICONS[kind], w = icon.box[0], h = icon.box[1], T = roomWallOf(r), b = tieBox(r), spots = [];
    // a bath lies along its wall, not out across the room
    var long = !!STARTER_LONG[kind] && h > w;
    if (long) { var was = w; w = h; h = was; }
    var hanging = !!ON_THE_WALL[kind];
    var others = hand.nodes.filter(function (n) {
      if (n === r || n.kind === "i_rug" || isArea(n.kind)) { return false; }
      // what hangs on a wall: clear of the windows, the doors, what hangs
      // there already, and anything standing under it taller than a table
      // (a picture hung over a wardrobe went through it, 2026-10-01)
      if (hanging) {
        return ON_THE_WALL[n.kind] || WALK_DOORS[n.kind] || n.kind === "i_window" ||
               (!FROM_CEILING[n.kind] && !LIES_FLAT[n.kind] && typeof pieceHigh === "function" && V3_HIGH[n.kind] !== undefined && pieceHigh(n) > 1.05);
      }
      return n.kind !== "i_window" && !ON_THE_WALL[n.kind] && !FROM_CEILING[n.kind];
    });
    [{ name: "top", across: true, line: b.t, from: b.l, to: b.r, into: 1, turn: 0 },
     { name: "foot", across: true, line: b.b, from: b.l, to: b.r, into: -1, turn: 180 },
     { name: "left", across: false, line: b.l, from: b.t, to: b.b, into: 1, turn: 270 },
     { name: "right", across: false, line: b.r, from: b.t, to: b.b, into: -1, turn: 90 }].forEach(function (e) {
      for (var at = e.from + T + w / 2 + 3; at <= e.to - T - w / 2 - 3; at += 4) {
        var off = e.line + e.into * (T + h / 2 + 1);
        var spot = { kind: kind, x: e.across ? at : off, y: e.across ? off : at, w: w, h: h, turn: e.turn,
                     put: long ? (e.turn + 90) % 360 : e.turn };
        if (!others.some(function (o) { return boxesTouch(spot, o, 3); }) &&
            !starterFrontClash({ kind: kind, x: spot.x, y: spot.y, w: ICONS[kind].box[0], h: ICONS[kind].box[1], turn: spot.put }, others)) { spots.push(spot); }
      }
    });
    if (!spots.length) { return null; }
    var aim = near || { x: r.x, y: r.y };
    spots.sort(function (p, q) { return Math.hypot(p.x - aim.x, p.y - aim.y) - Math.hypot(q.x - aim.x, q.y - aim.y); });
    var s0 = spots[0];
    return function () { adviceAdd(kind, Math.round(s0.x), Math.round(s0.y), s0.put); };
  }

  var STARTER_CORNER = { i_bathtub: true, i_shower: true, i_wardrobe: true, i_fridge: true, i_workbench: true,
                         i_closetrod: true, i_bookcase: true, i_washer: true, i_bed: true, i_bedking: true,
                         i_counter: true };
  var STARTER_BY = { i_kitchensink: "i_counter", i_stove: "i_counter", i_dishwasher: "i_kitchensink", i_dryer: "i_washer",
                     i_toilet: "i_bathtub", i_desk: "i_window" };
  var STARTER_LONG = { i_bathtub: true };
  // A window or a door in an outside wall of a room, as intoOutsideWall
  // (38-advice.js) puts one -- in the wall `prefer` names where there is
  // room for it there: a garage's door on the front, to the street.
  function starterIntoWall(r, kind, prefer) {
    var plan = walkPlan(), size = ICONS[kind].box[0], best = null;
    roomEdges(plan, r).forEach(function (e) {
      if (!e.outside || (prefer && e.name !== prefer)) { return; }
      edgeGaps(plan, r, e).forEach(function (g) {
        if (g[1] - g[0] < size + 4 || (best && g[1] - g[0] <= best.len)) { return; }
        best = { e: e, at: (g[0] + g[1]) / 2, len: g[1] - g[0] };
      });
    });
    if (!best) { return prefer ? intoOutsideWall(plan, r, kind) : null; }
    var inward = kind === "i_window" ? 0 : best.e.into * 10;
    var x = best.e.across ? best.at : best.e.line + inward, y = best.e.across ? best.e.line + inward : best.at;
    return function () {
      var node = adviceAdd(kind, Math.round(x), Math.round(y));
      snapToWalls([node.id]);
    };
  }

  // Whether a piece put here stands in front of a drawer or a door that
  // needs the room (FRONT_ROOM, 38-advice.js), or needs room in front of
  // itself that something takes: put there, it could not open.
  function starterFrontClash(piece, others) {
    if (typeof frontRoom !== "function") { return false; }
    var mine = frontRoom(piece);
    // (a little stricter than Check: the spot is rounded to whole pixels when put down)
    if (mine && others.some(function (o) { return blocksFront(o) && boxesTouch(mine, o, 1); })) { return true; }
    if (!blocksFront(piece)) { return false; }
    return others.some(function (o) { var z = frontRoom(o); return z && boxesTouch(z, piece, 1); });
  }

  // The corner of a room furthest from its doors.
  function starterCorner(r, rnd) {
    var b = tieBox(r), doors = hand.nodes.filter(function (d) { return WALK_DOORS[d.kind] && insideArea(r, d.x, d.y, -40); });
    var corners = [[b.l, b.t], [b.r, b.t], [b.l, b.b], [b.r, b.b]].map(function (c) {
      return { x: c[0], y: c[1], far: doors.reduce(function (m, d) { return Math.min(m, Math.hypot(d.x - c[0], d.y - c[1])); }, Infinity) };
    }).sort(function (p, q) { return q.far - p.far; });
    // (now and then the next furthest, where it is nearly as far: each house its own)
    if (rnd && corners[1] && corners[1].far >= corners[0].far * 0.75 && rnd() < 0.4) { return corners[1]; }
    return corners[0];
  }

  // What finishes a room: something on its ceiling -- a fan, a light over
  // the table, an air vent in a corner -- and on its walls: pictures over
  // the sofa and the bed, a clock in the kitchen, a mirror over the basin
  // (2026-10-01: "the ceilings have nothing on them ... no AC vents, ceiling
  // fans, and no pictures on the wall").  Hung things keep clear of the
  // windows and of anything standing taller than a table (starterAlong).
  var STARTER_CEILING = { living: "i_ceilingfan", family: "i_ceilingfan", main: "i_ceilingfan", bed: "i_ceilingfan",
                          office: "i_pendant", kitchen: "i_pendant", dining: "i_chandelier", great: "i_chandelier", hall: "i_pendant" };
  var STARTER_WALLS = { living: [["i_picture", "i_sofa"], ["i_picture", null]], family: [["i_picture", "i_sectional|i_sofa"]],
                        main: [["i_picture", "i_bedking"]], bed: [["i_picture", "i_bed"]], dining: [["i_picture", null]],
                        hall: [["i_picture", null], ["i_picture", null]], kitchen: [["i_wallclock", null]], great: [["i_wallclock", null]],
                        bath: [["i_mirror", "i_vanity|i_sink"]], ensuite: [["i_mirror", "i_sink"]], office: [["i_shelf", "i_desk"]] };
  var STARTER_VENTED = { living: 1, family: 1, main: 1, bed: 1, office: 1, kitchen: 1, dining: 1, great: 1, bath: 1, ensuite: 1, laundry: 1, hall: 1 };
  function starterDecor(made, rnd) {
    made.forEach(function (r) {
      var kind = r.starter, b = tieBox(r), P = FLOOR_PX;
      function inRoom(k) {
        var kinds = k.split("|");
        return hand.nodes.filter(function (n) { return kinds.indexOf(n.kind) >= 0 && insideArea(r, n.x, n.y); })[0] || null;
      }
      // on the ceiling: over the table where there is one, else the middle
      var hang = STARTER_CEILING[kind];
      // (a small room of another building -- a restroom, a stockroom -- a light all the same, 39-types.js)
      if (hang && ICONS[hang] && Math.min(r.w, r.h) >= (r.use && hang === "i_pendant" ? 1.4 : 2.6) * P) {
        var over = (hang === "i_chandelier" && inRoom("i_dining|i_roundtable")) || null;
        adviceAdd(hang, Math.round(over ? over.x : r.x), Math.round(over ? over.y : r.y));
      }
      // an air vent near a corner, away from the light
      if (STARTER_VENTED[kind] && ICONS.i_vent && Math.min(r.w, r.h) >= 1.4 * P) {
        var cx = rnd() < 0.5 ? b.l + 0.7 * P : b.r - 0.7 * P, cy = rnd() < 0.5 ? b.t + 0.7 * P : b.b - 0.7 * P;
        if (Math.min(r.w, r.h) < 2.2 * P) { cx = r.x; cy = r.y; }
        adviceAdd("i_vent", Math.round(cx), Math.round(cy));
      }
      // on the walls
      (STARTER_WALLS[kind] || []).forEach(function (w) {
        if (!ICONS[w[0]]) { return; }
        var near = w[1] ? inRoom(w[1]) : null;
        var put = starterAlong(r, w[0], near);
        if (put) { put(); }
      });
    });
  }

  // A house's look, and its furniture's colors: one of STARTER_LOOKS --
  // its floors by the kind of room, its walls (a room in four now and then
  // in the accent), its outside and its roof, each in one of the colors it
  // comes in -- and a fabric and a wood for the furniture.
  function starterDress(made, rnd) {
    if (typeof HOUSE_MATS === "undefined") { return; }
    var look = starterPick(rnd, STARTER_LOOKS);
    function mat(part, kinds) {
      var ok = kinds.filter(function (k) { return HOUSE_MATS[part] && HOUSE_MATS[part][k]; });
      if (!ok.length) { return null; }
      var kind = starterPick(rnd, ok), tints = typeof houseTints === "function" ? houseTints(part, kind) : [HOUSE_MATS[part][kind][1]];
      return [kind, starterPick(rnd, tints)];
    }
    var wall = mat("wall", look.wall), out = mat("out", look.out), roof = mat("roof", look.roof);
    var floors = {};
    ["living", "bed", "wet", "kitchen"].forEach(function (k) { floors[k] = mat("floor", look[k]); });
    floors.garage = ["concrete", "#a8a8a4"];
    made.forEach(function (r) {
      var m = Object.assign({}, r.mat || {});
      var f = floors[STARTER_FLOOR_OF[r.starter] || "living"];
      if (f) { m.floor = f[0]; m.floorC = f[1]; }
      var w = r.starter !== "garage" && r.starter !== "hall" && rnd() < 0.25 ? mat("wall", look.accent) : wall;
      if (w && r.starter !== "garage") { m.wall = w[0]; m.wallC = w[1]; }
      if (out) { m.out = out[0]; m.outC = out[1]; }
      if (roof) { m.roof = roof[0]; m.roofC = roof[1]; }
      r.mat = m;
    });
    var soft = typeof FIN_MAIN !== "undefined" ? starterPick(rnd, FIN_MAIN) : null;
    var soft2 = typeof FIN_MAIN !== "undefined" ? starterPick(rnd, FIN_MAIN) : null;
    var wood = starterPick(rnd, STARTER_WOODS), trim = typeof FIN_TRIM !== "undefined" ? starterPick(rnd, FIN_TRIM) : wood;
    hand.nodes.forEach(function (n) {
      if (!made.some(function (r) { return insideArea(r, n.x, n.y); })) { return; }
      if (STARTER_SOFT[n.kind] && soft) { n.fin = { main: /bed/.test(n.kind) ? soft2 : soft, frame: wood }; }
      else if (STARTER_WOOD[n.kind]) { n.fin = { main: wood, frame: trim }; }
    });
  }

  // The bed in a room, for the nightstands to go beside.
  function starterBedOf(room) {
    return hand.nodes.filter(function (n) {
      return (n.kind === "i_bed" || n.kind === "i_bedking") && insideArea(room, n.x, n.y);
    })[0] || null;
  }

  // ---- asked -----------------------------------------------------------------------------
  // (2026-10-01: "the menus just have a ton of toggles when I know you can
  // go better than those numbers and toggles")  How many bedrooms and
  // bathrooms on steppers; the rest as tiles with a picture each, lit when
  // chosen; and beside them the house itself, drawn as it will be made --
  // its seed the one Make uses, Shuffle a new one.
  var STARTER_LABEL = { living: "rl_living", kitchen: "rl_kitchen", great: "rl_eatin", dining: "rl_dining", office: "rl_office",
                        laundry: "rl_laundry", garage: "rl_garage", bath: "rl_bath", closet: "rl_closet", bed: "rl_bed",
                        main: "st_main", ensuite: "st_ensuite", hall: "st_hall", stairs: "st_stairs", family: "st_family",
                        storage: "st_storage", utility: "st_utility" };
  var STARTER_ZONE = { living: "day", great: "day", kitchen: "day", dining: "day", office: "day", family: "day",
                       main: "night", bed: "night", closet: "night", bath: "wet", ensuite: "wet", laundry: "wet", utility: "wet",
                       hall: "hall", stairs: "hall", garage: "car", storage: "car" };
  // The house as Start a house will make it, in metres: each floor's
  // rooms, laid out the way starterMake lays them (the same seed, taken in
  // the same order: the plan, the depth of a band, whether it is mirrored).
  function starterSketch(want) {
    var rnd = starterRand(want.seed >>> 0), plan = starterPlan(want, rnd), W = plan.W, H = STARTER_HALL;
    var D = starterPick(rnd, [STARTER_BAND, STARTER_BAND + 0.2, STARTER_BAND + 0.4]), flip = rnd() < 0.5;
    var out = [];
    plan.floors.forEach(function (fp) {
      var rooms = [], Db = fp.Db || D, Df = fp.Df || D, Hh = fp.H === undefined ? H : fp.H;
      function put(kind, label, x0, y0, x1, y1) {
        if (flip) { var was = x0; x0 = -x1; x1 = -was; }
        rooms.push({ kind: kind, label: label, x0: x0, y0: y0, x1: x1, y1: y1 });
      }
      var at = 0;
      fp.back.forEach(function (r) {
        if (r.kind === "suite") {
          var low = r.parts.length > 1 ? Db - 2.0 : 0;
          r.parts.forEach(function (p, k) { put(p.kind, p.label, at, k ? low : 0, at + r.w, k || r.parts.length === 1 ? Db : low); });
        } else { put(r.kind, r.label, at, 0, at + r.w, Db); }
        at += r.w;
      });
      var wide = Math.max(fp.back.reduce(function (s, r) { return s + r.w; }, 0), fp.front.reduce(function (s, r) { return s + r.w; }, 0));
      if (Hh > 0) { put("hall", TXT.st_hall, 0, Db, wide, Db + Hh); }
      at = 0;
      fp.front.forEach(function (r) {
        if (r.kind === "suite") {
          var y0 = Db + Hh, near = r.parts.length > 1 ? 2.0 : 0;
          r.parts.forEach(function (p, k) { put(p.kind, p.label, at, k ? y0 : y0 + near, at + r.w, k ? y0 + near : y0 + Df); });
        } else { put(r.kind, r.label, at, Db + Hh, at + r.w, Db + Hh + Df); }
        at += r.w;
      });
      if (fp.level === 0 && want.garage && !plan.noGarage && Hh > 0) { put("garage", "", W, Db, W + 6.0, Db + 6.2); }
      out.push({ level: fp.level, rooms: rooms });
    });
    out.sort(function (a, b) { return a.level - b.level; });
    return out;
  }
  // The sketch drawn: each floor a plan, side by side, its rooms in the
  // colors of what they are for, named where there is room.
  function starterSketchSvg(sketch) {
    var gap = 2.4, pad = 0.6, xs = [], parts = [], wide = 0, top = 0;
    // (a block of many floors in rows of two, 39-types.js: in one row each was a sliver)
    var cols = sketch.length > 2 ? 2 : Math.max(1, sketch.length);
    sketch.forEach(function (f) {
      var l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
      f.rooms.forEach(function (m) { l = Math.min(l, m.x0); r = Math.max(r, m.x1); t = Math.min(t, m.y0); b = Math.max(b, m.y1); });
      xs.push({ f: f, l: l, r: r, t: t, b: b });
      wide = Math.max(wide, r - l); top = Math.max(top, b - t);
    });
    var rows = Math.ceil(xs.length / cols), cellH = top + 1.4 + gap;
    var Wt = cols * wide + (cols - 1) * gap + pad * 2, Ht = rows * cellH - gap + pad * 2;
    xs.forEach(function (p, i) {
      var f = p.f, cx = pad + (i % cols) * (wide + gap), cy = pad + Math.floor(i / cols) * cellH;
      var ox = cx - p.l, oy = cy + 1.4 - p.t;
      var name = f.level === 0 ? TXT.fl_ground : f.level > 0 ? (f.level > 1 ? say("fl_upper", { n: f.level + 1 }) : TXT.fl_up_name) : TXT.fl_basement;
      parts.push('<text class="sk-floor" x="' + cx.toFixed(2) + '" y="' + (cy + 0.9).toFixed(2) + '">' + escaped(sketch.length > 1 ? name : "") + "</text>");
      f.rooms.forEach(function (m) {
        var w = m.x1 - m.x0, h = m.y1 - m.y0, zone = STARTER_ZONE[m.kind] || "day";
        parts.push('<rect class="sk-room sk-' + zone + '" x="' + (ox + m.x0).toFixed(2) + '" y="' + (oy + m.y0).toFixed(2) +
                   '" width="' + w.toFixed(2) + '" height="' + h.toFixed(2) + '"/>');
        var said = m.label || TXT[STARTER_LABEL[m.kind]] || "";
        if (said && w >= 2.2 && h >= 1.3) {
          var size = Math.min(0.62, w / Math.max(4, said.length) * 1.7);
          parts.push('<text class="sk-name" x="' + (ox + (m.x0 + m.x1) / 2).toFixed(2) + '" y="' + (oy + (m.y0 + m.y1) / 2).toFixed(2) +
                     '" font-size="' + size.toFixed(2) + '">' + escaped(said) + "</text>");
        }
      });
    });
    return '<svg class="st-sketch" viewBox="0 0 ' + Wt.toFixed(2) + " " + Ht.toFixed(2) + '" role="img" aria-label="' +
           escaped(TXT.st_preview) + '">' + parts.join("") + "</svg>";
  }

  function starterAsk() {
    if (el(".st-sheet")) { return; }
    var want = Object.assign({}, starterWant);
    want.seed = Math.floor(Math.random() * 4294967295);   // another house each time it is opened
    var sheet = document.createElement("div");
    sheet.className = "make-sheet st-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "st-title");
    var card = document.createElement("div");
    card.className = "make-card st-card st-wide";
    card.innerHTML = '<h2 id="st-title"></h2><p class="make-sub"></p>' +
                     '<div class="st-body"><div class="st-pick"></div><div class="st-look">' +
                     '<div class="st-look-pic"></div><div class="st-look-foot"><span class="st-look-sum"></span>' +
                     '<button type="button" class="btn small st-shuffle"></button></div></div></div>' +
                     '<div class="st-go"><button type="button" class="btn small st-no"></button>' +
                     '<button type="button" class="btn small primary st-yes"></button></div>';
    card.querySelector("h2").textContent = TXT.st_title;
    card.querySelector(".make-sub").textContent = TXT.st_sub;
    var pick = card.querySelector(".st-pick"), pic = card.querySelector(".st-look-pic"), sum = card.querySelector(".st-look-sum");
    var shuffle = card.querySelector(".st-shuffle");
    shuffle.innerHTML = houseIcon("shuffle") + "<span></span>";
    shuffle.lastChild.textContent = TXT.st_shuffle;
    shuffle.title = TXT.st_shuffle_tip;
    function icon(name) { return typeof houseIcon === "function" ? houseIcon(name) : ""; }
    function head(text) {
      var h = document.createElement("div");
      h.className = "st-head";
      h.textContent = text;
      pick.appendChild(h);
    }
    // a count, on a stepper: fewer, how many, more
    function stepper(key, label, iconName, from, to) {
      var row = document.createElement("div");
      row.className = "st-step";
      row.innerHTML = icon(iconName) + '<span class="st-step-name"></span><div class="st-step-ctl">' +
                      '<button type="button" class="st-step-btn" data-d="-1"></button><output></output>' +
                      '<button type="button" class="st-step-btn" data-d="1"></button></div>';
      row.querySelector(".st-step-name").textContent = label;
      var out = row.querySelector("output"), less = row.querySelector('[data-d="-1"]'), more = row.querySelector('[data-d="1"]');
      less.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8"/></svg>';
      more.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8M8 4v8"/></svg>';
      less.setAttribute("aria-label", TXT.st_fewer + ": " + label);
      more.setAttribute("aria-label", TXT.st_more + ": " + label);
      function show() {
        out.textContent = String(want[key]);
        less.disabled = want[key] <= from; more.disabled = want[key] >= to;
      }
      less.onclick = function () { if (want[key] > from) { want[key]--; show(); redraw(); } };
      more.onclick = function () { if (want[key] < to) { want[key]++; show(); redraw(); } };
      show();
      pick.appendChild(row);
    }
    var grid = null;
    function tiles() { grid = document.createElement("div"); grid.className = "st-tiles"; pick.appendChild(grid); }
    // a choice, a tile: lit while chosen; `one` makes it one of a kind (radio)
    function tile(label, iconName, on, set, role) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "hs-tile st-tile";
      if (role) { b.setAttribute("role", "radio"); b.setAttribute("aria-checked", on() ? "true" : "false"); }
      else { b.setAttribute("aria-pressed", on() ? "true" : "false"); }
      b.innerHTML = icon(iconName) + '<span class="hs-tile-name"></span><span class="hs-tile-tick" aria-hidden="true">' +
                    '<svg viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg></span>';
      b.querySelector(".hs-tile-name").textContent = label;
      b.refresh = function () {
        var v = on();
        if (role) { b.setAttribute("aria-checked", v ? "true" : "false"); b.setAttribute("aria-pressed", v ? "true" : "false"); }
        else { b.setAttribute("aria-pressed", v ? "true" : "false"); }
      };
      b.onclick = function () { set(); all(".st-tile", pick).forEach(function (t) { t.refresh(); }); redraw(); };
      if (role) { b.setAttribute("aria-pressed", on() ? "true" : "false"); }
      grid.appendChild(b);
    }
    // (2026-10-02: other buildings too, 39-types.js) What to build, then
    // what it has -- a house's rooms, a shop's size, a block's floors --
    // then how it is put down, and its style.
    function build() {
      pick.innerHTML = "";
      var house = !want.type || want.type === "house";
      card.querySelector("h2").textContent = house ? TXT.st_title : TXT.ty_start_title;
      card.querySelector(".st-yes").textContent = house ? TXT.st_make : TXT.ty_make;
      if (typeof typeChips === "function") { typeChips(pick, want, function () { build(); redraw(); }); }
      var T = typeof typeOf === "function" ? typeOf(want) : null;
      if (T && T.ask) {
        head(TXT.ty_what_head);
        T.ask({ head: head, stepper: stepper, tiles: tiles, tile: tile, want: want });
      } else if (!T || !T.plan) {
        head(TXT.st_rooms_head);
        stepper("beds", TXT.st_beds, "bed", 1, 5);
        stepper("baths", TXT.st_baths, "bath", 1, 3);
        head(TXT.st_floors);
        tiles();
        tile(TXT.st_one_floor, "floor1", function () { return want.floors === 1; }, function () { want.floors = 1; }, true);
        tile(TXT.st_two_floors, "floor2", function () { return want.floors === 2; }, function () { want.floors = 2; }, true);
        tile(TXT.st_basement, "basement", function () { return !!want.basement; }, function () { want.basement = !want.basement; });
        head(TXT.st_extras_head);
        tiles();
        [["open", TXT.st_open_plan, "kitchen"], ["office", TXT.st_office, "office"], ["laundry", TXT.st_laundry, "laundry"],
         ["garage", TXT.st_garage, "car"], ["closet", TXT.st_closet, "closet"]].forEach(function (t) {
          tile(t[1], t[2], function () { return !!want[t[0]]; }, function () { want[t[0]] = !want[t[0]]; });
        });
      }
      head(TXT.st_house_head);
      tiles();
      tile(TXT.st_roof_one, "roof", function () { return !!want.roofOne; }, function () { want.roofOne = !want.roofOne; });
      tile(TXT.st_lot, "land", function () { return !!want.lot; }, function () { want.lot = !want.lot; });
      tile(TXT.st_spread, "spread", function () { return !!want.spread && !(T && T.together); }, function () { want.spread = !want.spread; });
      if (T && T.together) { var last = grid.lastChild; last.disabled = true; last.title = TXT.ty_together; }
      // (39-xray.js) outlets, switches and a breaker panel, put where the code puts them
      if (typeof wireHouse === "function") { tile(TXT.xr_wire_tile, "xr_power", function () { return !!want.wire; }, function () { want.wire = !want.wire; }); }
      if (typeof typeStyleRow === "function") { typeStyleRow(pick, want, function () { redraw(); }); }
    }
    // the house, drawn as it will be made
    function redraw() {
      var sketch = starterSketch(want), area = 0, count = 0;
      sketch.forEach(function (f) {
        f.rooms.forEach(function (m) { area += (m.x1 - m.x0) * (m.y1 - m.y0); count++; });
      });
      pic.innerHTML = starterSketchSvg(sketch);
      sum.textContent = say("st_preview_sum", { rooms: count, area: floorSays(area * FLOOR_PX, FLOOR_PX) });
    }
    shuffle.onclick = function () { want.seed = Math.floor(Math.random() * 4294967295); redraw(); };
    build();
    redraw();
    var no = card.querySelector(".st-no"), yes = card.querySelector(".st-yes");
    no.textContent = TXT.in_cancel;
    if (!want.type || want.type === "house") { yes.textContent = TXT.st_make; }
    var gone = false;
    function shut() {
      if (gone) { return; }
      gone = true;
      if (typeof STILL !== "undefined" && STILL) { sheet.remove(); return; }
      sheet.classList.add("going");
      setTimeout(function () { sheet.remove(); }, 200);
    }
    no.onclick = shut;
    yes.onclick = function () {
      var keep = Object.assign({}, want);
      delete keep.seed;                    // the choices kept; the seed new next time
      starterWant = keep;
      try { localStorage.setItem("flowchart-starter", JSON.stringify(keep)); } catch (e) { /* this visit only */ }
      shut();
      starterMake(want);
    };
    sheet.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); shut(); }
    });
    sheet.addEventListener("pointerdown", function (ev) { if (ev.target === sheet) { shut(); } });
    sheet.appendChild(card);
    document.body.appendChild(sheet);
    setTimeout(function () { yes.focus({ preventScroll: true }); }, 30);
  }
  try {
    var starterKept = JSON.parse(localStorage.getItem("flowchart-starter") || "null");
    if (starterKept && typeof starterKept === "object") { starterWant = Object.assign(starterWant, starterKept); }
  } catch (e) { /* the first time */ }

  // ---- its button, beside Tidy up, in a home design (or an empty one) -----------------
  function starterButton() {
    var tidy = el("#hand-tidy");
    if (!tidy) { return null; }
    var b = el("#hand-house");
    if (!b) {
      b = document.createElement("button");
      b.className = "btn";
      b.id = "hand-house";
      b.type = "button";
      b.onclick = starterAsk;
      tidy.parentNode.insertBefore(b, tidy);
    }
    var show = typeof designMode === "function" && designMode() &&
               (!hand.nodes.length || (typeof boardName === "function" && boardName() === "home"));
    if (b.hidden === show) { b.hidden = !show; }
    if (b.textContent !== TXT.st_open) { b.textContent = TXT.st_open; b.title = TXT.st_open_tip; }
    return b;
  }
  if (typeof drawHand === "function") {
    var drawHandHouse = drawHand;
    drawHand = function () {
      var out = drawHandHouse.apply(this, arguments);
      starterButton();
      return out;
    };
  }
  if (typeof dressMaking === "function") {
    var dressMakingHouse = dressMaking;
    dressMaking = function () {
      var out = dressMakingHouse.apply(this, arguments);
      starterButton();
      return out;
    };
  }
