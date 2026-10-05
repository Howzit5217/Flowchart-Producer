// ---------------------------------------------------------------------------
//  40-street.js -- which side of the street the lot is on (the way the
//  house looks out: the sun comes round with it, and the plan's north
//  arrow), and the street straight or curving away either side
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "update it so your place can be on either side
  // of the street and the street and face north south, or east west, or
  // have a curve a long with other things that you can think of")
  //
  // The plan keeps the street along the lot's foot, as it is drawn; what
  // changes is where north is.  On the north side of a street running east
  // and west the house looks south (as it always did), on the south side
  // north; on the west side of one running north and south it looks east,
  // on the east side west.  The sun, the shadows and the roof's solar
  // panels turn with it.
  var RD_FACES = ["S", "N", "E", "W"];
  var RD_TURN = { S: 0, E: 90, N: 180, W: -90 };       // the paper turned from true north, degrees
  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.faces = "S"; HOUSE_PLAIN.curve = false; }
  function rdFace() { var f = houseOpt("faces"); return RD_TURN[f] !== undefined ? f : "S"; }
  // (said in so many words, the lot's own turn on the paper comes into it:
  // its front is the way it looks)
  function rdTurned(x, y) {
    var deg = RD_TURN[rdFace()];
    if (hand.house && hand.house.faces !== undefined && typeof houseStreetLot === "function") {
      var lot = houseStreetLot();
      if (lot) { deg += lot.turn || 0; }
    }
    var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  }
  if (typeof gl3SkyNow === "function") {
    var gl3SkyNorth = gl3SkyNow;
    gl3SkyNow = function () {
      var out = gl3SkyNorth.apply(this, arguments);
      if (out && out.sun && (rdFace() !== "S" || (hand.house && hand.house.faces !== undefined))) { var t = rdTurned(out.sun[0], out.sun[1]); out.sun = [t[0], t[1], out.sun[2]]; }
      return out;
    };
  }
  if (typeof SOLAR_SUN === "object" && typeof v3Build === "function") {
    var rdSolarNorth = SOLAR_SUN.slice(), v3BuildFacing = v3Build;
    v3Build = function () {
      var t = rdTurned(rdSolarNorth[0], rdSolarNorth[1]);
      SOLAR_SUN[0] = t[0]; SOLAR_SUN[1] = t[1];
      return v3BuildFacing.apply(this, arguments);
    };
  }
  // On the plan: a north arrow in the lot's top corner.
  if (typeof lotArt === "function") {
    var lotArtNorth = lotArt;
    lotArt = function (lot, cx, cy, w, h) {
      var out = lotArtNorth.apply(this, arguments);
      try {
        if (w < 160 || h < 160) { return out; }
        var r = 15, ax = cx + w / 2 - r - 14, ay = cy - h / 2 + r + 14, n = rdTurned(0, -1);
        // (the arrow drawn in the lot's own turn: the paper's north is the lot's turned back)
        var lt = -(lot.turn || 0) * Math.PI / 180, nx = n[0] * Math.cos(lt) - n[1] * Math.sin(lt), ny = n[0] * Math.sin(lt) + n[1] * Math.cos(lt);
        var px = -ny, py = nx, f = function (v) { return iconR(v); };
        out += '<g class="trim" opacity="0.7"><circle cx="' + f(ax) + '" cy="' + f(ay) + '" r="' + r + '" fill="none"/>' +
               '<path d="M' + f(ax + nx * (r - 3)) + " " + f(ay + ny * (r - 3)) + " L" + f(ax + px * 5 - nx * 5) + " " + f(ay + py * 5 - ny * 5) +
               " L" + f(ax - nx * 1) + " " + f(ay - ny * 1) + " L" + f(ax - px * 5 - nx * 5) + " " + f(ay - py * 5 - ny * 5) + ' Z"/>' +
               '<text x="' + f(ax + nx * (r + 9)) + '" y="' + f(ay + ny * (r + 9) + 4) + '" font-size="11" text-anchor="middle" stroke="none" fill="#000000">N</text></g>';
      } catch (e) { /* the lot without it */ }
      return out;
    };
  }

  // ---- the street curving away -------------------------------------------------------------
  // Past the lot's sides the street bends away from it -- the lot on the
  // outside of a long curve -- and everything along it bends with it: the
  // pavements and the road, the houses either side and across, the lamps,
  // the trees, the land and what goes by.  Worked out straight, then bent:
  // each corner moved round the curve's middle, turned as far as it goes
  // round (the lots either side fan out behind; across the way they close
  // in), out to a turn of a little over 50 degrees, and straight on past
  // that.  Far in on the curve's inside the bending eases off, before it
  // would fold over.
  var RD_R = 40, RD_TH = 0.95;                           // its radius, metres; the most it turns
  function rdCurving() { return !!houseOpt("curve") && !!houseOpt("street"); }
  function rdBender() {
    if (!rdCurving() || typeof houseStreetLot !== "function") { return null; }
    var lot = houseStreetLot();
    if (!lot) { return null; }
    var P = FLOOR_PX, a = (lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var B = { P: P, x0: lot.w / 2 + 1.5 * P, yb: lot.h / 2 + (typeof streetWalkPx === "function" ? streetWalkPx() : 1.6 * P) + (typeof streetRoadPx === "function" ? streetRoadPx() / 2 : 3.5 * P), R: RD_R * P, step: 2.5 * P };
    B.local = function (x, y) { var dx = x - lot.x, dy = y - lot.y; return [dx * c + dy * s, -dx * s + dy * c]; };
    B.world = function (lx, ly) { return [lot.x + lx * c - ly * s, lot.y + lx * s + ly * c]; };
    // a point in the lot's numbers bent: [x, y, how far turned] -- or null, as it was
    B.bend = function (lx, ly) {
      var u = Math.abs(lx) - B.x0;
      if (u <= 0) { return null; }
      var d = ly - B.yb, R = B.R, k = 1 - rdStep(0.55 * R, 0.85 * R, d);
      if (k <= 0) { return null; }
      var ua = Math.min(u, R * RD_TH), th = ua / R, r = R - d;
      var px = B.x0 + r * Math.sin(th), py = B.yb + R - r * Math.cos(th);
      if (u > ua) { px += (u - ua) * Math.cos(RD_TH); py += (u - ua) * Math.sin(RD_TH); }
      var sx = B.x0 + u;
      px = sx + (px - sx) * k; py = ly + (py - ly) * k;
      var sg = lx < 0 ? -1 : 1;
      return [sg * px, py, sg * th * k];
    };
    B.point = function (x, y) {
      var q = B.local(x, y), b = B.bend(q[0], q[1]);
      if (!b) { return null; }
      var w = B.world(b[0], b[1]);
      return [w[0], w[1], b[2]];
    };
    return B;
  }
  function rdStep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  // While the scenery is made with the street curving: long flat faces cut
  // in strips across the street's length, to bend.
  var rdCutting = null;
  if (typeof gl3Poly === "function") {
    var gl3PolyWhole = gl3Poly;
    gl3Poly = function (v, pts, n, c, a, uvs, pat) {
      var B = rdCutting;
      if (!B || !pts || pts.length < 3) { return gl3PolyWhole.apply(this, arguments); }
      var lo = Infinity, hi = -Infinity;
      var xs = pts.map(function (p) { var q = B.local(p[0], p[1]); lo = Math.min(lo, q[0]); hi = Math.max(hi, q[0]); return q[0]; });
      if (hi - lo < B.step * 1.5 || (hi <= B.x0 && lo >= -B.x0)) { return gl3PolyWhole.apply(this, arguments); }
      var cuts = [lo, hi], x;
      for (x = B.x0; x < hi; x += B.step) { if (x > lo) { cuts.push(x); } }
      for (x = -B.x0; x > lo; x -= B.step) { if (x < hi) { cuts.push(x); } }
      cuts.sort(function (p, q) { return p - q; });
      for (var i = 0; i + 1 < cuts.length; i++) {
        if (cuts[i + 1] - cuts[i] < 0.5) { continue; }
        var part = rdClip(pts, uvs, xs, cuts[i], cuts[i + 1]);
        if (part.pts.length >= 3) { gl3PolyWhole(v, part.pts, n, c, a, part.uvs, pat); }
      }
    };
  }
  // A flat face cut down to lo..hi along the street (its corners' x given).
  function rdClip(pts, uvs, xs, lo, hi) {
    var poly = pts.map(function (p, i) { return { p: p, uv: uvs ? uvs[i] : [0, 0], x: xs[i] }; });
    function cut(list, keep, edge) {
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var A = list[i], B = list[(i + 1) % list.length], ina = keep(A.x), inb = keep(B.x);
        if (ina) { out.push(A); }
        if (ina !== inb) {
          var t = (edge - A.x) / ((B.x - A.x) || 1);
          out.push({ p: [A.p[0] + (B.p[0] - A.p[0]) * t, A.p[1] + (B.p[1] - A.p[1]) * t, (A.p[2] || 0) + ((B.p[2] || 0) - (A.p[2] || 0)) * t],
                     uv: [A.uv[0] + (B.uv[0] - A.uv[0]) * t, A.uv[1] + (B.uv[1] - A.uv[1]) * t], x: edge });
        }
      }
      return out;
    }
    poly = cut(poly, function (x) { return x >= lo; }, lo);
    poly = cut(poly, function (x) { return x <= hi; }, hi);
    return { pts: poly.map(function (q) { return q.p; }), uvs: uvs ? poly.map(function (q) { return q.uv; }) : null };
  }
  // Every corner of the scenery bent, and which way it faces turned with it.
  function rdBendVerts(B, data) {
    var S = typeof GL3_STRIDE === "number" ? GL3_STRIDE : 13;
    for (var o = 0; o + 5 < data.length; o += S) {
      var b = B.point(data[o], data[o + 1]);
      if (!b) { continue; }
      data[o] = b[0]; data[o + 1] = b[1];
      var cs = Math.cos(b[2]), sn = Math.sin(b[2]), nx = data[o + 3], ny = data[o + 4];
      data[o + 3] = nx * cs - ny * sn; data[o + 4] = nx * sn + ny * cs;
    }
  }
  if (typeof gl3Scenery === "function") {
    var gl3SceneryStraight = gl3Scenery;
    gl3Scenery = function (G) {
      var was = G && G.scenery, B = null;
      try { B = rdBender(); } catch (e) { B = null; }
      rdCutting = B;
      var out;
      try { out = gl3SceneryStraight.apply(this, arguments); } finally { rdCutting = null; }
      if (B && out && out !== was && !out.rdBent && out.verts) {
        try { rdBendVerts(B, out.verts); } catch (e) { /* straight */ }
        out.rdBent = true;
      }
      return out;
    };
  }
  // what goes by, bent onto the street where it is
  if (typeof worldFolk === "function") {
    var worldFolkStraight = worldFolk;
    worldFolk = function (model) {
      var out = worldFolkStraight.apply(this, arguments);
      try {
        var B = rdBender();
        if (B && model && model.passing) {
          model.passing.faces.forEach(function (f) {
            var cx = 0, cy = 0;
            f.pts.forEach(function (p) { cx += p[0] / f.pts.length; cy += p[1] / f.pts.length; });
            var bc = B.point(cx, cy);
            f.pts = f.pts.map(function (p) { var b = B.point(p[0], p[1]); return b ? [b[0], b[1], p[2]] : p; });
            if (bc && f.n) {
              var cs = Math.cos(bc[2]), sn = Math.sin(bc[2]);
              f.n = [f.n[0] * cs - f.n[1] * sn, f.n[0] * sn + f.n[1] * cs, f.n[2]];
            }
          });
          model.passing.stand.forEach(function (s) { var b = B.point(s.x, s.y); if (b) { s.x = b[0]; s.y = b[1]; } });
        }
      } catch (e) { /* straight */ }
      return out;
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyStreet = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyStreet.apply(this, arguments) + (rdCurving() ? "|rc" : ""); };
  }

  // ---- asked: on the view's Street tab (39-house.js) ----------------------------------------
  function streetSection(sheet, head, draw, noStreet) {
    head(TXT.sf_head);
    worldPicker(sheet, RD_FACES, rdFace(), "sf_side_", function (k) { houseSetOpt("faces", k); draw(); });
    head(TXT.sf_shape);
    var g = worldPicker(sheet, ["straight", "curve"], rdCurving() ? "curve" : "straight", "sf_", function (k) { houseSetOpt("curve", k === "curve"); draw(); });
    if (noStreet) { all("button", g).forEach(function (b) { b.disabled = true; b.title = noStreet; }); }
  }
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      sf_side_S: '<rect x="4.5" y="2.6" width="11" height="8.6" rx="1"/><path d="M1.6 14.2h16.8M1.6 17.6h16.8"/>',
      sf_side_N: '<rect x="4.5" y="8.8" width="11" height="8.6" rx="1"/><path d="M1.6 2.4h16.8M1.6 5.8h16.8"/>',
      sf_side_E: '<rect x="2.6" y="4.5" width="8.6" height="11" rx="1"/><path d="M14.2 1.6v16.8M17.6 1.6v16.8"/>',
      sf_side_W: '<rect x="8.8" y="4.5" width="8.6" height="11" rx="1"/><path d="M2.4 1.6v16.8M5.8 1.6v16.8"/>',
      sf_straight: '<rect x="5.4" y="2.6" width="9.2" height="7.4" rx="1"/><path d="M1.4 13.4h17.2M1.4 17h17.2"/>',
      sf_curve: '<rect x="5.4" y="2" width="9.2" height="6.6" rx="1"/><path d="M1.4 18.4C5 12 15 12 18.6 18.4M1.4 14.4C5.4 8.8 14.6 8.8 18.6 14.4"/>'
    });
  }

  // ---- asked when it is started: where it stands, what is out of doors -------------------------
  // (2026-10-03: "the settings need to be looked at for the 3d mode and a
  // lot of those settings should be in the initial build of the
  // structure")  In Start building, the 3D view's settings that say where
  // and how it stands -- its landscape, its ground, which side of the
  // street, the street's shape, the power lines, and what is out of doors
  // -- each as the view has it now; put on the house as it is made.
  var RD_SITE = ["scape", "relief", "faces", "curve", "power", "street", "hood", "folk", "gutters", "solar", "trees"];
  function siteAsk(ui, want) {
    if (!want.site || typeof want.site !== "object") {
      want.site = {};
      RD_SITE.forEach(function (k) { var v = houseOpt(k); if (v !== undefined) { want.site[k] = v; } });
    }
    var S = want.site;
    function now(k) { return S[k] !== undefined ? S[k] : houseOpt(k); }
    ui.head(TXT.st_site_head);
    ui.tiles();
    (typeof WORLD_SCAPES === "object" ? WORLD_SCAPES : []).forEach(function (k) {
      ui.tile(TXT["ws_" + k], "ws_" + k, function () { return (now("scape") || "plains") === k; }, function () { S.scape = k; }, true);
    });
    if (typeof TERR_RELIEFS === "object") {
      ui.head(TXT.tr_head);
      ui.tiles();
      TERR_RELIEFS.forEach(function (k) { ui.tile(TXT["tr_" + k], "tr_" + k, function () { return (now("relief") || "auto") === k; }, function () { S.relief = k; }, true); });
    }
    ui.head(TXT.sf_head);
    ui.tiles();
    RD_FACES.forEach(function (k) { ui.tile(TXT["sf_side_" + k], "sf_side_" + k, function () { return (now("faces") || "S") === k; }, function () { S.faces = k; }, true); });
    ui.tile(TXT.sf_curve, "sf_curve", function () { return !!now("curve"); }, function () { S.curve = !now("curve"); });
    if (typeof POWER_KINDS === "object") {
      ui.head(TXT.pw_head);
      ui.tiles();
      POWER_KINDS.forEach(function (k) { ui.tile(TXT["pw_" + k], "pw_" + k, function () { return (now("power") || "front") === k; }, function () { S.power = k; }, true); });
    }
    ui.head(TXT.hs_outside);
    ui.tiles();
    [["street", "street", TXT.hs_street], ["hood", "hood", TXT.hs_hood], ["folk", "folk", TXT.hs_folk],
     ["gutters", "gutter", TXT.hs_gutters], ["solar", "solar", TXT.hs_solar], ["trees", "tree", TXT.hs_trees]].forEach(function (t) {
      ui.tile(t[2], t[1], function () { return !!now(t[0]); }, function () { S[t[0]] = !now(t[0]); });
    });
  }
  // Put on as it is made: inside the asking where it goes, after its undo step.
  function rdSitePut(want) {
    var S = want && want.site;
    if (!S || typeof S !== "object") { return; }
    var h = Object.assign({}, hand.house || {});
    RD_SITE.forEach(function (k) {
      if (S[k] === undefined) { return; }
      if (typeof HOUSE_PLAIN === "object" && S[k] === HOUSE_PLAIN[k]) { delete h[k]; } else { h[k] = S[k]; }
    });
    if (Object.keys(h).length) { hand.house = h; } else { delete hand.house; }
  }
  if (typeof STARTER_WRAPS === "object") {
    var rdSiteWrap = function* (inner, want) { try { rdSitePut(want); } catch (e) { /* as it was */ } return yield* inner(want); };
    var rdHoodAt = -1;
    STARTER_WRAPS.forEach(function (fn, i) { if (rdHoodAt < 0 && String(fn).indexOf("hoodAsk") >= 0) { rdHoodAt = i; } });
    if (rdHoodAt >= 0) { STARTER_WRAPS.splice(rdHoodAt, 0, rdSiteWrap); } else { STARTER_WRAPS.push(rdSiteWrap); }
  }
