// ---------------------------------------------------------------------------
//  40-civic.js -- styles for buildings that are not houses, as they are
//  really built: an office in the International Style or raw concrete, a
//  Main Street shop under its cornice and awnings, a Paris café, a
//  Collegiate Gothic school or a red schoolhouse with its bell, a block of
//  brownstones or of Haussmann's Paris -- and a better way to pick a style:
//  what suits the building first, the rest by where they are from, found
//  by name
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "a better style picker", and "each building
  // type its own researched architectural style, not the house styles")
  //
  // Each style as the house styles are (39-styles.js) -- its roof's shape
  // and pitch, its walls and roof and their colors, its trim -- and, new
  // here: `cornice`, a band standing out round the top of the walls (the
  // crown of a commercial block, a brownstone's, a Haussmann façade's);
  // `awning`, canvas over the ground floor's windows and doors (a shop's,
  // a café's); `cupola`, a little bell house on the ridge (a schoolhouse's,
  // a college's).  The glass of a curtain wall is a material of its own
  // (`curtain`, the towers' glass, 38-view3d-gl.js pattern 78).
  if (typeof HOUSE_MATS === "object" && HOUSE_MATS.out && !HOUSE_MATS.out.curtain) { HOUSE_MATS.out.curtain = [78, "#4e6b7d"]; }
  if (typeof HOUSE_TINTS === "object" && !HOUSE_TINTS.curtain) { HOUSE_TINTS.curtain = ["#4e6b7d", "#5f6f62", "#3a4450", "#7d8c96"]; }
  var CIVIC_STYLES = {
    // Mies's Seagram Building and its kind, 1920s-70s: a box of glass in thin dark mullions
    international: { at: "civic", shape: "flat", pitch: 0, eave: 0.1, out: ["curtain", "#4e6b7d"], roof: ["metal", "#8f969b"], trim: "#2a2c2e", parapet: 0.25 },
    // Boston City Hall, the Barbican: raw concrete, a deep crown
    brutalist: { at: "civic", shape: "flat", pitch: 0, eave: 0.1, out: ["concrete", "#9c9a94"], roof: ["metal", "#7d7f80"], trim: "#3a3d40", parapet: 0.9, cornice: "#8c8a84" },
    // Miami Beach and New York, 1925-40: smooth stucco, a contrasting crown, bright trim
    artdeco: { at: "civic", shape: "flat", pitch: 0, eave: 0.1, out: ["stucco", "#efe3cc"], roof: ["metal", "#c9c4ba"], trim: "#2f6f7a", parapet: 0.7, cornice: "#d9b26a" },
    // the two-part commercial block of an American Main Street, 1870-1930: brick, a pressed cornice, shop windows under awnings
    storefront: { at: "civic", shape: "flat", pitch: 0, eave: 0.1, out: ["brick", "#9a4e3a"], roof: ["metal", "#6f6a62"], trim: "#efe7d6", parapet: 0.8, cornice: "#efe7d6", awning: "#2f5d4a" },
    // Haussmann's Paris, 1853-70: cream limestone, a zinc mansard, a stone cornice, black ironwork
    haussmann: { at: "civic", shape: "mansard", pitch: 70, eave: 0.1, out: ["stone", "#e6dccb"], roof: ["metal", "#6f7880"], trim: "#2a2c2e", cornice: "#efe7d6" },
    // the New York rowhouse, 1850-1900: brown sandstone, an Italianate cornice
    brownstone: { at: "civic", shape: "flat", pitch: 0, eave: 0.1, out: ["stone", "#7a5240"], roof: ["metal", "#4f4a45"], trim: "#2a2622", parapet: 0.35, cornice: "#3f2f26" },
    // a Paris café: stone, a slate mansard, its awnings out over the pavement
    bistro: { at: "civic", shape: "mansard", pitch: 70, eave: 0.1, out: ["stone", "#e2d8c4"], roof: ["slate", "#5d6670"], trim: "#7a1f24", cornice: "#efe7d6", awning: "#7a1f24" },
    // a 1950s Los Angeles diner: a roof swept up, white walls, red trim
    googie: { at: "civic", shape: "butterfly", pitch: 10, eave: 1.2, out: ["stucco", "#f4f1ea"], roof: ["metal", "#c9ced3"], trim: "#c8312c", awning: "#c8312c" },
    // Princeton and the high schools after it, 1900-30: red brick, stone trim, steep slate gables, a cupola
    collegiate: { at: "civic", shape: "gable", pitch: 45, eave: 0.25, out: ["brick", "#8c4a3a"], roof: ["slate", "#4a4f57"], trim: "#d6cdbd", chimney: "brick", cupola: "#d6cdbd" },
    // the one-room schoolhouse of the 1800s: red boards, white trim, its bell on the ridge
    schoolhouse: { at: "civic", shape: "gable", pitch: 38, eave: 0.35, out: ["boards", "#9c2b23"], roof: ["shingles", "#4a4d50"], trim: "#ffffff", cupola: "#ffffff", porch: true },
    // the schools and offices of the 1950s-60s: buff brick, a flat roof hanging well out
    modernist: { at: "civic", shape: "slab", pitch: 3, eave: 1.0, out: ["brick", "#c9b9a6"], roof: ["metal", "#5d6166"], trim: "#2a2c2e" },
    // Lloyd's of London, the Pompidou Centre, 1970s-80s: metal skin, the frame in a bright color
    hightech: { at: "civic", shape: "flat", pitch: 0, eave: 0.1, out: ["cladding", "#c9cdd0"], roof: ["metal", "#9aa0a4"], trim: "#3f6fa8", parapet: 0.3, cornice: "#3f6fa8" },
    // the prefabricated blocks of 1960s Eastern Europe: concrete panels, plain
    panelblock: { at: "civic", shape: "flat", pitch: 0, eave: 0.1, out: ["concrete", "#c4c1ba"], roof: ["metal", "#7d7f80"], trim: "#5d6166", parapet: 0.3 },
    // round the Mediterranean: white stucco, terracotta, painted shutters
    mediterranean: { at: "civic", shape: "hip", pitch: 22, eave: 0.45, out: ["stucco", "#efe7d6"], roof: ["tiles", "#b5603f"], trim: "#2f6a8a", shutters: "#2f6a8a" },
    // Scandinavian modern: black-stained boards, a steep plain gable, white frames
    scandi: { at: "civic", shape: "gable", pitch: 42, eave: 0.1, out: ["boards", "#2a2c2e"], roof: ["metal", "#2a2c2e"], trim: "#ffffff" }
  };
  if (typeof HOUSE_STYLES === "object") {
    Object.keys(CIVIC_STYLES).forEach(function (k) { if (!HOUSE_STYLES[k]) { HOUSE_STYLES[k] = CIVIC_STYLES[k]; } });
  }
  if (typeof STYLE_REGIONS === "object" && STYLE_REGIONS.indexOf("civic") < 0) { STYLE_REGIONS.push("civic"); }

  // What suits each kind of building, best first -- the styles it is
  // really built in (houses: the American and European house styles most
  // built; the rest from CIVIC_STYLES and the house styles that fit).
  var CIVIC_FOR = {
    house: ["craftsman", "colonial", "ranch", "farmhouse", "capecod", "victorian", "tudor", "mission", "tuscan", "midcentury", "modern", "contemporary"],
    cabin: ["logcabin", "aframe", "chalet", "nordic", "scandi", "izba"],
    townhouses: ["brownstone", "georgian", "victorian", "haussmann", "dutch", "storefront"],
    duplex: ["craftsman", "colonial", "farmhouse", "ranch", "modern", "contemporary"],
    apartments: ["brownstone", "haussmann", "artdeco", "mediterranean", "panelblock", "brutalist", "modern"],
    condos: ["international", "artdeco", "contemporary", "mediterranean", "haussmann", "modern"],
    shop: ["storefront", "artdeco", "modernist", "googie", "mission", "modern"],
    boutique: ["storefront", "haussmann", "artdeco", "scandi", "french", "modern"],
    cafe: ["bistro", "storefront", "googie", "scandi", "cycladic", "provencal"],
    office: ["international", "brutalist", "hightech", "artdeco", "modernist", "contemporary"],
    school: ["collegiate", "schoolhouse", "modernist", "brutalist", "georgian", "contemporary"]
  };
  // The kind of the building made last (what Start building marked it, 40-hood.js).
  function civicTypeNow() {
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, b) { return b.id - a.id; });
    return (marks.length && marks[0].madeWith.type) || "house";
  }
  // Any of those, the seed's own: Shuffle another.
  function civicAny(type, seed) {
    var list = (CIVIC_FOR[type] || CIVIC_FOR.house).filter(function (k) { return HOUSE_STYLES[k]; });
    if (!list.length) { return ""; }
    var h = ((seed >>> 0) ^ 0x9e3779b9) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
    return list[h % list.length];
  }
  // Made: "any" (or, for a building not a house, nothing picked) the seed's own style.
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var w = want;
      if (want.style === "any" || (want.style === undefined && want.type && want.type !== "house" && CIVIC_FOR[want.type])) {
        // (the seed fixed here, so the style and the house come from one)
        if (want.seed === undefined) { w = Object.assign({}, want, { seed: Math.floor(Math.random() * 4294967295) }); }
      }
      var out = yield* inner(w);
      try {
        if (w !== want || want.style === "any" || (want.style === undefined && want.type && want.type !== "house" && CIVIC_FOR[want.type])) {
          var key = civicAny(want.type || "house", w.seed >>> 0);
          if (key && typeof styleApplyQuiet === "function") { styleApplyQuiet(key); }
        }
      } catch (e) { /* as made */ }
      return out;
    });
  }

  // ---- what goes with them, in 3D ----------------------------------------------------------------
  if (typeof styleExtras === "function") {
    var civicExtrasWas = styleExtras;
    styleExtras = function (model) {
      civicExtrasWas.apply(this, arguments);
      var S = styleNow();
      if (!S || !V3 || V3.scene === "space" || (V3.flat && V3.flatDone) || V3.low) { return; }
      var inside = V3.mode === "walk", indoors = inside && !!V3.inRoom;
      var whole = inside ? true : (V3.upTo === null || V3.upTo === undefined);
      if (!whole) { return; }
      try { if (S.awning) { civicAwnings(model, S); } } catch (e) { /* without */ }
      try { if (S.cupola && typeof roofKept === "object" && roofKept.out) { civicCupola(model, S); } } catch (e2) { /* without */ }
    };
  }
  // Canvas over each window and door on the ground floor, sloping out and
  // down from just over its head, a valance along its front.
  function civicAwnings(model, S) {
    var floors = typeof floorsOf === "function" ? floorsOf() : [], px = FLOOR_PX;
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    function inRoom(x, y) { return rooms.some(function (r) { return insideArea(r, x, y); }); }
    var col = S.awning, look = { piece: true, color: col, edge: v3Mix(col, "#000000", 0.35), pat: 21 };
    var stripe = { piece: true, color: v3Mix(col, "#ffffff", 0.75), edge: v3Mix(col, "#000000", 0.3) };
    hand.nodes.forEach(function (w) {
      if (w.kind !== "i_window" && !(WALK_DOORS[w.kind] && w.kind !== "i_garagedoor")) { return; }
      var f = floors.length ? floorAt(floors, w.x, w.y) : null;
      if (f && f.level !== 0) { return; }
      var t = (w.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t), probe = 0.7 * px;
      var aIn = inRoom(w.x + ux * probe, w.y + uy * probe), bIn = inRoom(w.x - ux * probe, w.y - uy * probe);
      if (aIn === bIn) { return; }
      var sx = aIn ? -ux : ux, sy = aIn ? -uy : uy;               // out
      var room = rooms.filter(function (r) { return insideArea(r, w.x - sx * probe, w.y - sy * probe); })[0];
      if (!room) { return; }
      var q = turned(room), across = Math.abs(sx) > 0.5;
      var face = across ? room.x + Math.sign(sx) * q.w / 2 : room.y + Math.sign(sy) * q.h / 2;
      var dx = f ? f.dx : 0, dy = f ? f.dy : 0, dz = f ? f.z : 0;
      var head = openHead(w) + 0.15 * px;
      head = Math.min(head, ceilOf(room) * px - 0.05 * px);
      var half = w.w / 2 + 0.12 * px, out = 0.95 * px, drop = 0.42 * px, val = 0.18 * px;
      // the corners: at the wall (high) and out (low), either side
      function P(along, off, z) {
        return across ? [face + sx * off + dx, w.y + along + dy, dz + z] : [w.x + along + dx, face + sy * off + dy, dz + z];
      }
      var a0 = P(-half, 0.03 * px, head), a1 = P(half, 0.03 * px, head), b1 = P(half, out, head - drop), b0 = P(-half, out, head - drop);
      var nz = out / Math.hypot(out, drop), nh = drop / Math.hypot(out, drop);
      model.faces.push({ pts: [a0, a1, b1, b0], n: [sx * nh, sy * nh, nz], how: look });
      model.faces.push({ pts: [b0, b1, a1, a0], n: [-sx * nh, -sy * nh, -nz], how: look });
      // the valance hanging from its front edge
      var c0 = P(-half, out, head - drop - val), c1 = P(half, out, head - drop - val);
      model.faces.push({ pts: [b0, b1, c1, c0], n: [sx, sy, 0], how: stripe });
      model.faces.push({ pts: [c0, c1, b1, b0], n: [-sx, -sy, 0], how: stripe });
      // its sides
      [[-half, -1], [half, 1]].forEach(function (s2) {
        var top = P(s2[0], 0.03 * px, head), low = P(s2[0], out, head - drop), bot = P(s2[0], out, head - drop - val);
        var n2 = across ? [0, s2[1], 0] : [s2[1], 0, 0];
        model.faces.push({ pts: [top, low, bot], n: n2, how: look });
      });
    });
  }
  // A bell house on the ridge of the biggest roof: a little square tower,
  // open-sided, under a pyramid roof, with a finial.
  function civicCupola(model, S) {
    var px = FLOOR_PX, best = null;
    roofKept.out.forEach(function (R) { if (!R.turn && (!best || (R.x1 - R.x0) * (R.y1 - R.y0) > (best.x1 - best.x0) * (best.y1 - best.y0))) { best = R; } });
    if (!best || typeof styleFrame !== "function") { return; }
    var F = styleFrame(best), P = F.P, half = (F.v1 - F.v0) / 2;
    var ridge = best.z + half * (best.k || stylePitch());
    var u = (F.u0 + F.u1) / 2, v = (F.v0 + F.v1) / 2, a = 0.7 * px;
    var col = S.cupola, look = { piece: true, color: col, edge: v3Mix(col, "#000000", 0.35) };
    var roofC = (S.roof && S.roof[1]) || "#4a4d50", rlook = { piece: true, color: roofC, edge: v3Mix(roofC, "#000000", 0.35), pat: 45 };
    function sq(r) { return [P(u - r, v - r, 0), P(u + r, v - r, 0), P(u + r, v + r, 0), P(u - r, v + r, 0)].map(function (p) { return [p[0], p[1]]; }); }
    var f0 = model.faces.length, z0 = ridge - 0.5 * px, z1 = ridge + 0.6 * px, z2 = z1 + 1.0 * px, z3 = z2 + 0.12 * px;
    v3Prism(model.faces, sq(a), z0, z1, look);                              // its base, out of the roof
    // four posts, open between, the bell's place
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
      var cx = u + c[0] * (a - 0.1 * px), cy = v + c[1] * (a - 0.1 * px), r = 0.08 * px;
      v3Prism(model.faces, [P(cx - r, cy - r, 0), P(cx + r, cy - r, 0), P(cx + r, cy + r, 0), P(cx - r, cy + r, 0)].map(function (p) { return [p[0], p[1]]; }), z1, z2, look);
    });
    v3Prism(model.faces, sq(0.18 * px), z1, z1 + 0.5 * px, { piece: true, color: "#8a7a4a", edge: "#4a3a1a" });   // the bell
    v3Prism(model.faces, sq(a + 0.08 * px), z2, z3, look);                  // its lintel
    // the pyramid roof, to a point, and a finial
    var eave = sq(a + 0.2 * px), apex = [P(u, v, 0)[0], P(u, v, 0)[1], z3 + 1.0 * px];
    for (var i = 0; i < 4; i++) {
      var p0 = eave[i], p1 = eave[(i + 1) % 4], mx = (p0[0] + p1[0]) / 2 - apex[0], my = (p0[1] + p1[1]) / 2 - apex[1], ml = Math.hypot(mx, my) || 1;
      model.faces.push({ pts: [[p0[0], p0[1], z3], [p1[0], p1[1], z3], apex], n: [mx / ml * 0.7, my / ml * 0.7, 0.7], how: rlook });
    }
    v3Prism(model.faces, sq(0.03 * px), apex[2], apex[2] + 0.6 * px, { piece: true, color: "#b89a4a", edge: "#6a5a2a" });
    for (var j = f0; j < model.faces.length; j++) { model.faces[j].node = best.room; }
  }
  // A cornice: round the top of the walls of a flat roof, a band standing
  // out from them under the parapet's cap.
  if (typeof styleFlat === "function") {
    var civicFlatWas = styleFlat;
    styleFlat = function (faces, R, z, how, slab) {
      var out = civicFlatWas.apply(this, arguments), S = styleNow();
      if (slab || !S || !S.cornice) { return out; }
      try {
        var px = FLOOR_PX, e = R.eave || {}, par = (S.parapet || 0.5) * px, C = 0.3 * px, deep = 0.34 * px;
        var look = { piece: true, color: S.cornice, edge: v3Mix(S.cornice, "#000000", 0.35), alpha: how.alpha, late: how.late, bare: true };
        [["n", [R.x0, R.y0], [R.x1, R.y0], [0, 1]], ["s", [R.x0, R.y1], [R.x1, R.y1], [0, -1]],
         ["w", [R.x0, R.y0], [R.x0, R.y1], [1, 0]], ["e", [R.x1, R.y0], [R.x1, R.y1], [-1, 0]]].forEach(function (side) {
          if (!e[side[0]]) { return; }
          var a = side[1], b = side[2], d = side[3];
          // out past the wall (d points in), the corners carried round
          var ex = [b[0] - a[0], b[1] - a[1]], el = Math.hypot(ex[0], ex[1]) || 1, ox = ex[0] / el * C, oy = ex[1] / el * C;
          var base = [[a[0] - ox, a[1] - oy], [b[0] + ox, b[1] + oy], [b[0] + ox - d[0] * C, b[1] + oy - d[1] * C], [a[0] - ox - d[0] * C, a[1] - oy - d[1] * C]];
          v3Prism(faces, base, z + par - deep, z + par - 0.02 * px, look);
          // and a narrow band a storey's head lower, the ground floor's crown (a shop's)
          if (S.awning) {
            var low = [[a[0], a[1]], [b[0], b[1]], [b[0] - d[0] * C * 0.5, b[1] - d[1] * C * 0.5], [a[0] - d[0] * C * 0.5, a[1] - d[1] * C * 0.5]];
            v3Prism(faces, low, (R.base !== undefined ? R.base : 0) + 3.2 * px, (R.base !== undefined ? R.base : 0) + 3.4 * px, look);
          }
        });
      } catch (e2) { /* without */ }
      return out;
    };
  }

  // Their pictures show what they have that others do not: the glass's
  // mullions, the cornice, the awnings, the cupola on the ridge.
  if (typeof styleArt === "function") {
    var civicArtWas = styleArt;
    styleArt = function (key, shapeOnly) {
      var svg = civicArtWas.apply(this, arguments), S = HOUSE_STYLES[key];
      if (shapeOnly || !S) { return svg; }
      var more = [];
      if (S.out && S.out[0] === "curtain") { more.push('<path d="M13.4 16.4 V27 M18 16.4 V27 M26 16.4 V27 M30.6 16.4 V27 M9 21.6 H35"/>'); }
      if (S.cornice) { more.push('<path d="M7.2 16.4 H36.8"/>'); }
      if (S.awning) { more.push('<path d="M11.2 18.4 L12.4 16.9 H16 L17.2 18.4 M26.8 18.4 L28 16.9 H31.6 L32.8 18.4"/>'); }
      if (S.cupola) { more.push('<path d="M20.6 6.8 V3.8 H23.4 V6.8 M20 3.8 L22 1.8 L24 3.8"/>'); }
      return more.length ? svg.replace("</svg>", more.join("") + "</svg>") : svg;
    };
  }

  // ---- picked: what suits it first, the rest by where they are from, found by name --------------
  var civicView = { tab: null, q: "" };      // (where the picker was, while the page is open)
  // `o`: { now(): the key there now ("" plain, "any" the seed's), pick(key),
  // type: the kind of building, any: offer Any, plain: offer Plain, seed }
  function civicGallery(box, o) {
    box.innerHTML = "";
    box.civicO = o;
    box.classList.add("sy-picker");
    var suits = (CIVIC_FOR[o.type] || []).filter(function (k) { return HOUSE_STYLES[k]; });
    var tabs = (suits.length ? ["suits"] : []).concat(["all"], STYLE_REGIONS);
    var tab = tabs.indexOf(civicView.tab) >= 0 ? civicView.tab : tabs[0];
    var chips = document.createElement("div");
    chips.className = "ty-chips sy-chips";
    chips.setAttribute("role", "tablist");
    tabs.forEach(function (t) {
      var c = document.createElement("button");
      c.type = "button";
      c.className = "ty-chip" + (t === tab && !civicView.q ? " on" : "");
      c.setAttribute("role", "tab");
      c.setAttribute("aria-selected", t === tab && !civicView.q ? "true" : "false");
      c.textContent = t === "suits" ? TXT.sy_suggested : t === "all" ? TXT.sy_all : TXT["sy_r_" + t] || t;
      c.onclick = function () { civicView.tab = t; civicView.q = ""; civicGallery(box, o); };
      chips.appendChild(c);
    });
    box.appendChild(chips);
    var find = document.createElement("input");
    find.type = "search";
    find.className = "sy-find";
    find.placeholder = TXT.sy_find;
    find.setAttribute("aria-label", TXT.sy_find);
    find.value = civicView.q;
    box.appendChild(find);
    var grid = document.createElement("div");
    grid.className = "sy-grid";
    box.appendChild(grid);
    function name(k) { return k === "any" ? TXT.sy_any : k ? TXT["sy_" + k] || k : TXT.sy_plain; }
    function tile(k) {
      var S = HOUSE_STYLES[k], on = (o.now() || "") === k;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sy-tile" + (on ? " on" : "");
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var art = k === "any" ? civicAnyArt() : styleArt(k || "plain");
      var dots = S ? '<span class="sy-dots" aria-hidden="true">' + [S.out[1], S.roof[1], S.trim].map(function (c) {
        return '<i style="background:' + c + '"></i>';
      }).join("") + "</span>" : "";
      b.innerHTML = art + '<span class="sy-name"></span>' + dots;
      b.querySelector(".sy-name").textContent = name(k);
      // (Any says which it is this time)
      if (k === "any" && o.seed !== undefined) {
        var now = civicAny(o.type || "house", o.seed);
        if (now) { b.title = name(now); var sub = document.createElement("small"); sub.textContent = name(now); b.appendChild(sub); }
      }
      b.onclick = function () { o.pick(k); civicGallery(box, o); };
      return b;
    }
    function fill() {
      grid.innerHTML = "";
      var q = civicView.q.trim().toLowerCase(), keys;
      if (q) {
        keys = Object.keys(HOUSE_STYLES).filter(function (k) {
          return (name(k) + " " + (TXT["sy_r_" + HOUSE_STYLES[k].at] || "")).toLowerCase().indexOf(q) >= 0;
        });
      } else {
        keys = tab === "suits" ? suits : tab === "all" ? Object.keys(HOUSE_STYLES)
             : Object.keys(HOUSE_STYLES).filter(function (k) { return HOUSE_STYLES[k].at === tab; });
        if (tab === "suits" || tab === "all") { keys = (o.any ? ["any"] : []).concat(o.plain ? [""] : [], keys); }
      }
      keys.forEach(function (k) { grid.appendChild(tile(k)); });
      if (!keys.length) {
        var none = document.createElement("div");
        none.className = "sy-none";
        none.textContent = TXT.sy_none;
        grid.appendChild(none);
      }
    }
    find.oninput = function () {
      civicView.q = find.value;
      chips.querySelectorAll(".ty-chip").forEach(function (c, i) { var on = !civicView.q && tabs[i] === tab; c.classList.toggle("on", on); c.setAttribute("aria-selected", on ? "true" : "false"); });
      fill();
    };
    fill();
  }
  // Any: the shuffle arrows over a house.
  function civicAnyArt() {
    return '<svg class="sy-art" viewBox="0 0 44 30" aria-hidden="true"><path d="M9 16 V27 H35 V16 M6 16 L22 5 L38 16"/>' +
           '<path d="M14 21 h3 c3 0 4 -4 7 -4 h3 M14 17 h3 c1.4 0 2.2 1 3 2 M24 23 c.8 1 1.6 2 3 2 h0 M25 15.4 L27 17 L25 18.6 M25 23.4 L27 25 L25 26.6"/>' +
           '<path d="M3 27 H41"/></svg>';
  }

  // Start building: the style as a gallery, where it was two arrows a style at a time.
  if (typeof typeStyleRow === "function") {
    typeStyleRow = function (pick, want, redraw) {
      if (typeof HOUSE_STYLES !== "object") { return; }
      var T = typeof typeOf === "function" ? typeOf(want) : {}, type = want.type || "house", house = type === "house";
      var h = document.createElement("div");
      h.className = "st-head";
      h.textContent = TXT.sy_head;
      pick.appendChild(h);
      var box = document.createElement("div");
      pick.appendChild(box);
      civicGallery(box, {
        type: type, any: true, plain: true, seed: want.seed,
        // (nothing picked: a house as it is made, another building one of its own, the seed's)
        now: function () { return want.style !== undefined ? want.style : house ? "" : CIVIC_FOR[type] ? "any" : (T.style || ""); },
        pick: function (k) { want.style = k; redraw(); }
      });
      // (Shuffle: Any says which it is now)
      var card = pick.closest ? pick.closest(".st-card, .card, [role=dialog]") || document : document, sh = card.querySelector(".st-shuffle");
      if (sh && !sh.civicHeard) {
        sh.civicHeard = true;
        sh.addEventListener("click", function () {
          var o2 = box.civicO;
          if (o2) { o2.seed = want.seed; civicGallery(box, o2); }
        });
      }
    };
  }
  // The view's Settings: the same gallery, under the style there now.
  if (typeof styleSection === "function") {
    var civicSectionWas = styleSection;
    styleSection = function (sheet, head, draw) {
      var was = styleOpen;
      styleOpen = false;                     // (its own list of all, by region, not drawn: this one instead)
      try { civicSectionWas.apply(this, arguments); } finally { styleOpen = was; }
      var btn = sheet.querySelector(".sy-now button");
      if (btn) {
        btn.textContent = styleOpen ? TXT.hs_done : TXT.sy_change;
        btn.setAttribute("aria-expanded", styleOpen ? "true" : "false");
      }
      if (!styleOpen) { return; }
      var card = sheet.querySelector(".sy-now"), box = document.createElement("div");
      box.className = "sy-gallery";
      if (card && card.nextSibling) { sheet.insertBefore(box, card.nextSibling); } else { sheet.appendChild(box); }
      civicGallery(box, {
        type: civicTypeNow(), any: false, plain: true,
        now: function () { return houseOpt("style") || ""; },
        pick: function (k) {
          styleApply(k);
          handSaysSoft(say("sy_applied", { name: k ? TXT["sy_" + k] || k : TXT.sy_plain }));
          draw();
        }
      });
    };
  }
