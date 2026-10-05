// ---------------------------------------------------------------------------
//  39-join.js -- rooms joined by arrows in a floor plan: spread out on the
//  paper, put together in 3D with a door between each
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-01: "make sure in the designing mode the rooms are
  // properly connected to one another automatically along with doors with
  // those same connector arrows too and when you go to 3d mode they appear
  // connected but in 2d they can be more spaced out")
  //
  // A floor plan can be drawn the way one is first thought out: a box for
  // each room, spread out on the paper, and an arrow from each to the rooms
  // it opens into -- or to a door drawn on its own, joined by its arrows to
  // the rooms on either side of it.  The arrows come by themselves: a room
  // added after another is joined to it, a door put down near rooms to
  // them, and two rooms that met at a door and are pulled apart keep an
  // arrow between them.  Pushed together again, the arrow becomes a door.
  //
  // In 3D the house is put together.  Each room joined by an arrow slides
  // up against the room it is joined to, a door in the wall they share,
  // and lies spread out again as it goes back down flat onto the paper.
  // Walking round it in 2D, Run follows the arrows.
  var TIE_NEED = 60;         // the wall two joined rooms share at least (1.2 m): room for a door
  var TIE_TOUCH = 3;         // as near as two rooms come and still touch
  var TIE_DOOR = 900000;     // a door 3D puts where an arrow had none: this and the arrow's number
  var TIE_NEAR = 200;        // how far off (4 m) a new room or door is joined up by itself

  function tieHome() {
    return byHand && typeof boardName === "function" && boardName() === "home";
  }
  // What an arrow in a floor plan may join: rooms, the doors and windows
  // between them and out of them, and stairs to the floor above.
  function tieable(n) {
    return !!n && (n.kind === "i_room" || !!WALK_DOORS[n.kind] || n.kind === "i_window" || !!BETWEEN_FLOORS[n.kind]);
  }
  function tieOpening(n) { return !!n && (!!WALK_DOORS[n.kind] || n.kind === "i_window"); }
  function tieAllowed(a, b) {
    if (!a || !b) { return true; }
    var ra = a.kind === "i_room", rb = b.kind === "i_room";
    return (ra && rb) || (ra && tieOpening(b)) || (rb && tieOpening(a)) ||
           (!!BETWEEN_FLOORS[a.kind] && !!BETWEEN_FLOORS[b.kind]);
  }
  function tieSquare(n) { return !((n.turn || 0) % 90); }
  function tieBox(n, dx, dy) {
    var t = turned(n), x = n.x + (dx || 0), y = n.y + (dy || 0);
    return { l: x - t.w / 2, r: x + t.w / 2, t: y - t.h / 2, b: y + t.h / 2, x: x, y: y };
  }
  // Whether two boxes cover more than `gap` of each other both ways (a
  // gap under nought: whether they come within that much).
  function tieOver(p, q, gap) {
    return Math.min(p.r, q.r) - Math.max(p.l, q.l) > gap && Math.min(p.b, q.b) - Math.max(p.t, q.t) > gap;
  }
  function tieIn(b, x, y) { return x > b.l + 0.5 && x < b.r - 0.5 && y > b.t + 0.5 && y < b.b - 0.5; }
  // The wall two boxes share where they touch: its line, which way it
  // runs, the stretch of it they both have, and which side of it the
  // second box is on (+1 under it or to its right).
  function tieWall(p, q) {
    var x = Math.min(p.r, q.r) - Math.max(p.l, q.l), y = Math.min(p.b, q.b) - Math.max(p.t, q.t);
    var across = { lo: Math.max(p.l, q.l), hi: Math.min(p.r, q.r), across: true };
    var down = { lo: Math.max(p.t, q.t), hi: Math.min(p.b, q.b), across: false };
    if (x > 0 && Math.abs(p.b - q.t) <= TIE_TOUCH) { across.line = (p.b + q.t) / 2; across.into = 1; return across; }
    if (x > 0 && Math.abs(q.b - p.t) <= TIE_TOUCH) { across.line = (q.b + p.t) / 2; across.into = -1; return across; }
    if (y > 0 && Math.abs(p.r - q.l) <= TIE_TOUCH) { down.line = (p.r + q.l) / 2; down.into = 1; return down; }
    if (y > 0 && Math.abs(q.r - p.l) <= TIE_TOUCH) { down.line = (q.r + p.l) / 2; down.into = -1; return down; }
    return null;
  }
  // A box's four walls, each with the way into the box from it.
  function tieSides(b) {
    return [{ name: "top", across: true, line: b.t, lo: b.l, hi: b.r, into: 1 },
            { name: "foot", across: true, line: b.b, lo: b.l, hi: b.r, into: -1 },
            { name: "left", across: false, line: b.l, lo: b.t, hi: b.b, into: 1 },
            { name: "right", across: false, line: b.r, lo: b.t, hi: b.b, into: -1 }];
  }
  // A door (or a window) set into a wall at `along`, opening the `into` way,
  // as snapToWalls (03-icons.js) sets one: a swinging door's threshold on
  // the line, its leaf turned to swing that way; anything else in the
  // middle of the wall (of half a wall T thick, for one room's own wall).
  function tieSet(d, wall, along, into, T) {
    var swing = SNAP_IN_WALL[d.kind] === "swing";
    var at = Math.max(wall.lo + d.w / 2 + 2, Math.min(wall.hi - d.w / 2 - 2, along));
    if (wall.hi - wall.lo < d.w + 4) { at = (wall.lo + wall.hi) / 2; }
    var off = swing ? wall.line + into * d.h / 2 : wall.line + (T ? into * T / 2 : 0);
    if (wall.across) { return { x: at, y: off, turn: swing ? (into > 0 ? 180 : 0) : 0 }; }
    return { x: off, y: at, turn: swing ? (into > 0 ? 90 : 270) : 90 };
  }
  // Whether a door, moved by dx, dy, stands in a wall, along it.
  function tieInWall(d, dx, dy, wall) {
    var q = (((d.turn || 0) % 180) + 180) % 180, along = wall.across ? q === 0 : q === 90;
    if (!along || (d.turn || 0) % 90) { return false; }
    var x = d.x + dx, y = d.y + dy, off = Math.abs((wall.across ? y : x) - wall.line);
    var at = wall.across ? x : y;
    return off <= (SNAP_IN_WALL[d.kind] === "swing" ? d.h / 2 + 6 : 10) && at > wall.lo + 4 && at < wall.hi - 4;
  }
  // How far apart two boxes are (nought where they touch or cover).
  function tieGap(p, q) {
    var dx = Math.max(0, p.l - q.r, q.l - p.r), dy = Math.max(0, p.t - q.b, q.t - p.b);
    return Math.hypot(dx, dy);
  }
  function tieNearest(box, rooms, most) {
    return rooms.map(function (r) { return { r: r, d: tieGap(box, tieBox(r)) }; })
      .filter(function (o) { return o.d <= most; })
      .sort(function (p, q) { return p.d - q.d; })
      .map(function (o) { return o.r; });
  }
  // Whether a door (or a window, or a picture) is in a room's wall: only
  // looked into for a room it is near, which is few of a big house's.
  function tieWalled(d, r) { return tieGap(tieBox(d), tieBox(r)) <= 12 && doorIn(d, r); }
  // The room something is in, or the room itself.
  function tieRoomOf(n) {
    if (!n) { return null; }
    if (n.kind === "i_room") { return n; }
    var best = null;
    hand.nodes.forEach(function (r) {
      if (r.kind === "i_room" && insideArea(r, n.x, n.y) && (!best || r.w * r.h < best.w * best.h)) { best = r; }
    });
    return best;
  }
  // Whether two rooms are joined by an arrow already: one to the other, or
  // both to the same door.
  function tieLinked(a, b) {
    function ends(l, p, q) { return (l.from === p && l.to === q) || (l.from === q && l.to === p); }
    if (hand.links.some(function (l) { return ends(l, a.id, b.id); })) { return true; }
    return hand.nodes.some(function (d) {
      return tieOpening(d) && hand.links.some(function (l) { return ends(l, a.id, d.id); }) &&
             hand.links.some(function (l) { return ends(l, b.id, d.id); });
    });
  }

  // ---- the house put together ------------------------------------------------
  // Worked out from the drawing as it is: where every room joined by an
  // arrow goes to meet the room it is joined to, what goes with it, and
  // the doors -- moved into the walls the rooms share, or made where an
  // arrow had none.  `moves` are where things end up, `made` the doors
  // made, `drop` the arrows the joining says all of, `delta` how far each
  // room goes, and `boxes` where every room is, put together.
  var tieSeen = { H: null, key: null, J: null };
  function tieKey(H) {
    var h = 0;
    H.nodes.forEach(function (n) {
      h = (h * 31 + n.id * 7 + n.x * 13 + n.y * 17 + n.w * 3 + n.h * 5 + (n.turn || 0) * 11 +
           n.kind.length * 19 + String(n.text || "").length * 23 + (n.ceil || 0) * 29) % 1000000007;
    });
    H.links.forEach(function (l) { h = (h * 31 + (+l.from || 0) * 7 + (+l.to || 0) * 11) % 1000000007; });
    return H.nodes.length + "|" + H.links.length + "|" + h;
  }
  var tieHeld = null;                    // a layout kept as it is while a house is furnished (39-starter.js)
  function tieLayout() {
    if (tieHeld) { return tieHeld; }
    var key = tieKey(hand);
    if (tieSeen.H === hand && tieSeen.key === key) { return tieSeen.J; }
    var J;
    try { J = tieWork(); } catch (e) { J = { moves: {}, made: [], drop: [], delta: {}, boxes: {}, rooms: [], ways: [], any: false }; }
    tieSeen = { H: hand, key: key, J: J };
    return J;
  }

  // Where an arrow between two rooms says the one goes, put together with
  // the other placed at `pb`: its `fit`, the middle of the room it goes to
  // from the middle of the room it comes from (Start a house sets it, for a
  // house laid out as it was meant).  Null where it says nothing.
  function tieFit(e, r, pb) {
    var fit = e.link && !e.door && e.link.fit;
    if (!fit || fit.length !== 2) { return null; }
    if (r === e.b) { return [pb.x + fit[0], pb.y + fit[1]]; }
    if (r === e.a) { return [pb.x - fit[0], pb.y - fit[1]]; }
    return null;
  }

  function tieWork() {
    var J = { moves: {}, made: [], drop: [], delta: {}, boxes: {}, rooms: [], ways: [], any: false };
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && tieSquare(n); });
    J.rooms = rooms;
    rooms.forEach(function (r) { J.boxes[r.id] = tieBox(r); J.delta[r.id] = [0, 0]; });
    if (!hand.links.length || !rooms.length) { return J; }
    var floors = floorsOf();
    function storey(n) { var f = floorAt(floors, n.x, n.y); return f ? f.n.id : 0; }
    function storeyNode(id) { return id ? nodeById(id) : null; }
    var isRoom = {};
    rooms.forEach(function (r) { isRoom[r.id] = r; });

    // Rooms that are together already -- side by side, or one in another --
    // go as one.
    var up = {};
    function top(id) { while (up[id] !== id) { id = up[id]; } return id; }
    rooms.forEach(function (r) { up[r.id] = r.id; });
    for (var i = 0; i < rooms.length; i++) {
      for (var j = i + 1; j < rooms.length; j++) {
        var a = rooms[i], b = rooms[j];
        if (storey(a) === storey(b) && tieOver(J.boxes[a.id], J.boxes[b.id], -TIE_TOUCH)) { up[top(a.id)] = top(b.id); }
      }
    }
    // What goes with each room: what stands in it, and what is set in its walls.
    var owner = {};
    hand.nodes.forEach(function (n) {
      if (n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot") { return; }
      var best = null;
      if (SNAP_IN_WALL[n.kind]) { rooms.forEach(function (r) { if (!best && tieWalled(n, r)) { best = r; } }); }
      if (!best) {
        rooms.forEach(function (r) {
          if (insideArea(r, n.x, n.y) && (!best || r.w * r.h < best.w * best.h)) { best = r; }
        });
      }
      // out of doors, right up against a room -- the drive to a garage's
      // door, a patio off the living room -- it goes with that room too
      if (!best && !isArea(n.kind)) {
        var nb = tieBox(n), near = 41;
        rooms.forEach(function (r) {
          var d = tieGap(nb, J.boxes[r.id]);
          if (d < near) { near = d; best = r; }
        });
      }
      if (best && !(isArea(n.kind) && n.w * n.h >= best.w * best.h)) { owner[n.id] = best.id; }
    });

    // What the arrows join: two rooms, a door and the rooms either side of
    // it, or a room and a door (or window) out of it.
    var pairs = [], outs = [], openings = {};
    hand.links.forEach(function (l) {
      var a = nodeById(l.from), b = nodeById(l.to);
      if (!a || !b || a === b) { return; }
      if (isRoom[a.id] && isRoom[b.id]) {
        if (storey(a) === storey(b)) { pairs.push({ a: a, b: b, link: l, door: null }); J.drop.push(l); }
      } else if (isRoom[a.id] && tieOpening(b)) {
        (openings[b.id] = openings[b.id] || { d: b, ends: [] }).ends.push({ room: a, link: l, into: false });
      } else if (isRoom[b.id] && tieOpening(a)) {
        (openings[a.id] = openings[a.id] || { d: a, ends: [] }).ends.push({ room: b, link: l, into: true });
      }
    });
    Object.keys(openings).forEach(function (k) {
      var it = openings[k], d = it.d, by = [];
      it.ends.forEach(function (e) { if (by.indexOf(e.room) < 0) { by.push(e.room); } J.drop.push(e.link); });
      var walls = rooms.filter(function (r) { return tieWalled(d, r); });
      walls.forEach(function (r) { if (by.indexOf(r) < 0) { by.push(r); } });
      if (WALK_DOORS[d.kind] && by.length >= 2 && storey(by[0]) === storey(by[1])) {
        // it opens into the room an arrow goes to from it, or the second
        var into = it.ends.filter(function (e) { return e.into; })[0];
        var b = into ? into.room : by[1], a = by[0] === b ? by[1] : by[0];
        pairs.push({ a: a, b: b, link: it.ends[0].link, door: d });
      } else if (!walls.length && by.length) {
        outs.push({ room: by[0], d: d });
      }
    });
    // Two rooms an arrow joins, one with a door in the wall that faces the
    // other and leads nowhere else -- pulled apart from it, say: that door.
    var spoken = {};
    pairs.forEach(function (p) { if (p.door) { spoken[p.door.id] = true; } });
    outs.forEach(function (o) { spoken[o.d.id] = true; });
    pairs.forEach(function (p) {
      if (p.door) { return; }
      var best = null, bestDot = 0.5;
      hand.nodes.forEach(function (d) {
        if (!WALK_DOORS[d.kind] || spoken[d.id]) { return; }
        var by = rooms.filter(function (r) { return tieWalled(d, r); });
        if (by.length !== 1 || (by[0] !== p.a && by[0] !== p.b)) { return; }
        var mine = by[0], other = mine === p.a ? p.b : p.a;
        var ox = d.x - mine.x, oy = d.y - mine.y, tx = other.x - mine.x, ty = other.y - mine.y;
        var dot = (ox * tx + oy * ty) / ((Math.hypot(ox, oy) || 1) * (Math.hypot(tx, ty) || 1));
        if (dot > bestDot) { bestDot = dot; best = d; }
      });
      if (best) { p.door = best; spoken[best.id] = true; }
    });

    // Each lot of rooms that go as one, and the arrows between them.
    var groups = {};
    rooms.forEach(function (r) {
      var g = top(r.id);
      if (!groups[g]) { groups[g] = { id: g, rooms: [], area: 0, storey: storey(r), dx: 0, dy: 0, placed: false }; }
      groups[g].rooms.push(r);
      groups[g].area += r.w * r.h;
    });
    function groupOf(n) { return groups[top(n.id)]; }
    var edges = pairs.filter(function (p) { return groupOf(p.a) !== groupOf(p.b); });
    // Openings that look out: a window, or a door to the garden -- kept on
    // walls with nothing against them, where that can be done.
    var looks = [];
    hand.nodes.forEach(function (d) {
      if (d.facade) { return; }            // (a building's windows in rows follow where it is put together: below)
      if (!tieOpening(d) || owner[d.id] === undefined || (WALK_DOORS[d.kind] && spoken[d.id])) { return; }
      var r = isRoom[owner[d.id]];
      if (!r || !doorIn(d, r)) { return; }
      var b = J.boxes[r.id], best = null, near = Infinity;
      tieSides(b).forEach(function (s) {
        var off = Math.abs((s.across ? d.y : d.x) - s.line);
        if (off < near) { near = off; best = s; }
      });
      var px = best.across ? d.x : best.line - best.into * 12, py = best.across ? best.line - best.into * 12 : d.y;
      looks.push({ g: groupOf(r), x: px, y: py });
    });
    // (2026-10-05) A tall building's windows laid out again in rows (40-facade.js) follow where
    // the building is put together; what leads it is still where each room's first windows
    // were, kept on the room (fcLooks: from its middle) -- else the rows moved the rooms about.
    rooms.forEach(function (r) {
      (r.fcLooks || []).forEach(function (q) {
        var b = J.boxes[r.id], best = null, near = Infinity, x = r.x + q[0], y = r.y + q[1];
        tieSides(b).forEach(function (s) {
          var off = Math.abs((s.across ? y : x) - s.line);
          if (off < near) { near = off; best = s; }
        });
        if (!best) { return; }
        looks.push({ g: groupOf(r), x: best.across ? x : best.line - best.into * 12, y: best.across ? best.line - best.into * 12 : y });
      });
    });

    // Placed: the biggest lot where it is, then each joined to it, the one
    // with most arrows to what is placed first.
    var all = Object.keys(groups).map(function (k) { return groups[k]; });
    function boxesOf(g, dx, dy) { return g.rooms.map(function (r) { return tieBox(r, dx, dy); }); }
    var slanted = hand.nodes.filter(function (n) { return n.kind === "i_room" && !tieSquare(n); })
      .map(function (n) { return { b: tieBox(n), storey: storey(n) }; });
    function clashes(g, dx, dy) {
      var mine = boxesOf(g, dx, dy), floor = storeyNode(g.storey);
      if (floor && mine.some(function (b) { return !insideArea(floor, b.x, b.y); })) { return true; }
      if (slanted.some(function (s) { return s.storey === g.storey && mine.some(function (b) { return tieOver(b, s.b, 1); }); })) { return true; }
      return all.some(function (o) {
        if (o === g || o.storey !== g.storey) { return false; }
        // (not one still to come to this house, where it is drawn: it is
        // going to be put somewhere else -- and it was in the way of where
        // the rooms of a house spread out go)
        if (!o.placed && o.set !== undefined && o.set === g.set) { return false; }
        var theirs = boxesOf(o, o.dx, o.dy);
        return mine.some(function (b) { return theirs.some(function (c) { return tieOver(b, c, 1); }); });
      });
    }
    function linksTo(g) {
      return edges.filter(function (e) {
        var ga = groupOf(e.a), gb = groupOf(e.b);
        return (ga === g && gb.placed) || (gb === g && ga.placed);
      });
    }
    function need(p, q) { return Math.min(TIE_NEED, p - 0.5, q - 0.5); }
    function choose(g) {
      var mine = linksTo(g), tries = [];
      mine.forEach(function (e) {
        var r = groupOf(e.a) === g ? e.a : e.b, p = r === e.a ? e.b : e.a, pg = groupOf(p);
        var pb = tieBox(p, pg.dx, pg.dy), rb = tieBox(r), rw = rb.r - rb.l, rh = rb.b - rb.t;
        // where the door between them is to be, along the wall, if it is
        // one of theirs already: kept in what they share
        var d = e.door, dAt = null;
        if (d && owner[d.id] !== undefined && isRoom[owner[d.id]]) {
          var dg = groupOf(isRoom[owner[d.id]]);
          dAt = { x: d.x + (dg === g ? 0 : dg.dx), y: d.y + (dg === g ? 0 : dg.dy), mine: dg === g };
        }
        [["right", 1, 0], ["left", -1, 0], ["foot", 0, 1], ["top", 0, -1]].forEach(function (side) {
          var flank = side[1] !== 0, x, y, list = [];
          if (flank) {
            x = side[1] > 0 ? pb.r + rw / 2 : pb.l - rw / 2;
            var nh = need(rh, pb.b - pb.t), lo = pb.t + nh - rh / 2, hi = pb.b - nh + rh / 2;
            if (lo > hi) { return; }
            // lined up with it at the top or the foot, in the middle, or
            // where it was beside it on the paper
            list = [pb.t + rh / 2, pb.b - rh / 2, pb.y, pb.y + (r.y - p.y)];
            if (dAt) { list.push(dAt.mine ? pb.y + (r.y - dAt.y) : dAt.y); }
            list.forEach(function (v) { tries.push({ dx: x - r.x, dy: Math.max(lo, Math.min(hi, v)) - r.y }); });
          } else {
            y = side[2] > 0 ? pb.b + rh / 2 : pb.t - rh / 2;
            var nw = need(rw, pb.r - pb.l), lo2 = pb.l + nw - rw / 2, hi2 = pb.r - nw + rw / 2;
            if (lo2 > hi2) { return; }
            list = [pb.l + rw / 2, pb.r - rw / 2, pb.x, pb.x + (r.x - p.x)];
            if (dAt) { list.push(dAt.mine ? pb.x + (r.x - dAt.x) : dAt.x); }
            list.forEach(function (v) { tries.push({ dx: Math.max(lo2, Math.min(hi2, v)) - r.x, dy: y - r.y }); });
          }
        });
        // where the arrow says the two go together, where it says (a house
        // Start a house laid out: `fit`, the one's middle from the other's)
        var fit = tieFit(e, r, pb);
        if (fit) { tries.push({ dx: fit[0] - r.x, dy: fit[1] - r.y }); }
      });
      var best = null;
      tries.forEach(function (c) {
        if (clashes(g, c.dx, c.dy)) { return; }
        var cost = 0;
        mine.forEach(function (e) {
          var r = groupOf(e.a) === g ? e.a : e.b, p = r === e.a ? e.b : e.a, pg = groupOf(p);
          var rb = tieBox(r, c.dx, c.dy), pb = tieBox(p, pg.dx, pg.dy), w = tieWall(pb, rb);
          var rt = turned(r), pt = turned(p), crosswise = w && !w.across ? [rt.h, pt.h] : [rt.w, pt.w];
          if (w && w.hi - w.lo >= need(crosswise[0], crosswise[1]) - 0.5) {
            cost -= 1000;
            // and with its door in what they share, where it is one of theirs
            if (e.door && owner[e.door.id] !== undefined) {
              var dg = groupOf(isRoom[owner[e.door.id]] || r);
              if (tieInWall(e.door, dg === g ? c.dx : dg.dx, dg === g ? c.dy : dg.dy, w)) { cost -= 400; }
            }
          }
          // lying the way it lies from it on the paper
          var was = Math.atan2(r.y - p.y, r.x - p.x), now = Math.atan2(rb.y - pb.y, rb.x - pb.x);
          cost += Math.abs(Math.atan2(Math.sin(now - was), Math.cos(now - was))) * 60;
          // just where the arrow says, where it says (less than a room
          // dragged round to another side of it on the paper counts for)
          var fit = tieFit(e, r, pb);
          if (fit && Math.abs(rb.x - fit[0]) < 1 && Math.abs(rb.y - fit[1]) < 1) { cost -= 100; }
          // edges lined up look like a house
          if (Math.abs(rb.l - pb.l) < 0.5 || Math.abs(rb.r - pb.r) < 0.5 || Math.abs(rb.t - pb.t) < 0.5 || Math.abs(rb.b - pb.b) < 0.5) { cost -= 5; }
        });
        // a window or a way out to the garden walled over
        var mineBoxes = boxesOf(g, c.dx, c.dy);
        looks.forEach(function (o) {
          if (o.g === g) {
            var x = o.x + c.dx, y = o.y + c.dy;
            if (all.some(function (q) { return q !== g && q.placed && q.storey === g.storey &&
                                                boxesOf(q, q.dx, q.dy).some(function (b) { return tieIn(b, x, y); }); })) { cost += 150; }
          } else if (o.g.placed && o.g.storey === g.storey) {
            var ox = o.x + o.g.dx, oy = o.y + o.g.dy;
            if (mineBoxes.some(function (b) { return tieIn(b, ox, oy); })) { cost += 150; }
          }
        });
        cost += Math.hypot(c.dx, c.dy) * 0.001;
        if (!best || cost < best.cost) { best = { dx: c.dx, dy: c.dy, cost: cost }; }
      });
      return best;
    }
    // each set of lots joined to each other, the biggest set first
    var seen = {}, sets = [];
    all.forEach(function (g) {
      if (seen[g.id]) { return; }
      var set = [], todo = [g];
      seen[g.id] = true;
      while (todo.length) {
        var at = todo.pop();
        set.push(at);
        edges.forEach(function (e) {
          var ga = groupOf(e.a), gb = groupOf(e.b), other = ga === at ? gb : gb === at ? ga : null;
          if (other && !seen[other.id]) { seen[other.id] = true; todo.push(other); }
        });
      }
      if (set.length > 1) { sets.push(set); }
    });
    function areaOf(set) { return set.reduce(function (s, g) { return s + g.area; }, 0); }
    sets.sort(function (p, q) { return areaOf(q) - areaOf(p); });
    // the one the rest open off -- a hall, the living room -- stays, and the
    // rest come to it: begun from the biggest (a garage, as often as not),
    // the house folded round it and left rooms with no outside wall
    function degree(g) { return edges.filter(function (e) { return groupOf(e.a) === g || groupOf(e.b) === g; }).length; }
    sets.forEach(function (set, k) { set.forEach(function (g) { g.set = k; }); });
    sets.forEach(function (set) {
      set.sort(function (p, q) { return degree(q) - degree(p) || q.area - p.area; });
      set[0].placed = true;
      var left = set.slice(1);
      while (left.length) {
        left.sort(function (p, q) { return linksTo(q).length - linksTo(p).length || q.area - p.area; });
        var g = left.shift(), best = linksTo(g).length ? choose(g) : null;
        if (best) { g.dx = best.dx; g.dy = best.dy; }
        g.placed = true;
      }
      // Rooms of much the same size all drawn apart come together round
      // where they were, not round the biggest; a house drawn mostly
      // together has the rest come to it.
      if (set[0].area < areaOf(set) / 2) {
        var cx = 0, cy = 0, mx = 0, my = 0, A = 0;
        set.forEach(function (g) {
          g.rooms.forEach(function (r) {
            // (a room put in over the garage, drawn wherever there was room for
            // it, has no say in where the rest come together: 40-attic.js)
            if (r.attic) { return; }
            cx += r.x * r.w * r.h; cy += r.y * r.w * r.h;
            mx += (r.x + g.dx) * r.w * r.h; my += (r.y + g.dy) * r.w * r.h;
            A += r.w * r.h;
          });
        });
        A = A || 1;
        var sx = Math.round((cx - mx) / A), sy = Math.round((cy - my) / A);
        set.forEach(function (g) { g.dx += sx; g.dy += sy; });
        if (set.some(function (g) { return clashes(g, g.dx, g.dy); })) {
          set.forEach(function (g) { g.dx -= sx; g.dy -= sy; });
        }
      }
    });

    // Everything goes with its room.
    rooms.forEach(function (r) {
      var g = groupOf(r);
      J.delta[r.id] = [g.dx, g.dy];
      J.boxes[r.id] = tieBox(r, g.dx, g.dy);
      if (g.dx || g.dy) { J.moves[r.id] = { x: r.x + g.dx, y: r.y + g.dy, turn: r.turn || 0 }; }
    });
    hand.nodes.forEach(function (n) {
      if (owner[n.id] === undefined) { return; }
      var g = groupOf(isRoom[owner[n.id]]);
      if (g.dx || g.dy) { J.moves[n.id] = { x: n.x + g.dx, y: n.y + g.dy, turn: n.turn || 0 }; }
    });
    function at(n) {                     // where a thing is now, put together
      var m = J.moves[n.id];
      return m ? { x: m.x, y: m.y, turn: m.turn } : { x: n.x, y: n.y, turn: n.turn || 0 };
    }
    var finalRooms = rooms.map(function (r) { return { r: r, b: J.boxes[r.id] }; });
    function walledOff(r, x, y) {
      return finalRooms.some(function (o) { return o.r !== r && storey(o.r) === storey(r) && tieIn(o.b, x, y); });
    }
    // A door from one to the other, in the wall they share: the one an
    // arrow went through, one of theirs already there, or else one made.
    pairs.forEach(function (p) {
      var ab = J.boxes[p.a.id], bb = J.boxes[p.b.id], w = tieWall(ab, bb);
      if (w && w.hi - w.lo < 24) { w = null; }
      if (p.door) {
        var d = p.door, now = at(d);
        if (w && tieInWall({ kind: d.kind, x: now.x, y: now.y, w: d.w, h: d.h, turn: now.turn }, 0, 0, w)) {
          J.ways.push({ a: p.a, b: p.b, door: d, x: now.x, y: now.y });
          return;
        }
        if (w) {
          var along = (w.lo + w.hi) / 2;
          if (owner[d.id] !== undefined) { along = w.across ? now.x : now.y; }
          J.moves[d.id] = tieSet(d, w, along, w.into, 0);
          J.ways.push({ a: p.a, b: p.b, door: d, x: J.moves[d.id].x, y: J.moves[d.id].y });
          return;
        }
        outs.push({ room: p.a, d: d, toward: p.b });
        return;
      }
      if (!w) { return; }
      var there = null;
      hand.nodes.some(function (d) {
        if (!WALK_DOORS[d.kind]) { return false; }
        var n = at(d);
        if (tieInWall({ kind: d.kind, x: n.x, y: n.y, w: d.w, h: d.h, turn: n.turn }, 0, 0, w)) { there = n; }
        return !!there;
      });
      if (there) { J.ways.push({ a: p.a, b: p.b, door: null, x: there.x, y: there.y }); return; }
      if (w.hi - w.lo < 34) { return; }
      // (one room in two rectangles, 40-oddrooms.js: the way through is the whole of it, no door)
      if (typeof oddOne === "function" && oddOne(p.a, p.b)) {
        J.ways.push({ a: p.a, b: p.b, door: null, x: w.across ? (w.lo + w.hi) / 2 : w.line, y: w.across ? w.line : (w.lo + w.hi) / 2 });
        return;
      }
      var made = { id: TIE_DOOR + (p.link.id || hand.links.indexOf(p.link) + 1), kind: "i_door", text: "",
                   w: Math.min(50, w.hi - w.lo - 4), h: 50, made: true };
      var spot = tieSet(made, w, (w.lo + w.hi) / 2, w.into, 0);
      made.x = spot.x; made.y = spot.y; made.turn = spot.turn;
      J.made.push({ node: made, ride: p.b.id });
      J.ways.push({ a: p.a, b: p.b, door: null, x: made.x, y: made.y });
    });
    // A door or a window out of a room, set in the wall that faces where
    // it is drawn (or the room it was to lead to), with nothing against it.
    outs.forEach(function (o) {
      var r = o.room, b = J.boxes[r.id], d = o.d;
      var aimX = o.toward ? o.toward.x - r.x : d.x - r.x, aimY = o.toward ? o.toward.y - r.y : d.y - r.y;
      var hw = (b.r - b.l) / 2 || 1, hh = (b.b - b.t) / 2 || 1;
      var sides = tieSides(b).map(function (s) {
        var nx = s.across ? 0 : -s.into, ny = s.across ? -s.into : 0;
        return { s: s, face: (aimX * nx) / hw + (aimY * ny) / hh };
      }).sort(function (p, q) { return q.face - p.face; });
      var T = roomWallOf(r), dx = b.x - r.x, dy = b.y - r.y;
      for (var k = 0; k < sides.length; k++) {
        var s = sides[k].s, along = s.across ? d.x + dx : d.y + dy;
        if (o.toward) { along = s.across ? o.toward.x + J.delta[o.toward.id][0] : o.toward.y + J.delta[o.toward.id][1]; }
        // the longest stretch of this wall with nothing against it, and the
        // door well inside it: by a corner another room comes to, a door
        // was in that room's wall too, and went nowhere outside
        var best = null, run = null;
        for (var at = s.lo; at <= s.hi + 0.1; at += 5) {
          var qx = s.across ? at : s.line - s.into * 12, qy = s.across ? s.line - s.into * 12 : at;
          if (!walledOff(r, qx, qy)) {
            if (!run) { run = { lo: at, hi: at }; } else { run.hi = at; }
            if (!best || run.hi - run.lo > best.hi - best.lo) { best = { lo: run.lo, hi: run.hi }; }
          } else { run = null; }
        }
        if ((!best || best.hi - best.lo < d.w + 16) && k < sides.length - 1) { continue; }
        if (best && best.hi - best.lo >= d.w + 16) {
          along = Math.max(best.lo + d.w / 2 + 8, Math.min(best.hi - d.w / 2 - 8, along));
        }
        J.moves[d.id] = tieSet(d, s, along, s.into, WALK_DOORS[d.kind] && SNAP_IN_WALL[d.kind] === "swing" ? 0 : T);
        J.ways.push({ a: r, b: o.toward || null, door: d, x: J.moves[d.id].x, y: J.moves[d.id].y });
        break;
      }
    });
    J.any = Object.keys(J.moves).length > 0 || J.made.length > 0;
    return J;
  }

  // The drawing put together the part of the way `t` is (0 as drawn, 1 put
  // together): a copy, where only what moves is new -- the rest are the
  // drawing's own shapes -- with the doors made, and without the arrows
  // the joining has said all of.  Null where nothing moves.
  var tieMade = { H: null, key: null, hand: null, pairs: [] };
  function tieHand(t) {
    var J = tieLayout();
    if (!J.any || t <= 0.001) { return null; }
    var key = tieSeen.key + "|" + Math.round(t * 1000);
    if (tieMade.H === hand && tieMade.key === key) {
      // (once a picture -- asked dozens of times making one, 2026-10-04: "a stable 60fps")
      // (and then only after an edit -- a step kept to undo -- or a fifth of a second on)
      var stamp = typeof V3 !== "undefined" && V3 && V3.last ? V3.last : -1;
      var mark = typeof v3qEditMark === "function" ? v3qEditMark() : stamp;
      if (stamp < 0 || (tieMade.freshAt !== stamp && (tieMade.mark !== mark || stamp - (tieMade.freshT || 0) > 200))) {
        tieMade.freshAt = stamp; tieMade.mark = mark; tieMade.freshT = stamp;
        tieMade.pairs.forEach(tieFresh);
        // and what is the drawing's as a whole (the house's settings, 39-house.js)
        for (var top in hand) { if (top !== "nodes" && top !== "links") { tieMade.hand[top] = hand[top]; } }
      }
      return tieMade.hand;
    }
    var H = hand, k = Math.min(1, t), pairs = [];
    var nodes = H.nodes.map(function (n) {
      var m = J.moves[n.id];
      if (!m) { return n; }
      var c = Object.assign({}, n), a = n.turn || 0, b = m.turn || 0;
      pairs.push([c, n]);
      c.x = n.x + (m.x - n.x) * k; c.y = n.y + (m.y - n.y) * k;
      var turn = a + ((((b - a) % 360) + 540) % 360 - 180) * k;
      turn = ((turn % 360) + 360) % 360;
      if (turn > 0.01 && turn < 359.99) { c.turn = turn; } else { delete c.turn; }
      return c;
    });
    if (t > 0.02) {
      J.made.forEach(function (one) {
        var c = Object.assign({}, one.node), d = J.delta[one.ride] || [0, 0];
        c.x -= d[0] * (1 - k); c.y -= d[1] * (1 - k);
        nodes.push(c);
      });
    }
    var made = Object.assign({}, H, { nodes: nodes, links: H.links.filter(function (l) { return J.drop.indexOf(l) < 0; }) });
    tieMade = { H: H, key: key, hand: made, pairs: pairs };
    return made;
  }
  // A copy keeps up with whatever changes on its shape without moving it:
  // a material, a finish, a color picked while looking at the house in 3D
  // (the copy above is only made again when something moves).
  var TIE_OWN = { x: 1, y: 1, turn: 1 };
  function tieFresh(p) {
    var c = p[0], n = p[1], k;
    for (k in n) { if (!TIE_OWN[k] && c[k] !== n[k]) { c[k] = n[k]; } }
    for (k in c) { if (!TIE_OWN[k] && !(k in n)) { delete c[k]; } }
  }

  // Whether a spot just outside a room's wall is inside another room once
  // the house is put together -- a wall that is not outside, in 3D, for a
  // window or a way out (38-advice.js).
  function tieCovers(room, x, y) {
    if (!tieHome()) { return false; }
    var J = tieLayout();
    if (!J.any) { return false; }
    var d = J.delta[room.id] || [0, 0], px = x + d[0], py = y + d[1];
    return J.rooms.some(function (o) { return o !== room && tieIn(J.boxes[o.id], px, py); });
  }

  // ---- 3D, looking at it put together ------------------------------------------
  // The 3D view (38-view3d.js, 38-view3d-gl.js, 38-walk.js) reads the plan
  // from `hand`; while it works, `hand` is the drawing put together as far
  // as the walls have risen -- all the way walking round inside it, not at
  // all lying flat on the paper -- and the drawing itself again after.
  var tieUnder = [];                     // the hands put aside meanwhile, the drawing's own first
  function tieReal() { return tieUnder.length ? tieUnder[0] : hand; }
  function tieT() {
    if (typeof V3 === "undefined" || !V3) { return 1; }
    if (V3.scene === "space") { return 0; }
    if (V3.mode === "walk") { return 1; }
    if (V3.flat && V3.flatDone) { return 0; }
    return Math.max(0, Math.min(1, V3.rise === undefined ? 1 : V3.rise));
  }
  function tieWith(fn, when) {
    return function () {
      var real = tieReal(), t = when === undefined ? tieT() : typeof when === "function" ? when() : when;
      var want = real;
      if (t > 0.001) {
        var was = hand;
        hand = real;                     // worked out from the drawing itself
        try { want = tieHome() ? tieHand(t) || real : real; } finally { hand = was; }
      }
      if (want === hand) { return fn.apply(this, arguments); }
      tieUnder.push(hand);
      hand = want;
      try { return fn.apply(this, arguments); } finally { hand = tieUnder.pop(); }
    };
  }
  // Somebody walking round the drawing (Run), seen in 3D: where they are
  // in the house put together -- moved as the room they are in moves, or,
  // out between rooms on an arrow, as the rooms either side of them.
  function tieWalker(p) {
    var t = tieT();
    if (!p || t <= 0.001) { return p; }
    var was = hand;
    hand = tieReal();
    try {
      if (!tieHome()) { return p; }
      var J = tieLayout();
      if (!J.any) { return p; }
      var near = J.rooms.map(function (r) {
        return { r: r, d: tieGap({ l: p.x, r: p.x, t: p.y, b: p.y }, tieBox(r)), a: r.w * r.h };
      }).sort(function (a, b) { return a.d - b.d || a.a - b.a; });
      if (!near.length) { return p; }
      var dx, dy;
      if (near[0].d === 0 || near.length < 2) {
        var d0 = J.delta[near[0].r.id]; dx = d0[0]; dy = d0[1];
      } else {
        var a = J.delta[near[0].r.id], b = J.delta[near[1].r.id], wa = near[1].d, wb = near[0].d;
        dx = (a[0] * wa + b[0] * wb) / (wa + wb); dy = (a[1] * wa + b[1] * wb) / (wa + wb);
      }
      return Object.assign({}, p, { x: p.x + dx * t, y: p.y + dy * t });
    } finally { hand = was; }
  }
  if (typeof v3Draw === "function") {
    var v3DrawApart = v3Draw;
    v3Draw = tieWith(function () {
      var was = walkAt;
      if (walkAt && hand !== tieReal()) { walkAt = tieWalker(walkAt); }
      try { return v3DrawApart.apply(this, arguments); } finally { walkAt = was; }
    });
    v3Watch = tieWith(v3Watch);
    v3Open = tieWith(v3Open, 1);         // aimed at the house as it will stand
    v3Flat = tieWith(v3Flat, 1);
    v3FitSoon = tieWith(v3FitSoon, function () { return V3 && V3.flat ? 0 : 1; });
    v3Ground = tieWith(v3Ground, 1);     // walked round inside: put together
    v3Start = tieWith(v3Start, 1);
    v3Blocked = tieWith(v3Blocked, 1);
    v3Stairs = tieWith(v3Stairs, 1);
    v3UseDoor = tieWith(v3UseDoor, 1);
    v3Map = tieWith(v3Map, 1);
    // what is said, and put right, is said of the drawing itself
    v3Words = tieWith(v3Words, 0);
    v3AdviceShow = tieWith(v3AdviceShow, 0);
  }
  // A house on a lot is measured put together, as it will stand on it:
  // rooms drawn apart on the paper are no wider a house for it.
  if (typeof lotMeasure === "function") { lotMeasure = tieWith(lotMeasure, 1); }

  // ---- the arrows, kept in step with the plan ---------------------------------
  // A new room is joined to the room before it (the one in hand when it
  // was added, or else the nearest); a new door or window not set in a
  // wall, to the rooms near it -- a door between two rooms, to both.
  function tieNew(n, from) {
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room" && r !== n && tieSquare(r); });
    if (!rooms.length || hand.links.some(function (l) { return l.from === n.id || l.to === n.id; })) { return false; }
    var nb = tieBox(n);
    if (n.kind === "i_room") {
      // put down against another room, it is joined to it as it is
      if (rooms.some(function (r) { return tieOver(tieBox(r), nb, -TIE_TOUCH); })) { return false; }
      var to = from && from !== n && from.kind === "i_room" ? from : tieNearest(nb, rooms, TIE_NEAR)[0];
      if (!to) { return false; }
      hand.links.push({ from: to.id, to: n.id, label: "" });
      return true;
    }
    if (!tieOpening(n)) { return false; }
    // in a wall already, or in the middle of a room: where it goes is plain
    if (rooms.some(function (r) { return doorIn(n, r) || insideArea(r, n.x, n.y); })) { return false; }
    var near = tieNearest(nb, rooms, TIE_NEAR);
    if (from && from.kind === "i_room" && near.indexOf(from) > 0) { near.splice(near.indexOf(from), 1); near.unshift(from); }
    if (!near.length) { return false; }
    hand.links.push({ from: near[0].id, to: n.id, label: "" });
    if (WALK_DOORS[n.kind] && near[1]) {
      var ax = near[0].x - n.x, ay = near[0].y - n.y, bx = near[1].x - n.x, by = near[1].y - n.y;
      if (ax * bx + ay * by < 0) { hand.links.push({ from: n.id, to: near[1].id, label: "" }); }
    }
    return true;
  }

  // Each time the plan is drawn: two rooms an arrow joins, pushed together,
  // have a door in the wall between them instead; an arrow from a room to
  // a door already in its wall says nothing, and goes.
  function tieTidy() {
    var changed = false;
    hand.links = hand.links.filter(function (l) {
      var a = nodeById(l.from), b = nodeById(l.to);
      if (!a || !b) { return true; }
      if ((a.kind === "i_room" && tieOpening(b) && doorIn(b, a)) || (b.kind === "i_room" && tieOpening(a) && doorIn(a, b))) {
        changed = true;
        return false;
      }
      if (a.kind !== "i_room" || b.kind !== "i_room" || !tieSquare(a) || !tieSquare(b)) { return true; }
      var w = tieWall(tieBox(a), tieBox(b));
      if (!w || w.hi - w.lo < 34) { return true; }
      // (one room, in two rectangles, 40-oddrooms.js: no wall between, so no door in it)
      if (typeof oddOne === "function" && oddOne(a, b)) { changed = true; return false; }
      var already = hand.nodes.some(function (d) { return WALK_DOORS[d.kind] && doorIn(d, a) && doorIn(d, b); });
      if (!already) {
        var door = { id: hand.next++, kind: "i_door", text: firstWords("i_door"), x: a.x, y: a.y, w: 140, h: 46 };
        measure(door);
        door.w = Math.min(door.w, w.hi - w.lo - 4);
        var spot = tieSet(door, w, (w.lo + w.hi) / 2, w.into, 0);
        door.x = spot.x; door.y = spot.y;
        if (spot.turn) { door.turn = spot.turn; }
        hand.nodes.push(door);
      }
      changed = true;
      return false;
    });
    return changed;
  }

  // Which doors join which rooms, as a change begins: a room pulled away
  // from the room it met at a door is joined to it by an arrow instead.
  var tieWas = null;
  function tieDoors() {
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; }), out = [];
    hand.nodes.forEach(function (d) {
      if (!WALK_DOORS[d.kind]) { return; }
      var by = rooms.filter(function (r) { return tieWalled(d, r); });
      if (by.length === 2) { out.push([d.id, by[0].id, by[1].id]); }
    });
    return out;
  }
  function tieApart(ids) {
    if (!tieWas) { return false; }
    var moved = {}, added = false;
    (ids || []).forEach(function (id) { moved[id] = true; });
    tieWas.forEach(function (w) {
      var d = nodeById(w[0]), a = nodeById(w[1]), b = nodeById(w[2]);
      if (!d || !a || !b || (!moved[a.id] && !moved[b.id])) { return; }
      if (doorIn(d, a) && doorIn(d, b)) { return; }               // still a way through
      if (tieOver(tieBox(a), tieBox(b), -TIE_TOUCH)) { return; }  // still side by side
      if (tieLinked(a, b)) { return; }
      var from = moved[a.id] && !moved[b.id] ? b : a, to = from === a ? b : a;
      hand.links.push({ from: from.id, to: to.id, label: "" });
      added = true;
    });
    tieWas = null;
    return added;
  }

  if (typeof drawHand === "function") {
    var drawHandUntied = drawHand;
    drawHand = function () {
      if (!tieUnder.length && tieHome()) { tieTidy(); }
      return drawHandUntied.apply(this, arguments);
    };
  }
  if (typeof keepUndo === "function") {
    var keepUndoUntied = keepUndo;
    keepUndo = function () {
      tieWas = !tieUnder.length && tieHome() ? tieDoors() : null;
      return keepUndoUntied.apply(this, arguments);
    };
  }
  if (typeof settleClear === "function") {
    var settleClearUntied = settleClear;
    settleClear = function (ids) {
      var out = settleClearUntied.apply(this, arguments);
      if (!tieUnder.length && tieHome()) { tieApart(ids); }
      return out;
    };
  }
  // A room added (not put down anywhere in particular) on top of another --
  // put under the one in hand by how far a flowchart's step goes, which a
  // room is taller than -- is set a little way off it instead: below it,
  // or beside it, with room for the arrow between.
  var TIE_GAP = 80;
  function tieSpace(n, from) {
    var others = hand.nodes.filter(function (r) { return r !== n && r.kind === "i_room"; });
    var nb = tieBox(n);
    var over = others.filter(function (r) { return tieOver(tieBox(r), nb, 1); });
    if (!over.length) { return false; }
    var by = from && from.kind === "i_room" ? from : over[0], b = tieBox(by), t = turned(n);
    // on the same floor of the house as it, where that can be
    var storey = hand.nodes.filter(function (f) { return f.kind === "i_floor" && insideArea(f, by.x, by.y); })[0];
    function clear(x, y, inFloor) {
      var p = tieBox({ kind: n.kind, x: x, y: y, w: n.w, h: n.h, turn: n.turn });
      return p.t >= 20 && p.l >= 20 && (!inFloor || insideArea(inFloor, x, y)) &&
             !others.some(function (r) { return tieOver(tieBox(r), p, -20); });
    }
    for (var pass = storey ? 0 : 1; pass < 2; pass++) {
      for (var far = TIE_GAP; far < TIE_GAP + 600; far += 40) {
        var spots = [[b.x, b.b + far + t.h / 2], [b.r + far + t.w / 2, b.y], [b.l - far - t.w / 2, b.y], [b.x, b.t - far - t.h / 2]];
        for (var k = 0; k < spots.length; k++) {
          var x = Math.round(spots[k][0] / HAND_GRID) * HAND_GRID, y = Math.round(spots[k][1] / HAND_GRID) * HAND_GRID;
          if (clear(x, y, pass ? null : storey)) { n.x = x; n.y = y; return true; }
        }
      }
    }
    return false;
  }
  if (typeof addNode === "function") {
    var addNodeUntied = addNode;
    addNode = function (kind, at) {
      var home = tieHome(), from = home && !at ? tieRoomOf(nodeById(picked)) : null;
      var out = addNodeUntied.apply(this, arguments);
      var n = nodeById(picked);
      if ((home || tieHome()) && n && n.kind === kind && tieable(n)) {
        var moved = !at && kind === "i_room" && tieSpace(n, from);
        if (tieNew(n, from) || moved) { drawHand(); drawHandPanel(); }
      }
      return out;
    };
  }
  if (typeof joinUp === "function") {
    var joinUpUntied = joinUp;
    joinUp = function (fromId, toId) {
      // in a floor plan, rooms to rooms, doors and windows; stairs to stairs
      if (tieHome() && !tieAllowed(nodeById(fromId), nodeById(toId))) { joinFrom = null; return; }
      return joinUpUntied.apply(this, arguments);
    };
  }

  // ---- walking round it on the paper (Run) -------------------------------------
  // On the paper the rooms an arrow joins are apart: each has a way through
  // its wall where the arrow meets it, and the walk goes out of one, along
  // the arrow, and in at the other (walkPlan, 38-walk.js).
  function walkTies(plan) {
    if (!hand.links.length || !plan.cells || !plan.rooms.length) { return; }
    // (the arrows' ways round the paper, only if a doorway 3D has not placed
    // already needs them: routing every arrow of a big building, each time
    // the plan was walked, was most of what making one took -- 2026-10-03)
    var routes = null, routed = false;
    function routesNow() {
      if (!routed) { routed = true; try { routes = typeof routeAll === "function" ? routeAll() : null; } catch (e) { routes = null; } }
      return routes;
    }
    var isRoom = {}, J = null;
    try { J = tieHome() ? tieLayout() : null; } catch (e) { J = null; }
    plan.rooms.forEach(function (r) { if (tieSquare(r)) { isRoom[r.id] = r; } });
    function storey(n) { var f = floorAt(plan.floors || [], n.x, n.y); return f ? f.n.id : 0; }
    // which wall of a room faces a spot
    function facing(room, x, y) {
      var b = tieBox(room), hw = (b.r - b.l) / 2 || 1, hh = (b.b - b.t) / 2 || 1, dx = (x - b.x) / hw, dy = (y - b.y) / hh;
      return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "foot" : "top");
    }
    function open(room, x, y, side) {
      var b = tieBox(room), T = roomWallOf(room), across = side === "top" || side === "foot";
      var cx = across ? Math.max(b.l + 26, Math.min(b.r - 26, x)) : side === "left" ? b.l : b.r;
      var cy = across ? (side === "top" ? b.t : b.b) : Math.max(b.t + 26, Math.min(b.b - 26, y));
      if (across && b.r - b.l < 52) { cx = b.x; }
      if (!across && b.b - b.t < 52) { cy = b.y; }
      var ax = across ? 22 : T + 10, ay = across ? T + 10 : 22;
      var c0 = Math.max(0, Math.floor((cx - ax - plan.x0) / WALK_CELL)), c1 = Math.min(plan.cols - 1, Math.floor((cx + ax - plan.x0) / WALK_CELL));
      var r0 = Math.max(0, Math.floor((cy - ay - plan.y0) / WALK_CELL)), r1 = Math.min(plan.rows - 1, Math.floor((cy + ay - plan.y0) / WALK_CELL));
      for (var r = r0; r <= r1; r++) {
        for (var c = c0; c <= c1; c++) {
          var i = r * plan.cols + c;
          if (plan.cells[i] === 1) { plan.cells[i] = 3; }
        }
      }
      return { x: cx, y: cy, turn: across ? 0 : 90 };
    }
    hand.links.forEach(function (l, li) {
      var a = nodeById(l.from), b = nodeById(l.to);
      if (!a || !b) { return; }
      var ra = isRoom[a.id], rb = isRoom[b.id];
      if (!((ra && rb) || (ra && WALK_DOORS[b.kind]) || (rb && WALK_DOORS[a.kind]))) { return; }
      if (ra && rb && storey(a) !== storey(b)) { return; }
      var door = ra && rb ? null : ra ? b : a;
      if (door && doorLocked(door)) { return; }
      // the arrow's ends, and the sides of the rooms they meet
      var ends = [[b.x, b.y], [a.x, a.y]], sides = [null, null];
      // where 3D puts the door between them, in each room's own place on the
      // paper -- so the walk goes in where the furniture leaves the way clear
      function through(room, other) {
        var w = J && J.ways.filter(function (one) {
          return (one.a === room || one.b === room) &&
                 (door ? one.door === door : (one.a === other || one.b === other));
        })[0];
        if (!w) { return null; }
        var dl = J.delta[room.id] || [0, 0], x = w.x - dl[0], y = w.y - dl[1];
        return open(room, x, y, facing(room, x, y));
      }
      var tA = ra ? through(a, b) : null, tB = rb ? through(b, a) : null;
      if ((ra && !tA) || (rb && !tB)) {
        var all = routesNow(), pts = all && all[li];
        if (pts && pts.length > 1) {
          ends = [pts[0], pts[pts.length - 1]];
          if (pts.sides) { sides = [PORT_SIDES[pts.sides[0]] || null, PORT_SIDES[pts.sides[1]] || null]; }
        }
      }
      var gapA = ra ? tA || open(a, ends[0][0], ends[0][1], sides[0] || facing(a, b.x, b.y)) : null;
      var gapB = rb ? tB || open(b, ends[1][0], ends[1][1], sides[1] || facing(b, a.x, a.y)) : null;
      if (ra && rb) {
        plan.joins.push({ door: { id: null, kind: "i_door", text: "", x: gapA.x, y: gapA.y, w: 44, h: 10, turn: gapA.turn, tie: true },
                          rooms: [a, b], locked: false, tie: l });
        return;
      }
      var room = ra ? a : b, j = plan.joins.filter(function (one) { return one.door === door; })[0];
      if (j && j.rooms.indexOf(room) < 0) { j.rooms.push(room); }
    });
  }
