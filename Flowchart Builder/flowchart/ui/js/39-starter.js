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
  // and bathrooms, and which of a few more rooms, and lays the house out the
  // way the arrows of 39-join.js join one: the rooms everybody uses along the
  // top, a hall under them, the bedrooms and the bathroom off the hall, a
  // main bedroom with its own bathroom and closet -- spread out on the paper,
  // joined by arrows, and furnished; or put together as it stands.  The
  // windows go in walls that are outside once it is put together, a front
  // door off the living room, and it is one step for Undo.
  var STARTER_ROOMS = {
    // metres across and deep, and what goes in: against a wall, or in the middle
    living: { w: 5.2, h: 4.2, wall: ["i_sofa", "i_tv", "i_armchair", "i_lamp", "i_plant"], mid: ["i_rug", "i_coffee"] },
    kitchen: { w: 3.8, h: 3.4, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_dishwasher"], mid: [] },
    great: { w: 6.4, h: 4.0, wall: ["i_counter", "i_kitchensink", "i_stove", "i_fridge", "i_dishwasher"], mid: ["i_dining"] },
    dining: { w: 4.0, h: 3.6, wall: ["i_sideboard|i_hutch|i_consoletable", "i_plant"], mid: ["i_dining|i_roundtable"] },
    main: { w: 4.4, h: 4.2, wall: ["i_bedking", "i_nightstand", "i_nightstand", "i_wardrobe", "i_dresser"], mid: [] },
    bed: { w: 3.4, h: 3.4, wall: ["i_bed", "i_nightstand", "i_wardrobe", "i_desk"], mid: [] },
    bath: { w: 3.0, h: 2.4, wall: ["i_bathtub", "i_toilet", "i_vanity|i_sink", "i_sconce"], mid: [] },
    ensuite: { w: 2.4, h: 2.2, wall: ["i_shower", "i_toilet", "i_sink", "i_sconce"], mid: [] },
    office: { w: 3.0, h: 3.0, wall: ["i_desk", "i_bookcase", "i_filing"], mid: ["i_officechair"] },
    laundry: { w: 3.0, h: 2.6, wall: ["i_washer", "i_dryer", "i_utilitysink|i_hamper"], mid: [] },
    garage: { w: 6.0, h: 6.2, wall: ["i_workbench", "i_shelving"], mid: ["i_parked"] },
    closet: { w: 2.6, h: 2.0, wall: ["i_closetrod|i_closetshelves", "i_closetshelves|i_shoerack"], mid: [] },
    hall: { w: 6.0, h: 1.4, wall: ["i_sconce", "i_sconce"], mid: [] }
  };
  var STARTER_GAP = 100;                 // px between rooms spread out: room for the arrows
  var starterLast = [];                  // the rooms last made, and what each was to be
  var starterWant = { beds: 3, baths: 2, open: true, office: false, laundry: true, garage: true, closet: true, spread: true };

  // ---- the house, made ---------------------------------------------------------------
  function starterMake(want) {
    var P = FLOOR_PX, made = [], links = [];
    keepUndo();
    function room(kind, label) {
      var spec = STARTER_ROOMS[kind];
      var n = { id: hand.next++, kind: "i_room", text: label || "", x: 0, y: 0, w: 140, h: 46 };
      measure(n);
      n.w = Math.round(spec.w * P); n.h = Math.round(spec.h * P); n.own = true;
      n.text = label || "";
      n.starter = kind;
      made.push(n);
      return n;
    }
    function join(a, b) { links.push({ from: a.id, to: b.id, label: "" }); }
    // the rooms, in rows: those everybody uses, the hall, the bedrooms
    var top = [], bottom = [], below = [];
    var office = want.office ? room("office") : null;
    var living = room("living");
    var kitchen = room(want.open ? "great" : "kitchen");
    var dining = want.open ? null : room("dining");
    var laundry = want.laundry ? room("laundry") : null;
    var garage = want.garage ? room("garage") : null;
    [office, living, kitchen, dining, laundry, garage].forEach(function (r) { if (r) { top.push(r); } });
    var beds = [], baths = [];
    for (var b = 0; b < want.beds; b++) {
      beds.push(room(b ? "bed" : "main", want.beds > 1 ? (b ? say("st_bed_n", { n: b + 1 }) : TXT.st_main) : ""));
    }
    var ensuite = want.baths > 1 ? room("ensuite", TXT.st_ensuite) : null;
    var closet = want.closet ? room("closet") : null;
    for (var t = 0; t < want.baths - (ensuite ? 1 : 0); t++) { baths.push(room("bath")); }
    bottom = beds.concat(baths);
    if (ensuite) { below.push(ensuite); }
    if (closet) { below.push(closet); }
    var hall = bottom.length > 2 ? room("hall", TXT.st_hall) : null;
    // the hall as long as the rooms off it
    var G = STARTER_GAP;
    function rowWidth(row) { return row.reduce(function (s, r) { return s + r.w; }, 0) + G * Math.max(0, row.length - 1); }
    if (hall) { hall.w = Math.max(hall.w, Math.round(rowWidth(bottom) - G * (bottom.length - 1) * 0.6)); }
    // laid out: each row in a line, centred on the living room
    var rows = [top].concat(hall ? [[hall]] : []).concat([bottom]).concat(below.length ? [below] : []);
    var y = 0, fromX = Infinity;
    rows.forEach(function (row) {
      var tall = Math.max.apply(null, row.map(function (r) { return r.h; }));
      var x = -rowWidth(row) / 2;
      row.forEach(function (r) { r.x = x + r.w / 2; r.y = y + tall / 2; x += r.w + G; });
      y += tall + G;
    });
    // the main bedroom's own rooms under it, rather than in a row of their own
    if (below.length) {
      var main = beds[0], bx = main.x - (rowWidth(below) - main.w) / 2 - main.w / 2;
      below.forEach(function (r) { r.x = bx + r.w / 2; bx += r.w + G; });
    }
    // the living room over the middle of the hall
    var shift = hall ? hall.x - living.x : 0;
    top.forEach(function (r) { r.x += shift; });
    // beside anything already on the paper, not on it
    var right = -Infinity;
    hand.nodes.forEach(function (n) { var q = turned(n); right = Math.max(right, n.x + q.w / 2); });
    made.forEach(function (r) { fromX = Math.min(fromX, r.x - r.w / 2); });
    var ox = (right === -Infinity ? 140 : right + 240) - fromX, oy = 160;
    made.forEach(function (r) { r.x = Math.round(r.x + ox); r.y = Math.round(r.y + oy); hand.nodes.push(r); });
    // which opens into which
    if (office) { join(living, office); }
    join(living, kitchen);
    if (dining) { join(kitchen, dining); }
    if (laundry) { join(dining || kitchen, laundry); }
    if (garage) { join(laundry || kitchen, garage); }
    if (hall) {
      join(living, hall);
      bottom.forEach(function (r) { join(hall, r); });
    } else {
      bottom.forEach(function (r) { join(living, r); });
    }
    if (ensuite) { join(beds[0], ensuite); }
    if (closet) { join(beds[0], closet); }
    // the front door, out of the living room on the far side from the kitchen
    var front = { id: hand.next++, kind: "i_door", text: firstWords("i_door"), x: 0, y: 0, w: 140, h: 46 };
    measure(front);
    front.x = Math.round(living.x - living.w / 2 - G * 0.9 - (office ? office.w + G : 0)); front.y = Math.round(living.y);
    front.turn = 90;
    hand.nodes.push(front);
    links.push({ from: living.id, to: front.id, label: "" });
    links.forEach(function (l) { hand.links.push(l); });

    // put together on the paper too, where that was asked for: the rooms
    // where 3D puts them, and drawn (tieTidy) each arrow becomes a door
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
    made.forEach(function (r) {
      // (a hall too, where no light would go on its walls)
      var lit = r.starter === "hall" && hand.nodes.some(function (n) { return n.kind === "i_sconce" && insideArea(r, n.x, n.y, -14); });
      var want1 = (r.starter === "hall" && lit) || r.starter === "closet" || r.starter === "garage" ? null : "i_window";
      var put = want1 && intoOutsideWall(walkPlan(), r, want1);
      if (put) { put(); }
      if (r.starter === "garage") {
        var gate = intoOutsideWall(walkPlan(), r, "i_garagedoor");
        if (gate) {
          gate();
          // and a drive up to it
          var door = nodeById(picked), drive = door && door.kind === "i_garagedoor" ? drivewayFor(walkPlan(), door) : null;
          if (drive) { drive(); }
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
    made.forEach(function (r) { delete r.starter; });
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
    flip("open", TXT.st_open_plan);
    flip("office", TXT.st_office);
    flip("laundry", TXT.st_laundry);
    flip("garage", TXT.st_garage);
    flip("closet", TXT.st_closet);
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
