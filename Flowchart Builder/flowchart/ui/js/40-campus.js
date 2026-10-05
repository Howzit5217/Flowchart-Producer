// ---------------------------------------------------------------------------
//  40-campus.js -- a school that is not one long line of classrooms: its
//  halls a ring round an open courtyard, round a hub of its big rooms -- a
//  gym, a commons -- or its wings two lengths, an L
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update the school layout because there needs to
  // be a more creative approach to just line and classrooms")
  //
  // Start building lays a building out in bands -- rooms along the back, a
  // hall, rooms along the front -- and, between two halls, rows inside (a
  // house folded, 39-starter.js).  A school uses those now.  A row inside of
  // its big rooms, a hall each side of it, a commons at each end joining the
  // two halls -- so they go round; in the middle of the row an open courtyard
  // (no roof, no floor over it on the floors up the stairs, paved and
  // planted, the rooms round it with windows onto it) and a gym; or a hub of
  // a gym and a commons with no courtyard.  A small school is an L instead:
  // its back wing shorter than its front, the classrooms the back no longer
  // holds along the front.  Which, by how many classrooms and its seed.
  var CA_GYM = 18, CA_ENDS = 6, CA_DEEP = 12;               // metres: a gym's length, a commons', the row inside's depth
  if (typeof STARTER_ROOMS === "object") {
    Object.assign(STARTER_ROOMS, {
      court: { w: 10, h: CA_DEEP, bw: 10, max: 80, wall: [], mid: [] },
      commons: { w: CA_ENDS, h: CA_DEEP, bw: CA_ENDS, max: 30, wall: ["i_bench", "i_plant", "i_lockers", "i_bench", "i_plant"], mid: [] },
      gym: { w: CA_GYM, h: CA_DEEP, bw: CA_GYM, max: 30, wall: ["i_bleachers", "i_lockers"], mid: [] }
    });
  }
  if (typeof TYPE_USE === "object") { Object.assign(TYPE_USE, { court: 1, commons: 1, gym: 1 }); }
  if (typeof ROOM_USE === "object") { Object.assign(ROOM_USE, { court: "hall", commons: "hall", gym: "work" }); }
  if (typeof TYPE_LIT === "object") { TYPE_LIT.commons = 1; TYPE_LIT.gym = 1; }
  if (typeof STARTER_ZONE === "object") { Object.assign(STARTER_ZONE, { court: "day", commons: "day", gym: "day" }); }
  if (typeof STARTER_VENTED === "object") { Object.assign(STARTER_VENTED, { commons: 1, gym: 1 }); }
  if (typeof STARTER_CEILING === "object") { STARTER_CEILING.gym = "i_pendant"; STARTER_CEILING.commons = "i_pendant"; }
  if (typeof TYPE_DARK === "object") { TYPE_DARK.court = 1; }

  // ---- the plan --------------------------------------------------------------------------------------
  if (typeof BUILDING_TYPES === "object" && BUILDING_TYPES.school) {
    var caSchoolWas = BUILDING_TYPES.school.plan;
    BUILDING_TYPES.school.plan = function (want, rnd) {
      var plan = caSchoolWas.apply(this, arguments);
      try { caShape(plan, want || {}, rnd || starterRand(((want && want.seed) >>> 0) + 7)); }
      catch (e) { if (window.console && console.warn) { console.warn("campus:", e && e.message); } }
      return plan;
    };
  }
  function caShape(plan, want, rnd) {
    var floors = plan.floors, W = plan.W, n = Math.max(2, Math.min(TYPE_MOST.classrooms, want.rooms || 4));
    if (!floors || !floors.length || !(W > 0)) { return; }
    // (or plain wings, shaped by 40-shapes.js: a T, an H, a U, two wings side-stepped)
    var r = rnd(), pick = n <= 5 ? (r < 0.4 ? "ell" : "wing") : n <= 9 ? (r < 0.45 ? "court" : r < 0.65 ? "ell" : "wing") : (r < 0.6 ? "court" : r < 0.75 ? "hub" : "wing");
    if (want.campus === "court" || want.campus === "hub" || want.campus === "ell" || want.campus === "wing") { pick = want.campus; }
    if (pick === "court" && W < 2 * CA_ENDS + 10) { pick = W >= CA_ENDS + CA_GYM ? "hub" : "ell"; }
    if (pick === "hub" && W < CA_ENDS + CA_GYM) { pick = "ell"; }
    plan.campus = pick;
    if (pick === "wing") { return; }
    if (pick === "ell") { caEll(plan, rnd); } else { caRing(plan, pick, n); }
  }
  // The row inside, and its two halls: a commons at the west end joining
  // them; a courtyard -- and a gym, if there is room -- or a gym and a second
  // commons; over the gym, on the floors up the stairs, two rooms that join
  // both halls too; over the courtyard, nothing.
  function caRing(plan, pick, n) {
    var W = plan.W, gym = W >= CA_ENDS + CA_GYM + 10 ? CA_GYM : 0, num = 0;
    function cls(k) { num++; return R("classroom", 0, { cross: true, label: say("ty_class_n", { n: (k + 1) * 100 + n + num }) }); }
    plan.floors.forEach(function (f, k) {
      var row = [R("commons", CA_ENDS, { cross: true, label: TXT.ca_commons })], rest = W - CA_ENDS;
      if (pick === "court") {
        var cw = rest - (gym || CA_ENDS);
        row.push(R("court", cw, k ? { label: TXT.ca_court, via: "-" } : { label: TXT.ca_court }));
        if (gym) {
          if (k) { var a = cls(k), b = cls(k); a.w = gym / 2; b.w = gym / 2; row.push(a, b); }
          else { row.push(R("gym", gym, { cross: true, label: TXT.ca_gym })); }
        } else { row.push(R("commons", CA_ENDS, { cross: true, label: TXT.ca_commons })); }
      } else {
        if (k) { var c = cls(k), d = cls(k); c.w = CA_GYM / 2; d.w = CA_GYM / 2; row.push(c, d); }
        else { row.push(R("gym", CA_GYM, { cross: true, label: TXT.ca_gym })); }
        var left = rest - CA_GYM;
        if (left >= 3) { row.push(R("commons", left, { cross: true, label: TXT.ca_commons })); }
        else { row[row.length - 1].w += left; }
      }
      f.mid = [row];
      f.Dm = CA_DEEP;
    });
  }
  // An L: the back wing a little more than half as long as the front, the
  // classrooms past it along the front -- the same on every floor, so the
  // floors stand one over the other.
  function caEll(plan, rnd) {
    var floors = plan.floors, ground = floors.filter(function (f) { return f.level === 0; })[0] || floors[0];
    var keep = plan.W * (0.5 + rnd() * 0.15), cut = 0;
    ground.back.reduce(function (at, r) { if (at + r.w <= keep + 0.1 || r.kind !== "classroom") { cut = at + r.w; } return at + r.w; }, 0);
    if (!(cut > 0) || cut >= plan.W - 4) { return; }
    floors.forEach(function (f) {
      var at = 0, back = [], moved = [];
      f.back.forEach(function (r) {
        if (r.kind === "suite" || r.kind !== "classroom" || at + r.w <= cut + 0.1) { back.push(r); at += r.w; } else { moved.push(r); }
      });
      if (!moved.length) { return; }
      f.back = back;
      f.front = f.front.concat(moved);
    });
    var W = 0;
    floors.forEach(function (f) { W = Math.max(W, typeWidth(f.front)); });
    floors.forEach(function (f) {
      typeFill(f.front, W, ["classroom", "cafeteria"]);
      // (every floor's back wing as long as the ground floor's: its last room grown or the wing cut to it)
      var bw = typeWidth(f.back), cutAt = typeWidth(ground.back);
      if (bw < cutAt) { typeFill(f.back, cutAt, ["classroom", "restroom"]); }
    });
    plan.W = W;
  }

  // ---- once it is made: the courtyard, the gym ------------------------------------------------------
  if (typeof typeFurnish === "function") {
    var caFurnishWas = typeFurnish;
    typeFurnish = function (made, rnd, want, plan) {
      var out = caFurnishWas.apply(this, arguments);
      try { if (want && want.type === "school") { caFinish(made, rnd); } } catch (e) { if (window.console && console.warn) { console.warn("campus:", e && e.message); } }
      return out;
    };
  }
  function caFinish(made, rnd) {
    var P = FLOOR_PX, floors = typeof floorsOf === "function" ? floorsOf() : [];
    function lv(r) { var f = floors.length ? floorAt(floors, r.x, r.y) : null; return f ? f.level : 0; }
    made.forEach(function (r) {
      if (r.starter === "court") {
        r.court = true;
        if (lv(r) > 0) { r.courtOver = true; } else { r.mat = Object.assign({}, r.mat || {}, { floor: "slate", floorC: "#9a9c96" }); caCourt(r, rnd); }
        caCourtWindows(r, made);
      } else if (r.starter === "gym") {
        r.mat = Object.assign({}, r.mat || {}, { floor: "boards", floorC: "#c9a06a", wall: "paint", wallC: "#eef0ea" });
        caGym(r);
      } else if (r.starter === "commons") {
        r.mat = Object.assign({}, r.mat || {}, { floor: "terrazzo", floorC: "#e7e2d8", wall: "paint", wallC: "#f2efe8" });
      }
    });
  }
  // Trees in a row down the middle, benches facing them, planters at the
  // corners, picnic tables between -- a fountain in a big one.
  function caCourt(r, rnd) {
    var P = FLOOR_PX, b = tieBox(r), was = typeof typeRoom !== "undefined" ? typeRoom : null, long = b.r - b.l >= b.b - b.t;
    try {
      typeRoom = r;
      var len = long ? b.r - b.l : b.b - b.t, mid = long ? (b.t + b.b) / 2 : (b.l + b.r) / 2, n = Math.max(1, Math.floor(len / (6 * P)));
      for (var i = 0; i < n; i++) {
        var s = (long ? b.l : b.t) + (i + 0.5) * len / n;
        if (n >= 3 && i === Math.floor(n / 2) && ICONS.i_fountain) { typePut("i_fountain", long ? s : mid, long ? mid : s, 0, 4); continue; }
        typePut("i_tree", long ? s : mid, long ? mid : s, 0, 6);
        [-1, 1].forEach(function (k) {
          var off = 2.4 * P * k;
          typePut("i_bench", long ? s : mid + off, long ? mid + off : s, long ? (k < 0 ? 0 : 180) : (k < 0 ? 270 : 90), 4);
        });
        if (ICONS.i_picnic && i + 1 < n) {
          var t = (long ? b.l : b.t) + (i + 1) * len / n;
          typePut("i_picnic", long ? t : mid + 3.6 * P, long ? mid + 3.6 * P : t, long ? 0 : 90, 6);
        }
      }
      [[b.l, b.t], [b.r, b.t], [b.r, b.b], [b.l, b.b]].forEach(function (c) {
        typePut("i_planter", c[0] + (c[0] < r.x ? 1 : -1) * 0.8 * P, c[1] + (c[1] < r.y ? 1 : -1) * 0.8 * P, 0, 3);
      });
    } finally { typeRoom = was; }
  }
  // A hoop at each end, the bleachers along a long side (STARTER_ROOMS put them).
  function caGym(r) {
    var P = FLOOR_PX, b = tieBox(r), long = b.r - b.l >= b.b - b.t, was = typeof typeRoom !== "undefined" ? typeRoom : null;
    if (!ICONS.i_hoop) { return; }
    try {
      typeRoom = r;
      if (long) { typePut("i_hoop", b.l + 0.7 * P, r.y, 90, 1); typePut("i_hoop", b.r - 0.7 * P, r.y, 270, 1); }
      else { typePut("i_hoop", r.x, b.t + 0.7 * P, 180, 1); typePut("i_hoop", r.x, b.b - 0.7 * P, 0, 1); }
    } finally { typeRoom = was; }
  }
  // Windows onto the courtyard in every wall round it, three metres apart --
  // clear of the middle of the hall's, where its door into it is.
  function caCourtWindows(court, made) {
    var P = FLOOR_PX, c = court.local, floors = typeof floorsOf === "function" ? floorsOf() : [];
    var fc = floors.length ? floorAt(floors, court.x, court.y) : null;
    made.forEach(function (o) {
      if (o === court || o.kind !== "i_room" || !o.local || o.starter === "court") { return; }
      var fo = floors.length ? floorAt(floors, o.x, o.y) : null;
      if (fo !== fc) { return; }
      var q = o.local, side = null, a = 0, b = 0;
      if (Math.abs(q[3] - c[1]) < 2) { side = "top"; } else if (Math.abs(q[1] - c[3]) < 2) { side = "foot"; }
      else if (Math.abs(q[2] - c[0]) < 2) { side = "left"; } else if (Math.abs(q[0] - c[2]) < 2) { side = "right"; }
      if (!side) { return; }
      var across = side === "top" || side === "foot";
      a = Math.max(across ? q[0] : q[1], across ? c[0] : c[1]); b = Math.min(across ? q[2] : q[3], across ? c[2] : c[3]);
      if (b - a < 2.0 * P) { return; }
      var door = o.starter === "hall" && !court.courtOver ? (a + b) / 2 : null;
      var line = side === "top" ? c[1] : side === "foot" ? c[3] : side === "left" ? c[0] : c[2];
      for (var s = a + 1.5 * P; s <= b - 1.2 * P; s += 3 * P) {
        if (door !== null && Math.abs(s - door) < 1.8 * P) { continue; }
        // (in the room's own numbers, as it is drawn -- local is where it goes put together)
        var lx = across ? s : line, ly = across ? line : s;
        var x = o.x + (lx - (q[0] + q[2]) / 2), y = o.y + (ly - (q[1] + q[3]) / 2);
        // (a hair inside its room: its wall's, not the courtyard's)
        if (across) { y += side === "top" ? -3 : 3; } else { x += side === "left" ? -3 : 3; }
        var win = adviceAdd("i_window", Math.round(x), Math.round(y), across ? 0 : 90);
        if (win) { win.w = Math.round(1.4 * P); win.own = true; }
      }
    });
  }

  // ---- in 3D: open to the sky ------------------------------------------------------------------------
  // No roof over it; no walls of its own (the rooms round it have theirs);
  // over it on the floors up the stairs, nothing at all.
  function caCourts() { return hand.nodes.filter(function (n) { return n.kind === "i_room" && n.court; }); }
  if (typeof roofPlan === "function") {
    var roofPlanCourt = roofPlan;
    roofPlan = function () {
      var keep = hand.nodes;
      if (!keep.some(function (n) { return n.kind === "i_room" && n.court; })) { return roofPlanCourt.apply(this, arguments); }
      try {
        hand.nodes = keep.filter(function (n) { return !(n.kind === "i_room" && n.court); });
        return roofPlanCourt.apply(this, arguments);
      } finally { hand.nodes = keep; }
    };
  }
  if (typeof v3Wall === "function") {
    var v3WallCourt = v3Wall;
    v3Wall = function (faces, room) {
      if (room && room.court) { return; }
      return v3WallCourt.apply(this, arguments);
    };
  }
  if (typeof v3Build === "function") {
    var v3BuildCourt = v3Build;
    v3Build = function () {
      var model = v3BuildCourt.apply(this, arguments);
      try {
        if (model && model.faces && hand.nodes.some(function (n) { return n.kind === "i_room" && n.court; })) {
          // (the courtyard's own ceiling, and anything of a room over it, taken away)
          model.faces = model.faces.filter(function (f) {
            var n = f.node;
            if (!n || !n.court) { return true; }
            if (n.courtOver) { return false; }
            return !(f.ceiling || (f.how && (f.how.ceiling || f.how.caster)));
          });
        }
      } catch (e) { /* as it was */ }
      return model;
    };
  }
