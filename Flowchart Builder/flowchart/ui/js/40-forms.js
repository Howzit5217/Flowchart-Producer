// ---------------------------------------------------------------------------
//  40-forms.js -- a long building folded into a block: rows of rooms either
//  side of more than one hall, the stairs, the lift and the rooms that need
//  no window down the middle, short halls across joining the long ones
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "every formation for any of the buildings loves
  // being really skinny rather than having depth in the building because it
  // is a 1 hall left and right rather than being creative like a square
  // house")
  //
  // Every building but a house was two rows of rooms along one hall, as long
  // as all its rooms side by side: a block of flats three to seven times as
  // long as it was deep, an office fifty metres by thirteen, a school
  // seventy-five by sixteen.  An L, a T, a U (40-shapes.js) only notched the
  // same bar -- and made it longer.  Past half as long again as deep it is
  // folded into a block (a house is folded its own way, starterFold):
  //  - more rows, a hall between each two: as many as bring it nearest a
  //    square, the seed choosing between two near as good;
  //  - the stairwells and lifts in the first row inside -- where they were
  //    along the building, at its start, its end or its middle, the same on
  //    every floor, so each flight still stands over the one under it;
  //  - the rooms that need daylight -- the flats, the classrooms, the
  //    offices -- along the outside rows and at the outside ends of the rows
  //    inside; washrooms, store rooms, kitchenettes down the middle;
  //  - a way in from the street on the front;
  //  - halls across the rows inside, one or two (a ring round the core);
  //  - each row as long as the longest, its rooms that can be bigger made
  //    so, or a store room more.
  // A flat and the rooms off it go together, a run as it was.
  var FM_TYPES = { apartments: 1, condos: 1, office: 1, school: 1, mall: 1, tower: 1 };
  // (an open court in Start building's sketch: a courtyard, not a room)
  if (typeof STARTER_ZONE === "object") { STARTER_ZONE.void = "court"; }
  // (a store room in a row inside has no window: a light of its own -- 39-starter.js hangs it, small as it is)
  if (typeof STARTER_CEILING === "object" && !STARTER_CEILING.storage) { STARTER_CEILING.storage = "i_pendant"; }
  var FM_LONG = 1.5;                     // folded past this many times as long as deep
  var FM_AIM = 1.1;                      // and folded to about this
  var FM_DARK = { stairs: 1, lift: 1, restroom: 1, flatbath: 1, kitchenette: 1, storage: 1, utility: 1, stock: 1,
                  fitting: 1, bath: 1, closet: 1, mechanical: 1, janitor: 1, washroom: 1, trash: 1, mail: 1 };

  if (typeof BUILDING_TYPES === "object") {
    Object.keys(FM_TYPES).forEach(function (t) {
      var T = BUILDING_TYPES[t];
      if (!T || typeof T.plan !== "function" || T.fmFolded) { return; }
      var plain = T.plan;
      T.plan = function (want, rnd) {
        var plan = plain.apply(this, arguments);
        try { fmFold(plan, t, want || {}); } catch (e) { if (window.console && console.warn) { console.warn("forms:", e && e.message); } }
        return plan;
      };
      T.fmFolded = true;
    });
  }
  function fmLen(list) { return (list || []).reduce(function (s, r) { return s + (r.w || 0); }, 0); }
  function fmParts(r) { return r.kind === "suite" ? (r.parts || []) : [r]; }
  function fmCore(r) { return fmParts(r).some(function (p) { return !!p.bay || p.kind === "stairs" || p.kind === "lift"; }); }
  function fmEntry(r) { return fmParts(r).some(function (p) { return !!p.entry; }); }
  function fmDark(r) { return fmParts(r).every(function (p) { return !!FM_DARK[p.kind] || (typeof TYPE_DARK === "object" && !!TYPE_DARK[p.kind]); }); }
  // The runs of a row that go together -- a flat and the rooms off it -- each
  // stairwell's bays and lift a run of their own.
  function fmRuns(band) {
    var ids = function (r) { return fmParts(r).map(function (p) { return p.id; }).filter(Boolean); };
    var vias = function (r) { return fmParts(r).map(function (p) { return p.via; }).filter(Boolean); };
    var runs = [];
    band.forEach(function (r, i) {
      var prev = i ? band[i - 1] : null, last = runs[runs.length - 1];
      var tied = prev && (vias(r).some(function (v) { return ids(prev).indexOf(v) >= 0; }) || vias(prev).some(function (v) { return ids(r).indexOf(v) >= 0; }));
      var core = fmCore(r), lastCore = last && last.core;
      if (last && (tied || (core && lastCore))) { last.rooms.push(r); last.w += r.w; return; }
      runs.push({ rooms: [r], w: r.w, core: core });
    });
    runs.forEach(function (u) {
      u.entry = u.rooms.some(fmEntry);
      u.dark = !u.core && u.rooms.every(fmDark);
    });
    return runs;
  }
  // a room this big, of a kind that comes in pieces as well as whole, split:
  // a forty-metre open office was a row forty metres long however it was folded
  var FM_SPLIT = { openoffice: 12, mallanchor: 24, commons: 14, cafeteria: 14 };
  function fmSplit(band) {
    var out = [];
    band.forEach(function (r) {
      // (a room stretched to fill the long bar out -- a flat thirty metres across, a landing of
      // twenty-five -- back to as big as its kind is made: folded, the row is shorter)
      var spec = r.kind !== "suite" && !r.bay && !r.shVoid && typeof STARTER_ROOMS === "object" ? STARTER_ROOMS[r.kind] : null;
      if (spec && spec.max > 0 && spec.max < 100 && r.w > spec.max && !FM_SPLIT[r.kind]) { r.w = spec.max; }
      var most = FM_SPLIT[r.kind];
      if (!most || r.w <= most * 1.25 || r.id || r.entry || r.bay) { out.push(r); return; }
      var n = Math.ceil(r.w / most);
      for (var i = 0; i < n; i++) { out.push(Object.assign({}, r, { w: r.w / n })); }
    });
    return out;
  }
  function fmFold(plan, type, want) {
    if (!plan || !plan.floors || !plan.floors.length || plan.together || want.form === "bar") { return; }
    // (a school's courtyard ring and its hub have rows inside already, 40-campus.js: its wings and its L are folded)
    if (type === "school" && plan.campus && plan.campus !== "wing" && plan.campus !== "ell") { return; }
    var floors = plan.floors;
    if (floors.some(function (f) { return (f.mid && f.mid.length) || f.open || !(f.H > 0) || !(f.back || []).length || !(f.front || []).length; })) { return; }
    var H = floors[0].H, Db = floors[0].Db || 4.6, Df = floors[0].Df || 4.6;
    var W0 = Math.max.apply(null, floors.map(function (f) { return Math.max(fmLen(f.back), fmLen(f.front)); }));
    if (W0 / (Db + H + Df) < FM_LONG) { return; }
    // (an L's, a T's empty stretches let go of: folded, it is a block)
    var bare = floors.map(function (f) {
      return { back: fmSplit(f.back.filter(function (r) { return !r.shVoid; })), front: fmSplit(f.front.filter(function (r) { return !r.shVoid; })) };
    });
    // the rows inside as deep as the shallower row -- room for a stairwell's flight, at the least
    var Dm = Math.max(4.4, Math.min(Db, Df)), grow = (typeof SH_FLEX === "object" && SH_FLEX[type]) || [];
    var seed = ((want.seed >>> 0) || 1) * 53 + 29;
    // Every way of folding it tried -- so many rows, a ring round the core or
    // one hall across -- each laid out as it would be (rooms come in sizes of
    // their own, a flat twelve metres along, so a guess from the total came
    // out long): the one nearest a square, or, near as good, the seed's pick.
    var tries = [];
    for (var k = 1; k <= 3; k++) {
      [false, true].forEach(function (ring) {
        var rnd = starterRand((seed + k * 131 + (ring ? 7 : 0)) >>> 0);
        var mine = JSON.parse(JSON.stringify(bare));
        var made = mine.map(function (b, fi) { var m = fmFloor(floors[fi], b, k, H, ring, rnd); m.level = floors[fi].level || 0; return m; });
        var W = 0;
        made.forEach(function (m) { m.rows.forEach(function (row) { W = Math.max(W, fmLen(row.list)); }); });
        W = Math.ceil(W * 10) / 10;
        var waste = fmLevelAll(made, W, grow), all = W * (k + 2) * made.length;
        var D = Db + Df + k * Dm + (k + 1) * H;
        // (nearest a square; store rooms only to fill it out counted against it, a court that is
        // more than an eighth of it, and each row more than three -- a stack of halls is no better)
        var sc = Math.abs(Math.log(W / D / FM_AIM)) + 0.25 * (k - 1) + 3 * waste.store / all + 0.5 * Math.max(0, waste.court / all - 0.12);
        tries.push({ k: k, ring: ring, made: made, W: W, D: D, score: sc });
      });
    }
    tries.sort(function (a, b) { return a.score - b.score; });
    if (Math.abs(Math.log(W0 / (Db + H + Df) / FM_AIM)) - tries[0].score < 0.15) { return; }
    var pickR = starterRand(seed >>> 0), near = tries.filter(function (t) { return t.score - tries[0].score < 0.08; });
    for (var guard = 0; near.length; guard++) {
      var t = near.splice(Math.floor(pickR() * near.length), 1)[0];
      // the bays where they stand, the same on every floor -- or the next way tried
      var stand = t.made.map(function (m) { return fmBays(m.rows); });
      var fine = stand.every(function (s) { return Object.keys(stand[0]).every(function (key) { return s[key] === undefined || Math.abs(s[key] - stand[0][key]) < 0.05; }); });
      if (!fine) { continue; }
      t.made.forEach(function (m, fi) {
        var f = floors[fi], rows = m.rows;
        f.back = rows[0].list;
        f.mid = rows.slice(1, -1).map(function (row) { return row.list; });
        f.front = rows[rows.length - 1].list;
        f.Dm = Dm;
        fmVias(f);
      });
      plan.W = t.W;
      plan.shape = t.ring ? "ring" : "block";
      plan.form = { rows: t.k + 2, ring: t.ring };
      return;
    }
  }
  // One floor folded: its runs into the rows.
  function fmFloor(f, bare, k, H, ring, rnd) {
    var runs = [];
    ["back", "front"].forEach(function (side) {
      var at = 0, len = fmLen(bare[side]);
      fmRuns(bare[side]).forEach(function (u) {
        u.side = side;
        u.mid = (at + u.w / 2) / Math.max(1, len);
        at += u.w;
        runs.push(u);
      });
    });
    var cores = runs.filter(function (u) { return u.core; }).sort(function (a, b) { return a.mid - b.mid; });
    var others = runs.filter(function (u) { return !u.core; });
    // the rows: the back, those inside (their two ends and what is between), the front
    var rows = [{ name: "back", list: [] }];
    for (var m = 0; m < k; m++) { rows.push({ name: "mid", start: [], left: null, middle: [], right: null, end: [] }); }
    rows.push({ name: "front", list: [] });
    var first = rows[1];
    // the stairwells along the first row inside: where they were, at its start, its end or between
    cores.forEach(function (u) { (u.mid > 0.7 ? first.end : first.start).push(u); });
    if (first.start.length) { first.left = "core"; }
    if (first.end.length) { first.right = "core"; }
    function rowW(row) {
      if (row.name !== "mid") { return fmLen(flat(row.list)); }
      return fmLen(flat(row.start)) + fmLen(flat(row.middle)) + fmLen(flat(row.end)) +
             (row.left && row.left !== "core" ? row.left.w : 0) + (row.right && row.right !== "core" ? row.right.w : 0) + H * (ring ? 2 : 1);
    }
    var total = runs.reduce(function (s, u) { return s + u.w; }, 0) + k * H * (ring ? 2 : 1), aim = total / (k + 2);
    function places(u) {
      var out = [], back = rows[0], front = rows[rows.length - 1], mids = rows.slice(1, -1);
      if (u.entry) { return [{ row: front, how: "list", pref: 0 }]; }
      if (u.dark) {
        mids.forEach(function (row) { out.push({ row: row, how: "middle", pref: 0 }); });
        out.push({ row: back, how: "list", pref: 2 }, { row: front, how: "list", pref: 2 });
        return out;
      }
      out.push({ row: back, how: "list", pref: 0 }, { row: front, how: "list", pref: 0.2 });
      // (the end of a row inside has one outside wall: for a run with one room that wants
      // daylight -- a classroom, an office -- not a flat, whose bedroom would have none)
      if (u.rooms.reduce(function (n, r) { return n + fmParts(r).filter(function (p) { return !fmDark(p); }).length; }, 0) <= 1) {
        mids.forEach(function (row) {
          if (!row.left) { out.push({ row: row, how: "left", pref: 0.3 }); }
          if (!row.right) { out.push({ row: row, how: "right", pref: 0.3 }); }
        });
      }
      return out;
    }
    function put(u, o) {
      if (o.how === "list") { o.row.list.push(u); } else if (o.how === "middle") { o.row.middle.push(u); } else { o.row[o.how] = u; }
    }
    // the way in first, then the biggest first, each where its row comes out shortest
    var order = others.slice().sort(function (a, b) { return (b.entry ? 1 : 0) - (a.entry ? 1 : 0) || b.w - a.w; });
    order.forEach(function (u) {
      var best = null;
      places(u).forEach(function (o) {
        if ((o.how === "left" || o.how === "right") && o.row[o.how]) { return; }
        var after = rowW(o.row) + u.w, cost = Math.max(0, after - aim) * 2 + after * 0.05 + o.pref * 1.5 + (rnd() - 0.5) * 0.4;
        if (!best || cost < best.cost) { best = { o: o, cost: cost }; }
      });
      if (!best) { return; }
      put(u, best.o);
    });
    function flat(list) {
      var out = [];
      (list || []).forEach(function (u) { Array.prototype.push.apply(out, u.rooms ? u.rooms : [u]); });
      return out;
    }
    // each row inside: its stairwells first, a daylit end, what is between with the hall(s) across
    // it, the far end; the rooms of a run in the order they stood
    var made = rows.map(function (row) {
      if (row.name !== "mid") { return { list: flat(row.list) }; }
      var middle = flat(row.middle);
      function across() { return { kind: "hall", label: TXT.st_hall, w: H, cross: true }; }
      if (ring) { middle.unshift(across()); middle.push(across()); }
      else { middle.splice(Math.floor(middle.length / 2 + (rnd() - 0.5) * Math.min(2, middle.length)), 0, across()); }
      var list = flat(row.start).concat(row.left && row.left !== "core" ? row.left.rooms : [], middle,
                                         row.right && row.right !== "core" ? row.right.rooms : [], flat(row.end));
      return { list: list, mid: true, startCount: flat(row.start).length, endCount: flat(row.end).length };
    });
    return { rows: made };
  }
  // Every row of every floor grown out to W, row by row across the floors.
  // First its rooms that can be bigger, each up to half as big again.  What
  // is still short on every floor is an open court, the same size on every
  // floor so the floors stand one over the other: in a row inside, just past
  // its stairwells, between its halls; along the outside, a notch at the far
  // end.  The rooms round a court get windows onto it (40-shapes.js takes
  // it away once the building stands).  What little is left on a floor
  // goes to the room at the end, or a store room.  Handed back: how many
  // metres went to store rooms and to courts.
  function fmLevelAll(made, W, grow) {
    var out = { store: 0, court: 0 };
    var nRows = made[0].rows.length;
    for (var ri = 0; ri < nRows; ri++) {
      var left = made.map(function (m) {
        var row = m.rows[ri], short = W - fmLen(row.list);
        if (short < 0.05) { return 0; }
        var can = row.list.filter(function (r) { return grow.indexOf(r.kind) >= 0 && !r.bay && !r.cross; });
        var room = can.reduce(function (s, r) { return s + r.w * 0.5; }, 0), g = Math.min(short, room);
        if (g > 0) { can.forEach(function (r) { r.w += g * r.w * 0.5 / room; }); }
        return short - g;
      });
      // the court on each floor as big as it can be and no smaller than the one under it: open to
      // the sky on one floor, it stays open over it -- a court, or over the floor below, a terrace
      // (down from the top, each no bigger than the one over it)
      var order = made.map(function (m, fi) { return fi; }).sort(function (a, b) { return (made[b].level || 0) - (made[a].level || 0); });
      var courts = [], over = Infinity;
      order.forEach(function (fi) { over = Math.min(over, left[fi]); courts[fi] = over; });
      courts = courts.map(function (c) { return c >= 4 ? Math.floor(c * 10) / 10 : 0; });
      // (and none smaller than one under it: a small one on the floor below is let go of instead)
      var low = made.map(function (m, fi) { return fi; }).sort(function (a, b) { return (made[a].level || 0) - (made[b].level || 0); }), under = 0;
      low.forEach(function (fi) { if (courts[fi] && courts[fi] < under) { courts[fi] = under; } under = Math.max(under, courts[fi]); });
      made.forEach(function (m, fi) {
        var row = m.rows[ri], court = Math.min(courts[fi], left[fi]), rest = left[fi] - court;
        if (court) {
          var v = R("void", court, { via: "-", label: TXT.ca_court || "", shVoid: true });
          if (row.mid) { row.list.splice(row.startCount || 0, 0, v); } else { row.list.push(v); }
          out.court += court;
        }
        if (rest < 0.05) { return; }
        var tail = row.endCount ? row.list.splice(row.list.length - row.endCount, row.endCount) : [];
        // (along the outside, the notch stays at the very end: what is left goes in before it)
        var notch = !row.mid && court && row.list[row.list.length - 1].shVoid ? row.list.pop() : null;
        // (a little: to the last room that can take it -- else a hall across, else anything but a
        // stairwell; a store room only where there is a room's worth)
        var free = row.list.filter(function (r) { return !fmCore(r); });
        var last = free.filter(function (r) { return !r.cross && !r.shVoid && r.kind !== "suite"; }).pop() ||
                   free.filter(function (r) { return r.cross; }).pop() || free.pop();
        if (rest < 2.2 && last) { last.w += rest; }
        else { row.list.push(R("storage", rest, { label: TXT.st_storage })); out.store += rest; }
        if (notch) { row.list.push(notch); }
        Array.prototype.push.apply(row.list, tail);
      });
    }
    return out;
  }
  // Where each bay and lift stands along its row, by row: to check they stand over each other.
  function fmBays(rows) {
    var out = {};
    rows.forEach(function (row, ri) {
      var at = 0, lifts = 0;
      row.list.forEach(function (r) {
        fmParts(r).forEach(function (p) {
          var key = p.bay ? ri + ":" + p.bay : p.kind === "lift" ? ri + ":lift" + (lifts++) : null;
          if (key && out[key] === undefined) { out[key] = at; }
        });
        at += r.w || 0;
      });
    });
    return out;
  }
  // A room that opened off one no longer beside it opens off the hall instead.
  function fmVias(f) {
    [f.back].concat(f.mid || [], [f.front]).forEach(function (row) {
      var ids = {};
      row.forEach(function (r, i) { fmParts(r).forEach(function (p) { if (p.id) { ids[p.id] = i; } }); });
      row.forEach(function (r, i) {
        fmParts(r).forEach(function (p) {
          if (!p.via || p.via === "-") { return; }
          var j = ids[p.via];
          var inSuite = r.kind === "suite" && (r.parts || []).some(function (q) { return q.id === p.via; });
          if (inSuite || (j !== undefined && Math.abs(j - i) <= 1)) { return; }
          delete p.via;
        });
      });
    });
  }

  // ---- a house: in by an entry hall -------------------------------------------------------------------
  // A house was walked into straight through the living room, its one hall
  // running from end to end behind it.  Now and then (more often in a house
  // folded into rows, starterFold) it is entered the way most houses are: by
  // an entry hall in the front row, the front door in it, the hall behind
  // reached through it -- and, folded, the short hall across each row inside
  // put in line with it, a spine from the front door to the back of the
  // house.  Its width taken from the biggest room beside it in the row.
  if (typeof STARTER_ROOMS === "object") {
    STARTER_ROOMS.foyer = { w: 2.2, h: 4.4, bw: 2.2, max: 2.6, wall: ["i_coatrack|i_bench", "i_shoerack|i_plant"], mid: ["i_rug"] };
    if (typeof STARTER_LABEL === "object") { STARTER_LABEL.foyer = "fm_foyer"; }
    if (typeof STARTER_ZONE === "object") { STARTER_ZONE.foyer = "hall"; }
    if (typeof STARTER_FLOOR_OF === "object") { STARTER_FLOOR_OF.foyer = "living"; }
    if (typeof STARTER_CEILING === "object") { STARTER_CEILING.foyer = "i_pendant"; }
  }
  var FM_GIVES = { living: 1, family: 1, dining: 1, kitchen: 1, great: 1, office: 1 };
  if (typeof starterPlan === "function") {
    var starterPlanForms = starterPlan;
    starterPlan = function (want) {
      var plan = starterPlanForms.apply(this, arguments);
      try { if (want && (!want.type || want.type === "house")) { fmFoyer(plan, want); } } catch (e) { if (window.console && console.warn) { console.warn("forms:", e && e.message); } }
      return plan;
    };
  }
  function fmFoyer(plan, want) {
    var G = (plan.floors || []).filter(function (f) { return f.level === 0; })[0];
    if (!G || G.open || G.H === 0 || !G.front || G.front.length < 2 || G.front.some(function (r) { return r.entry || r.kind === "foyer"; })) { return; }
    var rnd = starterRand((((want.seed >>> 0) || 1) * 71 + 13) >>> 0), folded = !!(G.mid && G.mid.length);
    if (want.foyer === false || (want.foyer !== true && rnd() >= (folded ? 0.75 : 0.5))) { return; }
    var fw = STARTER_ROOMS.foyer.bw;
    // its width from the biggest room in the row that can spare it
    var give = G.front.filter(function (r) { return FM_GIVES[r.kind] && r.w - fw >= (STARTER_ROOMS[r.kind].bw || STARTER_ROOMS[r.kind].w) - 0.05; })
      .sort(function (a, b) { return b.w - a.w; })[0];
    if (!give) { return; }
    // where: in the middle of the row (between two of its rooms), or beside the living room
    var bounds = [], at = 0;
    G.front.forEach(function (r, i) { at += r.w; if (i < G.front.length - 1) { bounds.push({ i: i + 1, x: at }); } });
    var whole = at, liv = G.front.filter(function (r) { return r.kind === "living"; })[0];
    var spot = null;
    if (liv && rnd() < 0.5) {
      var li = G.front.indexOf(liv);
      spot = bounds.filter(function (b) { return b.i === li || b.i === li + 1; })[Math.floor(rnd() * 2) % 2] || null;
    }
    if (!spot) { spot = bounds.slice().sort(function (a, b) { return Math.abs(a.x - whole / 2) - Math.abs(b.x - whole / 2); })[0]; }
    if (!spot) { return; }
    give.w -= fw;
    G.front.splice(spot.i, 0, { kind: "foyer", label: TXT.fm_foyer || "", w: fw, entry: true });
    // folded: the short hall across each row inside in line with it
    if (!folded) { return; }
    var x0 = 0;
    for (var i = 0; i < G.front.length && G.front[i].kind !== "foyer"; i++) { x0 += G.front[i].w; }
    var mid = x0 + fw / 2;
    G.mid.forEach(function (row) {
      var c = row.findIndex ? row.findIndex(function (r) { return r.cross; }) : -1;
      if (c < 0 || row.length < 3) { return; }
      var hall = row.splice(c, 1)[0], best = -1, bestD = Infinity, x = 0;
      // (not before the row's first room nor after its last: its two ends keep their outside walls)
      for (var j = 1; j < row.length; j++) {
        x += row[j - 1].w;
        var d = Math.abs(x + hall.w / 2 - mid);
        if (d < bestD) { bestD = d; best = j; }
      }
      row.splice(best < 0 ? c : best, 0, hall);
    });
  }
