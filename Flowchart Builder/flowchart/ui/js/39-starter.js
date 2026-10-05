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
    living: { w: 5.8, h: 4.6, bw: 6.4, max: 9.0, wall: ["i_sofa", "i_tv", "i_armchair", "i_lamp", "i_plant"], mid: ["i_rug", "i_coffee"] },
    kitchen: { w: 4.2, h: 3.8, bw: 4.6, max: 6.0, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_dishwasher"], mid: [] },
    great: { w: 7.0, h: 4.4, bw: 7.6, max: 10, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_dishwasher"], mid: ["i_dining"] },
    dining: { w: 4.4, h: 3.9, bw: 4.8, max: 6.0, wall: ["i_sideboard|i_hutch|i_consoletable", "i_plant"], mid: ["i_dining|i_roundtable"] },
    main: { w: 4.8, h: 4.6, bw: 5.6, max: 6.6, wall: ["i_bedking", "i_nightstand", "i_nightstand", "i_wardrobe", "i_dresser"], mid: [] },
    bed: { w: 3.8, h: 3.7, bw: 4.1, max: 5.0, wall: ["i_bed", "i_nightstand", "i_wardrobe", "i_desk"], mid: [] },
    bath: { w: 3.2, h: 2.6, bw: 3.0, max: 3.6, wall: ["i_bathtub", "i_toilet", "i_vanity|i_sink", "i_sconce"], mid: [] },
    ensuite: { w: 2.6, h: 2.4, wall: ["i_shower", "i_toilet", "i_sink", "i_sconce"], mid: [] },
    office: { w: 3.3, h: 3.2, bw: 3.6, max: 4.4, wall: ["i_desk", "i_bookcase", "i_filing"], mid: ["i_officechair"] },
    laundry: { w: 3.2, h: 2.8, bw: 2.8, max: 3.6, wall: ["i_washer", "i_dryer", "i_utilitysink|i_hamper"], mid: [] },
    garage: { w: 6.0, h: 6.2, wall: ["i_workbench", "i_shelving"], mid: ["i_parked"] },
    closet: { w: 2.8, h: 2.2, wall: ["i_closetrod|i_closetshelves"], mid: [] },
    hall: { w: 6.0, h: 1.4, wall: ["i_sconce", "i_sconce"], mid: [] },
    // (2.4 m across: the flight down one side, a way past it down the other --
    // off the top of it upstairs, back along the rail to the door, 40-climb.js)
    stairs: { w: 2.4, h: 4.2, bw: 2.4, max: 2.4, wall: ["i_sconce"], mid: [] },
    family: { w: 5.4, h: 4.6, bw: 5.8, max: 14, wall: ["i_sectional|i_sofa", "i_tv", "i_lamp"], mid: ["i_rug", "i_coffee"] },
    storage: { w: 3.0, h: 4.2, bw: 3.0, max: 9, wall: ["i_shelving", "i_shelving", "i_sconce"], mid: [] },
    utility: { w: 3.0, h: 4.2, bw: 3.0, max: 3.4, wall: ["i_furnace", "i_shelving", "i_sconce"], mid: [] }
  };
  // (2026-10-04: "a setting so you can do 1, 2 etc. car garage") a garage as
  // wide as its cars need (`want.cars`, two if not said): one 3.7 m, two 6 m
  // as it always was, three 9.1 m, four 12.2 m -- the widths garages are built
  // to; its doors, cars and buttons, 40-garage.js
  var STARTER_GARAGE_W = [6.0, 3.7, 6.0, 9.1, 12.2];
  function starterGarageW(want) { return STARTER_GARAGE_W[Math.max(1, Math.min(4, Math.round(+(want && want.cars) || 2) || 2))]; }
  var STARTER_GAP = 100;                 // px between rooms spread out: room for the arrows
  // (2026-10-02: "when you go to explore houses they are bigger than what
  // you are expecting so it is easier to walk around") every room a size
  // roomier, the hall wider, the bands deeper
  var STARTER_HALL = 1.7;                // metres, the hall across
  var STARTER_BAND = 4.8;                // metres, a band of rooms deep
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

  // (2026-10-02: "Homes ... of different sizes") a house small, as it was,
  // or large: its rooms that much wider, its bands a little deeper
  var STARTER_SIZES = { 1: [0.86, 1], 2: [1, 1], 3: [1.18, 1.1] };
  var STARTER_ROOMY = { living: 1, great: 1, family: 1, main: 1, bed: 1 };
  function starterScale(want) { var t = want && (!want.type || want.type === "house") ? STARTER_SIZES[want.homeSize] : null; return t ? t[0] : 1; }
  function starterDeep(want) { var t = want && (!want.type || want.type === "house") ? STARTER_SIZES[want.homeSize] : null; return t ? t[1] : 1; }
  // As many as anyone could want of each (typed in, past the steppers'
  // steps): the most a house of rooms still makes sense with.
  var STARTER_MOST = { beds: 60, baths: 40, kitchens: 12, livings: 12, offices: 30, laundries: 12 };
  // How many of a room are wanted: the count, or the old yes or no.
  function starterCount(want, many, one, most) {
    var n = want[many] !== undefined ? +want[many] : one ? (want[one] ? 1 : 0) : 1;
    return Math.max(0, Math.min(most, Math.round(n) || 0));
  }
  // ---- which way round ---------------------------------------------------------------
  // (2026-10-03) A house of one floor: its bedrooms together along the back
  // (as it was), split -- the main bedroom at one end, the rest at the
  // other, the day rooms between -- or in a wing at one end, either side of
  // the hall.  Of two floors: the bedrooms upstairs, or the main bedroom
  // downstairs.  Asked (want.zones), or the seed's own ("any"): Shuffle
  // then gives another plan, not the same one turned round.
  var STARTER_ZONES = { one: ["together", "split", "wing"], two: ["together", "downstairs"] };
  function starterZones(want, rnd, two) {
    var list = STARTER_ZONES[two ? "two" : "one"], asked = want.zones;
    var pick = list[Math.floor(rnd() * list.length) % list.length];
    if (asked && asked !== "any") { return list.indexOf(asked) >= 0 ? asked : "together"; }
    return pick;
  }
  // An open floor's front row ends at the garage: in from it through a
  // mudroom or the laundry room, not a bedroom -- a mudroom put there where
  // the house has neither (40-rooms.js).
  function starterOpenGarage(band, want, it) {
    if (!want.garage || !band.length) { return; }
    var mud = band.filter(function (r) { return r.kind === "mudroom"; })[0] || band.filter(function (r) { return r.kind === "laundry"; }).pop();
    if (mud) { band.splice(band.indexOf(mud), 1); band.push(mud); return; }
    if (STARTER_ROOMS.mudroom) { band.push(it("mudroom", TXT[STARTER_LABEL.mudroom] || "")); }
  }
  // Which opens into which on an open floor (no hall): the living space's
  // rooms, from the living room out, each joined to one it meets; every
  // other room into the part of the living space it meets most of -- or,
  // meeting none, the room beside it it meets most of -- the main
  // bedroom's own rooms off it, a nook off its room.
  var STARTER_LIVED = { living: 1, great: 1, kitchen: 1, family: 1, dining: 1, sunroom: 1 };
  var STARTER_BY_KITCHEN = { laundry: 1, pantry: 1, mudroom: 1 };
  function starterOpenJoins(f, main, byId, join, X) {
    var every = f.back.concat([].concat.apply([], f.mids || []), f.front);
    // the wall two rooms share, along (0 where they do not meet)
    function shared(p, q) {
      var a = p.local, b = q.local, ox = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), oy = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
      if ((Math.abs(a[3] - b[1]) < 3 || Math.abs(a[1] - b[3]) < 3) && ox > 0) { return ox; }
      if ((Math.abs(a[2] - b[0]) < 3 || Math.abs(a[0] - b[2]) < 3) && oy > 0) { return oy; }
      return 0;
    }
    var lived = every.filter(function (r) { return STARTER_LIVED[r.starter] && !r.starterVia; }), seen = new Set();
    var root = lived.filter(function (r) { return r.starter === "living"; })[0] || lived[0], queue = root ? [root] : [];
    if (root) { seen.add(root); }
    while (queue.length) {
      var q = queue.shift();
      lived.forEach(function (r) {
        if (seen.has(r) || shared(q, r) < X(1.0)) { return; }
        seen.add(r); queue.push(r); join(q, r);
      });
    }
    // (a nook is part of the room it opens off, no wall between: of the living space, if that is)
    every.forEach(function (r) {
      if (!r.starterVia || !byId[r.starterVia]) { return; }
      join(byId[r.starterVia], r);
      if (r.starterNook && seen.has(byId[r.starterVia])) { seen.add(r); }
    });
    // the rest, each into what it meets that is joined already -- the living
    // space first -- a round at a time, out from it (and, at the last, into
    // whatever it meets: every room of the house joined to the rest)
    var reached = new Set(seen);
    every.forEach(function (r) { if (r.starterVia && byId[r.starterVia] && reached.has(byId[r.starterVia])) { reached.add(r); } });
    var left = every.filter(function (r) { return !reached.has(r) && !(r.starterVia && byId[r.starterVia]); });
    for (var round = 0; round < 8 && left.length; round++) {
      var last = round === 7;
      left = left.filter(function (r) {
        if ((r.starter === "ensuite" || r.starter === "closet") && main && main !== r && shared(main, r) > 0 && (reached.has(main) || last)) {
          join(main, r); reached.add(r); return false;
        }
        var best = null, most = -Infinity;
        every.forEach(function (o) {
          var s = o === r ? 0 : shared(o, r);
          if (s < X(0.9) || o.starter === "ensuite" || o.starter === "closet" || (!reached.has(o) && !last)) { return; }
          // (a bathroom not straight into the kitchen; the laundry, the
          // pantry and the mudroom into it, where they can)
          var cook = o.starter === "kitchen" || o.starter === "great";
          var score = s + (seen.has(o) ? X(1000) : 0) + (cook ? (r.starter === "bath" ? -X(600) : STARTER_BY_KITCHEN[r.starter] ? X(300) : 0) : 0);
          if (score > most) { most = score; best = o; }
        });
        if (!best) { return true; }
        join(best, r); reached.add(r);
        every.forEach(function (n) { if (n.starterVia && byId[n.starterVia] === r) { reached.add(n); } });
        return false;
      });
    }
  }
  // ---- the house, laid out -----------------------------------------------------------
  // Each floor: { level, back: [...], front: [...] }, each room in a band
  // { kind, label, w } in metres, the main bedroom's own rooms a column
  // { kind: "suite", parts, w } beside it; W the width of the house.
  function starterPlan(want, rnd) {
    rnd = rnd || starterRand(1);
    // a little bigger or smaller, each house its own
    function it(kind, label) {
      var s = STARTER_ROOMS[kind], w = s.bw || s.w, k = kind === "stairs" ? 1 : starterScale(want);
      // (small, the rooms people sit and sleep in as they are: smaller, their
      // furniture no longer goes together)
      if (k < 1 && STARTER_ROOMY[kind]) { k = 1; }
      w *= k;
      if (s.max && s.max * k > w && kind !== "stairs") { w = Math.min(s.max * k, w * (1 + rnd() * 0.1)); }
      return { kind: kind, label: label || "", w: w };
    }
    function width(band) { return band.reduce(function (s, r) { return s + r.w; }, 0); }
    var two = want.floors > 1;
    // (2026-10-04: "an open concept house should not really have hallways
    // and all things should be connected as one ... no walls there ... either
    // poles in the house or metal beams in the ceiling holding things up")
    // Open concept, and a great room: no hall on the ground floor -- the
    // kitchen, the dining and the family rooms one space along the back, the
    // living room open to it at the front, and the rest opening straight
    // into it (the walls between taken out, and what holds the house up then
    // put in, as asked: arrangeOpen, 40-arrange.js)
    var open = !!want.openPlan && (!want.type || want.type === "house");
    // (2026-10-03: "creative layouts ... Shuffle must change a lot") which
    // way round it is: as asked, or the seed's own (starterZones)
    var zones = starterZones(want, rnd, two);
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
    // (2026-10-02: "set how many of each room you want in a house instead of
    // just one") how many offices, kitchens, living rooms, laundry rooms --
    // each past the first named with its number (asked on steppers, below)
    var nOffice = starterCount(want, "offices", "office", STARTER_MOST.offices), nKitchen = Math.max(1, starterCount(want, "kitchens", null, STARTER_MOST.kitchens));
    var nLiving = Math.max(1, starterCount(want, "livings", null, STARTER_MOST.livings)), nLaundry = starterCount(want, "laundries", "laundry", STARTER_MOST.laundries);
    function nth(kind, word, k, n) { return n > 1 && k ? say("st_room_n", { room: TXT[word] || "", n: k + 1 }) : ""; }
    var offices = [], laundries = [], more = [];
    for (var o = 0; o < nOffice; o++) { offices.push(it("office", nth("office", "rl_office", o, nOffice))); }
    for (var q = 0; q < nLaundry; q++) { laundries.push(it("laundry", nth("laundry", "rl_laundry", q, nLaundry))); }
    var office = offices.shift() || null, living = it("living"), kitchen = it(want.open ? "great" : "kitchen");
    var dining = want.open ? null : it("dining"), laundry = laundries.shift() || null;
    for (var c = 1; c < nKitchen; c++) { more.push(it("kitchen", say("st_room_n", { room: TXT.rl_kitchen || "", n: c + 1 }))); }
    for (var v = 1; v < nLiving; v++) { more.push(it("family", TXT.st_family)); }
    // (2026-10-03) the rooms more, as asked (40-rooms.js): a pantry, a mudroom, a playroom ...
    var extra = typeof roomsMore === "function" ? roomsMore(want, it) : { day: [], up: [] };
    function extraPut(band, r) {
      if (r.kind === "pantry") { var ki = band.indexOf(kitchen); if (ki >= 0) { band.splice(ki + 1, 0, r); return true; } }
      return false;
    }
    var G = { level: 0, back: [], front: [] }, floors = [G];
    if (open) { G.H = 0; G.open = true; }
    if (!two) {
      // one floor: the bedrooms along the back, the rest along the front --
      // the main bedroom (its own rooms either side of it) at one end or
      // the other, the rest in any order; the office by the living room or
      // past the kitchen
      var suiteBlock = col ? (rnd() < 0.5 ? [main, col] : [col, main]) : [main];
      var rest = starterShuffle(rnd, beds.concat(baths));
      G.back = rnd() < 0.5 ? suiteBlock.concat(rest) : rest.concat(suiteBlock);
      var chain = [living].concat(more.filter(function (r) { return r.kind === "family"; }), [kitchen],
                                  more.filter(function (r) { return r.kind === "kitchen"; }), [dining]).filter(Boolean);
      G.front = (office && rnd() < 0.5 ? [office].concat(chain) : chain.concat(office ? [office] : [])).concat(offices, laundries, laundry ? [laundry] : []);
      var cooking = [kitchen].concat(more.filter(function (r) { return r.kind === "kitchen"; }), dining ? [dining] : []);
      var sitting = [living].concat(more.filter(function (r) { return r.kind === "family"; }), office ? [office] : [], offices);
      var utility = laundries.concat(laundry ? [laundry] : []);
      if (open) {
        // no hall: the kitchen, the dining room and the family rooms along the
        // back, one space out to the yard, the main bedroom at its far end
        // (its own rooms past it); along the front, a room under the main
        // bedroom, the living room (the way in, open to the space behind)
        // and the rest, each under the living space and opening straight
        // into it -- the laundry, the pantry and the mudroom by the garage.
        // Split, the other bedrooms over at the garage's side of the house.
        var byGarage = utility.concat(extra.day.concat(extra.up).filter(function (r) { return r.kind === "pantry" || r.kind === "mudroom"; }));
        var others = extra.day.concat(extra.up).filter(function (r) { return r.kind !== "pantry" && r.kind !== "mudroom" && r.kind !== "sunroom"; });
        var desks = (office ? [office] : []).concat(offices);
        var suiteOut = col ? [col, main] : [main];                    // (the bedroom itself by the living space)
        // (as wide as they are made: grown, they would push the living room
        // along from under the living space it opens into)
        suiteOut.forEach(function (r) { r.fixed = true; });
        var order = zones === "split" ? desks.concat(others, rest) : rest.concat(desks, others);
        var sun = extra.day.concat(extra.up).filter(function (r) { return r.kind === "sunroom"; });
        var fams = more.filter(function (r) { return r.kind === "family"; });
        if (width(suiteOut) + width(order) + width(byGarage) <= 16) {
          // under the main bedroom, as much of it as there are rooms to go
          // there -- the living room then all under the living space, open to it
          // (with a basement, its stairs there instead, beside the living room: one over the other)
          var under = [];
          while (!want.basement && order.length && width(under) < width(suiteOut) - 1.0) { under.push(order.shift()); }
          under.forEach(function (r) { r.fixed = true; });
          // (a sunroom out to the yard as well, at the far end of the space)
          G.back = suiteOut.concat(sun, fams, cooking.slice().reverse());
          G.dayAt = suiteOut.length;
          G.front = under.concat([living], order, byGarage);
        } else {
          // more rooms than one row along it has room for (a house of them
          // in a line half a street long): three rows -- the living space
          // through the middle of the house, the bedrooms and the rest along
          // the back and the front either side of it, each opening straight
          // into it; the kitchen out at the back, the living room at the
          // front, the way in; each row about as long as the other
          var cooks = cooking.filter(function (r) { return r !== dining; }), backs = [], fronts = [];
          order.forEach(function (r) {
            (width(suiteOut) + width(backs) + width(cooks) <= width(fronts) + living.w + width(byGarage) ? backs : fronts).push(r);
          });
          G.back = suiteOut.concat(backs, cooks);
          G.dayAt = suiteOut.length + backs.length;
          G.mid = [sun.concat(fams, dining ? [dining] : [])];
          var half = Math.ceil(fronts.length / 2);
          G.front = fronts.slice(0, half).concat([living], fronts.slice(half), byGarage);
        }
        starterOpenGarage(G.front, want, it);
      } else if (zones === "split") {
        // the main bedroom at one end, the other bedrooms at the other, the
        // kitchen between them -- across the hall from the living room
        G.back = suiteBlock.concat(cooking, rest);
        G.front = sitting.concat(utility);
      } else if (zones === "wing") {
        // the bedrooms all at one end, either side of the hall; the day
        // rooms at the other, by the garage
        var half = Math.ceil(rest.length / 2);
        G.back = suiteBlock.concat(rest.slice(0, half), cooking);
        G.front = rest.slice(half).concat(sitting, utility);
      }
      // (open: the rest in the back already, and the two bands made as long
      // as each other after, by `fill` -- not a bedroom brought round to the front)
      if (!open) {
        // the pantry after the kitchen, the mudroom at the end by the garage, the rest where the bands are shortest
        extra.day.concat(extra.up).forEach(function (r) {
          if (extraPut(G.front, r)) { return; }
          if (r.kind === "mudroom") { G.front.push(r); return; }
          (width(G.back) <= width(G.front) ? G.back : G.front).push(r);
        });
        // the two about as long as each other: a bedroom brought round to
        // the front, or the office and the laundry room to the back
        while (width(G.back) - width(G.front) > 3 && G.back.some(function (r) { return r.kind === "bed"; })) {
          var last = G.back.filter(function (r) { return r.kind === "bed"; }).pop();
          G.back.splice(G.back.indexOf(last), 1);
          // (in a bedroom wing, round to the wing's own end of the front)
          if (zones === "wing") { G.front.splice(G.front.filter(function (r) { return r.kind === "bed" || r.kind === "bath"; }).length, 0, last); }
          else { G.front.unshift(last); }
        }
        [office].concat(offices, laundries, [laundry]).forEach(function (r) {
          if (r && width(G.front) - width(G.back) > 3) { G.front.splice(G.front.indexOf(r), 1); G.back.push(r); }
        });
      }
    } else {
      // two: the kitchen at the back downstairs, the living room at the
      // front; the bedrooms upstairs, the stairs at the end of the hall
      var mainBlock = col && rnd() < 0.5 ? [col, main] : [main].concat(col ? [col] : []);
      var U = { level: 1, back: [it("stairs", TXT.st_stairs)].concat(zones === "downstairs" ? [] : mainBlock), front: [] };
      beds = starterShuffle(rnd, beds);
      G.back = [it("stairs", TXT.st_stairs), kitchen].concat(more.filter(function (r) { return r.kind === "kitchen"; }), dining ? [dining] : []);
      // (a main bedroom downstairs, at the far end of the back from the stairs: the rest up)
      if (zones === "downstairs") { G.back = G.back.concat(mainBlock.slice().reverse()); }
      G.front = [living].concat(more.filter(function (r) { return r.kind === "family"; }), office ? [office] : []);
      if (open) {
        // no hall downstairs: the stairs up, the family rooms, the dining
        // room and the kitchen along the back, one space; the living room
        // along the front, the stairs' foot in it, and beside it the office,
        // a bathroom, the rest and the laundry by the garage, each opening
        // into the space behind (the main bedroom downstairs among them)
        G.back = [G.back[0]].concat(extra.day.filter(function (r) { return r.kind === "sunroom"; }), more.filter(function (r) { return r.kind === "family"; }),
                                    dining ? [dining] : [], more.filter(function (r) { return r.kind === "kitchen"; }), [kitchen]);
        G.dayAt = 1;
        // (the bathroom next to the living room, its door into it -- not into the kitchen)
        G.front = [living].concat(baths.length > 1 ? [baths.shift()] : [], office ? [office] : [],
                                  zones === "downstairs" ? mainBlock.slice().reverse() : [],
                                  extra.day.filter(function (r) { return r.kind !== "pantry" && r.kind !== "mudroom" && r.kind !== "sunroom"; }),
                                  laundry ? [laundry] : [], extra.day.filter(function (r) { return r.kind === "pantry" || r.kind === "mudroom"; }));
        starterOpenGarage(G.front, want, it);
      } else {
        if (baths.length > 1) { (width(G.back) <= width(G.front) ? G.back : G.front).push(baths.shift()); }
        if (laundry) { G.front.push(laundry); }
        extra.day.forEach(function (r) {
          if (extraPut(G.back, r)) { return; }
          if (r.kind === "mudroom") { G.front.push(r); return; }
          (width(G.back) <= width(G.front) ? G.back : G.front).push(r);
        });
      }
      // a second laundry room, and the offices past the first, upstairs by the bedrooms (and a playroom, a library, a gym)
      beds.concat(baths, offices, laundries, extra.up).forEach(function (r) { (width(U.back) <= width(U.front) ? U.back : U.front).push(r); });
      floors.push(U);
    }
    // (2026-10-03) a finished attic: a flight up to it from the top floor, by
    // the stairs up to that one (the attic put over it after, 40-attic.js)
    // (an open floor's in the front row, its foot in the living space behind it)
    if (want.attic === "room" && !two && open) { G.front.splice(G.front.indexOf(living) + 1, 0, it("stairs", TXT.st_stairs)); }
    else if (want.attic === "room") { (two ? U : G).back.splice(two ? 1 : 0, 0, it("stairs", TXT.st_stairs)); }
    if (want.basement) {
      // down from the front band, its foot in the hall; a family room,
      // a utility room and storage below (an open floor's beside the living
      // room, open to it -- and the flight below it one under the other)
      var downAt = open && !two ? G.front.indexOf(living) : 0, lead = width(G.front.slice(0, Math.max(0, downAt)));
      G.front.splice(Math.max(0, downAt), 0, it("stairs", TXT.st_stairs));
      var below = { level: -1, back: [it("family", TXT.st_family)],
                    front: [it("stairs", TXT.st_stairs)].concat(starterShuffle(rnd, [it("utility", TXT.st_utility), it("storage", TXT.st_storage)])) };
      if (lead > 0.5) { var pad = it("storage", TXT.st_storage); pad.w = lead; pad.fixed = true; below.front.unshift(pad); }
      floors.push(below);
    }
    // (an open floor's living room broad enough to meet the living space
    // behind it, past what is beside it along the back, by a good stretch)
    if (open && !G.mid) {
      var aBack = width(G.back.slice(0, G.dayAt || 0)), bFront = width(G.front.slice(0, Math.max(0, G.front.indexOf(living))));
      living.w = Math.max(living.w, aBack - bFront + 2.6);
    }
    // (2026-10-03) a nook beside a room now and then, part of it (40-oddrooms.js) --
    // not on an open floor: a nook along a row there stood between rooms and
    // the living space they open into (2026-10-04)
    if (typeof oddNooks === "function") { oddNooks(floors.filter(function (f) { return !f.open; }), want, rnd, it); }
    // (2026-10-03) a long house folded into more rows (starterFold)
    starterFold(floors, want, rnd, it, width, two);
    // as wide as the widest band; each band grown out to that, the floor
    // under another and the front by the garage all the way
    var W = 0;
    floors.forEach(function (f) {
      W = Math.max(W, width(f.back), width(f.front));
      (f.mid || []).forEach(function (row) { W = Math.max(W, width(row)); });
    });
    function fill(band, must, filler, to, keepEnd, first) {
      var Wb = to === undefined ? W : to;
      // (keepEnd: the room at the garage's end stays at the end, and its size;
      // first: where a room more goes in, if not at the end -- an open
      // floor's at the far end of its living space)
      var end = keepEnd && band.length > 1 && (band[band.length - 1].kind === "mudroom" || band[band.length - 1].kind === "laundry") ? band.pop() : null;
      if (end) { Wb -= end.w; }
      try { fillTo(band, must, filler, Wb, first); } finally { if (end) { band.push(end); } }
    }
    function fillTo(band, must, filler, Wb, first) {
      for (var pass = 0; pass < 4; pass++) {
        var short = Wb - width(band);
        if (short < 0.01) { break; }
        var grow = band.filter(function (r) { return r.kind !== "suite" && !r.fixed && (STARTER_ROOMS[r.kind].max || r.w) - r.w > 0.01; });
        var room = grow.reduce(function (s, r) { return s + STARTER_ROOMS[r.kind].max - r.w; }, 0);
        if (!room) { break; }
        grow.forEach(function (r) { r.w += (STARTER_ROOMS[r.kind].max - r.w) * Math.min(1, short / room); });
      }
      var left = Wb - width(band);
      if (!must || left < 0.01) { return; }
      if (left >= 2.6) {
        // (in a row between two halls, with no outside wall but at its ends, a store room)
        var fam = filler === "storage" ? it("storage", TXT.st_storage) : it("family", TXT.st_family);
        fam.w = left;
        if (first >= 0) { band.splice(first, 0, fam); } else { band.push(fam); }
        return;
      }
      var wide = band.filter(function (r) { return r.kind !== "suite" && r.kind !== "stairs" && !r.cross; }).pop() || band[band.length - 1];
      wide.w += left;
    }
    // (every floor of a house of two the whole width: an upstairs narrower
    // than the ground floor left parts of it sticking out, roofed apart,
    // and a notch in the middle of the house -- 2026-10-01)
    floors.forEach(function (f) {
      // (an open floor's back the whole length too: every room on it opens into the front)
      var whole = (two || f.open || !!(f.mid && f.mid.length)) && f.level >= 0;
      fill(f.back, whole, undefined, undefined, false, f.open ? f.dayAt || 0 : -1);
      // (a row between two halls is filled out to their length: a gap there was a hole in the house)
      (f.mid || []).forEach(function (row) {
        // (an open floor's: the living space, out to both ends of the house,
        // a family room more at its far end where it is short)
        if (f.open) { fill(row, true, undefined, undefined, false, row[0] && row[0].kind === "sunroom" ? 1 : 0); return; }   // (a sunroom kept at the end: its outside walls)
        // its far end in the house's outside wall: what was at the end stays at the end
        var end = row.length > 1 && STARTER_DAY[row[row.length - 1].kind] ? row.pop() : null;
        fill(row, true, "storage", end ? W - end.w : W);
        if (end) { row.push(end); }
      });
      fill(f.front, whole || (f.level === 0 && want.garage), undefined, undefined, !!f.open && want.garage);
    });
    // (a deeper front band, the living rooms broad, or a deeper back, the
    // bedrooms -- the same on every floor, each over the other)
    var skew = starterPick(rnd, [0, 0.4, 0.8, -0.4, 0.6]);
    // (an open floor's front the deeper by the hall it has not got: the
    // living space broad, and the floor as deep as those over and under it)
    floors.forEach(function (f) { f.dF = skew + (f.open && !f.mid ? STARTER_HALL : 0); f.dB = skew < 0 ? -skew : -skew / 2; });
    // (an open floor's middle row's family rooms: STARTER_CALM)
    floors.forEach(function (f) { if (f.open) { (f.mid || []).forEach(function (row) { row.forEach(function (r) { if (r.kind === "family") { r.calm = true; } }); }); } });
    return { floors: floors, W: W, two: two, zones: zones, open: open };
  }

  // ---- a long house folded into more rows -----------------------------------------------------
  // (2026-10-03: "update it so the 2d blueprints are of in a more even
  // rectangle rather than just being long length wise")  Two rows of rooms
  // along a hall made a house as long as all its rooms side by side.  Past
  // about one and a half times as long as deep it is folded: more rows, a
  // hall between each two, the halls joined by a short one across the row
  // between them; the rooms that want daylight -- the bedrooms, the living
  // rooms and the kitchen, an office -- along the outside rows and at the
  // ends of the rows inside, where there is an outside wall; the bathrooms,
  // the laundry, closets and storage in the middle.  How many rows: what
  // brings it nearest a square (a little longer than deep), the seed
  // choosing between two near as good.  A house of two floors has as many
  // rows on each, some of the bedrooms downstairs where upstairs would run
  // far longer than the floor under it.
  var STARTER_DAY = { main: 1, bed: 1, living: 1, great: 1, kitchen: 1, family: 1, office: 1, dining: 1 };
  var STARTER_FRONT = { living: 1, great: 1, kitchen: 1, family: 1, dining: 1 };
  function starterFold(floors, want, rnd, it, width, two) {
    var D = STARTER_BAND * starterDeep(want) + 0.2, H = STARTER_HALL, garageW = want.garage ? starterGarageW(want) : 0;
    var G = floors.filter(function (f) { return f.level === 0; })[0], U = floors.filter(function (f) { return f.level === 1; })[0];
    // (an open floor is not folded: rows between halls are what it has none of)
    if (!G || G.open) { return; }
    function size(f) { return width(f.back) + width(f.front); }
    // upstairs far the longer: bedrooms (and a bathroom for them) brought down
    if (two && U) {
      for (var guard = 0; guard < 80 && size(U) > size(G) * 1.25 + 6; guard++) {
        var band = width(U.back) >= width(U.front) ? U.back : U.front, i = -1;
        for (var j = band.length - 1; j >= 0; j--) { if (band[j].kind === "bed") { i = j; break; } }
        if (i < 0) { band = band === U.back ? U.front : U.back; for (j = band.length - 1; j >= 0; j--) { if (band[j].kind === "bed" || band[j].kind === "bath") { i = j; break; } } }
        if (i < 0) { break; }
        var moved = band.splice(i, 1)[0];
        (width(G.back) <= width(G.front) ? G.back : G.front).push(moved);
      }
    }
    function rowsFor(S, extra) {
      function score(k) {
        var n = k + 2, Wk = S / n + extra, Dk = n * D + (k + 1) * H;
        return Math.abs(Math.log(Wk / Dk / 1.15));
      }
      var scored = [];
      for (var k = 0; k <= 16; k++) { scored.push([k, score(k)]); }
      scored.sort(function (a, b) { return a[1] - b[1]; });
      if (scored[0][0] === 0 || score(0) - scored[0][1] < 0.18) { return 0; }    // compact already: as it was
      var near = scored.filter(function (q) { return q[0] > 0 && q[1] - scored[0][1] < 0.12; });
      return near[Math.floor(rnd() * near.length)][0];
    }
    // as many rows on every floor as the biggest wants
    var most = 0;
    floors.forEach(function (f) { if (f.level >= 0) { most = Math.max(most, size(f)); } });
    var k = rowsFor(most, garageW);
    if (!k) { return; }
    floors.forEach(function (f) { if (f.level >= 0) { starterFoldFloor(f, k, rnd, width); } });
  }
  function starterFoldFloor(f, k, rnd, width) {
    var all = f.back.concat(f.front);
    var up = f.back[0] && f.back[0].kind === "stairs" ? f.back[0] : null;            // the stairs up stay at the end of the first hall
    var down = f.front[0] && f.front[0].kind === "stairs" ? f.front[0] : null;      // and down, the first thing in the first row inside
    // the main bedroom and its own rooms beside it, together
    var units = [], held = new Set([up, down]);
    function bandOf(r) { return f.back.indexOf(r) >= 0 ? f.back : f.front; }
    all.forEach(function (r) {
      if (!r || held.has(r)) { return; }
      if (r.kind === "suite" && r.nookHost) { return; }                                         // (with its room, below)
      var band = bandOf(r), at = band.indexOf(r), unit = [r];
      if (r.kind === "main") {
        var mate = band[at + 1] && band[at + 1].kind === "suite" && !band[at + 1].nookHost ? band[at + 1]
                 : band[at - 1] && band[at - 1].kind === "suite" && !band[at - 1].nookHost ? band[at - 1] : null;
        if (mate) { held.add(mate); unit.push(mate); }
      } else if (r.kind === "suite" && all.some(function (m) { return m.kind === "main"; })) { return; }   // (with its bedroom)
      // a nook beside its room, where it was
      if (r.nookCol && band.indexOf(r.nookCol) >= 0) { held.add(r.nookCol); unit.push(r.nookCol); }
      unit.sort(function (p, q) { return band.indexOf(p) - band.indexOf(q); });
      held.add(r);
      units.push({ rooms: unit, kind: r.kind });
    });
    function uw(u) { return width(u.rooms); }
    var total = units.reduce(function (t, u) { return t + uw(u); }, 0) + (up ? up.w : 0) + (down ? down.w : 0) + k * STARTER_HALL;
    var Wt = total / (k + 2);
    // the rows: the back, those inside (two ends with an outside wall, and the middle), the front
    var rows = [{ name: "back", list: up ? [up] : [] }];
    for (var m = 0; m < k; m++) { rows.push({ name: "mid", left: m === 0 && down ? { rooms: [down], kind: "stairs" } : null, right: null, middle: [] }); }
    rows.push({ name: "front", list: [] });
    function rowW(row) {
      if (row.name !== "mid") { return row.list.reduce(function (t, x) { return t + (x.rooms ? uw(x) : x.w); }, 0); }
      return (row.left ? uw(row.left) : 0) + (row.right ? uw(row.right) : 0) +
             row.middle.reduce(function (t, x) { return t + uw(x); }, 0) + STARTER_HALL;
    }
    // where each may go: daylight where it is wanted (an outside row, or an
    // end of a row inside), the front door's room on the front; what needs
    // no window, down the middle first
    function places(u) {
      var out = [], back = rows[0], front = rows[rows.length - 1], mids = rows.slice(1, -1);
      function outer() { out.push({ row: back, how: "list", pref: 0 }, { row: front, how: "list", pref: 0 }); }
      function ends(pref) { mids.forEach(function (row) { if (!row.left) { out.push({ row: row, how: "left", pref: pref }); } if (!row.right) { out.push({ row: row, how: "right", pref: pref }); } }); }
      function middle(pref) { mids.forEach(function (row) { out.push({ row: row, how: "middle", pref: pref }); }); }
      if (u.kind === "living") { out.push({ row: front, how: "list", pref: 0 }); }
      // (a room with a nook beside it, 40-oddrooms.js: on an outside row, the nook against its outside wall)
      else if (u.kind === "main" || u.rooms.some(function (r) { return r.nookHost; })) { outer(); }
      else if (u.kind === "bed" || u.kind === "kitchen" || u.kind === "great") { outer(); ends(0.5); }
      else if (u.kind === "office" || u.kind === "dining" || u.kind === "family" || (typeof STARTER_OUTER === "object" && STARTER_OUTER[u.kind])) { outer(); ends(0.3); }     // (they want a window too)
      else { middle(0); outer(); out.forEach(function (o) { if (o.how === "list") { o.pref = 1.5; } }); }
      return out;
    }
    function put(u, o) {
      if (o.how === "list") { o.row.list.push(u); } else if (o.how === "middle") { o.row.middle.push(u); } else { o.row[o.how] = u; }
    }
    // the living room first, on the front; then the biggest first, each where
    // its row comes out shortest (a little longer allowed where it is better put)
    var order = units.slice().sort(function (p, q) { return (p.kind === "living" ? -1 : 0) - (q.kind === "living" ? -1 : 0) || uw(q) - uw(p); });
    // the kitchen beside the living room, where the front has room for it (they open into each other)
    order.forEach(function (u) {
      var best = null;
      places(u).forEach(function (o) {
        var cost = rowW(o.row) + uw(u) + o.pref * 1.2 + (rnd() - 0.5) * 0.6;
        if (u.kind === "kitchen" || u.kind === "great") {
          var liv = rows[rows.length - 1].list.some(function (x) { return x.kind === "living"; });
          if (liv && o.row === rows[rows.length - 1]) { cost -= 2.5; }
        }
        if (!best || cost < best.cost) { best = { o: o, cost: cost }; }
      });
      if (best) { put(u, best.o); }
    });
    function flat(list) {
      var out = [];
      list.forEach(function (x) { if (x.rooms) { Array.prototype.push.apply(out, x.rooms); } else { out.push(x); } });
      return out;
    }
    // in the front row, the kitchen (and the dining room) after the living room
    var fr = rows[rows.length - 1].list, liv = fr.filter(function (x) { return x.kind === "living"; })[0];
    if (liv) {
      var kit = fr.filter(function (x) { return x.kind === "kitchen" || x.kind === "great"; })[0], din = fr.filter(function (x) { return x.kind === "dining"; })[0];
      [kit, din].forEach(function (x) { if (x) { fr.splice(fr.indexOf(x), 1); } });
      var at = fr.indexOf(liv) + 1;
      if (din) { fr.splice(at, 0, din); }
      if (kit) { fr.splice(at, 0, kit); }
    }
    f.back = flat(rows[0].list);
    f.front = flat(fr);
    // each row inside: its ends, what is between, and the short hall across it somewhere along
    f.mid = rows.slice(1, -1).map(function (row) {
      var middle = flat(row.middle), cross = { kind: "hall", label: TXT.st_hall, w: STARTER_HALL, cross: true };
      middle.splice(Math.floor(rnd() * (middle.length + 1)), 0, cross);
      return (row.left ? row.left.rooms : []).concat(middle, row.right ? row.right.rooms : []);
    });
  }

  // ---- the house, made ---------------------------------------------------------------
  // (2026-10-03: "whenever I hit make it can you update it so it does not
  // freeze the whole site")  Made a step at a time: what it does, said as it
  // goes (yield [stage, how far]) -- all at once where it is asked for all
  // at once (starterMake), or a slice at a time between the page's own
  // frames (starterMakeLive, 40-work.js), a bar saying how far along.
  function* starterWork(want) {
    var P = FLOOR_PX, G = want.spread ? STARTER_GAP : 0, made = [], links = [];
    keepUndo();
    // its seed: given (the same house again), or new (another house)
    var seed = want.seed !== undefined ? want.seed >>> 0 : Math.floor(Math.random() * 4294967295);
    var rnd = starterRand(seed);
    var plan = starterPlan(want, rnd), W = plan.W, H = STARTER_HALL;
    var D = starterPick(rnd, [STARTER_BAND, STARTER_BAND + 0.2, STARTER_BAND + 0.4]) * starterDeep(want);   // its rooms this deep
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
      if (spec) { n.starterId = spec.id; n.starterVia = spec.via; n.starterEntry = spec.entry; n.starterGo = spec.go; n.starterBay = spec.bay; n.starterNook = spec.nook; n.starterCalm = spec.calm; }
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
    function flight(f, bay, foot, side) {
      var s = { id: hand.next++, kind: "i_stairs", text: "", x: 0, y: 0, w: 140, h: 46 };
      measure(s);
      s.w = 50; s.h = 150;
      // against one side, the way past it on the other (side > 0: its right)
      s.x = side > 0 ? Math.round(bay.x + bay.w / 2 - X(0.16) - s.w / 2) : Math.round(bay.x - bay.w / 2 + X(0.16) + s.w / 2);
      s.y = Math.round(foot > 0 ? bay.y + bay.h / 2 - X(1.05) - s.h / 2 : bay.y - bay.h / 2 + X(1.05) + s.h / 2);
      if (foot < 0) { s.turn = 180; }
      f.nodes.push(s);
      return s;
    }
    // (on an open floor, a flight against the side away from the living
    // space beside its bay, the way up past it on that side -- and the
    // flights over and under it the same way round: one over the other)
    var sideAt = {};
    function stairSide(f, r) {
      var key = Math.round(r.local[0]) + ":" + Math.round(r.local[2]);
      if (f.open) {
        var band = f.back.indexOf(r) >= 0 ? f.back : f.front, i = band.indexOf(r);
        var by = [band[i + 1], band[i - 1]].filter(function (o) { return o && STARTER_LIVED[o.starter]; })[0];
        if (by) { sideAt[key] = by.x < r.x ? 1 : -1; }
      }
      return sideAt[key] || -1;
    }
    plan.floors.forEach(function (fp) {
      var f = { level: fp.level, nodes: [], back: [], front: [], hall: null, ups: [], open: !!fp.open };
      floors.push(f);
      var across = Math.max(fp.back.length, fp.front.length);
      // (each band as deep as the floor has it -- a shop's floor deeper
      // than a bedroom -- and the hall none at all where the building's
      // rooms open off each other, 39-types.js)
      var Db = fp.Db || D + (fp.dB || 0), Df = fp.Df || D + (fp.dF || 0), Hh = fp.H === undefined ? H : fp.H;
      // (a folded house, starterFold: rows between halls, each as deep as the rest)
      var mids = Hh > 0 || fp.open ? fp.mid || [] : [], Dm = fp.Dm || D, Ys = Db + Hh + mids.length * (Dm + Hh);
      f.depth = Ys + Df;
      f.mids = [];
      f.halls = [];
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
      mids.forEach(function (row) { wide = Math.max(wide, row.reduce(function (s, r) { return s + r.w; }, 0)); });
      if (Hh > 0) { f.hall = room(f, "hall", TXT.st_hall, 0, X(Db), X(wide), X(Db + Hh), (across - 1) * G / 2, 0); f.halls.push(f.hall); }
      // the rows inside, each with the hall under it (spread out on the paper
      // one gap further down each time)
      mids.forEach(function (row, j) {
        var y0 = Db + Hh + j * (Dm + Hh), band = [];
        at = 0;
        row.forEach(function (r, i) {
          // (a column of two in a row inside, 40-forms.js -- a lift behind its lobby: the second
          // part against the hall over it, the way in, the first behind it)
          if (r.kind === "suite") {
            var cut = r.parts.length > 1 ? y0 + Math.min(2.0, Dm / 2) : y0 + Dm;
            r.parts.forEach(function (p, k) {
              var top = r.parts.length > 1 && k === 1;
              band.push(room(f, p.kind, p.label, X(at), top ? X(y0) : X(r.parts.length > 1 ? cut : y0), X(at + r.w), top ? X(cut) : X(y0 + Dm), i * G, G * (2 * j + 1), p));
            });
            at += r.w;
            return;
          }
          var made1 = room(f, r.kind, r.label, X(at), X(y0), X(at + r.w), X(y0 + Dm), i * G, G * (2 * j + 1), r);
          if (r.cross) { made1.starterCross = true; }
          band.push(made1);
          at += r.w;
        });
        f.mids.push(band);
        if (Hh > 0) { f.halls.push(room(f, "hall", TXT.st_hall, 0, X(y0 + Dm), X(wide), X(y0 + Dm + Hh), (across - 1) * G / 2, G * (2 * j + 2))); }
      });
      at = 0;
      fp.front.forEach(function (r, i) {
        if (r.kind === "suite") {
          var y0 = Ys, near = r.parts.length > 1 ? 2.0 : 0;
          r.parts.forEach(function (p, k) {
            var a = k ? X(y0) : X(y0 + near), b = k ? X(y0 + near) : X(y0 + Df);
            f.front.push(room(f, p.kind, p.label, X(at), a, X(at + r.w), b, i * G, G * (2 * mids.length + 1) + (r.parts.length > 1 && !k ? G / 2 : 0) - (k ? G / 2 : 0), p));
          });
          at += r.w;
          return;
        }
        f.front.push(room(f, r.kind, r.label, X(at), X(Ys), X(at + r.w), X(Ys + Df), i * G, G * (2 * mids.length + 1), r));
        at += r.w;
      });
      if (fp.level === 0 && want.garage && !plan.noGarage && (f.hall || f.open)) {
        // beside the last hall, and the front row's end
        var gy = Ys - Hh;
        f.garage = room(f, "garage", "", X(W), X(gy), X(W) + X(starterGarageW(want)), X(gy) + X(6.2), fp.front.length * G, G * (2 * mids.length + 1));
      }
      // the stairs in their bays: up from the back, down from the front --
      // or, in a stairwell, a flight up or down as its bay says, or none
      f.back.concat(f.front, [].concat.apply([], f.mids)).forEach(function (r) {
        if (r.starter === "stairs" && r.starterGo !== "none") {
          f.ups.push({ s: flight(f, r, f.back.indexOf(r) >= 0 ? 1 : -1, stairSide(f, r)), back: f.back.indexOf(r) >= 0, go: r.starterGo, bay: r.starterBay });
        }
      });
    });
    // which opens into which: everything off the hall, but the kitchen off
    // the living room beside it, the dining room off the kitchen, the main
    // bedroom's own rooms off it, and the garage through the laundry room
    floors.forEach(function (f) {
      var rows = [f.back].concat(f.mids || [], [f.front]), every = [].concat.apply([], rows);
      var main = every.filter(function (m) { return m.starter === "main"; })[0], byId = {};
      every.forEach(function (r) { if (r.starterId) { byId[r.starterId] = r; } });
      var halls = f.halls && f.halls.length ? f.halls : [f.hall];
      // (an open floor has no hall: its own way, starterOpenJoins)
      var joined = f.open && !f.hall ? [] : [f.back].concat(f.mids || [], [f.front]);
      if (f.open && !f.hall) { starterOpenJoins(f, main, byId, join, X); }
      joined.forEach(function (band, bi, bands) {
        // (the back row off the first hall, each row inside off the hall over
        // it, the front off the last)
        var hall = bi === 0 ? halls[0] : bi === bands.length - 1 ? halls[halls.length - 1] : halls[bi - 1];
        band.forEach(function (r, i) {
          var kind = r.starter, prev = i ? band[i - 1] : null;
          if (r.starterCross) { join(halls[bi - 1], r); join(r, halls[bi]); return; }
          if (r.starterVia && byId[r.starterVia]) { join(byId[r.starterVia], r); }
          else if (r.starterVia || (!f.hall && r.starterEntry)) { return; }
          else if ((kind === "ensuite" || kind === "closet") && main && band.indexOf(main) >= 0) { join(main, r); }
          else if ((kind === "kitchen" || kind === "great") && prev && prev.starter === "living") { join(prev, r); }
          else if (kind === "dining" && prev && (prev.starter === "kitchen" || prev.starter === "great")) { join(prev, r); }
          else if (hall) { join(hall, r); }
        });
      });
      // (a nook: part of the room it opens off, no wall between, 40-oddrooms.js)
      every.forEach(function (r) {
        if (!r.starterNook || !r.starterVia || !byId[r.starterVia] || typeof oddJoin !== "function") { return; }
        // (which side meets its room, where they go together -- drawn apart, they may not meet on the paper)
        var h = byId[r.starterVia], a = r.local, b = h.local;
        var side = Math.abs(a[0] - b[2]) < 2 ? "left" : Math.abs(a[2] - b[0]) < 2 ? "right" : Math.abs(a[1] - b[3]) < 2 ? "top" : Math.abs(a[3] - b[1]) < 2 ? "foot" : null;
        if (side) { oddJoin(h, r, side); }
      });
      if (f.garage) {
        var end = f.front[f.front.length - 1];
        // (the laundry room only where its end is the garage's wall)
        var meets = end && Math.abs(end.local[2] - X(W)) < 2;
        // (an open floor, no hall: in through the room at the front row's end, starterOpenGarage)
        join(end && end.starter === "laundry" && meets ? end : halls[halls.length - 1] || end, f.garage);
      }
    });
    yield ["plan", 0.4];
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
    // and a way out at the back, to the deck and the yard (40-outside.js)
    if (typeof ybBackDoors === "function") { ybBackDoors(ground, ways, links, want, fronts); }

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
    // (every floor named, its storey kept on it: the floors over the first
    // had no name, and a block of five drawn in two rows was stacked in the
    // paper's order -- its top floor third, 2026-10-03; 38-walk.js levelKey)
    function levelName(lv) { return LEVEL_NAME[lv] || (lv > 0 ? say("fl_upper", { n: lv }) : TXT.fl_basement + " " + (-lv)); }
    if (boxed) {
      floors.forEach(function (f) {
        var b = boxOf(f.nodes);
        f.box = { id: hand.next++, kind: "i_floor", text: levelName(f.level), x: 0, y: 0, w: 140, h: 46 };
        measure(f.box);
        f.box.text = levelName(f.level); f.box.own = true; f.box.storey = f.level;
        f.box.bldg = seed;                   // this house's floors, stacked on each other and no other (38-walk.js)
        f.box.x = Math.round((b.l + b.r) / 2); f.box.y = Math.round((b.t + b.b) / 2);
        f.box.w = Math.round(b.r - b.l + 2 * rim); f.box.h = Math.round(b.b - b.t + 2 * rim);
        hand.nodes.unshift(f.box);           // under what is on it
      });
      // each Floor round the floor as it is put together, the same way on
      // every one, so that in 3D each stands square on the one under it
      tieHeld = null;
      var J0 = typeof tieLayout === "function" ? tieLayout() : null;
      // (every floor's Floor as deep as the deepest: a folded house's floors
      // are deeper than a basement left as it was, and each stands over the
      // one under it from the back, not the middle -- 2026-10-03)
      var deepest = 0;
      floors.forEach(function (f) { deepest = Math.max(deepest, f.depth); });
      floors.forEach(function (f) {
        // the middle of the house put together -- worked out from where the
        // hall goes (or, with no hall, the first room), knowing where in the
        // house that is
        var a = f.hall || f.back[0] || f.front[0];
        var m = J0 && J0.moves[a.id], hx = m ? m.x : a.x, hy = m ? m.y : a.y;
        var cx = hx - (a.local[0] + a.local[2]) / 2 + (flip ? -X(W) / 2 : X(W) / 2);
        var cy = hy - (a.local[1] + a.local[3]) / 2 + X(deepest) / 2;
        var b = boxOf(f.nodes);
        // round the rooms both as drawn and as put together (the garage too)
        var half = Math.max(cx - b.l, b.r - cx, X(W) / 2 + (f.garage ? f.garage.w : 0)) + rim;
        var tall = Math.max(cy - b.t, b.b - cy, X(deepest) / 2 + (f.garage ? X(1.0) : 0)) + rim;
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
    // -- in rows, as many as bring the whole nearest a sheet 16 by 9: a
    // tower's forty floors in one row were a strip the paper (4:3 or 16:9,
    // 10-hand.js) was mostly empty round (2026-10-03)
    var placing = floors.map(function (f) {
      var parts = f.box ? [f.box] : f.nodes;
      if (f.lot) { parts = parts.concat([f.lot]); }
      var b0 = boxOf(parts);
      return { f: f, parts: parts, w: b0.r - b0.l + 240, h: b0.b - b0.t + 240 };
    });
    var perRow = placing.length;
    if (placing.length > 3) {
      var wAll = 0, hMost = 0, bestErr = Infinity;
      placing.forEach(function (p) { wAll += p.w; hMost = Math.max(hMost, p.h); });
      for (var rowsN = 1; rowsN <= placing.length; rowsN++) {
        var cols = Math.ceil(placing.length / rowsN), err = Math.abs(Math.log((wAll / placing.length * cols) / (hMost * rowsN) / (16 / 9)));
        if (err < bestErr) { bestErr = err; perRow = cols; }
      }
    }
    cursor = right === -Infinity ? 140 : right + 240;
    var rowLeft = cursor, rowTop = 160, rowTall = 0;
    placing.forEach(function (p, i) {
      if (i && i % perRow === 0) { cursor = rowLeft; rowTop += rowTall + 240; rowTall = 0; }
      var f = p.f, b = boxOf(p.parts);
      var dx = cursor - b.l, dy = rowTop - b.t;
      shift(f, dx, dy);
      if (f.lot) { f.lot.x = Math.round(f.lot.x + dx); f.lot.y = Math.round(f.lot.y + dy); }
      cursor += b.r - b.l + 240;
      rowTall = Math.max(rowTall, b.b - b.t);
    });
    tieSeen = { H: null, key: null, J: null };
    // (a roof over each room asked for in so many words: one piece is the plain way, 40-roofs.js)
    if (want.roofOne) { hand.house = Object.assign({}, hand.house || {}); delete hand.house.roof; }
    else { hand.house = Object.assign({}, hand.house || {}, { roof: "" }); }
    // (what an open plan before this one was held up by, not this one's: 40-arrange.js)
    if (!plan.open && hand.house.openSet) {
      ["support", "beams", "frame", "openSet"].forEach(function (k) { delete hand.house[k]; });
    }

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

    yield ["plan", 1];
    // furnished: against the walls, clear of every door -- the doors 3D
    // will put between rooms drawn apart too, stood in for meanwhile
    var stand = [];
    // the house as it will be put together, held still meanwhile: every piece
    // put in would have it worked out again, the stand-ins with it
    tieHeld = null;
    if (typeof tieLayout === "function") { tieHeld = tieLayout(); }
    // (let go when done, or stopped: the finally at the foot of this)
    try {
    // an open floor: the walls between its living rooms out now, before
    // anything is put against them, and what holds the house up put in
    // where they were -- the furniture then kept clear of it (40-arrange.js)
    if (plan.open && typeof arrangeOpen === "function") {
      arrangeOpen(made.map(function (r) { return { room: r, kind: r.starter }; }), tieHeld, want);
    }
    if (want.spread && typeof tieLayout === "function") {
      var L = tieLayout(), doors = [];
      // (not a door in a wall that came out: there is none -- an open plan's
      // way from one part of it to the next is the whole of the opening)
      var doorGone = typeof wallDoorGone === "function" && typeof tieWith === "function" ? tieWith(function (d) { return wallDoorGone(d); }, 1) : null;
      L.made.forEach(function (one) { if (!(plan.open && doorGone && doorGone(one.node))) { doors.push(one.node); } });
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
    // (the building's own plan kept: `plan` is the walking plan from here on,
    // and a shop's or an office's ceilings were never put on -- 2026-10-04)
    var typePlan = plan;
    var plan = walkPlan();
    var furnish = function (r) {
      var spec = r.starterCalm ? STARTER_CALM : STARTER_ROOMS[r.starter];
      // (an open plan's kitchen: its counters first, an island out from them, then the table)
      var island = !!typePlan.open && (r.starter === "kitchen" || r.starter === "great");
      var mids = function () { spec.mid.forEach(function (one) { starterShuffle(rnd, one.split("|")).some(function (kind) { return !!starterMid(r, kind); }); }); };
      // (an open plan's living room and family room: the television and the sofa facing it first)
      var lounge = !!typePlan.open && !r.starterCalm && (r.starter === "living" || r.starter === "family") && starterLounge(r);
      if (!island) { mids(); }
      spec.wall.forEach(function (one) {
        if (lounge && /i_sofa|i_sectional|i_tv/.test(one)) { return; }
        // the first of "this|or that" there is room for, the two in either order
        starterShuffle(rnd, one.split("|")).some(function (kind) {
          // nightstands by the bed; the television across the room from the
          // sofa; what is big, into the corner furthest from the door --
          // a bathtub against the middle of a wall left no room for a sink
          var near = kind === "i_nightstand" ? starterBedOf(r) : STARTER_CORNER[kind] ? starterCorner(r, rnd) : null;
          // the sink and the stove by the counter, the dryer by the washer
          if (STARTER_BY[kind]) {
            near = starterNear(r, 0).filter(function (n) { return n.kind === STARTER_BY[kind] && insideArea(r, n.x, n.y); })[0] || near;
          }
          if (kind === "i_tv") {
            var sofa = starterNear(r, 0).filter(function (n) { return (n.kind === "i_sofa" || n.kind === "i_sectional" || n.kind === "i_loveseat") && insideArea(r, n.x, n.y); })[0];
            // (2026-10-05: "weird furniture placements") straight across from it, the way it faces -- not
            // through the middle of the room to the far corner: a sofa at one end of its wall had the
            // television at the other end of the wall across, the seats drawn up to nothing
            if (sofa) { var sa = (sofa.turn || 0) * Math.PI / 180, far = r.w + r.h; near = { x: sofa.x - Math.sin(sa) * far, y: sofa.y + Math.cos(sa) * far }; }
          }
          var put = starterAlong(r, kind, near);
          if (put) { put(); }
          return !!put;
        });
      });
      if (island) { starterIsland(r); mids(); }
    };
    // (2026-10-05: "toggle furniture on or off in the generation" -- off, the rooms left empty)
    var furnished = want.furniture !== false;
    for (var mi = 0; mi < made.length; mi++) { if (furnished) { furnish(made[mi]); } yield ["furnish", (mi + 1) / made.length]; }
    // and now and then a little more: a bookcase, a plant, a chest at the
    // foot of the bed -- each taken back if it boxed anything in
    var extras = [];
    var extra = function (r) {
      (STARTER_EXTRA[r.starter] || []).forEach(function (one) {
        if (rnd() < 0.45) { return; }
        starterShuffle(rnd, one.split("|")).some(function (kind) {
          var put = ICONS[kind] && starterAlong(r, kind, null);
          if (put) { put(); var n = nodeById(picked); if (n) { extras.push(n); } }
          return !!put;
        });
      });
    };
    for (var mx = 0; mx < made.length; mx++) { if (furnished) { extra(made[mx]); } yield ["extras", (mx + 1) / made.length]; }
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
    if (furnished && typeof typeFurnish === "function") { typeFurnish(made, rnd, want, typePlan); }
    // daylight: a window in an outside wall of every room that is lived in,
    // and the garage's door
    var lot = ground.lot || null;
    // (the walking plan once for the lot: a window in one room's outside
    // wall changes nothing in another's -- it was made again for each)
    starterPlanNow = walkPlan();
    var daylight = function (r) {
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
    };
    for (var mw = 0; mw < made.length; mw++) { daylight(made[mw]); yield ["windows", (mw + 1) / made.length]; }
    starterPlanNow = null;
    starterDecor(made, rnd);
    yield ["decor", 0.5];
    // whoever sits in a room with a television, facing it
    var facing = function (r) {
      var near = starterNear(r, 0);
      var tv = near.filter(function (n) { return (n.kind === "i_tv" || n.kind === "i_walltv") && insideArea(r, n.x, n.y); })[0];
      if (!tv) { return; }
      near.forEach(function (seat) {
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
    };
    for (var mf = 0; mf < made.length; mf++) { facing(made[mf]); yield ["decor", 0.5 + 0.5 * (mf + 1) / made.length]; }
    } finally {
      // (stopped part way, or done: the stand-ins out, the house let go)
      var standing = new Set(stand);
      hand.nodes = hand.nodes.filter(function (n) { return !standing.has(n); });
      tieHeld = null;
      starterPlanNow = null;
      starterIdx = null;
    }
    starterLast = made.map(function (r) { return { room: r, kind: r.starter }; });
    made.forEach(function (r) {
      delete r.starter; delete r.home; delete r.local;
      delete r.starterId; delete r.starterVia; delete r.starterEntry; delete r.starterGo; delete r.starterBay; delete r.starterNook; delete r.starterCalm;
    });
    picked = null; chosen = null; many = [];
    starterShown(say("st_made", { rooms: made.length }));
  }

  // ---- the steps, run ------------------------------------------------------------------------
  // Other parts add to what is done, each round what is inside it (39-types,
  // 39-xray, 40-arrange, 40-hood, 40-edit): starterWrap(function* (inner, want)
  // { ... yield* inner(want) ... }), the last added the outermost.
  var STARTER_WRAPS = [];
  function starterWrap(fn) { STARTER_WRAPS.push(fn); }
  function starterLevel(i, want) {
    if (i < 0) { return starterWork(want); }
    return STARTER_WRAPS[i](function (w) { return starterLevel(i - 1, w); }, want);
  }
  function starterSteps(want) { return starterLevel(STARTER_WRAPS.length - 1, want); }
  // Any steps, all at once.
  function stepsDrive(gen) { var r; do { r = gen.next(); } while (!r.done); return r.value; }
  // While a house is being made, the paper is drawn once, at the end, not
  // after each part has done its bit (40-work.js holds the drawing back).
  var starterQuiet = 0, starterOwed = {};
  function starterDrive(gen) {
    starterQuiet++;
    var r;
    try { do { r = gen.next(); } while (!r.done); }
    finally { starterQuiet--; if (!starterQuiet) { starterSettle(); } }
    return r.value;
  }
  function starterMake(want) { return starterDrive(starterSteps(want)); }
  // Made: drawn, fitted, said -- now, or when the last step is done.
  function starterShown(words) {
    starterOwed.fit = true;
    starterOwed.said = words;
    if (!starterQuiet) { starterSettle(); }
  }
  function starterSettle() {
    var owed = starterOwed;
    starterOwed = {};
    drawHand(); drawHandPanel(); showReport();
    if (owed.keep && typeof handKeep === "function") { handKeep(); }
    if (owed.fit && el("#fit")) { el("#fit").click(); }
    if (owed.said) { handSays(owed.said); }
  }
  // Something that stands out in the room -- a table, a rug, the car --
  // as near the middle as it can be and still clear of every door's swing
  // and of what stands there already (a rug is walked over, and may be under).
  function starterMid(r, kind) {
    // (sized to the room, and turned along it: a table for two or for
    // eight, a rug as big as the room has floor for -- furnFit, 40-sized.js)
    var fit = typeof furnFit === "function" ? furnFit(r, kind) : null;
    if (fit === false) { return null; }
    if (fit) { kind = fit.kind; }
    var probe = { kind: kind, text: "", x: r.x, y: r.y, w: 140, h: 46 };
    measure(probe);
    if (fit) { probe.w = fit.w; probe.h = fit.h; }
    var turn = fit && fit.turn ? fit.turn : 0;
    var flat = !!LIES_FLAT[kind], inner = 8 + roomWallOf(r), clear = fit && fit.clear || 0;
    var others = starterNear(r, 130).filter(function (o) {
      return o !== r && !isArea(o.kind) && !ON_THE_WALL[o.kind] && o.kind !== "i_window" &&
             (WALK_DOORS[o.kind] || (!flat && !LIES_FLAT[o.kind]));
    });
    var tw = turn % 180 ? probe.h : probe.w, th = turn % 180 ? probe.w : probe.h;
    for (var ring = 0; ring <= 8; ring++) {
      for (var k = 0; k < (ring ? 8 : 1); k++) {
        var a = k * Math.PI / 4, x = Math.round(r.x + Math.cos(a) * ring * 12), y = Math.round(r.y + Math.sin(a) * ring * 12);
        var spot = { kind: kind, x: x, y: y, w: probe.w, h: probe.h, turn: turn };
        if (fit) {
          // its own box inside the room, the way round it lies, and the walk round it
          var pad = inner + clear;
          if (!insideArea(r, x - tw / 2, y - th / 2, pad) || !insideArea(r, x + tw / 2, y + th / 2, pad) ||
              !insideArea(r, x - tw / 2, y + th / 2, pad) || !insideArea(r, x + tw / 2, y - th / 2, pad)) { continue; }
        } else if (!insideArea(r, x, y, Math.max(probe.w, probe.h) / 2 + inner)) { continue; }
        if (others.some(function (o) { return boxesTouch(spot, o, WALK_DOORS[o.kind] ? 6 + clear : 2 + clear); }) || starterFrontClash(spot, others)) { continue; }
        var node = adviceAdd(kind, x, y, turn);
        if (fit) { node.w = fit.w; node.h = fit.h; node.own = true; }
        return node;
      }
    }
    // (sized, and there was no room for it so: the next size down)
    if (fit && fit.less) { return starterMid(r, fit.less); }
    return null;
  }

  // A place against one of a room's walls, its back to the wall, clear of
  // everything there and of every door's swing (and of the stand-ins): the
  // nearest to `near` (or the middle of the room) -- alongWall
  // (38-advice.js), looked along in finer steps, which a crowded small room
  // needs: in tens there was no room for a washer between two doors.
  // A door's box is its swing, on one side of its wall; this is the same on the other side -- the
  // floor a body steps onto coming through it.  Nothing stands there either: a furnace stood
  // against the stockroom's side of the office door, and nobody could get into the office
  // (2026-10-04).  (Not a garage door's: its other side is the drive.)
  function starterDoorFlip(d) {
    if (!d || !WALK_DOORS[d.kind] || d.kind === "i_garagedoor") { return null; }
    var t = (d.turn || 0) * Math.PI / 180, sx = Math.sin(t), sy = -Math.cos(t);
    return { kind: d.kind, x: d.x - sx * d.h, y: d.y - sy * d.h, w: d.w, h: d.h, turn: ((d.turn || 0) + 180) % 360 };
  }
  function starterAlong(r, kind, near, extra) {     // (extra: more to keep clear of -- the doors as 3D joins them, 39-xray.js)
    // (a bed, a sofa, a desk the size the room suits -- furnFit, 40-sized.js;
    // false: the room has enough in it already)
    var fit = typeof furnFit === "function" ? furnFit(r, kind, true) : null;
    if (fit === false) { return null; }
    if (fit) { kind = fit.kind; }
    var icon = ICONS[kind], w = fit ? fit.w : icon.box[0], h = fit ? fit.h : icon.box[1], T = roomWallOf(r), b = tieBox(r), spots = [];
    // a bath lies along its wall, not out across the room
    var long = !!STARTER_LONG[kind] && h > w;
    if (long) { var was = w; w = h; h = was; }
    var hanging = !!ON_THE_WALL[kind];
    var others = starterNear(r, 130).filter(function (n) {
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
    if (extra && extra.length) { others = others.concat(extra); }
    if (!hanging) { others = others.concat(others.map(starterDoorFlip).filter(Boolean)); }
    // What hangs on a wall keeps off the whole width of a door or a window
    // in that wall, and its frame: a door's box is mostly its swing, on one
    // side, and a breaker panel hung on the other side of the wall, beside
    // it, was across the doorway in 3D (2026-10-03).
    var FRAME = 0.12 * FLOOR_PX;
    var openings = hanging ? others.filter(function (o) { return WALK_DOORS[o.kind] || o.kind === "i_window"; }).map(function (o) {
      var q = turned(o);
      return { x0: o.x - q.w / 2 - FRAME, x1: o.x + q.w / 2 + FRAME, y0: o.y - q.h / 2 - FRAME, y1: o.y + q.h / 2 + FRAME, x: o.x, y: o.y };
    }) : [];
    // (where the room goes on into the rest of itself, 40-oddrooms.js: no wall there)
    var seams = typeof oddSeams === "function" ? oddSeams(r) : [];
    function overSeam(e, at) {
      return seams.some(function (sm) {
        if (sm.edge !== e.name) { return false; }
        var mid = e.across ? r.x : r.y;
        return at + w / 2 > mid + sm.a - 3 && at - w / 2 < mid + sm.b + 3;
      });
    }
    // (2026-10-04) where a wall was taken out (39-inside.js): nothing against
    // it, nothing hung on it -- it is not there; an open plan's sofa backed
    // onto a wall that then came out, and stood in the middle of the room
    var gone = starterGone(r);
    function overGone(e, at) {
      var runs = gone[e.name], along = at - e.from;
      return !!runs && runs.some(function (g) { return along + w / 2 > g.a - 2 && along - w / 2 < g.b + 2; });
    }
    function overOpening(e, at) {
      return openings.some(function (o) {
        if (Math.abs((e.across ? o.y : o.x) - e.line) > T + 30) { return false; }     // not in this wall
        return e.across ? at + w / 2 > o.x0 && at - w / 2 < o.x1 : at + w / 2 > o.y0 && at - w / 2 < o.y1;
      });
    }
    // Every place along each wall, nearest first, and the first of them
    // that is clear is the one.  (2026-10-05) Each was tried -- every 4 px
    // of every wall against everything near -- and only the nearest kept:
    // most of a block of flats' making, the page frozen seconds at a time.
    // The same place comes out (a steady sort, the same order), found sooner.
    var aim = near || { x: r.x, y: r.y };
    [{ name: "top", across: true, line: b.t, from: b.l, to: b.r, into: 1, turn: 0 },
     { name: "foot", across: true, line: b.b, from: b.l, to: b.r, into: -1, turn: 180 },
     { name: "left", across: false, line: b.l, from: b.t, to: b.b, into: 1, turn: 270 },
     { name: "right", across: false, line: b.r, from: b.t, to: b.b, into: -1, turn: 90 }].forEach(function (e) {
      // (as deep as the room is across from that wall, or not against it:
      // a chaise three metres long went through the far side of a nook)
      if ((e.across ? b.b - b.t : b.r - b.l) < h + 2 * T + 2) { return; }
      for (var at = e.from + T + w / 2 + 3; at <= e.to - T - w / 2 - 3; at += 4) {
        var off = e.line + e.into * (T + h / 2 + 1);
        var spot = { kind: kind, x: e.across ? at : off, y: e.across ? off : at, w: w, h: h, turn: e.turn,
                     put: long ? (e.turn + 90) % 360 : e.turn };
        spots.push({ e: e, at: at, spot: spot, d: Math.hypot(spot.x - aim.x, spot.y - aim.y) });
      }
    });
    spots.sort(function (p, q) { return p.d - q.d; });
    var boxes = others.map(function (o) { var q = turned(o); return { x: o.x, y: o.y, w: q.w, h: q.h }; }), s0 = null;
    for (var si = 0; si < spots.length && !s0; si++) {
      var c = spots[si], spot = c.spot;
      if (overOpening(c.e, c.at) || overSeam(c.e, c.at) || overGone(c.e, c.at) || (fit && fit.ok && !fit.ok(spot))) { continue; }
      var sq = turned(spot), hit = false;
      for (var bi = 0; bi < boxes.length && !hit; bi++) {     // (boxesTouch, gap 3, each box worked out once)
        var B = boxes[bi];
        hit = Math.abs(spot.x - B.x) * 2 < sq.w + B.w + 6 && Math.abs(spot.y - B.y) * 2 < sq.h + B.h + 6;
      }
      if (hit || starterFrontClash({ kind: kind, x: spot.x, y: spot.y, w: fit ? fit.w : ICONS[kind].box[0], h: fit ? fit.h : ICONS[kind].box[1], turn: spot.put }, others)) { continue; }
      s0 = spot;
    }
    if (!s0) { return fit && fit.less ? starterAlong(r, fit.less, near, extra) : null; }
    return function () {
      var node = adviceAdd(kind, Math.round(s0.x), Math.round(s0.y), s0.put);
      if (fit) { node.w = fit.w; node.h = fit.h; node.own = true; }
    };
  }

  // (2026-10-04) An open plan's kitchen: an island out from its counters,
  // the long way along them, with a metre and more of floor all round it to
  // cook and to pass; stools along its side away from them.
  var STARTER_COOK = { i_counter: 1, i_kitchensink: 1, i_stove: 1, i_dishwasher: 1, i_fridge: 1 };
  function starterIsland(r) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r), aisle = 1.05 * P;
    if (!ICONS.i_island || Math.min(r.w, r.h) < 4.2 * P) { return null; }
    var near = starterNear(r, 0), cook = near.filter(function (n) { return STARTER_COOK[n.kind] && insideArea(r, n.x, n.y); });
    if (!cook.length) { return null; }
    var cx = 0, cy = 0;
    cook.forEach(function (n) { cx += n.x / cook.length; cy += n.y / cook.length; });
    // along the wall the counters are mostly on
    var byWall = cook.filter(function (n) { return Math.min(n.y - b.t, b.b - n.y) < Math.min(n.x - b.l, b.r - n.x); }).length;
    var turn = byWall * 2 >= cook.length ? 0 : 90, iw = Math.min(2.4 * P, (turn ? r.h : r.w) - 2 * aisle - 2 * T), ih = 1.0 * P;
    if (iw < 1.6 * P) { return null; }
    var others = near.filter(function (o) {
      return o !== r && !isArea(o.kind) && !ON_THE_WALL[o.kind] && !FROM_CEILING[o.kind] && o.kind !== "i_window" && o.kind !== "i_rug" && o.kind !== "i_vent";
    });
    var best = null;
    for (var x = b.l; x <= b.r; x += 0.1 * P) {
      for (var y = b.t; y <= b.b; y += 0.1 * P) {
        var spot = { kind: "i_island", x: Math.round(x), y: Math.round(y), w: iw, h: ih, turn: turn }, q = turned(spot);
        if (x - q.w / 2 < b.l + T + 0.4 * P || x + q.w / 2 > b.r - T - 0.4 * P || y - q.h / 2 < b.t + T + 0.4 * P || y + q.h / 2 > b.b - T - 0.4 * P) { continue; }
        if (others.some(function (o) { return boxesTouch(spot, o, WALK_DOORS[o.kind] ? 0.6 * P : aisle); })) { continue; }
        var far = Math.hypot(x - cx, y - cy);
        if (!best || far < best.far) { best = { x: spot.x, y: spot.y, far: far }; }
      }
    }
    if (!best) { return null; }
    var isle = adviceAdd("i_island", best.x, best.y, turn);
    isle.w = Math.round(iw); isle.h = Math.round(ih); isle.own = true;
    // the stools: on the side away from the counters, one to every 60 cm
    var side = turn ? (best.x < cx ? -1 : 1) : (best.y < cy ? -1 : 1), count = Math.max(1, Math.floor(iw / (0.6 * P)));
    for (var k = 0; k < count; k++) {
      var off = (k - (count - 1) / 2) * 0.6 * P, out = side * (ih / 2 + 0.3 * P);
      var sx = turn ? best.x + out : best.x + off, sy = turn ? best.y + off : best.y + out;
      var stool = { kind: "i_stool", x: Math.round(sx), y: Math.round(sy), w: ICONS.i_stool ? ICONS.i_stool.box[0] : 20, h: ICONS.i_stool ? ICONS.i_stool.box[1] : 20 };
      if (!ICONS.i_stool || !insideArea(r, sx, sy, 8) || others.some(function (o) { return boxesTouch(stool, o, 2); })) { continue; }
      // (facing the island: a turn of nought faces down the page)
      adviceAdd("i_stool", stool.x, stool.y, turn ? (side > 0 ? 90 : 270) : (side > 0 ? 180 : 0));
    }
    return isle;
  }

  // A room's walls taken out (39-inside.js), side by side: the stretches of
  // each from its start, in the house as it will stand.
  function starterGone(r) {
    var gone = {};
    if (typeof wallOpenRuns === "function" && typeof wallAnyOpen === "function" && wallAnyOpen() && !((r.turn || 0) % 90)) {
      var Jo = tieHeld || (typeof tieLayout === "function" ? tieLayout() : null);
      var boxOpen = function (n) { return (Jo && Jo.boxes && Jo.boxes[n.id]) || tieBox(n); };
      ["top", "foot", "left", "right"].forEach(function (name) { gone[name] = wallOpenRuns(r, name, boxOpen); });
    }
    return gone;
  }
  // (2026-10-04) An open plan's living room or family room: the television
  // against a wall still standing -- across from the side most open, where
  // it can -- and the sofa out in the room facing it, its back to the
  // living space beyond (backed onto a wall that came out, it faced away
  // from the television, across the room).  True if both went in.
  var STARTER_FACE = { top: 180, foot: 0, left: 90, right: 270 };
  // (the family room through the middle of an open house of three rows, a
  // door off it on either side: chairs to sit and read in, a bookcase -- the
  // television and the sofa in the living room off it)
  var STARTER_CALM = { wall: ["i_bookcase", "i_armchair", "i_armchair", "i_lamp", "i_plant"], mid: ["i_rug", "i_coffee"] };   // (a seat's turn to face a wall: nought faces down the page)
  function starterLounge(r) {
    var gone = starterGone(r), b = tieBox(r), P = FLOOR_PX, most = null, mostLen = 0;
    var len = { top: b.r - b.l, foot: b.r - b.l, left: b.b - b.t, right: b.b - b.t };
    ["top", "foot", "left", "right"].forEach(function (e) {
      var o = (gone[e] || []).reduce(function (s, g) { return s + g.b - g.a; }, 0);
      if (o > mostLen) { mostLen = o; most = e; }
    });
    if (!most || !ICONS.i_tv) { return false; }
    // (the wall across first; then the other walls standing, the most of each first)
    var standing = function (e) { return len[e] - (gone[e] || []).reduce(function (s, g) { return s + g.b - g.a; }, 0); };
    var first = { top: "foot", foot: "top", left: "right", right: "left" }[most];
    var walls = [first].concat(["top", "foot", "left", "right"].filter(function (e) { return e !== most && e !== first; })
      .sort(function (p, q) { return standing(q) - standing(p); })).filter(function (e) { return standing(e) >= 2.0 * P; });
    return walls.some(function (wall) { return starterLoungeOn(r, wall, b, P); });
  }
  function starterLoungeOn(r, wall, b, P) {
    var mid = { top: { x: r.x, y: b.t }, foot: { x: r.x, y: b.b }, left: { x: b.l, y: r.y }, right: { x: b.r, y: r.y } }[wall];
    var was = hand.nodes.length, put = starterAlong(r, "i_tv", mid);
    if (!put) { return false; }
    put();
    var tv = hand.nodes.length > was ? hand.nodes[hand.nodes.length - 1] : null;
    if (!tv || tv.kind !== "i_tv") { return false; }
    // its wall, as it went in: the nearest of the four
    var off = { top: Math.abs(tv.y - b.t), foot: Math.abs(b.b - tv.y), left: Math.abs(tv.x - b.l), right: Math.abs(b.r - tv.x) };
    wall = Object.keys(off).sort(function (p, q) { return off[p] - off[q]; })[0];
    // (the sofa the room suits -- or, where that will not go, the next down)
    var fits = [], ask = r.starter === "family" ? "i_sectional" : "i_sofa";
    for (var guard = 0; ask && guard < 3; guard++) {
      var f1 = typeof furnFit === "function" ? furnFit(r, ask, false) : null;
      fits.push(f1 && f1.kind ? f1 : { kind: String(ask).split("@")[0], w: 0, h: 0 });
      ask = f1 && f1.less;
    }
    var turn = STARTER_FACE[wall], T = roomWallOf(r);
    var others = starterNear(r, 130).filter(function (o) {
      return o !== r && !isArea(o.kind) && !ON_THE_WALL[o.kind] && !FROM_CEILING[o.kind] && o.kind !== "i_window" && o.kind !== "i_rug";
    });
    var across = wall === "top" || wall === "foot", into = wall === "top" || wall === "left" ? 1 : -1, line = { top: b.t, foot: b.b, left: b.l, right: b.r }[wall];
    var room = (across ? b.b - b.t : b.r - b.l) - 2 * T;
    for (var fi = 0; fi < fits.length; fi++) {
    var fit = fits[fi], kind = ICONS[fit.kind] ? fit.kind : "i_sofa", w = fit.w || ICONS[kind].box[0], h = fit.h || ICONS[kind].box[1];
    for (var d = 3.2; d >= 1.6; d -= 0.15) {
      var depth = h / 2 + d * P;
      if (depth + h / 2 + 0.5 * P > room) { continue; }                   // (and a way behind it)
      // (across from the television, or a little to one side of it)
      for (var k = 0; k < 7; k++) {
        var slide = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.3 * P;
        var at = line + into * (T + depth), x = across ? tv.x + slide : at, y = across ? at : tv.y + slide;
        var spot = { kind: kind, x: Math.round(x), y: Math.round(y), w: w, h: h, turn: turn }, q = turned(spot);
        if (!insideArea(r, spot.x - q.w / 2, spot.y - q.h / 2, T + 2) || !insideArea(r, spot.x + q.w / 2, spot.y + q.h / 2, T + 2)) { continue; }
        if (others.some(function (o) { return o !== tv && boxesTouch(spot, o, 3); })) { continue; }
        var sofa = adviceAdd(kind, spot.x, spot.y, turn);
        if (fit.w) { sofa.w = w; sofa.h = h; sofa.own = true; }
        return true;
      }
    }
    }
    // (no room for it so: the television out again, and the room furnished as any other)
    hand.nodes = hand.nodes.filter(function (n) { return n !== tv; });
    return false;
  }

  // ---- what is near a room, quickly -------------------------------------------------------------
  // (2026-10-03) Each piece put in was looked at against every other in the
  // whole house, at every spot along every wall: a house twice the size took
  // four times as long.  The paper in squares of four metres, and in each
  // what stands over it, added to as pieces go in and made again when the
  // list itself is changed; only what stands near is looked at.  (Anything
  // that can touch a spot in a room is within `pad` of it.)
  var starterIdx = null;
  function starterNear(r, pad) {
    var list = hand.nodes, S = 200, I = starterIdx;
    if (!I || I.list !== list || I.count > list.length || (list.length && I.first !== list[0])) {
      I = starterIdx = { list: list, count: 0, first: list[0], cells: new Map(), big: [] };
    }
    for (; I.count < list.length; I.count++) {
      var n = list[I.count], q = turned(n);
      var c0 = Math.floor((n.x - q.w / 2) / S), c1 = Math.floor((n.x + q.w / 2) / S);
      var r0 = Math.floor((n.y - q.h / 2) / S), r1 = Math.floor((n.y + q.h / 2) / S);
      if (c1 - c0 > 40 || r1 - r0 > 40) { I.big.push(n); continue; }     // a lot, a floor: looked at always
      for (var cy = r0; cy <= r1; cy++) {
        for (var cx = c0; cx <= c1; cx++) {
          var key = cx + "," + cy, cell = I.cells.get(key);
          if (!cell) { cell = []; I.cells.set(key, cell); }
          cell.push(n);
        }
      }
    }
    var b = tieBox(r), out = new Set(I.big);
    for (var y = Math.floor((b.t - pad) / S); y <= Math.floor((b.b + pad) / S); y++) {
      for (var x = Math.floor((b.l - pad) / S); x <= Math.floor((b.r + pad) / S); x++) {
        var got = I.cells.get(x + "," + y);
        if (got) { for (var k = 0; k < got.length; k++) { out.add(got[k]); } }
      }
    }
    return Array.from(out);
  }

  var STARTER_CORNER = { i_bathtub: true, i_shower: true, i_wardrobe: true, i_fridge: true, i_workbench: true,
                         i_closetrod: true, i_bookcase: true, i_washer: true, i_bed: true, i_bedking: true, i_bed1: true,
                         i_counter: true };
  var STARTER_BY = { i_kitchensink: "i_counter", i_stove: "i_counter", i_dishwasher: "i_kitchensink", i_dryer: "i_washer",
                     i_toilet: "i_bathtub", i_desk: "i_window" };
  var STARTER_LONG = { i_bathtub: true };
  // A window or a door in an outside wall of a room, as intoOutsideWall
  // (38-advice.js) puts one -- in the wall `prefer` names where there is
  // room for it there: a garage's door on the front, to the street.
  var starterPlanNow = null;            // the walking plan, while windows go in (starterWork)
  function starterIntoWall(r, kind, prefer) {
    var plan = starterPlanNow || walkPlan(), size = ICONS[kind].box[0], best = null;
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
                          office: "i_pendant", kitchen: "i_pendant", dining: "i_chandelier", great: "i_chandelier", hall: "i_pendant",
                          // (a room in the middle of a folded house has no window: a light of its own)
                          laundry: "i_pendant", utility: "i_pendant" };
  var STARTER_WALLS = { living: [["i_picture", "i_sofa"], ["i_picture", null]], family: [["i_picture", "i_sectional|i_sofa"]],
                        main: [["i_picture", "i_bedking|i_bed"]], bed: [["i_picture", "i_bed|i_bed1"]], dining: [["i_picture", null]],
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
      if (hang && ICONS[hang] && Math.min(r.w, r.h) >= ((r.use || kind === "laundry" || kind === "utility" || kind === "pantry" || kind === "mudroom" || kind === "foyer" || kind === "storage" || (typeof ODD_SMALL === "object" && ODD_SMALL[kind])) && hang === "i_pendant" ? 1.4 : 2.6) * P) {
        var over = (hang === "i_chandelier" && inRoom("i_dining|i_roundtable")) || null;
        if (!(hang === "i_pendant" && inRoom("i_island"))) { adviceAdd(hang, Math.round(over ? over.x : r.x), Math.round(over ? over.y : r.y)); }
      }
      // (an island: two lights hung over it, along it -- 2026-10-04)
      var isle = inRoom("i_island");
      if (isle && ICONS.i_pendant) {
        var tI = turned(isle), lengthwise = tI.w >= tI.h;
        [-0.25, 0.25].forEach(function (k) {
          adviceAdd("i_pendant", Math.round(isle.x + (lengthwise ? tI.w * k : 0)), Math.round(isle.y + (lengthwise ? 0 : tI.h * k)));
        });
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
      return (n.kind === "i_bed" || n.kind === "i_bedking" || n.kind === "i_bed1") && insideArea(room, n.x, n.y);
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
    var D = starterPick(rnd, [STARTER_BAND, STARTER_BAND + 0.2, STARTER_BAND + 0.4]) * starterDeep(want), flip = rnd() < 0.5;
    var out = [];
    plan.floors.forEach(function (fp) {
      var rooms = [], Db = fp.Db || D + (fp.dB || 0), Df = fp.Df || D + (fp.dF || 0), Hh = fp.H === undefined ? H : fp.H;
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
      var mids = Hh > 0 || fp.open ? fp.mid || [] : [], Dm = fp.Dm || D, Ys = Db + Hh + mids.length * (Dm + Hh);
      mids.forEach(function (row) { wide = Math.max(wide, row.reduce(function (s, r) { return s + r.w; }, 0)); });
      if (Hh > 0) { put("hall", TXT.st_hall, 0, Db, wide, Db + Hh); }
      mids.forEach(function (row, j) {
        var y0 = Db + Hh + j * (Dm + Hh);
        at = 0;
        row.forEach(function (r) {
          if (r.kind === "suite" && r.parts.length > 1) {
            var cut = y0 + Math.min(2.0, Dm / 2);
            put(r.parts[1].kind, r.parts[1].label, at, y0, at + r.w, cut);
            put(r.parts[0].kind, r.parts[0].label, at, cut, at + r.w, y0 + Dm);
          } else { put(r.kind === "suite" ? r.parts[0].kind : r.kind, r.cross ? "" : r.label, at, y0, at + r.w, y0 + Dm); }
          at += r.w;
        });
        if (Hh > 0) { put("hall", "", 0, y0 + Dm, wide, y0 + Dm + Hh); }
      });
      at = 0;
      fp.front.forEach(function (r) {
        if (r.kind === "suite") {
          var y0 = Ys, near = r.parts.length > 1 ? 2.0 : 0;
          r.parts.forEach(function (p, k) { put(p.kind, p.label, at, k ? y0 : y0 + near, at + r.w, k ? y0 + near : y0 + Df); });
        } else { put(r.kind, r.label, at, Ys, at + r.w, Ys + Df); }
        at += r.w;
      });
      if (fp.level === 0 && want.garage && !plan.noGarage && (Hh > 0 || fp.open)) { put("garage", "", W, Ys - Hh, W + starterGarageW(want), Ys - Hh + 6.2); }
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
                      '<button type="button" class="st-step-btn" data-d="-1"></button>' +
                      '<input class="st-step-num" type="text" inputmode="numeric" autocomplete="off" spellcheck="false">' +
                      '<button type="button" class="st-step-btn" data-d="1"></button></div>';
      row.querySelector(".st-step-name").textContent = label;
      var out = row.querySelector(".st-step-num"), less = row.querySelector('[data-d="-1"]'), more = row.querySelector('[data-d="1"]');
      out.setAttribute("aria-label", label);
      out.title = say("st_typed", { from: from, to: to });
      less.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8"/></svg>';
      more.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8M8 4v8"/></svg>';
      less.setAttribute("aria-label", TXT.st_fewer + ": " + label);
      more.setAttribute("aria-label", TXT.st_more + ": " + label);
      function show() {
        if (document.activeElement !== out || out.value !== String(want[key])) { out.value = String(want[key]); }
        less.disabled = want[key] <= from; more.disabled = want[key] >= to;
        out.style.width = Math.max(2, String(want[key]).length) + 1.2 + "ch";
      }
      // a number typed: kept to what it may be, the house drawn again
      function typed() {
        var v = parseInt(String(out.value).replace(/[^0-9]/g, ""), 10);
        if (isNaN(v)) { show(); return; }
        v = Math.max(from, Math.min(to, v));
        if (v !== want[key]) { want[key] = v; counted(); redraw(); }
        show();
      }
      out.addEventListener("change", typed);
      out.addEventListener("blur", typed);
      out.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") { ev.preventDefault(); typed(); out.select(); }
        else if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
          ev.preventDefault();
          var d = ev.key === "ArrowUp" ? 1 : -1, v = Math.max(from, Math.min(to, (want[key] || 0) + d * (ev.shiftKey ? 10 : 1)));
          if (v !== want[key]) { want[key] = v; counted(); show(); redraw(); }
        }
      });
      out.addEventListener("focus", function () { setTimeout(function () { out.select(); }, 0); });
      function counted() { if (key === "offices") { want.office = want.offices > 0; } if (key === "laundries") { want.laundry = want.laundries > 0; } }
      less.onclick = function () { if (want[key] > from) { want[key]--; counted(); show(); redraw(); } };
      more.onclick = function () { if (want[key] < to) { want[key]++; counted(); show(); redraw(); } };
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
        // what goes round it, for what it is (40-grounds.js)
        if (typeof groundsAsk === "function") { groundsAsk({ head: head, tiles: tiles, tile: tile }, want); }
      } else if (!T || !T.plan) {
        head(TXT.st_rooms_head);
        // (how many of each, within what houses have: 2026-10-02)
        if (want.kitchens === undefined) { want.kitchens = 1; }
        if (want.livings === undefined) { want.livings = 1; }
        if (want.offices === undefined) { want.offices = want.office ? 1 : 0; }
        if (want.laundries === undefined) { want.laundries = want.laundry ? 1 : 0; }
        // (2026-10-03: "let you increase the numbers to basically limitless")
        stepper("beds", TXT.st_beds, "bed", 1, STARTER_MOST.beds);
        stepper("baths", TXT.st_baths, "bath", 1, STARTER_MOST.baths);
        stepper("kitchens", TXT.st_kitchens, "kitchen", 1, STARTER_MOST.kitchens);
        stepper("livings", TXT.st_livings, "living", 1, STARTER_MOST.livings);
        stepper("offices", TXT.st_offices, "office", 0, STARTER_MOST.offices);
        stepper("laundries", TXT.st_laundries, "laundry", 0, STARTER_MOST.laundries);
        head(TXT.ty_size);
        tiles();
        [[1, TXT.ty_small, "size1"], [2, TXT.ty_medium, "size2"], [3, TXT.ty_large, "size3"]].forEach(function (t) {
          tile(t[1], t[2], function () { return (want.homeSize || 2) === t[0]; }, function () { want.homeSize = t[0]; }, true);
        });
        head(TXT.st_floors);
        tiles();
        tile(TXT.st_one_floor, "floor1", function () { return want.floors === 1; }, function () { want.floors = 1; }, true);
        tile(TXT.st_two_floors, "floor2", function () { return want.floors === 2; }, function () { want.floors = 2; }, true);
        tile(TXT.st_basement, "basement", function () { return !!want.basement; }, function () { want.basement = !want.basement; });
        // (2026-10-03: "different modes too for like open concept houses")
        // How open the living part is, one of four: its own rooms; the kitchen
        // and dining one room (open); the walls between them all taken out,
        // beams and posts carrying the house where they did (openPlan,
        // 40-arrange.js, 39-inside.js); or both -- one great room.
        head(TXT.st_layout_head);
        tiles();
        [["classic", false, false], ["semi", true, false], ["open", false, true], ["great", true, true]].forEach(function (m) {
          tile(TXT["lay_" + m[0]], "lay_" + m[0], function () { return !!want.open === m[1] && !!want.openPlan === m[2]; },
               function () { want.open = m[1]; want.openPlan = m[2]; }, true);
        });
        // (2026-10-04) an open plan's: what holds the house up where its
        // walls came out -- steel beams in the ceiling, or posts (40-arrange.js)
        head(TXT.sup_head);
        var supHead = pick.lastChild;
        tiles();
        var supGrid = grid;
        [["beams", TXT.sup_beams], ["posts", TXT.sup_posts]].forEach(function (s) {
          tile(s[1], "sup_" + s[0], function () { return (want.support || "beams") === s[0]; }, function () { want.support = s[0]; }, true);
          var b = grid.lastChild, was = b.refresh;
          b.refresh = function () { was(); supHead.style.display = supGrid.style.display = want.openPlan ? "" : "none"; };
          b.refresh();
        });
        // (2026-10-03) which way round: the bedrooms together, split, in a
        // wing -- or the main bedroom downstairs in a house of two floors;
        // Any, the seed's choice, another each Shuffle (starterZones)
        head(TXT.zn_head);
        tiles();
        // (all of them there, those a house of so many floors cannot have hidden
        // as the floors are chosen: a tile chosen is not the page drawn again)
        var fits = function (z) { return z === "any" || STARTER_ZONES[want.floors > 1 ? "two" : "one"].indexOf(z) >= 0; };
        ["any", "together", "split", "wing", "downstairs"].forEach(function (z) {
          tile(TXT["zn_" + z], "zn_" + z, function () { return fits(z) && ((want.zones || "any") === z || (z === "any" && !fits(want.zones || "any"))); },
               function () { want.zones = z; }, true);
          var b = grid.lastChild, was = b.refresh;
          b.refresh = function () { was(); b.style.display = fits(z) ? "" : "none"; };
          b.refresh();
        });
        head(TXT.st_extras_head);
        tiles();
        // (an office and a laundry room are counted above now)
        [["garage", TXT.st_garage, "car"], ["closet", TXT.st_closet, "closet"]].forEach(function (t) {
          tile(t[1], t[2], function () { return !!want[t[0]]; }, function () { want[t[0]] = !want[t[0]]; });
        });
        // (2026-10-03) more rooms: a pantry, a mudroom, a playroom ... (40-rooms.js)
        if (typeof roomsAsk === "function") { roomsAsk({ head: head, tiles: tiles, tile: tile }, want); }
        // (2026-10-03) up under the roof: an attic, and over the garage (40-attic.js)
        if (typeof atticAsk === "function") { atticAsk({ head: head, tiles: tiles, tile: tile }, want); }
        // (and its wiring, plumbing and heating: put in, or left to you, 40-systems.js)
        if (typeof sysAsk === "function") { sysAsk({ head: head, tiles: tiles, tile: tile }, want); }
        // (2026-10-02) the yard: what goes behind it, and a porch on the front (40-yard.js)
        if (typeof YARD_KINDS !== "undefined") {
          head(TXT.yd_head);
          tiles();
          want.yard = Object.assign({}, want.yard && typeof want.yard === "object" ? want.yard : {});
          YARD_KINDS.forEach(function (Y) {
            tile(TXT["yd_" + Y[0]], "yd_" + Y[0], function () { return !!want.yard[Y[0]]; }, function () { want.yard[Y[0]] = !want.yard[Y[0]]; });
          });
        }
      }
      // (2026-10-05) furnished, or the rooms left empty -- every kind of building
      head(TXT.uf_head);
      tiles();
      tile(TXT.uf_tile, "living", function () { return want.furniture !== false; }, function () { want.furniture = want.furniture === false; });
      head(TXT.st_house_head);
      tiles();
      tile(TXT.st_roof_one, "roof", function () { return !!want.roofOne; }, function () { want.roofOne = !want.roofOne; });
      tile(TXT.st_lot, "land", function () { return !!want.lot; }, function () { want.lot = !want.lot; });
      tile(TXT.st_spread, "spread", function () { return !!want.spread && !(T && T.together); }, function () { want.spread = !want.spread; });
      if (T && T.together) { var last = grid.lastChild; last.disabled = true; last.title = TXT.ty_together; }
      // (39-xray.js) outlets, switches and a breaker panel, put where the code puts them
      if (typeof wireHouse === "function") { tile(TXT.xr_wire_tile, "xr_power", function () { return !!want.wire; }, function () { want.wire = !want.wire; }); }
      if (typeof typeStyleRow === "function") { typeStyleRow(pick, want, function () { redraw(); }); }
      // where it stands, and what is out of doors -- the 3D view's, asked now (40-street.js)
      if (typeof siteAsk === "function") { siteAsk({ head: head, tiles: tiles, tile: tile }, want); }
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
      delete keep.site;                    // (where it stands: the view's own next time, 40-street.js)
      starterWant = keep;
      try { localStorage.setItem("flowchart-starter", JSON.stringify(keep)); } catch (e) { /* this visit only */ }
      shut();
      (typeof starterMakeLive === "function" ? starterMakeLive : starterMake)(want);
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
