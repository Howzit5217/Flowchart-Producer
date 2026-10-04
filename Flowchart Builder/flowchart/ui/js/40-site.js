// ---------------------------------------------------------------------------
//  40-site.js -- the ground round a building laid out as one site: a walk
//  all round it, beds planted along its walls, its parking paved in one
//  piece -- in front, to the side, front and side, behind or all round:
//  rows of stalls on aisles that meet at the corners, islands with trees
//  at their ends, a way in from the street and a walk through to the door
//  -- bikes parked by the door; the paving and the planting as its style
//  has them; and, where a town is built close, the building joined to the
//  ones beside it, or one part of one big building
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "some towns and cities are super cramped
  // together to make it so you can be 1 big building and yours is just a
  // small part of it", "parking in the front and on the side and it is
  // properly paved and looks good with the bike parking with a sidewalk
  // around the building with the spacing for that and proper landscaping",
  // "make it so it looks really good and proper with all the different
  // styles it offers")
  //
  // The parking was a ring of lots, each its own box with grass between
  // them, a lot only where it fitted (an office's never did: its lot was
  // never made bigger, so it got six cars standing on the lawn behind it),
  // the aisle up against the building and no way to walk to the door.  Now
  // the site is laid out in one go, from the building out: its walls, a bed
  // planted along them (a shop's front is glass to the walk), a walk all
  // round, then the parking -- a row of stalls nosed to the walk, the aisle,
  // a second row where it is wanted, a planted strip and the street.  The
  // aisles at the front and the side meet at the corner, every row ends in
  // an island with a tree, a walk crosses to the door over a painted
  // crossing, the way in is cut through the far row, and bikes stand in a
  // bay beside the walk.  The lot is made as big as all that needs, and the
  // floors drawn beside it on the paper move over for it.
  Object.assign(HOUSE_PLAIN, { attach: "alone", parkAt: "auto", parkSide: "right" });
  var LW_ATTACH = ["alone", "one", "row", "block"];
  var LW_PARKS = ["auto", "none", "front", "side", "frontside", "back", "around", "street"];
  var LW_KEYS = { parking: 1, walks: 1, beds: 1, bikes: 1 };
  var LW_HOMES = { house: 1, cabin: 1, duplex: 1, townhouses: 1 };
  var LW_STORES = { shop: 1, boutique: 1, cafe: 1 };
  function lwAttach() { var a = houseOpt("attach"); return LW_ATTACH.indexOf(a) >= 0 ? a : "alone"; }
  function lwTypeNow() {
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, b) { return b.id - a.id; });
    return marks.length ? marks[0].madeWith.type || "house" : "house";
  }
  // Laid out for these: a skyscraper's ground is its own (40-towers.js).
  function lwSiteType(type) { return !LW_HOMES[type] && type !== "tower"; }
  // Which side a building joined on one side is joined on: away from its
  // parking at the side, else the left (a house's garage is on its right).
  function lwJoined() {
    var a = lwAttach();
    if (a === "row" || a === "block") { return { left: true, right: true }; }
    if (a === "one") { return houseOpt("parkSide") === "left" ? { right: true } : { left: true }; }
    return {};
  }
  // Where the parking is, for what it is: { front, back, left, right, street }.
  function lwParkKind(type) {
    var k = houseOpt("parkAt");
    if (LW_PARKS.indexOf(k) < 0) { k = "auto"; }
    if (k === "auto") {
      k = type === "apartments" || type === "condos" ? "around" : type === "office" || type === "school" ? "frontside"
        : LW_STORES[type] ? "front" : "none";
    }
    // (homes park on their own drives; a skyscraper on its own ground)
    if ((LW_HOMES[type] || type === "tower") && k !== "street") { k = "none"; }
    return k;
  }
  function lwParkSides(type, joined) {
    var k = lwParkKind(type), side = houseOpt("parkSide") === "left" ? "left" : "right", out = {};
    joined = joined || {};
    if (k === "front" || k === "frontside" || k === "around") { out.front = true; }
    if (k === "side" || k === "frontside") { out[side] = true; }
    if (k === "around") { out.left = out.right = out.back = true; }
    if (k === "back") { out.back = true; }
    if (k === "street") { out.street = true; }
    if (joined.left) { delete out.left; }
    if (joined.right) { delete out.right; }
    // (the side asked for is a wall against the next building: the other
    // side, else behind)
    if ((k === "side" || k === "frontside") && !out.left && !out.right) {
      var other = side === "left" ? "right" : "left";
      if (!joined[other]) { out[other] = true; } else { out.back = true; }
    }
    return out;
  }
  function lwG(v) { return 2 * Math.round(v / 2); }       // on a grid of two pixels: pieces meet with no seam

  // ---- the look: paving and planting by the style ------------------------------------------------
  // Each style's walks laid in what its kind of place lays them in, and
  // planted the way its gardens are: a Georgian front in brick with clipped
  // box, a Tuscan one in stone with lavender and cypresses, a modern one in
  // concrete slabs with grasses in gravel, an adobe one in clay tiles with
  // agaves, a Japanese one in stone with moss and a red maple.
  var LW_PAVE = {
    concrete: ["lwslab", "#c8c4bb"], brick: ["lwbrick", "#a75b43"], stone: ["lwflag", "#cdc4b2"],
    clay: ["lwtile", "#c47a52"], pavers: ["lwbasket", "#aaa8a2"], white: ["lwflag", "#ebe7de"]
  };
  // (the shader's patterns, 38-view3d-gl.js: slabs, bricks laid flat, flags, tiles, a basket weave, gravel)
  if (typeof GL3_MAT === "object") { Object.assign(GL3_MAT, { lwslab: 5, lwbrick: 40, lwflag: 50, lwtile: 7, lwbasket: 48, lwgravel: 58 }); }
  var LW_STYLE = {
    craftsman: ["concrete", "cottage"], colonial: ["brick", "formal"], capecod: ["brick", "cottage"], victorian: ["brick", "cottage"],
    ranch: ["concrete", "mixed"], farmhouse: ["concrete", "cottage"], dutchcolonial: ["brick", "formal"], logcabin: ["stone", "woodland"],
    aframe: ["stone", "woodland"], midcentury: ["concrete", "modern"], prairie: ["pavers", "mixed"], pueblo: ["clay", "xeric"],
    mission: ["clay", "xeric"], brazil: ["pavers", "tropical"], tudor: ["brick", "cottage"], georgian: ["brick", "formal"],
    cottage: ["stone", "cottage"], french: ["stone", "formal"], provencal: ["stone", "med"], tuscan: ["stone", "med"],
    dutch: ["brick", "formal"], nordic: ["pavers", "woodland"], chalet: ["stone", "woodland"], izba: ["stone", "woodland"],
    cycladic: ["white", "med"], japanese: ["stone", "zen"], chinese: ["pavers", "zen"], hanok: ["stone", "zen"],
    thai: ["pavers", "tropical"], balinese: ["stone", "tropical"], haveli: ["clay", "xeric"], riad: ["clay", "xeric"],
    arabian: ["clay", "xeric"], sahel: ["clay", "xeric"], rondavel: ["stone", "xeric"], queenslander: ["concrete", "tropical"],
    nzvilla: ["concrete", "cottage"], modern: ["concrete", "modern"], contemporary: ["pavers", "modern"], ecohouse: ["pavers", "modern"],
    international: ["concrete", "modern"], brutalist: ["concrete", "modern"], artdeco: ["stone", "formal"], storefront: ["brick", "formal"],
    haussmann: ["stone", "formal"], brownstone: ["brick", "formal"], bistro: ["stone", "formal"], googie: ["concrete", "modern"],
    collegiate: ["brick", "formal"], schoolhouse: ["brick", "cottage"], modernist: ["concrete", "modern"], hightech: ["pavers", "modern"],
    panelblock: ["concrete", "mixed"], mediterranean: ["stone", "med"], scandi: ["pavers", "modern"]
  };
  // trees (40-things3d.js's kinds), what a bed is planted with, a hedge's green or none, a bed's edge
  var LW_PLANT = {
    formal: { trees: ["maple", "broad", "maple"], mix: "box", hedge: "#3c6532", edge: "stone" },
    cottage: { trees: ["fruit", "maple", "birch"], mix: "flowers", hedge: "#4a7a38", edge: "brick" },
    modern: { trees: ["birch", "broad", "poplar"], mix: "grasses", hedge: null, edge: "steel" },
    mixed: { trees: ["maple", "oak", "broad"], mix: "shrubs", hedge: "#41703a", edge: "steel" },
    xeric: { trees: ["palm", "joshua", "palm"], mix: "desert", hedge: null, edge: "stone" },
    med: { trees: ["cypress", "fruit", "cypress", "pine"], mix: "lavender", hedge: "#55703f", edge: "stone" },
    zen: { trees: ["maple", "pine"], mix: "moss", hedge: null, edge: "stone", red: true },
    tropical: { trees: ["palm", "banana", "palm", "broad"], mix: "tropical", hedge: "#3f7a3a", edge: "stone" },
    woodland: { trees: ["spruce", "birch", "fir"], mix: "ferns", hedge: null, edge: "wood" }
  };
  function lwLook() {
    var key = houseOpt("style"), S = typeof HOUSE_STYLES === "object" ? HOUSE_STYLES[key] : null, pick = LW_STYLE[key];
    if (!pick && S) {
      // (a style made later than this list: by what it is built of, and where it is from)
      var out = S.out ? S.out[0] : "", at = S.at || "";
      pick = [out === "brick" ? "brick" : out === "stone" ? "stone" : out === "stucco" && (at === "mideast" || at === "americas") ? "clay" : "concrete",
              at === "modern" || at === "civic" ? "modern" : at === "europe" ? "formal" : at === "asia" ? "zen" : at === "mideast" ? "xeric" : at === "oceania" ? "tropical" : "mixed"];
    }
    if (!pick) { pick = ["concrete", "mixed"]; }
    var plant = pick[1], scape = typeof worldScape === "function" ? worldScape() : "plains";
    // (what will grow where it is wins over the style's own garden)
    if (scape === "desert" && plant !== "zen") { plant = "xeric"; }
    else if ((scape === "beach" || scape === "tropics") && plant !== "xeric") { plant = "tropical"; }
    else if (scape === "arctic") { plant = "woodland"; }
    else if ((scape === "mountains" || scape === "forest") && (plant === "mixed" || plant === "cottage")) { plant = "woodland"; }
    var pave = LW_PAVE[pick[0]] || LW_PAVE.concrete;
    var look = Object.assign({ pave: pick[0], mat: pave[0], walk: pave[1], plant: plant }, LW_PLANT[plant] || LW_PLANT.mixed);
    if (scape === "arctic") { look.trees = ["spruce", "fir"]; }
    return look;
  }

  // ---- the pieces: a walk, paving, a bed, bike parking ----------------------------------------------
  // Flat on the ground, draped over it where it rises (40-land.js), no
  // name on them in the view.
  if (typeof LIES_FLAT === "object") { Object.assign(LIES_FLAT, { i_sidewalk: true, i_asphalt: true, i_plantbed: true, i_bikepark: true }); }
  if (typeof TERR_DRAPE === "object") { Object.assign(TERR_DRAPE, { i_sidewalk: true, i_asphalt: true, i_plantbed: true, i_bikepark: true }); }
  if (typeof V3_HIGH === "object") { Object.assign(V3_HIGH, { i_sidewalk: 0.13, i_asphalt: 0.02, i_plantbed: 0.7, i_bikepark: 1.1 }); }
  if (typeof NO_LABEL === "object") { Object.assign(NO_LABEL, { i_sidewalk: true, i_asphalt: true, i_plantbed: true }); }
  if (typeof FX_FIXED === "object") { Object.assign(FX_FIXED, { i_sidewalk: 1, i_asphalt: 1, i_plantbed: 1 }); }
  // A walk's paving: what it was laid in (n.pave, from the style), raised
  // a kerb's height off the paving round it; a ramp down at each end where
  // it meets a crossing (n.ramps: "n", "s").
  function lwPaveOf(n) {
    var p = LW_PAVE[n && n.pave] || LW_PAVE.concrete;
    return { mat: p[0], color: (n && n.paveC) || p[1] };
  }
  if (typeof mDef === "function") {
    mDef("i_sidewalk", function (M, W, D, H, C, n) {
      var look = lwPaveOf(n), t = Math.max(H, 6 * cm), top = M.mat(look.mat, C.main || look.color);
      var ramps = (n && n.ramps) || "", rd = Math.min(1.2 * FLOOR_PX, D * 0.4);
      var y0 = -D / 2 + (ramps.indexOf("n") >= 0 ? rd : 0), y1 = D / 2 - (ramps.indexOf("s") >= 0 ? rd : 0);
      M.box(-W / 2, W / 2, y0, y1, 0, t, top);
      // brick, stone or tiles laid inside a border of plain concrete -- a kerb round it
      if (look.mat !== "lwslab" && W > 60 * cm && y1 - y0 > 60 * cm) {
        var kerb = M.mat("concrete", "#c3bfb6"), b = 12 * cm, z = t + 0.25 * cm;
        M.box(-W / 2, W / 2, y0, y0 + b, 0, z, kerb); M.box(-W / 2, W / 2, y1 - b, y1, 0, z, kerb);
        M.box(-W / 2, -W / 2 + b, y0 + b, y1 - b, 0, z, kerb); M.box(W / 2 - b, W / 2, y0 + b, y1 - b, 0, z, kerb);
      }
      // a ramp each end asked for, down to the paving (a wheelchair's way over the kerb)
      [["n", -D / 2, y0], ["s", y1, D / 2]].forEach(function (e) {
        if (ramps.indexOf(e[0]) < 0) { return; }
        var hiY = e[0] === "n" ? e[2] : e[1], loY = e[0] === "n" ? e[1] : e[2], lo = 1.6 * cm;
        M.quad(top, [-W / 2, loY, lo], [W / 2, loY, lo], [W / 2, hiY, t], [-W / 2, hiY, t]);
        // its warning strip, bumps in yellow at the foot
        var y = e[0] === "n" ? loY + 30 * cm : loY - 30 * cm;
        M.quad(M.mat("plastic", "#d9b23a"), [-W / 2 + 8 * cm, y - 30 * cm, lo + (t - lo) * 0.22 + 0.3 * cm], [W / 2 - 8 * cm, y - 30 * cm, lo + (t - lo) * 0.22 + 0.3 * cm],
               [W / 2 - 8 * cm, y + 30 * cm, lo + (t - lo) * 0.62 + 0.3 * cm], [-W / 2 + 8 * cm, y + 30 * cm, lo + (t - lo) * 0.62 + 0.3 * cm]);
        [-1, 1].forEach(function (s) {
          M.quad(top, [s * W / 2, loY, 0], [s * W / 2, hiY, 0], [s * W / 2, hiY, t], [s * W / 2, loY, lo]);
        });
      });
    });
    // Paving for cars: asphalt, the arrows of the way round painted on it
    // (n.arrows: along its length), a crossing in white bars (n.cross: [x0,
    // x1] pairs across it, its own numbers), a stop line at an end (n.stop).
    mDef("i_asphalt", function (M, W, D, H, C, n) {
      C = mPick(C, "#3d3f42", "#f2f1ec");
      var t = Math.max(H, 1.5 * cm), paint = M.mat("plastic", C.frame);
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, t, M.mat("concrete", C.main));
      var long = W >= D, L = long ? W : D, A = long ? D : W, z1 = t + 0.4 * cm;
      function P2(u, v) { return long ? [u, v] : [v, u]; }
      function bar(u0, u1, v0, v1) {                // u along its length, v across it
        var a = P2(u0, v0), b = P2(u1, v1);
        M.box(Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1]), t, z1, paint);
      }
      if (n && n.arrows && L > 9 * FLOOR_PX) {
        // the way round: each half of it one way, keeping right -- every 12 m
        for (var u = -L / 2 + 5 * FLOOR_PX; u < L / 2 - 4 * FLOOR_PX; u += 12 * FLOOR_PX) {
          [-1, 1].forEach(function (s) {
            var v = s * A / 4, dir = long ? s : -s;
            bar(u - dir * 70 * cm, u + dir * 10 * cm, v - 6 * cm, v + 6 * cm);
            var a = P2(u + dir * 10 * cm, v - 30 * cm), b = P2(u + dir * 10 * cm, v + 30 * cm), c = P2(u + dir * 65 * cm, v);
            M.tri(paint, [a[0], a[1], z1], [b[0], b[1], z1], [c[0], c[1], z1], [0, 0, 1], [0, 0, 1], [0, 0, 1]);
          });
        }
      }
      // a crossing: white bars, each 40 cm, 40 cm apart, the walk's width (x0..x1 along W)
      ((n && n.cross) || []).forEach(function (c) {
        for (var v = -D / 2 + 30 * cm; v + 40 * cm < D / 2 - 20 * cm; v += 80 * cm) {
          M.box(c[0] - W / 2 + 10 * cm, c[1] - W / 2 - 10 * cm, v, v + 40 * cm, t, z1, paint);
        }
      });
      if (n && n.stop) {
        var s = n.stop === "s" ? 1 : -1, at = s * (D / 2 - 40 * cm);
        M.box(-W / 2 + 20 * cm, W / 2 - 20 * cm, at - 15 * cm, at + 15 * cm, t, t + 0.4 * cm, paint);
      }
    });
    // A bed: its edge, its earth or gravel, and what grows in it -- clipped
    // box, flowers, grasses, agaves, lavender, moss and stones, big leaves,
    // ferns, shrubs (n.mix) -- an island's in a raised kerb (n.curb).
    mDef("i_plantbed", function (M, W, D, H, C, n) {
      var rnd = mRand((n && n.id) || 31), mix = (n && n.mix) || "shrubs", curb = !!(n && n.curb), P = FLOOR_PX;
      var edgeK = (n && n.edge) || "steel", rim = curb ? 15 * cm : edgeK === "steel" ? 1 * cm : 8 * cm, rt = curb ? 15 * cm : edgeK === "steel" ? 0.6 * cm : 10 * cm;
      var edgeMat = curb ? M.mat("concrete", "#c4c0b8") : edgeK === "brick" ? M.mat("lwbrick", "#9c5642") : edgeK === "wood" ? M.mat("wood", "#7a5a3e")
                  : edgeK === "stone" ? M.mat("stone", "#b9b2a4") : M.mat("metal", "#3a3c3e");
      M.box(-W / 2, W / 2, -D / 2, -D / 2 + rt, 0, rim, edgeMat);
      M.box(-W / 2, W / 2, D / 2 - rt, D / 2, 0, rim, edgeMat);
      M.box(-W / 2, -W / 2 + rt, -D / 2 + rt, D / 2 - rt, 0, rim, edgeMat);
      M.box(W / 2 - rt, W / 2, -D / 2 + rt, D / 2 - rt, 0, rim, edgeMat);
      var gravel = mix === "grasses" || mix === "desert" || mix === "lavender";
      var groundC = mix === "moss" ? "#5f7a3e" : gravel ? (mix === "desert" ? "#c2ab86" : "#a8a49c") : curb && mix !== "box" ? "#4f7a3a" : "#4a3a2c";
      var bed = M.mat(gravel ? "lwgravel" : mix === "moss" || (curb && mix !== "box") ? "leaves" : "soil", groundC), top = curb ? 11 * cm : 4 * cm;
      M.box(-W / 2 + rt, W / 2 - rt, -D / 2 + rt, D / 2 - rt, 0, top, bed);
      var iw = W - 2 * rt - 16 * cm, id = D - 2 * rt - 16 * cm;
      if (iw < 10 * cm || id < 10 * cm) { return; }
      // an island of grass: a low shrub toward each end, the middle kept for its tree
      if (mix === "grass") {
        var lg = iw >= id, half = (lg ? iw : id) / 2, sr = Math.min(0.42 * P, (lg ? id : iw) * 0.35);
        [-1, 1].forEach(function (s) {
          var o = s * Math.max(0, half - sr - 0.1 * P);
          lwPlantOne(M, "shrubs", lg ? o : 0, lg ? 0 : o, top, sr, H, rnd, (n && n.green) || "#4a7a38");
        });
        return;
      }
      // how many, by how big it is: a plant to about every 0.7 square metre, no more than fifty
      var area = iw * id / (P * P), count = Math.max(2, Math.min(50, Math.round(area / (mix === "box" ? 0.55 : 0.75))));
      var cols = Math.max(1, Math.round(Math.sqrt(count * iw / id))), rows = Math.max(1, Math.round(count / cols));
      var green = (n && n.green) || "#4a7a38";
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var x = -iw / 2 + (i + 0.5) * iw / cols + (mix === "box" ? 0 : (rnd() - 0.5) * iw / cols * 0.5);
          var y = -id / 2 + (j + 0.5) * id / rows + (mix === "box" ? 0 : (rnd() - 0.5) * id / rows * 0.5);
          var s = Math.min(iw / cols, id / rows) / 2, pr = Math.min(s * 1.1, 0.55 * P, (Math.min(W, D) / 2 - rt) / 1.5);
          // (its leaves kept over the bed -- a clump of them bulges to half as wide
          // again as it is round, 40-foliage.js: one at the edge of a bed against
          // a wall leaned out through the wall, 2026-10-04)
          var mx = Math.max(0, W / 2 - rt - pr * 1.5), my = Math.max(0, D / 2 - rt - pr * 1.5);
          x = Math.max(-mx, Math.min(mx, x)); y = Math.max(-my, Math.min(my, y));
          lwPlantOne(M, mix, x, y, top, pr, H, rnd, green);
        }
      }
    });
    // Bike parking: a pad, hoops in a row, bikes in most of them; a roof
    // over the lot where it is a shelter (n.shelter).
    mDef("i_bikepark", function (M, W, D, H, C, n) {
      C = mPick(C, "#3a3d40", "#c9c5bc");
      var rnd = mRand((n && n.id) || 37), steel = M.mat("metal", C.main), pad = M.mat("lwslab", C.frame), t = 12 * cm, P = FLOOR_PX;
      M.box(-W / 2, W / 2, -D / 2, D / 2, 0, t, pad);
      var long = W >= D, L = long ? W : D, gap = 0.9 * P, n0 = Math.max(1, Math.floor((L - 0.6 * P) / gap)), u0 = -(n0 - 1) * gap / 2;
      function at(u, v) { return long ? [u, v] : [v, u]; }
      for (var k = 0; k < n0; k++) {
        var u = u0 + k * gap;
        // a hoop, up and over, its feet in the slab
        var last = null;
        for (var i = 0; i <= 8; i++) {
          var a = i / 8 * Math.PI, p = at(u, -Math.cos(a) * 35 * cm);
          var q = [p[0], p[1], t + Math.sin(a) * 52 * cm + (i === 0 || i === 8 ? 0 : 30 * cm)];
          if (i === 0 || i === 8) { q[2] = t; }
          if (last) { M.tube(last, q, 2 * cm, steel, 6); }
          last = q;
          if (i === 0 || i === 8) { var r2 = [p[0], p[1], t + 30 * cm]; M.tube(q, r2, 2 * cm, steel, 6); last = r2; }
        }
        // a bike each side of most hoops, along it
        [-1, 1].forEach(function (s) {
          if (rnd() > 0.62) { return; }
          lwBike(M, at(u + s * 22 * cm, 0), long, t, ["#c43c3a", "#2f5f8a", "#1f2226", "#e0e0dc", "#3f7a4a", "#d98a2b"][Math.floor(rnd() * 6)]);
        });
      }
      if (n && n.shelter) {
        // posts along its back, a glass roof leaning down to the front in a steel frame
        var post = M.mat("metal", "#4a4e52"), roofM = M.mat("glass", "#cfdfe6"), z = 2.3 * P, A = long ? D : W;
        var vb = -A / 2 + 0.2 * P, hiZ = z + 0.3 * P;
        for (var k2 = 0; k2 < 3; k2++) {
          var p2 = at(-L / 2 + 0.3 * P + k2 * (L - 0.6 * P) / 2, vb);
          M.box(p2[0] - 4 * cm, p2[0] + 4 * cm, p2[1] - 4 * cm, p2[1] + 4 * cm, t, hiZ, post);
        }
        var c0 = at(-L / 2 - 0.1 * P, vb - 0.1 * P), c1 = at(L / 2 + 0.1 * P, vb - 0.1 * P), c2 = at(L / 2 + 0.1 * P, A / 2 + 0.2 * P), c3 = at(-L / 2 - 0.1 * P, A / 2 + 0.2 * P);
        M.quad(roofM, [c0[0], c0[1], hiZ], [c1[0], c1[1], hiZ], [c2[0], c2[1], z], [c3[0], c3[1], z]);
        // its frame: a beam along the back, one along the front edge
        [[c0, c1, hiZ], [c3, c2, z]].forEach(function (e) {
          M.box(Math.min(e[0][0], e[1][0]) - 3 * cm, Math.max(e[0][0], e[1][0]) + 3 * cm, Math.min(e[0][1], e[1][1]) - 3 * cm, Math.max(e[0][1], e[1][1]) + 3 * cm,
                e[2] - 6 * cm, e[2], post);
        });
      }
    });
    // Parking rows laid by this part (n.lwRow): the lot's own stalls, lines
    // and stops, without the aisle's arrows, which are the aisle's own.
    if (typeof MODELS === "object" && MODELS.i_parking) {
      var lwLotModel = MODELS.i_parking;
      mDef("i_parking", function (M, W, D, H, C, n) {
        if (!n || !n.lwRow) { return lwLotModel.apply(this, arguments); }
        C = mPick(C, "#3c3e41", "#f2f1ec");
        var t = Math.max(H, 1.5 * cm), paint = M.mat("plastic", C.frame), stop = M.mat("concrete", "#bdbab2");
        M.box(-W / 2, W / 2, -D / 2, D / 2, 0, t, M.mat("concrete", C.main));
        var S = parkLayout(W, D);
        S.rows.forEach(function (r) {
          for (var i = 0; i <= S.n; i++) {
            var x = -W / 2 + S.x0 + i * S.sw;
            M.box(x - 5 * cm, x + 5 * cm, -D / 2 + r.y0 + 0.4 * FLOOR_PX, -D / 2 + r.y1, t, t + 0.4 * cm, paint);
          }
          for (var k = 0; k < S.n; k++) {
            var cx = -W / 2 + S.x0 + (k + 0.5) * S.sw, hy = r.head < 0 ? -D / 2 + r.y0 + 75 * cm : -D / 2 + r.y1 - 75 * cm;
            M.box(cx - 85 * cm, cx + 85 * cm, hy - 8 * cm, hy + 8 * cm, t, t + 11 * cm, stop, 2 * cm);
          }
        });
      });
    }
  }
  // One plant of a bed, of its kind, standing on `z`.
  function lwPlantOne(M, mix, x, y, z, r, H, rnd, green) {
    var P = FLOOR_PX, hi = Math.min(H, 0.9 * P);
    if (mix === "box") {
      M.ball(x, y, z + r * 0.8, r * 0.95, r * 0.95, r * 0.82, M.mat("leaves", mShade("#355f2e", (rnd() - 0.5) * 0.1)), { seg: 7 });
    } else if (mix === "flowers") {
      M.ball(x, y, z + r * 0.45, r * 0.8, r * 0.8, r * 0.5, M.mat("leaves", mShade(green, (rnd() - 0.5) * 0.2)), { seg: 6 });
      var hues = ["#e46b8f", "#f2c94c", "#b07cc6", "#f4f2ec", "#e8743c"];
      for (var f = 0; f < 4; f++) {
        var a = rnd() * Math.PI * 2, d = r * 0.5 * rnd();
        M.ball(x + Math.cos(a) * d, y + Math.sin(a) * d, z + r * 0.85, r * 0.2, r * 0.2, r * 0.14, M.mat("fabric", hues[Math.floor(rnd() * hues.length)]), { seg: 5 });
      }
    } else if (mix === "grasses") {
      var gc = M.mat("leaves", ["#8f9a5a", "#a8a46a", "#6f8a4a"][Math.floor(rnd() * 3)]);
      for (var b = 0; b < 7; b++) {
        var ba = b / 7 * Math.PI * 2 + rnd(), lean = r * (0.5 + rnd() * 0.4);
        M.tube([x, y, z], [x + Math.cos(ba) * lean, y + Math.sin(ba) * lean, z + hi * (0.55 + rnd() * 0.35)], 1.2 * cm, gc, 4);
      }
    } else if (mix === "desert") {
      if (rnd() < 0.35) { M.ball(x, y, z + r * 0.25, r * 0.6, r * 0.5, r * 0.35, M.mat("stone", "#b39c7a"), { seg: 6 }); return; }
      var ag = M.mat("leaves", "#7f9a7a");
      for (var l = 0; l < 9; l++) {
        var la = l / 9 * Math.PI * 2, rr = r * (0.7 + rnd() * 0.3);
        M.tube([x, y, z + 2 * cm], [x + Math.cos(la) * rr, y + Math.sin(la) * rr, z + r * (0.5 + rnd() * 0.5)], 3 * cm, ag, 4, true);
      }
    } else if (mix === "lavender") {
      M.ball(x, y, z + r * 0.4, r * 0.85, r * 0.85, r * 0.45, M.mat("leaves", "#7d8f6a"), { seg: 6 });
      M.ball(x, y, z + r * 0.75, r * 0.7, r * 0.7, r * 0.22, M.mat("fabric", "#8f78b8"), { seg: 6 });
    } else if (mix === "moss") {
      if (rnd() < 0.3) { M.ball(x, y, z, r * 0.55, r * 0.45, r * 0.3, M.mat("stone", "#8f8c86"), { seg: 6 }); return; }
      if (rnd() < 0.4) { M.ball(x, y, z + r * 0.45, r * 0.7, r * 0.7, r * 0.45, M.mat("leaves", "#3f6b34"), { seg: 6 }); }
    } else if (mix === "tropical") {
      var tl = M.mat("leaves", mShade("#3f7a3a", (rnd() - 0.5) * 0.2));
      for (var q = 0; q < 5; q++) {
        var qa = q / 5 * Math.PI * 2 + rnd();
        M.ball(x + Math.cos(qa) * r * 0.45, y + Math.sin(qa) * r * 0.45, z + hi * 0.5, r * 0.55, r * 0.22, r * 0.08, tl, { seg: 5 });
      }
      if (rnd() < 0.5) { M.ball(x, y, z + hi * 0.6, r * 0.18, r * 0.18, r * 0.14, M.mat("fabric", rnd() < 0.5 ? "#e0444f" : "#f29a2e"), { seg: 5 }); }
    } else if (mix === "ferns") {
      var fc = M.mat("leaves", "#4f7d3a");
      for (var e = 0; e < 6; e++) {
        var ea = e / 6 * Math.PI * 2 + rnd();
        M.ball(x + Math.cos(ea) * r * 0.4, y + Math.sin(ea) * r * 0.4, z + r * 0.35, r * 0.5, r * 0.16, r * 0.1, fc, { seg: 5 });
      }
    } else {
      M.ball(x, y, z + r * 0.7, r, r, r * 0.75, M.mat("leaves", mShade(green, (rnd() - 0.5) * 0.25)), { seg: 6 });
    }
  }
  // A bike standing at a hoop: two wheels, its frame, a saddle, the bars.
  function lwBike(M, at, long, t, color) {
    var R = 33 * cm, half = 52 * cm, rub = M.mat("rubber", "#151515"), frame = M.mat("metal", color), dark = M.mat("metal", "#2a2c2e");
    function P3(a, z) { return long ? [at[0], at[1] + a, t + z] : [at[0] + a, at[1], t + z]; }
    [-half, half].forEach(function (a) {
      M.push();
      var c = P3(a, R);
      M.move(c[0], c[1], c[2]);
      if (long) { M.tiltY(90); } else { M.tiltX(90); }
      M.cyl(0, 0, -1.6 * cm, 1.6 * cm, R, rub, { seg: 14, bottom: true });
      M.cyl(0, 0, -1.8 * cm, 1.8 * cm, R * 0.18, dark, { seg: 8, bottom: true });
      M.pop();
    });
    var crank = P3(-2 * cm, R), seat = P3(-14 * cm, R + 50 * cm), head = P3(32 * cm, R + 46 * cm);
    M.tube(P3(-half, R), crank, 1.4 * cm, frame, 5);
    M.tube(crank, seat, 1.6 * cm, frame, 5);
    M.tube(seat, head, 1.6 * cm, frame, 5);
    M.tube(crank, head, 1.8 * cm, frame, 5);
    M.tube(head, P3(half, R), 1.4 * cm, frame, 5);
    M.box(seat[0] - (long ? 6 : 12) * cm, seat[0] + (long ? 6 : 12) * cm, seat[1] - (long ? 12 : 6) * cm, seat[1] + (long ? 12 : 6) * cm, seat[2], seat[2] + 4 * cm, dark);
    var bar = long ? [[head[0] - 25 * cm, head[1], head[2] + 6 * cm], [head[0] + 25 * cm, head[1], head[2] + 6 * cm]]
                   : [[head[0], head[1] - 25 * cm, head[2] + 6 * cm], [head[0], head[1] + 25 * cm, head[2] + 6 * cm]];
    M.tube(bar[0], bar[1], 1.2 * cm, dark, 5);
  }

  // ---- the plan of it: walks, beds, rows, aisles, islands -------------------------------------------
  // Everything in the lot's own numbers (40-outside.js's ybFrame): x along
  // the street, y toward it.  How wide each thing is, by what is built.
  function lwDims(type, keys, joined) {
    var P = FLOOR_PX, store = !!LW_STORES[type], school = type === "school";
    var D = { SW: 2.6 * P, SD: 5.5 * P, AW: 6.6 * P, isle: 2.6 * P, EW: 6.6 * P,
              walkF: (store || school ? 3.0 : type === "office" ? 2.4 : 2.0) * P, walkS: (school ? 2.0 : 1.8) * P, walkB: 1.5 * P,
              bedF: store ? 0 : 1.5 * P, bedS: store ? 0.9 * P : 1.0 * P, bedB: 0,
              bufF: 3.2 * P, bufS: 1.8 * P, bufB: 1.8 * P, ww: (store || school ? 3.0 : 2.0) * P };
    if (!keys.walks) { D.walkF = D.walkS = D.walkB = 0; }
    if (!keys.beds) { D.bedF = D.bedS = 0; }
    function gap(w, b) { return keys.walks ? w + b : Math.max(1.2 * P, b); }
    D.gapF = gap(D.walkF, D.bedF);
    D.gapSL = joined.left ? 0 : gap(D.walkS, D.bedS);
    D.gapSR = joined.right ? 0 : gap(D.walkS, D.bedS);
    D.gapB = gap(D.walkB, D.bedB);
    return D;
  }
  // The stalls a building wants: a flat's one and a half, a shop's, an
  // office's, a school's by its floor (40-parking.js's parkWanted), every
  // floor of it counted.
  function lwStallsWanted(type, H) {
    var floors = typeof floorsOf === "function" ? floorsOf() : [], rooms = H.rooms;
    if (floors.length) {
      var f0 = H.rooms.length ? floorAt(floors, H.rooms[0].x, H.rooms[0].y) : null;
      if (f0) {
        rooms = hand.nodes.filter(function (r) { if (r.kind !== "i_room") { return false; } var f = floorAt(floors, r.x, r.y); return f && f.bldg === f0.bldg; });
      }
    }
    return typeof parkWanted === "function" ? parkWanted(type, rooms) : 10;
  }
  // The main way in: a door out of the front, nearest the middle of the
  // front -- else any door out that is not a garage's.
  function lwMainDoor(F, doors) {
    var mid = (F.hb.l + F.hb.r) / 2, front = doors.filter(function (o) { return !o.garage && !o.back && !o.d.fireExit && o.oy > 0.5; });
    front.sort(function (a, b) { return (b.d.w || 0) - (a.d.w || 0) || Math.abs(a.x - mid) - Math.abs(b.x - mid); });
    return front[0] || doors.filter(function (o) { return !o.garage && !o.d.fireExit; })[0] || null;
  }

  // The parking, laid out on a lot of any size (L), or none (null: as it
  // would be with room for everything) -- the bands of each side, and every
  // piece to put down: { kind, r: {l, r, t, b}, turn, key, row?, extra }.
  function lwParkPlan(F, D, has, dbl, main, keys, L, ext, extB) {
    extB = bk0(has) ? 0 : (extB || 0);
    var hb = F.hb, SD = D.SD, AW = D.AW, SW = D.SW, IS = D.isle, P = F.P, out = [], stalls = 0;
    var Lx = L || { l: -Infinity, r: Infinity, t: -Infinity, b: Infinity };
    var F0 = hb.b + D.gapF, B0 = hb.t - D.gapB, R0 = hb.r + D.gapSR, L0 = hb.l - D.gapSL;
    var fr = has.front ? { rowA: [F0, F0 + SD], aisle: [F0 + SD, F0 + SD + AW], rowB: dbl.front ? [F0 + SD + AW, F0 + 2 * SD + AW] : null } : null;
    if (fr) { fr.end = fr.rowB ? fr.rowB[1] : fr.aisle[1]; }
    var bk = has.back ? { rowA: [B0 - SD, B0], aisle: [B0 - SD - AW, B0 - SD], rowB: dbl.back ? [B0 - 2 * SD - AW, B0 - SD - AW] : null } : null;
    if (bk) { bk.end = bk.rowB ? bk.rowB[0] : bk.aisle[0]; }
    var rt = has.right ? { inner: [R0, R0 + SD], aisle: [R0 + SD, R0 + SD + AW], outer: dbl.right ? [R0 + SD + AW, R0 + 2 * SD + AW] : null } : null;
    var lt = has.left ? { inner: [L0 - SD, L0], aisle: [L0 - SD - AW, L0 - SD], outer: dbl.left ? [L0 - 2 * SD - AW, L0 - SD - AW] : null } : null;
    // (behind, with nothing at either side: a drive along a free side out to it)
    if (bk && !rt && !lt && !fr) {
      if (!D.joinedR) { rt = { inner: null, aisle: [R0, R0 + AW], outer: null, drive: true }; }
      else if (!D.joinedL) { lt = { inner: null, aisle: [L0 - AW, L0], outer: null, drive: true }; }
    }
    if (rt) { rt.end = rt.outer ? rt.outer[1] : rt.aisle[1]; }
    if (lt) { lt.end = lt.outer ? lt.outer[0] : lt.aisle[0]; }
    // how far the rows in front and behind run, with nothing beside them:
    // a little past the building (to the lot's line where it is joined), or
    // as far as more stalls want
    var xa = D.joinedL ? hb.l : hb.l - D.gapSL - IS - (ext || 0), xb = D.joinedR ? hb.r : hb.r + D.gapSR + IS + (ext || 0);
    if (L) { xa = Math.max(xa, Lx.l + (D.joinedL ? 0 : D.bufS)); xb = Math.min(xb, Lx.r - (D.joinedR ? 0 : D.bufS)); }
    var rowAl = lt ? (lt.inner ? lt.inner[0] : lt.aisle[1]) : xa, rowAr = rt ? (rt.inner ? rt.inner[1] : rt.aisle[0]) : xb;
    var aisleL = lt ? lt.aisle[0] : xa, aisleR = rt ? rt.aisle[1] : xb, endL = lt ? lt.end : xa, endR = rt ? rt.end : xb;
    var frontEdge = L ? Lx.b : (fr ? fr.end + D.bufF : hb.b + D.gapF + 6 * P);
    function piece(kind, l, r, t, b, turn, key, extra) {
      l = lwG(l); r = lwG(r); t = lwG(t); b = lwG(b);
      if (r - l < 4 || b - t < 4) { return null; }
      var p = { kind: kind, r: { l: l, r: r, t: t, b: b }, turn: turn || 0, key: key || "parking", extra: extra || {} };
      out.push(p);
      return p;
    }
    // A row of stalls along `axis` ("x" or "y") from a0 to a1, across c0..c1,
    // noses turned `turn`; cut where something else goes (cuts: {a0, a1,
    // what}), an island at each end asked for, another every ten stalls.
    function row(axis, a0, a1, c0, c1, turn, cuts, ends) {
      if (a1 - a0 < 2) { return; }
      cuts = (cuts || []).filter(function (c) { return c.a1 > a0 && c.a0 < a1; }).sort(function (p, q) { return p.a0 - q.a0; });
      function rect(u0, u1) { return axis === "x" ? [u0, u1, c0, c1] : [c0, c1, u0, u1]; }
      var free = [], at = a0;
      cuts.forEach(function (c) {
        if (c.a0 > at) { free.push([at, c.a0]); }
        var R = rect(Math.max(a0, c.a0), Math.min(a1, c.a1));
        if (c.what === "walk") { piece("i_sidewalk", R[0], R[1], R[2], R[3], 0, keys.walks ? "walks" : "parking", { pave: D.look.pave, ramps: c.ramps || "" }); }
        else if (c.what === "bikes") { piece("i_bikepark", R[0], R[1], R[2], R[3], axis === "x" ? 0 : 90, "bikes", { shelter: c.shelter }); }
        else if (c.what === "entry") { piece("i_asphalt", R[0], R[1], R[2], R[3], 0, "parking", {}); }
        else if (c.what === "isle") { isle(R); }
        at = Math.max(at, c.a1);
      });
      if (at < a1) { free.push([at, a1]); }
      free.forEach(function (f) {
        var u0 = f[0], u1 = f[1];
        if (u1 - u0 < SW + 2) { if (u1 - u0 > 0.4 * P) { isle(rect(u0, u1)); } return; }
        if (ends[0] && Math.abs(u0 - a0) < 1) { isle(rect(u0, u0 + IS)); u0 += IS; }
        if (ends[1] && Math.abs(u1 - a1) < 1) { isle(rect(u1 - IS, u1)); u1 -= IS; }
        var n = Math.floor((u1 - u0 + 1) / SW);
        if (n < 1) { if (u1 - u0 > 0.4 * P) { isle(rect(u0, u1)); } return; }
        // (long rows broken by an island every ten stalls or so)
        var runs = Math.max(1, Math.round(n / 11)), per = Math.floor((n - (runs - 1)) / runs), left = n - (runs - 1) - per * runs;
        var spare = (u1 - u0) - n * SW, u = u0 + spare / 2;
        for (var k = 0; k < runs; k++) {
          var m = per + (k < left ? 1 : 0);
          if (m > 0) {
            var R = rect(u, u + m * SW), p = piece("i_parking", R[0], R[1], R[2], R[3], turn, "parking", { lwRow: true });
            if (p) { p.row = m; stalls += m; }
            u += m * SW;
          }
          if (k < runs - 1) { isle(rect(u, u + SW), true); u += SW; }
        }
        // what is left over at the ends, an island's kerb wider
        if (spare > 0.3 * P) { isle(rect(u0, u0 + spare / 2)); isle(rect(u1 - spare / 2, u1)); }
      });
    }
    function isle(R, lamp) { piece("i_plantbed", R[0], R[1], R[2], R[3], 0, "parking", { curb: true, mix: D.look.mix === "box" ? "box" : "grass", tree: !lamp, lamp: !!lamp }); }
    // the walk through to the door, at its front -- and the way in kept apart from it
    var spine = null, entry = null;
    // (an end of a row is an island a stall wide -- or, where a side's rows
    // meet it, the corner's, as wide as a row is deep)
    var endA0 = rowAl + (lt && lt.inner ? SD : IS), endA1 = rowAr - (rt && rt.inner ? SD : IS);
    var endB0 = endL + (lt && lt.outer ? SD : IS), endB1 = endR - (rt && rt.outer ? SD : IS);
    if (fr) {
      var lo = endA0 + SW / 2, hi = endA1 - SW / 2;
      if (main && main.oy > 0.5 && hi > lo) { spine = Math.max(lo, Math.min(hi, main.x)); }
      var eLo = endB0, eHi = endB1 - D.EW, ends = [];
      if (eHi >= eLo) {
        if (rt && !lt) { ends = [eLo, eHi]; } else if (lt && !rt) { ends = [eHi, eLo]; }
        else { ends = spine !== null && Math.abs(spine - eLo) > Math.abs(spine - eHi) ? [eLo, eHi] : [eHi, eLo]; }
        for (var ei = 0; ei < ends.length && entry === null; ei++) {
          if (spine === null || Math.abs(ends[ei] + D.EW / 2 - spine) > D.EW / 2 + SW / 2 + 1.0 * P) { entry = ends[ei]; }
        }
        if (entry === null) { entry = ends[0]; spine = null; }
      }
      var bikeAt = null;
      if (keys.bikes && spine !== null) {
        var bw = (D.bikeStalls || 2) * SW, side = entry !== null && entry + D.EW / 2 > spine ? -1 : 1;
        var b0 = side < 0 ? spine - SW / 2 - bw : spine + SW / 2;
        if (b0 >= endA0 && b0 + bw <= endA1) { bikeAt = [b0, b0 + bw]; }
        else { side = -side; b0 = side < 0 ? spine - SW / 2 - bw : spine + SW / 2; if (b0 >= endA0 && b0 + bw <= endA1) { bikeAt = [b0, b0 + bw]; } }
      }
      // row A, nosed to the walk; the corners where a side's rows meet it, islands
      var cutsA = [];
      if (rt && rt.inner) { cutsA.push({ a0: rt.inner[0], a1: rt.inner[1], what: "isle" }); }
      if (lt && lt.inner) { cutsA.push({ a0: lt.inner[0], a1: lt.inner[1], what: "isle" }); }
      if (spine !== null) { cutsA.push({ a0: spine - SW / 2, a1: spine + SW / 2, what: "walk", ramps: "s" }); }
      if (bikeAt) { cutsA.push({ a0: bikeAt[0], a1: bikeAt[1], what: "bikes", shelter: D.shelter }); }
      row("x", rowAl, rowAr, fr.rowA[0], fr.rowA[1], 0, cutsA, [!lt, !rt]);
      // the aisle, the crossing to the door on it
      piece("i_asphalt", aisleL, aisleR, fr.aisle[0], fr.aisle[1], 0, "parking",
            { arrows: true, cross: spine !== null ? [[lwG(spine - SW / 2) - lwG(aisleL), lwG(spine + SW / 2) - lwG(aisleL)]] : [] });
      // row B, nosed to the street, the way in through it
      if (fr.rowB) {
        var cutsB = [];
        if (rt && rt.outer) { cutsB.push({ a0: rt.outer[0], a1: rt.outer[1], what: "isle" }); }
        if (lt && lt.outer) { cutsB.push({ a0: lt.outer[0], a1: lt.outer[1], what: "isle" }); }
        if (entry !== null) { cutsB.push({ a0: entry, a1: entry + D.EW, what: "entry" }); }
        if (spine !== null) { cutsB.push({ a0: spine - SW / 2, a1: spine + SW / 2, what: "walk", ramps: "n" }); }
        row("x", endL, endR, fr.rowB[0], fr.rowB[1], 180, cutsB, [!(lt && lt.outer), !(rt && rt.outer)]);
      }
      // through the strip to the street: the way in, and the walk
      if (entry !== null) {
        piece("i_asphalt", entry, entry + D.EW, fr.end, frontEdge - 1.5 * P, 0, "parking", {});
        piece("i_driveway", entry, entry + D.EW, frontEdge - 1.5 * P, frontEdge, 0, "parking", {});
      }
      if (spine !== null) { piece("i_sidewalk", spine - SW / 2, spine + SW / 2, fr.end, frontEdge, 0, keys.walks ? "walks" : "parking", { pave: D.look.pave }); }
      fr.spine = spine; fr.entry = entry; fr.bikes = bikeAt;
    }
    // behind: the same, nosed to the building, its far row against the lot's back
    if (bk) {
      var cutsBA = [];
      if (rt && rt.inner) { cutsBA.push({ a0: rt.inner[0], a1: rt.inner[1], what: "isle" }); }
      if (lt && lt.inner) { cutsBA.push({ a0: lt.inner[0], a1: lt.inner[1], what: "isle" }); }
      row("x", rowAl, rowAr, bk.rowA[0], bk.rowA[1], 180, cutsBA, [!lt, !rt]);
      piece("i_asphalt", aisleL, aisleR, bk.aisle[0], bk.aisle[1], 0, "parking", { arrows: true });
      if (bk.rowB) {
        var cutsBB = [];
        if (rt && rt.outer) { cutsBB.push({ a0: rt.outer[0], a1: rt.outer[1], what: "isle" }); }
        if (lt && lt.outer) { cutsBB.push({ a0: lt.outer[0], a1: lt.outer[1], what: "isle" }); }
        row("x", endL, endR, bk.rowB[0], bk.rowB[1], 0, cutsBB, [!(lt && lt.outer), !(rt && rt.outer)]);
      }
      // (both sides joined: out the back to the lane behind)
      if (D.joinedL && D.joinedR && !fr && L) {
        var mx = lwG((hb.l + hb.r) / 2 - D.EW / 2);
        piece("i_asphalt", mx, mx + D.EW, Lx.t + 1.5 * P, bk.end, 0, "parking", {});
        piece("i_driveway", mx, mx + D.EW, Lx.t, Lx.t + 1.5 * P, 0, "parking", {});
      }
    }
    // the sides: an inner row nosed to the walk along the building, the
    // aisle, an outer row against the lot's side
    var B1 = B0 - extB;
    if (L && !bk) { B1 = Math.max(B1, Lx.t + D.bufB); }
    [[rt, 1], [lt, -1]].forEach(function (S) {
      var c = S[0], s = S[1];
      if (!c) { return; }
      var top = bk ? bk.aisle[1] : B1, foot = fr ? fr.aisle[0] : frontEdge - 1.5 * P;
      if (c.inner) { row("y", bk ? B0 : B1, fr ? F0 : frontEdge - D.bufF, c.inner[0], c.inner[1], s > 0 ? 270 : 90, [], [!bk, !fr]); }
      piece("i_asphalt", c.aisle[0], c.aisle[1], top, foot, 0, "parking", { arrows: !c.drive });
      if (!fr) { piece("i_driveway", c.aisle[0], c.aisle[1], frontEdge - 1.5 * P, frontEdge, 0, "parking", {}); }
      if (c.outer) {
        row("y", bk ? bk.aisle[0] : B1, fr ? fr.aisle[1] : frontEdge - D.bufF, c.outer[0], c.outer[1], s > 0 ? 90 : 270, [],
            [!(bk && bk.rowB), !(fr && fr.rowB)]);
      }
    });
    var reach = { front: fr ? fr.end : null, back: bk ? bk.end : (extB && (rt || lt) ? B1 : null), right: rt ? rt.end : null, left: lt ? lt.end : null,
                  xa: Math.min(endL, aisleL, rowAl), xb: Math.max(endR, aisleR, rowAr) };
    return { pieces: out, stalls: stalls, fr: fr, bk: bk, rt: rt, lt: lt, reach: reach, spine: spine, entry: entry };
  }

  function bk0(has) { return !!has.back; }
  // How many rows each side has: one each, doubled side by side until
  // there are stalls enough -- the front first, then the sides, then behind.
  function lwParkFit(F, D, has, main, keys, need) {
    var dbl = {}, order = ["front", "right", "left", "back"].filter(function (k) { return has[k]; }), plan = lwParkPlan(F, D, has, dbl, main, keys, null, 0);
    for (var i = 0; i < order.length && plan.stalls < need; i++) {
      dbl[order[i]] = true;
      plan = lwParkPlan(F, D, has, dbl, main, keys, null, 0);
    }
    // (in front or behind alone, still short: the rows run on past the building;
    // at a side with none behind, back past the building's back)
    var ext = 0, extB = 0;
    if (plan.stalls < need && !has.left && !has.right && (has.front || has.back) && !(D.joinedL && D.joinedR)) {
      var rows = (has.front ? (dbl.front ? 2 : 1) : 0) + (has.back ? (dbl.back ? 2 : 1) : 0);
      ext = Math.min(25 * F.P, Math.ceil((need - plan.stalls) / Math.max(1, rows) / 2) * D.SW);
      plan = lwParkPlan(F, D, has, dbl, main, keys, null, ext);
    }
    if (plan.stalls < need && (has.left || has.right) && !has.back) {
      var srows = (has.left ? (dbl.left ? 2 : 1) : 0) + (has.right ? (dbl.right ? 2 : 1) : 0);
      extB = Math.min(30 * F.P, Math.ceil((need - plan.stalls) / Math.max(1, srows)) * D.SW);
      plan = lwParkPlan(F, D, has, dbl, main, keys, null, ext, extB);
    }
    return { dbl: dbl, ext: ext, extB: extB, plan: plan };
  }

  // ---- the lot, as big as the site wants ------------------------------------------------------------
  // In the lot's numbers: each side out to what is on it and its strip, the
  // sides joined to the next building exactly the building's.  `fresh`, a
  // lot just made with the building: from the usual setbacks round it (a
  // block of flats' lot, grown for a ring of parking by 40-parking.js,
  // back to what this site needs); else never smaller than drawn.
  function lwLotFit(F, D, fit, keys, joined, fresh, type) {
    var P = F.P, hb = F.hb, L = F.L, lot = F.lot, step = typeof feetHere === "function" && feetHere() ? 5 * 0.3048 * P : P;
    var sb = typeof lotSetbacks === "function" ? lotSetbacks(null) : { front: 6, side: 1.5, back: 4.5 };
    var want = fresh ? { l: hb.l - (sb.side + 1.5) * P, r: hb.r + (sb.side + 1.5) * P, t: hb.t - (sb.back + 6) * P, b: hb.b + (sb.front + 0.5) * P }
                     : { l: L.l, r: L.r, t: L.t, b: L.b };
    var R = fit ? fit.plan.reach : null;
    function grow(k, v) { if (k === "l" || k === "t") { want[k] = Math.min(want[k], v); } else { want[k] = Math.max(want[k], v); } }
    if (keys.walks || keys.beds) {
      grow("l", hb.l - D.gapSL - 1.0 * P); grow("r", hb.r + D.gapSR + 1.0 * P); grow("t", hb.t - D.gapB - 1.0 * P); grow("b", hb.b + D.gapF + 1.0 * P);
    }
    if (R) {
      if (R.front !== null) { grow("b", R.front + D.bufF); }
      if (R.back !== null) { grow("t", R.back - D.bufB); }
      if (R.right !== null) { grow("r", R.right + D.bufS); }
      if (R.left !== null) { grow("l", R.left - D.bufS); }
      grow("l", R.xa - (joined.left ? 0 : D.bufS)); grow("r", R.xb + (joined.right ? 0 : D.bufS));
      // (a way in from the side, with nothing in front: out past the building's front)
      if (R.front === null && (R.right !== null || R.left !== null)) { grow("b", hb.b + D.gapF + 6 * P); }
    }
    // rounded out to whole metres (or five feet), the joined sides exactly the building's
    ["l", "t"].forEach(function (k) { var o = k === "l" ? hb.l : hb.t; want[k] = o - Math.ceil((o - want[k]) / step - 0.001) * step; });
    ["r", "b"].forEach(function (k) { var o = k === "r" ? hb.r : hb.b; want[k] = o + Math.ceil((want[k] - o) / step - 0.001) * step; });
    if (joined.left) { want.l = hb.l; }
    if (joined.right) { want.r = hb.r; }
    // (a shop joined to the next in a row: its front a walk's width from the street)
    if (fresh && (joined.left || joined.right) && !(R && R.front !== null)) {
      want.b = LW_STORES[type] ? hb.b + Math.max(D.gapF, 3.0 * P) : Math.min(want.b, hb.b + Math.max(D.gapF + 1.0 * P, 3.0 * P));
    }
    var cx = (want.l + want.r) / 2, cy = (want.t + want.b) / 2, at = F.world(cx, cy);
    var w = Math.round(want.r - want.l), h = Math.round(want.b - want.t);
    if (w === Math.round(lot.w) && h === Math.round(lot.h) && Math.abs(at[0] - lot.x) < 1 && Math.abs(at[1] - lot.y) < 1) { return false; }
    lot.w = w; lot.h = h; lot.x = Math.round(at[0]); lot.y = Math.round(at[1]); lot.own = true;
    lwOnPaper(lot);
    return true;
  }
  // A lot grown up the paper past its top: the whole drawing moved down --
  // drawn, each shape is kept on the paper (10-hand.js), and the lot alone
  // pushed back down slid off its building (2026-10-03).
  function lwOnPaper(lot) {
    var q = turned(lot), top = lot.y - q.h / 2;
    if (top >= 40) { return; }
    var dy = Math.ceil(40 - top);
    hand.nodes.forEach(function (n) { n.y = Math.round(n.y + dy); });
  }
  // The floors over and under drawn beside the lot on the paper: moved over
  // to keep clear of it, all together, as they were laid out (the starter's
  // rows of floors, 39-starter.js).  The lot grown by 40-parking.js for a
  // block of flats ran under the floor beside it (2026-10-03).
  function lwUppers() {
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var ups = floors.filter(function (f) { return f.level !== 0; }).map(function (f) { return f.n; });
    var held = [];
    ups.forEach(function (c) { held.push(c); hand.nodes.forEach(function (n) { if (n !== c && n.kind !== "i_lot" && insideArea(c, n.x, n.y)) { held.push(n); } }); });
    return { frames: ups, all: held };
  }
  function lwReflow(lot, U) {
    if (!U || !U.frames.length) { return; }
    var gb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity }, ub = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    var upSet = new Set(U.all);
    function grow(b, n) { var q = turned(n); b.l = Math.min(b.l, n.x - q.w / 2); b.r = Math.max(b.r, n.x + q.w / 2); b.t = Math.min(b.t, n.y - q.h / 2); b.b = Math.max(b.b, n.y + q.h / 2); }
    hand.nodes.forEach(function (n) { if (!upSet.has(n) && (n === lot || n.kind === "i_lot" || n.kind === "i_floor" || insideArea(lot, n.x, n.y))) { grow(gb, n); } });
    U.frames.forEach(function (n) { grow(ub, n); });
    if (gb.l === Infinity || ub.l === Infinity) { return; }
    var meets = ub.l < gb.r + 240 && ub.r > gb.l - 240 && ub.t < gb.b + 240 && ub.b > gb.t - 240;
    if (!meets) { return; }
    var dx = Math.round(gb.r + 240 - ub.l), dy = Math.round(gb.t - ub.t);
    U.all.forEach(function (n) { n.x = Math.round(n.x + dx); n.y = Math.round(n.y + dy); });
  }

  // ---- put down -------------------------------------------------------------------------------------
  // Each piece of the plan put on the lot, turned with it; cars in most of
  // the stalls, a tree on each island, lamps over the aisles.
  function lwPut(F, p) {
    var r = p.r, side = (p.turn || 0) % 180 !== 0, cx = (r.l + r.r) / 2, cy = (r.t + r.b) / 2;
    var n = ybPut(F, p.kind, cx, cy, p.turn || 0);
    n.w = Math.round(side ? r.b - r.t : r.r - r.l); n.h = Math.round(side ? r.r - r.l : r.b - r.t);
    n.own = true; n.yard = p.key;
    Object.keys(p.extra || {}).forEach(function (k) { if (p.extra[k] !== undefined && k !== "tree" && k !== "lamp") { n[k] = p.extra[k]; } });
    return n;
  }
  function lwTree(F, x, y, sp, key, crown) {
    var P = F.P, wide = (crown || (typeof PLANT_SPREAD === "object" && PLANT_SPREAD[sp]) || 4) * P;
    var size = Math.round(Math.max(20, Math.min(140, wide / P / 3.6 * 48)));
    var n = ybPut(F, "i_tree", x, y, 0);
    n.w = size; n.h = size; n.text = ""; n.sp = sp; n.own = true; n.yard = key;
    n.crown = Math.round(wide / P * 10) / 10;
    n.tall = Math.round(((typeof OBJ3_TREE_TALL === "object" && OBJ3_TREE_TALL[sp]) || 8) * (crown ? 0.75 : 1) * 10) / 10;
    var look = lwLook();
    if (look.red && sp === "maple") { n.fin = { main: "#a8452f" }; }
    return n;
  }
  function lwSeed(F) {
    var seed = Math.round(Math.abs(F.lot.x) * 3 + Math.abs(F.lot.y) * 7) + 11, k = 0;
    return function () { var v = Math.sin(seed * 0.0137 + (++k) * 12.9898) * 43758.5453; return v - Math.floor(v); };
  }
  function lwPlace(F, plan, D, keys) {
    var P = F.P, rnd = lwSeed(F), look = D.look, got = 0, isles = [];
    plan.pieces.forEach(function (p) {
      if (p.kind === "i_bikepark" && !keys.bikes) { return; }
      var n = lwPut(F, p);
      if (p.kind === "i_plantbed" && p.extra.curb) { n.edge = "curb"; n.green = look.hedge || "#4a7a38"; isles.push({ n: n, p: p }); }
      if (p.kind === "i_bikepark") { n.racks = Math.floor(Math.max(p.r.r - p.r.l, p.r.b - p.r.t) / (0.9 * P)); }
      if (p.kind === "i_parking" && p.row) {
        got += p.row;
        // cars nose in, in most of them (each its own throw: the same lot, the same cars)
        var S = parkLayout(n.w, n.h), nt = n.turn || 0, t = nt * Math.PI / 180;
        S.stalls.forEach(function (st) {
          if (rnd() > 0.68) { return; }
          var lx = st.x - n.w / 2, ly = st.y - n.h / 2;
          var car = adviceAdd("i_parked", Math.round(n.x + lx * Math.cos(t) - ly * Math.sin(t)), Math.round(n.y + lx * Math.sin(t) + ly * Math.cos(t)), ((nt + (st.head < 0 ? 0 : 180)) % 360 + 360) % 360);
          car.own = true; car.yard = "parking";
        });
      }
    });
    // on each island: a tree, or a lamp over the aisle where islands come thick
    isles.forEach(function (o, i) {
      var r = o.p.r, cx = (r.l + r.r) / 2, cy = (r.t + r.b) / 2, small = Math.min(r.r - r.l, r.b - r.t) < 2.0 * P;
      if (small) { return; }
      if (o.p.extra.lamp || (i % 3 === 2 && isles.length > 5)) {
        var lamp = ybPut(F, "i_lamppost", cx, cy, 0);
        lamp.own = true; lamp.yard = "parking"; lamp.text = "";
        return;
      }
      lwTree(F, cx, cy, look.trees[Math.floor(rnd() * look.trees.length)], "parking", Math.min(6, Math.max(3, Math.min(r.r - r.l, r.b - r.t) / P * 1.6)));
    });
    return got;
  }

  // The walk all round it and the beds along its walls -- each side's wall
  // followed where it steps in and out, a landing paved out of every door,
  // a recess with a door in it paved, one without planted.
  function lwWalks(F, D, keys, joined, doors, fr) {
    var P = F.P, hb = F.hb, L = F.L, look = D.look, out = [];
    function put(kind, l, r, t, b, key, extra) {
      l = lwG(l); r = lwG(r); t = lwG(t); b = lwG(b);
      if (r - l < 0.4 * P || b - t < 0.4 * P) { return; }
      out.push({ kind: kind, r: { l: l, r: r, t: t, b: b }, turn: 0, key: key, extra: extra || {} });
    }
    function walk(l, r, t, b, extra) { if (keys.walks || (extra && extra.must)) { put("i_sidewalk", l, r, t, b, keys.walks ? "walks" : "beds", Object.assign({ pave: look.pave }, extra || {})); } }
    function bed(l, r, t, b) { if (keys.beds) { put("i_plantbed", l, r, t, b, "beds", { mix: look.mix, edge: look.edge, green: look.hedge || "#4a7a38" }); } }
    // where the wall is on a side, along it: [from, to, face]
    function profile(side) {
      var cuts = [], lo = side === "front" || side === "back" ? hb.l : hb.t, hi = side === "front" || side === "back" ? hb.r : hb.b;
      F.house.forEach(function (b) {
        if (side === "front" || side === "back") { cuts.push(b.l, b.r); } else { cuts.push(b.t, b.b); }
      });
      cuts = cuts.filter(function (v) { return v > lo + 1 && v < hi - 1; }).concat([lo, hi]).sort(function (p, q) { return p - q; });
      var spans = [];
      for (var i = 0; i + 1 < cuts.length; i++) {
        var a = cuts[i], b2 = cuts[i + 1];
        if (b2 - a < 1) { continue; }
        var m = (a + b2) / 2, face = null;
        F.house.forEach(function (b) {
          var on = side === "front" || side === "back" ? m > b.l && m < b.r : m > b.t && m < b.b;
          if (!on) { return; }
          var v = side === "front" ? b.b : side === "back" ? b.t : side === "right" ? b.r : b.l;
          face = face === null ? v : side === "front" || side === "right" ? Math.max(face, v) : Math.min(face, v);
        });
        if (face !== null) { spans.push([a, b2, face]); }
      }
      return spans;
    }
    // the landings: each door's, across the bed to the walk
    var lands = { front: [], back: [], right: [], left: [] };
    doors.forEach(function (o) {
      if (o.garage) { return; }
      var half = o.w / 2 + 0.8 * P;
      var side = o.oy > 0.5 ? "front" : o.oy < -0.5 ? "back" : o.ox > 0.5 ? "right" : "left";
      if ((side === "left" && joined.left) || (side === "right" && joined.right)) { return; }
      lands[side].push([(side === "front" || side === "back" ? o.x : o.y) - half, (side === "front" || side === "back" ? o.x : o.y) + half]);
    });
    function minus(a, b, holes) {
      var parts = [[a, b]];
      holes.forEach(function (h) {
        var next = [];
        parts.forEach(function (p) {
          if (h[1] <= p[0] || h[0] >= p[1]) { next.push(p); return; }
          if (h[0] > p[0]) { next.push([p[0], h[0]]); }
          if (h[1] < p[1]) { next.push([h[1], p[1]]); }
        });
        parts = next;
      });
      return parts;
    }
    var sL = joined.left ? 0 : D.bedS, sR = joined.right ? 0 : D.bedS;
    // the front: bed (or, a shop's, paving) from the wall out, then the walk
    var urban = !fr && L.b - (hb.b + D.gapF) < 2.4 * P;           // (a front a few steps from the street: paved to it)
    var bandF = hb.b + D.bedF;
    profile("front").forEach(function (s) {
      var x0 = s[0] === hb.l ? s[0] - sL : s[0], x1 = s[1] === hb.r ? s[1] + sR : s[1];
      var withDoor = lands.front.filter(function (h) { return h[1] > x0 && h[0] < x1; });
      // (a deep recess with a door in it: a paved court; with none, planted)
      if (s[2] < hb.b - 0.3 * P && withDoor.length) { walk(x0, x1, s[2], bandF, { must: true }); return; }
      minus(x0, x1, withDoor).forEach(function (p) { if (D.bedF > 0) { bed(p[0], p[1], s[2], bandF); } else if (bandF > s[2] + 2) { walk(p[0], p[1], s[2], bandF, { must: true }); } });
      withDoor.forEach(function (h) { var a = Math.max(x0, h[0]), b = Math.min(x1, h[1]); if (b > a && bandF > s[2] + 2) { walk(a, b, s[2], bandF, { must: true }); } });
    });
    var fx0 = hb.l - (joined.left ? 0 : D.gapSL), fx1 = hb.r + (joined.right ? 0 : D.gapSR);
    walk(fx0, fx1, bandF, urban ? L.b : hb.b + D.gapF);
    // the back: a walk along the wall (the service side, nothing planted)
    var bandB = hb.t - D.bedB;
    profile("back").forEach(function (s) {
      if (s[2] > hb.t + 0.3 * P) { walk(s[0], s[1], bandB, s[2]); }
    });
    walk(fx0, fx1, hb.t - D.gapB, bandB);
    // the sides not joined to another building
    [["right", 1], ["left", -1]].forEach(function (S) {
      var side = S[0], s = S[1];
      if (joined[side]) { return; }
      var edge = s > 0 ? hb.r : hb.l, band = edge + s * D.bedS;
      profile(side).forEach(function (sp) {
        var holes = lands[side].filter(function (h) { return h[1] > sp[0] && h[0] < sp[1]; });
        var a = Math.min(sp[2], band), b = Math.max(sp[2], band);
        minus(sp[0], sp[1], holes).forEach(function (p) { if (D.bedS > 0) { bed(a, b, p[0], p[1]); } });
        holes.forEach(function (h) { var y0 = Math.max(sp[0], h[0]), y1 = Math.min(sp[1], h[1]); if (y1 > y0 && b > a + 2) { walk(a, b, y0, y1, { must: true }); } });
      });
      walk(s > 0 ? band : band - D.walkS, s > 0 ? band + D.walkS : band, hb.t - D.bedB, hb.b + D.bedF);
    });
    // out to the street from the main door, where no walk through the parking goes there
    return out;
  }
  // From each door out of the front to the street, where nothing paved goes
  // already: as wide as the way in is.
  function lwToStreet(F, D, keys, doors, fr, plan) {
    var P = F.P, hb = F.hb, L = F.L, out = [], from = hb.b + D.gapF;
    // (a front a few steps from the street is paved to it, lwWalks)
    if (fr || L.b - from < 1.0 * P || (keys.walks && L.b - from < 2.4 * P)) { return out; }
    var done = [];
    doors.forEach(function (o) {
      if (o.garage || o.back || o.d.fireExit || o.oy < 0.5) { return; }
      if (done.some(function (x) { return Math.abs(x - o.x) < 8 * P; })) { return; }
      // (not across a side's parking or its way in)
      var half = D.ww / 2;
      if (plan && plan.pieces.some(function (p) { return p.r.l < o.x + half && p.r.r > o.x - half && p.r.b > from && p.r.t < L.b; })) { return; }
      done.push(o.x);
      out.push({ kind: "i_sidewalk", r: { l: lwG(o.x - half), r: lwG(o.x + half), t: lwG(from), b: lwG(L.b) }, turn: 0, key: keys.walks ? "walks" : "beds",
                 extra: { pave: D.look.pave } });
    });
    return out;
  }
  // The strip between the parking and the street, and its sides: a hedge
  // the cars sit behind, trees along it; trees down a side's strip.
  function lwBuffers(F, D, plan, keys) {
    var P = F.P, L = F.L, look = D.look, rnd = lwSeed(F), out = [], trees = [];
    var fr = plan.fr, gaps = [];
    if (fr) {
      if (fr.entry !== null) { gaps.push([fr.entry - 1.0 * P, fr.entry + D.EW + 1.0 * P]); }
      if (fr.spine !== null) { gaps.push([fr.spine - D.SW / 2 - 0.4 * P, fr.spine + D.SW / 2 + 0.4 * P]); }
      var y0 = fr.end + 0.5 * P, y1 = L.b - 0.6 * P, x0 = plan.reach.xa, x1 = plan.reach.xb;
      if (y1 - y0 >= 1.2 * P) {
        var runs = [[x0, x1]];
        gaps.forEach(function (g) {
          var next = [];
          runs.forEach(function (r) { if (g[1] <= r[0] || g[0] >= r[1]) { next.push(r); return; } if (g[0] > r[0]) { next.push([r[0], g[0]]); } if (g[1] < r[1]) { next.push([g[1], r[1]]); } });
          runs = next;
        });
        runs.forEach(function (r) {
          if (r[1] - r[0] < 1.5 * P) { return; }
          // the hedge (or a planted strip, where the style has none) near the street,
          // the trees between it and the cars
          var hy = y1 - 0.45 * P;
          if (look.hedge) { out.push({ kind: "i_hedge", r: { l: lwG(r[0]), r: lwG(r[1]), t: lwG(hy - 0.4 * P), b: lwG(hy + 0.4 * P) }, turn: 0, key: "parking", extra: {} }); }
          else { out.push({ kind: "i_plantbed", r: { l: lwG(r[0]), r: lwG(r[1]), t: lwG(hy - 0.5 * P), b: lwG(hy + 0.5 * P) }, turn: 0, key: "parking", extra: { mix: look.mix, edge: look.edge } }); }
          for (var x = r[0] + 3 * P; x < r[1] - 2 * P; x += 9 * P) { trees.push([x, (y0 + hy - 0.4 * P) / 2 + 0.2 * P]); }
        });
      }
    }
    [["rt", 1], ["lt", -1]].forEach(function (S) {
      var c = plan[S[0]], s = S[1];
      if (!c) { return; }
      var a = c.end + s * 0.3 * P, b = s > 0 ? L.r - 0.3 * P : L.l + 0.3 * P;
      if (Math.abs(b - a) < 1.0 * P) { return; }
      var mx = (a + b) / 2, yA = plan.bk ? plan.bk.end : F.hb.t, yB = fr ? fr.end : L.b - D.bufF;
      for (var y = yA + 3 * P; y < yB - 2 * P; y += 10 * P) { trees.push([mx, y, true]); }
    });
    if (plan.bk) {
      var by = (plan.bk.end + L.t) / 2;
      if (plan.bk.end - L.t >= 1.0 * P) { for (var x2 = plan.reach.xa + 4 * P; x2 < plan.reach.xb - 3 * P; x2 += 10 * P) { trees.push([x2, by, true]); } }
    }
    return { pieces: out, trees: trees, rnd: rnd };
  }
  // Bikes by the door where the parking has no bay for them: beside the
  // walk out of it, on the lawn or the walk round, clear of everything.
  function lwBikesAlone(F, D, main) {
    var P = F.P, w = (D.bikeStalls || 2) * D.SW, d = 2.2 * P, hb = F.hb;
    if (!main) { return null; }
    var tries = [];
    var y = main.oy > 0.5 ? hb.b + D.gapF + d / 2 + 0.3 * P : main.y + main.oy * (D.gapF + d / 2 + 0.3 * P);
    for (var k = 0; k < 12; k++) {
      var off = (k % 2 ? -1 : 1) * (Math.floor(k / 2) * 1.0 * P + D.ww / 2 + w / 2 + 0.6 * P);
      tries.push([main.x + off, y]);
    }
    for (var i = 0; i < tries.length; i++) {
      var b = { l: tries[i][0] - w / 2, r: tries[i][0] + w / 2, t: tries[i][1] - d / 2, b: tries[i][1] + d / 2 };
      if (ybClear(F, b, 0.2 * P)) { return { kind: "i_bikepark", r: { l: lwG(b.l), r: lwG(b.r), t: lwG(b.t), b: lwG(b.b) }, turn: 0, key: "bikes", extra: { shelter: D.shelter } }; }
    }
    // (no room off the walk -- a narrow shop in a row: on the walk, against the wall beside the door)
    if (main.oy > 0.5 && D.walkF >= 2.4 * P) {
      var dw = Math.min(w, 4.5 * P), dd = Math.min(1.8 * P, D.walkF - 1.2 * P), y0 = hb.b + D.bedF;
      var busy = hand.nodes.filter(function (n) { return n.kind !== "i_sidewalk" && ybStands(F, n); }).map(function (n) { return F.box(n, 0.1 * P); });
      for (var k2 = 0; k2 < 10; k2++) {
        var cx = main.x + (k2 % 2 ? -1 : 1) * (main.w / 2 + 0.8 * P + dw / 2 + Math.floor(k2 / 2) * 1.0 * P);
        var bb = { l: cx - dw / 2, r: cx + dw / 2, t: y0, b: y0 + dd };
        if (bb.l < F.L.l + 0.2 * P || bb.r > F.L.r - 0.2 * P) { continue; }
        if (F.zones.some(function (z) { return bb.l < z.r && bb.r > z.l && bb.t < z.b && bb.b > z.t; })) { continue; }
        if (busy.some(function (o) { return bb.l < o.r && bb.r > o.l && bb.t < o.b && bb.b > o.t; })) { continue; }
        return { kind: "i_bikepark", r: { l: lwG(bb.l), r: lwG(bb.r), t: lwG(bb.t), b: lwG(bb.b) }, turn: 0, key: "bikes", extra: {} };
      }
    }
    return null;
  }

  // The whole site of one house's lot (yardHouses, 40-yard.js): what is
  // asked for of it (keys), laid out, its lot made big enough first.
  // `fresh`: just built (the lot made from the usual setbacks).
  function lwSite(H, type, keys, fresh) {
    var F = ybFrame(H);
    if (!F.house.length) { return 0; }
    var P = F.P, joined = lwJoined(), has = keys.parking ? lwParkSides(type, joined) : {}, look = lwLook();
    var D = lwDims(type, keys, joined);
    D.look = look; D.joinedL = !!joined.left; D.joinedR = !!joined.right;
    var need = keys.parking ? lwStallsWanted(type, H) : 0;
    // bikes: a bay two stalls wide, wider for a school's or a big block's, under a roof for theirs
    var bikes = type === "school" ? 24 : type === "apartments" || type === "condos" ? Math.max(8, Math.round(need / 3)) : type === "office" ? Math.max(8, Math.round(need / 4)) : 6;
    D.bikeStalls = bikes > 16 ? 4 : bikes > 10 ? 3 : 2;
    D.shelter = type === "school" || type === "office" || type === "apartments" || type === "condos";
    var doors = ybDoors(F), main = lwMainDoor(F, doors);
    var parkHas = { front: !!has.front, back: !!has.back, left: !!has.left, right: !!has.right };
    var anyLot = parkHas.front || parkHas.back || parkHas.left || parkHas.right;
    var fit = anyLot ? lwParkFit(F, D, parkHas, main, keys, need) : null;
    // the lot, big enough; the floors on the paper moved clear of it
    var U = lwUppers();
    if (lwLotFit(F, D, fit, keys, joined, fresh, type)) { lwReflow(F.lot, U); F = ybFrame(H); doors = ybDoors(F); main = lwMainDoor(F, doors); }
    ybZones(F, doors);
    var plan = anyLot ? lwParkPlan(F, D, parkHas, fit.dbl, main, keys, F.L, fit.ext, fit.extB) : null;
    var got = 0;
    // (the front as laid out, from the building's front line: the rest of a
    // big building has the same in front of it, lwSegment)
    var fb = plan && plan.fr, rel = function (r) { return r ? [r[0] - F.hb.b, r[1] - F.hb.b] : null; };
    F.lot.lwBand = { walk: keys.walks ? [D.bedF, D.gapF] : null, rowA: fb ? rel(fb.rowA) : null, aisle: fb ? rel(fb.aisle) : null,
                     rowB: fb ? rel(fb.rowB) : null, end: fb ? fb.end - F.hb.b : null, pave: look.pave, hedge: look.hedge || null,
                     trees: look.trees, beds: keys.beds ? D.bedF : 0 };
    var walks = lwWalks(F, D, keys, joined, doors, plan && plan.fr).concat(lwToStreet(F, D, keys, doors, plan && plan.fr, plan));
    walks.forEach(function (p) { lwPut(F, p); });
    if (plan) { got = lwPlace(F, plan, D, keys); }
    // bikes, where the parking had no bay for them
    if (keys.bikes && !(plan && plan.fr && plan.fr.bikes)) {
      F.outs = null;
      var bp = lwBikesAlone(F, D, main);
      if (bp) { var bn = lwPut(F, bp); bn.racks = Math.floor((bp.r.r - bp.r.l) / (0.9 * P)); }
    }
    // the strips round the parking, planted; trees along them
    if (plan && (keys.beds || keys.parking)) {
      var B = lwBuffers(F, D, plan, keys);
      B.pieces.forEach(function (p) {
        var n = lwPut(F, p);
        if (p.kind === "i_hedge") { n.h = Math.max(n.h, 30); if (look.hedge) { n.fin = { main: look.hedge }; } }
        if (p.kind === "i_plantbed") { n.green = look.hedge || "#4a7a38"; }
      });
      F.outs = null;
      B.trees.forEach(function (t) {
        var sp = t[2] ? (look.plant === "formal" || look.plant === "med" ? "cypress" : look.plant === "xeric" || look.plant === "tropical" ? "palm"
                         : look.plant === "woodland" ? "birch" : "poplar") : look.trees[Math.floor(B.rnd() * look.trees.length)];
        lwTree(F, t[0], t[1], sp, "parking", t[2] ? 2.6 : 5);
      });
    }
    // the stalls nearest the doors kept for wheelchairs, some for electric cars (40-access.js)
    if (got && typeof acMark === "function") { try { acMark(); } catch (e) { /* the stalls as they are */ } }
    picked = null; chosen = null; many = [];
    return got || 1;
  }
  // What this part puts down, by its keys -- to take away again.
  function lwPieces(key) { return hand.nodes.filter(function (n) { return n.yard === key; }); }
  function lwTake(keysList) {
    var gone = {};
    hand.nodes.forEach(function (n) { if (keysList.indexOf(n.yard) >= 0) { gone[n.id] = true; } });
    if (!Object.keys(gone).length) { return; }
    hand.nodes = hand.nodes.filter(function (n) { return !gone[n.id]; });
    hand.links = hand.links.filter(function (l) { return !gone[l.from] && !gone[l.to]; });
  }
  // Laid out again, after a setting changed or a key was turned on: what
  // of the site there is, plus what is asked.
  function lwRelay(add, drop) {
    var type = lwTypeNow();
    if (!lwSiteType(type)) { return 0; }
    var keys = {};
    Object.keys(LW_KEYS).forEach(function (k) { if (lwPieces(k).length) { keys[k] = true; } });
    (add || []).forEach(function (k) { keys[k] = true; });
    (drop || []).forEach(function (k) { delete keys[k]; });
    // (what stood out in front -- carts in the parking, benches on the walk --
    // goes again where the new layout has room for it)
    var front = Object.keys(LW_FRONT).filter(function (k) { return lwPieces(k).length; });
    lwTake(Object.keys(LW_KEYS).concat(front));
    var put = 0;
    if (Object.keys(keys).length) {
      yardHouses().forEach(function (H) { try { put += lwSite(H, type, keys, false); } catch (e) { if (window.console) { console.warn("site:", e && e.message); } } });
    }
    front.forEach(function (k) { put += lwFrontItems(k); });
    return put;
  }

  // ---- hooked in: Start building's grounds, the view's Settings -----------------------------------
  // The grounds' tiles: a walk all round, beds and trees -- and parking,
  // bikes, these two on by themselves for every building but a home.
  if (typeof YARD_KINDS === "object" && typeof YARD_OF === "object") {
    [["walks", null, null, "front"], ["beds", null, null, "front"]].forEach(function (Y) { if (!YARD_OF[Y[0]]) { YARD_KINDS.push(Y); YARD_OF[Y[0]] = Y; } });
  }
  if (typeof GROUNDS_FOR === "object") {
    ["flats", "office", "school", "store", "eat"].forEach(function (k) {
      var list = GROUNDS_FOR[k];
      if (!list) { return; }
      ["beds", "walks"].forEach(function (key) { if (list.indexOf(key) < 0) { list.splice(Math.min(list.length, list.indexOf("bikes") + 1), 0, key); } });
    });
  }
  if (typeof groundsAsk === "function") {
    var groundsAskSite = groundsAsk;
    groundsAsk = function (ui, want) {
      if (want && lwSiteType(want.type || "house")) {
        want.yard = Object.assign({}, want.yard && typeof want.yard === "object" ? want.yard : {});
        // (on unless turned off: a building's grounds have them)
        ["parking", "bikes", "walks", "beds"].forEach(function (k) { if (want.yard[k] === undefined) { want.yard[k] = true; } });
      }
      return groundsAskSite.apply(this, arguments);
    };
  }
  // A lift's door slides, as a lift's does: the door into each lift's car
  // made a sliding one (40-climb.js draws it as parting steel leaves).
  // A swinging door swung into the car on every floor ("A door swings into
  // this: Elevator", each floor of every block, 2026-10-03).
  function lwLiftDoors(made) {
    var cars = (made || []).filter(function (n) { return n.kind === "i_elevator"; }), changed = [];
    if (!cars.length) { return; }
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; });
    cars.forEach(function (car) {
      var room = rooms.filter(function (r) { return insideArea(r, car.x, car.y); }).sort(function (a, b) { return a.w * a.h - b.w * b.h; })[0];
      if (!room || room.w * room.h > Math.pow(4.5 * FLOOR_PX, 2)) { return; }
      var b = tieBox(room);
      hand.nodes.forEach(function (d) {
        if (d.kind !== "i_door" && d.kind !== "i_door2") { return; }
        var q = turned(d), dx = Math.max(b.l - (d.x + q.w / 2), (d.x - q.w / 2) - b.r, 0), dy = Math.max(b.t - (d.y + q.h / 2), (d.y - q.h / 2) - b.b, 0);
        if (dx > 2 || dy > 2) { return; }
        // (one of its own walls: the hinge side on the room's edge, not a door of the hall beside it)
        var onEdge = Math.min(Math.abs(d.x - b.l), Math.abs(d.x - b.r)) < q.w / 2 + 4 || Math.min(Math.abs(d.y - b.t), Math.abs(d.y - b.b)) < q.h / 2 + 4;
        if (!onEdge || changed.indexOf(d) >= 0) { return; }
        var open = d.kind === "i_door2" ? d.w : Math.max(d.w, d.h);
        d.kind = "i_slide"; d.w = Math.round(Math.min(open, 1.2 * FLOOR_PX)); d.h = 10; d.own = true;
        changed.push(d);
      });
    });
    if (changed.length && typeof snapToWalls === "function") { snapToWalls(changed.map(function (d) { return d.id; })); }
  }
  // (as each building is made, inside the steps that make it: whatever asks for it)
  if (typeof STARTER_WRAPS === "object") {
    STARTER_WRAPS.unshift(function* (inner, want) {
      var before = hand.next, out = yield* inner(want);
      try { lwLiftDoors(hand.nodes.filter(function (n) { return n.id >= before; })); } catch (e) { /* the doors as made */ }
      return out;
    });
  }
  // Made with the building (40-hood.js's hoodBuild): the site first, then
  // the rest of the grounds round it -- the walk and the parking laid, the
  // benches and the playground put where there is room left.
  var lwBusy = null;
  if (typeof yardMake === "function") {
    var yardMakeSite = yardMake;
    yardMake = function (want, made) {
      var type = (want && want.type) || "house", w = want;
      if (!want || want.spread || !lwSiteType(type)) {
        try { if (want && !want.spread) { lwAttachMake(want, made); } } catch (e) { /* standing alone */ }
        return yardMakeSite.apply(this, arguments);
      }
      var Y = want.yard && typeof want.yard === "object" ? want.yard : {}, keys = {};
      Object.keys(LW_KEYS).forEach(function (k) { if (Y[k] !== false) { keys[k] = true; } });
      if (lwParkKind(type) === "none" || lwParkKind(type) === "street") { delete keys.parking; }
      // (a block of flats always had its parking, 40-parking.js: asked for, now, unless turned off)
      w = Object.assign({}, want, { yard: Object.assign({}, Y, { parking: true }) });
      lwBusy = keys;
      try {
        try { lwAttachMake(want, made); } catch (e) { /* standing alone */ }
        var lot = (made || []).filter(function (n) { return n.kind === "i_lot"; })[0];
        if (lot && Object.keys(keys).length) {
          yardHouses().filter(function (H) { return H.lot === lot || H.lot.id === lot.id; }).forEach(function (H) {
            try { lwSite(H, type, keys, true); } catch (e) { if (window.console) { console.warn("site:", e && e.message); } }
          });
        }
        return yardMakeSite.call(this, w, made);
      } finally { lwBusy = null; }
    };
  }
  // One of them turned on or off (the Grounds tab, 40-grounds.js): the
  // site laid out again with it.
  if (typeof yardPut === "function") {
    var yardPutSite = yardPut;
    yardPut = function (key, houses) {
      if (!LW_KEYS[key]) { return yardPutSite.apply(this, arguments); }
      if (lwBusy) { return 1; }                           // (laid out with the rest already)
      if (!lwSiteType(lwTypeNow())) { return key === "parking" || key === "bikes" ? yardPutSite.apply(this, arguments) : 0; }
      return lwRelay([key]);
    };
  }
  // (40-parking.js's ring, asked for anywhere else, is this site's parking)
  if (typeof parkAround === "function") {
    parkAround = function (H) {
      if (lwBusy) { return 1; }
      var type = lwTypeNow();
      try { return lwSite(H, lwSiteType(type) ? type : "office", { parking: true }, false); } catch (e) { return 0; }
    };
  }
  // A dumpster: not on the walk round the back -- behind it, by a corner.
  if (typeof ybDumpster === "function") {
    var ybDumpsterSite = ybDumpster;
    ybDumpster = function (F, doors) {
      var n0 = hand.nodes.length;
      ybDumpsterSite.apply(this, arguments);
      if (hand.nodes.slice(n0).some(function (n) { return n.kind === "i_dumpster"; })) { return; }
      var P = F.P, icon = ICONS.i_dumpster;
      if (!icon) { return; }
      F.outs = null;
      var dw = icon.box[0], dh = icon.box[1], hb = F.hb;
      for (var y = hb.t - 1.8 * P - dh / 2; y > F.L.t + dh / 2; y -= 0.5 * P) {
        for (var k = 0; k < 2; k++) {
          var x = k ? hb.r - dw / 2 : hb.l + dw / 2;
          if (!ybClear(F, { l: x - dw / 2, r: x + dw / 2, t: y - dh / 2, b: y + dh / 2 }, 0.2 * P)) { continue; }
          var n = ybPut(F, "i_dumpster", x, y, 180);
          n.outside = "dumpster";
          return;
        }
      }
    };
  }

  // ---- asked: in Start building, and on the view's Street tab ---------------------------------------
  // How it stands (alone, joined on one side or both, one part of a big
  // building), where its parking is and on which side -- kept with the
  // building (hand.house), asked as it is started (40-street.js's siteAsk,
  // put on by its rdSitePut) and changed after.
  if (typeof RD_SITE === "object") { ["attach", "parkAt", "parkSide"].forEach(function (k) { if (RD_SITE.indexOf(k) < 0) { RD_SITE.push(k); } }); }
  function lwParkChoices(type) { return LW_HOMES[type] || type === "tower" ? ["auto", "street"] : LW_PARKS; }
  function lwParkWord(type, k) { return k === "auto" && (LW_HOMES[type] || type === "tower") ? TXT.lw_pk_drive : TXT["lw_pk_" + k]; }
  function lwHasSide(type, k) {
    if (k === "auto") { k = lwParkKind(type); }
    return k === "side" || k === "frontside";
  }
  function lwAsk(ui, want) {
    var S = want.site || (want.site = {}), type = want.type || "house";
    function now(k) { return S[k] !== undefined ? S[k] : houseOpt(k); }
    ui.head(TXT.lw_attach_head);
    ui.tiles();
    LW_ATTACH.forEach(function (k) {
      ui.tile(TXT["lw_at_" + k], "lw_at_" + k, function () { return (now("attach") || "alone") === k; }, function () { S.attach = k; }, true);
    });
    ui.head(TXT.lw_park_head);
    ui.tiles();
    lwParkChoices(type).forEach(function (k) {
      ui.tile(lwParkWord(type, k), k === "auto" && (LW_HOMES[type] || type === "tower") ? "lw_pk_drive" : "lw_pk_" + k,
              function () { return (now("parkAt") || "auto") === k; }, function () { S.parkAt = k; }, true);
    });
    // which side -- shown while the parking chosen has a side to it
    if (LW_HOMES[type] || type === "tower") { return; }
    ui.head(TXT.lw_side_head);
    ui.tiles();
    var row = [];
    ["left", "right"].forEach(function (k) {
      ui.tile(TXT["lw_sd_" + k], "lw_sd_" + k, function () { return (now("parkSide") || "right") === k; }, function () { S.parkSide = k; }, true);
    });
    // (the sheet is put on the page once it is built: found there, then)
    setTimeout(function () {
      var head = all(".st-sheet .st-head").filter(function (h) { return h.textContent === TXT.lw_side_head; }).pop(), grid = head && head.nextElementSibling;
      if (!grid || !grid.classList.contains("st-tiles")) { return; }
      Array.prototype.forEach.call(grid.children, function (b) {
        var was = b.refresh;
        b.refresh = function () {
          if (was) { was(); }
          var at = S.parkAt !== undefined ? S.parkAt : houseOpt("parkAt");
          var show = lwHasSide(type, LW_PARKS.indexOf(at) >= 0 ? at : "auto");
          grid.style.display = show ? "" : "none";
          head.style.display = show ? "" : "none";
        };
        b.refresh();
      });
    }, 0);
    void row;
  }
  if (typeof siteAsk === "function") {
    var siteAskSite = siteAsk;
    siteAsk = function (ui, want) {
      // (asked after the land, before which side of the street it is on)
      var done = false, mine = Object.assign({}, ui, {
        head: function (t) {
          if (!done && t === TXT.sf_head) { done = true; lwAsk(ui, want); }
          return ui.head(t);
        }
      });
      var out = siteAskSite.call(this, mine, want);
      if (!done) { lwAsk(ui, want); }
      return out;
    };
  }
  // Changed after: the setting kept (one step to Undo), the ground laid out
  // again round the building as it now stands.
  function lwSetSite(key, value) {
    houseSetOpt(key, value);
    try {
      if (key === "attach") { lwAttachNow(); }
      var type = lwTypeNow(), add = [], drop = [];
      if (key === "parkAt" || key === "parkSide" || key === "attach") {
        var k = lwParkKind(type);
        if (k === "none" || k === "street") { drop.push("parking"); } else { add.push("parking"); }
      }
      if (lwSiteType(type)) { lwRelay(add, drop); }
    } catch (e) { if (window.console) { console.warn("site:", e && e.message); } }
    if (typeof yardRedraw === "function") { yardRedraw(); } else { houseFresh(); }
  }
  if (typeof streetSection === "function") {
    var streetSectionSite = streetSection;
    streetSection = function (sheet, head, draw, noStreet) {
      var out = streetSectionSite.apply(this, arguments);
      var type = lwTypeNow();
      head(TXT.lw_attach_head);
      worldPicker(sheet, LW_ATTACH, lwAttach(), "lw_at_", function (k) { lwSetSite("attach", k); draw(); });
      head(TXT.lw_park_head);
      var pk = houseOpt("parkAt"), g = worldPicker(sheet, lwParkChoices(type), LW_PARKS.indexOf(pk) >= 0 ? pk : "auto", "lw_pk_", function (k) { lwSetSite("parkAt", k); draw(); });
      if (LW_HOMES[type] || type === "tower") {
        var first = g.querySelector("button");
        if (first) { first.innerHTML = houseIcon("lw_pk_drive") + "<span></span>"; first.lastChild.textContent = TXT.lw_pk_drive; }
      }
      if (lwHasSide(type, LW_PARKS.indexOf(pk) >= 0 ? pk : "auto")) {
        head(TXT.lw_side_head);
        worldPicker(sheet, ["left", "right"], houseOpt("parkSide") === "left" ? "left" : "right", "lw_sd_", function (k) { lwSetSite("parkSide", k); draw(); });
      }
      void noStreet;
      return out;
    };
  }
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      lw_at_alone: '<path d="M1.6 16.6h16.8"/><path d="M6.4 16.6V9.8L10 6.4l3.6 3.4v6.8"/><path d="M2.6 16.6v-3.4M17.4 16.6v-3.4" stroke-dasharray="1.2 1.2"/>',
      lw_at_one: '<path d="M1.6 16.6h16.8"/><path d="M3 16.6V9.8l3.5-3.2L10 9.8v6.8M10 9.8l3.5-3.2 3.5 3.2v6.8"/>',
      lw_at_row: '<path d="M1.2 16.6h17.6"/><path d="M1.6 16.6V10l2.6-2.6L6.8 10v6.6M6.8 10l2.6-2.6L12 10v6.6M12 10l2.6-2.6 2.6 2.6v6.6"/>',
      lw_at_block: '<rect x="1.6" y="5.6" width="16.8" height="11" rx="0.6"/><path d="M7.2 5.6v11M12.8 5.6v11"/><path d="M8.8 8.6h2.4v2.4H8.8zM8.8 13h2.4v3.6"/>',
      lw_pk_auto: '<rect x="6" y="2.6" width="8" height="6" rx="0.8"/><path d="M2.6 12.2h14.8M2.6 17h14.8M5.4 12.2V17M9.2 12.2V17M13 12.2V17"/>',
      lw_pk_drive: '<path d="M3 9.4 8 5l5 4.4V15H3z"/><path d="M14.6 15V8.6M17.4 15V8.6M14.6 15h2.8"/>',
      lw_pk_none: '<rect x="6" y="4" width="8" height="7" rx="0.8"/><path d="M2.6 15.4h14.8M4 2.6l12 15"/>',
      lw_pk_front: '<rect x="5.4" y="2.6" width="9.2" height="6" rx="0.8"/><path d="M2.6 11.6h14.8v5.8H2.6zM6.2 11.6v5.8M10 11.6v5.8M13.8 11.6v5.8"/>',
      lw_pk_side: '<rect x="2.6" y="5" width="7" height="10" rx="0.8"/><path d="M12 2.6h5.4v14.8H12zM12 6.4h5.4M12 10h5.4M12 13.6h5.4"/>',
      lw_pk_frontside: '<rect x="2.6" y="2.6" width="8" height="7" rx="0.8"/><path d="M13 2.6h4.4V17.4H2.6V12.4H13zM13 6.4h4.4M5.8 12.4v5M9.4 12.4v5M13 12.4v5"/>',
      lw_pk_back: '<rect x="5.4" y="11.4" width="9.2" height="6" rx="0.8"/><path d="M2.6 2.6h14.8v5.8H2.6zM6.2 2.6v5.8M10 2.6v5.8M13.8 2.6v5.8"/>',
      lw_pk_around: '<rect x="6.6" y="6.6" width="6.8" height="6.8" rx="0.6"/><path d="M2.4 2.4h15.2v15.2H2.4z" stroke-dasharray="1.6 1.2"/>',
      lw_pk_street: '<rect x="5.4" y="2.6" width="9.2" height="6" rx="0.8"/><path d="M1.6 11.4h16.8M1.6 17.4h16.8"/><rect x="3.4" y="12.6" width="5" height="2.6" rx="1"/><rect x="11.6" y="12.6" width="5" height="2.6" rx="1"/>',
      lw_sd_left: '<rect x="10.4" y="4" width="7" height="12" rx="0.8"/><path d="M8.4 10H2.6M5.4 7.2 2.6 10l2.8 2.8"/>',
      lw_sd_right: '<rect x="2.6" y="4" width="7" height="12" rx="0.8"/><path d="M11.6 10h5.8M14.6 7.2l2.8 2.8-2.8 2.8"/>',
      yd_walks: '<rect x="6.4" y="6.4" width="7.2" height="7.2" rx="0.6"/><rect x="2.8" y="2.8" width="14.4" height="14.4" rx="1.4"/>',
      yd_beds: '<path d="M2.4 15.8h15.2"/><circle cx="5.8" cy="12.8" r="2.4"/><circle cx="10.2" cy="11.8" r="3"/><circle cx="14.6" cy="12.9" r="2.2"/>'
    });
  }

  // (joined to the building next door: filled in below)
  function lwAttachMake(want, made) { void want; void made; }
  function lwAttachNow() { }

  // The street's own walk from each door (39-house.js) only where the site
  // has none: its walks go to the street already (on uneven land the
  // street's lay over the paving, 2026-10-03).
  if (typeof houseStreetBits === "function") {
    var houseStreetBitsSite = houseStreetBits;
    houseStreetBits = function () {
      if (!hand.nodes.some(function (n) { return n.kind === "i_sidewalk" && (n.yard === "walks" || n.yard === "beds"); })) { return houseStreetBitsSite.apply(this, arguments); }
      var keep = hand.nodes;
      hand.nodes = keep.filter(function (d) { return !WALK_DOORS[d.kind] || d.kind === "i_garagedoor"; });
      try { return houseStreetBitsSite.apply(this, arguments); } finally { hand.nodes = keep; }
    };
  }

  // ---- the ground under it graded ---------------------------------------------------------------
  // On uneven land (40-land.js) each paved piece lay over the ground by its
  // corners, and the ground came up through the middle of a lot -- grass in
  // the aisle, the painted stalls lost under it.  A site is graded before it
  // is paved: here the ground under the walks and the parking is a plane,
  // as near the land as it lay and never steeper than a car park is laid
  // (6 in 100), easing back into the land round it over 4 m.  The house's
  // own rules then as before: cut away round its walls, made up to its doors.
  var LW_PAVED = { i_parking: 1, i_asphalt: 1, i_sidewalk: 1, i_bikepark: 1, i_driveway: 1, i_plantbed: 1 };
  function lwPaved() {
    return hand.nodes.filter(function (n) { return LW_PAVED[n.kind] && (n.yard === "parking" || n.yard === "walks" || n.yard === "bikes" || n.yard === "beds"); });
  }
  if (typeof terrKey === "function") {
    var terrKeySite = terrKey;
    terrKey = function () {
      var k = terrKeySite.apply(this, arguments);
      if (k === null) { return k; }
      var list = lwPaved(), b = [Infinity, Infinity, -Infinity, -Infinity];
      list.forEach(function (n) { b[0] = Math.min(b[0], n.x); b[1] = Math.min(b[1], n.y); b[2] = Math.max(b[2], n.x); b[3] = Math.max(b[3], n.y); });
      return k + "|lw" + list.length + (list.length ? ":" + b.map(Math.round).join(",") : "") + ":" + lwAttach();
    };
  }
  function lwGradeFor(T) {
    var list = lwPaved(), P = T.P;
    // (a home in a row has no paving of its own: its lot, the row graded with it)
    if (!list.length && lwAttach() !== "alone" && T.F && T.F.node) { list = [T.F.node]; }
    if (!list.length) { return null; }
    var G = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity, blend: 4 * P };
    list.forEach(function (n) {
      var q = turned(n), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      c.forEach(function (s) {
        var p = terrLocal(T, n.x + s[0] * q.w / 2, n.y + s[1] * q.h / 2);
        G.l = Math.min(G.l, p[0]); G.r = Math.max(G.r, p[0]); G.t = Math.min(G.t, p[1]); G.b = Math.max(G.b, p[1]);
      });
    });
    // (level a square of the land's mesh past it -- 1.5 m, 40-land.js -- or the
    // mesh, rising across that square, came up through the paving's edge on
    // a slope: 2026-10-04)
    G.l -= 1.8 * P; G.r += 1.8 * P; G.t -= 1.8 * P; G.b += 1.8 * P;
    // a plane through the land as it lies under it (least squares, on a grid)
    var n0 = 0, sx = 0, sy = 0, sz = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, N = 9;
    var cx = (G.l + G.r) / 2, cy = (G.t + G.b) / 2;
    for (var i = 0; i <= N; i++) {
      for (var j = 0; j <= N; j++) {
        var x = G.l + (G.r - G.l) * i / N - cx, y = G.t + (G.b - G.t) * j / N - cy, z = terrNatural(T, x + cx, y + cy) - T.base;
        n0++; sx += x; sy += y; sz += z; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z;
      }
    }
    // (the grid is square about its middle: sx, sy and sxy come to nothing)
    var bx = sxx > 0 ? (sxz - sx * sz / n0) / (sxx - sx * sx / n0) : 0, by = syy > 0 ? (syz - sy * sz / n0) / (syy - sy * sy / n0) : 0;
    void sxy;
    G.bx = Math.max(-0.06, Math.min(0.06, bx)); G.by = Math.max(-0.06, Math.min(0.06, by));
    G.a = sz / n0; G.cx = cx; G.cy = cy;
    // (joined in a row: the street level along it, the row's ground graded with it)
    var j = lwAttach() !== "alone" ? lwJoined() : {};
    if (j.left || j.right) {
      G.bx = 0;
      if (j.left) { G.l = -220 * P; }
      if (j.right) { G.r = 220 * P; }
    }
    return G;
  }
  if (typeof terrAt === "function") {
    var terrAtSite = terrAt;
    terrAt = function (x, y) {
      var T = TERR;
      if (!T || T.off || T.base === undefined) { return terrAtSite.apply(this, arguments); }
      if (T.lwG === undefined) { T.lwG = null; try { T.lwG = lwGradeFor(T); } catch (e) { T.lwG = null; } }
      var G = T.lwG;
      if (!G) { return terrAtSite.apply(this, arguments); }
      var q = terrLocal(T, x, y), dx = Math.max(0, G.l - q[0], q[0] - G.r), dy = Math.max(0, G.t - q[1], q[1] - G.b), d = Math.hypot(dx, dy);
      if (d >= G.blend) { return terrAtSite.apply(this, arguments); }
      // (40-land.js's terrAt, the land graded first)
      var nat = terrNatural(T, q[0], q[1]) - T.base, plane = G.a + G.bx * (q[0] - G.cx) + G.by * (q[1] - G.cy);
      var g = nat + (plane - nat) * (1 - terrStep(0, G.blend, d));
      var cut = -T.clear + terrOut(T, x, y) * 0.5;
      if (g > cut) { g = cut; }
      for (var i = 0; i < T.doors.length; i++) {
        var o = T.doors[i];
        if (!o.fill) { continue; }
        var c = o.sill - Math.max(0, Math.hypot(x - o.x, y - o.y) - o.r) * o.k;
        if (c > g) { g = c; }
      }
      return g;
    };
  }

  // ---- in a town built close: joined to the building next door ------------------------------------
  // A side joined to the next building is a party wall: no window or door
  // in it -- each kept on the lot, to come back if it stands alone again --
  // and a room left without daylight given a window in its front or back
  // wall; the lot no wider than the building on that side; the roof run
  // from one party wall to the other, gabled, with no eaves over them; and
  // in 3D the buildings next door standing against it -- a row of their
  // own, or, one part of one big building, the rest of that building to
  // each side: its walls, its windows floor by floor, its cornice, its roof.
  // (a corner lot's side street is no wall to join to, 40-address.js)
  var lwJoinedPlain = lwJoined;
  lwJoined = function () {
    var j = lwJoinedPlain(), c = typeof adrCorner === "function" ? adrCorner() : "none";
    if (c === "left") { delete j.left; } else if (c === "right") { delete j.right; }
    return j;
  };
  // The house of the building made last: its lot and its ground rooms.
  function lwHouseNow() {
    var marks = hand.nodes.filter(function (n) { return n.madeWith && n.kind === "i_lot"; }).sort(function (a, b) { return b.id - a.id; });
    var all = yardHouses();
    return (marks.length && all.filter(function (H) { return H.lot === marks[0]; })[0]) || all[0] || null;
  }
  // Where a window or a door is in 3D, the house put together (as
  // 40-outside.js's ybWindowsOut finds it), in the lot's numbers.
  function lwOpenings(F) {
    var J = typeof tieLayout === "function" ? tieLayout() : null, floors = typeof floorsOf === "function" ? floorsOf() : [];
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; });
    var f0 = F.H.rooms.length && floors.length ? floorAt(floors, F.H.rooms[0].x, F.H.rooms[0].y) : null;
    var out = [];
    hand.nodes.forEach(function (w) {
      if (w.kind !== "i_window" && !WALK_DOORS[w.kind]) { return; }
      var f = floors.length ? floorAt(floors, w.x, w.y) : null;
      if (f0 && f && f.bldg !== f0.bldg) { return; }
      if (!f && !insideArea(F.lot, w.x, w.y, -FLOOR_PX)) { return; }
      var host = rooms.filter(function (o) { return insideArea(o, w.x, w.y, -14); })[0];
      var m = J && J.moves && J.moves[w.id], d = (J && J.delta && host && J.delta[host.id]) || [0, 0];
      var x = (m ? m.x : w.x + d[0]) + (f ? f.dx || 0 : 0), y = (m ? m.y : w.y + d[1]) + (f ? f.dy || 0 : 0);
      var q = F.local(x, y), side = ((((w.turn || 0) - F.turn) % 180) + 180) % 180 === 90;
      out.push({ n: w, host: host, x: q[0], y: q[1], side: side });
    });
    return out;
  }
  // Those in a joined side.
  function lwParty(F, joined) {
    var P = F.P;
    return lwOpenings(F).filter(function (o) {
      if (!o.side) { return false; }
      return (joined.left && Math.abs(o.x - F.hb.l) < 0.5 * P) || (joined.right && Math.abs(o.x - F.hb.r) < 0.5 * P);
    });
  }
  var LW_DARK_OK = { hall: 1, closet: 1, stairs: 1, lift: 1, landing: 1, lobby: 1, restroom: 1, stock: 1, storage: 1, utility: 1, garage: 1,
                     bath: 1, ensuite: 1, flatbath: 1, laundry: 1, pantry: 1, fitting: 1, phone: 1 };
  function lwPartyWalls(F, joined) {
    var lot = F.lot, gone = lwParty(F, joined), P = F.P;
    if (!gone.length) { return 0; }
    var ids = {};
    gone.forEach(function (o) { ids[o.n.id] = true; });
    lot.lwParty = (lot.lwParty || []).concat(gone.map(function (o) { return JSON.parse(JSON.stringify(o.n)); }));
    hand.nodes = hand.nodes.filter(function (n) { return !ids[n.id]; });
    hand.links = hand.links.filter(function (l) { return !ids[l.from] && !ids[l.to]; });
    // a room that had its daylight only through the party wall: a window in its front or back
    var hosts = [];
    gone.forEach(function (o) { if (o.host && o.n.kind === "i_window" && hosts.indexOf(o.host) < 0) { hosts.push(o.host); } });
    var plan = typeof walkPlan === "function" ? walkPlan() : null;
    hosts.forEach(function (r) {
      if (LW_DARK_OK[r.starter] || hand.nodes.some(function (n) { return n.kind === "i_window" && insideArea(r, n.x, n.y, -14); })) { return; }
      if (!plan || typeof roomEdges !== "function" || typeof edgeGaps !== "function") { return; }
      var best = null, along = (((F.turn % 180) + 180) % 180) === 0;
      roomEdges(plan, r).forEach(function (e) {
        if (!e.outside || e.across !== along) { return; }
        edgeGaps(plan, r, e).forEach(function (g) { if (g[1] - g[0] >= 0.9 * P && (!best || g[1] - g[0] > best.len)) { best = { e: e, at: (g[0] + g[1]) / 2, len: g[1] - g[0] }; } });
      });
      if (!best) { return; }
      var n = adviceAdd("i_window", Math.round(best.e.across ? best.at : best.e.line), Math.round(best.e.across ? best.e.line : best.at));
      snapToWalls([n.id]);
      n.w = Math.round(Math.min(1.2 * P, best.len - 0.2 * P)); n.own = true; n.lwAdded = true;
    });
    picked = null; chosen = null; many = [];
    return gone.length;
  }
  // Back as it was before it was joined: its windows and doors, its lot.
  function lwUnjoin(lot) {
    if (!lot) { return; }
    if (lot.lwParty && lot.lwParty.length) {
      var have = {};
      hand.nodes.forEach(function (n) { have[n.id] = true; });
      lot.lwParty.forEach(function (n) { if (!have[n.id]) { hand.nodes.push(n); } });
    }
    delete lot.lwParty;
    hand.nodes = hand.nodes.filter(function (n) { return !n.lwAdded; });
    if (lot.lwWas) { lot.x = lot.lwWas.x; lot.y = lot.lwWas.y; lot.w = lot.lwWas.w; lot.h = lot.lwWas.h; delete lot.lwWas; }
    hand.nodes.forEach(function (n) { if (n.lwWas && n.kind === "i_driveway") { n.x = n.lwWas.x; n.y = n.lwWas.y; n.h = n.lwWas.h; delete n.lwWas; } });
  }
  // A home's lot (the site's is fitted by lwSite): its joined sides the
  // building's; one part of a big building, its front a few steps from the
  // street where no garage needs a drive.
  function lwHomeLot(F, joined) {
    var lot = F.lot, P = F.P, hb = F.hb, L = { l: F.L.l, r: F.L.r, t: F.L.t, b: F.L.b };
    if (joined.left) { L.l = hb.l; }
    if (joined.right) { L.r = hb.r; }
    var garage = hand.nodes.some(function (n) { return n.kind === "i_garagedoor" && insideArea(lot, n.x, n.y, -P); });
    if (lwAttach() === "block" && !garage) { L.b = Math.min(L.b, hb.b + 3 * P); }
    if (L.l === F.L.l && L.r === F.L.r && L.b === F.L.b) { return false; }
    if (!lot.lwWas) { lot.lwWas = { x: lot.x, y: lot.y, w: lot.w, h: lot.h }; }
    // (a drive, the street now nearer: as long as the way to it)
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_driveway") { return; }
      var q = F.local(n.x, n.y), half = turned(n).h / 2;
      if (q[1] + half <= L.b + 1 || q[1] - half >= L.b) { return; }
      if (!n.lwWas) { n.lwWas = { x: n.x, y: n.y, h: n.h }; }
      var top = q[1] - half, nh = L.b - top, at = F.world(q[0], top + nh / 2);
      n.h = Math.round(nh); n.x = Math.round(at[0]); n.y = Math.round(at[1]);
    });
    var at2 = F.world((L.l + L.r) / 2, (L.t + L.b) / 2);
    lot.w = Math.round(L.r - L.l); lot.h = Math.round(L.b - L.t); lot.x = Math.round(at2[0]); lot.y = Math.round(at2[1]); lot.own = true;
    return true;
  }
  // As it is made (yardMake, above): joined as asked -- before the site is laid out round it.
  lwAttachMake = function (want, made) {
    var lot = (made || []).filter(function (n) { return n.kind === "i_lot"; })[0];
    if (!lot || lwAttach() === "alone" || (want && want.type === "tower")) { return; }
    var H = yardHouses().filter(function (h) { return h.lot === lot; })[0];
    if (!H) { return; }
    var F = ybFrame(H), joined = lwJoined();
    if (!joined.left && !joined.right) { return; }
    lwPartyWalls(F, joined);
    if (!lwSiteType((want && want.type) || "house")) {
      var U = lwUppers();
      if (lwHomeLot(ybFrame(H), joined)) { lwReflow(lot, U); }
    }
  };
  // Changed after, on the Street tab: back as it was, then joined anew.
  lwAttachNow = function () {
    var H = lwHouseNow();
    if (!H || lwTypeNow() === "tower") { return; }
    lwUnjoin(H.lot);
    H = lwHouseNow();
    if (!H) { return; }
    var joined = lwJoined();
    if (!joined.left && !joined.right) { return; }
    var F = ybFrame(H);
    lwPartyWalls(F, joined);
    if (!lwSiteType(lwTypeNow())) {
      if (!H.lot.lwWas) { H.lot.lwWas = { x: H.lot.x, y: H.lot.y, w: H.lot.w, h: H.lot.h }; }
      var U = lwUppers();
      if (lwHomeLot(ybFrame(H), joined)) { lwReflow(H.lot, U); }
    } else if (!H.lot.lwWas) { H.lot.lwWas = { x: H.lot.x, y: H.lot.y, w: H.lot.w, h: H.lot.h }; }
  };

  // ---- its roof, between the party walls --------------------------------------------------------
  // The lines of the joined sides, in the view's numbers: the lot's own
  // sides, which are the building's there.
  var lwLinesKept = { nodes: null, n: -1, key: "", out: null };
  function lwPartyLines() {
    if (lwAttach() === "alone" || typeof V3 === "undefined") { return null; }
    var K = lwLinesKept, key = lwAttach() + "|" + (typeof adrCorner === "function" ? adrCorner() : "") + "|" + houseOpt("parkSide");
    if (K.nodes === hand.nodes && K.n === hand.nodes.length && K.key === key) { return K.out; }
    K.nodes = hand.nodes; K.n = hand.nodes.length; K.key = key; K.out = lwPartyLinesNow();
    return K.out;
  }
  function lwPartyLinesNow() {
    var H = lwHouseNow(), j = lwJoined();
    if (!H || (!j.left && !j.right)) { return null; }
    var lot = H.lot, t = (((lot.turn || 0) % 360) + 360) % 360, a = t * Math.PI / 180, lines = [];
    [["left", -1], ["right", 1]].forEach(function (s) {
      if (!j[s[0]]) { return; }
      lines.push(t % 180 === 0 ? lot.x + Math.cos(a) * s[1] * lot.w / 2 : lot.y + Math.sin(a) * s[1] * lot.w / 2);
    });
    return { axis: t % 180 === 0 ? "x" : "y", lines: lines };
  }
  if (typeof roofPlan === "function") {
    var roofPlanSite = roofPlan;
    roofPlan = function () {
      var out = roofPlanSite.apply(this, arguments);
      var PL = null;
      try { PL = lwPartyLines(); } catch (e) { PL = null; }
      if (!PL || !out || !out.map) { return out; }
      var tol = 0.45 * FLOOR_PX;
      function near(v) { return PL.lines.some(function (l) { return Math.abs(v - l) < tol; }); }
      return out.map(function (R) {
        if (!R || R.turn) { return R; }
        var sides = PL.axis === "x" ? [near(R.x0) ? "w" : null, near(R.x1) ? "e" : null] : [near(R.y0) ? "n" : null, near(R.y1) ? "s" : null];
        sides = sides.filter(Boolean);
        if (!sides.length) { return R; }
        var eave = Object.assign({ n: 0, s: 0, w: 0, e: 0 }, R.eave || {});
        sides.forEach(function (k) { eave[k] = 0; });
        return Object.assign({}, R, { eave: eave, lwParty: sides, runs: (R.runs || []).filter(function (r) { return sides.indexOf(r.side) < 0; }) });
      });
    };
  }
  // its ridge from one party wall to the other, whichever way is longer
  if (typeof styleFrame === "function") {
    var styleFrameSite = styleFrame;
    styleFrame = function (R) {
      var F = styleFrameSite.apply(this, arguments);
      if (!R || !R.lwParty) { return F; }
      var along = R.lwParty[0] === "w" || R.lwParty[0] === "e";
      if (F.along === along) { return F; }
      var e = R.eave || { n: 0, s: 0, w: 0, e: 0 };
      return { along: along, u0: along ? R.x0 : R.y0, u1: along ? R.x1 : R.y1, v0: along ? R.y0 : R.x0, v1: along ? R.y1 : R.x1,
               eu0: along ? e.w : e.n, eu1: along ? e.e : e.s, ev0: along ? e.n : e.w, ev1: along ? e.s : e.e,
               P: function (u, v, h) { return along ? [u, v, h] : [v, u, h]; } };
    };
  }
  // and gabled: a hip, sloping down onto the next building, is a gable here
  if (typeof styleRoofShape === "function") {
    var styleRoofShapeSite = styleRoofShape;
    styleRoofShape = function () {
      var s = styleRoofShapeSite.apply(this, arguments);
      if ((s === "hip" || s === "pagoda") && lwAttach() !== "alone") {
        var j = lwJoined();
        if (j.left || j.right) { return "gable"; }
      }
      return s;
    };
  }

  // ---- in 3D: the buildings next door, against it ------------------------------------------------
  // What it is like, to match: its sides in the lot's numbers and its front
  // and back where it meets each, how tall, how many floors, its walls,
  // roof and trim, its roof's shape.
  function lwBody(L) {
    var P = FLOOR_PX, H = lwHouseNow();
    if (!H || !H.rooms.length) { return null; }
    var boxes = H.rooms.map(function (r) {
      var q = turned(r), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (s) { return L.lotLocal([r.x + s[0] * q.w / 2, r.y + s[1] * q.h / 2]); });
      return { l: Math.min(c[0][0], c[2][0]), r: Math.max(c[0][0], c[2][0]), t: Math.min(c[0][1], c[2][1]), b: Math.max(c[0][1], c[2][1]), room: r };
    });
    var hb = boxes.reduce(function (m, b) { return { l: Math.min(m.l, b.l), r: Math.max(m.r, b.r), t: Math.min(m.t, b.t), b: Math.max(m.b, b.b) }; },
                          { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity });
    function edge(x) {
      var on = boxes.filter(function (b) { return Math.abs((x < 0 ? b.l : b.r) - (x < 0 ? hb.l : hb.r)) < 0.4 * P; });
      if (!on.length) { on = boxes; }
      return { f: Math.max.apply(null, on.map(function (b) { return b.b; })), k: Math.min.apply(null, on.map(function (b) { return b.t; })) };
    }
    var floors = typeof floorsOf === "function" ? floorsOf() : [], f0 = floors.length ? floorAt(floors, H.rooms[0].x, H.rooms[0].y) : null;
    var mine = floors.filter(function (f) { return f0 && f.bldg === f0.bldg && f.level >= 0; });
    var top = 0, storeys = Math.max(1, mine.length);
    if (mine.length) { mine.forEach(function (f) { top = Math.max(top, (f.z || 0) + ceilOf(f.n) * P); }); }
    else { H.rooms.forEach(function (r) { top = Math.max(top, ceilOf(r) * P); }); }
    var S = typeof styleNow === "function" ? styleNow() : null, room = H.rooms[0];
    var out = typeof houseMat === "function" ? houseMat(room, "out") : null, roof = typeof houseMat === "function" ? houseMat(room, "roof") : null;
    var shape = typeof styleRoofShape === "function" ? styleRoofShape() : "hip";
    return { hb: hb, left: edge(-1), right: edge(1), H: top, storeys: storeys, Hs: top / storeys, S: S,
             out: out || { pat: 13, color: "#ede8dc" }, roof: roof || { pat: 1, color: "#5d6166" }, trim: S ? S.trim : "#f1eee8",
             shape: STYLE_FLATS && STYLE_FLATS[shape] ? "flat" : shape === "mansard" ? "mansard" : shape === "gambrel" ? "gambrel" : "gable",
             pitch: typeof stylePitch === "function" ? stylePitch() : Math.tan(35 * Math.PI / 180), cornice: S && S.cornice, parapet: S ? S.parapet || 0 : 0,
             awning: S && S.awning };
  }
  var LW_ROW_WALLS = {
    city: [["#8c4a3a", 40], ["#a65a44", 40], ["#c9c2b6", 41], ["#6b5a52", 40], ["#e6dccb", 42], ["#d9cbb0", 42]],
    warm: [["#e6c9a8", 42], ["#efe7d6", 42], ["#d98b5f", 42], ["#f2efe8", 42], ["#c99a6b", 42]],
    cool: [["#ede8dc", 13], ["#c9d3d9", 13], ["#a65a44", 40], ["#e2d3b5", 13], ["#8c9c84", 13], ["#6f8592", 13]]
  };
  function lwNextDoor(v, L) {
    var a = lwAttach();
    if (a === "alone" || !L.lot || !L.lotWorld) { return; }
    if (lwTypeNow() === "tower") { return; }                  // (a skyscraper's city is its own, 40-towers.js)
    var j = lwJoined(), B = lwBody(L);
    if (!B || (!j.left && !j.right)) { return; }
    var P = FLOOR_PX, type = lwTypeNow(), ax = worldStreetAxes(L), reach = Math.min(L.walk ? 140 * P : L.groundR * 0.9, 160 * P);
    var rnd = gl3Rand(Math.round(Math.abs(L.lot.x) * 5 + Math.abs(L.lot.y) * 3) + 29);
    var scape = typeof worldScape === "function" ? worldScape() : "plains";
    var palette = scape === "city" ? LW_ROW_WALLS.city : scape === "desert" || scape === "tropics" || scape === "beach" ? LW_ROW_WALLS.warm : LW_ROW_WALLS.cool;
    var W0 = B.hb.r - B.hb.l, commercial = !LW_HOMES[type];
    [-1, 1].forEach(function (s) {
      if (s < 0 ? !j.left : !j.right) { return; }
      var x = s < 0 ? B.hb.l : B.hb.r, k = 0, e = s < 0 ? B.left : B.right;
      while (Math.abs(x) < reach && k < 24) {
        var w = a === "block" ? Math.max(6 * P, Math.min(26 * P, W0 * (0.8 + rnd() * 0.45))) : (commercial ? 8 + rnd() * 8 : 5.5 + rnd() * 3.5) * P;
        var x0 = s < 0 ? x - w : x, x1 = s < 0 ? x : x + w;
        var front = a === "block" ? e.f : e.f - (k ? rnd() * 0.6 * P : 0), back = a === "block" ? e.k : front - Math.max(8 * P, Math.min(16 * P, (e.f - e.k) * (0.8 + rnd() * 0.35)));
        var look = a === "block" ? { col: B.out.color, pat: B.out.pat, roofC: B.roof.color, roofPat: B.roof.pat, trim: B.trim }
                 : (function () { var p = palette[Math.floor(rnd() * palette.length)]; return { col: p[0], pat: p[1], roofC: ["#3f4246", "#5d6166", "#7a5f4c", "#4f5a63"][Math.floor(rnd() * 4)], roofPat: 1, trim: "#efe9de" }; })();
        var storeys = a === "block" ? B.storeys : Math.max(1, Math.min(B.storeys + 2, B.storeys + Math.round((rnd() - 0.5) * 2.4)));
        var Hs = a === "block" ? B.Hs : Math.max(2.9 * P, Math.min(3.6 * P, B.Hs));
        lwSegment(v, L, ax, { x0: x0, x1: x1, front: front, back: back, storeys: storeys, Hs: Hs, look: look, mode: a, B: B, k: k, s: s,
                              shop: commercial && (a === "block" || rnd() < 0.5), rnd: rnd, faceStreet: 1 });
        x = s < 0 ? x0 : x1; k++;
      }
      // (no trees grown in them)
      var xa = Math.min(x, s < 0 ? B.hb.l : B.hb.r), xb = Math.max(x, s < 0 ? B.hb.l : B.hb.r);
      var c0 = L.lotWorld(xa, e.k - 2 * P, 0), c1 = L.lotWorld(xb, e.f + 1 * P, 0);
      var bx0 = Math.min(c0[0], c1[0]), bx1 = Math.max(c0[0], c1[0]), by0 = Math.min(c0[1], c1[1]), by1 = Math.max(c0[1], c1[1]);
      L.keepOff.push(function (p) { return p[0] > bx0 && p[0] < bx1 && p[1] > by0 && p[1] < by1; });
    });
    // the lane behind the row, where its parking is reached from the back
    var sides = lwParkSides(type, j);
    if (j.left && j.right && sides.back && !sides.front && lwSiteType(type)) {
      var by = -L.lot.h / 2, laneC = gl3Mix([0.3, 0.31, 0.33], L.sheetC, 0.08);
      gl3Poly(v, [L.lotWorld(-reach, by - 6 * P, 0.4), L.lotWorld(reach, by - 6 * P, 0.4), L.lotWorld(reach, by, 0.4), L.lotWorld(-reach, by, 0.4)], [0, 0, 1], laneC, 1, null, PAT.concrete);
      var lA = L.lotWorld(-reach, by - 7 * P, 0), lB = L.lotWorld(reach, by + 0.5 * P, 0);
      var lx0 = Math.min(lA[0], lB[0]), lx1 = Math.max(lA[0], lB[0]), ly0 = Math.min(lA[1], lB[1]), ly1 = Math.max(lA[1], lB[1]);
      L.keepOff.push(function (p) { return p[0] > lx0 && p[0] < lx1 && p[1] > ly0 && p[1] < ly1; });
    }
    // across the street, a row of its own facing this one
    if (houseOpt("hood") && (a === "row" || a === "block")) {
      var far = L.hy + L.walkW + L.roadW + L.walkW, xs = -reach + rnd() * 6 * P, kk = 0;
      while (xs < reach && kk < 40) {
        var w2 = (commercial ? 9 + rnd() * 9 : 5.5 + rnd() * 3.5) * P, p2 = palette[Math.floor(rnd() * palette.length)];
        var fr2 = far + (a === "block" ? 0.6 : 2.5) * P;
        lwSegment(v, L, ax, { x0: xs, x1: xs + w2, front: fr2, back: fr2 + Math.max(9 * P, Math.min(15 * P, (B.hb.b - B.hb.t))), storeys: Math.max(1, B.storeys + Math.round((rnd() - 0.5) * 2)),
                              Hs: Math.max(2.9 * P, Math.min(3.6 * P, B.Hs)), mode: "row", B: B, k: kk, s: 1, shop: commercial && rnd() < 0.6, rnd: rnd, faceStreet: -1,
                              look: { col: p2[0], pat: p2[1], roofC: ["#3f4246", "#5d6166", "#7a5f4c"][Math.floor(rnd() * 3)], roofPat: 1, trim: "#efe9de" } });
        xs += w2; kk++;
      }
      var cA = L.lotWorld(-reach, far, 0), cB = L.lotWorld(reach, far + 18 * P, 0);
      var ax0 = Math.min(cA[0], cB[0]), ax1 = Math.max(cA[0], cB[0]), ay0 = Math.min(cA[1], cB[1]), ay1 = Math.max(cA[1], cB[1]);
      L.keepOff.push(function (p) { return p[0] > ax0 && p[0] < ax1 && p[1] > ay0 && p[1] < ay1; });
    }
  }
  // One building of the row (or one more part of the big building): from
  // x0 to x1 along the street, its front and back lines, so many floors.
  // faceStreet 1: on this side, its front toward the street (+y); -1 across it.
  function lwSegment(v, L, ax, o) {
    var P = FLOOR_PX, sheetC = L.sheetC, look = o.look, B = o.B, rnd = o.rnd, f = o.faceStreet;
    var wallC = gl3Mix(gl3Rgb(look.col), sheetC, 0.08), roofC = gl3Mix(gl3Rgb(look.roofC), sheetC, 0.08), trimC = gl3Mix(gl3Rgb(look.trim), sheetC, 0.08);
    var glass = gl3Mix([0.22, 0.28, 0.34], sheetC, 0.06), H = o.storeys * o.Hs, mx = (o.x0 + o.x1) / 2, my = (o.front + o.back) / 2;
    var hx = (o.x1 - o.x0) / 2 - 0.01 * P, hy = Math.abs(o.front - o.back) / 2;
    var e = ax.e, d = ax.d;                                   // d: toward the street, on this side
    function W(lx, ly) { return L.lotWorld(lx, ly, 0); }
    // all of it at the floor of the house next to it: the cornices in line
    var was = typeof terrLift !== "undefined" ? terrLift : null, onLand = typeof terrScene !== "undefined" && terrScene && TERR && TERR.mesh;
    if (onLand) { terrLift = 0; }
    try {
      var c = W(mx, my);
      // (a tall one: its windows the tower's pattern, floor over floor, not each a box)
      var tall = o.storeys > 8;
      worldBox(v, c, e, d, hx, hy, -0.4 * P, tall ? Math.min(H, o.Hs) : H, wallC, look.pat, true);
      if (tall) { worldBox(v, c, e, d, hx, hy, o.Hs, H, gl3Mix(wallC, [0.3, 0.36, 0.42], 0.35), 76, true); }
      // the front: floor over floor, its windows; at the street, a shop front, or a door
      var fy = o.front + f * 0.025 * P, n = Math.max(1, Math.floor((o.x1 - o.x0) / (2.6 * P)));
      function pane(lx, z0, z1, wide, col, pat, out) {
        var p = W(lx, fy + f * (out || 0.03 * P));
        worldBox(v, p, e, d, wide / 2, 0.04 * P, z0, z1, col, pat, true);
      }
      for (var st = 0; st < (tall ? 1 : o.storeys); st++) {
        var z = st * o.Hs;
        if (st === 0 && o.shop) {
          pane(mx, 0.35 * P, Math.min(o.Hs - 0.5 * P, 3.0 * P), (o.x1 - o.x0) - 1.2 * P, trimC, PAT.plain, 0.02 * P);
          pane(mx, 0.45 * P, Math.min(o.Hs - 0.6 * P, 2.9 * P), (o.x1 - o.x0) - 1.5 * P, glass, 77, 0.035 * P);
          pane(mx, Math.min(o.Hs - 0.45 * P, 3.05 * P), Math.min(o.Hs - 0.05 * P, 3.55 * P), (o.x1 - o.x0) - 1.0 * P, trimC, PAT.plain, 0.06 * P);
          if (B.awning && o.mode === "block") {
            var ac = gl3Mix(gl3Rgb(B.awning), sheetC, 0.08), ay = fy + f * 0.6 * P, az = Math.min(o.Hs - 0.5 * P, 2.95 * P);
            worldFace(v, [L.lotWorld(o.x0 + 0.5 * P, fy, az + 0.5 * P), L.lotWorld(o.x1 - 0.5 * P, fy, az + 0.5 * P), L.lotWorld(o.x1 - 0.5 * P, ay + f * 0.6 * P, az), L.lotWorld(o.x0 + 0.5 * P, ay + f * 0.6 * P, az)], ac, PAT.plain, true);
          }
          continue;
        }
        var door = st === 0 ? o.x0 + (o.x1 - o.x0) * (0.2 + rnd() * 0.6) : null;
        if (door !== null) {
          pane(door, 0, 2.2 * P, 1.2 * P, trimC, PAT.plain);
          pane(door, 0, 2.1 * P, 1.0 * P, gl3Mix([[0.45, 0.2, 0.17], [0.2, 0.28, 0.36], [0.24, 0.2, 0.18]][Math.floor(rnd() * 3)], sheetC, 0.06), 21, 0.05 * P);
        }
        for (var i = 0; i < n; i++) {
          var lx = o.x0 + (i + 0.5) * (o.x1 - o.x0) / n;
          if (door !== null && Math.abs(lx - door) < 1.3 * P) { continue; }
          var sill = z + 0.9 * P, tall = Math.min(1.6 * P, o.Hs - 1.3 * P);
          pane(lx, sill - 0.06 * P, sill + tall + 0.06 * P, 1.32 * P, trimC, PAT.plain);
          pane(lx, sill, sill + tall, 1.12 * P, glass, 77, 0.04 * P);
        }
      }
      // the back: windows, plainer
      var by = o.back - f * 0.025 * P;
      for (var st2 = 0; st2 < (tall ? 1 : o.storeys); st2++) {
        for (var i2 = 0; i2 < Math.max(1, n - 1); i2++) {
          var lx2 = o.x0 + (i2 + 0.5) * (o.x1 - o.x0) / Math.max(1, n - 1), s2 = st2 * o.Hs + 0.9 * P;
          worldBox(v, W(lx2, by - f * 0.03 * P), e, d, 0.55 * P, 0.04 * P, s2, s2 + Math.min(1.4 * P, o.Hs - 1.3 * P), glass, 77, true);
        }
      }
      // one building of many: a pilaster where each part meets the next
      if (o.mode === "block") {
        [o.x0, o.x1].forEach(function (x) { worldBox(v, W(x, fy + f * 0.06 * P), e, d, 0.14 * P, 0.07 * P, 0, H, trimC, PAT.plain, false); });
      }
      lwSegRoof(v, L, ax, o, H, wallC, roofC, trimC);
    } finally { if (onLand) { terrLift = was; } }
    // its front to the street: in one big building, what is in front of this
    // part of it -- the walk, the parking -- in front of every part; else a
    // walk for a shop, a little garden for a home
    var gy0 = f > 0 ? o.front : L.hy + L.walkW + L.roadW + L.walkW, gy1 = f > 0 ? L.hy : o.front;
    var band = f > 0 && o.mode === "block" ? lwBandNow() : null;
    if (band) { lwBandFront(v, L, ax, o, band); }
    else if (gy1 - gy0 > 0.3 * P) {
      var paved = o.shop || gy1 - gy0 < 2.0 * P;
      var gc = paved ? gl3Mix([0.79, 0.77, 0.73], sheetC, 0.15) : gl3Mix([0.44, 0.62, 0.31], sheetC, 0.15);
      gl3Poly(v, [W(o.x0, gy0), W(o.x1, gy0), W(o.x1, gy1), W(o.x0, gy1)].map(function (p) { return [p[0], p[1], 0.6]; }), [0, 0, 1], gc, 1, null, paved ? PAT.walk : PAT.lawn);
      if (!paved) {
        // the path up to its door
        var dx = o.x0 + (o.x1 - o.x0) * 0.3;
        gl3Poly(v, [W(dx - 0.55 * P, gy0), W(dx + 0.55 * P, gy0), W(dx + 0.55 * P, gy1), W(dx - 0.55 * P, gy1)].map(function (p) { return [p[0], p[1], 1.2]; }), [0, 0, 1],
                gl3Mix([0.74, 0.72, 0.69], sheetC, 0.15), 1, null, PAT.walk);
      }
    }
    // a foundation down to the land where it falls away under it
    if (onLand && typeof terrSkirt === "function") {
      try { terrSkirt(v, { c: W(mx, my), e: e, d: d, hx: hx, hy: hy }, 0); } catch (e2) { /* none */ }
    }
  }
  // What is in front of the building made, from its front line (lwSite keeps it on the lot).
  function lwBandNow() { var H = lwHouseNow(); return H && H.lot && H.lot.lwBand ? H.lot.lwBand : null; }
  // The same in front of another part of the building: the walk, a row of
  // stalls nosed to it, the aisle, a second row, cars in most, the strip
  // with its hedge and trees -- every third part a way in from the street.
  function lwBandFront(v, L, ax, o, band) {
    var P = FLOOR_PX, sheetC = L.sheetC, f0 = o.front, x0 = o.x0, x1 = o.x1, rnd = o.rnd;
    var asph = gl3Mix([0.24, 0.25, 0.27], sheetC, 0.08), white = gl3Mix([0.94, 0.94, 0.92], sheetC, 0.05), lawnC = gl3Mix([0.44, 0.62, 0.31], sheetC, 0.15);
    var paveC = gl3Mix(gl3Rgb((LW_PAVE[band.pave] || LW_PAVE.concrete)[1]), sheetC, 0.12);
    function flat(y0, y1, z, c, pat, xa, xb) {
      var a = xa === undefined ? x0 : xa, b = xb === undefined ? x1 : xb;
      gl3Poly(v, [L.lotWorld(a, f0 + y0, z), L.lotWorld(b, f0 + y0, z), L.lotWorld(b, f0 + y1, z), L.lotWorld(a, f0 + y1, z)], [0, 0, 1], c, 1, null, pat);
    }
    if (band.beds) { flat(0, band.beds, 0.9, gl3Mix([0.29, 0.23, 0.17], sheetC, 0.1), PAT.plain); }
    if (band.walk) { flat(band.walk[0], band.walk[1], 1.6, paveC, PAT.walk); }
    if (!band.rowA) {
      flat(band.walk ? band.walk[1] : 0, L.hy - f0, 0.6, o.shop ? paveC : lawnC, o.shop ? PAT.walk : PAT.lawn);
      return;
    }
    var entry = o.k % 3 === 1, rows = [[band.rowA, -1]].concat(band.rowB && !entry ? [[band.rowB, 1]] : []);
    flat(band.rowA[0], band.aisle[1], 0.6, asph, PAT.concrete);
    if (band.rowB) { flat(band.rowB[0], band.rowB[1], 0.6, asph, PAT.concrete); }
    var cars = [];
    rows.forEach(function (R) {
      var n = Math.floor((x1 - x0) / (2.6 * P)), s0 = x0 + ((x1 - x0) - n * 2.6 * P) / 2;
      for (var i = 0; i <= n; i++) {
        var lx = s0 + i * 2.6 * P;
        flat(R[0][0] + (R[1] < 0 ? 0.4 * P : 0), R[0][1] - (R[1] > 0 ? 0.4 * P : 0), 1.1, white, PAT.plain, lx - 0.05 * P, lx + 0.05 * P);
        if (i < n && rnd() < 0.6) { cars.push([s0 + (i + 0.5) * 2.6 * P, (R[0][0] + R[0][1]) / 2, R[1]]); }
      }
    });
    // the strip to the street: grass, a hedge, a tree or two -- or, every third part, the way in
    var end = band.rowB ? band.rowB[1] : band.aisle[1];
    if (entry) {
      flat(end, L.hy - f0, 0.6, asph, PAT.concrete, (x0 + x1) / 2 - 3.3 * P, (x0 + x1) / 2 + 3.3 * P);
    } else if (band.hedge && L.hy - f0 - end > 1.4 * P) {
      var hc = gl3Mix(gl3Rgb(band.hedge), sheetC, 0.1), hy = L.hy - f0 - 0.45 * P;
      worldBox(v, L.lotWorld((x0 + x1) / 2, f0 + hy, 0), ax.e, ax.d, (x1 - x0) / 2 - 0.4 * P, 0.4 * P, 0, 1.0 * P, hc, PAT.leaves, false);
    }
    if (!entry && typeof worldPlant === "function" && band.trees && L.hy - f0 - end > 1.2 * P) {
      for (var tx = x0 + 3 * P; tx < x1 - 2 * P; tx += 9 * P) {
        worldPlant(v, band.trees[Math.floor(rnd() * band.trees.length)], L.lotWorld(tx, f0 + (end + L.hy - f0 - 0.9 * P) / 2, 0), rnd, sheetC);
      }
    }
    cars.forEach(function (c) {
      var col = WORLD_CAR_COLORS[Math.floor(rnd() * WORLD_CAR_COLORS.length)], fwd = c[2] < 0 ? [-ax.d[0], -ax.d[1]] : ax.d;
      worldCarParts(L.lotWorld(c[0], f0 + c[1], 0), fwd, ax.e, gl3Rgb(col)).forEach(function (b) { worldBox(v, b.c, b.e, b.d, b.hx, b.hy, b.z0, b.z1, b.col, b.pat); });
    });
  }
  // Its roof: flat behind a parapet (and a cornice, the style's), or
  // pitched from the front to the back -- a gable, a mansard, a gambrel --
  // its ridge along the street, so the row's roofs run on as one.
  function lwSegRoof(v, L, ax, o, H, wallC, roofC, trimC) {
    var P = FLOOR_PX, B = o.B, f = o.faceStreet, x0 = o.x0, x1 = o.x1, yf = o.front, yb = o.back;
    var shape = o.mode === "block" ? B.shape : (o.k % 3 === 2 ? "gable" : "flat");
    function Q(lx, ly, z) { return L.lotWorld(lx, ly, z); }
    if (shape === "flat") {
      gl3Poly(v, [Q(x0, yb, H), Q(x1, yb, H), Q(x1, yf, H), Q(x0, yf, H)], [0, 0, 1], gl3Mix(roofC, [0.55, 0.55, 0.55], 0.45), 1, null, PAT.concrete);
      var par = o.mode === "block" ? Math.max(0.3 * P, (B.parapet || 0.5) * P) : (0.4 + o.rnd() * 0.5) * P, t = 0.15 * P, e = ax.e, d = ax.d;
      [yf - f * t / 2, yb + f * t / 2].forEach(function (y) { worldBox(v, Q((x0 + x1) / 2, y, 0), e, d, (x1 - x0) / 2, t / 2, H, H + par, wallC, o.look.pat, false); });
      // (the ends only where the row ends, or the next one is lower)
      [x0 + t / 2, x1 - t / 2].forEach(function (x) { worldBox(v, Q(x, (yf + yb) / 2, 0), e, d, t / 2, Math.abs(yf - yb) / 2, H, H + par, wallC, o.look.pat, false); });
      if (o.mode === "block" ? B.cornice : o.rnd() < 0.6) {
        var cc = o.mode === "block" && B.cornice ? gl3Mix(gl3Rgb(B.cornice), L.sheetC, 0.08) : trimC;
        worldBox(v, Q((x0 + x1) / 2, yf + f * 0.12 * P, 0), e, d, (x1 - x0) / 2 + 0.01 * P, 0.2 * P, H - 0.1 * P, H + 0.3 * P, cc, PAT.plain, false);
      }
      return;
    }
    var deep = Math.abs(yf - yb), half = deep / 2, ym = (yf + yb) / 2, ov = 0.35 * P, k = B.pitch || Math.tan(35 * Math.PI / 180);
    var ef = yf + f * ov, eb = yb - f * ov;
    if (shape === "mansard") {
      var run = Math.min(half * 0.3, 1.6 * P), zb = H + run * Math.tan(70 * Math.PI / 180), inF = yf - f * run, inB = yb + f * run;
      worldFace(v, [Q(x0, ef, H - ov * 2), Q(x1, ef, H - ov * 2), Q(x1, inF, zb), Q(x0, inF, zb)], roofC, o.look.roofPat, true);
      worldFace(v, [Q(x1, eb, H - ov * 2), Q(x0, eb, H - ov * 2), Q(x0, inB, zb), Q(x1, inB, zb)], roofC, o.look.roofPat, true);
      gl3Poly(v, [Q(x0, inB, zb), Q(x1, inB, zb), Q(x1, inF, zb), Q(x0, inF, zb)], [0, 0, 1], gl3Mix(roofC, [0.5, 0.5, 0.5], 0.3), 1, null, PAT.concrete);
      [x0, x1].forEach(function (x) { worldFace(v, [Q(x, yf, H), Q(x, inF, zb), Q(x, inB, zb), Q(x, yb, H)], wallC, o.look.pat); });
      return;
    }
    var top = H + half * k;
    if (shape === "gambrel") {
      var r2 = half * 0.32, zk = H + r2 * Math.tan(62 * Math.PI / 180), top2 = zk + (half - r2) * Math.tan(24 * Math.PI / 180);
      var kf = yf - f * r2, kb = yb + f * r2;
      worldFace(v, [Q(x0, yf, H), Q(x1, yf, H), Q(x1, kf, zk), Q(x0, kf, zk)], roofC, o.look.roofPat, true);
      worldFace(v, [Q(x0, kf, zk), Q(x1, kf, zk), Q(x1, ym, top2), Q(x0, ym, top2)], roofC, o.look.roofPat, true);
      worldFace(v, [Q(x1, yb, H), Q(x0, yb, H), Q(x0, kb, zk), Q(x1, kb, zk)], roofC, o.look.roofPat, true);
      worldFace(v, [Q(x1, kb, zk), Q(x0, kb, zk), Q(x0, ym, top2), Q(x1, ym, top2)], roofC, o.look.roofPat, true);
      [x0, x1].forEach(function (x) { worldFace(v, [Q(x, yf, H), Q(x, kf, zk), Q(x, ym, top2), Q(x, kb, zk), Q(x, yb, H)], wallC, o.look.pat); });
      return;
    }
    worldFace(v, [Q(x0, ef, H - ov * k), Q(x1, ef, H - ov * k), Q(x1, ym, top), Q(x0, ym, top)], roofC, o.look.roofPat, true);
    worldFace(v, [Q(x1, eb, H - ov * k), Q(x0, eb, H - ov * k), Q(x0, ym, top), Q(x1, ym, top)], roofC, o.look.roofPat, true);
    [x0, x1].forEach(function (x) { worldFace(v, [Q(x, yf, H), Q(x, ym, top), Q(x, yb, H)], wallC, o.look.pat); });
    // the eaves' undersides
    gl3Poly(v, [Q(x0, yf, H - 1), Q(x1, yf, H - 1), Q(x1, ef, H - ov * k - 1), Q(x0, ef, H - ov * k - 1)], [0, 0, -1], gl3Mix(trimC, roofC, 0.3), 1, null, PAT.plain);
  }
  if (typeof worldHood === "function") {
    var worldHoodSite = worldHood;
    worldHood = function (v, L) {
      try { lwNextDoor(v, L); } catch (e) { if (window.console) { console.warn("next door:", e && e.message); } }
      return worldHoodSite.apply(this, arguments);
    };
  }
  // The houses next door that are only scenery: none on a joined side (the
  // building against it is there), and across the street a row in a row.
  if (typeof worldNeighbor === "function") {
    var worldNeighborSite = worldNeighbor;
    worldNeighbor = function (v, L, s) {
      var a = lwAttach();
      if (a !== "alone" && L && L.lot && s) {
        var j = lwJoined();
        if (!s.back && ((s.x < 0 && j.left) || (s.x > 0 && j.right))) { return; }
        if (s.back && (a === "row" || a === "block")) { return; }
      }
      return worldNeighborSite.apply(this, arguments);
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeySite = houseSceneKey;
    houseSceneKey = function () {
      return houseSceneKeySite.apply(this, arguments) + "|lw" + [lwAttach(), houseOpt("parkAt"), houseOpt("parkSide"), houseOpt("style")].join(",");
    };
  }

  // ---- parked on the street ----------------------------------------------------------------------
  // Bays painted along the kerb in front -- not across a drive's kerb cut,
  // nor into a corner's side street -- a car in most; the cars going by
  // keep further out (39-world.js's worldNearLane).
  function lwStreetParked() { return lwParkKind(lwTypeNow()) === "street"; }
  if (typeof houseStreetBits === "function") {
    var houseStreetBitsCurb = houseStreetBits;
    houseStreetBits = function (v, lot, lotWorld, lotLocal, hy, walkW, sheetC) {
      var out = houseStreetBitsCurb.apply(this, arguments);
      try { if (lwStreetParked()) { lwCurbBays(v, lot, lotWorld, lotLocal, hy, walkW, sheetC); } } catch (e) { /* none */ }
      return out;
    };
  }
  // The bays along the kerb in front, and the car parked in each that has one -- in the lot's own
  // numbers (x along the street, y out from the lot's front), the same every time for the same lot.
  // (asked for, 2026-10-04, by the building-site work: its trucks stop clear of the parked cars)
  // [{ x0, x1, y0, y1, car: null | { x, y, col, back } }]; none unless cars park on the street.
  function lwCurbList(lot, lotLocal) {
    if (!lot || !lwStreetParked()) { return []; }
    var P = FLOOR_PX, hy = lot.h / 2, walkW = typeof streetWalkPx === "function" ? streetWalkPx() : 1.6 * P;
    var y0 = hy + walkW, wide = 2.3 * P, bay = 6.1 * P, reach = 75 * P, out = [];
    var cuts = [], corner = typeof adrCorner === "function" ? adrCorner() : "none";
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_driveway") { return; }
      var q = lotLocal([n.x, n.y]), w = turned(n).w;
      cuts.push([q[0] - w / 2 - 1.2 * P, q[0] + w / 2 + 1.2 * P]);
    });
    if (corner === "left") { cuts.push([-Infinity, -lot.w / 2 - 1.0 * P]); }
    if (corner === "right") { cuts.push([lot.w / 2 + 1.0 * P, Infinity]); }
    var rnd = gl3Rand(Math.round(Math.abs(lot.x) + Math.abs(lot.y) * 3) + 61);
    for (var x = -reach; x + bay <= reach; x += bay) {
      if (cuts.some(function (c) { return x + bay > c[0] && x < c[1]; })) { continue; }
      var B = { x0: x, x1: x + bay, y0: y0, y1: y0 + wide, car: null };
      out.push(B);
      if (rnd() > 0.62) { continue; }
      var col = WORLD_CAR_COLORS[Math.floor(rnd() * WORLD_CAR_COLORS.length)];
      B.car = { x: x + bay / 2 + (rnd() - 0.5) * 0.4 * P, y: y0 + wide / 2 + 0.05 * P, col: col, back: rnd() >= 0.85 };
    }
    return out;
  }
  function lwCurbBays(v, lot, lotWorld, lotLocal, hy, walkW, sheetC) {
    var P = FLOOR_PX, white = gl3Mix([0.94, 0.94, 0.92], sheetC, 0.05);
    var e = lotWorld(1, 0, 0), o = lotWorld(0, 0, 0), dd = lotWorld(0, 1, 0);
    var ex = [e[0] - o[0], e[1] - o[1]], dy = [dd[0] - o[0], dd[1] - o[1]];
    lwCurbList(lot, lotLocal).forEach(function (B) {
      var x = B.x0, y0 = B.y0, wide = B.y1 - B.y0;
      // the bay's line at its start, and the short tick along the kerb's edge of the lane
      gl3Poly(v, [lotWorld(x - 0.05 * P, y0, 0.5), lotWorld(x + 0.05 * P, y0, 0.5), lotWorld(x + 0.05 * P, y0 + wide, 0.5), lotWorld(x - 0.05 * P, y0 + wide, 0.5)], [0, 0, 1], white, 1, null, PAT.plain);
      gl3Poly(v, [lotWorld(x - 0.4 * P, y0 + wide - 0.05 * P, 0.5), lotWorld(x + 0.4 * P, y0 + wide - 0.05 * P, 0.5), lotWorld(x + 0.4 * P, y0 + wide + 0.05 * P, 0.5), lotWorld(x - 0.4 * P, y0 + wide + 0.05 * P, 0.5)], [0, 0, 1], white, 1, null, PAT.plain);
      if (!B.car) { return; }
      var at = lotWorld(B.car.x, B.car.y, 0);
      var fwd = B.car.back ? ex : [-ex[0], -ex[1]];      // (on the near side, facing the way the near lane runs)
      worldCarParts(at, fwd, dy, gl3Rgb(B.car.col)).forEach(function (b) { worldBox(v, b.c, b.e, b.d, b.hx, b.hy, b.z0, b.z1, b.col, b.pat); });
    });
  }
  if (typeof worldNearLane === "function") {
    var worldNearLaneSite = worldNearLane;
    worldNearLane = function () { return lwStreetParked() ? 0.46 : worldNearLaneSite.apply(this, arguments); };
  }

  // ---- floors not all alike, the stairs and lifts where they were -------------------------------
  // (asked for, 2026-10-03: "taller buildings with lots of floors with
  // stairs and stuff need to align ... otherwise they will not work
  // properly and elevators", "when the website is building multiple
  // floors ... each floor is not one to one ... they can be different and
  // unique designs")
  //
  // A block of flats was the same floor over and over.  Each floor is laid
  // out in bands (39-types.js); a band's stairs and lift come first, the
  // same on every floor, so a flight lands on the flight over it and the
  // lift stops at every floor in one shaft.  What comes after them is now
  // each floor's own: flats mirrored, flats of other sizes side by side, a
  // compact one-bedroom where a bigger one was, the top floor in fewer,
  // bigger homes; a tower's floors of homes and of offices each laid out
  // their own way.  Every band still as wide as the building.
  var LW_CORE = { stairs: 1, lift: 1 };
  function lwRnd(seed) { var a = (seed >>> 0) || 7; return function () { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; }
  // A band's part that stays: up to its last stair or lift (a landing or a
  // lobby at the start of a band with none: the way in to the core).
  function lwFixed(band) {
    var last = -1;
    band.forEach(function (r, i) { if (LW_CORE[r.kind] || (r.parts && r.parts.some(function (p) { return LW_CORE[p.kind]; }))) { last = i; } });
    if (last < 0 && band[0] && (band[0].kind === "landing" || band[0].kind === "lobby")) { last = 0; }
    return last + 1;
  }
  // The rest in its groups: rooms that open off one another kept together,
  // as they stand (a flat, its bedroom, the bathroom off that).
  function lwGroups(tail) {
    var ids = {}, top = tail.map(function (r, i) { return i; });
    function root(i) { while (top[i] !== i) { i = top[i]; } return i; }
    function join(i, j) { top[root(i)] = root(j); }
    function each(r, fn) { fn(r); (r.parts || []).forEach(fn); }
    tail.forEach(function (r, i) { each(r, function (p) { if (p.id) { ids[p.id] = i; } }); });
    tail.forEach(function (r, i) { each(r, function (p) { if (p.via && ids[p.via] !== undefined) { join(i, ids[p.via]); } }); });
    var groups = [], last = null;
    for (var i = 0; i < tail.length; i++) {
      var g = root(i);
      if (last && last.root === g) { last.rooms.push(tail[i]); continue; }
      if (groups.some(function (o) { return o.root === g; })) { return null; }     // (not side by side: left as it is)
      last = { root: g, rooms: [tail[i]] };
      groups.push(last);
    }
    return groups.map(function (o) { return o.rooms; });
  }
  // The same band, its groups mirrored, their order turned about or moved round.
  function lwShuffleBand(band, how, W, grow) {
    var at = lwFixed(band), fixed = band.slice(0, at), groups = lwGroups(band.slice(at));
    if (!groups || groups.length < 1) { return band; }
    if (how.mirror) { groups = groups.map(function (g) { return g.slice().reverse(); }); }
    if (how.reverse) { groups = groups.slice().reverse(); }
    if (how.rotate && groups.length > 2) { groups = groups.slice(1).concat(groups.slice(0, 1)); }
    var out = fixed.concat([].concat.apply([], groups));
    if (W) { typeFill(out, W, grow); }
    return out;
  }
  // A block of flats' floor of its own (or a block of condos'): its homes of
  // the sizes picked for it, mirrored as picked, lettered along the floor.
  var LW_FLATS = {
    apartments: { flat: 6.0, bed: 3.8, bath: 2.4, suite: 4.6, id: "a", name: "ty_flat_n", side: "flatsSide", beds: function (w) { return w.flatBeds > 1 ? 2 : 1; } },
    condos: { flat: 7.2, bed: 4.2, bath: 2.6, suite: 4.6, id: "c", name: "ty_condo_n", side: "condosSide", beds: function (w) { return w.condoBeds === 1 ? 1 : 2; } }
  };
  function lwUnit(S, kind, id, label, mirror) {
    var u;
    if (kind === "compact") {
      u = [R("flat", S.flat - 1.2, { id: id, label: label }), R("flatbed", S.bed - 0.4, { id: id + "b", via: id }), R("flatbath", S.bath - 0.2, { via: id + "b" })];
    } else if (kind === "one") {
      u = [R("flat", S.flat, { id: id, label: label }), R("flatbed", S.bed, { id: id + "b", via: id }), R("flatbath", S.bath, { via: id + "b" })];
    } else {
      var big = kind === "big";
      u = [R("flatbed", S.bed + (big ? 0.4 : 0), { id: id + "b", via: id, label: TXT.st_main }), R("flat", S.flat + (big ? 2.2 : 0), { id: id, label: label }),
           { kind: "suite", w: S.suite, parts: [R("flatbed2", S.suite, { id: id + "c", via: id }), R("flatbath", S.suite, { via: id + "c" })] }];
    }
    return mirror ? u.reverse() : u;
  }
  function lwFlatsFloor(type, want, f, k, top, W, rnd, was) {
    var S = LW_FLATS[type], K = Math.max(1, Math.min(TYPE_MOST.side, want[S.side] || (type === "condos" ? 1 : 2))), B = S.beds(want);
    var kinds = ["mirror", "mix", "turn"].filter(function (v) { return v !== was; });
    var how = k === top && top >= 2 ? "top" : kinds[Math.floor(rnd() * kinds.length)];
    var letter = 0;
    ["back", "front"].forEach(function (side, si) {
      var band = f[side], at = lwFixed(band), fixed = band.slice(0, at);
      var n = how === "top" ? Math.max(1, Math.floor(K / 2)) : K, list = [];
      for (var u = 0; u < n; u++) {
        var kind = how === "top" ? "big" : B > 1 ? (how === "mix" && (u + si + k) % 2 ? "one" : "two") : (how === "mix" && (u + si + k) % 2 ? "compact" : "one");
        var mirror = how === "mirror" ? (u + si) % 2 === 0 : how === "turn" ? (u + si + k) % 2 === 1 : rnd() < 0.5;
        list.push({ kind: kind, mirror: mirror, id: S.id + k + side + u + "v" });
      }
      if (how === "turn") { list.reverse(); }
      // (no wider than the building: the last made smaller, then one fewer)
      function width() { return typeWidth(fixed) + list.reduce(function (s, o) { return s + typeWidth(lwUnit(S, o.kind, "x", "", false)); }, 0); }
      for (var i = list.length - 1; i >= 0 && width() > W + 0.01; i--) { list[i].kind = "compact"; }
      while (list.length > 1 && width() > W + 0.01) { list.pop(); }
      var out = fixed.slice();
      list.forEach(function (o) {
        var name = say(S.name, { n: (k + 1) + String.fromCharCode(65 + letter++) });
        Array.prototype.push.apply(out, lwUnit(S, o.kind, o.id, name, o.mirror));
      });
      typeFill(out, W, ["flat", "landing"]);
      f[side] = out;
    });
    return how;
  }
  // A tower's floor of offices: open, in rooms along the front, meeting
  // rooms, or cubicles -- each floor one of them, never two alike in turn.
  function lwOfficeFront(W, how) {
    if (how === "rooms") {
      var out = [], n = Math.max(1, Math.floor((W * 0.55) / 3.4));
      for (var i = 0; i < n; i++) { out.push(R("office", 3.4, { label: TXT.tr_office })); }
      out.push(R("openoffice", W - n * 3.4));
      return out;
    }
    if (how === "meet") { return [R("meeting", 4.6), R("openoffice", W - 9.2), R("meeting", 4.6)]; }
    if (how === "cubes") { return [R("staff", 4.0, { label: TXT.tr_breakout }), R("cubicles", W - 4.0, { label: TXT.pg_cubicles || "" })]; }
    return [R("openoffice", W)];
  }
  // A lift: its car behind a lobby off the hall -- the car was the band's
  // whole depth, 2 m by nearly 5, a corridor to ride in (2026-10-03, the
  // rooms' lengths and widths "seem off").  The same on every floor, the
  // cars one over another.
  function lwLiftLobbies(out) {
    out.floors.forEach(function (f, k) {
      var deep = f.Db || 4.2, n = 0;
      if (deep < 4.2 || !f.back) { return; }
      f.back = f.back.map(function (r) {
        if (r.kind !== "lift") { return r; }
        var id = "lw" + k + "l" + n++;
        return { kind: "suite", w: r.w, parts: [R("lift", r.w, { id: id + "c", via: id + "b", label: r.label }), R("landing", r.w, { id: id + "b", label: TXT.lw_liftlobby })] };
      });
    });
  }
  function lwVaryPlan(type, out, want) {
    if (!out || !out.floors) { return out; }
    try { lwLiftLobbies(out); } catch (e) { /* its lifts as they were */ }
    if (out.floors.length < 2 || type === "office") { return out; }
    var top = out.floors.length - 1, W = out.W, rnd = lwRnd(((want && want.seed) >>> 0) * 2654435761 + 97), was = null;
    out.floors.forEach(function (f, k) {
      if (k === 0 || !f.back || !f.front) { return; }
      try {
        if (LW_FLATS[type]) { was = lwFlatsFloor(type, want, f, k, top, W, rnd, was); return; }
        if (type === "tower") {
          var homes = f.front.some(function (r) { return r.kind === "flat"; });
          if (homes) {
            // its homes swapped about, mirrored, their sizes shifted along the floor
            var how = { mirror: rnd() < 0.5, reverse: rnd() < 0.5 };
            f.front = lwShuffleBand(f.front, how, W, ["flat"]);
            var flats = f.front.filter(function (r) { return r.kind === "flat"; });
            if (flats.length >= 2) { var d = (rnd() - 0.5) * Math.min(flats[0].w, flats[1].w) * 0.5; flats[0].w += d; flats[1].w -= d; }
          } else if (k < top && f.front.length === 1 && f.front[0].kind === "openoffice") {
            var ways = ["open", "rooms", "meet", "cubes"].filter(function (v) { return v !== was; });
            was = ways[Math.floor(rnd() * ways.length)];
            f.front = lwOfficeFront(W, was);
          }
          return;
        }
        // any other: what follows the core turned about, floor by floor
        if (k < top) {
          f.back = lwShuffleBand(f.back, { mirror: k % 2 === 1, reverse: k % 3 === 1, rotate: k % 3 === 2 }, W, []);
          f.front = lwShuffleBand(f.front, { reverse: k % 2 === 1 }, W, []);
        }
      } catch (e) { /* this floor as it was */ }
    });
    return out;
  }
  if (typeof BUILDING_TYPES === "object") {
    ["apartments", "condos", "tower", "school", "office"].forEach(function (t) {
      var T = BUILDING_TYPES[t];
      if (!T || typeof T.plan !== "function" || T.lwVaried) { return; }
      var plain = T.plan;
      T.plan = function (want) { return lwVaryPlan(t, plain.apply(this, arguments), want || {}); };
      T.lwVaried = true;
    });
  }

  // ---- what goes round it, out in front -----------------------------------------------------------
  // (asked for, 2026-10-04: "it is putting the cart chorale in the back of
  // the store rather than on the front or the sides where the parking is",
  // "nothing really gets put behind stores and stuff unless it is like the
  // dumpster")  The grounds' things for the front (40-grounds.js: carts,
  // benches, planters, lamps, tables) were sent to the spot nearest a point
  // that, for the front, was the house's back (yardSpot has no front of its
  // own): every one of them went behind.  Now each goes where it is used:
  // cart corrals in the parking, a stall each, spread along the rows;
  // benches and planters on the walk by the way in; lamps along the walk;
  // a cafe's tables out on its front walk.  Behind a shop there is only
  // what serves it -- the dumpster, the door to the stock room.
  var LW_FRONT = { carts: 1, benches: 1, planters: 1, lamps: 1, seating: 1 };
  function lwFrontFrame(H) {
    var F = ybFrame(H), P = F.P, doors = ybDoors(F), main = lwMainDoor(F, doors), band = H.lot.lwBand || null;
    ybZones(F, doors);
    // the walk along the front, in the lot's numbers: as laid out, else a strip by the wall
    var w0 = F.hb.b + (band && band.walk ? band.walk[0] : 0.4 * P), w1 = F.hb.b + (band && band.walk ? band.walk[1] : 2.2 * P);
    var hold = { i_sidewalk: 1 };
    var busy = hand.nodes.filter(function (n) { return !hold[n.kind] && ybStands(F, n); }).map(function (n) { return F.box(n, 0.05 * P); });
    function free(b) {
      if (b.l < F.L.l + 0.2 * P || b.r > F.L.r - 0.2 * P || b.t < F.L.t + 0.2 * P || b.b > F.L.b - 0.2 * P) { return false; }
      if (F.house.some(function (o) { return b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t; })) { return false; }
      if (F.zones.some(function (o) { return b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t; })) { return false; }
      return !busy.some(function (o) { return b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t; });
    }
    function take(n) { busy.push(F.box(n, 0.05 * P)); }
    return { F: F, P: P, doors: doors, main: main, w0: w0, w1: w1, free: free, take: take };
  }
  // Spots along the front walk, out from the way in both sides by turns: [x, side].
  function lwAlongFront(Q, gap, from) {
    var P = Q.P, F = Q.F, mx = Q.main && Q.main.oy > 0.5 ? Q.main.x : (F.hb.l + F.hb.r) / 2, out = [];
    for (var k = 0; k < 40; k++) {
      var s = k % 2 ? -1 : 1, x = mx + s * (from + Math.floor(k / 2) * gap);
      if (x < F.hb.l - 1 * P || x > F.hb.r + 1 * P) { continue; }
      out.push([x, s]);
    }
    return out;
  }
  function lwPutOut(Q, kind, x, y, turn, key) {
    var icon = ICONS[kind];
    if (!icon) { return null; }
    var q = turned({ w: icon.box[0], h: icon.box[1], turn: turn }), b = { l: x - q.w / 2, r: x + q.w / 2, t: y - q.h / 2, b: y + q.h / 2 };
    if (!Q.free(b)) { return null; }
    var n = ybPut(Q.F, kind, x, y, turn);
    n.yard = key;
    Q.take(n);
    return n;
  }
  function lwFrontBenches(Q, key) {
    var P = Q.P, icon = ICONS.i_gardenbench, put = 0, want = Math.max(2, Math.min(4, Math.round((Q.F.hb.r - Q.F.hb.l) / (10 * P))));
    if (!icon) { return 0; }
    var y = Q.w1 - Q.w0 >= 1.8 * P ? Q.w0 + icon.box[1] / 2 + 0.15 * P : Q.w1 + icon.box[1] / 2 + 0.4 * P;
    // (past the planters either side of the way in)
    lwAlongFront(Q, 3.6 * P, (Q.main ? Q.main.w / 2 : 0) + 3.4 * P).some(function (s) { if (lwPutOut(Q, "i_gardenbench", s[0], y, 0, key)) { put++; } return put >= want; });
    return put;
  }
  // Spots on the walks down the building's sides, from its front corners
  // back as far as a third of its depth (not round the back): [x, y, side].
  function lwAlongSides(Q, gap) {
    var P = Q.P, hb = Q.F.hb, out = [], deep = (hb.b - hb.t) / 3;
    for (var d = 1.2 * P; d <= deep; d += gap) {
      [-1, 1].forEach(function (s) { out.push([s < 0 ? hb.l - 1.4 * P : hb.r + 1.4 * P, hb.b - d, s]); });
    }
    return out;
  }
  function lwFrontPlanters(Q, key) {
    var P = Q.P, icon = ICONS.i_planter, put = 0;
    if (!icon || !Q.main) { return 0; }
    var y = Q.w0 + icon.box[1] / 2 + 0.12 * P, d = Q.main.w / 2 + 1.0 * P + icon.box[0] / 2;
    [1, -1, 2, -2].forEach(function (k) {
      var x = Q.main.x + Math.sign(k) * (d + (Math.abs(k) - 1) * (icon.box[0] + 0.6 * P));
      if (lwPutOut(Q, "i_planter", x, y, 0, key)) { put++; }
    });
    return put;
  }
  function lwFrontLamps(Q, key) {
    var P = Q.P, put = 0, y = Q.w1 - 0.3 * P;
    for (var x = Q.F.hb.l + 2 * P; x <= Q.F.hb.r - 2 * P; x += 9 * P) { if (lwPutOut(Q, "i_lamppost", x, y, 0, key)) { put++; } }
    return put;
  }
  // A cafe's tables on its walk, a chair each side, toward the sun and the street.
  function lwFrontTables(Q, key) {
    var P = Q.P, icon = ICONS.i_roundtable, put = 0;
    if (!icon) { return 0; }
    var deep = Q.w1 - Q.w0, y = deep >= 2.6 * P ? Q.w0 + deep / 2 : Q.w1 + 1.4 * P;
    function table(x, ty) {
      if (!lwPutOut(Q, "i_roundtable", x, ty, 0, key)) { return false; }
      put++;
      [-1, 1].forEach(function (k) { lwPutOut(Q, "i_chair", x + k * (icon.box[0] / 2 + 0.35 * P), ty, k < 0 ? 90 : 270, key); });
      return true;
    }
    lwAlongFront(Q, 2.8 * P, (Q.main ? Q.main.w / 2 : 0) + 2.4 * P).some(function (s) { table(s[0], y); return put >= 4; });
    // (no room out in front -- the parking comes up to the walk: a corner down the side)
    if (put < 2) { lwAlongSides(Q, 2.4 * P).some(function (s) { table(s[0], s[1]); return put >= 3; }); }
    return put;
  }
  // Cart corrals: in the parking, a stall each, one to every twenty-five or
  // so -- along the rows, not by the way in, never a stall kept for a
  // wheelchair or a charger; no parking, a cart rail on the walk by the door.
  function lwCartCorrals(Q, key) {
    var P = Q.P, F = Q.F, rows = hand.nodes.filter(function (n) { return n.kind === "i_parking" && n.yard === "parking" && insideArea(F.lot, n.x, n.y, -P); });
    var spots = [], total = 0;
    rows.forEach(function (lot) {
      var S = parkLayout(lot.w, lot.h), t = (lot.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
      total += S.stalls.length;
      var keep = [].concat(lot.access || [], lot.aisle || [], lot.ev || []);
      S.stalls.forEach(function (st, i) {
        if (keep.indexOf(i) >= 0 || S.stalls.length < 4 || i === 0 || i === S.stalls.length - 1) { return; }
        var lx = st.x - lot.w / 2, ly = st.y - lot.h / 2, x = lot.x + lx * c - ly * s, y = lot.y + lx * s + ly * c;
        var q = F.local(x, y), door = Q.main ? Math.hypot(q[0] - Q.main.x, q[1] - Q.main.y) : 0;
        spots.push({ lot: lot, i: i, x: x, y: y, turn: (lot.turn || 0) + (st.head < 0 ? 0 : 180), door: door, rowAt: i / Math.max(1, S.stalls.length - 1) });
      });
    });
    var want = Math.max(1, Math.min(8, Math.round(total / 25))), put = 0;
    if (spots.length) {
      // (spread out: the stalls a third and two thirds along the rows first, the nearer the door the sooner)
      spots.sort(function (a, b) { return Math.abs(Math.abs(a.rowAt - 0.5) - 0.18) - Math.abs(Math.abs(b.rowAt - 0.5) - 0.18) || a.door - b.door; });
      var chosen = [];
      spots.forEach(function (sp) {
        if (chosen.length >= want || chosen.some(function (o) { return Math.hypot(o.x - sp.x, o.y - sp.y) < 14 * P; })) { return; }
        chosen.push(sp);
      });
      chosen.forEach(function (sp) {
        var gone = {};
        hand.nodes.forEach(function (n) { if (n.kind === "i_parked" && Math.hypot(n.x - sp.x, n.y - sp.y) < 1.3 * P) { gone[n.id] = true; } });
        hand.nodes = hand.nodes.filter(function (n) { return !gone[n.id]; });
        var n = adviceAdd("i_cartcorral", Math.round(sp.x), Math.round(sp.y), ((Math.round(sp.turn) % 360) + 360) % 360);
        n.own = true; n.yard = key;
        sp.lot.corrals = (sp.lot.corrals || []).concat([sp.i]);
        put++;
      });
      return put;
    }
    // No parking of its own (a shop on a street): no corral, a few carts
    // nested in a line against the wall beside the way in, out of the way
    // of the door; down the side where the front has no room.
    var cart = ICONS.i_cart;
    if (!cart) { return 0; }
    var cl = Math.max(cart.box[0], cart.box[1]), cw = Math.min(cart.box[0], cart.box[1]), count = 4, step = 0.3 * P, len = cl + (count - 1) * step;
    var turn = cart.box[1] >= cart.box[0] ? 90 : 0, from = (Q.main ? Q.main.w / 2 : 0) + 1.0 * P + len / 2, rowY = Q.w0 + cw / 2 + 0.12 * P;
    function line(cx, cy, along) {
      var b = along ? { l: cx - len / 2, r: cx + len / 2, t: cy - cw / 2, b: cy + cw / 2 } : { l: cx - cw / 2, r: cx + cw / 2, t: cy - len / 2, b: cy + len / 2 };
      if (!Q.free(b)) { return false; }
      for (var i = 0; i < count; i++) {
        var o = -len / 2 + cl / 2 + i * step, n = ybPut(Q.F, "i_cart", along ? cx + o : cx, along ? cy : cy + o, along ? turn : turn + 90);
        n.yard = key; Q.take(n); put++;
      }
      return true;
    }
    if (!lwAlongFront(Q, len + 0.6 * P, from).some(function (s) { return line(s[0], rowY, true); })) {
      lwAlongSides(Q, len + 0.4 * P).some(function (s) { return line(s[0] + (s[2] < 0 ? 0.6 * P : -0.6 * P), s[1] - len / 2, false); });
    }
    return put;
  }
  function lwFrontItems(key, houses) {
    var put = 0;
    (houses || yardHouses()).forEach(function (H) {
      try {
        var Q = lwFrontFrame(H);
        if (!Q.F.house.length) { return; }
        put += key === "carts" ? lwCartCorrals(Q, key) : key === "benches" ? lwFrontBenches(Q, key) : key === "planters" ? lwFrontPlanters(Q, key)
             : key === "lamps" ? lwFrontLamps(Q, key) : lwFrontTables(Q, key);
      } catch (e) { if (window.console) { console.warn("front:", e && e.message); } }
    });
    picked = null; chosen = null; many = [];
    return put;
  }
  if (typeof yardPut === "function") {
    var yardPutFront = yardPut;
    yardPut = function (key, houses) {
      if (LW_FRONT[key] && lwSiteType(lwTypeNow())) {
        var got = lwFrontItems(key, houses);
        // (none of these behind a building: where the front has no room for
        // them, none -- but lamps, which light a back lot as well)
        if (got || key !== "lamps") { return got; }
      }
      return yardPutFront.apply(this, arguments);
    };
  }
  // A store's carts come with its parking, as its parking does (the grounds' tile still takes them away).
  if (typeof GROUNDS_FOR === "object" && GROUNDS_FOR.store && GROUNDS_FOR.store.indexOf("carts") < 0) { GROUNDS_FOR.store.splice(1, 0, "carts"); }
  if (typeof groundsAsk === "function") {
    var groundsAskCarts = groundsAsk;
    groundsAsk = function (ui, want) {
      if (want && (want.type === "shop") && (!want.yard || want.yard.carts === undefined)) {
        want.yard = Object.assign({}, want.yard && typeof want.yard === "object" ? want.yard : {}, { carts: true });
      }
      return groundsAskCarts.apply(this, arguments);
    };
  }
