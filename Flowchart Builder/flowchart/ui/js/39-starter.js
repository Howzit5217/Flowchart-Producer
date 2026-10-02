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
    living: { w: 5.2, h: 4.2, bw: 5.2, max: 7.6, wall: ["i_sofa", "i_tv", "i_armchair", "i_lamp", "i_plant"], mid: ["i_rug", "i_coffee"] },
    kitchen: { w: 3.8, h: 3.4, bw: 3.8, max: 5.2, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_dishwasher"], mid: [] },
    great: { w: 6.4, h: 4.0, bw: 6.4, max: 8.6, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_dishwasher"], mid: ["i_dining"] },
    dining: { w: 4.0, h: 3.6, bw: 4.0, max: 5.2, wall: ["i_sideboard|i_hutch|i_consoletable", "i_plant"], mid: ["i_dining|i_roundtable"] },
    main: { w: 4.4, h: 4.2, bw: 4.8, max: 5.8, wall: ["i_bedking", "i_nightstand", "i_nightstand", "i_wardrobe", "i_dresser"], mid: [] },
    bed: { w: 3.4, h: 3.4, bw: 3.4, max: 4.6, wall: ["i_bed", "i_nightstand", "i_wardrobe", "i_desk"], mid: [] },
    bath: { w: 3.0, h: 2.4, bw: 2.6, max: 3.2, wall: ["i_bathtub", "i_toilet", "i_vanity|i_sink", "i_sconce"], mid: [] },
    ensuite: { w: 2.4, h: 2.2, wall: ["i_shower", "i_toilet", "i_sink", "i_sconce"], mid: [] },
    office: { w: 3.0, h: 3.0, bw: 3.0, max: 4.0, wall: ["i_desk", "i_bookcase", "i_filing"], mid: ["i_officechair"] },
    laundry: { w: 3.0, h: 2.6, bw: 2.4, max: 3.2, wall: ["i_washer", "i_dryer", "i_utilitysink|i_hamper"], mid: [] },
    garage: { w: 6.0, h: 6.2, wall: ["i_workbench", "i_shelving"], mid: ["i_parked"] },
    closet: { w: 2.6, h: 2.0, wall: ["i_closetrod|i_closetshelves", "i_closetshelves|i_shoerack"], mid: [] },
    hall: { w: 6.0, h: 1.4, wall: ["i_sconce", "i_sconce"], mid: [] },
    stairs: { w: 1.4, h: 4.2, bw: 1.4, max: 1.4, wall: ["i_sconce"], mid: [] },
    family: { w: 5.0, h: 4.2, bw: 5.0, max: 14, wall: ["i_sectional|i_sofa", "i_tv", "i_bookcase", "i_lamp"], mid: ["i_rug", "i_coffee"] },
    storage: { w: 3.0, h: 4.2, bw: 3.0, max: 9, wall: ["i_shelving", "i_shelving", "i_sconce"], mid: [] },
    utility: { w: 3.0, h: 4.2, bw: 3.0, max: 3.4, wall: ["i_furnace", "i_shelving", "i_sconce"], mid: [] }
  };
  var STARTER_GAP = 100;                 // px between rooms spread out: room for the arrows
  var STARTER_HALL = 1.4;                // metres, the hall across
  var STARTER_BAND = 4.2;                // metres, a band of rooms deep
  var starterLast = [];                  // the rooms last made, and what each was to be
  var starterWant = { beds: 3, baths: 2, open: true, office: false, laundry: true, garage: true, closet: true, spread: true,
                      floors: 1, basement: false, roofOne: true, lot: true };

  // ---- the house, laid out -----------------------------------------------------------
  // Each floor: { level, back: [...], front: [...] }, each room in a band
  // { kind, label, w } in metres, the main bedroom's own rooms a column
  // { kind: "suite", parts, w } beside it; W the width of the house.
  function starterPlan(want) {
    function it(kind, label) { var s = STARTER_ROOMS[kind]; return { kind: kind, label: label || "", w: s.bw || s.w }; }
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
      // one floor: the bedrooms along the back, the rest along the front
      G.back = [main].concat(col ? [col] : [], beds, baths);
      G.front = [office, living, kitchen, dining, laundry].filter(Boolean);
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
      var U = { level: 1, back: [it("stairs", TXT.st_stairs), main].concat(col ? [col] : []), front: [] };
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
                    front: [it("stairs", TXT.st_stairs), it("utility", TXT.st_utility), it("storage", TXT.st_storage)] });
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
    floors.forEach(function (f) {
      var under = f.level === 0 && two;
      fill(f.back, under);
      fill(f.front, under || (f.level === 0 && want.garage));
    });
    return { floors: floors, W: W, two: two };
  }

  // ---- the house, made ---------------------------------------------------------------
  function starterMake(want) {
    var P = FLOOR_PX, G = want.spread ? STARTER_GAP : 0, made = [], links = [];
    keepUndo();
    var plan = starterPlan(want), W = plan.W, D = STARTER_BAND, H = STARTER_HALL;
    function X(m) { return Math.round(m * P); }
    var floors = [];
    function room(f, kind, label, x0, y0, x1, y1, sx, sy) {
      var n = { id: hand.next++, kind: "i_room", text: label || "", x: 0, y: 0, w: 140, h: 46 };
      measure(n);
      n.w = x1 - x0; n.h = y1 - y0; n.own = true;
      n.text = label || "";
      n.starter = kind;
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
      // the back band, the main bedroom's own rooms one over the other
      var at = 0;
      fp.back.forEach(function (r, i) {
        var x0 = X(at), x1 = X(at + r.w);
        at += r.w;
        if (r.kind === "suite") {
          var low = r.parts.length > 1 ? D - 2.0 : 0;
          r.parts.forEach(function (p, k) {
            var y0 = k ? X(low) : 0, y1 = k || r.parts.length === 1 ? X(D) : X(low);
            f.back.push(room(f, p.kind, p.label, x0, y0, x1, y1, i * G, -G - (r.parts.length > 1 && !k ? G / 2 : 0) + (k ? G / 2 : 0)));
          });
          return;
        }
        f.back.push(room(f, r.kind, r.label, x0, 0, x1, X(D), i * G, -G));
      });
      var wide = Math.max(fp.back.reduce(function (s, r) { return s + r.w; }, 0), fp.front.reduce(function (s, r) { return s + r.w; }, 0));
      f.hall = room(f, "hall", TXT.st_hall, 0, X(D), X(wide), X(D + H), (across - 1) * G / 2, 0);
      at = 0;
      fp.front.forEach(function (r, i) {
        f.front.push(room(f, r.kind, r.label, X(at), X(D + H), X(at + r.w), X(D + H + D), i * G, G));
        at += r.w;
      });
      if (fp.level === 0 && want.garage) {
        f.garage = room(f, "garage", "", X(W), X(D), X(W) + X(6.0), X(D) + X(6.2), fp.front.length * G, G);
      }
      // the stairs in their bays: up from the back, down from the front
      f.back.concat(f.front).forEach(function (r) {
        if (r.starter === "stairs") { f.ups.push({ s: flight(f, r, f.back.indexOf(r) >= 0 ? 1 : -1), back: f.back.indexOf(r) >= 0 }); }
      });
    });
    // which opens into which: everything off the hall, but the kitchen off
    // the living room beside it, the dining room off the kitchen, the main
    // bedroom's own rooms off it, and the garage through the laundry room
    floors.forEach(function (f) {
      var main = f.back.filter(function (m) { return m.starter === "main"; })[0];
      [f.back, f.front].forEach(function (band) {
        band.forEach(function (r, i) {
          var kind = r.starter, prev = i ? band[i - 1] : null;
          if ((kind === "ensuite" || kind === "closet") && main) { join(main, r); }
          else if ((kind === "kitchen" || kind === "great") && prev && prev.starter === "living") { join(prev, r); }
          else if (kind === "dining" && prev && (prev.starter === "kitchen" || prev.starter === "great")) { join(prev, r); }
          else { join(f.hall, r); }
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
    floors.forEach(function (f) {
      var over = byLevel[f.level + 1];
      if (!over) { return; }
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
    var ground = byLevel[0], living = made.filter(function (r) { return r.starter === "living"; })[0];
    var front = { id: hand.next++, kind: "i_door", text: firstWords("i_door"), x: 0, y: 0, w: 140, h: 46 };
    measure(front);
    front.x = Math.round(living.x); front.y = Math.round(living.y + living.h / 2 + STARTER_GAP * 0.9);
    ground.nodes.push(front);
    links.push({ from: living.id, to: front.id, label: "" });

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
        // hall goes, the left end of the hall being the house's on every floor
        var m = J0 && J0.moves[f.hall.id], hx = m ? m.x : f.hall.x, hy = m ? m.y : f.hall.y;
        var cx = hx - f.hall.w / 2 + X(W) / 2, cy = hy - f.hall.h / 2 - X(D) + X(D + H + D) / 2;
        var b = boxOf(f.nodes);
        // round the rooms both as drawn and as put together (the garage too)
        var half = Math.max(cx - b.l, b.r - cx, X(W) / 2 + (f.garage ? X(6.0) : 0)) + rim;
        var tall = Math.max(cy - b.t, b.b - cy, X(D + H + D) / 2 + (f.garage ? X(1.0) : 0)) + rim;
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
      made.concat([front]).forEach(function (n) {
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
      spec.mid.forEach(function (one) { one.split("|").some(function (kind) { return !!starterMid(r, kind); }); });
      spec.wall.forEach(function (one) {
        // the first of "this|or that" there is room for
        one.split("|").some(function (kind) {
          // nightstands by the bed; the television across the room from the
          // sofa; what is big, into the corner furthest from the door --
          // a bathtub against the middle of a wall left no room for a sink
          var near = kind === "i_nightstand" ? starterBedOf(r) : STARTER_CORNER[kind] ? starterCorner(r) : null;
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
    // daylight: a window in an outside wall of every room that is lived in,
    // and the garage's door
    var lot = ground.lot || null;
    made.forEach(function (r) {
      // (a hall and a stairway too, where no light would go on its walls;
      // a closet, a store room, a utility room and the garage go without)
      var lit = (r.starter === "hall" || r.starter === "stairs") &&
                hand.nodes.some(function (n) { return n.kind === "i_sconce" && insideArea(r, n.x, n.y, -14); });
      var dark = { closet: 1, garage: 1, storage: 1, utility: 1 };
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
    // whoever sits in a room with a television, facing it
    made.forEach(function (r) {
      var tv = hand.nodes.filter(function (n) { return (n.kind === "i_tv" || n.kind === "i_walltv") && insideArea(r, n.x, n.y); })[0];
      if (!tv) { return; }
      hand.nodes.forEach(function (seat) {
        if ((seat.kind !== "i_sofa" && seat.kind !== "i_armchair") || !insideArea(r, seat.x, seat.y)) { return; }
        var dx = tv.x - seat.x, dy = tv.y - seat.y, best = seat.turn || 0, most = -Infinity;
        [0, 90, 180, 270].forEach(function (q) {
          var a = q * Math.PI / 180, dot = -Math.sin(a) * dx + Math.cos(a) * dy;
          if (dot > most) { most = dot; best = q; }
        });
        if (best) { seat.turn = best; } else { delete seat.turn; }
      });
    });
    hand.nodes = hand.nodes.filter(function (n) { return stand.indexOf(n) < 0; });
    tieHeld = null;
    starterLast = made.map(function (r) { return { room: r, kind: r.starter }; });
    made.forEach(function (r) { delete r.starter; delete r.home; });
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
        if (others.some(function (o) { return boxesTouch(spot, o, WALK_DOORS[o.kind] ? 6 : 2); })) { continue; }
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
      return n !== r && n.kind !== "i_rug" && n.kind !== "i_window" && !isArea(n.kind) &&
             (hanging ? ON_THE_WALL[n.kind] || WALK_DOORS[n.kind] : !ON_THE_WALL[n.kind]);
    });
    [{ name: "top", across: true, line: b.t, from: b.l, to: b.r, into: 1, turn: 0 },
     { name: "foot", across: true, line: b.b, from: b.l, to: b.r, into: -1, turn: 180 },
     { name: "left", across: false, line: b.l, from: b.t, to: b.b, into: 1, turn: 270 },
     { name: "right", across: false, line: b.r, from: b.t, to: b.b, into: -1, turn: 90 }].forEach(function (e) {
      for (var at = e.from + T + w / 2 + 3; at <= e.to - T - w / 2 - 3; at += 4) {
        var off = e.line + e.into * (T + h / 2 + 1);
        var spot = { kind: kind, x: e.across ? at : off, y: e.across ? off : at, w: w, h: h, turn: e.turn,
                     put: long ? (e.turn + 90) % 360 : e.turn };
        if (!others.some(function (o) { return boxesTouch(spot, o, 3); })) { spots.push(spot); }
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

  // The corner of a room furthest from its doors.
  function starterCorner(r) {
    var b = tieBox(r), doors = hand.nodes.filter(function (d) { return WALK_DOORS[d.kind] && insideArea(r, d.x, d.y, -40); });
    var best = null, far = -1;
    [[b.l, b.t], [b.r, b.t], [b.l, b.b], [b.r, b.b]].forEach(function (c) {
      var near = doors.reduce(function (m, d) { return Math.min(m, Math.hypot(d.x - c[0], d.y - c[1])); }, Infinity);
      if (near > far) { far = near; best = { x: c[0], y: c[1] }; }
    });
    return best;
  }

  // The bed in a room, for the nightstands to go beside.
  function starterBedOf(room) {
    return hand.nodes.filter(function (n) {
      return (n.kind === "i_bed" || n.kind === "i_bedking") && insideArea(room, n.x, n.y);
    })[0] || null;
  }

  // ---- asked -----------------------------------------------------------------------------
  function starterAsk() {
    if (el(".st-sheet")) { return; }
    var want = Object.assign({}, starterWant);
    var sheet = document.createElement("div");
    sheet.className = "make-sheet st-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "st-title");
    var card = document.createElement("div");
    card.className = "make-card st-card";
    card.innerHTML = '<h2 id="st-title"></h2><p class="make-sub"></p><div class="st-rows"></div>' +
                     '<div class="st-go"><button type="button" class="btn small st-no"></button>' +
                     '<button type="button" class="btn small primary st-yes"></button></div>';
    card.querySelector("h2").textContent = TXT.st_title;
    card.querySelector(".make-sub").textContent = TXT.st_sub;
    var rows = card.querySelector(".st-rows");
    function count(key, label, from, to) {
      var row = document.createElement("div");
      row.className = "st-row";
      row.innerHTML = '<span></span><div class="seg st-seg" role="radiogroup"></div>';
      row.firstChild.textContent = label;
      var seg = row.lastChild;
      seg.setAttribute("aria-label", label);
      for (var n = from; n <= to; n++) {
        (function (n) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "seg-btn" + (want[key] === n ? " on" : "");
          b.setAttribute("role", "radio");
          b.setAttribute("aria-checked", want[key] === n ? "true" : "false");
          b.textContent = String(n);
          b.onclick = function () {
            want[key] = n;
            all(".seg-btn", seg).forEach(function (o) {
              var on = o === b;
              o.classList.toggle("on", on);
              o.setAttribute("aria-checked", on ? "true" : "false");
            });
          };
          seg.appendChild(b);
        })(n);
      }
      rows.appendChild(row);
    }
    function flip(key, label) {
      var row = document.createElement("label");
      row.className = "switch wide";
      row.innerHTML = '<span></span><input type="checkbox">';
      row.firstChild.textContent = label;
      var box = row.lastChild;
      box.checked = !!want[key];
      box.onchange = function () { want[key] = box.checked; };
      rows.appendChild(row);
    }
    count("beds", TXT.st_beds, 1, 5);
    count("baths", TXT.st_baths, 1, 3);
    count("floors", TXT.st_floors, 1, 2);
    flip("basement", TXT.st_basement);
    flip("open", TXT.st_open_plan);
    flip("office", TXT.st_office);
    flip("laundry", TXT.st_laundry);
    flip("garage", TXT.st_garage);
    flip("closet", TXT.st_closet);
    flip("roofOne", TXT.st_roof_one);
    flip("lot", TXT.st_lot);
    flip("spread", TXT.st_spread);
    var no = card.querySelector(".st-no"), yes = card.querySelector(".st-yes");
    no.textContent = TXT.in_cancel;
    yes.textContent = TXT.st_make;
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
      starterWant = want;
      try { localStorage.setItem("flowchart-starter", JSON.stringify(want)); } catch (e) { /* this visit only */ }
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
