// ---------------------------------------------------------------------------
//  40-oddrooms.js -- a room need not be one rectangle: an L, a room with a
//  nook off it, made of several rectangles that are one room -- one name,
//  one floor, no wall between them
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "Rooms need not be closed rectangles: odd
  // shapes = several rectangles as one room")
  //
  // A rectangle that is part of another room says so: `partOf`, the id of
  // the room it belongs to (its main rectangle).  The wall between them is
  // open (`room.open`, 39-inside.js: the part's side toward its room), and
  // nothing holds it up -- there was never a wall to carry anything, so no
  // beam and no posts.  It is named as its room is, in 3D and in what is
  // said; on the plan its room's name says the whole of it, and how big.
  // Start building gives a room a nook now and then -- a reading nook off
  // the living room, a breakfast nook off the kitchen, a sitting nook off
  // the main bedroom -- and by hand any rooms side by side are made one
  // (Make one room) or apart again (Own room).

  // ---- which rooms are one ------------------------------------------------------------------
  // (each room's parts, worked out once for the drawing as it is)
  var oddKept = { list: null, count: -1, ver: -1, parts: null };
  var oddVer = 0;
  function oddPartsMap() {
    var K = oddKept;
    if (K.list === hand.nodes && K.count === hand.nodes.length && K.ver === oddVer && K.parts) { return K.parts; }
    var parts = new Map();
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_room" || n.partOf === undefined) { return; }
      var list = parts.get(n.partOf);
      if (!list) { list = []; parts.set(n.partOf, list); }
      list.push(n);
    });
    oddKept = { list: hand.nodes, count: hand.nodes.length, ver: oddVer, parts: parts };
    return parts;
  }
  function oddMainOf(n) {
    if (!n || n.partOf === undefined) { return n; }
    var m = nodeById(n.partOf);
    return m && m.kind === "i_room" && m !== n ? m : n;
  }
  function oddPartsOf(main) { return (main && oddPartsMap().get(main.id)) || []; }
  function oddOne(a, b) { return !!a && !!b && a !== b && oddMainOf(a) === oddMainOf(b); }
  // How big, said under its name on the plan: the whole of it.
  function oddArea(n, w, h) {
    var parts = oddPartsOf(n);
    if (!parts.length) { return floorSays(w, h); }
    var px2 = w * h;
    parts.forEach(function (p) { px2 += p.w * p.h; });
    return areaSays(px2);
  }
  // The side of `part` that meets `main`, in its own numbers (top, foot, left, right).
  function oddSide(part, main, boxOf) {
    var a = boxOf ? boxOf(part) : tieBox(part), b = boxOf ? boxOf(main) : tieBox(main);
    if (Math.abs(a.l - b.r) < 3) { return "left"; }
    if (Math.abs(a.r - b.l) < 3) { return "right"; }
    if (Math.abs(a.t - b.b) < 3) { return "top"; }
    if (Math.abs(a.b - b.t) < 3) { return "foot"; }
    return null;
  }
  // Made one: `part` belongs to `main`, the wall between them gone.
  function oddJoin(main, part, side) {
    side = side || oddSide(part, main);
    if (!side) { return false; }
    part.partOf = main.id;
    var open = (part.open || []).filter(function (e) { return e !== side; });
    open.push(side);
    part.open = open;
    oddVer++;
    return true;
  }
  // Apart again: a room of its own, its wall back.
  function oddSplit(part) {
    var main = oddMainOf(part);
    if (main === part) { return false; }
    var J = typeof tieLayout === "function" ? tieLayout() : null;
    var side = oddSide(part, main, function (n) { return (J && J.boxes && J.boxes[n.id]) || tieBox(n); });
    // (or what it meets of the room's other parts)
    if (!side) {
      oddPartsOf(main).some(function (o) { if (o !== part) { side = oddSide(part, o, function (n) { return (J && J.boxes && J.boxes[n.id]) || tieBox(n); }); } return !!side; });
    }
    if (side && part.open) {
      part.open = part.open.filter(function (e) { return e !== side; });
      if (!part.open.length) { delete part.open; }
    }
    delete part.partOf;
    if (part.textWas !== undefined) { if (!String(part.text || "").trim()) { part.text = part.textWas; } delete part.textWas; }
    oddVer++;
    return true;
  }

  // Where a room meets the rest of itself: no wall there to put anything
  // against -- [{ edge, a, b }], from its middle along that side, on the
  // paper.  While a house is made its rooms are drawn apart (spread out),
  // so they are looked at where they go together (`local`, 39-starter.js).
  function oddSeams(r) {
    var main = oddMainOf(r), group = [main].concat(oddPartsOf(main)), out = [];
    if (group.length < 2 || group.indexOf(r) < 0) { return out; }
    function box(n) {
      if (n.local) { return { l: n.local[0], t: n.local[1], r: n.local[2], b: n.local[3] }; }
      return tieBox(n);
    }
    var B = box(r), cx = (B.l + B.r) / 2, cy = (B.t + B.b) / 2;
    group.forEach(function (g) {
      if (g === r) { return; }
      var Q = box(g), lo, hi, edge = null;
      if (Math.abs(B.l - Q.r) < 3) { edge = "left"; } else if (Math.abs(B.r - Q.l) < 3) { edge = "right"; }
      else if (Math.abs(B.t - Q.b) < 3) { edge = "top"; } else if (Math.abs(B.b - Q.t) < 3) { edge = "foot"; }
      if (!edge) { return; }
      if (edge === "left" || edge === "right") { lo = Math.max(B.t, Q.t) - cy; hi = Math.min(B.b, Q.b) - cy; }
      else { lo = Math.max(B.l, Q.l) - cx; hi = Math.min(B.r, Q.r) - cx; }
      if (hi - lo > 10) { out.push({ edge: edge, a: lo, b: hi }); }
    });
    return out;
  }

  // ---- named as its room --------------------------------------------------------------------
  if (typeof roomLabel === "function") {
    var oddRoomLabel = roomLabel;
    roomLabel = function (room) { return oddRoomLabel(oddMainOf(room) || room); };
  }
  if (typeof roomName === "function") {
    var oddRoomName = roomName;
    roomName = function (plan, room) { return oddRoomName(plan, oddMainOf(room) || room); };
  }
  // In 3D, where you stand: the room's name, and how big the whole of it is.
  if (typeof tourSize === "function") {
    var oddTourSize = tourSize;
    tourSize = function (n) {
      var main = oddMainOf(n), parts = oddPartsOf(main);
      if (!parts.length) { return oddTourSize(n); }
      var px2 = main.w * main.h;
      parts.forEach(function (p) { px2 += p.w * p.h; });
      return areaSays(px2);
    };
  }

  // ---- nothing to hold up ---------------------------------------------------------------------
  // (a wall never there carried nothing: no beam over the opening, no posts asked for)
  if (typeof wallStructure === "function") {
    var oddWallStructure = wallStructure;
    wallStructure = function (room, run) {
      var s = oddWallStructure.apply(this, arguments), other = run && (run.other || (run.it && run.it.room));
      if (s && other && oddOne(room, other)) { return Object.assign({}, s, { bearing: false }); }
      return s;
    };
  }

  // ---- Start building: a nook now and then ------------------------------------------------------
  // Beside its room in the band, the nook against the outside wall, and on
  // the hall's side of it a coat closet, a pantry or a closet of the
  // bedroom's own (39-starter.js lays a column of two out as a suite's).
  var ODD_NOOKS = {
    living: { nook: "nook", by: "coat", odds: 0.35 },
    kitchen: { nook: "breakfast", by: "larder", odds: 0.35 },
    main: { nook: "sitting", by: "closet", odds: 0.3 }
  };
  if (typeof STARTER_ROOMS === "object") {
    Object.assign(STARTER_ROOMS, {
      nook: { w: 2.6, h: 2.8, wall: ["i_armchair", "i_lamp|i_plant"], mid: [] },
      breakfast: { w: 2.6, h: 2.8, wall: [], mid: ["i_roundtable"] },
      sitting: { w: 2.6, h: 2.8, wall: ["i_armchair|i_chaise", "i_plant"], mid: [] },
      coat: { w: 2.6, h: 2.0, wall: ["i_closetrod|i_closetshelves", "i_shoerack"], mid: [] },
      // (a walk-in pantry off the kitchen, too small for a store's shelving: shelves on its walls)
      larder: { w: 2.6, h: 2.0, wall: ["i_shelf"], mid: [] }
    });
  }
  if (typeof STARTER_LABEL === "object") { STARTER_LABEL.coat = "hx_coat"; STARTER_LABEL.larder = "hx_pantry"; }
  if (typeof STARTER_ZONE === "object") { Object.assign(STARTER_ZONE, { nook: "day", breakfast: "day", sitting: "night", coat: "hall", larder: "wet" }); }
  if (typeof STARTER_FLOOR_OF === "object") { Object.assign(STARTER_FLOOR_OF, { nook: "living", breakfast: "kitchen", sitting: "bed", coat: "living", larder: "kitchen" }); }
  if (typeof STARTER_CEILING === "object") { Object.assign(STARTER_CEILING, { nook: "i_pendant", breakfast: "i_pendant", sitting: "i_pendant", coat: "i_pendant", larder: "i_pendant" }); }
  if (typeof STARTER_OUTER === "object") { Object.assign(STARTER_OUTER, { nook: 1, breakfast: 1, sitting: 1 }); }
  // (small, and lit all the same: a light of their own however narrow, 39-starter.js)
  var ODD_SMALL = { nook: 1, breakfast: 1, sitting: 1, coat: 1, larder: 1 };
  var oddCount = 0;
  // Called by starterPlan (39-starter.js) before a long house is folded.
  function oddNooks(floors, want, rnd, it) {
    if (want.nooks === false) { return; }
    floors.forEach(function (fp) {
      if (fp.level < 0) { return; }
      [fp.back, fp.front].forEach(function (band) {
        band.slice().forEach(function (host) {
          var how = ODD_NOOKS[host.kind];
          if (!how || rnd() >= how.odds || !STARTER_ROOMS[how.by]) { return; }
          var id = "odd" + (++oddCount), w = 2.4 + Math.round(rnd() * 6) / 10;
          host.id = host.id || id;
          var nook = it(how.nook, "");
          nook.w = w; nook.nook = true; nook.via = host.id;
          var by = it(how.by, how.by === "coat" ? TXT.hx_coat : how.by === "larder" ? TXT.hx_pantry : "");
          by.w = w;
          if (how.by === "larder") { by.via = host.id; }
          var col = { kind: "suite", parts: [nook, by], w: w, nookHost: host };
          host.nookCol = col;
          // (beside it, on the side away from the main bedroom's own rooms)
          var at = band.indexOf(host), after = !(band[at + 1] && band[at + 1].kind === "suite");
          band.splice(after ? at + 1 : at, 0, col);
        });
      });
    });
  }
  // The nook, made: part of its room; and dressed as its room is.
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var out = yield* inner(want);
      hand.nodes.forEach(function (n) {
        if (n.kind !== "i_room" || n.partOf === undefined) { return; }
        var main = oddMainOf(n);
        if (main === n) { return; }
        if (main.mat) { n.mat = Object.assign({}, main.mat); }
        if (main.ceil) { n.ceil = main.ceil; }
      });
      return out;
    });
  }

  // ---- by hand: made one, or apart ------------------------------------------------------------
  if (typeof MENU_ICONS === "object") {
    // (two rooms run into one, an L; and an L with the line it parts along)
    MENU_ICONS.roomone = '<path d="M3 3.5h8v5.5h6v7.5H3z"/><path d="M11 9v2.6" stroke-dasharray="1.2 1.4"/>';
    MENU_ICONS.roomapart = '<path d="M3 3.5h8v13H3zM11 9h6v7.5h-6"/>';
  }
  // The row for the shape menus (20-menu.js, 11-hand-many.js): rooms chosen
  // together, made one; one that is part of another, its own again; one
  // with parts, all of them their own again.  Null where none of it fits.
  function oddRow(ids) {
    var list = ids.map(function (id) { return typeof id === "object" ? id : nodeById(id); }).filter(function (n) { return n && n.kind === "i_room"; });
    function done() { if (typeof handKeep === "function") { handKeep(); } drawHand(); drawHandPanel(); showReport(); }
    if (list.length >= 2 && list.length === ids.length) {
      var main = oddMainOf(list.slice().sort(function (p, q) { return q.w * q.h - p.w * p.h; })[0]);
      if (list.every(function (r) { return oddMainOf(r) === main; })) { return null; }
      return { icon: "roomone", name: TXT.od_one, go: function () { keepUndo(); oddMakeOne(list); done(); } };
    }
    if (list.length !== 1 || ids.length !== 1) { return null; }
    var one = list[0];
    if (oddMainOf(one) !== one) {
      return { icon: "roomapart", name: TXT.od_own, go: function () { keepUndo(); oddSplit(one); done(); } };
    }
    if (oddPartsOf(one).length) {
      return { icon: "roomapart", name: TXT.od_apart, go: function () {
        keepUndo();
        oddPartsOf(one).slice().forEach(function (p) { oddSplit(p); });
        done();
      } };
    }
    return null;
  }
  // Rooms side by side, chosen together: one room (the biggest the main
  // one).  One that is part of another: its own room again.
  function oddMakeOne(rooms) {
    rooms = rooms.filter(function (r) { return r.kind === "i_room" && !((r.turn || 0) % 90); });
    if (rooms.length < 2) { return 0; }
    var main = rooms.slice().sort(function (p, q) { return q.w * q.h - p.w * p.h; })[0];
    main = oddMainOf(main);
    var done = 0, left = rooms.filter(function (r) { return r !== main && oddMainOf(r) !== main; });
    // (where they meet in the house put together: rooms drawn apart meet there, 39-join.js)
    var J = typeof tieLayout === "function" ? tieLayout() : null;
    var boxOf = function (n) { return (J && J.boxes && J.boxes[n.id]) || tieBox(n); };
    // each joined to the main one or to a part of it already joined, where they meet
    for (var pass = 0; pass < rooms.length && left.length; pass++) {
      left = left.filter(function (r) {
        var group = [main].concat(oddPartsOf(main));
        var to = group.filter(function (g) { return oddSide(r, g, boxOf); })[0];
        if (!to) { return true; }
        var side = oddSide(r, to, boxOf);
        r.partOf = main.id;
        var open = (r.open || []).filter(function (e) { return e !== side; });
        open.push(side);
        r.open = open;
        // (its own name kept, for when it is its own room again)
        if (String(r.text || "").trim()) { r.textWas = r.text; r.text = ""; }
        oddVer++;
        done++;
        return false;
      });
    }
    return done;
  }
