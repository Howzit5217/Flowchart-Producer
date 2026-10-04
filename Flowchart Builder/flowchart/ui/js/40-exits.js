// ---------------------------------------------------------------------------
//  40-exits.js -- ways out as many as the people a building holds need,
//  as the building code counts them: a second stair (a third, a fourth) at
//  the far end of every floor up the stairs, and on the ground floor more
//  doors out, each as far from the others as it can be
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "make it so the bigger buildings with more
  // people have more entrances and exits that are all up to code in all
  // places")
  //
  // The International Building Code: how many people a floor holds is its
  // rooms' areas over a load factor for what each is (table 1004.5) -- a
  // classroom 20 sq ft a person, a cafeteria's tables 15, an office 150, a
  // shop 60, a gym 50, storage 300, homes 200; how many ways out a floor of
  // that many must have (1006.3.3) -- two up to 500, three to 1,000, four
  // over; one where fewer than 50 are; and two ways out far enough apart
  // that one fire does not take both (1007.1.1: a third of the diagonal,
  // sprinklered -- 40-firesafe.js puts the sprinklers in).  Up the stairs a
  // way out is a stairwell (its two flights side by side are one); on the
  // ground floor, a door out.  Each pair of flights added is a stairwell of
  // its own, its flights linked floor to floor as Start building's are.
  var EX_TYPES = { school: 1, office: 1, apartments: 1, condos: 1, tower: 1, mall: 1, shop: 1, boutique: 1, cafe: 1 };
  var EX_LOAD = { classroom: 1.86, cafeteria: 1.4, commons: 1.4, cafe: 1.4, foodcourt: 1.4, gym: 4.6, library: 4.6,
                  sales: 5.6, boutique: 5.6, mallunit: 5.6, mallanchor: 5.6, stock: 28, cafekitchen: 18.6, kitchenette: 18.6,
                  openoffice: 14, office: 14, reception: 14, staff: 14, training: 1.86, meeting: 2.8, boardroom: 2.8, cubicles: 14,
                  flat: 18.6, flatbed: 18.6, flatbed2: 18.6, nurse: 9.3, fitting: 5.6 };
  var EX_NONE = { hall: 1, stairs: 1, lift: 1, landing: 1, lobby: 1, restroom: 1, washroom: 1, flatbath: 1, court: 1, closet: 1, phone: 1 };
  function exNeed(people) { return people < 50 ? 1 : people <= 500 ? 2 : people <= 1000 ? 3 : 4; }
  function exLoad(kind) { return EX_NONE[kind] ? 0 : EX_LOAD[kind] || 9.3; }

  // ---- in the plan: a stairwell more for every way out a floor up the stairs lacks -------------------
  if (typeof BUILDING_TYPES === "object") {
    Object.keys(EX_TYPES).forEach(function (t) {
      var T = BUILDING_TYPES[t];
      if (!T || typeof T.plan !== "function" || T.exWays) { return; }
      var plain = T.plan;
      T.plan = function (want) {
        var plan = plain.apply(this, arguments);
        try { exPlan(plan); } catch (e) { if (window.console && console.warn) { console.warn("exits:", e && e.message); } }
        return plan;
      };
      T.exWays = true;
    });
  }
  function exBands(f) { return [f.back || [], f.front || []].concat(f.mid || []); }
  function exPeople(f) {
    var n = 0;
    [[f.back, f.Db || 7], [f.front, f.Df || 7]].concat((f.mid || []).map(function (row) { return [row, f.Dm || 7]; })).forEach(function (bd) {
      (bd[0] || []).forEach(function (r) {
        (r.kind === "suite" ? r.parts || [] : [r]).forEach(function (q) { var k = exLoad(q.kind); if (k) { n += (q.w || r.w || 0) * bd[1] / (r.kind === "suite" ? (r.parts || [1]).length : 1) / k; } });
      });
    });
    return n;
  }
  // Stairwells on a floor: runs of stair rooms side by side, in a band.
  function exWells(f) {
    var n = 0;
    exBands(f).forEach(function (b) {
      var run = false;
      b.forEach(function (r) { var st = r.kind === "stairs"; if (st && !run) { n++; } run = st; });
    });
    return n;
  }
  function exPlan(plan) {
    var floors = plan.floors || [];
    if (floors.length < 2) { return; }
    var top = floors.reduce(function (m, f) { return Math.max(m, f.level); }, 0), low = floors.reduce(function (m, f) { return Math.min(m, f.level); }, 0);
    var most = 0, have = Infinity;
    floors.forEach(function (f) { if (f.level !== 0) { most = Math.max(most, exPeople(f)); have = Math.min(have, exWells(f)); } });
    if (have === Infinity) { return; }
    var need = Math.min(4, Math.max(most >= 50 || top >= 1 ? 2 : 1, exNeed(most))), add = need - have;
    if (add <= 0) { return; }
    var bays = [["C", "D"], ["E", "F"], ["G", "H"]];
    for (var i = 0; i < Math.min(3, add); i++) {
      floors.forEach(function (f) {
        var k = f.level - low, A = k % 2 === 0, up = f.level < top, down = f.level > low;
        var pair = [R("stairs", 1.4, { bay: bays[i][0], go: A ? (up ? "up" : "none") : (down ? "down" : "none"), label: TXT.st_stairs }),
                    R("stairs", 1.4, { bay: bays[i][1], go: A ? (down ? "down" : "none") : (up ? "up" : "none"), label: TXT.st_stairs })];
        // the second at the far end of the back, a third half way along the front, a fourth at its far end
        if (i === 0) { f.back.push(pair[0], pair[1]); }
        else if (i === 1) { var m = Math.floor(f.front.length / 2); f.front.splice(m, 0, pair[0], pair[1]); }
        else { f.front.push(pair[0], pair[1]); }
      });
    }
    // every band as long as the longest again: its biggest room grown
    var W = plan.W || 0;
    floors.forEach(function (f) { exBands(f).forEach(function (b) { W = Math.max(W, typeWidth(b)); }); });
    floors.forEach(function (f) {
      exBands(f).forEach(function (b) {
        if (!b.length) { return; }
        var short = W - typeWidth(b);
        if (short < 0.05) { return; }
        var grow = b.filter(function (r) { return r.kind !== "stairs" && r.kind !== "lift" && r.kind !== "suite" && r.kind !== "washroom" && r.kind !== "court"; })
          .sort(function (p, q) { return q.w - p.w; })[0] || b[b.length - 1];
        grow.w += short;
      });
    });
    plan.W = W;
    plan.exWells = need;
  }

  // ---- once it is made: doors out of the ground floor, as many as it needs ----------------------------
  if (typeof STARTER_WRAPS === "object") {
    var exWrap = function* (inner, want) {
      var out = yield* inner(want);
      try { if (want && EX_TYPES[want.type]) { exDoors(); } } catch (e) { if (window.console && console.warn) { console.warn("exits:", e && e.message); } }
      return out;
    };
    var exHoodAt = -1;
    STARTER_WRAPS.forEach(function (fn, i) { if (exHoodAt < 0 && String(fn).indexOf("hoodBuild") >= 0) { exHoodAt = i; } });
    if (exHoodAt >= 0) { STARTER_WRAPS.splice(exHoodAt, 0, exWrap); } else { STARTER_WRAPS.push(exWrap); }
  }
  // The kinds of room a door out may be in: where people are, or pass.
  var EX_OUT = { hall: 3, commons: 3, lobby: 2, landing: 2, gym: 2, cafeteria: 2, sales: 2, mallunit: 1, mallanchor: 2, openoffice: 1,
                 reception: 1, cafe: 1, boutique: 1, staff: 1, foodcourt: 2 };
  function exDoors() {
    var P = FLOOR_PX, floors = typeof floorsOf === "function" ? floorsOf() : [], plan = walkPlan();
    function lv(n) { var f = floors.length ? floorAt(floors, n.x, n.y) : null; return f ? f.level : 0; }
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && lv(n) === 0 && !n.court; });
    if (!rooms.length) { return; }
    // (what each is: its use, Start building's kinds -- a hall's, a house's)
    function what(r) { return r.use || (typeof roomKind === "function" ? roomKind(plan, r) : ""); }
    var people = 0;
    rooms.forEach(function (r) { var k = exLoad(what(r)); people += k ? r.w * r.h / (P * P) / k : 0; });
    var need = exNeed(people);
    function inside(x, y) { return rooms.some(function (r) { return insideArea(r, x, y); }); }
    // the doors out there are: a room one side of it, none the other
    var outs = hand.nodes.filter(function (d) {
      if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor" || lv(d) !== 0) { return false; }
      var t = (d.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t), hh = d.h / 2 + 0.7 * P;
      return inside(d.x + ux * hh, d.y + uy * hh) !== inside(d.x - ux * hh, d.y - uy * hh);
    }).map(function (d) { return [d.x, d.y]; });
    var kind = ICONS.i_door2 ? "i_door2" : "i_door", wide = ICONS[kind].box[0];
    for (var guard = 0; outs.length < need && guard < 6; guard++) {
      var best = null;
      rooms.forEach(function (r) {
        var pref = EX_OUT[what(r)] || 0;
        if (!pref || typeof roomEdges !== "function") { return; }
        roomEdges(plan, r).filter(function (e) { return e.outside; }).forEach(function (e) {
          for (var s = e.from + wide / 2 + 0.5 * P; s <= e.to - wide / 2 - 0.5 * P; s += 0.5 * P) {
            var x = e.across ? s : e.line, y = e.across ? e.line : s;
            // (out of doors all along it, clear of the windows and doors in that wall)
            var nx = e.across ? 0 : -e.into, ny = e.across ? -e.into : 0;
            if (inside(x + nx * 0.4 * P - (e.across ? wide / 2 : 0), y + ny * 0.4 * P - (e.across ? 0 : wide / 2)) ||
                inside(x + nx * 0.4 * P + (e.across ? wide / 2 : 0), y + ny * 0.4 * P + (e.across ? 0 : wide / 2))) { continue; }
            var busy = hand.nodes.some(function (o) {
              if (!WALK_DOORS[o.kind] && o.kind !== "i_window") { return false; }
              return Math.abs((e.across ? o.y : o.x) - e.line) < 0.5 * P && Math.abs((e.across ? o.x : o.y) - s) < wide / 2 + (o.kind === "i_window" ? 0 : 0.6 * P) + turned(o).w / 2;
            });
            if (busy && outs.length) { continue; }
            var far = outs.length ? Math.min.apply(null, outs.map(function (o) { return Math.hypot(o[0] - x, o[1] - y); })) : 1e9;
            var score = far + pref * 2 * P;
            if (!best || score > best.score) { best = { x: x, y: y, e: e, r: r, score: score }; }
          }
        });
      });
      if (!best) { break; }
      // a window where the door goes: taken out
      hand.nodes = hand.nodes.filter(function (o) {
        return !(o.kind === "i_window" && Math.abs((best.e.across ? o.y : o.x) - best.e.line) < 0.5 * P &&
                 Math.abs((best.e.across ? o.x : o.y) - (best.e.across ? best.x : best.y)) < wide / 2 + turned(o).w / 2 + 0.2 * P);
      });
      var d = adviceAdd(kind, Math.round(best.x), Math.round(best.y), best.e.across ? 0 : 90);
      if (!d) { break; }
      d.own = true; d.fireExit = true; d.backDoor = true;
      d.dd = { st: "flush", hd: "push", mt: "chrome", fin: "red" };
      outs.push([best.x, best.y]);
    }
  }
