// ---------------------------------------------------------------------------
//  38-advice.js -- what would make a drawing better: suggestions, each with
//  the way to put it right where there is an obvious one
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ========================================================= suggestions ==
  // Check the design used to say only what was wrong with a flowchart.  A
  // home, a network, a circuit can be perfectly drawn and still be a poor
  // home, network or circuit -- a bedroom with no window, a door that swings
  // into the wardrobe, a network open to the Internet, an LED with nothing
  // to hold its current back -- so each is looked over the way somebody who
  // knows about them would look it over, and what they would say is said
  // (asked for, 2026-10-01: "give suggestions of things that should
  // change").  Each is amber in Check's list, never red: the drawing still
  // runs.  Where the right change is plain -- add the window, swing the
  // door the other way, put a firewall in -- it carries a button that makes
  // it, one step for Undo (handMendNow, 12-check.js); the rest are left to
  // whoever drew it.  The 3D view lists the same (38-view3d.js), and a walk
  // through the house ends by saying them.
  var adviceSeen = { key: null, tips: [] };

  function boardAdvice() {
    var scene = byHand && boardNow();
    if (!scene) { return []; }
    var key = scene.name + "|" + LANG + "|" + JSON.stringify([
      hand.nodes.map(function (n) { return [n.id, n.kind, n.x, n.y, n.w, n.h, n.turn || 0, n.text || "", n.ceil || 0, n.lot || 0]; }),
      hand.links.map(function (l) { return [l.from, l.to]; })]);
    if (adviceSeen.key === key) { return adviceSeen.tips; }
    var tips = [];
    try {
      tips = scene.name === "home" ? homeAdvice() : scene.name === "network" ? netAdvice() :
             scene.name === "circuit" ? circuitAdvice() : scene.name === "team" ? teamAdvice() : [];
    } catch (e) { tips = []; }
    adviceSeen = { key: key, tips: tips };
    return tips;
  }

  // A new shape, put in by a fix: sized, and the one in hand afterwards.
  function adviceAdd(kind, x, y, turn) {
    var node = { id: hand.next++, kind: kind, text: firstWords(kind), x: x, y: y, w: 140, h: 46 };
    if (turn) { node.turn = turn; }
    measure(node);
    hand.nodes.push(node);
    picked = node.id; chosen = null; many = [];
    return node;
  }

  // ---- a home -----------------------------------------------------------------
  // What a room is for: what it is called, where it was named, or what is in
  // it (ROOM_FOR, 38-walk.js), in any of the page's languages.
  var ROOM_CALLED = [
    ["kitchen", /kitchen|küche|cocina|cuisine/i],
    ["bath", /bath|toilet|\bwc\b|restroom|\bbad\b|badezimmer|baño|aseo|salle de bain|salle d.eau|toilettes/i],
    ["bed", /bed ?room|schlafzimmer|kinderzimmer|dormitorio|habitación|chambre/i],
    ["living", /living|lounge|wohnzimmer|salón|salon|séjour/i],
    ["dining", /dining|esszimmer|comedor|salle à manger/i],
    ["office", /office|study|arbeitszimmer|büro|despacho|oficina|bureau/i],
    ["garage", /garage|garaje/i],
    ["laundry", /laundry|waschküche|lavadero|buanderie/i],
    ["hall", /hall|corridor|entry|flur|diele|pasillo|recibidor|couloir|entrée/i]
  ];
  var ROOM_KIND_OF = { fr_kitchen: "kitchen", fr_bath: "bath", fr_bed: "bed", fr_laundry: "laundry",
                       fr_garage: "garage", fr_office: "office", fr_dining: "dining", fr_living: "living" };

  function roomKind(plan, room) {
    var said = String(room.text || "");
    for (var k = 0; k < ROOM_CALLED.length; k++) { if (ROOM_CALLED[k][1].test(said)) { return ROOM_CALLED[k][0]; } }
    var kinds = plan.pieces.filter(function (p) { return roomAt(plan, p.x, p.y) === room; })
                           .map(function (p) { return p.kind; });
    for (var i = 0; i < ROOM_FOR.length; i++) {
      if (ROOM_FOR[i][1].some(function (kind) { return kinds.indexOf(kind) >= 0; })) { return ROOM_KIND_OF[ROOM_FOR[i][0]]; }
    }
    return "room";
  }

  // The walls of a square-standing room: each one's line, its run, the way
  // into the room, and whether it is an outside wall -- nothing but outdoors
  // beyond it.
  function roomEdges(plan, room) {
    if ((room.turn || 0) % 90) { return []; }
    var q = turned(room), l = room.x - q.w / 2, r = room.x + q.w / 2, t = room.y - q.h / 2, b = room.y + q.h / 2;
    var edges = [{ name: "top", across: true, line: t, from: l, to: r, into: 1 },
                 { name: "foot", across: true, line: b, from: l, to: r, into: -1 },
                 { name: "left", across: false, line: l, from: t, to: b, into: 1 },
                 { name: "right", across: false, line: r, from: t, to: b, into: -1 }];
    edges.forEach(function (e) {
      e.len = e.to - e.from;
      e.outside = [0.25, 0.5, 0.75].every(function (f) {
        var at = e.from + e.len * f, out = e.line - e.into * 12;
        var x = e.across ? at : out, y = e.across ? out : at;
        return !plan.rooms.some(function (o) { return o !== room && insideArea(o, x, y); });
      });
    });
    return edges;
  }

  // The gaps along a wall that nothing stands in -- no door, no window,
  // nothing hung on it.
  function edgeGaps(plan, room, e) {
    var taken = [];
    plan.doors.concat(hand.nodes.filter(function (n) { return n.kind === "i_window" || ON_THE_WALL[n.kind]; })).forEach(function (d) {
      var t = turned(d), lo = (e.across ? d.x : d.y) - (e.across ? t.w : t.h) / 2;
      var off = Math.abs((e.across ? d.y : d.x) - e.line);
      if (off > (e.across ? t.h : t.w) / 2 + 12) { return; }
      taken.push([lo - 6, lo + (e.across ? t.w : t.h) + 6]);
    });
    taken.sort(function (p, q) { return p[0] - q[0]; });
    var gaps = [], at = e.from + 12;
    taken.forEach(function (s) { if (s[0] > at) { gaps.push([at, s[0]]); } at = Math.max(at, s[1]); });
    if (e.to - 12 > at) { gaps.push([at, e.to - 12]); }
    return gaps;
  }

  // Something set into the middle of the longest free stretch of a room's
  // outside walls (a window, a front door), snapped into the wall.
  function intoOutsideWall(plan, room, kind) {
    var size = ICONS[kind].box[0], best = null;
    roomEdges(plan, room).forEach(function (e) {
      if (!e.outside) { return; }
      edgeGaps(plan, room, e).forEach(function (g) {
        if (g[1] - g[0] < size + 4 || (best && g[1] - g[0] <= best.len)) { return; }
        best = { e: e, at: (g[0] + g[1]) / 2, len: g[1] - g[0] };
      });
    });
    if (!best) { return null; }
    var inward = kind === "i_window" ? 0 : best.e.into * 10;   // a door is put just inside, to swing in
    var x = best.e.across ? best.at : best.e.line + inward, y = best.e.across ? best.e.line + inward : best.at;
    return function () {
      var node = adviceAdd(kind, Math.round(x), Math.round(y));
      snapToWalls([node.id]);
    };
  }

  // Whether two shapes' boxes (upright or a quarter round) come within gap.
  function boxesTouch(a, b, gap) {
    var p = turned(a), q = turned(b);
    return Math.abs(a.x - b.x) * 2 < p.w + q.w + gap * 2 && Math.abs(a.y - b.y) * 2 < p.h + q.h + gap * 2;
  }

  // A place against one of a room's walls for a new piece, its back to the
  // wall, clear of everything already in the room and of every door's
  // swing -- the nearest to `near` where that is given.
  function alongWall(plan, room, kind, near) {
    var icon = ICONS[kind], w = icon.box[0], h = icon.box[1], T = roomWallOf(room), spots = [];
    var hanging = !!ON_THE_WALL[kind];
    var others = hand.nodes.filter(function (n) {
      return n !== room && n.kind !== "i_rug" && n.kind !== "i_window" && !isArea(n.kind) &&
             (hanging ? ON_THE_WALL[n.kind] || WALK_DOORS[n.kind] : !ON_THE_WALL[n.kind]);
    });
    roomEdges(plan, room).forEach(function (e) {
      var turn = e.name === "top" ? 0 : e.name === "foot" ? 180 : e.name === "left" ? 270 : 90;
      for (var at = e.from + T + w / 2 + 4; at <= e.to - T - w / 2 - 4; at += 10) {
        var off = e.line + e.into * (T + h / 2 + 1);
        var spot = { kind: kind, x: e.across ? at : off, y: e.across ? off : at, w: w, h: h, turn: turn };
        if (!others.some(function (o) { return boxesTouch(spot, o, 4); })) { spots.push(spot); }
      }
    });
    if (!spots.length) { return null; }
    var aim = near || { x: room.x, y: room.y };
    spots.sort(function (p, q) { return Math.hypot(p.x - aim.x, p.y - aim.y) - Math.hypot(q.x - aim.x, q.y - aim.y); });
    var s = spots[0];
    return function () { adviceAdd(kind, Math.round(s.x), Math.round(s.y), s.turn); };
  }

  function fixed(says, go) { return go ? { auto: true, says: says, go: go } : null; }

  function homeAdvice() {
    var plan = walkPlan(), tips = [];
    if (!plan.rooms.length) { return tips; }
    function tip(text, id, fix) { tips.push({ text: text, id: id || null, fix: fix || null, warn: true, key: "s_advice" }); }
    var kinds = {}, names = {};
    plan.rooms.forEach(function (room) { kinds[room.id] = roomKind(plan, room); names[room.id] = roomName(plan, room); });
    function inRoom(room, list) { return plan.pieces.filter(function (p) { return roomAt(plan, p.x, p.y) === room && (!list || list.indexOf(p.kind) >= 0); }); }
    var windows = hand.nodes.filter(function (n) { return n.kind === "i_window"; });

    // a way in from outside
    if (!plan.joins.some(function (j) { return j.rooms.length === 1; })) {
      var big = plan.rooms.slice().sort(function (p, q) { return q.w * q.h - p.w * p.h; })[0];
      tip(TXT.ad_no_front, big.id, fixed(TXT.ad_fix_front, intoOutsideWall(plan, big, "i_door")));
    }
    plan.rooms.forEach(function (room) {
      var kind = kinds[room.id], name = names[room.id];
      var lit = windows.some(function (w) { return doorIn(w, room); });
      // daylight, where people live
      if (!lit && /^(bed|living|kitchen|office|dining)$/.test(kind)) {
        tip(say(kind === "bed" ? "ad_window_bed" : "ad_window", { room: name }), room.id,
            fixed(TXT.ad_fix_window, intoOutsideWall(plan, room, "i_window")));
      } else if (!lit && !inRoom(room, ["i_lamp", "i_sconce", "i_nightstand"]).length && kind !== "garage") {
        tip(say("ad_dark", { room: name }), room.id, fixed(TXT.ad_fix_light, alongWall(plan, room, "i_sconce")));
      }
      // what a kitchen cannot do without
      if (kind === "kitchen") {
        [["i_stove"], ["i_fridge"], ["i_kitchensink"]].forEach(function (need) {
          if (inRoom(room, need).length) { return; }
          tip(say("ad_missing", { room: name, what: kindName(need[0]) }), room.id,
              fixed(say("ad_fix_add", { what: kindName(need[0]) }), alongWall(plan, room, need[0])));
        });
      }
      // somewhere to wash your hands
      if (kind === "bath") {
        var loo = inRoom(room, ["i_toilet"])[0];
        if (loo && !inRoom(room, ["i_sink", "i_kitchensink", "i_vanity", "i_utilitysink"]).length) {
          tip(say("ad_bath_sink", { room: name }), room.id,
              fixed(say("ad_fix_add", { what: kindName("i_sink") }), alongWall(plan, room, "i_sink", loo)));
        }
      }
      // a double bed wants room round it
      if (inRoom(room, ["i_bed"]).length && room.w * room.h < 9 * FLOOR_PX * FLOOR_PX) {
        tip(say("ad_small_bed", { room: name, area: floorSays(room.w, room.h), want: floorSays(3 * FLOOR_PX, 3 * FLOOR_PX) }), room.id);
      }
      // a sofa the wrong way round
      var tv = inRoom(room, ["i_tv", "i_walltv"])[0];
      if (tv) {
        inRoom(room, ["i_sofa", "i_armchair"]).forEach(function (seat) {
          var t = (seat.turn || 0) * Math.PI / 180, fx = -Math.sin(t), fy = Math.cos(t);
          var dx = tv.x - seat.x, dy = tv.y - seat.y, len = Math.hypot(dx, dy) || 1;
          if ((fx * dx + fy * dy) / len > 0.3) { return; }
          var best = 0, bestDot = -Infinity;
          [0, 90, 180, 270].forEach(function (q) {
            var r = q * Math.PI / 180, dot = (-Math.sin(r) * dx + Math.cos(r) * dy) / len;
            if (dot > bestDot) { bestDot = dot; best = q; }
          });
          tip(say("ad_back_to_tv", { what: kindName(seat.kind) }), seat.id,
              fixed(TXT.ad_fix_face_tv, function () { var s = nodeById(seat.id); if (s) { s.turn = best; } }));
        });
      }
    });
    // doors that swing into something
    plan.doors.forEach(function (d) {
      if (d.kind === "i_slide" || doorLocked(d)) { return; }
      var hit = plan.pieces.filter(function (p) {
        return !ON_THE_WALL[p.kind] && p.kind !== "i_rug" && boxesTouch(d, p, -3);
      })[0];
      if (!hit) { return; }
      // the other way: reflected across its threshold, turned round
      var t = (d.turn || 0) * Math.PI / 180, sx = Math.sin(t), sy = -Math.cos(t);   // the way it swings
      var flip = { kind: d.kind, x: d.x - sx * d.h, y: d.y - sy * d.h, w: d.w, h: d.h, turn: ((d.turn || 0) + 180) % 360 };
      var clear = !plan.pieces.some(function (p) { return !ON_THE_WALL[p.kind] && p.kind !== "i_rug" && boxesTouch(flip, p, -3); });
      tip(say("ad_door_hits", { what: kindName(hit.kind) }), d.id,
          fixed(TXT.ad_fix_flip, clear ? function () {
            var n = nodeById(d.id);
            if (n) { n.x = Math.round(flip.x * 2) / 2; n.y = Math.round(flip.y * 2) / 2; n.turn = flip.turn; }
          } : null));
    });
    // a bathroom opening straight into the kitchen
    plan.joins.forEach(function (j) {
      if (j.rooms.length !== 2) { return; }
      var a = j.rooms[0], b = j.rooms[1];
      var bath = kinds[a.id] === "bath" ? a : kinds[b.id] === "bath" ? b : null;
      var kitchen = kinds[a.id] === "kitchen" ? a : kinds[b.id] === "kitchen" ? b : null;
      if (bath && kitchen) { tip(say("ad_bath_kitchen", { bath: names[bath.id], kitchen: names[kitchen.id] }), j.door.id); }
    });
    // furniture nobody can get to, from the way in
    if (plan.cells) {
      var start = null;
      var front = plan.joins.filter(function (j) { return j.rooms.length === 1 && !j.locked; })[0];
      if (front) {
        var r0 = front.rooms[0], dx = front.door.x - r0.x, dy = front.door.y - r0.y, l0 = Math.hypot(dx, dy) || 1;
        start = cellOf(plan, front.door.x + dx / l0 * 60, front.door.y + dy / l0 * 60);
      } else { start = cellOf(plan, plan.rooms[0].x, plan.rooms[0].y); }
      var reach = new Uint8Array(plan.cells.length), todo = [start];
      reach[start] = 1;
      // the two ends of each flight of stairs: reached one, reached both
      var ends = plan.links.map(function (pair) { return [cellsUnder(plan, pair[0]), cellsUnder(plan, pair[1])]; });
      for (var round = 0; round <= ends.length; round++) {
        while (todo.length) {
          var i = todo.pop(), c = i % plan.cols, r = Math.floor(i / plan.cols);
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (s) {
            var cc = c + s[0], rr = r + s[1];
            if (cc < 0 || rr < 0 || cc >= plan.cols || rr >= plan.rows) { return; }
            var j = rr * plan.cols + cc;
            if (!reach[j] && (plan.cells[j] === 0 || plan.cells[j] === 3)) { reach[j] = 1; todo.push(j); }
          });
        }
        ends.forEach(function (two) {
          [0, 1].forEach(function (e) {
            if (!two[e].some(function (k) { return reach[k]; })) { return; }
            two[1 - e].forEach(function (k) { if (!reach[k]) { reach[k] = 1; todo.push(k); } });
          });
        });
        if (!todo.length) { break; }
      }
      plan.pieces.forEach(function (p) {
        var room = roomAt(plan, p.x, p.y);
        if (!room || ON_THE_WALL[p.kind] || p.kind === "i_rug") { return; }
        if (!besideOf(plan, p).some(function (i) { return reach[i]; })) {
          // a room with no way in at all is said once, by the check
          if (!plan.joins.some(function (j) { return j.rooms.indexOf(room) >= 0 && !j.locked; })) { return; }
          tip(say("ad_boxed_in", { what: kindName(p.kind), room: names[room.id] }), p.id);
        }
      });
    }
    stairAdvice(plan, tip);
    lotAdvice(plan, tip);
    garageAdvice(plan, tip);
    apartAdvice(plan, tip);
    wallAdvice(plan, tip);
    return tips;
  }

  // ---- what would go through what ----------------------------------------------
  // Two things that stand on the floor standing in the same place (isSolid,
  // 03-icons.js), or somebody standing inside one, would go through each
  // other in 3D -- and a piece pushed into its room's wall would stick out
  // of the house.  Put right, the smaller is moved the shortest way that
  // leaves it in its room and clear of everything; or into the room by as
  // much as it was in the wall.
  function thingName(n) {
    var said = String(n.text || "").split("\n")[0].trim();
    return said || (isFigure(n.kind) ? kindName(n.kind) : labelName(n.kind));
  }
  function roomInside(room) {                // a room's floor, inside its walls
    var T = roomWallOf(room), r = turned(room);
    return { l: room.x - r.w / 2 + T, r: room.x + r.w / 2 - T, t: room.y - r.h / 2 + T, b: room.y + r.h / 2 - T };
  }
  function fitsAt(plan, n, x, y, room) {
    var t = turned(n);
    if (room && !((room.turn || 0) % 90)) {
      var f = roomInside(room);
      if (x - t.w / 2 < f.l - 0.5 || x + t.w / 2 > f.r + 0.5 || y - t.h / 2 < f.t - 0.5 || y + t.h / 2 > f.b + 0.5) { return false; }
    }
    return !hand.nodes.some(function (m) { return m !== n && boxesMeet(n, x, y, m, m.x, m.y, -0.5); });
  }
  function clearOf(plan, mover, still) {
    var p = turned(mover), q = turned(still), room = roomAt(plan, mover.x, mover.y);
    var moves = [[still.x + (q.w + p.w) / 2 + 1 - mover.x, 0], [still.x - (q.w + p.w) / 2 - 1 - mover.x, 0],
                 [0, still.y + (q.h + p.h) / 2 + 1 - mover.y], [0, still.y - (q.h + p.h) / 2 - 1 - mover.y]]
      .sort(function (a, b) { return Math.abs(a[0]) + Math.abs(a[1]) - Math.abs(b[0]) - Math.abs(b[1]); });
    for (var i = 0; i < moves.length; i++) {
      var x = Math.round(mover.x + moves[i][0]), y = Math.round(mover.y + moves[i][1]);
      if (fitsAt(plan, mover, x, y, room)) {
        return (function (x, y) {
          return function () { var n = nodeById(mover.id); if (n) { n.x = x; n.y = y; } };
        })(x, y);
      }
    }
    return null;
  }
  function apartAdvice(plan, tip) {
    var things = hand.nodes.filter(function (n) { return isSolid(n.kind) || (isFigure(n.kind) && isPerson(n)); });
    var told = {};
    for (var i = 0; i < things.length; i++) {
      for (var j = i + 1; j < things.length; j++) {
        var a = things[i], b = things[j];
        if (!isSolid(a.kind) && !isSolid(b.kind)) { continue; }
        if (!boxesMeet(a, a.x, a.y, b, b.x, b.y, -3)) { continue; }
        // the one to move: a person before a thing, else the smaller
        var mover = isFigure(b.kind) || (!isFigure(a.kind) && b.w * b.h <= a.w * a.h) ? b : a;
        var still = mover === a ? b : a;
        if (told[mover.id]) { continue; }
        told[mover.id] = true;
        tip(say("ad_overlap", { a: thingName(still), b: thingName(mover) }), mover.id,
            fixed(TXT.ad_fix_apart, clearOf(plan, mover, still)));
      }
    }
  }
  function wallAdvice(plan, tip) {
    hand.nodes.forEach(function (n) {
      if (!isSolid(n.kind) || ((n.turn || 0) % 90)) { return; }
      var room = roomAt(plan, n.x, n.y);
      if (!room || ((room.turn || 0) % 90)) { return; }
      var f = roomInside(room), t = turned(n);
      var dx = Math.max(0, f.l - (n.x - t.w / 2)) - Math.max(0, n.x + t.w / 2 - f.r);
      var dy = Math.max(0, f.t - (n.y - t.h / 2)) - Math.max(0, n.y + t.h / 2 - f.b);
      if (Math.abs(dx) <= 1.5 && Math.abs(dy) <= 1.5) { return; }
      var fits = t.w <= f.r - f.l && t.h <= f.b - f.t;
      var x = Math.round(n.x + dx), y = Math.round(n.y + dy);
      tip(say("ad_in_wall", { what: thingName(n), room: roomName(plan, room) }), n.id,
          fixed(TXT.ad_fix_in, fits && fitsAt(plan, n, x, y, room) ? function () {
            var m = nodeById(n.id);
            if (m) { m.x = x; m.y = y; }
          } : null));
    });
  }

  // ---- stairs, a lot, a garage -------------------------------------------------
  // A Floor round some rooms, the size of them and a little more, with a
  // head for its name.
  function floorRound(nodes, name) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    nodes.forEach(function (n) {
      var t = turned(n);
      x0 = Math.min(x0, n.x - t.w / 2); x1 = Math.max(x1, n.x + t.w / 2);
      y0 = Math.min(y0, n.y - t.h / 2); y1 = Math.max(y1, n.y + t.h / 2);
    });
    var f = adviceAdd("i_floor", Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2 - 12));
    f.text = name;
    f.w = Math.round(x1 - x0 + 60); f.h = Math.round(y1 - y0 + 84);
    f.own = true;
    return f;
  }

  // Stairs that lead nowhere: drawn in a house of one floor, or with no
  // stairs where they come out on the floor above.  Put right, the floor
  // above is drawn beside this one -- a Floor the same size, a room as big
  // as the house below to start dividing up, and the top of the stairs in
  // the same place -- or the top of the stairs is put on the floor above.
  function stairAdvice(plan, tip) {
    var linked = {};
    plan.links.forEach(function (pair) { linked[pair[0].id] = linked[pair[1].id] = true; });
    hand.nodes.forEach(function (s) {
      if (!BETWEEN_FLOORS[s.kind] || linked[s.id]) { return; }
      tip(say("ad_stairs_nowhere", { what: kindName(s.kind) }), s.id, fixed(TXT.ad_fix_upstairs, upstairsFor(plan, s)));
    });
  }
  function upstairsFor(plan, stair) {
    var floors = plan.floors, f = floorAt(floors, stair.x, stair.y);
    if (f && floors[floors.indexOf(f) + 1]) {
      var next = floors[floors.indexOf(f) + 1];
      return function () {
        var top = adviceAdd(stair.kind, Math.round(stair.x + f.dx - next.dx), Math.round(stair.y + f.dy - next.dy), stair.turn);
        top.w = stair.w; top.h = stair.h; top.own = true;
      };
    }
    if (floors.length && !f) { return null; }     // a stair outside every floor of a house of floors
    return function () {
      var under = f ? f.n : null;
      if (!under) {                     // the house as it is: the ground floor
        var rooms = plan.rooms.filter(function (r) { return !floorAt(floors, r.x, r.y); });
        if (!rooms.length) { return; }
        under = floorRound(rooms, TXT.fl_ground);
      }
      var right = Math.max.apply(null, hand.nodes.filter(function (n) { return n.kind === "i_floor"; })
        .map(function (n) { return n.x + turned(n).w / 2; }));
      var level = (f ? f.level : 0) + 1;
      var up = adviceAdd("i_floor", Math.round(right + 120 + under.w / 2), under.y);
      up.text = level === 1 ? TXT.fl_up_name : say("fl_upper", { n: level });
      up.w = under.w; up.h = under.h; up.own = true; up.ceil = under.ceil;
      var dx = up.x - under.x, dy = up.y - under.y;
      var below = plan.rooms.filter(function (r) { return insideArea(under, r.x, r.y); });
      if (below.length) {
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        below.forEach(function (r) {
          var t = turned(r);
          x0 = Math.min(x0, r.x - t.w / 2); x1 = Math.max(x1, r.x + t.w / 2);
          y0 = Math.min(y0, r.y - t.h / 2); y1 = Math.max(y1, r.y + t.h / 2);
        });
        var hall = adviceAdd("i_room", Math.round((x0 + x1) / 2 + dx), Math.round((y0 + y1) / 2 + dy));
        hall.text = ""; hall.w = Math.round(x1 - x0); hall.h = Math.round(y1 - y0); hall.own = true;
      }
      var top = adviceAdd(stair.kind, Math.round(stair.x + dx), Math.round(stair.y + dy), stair.turn);
      top.w = stair.w; top.h = stair.h; top.own = true;
    };
  }

  // The parts of the house on a lot, to be moved together: the Floor it
  // is drawn in and all in that, or else each room and all in it and in
  // its walls.
  function houseOnLot(m) {
    var floor = hand.nodes.filter(function (f) {
      return f.kind === "i_floor" && m.rooms.every(function (r) { return insideArea(f, r.x, r.y); });
    })[0];
    if (floor) { return [floor.id].concat(heldIn(floor)); }
    var ids = {};
    m.rooms.forEach(function (r) {
      ids[r.id] = true;
      hand.nodes.forEach(function (n) {
        if (n.kind !== "i_lot" && n.kind !== "i_floor" && insideArea(r, n.x, n.y, -12)) { ids[n.id] = true; }
      });
    });
    return Object.keys(ids).map(Number);
  }

  // A house on a lot: in one piece, to be dragged round it; inside the
  // line the setbacks draw, or said by how much it is not; no bigger than
  // the room there is.
  function lotAdvice(plan, tip) {
    hand.nodes.filter(function (n) { return n.kind === "i_lot"; }).forEach(function (lot) {
      var m = lotMeasure(lot), unit = TXT.fp_unit || "m";
      if (!m.rooms.length) { return; }
      var loose = m.rooms.filter(function (r) {
        return !hand.nodes.some(function (f) { return f.kind === "i_floor" && insideArea(f, r.x, r.y); });
      });
      if (loose.length > 1) {
        tip(TXT.ad_group_house, loose[0].id, fixed(TXT.ad_fix_group, function () { floorRound(loose, TXT.fl_ground); }));
      }
      var b = m.box, wide = b.r - b.l, deep = b.b - b.t;
      if (wide > m.env.w + 2 || deep > m.env.h + 2) {
        tip(say("ad_too_big", { house: lengthSays(wide) + " \u00d7 " + lengthSays(deep) + " " + unit,
                                room: lengthSays(m.env.w) + " \u00d7 " + lengthSays(m.env.h) + " " + unit }), lot.id);
        return;
      }
      if (!m.over.length) { return; }
      var worst = m.over.slice().sort(function (p, q) { return q.by - p.by; })[0];
      tip(say("ad_setback", { side: TXT["lot_" + worst.side + "_is"], by: lengthSays(worst.by) + " " + unit }), worst.room.id,
          fixed(TXT.ad_fix_move_in, function () {
            // along the lot, as far as puts the house inside the line
            var mx = b.l < m.env.l ? m.env.l - b.l : b.r > m.env.r ? m.env.r - b.r : 0;
            var my = b.t < m.env.t ? m.env.t - b.t : b.b > m.env.b ? m.env.b - b.b : 0;
            var a = (lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
            var dx = Math.round(mx * c - my * s), dy = Math.round(mx * s + my * c);
            houseOnLot(m).forEach(function (id) {
              var n = nodeById(id);
              if (n) { n.x += dx; n.y += dy; }
            });
          }));
    });
  }

  // A garage door with no driveway up to it: one laid from it out to the
  // edge of the lot (the street), or a car's length and a half.
  function garageAdvice(plan, tip) {
    var ways = hand.nodes.filter(function (n) { return n.kind === "i_driveway"; });
    hand.nodes.filter(function (n) { return n.kind === "i_garagedoor"; }).forEach(function (door) {
      if (ways.some(function (w) { return boxesTouch(door, w, 30); })) { return; }
      tip(TXT.ad_no_driveway, door.id, fixed(TXT.ad_fix_driveway, drivewayFor(plan, door)));
    });
  }
  function drivewayFor(plan, door) {
    var room = plan.rooms.filter(function (r) { return doorIn(door, r); })[0];
    if (!room) { return null; }
    var t = (door.turn || 0) * Math.PI / 180, nx = -Math.sin(t), ny = Math.cos(t);
    if (nx * (door.x - room.x) + ny * (door.y - room.y) < 0) { nx = -nx; ny = -ny; }   // the way out
    var out = 7.5 * FLOOR_PX;
    var lot = hand.nodes.filter(function (n) { return n.kind === "i_lot" && insideArea(n, door.x, door.y); })[0];
    if (lot) {
      var a = -(lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      var px = (door.x - lot.x) * c - (door.y - lot.y) * s, py = (door.x - lot.x) * s + (door.y - lot.y) * c;
      var ux = nx * c - ny * s, uy = nx * s + ny * c;
      var tx = ux > 1e-6 ? (lot.w / 2 - px) / ux : ux < -1e-6 ? (-lot.w / 2 - px) / ux : Infinity;
      var ty = uy > 1e-6 ? (lot.h / 2 - py) / uy : uy < -1e-6 ? (-lot.h / 2 - py) / uy : Infinity;
      out = Math.min(tx, ty);
    }
    var from = door.h / 2 + 2, len = Math.max(2 * FLOOR_PX, out - from);
    return function () {
      var x = door.x + nx * (from + len / 2), y = door.y + ny * (from + len / 2);
      var way = adviceAdd("i_driveway", Math.round(x), Math.round(y));
      way.w = Math.round(door.w + 10); way.h = Math.round(len); way.own = true;
      way.turn = ((Math.round(Math.atan2(-nx, ny) * 180 / Math.PI) % 360) + 360) % 360;
      if (!way.turn) { delete way.turn; }
    };
  }

  // ---- a network --------------------------------------------------------------
  // An arrow cut in two, with a new shape where it was cut.
  function splitLink(link, kind) {
    var a = nodeById(link.from), b = nodeById(link.to);
    var node = adviceAdd(kind, Math.round((a.x + b.x) / 2), Math.round((a.y + b.y) / 2));
    hand.links.push({ from: node.id, to: link.to, label: "" });
    link.to = node.id;
    moveClear([node.id]);
    return node;
  }

  function netAdvice() {
    var tips = [];
    var web = hand.nodes.filter(function (n) { return n.kind === "i_internet" || n.kind === "cloud"; });
    var guarded = hand.nodes.some(function (n) { return n.kind === "i_firewall"; });
    if (web.length && !guarded) {
      var cable = hand.links.filter(function (l) { return l.from === web[0].id || l.to === web[0].id; })[0];
      tips.push({ text: TXT.ad_firewall, id: web[0].id, warn: true, key: "s_advice",
                  fix: fixed(TXT.ad_fix_firewall, cable ? function () { splitLink(cable, "i_firewall"); } : null) });
    }
    // one box everything has to go through
    var servers = {}, clients = [];
    hand.nodes.forEach(function (n) {
      var k = netKind(n);
      if (k === "server") { servers[n.id] = true; }
      if (k === "client") { clients.push(n); }
    });
    if (clients.length >= 3 && Object.keys(servers).length) {
      var common = null;
      clients.forEach(function (c) {
        var legs = netWay(c.id, servers);
        if (!legs) { return; }
        var mids = legs.slice(0, -1).map(function (l) { return l.to; });
        common = common === null ? mids : common.filter(function (id) { return mids.indexOf(id) >= 0; });
      });
      if (common && common.length) {
        var hub = nodeById(common[0]);
        tips.push({ text: say("ad_single", { who: simName(hub) }), id: hub.id, warn: true, key: "s_advice", fix: null });
      }
    }
    return tips;
  }

  // ---- a circuit ---------------------------------------------------------------
  function circuitAdvice() {
    var tips = [], c = circuitRead(), solved = circuitSolve(c);
    if (solved.none) { return tips; }
    c.parts.forEach(function (p) {
      if (p.n.kind === "i_led" && Math.abs(p.amps) > 0.03) {
        var wire = hand.links.filter(function (l) { return l.to === p.n.id; })[0] ||
                   hand.links.filter(function (l) { return l.from === p.n.id; })[0];
        tips.push({ text: say("ad_led", { who: partName(p.n), a: amps(p.amps) }), id: p.n.id, warn: true, key: "s_advice",
                    fix: fixed(TXT.ad_fix_resistor, wire ? function () {
                      var r = splitLink(wire, "i_resistor"); r.text = "330 Ω";
                    } : null) });
      }
    });
    var loads = c.parts.some(function (p) { return p.is.light || p.is.turn || p.is.buzz; });
    if (loads && !c.parts.some(function (p) { return p.is.swtch; })) {
      var source = c.parts.filter(function (p) { return p.is.source; })[0];
      var out = source && hand.links.filter(function (l) { return l.from === source.n.id; })[0];
      tips.push({ text: TXT.ad_switch, id: source ? source.n.id : null, warn: true, key: "s_advice",
                  fix: fixed(TXT.ad_fix_switch, out ? function () { splitLink(out, "i_switch_on"); } : null) });
    }
    return tips;
  }

  // ---- people -----------------------------------------------------------------
  function teamAdvice() {
    var tips = [], count = {};
    if (hand.links.length < 4) { return tips; }
    hand.links.forEach(function (l) { count[l.from] = (count[l.from] || 0) + 1; count[l.to] = (count[l.to] || 0) + 1; });
    var most = Object.keys(count).sort(function (p, q) { return count[q] - count[p]; })[0];
    var who = most && nodeById(+most);
    if (who && count[most] > hand.links.length) {
      tips.push({ text: say("ad_busy", { who: simName(who) }), id: who.id, warn: true, key: "s_advice", fix: null });
    }
    return tips;
  }
