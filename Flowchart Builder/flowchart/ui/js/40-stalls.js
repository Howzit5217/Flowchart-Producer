// ---------------------------------------------------------------------------
//  40-stalls.js -- washrooms with stalls: a school's, an office's, a
//  mall's, a big store's -- a girls' and a boys' (a women's and a men's),
//  as many toilets in each as the floor's people need, the accessible stall
//  at the end, basins along the end wall, urinals in the boys'
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update this too so you can have bathroom stalls
  // for schools and other places like that so there can be multiple toilets
  // in one room")
  //
  // Each pair of one-toilet restrooms on a floor of a public building
  // becomes a pair of washrooms.  How many toilets each, by the plumbing
  // code's counts (IPC table 2902.1) for the people the floor holds: a
  // school's classrooms 25 each, a toilet for every 30 of each sex (a little
  // over the code's 50, as schools are built); an office one for every 25 of
  // the first 50, every 50 after, a person to 14 m2 of it; a shop or a mall,
  // a person to 5 m2, a toilet for every 150.  Never fewer than two a room.
  var SL_TYPES = { school: "school", office: "work", tower: "work", mall: "shop", shop: "shop" };
  var SL_STALL = 0.92, SL_WIDE = 1.55, SL_BASINS = 1.3;        // metres: a stall's width, the accessible one's, the basins' end
  if (typeof STARTER_ROOMS === "object") { STARTER_ROOMS.washroom = { w: 4.4, h: 4.2, bw: 4.4, max: 14, wall: [], mid: [] }; }
  if (typeof TYPE_USE === "object") { TYPE_USE.washroom = 1; }
  if (typeof ROOM_USE === "object") { ROOM_USE.washroom = "bath"; }
  if (typeof TYPE_DARK === "object") { TYPE_DARK.washroom = 1; }
  if (typeof STARTER_ZONE === "object") { STARTER_ZONE.washroom = "wet"; }
  if (typeof STARTER_VENTED === "object") { STARTER_VENTED.washroom = 1; }
  if (typeof STARTER_CEILING === "object") { STARTER_CEILING.washroom = "i_pendant"; }

  // ---- in the plan: the pairs of restrooms made washrooms, as big as they need -------------------------
  if (typeof BUILDING_TYPES === "object") {
    Object.keys(SL_TYPES).forEach(function (t) {
      var T = BUILDING_TYPES[t];
      if (!T || typeof T.plan !== "function" || T.slStalls) { return; }
      var plain = T.plan;
      T.plan = function (want) {
        var plan = plain.apply(this, arguments);
        try { slPlan(plan, t, want || {}); } catch (e) { if (window.console && console.warn) { console.warn("stalls:", e && e.message); } }
        return plan;
      };
      T.slStalls = true;
    });
  }
  // How many people a floor holds, roughly, by what is on it.
  function slPeople(f, kind) {
    var all = [].concat(f.back || [], f.front || [], f.mid ? [].concat.apply([], f.mid) : []), n = 0;
    var deep = { back: f.Db || 7, front: f.Df || 7 };
    all.forEach(function (r) {
      var D = (f.back || []).indexOf(r) >= 0 ? deep.back : (f.front || []).indexOf(r) >= 0 ? deep.front : (f.Dm || 7), area = (r.w || 0) * D;
      if (kind === "school") { n += r.kind === "classroom" ? 25 : r.kind === "cafeteria" || r.kind === "gym" ? area / 3 : 0; }
      else if (kind === "work") { n += /office|meeting|training|cubicles|boardroom/.test(r.kind) ? area / 14 : 0; }
      else { n += /sales|mallunit|mallanchor|cafe|foodcourt/.test(r.kind) ? area / 5 : 0; }
    });
    return n;
  }
  function slToilets(kind, people) {
    var each = people / 2, n;
    if (kind === "school") { n = each / 30; }
    else if (kind === "work") { n = each <= 50 ? each / 25 : 2 + (each - 50) / 50; }
    else { n = each / 150; }
    return Math.max(2, Math.min(9, Math.ceil(n)));
  }
  function slPlan(plan, t, want) {
    var kind = SL_TYPES[t], changed = false;
    if (t === "shop" && (want.size || 2) < 4) { return; }          // (a corner shop: its two restrooms)
    plan.floors.forEach(function (f) {
      ["back", "front"].forEach(function (side) {
        var band = f[side] || [], rooms = band.filter(function (r) { return r.kind === "restroom"; });
        if (rooms.length < 2) { return; }
        var n = slToilets(kind, slPeople(f, kind));
        rooms.slice(0, 2).forEach(function (r, i) {
          var boys = i === 1;
          r.kind = "washroom";
          r.label = kind === "school" ? (boys ? TXT.sl_boys : TXT.sl_girls) : (boys ? TXT.sl_men : TXT.sl_women);
          r.slBoys = boys;
          r.slToilets = n;
          // (along the room: the stalls, the accessible one, the basins' end)
          r.w = Math.max(r.w, Math.round(((n - 1) * SL_STALL + SL_WIDE + SL_BASINS + 0.3) * 10) / 10);
        });
        changed = true;
      });
    });
    if (!changed) { return; }
    // every band as long as the longest again: the biggest room of each grown
    var W = plan.W || 0;
    plan.floors.forEach(function (f) {
      [f.back, f.front].concat(f.mid || []).forEach(function (b) { if (b) { W = Math.max(W, typeWidth(b)); } });
    });
    plan.floors.forEach(function (f) {
      [f.back, f.front].concat(f.mid || []).forEach(function (b) {
        if (!b || !b.length) { return; }
        var short = W - typeWidth(b);
        if (short < 0.05) { return; }
        var grow = b.filter(function (r) { return r.kind !== "washroom" && r.kind !== "stairs" && r.kind !== "lift" && r.kind !== "suite"; })
          .sort(function (p, q) { return q.w - p.w; })[0] || b[b.length - 1];
        grow.w += short;
      });
    });
    plan.W = W;
  }

  // ---- furnished: the stalls along the far wall, the basins at the end -----------------------------------
  if (typeof typeFurnish === "function") {
    var slFurnishWas = typeFurnish;
    typeFurnish = function (made, rnd, want, plan) {
      var out = slFurnishWas.apply(this, arguments);
      try { made.forEach(function (r) { if (r.starter === "washroom") { slFit(r, made, plan); } }); }
      catch (e) { if (window.console && console.warn) { console.warn("stalls:", e && e.message); } }
      return out;
    };
  }
  // Which of its walls a room's way in is in: the side a hall (or the room it opens off) is on.
  function slInSide(r, made) {
    var b = tieBox(r), best = null;
    made.forEach(function (o) {
      if (o === r || o.kind !== "i_room" || (o.starter !== "hall" && o.starter !== "lobby" && o.starter !== "landing" && o.starter !== "sales" && o.starter !== "commons")) { return; }
      var q = tieBox(o), ox = Math.min(b.r, q.r) - Math.max(b.l, q.l), oy = Math.min(b.b, q.b) - Math.max(b.t, q.t);
      var side = Math.abs(q.t - b.b) < 4 && ox > 20 ? "foot" : Math.abs(q.b - b.t) < 4 && ox > 20 ? "top" :
                 Math.abs(q.l - b.r) < 4 && oy > 20 ? "right" : Math.abs(q.r - b.l) < 4 && oy > 20 ? "left" : null;
      if (side && (!best || o.starter === "hall")) { best = side; }
    });
    return best || "foot";
  }
  function slFit(r, made) {
    var P = FLOOR_PX, b = tieBox(r), T = roomWallOf(r) + 2;
    r.mat = Object.assign({}, r.mat || {}, { floor: "tiles", floorC: "#e6e8e6", wall: "tiles", wallC: "#f4f4f1" });
    // (the plan's numbers are not the room's: how many by how long it is, which by its name)
    var long = Math.max(b.r - b.l, b.b - b.t) / P;
    var n = Math.max(2, Math.min(9, Math.floor((long - SL_WIDE - SL_BASINS - 0.3) / SL_STALL + 1e-6) + 1));
    var boys = String(r.text || "") === TXT.sl_boys || String(r.text || "") === TXT.sl_men;
    var inSide = slInSide(r, made), far = { foot: "top", top: "foot", left: "right", right: "left" }[inSide];
    var across = far === "top" || far === "foot";                      // the far wall runs along x
    var turn = { top: 0, foot: 180, left: 270, right: 90 }[far];
    var len0 = across ? b.l : b.t, len1 = across ? b.r : b.b, line = far === "top" ? b.t : far === "foot" ? b.b : far === "left" ? b.l : b.r;
    var inward = far === "top" || far === "left" ? 1 : -1;
    var st = ICONS.i_toiletstall, deep = st ? st.box[1] : 75, wide = st ? st.box[0] : 45;
    var was = typeof typeRoom !== "undefined" ? typeRoom : null;
    try {
      typeRoom = r;
      // the stalls: the accessible one in the far corner, then the rest toward the basins' end
      var urinals = boys ? Math.max(1, Math.floor(n / 2)) : 0, stalls = Math.max(2, n - urinals), at = len1 - T;
      var c = line + inward * (T + deep / 2);
      for (var i = 0; i < stalls; i++) {
        var w = i === 0 ? Math.round(SL_WIDE * P) : wide;
        var mid = at - w / 2, x = across ? mid : c, y = across ? c : mid;
        var s = typePut("i_toiletstall", x, y, turn, 0);
        if (!s) {
          // (pressed against its neighbour: put down as it is, its own room checked)
          s = adviceAdd("i_toiletstall", Math.round(x), Math.round(y), turn);
        }
        if (s) { s.w = w; s.own = true; if (i === 0) { s.text = TXT.sl_accessible || ""; } }
        at -= w + 1;
      }
      // the urinals on the same wall, a screen's width apart
      var uc = line + inward * (T + 10);
      for (var u = 0; u < urinals; u++) {
        var um = at - 0.35 * P - u * 0.75 * P;
        if (um - 0.4 * P < len0 + SL_BASINS * P) { break; }
        typePut("i_urinal", across ? um : uc, across ? uc : um, turn, 0);
      }
      // the basins along the end wall away from the stalls, the hand dryer by them
      var endTurn = across ? 270 : 0, endLine = across ? b.l : b.t, sinks = Math.max(2, Math.ceil(n / 2));
      var e0 = (across ? b.t : b.l) + T + 0.5 * P, e1 = (across ? b.b : b.r) - T - 0.5 * P, gap = Math.min(0.8 * P, (e1 - e0) / sinks);
      for (var k = 0; k < sinks; k++) {
        var em = e0 + gap * (k + 0.5), ex = across ? endLine + T + 0.3 * P : em, ey = across ? em : endLine + T + 0.3 * P;
        typePut("i_sink", ex, ey, endTurn, 0);
      }
      if (ICONS.i_handdryer) {
        var hm = Math.min(e1, e0 + gap * sinks + 0.3 * P), hx = across ? endLine + T + 0.15 * P : hm, hy = across ? hm : endLine + T + 0.15 * P;
        adviceAdd("i_handdryer", Math.round(hx), Math.round(hy), endTurn);
      }
    } finally { typeRoom = was; }
  }
