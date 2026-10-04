// ---------------------------------------------------------------------------
//  40-verge.js -- the sidewalk stepped back from the street: a strip of
//  grass between it and the kerb (or a wider one with trees along it), the
//  street lamps and the power poles standing in it; and the power lines off
//  the sidewalk, their arms reaching out over the road
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update this so the power lines stop running on
  // top of the sidewalks when in front of the house and to have a setting so
  // the sidewalks can be stepped away from the street too rather than being
  // right next to the street")
  //
  // The street was the lot's edge, then 1.6 m of sidewalk, then the road.
  // Everything that stands by it worked from that: the road from the kerb,
  // the cars on it, the lamps a step in from the kerb, the far side, the
  // houses over the road, the land graded for it (40-land.js), the poles.
  // Now the kerb is as far out as the sidewalk and the strip beside it --
  // streetWalkPx(), what the street's own "walkW" is everywhere -- and the
  // sidewalk itself stays 1.6 m by the lot, those walking on it as before.
  var VG_KINDS = ["none", "strip", "trees"];
  var VG_WIDE = { none: 0, strip: 1.5, trees: 2.4 };      // metres of grass between the sidewalk and the kerb
  var VG_WALK = 1.6;                                       // metres: the sidewalk
  var VG_TREES = 7;                                        // metres between the trees along the strip
  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.verge = "none"; }
  function streetVerge() { var k = typeof houseOpt === "function" ? houseOpt("verge") : null; return VG_WIDE[k] !== undefined ? k : "none"; }
  function streetVergePx() { return VG_WIDE[streetVerge()] * FLOOR_PX; }
  function streetWalkPx() { return VG_WALK * FLOOR_PX + streetVergePx(); }   // the lot's edge to the kerb

  // ---- drawn: the strip, its kerb, its trees -----------------------------------------------
  // (how far the street reaches either way: as far as the ground it is drawn on, 38-view3d-gl.js)
  var vgLand = null;
  if (typeof worldGround === "function") {
    var worldGroundVerge = worldGround;
    worldGround = function (v, L) { vgLand = L; return worldGroundVerge.apply(this, arguments); };
  }
  if (typeof houseStreetBits === "function") {
    var houseStreetBitsVerge = houseStreetBits;
    houseStreetBits = function (v, lot, lotWorld, lotLocal, hy, walkW, sheetC) {
      var out = houseStreetBitsVerge.apply(this, arguments);
      try { vgDraw(v, lot, lotWorld, hy, walkW, sheetC); } catch (e) { /* the street as it was */ }
      return out;
    };
  }
  // the land's own mesh paints the street and its strips where the ground rises and falls (40-land.js)
  function vgOnMesh() { return typeof TERR !== "undefined" && TERR && !TERR.off && TERR.mesh && TERR.street && typeof TERR_ON !== "undefined" && TERR_ON; }
  function vgGrass(sheetC) {
    var lawn = typeof worldLawn === "function" ? worldLawn() : null;
    var c = gl3Mix(lawn ? lawn.color : [0.42, 0.6, 0.3], sheetC, 0.14);
    if (typeof houseWet === "function" && houseWet()) { c = gl3Mix(c, [0.12, 0.2, 0.1], 0.22); }
    if (typeof gl3SnowNow !== "undefined" && gl3SnowNow) { c = gl3Mix(c, [0.94, 0.95, 0.98], 0.86); }
    return { c: c, pat: lawn ? lawn.pat : PAT.grass };
  }
  // The lot's lawn, as the drawing colors the lot's own face (gl3Faces; 40-land.js the same) -- none for a lot only guessed.
  function vgLotLawn(lot, sheetC) {
    if (!lot || lot.guessed || lot.kind !== "i_lot") { return null; }
    var lawn = typeof worldLawn === "function" ? worldLawn() : null, lc = gl3Rgb(simLook(lot).fill || simSheet());
    var c = gl3Mix(gl3Mix(lc, lawn ? lawn.color : [0.42, 0.62, 0.3], lawn ? 0.75 : 0.55), sheetC, 0.15);
    if (typeof houseWet === "function" && houseWet()) { c = gl3Mix(c, [0.12, 0.2, 0.1], 0.22); }
    if (typeof gl3SnowNow !== "undefined" && gl3SnowNow) { c = gl3Mix(c, [0.94, 0.95, 0.98], 0.86); }
    return { c: c, pat: lawn ? lawn.pat : PAT.lawn };
  }
  function vgDraw(v, lot, lotWorld, hy, walkW, sheetC) {
    var V = streetVergePx();
    if (!V) { return; }
    var P = FLOOR_PX, side = walkW - V, L = vgLand && vgLand.lot === lot ? vgLand : null;
    var reach = L ? (L.walk ? GL3_FAR * 0.8 : L.groundR) : 300 * P, far = !!houseOpt("hood");
    var kerbC = gl3Mix([0.72, 0.71, 0.68], sheetC, 0.15);
    function band(y0, y1, z, c, pat, uvY) {
      gl3Poly(v, [lotWorld(-reach, y0, z), lotWorld(reach, y0, z), lotWorld(reach, y1, z), lotWorld(-reach, y1, z)], [0, 0, 1], c, 1,
              [[-reach / P, 0], [reach / P, 0], [reach / P, uvY], [-reach / P, uvY]], pat);
    }
    if (!vgOnMesh()) {
      var g = vgGrass(sheetC), road1 = hy + walkW + 7 * P;
      // (2026-10-04: "the grass beyond the sidewalk to the street is also your land") in front of the
      // lot, the strip is the lot's own lawn -- its color, its mown stripes carried on; beyond, grass
      var own = vgLotLawn(lot, sheetC), hw = lot.w / 2, s0 = hy + side, s1 = hy + walkW - 0.15 * P;
      if (own) {
        [[-reach, -hw], [hw, reach]].forEach(function (x) {
          gl3Poly(v, [lotWorld(x[0], s0, -1.5), lotWorld(x[1], s0, -1.5), lotWorld(x[1], s1, -1.5), lotWorld(x[0], s1, -1.5)], [0, 0, 1], g.c, 1,
                  [[x[0] / P, 0], [x[1] / P, 0], [x[1] / P, (s1 - s0) / P], [x[0] / P, (s1 - s0) / P]], g.pat);
        });
        var v0 = (s0 + lot.h / 2) / P, v1 = (s1 + lot.h / 2) / P;
        gl3Poly(v, [lotWorld(-hw, s0, -1.5), lotWorld(hw, s0, -1.5), lotWorld(hw, s1, -1.5), lotWorld(-hw, s1, -1.5)], [0, 0, 1], own.c, 1,
                [[0, v0], [lot.w / P, v0], [lot.w / P, v1], [0, v1]], own.pat);
      } else {
        band(s0, s1, -1.5, g.c, g.pat, (V - 0.15 * P) / P);
      }
      band(hy + walkW - 0.15 * P, hy + walkW, -1.2, kerbC, PAT.concrete, 0.15);
      if (far) {
        band(road1, road1 + 0.15 * P, -1.2, kerbC, PAT.concrete, 0.15);
        band(road1 + 0.15 * P, road1 + V, -1.5, g.c, g.pat, (V - 0.15 * P) / P);
      }
    }
    if (streetVerge() === "trees") { vgTrees(v, lot, lotWorld, hy + side + V / 2, sheetC); }
  }
  // Trees along the strip, one every nine metres -- none where a drive or a
  // path crosses it, and clear of the lamps and the poles.
  function vgTrees(v, lot, lotWorld, y, sheetC) {
    var P = FLOOR_PX, a = -(lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), busy = [];
    function local(n) { var dx = n.x - lot.x, dy = n.y - lot.y; return dx * c - dy * s; }
    // (a door out to the front -- a room behind it, nothing between it and the street -- has its path
    // out to the sidewalk, houseStreetBits; the doors inside the house have none)
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; }), ca = Math.cos(-a), sa = Math.sin(-a);
    function toStreet(n, by) { return [n.x - sa * by, n.y + ca * by]; }
    hand.nodes.forEach(function (n) {
      if (n.kind === "i_driveway" || n.kind === "i_path") { busy.push([local(n) - turned(n).w / 2 - 1.6 * P, local(n) + turned(n).w / 2 + 1.6 * P]); return; }
      if (!WALK_DOORS[n.kind] || n.kind === "i_garagedoor") { return; }
      var front = toStreet(n, 0.7 * P), back = toStreet(n, -0.7 * P);
      if (rooms.some(function (r) { return insideArea(r, front[0], front[1]); }) || !rooms.some(function (r) { return insideArea(r, back[0], back[1]); })) { return; }
      busy.push([local(n) - 2.0 * P, local(n) + 2.0 * P]);
    });
    var every = 18 * P, shift = typeof worldLampShift === "function" ? worldLampShift() : every / 2;
    var lamps = typeof worldLampKind !== "function" || worldLampKind() !== "none";
    var poles = typeof powerPoles === "function" && typeof powerKind === "function" && powerKind() === "front" ? powerPoles(powerFrame(lot), false).map(function (p) { return p.lx; }) : [];
    var rnd = gl3Rand(Math.round(Math.abs(lot.x) * 7 + Math.abs(lot.y) * 3) + 41), reach = 70 * P, step = VG_TREES * P;
    var keep = typeof terrLift !== "undefined" ? terrLift : null;
    function clear(x) {
      if (busy.some(function (b) { return x > b[0] && x < b[1]; })) { return false; }
      if (lamps && Math.abs(((x - shift) % every + every * 1.5) % every - every / 2) < 2.2 * P) { return false; }
      return !poles.some(function (px) { return Math.abs(px - x) < 2.2 * P; });
    }
    var last = -Infinity;
    for (var x0 = -Math.floor(reach / step) * step + step / 3; x0 < reach; x0 += step) {
      // (a tree where a drive, a path, a lamp or a pole is: moved along a little, not left out)
      var x = null;
      [0, 1.5, -1.5, 3, -3].some(function (o) { var t = x0 + o * P; if (clear(t) && t - last >= 4.5 * P) { x = t; return true; } return false; });
      if (x === null) { continue; }
      last = x;
      var at = lotWorld(x, y, 0);
      try {
        if (typeof terrLift !== "undefined") { terrLift = typeof powerGround === "function" ? powerGround(at[0], at[1]) : null; }
        gl3Tree(v, [at[0], at[1]], rnd, sheetC, false);
      } finally { if (typeof terrLift !== "undefined") { terrLift = keep; } }
    }
  }

  // ---- what the land and the scenery are made for ---------------------------------------------
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyVerge = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyVerge.apply(this, arguments) + "|vg" + streetVerge(); };
  }
  if (typeof terrKey === "function") {
    var terrKeyVerge = terrKey;
    terrKey = function () { var k = terrKeyVerge.apply(this, arguments); return k ? k + "|vg" + streetVerge() : k; };
  }

  // ---- asked: on the view's Street tab, and when it is started -------------------------------
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      vg_none: '<rect x="4.5" y="2.4" width="11" height="6.6" rx="1"/><path d="M1.4 11.6h17.2M1.4 14.2h17.2"/><path d="M1.4 17.6h17.2" stroke-dasharray="2.4 1.6"/>',
      vg_strip: '<rect x="4.5" y="1.6" width="11" height="5.6" rx="1"/><path d="M1.4 9.4h17.2M1.4 11.6h17.2"/><path d="M2.4 13.6l.8-1M5.4 13.6l.8-1M8.4 13.6l.8-1M11.4 13.6l.8-1M14.4 13.6l.8-1"/><path d="M1.4 15.2h17.2M1.4 18.4h17.2" stroke-dasharray="2.4 1.6"/>',
      vg_trees: '<rect x="4.5" y="1.4" width="11" height="4.8" rx="1"/><path d="M1.4 8h17.2M1.4 10h17.2"/><circle cx="5" cy="12.6" r="1.8"/><circle cx="10" cy="12.6" r="1.8"/><circle cx="15" cy="12.6" r="1.8"/><path d="M1.4 15.6h17.2M1.4 18.6h17.2" stroke-dasharray="2.4 1.6"/>'
    });
  }
  if (typeof streetSection === "function") {
    var streetSectionVerge = streetSection;
    streetSection = function (sheet, head, draw, noStreet) {
      var out = streetSectionVerge.apply(this, arguments);
      try {
        head(TXT.vg_head);
        var g = worldPicker(sheet, VG_KINDS, streetVerge(), "vg_", function (k) { houseSetOpt("verge", k); draw(); });
        if (noStreet) { all("button", g).forEach(function (b) { b.disabled = true; b.title = noStreet; }); }
      } catch (e) { /* the tab as it was */ }
      return out;
    };
  }
  if (typeof RD_SITE === "object" && RD_SITE.indexOf("verge") < 0) { RD_SITE.push("verge"); }
  if (typeof siteAsk === "function") {
    var siteAskVerge = siteAsk;
    siteAsk = function (ui, want) {
      var out = siteAskVerge.apply(this, arguments);
      try {
        var S = want.site || (want.site = {});
        ui.head(TXT.vg_head);
        ui.tiles();
        VG_KINDS.forEach(function (k) {
          ui.tile(TXT["vg_" + k], "vg_" + k, function () { return (S.verge !== undefined ? S.verge : streetVerge()) === k; }, function () { S.verge = k; }, true);
        });
      } catch (e) { /* asked as it was */ }
      return out;
    };
  }
