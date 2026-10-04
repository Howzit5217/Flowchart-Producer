// ---------------------------------------------------------------------------
//  40-parking.js -- a parking lot: paved, its stalls lined, wheel stops at
//  their heads, cars in most, a drive out to the street; round a block of
//  flats on every side it has room, the block set back for it; a pavilion
//  and a basketball court for the grounds
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "for parking things there needs to be a parking
  // lot for the cars and to add options for what there could be like
  // pavilions things like that and also for an apartment complex parking
  // should be all around and it should be set back from the street more due
  // to that and the should be multiple exists in case of a fire")

  // ---- the stalls -----------------------------------------------------------------------------
  // 2.6 m wide, 5.5 m deep, along the lot's length; two rows facing over a
  // 6.6 m aisle where it is deep enough, else one row and its aisle.
  // (the plan's picture and the 3D's both from this, 03-icon-art.js)
  function parkLayout(w, h) {
    var P = FLOOR_PX, sw = 2.6 * P, sd = 5.5 * P, aisle = 6.6 * P, rows = [];
    var n = Math.max(1, Math.floor((w + 1) / sw)), x0 = (w - n * sw) / 2;
    if (h >= 2 * sd + aisle - 2) { rows.push({ y0: 0, y1: sd, head: -1 }, { y0: h - sd, y1: h, head: 1 }); }
    else { rows.push({ y0: 0, y1: Math.min(h, sd), head: -1 }); }
    var stalls = [];
    rows.forEach(function (r) {
      for (var i = 0; i < n; i++) { stalls.push({ x: x0 + (i + 0.5) * sw, y: (r.y0 + r.y1) / 2, w: sw, h: r.y1 - r.y0, head: r.head }); }
    });
    var aisleY = rows.length > 1 ? [sd, h - sd] : [Math.min(h, sd), h];
    return { n: n, sw: sw, sd: sd, x0: x0, rows: rows, stalls: stalls, aisle: aisleY };
  }
  if (typeof LIES_FLAT === "object") { LIES_FLAT.i_parking = true; LIES_FLAT.i_court = true; }
  if (typeof TERR_DRAPE === "object") { TERR_DRAPE.i_parking = true; TERR_DRAPE.i_court = true; }
  if (typeof V3_HIGH === "object") { Object.assign(V3_HIGH, { i_parking: 0.02, i_court: 0.03, i_pavilion: 3.6 }); }
  if (typeof WALK_DO === "object") { Object.assign(WALK_DO, { i_pavilion: 1400 }); }
  if (typeof mDef === "function") {
    // the lot: asphalt, white lines between the stalls, a concrete stop at each head
    mDef("i_parking", function (M, W, D, H, C) {
      C = mPick(C, "#3c3e41", "#f2f1ec");
      var t = Math.max(H, 1.5 * cm), paint = M.mat("plastic", C.frame), stop = M.mat("concrete", "#bdbab2");
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, t, M.mat("concrete", C.main));
      var S = parkLayout(W, D);
      S.rows.forEach(function (r) {
        for (var i = 0; i <= S.n; i++) {
          var x = -W / 2 + S.x0 + i * S.sw;
          M.box(x - 5 * cm, x + 5 * cm, -D / 2 + r.y0, -D / 2 + r.y1, t, t + 0.4 * cm, paint);
        }
        for (var k = 0; k < S.n; k++) {
          var cx = -W / 2 + S.x0 + (k + 0.5) * S.sw, hy = r.head < 0 ? -D / 2 + r.y0 + 60 * cm : -D / 2 + r.y1 - 60 * cm;
          M.box(cx - 90 * cm, cx + 90 * cm, hy - 8 * cm, hy + 8 * cm, t, t + 12 * cm, stop, 2 * cm);
        }
      });
      // the aisle's arrows, one each way
      var ay = -D / 2 + (S.aisle[0] + S.aisle[1]) / 2;
      [-1, 1].forEach(function (s) {
        var ax = s * W / 4;
        M.box(ax - 70 * cm, ax + 70 * cm, ay - 6 * cm, ay + 6 * cm, t, t + 0.4 * cm, paint);
        M.box(ax + s * 50 * cm - 6 * cm, ax + s * 50 * cm + 6 * cm, ay - 30 * cm, ay + 30 * cm, t, t + 0.4 * cm, paint);
      });
    });
    // a pavilion: a slab, six posts, a hipped roof, picnic tables under it
    mDef("i_pavilion", function (M, W, D, H, C) {
      C = mPick(C, "#7a5a3e", "#5a3f2e");
      var wood = M.mat("wood", C.main), roof = M.mat("plastic", "#4a4d50"), top = H * 0.62;
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 12 * cm, M.mat("concrete", "#c4c0b7"));
      [-1, 0, 1].forEach(function (i) {
        [-1, 1].forEach(function (j) {
          var x = i * (W / 2 - 25 * cm), y = j * (D / 2 - 25 * cm);
          M.box(x - 9 * cm, x + 9 * cm, y - 9 * cm, y + 9 * cm, 12 * cm, top, wood);
        });
      });
      [-1, 1].forEach(function (j) { M.box(-W / 2 + 10 * cm, W / 2 - 10 * cm, j * (D / 2 - 25 * cm) - 8 * cm, j * (D / 2 - 25 * cm) + 8 * cm, top - 25 * cm, top, wood); });
      var o = 45 * cm, x0 = -W / 2 - o, x1 = W / 2 + o, y0 = -D / 2 - o, y1 = D / 2 + o, rx = Math.max(0, (W - D) / 2);
      M.quad(roof, [x0, y0, top], [x1, y0, top], [rx, 0, H], [-rx, 0, H]);
      M.quad(roof, [x1, y1, top], [x0, y1, top], [-rx, 0, H], [rx, 0, H]);
      M.tri(roof, [x0, y1, top], [x0, y0, top], [-rx, 0, H], [-1, 0, 1], [-1, 0, 1], [-1, 0, 1]);
      M.tri(roof, [x1, y0, top], [x1, y1, top], [rx, 0, H], [1, 0, 1], [1, 0, 1], [1, 0, 1]);
      var table = M.mat("wood", "#9c7652");
      [-1, 0, 1].forEach(function (i) {
        var x = i * W * 0.3;
        M.box(x - 90 * cm, x + 90 * cm, -40 * cm, 40 * cm, 72 * cm, 77 * cm, table);
        [-1, 1].forEach(function (s) {
          M.box(x - 90 * cm, x + 90 * cm, s * 70 * cm - 14 * cm, s * 70 * cm + 14 * cm, 42 * cm, 46 * cm, table);
          M.box(x - 70 * cm, x - 64 * cm, -70 * cm, 70 * cm, 12 * cm, 72 * cm, table);
          M.box(x + 64 * cm, x + 70 * cm, -70 * cm, 70 * cm, 12 * cm, 72 * cm, table);
        });
      });
    });
    // half a basketball court: its slab, its lines, the hoop on its post
    mDef("i_court", function (M, W, D, H, C) {
      C = mPick(C, "#5d7f93", "#f4f2ec");
      var t = Math.max(H, 2 * cm), paint = M.mat("plastic", C.frame), y0 = -D / 2;
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, t, M.mat("concrete", C.main));
      function line(xa, ya, xb, yb) {
        var len = Math.hypot(xb - xa, yb - ya);
        if (Math.abs(ya - yb) < 1) { M.box(Math.min(xa, xb), Math.max(xa, xb), ya - 3 * cm, ya + 3 * cm, t, t + 0.4 * cm, paint); }
        else if (Math.abs(xa - xb) < 1) { M.box(xa - 3 * cm, xa + 3 * cm, Math.min(ya, yb), Math.max(ya, yb), t, t + 0.4 * cm, paint); }
        else {
          var n = Math.max(1, Math.round(len / (15 * cm)));
          for (var i = 0; i < n; i++) {
            var px = xa + (xb - xa) * (i + 0.5) / n, py = ya + (yb - ya) * (i + 0.5) / n;
            M.box(px - 4 * cm, px + 4 * cm, py - 4 * cm, py + 4 * cm, t, t + 0.4 * cm, paint);
          }
        }
      }
      // the edge, the key, the free-throw circle's front, the three-point arc
      line(-W / 2 + 5 * cm, y0 + 5 * cm, W / 2 - 5 * cm, y0 + 5 * cm); line(-W / 2 + 5 * cm, D / 2 - 5 * cm, W / 2 - 5 * cm, D / 2 - 5 * cm);
      line(-W / 2 + 5 * cm, y0, -W / 2 + 5 * cm, D / 2); line(W / 2 - 5 * cm, y0, W / 2 - 5 * cm, D / 2);
      var kw = Math.min(W * 0.33, 490 * cm) / 2, kd = Math.min(D * 0.4, 580 * cm);
      line(-kw, y0, -kw, y0 + kd); line(kw, y0, kw, y0 + kd); line(-kw, y0 + kd, kw, y0 + kd);
      var R3 = Math.min(W / 2 - 30 * cm, 675 * cm), hoopY = y0 + 160 * cm;
      for (var a = 0; a < 24; a++) {
        var a0 = Math.PI * a / 24, a1 = Math.PI * (a + 1) / 24;
        line(-Math.cos(a0) * R3, hoopY + Math.sin(a0) * R3, -Math.cos(a1) * R3, hoopY + Math.sin(a1) * R3);
      }
      // the post, the board, the rim
      var steel = M.mat("metal", "#3b3e42");
      M.box(-8 * cm, 8 * cm, y0 - 60 * cm, y0 - 44 * cm, 0, 330 * cm, steel);
      M.box(-8 * cm, 8 * cm, y0 - 60 * cm, y0 + 40 * cm, 316 * cm, 326 * cm, steel);
      M.box(-90 * cm, 90 * cm, y0 + 40 * cm, y0 + 44 * cm, 280 * cm, 385 * cm, M.mat("glass", "#e8eef2"));
      M.lathe(0, y0 + 67 * cm, [[23 * cm, 305 * cm], [23 * cm, 307 * cm]], M.mat("metal", "#e0662a"), { seg: 16, top: false });
    });
  }

  // ---- put down: lots round the building, as many stalls as it wants ---------------------------
  // How many: a flat's one and a half; a shop's, an office's, a school's
  // as big as it is.
  function parkWanted(type, rooms) {
    var P = FLOOR_PX, flats = rooms.filter(function (r) { return r.use === "flat" || /^(Apt|Wohnung|Apto|Appt)/i.test(String(r.text || "")); }).length;
    var area = rooms.reduce(function (m, r) { return m + r.w * r.h / (P * P); }, 0);
    if (type === "apartments" || type === "condos") { return Math.max(8, Math.ceil(flats * 1.5)); }
    if (type === "office") { return Math.max(10, Math.ceil(area / 30)); }
    if (type === "school") { return Math.max(16, Math.ceil(area / 45)); }
    if (type === "shop" || type === "boutique" || type === "cafe") { return Math.max(8, Math.ceil(area / 25)); }
    return 8;
  }
  // The lots go round the building as a ring: a row of stalls along the
  // lot's edge on each side there is room, the aisle between them and the
  // building -- the side ones reaching to the front and back ones, so the
  // aisles meet at the corners -- and a way in from the street through a
  // gap in the front row.  Each trimmed at its ends off whatever is there.
  // (in as many pieces as what is in the way leaves: a way out of a door
  // kept clear across it)
  function parkPiece(F, b, along, turn, rnd) {
    var P = F.P, step = 0.65 * P, len = along ? b.r - b.l : b.b - b.t, runs = [], run = null, got = 0;
    for (var a = 0; a + step <= len + 1; a += step) {
      var sl = along ? { l: b.l + a, r: b.l + a + step, t: b.t, b: b.b } : { l: b.l, r: b.r, t: b.t + a, b: b.t + a + step };
      if (ybClear(F, sl, -2)) { if (!run) { run = [a, a + step]; runs.push(run); } else { run[1] = a + step; } } else { run = null; }
    }
    runs.forEach(function (r) {
      if (r[1] - r[0] < 2 * 2.6 * P) { return; }
      got += parkPlace(F, along ? { l: b.l + r[0], r: b.l + r[1], t: b.t, b: b.b } : { l: b.l, r: b.r, t: b.t + r[0], b: b.t + r[1] }, along, turn, rnd);
    });
    return got;
  }
  function parkPlace(F, b, along, turn, rnd) {
    var w = along ? b.r - b.l : b.b - b.t, h = along ? b.b - b.t : b.r - b.l;
    var lotN = ybPut(F, "i_parking", (b.l + b.r) / 2, (b.t + b.b) / 2, turn);
    lotN.w = Math.round(w); lotN.h = Math.round(h); lotN.own = true; lotN.yard = "parking";
    var S = parkLayout(w, h), t = turn * Math.PI / 180;
    // cars in most of the stalls, nose in
    S.stalls.forEach(function (st) {
      if (rnd() > 0.68) { return; }
      var lx = st.x - w / 2, ly = st.y - h / 2;
      var car = ybPut(F, "i_parked", (b.l + b.r) / 2 + lx * Math.cos(t) - ly * Math.sin(t), (b.t + b.b) / 2 + lx * Math.sin(t) + ly * Math.cos(t), turn + (st.head < 0 ? 0 : 180));
      car.yard = "parking";
    });
    return S.stalls.length;
  }
  function parkAround(H, type, sides) {
    var F = ybFrame(H), P = F.P;
    if (!F.house.length) { return 0; }
    ybZones(F, ybDoors(F));
    var hb = F.hb, L = F.L, m = 0.8 * P, deep = (5.5 + 6.6) * P, gF = 2.5 * P, gB = 1.6 * P, got = 0;
    // (each stall its own throw, from where it is: the same lot, the same cars)
    var seed = Math.round(Math.abs(F.lot.x) * 3 + Math.abs(F.lot.y) * 7), k = 0;
    var rnd = function () { var v = Math.sin(seed * 0.0137 + (++k) * 12.9898) * 43758.5453; return v - Math.floor(v); };
    var has = { front: sides.indexOf("front") >= 0 && hb.b + gF + deep <= L.b - m, back: sides.indexOf("back") >= 0 && hb.t - gB - deep >= L.t + m,
                left: sides.indexOf("left") >= 0 && hb.l - gB - deep >= L.l + m, right: sides.indexOf("right") >= 0 && hb.r + gB + deep <= L.r - m };
    var x0 = has.left ? hb.l - gB - deep : Math.max(L.l + m, hb.l - 4 * P), x1 = has.right ? hb.r + gB + deep : Math.min(L.r - m, hb.r + 4 * P);
    if (has.front) {
      // the way in a third of the way along, the row either side of it
      var y0 = hb.b + gF, dw = 6.5 * P, entry = x0 + (x1 - x0) * 0.3;
      got += parkPiece(F, { l: x0, r: entry - dw / 2, t: y0, b: y0 + deep }, true, 180, rnd);
      got += parkPiece(F, { l: entry + dw / 2, r: x1, t: y0, b: y0 + deep }, true, 180, rnd);
      var drv = ybPut(F, "i_driveway", entry, (y0 + L.b) / 2, 0);
      drv.w = Math.round(dw - 0.5 * P); drv.h = Math.round(L.b - y0); drv.yard = "parking";
    }
    if (has.back) { got += parkPiece(F, { l: x0, r: x1, t: hb.t - gB - deep, b: hb.t - gB }, true, 0, rnd); }
    var yt = has.back ? hb.t - gB : hb.t, yb = has.front ? hb.b + gF : hb.b;
    if (has.left) { got += parkPiece(F, { l: hb.l - gB - deep, r: hb.l - gB, t: yt, b: yb }, false, 270, rnd); }
    if (has.right) { got += parkPiece(F, { l: hb.r + gB, r: hb.r + gB + deep, t: yt, b: yb }, false, 90, rnd); }
    // (no front lot: a drive from a side one out to the street)
    if (!has.front && (has.left || has.right) && got) {
      var sx = has.right ? hb.r + gB + 3.3 * P : hb.l - gB - 3.3 * P, sy0 = hb.b;
      if (L.b - sy0 > 0.5 * P) {
        var sd = ybPut(F, "i_driveway", sx, (sy0 + L.b) / 2, 0);
        sd.w = Math.round(6 * P); sd.h = Math.round(L.b - sy0); sd.yard = "parking";
      }
    }
    return got;
  }
  // The grounds' Parking (40-grounds.js): a lot, not a row of cars.
  if (typeof yardPut === "function") {
    var yardPutCars = yardPut;
    yardPut = function (key, houses) {
      if (key !== "parking") { return yardPutCars.apply(this, arguments); }
      var put = 0, type = parkTypeNow();
      (houses || yardHouses()).forEach(function (H) {
        var got = 0;
        try { got = parkAround(H, type, type === "apartments" || type === "condos" ? ["front", "left", "right", "back"] : ["front", "right", "left"]); } catch (e) { got = 0; }
        put += got || yardPutCars("parking", [H]);
      });
      return put;
    };
  }
  var parkType = null;
  function parkTypeNow() {
    if (parkType) { return parkType; }
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, b) { return b.id - a.id; });
    return marks.length ? marks[0].madeWith.type || "house" : "house";
  }
  // A block of flats always has its parking, all round (40-outside.js's
  // everyday things for the rest).
  if (typeof ybBasics === "function") {
    var ybBasicsPark = ybBasics;
    ybBasics = function (want, made) {
      var type = (want && want.type) || "house";
      parkType = type;
      try {
        if ((type === "apartments" || type === "condos") && !(want.yard && want.yard.parking) && !want.spread) {
          var lot = (made || []).filter(function (n) { return n.kind === "i_lot"; })[0];
          yardHouses().filter(function (H) { return lot && (H.lot === lot || H.lot.id === lot.id); }).forEach(function (H) {
            parkAround(H, type, ["front", "left", "right", "back"]);
          });
        }
        return ybBasicsPark.apply(this, arguments);
      } finally { parkType = null; }
    };
  }
  // ---- its lot: set back for the parking --------------------------------------------------------
  // A block of flats' lot grown so the lots go round it: deep enough in
  // front for two rows and a lawn, one row each side and behind.
  if (typeof STARTER_WRAPS === "object") {
    STARTER_WRAPS.unshift(function* (inner, want) {
      var out = yield* inner(want);
      if (want.type !== "apartments" && want.type !== "condos") { return out; }
      try {
        var made = (starterLast || []).map(function (o) { return o.room; }).filter(Boolean), floors = floorsOf(), P = FLOOR_PX;
        var ground = made.filter(function (r) { var f = floors.length ? floorAt(floors, r.x, r.y) : null; return !f || f.level === 0; });
        if (!ground.length) { return out; }
        var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
        ground.forEach(function (r) { var q = tieBox(r); b.l = Math.min(b.l, q.l); b.r = Math.max(b.r, q.r); b.t = Math.min(b.t, q.t); b.b = Math.max(b.b, q.b); });
        var lot = hand.nodes.filter(function (n) { return n.kind === "i_lot" && !(n.turn || 0) && insideArea(n, (b.l + b.r) / 2, (b.t + b.b) / 2); })[0];
        if (!lot) { return out; }
        var side = (5.5 + 6.6 + 1.6 + 1.0) * P, front = (2 * 5.5 + 6.6 + 2.5 + 4.0) * P, back = (5.5 + 6.6 + 1.6 + 1.5) * P;
        var l = Math.min(lot.x - lot.w / 2, b.l - side), r = Math.max(lot.x + lot.w / 2, b.r + side);
        var t = Math.min(lot.y - lot.h / 2, b.t - back), bt = Math.max(lot.y + lot.h / 2, b.b + front);
        lot.w = Math.round(r - l); lot.h = Math.round(bt - t); lot.x = Math.round((l + r) / 2); lot.y = Math.round((t + bt) / 2);
        lot.own = true;
      } catch (e) { /* the lot as drawn */ }
      return out;
    });
  }

  // ---- more for the grounds: a pavilion, a court -------------------------------------------------
  if (typeof YARD_KINDS === "object" && typeof YARD_OF === "object") {
    [["pavilion", ["i_pavilion"], null, "back"], ["court", ["i_court"], null, "back"]].forEach(function (Y) {
      if (!YARD_OF[Y[0]]) { YARD_KINDS.push(Y); YARD_OF[Y[0]] = Y; }
    });
  }
  if (typeof GROUNDS_FOR === "object") {
    ["flats", "office", "school", "eat"].forEach(function (k) { if (GROUNDS_FOR[k] && GROUNDS_FOR[k].indexOf("pavilion") < 0) { GROUNDS_FOR[k].push("pavilion"); } });
    ["flats", "school", "home"].forEach(function (k) { if (GROUNDS_FOR[k] && GROUNDS_FOR[k].indexOf("court") < 0) { GROUNDS_FOR[k].push("court"); } });
  }
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      yd_pavilion: '<path d="M2 9 10 4l8 5z"/><path d="M4 9v7.4M16 9v7.4M10 9v7.4M6.4 13.4h7.2M2.6 16.6h14.8"/>',
      yd_court: '<rect x="2.6" y="3" width="14.8" height="14" rx="1"/><path d="M7 3v5.6h6V3M5 3a5 5 0 0 0 10 0M10 17v-3"/><circle cx="10" cy="5" r="1"/>'
    });
  }
