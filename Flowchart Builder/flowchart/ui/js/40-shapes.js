// ---------------------------------------------------------------------------
//  40-shapes.js -- an office, a block of flats or condos, a mall, a school
//  that is not one long box: an L, a T, a U, an H, two wings side-stepped
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "there seems to still be issues of it making
  // things in straight lines" -- the building layouts, every type but a
  // house a rectangle of two straight rows of rooms)
  //
  // Start building lays a building out in two rows of rooms either side of
  // a hall, each row from the same end.  Its shape is made in the plan:
  //  - an L: rooms from the end of the back row put at the end of the front;
  //  - side-stepped (a Z): an empty stretch at the start of the back row and
  //    at the end of the front, the two wings passing each other;
  //  - a T: an empty stretch at each end of the back row, the front made as
  //    long again (its biggest rooms the bigger);
  //  - a U: an empty stretch in the middle of the back row (or, a forecourt,
  //    of the front), the other row as long again;
  //  - an H: an empty stretch in the middle of both, the hall a bridge.
  // An empty stretch is a placeholder room while the building is made --
  // nothing goes in it, nothing opens into it -- taken away once the rooms
  // stand, windows put in the walls that now face out onto it.  Every floor
  // is shaped alike, so the floors stand one over the other and each
  // stairwell's flights stay one over the next.
  var SH_FLEX = {
    office: ["openoffice", "meeting", "office", "staff", "reception"],
    apartments: ["flat", "lobby", "landing"],
    condos: ["flat", "lobby", "gym", "landing"],
    mall: ["mallunit", "mallanchor"],
    school: ["classroom", "cafeteria"]
  };
  // which shapes each type takes, and how often (a plain box now and then)
  var SH_MENU = {
    office: [["ell", 3], ["zed", 3], ["tee", 3], ["you", 2], ["fore", 2], ["aitch", 3], ["bar", 1]],
    apartments: [["ell", 3], ["zed", 3], ["tee", 2], ["aitch", 3], ["bar", 1]],
    condos: [["ell", 3], ["zed", 3], ["tee", 2], ["bar", 1]],
    mall: [["zed", 3], ["aitch", 2], ["ell", 2], ["tee", 2], ["bar", 1]],
    school: [["zed", 3], ["tee", 3], ["aitch", 3], ["you", 2]]
  };
  var SH_LEAST = 16;                                      // metres: shorter than this, a box
  if (typeof STARTER_ROOMS === "object") { STARTER_ROOMS.void = { w: 4, h: 4, bw: 4, max: 999, wall: [], mid: [] }; }

  // ---- in the plan --------------------------------------------------------------------------------
  if (typeof BUILDING_TYPES === "object") {
    Object.keys(SH_MENU).forEach(function (t) {
      var T = BUILDING_TYPES[t];
      if (!T || typeof T.plan !== "function" || T.shShaped) { return; }
      var plain = T.plan;
      T.plan = function (want, rnd) {
        var plan = plain.apply(this, arguments);
        try { shShape(plan, t, want || {}); } catch (e) { if (window.console && console.warn) { console.warn("shapes:", e && e.message); } }
        return plan;
      };
      T.shShaped = true;
    });
  }
  function shLen(band) { return (band || []).reduce(function (s, r) { return s + (r.w || 0); }, 0); }
  function shVoid(w) { return R("void", w, { via: "-", label: "", shVoid: true }); }
  // a room that stays where it is: a stairwell's bay, the lift, a way in, a lobby
  function shFixed(r) {
    return !!(r.bay || r.kind === "lift" || r.kind === "stairs" || r.entry || r.kind === "lobby" || r.kind === "landing" ||
              r.kind === "court" || r.kind === "commons" || r.shVoid ||
              (r.kind === "suite" && (r.parts || []).some(shFixed)));
  }
  // The rooms of a row in runs that go together: a flat and the rooms off it, the rooms one opens off.
  function shGroups(band) {
    var groups = [], ids = function (r) { return r.kind === "suite" ? (r.parts || []).map(function (p) { return p.id; }) : [r.id]; };
    var vias = function (r) { return r.kind === "suite" ? (r.parts || []).map(function (p) { return p.via; }) : [r.via]; };
    band.forEach(function (r, i) {
      var prev = i ? band[i - 1] : null;
      var tied = prev && (vias(r).some(function (v) { return v && ids(prev).indexOf(v) >= 0; }) || vias(prev).some(function (v) { return v && ids(r).indexOf(v) >= 0; }));
      if (tied) { groups[groups.length - 1].push(r); } else { groups.push([r]); }
    });
    return groups;
  }
  // Where a row may be cut between two runs, measured from its start: the same place on every floor.
  function shCuts(plan, side) {
    var sets = plan.floors.map(function (f) {
      var at = 0, out = [];
      shGroups(f[side] || []).forEach(function (g, i, all) {
        at += shLen(g);
        if (i < all.length - 1 && !shFixed(g[g.length - 1]) && !shFixed(all[i + 1][0])) { out.push(at); }
      });
      return out;
    });
    return sets[0].filter(function (x) { return sets.every(function (s) { return s.some(function (y) { return Math.abs(x - y) < 0.05; }); }); });
  }
  // Cut there: an empty stretch put in after the room that ends at x.
  function shInsert(band, x, w) {
    var at = 0;
    for (var i = 0; i < band.length; i++) {
      at += band[i].w || 0;
      if (Math.abs(at - x) < 0.05) { band.splice(i + 1, 0, shVoid(w)); return true; }
    }
    return false;
  }
  // As much longer, its rooms that can be bigger the bigger, each by its share.
  function shStretch(band, extra, kinds) {
    var can = band.filter(function (r) { return kinds.indexOf(r.kind) >= 0 && !r.shVoid; }), sum = shLen(can);
    if (!can.length || sum < extra * 0.6) { return false; }            // (none more than two and a half times as big)
    can.forEach(function (r) { r.w += extra * r.w / sum; });
    return true;
  }
  // A big room split in two at x along the row, on every floor -- a place to cut where there was none.
  function shSplit(plan, side, x, kinds) {
    var spots = plan.floors.map(function (f) {
      var at = 0, band = f[side] || [];
      for (var i = 0; i < band.length; i++) {
        var r = band[i];
        if (at + 2.5 < x && at + r.w - 2.5 > x && kinds.indexOf(r.kind) >= 0 && !shFixed(r) && !r.id) { return { band: band, i: i, a: at }; }
        at += r.w;
      }
      return null;
    });
    if (spots.some(function (s) { return !s; })) { return false; }
    spots.forEach(function (s) {
      var r = s.band[s.i], first = x - s.a, second = Object.assign({}, r, { w: r.w - first });
      r.w = first;
      s.band.splice(s.i + 1, 0, second);
    });
    return true;
  }
  // The middle cut of a row, near half way (a little either side, by the seed): made if there is none.
  function shMiddle(plan, side, rnd, kinds) {
    var W = plan.W, aim = W * (0.42 + rnd() * 0.16);
    var cuts = shCuts(plan, side).filter(function (x) { return x > W * 0.28 && x < W * 0.72; })
      .sort(function (a, b) { return Math.abs(a - aim) - Math.abs(b - aim); });
    if (cuts.length) { return cuts[0]; }
    return shSplit(plan, side, aim, kinds) ? aim : null;
  }
  function shShape(plan, type, want) {
    if (!plan || !plan.floors || !plan.floors.length || plan.together) { return; }
    // (a school's courtyard ring, its hub, its own L are 40-campus.js's: only its plain wings shaped here)
    if (type === "school" && plan.campus !== "wing") { return; }
    if (plan.floors.some(function (f) { return (f.mid && f.mid.length) || f.open || !(f.H > 0) || !(f.back || []).length || !(f.front || []).length; })) { return; }
    var W = plan.W || Math.max.apply(null, plan.floors.map(function (f) { return Math.max(shLen(f.back), shLen(f.front)); }));
    if (!(W >= SH_LEAST)) { return; }
    plan.W = W;
    var rnd = starterRand((((want.seed >>> 0) || 1) * 31 + 17) >>> 0), menu = SH_MENU[type] || [];
    var pick = want.shape;
    if (!pick || !menu.some(function (m) { return m[0] === pick; })) {
      var total = menu.reduce(function (s, m) { return s + m[1]; }, 0), roll = rnd() * total;
      pick = "bar";
      for (var i = 0; i < menu.length; i++) { roll -= menu[i][1]; if (roll < 0) { pick = menu[i][0]; break; } }
    }
    if (pick === "bar") { plan.shape = "bar"; return; }
    // (the one picked first; where it cannot be made -- no place to cut that is the same on every
    // floor, nothing to make bigger -- the others in turn, a box only if none can)
    var order = [pick].concat(menu.map(function (m) { return m[0]; }).filter(function (k) { return k !== pick && k !== "bar"; })
      .map(function (k) { return [k, rnd()]; }).sort(function (a, b) { return a[1] - b[1]; }).map(function (p) { return p[0]; }));
    var keep = JSON.stringify(plan.floors), kinds = SH_FLEX[type] || [], before = shBays(plan);
    plan.shapeTried = [];
    for (var k = 0; k < order.length; k++) {
      var ok = false;
      try { ok = SH_DO[order[k]](plan, rnd, kinds); } catch (e) { ok = false; }
      if (ok) { ok = shLevel(plan, order[k]) && shStacked(plan, before); }
      if (ok) { plan.shape = order[k]; return; }
      plan.shapeTried.push(order[k]);
      plan.floors = JSON.parse(keep); plan.W = W;
    }
    plan.shape = "bar";
  }
  var SH_DO = {
    // rooms from the end of the back row put at the end of the front, the same number on every floor
    ell: function (plan, rnd, kinds) {
      var W = plan.W, keepTo = W * (0.5 + rnd() * 0.15), groups = shGroups(plan.floors[0].back), at = 0, n = 0;
      for (var i = groups.length - 1; i >= 0; i--) {
        if (groups[i].some(shFixed)) { break; }
        if (shLen(plan.floors[0].back) - at - shLen(groups[i]) < keepTo - 0.1) { break; }
        at += shLen(groups[i]); n++;
      }
      // (the back row ending in a stairwell -- a fire stair, 40-exits.js -- that stays: the L made by an
      // empty stretch past it, the front row as long again)
      if (!n || at < W * 0.2) {
        var V = Math.round(W * (0.3 + rnd() * 0.12) * 10) / 10;
        return plan.floors.every(function (f) { f.back.push(shVoid(V)); return shStretch(f.front, V, kinds); });
      }
      return plan.floors.every(function (f) {
        var g = shGroups(f.back), moved = g.slice(g.length - n);
        if (moved.some(function (x) { return x.some(shFixed); })) { return false; }
        f.back = [].concat.apply([], g.slice(0, g.length - n));
        f.front = f.front.concat([].concat.apply([], moved));
        return true;
      });
    },
    // the back row moved along by a stretch, the front row as long again at its far end
    zed: function (plan, rnd) {
      var V = Math.round(plan.W * (0.25 + rnd() * 0.15) * 10) / 10;
      plan.floors.forEach(function (f) { f.back.unshift(shVoid(V)); f.front.push(shVoid(V)); });
      return true;
    },
    // an empty stretch at each end of the back row, the front row as long again
    tee: function (plan, rnd, kinds) {
      var V = Math.round(plan.W * (0.18 + rnd() * 0.1) * 10) / 10;
      return plan.floors.every(function (f) {
        f.back.unshift(shVoid(V)); f.back.push(shVoid(V));
        return shStretch(f.front, 2 * V, kinds);
      });
    },
    // an empty stretch in the middle of the back row, the front row as long again
    you: function (plan, rnd, kinds) {
      var x = shMiddle(plan, "back", rnd, kinds);
      if (x === null) { return false; }
      var M = Math.round(plan.W * (0.22 + rnd() * 0.12) * 10) / 10;
      return plan.floors.every(function (f) { return shInsert(f.back, x, M) && shStretch(f.front, M, kinds); });
    },
    // the same at the front: a forecourt, the back row as long again
    fore: function (plan, rnd, kinds) {
      var x = shMiddle(plan, "front", rnd, kinds);
      if (x === null) { return false; }
      var M = Math.round(plan.W * (0.22 + rnd() * 0.12) * 10) / 10;
      return plan.floors.every(function (f) { return shInsert(f.front, x, M) && shStretch(f.back, M, kinds); });
    },
    // an empty stretch in the middle of both rows: two wings, the hall a bridge between them
    aitch: function (plan, rnd, kinds) {
      var xb = shMiddle(plan, "back", rnd, kinds), xf = shMiddle(plan, "front", rnd, kinds);
      if (xb === null || xf === null) { return false; }
      var M = Math.round(plan.W * (0.2 + rnd() * 0.1) * 10) / 10;
      return plan.floors.every(function (f) { return shInsert(f.back, xb, M) && shInsert(f.front, xf, M); });
    }
  };
  // Both rows as long as each other on every floor -- the shorter's rooms that can be bigger made so,
  // or an empty stretch at its end -- and the plan as wide as the longest.
  function shLevel(plan, pick) {
    var W = 0;
    plan.floors.forEach(function (f) { W = Math.max(W, shLen(f.back), shLen(f.front)); });
    plan.floors.forEach(function (f) {
      ["back", "front"].forEach(function (side) {
        var short = W - shLen(f[side]);
        // (an L's back row is short on purpose; anything else made up with an empty stretch)
        if (short < 0.05 || (pick === "ell" && side === "back")) { return; }
        f[side].push(shVoid(Math.round(short * 100) / 100));
      });
    });
    plan.W = W;
    return true;
  }
  // Where each stairwell's bays and lift stand along their rows, floor by floor.
  function shBays(plan) {
    return plan.floors.map(function (f) {
      var out = {};
      ["back", "front"].forEach(function (side) {
        var at = 0;
        (f[side] || []).forEach(function (r) {
          var key = r.bay ? side + ":" + r.bay : r.kind === "lift" ? side + ":lift" : null;
          if (key && out[key] === undefined) { out[key] = at; }
          at += r.w || 0;
        });
      });
      return out;
    });
  }
  // Each moved as far as on every other floor (none lost): a flight still over its flight.
  function shStacked(plan, before) {
    var after = shBays(plan), moved = {};
    return before.every(function (was, i) {
      return Object.keys(was).every(function (key) {
        if (after[i][key] === undefined) { return false; }
        var d = after[i][key] - was[key];
        if (moved[key] === undefined) { moved[key] = d; return true; }
        return Math.abs(moved[key] - d) < 0.05;
      });
    });
  }

  // ---- once the rooms stand: the empty stretches taken away --------------------------------------
  // Windows in the walls that face out onto one now, three metres apart (the
  // courtyard's way, 40-campus.js); then it, and anything put in it, gone.
  // (marked, and its windows put in, while the rooms still know where they go together -- 39-starter.js
  // lets that go when they are made)
  if (typeof typeFurnish === "function") {
    var shFurnishWas = typeFurnish;
    typeFurnish = function (made, rnd, want, plan) {
      var out = shFurnishWas.apply(this, arguments);
      try {
        var rooms = made.filter(function (r) { return r.starter !== "void" && r.local; });
        made.forEach(function (v) {
          if (v.starter !== "void") { return; }
          v.shVoid = true;
          if (typeof caCourtWindows === "function" && v.local) { caCourtWindows({ local: v.local, x: v.x, y: v.y, courtOver: true, starter: "court" }, rooms); }
        });
      } catch (e) { if (window.console && console.warn) { console.warn("shapes:", e && e.message); } }
      return out;
    };
  }
  function shClear() {
    var voids = hand.nodes.filter(function (n) { return n.kind === "i_room" && n.shVoid; });
    if (!voids.length) { return 0; }
    var gone = {};
    voids.forEach(function (v) {
      gone[v.id] = true;
      var T = roomWallOf(v) + 3;
      hand.nodes.forEach(function (n) {
        if (n === v || n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || gone[n.id]) { return; }
        if (insideArea(v, n.x, n.y, T)) { gone[n.id] = true; }
      });
    });
    hand.nodes = hand.nodes.filter(function (n) { return !gone[n.id]; });
    hand.links = hand.links.filter(function (l) { return !gone[l.from] && !gone[l.to]; });
    return voids.length;
  }
  // (first of all the steps after the rooms are made: what comes after sees the building's own shape)
  if (typeof STARTER_WRAPS === "object") {
    STARTER_WRAPS.unshift(function* (inner, want) {
      var out = yield* inner(want);
      try { shClear(); } catch (e) { if (window.console && console.warn) { console.warn("shapes:", e && e.message); } }
      return out;
    });
  }
