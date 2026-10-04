// ---------------------------------------------------------------------------
//  40-fronts.js -- a shop's window is not a house's: glass from near the
//  floor to over the door, across most of the front; an office's in long
//  bands, a classroom's tall, a flat's wider; and the way in from the
//  street a pair of glass doors, not a front door
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "stores and skyscrapers to have bigger doors
  // and windows rather than a normal house")
  //
  // Start building puts a window like a house's in an outside wall of each
  // room (39-starter.js).  Made, each room of another kind of building has
  // the windows in those walls laid out again as its kind has them: as many
  // panes as fit in the share of the wall it takes, each `pane` wide, from
  // its `sill` to its `head` (metres, n.sill and n.head: 38-view3d.js draws
  // them so), clear of the doors and of anything tall against that wall.
  // A tower's skin is its own glass (40-towers.js).
  var FRONT_GLASS = {
    sales: { sill: 0.35, head: 2.8, pane: 2.6, most: 0.8 },
    boutique: { sill: 0.35, head: 2.8, pane: 2.6, most: 0.8 },
    cafe: { sill: 0.45, head: 2.7, pane: 2.4, most: 0.72 },
    lobby: { sill: 0.15, head: 2.8, pane: 2.4, most: 0.7 },
    reception: { sill: 0.15, head: 2.7, pane: 2.4, most: 0.62 },
    openoffice: { sill: 0.75, head: 2.6, pane: 2.2, most: 0.72 },
    meeting: { sill: 0.75, head: 2.6, pane: 2.2, most: 0.62 },
    classroom: { sill: 0.8, head: 2.6, pane: 2.0, most: 0.6 },
    kitchenette: { sill: 0.95, head: 2.4, pane: 1.6, most: 0.4 },
    staff: { sill: 0.95, head: 2.4, pane: 1.6, most: 0.4 },
    flat: { sill: 0.6, head: 2.4, pane: 1.8, most: 0.45 },
    flatbed: { sill: 0.7, head: 2.3, pane: 1.6, most: 0.4 },
    flatbed2: { sill: 0.7, head: 2.3, pane: 1.6, most: 0.4 }
  };
  // The ways in from the street: a pair of glass doors, as tall as each kind's.
  var FRONT_DOORS = { shop: 2.4, boutique: 2.4, cafe: 2.4, office: 2.5, school: 2.4, apartments: 2.3, condos: 2.4 };
  var FRONT_TALL = 1.1;                   // metres: what stands taller than this against a wall keeps the glass off it

  // (the rooms whose doors open on the street: a shop's front is its glass)
  var FRONT_STREET = { sales: 1, boutique: 1, cafe: 1, lobby: 1, reception: 1 };
  function frontRedo(made, type) {
    var P = FLOOR_PX, rooms = made.filter(function (r) { return r.kind === "i_room" && FRONT_GLASS[r.use]; });
    // the ways in first -- a pair of glass doors where the door out to the
    // street was -- so the glass keeps clear of them as wide as they are now
    var ways = frontWays(made), head = FRONT_DOORS[type];
    if (head) { ways.forEach(function (d) { frontDoor(d, head); }); }
    rooms.forEach(function (r) {
      if ((r.turn || 0) % 90) { return; }
      var G = FRONT_GLASS[r.use], b = tieBox(r), T = roomWallOf(r);
      var wins = hand.nodes.filter(function (w) { return w.kind === "i_window" && !w.attic && insideArea(r, w.x, w.y, -14); });
      var doors = hand.nodes.filter(function (d) { return WALK_DOORS[d.kind] && insideArea(r, d.x, d.y, -30); });
      var tall = hand.nodes.filter(function (n) {
        return n !== r && !isArea(n.kind) && ICONS[n.kind] && V3_HIGH[n.kind] !== undefined && !LIES_FLAT[n.kind] && !ON_THE_WALL[n.kind] &&
               !FROM_CEILING[n.kind] && !WALK_DOORS[n.kind] && n.kind !== "i_window" && insideArea(r, n.x, n.y) &&
               (typeof pieceHigh === "function" ? pieceHigh(n) : 1) > Math.min(FRONT_TALL, G.sill + 0.25);
      });
      [{ across: true, line: b.t }, { across: true, line: b.b }, { across: false, line: b.l }, { across: false, line: b.r }].forEach(function (e) {
        var mine = wins.filter(function (w) { return Math.abs((e.across ? w.y : w.x) - e.line) < T + 10; });
        // (an outside wall is one with a window in it -- or, a shop's, its way in from the street)
        var street = FRONT_STREET[r.use] && ways.some(function (d) {
          var q = turned(d);
          return insideArea(r, d.x, d.y, -30) && Math.abs((e.across ? d.y : d.x) - e.line) <= (e.across ? q.h : q.w) / 2 + T + 6;
        });
        if (!mine.length && !street) { return; }
        var turn = mine.length ? mine[0].turn || 0 : e.across ? 0 : 90, lo = (e.across ? b.l : b.t) + T + 0.5 * P, hi = (e.across ? b.r : b.b) - T - 0.5 * P;
        var len = hi - lo, pane = G.pane * P;
        if (len < pane * 0.6) { return; }
        var k = Math.max(1, Math.floor(len * G.most / pane)), pier = (len - k * pane) / (k + 1);
        if (pier < 0.3 * P) { k = Math.max(1, k - 1); pier = (len - k * pane) / (k + 1); }
        // what is in the way along this wall: its doors, and what stands tall against it
        var keep = [];
        doors.forEach(function (d) {
          var q = turned(d), c = e.across ? d.x : d.y, half = (e.across ? q.w : q.h) / 2;
          if (Math.abs((e.across ? d.y : d.x) - e.line) <= (e.across ? q.h : q.w) / 2 + T + 6) { keep.push([c - half - 0.35 * P, c + half + 0.35 * P]); }
        });
        tall.forEach(function (n) {
          var q = turned(n), off = Math.abs((e.across ? n.y : n.x) - e.line) - (e.across ? q.h : q.w) / 2;
          if (off > 0.9 * P) { return; }
          var c = e.across ? n.x : n.y, half = (e.across ? q.w : q.h) / 2;
          keep.push([c - half - 0.1 * P, c + half + 0.1 * P]);
        });
        var spots = [];
        for (var i = 0; i < k; i++) {
          var a = lo + pier + i * (pane + pier), z = a + pane;
          // cut down to what is clear; a pane narrower than a house's window left out
          keep.forEach(function (q) {
            if (q[1] <= a || q[0] >= z) { return; }
            if (q[0] - a > z - q[1]) { z = Math.min(z, q[0]); } else { a = Math.max(a, q[1]); }
          });
          if (z - a >= 1.0 * P) { spots.push([a, z]); }
        }
        if (!spots.length) { return; }                        // (as it was: a house's window)
        hand.nodes = hand.nodes.filter(function (w) { return mine.indexOf(w) < 0; });
        var line = mine.length ? (e.across ? mine[0].y : mine[0].x) : e.line;
        spots.forEach(function (s) {
          var c = (s[0] + s[1]) / 2;
          var w = adviceAdd("i_window", Math.round(e.across ? c : line), Math.round(e.across ? line : c), turn);
          w.w = Math.round(s[1] - s[0]); w.own = true; w.sill = G.sill; w.head = G.head;
        });
      });
    });
    picked = null; chosen = null; many = [];
  }
  // The doors out of the ground floor to the street (in the house as it
  // goes together: rooms drawn apart meet there, 39-join.js).
  function frontWays(made) {
    var P = FLOOR_PX, out = [], J = typeof tieLayout === "function" ? tieLayout() : null, floors = floorsOf();
    var ground = made.filter(function (r) { var f = floors.length ? floorAt(floors, r.x, r.y) : null; return r.kind === "i_room" && (!f || f.level === 0); });
    function box(n) { var m = J && J.boxes && J.boxes[n.id]; return m || tieBox(n); }
    hand.nodes.slice().forEach(function (d) {
      if (d.kind !== "i_door" && d.kind !== "i_door2") { return; }
      var m = J && J.moves && J.moves[d.id], x = m ? m.x : d.x, y = m ? m.y : d.y, turn = m && m.turn !== undefined ? m.turn : (d.turn || 0);
      var t = turn * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t);
      function inside(px, py) { return ground.some(function (r) { var q = box(r); return px > q.l && px < q.r && py > q.t && py < q.b; }); }
      var aIn = inside(x + ux * 0.8 * P, y + uy * 0.8 * P), bIn = inside(x - ux * 0.8 * P, y - uy * 0.8 * P);
      // (drawn apart, a door joined to a room by an arrow: the room's way out)
      var linked = !m && hand.links.some(function (l) { var o = nodeById(l.from === d.id ? l.to : l.from); return (l.from === d.id || l.to === d.id) && o && ground.indexOf(o) >= 0; });
      if (aIn === bIn && !(linked && !aIn && !bIn)) { return; }
      out.push(d);
    });
    return out;
  }
  var FRONT_DRESSING = { i_plant: 1, i_palm: 1, i_floormirror: 1, i_consoletable: 1, i_bench: 1, i_coatrack: 1, i_sidetable: 1, i_lamp: 1, i_vase: 1 };
  // One made over: a pair, the threshold kept where it was; glass in aluminium.
  function frontDoor(d, head) {
    var t = (d.turn || 0) * Math.PI / 180;
    if (d.kind === "i_door") {
      // the threshold kept where it is, the pair as wide as two
      var hh = d.h / 2, thx = d.x - Math.sin(t) * hh, thy = d.y + Math.cos(t) * hh;
      var probe = { kind: "i_door2", text: "", x: 0, y: 0, w: 140, h: 46 };
      measure(probe);
      d.kind = "i_door2"; d.w = probe.w; d.h = probe.h; d.own = false;
      d.x = Math.round(thx + Math.sin(t) * d.h / 2); d.y = Math.round(thy - Math.cos(t) * d.h / 2);
    }
    d.dd = Object.assign({}, d.dd || {}, { st: "storefront", hd: "pull", mt: "chrome" });
    d.head = head;
    // what the pair now swings into, put against another wall of its room
    // (a lobby's plant, a boutique's mirror)
    hand.nodes.filter(function (p) {
      return p !== d && ICONS[p.kind] && !isArea(p.kind) && p.kind !== "i_room" && p.kind !== "i_floor" && p.kind !== "i_lot" &&
             !WALK_DOORS[p.kind] && p.kind !== "i_window" && !FROM_CEILING[p.kind] && !LIES_FLAT[p.kind] && boxesTouch(d, p, 2);
    }).forEach(function (p) {
      var room = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, p.x, p.y); })[0];
      hand.nodes = hand.nodes.filter(function (n) { return n !== p; });
      // (what only dresses the room goes; a piece that is wanted, against another wall)
      if (FRONT_DRESSING[p.kind] && p.kind !== "i_floormirror") { return; }
      if (!room || typeof starterAlong !== "function") { return; }
      // (each wall in turn, kept only where it shuts nobody off from anything)
      var b = tieBox(room), boxedBefore = typeof boxedPieces === "function" ? boxedPieces(walkPlan()).length : 0;
      [{ x: b.l, y: room.y }, { x: b.r, y: room.y }, { x: room.x, y: b.t }, { x: b.l, y: b.t }, { x: b.r, y: b.t }, { x: room.x, y: room.y }].some(function (near) {
        var put = starterAlong(room, p.kind, near);
        if (!put) { return false; }
        put();
        var moved = hand.nodes[hand.nodes.length - 1];
        if (typeof boxedPieces === "function" && boxedPieces(walkPlan()).length > boxedBefore) { hand.nodes.pop(); return false; }
        if (moved && p.text) { moved.text = p.text; }
        return true;
      });
    });
  }
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var out = yield* inner(want);
      try {
        var type = want.type || "house";
        if (type !== "house" && type !== "tower") {
          frontRedo((starterLast || []).map(function (o) { return o.room; }).filter(Boolean), type);
        }
      } catch (e) { if (window.console && console.warn) { console.warn("fronts:", e && e.message); } }
      return out;
    });
  }
