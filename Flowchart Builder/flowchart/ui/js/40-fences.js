// ---------------------------------------------------------------------------
//  40-fences.js -- fences round a yard: a pool always fenced in, as the
//  codes have it, its gate toward the house; and a backyard fenced, if
//  asked, from the sides of the house round the back of the lot, with a
//  gate where a path goes through
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (my own, 2026-10-03: a pool with nothing round it, a yard open to the
  // street)  A fence is the picket fence there was (i_fence), in lengths;
  // a gate is its own piece, posts and a leaf that opens.
  var PF_GATE = 1.2;                   // m: a gate's width, posts and all
  var PF_POOL = 0.9;                   // m: a pool's fence this far out from its edge
  var PF_IN = 0.3;                     // m: a lot's fence this far in from its line
  if (!YARD_OF.fence) { var pfY = ["fence", ["i_fence"], null, "back"]; YARD_KINDS.push(pfY); YARD_OF.fence = pfY; }
  if (typeof V3_HIGH === "object") { V3_HIGH.i_gate = 1.2; }
  if (typeof TERR_DRAPE === "object") { TERR_DRAPE.i_gate = true; }
  // (a name over every length of fence round a yard: only the clutter of them)
  if (typeof NO_LABEL === "object") { NO_LABEL.i_fence = true; NO_LABEL.i_gate = true; }
  if (typeof FX_HOLD === "object") { FX_HOLD.i_gate = 2500; }
  if (typeof FX_MASS === "object") { FX_MASS.i_gate = 30; }

  // A run of fence from a to b (the lot's numbers), and a gate in it at
  // `gate` (0..1 along it) if wanted: lengths either side, the gate between.
  function pfRun(F, a, b, gate, key) {
    var P = F.P, len = Math.hypot(b[0] - a[0], b[1] - a[1]), out = [];
    if (len < 0.4 * P) { return out; }
    var ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len, turn = Math.atan2(uy, ux) * 180 / Math.PI, gw = PF_GATE * P;
    function piece(kind, s0, s1) {
      if (s1 - s0 < 0.3 * P) { return; }
      var m = (s0 + s1) / 2, n = ybPut(F, kind, a[0] + ux * m, a[1] + uy * m, turn);
      n.w = Math.round(s1 - s0); n.h = kind === "i_gate" ? 10 : 8; n.yard = key;
      out.push(n);
    }
    if (gate === null || gate === undefined || len < gw + 0.8 * P) { piece("i_fence", 0, len); return out; }
    var g0 = Math.max(0.2 * P, Math.min(len - gw - 0.2 * P, gate * len - gw / 2));
    piece("i_fence", 0, g0);
    piece("i_gate", g0, g0 + gw);
    piece("i_fence", g0 + gw, len);
    return out;
  }
  // Where a path or a walk crosses a run, if one does (0..1 along it).
  function pfCrossing(F, a, b) {
    var P = F.P, len = Math.hypot(b[0] - a[0], b[1] - a[1]), best = null;
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_path" || best !== null) { return; }
      var q = F.box(n), steps = Math.ceil(len / (0.3 * P));
      for (var i = 1; i < steps && best === null; i++) {
        var t = i / steps, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
        if (x > q.l && x < q.r && y > q.t && y < q.b) { best = t; }
      }
    });
    return best;
  }
  // whether a run goes through anything standing out of doors (not a path, a drive, the lawn)
  function pfBlocked(F, a, b) {
    var P = F.P, len = Math.hypot(b[0] - a[0], b[1] - a[1]), steps = Math.max(2, Math.ceil(len / (0.4 * P)));
    var stands = hand.nodes.filter(function (n) {
      return ybStands(F, n) && n.kind !== "i_path" && n.kind !== "i_driveway" && n.kind !== "i_fence" && n.kind !== "i_gate" && !LIES_FLAT[n.kind] && n.kind !== "i_lot";
    }).map(function (n) { return F.box(n, 0.1 * P); });
    for (var i = 0; i <= steps; i++) {
      var t = i / steps, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      if (F.inHouse(x, y) && i > 0 && i < steps) { return true; }
      if (stands.some(function (q) { return x > q.l && x < q.r && y > q.t && y < q.b; })) { return true; }
    }
    return false;
  }
  // The backyard: along the back of the lot, up both sides to halfway along
  // the house, and in to the house's sides -- a gate in one side's run in,
  // where a path crosses it, or else on the side with more room.
  function pfYard(H) {
    var F = ybFrame(H), P = F.P, L = F.L, hb = F.hb, m = PF_IN * P, put = 0;
    if (!F.house.length || hb.l === Infinity) { return 0; }
    var x0 = L.l + m, x1 = L.r - m, yb = L.t + m;
    // (in to the house a little behind its middle: clear of what stands by its sides, if it can be)
    var yj = null;
    [0.45, 0.3, 0.6, 0.15, 0.75].some(function (k) {
      var y = hb.t + (hb.b - hb.t) * k;
      if (!pfBlocked(F, [x0, y], [hb.l, y]) && !pfBlocked(F, [hb.r, y], [x1, y])) { yj = y; return true; }
      return false;
    });
    if (yj === null) { yj = hb.t + (hb.b - hb.t) * 0.45; }
    if (yb >= yj - 1 * P) { return 0; }
    var left = [[x0, yj], [hb.l, yj]], right = [[hb.r, yj], [x1, yj]];
    var cl = pfCrossing(F, left[0], left[1]), cr = pfCrossing(F, right[0], right[1]);
    var gateLeft = cl !== null ? cl : cr !== null ? null : (hb.l - x0 >= x1 - hb.r ? 0.5 : null);
    var gateRight = cl === null && (cr !== null || gateLeft === null) ? (cr !== null ? cr : 0.5) : null;
    [pfRun(F, [x0, yb], [x1, yb], null, "fence"), pfRun(F, [x0, yb], [x0, yj], null, "fence"), pfRun(F, [x1, yb], [x1, yj], null, "fence"),
     pfRun(F, left[0], left[1], gateLeft, "fence"), pfRun(F, right[0], right[1], gateRight, "fence")].forEach(function (r) { put += r.length; });
    return put;
  }
  // A pool's fence: all round it, a little out from its edge, the gate on
  // the side toward the house.
  function pfPool(H, pool, key) {
    var F = ybFrame(H), P = F.P, q = F.box(pool, PF_POOL * P), hb = F.hb, put = 0;
    var c = [(q.l + q.r) / 2, (q.t + q.b) / 2], hc = [(hb.l + hb.r) / 2, (hb.t + hb.b) / 2];
    var dx = hc[0] - c[0], dy = hc[1] - c[1], side = Math.abs(dx) * (q.b - q.t) > Math.abs(dy) * (q.r - q.l) ? (dx < 0 ? "l" : "r") : (dy < 0 ? "t" : "b");
    [["t", [q.l, q.t], [q.r, q.t]], ["r", [q.r, q.t], [q.r, q.b]], ["b", [q.r, q.b], [q.l, q.b]], ["l", [q.l, q.b], [q.l, q.t]]].forEach(function (s) {
      put += pfRun(F, s[1], s[2], s[0] === side ? 0.5 : null, key).length;
    });
    return put;
  }
  if (typeof yardPut === "function") {
    var yardPutFences = yardPut;
    yardPut = function (key, houses) {
      if (key === "fence") {
        var n = 0;
        (houses || yardHouses()).forEach(function (H) { try { n += pfYard(H); } catch (e) { /* that yard open */ } });
        return n;
      }
      var before = {};
      hand.nodes.forEach(function (m) { before[m.id] = true; });
      var got = yardPutFences.apply(this, arguments);
      // (a pool put in: fenced in with it, taken away with it)
      try {
        var pools = hand.nodes.filter(function (m) { return m.kind === "i_pool" && !before[m.id]; });
        if (pools.length) {
          (houses || yardHouses()).forEach(function (H) {
            pools.forEach(function (p) { if (!H.lot || insideArea(H.lot, p.x, p.y)) { pfPool(H, p, p.yard || key); } });
          });
        }
      } catch (e) { /* the pool unfenced */ }
      return got;
    };
  }
  // The gate in 3D: two posts, and the leaf between, framed, braced, its pickets and its latch.
  if (typeof mDef === "function") {
    mDef("i_gate", function (M, W, D, H, C) {
      C = mPick(C, "#f2f0ea");
      var paint = M.mat("plastic", C.main), metal = M.mat("metal", "#3b3f44"), post = 9 * cm, x0 = -W / 2 + post, x1 = W / 2 - post;
      [-W / 2, W / 2 - post].forEach(function (x) {
        M.box(x, x + post, -post / 2, post / 2, 0, H + 12 * cm, paint);
        M.box(x - 1 * cm, x + post + 1 * cm, -post / 2 - 1 * cm, post / 2 + 1 * cm, H + 12 * cm, H + 16 * cm, paint, 1 * cm);
      });
      // the leaf: a frame a little off the ground, a brace corner to corner
      var g = 1.5 * cm, lo = 8 * cm, hi = H - 2 * cm;
      M.box(x0 + g, x1 - g, -2 * cm, 2 * cm, lo, lo + 8 * cm, paint);
      M.box(x0 + g, x1 - g, -2 * cm, 2 * cm, hi - 8 * cm, hi, paint);
      M.box(x0 + g, x0 + g + 8 * cm, -2 * cm, 2 * cm, lo, hi, paint);
      M.box(x1 - g - 8 * cm, x1 - g, -2 * cm, 2 * cm, lo, hi, paint);
      var bx = (x1 - x0) / 2, by = (hi - lo) / 2;
      M.tube([x0 + g + 8 * cm, 0, lo + 8 * cm], [x1 - g - 8 * cm, 0, hi - 8 * cm], 2.5 * cm, paint, 6);
      for (var x = x0 + 18 * cm; x < x1 - 14 * cm; x += 12 * cm) { M.box(x - 4 * cm, x + 4 * cm, 2 * cm, 4 * cm, lo + 4 * cm, hi - 4 * cm, paint); }
      // its latch, on the far side from its hinges
      M.box(x1 - g - 14 * cm, x1 - g - 4 * cm, 4 * cm, 7 * cm, H * 0.62, H * 0.62 + 4 * cm, metal);
      void bx; void by;
    });
  }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.yd_fence = '<path d="M2.6 16.6h14.8M3.6 16.6V6.4l1.4-1.8 1.4 1.8v10.2M8.6 16.6V6.4L10 4.6l1.4 1.8v10.2M13.6 16.6V6.4l1.4-1.8 1.4 1.8v10.2M2.6 9.4h14.8M2.6 13.4h14.8"/>';
  }
