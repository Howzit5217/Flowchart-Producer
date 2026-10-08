// ---------------------------------------------------------------------------
//  40-yard.js -- the yard: a pool, a hot tub, a deck, a front porch, a
//  trampoline, a swing set, a fire pit, a grill, a shed, a gazebo, a
//  vegetable garden -- asked for when a house is started, or added after
//  from the view's Settings, each put where it goes behind the house
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "and also be able to add things in the yard like
  // pools, porches, trampolines etc.")
  //
  // Each could be put down by hand from the icons; here they are asked for
  // by name, and put in the back yard: on the lot, behind the house as it
  // stands in 3D and as it is drawn, clear of it and of each other and of
  // the doors out -- the deck and the grill and the hot tub by the house,
  // the pool in the middle, the trampoline, the swings, the shed and the
  // garden out toward the back.  A front porch is the style's porch
  // (stylePorch, 39-styles.js) on any house.  What is put is marked
  // (`yard`), to be taken away again by the same tile.
  var YARD_KINDS = [
    // key, icon kind(s), size in metres (or null: its own), where (near the house, the middle, the back)
    ["deck", ["i_deck"], [5.0, 3.6], "near"],
    ["porch", null, null, "front"],
    ["pool", ["i_pool"], [7.0, 3.6], "mid"],
    ["hottub", ["i_hottub"], null, "near"],
    ["grill", ["i_grill"], null, "near"],
    ["firepit", ["i_firepit", "i_gardenbench"], null, "mid"],
    ["trampoline", ["i_trampoline"], null, "back"],
    ["swing", ["i_swing"], null, "back"],
    ["gazebo", ["i_gazebo"], null, "back"],
    ["shed", ["i_shed"], null, "corner"],
    ["garden", ["i_planter", "i_planter", "i_planter"], null, "side"]
  ];
  var YARD_OF = {};
  YARD_KINDS.forEach(function (y) { YARD_OF[y[0]] = y; });
  HOUSE_PLAIN.frontPorch = false;

  // The houses, each its lot (the lot drawn, or the least one round it) and
  // its rooms.
  function yardHouses() {
    var lots = hand.nodes.filter(function (n) { return n.kind === "i_lot"; });
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    function ground(r) { var f = floors.length ? floorAt(floors, r.x, r.y) : null; return !f || f.level === 0; }
    if (!lots.length) {
      var lot = typeof houseLotGuess === "function" ? houseLotGuess() : null;
      return lot ? [{ lot: lot, rooms: rooms.filter(ground) }] : [];
    }
    return lots.map(function (lot) { return { lot: lot, rooms: rooms.filter(function (r) { return ground(r) && insideArea(lot, r.x, r.y); }) }; })
               .filter(function (h) { return h.rooms.length; });
  }
  // Somewhere for a piece w by h (pixels) on a house's lot: behind the
  // house, clear of it, of the doors out, of what is there, and of what is
  // being put now; the spot nearest where that piece wants to be.
  function yardSpot(H, w, h, where, taken) {
    var P = FLOOR_PX, lot = H.lot, a = -(lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    function local(x, y) { var dx = x - lot.x, dy = y - lot.y; return [dx * c - dy * s, dx * s + dy * c]; }
    function world(lx, ly) { return [lot.x + lx * Math.cos(-a) - ly * Math.sin(-a), lot.y + lx * Math.sin(-a) + ly * Math.cos(-a)]; }
    // the house, in the lot's numbers: as drawn, and as 3D puts it together
    var J = null;
    try { J = typeof tieLayout === "function" ? tieLayout() : null; } catch (e) { J = null; }
    var boxes = [];
    H.rooms.forEach(function (r) {
      [tieBox(r), J && J.boxes && J.boxes[r.id]].forEach(function (b) {
        if (!b) { return; }
        var p = [local(b.l, b.t), local(b.r, b.t), local(b.r, b.b), local(b.l, b.b)];
        boxes.push({ l: Math.min(p[0][0], p[1][0], p[2][0], p[3][0]), r: Math.max(p[0][0], p[1][0], p[2][0], p[3][0]),
                     t: Math.min(p[0][1], p[1][1], p[2][1], p[3][1]), b: Math.max(p[0][1], p[1][1], p[2][1], p[3][1]) });
      });
    });
    if (!boxes.length) { return null; }
    var hb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    boxes.forEach(function (b) { hb.l = Math.min(hb.l, b.l); hb.r = Math.max(hb.r, b.r); hb.t = Math.min(hb.t, b.t); hb.b = Math.max(hb.b, b.b); });
    var others = hand.nodes.filter(function (n) {
      return n !== lot && n.kind !== "i_room" && n.kind !== "i_floor" && n.kind !== "i_lot" && n.kind !== "i_zone" && !ON_THE_WALL[n.kind] && !FROM_CEILING[n.kind];
    }).map(function (n) {
      var q = turned(n), m = local(n.x, n.y), door = WALK_DOORS[n.kind] ? 1.6 * P : 0.6 * P;
      return { l: m[0] - q.w / 2 - door, r: m[0] + q.w / 2 + door, t: m[1] - q.h / 2 - door, b: m[1] + q.h / 2 + door };
    }).concat(taken);
    var L = { l: -lot.w / 2 + 0.6 * P, r: lot.w / 2 - 0.6 * P, t: -lot.h / 2 + 0.6 * P, b: lot.h / 2 - 0.6 * P };
    var front = where === "front";
    // where it wants to be, in the lot's numbers
    var mx = (hb.l + hb.r) / 2, back = L.t + h / 2, near = hb.t - 1.2 * P - h / 2;
    var want = where === "near" ? [mx, near] : where === "mid" ? [mx, (back + near) / 2] : where === "back" ? [mx, back]
             : where === "corner" ? [L.r - w / 2, back] : where === "side" ? [L.l + w / 2, (back + near) / 2] : [mx, near];
    var best = null, step = 0.5 * P;
    for (var y = L.t + h / 2; y <= (front ? L.b : hb.b) - h / 2; y += step) {
      for (var x = L.l + w / 2; x <= L.r - w / 2; x += step) {
        var b = { l: x - w / 2, r: x + w / 2, t: y - h / 2, b: y + h / 2 };
        if (!front && b.b > hb.t - 0.8 * P && !(b.l > hb.r + 1.0 * P || b.r < hb.l - 1.0 * P)) { continue; }   // behind the house, or beside it
        if (boxes.some(function (o) { return b.l < o.r + 1.0 * P && b.r > o.l - 1.0 * P && b.t < o.b + 1.0 * P && b.b > o.t - 1.0 * P; })) { continue; }
        if (others.some(function (o) { return b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t; })) { continue; }
        var d = Math.hypot(x - want[0], y - want[1]);
        if (!best || d < best.d) { best = { d: d, x: x, y: y, box: b }; }
      }
    }
    if (!best) { return null; }
    taken.push({ l: best.box.l - 0.8 * P, r: best.box.r + 0.8 * P, t: best.box.t - 0.8 * P, b: best.box.b + 0.8 * P });
    var at = world(best.x, best.y);
    return { x: Math.round(at[0]), y: Math.round(at[1]), turn: lot.turn || 0 };
  }
  // One thing for the yard, put in each house's: false where none had room.
  function yardPut(key, houses) {
    var Y = YARD_OF[key], P = FLOOR_PX, put = 0;
    if (!Y || !Y[1]) { return 0; }
    (houses || yardHouses()).forEach(function (H) {
      var taken = [];
      // (a fire pit with a bench by it: the two together)
      var kinds = Y[1], first = null;
      kinds.forEach(function (kind, i) {
        var icon = ICONS[kind];
        if (!icon) { return; }
        var w = Y[2] && !i ? Y[2][0] * P : icon.box[0], h = Y[2] && !i ? Y[2][1] * P : icon.box[1];
        var spot = null;
        if (first && key === "firepit") {
          spot = { x: first.x, y: first.y + first.h / 2 + 0.9 * P + h / 2, turn: 180 };
        } else if (first && key === "garden") {
          spot = { x: first.x, y: first.y + (h + 0.5 * P) * i, turn: first.turn || 0 };
        } else {
          spot = yardSpot(H, w, h, Y[3], taken);
        }
        if (!spot) { return; }
        var n = adviceAdd(kind, spot.x, spot.y, spot.turn || 0);
        if (Y[2] && !i) { n.w = Math.round(w); n.h = Math.round(h); }
        n.own = true; n.yard = key;
        if (!first) { first = n; }
        put++;
      });
    });
    return put;
  }
  function yardHas(key) { return hand.nodes.some(function (n) { return n.yard === key; }); }
  function yardTake(key) {
    var gone = {};
    hand.nodes.forEach(function (n) { if (n.yard === key) { gone[n.id] = true; } });
    hand.nodes = hand.nodes.filter(function (n) { return !gone[n.id]; });
    hand.links = hand.links.filter(function (l) { return !gone[l.from] && !gone[l.to]; });
  }
  function yardRedraw() {
    picked = null; chosen = null; many = [];
    if (typeof tieSeen !== "undefined") { tieSeen = { H: null, key: null, J: null }; }
    if (typeof handKeep === "function") { handKeep(); }
    drawHand(); drawHandPanel(); showReport();
    if (typeof houseFresh === "function") { houseFresh(); }
  }
  // A yard thing turned on or off, after the house is built: one step to Undo.
  function yardToggle(key) {
    keepUndo();
    if (key === "porch") {
      var h = Object.assign({}, hand.house || {});
      if (h.frontPorch) { delete h.frontPorch; } else { h.frontPorch = true; }
      if (Object.keys(h).length) { hand.house = h; } else { delete hand.house; }
    } else if (yardHas(key)) { yardTake(key); }
    else if (!yardPut(key)) { if (typeof handSaysSoft === "function") { handSaysSoft(TXT.yd_no_room); } }
    yardRedraw();
  }
  // Asked for when it was started (Start building): put in the new house's yard.
  function yardMake(want, made) {
    var Y = want && want.yard;
    if (!Y || typeof Y !== "object") { return; }
    var lot = made.filter(function (n) { return n.kind === "i_lot"; })[0];
    var houses = yardHouses().filter(function (H) { return !lot || H.lot === lot || H.lot.id === lot.id; });
    if (!lot) { houses = houses.slice(0, 1); }
    Object.keys(Y).forEach(function (key) {
      if (!Y[key]) { return; }
      if (key === "porch") { hand.house = Object.assign({}, hand.house || {}, { frontPorch: true }); return; }
      yardPut(key, houses);
    });
    picked = null;
  }

  // ---- a front porch on any house ---------------------------------------------------------
  if (typeof v3Build === "function") {
    var v3BuildYard = v3Build;
    v3Build = function () {
      var model = v3BuildYard.apply(this, arguments);
      try {
        var S = typeof styleNow === "function" ? styleNow() : null;
        if (model && houseOpt("frontPorch") && !(S && S.porch) && typeof stylePorch === "function" && V3 && V3.scene !== "space" &&
            !(V3.flat && V3.flatDone) && !V3.low) {
          var inside = V3.mode === "walk", indoors = inside && !!V3.inRoom;
          var whole = inside ? true : (V3.upTo === null || V3.upTo === undefined) && (V3.rise === undefined ? 1 : V3.rise) >= 0.98;
          if (whole) {
            var floors = typeof floorsOf === "function" ? floorsOf() : [];
            var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
            var inRoom = function (x, y) { return rooms.some(function (r) { return insideArea(r, x, y); }); };
            stylePorch(model, S || { trim: "#f1eee8" }, floors, rooms, inRoom);
          }
        }
      } catch (e) { /* the house without it */ }
      return model;
    };
  }

  // ---- asked: in Start building, and in the view's Settings ---------------------------------
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      yd_deck: '<path d="M2.6 9.4h14.8v2.4H2.6zM4.4 11.8v4.6M15.6 11.8v4.6M10 11.8v4.6"/><path d="M5.6 9.4V5.6M14.4 9.4V5.6M5.6 6.6h8.8"/>',
      yd_porch: '<path d="M2.6 8.6 10 3.6l7.4 5"/><path d="M4.6 7.4V16.4M15.4 7.4V16.4M2.6 16.4h14.8M8.4 16.4v-4.6h3.2v4.6"/>',
      yd_pool: '<rect x="2.6" y="5" width="14.8" height="10" rx="2.4"/><path d="M5 10.6c1-.8 2-.8 3 0s2 .8 3 0 2-.8 3 0 1.4.6 1.6.4"/>',
      yd_hottub: '<circle cx="10" cy="11.4" r="5.4"/><path d="M7.4 11.4c.8-.6 1.8-.6 2.6 0s1.8.6 2.6 0M8 3.4c-.6.8-.6 1.6 0 2.4M11.6 3.4c-.6.8-.6 1.6 0 2.4"/>',
      yd_grill: '<path d="M4 8h12a6 6 0 0 1-12 0z"/><path d="M6.6 13 5 17.4M13.4 13l1.6 4.4M7.6 4.8v1.6M10 4v2.4M12.4 4.8v1.6"/>',
      yd_firepit: '<path d="M3 14.4h14M4.4 14.4l1.2 2.4h8.8l1.2-2.4"/><path d="M10 4c2 2.2 3 3.8 3 5.4a3 3 0 0 1-6 0c0-1 .5-1.8 1.2-2.6.3 1 .9 1.6 1.4 1.8C9.4 7.2 9.6 5.6 10 4z"/>',
      yd_trampoline: '<ellipse cx="10" cy="8.6" rx="7.4" ry="2.6"/><path d="M3.6 9.8 4.6 16M16.4 9.8 15.4 16M8 11.2 7.6 16.4M12 11.2l.4 5.2"/>',
      yd_swing: '<path d="M2.6 16.6 6 3.6h8l3.4 13M7.4 3.6v8.6M12.6 3.6v8.6M6.4 12.2h2M11.6 12.2h2"/>',
      yd_gazebo: '<path d="M2.6 8 10 3.4 17.4 8z"/><path d="M4.4 8v8.4M15.6 8v8.4M10 8v8.4M3.2 16.4h13.6"/>',
      yd_shed: '<path d="M3 8.4 10 4l7 4.4V16.4H3z"/><path d="M7.6 16.4v-5h4.8v5M7.6 11.4l4.8 5M12.4 11.4l-4.8 5"/>',
      yd_garden: '<path d="M3 13.4h14v3H3z"/><path d="M6 13.4V10M6 10c-1.6 0-2.4-1-2.4-2.4C5 7.6 6 8.4 6 10zM10 13.4V8.6M10 8.6c-1.8 0-2.8-1.2-2.8-2.8 1.6 0 2.8 1 2.8 2.8zM14 13.4V10M14 10c1.6 0 2.4-1 2.4-2.4-1.4 0-2.4.8-2.4 2.4z"/>'
    });
  }
  // On the House tab (40-solar.js holds the list of what goes there).
  if (typeof HOUSE_TAB_MORE === "object") {
    HOUSE_TAB_MORE.push(function (sheet, head, tiles) {
      head(TXT.yd_head);
      tiles(YARD_KINDS.map(function (Y) {
        var key = Y[0];
        return { icon: "yd_" + key, label: TXT["yd_" + key], on: key === "porch" ? !!houseOpt("frontPorch") : yardHas(key),
                 set: function () { yardToggle(key); } };
      }));
    });
  }
