// ---------------------------------------------------------------------------
//  40-open3d.js -- things opened the way they are made, walking round in
//  3D: a fridge's doors swung on their hinges and the food inside, a
//  drawer run out on its runners with what is kept in it, an oven's door
//  let down, a lid lifted; used by looking right at them from near enough
//  to reach, with a mark in the middle of the view saying what E does; a
//  piece's menu in 3D the flowchart's own; the walking hint gone after
//  its first three seconds
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "when you go to interact with all things they
  // open and show what they are supposed to show in 3d too and they can get
  // opened as they are designed in their normal 3d model and not just a
  // random thing slapped on there ... you can move things in the 3d space
  // but the menu it uses should match the style of menu that is used in the
  // flowchart ... the WASD to walk little thing of text should appear for
  // the first 3 seconds then fade away and when you want to interact with
  // something you have to be within reasonable distance and be looking
  // right at it and to update the cursor in 3d too")
  //
  // Opened, a thing used to be its closed model with a box laid over it --
  // a drawer stuck to its front, a door stood beside a fridge (40-use3d.js).
  // Now each model says which of its parts open and how (M.front): a door
  // swings on the hinge at its edge, a drawer runs out, a flap lets down, a
  // lid lifts at the back.  The carcass behind is cut open where it opens
  // (M.hole), and what is kept there is put in.  The part opened is the one
  // looked at: the drawer under the middle of the view, not the top one.
  var O3_MS = 420;                       // a door's swing all the way open (ms)
  var O3_REACH = 2.0, O3_REACH_DOOR = 1.75, O3_REACH_UP = 3.0;   // metres from the eye: an arm and a step; a light overhead
  var O3_FIXED = { i_room: 1, i_floor: 1, i_lot: 1, i_zone: 1, i_window: 1, i_wall: 1 };
  var O3_HEAT = { i_stove: 1, i_oven: 1, i_fireplace: 1, i_grill: 1, i_firepit: 1, i_heater: 1, i_furnace: 1, i_waterheater: 1 };
  var o3Live = false;                    // models made as they stand open (only while the picture is put right)
  var o3Making = null;                   // the piece whose model is being made

  // ---- what stands open ----------------------------------------------------------------------
  // The view's, not the design's, as the lights are (V3.use): `fr` the parts
  // open, by piece and part; `anim` those on their way.
  function o3Use() {
    var U = useState();
    U.fr = U.fr || {};
    U.anim = U.anim || {};
    return U;
  }
  function o3Ease(t) { return t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3); }
  // How far open a piece's part is, now: 0 shut, 1 all the way.
  function o3K(id, i) {
    var U = typeof V3 !== "undefined" && V3 ? V3.use : null;
    if (!U || !U.fr) { return 0; }
    var want = U.fr[id] && U.fr[id][i] ? 1 : 0, A = U.anim && U.anim[id], a = A && A[i];
    if (!a) { return want; }
    var t = (performance.now() - a.t0) / a.ms;
    if (t >= 1 || (typeof STILL !== "undefined" && STILL)) { delete A[i]; return want; }
    return a.from + (want - a.from) * o3Ease(t);
  }
  // (2026-10-04: "all things are of accurate time") How long a part takes to
  // open all the way, as long as the real one does by hand: a drawer pulled
  // out, a cupboard's door swung, a lid lifted, a flap let down -- and an
  // appliance's heavier door slower (each was 0.42 s, O3_MS).
  var O3_TIMES = { drawer: 650, door: 800, lid: 900, flap: 1150, slide: 900 };
  var O3_HEAVY = { i_fridge: 1100, i_freezer: 1000, i_reachin: 1100, i_cooler: 1100, i_winecooler: 900, i_oven: 1200,
                   i_dishwasher: 1200, i_washer: 900, i_dryer: 900, i_microwave: 650 };
  function o3Ms(id, i) {
    var f = typeof modelFronts === "object" && modelFronts[id] ? modelFronts[id][i] : null, n = /^[0-9]+$/.test(String(id)) ? nodeById(+id) : null;
    var ms = f ? (O3_TIMES[f.kind] || O3_TIMES[f.part] || O3_MS) : O3_MS;
    if (n && O3_HEAVY[n.kind] && !(f && f.kind === "drawer")) { ms = O3_HEAVY[n.kind]; }
    return ms;
  }
  function o3IsOpen(id, i) {
    var U = typeof V3 !== "undefined" && V3 ? V3.use : null;
    return !!(U && U.fr && U.fr[id] && U.fr[id][i]);
  }
  function o3Set(id, i, open) {
    var U = o3Use(), was = o3K(id, i), to = open ? 1 : 0;
    if (open) { (U.fr[id] || (U.fr[id] = {}))[i] = true; }
    else if (U.fr[id]) {
      delete U.fr[id][i];
      if (!Object.keys(U.fr[id]).length) { delete U.fr[id]; }
    }
    if (Math.abs(to - was) > 0.001) {
      (U.anim[id] || (U.anim[id] = {}))[i] = { from: was, t0: performance.now(), ms: o3Ms(id, i) * Math.max(0.4, Math.abs(to - was)) };
    }
    V3.o3Moving = true;
    V3.o3Pose = null;
    V3.dirty = true;
  }
  // For v3ModelPut (38-models.js): how a piece is to be made -- its parts
  // as far open as they are, its fire lit -- or null, made as it always is.
  function modelStateOf(n) {
    if (!o3Live || !n || typeof V3 === "undefined" || !V3 || !V3.use) { return null; }
    var U = V3.use, idx = {}, vals = {}, any = false, passing = false;
    if (U.fr && U.fr[n.id]) { Object.keys(U.fr[n.id]).forEach(function (i) { idx[i] = true; }); }
    if (U.anim && U.anim[n.id]) { Object.keys(U.anim[n.id]).forEach(function (i) { idx[i] = true; }); }
    Object.keys(idx).forEach(function (i) {
      var k = o3K(n.id, +i);
      if (k > 0.001) { vals[i] = k; any = true; if (k < 0.999) { passing = true; } }
    });
    var on = !!(O3_HEAT[n.kind] && U.on && U.on[n.id]);
    if (!any && !on) { return null; }
    var key = "o" + Object.keys(vals).map(function (i) { return i + ":" + Math.round(vals[i] * 60); }).join(",") + (on ? ":on" : "");
    return { key: key, on: on, passing: passing, k: function (i) { return vals[i] || 0; } };
  }
  function o3On(X) { return !!(X && X.state && X.state.on); }

  // ---- the parts that open, and the holes they open on -------------------------------------------
  // Every model is made knowing its piece (o3Making); each box it is made
  // of is noted (where in its mesh, in what frame), so that a hole can be
  // cut in its face afterwards -- the face made again round the hole and a
  // hollow put behind it, as deep as was asked.
  if (typeof modelMaker === "function") {
    var modelMakerOpen = modelMaker;
    modelMaker = function () {
      var M = modelMakerOpen.apply(this, arguments), box = M.box, done = M.done;
      M.fronts = []; M.holes = []; M.boxes = []; M.state = null;
      M.kind = o3Making ? o3Making.kind : ""; M.W = o3Making ? o3Making.w || 0 : 0; M.D = o3Making ? o3Making.h || 0 : 0;
      M.box = function (x0, x1, y0, y1, z0, z1, m, r) {
        var b = M.parts[m], from = b ? b.p.length : 0, out = box.apply(this, arguments);
        if (b) {
          M.boxes.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), y0: Math.min(y0, y1), y1: Math.max(y0, y1),
                         z0: Math.min(z0, z1), z1: Math.max(z0, z1), m: m, cur: M.cur, from: from, to: b.p.length });
        }
        return out;
      };
      // A part that opens: what kind (door, drawer, flap, lid, slide), its
      // box shut (in the frame it is being made in), and how far it runs
      // out -- handed back, how far open it is.  Called the same, in the
      // same order, whether it is open or not: each part is known by its place.
      M.front = function (kind, x0, x1, y0, y1, z0, z1, o) {
        o = o || {};
        var i = M.fronts.length, C = M.cur, lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
        [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].forEach(function (p) {
          var q = [C[0] * p[0] + C[1] * p[1] + C[2] * p[2] + C[9], C[3] * p[0] + C[4] * p[1] + C[5] * p[2] + C[10],
                   C[6] * p[0] + C[7] * p[1] + C[8] * p[2] + C[11]];
          for (var k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], q[k]); hi[k] = Math.max(hi[k], q[k]); }
        });
        var s = o.slide || 0, sx = o.slideX || 0;
        var run = s || sx ? [C[0] * sx + C[1] * s, C[3] * sx + C[4] * s, C[6] * sx + C[7] * s] : null;
        M.fronts.push({ kind: kind, part: o.part || (kind === "drawer" ? "drawer" : kind === "lid" ? "lid" : "door"),
                        box: [lo[0], hi[0], lo[1], hi[1], lo[2], hi[2]], slide: run });
        return M.state && M.state.k ? M.state.k(i) : 0;
      };
      // a hole in the front (+y) of the box behind, x0..x1 and z0..z1 at y, `deep` into it
      M.hole = function (x0, x1, z0, z1, y, deep, inner) {
        M.holes.push({ face: "front", u0: x0, u1: x1, v0: z0, v1: z1, at: y, deep: deep, inner: inner, cur: M.cur });
      };
      // and in the top (+z), x0..x1 and y0..y1 at z, `deep` down
      M.holeTop = function (x0, x1, y0, y1, z, deep, inner) {
        M.holes.push({ face: "top", u0: x0, u1: x1, v0: y0, v1: y1, at: z, deep: deep, inner: inner, cur: M.cur });
      };
      M.done = function () {
        try { o3Cut(M); } catch (e) { /* left whole */ }
        var out = done.apply(this, arguments);
        if (M.fronts.length) { out.fronts = M.fronts; }
        return out;
      };
      return M;
    };
  }
  if (typeof v3ModelPut === "function") {
    var v3ModelPutOpen = v3ModelPut;
    v3ModelPut = function (faces, n) {
      var was = o3Making;
      o3Making = n;
      try { return v3ModelPutOpen.apply(this, arguments); } finally { o3Making = was; }
    };
  }
  function o3Same(A, B) {
    for (var i = 0; i < 12; i++) { if (Math.abs(A[i] - B[i]) > 1e-4) { return false; } }
    return true;
  }
  // The box a hole is cut in: one made in the same frame, its face where
  // the hole is, all round it -- the smallest, if several.
  function o3HostOf(M, h) {
    var best = null, tol = 0.8 * cm, edge = 0.6 * cm;
    M.boxes.forEach(function (b) {
      if (!o3Same(b.cur, h.cur)) { return; }
      if (h.face === "top") {
        if (Math.abs(b.z1 - h.at) > tol || b.z1 - b.z0 < 3 * cm) { return; }
        if (b.x0 > h.u0 + edge || b.x1 < h.u1 - edge || b.y0 > h.v0 + edge || b.y1 < h.v1 - edge) { return; }
      } else {
        if (Math.abs(b.y1 - h.at) > tol || b.y1 - b.y0 < 3 * cm) { return; }
        if (b.x0 > h.u0 + edge || b.x1 < h.u1 - edge || b.z0 > h.v0 + edge || b.z1 < h.v1 - edge) { return; }
      }
      var vol = (b.x1 - b.x0) * (b.y1 - b.y0) * (b.z1 - b.z0);
      if (!best || vol < best.vol) { best = { b: b, vol: vol }; }
    });
    return best ? best.b : null;
  }
  // The box behind a row of fronts being made now (for how deep a drawer can run).
  function o3Behind(M, x0, x1, y, z0, z1) {
    return o3HostOf(M, { face: "front", u0: x0 + 1 * cm, u1: x1 - 1 * cm, v0: z0 + 1 * cm, v1: z1 - 1 * cm, at: y, cur: M.cur });
  }
  function o3Face(M, m, A, B, C, D, nn) {
    var P = FLOOR_PX, ax = Math.abs(nn[0]) > 0.5 ? [1, 2] : Math.abs(nn[1]) > 0.5 ? [0, 2] : [0, 1];
    M.quad(m, A, B, C, D, nn, [A, B, C, D].map(function (q) { return [q[ax[0]] / P, q[ax[1]] / P]; }));
  }
  function o3Cut(M) {
    if (!M.holes.length) { return; }
    var hosts = [];
    M.holes.forEach(function (h) {
      var b = o3HostOf(M, h);
      if (!b) { return; }
      if (!b.holes) { b.holes = []; hosts.push(b); }
      b.holes.push(h);
    });
    if (!hosts.length) { return; }
    // what each was, taken out of its mesh (the last first, so the rest stay where they are)
    hosts.slice().sort(function (p, q) { return q.from - p.from; }).forEach(function (b) {
      var part = M.parts[b.m], n = (b.to - b.from) / 3, v0 = b.from / 3;
      part.p.splice(b.from, b.to - b.from);
      part.n.splice(b.from, b.to - b.from);
      part.uv.splice(v0 * 2, n * 2);
      if (part.a) { part.a.splice(v0, n); }
    });
    var keep = M.cur;
    hosts.forEach(function (b) {
      M.cur = b.cur;
      o3Holed(M, b);
      b.holes.forEach(function (h) { o3Hollow(M, b, h); });
    });
    M.cur = keep;
  }
  // The box again, its face with holes in it.
  function o3Holed(M, b) {
    var x0 = b.x0, x1 = b.x1, y0 = b.y0, y1 = b.y1, z0 = b.z0, z1 = b.z1, m = b.m, top = b.holes[0].face === "top";
    if (!top) { o3Face(M, m, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]); }
    if (z0 > 0.5) { o3Face(M, m, [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1]); }
    o3Face(M, m, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
    if (top) { o3Face(M, m, [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0]); }
    o3Face(M, m, [x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [-1, 0, 0]);
    o3Face(M, m, [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0]);
    // the face cut: a grid of every edge of every hole, each square of it kept unless it is in one
    var U0 = x0, U1 = x1, V0 = top ? y0 : z0, V1 = top ? y1 : z1, us = [U0, U1], vs = [V0, V1];
    b.holes.forEach(function (h) {
      us.push(Math.max(U0, Math.min(U1, h.u0)), Math.max(U0, Math.min(U1, h.u1)));
      vs.push(Math.max(V0, Math.min(V1, h.v0)), Math.max(V0, Math.min(V1, h.v1)));
    });
    function uniq(list) { return list.sort(function (p, q) { return p - q; }).filter(function (v, i, a) { return !i || v - a[i - 1] > 0.01; }); }
    us = uniq(us); vs = uniq(vs);
    for (var i = 0; i + 1 < us.length; i++) {
      for (var j = 0; j + 1 < vs.length; j++) {
        var cu = (us[i] + us[i + 1]) / 2, cv = (vs[j] + vs[j + 1]) / 2;
        if (b.holes.some(function (h) { return cu > h.u0 && cu < h.u1 && cv > h.v0 && cv < h.v1; })) { continue; }
        if (top) { o3Face(M, m, [us[i], vs[j], z1], [us[i + 1], vs[j], z1], [us[i + 1], vs[j + 1], z1], [us[i], vs[j + 1], z1], [0, 0, 1]); }
        else { o3Face(M, m, [us[i], y1, vs[j]], [us[i + 1], y1, vs[j]], [us[i + 1], y1, vs[j + 1]], [us[i], y1, vs[j + 1]], [0, 1, 0]); }
      }
    }
  }
  // Behind a hole: its walls, facing in, and its back (or, cut in the top, its floor).
  function o3Hollow(M, b, h) {
    var parts = b.m.split("|"), kind = (h.inner && h.inner[0]) || parts[0], color = (h.inner && h.inner[1]) || mShade(parts[1], 0.08);
    var side = M.mat(kind, color), back = M.mat(kind, mShade(color, -0.12));
    var u0 = h.u0, u1 = h.u1, v0 = h.v0, v1 = h.v1;
    if (h.face === "top") {
      var zb = Math.max(b.z0 + 0.8 * cm, h.at - (h.deep || (b.z1 - b.z0))), zt = b.z1;
      o3Face(M, back, [u0, v0, zb], [u1, v0, zb], [u1, v1, zb], [u0, v1, zb], [0, 0, 1]);
      o3Face(M, side, [u0, v0, zb], [u1, v0, zb], [u1, v0, zt], [u0, v0, zt], [0, 1, 0]);
      o3Face(M, side, [u0, v1, zb], [u1, v1, zb], [u1, v1, zt], [u0, v1, zt], [0, -1, 0]);
      o3Face(M, side, [u0, v0, zb], [u0, v1, zb], [u0, v1, zt], [u0, v0, zt], [1, 0, 0]);
      o3Face(M, side, [u1, v0, zb], [u1, v1, zb], [u1, v1, zt], [u1, v0, zt], [-1, 0, 0]);
      return;
    }
    var yb = Math.max(b.y0 + 0.8 * cm, h.at - (h.deep || (b.y1 - b.y0))), yf = b.y1;
    o3Face(M, back, [u0, yb, v0], [u1, yb, v0], [u1, yb, v1], [u0, yb, v1], [0, 1, 0]);
    o3Face(M, side, [u0, yb, v0], [u0, yf, v0], [u0, yf, v1], [u0, yb, v1], [1, 0, 0]);
    o3Face(M, side, [u1, yb, v0], [u1, yf, v0], [u1, yf, v1], [u1, yb, v1], [-1, 0, 0]);
    o3Face(M, side, [u0, yb, v0], [u1, yb, v0], [u1, yf, v0], [u0, yf, v0], [0, 0, 1]);
    o3Face(M, side, [u0, yb, v1], [u1, yb, v1], [u1, yf, v1], [u0, yf, v1], [0, 0, -1]);
  }
  // Swung on a hinge upright at px, py (a door); let down on one along y at
  // pz (a flap, opening out); lifted on one along y at pz (a lid, rising at
  // the front).  Degrees.
  function o3Swing(M, px, py, deg, fn) {
    M.push().move(px, py, 0).turn(deg).move(-px, -py, 0);
    try { fn(); } finally { M.pop(); }
  }
  function o3Flap(M, py, pz, deg, fn) {
    M.push().move(0, py, pz).tiltX(-deg).move(0, -py, -pz);
    try { fn(); } finally { M.pop(); }
  }
  function o3Lift(M, py, pz, deg, fn, drop) {      // (drop: let down as it lifts -- a lid on its top edge comes to rest on the rim)
    M.push().move(0, 0, -(drop || 0)).move(0, py, pz).tiltX(deg).move(0, -py, -pz);
    try { fn(); } finally { M.pop(); }
  }
  // A ring cut square on the outside: round the opening of a drum, in a square hole.
  function o3Ring(M, cx, y, cz, r, half, m) {
    var seg = 32;
    function on(a, k) { var c = Math.cos(a), s = Math.sin(a), q = k ? half / Math.max(Math.abs(c), Math.abs(s)) : r; return [cx + c * q, y, cz + s * q]; }
    for (var i = 0; i < seg; i++) {
      var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
      o3Face(M, m, on(a0, 0), on(a1, 0), on(a1, 1), on(a0, 1), [0, 1, 0]);
    }
  }
  // A drum seen from inside: round along -y from its mouth, and its back.
  function o3Drum(M, cx, y, cz, r, deep, m) {
    var seg = 22, P = FLOOR_PX;
    for (var i = 0; i < seg; i++) {
      var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
      var c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      var A = [cx + c0 * r, y, cz + s0 * r], B = [cx + c1 * r, y, cz + s1 * r], C = [cx + c1 * r, y - deep, cz + s1 * r], D = [cx + c0 * r, y - deep, cz + s0 * r];
      var nA = [-c0, 0, -s0], nB = [-c1, 0, -s1];
      M.tri(m, A, B, C, nA, nB, nB, [a0 * r / P, 0], [a1 * r / P, 0], [a1 * r / P, deep / P]);
      M.tri(m, A, C, D, nA, nB, nA, [a0 * r / P, 0], [a1 * r / P, deep / P], [a0 * r / P, deep / P]);
      M.tri(m, [cx, y - deep, cz], D, C, [0, 1, 0], [0, 1, 0], [0, 1, 0]);
    }
  }
  function o3Lathe(M, x, y, z, prof, m, o) {
    return M.lathe(x, y, prof.map(function (p) { return [p[0], p[1] + z]; }), m, o);
  }

  // ---- what is kept inside ----------------------------------------------------------------------
  var O3_CLOTH = ["#2f4f6f", "#d8d2c4", "#8c3b2f", "#3d5c43", "#1f2a33", "#b5653a", "#e8e4dc", "#6d5a7a", "#9fb4c8", "#c9b48a"];
  var O3_TOWEL = ["#f4f2ee", "#cfe0e8", "#e8d6cc", "#d8e4d0", "#f2e2b8", "#c9d1d9"];
  var O3_LABEL = ["#c7372f", "#2f6f9f", "#e0a82e", "#3f8f4f", "#e07a2f", "#7a3f8f", "#2f8f8f", "#d9c7a6"];
  function o3Of(rnd, list) { return list[Math.floor(rnd() * list.length) % list.length]; }
  function o3Bottle(M, x, y, z, r, h, m, cap) {
    o3Lathe(M, x, y, z, [[r * 0.92, 0], [r, h * 0.05], [r, h * 0.6], [r * 0.5, h * 0.78], [r * 0.34, h * 0.84], [r * 0.34, h * 0.95]], m, { seg: 10 });
    M.cyl(x, y, z + h * 0.93, z + h, r * 0.38, cap || m, { seg: 8 });
  }
  function o3Jar(M, x, y, z, r, h, m, lid) {
    o3Lathe(M, x, y, z, [[r * 0.9, 0], [r, h * 0.08], [r, h * 0.8], [r * 0.86, h * 0.88]], m, { seg: 10 });
    M.cyl(x, y, z + h * 0.86, z + h, r * 0.9, lid, { seg: 10 });
  }
  function o3Can(M, x, y, z, r, h, label, tin) {
    M.cyl(x, y, z, z + h - 0.3 * cm, r, label, { seg: 10 });
    M.cyl(x, y, z + h - 0.3 * cm, z + h, r * 0.96, tin, { seg: 10 });
  }
  function o3Plates(M, x, y, z, r, count, m) {
    var h = count * 1.1 * cm;
    o3Lathe(M, x, y, z, [[r * 0.6, 0], [r * 0.95, h * 0.5], [r, h], [r * 0.62, h - 0.4 * cm], [0, h - 0.4 * cm]], m, { seg: 16 });
  }
  function o3Bowl(M, x, y, z, r, m) {
    o3Lathe(M, x, y, z, [[r * 0.4, 0], [r * 0.78, r * 0.25], [r, r * 0.6], [r * 0.9, r * 0.6], [r * 0.68, r * 0.3], [0, r * 0.12]], m, { seg: 14 });
  }
  function o3Glass(M, x, y, z, r, h, m, down) {
    var prof = [[r * 0.8, 0], [r, h], [r * 0.92, h], [r * 0.72, 0.5 * cm], [0, 0.5 * cm]];
    if (down) { prof = prof.map(function (p) { return [p[0], h - p[1]]; }).reverse(); }
    o3Lathe(M, x, y, z, prof, m, { seg: 12 });
  }
  function o3Mug(M, x, y, z, r, h, m) {
    M.cyl(x, y, z, z + h, r, m, { seg: 12 });
    M.tube([x + r, y, z + h * 0.78], [x + r + 1.6 * cm, y, z + h * 0.66], 0.5 * cm, m, 6);
    M.tube([x + r + 1.6 * cm, y, z + h * 0.66], [x + r, y, z + h * 0.24], 0.5 * cm, m, 6);
  }
  function o3Pot(M, x, y, z, r, h, m) {
    M.cyl(x, y, z, z + h, r, m, { seg: 16 });
    M.cyl(x, y, z + h, z + h + 0.6 * cm, r * 1.02, m, { seg: 16 });
    M.cyl(x, y, z + h + 0.6 * cm, z + h + 1.8 * cm, 1.2 * cm, M.mat("plastic", "#2a2b2d"), { seg: 8 });
    M.box(x + r, x + r + 2 * cm, y - 1 * cm, y + 1 * cm, z + h - 3 * cm, z + h - 1.5 * cm, m);
    M.box(x - r - 2 * cm, x - r, y - 1 * cm, y + 1 * cm, z + h - 3 * cm, z + h - 1.5 * cm, m);
  }
  function o3Shelf(M, B, z, m) { M.box(B.x0, B.x1, B.y0, B.y1, z - 1.2 * cm, z, m); }
  // A wire rack: bars front to back, a rail round its top.
  function o3Rack(M, x0, x1, y0, y1, z, h) {
    var wire = M.mat("chrome", "#c9ced3"), t = 0.35 * cm;
    for (var x = x0; x <= x1 + 0.01; x += Math.max(2 * cm, (x1 - x0) / Math.round((x1 - x0) / (3.5 * cm)))) { M.box(x - t, x + t, y0, y1, z, z + t * 2, wire); }
    [y0, (y0 + y1) / 2, y1].forEach(function (y) { M.box(x0, x1, y - t, y + t, z, z + t * 2, wire); });
    if (h > 0) {
      M.box(x0, x1, y0 - t, y0 + t, z + h - t, z + h + t, wire); M.box(x0, x1, y1 - t, y1 + t, z + h - t, z + h + t, wire);
      M.box(x0 - t, x0 + t, y0, y1, z + h - t, z + h + t, wire); M.box(x1 - t, x1 + t, y0, y1, z + h - t, z + h + t, wire);
      [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(function (c) { M.box(c[0] - t, c[0] + t, c[1] - t, c[1] + t, z, z + h, wire); });
    }
  }
  // Under a sink, the pipes: the waste down from the basin, round its trap
  // and back into the wall; and the two supplies up to the tap.
  function o3Pipes(M, B, top, x, m) {
    var yt = B.y0 + (B.y1 - B.y0) * 0.42, r = 1.8 * cm, chrome = M.mat("chrome", "#c9ced3");
    var pts = [[x, yt, top], [x, yt, top - 14 * cm], [x, yt + 3.5 * cm, top - 19 * cm], [x, yt, top - 23 * cm], [x, yt - 3.5 * cm, top - 19 * cm],
               [x, yt - 5 * cm, top - 15 * cm], [x, B.y0, top - 15 * cm]];
    for (var i = 0; i + 1 < pts.length; i++) { M.tube(pts[i], pts[i + 1], r, m, 10); }
    [-8, 8].forEach(function (dx) {
      var vx = x + dx * cm, vz = top - 30 * cm;
      if (vx < B.x0 + 2 * cm || vx > B.x1 - 2 * cm) { return; }
      M.tube([vx, B.y0, vz], [vx, B.y0 + 4 * cm, vz], 1.1 * cm, chrome, 8);
      M.ball(vx, B.y0 + 4.5 * cm, vz, 1.6 * cm, 1 * cm, 1.6 * cm, M.mat("plastic", dx < 0 ? "#3f86d9" : "#d9534f"), { seg: 6 });
      M.tube([vx, B.y0 + 4 * cm, vz], [vx, B.y0 + 6 * cm, top], 0.5 * cm, chrome, 6);
    });
  }
  // Where the basins over a cabinet are (the model's own numbers).
  function o3Basins(M) {
    if (M.kind === "i_kitchensink") { return { at: [-M.W * 0.24, M.W * 0.24], drop: 13.5 * cm }; }
    if (M.kind === "i_vanity") { return { at: M.W > 80 * cm ? [-0.23 * M.W, 0.23 * M.W] : [0], drop: 0 }; }
    return { at: [], drop: 0 };
  }
  // What each kind keeps, behind a door (where === "door") or in a drawer.
  var O3_FILLS = {
    folded: function (M, B, rnd) {
      var w = Math.min(26 * cm, B.x1 - B.x0 - 2 * cm), d = Math.min(30 * cm, B.y1 - B.y0 - 2 * cm), th = 3.4 * cm;
      if (w < 4 * cm || d < 4 * cm) { return; }
      var most = Math.max(1, Math.min(3, Math.floor((B.z1 - B.z0) / th))), yc = (B.y0 + B.y1) / 2;
      for (var x = B.x0 + 1 * cm; x + w <= B.x1 - 0.4 * cm; x += w + 1.5 * cm) {
        var piles = 1 + Math.floor(rnd() * most);
        for (var k = 0; k < piles; k++) {
          M.box(x, x + w, yc - d / 2, yc + d / 2, B.z0 + k * th, B.z0 + (k + 1) * th - 0.3 * cm, M.mat("fabric", o3Of(rnd, O3_CLOTH)), 1.3 * cm);
        }
      }
    },
    night: function (M, B, rnd) {
      var z = B.z0, cy = (B.y0 + B.y1) / 2, w = B.x1 - B.x0;
      M.box(B.x0 + 2 * cm, B.x0 + Math.min(17 * cm, w * 0.45), cy - 10 * cm, cy + 10 * cm, z, z + 3 * cm, M.mat("fabric", o3Of(rnd, O3_LABEL)), 0.4 * cm);
      M.box(B.x0 + w * 0.55, B.x0 + w * 0.55 + 7 * cm, cy - 6 * cm, cy + 8 * cm, z, z + 0.9 * cm, M.mat("plastic", "#16181b"), 0.6 * cm);
      M.box(B.x1 - Math.min(16 * cm, w * 0.35), B.x1 - 2 * cm, cy + 3 * cm, cy + 9 * cm, z, z + 3.5 * cm, M.mat("leather", "#3a2f2a"), 1.4 * cm);
    },
    files: function (M, B, rnd) {
      var h = Math.min(25 * cm, B.z1 - B.z0 - 1.5 * cm), rail = M.mat("metal", "#8e959c");
      if (h < 4 * cm) { return O3_FILLS.office(M, B, rnd); }
      M.box(B.x0, B.x0 + 0.6 * cm, B.y0, B.y1, B.z0 + h, B.z0 + h + 0.8 * cm, rail);
      M.box(B.x1 - 0.6 * cm, B.x1, B.y0, B.y1, B.z0 + h, B.z0 + h + 0.8 * cm, rail);
      for (var y = B.y0 + 2 * cm; y < B.y1 - 1.5 * cm; y += 2.3 * cm) {
        var col = M.mat("plastic", o3Of(rnd, ["#d9c38f", "#7fa36b", "#6f8fbf", "#c96b5a", "#d9c38f", "#d9c38f"])), hh = h * (0.82 + rnd() * 0.14);
        M.box(B.x0 + 1 * cm, B.x1 - 1 * cm, y, y + 0.35 * cm, B.z0 + 1 * cm, B.z0 + hh, col);
        var tx = B.x0 + 3 * cm + rnd() * Math.max(0, B.x1 - B.x0 - 14 * cm);
        M.box(tx, tx + 8 * cm, y, y + 0.35 * cm, B.z0 + hh, B.z0 + hh + 2 * cm, col);
      }
    },
    clothes: function (M, B, rnd) {
      if (B.z1 - B.z0 < 90 * cm) { return O3_FILLS.folded(M, B, rnd); }
      var yc = (B.y0 + B.y1) / 2, top = B.z1, rod = top - 26 * cm, half = Math.min(21 * cm, (B.y1 - B.y0) / 2 - 1 * cm);
      var wood = M.mat("wood", "#d6bf98"), chrome = M.mat("chrome", "#dfe3e8");
      M.box(B.x0, B.x1, B.y0, B.y1, top - 16 * cm, top - 14.8 * cm, wood);           // a shelf over
      for (var s = B.x0 + 2 * cm; s < B.x1 - 14 * cm; s += 16 * cm) {
        M.box(s, s + 13 * cm, yc - 12 * cm, yc + 12 * cm, top - 14.8 * cm, top - 14.8 * cm + (5 + rnd() * 5) * cm, M.mat("fabric", o3Of(rnd, O3_CLOTH)), 1.5 * cm);
      }
      M.tube([B.x0, yc, rod], [B.x1, yc, rod], 1.2 * cm, chrome, 10);
      for (var x = B.x0 + 4 * cm; x < B.x1 - 3 * cm; x += (4.5 + rnd() * 3.5) * cm) {
        var long = Math.min(rod - B.z0 - 30 * cm, (60 + rnd() * 50) * cm);
        M.tube([x, yc, rod + 0.8 * cm], [x, yc, rod - 4 * cm], 0.3 * cm, chrome, 4);
        M.box(x - 1.2 * cm, x + 1.2 * cm, yc - half, yc + half, rod - 4 * cm - long, rod - 4 * cm, M.mat("fabric", o3Of(rnd, O3_CLOTH)), 1 * cm);
      }
      for (var sx = B.x0 + 2 * cm; sx < B.x1 - 12 * cm; sx += 13 * cm) {         // shoes, in pairs along the floor
        var lm = M.mat("leather", o3Of(rnd, ["#3a2a20", "#1d1d1f", "#7a4a2c", "#c9b8a0"]));
        [-2.6, 2.6].forEach(function (dx) {
          M.box(sx + 5 * cm + dx * cm - 2.3 * cm, sx + 5 * cm + dx * cm + 2.3 * cm, yc - 12 * cm, yc + 12 * cm, B.z0, B.z0 + 8 * cm, lm, 2 * cm);
        });
      }
    },
    pantry: function (M, B, rnd) {
      var step = 32 * cm, shelf = M.mat("plastic", "#f2f0ea"), tin = M.mat("metal", "#c9cdd1");
      for (var z = B.z0; z < B.z1 - 14 * cm; z += step) {
        if (z > B.z0) { o3Shelf(M, B, z, shelf); }
        var x = B.x0 + 2 * cm, room = Math.min(step - 4 * cm, B.z1 - z - 2 * cm), deep = B.y1 - B.y0;
        while (x < B.x1 - 8 * cm) {
          var pick = rnd(), y = B.y1 - Math.min(deep / 2, 10 * cm + rnd() * 4 * cm);
          if (pick < 0.45) { o3Can(M, x + 4 * cm, y, z, 3.8 * cm, Math.min(room, 11 * cm), M.mat("plastic", o3Of(rnd, O3_LABEL)), tin); x += 8.6 * cm; }
          else if (pick < 0.75) {
            var half = Math.min(9 * cm, deep / 2 - 1 * cm);
            M.box(x, x + 7 * cm, y - half, y + half, z, z + Math.min(room, (21 + rnd() * 8) * cm), M.mat("plastic", o3Of(rnd, O3_LABEL)), 0.3 * cm);
            x += 8.5 * cm;
          } else {
            o3Jar(M, x + 4 * cm, y, z, 3.6 * cm, Math.min(room, 13 * cm), M.mat("glass", "#e8d8b0"), M.mat("metal", o3Of(rnd, ["#c7372f", "#2f2f2f", "#c9a14a"])));
            x += 9 * cm;
          }
        }
      }
    },
    kitchen: function (M, B, rnd, where, info) {
      if (where === "drawer") { return info.top ? O3_FILLS.cutlery(M, B, rnd) : O3_FILLS.pans(M, B, rnd); }
      return O3_FILLS.dishes(M, B, rnd);
    },
    cutlery: function (M, B, rnd) {
      var tray = M.mat("wood", "#c9a97a"), steel = M.mat("chrome", "#d9dde2"), z = B.z0, cols = Math.max(2, Math.min(6, Math.round((B.x1 - B.x0) / (8 * cm))));
      var w = B.x1 - B.x0 - 2 * cm, x0 = B.x0 + 1 * cm, yA = B.y0 + 3 * cm, yB = Math.min(B.y1 - 1.5 * cm, yA + 34 * cm);
      if (w < 6 * cm || yB - yA < 10 * cm) { return; }
      M.box(x0, x0 + w, yA, yB, z, z + 0.6 * cm, tray);
      for (var c = 0; c <= cols; c++) { var xx = x0 + c * w / cols; M.box(xx - 0.3 * cm, xx + 0.3 * cm, yA, yB, z, z + 4 * cm, tray); }
      for (c = 0; c < cols; c++) {
        var cx = x0 + (c + 0.5) * w / cols;
        for (var k = 0; k < 3; k++) {
          var ox = cx + (k - 1) * 1.6 * cm, lz = z + 0.6 * cm + k * 0.35 * cm;
          M.box(ox - 0.4 * cm, ox + 0.4 * cm, yA + 3 * cm, yB - 7 * cm, lz, lz + 0.3 * cm, steel);
          M.box(ox - 0.9 * cm, ox + 0.9 * cm, yB - 7 * cm, yB - 2.5 * cm, lz, lz + 0.4 * cm, steel, 0.3 * cm);
        }
      }
    },
    pans: function (M, B, rnd) {
      var steel = M.mat("metal", "#9aa0a6"), x = B.x0 + 1 * cm, room = B.z1 - B.z0, cy = (B.y0 + B.y1) / 2;
      while (x < B.x1 - 10 * cm) {
        var r = Math.min((8 + rnd() * 5) * cm, (B.y1 - B.y0) / 2 - 2 * cm, (B.x1 - x) / 2 - 3 * cm), h = Math.min(room - 3 * cm, (7 + rnd() * 6) * cm);
        if (h < 2 * cm || r < 3 * cm) { break; }
        o3Pot(M, x + r + 2 * cm, cy, B.z0, r, h, rnd() < 0.5 ? steel : M.mat("metal", o3Of(rnd, ["#2a2b2d", "#c7372f", "#2f4f6f"])));
        x += 2 * r + 5 * cm;
      }
    },
    dishes: function (M, B, rnd) {
      var shelfZ = B.z0 + (B.z1 - B.z0) * 0.52, white = M.mat("ceramic", "#f4f2ec"), cy = (B.y0 + B.y1) / 2;
      o3Shelf(M, B, shelfZ, M.mat("plastic", "#ece9e2"));
      var x = B.x0 + 1.5 * cm, r = Math.min(12 * cm, (B.y1 - B.y0) / 2 - 2 * cm);
      while (r > 3 * cm && x < B.x1 - 2 * r) {
        if (rnd() < 0.6) {
          o3Plates(M, x + r, cy, shelfZ, r, 4 + Math.floor(rnd() * 5), rnd() < 0.7 ? white : M.mat("ceramic", o3Of(rnd, ["#9fb4c8", "#e8d6cc", "#c9d8c0"])));
          x += 2 * r + 1.5 * cm;
        } else {
          var rb = r * 0.72;
          o3Bowl(M, x + rb, cy, shelfZ, rb, white);
          o3Bowl(M, x + rb, cy, shelfZ + rb * 0.32, rb * 0.97, white);
          x += 2 * rb + 1.5 * cm;
        }
      }
      O3_FILLS.pans(M, { x0: B.x0, x1: B.x1, y0: B.y0, y1: B.y1, z0: B.z0, z1: shelfZ - 1.5 * cm }, rnd);
    },
    sink: function (M, B, rnd) { O3_FILLS.underSink(M, B, rnd, M.mat("chrome", "#c9ced3"), ["#3f86d9", "#f2c94c", "#5fa35a", "#e8e4dc"]); },
    bath: function (M, B, rnd) { O3_FILLS.underSink(M, B, rnd, M.mat("plastic", "#eceae4"), ["#e8d6cc", "#9fb4c8", "#f4f2ee", "#c9b8e0"]); },
    underSink: function (M, B, rnd, pipe, colors) {
      var basins = o3Basins(M), piped = [];
      basins.at.forEach(function (x) { if (x > B.x0 + 4 * cm && x < B.x1 - 4 * cm) { o3Pipes(M, B, B.z1 - basins.drop, x, pipe); piped.push(x); } });
      // what is kept under it, along the front, clear of the pipes
      var x = B.x0 + 4 * cm, y = B.y1 - 9 * cm;
      while (x < B.x1 - 5 * cm) {
        if (!piped.some(function (p) { return Math.abs(p - x) < 7 * cm; })) {
          if (rnd() < 0.7) { o3Bottle(M, x, y, B.z0, 3.4 * cm, (20 + rnd() * 9) * cm, M.mat("plastic", o3Of(rnd, colors)), M.mat("plastic", "#f4f4f2")); }
          else { M.cyl(x, y - 3 * cm, B.z0, B.z0 + 11 * cm, 5.5 * cm, M.mat("ceramic", "#f6f6f3"), { seg: 12 }); }   // a roll
        }
        x += 9 * cm;
      }
    },
    office: function (M, B, rnd) {
      var z = B.z0, cy = (B.y0 + B.y1) / 2, w = B.x1 - B.x0;
      M.box(B.x0 + 2 * cm, B.x0 + Math.min(23 * cm, w - 4 * cm), cy - 14 * cm, cy + 14 * cm, z, z + Math.min(5 * cm, B.z1 - z - 1 * cm), M.mat("plastic", "#f6f5f1"));
      for (var p = 0; p < 4; p++) {
        var px = B.x0 + w * 0.62 + p * 1.6 * cm;
        if (px > B.x1 - 2 * cm) { break; }
        M.tube([px, cy - 7 * cm, z + 0.6 * cm], [px, cy + 7 * cm, z + 0.6 * cm], 0.5 * cm, M.mat("plastic", o3Of(rnd, ["#2f4f8f", "#1d1d1f", "#c7372f"])), 6, true);
      }
      M.box(B.x1 - Math.min(14 * cm, w * 0.3), B.x1 - 2 * cm, cy + 8 * cm, cy + 12 * cm, z, z + 4 * cm, M.mat("metal", "#2b2d31"), 1 * cm);   // a stapler
    },
    makeup: function (M, B, rnd) {
      var x = B.x0 + 3 * cm, cy = (B.y0 + B.y1) / 2, room = B.z1 - B.z0 - 1 * cm;
      while (x < B.x1 - 3 * cm) {
        var pick = rnd();
        if (pick < 0.4) { o3Bottle(M, x, cy, B.z0, 1.8 * cm, Math.min(room, 9 * cm), M.mat("glass", o3Of(rnd, ["#e8b4b8", "#f2d7a8", "#d8c4e8"])), M.mat("metal", "#c9a14a")); }
        else if (pick < 0.7) { M.cyl(x, cy + 4 * cm, B.z0, B.z0 + 1.4 * cm, 3 * cm, M.mat("plastic", "#1d1d1f"), { seg: 12 }); }
        else { M.tube([x, cy - 5 * cm, B.z0 + 1 * cm], [x, cy + 5 * cm, B.z0 + 1 * cm], 0.9 * cm, M.mat("metal", o3Of(rnd, ["#c9a14a", "#2b2b2b"])), 8, true); }
        x += 6 * cm;
      }
    },
    media: function (M, B, rnd) {
      var mid = B.z0 + (B.z1 - B.z0) * 0.5, cy = (B.y0 + B.y1) / 2;
      o3Shelf(M, B, mid, M.mat("wood", "#3a3a3c"));
      var cw = Math.min(30 * cm, B.x1 - B.x0 - 4 * cm);
      M.box(B.x0 + 2 * cm, B.x0 + 2 * cm + cw, cy - 12 * cm, cy + 12 * cm, B.z0, B.z0 + Math.min(7 * cm, mid - B.z0 - 2 * cm), M.mat("plastic", "#1d1e20"), 1 * cm);
      M.box(B.x0 + 4 * cm, B.x0 + 7 * cm, cy + 12 * cm, cy + 12.2 * cm, B.z0 + 2 * cm, B.z0 + 2.6 * cm, M.mat("glow", "#4fc3f7"));
      for (var x = B.x0 + 2 * cm; x < B.x1 - 2 * cm; x += 1.5 * cm) {
        M.box(x, x + 1.3 * cm, cy - 7 * cm, cy + 7 * cm, mid, mid + Math.min(17 * cm, B.z1 - mid - 1 * cm), M.mat("plastic", o3Of(rnd, ["#2f4f8f", "#1d1d1f", "#3f8f4f", "#c7372f", "#e8e4dc"])));
      }
    },
    glasses: function (M, B, rnd) {
      var glass = M.mat("glass", "#dbeaf0"), white = M.mat("ceramic", "#f4f2ec"), cy = (B.y0 + B.y1) / 2, h = B.z1 - B.z0;
      var z1 = B.z0 + h / 3, z2 = B.z0 + h * 2 / 3, shelf = M.mat("plastic", "#ece9e2");
      o3Shelf(M, B, z1, shelf); o3Shelf(M, B, z2, shelf);
      for (var x = B.x0 + 4 * cm; x < B.x1 - 4 * cm; x += 8 * cm) {
        o3Glass(M, x, cy, z2, 3.2 * cm, Math.min(12 * cm, B.z1 - z2 - 1 * cm), glass);
        o3Mug(M, x, cy, z1, 3.8 * cm, Math.min(9.5 * cm, z2 - z1 - 2 * cm), M.mat("ceramic", o3Of(rnd, ["#f4f2ec", "#2f4f6f", "#c7372f", "#e8d6cc"])));
      }
      var r = Math.min(11 * cm, (B.y1 - B.y0) / 2 - 1.5 * cm, (B.x1 - B.x0) / 2 - 1 * cm);
      if (r > 3 * cm) { o3Plates(M, B.x0 + r + 1.5 * cm, cy, B.z0, r, 6, white); o3Bowl(M, B.x1 - r - 1.5 * cm, cy, B.z0, r * 0.8, white); }
    },
    china: function (M, B, rnd) {
      var mid = B.z0 + (B.z1 - B.z0) * 0.5, white = M.mat("ceramic", "#f6f4ee"), glass = M.mat("glass", "#dbeaf0"), cy = (B.y0 + B.y1) / 2;
      o3Shelf(M, B, mid, M.mat("wood", "#c9a97a"));
      var r = Math.min(13 * cm, (B.y1 - B.y0) / 2 - 1.5 * cm, (B.x1 - B.x0) / 2 - 1 * cm);
      if (r > 3 * cm) { o3Plates(M, B.x0 + r + 1.5 * cm, cy, mid, r, 8, white); }
      for (var x = B.x0 + 2 * r + 5 * cm; x < B.x1 - 3 * cm; x += 7 * cm) { o3Glass(M, x, cy, mid, 3 * cm, Math.min(15 * cm, B.z1 - mid - 1 * cm), glass, true); }
      o3Bowl(M, B.x0 + 12 * cm, cy, B.z0, Math.min(11 * cm, r), white);
      for (var b = 0; b < 3; b++) {
        var bx = B.x1 - 5 * cm - b * 8 * cm;
        if (bx < B.x0 + 26 * cm) { break; }
        o3Bottle(M, bx, cy, B.z0, 3.6 * cm, Math.min(30 * cm, mid - B.z0 - 2 * cm), M.mat("glass", o3Of(rnd, ["#2e4a2a", "#6e2a2a", "#c9b48a"])), M.mat("metal", "#7a2e2a"));
      }
    },
    linen: function (M, B, rnd) {
      var step = 34 * cm, shelf = M.mat("plastic", "#f2f0ea"), cy = (B.y0 + B.y1) / 2;
      for (var z = B.z0; z < B.z1 - 12 * cm; z += step) {
        if (z > B.z0) { o3Shelf(M, B, z, shelf); }
        var w = Math.min(28 * cm, B.x1 - B.x0 - 2 * cm), d = Math.min(30 * cm, B.y1 - B.y0 - 2 * cm);
        for (var x = B.x0 + 1 * cm; x + w <= B.x1 - 0.5 * cm; x += w + 1.5 * cm) {
          var layers = 2 + Math.floor(rnd() * 3), col = o3Of(rnd, O3_TOWEL);
          for (var k = 0; k < layers && (k + 1) * 5 * cm < step - 4 * cm; k++) {
            M.box(x, x + w, cy - d / 2, cy + d / 2, z + k * 5 * cm, z + (k + 1) * 5 * cm - 0.3 * cm, M.mat("linen", rnd() < 0.7 ? col : o3Of(rnd, O3_TOWEL)), 2 * cm);
          }
        }
      }
    },
    tools: function (M, B, rnd) {
      var z = B.z0, chrome = M.mat("chrome", "#d9dde2");
      M.box(B.x0, B.x1, B.y0, B.y1, z, z + 0.6 * cm, M.mat("rubber", "#2a2b2d"));
      var x = B.x0 + 3 * cm, yA = B.y0 + 3 * cm, yB = B.y1 - 3 * cm;
      while (x < B.x1 - 3 * cm && yB - yA > 8 * cm) {
        var long = Math.min(yB - yA, (14 + rnd() * 12) * cm);
        if (rnd() < 0.55) {                                    // a spanner
          M.box(x - 0.8 * cm, x + 0.8 * cm, yA, yA + long, z + 0.6 * cm, z + 1.1 * cm, chrome);
          M.box(x - 1.8 * cm, x + 1.8 * cm, yA + long - 3 * cm, yA + long, z + 0.6 * cm, z + 1.1 * cm, chrome, 0.4 * cm);
        } else {                                               // a screwdriver
          M.tube([x, yA, z + 1.6 * cm], [x, yA + long * 0.4, z + 1.6 * cm], 1.2 * cm, M.mat("plastic", o3Of(rnd, ["#c7372f", "#f2c94c", "#2f4f8f"])), 8, true);
          M.tube([x, yA + long * 0.4, z + 1.6 * cm], [x, yA + long, z + 1.6 * cm], 0.35 * cm, chrome, 6, true);
        }
        x += 4.5 * cm;
      }
    },
    bakeware: function (M, B, rnd) {
      var steel = M.mat("metal", "#8f959b"), w = B.x1 - B.x0 - 4 * cm, d = Math.min(B.y1 - B.y0 - 4 * cm, 36 * cm), cy = (B.y0 + B.y1) / 2;
      for (var k = 0; k < 3 && k * 2.2 * cm < B.z1 - B.z0 - 2.5 * cm; k++) {
        var z = B.z0 + k * 2.2 * cm;
        M.box(B.x0 + 2 * cm, B.x0 + 2 * cm + w, cy - d / 2, cy + d / 2, z, z + 0.4 * cm, steel);
        M.box(B.x0 + 2 * cm, B.x0 + 2 * cm + w, cy - d / 2, cy - d / 2 + 0.4 * cm, z, z + 1.8 * cm, steel);
        M.box(B.x0 + 2 * cm, B.x0 + 2 * cm + w, cy + d / 2 - 0.4 * cm, cy + d / 2, z, z + 1.8 * cm, steel);
      }
    },
    grilltools: function (M, B, rnd) {
      var r = Math.min(15 * cm, (B.x1 - B.x0) / 2 - 1 * cm, (B.y1 - B.y0) / 2 - 1 * cm), h = Math.min(45 * cm, B.z1 - B.z0 - 4 * cm);
      if (r < 4 * cm || h < 10 * cm) { return O3_FILLS.boxes(M, B, rnd, "door"); }
      var x = (B.x0 + B.x1) / 2, y = (B.y0 + B.y1) / 2, gas = M.mat("metal", "#e8e6e1");
      M.cyl(x, y, B.z0, B.z0 + h - r * 0.5, r, gas, { seg: 16 });                       // a gas bottle
      M.ball(x, y, B.z0 + h - r * 0.5, r, r, r * 0.5, gas, { seg: 8, lat0: 0 });
      M.cyl(x, y, B.z0 + h - 2 * cm, B.z0 + h + 3 * cm, 2 * cm, M.mat("metal", "#c9a14a"), { seg: 8 });
    },
    fishfood: function (M, B, rnd) {
      var x = B.x0 + 5 * cm, cy = (B.y0 + B.y1) / 2;
      for (var k = 0; k < 3 && x < B.x1 - 4 * cm; k++, x += 9 * cm) {
        M.cyl(x, cy, B.z0, B.z0 + Math.min(12 * cm, B.z1 - B.z0 - 2 * cm), 3.5 * cm, M.mat("plastic", o3Of(rnd, ["#e0a82e", "#c7372f", "#2f8f8f"])), { seg: 10 });
      }
    },
    boxes: function (M, B, rnd, where) {
      var h = B.z1 - B.z0, cy = (B.y0 + B.y1) / 2, d = Math.min(30 * cm, B.y1 - B.y0 - 3 * cm), z0 = B.z0;
      if (where === "door" && h > 45 * cm) { z0 = B.z0 + h * 0.5; o3Shelf(M, B, z0, M.mat("plastic", "#ece9e2")); }
      for (var x = B.x0 + 2 * cm; x < B.x1 - 14 * cm && d > 4 * cm; x += 17 * cm) {
        M.box(x, x + 14 * cm, cy - d / 2, cy + d / 2, z0, z0 + Math.min(h * 0.4, (8 + rnd() * 10) * cm), M.mat("plastic", o3Of(rnd, ["#d9c7a6", "#c9b48a", "#9fb4c8", "#e8e4dc"])), 0.6 * cm);
      }
    }
  };
  var O3_FILL = { i_dresser: "folded", i_nightstand: "night", i_filing: "files", i_wardrobe: "clothes", i_pantry: "pantry",
                  i_counter: "kitchen", i_island: "kitchen", i_kitchensink: "sink", i_vanity: "bath", i_desk: "office",
                  i_vanitytable: "makeup", i_tvstand: "media", i_cabinet: "glasses", i_sideboard: "china", i_hutch: "china",
                  i_linencab: "linen", i_toolchest: "tools", i_workbench: "tools", i_oven: "bakeware", i_stove: "bakeware",
                  i_grill: "grilltools", i_aquarium: "fishfood" };
  function o3Fill(M, where, B, rnd, info) {
    var f = O3_FILLS[O3_FILL[M.kind]] || O3_FILLS.boxes;
    if (B.x1 - B.x0 < 3 * cm || B.y1 - B.y0 < 3 * cm || B.z1 - B.z0 < 2 * cm) { return; }
    try { f(M, B, rnd, where, info || {}); } catch (e) { /* empty, then */ }
  }

  // ---- drawers and doors across a front, opening -------------------------------------------------
  // In place of 38-models.js's (and the handles a design gives it, 40-designs.js):
  // each drawer runs out on its runners, a box behind its front with what is
  // kept in it; each door swings on the hinges at the edge away from its
  // handle, and behind it the cabinet is hollow, its shelves and what is on them.
  if (typeof mFronts === "function") {
    mFronts = function (M, x0, x1, y, z0, z1, rows, cols, m, handle, how) {
      how = how || {};
      var isDoor = !!how.doors, look = how.knobs ? "knob" : isDoor ? "long" : "bar";
      var D = typeof DESIGN_NOW !== "undefined" ? DESIGN_NOW : null;
      if (D && D.F && handle) {
        handle = D.F.hardware === "brass" ? M.mat("brass", D.metalC) : M.mat(D.F.hardware === "chrome" ? "chrome" : "metal", D.metalC);
        if (D.F.handle === "none") { handle = null; }
        else if (D.F.handle === "knob") { look = "knob"; }
        else if (D.F.handle === "long") { look = "long"; }
      }
      var gap = 0.35 * cm, w = (x1 - x0) / cols, h = (z1 - z0) / rows, out = how.out || 0.9 * cm;
      var behind = o3Behind(M, x0, x1, y, z0, z1), deep = behind ? Math.max(8 * cm, y - behind.y0 - 1.5 * cm) : 40 * cm;
      var run = Math.min(deep * 0.8, 45 * cm), parts = String(m).split("|");
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var a = x0 + c * w + gap, b = x0 + (c + 1) * w - gap, lo = z0 + r * h + gap, hi = z0 + (r + 1) * h - gap;
          var right = cols === 1 ? !!how.hingeRight : c % 2 === 1;          // the hinges' side, away from the handle
          var k = M.front(isDoor ? "door" : "drawer", a, b, y - 0.2 * cm, y + out + (handle ? 2.2 * cm : 0), lo, hi, { slide: isDoor ? 0 : run });
          var rnd = mRand(Math.round(a * 31 + lo * 17 + (M.W || 0) * 7 + r * 5 + c));
          if (k > 0.001 && behind) { M.hole(a, b, lo, hi, y, isDoor ? deep : Math.min(deep, run + 6 * cm), how.inner); }
          if (isDoor) {
            var px = right ? b : a;
            o3Swing(M, px, y, (right ? -1 : 1) * k * (how.swing || 100), function () { o3Panel(M, a, b, y, lo, hi, out, m, handle, look, how, right); });
            if (k > 0.001 && behind) {
              o3Fill(M, "door", { x0: a + 0.4 * cm, x1: b - 0.4 * cm, y0: y - deep + 0.6 * cm, y1: y - 1 * cm, z0: lo, z1: hi }, rnd,
                     { row: r, rows: rows, top: r === rows - 1 });
            }
          } else {
            M.push().move(0, k * run, 0);
            o3Panel(M, a, b, y, lo, hi, out, m, handle, look, how, cols > 1 && c % 2 === 1);
            if (k > 0.001) {
              var B = o3DrawerBox(M, a, b, y, lo, hi, Math.min(deep, run + 5 * cm), parts[0]);
              o3Fill(M, "drawer", B, rnd, { row: r, rows: rows, top: r === rows - 1 });
            }
            M.pop();
          }
        }
      }
    };
  }
  // One front, its handle where it always was.
  function o3Panel(M, a, b, y, lo, hi, out, m, handle, look, how, fromLeft) {
    M.box(a, b, y - 0.2 * cm, y + out, lo, hi, m, 0.25 * cm);
    if (!handle) { return; }
    var hx = (a + b) / 2, hz = (lo + hi) / 2;
    if (look === "long") {                // upright, by the edge it opens from
      hx = fromLeft ? a + 4 * cm : b - 4 * cm;
      var len = Math.min(18 * cm, (hi - lo) * 0.3);
      hz = how.low ? lo + len / 2 + 6 * cm : how.high ? hi - len / 2 - 6 * cm : hz;
      M.box(hx - 0.6 * cm, hx + 0.6 * cm, y + out, y + out + 2.2 * cm, hz - len / 2, hz + len / 2, handle, 0.5 * cm);
    } else if (look === "knob") {
      M.ball(hx, y + out + 1.2 * cm, hz, 1.4 * cm, 1.4 * cm, 1.4 * cm, handle, { seg: 5 });
    } else {                              // a bar across
      var bar = Math.min(16 * cm, (b - a) * 0.4);
      M.box(hx - bar / 2, hx + bar / 2, y + out, y + out + 2 * cm, hz - 0.6 * cm, hz + 0.6 * cm, handle, 0.5 * cm);
    }
  }
  // A drawer's box behind its front; handed back, the room inside it.
  function o3DrawerBox(M, a, b, y, lo, hi, deep, kind) {
    var metal = kind === "metal" || kind === "chrome", side = metal ? M.mat("metal", "#9aa0a6") : M.mat("wood", "#d8c19a");
    var t = 1.1 * cm, x0 = a + 1.2 * cm, x1 = b - 1.2 * cm, yb = y - deep + 1 * cm, yf = y - 0.2 * cm, z0 = lo + 1.5 * cm;
    var z1 = Math.max(z0 + 3 * cm, hi - 2.5 * cm);
    M.box(x0, x1, yb, yf, z0, z0 + t, side);
    M.box(x0, x0 + t, yb, yf, z0, z1, side);
    M.box(x1 - t, x1, yb, yf, z0, z1, side);
    M.box(x0, x1, yb, yb + t, z0, z1, side);
    return { x0: x0 + t, x1: x1 - t, y0: yb + t, y1: yf - 0.3 * cm, z0: z0 + t, z1: z1 };
  }

  // ==================================================== the models that open their own way ==
  // ---- a fridge: two doors over, the freezer drawer under; lit inside --------------------------
  function o3FridgeHandle(M, x, y1, split, H, bar) {
    M.tube([x, y1 + 5 * cm, split + 16 * cm], [x, y1 + 5 * cm, H - 30 * cm], 1 * cm, bar, 8);
    [split + 16 * cm, H - 30 * cm].forEach(function (z) { M.tube([x, y1 + 2.4 * cm, z], [x, y1 + 5 * cm, z], 0.8 * cm, bar, 6); });
  }
  // Inside: the light, glass shelves set back from the door's bins, the crispers, the food.
  function o3FridgeIn(M, x0, x1, yb, yf, z0, z1, rnd) {
    var glass = M.mat("glass", "#d8ecf2"), trim = M.mat("chrome", "#dfe3e8"), sy = yf - 13 * cm, cx = (x0 + x1) / 2;
    M.box(cx - 9 * cm, cx + 9 * cm, yb + 0.6 * cm, yb + 4 * cm, z1 - 1.6 * cm, z1 - 0.6 * cm, M.mat("glow", "#fff7e2"));
    var crisp = Math.min(22 * cm, (z1 - z0) * 0.24), shelves = [z0 + crisp + 1.5 * cm];
    for (var s = 1; s < 3; s++) { shelves.push(z0 + crisp + 1.5 * cm + (z1 - z0 - crisp) * s / 3); }
    shelves.forEach(function (z) { M.box(x0, x1, yb, sy, z - 0.6 * cm, z, glass); M.box(x0, x1, sy - 0.8 * cm, sy, z - 1.4 * cm, z, trim); });
    // the crispers: two clear drawers of fruit and greens
    [[x0 + 0.5 * cm, cx - 0.5 * cm], [cx + 0.5 * cm, x1 - 0.5 * cm]].forEach(function (d) {
      M.box(d[0], d[1], yb + 1 * cm, sy, z0, z0 + 0.5 * cm, glass);
      M.box(d[0], d[1], sy - 0.5 * cm, sy, z0, z0 + crisp - 2 * cm, glass);
      for (var i = 0; i < 5; i++) {
        var r = (2.6 + rnd() * 1.4) * cm;
        M.ball(d[0] + r + rnd() * Math.max(0, d[1] - d[0] - 2 * r), yb + r + 2 * cm + rnd() * Math.max(0, sy - yb - 2 * r - 4 * cm), z0 + 0.5 * cm + r * 0.9,
               r, r, r * 0.9, M.mat("plastic", o3Of(rnd, ["#c4382e", "#5fa35a", "#e8902a", "#d9c43a", "#7da23a"])), { seg: 6 });
      }
    });
    // on the shelves
    shelves.forEach(function (z, si) {
      var room = (si + 1 < shelves.length ? shelves[si + 1] : z1) - z - 2 * cm, x = x0 + 2 * cm;
      while (x < x1 - 6 * cm && room > 4 * cm) {
        var pick = rnd(), y = yb + 5 * cm + rnd() * Math.max(0, sy - yb - 12 * cm);
        if (pick < 0.22) {                 // a carton of milk
          M.box(x, x + 7 * cm, y - 3.5 * cm, y + 3.5 * cm, z, z + Math.min(room, 19 * cm), M.mat("plastic", "#f6f6f3"), 0.3 * cm);
          M.cyl(x + 3.5 * cm, y, z + Math.min(room, 19 * cm), z + Math.min(room, 19 * cm) + 1.2 * cm, 1.2 * cm, M.mat("plastic", "#2f6f9f"), { seg: 8 });
          x += 9 * cm;
        } else if (pick < 0.45) {          // a bottle
          o3Bottle(M, x + 3.5 * cm, y, z, 3.4 * cm, Math.min(room, (20 + rnd() * 8) * cm), M.mat("glass", o3Of(rnd, ["#f0a94a", "#c9e2b0", "#e8d8b0", "#8c3b2f"])), M.mat("plastic", "#f4f4f2"));
          x += 8 * cm;
        } else if (pick < 0.65) {          // a jar
          o3Jar(M, x + 4 * cm, y, z, 3.8 * cm, Math.min(room, 11 * cm), M.mat("glass", o3Of(rnd, ["#e8b0a0", "#f2d7a8", "#c9e2b0"])), M.mat("metal", o3Of(rnd, ["#c7372f", "#2f2f2f", "#e0a82e"])));
          x += 9 * cm;
        } else if (pick < 0.85) {          // a tub with its lid
          var tw = (9 + rnd() * 6) * cm;
          M.box(x, x + tw, y - 5 * cm, y + 5 * cm, z, z + Math.min(room, 7 * cm), M.mat("plastic", "#f2f4f5"), 0.8 * cm);
          M.box(x - 0.3 * cm, x + tw + 0.3 * cm, y - 5.3 * cm, y + 5.3 * cm, z + Math.min(room, 7 * cm), z + Math.min(room, 7 * cm) + 1 * cm,
                M.mat("plastic", o3Of(rnd, ["#3f8f4f", "#2f6f9f", "#c7372f", "#e0a82e"])), 0.5 * cm);
          x += tw + 2 * cm;
        } else {                           // a bowl of fruit
          o3Bowl(M, x + 6 * cm, y, z, 6 * cm, M.mat("ceramic", "#f4f2ec"));
          M.ball(x + 5 * cm, y, z + 4 * cm, 2.8 * cm, 2.8 * cm, 2.6 * cm, M.mat("plastic", o3Of(rnd, ["#c4382e", "#e8902a", "#d9c43a"])), { seg: 6 });
          x += 13 * cm;
        }
      }
    });
  }
  // A door's inside: its liner, and its bins of bottles and jars.
  function o3DoorBins(M, x0, x1, yd, z0, z1, rnd) {
    var liner = M.mat("plastic", "#eef1f2"), clear = M.mat("glass", "#dcecf2");
    M.box(x0 - 1 * cm, x1 + 1 * cm, yd - 1.5 * cm, yd, z0 - 2 * cm, z1 + 3 * cm, liner);
    [0.06, 0.38, 0.7].forEach(function (k) {
      var z = z0 + (z1 - z0) * k;
      M.box(x0, x1, yd - 11 * cm, yd - 1.5 * cm, z, z + 0.6 * cm, liner);
      M.box(x0, x1, yd - 11 * cm, yd - 10.2 * cm, z, z + 7 * cm, clear);
      for (var x = x0 + 3.5 * cm; x < x1 - 3 * cm; x += 7.5 * cm) {
        var tall = (12 + rnd() * 14) * cm;
        if (rnd() < 0.7) { o3Bottle(M, x, yd - 6 * cm, z + 0.6 * cm, 3 * cm, tall, M.mat("plastic", o3Of(rnd, ["#c4382e", "#e8c547", "#f2f2ef", "#5fa35a", "#8c3b2f"])), M.mat("plastic", "#2a2b2d")); }
        else { o3Jar(M, x, yd - 6 * cm, z + 0.6 * cm, 3.2 * cm, 9 * cm, M.mat("glass", "#e8d8b0"), M.mat("metal", "#c7372f")); }
      }
    });
  }
  // The freezer drawer's basket and what is frozen in it.
  function o3FrozenIn(M, x0, x1, y0, y1, z0, z1, rnd) {
    var wire = M.mat("chrome", "#c9ced3"), t = 0.4 * cm;
    M.box(x0, x1, y0, y1, z0, z0 + t, wire);
    M.box(x0, x0 + t, y0, y1, z0, z1, wire); M.box(x1 - t, x1, y0, y1, z0, z1, wire);
    M.box(x0, x1, y0, y0 + t, z0, z1, wire); M.box(x0, x1, y1 - t, y1, z0, z1, wire);
    o3Frozen(M, x0 + 1 * cm, x1 - 1 * cm, y0 + 1 * cm, y1 - 1 * cm, z0 + t, z1 - 2 * cm, rnd);
  }
  function o3Frozen(M, x0, x1, y0, y1, z0, z1, rnd) {
    var x = x0;
    while (x < x1 - 8 * cm) {
      var pick = rnd(), w = (10 + rnd() * 8) * cm, h = Math.min(z1 - z0, (5 + rnd() * 12) * cm), y = y0 + rnd() * Math.max(0, y1 - y0 - 20 * cm);
      if (pick < 0.3) { M.cyl(x + 6 * cm, y + 7 * cm, z0, z0 + Math.min(h, 12 * cm), 6 * cm, M.mat("plastic", o3Of(rnd, ["#f2e2b8", "#e8b4b8", "#8c5a3c"])), { seg: 12 }); w = 13 * cm; }
      else if (pick < 0.65) { M.box(x, x + w, y, y + Math.min(20 * cm, y1 - y), z0, z0 + h, M.mat("plastic", o3Of(rnd, O3_LABEL)), 0.3 * cm); }
      else { M.box(x, x + w, y, y + Math.min(24 * cm, y1 - y), z0, z0 + Math.min(h, 7 * cm), M.mat("plastic", o3Of(rnd, ["#dfe9ef", "#c9d8a8", "#f2c94c"])), 2.5 * cm); }
      x += w + 1.5 * cm;
    }
  }
  if (typeof mDef === "function") {
    mDef("i_fridge", function (M, W, D, H, C) {
      C = mPick(C, "#c9cdd1", "#dfe3e8");
      var steel = M.mat("metal", C.main), bar = M.mat("chrome", C.frame), y0 = -D / 2, y1 = D / 2 - 3 * cm, split = H * 0.36;
      var rnd = mRand(Math.round(W * 13 + H * 7)), liner = ["plastic", "#f3f5f6"], wall = 4 * cm, deep = y1 - y0 - 5 * cm, run = deep * 0.62;
      M.box(-W / 2, W / 2, y0, y1, 0, H, steel, 1.2 * cm);
      var kL = M.front("door", -W / 2 + 0.3 * cm, -0.25 * cm, y1 - 0.3 * cm, y1 + 5.8 * cm, split + 0.6 * cm, H - 0.8 * cm);
      var kR = M.front("door", 0.25 * cm, W / 2 - 0.3 * cm, y1 - 0.3 * cm, y1 + 5.8 * cm, split + 0.6 * cm, H - 0.8 * cm);
      var kF = M.front("drawer", -W / 2 + 0.3 * cm, W / 2 - 0.3 * cm, y1 - 0.3 * cm, y1 + 5.8 * cm, 3 * cm, split - 0.6 * cm, { slide: run });
      var ix0 = -W / 2 + wall, ix1 = W / 2 - wall;
      if (kL > 0.001 || kR > 0.001) {
        M.hole(ix0, ix1, split + 3 * cm, H - wall, y1, deep, liner);
        o3FridgeIn(M, ix0, ix1, y1 - deep, y1, split + 3 * cm, H - wall, rnd);
      }
      if (kF > 0.001) { M.hole(ix0, ix1, wall, split - 2.5 * cm, y1, deep, liner); }
      o3Swing(M, -W / 2 + 0.3 * cm, y1, kL * 112, function () {
        M.box(-W / 2 + 0.3 * cm, -0.25 * cm, y1 - 0.3 * cm, y1 + 2.5 * cm, split + 0.6 * cm, H - 0.8 * cm, steel, 0.8 * cm);
        o3FridgeHandle(M, -1.6 * cm, y1, split, H, bar);
        if (kL > 0.001) { o3DoorBins(M, -W / 2 + 3 * cm, -2.5 * cm, y1 - 0.3 * cm, split + 5 * cm, H - 8 * cm, rnd); }
      });
      o3Swing(M, W / 2 - 0.3 * cm, y1, -kR * 112, function () {
        M.box(0.25 * cm, W / 2 - 0.3 * cm, y1 - 0.3 * cm, y1 + 2.5 * cm, split + 0.6 * cm, H - 0.8 * cm, steel, 0.8 * cm);
        o3FridgeHandle(M, 1.6 * cm, y1, split, H, bar);
        M.box(W * 0.12, W * 0.32, y1 + 2.4 * cm, y1 + 2.7 * cm, H * 0.66, H * 0.78, M.mat("screen", "#16181b"));   // ice and water
        if (kR > 0.001) { o3DoorBins(M, 2.5 * cm, W / 2 - 3 * cm, y1 - 0.3 * cm, split + 5 * cm, H - 8 * cm, rnd); }
      });
      M.push().move(0, kF * run, 0);                       // the freezer drawer, run out
      M.box(-W / 2 + 0.3 * cm, W / 2 - 0.3 * cm, y1 - 0.3 * cm, y1 + 2.5 * cm, 3 * cm, split - 0.6 * cm, steel, 0.8 * cm);
      M.tube([-W * 0.3, y1 + 5 * cm, split - 8 * cm], [W * 0.3, y1 + 5 * cm, split - 8 * cm], 1 * cm, bar, 8);
      [-W * 0.28, W * 0.28].forEach(function (x) { M.tube([x, y1 + 2.4 * cm, split - 8 * cm], [x, y1 + 5 * cm, split - 8 * cm], 0.8 * cm, bar, 6); });
      if (kF > 0.001) { o3FrozenIn(M, ix0 + 1 * cm, ix1 - 1 * cm, y1 - deep + 2 * cm, y1 - 0.6 * cm, wall + 1 * cm, split - 4 * cm, rnd); }
      M.pop();
    });

    // ---- a chest freezer: its lid lifts at the back ------------------------------------------
    mDef("i_freezer", function (M, W, D, H, C) {
      C = mPick(C, "#f4f4f2", "#c9cdd1");
      var body = M.mat("plastic", C.main), zl = H - 4 * cm, wall = 5 * cm, rnd = mRand(Math.round(W * 5 + D * 3));
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, zl, body, 2 * cm);
      var k = M.front("lid", -W / 2, W / 2, -D / 2, D / 2 + 3 * cm, zl, H);
      if (k > 0.001) {
        M.holeTop(-W / 2 + wall, W / 2 - wall, -D / 2 + wall, D / 2 - wall, zl, zl - 9 * cm, ["plastic", "#f1f4f5"]);
        o3Frozen(M, -W / 2 + wall + 1 * cm, W / 2 - wall - 1 * cm, -D / 2 + wall + 1 * cm, D / 2 - wall - 1 * cm, 9 * cm, zl - 14 * cm, rnd);
      }
      o3Lift(M, -D / 2, H, k * 84, function () {      // (on its top back edge: open against a wall, it does not go into it)
        M.box(-W / 2, W / 2, -D / 2, D / 2 + 1 * cm, zl, H, body, 1.5 * cm);
        M.box(-W * 0.2, W * 0.2, D / 2 + 1 * cm, D / 2 + 3 * cm, H - 6 * cm, H - 3 * cm, M.mat("chrome", C.frame), 0.8 * cm);
        if (k > 0.001) { M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, -D / 2 + 3 * cm, D / 2 - 2 * cm, zl - 0.6 * cm, zl, M.mat("plastic", "#e9edf0")); }
      }, k * (H - zl));
    });

    // ---- a dishwasher: its door let down, the racks of plates and cups --------------------------
    mDef("i_dishwasher", function (M, W, D, H, C) {
      C = mPick(C, "#c9cdd1");
      var steel = M.mat("metal", C.main), y1 = D / 2 - 2 * cm, rnd = mRand(Math.round(W * 9 + H));
      M.box(-W / 2, W / 2, -D / 2, y1, 0, H, steel, 0.4 * cm);
      M.box(-W / 2, W / 2, y1 - 6 * cm, y1, 0, 9 * cm, M.mat("plastic", "#2a2b2d"));
      var k = M.front("flap", -W / 2 + 0.4 * cm, W / 2 - 0.4 * cm, y1, y1 + 5 * cm, 9 * cm, H - 1 * cm);
      var ix0 = -W / 2 + 3 * cm, ix1 = W / 2 - 3 * cm, iz0 = 10 * cm, iz1 = H - 4 * cm, deep = D - 9 * cm;
      if (k > 0.001) {
        M.hole(ix0, ix1, iz0, iz1, y1, deep, ["metal", "#aeb4ba"]);
        var white = M.mat("ceramic", "#f6f4ee"), glass = M.mat("glass", "#dbeaf0"), yb = y1 - deep + 2 * cm, pull = Math.max(0, (k - 0.55) / 0.45) * deep * 0.5;
        M.box(-W * 0.3, W * 0.3, (yb + y1) / 2 - 1.2 * cm, (yb + y1) / 2 + 1.2 * cm, iz0 + 1 * cm, iz0 + 2 * cm, M.mat("plastic", "#d8dcdf"));   // the spray arm
        M.push().move(0, pull, 0);                         // the lower rack, pulled out once the door is down
        var rz = iz0 + 3.5 * cm, pr = Math.min(11 * cm, (iz1 - iz0) * 0.25);
        o3Rack(M, ix0 + 1 * cm, ix1 - 1 * cm, yb, y1 - 1.5 * cm, rz, 9 * cm);
        [ix0 + (ix1 - ix0) * 0.27, ix0 + (ix1 - ix0) * 0.73].forEach(function (px) {
          for (var py = yb + 4 * cm; py < y1 - 5 * cm; py += 3.2 * cm) {
            M.push().move(px, py, rz + pr + 0.8 * cm).tiltX(90);
            M.cyl(0, 0, -0.45 * cm, 0.45 * cm, pr, white, { seg: 16 });
            M.pop();
          }
        });
        M.pop();
        var uz = iz0 + (iz1 - iz0) * 0.56;                 // the upper rack: cups and glasses, upside down
        o3Rack(M, ix0 + 1 * cm, ix1 - 1 * cm, yb, y1 - 1.5 * cm, uz, 6 * cm);
        for (var gx = ix0 + 5 * cm; gx < ix1 - 4 * cm; gx += 8.5 * cm) {
          for (var gy = yb + 5 * cm; gy < y1 - 5 * cm; gy += 10 * cm) {
            if (rnd() < 0.5) { o3Glass(M, gx, gy, uz + 0.7 * cm, 3.2 * cm, Math.min(12 * cm, iz1 - uz - 2 * cm), glass, true); }
            else { M.cyl(gx, gy, uz + 0.7 * cm, uz + 0.7 * cm + 9 * cm, 3.8 * cm, M.mat("ceramic", o3Of(rnd, ["#f4f2ec", "#2f4f6f", "#e8d6cc"])), { seg: 12 }); }
          }
        }
      }
      o3Flap(M, y1, 9 * cm, k * 86, function () {
        M.box(-W / 2 + 0.4 * cm, W / 2 - 0.4 * cm, y1, y1 + 1.5 * cm, 9 * cm, H - 1 * cm, steel, 0.5 * cm);
        M.box(-W / 2 + 0.4 * cm, W / 2 - 0.4 * cm, y1 + 1.5 * cm, y1 + 1.7 * cm, H - 8 * cm, H - 2 * cm, M.mat("screen", "#16181b"));
        M.tube([-W * 0.36, y1 + 4 * cm, H - 12 * cm], [W * 0.36, y1 + 4 * cm, H - 12 * cm], 0.9 * cm, M.mat("chrome", "#dfe3e8"), 8);
        if (k > 0.001) {                                   // its inside, and the soap's little door
          M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1 - 0.4 * cm, y1, 11 * cm, H - 4 * cm, M.mat("metal", "#b9bfc5"));
          M.box(-4 * cm, 4 * cm, y1 - 1.2 * cm, y1 - 0.4 * cm, H * 0.45, H * 0.56, M.mat("plastic", "#2a2b2d"), 0.3 * cm);
        }
      });
    });

    // ---- a microwave: its door on the left, lit inside, the plate going round --------------------
    mDef("i_microwave", function (M, W, D, H, C) {
      C = mPick(C, "#2a2c30", "#c9cdd1");
      var body = M.mat("metal", C.frame), y1 = D / 2 - 1 * cm, px = -W / 2 + 1 * cm, dx1 = W * 0.22, rnd = mRand(Math.round(W * 3 + D));
      M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 1 * cm);
      var k = M.front("door", px, dx1, y1 - 0.2 * cm, y1 + 2.4 * cm, 1 * cm, H - 1 * cm);
      if (k > 0.001) {
        var ix0 = -W / 2 + 2.5 * cm, ix1 = W * 0.2, deep = D - 6 * cm, cx = (ix0 + ix1) / 2, cy = y1 - deep / 2;
        M.hole(ix0, ix1, 2.5 * cm, H - 2.5 * cm, y1, deep, ["plastic", "#ece9e2"]);
        M.box(ix1 - 6 * cm, ix1 - 1 * cm, y1 - deep + 0.8 * cm, y1 - deep + 4 * cm, H - 3.2 * cm, H - 2.6 * cm, M.mat("glow", "#fff4cf"));
        M.cyl(cx, cy, 2.5 * cm, 3.1 * cm, Math.min(deep, ix1 - ix0) * 0.42, M.mat("glass", "#dfeef2"), { seg: 20 });
        o3Mug(M, cx, cy, 3.1 * cm, 4 * cm, Math.min(9 * cm, H - 8 * cm), M.mat("ceramic", o3Of(rnd, ["#f4f2ec", "#c7372f", "#2f4f6f"])));
      }
      o3Swing(M, px, y1, k * 100, function () {
        M.box(px, dx1, y1 - 0.2 * cm, y1 + 0.8 * cm, 1 * cm, H - 1 * cm, M.mat("plastic", C.main), 0.5 * cm);
        M.box(-W / 2 + 3 * cm, W * 0.16, y1 + 0.7 * cm, y1 + 0.9 * cm, 3 * cm, H - 3 * cm, M.mat("screen", "#0d0f12"));
        M.box(dx1 - 2.6 * cm, dx1 - 1.4 * cm, y1 + 0.8 * cm, y1 + 2.4 * cm, H * 0.22, H * 0.78, M.mat("plastic", C.main), 0.4 * cm);
      });
      M.box(W * 0.25, W / 2 - 1 * cm, y1 - 0.2 * cm, y1 + 0.5 * cm, 1 * cm, H - 1 * cm, M.mat("plastic", "#1d1f22"));
      M.box(W * 0.28, W / 2 - 3 * cm, y1 + 0.5 * cm, y1 + 0.6 * cm, H - 7 * cm, H - 4 * cm, M.mat("glow", "#7fd7a8"));
    });
  }

  // ---- a washer or a dryer: its round door swung on the left, the drum and the wash in it -------
  if (typeof mLaundry === "function") {
    mLaundry = function (M, W, D, H, C, glassDoor) {
      C = mPick(C, "#f4f4f2", "#c9ced3");
      var body = M.mat("plastic", C.main), y1 = D / 2 - 1 * cm, R = Math.min(W, H) * 0.3, cz = H * 0.44, rnd = mRand(Math.round(W * 5 + H * 3));
      M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 1.5 * cm);
      M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, y1 - 0.2 * cm, y1 + 0.5 * cm, H - 14 * cm, H - 2 * cm, M.mat("plastic", mShade(C.main, -0.06)), 0.4 * cm);
      var hx = -(R + 2.5 * cm);
      var k = M.front("door", hx, R + 2.5 * cm, y1, y1 + 4 * cm, cz - R - 2.5 * cm, cz + R + 2.5 * cm);
      var kd = M.front("drawer", -W / 2 + 3 * cm, -W * 0.18, y1 + 0.4 * cm, y1 + 1.2 * cm, H - 11 * cm, H - 5 * cm, { slide: 14 * cm });
      if (k > 0.001) {
        var deep = Math.min(D - 10 * cm, 2 * R);
        M.hole(-R, R, cz - R, cz + R, y1, deep + 8 * cm);
        o3Ring(M, 0, y1 + 0.05 * cm, cz, R * 0.92, R, body);
        M.push().move(0, y1, cz).tiltX(-90);
        M.lathe(0, 0, [[R * 0.92, 0.1 * cm], [R * 0.87, -2 * cm], [R * 0.84, -4 * cm]], M.mat("rubber", "#3a3d40"), { seg: 24 });
        M.pop();
        o3Drum(M, 0, y1 - 4 * cm, cz, R * 0.84, deep, M.mat("metal", "#b9bfc5"));
        for (var i = 0; i < 6; i++) {                       // the wash, in a heap in the bottom of the drum
          var a = (i / 6 - 0.5) * 1.4, rr = R * (0.24 + rnd() * 0.1);
          M.ball(Math.sin(a) * R * 0.45, y1 - 4 * cm - deep * (0.25 + rnd() * 0.5), cz - R * 0.84 + rr * 0.8 + Math.abs(Math.sin(a)) * R * 0.15,
                 rr, rr * 1.2, rr * 0.7, M.mat("fabric", o3Of(rnd, O3_CLOTH)), { seg: 6 });
        }
      }
      o3Swing(M, hx, y1, k * 100, function () {
        M.push().move(0, y1, cz).tiltX(-90);
        M.lathe(0, 0, [[R + 2.5 * cm, 0], [R + 2.5 * cm, 2 * cm], [R + 1 * cm, 3.5 * cm], [R, 3.5 * cm]], M.mat("chrome", C.frame), { seg: 28 });
        M.lathe(0, 0, [[R, 3.5 * cm], [R * 0.6, 2.2 * cm], [0, 1.8 * cm]], glassDoor ? M.mat("screen", "#1c2a33") : body, { seg: 28 });
        M.pop();
      });
      M.push().move(W * 0.28, y1 + 0.5 * cm, H - 8 * cm).tiltX(-90);
      M.cyl(0, 0, 0, 2 * cm, 3 * cm, M.mat("chrome", C.frame), { seg: 14 });
      M.pop();
      M.box(-W * 0.1, W * 0.12, y1 + 0.4 * cm, y1 + 0.6 * cm, H - 10 * cm, H - 6 * cm, M.mat("screen", "#12161a"));
      M.push().move(0, kd * 14 * cm, 0);                   // the soap drawer, at the top
      M.box(-W / 2 + 3 * cm, -W * 0.18, y1 + 0.4 * cm, y1 + 1.2 * cm, H - 11 * cm, H - 5 * cm, body, 0.4 * cm);
      if (kd > 0.001) {
        M.box(-W / 2 + 3.5 * cm, -W * 0.18 - 0.5 * cm, y1 - 14 * cm, y1 + 0.4 * cm, H - 10.5 * cm, H - 10 * cm, body);
        M.box(-W / 2 + 4 * cm, -W * 0.18 - 1 * cm, y1 - 13 * cm, y1 - 1 * cm, H - 10 * cm, H - 8.5 * cm, M.mat("plastic", "#5aa0e0"));
      }
      M.pop();
    };
  }

  // ---- ovens: the door let down on its hinge, racks and a light inside, the hob lit ---------------
  function o3OvenIn(M, x0, x1, yb, yf, z0, z1, on, rnd) {
    var h = z1 - z0;
    M.box(x1 - 4 * cm, x1 - 1 * cm, yb + 0.4 * cm, yb + 1.4 * cm, z1 - 4 * cm, z1 - 2 * cm, M.mat("glow", "#ffe9b0"));   // its light
    [0.3, 0.62].forEach(function (k) { o3Rack(M, x0 + 0.5 * cm, x1 - 0.5 * cm, yb + 1 * cm, yf - 2 * cm, z0 + h * k, 0); });
    var tz = z0 + h * 0.3 + 0.8 * cm, tray = M.mat("metal", "#3a3c40");
    M.box(x0 + 3 * cm, x1 - 3 * cm, yb + 4 * cm, yf - 6 * cm, tz, tz + 0.4 * cm, tray);
    for (var i = 0; i < 6; i++) {                          // biscuits on the tray
      M.cyl(x0 + 7 * cm + (i % 3) * (x1 - x0 - 14 * cm) / 2, yb + 9 * cm + Math.floor(i / 3) * Math.max(4 * cm, (yf - yb - 18 * cm)), tz + 0.4 * cm, tz + 1.3 * cm, 2.8 * cm,
            M.mat("plastic", "#c98a4a"), { seg: 10 });
    }
    if (on) {                                              // its element, glowing
      var e = M.mat("glow", "#ff6a2a"), ez = z1 - 1.5 * cm;
      M.tube([x0 + 3 * cm, yf - 4 * cm, ez], [x0 + 3 * cm, yb + 3 * cm, ez], 0.5 * cm, e, 6);
      M.tube([x0 + 3 * cm, yb + 3 * cm, ez], [x1 - 3 * cm, yb + 3 * cm, ez], 0.5 * cm, e, 6);
      M.tube([x1 - 3 * cm, yb + 3 * cm, ez], [x1 - 3 * cm, yf - 4 * cm, ez], 0.5 * cm, e, 6);
    }
  }
  if (typeof mDef === "function") {
    mDef("i_oven", function (M, W, D, H, C, n, X) {
      C = mPick(C, "#f2f0ea", "#c9cdd1");
      var body = M.mat("plastic", C.main), y1 = D / 2 - 2 * cm, steel = M.mat("metal", C.frame), on = o3On(X), rnd = mRand(Math.round(W + H));
      M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 0.4 * cm);
      [[0.32, 0.6], [0.62, 0.9]].forEach(function (b) {
        var z0 = H * b[0], z1 = H * b[1];
        var k = M.front("flap", -W / 2 + 3 * cm, W / 2 - 3 * cm, y1, y1 + 5.4 * cm, z0, z1);
        if (k > 0.001) {
          M.hole(-W / 2 + 5 * cm, W / 2 - 5 * cm, z0 + 2 * cm, z1 - 2 * cm, y1, D - 8 * cm, ["plastic", "#2b2d31"]);
          o3OvenIn(M, -W / 2 + 5 * cm, W / 2 - 5 * cm, y1 - (D - 8 * cm), y1, z0 + 2 * cm, z1 - 2 * cm, on, rnd);
        }
        o3Flap(M, y1, z0, k * 88, function () {
          M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, y1, y1 + 1.5 * cm, z0, z1, steel, 0.4 * cm);
          M.box(-W / 2 + 7 * cm, W / 2 - 7 * cm, y1 + 1.5 * cm, y1 + 1.7 * cm, z0 + 4 * cm, z1 - 9 * cm, on ? M.mat("glow", "#d9783a") : M.mat("screen", "#14161a"));
          M.tube([-W * 0.36, y1 + 4.5 * cm, z1 - 5 * cm], [W * 0.36, y1 + 4.5 * cm, z1 - 5 * cm], 0.9 * cm, M.mat("chrome", "#dfe3e8"), 8);
        });
      });
      mFronts(M, -W / 2 + 0.5 * cm, W / 2 - 0.5 * cm, y1, 10 * cm, H * 0.3, 2, 1, body, M.mat("chrome", "#c9ced3"));
      mFronts(M, -W / 2 + 0.5 * cm, W / 2 - 0.5 * cm, y1, H * 0.92, H - 1 * cm, 1, 1, body, M.mat("chrome", "#c9ced3"), { doors: true, low: true });
    });
    mDef("i_stove", function (M, W, D, H, C, n, X) {
      C = mPick(C, "#c9cdd1", "#1b1c1e");
      var steel = M.mat("metal", C.main), glass = M.mat("screen", C.frame), y0 = -D / 2, y1 = D / 2 - 1 * cm, on = o3On(X), rnd = mRand(Math.round(W * 3 + H));
      var chrome = M.mat("chrome", "#dfe3e8"), dz0 = 14 * cm;
      M.box(-W / 2, W / 2, y0, y1, 0, H - 2 * cm, steel, 0.6 * cm);
      var k = M.front("flap", -W / 2 + 3 * cm, W / 2 - 3 * cm, y1 - 0.2 * cm, y1 + 5 * cm, dz0, H - 16 * cm);
      var kd = M.front("drawer", -W / 2 + 2 * cm, W / 2 - 2 * cm, y1 - 0.2 * cm, y1 + 0.6 * cm, 3 * cm, 12 * cm, { slide: 30 * cm });
      if (k > 0.001) {
        M.hole(-W / 2 + 5 * cm, W / 2 - 5 * cm, dz0 + 1.5 * cm, H - 18 * cm, y1, D - 6 * cm, ["plastic", "#2b2d31"]);
        o3OvenIn(M, -W / 2 + 5 * cm, W / 2 - 5 * cm, y1 - (D - 6 * cm), y1, dz0 + 1.5 * cm, H - 18 * cm, on, rnd);
      }
      if (kd > 0.001) { M.hole(-W / 2 + 2.5 * cm, W / 2 - 2.5 * cm, 3.5 * cm, 11.5 * cm, y1, 34 * cm); }
      o3Flap(M, y1, dz0, k * 88, function () {
        M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, y1 - 0.2 * cm, y1 + 1 * cm, dz0, H - 16 * cm, steel, 0.5 * cm);
        M.box(-W / 2 + 7 * cm, W / 2 - 7 * cm, y1 + 0.9 * cm, y1 + 1.2 * cm, 22 * cm, H - 30 * cm, glass);
        M.tube([-W / 2 + 6 * cm, y1 + 4 * cm, H - 20 * cm], [W / 2 - 6 * cm, y1 + 4 * cm, H - 20 * cm], 1 * cm, chrome, 8);
        [-1, 1].forEach(function (s) {
          M.box(s * (W / 2 - 6 * cm) - 1 * cm, s * (W / 2 - 6 * cm) + 1 * cm, y1 + 0.5 * cm, y1 + 4 * cm, H - 21 * cm, H - 19 * cm, chrome);
        });
      });
      M.push().move(0, kd * 30 * cm, 0);                   // the drawer under
      M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1 - 0.2 * cm, y1 + 0.6 * cm, 3 * cm, 12 * cm, M.mat("plastic", "#2a2b2d"));
      if (kd > 0.001) { o3Fill(M, "drawer", o3DrawerBox(M, -W / 2 + 2 * cm, W / 2 - 2 * cm, y1, 3 * cm, 12 * cm, 34 * cm, "metal"), rnd, {}); }
      M.pop();
      M.box(-W / 2, W / 2, y0, y1, H - 2 * cm, H, glass, 0.4 * cm);                     // the hob
      [[-0.25, -0.22, 9], [0.25, -0.22, 7], [-0.25, 0.22, 7], [0.25, 0.22, 9]].forEach(function (b) {
        M.cyl(b[0] * W, b[1] * D, H, H + 0.15 * cm, b[2] * cm, M.mat("metal", "#3a3c40"), { seg: 18 });
        if (on) {                                          // lit: each ring red hot
          M.cyl(b[0] * W, b[1] * D, H + 0.15 * cm, H + 0.3 * cm, b[2] * 0.9 * cm, M.mat("glow", "#ff4a1c"), { seg: 18 });
          M.cyl(b[0] * W, b[1] * D, H + 0.3 * cm, H + 0.35 * cm, b[2] * 0.35 * cm, M.mat("glow", "#ff7a3a"), { seg: 14 });
        } else {
          M.cyl(b[0] * W, b[1] * D, H + 0.15 * cm, H + 0.25 * cm, b[2] * 0.6 * cm, glass, { seg: 18 });
        }
      });
      for (var kk = 0; kk < 4; kk++) {                     // the knobs, along the front
        M.push().move(-W * 0.3 + kk * W * 0.2, y1 + 0.5 * cm, H - 8 * cm).tiltX(-90);
        M.cyl(0, 0, 0, 2 * cm, 1.8 * cm, chrome, { seg: 10 });
        M.pop();
      }
    });
  }

  if (typeof mDef === "function") {
    // ---- a hutch: its cupboard doors under, its glass doors over, on their hinges ------------------
    mDef("i_hutch", function (M, W, D, H, C) {
      C = mPick(C, "#f0ece4", "#a7adb3");
      var body = M.mat("wood", C.main), y1 = D / 2 - 1.5 * cm, low = H * 0.45, rnd = mRand(Math.round(W)), glass = M.mat("glass", "#dbeaf0");
      var z = mCarcass(M, -W / 2, W / 2, -D / 2, y1, 0, low, body, 8 * cm);
      mFronts(M, -W / 2 + 1 * cm, W / 2 - 1 * cm, y1, z + 1 * cm, low - 1 * cm, 1, 2, body, M.mat("metal", C.frame), { doors: true, high: true });
      M.box(-W / 2 - 1 * cm, W / 2 + 1 * cm, -D / 2, D / 2, low, low + 3 * cm, body, 0.5 * cm);
      var up0 = low + 3 * cm, up1 = H - 4 * cm, bd = -D / 2 + D * 0.55;
      M.box(-W / 2 + 1 * cm, -W / 2 + 3 * cm, -D / 2, bd, up0, up1, body);
      M.box(W / 2 - 3 * cm, W / 2 - 1 * cm, -D / 2, bd, up0, up1, body);
      M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2, -D / 2 + 1 * cm, up0, up1, body);
      M.box(-W / 2, W / 2, -D / 2, bd + 1 * cm, up1, H, body, 0.6 * cm);
      for (var k = 1; k <= 2; k++) {
        var sz = up0 + k * (up1 - up0) / 3;
        M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, -D / 2 + 1 * cm, bd, sz, sz + 1.5 * cm, body);
        for (var x = -W / 2 + 10 * cm; x < W / 2 - 8 * cm; x += 9 * cm) {
          M.push().move(x, -D / 2 + 4 * cm, sz + 1.5 * cm).tiltX(-75);
          M.cyl(0, 0, 0, 0.8 * cm, 9 * cm, M.mat("ceramic", rnd() < 0.5 ? "#f4f2ec" : "#9fb4c8"), { seg: 16 });
          M.pop();
        }
      }
      // the glass doors, framed, hung at their outer edges
      [[-W / 2 + 3 * cm, -0.2 * cm, 1], [0.2 * cm, W / 2 - 3 * cm, -1]].forEach(function (d) {
        var kk = M.front("door", d[0], d[1], bd, bd + 3 * cm, up0, up1);
        o3Swing(M, d[2] > 0 ? d[0] : d[1], bd, d[2] * kk * 100, function () {
          var t = 2 * cm;
          M.box(d[0], d[1], bd, bd + 1.6 * cm, up0, up0 + t, body);
          M.box(d[0], d[1], bd, bd + 1.6 * cm, up1 - t, up1, body);
          M.box(d[0], d[0] + t, bd, bd + 1.6 * cm, up0, up1, body);
          M.box(d[1] - t, d[1], bd, bd + 1.6 * cm, up0, up1, body);
          M.box(d[0] + t, d[1] - t, bd + 0.5 * cm, bd + 1 * cm, up0 + t, up1 - t, glass);
          M.ball(d[2] > 0 ? d[1] - 3.5 * cm : d[0] + 3.5 * cm, bd + 2.4 * cm, (up0 + up1) / 2, 1.2 * cm, 1.2 * cm, 1.2 * cm, M.mat("metal", C.frame), { seg: 5 });
        });
      });
    });

    // ---- a shop's cooler: its two glass doors open on their hinges ----------------------------------
    mDef("i_cooler", function (M, W, D, H, C) {
      C = mPick(C, "#2a2c2e", "#c9ced3");
      var body = M.mat("metal", C.main), rnd = mRand(Math.round(W * 11 + H)), y1 = D / 2 - 3 * cm;
      M.box(-W / 2, W / 2, -D / 2, -D / 2 + 3 * cm, 0, H, body);
      M.box(-W / 2, -W / 2 + 3 * cm, -D / 2, y1, 0, H, body);
      M.box(W / 2 - 3 * cm, W / 2, -D / 2, y1, 0, H, body);
      M.box(-W / 2, W / 2, -D / 2, y1, 0, 14 * cm, body);
      M.box(-W / 2, W / 2, -D / 2, y1, H - 18 * cm, H, body);
      M.box(-W / 2 + 4 * cm, W / 2 - 4 * cm, y1 - 0.4 * cm, y1 + 0.4 * cm, H - 15 * cm, H - 4 * cm, M.mat("glow", "#d9ecff"));
      M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, -D / 2 + 3 * cm, -D / 2 + 3.4 * cm, 14 * cm, H - 18 * cm, M.mat("glow", "#eef6ff"));
      var rows = 5, gap = (H - 32 * cm) / rows;
      for (var k = 0; k < rows; k++) {
        var z = 14 * cm + k * gap;
        M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, -D / 2 + 3 * cm, y1 - 4 * cm, z, z + 1.2 * cm, M.mat("chrome", "#c9ced3"));
        var col = M_GOODS[Math.floor(rnd() * M_GOODS.length)], bh = Math.min(gap - 6 * cm, (20 + rnd() * 8) * cm);
        for (var x = -W / 2 + 7 * cm; x < W / 2 - 6 * cm; x += 7.5 * cm) {
          if (rnd() < 0.12) { continue; }
          M.cyl(x, y1 - 12 * cm, z + 1.2 * cm, z + 1.2 * cm + bh, 3 * cm, M.mat("plastic", rnd() < 0.7 ? col : M_GOODS[Math.floor(rnd() * M_GOODS.length)]),
                { seg: 6, r1: 1.4 * cm });
        }
      }
      [[-W / 2 + 1 * cm, -0.5 * cm], [0.5 * cm, W / 2 - 1 * cm]].forEach(function (d, i) {
        var kk = M.front("door", d[0], d[1], y1, y1 + 3.5 * cm, 14 * cm, H - 18 * cm);
        o3Swing(M, i ? d[1] : d[0], y1, (i ? -1 : 1) * kk * 100, function () {
          M.box(d[0], d[1], y1, y1 + 1.2 * cm, 14 * cm, H - 18 * cm, M.mat("glass", "#cfe3ee"));
          M.box(i ? d[0] + 2 * cm : d[1] - 4 * cm, i ? d[0] + 4 * cm : d[1] - 2 * cm, y1 + 1.2 * cm, y1 + 3.5 * cm, H * 0.3, H * 0.7, M.mat("chrome", C.frame), 0.6 * cm);
        });
      });
    });

    // ---- a wine cooler: seen into through its glass, the door swung open -----------------------------
    mDef("i_winecooler", function (M, W, D, H, C) {
      C = mPick(C, "#1d1f22", "#c9cdd1");
      var y1 = D / 2 - 1 * cm, rnd = mRand(Math.round(W * 7)), ix0 = -W / 2 + 2.5 * cm, ix1 = W / 2 - 2.5 * cm, iz0 = 9 * cm, iz1 = H - 3 * cm;
      var deep = D - 5 * cm, wire = M.mat("chrome", "#c9ced3");
      M.box(-W / 2, W / 2, -D / 2, y1, 0, H, M.mat("metal", C.main), 0.6 * cm);
      M.hole(ix0, ix1, iz0, iz1, y1, deep, ["metal", "#26292d"]);                       // always: it is seen through the glass
      M.box(ix0 + 2 * cm, ix1 - 2 * cm, y1 - deep + 0.6 * cm, y1 - deep + 1.6 * cm, iz1 - 2 * cm, iz1 - 1 * cm, M.mat("glow", "#bfe0ff"));
      for (var r = 0; r < 4; r++) {
        var z = iz0 + 1 * cm + r * (iz1 - iz0 - 4 * cm) / 4;
        [y1 - deep + 3 * cm, y1 - 3 * cm].forEach(function (y) { M.box(ix0, ix1, y - 0.3 * cm, y + 0.3 * cm, z, z + 0.6 * cm, wire); });
        for (var b = 0; b < 4; b++) {
          var x = ix0 + (b + 0.5) * (ix1 - ix0) / 4, bz = z + 0.6 * cm + 3.6 * cm, bottle = M.mat("glass", ["#2e4a2a", "#6e2a2a", "#c9b48a"][Math.floor(rnd() * 3)]);
          M.tube([x, y1 - deep + 2 * cm, bz], [x, y1 - 11 * cm, bz], 3.6 * cm, bottle, 10, true);
          M.tube([x, y1 - 11 * cm, bz], [x, y1 - 7 * cm, bz], 1.4 * cm, bottle, 8, true);
          M.tube([x, y1 - 7 * cm, bz], [x, y1 - 4.5 * cm, bz], 1.5 * cm, M.mat("metal", ["#7a2e2a", "#c9a14a", "#2b2b2b"][Math.floor(rnd() * 3)]), 8, true);
        }
      }
      var kk = M.front("door", -W / 2 + 2 * cm, W / 2 - 2 * cm, y1, y1 + 3.5 * cm, 8 * cm, H - 2 * cm);
      o3Swing(M, -W / 2 + 2 * cm, y1, kk * 100, function () {
        M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1, y1 + 1.5 * cm, 8 * cm, H - 2 * cm, M.mat("glass", "#2a3a44"));
        M.box(W / 2 - 6 * cm, W / 2 - 4 * cm, y1 + 1.5 * cm, y1 + 3.5 * cm, H * 0.3, H * 0.8, M.mat("chrome", C.frame));
      });
    });

    // ---- a reach-in closet: its two doors slide past each other ---------------------------------------
    mDef("i_reachin", function (M, W, D, H, C) {
      C = mPick(C, "#f2f0ea", "#c9ced3");
      var body = M.mat("plastic", C.main), y0 = -D / 2, y1 = D / 2, rnd = mRand(W * 7 + D);
      M.box(-W / 2, -W / 2 + 2 * cm, y0, y1, 0, H, body);
      M.box(W / 2 - 2 * cm, W / 2, y0, y1, 0, H, body);
      M.box(-W / 2, W / 2, y0, y0 + 1.5 * cm, 0, H, body);
      M.box(-W / 2, W / 2, y0, y1, H - 3 * cm, H, body);
      M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y0 + 1.5 * cm, y1 - 6 * cm, H - 32 * cm, H - 30 * cm, body);   // a shelf at the top
      M.tube([-W / 2 + 2 * cm, y0 + D * 0.38, H - 40 * cm], [W / 2 - 2 * cm, y0 + D * 0.38, H - 40 * cm], 1.2 * cm, M.mat("chrome", C.frame), 10);
      for (var x = -W / 2 + 8 * cm; x < W / 2 - 8 * cm; x += (5 + rnd() * 4) * cm) {
        var long = (70 + rnd() * 50) * cm;
        M.box(x - 1.2 * cm, x + 1.2 * cm, y0 + D * 0.38 - 22 * cm, y0 + D * 0.38 + 22 * cm, H - 42 * cm - long, H - 42 * cm,
              M.mat("fabric", ["#2f4f6f", "#d8d2c4", "#8c3b2f", "#3d5c43", "#1f2a33", "#b5653a"][Math.floor(rnd() * 6)]), 1 * cm);
      }
      // the two doors, each on its own track: the mirror behind slides right, the other in front slides left
      var run = W / 2 - 6 * cm;
      var kA = M.front("slide", -W / 2 + 2 * cm, 3 * cm, y1 - 5 * cm, y1 - 3.5 * cm, 2 * cm, H - 3 * cm, { slideX: run, part: "door" });
      var kB = M.front("slide", -3 * cm, W / 2 - 2 * cm, y1 - 2.5 * cm, y1 - 1 * cm, 2 * cm, H - 3 * cm, { slideX: -run, part: "door" });
      M.box(-W / 2 + 2 * cm + kA * run, 3 * cm + kA * run, y1 - 5 * cm, y1 - 3.5 * cm, 2 * cm, H - 3 * cm, M.mat("chrome", "#dfe6ea"), 0.3 * cm);
      M.box(-3 * cm - kB * run, W / 2 - 2 * cm - kB * run, y1 - 2.5 * cm, y1 - 1 * cm, 2 * cm, H - 3 * cm, body, 0.3 * cm);
      M.box(-6 * cm - kB * run, -4.6 * cm - kB * run, y1 - 1 * cm, y1 - 0.4 * cm, H * 0.4, H * 0.6, M.mat("chrome", C.frame));   // a pull
    });

    // ---- a medicine cabinet: its two mirrors open, the shelves behind -----------------------------
    mDef("i_medicine", function (M, W, D, H, C) {
      C = mPick(C, "#f2f0ea", "#dfe6ea");
      var y1 = D / 2, yf = y1 - 1.5 * cm, body = M.mat("plastic", C.main), mirror = M.mat("chrome", C.frame), rnd = mRand(Math.round(W * 5 + H));
      M.box(-W / 2, W / 2, -D / 2, yf, 0, H, body, 0.5 * cm);
      var kL = M.front("door", -W / 2 + 0.5 * cm, -0.2 * cm, yf, y1, 0.5 * cm, H - 0.5 * cm);
      var kR = M.front("door", 0.2 * cm, W / 2 - 0.5 * cm, yf, y1, 0.5 * cm, H - 0.5 * cm);
      if (kL > 0.001 || kR > 0.001) {
        var x0 = -W / 2 + 1.5 * cm, x1 = W / 2 - 1.5 * cm, deep = Math.max(4 * cm, D - 3.5 * cm), yb = yf - deep, z0 = 1.5 * cm, z1 = H - 1.5 * cm;
        var glass = M.mat("glass", "#dcecf2"), cy = yb + deep / 2;
        M.hole(x0, x1, z0, z1, yf, deep, ["plastic", "#f4f3ef"]);
        [z0 + (z1 - z0) / 3, z0 + (z1 - z0) * 2 / 3].forEach(function (z) { M.box(x0, x1, yb, yf - 0.5 * cm, z - 0.5 * cm, z, glass); });
        [z0, z0 + (z1 - z0) / 3, z0 + (z1 - z0) * 2 / 3].forEach(function (z, s) {
          var room = (z1 - z0) / 3 - 2 * cm;
          for (var x = x0 + 3 * cm; x < x1 - 2.5 * cm; x += 5 * cm) {
            var r = Math.min(2 * cm, deep / 2 - 0.5 * cm);
            if (s === 0 && x < x0 + 6 * cm) {                 // a cup of toothbrushes
              M.cyl(x, cy, z, z + Math.min(room, 9 * cm), r * 1.1, glass, { seg: 10 });
              ["#2f6f9f", "#c7372f"].forEach(function (c, i) { M.tube([x - 0.6 * cm + i * 1.2 * cm, cy, z + 1 * cm], [x - 0.6 * cm + i * 1.4 * cm, cy, z + Math.min(room, 15 * cm)], 0.35 * cm, M.mat("plastic", c), 5); });
            } else if (rnd() < 0.6) {                          // a bottle of pills
              M.cyl(x, cy, z, z + Math.min(room, (6 + rnd() * 4) * cm), r, M.mat("glass", "#d98a2b"), { seg: 10 });
              M.cyl(x, cy, z + Math.min(room, (6 + rnd() * 4) * cm), z + Math.min(room, 10 * cm) + 1 * cm, r * 1.05, M.mat("plastic", "#f6f6f3"), { seg: 10 });
            } else {
              o3Bottle(M, x, cy, z, r, Math.min(room, (10 + rnd() * 5) * cm), M.mat("plastic", o3Of(rnd, ["#9fb4c8", "#e8d6cc", "#f4f2ee", "#5fa35a"])), M.mat("plastic", "#2a2b2d"));
            }
          }
        });
      }
      o3Swing(M, -W / 2 + 0.5 * cm, yf, kL * 105, function () { M.box(-W / 2 + 0.5 * cm, -0.2 * cm, yf, y1, 0.5 * cm, H - 0.5 * cm, mirror); });
      o3Swing(M, W / 2 - 0.5 * cm, yf, -kR * 105, function () { M.box(0.2 * cm, W / 2 - 0.5 * cm, yf, y1, 0.5 * cm, H - 0.5 * cm, mirror); });
    });

    // ---- a toy box: its lid lifts, the toys in it -----------------------------------------------------
    mDef("i_toybox", function (M, W, D, H, C) {
      C = mPick(C, "#7fa7c9", "#f2c94c");
      var body = M.mat("plastic", C.main), zl = H * 0.75, rnd = mRand(Math.round(W * 3 + D * 5));
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, zl, body, 2 * cm);
      var k = M.front("lid", -W / 2 - 0.5 * cm, W / 2 + 0.5 * cm, -D / 2 - 0.5 * cm, D / 2 + 0.5 * cm, zl, H);
      if (k > 0.001) {
        var x0 = -W / 2 + 3 * cm, x1 = W / 2 - 3 * cm, y0 = -D / 2 + 3 * cm, y1 = D / 2 - 3 * cm, fl = 3 * cm;
        M.holeTop(-W / 2 + 2 * cm, W / 2 - 2 * cm, -D / 2 + 2 * cm, D / 2 - 2 * cm, zl, zl - fl, ["plastic", mShade(C.main, 0.15)]);
        for (var i = 0; i < 9; i++) {
          var x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), c = M.mat("plastic", o3Of(rnd, ["#e46b6b", "#f2c94c", "#5c8a4a", "#4f86c6", "#f08a24", "#a070c0"]));
          var s = (3 + rnd() * 3) * cm, z = fl + (i % 3) * 3 * cm;
          if (i % 3 === 0) { M.ball(Math.max(x0 + s, Math.min(x1 - s, x)), Math.max(y0 + s, Math.min(y1 - s, y)), z + s, s, s, s, c, { seg: 7 }); }
          else { M.box(Math.max(x0, x - s / 2), Math.min(x1, x + s / 2), Math.max(y0, y - s / 2), Math.min(y1, y + s / 2), z, z + s, c, 0.5 * cm); }
        }
        var tx = (x0 + x1) / 2, ty = (y0 + y1) / 2, fur = M.mat("fabric", "#a5784c");   // a bear, sitting up
        M.ball(tx, ty, fl + 8 * cm, 6 * cm, 5 * cm, 7 * cm, fur, { seg: 8 });
        M.ball(tx, ty, fl + 18 * cm, 4.5 * cm, 4.5 * cm, 4.5 * cm, fur, { seg: 8 });
        [-1, 1].forEach(function (sd) { M.ball(tx + sd * 3.2 * cm, ty, fl + 22 * cm, 1.6 * cm, 1 * cm, 1.6 * cm, fur, { seg: 6 }); });
      }
      o3Lift(M, -D / 2 - 0.5 * cm, H, k * 88, function () {
        M.box(-W / 2 - 0.5 * cm, W / 2 + 0.5 * cm, -D / 2 - 0.5 * cm, D / 2 + 0.5 * cm, zl, H, M.mat("plastic", C.frame), 2.5 * cm);
      }, k * (H - zl));
      M.ball(-W * 0.18, D / 2 + 0.2 * cm, H * 0.4, 6 * cm, 0.6 * cm, 6 * cm, M.mat("plastic", "#e46b6b"), { seg: 6 });
      M.box(W * 0.12, W * 0.3, D / 2, D / 2 + 0.6 * cm, H * 0.28, H * 0.52, M.mat("plastic", "#5c8a4a"), 1 * cm);
    });

    // ---- a chest: its rounded lid lifts on the back, blankets folded inside ------------------------
    mDef("i_chest", function (M, W, D, H, C) {
      C = mPick(C, "#9a6b44", "#3a3d40");
      var wood = M.mat("wood", C.main), iron = M.mat("metal", C.frame), zl = H * 0.72, rnd = mRand(Math.round(W * 7 + D));
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, zl, wood, 0.8 * cm);
      [-0.32, 0.32].forEach(function (k) {                   // its straps, round the front and back
        M.box(k * W - 1.5 * cm, k * W + 1.5 * cm, D / 2, D / 2 + 0.3 * cm, 0, zl, iron);
        M.box(k * W - 1.5 * cm, k * W + 1.5 * cm, -D / 2 - 0.3 * cm, -D / 2, 0, zl, iron);
      });
      M.box(-3 * cm, 3 * cm, D / 2, D / 2 + 1 * cm, H * 0.62, zl, iron, 0.3 * cm);
      var k = M.front("lid", -W / 2, W / 2, -D / 2, D / 2 + 1 * cm, zl, H);
      if (k > 0.001) {
        M.holeTop(-W / 2 + 2 * cm, W / 2 - 2 * cm, -D / 2 + 2 * cm, D / 2 - 2 * cm, zl, zl - 4 * cm, ["wood", mShade(C.main, 0.12)]);
        var x0 = -W / 2 + 3 * cm, x1 = W / 2 - 3 * cm, y0 = -D / 2 + 3 * cm, y1 = D / 2 - 3 * cm, z = 4 * cm, bw = Math.min(40 * cm, (x1 - x0) / 2 - 1 * cm);
        for (var x = x0; x + bw <= x1 + 0.1; x += bw + 1.5 * cm) {
          var piles = 2 + Math.floor(rnd() * 3);
          for (var p = 0; p < piles && z + (p + 1) * 6 * cm < zl - 2 * cm; p++) {
            M.box(x, x + bw, y0, y1, z + p * 6 * cm, z + (p + 1) * 6 * cm - 0.4 * cm, M.mat("fabric", o3Of(rnd, ["#8c3b2f", "#d8d2c4", "#3d5c43", "#c9b48a", "#2f4f6f"])), 2.5 * cm);
          }
        }
      }
      o3Lift(M, -D / 2, H, k * 88, function () {
        M.push().move(0, 0, zl);
        M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.28, wood, Math.min(D / 2.4, H * 0.27));
        M.pop();
        M.box(-3 * cm, 3 * cm, D / 2, D / 2 + 1 * cm, zl, H * 0.78, iron, 0.3 * cm);   // its hasp
      }, k * (H - zl));
    });

    // ---- a mailbox: its end lets down, the letters inside --------------------------------------------
    // (its dome along its length, as it is drawn on the plan: the old one was
    // turned across it, wider than the box under it)
    mDef("i_mailbox", function (M, W, D, H, C) {
      C = mPick(C, "#2f3236", "#c7372f");
      var met = M.mat("metal", C.main), zb = H - 22 * cm, zt = H - 8 * cm, t = 0.5 * cm, r = D / 2, rnd = mRand(Math.round(W * 3 + D));
      M.box(-2 * cm, 2 * cm, -2 * cm, 2 * cm, 0, zb, M.mat("wood", "#6f5a48"));
      M.box(-W / 2, W / 2, -D / 2, D / 2, zb, zb + t, met);                          // its floor and sides
      M.box(-W / 2, W / 2, -D / 2, -D / 2 + t, zb, zt, met);
      M.box(-W / 2, W / 2, D / 2 - t, D / 2, zb, zt, met);
      M.push().move(0, 0, zt).tiltY(90);                      // the dome, along it
      M.lathe(0, 0, [[r, -W / 2], [r, W / 2]], met, { seg: 14, from: 90, to: 270, top: false });
      M.pop();
      o3EndCap(M, W / 2 - t, W / 2, r, zb, zt, met);           // its back
      var k = M.front("flap", -W / 2 - t, -W / 2 + t, -D / 2, D / 2, zb, zt + r);
      if (k > 0.001) {
        for (var i = 0; i < 3; i++) {
          var lx = -W / 2 + 3 * cm + i * 2 * cm;
          M.box(lx, lx + Math.min(W * 0.6, 22 * cm), -D / 2 + 1.5 * cm + i * 0.6 * cm, D / 2 - 1.5 * cm - i * 0.6 * cm, zb + t + i * 0.3 * cm, zb + t + (i + 1) * 0.3 * cm,
                M.mat("plastic", o3Of(rnd, ["#f6f4ee", "#efe3c4", "#dfe9ef"])));
        }
      }
      M.push().move(-W / 2, 0, zb).tiltY(-k * 85).move(W / 2, 0, -zb);   // its end, down on its hinge
      o3EndCap(M, -W / 2 - t, -W / 2, r + 0.3 * cm, zb, zt, met);
      M.box(-W / 2 - t - 1.2 * cm, -W / 2 - t, -1 * cm, 1 * cm, zt - 1 * cm, zt + r * 0.6, M.mat("metal", "#c9ced3"), 0.4 * cm);
      M.pop();
      M.box(W / 2, W / 2 + 0.6 * cm, -3 * cm, -1 * cm, H - 18 * cm, H - 4 * cm, M.mat("plastic", C.frame));   // the flag
      M.box(W / 2, W / 2 + 0.6 * cm, -3 * cm, 4 * cm, H - 6 * cm, H - 3 * cm, M.mat("plastic", C.frame));
    });

    // ---- a grill: its lid lifts on the back; lit, the coals glow under the grate ----------------------
    mDef("i_grill", function (M, W, D, H, C, n, X) {
      C = mPick(C, "#2b2d31", "#9ea3a8");
      var body = M.mat("metal", C.main), steel = M.mat("metal", C.frame), x0 = -W * 0.32, x1 = W * 0.32, cz = H * 0.62, on = o3On(X);
      M.box(x0, x1, -D / 2, D / 2, 8 * cm, cz, body, 1 * cm);
      mFronts(M, x0 + 1 * cm, x1 - 1 * cm, D / 2, 10 * cm, cz - 4 * cm, 1, 2, body, M.mat("chrome", "#dfe3e8"), { doors: true, high: true });
      [-W / 2, x1].forEach(function (x) { M.box(x, x + W * 0.18, -D * 0.4, D * 0.4, cz - 4 * cm, cz - 2 * cm, steel, 0.4 * cm); });
      var k = M.front("lid", x0, x1, -D / 2, D / 2 + 6 * cm, cz, cz + D / 2 + 1 * cm);
      if (k > 0.001 || on) {
        if (on) { M.box(x0 + 3 * cm, x1 - 3 * cm, -D / 2 + 3 * cm, D / 2 - 3 * cm, cz + 0.05 * cm, cz + 0.25 * cm, M.mat("glow", "#ff5a1f")); }
        var grate = M.mat("chrome", "#9aa0a6");
        for (var gx = x0 + 3 * cm; gx < x1 - 2 * cm; gx += 2.2 * cm) { M.box(gx - 0.35 * cm, gx + 0.35 * cm, -D / 2 + 2 * cm, D / 2 - 2 * cm, cz + 0.6 * cm, cz + 1.2 * cm, grate); }
      }
      o3Lift(M, -D / 2, cz, k * 75, function () {
        M.push().move(0, 0, cz).tiltY(90);
        M.lathe(0, 0, [[D * 0.5, x0], [D * 0.5, x1]], body, { seg: 16, from: 90, to: 270, top: false });
        o3HalfCap(M, D * 0.5, x0, body); o3HalfCap(M, D * 0.5, x1, body);
        M.pop();
        M.tube([x0 + 4 * cm, D * 0.5 + 4 * cm, cz + D * 0.3], [x1 - 4 * cm, D * 0.5 + 4 * cm, cz + D * 0.3], 1 * cm, M.mat("chrome", "#dfe3e8"), 8);
      });
      [[x0, -1], [x1, 1]].forEach(function (w) {
        M.push().move(w[0], -D * 0.3, 7 * cm).tiltY(90);
        M.cyl(0, 0, -2 * cm, 2 * cm, 7 * cm, M.mat("rubber", "#151515"), { seg: 14 });
        M.pop();
      });
      mLegs(M, x0, x1, -D / 2, D / 2, 2 * cm, 0, 8 * cm, 1.5 * cm, steel, false);
    });

    // ---- fires, lit only when they are lit ------------------------------------------------------------
    mDef("i_fireplace", function (M, W, D, H, C, n, X) {
      C = mPick(C, "#e9e4da", "#3a3027");
      var stone = M.mat("stone", C.main), y0 = -D / 2, y1 = D / 2, ox = W * 0.31, top = H * 0.62, on = o3On(X);
      M.box(-W / 2, -ox, y0, y1 - 4 * cm, 0, H - 6 * cm, stone);
      M.box(ox, W / 2, y0, y1 - 4 * cm, 0, H - 6 * cm, stone);
      M.box(-ox, ox, y0, y1 - 4 * cm, top, H - 6 * cm, stone);
      M.box(-W / 2 - 3 * cm, W / 2 + 3 * cm, y0, y1, H - 6 * cm, H, M.mat("wood", C.frame), 0.6 * cm);
      M.box(-ox, ox, y0, y0 + 4 * cm, 0, top, M.mat("rubber", "#151312"));
      M.box(-ox, -ox + 2 * cm, y0, y1 - 4 * cm, 0, top, M.mat("rubber", "#1d1a18"));
      M.box(ox - 2 * cm, ox, y0, y1 - 4 * cm, 0, top, M.mat("rubber", "#1d1a18"));
      M.box(-W / 2 - 4 * cm, W / 2 + 4 * cm, y1 - 4 * cm, y1 + 22 * cm, 0, 3 * cm, stone, 0.6 * cm);
      M.box(-ox * 0.7, ox * 0.7, y0 + 6 * cm, y0 + 22 * cm, 0, 2 * cm, on ? M.mat("glow", "#ff5a1f") : M.mat("stone", "#4a4644"), 1 * cm);   // the grate's bed: embers, or ash
      var wood = M.mat("bark", "#5b3f2a");
      M.tube([-ox * 0.6, y0 + 10 * cm, 3 * cm], [ox * 0.5, y0 + 14 * cm, 3 * cm], 3 * cm, wood, 8);
      M.tube([-ox * 0.4, y0 + 18 * cm, 3 * cm], [ox * 0.6, y0 + 9 * cm, 7 * cm], 2.6 * cm, wood, 8);
      if (on) {
        [[-0.2, 9], [0.12, 12], [0.32, 8], [-0.05, 15]].forEach(function (f) {
          M.lathe(f[0] * ox, y0 + 13 * cm, [[4 * cm, 6 * cm], [3 * cm, 6 * cm + f[1] * cm * 0.5], [0, 6 * cm + f[1] * cm]], M.mat("glow", "#ff9a3c"), { seg: 8 });
        });
      }
    });
    mDef("i_firepit", function (M, W, D, H, C, n, X) {
      C = mPick(C, "#8f8a80");
      var R = Math.min(W, D) / 2, on = o3On(X);
      M.lathe(0, 0, [[R, 0], [R, H * 0.9], [R * 0.92, H], [R * 0.68, H], [R * 0.66, H * 0.3], [0, H * 0.3]], M.mat("stone", C.main), { seg: 28 });
      M.cyl(0, 0, H * 0.3, H * 0.33, R * 0.6, on ? M.mat("glow", "#ff5a1f") : M.mat("stone", "#4a4644"), { seg: 18 });
      M.tube([-R * 0.4, -R * 0.1, H * 0.4], [R * 0.4, R * 0.1, H * 0.4], R * 0.08, M.mat("bark", "#5b3f2a"), 8);
      M.tube([-R * 0.2, R * 0.4, H * 0.42], [R * 0.25, -R * 0.4, H * 0.48], R * 0.07, M.mat("bark", "#5b3f2a"), 8);
      if (on) {
        [[0, 0, 20], [-0.18, 0.1, 14], [0.18, -0.08, 15]].forEach(function (f) {
          M.lathe(f[0] * R, f[1] * R, [[R * 0.16, H * 0.4], [R * 0.1, H * 0.4 + f[2] * cm * 0.5], [0, H * 0.4 + f[2] * cm]], M.mat("glow", "#ff9a3c"), { seg: 8 });
        });
      }
    });
    mDef("i_heater", function (M, W, D, H, C, n, X) {
      C = mPick(C, "#f2f2ef", "#c9a24a");
      var R = Math.min(W, D) / 2 * 0.9, body = M.mat("plastic", C.main), pipe = M.mat("metal", C.frame);
      M.lathe(0, 0, [[R * 0.9, 0], [R, 4 * cm], [R, H - 10 * cm], [R * 0.9, H - 3 * cm], [R * 0.4, H], [0, H]], body, { seg: 24 });
      [-0.3, 0.3].forEach(function (k) { M.cyl(k * R, 0, H - 1 * cm, H + 30 * cm, 1.4 * cm, pipe, { seg: 8 }); });
      M.box(-6 * cm, 6 * cm, R - 1 * cm, R + 2 * cm, 18 * cm, 30 * cm, M.mat("plastic", "#2a2b2d"), 1 * cm);
      M.lathe(0, 0, [[R + 0.2 * cm, 36 * cm], [R + 0.2 * cm, Math.max(40 * cm, H - 16 * cm)]], o3On(X) ? M.mat("glow", "#ff7a3a") : M.mat("metal", "#8f959b"),
              { seg: 12, from: 50, to: 130, top: false });           // its grille: glowing, on
    });
  }
  // a mailbox's end: a flat plate, square under, round over, from x0 to x1 across
  function o3EndCap(M, x0, x1, r, zb, zt, m) {
    M.box(x0, x1, -r, r, zb, zt, m);
    M.push().move(x0, 0, zt).tiltY(90);
    M.lathe(0, 0, [[r, 0], [r, x1 - x0]], m, { seg: 14, from: 90, to: 270, top: false });
    o3HalfCap(M, r, 0, m); o3HalfCap(M, r, x1 - x0, m);
    M.pop();
  }
  // half a disc, the top half, at h along a lathe turned on its side (tiltY 90)
  function o3HalfCap(M, r, h, m) {
    var seg = 12;
    for (var i = 0; i < seg; i++) {
      var a0 = (90 + 180 * i / seg) * Math.PI / 180, a1 = (90 + 180 * (i + 1) / seg) * Math.PI / 180;
      M.tri(m, [0, 0, h], [Math.cos(a0) * r, Math.sin(a0) * r, h], [Math.cos(a1) * r, Math.sin(a1) * r, h], [0, 0, 1], [0, 0, 1], [0, 0, 1]);
    }
  }
  // A furnace's burner, and a water heater's, seen burning through their windows.
  if (typeof MODELS === "object") {
    ["i_furnace", "i_waterheater"].forEach(function (kind) {
      var plain = MODELS[kind];
      if (!plain) { return; }
      MODELS[kind] = function (M, W, D, H, C, n, X) {
        plain.apply(this, arguments);
        if (!o3On(X)) { return; }
        if (kind === "i_furnace") { M.box(-W * 0.12, W * 0.12, D / 2 - 0.2 * cm, D / 2 + 0.05 * cm, H * 0.18, H * 0.26, M.mat("glow", "#4a8cff")); }
        else { var R = Math.min(W, D) / 2 * 0.92; M.box(-4 * cm, 4 * cm, R + 3 * cm, R + 3.2 * cm, 25 * cm, 30 * cm, M.mat("glow", "#4a8cff")); }
      };
    });
  }

  // ============================================================ seen as they stand, each picture ==
  // The picture of the house is kept while nothing it is made from changes
  // (38-view3d.js), every piece in it shut.  What stands open, or is on its
  // way, or is lit, is taken out of it each picture and put back made as it
  // is -- where it was, on its floor.
  if (typeof v3Build === "function") {
    var v3BuildOpen3d = v3Build;
    v3Build = function () {
      var model = v3BuildOpen3d.apply(this, arguments);
      try { if (model && model.faces && V3 && V3.use && modelsOn()) { o3Repaint(model); } } catch (e) { /* as it was built */ }
      return model;
    };
  }
  function o3Repaint(model) {
    var U = V3.use, ids = {}, any = false;
    if (U.fr) { Object.keys(U.fr).forEach(function (id) { ids[id] = true; any = true; }); }
    if (U.anim) {
      Object.keys(U.anim).forEach(function (id) {
        if (Object.keys(U.anim[id]).length) { ids[id] = true; any = true; } else { delete U.anim[id]; }
      });
    }
    // (lit: only what is made lit -- a hob, a fire -- not every light or screen switched on)
    if (U.on) {
      Object.keys(U.on).forEach(function (id) {
        var n = U.on[id] && /^[0-9]+$/.test(id) ? nodeById(+id) : null;
        if (n && O3_HEAT[n.kind]) { ids[id] = true; any = true; }
      });
    }
    if (!any) { return; }
    var keep = [], found = {}, order = [];
    model.faces.forEach(function (f) {
      var n = f.node;
      if (n && (f.mesh || (f.how && f.how.ghost)) && ids[n.id]) {
        if (!found[n.id]) { found[n.id] = { n: n, faces: [] }; order.push(n.id); }
        found[n.id].faces.push(f);
        return;
      }
      keep.push(f);
    });
    if (!order.length) { return; }
    order.forEach(function (id) {
      var F = found[id], n = F.n, mf = null;
      F.faces.forEach(function (f) { if (!mf && f.mesh) { mf = f; } });
      if (!mf) { Array.prototype.push.apply(keep, F.faces); return; }
      var off = [mf.pts[0][0] - mf.mesh.base[0], mf.pts[0][1] - mf.mesh.base[1], mf.pts[0][2] - mf.mesh.base[2]], z0 = mf.mesh.xf[4];
      var made = [], ok = false, first = null;
      o3Live = true;
      try { ok = v3ModelPut(made, n, function () { return z0 / FLOOR_PX; }, function () { return z0 / FLOOR_PX + 3; }, function () { return []; }); }
      catch (e) { ok = false; }
      finally { o3Live = false; }
      made.forEach(function (f) { if (!first && f.mesh) { first = f; } });
      if (!ok || !first) { Array.prototype.push.apply(keep, F.faces); return; }
      var dz = z0 - first.mesh.xf[4], bad = V3.carry && V3.carry.bad && V3.carry.id === n.id;
      made.forEach(function (f) {
        f.pts = f.pts.map(function (q) { return [q[0] + off[0], q[1] + off[1], q[2] + off[2] + dz]; });
        f.node = n;
        // carried where it cannot go: red, as the rest of it would be (40-edit3d.js)
        if (bad && f.how && !f.how.ghost) { f.how = Object.assign({}, f.how, { color: EDIT3D_BAD, edge: "#a32b2f", tint: "bad", pat: 0 }); }
        keep.push(f);
      });
      if (dz && modelWaters[n.id]) { modelWaters[n.id].forEach(function (w) { w.p[2] += dz; w.low += dz; }); }
    });
    model.faces = keep;
  }
  // While anything is on its way open or shut, a picture each frame (and the last one as it settles).
  if (typeof v3Watch === "function") {
    var v3WatchOpen3d = v3Watch;
    v3Watch = function () {
      if (V3 && V3.o3Moving) {
        var A = V3.use && V3.use.anim, now = performance.now(), busy = false;
        if (A) {
          Object.keys(A).forEach(function (id) {
            Object.keys(A[id]).forEach(function (i) { if (now - A[id][i].t0 > A[id][i].ms + 200) { delete A[id][i]; } else { busy = true; } });
          });
        }
        V3.dirty = true;
        if (!busy) { V3.o3Moving = false; }
      }
      return v3WatchOpen3d.apply(this, arguments);
    };
  }

  // =================================================================== what is looked at ==
  // A ray from the eye through the view (the middle of it for E, the spot
  // clicked for a click): the nearest piece it meets, not one behind a wall,
  // a ceiling or a window -- and how far off.  Looked at, used, only near
  // enough to reach.
  var O3_MIN = 0.12;                     // metres: a switch, a knob -- looked at as if this big
  function o3RayAt(nx, ny) {
    var G = V3 && V3.gl;
    if (!G || !G.mvp) { return null; }
    var inv = dragInverse(G.mvp);
    if (!inv) { return null; }
    var a = dragApply(inv, [nx, ny, -1, 1]), b = dragApply(inv, [nx, ny, 1, 1]);
    if (!a[3] || !b[3]) { return null; }
    a = [a[0] / a[3], a[1] / a[3], a[2] / a[3]]; b = [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]) || 1;
    return { o: a, d: [d[0] / l, d[1] / l, d[2] / l] };
  }
  // Where along the ray it goes into a box [x0, x1, y0, y1, z0, z1], or Infinity.
  function o3RayBox(o, d, b, pad) {
    var t0 = 0, t1 = Infinity;
    for (var k = 0; k < 3; k++) {
      var lo = b[k * 2] - pad, hi = b[k * 2 + 1] + pad;
      if (Math.abs(d[k]) < 1e-9) { if (o[k] < lo || o[k] > hi) { return Infinity; } continue; }
      var u = (lo - o[k]) / d[k], v = (hi - o[k]) / d[k];
      if (u > v) { var w = u; u = v; v = w; }
      if (u > t0) { t0 = u; }
      if (v < t1) { t1 = v; }
      if (t0 > t1) { return Infinity; }
    }
    return t0;
  }
  var o3Boxes = typeof WeakMap === "function" ? new WeakMap() : null;
  // (2026-10-07, "make it so the selector works better when interacting with things") What is looked at
  // is the piece whose own faces the ray meets first (40-drag.js pickFacesT), not the nearest box round
  // a piece: a chair under a table, a lamp on a nightstand, a sofa at a slant. A small thing -- a switch,
  // a plug, a cup -- is still had from a little way off it; and the ray just beside something, meeting
  // nothing, is tried O3_ASSIST to each side.
  var O3_ASSIST = 0.018, O3_SMALL = 0.45;      // (radians, about a degree; metres across, at most, to be "small")
  function o3Look(R, far) {
    var model = V3 && V3.dragModel;
    if (!model || !model.faces || !R) { return null; }
    var o = R.o, boxes = {}, list = [], walls = [], reach = far + 3 * FLOOR_PX, small = O3_MIN * FLOOR_PX;
    // (2026-10-07: walking round the whole building, fifty thousand faces -- a piece far off is passed over at
    // once, by where it stands on its floor, not each of its faces boxed and measured, several times a second)
    var farOf = new Map(), fls = typeof floorsOf === "function" ? floorsOf() : [];
    function farOff(n) {
      var v = farOf.get(n);
      if (v === undefined) {
        var fl = fls.length ? floorAt(fls, n.x, n.y) : null, fz = fl ? fl.z : 0;
        var dh = Math.max(0, Math.hypot(n.x + (fl ? fl.dx : 0) - o[0], n.y + (fl ? fl.dy : 0) - o[1]) - Math.hypot(n.w || 0, n.h || 0) / 2);
        var dz = Math.max(fz - FLOOR_PX - o[2], 0, o[2] - (fz + Math.max(4.5, (n.ceil || 0) + 1) * FLOOR_PX));
        v = dh * dh + dz * dz > reach * reach;
        farOf.set(n, v);
      }
      return v;
    }
    model.faces.forEach(function (f) {
      var P = f.pts;
      // (nor what is on its way -- carried in, going up: 40-movein.js)
      if (f.me || f.found || f.moves || !P || P.length < 3) { return; }
      var n = f.node, how = f.how || {};
      if (n && n.x !== undefined && farOff(n)) { return; }
      var fixed = n ? !!(O3_FIXED[n.kind] || (typeof BETWEEN_FLOORS === "object" && BETWEEN_FLOORS[n.kind])) : !!(how.wall || how.roof);
      if (!n && !fixed) { return; }                // water running, a plug's cord, the grid carried over: not in the way
      // (a face's box kept with its corners, which last from picture to picture: 2026-10-04)
      var bx = o3Boxes ? o3Boxes.get(P) : null;
      if (!bx) {
        bx = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
        for (var i = 0; i < P.length; i++) {
          var p = P[i];
          if (p[0] < bx[0]) { bx[0] = p[0]; } if (p[0] > bx[1]) { bx[1] = p[0]; }
          if (p[1] < bx[2]) { bx[2] = p[1]; } if (p[1] > bx[3]) { bx[3] = p[1]; }
          if (p[2] < bx[4]) { bx[4] = p[2]; } if (p[2] > bx[5]) { bx[5] = p[2]; }
        }
        if (o3Boxes) { o3Boxes.set(P, bx); }
      }
      var x0 = bx[0], x1 = bx[1], y0 = bx[2], y1 = bx[3], z0 = bx[4], z1 = bx[5];
      var ex = Math.max(x0 - o[0], 0, o[0] - x1), ey = Math.max(y0 - o[1], 0, o[1] - y1), ez = Math.max(z0 - o[2], 0, o[2] - z1);
      if (ex * ex + ey * ey + ez * ez > reach * reach) { return; }
      if (fixed) {
        if (how.ghost || f.floor) { return; }
        walls.push([f, bx]);
        return;
      }
      var b = boxes[n.id];
      if (!b) { b = boxes[n.id] = { n: n, box: null, leaf: null, mf: null, faces: [], leafFaces: [] }; list.push(b); }
      var into = WALK_DOORS[n.kind] && how.leaf ? "leaf" : "box", B = b[into];
      (into === "leaf" ? b.leafFaces : b.faces).push(f);
      if (!B) { b[into] = [x0, x1, y0, y1, z0, z1]; }
      else {
        if (x0 < B[0]) { B[0] = x0; } if (x1 > B[1]) { B[1] = x1; }
        if (y0 < B[2]) { B[2] = y0; } if (y1 > B[3]) { B[3] = y1; }
        if (z0 < B[4]) { B[4] = z0; } if (z1 > B[5]) { B[5] = z1; }
      }
      if (f.mesh && !b.mf && !how.shade) { b.mf = f; }
    });
    var hit = o3Cast(R, list, walls, small, far);
    if (!hit) {
      // (a hair to each side: up, down, left and right of the ray)
      var d = R.d, up = Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
      var u = [d[1] * up[2] - d[2] * up[1], d[2] * up[0] - d[0] * up[2], d[0] * up[1] - d[1] * up[0]], ul = Math.hypot(u[0], u[1], u[2]) || 1;
      u = [u[0] / ul, u[1] / ul, u[2] / ul];
      var v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) {
        var dd = [0, 1, 2].map(function (i) { return d[i] + (u[i] * q[0] + v[i] * q[1]) * O3_ASSIST; }), dl = Math.hypot(dd[0], dd[1], dd[2]);
        var h = o3Cast({ o: o, d: [dd[0] / dl, dd[1] / dl, dd[2] / dl] }, list, walls, small, far);
        if (h && (!hit || h.t < hit.t)) { hit = h; }
      });
    }
    return hit;
  }
  // One ray among the pieces near enough (o3Look): the walls, floors and windows it meets first stop it;
  // of the pieces, the one whose faces it meets first -- or, meeting none, a small one it passes close to.
  function o3Cast(R, list, walls, small, far) {
    var o = R.o, wall = Infinity, cands = [];
    walls.forEach(function (w) {
      if (pickBoxT(o, R.d, w[1], 0.5) >= wall) { return; }
      var t = pickFaceT(R, w[0]);
      if (t < wall) { wall = t; }
    });
    list.forEach(function (b) {
      var box = b.leaf || b.box;                   // a door: its leaf, not the doorway it stands in
      if (!box) { return; }
      if (o[0] > box[0] && o[0] < box[1] && o[1] > box[2] && o[1] < box[3] && o[2] > box[4] && o[2] < box[5]) { return; }
      var pb = box.slice();
      for (var k = 0; k < 3; k++) {
        var pad = Math.max(0.3, (small - (box[k * 2 + 1] - box[k * 2])) / 2);
        pb[k * 2] -= pad; pb[k * 2 + 1] += pad;
      }
      var tb = o3RayBox(o, R.d, pb, 0);
      if (tb < Infinity && tb <= wall + 1) { cands.push({ b: b, box: box, tb: tb }); }
    });
    cands.sort(function (p, q) { return p.tb - q.tb; });
    var best = null, loose = null, tiny = O3_SMALL * FLOOR_PX;
    cands.forEach(function (c) {
      if (best && c.tb > best.t) { return; }
      var b = c.b, te = pickFacesT(R, b.leaf ? b.leafFaces : b.faces), box = c.box;
      if (te < Infinity) { if (!best || te < best.t) { best = { n: b.n, t: te, mf: b.mf, box: box }; } return; }
      if (!loose && Math.max(box[1] - box[0], box[3] - box[2], box[5] - box[4]) <= tiny) { loose = { n: b.n, t: c.tb, mf: b.mf, box: box, loose: true }; }
    });
    var pick = best || loose;
    if (!pick || pick.t > wall + 1 || pick.t > far) { return null; }
    return pick;
  }
  // What is looked at along a ray, and what it would do: used near enough, or "move closer".
  function o3Aim(R) {
    if (!R) { return null; }
    var hit = o3Look(R, 6 * FLOOR_PX);
    if (!hit) { return null; }
    var n = hit.n, door = !!WALK_DOORS[n.kind], kind = door ? null : useKind(n);
    var fr = !door && modelsOn() ? modelFronts[n.id] : null;
    var reach = (door ? O3_REACH_DOOR : FROM_CEILING[n.kind] ? O3_REACH_UP : O3_REACH) * FLOOR_PX;
    // (sat down, a screen across the room is had as by its remote, 2026-10-07)
    if (kind === "screen" && V3.sitting && !V3.sitting.up) { reach = Math.max(reach, 6 * FLOOR_PX); }
    // (in reach by its nearest part, not by the spot looked at: a bed's headboard looked at from its foot, 2026-10-07)
    var b = hit.box, o = R.o, gap = b ? Math.hypot(Math.max(b[0] - o[0], 0, o[0] - b[1]), Math.max(b[2] - o[1], 0, o[1] - b[3]), Math.max(b[4] - o[2], 0, o[2] - b[5])) : hit.t;
    var aim = { n: n, t: hit.t, near: Math.min(hit.t, gap) <= reach, door: door, kind: kind, front: -1, R: R, box: hit.box,
                usable: door || !!kind || !!(fr && fr.length) };
    if (fr && fr.length) { aim.front = o3FrontAt(n, R, hit, fr, kind); }
    return aim;
  }
  // Which of its parts is looked at: the one the ray goes into (shut where
  // it is, a drawer out where it is) -- or, looking at the rest of a chest
  // of drawers, the nearest; a sink's basin, a hob, is the sink or the hob.
  function o3FrontAt(n, R, hit, fr, kind) {
    var mf = hit.mf, other = !!kind && kind !== "open";
    if (!mf || !mf.mesh || !mf.mesh.xf) { return other ? -1 : 0; }
    var xf = mf.mesh.xf, base = mf.mesh.base, P0 = mf.pts[0], c = xf[2], s = xf[3];
    var ox = xf[0] + P0[0] - base[0], oy = xf[1] + P0[1] - base[1], oz = xf[4] + P0[2] - base[2];
    var dx = R.o[0] - ox, dy = R.o[1] - oy, o = [dx * c + dy * s, -dx * s + dy * c, R.o[2] - oz];
    var d = [R.d[0] * c + R.d[1] * s, -R.d[0] * s + R.d[1] * c, R.d[2]], best = -1, bt = Infinity;
    fr.forEach(function (f, i) {
      var t = o3RayBox(o, d, f.box, 1.2 * cm), k = o3K(n.id, i);
      if (f.slide && k > 0.01) { t = Math.min(t, o3RayBox(o, d, f.box.map(function (v, j) { return v + f.slide[j >> 1] * k; }), 1.2 * cm)); }
      if (t < bt) { bt = t; best = i; }
    });
    if (best >= 0 || other) { return best; }
    var q = [o[0] + d[0] * hit.t, o[1] + d[1] * hit.t, o[2] + d[2] * hit.t], near = Infinity;
    fr.forEach(function (f, i) {
      var b = f.box, ex = Math.max(b[0] - q[0], 0, q[0] - b[1]), ey = Math.max(b[2] - q[1], 0, q[1] - b[3]), ez = Math.max(b[4] - q[2], 0, q[2] - b[5]);
      if (ex * ex + ey * ey + ez * ez < near) { near = ex * ex + ey * ey + ez * ez; best = i; }
    });
    return best;
  }
  // What E would do, in a few words.
  var O3_SAY_DO = { us_flush: "o3_flush", us_play: "o3_play", us_plant: "o3_water_plant", us_book: "o3_take_book", us_pay: "o3_pay",
                    us_shop: "o3_take", us_coffee: "o3_coffee", us_exercise: "o3_workout", us_game: "o3_game", us_fish: "o3_fish",
                    us_music: "o3_music", us_write: "o3_write", us_car: "o3_car", us_swim: "o3_swim", us_water_on: "o3_tap_on",
                    us_smoke: "o3_test", us_thermo: "o3_warmer", us_breaker: "o3_breakers_off" };
  function o3Verb(a) {
    var n = a.n, U = (V3 && V3.use) || {}, on = !!(U.on && U.on[n.id]);
    if (a.door) {
      if (typeof doorLocked === "function" && doorLocked(n)) { return TXT.o3_locked; }
      return typeof doorIsOpen === "function" && doorIsOpen(n) ? TXT.o3_close_door : TXT.o3_open_door;
    }
    if (a.front >= 0) {
      var f = modelFronts[n.id] && modelFronts[n.id][a.front], open = o3IsOpen(n.id, a.front);
      return TXT["o3_" + (open ? "close_" : "open_") + (f ? f.part : "door")] || TXT[open ? "o3_close_door" : "o3_open_door"];
    }
    var kind = a.kind;
    if (n.kind === "i_breaker") { return U.all ? TXT.o3_breakers_on : TXT.o3_breakers_off; }
    if (kind === "light") {
      var room = useRoomOf(n), dark = room ? useDark(room) : !!(U.on && U.on["out" + n.id]);
      return dark ? TXT.o3_light_on : TXT.o3_light_off;
    }
    if (kind === "water") { return on ? TXT.o3_tap_off : TXT.o3_tap_on; }
    if (kind === "heat") {
      if (n.kind === "i_fireplace" || n.kind === "i_firepit") { return on ? TXT.o3_fire_off : TXT.o3_fire_on; }
      return on ? TXT.o3_turn_off : TXT.o3_turn_on;
    }
    if (kind === "screen" || kind === "fan") { return on ? TXT.o3_turn_off : TXT.o3_turn_on; }
    if (kind === "seat") { return TXT.o3_sit; }
    if (kind === "bed") { return (V3.todAim || 0) > 0 ? TXT.o3_sleep : TXT.o3_lie; }
    if (n.kind === "i_outlet") { return on ? TXT.o3_unplug : TXT.o3_plug; }
    if (kind === "open") { return on ? TXT.o3_close_door : TXT.o3_open_door; }
    if (kind === "say") { return TXT[O3_SAY_DO[USE_SAYS[n.kind]]] || TXT.o3_use; }
    return TXT.o3_use;
  }

  // ---- used --------------------------------------------------------------------------------------
  var o3Force = null, o3DoorOnly = null;
  function o3Toggle(n, i) {
    var f = modelFronts[n.id] && modelFronts[n.id][i];
    if (!f) { return; }
    var open = !o3IsOpen(n.id, i);
    o3Set(n.id, i, open);
    v3Say(say(open ? "o3_opened" : "o3_closed", { what: useName(n), part: TXT["o3_p_" + f.part] || f.part }));
  }
  // Done, as it is looked at: a part of it opened or shut; or, through
  // what E always did (39-inside.js, 40-doors.js, 40-climb.js), that very
  // door, that very thing -- not the nearest.
  function o3Act(a) {
    if (!a || !a.usable) { v3Say(TXT.us_nothing); return false; }
    if (!a.near) { v3Say(TXT.o3_closer); return false; }
    V3.o3Pose = null;
    if (a.front >= 0) { o3Toggle(a.n, a.front); return true; }
    o3Force = { n: a.n, door: a.door, cost: 0 };
    o3DoorOnly = a.door ? a.n.id : null;
    try { o3UseDoorPrev(); } finally { o3Force = null; o3DoorOnly = null; }
    if (V3) { V3.dirty = true; }
    return true;
  }
  var o3UseDoorPrev = typeof v3UseDoor === "function" ? v3UseDoor : function () {};
  if (typeof v3UseDoor === "function") {
    v3UseDoor = function () {
      if (o3UpButton) { return; }                  // the right button, the mouse held: its menu, not a use
      if (o3Force || !V3 || V3.mode !== "walk" || !V3.me || !V3.gl || !V3.gl.mvp || !V3.dragModel) { return o3UseDoorPrev.apply(this, arguments); }
      o3Act(o3Aim(o3RayAt(0, 0)));
    };
  }
  if (typeof useTargets === "function") {
    var useTargetsOpen3d = useTargets;
    useTargets = function () { return o3Force ? [o3Force] : useTargetsOpen3d.apply(this, arguments); };
  }
  // (the door looked at, and no other, for the door's own E)
  if (typeof v3Ground === "function") {
    var v3GroundOpen3d = v3Ground;
    v3Ground = function () {
      var g = v3GroundOpen3d.apply(this, arguments);
      if (o3DoorOnly === null || !g || !g.doors) { return g; }
      var only = g.doors.filter(function (d) { return d.id === o3DoorOnly; });
      return only.length ? Object.assign({}, g, { doors: only }) : g;
    };
  }
  // A click: what the click is on, if it is something to use -- too far off, said so.
  var o3LastUp = null, o3SwallowUp = false, o3UpButton = 0;
  window.addEventListener("pointerup", function (ev) {
    o3LastUp = { clientX: ev.clientX, clientY: ev.clientY, button: ev.button };
    o3UpButton = ev.button || 0;                   // (for as long as this release is being handled)
    if (o3UpButton) { setTimeout(function () { o3UpButton = 0; }, 0); }
    if (o3SwallowUp) { o3SwallowUp = false; ev.stopImmediatePropagation(); }
  }, true);
  if (typeof v3ClickUse === "function") {
    var v3ClickUseOpen3d = v3ClickUse;
    v3ClickUse = function () {
      if (!V3 || V3.mode !== "walk" || !V3.gl || !V3.gl.mvp || !V3.dragModel || !o3LastUp) { return v3ClickUseOpen3d.apply(this, arguments); }
      if (o3LastUp.button) { return true; }        // the right button is the menu's (o3Carry), not a use
      var a = o3Aim(dragRay(o3LastUp));
      if (!a || !a.usable) { return false; }       // nothing to use there: the mouse taken hold of, to look round with
      o3Act(a);
      return true;
    };
  }
  // A screen glows on when it is on -- a hob, an oven, a washer's window are not screens.
  if (typeof useOn === "function") {
    useOn = function (n) { return !!(n && USE_SCREEN[n.kind] && V3 && V3.use && V3.use.on && V3.use.on[n.id]); };
  }
  // Opened, its own model now -- not a box laid over the shut one (40-use3d.js); lit,
  // its own rings and flames -- not a square of glow over it (39-inside.js).
  if (typeof useOpenDraw === "function") {
    var useOpenDrawOpen3d = useOpenDraw;
    useOpenDraw = function (model, n) {
      if (n && MODELS[n.kind] && modelFronts[n.id] && modelsOn()) { return; }
      return useOpenDrawOpen3d.apply(this, arguments);
    };
  }
  if (typeof useScene === "function") {
    var useSceneOpen3d = useScene;
    useScene = function () {
      var U = V3 && V3.use, hid = [];
      if (U && U.on && modelsOn()) {
        hand.nodes.forEach(function (n) { if (U.on[n.id] && O3_HEAT[n.kind] && MODELS[n.kind]) { hid.push(n.id); U.on[n.id] = false; } });
      }
      try { return useSceneOpen3d.apply(this, arguments); }
      finally { hid.forEach(function (id) { U.on[id] = true; }); }
    };
  }

  // ======================================================== the mark in the middle, the cursor ==
  // Walking: a dot in the middle of the view; on something near enough to
  // use, a ring, and under it the key and what it does ("E  Open the
  // drawer  Kitchen counter"); too far, a faint ring and "Move closer".
  function o3Bits() {
    if (!V3 || !V3.box) { return null; }
    var aim = el(".o3-aim", V3.box), tip = el(".o3-tip", V3.box), frame = el(".o3-frame", V3.box);
    if (!frame) {
      frame = document.createElement("div");
      frame.className = "o3-frame";
      frame.setAttribute("aria-hidden", "true");
      frame.hidden = true;
      frame.innerHTML = "<i></i><i></i><i></i><i></i>";
      V3.box.appendChild(frame);
    }
    if (!aim) {
      aim = document.createElement("div");
      aim.className = "o3-aim";
      aim.setAttribute("aria-hidden", "true");
      aim.hidden = true;
      V3.box.appendChild(aim);
    }
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "o3-tip";
      tip.setAttribute("role", "status");
      tip.hidden = true;
      tip.innerHTML = '<kbd></kbd><span class="o3-do"></span><span class="o3-what"></span>';
      V3.box.appendChild(tip);
    }
    return { aim: aim, tip: tip, frame: frame };
  }
  function o3Show(a) {
    var B = o3Bits();
    if (!B) { return; }
    var walking = !!(V3.mode === "walk" && V3.gl && V3.scene !== "space");
    if (B.aim.hidden === walking) { B.aim.hidden = !walking; }
    var state = walking && a && a.usable ? (a.near ? "on" : "far") : "";
    var cls = "o3-aim" + (state ? " " + state : "");
    if (B.aim.className !== cls) { B.aim.className = cls; }
    var verb = state === "on" ? o3Verb(a) : state === "far" ? TXT.o3_closer : "";
    var key = state ? state + "|" + verb + "|" + useName(a.n) : "";
    if (B.tip.dataset.key === key) { return; }
    B.tip.dataset.key = key;
    B.tip.hidden = !key;
    if (!key) { return; }
    var touch = typeof touchFirst === "function" && touchFirst();
    B.tip.classList.toggle("far", state === "far");
    el("kbd", B.tip).textContent = touch || state === "far" ? "" : "E";
    el(".o3-do", B.tip).textContent = verb;
    el(".o3-what", B.tip).textContent = useName(a.n);
  }
  var o3AimSoon = 0;
  if (typeof v3Draw === "function") {
    var v3DrawOpen3d = v3Draw;
    v3Draw = function () {
      var out = v3DrawOpen3d.apply(this, arguments);
      try { o3AfterDraw(); } catch (e) { /* the view without it */ }
      return out;
    };
  }
  // After each picture, walking: what is in the middle of the view, looked
  // at again when the camera has moved -- the camera itself, which eases
  // after the eye (at most every 70 ms, the last look taken as it settles).
  function o3AfterDraw() {
    o3AfterDrawAim();
    try { o3Frame(); } catch (e) { /* the mark alone */ }
  }
  // (2026-10-07, "make it so the selector works better when interacting with things") Corner marks round
  // what E would use -- the very piece, turned as it stands -- put again each picture as the view moves:
  // bright near enough to reach, faint further off. Only the dot and a line of words said it before.
  function o3Frame() {
    var B = o3Bits();
    if (!B) { return; }
    var a = V3.o3Aim, G = V3.gl, m = G && G.mvp, fr = B.frame;
    var rect = V3.mode === "walk" && m && V3.scene !== "space" && a && a.usable ? o3FrameRect(a, m) : null;
    if (!rect) { if (!fr.hidden) { fr.hidden = true; } return; }
    var cls = "o3-frame " + (a.near ? "on" : "far");
    if (fr.className !== cls) { fr.className = cls; }
    fr.style.transform = "translate(" + rect[0].toFixed(1) + "px," + rect[1].toFixed(1) + "px)";
    fr.style.width = rect[2].toFixed(1) + "px";
    fr.style.height = rect[3].toFixed(1) + "px";
    if (fr.hidden) { fr.hidden = false; }
  }
  // Where the piece is in the view: its turned footprint, up its height, each corner as the camera sees it
  // (x, y, width, height in the view's pixels; null if it is behind you or too near to frame)
  function o3FrameRect(a, m) {
    var n = a.n, box = a.box, W = V3.w, H = V3.h, cx = (box[0] + box[1]) / 2, cy = (box[2] + box[3]) / 2, pts = [];
    if (!a.door && n.w && n.h) {
      var t = (n.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), hw = n.w / 2, hd = n.h / 2;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
        pts.push([cx + c * q[0] * hw - s * q[1] * hd, cy + s * q[0] * hw + c * q[1] * hd]);
      });
    } else {
      pts = [[box[0], box[2]], [box[1], box[2]], [box[1], box[3]], [box[0], box[3]]];
    }
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, behind = 0;
    pts.forEach(function (p) {
      [box[4], box[5]].forEach(function (z) {
        var w = m[3] * p[0] + m[7] * p[1] + m[11] * z + m[15];
        if (w < 1e-3) { behind++; return; }
        var sx = ((m[0] * p[0] + m[4] * p[1] + m[8] * z + m[12]) / w + 1) / 2 * W, sy = (1 - (m[1] * p[0] + m[5] * p[1] + m[9] * z + m[13]) / w) / 2 * H;
        if (sx < x0) { x0 = sx; } if (sx > x1) { x1 = sx; } if (sy < y0) { y0 = sy; } if (sy > y1) { y1 = sy; }
      });
    });
    if (behind || x0 === Infinity) { return null; }
    var pad = 6;
    x0 = Math.max(4, x0 - pad); y0 = Math.max(4, y0 - pad); x1 = Math.min(W - 4, x1 + pad); y1 = Math.min(H - 4, y1 + pad);
    if (x1 - x0 < 12 || y1 - y0 < 12 || (x1 - x0 > W * 0.96 && y1 - y0 > H * 0.96)) { return null; }
    return [x0, y0, x1 - x0, y1 - y0];
  }
  function o3AfterDrawAim() {
    if (!V3 || !V3.box) { return; }
    if (V3.mode !== "walk" || !V3.gl || !V3.gl.mvp || V3.scene === "space" || !V3.me) {
      if (V3.o3Aim !== null) { V3.o3Aim = null; o3Show(null); }
      return;
    }
    var now = performance.now(), pose = "";
    for (var i = 0; i < 16; i++) { pose += V3.gl.mvp[i].toFixed(4) + ","; }
    if (pose === V3.o3Pose && now - (V3.o3At || 0) < 400) { return; }
    if (now - (V3.o3At || 0) < 70) {
      clearTimeout(o3AimSoon);
      o3AimSoon = setTimeout(function () { if (V3) { V3.o3At = 0; V3.o3Pose = null; V3.dirty = true; } }, 90);
      return;
    }
    V3.o3Pose = pose;
    V3.o3At = now;
    var a = o3Aim(o3RayAt(0, 0));
    V3.o3Aim = a;
    o3Show(a);
  }
  // The cursor over the view: a hand where a click uses something, the
  // flowchart's move arrows over a piece that can be carried.
  function o3Hover(canvas) {
    var at = 0;
    canvas.addEventListener("pointermove", function (ev) {
      if (!V3 || ev.pointerType === "touch" || document.pointerLockElement === canvas) { return; }
      if (ev.buttons) { canvas.classList.remove("o3-can-use", "o3-can-move"); return; }
      var now = performance.now();
      if (now - at < 60) { return; }
      at = now;
      var use = false, move = false;
      if (V3.gl && V3.gl.mvp && V3.scene !== "space" && !V3.o3Follow && !canvas.classList.contains("v3-carrying")) {
        if (V3.mode === "walk") { var a = o3Aim(dragRay(ev)); use = !!(a && a.usable && a.near); }
        if (!use && !dragView) { move = !!dragPick(ev); }
      }
      canvas.classList.toggle("o3-can-use", use);
      canvas.classList.toggle("o3-can-move", move);
    });
    canvas.addEventListener("pointerleave", function () { canvas.classList.remove("o3-can-use", "o3-can-move"); });
  }

  // ---- the walking hint: for its first three seconds, then gone -------------------------------------
  if (typeof v3Words === "function") {
    var v3WordsOpen3d = v3Words;
    v3Words = function () {
      var out = v3WordsOpen3d.apply(this, arguments);
      try { o3HintFade(); } catch (e) { /* as it was */ }
      return out;
    };
  }
  function o3HintFade() {
    var hint = V3 && V3.box ? el(".v3-hint", V3.box) : null;
    if (!hint) { return; }
    var said = hint.textContent;
    if (hint.dataset.o3Said === said) { return; }       // (said again as it was: still gone)
    hint.dataset.o3Said = said;
    hint.classList.remove("o3-gone");
    clearTimeout(hint.o3Timer);
    hint.o3Timer = setTimeout(function () { hint.classList.add("o3-gone"); }, 3000);
  }

  // ========================================================= a piece taken hold of in 3D ==
  // Carried as before (40-edit3d.js: on the grid, red where it cannot go);
  // a press on it, from above, or the right button anywhere, opens its menu
  // -- the flowchart's own, laid out as Word's (20-menu.js).
  function o3ToPaper() {
    var J = typeof tieHome === "function" && tieHome() && typeof tieLayout === "function" ? tieLayout() : null;
    return function (p) {
      if (!J || !J.any) { return p; }
      var best = null;
      (J.rooms || []).forEach(function (r) {
        var b = J.boxes[r.id];
        if (b && tieIn(b, p[0], p[1]) && (!best || r.w * r.h < best.w * best.h)) { best = r; }
      });
      var d = best ? (J.delta[best.id] || [0, 0]) : [0, 0];
      return [p[0] - d[0], p[1] - d[1]];
    };
  }
  function o3Snap(real, was, put, free) {
    if (free) { return put; }
    var g = EDIT3D_GRID * FLOOR_PX;
    return edit3dFlush(real, [was[0] + Math.round((put[0] - was[0]) / g) * g, was[1] + Math.round((put[1] - was[1]) / g) * g], g / 2);
  }
  function o3Carry(canvas) {
    o3Hover(canvas);
    canvas.addEventListener("pointerdown", function (ev) {
      if (dragView || ev.button !== 0 || ev.shiftKey || !V3 || V3.scene === "space" || !V3.gl || V3.o3Follow) { return; }
      if (document.pointerLockElement === canvas) { return; }
      var hit = dragPick(ev);
      if (!hit) { if (V3.sel) { edit3dPick(null); } return; }
      var real = nodeById(hit.box.node.id), from = dragOnLevel(hit.ray, hit.box.z0);
      if (!real || !from) { return; }
      if (V3.mode === "walk") {                    // walking, what is near enough to use is used by the click
        var a = o3Aim(hit.ray);
        if (a && a.usable && a.near && a.n.id === real.id) { return; }
      }
      ev.preventDefault();
      ev.stopImmediatePropagation();
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      var moved = false, z = hit.box.z0, jn = hit.box.node, startJ = [jn.x, jn.y], was = [real.x, real.y], undoAt = wasLike.length, toPaper = o3ToPaper();
      canvas.classList.add("v3-carrying");
      canvas.classList.remove("o3-can-use", "o3-can-move");
      if (typeof v3Hold === "function") { v3Hold(); }
      function move(e) {
        if (e.pointerId !== ev.pointerId || !V3) { return; }
        var R = dragRay(e), at = R && dragOnLevel(R, z);
        if (!at) { return; }
        var dx = at[0] - from[0], dy = at[1] - from[1];
        if (!moved && Math.hypot(dx, dy) < 3) { return; }
        if (!moved) { keepUndo(); moved = true; closeMenu(); }
        var put = o3Snap(real, was, toPaper([startJ[0] + dx, startJ[1] + dy]), e.altKey);
        real.x = Math.round(put[0]); real.y = Math.round(put[1]);
        V3.carry = { id: real.id, bad: edit3dClash(real) };
        V3.dirty = true;
      }
      function up(e) {
        if (e.pointerId !== ev.pointerId) { return; }
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        canvas.classList.remove("v3-carrying");
        var bad = V3 && V3.carry && V3.carry.bad;
        if (V3) { V3.carry = null; V3.dirty = true; }
        if (!moved) {
          if (V3 && V3.mode !== "walk" && e.type === "pointerup") {
            var x = e.clientX, y = e.clientY;
            edit3dPick(real.id);
            setTimeout(function () { o3Menu(real.id, x, y); }, 0);   // (after the click that would shut it)
          }
          return;
        }
        if (bad) {
          real.x = was[0]; real.y = was[1];
          if (wasLike.length > undoAt) { wasLike.length = undoAt; showUndo(); }
          v3Say(TXT.e3_back);
          return;
        }
        edit3dSaved();
        if (V3) { v3Say(say("dv_moved", { what: labelName(real.kind) })); }
        edit3dPick(real.id);
      }
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
    }, true);
    // the right button: the menu of what is under it -- or, the mouse held to look round, of what is in the middle
    canvas.addEventListener("contextmenu", function (ev) {
      if (!V3 || V3.scene === "space" || !V3.gl || V3.o3Follow) { return; }
      var locked = document.pointerLockElement === canvas, id = null, x = ev.clientX, y = ev.clientY;
      if (locked) {
        var a = V3.o3Aim;
        if (a && a.n && !DRAG_FIXED[a.n.kind] && !WALK_DOORS[a.n.kind]) { id = a.n.id; }
        var r = canvas.getBoundingClientRect();
        x = r.left + r.width / 2 + 16; y = r.top + r.height / 2 + 16;
      } else {
        var hit = dragPick(ev);
        if (hit) { id = hit.box.node.id; }
      }
      var real = id ? nodeById(id) : null;
      if (!real || DRAG_FIXED[real.kind]) { return; }
      ev.preventDefault();
      if (locked) { try { document.exitPointerLock(); } catch (e) { /* let go already */ } }
      edit3dPick(real.id);
      setTimeout(function () { o3Menu(real.id, x, y); }, 0);
    }, true);
  }
  if (typeof dragCarry === "function") { dragCarry = o3Carry; }
  // Picked: the ring round it (40-edit3d.js) -- its bar of buttons is now its menu.
  if (typeof edit3dPick === "function") {
    edit3dPick = function (id) {
      if (!V3) { return; }
      var n = id ? nodeById(id) : null;
      V3.sel = n && !DRAG_FIXED[n.kind] ? id : null;
      V3.dirty = true;
      var bar = V3.box ? el(".v3-picked", V3.box) : null;
      if (bar) { bar.remove(); }
    };
  }

  // ---- its menu ----------------------------------------------------------------------------------------
  if (typeof MENU_ICONS === "object") {
    MENU_ICONS.o3move = '<path d="M10 2.8v14.4M2.8 10h14.4M10 2.8 8 4.8M10 2.8l2 2M10 17.2l-2-2M10 17.2l2-2M2.8 10l2-2M2.8 10l2 2M17.2 10l-2-2M17.2 10l-2 2"/>';
    MENU_ICONS.o3open = '<path d="M4.5 3.5h11v13h-11z"/><path d="M4.5 3.5l5.5 1.8v13l-5.5-1.8"/>';
    MENU_ICONS.o3shut = '<rect x="4.5" y="3.5" width="11" height="13" rx="1"/><path d="M12.4 10h.8"/>';
    MENU_ICONS.o3use = '<path d="M10 3.2v6.2M6.3 5.7a6 6 0 1 0 7.4 0"/>';
  }
  function o3Menu(id, x, y) {
    var real = nodeById(id);
    if (!real || !V3 || !V3.box) { return; }
    edit3dPick(id);
    var fr = modelsOn() ? modelFronts[id] : null, kind = useKind(real), open = !!fr && fr.some(function (f, i) { return o3IsOpen(id, i); });
    var rows = [
      { head: useName(real) },
      { icon: "o3move", name: TXT.o3_m_move, keys: keyName("drag"), go: function () { o3Follow(id); } },
      { icon: "turn", name: TXT.e3_turn, keys: "R", go: function () { edit3dPick(id); edit3dTurn(); } }
    ];
    if (fr && fr.length) { rows.push({ icon: open ? "o3shut" : "o3open", name: open ? TXT.o3_m_close : TXT.o3_m_open, go: function () { o3All(id, !open); } }); }
    if (kind && kind !== "open") { rows.push({ icon: "o3use", name: TXT.o3_m_use, go: function () { o3UseById(id); } }); }
    rows.push("-",
      { icon: "another", name: TXT.m_copy, go: function () { o3Another(id); } },
      { icon: "format", name: TXT.o3_m_format, go: function () { o3Format(id); } },
      "-",
      { icon: "drop", name: TXT.delete, keys: keyName("del"), danger: true, go: function () { edit3dPick(id); edit3dDelete(); } });
    openMenu(x, y, rows, "word");
    var menu = el(".menu.word:not(.out)");
    if (!menu) { return; }
    menu.classList.add("o3-menu");
    // the keys back to the view once it is gone -- walking goes on
    menu.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { setTimeout(o3Refocus, 0); } });
    menu.addEventListener("click", function () { setTimeout(o3Refocus, 0); });
  }
  // Esc shuts the menu first, as on the paper -- not the piece picked (40-edit3d.js), not the view
  window.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape" || !el(".menu.o3-menu:not(.out)")) { return; }
    ev.preventDefault();
    ev.stopImmediatePropagation();
    closeMenu();
    setTimeout(o3Refocus, 0);
  }, true);
  function o3Refocus() {
    if (!V3 || !V3.box || !document.body.contains(V3.box) || el(".menu:not(.out)")) { return; }
    var on = document.activeElement;
    if (on && on.closest && on.closest("input, textarea, select, [contenteditable]")) { return; }
    try { V3.box.focus({ preventScroll: true }); } catch (e) { /* fine */ }
  }
  function o3All(id, open) {
    var fr = modelFronts[id], n = nodeById(id);
    if (!fr) { return; }
    fr.forEach(function (f, i) { if (o3IsOpen(id, i) !== open) { o3Set(id, i, open); } });
    v3Say(say(open ? "us_open" : "us_close", { what: n ? useName(n) : "" }));
  }
  function o3UseById(id) {
    var run = function () { var n = nodeById(id); if (n) { useIt(n); } };
    (typeof tieWith === "function" ? tieWith(run, 1) : run)();
    if (V3) { V3.o3Pose = null; V3.dirty = true; }
  }
  // Another like it, beside it where there is room -- or in front, or behind.
  function o3Another(id) {
    var n = nodeById(id);
    if (!n || !V3) { return; }
    var a = (n.turn || 0) * Math.PI / 180, gap = 0.08 * FLOOR_PX, undoAt = wasLike.length;
    keepUndo();
    var copy = JSON.parse(JSON.stringify(n));
    copy.id = hand.next++;
    hand.nodes.push(copy);
    var put = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) {
      var lx = d[0] * (n.w + gap), ly = d[1] * (n.h + gap);
      copy.x = Math.round(n.x + lx * Math.cos(a) - ly * Math.sin(a));
      copy.y = Math.round(n.y + lx * Math.sin(a) + ly * Math.cos(a));
      return !edit3dClash(copy);
    });
    if (!put) {
      hand.nodes.pop();
      if (wasLike.length > undoAt) { wasLike.length = undoAt; showUndo(); }
      v3Say(TXT.o3_no_room);
      return;
    }
    if (typeof style === "object" && style && style.nodes && style.nodes["h" + id]) {
      style.nodes["h" + copy.id] = JSON.parse(JSON.stringify(style.nodes["h" + id]));
    }
    edit3dSaved();
    edit3dPick(copy.id);
    v3Say(say("o3_made", { what: useName(copy) }));
  }
  // Its finish and design, on the Style side of the panel beside the view
  // (pieceLooks, 39-design.js; 40-designs.js).
  function o3Format(id) {
    if (!nodeById(id)) { return; }
    picked = id; chosen = null;
    if (typeof many !== "undefined") { many = []; }
    try { drawHand(); drawHandPanel(); } catch (e) { /* the panel later */ }
    if (typeof formatPicked === "function") { try { formatPicked(); } catch (e) { /* as it is */ } }
    var fin = el("#sel-body .dz-fin") || el("#sel-card");
    if (fin && fin.scrollIntoView) { fin.scrollIntoView({ block: "nearest" }); }
  }
  // Move: it goes with the pointer, over its floor, on the grid; a click puts it down, Esc leaves it.
  function o3BoxOf(id) {
    var model = V3 && V3.dragModel, lo = null;
    if (!model) { return null; }
    model.faces.forEach(function (f) {
      if (!f.node || f.node.id !== id || !f.pts) { return; }
      f.pts.forEach(function (p) { lo = lo === null ? p[2] : Math.min(lo, p[2]); });
    });
    return lo;
  }
  function o3Follow(id) {
    var real = nodeById(id), canvas = V3 && V3.canvas;
    if (!real || !canvas || V3.o3Follow) { return; }
    try { if (document.pointerLockElement === canvas) { document.exitPointerLock(); } } catch (e) { /* fine */ }
    var z = o3BoxOf(id) || 0, was = [real.x, real.y], undoAt = wasLike.length, moved = false, toPaper = o3ToPaper();
    V3.o3Follow = { id: id };
    edit3dPick(id);
    canvas.classList.add("o3-following");
    v3Say(TXT.o3_m_place);
    function move(e) {
      if (!V3 || !V3.o3Follow) { return; }
      var R = dragRay(e), at = R && dragOnLevel(R, z);
      if (!at) { return; }
      if (!moved) { keepUndo(); moved = true; }
      var put = o3Snap(real, was, toPaper(at), e.altKey);
      real.x = Math.round(put[0]); real.y = Math.round(put[1]);
      V3.carry = { id: real.id, bad: edit3dClash(real) };
      V3.dirty = true;
    }
    function done(keep) {
      canvas.removeEventListener("pointermove", move, true);
      canvas.removeEventListener("pointerdown", down, true);
      window.removeEventListener("keydown", key, true);
      canvas.classList.remove("o3-following");
      var bad = V3 && V3.carry && V3.carry.bad;
      if (V3) { V3.carry = null; V3.o3Follow = null; V3.dirty = true; }
      if (!moved) { return; }
      if (!keep || bad) {
        real.x = was[0]; real.y = was[1];
        if (wasLike.length > undoAt) { wasLike.length = undoAt; showUndo(); }
        if (keep && bad && V3) { v3Say(TXT.e3_back); }
        return;
      }
      edit3dSaved();
      if (V3) { v3Say(say("dv_moved", { what: labelName(real.kind) })); edit3dPick(real.id); }
    }
    function down(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      o3SwallowUp = true;
      done(e.button === 0);
    }
    function key(e) {
      if (!V3 || !V3.o3Follow) { window.removeEventListener("keydown", key, true); return; }
      if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); e.stopImmediatePropagation(); done(e.key === "Enter"); }
    }
    canvas.addEventListener("pointermove", move, true);
    canvas.addEventListener("pointerdown", down, true);
    window.addEventListener("keydown", key, true);
  }
