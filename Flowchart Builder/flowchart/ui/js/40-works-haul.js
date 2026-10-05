// ---------------------------------------------------------------------------
//  40-works-haul.js -- what is brought in rolls in: boxes and appliances on
//  hand trucks, heavy furniture on dollies, soil and mulch in wheelbarrows,
//  pallets driven off a flatbed by the forklift that rides on its back
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "update it so when the workers bring things in they
  // can use dollies, forklifts, the works")
  //
  // The workers' loads (40-works.js wkCarryDraw) gain two that roll: a hand
  // truck stacked with boxes ("truck") and a wheelbarrow ("barrow", of soil,
  // mulch, gravel ...), pushed with the hands low (40-bodies.js's "push").
  // The movers (40-movein.js) wheel an appliance in leaned back on a hand
  // truck and a dresser or a wardrobe on a dolly -- carried still up and
  // down stairs, a dolly being no good on them.  And a delivery: a flatbed at
  // the kerb with pallets on it, its forklift down off its back, each pallet
  // lifted off and driven into the yard, the forklift back up on it after.
  var WH_RED = "#c23a2a", WH_STEEL = "#3a3d40", WH_RUBBER = "#1b1b1d", WH_CARD = "#b98a56";
  var WH_LOADS = { soil: "#4f3a2a", mulch: "#7a4a2a", gravel: "#9a968e", concrete: "#9c9a94", sand: "#c9b48a", sod: "#5f8a3a" };
  var WH_LEAN = 6;                       // degrees: a hand truck's lean made in steps of this
  var WH_TRUCK_LEAN = 30;                // degrees back, wheeled
  var WH_DECK = 1.25;                    // m: a flatbed's deck off the road (40-works-mach.js's ramp)
  var WH_TRUCKED = { i_fridge: 1, i_washer: 1, i_dryer: 1, i_dishwasher: 1, i_stove: 1, i_oven: 1, i_freezer: 1, i_waterheater: 1 };
  var WH_DOLLIED = { i_dresser: 1, i_chest: 1, i_wardrobe: 1, i_bookcase: 1, i_cabinet: 1, i_sideboard: 1, i_piano: 1, i_desk: 1, i_tvstand: 1 };

  // ---- the hand truck: two wheels, a nose plate under the load, its rails up the back to the grip ----------
  // (its own numbers: the nose to +x, the axle at x 0; leaned back about the axle, boxes on it if given)
  function whTruckModel(lean, n, size) {
    var step = Math.round(lean / WH_LEAN) * WH_LEAN, nb = n || 0, sz = Math.round((size || 0.45) * 20) / 20;
    return moModel("wh-truck|" + step + "|" + nb + "|" + sz, function (M, m) {
      var red = M.mat("lacquer", WH_RED), steel = M.mat("metal", WH_STEEL), tire = M.mat("rubber", WH_RUBBER), card = M.mat("plastic", WH_CARD);
      M.push().move(0, 0, 0.13 * m).tiltY(-step).move(0, 0, -0.13 * m);
      [-1, 1].forEach(function (s) {
        M.push().move(-0.04 * m, s * 0.22 * m, 0.13 * m).tiltX(90);
        M.cyl(0, 0, -0.035 * m, 0.035 * m, 0.13 * m, tire, { seg: 14, bottom: true });
        M.cyl(0, 0, 0.035 * m, 0.042 * m, 0.06 * m, steel, { seg: 8 });
        M.pop();
        M.tube([0, s * 0.17 * m, 0.03 * m], [0, s * 0.17 * m, 1.18 * m], 0.016 * m, red, 8);
        M.tube([0, s * 0.17 * m, 1.18 * m], [-0.13 * m, s * 0.17 * m, 1.3 * m], 0.016 * m, red, 8);
      });
      M.tube([-0.13 * m, -0.19 * m, 1.3 * m], [-0.13 * m, 0.19 * m, 1.3 * m], 0.02 * m, M.mat("rubber", "#2b2b2e"), 8);   // the grip
      [0.42, 0.8].forEach(function (z) { M.tube([0, -0.17 * m, z * m], [0, 0.17 * m, z * m], 0.012 * m, red, 6); });
      M.tube([-0.04 * m, -0.25 * m, 0.13 * m], [-0.04 * m, 0.25 * m, 0.13 * m], 0.013 * m, steel, 6);     // the axle
      M.box(0, 0.36 * m, -0.2 * m, 0.2 * m, 0, 0.02 * m, steel, 0.004 * m);                                // the nose plate
      // boxes stacked on it, against its rails
      for (var i = 0; i < nb; i++) {
        var h = sz * (i === nb - 1 ? 0.8 : 1);
        M.box(0.02 * m, (0.02 + sz) * m, -sz / 2 * m, sz / 2 * m, (0.02 + i * sz) * m, (0.02 + i * sz + h) * m, card, 0.01 * m);
        M.box(0.02 * m, (0.02 + sz) * m, -0.03 * m, 0.03 * m, (0.02 + i * sz + h) * m, (0.025 + i * sz + h) * m, M.mat("plastic", "#d8c6a0"));   // its tape
      }
      M.pop();
    });
  }
  // where its grip is, from its axle (leaned back `lean` degrees): back and up
  function whTruckGrip(lean) {
    var a = Math.round(lean / WH_LEAN) * WH_LEAN * Math.PI / 180;
    return { back: 0.13 * Math.cos(a) + 1.17 * Math.sin(a), up: 0.13 + 1.17 * Math.cos(a) - 0.13 * Math.sin(a) };
  }

  // ---- the furniture dolly: a carpeted frame on four castors ---------------------------------------------
  function whDollyModel(L, W) {
    var l = Math.round(Math.max(0.5, Math.min(1.1, L)) * 20) / 20, w = Math.round(Math.max(0.35, Math.min(0.7, W)) * 20) / 20;
    return moModel("wh-dolly|" + l + "|" + w, function (M, m) {
      var wood = M.mat("wood", "#b98a56"), pad = M.mat("fabric", "#2f5d8a"), steel = M.mat("metal", WH_STEEL), tire = M.mat("rubber", WH_RUBBER);
      var hl = l / 2 * m, hw = w / 2 * m;
      [-1, 1].forEach(function (s) {
        M.box(-hl, hl, s * hw - 0.045 * m, s * hw + 0.045 * m, 0.085 * m, 0.13 * m, wood, 0.005 * m);
        M.box(-hl, hl, s * hw - 0.045 * m, s * hw + 0.045 * m, 0.13 * m, 0.145 * m, pad);
        M.box(s * hl - 0.045 * m, s * hl + 0.045 * m, -hw + 0.045 * m, hw - 0.045 * m, 0.085 * m, 0.13 * m, wood, 0.005 * m);
        M.box(s * hl - 0.045 * m, s * hl + 0.045 * m, -hw + 0.045 * m, hw - 0.045 * m, 0.13 * m, 0.145 * m, pad);
      });
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
        var x = c[0] * (hl - 0.06 * m), y = c[1] * (hw - 0.02 * m);
        M.box(x - 0.035 * m, x + 0.035 * m, y - 0.035 * m, y + 0.035 * m, 0.074 * m, 0.085 * m, steel);   // the swivel plate
        M.box(x - 0.012 * m, x + 0.012 * m, y - 0.02 * m, y + 0.02 * m, 0.035 * m, 0.074 * m, steel);
        M.push().move(x, y, 0.035 * m).tiltX(90);
        M.cyl(0, 0, -0.013 * m, 0.013 * m, 0.035 * m, tire, { seg: 10, bottom: true });
        M.pop();
      });
    });
  }

  // ---- the wheelbarrow: its tub, the wheel at the front, legs, the handles back to the grips ----------------
  // (the wheel to +x; lifted by the grips, turned up about the axle: the grips then 0.62 m behind x 0, 0.85 m up)
  function whBarrowModel(load, lifted) {
    var lf = lifted ? 1 : 0;
    return moModel("wh-barrow|" + (load || "") + "|" + lf, function (M, m) {
      var tub = M.mat("lacquer", "#2f6b3f"), steel = M.mat("metal", WH_STEEL), tire = M.mat("rubber", WH_RUBBER), grip = M.mat("rubber", "#2b2b2e");
      M.push().move(0.95 * m, 0, 0.2 * m).tiltY(lf ? 9 : 0).move(-0.95 * m, 0, -0.2 * m);
      M.box(0.05 * m, 0.62 * m, -0.21 * m, 0.21 * m, 0.3 * m, 0.46 * m, tub, 0.05 * m);                    // the tub, narrow at its foot
      M.box(-0.06 * m, 0.78 * m, -0.31 * m, 0.31 * m, 0.45 * m, 0.62 * m, tub, 0.04 * m);                  // wide at its lip
      if (load && WH_LOADS[load]) {
        M.box(-0.02 * m, 0.74 * m, -0.27 * m, 0.27 * m, 0.6 * m, 0.65 * m, M.mat("plain", WH_LOADS[load]));
        M.ball(0.36 * m, 0, 0.64 * m, 0.3 * m, 0.22 * m, 0.08 * m, M.mat("plain", WH_LOADS[load]), { rows: 3, cols: 10 });   // heaped
      } else {
        M.box(-0.02 * m, 0.74 * m, -0.27 * m, 0.27 * m, 0.6 * m, 0.622 * m, M.mat("metal", "#24392b"));       // (its inside, empty)
      }
      M.push().move(0.95 * m, 0, 0.2 * m).tiltX(90);
      M.cyl(0, 0, -0.045 * m, 0.045 * m, 0.2 * m, tire, { seg: 16, bottom: true });
      M.cyl(0, 0, 0.045 * m, 0.05 * m, 0.08 * m, steel, { seg: 8 });
      M.pop();
      [-1, 1].forEach(function (s) {
        M.tube([0.95 * m, s * 0.06 * m, 0.2 * m], [0.72 * m, s * 0.16 * m, 0.42 * m], 0.016 * m, steel, 6);     // the fork to the wheel
        M.tube([0.72 * m, s * 0.16 * m, 0.3 * m], [-0.62 * m, s * 0.27 * m, 0.56 * m], 0.02 * m, steel, 6);     // the handle, under the tub
        M.tube([-0.62 * m, s * 0.27 * m, 0.56 * m], [-0.78 * m, s * 0.28 * m, 0.59 * m], 0.026 * m, grip, 6);   // its grip
        M.tube([0.12 * m, s * 0.2 * m, 0.33 * m], [0.06 * m, s * 0.22 * m, 0.0], 0.016 * m, steel, 6);          // a leg
      });
      M.pop();
    });
  }

  // ---- a pallet, and what is on it: cabinets boxed, fittings in cartons, an appliance -------------------------
  var WH_PALLETS = {
    cab: [[0.6, 0.6, 0.85], [0.6, 0.6, 0.85], [0.6, 0.6, 0.85], [0.6, 0.6, 0.85]],
    fix: [[0.55, 0.45, 0.42], [0.55, 0.45, 0.42], [0.55, 0.45, 0.42], [0.55, 0.45, 0.42], [0.55, 0.45, 0.42], [0.55, 0.45, 0.42]],
    app: [[0.78, 0.78, 1.7]]
  };
  function whPalletModel(kind, left) {
    var set = WH_PALLETS[kind] || WH_PALLETS.cab, n = Math.max(0, Math.min(set.length, left === undefined ? set.length : left));
    return moModel("wh-pallet|" + kind + "|" + n, function (M, m) {
      var wood = M.mat("wood", "#c9a46a"), card = M.mat("plastic", WH_CARD), tape = M.mat("plastic", "#e9e2cf");
      [-0.45, 0, 0.45].forEach(function (y) { M.box(-0.6 * m, 0.6 * m, (y - 0.05) * m, (y + 0.05) * m, 0, 0.1 * m, wood, 0.004 * m); });   // the bearers
      for (var i = 0; i < 7; i++) { var x = -0.6 + 0.08 + i * (1.04 / 6); M.box((x - 0.06) * m, (x + 0.06) * m, -0.5 * m, 0.5 * m, 0.1 * m, 0.14 * m, wood, 0.003 * m); }
      // the cartons: two by two, a second layer on the first where there are more
      for (var k = 0; k < n; k++) {
        var b = set[k], per = kind === "fix" ? 4 : kind === "app" ? 1 : 4, layer = Math.floor(k / per), j = k % per;
        var cx = kind === "app" ? 0 : (j % 2 ? 0.3 : -0.3), cy = kind === "app" ? 0 : (j < 2 ? -0.25 : 0.25), z0 = 0.14 + layer * set[0][2];
        M.box((cx - b[0] / 2 + 0.01) * m, (cx + b[0] / 2 - 0.01) * m, (cy - b[1] / 2 + 0.01) * m, (cy + b[1] / 2 - 0.01) * m, z0 * m, (z0 + b[2]) * m, card, 0.012 * m);
        M.box((cx - b[0] / 2 + 0.01) * m, (cx + b[0] / 2 - 0.01) * m, (cy - 0.03) * m, (cy + 0.03) * m, (z0 + b[2]) * m, (z0 + b[2] + 0.004) * m, tape);
      }
    });
  }

  // ---- the forklift that rides on the back of a flatbed: three wheels, a seat in a cage, a mast at the front ---
  function whForkBody() {
    return moModel("wh-fork", function (M, m) {
      var red = M.mat("lacquer", "#b8322a"), dark = M.mat("metal", "#2a2c30"), grey = M.mat("metal", "#5a5e63"), seat = M.mat("plastic", "#1f2328");
      M.box(-1.05 * m, 0.55 * m, -0.78 * m, -0.5 * m, 0.25 * m, 0.7 * m, red, 0.05 * m);                    // the frame's two sides
      M.box(-1.05 * m, 0.55 * m, 0.5 * m, 0.78 * m, 0.25 * m, 0.7 * m, red, 0.05 * m);
      M.box(-1.15 * m, -0.45 * m, -0.5 * m, 0.5 * m, 0.25 * m, 0.95 * m, red, 0.06 * m);                     // the engine at the back
      M.box(-1.2 * m, -1.05 * m, -0.6 * m, 0.6 * m, 0.25 * m, 0.75 * m, grey, 0.03 * m);                     // its counterweight
      M.box(-0.4 * m, 0.1 * m, -0.32 * m, 0.32 * m, 0.7 * m, 0.98 * m, seat, 0.05 * m);                      // the seat
      M.box(-0.45 * m, -0.38 * m, -0.32 * m, 0.32 * m, 0.98 * m, 1.45 * m, seat, 0.03 * m);                  // its back
      // the cage over the seat
      [[-0.5, -0.45], [-0.5, 0.45], [0.35, -0.45], [0.35, 0.45]].forEach(function (c) { M.tube([c[0] * m, c[1] * m, 0.7 * m], [c[0] * m, c[1] * m, 2.05 * m], 0.025 * m, dark, 6); });
      M.box(-0.55 * m, 0.4 * m, -0.5 * m, 0.5 * m, 2.03 * m, 2.08 * m, M.mat("plastic", "#1f2328"));
      M.tube([0.35 * m, 0, 0.95 * m], [0.15 * m, 0, 1.15 * m], 0.02 * m, dark, 6);                           // the wheel to steer by
      // the wheels: two at the front by the mast, one behind under the engine
      [[0.3, -0.92], [0.3, 0.92]].forEach(function (w) { moWheel(M, w[0] * m, w[1] * m, 0.3 * m, 0.22 * m, m); });
      moWheel(M, -0.8 * m, 0, 0.26 * m, 0.24 * m, m);
    });
  }
  // st: lift (m, the forks off the ground), load (a pallet: { kind, left })
  WK_DRAW.forklift = function (faces, st, m, T, plan) {
    // (its forks going up and down as it stands: all of it drawn with what moves)
    var P = plan.site.P, F = wkFrame(st), z0 = (st.z || 0), f0 = faces.length;
    wkPutM(faces, whForkBody(), F, z0, true);
    var steel = wkHow("#3a3d40", 22), mast = wkHow("#2a2c30", 22), h = z0 + Math.max(0.05, st.lift || 0.15) * P;
    [-0.42, 0.42].forEach(function (u) { cnBeam(faces, F.at(0.68 * P, u * P, z0 + 0.15 * P), F.at(0.68 * P, u * P, z0 + 2.3 * P), 0.1 * P, mast, 0.08 * P); });
    cnBeam(faces, F.at(0.68 * P, -0.42 * P, z0 + 2.25 * P), F.at(0.68 * P, 0.42 * P, z0 + 2.25 * P), 0.08 * P, mast);
    cnBeam(faces, F.at(0.76 * P, -0.45 * P, h + 0.35 * P), F.at(0.76 * P, 0.45 * P, h + 0.35 * P), 0.08 * P, steel);   // the carriage
    [-0.3, 0.3].forEach(function (u) {
      cnBeam(faces, F.at(0.78 * P, u * P, h + 0.5 * P), F.at(0.78 * P, u * P, h), 0.07 * P, steel, 0.05 * P);
      cnBeam(faces, F.at(0.78 * P, u * P, h), F.at(1.95 * P, u * P, h), 0.1 * P, steel, 0.045 * P);
    });
    if (st.load) { wkPutM(faces, whPalletModel(st.load.kind, st.load.left), { x: F.at(1.38 * P, 0, 0)[0], y: F.at(1.38 * P, 0, 0)[1], yaw: F.yaw }, h + 0.02 * P, true); }
    for (var i = f0; i < faces.length; i++) { faces[i].moves = true; }
  };

  // ---- the workers' loads that roll ----------------------------------------------------------------------
  if (typeof wkCarryDraw === "function") {
    var wkCarryDrawHaul = wkCarryDraw;
    wkCarryDraw = function (faces, c, p, head, P, look) {
      if (c && c.kind === "truck") {
        // boxes on a hand truck, pushed ahead leaned back: its grip in the hands
        var g = whTruckGrip(WH_TRUCK_LEAN), ahead = (0.43 + g.back) * P;
        moPut(faces, whTruckModel(WH_TRUCK_LEAN, c.n || 2, c.size || 0.45), p[0] + Math.cos(head) * ahead, p[1] + Math.sin(head) * ahead, head, p[2] || 0, true);
        return;
      }
      if (c && c.kind === "barrow") {
        // a wheelbarrow, lifted by its grips, the wheel out in front
        var ahead2 = (0.36 + 0.62) * P;
        moPut(faces, whBarrowModel(c.load === undefined ? "soil" : c.load, true), p[0] + Math.cos(head) * ahead2, p[1] + Math.sin(head) * ahead2, head, p[2] || 0, true);
        return;
      }
      return wkCarryDrawHaul.apply(this, arguments);
    };
  }

  // ---- the movers: an appliance on a hand truck, a heavy piece on a dolly ----------------------------------
  function whHaul(it) {
    if (it.haul !== undefined) { return it.haul; }
    var k = it.n && it.n.kind, P = FLOOR_PX, big = Math.max(it.w, it.h) / P, small = Math.min(it.w, it.h) / P, h = null;
    if (!it.wide && WH_TRUCKED[k] && small <= 1.0) { h = "truck"; }
    else if (!it.wide && WH_DOLLIED[k] && big <= 2.4) { h = "dolly"; }
    it.haul = h;
    return h;
  }
  // on a stair just there: the way rising or falling (a dolly carried on it)
  function whOnStairs(pose) {
    if (!pose || !pose.r || typeof moAt !== "function") { return false; }
    var P = FLOOR_PX, a = moAt(pose.r, Math.max(0, pose.d - 0.5 * P)), b = moAt(pose.r, Math.min(pose.r.len, pose.d + 0.5 * P));
    return Math.abs((a.z || 0) - (b.z || 0)) > 0.06 * P;
  }
  if (typeof moPose === "function") {
    var moPoseHaul = moPose;
    moPose = function (ctx, it, u) {
      var pose = moPoseHaul.apply(this, arguments), h = pose && whHaul(it);
      if (!h || pose.tilt || (h === "dolly" && whOnStairs(pose))) { return pose; }
      var P = ctx.P, rest = it.z0 === undefined ? it.fz : it.z0, k = pose.down, along = (pose.alongX ? it.w : it.h) / 2;
      if (h === "dolly") {
        var on = pose.at.z + 0.145 * P;
        pose.z = on + (rest - on) * k;
      } else {
        // leaned back on the hand truck, toward whoever wheels it; righted as it is set down
        var lean = WH_TRUCK_LEAN * Math.PI / 180 * (1 - k), on2 = pose.at.z + 0.03 * P + along * Math.sin(lean);
        pose.z = on2 + (rest - on2) * k;
        // (a model leaned in its own numbers, 40-movein.js's moTilted: its x along the way it goes when it is
        // the long way along, so turned about its y; else about its x -- measured: the top back, toward the mover)
        if (lean > 0.02) { pose.tilt = (pose.alongX ? -1 : 1) * lean; pose.alongX = !pose.alongX; }
        pose.lean = lean;
      }
      pose.haul = h; pose.along = along;
      return pose;
    };
  }
  // (what is drawn as plain faces leaned with it too, about its middle: only a model was turned on its side)
  if (typeof moMoveFaces === "function") {
    var moMoveFacesHaul = moMoveFaces;
    moMoveFaces = function (out, list, it, pose) {
      var f0 = out.length;
      moMoveFacesHaul.apply(this, arguments);
      if (!pose || pose.haul !== "truck" || !(pose.lean > 0.02)) { return; }
      var d = pose.dir, c = Math.cos(pose.lean), s = Math.sin(pose.lean), px = pose.x, py = pose.y, pz = pose.z + (pose.hz || 0);
      function lean(q, base) {
        var rx = q[0] - (base ? px : 0), ry = q[1] - (base ? py : 0), a = rx * d[0] + ry * d[1], z = (q[2] || 0) - (base ? pz : 0);
        var a2 = a * c - z * s, z2 = a * s + z * c, ox = rx - a * d[0], oy = ry - a * d[1];
        return base ? [px + ox + a2 * d[0], py + oy + a2 * d[1], pz + z2] : [ox + a2 * d[0], oy + a2 * d[1], z2];
      }
      for (var i = f0; i < out.length; i++) {
        var f = out[i];
        if (f.mesh) { continue; }
        f.pts = f.pts.map(function (q) { return lean(q, true); });
        if (f.n) { f.n = lean(f.n, false); }
      }
    };
  }
  if (typeof moCarriers === "function") {
    var moCarriersHaul = moCarriers;
    moCarriers = function (faces, ctx, it, pose, u, speed) {
      var h = pose && pose.haul;
      if (!h) { return moCarriersHaul.apply(this, arguments); }
      var P = ctx.P, d = pose.dir, head = Math.atan2(d[1], d[0]), k = pose.down, z = pose.at.z, along = pose.along;
      var phase = k > 0.05 ? 0.25 : moStep(pose.d, speed), fade = Math.min(1, u / 0.05 + 0.15);
      if (h === "dolly") {
        var longX = it.w >= it.h, yaw = pose.yaw + (longX ? 0 : Math.PI / 2);
        if (k < 0.6) { moPut(faces, whDollyModel(Math.max(it.w, it.h) / P * 0.8, Math.min(it.w, it.h) / P * 0.8), pose.x, pose.y, yaw, z, true); }
        // one pushing behind; on a big one, one in front steadying it, walking backwards
        moBody(faces, 700 + it.id * 3, pose.x - d[0] * (along + 0.4 * P), pose.y - d[1] * (along + 0.4 * P), z, head, phase, fade, k < 0.4 ? MO_HOLDING : null);
        if (it.big) { moBody(faces, 701 + it.id * 3, pose.x + d[0] * (along + 0.42 * P), pose.y + d[1] * (along + 0.42 * P), z, head + Math.PI, phase + Math.PI, fade, k < 0.4 ? MO_HOLDING : null); }
        return;
      }
      // the hand truck under its back edge, leaned with it; whoever wheels it at the grip
      var lean = (pose.lean || 0) * 180 / Math.PI, g = whTruckGrip(lean), ax = [pose.x - d[0] * along, pose.y - d[1] * along];
      if (k < 0.75) { moPut(faces, whTruckModel(lean, 0), ax[0], ax[1], head, z, true); }
      var back = (g.back + 0.43) * P;
      moBody(faces, 700 + it.id * 3, ax[0] - d[0] * back, ax[1] - d[1] * back, z, head, phase, fade, k < 0.4 ? MO_HOLDING : null);
    };
  }

  // ---- a delivery: pallets on a flatbed, its forklift down off the back, each driven into the yard ----------
  // spec: { at: when the first can be lifted off, n: pallets (1-3), kind: "cab" | "fix" | "app", near: lot-local spot }
  // Back: { pallets: [{ w: where it is set down, at: when, kind, taken: [times a load is taken off it] }], doneAt, goneAt }.
  function whDeliver(plan, spec) {
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, n = Math.max(1, Math.min(3, spec.n || 2)), kind = spec.kind || "cab";
    var near = spec.near || J.yard.l, t = spec.at;
    var semi = wkMachine(plan, "semi", { paint: "#7a2e2a", stripe: "#3b4350" });
    semi.site = site;
    var stand = wkStand(plan, { kind: "semi", target: [near[0], S.kerb], street: true, t0: t - 60, t1: t + 400 });
    var t0 = jbCome(plan, semi, stand, 19 * P, t, { speed: 5, extra: { load: 0 } });
    // the trailer's deck, as the lorry is just then: a point on it, so far back of the fifth wheel, so far to its side
    function deckAt(ss, fx, fy) {
      var F = wkFrame(ss), kp = F.at(MO_FIFTH * P, 0, 0), ty = S.a + (ss.tang === undefined ? ss.ang : ss.tang);
      return { p: [kp[0] + fx * Math.cos(ty) - fy * Math.sin(ty), kp[1] + fx * Math.sin(ty) + fy * Math.cos(ty), WH_DECK * P], yaw: ty };
    }
    var still = { x: stand.x, y: stand.y, ang: stand.ang, site: site };
    // which side of it the lot is on
    var probe = deckAt(still, -10 * P, 3 * P).p, mid = deckAt(still, -10 * P, 0).p, side = S.L(probe[0], probe[1])[1] < S.L(mid[0], mid[1])[1] ? 1 : -1;
    var slots = [-13.4, -11.0, -8.6].slice(0, n).map(function (fx) { return fx * P; });
    var fork = wkMachine(plan, "forklift", {});
    fork.site = site;
    function rideState(T, extra) {
      var ss = wkMachineAt(semi, T) || still, at = deckAt(ss, -15.3 * P, 0), l = S.L(at.p[0], at.p[1]);
      return Object.assign({ x: l[0], y: l[1], ang: at.yaw - S.a, site: site, z: 0.32 * P, lift: 0.9, riding: true, moving: !!ss.moving }, extra || {});
    }
    // riding in on the back of it
    wkMSeg(fork, t0, t, function (k, T) { return rideState(T); });
    // down off it, onto the road behind
    var ride = rideState(t), back = deckAt(still, -17.2 * P, 0), backL = S.L(back.p[0], back.p[1]);
    wkMSeg(fork, t, t + 3, function (k) { var q = wkSmooth(k); return Object.assign({}, ride, { x: ride.x + (backL[0] - ride.x) * q, y: ride.y + (backL[1] - ride.y) * q, z: 0.32 * P * (1 - q), lift: 0.9 - 0.7 * q, riding: false, moving: true }); });
    var tt = t + 3, at = [backL[0], backL[1]], head = ride.ang, pallets = [];
    function hold(dur, fn) { var a0 = at.slice(), h0 = head, s0 = tt; wkMSeg(fork, s0, s0 + dur, function (k) { return Object.assign({ x: a0[0], y: a0[1], ang: h0, site: site }, fn(wkSmooth(k))); }); tt += dur; }
    function drive(to, load) {
      var pts = wkVehWay(site, at, to, 1.0 * P).map(function (q) { return [q[0], q[1]]; });
      pts.head = head;
      tt = jbTracked(plan, fork, pts, tt, 2.2, { lift: 0.2, load: load || null }) + 0.2;
      at = to.slice(); head = fork.head;
    }
    function straight(to, back2, extra) {
      var a0 = at.slice(), dur = Math.max(1.2, Math.hypot(to[0] - a0[0], to[1] - a0[1]) / (0.8 * P)), h0 = head, s0 = tt;
      wkMSeg(fork, s0, s0 + dur, function (k) { var q = wkSmooth(k); return Object.assign({ x: a0[0] + (to[0] - a0[0]) * q, y: a0[1] + (to[1] - a0[1]) * q, ang: h0, site: site, moving: true, reversing: !!back2 }, extra); });
      tt += dur; at = to.slice();
    }
    function turnTo(ang) {
      var h0 = head, d = Math.abs(((ang - h0) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
      if (d < 0.05) { head = ang; return; }
      var a0 = at.slice(), s0 = tt, dur = 0.6 + d * 1.1;
      wkMSeg(fork, s0, s0 + dur, function (k) { return { x: a0[0], y: a0[1], ang: wkTurnTo(h0, ang, wkSmooth(k)), site: site, lift: 0.2, moving: true }; });
      tt += dur; head = ang;
    }
    slots.forEach(function (fx, i) {
      var P0 = { kind: kind, left: undefined, taken: [], slot: fx };
      // facing the trailer from the lot side, the forks at the pallet near its edge
      var onDeck = deckAt(still, fx, side * 0.55 * P), face = onDeck.yaw - S.a - side * Math.PI / 2;
      var pickW = deckAt(still, fx, side * (0.55 + 1.38) * P).p, offW = deckAt(still, fx, side * (0.55 + 2.6) * P).p;
      var pickL = S.L(pickW[0], pickW[1]), offL = S.L(offW[0], offW[1]);
      drive(offL, null);
      turnTo(face);
      hold(2, function (k) { return { lift: 0.2 + (WH_DECK + 0.03 - 0.2) * k }; });                    // the forks up to the deck
      straight(pickL, false, { lift: WH_DECK + 0.03 });
      P0.up = tt;
      hold(0.8, function (k) { return { lift: WH_DECK + 0.03 + 0.08 * k, load: { kind: kind } }; });   // lifted off it
      straight(offL, true, { lift: WH_DECK + 0.11, load: { kind: kind } });
      hold(2, function (k) { return { lift: WH_DECK + 0.11 - (WH_DECK + 0.11 - 0.2) * k, load: { kind: kind } }; });
      // into the yard, set down in a row
      var spot = jbSpot(J, 1.4, 1.2, [near[0] + (i - (n - 1) / 2) * 1.8 * P, near[1]], 0.15), dw = spot.w;
      var dirL = [spot.l[0] - at[0], spot.l[1] - at[1]], dl = Math.hypot(dirL[0], dirL[1]) || 1;
      var appr = [spot.l[0] - dirL[0] / dl * 2.6 * P, spot.l[1] - dirL[1] / dl * 2.6 * P], downAt = [spot.l[0] - dirL[0] / dl * 1.38 * P, spot.l[1] - dirL[1] / dl * 1.38 * P];
      drive(appr, { kind: kind });
      turnTo(Math.atan2(dirL[1], dirL[0]));
      straight(downAt, false, { lift: 0.2, load: { kind: kind } });
      hold(1.5, function (k) { return { lift: 0.2 - 0.17 * k, load: { kind: kind } }; });
      P0.at = tt; P0.w = [dw[0], dw[1], 0]; P0.yaw = S.a + head;
      straight(appr, true, { lift: 0.03 });
      pallets.push(P0);
    });
    // back up on the lorry, and away with it
    drive(backL, null);
    turnTo(ride.ang);
    var upT = tt;
    wkMSeg(fork, upT, upT + 3, function (k) { var q = wkSmooth(k); return Object.assign({}, ride, { x: backL[0] + (ride.x - backL[0]) * q, y: backL[1] + (ride.y - backL[1]) * q, z: 0.32 * P * q, lift: 0.2 + 0.7 * q, riding: false, moving: true }); });
    tt = upT + 3;
    jbStay(semi, t, tt, function () { return { load: 0 }; });
    semi.here = tt;
    var gone = jbGo(plan, semi, tt + 0.5, { speed: 5, extra: { load: 0 } });
    wkMSeg(fork, tt, gone, function (k, T) { return rideState(T); }).gone = true;
    // the pallets: on the trailer till lifted off, on the forks (drawn with them), in the yard -- less on them each load taken
    pallets.forEach(function (pl) {
      wkPiece(plan, t0, [], { t1: 1e9, live: function (faces, T) {
        if (T < pl.up) {
          var ss = wkMachineAt(semi, T) || still, d = deckAt(ss, pl.slot, side * 0.55 * P);
          moPut(faces, whPalletModel(pl.kind), d.p[0], d.p[1], d.yaw + Math.PI / 2, d.p[2] + 0.01 * P, true);
          return;
        }
        if (T < pl.at) { return; }
        var gone2 = 0; pl.taken.forEach(function (x) { if (T >= x) { gone2++; } });
        var set = WH_PALLETS[pl.kind] || WH_PALLETS.cab, left = Math.max(0, set.length - gone2);
        if (pl.end !== undefined && T >= pl.end) { return; }
        moPut(faces, whPalletModel(pl.kind, left), pl.w[0], pl.w[1], pl.yaw, 0, T < pl.at + 2 || (pl.taken.length && T < pl.taken[pl.taken.length - 1] + 1));
      } });
    });
    return { pallets: pallets, doneAt: pallets.length ? pallets[pallets.length - 1].at : tt, goneAt: gone };
  }
