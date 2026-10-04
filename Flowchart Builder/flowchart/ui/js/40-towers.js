// ---------------------------------------------------------------------------
//  40-towers.js -- skyscrapers: a building type of its own in Start
//  building, in ten forms after the towers people travel to see; the same
//  forms on a city's skyline, and on the blocks round a building in a city
//  -- row houses and walk-ups beside the towers
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "be able to model skyscrapers in cities and also
  // normal buildings in neighborhoods of other houses and in cities with
  // other houses and skyscrapers ... look and search around the world at
  // sky scrapers to look at all there unique and interesting designs and
  // implementing similar styles ... for the prebuilds and for people to
  // build with too")
  //
  // The forms, each what makes a famous tower itself:
  //   spire   -- a Y in plan, its three wings stepping back in a spiral as
  //              it rises, to a spire (Burj Khalifa, Dubai)
  //   twist   -- a softened triangle turning a third of the way round from
  //              the street to the top (Shanghai Tower; Turning Torso, Malmö)
  //   pagoda  -- eight stacked modules, each flaring out at its top (Taipei 101)
  //   deco    -- wedding-cake setbacks, stone piers, a terraced crown and a
  //              needle (Chrysler and Empire State Buildings, New York)
  //   diagrid -- round, swelling and then rounding off, glass between a
  //              diagonal steel grid (30 St Mary Axe, London)
  //   star    -- an eight-pointed star of two squares, setbacks near the
  //              top, a pinnacle (Petronas Towers, Kuala Lumpur)
  //   chamfer -- a square base whose corners are cut back as it rises, to a
  //              square turned 45° at the top, a mast (One World Trade Center)
  //   taper   -- a square morphing to a circle as it narrows, an open crown
  //              (Lotte World Tower, Seoul)
  //   forest  -- balconies stepping in and out, trees on them (Bosco
  //              Verticale, Milan)
  //   slab    -- the plain glass box on its plaza (Seagram Building)
  var TOWER_FORMS = {
    spire:   { color: "#a8b4bf", pat: 78, crown: "spire" },
    twist:   { color: "#6f8e99", pat: 78, crown: "cap" },
    pagoda:  { color: "#5f857f", pat: 78, crown: "mast" },
    deco:    { color: "#c9bfae", pat: 76, crown: "sunburst" },
    diagrid: { color: "#4e6b7d", pat: 79, crown: "dome" },
    star:    { color: "#b4b9be", pat: 78, crown: "pinnacle" },
    chamfer: { color: "#8199ab", pat: 78, crown: "antenna" },
    taper:   { color: "#b9c3cc", pat: 78, crown: "lattice" },
    forest:  { color: "#8d8780", pat: 76, crown: "garden" },
    slab:    { color: "#56616b", pat: 78, crown: "box" }
  };
  var TOWER_ORDER = ["spire", "twist", "pagoda", "deco", "diagrid", "star", "chamfer", "taper", "forest", "slab"];
  var TOWER_MOST = 120;                 // storeys, typed in past the steps

  // ---- a form's shape at a height ---------------------------------------------------------------
  // How far out its outline is that way (`a`, radians) at `t` of the way
  // up (0 to 1), round its middle -- as a share of its widest.
  function towerSq(a) { return 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))); }
  function towerWing(i, t) {             // a Y's wing: how much of it is left, stepping back by turns
    // (2026-10-03: stepped back to a fifth, the top so narrow that the
    // floors it holds made the foot twice as broad -- a squat wedding cake
    // at 30 storeys.  Back less far, the tower stands slender.)
    var o = 0.1 * i;
    return t < 0.22 + o ? 1 : t < 0.45 + o ? 0.8 : t < 0.68 + o ? 0.6 : 0.42;
  }
  function towerR(form, a, t) {
    switch (form) {
      case "slab": case "forest": return 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)) * 1.45);
      case "deco": return towerSq(a) * 0.72;
      case "pagoda": return Math.min(towerSq(a) * 0.72, 0.9);
      case "spire": {
        // (its hub as wide as the floors it holds: a hub too narrow made a squat tower of broad wings)
        var r = 0.6;
        for (var i = 0; i < 3; i++) {
          var w = i * 2 * Math.PI / 3 + Math.PI / 2, d = Math.atan2(Math.sin(a - w), Math.cos(a - w));
          r = Math.max(r, 0.6 + 0.4 * towerWing(i, t) * Math.pow(Math.max(0, Math.cos(d * 2.4)), 0.65));
        }
        return r;
      }
      case "twist": return 0.86 + 0.14 * Math.cos(3 * a);
      case "diagrid": return 1;
      case "star": return Math.max(Math.max(towerSq(a), towerSq(a - Math.PI / 4)) / Math.SQRT2, 0.82);
      case "chamfer": return Math.min((1 - 0.28 * t) * towerSq(a), (1.414 - 0.74 * t) * towerSq(a - Math.PI / 4)) * 0.72;
      case "taper": return ((1 - t) * towerSq(a) * 0.86 + t);
    }
    return 1;
  }
  // How wide it is at `t` of the way up, against its widest; and turned how far.
  function towerP(form, t) {
    switch (form) {
      case "deco": return t < 0.55 ? 1 : t < 0.74 ? 0.82 : t < 0.88 ? 0.64 : 0.5;
      case "spire": return 1 - 0.08 * t;
      case "twist": return 1 - 0.3 * t;
      case "pagoda": if (t < 0.13) { return 1 - t / 0.13 * 0.16; } return 0.8 + 0.17 * (((t - 0.13) / 0.87 * 8) % 1);
      case "diagrid": { var u = t * 0.82; return u < 0.38 ? 0.86 + 0.14 * Math.sin(u / 0.38 * Math.PI / 2) : Math.sqrt(Math.max(0.04, 1 - Math.pow((u - 0.38) / 0.62, 2))); }
      case "star": return t < 0.62 ? 1 : t < 0.7 ? 0.9 : t < 0.78 ? 0.8 : t < 0.85 ? 0.7 : t < 0.92 ? 0.6 : 0.5;
      case "taper": return 1 - 0.42 * t;
      case "forest": return 1;
    }
    return 1;
  }
  function towerTurn(form, t) { return form === "twist" ? t * 2 * Math.PI / 3 : 0; }
  // Its outline at `t`: points round its middle `c`, `R` the widest out, `n` of them.
  function towerOutline(form, c, R, t, n) {
    var out = [], turn = towerTurn(form, t), s = towerP(form, t) * R;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2;
      var r = towerR(form, a - turn, t) * s;
      out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
    }
    return out;
  }

  // ---- drawn: for the 3D view's faces, or the scenery's vertices ---------------------------------------
  // `put(pts, n, color, pat)` takes each face; colors as [r, g, b].
  function towerHex(c) { return "#" + c.map(function (v) { return ("0" + Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16)).slice(-2); }).join(""); }
  function towerRgb(hex) { var m = /^#?(..)(..)(..)$/.exec(hex); return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0.5, 0.5, 0.5]; }
  function towerNorm(p, q, up) {
    var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
    return [dy / l, -dx / l, up || 0];
  }
  // One band of its skin, from z0 to z1, between two outlines (the one at
  // its foot, the one at its head -- the same where it does not change).
  function towerBand(put, lo, hi, z0, z1, color, pat, c) {
    for (var i = 0; i < lo.length; i++) {
      var j = (i + 1) % lo.length, a = lo[i], b = lo[j], A = hi[i], B = hi[j];
      var n = towerNorm(a, b);
      var mx = (a[0] + b[0]) / 2 - c[0], my = (a[1] + b[1]) / 2 - c[1];
      if (n[0] * mx + n[1] * my < 0) { n = [-n[0], -n[1], 0]; }
      put([[a[0], a[1], z0], [b[0], b[1], z0], [B[0], B[1], z1], [A[0], A[1], z1]], n, color, pat);
    }
  }
  function towerCap(put, ring, z, color, pat, down) {
    put(ring.map(function (p) { return [p[0], p[1], z]; }), [0, 0, down ? -1 : 1], color, pat);
  }
  // A box, a ring or a spike, for the crowns.
  function towerPrism(put, c, r, z0, z1, sides, color, pat, r1) {
    var lo = [], hi = [];
    for (var i = 0; i < sides; i++) {
      var a = i / sides * Math.PI * 2 + Math.PI / sides;
      lo.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
      hi.push([c[0] + Math.cos(a) * (r1 === undefined ? r : r1), c[1] + Math.sin(a) * (r1 === undefined ? r : r1)]);
    }
    towerBand(put, lo, hi, z0, z1, color, pat, c);
    if (r1 === undefined || r1 > 0.5) { towerCap(put, hi, z1, color, pat); }
  }
  // The crown on top: `top` the roof's height, `R` how wide the top floor is, `H` how tall the tower.
  function towerCrown(put, form, c, R, top, H, base, dark, steel) {
    var P = FLOOR_PX, kind = (TOWER_FORMS[form] || TOWER_FORMS.slab).crown;
    if (kind === "spire") {
      // (its needle as tall again as a third of the tower, as the Burj's is)
      towerPrism(put, c, R * 0.3, top, top + H * 0.1, 6, steel, 22, R * 0.18);
      towerPrism(put, c, R * 0.18, top + H * 0.1, top + H * 0.36, 6, steel, 22, R * 0.02);
    } else if (kind === "sunburst") {
      // terraced arches, ring in ring, narrowing; and the needle
      for (var k = 0; k < 6; k++) {
        var r0 = R * (0.62 - k * 0.09);
        towerPrism(put, c, r0, top + k * R * 0.22, top + (k + 1) * R * 0.22, 16, k % 2 ? steel : base, 22, r0 * 0.92);
      }
      towerPrism(put, c, R * 0.06, top + R * 1.32, top + R * 1.32 + H * 0.12, 8, steel, 22, 0.3);
    } else if (kind === "mast") {
      for (var m = 0; m < 4; m++) { towerPrism(put, c, R * (0.4 - m * 0.08), top + m * R * 0.2, top + (m + 1) * R * 0.2, 8, m % 2 ? dark : base, 78, R * (0.44 - m * 0.08)); }
      towerPrism(put, c, R * 0.05, top + R * 0.8, top + R * 0.8 + H * 0.12, 6, steel, 22, 0.3);
    } else if (kind === "dome") {
      // (the round top: rings drawing in to a point)
      var rings = 6, last = R;
      for (var d = 1; d <= rings; d++) {
        var u = d / rings, r = R * Math.cos(u * Math.PI / 2), z0 = top + R * 0.7 * Math.sin((d - 1) / rings * Math.PI / 2), z1 = top + R * 0.7 * Math.sin(u * Math.PI / 2);
        towerPrism(put, c, last, z0, z1, 24, dark, 79, Math.max(0.6, r));
        last = r;
      }
    } else if (kind === "pinnacle") {
      for (var q = 0; q < 5; q++) { towerPrism(put, c, R * (0.4 - q * 0.07), top + q * R * 0.25, top + (q + 1) * R * 0.25, 16, steel, 22, R * (0.36 - q * 0.07)); }
      towerPrism(put, c, R * 0.06, top + R * 1.25, top + R * 1.25 + H * 0.14, 8, steel, 22, 0.3);
      towerPrism(put, [c[0], c[1]], R * 0.09, top + R * 1.25 + H * 0.07, top + R * 1.25 + H * 0.08, 10, steel, 22);
    } else if (kind === "antenna") {
      towerPrism(put, c, R * 0.6, top, top + 3.6 * P, 4, base, 78, R * 0.6);
      towerPrism(put, c, R * 0.12, top + 3.6 * P, top + 6 * P, 8, steel, 22, R * 0.08);
      towerPrism(put, c, R * 0.04, top + 6 * P, top + 6 * P + H * 0.2, 6, steel, 22, 0.3);
    } else if (kind === "lattice") {
      // an open crown: fins rising round the edge to points, nothing over them
      for (var f = 0; f < 16; f++) {
        var a = f / 16 * Math.PI * 2, x = c[0] + Math.cos(a) * R * 0.85, y = c[1] + Math.sin(a) * R * 0.85, w = R * 0.08;
        var nx = Math.cos(a), ny = Math.sin(a);
        put([[x - ny * w, y + nx * w, top], [x + ny * w, y - nx * w, top], [c[0] + nx * R * 0.2, c[1] + ny * R * 0.2, top + R * 1.4]], [nx, ny, 0.3], steel, 22);
      }
    } else if (kind === "cap") {
      towerPrism(put, c, R * 0.9, top, top + R * 0.35, 3, dark, 78, R * 0.5);
      towerPrism(put, c, R * 0.06, top + R * 0.35, top + R * 0.35 + H * 0.05, 6, steel, 22, 0.3);
    } else if (kind === "garden" && typeof foliageClump === "function") {
      return "garden";
    } else {
      towerPrism(put, c, R * 0.45, top, top + 3.2 * P, 4, dark, 22, R * 0.45);
      towerPrism(put, c, R * 0.03, top + 3.2 * P, top + 3.2 * P + H * 0.06, 6, steel, 22, 0.3);
    }
    return null;
  }

  // ---- on the skyline, and next door -----------------------------------------------------------------
  // A whole tower, its floors in bands (a few to a band, far off), its crown on top.
  function towerWhole(put, form, c, R, floors, storey, opt) {
    var F = TOWER_FORMS[form] || TOWER_FORMS.slab, n = opt.sides || 24, every = opt.every || 3;
    var base = opt.color || towerRgb(F.color), dark = [base[0] * 0.55, base[1] * 0.6, base[2] * 0.66], steel = [0.82, 0.84, 0.86];
    var H = floors * storey, last = towerOutline(form, c, R, 0, n), z = 0;
    for (var k = 0; k < floors; k += every) {
      var t1 = Math.min(1, (k + every) / floors), next = towerOutline(form, c, R, t1, n), z1 = Math.min(H, (k + every) * storey);
      // (a setback: the band straight up, and the terrace over it)
      var stepped = Math.abs(towerP(form, t1) - towerP(form, Math.max(0, t1 - every / floors))) > 0.04 && form !== "pagoda" && form !== "diagrid";
      towerBand(put, last, stepped ? last : next, z, z1, base, F.pat, c);
      if (stepped) { towerCap(put, last, z1, dark, 10); }
      if (form === "forest" && opt.trees) { opt.trees(last, z1); }
      last = next; z = z1;
    }
    towerCap(put, last, H, dark, 10);
    var r = 0;
    last.forEach(function (p) { r = Math.max(r, Math.hypot(p[0] - c[0], p[1] - c[1])); });
    return towerCrown(put, form, c, r, H, H, base, dark, steel);
  }
  // The scenery's way of taking a face (38-view3d-gl.js).
  function towerGlPut(v) {
    return function (pts, n, c, pat) {
      var l = Math.hypot(n[0], n[1], n[2]) || 1;
      gl3Poly(v, pts, [n[0] / l, n[1] / l, n[2] / l], c, 1, pts.map(function (p, i) { return [i % 2, i > 1 ? 1 : 0]; }), pat);
    };
  }
  // The city all round: towers of every form, tall ones and taller.
  if (typeof worldHorizon === "function") {
    var worldHorizonTowers = worldHorizon;
    worldHorizon = function (v, L) {
      var look = worldLook();
      if (!look || look.sky !== "towers") { return worldHorizonTowers.apply(this, arguments); }
      var F = GL3_FAR, rnd = gl3Rand(Math.round(L.mid[0] * 3 + L.mid[1] * 11) + 5), P = FLOOR_PX, put = towerGlPut(v);
      var tones = [[0.62, 0.66, 0.7], [0.45, 0.54, 0.6], [0.72, 0.68, 0.6], [0.4, 0.46, 0.52], [0.66, 0.6, 0.55], [0.36, 0.5, 0.52]];
      for (var t = 0; t < 120; t++) {
        var th = rnd() * Math.PI * 2, far = F * (0.33 + rnd() * 0.15), at = [L.mid[0] + Math.cos(th) * far, L.mid[1] + Math.sin(th) * far];
        var tall = rnd() < 0.18, floors = tall ? 45 + Math.floor(rnd() * 70) : 8 + Math.floor(Math.pow(rnd(), 1.6) * 40);
        var form = tall ? TOWER_ORDER[Math.floor(rnd() * TOWER_ORDER.length)] : rnd() < 0.6 ? "slab" : ["deco", "chamfer", "taper", "forest"][Math.floor(rnd() * 4)];
        var R = (tall ? 22 + rnd() * 14 : 12 + rnd() * 16) * P;
        towerWhole(put, form, at, R, floors, 3.7 * P, { sides: tall ? 20 : 8, every: tall ? 4 : 3, color: gl3Mix(tones[t % tones.length], L.sheetC, 0.1) });
      }
      if (typeof worldRing === "function") {
        worldRing(v, L, F * 0.3, F * 0.5, 72, function () { return 150 + 250 * rnd(); }, gl3Mix([0.5, 0.58, 0.5], L.sheetC, 0.2), PAT.hill, null);
      }
      return true;
    };
  }
  // On the blocks round a building in a city: now and then a tower, now and
  // then a row of narrow houses, the rest the walk-ups there were.
  if (typeof worldNeighbor === "function") {
    var worldNeighborTowers = worldNeighbor;
    worldNeighbor = function (v, L, s, W, D, hood, ax, rnd) {
      if (!hood || !hood.tall) { return worldNeighborTowers.apply(this, arguments); }
      var roll = rnd();
      if (roll < 0.3) {
        var P = FLOOR_PX, flip = s.back ? -1 : 1, mid = L.lotWorld(s.x, s.front - flip * (D / 2), 0);
        var form = TOWER_ORDER[Math.floor(rnd() * TOWER_ORDER.length)], floors = 18 + Math.floor(rnd() * 40);
        towerWhole(towerGlPut(v), form, mid, Math.min(W, D) * 0.42, floors, 3.7 * P, { sides: 24, every: 2 });
        return;
      }
      if (roll < 0.5) {
        // a row of narrow houses: brick fronts, each its own color, a stoop, a cornice
        var P2 = FLOOR_PX, n = Math.max(2, Math.round(W / (6 * P2))), w = W / n, flip2 = s.back ? -1 : 1;
        var bricks = [[0.55, 0.3, 0.24], [0.64, 0.35, 0.27], [0.45, 0.26, 0.22], [0.78, 0.74, 0.66], [0.42, 0.4, 0.38]];
        for (var i = 0; i < n; i++) {
          var lx = s.x - W / 2 + w * (i + 0.5), front = 3 * P2, deep = 11 * P2, tall = (3 + (i % 2)) * 3.1 * P2;
          var c0 = L.lotWorld(lx, s.front - flip2 * (front + deep / 2), 0), col = gl3Mix(bricks[(i + Math.floor(rnd() * 3)) % bricks.length], L.sheetC, 0.08);
          worldBox(v, c0, ax.e, s.back ? ax.d : [-ax.d[0], -ax.d[1]], w / 2 - 2, deep / 2, -3, tall, col, 40);
          worldBox(v, c0, ax.e, s.back ? ax.d : [-ax.d[0], -ax.d[1]], w / 2 + 2, deep / 2 + 4, tall, tall + 0.4 * P2, gl3Mix([0.86, 0.84, 0.8], L.sheetC, 0.1), 10);
          // two tall windows a floor, framed in white stone, and a door up a stoop at the foot
          var win = gl3Mix([0.3, 0.36, 0.42], L.sheetC, 0.08), trim = gl3Mix([0.9, 0.88, 0.84], L.sheetC, 0.08), dd = s.back ? ax.d : [-ax.d[0], -ax.d[1]];
          var floorsUp = Math.round(tall / (3.1 * P2));
          for (var fl = 0; fl < floorsUp; fl++) {
            [-0.22, 0.22].forEach(function (k) {
              if (fl === 0 && k > 0) { return; }
              var wc = L.lotWorld(lx + k * w, s.front - flip2 * (front - 2), 0);
              worldBox(v, [wc[0], wc[1]], ax.e, dd, w * 0.13 + 3, 1.2, fl * 3.1 * P2 + 0.9 * P2 - 3, fl * 3.1 * P2 + 2.5 * P2 + 4, trim, 10, true);
              var gc = L.lotWorld(lx + k * w, s.front - flip2 * (front - 3.4), 0);
              worldBox(v, [gc[0], gc[1]], ax.e, dd, w * 0.13, 1.2, fl * 3.1 * P2 + 0.9 * P2, fl * 3.1 * P2 + 2.5 * P2, win, 77, true);
            });
          }
          var door = L.lotWorld(lx + 0.22 * w, s.front - flip2 * (front - 2), 0);
          worldBox(v, [door[0], door[1]], ax.e, dd, w * 0.1, 1.4, 0.6 * P2, 2.8 * P2, gl3Mix([0.24, 0.2, 0.18], L.sheetC, 0.08), 21, true);
          var stoop = L.lotWorld(lx + 0.22 * w, s.front - flip2 * (front - 0.7 * P2), 0);
          worldBox(v, [stoop[0], stoop[1]], ax.e, dd, w * 0.13, 0.7 * P2, -2, 0.6 * P2, trim, 10);
        }
        return;
      }
      return worldNeighborTowers.apply(this, arguments);
    };
  }

  // ---- your own: Start building's skyscraper ------------------------------------------------------
  // Its floors: the core in the middle of the back -- two stairs and two
  // lifts, the restrooms -- the same place on every floor; offices round it,
  // or homes, or offices below and homes over; a lobby and a cafe on the
  // ground floor, a sky lounge at the top.
  if (typeof BUILDING_TYPES === "object") {
    BUILDING_TYPES.tower = {
      icon: "tower", ceil: 3.3,
      plan: function (want) {
        var S = Math.max(3, Math.min(TOWER_MOST, want.storeys || 30)), use = want.towerUse || "offices", s = Math.max(1, Math.min(3, want.size || 2));
        var W = [18, 21.6, 26][s - 1], Df = [6.4, 7.6, 9][s - 1], floors = [];
        for (var k = 0; k < S; k++) {
          var core = typeCore(k, S - 1, true).concat([R("lift", 2.0)]);
          var ground = k === 0, top = k === S - 1, homes = !ground && !top && (use === "homes" || (use === "mixed" && k >= Math.ceil(S / 2)));
          var back, front, grow;
          if (ground) {
            back = [R("stock", 4.0)].concat(core, [R("restroom", 2.2), R("restroom", 2.2), R("staff", 3.0)]);
            front = [R("lobby", 8.0, { entry: true, label: TXT.sk_lobby }), R("cafe", W - 8.0)];
            grow = ["staff"];
          } else if (top) {
            back = [R("office", 4.0, { label: TXT.tr_office })].concat(core, [R("restroom", 2.2), R("restroom", 2.2), R("kitchenette", 3.0)]);
            front = [R("lobby", W, { label: TXT.sk_sky })];
            grow = ["kitchenette"];
          } else if (homes) {
            var id = "h" + k;
            back = [R("flat", 4.0, { id: id + "s", label: say("ty_flat_n", { n: (k + 1) + "A" }) })].concat(core, [R("landing", 2.4), R("flat", 4.0, { id: id + "t", label: say("ty_flat_n", { n: (k + 1) + "D" }) })]);
            var half = W / 2;
            front = [R("flat", half - 6.0, { id: id + "a", label: say("ty_flat_n", { n: (k + 1) + "B" }) }), R("flatbed", 3.8, { id: id + "ab", via: id + "a" }), R("flatbath", 2.2, { via: id + "ab" }),
                     R("flatbath", 2.2, { via: id + "bb" }), R("flatbed", 3.8, { id: id + "bb", via: id + "b" }), R("flat", half - 6.0, { id: id + "b", label: say("ty_flat_n", { n: (k + 1) + "C" }) })];
            grow = ["landing"];
          } else {
            back = [R("office", 4.0, { label: TXT.tr_office })].concat(core, [R("restroom", 2.2), R("restroom", 2.2), R("meeting", 3.4)]);
            front = [R("openoffice", W)];
            grow = ["meeting"];
          }
          // (only the last room in the back grows: the first the same on every floor, the core over the core under it)
          back[back.length - 1].w += Math.max(0, W - typeWidth(back));
          typeFill(front, W, ["openoffice", "cafe", "flat", "lobby"]);
          floors.push({ level: k, back: back, front: front, H: 1.8, Db: 6.0, Df: Df });
        }
        return { floors: floors, W: W, two: true, noGarage: true };
      },
      ask: function (ui) {
        if (!ui.want.storeys || ui.want.storeys < 3) { ui.want.storeys = 40; }
        ui.stepper("storeys", TXT.ty_storeys, "flats", 3, TOWER_MOST);
        ui.head(TXT.sk_use_head);
        ui.tiles();
        [["offices", "office"], ["homes", "flats"], ["mixed", "sk_mixed"]].forEach(function (u) {
          ui.tile(TXT["sk_" + u[0]], u[1], function () { return (ui.want.towerUse || "offices") === u[0]; }, function () { ui.want.towerUse = u[0]; }, true);
        });
        ui.head(TXT.sk_form_head);
        ui.tiles();
        TOWER_ORDER.forEach(function (f) {
          ui.tile(TXT["sk_" + f], "sk_" + f, function () { return (ui.want.towerForm || "spire") === f; }, function () { ui.want.towerForm = f; }, true);
        });
        typeSizes(ui);
      }
    };
    if (typeof TYPE_ORDER !== "undefined" && TYPE_ORDER.indexOf("tower") < 0) {
      var officeAt = TYPE_ORDER.indexOf("office");
      TYPE_ORDER.splice(officeAt >= 0 ? officeAt + 1 : TYPE_ORDER.length, 0, "tower");
    }
    if (typeof GROUNDS_OF === "object") { GROUNDS_OF.tower = "office"; }
  }

  // ---- in 3D: its skin ------------------------------------------------------------------------------
  // Round each floor, the form's outline at that height, as big as it must
  // be to hold the floor at the narrowest -- and so bigger lower down; a
  // slab at each floor out to the skin; the crown on the roof.
  function towerBuildings() {
    var marks = hand.nodes.filter(function (n) { return n.madeWith && n.madeWith.type === "tower"; });
    if (!marks.length) { return []; }
    var floors = floorsOf(), out = [];
    marks.forEach(function (m) {
      var mine = null;
      if (m.kind === "i_floor") { var f0 = floors.filter(function (f) { return f.n === m; })[0]; if (f0) { mine = f0.bldg; } }
      else { floors.some(function (f) { if (f.level === 0 && insideArea(m, f.n.x, f.n.y)) { mine = f.bldg; return true; } return false; }); }
      if (mine === null) { return; }
      out.push({ form: TOWER_FORMS[m.madeWith.towerForm] ? m.madeWith.towerForm : "spire", floors: floors.filter(function (f) { return f.bldg === mine && f.level >= 0; }) });
    });
    return out;
  }
  var towerKept = { key: null, faces: null };
  function towerFaces() {
    var list = towerBuildings();
    if (!list.length) { return []; }
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    var key = JSON.stringify(list.map(function (b) { return [b.form, b.floors.map(function (f) { return [f.n.id, f.z, f.dx, f.dy]; })]; })) + "|" +
              rooms.length + "|" + hand.nodes.length + "|" + (V3.upTo === undefined ? "" : V3.upTo) + "|" + (V3.mode || "") + "|" + (V3.myLevel || 0) + "|" + (V3.inRoom ? 1 : 0);
    if (towerKept.key === key) { return towerKept.faces; }
    var faces = [], P = FLOOR_PX;
    list.forEach(function (b) {
      var F = TOWER_FORMS[b.form], base = F.color, baseC = towerRgb(base), dark = towerHex(baseC.map(function (v, i) { return v * [0.55, 0.6, 0.66][i]; }));
      var sk = towerSkin(b, rooms);
      if (!sk) { return; }
      var plates = sk.plates, c = sk.c, S = sk.S, n = 40;
      // (walking inside, only the floor you are on and those either side: the rest of the skin is not seen from in there)
      var shown = function (p) {
        if (V3.mode === "walk") { return !V3.inRoom || Math.abs(p.f.level - (V3.myLevel || 0)) <= 1; }
        return V3.upTo === null || V3.upTo === undefined || p.f.level <= V3.upTo;
      };
      var put = function (pts, nn, col, pat) {
        faces.push({ pts: pts, n: nn, how: { piece: true, color: Array.isArray(col) ? towerHex(col) : col, edge: dark, pat: pat, tower: true } });
      };
      var lastShown = null;
      plates.forEach(function (p, i) {
        if (!shown(p)) { return; }
        var t0 = plates.length > 1 ? i / (plates.length - 1) : 0, t1 = plates.length > 1 ? Math.min(1, (i + 1) / (plates.length - 1)) : 0;
        var lo = towerOutline(b.form, c, S, t0, n), hi = lo, ledge = false;
        // (2026-10-03: "make sure ... the ceiling and walls properly get
        // aligned too rather than being jank" -- each floor stood straight
        // up, the next turned or narrowed on it, a step at every slab.  Now
        // the skin runs on from one floor's outline to the next, as the
        // towers it is after do; only a setback steps, its ledge roofed.)
        if (i + 1 < plates.length) {
          var nx = towerOutline(b.form, c, S, t1, n);
          if (towerFlows(b.form, lo, nx, c, S)) { hi = nx; } else { ledge = true; }
        }
        var zb = p.z0 - 0.3 * P, zt = p.z1 - 0.3 * P + (ledge ? 0.08 * P : 0), ways = [];
        if (i === 0) {
          // the ground floor's glass with a way in at each door out of the
          // lobby (2026-10-03: "there was no door on the outside of the
          // building") -- set into the skin, its sides and the soffit over
          // it closed back to the skin, the skin whole over the doors
          // (2026-10-03: "the skin stops short ... a gap that shows the
          // interior and grass")
          ways = towerEntries(b, sk, rooms);
          var fine = towerOutline(b.form, c, S, t0, 160);
          var fineHi = hi === lo ? fine : towerOutline(b.form, c, S, t1, 160);
          var zh = Math.min(zt, p.z0 + 3.75 * P), kh = (zh - zb) / Math.max(1, zt - zb), fineMid = towerMix(fine, fineHi, kh);
          towerBand(function (pts, nn, col, pat) {
            var mx = (pts[0][0] + pts[1][0]) / 2, my = (pts[0][1] + pts[1][1]) / 2;
            if (ways.some(function (w) { return (mx - c[0]) * w.d[0] + (my - c[1]) * w.d[1] > 0 && Math.abs((mx - w.pc[0]) * w.u[0] + (my - w.pc[1]) * w.u[1]) < w.hw; })) { return; }
            put(pts, nn, col, pat);
          }, fine, fineMid, zb, zh, base, F.pat, c);
          if (zt - zh > 0.5) { towerBand(put, fineMid, fineHi, zh, zt, base, F.pat, c); }
          ways.forEach(function (w) { towerRecess(faces, put, w, fine, c, p.z0, zb, zh, base, dark, F.pat); });
        } else {
          towerBand(put, lo, hi, zb, zt, base, F.pat, c);
        }
        if (ledge) {
          // a setback: the ledge it leaves, roofed (the floor over covers the rest)
          put(lo.map(function (q) { return [q[0], q[1], zt]; }), [0, 0, 1], dark, 10);
        }
        // the steel: a column at the skin every seven metres or so, slab to
        // slab, seen walking round inside between the rooms and the glass
        if (V3.mode === "walk") { towerColumns(faces, b, p, plates[i + 1], lo, hi, c, ways, rooms); }
        // the slab out to the skin, its edge a band of its own; its
        // underside clear over the ceilings of the floor below, never in
        // their plane (2026-10-03: "the ceilings seem to be a bit buggy" --
        // the two fought, half the corridor's ceiling gone dark in steps)
        // (the ground floor's just over the lawn -- it was under it, and the
        // grass showed inside -- and under the rooms' floors)
        put(lo.map(function (q) { return [q[0], q[1], i === 0 ? p.z0 - 0.4 : p.z0 - 0.06 * P]; }), [0, 0, 1], "#9da2a6", 10);
        put(lo.slice().reverse().map(function (q) { return [q[0], q[1], towerUnder(plates[i - 1], p, b, rooms)]; }), [0, 0, -1], "#e6e4df", 10);
        if (b.form === "forest") {
          // balconies stepping out and back, a tree on each now and then
          var out = towerOutline(b.form, c, S + (i % 2 ? 1.6 : 0.8) * P, t0, n);
          towerBand(put, out, out, p.z0 - 0.3 * P, p.z0 - 0.05 * P, "#d8d4cc", 10, c);
          put(out.map(function (q) { return [q[0], q[1], p.z0 - 0.05 * P]; }), [0, 0, 1], "#c9c4ba", 10);
          // and on the balconies, planters of shrubs and small trees, every other one
          for (var g = (i % 2) * 2; g < out.length; g += 5) {
            var gx = (out[g][0] + lo[g][0]) / 2, gy = (out[g][1] + lo[g][1]) / 2, bush = [];
            for (var bk = 0; bk < 8; bk++) { var ba = bk / 8 * Math.PI * 2; bush.push([gx + Math.cos(ba) * 0.55 * P, gy + Math.sin(ba) * 0.55 * P]); }
            v3Prism(faces, bush, p.z0, p.z0 + (g % 3 ? 1.0 : 1.9) * P, { piece: true, color: g % 2 ? "#4f7d3a" : "#5e8a40", edge: "#2e4a22", pat: 8 });
          }
        }
        lastShown = { p: p, lo: lo, t: t1 };
      });
      if (lastShown && lastShown.p === plates[plates.length - 1]) {
        var top = lastShown.p.z1 - 0.3 * P, r = 0;
        lastShown.lo.forEach(function (q) { r = Math.max(r, Math.hypot(q[0] - c[0], q[1] - c[1])); });
        towerCap(put, lastShown.lo, top, dark, 10);
        var crown = towerCrown(put, b.form, c, r, top, top, baseC, towerRgb(dark), [0.82, 0.84, 0.86]);
        if (crown === "garden") { towerGarden(faces, c, r, top); }
      }
    });
    // (each its own: the picture keeps its corners from one to the next, 38-view3d-gl.js)
    faces.forEach(function (f) { f.src = f; });
    towerKept = { key: key, faces: faces };
    return faces;
  }
  // Whether the skin runs on smoothly from one floor's outline to the next:
  // the forms that turn, swell or taper; any other where it hardly changes
  // (a setback steps).
  var TOWER_FLOWS = { twist: 1, diagrid: 1, taper: 1, chamfer: 1, slab: 1, forest: 1 };
  function towerFlows(form, a, b, c, S) {
    if (TOWER_FLOWS[form]) { return true; }
    for (var i = 0; i < a.length; i++) {
      if (Math.abs(Math.hypot(a[i][0] - c[0], a[i][1] - c[1]) - Math.hypot(b[i][0] - c[0], b[i][1] - c[1])) > 0.04 * S) { return false; }
    }
    return true;
  }
  function towerMix(a, b, k) {
    if (a === b) { return a; }
    return a.map(function (p, i) { return [p[0] + (b[i][0] - p[0]) * k, p[1] + (b[i][1] - p[1]) * k]; });
  }
  // A way in, set into the skin: the entrance's glass where the skin is
  // furthest in across it, a cheek each side back out to the skin, a
  // soffit over it to the skin, the entrance built there.
  function towerRecess(faces, put, w, fine, c, z0, zb, zh, base, dark, pat) {
    var P = FLOOR_PX, hw = w.hw;
    function du(q) { return [(q[0] - w.pc[0]) * w.d[0] + (q[1] - w.pc[1]) * w.d[1], (q[0] - w.pc[0]) * w.u[0] + (q[1] - w.pc[1]) * w.u[1]]; }
    function at(u, d) { return [w.pc[0] + w.u[0] * u + w.d[0] * d, w.pc[1] + w.u[1] * u + w.d[1] * d]; }
    function front(q) { return (q[0] - c[0]) * w.d[0] + (q[1] - c[1]) * w.d[1] > 0; }
    // how far in the skin goes across the way in
    var dIn = 0, seg = 0;
    fine.forEach(function (q, i) {
      var r = fine[(i + 1) % fine.length];
      seg = Math.max(seg, Math.hypot(r[0] - q[0], r[1] - q[1]));
    });
    fine.forEach(function (q) {
      var m = du(q);
      if (front(q) && Math.abs(m[1]) <= hw + seg) { dIn = Math.min(dIn, m[0]); }
    });
    dIn -= 0.15 * P;
    // where the skin is, straight out from that plane at `u`
    function skinAt(u) {
      var hit = towerMeetFine(fine, at(u, dIn - 0.5 * P), w.d);
      return hit ? du(hit)[0] : 0;
    }
    var half = Math.max(0.15 * P, seg / 2 + 0.05 * P), cheek = { piece: true, color: base, edge: dark, pat: pat, tower: true };
    [-1, 1].forEach(function (s) {
      var u0 = s * hw - half, u1 = s * hw + half, d0 = skinAt(u0) + 0.1 * P, d1 = skinAt(u1) + 0.1 * P;
      v3Prism(faces, [at(u0, dIn), at(u1, dIn), at(u1, Math.max(dIn + 1, d1)), at(u0, Math.max(dIn + 1, d0))], zb, zh, cheek);
    });
    // the soffit, from the skin back to the glass, a strip a segment of the skin at a time
    for (var i = 0; i < fine.length; i++) {
      var a = fine[i], b2 = fine[(i + 1) % fine.length];
      if (!front(a) || !front(b2)) { continue; }
      var ma = du(a), mb = du(b2);
      if (Math.max(Math.abs(ma[1]), Math.abs(mb[1])) > hw + half) { continue; }
      var pa = at(ma[1], dIn), pb = at(mb[1], dIn);
      put([[a[0], a[1], zh], [b2[0], b2[1], zh], [pb[0], pb[1], zh], [pa[0], pa[1], zh]], [0, 0, -1], dark, 10);
    }
    towerEntrance(faces, { d: w.d, u: w.u, pc: at(0, dIn), hw: hw }, z0, zh, base, dark, pat, -dIn / P);
  }
  // Where a line out from `from` the way `d` crosses an outline (its points round).
  function towerMeetFine(pts, from, d) {
    var best = null, bt = Infinity;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length], ex = b[0] - a[0], ey = b[1] - a[1];
      var den = d[0] * ey - d[1] * ex;
      if (Math.abs(den) < 1e-9) { continue; }
      var t = ((a[0] - from[0]) * ey - (a[1] - from[1]) * ex) / den, s = ((a[0] - from[0]) * d[1] - (a[1] - from[1]) * d[0]) / den;
      if (t > 0 && s >= 0 && s <= 1 && t < bt) { bt = t; best = [from[0] + d[0] * t, from[1] + d[1] * t]; }
    }
    return best;
  }
  // The columns round a floor, just in from its skin: steel cased in fire
  // board, from its slab to the underside of the one over it.
  function towerColumns(faces, b, p, over, lo, hi, c, ways, rooms) {
    var P = FLOOR_PX, per = 0;
    lo.forEach(function (q, i) { var r = lo[(i + 1) % lo.length]; per += Math.hypot(r[0] - q[0], r[1] - q[1]); });
    var count = Math.max(6, Math.round(per / (7.5 * P))), step = lo.length / count, half = 0.18 * P;
    var z0 = p.z0 - 0.06 * P, z1 = over ? towerUnder(p, over, b, rooms) : p.z1 - 0.3 * P;
    var mine = rooms.filter(function (r) { return floorAt(b.floors, r.x, r.y) === p.f; });
    var look = { piece: true, color: "#c7c9c6", edge: "#8e918d", pat: 10 };
    for (var k = 0; k < count; k++) {
      var j = Math.round(k * step) % lo.length, a = Math.atan2(lo[j][1] - c[1], lo[j][0] - c[0]);
      var r = Math.min(Math.hypot(lo[j][0] - c[0], lo[j][1] - c[1]), Math.hypot(hi[j][0] - c[0], hi[j][1] - c[1])) - 0.36 * P;
      var cx = c[0] + Math.cos(a) * r, cy = c[1] + Math.sin(a) * r;
      if (ways.some(function (w) { return (cx - c[0]) * w.d[0] + (cy - c[1]) * w.d[1] > 0 && Math.abs((cx - w.pc[0]) * w.u[0] + (cy - w.pc[1]) * w.u[1]) < w.hw + 1.2 * P; })) { continue; }
      if (mine.some(function (rm) { return insideArea(rm, cx - p.f.dx, cy - p.f.dy, half + 2); })) { continue; }
      var ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
      v3Prism(faces, [[cx - ux * half - vx * half, cy - uy * half - vy * half], [cx + ux * half - vx * half, cy + uy * half - vy * half],
                      [cx + ux * half + vx * half, cy + uy * half + vy * half], [cx - ux * half + vx * half, cy - uy * half + vy * half]], z0, z1, look);
    }
  }
  // How high a plate's underside: 0.3 m under its floor, or higher -- a
  // tenth of a metre over the highest ceiling of the floor below.
  function towerUnder(below, p, b, rooms) {
    var P = FLOOR_PX, z = p.z0 - 0.3 * P;
    if (!below) { return z; }
    var top = -Infinity;
    rooms.forEach(function (r) { if (floorAt(b.floors, r.x, r.y) === below.f) { top = Math.max(top, below.z0 + ceilOf(r) * P); } });
    return top > -Infinity ? Math.min(p.z0 - 0.1 * P, Math.max(z, top + 0.1 * P)) : z;
  }
  // ---- its size round its floors -----------------------------------------------------------------
  // Each floor's plate as the house stands, the middle of the lowest, and
  // how big round the outline must be to hold every floor (S).
  function towerSkin(b, rooms) {
    var P = FLOOR_PX, levels = b.floors.slice().sort(function (p, q) { return p.level - q.level; });
    var plates = levels.map(function (f, i) {
      var bb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      rooms.forEach(function (r) {
        if (floorAt(b.floors, r.x, r.y) !== f) { return; }
        var q = turned(r), x = r.x + f.dx, y = r.y + f.dy;
        bb.l = Math.min(bb.l, x - q.w / 2); bb.r = Math.max(bb.r, x + q.w / 2); bb.t = Math.min(bb.t, y - q.h / 2); bb.b = Math.max(bb.b, y + q.h / 2);
      });
      var next = levels[i + 1];
      return { f: f, bb: bb, z0: f.z, z1: next ? next.z : f.z + 3.6 * P };
    }).filter(function (p) { return p.bb.l < Infinity; });
    if (!plates.length) { return null; }
    var c = [(plates[0].bb.l + plates[0].bb.r) / 2, (plates[0].bb.t + plates[0].bb.b) / 2], S = 0;
    plates.forEach(function (p, i) {
      // (inside its own outline, and the next floor's: the skin runs on from one to the other)
      var ts = [plates.length > 1 ? i / (plates.length - 1) : 0];
      if (TOWER_FLOWS[b.form] && i + 1 < plates.length) { ts.push((i + 1) / (plates.length - 1)); }
      ts.forEach(function (t) {
        var turn = towerTurn(b.form, t), pw = towerP(b.form, t);
        [[p.bb.l, p.bb.t], [p.bb.r, p.bb.t], [p.bb.r, p.bb.b], [p.bb.l, p.bb.b]].forEach(function (q) {
          var dx = q[0] - c[0], dy = q[1] - c[1], a = Math.atan2(dy, dx), need = Math.hypot(dx, dy) / (towerR(b.form, a - turn, t) * pw);
          S = Math.max(S, need);
        });
      });
    });
    S = S * 1.04 + 0.5 * P;
    return { plates: plates, c: c, S: S, form: b.form };
  }
  // How far out the skin is at its foot, every way round: its box.
  function towerFoot(sk) {
    var pts = towerOutline(sk.form, sk.c, sk.S, 0, 72), bx = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    pts.forEach(function (q) { bx.l = Math.min(bx.l, q[0]); bx.r = Math.max(bx.r, q[0]); bx.t = Math.min(bx.t, q[1]); bx.b = Math.max(bx.b, q[1]); });
    return bx;
  }

  // ---- the ways in ------------------------------------------------------------------------------------
  // Each door out of the ground floor to the open air -- the lobby's to the
  // street -- the way it faces from the middle; or, with none, the street's
  // side.  `pc` where the skin is that way, `u` along it, `d` out.
  function towerEntries(b, sk, rooms) {
    var P = FLOOR_PX, f0 = sk.plates[0].f, out = [];
    var mine = rooms.filter(function (r) { return floorAt(b.floors, r.x, r.y) === f0; });
    function inRoom(x, y) { return mine.some(function (r) { return insideArea(r, x - f0.dx, y - f0.dy); }); }
    hand.nodes.forEach(function (n) {
      if (!WALK_DOORS[n.kind] || n.kind === "i_garagedoor" || floorAt(b.floors, n.x, n.y) !== f0) { return; }
      var x = n.x + f0.dx, y = n.y + f0.dy, t = (n.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t);
      var aIn = inRoom(x + ux * 0.8 * P, y + uy * 0.8 * P), bIn = inRoom(x - ux * 0.8 * P, y - uy * 0.8 * P);
      if (aIn === bIn) { return; }
      var ox = aIn ? -ux : ux, oy = aIn ? -uy : uy;
      // straight out from the door, where that meets the skin: the way in
      // faces the way the door does, the street's way
      var pc = towerMeet(sk, [x, y], [ox, oy]);
      if (!pc || out.some(function (w) { return Math.hypot(w.pc[0] - pc[0], w.pc[1] - pc[1]) < 9 * P; })) { return; }
      out.push({ d: [ox, oy], pc: pc });
    });
    if (!out.length) {
      var lot = hand.nodes.filter(function (n) { return n.kind === "i_lot" && insideArea(n, sk.c[0], sk.c[1]); })[0];
      var lt = lot ? (lot.turn || 0) * Math.PI / 180 : 0, dd = [-Math.sin(lt), Math.cos(lt)], pc0 = towerMeet(sk, sk.c, dd);
      if (pc0) { out.push({ d: dd, pc: pc0 }); }
    }
    return out.slice(0, 3).map(function (w) { return { d: w.d, u: [-w.d[1], w.d[0]], pc: w.pc, hw: 3.4 * P }; });
  }
  // Where a line out from `from` the way `d` crosses the skin at its foot.
  function towerMeet(sk, from, d) {
    var P = FLOOR_PX, t0 = towerTurn(sk.form, 0), pw = towerP(sk.form, 0);
    function outside(s) {
      var x = from[0] + d[0] * s - sk.c[0], y = from[1] + d[1] * s - sk.c[1], a = Math.atan2(y, x);
      return Math.hypot(x, y) > towerR(sk.form, a - t0, 0) * pw * sk.S;
    }
    var lo = 0, hi = 0;
    for (var s = 0; s < 400 * P; s += 0.5 * P) { if (outside(s)) { hi = s; break; } lo = s; }
    if (!hi) { return null; }
    for (var k = 0; k < 20; k++) { var mid = (lo + hi) / 2; if (outside(mid)) { hi = mid; } else { lo = mid; } }
    return [from[0] + d[0] * hi, from[1] + d[1] * hi];
  }
  // What the towers stand on, for what is planted round them to keep off:
  // [x, y, how far out] (40-plants.js, 40-edit3d.js).
  function towerTaken() {
    var out = [];
    try {
      var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
      towerBuildings().forEach(function (b) {
        var sk = towerSkin(b, rooms);
        if (!sk) { return; }
        var f = towerFoot(sk), r = Math.max(f.r - f.l, f.b - f.t) / 2;
        out.push([(f.l + f.r) / 2, (f.t + f.b) / 2, r + 1.5 * FLOOR_PX]);
      });
    } catch (e) { /* none */ }
    return out;
  }
  // An entrance: a revolving door in the middle, a glass door either side
  // of it for whoever cannot use one, glass over and round them, a steel
  // frame, a canopy out over the way in and a stone apron under it.
  function towerEntrance(faces, w, z0, zTop, base, dark, pat, back) {
    back = back || 0;               // how far in from the skin it is set (metres)
    var P = FLOOR_PX, hw = w.hw / P;
    function at(u, d) { return [w.pc[0] + w.u[0] * u * P + w.d[0] * d * P, w.pc[1] + w.u[1] * u * P + w.d[1] * d * P]; }
    function block(u0, u1, d0, d1, za, zb, look) { v3Prism(faces, [at(u0, d0), at(u1, d0), at(u1, d1), at(u0, d1)], z0 + za * P, z0 + zb * P, look); }
    var steel = { piece: true, color: "#8f969b", edge: "#4a4f55" };
    var glass = { glass: true, edge: "#7f9bb0", bare: true }, skin = { piece: true, color: base, edge: dark, pat: pat, tower: true };
    var head = 3.3, top = (zTop - z0) / P;
    // its frame, the tower's own dark steel (2026-10-03: stone jambs read as
    // "a dark brick column ... in front of the revolving door")
    var frame = { piece: true, color: dark, edge: dark, pat: 22 };
    block(-hw - 0.12, -hw + 0.1, -0.3, 0.3, 0, top, frame);
    block(hw - 0.1, hw + 0.12, -0.3, 0.3, 0, top, frame);
    if (top > head + 0.1) { block(-hw, hw, -0.25, 0.25, head, top, skin); }      // the floor's glass over it
    block(-hw, hw, -0.3, 0.3, head - 0.18, head, steel);                       // its head
    // the revolving door: a drum of glass, its four wings, its crown
    var rr = 1.15, ring = [], crown = [];
    for (var k = 0; k < 20; k++) {
      var q = k / 20 * Math.PI * 2, cu = Math.cos(q) * rr, cd = Math.sin(q) * rr;
      ring.push(at(cu, cd)); crown.push(at(Math.cos(q) * (rr + 0.1), Math.sin(q) * (rr + 0.1)));
    }
    v3Prism(faces, ring, z0 + 0.02 * P, z0 + 2.45 * P, glass);
    v3Prism(faces, crown, z0 + 2.45 * P, z0 + 2.75 * P, steel);
    v3Prism(faces, crown, z0 - 0.01 * P, z0 + 0.03 * P, steel);
    [0.785, 2.356].forEach(function (q) {                                       // the wings, crossed
      var cu = Math.cos(q), cd = Math.sin(q), t = 0.025, L = rr - 0.06;
      v3Prism(faces, [at(-cu * L - cd * t, -cd * L + cu * t), at(cu * L - cd * t, cd * L + cu * t), at(cu * L + cd * t, cd * L - cu * t), at(-cu * L + cd * t, -cd * L - cu * t)],
              z0 + 0.05 * P, z0 + 2.4 * P, glass);
      v3Prism(faces, [at(-cu * L - cd * 0.04, -cd * L + cu * 0.04), at(cu * L - cd * 0.04, cd * L + cu * 0.04), at(cu * L + cd * 0.04, cd * L - cu * 0.04), at(-cu * L + cd * 0.04, -cd * L - cu * 0.04)],
              z0 + 2.3 * P, z0 + 2.4 * P, steel);
    });
    block(-0.06, 0.06, -0.06, 0.06, 0, 2.45, steel);                            // its post
    // a glass door each side, framed in steel, a push bar across
    [-1, 1].forEach(function (s) {
      var a0 = s * 1.55, a1 = s * 2.55, lo = Math.min(a0, a1), hi = Math.max(a0, a1);
      block(lo, hi, -0.03, 0.03, 0.05, 2.4, glass);
      block(lo, lo + 0.07, -0.04, 0.04, 0, 2.45, steel);
      block(hi - 0.07, hi, -0.04, 0.04, 0, 2.45, steel);
      block(lo, hi, -0.04, 0.04, 2.38, 2.45, steel);
      block(lo + 0.1, hi - 0.1, 0.04, 0.08, 1.0, 1.06, steel);
      // fixed glass between: by the drum, and out to the jambs
      var g0 = s * 1.25, g1 = s * 1.55, f0 = s * 2.55, f1 = s * hw;
      block(Math.min(g0, g1), Math.max(g0, g1), -0.02, 0.02, 0, head - 0.18, glass);
      block(Math.min(f0, f1), Math.max(f0, f1), -0.02, 0.02, 0, head - 0.18, glass);
      block(lo, hi, -0.02, 0.02, 2.45, head - 0.18, glass);                    // a light over the door
    });
    block(-1.25, 1.25, -0.02, 0.02, 2.75, head - 0.18, glass);                  // and over the drum
    // the canopy out over the way in, and the apron under it
    block(-hw - 0.6, hw + 0.6, 0.3, 3.2 + back, head + 0.12, head + 0.36, steel);
    block(-hw - 0.6, hw + 0.6, 3.1 + back, 3.2 + back, head - 0.05, head + 0.36, { piece: true, color: "#5d6166", edge: "#33373b" });
    block(-hw - 1.2, hw + 1.2, -1.2, 4.6 + back, -0.05, 0.03, { piece: true, color: "#cfcac0", edge: "#9a958c", pat: 10 });
  }
  // ---- its lot -------------------------------------------------------------------------------------
  // The lot was drawn round the ground floor's rooms; the skin stands out
  // past them all round, over the street at its foot (2026-10-03).  The
  // lot grown so the skin keeps the setbacks a house would -- before the
  // yard, the street and the rest are put round it (first of the wraps).
  if (typeof STARTER_WRAPS === "object") {
    STARTER_WRAPS.unshift(function* (inner, want) {
      var out = yield* inner(want);
      if (want.type !== "tower") { return out; }
      try {
        var made = (starterLast || []).map(function (o) { return o.room; }), floors = floorsOf(), P = FLOOR_PX;
        var f0 = made.length ? floorAt(floors, made[0].x, made[0].y) : null;
        if (!f0) { return out; }
        var b = { form: TOWER_FORMS[want.towerForm] ? want.towerForm : "spire", floors: floors.filter(function (f) { return f.bldg === f0.bldg && f.level >= 0; }) };
        var sk = towerSkin(b, hand.nodes.filter(function (n) { return n.kind === "i_room"; }));
        var lot = sk && hand.nodes.filter(function (n) { return n.kind === "i_lot" && !(n.turn || 0) && insideArea(n, sk.c[0], sk.c[1]); })[0];
        if (!lot) { return out; }
        var foot = towerFoot(sk), sb = typeof lotSetbacks === "function" ? lotSetbacks(null) : { front: 6, back: 6, side: 3 };
        var l = Math.min(lot.x - lot.w / 2, foot.l - (sb.side + 1.5) * P), r = Math.max(lot.x + lot.w / 2, foot.r + (sb.side + 1.5) * P);
        var t = Math.min(lot.y - lot.h / 2, foot.t - (sb.back + 6) * P), bt = Math.max(lot.y + lot.h / 2, foot.b + (sb.front + 0.5) * P);
        lot.w = Math.round(r - l); lot.h = Math.round(bt - t); lot.x = Math.round((l + r) / 2); lot.y = Math.round((t + bt) / 2);
        lot.own = true;
      } catch (e) { /* the lot as drawn */ }
      return out;
    });
  }
  function towerGarden(faces, c, r, top) {
    // a roof garden: a few trees in planters (their leaves as the yard's are)
    var P = FLOOR_PX;
    for (var i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2, x = c[0] + Math.cos(a) * r * 0.55, y = c[1] + Math.sin(a) * r * 0.55;
      v3Prism(faces, [[x - 0.6 * P, y - 0.6 * P], [x + 0.6 * P, y - 0.6 * P], [x + 0.6 * P, y + 0.6 * P], [x - 0.6 * P, y + 0.6 * P]], top, top + 0.6 * P, { piece: true, color: "#8a8780", edge: "#5a5852" });
      v3Prism(faces, [[x - 0.08 * P, y - 0.08 * P], [x + 0.08 * P, y - 0.08 * P], [x + 0.08 * P, y + 0.08 * P], [x - 0.08 * P, y + 0.08 * P]], top + 0.6 * P, top + 2.4 * P, { piece: true, color: "#6b4a32", edge: "#3e2a1c", pat: 11 });
      var leaf = { piece: true, color: "#4f7d3a", edge: "#2e4a22", pat: 8 };
      v3Prism(faces, (function () { var g = []; for (var k = 0; k < 10; k++) { var b = k / 10 * Math.PI * 2; g.push([x + Math.cos(b) * 1.1 * P, y + Math.sin(b) * 1.1 * P]); } return g; })(), top + 2.0 * P, top + 3.4 * P, leaf);
    }
  }
  if (typeof v3Build === "function") {
    var v3BuildTowers = v3Build;
    v3Build = function () {
      var model = v3BuildTowers.apply(this, arguments);
      try {
        if (model && V3 && V3.scene !== "space" && !(V3.flat && V3.flatDone)) {
          var add = towerFaces();
          if (add.length) { Array.prototype.push.apply(model.faces, add); }
        }
      } catch (e) { if (window.console && console.warn) { console.warn("tower:", e && e.message); } }
      return model;
    };
  }

  // ---- its pictures, for the tiles ---------------------------------------------------------------------
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      tower: '<path d="M7 17.6V5.4l3-2.8 3 2.8v12.2M5 17.6h10M10 2.6V1M8.6 7.6h2.8M8.6 10.4h2.8M8.6 13.2h2.8"/>',
      sk_mixed: '<path d="M4 17.4V6h7v11.4M11 9.4h5v8M2.6 17.4h14.8M6 8.4h3M6 11h3M13 11.6h1.4M13 14.2h1.4M6 14h3"/>',
      sk_spire: '<path d="M10 1.4v3M8.6 17.6V8.8L10 4.4l1.4 4.4v8.8M6.4 17.6v-5l2.2-2M13.6 17.6v-6.6l-2.2-2.2M4.6 17.6h10.8"/>',
      sk_twist: '<path d="M6.4 17.6c0-5 2.6-8 2.2-15M13.6 17.6c0-5-2.6-8-2.2-15M8.6 2.6h2.8M6.4 17.6h7.2M6.9 12.4c2-1 4.4-1 6.2.4M7.8 7.6c1.6-.8 3-.8 4.4.2"/>',
      sk_pagoda: '<path d="M10 1.2v2M8.2 3.2h3.6l-.6 2.4h1.6l-.6 2.6h1.6l-.6 2.6h1.6l-.6 2.6h1.6L14 17.6H6l.4-3.4h1.6l-.6-2.6h1.6l-.6-2.6h1.6l-.6-2.6h1.6z"/>',
      sk_deco: '<path d="M10 1.2v3.2M8.4 6.4 10 4.4l1.6 2M7.4 17.6V9.2l1-1.4V6.4h3.2v1.4l1 1.4v8.4M5 17.6v-5.4h2.4M15 17.6v-5.4h-2.4M3.4 17.6h13.2"/>',
      sk_diagrid: '<path d="M6.4 17.6C4.8 12 5.4 6 10 2.4c4.6 3.6 5.2 9.6 3.6 15.2z"/><path d="M7 12.6 12.8 6.8M6 9.6l7.2 7.2M7.6 6.8l5.8 5.8M5.8 15.4l4.6-4.6"/>',
      sk_star: '<path d="M10 1.4v2.6M8.4 17.6V7.6l1.6-3.4 1.6 3.4v10"/><path d="M5 17.6V10l1.4-1.4V17.6M15 17.6V10l-1.4-1.4V17.6M3.4 17.6h13.2"/>',
      sk_chamfer: '<path d="M10 1v3M6 17.6l1-9.6L10 4l3 4 1 9.6zM7 8h6M6 17.6h8M10 4v13.6"/>',
      sk_taper: '<path d="M10 2.4c-1.6 0-2.2.8-2.4 2.4L6.2 17.6h7.6L12.4 4.8c-.2-1.6-.8-2.4-2.4-2.4zM9 1.6h2"/><path d="M8.2 9.4h3.6M7.6 13.6h4.8"/>',
      sk_forest: '<path d="M6 17.6V4.4h8v13.2M4.4 17.6h11.2"/><circle cx="5.2" cy="7.2" r="1.2"/><circle cx="14.8" cy="10.2" r="1.2"/><circle cx="5.2" cy="13.2" r="1.2"/><path d="M6 8.4h8M6 11.4h8M6 14.4h8"/>',
      sk_slab: '<path d="M5.4 17.6V3h9.2v14.6M3.4 17.6h13.2M8.4 3v14.6M11.6 3v14.6M5.4 7h9.2M5.4 11h9.2M5.4 15h9.2"/>'
    });
  }
