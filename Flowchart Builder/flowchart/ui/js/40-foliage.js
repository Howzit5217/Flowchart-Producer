// ---------------------------------------------------------------------------
//  40-foliage.js -- leaves that look like leaves: a tree's crown in clumps
//  that are not balls -- each lumpy, lit on top and dark underneath -- on
//  boughs that fork out of the trunk; firs in drooping, ragged tiers; the
//  yard's trees (i_tree) and the scenery's alike
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "updating the ugly models to all be nicer so the
  // trees and other things actually are not just balls of green")
  //
  // A clump is the round lump (GL3_BLOB: an octahedron split twice) bent in
  // and out by a few waves -- worked out from where each corner is on the
  // lump, so two faces sharing a corner move it alike and no crack opens --
  // with its corners' own ways out (smooth, not faceted), and its color at
  // each corner lighter where it faces the sky, darker under.  The leaves
  // themselves are the shader's (38-view3d-gl.js): clusters, gaps between.
  function foliageBend(p, s) {
    return 1 + 0.17 * Math.sin(p[0] * 4.3 + s) * Math.sin(p[1] * 3.7 + s * 1.3)
             + 0.11 * Math.sin(p[2] * 5.9 + s * 2.1 + p[0] * 2.0)
             + 0.07 * Math.sin((p[0] + p[1]) * 9.1 + s * 0.7 + p[2] * 3.0);
  }
  function foliageTint(c, n, inner) {
    var up = Math.max(0, n[2]), down = Math.max(0, -n[2]), k = 0.86 + 0.2 * up - 0.26 * down - 0.14 * (inner || 0);
    return [Math.min(1, c[0] * k + 0.035 * up), Math.min(1, c[1] * k + 0.025 * up), Math.min(1, Math.max(0, c[2] * (k - 0.08 * up)))];
  }
  function foliageSeed(at) { return at[0] * 0.0131 + at[1] * 0.0291 + (at[2] || 0) * 0.0071; }
  // (near the house, where it is walked past, each clump finer -- the lump
  // split once more; out in the distance as it was)
  var foliageNear = null;
  function foliageClose(at) {
    return !!foliageNear && Math.hypot(at[0] - foliageNear.x, at[1] - foliageNear.y) < foliageNear.r;
  }
  if (typeof gl3Scenery === "function") {
    var gl3SceneryFoliage = gl3Scenery;
    gl3Scenery = function () {
      var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      hand.nodes.forEach(function (n) {
        if (n.kind !== "i_room" && n.kind !== "i_lot") { return; }
        b.l = Math.min(b.l, n.x - n.w / 2); b.r = Math.max(b.r, n.x + n.w / 2); b.t = Math.min(b.t, n.y - n.h / 2); b.b = Math.max(b.b, n.y + n.h / 2);
      });
      foliageNear = b.l < Infinity ? { x: (b.l + b.r) / 2, y: (b.t + b.b) / 2, r: Math.min(Math.hypot(b.r - b.l, b.b - b.t) / 2 + 45 * FLOOR_PX, 160 * FLOOR_PX) } : null;
      try { return gl3SceneryFoliage.apply(this, arguments); } finally { foliageNear = null; }
    };
  }
  // (on land that rises and falls, 40-land.js: lifted as what it grows on is --
  // a trunk and its boughs each corner on the land under it.  Left where it
  // was made, a crown floated over its trunk where the land fell away, the
  // boughs bare under it, and sank into it where it rose -- 2026-10-04.)
  function foliageLift(at) {
    if (typeof terrScene === "undefined" || !terrScene || typeof TERR !== "object" || !TERR || !TERR.mesh) { return 0; }
    return terrLift !== null && terrLift !== undefined ? terrLift : terrMeshAt(TERR, at[0], at[1]);
  }
  function foliageClump(v, at, R, sq, c, pat, inner) {
    var s = foliageSeed(at), sqz = Math.max(0.3, sq), lz = foliageLift(at);
    (foliageClose(at) && R > FLOOR_PX * 0.5 ? foliageFine() : GL3_BLOB).forEach(function (t) {
      for (var i = 0; i < 3; i++) {
        var p = t[i], b = foliageBend(p, s);
        var n = [p[0], p[1], p[2] / sqz], l = Math.hypot(n[0], n[1], n[2]);
        n = [n[0] / l, n[1] / l, n[2] / l];
        gl3Vert(v, [at[0] + p[0] * R * b, at[1] + p[1] * R * b, at[2] + p[2] * R * b * sq + lz], n, foliageTint(c, n, inner), 1, [0, 0], pat);
      }
    });
  }
  // A tier of a fir: ragged at its edge -- long sprays and short ones by
  // turns -- drooping at their ends, and its underside in shadow.
  function foliageTier(v, at, r, z0, z1, sides, c, pat, turn) {
    var lz = foliageLift(at);
    z0 += lz; z1 += lz;
    var n2 = Math.max(10, sides * 2), droop = (z1 - z0) * 0.14, ring = [], slope = r / Math.max(1, z1 - z0);
    for (var i = 0; i < n2; i++) {
      var a = i / n2 * Math.PI * 2 + (turn || 0), long = i % 2 === 0, rr = long ? r : r * 0.68;
      ring.push({ p: [at[0] + Math.cos(a) * rr, at[1] + Math.sin(a) * rr, z0 - (long ? droop : droop * 0.2)], a: a });
    }
    var tip = [at[0], at[1], z1], under = [at[0], at[1], z0 + (z1 - z0) * 0.18];
    var dark = [c[0] * 0.6, c[1] * 0.62, c[2] * 0.64];
    for (var j = 0; j < n2; j++) {
      var A = ring[j], B = ring[(j + 1) % n2];
      var na = [Math.cos(A.a), Math.sin(A.a), slope], nb = [Math.cos(B.a), Math.sin(B.a), slope];
      var la = Math.hypot(na[0], na[1], na[2]), lb = Math.hypot(nb[0], nb[1], nb[2]);
      na = [na[0] / la, na[1] / la, na[2] / la]; nb = [nb[0] / lb, nb[1] / lb, nb[2] / lb];
      gl3Vert(v, A.p, na, foliageTint(c, na, 0.1), 1, [0, 0], pat);
      gl3Vert(v, B.p, nb, foliageTint(c, nb, 0.1), 1, [0, 0], pat);
      gl3Vert(v, tip, [0, 0, 1], foliageTint(c, [0, 0, 1]), 1, [0, 0], pat);
      gl3Vert(v, B.p, [0, 0, -1], dark, 1, [0, 0], pat);
      gl3Vert(v, A.p, [0, 0, -1], dark, 1, [0, 0], pat);
      gl3Vert(v, under, [0, 0, -1], dark, 1, [0, 0], pat);
    }
  }

  // ---- the scenery's: every lump of leaves a clump, every fir's tier ragged --------------------
  if (typeof gl3Blob === "function") {
    gl3Blob = function (v, at, R, c) { foliageClump(v, at, R, 0.85, c, PAT.leaves); };
  }
  if (typeof gl3Cone === "function") {
    gl3Cone = function (v, at, r, z0, z1, sides, c) { foliageTier(v, at, r, z0, z1, sides, c, PAT.leaves, (at[0] + at[1]) * 0.01); };
  }
  if (typeof plantBall === "function") {
    var plantBallPlain = plantBall;
    plantBall = function (v, at, R, sq, c, pat) {
      if (pat === PAT.leaves) { foliageClump(v, at, R, sq, c, pat); return; }
      return plantBallPlain.apply(this, arguments);
    };
  }
  if (typeof worldBall === "function") {
    var worldBallPlain = worldBall;
    worldBall = function (v, at, R, squash, c, pat) {
      if (pat === PAT.leaves) { foliageClump(v, at, R, squash, c, pat); return; }
      return worldBallPlain.apply(this, arguments);
    };
  }
  // A tree round about: its trunk, boughs forking out of it, a clump at the
  // end of each and a few more over the top -- or a fir, its tiers ragged.
  if (typeof gl3Tree === "function") {
    gl3Tree = function (v, at, rnd, sheetC, fir) {
      var P = FLOOR_PX, trunkH = (1.4 + rnd() * 1.4) * P, trunkR = (0.14 + rnd() * 0.08) * P;
      var bark = gl3Mix([0.42, 0.32, 0.24], sheetC, 0.1);
      var leaf = gl3Mix(fir ? [0.18, 0.4, 0.27] : [0.28 + rnd() * 0.12, 0.5 + rnd() * 0.12, 0.23], sheetC, 0.08);
      if (gl3SnowNow) { leaf = gl3Mix(leaf, [0.92, 0.94, 0.97], 0.5 * gl3SnowNow); }
      if (fir) {
        gl3Prism(v, at, trunkR, trunkR * 0.6, 0, trunkH * 0.8, 6, bark, PAT.bark);
        var w = (1.3 + rnd() * 0.7) * P, z = trunkH * 0.35, tiers = 4 + Math.floor(rnd() * 2);
        for (var t = 0; t < tiers; t++) {
          var k = t / tiers;
          foliageTier(v, at, w * (1 - k * 0.78) + 0.15 * P, z, z + w * 1.05 * (1 - k * 0.3), 7, t % 2 ? gl3Mix(leaf, [0, 0, 0], 0.06) : leaf, PAT.leaves, t * 0.7);
          z += w * 0.52 * (1 - k * 0.25);
        }
        return;
      }
      var R = (1.2 + rnd() * 0.9) * P, top = trunkH + R * 1.55;
      gl3Prism(v, at, trunkR, trunkR * 0.7, 0, trunkH + 0.3 * P, 6, bark, PAT.bark);
      var boughs = 3 + Math.floor(rnd() * 2), tips = [];
      for (var b = 0; b < boughs; b++) {
        var a = b / boughs * Math.PI * 2 + rnd() * 0.7, out = R * (0.5 + rnd() * 0.25), up = trunkH + R * (0.45 + rnd() * 0.4);
        var tip = [at[0] + Math.cos(a) * out, at[1] + Math.sin(a) * out, up];
        if (typeof worldTube === "function") { worldTube(v, [at[0], at[1], trunkH * 0.85], tip, trunkR * 0.55, trunkR * 0.25, 5, bark, PAT.bark); }
        tips.push(tip);
      }
      foliageClump(v, [at[0], at[1], trunkH + R * 0.75], R * 0.78, 0.82, leaf, PAT.leaves, 0.6);
      tips.forEach(function (tp, i) {
        foliageClump(v, [tp[0], tp[1], tp[2] + R * 0.1], R * (0.48 + rnd() * 0.12), 0.8, gl3Mix(leaf, i % 2 ? [0, 0, 0] : [1, 1, 0.8], 0.05), PAT.leaves);
      });
      foliageClump(v, [at[0] + (rnd() - 0.5) * R * 0.4, at[1] + (rnd() - 0.5) * R * 0.4, top - R * 0.38], R * 0.5, 0.8, gl3Mix(leaf, [1, 1, 0.8], 0.06), PAT.leaves);
    };
  }

  // ---- the yard's (i_tree, 40-things3d.js): made the same way, as a model ---------------------------
  // (a model's clumps finer -- the lump split once more -- and ragged: a
  // little tuft of leaves standing out of every few faces)
  var FOLIAGE_FINE = null;
  function foliageFine() {
    if (FOLIAGE_FINE) { return FOLIAGE_FINE; }
    function unit(p) { var l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l]; }
    var out = [];
    GL3_BLOB.forEach(function (t) {
      var ab = unit([(t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2, (t[0][2] + t[1][2]) / 2]);
      var bc = unit([(t[1][0] + t[2][0]) / 2, (t[1][1] + t[2][1]) / 2, (t[1][2] + t[2][2]) / 2]);
      var ca = unit([(t[2][0] + t[0][0]) / 2, (t[2][1] + t[0][1]) / 2, (t[2][2] + t[0][2]) / 2]);
      out.push([t[0], ab, ca], [ab, t[1], bc], [ca, bc, t[2]], [ab, bc, ca]);
    });
    FOLIAGE_FINE = out;
    return out;
  }
  function mClump(M, x, y, z, R, sq, mat, seed) {
    var P = FLOOR_PX, sqz = Math.max(0.3, sq), fine = R > P * 0.6;
    (fine ? foliageFine() : GL3_BLOB).forEach(function (t, ti) {
      var pts = [], ns = [], uvs = [];
      for (var i = 0; i < 3; i++) {
        var p = t[i], b = foliageBend(p, seed);
        pts.push([x + p[0] * R * b, y + p[1] * R * b, z + p[2] * R * b * sq]);
        var n = [p[0], p[1], p[2] / sqz], l = Math.hypot(n[0], n[1], n[2]);
        ns.push([n[0] / l, n[1] / l, n[2] / l]);
        uvs.push([(p[0] + p[1]) * R / P, p[2] * R / P]);
      }
      M.tri(mat, pts[0], pts[1], pts[2], ns[0], ns[1], ns[2], uvs[0], uvs[1], uvs[2]);
      // a tuft: a low point of leaves out of the face's middle
      if (fine && (ti * 7 + Math.round(seed * 10)) % 6 === 0) {
        var c = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3, (pts[0][2] + pts[1][2] + pts[2][2]) / 3];
        var nm = mUnit([(ns[0][0] + ns[1][0] + ns[2][0]), (ns[0][1] + ns[1][1] + ns[2][1]), (ns[0][2] + ns[1][2] + ns[2][2])]);
        var tip = [c[0] + nm[0] * R * 0.2, c[1] + nm[1] * R * 0.2, c[2] + nm[2] * R * 0.2 * sq];
        for (var e = 0; e < 3; e++) {
          var a = pts[e], b2 = pts[(e + 1) % 3], mid = [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2, (a[2] + b2[2]) / 2];
          var side = mUnit([nm[0] + (mid[0] - c[0]) / R, nm[1] + (mid[1] - c[1]) / R, nm[2] + (mid[2] - c[2]) / R]);
          M.tri(mat, a, b2, tip, ns[e], ns[(e + 1) % 3], side);
        }
      }
    });
  }
  function mTier(M, r, z0, z1, mat, under, turn, sides) {
    var n2 = (sides || 9) * 2, droop = (z1 - z0) * 0.15, slope = r / Math.max(1, z1 - z0), ring = [];
    for (var i = 0; i < n2; i++) {
      var a = i / n2 * Math.PI * 2 + turn, long = i % 2 === 0, rr = long ? r : r * 0.66;
      ring.push({ p: [Math.cos(a) * rr, Math.sin(a) * rr, z0 - (long ? droop : droop * 0.2)], a: a });
    }
    var tip = [0, 0, z1], low = [0, 0, z0 + (z1 - z0) * 0.2];
    for (var j = 0; j < n2; j++) {
      var A = ring[j], B = ring[(j + 1) % n2];
      var na = mUnit([Math.cos(A.a), Math.sin(A.a), slope]), nb = mUnit([Math.cos(B.a), Math.sin(B.a), slope]);
      M.tri(mat, A.p, B.p, tip, na, nb, [0, 0, 1]);
      M.tri(under, B.p, A.p, low, [0, 0, -1], [0, 0, -1], [0, 0, -1]);
    }
  }
  // Leaves a shade darker in the crown, the color itself, a shade lighter on top.
  function mFoliageMats(M, color) {
    return [M.mat("leaves", mShade(color, -0.2)), M.mat("leaves", color), M.mat("leaves", mShade(color, 0.13))];
  }
  // A broadleaf: a flared trunk, boughs forking twice, a clump at the end
  // of every twig and the crown filled out round them.
  function mBroadleaf(M, W, D, H, C, n, o) {
    var cm = FLOOR_PX / 100, rnd = mRand(((n && n.id) || 41) * 7 + 3), R = Math.min(W, D) / 2;
    var bark = M.mat("bark", C.frame), mats = mFoliageMats(M, C.main);
    var trunkTop = H * (o.trunk || 0.36), tr = Math.max(4 * cm, R * (o.thick || 0.085));
    M.cyl(0, 0, 0, H * 0.05, tr * 1.6, bark, { seg: 10, r1: tr });
    M.cyl(0, 0, H * 0.05, trunkTop, tr, bark, { seg: 10, r1: tr * 0.8 });
    var tips = [], limbs = o.limbs || 4 + Math.floor(rnd() * 2), crownMid = trunkTop + (H - trunkTop) * 0.5;
    for (var i = 0; i < limbs; i++) {
      var a = i / limbs * Math.PI * 2 + rnd() * 0.5, out = R * (o.reach || 0.42) * (0.85 + rnd() * 0.3);
      var up = trunkTop + (H - trunkTop) * (0.2 + rnd() * 0.18), mid = [Math.cos(a) * out, Math.sin(a) * out, up];
      M.tube([0, 0, trunkTop - tr * 0.8], mid, tr * 0.52, bark, 6);
      // (leaves along the bough too, under the crown: not a ball on sticks)
      mClump(M, mid[0] * 0.8, mid[1] * 0.8, up - R * 0.05, R * (o.clump || 0.34) * 0.75, 0.75, mats[0], i * 2.3 + 0.5);
      for (var f = 0; f < 2; f++) {
        var b = a + (f ? 1 : -1) * (0.35 + rnd() * 0.3), o2 = out + R * (0.16 + rnd() * 0.16), u2 = up + (H - up) * (0.25 + rnd() * 0.3);
        var tip = [Math.cos(b) * o2, Math.sin(b) * o2, u2];
        M.tube(mid, tip, tr * 0.25, bark, 5);
        tips.push(tip);
      }
    }
    // the clumps: at every twig's end, the core of the crown, and over the top
    mClump(M, 0, 0, crownMid, R * 0.6, 0.8, mats[0], 0.3 + rnd());
    tips.forEach(function (tp, i) {
      var s = R * (o.clump || 0.34) * (0.85 + rnd() * 0.3);
      mClump(M, tp[0] * 1.05, tp[1] * 1.05, Math.min(tp[2], H - s * 0.75), s, 0.82, mats[tp[2] > crownMid ? 2 : 1], i * 1.7 + rnd());
    });
    for (var k = 0; k < 3; k++) {
      var a3 = k / 3 * Math.PI * 2 + rnd(), d = R * 0.28, s3 = R * 0.36;
      mClump(M, Math.cos(a3) * d, Math.sin(a3) * d, H - s3 * 0.85, s3, 0.85, mats[2], 7 + k);
    }
    if (o.fruit) {
      var fruit = M.mat("plastic", o.fruit);
      for (var q = 0; q < 14; q++) {
        var fa = rnd() * Math.PI * 2, fd = R * (0.55 + rnd() * 0.3), fz = trunkTop + (H - trunkTop) * (0.15 + rnd() * 0.55);
        M.ball(Math.cos(fa) * fd, Math.sin(fa) * fd, fz, 3.5 * cm, 3.5 * cm, 3.5 * cm, fruit, { seg: 4 });
      }
    }
  }
  // A fir: its trunk up through the middle, and tier over tier, each smaller.
  function mConifer(M, W, D, H, C, n, o) {
    var cm = FLOOR_PX / 100, rnd = mRand(((n && n.id) || 43) * 5 + 1), R = Math.min(W, D) / 2;
    var bark = M.mat("bark", C.frame), mats = mFoliageMats(M, C.main), bare = H * (o.bare || 0.1);
    M.cyl(0, 0, 0, H * 0.94, Math.max(4 * cm, R * 0.07), bark, { seg: 8, r1: 1.5 * cm });
    var tiers = o.tiers || 6, z = bare;
    for (var t = 0; t < tiers; t++) {
      var k = t / tiers, r = R * Math.pow(1 - k, 0.9) * (o.wide || 1) + R * 0.08, h = (H - bare) / tiers * 1.7;
      mTier(M, r, z, Math.min(H, z + h), mats[t === tiers - 1 ? 2 : 1], mats[0], t * 0.9 + rnd(), 9);
      z += (H - bare) / tiers;
    }
  }
  if (typeof MODELS === "object" && MODELS.i_tree) {
    var treeKinds = MODELS.i_tree;
    mDef("i_tree", function (M, W, D, H, C, n) {
      var sp = n && n.sp;
      var main = sp === "maple" ? "#5f8a3c" : sp === "birch" ? "#7ea24a" : sp === "fruit" ? "#5b8b3d" : sp === "spruce" ? "#2f5a3c" :
                 sp === "fir" ? "#355f43" : sp === "redwood" ? "#2f5638" : "#4f7d3a";
      var C2 = mPick(C, main, sp === "birch" ? "#e6e2d8" : sp === "redwood" ? "#7a4330" : "#5f4330");
      if (!sp || sp === "oak" || sp === "broad") { mBroadleaf(M, W, D, H, C2, n, { trunk: 0.34, reach: 0.44, clump: 0.36 }); return; }
      if (sp === "maple") { mBroadleaf(M, W, D, H, C2, n, { trunk: 0.38, reach: 0.38, clump: 0.34, limbs: 5 }); return; }
      if (sp === "birch") { mBroadleaf(M, W, D, H, C2, n, { trunk: 0.45, reach: 0.3, clump: 0.3, thick: 0.05, limbs: 4 }); return; }
      if (sp === "fruit") { mBroadleaf(M, W, D, H, C2, n, { trunk: 0.3, reach: 0.4, clump: 0.38, fruit: n.id % 3 ? "#c8332b" : "#f0a224" }); return; }
      if (sp === "spruce" || sp === "fir") { mConifer(M, W, D, H, C2, n, { tiers: sp === "fir" ? 7 : 6, bare: 0.08 }); return; }
      if (sp === "redwood") { mConifer(M, W, D, H, C2, n, { tiers: 6, bare: 0.38, wide: 0.75 }); return; }
      return treeKinds.apply(this, arguments);
    });
  }
  // And every other lump of leaves a model is made with -- a poplar's
  // column, a willow's crown, a pine's, a hedge, a house plant's -- a clump
  // too (a whole ball of the leaves' stuff; not a dome, not a berry).
  if (typeof modelMaker === "function") {
    var modelMakerPlain = modelMaker;
    modelMaker = function () {
      var M = modelMakerPlain.apply(this, arguments), ball = M.ball;
      M.ball = function (x, y, z, rx, ry, rz, m, o) {
        if (typeof m === "string" && m.indexOf("leaves|") === 0 && (!o || (o.lat0 === undefined && o.lat1 === undefined)) &&
            Math.abs(rx - ry) < Math.max(rx, ry) * 0.25 && Math.max(rx, ry) > FLOOR_PX * 0.04) {
          var R = (rx + ry) / 2;
          mClump(M, x, y, z, R, rz / R, m, x * 0.37 + y * 0.53 + z * 0.11);
          return M;
        }
        return ball.apply(this, arguments);
      };
      return M;
    };
  }

  // ---- flowers: petals round a middle, not squares of color ---------------------------------------
  // (40-plants.js drew each flower's head a little square, flat on top:
  // close to, paper cut-outs on sticks)
  function foliageBloom(v, c, s, nrm, color, rnd) {
    var n = nrm, ux = Math.abs(n[2]) < 0.9 ? -n[1] : 1, uy = Math.abs(n[2]) < 0.9 ? n[0] : 0, ul = Math.hypot(ux, uy) || 1;
    ux /= ul; uy /= ul;
    var u = [ux, uy, 0], w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
    function at(a, r, lift) {
      var ca = Math.cos(a) * r, sa = Math.sin(a) * r;
      return [c[0] + u[0] * ca + w[0] * sa + n[0] * lift, c[1] + u[1] * ca + w[1] * sa + n[1] * lift, c[2] + u[2] * ca + w[2] * sa + n[2] * lift];
    }
    var petals = 5, turn = rnd() * Math.PI, mid = [0.96, 0.78, 0.22];
    if (color[0] > 0.9 && color[1] > 0.75 && color[2] < 0.4) { mid = [0.45, 0.28, 0.12]; }      // a yellow one: a dark eye
    var light = gl3Mix(color, [1, 1, 1], 0.18);
    for (var p = 0; p < petals; p++) {
      var a = turn + p / petals * Math.PI * 2, half = Math.PI / petals * 0.62;
      gl3Poly(v, [at(a, s * 0.18, 0.002 * s), at(a - half, s * 0.62, 0.05 * s), at(a, s, 0.12 * s), at(a + half, s * 0.62, 0.05 * s)], n, p % 2 ? color : light, 1, null, PAT.plain);
    }
    var ring = [];
    for (var k = 0; k < 6; k++) { ring.push(at(k / 6 * Math.PI * 2, s * 0.22, 0.06 * s)); }
    gl3Poly(v, ring, n, mid, 1, null, PAT.plain);
  }
  if (typeof PLANT_KINDS === "object") {
    PLANT_KINDS.flowers = function (v, at, rnd, sheetC) {
      var P = FLOOR_PX, green = gl3Mix([0.34, 0.54, 0.26], sheetC, 0.08), n = 18 + Math.floor(rnd() * 12);
      var tone = PLANT_FLOWERS[Math.floor(rnd() * PLANT_FLOWERS.length)], tone2 = PLANT_FLOWERS[Math.floor(rnd() * PLANT_FLOWERS.length)];
      for (var i = 0; i < n; i++) {
        var a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 1.1 * P, x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d;
        var z = (0.25 + rnd() * 0.3) * P, s = (0.06 + rnd() * 0.03) * P, lean = [(rnd() - 0.5) * 0.1 * P, (rnd() - 0.5) * 0.1 * P];
        plantBlade(v, [x, y, 0], [x + lean[0], y + lean[1], z], 0.04 * P, green, PAT.leaves);
        // a leaf or two up the stem
        plantBlade(v, [x + lean[0] * 0.3, y + lean[1] * 0.3, z * 0.3], [x + (rnd() - 0.5) * 0.18 * P, y + (rnd() - 0.5) * 0.18 * P, z * 0.55], 0.05 * P, gl3Mix(green, [0, 0, 0], 0.1), PAT.leaves);
        var tilt = foliageUnitV([lean[0] / P * 3, lean[1] / P * 3, 1]);
        foliageBloom(v, [x + lean[0], y + lean[1], z], s, tilt, gl3Mix(rnd() < 0.7 ? tone : tone2, sheetC, 0.05), rnd);
      }
    };
    PLANT_KINDS.flowering = function (v, at, rnd, sheetC) {
      var P = FLOOR_PX, R = (0.5 + rnd() * 0.35) * P, leaf = plantWhite(gl3Mix([0.3, 0.5, 0.26], sheetC, 0.08), 0.55);
      var bloom = gl3Mix(PLANT_FLOWERS[Math.floor(rnd() * PLANT_FLOWERS.length)], sheetC, 0.05);
      foliageClump(v, [at[0], at[1], R * 0.75], R, 0.85, leaf, PAT.leaves);
      for (var i = 0; i < 18; i++) {
        var a = rnd() * Math.PI * 2, el = rnd() * 1.1, ca = Math.cos(el);
        var nrm = [Math.cos(a) * ca, Math.sin(a) * ca, Math.sin(el)];
        var c = [at[0] + nrm[0] * R * 1.02, at[1] + nrm[1] * R * 1.02, R * 0.75 + nrm[2] * R * 0.87 + 1];
        foliageBloom(v, c, (0.07 + rnd() * 0.03) * P, nrm, bloom, rnd);
      }
    };
  }
  function foliageUnitV(p) { var l = Math.hypot(p[0], p[1], p[2]) || 1; return [p[0] / l, p[1] / l, p[2] / l]; }
