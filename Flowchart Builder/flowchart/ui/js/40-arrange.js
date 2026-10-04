// ---------------------------------------------------------------------------
//  40-arrange.js -- what goes together, put together: the coffee table in
//  front of the sofa on its rug, the armchairs drawn up to it, nightstands
//  either side of the bed with their lamps, the chair pulled up to the desk;
//  and a house with an open plan, its living rooms one space
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "There also needs to be better logic in placing
  // furniture around so the stuff that should be together is together and
  // to also allow for more open spaces rather than a bunch of confined
  // rooms and hallways")
  //
  // Start a house (39-starter.js) puts each piece against a wall or in the
  // middle, one at a time: a coffee table in the middle of the room
  // whatever the sofa was doing, an armchair on any wall, the desk chair
  // anywhere.  Afterwards, room by room, what belongs with something is put
  // with it -- each move kept only where the piece still fits: in the room,
  // clear of the rest, of every door's swing and of what needs room in front.
  // And with Open plan chosen, the walls between the living room, the
  // kitchen, the dining room and the hall come out (`room.open`, 39-inside.js:
  // a beam carries what the wall did).

  // ---- will it go there --------------------------------------------------------------------------
  // The floor kept clear at every door into a room: the doors drawn, and the
  // doors 3D will make where rooms drawn apart meet (39-join.js).
  function arrangeDoorways(J) {
    var out = [], doors = [];
    hand.nodes.forEach(function (d) { if (WALK_DOORS[d.kind]) { doors.push(d); } });
    if (J && J.any) {
      (J.made || []).forEach(function (one) {
        var d = one.node;
        J.rooms.forEach(function (r) {
          var box = J.boxes[r.id], dl = J.delta[r.id] || [0, 0];
          if (!box || d.x < box.l - 30 || d.x > box.r + 30 || d.y < box.t - 30 || d.y > box.b + 30) { return; }
          doors.push(Object.assign({}, d, { x: d.x - dl[0], y: d.y - dl[1] }));
        });
      });
    }
    doors.forEach(function (d) {
      var t = (d.turn || 0) * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t);
      [-(d.h / 2 + 18), d.h / 2 + 18].forEach(function (off) {
        out.push({ kind: "i_door", x: d.x + ux * off, y: d.y + uy * off, w: d.w + 8, h: 36, turn: d.turn });
      });
      out.push({ kind: "i_door", x: d.x, y: d.y, w: d.w, h: d.h, turn: d.turn });
    });
    return out;
  }
  function arrangeFits(r, piece, x, y, turn, skip, ways) {
    var probe = Object.assign({}, piece, { x: Math.round(x), y: Math.round(y) });
    if (turn) { probe.turn = ((turn % 360) + 360) % 360; } else { delete probe.turn; }
    var t = turned(probe), T = roomWallOf(r), b = tieBox(r), flat = !!LIES_FLAT[piece.kind];
    if (probe.x - t.w / 2 < b.l + T + 1 || probe.x + t.w / 2 > b.r - T - 1 || probe.y - t.h / 2 < b.t + T + 1 || probe.y + t.h / 2 > b.b - T - 1) {
      return null;
    }
    var others = hand.nodes.filter(function (o) {
      if (o === piece || o === r || skip.indexOf(o) >= 0 || isArea(o.kind) || o.kind === "i_window") { return false; }
      if (ON_THE_WALL[o.kind] || FROM_CEILING[o.kind] || (ON_TOP[o.kind] && !flat)) { return false; }
      if (flat || LIES_FLAT[o.kind]) { return WALK_DOORS[o.kind]; }   // a rug is walked over, and lies under
      return insideArea(r, o.x, o.y, -24);
    });
    if (others.some(function (o) { return boxesTouch(probe, o, WALK_DOORS[o.kind] ? 6 : 2); })) { return null; }
    if (!flat && ways.some(function (w) { return boxesTouch(probe, w, 1); })) { return null; }
    if (!flat && typeof starterFrontClash === "function" && starterFrontClash(probe, others)) { return null; }
    return probe;
  }
  // Put it there if it goes: true if it moved.
  function arrangeMove(r, piece, x, y, turn, skip, ways) {
    var got = arrangeFits(r, piece, x, y, turn, skip || [], ways);
    if (!got) { return false; }
    piece.x = got.x; piece.y = got.y;
    if (got.turn) { piece.turn = got.turn; } else { delete piece.turn; }
    return true;
  }
  // Its way out, and its way across, as it is turned: the front of a sofa,
  // the foot of a bed.
  function arrangeAxes(n) {
    var a = (n.turn || 0) * Math.PI / 180;
    return { f: [-Math.sin(a), Math.cos(a)], s: [Math.cos(a), Math.sin(a)] };
  }
  // Turned to face a point.
  function arrangeFacing(from, to) {
    var dx = to[0] - from[0], dy = to[1] - from[1];
    var a = Math.round(Math.atan2(-dx, dy) * 180 / Math.PI / 90) * 90;
    return ((a % 360) + 360) % 360;
  }

  // ---- room by room ----------------------------------------------------------------------------------
  function arrangeRoom(r, ways) {
    var P = FLOOR_PX;
    function inRoom(kinds) {
      var list = kinds.split(" ");
      return hand.nodes.filter(function (n) { return list.indexOf(n.kind) >= 0 && insideArea(r, n.x, n.y); });
    }
    var moved = 0;
    // A seat facing a television, with a table before it on a rug,
    // armchairs drawn up to its sides, a side table and a lamp at its end.
    var sofa = inRoom("i_sofa i_sectional i_loveseat")[0];
    if (sofa) {
      var A = arrangeAxes(sofa), fx = A.f[0], fy = A.f[1], sx = A.s[0], sy = A.s[1];
      var coffee = inRoom("i_coffee")[0], gap = 0.45 * P;
      if (coffee) {
        var d0 = sofa.h / 2 + gap + coffee.h / 2;
        if (arrangeMove(r, coffee, sofa.x + fx * d0, sofa.y + fy * d0, sofa.turn || 0, [], ways) ||
            arrangeMove(r, coffee, sofa.x + fx * (d0 - 0.12 * P), sofa.y + fy * (d0 - 0.12 * P), sofa.turn || 0, [], ways)) { moved++; }
      }
      var rug = inRoom("i_rug")[0];
      if (rug) {
        var mid = coffee ? [coffee.x, coffee.y] : [sofa.x + fx * (sofa.h / 2 + 0.8 * P), sofa.y + fy * (sofa.h / 2 + 0.8 * P)];
        if (arrangeMove(r, rug, mid[0] - fx * 0.15 * P, mid[1] - fy * 0.15 * P, sofa.turn || 0, [], ways)) { moved++; }
      }
      var at = coffee ? [coffee.x, coffee.y] : [sofa.x + fx * (sofa.h / 2 + 0.9 * P), sofa.y + fy * (sofa.h / 2 + 0.9 * P)];
      var reach = (coffee ? coffee.w / 2 : 0.5 * P) + 0.5 * P;
      // (and not with its back to the television: a long sofa's table put
      // the chairs drawn up to it far enough out to face away, 2026-10-03)
      var screen = inRoom("i_tv i_walltv")[0];
      inRoom("i_armchair i_rocker").forEach(function (chair, i) {
        var tried = i % 2 ? [-1, 1] : [1, -1];
        tried.some(function (side) {
          var cx = at[0] + sx * side * (reach + chair.h / 2), cy = at[1] + sy * side * (reach + chair.h / 2);
          var turn = arrangeFacing([cx, cy], at);
          if (screen) {
            var ta = turn * Math.PI / 180, dx = screen.x - cx, dy = screen.y - cy;
            if ((-Math.sin(ta) * dx + Math.cos(ta) * dy) / (Math.hypot(dx, dy) || 1) <= 0.35) { return false; }
          }
          if (arrangeMove(r, chair, cx, cy, turn, [], ways)) { moved++; return true; }
          return false;
        });
      });
      var side = inRoom("i_sidetable")[0], lamp = inRoom("i_lamp i_arclamp")[0];
      [[side, 0.04], [lamp, 0.08]].forEach(function (pair, k) {
        var thing = pair[0];
        if (!thing) { return; }
        var sides = k ? [-1, 1] : [1, -1];
        sides.some(function (sgn) {
          var off = sofa.w / 2 + thing.w / 2 + pair[1] * P, back = -sofa.h / 2 + thing.h / 2 + 0.05 * P;
          return arrangeMove(r, thing, sofa.x + sx * sgn * off + fx * back, sofa.y + sy * sgn * off + fy * back, sofa.turn || 0, [], ways) && ++moved;
        });
      });
    }
    // A bed: a nightstand either side of its head, a lamp on each, a rug
    // under its foot, a bench or a chest across its end.
    var bed = inRoom("i_bedking i_bed i_bed1 i_daybed")[0];
    if (bed) {
      var B = arrangeAxes(bed), bf = B.f, bs = B.s;
      var stands = inRoom("i_nightstand").slice(0, 2);
      if (stands.length) {
        // room for one either side: the bed slid along its wall -- toward the
        // middle of the room first -- to where they both go (a bed in a
        // corner had a nightstand on one side only, or none)
        var wasX = bed.x, wasY = bed.y, need = stands.length;
        var toMid = (r.x - bed.x) * bs[0] + (r.y - bed.y) * bs[1], shifts = [0, toMid];
        for (var k = 1; k <= 8; k++) { shifts.push(toMid + k * 0.2 * P, toMid - k * 0.2 * P); }
        var pictures = inRoom("i_picture").filter(function (pc) {
          return Math.abs((pc.x - bed.x) * bs[0] + (pc.y - bed.y) * bs[1]) < bed.w / 2 && ((pc.x - bed.x) * bf[0] + (pc.y - bed.y) * bf[1]) < 0;
        });
        var keep = stands.map(function (ns) { return [ns.x, ns.y, ns.turn]; });
        var both = shifts.some(function (sh) {
          var bx = wasX + bs[0] * sh, by = wasY + bs[1] * sh;
          if (sh && !arrangeFits(r, bed, bx, by, bed.turn || 0, stands.concat(pictures), ways)) { return false; }
          bed.x = Math.round(bx); bed.y = Math.round(by);
          var got = 0;
          stands.forEach(function (ns, i) {
            [i ? -1 : 1, i ? 1 : -1].some(function (sgn) {
              var off = bed.w / 2 + ns.w / 2 + 0.03 * P, back = -bed.h / 2 + ns.h / 2 + 0.02 * P;
              var ok = arrangeMove(r, ns, bed.x + bs[0] * sgn * off + bf[0] * back, bed.y + bs[1] * sgn * off + bf[1] * back, bed.turn || 0, [], ways);
              if (ok) { got++; }
              return ok;
            });
          });
          if (got >= need) {
            pictures.forEach(function (pc) { pc.x = Math.round(pc.x + bed.x - wasX); pc.y = Math.round(pc.y + bed.y - wasY); });
            moved += got + (sh ? 1 : 0);
            return true;
          }
          bed.x = wasX; bed.y = wasY;      // not here: as they were
          stands.forEach(function (ns, i) { ns.x = keep[i][0]; ns.y = keep[i][1]; if (keep[i][2]) { ns.turn = keep[i][2]; } else { delete ns.turn; } });
          return false;
        });
        // no spot for both: each where it can go by the bed as it stands
        if (!both) {
          stands.forEach(function (ns, i) {
            [i ? -1 : 1, i ? 1 : -1].some(function (sgn) {
              var off = bed.w / 2 + ns.w / 2 + 0.03 * P, back = -bed.h / 2 + ns.h / 2 + 0.02 * P;
              var ok = arrangeMove(r, ns, bed.x + bs[0] * sgn * off + bf[0] * back, bed.y + bs[1] * sgn * off + bf[1] * back, bed.turn || 0, [], ways);
              if (ok) { moved++; }
              return ok;
            });
          });
        }
      }
      // a lamp on each nightstand (it stands on what is under it, 38-view3d.js)
      inRoom("i_tablelamp").forEach(function (lp, i) {
        var ns = stands[i];
        if (ns) { lp.x = ns.x; lp.y = ns.y; moved++; }
      });
      var rugB = inRoom("i_rug")[0];
      if (rugB && !sofa) {
        if (arrangeMove(r, rugB, bed.x + bf[0] * bed.h * 0.18, bed.y + bf[1] * bed.h * 0.18, bed.turn || 0, [], ways)) { moved++; }
      }
      var foot = inRoom("i_bench i_chest i_ottoman")[0];
      if (foot) {
        var dF = bed.h / 2 + foot.h / 2 + 0.08 * P;
        if (arrangeMove(r, foot, bed.x + bf[0] * dF, bed.y + bf[1] * dF, bed.turn || 0, [], ways)) { moved++; }
      }
    }
    // A desk: its chair pulled up to it, facing it; what stands on it, on it.
    // (each chair and each screen to the desk nearest it, one chair a desk:
    // in an office of many desks every screen in the room was set on each
    // desk in turn, and ended up in a row by the last, 2026-10-03)
    var desks = inRoom("i_desk i_standdesk i_lshapedesk i_vanitytable"), seats = inRoom("i_officechair i_chair i_stool");
    var tops = inRoom("i_desklamp i_monitor"), claimed = new Set();
    function nearestDesk(t) {
      var best = null, bd = Infinity;
      desks.forEach(function (d) { var dd = Math.hypot(t.x - d.x, t.y - d.y); if (dd < bd) { bd = dd; best = d; } });
      return best;
    }
    desks.forEach(function (desk) {
      var D = arrangeAxes(desk), chair = seats.filter(function (c) {
        return !claimed.has(c) && Math.hypot(c.x - desk.x, c.y - desk.y) < 3 * P && nearestDesk(c) === desk;
      })[0];
      if (chair) {
        claimed.add(chair);
        var dC = desk.h / 2 + chair.h / 2 + 0.03 * P;
        if (arrangeMove(r, chair, desk.x + D.f[0] * dC, desk.y + D.f[1] * dC, (desk.turn || 0) + 180, [desk], ways) ||
            arrangeMove(r, chair, desk.x + D.f[0] * (dC + chair.h * 0.35), desk.y + D.f[1] * (dC + chair.h * 0.35), (desk.turn || 0) + 180, [], ways)) { moved++; }
      }
      tops.filter(function (t) { return nearestDesk(t) === desk && Math.hypot(t.x - desk.x, t.y - desk.y) < Math.max(desk.w, desk.h); }).forEach(function (thing, i, mine) {
        var off = mine.length > 1 ? (i - (mine.length - 1) / 2) * desk.w * 0.45 : 0;
        thing.x = Math.round(desk.x + D.s[0] * off - D.f[0] * desk.h * 0.15);
        thing.y = Math.round(desk.y + D.s[1] * off - D.f[1] * desk.h * 0.15);
        thing.turn = desk.turn || 0;
        if (!thing.turn) { delete thing.turn; }
        moved++;
      });
    });
    // A television on its stand.
    var tvStand = inRoom("i_tvstand")[0], tv = inRoom("i_tv")[0];
    if (tvStand && tv) { tv.x = tvStand.x; tv.y = tvStand.y; tv.turn = tvStand.turn || 0; if (!tv.turn) { delete tv.turn; } moved++; }
    return moved;
  }

  // ---- an open plan --------------------------------------------------------------------------------
  var ARRANGE_OPEN = { living: 1, kitchen: 1, dining: 1, great: 1, family: 1, hall: 1, sunroom: 1 };
  if (typeof HOUSE_ICONS === "object") HOUSE_ICONS.openplan = '<path d="M2.6 4.4h14.8v11.2H2.6z"/><path d="M8.4 4.4v3M8.4 12.6v3M2.6 10h2.6M14.8 10h2.6" stroke-dasharray="1.6 1.4"/>' +
                         '<path d="M6.2 13.2h4.4M12.6 6.6h2.4v2.4"/>';
  // (2026-10-04: "there are either poles in the house or metal beams in the
  // ceiling holding things up") What Start building's open plans are held
  // up by: steel beams on show over where the walls were, posts only where a
  // beam needs one -- or posts in a line where each wall was, beams over
  // them (wallPostSpots, 39-inside.js; the beams drawn, 40-struct.js).
  var ARRANGE_SUPPORT = ["beams", "posts"];
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.sup_beams = '<path d="M2.4 3.4h15.2M2.4 6.8h15.2M10 3.4v3.4"/><path d="M3.6 6.8V17M16.4 6.8V17M2.4 17h15.2"/>';
    HOUSE_ICONS.sup_posts = '<path d="M2.4 4h15.2v2.6H2.4zM5 6.6V17M10 6.6V17M15 6.6V17M3.6 17h2.8M8.6 17h2.8M13.6 17h2.8"/>';
  }
  function arrangeSupport(want) {
    var how = want && ARRANGE_SUPPORT.indexOf(want.support) >= 0 ? want.support : "beams";
    // (`openSet`: these put here, to be taken off again by a house made without an open plan, 39-starter.js)
    var h = Object.assign({}, hand.house || {}, { support: how, beams: "open", openSet: true });
    if (how === "beams") { h.frame = "steel"; } else { delete h.frame; }
    hand.house = h;
  }
  function arrangeOpen(made, J, want) {
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    if (want && want.openPlan && (!want.type || want.type === "house")) { arrangeSupport(want); }
    var publicRooms = made.filter(function (o) {
      if (!ARRANGE_OPEN[o.kind]) { return false; }
      var f = floors.length ? floorAt(floors, o.room.x, o.room.y) : null;
      return !f || f.level === 0;
    }).map(function (o) { return o.room; });
    var boxOf = function (n) { return (J && J.boxes && J.boxes[n.id]) || tieBox(n); };
    var opened = 0, halls = made.filter(function (o) { return o.kind === "hall"; }).map(function (o) { return o.room; });
    // (a side toward living rooms only, out whole; toward some of them, the
    // stretch shared with each -- a metre and more of it -- 39-inside.js)
    function openSide(room, edge) {
      var across = wallAcross(room, edge, boxOf), mine = across.filter(function (it) { return publicRooms.indexOf(it.room) >= 0; });
      if (!mine.length) { return; }
      if (mine.length === across.length) {
        var list = (room.open || []).slice();
        if (list.indexOf(edge) < 0) { list.push(edge); room.open = list; opened++; }
        return;
      }
      mine.forEach(function (it) {
        if (it.hi - it.lo < 1.2 * FLOOR_PX) { return; }
        var to = (room.openTo || []).slice();
        if (to.indexOf(it.room.id) < 0) { to.push(it.room.id); room.openTo = to; opened++; }
      });
    }
    publicRooms.forEach(function (room) {
      // (the living rooms' own walls, toward each other and the hall -- never
      // the hall's: its side ran along the bedrooms as well, and opened them)
      if (typeof wallAcross !== "function" || halls.indexOf(room) >= 0) { return; }
      ["top", "foot", "left", "right"].forEach(function (edge) { openSide(room, edge); });
    });
    // a flight of stairs on the living floor, open to it: its bay's sides
    // toward the living rooms out -- not the side the flight stands against
    made.forEach(function (o) {
      if (o.kind !== "stairs" || typeof wallAcross !== "function") { return; }
      var bay = o.room, f = floors.length ? floorAt(floors, bay.x, bay.y) : null;
      if (f && f.level !== 0) { return; }
      var flight = hand.nodes.filter(function (s) { return s.kind === "i_stairs" && insideArea(bay, s.x, s.y); })[0];
      // (a floor with a hall: the stairs off it, as they were)
      if (!flight || halls.some(function (h) { return !floors.length || floorAt(floors, h.x, h.y) === f; })) { return; }
      var t = turned(flight), side = t.h > t.w ? (flight.x < bay.x ? "left" : "right") : (flight.y < bay.y ? "top" : "foot");
      ["top", "foot", "left", "right"].forEach(function (edge) { if (edge !== side) { openSide(bay, edge); } });
    });
    // the doors those walls had, gone with them
    if (opened) {
      hand.nodes = hand.nodes.filter(function (d) {
        if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor") { return true; }
        var both = publicRooms.filter(function (r) { return insideArea(r, d.x, d.y, -12); });
        return both.length < 2;
      });
    }
    // and under the ends of each beam where a wall that carried the house
    // came out, a post (Check would ask for them: 39-inside.js)
    if (opened && typeof wallInfo === "function" && typeof wallJoined === "function") {
      var W = wallJoined(), done = {}, closed = [];
      var stairs = made.filter(function (o) { return o.kind === "stairs" && ((o.room.open && o.room.open.length) || o.room.openTo); }).map(function (o) { return o.room; });
      publicRooms.concat(stairs).forEach(function (room) {
        ["top", "foot", "left", "right"].forEach(function (edge) {
          wallInfo(room.id, edge).forEach(function (info) {
            var key = [Math.min(room.id, info.other), Math.max(room.id, info.other)].join("|");
            if (done[key] || !info.spots.length) { return; }
            done[key] = true;
            var made = [];
            info.spots.filter(function (p) { return !wallPostNear(W, p, 0.5 * FLOOR_PX); }).forEach(function (p) {
              made.push(arrangePostAt(W, room, edge, p));
            });
            // a post where a door swings: that wall stays
            var hit = made.some(function (post) {
              return hand.nodes.some(function (dr) { return SNAP_IN_WALL[dr.kind] === "swing" && boxesTouch(post, dr, 1); });
            });
            if (hit) {
              hand.nodes = hand.nodes.filter(function (n) { return made.indexOf(n) < 0; });
              var list = (room.open || []).filter(function (e) { return e !== edge; });
              if (list.length) { room.open = list; } else { delete room.open; }
              var to = (room.openTo || []).filter(function (id) { return id !== info.other; });
              if (to.length) { room.openTo = to; } else { delete room.openTo; }
              closed.push([room, edge]);
            }
          });
        });
      });
    }
    return opened;
  }

  // A post under a beam where it needs one -- slid a little along the beam,
  // under it still, off anything standing there.
  function arrangePostAt(W, room, edge, p) {
    var d = W.delta(room), P = FLOOR_PX, along = edge === "top" || edge === "foot", at = [Math.round(p[0] - d[0]), Math.round(p[1] - d[1])];
    var size = ICONS.i_post ? ICONS.i_post.box : [8, 8];
    var free = function (x, y) {
      var probe = { kind: "i_post", x: x, y: y, w: size[0], h: size[1] };
      return !hand.nodes.some(function (o) {
        return o.kind !== "i_room" && !isArea(o.kind) && !LIES_FLAT[o.kind] && !ON_THE_WALL[o.kind] && !FROM_CEILING[o.kind] && o.kind !== "i_window" && boxesTouch(probe, o, 2);
      });
    };
    [0, 0.25, -0.25, 0.5, -0.5].some(function (k) {
      var x = at[0] + (along ? Math.round(k * P) : 0), y = at[1] + (along ? 0 : Math.round(k * P));
      if (!free(x, y)) { return false; }
      at = [x, y];
      return true;
    });
    var post = adviceAdd("i_post", at[0], at[1]);
    post.postFor = room.id + ":" + edge; post.tall = ceilOf(room); post.own = true;
    return post;
  }
  // Every opening of an open plan with the posts its beam needs: once the
  // house is finished -- an attic put over it after its walls came out
  // (40-attic.js) makes those walls carry a floor.
  function arrangeOpenPosts() {
    if (!(hand.house && hand.house.openSet) || typeof wallInfo !== "function" || typeof wallJoined !== "function") { return 0; }
    var W = wallJoined(), done = {}, added = 0;
    hand.nodes.filter(function (n) { return typeof wallSomeOpen === "function" && wallSomeOpen(n); }).forEach(function (room) {
      ["top", "foot", "left", "right"].forEach(function (edge) {
        wallInfo(room.id, edge).forEach(function (info) {
          var key = [Math.min(room.id, info.other), Math.max(room.id, info.other)].join("|");
          if (done[key] || !info.spots.length) { return; }
          done[key] = true;
          info.spots.filter(function (p) { return !wallPostNear(W, p, 0.5 * FLOOR_PX); }).forEach(function (p) { arrangePostAt(W, room, edge, p); added++; });
        });
      });
    });
    return added;
  }

  // ---- after Start a house -----------------------------------------------------------------------------
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var out = yield* inner(want);
      try {
        var J = typeof tieLayout === "function" ? tieLayout() : null, ways = arrangeDoorways(J), moved = 0;
        // where everything was, to put back what the grouping boxes in
        var was = new Map();
        hand.nodes.forEach(function (n) { if (n.kind !== "i_room") { was.set(n, [n.x, n.y, n.turn]); } });
        var rooms = starterLast || [];
        for (var ai = 0; ai < rooms.length; ai++) {
          var one = rooms[ai];
          var mine = ways.filter(function (w) { return insideArea(one.room, w.x, w.y, -40); });
          moved += arrangeRoom(one.room, mine);
          yield ["arrange", (ai + 1) / rooms.length];
        }
        // (2026-10-02: a lamp put at a sofa's end, in a corner with no way to
        // it) anything now nobody can get to, back where Start a house put it
        if (moved && typeof boxedPieces === "function" && typeof walkPlan === "function") {
          for (var round = 0; round < 3; round++) {
            var back = 0;
            boxedPieces(walkPlan()).forEach(function (b) {
              hand.nodes.forEach(function (n) {
                var w = was.get(n);
                if (!w || (n.x === w[0] && n.y === w[1])) { return; }
                if (Math.hypot(n.x - b.p.x, n.y - b.p.y) > 160) { return; }
                n.x = w[0]; n.y = w[1];
                if (w[2]) { n.turn = w[2]; } else { delete n.turn; }
                back++;
              });
            });
            if (!back) { break; }
          }
        }
        var opened = want && want.openPlan ? arrangeOpen(starterLast || [], J) : 0;
        if (moved || opened) {
          picked = null; chosen = null; many = [];      // (a post put in was left picked)
          if (typeof handKeep === "function") { handKeep(); }
          drawHand(); drawHandPanel();
        }
      } catch (e) { if (window.console && console.warn) { console.warn("arranging the house:", e && e.message); } }
      return out;
    });
  }
