// ---------------------------------------------------------------------------
//  40-items.js -- more things to put in a design, each drawn on the plan and
//  made in 3D: a big store's and a mall's fittings (cart corrals,
//  self-checkouts, produce islands, bakery and deli cases, pallet racks,
//  kiosks, escalators ...), a restaurant's kitchen and dining room, a
//  clinic's, music and hobbies, classrooms and labs, offices, more for the
//  home and out of doors -- and the things that were still flat pictures
//  in 3D (the space set, a circuit's parts, the travel set, the things
//  set) made as things
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "add more items that are unique or other of
  // similar things so there can be like 500+ unique items and to also make
  // sure all of those items are modeled in 3d too because there are some
  // currently that are not")
  //
  // Each is put down as the pieces of a floor plan are: as big as the thing
  // is (50 px to the metre), its picture on the plan drawn in the studio's
  // line, its model (38-models.js) in its own numbers -- W across, D from
  // back to front, H up -- and where it goes in 3D: standing on the floor
  // (how high), on whatever is under it (a counter, a desk), hung on a
  // wall, or from the ceiling.
  var IT_NEW = [];
  function itN(v) { return Math.round(v * 100) / 100; }
  function itR(x, y, w, h, r) {
    if (!r) { return "M" + itN(x) + " " + itN(y) + " H" + itN(x + w) + " V" + itN(y + h) + " H" + itN(x) + " Z"; }
    r = Math.min(r, w / 2, h / 2);
    return "M" + itN(x + r) + " " + itN(y) + " H" + itN(x + w - r) + " A" + itN(r) + " " + itN(r) + " 0 0 1 " + itN(x + w) + " " + itN(y + r) +
           " V" + itN(y + h - r) + " A" + itN(r) + " " + itN(r) + " 0 0 1 " + itN(x + w - r) + " " + itN(y + h) +
           " H" + itN(x + r) + " A" + itN(r) + " " + itN(r) + " 0 0 1 " + itN(x) + " " + itN(y + h - r) +
           " V" + itN(y + r) + " A" + itN(r) + " " + itN(r) + " 0 0 1 " + itN(x + r) + " " + itN(y) + " Z";
  }
  function itC(cx, cy, r) {
    return "M" + itN(cx - r) + " " + itN(cy) + " A" + itN(r) + " " + itN(r) + " 0 1 0 " + itN(cx + r) + " " + itN(cy) +
           " A" + itN(r) + " " + itN(r) + " 0 1 0 " + itN(cx - r) + " " + itN(cy) + " Z";
  }
  function itL(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + itN(p[0]) + " " + itN(p[1]); }).join(" "); }
  // lines across a box, every `step`, along x (or y)
  function itRows(x, y, w, h, step, across) {
    var d = "";
    if (across) { for (var v = y + step; v < y + h - 0.5; v += step) { d += "M" + itN(x) + " " + itN(v) + " H" + itN(x + w) + " "; } }
    else { for (var u = x + step; u < x + w - 0.5; u += step) { d += "M" + itN(u) + " " + itN(y) + " V" + itN(y + h) + " "; } }
    return d.trim() || "M0 0";
  }
  // A thing added: its set, its kind, how big it is (centimetres: across,
  // back to front), its picture (drawn in centimetres too -- a list, or
  // one worked out for a size), where it goes in 3D, and its model.
  //   how: { h: metres high standing on the floor | top: high on what is
  //   under it | wall: [from, to] metres up the wall | ceil: [drop, tall] |
  //   flat: lies flat }  (out of doors, what stands is stood on the land, 40-land.js)
  // On the plan it is 50 px to the metre, as everything is; the picture is
  // drawn afresh for whatever size the piece is made (03-icons.js's own
  // stretching, arcs and all).
  function itAdd(set, kind, w, d, art, how, model) {
    var bw = Math.max(4, Math.round(w / 2)), bh = Math.max(4, Math.round(d / 2));
    ICONS[kind] = { box: [bw, bh], fit: true, art: function (pw, ph) {
      var list = typeof art === "function" ? art(pw * w / bw, ph * d / bh) : art;
      var sx = typeof art === "function" ? bw / w : pw / w, sy = typeof art === "function" ? bh / d : ph / d;
      return list.map(function (one) {
        var got = ICON_PART.exec(one);
        return got ? got[1] + got[2] + " " + iconPathAt(iconSegs(got[3]), sx, sy, 0, 0) : one;
      });
    } };
    how = how || {};
    if (how.top) { ON_TOP[kind] = true; V3_ON[kind] = how.top; }
    else if (how.wall) { ON_THE_WALL[kind] = true; SNAP_IN_WALL[kind] = "face"; V3_WALL[kind] = how.wall; }
    else if (how.ceil) { FROM_CEILING[kind] = true; if (typeof V3_DROP === "object") { V3_DROP[kind] = how.ceil; } }
    else { V3_HIGH[kind] = how.h || 1; }
    if (how.flat) { LIES_FLAT[kind] = true; }
    var S = ICON_SETS.filter(function (s) { return s[0] === set; })[0];
    if (!S) {
      S = [set, []];
      // (the new sets after the shops', where a building's things are looked for)
      var at = -1;
      ICON_SETS.forEach(function (s, i) { if (s[0] === "ic_store" || /^ic_(mall|food|health|hobby|learn|work)$/.test(s[0])) { at = i; } });
      ICON_SETS.splice(at >= 0 ? at + 1 : ICON_SETS.length, 0, S);
    }
    if (S[1].indexOf(kind) < 0) { S[1].push(kind); }
    if (typeof ICON_SET_OF === "object" && !ICON_SET_OF[kind]) { ICON_SET_OF[kind] = set; }
    if (model && typeof mDef === "function") { mDef(kind, model); }
    IT_NEW.push(kind);
  }
  if (typeof ICON_SET_FACE === "object") {
    Object.assign(ICON_SET_FACE, { ic_mall: "i_escalator", ic_food: "i_booth", ic_health: "i_hospbed", ic_hobby: "i_drums",
                                   ic_learn: "i_labbench", ic_work: "i_cubicle" });
  }
  var cmI = MODEL_CM;                        // pixels to a centimetre
  // pieces many of them share
  function itSign(M, x0, x1, y, z0, z1, color, glowC) {        // a lit panel facing +y at y
    M.box(x0, x1, y - 1.5 * cmI, y, z0, z1, M.mat("metal", "#3a3d40"));
    M.box(x0 + 1.5 * cmI, x1 - 1.5 * cmI, y, y + 0.3 * cmI, z0 + 1.5 * cmI, z1 - 1.5 * cmI, M.mat(glowC ? "glow" : "plastic", color));
  }
  function itGoods(M, x0, x1, y0, y1, z, h, rnd, colors) {   // boxes and packets on a shelf
    var x = x0;
    while (x < x1 - 3 * cmI) {
      var w = (5 + rnd() * 9) * cmI, hh = h * (0.55 + rnd() * 0.45);
      M.box(x, Math.min(x1, x + w), y0, y1, z, z + hh, M.mat("plastic", colors[Math.floor(rnd() * colors.length)]));
      x += w + 0.6 * cmI;
    }
  }
  var IT_PACK = ["#c43c3a", "#f2c94c", "#2f6fae", "#3f9a5a", "#f08a24", "#efefe8", "#8a5bb5", "#1f2226", "#d96aa0"];
  var IT_FRUIT = ["#c8352e", "#f39a1e", "#7fb33a", "#f2d23c", "#5b2a4f", "#3e7d2e", "#e2563a"];
  function itGlassBox(M, x0, x1, y0, y1, z0, z1) {
    var g = M.mat("glass", "#d7e6ee");
    M.box(x0, x1, y0, y0 + 0.6 * cmI, z0, z1, g); M.box(x0, x1, y1 - 0.6 * cmI, y1, z0, z1, g);
    M.box(x0, x0 + 0.6 * cmI, y0, y1, z0, z1, g); M.box(x1 - 0.6 * cmI, x1, y0, y1, z0, z1, g);
    M.box(x0, x1, y0, y1, z1 - 0.6 * cmI, z1, g);
  }
  function itWheel(M, x, y, z, r, w, mat, alongY) {           // a wheel, its axle across x (or y)
    M.push().move(x, y, z);
    if (alongY) { M.tiltX(90); } else { M.tiltY(90); }
    M.cyl(0, 0, -w / 2, w / 2, r, mat, { seg: 14, bottom: true });
    M.pop();
  }

  // ===================================================================== malls and big stores ==
  // a cart corral: a stall's worth of steel pipe, open to the aisle, its sign, carts nested in it
  itAdd("ic_mall", "i_cartcorral", 160, 460, ["o " + itR(0, 0, 160, 460, 6), "t M8 452 V8 H152 V452", "t " + itRows(30, 30, 100, 400, 30, true)],
        { h: 1.9 }, function (M, W, D, H, C, n) {
    var steel = M.mat("chrome", "#aeb4b9"), r = 2.4 * cmI, x0 = -W / 2 + 6 * cmI, x1 = W / 2 - 6 * cmI, y0 = -D / 2 + 6 * cmI, y1 = D / 2 - 6 * cmI;
    [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [x0, 0], [x1, 0]].forEach(function (p) { M.cyl(p[0], p[1], 0, 108 * cmI, r, steel, { seg: 10 }); });
    [50, 105].forEach(function (z) {
      M.tube([x0, y0, z * cmI], [x0, y1, z * cmI], r, steel, 8); M.tube([x1, y0, z * cmI], [x1, y1, z * cmI], r, steel, 8);
      M.tube([x0, y0, z * cmI], [x1, y0, z * cmI], r, steel, 8);
    });
    // its sign over the closed end
    M.cyl(0, y0, 108 * cmI, 175 * cmI, 2 * cmI, steel, { seg: 8 });
    M.box(-45 * cmI, 45 * cmI, y0 - 1 * cmI, y0 + 1 * cmI, 150 * cmI, 190 * cmI, M.mat("plastic", "#1f5fa8"));
    M.box(-38 * cmI, 38 * cmI, y0 + 1 * cmI, y0 + 1.4 * cmI, 160 * cmI, 180 * cmI, M.mat("plastic", "#f4f6f7"));
    // the carts, nested, their handles to the open end
    var cart = MODELS.i_cart, k = 0;
    for (var y = y0 + 40 * cmI; y < y1 - 40 * cmI && k < 9; y += 32 * cmI, k++) {
      if (n && mRand(n.id || 7)() < 0.15 && k > 2) { break; }
      M.push().move(0, y, 0).turn(-90);
      cart(M, 95 * cmI, 56 * cmI, 100 * cmI, { main: null, frame: null });
      M.pop();
    }
  });
  // a self-checkout: the scanner and its scale, a screen on a stem, a bagging shelf, the light on its pole
  itAdd("ic_mall", "i_selfcheckout", 90, 70, ["o " + itR(0, 10, 55, 60, 3), "o " + itR(58, 14, 32, 52, 2), "t " + itR(10, 2, 30, 10, 2), "k " + itC(45, 6, 4)],
        { h: 1.55 }, function (M, W, D, H, C) {
    C = mPick(C, "#e8e8e4", "#2f3236");
    var body = M.mat("plastic", C.main), dark = M.mat("plastic", C.frame), xs = -W / 2 + 0.6 * W;
    M.box(-W / 2, xs, -D / 2 + 10 * cmI, D / 2, 0, 90 * cmI, body, 2 * cmI);
    M.box(-W / 2 + 4 * cmI, xs - 4 * cmI, -D / 2 + 14 * cmI, D / 2 - 6 * cmI, 90 * cmI, 92 * cmI, M.mat("glass", "#2b3a44"));   // the scale's glass
    M.box(xs + 3 * cmI, W / 2, -D / 2 + 14 * cmI, D / 2 - 4 * cmI, 0, 78 * cmI, M.mat("metal", "#9aa0a5"));
    M.box(xs + 3 * cmI, W / 2, -D / 2 + 14 * cmI, D / 2 - 4 * cmI, 78 * cmI, 80 * cmI, M.mat("chrome", "#c9ced2"));
    M.box(-10 * cmI, -6 * cmI, -D / 2 + 4 * cmI, -D / 2 + 8 * cmI, 90 * cmI, 125 * cmI, dark);
    M.push().move(-8 * cmI, -D / 2 + 10 * cmI, 128 * cmI).tiltX(-20);
    M.box(-22 * cmI, 22 * cmI, -1.5 * cmI, 1.5 * cmI, -14 * cmI, 14 * cmI, dark, 1 * cmI);
    M.box(-20 * cmI, 20 * cmI, 1.5 * cmI, 1.8 * cmI, -12 * cmI, 12 * cmI, M.mat("screen", "#2f6fae"));
    M.pop();
    M.cyl(xs - 6 * cmI, -D / 2 + 6 * cmI, 92 * cmI, H - 6 * cmI, 1.2 * cmI, dark, { seg: 8 });
    M.cyl(xs - 6 * cmI, -D / 2 + 6 * cmI, H - 6 * cmI, H, 4 * cmI, M.mat("glow", "#57c46f"), { seg: 12 });
  });
  // a produce island: tiers of sloping bins both sides, fruit piled in them, price stakes
  itAdd("ic_mall", "i_produce", 180, 120, function (w, h) {
    return ["o " + itR(0, 0, w, h, 6), "t M0 " + itN(h / 2) + " H" + itN(w), "t " + itRows(0, 0, w, h, 36, false),
            "t " + itC(w * 0.2, h * 0.25, 7) + " " + itC(w * 0.5, h * 0.75, 7) + " " + itC(w * 0.8, h * 0.25, 7)];
  }, { h: 0.95 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#8a6a4c", "#4f6b3a");
    var wood = M.mat("wood", C.main), rnd = mRand((n && n.id) || 11), cells = Math.max(2, Math.round(W / (40 * cmI)));
    M.box(-W / 2, W / 2, -D / 2 + 8 * cmI, D / 2 - 8 * cmI, 0, 55 * cmI, wood, 1 * cmI);
    [-1, 1].forEach(function (s) {
      for (var i = 0; i < cells; i++) {
        var xa = -W / 2 + i * W / cells + 1 * cmI, xb = -W / 2 + (i + 1) * W / cells - 1 * cmI, y0 = s * 4 * cmI, y1 = s * (D / 2);
        var zIn = H - 4 * cmI, zOut = 62 * cmI;
        M.quad(wood, [xa, y1, zOut], [xb, y1, zOut], [xb, y0, zIn], [xa, y0, zIn]);
        M.box(xa, xb, y1 - s * 3 * cmI, y1, 50 * cmI, zOut + 6 * cmI, wood);
        var fc = IT_FRUIT[Math.floor(rnd() * IT_FRUIT.length)];
        for (var f = 0; f < 10; f++) {
          var t = rnd(), fx = xa + 4 * cmI + rnd() * (xb - xa - 8 * cmI), fy = y0 + (y1 - y0) * t, fz = zIn + (zOut - zIn) * t + 4 * cmI;
          M.ball(fx, fy, fz, 4.5 * cmI, 4.5 * cmI, 4.5 * cmI, M.mat("plastic", mShade(fc, (rnd() - 0.5) * 0.15)), { seg: 5 });
        }
        M.box((xa + xb) / 2 - 6 * cmI, (xa + xb) / 2 + 6 * cmI, y1 - s * 1 * cmI, y1, zOut + 6 * cmI, zOut + 14 * cmI, M.mat("plastic", "#f4f2ec"));
      }
    });
    M.box(-W / 2, W / 2, -2 * cmI, 2 * cmI, H - 4 * cmI, H + 25 * cmI, M.mat("wood", C.frame));
  });
  // a bakery case: a curved glass front over shelves of loaves, rolls and cakes, lit inside
  function itCase(M, W, D, H, C, n, goods, kind) {
    var rnd = mRand((n && n.id) || 13), base = M.mat("lacquer", C.main), trim = M.mat("metal", C.frame), glass = M.mat("glass", "#dfeef2");
    var deck = H * 0.55, y0 = -D / 2, y1 = D / 2;
    M.box(-W / 2, W / 2, y0, y1, 0, deck, base, 1 * cmI);
    M.box(-W / 2, W / 2, y1 - 3 * cmI, y1, 8 * cmI, 12 * cmI, trim);
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, y0 + 2 * cmI, y1 - 6 * cmI, deck, deck + 1 * cmI, M.mat("metal", "#dfe3e6"));
    // the glass, curving up and back over the front
    var steps = 5;
    for (var i = 0; i < steps; i++) {
      var a0 = i / steps * Math.PI / 2, a1 = (i + 1) / steps * Math.PI / 2, R = Math.min(D * 0.55, (H - deck) * 0.9);
      var ya = y1 - 6 * cmI - R + Math.cos(a0) * R, yb = y1 - 6 * cmI - R + Math.cos(a1) * R, za = deck + Math.sin(a0) * R, zb = deck + Math.sin(a1) * R;
      M.quad(glass, [-W / 2 + 2 * cmI, ya, za], [W / 2 - 2 * cmI, ya, za], [W / 2 - 2 * cmI, yb, zb], [-W / 2 + 2 * cmI, yb, zb]);
    }
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, y0 + 4 * cmI, y1 - 6 * cmI - Math.min(D * 0.55, (H - deck) * 0.9), H - 2 * cmI, H, M.mat("glass", "#dfeef2"));
    [-W / 2, W / 2 - 2 * cmI].forEach(function (x) { M.box(x, x + 2 * cmI, y0, y1 - 6 * cmI, deck, H, M.mat("glass", "#e6f0f3")); });
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, y0 + 6 * cmI, y0 + 8 * cmI, H - 6 * cmI, H - 4 * cmI, M.mat("glow", "#fff4d8"));
    // two decks of what it sells
    [deck + 1 * cmI, deck + (H - deck) * 0.45].forEach(function (z, k) {
      if (k) { M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, y0 + 6 * cmI, y0 + D * 0.45, z - 0.8 * cmI, z, M.mat("glass", "#e6f0f3")); }
      var depthEnd = k ? y0 + D * 0.42 : y1 - 14 * cmI;
      for (var x = -W / 2 + 10 * cmI; x < W / 2 - 10 * cmI; x += 14 * cmI) {
        goods(M, x, y0 + 12 * cmI + rnd() * (depthEnd - y0 - 24 * cmI), z, rnd, kind);
      }
    });
  }
  function itPastry(M, x, y, z, rnd) {
    var tone = ["#c98a4b", "#a96a35", "#e0b073", "#7a4a2a", "#f1dcc0"][Math.floor(rnd() * 5)], kind = rnd();
    if (kind < 0.4) { M.ball(x, y, z + 3 * cmI, 7 * cmI, 4 * cmI, 3.5 * cmI, M.mat("fabric", tone), { seg: 6 }); }
    else if (kind < 0.7) { M.cyl(x, y, z, z + 6 * cmI, 6 * cmI, M.mat("fabric", tone), { seg: 12, topMat: M.mat("fabric", ["#f4e7e1", "#5b2a1e", "#e94e6b"][Math.floor(rnd() * 3)]) }); }
    else { M.ball(x, y, z + 2 * cmI, 3.5 * cmI, 3.5 * cmI, 2.5 * cmI, M.mat("fabric", tone), { seg: 5 }); M.ball(x + 6 * cmI, y, z + 2 * cmI, 3.5 * cmI, 3.5 * cmI, 2.5 * cmI, M.mat("fabric", tone), { seg: 5 }); }
  }
  function itDeli(M, x, y, z, rnd) {
    var c = ["#e49a9a", "#c75c5c", "#f2d27a", "#efe3c2", "#8f3b2b", "#d9b36a"][Math.floor(rnd() * 6)];
    if (rnd() < 0.5) { M.box(x - 6 * cmI, x + 6 * cmI, y - 4 * cmI, y + 4 * cmI, z, z + 5 * cmI, M.mat("fabric", c), 1.5 * cmI); }
    else { M.push().move(x, y, z + 4 * cmI).tiltY(90); M.cyl(0, 0, -7 * cmI, 7 * cmI, 4 * cmI, M.mat("fabric", c), { seg: 10, bottom: true }); M.pop(); }
  }
  itAdd("ic_mall", "i_bakerycase", 200, 90, ["o " + itR(0, 0, 200, 90, 3), "t M0 70 Q100 96 200 70", "t " + itC(40, 40, 8) + " " + itC(80, 35, 8) + " " + itC(120, 40, 8) + " " + itC(160, 35, 8)],
        { h: 1.4 }, function (M, W, D, H, C, n) { itCase(M, W, D, H, mPick(C, "#6b4a32", "#2f3236"), n, itPastry); });
  itAdd("ic_mall", "i_delicase", 240, 100, ["o " + itR(0, 0, 240, 100, 3), "t M0 78 Q120 104 240 78", "t " + itRows(0, 10, 240, 60, 40, false)],
        { h: 1.3 }, function (M, W, D, H, C, n) { itCase(M, W, D, H, mPick(C, "#f2f0ea", "#8f969b"), n, itDeli); });
  // an open meat case: a long refrigerated well, packs in rows, its canopy light
  itAdd("ic_mall", "i_meatcase", 360, 110, function (w, h) { return ["o " + itR(0, 0, w, h, 4), "t " + itR(8, 12, w - 16, h - 24, 2), "t " + itRows(8, 12, w - 16, h - 24, 30, false)]; },
        { h: 1.0 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#f2f0ea", "#2f3236");
    var rnd = mRand((n && n.id) || 17), body = M.mat("lacquer", C.main), well = M.mat("metal", "#c9ced2");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.85, body, 1.5 * cmI);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -D / 2 + 8 * cmI, D / 2 - 8 * cmI, H * 0.6, H * 0.86, well);
    for (var x = -W / 2 + 12 * cmI; x < W / 2 - 12 * cmI; x += 16 * cmI) {
      for (var y = -D / 2 + 14 * cmI; y < D / 2 - 14 * cmI; y += 18 * cmI) {
        M.box(x - 6 * cmI, x + 6 * cmI, y - 7 * cmI, y + 7 * cmI, H * 0.86, H * 0.86 + 3 * cmI, M.mat("plastic", "#f4f4f1"));
        M.box(x - 5 * cmI, x + 5 * cmI, y - 6 * cmI, y + 6 * cmI, H * 0.86 + 3 * cmI, H * 0.86 + 3.5 * cmI, M.mat("fabric", ["#c75c5c", "#e49a9a", "#a3423a"][Math.floor(rnd() * 3)]));
      }
    }
    M.box(-W / 2, W / 2, D / 2 - 4 * cmI, D / 2, H * 0.85, H, M.mat("glass", "#e0eef2"));
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 3 * cmI, H * 0.85, H * 1.25, body);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 22 * cmI, H * 1.22, H * 1.27, body);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, -D / 2 + 20 * cmI, H * 1.21, H * 1.22, M.mat("glow", "#fff6e6"));
  });
  // a chest freezer island: white, its glass lids sliding, ice cream and peas under them
  itAdd("ic_mall", "i_chestfreezer", 200, 90, ["o " + itR(0, 0, 200, 90, 6), "t M100 4 V86", "t " + itR(8, 8, 88, 74, 2) + " " + itR(104, 8, 88, 74, 2)],
        { h: 0.9 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#f4f4f1", "#2f6fae");
    var rnd = mRand((n && n.id) || 19);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 4 * cmI, M.mat("lacquer", C.main), 3 * cmI);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 8 * cmI, M.mat("plastic", C.frame));
    for (var x = -W / 2 + 8 * cmI; x < W / 2 - 8 * cmI; x += 11 * cmI) {
      for (var y = -D / 2 + 8 * cmI; y < D / 2 - 8 * cmI; y += 13 * cmI) {
        M.box(x - 4.5 * cmI, x + 4.5 * cmI, y - 5 * cmI, y + 5 * cmI, H - 18 * cmI, H - 18 * cmI + (5 + rnd() * 6) * cmI, M.mat("plastic", IT_PACK[Math.floor(rnd() * IT_PACK.length)]));
      }
    }
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, -D / 2 + 3 * cmI, D / 2 - 3 * cmI, H - 3 * cmI, H - 2 * cmI, M.mat("glass", "#cfe3ea"));
    M.box(-1 * cmI, 1 * cmI, -D / 2 + 3 * cmI, D / 2 - 3 * cmI, H - 4 * cmI, H, M.mat("metal", "#9aa0a5"));
  });
  // a wine rack: a wooden grid, a bottle's end in each square
  itAdd("ic_mall", "i_winerack", 120, 40, ["o " + itR(0, 0, 120, 40, 1), "t " + itRows(0, 0, 120, 40, 12, false)], { h: 1.9 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#7a5236", "#2f4a2c");
    var wood = M.mat("wood", C.main), cols = Math.max(3, Math.round(W / (12 * cmI))), rows = Math.max(4, Math.round(H / (12 * cmI))), rnd = mRand((n && n.id) || 23);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 1.5 * cmI, 0, H, wood);
    for (var i = 0; i <= cols; i++) { var x = -W / 2 + i * W / cols; M.box(x - 0.8 * cmI, x + 0.8 * cmI, -D / 2, D / 2, 0, H, wood); }
    for (var j = 0; j <= rows; j++) { var z = j * H / rows; M.box(-W / 2, W / 2, -D / 2, D / 2, z - 0.8 * cmI, z + 0.8 * cmI, wood); }
    for (var a = 0; a < cols; a++) {
      for (var b = 0; b < rows; b++) {
        if (rnd() < 0.2) { continue; }
        var cx = -W / 2 + (a + 0.5) * W / cols, cz = (b + 0.5) * H / rows;
        M.push().move(cx, 0, cz).tiltX(90);
        M.cyl(0, 0, -D / 2 + 2 * cmI, D / 2 - 6 * cmI, 3.6 * cmI, M.mat("glass", rnd() < 0.6 ? C.frame : "#5b2a1e"), { seg: 10 });
        M.cyl(0, 0, D / 2 - 6 * cmI, D / 2 - 1 * cmI, 1.4 * cmI, M.mat("plastic", "#8f2f2a"), { seg: 8 });
        M.pop();
      }
    }
  });
  // a magazine rack: tiers sloped back, covers of every color
  itAdd("ic_mall", "i_magrack", 120, 40, ["o " + itR(0, 0, 120, 40, 1), "t " + itRows(0, 0, 120, 40, 10, true)], { h: 1.5 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#3a3d40");
    var met = M.mat("metal", C.main), rnd = mRand((n && n.id) || 29), tiers = 5;
    [-W / 2, W / 2 - 2 * cmI].forEach(function (x) { M.box(x, x + 2 * cmI, -D / 2, D / 2, 0, H, met); });
    for (var t = 0; t < tiers; t++) {
      var y = D / 2 - (t + 0.5) * D / tiers, z = 30 * cmI + t * (H - 40 * cmI) / tiers;
      M.box(-W / 2, W / 2, y - 4 * cmI, y + 4 * cmI, z - 1 * cmI, z, met);
      for (var x = -W / 2 + 4 * cmI; x < W / 2 - 22 * cmI; x += 24 * cmI) {
        M.push().move(x + 10 * cmI, y + 2 * cmI, z).tiltX(-15);
        M.box(-10 * cmI, 10 * cmI, -0.4 * cmI, 0.4 * cmI, 0, 27 * cmI, M.mat("plastic", IT_PACK[Math.floor(rnd() * IT_PACK.length)]));
        M.pop();
      }
    }
  });
  // a round rack of clothes: a chrome ring on its stand, garments all round it
  itAdd("ic_mall", "i_roundrack", 120, 120, ["o " + itC(60, 60, 58), "t " + itC(60, 60, 44), "k " + itC(60, 60, 5)], { h: 1.4 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#c9ced2");
    var chrome = M.mat("chrome", C.main), R = Math.min(W, D) / 2 - 8 * cmI, rnd = mRand((n && n.id) || 31);
    M.cyl(0, 0, 0, 3 * cmI, 30 * cmI, chrome, { seg: 16 });
    M.cyl(0, 0, 3 * cmI, H - 2 * cmI, 2 * cmI, chrome, { seg: 8 });
    M.lathe(0, 0, [[R, H - 4 * cmI], [R, H - 2 * cmI]], chrome, { seg: 28, top: false });
    var hues = ["#2f4a6a", "#8f2f2a", "#efefe8", "#3f5a3c", "#b8a27a", "#1f2226", "#d96aa0", "#7f8794"];
    for (var i = 0; i < 26; i++) {
      var a = i / 26 * Math.PI * 2, x = Math.cos(a) * R, y = Math.sin(a) * R, drop = (55 + rnd() * 35) * cmI;
      M.push().move(x, y, H - 4 * cmI - drop).turn(a * 180 / Math.PI + 90);
      M.box(-20 * cmI, 20 * cmI, -1.6 * cmI, 1.6 * cmI, 0, drop - 4 * cmI, M.mat("fabric", hues[Math.floor(rnd() * hues.length)]), 1 * cmI);
      M.pop();
    }
  });
  // a mannequin: on its stand, dressed
  itAdd("ic_mall", "i_mannequin", 50, 40, ["o " + itC(25, 20, 18), "o " + itC(25, 20, 7)], { h: 1.85 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f4a6a", "#e8e2d8");
    var skin = M.mat("lacquer", C.frame), cloth = M.mat("fabric", C.main);
    M.cyl(0, 0, 0, 2 * cmI, 18 * cmI, M.mat("chrome", "#c9ced2"), { seg: 18 });
    M.cyl(0, 0, 2 * cmI, 20 * cmI, 1.6 * cmI, M.mat("chrome", "#c9ced2"), { seg: 8 });
    [-1, 1].forEach(function (s) { M.cyl(s * 8 * cmI, 0, 20 * cmI, 92 * cmI, 6 * cmI, cloth, { seg: 10, r1: 7 * cmI }); });
    M.lathe(0, 0, [[15 * cmI, 90 * cmI], [17 * cmI, 105 * cmI], [14 * cmI, 125 * cmI], [19 * cmI, 145 * cmI], [8 * cmI, 152 * cmI]], cloth, { seg: 16, ry: 0.6 });
    [-1, 1].forEach(function (s) { M.tube([s * 18 * cmI, 0, 145 * cmI], [s * 24 * cmI, 2 * cmI, 95 * cmI], 3.5 * cmI, cloth, 8); M.ball(s * 24 * cmI, 2 * cmI, 92 * cmI, 3.5 * cmI, 3.5 * cmI, 5 * cmI, skin, { seg: 6 }); });
    M.cyl(0, 0, 150 * cmI, 160 * cmI, 4.5 * cmI, skin, { seg: 10 });
    M.ball(0, 0, 172 * cmI, 10 * cmI, 11 * cmI, 13 * cmI, skin, { seg: 10 });
  });
  // the end of an aisle: a header sign, shelves of the week's offer
  itAdd("ic_mall", "i_endcap", 120, 60, ["o " + itR(0, 0, 120, 60, 2), "t " + itRows(0, 0, 120, 60, 15, true), "k " + itR(4, 2, 112, 8, 1)], { h: 1.8 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#e8e8e4", "#c43c3a");
    var met = M.mat("metal", C.main), rnd = mRand((n && n.id) || 37), col = IT_PACK[Math.floor(rnd() * IT_PACK.length)];
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 4 * cmI, 0, H, met);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 12 * cmI, met);
    [-W / 2, W / 2 - 2 * cmI].forEach(function (x) { M.box(x, x + 2 * cmI, -D / 2, D / 2, 0, H - 22 * cmI, met); });
    for (var z = 12 * cmI; z < H - 40 * cmI; z += 36 * cmI) {
      M.box(-W / 2, W / 2, -D / 2, D / 2, z, z + 2 * cmI, met);
      itGoods(M, -W / 2 + 3 * cmI, W / 2 - 3 * cmI, -D / 2 + 6 * cmI, D / 2 - 4 * cmI, z + 2 * cmI, 28 * cmI, rnd, [col, mShade(col, 0.25), "#efefe8"]);
    }
    M.box(-W / 2, W / 2, D / 2 - 6 * cmI, D / 2 - 3 * cmI, H - 25 * cmI, H, M.mat("plastic", C.frame));
  });
  // pallet racking: blue uprights, orange beams, pallets of stock three high
  itAdd("ic_mall", "i_palletrack", 270, 110, ["o " + itR(0, 0, 270, 110, 1), "k " + itR(0, 0, 8, 110, 0) + " " + itR(262, 0, 8, 110, 0), "t " + itR(14, 8, 116, 94, 1) + " " + itR(140, 8, 116, 94, 1)],
        { h: 4.5 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#2f6fae", "#f08a24");
    var up = M.mat("metal", C.main), beam = M.mat("metal", C.frame), rnd = mRand((n && n.id) || 41);
    [-W / 2, W / 2 - 8 * cmI].forEach(function (x) { [-D / 2, D / 2 - 8 * cmI].forEach(function (y) { M.box(x, x + 8 * cmI, y, y + 8 * cmI, 0, H, up); }); });
    [-W / 2, W / 2 - 8 * cmI].forEach(function (x) {
      for (var z = 30 * cmI; z < H; z += 60 * cmI) { M.tube([x + 4 * cmI, -D / 2 + 4 * cmI, z], [x + 4 * cmI, D / 2 - 4 * cmI, z + 50 * cmI], 1.5 * cmI, up, 4); }
    });
    [0, 1.5, 3.0].forEach(function (lv) {
      var z = lv * 100 * cmI;
      if (lv) { [-D / 2, D / 2 - 6 * cmI].forEach(function (y) { M.box(-W / 2, W / 2, y, y + 6 * cmI, z - 12 * cmI, z, beam); }); }
      [-1, 1].forEach(function (s) {
        if (rnd() < 0.12) { return; }
        var cx = s * W / 4;
        M.box(cx - 58 * cmI, cx + 58 * cmI, -D / 2 + 6 * cmI, D / 2 - 6 * cmI, z, z + 14 * cmI, M.mat("wood", "#b48a5a"));
        var tall = (60 + rnd() * 50) * cmI;
        M.box(cx - 55 * cmI, cx + 55 * cmI, -D / 2 + 9 * cmI, D / 2 - 9 * cmI, z + 14 * cmI, z + 14 * cmI + tall, M.mat("plastic", rnd() < 0.5 ? "#b98e5a" : "#c9a273"), 1 * cmI);
        M.box(cx - 55.5 * cmI, cx + 55.5 * cmI, -D / 2 + 8.5 * cmI, D / 2 - 8.5 * cmI, z + 14 * cmI, z + 16 * cmI + tall * 0.9, M.mat("glass", "#e8eef0"));
      });
    });
  });
  // a forklift: yellow, its counterweight behind, the cage over the seat, the mast and forks in front
  itAdd("ic_mall", "i_forklift", 120, 250, ["o " + itR(10, 40, 100, 150, 10), "k " + itR(20, 0, 10, 50, 0) + " " + itR(90, 0, 10, 50, 0), "t " + itR(25, 70, 70, 70, 4)],
        { h: 2.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#f2b81f", "#2a2c2e");
    var body = M.mat("lacquer", C.main), dark = M.mat("metal", C.frame), rub = M.mat("rubber", "#151515"), yb = -D / 2 + 80 * cmI;
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, yb, D / 2 - 5 * cmI, 20 * cmI, 95 * cmI, body, 6 * cmI);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, D / 2 - 45 * cmI, D / 2, 20 * cmI, 110 * cmI, dark, 8 * cmI);          // the counterweight
    [[yb + 25 * cmI, 30 * cmI], [D / 2 - 40 * cmI, 25 * cmI]].forEach(function (a) {
      [-1, 1].forEach(function (s) { itWheel(M, s * (W / 2 - 10 * cmI), a[0], a[1], a[1], 18 * cmI, rub); });
    });
    M.box(-24 * cmI, 24 * cmI, yb + 70 * cmI, yb + 110 * cmI, 95 * cmI, 140 * cmI, M.mat("leather", "#1f2226"), 4 * cmI);
    [[-1, yb + 30 * cmI], [1, yb + 30 * cmI], [-1, D / 2 - 50 * cmI], [1, D / 2 - 50 * cmI]].forEach(function (p) {
      M.box(p[0] * (W / 2 - 14 * cmI) - 3 * cmI, p[0] * (W / 2 - 14 * cmI) + 3 * cmI, p[1] - 3 * cmI, p[1] + 3 * cmI, 95 * cmI, H, dark);
    });
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, yb + 25 * cmI, D / 2 - 45 * cmI, H - 5 * cmI, H, dark);
    M.tube([0, yb + 45 * cmI, 115 * cmI], [0, yb + 30 * cmI, 140 * cmI], 2 * cmI, dark, 6);
    M.lathe(0, yb + 30 * cmI, [[16 * cmI, 141 * cmI], [16 * cmI, 143 * cmI]], dark, { seg: 16, top: false, ry: 0.5 });
    [-1, 1].forEach(function (s) { M.box(s * 30 * cmI - 4 * cmI, s * 30 * cmI + 4 * cmI, yb - 12 * cmI, yb - 4 * cmI, 10 * cmI, H + 10 * cmI, dark); });   // the mast
    M.box(-34 * cmI, 34 * cmI, yb - 16 * cmI, yb - 10 * cmI, 10 * cmI, 70 * cmI, dark);
    [-1, 1].forEach(function (s) { M.box(s * 25 * cmI - 6 * cmI, s * 25 * cmI + 6 * cmI, -D / 2, yb - 12 * cmI, 6 * cmI, 10 * cmI, M.mat("chrome", "#9aa0a5")); });
  });
  // a pallet of stock: the wooden pallet, boxes on it, wrapped
  itAdd("ic_mall", "i_pallet", 120, 100, ["o " + itR(0, 0, 120, 100, 1), "t " + itRows(0, 0, 120, 100, 20, false), "t M0 50 H120"], { h: 1.2 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#b48a5a", "#b98e5a");
    var wood = M.mat("wood", C.main), rnd = mRand((n && n.id) || 43);
    [-D / 2, -6 * cmI, D / 2 - 12 * cmI].forEach(function (y) { M.box(-W / 2, W / 2, y, y + 12 * cmI, 0, 10 * cmI, wood); });
    for (var x = -W / 2; x < W / 2 - 1; x += W / 7) { M.box(x + 1 * cmI, x + W / 7 - 1 * cmI, -D / 2, D / 2, 10 * cmI, 13 * cmI, wood); }
    for (var z = 13 * cmI; z < H - 20 * cmI; z += 30 * cmI) {
      for (var bx = 0; bx < 3; bx++) {
        for (var by = 0; by < 2; by++) {
          if (z > 60 * cmI && rnd() < 0.25) { continue; }
          M.box(-W / 2 + 2 * cmI + bx * (W - 4 * cmI) / 3, -W / 2 + 2 * cmI + (bx + 1) * (W - 4 * cmI) / 3 - 1 * cmI, -D / 2 + 2 * cmI + by * (D - 4 * cmI) / 2, -D / 2 + 2 * cmI + (by + 1) * (D - 4 * cmI) / 2 - 1 * cmI,
                z, z + 29 * cmI, M.mat("plastic", mShade(C.frame, (rnd() - 0.5) * 0.12)), 0.6 * cmI);
        }
      }
    }
  });
  // a mall kiosk: a counter island of glass cases, a canopy on four posts, its name round the top
  itAdd("ic_mall", "i_kiosk", 300, 200, ["o " + itR(0, 0, 300, 200, 20), "t " + itR(30, 30, 240, 140, 12), "k " + itC(15, 15, 5) + " " + itC(285, 15, 5) + " " + itC(15, 185, 5) + " " + itC(285, 185, 5)],
        { h: 2.6 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#efe7d6", "#2f6f7a");
    var body = M.mat("lacquer", C.main), accent = M.mat("lacquer", C.frame), rnd = mRand((n && n.id) || 47);
    M.box(-W / 2 + 15 * cmI, W / 2 - 15 * cmI, -D / 2 + 15 * cmI, D / 2 - 15 * cmI, 0, 90 * cmI, body, 6 * cmI);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 90 * cmI, 94 * cmI, M.mat("wood", "#8a6a4c"), 3 * cmI);
    itGlassBox(M, -W / 2 + 25 * cmI, W / 2 - 25 * cmI, -D / 2 + 25 * cmI, -D / 2 + 70 * cmI, 94 * cmI, 125 * cmI);
    for (var x = -W / 2 + 35 * cmI; x < W / 2 - 35 * cmI; x += 18 * cmI) { M.box(x, x + 10 * cmI, -D / 2 + 35 * cmI, -D / 2 + 55 * cmI, 94 * cmI, (100 + rnd() * 15) * cmI, M.mat("plastic", IT_PACK[Math.floor(rnd() * IT_PACK.length)])); }
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.cyl(s[0] * (W / 2 - 8 * cmI), s[1] * (D / 2 - 8 * cmI), 0, H - 25 * cmI, 3 * cmI, M.mat("chrome", "#c9ced2"), { seg: 10 }); });
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 28 * cmI, H, accent, 4 * cmI);
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, -D / 2 - 0.5 * cmI, -D / 2, H - 22 * cmI, H - 6 * cmI, M.mat("glow", "#fff6e6"));
    M.cyl(W / 4, D / 4, 0, 65 * cmI, 16 * cmI, M.mat("leather", "#2a2c2e"), { seg: 12 });
  });
  // a cash machine: its screen and keys under a hood, the card slot, a light over it
  itAdd("ic_mall", "i_atm", 60, 70, ["o " + itR(0, 0, 60, 70, 4), "t " + itR(10, 50, 40, 14, 2), "k " + itR(18, 6, 24, 6, 1)], { h: 1.7 }, function (M, W, D, H, C) {
    C = mPick(C, "#3a3f45", "#1f5fa8");
    var body = M.mat("metal", C.main), y1 = D / 2;
    M.box(-W / 2, W / 2, -D / 2, y1 - 10 * cmI, 0, H, body, 2 * cmI);
    M.box(-W / 2, W / 2, y1 - 10 * cmI, y1, 0, 95 * cmI, body, 2 * cmI);
    M.push().move(0, y1 - 10 * cmI, 125 * cmI).tiltX(-15);
    M.box(-18 * cmI, 18 * cmI, 0, 1 * cmI, -12 * cmI, 12 * cmI, M.mat("screen", "#2f6fae"));
    M.pop();
    M.box(-12 * cmI, 12 * cmI, y1 - 22 * cmI, y1 - 2 * cmI, 95 * cmI, 97 * cmI, M.mat("plastic", "#9aa0a5"));
    for (var i = 0; i < 12; i++) { var kx = -9 * cmI + (i % 3) * 6 * cmI, ky = y1 - 19 * cmI + Math.floor(i / 3) * 4.5 * cmI; M.box(kx - 2 * cmI, kx + 2 * cmI, ky - 1.6 * cmI, ky + 1.6 * cmI, 97 * cmI, 98 * cmI, M.mat("plastic", "#e8e8e4")); }
    M.box(14 * cmI, 22 * cmI, y1 - 10.5 * cmI, y1 - 10 * cmI, 108 * cmI, 111 * cmI, M.mat("glow", "#57c46f"));
    M.box(-W / 2, W / 2, -D / 2, y1 + 6 * cmI, H - 18 * cmI, H, M.mat("lacquer", C.frame), 2 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, y1 + 6 * cmI, y1 + 6.4 * cmI, H - 14 * cmI, H - 4 * cmI, M.mat("glow", "#ffffff"));
  });
  // a vending machine: a lit glass front, rows of snacks and drinks, its keypad, the tray below
  itAdd("ic_mall", "i_vending", 100, 80, ["o " + itR(0, 0, 100, 80, 3), "t " + itR(6, 60, 64, 16, 1), "k " + itR(76, 62, 16, 12, 1)], { h: 1.9 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#c43c3a", "#2a2c2e");
    var body = M.mat("lacquer", C.main), rnd = mRand((n && n.id) || 53), y1 = D / 2, gx1 = W / 2 - 26 * cmI;
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 2 * cmI);
    M.box(-W / 2 + 5 * cmI, gx1, y1 - 18 * cmI, y1 - 2 * cmI, 30 * cmI, H - 8 * cmI, M.mat("plastic", "#2b2d31"));
    for (var z = 36 * cmI; z < H - 20 * cmI; z += 22 * cmI) {
      M.box(-W / 2 + 6 * cmI, gx1 - 1 * cmI, y1 - 18 * cmI, y1 - 3 * cmI, z - 1 * cmI, z, M.mat("chrome", "#c9ced2"));
      for (var x = -W / 2 + 9 * cmI; x < gx1 - 8 * cmI; x += 10 * cmI) { M.box(x, x + 7 * cmI, y1 - 12 * cmI, y1 - 6 * cmI, z, z + (12 + rnd() * 5) * cmI, M.mat("plastic", IT_PACK[Math.floor(rnd() * IT_PACK.length)])); }
    }
    M.box(-W / 2 + 4 * cmI, gx1 + 1 * cmI, y1 - 1 * cmI, y1, 28 * cmI, H - 6 * cmI, M.mat("glass", "#dfeef2"));
    M.box(-W / 2 + 4 * cmI, gx1, y1 - 2 * cmI, y1, H - 6 * cmI, H - 5 * cmI, M.mat("glow", "#ffffff"));
    M.box(gx1 + 5 * cmI, W / 2 - 5 * cmI, y1, y1 + 0.4 * cmI, 110 * cmI, 140 * cmI, M.mat("plastic", "#1f2226"));
    M.box(gx1 + 7 * cmI, W / 2 - 7 * cmI, y1 + 0.4 * cmI, y1 + 0.6 * cmI, 128 * cmI, 138 * cmI, M.mat("screen", "#57c46f"));
    M.box(-W / 2 + 8 * cmI, gx1 - 6 * cmI, y1 - 1 * cmI, y1 + 0.5 * cmI, 8 * cmI, 22 * cmI, M.mat("plastic", "#151515"));
  });
  // a photo booth: a box with its curtain open at the side, the screen, its sign lit over it
  itAdd("ic_mall", "i_photobooth", 150, 100, ["o " + itR(0, 0, 150, 100, 3), "t M100 0 V100", "t- M100 20 Q120 50 100 80"], { h: 2.1 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f6fae", "#c43c3a");
    var body = M.mat("lacquer", C.main), xs = W / 2 - 50 * cmI;
    M.box(-W / 2, xs, -D / 2, D / 2, 0, H, body, 2 * cmI);
    M.box(xs, W / 2, -D / 2, -D / 2 + 3 * cmI, 0, H, body); M.box(xs, W / 2, -D / 2, D / 2, H - 4 * cmI, H, body); M.box(W / 2 - 3 * cmI, W / 2, -D / 2, D / 2, 0, H, body);
    for (var i = 0; i < 6; i++) { var cy = -D / 2 + 10 * cmI + i * 7 * cmI; M.box(xs + 2 * cmI, xs + 6 * cmI, cy, cy + 6 * cmI, 20 * cmI, H - 8 * cmI, M.mat("velvet", C.frame), 2 * cmI); }
    M.box(-W / 2 + 10 * cmI, xs - 10 * cmI, D / 2, D / 2 + 0.4 * cmI, 140 * cmI, 190 * cmI, M.mat("glow", "#fff1d0"));
    M.box(xs + 10 * cmI, W / 2 - 6 * cmI, -D / 2 + 30 * cmI, -D / 2 + 70 * cmI, 0, 45 * cmI, M.mat("leather", "#2a2c2e"));
    M.box(xs - 0.5 * cmI, xs, -18 * cmI, 18 * cmI, 115 * cmI, 145 * cmI, M.mat("screen", "#1f2226"));
  });
  // an indoor fountain: a round stone basin, the water, a column with its bowls, jets
  itAdd("ic_mall", "i_mallfountain", 300, 300, ["o " + itC(150, 150, 148), "t " + itC(150, 150, 130), "o " + itC(150, 150, 30), "t " + itC(150, 150, 14)],
        { h: 1.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#d6cdbd", "#5fa6c8");
    var stone = M.mat("stone", C.main), water = M.mat("water", C.frame), R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R, 0], [R, 45 * cmI], [R - 15 * cmI, 45 * cmI], [R - 15 * cmI, 10 * cmI], [0, 10 * cmI]], stone, { seg: 36 });
    M.disc(0, 0, 38 * cmI, R - 15 * cmI, R - 15 * cmI, water, 36);
    M.lathe(0, 0, [[22 * cmI, 10 * cmI], [12 * cmI, 30 * cmI], [10 * cmI, 90 * cmI], [45 * cmI, 95 * cmI], [45 * cmI, 102 * cmI], [8 * cmI, 102 * cmI], [6 * cmI, H]], stone, { seg: 24 });
    M.disc(0, 0, 100 * cmI, 42 * cmI, 42 * cmI, water, 24);
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      M.tube([Math.cos(a) * 40 * cmI, Math.sin(a) * 40 * cmI, 100 * cmI], [Math.cos(a) * 70 * cmI, Math.sin(a) * 70 * cmI, 40 * cmI], 1.5 * cmI, water, 5);
    }
    M.cyl(0, 0, H, H + 25 * cmI, 2 * cmI, water, { seg: 6, r1: 0.6 * cmI });
  });
  // a mall directory: a pylon, its lit map, the header
  itAdd("ic_mall", "i_directory", 80, 40, ["o " + itR(0, 0, 80, 40, 4), "k " + itR(6, 34, 68, 4, 1)], { h: 2.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#3a3d40", "#2f6f7a");
    var body = M.mat("metal", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, body, 3 * cmI);
    [-1, 1].forEach(function (s) {
      M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, s * D / 2, s * (D / 2 + 0.4 * cmI), 50 * cmI, H - 30 * cmI, M.mat("glow", "#f4f6f7"));
      for (var i = 0; i < 6; i++) { M.box(-W / 2 + 12 * cmI + (i % 3) * 20 * cmI, -W / 2 + 28 * cmI + (i % 3) * 20 * cmI, s * (D / 2 + 0.5 * cmI), s * (D / 2 + 0.7 * cmI), 70 * cmI + Math.floor(i / 3) * 40 * cmI, 100 * cmI + Math.floor(i / 3) * 40 * cmI, M.mat("plastic", IT_PACK[i])); }
      M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, s * D / 2, s * (D / 2 + 0.4 * cmI), H - 24 * cmI, H - 6 * cmI, M.mat("plastic", C.frame));
    });
  });
  // an information desk: a rounded front, its counter, an "i" on a pole
  itAdd("ic_mall", "i_infodesk", 300, 150, ["o M10 10 H290 V60 Q290 140 150 140 Q10 140 10 60 Z", "t M40 30 H260", "k " + itC(150, 80, 8)], { h: 1.1 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#2f6fae");
    var body = M.mat("lacquer", C.main), top = M.mat("stone", "#e8e4dc");
    M.push().move(0, -D / 2 + 20 * cmI, 0);
    M.lathe(0, 0, [[W / 2 - 4 * cmI, 0], [W / 2 - 4 * cmI, H - 4 * cmI]], body, { seg: 24, from: 0, to: 180, top: false, ry: (D - 30 * cmI) / (W - 8 * cmI) });
    M.lathe(0, 0, [[W / 2, H - 4 * cmI], [W / 2, H]], top, { seg: 24, from: 0, to: 180, top: true, ry: (D - 24 * cmI) / W });
    M.pop();
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2, -D / 2 + 22 * cmI, 0, 75 * cmI, body);
    M.cyl(0, D / 2 - 30 * cmI, H, H + 120 * cmI, 2 * cmI, M.mat("chrome", "#c9ced2"), { seg: 8 });
    M.cyl(0, D / 2 - 30 * cmI, H + 110 * cmI, H + 112 * cmI, 20 * cmI, M.mat("lacquer", C.frame), { seg: 24 });
  });
  // shop-door security gates: two clear pedestals with their lights
  itAdd("ic_mall", "i_secgate", 180, 20, ["o " + itR(0, 4, 14, 12, 3) + " " + itR(166, 4, 14, 12, 3), "t- M14 10 H166"], { h: 1.5 }, function (M, W, D, H) {
    [-1, 1].forEach(function (s) {
      var x = s * (W / 2 - 7 * cmI);
      M.box(x - 12 * cmI, x + 12 * cmI, -D / 2, D / 2, 0, 6 * cmI, M.mat("metal", "#9aa0a5"), 2 * cmI);
      M.box(x - 2 * cmI, x + 2 * cmI, -D / 2 + 2 * cmI, D / 2 - 2 * cmI, 6 * cmI, H, M.mat("glass", "#d7e6ee"));
      M.box(x - 0.5 * cmI, x + 0.5 * cmI, -D / 2 + 3 * cmI, D / 2 - 3 * cmI, 8 * cmI, H - 4 * cmI, M.mat("glow", "#7fd1ff"));
    });
  });
  // a stack of baskets on their stand
  itAdd("ic_mall", "i_basketstack", 45, 35, ["o " + itR(0, 0, 45, 35, 4), "t " + itR(5, 5, 35, 25, 3)], { h: 0.9 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#3a3d40");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 8 * cmI, M.mat("metal", C.frame));
    for (var k = 0; k < 12; k++) {
      var z = 8 * cmI + k * 6 * cmI;
      M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 2 * cmI, D / 2 - 2 * cmI, z, z + 5 * cmI, M.mat("plastic", C.main), 1 * cmI);
    }
    M.tube([-W / 2 + 6 * cmI, 0, 8 * cmI + 12 * 6 * cmI], [W / 2 - 6 * cmI, 0, 8 * cmI + 12 * 6 * cmI + 6 * cmI], 0.8 * cmI, M.mat("plastic", "#1f2226"), 6);
  });
  // a price checker on its post
  itAdd("ic_mall", "i_pricecheck", 30, 20, ["o " + itC(15, 10, 9), "k " + itR(8, 2, 14, 5, 1)], { h: 1.5 }, function (M, W, D, H) {
    M.cyl(0, 0, 0, 2 * cmI, 14 * cmI, M.mat("metal", "#3a3d40"), { seg: 14 });
    M.cyl(0, 0, 2 * cmI, H - 25 * cmI, 2.4 * cmI, M.mat("metal", "#9aa0a5"), { seg: 10 });
    M.push().move(0, 2 * cmI, H - 15 * cmI).tiltX(-25);
    M.box(-12 * cmI, 12 * cmI, -4 * cmI, 4 * cmI, -12 * cmI, 12 * cmI, M.mat("plastic", "#2a2c2e"), 1.5 * cmI);
    M.box(-10 * cmI, 10 * cmI, 4 * cmI, 4.3 * cmI, -2 * cmI, 10 * cmI, M.mat("screen", "#2f6fae"));
    M.box(-6 * cmI, 6 * cmI, 4 * cmI, 4.3 * cmI, -10 * cmI, -5 * cmI, M.mat("glow", "#e0444f"));
    M.pop();
  });
  // a customer service desk: a long counter, its registers, a sign hung over it
  itAdd("ic_mall", "i_servicedesk", 400, 100, function (w, h) { return ["o " + itR(0, 20, w, h - 20, 3), "t M0 40 H" + itN(w), "k " + itR(20, 0, w - 40, 10, 2)]; }, { h: 1.1 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#2f6fae");
    var body = M.mat("lacquer", C.main), top = M.mat("stone", "#d8d2c6"), n = Math.max(1, Math.round(W / (140 * cmI)));
    M.box(-W / 2, W / 2, -D / 2 + 20 * cmI, D / 2, 0, H - 4 * cmI, body, 2 * cmI);
    M.box(-W / 2 - 2 * cmI, W / 2 + 2 * cmI, -D / 2 + 18 * cmI, D / 2 + 4 * cmI, H - 4 * cmI, H, top);
    for (var i = 0; i < n; i++) {
      var x = -W / 2 + (i + 0.5) * W / n;
      M.box(x - 14 * cmI, x + 14 * cmI, -D / 2 + 26 * cmI, -D / 2 + 50 * cmI, H, H + 8 * cmI, M.mat("plastic", "#2a2c2e"), 1 * cmI);
      M.box(x - 12 * cmI, x + 12 * cmI, -D / 2 + 30 * cmI, -D / 2 + 31 * cmI, H + 8 * cmI, H + 26 * cmI, M.mat("screen", "#1f2226"));
    }
    [-1, 1].forEach(function (s) { M.cyl(s * (W / 2 - 20 * cmI), -D / 2 + 10 * cmI, 0, H + 150 * cmI, 2.4 * cmI, M.mat("metal", "#3a3d40"), { seg: 8 }); });
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 6 * cmI, -D / 2 + 14 * cmI, H + 110 * cmI, H + 150 * cmI, M.mat("lacquer", C.frame), 2 * cmI);
    M.box(-W / 2 + 20 * cmI, W / 2 - 20 * cmI, -D / 2 + 14 * cmI, -D / 2 + 14.4 * cmI, H + 118 * cmI, H + 142 * cmI, M.mat("glow", "#ffffff"));
  });
  // a shop's cash desk: a wooden top, the register, a shelf of bags
  itAdd("ic_mall", "i_cashwrap", 200, 80, ["o " + itR(0, 0, 200, 80, 3), "t M0 20 H200", "k " + itR(80, 30, 40, 24, 2)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#2a2c2e", "#a57a52");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 4 * cmI, M.mat("lacquer", C.main), 2 * cmI);
    M.box(-W / 2 - 3 * cmI, W / 2 + 3 * cmI, -D / 2 - 3 * cmI, D / 2 + 3 * cmI, H - 4 * cmI, H, M.mat("wood", C.frame), 1 * cmI);
    M.box(-18 * cmI, 18 * cmI, -12 * cmI, 12 * cmI, H, H + 10 * cmI, M.mat("plastic", "#e8e8e4"), 1.5 * cmI);
    M.push().move(0, -10 * cmI, H + 10 * cmI).tiltX(20);
    M.box(-15 * cmI, 15 * cmI, -1 * cmI, 1 * cmI, 0, 20 * cmI, M.mat("plastic", "#2a2c2e")); M.box(-13 * cmI, 13 * cmI, 1 * cmI, 1.3 * cmI, 2 * cmI, 18 * cmI, M.mat("screen", "#2f6fae"));
    M.pop();
    for (var i = 0; i < 4; i++) { M.box(W / 2 - 50 * cmI + i * 4 * cmI, W / 2 - 18 * cmI + i * 4 * cmI, D / 2 - 18 * cmI, D / 2 - 4 * cmI, H, H + (20 - i * 3) * cmI, M.mat("fabric", "#e9e2d4")); }
  });
  // a jewelry case: glass over velvet trays, rings and chains catching the light
  itAdd("ic_mall", "i_jewelcase", 150, 60, ["o " + itR(0, 0, 150, 60, 2), "t " + itR(6, 6, 138, 48, 1), "t " + itC(40, 30, 5) + " " + itC(75, 30, 5) + " " + itC(110, 30, 5)],
        { h: 1.0 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#2a2c2e", "#1f3a5a");
    var rnd = mRand((n && n.id) || 59);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 25 * cmI, M.mat("lacquer", C.main), 2 * cmI);
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, -D / 2 + 3 * cmI, D / 2 - 3 * cmI, H - 25 * cmI, H - 23 * cmI, M.mat("velvet", C.frame));
    for (var i = 0; i < 14; i++) {
      var x = -W / 2 + 10 * cmI + rnd() * (W - 20 * cmI), y = -D / 2 + 10 * cmI + rnd() * (D - 20 * cmI);
      M.lathe(x, y, [[2 * cmI, H - 23 * cmI], [2 * cmI, H - 22 * cmI]], M.mat(rnd() < 0.6 ? "brass" : "chrome", rnd() < 0.6 ? "#d4a62a" : "#e8e8ec"), { seg: 10, top: false });
    }
    itGlassBox(M, -W / 2, W / 2, -D / 2, D / 2, H - 23 * cmI, H);
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 2 * cmI, -D / 2 + 3 * cmI, H - 3 * cmI, H - 2 * cmI, M.mat("glow", "#fff4d8"));
  });
  // a tall glass display case: glass shelves, things on show, a light at the top
  itAdd("ic_mall", "i_glasscase", 100, 50, ["o " + itR(0, 0, 100, 50, 1), "t " + itRows(0, 0, 100, 50, 25, false)], { h: 1.8 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#3a3d40");
    var rnd = mRand((n && n.id) || 61), frame = M.mat("metal", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 18 * cmI, frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 6 * cmI, H, frame);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.box(s[0] * (W / 2 - 1.5 * cmI) - 1.5 * cmI, s[0] * (W / 2 - 1.5 * cmI) + 1.5 * cmI, s[1] * (D / 2 - 1.5 * cmI) - 1.5 * cmI, s[1] * (D / 2 - 1.5 * cmI) + 1.5 * cmI, 18 * cmI, H - 6 * cmI, frame); });
    itGlassBox(M, -W / 2 + 1 * cmI, W / 2 - 1 * cmI, -D / 2 + 1 * cmI, D / 2 - 1 * cmI, 18 * cmI, H - 6 * cmI);
    for (var z = 18 * cmI; z < H - 30 * cmI; z += 38 * cmI) {
      M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 2 * cmI, D / 2 - 2 * cmI, z, z + 0.8 * cmI, M.mat("glass", "#e6f0f3"));
      for (var x = -W / 2 + 12 * cmI; x < W / 2 - 10 * cmI; x += 22 * cmI) { M.lathe(x, 0, [[5 * cmI, z + 1 * cmI], [6 * cmI, z + 8 * cmI], [3 * cmI, z + (14 + rnd() * 8) * cmI]], M.mat("ceramic", IT_PACK[Math.floor(rnd() * IT_PACK.length)]), { seg: 12, top: true }); }
    }
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, D / 2 - 4 * cmI, H - 6.5 * cmI, H - 6 * cmI, M.mat("glow", "#fff4d8"));
  });
  // a bank of lockers: doors in a grid, vents, handles
  itAdd("ic_mall", "i_lockers", 120, 50, function (w, h) { return ["o " + itR(0, 0, w, h, 1), "t " + itRows(0, 0, w, h, 30, false)]; }, { h: 1.9 }, function (M, W, D, H, C) {
    C = mPick(C, "#7f9aa8", "#2a2c2e");
    var body = M.mat("metal", C.main), cols = Math.max(1, Math.round(W / (30 * cmI))), rows = 3;
    M.box(-W / 2, W / 2, -D / 2, D / 2 - 1 * cmI, 0, H, body);
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        var x0 = -W / 2 + i * W / cols + 0.5 * cmI, x1 = -W / 2 + (i + 1) * W / cols - 0.5 * cmI, z0 = 10 * cmI + j * (H - 12 * cmI) / rows + 0.5 * cmI, z1 = 10 * cmI + (j + 1) * (H - 12 * cmI) / rows - 0.5 * cmI;
        M.box(x0, x1, D / 2 - 1 * cmI, D / 2, z0, z1, M.mat("metal", mShade(C.main, 0.06)));
        for (var v = 0; v < 3; v++) { M.box(x0 + 5 * cmI, x1 - 5 * cmI, D / 2, D / 2 + 0.2 * cmI, z1 - (6 + v * 2.5) * cmI, z1 - (5 + v * 2.5) * cmI, M.mat("metal", C.frame)); }
        M.box(x1 - 5 * cmI, x1 - 3 * cmI, D / 2, D / 2 + 1.5 * cmI, (z0 + z1) / 2 - 4 * cmI, (z0 + z1) / 2 + 4 * cmI, M.mat("chrome", "#c9ced2"));
      }
    }
  });
  // a coin ride: a little red car on its rocking base
  itAdd("ic_mall", "i_kidride", 120, 80, ["o " + itR(0, 0, 120, 80, 14), "o " + itR(20, 15, 80, 50, 18), "k " + itC(35, 15, 6) + " " + itC(85, 15, 6) + " " + itC(35, 65, 6) + " " + itC(85, 65, 6)],
        { h: 1.4 }, function (M, W, D, H, C) {
    C = mPick(C, "#d63a2f", "#f2c94c");
    var body = M.mat("lacquer", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 20 * cmI, M.mat("plastic", C.frame), 6 * cmI);
    M.box(-W / 2 + 15 * cmI, W / 2 - 12 * cmI, -D / 2 + 12 * cmI, D / 2 - 12 * cmI, 30 * cmI, 70 * cmI, body, 12 * cmI);
    M.box(-W / 2 + 35 * cmI, W / 2 - 40 * cmI, -D / 2 + 16 * cmI, D / 2 - 16 * cmI, 70 * cmI, 100 * cmI, M.mat("glass", "#bcd3de"), 6 * cmI);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { itWheel(M, s[0] * 30 * cmI, s[1] * (D / 2 - 10 * cmI), 35 * cmI, 12 * cmI, 8 * cmI, M.mat("rubber", "#151515"), true); });
    M.cyl(W / 2 - 8 * cmI, 0, 20 * cmI, 110 * cmI, 3 * cmI, M.mat("chrome", "#c9ced2"), { seg: 8 });
    M.box(W / 2 - 16 * cmI, W / 2, -10 * cmI, 10 * cmI, 100 * cmI, H, M.mat("plastic", "#2a2c2e"), 2 * cmI);
    M.box(W / 2 - 16 * cmI, W / 2 - 15.6 * cmI, -6 * cmI, 6 * cmI, 115 * cmI, H - 6 * cmI, M.mat("glow", "#f2c94c"));
  });
  // a claw machine: prizes behind glass, the claw over them, its marquee lit, a joystick
  itAdd("ic_mall", "i_claw", 90, 90, ["o " + itR(0, 0, 90, 90, 3), "t " + itR(8, 8, 74, 60, 2), "k " + itC(45, 78, 5)], { h: 1.9 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#8a5bb5", "#f2c94c");
    var body = M.mat("lacquer", C.main), rnd = mRand((n && n.id) || 67), zb = 85 * cmI, zt = H - 25 * cmI;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, zb, body, 3 * cmI);
    for (var i = 0; i < 26; i++) { M.ball(-W / 2 + 12 * cmI + rnd() * (W - 24 * cmI), -D / 2 + 12 * cmI + rnd() * (D - 24 * cmI), zb + (6 + rnd() * 10) * cmI, 7 * cmI, 7 * cmI, 7 * cmI, M.mat("fabric", IT_PACK[Math.floor(rnd() * IT_PACK.length)]), { seg: 6 }); }
    itGlassBox(M, -W / 2, W / 2, -D / 2, D / 2, zb, zt);
    M.box(-W / 2, W / 2, -D / 2, D / 2, zt, H, body, 3 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, D / 2, D / 2 + 0.4 * cmI, zt + 4 * cmI, H - 4 * cmI, M.mat("glow", C.frame));
    M.cyl(5 * cmI, 0, zt - 30 * cmI, zt, 0.6 * cmI, M.mat("chrome", "#c9ced2"), { seg: 6 });
    [0, 1, 2].forEach(function (k) { var a = k / 3 * Math.PI * 2; M.tube([5 * cmI, 0, zt - 30 * cmI], [5 * cmI + Math.cos(a) * 7 * cmI, Math.sin(a) * 7 * cmI, zt - 40 * cmI], 0.6 * cmI, M.mat("chrome", "#c9ced2"), 5); });
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, D / 2 - 4 * cmI, D / 2 + 12 * cmI, zb - 10 * cmI, zb - 6 * cmI, M.mat("plastic", "#2a2c2e"));
    M.cyl(-10 * cmI, D / 2 + 4 * cmI, zb - 6 * cmI, zb + 6 * cmI, 1 * cmI, M.mat("chrome", "#c9ced2"), { seg: 6 });
    M.ball(-10 * cmI, D / 2 + 4 * cmI, zb + 8 * cmI, 2.6 * cmI, 2.6 * cmI, 2.6 * cmI, M.mat("plastic", "#d63a2f"), { seg: 8 });
  });
  // an arcade cabinet: its marquee, the screen, the panel of stick and buttons
  itAdd("ic_mall", "i_arcade", 80, 90, ["o " + itR(0, 0, 80, 90, 3), "t M0 55 H80", "k " + itC(28, 70, 4) + " " + itC(46, 70, 3) + " " + itC(56, 70, 3)], { h: 1.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#1f2226", "#2f6fae");
    var body = M.mat("lacquer", C.main), side = M.mat("lacquer", C.frame);
    [-W / 2, W / 2 - 2 * cmI].forEach(function (x) { M.quad(side, [x + (x < 0 ? 0 : 2 * cmI), -D / 2, 0], [x + (x < 0 ? 0 : 2 * cmI), D / 2, 0], [x + (x < 0 ? 0 : 2 * cmI), D / 2 - 20 * cmI, H * 0.6], [x + (x < 0 ? 0 : 2 * cmI), -D / 2, H]); M.box(x, x + 2 * cmI, -D / 2, -D / 2 + 30 * cmI, 0, H, side); });
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2, -D / 2 + 30 * cmI, 0, H, body);
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 30 * cmI, D / 2 - 8 * cmI, 0, 90 * cmI, body);
    M.push().move(0, -D / 2 + 34 * cmI, 125 * cmI).tiltX(-18);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, 0, 1 * cmI, -20 * cmI, 20 * cmI, M.mat("screen", "#2f6fae"));
    M.pop();
    M.push().move(0, D / 2 - 24 * cmI, 94 * cmI).tiltX(15);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -12 * cmI, 12 * cmI, -4 * cmI, 0, M.mat("plastic", "#2a2c2e"));
    M.cyl(-14 * cmI, 0, 0, 8 * cmI, 0.8 * cmI, M.mat("chrome", "#c9ced2"), { seg: 6 }); M.ball(-14 * cmI, 0, 9 * cmI, 2.4 * cmI, 2.4 * cmI, 2.4 * cmI, M.mat("plastic", "#d63a2f"), { seg: 8 });
    [0, 8, 16].forEach(function (x, i) { M.cyl(x * cmI, 2 * cmI, 0, 1.5 * cmI, 2 * cmI, M.mat("plastic", ["#f2c94c", "#3f9a5a", "#2f6fae"][i]), { seg: 10 }); });
    M.pop();
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 2 * cmI, -D / 2 + 26 * cmI, H - 22 * cmI, H - 3 * cmI, M.mat("glow", "#f08a24"));
  });
  // a recycling station: three bins in one frame, their openings and colors
  itAdd("ic_mall", "i_bin3", 100, 45, ["o " + itR(0, 0, 100, 45, 4), "t M33 0 V45 M66 0 V45", "k " + itC(16, 22, 6) + " " + itR(42, 18, 16, 8, 2) + " " + itC(83, 22, 6)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#7a7f84");
    var colors = ["#2f6fae", "#3f9a5a", "#5d6166"];
    for (var i = 0; i < 3; i++) {
      var x0 = -W / 2 + i * W / 3 + 1 * cmI, x1 = -W / 2 + (i + 1) * W / 3 - 1 * cmI, xm = (x0 + x1) / 2;
      M.box(x0, x1, -D / 2, D / 2, 0, H - 8 * cmI, M.mat("plastic", colors[i]), 3 * cmI);
      M.box(x0, x1, -D / 2, D / 2, H - 8 * cmI, H, M.mat("metal", C.main), 2 * cmI);
      M.box(xm - 8 * cmI, xm + 8 * cmI, D / 2, D / 2 + 0.3 * cmI, H - 6 * cmI, H - 2 * cmI, M.mat("plastic", "#151515"));
    }
  });
  // a mall bench: long and backless, upholstered, on steel legs
  itAdd("ic_mall", "i_mallbench", 180, 60, ["o " + itR(0, 0, 180, 60, 10), "t M10 30 H170"], { h: 0.45 }, function (M, W, D, H, C) {
    C = mPick(C, "#3f5a6a", "#9aa0a5");
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 10 * cmI, 0, H - 12 * cmI, 2 * cmI, M.mat("chrome", C.frame), false);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 12 * cmI, H, M.mat("leather", C.main), 4 * cmI);
  });
  // a big planter with a tree in it, for a mall's hall
  itAdd("ic_mall", "i_bigplanter", 150, 150, ["o " + itR(0, 0, 150, 150, 8), "t " + itC(75, 75, 50), "k " + itC(75, 75, 6)], { h: 3.2 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#d8d2c6", "#4f7d3a");
    var rnd = mRand((n && n.id) || 71), top = 60 * cmI;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, top, M.mat("stone", C.main), 4 * cmI);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -D / 2 + 6 * cmI, D / 2 - 6 * cmI, top - 4 * cmI, top - 2 * cmI, M.mat("soil", "#4b3a2b"));
    M.cyl(0, 0, top - 4 * cmI, H * 0.62, 5 * cmI, M.mat("bark", "#6b4a32"), { seg: 8, r1: 3.5 * cmI });
    for (var k = 0; k < 6; k++) { mLeaves(M, (rnd() - 0.5) * 50 * cmI, (rnd() - 0.5) * 50 * cmI, H * (0.66 + rnd() * 0.25), 30 * cmI, C.frame, rnd, 4); }
  });
  // a store's sign on its pylon, out by the road: two legs, a lit cabinet
  itAdd("ic_mall", "i_signpylon", 250, 60, ["o " + itR(0, 10, 250, 40, 3), "k " + itR(30, 0, 20, 60, 0) + " " + itR(200, 0, 20, 60, 0)], { h: 6.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f6fae", "#3a3d40");
    var leg = M.mat("metal", C.frame);
    [-1, 1].forEach(function (s) { M.box(s * W * 0.3 - 10 * cmI, s * W * 0.3 + 10 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 0, H * 0.55, leg); });
    M.box(-W / 2, W / 2, -D / 2 + 8 * cmI, D / 2 - 8 * cmI, H * 0.55, H, M.mat("lacquer", C.main), 4 * cmI);
    [-1, 1].forEach(function (s) {
      M.box(-W / 2 + 15 * cmI, W / 2 - 15 * cmI, s * (D / 2 - 8 * cmI), s * (D / 2 - 7.6 * cmI), H * 0.6, H - 15 * cmI, M.mat("glow", "#ffffff"));
      M.box(-W / 2 + 15 * cmI, W / 2 - 15 * cmI, s * (D / 2 - 7.6 * cmI), s * (D / 2 - 7.2 * cmI), H * 0.6, H * 0.68, M.mat("glow", "#f2c94c"));
    });
    M.box(-W / 2 - 5 * cmI, W / 2 + 5 * cmI, -D / 2 + 4 * cmI, D / 2 - 4 * cmI, 0, 30 * cmI, M.mat("stone", "#b9b1a3"));
  });
  // queue posts: two chrome posts, the belt between
  itAdd("ic_mall", "i_stanchion", 150, 30, ["o " + itC(15, 15, 12) + " " + itC(135, 15, 12), "t M15 15 H135"], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#c9ced2", "#1f3a5a");
    [-1, 1].forEach(function (s) {
      var x = s * (W / 2 - 15 * cmI);
      M.cyl(x, 0, 0, 2 * cmI, 15 * cmI, M.mat("chrome", C.main), { seg: 16 });
      M.cyl(x, 0, 2 * cmI, H, 3 * cmI, M.mat("chrome", C.main), { seg: 10 });
    });
    M.box(-W / 2 + 15 * cmI, W / 2 - 15 * cmI, -0.3 * cmI, 0.3 * cmI, H - 9 * cmI, H - 4 * cmI, M.mat("fabric", C.frame));
  });
  // a cardboard baler, in a big store's stock room
  itAdd("ic_mall", "i_baler", 120, 90, ["o " + itR(0, 0, 120, 90, 2), "t " + itR(15, 60, 90, 25, 2), "k " + itR(100, 10, 12, 20, 1)], { h: 2.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f6fae", "#f2b81f");
    var body = M.mat("lacquer", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, body, 2 * cmI);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, D / 2, D / 2 + 1 * cmI, 20 * cmI, 110 * cmI, M.mat("metal", "#3a3d40"));
    M.box(-W / 2 + 12 * cmI, W / 2 - 12 * cmI, D / 2 + 1 * cmI, D / 2 + 2 * cmI, 60 * cmI, 105 * cmI, M.mat("plastic", "#b98e5a"));
    M.box(W / 2 - 20 * cmI, W / 2 - 4 * cmI, D / 2, D / 2 + 6 * cmI, 120 * cmI, 160 * cmI, M.mat("plastic", "#2a2c2e"));
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 8 * cmI, H, M.mat("lacquer", C.frame));
  });
  // A pair of escalators, side by side -- one up, one down -- their steps
  // rising between glass balustrades on a steel truss, black handrails;
  // as high as the storey it climbs (n.tall, 40-mall.js).  Its top end, on
  // the floor over it, is its own piece (n.escEnd "high"): the landing
  // plates, and glass round the well it comes up through (38-view3d.js cuts
  // the well, as it does for a flight of stairs).  Up it as up stairs (40-climb.js).
  BETWEEN_FLOORS.i_escalator = true;
  itAdd("ic_mall", "i_escalator", 280, 1000, function (w, h) {
    var d = "", n = Math.max(4, Math.round(h / 40)), m = w / 2;
    for (var i = 1; i < n; i++) { d += "M10 " + itN(i * h / n) + " H" + itN(m - 8) + " M" + itN(m + 8) + " " + itN(i * h / n) + " H" + itN(w - 10) + " "; }
    return ["o " + itR(0, 0, w, h, 4), "k " + itR(0, 0, 10, h, 2) + " " + itR(m - 8, 0, 16, h, 2) + " " + itR(w - 10, 0, 10, h, 2), "t " + d.trim(),
            "t2 M" + itN(m / 2) + " " + itN(h * 0.75) + " V" + itN(h * 0.25) + " M" + itN(m / 2 - 14) + " " + itN(h * 0.25 + 18) + " L" + itN(m / 2) + " " + itN(h * 0.25) + " L" + itN(m / 2 + 14) + " " + itN(h * 0.25 + 18),
            "t2 M" + itN(m * 1.5) + " " + itN(h * 0.25) + " V" + itN(h * 0.75) + " M" + itN(m * 1.5 - 14) + " " + itN(h * 0.75 - 18) + " L" + itN(m * 1.5) + " " + itN(h * 0.75) + " L" + itN(m * 1.5 + 14) + " " + itN(h * 0.75 - 18)];
  }, { h: 4.5 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#9aa0a5", "#1f2226");
    var steel = M.mat("metal", C.main), dark = M.mat("metal", "#3a3d40"), rail = M.mat("rubber", C.frame), glass = M.mat("glass", "#dbe8ee"), plate = M.mat("chrome", "#c9ced2");
    var land = Math.min(160 * cmI, D * 0.18), yf = D / 2, yt = -D / 2, lane = (W - 40 * cmI) / 2;
    var sides = [-W / 2 + 5 * cmI, -6 * cmI, 6 * cmI, W / 2 - 5 * cmI];      // the balustrades: outer, the middle pair, outer
    if (n && n.escEnd === "high") {
      // the top: the landing plates, the handrails turning down at their ends, glass round the well
      M.box(-W / 2, W / 2, yt - 30 * cmI, yt + land, -1 * cmI, 1 * cmI, plate);
      sides.forEach(function (x) { M.lathe(x, yt + land - 18 * cmI, [[16 * cmI, 92 * cmI], [16 * cmI, 98 * cmI]], rail, { seg: 14, top: false, from: 90, to: 270, ry: 0.5 }); });
      [-W / 2 - 2 * cmI, W / 2 + 2 * cmI].forEach(function (x) {
        M.box(x - 1 * cmI, x + 1 * cmI, yt + land, yf, 0, 105 * cmI, glass);
        M.box(x - 2.5 * cmI, x + 2.5 * cmI, yt + land, yf, 105 * cmI, 109 * cmI, M.mat("chrome", "#c9ced2"));
      });
      M.box(-W / 2 - 2 * cmI, W / 2 + 2 * cmI, yf - 1 * cmI, yf + 1 * cmI, 0, 105 * cmI, glass);
      M.box(-W / 2 - 2 * cmI, W / 2 + 2 * cmI, yf - 2.5 * cmI, yf + 2.5 * cmI, 105 * cmI, 109 * cmI, M.mat("chrome", "#c9ced2"));
      return;
    }
    var z = function (y) { var t = Math.max(0, Math.min(1, (yf - land - y) / (D - 2 * land))); return t * H; };
    var steps = Math.max(12, Math.round((D - 2 * land) / (40 * cmI)));
    // the comb plates at each end, the steps of each lane, their yellow edges
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, yf - land, yf, -2 * cmI, 1 * cmI, plate);
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, yt, yt + land, H - 2 * cmI, H + 1 * cmI, plate);
    [-1, 1].forEach(function (s) {
      var x0 = s < 0 ? -W / 2 + 12 * cmI : 14 * cmI, x1 = x0 + lane - 6 * cmI;
      for (var i = 0; i < steps; i++) {
        var ya = yf - land - i * (D - 2 * land) / steps, yb = ya - (D - 2 * land) / steps, za = z(ya), zb = z(yb);
        M.box(x0, x1, yb, ya, za, zb, dark);
        M.box(x0, x1, yb, yb + 1 * cmI, zb - 0.5 * cmI, zb + 0.5 * cmI, M.mat("glow", "#f2c94c"));
      }
    });
    // the truss's skin under the steps, its sides
    M.quad(steel, [-W / 2, yf - land, -30 * cmI], [W / 2, yf - land, -30 * cmI], [W / 2, yt + land, H - 30 * cmI], [-W / 2, yt + land, H - 30 * cmI]);
    [-W / 2, W / 2].forEach(function (x) { M.quad(steel, [x, yf - land, -30 * cmI], [x, yt + land, H - 30 * cmI], [x, yt + land, H], [x, yf - land, 0]); });
    // each balustrade: its skirt, the glass over it, the handrail on top, the newel at its foot
    sides.forEach(function (x) {
      M.quad(steel, [x, yf, 0], [x, yt + land, H - 10 * cmI], [x, yt + land, H + 15 * cmI], [x, yf, 15 * cmI]);
      M.quad(glass, [x, yf - 10 * cmI, 15 * cmI], [x, yt + 10 * cmI, H + 15 * cmI], [x, yt + 10 * cmI, H + 92 * cmI], [x, yf - 10 * cmI, 92 * cmI]);
      M.tube([x, yf - 5 * cmI, 95 * cmI], [x, yf - land, 95 * cmI], 3 * cmI, rail, 8);
      M.tube([x, yf - land, 95 * cmI], [x, yt + land, H + 95 * cmI], 3 * cmI, rail, 8);
      M.tube([x, yt + land, H + 95 * cmI], [x, yt + 5 * cmI, H + 95 * cmI], 3 * cmI, rail, 8);
      M.box(x - 4 * cmI, x + 4 * cmI, yf - 30 * cmI, yf, 0, 95 * cmI, steel, 3 * cmI);
    });
  });

  // ---- more that many of them share --------------------------------------------------------------------
  // a table: four legs and its top
  function itTable(M, W, D, H, top, leg, round) {
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 4 * cmI, 0, H - 3 * cmI, (round ? 2.2 : 2) * cmI, leg, !!round);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 3 * cmI, H, top, 1 * cmI);
  }
  // a bench seat from x0 to x1, its back to -y (s 1) or +y (s -1), cushioned
  function itBench(M, x0, x1, yb, s, deep, seatH, backH, up, base) {
    var yf = yb + s * deep;
    M.box(x0, x1, Math.min(yb, yf), Math.max(yb, yf), 0, seatH - 8 * cmI, base, 1 * cmI);
    M.box(x0 + 1 * cmI, x1 - 1 * cmI, Math.min(yb + s * 8 * cmI, yf), Math.max(yb + s * 8 * cmI, yf), seatH - 8 * cmI, seatH, up, 3 * cmI);
    M.box(x0, x1, Math.min(yb, yb + s * 10 * cmI), Math.max(yb, yb + s * 10 * cmI), seatH - 8 * cmI, backH, up, 3 * cmI);
  }
  var IT_STEEL = "#b9bec2";
  function itStainless(M, x0, x1, y0, y1, z0, z1, r) { M.box(x0, x1, y0, y1, z0, z1, M.mat("chrome", IT_STEEL), r || 0.6 * cmI); }

  // ===================================================================== restaurants and cafés ==
  // a booth: two high-backed benches facing over a table fixed to the wall
  itAdd("ic_food", "i_booth", 180, 150, ["o " + itR(0, 0, 180, 42, 6), "o " + itR(0, 108, 180, 42, 6), "o " + itR(8, 50, 164, 50, 3), "t M0 12 H180 M0 138 H180"],
        { h: 1.15 }, function (M, W, D, H, C) {
    C = mPick(C, "#8f2f2a", "#5d3c25");
    var up = M.mat("leather", C.main), wood = M.mat("wood", C.frame);
    itBench(M, -W / 2, W / 2, -D / 2, 1, 46 * cmI, 46 * cmI, H, up, wood);
    itBench(M, -W / 2, W / 2, D / 2, -1, 46 * cmI, 46 * cmI, H, up, wood);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 4 * cmI, H - 6 * cmI, H, wood);
    M.cyl(0, 0, 0, 72 * cmI, 5 * cmI, M.mat("metal", "#2f3236"), { seg: 10 });
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -25 * cmI, 25 * cmI, 72 * cmI, 75 * cmI, M.mat("stone", "#e8e4dc"), 1 * cmI);
  });
  // a bar: a long wooden counter, its brass foot rail, stools along it, bottles on the back shelf
  itAdd("ic_food", "i_barcounter", 300, 70, function (w, h) { return ["o " + itR(0, 0, w, h, 3), "t M0 18 H" + itN(w), "k " + itRows(10, 54, w - 20, 10, 60, false)]; },
        { h: 1.1 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#5d3c25", "#2a2c2e");
    var wood = M.mat("wood", C.main), brass = M.mat("brass", "#c9a24a"), rnd = mRand((n && n.id) || 101);
    M.box(-W / 2, W / 2, -D / 2 + 12 * cmI, D / 2 - 8 * cmI, 0, H - 5 * cmI, wood, 1 * cmI);
    M.box(-W / 2 - 3 * cmI, W / 2 + 3 * cmI, -D / 2, D / 2, H - 5 * cmI, H, M.mat("lacquer", "#3b2416"), 1.5 * cmI);
    M.tube([-W / 2, D / 2 + 2 * cmI, 22 * cmI], [W / 2, D / 2 + 2 * cmI, 22 * cmI], 2 * cmI, brass, 10);
    for (var x = -W / 2 + 30 * cmI; x < W / 2 - 20 * cmI; x += 60 * cmI) {
      M.cyl(x, D / 2 + 30 * cmI, 0, 2 * cmI, 22 * cmI, M.mat("metal", C.frame), { seg: 14 });
      M.cyl(x, D / 2 + 30 * cmI, 2 * cmI, 70 * cmI, 2.5 * cmI, M.mat("metal", C.frame), { seg: 8 });
      M.cyl(x, D / 2 + 30 * cmI, 70 * cmI, 76 * cmI, 19 * cmI, M.mat("leather", "#2a2c2e"), { seg: 16 });
    }
    for (var b = -W / 2 + 10 * cmI; b < W / 2 - 10 * cmI; b += 9 * cmI) {
      M.cyl(b, -D / 2 + 6 * cmI, H, H + (22 + rnd() * 10) * cmI, 3.2 * cmI, M.mat("glass", ["#4d6b3a", "#6b3a2a", "#c9a24a", "#2a3a4d"][Math.floor(rnd() * 4)]), { seg: 8, r1: 1.4 * cmI });
    }
  });
  // an espresso machine: chrome, two group heads, the steam wand, cups warming on top
  itAdd("ic_food", "i_espresso", 70, 55, ["o " + itR(0, 0, 70, 55, 5), "k " + itC(22, 40, 6) + " " + itC(48, 40, 6), "t M5 10 H65"], { top: 0.55 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#c9ced2");
    var body = M.mat("lacquer", C.main), chrome = M.mat("chrome", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2 - 10 * cmI, 0, H * 0.85, body, 3 * cmI);
    M.box(-W / 2, W / 2, D / 2 - 14 * cmI, D / 2, 0, 6 * cmI, chrome, 1 * cmI);
    [-1, 1].forEach(function (s) {
      M.cyl(s * W / 4, D / 2 - 14 * cmI, 22 * cmI, 30 * cmI, 5 * cmI, chrome, { seg: 14 });
      M.cyl(s * W / 4, D / 2 - 6 * cmI, 22 * cmI, 25 * cmI, 3 * cmI, M.mat("plastic", "#1f2226"), { seg: 10 });
      M.cyl(s * W / 4, D / 2 - 7 * cmI, 6 * cmI, 13 * cmI, 3.5 * cmI, M.mat("ceramic", "#f4f2ec"), { seg: 12 });
    });
    M.tube([W / 2 - 6 * cmI, D / 2 - 12 * cmI, 30 * cmI], [W / 2 - 3 * cmI, D / 2 - 2 * cmI, 12 * cmI], 0.8 * cmI, chrome, 6);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, D / 2 - 14 * cmI, H * 0.85, H * 0.87, chrome);
    for (var i = 0; i < 4; i++) { M.cyl(-W / 2 + 12 * cmI + i * 14 * cmI, -6 * cmI, H * 0.87, H * 0.87 + 7 * cmI, 3.5 * cmI, M.mat("ceramic", "#f4f2ec"), { seg: 10 }); }
  });
  // a wood-fired pizza oven: a brick dome on its base, the arched mouth, its flue, the fire in it
  itAdd("ic_food", "i_pizzaoven", 160, 160, ["o " + itC(80, 80, 78), "t " + itC(80, 80, 56), "k M55 150 Q80 120 105 150 Z"], { h: 1.9 }, function (M, W, D, H, C) {
    C = mPick(C, "#b4573a", "#d6cdbd");
    var brick = M.mat("stone", C.main), base = M.mat("stone", C.frame), R = Math.min(W, D) / 2;
    M.box(-R, R, -R, R, 0, 95 * cmI, base, 3 * cmI);
    M.lathe(0, 0, [[R - 4 * cmI, 95 * cmI], [R - 4 * cmI, 100 * cmI], [R - 10 * cmI, 125 * cmI], [R - 30 * cmI, 150 * cmI], [10 * cmI, 165 * cmI], [0.1, 166 * cmI]], brick, { seg: 24 });
    M.box(-22 * cmI, 22 * cmI, R - 30 * cmI, R - 4 * cmI, 100 * cmI, 128 * cmI, M.mat("stone", "#2a2420"));
    M.box(-16 * cmI, 16 * cmI, R - 28 * cmI, R - 22 * cmI, 100 * cmI, 110 * cmI, M.mat("glow", "#f08a24"));
    M.cyl(-R * 0.3, -R * 0.3, 150 * cmI, H, 9 * cmI, M.mat("metal", "#3a3d40"), { seg: 12 });
  });
  // a deep fryer: stainless, two baskets in the oil, the controls on its front
  itAdd("ic_food", "i_fryer", 40, 80, ["o " + itR(0, 0, 40, 80, 2), "t " + itR(5, 8, 30, 30, 1) + " " + itR(5, 42, 30, 30, 1)], { h: 1.1 }, function (M, W, D, H) {
    itStainless(M, -W / 2, W / 2, -D / 2, D / 2, 0, 90 * cmI);
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, -D / 2 + 6 * cmI, D / 2 - 14 * cmI, 88 * cmI, 90.5 * cmI, M.mat("plastic", "#c9922e"));
    [-1, 1].forEach(function (s) { M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, s * 14 * cmI - 12 * cmI, s * 14 * cmI + 8 * cmI, 84 * cmI, 92 * cmI, M.mat("metal", "#5d6166")); });
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 6 * cmI, 90 * cmI, H, M.mat("chrome", IT_STEEL));
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, D / 2, D / 2 + 0.4 * cmI, 70 * cmI, 82 * cmI, M.mat("plastic", "#1f2226"));
  });
  // a griddle: a stainless stand, the steel plate on it, burgers on the plate
  itAdd("ic_food", "i_griddle", 90, 80, ["o " + itR(0, 0, 90, 80, 2), "t " + itR(6, 8, 78, 60, 1), "k " + itC(25, 30, 5) + " " + itC(45, 40, 5) + " " + itC(65, 30, 5)], { h: 0.95 }, function (M, W, D, H) {
    itStainless(M, -W / 2, W / 2, -D / 2, D / 2, 0, 85 * cmI);
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 4 * cmI, D / 2 - 12 * cmI, 85 * cmI, 89 * cmI, M.mat("metal", "#2f3236"));
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 4 * cmI, 85 * cmI, H, M.mat("chrome", IT_STEEL));
    [[-20, -5], [0, 6], [20, -5], [10, -15]].forEach(function (p) { M.cyl(p[0] * cmI, p[1] * cmI, 89 * cmI, 91 * cmI, 5 * cmI, M.mat("fabric", "#6b3a22"), { seg: 10 }); });
    for (var i = 0; i < 4; i++) { M.cyl(-W / 2 + 15 * cmI + i * 20 * cmI, D / 2 + 0.5 * cmI, 70 * cmI, 74 * cmI, 2 * cmI, M.mat("plastic", "#1f2226"), { seg: 8 }); }
  });
  // a salad bar: a refrigerated well of pans under a sneeze guard, plates at its end
  itAdd("ic_food", "i_saladbar", 240, 100, function (w, h) { return ["o " + itR(0, 0, w, h, 4), "t " + itRows(10, 20, w - 20, h - 40, 30, false), "t M0 50 H" + itN(w)]; },
        { h: 1.4 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#7a5236", "#c9ced2");
    var rnd = mRand((n && n.id) || 103), food = ["#7fb33a", "#c8352e", "#f2d23c", "#efe3c2", "#3e7d2e", "#f39a1e", "#b8a27a"];
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 85 * cmI, M.mat("wood", C.main), 2 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 6 * cmI, D / 2 - 6 * cmI, 85 * cmI, 88 * cmI, M.mat("chrome", C.frame));
    for (var x = -W / 2 + 18 * cmI; x < W / 2 - 14 * cmI; x += 32 * cmI) {
      [-1, 1].forEach(function (s) { M.box(x - 14 * cmI, x + 14 * cmI, s * 20 * cmI - 15 * cmI, s * 20 * cmI + 15 * cmI, 84 * cmI, 89 * cmI, M.mat("fabric", food[Math.floor(rnd() * food.length)])); });
    }
    [-1, 1].forEach(function (s) { M.box(s * (W / 2 - 4 * cmI) - 1 * cmI, s * (W / 2 - 4 * cmI) + 1 * cmI, -4 * cmI, 4 * cmI, 88 * cmI, H, M.mat("chrome", C.frame)); });
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, H - 1 * cmI, H, M.mat("glass", "#dfeef2"));
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 9 * cmI, D / 2 - 9 * cmI, H - 6 * cmI, H - 5 * cmI, M.mat("glow", "#fff6e6"));
  });
  // a soda fountain: the dispenser's front of buttons, its ice chute, cups stacked by it
  itAdd("ic_food", "i_sodafountain", 60, 60, ["o " + itR(0, 0, 60, 60, 4), "k " + itRows(6, 44, 48, 8, 8, false)], { top: 0.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#c9ced2");
    M.box(-W / 2, W / 2, -D / 2, D / 2 - 14 * cmI, 0, H, M.mat("lacquer", C.main), 2 * cmI);
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2 - 14 * cmI, D / 2 - 13 * cmI, H * 0.45, H * 0.9, M.mat("glow", "#f4f6f7"));
    for (var i = 0; i < 6; i++) { M.box(-W / 2 + 6 * cmI + i * 8.5 * cmI, -W / 2 + 12 * cmI + i * 8.5 * cmI, D / 2 - 13 * cmI, D / 2 - 10 * cmI, H * 0.35, H * 0.42, M.mat("chrome", C.frame)); }
    M.box(-W / 2, W / 2, D / 2 - 14 * cmI, D / 2, 0, 4 * cmI, M.mat("chrome", C.frame));
  });
  // menu boards on the wall over a counter: three lit panels
  itAdd("ic_food", "i_menuboard", 240, 10, ["o " + itR(0, 0, 76, 10, 1) + " " + itR(82, 0, 76, 10, 1) + " " + itR(164, 0, 76, 10, 1)], { wall: [1.8, 2.6] }, function (M, W, D, H, C) {
    C = mPick(C, "#1f2226", "#f2c94c");
    for (var i = 0; i < 3; i++) {
      var x0 = -W / 2 + i * W / 3 + 1 * cmI, x1 = -W / 2 + (i + 1) * W / 3 - 1 * cmI;
      M.box(x0, x1, -D / 2, D / 2 - 1 * cmI, 0, H, M.mat("metal", C.main));
      M.box(x0 + 3 * cmI, x1 - 3 * cmI, D / 2 - 1 * cmI, D / 2, 4 * cmI, H - 4 * cmI, M.mat("screen", "#2a2c2e"));
      for (var r = 0; r < 5; r++) { M.box(x0 + 6 * cmI, x0 + (30 + (r % 3) * 8) * cmI, D / 2, D / 2 + 0.2 * cmI, H - (14 + r * 11) * cmI, H - (10 + r * 11) * cmI, M.mat("glow", r ? "#f4f6f7" : C.frame)); }
    }
  });
  // a host stand: a podium, a lamp on it, the book of tables
  itAdd("ic_food", "i_hoststand", 70, 50, ["o " + itR(5, 5, 60, 40, 4), "k " + itR(20, 12, 30, 16, 2)], { h: 1.15 }, function (M, W, D, H, C) {
    C = mPick(C, "#3b2416", "#c9a24a");
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, -D / 2 + 5 * cmI, D / 2 - 5 * cmI, 0, H - 5 * cmI, M.mat("wood", C.main), 2 * cmI);
    M.push().move(0, 0, H - 5 * cmI).tiltX(-12);
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 2 * cmI, D / 2 - 2 * cmI, 0, 3 * cmI, M.mat("wood", C.main), 1 * cmI);
    M.box(-16 * cmI, 16 * cmI, -10 * cmI, 10 * cmI, 3 * cmI, 5 * cmI, M.mat("leather", "#1f2226"));
    M.pop();
    M.cyl(W / 2 - 12 * cmI, -D / 2 + 10 * cmI, H, H + 25 * cmI, 0.8 * cmI, M.mat("brass", C.frame), { seg: 6 });
    M.cyl(W / 2 - 12 * cmI, -D / 2 + 10 * cmI, H + 22 * cmI, H + 30 * cmI, 6 * cmI, M.mat("shade", "#f4e7c8"), { seg: 12, r1: 3 * cmI });
  });
  // a buffet: a long table, its cloth, chafing dishes in a row, the lamps over them
  itAdd("ic_food", "i_buffet", 300, 80, function (w, h) { var d = ""; for (var x = 30; x < w - 20; x += 50) { d += itR(x - 18, 22, 36, 36, 6) + " "; } return ["o " + itR(0, 0, w, h, 3), "t " + d.trim()]; },
        { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#f4f2ec", "#c9ced2");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 76 * cmI, M.mat("linen", C.main), 2 * cmI);
    for (var x = -W / 2 + 30 * cmI; x < W / 2 - 20 * cmI; x += 50 * cmI) {
      M.box(x - 22 * cmI, x + 22 * cmI, -16 * cmI, 16 * cmI, 76 * cmI, 88 * cmI, M.mat("chrome", C.frame), 2 * cmI);
      M.lathe(x, 0, [[20 * cmI, 88 * cmI], [18 * cmI, 94 * cmI], [6 * cmI, 99 * cmI], [0.1, 100 * cmI]], M.mat("chrome", C.frame), { seg: 14, ry: 0.72 });
    }
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 4 * cmI, 76 * cmI, 150 * cmI, M.mat("metal", "#3a3d40"));
    M.box(-W / 2, W / 2, -D / 2, 2 * cmI, 146 * cmI, 152 * cmI, M.mat("metal", "#3a3d40"));
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, 0, 145 * cmI, 146 * cmI, M.mat("glow", "#ffcf8f"));
  });
  // a gelato case: tubs of every color under curved glass
  itAdd("ic_food", "i_icecase", 180, 90, ["o " + itR(0, 0, 180, 90, 3), "t M0 70 Q90 96 180 70", "t " + itRows(10, 15, 160, 45, 20, false)], { h: 1.3 }, function (M, W, D, H, C, n) {
    itCase(M, W, D, H, mPick(C, "#f4f2ec", "#c9ced2"), n, function (M, x, y, z, rnd) {
      var c = ["#f4e7c8", "#7a4a2a", "#e94e6b", "#7fb33a", "#f2d23c", "#8a5bb5", "#f39a1e", "#efefe8"][Math.floor(rnd() * 8)];
      M.box(x - 6 * cmI, x + 6 * cmI, y - 8 * cmI, y + 8 * cmI, z, z + 5 * cmI, M.mat("chrome", IT_STEEL));
      M.ball(x, y, z + 5 * cmI, 5.5 * cmI, 7 * cmI, 3 * cmI, M.mat("fabric", c), { seg: 6 });
    });
  });
  // a beer tap: a chrome tower, its row of handles, the drip tray
  itAdd("ic_food", "i_beertap", 60, 30, ["o " + itR(0, 5, 60, 20, 4), "k " + itC(12, 15, 3) + " " + itC(24, 15, 3) + " " + itC(36, 15, 3) + " " + itC(48, 15, 3)], { top: 0.6 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#c9ced2", "#1f2226");
    var chrome = M.mat("chrome", C.main), rnd = mRand((n && n.id) || 107);
    M.box(-W / 2, W / 2, -D / 2 + 4 * cmI, D / 2 - 4 * cmI, 0, 2 * cmI, M.mat("metal", "#5d6166"));
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -6 * cmI, 2 * cmI, 2 * cmI, H * 0.7, chrome, 2 * cmI);
    for (var i = 0; i < 4; i++) {
      var x = -W / 2 + 12 * cmI + i * 12 * cmI;
      M.tube([x, 2 * cmI, H * 0.6], [x, 9 * cmI, H * 0.6], 1 * cmI, chrome, 6);
      M.cyl(x, 2 * cmI, H * 0.62, H * 0.62 + 18 * cmI, 1.6 * cmI, M.mat("lacquer", ["#c43c3a", "#2f6fae", "#3f9a5a", "#f2c94c"][Math.floor(rnd() * 4)]), { seg: 8, r1: 2.2 * cmI });
    }
  });
  // a stainless prep table: an undershelf, a cutting board and a knife, bowls
  itAdd("ic_food", "i_preptable", 180, 75, function (w, h) { return ["o " + itR(0, 0, w, h, 2), "t " + itR(10, 8, 50, 35, 2), "t M0 " + itN(h - 8) + " H" + itN(w)]; }, { h: 0.9 }, function (M, W, D, H) {
    var steel = M.mat("chrome", IT_STEEL);
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 3 * cmI, 0, H - 4 * cmI, 2 * cmI, steel, true);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 4 * cmI, H, steel, 0.6 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, D / 2 - 4 * cmI, 18 * cmI, 20 * cmI, steel);
    M.box(-W / 2 + 10 * cmI, -W / 2 + 60 * cmI, -D / 2 + 8 * cmI, -D / 2 + 43 * cmI, H, H + 2 * cmI, M.mat("plastic", "#f4f2ec"));
    [20, 50].forEach(function (x) { M.lathe(x * cmI, 0, [[8 * cmI, H], [14 * cmI, H + 9 * cmI]], steel, { seg: 16, top: false }); });
  });
  // a walk-in cooler: an insulated box, its heavy door with the long handle, the unit on its roof
  itAdd("ic_food", "i_walkin", 300, 240, function (w, h) { return ["o " + itR(0, 0, w, h, 2), "t " + itR(8, 8, w - 16, h - 16, 1), "k " + itR(w / 2 - 45, h - 8, 90, 8, 0)]; }, { h: 2.6 }, function (M, W, D, H) {
    var skin = M.mat("metal", "#dfe3e6");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 30 * cmI, skin, 2 * cmI);
    for (var x = -W / 2 + 60 * cmI; x < W / 2 - 10 * cmI; x += 60 * cmI) { M.box(x - 0.4 * cmI, x + 0.4 * cmI, D / 2, D / 2 + 0.3 * cmI, 0, H - 30 * cmI, M.mat("metal", "#b9bec2")); }
    M.box(-45 * cmI, 45 * cmI, D / 2, D / 2 + 6 * cmI, 2 * cmI, 205 * cmI, M.mat("metal", "#eef0f2"), 1 * cmI);
    M.box(28 * cmI, 33 * cmI, D / 2 + 6 * cmI, D / 2 + 12 * cmI, 70 * cmI, 150 * cmI, M.mat("chrome", "#c9ced2"));
    M.box(-W / 4, W / 4, -D / 4, D / 4, H - 30 * cmI, H, M.mat("metal", "#9aa0a5"), 3 * cmI);
    M.cyl(0, 0, H - 2 * cmI, H, 22 * cmI, M.mat("metal", "#3a3d40"), { seg: 18 });
  });
  // a hood dishwasher: its stainless box lifted on a pole, tables either side
  itAdd("ic_food", "i_dishpro", 120, 75, ["o " + itR(30, 5, 60, 65, 2), "t " + itR(0, 10, 30, 55, 1) + " " + itR(90, 10, 30, 55, 1)], { h: 2.0 }, function (M, W, D, H) {
    var steel = M.mat("chrome", IT_STEEL);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 30 * cmI : 0), s * W / 2 + (s < 0 ? 30 * cmI : 0), -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 0, 90 * cmI, steel); });
    M.box(-30 * cmI, 30 * cmI, -D / 2 + 5 * cmI, D / 2 - 5 * cmI, 0, 160 * cmI, steel, 1 * cmI);
    M.box(-30 * cmI, 30 * cmI, -D / 2 + 5 * cmI, D / 2 - 5 * cmI, 160 * cmI, H, M.mat("metal", "#9aa0a5"));
    M.box(-26 * cmI, 26 * cmI, D / 2 - 5 * cmI, D / 2 - 3 * cmI, 150 * cmI, 156 * cmI, M.mat("plastic", "#1f2226"));
  });
  // a food court counter: the counter, the menu boards lit over it, its name on a fascia
  itAdd("ic_food", "i_foodcounter", 400, 90, function (w, h) { return ["o " + itR(0, 30, w, h - 30, 3), "k " + itR(10, 0, w - 20, 10, 2), "t M0 50 H" + itN(w)]; }, { h: 2.6 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#f2c94c");
    var body = M.mat("lacquer", C.main);
    M.box(-W / 2, W / 2, -D / 2 + 30 * cmI, D / 2, 0, 105 * cmI, body, 2 * cmI);
    M.box(-W / 2 - 2 * cmI, W / 2 + 2 * cmI, -D / 2 + 28 * cmI, D / 2 + 4 * cmI, 105 * cmI, 109 * cmI, M.mat("stone", "#e8e4dc"));
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 6 * cmI, 0, H, M.mat("metal", "#3a3d40"));
    for (var i = 0; i < 3; i++) { M.box(-W / 2 + 20 * cmI + i * (W - 40 * cmI) / 3, -W / 2 + 20 * cmI + (i + 1) * (W - 40 * cmI) / 3 - 10 * cmI, -D / 2 + 6 * cmI, -D / 2 + 7 * cmI, 160 * cmI, 220 * cmI, M.mat("screen", "#2a2c2e")); }
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 30 * cmI, H - 28 * cmI, H, body);
    M.box(-W / 2 + 30 * cmI, W / 2 - 30 * cmI, -D / 2 + 30 * cmI, -D / 2 + 30.4 * cmI, H - 22 * cmI, H - 6 * cmI, M.mat("glow", C.frame));
    M.cyl(W / 2 - 40 * cmI, D / 2 - 30 * cmI, 109 * cmI, 125 * cmI, 12 * cmI, M.mat("plastic", "#2a2c2e"), { seg: 12 });
  });
  // a food court table: four stools fixed to it, all on one frame
  itAdd("ic_food", "i_foodtable", 150, 150, ["o " + itR(45, 45, 60, 60, 4), "o " + itC(75, 15, 13) + " " + itC(75, 135, 13) + " " + itC(15, 75, 13) + " " + itC(135, 75, 13)], { h: 0.75 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#3a3d40");
    var frame = M.mat("metal", C.frame);
    M.cyl(0, 0, 0, H - 3 * cmI, 4 * cmI, frame, { seg: 10 });
    M.box(-30 * cmI, 30 * cmI, -30 * cmI, 30 * cmI, H - 3 * cmI, H, M.mat("stone", C.main), 1 * cmI);
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (s, i) {
      var x = s[0] * (W / 2 - 15 * cmI), y = s[1] * (D / 2 - 15 * cmI);
      M.tube([0, 0, 18 * cmI], [x, y, 18 * cmI], 2 * cmI, frame, 8);
      M.cyl(x, y, 18 * cmI, 42 * cmI, 2 * cmI, frame, { seg: 8 });
      M.cyl(x, y, 42 * cmI, 46 * cmI, 15 * cmI, M.mat("plastic", ["#c43c3a", "#2f6fae", "#3f9a5a", "#f2c94c"][i]), { seg: 16 });
    });
  });

  // ===================================================================== clinic and care ==
  // a hospital bed: its frame on castors, the mattress raised at the head, rails, the panel at its foot
  itAdd("ic_health", "i_hospbed", 100, 220, ["o " + itR(0, 0, 100, 220, 6), "t " + itR(8, 10, 84, 60, 8), "k " + itR(0, 70, 6, 90, 2) + " " + itR(94, 70, 6, 90, 2)], { h: 0.9 }, function (M, W, D, H, C) {
    C = mPick(C, "#e8edf0", "#8fb3c9");
    var frame = M.mat("metal", "#c9ced2"), pad = M.mat("fabric", C.main);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { itWheel(M, s[0] * (W / 2 - 8 * cmI), s[1] * (D / 2 - 10 * cmI), 6 * cmI, 6 * cmI, 3 * cmI, M.mat("rubber", "#2a2c2e")); });
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 6 * cmI, D / 2 - 6 * cmI, 30 * cmI, 50 * cmI, frame, 2 * cmI);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -D / 2 + 70 * cmI, D / 2 - 8 * cmI, 50 * cmI, 64 * cmI, pad, 5 * cmI);
    M.push().move(0, -D / 2 + 70 * cmI, 52 * cmI).tiltX(35);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -64 * cmI, 0, 0, 14 * cmI, pad, 5 * cmI);
    M.box(-30 * cmI, 30 * cmI, -50 * cmI, -15 * cmI, 14 * cmI, 24 * cmI, M.mat("linen", "#f4f4f1"), 6 * cmI);
    M.pop();
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2, -D / 2 + 5 * cmI, 30 * cmI, 110 * cmI, M.mat("plastic", C.frame), 3 * cmI);
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, D / 2 - 5 * cmI, D / 2, 30 * cmI, 85 * cmI, M.mat("plastic", C.frame), 3 * cmI);
    [-1, 1].forEach(function (s) { M.box(s * (W / 2 - 1 * cmI) - 1.5 * cmI, s * (W / 2 - 1 * cmI) + 1.5 * cmI, -D / 2 + 30 * cmI, 20 * cmI, 58 * cmI, H, M.mat("plastic", "#f4f4f1"), 1 * cmI); });
  });
  // an exam table: padded, its head end up, paper rolled down it, drawers under it, a step
  itAdd("ic_health", "i_exam", 70, 190, ["o " + itR(0, 0, 70, 190, 4), "t " + itR(5, 5, 60, 55, 4), "t M10 60 V185 M60 60 V185"], { h: 0.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f6f7a", "#efe7d6");
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 10 * cmI, D / 2 - 30 * cmI, 0, H - 10 * cmI, M.mat("lacquer", C.frame), 2 * cmI);
    for (var i = 0; i < 3; i++) { M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, D / 2 - 31 * cmI, D / 2 - 30 * cmI, 8 * cmI + i * 20 * cmI, 25 * cmI + i * 20 * cmI, M.mat("metal", "#9aa0a5")); }
    M.box(-W / 2, W / 2, -D / 2 + 55 * cmI, D / 2, H - 10 * cmI, H, M.mat("leather", C.main), 4 * cmI);
    M.push().move(0, -D / 2 + 55 * cmI, H - 6 * cmI).tiltX(30);
    M.box(-W / 2, W / 2, -55 * cmI, 0, -4 * cmI, 6 * cmI, M.mat("leather", C.main), 4 * cmI);
    M.pop();
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, -D / 2 + 55 * cmI, D / 2, H, H + 0.4 * cmI, M.mat("linen", "#f4f4f1"));
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, D / 2 - 28 * cmI, D / 2 + 8 * cmI, 0, 25 * cmI, M.mat("lacquer", C.frame), 2 * cmI);
  });
  // a wheelchair: two big wheels with their push rims, castors in front, the seat, footrests, handles
  itAdd("ic_health", "i_wheelchair", 65, 100, ["o " + itR(8, 15, 49, 60, 4), "k " + itR(0, 30, 6, 50, 2) + " " + itR(59, 30, 6, 50, 2), "t M15 80 L15 98 M50 80 L50 98"], { h: 0.95 }, function (M, W, D, H, C) {
    C = mPick(C, "#2a2c2e", "#9aa0a5");
    var frame = M.mat("chrome", C.frame), rub = M.mat("rubber", "#151515");
    [-1, 1].forEach(function (s) {
      var x = s * (W / 2 - 3 * cmI);
      M.push().move(x, -5 * cmI, 30 * cmI).tiltY(90);
      M.lathe(0, 0, [[29 * cmI, -1.5 * cmI], [30 * cmI, 0], [29 * cmI, 1.5 * cmI]], rub, { seg: 24 });
      M.lathe(0, 0, [[26 * cmI, -0.5 * cmI], [26 * cmI, 0.5 * cmI]], frame, { seg: 24, top: false });
      M.cyl(0, 0, -2 * cmI, 2 * cmI, 3 * cmI, frame, { seg: 10 });
      M.pop();
      M.cyl(s * (W / 2 - 12 * cmI), D / 2 - 18 * cmI, 0, 10 * cmI, 5 * cmI, rub, { seg: 10 });
      M.tube([s * (W / 2 - 10 * cmI), -15 * cmI, 50 * cmI], [s * (W / 2 - 10 * cmI), D / 2 - 18 * cmI, 12 * cmI], 1.2 * cmI, frame, 6);
      M.tube([s * (W / 2 - 10 * cmI), -22 * cmI, 50 * cmI], [s * (W / 2 - 10 * cmI), -26 * cmI, H], 1.2 * cmI, frame, 6);
      M.tube([s * (W / 2 - 10 * cmI), -26 * cmI, H], [s * (W / 2 - 10 * cmI), -36 * cmI, H], 1.6 * cmI, rub, 6);
      M.box(s * 12 * cmI - 8 * cmI, s * 12 * cmI + 8 * cmI, D / 2 - 14 * cmI, D / 2 - 2 * cmI, 10 * cmI, 12 * cmI, M.mat("plastic", "#2a2c2e"));
    });
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -20 * cmI, 22 * cmI, 46 * cmI, 50 * cmI, M.mat("fabric", C.main), 1 * cmI);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -24 * cmI, -21 * cmI, 50 * cmI, 88 * cmI, M.mat("fabric", C.main), 1 * cmI);
  });
  // a drip stand: five feet on castors, the pole, its hooks, a bag hung, the pump on it
  itAdd("ic_health", "i_ivpole", 50, 50, ["o " + itC(25, 25, 23), "k " + itC(25, 25, 3), "t M25 25 L25 4 M25 25 L46 18 M25 25 L38 44 M25 25 L12 44 M25 25 L4 18"], { h: 2.0 }, function (M, W, D, H) {
    var chrome = M.mat("chrome", "#c9ced2");
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * Math.PI * 2 - Math.PI / 2, ex = Math.cos(a) * (W / 2 - 3 * cmI), ey = Math.sin(a) * (D / 2 - 3 * cmI);
      M.tube([0, 0, 8 * cmI], [ex, ey, 6 * cmI], 1.2 * cmI, chrome, 6);
      M.ball(ex, ey, 3 * cmI, 3 * cmI, 3 * cmI, 3 * cmI, M.mat("rubber", "#2a2c2e"), { seg: 6 });
    }
    M.cyl(0, 0, 6 * cmI, H, 1.3 * cmI, chrome, { seg: 8 });
    [-1, 1].forEach(function (s) { M.tube([0, 0, H - 4 * cmI], [s * 12 * cmI, 0, H], 0.8 * cmI, chrome, 6); });
    M.box(6 * cmI, 16 * cmI, -1 * cmI, 2 * cmI, H - 35 * cmI, H - 10 * cmI, M.mat("glass", "#e6f3f7"));
    M.box(-8 * cmI, 8 * cmI, 1.5 * cmI, 10 * cmI, 110 * cmI, 128 * cmI, M.mat("plastic", "#e8e8e4"), 1 * cmI);
    M.box(-6 * cmI, 6 * cmI, 10 * cmI, 10.3 * cmI, 118 * cmI, 125 * cmI, M.mat("screen", "#57c46f"));
  });
  // an x-ray room's table and the tube on its arm over it, the panel behind
  itAdd("ic_health", "i_xray", 240, 120, ["o " + itR(20, 30, 200, 70, 4), "k " + itR(100, 5, 40, 20, 2), "t M120 25 V65"], { h: 2.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#e8edf0", "#2f6fae");
    var white = M.mat("lacquer", C.main);
    M.box(-W / 2 + 70 * cmI, W / 2 - 70 * cmI, -D / 2 + 40 * cmI, D / 2 - 30 * cmI, 0, 70 * cmI, white, 4 * cmI);
    M.box(-W / 2 + 20 * cmI, W / 2 - 20 * cmI, -D / 2 + 30 * cmI, D / 2 - 20 * cmI, 70 * cmI, 78 * cmI, M.mat("plastic", "#f4f4f1"), 3 * cmI);
    M.box(-W / 2 + 22 * cmI, W / 2 - 22 * cmI, -D / 2 + 32 * cmI, D / 2 - 22 * cmI, 78 * cmI, 82 * cmI, M.mat("fabric", C.frame), 2 * cmI);
    M.box(-20 * cmI, 20 * cmI, -D / 2, -D / 2 + 20 * cmI, 0, H, white, 3 * cmI);
    M.box(-12 * cmI, 12 * cmI, -D / 2 + 20 * cmI, 25 * cmI, H - 30 * cmI, H - 15 * cmI, white, 3 * cmI);
    M.box(-22 * cmI, 22 * cmI, 0, 40 * cmI, H - 60 * cmI, H - 30 * cmI, white, 6 * cmI);
    M.box(-16 * cmI, 16 * cmI, 6 * cmI, 34 * cmI, H - 62 * cmI, H - 60 * cmI, M.mat("glass", "#cfe3ea"));
    M.box(-W / 2 + 4 * cmI, -W / 2 + 40 * cmI, -D / 2, -D / 2 + 10 * cmI, 100 * cmI, 160 * cmI, M.mat("plastic", "#2a2c2e"));
  });
  // a dentist's chair: it lies back, the light on its arm over it, the tray on its own arm, the spittoon
  itAdd("ic_health", "i_dentchair", 90, 200, ["o " + itR(15, 30, 60, 160, 20), "k " + itC(80, 20, 8), "t M80 28 L60 60"], { h: 1.3 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f8f8a", "#efe7d6");
    var up = M.mat("leather", C.main), base = M.mat("lacquer", C.frame);
    M.cyl(0, 10 * cmI, 0, 6 * cmI, 30 * cmI, base, { seg: 18 });
    M.cyl(0, 10 * cmI, 6 * cmI, 40 * cmI, 10 * cmI, base, { seg: 12 });
    M.box(-27 * cmI, 27 * cmI, -10 * cmI, 50 * cmI, 40 * cmI, 52 * cmI, up, 5 * cmI);
    M.push().move(0, 50 * cmI, 46 * cmI).tiltX(-25);
    M.box(-22 * cmI, 22 * cmI, 0, 45 * cmI, 0, 10 * cmI, up, 4 * cmI);
    M.pop();
    M.push().move(0, -10 * cmI, 46 * cmI).tiltX(60);
    M.box(-26 * cmI, 26 * cmI, -65 * cmI, 0, 0, 12 * cmI, up, 5 * cmI);
    M.box(-12 * cmI, 12 * cmI, -82 * cmI, -64 * cmI, 2 * cmI, 12 * cmI, up, 4 * cmI);
    M.pop();
    M.cyl(W / 2 - 10 * cmI, -D / 2 + 20 * cmI, 0, H + 40 * cmI, 3 * cmI, base, { seg: 8 });
    M.tube([W / 2 - 10 * cmI, -D / 2 + 20 * cmI, H + 40 * cmI], [5 * cmI, -40 * cmI, H + 50 * cmI], 2 * cmI, base, 8);
    M.box(-8 * cmI, 18 * cmI, -46 * cmI, -34 * cmI, H + 38 * cmI, H + 50 * cmI, base, 3 * cmI);
    M.box(-6 * cmI, 16 * cmI, -35 * cmI, -34.5 * cmI, H + 40 * cmI, H + 48 * cmI, M.mat("glow", "#fff6e6"));
    M.cyl(W / 2 - 15 * cmI, 30 * cmI, 0, 85 * cmI, 7 * cmI, base, { seg: 10 });
    M.lathe(W / 2 - 15 * cmI, 30 * cmI, [[2 * cmI, 85 * cmI], [11 * cmI, 92 * cmI]], M.mat("ceramic", "#f4f4f1"), { seg: 16, top: false });
    M.box(-W / 2, -W / 2 + 40 * cmI, 20 * cmI, 50 * cmI, 95 * cmI, 98 * cmI, M.mat("chrome", "#c9ced2"));
  });
  // a medicine cart: drawers of colors, a laptop on top, the handle, castors
  itAdd("ic_health", "i_medcart", 60, 50, ["o " + itR(0, 0, 60, 50, 4), "t " + itRows(4, 4, 52, 42, 10, true)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#e8e8e4", "#2f6fae");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 8 * cmI, H - 4 * cmI, M.mat("plastic", C.main), 2 * cmI);
    var cols = ["#2f6fae", "#3f9a5a", "#f2c94c", "#c43c3a", "#8a5bb5"];
    for (var i = 0; i < 5; i++) { M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2, D / 2 + 1 * cmI, 12 * cmI + i * 16 * cmI, 26 * cmI + i * 16 * cmI, M.mat("plastic", cols[i])); }
    M.box(-W / 2 - 2 * cmI, W / 2 + 2 * cmI, -D / 2 - 2 * cmI, D / 2 + 2 * cmI, H - 4 * cmI, H, M.mat("plastic", "#cfd4d8"), 1 * cmI);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.cyl(s[0] * (W / 2 - 5 * cmI), s[1] * (D / 2 - 5 * cmI), 0, 8 * cmI, 3.5 * cmI, M.mat("rubber", "#2a2c2e"), { seg: 8 }); });
    M.tube([-W / 2 - 4 * cmI, -12 * cmI, H - 8 * cmI], [-W / 2 - 4 * cmI, 12 * cmI, H - 8 * cmI], 1.2 * cmI, M.mat("chrome", "#c9ced2"), 6);
    M.box(-16 * cmI, 16 * cmI, -12 * cmI, 10 * cmI, H, H + 1.5 * cmI, M.mat("metal", "#3a3d40"));
    M.push().move(0, -12 * cmI, H + 1.5 * cmI).tiltX(15);
    M.box(-16 * cmI, 16 * cmI, -1 * cmI, 0, 0, 20 * cmI, M.mat("screen", "#2f6fae"));
    M.pop();
  });
  // a stretcher: its frame on castors, the pad, rails folded down, a pillow
  itAdd("ic_health", "i_stretcher", 65, 200, ["o " + itR(0, 0, 65, 200, 10), "t " + itR(8, 8, 49, 40, 8)], { h: 0.9 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f6fae", "#c9ced2");
    var frame = M.mat("chrome", C.frame);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
      M.cyl(s[0] * (W / 2 - 6 * cmI), s[1] * (D / 2 - 12 * cmI), 0, 12 * cmI, 5 * cmI, M.mat("rubber", "#2a2c2e"), { seg: 10 });
      M.tube([s[0] * (W / 2 - 6 * cmI), s[1] * (D / 2 - 12 * cmI), 12 * cmI], [s[0] * (W / 2 - 8 * cmI), -s[1] * 20 * cmI, 70 * cmI], 1.6 * cmI, frame, 6);
    });
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, D / 2 - 4 * cmI, 70 * cmI, 74 * cmI, frame);
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, -D / 2 + 6 * cmI, D / 2 - 6 * cmI, 74 * cmI, 82 * cmI, M.mat("leather", C.main), 4 * cmI);
    M.box(-W / 2 + 12 * cmI, W / 2 - 12 * cmI, -D / 2 + 10 * cmI, -D / 2 + 45 * cmI, 82 * cmI, H, M.mat("linen", "#f4f4f1"), 5 * cmI);
  });
  // a doctor's scale: the platform, the column, its beam and weights, the height rod
  itAdd("ic_health", "i_docscale", 40, 50, ["o " + itR(0, 10, 40, 40, 4), "k " + itR(16, 0, 8, 14, 2)], { h: 2.0 }, function (M, W, D, H) {
    var white = M.mat("lacquer", "#e8e8e4"), chrome = M.mat("chrome", "#c9ced2");
    M.box(-W / 2, W / 2, -D / 2 + 10 * cmI, D / 2, 0, 8 * cmI, white, 2 * cmI);
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, -D / 2 + 13 * cmI, D / 2 - 3 * cmI, 8 * cmI, 8.5 * cmI, M.mat("rubber", "#2a2c2e"));
    M.box(-4 * cmI, 4 * cmI, -D / 2, -D / 2 + 8 * cmI, 0, 140 * cmI, white, 1 * cmI);
    M.box(-22 * cmI, 22 * cmI, -D / 2 + 2 * cmI, -D / 2 + 6 * cmI, 130 * cmI, 140 * cmI, chrome);
    M.box(-8 * cmI, -4 * cmI, -D / 2 + 1 * cmI, -D / 2 + 7 * cmI, 132 * cmI, 138 * cmI, M.mat("metal", "#3a3d40"));
    M.cyl(0, -D / 2 + 4 * cmI, 140 * cmI, H - 5 * cmI, 0.8 * cmI, chrome, { seg: 6 });
    M.box(-1 * cmI, 1 * cmI, -D / 2 + 4 * cmI, -D / 2 + 22 * cmI, H - 6 * cmI, H - 4 * cmI, chrome);
  });
  // an eye chart on the wall: rows of letters getting smaller, lit from behind
  itAdd("ic_health", "i_eyechart", 40, 5, ["o " + itR(0, 0, 40, 5, 1)], { wall: [1.2, 1.9] }, function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2 - 0.5 * cmI, 0, H, M.mat("metal", "#3a3d40"), 0.6 * cmI);
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, D / 2 - 0.5 * cmI, D / 2, 2 * cmI, H - 2 * cmI, M.mat("glow", "#ffffff"));
    var rows = [[1, 9], [2, 6], [3, 4.5], [4, 3.5], [5, 2.8], [6, 2.2], [7, 1.8], [8, 1.4]], y = H - 6 * cmI;
    rows.forEach(function (r) {
      var size = r[1] * cmI, n = r[0], span = n * size * 1.6;
      for (var i = 0; i < n; i++) { M.box(-span / 2 + i * size * 1.6, -span / 2 + i * size * 1.6 + size, D / 2, D / 2 + 0.2 * cmI, y - size, y, M.mat("plastic", "#1f2226")); }
      y -= size + 2.2 * cmI;
    });
  });
  // a first-aid box on the wall: white, its green cross
  itAdd("ic_health", "i_firstaid", 40, 15, ["o " + itR(0, 0, 40, 15, 2), "k M17 4 H23 V11 H17 Z"], { wall: [1.2, 1.6] }, function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("lacquer", "#f4f4f1"), 1.5 * cmI);
    M.box(-3 * cmI, 3 * cmI, D / 2, D / 2 + 0.4 * cmI, H / 2 - 10 * cmI, H / 2 + 10 * cmI, M.mat("plastic", "#2e9e5b"));
    M.box(-10 * cmI, 10 * cmI, D / 2, D / 2 + 0.4 * cmI, H / 2 - 3 * cmI, H / 2 + 3 * cmI, M.mat("plastic", "#2e9e5b"));
  });
  // a defibrillator in its cabinet on the wall: green, the heart and its lightning
  itAdd("ic_health", "i_aed", 35, 20, ["o " + itR(0, 0, 35, 20, 2), "k M12 6 L18 10 L15 10 L21 15"], { wall: [1.0, 1.45] }, function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("lacquer", "#2e9e5b"), 1.5 * cmI);
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2, D / 2 + 0.5 * cmI, 4 * cmI, H - 12 * cmI, M.mat("glass", "#dfeef2"));
    M.box(-8 * cmI, 8 * cmI, 0, D / 2 - 1 * cmI, 8 * cmI, 22 * cmI, M.mat("plastic", "#f2c94c"), 2 * cmI);
    M.box(-6 * cmI, 6 * cmI, D / 2, D / 2 + 0.6 * cmI, H - 9 * cmI, H - 3 * cmI, M.mat("plastic", "#f4f4f1"));
  });
  // oxygen: two tall cylinders in their cart, the regulators, a mask on its tube
  itAdd("ic_health", "i_oxygen", 40, 40, ["o " + itC(13, 20, 10) + " " + itC(27, 20, 10), "t " + itR(2, 2, 36, 36, 4)], { h: 1.2 }, function (M, W, D, H) {
    var frame = M.mat("metal", "#5d6166");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 4 * cmI, frame);
    [-1, 1].forEach(function (s) {
      M.cyl(s * 7 * cmI, 0, 4 * cmI, H - 18 * cmI, 7 * cmI, M.mat("lacquer", "#2e9e5b"), { seg: 14 });
      M.lathe(s * 7 * cmI, 0, [[7 * cmI, H - 18 * cmI], [4 * cmI, H - 10 * cmI], [2 * cmI, H - 8 * cmI]], M.mat("lacquer", "#f4f4f1"), { seg: 14, top: true });
      M.cyl(s * 7 * cmI, 0, H - 8 * cmI, H, 2.4 * cmI, M.mat("chrome", "#c9ced2"), { seg: 8 });
    });
    M.tube([-W / 2, -D / 2, 4 * cmI], [-W / 2, -D / 2, 90 * cmI], 1 * cmI, frame, 6);
    M.tube([W / 2, -D / 2, 4 * cmI], [W / 2, -D / 2, 90 * cmI], 1 * cmI, frame, 6);
    M.tube([-W / 2, -D / 2, 90 * cmI], [W / 2, -D / 2, 90 * cmI], 1.2 * cmI, frame, 6);
  });
  // a walking frame: the aluminium frame, front wheels, its grips
  itAdd("ic_health", "i_walker", 60, 55, ["o M5 50 V5 H55 V50", "k " + itC(5, 50, 4) + " " + itC(55, 50, 4)], { h: 0.85 }, function (M, W, D, H) {
    var al = M.mat("chrome", "#c9ced2"), rub = M.mat("rubber", "#2a2c2e");
    [-1, 1].forEach(function (s) {
      var x = s * (W / 2 - 4 * cmI);
      M.tube([x, D / 2 - 6 * cmI, 8 * cmI], [x, D / 2 - 8 * cmI, H], 1.4 * cmI, al, 8);
      M.tube([x, -D / 2 + 6 * cmI, 2 * cmI], [x, -D / 2 + 8 * cmI, H], 1.4 * cmI, al, 8);
      M.tube([x, D / 2 - 8 * cmI, H], [x, -D / 2 + 8 * cmI, H], 1.4 * cmI, al, 8);
      M.tube([x, D / 2 - 7 * cmI, 40 * cmI], [x, -D / 2 + 7 * cmI, 40 * cmI], 1.1 * cmI, al, 8);
      M.tube([x, -6 * cmI, H + 1 * cmI], [x, 10 * cmI, H + 1 * cmI], 2.2 * cmI, rub, 8);
      itWheel(M, x, D / 2 - 6 * cmI, 6 * cmI, 6 * cmI, 3 * cmI, rub);
      M.cyl(x, -D / 2 + 6 * cmI, 0, 3 * cmI, 2 * cmI, rub, { seg: 8 });
    });
    M.tube([-W / 2 + 4 * cmI, D / 2 - 8 * cmI, H - 6 * cmI], [W / 2 - 4 * cmI, D / 2 - 8 * cmI, H - 6 * cmI], 1.4 * cmI, al, 8);
  });
  // waiting room chairs: four seats on one beam, armrests between
  itAdd("ic_health", "i_waitchairs", 240, 60, function (w, h) { var d = ""; for (var i = 0; i < 4; i++) { d += itR(i * w / 4 + 4, 10, w / 4 - 8, h - 10, 6) + " "; } return ["o " + d.trim(), "t M0 8 H" + itN(w)]; }, { h: 0.85 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f6fae", "#5d6166");
    var frame = M.mat("metal", C.frame), seat = M.mat("plastic", C.main);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -4 * cmI, 4 * cmI, 36 * cmI, 42 * cmI, frame);
    [-1, 1].forEach(function (s) { M.box(s * (W / 2 - 25 * cmI) - 3 * cmI, s * (W / 2 - 25 * cmI) + 3 * cmI, -20 * cmI, 20 * cmI, 0, 38 * cmI, frame); });
    for (var i = 0; i < 4; i++) {
      var x0 = -W / 2 + i * W / 4 + 3 * cmI, x1 = -W / 2 + (i + 1) * W / 4 - 3 * cmI;
      M.box(x0, x1, -D / 2 + 10 * cmI, D / 2, 42 * cmI, 46 * cmI, seat, 2 * cmI);
      M.push().move(0, -D / 2 + 10 * cmI, 46 * cmI).tiltX(10);
      M.box(x0, x1, -3 * cmI, 0, 0, 40 * cmI, seat, 2 * cmI);
      M.pop();
      if (i) { M.box(x0 - 4 * cmI, x0 - 1 * cmI, -D / 2 + 14 * cmI, D / 2 - 6 * cmI, 60 * cmI, 63 * cmI, frame); M.box(x0 - 3 * cmI, x0 - 2 * cmI, D / 2 - 10 * cmI, D / 2 - 8 * cmI, 44 * cmI, 61 * cmI, frame); }
    }
  });

  // ===================================================================== music, art and hobbies ==
  // a grand piano: its curved case on three legs, the lid propped up, the keys, its bench
  itAdd("ic_hobby", "i_grandpiano", 150, 190, ["o M5 170 V20 Q5 5 40 5 Q140 5 145 60 Q148 120 110 140 Q90 150 90 170 Z", "k " + itR(10, 150, 130, 20, 1), "t M30 20 L120 120"], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#151515", "#f4f2ec");
    var black = M.mat("lacquer", C.main), keys = M.mat("plastic", C.frame);
    // (its case: straight along the keys and the bass side, curved round the treble)
    var poly = [[-W / 2, D / 2 - 25 * cmI], [-W / 2, -D / 2 + 30 * cmI], [-W / 2 + 25 * cmI, -D / 2], [W * 0.1, -D / 2 + 5 * cmI], [W / 2 - 10 * cmI, -D / 2 + 50 * cmI], [W / 2, 0], [W / 2 - 15 * cmI, D / 4], [W * 0.15, D / 2 - 40 * cmI], [W * 0.1, D / 2 - 25 * cmI]];
    M.prism(poly, 60 * cmI, H - 5 * cmI, black);
    M.prism(poly.map(function (p) { return [p[0] * 0.97, p[1] * 0.97]; }), H - 5 * cmI, H - 4 * cmI, M.mat("wood", "#3b2416"));
    M.push().move(-W / 2 + 2 * cmI, 0, H - 4 * cmI).tiltY(-40);
    M.prism(poly.map(function (p) { return [p[0] + W / 2 - 2 * cmI, p[1]]; }), 0, 2 * cmI, black);
    M.pop();
    M.tube([W * 0.05, -D / 4, H - 4 * cmI], [W * 0.05, -D / 4 - 5 * cmI, H + 55 * cmI], 0.8 * cmI, black, 6);
    M.box(-W / 2 + 2 * cmI, W * 0.1 - 2 * cmI, D / 2 - 40 * cmI, D / 2 - 18 * cmI, 70 * cmI, 74 * cmI, keys);
    for (var k = 0; k < 24; k++) { if ([1, 3, 6, 8, 10].indexOf(k % 12) >= 0) { M.box(-W / 2 + 4 * cmI + k * 5.4 * cmI, -W / 2 + 7 * cmI + k * 5.4 * cmI, D / 2 - 40 * cmI, D / 2 - 28 * cmI, 74 * cmI, 75.5 * cmI, black); } }
    [[-W / 2 + 10 * cmI, D / 2 - 30 * cmI], [W * 0.05, D / 2 - 32 * cmI], [W / 2 - 25 * cmI, -D / 2 + 50 * cmI]].forEach(function (p) { M.cyl(p[0], p[1], 0, 60 * cmI, 5 * cmI, black, { seg: 10, r1: 6 * cmI }); });
    M.box(-W / 2 + 15 * cmI, -W / 2 + 85 * cmI, D / 2 - 14 * cmI, D / 2, 44 * cmI, 50 * cmI, M.mat("leather", "#1f2226"), 1.5 * cmI);
    mLegs(M, -W / 2 + 15 * cmI, -W / 2 + 85 * cmI, D / 2 - 14 * cmI, D / 2, 3 * cmI, 0, 44 * cmI, 1.5 * cmI, black, false);
  });
  // a drum kit: the bass drum, snare and toms, the floor tom, the cymbals on their stands, the stool
  itAdd("ic_hobby", "i_drums", 200, 170, ["o " + itC(100, 70, 32) + " " + itC(55, 105, 20) + " " + itC(150, 110, 24), "t " + itC(30, 50, 22) + " " + itC(170, 45, 24), "k " + itC(100, 150, 12)], { h: 1.3 }, function (M, W, D, H, C) {
    C = mPick(C, "#8f2f2a", "#e8e2d8");
    var shell = M.mat("lacquer", C.main), head = M.mat("fabric", C.frame), chrome = M.mat("chrome", "#c9ced2"), brass = M.mat("brass", "#c9a24a");
    function drum(x, y, z, r, d, tilt) {
      M.push().move(x, y, z).tiltX(tilt || 0);
      M.cyl(0, 0, 0, d, r, shell, { seg: 18, bottom: true, topMat: head });
      M.pop();
    }
    M.push().move(0, -10 * cmI, 33 * cmI).tiltX(90);
    M.cyl(0, 0, -20 * cmI, 20 * cmI, 33 * cmI, shell, { seg: 20, bottom: true, topMat: head });
    M.pop();
    drum(-45 * cmI, 25 * cmI, 55 * cmI, 18 * cmI, 14 * cmI, -10);
    drum(-15 * cmI, -10 * cmI, 78 * cmI, 15 * cmI, 18 * cmI, -20); drum(18 * cmI, -10 * cmI, 78 * cmI, 16 * cmI, 18 * cmI, -20);
    drum(50 * cmI, 30 * cmI, 30 * cmI, 22 * cmI, 38 * cmI, 0);
    [[-70 * cmI, -30 * cmI, 115 * cmI], [70 * cmI, -40 * cmI, 125 * cmI], [-55 * cmI, 30 * cmI, 90 * cmI]].forEach(function (c, i) {
      M.cyl(c[0], c[1], 0, c[2], 1 * cmI, chrome, { seg: 6 });
      M.lathe(c[0], c[1], [[i === 2 ? 17 * cmI : 22 * cmI, c[2]], [2 * cmI, c[2] + 2.5 * cmI]], brass, { seg: 20, top: false });
      [0, 1, 2].forEach(function (k) { var a = k / 3 * Math.PI * 2; M.tube([c[0], c[1], 30 * cmI], [c[0] + Math.cos(a) * 25 * cmI, c[1] + Math.sin(a) * 25 * cmI, 0], 0.8 * cmI, chrome, 5); });
    });
    M.cyl(0, D / 2 - 20 * cmI, 0, 48 * cmI, 2 * cmI, chrome, { seg: 8 });
    M.cyl(0, D / 2 - 20 * cmI, 48 * cmI, 56 * cmI, 17 * cmI, M.mat("leather", "#1f2226"), { seg: 16 });
  });
  // a guitar on its stand
  itAdd("ic_hobby", "i_guitar", 40, 40, ["o M20 38 Q6 34 8 22 Q10 14 16 14 L18 2 H22 L24 14 Q30 14 32 22 Q34 34 20 38 Z", "k " + itC(20, 26, 4)], { h: 1.05 }, function (M, W, D, H, C) {
    C = mPick(C, "#c98a4b", "#2a2c2e");
    var body = M.mat("lacquer", C.main);
    [-1, 1].forEach(function (s) { M.tube([0, 0, 25 * cmI], [s * 15 * cmI, 12 * cmI, 0], 1 * cmI, M.mat("metal", C.frame), 6); M.tube([0, 0, 25 * cmI], [s * 12 * cmI, -12 * cmI, 0], 1 * cmI, M.mat("metal", C.frame), 6); });
    M.push().move(0, 0, 12 * cmI).tiltX(-12);
    M.push().tiltX(90);
    M.lathe(0, 18 * cmI, [[0.1, -5 * cmI], [17 * cmI, -5 * cmI], [17 * cmI, 5 * cmI], [0.1, 5 * cmI]], body, { seg: 18, ry: 1.3 });
    M.lathe(0, 42 * cmI, [[0.1, -4.5 * cmI], [13 * cmI, -4.5 * cmI], [13 * cmI, 4.5 * cmI], [0.1, 4.5 * cmI]], body, { seg: 18, ry: 1.0 });
    M.pop();
    M.cyl(0, -5.2 * cmI, 26 * cmI, 27 * cmI, 4.2 * cmI, M.mat("plastic", "#151515"), { seg: 14 });
    M.box(-2.5 * cmI, 2.5 * cmI, -3 * cmI, 0, 52 * cmI, 84 * cmI, M.mat("wood", "#5d3c25"));
    M.box(-4 * cmI, 4 * cmI, -3 * cmI, 1 * cmI, 84 * cmI, 96 * cmI, M.mat("wood", "#3b2416"));
    M.pop();
  });
  // a cello on its stand, its bow beside it
  itAdd("ic_hobby", "i_cello", 50, 50, ["o M25 48 Q8 44 10 30 Q12 22 18 20 Q12 14 16 8 Q20 4 25 4 Q30 4 34 8 Q38 14 32 20 Q38 22 40 30 Q42 44 25 48 Z", "t M25 4 V0"], { h: 1.3 }, function (M, W, D, H, C) {
    C = mPick(C, "#8a4a22", "#151515");
    var body = M.mat("lacquer", C.main);
    M.push().move(0, 0, 10 * cmI).tiltX(-10);
    M.cyl(0, 0, -10 * cmI, 10 * cmI, 0.8 * cmI, M.mat("chrome", "#c9ced2"), { seg: 6 });
    M.push().tiltX(90);
    M.lathe(0, 30 * cmI, [[0.1, -11 * cmI], [22 * cmI, -11 * cmI], [22 * cmI, 11 * cmI], [0.1, 11 * cmI]], body, { seg: 20, ry: 1.25 });
    M.lathe(0, 62 * cmI, [[0.1, -10 * cmI], [18 * cmI, -10 * cmI], [18 * cmI, 10 * cmI], [0.1, 10 * cmI]], body, { seg: 20, ry: 1.1 });
    M.pop();
    M.box(-2.5 * cmI, 2.5 * cmI, -12 * cmI, -9 * cmI, 20 * cmI, 70 * cmI, M.mat("wood", C.frame));
    M.box(-2.2 * cmI, 2.2 * cmI, -4 * cmI, 0, 80 * cmI, 118 * cmI, M.mat("wood", C.frame));
    M.ball(0, -1 * cmI, 121 * cmI, 3 * cmI, 2.5 * cmI, 4 * cmI, M.mat("wood", "#3b2416"), { seg: 6 });
    M.pop();
    M.tube([18 * cmI, 10 * cmI, 0], [16 * cmI, 2 * cmI, 72 * cmI], 0.6 * cmI, M.mat("wood", "#3b2416"), 5);
  });
  // a keyboard on its X stand
  itAdd("ic_hobby", "i_keyboard", 140, 40, ["o " + itR(0, 5, 140, 30, 3), "t " + itRows(10, 20, 120, 15, 6, false)], { h: 0.95 }, function (M, W, D, H, C) {
    C = mPick(C, "#1f2226", "#f4f2ec");
    var stand = M.mat("metal", "#3a3d40");
    [-1, 1].forEach(function (s) { M.tube([-30 * cmI, s * 15 * cmI, 0], [30 * cmI, s * 15 * cmI, H - 12 * cmI], 1.5 * cmI, stand, 6); M.tube([30 * cmI, s * 15 * cmI, 0], [-30 * cmI, s * 15 * cmI, H - 12 * cmI], 1.5 * cmI, stand, 6); });
    M.box(-W / 2, W / 2, -D / 2 + 5 * cmI, D / 2 - 5 * cmI, H - 12 * cmI, H - 4 * cmI, M.mat("plastic", C.main), 2 * cmI);
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, 0, D / 2 - 6 * cmI, H - 4 * cmI, H - 3 * cmI, M.mat("plastic", C.frame));
    for (var k = 0; k < 52; k++) { if ([1, 3, 6, 8, 10].indexOf(k % 12) >= 0) { M.box(-W / 2 + 9 * cmI + k * 2.35 * cmI, -W / 2 + 10.5 * cmI + k * 2.35 * cmI, 2 * cmI, D / 2 - 12 * cmI, H - 3 * cmI, H - 2 * cmI, M.mat("plastic", C.main)); } }
    M.box(-W / 2 + 8 * cmI, -W / 2 + 30 * cmI, -D / 2 + 7 * cmI, -2 * cmI, H - 4 * cmI, H - 3 * cmI, M.mat("screen", "#57c46f"));
  });
  // a microphone on its stand: the round base, the boom arm, the mic in its clip
  itAdd("ic_hobby", "i_micstand", 50, 50, ["o " + itC(25, 25, 16), "k " + itC(25, 25, 3), "t M25 25 L45 10"], { h: 1.6 }, function (M, W, D, H) {
    var black = M.mat("metal", "#1f2226");
    M.cyl(0, 0, 0, 3 * cmI, 16 * cmI, black, { seg: 18 });
    M.cyl(0, 0, 3 * cmI, H - 25 * cmI, 1.2 * cmI, black, { seg: 8 });
    M.tube([0, 0, H - 25 * cmI], [12 * cmI, 18 * cmI, H - 8 * cmI], 1 * cmI, black, 6);
    M.push().move(12 * cmI, 18 * cmI, H - 8 * cmI).tiltX(-50);
    M.cyl(0, 0, 0, 14 * cmI, 2.2 * cmI, black, { seg: 10, r1: 1.6 * cmI });
    M.ball(0, 0, 16 * cmI, 2.8 * cmI, 2.8 * cmI, 3.4 * cmI, M.mat("chrome", "#9aa0a5"), { seg: 8 });
    M.pop();
  });
  // a guitar amplifier: the cabinet in its covering, the grille cloth, knobs along its top
  itAdd("ic_hobby", "i_amp", 60, 35, ["o " + itR(0, 0, 60, 35, 3), "t " + itRows(4, 26, 52, 6, 6, false)], { h: 0.6 }, function (M, W, D, H, C) {
    C = mPick(C, "#1f2226", "#8f7a5a");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("leather", C.main), 2 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, D / 2, D / 2 + 0.4 * cmI, 4 * cmI, H - 14 * cmI, M.mat("fabric", C.frame));
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2 - 1 * cmI, D / 2 + 0.3 * cmI, H - 12 * cmI, H - 3 * cmI, M.mat("chrome", "#c9ced2"));
    for (var i = 0; i < 8; i++) { M.cyl(-W / 2 + 8 * cmI + i * 6 * cmI, D / 2 + 0.6 * cmI, H - 8 * cmI, H - 6 * cmI, 1.4 * cmI, M.mat("plastic", "#151515"), { seg: 10 }); }
    M.box(-12 * cmI, 12 * cmI, -3 * cmI, 3 * cmI, H, H + 3 * cmI, M.mat("leather", "#151515"), 1 * cmI);
  });
  // a sewing machine on its table, fabric under the needle, a spool on top
  itAdd("ic_hobby", "i_sewing", 100, 55, ["o " + itR(0, 0, 100, 55, 3), "k " + itR(30, 15, 45, 20, 3)], { h: 1.05 }, function (M, W, D, H, C) {
    C = mPick(C, "#f4f2ec", "#7a5236");
    itTable(M, W, D, 75 * cmI, M.mat("wood", C.frame), M.mat("metal", "#3a3d40"));
    var body = M.mat("lacquer", C.main);
    M.box(-25 * cmI, 25 * cmI, -10 * cmI, 10 * cmI, 75 * cmI, 82 * cmI, body, 2 * cmI);
    M.box(14 * cmI, 25 * cmI, -9 * cmI, 9 * cmI, 82 * cmI, H - 2 * cmI, body, 3 * cmI);
    M.box(-25 * cmI, 25 * cmI, -8 * cmI, 8 * cmI, H - 10 * cmI, H, body, 3 * cmI);
    M.box(-25 * cmI, -17 * cmI, -8 * cmI, 8 * cmI, 88 * cmI, H - 8 * cmI, body, 2 * cmI);
    M.cyl(-21 * cmI, 0, 82 * cmI, 88 * cmI, 0.4 * cmI, M.mat("chrome", "#c9ced2"), { seg: 6 });
    M.cyl(8 * cmI, 0, H, H + 4 * cmI, 2 * cmI, M.mat("fabric", "#c43c3a"), { seg: 10 });
    M.box(-40 * cmI, 10 * cmI, -18 * cmI, 22 * cmI, 75 * cmI, 75.5 * cmI, M.mat("fabric", "#2f6fae"));
  });
  // a potter's wheel: the splash pan round the wheel head, a pot thrown on it, its stool
  itAdd("ic_hobby", "i_pottery", 70, 70, ["o " + itC(35, 30, 26), "t " + itC(35, 30, 14), "k " + itC(35, 62, 8)], { h: 0.65 }, function (M, W, D, H, C) {
    C = mPick(C, "#5d6166", "#b4573a");
    var body = M.mat("metal", C.main);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 10 * cmI, D / 2 - 25 * cmI, 0, 40 * cmI, body, 4 * cmI);
    M.lathe(0, -5 * cmI, [[26 * cmI, 40 * cmI], [27 * cmI, 50 * cmI], [25 * cmI, 50 * cmI], [24 * cmI, 42 * cmI], [0.1, 42 * cmI]], M.mat("plastic", "#e8e8e4"), { seg: 24 });
    M.cyl(0, -5 * cmI, 42 * cmI, 46 * cmI, 15 * cmI, M.mat("metal", "#9aa0a5"), { seg: 20 });
    M.lathe(0, -5 * cmI, [[7 * cmI, 46 * cmI], [9 * cmI, 52 * cmI], [6 * cmI, 60 * cmI], [5 * cmI, H], [4.6 * cmI, H]], M.mat("ceramic", C.frame), { seg: 18 });
    M.cyl(0, D / 2 - 10 * cmI, 0, 40 * cmI, 2 * cmI, body, { seg: 8 });
    M.cyl(0, D / 2 - 10 * cmI, 40 * cmI, 44 * cmI, 13 * cmI, M.mat("wood", "#8a6a4c"), { seg: 14 });
  });
  // a kiln: a many-sided steel drum on its stand, the lid, the controller on its side
  itAdd("ic_hobby", "i_kiln", 70, 70, ["o M20 2 H50 L68 20 V50 L50 68 H20 L2 50 V20 Z", "k " + itR(62, 30, 8, 12, 1)], { h: 0.9 }, function (M, W, D, H) {
    var steel = M.mat("chrome", "#b9bec2");
    mLegs(M, -W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 2 * cmI, 0, 20 * cmI, 1.5 * cmI, M.mat("metal", "#3a3d40"), false);
    M.cyl(0, 0, 20 * cmI, H - 6 * cmI, W / 2 - 4 * cmI, steel, { seg: 8 });
    [0.35, 0.6].forEach(function (k) { M.cyl(0, 0, 20 * cmI + (H - 26 * cmI) * k - 1 * cmI, 20 * cmI + (H - 26 * cmI) * k + 1 * cmI, W / 2 - 3 * cmI, M.mat("metal", "#5d6166"), { seg: 8 }); });
    M.cyl(0, 0, H - 6 * cmI, H, W / 2 - 4 * cmI, M.mat("metal", "#9aa0a5"), { seg: 8 });
    M.box(W / 2 - 4 * cmI, W / 2 + 4 * cmI, -8 * cmI, 8 * cmI, 50 * cmI, 70 * cmI, M.mat("plastic", "#2a2c2e"), 1 * cmI);
    M.box(W / 2 + 4 * cmI, W / 2 + 4.3 * cmI, -6 * cmI, 6 * cmI, 62 * cmI, 68 * cmI, M.mat("screen", "#e0444f"));
  });
  // a chess table: the board inlaid, the pieces set up on it
  itAdd("ic_hobby", "i_chess", 70, 70, function (w, h) {
    var d = "";
    for (var i = 0; i < 8; i++) { for (var j = 0; j < 8; j++) { if ((i + j) % 2) { d += itR(11 + i * 6, 11 + j * 6, 6, 6, 0) + " "; } } }
    return ["o " + itR(0, 0, w, h, 4), "k " + d.trim()];
  }, { h: 0.85 }, function (M, W, D, H, C) {
    C = mPick(C, "#5d3c25", "#efe3c2");
    itTable(M, W, D, 72 * cmI, M.mat("wood", C.main), M.mat("wood", C.main), true);
    var sq = (Math.min(W, D) - 22 * cmI) / 8, x0 = -4 * sq, y0 = -4 * sq;
    for (var i = 0; i < 8; i++) { for (var j = 0; j < 8; j++) { if ((i + j) % 2 === 0) { M.box(x0 + i * sq, x0 + (i + 1) * sq, y0 + j * sq, y0 + (j + 1) * sq, 72 * cmI, 72.2 * cmI, M.mat("wood", C.frame)); } } }
    [[0, "#f4f2ec"], [1, "#f4f2ec"], [6, "#1f2226"], [7, "#1f2226"]].forEach(function (r) {
      for (var i = 0; i < 8; i++) {
        var x = x0 + (i + 0.5) * sq, y = y0 + (r[0] + 0.5) * sq, tall = r[0] === 1 || r[0] === 6 ? 3 * cmI : [5, 4.4, 4.6, 6, 6.6, 4.6, 4.4, 5][i] * cmI;
        M.lathe(x, y, [[sq * 0.32, 72 * cmI], [sq * 0.18, 72 * cmI + tall * 0.6], [sq * 0.22, 72 * cmI + tall * 0.85], [0.1, 72 * cmI + tall]], M.mat("lacquer", r[1]), { seg: 10 });
      }
    });
  });
  // a drafting table: its board tilted on a steel frame, the parallel bar, a lamp clamped on
  itAdd("ic_hobby", "i_drafting", 120, 90, ["o " + itR(0, 0, 120, 75, 2), "t M0 20 H120", "k " + itC(110, 82, 6)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#f4f2ec", "#5d6166");
    var frame = M.mat("metal", C.frame);
    [-1, 1].forEach(function (s) { M.box(s * (W / 2 - 8 * cmI) - 2 * cmI, s * (W / 2 - 8 * cmI) + 2 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 0, 4 * cmI, frame); M.box(s * (W / 2 - 8 * cmI) - 2 * cmI, s * (W / 2 - 8 * cmI) + 2 * cmI, -3 * cmI, 3 * cmI, 4 * cmI, 80 * cmI, frame); });
    M.push().move(0, 0, 82 * cmI).tiltX(25);
    M.box(-W / 2, W / 2, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 0, 3 * cmI, M.mat("plastic", C.main), 1 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, 10 * cmI, 13 * cmI, 3 * cmI, 4.5 * cmI, M.mat("plastic", "#2f6fae"));
    M.box(-30 * cmI, 20 * cmI, -20 * cmI, 15 * cmI, 3 * cmI, 3.2 * cmI, M.mat("linen", "#eef4f8"));
    M.pop();
    M.tube([W / 2 - 6 * cmI, -D / 2 + 12 * cmI, 95 * cmI], [W / 2 - 25 * cmI, -D / 2 + 30 * cmI, H + 30 * cmI], 0.8 * cmI, frame, 6);
    M.lathe(W / 2 - 28 * cmI, -D / 2 + 32 * cmI, [[2 * cmI, H + 30 * cmI], [9 * cmI, H + 20 * cmI]], M.mat("metal", "#2f6fae"), { seg: 14, top: false });
  });
  // a floor globe: its turned wooden stand, the meridian ring, the globe
  itAdd("ic_hobby", "i_globe", 50, 50, ["o " + itC(25, 25, 22), "t " + itC(25, 25, 16), "t M5 25 H45"], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#5d3c25", "#c9a24a");
    var wood = M.mat("wood", C.main);
    [0, 1, 2].forEach(function (k) { var a = k / 3 * Math.PI * 2; M.tube([0, 0, 40 * cmI], [Math.cos(a) * 22 * cmI, Math.sin(a) * 22 * cmI, 0], 2 * cmI, wood, 6); });
    M.lathe(0, 0, [[4 * cmI, 38 * cmI], [6 * cmI, 46 * cmI], [3 * cmI, 52 * cmI]], wood, { seg: 12 });
    M.push().move(0, 0, H - 22 * cmI).tiltY(23);
    M.ball(0, 0, 0, 20 * cmI, 20 * cmI, 20 * cmI, M.mat("plastic", "#3a7ca5"), { seg: 12 });
    [[0, 30, 8], [80, 10, 7], [160, -20, 9], [240, 40, 6], [300, -10, 8]].forEach(function (c) {
      var a = c[0] * Math.PI / 180, la = c[1] * Math.PI / 180;
      M.ball(Math.cos(a) * Math.cos(la) * 18.6 * cmI, Math.sin(a) * Math.cos(la) * 18.6 * cmI, Math.sin(la) * 18.6 * cmI, c[2] * cmI, c[2] * cmI, c[2] * 0.6 * cmI, M.mat("fabric", "#6b8f4a"), { seg: 6 });
    });
    M.lathe(0, 0, [[22 * cmI, -1 * cmI], [22 * cmI, 1 * cmI]], M.mat("brass", C.frame), { seg: 28, top: false });
    M.pop();
  });
  // a harp: its pillar, the curved neck, the soundboard, the strings
  itAdd("ic_hobby", "i_harp", 60, 100, ["o M10 95 L50 95 L45 10 Q30 2 20 10 Z", "t M18 20 L45 90 M22 30 L45 80"], { h: 1.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#c9a24a", "#5d3c25");
    var gold = M.mat("brass", C.main), wood = M.mat("wood", C.frame);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 0, 10 * cmI, wood, 3 * cmI);
    M.cyl(0, D / 2 - 20 * cmI, 10 * cmI, H - 10 * cmI, 4 * cmI, gold, { seg: 10 });
    M.ball(0, D / 2 - 20 * cmI, H - 8 * cmI, 7 * cmI, 7 * cmI, 9 * cmI, gold, { seg: 8 });
    M.tube([0, -D / 2 + 20 * cmI, 20 * cmI], [0, -D / 2 + 10 * cmI, H * 0.75], 9 * cmI, wood, 10);
    var neck = [];
    for (var i = 0; i <= 8; i++) { var t = i / 8; neck.push([0, D / 2 - 20 * cmI - t * (D - 30 * cmI), H - 10 * cmI - Math.sin(t * Math.PI) * 25 * cmI + t * (H * 0.75 - H + 10 * cmI)]); }
    for (var j = 0; j < 8; j++) { M.tube(neck[j], neck[j + 1], 3.5 * cmI, gold, 8); }
    for (var s = 1; s < 12; s++) {
      var t2 = s / 12, top = [0, D / 2 - 20 * cmI - t2 * (D - 30 * cmI), H - 10 * cmI - Math.sin(t2 * Math.PI) * 25 * cmI + t2 * (H * 0.75 - H + 10 * cmI)];
      M.tube([0, top[1], top[2] - 4 * cmI], [0, -D / 2 + 20 * cmI + (1 - t2) * 5 * cmI, 20 * cmI + (1 - t2) * (H * 0.75 - 20 * cmI)], 0.15 * cmI, M.mat("fabric", s % 7 === 0 ? "#c43c3a" : "#efe7d6"), 4);
    }
  });
  // a music stand: the tripod, its column, the slotted desk, a score open on it
  itAdd("ic_hobby", "i_musicstand", 50, 40, ["o M5 5 H45 V15 H5 Z", "k " + itC(25, 30, 3), "t M25 30 L10 38 M25 30 L40 38 M25 30 L25 15"], { h: 1.3 }, function (M, W, D, H) {
    var black = M.mat("metal", "#1f2226");
    [0, 1, 2].forEach(function (k) { var a = k / 3 * Math.PI * 2 + 0.5; M.tube([0, 5 * cmI, 20 * cmI], [Math.cos(a) * 22 * cmI, 5 * cmI + Math.sin(a) * 18 * cmI, 0], 0.8 * cmI, black, 5); });
    M.cyl(0, 5 * cmI, 20 * cmI, H - 30 * cmI, 1 * cmI, black, { seg: 6 });
    M.push().move(0, 0, H - 32 * cmI).tiltX(-20);
    M.box(-W / 2, W / 2, -1 * cmI, 0, 0, 34 * cmI, black);
    M.box(-W / 2, W / 2, 0, 5 * cmI, 0, 2 * cmI, black);
    M.box(-W / 2 + 4 * cmI, -1 * cmI, 0.2 * cmI, 0.6 * cmI, 3 * cmI, 31 * cmI, M.mat("linen", "#f4f2ec"));
    M.box(1 * cmI, W / 2 - 4 * cmI, 0.2 * cmI, 0.6 * cmI, 3 * cmI, 31 * cmI, M.mat("linen", "#f4f2ec"));
    M.pop();
  });
  // a DJ's desk: two turntables and the mixer between, the laptop, speakers either side
  itAdd("ic_hobby", "i_djdesk", 160, 80, ["o " + itR(20, 10, 120, 60, 4), "t " + itC(50, 40, 18) + " " + itC(110, 40, 18), "k " + itR(0, 20, 18, 40, 2) + " " + itR(142, 20, 18, 40, 2)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#1f2226", "#2f6fae");
    var black = M.mat("lacquer", C.main);
    M.box(-W / 2 + 20 * cmI, W / 2 - 20 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 0, H - 8 * cmI, black, 2 * cmI);
    M.box(-W / 2 + 20 * cmI, W / 2 - 20 * cmI, D / 2 - 10.5 * cmI, D / 2 - 10 * cmI, 20 * cmI, 40 * cmI, M.mat("glow", C.frame));
    [-1, 1].forEach(function (s) {
      M.box(s * 30 * cmI - 20 * cmI, s * 30 * cmI + 20 * cmI, -18 * cmI, 18 * cmI, H - 8 * cmI, H - 2 * cmI, M.mat("metal", "#3a3d40"), 1 * cmI);
      M.cyl(s * 30 * cmI, 0, H - 2 * cmI, H - 1 * cmI, 15 * cmI, M.mat("rubber", "#151515"), { seg: 22 });
      M.cyl(s * 30 * cmI, 0, H - 1 * cmI, H - 0.6 * cmI, 4 * cmI, M.mat("plastic", "#c43c3a"), { seg: 12 });
      M.box(s * (W / 2 - 9 * cmI) - 9 * cmI, s * (W / 2 - 9 * cmI) + 9 * cmI, -20 * cmI, 20 * cmI, 0, H + 20 * cmI, black, 2 * cmI);
      M.cyl(s * (W / 2 - 9 * cmI), 20.5 * cmI, 25 * cmI, 25.5 * cmI, 7 * cmI, M.mat("metal", "#5d6166"), { seg: 14 });
      M.cyl(s * (W / 2 - 9 * cmI), 20.5 * cmI, H, H + 0.5 * cmI, 4 * cmI, M.mat("metal", "#5d6166"), { seg: 12 });
    });
    M.box(-8 * cmI, 8 * cmI, -18 * cmI, 18 * cmI, H - 8 * cmI, H - 1 * cmI, M.mat("plastic", "#2a2c2e"), 1 * cmI);
    M.push().move(0, -D / 2 + 14 * cmI, H - 1 * cmI).tiltX(15);
    M.box(-16 * cmI, 16 * cmI, 0, 1 * cmI, 0, 20 * cmI, M.mat("screen", "#2f6fae"));
    M.pop();
  });

  // ===================================================================== classrooms and labs ==
  // a lab bench: dark top, two sinks with their swan-neck taps, gas taps, a reagent shelf down its middle
  itAdd("ic_learn", "i_labbench", 300, 90, function (w, h) { return ["o " + itR(0, 0, w, h, 2), "t M0 " + itN(h / 2) + " H" + itN(w), "k " + itR(w * 0.2, h / 2 - 12, 30, 24, 3) + " " + itR(w * 0.7, h / 2 - 12, 30, 24, 3)]; },
        { h: 0.92 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#1f2226");
    var body = M.mat("lacquer", C.main), top = M.mat("stone", C.frame), chrome = M.mat("chrome", "#c9ced2");
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, D / 2 - 4 * cmI, 0, H - 4 * cmI, body, 1 * cmI);
    for (var x = -W / 2 + 30 * cmI; x < W / 2 - 20 * cmI; x += 50 * cmI) { [-1, 1].forEach(function (s) { M.box(x - 22 * cmI, x + 22 * cmI, s * (D / 2 - 4 * cmI), s * (D / 2 - 3.6 * cmI), 10 * cmI, H - 10 * cmI, M.mat("lacquer", "#e3d9c4")); }); }
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 4 * cmI, H, top, 1 * cmI);
    [0.2, 0.7].forEach(function (k) {
      var x = -W / 2 + W * k + 15 * cmI;
      M.box(x - 15 * cmI, x + 15 * cmI, -12 * cmI, 12 * cmI, H - 0.5 * cmI, H, M.mat("ceramic", "#2a2c2e"));
      M.cyl(x, -14 * cmI, H, H + 30 * cmI, 1 * cmI, chrome, { seg: 6 });
      M.tube([x, -14 * cmI, H + 30 * cmI], [x, -4 * cmI, H + 26 * cmI], 1 * cmI, chrome, 6);
    });
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -3 * cmI, 3 * cmI, H, H + 40 * cmI, M.mat("wood", "#8a6a4c"));
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -10 * cmI, 10 * cmI, H + 38 * cmI, H + 40 * cmI, M.mat("wood", "#8a6a4c"));
    for (var g = -W / 2 + 20 * cmI; g < W / 2 - 10 * cmI; g += 40 * cmI) { [-1, 1].forEach(function (s) { M.cyl(g, s * 6 * cmI, H + 8 * cmI, H + 12 * cmI, 1.2 * cmI, M.mat("brass", "#c9a24a"), { seg: 6 }); }); }
    for (var b = -W / 2 + 16 * cmI; b < W / 2 - 16 * cmI; b += 12 * cmI) { M.cyl(b, 0, H + 40 * cmI, H + 52 * cmI, 2.5 * cmI, M.mat("glass", ["#c8352e", "#2f6fae", "#f2d23c", "#3f9a5a"][Math.round(b / cmI) % 4 < 0 ? 0 : Math.round(b / cmI) % 4]), { seg: 8, r1: 1 * cmI }); }
  });
  // a fume cupboard: its cabinet, the glass sash half up, the baffle and lights inside, the duct up from it
  itAdd("ic_learn", "i_fumehood", 150, 85, ["o " + itR(0, 0, 150, 85, 2), "t " + itR(8, 8, 134, 60, 2), "k " + itR(60, 0, 30, 8, 1)], { h: 2.4 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#2a2c2e");
    var body = M.mat("lacquer", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 90 * cmI, body, 1 * cmI);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 90 * cmI, 92 * cmI, M.mat("stone", C.frame));
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 8 * cmI : 0), s * W / 2 + (s < 0 ? 8 * cmI : 0), -D / 2, D / 2, 92 * cmI, H - 20 * cmI, body); });
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 6 * cmI, 92 * cmI, H - 20 * cmI, body);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 40 * cmI, H - 20 * cmI, body, 1 * cmI);
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, D / 2 - 3 * cmI, D / 2 - 2 * cmI, 135 * cmI, H - 40 * cmI, M.mat("glass", "#cfe3ea"));
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, D / 2 - 5 * cmI, D / 2, 133 * cmI, 137 * cmI, M.mat("metal", "#9aa0a5"));
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 10 * cmI, -D / 2 + 11 * cmI, 95 * cmI, H - 42 * cmI, M.mat("glow", "#f4f6f7"));
    M.cyl(0, -D / 4, H - 20 * cmI, H, 14 * cmI, M.mat("metal", "#b9bec2"), { seg: 16 });
    for (var i = 0; i < 3; i++) { M.cyl(-30 * cmI + i * 30 * cmI, 0, 92 * cmI, 92 * cmI + (14 + i * 6) * cmI, 3.5 * cmI, M.mat("glass", "#e6f3f7"), { seg: 10, r1: 1.4 * cmI }); }
  });
  // a microscope on a bench: its base and arm, the stage, two eyepieces, the lenses
  itAdd("ic_learn", "i_microscope", 30, 25, ["o " + itR(5, 5, 20, 18, 3), "k " + itC(15, 10, 4)], { top: 0.4 }, function (M, W, D, H, C) {
    C = mPick(C, "#e8e8e4", "#2a2c2e");
    var body = M.mat("lacquer", C.main), dark = M.mat("metal", C.frame);
    M.box(-9 * cmI, 9 * cmI, -10 * cmI, 10 * cmI, 0, 4 * cmI, body, 2 * cmI);
    M.box(-3 * cmI, 3 * cmI, -10 * cmI, -4 * cmI, 4 * cmI, 30 * cmI, body, 1.5 * cmI);
    M.box(-8 * cmI, 8 * cmI, -4 * cmI, 8 * cmI, 14 * cmI, 15 * cmI, dark);
    M.push().move(0, -2 * cmI, 30 * cmI).tiltX(30);
    M.cyl(0, 0, -4 * cmI, 6 * cmI, 3 * cmI, body, { seg: 12 });
    [-1, 1].forEach(function (s) { M.cyl(s * 2.2 * cmI, 0, 6 * cmI, 12 * cmI, 1.2 * cmI, dark, { seg: 8 }); });
    M.pop();
    M.cyl(0, 2 * cmI, 17 * cmI, 24 * cmI, 2.4 * cmI, dark, { seg: 10 });
    M.cyl(0, 2 * cmI, 15 * cmI, 17 * cmI, 1.2 * cmI, M.mat("chrome", "#c9ced2"), { seg: 8 });
  });
  // a lectern: the sloped desk on its column, a light over the page
  itAdd("ic_learn", "i_lectern", 60, 50, ["o " + itR(5, 5, 50, 40, 4), "k " + itR(15, 30, 30, 12, 1)], { h: 1.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#7a5236", "#c9a24a");
    var wood = M.mat("wood", C.main);
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, -D / 2 + 8 * cmI, D / 2 - 8 * cmI, 0, 6 * cmI, wood, 2 * cmI);
    M.box(-W / 2 + 14 * cmI, W / 2 - 14 * cmI, -6 * cmI, 6 * cmI, 6 * cmI, H - 12 * cmI, wood, 2 * cmI);
    M.push().move(0, 0, H - 12 * cmI).tiltX(-20);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, D / 2 - 4 * cmI, 0, 6 * cmI, wood, 1.5 * cmI);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, D / 2 - 6 * cmI, D / 2 - 3 * cmI, 6 * cmI, 9 * cmI, wood);
    M.box(-18 * cmI, 18 * cmI, -12 * cmI, 12 * cmI, 6 * cmI, 7 * cmI, M.mat("linen", "#f4f2ec"));
    M.pop();
    M.tube([0, -D / 2 + 8 * cmI, H - 6 * cmI], [0, -2 * cmI, H + 14 * cmI], 0.6 * cmI, M.mat("brass", C.frame), 6);
    M.cyl(0, 0, H + 10 * cmI, H + 14 * cmI, 5 * cmI, M.mat("brass", C.frame), { seg: 10, ry: 0.4 });
  });
  // a chalkboard on the wall: the slate in its wooden frame, chalk and a duster on the ledge, writing on it
  itAdd("ic_learn", "i_chalkboard", 360, 8, ["o " + itR(0, 0, 360, 8, 1)], { wall: [0.8, 2.0] }, function (M, W, D, H, C) {
    C = mPick(C, "#2f4a3c", "#8a6a4c");
    var frame = M.mat("wood", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2 - 2 * cmI, 0, H, frame);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, D / 2 - 2 * cmI, D / 2 - 1.5 * cmI, 4 * cmI, H - 4 * cmI, M.mat("plain", C.main));
    M.box(-W / 2, W / 2, -D / 2, D / 2 + 6 * cmI, 0, 3 * cmI, frame);
    M.box(-60 * cmI, -50 * cmI, D / 2, D / 2 + 4 * cmI, 3 * cmI, 7 * cmI, M.mat("fabric", "#3a3d40"));
    for (var r = 0; r < 4; r++) { M.box(-W / 2 + 30 * cmI, -W / 2 + (90 + (r * 37) % 70) * cmI, D / 2 - 1.4 * cmI, D / 2 - 1.2 * cmI, H - (25 + r * 18) * cmI, H - (22 + r * 18) * cmI, M.mat("glow", "#e8e8e4")); }
  });
  // cubbies: a wooden unit of square holes, a bag or a pair of shoes in some
  itAdd("ic_learn", "i_cubbies", 150, 40, function (w, h) { return ["o " + itR(0, 0, w, h, 1), "t " + itRows(0, 0, w, h, 30, false)]; }, { h: 1.2 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#c9a273", "#2f6fae");
    var wood = M.mat("wood", C.main), cols = Math.max(2, Math.round(W / (30 * cmI))), rows = 3, rnd = mRand((n && n.id) || 201);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 1.5 * cmI, 0, H, wood);
    for (var i = 0; i <= cols; i++) { var x = -W / 2 + i * W / cols; M.box(x - 1 * cmI, x + 1 * cmI, -D / 2, D / 2, 0, H, wood); }
    for (var j = 0; j <= rows; j++) { var z = j * H / rows; M.box(-W / 2, W / 2, -D / 2, D / 2, z - 1 * cmI, z + 1 * cmI, wood); }
    for (var a = 0; a < cols; a++) {
      for (var b = 0; b < rows; b++) {
        if (rnd() < 0.45) { continue; }
        var cx = -W / 2 + (a + 0.5) * W / cols, z0 = b * H / rows + 1 * cmI;
        M.box(cx - 10 * cmI, cx + 10 * cmI, -D / 2 + 6 * cmI, D / 2 - 6 * cmI, z0, z0 + (14 + rnd() * 10) * cmI, M.mat("fabric", IT_PACK[Math.floor(rnd() * IT_PACK.length)]), 3 * cmI);
      }
    }
  });
  // a skeleton for the anatomy class, hung on its stand
  itAdd("ic_learn", "i_skeleton", 50, 50, ["o " + itC(25, 25, 20), "k " + itC(25, 25, 3)], { h: 1.8 }, function (M, W, D, H) {
    var bone = M.mat("ceramic", "#efe7d6"), stand = M.mat("chrome", "#9aa0a5");
    [0, 1, 2, 3, 4].forEach(function (k) { var a = k / 5 * Math.PI * 2; M.tube([0, 0, 6 * cmI], [Math.cos(a) * 20 * cmI, Math.sin(a) * 20 * cmI, 2 * cmI], 1 * cmI, stand, 6); });
    M.cyl(0, -8 * cmI, 4 * cmI, H, 1.2 * cmI, stand, { seg: 6 });
    M.ball(0, 0, H - 14 * cmI, 8 * cmI, 9 * cmI, 10 * cmI, bone, { seg: 8 });
    M.cyl(0, 0, 100 * cmI, H - 24 * cmI, 1.5 * cmI, bone, { seg: 6 });
    for (var r = 0; r < 6; r++) { M.lathe(0, 0, [[13 * cmI - r * 1 * cmI, 125 * cmI + r * 5 * cmI], [13 * cmI - r * 1 * cmI, 126.5 * cmI + r * 5 * cmI]], bone, { seg: 14, top: false, ry: 0.6 }); }
    M.ball(0, 0, 98 * cmI, 13 * cmI, 7 * cmI, 7 * cmI, bone, { seg: 8 });
    [-1, 1].forEach(function (s) {
      M.tube([s * 16 * cmI, 0, 150 * cmI], [s * 20 * cmI, 2 * cmI, 118 * cmI], 1.3 * cmI, bone, 6); M.tube([s * 20 * cmI, 2 * cmI, 118 * cmI], [s * 22 * cmI, 6 * cmI, 90 * cmI], 1.1 * cmI, bone, 6);
      M.tube([s * 8 * cmI, 0, 95 * cmI], [s * 9 * cmI, 0, 50 * cmI], 1.6 * cmI, bone, 6); M.tube([s * 9 * cmI, 0, 50 * cmI], [s * 9 * cmI, 0, 8 * cmI], 1.3 * cmI, bone, 6);
      M.box(s * 9 * cmI - 3 * cmI, s * 9 * cmI + 3 * cmI, -2 * cmI, 8 * cmI, 6 * cmI, 9 * cmI, bone, 1 * cmI);
    });
  });
  // a laptop cart: a steel cabinet of slots, laptops charging in them, its handles and castors
  itAdd("ic_learn", "i_laptopcart", 90, 60, ["o " + itR(0, 0, 90, 60, 4), "t " + itRows(4, 4, 82, 52, 8, false)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#3a6fa0", "#2a2c2e");
    var body = M.mat("metal", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 10 * cmI, H, body, 2 * cmI);
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2, D / 2 + 1 * cmI, 14 * cmI, H - 4 * cmI, M.mat("metal", mShade(C.main, 0.08)));
    for (var x = -W / 2 + 8 * cmI; x < W / 2 - 6 * cmI; x += 7 * cmI) { M.box(x, x + 0.6 * cmI, D / 2 + 1 * cmI, D / 2 + 1.4 * cmI, 30 * cmI, 70 * cmI, M.mat("metal", C.frame)); }
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.cyl(s[0] * (W / 2 - 6 * cmI), s[1] * (D / 2 - 6 * cmI), 0, 10 * cmI, 4 * cmI, M.mat("rubber", "#151515"), { seg: 10 }); });
    [-1, 1].forEach(function (s) { M.tube([s * (W / 2 + 3 * cmI), -15 * cmI, H - 10 * cmI], [s * (W / 2 + 3 * cmI), 15 * cmI, H - 10 * cmI], 1.5 * cmI, M.mat("chrome", "#c9ced2"), 6); });
  });
  // bleachers: tiers of benches stepping up and back, the rail at the top, steps up one end
  itAdd("ic_learn", "i_bleachers", 600, 300, function (w, h) { return ["o " + itR(0, 0, w, h, 2), "t " + itRows(0, 0, w, h, 60, true), "k " + itR(0, 0, 60, h, 1)]; }, { h: 1.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#c9a273", "#5d6166");
    var wood = M.mat("wood", C.main), steel = M.mat("metal", C.frame), tiers = Math.max(3, Math.round(D / (60 * cmI)));
    for (var t = 0; t < tiers; t++) {
      var y1 = D / 2 - t * D / tiers, y0 = y1 - D / tiers, z = (t + 1) * (H - 40 * cmI) / tiers;
      M.box(-W / 2, W / 2, y0, y1, z - 4 * cmI, z, wood, 1 * cmI);
      M.box(-W / 2, W / 2, y1 - 30 * cmI, y1 - 26 * cmI, z - 4 * cmI - (H - 40 * cmI) / tiers + 4 * cmI, z - 4 * cmI, M.mat("wood", mShade(C.main, -0.12)));
      for (var x = -W / 2 + 20 * cmI; x < W / 2; x += 150 * cmI) { M.box(x - 3 * cmI, x + 3 * cmI, y0 + 4 * cmI, y0 + 10 * cmI, 0, z - 4 * cmI, steel); }
    }
    M.tube([-W / 2, -D / 2 + 3 * cmI, H], [W / 2, -D / 2 + 3 * cmI, H], 2 * cmI, steel, 8);
    for (var p = -W / 2; p <= W / 2; p += 150 * cmI) { M.cyl(p, -D / 2 + 3 * cmI, H - 45 * cmI, H, 1.6 * cmI, steel, { seg: 6 }); }
  });
  // a basketball hoop on its post: the padded pole, the backboard, the orange ring and its net
  itAdd("ic_learn", "i_hoop", 120, 150, ["o " + itR(10, 0, 100, 12, 2), "t " + itC(60, 40, 23), "k " + itR(52, 120, 16, 30, 3)], { h: 3.5 }, function (M, W, D, H, C) {
    C = mPick(C, "#2a2c2e", "#e2731f");
    var pole = M.mat("metal", C.main), rim = M.mat("metal", C.frame);
    M.box(-8 * cmI, 8 * cmI, D / 2 - 30 * cmI, D / 2 - 10 * cmI, 0, H - 40 * cmI, pole, 2 * cmI);
    M.box(-10 * cmI, 10 * cmI, D / 2 - 32 * cmI, D / 2 - 8 * cmI, 0, 180 * cmI, M.mat("fabric", "#1f5fa8"), 3 * cmI);
    M.tube([0, D / 2 - 20 * cmI, H - 50 * cmI], [0, -D / 2 + 20 * cmI, H - 50 * cmI], 4 * cmI, pole, 8);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 6 * cmI, -D / 2 + 12 * cmI, H - 105 * cmI, H, M.mat("glass", "#e6f3f7"));
    M.box(-30 * cmI, 30 * cmI, -D / 2 + 12 * cmI, -D / 2 + 12.4 * cmI, H - 80 * cmI, H - 35 * cmI, M.mat("plastic", "#f4f4f1"));
    M.lathe(0, -D / 2 + 40 * cmI, [[23 * cmI, H - 76 * cmI], [23 * cmI, H - 74 * cmI]], rim, { seg: 24, top: false });
    M.lathe(0, -D / 2 + 40 * cmI, [[22 * cmI, H - 76 * cmI], [15 * cmI, H - 115 * cmI]], M.mat("shade", "#f4f4f1"), { seg: 16, top: false });
  });
  // a children's table: low, rounded, four little chairs in bright colors
  itAdd("ic_learn", "i_kidstable", 120, 80, ["o " + itR(20, 15, 80, 50, 12), "o " + itR(0, 30, 16, 20, 3) + " " + itR(104, 30, 16, 20, 3) + " " + itR(50, 0, 20, 12, 3) + " " + itR(50, 68, 20, 12, 3)], { h: 0.55 }, function (M, W, D, H, C) {
    C = mPick(C, "#f2c94c", "#3f9a5a");
    itTable(M, 80 * cmI, 50 * cmI, 52 * cmI, M.mat("plastic", C.main), M.mat("metal", "#9aa0a5"), true);
    [[-1, 0, 90], [1, 0, 270], [0, -1, 0], [0, 1, 180]].forEach(function (s, i) {
      var x = s[0] * (W / 2 - 8 * cmI), y = s[1] * (D / 2 - 6 * cmI), col = M.mat("plastic", ["#c43c3a", "#2f6fae", "#3f9a5a", "#e2731f"][i]);
      M.push().move(x, y, 0).turn(s[2]);
      mLegs(M, -14 * cmI, 14 * cmI, -12 * cmI, 12 * cmI, 2 * cmI, 0, 30 * cmI, 1 * cmI, col, true);
      M.box(-15 * cmI, 15 * cmI, -13 * cmI, 13 * cmI, 30 * cmI, 33 * cmI, col, 2 * cmI);
      M.box(-14 * cmI, 14 * cmI, -13 * cmI, -10 * cmI, 33 * cmI, 55 * cmI, col, 2 * cmI);
      M.pop();
    });
  });

  // ===================================================================== offices and work ==
  // a cubicle: fabric panels round three sides, an L of desk, the monitor, a pedestal, its chair
  itAdd("ic_work", "i_cubicle", 180, 180, ["o M0 180 V0 H180 V180", "t " + itR(6, 6, 168, 60, 2) + " " + itR(6, 66, 60, 100, 2), "k " + itC(110, 120, 14)], { h: 1.5 }, function (M, W, D, H, C) {
    C = mPick(C, "#7f8794", "#e8e4dc");
    var panel = M.mat("fabric", C.main), desk = M.mat("wood", C.frame), frame = M.mat("metal", "#9aa0a5");
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 5 * cmI, 0, H, panel, 1 * cmI);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 5 * cmI : 0), s * W / 2 + (s < 0 ? 5 * cmI : 0), -D / 2, D / 2, 0, H, panel, 1 * cmI); });
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 5 * cmI, H - 2 * cmI, H, frame);
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, -D / 2 + 5 * cmI, -D / 2 + 70 * cmI, 72 * cmI, 75 * cmI, desk, 1 * cmI);
    M.box(-W / 2 + 5 * cmI, -W / 2 + 70 * cmI, -D / 2 + 70 * cmI, D / 2 - 15 * cmI, 72 * cmI, 75 * cmI, desk, 1 * cmI);
    M.box(W / 2 - 50 * cmI, W / 2 - 8 * cmI, -D / 2 + 8 * cmI, -D / 2 + 60 * cmI, 0, 68 * cmI, M.mat("metal", "#5d6166"), 1 * cmI);
    M.box(-20 * cmI, 30 * cmI, -D / 2 + 18 * cmI, -D / 2 + 20 * cmI, 90 * cmI, 120 * cmI, M.mat("plastic", "#1f2226"));
    M.box(-18 * cmI, 28 * cmI, -D / 2 + 20 * cmI, -D / 2 + 20.3 * cmI, 92 * cmI, 118 * cmI, M.mat("screen", "#2f6fae"));
    M.box(0, 10 * cmI, -D / 2 + 10 * cmI, -D / 2 + 22 * cmI, 75 * cmI, 90 * cmI, M.mat("plastic", "#1f2226"));
    M.box(-15 * cmI, 25 * cmI, -D / 2 + 35 * cmI, -D / 2 + 50 * cmI, 75 * cmI, 77 * cmI, M.mat("plastic", "#2a2c2e"));
    var chair = MODELS.i_officechair;
    if (chair) { M.push().move(10 * cmI, 20 * cmI, 0).turn(180); chair(M, 60 * cmI, 60 * cmI, 110 * cmI, { main: "#2a2c2e", frame: "#3a3d40" }, null, {}); M.pop(); }
  });
  // a boardroom table: long, its chairs down both sides and one at each end
  itAdd("ic_work", "i_conftable", 400, 140, function (w, h) { var d = ""; for (var x = 40; x < w - 20; x += 70) { d += itR(x - 18, 0, 36, 18, 4) + " " + itR(x - 18, h - 18, 36, 18, 4) + " "; } return ["o " + itR(20, 25, w - 40, h - 50, 20), "o " + d.trim()]; },
        { h: 0.75 }, function (M, W, D, H, C) {
    C = mPick(C, "#5d3c25", "#2a2c2e");
    var top = M.mat("wood", C.main);
    M.box(-W / 2 + 20 * cmI, W / 2 - 20 * cmI, -D / 2 + 25 * cmI, D / 2 - 25 * cmI, H - 4 * cmI, H, top, 3 * cmI);
    [-1, 1].forEach(function (s) { M.box(s * (W / 4) - 30 * cmI, s * (W / 4) + 30 * cmI, -20 * cmI, 20 * cmI, 0, H - 4 * cmI, M.mat("metal", "#5d6166")); });
    var chair = MODELS.i_chair || MODELS.i_officechair;            // (twelve office chairs made the table a heavy model)
    for (var x = -W / 2 + 40 * cmI; x < W / 2 - 20 * cmI; x += 70 * cmI) {
      [-1, 1].forEach(function (s) { M.push().move(x, s * (D / 2 - 12 * cmI), 0).turn(s < 0 ? 0 : 180); chair(M, 55 * cmI, 55 * cmI, 105 * cmI, { main: C.frame, frame: "#3a3d40" }, null, {}); M.pop(); });
    }
    [-1, 1].forEach(function (s) { M.push().move(s * (W / 2 - 10 * cmI), 0, 0).turn(s < 0 ? 270 : 90); chair(M, 55 * cmI, 55 * cmI, 105 * cmI, { main: C.frame, frame: "#3a3d40" }, null, {}); M.pop(); });
    M.box(-6 * cmI, 6 * cmI, -6 * cmI, 6 * cmI, H, H + 3 * cmI, M.mat("plastic", "#1f2226"), 2 * cmI);
  });
  // a photocopier: its body, the paper drawers, the glass lid and its control panel, the output tray
  itAdd("ic_work", "i_copier", 70, 65, ["o " + itR(0, 0, 70, 65, 3), "k " + itR(48, 45, 18, 12, 2), "t " + itRows(4, 20, 62, 30, 10, true)], { h: 1.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#e8e8e4", "#3a3d40");
    var body = M.mat("plastic", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 12 * cmI, body, 2 * cmI);
    for (var i = 0; i < 4; i++) { M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2, D / 2 + 1 * cmI, 10 * cmI + i * 15 * cmI, 22 * cmI + i * 15 * cmI, M.mat("plastic", mShade(C.main, -0.05))); }
    M.box(-W / 2, W / 2 - 15 * cmI, -D / 2, D / 2, H - 12 * cmI, H - 4 * cmI, M.mat("plastic", C.frame), 1.5 * cmI);
    M.box(-W / 2 + 2 * cmI, W / 2 - 17 * cmI, -D / 2 + 2 * cmI, D / 2 - 2 * cmI, H - 4 * cmI, H, body, 1 * cmI);
    M.push().move(W / 2 - 10 * cmI, D / 2 - 10 * cmI, H - 12 * cmI).tiltX(-25);
    M.box(-9 * cmI, 9 * cmI, -6 * cmI, 6 * cmI, 0, 3 * cmI, M.mat("plastic", "#2a2c2e"), 1 * cmI);
    M.box(-7 * cmI, 7 * cmI, -4 * cmI, 4 * cmI, 3 * cmI, 3.2 * cmI, M.mat("screen", "#2f6fae"));
    M.pop();
    M.box(W / 2, W / 2 + 18 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 70 * cmI, 72 * cmI, M.mat("plastic", "#cfd4d8"));
    M.box(W / 2 + 2 * cmI, W / 2 + 16 * cmI, -D / 2 + 14 * cmI, D / 2 - 14 * cmI, 72 * cmI, 74 * cmI, M.mat("linen", "#f8f8f6"));
  });
  // a paper shredder: its bin, the cutting head, the slot
  itAdd("ic_work", "i_shredder", 50, 35, ["o " + itR(0, 0, 50, 35, 3), "k " + itR(8, 14, 34, 4, 1)], { h: 0.7 }, function (M, W, D, H, C) {
    C = mPick(C, "#2a2c2e", "#9aa0a5");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 14 * cmI, M.mat("plastic", C.main), 2 * cmI);
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2, D / 2 + 0.5 * cmI, 10 * cmI, H - 24 * cmI, M.mat("glass", "#3a3d40"));
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 14 * cmI, H, M.mat("plastic", C.frame), 2 * cmI);
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, -1 * cmI, 1 * cmI, H - 0.5 * cmI, H + 0.1 * cmI, M.mat("plastic", "#151515"));
    M.box(W / 2 - 10 * cmI, W / 2 - 6 * cmI, D / 2 - 6 * cmI, D / 2 - 2 * cmI, H, H + 0.5 * cmI, M.mat("glow", "#57c46f"));
  });
  // a water cooler: the blue bottle upside down on the white cabinet, its taps, the cups
  itAdd("ic_work", "i_watercooler", 35, 35, ["o " + itR(0, 0, 35, 35, 4), "t " + itC(17.5, 17.5, 12)], { h: 1.5 }, function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 100 * cmI, M.mat("plastic", "#eceeef"), 3 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, D / 2, D / 2 + 0.5 * cmI, 70 * cmI, 92 * cmI, M.mat("plastic", "#cfd4d8"));
    [-1, 1].forEach(function (s) { M.box(s * 5 * cmI - 2 * cmI, s * 5 * cmI + 2 * cmI, D / 2, D / 2 + 4 * cmI, 84 * cmI, 88 * cmI, M.mat("plastic", s < 0 ? "#2f6fae" : "#c43c3a")); });
    M.box(-8 * cmI, 8 * cmI, D / 2 - 6 * cmI, D / 2 + 2 * cmI, 68 * cmI, 70 * cmI, M.mat("plastic", "#9aa0a5"));
    M.lathe(0, 0, [[3 * cmI, 100 * cmI], [3 * cmI, 104 * cmI], [12 * cmI, 110 * cmI], [13 * cmI, 128 * cmI], [12 * cmI, H - 2 * cmI], [0.1, H]], M.mat("glass", "#8fc4e8"), { seg: 18 });
    M.cyl(W / 2 + 4 * cmI, 0, 60 * cmI, 90 * cmI, 3.5 * cmI, M.mat("plastic", "#f4f4f1"), { seg: 10 });
  });
  // a safe: heavy steel, its dial, the handle, a hinge down one side
  itAdd("ic_work", "i_safe", 70, 60, ["o " + itR(0, 0, 70, 60, 3), "k " + itC(35, 55, 6)], { h: 1.3 }, function (M, W, D, H, C) {
    C = mPick(C, "#3a3d40", "#c9a24a");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("metal", C.main), 3 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, D / 2, D / 2 + 2 * cmI, 6 * cmI, H - 6 * cmI, M.mat("metal", mShade(C.main, 0.08)), 1 * cmI);
    M.push().move(0, D / 2 + 2 * cmI, H * 0.6).tiltX(-90);
    M.cyl(0, 0, 0, 3 * cmI, 7 * cmI, M.mat("brass", C.frame), { seg: 20 });
    M.cyl(0, 0, 3 * cmI, 4 * cmI, 2 * cmI, M.mat("brass", C.frame), { seg: 10 });
    M.pop();
    M.box(12 * cmI, 26 * cmI, D / 2 + 2 * cmI, D / 2 + 6 * cmI, H * 0.6 - 2 * cmI, H * 0.6 + 2 * cmI, M.mat("chrome", "#c9ced2"));
    [0.25, 0.75].forEach(function (k) { M.cyl(-W / 2 + 4 * cmI, D / 2 + 1 * cmI, H * k - 6 * cmI, H * k + 6 * cmI, 2 * cmI, M.mat("metal", "#2a2c2e"), { seg: 8 }); });
  });
  // a reception desk: a long curve, its raised counter for visitors, the screens behind it, the name lit along its front
  itAdd("ic_work", "i_frontdesk", 300, 120, ["o M0 30 Q150 -10 300 30 L300 80 Q150 40 0 80 Z", "t M20 55 Q150 25 280 55"], { h: 1.1 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#1f5fa8");
    var body = M.mat("lacquer", C.main), top = M.mat("stone", "#e8e4dc"), seg = 10;
    for (var i = 0; i < seg; i++) {
      var a0 = -W / 2 + i * W / seg, a1 = a0 + W / seg, c0 = Math.cos((a0 / W) * Math.PI) * 30 * cmI, c1 = Math.cos((a1 / W) * Math.PI) * 30 * cmI;
      var y = D / 2 - 20 * cmI - (c0 + c1) / 2;
      M.box(a0, a1 + 0.5 * cmI, y - 18 * cmI, y + 6 * cmI, 0, H, body);
      M.box(a0, a1 + 0.5 * cmI, y - 20 * cmI, y + 10 * cmI, H, H + 3 * cmI, top);
      M.box(a0, a1 + 0.5 * cmI, y - 70 * cmI, y - 18 * cmI, 72 * cmI, 75 * cmI, M.mat("wood", "#8a6a4c"));
      M.box(a0 + 1 * cmI, a1 - 0.5 * cmI, y + 6 * cmI, y + 6.4 * cmI, 70 * cmI, 80 * cmI, M.mat("glow", C.frame));
    }
    [-1, 1].forEach(function (s) {
      M.box(s * 40 * cmI - 25 * cmI, s * 40 * cmI + 25 * cmI, -10 * cmI, -8 * cmI, 90 * cmI, 120 * cmI, M.mat("plastic", "#1f2226"));
      M.box(s * 40 * cmI - 23 * cmI, s * 40 * cmI + 23 * cmI, -8 * cmI, -7.7 * cmI, 92 * cmI, 118 * cmI, M.mat("screen", "#2f6fae"));
    });
  });
  // a plotter: the long printer on its stand, the roll of paper, the drawing coming out of it
  itAdd("ic_work", "i_plotter", 140, 70, ["o " + itR(0, 0, 140, 30, 4), "t " + itR(10, 30, 120, 40, 1)], { h: 1.1 }, function (M, W, D, H, C) {
    C = mPick(C, "#2a2c2e", "#e8e8e4");
    var stand = M.mat("metal", "#5d6166");
    [-1, 1].forEach(function (s) { M.box(s * (W / 2 - 10 * cmI) - 2 * cmI, s * (W / 2 - 10 * cmI) + 2 * cmI, -D / 2 + 5 * cmI, -D / 2 + 25 * cmI, 0, 80 * cmI, stand); M.box(s * (W / 2 - 10 * cmI) - 2 * cmI, s * (W / 2 - 10 * cmI) + 2 * cmI, -D / 2, D / 2 - 10 * cmI, 0, 4 * cmI, stand); });
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 30 * cmI, 80 * cmI, H, M.mat("plastic", C.main), 4 * cmI);
    M.box(W / 2 - 25 * cmI, W / 2 - 6 * cmI, -D / 2 + 31 * cmI, -D / 2 + 32 * cmI, H - 18 * cmI, H - 6 * cmI, M.mat("screen", "#2f6fae"));
    M.push().move(0, -D / 2 + 30 * cmI, 85 * cmI).tiltX(55);
    M.box(-W / 2 + 12 * cmI, W / 2 - 12 * cmI, 0, 0.3 * cmI, 0, 45 * cmI, M.mat("linen", C.frame));
    M.box(-W / 2 + 25 * cmI, -10 * cmI, 0.3 * cmI, 0.5 * cmI, 10 * cmI, 35 * cmI, M.mat("plastic", "#2f6fae"));
    M.pop();
  });
  // a mail sorter: pigeonholes in rows, letters in many of them, a counter under
  itAdd("ic_work", "i_mailsorter", 120, 40, function (w, h) { return ["o " + itR(0, 0, w, h, 1), "t " + itRows(0, 0, w, h, 15, false)]; }, { h: 1.6 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#8a6a4c", "#f4f2ec");
    var wood = M.mat("wood", C.main), cols = Math.max(3, Math.round(W / (15 * cmI))), rows = 6, rnd = mRand((n && n.id) || 211);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 80 * cmI, wood, 1 * cmI);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 1 * cmI, 80 * cmI, H, wood);
    for (var i = 0; i <= cols; i++) { var x = -W / 2 + i * W / cols; M.box(x - 0.6 * cmI, x + 0.6 * cmI, -D / 2, 0, 80 * cmI, H, wood); }
    for (var j = 0; j <= rows; j++) { var z = 80 * cmI + j * (H - 80 * cmI) / rows; M.box(-W / 2, W / 2, -D / 2, 0, z - 0.6 * cmI, z + 0.6 * cmI, wood); }
    for (var a = 0; a < cols; a++) { for (var b = 0; b < rows; b++) { if (rnd() < 0.5) { var cx = -W / 2 + (a + 0.5) * W / cols, z0 = 80 * cmI + b * (H - 80 * cmI) / rows; M.box(cx - 5 * cmI, cx + 5 * cmI, -D / 2 + 2 * cmI, -4 * cmI, z0 + 1 * cmI, z0 + (5 + rnd() * 5) * cmI, M.mat("linen", rnd() < 0.3 ? "#e8d7b0" : C.frame)); } } }
  });
  // a flip chart on its easel: three legs, the pad of paper, a marker drawing on it
  itAdd("ic_work", "i_flipchart", 70, 60, ["o M10 55 L35 5 L60 55", "k " + itR(10, 20, 50, 6, 1)], { h: 1.9 }, function (M, W, D, H) {
    var frame = M.mat("metal", "#9aa0a5");
    [-1, 1].forEach(function (s) { M.tube([s * 28 * cmI, D / 2 - 5 * cmI, 0], [s * 26 * cmI, 0, H], 1.2 * cmI, frame, 6); });
    M.tube([0, -D / 2 + 5 * cmI, 0], [0, -2 * cmI, H - 20 * cmI], 1.2 * cmI, frame, 6);
    M.push().move(0, 2 * cmI, 80 * cmI).tiltX(-8);
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, 0, 2 * cmI, 0, 95 * cmI, M.mat("plastic", "#e8e8e4"));
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, 2 * cmI, 2.6 * cmI, 2 * cmI, 92 * cmI, M.mat("linen", "#fbfbf9"));
    [["#2f6fae", 70], ["#c43c3a", 55], ["#3f9a5a", 40]].forEach(function (c) { M.box(-W / 2 + 10 * cmI, (c[1] - 30) * cmI, 2.6 * cmI, 2.8 * cmI, c[1] * cmI, (c[1] + 2) * cmI, M.mat("plastic", c[0])); });
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, 0, 6 * cmI, -2 * cmI, 0, M.mat("plastic", "#9aa0a5"));
    M.pop();
  });
  // an office screen: a fabric panel on its feet
  itAdd("ic_work", "i_partition", 160, 10, ["o " + itR(0, 0, 160, 10, 3)], { h: 1.5 }, function (M, W, D, H, C) {
    C = mPick(C, "#7f8794", "#9aa0a5");
    M.box(-W / 2, W / 2, -3 * cmI, 3 * cmI, 6 * cmI, H, M.mat("fabric", C.main), 2 * cmI);
    M.box(-W / 2, W / 2, -3.2 * cmI, 3.2 * cmI, H - 2 * cmI, H, M.mat("metal", C.frame));
    [-1, 1].forEach(function (s) { M.box(s * (W / 2 - 15 * cmI) - 3 * cmI, s * (W / 2 - 15 * cmI) + 3 * cmI, -D / 2 - 15 * cmI, D / 2 + 15 * cmI, 0, 6 * cmI, M.mat("metal", C.frame), 1 * cmI); });
  });
  // an umbrella stand: a steel tube, two umbrellas in it
  itAdd("ic_work", "i_umbrellastand", 30, 30, ["o " + itC(15, 15, 13), "k " + itC(10, 12, 3) + " " + itC(19, 18, 3)], { h: 0.6 }, function (M, W, D, H) {
    M.cyl(0, 0, 0, 50 * cmI, 12 * cmI, M.mat("chrome", "#9aa0a5"), { seg: 18 });
    [["#1f2226", -4, -3, 8], ["#c43c3a", 4, 3, -6]].forEach(function (u) {
      M.push().move(u[1] * cmI, u[2] * cmI, 10 * cmI).tiltY(u[3]);
      M.cyl(0, 0, 0, 72 * cmI, 3.4 * cmI, M.mat("fabric", u[0]), { seg: 8, r1: 1.2 * cmI });
      M.tube([0, 0, 72 * cmI], [0, 3 * cmI, 84 * cmI], 0.8 * cmI, M.mat("wood", "#5d3c25"), 6);
      M.pop();
    });
  });

  // ===================================================================== more for the home ==
  // a futon: its slatted wooden frame, the thick mattress folded into a sofa
  itAdd("ic_living", "i_futon", 200, 90, ["o " + itR(0, 0, 200, 90, 6), "t M10 28 H190", "t " + itRows(0, 30, 200, 60, 40, false)], { h: 0.85 }, function (M, W, D, H, C) {
    C = mPick(C, "#3f5a6a", "#b48a5a");
    var wood = M.mat("wood", C.frame), pad = M.mat("fabric", C.main);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 5 * cmI : 0), s * W / 2 + (s < 0 ? 5 * cmI : 0), -D / 2, D / 2, 0, 60 * cmI, wood, 1.5 * cmI); });
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, -D / 2, D / 2, 18 * cmI, 22 * cmI, wood);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -D / 2 + 22 * cmI, D / 2 - 2 * cmI, 22 * cmI, 40 * cmI, pad, 6 * cmI);
    M.push().move(0, -D / 2 + 20 * cmI, 22 * cmI).tiltX(15);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -18 * cmI, 0, 0, 62 * cmI, pad, 6 * cmI);
    M.pop();
  });
  // a pouf: round, knitted, its top buttoned in
  itAdd("ic_living", "i_pouf", 55, 55, ["o " + itC(27.5, 27.5, 26), "t " + itC(27.5, 27.5, 6)], { h: 0.42 }, function (M, W, D, H, C) {
    C = mPick(C, "#c9a273");
    var R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R - 6 * cmI, 0], [R, 8 * cmI], [R + 1 * cmI, H * 0.5], [R, H - 8 * cmI], [R - 8 * cmI, H - 1 * cmI], [0.1, H]], M.mat("wicker", C.main), { seg: 20 });
    M.cyl(0, 0, H - 1.5 * cmI, H + 0.5 * cmI, 3 * cmI, M.mat("fabric", mShade(C.main, -0.2)), { seg: 10 });
  });
  // a ladder shelf: leaning, its shelves narrowing to the top, books and plants on them
  itAdd("ic_living", "i_laddershelf", 70, 40, ["o M5 38 L15 2 H55 L65 38 Z", "t M8 26 H62 M11 14 H59"], { h: 1.8 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#8a6a4c");
    var wood = M.mat("wood", C.main), rnd = mRand((n && n.id) || 221);
    [-1, 1].forEach(function (s) { M.tube([s * (W / 2 - 3 * cmI), D / 2 - 3 * cmI, 0], [s * (W / 2 - 3 * cmI), -D / 2 + 3 * cmI, H], 2 * cmI, wood, 4); });
    for (var i = 0; i < 4; i++) {
      var t = (i + 0.4) / 4.2, z = t * H, y1 = D / 2 - 3 * cmI - t * (D - 6 * cmI), deep = (1 - t) * (D - 8 * cmI) + 12 * cmI;
      M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, y1 - deep, y1, z - 1.5 * cmI, z, wood);
      for (var x = -W / 2 + 8 * cmI; x < W / 2 - 14 * cmI; x += 4 * cmI) { if (rnd() < 0.65) { M.box(x, x + 3 * cmI, y1 - deep + 2 * cmI, y1 - 3 * cmI, z, z + (14 + rnd() * 8) * cmI, M.mat("fabric", IT_PACK[Math.floor(rnd() * IT_PACK.length)])); } else { x += 2 * cmI; } }
    }
    // (a plant in a pot on the second shelf)
    var pz = (1.4 / 4.2) * H, py = D / 2 - 3 * cmI - (1.4 / 4.2) * (D - 6 * cmI) - 8 * cmI;
    M.push().move(W / 2 - 12 * cmI, py, pz);
    var soil = mPot(M, 0, 0, 6 * cmI, 11 * cmI, M.mat("ceramic", "#e8e4dc"));
    mLeaves(M, 0, 0, soil + 6 * cmI, 9 * cmI, "#4f7d3a", rnd, 3);
    M.pop();
  });
  // a curio cabinet: glass all round, mirrored back, lit glass shelves of china
  itAdd("ic_living", "i_curio", 80, 40, ["o " + itR(0, 0, 80, 40, 2), "t " + itRows(4, 4, 72, 32, 18, false)], { h: 1.8 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#3b2416", "#f4f2ec");
    var wood = M.mat("lacquer", C.main), rnd = mRand((n && n.id) || 223);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 12 * cmI, wood, 1 * cmI);
    M.box(-W / 2 - 1 * cmI, W / 2 + 1 * cmI, -D / 2 - 1 * cmI, D / 2 + 1 * cmI, H - 8 * cmI, H, wood, 2 * cmI);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.box(s[0] * W / 2 - 1.5 * cmI, s[0] * W / 2 + 1.5 * cmI, s[1] * D / 2 - 1.5 * cmI, s[1] * D / 2 + 1.5 * cmI, 12 * cmI, H - 8 * cmI, wood); });
    M.box(-W / 2 + 1 * cmI, W / 2 - 1 * cmI, -D / 2 + 1 * cmI, -D / 2 + 1.5 * cmI, 12 * cmI, H - 8 * cmI, M.mat("chrome", "#dfe6ea"));
    itGlassBox(M, -W / 2 + 1 * cmI, W / 2 - 1 * cmI, -D / 2 + 1 * cmI, D / 2 - 1 * cmI, 12 * cmI, H - 8 * cmI);
    for (var z = 12 * cmI; z < H - 30 * cmI; z += 38 * cmI) {
      M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 2 * cmI, D / 2 - 2 * cmI, z, z + 0.8 * cmI, M.mat("glass", "#e6f0f3"));
      for (var x = -W / 2 + 10 * cmI; x < W / 2 - 8 * cmI; x += 16 * cmI) { M.lathe(x, 0, [[4 * cmI, z + 1 * cmI], [6 * cmI, z + 6 * cmI], [3 * cmI, z + (12 + rnd() * 6) * cmI]], M.mat("ceramic", rnd() < 0.5 ? C.frame : "#7fa6c9"), { seg: 12, top: true }); }
    }
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2 + 4 * cmI, D / 2 - 4 * cmI, H - 8.5 * cmI, H - 8 * cmI, M.mat("glow", "#fff4d8"));
  });
  // a grandfather clock: the tall case, its face and hands, the pendulum behind glass, the hood
  itAdd("ic_living", "i_grandclock", 50, 30, ["o " + itR(0, 0, 50, 30, 2), "k " + itC(25, 24, 4)], { h: 2.1 }, function (M, W, D, H, C) {
    C = mPick(C, "#5d3c25", "#c9a24a");
    var wood = M.mat("wood", C.main), brass = M.mat("brass", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 30 * cmI, wood, 1 * cmI);
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -D / 2 + 3 * cmI, D / 2 - 3 * cmI, 30 * cmI, H - 60 * cmI, wood);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, D / 2 - 3 * cmI, D / 2 - 2 * cmI, 40 * cmI, H - 70 * cmI, M.mat("glass", "#cfe3ea"));
    M.cyl(0, D / 2 - 6 * cmI, 50 * cmI, H - 70 * cmI, 0.6 * cmI, brass, { seg: 6 });
    M.push().move(0, D / 2 - 6 * cmI, 52 * cmI).tiltX(90); M.cyl(0, 0, -1 * cmI, 1 * cmI, 8 * cmI, brass, { seg: 18 }); M.pop();
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 60 * cmI, H - 10 * cmI, wood, 1 * cmI);
    M.push().move(0, D / 2, H - 35 * cmI).tiltX(90);
    M.cyl(0, 0, 0, 1 * cmI, 17 * cmI, M.mat("ceramic", "#f4f0e4"), { seg: 24 });
    M.box(-0.6 * cmI, 0.6 * cmI, 0, 12 * cmI, 1 * cmI, 1.4 * cmI, M.mat("metal", "#1f2226"));
    M.box(0, 9 * cmI, -0.6 * cmI, 0.6 * cmI, 1 * cmI, 1.4 * cmI, M.mat("metal", "#1f2226"));
    M.pop();
    M.prism([[-W / 2 - 2 * cmI, -D / 2 - 2 * cmI], [W / 2 + 2 * cmI, -D / 2 - 2 * cmI], [W / 2 + 2 * cmI, D / 2 + 2 * cmI], [-W / 2 - 2 * cmI, D / 2 + 2 * cmI]], H - 10 * cmI, H - 6 * cmI, wood);
    M.box(-6 * cmI, 6 * cmI, -3 * cmI, 3 * cmI, H - 6 * cmI, H, brass);
  });
  // a canopy bed: four tall posts, the frame across their tops, curtains tied back at each, the bed in it
  itAdd("ic_bedroom", "i_canopybed", 180, 215, ["o " + itR(0, 0, 180, 215, 4), "k " + itC(6, 6, 5) + " " + itC(174, 6, 5) + " " + itC(6, 209, 5) + " " + itC(174, 209, 5), "t " + itR(12, 12, 156, 40, 6)], { h: 2.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#5d3c25");
    var wood = M.mat("wood", C.frame), cloth = M.mat("linen", C.main);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.cyl(s[0] * (W / 2 - 5 * cmI), s[1] * (D / 2 - 5 * cmI), 0, H, 4 * cmI, wood, { seg: 10 }); });
    [-1, 1].forEach(function (s) {
      M.box(-W / 2, W / 2, s * (D / 2 - 5 * cmI) - 2.5 * cmI, s * (D / 2 - 5 * cmI) + 2.5 * cmI, H - 8 * cmI, H - 2 * cmI, wood);
      M.box(s * (W / 2 - 5 * cmI) - 2.5 * cmI, s * (W / 2 - 5 * cmI) + 2.5 * cmI, -D / 2, D / 2, H - 8 * cmI, H - 2 * cmI, wood);
    });
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, -D / 2 + 5 * cmI, D / 2 - 5 * cmI, H - 3 * cmI, H - 2 * cmI, M.mat("shade", "#f4f2ec"));
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
      var x = s[0] * (W / 2 - 9 * cmI), y = s[1] * (D / 2 - 9 * cmI);
      M.lathe(x, y, [[4 * cmI, 60 * cmI], [12 * cmI, 110 * cmI], [6 * cmI, 135 * cmI], [12 * cmI, H - 10 * cmI]], cloth, { seg: 10 });
    });
    M.box(-W / 2 + 8 * cmI, W / 2 - 8 * cmI, -D / 2 + 8 * cmI, D / 2 - 8 * cmI, 20 * cmI, 35 * cmI, wood, 2 * cmI);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 35 * cmI, 58 * cmI, M.mat("linen", "#f8f8f6"), 5 * cmI);
    [-1, 1].forEach(function (s) { M.box(s * 38 * cmI - 30 * cmI, s * 38 * cmI + 30 * cmI, -D / 2 + 14 * cmI, -D / 2 + 50 * cmI, 58 * cmI, 70 * cmI, M.mat("linen", "#f4f2ec"), 6 * cmI); });
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, 0, D / 2 - 10 * cmI, 58 * cmI, 61 * cmI, cloth, 2 * cmI);
  });
  // a wall bed folded up into its cabinet: doors closed over it, shelves either side
  itAdd("ic_bedroom", "i_murphybed", 170, 45, ["o " + itR(0, 0, 170, 45, 2), "t M30 0 V45 M140 0 V45", "t- M30 45 V200 M140 45 V200"], { h: 2.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#8a6a4c");
    var body = M.mat("lacquer", C.main), wood = M.mat("wood", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, body, 1 * cmI);
    M.box(-W / 2 + 30 * cmI, W / 2 - 30 * cmI, D / 2, D / 2 + 2 * cmI, 4 * cmI, H - 4 * cmI, wood, 1 * cmI);
    M.box(-W / 2 + 30 * cmI, W / 2 - 30 * cmI, D / 2 + 2 * cmI, D / 2 + 4 * cmI, H * 0.55, H * 0.55 + 3 * cmI, M.mat("chrome", "#c9ced2"));
    [-1, 1].forEach(function (s) { for (var z = 40 * cmI; z < H - 20 * cmI; z += 45 * cmI) { M.box(s * (W / 2 - 15 * cmI) - 13 * cmI, s * (W / 2 - 15 * cmI) + 13 * cmI, -D / 2 + 2 * cmI, D / 2, z, z + 2 * cmI, wood); } });
  });
  // a bassinet: a basket on a stand, its hood, the blanket in it
  itAdd("ic_bedroom", "i_bassinet", 50, 90, ["o " + itR(0, 0, 50, 90, 20), "t M5 25 Q25 10 45 25"], { h: 0.9 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#c9a273");
    var basket = M.mat("wicker", C.frame), cloth = M.mat("linen", C.main);
    [-1, 1].forEach(function (s) { M.tube([s * (W / 2 - 4 * cmI), -D / 2 + 10 * cmI, 0], [s * (W / 2 - 6 * cmI), D / 2 - 10 * cmI, 55 * cmI], 1.5 * cmI, M.mat("wood", "#c9a273"), 6); M.tube([s * (W / 2 - 4 * cmI), D / 2 - 10 * cmI, 0], [s * (W / 2 - 6 * cmI), -D / 2 + 10 * cmI, 55 * cmI], 1.5 * cmI, M.mat("wood", "#c9a273"), 6); });
    M.lathe(0, 0, [[20 * cmI, 55 * cmI], [24 * cmI, 70 * cmI], [25 * cmI, 78 * cmI]], basket, { seg: 20, ry: 1.75, top: false });
    M.disc(0, 0, 56 * cmI, 20 * cmI, 35 * cmI, cloth, 20);
    M.lathe(0, -D / 2 + 25 * cmI, [[24 * cmI, 70 * cmI], [22 * cmI, 85 * cmI], [12 * cmI, H]], cloth, { seg: 14, from: 180, to: 360, top: false, ry: 1.0 });
    M.box(-18 * cmI, 18 * cmI, -5 * cmI, 30 * cmI, 56 * cmI, 62 * cmI, M.mat("fabric", "#bcd3e6"), 4 * cmI);
  });
  // a changing table: its drawers, the padded top with its raised edge, baskets on the shelf
  itAdd("ic_bedroom", "i_changingtable", 90, 55, ["o " + itR(0, 0, 90, 55, 3), "t " + itR(8, 8, 74, 39, 6)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#f4f2ec", "#bcd3e6");
    var body = M.mat("lacquer", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 10 * cmI, body, 1 * cmI);
    for (var i = 0; i < 3; i++) { M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2, D / 2 + 1 * cmI, 6 * cmI + i * 27 * cmI, 30 * cmI + i * 27 * cmI, body, 1 * cmI); M.box(-8 * cmI, 8 * cmI, D / 2 + 1 * cmI, D / 2 + 2 * cmI, 16 * cmI + i * 27 * cmI, 18 * cmI + i * 27 * cmI, M.mat("wood", "#c9a273")); }
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2 + 2 * cmI, D / 2 - 2 * cmI, H - 10 * cmI, H - 4 * cmI, M.mat("fabric", C.frame), 3 * cmI);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 4 * cmI, H - 10 * cmI, H, body);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 4 * cmI : 0), s * W / 2 + (s < 0 ? 4 * cmI : 0), -D / 2, D / 2, H - 10 * cmI, H, body); });
  });
  // a rocking horse: on its curved rockers, painted, a mane and saddle
  itAdd("ic_bedroom", "i_rockinghorse", 90, 35, ["o M5 30 Q45 40 85 30", "o " + itR(20, 8, 50, 18, 6), "k " + itC(75, 12, 6)], { h: 0.75 }, function (M, W, D, H, C) {
    C = mPick(C, "#f4f2ec", "#c43c3a");
    var paint = M.mat("lacquer", C.main), wood = M.mat("wood", "#8a6a4c");
    [-1, 1].forEach(function (s) {
      var pts = [];
      for (var i = 0; i <= 8; i++) { var t = i / 8; pts.push([-W / 2 + t * W, s * 12 * cmI, 8 * cmI * Math.pow(2 * t - 1, 2)]); }
      for (var j = 0; j < 8; j++) { M.tube(pts[j], pts[j + 1], 2 * cmI, wood, 6); }
      [-1, 1].forEach(function (e) { M.tube([e * 25 * cmI, s * 12 * cmI, 3 * cmI], [e * 18 * cmI, s * 6 * cmI, 35 * cmI], 1.6 * cmI, paint, 6); });
    });
    M.ball(0, 0, 42 * cmI, 25 * cmI, 10 * cmI, 10 * cmI, paint, { seg: 10 });
    M.tube([20 * cmI, 0, 45 * cmI], [30 * cmI, 0, 65 * cmI], 6 * cmI, paint, 10);
    M.ball(34 * cmI, 0, 66 * cmI, 10 * cmI, 6 * cmI, 6 * cmI, paint, { seg: 8 });
    M.tube([18 * cmI, 0, 54 * cmI], [30 * cmI, 0, 72 * cmI], 2.4 * cmI, M.mat("fabric", "#5d3c25"), 6);
    M.box(-8 * cmI, 8 * cmI, -11 * cmI, 11 * cmI, 50 * cmI, 54 * cmI, M.mat("leather", C.frame), 2 * cmI);
    M.tube([-24 * cmI, 0, 46 * cmI], [-34 * cmI, 0, 30 * cmI], 2.5 * cmI, M.mat("fabric", "#5d3c25"), 6);
  });
  // a dollhouse: two storeys of rooms open at the back, a pitched roof, windows on its front
  itAdd("ic_bedroom", "i_dollhouse", 80, 45, ["o " + itR(0, 0, 80, 45, 1), "t M40 0 V45 M0 22 H80"], { h: 0.95 }, function (M, W, D, H, C) {
    C = mPick(C, "#f4e7d0", "#c43c3a");
    var wall = M.mat("wood", C.main), roof = M.mat("lacquer", C.frame), wh = H - 25 * cmI;
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 1.5 * cmI, 0, wh, wall);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 1.5 * cmI : 0), s * W / 2 + (s < 0 ? 1.5 * cmI : 0), -D / 2, D / 2, 0, wh, wall); });
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 1.5 * cmI, wall); M.box(-W / 2, W / 2, -D / 2, D / 2, wh / 2 - 0.75 * cmI, wh / 2 + 0.75 * cmI, wall);
    M.box(-0.75 * cmI, 0.75 * cmI, -D / 2, D / 2, 0, wh, wall);
    [[-1, 0.25], [1, 0.25], [-1, 0.75], [1, 0.75]].forEach(function (p) { M.box(p[0] * W / 4 - 6 * cmI, p[0] * W / 4 + 6 * cmI, -D / 2 - 0.2 * cmI, -D / 2, p[1] * wh - 5 * cmI, p[1] * wh + 5 * cmI, M.mat("glass", "#bcd3de")); });
    M.quad(roof, [-W / 2 - 3 * cmI, -D / 2 - 2 * cmI, wh], [W / 2 + 3 * cmI, -D / 2 - 2 * cmI, wh], [W / 2 + 3 * cmI, 0, H], [-W / 2 - 3 * cmI, 0, H]);
    M.quad(roof, [W / 2 + 3 * cmI, D / 2 + 2 * cmI, wh], [-W / 2 - 3 * cmI, D / 2 + 2 * cmI, wh], [-W / 2 - 3 * cmI, 0, H], [W / 2 + 3 * cmI, 0, H]);
    M.tri(wall, [-W / 2, -D / 2, wh], [-W / 2, D / 2, wh], [-W / 2, 0, H - 1 * cmI], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0]);
    M.tri(wall, [W / 2, D / 2, wh], [W / 2, -D / 2, wh], [W / 2, 0, H - 1 * cmI], [1, 0, 0], [1, 0, 0], [1, 0, 0]);
    M.box(-W / 4 - 8 * cmI, -W / 4 + 8 * cmI, -D / 2 + 4 * cmI, 2 * cmI, 1.5 * cmI, 6 * cmI, M.mat("fabric", "#2f6fae"), 1 * cmI);
    M.box(W / 4 - 6 * cmI, W / 4 + 6 * cmI, -D / 2 + 6 * cmI, 0, wh / 2 + 0.75 * cmI, wh / 2 + 5 * cmI, M.mat("fabric", "#e94e6b"), 1 * cmI);
  });
  // a play tent: a teepee of four poles, its canvas, the door flap tied open, a rug inside
  itAdd("ic_bedroom", "i_kidtent", 120, 120, ["o M60 5 L115 115 H5 Z", "t M60 5 V115", "k M45 115 L60 70 L75 115"], { h: 1.6 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#5d3c25");
    var cloth = M.mat("linen", C.main), pole = M.mat("wood", C.frame), R = Math.min(W, D) / 2 - 4 * cmI;
    M.lathe(0, 0, [[R, 0], [0.1, H - 12 * cmI]], cloth, { seg: 4, from: 45 + 30, to: 45 + 360 - 30, top: false });
    [45, 135, 225, 315].forEach(function (a) { var r = a * Math.PI / 180; M.tube([Math.cos(r) * R, Math.sin(r) * R, 0], [-Math.cos(r) * 10 * cmI, -Math.sin(r) * 10 * cmI, H], 1.4 * cmI, pole, 6); });
    M.disc(0, 0, 0.4 * cmI, R * 0.8, R * 0.8, M.mat("fabric", "#8fb3c9"), 16);
    M.ball(-10 * cmI, -10 * cmI, 10 * cmI, 14 * cmI, 12 * cmI, 10 * cmI, M.mat("fabric", "#f2c94c"), { seg: 8 });
  });
  // a knife block on the counter, its handles
  itAdd("ic_kitchen", "i_knifeblock", 20, 20, ["o " + itR(2, 4, 16, 12, 2), "k " + itC(7, 8, 1.5) + " " + itC(13, 8, 1.5) + " " + itC(10, 12, 1.5)], { top: 0.32 }, function (M, W, D, H) {
    M.push().tiltX(-15);
    M.box(-7 * cmI, 7 * cmI, -6 * cmI, 6 * cmI, 0, 22 * cmI, M.mat("wood", "#8a6a4c"), 1.5 * cmI);
    [[-3, -2], [0, 1], [3, -2], [-2, 3], [2, 3]].forEach(function (p) { M.box((p[0] - 1) * cmI, (p[0] + 1) * cmI, (p[1] - 1.5) * cmI, (p[1] + 1.5) * cmI, 22 * cmI, 32 * cmI, M.mat("plastic", "#1f2226"), 0.6 * cmI); });
    M.pop();
  });
  // a blender: its base, the jug and its lid
  itAdd("ic_kitchen", "i_blender", 20, 20, ["o " + itR(3, 3, 14, 14, 3), "t " + itC(10, 10, 5)], { top: 0.42 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a");
    M.box(-8 * cmI, 8 * cmI, -8 * cmI, 8 * cmI, 0, 12 * cmI, M.mat("lacquer", C.main), 3 * cmI);
    M.cyl(0, 6 * cmI, 7 * cmI, 9 * cmI, 1.5 * cmI, M.mat("plastic", "#e8e8e4"), { seg: 8 });
    M.lathe(0, 0, [[5 * cmI, 12 * cmI], [7 * cmI, 30 * cmI], [7.5 * cmI, 36 * cmI]], M.mat("glass", "#e6f3f7"), { seg: 14, top: false });
    M.cyl(0, 0, 36 * cmI, 39 * cmI, 7.6 * cmI, M.mat("plastic", "#1f2226"), { seg: 14 });
    M.box(7 * cmI, 9 * cmI, -2 * cmI, 2 * cmI, 16 * cmI, 32 * cmI, M.mat("plastic", "#1f2226"));
  });
  // a stand mixer: its head over the bowl, the beater, the base
  itAdd("ic_kitchen", "i_mixer", 35, 25, ["o " + itR(2, 2, 31, 21, 6), "t " + itC(14, 12, 7)], { top: 0.36 }, function (M, W, D, H, C) {
    C = mPick(C, "#7fb3c9", "#c9ced2");
    var body = M.mat("lacquer", C.main);
    M.box(-15 * cmI, 15 * cmI, -10 * cmI, 10 * cmI, 0, 4 * cmI, body, 3 * cmI);
    M.box(10 * cmI, 16 * cmI, -6 * cmI, 6 * cmI, 4 * cmI, 30 * cmI, body, 3 * cmI);
    M.box(-12 * cmI, 16 * cmI, -6 * cmI, 6 * cmI, 25 * cmI, 35 * cmI, body, 4 * cmI);
    M.lathe(-2 * cmI, 0, [[6 * cmI, 4 * cmI], [11 * cmI, 12 * cmI], [11.5 * cmI, 20 * cmI]], M.mat("chrome", C.frame), { seg: 16, top: false });
    M.cyl(-2 * cmI, 0, 10 * cmI, 25 * cmI, 1 * cmI, M.mat("chrome", "#e8e8ec"), { seg: 6 });
  });
  // a rice cooker: round, its lid, the steam vent, the panel
  itAdd("ic_kitchen", "i_ricecooker", 30, 30, ["o " + itC(15, 15, 13), "k " + itR(10, 24, 10, 4, 1)], { top: 0.27 }, function (M, W, D, H, C) {
    C = mPick(C, "#f4f2ec", "#2a2c2e");
    M.lathe(0, 0, [[11 * cmI, 0], [13 * cmI, 3 * cmI], [13.5 * cmI, 18 * cmI], [12 * cmI, 22 * cmI], [8 * cmI, 26 * cmI], [0.1, 27 * cmI]], M.mat("plastic", C.main), { seg: 20 });
    M.box(-5 * cmI, 5 * cmI, 12 * cmI, 13.6 * cmI, 6 * cmI, 12 * cmI, M.mat("plastic", C.frame));
    M.cyl(0, -4 * cmI, 25 * cmI, 28 * cmI, 1.5 * cmI, M.mat("plastic", "#9aa0a5"), { seg: 8 });
  });
  // an air fryer: its rounded body, the drawer with its handle, the dial
  itAdd("ic_kitchen", "i_airfryer", 35, 35, ["o " + itR(2, 2, 31, 31, 8), "k " + itR(12, 28, 11, 5, 2)], { top: 0.33 }, function (M, W, D, H, C) {
    C = mPick(C, "#2a2c2e", "#9aa0a5");
    M.box(-15 * cmI, 15 * cmI, -15 * cmI, 15 * cmI, 0, 33 * cmI, M.mat("plastic", C.main), 6 * cmI);
    M.box(-12 * cmI, 12 * cmI, 15 * cmI, 16 * cmI, 3 * cmI, 18 * cmI, M.mat("plastic", mShade(C.main, 0.1)), 2 * cmI);
    M.box(-5 * cmI, 5 * cmI, 16 * cmI, 22 * cmI, 9 * cmI, 13 * cmI, M.mat("plastic", C.frame), 1.5 * cmI);
    M.push().move(0, 15 * cmI, 26 * cmI).tiltX(-90); M.cyl(0, 0, 0, 1.5 * cmI, 3 * cmI, M.mat("chrome", "#c9ced2"), { seg: 12 }); M.pop();
  });
  // a bread bin: its rolltop, a loaf showing
  itAdd("ic_kitchen", "i_breadbox", 40, 25, ["o " + itR(1, 1, 38, 23, 4), "t M4 14 H36"], { top: 0.22 }, function (M, W, D, H, C) {
    C = mPick(C, "#8a6a4c", "#efe7d6");
    var wood = M.mat("wood", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 1.5 * cmI, wood);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 1.5 * cmI : 0), s * W / 2 + (s < 0 ? 1.5 * cmI : 0), -D / 2, D / 2, 0, 20 * cmI, wood); });
    M.push().move(0, -D / 2 + 9 * cmI, 1.5 * cmI).tiltY(90);
    M.lathe(0, 0, [[18 * cmI, -W / 2 + 1.5 * cmI], [18 * cmI, W / 2 - 1.5 * cmI]], wood, { seg: 12, from: 180, to: 270, top: false });
    M.pop();
    M.ball(0, D / 2 - 7 * cmI, 6 * cmI, 12 * cmI, 5 * cmI, 5 * cmI, M.mat("fabric", "#c98a4b"), { seg: 8 });
  });
  // a pot rack hung from the ceiling: its iron frame on chains, pans and pots on hooks
  itAdd("ic_kitchen", "i_potrack", 100, 40, ["o " + itR(0, 0, 100, 40, 6), "k " + itC(20, 20, 6) + " " + itC(45, 20, 7) + " " + itC(75, 20, 6)], { ceil: [1.0, 0.6] }, function (M, W, D, H, C) {
    C = mPick(C, "#2a2c2e", "#b4734a");
    var iron = M.mat("metal", C.main), copper = M.mat("brass", C.frame);
    M.lathe(0, 0, [[W / 2 - 2 * cmI, H - 6 * cmI], [W / 2 - 2 * cmI, H - 4 * cmI]], iron, { seg: 24, top: false, ry: (D - 4 * cmI) / (W - 4 * cmI) });
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.tube([s[0] * (W / 2 - 6 * cmI), s[1] * (D / 2 - 6 * cmI), H - 5 * cmI], [0, 0, H], 0.4 * cmI, iron, 4); });
    [[-30, 14, 9], [-8, -8, 11], [16, 10, 8], [34, -6, 10]].forEach(function (p, i) {
      var x = p[0] * cmI, y = p[1] * cmI, r = p[2] * cmI, top = H - 18 * cmI;
      M.tube([x, y, H - 5 * cmI], [x, y, top + r * 0.8], 0.4 * cmI, iron, 4);
      if (i % 2) { M.lathe(x, y, [[r * 0.8, top - 10 * cmI], [r, top]], copper, { seg: 14, top: false }); M.disc(x, y, top - 10 * cmI, r * 0.8, r * 0.8, copper, 14, true); }
      else { M.cyl(x, y, top - 2 * cmI, top, r, copper, { seg: 14 }); M.tube([x, y + r, top], [x, y + r + 14 * cmI, top + 2 * cmI], 1 * cmI, iron, 5); }
    });
  });
  // sorting bins: three bins in one cabinet, their colored lids
  itAdd("ic_kitchen", "i_trashsort", 60, 40, ["o " + itR(0, 0, 60, 40, 3), "t M20 0 V40 M40 0 V40"], { h: 0.8 }, function (M, W, D, H) {
    ["#3f9a5a", "#2f6fae", "#f2c94c"].forEach(function (c, i) {
      var x0 = -W / 2 + i * W / 3 + 0.5 * cmI, x1 = -W / 2 + (i + 1) * W / 3 - 0.5 * cmI;
      M.box(x0, x1, -D / 2, D / 2, 0, H - 4 * cmI, M.mat("plastic", "#5d6166"), 1.5 * cmI);
      M.box(x0, x1, -D / 2, D / 2, H - 4 * cmI, H, M.mat("plastic", c), 1.5 * cmI);
      M.box((x0 + x1) / 2 - 5 * cmI, (x0 + x1) / 2 + 5 * cmI, D / 2 - 3 * cmI, D / 2 + 1 * cmI, H - 3 * cmI, H - 1 * cmI, M.mat("plastic", "#2a2c2e"));
    });
  });
  // a spice rack on the wall: three shelves of little jars
  itAdd("ic_walls", "i_spicerack", 60, 12, ["o " + itR(0, 0, 60, 12, 1)], { wall: [1.4, 1.9] }, function (M, W, D, H, C, n) {
    C = mPick(C, "#8a6a4c");
    var wood = M.mat("wood", C.main), rnd = mRand((n && n.id) || 231);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 1 * cmI, 0, H, wood);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 1.5 * cmI : 0), s * W / 2 + (s < 0 ? 1.5 * cmI : 0), -D / 2, D / 2, 0, H, wood); });
    for (var k = 0; k < 3; k++) {
      var z = 2 * cmI + k * (H - 4 * cmI) / 3;
      M.box(-W / 2, W / 2, -D / 2, D / 2, z - 1.5 * cmI, z, wood);
      M.box(-W / 2, W / 2, D / 2 - 1 * cmI, D / 2, z, z + 3 * cmI, wood);
      for (var x = -W / 2 + 5 * cmI; x < W / 2 - 4 * cmI; x += 6 * cmI) {
        M.cyl(x, 0, z, z + 9 * cmI, 2.4 * cmI, M.mat("glass", "#e6f3f7"), { seg: 8 });
        M.cyl(x, 0, z + 0.5 * cmI, z + 7 * cmI, 2.1 * cmI, M.mat("fabric", ["#c8352e", "#f39a1e", "#7a4a2a", "#3e7d2e", "#f2d23c", "#5b2a1e"][Math.floor(rnd() * 6)]), { seg: 8 });
        M.cyl(x, 0, z + 9 * cmI, z + 11 * cmI, 2.5 * cmI, M.mat("metal", "#2a2c2e"), { seg: 8 });
      }
    }
  });
  // a tool wall: a pegboard, tools hung on it in their places
  itAdd("ic_walls", "i_toolwall", 180, 8, ["o " + itR(0, 0, 180, 8, 1)], { wall: [0.9, 2.0] }, function (M, W, D, H, C) {
    C = mPick(C, "#c9a273", "#2a2c2e");
    M.box(-W / 2, W / 2, -D / 2, D / 2 - 4 * cmI, 0, H, M.mat("wood", C.main));
    var tools = M.mat("metal", C.frame), red = M.mat("plastic", "#c43c3a");
    for (var i = 0; i < 6; i++) {
      var x = -W / 2 + 15 * cmI + i * 28 * cmI;
      M.tube([x, D / 2 - 4 * cmI, H - 20 * cmI], [x, D / 2 - 2 * cmI, H - 50 * cmI], 1 * cmI, tools, 6);
      M.box(x - 3 * cmI, x + 3 * cmI, D / 2 - 4 * cmI, D / 2 - 1 * cmI, H - 60 * cmI, H - 48 * cmI, i % 2 ? red : M.mat("plastic", "#f2c94c"), 1 * cmI);
    }
    M.box(-W / 2 + 10 * cmI, -W / 2 + 60 * cmI, D / 2 - 4 * cmI, D / 2 - 2 * cmI, 15 * cmI, 25 * cmI, tools);
    M.lathe(W / 2 - 30 * cmI, D / 2 - 4 * cmI, [[10 * cmI, 20 * cmI], [10 * cmI, 22 * cmI]], M.mat("rubber", "#2a2c2e"), { seg: 16, top: false, ry: 0.3 });
    M.box(W / 2 - 70 * cmI, W / 2 - 50 * cmI, D / 2 - 4 * cmI, D / 2, 40 * cmI, 65 * cmI, M.mat("plastic", "#2f6fae"), 2 * cmI);
  });
  // a bidet: vitreous china, its tap, beside the toilet
  itAdd("ic_bath", "i_bidet", 40, 60, ["o M5 5 H35 V40 Q35 58 20 58 Q5 58 5 40 Z", "t " + itC(20, 38, 10)], { h: 0.42 }, function (M, W, D, H) {
    var china = M.mat("ceramic", "#f8f8f6");
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -D / 2, -D / 2 + 15 * cmI, 0, H, china, 3 * cmI);
    M.lathe(0, 5 * cmI, [[12 * cmI, 0], [14 * cmI, H - 6 * cmI], [17 * cmI, H - 2 * cmI], [17 * cmI, H], [14 * cmI, H], [10 * cmI, H - 12 * cmI]], china, { seg: 20, ry: 1.4 });
    M.cyl(0, -D / 2 + 10 * cmI, H, H + 8 * cmI, 1.2 * cmI, M.mat("chrome", "#c9ced2"), { seg: 8 });
    M.tube([0, -D / 2 + 10 * cmI, H + 8 * cmI], [0, -D / 2 + 16 * cmI, H + 6 * cmI], 1 * cmI, M.mat("chrome", "#c9ced2"), 6);
  });
  // a urinal on the wall: its bowl, the flush pipe and valve
  itAdd("ic_bath", "i_urinal", 40, 35, ["o M5 0 H35 V20 Q35 34 20 34 Q5 34 5 20 Z", "t M10 12 Q20 28 30 12"], { wall: [0.4, 1.3] }, function (M, W, D, H) {
    var china = M.mat("ceramic", "#f8f8f6"), chrome = M.mat("chrome", "#c9ced2");
    M.lathe(0, -D / 2 + 2 * cmI, [[0.1, 0], [16 * cmI, 4 * cmI], [18 * cmI, 30 * cmI], [17 * cmI, 60 * cmI], [12 * cmI, 68 * cmI]], china, { seg: 18, from: 0, to: 180, ry: 1.6 });
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -D / 2, -D / 2 + 2 * cmI, 0, 68 * cmI, china, 2 * cmI);
    M.cyl(0, -D / 2 + 3 * cmI, 68 * cmI, H, 1.2 * cmI, chrome, { seg: 8 });
    M.cyl(0, -D / 2 + 4 * cmI, H - 18 * cmI, H - 10 * cmI, 3 * cmI, chrome, { seg: 12 });
  });
  // a hand dryer on the wall: its rounded body, the nozzle, the sensor light
  itAdd("ic_bath", "i_handdryer", 30, 20, ["o " + itR(2, 0, 26, 20, 6), "k " + itC(15, 16, 3)], { wall: [1.0, 1.35] }, function (M, W, D, H, C) {
    C = mPick(C, "#e8e8e4");
    M.box(-W / 2 + 2 * cmI, W / 2 - 2 * cmI, -D / 2, D / 2 - 4 * cmI, 6 * cmI, H, M.mat("lacquer", C.main), 6 * cmI);
    M.push().move(0, D / 2 - 10 * cmI, 6 * cmI).tiltX(-30);
    M.cyl(0, 0, -6 * cmI, 0, 3.5 * cmI, M.mat("chrome", "#c9ced2"), { seg: 14 });
    M.pop();
    M.box(-3 * cmI, 3 * cmI, D / 2 - 4 * cmI, D / 2 - 3.6 * cmI, H - 10 * cmI, H - 6 * cmI, M.mat("glow", "#57c46f"));
  });
  // a toilet stall: its partitions on legs, the door with its lock, the toilet inside
  itAdd("ic_bath", "i_toiletstall", 90, 150, ["o M0 150 V0 H90 V150", "t- M10 150 L80 150", "o " + itR(28, 8, 34, 50, 10)], { h: 1.9 }, function (M, W, D, H, C) {
    C = mPick(C, "#5d7f8f", "#c9ced2");
    var panel = M.mat("lacquer", C.main), metal = M.mat("chrome", C.frame);
    [-1, 1].forEach(function (s) {
      M.box(s * W / 2 - (s > 0 ? 3 * cmI : 0), s * W / 2 + (s < 0 ? 3 * cmI : 0), -D / 2, D / 2, 15 * cmI, H, panel, 0.6 * cmI);
      M.cyl(s * (W / 2 - 1.5 * cmI), D / 2 - 5 * cmI, 0, 15 * cmI, 1.5 * cmI, metal, { seg: 8 });
    });
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, D / 2 - 3 * cmI, D / 2, 15 * cmI, H, panel, 0.6 * cmI);
    M.box(-W / 2, W / 2, D / 2 - 3.5 * cmI, D / 2 + 0.5 * cmI, H - 3 * cmI, H, metal);
    M.box(W / 2 - 18 * cmI, W / 2 - 10 * cmI, D / 2, D / 2 + 1.5 * cmI, 95 * cmI, 102 * cmI, M.mat("plastic", "#2f9e5b"));
    var toilet = MODELS.i_toilet;
    if (toilet) { M.push().move(0, -D / 2 + 30 * cmI, 0); toilet(M, 38 * cmI, 60 * cmI, 78 * cmI, { main: "#f8f8f6", frame: "#f8f8f6" }, null, {}); M.pop(); }
  });
  // a sauna: a cedar cabin, its glass door, benches inside, the stove and its stones
  itAdd("ic_bath", "i_sauna", 200, 180, ["o " + itR(0, 0, 200, 180, 3), "t " + itR(8, 8, 184, 50, 2), "k " + itR(150, 120, 30, 30, 2), "t- M70 180 H130"], { h: 2.1 }, function (M, W, D, H, C) {
    C = mPick(C, "#c98a4b", "#5d3c25");
    var cedar = M.mat("wood", C.main);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 5 * cmI, 0, H, cedar);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - (s > 0 ? 5 * cmI : 0), s * W / 2 + (s < 0 ? 5 * cmI : 0), -D / 2, D / 2, 0, H, cedar); });
    M.box(-W / 2, -30 * cmI, D / 2 - 5 * cmI, D / 2, 0, H, cedar); M.box(30 * cmI, W / 2, D / 2 - 5 * cmI, D / 2, 0, H, cedar);
    M.box(-30 * cmI, 30 * cmI, D / 2 - 5 * cmI, D / 2, 195 * cmI, H, cedar);
    M.box(-30 * cmI, 30 * cmI, D / 2 - 3 * cmI, D / 2 - 2 * cmI, 2 * cmI, 195 * cmI, M.mat("glass", "#d6b98a"));
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 5 * cmI, H, cedar);
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, -D / 2 + 5 * cmI, -D / 2 + 55 * cmI, 90 * cmI, 95 * cmI, M.mat("wood", mShade(C.main, 0.1)));
    M.box(-W / 2 + 5 * cmI, W / 2 - 5 * cmI, -D / 2 + 55 * cmI, -D / 2 + 100 * cmI, 45 * cmI, 50 * cmI, M.mat("wood", mShade(C.main, 0.1)));
    M.box(W / 2 - 40 * cmI, W / 2 - 10 * cmI, D / 2 - 60 * cmI, D / 2 - 30 * cmI, 0, 60 * cmI, M.mat("metal", "#2a2c2e"), 2 * cmI);
    for (var i = 0; i < 10; i++) { M.ball(W / 2 - 34 * cmI + (i % 4) * 6 * cmI, D / 2 - 54 * cmI + Math.floor(i / 4) * 8 * cmI, 63 * cmI, 3.5 * cmI, 3 * cmI, 2.5 * cmI, M.mat("stone", "#6f6a64"), { seg: 5 }); }
    M.box(-W / 2 + 5 * cmI, -W / 2 + 6 * cmI, -10 * cmI, 10 * cmI, 150 * cmI, 165 * cmI, M.mat("glow", "#ffcf8f"));
  });
  // a bathroom scale on the floor: glass, its display
  itAdd("ic_bath", "i_scalebath", 30, 30, ["o " + itR(0, 0, 30, 30, 4), "k " + itR(10, 4, 10, 5, 1)], { h: 0.04, flat: true }, function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 2.5 * cmI, M.mat("glass", "#cfd8dc"), 1 * cmI);
    M.box(-W / 2 + 1 * cmI, W / 2 - 1 * cmI, -D / 2 + 1 * cmI, D / 2 - 1 * cmI, 0, 2 * cmI, M.mat("metal", "#2a2c2e"), 1 * cmI);
    M.box(-5 * cmI, 5 * cmI, D / 2 - 8 * cmI, D / 2 - 3 * cmI, 2.5 * cmI, 2.7 * cmI, M.mat("screen", "#2f6fae"));
  });

  // ===================================================================== the pictures made as things ==
  // The rest of the figures (40-things3d.js made the devices, the vehicles
  // and some others): in a home or on its lot each is now a thing of its
  // own size too.  A circuit's parts as the big parts of a desk kit; the
  // travel set's vehicles and buildings as big as they are; the space set
  // and the things set as what a home has of them -- a globe, a moon lamp,
  // a telescope, a model rocket, a padlock, a jukebox, a flag on its pole,
  // a hazard sign.  (Each stands on the floor or on what is under it -- no
  // more: they are still the pictures they were in a flowchart, a network,
  // a circuit or space.)
  var IT_FIG = {
    // circuit: [across, front to back] m, and how high on what is under it
    i_battery: [0.3, 0.18, 0.22], i_bulb: [0.12, 0.12, 0.22], i_switch_on: [0.16, 0.08, 0.08], i_resistor: [0.2, 0.06, 0.07], i_capacitor: [0.08, 0.08, 0.14],
    i_led: [0.08, 0.08, 0.12], i_motor: [0.22, 0.14, 0.16], i_buzzer: [0.08, 0.08, 0.06], i_socket: [0.22, 0.12, 0.07], i_cell: [0.06, 0.06, 0.1],
    i_diode: [0.16, 0.05, 0.05], i_fuse: [0.14, 0.05, 0.06], i_ammeter: [0.16, 0.12, 0.14], i_voltmeter: [0.16, 0.12, 0.14], i_dimmer: [0.14, 0.12, 0.1],
    // space and things, on a table or a shelf
    i_satellite: [0.5, 0.2, 0.35], i_planet: [0.4, 0.4, 0.4], i_earth: [0.32, 0.32, 0.45], i_moon: [0.28, 0.28, 0.32], i_sun: [0.36, 0.36, 0.4],
    i_star: [0.3, 0.1, 0.32], i_ufo: [0.4, 0.4, 0.22], i_comet: [0.45, 0.15, 0.25], i_asteroid: [0.25, 0.22, 0.18], i_station: [0.6, 0.4, 0.3],
    i_lander: [0.35, 0.35, 0.35], i_galaxy: [0.35, 0.12, 0.38],
    i_money: [0.18, 0.1, 0.06], i_coins: [0.12, 0.12, 0.08], i_mail: [0.24, 0.16, 0.05], i_chat: [0.3, 0.1, 0.3], i_calendar: [0.2, 0.1, 0.18],
    i_gear: [0.3, 0.1, 0.32], i_lock: [0.08, 0.04, 0.11], i_key: [0.11, 0.04, 0.012], i_idea: [0.18, 0.18, 0.36], i_search: [0.18, 0.1, 0.22],
    i_check: [0.3, 0.06, 0.3], i_cross: [0.3, 0.06, 0.3], i_heart: [0.32, 0.12, 0.3], i_chart: [0.3, 0.12, 0.3], i_megaphone: [0.36, 0.22, 0.22],
    i_hourglass: [0.14, 0.14, 0.3], i_palette: [0.36, 0.26, 0.03], i_tag: [0.09, 0.05, 0.004], i_magnet: [0.12, 0.04, 0.13], i_puzzle: [0.5, 0.36, 0.03],
    i_internet: [0.3, 0.3, 0.36]
  };
  var IT_FIG_STAND = {
    // on the floor (or the land): [across, front to back, high] m
    i_solar: [1.7, 1.1, 1.3], i_ground: [0.2, 0.2, 0.5],
    i_train: [20, 3.0, 4.2], i_plane: [36, 34, 11.5], i_ship: [48, 10, 16], i_house: [9, 8, 7], i_building: [16, 14, 20], i_shop: [12, 10, 5.5],
    i_school: [26, 14, 9], i_hospital: [32, 20, 18], i_factory: [30, 20, 12], i_warehouse: [32, 22, 9], i_tram: [24, 2.65, 3.6], i_helicopter: [13, 3, 4],
    i_airport: [60, 30, 22], i_trainstation: [32, 16, 11], i_park: [18, 18, 6], i_cafe: [10, 8, 4.8],
    i_rocket: [0.5, 0.5, 1.5], i_telescope: [0.8, 0.8, 1.5],
    i_warning: [0.3, 0.5, 0.62], i_flag: [0.6, 0.6, 2.6], i_target: [0.9, 0.6, 1.5], i_music: [0.95, 0.65, 1.55]
  };
  if (typeof OBJ3_REAL === "object") {
    Object.keys(IT_FIG).forEach(function (k) { var s = IT_FIG[k]; OBJ3_REAL[k] = [s[0], s[1]]; ON_TOP[k] = true; V3_ON[k] = s[2]; });
    Object.keys(IT_FIG_STAND).forEach(function (k) { var s = IT_FIG_STAND[k]; OBJ3_REAL[k] = [s[0], s[1]]; V3_HIGH[k] = s[2]; });
  }
  function itFig(kind, model) { if (!MODELS[kind]) { mDef(kind, model); IT_NEW_FIG.push(kind); } }
  var IT_NEW_FIG = [];
  var cmF = MODEL_CM;
  // a building's mass: walls, rows of windows, its flat roof and parapet, a door
  function itMass(M, x0, x1, y0, y1, z0, z1, wall, glass, floors) {
    M.box(x0, x1, y0, y1, z0, z1, M.mat("stone", wall));
    var n = Math.max(1, floors || Math.round((z1 - z0) / (3.2 * FLOOR_PX)));
    for (var f = 0; f < n; f++) {
      var za = z0 + (f + 0.35) * (z1 - z0) / n, zb = z0 + (f + 0.8) * (z1 - z0) / n;
      M.box(x0 + 0.6 * FLOOR_PX, x1 - 0.6 * FLOOR_PX, y1, y1 + 0.05 * FLOOR_PX, za, zb, M.mat("glass", glass));
      M.box(x0 + 0.6 * FLOOR_PX, x1 - 0.6 * FLOOR_PX, y0 - 0.05 * FLOOR_PX, y0, za, zb, M.mat("glass", glass));
      M.box(x1, x1 + 0.05 * FLOOR_PX, y0 + 0.6 * FLOOR_PX, y1 - 0.6 * FLOOR_PX, za, zb, M.mat("glass", glass));
      M.box(x0 - 0.05 * FLOOR_PX, x0, y0 + 0.6 * FLOOR_PX, y1 - 0.6 * FLOOR_PX, za, zb, M.mat("glass", glass));
    }
    M.box(x0 - 0.1 * FLOOR_PX, x1 + 0.1 * FLOOR_PX, y0 - 0.1 * FLOOR_PX, y1 + 0.1 * FLOOR_PX, z1, z1 + 0.4 * FLOOR_PX, M.mat("stone", mShade(wall, -0.12)));
  }
  function itDoor(M, x, y, w, h, color) { M.box(x - w / 2, x + w / 2, y, y + 0.08 * FLOOR_PX, 0, h, M.mat("glass", color || "#5b7a8c")); }
  function itTreeAt(M, x, y, h, rnd) {
    M.cyl(x, y, 0, h * 0.45, h * 0.035, M.mat("bark", "#6b4a32"), { seg: 7 });
    mLeaves(M, x, y, h * 0.62, h * 0.24, "#4f7d3a", rnd, 3);
  }

  // ---- a circuit's parts, as the big parts of a desk kit ----------------------------------------------
  itFig("i_battery", function (M, W, D, H, C) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 2 * cmF, M.mat("plastic", "#2a2c2e"), 1 * cmF);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 4 * cmF, H - 2 * cmF, M.mat("plastic", "#3a3d40"));
    [[-1, "#c43c3a"], [1, "#1f2226"]].forEach(function (t) { M.cyl(t[0] * W * 0.32, 0, H - 2 * cmF, H, 1.6 * cmF, M.mat("chrome", "#c9ced2"), { seg: 10 }); M.cyl(t[0] * W * 0.32, 0, H - 2.4 * cmF, H - 2 * cmF, 2.6 * cmF, M.mat("plastic", t[1]), { seg: 10 }); });
    M.box(-W / 2 + 3 * cmF, W / 2 - 3 * cmF, D / 2, D / 2 + 0.2 * cmF, H * 0.3, H * 0.6, M.mat("plastic", "#f2c94c"));
  });
  itFig("i_bulb", function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 2 * cmF, M.mat("wood", "#c9a273"), 0.5 * cmF);
    M.cyl(0, 0, 2 * cmF, 6 * cmF, 2.4 * cmF, M.mat("plastic", "#2a2c2e"), { seg: 12 });
    M.cyl(0, 0, 6 * cmF, 9 * cmF, 1.6 * cmF, M.mat("brass", "#c9a24a"), { seg: 12 });
    M.lathe(0, 0, [[1.6 * cmF, 9 * cmF], [2.6 * cmF, 12 * cmF], [4.6 * cmF, 16 * cmF], [4.6 * cmF, 19 * cmF], [2.4 * cmF, H - 0.5 * cmF], [0.1, H]], M.mat("glow", "#fff1c0"), { seg: 14 });
  });
  itFig("i_switch_on", function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 1.5 * cmF, M.mat("wood", "#c9a273"), 0.4 * cmF);
    [-1, 1].forEach(function (s) { M.box(s * W * 0.32 - 1 * cmF, s * W * 0.32 + 1 * cmF, -1.5 * cmF, 1.5 * cmF, 1.5 * cmF, 3.5 * cmF, M.mat("brass", "#c9a24a")); });
    M.tube([-W * 0.32, 0, 3 * cmF], [W * 0.3, 0, 3.4 * cmF], 0.6 * cmF, M.mat("chrome", "#c9ced2"), 6);
    M.cyl(-W * 0.32, 0, 3 * cmF, H, 0.8 * cmF, M.mat("plastic", "#c43c3a"), { seg: 8 });
  });
  itFig("i_resistor", function (M, W, D, H) {
    M.push().move(0, 0, H / 2).tiltY(90);
    M.lathe(0, 0, [[0.1, -W * 0.3], [D * 0.42, -W * 0.28], [D * 0.36, -W * 0.15], [D * 0.36, W * 0.15], [D * 0.42, W * 0.28], [0.1, W * 0.3]], M.mat("plastic", "#d9c09a"), { seg: 12 });
    [-0.18, -0.08, 0.02, 0.16].forEach(function (u, i) { M.cyl(0, 0, u * W, u * W + 0.025 * W, D * 0.38, M.mat("plastic", ["#8a4a22", "#1f2226", "#c43c3a", "#c9a24a"][i]), { seg: 12 }); });
    M.pop();
    [-1, 1].forEach(function (s) { M.tube([s * W * 0.3, 0, H / 2], [s * W / 2, 0, 0], 0.3 * cmF, M.mat("chrome", "#c9ced2"), 5); });
  });
  itFig("i_capacitor", function (M, W, D, H) {
    M.cyl(0, 0, 1 * cmF, H, W * 0.38, M.mat("plastic", "#2f4a8c"), { seg: 16, topMat: M.mat("chrome", "#c9ced2") });
    M.box(-W * 0.38, -W * 0.3, -0.5 * cmF, 0.5 * cmF, 1 * cmF, H, M.mat("plastic", "#e8e8e4"));
    [-1, 1].forEach(function (s) { M.cyl(s * W * 0.15, 0, 0, 1 * cmF, 0.25 * cmF, M.mat("chrome", "#c9ced2"), { seg: 5 }); });
  });
  itFig("i_led", function (M, W, D, H) {
    M.cyl(0, 0, 0, 1 * cmF, W * 0.4, M.mat("plastic", "#2a2c2e"), { seg: 14 });
    M.lathe(0, 0, [[W * 0.32, 1 * cmF], [W * 0.32, H * 0.7], [W * 0.2, H * 0.92], [0.1, H]], M.mat("glow", "#e0444f"), { seg: 14 });
  });
  itFig("i_motor", function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 1.5 * cmF, M.mat("metal", "#5d6166"));
    M.push().move(0, 0, H * 0.55).tiltY(90);
    M.cyl(0, 0, -W * 0.35, W * 0.3, D * 0.42, M.mat("metal", "#9aa0a5"), { seg: 16, bottom: true });
    M.cyl(0, 0, W * 0.3, W * 0.48, 0.6 * cmF, M.mat("chrome", "#c9ced2"), { seg: 8 });
    M.pop();
    M.box(-W * 0.2, W * 0.2, -D * 0.3, D * 0.3, 1.5 * cmF, H * 0.3, M.mat("metal", "#5d6166"));
  });
  itFig("i_buzzer", function (M, W, D, H) {
    M.cyl(0, 0, 0, H, W * 0.45, M.mat("plastic", "#1f2226"), { seg: 18 });
    M.cyl(0, 0, H - 0.1 * cmF, H, W * 0.1, M.mat("plastic", "#5d6166"), { seg: 10 });
  });
  itFig("i_socket", function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("plastic", "#f4f4f1"), 1.5 * cmF);
    [-1, 1].forEach(function (s) { M.box(s * W * 0.22 - 3 * cmF, s * W * 0.22 + 3 * cmF, -3 * cmF, 3 * cmF, H, H + 0.2 * cmF, M.mat("plastic", "#e8e8e4")); M.box(s * W * 0.22 - 1.5 * cmF, s * W * 0.22 - 1 * cmF, -0.4 * cmF, 0.4 * cmF, H + 0.2 * cmF, H + 0.3 * cmF, M.mat("plastic", "#1f2226")); M.box(s * W * 0.22 + 1 * cmF, s * W * 0.22 + 1.5 * cmF, -0.4 * cmF, 0.4 * cmF, H + 0.2 * cmF, H + 0.3 * cmF, M.mat("plastic", "#1f2226")); });
  });
  itFig("i_solar", function (M, W, D, H) {
    var al = M.mat("chrome", "#b9bec2");
    [[-1, -1, 0.35], [1, -1, 0.35], [-1, 1, 1.05], [1, 1, 1.05]].forEach(function (p) { M.box(p[0] * (W / 2 - 10 * cmF) - 2 * cmF, p[0] * (W / 2 - 10 * cmF) + 2 * cmF, -p[1] * (D / 2 - 15 * cmF) - 2 * cmF, -p[1] * (D / 2 - 15 * cmF) + 2 * cmF, 0, p[2] * FLOOR_PX, al); });
    M.push().move(0, 0, 0.7 * FLOOR_PX).tiltX(30);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 3 * cmF, al);
    M.box(-W / 2 + 2 * cmF, W / 2 - 2 * cmF, -D / 2 + 2 * cmF, D / 2 - 2 * cmF, 3 * cmF, 3.4 * cmF, M.mat("screen", "#1d2a3a"));
    for (var x = -W / 2 + W / 6; x < W / 2 - 1; x += W / 6) { M.box(x - 0.3 * cmF, x + 0.3 * cmF, -D / 2 + 2 * cmF, D / 2 - 2 * cmF, 3.4 * cmF, 3.6 * cmF, M.mat("chrome", "#9aa0a5")); }
    M.pop();
  });
  itFig("i_ground", function (M, W, D, H) {
    M.cyl(0, 0, 0, H, 0.8 * cmF, M.mat("brass", "#b4734a"), { seg: 8 });
    M.box(-2 * cmF, 2 * cmF, -2 * cmF, 2 * cmF, H - 8 * cmF, H - 4 * cmF, M.mat("brass", "#c9a24a"), 0.5 * cmF);
    M.tube([0, 2 * cmF, H - 6 * cmF], [W / 2, D / 2, H - 2 * cmF], 0.5 * cmF, M.mat("plastic", "#3f9a5a"), 5);
    M.disc(0, 0, 0.2 * cmF, W * 0.45, D * 0.45, M.mat("soil", "#6b5a45"), 12);
  });
  itFig("i_cell", function (M, W, D, H) {
    M.cyl(0, 0, 0, H * 0.94, W * 0.48, M.mat("plastic", "#e2731f"), { seg: 16 });
    M.cyl(0, 0, H * 0.6, H * 0.94, W * 0.485, M.mat("plastic", "#1f2226"), { seg: 16, topMat: M.mat("chrome", "#c9ced2") });
    M.cyl(0, 0, H * 0.94, H, W * 0.15, M.mat("chrome", "#c9ced2"), { seg: 10 });
  });
  itFig("i_diode", function (M, W, D, H) {
    M.push().move(0, 0, H / 2).tiltY(90);
    M.cyl(0, 0, -W * 0.2, W * 0.2, D * 0.42, M.mat("plastic", "#1f2226"), { seg: 12, bottom: true });
    M.cyl(0, 0, W * 0.12, W * 0.18, D * 0.43, M.mat("plastic", "#c9ced2"), { seg: 12 });
    M.pop();
    [-1, 1].forEach(function (s) { M.tube([s * W * 0.2, 0, H / 2], [s * W / 2, 0, 0], 0.3 * cmF, M.mat("chrome", "#c9ced2"), 5); });
  });
  itFig("i_fuse", function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 1 * cmF, M.mat("plastic", "#1f2226"));
    [-1, 1].forEach(function (s) { M.box(s * W * 0.38 - 1 * cmF, s * W * 0.38 + 1 * cmF, -1.2 * cmF, 1.2 * cmF, 1 * cmF, H, M.mat("brass", "#c9a24a")); });
    M.push().move(0, 0, H * 0.75).tiltY(90);
    M.cyl(0, 0, -W * 0.38, W * 0.38, 1 * cmF, M.mat("glass", "#e6f3f7"), { seg: 10, bottom: true });
    M.cyl(0, 0, -W * 0.36, W * 0.36, 0.1 * cmF, M.mat("chrome", "#c9ced2"), { seg: 4 });
    M.pop();
  });
  function itMeter(M, W, D, H, letter) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.7, M.mat("plastic", "#2a2c2e"), 1 * cmF);
    M.push().move(0, D / 2 - 2 * cmF, H * 0.7).tiltX(-35);
    M.box(-W / 2 + 1 * cmF, W / 2 - 1 * cmF, -1 * cmF, 1 * cmF, 0, H * 0.45, M.mat("plastic", "#2a2c2e"), 1 * cmF);
    M.box(-W / 2 + 2 * cmF, W / 2 - 2 * cmF, 1 * cmF, 1.2 * cmF, 1 * cmF, H * 0.42, M.mat("plastic", "#f4f2ec"));
    M.box(-0.2 * cmF, 0.2 * cmF, 1.2 * cmF, 1.4 * cmF, 1.5 * cmF, H * 0.38, M.mat("plastic", "#c43c3a"));
    M.pop();
    [-1, 1].forEach(function (s) { M.cyl(s * W * 0.3, D / 2 - 3 * cmF, H * 0.7, H * 0.7 + 1 * cmF, 1 * cmF, M.mat("plastic", s < 0 ? "#1f2226" : "#c43c3a"), { seg: 8 }); });
    M.box(-1.5 * cmF, 1.5 * cmF, D / 2, D / 2 + 0.2 * cmF, H * 0.2, H * 0.5, M.mat("plastic", letter));
  }
  itFig("i_ammeter", function (M, W, D, H) { itMeter(M, W, D, H, "#f2c94c"); });
  itFig("i_voltmeter", function (M, W, D, H) { itMeter(M, W, D, H, "#7fb3c9"); });
  itFig("i_dimmer", function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.6, M.mat("plastic", "#f4f4f1"), 1 * cmF);
    M.cyl(0, 0, H * 0.6, H, W * 0.22, M.mat("plastic", "#e8e8e4"), { seg: 18 });
    M.box(-0.4 * cmF, 0.4 * cmF, W * 0.12, W * 0.22, H - 0.1 * cmF, H + 0.1 * cmF, M.mat("plastic", "#5d6166"));
  });

  // ---- the travel set, as big as they are --------------------------------------------------------------
  itFig("i_train", function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#2a2c2e");
    var body = M.mat("lacquer", C.main), dark = M.mat("metal", C.frame), P = FLOOR_PX;
    M.box(-W / 2 + 0.6 * P, W / 2 - 2.5 * P, -D / 2 + 0.1 * P, D / 2 - 0.1 * P, 1.1 * P, H - 0.2 * P, body, 0.3 * P);
    M.prism([[W / 2 - 2.5 * P, -D / 2 + 0.1 * P], [W / 2 - 0.4 * P, -D / 2 + 0.6 * P], [W / 2 - 0.4 * P, D / 2 - 0.6 * P], [W / 2 - 2.5 * P, D / 2 - 0.1 * P]], 1.1 * P, H - 0.8 * P, body);
    M.box(W / 2 - 2.4 * P, W / 2 - 1.0 * P, -D / 2 + 0.2 * P, D / 2 - 0.2 * P, H - 1.6 * P, H - 0.6 * P, M.mat("glass", "#3a4f5c"));
    for (var x = -W / 2 + 1.5 * P; x < W / 2 - 3.5 * P; x += 1.8 * P) { [-1, 1].forEach(function (s) { M.box(x, x + 1.2 * P, s * (D / 2 - 0.08 * P) - 0.02 * P, s * (D / 2 - 0.08 * P) + 0.02 * P, 2.1 * P, 2.9 * P, M.mat("glass", "#3a4f5c")); }); }
    M.box(-W / 2 + 0.6 * P, W / 2 - 2.5 * P, -D / 2 + 0.05 * P, D / 2 - 0.05 * P, 1.4 * P, 1.7 * P, M.mat("lacquer", "#f4f4f1"));
    [-1, 1].forEach(function (e) { [-1, 1].forEach(function (s) { for (var a = 0; a < 2; a++) { itWheel(M, e * (W / 2 - 3.5 * P) + a * 2 * P * -e, s * (D / 2 - 0.4 * P), 0.5 * P, 0.48 * P, 0.15 * P, dark, true); } }); });
    M.box(-W / 2 + 0.4 * P, W / 2 - 0.4 * P, -D / 2 + 0.4 * P, D / 2 - 0.4 * P, 0.5 * P, 1.1 * P, dark);
    M.box(-W / 2 + 4 * P, -W / 2 + 7 * P, -0.4 * P, 0.4 * P, H - 0.2 * P, H, dark);
  });
  itFig("i_tram", function (M, W, D, H, C) {
    C = mPick(C, "#f2c94c", "#2a2c2e");
    var body = M.mat("lacquer", C.main), P = FLOOR_PX;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0.35 * P, H - 0.5 * P, body, 0.4 * P);
    for (var x = -W / 2 + 1 * P; x < W / 2 - 1.5 * P; x += 2.2 * P) { [-1, 1].forEach(function (s) { M.box(x, x + 1.7 * P, s * D / 2 - 0.02 * P, s * D / 2 + 0.02 * P, 1.1 * P, H - 1.0 * P, M.mat("glass", "#3a4f5c")); }); }
    [-1, 1].forEach(function (e) { M.box(e * W / 2 - (e > 0 ? 0.05 * P : 0), e * W / 2 + (e < 0 ? 0.05 * P : 0), -D / 2 + 0.2 * P, D / 2 - 0.2 * P, 1.0 * P, H - 0.9 * P, M.mat("glass", "#3a4f5c")); });
    M.box(-W / 2 + 0.5 * P, W / 2 - 0.5 * P, -D / 2 - 0.01 * P, D / 2 + 0.01 * P, 0.35 * P, 0.7 * P, M.mat("lacquer", C.frame));
    M.box(-1 * P, 1 * P, -0.6 * P, 0.6 * P, H - 0.5 * P, H - 0.3 * P, M.mat("metal", "#3a3d40"));
    M.tube([-0.8 * P, 0, H - 0.3 * P], [0.4 * P, 0, H + 0.8 * P], 0.04 * P, M.mat("metal", "#3a3d40"), 5);
    M.tube([0.4 * P, -0.6 * P, H + 0.8 * P], [0.4 * P, 0.6 * P, H + 0.8 * P], 0.04 * P, M.mat("metal", "#3a3d40"), 5);
  });
  itFig("i_plane", function (M, W, D, H, C) {
    C = mPick(C, "#f4f4f1", "#2f6fae");
    var body = M.mat("lacquer", C.main), trim = M.mat("lacquer", C.frame), P = FLOOR_PX, R = 2.0 * P, zc = 3.6 * P;
    M.push().move(0, 0, zc).tiltY(90);
    M.lathe(0, 0, [[0.1, -W / 2], [R * 0.7, -W / 2 + 2 * P], [R, -W / 2 + 6 * P], [R, W / 2 - 8 * P], [R * 0.5, W / 2 - 1 * P], [0.1, W / 2]], body, { seg: 16 });
    M.pop();
    M.prism([[-2 * P, -0.3 * P], [4 * P, -0.3 * P], [-1 * P, -D / 2], [-4 * P, -D / 2]], zc - 1.2 * P, zc - 0.9 * P, body);
    M.prism([[-2 * P, 0.3 * P], [4 * P, 0.3 * P], [-1 * P, D / 2], [-4 * P, D / 2]], zc - 1.2 * P, zc - 0.9 * P, body);
    [-1, 1].forEach(function (s) {
      M.push().move(1.5 * P, s * 6 * P, zc - 1.9 * P).tiltY(90);
      M.cyl(0, 0, -2 * P, 1.5 * P, 1.0 * P, M.mat("metal", "#9aa0a5"), { seg: 14, bottom: true });
      M.pop();
      M.prism([[-W / 2 + 1 * P, s * 0.3 * P], [-W / 2 + 4 * P, s * 0.3 * P], [-W / 2 + 2 * P, s * 6 * P], [-W / 2 + 0.5 * P, s * 6 * P]], zc + 0.2 * P, zc + 0.4 * P, body);
      M.cyl(4 * P, s * 3 * P, 0, zc - 1.6 * P, 0.15 * P, M.mat("metal", "#3a3d40"), { seg: 6 });
      itWheel(M, 4 * P, s * 3 * P, 0.45 * P, 0.45 * P, 0.3 * P, M.mat("rubber", "#151515"), true);
    });
    M.prism([[-W / 2 + 0.5 * P, -0.15 * P], [-W / 2 + 5 * P, -0.15 * P], [-W / 2 + 5 * P, 0.15 * P], [-W / 2 + 0.5 * P, 0.15 * P]], zc, H, trim);
    M.box(-W / 2 + 6 * P, W / 2 - 9 * P, -R - 0.02 * P, R + 0.02 * P, zc + 0.3 * P, zc + 0.6 * P, trim);
    M.cyl(W / 2 - 9 * P, 0, 0, zc - R, 0.15 * P, M.mat("metal", "#3a3d40"), { seg: 6 });
    itWheel(M, W / 2 - 9 * P, 0, 0.4 * P, 0.4 * P, 0.25 * P, M.mat("rubber", "#151515"), true);
  });
  itFig("i_helicopter", function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#2a2c2e");
    var body = M.mat("lacquer", C.main), dark = M.mat("metal", C.frame), P = FLOOR_PX;
    M.ball(W * 0.2, 0, 1.8 * P, 2.2 * P, 1.2 * P, 1.3 * P, body, { seg: 10 });
    M.ball(W * 0.28, 0, 2.0 * P, 1.4 * P, 1.0 * P, 0.9 * P, M.mat("glass", "#3a4f5c"), { seg: 8, lat0: -10 });
    M.tube([W * 0.05, 0, 2.1 * P], [-W / 2 + 0.6 * P, 0, 2.4 * P], 0.3 * P, body, 8);
    M.prism([[-W / 2 + 0.2 * P, -0.05 * P], [-W / 2 + 1.2 * P, -0.05 * P], [-W / 2 + 1.2 * P, 0.05 * P], [-W / 2 + 0.2 * P, 0.05 * P]], 2.2 * P, 3.4 * P, body);
    [-1, 1].forEach(function (s) { M.tube([W * 0.05, s * 1.0 * P, 0.1 * P], [W * 0.38, s * 1.0 * P, 0.1 * P], 0.08 * P, dark, 6); M.tube([W * 0.15, s * 0.9 * P, 0.1 * P], [W * 0.15, s * 0.6 * P, 0.8 * P], 0.06 * P, dark, 5); });
    M.cyl(W * 0.18, 0, 3.0 * P, 3.6 * P, 0.15 * P, dark, { seg: 8 });
    M.push().move(W * 0.18, 0, 0).turn(45);
    M.box(-0.12 * P, 0.12 * P, -5.5 * P, 0, 3.6 * P, 3.65 * P, dark);
    M.box(-5.5 * P, 0, -0.12 * P, 0.12 * P, 3.6 * P, 3.65 * P, dark); M.box(0, 5.5 * P, -0.12 * P, 0.12 * P, 3.6 * P, 3.65 * P, dark);
    M.pop();
    M.cyl(-W / 2 + 0.6 * P, 0.15 * P, 2.4 * P, 2.42 * P, 0.9 * P, dark, { seg: 10 });
  });
  itFig("i_ship", function (M, W, D, H, C) {
    C = mPick(C, "#1f3a5a", "#f4f4f1");
    var hull = M.mat("lacquer", C.main), white = M.mat("lacquer", C.frame), P = FLOOR_PX;
    var hullPts = [[-W / 2, -D / 2], [W / 2 - 10 * P, -D / 2], [W / 2, 0], [W / 2 - 10 * P, D / 2], [-W / 2, D / 2]];
    M.prism(hullPts, 0, 6 * P, hull);
    M.prism(hullPts.map(function (p) { return [p[0] * 0.99, p[1] * 0.98]; }), 4.5 * P, 4.8 * P, M.mat("lacquer", "#c43c3a"));
    M.box(-W / 2 + 4 * P, -W / 2 + 18 * P, -D / 2 + 1.5 * P, D / 2 - 1.5 * P, 6 * P, 12 * P, white, 0.3 * P);
    for (var z = 7 * P; z < 12 * P; z += 2 * P) { [-1, 1].forEach(function (s) { M.box(-W / 2 + 5 * P, -W / 2 + 17 * P, s * (D / 2 - 1.5 * P) - 0.03 * P, s * (D / 2 - 1.5 * P) + 0.03 * P, z, z + 0.9 * P, M.mat("glass", "#3a4f5c")); }); }
    M.cyl(-W / 2 + 10 * P, 0, 12 * P, H, 1.4 * P, M.mat("lacquer", "#c43c3a"), { seg: 12, topMat: M.mat("metal", "#1f2226") });
    for (var c = -W / 2 + 21 * P; c < W / 2 - 12 * P; c += 6.5 * P) { M.box(c, c + 6 * P, -D / 2 + 1 * P, D / 2 - 1 * P, 6 * P, 8.5 * P, M.mat("metal", ["#c43c3a", "#2f6fae", "#3f9a5a", "#e2731f"][Math.round(c / P) % 4 < 0 ? 0 : Math.round(c / P) % 4])); }
  });
  itFig("i_house", function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#7a3f2a");
    var P = FLOOR_PX, wallH = H * 0.5;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, wallH, M.mat("stone", C.main));
    M.quad(M.mat("lacquer", C.frame), [-W / 2 - 0.4 * P, -D / 2 - 0.4 * P, wallH], [W / 2 + 0.4 * P, -D / 2 - 0.4 * P, wallH], [W / 2 + 0.4 * P, 0, H], [-W / 2 - 0.4 * P, 0, H]);
    M.quad(M.mat("lacquer", C.frame), [W / 2 + 0.4 * P, D / 2 + 0.4 * P, wallH], [-W / 2 - 0.4 * P, D / 2 + 0.4 * P, wallH], [-W / 2 - 0.4 * P, 0, H], [W / 2 + 0.4 * P, 0, H]);
    [-1, 1].forEach(function (s) { M.tri(M.mat("stone", C.main), [s * W / 2, -s * D / 2, wallH], [s * W / 2, s * D / 2, wallH], [s * W / 2, 0, H - 0.3 * P], [s, 0, 0], [s, 0, 0], [s, 0, 0]); });
    itDoor(M, 0, D / 2, 1.0 * P, 2.1 * P, "#7a5236");
    [-1, 1].forEach(function (s) { M.box(s * W * 0.28 - 0.6 * P, s * W * 0.28 + 0.6 * P, D / 2, D / 2 + 0.05 * P, 1.0 * P, 2.2 * P, M.mat("glass", "#5b7a8c")); });
    M.box(W * 0.25, W * 0.25 + 0.7 * P, -D * 0.2, -D * 0.2 + 0.7 * P, H * 0.7, H + 0.6 * P, M.mat("stone", "#8f4a3a"));
  });
  itFig("i_building", function (M, W, D, H) { itMass(M, -W / 2, W / 2, -D / 2, D / 2, 0, H - 0.4 * FLOOR_PX, "#c9c3b6", "#5b7a8c"); itDoor(M, 0, D / 2, 2.4 * FLOOR_PX, 2.6 * FLOOR_PX); });
  itFig("i_shop", function (M, W, D, H, C) {
    C = mPick(C, "#e8e2d8", "#2f6fae");
    var P = FLOOR_PX;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 0.6 * P, M.mat("stone", C.main));
    M.box(-W / 2 + 0.6 * P, W / 2 - 0.6 * P, D / 2, D / 2 + 0.05 * P, 0.4 * P, 3.0 * P, M.mat("glass", "#5b7a8c"));
    M.box(-W / 2, W / 2, D / 2, D / 2 + 1.6 * P, 3.2 * P, 3.4 * P, M.mat("lacquer", C.frame));
    for (var x = -W / 2; x < W / 2 - 0.1; x += 1.0 * P) { M.quad(M.mat("fabric", (Math.round(x / P) % 2) ? "#f4f4f1" : C.frame), [x, D / 2, 3.4 * P], [x + 1.0 * P, D / 2, 3.4 * P], [x + 1.0 * P, D / 2 + 1.6 * P, 2.9 * P], [x, D / 2 + 1.6 * P, 2.9 * P]); }
    M.box(-W * 0.3, W * 0.3, D / 2, D / 2 + 0.1 * P, 3.6 * P, H - 0.8 * P, M.mat("glow", "#f8f6ef"));
    M.box(-W / 2 - 0.1 * P, W / 2 + 0.1 * P, -D / 2 - 0.1 * P, D / 2 + 0.1 * P, H - 0.6 * P, H, M.mat("stone", mShade(C.main, -0.1)));
  });
  itFig("i_school", function (M, W, D, H) {
    var P = FLOOR_PX;
    itMass(M, -W / 2, W / 2, -D / 2, D / 2, 0, H - 2.4 * P, "#b4573a", "#5b7a8c", 2);
    M.box(-3 * P, 3 * P, D / 2 - 0.5 * P, D / 2 + 0.5 * P, 0, H - 1.6 * P, M.mat("stone", "#efe7d6"));
    M.cyl(0, D / 2 + 0.55 * P, H - 3.4 * P, H - 3.3 * P, 0.7 * P, M.mat("ceramic", "#f4f0e4"), { seg: 16 });
    M.prism([[-3.2 * P, D / 2 - 0.6 * P], [3.2 * P, D / 2 - 0.6 * P], [0, D / 2 + 0.6 * P]], H - 1.6 * P, H, M.mat("stone", "#efe7d6"));
    itDoor(M, 0, D / 2 + 0.5 * P, 2.0 * P, 2.6 * P, "#5d3c25");
    M.cyl(W / 2 + 2 * P, D / 2, 0, H, 0.06 * P, M.mat("chrome", "#c9ced2"), { seg: 6 });
    M.box(W / 2 + 2 * P, W / 2 + 3.4 * P, D / 2 - 0.02 * P, D / 2 + 0.02 * P, H - 1.0 * P, H - 0.1 * P, M.mat("fabric", "#1f5fa8"));
  });
  itFig("i_hospital", function (M, W, D, H) {
    var P = FLOOR_PX;
    itMass(M, -W / 2, W / 2, -D / 2, D / 2, 0, H - 0.4 * P, "#eef0f2", "#7fa6c9");
    M.box(-W * 0.2, W * 0.2, D / 2, D / 2 + 4 * P, 3.6 * P, 4.0 * P, M.mat("stone", "#dfe3e6"));
    [-1, 1].forEach(function (s) { M.box(s * W * 0.18 - 0.2 * P, s * W * 0.18 + 0.2 * P, D / 2 + 3.6 * P, D / 2 + 4 * P, 0, 3.6 * P, M.mat("stone", "#dfe3e6")); });
    itDoor(M, 0, D / 2, 3 * P, 2.8 * P);
    M.box(-1.6 * P, 1.6 * P, D / 2 + 0.1 * P, D / 2 + 0.2 * P, H - 4 * P, H - 3.4 * P, M.mat("glow", "#e0444f"));
    M.box(-0.3 * P, 0.3 * P, D / 2 + 0.1 * P, D / 2 + 0.2 * P, H - 5.3 * P, H - 2.1 * P, M.mat("glow", "#e0444f"));
    M.disc(W * 0.25, 0, H, 4 * P, 4 * P, M.mat("plastic", "#3f9a5a"), 18);
    M.box(W * 0.25 - 1.5 * P, W * 0.25 + 1.5 * P, -0.25 * P, 0.25 * P, H + 0.01 * P, H + 0.02 * P, M.mat("plastic", "#f4f4f1"));
  });
  itFig("i_factory", function (M, W, D, H) {
    var P = FLOOR_PX, roofZ = H * 0.55, teeth = 4, tw = W / teeth;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, roofZ, M.mat("stone", "#a8a8a4"));
    for (var t = 0; t < teeth; t++) {
      var x0 = -W / 2 + t * tw;
      M.quad(M.mat("metal", "#7a7f84"), [x0, -D / 2, roofZ], [x0, D / 2, roofZ], [x0 + tw, D / 2, roofZ + 3 * P], [x0 + tw, -D / 2, roofZ + 3 * P]);
      M.quad(M.mat("glass", "#9fb8c6"), [x0 + tw, -D / 2, roofZ + 3 * P], [x0 + tw, D / 2, roofZ + 3 * P], [x0 + tw, D / 2, roofZ], [x0 + tw, -D / 2, roofZ]);
    }
    [-0.3, 0.1].forEach(function (k) { M.cyl(W * k, -D * 0.3, 0, H, 1.0 * P, M.mat("stone", "#8f4a3a"), { seg: 14, r1: 0.8 * P }); });
    M.box(-W * 0.4, -W * 0.4 + 5 * P, D / 2, D / 2 + 0.05 * P, 0, 4.5 * P, M.mat("metal", "#5d6166"));
  });
  itFig("i_warehouse", function (M, W, D, H) {
    var P = FLOOR_PX, wallH = H * 0.75;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, wallH, M.mat("metal", "#c9ced2"));
    M.quad(M.mat("metal", "#7a7f84"), [-W / 2 - 0.3 * P, -D / 2 - 0.3 * P, wallH], [W / 2 + 0.3 * P, -D / 2 - 0.3 * P, wallH], [W / 2 + 0.3 * P, 0, H], [-W / 2 - 0.3 * P, 0, H]);
    M.quad(M.mat("metal", "#7a7f84"), [W / 2 + 0.3 * P, D / 2 + 0.3 * P, wallH], [-W / 2 - 0.3 * P, D / 2 + 0.3 * P, wallH], [-W / 2 - 0.3 * P, 0, H], [W / 2 + 0.3 * P, 0, H]);
    [-1, 1].forEach(function (s) { M.tri(M.mat("metal", "#c9ced2"), [s * W / 2, -s * D / 2, wallH], [s * W / 2, s * D / 2, wallH], [s * W / 2, 0, H], [s, 0, 0], [s, 0, 0], [s, 0, 0]); });
    for (var x = -W / 2 + 3 * P; x < W / 2 - 4 * P; x += 6 * P) { M.box(x, x + 4 * P, D / 2, D / 2 + 0.05 * P, 0.1 * P, 4.5 * P, M.mat("metal", "#9aa0a5")); M.box(x - 0.2 * P, x + 4.2 * P, D / 2, D / 2 + 1.2 * P, 0, 1.2 * P, M.mat("stone", "#8d8a83")); }
  });
  itFig("i_airport", function (M, W, D, H) {
    var P = FLOOR_PX;
    M.box(-W / 2, W / 2 - 12 * P, -D / 2, D / 2 - 6 * P, 0, 9 * P, M.mat("stone", "#dfe3e6"));
    M.box(-W / 2, W / 2 - 12 * P, D / 2 - 6 * P, D / 2 - 5.9 * P, 0.5 * P, 8 * P, M.mat("glass", "#7fa6c9"));
    M.quad(M.mat("metal", "#b9bec2"), [-W / 2 - 1 * P, -D / 2 - 1 * P, 9 * P], [W / 2 - 11 * P, -D / 2 - 1 * P, 9 * P], [W / 2 - 11 * P, D / 2 - 3 * P, 11 * P], [-W / 2 - 1 * P, D / 2 - 3 * P, 11 * P]);
    var tx = W / 2 - 5 * P;
    M.cyl(tx, 0, 0, H - 4 * P, 1.6 * P, M.mat("stone", "#eef0f2"), { seg: 14, r1: 1.2 * P });
    M.cyl(tx, 0, H - 4 * P, H - 1 * P, 3.0 * P, M.mat("glass", "#4f6f80"), { seg: 12, r1: 3.4 * P });
    M.cyl(tx, 0, H - 1 * P, H, 3.4 * P, M.mat("stone", "#eef0f2"), { seg: 12, r1: 2 * P });
    for (var j = -W / 2 + 6 * P; j < W / 2 - 16 * P; j += 14 * P) { M.box(j, j + 2 * P, -D / 2 - 8 * P, -D / 2, 3 * P, 5 * P, M.mat("metal", "#9aa0a5")); }
  });
  itFig("i_trainstation", function (M, W, D, H) {
    var P = FLOOR_PX;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.55, M.mat("stone", "#c9b38f"));
    M.lathe(0, 0, [[D / 2, H * 0.55], [D / 2 * 0.7, H * 0.85], [0.1, H]], M.mat("glass", "#9fb8c6"), { seg: 16, from: 0, to: 180, ry: 1 });
    for (var x = -W / 2 + 2 * P; x < W / 2 - 2 * P; x += 4 * P) { M.box(x, x + 2.4 * P, D / 2, D / 2 + 0.05 * P, 0.4 * P, 4.5 * P, M.mat("glass", "#5b7a8c")); }
    M.cyl(0, D / 2 + 0.06 * P, H * 0.4, H * 0.4 + 0.1 * P, 1.2 * P, M.mat("ceramic", "#f4f0e4"), { seg: 18 });
    M.box(-W / 2 - 3 * P, -W / 2 - 1 * P, -D / 2, D / 2, 0, 0.9 * P, M.mat("stone", "#9a958c"));
  });
  itFig("i_park", function (M, W, D, H, C, n) {
    var P = FLOOR_PX, rnd = mRand((n && n.id) || 301);
    M.disc(0, 0, 0.02 * P, W / 2, D / 2, M.mat("leaves", "#6f9a4f"), 28);
    M.box(-W / 2, W / 2, -0.8 * P, 0.8 * P, 0.03 * P, 0.05 * P, M.mat("stone", "#cfc6b4"));
    M.box(-0.8 * P, 0.8 * P, -D / 2, D / 2, 0.03 * P, 0.05 * P, M.mat("stone", "#cfc6b4"));
    M.disc(W * 0.22, -D * 0.22, 0.06 * P, 3 * P, 2.2 * P, M.mat("water", "#5fa6c8"), 20);
    [[-0.3, -0.3], [-0.3, 0.3], [0.3, 0.32], [0.35, -0.05], [-0.1, 0.38], [0.05, -0.38]].forEach(function (p) { itTreeAt(M, p[0] * W, p[1] * D, H * (0.8 + rnd() * 0.2), rnd); });
    [-1, 1].forEach(function (s) { M.box(s * 3 * P - 0.8 * P, s * 3 * P + 0.8 * P, 1.2 * P, 1.6 * P, 0.4 * P, 0.48 * P, M.mat("wood", "#8a6a4c")); });
  });
  itFig("i_cafe", function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#3f6b4a");
    var P = FLOOR_PX;
    M.box(-W / 2, W / 2, -D / 2, D / 2 - 2 * P, 0, H - 0.5 * P, M.mat("stone", C.main));
    M.box(-W / 2 + 0.5 * P, W / 2 - 0.5 * P, D / 2 - 2 * P, D / 2 - 1.95 * P, 0.5 * P, 2.8 * P, M.mat("glass", "#5b7a8c"));
    for (var x = -W / 2; x < W / 2 - 0.1; x += 1.0 * P) { M.quad(M.mat("fabric", (Math.round(x / P) % 2) ? "#f4f4f1" : C.frame), [x, D / 2 - 2 * P, 3.2 * P], [x + 1.0 * P, D / 2 - 2 * P, 3.2 * P], [x + 1.0 * P, D / 2 - 0.4 * P, 2.7 * P], [x, D / 2 - 0.4 * P, 2.7 * P]); }
    [-1, 1].forEach(function (s) { M.cyl(s * W * 0.25, D / 2 - 0.9 * P, 0, 0.72 * P, 0.05 * P, M.mat("metal", "#2a2c2e"), { seg: 6 }); M.cyl(s * W * 0.25, D / 2 - 0.9 * P, 0.72 * P, 0.75 * P, 0.35 * P, M.mat("metal", "#2a2c2e"), { seg: 12 }); });
    M.box(-W / 2 - 0.1 * P, W / 2 + 0.1 * P, -D / 2 - 0.1 * P, D / 2 - 1.9 * P, H - 0.5 * P, H, M.mat("lacquer", C.frame));
  });

  // ---- the space set, and the things set, as a home has them -----------------------------------------
  itFig("i_rocket", function (M, W, D, H) {
    var white = M.mat("lacquer", "#f4f4f1"), red = M.mat("lacquer", "#c43c3a");
    [0, 1, 2].forEach(function (k) { var a = k / 3 * Math.PI * 2; M.tube([0, 0, 25 * cmF], [Math.cos(a) * W * 0.45, Math.sin(a) * W * 0.45, 0], 1 * cmF, M.mat("metal", "#5d6166"), 6); });
    M.lathe(0, 0, [[5 * cmF, 18 * cmF], [7 * cmF, 25 * cmF], [7 * cmF, H - 35 * cmF], [5 * cmF, H - 18 * cmF], [0.1, H]], white, { seg: 16 });
    M.lathe(0, 0, [[7.05 * cmF, H - 60 * cmF], [7.05 * cmF, H - 50 * cmF]], red, { seg: 16, top: false });
    [0, 1, 2].forEach(function (k) { M.push().turn(k * 120); M.prism([[6 * cmF, -0.6 * cmF], [16 * cmF, -0.6 * cmF], [16 * cmF, 0.6 * cmF], [6 * cmF, 0.6 * cmF]], 18 * cmF, 45 * cmF, red); M.pop(); });
    M.lathe(0, 0, [[4 * cmF, 18 * cmF], [6 * cmF, 10 * cmF]], M.mat("metal", "#3a3d40"), { seg: 12, top: false });
  });
  itFig("i_satellite", function (M, W, D, H) {
    M.box(-6 * cmF, 6 * cmF, -6 * cmF, 6 * cmF, H * 0.35, H * 0.35 + 12 * cmF, M.mat("brass", "#c9a24a"), 1 * cmF);
    [-1, 1].forEach(function (s) { M.box(s * 7 * cmF, s * W / 2, -D * 0.35, D * 0.35, H * 0.35 + 5 * cmF, H * 0.35 + 6 * cmF, M.mat("screen", "#1d2a3a")); });
    M.lathe(0, 0, [[0.1, H * 0.35 + 12 * cmF], [8 * cmF, H * 0.35 + 16 * cmF]], M.mat("lacquer", "#f4f4f1"), { seg: 16, top: false });
    M.cyl(0, 0, 0, H * 0.35, 1 * cmF, M.mat("chrome", "#9aa0a5"), { seg: 6 }); M.cyl(0, 0, 0, 1 * cmF, 6 * cmF, M.mat("plastic", "#2a2c2e"), { seg: 12 });
  });
  itFig("i_planet", function (M, W, D, H) {
    M.cyl(0, 0, 0, 2 * cmF, 6 * cmF, M.mat("wood", "#5d3c25"), { seg: 12 });
    M.cyl(0, 0, 2 * cmF, H * 0.35, 0.6 * cmF, M.mat("brass", "#c9a24a"), { seg: 6 });
    var r = Math.min(W, D) * 0.28;
    M.ball(0, 0, H - r, r, r, r, M.mat("plastic", "#d9b36a"), { seg: 12 });
    M.push().move(0, 0, H - r).tiltX(20);
    M.lathe(0, 0, [[r * 1.3, 0], [r * 1.75, 0]], M.mat("plastic", "#b8a27a"), { seg: 28, top: false });
    M.pop();
  });
  itFig("i_earth", function (M, W, D, H) {
    var r = Math.min(W, D) * 0.45;
    M.cyl(0, 0, 0, 2 * cmF, r * 0.5, M.mat("brass", "#c9a24a"), { seg: 14 });
    M.push().move(0, 0, H - r - 1 * cmF).tiltY(23);
    M.ball(0, 0, 0, r, r, r, M.mat("plastic", "#3a7ca5"), { seg: 12 });
    [[0, 30], [100, 10], [200, -20], [280, 40]].forEach(function (c) { var a = c[0] * Math.PI / 180, la = c[1] * Math.PI / 180; M.ball(Math.cos(a) * Math.cos(la) * r * 0.93, Math.sin(a) * Math.cos(la) * r * 0.93, Math.sin(la) * r * 0.93, r * 0.38, r * 0.38, r * 0.22, M.mat("fabric", "#6b8f4a"), { seg: 6 }); });
    M.lathe(0, 0, [[r + 1 * cmF, -0.3 * cmF], [r + 1 * cmF, 0.3 * cmF]], M.mat("brass", "#c9a24a"), { seg: 24, top: false, from: 90, to: 270 });
    M.pop();
    M.cyl(0, 0, 2 * cmF, H - 2 * r, 0.6 * cmF, M.mat("brass", "#c9a24a"), { seg: 6 });
  });
  itFig("i_moon", function (M, W, D, H) {
    var r = Math.min(W, D) * 0.45;
    M.cyl(0, 0, 0, 3 * cmF, r * 0.55, M.mat("wood", "#c9a273"), { seg: 14 });
    M.ball(0, 0, H - r, r, r, r, M.mat("glow", "#efe9d8"), { seg: 12 });
    [[0.4, 0.5], [-0.3, 0.2], [0.1, 0.6]].forEach(function (c) { M.ball(c[0] * r * 0.9, -r * 0.82, H - r + c[1] * r * 0.6, r * 0.18, r * 0.06, r * 0.18, M.mat("glow", "#d8d0bc"), { seg: 5 }); });
  });
  itFig("i_sun", function (M, W, D, H) {
    var r = Math.min(W, D) * 0.28;
    M.cyl(0, 0, 0, 2 * cmF, 8 * cmF, M.mat("metal", "#2a2c2e"), { seg: 12 });
    M.cyl(0, 0, 2 * cmF, H * 0.4, 0.6 * cmF, M.mat("metal", "#2a2c2e"), { seg: 6 });
    M.ball(0, 0, H - r * 1.6, r, r, r, M.mat("glow", "#f2c94c"), { seg: 12 });
    for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; M.tube([Math.cos(a) * r * 1.1, 0, H - r * 1.6 + Math.sin(a) * r * 1.1], [Math.cos(a) * r * 1.55, 0, H - r * 1.6 + Math.sin(a) * r * 1.55], 0.8 * cmF, M.mat("glow", "#f08a24"), 5); }
  });
  function itStar(M, cx, z, r, t, mat) {
    var pts = [];
    for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r * 0.45 : r; pts.push([cx + Math.cos(a) * rr, z + Math.sin(a) * rr]); }
    M.push().tiltX(90);
    M.prism(pts.map(function (p) { return [p[0], p[1]]; }), -t / 2, t / 2, mat);
    M.pop();
  }
  itFig("i_star", function (M, W, D, H) {
    M.box(-6 * cmF, 6 * cmF, -4 * cmF, 4 * cmF, 0, 2 * cmF, M.mat("wood", "#c9a273"), 0.5 * cmF);
    itStar(M, 0, H - W / 2, W / 2, D * 0.6, M.mat("glow", "#f8e48a"));
  });
  itFig("i_ufo", function (M, W, D, H) {
    var r = Math.min(W, D) / 2;
    M.lathe(0, 0, [[r * 0.3, 0], [r * 0.95, H * 0.35], [r, H * 0.42], [r * 0.6, H * 0.55], [0.1, H * 0.6]], M.mat("chrome", "#b9bec2"), { seg: 24 });
    M.ball(0, 0, H * 0.58, r * 0.4, r * 0.4, H * 0.42, M.mat("glass", "#9fe0d0"), { seg: 10, lat0: 0 });
    for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2; M.ball(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, H * 0.37, 1.2 * cmF, 1.2 * cmF, 1.2 * cmF, M.mat("glow", i % 2 ? "#57c46f" : "#f2c94c"), { seg: 5 }); }
  });
  itFig("i_comet", function (M, W, D, H) {
    M.box(-5 * cmF, 5 * cmF, -D / 2, D / 2, 0, 2 * cmF, M.mat("stone", "#2a2c2e"), 0.5 * cmF);
    M.cyl(0, 0, 2 * cmF, H * 0.5, 0.5 * cmF, M.mat("chrome", "#c9ced2"), { seg: 6 });
    M.ball(W * 0.3, 0, H * 0.75, 4 * cmF, 4 * cmF, 4 * cmF, M.mat("glow", "#dff4ff"), { seg: 8 });
    M.push().move(W * 0.3, 0, H * 0.75).tiltY(-100);
    M.cyl(0, 0, 0, W * 0.7, 4 * cmF, M.mat("glass", "#bfe6ff"), { seg: 10, r1: 0.3 * cmF });
    M.pop();
  });
  itFig("i_asteroid", function (M, W, D, H, C, n) {
    var rnd = mRand((n && n.id) || 303), rock = M.mat("stone", "#6f6a64");
    M.ball(0, 0, H * 0.5, W * 0.45, D * 0.45, H * 0.5, rock, { seg: 6 });
    for (var i = 0; i < 5; i++) { M.ball((rnd() - 0.5) * W * 0.6, (rnd() - 0.5) * D * 0.6, H * (0.3 + rnd() * 0.5), W * 0.18, D * 0.18, H * 0.2, M.mat("stone", "#5d5a54"), { seg: 5 }); }
  });
  itFig("i_station", function (M, W, D, H) {
    var steel = M.mat("chrome", "#c9ced2"), panel = M.mat("screen", "#1d2a3a");
    M.cyl(0, 0, 0, H * 0.4, 0.6 * cmF, M.mat("metal", "#2a2c2e"), { seg: 6 }); M.cyl(0, 0, 0, 1 * cmF, 6 * cmF, M.mat("metal", "#2a2c2e"), { seg: 12 });
    M.tube([-W / 2, 0, H * 0.75], [W / 2, 0, H * 0.75], 0.8 * cmF, steel, 6);
    [-0.25, 0.05, 0.3].forEach(function (k) { M.push().move(W * k, 0, H * 0.75).tiltX(90); M.cyl(0, 0, -D * 0.12, D * 0.12, 3 * cmF, steel, { seg: 12, bottom: true }); M.pop(); });
    [-1, 1].forEach(function (s) { [-1, 1].forEach(function (e) { M.box(s * W * 0.42 - 6 * cmF, s * W * 0.42 + 6 * cmF, e * 2 * cmF, e * D / 2, H * 0.75 - 0.2 * cmF, H * 0.75 + 0.2 * cmF, panel); }); });
  });
  itFig("i_lander", function (M, W, D, H) {
    var gold = M.mat("brass", "#c9a24a");
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.tube([s[0] * W * 0.15, s[1] * D * 0.15, H * 0.45], [s[0] * W * 0.45, s[1] * D * 0.45, 0], 0.6 * cmF, M.mat("chrome", "#c9ced2"), 5); M.cyl(s[0] * W * 0.45, s[1] * D * 0.45, 0, 0.5 * cmF, 2.5 * cmF, M.mat("chrome", "#c9ced2"), { seg: 10 }); });
    M.prism([[-W * 0.2, -D * 0.14], [-W * 0.14, -D * 0.2], [W * 0.14, -D * 0.2], [W * 0.2, -D * 0.14], [W * 0.2, D * 0.14], [W * 0.14, D * 0.2], [-W * 0.14, D * 0.2], [-W * 0.2, D * 0.14]], H * 0.3, H * 0.55, gold);
    M.box(-W * 0.14, W * 0.14, -D * 0.14, D * 0.14, H * 0.55, H * 0.85, M.mat("metal", "#b9bec2"), 1 * cmF);
    M.box(-W * 0.06, W * 0.06, D * 0.14, D * 0.15, H * 0.65, H * 0.75, M.mat("glass", "#3a4f5c"));
    M.cyl(0, 0, H * 0.85, H, 0.4 * cmF, M.mat("chrome", "#c9ced2"), { seg: 5 });
  });
  itFig("i_galaxy", function (M, W, D, H) {
    M.box(-6 * cmF, 6 * cmF, -D / 2, D / 2, 0, 2 * cmF, M.mat("stone", "#1f2226"), 0.5 * cmF);
    M.cyl(0, 0, 2 * cmF, H * 0.4, 0.5 * cmF, M.mat("chrome", "#c9ced2"), { seg: 6 });
    M.push().move(0, 0, H - W / 2).tiltX(70);
    M.cyl(0, 0, -0.5 * cmF, 0.5 * cmF, W / 2, M.mat("glass", "#3b2f6b"), { seg: 28 });
    for (var i = 0; i < 40; i++) { var t = i / 40, a = t * Math.PI * 4, r = t * W * 0.45; [0, Math.PI].forEach(function (o) { M.ball(Math.cos(a + o) * r, Math.sin(a + o) * r, 0.6 * cmF, 0.7 * cmF, 0.7 * cmF, 0.5 * cmF, M.mat("glow", t < 0.3 ? "#fff1c0" : "#b8c8ff"), { seg: 4 }); }); }
    M.ball(0, 0, 0, 3 * cmF, 3 * cmF, 1.5 * cmF, M.mat("glow", "#fff1c0"), { seg: 8 });
    M.pop();
  });
  itFig("i_telescope", function (M, W, D, H) {
    var black = M.mat("metal", "#2a2c2e"), white = M.mat("lacquer", "#f4f4f1");
    [0, 1, 2].forEach(function (k) { var a = k / 3 * Math.PI * 2; M.tube([0, 0, H * 0.62], [Math.cos(a) * W * 0.4, Math.sin(a) * D * 0.4, 0], 1.2 * cmF, M.mat("chrome", "#b9bec2"), 6); });
    M.cyl(0, 0, H * 0.6, H * 0.68, 4 * cmF, black, { seg: 10 });
    M.push().move(0, 0, H * 0.72).tiltY(-50);
    M.cyl(0, 0, -30 * cmF, 70 * cmF, 6 * cmF, white, { seg: 14, bottom: true });
    M.cyl(0, 0, 68 * cmF, 72 * cmF, 6.6 * cmF, black, { seg: 14 });
    M.cyl(0, 0, -36 * cmF, -30 * cmF, 1.6 * cmF, black, { seg: 8 });
    M.pop();
  });
  itFig("i_internet", function (M, W, D, H) {
    var r = Math.min(W, D) * 0.4, glow = M.mat("glow", "#57c4e6");
    M.cyl(0, 0, 0, 3 * cmF, r * 0.6, M.mat("plastic", "#1f2226"), { seg: 16 });
    M.cyl(0, 0, 3 * cmF, H - 2 * r, 0.8 * cmF, M.mat("chrome", "#9aa0a5"), { seg: 6 });
    var cz = H - r;
    for (var i = 0; i < 4; i++) { M.push().move(0, 0, cz).turn(i * 45); M.lathe(0, 0, [[r, -0.3 * cmF], [r, 0.3 * cmF]], glow, { seg: 24, top: false, ry: 1 }); M.pop(); }
    for (var j = 0; j < 4; j++) { M.push().move(0, 0, cz).turn(j * 45).tiltX(90); M.lathe(0, 0, [[r, -0.3 * cmF], [r, 0.3 * cmF]], glow, { seg: 24, top: false }); M.pop(); }
    M.ball(0, 0, cz, r * 0.92, r * 0.92, r * 0.92, M.mat("glass", "#bfe6ff"), { seg: 10 });
  });
  itFig("i_money", function (M, W, D, H) {
    for (var i = 0; i < 6; i++) { M.box(-W / 2 + (i % 2) * 0.4 * cmF, W / 2 - (i % 2) * 0.4 * cmF, -D / 2, D / 2, i * H / 6, (i + 1) * H / 6 - 0.1 * cmF, M.mat("linen", i % 2 ? "#8fbf8a" : "#7fb07a")); }
    M.box(-1.5 * cmF, 1.5 * cmF, -D / 2 - 0.1 * cmF, D / 2 + 0.1 * cmF, 0, H + 0.1 * cmF, M.mat("linen", "#e8d7b0"));
  });
  itFig("i_coins", function (M, W, D, H) {
    [[0, 0, 7], [W * 0.25, -D * 0.1, 4], [-W * 0.2, D * 0.2, 5]].forEach(function (s) { for (var i = 0; i < s[2]; i++) { M.cyl(s[0], s[1], i * 1 * cmF, (i + 1) * 1 * cmF - 0.1 * cmF, 2.4 * cmF, M.mat("brass", "#d4a62a"), { seg: 14 }); } });
  });
  itFig("i_mail", function (M, W, D, H) {
    [0, 1, 2].forEach(function (i) {
      M.push().move((i - 1) * 2 * cmF, (i - 1) * 1.5 * cmF, i * 1.2 * cmF).turn((i - 1) * 8);
      M.box(-W * 0.42, W * 0.42, -D * 0.42, D * 0.42, 0, 1 * cmF, M.mat("linen", "#f4f0e4"));
      M.prism([[-W * 0.42, D * 0.42], [W * 0.42, D * 0.42], [0, 0]], 1 * cmF, 1.1 * cmF, M.mat("linen", "#e8dfcc"));
      M.box(W * 0.25, W * 0.38, D * 0.22, D * 0.38, 1 * cmF, 1.15 * cmF, M.mat("plastic", "#c43c3a"));
      M.pop();
    });
  });
  itFig("i_chat", function (M, W, D, H) {
    M.box(-5 * cmF, 5 * cmF, -D / 2, D / 2, 0, 2 * cmF, M.mat("wood", "#c9a273"), 0.5 * cmF);
    M.box(-W / 2, W / 2, -D * 0.2, D * 0.2, H * 0.3, H, M.mat("lacquer", "#2f6fae"), 4 * cmF);
    M.prism([[-W * 0.2, -D * 0.2], [-W * 0.05, -D * 0.2], [-W * 0.05, D * 0.2], [-W * 0.2, D * 0.2]], H * 0.12, H * 0.3, M.mat("lacquer", "#2f6fae"));
    [-1, 0, 1].forEach(function (k) { M.ball(k * W * 0.2, D * 0.2, H * 0.65, 2 * cmF, 0.8 * cmF, 2 * cmF, M.mat("plastic", "#f4f4f1"), { seg: 6 }); });
  });
  itFig("i_calendar", function (M, W, D, H) {
    M.push().tiltX(-15);
    M.box(-W / 2, W / 2, -D * 0.1, D * 0.1, 0, H, M.mat("linen", "#f4f2ec"), 0.5 * cmF);
    M.box(-W / 2, W / 2, D * 0.1, D * 0.12, H * 0.72, H, M.mat("plastic", "#c43c3a"));
    for (var r = 0; r < 4; r++) { for (var c = 0; c < 5; c++) { M.box(-W / 2 + 2 * cmF + c * (W - 4 * cmF) / 5, -W / 2 + 2 * cmF + (c + 0.7) * (W - 4 * cmF) / 5, D * 0.1, D * 0.11, H * 0.1 + r * H * 0.14, H * 0.1 + r * H * 0.14 + H * 0.08, M.mat("plastic", "#9aa0a5")); } }
    M.pop();
    M.tube([-W * 0.4, -D * 0.4, 0], [-W * 0.4, -D * 0.05, H * 0.9], 0.4 * cmF, M.mat("metal", "#2a2c2e"), 4);
  });
  itFig("i_gear", function (M, W, D, H) {
    var r = Math.min(W, H) * 0.42, pts = [];
    for (var i = 0; i < 32; i++) { var a = i / 32 * Math.PI * 2, rr = (Math.floor(i / 2) % 2) ? r : r * 0.82; pts.push([Math.cos(a) * rr, H - r - 1 * cmF + Math.sin(a) * rr]); }
    M.box(-W * 0.3, W * 0.3, -D / 2, D / 2, 0, 2 * cmF, M.mat("wood", "#5d3c25"), 0.5 * cmF);
    M.push().tiltX(90);
    M.prism(pts, -D * 0.2, D * 0.2, M.mat("brass", "#b4734a"));
    M.pop();
    M.push().move(0, 0, H - r - 1 * cmF).tiltX(90); M.cyl(0, 0, -D * 0.22, D * 0.22, r * 0.25, M.mat("metal", "#3a3d40"), { seg: 14, bottom: true }); M.pop();
  });
  itFig("i_lock", function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.6, M.mat("brass", "#c9a24a"), 1 * cmF);
    M.push().move(0, 0, H * 0.6).tiltX(90);
    M.lathe(0, 0, [[W * 0.32, -0.6 * cmF], [W * 0.32, 0.6 * cmF]], M.mat("chrome", "#c9ced2"), { seg: 16, from: 0, to: 180, top: false });
    M.pop();
    M.box(-0.4 * cmF, 0.4 * cmF, D / 2, D / 2 + 0.1 * cmF, H * 0.2, H * 0.4, M.mat("metal", "#2a2c2e"));
  });
  itFig("i_key", function (M, W, D, H) {
    M.cyl(-W * 0.32, 0, 0, H, D * 0.45, M.mat("brass", "#c9a24a"), { seg: 16 });
    M.box(-W * 0.15, W * 0.5, -D * 0.12, D * 0.12, 0, H, M.mat("brass", "#c9a24a"));
    [0.25, 0.4].forEach(function (k) { M.box(W * k, W * k + W * 0.06, D * 0.12, D * 0.32, 0, H, M.mat("brass", "#c9a24a")); });
  });
  itFig("i_idea", function (M, W, D, H) {
    M.cyl(0, 0, 0, 3 * cmF, W * 0.4, M.mat("wood", "#3b2416"), { seg: 16 });
    M.cyl(0, 0, 3 * cmF, 9 * cmF, 2.6 * cmF, M.mat("brass", "#c9a24a"), { seg: 12 });
    M.lathe(0, 0, [[2.4 * cmF, 9 * cmF], [4 * cmF, 13 * cmF], [W * 0.46, H * 0.62], [W * 0.4, H * 0.86], [0.1, H]], M.mat("glass", "#fff4d8"), { seg: 16 });
    M.cyl(0, 0, 12 * cmF, H * 0.7, 0.3 * cmF, M.mat("glow", "#ffb84a"), { seg: 5 });
  });
  itFig("i_search", function (M, W, D, H) {
    M.box(-W * 0.3, W * 0.3, -D / 2, D / 2, 0, 1.5 * cmF, M.mat("wood", "#5d3c25"), 0.5 * cmF);
    M.push().move(-W * 0.1, 0, H * 0.62).tiltX(80);
    M.lathe(0, 0, [[W * 0.32, -0.8 * cmF], [W * 0.36, 0], [W * 0.32, 0.8 * cmF]], M.mat("brass", "#c9a24a"), { seg: 20 });
    M.disc(0, 0, 0, W * 0.32, W * 0.32, M.mat("glass", "#dff1f7"), 20);
    M.pop();
    M.tube([W * 0.12, 0, H * 0.4], [W * 0.4, 0, 1.5 * cmF], 1 * cmF, M.mat("wood", "#3b2416"), 8);
  });
  function itMark(M, W, D, H, pts, color) {
    M.box(-W * 0.2, W * 0.2, -D / 2, D / 2, 0, 1.5 * cmF, M.mat("wood", "#c9a273"), 0.5 * cmF);
    for (var i = 0; i + 1 < pts.length; i++) { M.tube([pts[i][0] * W, 0, pts[i][1] * H], [pts[i + 1][0] * W, 0, pts[i + 1][1] * H], D * 0.35, M.mat("lacquer", color), 8, true); }
  }
  itFig("i_check", function (M, W, D, H) { itMark(M, W, D, H, [[-0.38, 0.55], [-0.1, 0.2], [0.42, 0.92]], "#3f9a5a"); });
  itFig("i_cross", function (M, W, D, H) {
    itMark(M, W, D, H, [[-0.35, 0.15], [0.35, 0.9]], "#c43c3a");
    M.tube([0.35 * W, 0, 0.15 * H], [-0.35 * W, 0, 0.9 * H], D * 0.35, M.mat("lacquer", "#c43c3a"), 8, true);
  });
  itFig("i_heart", function (M, W, D, H) {
    var red = M.mat("velvet", "#c43c3a");
    [-1, 1].forEach(function (s) { M.ball(s * W * 0.22, 0, H * 0.66, W * 0.28, D * 0.45, H * 0.3, red, { seg: 10 }); });
    M.push().tiltX(90);
    M.prism([[-W * 0.48, H * 0.62], [W * 0.48, H * 0.62], [0, 0.02 * H]], -D * 0.38, D * 0.38, red);
    M.pop();
  });
  itFig("i_chart", function (M, W, D, H) {
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 1.5 * cmF, M.mat("stone", "#2a2c2e"), 0.5 * cmF);
    [0.3, 0.5, 0.42, 0.75, 0.95].forEach(function (k, i) { M.box(-W / 2 + 2 * cmF + i * (W - 4 * cmF) / 5, -W / 2 + 2 * cmF + (i + 0.7) * (W - 4 * cmF) / 5, -D * 0.3, D * 0.3, 1.5 * cmF, 1.5 * cmF + k * (H - 2 * cmF), M.mat("lacquer", ["#2f6fae", "#3f9a5a", "#f2c94c", "#e2731f", "#c43c3a"][i])); });
  });
  itFig("i_megaphone", function (M, W, D, H) {
    M.push().move(0, 0, H * 0.55).tiltY(90);
    M.cyl(0, 0, -W * 0.35, W * 0.35, D * 0.12, M.mat("plastic", "#f4f4f1"), { seg: 16, r1: D * 0.45, bottom: true, topMat: M.mat("plastic", "#2a2c2e") });
    M.pop();
    M.box(-W * 0.3, -W * 0.18, -1.5 * cmF, 1.5 * cmF, 0, H * 0.5, M.mat("plastic", "#c43c3a"), 1 * cmF);
  });
  itFig("i_hourglass", function (M, W, D, H) {
    var wood = M.mat("wood", "#5d3c25");
    [0, H - 2 * cmF].forEach(function (z) { M.cyl(0, 0, z, z + 2 * cmF, W * 0.48, wood, { seg: 14 }); });
    for (var i = 0; i < 3; i++) { var a = i / 3 * Math.PI * 2; M.cyl(Math.cos(a) * W * 0.4, Math.sin(a) * W * 0.4, 2 * cmF, H - 2 * cmF, 0.6 * cmF, wood, { seg: 6 }); }
    M.lathe(0, 0, [[W * 0.3, 2 * cmF], [W * 0.32, H * 0.3], [0.6 * cmF, H * 0.5], [W * 0.32, H * 0.7], [W * 0.3, H - 2 * cmF]], M.mat("glass", "#e6f3f7"), { seg: 14, top: false });
    M.lathe(0, 0, [[W * 0.28, 2.2 * cmF], [W * 0.15, H * 0.2], [0.1, H * 0.25]], M.mat("fabric", "#e2c18a"), { seg: 12 });
  });
  itFig("i_flag", function (M, W, D, H) {
    M.box(-W * 0.3, W * 0.3, -D * 0.3, D * 0.3, 0, 6 * cmF, M.mat("metal", "#3a3d40"), 1 * cmF);
    M.cyl(0, 0, 6 * cmF, H, 1.6 * cmF, M.mat("chrome", "#c9ced2"), { seg: 8 });
    M.ball(0, 0, H, 2.6 * cmF, 2.6 * cmF, 2.6 * cmF, M.mat("brass", "#c9a24a"), { seg: 8 });
    var fw = 90 * cmF, fh = 55 * cmF;
    for (var i = 0; i < 6; i++) {
      var x0 = 2 * cmF + i * fw / 6, x1 = x0 + fw / 6, y0 = Math.sin(i * 0.9) * 4 * cmF, y1 = Math.sin((i + 1) * 0.9) * 4 * cmF;
      M.quad(M.mat("fabric", "#c43c3a"), [x0, y0, H - 8 * cmF - fh], [x1, y1, H - 8 * cmF - fh], [x1, y1, H - 8 * cmF], [x0, y0, H - 8 * cmF]);
      M.quad(M.mat("fabric", "#c43c3a"), [x1, y1, H - 8 * cmF - fh], [x0, y0, H - 8 * cmF - fh], [x0, y0, H - 8 * cmF], [x1, y1, H - 8 * cmF]);
    }
  });
  itFig("i_warning", function (M, W, D, H) {
    var yellow = M.mat("plastic", "#f2c94c");
    [-1, 1].forEach(function (s) {
      M.push().move(0, s * D * 0.1, 0).tiltX(s * -16);
      M.box(-W / 2, W / 2, -0.8 * cmF, 0.8 * cmF, 0, H, yellow, 1 * cmF);
      M.prism([[-W * 0.32, s * 0.9 * cmF + 0.1 * cmF], [W * 0.32, s * 0.9 * cmF + 0.1 * cmF], [0, s * 0.9 * cmF + 0.2 * cmF]], H * 0.45, H * 0.46, M.mat("plastic", "#1f2226"));
      M.box(-1 * cmF, 1 * cmF, s * 0.8 * cmF, s * 1.0 * cmF, H * 0.5, H * 0.72, M.mat("plastic", "#1f2226"));
      M.box(-1 * cmF, 1 * cmF, s * 0.8 * cmF, s * 1.0 * cmF, H * 0.42, H * 0.46, M.mat("plastic", "#1f2226"));
      M.pop();
    });
  });
  itFig("i_target", function (M, W, D, H) {
    var wood = M.mat("wood", "#8a6a4c");
    [-1, 1].forEach(function (s) { M.tube([s * W * 0.35, D * 0.2, 0], [s * W * 0.25, 0, H], 1.8 * cmF, wood, 6); });
    M.tube([0, -D * 0.45, 0], [0, -2 * cmF, H * 0.85], 1.8 * cmF, wood, 6);
    M.push().move(0, 4 * cmF, H * 0.55).tiltX(-80);
    ["#f2c94c", "#c43c3a", "#2f6fae", "#1f2226", "#f4f4f1"].forEach(function (c, i) { M.cyl(0, 0, i * 0.2 * cmF, 6 * cmF + i * 0.2 * cmF, W * 0.4 - i * W * 0.4 / 5, M.mat(i ? "plastic" : "fabric", c), { seg: 24 }); });
    M.pop();
  });
  itFig("i_music", function (M, W, D, H, C) {
    C = mPick(C, "#8a3a2a", "#f2c94c");
    var wood = M.mat("lacquer", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.62, wood, 3 * cmF);
    M.push().move(0, 0, H * 0.62).tiltX(90);
    M.lathe(0, 0, [[W / 2, -D / 2], [W / 2, D / 2]], wood, { seg: 18, from: 0, to: 180, top: false });
    M.pop();
    M.prism([[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]], H * 0.62, H * 0.63, wood);
    M.push().move(0, D / 2 + 0.2 * cmF, H * 0.62).tiltX(90);
    M.lathe(0, 0, [[W * 0.42, 0], [W * 0.46, 0]], M.mat("glow", C.frame), { seg: 18, from: 0, to: 180, top: false });
    M.pop();
    M.box(-W * 0.32, W * 0.32, D / 2, D / 2 + 0.3 * cmF, H * 0.4, H * 0.58, M.mat("glass", "#3a4f5c"));
    M.box(-W * 0.35, W * 0.35, D / 2, D / 2 + 0.4 * cmF, H * 0.08, H * 0.32, M.mat("fabric", "#c9a24a"));
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - 3 * cmF, s * W / 2 + 3 * cmF, D / 2 - 6 * cmF, D / 2, H * 0.05, H * 0.6, M.mat("glow", s < 0 ? "#e94e6b" : "#57c4e6")); });
  });
  itFig("i_palette", function (M, W, D, H) {
    var pts = [];
    for (var i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2; pts.push([Math.cos(a) * W * 0.48, Math.sin(a) * D * 0.48]); }
    M.prism(pts, 0, H * 0.4, M.mat("wood", "#c9a273"));
    ["#c43c3a", "#f2c94c", "#2f6fae", "#3f9a5a", "#f4f4f1", "#8a5bb5"].forEach(function (c, i) { var a = (i / 7 + 0.1) * Math.PI * 2; M.ball(Math.cos(a) * W * 0.33, Math.sin(a) * D * 0.33, H * 0.45, 2.4 * cmF, 2.4 * cmF, 0.8 * cmF, M.mat("plastic", c), { seg: 6 }); });
    M.tube([-W * 0.2, D * 0.1, H * 0.6], [W * 0.4, -D * 0.3, H * 0.7], 0.5 * cmF, M.mat("wood", "#3b2416"), 5);
  });
  itFig("i_tag", function (M, W, D, H) {
    M.prism([[-W / 2, -D / 2], [W * 0.25, -D / 2], [W / 2, 0], [W * 0.25, D / 2], [-W / 2, D / 2]], 0, Math.max(H, 0.3 * cmF), M.mat("linen", "#f2d28a"));
    M.cyl(W * 0.2, 0, 0, Math.max(H, 0.3 * cmF) + 0.05 * cmF, 0.6 * cmF, M.mat("metal", "#5d6166"), { seg: 8 });
  });
  itFig("i_magnet", function (M, W, D, H) {
    M.push().move(0, 0, H * 0.45).tiltX(90);
    M.lathe(0, 0, [[W * 0.32, -D / 2], [W * 0.5, -D / 2], [W * 0.5, D / 2], [W * 0.32, D / 2]], M.mat("lacquer", "#c43c3a"), { seg: 16, from: 0, to: 180, top: false });
    M.pop();
    [-1, 1].forEach(function (s) { M.box(s * W * 0.41 - W * 0.09, s * W * 0.41 + W * 0.09, -D / 2, D / 2, 0, H * 0.45, M.mat("lacquer", "#c43c3a")); M.box(s * W * 0.41 - W * 0.09, s * W * 0.41 + W * 0.09, -D / 2, D / 2, 0, H * 0.12, M.mat("chrome", "#c9ced2")); });
  });
  itFig("i_puzzle", function (M, W, D, H, C, n) {
    var rnd = mRand((n && n.id) || 307);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 0.6 * cmF, M.mat("wood", "#8a6a4c"));
    for (var i = 0; i < 8; i++) { for (var j = 0; j < 6; j++) { if (rnd() < 0.2) { continue; } var x = -W / 2 + 2 * cmF + i * (W - 4 * cmF) / 8, y = -D / 2 + 2 * cmF + j * (D - 4 * cmF) / 6; M.box(x, x + (W - 4 * cmF) / 8 - 0.2 * cmF, y, y + (D - 4 * cmF) / 6 - 0.2 * cmF, 0.6 * cmF, H, M.mat("linen", mShade(["#3a7ca5", "#6b8f4a", "#e2c18a"][Math.floor((i + j * 0.5) / 3) % 3], (rnd() - 0.5) * 0.1))); } }
  });

  // ===================================================================== out of doors: the yard, the street ==
  // a play fort: its deck on four posts, a slide off one side, a swing beam with two swings, the ladder, a roof
  itAdd("ic_outdoor", "i_playset", 450, 300, ["o " + itR(0, 0, 180, 180, 2), "t M180 60 H450 M180 120 H450", "o " + itR(30, 180, 60, 120, 6), "k " + itR(260, 70, 40, 40, 4) + " " + itR(360, 70, 40, 40, 4)], { h: 2.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#8a6a4c", "#3f9a5a");
    var wood = M.mat("wood", C.main), P = FLOOR_PX, fx0 = -W / 2, fx1 = -W / 2 + 180 * cmI, fy0 = -D / 2, fy1 = -D / 2 + 180 * cmI, deck = 150 * cmI;
    [[fx0, fy0], [fx1, fy0], [fx1, fy1], [fx0, fy1]].forEach(function (p) { M.box(p[0] + (p[0] === fx0 ? 0 : -9 * cmI), p[0] + (p[0] === fx0 ? 9 * cmI : 0), p[1] + (p[1] === fy0 ? 0 : -9 * cmI), p[1] + (p[1] === fy0 ? 9 * cmI : 0), 0, H - 30 * cmI, wood); });
    M.box(fx0, fx1, fy0, fy1, deck - 4 * cmI, deck, wood);
    M.prism([[fx0 - 10 * cmI, fy0 - 10 * cmI], [fx1 + 10 * cmI, fy0 - 10 * cmI], [fx1 + 10 * cmI, (fy0 + fy1) / 2], [fx0 - 10 * cmI, (fy0 + fy1) / 2]], H - 30 * cmI, H - 26 * cmI, M.mat("fabric", C.frame));
    M.quad(M.mat("fabric", C.frame), [fx0 - 10 * cmI, fy0 - 10 * cmI, H - 30 * cmI], [fx1 + 10 * cmI, fy0 - 10 * cmI, H - 30 * cmI], [fx1 + 10 * cmI, (fy0 + fy1) / 2, H], [fx0 - 10 * cmI, (fy0 + fy1) / 2, H]);
    M.quad(M.mat("fabric", C.frame), [fx1 + 10 * cmI, fy1 + 10 * cmI, H - 30 * cmI], [fx0 - 10 * cmI, fy1 + 10 * cmI, H - 30 * cmI], [fx0 - 10 * cmI, (fy0 + fy1) / 2, H], [fx1 + 10 * cmI, (fy0 + fy1) / 2, H]);
    M.quad(M.mat("plastic", "#f2c94c"), [fx0 + 40 * cmI, fy1, deck], [fx0 + 100 * cmI, fy1, deck], [fx0 + 100 * cmI, D / 2, 10 * cmI], [fx0 + 40 * cmI, D / 2, 10 * cmI]);
    [fx0 + 40 * cmI, fx0 + 100 * cmI].forEach(function (x) { M.quad(M.mat("plastic", "#f2c94c"), [x, fy1, deck + 30 * cmI], [x, fy1, deck], [x, D / 2, 10 * cmI], [x, D / 2, 30 * cmI]); });
    for (var r = 0; r < 5; r++) { M.box(fx1 - 60 * cmI, fx1 - 10 * cmI, fy1 + 10 * cmI, fy1 + 14 * cmI, r * 30 * cmI + 25 * cmI, r * 30 * cmI + 29 * cmI, wood); }
    M.box(fx1, W / 2, -D / 2 + 85 * cmI, -D / 2 + 95 * cmI, H - 40 * cmI, H - 30 * cmI, wood);
    M.tube([W / 2 - 10 * cmI, -D / 2 + 90 * cmI, H - 35 * cmI], [W / 2 - 10 * cmI, -D / 2 + 10 * cmI, 0], 5 * cmI, wood, 6);
    M.tube([W / 2 - 10 * cmI, -D / 2 + 90 * cmI, H - 35 * cmI], [W / 2 - 10 * cmI, -D / 2 + 170 * cmI, 0], 5 * cmI, wood, 6);
    [fx1 + 100 * cmI, fx1 + 200 * cmI].forEach(function (x) {
      [-1, 1].forEach(function (s) { M.tube([x + s * 20 * cmI, -D / 2 + 90 * cmI, H - 40 * cmI], [x + s * 20 * cmI, -D / 2 + 90 * cmI, 45 * cmI], 0.5 * cmI, M.mat("metal", "#5d6166"), 4); });
      M.box(x - 24 * cmI, x + 24 * cmI, -D / 2 + 82 * cmI, -D / 2 + 98 * cmI, 42 * cmI, 46 * cmI, M.mat("plastic", "#2f6fae"));
    });
  });
  // a slide on its own: the ladder up, the platform, the slide down
  itAdd("ic_outdoor", "i_playslide", 100, 300, ["o " + itR(20, 0, 60, 60, 4), "o " + itR(25, 60, 50, 240, 8), "t M30 300 V60 M70 300 V60"], { h: 1.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#e2731f", "#3f6b8f");
    var frame = M.mat("metal", C.frame), slide = M.mat("plastic", C.main), top = 140 * cmI;
    [-1, 1].forEach(function (s) { M.tube([s * 25 * cmI, -D / 2, 0], [s * 25 * cmI, -D / 2 + 50 * cmI, top], 2.5 * cmI, frame, 8); M.tube([s * 25 * cmI, -D / 2 + 60 * cmI, 0], [s * 25 * cmI, -D / 2 + 60 * cmI, H], 2.5 * cmI, frame, 8); });
    for (var r = 1; r < 6; r++) { M.tube([-25 * cmI, -D / 2 + r * 10 * cmI, r * top / 6], [25 * cmI, -D / 2 + r * 10 * cmI, r * top / 6], 1.6 * cmI, frame, 6); }
    M.box(-28 * cmI, 28 * cmI, -D / 2 + 45 * cmI, -D / 2 + 62 * cmI, top - 4 * cmI, top, frame);
    M.quad(slide, [-22 * cmI, -D / 2 + 62 * cmI, top], [22 * cmI, -D / 2 + 62 * cmI, top], [22 * cmI, D / 2, 25 * cmI], [-22 * cmI, D / 2, 25 * cmI]);
    [-1, 1].forEach(function (s) { M.quad(slide, [s * 22 * cmI, -D / 2 + 62 * cmI, top + 18 * cmI], [s * 22 * cmI, -D / 2 + 62 * cmI, top], [s * 22 * cmI, D / 2, 25 * cmI], [s * 22 * cmI, D / 2, 40 * cmI]); });
  });
  // a seesaw: the plank on its pivot, handles, seats
  itAdd("ic_outdoor", "i_seesaw", 300, 40, ["o " + itR(0, 12, 300, 16, 6), "k " + itR(140, 0, 20, 40, 4)], { h: 0.7 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#2f6fae");
    M.prism([[-20 * cmI, -18 * cmI], [20 * cmI, -18 * cmI], [8 * cmI, 18 * cmI], [-8 * cmI, 18 * cmI]], 0, 45 * cmI, M.mat("metal", C.frame));
    M.push().move(0, 0, 50 * cmI).tiltY(8);
    M.box(-W / 2, W / 2, -12 * cmI, 12 * cmI, -3 * cmI, 3 * cmI, M.mat("wood", "#c9a273"));
    [-1, 1].forEach(function (s) {
      M.box(s * (W / 2 - 25 * cmI) - 18 * cmI, s * (W / 2 - 25 * cmI) + 18 * cmI, -15 * cmI, 15 * cmI, 3 * cmI, 7 * cmI, M.mat("plastic", C.main), 2 * cmI);
      M.tube([s * (W / 2 - 50 * cmI), -12 * cmI, 3 * cmI], [s * (W / 2 - 50 * cmI), -12 * cmI, 28 * cmI], 1.5 * cmI, M.mat("metal", C.frame), 6);
      M.tube([s * (W / 2 - 50 * cmI), 12 * cmI, 3 * cmI], [s * (W / 2 - 50 * cmI), 12 * cmI, 28 * cmI], 1.5 * cmI, M.mat("metal", C.frame), 6);
      M.tube([s * (W / 2 - 50 * cmI), -12 * cmI, 28 * cmI], [s * (W / 2 - 50 * cmI), 12 * cmI, 28 * cmI], 1.8 * cmI, M.mat("plastic", "#1f2226"), 6);
    });
    M.pop();
  });
  // a sandbox: its timber edge, the sand, a bucket and spade
  itAdd("ic_outdoor", "i_sandbox", 200, 200, ["o " + itR(0, 0, 200, 200, 4), "t " + itR(12, 12, 176, 176, 2)], { h: 0.3 }, function (M, W, D, H) {
    var wood = M.mat("wood", "#a57a52");
    [[-W / 2, -D / 2, W / 2, -D / 2 + 12 * cmI], [-W / 2, D / 2 - 12 * cmI, W / 2, D / 2], [-W / 2, -D / 2, -W / 2 + 12 * cmI, D / 2], [W / 2 - 12 * cmI, -D / 2, W / 2, D / 2]].forEach(function (b) { M.box(b[0], b[2], b[1], b[3], 0, H, wood, 1 * cmI); });
    M.box(-W / 2 + 12 * cmI, W / 2 - 12 * cmI, -D / 2 + 12 * cmI, D / 2 - 12 * cmI, 0, H - 8 * cmI, M.mat("soil", "#e6d3a3"));
    M.lathe(30 * cmI, 20 * cmI, [[7 * cmI, H - 8 * cmI], [10 * cmI, H + 8 * cmI]], M.mat("plastic", "#c43c3a"), { seg: 14, top: false });
    M.ball(-40 * cmI, -30 * cmI, H - 5 * cmI, 30 * cmI, 25 * cmI, 10 * cmI, M.mat("soil", "#d9c290"), { seg: 8, lat0: 0 });
  });
  // a picnic table: its top and the two benches on the A-frames
  itAdd("ic_outdoor", "i_picnic", 180, 150, ["o " + itR(0, 0, 180, 30, 3) + " " + itR(0, 120, 180, 30, 3), "o " + itR(0, 45, 180, 60, 3)], { h: 0.76 }, function (M, W, D, H, C) {
    C = mPick(C, "#a57a52");
    var wood = M.mat("wood", C.main);
    for (var i = 0; i < 4; i++) { M.box(-W / 2, W / 2, -32 * cmI + i * 16 * cmI, -18 * cmI + i * 16 * cmI, H - 4 * cmI, H, wood); }
    [-1, 1].forEach(function (s) {
      M.box(-W / 2, W / 2, s * (D / 2 - 15 * cmI) - 13 * cmI, s * (D / 2 - 15 * cmI) + 13 * cmI, 42 * cmI, 46 * cmI, wood);
      [-1, 1].forEach(function (e) {
        var x = e * (W / 2 - 25 * cmI);
        M.tube([x, s * (D / 2 - 5 * cmI), 0], [x, s * 5 * cmI, H - 4 * cmI], 4 * cmI, wood, 4);
      });
    });
    [-1, 1].forEach(function (e) { M.box(e * (W / 2 - 25 * cmI) - 4 * cmI, e * (W / 2 - 25 * cmI) + 4 * cmI, -D / 2 + 5 * cmI, D / 2 - 5 * cmI, 38 * cmI, 42 * cmI, wood); });
  });
  // a patio umbrella: its base, the pole, the canopy of panels
  itAdd("ic_outdoor", "i_umbrella", 270, 270, ["o " + itC(135, 135, 133), "t M135 2 V268 M2 135 H268 M40 40 L230 230 M230 40 L40 230", "k " + itC(135, 135, 8)], { h: 2.5 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#2a2c2e");
    var R = Math.min(W, D) / 2 - 2 * cmI, n = 8;
    M.cyl(0, 0, 0, 8 * cmI, 25 * cmI, M.mat("stone", "#5d6166"), { seg: 16 });
    M.cyl(0, 0, 8 * cmI, H, 2 * cmI, M.mat("metal", C.frame), { seg: 8 });
    for (var i = 0; i < n; i++) {
      var a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
      M.tri(M.mat("fabric", C.main), [0, 0, H], [Math.cos(a0) * R, Math.sin(a0) * R, H - 45 * cmI], [Math.cos(a1) * R, Math.sin(a1) * R, H - 45 * cmI], [0, 0, 1], [0, 0, 1], [0, 0, 1]);
      M.tri(M.mat("fabric", C.main), [0, 0, H - 1 * cmI], [Math.cos(a1) * R, Math.sin(a1) * R, H - 46 * cmI], [Math.cos(a0) * R, Math.sin(a0) * R, H - 46 * cmI], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
      M.tube([0, 0, H - 30 * cmI], [Math.cos(a0) * R * 0.6, Math.sin(a0) * R * 0.6, H - 28 * cmI], 0.6 * cmI, M.mat("metal", C.frame), 4);
    }
  });
  // a fire hydrant: red, its caps and the bonnet
  itAdd("ic_outdoor", "i_firehydrant", 40, 40, ["o " + itC(20, 20, 12), "k " + itC(20, 20, 5), "t M4 20 H36"], { h: 0.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#c9ced2");
    var red = M.mat("lacquer", C.main);
    M.cyl(0, 0, 0, 6 * cmI, 14 * cmI, red, { seg: 14 });
    M.cyl(0, 0, 6 * cmI, H - 18 * cmI, 10 * cmI, red, { seg: 14 });
    M.lathe(0, 0, [[12 * cmI, H - 18 * cmI], [12 * cmI, H - 14 * cmI], [8 * cmI, H - 4 * cmI], [3 * cmI, H - 2 * cmI]], red, { seg: 14, top: true });
    M.cyl(0, 0, H - 2 * cmI, H, 2.5 * cmI, M.mat("metal", "#5d6166"), { seg: 5 });
    [-1, 1].forEach(function (s) { M.push().move(s * 10 * cmI, 0, H - 32 * cmI).tiltY(90); M.cyl(0, 0, -5 * cmI, 5 * cmI, 4 * cmI, M.mat("lacquer", C.frame), { seg: 10, bottom: true }); M.pop(); });
    M.push().move(0, 10 * cmI, H - 36 * cmI).tiltX(-90); M.cyl(0, 0, 0, 6 * cmI, 6 * cmI, M.mat("lacquer", C.frame), { seg: 12 }); M.pop();
  });
  // a bollard: steel, its reflective band
  itAdd("ic_outdoor", "i_bollard", 25, 25, ["o " + itC(12.5, 12.5, 11), "k " + itC(12.5, 12.5, 4)], { h: 0.9 }, function (M, W, D, H, C) {
    C = mPick(C, "#2a2c2e", "#f2c94c");
    var r = Math.min(W, D) / 2 - 1 * cmI;
    M.lathe(0, 0, [[r, 0], [r, H - 6 * cmI], [r * 0.7, H - 2 * cmI], [0.1, H]], M.mat("metal", C.main), { seg: 16 });
    M.cyl(0, 0, H - 22 * cmI, H - 14 * cmI, r + 0.2 * cmI, M.mat("glow", C.frame), { seg: 16, top: false });
  });
  // a stop sign on its post
  itAdd("ic_outdoor", "i_stopsign", 60, 10, ["o M20 0 H40 L60 3 V7 L40 10 H20 L0 7 V3 Z", "k " + itC(30, 5, 3)], { h: 2.4 }, function (M, W, D, H) {
    M.cyl(0, 0, 0, H - 40 * cmI, 3 * cmI, M.mat("metal", "#9aa0a5"), { seg: 8 });
    var pts = [];
    for (var i = 0; i < 8; i++) { var a = (i + 0.5) / 8 * Math.PI * 2; pts.push([Math.cos(a) * 38 * cmI, H - 38 * cmI + Math.sin(a) * 38 * cmI]); }
    M.push().move(0, 3 * cmI, 0).tiltX(90);
    M.prism(pts, 0, 1 * cmI, M.mat("lacquer", "#c8202a"));
    M.prism(pts.map(function (p) { return [p[0] * 0.9, H - 38 * cmI + (p[1] - (H - 38 * cmI)) * 0.9]; }), -0.2 * cmI, 0, M.mat("lacquer", "#f4f4f1"));
    M.prism(pts.map(function (p) { return [p[0] * 0.84, H - 38 * cmI + (p[1] - (H - 38 * cmI)) * 0.84]; }), -0.4 * cmI, -0.2 * cmI, M.mat("lacquer", "#c8202a"));
    M.pop();
    M.box(-22 * cmI, 22 * cmI, 3.6 * cmI, 3.9 * cmI, H - 44 * cmI, H - 32 * cmI, M.mat("lacquer", "#f4f4f1"));
  });
  // a newspaper box: its window, the coin slot, papers inside
  itAdd("ic_outdoor", "i_newsbox", 50, 45, ["o " + itR(0, 0, 50, 45, 3), "t " + itR(6, 30, 38, 12, 2)], { h: 1.1 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f6fae", "#f4f4f1");
    var body = M.mat("lacquer", C.main);
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 4 * cmI, 0, 40 * cmI, 1.5 * cmI, M.mat("metal", "#3a3d40"), false);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 40 * cmI, H, body, 2 * cmI);
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, D / 2, D / 2 + 0.4 * cmI, 62 * cmI, H - 8 * cmI, M.mat("glass", "#dfeef2"));
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, D / 2 - 2 * cmI, D / 2 - 0.5 * cmI, 64 * cmI, H - 12 * cmI, M.mat("linen", C.frame));
    M.box(W / 2 - 12 * cmI, W / 2 - 6 * cmI, D / 2 - 6 * cmI, D / 2 - 2 * cmI, H, H + 4 * cmI, M.mat("chrome", "#c9ced2"));
  });
  // a bus shelter: its glass sides and back on posts, the roof, the bench, the timetable lit, a stop sign
  itAdd("ic_outdoor", "i_busstop", 400, 150, ["o " + itR(0, 0, 400, 150, 3), "t M10 10 H390 M10 10 V140 M390 10 V140", "k " + itR(20, 20, 200, 30, 2)], { h: 2.6 }, function (M, W, D, H, C) {
    C = mPick(C, "#3a3d40", "#2f6fae");
    var frame = M.mat("metal", C.main), glass = M.mat("glass", "#dbe8ee");
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.box(s[0] * (W / 2 - 6 * cmI) - 3 * cmI, s[0] * (W / 2 - 6 * cmI) + 3 * cmI, s[1] * (D / 2 - 10 * cmI) - 3 * cmI, s[1] * (D / 2 - 10 * cmI) + 3 * cmI, 0, H - 10 * cmI, frame); });
    M.box(-W / 2 + 6 * cmI, W / 2 - 6 * cmI, -D / 2 + 9 * cmI, -D / 2 + 11 * cmI, 15 * cmI, H - 15 * cmI, glass);
    [-1, 1].forEach(function (s) { M.box(s * (W / 2 - 6 * cmI) - 1 * cmI, s * (W / 2 - 6 * cmI) + 1 * cmI, -D / 2 + 10 * cmI, D / 2 - 30 * cmI, 15 * cmI, H - 15 * cmI, glass); });
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 10 * cmI, H, frame, 2 * cmI);
    M.box(-W / 2 + 40 * cmI, -W / 2 + 220 * cmI, -D / 2 + 15 * cmI, -D / 2 + 50 * cmI, 42 * cmI, 46 * cmI, M.mat("wood", "#8a6a4c"));
    mLegs(M, -W / 2 + 40 * cmI, -W / 2 + 220 * cmI, -D / 2 + 15 * cmI, -D / 2 + 50 * cmI, 10 * cmI, 0, 42 * cmI, 2 * cmI, frame, false);
    M.box(W / 2 - 120 * cmI, W / 2 - 30 * cmI, -D / 2 + 11 * cmI, -D / 2 + 13 * cmI, 70 * cmI, 190 * cmI, M.mat("glow", "#f4f6f7"));
    M.cyl(W / 2 + 20 * cmI, D / 2 - 10 * cmI, 0, H + 20 * cmI, 2.5 * cmI, M.mat("metal", "#9aa0a5"), { seg: 8 });
    M.cyl(W / 2 + 20 * cmI, D / 2 - 10 * cmI, H, H + 2 * cmI, 22 * cmI, M.mat("lacquer", C.frame), { seg: 20 });
  });
  // a statue on its plinth: a figure in bronze, stepped stone under it
  itAdd("ic_outdoor", "i_statue", 100, 100, ["o " + itR(0, 0, 100, 100, 2), "t " + itR(15, 15, 70, 70, 2), "k " + itC(50, 50, 12)], { h: 2.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#d6cdbd", "#6b5a3a");
    var stone = M.mat("stone", C.main), bronze = M.mat("brass", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 20 * cmI, stone, 1 * cmI);
    M.box(-W / 2 + 15 * cmI, W / 2 - 15 * cmI, -D / 2 + 15 * cmI, D / 2 - 15 * cmI, 20 * cmI, 110 * cmI, stone, 1 * cmI);
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 110 * cmI, 120 * cmI, stone, 1 * cmI);
    var z = 120 * cmI, s = (H - z) / (180 * cmI);
    [-1, 1].forEach(function (k) { M.tube([k * 8 * cmI * s, 0, z], [k * 9 * cmI * s, 2 * cmI, z + 85 * cmI * s], 6 * cmI * s, bronze, 8); });
    M.lathe(0, 0, [[14 * cmI * s, z + 85 * cmI * s], [17 * cmI * s, z + 110 * cmI * s], [20 * cmI * s, z + 145 * cmI * s], [8 * cmI * s, z + 152 * cmI * s]], bronze, { seg: 12, ry: 0.65 });
    M.tube([-19 * cmI * s, 0, z + 145 * cmI * s], [-24 * cmI * s, 6 * cmI * s, z + 100 * cmI * s], 4 * cmI * s, bronze, 6);
    M.tube([19 * cmI * s, 0, z + 145 * cmI * s], [26 * cmI * s, 10 * cmI * s, z + 185 * cmI * s], 4 * cmI * s, bronze, 6);
    M.ball(0, 0, z + 165 * cmI * s, 10 * cmI * s, 11 * cmI * s, 13 * cmI * s, bronze, { seg: 10 });
  });
  // a flagpole: its base, the tall pole, the flag flying from it
  itAdd("ic_outdoor", "i_flagpole", 40, 40, ["o " + itC(20, 20, 18), "k " + itC(20, 20, 4)], { h: 7.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#1f5fa8", "#c9ced2");
    M.cyl(0, 0, 0, 25 * cmI, 18 * cmI, M.mat("stone", "#b9b1a3"), { seg: 14 });
    M.cyl(0, 0, 25 * cmI, H, 5 * cmI, M.mat("chrome", C.frame), { seg: 10, r1: 3 * cmI });
    M.ball(0, 0, H + 3 * cmI, 6 * cmI, 6 * cmI, 6 * cmI, M.mat("brass", "#c9a24a"), { seg: 8 });
    var fw = 180 * cmI, fh = 110 * cmI;
    for (var i = 0; i < 8; i++) {
      var x0 = 4 * cmI + i * fw / 8, x1 = x0 + fw / 8, y0 = Math.sin(i * 0.8) * 8 * cmI, y1 = Math.sin((i + 1) * 0.8) * 8 * cmI;
      [[0, fh / 2, C.main], [fh / 2, fh, "#f4f4f1"]].forEach(function (b) {
        M.quad(M.mat("fabric", b[2]), [x0, y0, H - 15 * cmI - fh + b[0]], [x1, y1, H - 15 * cmI - fh + b[0]], [x1, y1, H - 15 * cmI - fh + b[1]], [x0, y0, H - 15 * cmI - fh + b[1]]);
        M.quad(M.mat("fabric", b[2]), [x1, y1, H - 15 * cmI - fh + b[0]], [x0, y0, H - 15 * cmI - fh + b[0]], [x0, y0, H - 15 * cmI - fh + b[1]], [x1, y1, H - 15 * cmI - fh + b[1]]);
      });
    }
  });
  // a compost bin: slatted wood, its lid hinged, scraps showing
  itAdd("ic_outdoor", "i_compost", 80, 80, ["o " + itR(0, 0, 80, 80, 2), "t " + itRows(0, 0, 80, 80, 13, true)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#7a5236");
    var wood = M.mat("wood", C.main);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.box(s[0] * W / 2 - (s[0] > 0 ? 5 * cmI : 0), s[0] * W / 2 + (s[0] < 0 ? 5 * cmI : 0), s[1] * D / 2 - (s[1] > 0 ? 5 * cmI : 0), s[1] * D / 2 + (s[1] < 0 ? 5 * cmI : 0), 0, H - 5 * cmI, wood); });
    for (var z = 4 * cmI; z < H - 10 * cmI; z += 13 * cmI) {
      [-1, 1].forEach(function (s) { M.box(-W / 2, W / 2, s * D / 2 - 1.5 * cmI, s * D / 2 + 1.5 * cmI, z, z + 10 * cmI, wood); M.box(s * W / 2 - 1.5 * cmI, s * W / 2 + 1.5 * cmI, -D / 2, D / 2, z, z + 10 * cmI, wood); });
    }
    M.box(-W / 2 + 3 * cmI, W / 2 - 3 * cmI, -D / 2 + 3 * cmI, D / 2 - 3 * cmI, 0, H * 0.6, M.mat("soil", "#4b3a2b"));
    M.push().move(0, -D / 2, H - 5 * cmI).tiltX(55);
    M.box(-W / 2, W / 2, 0, D, 0, 3 * cmI, wood);
    M.pop();
  });
  // a rain barrel: its staves and hoops, the tap, the downpipe into it
  itAdd("ic_outdoor", "i_rainbarrel", 60, 60, ["o " + itC(30, 30, 28), "t " + itC(30, 30, 20), "k " + itC(30, 4, 4)], { h: 1.0 }, function (M, W, D, H) {
    var r = Math.min(W, D) / 2 - 1 * cmI;
    M.lathe(0, 0, [[r * 0.88, 0], [r, H * 0.5], [r * 0.88, H - 8 * cmI]], M.mat("wood", "#7a5236"), { seg: 18, top: false });
    M.disc(0, 0, H - 12 * cmI, r * 0.86, r * 0.86, M.mat("water", "#5f8fa8"), 18);
    [0.12, 0.5, 0.85].forEach(function (k) { var rr = k === 0.5 ? r : r * 0.92; M.cyl(0, 0, H * k - 1 * cmI, H * k + 2 * cmI, rr + 0.4 * cmI, M.mat("metal", "#3a3d40"), { seg: 18, top: false }); });
    M.cyl(0, 0, H - 8 * cmI, H - 6 * cmI, r * 0.9, M.mat("metal", "#3a3d40"), { seg: 18, top: false });
    M.tube([0, r, 15 * cmI], [0, r + 6 * cmI, 15 * cmI], 1.5 * cmI, M.mat("brass", "#c9a24a"), 6);
    M.cyl(-r * 0.3, -r * 0.3, H - 10 * cmI, H + 40 * cmI, 4 * cmI, M.mat("metal", "#7a7f84"), { seg: 10 });
  });
  // a greenhouse: its aluminium frame and glass, a pitched roof, staging and pots inside
  itAdd("ic_outdoor", "i_greenhouse", 300, 250, function (w, h) { return ["o " + itR(0, 0, w, h, 2), "t M0 " + itN(h / 2) + " H" + itN(w), "t " + itRows(0, 0, w, h, 60, false), "t- " + itR(w / 2 - 40, h - 4, 80, 4, 0)]; }, { h: 2.6 }, function (M, W, D, H, C, n) {
    C = mPick(C, "#c9ced2");
    var al = M.mat("chrome", C.main), glass = M.mat("glass", "#e2eff2"), eave = H - 70 * cmI, rnd = mRand((n && n.id) || 241);
    itGlassBox(M, -W / 2, W / 2, -D / 2, D / 2, 0, eave);
    M.quad(glass, [-W / 2, -D / 2, eave], [W / 2, -D / 2, eave], [W / 2, 0, H], [-W / 2, 0, H]);
    M.quad(glass, [W / 2, D / 2, eave], [-W / 2, D / 2, eave], [-W / 2, 0, H], [W / 2, 0, H]);
    [-1, 1].forEach(function (s) { M.tri(glass, [s * W / 2, -s * D / 2, eave], [s * W / 2, s * D / 2, eave], [s * W / 2, 0, H], [s, 0, 0], [s, 0, 0], [s, 0, 0]); });
    for (var x = -W / 2; x <= W / 2 + 1; x += W / 5) {
      [-1, 1].forEach(function (s) { M.box(x - 1 * cmI, x + 1 * cmI, s * D / 2 - 1 * cmI, s * D / 2 + 1 * cmI, 0, eave, al); M.tube([x, s * D / 2, eave], [x, 0, H], 1 * cmI, al, 4); });
    }
    M.tube([-W / 2, 0, H], [W / 2, 0, H], 1.5 * cmI, al, 4);
    [-1, 1].forEach(function (s) {
      M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, s * (D / 2 - 35 * cmI) - 25 * cmI, s * (D / 2 - 35 * cmI) + 25 * cmI, 75 * cmI, 78 * cmI, M.mat("wood", "#a57a52"));
      mLegs(M, -W / 2 + 10 * cmI, W / 2 - 10 * cmI, s * (D / 2 - 35 * cmI) - 25 * cmI, s * (D / 2 - 35 * cmI) + 25 * cmI, 3 * cmI, 0, 75 * cmI, 2 * cmI, M.mat("wood", "#a57a52"), false);
      for (var px = -W / 2 + 25 * cmI; px < W / 2 - 20 * cmI; px += 25 * cmI) {
        M.push().move(px, s * (D / 2 - 35 * cmI), 78 * cmI);
        var top = mPot(M, 0, 0, 7 * cmI, 12 * cmI, M.mat("ceramic", "#b4573a"));
        mLeaves(M, 0, 0, top + 7 * cmI, 8 * cmI, rnd() < 0.3 ? "#c8352e" : "#4f7d3a", rnd, 2);
        M.pop();
      }
    });
  });
  // a chicken coop: the house on legs, its ramp, the run of wire beside it
  itAdd("ic_outdoor", "i_chickencoop", 180, 120, ["o " + itR(0, 0, 90, 120, 3), "t " + itR(90, 0, 90, 120, 2), "t- M90 0 V120"], { h: 1.6 }, function (M, W, D, H, C) {
    C = mPick(C, "#b4573a", "#efe7d6");
    var wood = M.mat("wood", C.main), x1 = -W / 2 + 90 * cmI;
    mLegs(M, -W / 2, x1, -D / 2, D / 2, 4 * cmI, 0, 50 * cmI, 3 * cmI, M.mat("wood", "#7a5236"), false);
    M.box(-W / 2, x1, -D / 2, D / 2, 50 * cmI, 120 * cmI, wood);
    M.quad(M.mat("wood", "#5d3c25"), [-W / 2 - 5 * cmI, -D / 2 - 5 * cmI, 120 * cmI], [x1 + 5 * cmI, -D / 2 - 5 * cmI, 120 * cmI], [x1 + 5 * cmI, 0, H], [-W / 2 - 5 * cmI, 0, H]);
    M.quad(M.mat("wood", "#5d3c25"), [x1 + 5 * cmI, D / 2 + 5 * cmI, 120 * cmI], [-W / 2 - 5 * cmI, D / 2 + 5 * cmI, 120 * cmI], [-W / 2 - 5 * cmI, 0, H], [x1 + 5 * cmI, 0, H]);
    M.box(x1 - 0.5 * cmI, x1, -15 * cmI, 15 * cmI, 55 * cmI, 85 * cmI, M.mat("plastic", "#2a2c2e"));
    M.quad(wood, [x1, -12 * cmI, 55 * cmI], [x1, 12 * cmI, 55 * cmI], [x1 + 50 * cmI, 12 * cmI, 0], [x1 + 50 * cmI, -12 * cmI, 0]);
    var wire = M.mat("shade", "#cfd4d8");
    M.box(x1, W / 2, -D / 2, -D / 2 + 1 * cmI, 0, 100 * cmI, wire); M.box(x1, W / 2, D / 2 - 1 * cmI, D / 2, 0, 100 * cmI, wire);
    M.box(W / 2 - 1 * cmI, W / 2, -D / 2, D / 2, 0, 100 * cmI, wire); M.box(x1, W / 2, -D / 2, D / 2, 99 * cmI, 100 * cmI, wire);
    [[x1 + 30 * cmI, 20 * cmI], [x1 + 60 * cmI, -25 * cmI]].forEach(function (p) {
      M.ball(p[0], p[1], 18 * cmI, 12 * cmI, 8 * cmI, 10 * cmI, M.mat("fabric", C.frame), { seg: 6 });
      M.ball(p[0] + 9 * cmI, p[1], 30 * cmI, 5 * cmI, 4 * cmI, 6 * cmI, M.mat("fabric", C.frame), { seg: 6 });
      M.box(p[0] + 8 * cmI, p[0] + 10 * cmI, p[1] - 1 * cmI, p[1] + 1 * cmI, 35 * cmI, 39 * cmI, M.mat("fabric", "#c8202a"));
    });
  });
  // a doghouse: its walls, the arched door, a pitched roof, a bowl
  itAdd("ic_outdoor", "i_doghouse", 90, 110, ["o " + itR(0, 0, 90, 110, 2), "k M30 110 V90 Q45 76 60 90 V110 Z", "t M45 0 V110"], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#efe7d6");
    var wall = M.mat("wood", C.main), eave = H * 0.6;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, eave, wall);
    M.box(-16 * cmI, 16 * cmI, D / 2, D / 2 + 0.4 * cmI, 0, 40 * cmI, M.mat("plastic", "#1f2226"));
    M.quad(M.mat("lacquer", C.frame), [-W / 2 - 6 * cmI, -D / 2 - 6 * cmI, eave], [-W / 2 - 6 * cmI, D / 2 + 6 * cmI, eave], [0, D / 2 + 6 * cmI, H], [0, -D / 2 - 6 * cmI, H]);
    M.quad(M.mat("lacquer", C.frame), [W / 2 + 6 * cmI, D / 2 + 6 * cmI, eave], [W / 2 + 6 * cmI, -D / 2 - 6 * cmI, eave], [0, -D / 2 - 6 * cmI, H], [0, D / 2 + 6 * cmI, H]);
    [-1, 1].forEach(function (s) { M.tri(wall, [-W / 2, s * D / 2, eave], [W / 2, s * D / 2, eave], [0, s * D / 2, H - 2 * cmI], [0, s, 0], [0, s, 0], [0, s, 0]); });
    M.lathe(W / 2 - 15 * cmI, D / 2 + 25 * cmI, [[7 * cmI, 0], [9 * cmI, 6 * cmI]], M.mat("metal", "#9aa0a5"), { seg: 14, top: false });
  });
  // a hammock on its stand: the curved steel frame, the hammock slung, a cushion
  itAdd("ic_outdoor", "i_hammock", 350, 120, ["o M10 60 Q175 140 340 60", "t M10 60 H340", "k " + itR(0, 50, 20, 20, 3) + " " + itR(330, 50, 20, 20, 3)], { h: 1.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#efe7d6", "#3a3d40");
    var frame = M.mat("metal", C.frame), cloth = M.mat("fabric", C.main);
    M.tube([-W / 2 + 5 * cmI, 0, 5 * cmI], [W / 2 - 5 * cmI, 0, 5 * cmI], 3 * cmI, frame, 8);
    [-1, 1].forEach(function (s) {
      M.tube([s * (W / 2 - 5 * cmI), 0, 5 * cmI], [s * (W / 2 - 20 * cmI), 0, H], 3 * cmI, frame, 8);
      M.tube([s * (W / 2 - 40 * cmI), -D / 2 + 10 * cmI, 2 * cmI], [s * (W / 2 - 40 * cmI), D / 2 - 10 * cmI, 2 * cmI], 3 * cmI, frame, 8);
    });
    for (var k = 0; k < 8; k++) {
      var t0 = k / 8, t1 = (k + 1) / 8, x0 = -W / 2 + 40 * cmI + t0 * (W - 80 * cmI), x1 = -W / 2 + 40 * cmI + t1 * (W - 80 * cmI);
      var z0 = 45 * cmI + 40 * cmI * Math.pow(2 * t0 - 1, 2), z1 = 45 * cmI + 40 * cmI * Math.pow(2 * t1 - 1, 2), wd = 55 * cmI * Math.sin(Math.PI * (t0 + t1) / 2) + 5 * cmI;
      M.quad(cloth, [x0, -wd, z0], [x1, -wd, z1], [x1, wd, z1], [x0, wd, z0]);
      M.quad(cloth, [x1, -wd, z1], [x0, -wd, z0], [x0, wd, z0], [x1, wd, z1]);
    }
    [-1, 1].forEach(function (s) { M.tube([s * (W / 2 - 40 * cmI), 0, 85 * cmI], [s * (W / 2 - 20 * cmI), 0, H], 0.6 * cmI, M.mat("fabric", "#8a6a4c"), 4); });
    M.box(-W / 2 + 60 * cmI, -W / 2 + 100 * cmI, -20 * cmI, 20 * cmI, 70 * cmI, 80 * cmI, M.mat("fabric", "#c43c3a"), 4 * cmI);
  });
  // a tent pitched for camping: its dome over two poles, the door zipped half open, guy lines
  itAdd("ic_outdoor", "i_tent", 250, 220, ["o " + itR(20, 20, 210, 180, 60), "t M20 20 L230 200 M230 20 L20 200", "k M110 200 L125 150 L140 200"], { h: 1.4 }, function (M, W, D, H, C) {
    C = mPick(C, "#3f7d4a", "#e2731f");
    var R = Math.min(W, D) / 2 - 15 * cmI;
    M.lathe(0, 0, [[R * 1.05, 0], [R, H * 0.3], [R * 0.82, H * 0.65], [R * 0.45, H * 0.92], [0.1, H]], M.mat("fabric", C.main), { seg: 16, ry: (D - 30 * cmI) / (W - 30 * cmI) });
    [-1, 1].forEach(function (s) {
      var pts = [];
      for (var i = 0; i <= 8; i++) { var a = i / 8 * Math.PI; pts.push([Math.cos(a) * R * 1.06 * s * 0.7, Math.cos(a) * R * 1.06 * 0.7, Math.sin(a) * H * 1.02]); }
      for (var j = 0; j < 8; j++) { M.tube(pts[j], pts[j + 1], 1 * cmI, M.mat("plastic", C.frame), 4); }
    });
    M.box(-25 * cmI, 25 * cmI, R * 0.98, R * 1.02, 0, H * 0.55, M.mat("fabric", mShade(C.main, -0.2)));
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.tube([s[0] * R * 0.6, s[1] * R * 0.55, H * 0.55], [s[0] * W / 2, s[1] * D / 2, 0], 0.3 * cmI, M.mat("fabric", "#f2c94c"), 3); });
  });
  // a wheelbarrow: its tray, the wheel in front, the handles and legs
  itAdd("ic_utility", "i_wheelbarrow", 140, 65, ["o M30 5 H110 L100 60 H40 Z", "k " + itC(130, 32, 10), "t M0 10 L30 15 M0 55 L30 50"], { h: 0.7 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f7d4f", "#2a2c2e");
    var tray = M.mat("lacquer", C.main), frame = M.mat("metal", C.frame);
    M.lathe(5 * cmI, 0, [[20 * cmI, 30 * cmI], [36 * cmI, H - 5 * cmI]], tray, { seg: 4, ry: 0.7, top: false });
    M.disc(5 * cmI, 0, 30 * cmI, 20 * cmI, 14 * cmI, tray, 4);
    itWheel(M, W / 2 - 12 * cmI, 0, 20 * cmI, 20 * cmI, 8 * cmI, M.mat("rubber", "#151515"));
    [-1, 1].forEach(function (s) {
      M.tube([W / 2 - 12 * cmI, s * 6 * cmI, 20 * cmI], [-W / 2, s * 28 * cmI, 60 * cmI], 1.6 * cmI, frame, 6);
      M.tube([-20 * cmI, s * 18 * cmI, 42 * cmI], [-24 * cmI, s * 20 * cmI, 0], 1.4 * cmI, frame, 6);
      M.tube([-W / 2, s * 28 * cmI, 60 * cmI], [-W / 2 + 14 * cmI, s * 26 * cmI, 57 * cmI], 2 * cmI, M.mat("rubber", "#1f2226"), 6);
    });
  });
  // a lawnmower: its deck, the engine, the grass bag, the handle
  itAdd("ic_utility", "i_lawnmower", 100, 55, ["o " + itR(0, 5, 50, 45, 6), "t " + itR(50, 10, 30, 35, 4), "t M80 12 L100 5 M80 43 L100 50"], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#2a2c2e");
    var deck = M.mat("lacquer", C.main), frame = M.mat("metal", C.frame), x0 = -W / 2;
    M.box(x0, x0 + 50 * cmI, -D / 2 + 5 * cmI, D / 2 - 5 * cmI, 8 * cmI, 22 * cmI, deck, 4 * cmI);
    M.cyl(x0 + 25 * cmI, 0, 22 * cmI, 38 * cmI, 12 * cmI, M.mat("metal", "#3a3d40"), { seg: 12 });
    M.cyl(x0 + 25 * cmI, 0, 38 * cmI, 42 * cmI, 8 * cmI, deck, { seg: 12 });
    [[x0 + 8 * cmI, -1], [x0 + 8 * cmI, 1], [x0 + 42 * cmI, -1], [x0 + 42 * cmI, 1]].forEach(function (p) { itWheel(M, p[0], p[1] * (D / 2 - 4 * cmI), 9 * cmI, 9 * cmI, 4 * cmI, M.mat("rubber", "#151515"), true); });
    M.box(x0 + 50 * cmI, x0 + 82 * cmI, -18 * cmI, 18 * cmI, 12 * cmI, 40 * cmI, M.mat("fabric", "#3a3d40"), 4 * cmI);
    [-1, 1].forEach(function (s) { M.tube([x0 + 45 * cmI, s * 20 * cmI, 22 * cmI], [W / 2 - 5 * cmI, s * 22 * cmI, H - 5 * cmI], 1.4 * cmI, frame, 6); });
    M.tube([W / 2 - 5 * cmI, -22 * cmI, H - 5 * cmI], [W / 2 - 5 * cmI, 22 * cmI, H - 5 * cmI], 1.8 * cmI, M.mat("rubber", "#1f2226"), 6);
  });
  // a stepladder: two legs of aluminium, its steps, the top tray
  itAdd("ic_utility", "i_ladder", 55, 70, ["o M5 5 H50 L45 65 H10 Z", "t " + itRows(8, 10, 40, 50, 12, true)], { h: 1.8 }, function (M, W, D, H) {
    var al = M.mat("chrome", "#c9ced2");
    [-1, 1].forEach(function (s) {
      M.tube([s * (W / 2 - 3 * cmI), D / 2 - 4 * cmI, 0], [s * (W / 2 - 6 * cmI), 2 * cmI, H], 2 * cmI, al, 4);
      M.tube([s * (W / 2 - 3 * cmI), -D / 2 + 4 * cmI, 0], [s * (W / 2 - 6 * cmI), -2 * cmI, H], 2 * cmI, al, 4);
    });
    for (var i = 1; i < 6; i++) {
      var t = i / 6, y = D / 2 - 4 * cmI - t * (D / 2 - 6 * cmI);
      M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, y - 6 * cmI, y + 2 * cmI, t * H - 1 * cmI, t * H + 1 * cmI, al);
    }
    M.box(-W / 2 + 4 * cmI, W / 2 - 4 * cmI, -8 * cmI, 8 * cmI, H - 2 * cmI, H, M.mat("plastic", "#e2731f"));
  });
  // a generator: its frame of tubes, the engine and tank, the panel of sockets
  itAdd("ic_utility", "i_generator", 90, 60, ["o " + itR(0, 0, 90, 60, 4), "k " + itR(60, 15, 20, 30, 2)], { h: 0.75 }, function (M, W, D, H, C) {
    C = mPick(C, "#f2b81f", "#2a2c2e");
    var frame = M.mat("metal", C.frame);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.tube([s[0] * (W / 2 - 3 * cmI), s[1] * (D / 2 - 3 * cmI), 0], [s[0] * (W / 2 - 3 * cmI), s[1] * (D / 2 - 3 * cmI), H], 1.6 * cmI, frame, 6); });
    [0, H].forEach(function (z) { [-1, 1].forEach(function (s) { M.tube([-W / 2 + 3 * cmI, s * (D / 2 - 3 * cmI), z], [W / 2 - 3 * cmI, s * (D / 2 - 3 * cmI), z], 1.6 * cmI, frame, 6); }); });
    M.box(-W / 2 + 8 * cmI, W / 2 - 25 * cmI, -D / 2 + 8 * cmI, D / 2 - 8 * cmI, 4 * cmI, H - 25 * cmI, M.mat("metal", "#3a3d40"), 3 * cmI);
    M.box(-W / 2 + 6 * cmI, W / 2 - 10 * cmI, -D / 2 + 6 * cmI, D / 2 - 6 * cmI, H - 25 * cmI, H - 6 * cmI, M.mat("lacquer", C.main), 5 * cmI);
    M.cyl(-W / 4, 0, H - 6 * cmI, H - 2 * cmI, 4 * cmI, M.mat("plastic", "#1f2226"), { seg: 12 });
    M.box(W / 2 - 24 * cmI, W / 2 - 6 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 10 * cmI, H - 28 * cmI, M.mat("plastic", "#2a2c2e"), 1 * cmI);
    [-1, 1].forEach(function (s) { M.box(W / 2 - 6 * cmI, W / 2 - 5.6 * cmI, s * 8 * cmI - 4 * cmI, s * 8 * cmI + 4 * cmI, 20 * cmI, 28 * cmI, M.mat("plastic", "#f4f4f1")); });
  });
  // a kayak on its stand: the hull, the cockpit and its rim, a paddle across it
  itAdd("ic_utility", "i_kayak", 340, 65, ["o M0 32 Q170 -10 340 32 Q170 74 0 32 Z", "t " + itR(150, 22, 60, 20, 10)], { h: 0.75 }, function (M, W, D, H, C) {
    C = mPick(C, "#e2731f", "#2a2c2e");
    var hull = M.mat("plastic", C.main);
    [-1, 1].forEach(function (s) { M.tube([s * W * 0.25, -D / 2, 0], [s * W * 0.25, 0, 45 * cmI], 2 * cmI, M.mat("wood", "#8a6a4c"), 6); M.tube([s * W * 0.25, D / 2, 0], [s * W * 0.25, 0, 45 * cmI], 2 * cmI, M.mat("wood", "#8a6a4c"), 6); });
    M.push().move(0, 0, 55 * cmI).tiltY(90);
    M.lathe(0, 0, [[0.1, -W / 2], [14 * cmI, -W * 0.3], [D * 0.48, 0], [14 * cmI, W * 0.3], [0.1, W / 2]], hull, { seg: 12, ry: 0.55 });
    M.pop();
    M.lathe(0, 0, [[28 * cmI, 64 * cmI], [30 * cmI, 66 * cmI], [26 * cmI, 66 * cmI]], M.mat("plastic", C.frame), { seg: 18, ry: 0.5 });
    M.disc(0, 0, 63 * cmI, 26 * cmI, 13 * cmI, M.mat("plastic", "#1f2226"), 16);
    M.tube([-30 * cmI, -D / 2 - 30 * cmI, 70 * cmI], [30 * cmI, D / 2 + 30 * cmI, 72 * cmI], 1.6 * cmI, M.mat("metal", "#3a3d40"), 6);
  });
  // a motorcycle: two wheels, the tank, the seat, the handlebars, the engine and its exhaust
  itAdd("ic_travel", "i_motorcycle", 210, 80, ["o M20 40 Q105 0 190 40 Q105 80 20 40 Z", "k " + itC(30, 40, 14) + " " + itC(180, 40, 14), "t M150 10 V70"], { h: 1.15 }, function (M, W, D, H, C) {
    C = mPick(C, "#c43c3a", "#1f2226");
    var paint = M.mat("lacquer", C.main), dark = M.mat("metal", C.frame), chrome = M.mat("chrome", "#c9ced2"), rub = M.mat("rubber", "#151515");
    [-W / 2 + 32 * cmI, W / 2 - 32 * cmI].forEach(function (x) {
      M.push().move(x, 0, 32 * cmI).tiltX(90);
      M.lathe(0, 0, [[26 * cmI, -6 * cmI], [32 * cmI, -4 * cmI], [32 * cmI, 4 * cmI], [26 * cmI, 6 * cmI]], rub, { seg: 22 });
      M.cyl(0, 0, -3 * cmI, 3 * cmI, 18 * cmI, chrome, { seg: 18 });
      M.pop();
    });
    M.tube([W / 2 - 32 * cmI, 0, 32 * cmI], [W / 2 - 55 * cmI, 0, 95 * cmI], 2.5 * cmI, chrome, 8);
    M.tube([-W / 2 + 32 * cmI, 0, 32 * cmI], [-10 * cmI, 0, 45 * cmI], 3 * cmI, dark, 8);
    M.box(-25 * cmI, 25 * cmI, -12 * cmI, 12 * cmI, 25 * cmI, 55 * cmI, dark, 4 * cmI);
    M.ball(25 * cmI, 0, 80 * cmI, 28 * cmI, 15 * cmI, 12 * cmI, paint, { seg: 10 });
    M.box(-45 * cmI, 0, -14 * cmI, 14 * cmI, 72 * cmI, 82 * cmI, M.mat("leather", "#1f2226"), 5 * cmI);
    M.box(-W / 2 + 25 * cmI, -40 * cmI, -12 * cmI, 12 * cmI, 70 * cmI, 76 * cmI, paint, 3 * cmI);
    M.tube([W / 2 - 55 * cmI, -38 * cmI, 102 * cmI], [W / 2 - 55 * cmI, 38 * cmI, 102 * cmI], 1.8 * cmI, chrome, 6);
    M.ball(W / 2 - 45 * cmI, 0, 88 * cmI, 9 * cmI, 9 * cmI, 9 * cmI, M.mat("glow", "#fff6e0"), { seg: 8 });
    M.tube([-5 * cmI, 14 * cmI, 30 * cmI], [-W / 2 + 15 * cmI, 18 * cmI, 38 * cmI], 4 * cmI, chrome, 10);
  });
  // a golf cart: its body and roof on four posts, the bench, two bags on the back
  itAdd("ic_travel", "i_golfcart", 240, 120, ["o " + itR(0, 0, 240, 120, 20), "t " + itR(40, 10, 150, 100, 6), "k " + itR(190, 30, 40, 60, 6)], { h: 1.8 }, function (M, W, D, H, C) {
    C = mPick(C, "#f4f4f1", "#2f6f4a");
    var body = M.mat("lacquer", C.main), rub = M.mat("rubber", "#151515");
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { itWheel(M, s[0] * (W / 2 - 35 * cmI), s[1] * (D / 2 - 10 * cmI), 22 * cmI, 22 * cmI, 16 * cmI, rub, true); });
    M.box(-W / 2 + 10 * cmI, W / 2 - 10 * cmI, -D / 2 + 18 * cmI, D / 2 - 18 * cmI, 25 * cmI, 50 * cmI, body, 8 * cmI);
    M.box(W / 2 - 60 * cmI, W / 2 - 5 * cmI, -D / 2 + 10 * cmI, D / 2 - 10 * cmI, 25 * cmI, 75 * cmI, body, 12 * cmI);
    M.box(-30 * cmI, 30 * cmI, -D / 2 + 20 * cmI, D / 2 - 20 * cmI, 50 * cmI, 65 * cmI, M.mat("leather", C.frame), 4 * cmI);
    M.box(-40 * cmI, -30 * cmI, -D / 2 + 20 * cmI, D / 2 - 20 * cmI, 65 * cmI, 105 * cmI, M.mat("leather", C.frame), 4 * cmI);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { M.cyl(s[0] > 0 ? W / 2 - 55 * cmI : -40 * cmI, s[1] * (D / 2 - 15 * cmI), 50 * cmI, H - 5 * cmI, 2 * cmI, M.mat("metal", "#3a3d40"), { seg: 6 }); });
    M.box(-W / 2 + 40 * cmI, W / 2 - 40 * cmI, -D / 2 + 5 * cmI, D / 2 - 5 * cmI, H - 6 * cmI, H, M.mat("plastic", C.frame), 4 * cmI);
    M.tube([W / 2 - 65 * cmI, 0, 75 * cmI], [W / 2 - 75 * cmI, -10 * cmI, 105 * cmI], 1.5 * cmI, M.mat("metal", "#3a3d40"), 6);
    M.cyl(W / 2 - 76 * cmI, -10 * cmI, 103 * cmI, 107 * cmI, 16 * cmI, M.mat("plastic", "#1f2226"), { seg: 14 });
    [-1, 1].forEach(function (s) { M.cyl(-W / 2 + 25 * cmI, s * 22 * cmI, 50 * cmI, 130 * cmI, 12 * cmI, M.mat("fabric", s < 0 ? "#1f3a5a" : "#8a2f2a"), { seg: 12 }); });
  });
