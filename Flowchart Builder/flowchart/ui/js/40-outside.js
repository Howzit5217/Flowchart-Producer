// ---------------------------------------------------------------------------
//  40-outside.js -- what a building has out of doors without being asked:
//  a way out at the back (to the deck, the yard, a shop's store room), the
//  deck against it and up at its floor, a walk from the front door to the
//  street, the mailbox, the bins by the garage, the air conditioner's unit
//  at the side, a light by each door out; a dumpster behind the rest
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "there is no back door to the house either for
  // the deck like there needs to more options that are not displayed and
  // are instead just done normally with front and back doors, garbage cans
  // stuff like that")

  // ---- a back door --------------------------------------------------------------------------
  // Out of the room a back door goes out of, best first: the kitchen, the
  // dining or family room, the living room ... a bedroom's patio door last
  // -- never a bathroom, a closet or a stairway.  A sliding door out of a
  // room you sit in, a door out of a kitchen or a store room; each home of
  // a row its own, out of its own rooms.
  var YB_BACK = { kitchen: 10, cafekitchen: 9, dining: 9, family: 9, great: 9, stock: 9, mudroom: 8, living: 8, laundry: 6,
                  staff: 6, main: 5, office: 3, bed: 3, flatbed: 3 };
  var YB_SLIDE = { dining: 1, family: 1, great: 1, living: 1, main: 1, bed: 1, flatbed: 1 };
  // (a room with a sofa or a bed to go against a wall: only one with wall to spare, metres)
  var YB_ROOMY = { family: 3.6, living: 3.6, great: 3.6, dining: 3.0, main: 3.4, bed: 3.0, flatbed: 3.0, office: 2.8 };
  var YB_HOMES = { house: 1, cabin: 1, duplex: 1, townhouses: 1 };
  var YB_SHOPS = { shop: 1, boutique: 1, cafe: 1 };
  // (Start building asks, as it draws the front doors: 39-starter.js)
  // (a block of flats, an office, a school: a way out at each end of its
  // corridor too, for a fire -- 2026-10-03: "the should be multiple exists
  // in case of a fire")
  var YB_EXITS = { apartments: 1, condos: 1, office: 1, school: 1 };
  function ybExits(ground, links, fronts) {
    var hall = ground.hall || (ground.halls && ground.halls[0]);
    if (!hall) { return; }
    [-1, 1].forEach(function (s) {
      var d = { id: hand.next++, kind: "i_door", text: firstWords("i_door"), x: 0, y: 0, w: 140, h: 46, backDoor: true, fireExit: true };
      measure(d);
      d.dd = { st: "flush", hd: "lever", mt: "chrome", fin: "red" };
      d.x = Math.round(hall.x + s * (hall.w / 2 + STARTER_GAP * 0.9)); d.y = Math.round(hall.y);
      ground.nodes.push(d);
      links.push({ from: hall.id, to: d.id, label: "" });
      if (fronts) { fronts.push(d); }
    });
  }
  function ybBackDoors(ground, ways, links, want, fronts) {
    var type = (want && want.type) || "house";
    if (YB_EXITS[type]) { ybExits(ground, links, fronts); return; }
    if ((!YB_HOMES[type] && !YB_SHOPS[type]) || !ways.length) { return; }
    var P = FLOOR_PX, byId = {}, top = Infinity, taken = {};
    ground.back.concat(ground.front).forEach(function (r) { if (r.starterId) { byId[r.starterId] = r; } });
    ground.back.forEach(function (r) { if (r.local) { top = Math.min(top, r.local[1]); } });
    // (the way in a room is reached from: a row of homes, each its own)
    function home(r) {
      for (var k = 0, at = r; at && k < 8; k++) {
        if (ways.indexOf(at) >= 0) { return at; }
        at = at.starterVia ? byId[at.starterVia] : null;
      }
      return null;
    }
    ways.forEach(function (way) {
      var best = null;
      ground.back.forEach(function (r) {
        var score = YB_BACK[r.starter];
        // (on the back wall: not a suite's room in from it)
        if (!score || taken[r.id] || r.w < (YB_ROOMY[r.starter] || 1.6) * P || !r.local || r.local[1] > top + 1) { return; }
        if (ways.length > 1 && home(r) !== way) { return; }
        score += r.w / P * 0.05;
        if (!best || score > best.score) { best = { r: r, score: score }; }
      });
      if (!best) { return; }
      var r = best.r, kind = YB_SLIDE[r.starter] && ICONS.i_slide && r.w >= 4.6 * P ? "i_slide" : "i_door";     // (a slider only where the wall has room for it and the sofa)
      taken[r.id] = true;
      var d = { id: hand.next++, kind: kind, text: firstWords(kind), x: 0, y: 0, w: 140, h: 46, backDoor: true };
      measure(d);
      // (a shop's: a plain steel service door)
      if (YB_SHOPS[type]) { d.dd = { st: "flush", hd: "lever", mt: "black", fin: "black" }; }
      // toward the corner nearer the middle of the house: the rest of the
      // wall left whole for a window, the counters, the sofa
      var lo = Infinity, hi = -Infinity;
      ground.back.forEach(function (o) { if (o.local) { lo = Math.min(lo, o.local[0]); hi = Math.max(hi, o.local[2]); } });
      var toMid = (lo + hi) / 2 >= (r.local[0] + r.local[2]) / 2 ? 1 : -1, slack = r.w / 2 - 0.45 * P - d.w / 2;
      // (or toward the rooms beside it it opens into -- an en suite: the
      // doors together at one end, the bed's wall left at the other)
      var pull = 0, mine = (r.local[0] + r.local[2]) / 2, byNode = {};
      ground.nodes.forEach(function (o) { byNode[o.id] = o; });
      links.forEach(function (l) {
        var o = l.from === r.id ? byNode[l.to] : l.to === r.id ? byNode[l.from] : null;
        if (!o || !o.local || o.kind !== "i_room" || o.starter === "hall" || o.local[1] >= r.local[3] || o.local[3] <= r.local[1]) { return; }
        var dx = (o.local[0] + o.local[2]) / 2 - mine;
        if (Math.abs(dx) > (r.local[2] - r.local[0]) / 4) { pull += Math.sign(dx); }
      });
      if (pull) { toMid = Math.sign(pull); }
      d.x = Math.round(r.x + (slack > 0.15 * P ? toMid * slack : 0)); d.y = Math.round(r.y - r.h / 2 - STARTER_GAP * 0.9);
      ground.nodes.push(d);
      links.push({ from: r.id, to: d.id, label: "" });
      if (fronts) { fronts.push(d); }              // (put where 3D puts it, with the front doors)
    });
  }
  // A shop's back door is its store room's, not another glass front (40-fronts.js).
  if (typeof frontWays === "function") {
    var frontWaysAll = frontWays;
    frontWays = function () { return frontWaysAll.apply(this, arguments).filter(function (d) { return !d.backDoor; }); };
  }

  // ---- the lot's numbers --------------------------------------------------------------------
  // x along the street, y toward it -- as 40-yard.js's yardSpot has them.
  function ybFrame(H) {
    var lot = H.lot, a = (lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), P = FLOOR_PX;
    var F = { H: H, lot: lot, turn: lot.turn || 0, P: P, zones: [] };
    F.local = function (x, y) { var dx = x - lot.x, dy = y - lot.y; return [dx * c + dy * s, -dx * s + dy * c]; };
    F.dir = function (vx, vy) { return [vx * c + vy * s, -vx * s + vy * c]; };
    F.world = function (lx, ly) { return [lot.x + lx * c - ly * s, lot.y + lx * s + ly * c]; };
    F.box = function (n, pad) {
      var t = (n.turn || 0) * Math.PI / 180, ct = Math.cos(t), st = Math.sin(t), b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (k) {
        var dx = k[0] * n.w / 2, dy = k[1] * n.h / 2, q = F.local(n.x + dx * ct - dy * st, n.y + dx * st + dy * ct);
        b.l = Math.min(b.l, q[0]); b.r = Math.max(b.r, q[0]); b.t = Math.min(b.t, q[1]); b.b = Math.max(b.b, q[1]);
      });
      pad = pad || 0;
      return { l: b.l - pad, r: b.r + pad, t: b.t - pad, b: b.b + pad };
    };
    F.house = H.rooms.map(function (r) { return F.box(r); });
    F.hb = F.house.reduce(function (m, b) { return { l: Math.min(m.l, b.l), r: Math.max(m.r, b.r), t: Math.min(m.t, b.t), b: Math.max(m.b, b.b) }; },
                          { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity });
    F.L = { l: -lot.w / 2, r: lot.w / 2, t: -lot.h / 2, b: lot.h / 2 };
    F.inHouse = function (x, y) { return F.house.some(function (b) { return x > b.l && x < b.r && y > b.t && y < b.b; }); };
    // (a tower's skin stands out past its rooms, 40-towers.js)
    F.towers = (typeof towerTaken === "function" ? towerTaken() : []).map(function (t) { var q = F.local(t[0], t[1]); return [q[0], q[1], t[2]]; });
    return F;
  }
  // What takes up ground out of doors: not a room or what is in one, not
  // what hangs on a wall or is set in it.
  function ybStands(F, n) {
    if (n === F.lot || !ICONS[n.kind] || n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || n.kind === "i_zone" ||
        n.kind === "i_window" || ON_THE_WALL[n.kind] || FROM_CEILING[n.kind] || WALK_DOORS[n.kind]) { return false; }
    var c = F.local(n.x, n.y);
    return !F.inHouse(c[0], c[1]);
  }
  // A box (these numbers) clear: on the lot, `gap` off the house, off what
  // stands out of doors and the ways out of the doors.
  function ybClear(F, b, gap) {
    var P = F.P;
    if (b.l < F.L.l + 0.3 * P || b.r > F.L.r - 0.3 * P || b.t < F.L.t + 0.3 * P || b.b > F.L.b - 0.3 * P) { return false; }
    if (F.house.some(function (o) { return b.l < o.r + gap && b.r > o.l - gap && b.t < o.b + gap && b.b > o.t - gap; })) { return false; }
    if (F.zones.some(function (o) { return b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t; })) { return false; }
    var cx = (b.l + b.r) / 2, cy = (b.t + b.b) / 2, rad = Math.hypot(b.r - b.l, b.b - b.t) / 2;
    if (F.towers.some(function (t) { return Math.hypot(cx - t[0], cy - t[1]) < t[2] + rad; })) { return false; }
    // (what stands out of doors, measured once until something more is put down, ybPut)
    if (!F.outs) { F.outs = hand.nodes.filter(function (n) { return ybStands(F, n); }).map(function (n) { return F.box(n, 0.1 * P); }); }
    return !F.outs.some(function (o) { return b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t; });
  }
  function ybPut(F, kind, lx, ly, turn) {
    var at = F.world(lx, ly), t = ((Math.round(F.turn + (turn || 0)) % 360) + 360) % 360;
    var n = adviceAdd(kind, Math.round(at[0]), Math.round(at[1]), t);
    n.own = true;
    F.outs = null;
    return n;
  }
  // The doors out of the ground floor: where each meets the outside of its
  // wall, the way out (square to the lot), and how wide.
  function ybDoors(F) {
    var P = F.P, out = [];
    hand.nodes.forEach(function (d) {
      if (!WALK_DOORS[d.kind]) { return; }
      var p = F.local(d.x, d.y);
      if (!F.house.some(function (b) { return p[0] > b.l - 0.6 * P && p[0] < b.r + 0.6 * P && p[1] > b.t - 0.6 * P && p[1] < b.b + 0.6 * P; })) { return; }
      var t = (d.turn || 0) * Math.PI / 180, u = F.dir(-Math.sin(t), Math.cos(t));
      var aIn = F.inHouse(p[0] + u[0] * 0.8 * P, p[1] + u[1] * 0.8 * P), bIn = F.inHouse(p[0] - u[0] * 0.8 * P, p[1] - u[1] * 0.8 * P);
      if (aIn === bIn) { return; }
      var o = aIn ? [-u[0], -u[1]] : u;
      o = Math.abs(o[0]) > Math.abs(o[1]) ? [Math.sign(o[0]), 0] : [0, Math.sign(o[1])];
      var x = p[0], y = p[1], k;
      for (k = 0; k < 60 && !F.inHouse(x, y); k++) { x -= o[0] * 2; y -= o[1] * 2; }
      for (k = 0; k < 80 && F.inHouse(x, y); k++) { x += o[0] * 2; y += o[1] * 2; }
      out.push({ d: d, x: o[0] ? x : p[0], y: o[0] ? p[1] : y, ox: o[0], oy: o[1], w: Math.max(d.w, 0.8 * P),
                 garage: d.kind === "i_garagedoor", back: !!d.backDoor });
    });
    return out;
  }
  // The ground in front of each door out, kept clear (the landing and the
  // steps, a car's way in).
  function ybZones(F, doors) {
    var P = F.P;
    F.zones = doors.map(function (o) {
      var half = o.w / 2 + (o.garage ? 0.4 : 0.5) * P, deep = (o.garage ? 6.0 : o.d.fireExit ? 1.4 : 2.2) * P;
      var x0 = o.x + o.ox * deep, y0 = o.y + o.oy * deep;
      return o.ox ? { l: Math.min(o.x, x0), r: Math.max(o.x, x0), t: o.y - half, b: o.y + half }
                  : { l: o.x - half, r: o.x + half, t: Math.min(o.y, y0), b: Math.max(o.y, y0) };
    });
  }
  // The turn that puts a piece's back (its -y) toward (vx, vy).
  function ybBackTo(vx, vy) { return Math.round(Math.atan2(vx, -vy) * 180 / Math.PI); }

  // ---- the deck at the back door, the grill on it, the hot tub by it -------------------------
  var YB_NEAR = { deck: 1, grill: 1, hottub: 1 };
  if (typeof yardPut === "function") {
    var yardPutBasic = yardPut;
    yardPut = function (key, houses) {
      if (!YB_NEAR[key]) { return yardPutBasic.apply(this, arguments); }
      var put = 0;
      (houses || yardHouses()).forEach(function (H) {
        var got = 0;
        try { got = ybNear(key, H); } catch (e) { got = 0; }
        put += got || yardPutBasic(key, [H]);
      });
      return put;
    };
  }
  function ybNear(key, H) {
    var F = ybFrame(H);
    if (!F.house.length) { return 0; }
    var all = ybDoors(F);
    if (key === "deck") {
      // out of the back door, else a door out of the back or a side --
      // and not over the way out of another
      var doors = all.filter(function (o) { return !o.garage && o.oy < 0.5; });
      doors.sort(function (a, b) { return (b.back ? 1 : 0) - (a.back ? 1 : 0) || a.oy - b.oy; });
      for (var i = 0; i < doors.length; i++) {
        ybZones(F, all.filter(function (o) { return o !== doors[i]; }));
        if (ybDeck(F, doors[i])) { return 1; }
      }
      return 0;
    }
    var D = ybDeckOf(F);
    if (!D) { return 0; }
    ybZones(F, all.filter(function (o) { return o.d !== D.o.d; }));
    return key === "grill" ? ybOnDeck(F, D, "i_grill", key) : ybByDeck(F, D, "i_hottub", key);
  }
  // As wide as there is room for (5 m or less) and out 3.6 m, the door onto it.
  function ybDeck(F, o) {
    var P = F.P, ax = -o.oy, ay = o.ox;
    var sizes = [[5.0, 3.6], [4.2, 3.2], [3.6, 2.8], [3.0, 2.4]], offs = [0, -0.6, 0.6, -1.2, 1.2, -1.8, 1.8, -2.4, 2.4];
    for (var si = 0; si < sizes.length; si++) {
      var W = sizes[si][0] * P, Dp = sizes[si][1] * P;
      for (var k = 0; k < offs.length; k++) {
        var off = offs[k] * P;
        if (Math.abs(off) > W / 2 - o.w / 2 - 0.3 * P) { continue; }
        var cx = o.x + ax * off + o.ox * Dp / 2, cy = o.y + ay * off + o.oy * Dp / 2;
        var ex = Math.abs(ax) * W / 2 + Math.abs(o.ox) * Dp / 2, ey = Math.abs(ay) * W / 2 + Math.abs(o.oy) * Dp / 2;
        if (!ybClear(F, { l: cx - ex, r: cx + ex, t: cy - ey, b: cy + ey }, -3)) { continue; }
        var n = ybPut(F, "i_deck", cx, cy, 0);
        n.w = Math.round(2 * ex); n.h = Math.round(2 * ey); n.yard = "deck";
        return n;
      }
    }
    return null;
  }
  // The deck a door comes out onto, if any: its box, and that door.
  function ybDeckOf(F) {
    var P = F.P, doors = ybDoors(F).filter(function (o) { return !o.garage; }), got = null;
    hand.nodes.forEach(function (n) {
      if (got || n.kind !== "i_deck") { return; }
      var b = F.box(n), o = doors.filter(function (o) {
        var x = o.x + o.ox * 0.4 * P, y = o.y + o.oy * 0.4 * P;
        return x > b.l && x < b.r && y > b.t && y < b.b;
      })[0];
      if (o) { got = { n: n, b: b, o: o }; }
    });
    return got;
  }
  function ybDeckAxes(D) {
    var o = D.o, b = D.b, ax = -o.oy, ay = o.ox, cx = (b.l + b.r) / 2, cy = (b.t + b.b) / 2;
    var W = Math.abs(ax) * (b.r - b.l) + Math.abs(ay) * (b.b - b.t), Dp = Math.abs(o.ox) * (b.r - b.l) + Math.abs(o.oy) * (b.b - b.t);
    var s = (o.x - cx) * ax + (o.y - cy) * ay > 0 ? -1 : 1;          // the end away from the door
    return { ax: ax, ay: ay, cx: cx, cy: cy, W: W, D: Dp, s: s };
  }
  // On the deck, in its outer corner away from the door, its back to the yard.
  function ybOnDeck(F, D, kind, key) {
    var P = F.P, A = ybDeckAxes(D), o = D.o, icon = ICONS[kind];
    if (!icon) { return 0; }
    var gw = icon.box[0], gh = icon.box[1], along = A.W / 2 - gw / 2 - 0.3 * P, out = A.D / 2 - gh / 2 - 0.25 * P;
    if (along < 0 || out < 0) { return 0; }
    var n = ybPut(F, kind, A.cx + A.ax * A.s * along + o.ox * out, A.cy + A.ay * A.s * along + o.oy * out, ybBackTo(o.ox, o.oy));
    n.yard = key;
    return 1;
  }
  // Beside the deck, on the ground: off its far end, else past its outer edge.
  function ybByDeck(F, D, kind, key) {
    var P = F.P, A = ybDeckAxes(D), o = D.o, icon = ICONS[kind];
    if (!icon) { return 0; }
    var tw = icon.box[0], th = icon.box[1], spots = [];
    [A.s, -A.s].forEach(function (s) {
      var along = A.W / 2 + 0.5 * P + tw / 2, out = A.D / 2 - th / 2;
      spots.push([A.cx + A.ax * s * along + o.ox * out, A.cy + A.ay * s * along + o.oy * out]);
    });
    var past = A.D / 2 + 0.5 * P + th / 2, side = A.W / 2 - tw / 2;
    spots.push([A.cx + A.ax * A.s * side + o.ox * past, A.cy + A.ay * A.s * side + o.oy * past]);
    for (var i = 0; i < spots.length; i++) {
      var x = spots[i][0], y = spots[i][1];
      if (!ybClear(F, { l: x - tw / 2, r: x + tw / 2, t: y - th / 2, b: y + th / 2 }, 0.6 * P)) { continue; }
      var n = ybPut(F, kind, x, y, 0);
      n.yard = key;
      return 1;
    }
    return 0;
  }

  // ---- what every building has out of doors ------------------------------------------------
  // (after what was asked for: the deck first, then the rest -- each the
  // spot it wants before the everyday things take theirs)
  if (typeof yardMake === "function") {
    var yardMakeBasic = yardMake;
    yardMake = function (want, made) {
      var w = want;
      if (want && want.yard && typeof want.yard === "object") {
        var order = YARD_KINDS.map(function (Y) { return Y[0]; }), yard = {};
        Object.keys(want.yard).sort(function (a, b) { return (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99); })
              .forEach(function (k) { yard[k] = want.yard[k]; });
        w = Object.assign({}, want, { yard: yard });
      }
      var out = yardMakeBasic.call(this, w, made);
      try { ybBasics(want, made); } catch (e) { /* without them */ }
      return out;
    };
  }
  function ybBasics(want, made) {
    var type = (want && want.type) || "house";
    // (rooms drawn apart, joined by arrows: where things go round it is
    // where it stands put together, not on the paper -- left to be put by hand)
    if (want && want.spread) { return; }
    var lot = (made || []).filter(function (n) { return n.kind === "i_lot"; })[0];
    var houses = yardHouses().filter(function (H) { return !lot || H.lot === lot || H.lot.id === lot.id; });
    if (!lot) { houses = houses.slice(0, 1); }
    houses.forEach(function (H) {
      var F = ybFrame(H);
      if (!F.house.length) { return; }
      var doors = ybDoors(F);
      ybZones(F, doors);
      // (no lot drawn: only the lights -- the rest has nowhere to go)
      if (!lot && !hand.nodes.some(function (n) { return n.kind === "i_lot"; })) { ybLights(F, doors); return; }
      if (YB_HOMES[type]) {
        ybWalks(F, doors);
        ybMail(F, doors);
        ybBins(F, doors);
        ybCooler(F, doors);
      } else {
        ybDumpster(F, doors);
      }
      ybLights(F, doors);
    });
    picked = null; chosen = null; many = [];
  }
  // A walk from each front door to the street, stopping at anything in its way.
  function ybWalks(F, doors) {
    var P = F.P, half = 0.55 * P;
    doors.forEach(function (o) {
      if (o.garage || o.oy < 0.5) { return; }
      var y0 = o.y + 1.2 * P, y1 = F.L.b;
      hand.nodes.forEach(function (n) {
        if (!ybStands(F, n) || n.kind === "i_path") { return; }
        var b = F.box(n);
        if (b.l < o.x + half && b.r > o.x - half && b.b > y0 && b.t < y1) { y1 = Math.min(y1, b.t - 0.1 * P); }
      });
      if (y1 - y0 < 1.0 * P) { return; }
      var n = ybPut(F, "i_path", o.x, (y0 + y1) / 2, 0);
      n.w = Math.round(2 * half); n.h = Math.round(y1 - y0); n.outside = "walk";
      o.walk = { x: o.x, y: y1 };
    });
  }
  // The mailbox at the street: by the drive's end, away from the house's
  // middle -- else by the walk's.
  function ybMail(F, doors) {
    var P = F.P, icon = ICONS.i_mailbox;
    if (!icon) { return; }
    var mw = icon.box[0], mh = icon.box[1], y = F.L.b - 0.45 * P - mh / 2, mid = (F.hb.l + F.hb.r) / 2;
    var walks = doors.filter(function (o) { return o.walk; }), lists = [];
    function byWalk(o) {
      var away = o.x >= mid ? 1 : -1, off = 0.55 * P + 0.5 * P + mw / 2;
      return [[o.x + away * off, y], [o.x - away * off, y]];
    }
    // (a row of homes: each its own, at its walk)
    if (walks.length > 1) { walks.forEach(function (o) { lists.push(byWalk(o)); }); }
    else {
      var one = [];
      hand.nodes.forEach(function (n) {
        if (n.kind !== "i_driveway") { return; }
        var b = F.box(n);
        if (b.b < F.L.b - 1.5 * P || b.r < F.L.l || b.l > F.L.r) { return; }
        var away = (b.l + b.r) / 2 >= mid ? 1 : -1;
        one.push([away > 0 ? b.r + 0.5 * P + mw / 2 : b.l - 0.5 * P - mw / 2, y], [away > 0 ? b.l - 0.5 * P - mw / 2 : b.r + 0.5 * P + mw / 2, y]);
      });
      walks.forEach(function (o) { Array.prototype.push.apply(one, byWalk(o)); });
      lists.push(one);
    }
    lists.forEach(function (spots) {
      spots.some(function (s) {
        if (!ybClear(F, { l: s[0] - mw / 2 - 2, r: s[0] + mw / 2 + 2, t: s[1] - mh / 2, b: s[1] + mh / 2 }, 1.0 * P)) { return false; }
        var n = ybPut(F, "i_mailbox", s[0], s[1], 0);
        n.outside = "mail";
        return true;
      });
    });
  }
  // Somewhere along a side of the house for a piece `w` long (along the
  // wall) and `d` deep, `gap` off it: the side and the end each wants first.
  function ybAlongSide(F, w, d, gap, sides) {
    var P = F.P, hb = F.hb;
    for (var si = 0; si < sides.length; si++) {
      var side = sides[si][0], fromFront = sides[si][1];
      var y = fromFront ? hb.b - 1.0 * P - w / 2 : hb.t + 1.0 * P + w / 2, stop = fromFront ? hb.t + w / 2 : hb.b - w / 2;
      for (var k = 0; k < 80 && (fromFront ? y >= stop : y <= stop); k++, y += (fromFront ? -0.5 : 0.5) * P) {
        // the wall's face here: the house's furthest out over this stretch
        var face = null;
        F.house.forEach(function (b) {
          if (b.b <= y - w / 2 || b.t >= y + w / 2) { return; }
          face = face === null ? (side > 0 ? b.r : b.l) : side > 0 ? Math.max(face, b.r) : Math.min(face, b.l);
        });
        if (face === null) { continue; }
        var x = face + side * (gap + d / 2), box = { l: x - d / 2, r: x + d / 2, t: y - w / 2, b: y + w / 2 };
        if (ybClear(F, box, gap - 2)) { return { x: x, y: y, side: side }; }
      }
    }
    return null;
  }
  // The bins by the garage's side, toward the street -- else a side of the
  // house, toward the back; turned along the wall, their backs to it.
  function ybBins(F, doors) {
    var P = F.P, icon = ICONS.i_bins;
    if (!icon) { return; }
    var gate = doors.filter(function (o) { return o.garage; })[0], mid = (F.hb.l + F.hb.r) / 2;
    var g = gate ? (gate.x >= mid ? 1 : -1) : 1;
    var at = ybAlongSide(F, icon.box[0], icon.box[1], 0.15 * P, gate ? [[g, true], [-g, false], [g, false]] : [[1, false], [-1, false]]);
    if (!at) { return; }
    var n = ybPut(F, "i_bins", at.x, at.y, ybBackTo(-at.side, 0));
    n.outside = "bins";
  }
  // The air conditioner's unit: on the other side, about half way back.
  function ybCooler(F, doors) {
    var P = F.P, icon = ICONS.i_condenser;
    if (!icon) { return; }
    var bins = hand.nodes.filter(function (n) { return n.outside === "bins"; })[0], mid = (F.hb.l + F.hb.r) / 2;
    var other = bins ? (F.local(bins.x, bins.y)[0] >= mid ? -1 : 1) : 1;
    var at = ybAlongSide(F, icon.box[0], icon.box[1], 0.3 * P, [[other, false], [-other, false]]);
    if (!at) { return; }
    var n = ybPut(F, "i_condenser", at.x, at.y, ybBackTo(-at.side, 0));
    n.outside = "cooler";
    void doors;
  }
  // Behind a shop, an office, a school, a block of flats: the dumpster,
  // against the back wall by the back door, else toward a corner.
  function ybDumpster(F, doors) {
    var P = F.P, icon = ICONS.i_dumpster;
    if (!icon) { return; }
    var dw = icon.box[0], dh = icon.box[1], back = doors.filter(function (o) { return !o.garage && o.oy < -0.5; })[0];
    var aim = back ? back.x : F.hb.r - 2 * P, spots = [];
    for (var x = F.hb.l + dw / 2 + 0.3 * P; x <= F.hb.r - dw / 2 - 0.3 * P; x += 0.5 * P) {
      var face = null;
      F.house.forEach(function (b) { if (b.r > x - dw / 2 && b.l < x + dw / 2) { face = face === null ? b.t : Math.min(face, b.t); } });
      if (face !== null) { spots.push({ x: x, y: face - 0.4 * P - dh / 2, d: Math.abs(Math.abs(x - aim) - (back ? back.w / 2 + 1.0 * P + dw / 2 : 0)) }); }
    }
    spots.sort(function (a, b) { return a.d - b.d; });
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      if (!ybClear(F, { l: s.x - dw / 2, r: s.x + dw / 2, t: s.y - dh / 2, b: s.y + dh / 2 }, 0.3 * P)) { continue; }
      var n = ybPut(F, "i_dumpster", s.x, s.y, 180);
      n.outside = "dumpster";
      return;
    }
  }
  // A light by each door out, on the side away from a window, facing out.
  function ybLights(F, doors) {
    var P = F.P;
    doors.forEach(function (o) {
      if (o.garage) { return; }
      var here = F.world(o.x, o.y);
      if (hand.nodes.some(function (n) { return n.kind === "i_porchlight" && Math.hypot(n.x - here[0], n.y - here[1]) < o.w / 2 + 1.2 * P; })) { return; }
      var ax = -o.oy, ay = o.ox;
      [1, -1].some(function (s) {
        var lx = o.x + ax * s * (o.w / 2 + 0.3 * P), ly = o.y + ay * s * (o.w / 2 + 0.3 * P);
        if (!F.inHouse(lx - o.ox * 14, ly - o.oy * 14)) { return false; }          // the wall goes on behind it
        var busy = hand.nodes.some(function (n) {
          if (n === o.d || (n.kind !== "i_window" && !WALK_DOORS[n.kind])) { return false; }
          var q = F.local(n.x, n.y), dx = q[0] - lx, dy = q[1] - ly;
          return Math.abs(dx * ax + dy * ay) < n.w / 2 + 0.2 * P && Math.abs(dx * o.ox + dy * o.oy) < 0.8 * P;
        });
        if (busy) { return false; }
        var at = F.world(lx + o.ox * 8, ly + o.oy * 8);
        var n = adviceAdd("i_porchlight", Math.round(at[0]), Math.round(at[1]));
        snapToWalls([n.id]);
        n.outside = "light";
        return true;
      });
    });
  }

  // ---- in 3D: a deck at a door is up at its floor --------------------------------------------
  // On posts (a rim under it, a skirt where it is low), with steps down
  // from its far edge and a railing where it stands high; the door's own
  // landing and steps gone under it.  What stands on a deck stands on it.
  if (typeof terrKey === "function") {
    var terrKeyDecks = terrKey;
    terrKey = function () {
      var key = terrKeyDecks.apply(this, arguments);
      if (!key) { return key; }
      hand.nodes.forEach(function (n) {
        if (n.kind === "i_deck") { key += "|dk" + n.id + ":" + Math.round(n.x) + "," + Math.round(n.y) + "," + Math.round(n.w) + "," + Math.round(n.h) + "," + (n.turn || 0); }
      });
      return key;
    };
  }
  if (typeof terrMake === "function") {
    var terrMakeDecks = terrMake;
    terrMake = function () {
      var T = terrMakeDecks.apply(this, arguments);
      try { if (T && !T.off && T.doors) { ybDecks(T); } } catch (e) { T.decks = []; }
      return T;
    };
  }
  function ybDeckIn(D, x, y, pad) {
    var dx = x - D.x, dy = y - D.y;
    return Math.abs(dx * D.ax + dy * D.ay) <= D.hw + pad && Math.abs(-dx * D.ay + dy * D.ax) <= D.hd + pad;
  }
  function ybPadLow(p) {
    var lo = Infinity;
    [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].forEach(function (s) {
      lo = Math.min(lo, terrAt(p.x + p.ax * p.hw * s[0] - p.ay * p.hd * s[1], p.y + p.ay * p.hw * s[0] + p.ax * p.hd * s[1]));
    });
    return Math.min(lo - 0.1 * FLOOR_PX, p.top - 0.05 * FLOOR_PX);
  }
  function ybDecks(T) {
    var P = T.P;
    T.decks = [];
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_deck") { return; }
      var f = T.floors.length ? floorAt(T.floors, n.x, n.y) : null;
      if (f && f.level !== 0) { return; }
      var t = (n.turn || 0) * Math.PI / 180;
      var D = { n: n, x: n.x, y: n.y, ax: Math.cos(t), ay: Math.sin(t), hw: n.w / 2, hd: n.h / 2, raised: false };
      D.door = T.doors.filter(function (o) { return !o.garage && ybDeckIn(D, o.x + o.ox * 0.4 * P, o.y + o.oy * 0.4 * P, 4); })[0] || null;
      T.decks.push(D);
      if (!D.door) { return; }
      var o = D.door, oax = -o.oy, oay = o.ox;
      D.raised = true;
      D.top = -0.03 * P;
      o.fill = false;                        // (the ground not made up to it: the deck is)
      // its landing and steps gone: the deck is the landing
      T.pads = T.pads.filter(function (p) {
        if (ybDeckIn(D, p.x, p.y, 0.3 * P)) { return false; }
        var dx = p.x - o.x, dy = p.y - o.y, along = dx * o.ox + dy * o.oy;
        return !(along > 0 && along < 14 * P && Math.abs(dx * oax + dy * oay) < o.w / 2 + 0.4 * P);
      });
      // the ground under it
      D.lo = Infinity; D.hi = -Infinity;
      for (var i = -1; i <= 1; i += 0.5) {
        for (var j = -1; j <= 1; j += 0.5) {
          var g = terrAt(n.x + D.ax * D.hw * i - D.ay * D.hd * j, n.y + D.ay * D.hw * i + D.ax * D.hd * j);
          D.lo = Math.min(D.lo, g); D.hi = Math.max(D.hi, g);
        }
      }
      // walked on: a landing as big as it is
      T.pads.push({ x: n.x, y: n.y, ax: D.ax, ay: D.ay, hw: D.hw, hd: D.hd, top: D.top, lo: D.top, deck: true });
      // its far edge, the middle of it, and steps down from there
      var ua = o.ox * D.ax + o.oy * D.ay, uc = -o.ox * D.ay + o.oy * D.ax;
      var reach = Math.abs(ua) >= Math.abs(uc) ? D.hw : D.hd;
      D.edge = [n.x + o.ox * reach, n.y + o.oy * reach];
      D.out = [o.ox, o.oy];
      D.stairHalf = Math.min(0.65 * P, (Math.abs(ua) >= Math.abs(uc) ? D.hd : D.hw) - 0.1 * P);
      var at = 0, z = D.top;
      for (var s = 0; s < 40; s++) {
        var cx = D.edge[0] + o.ox * (at + 0.14 * P), cy = D.edge[1] + o.oy * (at + 0.14 * P);
        if (z - 0.18 * P <= terrAt(cx, cy) + 0.04 * P) { break; }
        z -= 0.18 * P;
        var pad = { x: cx, y: cy, ax: oax, ay: oay, hw: D.stairHalf, hd: 0.14 * P, top: z, step: true, deckStep: true };
        pad.lo = ybPadLow(pad);
        T.pads.push(pad);
        at += 0.28 * P;
      }
      D.steps = s;
    });
  }
  if (typeof terrBuilt === "function") {
    var terrBuiltDecks = terrBuilt;
    terrBuilt = function (T) {
      var pads = T.pads, faces;
      T.pads = pads.filter(function (p) { return !p.deck && !p.deckStep; });
      try { faces = terrBuiltDecks.apply(this, arguments); } finally { T.pads = pads; }
      try {
        (T.decks || []).forEach(function (D) { if (D.raised) { ybDeckFrame(T, D, faces); } });
        pads.forEach(function (p) { if (p.deckStep) { terrBox(faces, [p.x, p.y], [p.ax, p.ay], p.hw, p.hd, p.lo, p.top, YB_WOOD, false); } });
      } catch (e) { /* the deck on its own */ }
      return faces;
    };
  }
  var YB_WOOD = { piece: true, color: "#8a6a4c", edge: "#5d4632", pat: 21, bare: true };
  var YB_FRAME = { piece: true, color: "#6b533d", edge: "#4a3a2b", pat: 21, bare: true };
  var YB_RAIL = { piece: true, color: "#efece4", edge: "#c8c4ba", pat: 21, bare: true };
  function ybDeckFrame(T, D, faces) {
    var P = T.P, top = D.top, under = top - V3_HIGH.i_deck * P, high = top - D.lo;
    var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (k) {
      return [D.x + D.ax * D.hw * k[0] - D.ay * D.hd * k[1], D.y + D.ay * D.hw * k[0] + D.ax * D.hd * k[1]];
    });
    var cx = D.x, cy = D.y;
    for (var e = 0; e < 4; e++) {
      var A = corners[e], B = corners[(e + 1) % 4], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      var nx = mx - cx, ny = my - cy, nl = Math.hypot(nx, ny) || 1;
      nx /= nl; ny /= nl;
      if (nx * D.out[0] + ny * D.out[1] < -0.7) { continue; }        // against the house
      var len = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / len, uy = (B[1] - A[1]) / len;
      var far = nx * D.out[0] + ny * D.out[1] > 0.7;
      // the rim under the boards, and posts down to the ground -- or, low, a skirt
      var n3 = [nx, ny, 0];
      if (high > 0.75 * P) {
        faces.push({ pts: [[A[0], A[1], under - 0.22 * P], [B[0], B[1], under - 0.22 * P], [B[0], B[1], under], [A[0], A[1], under]], n: n3, how: YB_FRAME, found: true });
        var posts = Math.max(1, Math.ceil(len / (1.8 * P)));
        for (var k = 0; k <= posts; k++) {
          var tt = Math.max(0.12 * P, Math.min(len - 0.12 * P, len * k / posts));
          var px = A[0] + ux * tt - nx * 0.12 * P, py = A[1] + uy * tt - ny * 0.12 * P, gz = terrAt(px, py) - 0.1 * P;
          if (gz < under - 0.22 * P) { terrBox(faces, [px, py], [ux, uy], 0.06 * P, 0.06 * P, gz, under - 0.22 * P, YB_FRAME, true); }
        }
      } else {
        var bits = Math.max(1, Math.ceil(len / (0.5 * P)));
        for (var b = 0; b < bits; b++) {
          var a0 = len * b / bits, a1 = len * (b + 1) / bits;
          var p0 = [A[0] + ux * a0, A[1] + uy * a0], p1 = [A[0] + ux * a1, A[1] + uy * a1];
          var g0 = terrAt(p0[0] + nx * 0.2 * P, p0[1] + ny * 0.2 * P) - 0.05 * P, g1 = terrAt(p1[0] + nx * 0.2 * P, p1[1] + ny * 0.2 * P) - 0.05 * P;
          if (g0 < under || g1 < under) {
            faces.push({ pts: [[p0[0], p0[1], Math.min(g0, under)], [p1[0], p1[1], Math.min(g1, under)], [p1[0], p1[1], under], [p0[0], p0[1], under]], n: n3, how: YB_FRAME, found: true });
          }
        }
      }
      // a railing where a fall would hurt, open where the steps go down
      if (high > 0.6 * P) {
        var runs = [[0, len]];
        if (far && D.steps) {
          var at = (D.edge[0] - A[0]) * ux + (D.edge[1] - A[1]) * uy;
          runs = [[0, at - D.stairHalf - 0.05 * P], [at + D.stairHalf + 0.05 * P, len]];
        }
        runs.forEach(function (r) {
          if (r[1] - r[0] < 0.2 * P) { return; }
          var c0 = [A[0] + ux * (r[0] + r[1]) / 2 - nx * 0.05 * P, A[1] + uy * (r[0] + r[1]) / 2 - ny * 0.05 * P], hl = (r[1] - r[0]) / 2;
          terrBox(faces, c0, [ux, uy], hl, 0.045 * P, top + 0.9 * P, top + 0.97 * P, YB_RAIL, false);
          terrBox(faces, c0, [ux, uy], hl, 0.03 * P, top + 0.08 * P, top + 0.14 * P, YB_RAIL, false);
          var nPost = Math.max(1, Math.ceil((r[1] - r[0]) / (1.6 * P)));
          for (var q = 0; q <= nPost; q++) {
            var tq = r[0] + (r[1] - r[0]) * q / nPost;
            terrBox(faces, [A[0] + ux * tq - nx * 0.05 * P, A[1] + uy * tq - ny * 0.05 * P], [ux, uy], 0.045 * P, 0.045 * P, top, top + 0.97 * P, YB_RAIL, false);
          }
          for (var bt = r[0] + 0.12 * P; bt < r[1] - 0.06 * P; bt += 0.13 * P) {
            terrBox(faces, [A[0] + ux * bt - nx * 0.05 * P, A[1] + uy * bt - ny * 0.05 * P], [ux, uy], 0.018 * P, 0.018 * P, top + 0.14 * P, top + 0.9 * P, YB_RAIL, true);
          }
        });
      }
    }
  }
  // Up on it: the deck itself, and what stands on any deck.
  if (typeof terrNodeLift === "function") {
    var terrNodeLiftDecks = terrNodeLift;
    terrNodeLift = function (T, n) {
      if (n && T && T.decks && T.decks.length) {
        var P = T.P, deckH = (V3_HIGH.i_deck || 0.15) * P;
        for (var i = 0; i < T.decks.length; i++) {
          var D = T.decks[i];
          if (n.id === D.n.id) { if (D.raised) { return { z: D.top - deckH }; } break; }
          if (n.kind === "i_deck" || n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || n.kind === "i_zone" ||
              n.kind === "i_window" || WALK_DOORS[n.kind] || SNAP_IN_WALL[n.kind] || V3_WALL[n.kind] || FROM_CEILING[n.kind]) { continue; }
          if (!ybDeckIn(D, n.x, n.y, 0)) { continue; }
          return { z: D.raised ? D.top : terrAt(D.x, D.y) + deckH + 0.6 };
        }
      }
      return terrNodeLiftDecks.apply(this, arguments);
    };
  }

  // ---- the new pieces ---------------------------------------------------------------------
  if (typeof V3_HIGH === "object") { Object.assign(V3_HIGH, { i_bins: 1.07, i_condenser: 0.78, i_dumpster: 1.3 }); }
  if (typeof WALK_DO === "object") { Object.assign(WALK_DO, { i_bins: 700, i_condenser: 500, i_dumpster: 800 }); }
  if (typeof mDef === "function") {
    // two wheeled bins side by side, the trash and the recycling
    mDef("i_bins", function (M, W, D, H, C) {
      C = mPick(C, "#3b4046", "#2f62b0");
      var half = W / 2;
      [[-half / 2, C.main], [half / 2, C.frame]].forEach(function (one) {
        var x = one[0], bw = half - 4 * cm, body = M.mat("plastic", one[1]), lid = M.mat("plastic", mShade(one[1], -0.15));
        M.box(x - bw / 2 + 2.5 * cm, x + bw / 2 - 2.5 * cm, -D / 2 + 4 * cm, D / 2 - 4 * cm, 3 * cm, 14 * cm, body, 1 * cm);
        M.box(x - bw / 2 + 1 * cm, x + bw / 2 - 1 * cm, -D / 2 + 2 * cm, D / 2 - 1.5 * cm, 14 * cm, H - 7 * cm, body, 2 * cm);
        M.box(x - bw / 2, x + bw / 2, -D / 2 + 1 * cm, D / 2, H - 7 * cm, H - 4 * cm, body, 1 * cm);
        M.box(x - bw / 2 - 0.5 * cm, x + bw / 2 + 0.5 * cm, -D / 2, D / 2 + 1.5 * cm, H - 4 * cm, H, lid, 1.5 * cm);
        // the handle at the back, and the wheels under it
        M.box(x - bw / 2 + 5 * cm, x + bw / 2 - 5 * cm, -D / 2 - 3 * cm, -D / 2 + 1 * cm, H - 10 * cm, H - 6 * cm, body, 1 * cm);
        [-1, 1].forEach(function (s) {
          M.push().move(x + s * (bw / 2 - 3 * cm), -D / 2 + 6 * cm, 10 * cm).tiltY(90);
          M.cyl(0, 0, -2.5 * cm, 2.5 * cm, 10 * cm, M.mat("rubber", "#151515"), { seg: 14 });
          M.pop();
        });
      });
      // a white arrow-ring on the recycling's lid
      M.box(half / 2 - 8 * cm, half / 2 + 8 * cm, -6 * cm, 6 * cm, H, H + 0.3 * cm, M.mat("plastic", "#f2f2ee"), 1 * cm);
    });
    // the air conditioner's unit out of doors: a box of fins on a pad, the fan on top
    mDef("i_condenser", function (M, W, D, H, C) {
      C = mPick(C, "#c8c7c0", "#3a3c3f");
      var body = M.mat("metal", C.main), dark = M.mat("metal", C.frame), inset = 3 * cm;
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 5 * cm, M.mat("concrete", "#b8b5ad"), 0.8 * cm);
      M.box(-W / 2 + inset, W / 2 - inset, -D / 2 + inset, D / 2 - inset, 5 * cm, H - 6 * cm, dark);
      // the fins, round all four sides, between corner posts
      for (var z = 9 * cm; z < H - 9 * cm; z += 5 * cm) {
        M.box(-W / 2 + inset - 0.4 * cm, W / 2 - inset + 0.4 * cm, -D / 2 + inset - 0.4 * cm, D / 2 - inset + 0.4 * cm, z, z + 1.6 * cm, body);
      }
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (k) {
        var x = k[0] * (W / 2 - inset - 1.5 * cm), y = k[1] * (D / 2 - inset - 1.5 * cm);
        M.box(x - 2 * cm, x + 2 * cm, y - 2 * cm, y + 2 * cm, 5 * cm, H - 6 * cm, body);
      });
      // the lid, and the fan's grille in it
      M.box(-W / 2 + inset - 0.8 * cm, W / 2 - inset + 0.8 * cm, -D / 2 + inset - 0.8 * cm, D / 2 - inset + 0.8 * cm, H - 6 * cm, H - 2 * cm, body, 1 * cm);
      var R = Math.min(W, D) / 2 - inset - 4 * cm;
      M.cyl(0, 0, H - 2 * cm, H - 1 * cm, R, dark, { seg: 24 });
      M.cyl(0, 0, H - 1 * cm, H - 0.4 * cm, R * 0.18, body, { seg: 12 });
      for (var g = -R + 3 * cm; g < R; g += 3.5 * cm) {
        var half = Math.sqrt(Math.max(0, R * R - g * g));
        M.box(g - 0.3 * cm, g + 0.3 * cm, -half, half, H - 1 * cm, H - 0.5 * cm, body);
      }
      // the lines to the house, out of the back
      var cu = M.mat("metal", "#b8733e");
      [-1, 1].forEach(function (s) {
        M.tube([W / 4 + s * 3 * cm, -D / 2 + inset, 25 * cm], [W / 4 + s * 3 * cm, -D / 2 - 2 * cm, 25 * cm], 1.1 * cm, cu, 8, true);
        M.tube([W / 4 + s * 3 * cm, -D / 2 - 2 * cm, 25 * cm], [W / 4 + s * 3 * cm, -D / 2 - 2 * cm, 70 * cm], 1.1 * cm, cu, 8, true);
      });
    });
    // a steel dumpster on casters: its front sloped, two plastic lids, the forks' pockets
    mDef("i_dumpster", function (M, W, D, H, C) {
      C = mPick(C, "#2f5a3c", "#1f2224");
      var steel = M.mat("metal", C.main), lid = M.mat("plastic", C.frame), z0 = 14 * cm, z1 = H - 9 * cm, slope = 18 * cm;
      var y0 = -D / 2, y1 = D / 2 - slope;
      // the sides, the back, the sloped front and the floor
      [-1, 1].forEach(function (s) {
        var x = s * W / 2, pts = [[x, y0, z0], [x, y1, z0], [x, D / 2, z1], [x, y0, z1]];
        if (s < 0) { pts.reverse(); }
        M.quad(steel, pts[0], pts[1], pts[2], pts[3]);
      });
      M.quad(steel, [W / 2, y0, z0], [-W / 2, y0, z0], [-W / 2, y0, z1], [W / 2, y0, z1], [0, -1, 0]);
      var fn = mUnit([0, z1 - z0, -(D / 2 - y1)]);
      M.quad(steel, [-W / 2, y1, z0], [W / 2, y1, z0], [W / 2, D / 2, z1], [-W / 2, D / 2, z1], fn);
      M.quad(steel, [-W / 2, y0, z0], [W / 2, y0, z0], [W / 2, y1, z0], [-W / 2, y1, z0], [0, 0, -1]);
      // the rim and the two lids
      M.box(-W / 2 - 1 * cm, W / 2 + 1 * cm, y0 - 1 * cm, D / 2 + 1 * cm, z1, z1 + 3 * cm, steel, 0.6 * cm);
      [-1, 1].forEach(function (s) {
        M.box(s > 0 ? 1 * cm : -W / 2, s > 0 ? W / 2 : -1 * cm, y0 - 2 * cm, D / 2 + 3 * cm, z1 + 3 * cm, H, lid, 1.5 * cm);
      });
      // the fork pockets on either side, and a caster under each corner
      [-1, 1].forEach(function (s) {
        M.box(s * W / 2 - (s > 0 ? 0 : 6 * cm), s * W / 2 + (s > 0 ? 6 * cm : 0), y0 + 8 * cm, D / 2 - slope - 8 * cm, z1 - 30 * cm, z1 - 18 * cm, steel, 1 * cm);
      });
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (k) {
        var x = k[0] * (W / 2 - 10 * cm), y = k[1] * (D / 2 - slope / 2 - 10 * cm) - (k[1] > 0 ? slope / 2 : 0);
        M.box(x - 4 * cm, x + 4 * cm, y - 4 * cm, y + 4 * cm, z0 - 4 * cm, z0, M.mat("metal", "#5a5d60"));
        M.push().move(x, y, 6 * cm).tiltY(90);
        M.cyl(0, 0, -2 * cm, 2 * cm, 5.5 * cm, M.mat("rubber", "#151515"), { seg: 12 });
        M.pop();
      });
    });
  }

  // ---- the street's own walk and mailbox (39-house.js), where these are drawn -----------------
  // (one walk to a door, one mailbox at the street: the drawn ones, which
  // can be moved or taken away; the street's only where there are none)
  if (typeof houseStreetBits === "function") {
    var houseStreetBitsOwn = houseStreetBits;
    houseStreetBits = function () {
      var P = FLOOR_PX, walks = hand.nodes.filter(function (n) { return n.kind === "i_path"; });
      if (!walks.length) { return houseStreetBitsOwn.apply(this, arguments); }
      var keep = hand.nodes;
      hand.nodes = keep.filter(function (d) {
        if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor") { return true; }
        return !walks.some(function (w) {
          var t = (w.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t);
          return [-1, 1].some(function (s) { return Math.hypot(w.x + ux * s * w.h / 2 - d.x, w.y + uy * s * w.h / 2 - d.y) < 2.4 * P; });
        });
      });
      try { return houseStreetBitsOwn.apply(this, arguments); } finally { hand.nodes = keep; }
    };
  }

  // ---- downpipes clear of what stands by the walls -------------------------------------------
  // (2026-10-03: "things appearing over the gutters covering them"): each
  // moves along its wall off a deck, a hot tub, the bins, the air
  // conditioner -- anything out of doors within reach of its foot -- and,
  // with a porch over the door, off the porch.
  var ybByWalls = { key: null, boxes: [] };
  function ybOutBoxes() {
    if (ybByWalls.key === houseSpouts) { return ybByWalls.boxes; }
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; }), boxes = [];
    hand.nodes.forEach(function (n) {
      if (!ICONS[n.kind] || n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || n.kind === "i_zone" || n.kind === "i_window" ||
          n.kind === "i_lawn" || n.kind === "i_flowerbed" || ON_THE_WALL[n.kind] || FROM_CEILING[n.kind] || WALK_DOORS[n.kind]) { return; }
      if (rooms.some(function (r) { return insideArea(r, n.x, n.y); })) { return; }
      var q = turned(n);
      boxes.push({ l: n.x - q.w / 2, r: n.x + q.w / 2, t: n.y - q.h / 2, b: n.y + q.h / 2 });
    });
    ybByWalls = { key: houseSpouts, boxes: boxes };
    return boxes;
  }
  if (typeof gutterHoles === "function") {
    var gutterHolesBare = gutterHoles;
    gutterHoles = function (line, across) {
      var out = gutterHolesBare.apply(this, arguments);
      try {
        var P = FLOOR_PX;
        ybOutBoxes().forEach(function (b) {
          var lo = across ? b.t : b.l, hi = across ? b.b : b.r;
          if (hi < line - 0.9 * P || lo > line + 0.9 * P) { return; }
          out.push({ lo: (across ? b.l : b.t) - 0.1 * P, hi: (across ? b.r : b.b) + 0.1 * P });
        });
        var S = typeof styleNow === "function" ? styleNow() : null;
        if ((S && S.porch) || (typeof houseOpt === "function" && houseOpt("frontPorch"))) {
          hand.nodes.forEach(function (d) {
            if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor") { return; }
            var q = turned(d), deep = (across ? q.h : q.w) / 2;
            if (Math.abs((across ? d.y : d.x) - line) > 0.35 * P + deep) { return; }
            var mid = across ? d.x : d.y, half = (across ? q.w : q.h) / 2 + 1.0 * P;
            out.push({ lo: mid - half, hi: mid + half });
          });
        }
      } catch (e) { /* the doors and windows only */ }
      return out;
    };
  }

  // ---- level on the land ------------------------------------------------------------------
  // (2026-10-03: "since the ground is no longer even there is stuff sinking
  // into the ground"): what stands on a base of its own -- a shed, a hot
  // tub, the bins, a dumpster -- stands level at the highest ground under
  // it, on a concrete pad down to the lowest; what stands on legs or a
  // post stays where its middle meets the ground.
  var YB_LEGS = { i_trampoline: 1, i_swing: 1, i_gardenbench: 1, i_lounger: 1, i_roundtable: 1, i_dining: 1, i_chair: 1, i_grill: 1,
                  i_birdbath: 1, i_mailbox: 1, i_lamppost: 1, i_pathlight: 1, i_bikerack: 1, i_parked: 1, i_tree: 1, i_shrub: 1, i_plant: 1,
                  i_palm: 1, i_cactus: 1, i_firepit: 1, i_stool: 1, i_bench: 1, i_cart: 1 };
  var YB_PAD = { piece: true, color: "#aba79e", edge: "#8a877f", pat: 63, bare: true };
  function ybLevel(T, n) {
    if (YB_LEGS[n.kind] || !isSolid(n.kind) || Math.max(n.w, n.h) < 0.4 * T.P) { return null; }
    var key = n.id + "|" + Math.round(n.x) + "|" + Math.round(n.y) + "|" + Math.round(n.w) + "|" + Math.round(n.h) + "|" + (n.turn || 0);
    if (!T.ybLevel) { T.ybLevel = new Map(); }
    if (T.ybLevel.has(key)) { return T.ybLevel.get(key); }
    var t = (n.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), lo = Infinity, hi = -Infinity;
    [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (k) {
      var dx = k[0] * n.w / 2, dy = k[1] * n.h / 2, g = terrAt(n.x + dx * c - dy * s, n.y + dx * s + dy * c);
      lo = Math.min(lo, g); hi = Math.max(hi, g);
    });
    var out = hi - lo > 0.03 * T.P ? { z: hi, lo: lo } : null;
    if (T.ybLevel.size > 4000) { T.ybLevel.clear(); }
    T.ybLevel.set(key, out);
    return out;
  }
  if (typeof terrNodeLift === "function") {
    var terrNodeLiftLevel = terrNodeLift;
    terrNodeLift = function (T, n) {
      var L = terrNodeLiftLevel.apply(this, arguments);
      if (!L || L.drape || L.z === undefined || !n || !T || !T.P) { return L; }
      var lev = ybLevel(T, n);
      return lev && lev.z > L.z ? { z: lev.z } : L;
    };
  }
  if (typeof terrDress === "function") {
    var terrDressPads = terrDress;
    terrDress = function (model) {
      var out = terrDressPads.apply(this, arguments);
      try {
        var T = TERR;
        if (T && !T.off && TERR_ON) {
          var floors = T.floors || [];
          hand.nodes.forEach(function (n) {
            if (!ICONS[n.kind] || YB_LEGS[n.kind]) { return; }
            var f = floors.length ? floorAt(floors, n.x, n.y) : null;
            if ((f && f.level !== 0) || terrOut(T, n.x, n.y) <= 2) { return; }
            var L = terrNodeLift(T, n);
            if (!L || L.drape || L.z === undefined) { return; }
            var lev = ybLevel(T, n);
            if (!lev || Math.abs(L.z - lev.z) > 0.5) { return; }
            var t = (n.turn || 0) * Math.PI / 180;
            terrBox(model.faces, [n.x, n.y], [Math.cos(t), Math.sin(t)], n.w / 2 + 0.06 * T.P, n.h / 2 + 0.06 * T.P, lev.lo - 0.08 * T.P, lev.z, YB_PAD, true);
          });
        }
      } catch (e) { /* standing as they were */ }
      return out;
    };
  }

  // ---- nothing boxed in, whatever the back door moved ---------------------------------------
  // (an own find, 2026-10-03: a nightstand put down in the one way to the
  // en suite's door shut the toilet away)  Made, and something can't be
  // got to: the small piece nearby whose going frees the most goes.
  var YB_SMALL = { i_nightstand: 1, i_plant: 1, i_palm: 1, i_cactus: 1, i_chest: 1, i_lamp: 1, i_arclamp: 1, i_sidetable: 1, i_beanbag: 1,
                   i_ottoman: 1, i_stool: 1, i_hamper: 1, i_trash: 1, i_toybox: 1, i_cattree: 1, i_dogbed: 1, i_coatrack: 1, i_bench: 1,
                   i_consoletable: 1, i_floormirror: 1, i_fan: 1, i_heater: 1, i_armchair: 1, i_chair: 1, i_vase: 1 };
  function ybUnbox(from) {
    if (typeof boxedPieces !== "function" || typeof walkPlan !== "function") { return; }
    var P = FLOOR_PX;
    for (var tries = 0; tries < 6; tries++) {
      var boxed = boxedPieces(walkPlan());
      if (!boxed.length) { return; }
      var near = [];
      boxed.forEach(function (b) { var q = tieBox(b.room); near.push({ l: q.l - 1.5 * P, r: q.r + 1.5 * P, t: q.t - 1.5 * P, b: q.b + 1.5 * P }); });
      var best = null;
      hand.nodes.slice().forEach(function (n) {
        if (!YB_SMALL[n.kind] || n.id < (from || 0) || !near.some(function (q) { return n.x > q.l && n.x < q.r && n.y > q.t && n.y < q.b; })) { return; }
        var at = hand.nodes.indexOf(n);
        hand.nodes.splice(at, 1);
        var left = boxedPieces(walkPlan()).length;
        hand.nodes.splice(at, 0, n);
        if (left < boxed.length && (!best || left < best.left)) { best = { n: n, left: left }; }
      });
      if (!best) { return; }
      var gone = best.n, room = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, gone.x, gone.y); })[0];
      hand.nodes.splice(hand.nodes.indexOf(gone), 1);
      // and put down again elsewhere in its room where that boxes nothing in
      // (a nightstand by the bed's other side)
      if (room && typeof starterAlong === "function") {
        var bed = gone.kind === "i_nightstand" && typeof starterBedOf === "function" ? starterBedOf(room) : null, n0 = hand.nodes.length;
        var put = starterAlong(room, gone.kind, bed);
        if (put) {
          put();
          if (boxedPieces(walkPlan()).length > best.left) { hand.nodes.splice(n0, hand.nodes.length - n0); }
        }
      }
      picked = null; chosen = null; many = [];
    }
  }
  // (and another: a window put in a wall that a room made after -- the
  // bonus room over the garage -- then stood against, between two rooms:
  // taken out, and the room's daylight found in another outside wall)
  function ybWindowsOut(from) {
    if (typeof tieLayout !== "function") { return; }
    var J = tieLayout(), floors = typeof floorsOf === "function" ? floorsOf() : [], rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; });
    function fOf(n) { return floors.length ? floorAt(floors, n.x, n.y) : null; }
    // (a school's courtyard is out of doors: a window onto it stays, 40-campus.js)
    var RB = rooms.filter(function (r) { return !r.court; }).map(function (r) {
      var B = (J && J.boxes && J.boxes[r.id]) || tieBox(r), f = fOf(r), dx = f ? f.dx || 0 : 0, dy = f ? f.dy || 0 : 0;
      return { l: B.l + dx, r: B.r + dx, t: B.t + dy, b: B.b + dy, level: f ? f.level : 0, bldg: f ? f.bldg : 0 };
    });
    var gone = [];
    hand.nodes.forEach(function (w) {
      if (w.kind !== "i_window" || w.id < (from || 0)) { return; }
      var host = rooms.filter(function (o) { return insideArea(o, w.x, w.y, -14); })[0];
      if (!host) { return; }
      var m = J && J.moves && J.moves[w.id], d = (J && J.delta && J.delta[host.id]) || [0, 0], f = fOf(w);
      var x = (m ? m.x : w.x + d[0]) + (f ? f.dx || 0 : 0), y = (m ? m.y : w.y + d[1]) + (f ? f.dy || 0 : 0);
      var t = (w.turn || 0) * Math.PI / 180, nx = Math.sin(t), ny = -Math.cos(t), lv = f ? f.level : 0, bl = f ? f.bldg : 0;
      var both = [-1, 1].every(function (s) {
        var px = x + nx * s * 14, py = y + ny * s * 14;
        return RB.some(function (o) { return o.level === lv && o.bldg === bl && px > o.l + 1 && px < o.r - 1 && py > o.t + 1 && py < o.b - 1; });
      });
      if (both) { gone.push({ w: w, host: host }); }
    });
    // (moved where another outside wall has room; where none has, kept --
    // daylight through the room it now looks into before none at all)
    gone.forEach(function (g) {
      var at = hand.nodes.indexOf(g.w);
      hand.nodes.splice(at, 1);
      if (hand.nodes.some(function (n) { return n.kind === "i_window" && insideArea(g.host, n.x, n.y, -14); })) { return; }
      var n0 = hand.nodes.length, put = typeof starterIntoWall === "function" ? starterIntoWall(g.host, "i_window", null) : null;
      if (put) { put(); if (hand.nodes.length > n0) { return; } }
      if (typeof roomEdges === "function" && typeof edgeGaps === "function") {
        var plan = walkPlan(), P = FLOOR_PX, best = null;
        roomEdges(plan, g.host).forEach(function (e) {
          if (!e.outside) { return; }
          edgeGaps(plan, g.host, e).forEach(function (gp) { if (gp[1] - gp[0] >= 0.75 * P && (!best || gp[1] - gp[0] > best.len)) { best = { e: e, at: (gp[0] + gp[1]) / 2, len: gp[1] - gp[0] }; } });
        });
        if (best) {
          var n = adviceAdd("i_window", Math.round(best.e.across ? best.at : best.e.line), Math.round(best.e.across ? best.e.line : best.at));
          snapToWalls([n.id]);
          n.w = Math.round(Math.min(1.0 * P, best.len - 0.2 * P)); n.own = true;
          return;
        }
      }
      hand.nodes.splice(at, 0, g.w);
    });
    if (gone.length) { picked = null; chosen = null; many = []; }
  }
  // (an own find too: asked "in its place, or next door?", the house was
  // then made by the steps inside the asking only -- a shop's glass front,
  // its style, its kind's furniture, wrapped round the asking, were left
  // out, and ran on the drawing as it was.  The asking goes round them all
  // now, Change this house… round it; and nothing boxed in, last inside.)
  if (typeof STARTER_WRAPS === "object") {
    var ybHoodWrap = null, ybEditWrap = null;
    STARTER_WRAPS.forEach(function (fn) {
      var s = String(fn);
      if (s.indexOf("hoodAsk") >= 0) { ybHoodWrap = fn; }
      else if (s.indexOf("editNow") >= 0) { ybEditWrap = fn; }
    });
    var ybUnboxWrap = function* (inner, want) {
      var before = hand.next, out = yield* inner(want);
      if (out !== undefined || hand.nodes.some(function (n) { return n.kind === "i_room"; })) {
        // (only what this made: another house's, as it is)
        try { ybHearths(before, want); } catch (e) { /* as made */ }
        try { ybWindowsOut(before); } catch (e) { /* as made */ }
        try { ybUnbox(before); } catch (e) { /* as made */ }
      }
      return out;
    };
    if (ybHoodWrap) {
      var ybRest = STARTER_WRAPS.filter(function (fn) { return fn !== ybHoodWrap && fn !== ybEditWrap; });
      STARTER_WRAPS.length = 0;
      ybRest.forEach(function (fn) { STARTER_WRAPS.push(fn); });
      STARTER_WRAPS.push(ybUnboxWrap, ybHoodWrap);
      if (ybEditWrap) { STARTER_WRAPS.push(ybEditWrap); }
    } else {
      STARTER_WRAPS.push(ybUnboxWrap);
    }
  }

  // ---- a chimney for every fireplace ---------------------------------------------------------
  // (asked for, 2026-10-03: "when it comes to like apartment buildings if
  // there are going to be fireplaces and chimney's there need to be a lot
  // for all the rooms")  Built in a style with a chimney, every home in it
  // -- the house, each flat, each home of a row -- has a fireplace in its
  // living room, against an outside wall where there is one; and every
  // fireplace has a flue up to the roof: those over one another on the
  // floors of a block, and two back to back, in one stack.  A stack against
  // an outside wall stands outside it from the ground, one inside comes up
  // through the roof -- each past the roof within 3 m of it -- with a pot
  // for every flue.  Fireplaces in a style without a chimney go up a
  // steel flue each.  The style's lone chimney only where there is no
  // fireplace.
  //
  // (2026-10-04: "it really should just be 1 chimney unless you are
  // designing an apartment with fireplaces which should be optional settings
  // too and it running in front of windows too and there just not being a
  // fireplace where it is running")  How many fireplaces is a setting
  // (hearths): none; one -- a house's, in its living room downstairs, what a
  // house in a style with a chimney has unless asked otherwise; or one in
  // every home of a duplex, a row, a block -- asked for, never there unasked.
  // A chimney only ever over a fireplace (the style's lone chimney is gone),
  // up an outside wall only where no window or door is in its way on any
  // floor, else up inside the walls and out through the roof.
  var YB_HEARTH = { living: 1, great: 1, family: 1, flat: 1 };
  var YB_FIRES = ["none", "one", "each"];
  var YB_MANY = { duplex: 1, townhouses: 1, apartments: 1, condos: 1, tower: 1 };
  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.hearths = "auto"; }
  // What is asked (`asked`: none, one, each, or auto) comes to for a building of `type` in style S.
  function ybFireMode(asked, type, S) {
    var homes = type === "house" || type === "cabin" || !type ? 1 : YB_MANY[type] ? 2 : 0;
    if (!homes) { return "none"; }
    if (YB_FIRES.indexOf(asked) >= 0) { return homes === 1 && asked === "each" ? "one" : asked; }
    return homes === 1 && S && S.chimney ? "one" : "none";
  }
  function ybFireNow(want) {
    var type = want && want.type ? want.type : (typeof lwTypeNow === "function" ? lwTypeNow() : "house");
    var asked = want && want.site && want.site.hearths !== undefined ? want.site.hearths : houseOpt("hearths");
    var key = want && want.style !== undefined ? want.style : null;
    var S = key && typeof HOUSE_STYLES === "object" ? HOUSE_STYLES[key] : (typeof styleNow === "function" ? styleNow() : null);
    return ybFireMode(asked, type, S);
  }
  // The room that has the one fireplace: the biggest living room on the lowest floor.
  function ybFireRoom(rooms, plan, floors) {
    function lv(r) { var f = floors.length ? floorAt(floors, r.x, r.y) : null; return f ? f.level : 0; }
    function rank(r) { var k = typeof wireKindOf === "function" ? wireKindOf(plan, r) : ""; return k === "living" || k === "great" ? 0 : 1; }
    return rooms.slice().sort(function (a, b) { return lv(a) - lv(b) || rank(a) - rank(b) || b.w * b.h - a.w * a.h; })[0] || null;
  }
  function ybHearths(from, want) {
    var mode = ybFireNow(want);
    if (typeof starterAlong !== "function") { return; }
    var plan = walkPlan(), homes = [], floors0 = typeof floorsOf === "function" ? floorsOf() : [];
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room" || r.id < (from || 0)) { return; }
      var k = typeof wireKindOf === "function" ? wireKindOf(plan, r) : "";
      if (YB_HEARTH[k] || YB_HEARTH[r.use]) { homes.push(r); }
    });
    // (what was put in with the rooms' furniture, kept to what is asked: none, or the one)
    // (from the view's settings, from 0: only those put in for the house -- one put down by hand stays)
    var made = hand.nodes.filter(function (n) { return n.kind === "i_fireplace" && n.id >= (from || 0) && (from > 0 || n.hearth); });
    if (mode !== "each") {
      var keep = null;
      if (mode === "one") {
        var main = ybFireRoom(homes, plan, floors0);
        keep = main ? made.filter(function (n) { return insideArea(main, n.x, n.y); })[0] || null : made[0] || null;
        homes = main ? [main] : [];
      } else { homes = []; }
      var gone = made.filter(function (n) { return n !== keep; });
      if (gone.length) { hand.nodes = hand.nodes.filter(function (n) { return gone.indexOf(n) < 0; }); }
      if (keep) { keep.hearth = true; homes = []; }
    }
    // (floor by floor up: over a fireplace on the floor under, the same
    // spot where it fits -- one stack, not one a floor)
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    function fl(n) { return floors.length ? floorAt(floors, n.x, n.y) : null; }
    homes.sort(function (a, b) { var fa = fl(a), fb = fl(b); return (fa ? fa.level : 0) - (fb ? fb.level : 0); });
    homes.forEach(function (r) {
      if (hand.nodes.some(function (n) { return n.kind === "i_fireplace" && insideArea(r, n.x, n.y); })) { return; }
      var fr = fl(r);
      if (fr && typeof kindsPut === "function") {
        var under = hand.nodes.filter(function (n) {
          if (n.kind !== "i_fireplace") { return false; }
          var fn = fl(n);
          return fn && fn !== fr && fn.level === fr.level - 1 && insideArea(r, n.x + fn.dx - fr.dx, n.y + fn.dy - fr.dy, 4);
        })[0];
        if (under) {
          var fu = fl(under), was = typeof typeRoom !== "undefined" ? typeRoom : null, got = null;
          // (or a little along its wall: still in the stack)
          var ut = (under.turn || 0) * Math.PI / 180, ax = Math.cos(ut), ay = Math.sin(ut), P = FLOOR_PX;
          try {
            typeRoom = r;
            [0, 0.25, -0.25, 0.5, -0.5, 0.75, -0.75].some(function (k) {
              got = kindsPut("i_fireplace", under.x + fu.dx - fr.dx + ax * k * P, under.y + fu.dy - fr.dy + ay * k * P, under.turn || 0, 3);
              return !!got;
            });
          } finally { typeRoom = was; }
          if (got) { return; }
        }
      }
      var edges = typeof roomEdges === "function" ? roomEdges(plan, r).filter(function (e) { return e.outside; }) : [];
      edges.sort(function (a, b) { return b.len - a.len; });
      var e = edges[0], near = e ? (e.across ? { x: (e.from + e.to) / 2, y: e.line } : { x: e.line, y: (e.from + e.to) / 2 }) : null;
      var put = starterAlong(r, "i_fireplace", near);
      if (put) { put(); }
    });
    // (each one put in for the house marked so: the setting takes them out again, 3D Settings)
    hand.nodes.forEach(function (n) { if (n.kind === "i_fireplace" && n.id >= (from || 0)) { n.hearth = true; } });
    picked = null; chosen = null; many = [];
  }
  // (put in first, with the rest of the room's furniture, where the style
  // asked for is known before the house is made: the sofa then finds its
  // own wall, and flats alike from floor to floor have it in the same spot
  // -- one stack)
  var ybHearthSpecs = [];
  function ybHearthUndo() {
    ybHearthSpecs.forEach(function (R) { R.wall = R.wall.filter(function (k) { return k !== "i_fireplace"; }); });
    ybHearthSpecs = [];
  }
  if (typeof STARTER_WRAPS === "object") {
    STARTER_WRAPS.unshift(function* (inner, want) {
      ybHearthUndo();
      // (as many as asked: none; the one, in a living room; one in every home)
      var mode = ybFireNow(want);
      if (mode !== "none" && typeof STARTER_ROOMS === "object") {
        Object.keys(YB_HEARTH).forEach(function (k) {
          if (mode === "one" && k !== "living" && k !== "great") { return; }
          var R = STARTER_ROOMS[k];
          if (R && R.wall && R.wall.indexOf("i_fireplace") < 0) { R.wall = ["i_fireplace"].concat(R.wall); ybHearthSpecs.push(R); }
        });
      }
      try { return yield* inner(want); } finally { ybHearthUndo(); }
    });
  }
  // Where each fireplace's flue goes up: its back to the wall behind it,
  // stacked with those over and beside it.
  function ybFlues() {
    var P = FLOOR_PX, floors = typeof floorsOf === "function" ? floorsOf() : [], rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; });
    function floorOf(x, y) { return floors.length ? floorAt(floors, x, y) : null; }
    var each = [];
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_fireplace") { return; }
      var f = floorOf(n.x, n.y), room = rooms.filter(function (r) { return insideArea(r, n.x, n.y); }).sort(function (a, b) { return a.w * a.h - b.w * b.h; })[0];
      if (!room) { return; }
      var t = (n.turn || 0) * Math.PI / 180, bx = Math.sin(t), by = -Math.cos(t), x = n.x + bx * n.h / 2, y = n.y + by * n.h / 2;
      for (var k = 0; k < 40 && insideArea(room, x, y); k++) { x += bx * 2; y += by * 2; }
      var same = rooms.filter(function (r) { return floorOf(r.x, r.y) === f; });
      var outside = !same.some(function (r) { return insideArea(r, x + bx * 0.3 * P, y + by * 0.3 * P); });
      each.push({ room: room, x: x + (f ? f.dx : 0), y: y + (f ? f.dy : 0), bx: bx, by: by, outside: outside, z: f ? f.z : 0 });
    });
    var stacks = [];
    each.forEach(function (e) {
      var s = stacks.filter(function (q) { return Math.hypot(q.x - e.x, q.y - e.y) < 1.0 * P; })[0];
      if (!s) { s = { x: e.x, y: e.y, bx: e.bx, by: e.by, outside: e.outside, room: e.room, all: [] }; stacks.push(s); }
      s.all.push(e);
      s.x = s.all.reduce(function (m, q) { return m + q.x; }, 0) / s.all.length;
      s.y = s.all.reduce(function (m, q) { return m + q.y; }, 0) / s.all.length;
      s.outside = s.outside && e.outside;
    });
    // (up an outside wall only where nothing is in its way, floor over floor --
    // a window, a door -- else up inside the walls and out through the roof)
    var openings = hand.nodes.filter(function (w) { return w.kind === "i_window" || WALK_DOORS[w.kind]; }).map(function (w) {
      var f = floorOf(w.x, w.y), t = turned(w);
      return { x: w.x + (f ? f.dx : 0), y: w.y + (f ? f.dy : 0), half: Math.max(t.w, t.h) / 2 };
    });
    stacks.forEach(function (s) {
      if (!s.outside) { return; }
      var ax = -s.by, ay = s.bx, wide = (0.55 * P + 0.2 * P * Math.min(6, s.all.length - 1)) / 2;
      if (openings.some(function (o) {
        var dx = o.x - s.x, dy = o.y - s.y;
        return Math.abs(dx * s.bx + dy * s.by) < 0.45 * P && Math.abs(dx * ax + dy * ay) < wide + o.half + 0.3 * P;
      })) { s.outside = false; }
    });
    stacks.forEach(function (s) {
      // (as many flues as fireplaces; two on one floor, back to back: the stack deeper)
      var levels = {};
      s.all.forEach(function (q) { levels[Math.round(q.z)] = (levels[Math.round(q.z)] || 0) + 1; });
      s.flues = s.all.length;
      s.across = Math.max.apply(null, Object.keys(levels).map(function (k) { return levels[k]; }));
      var w = 0.55 * P + 0.2 * P * Math.min(6, s.flues - 1), d = 0.45 * P + 0.25 * P * (s.across - 1);
      s.w = w; s.d = d;
      if (s.outside) { s.x += s.bx * d / 2; s.y += s.by * d / 2; }
      var r = Math.max(w, d) / 2;
      s.box = [s.x - r, s.x + r, s.y - r, s.y + r];
    });
    return stacks;
  }
  // (kept clear by the solar panels, 40-solar.js)
  function flueKeepOff() {
    var P = FLOOR_PX;
    return ybFlues().map(function (s) { return [s.box[0] - 0.35 * P, s.box[1] + 0.35 * P, s.box[2] - 0.35 * P, s.box[3] + 0.35 * P]; });
  }
  function ybRoofAt(roofs, x, y) {
    var top = -Infinity;
    roofs.forEach(function (f) {
      var poly = f.pts, inside = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var a = poly[i], b = poly[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / ((b[1] - a[1]) || 1e-9) + a[0]) { inside = !inside; }
      }
      if (!inside) { return; }
      var p = poly[0], n = f.n || [0, 0, 1];
      if (Math.abs(n[2]) < 0.05) { return; }
      var z = p[2] - (n[0] * (x - p[0]) + n[1] * (y - p[1])) / n[2];
      if (z > top) { top = z; }
    });
    return top;
  }
  function ybChimneys(model, S) {
    var stacks = ybFlues();
    if (!stacks.length) { return false; }
    var P = FLOOR_PX, roofs = model.faces.filter(function (f) { return f.how && (f.roof || f.how.roof) && !f.how.xray && f.pts && f.pts.length >= 3; });
    if (!roofs.length) { return true; }
    var brick = S && S.chimney, col = S && S.chimney === "stone" ? "#9a9488" : "#8c4a3a";
    var look = { piece: true, color: col, edge: v3Mix(col, "#000000", 0.35), pat: S && S.chimney === "stone" ? 41 : 40 };
    var steel = { piece: true, color: "#b9bcbf", edge: "#7d8185", pat: 23 };
    stacks.forEach(function (s) {
      // (one outside the wall: the roof's height over the wall it stands against)
      var here = -Infinity;
      for (var back = 0; back <= 1.6 * P && here === -Infinity; back += 0.2 * P) { here = ybRoofAt(roofs, s.x - s.bx * back, s.y - s.by * back); }
      var high = here;
      if (here === -Infinity) { return; }
      for (var k = 0; k < 12; k++) {
        var a = k / 12 * Math.PI * 2, z = ybRoofAt(roofs, s.x + Math.cos(a) * 3 * P, s.y + Math.sin(a) * 3 * P);
        if (z > high) { high = z; }
      }
      var top = Math.max(here + 0.9 * P, high + 0.6 * P), f0 = model.faces.length;
      var ax = -s.by, ay = s.bx;                                   // along the wall
      function box(cx, cy, hw, hd, z0, z1, how) {
        var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return [cx + ax * hw * q[0] + s.bx * hd * q[1], cy + ay * hw * q[0] + s.by * hd * q[1]]; });
        v3Prism(model.faces, pts, z0, z1, how);
      }
      if (brick) {
        var foot = s.outside ? (typeof terrGround === "function" ? terrGround(s.x, s.y) : 0) - 0.1 * P : here - 0.3 * P;
        box(s.x, s.y, s.w / 2, s.d / 2, foot, top, look);
        box(s.x, s.y, s.w / 2 + 0.05 * P, s.d / 2 + 0.05 * P, top, top + 0.08 * P, { piece: true, color: "#6f6a62", edge: "#3f3a32" });
        // a pot for every flue
        for (var i = 0; i < Math.min(7, s.flues); i++) {
          var u = (i - (Math.min(7, s.flues) - 1) / 2) * 0.2 * P;
          box(s.x + ax * u, s.y + ay * u, 0.06 * P, 0.06 * P, top + 0.08 * P, top + 0.3 * P, { piece: true, color: "#9c5a3c", edge: "#5c3424" });
        }
      } else {
        // steel flues, one a fireplace, up through the roof and a cap on each
        for (var j = 0; j < Math.min(7, s.flues); j++) {
          var v = (j - (Math.min(7, s.flues) - 1) / 2) * 0.3 * P, cx = s.x + ax * v - s.bx * 0.15 * P, cy = s.y + ay * v - s.by * 0.15 * P;
          var ring = [], capR = [];
          for (var q = 0; q < 12; q++) { var b = q / 12 * Math.PI * 2; ring.push([cx + Math.cos(b) * 0.1 * P, cy + Math.sin(b) * 0.1 * P]); capR.push([cx + Math.cos(b) * 0.17 * P, cy + Math.sin(b) * 0.17 * P]); }
          v3Prism(model.faces, ring, here - 0.2 * P, top, steel);
          v3Prism(model.faces, capR, top, top + 0.06 * P, steel);
        }
      }
      for (var m = f0; m < model.faces.length; m++) { model.faces[m].node = s.room; }
    });
    return true;
  }
  // the style's own lone chimney: never -- a chimney with no fireplace under
  // it had no purpose (2026-10-04); a house in a style with one has its
  // fireplace and the chimney over it, unless none is asked for
  if (typeof styleChimney === "function") {
    styleChimney = function () { return; };
  }
  if (typeof styleExtras === "function") {
    var styleExtrasFlues = styleExtras;
    styleExtras = function (model) {
      var out = styleExtrasFlues.apply(this, arguments);
      try {
        if (V3 && V3.scene !== "space" && !(V3.flat && V3.flatDone) && !V3.low) {
          var inside = V3.mode === "walk", indoors = inside && !!V3.inRoom;
          var whole = inside ? !indoors : (V3.upTo === null || V3.upTo === undefined) && (V3.rise === undefined ? 1 : V3.rise) >= 0.98;
          if (whole) { ybChimneys(model, typeof styleNow === "function" ? styleNow() : null); }
        }
      } catch (e) { /* without them */ }
      return out;
    };
  }
