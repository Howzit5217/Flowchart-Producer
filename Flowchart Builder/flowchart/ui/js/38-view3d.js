// ---------------------------------------------------------------------------
//  38-view3d.js -- a floor plan, or a sky, in 3D: looked round from above,
//  or walked round inside
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // =========================================================== in space ==
  // A plan drawn from above is a house, and a house can be stood in.  This
  // puts it up: every room's walls raised round its floor, with the
  // doorways and windows left in them and the doors hung in the doorways;
  // every piece of furniture its own height, with its drawing on top of it;
  // what hangs on the walls at the height it hangs; the people standing;
  // and the one walking it (38-walk.js) walking it here too.  A drawing of
  // space becomes a sky of spheres on the paths they go round (39-orbit.js).
  //
  // It is looked at two ways (asked for, 2026-10-01: "walk around it in 3d
  // space too ... usable doors"):
  //
  //   from above   the way an architect's model is -- straight lines kept
  //                straight, turned by dragging it, nearer with the wheel
  //                or two fingers
  //   inside       standing in it at eye height and walking about: the keys
  //                (W A S D, or the arrows) or the pad in the corner, a
  //                drag to look round; the walls and furniture are in the
  //                way, as they would be, and a door is opened -- or shut
  //                -- with E, a click or the pad's door button, unless its
  //                words say it is locked
  //
  // Everything is in the paper's own black and white: the paper is the
  // floors and the walls' faces, shaded by which way they face, and the ink
  // is the edges and the tops of the walls, as a plan draws them.
  var V3 = null;                         // the view, while it is open
  var WALL_TALL = 2.6, DOOR_TALL = 2.1, SILL = 0.9;   // metres
  // A window's sill and an opening's head, in pixels: its own where it has
  // them (`n.sill`, `n.head`, metres: a shop's glass from near the floor, a
  // lobby's tall doors, 40-fronts.js), else a house's -- the head kept a
  // hand under the ceiling (`ceilPx`).
  function openSill(n) { return (n && n.sill !== undefined ? n.sill : SILL) * FLOOR_PX; }
  function openHead(n, ceilPx) {
    var h = (n && n.head ? n.head : DOOR_TALL) * FLOOR_PX;
    return ceilPx ? Math.min(h, ceilPx - 0.1 * FLOOR_PX) : h;
  }
  var EYE_TALL = 1.6;                    // where the eyes are, walking round
  var V3_FOV = 75 * Math.PI / 180;       // how wide it sees, walking round
  var V3_NEAR = 4;                       // nothing nearer the eye than this is drawn
  // pixels a second (2.7 m/s, a brisk walk -- 1.6 was found too slow,
  // 2026-10-01: "when walking through the house you move faster"); Shift doubles it
  var WALK_PACE = 135;
  var WALK_BODY = 9;                     // how wide round you are, for walls
  var V3_LOOK_DOWN = 1.35;               // how far down you can look walking: at your own feet (40-tour.js)
  // How tall each piece is, in metres; and which are round.
  var V3_HIGH = { i_bed: 0.55, i_bed1: 0.55, i_crib: 0.9, i_nightstand: 0.55, i_wardrobe: 2.0,
                  i_dresser: 0.9, i_sofa: 0.8, i_armchair: 0.8, i_coffee: 0.42, i_tv: 1.1,
                  i_fireplace: 1.1, i_piano: 1.2, i_bookcase: 1.9, i_lamp: 1.6, i_plant: 0.9,
                  i_dining: 0.75, i_roundtable: 0.75, i_chair: 0.9, i_desk: 0.75, i_officechair: 1.0,
                  i_counter: 0.9, i_stove: 0.9, i_fridge: 1.8, i_kitchensink: 0.9, i_toilet: 0.75,
                  i_sink: 0.85, i_bathtub: 0.55, i_shower: 0.1, i_washer: 0.85, i_dryer: 0.85,
                  i_parked: 1.45, i_shrub: 2.2, i_rug: 0.01,
                  i_dishwasher: 0.85, i_island: 0.92, i_stool: 0.75, i_trash: 0.65, i_pantry: 2.1,
                  i_vanity: 0.85, i_bathmat: 0.01, i_hamper: 0.6, i_ironing: 0.9, i_dryrack: 1.0, i_heater: 1.5,
                  i_utilitysink: 0.9, i_bedking: 0.55, i_bunkbed: 1.7, i_vanitytable: 0.75, i_bench: 0.45,
                  i_chest: 0.5, i_sidetable: 0.55, i_filing: 1.1, i_loveseat: 0.8, i_sectional: 0.8,
                  i_recliner: 0.95, i_ottoman: 0.42, i_tvstand: 0.5, i_aquarium: 1.2, i_beanbag: 0.55,
                  i_speaker: 1.0, i_palm: 1.9, i_cactus: 0.9, i_flowers: 0.5, i_arclamp: 1.9,
                  i_cubeshelf: 0.8, i_cornershelf: 1.5, i_shoerack: 0.45, i_coatrack: 1.8, i_pc: 0.45,
                  i_fan: 1.2, i_grill: 1.0, i_pool: 0.02, i_patio: 0.75, i_gardenbench: 0.45, i_hottub: 0.9,
                  i_dogbed: 0.25, i_cattree: 1.5, i_driveway: 0.03, i_path: 0.03, i_deck: 0.15,
                  i_flowerbed: 0.25, i_hedge: 1.1,
                  i_reachin: 2.4, i_closetrod: 1.8, i_closetshelves: 2.0,
                  i_consoletable: 0.8, i_sideboard: 0.85, i_chaise: 0.8, i_rocker: 1.05, i_hutch: 2.0, i_barcart: 0.85,
                  i_highchair: 1.0, i_daybed: 0.8, i_floormirror: 1.7, i_toybox: 0.5, i_standdesk: 1.1, i_lshapedesk: 0.75,
                  i_oven: 2.1, i_winecooler: 0.85, i_freezer: 0.85, i_cornertub: 0.55, i_linencab: 1.8,
                  i_treadmill: 1.4, i_exbike: 1.2, i_weightbench: 0.45, i_yogamat: 0.01, i_pooltable: 0.8, i_pingpong: 0.76,
                  i_easel: 1.6, i_trampoline: 0.9, i_swing: 2.1, i_firepit: 0.4, i_lounger: 0.4, i_gazebo: 2.8, i_shed: 2.3,
                  i_planter: 0.5, i_birdbath: 0.8, i_lamppost: 2.4, i_pathlight: 0.6, i_mailbox: 1.1, i_bikerack: 0.8,
                  i_gondola: 1.6, i_checkout: 0.9, i_cooler: 2.0, i_display: 0.85, i_schooldesk: 0.74, i_post: 2.6,
                  i_workbench: 0.9, i_shelving: 1.8, i_toolchest: 1.0, i_furnace: 1.4, i_waterheater: 1.5 };
  var V3_ROUND = { i_plant: true, i_lamp: true, i_shrub: true, i_stool: true, i_trash: true, i_heater: true,
                   i_sidetable: true, i_beanbag: true, i_palm: true, i_cactus: true, i_flowers: true,
                   i_coatrack: true, i_fan: true, i_dogbed: true, i_tablelamp: true, i_vase: true,
                   i_candle: true, i_succulent: true, i_fruitbowl: true, i_hanging: true, i_pendant: true,
                   i_chandelier: true, i_ceilingfan: true, i_firepit: true, i_trampoline: true, i_birdbath: true, i_lamppost: true,
                   i_pathlight: true };
  // How tall what stands on something else is (it stands on the tallest
  // thing under it, 03-icons.js ON_TOP); and how far below the ceiling
  // what hangs from it reaches.
  var V3_ON = { i_microwave: 0.3, i_coffeemaker: 0.35, i_toaster: 0.2, i_kettle: 0.25, i_fruitbowl: 0.12, i_register: 0.26,
                i_tablelamp: 0.55, i_desklamp: 0.45, i_vase: 0.35, i_candle: 0.15, i_books: 0.15,
                i_frame: 0.2, i_basket: 0.25, i_monitor: 0.4, i_succulent: 0.15, i_herbs: 0.2,
                i_soundbar: 0.1, i_console: 0.08, i_recordplayer: 0.15 };
  var V3_DROP = { i_hanging: [0.8, 0.35], i_pendant: [0.6, 0.25], i_chandelier: [0.8, 0.4],
                  i_ceilingfan: [0.4, 0.06], i_projector: [0.35, 0.15], i_vent: [0.02, 0.02], i_smoke: [0.05, 0.05], i_exhaustfan: [0.03, 0.03] };
  // What hangs on a wall: from how high to how high, in metres.
  var V3_WALL = { i_picture: [1.3, 1.9], i_mirror: [0.9, 1.9], i_shelf: [1.45, 1.5],
                  i_walltv: [1.1, 1.75], i_wallclock: [1.9, 2.3], i_sconce: [1.72, 1.95],
                  i_cabinet: [1.45, 2.2], i_hooks: [1.6, 1.72], i_radiator: [0.12, 0.7],
                  i_hood: [1.55, 2.2], i_towelrail: [0.95, 1.05], i_medicine: [1.3, 1.9],
                  i_proscreen: [0.9, 2.2], i_ac: [2.0, 2.3], i_whiteboard: [0.9, 2.0], i_dartboard: [1.5, 1.95],
                  i_evcharger: [0.9, 1.3], i_porchlight: [1.75, 2.15], i_floodlight: [2.45, 2.7],
                  // a socket a hand over the floor, a switch at the height of a hand by the door, the panel at eye level
                  i_outlet: [0.3, 0.42], i_lightswitch: [1.15, 1.27], i_breaker: [1.2, 1.95], i_thermostat: [1.45, 1.57],
                  // a garage door's button five feet up, out of a child's reach (40-garage.js)
                  i_garagebtn: [1.52, 1.64] };
  var PERSON_TALL = 1.7;

  function v3Mix(a, b, k) {             // a color k of the way from a to b
    function rgb(c) {
      c = String(c || "").trim();
      if (/^#[0-9a-f]{3}$/i.test(c)) { c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; }
      var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c);
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 255, 255];
    }
    var p = rgb(a), q = rgb(b);
    return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(p[i] + (q[i] - p[i]) * k); }).join(",") + ")";
  }

  // ---- what is put up --------------------------------------------------------
  // Faces (flat, many-sided, in the drawing's numbers with z up in
  // pixels), each with the way out of it -- for which side shows and how
  // light it is -- and the things that stand (people, the walker,
  // anything drawn from the side), each a picture stood upright.
  function v3Local(n, lx, ly) {
    var a = (n.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [n.x + lx * c - ly * s, n.y + lx * s + ly * c];
  }

  function v3Box(faces, n, x0, x1, y0, y1, z0, z1, how) {
    // a box in the shape's own numbers (turned with it), from z0 up to z1
    var base = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (p) { return v3Local(n, p[0], p[1]); });
    v3Prism(faces, base, z0, z1, how);
  }
  // `how.front`, a picture for the side facing the way the shape faces
  // (its third side, the one along y1): what hangs on a wall shows its
  // front to the room.
  function v3Prism(faces, base, z0, z1, how) {
    var cx = 0, cy = 0;
    base.forEach(function (p) { cx += p[0] / base.length; cy += p[1] / base.length; });
    for (var i = 0; i < base.length; i++) {
      var a = base[i], b = base[(i + 1) % base.length];
      var nx = b[1] - a[1], ny = a[0] - b[0], len = Math.hypot(nx, ny) || 1;
      // the side's way out, away from the middle of the box
      if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
      var face = { pts: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]],
                   n: [nx / len, ny / len, 0], how: how, side: true };
      if (how.front && i === 2 && base.length === 4) { face.tex = how.front; face.texAt = [2, 3, 1]; }
      faces.push(face);
    }
    if (how.noTop) { return; }           // under a roof: never seen
    faces.push({ pts: base.map(function (p) { return [p[0], p[1], z1]; }), n: [0, 0, 1], how: how,
                 top: true, tex: how.tex || null, texAt: [0, 1, 3] });
  }

  // The parts of one wall of a room, with what stands in it: where a door
  // is, only the part over the doorway; where a window is, the part under
  // it and over it, and the glass.
  function v3Wall(faces, room, edge, T, holes, how, low, wallTop, keep, ends) {
    var hw = room.w / 2, hh = room.h / 2;
    var along = edge === "top" || edge === "foot";
    var len = along ? room.w : room.h;
    var spans = [[0, len]];
    holes.forEach(function (hole) {
      var next = [];
      spans.forEach(function (s) {
        if (hole.b <= s[0] || hole.a >= s[1]) { next.push(s); return; }
        if (hole.a > s[0]) { next.push([s[0], hole.a]); }
        if (hole.b < s[1]) { next.push([hole.b, s[1]]); }
      });
      spans = next;
    });
    // (d0, d1: how far in from the wall's outside face, 0 to T by default --
    // a sill stands out past it, a pane of glass is a sliver in the middle)
    function part(a, b, z0, z1, look, d0, d1) {
      if (b - a < 0.5) { return; }
      if (keep) {
        keep(edge, a, b).forEach(function (run) { one(run[0], run[1], z0, z1, look, d0, d1); });
        return;
      }
      one(a, b, z0, z1, look, d0, d1);
    }
    function one(a, b, z0, z1, look, d0, d1) {
      if (b - a < 0.5 || z1 - z0 < 0.05) { return; }
      // (the wall itself, where it meets the next room's in line: run on a
      // little into it -- rooms laid side by side a half pixel apart left a
      // hairline down every join, the room behind it showing through,
      // 2026-10-04: "no weird holes ... visually or just in general")
      if (!look && ends) {
        if (a <= 0.01 && ends[0]) { a -= 0.75; }
        if (b >= len - 0.01 && ends[1]) { b += 0.75; }
      }
      if (d0 === undefined) { d0 = 0; d1 = T; }
      var x0, x1, y0, y1;
      if (edge === "top") { x0 = -hw + a; x1 = -hw + b; y0 = -hh + d0; y1 = -hh + d1; }
      else if (edge === "foot") { x0 = -hw + a; x1 = -hw + b; y0 = hh - d1; y1 = hh - d0; }
      else if (edge === "left") { y0 = -hh + a; y1 = -hh + b; x0 = -hw + d0; x1 = -hw + d1; }
      else { y0 = -hh + a; y1 = -hh + b; x0 = hw - d1; x1 = hw - d0; }
      v3Box(faces, room, x0, x1, y0, y1, z0, z1, look || how);
    }
    var ceil = ceilOf(room) * FLOOR_PX, top = Math.min(DOOR_TALL * FLOOR_PX, ceil - 0.1 * FLOOR_PX);
    var high = wallTop || ceil, tall = low ? Math.min(1.1 * FLOOR_PX, high) : high;
    spans.forEach(function (s) { part(s[0], s[1], 0, tall); });
    holes.forEach(function (hole) {
      var a = Math.max(0, hole.a), b = Math.min(len, hole.b);
      var top = openHead(hole.n, ceil);
      if (hole.door) {
        if (!low) { part(a, b, top, tall); }
      } else {
        var sill = openSill(hole.n);
        part(a, b, 0, Math.min(tall, sill));
        if (!low) {
          part(a, b, top, tall);
          // (2026-10-01: "the windows ... look great") a window, not a block
          // of glass the wall's thickness: a sill standing out past the
          // wall, a frame round it, a bar down the middle of a wide one,
          // and a pane of glass between
          // (its color the house's style's, 39-styles.js: black round a modern window, green in the Alps)
          var trimC = typeof styleTrim === "function" ? styleTrim("#f4f2ed") : "#f4f2ed";
          var F = 1.6, trim = { piece: true, color: trimC, edge: v3Mix(trimC, "#000000", 0.35) };
          part(a - 2, b + 2, sill - 0.04 * FLOOR_PX, sill + 0.4, trim, -2.5, T + 1);
          part(a, a + F, sill, top, trim, -0.4, T + 0.4);
          part(b - F, b, sill, top, trim, -0.4, T + 0.4);
          part(a, b, top - F, top, trim, -0.4, T + 0.4);
          part(a, b, sill, sill + F, trim, -0.4, T + 0.4);
          var lights = b - a > 1.2 * FLOOR_PX ? Math.round((b - a) / (0.9 * FLOOR_PX)) : 1;
          for (var m = 1; m < lights; m++) {
            var at = a + (b - a) * m / lights;
            part(at - 0.6, at + 0.6, sill + F, top - F, trim, T * 0.3, T * 0.7);
          }
          part(a + F, b - F, sill + F, top - F, { glass: true }, T / 2 - 0.3, T / 2 + 0.3);
        }
      }
    });
  }

  // Where along one of a room's walls something stood in it is: sampled
  // over its box, the part of it inside the wall's band.  Only a wall that
  // runs along it -- and of a swinging door only its threshold and middle,
  // not the floor its leaf swings over: a door in one wall, by a corner,
  // cut a doorway into the wall round the corner too, open to the garden.
  function v3Hole(room, edge, T, n) {
    var a = -(room.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var hw = room.w / 2, hh = room.h / 2, lo = Infinity, hi = -Infinity, step = 1 / 8;
    var rel = ((n.turn || 0) - (room.turn || 0)) * Math.PI / 180;
    var across = Math.abs(Math.cos(rel)) >= Math.abs(Math.sin(rel));
    if (across !== (edge === "top" || edge === "foot")) { return null; }
    var swing = SNAP_IN_WALL[n.kind] === "swing";
    for (var i = 0; i <= 8; i++) {
      for (var j = 0; j <= 8; j++) {
        if (swing && j !== 4 && j !== 8) { continue; }
        var p = v3Local(n, (i * step - 0.5) * n.w, (j * step - 0.5) * n.h);
        var dx = p[0] - room.x, dy = p[1] - room.y;
        var ux = dx * c - dy * s, uy = dx * s + dy * c, inBand, at;
        if (edge === "top" || edge === "foot") {
          var wall = edge === "top" ? -hh : hh;
          inBand = Math.abs(uy - wall) <= T + 5 && Math.abs(ux) <= hw;
          at = ux + hw;
        } else {
          var side = edge === "left" ? -hw : hw;
          inBand = Math.abs(ux - side) <= T + 5 && Math.abs(uy) <= hh;
          at = uy + hh;
        }
        if (inBand) { lo = Math.min(lo, at); hi = Math.max(hi, at); }
      }
    }
    if (lo === Infinity) { return null; }
    // a door's opening exactly as wide as the door, its frame (v3Door) round
    // the leaf: cut a sixteenth wider each side, there was a gap down both
    // sides of every door you could see the room beyond through (2026-10-01,
    // "giant holes on the sides of them"); a window's glass fills its own
    var pad = WALK_DOORS[n.kind] ? 0 : Math.max(n.w, n.h) * step / 2;
    return { a: lo - pad, b: hi + pad };
  }

  // A door, at the angle it is open now (0 shut, 90 wide open): each leaf a
  // thin box turning about its hinge on the threshold, the way the plan
  // draws its swing.
  function v3Door(faces, n, open) {
    var leaf = openHead(n), a = open * Math.PI / 180, own = simLook(n);
    var look = { leaf: true, color: own.fill, edge: own.line };
    function slab(hx, hy, dx, dy, len, thick) {
      var nx = -dy * thick / 2, ny = dx * thick / 2;
      var base = [[hx + nx, hy + ny], [hx + dx * len + nx, hy + dy * len + ny],
                  [hx + dx * len - nx, hy + dy * len - ny], [hx - nx, hy - ny]]
        .map(function (p) { return v3Local(n, p[0], p[1]); });
      v3Prism(faces, base, 0, leaf, look);
    }
    var hw = n.w / 2, hh = n.h / 2;
    // its frame: a jamb down each side of the opening and a head across the
    // top, through the wall and a hair proud of it either side, the leaf
    // shutting against it -- in line with the wall it stands in (a swinging
    // door's threshold, the middle of anything else)
    var line = SNAP_IN_WALL[n.kind] === "swing" ? hh : 0, J = 1.5, deep = 6.5;
    var trim = { piece: true, color: typeof styleTrim === "function" ? styleTrim("#f1eee8") : "#f1eee8", edge: own.line };
    var frameTop = leaf + (n.kind === "i_garagedoor" ? 0 : 0.03 * FLOOR_PX);
    v3Box(faces, n, -hw, -hw + J, line - deep, line + deep, 0, frameTop, trim);
    v3Box(faces, n, hw - J, hw, line - deep, line + deep, 0, frameTop, trim);
    // (its underside a little under the wall's over the doorway, not level with it to flicker)
    v3Box(faces, n, -hw, hw, line - deep, line + deep, leaf - 0.4, frameTop + 1.2, trim);
    if (n.kind === "i_door") { slab(-hw + 1.5, hh, Math.cos(a), -Math.sin(a), n.w - 3, 3); }
    else if (n.kind === "i_door2") {
      slab(-hw + 1.3, hh, Math.cos(a), -Math.sin(a), hw - 2, 2.6);
      slab(hw - 1.3, hh, -Math.cos(a), -Math.sin(a), hw - 2, 2.6);
    } else if (n.kind === "i_bifold") {        // folds: two pairs of panels, to either side
      var panel = (n.w - 4) / 4, th = (open / 90) * Math.PI / 2 * 0.9;
      [[-hw + 2, 1], [hw - 2, -1]].forEach(function (side) {
        var x0 = side[0], dir = side[1];
        slab(x0, 0, dir * Math.cos(th), -Math.sin(th), panel, 2);
        slab(x0 + dir * panel * Math.cos(th), -panel * Math.sin(th), dir * Math.cos(th), Math.sin(th), panel, 2);
      });
    } else if (n.kind === "i_garagedoor") {   // rolls up into the roof
      var lift = (open / 90) * (leaf - 0.15 * FLOOR_PX);
      v3Box(faces, n, -hw, hw, -1.5, 1.5, lift, leaf, look);
    } else {                              // sliding: the panel slides aside
      var by = (open / 90) * (n.w / 2 - 4);
      v3Box(faces, n, -hw + 2 + by, by, -1.4, 1.4, 0, leaf, { leaf: true, glass: true, edge: own.line });
    }
  }

  // ---- a roof over it --------------------------------------------------------
  // (asked for, 2026-10-01: "add a roof and ceilings in 3D too")  A hip
  // roof -- sloping down to every wall, the way most houses are roofed -- over
  // each run of rooms with nothing over them: the top floor, and any room
  // lower down that the floor above leaves open to the sky (a garage beside
  // a house of two floors).  Rooms side by side that make a rectangle
  // together are roofed as one.  It hangs out past its walls a little where
  // nothing stands against them.
  var ROOF_PITCH = Math.tan(30 * Math.PI / 180);   // how steep: rise over run
  var ROOF_EAVE = 0.35;                             // metres it hangs out past its walls
  var ROOF_RIDGE = 3.5;                             // metres, the most a ridge rises

  // The rectangles to roof, in the ground floor's numbers (floorsOf): each
  // { x0, x1, y0, y1, z, level, eave, turn, at, room }, z the top of its
  // walls.  A room standing at a slant is roofed on its own, in its own
  // numbers about `at`.
  function roofPlan(floors, upTo, wallTop) {
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    function floorOf(n) { return floorAt(floors, n.x, n.y); }
    // something built at this point, on this level or one over it
    function built(x, y, level) {
      return rooms.some(function (u) {
        var fu = floorOf(u);
        return (fu ? fu.level : 0) >= level && insideArea(u, x - (fu ? fu.dx : 0), y - (fu ? fu.dy : 0));
      });
    }
    var rects = [];
    rooms.forEach(function (r) {
      var f = floorOf(r), level = f ? f.level : 0;
      if (upTo !== null && upTo !== undefined && f && level > upTo) { return; }
      // a room inside a room (a closet) is under that one's roof
      if (rooms.some(function (o) { return o !== r && o.w * o.h > r.w * r.h && insideArea(o, r.x, r.y); })) { return; }
      var bx = r.x + (f ? f.dx : 0), by = r.y + (f ? f.dy : 0);
      if (built(bx, by, level + 1)) { return; }          // the floor above is its roof
      var z = (f ? f.z : 0) + wallTop(r), t = (((r.turn || 0) % 360) + 360) % 360;
      if (t % 90) {
        rects.push({ x0: -r.w / 2, x1: r.w / 2, y0: -r.h / 2, y1: r.h / 2, z: z, level: level,
                     turn: t, at: [bx, by], room: r });
        return;
      }
      var q = turned(r);
      rects.push({ x0: bx - q.w / 2, x1: bx + q.w / 2, y0: by - q.h / 2, y1: by + q.h / 2, z: z, level: level,
                   turn: 0, room: r });
    });
    // side by side, and as long as each other: one rectangle, one roof
    for (var joined = true; joined;) {
      joined = false;
      for (var i = 0; i < rects.length && !joined; i++) {
        for (var j = i + 1; j < rects.length && !joined; j++) {
          var a = rects[i], b = rects[j];
          if (a.turn || b.turn || a.level !== b.level || Math.abs(a.z - b.z) > 1) { continue; }
          var row = Math.abs(a.y0 - b.y0) <= 6 && Math.abs(a.y1 - b.y1) <= 6 &&
                    (Math.abs(a.x1 - b.x0) <= 6 || Math.abs(b.x1 - a.x0) <= 6);
          var col = Math.abs(a.x0 - b.x0) <= 6 && Math.abs(a.x1 - b.x1) <= 6 &&
                    (Math.abs(a.y1 - b.y0) <= 6 || Math.abs(b.y1 - a.y0) <= 6);
          if (!row && !col) { continue; }
          a.x0 = Math.min(a.x0, b.x0); a.x1 = Math.max(a.x1, b.x1);
          a.y0 = Math.min(a.y0, b.y0); a.y1 = Math.max(a.y1, b.y1);
          rects.splice(j, 1);
          joined = true;
        }
      }
    }
    // the eaves: out over every side that nothing stands against
    rects.forEach(function (R) {
      var E = ROOF_EAVE * FLOOR_PX;
      if (R.turn) { R.eave = { n: E, s: E, w: E, e: E }; return; }
      function open(points) { return points.every(function (pt) { return !built(pt[0], pt[1], R.level); }); }
      var mx = [0.2, 0.5, 0.8].map(function (k) { return R.x0 + (R.x1 - R.x0) * k; });
      var my = [0.2, 0.5, 0.8].map(function (k) { return R.y0 + (R.y1 - R.y0) * k; });
      R.eave = {
        n: open(mx.map(function (x) { return [x, R.y0 - 8]; })) ? E : 0,
        s: open(mx.map(function (x) { return [x, R.y1 + 8]; })) ? E : 0,
        w: open(my.map(function (y) { return [R.x0 - 8, y]; })) ? E : 0,
        e: open(my.map(function (y) { return [R.x1 + 8, y]; })) ? E : 0
      };
    });
    return rects;
  }

  // The faces of one roof: two slopes and two hips over the rectangle --
  // to a point, over a square -- and its eaves past the walls, lifted by
  // `lift` (on its way on or off).
  function roofFaces(faces, R, lift, how) {
    var W = R.x1 - R.x0, D = R.y1 - R.y0, along = W >= D, half = (along ? D : W) / 2;
    // (a roof in one piece, 39-house.js: every part of it as steep, `k`,
    // and one a hair over another where the two are the same slope)
    var rise = R.k ? half * R.k : Math.min(half * ROOF_PITCH, ROOF_RIDGE * FLOOR_PX), k = R.k || (half > 0 ? rise / half : 0);
    var z = R.z + lift + (R.bias || 0), top = z + rise, xm = (R.x0 + R.x1) / 2, ym = (R.y0 + R.y1) / 2;
    var at = R.turn ? { x: R.at[0], y: R.at[1], turn: R.turn } : null;
    function P(x, y, h) {
      if (!at) { return [x, y, h]; }
      var q = v3Local(at, x, y);
      return [q[0], q[1], h];
    }
    var A = along ? [R.x0 + half, ym] : [xm, R.y0 + half], B = along ? [R.x1 - half, ym] : [xm, R.y1 - half];
    var nw = [R.x0, R.y0], ne = [R.x1, R.y0], se = [R.x1, R.y1], sw = [R.x0, R.y1];
    function face(corners) {
      var pts = corners.map(function (c) { return P(c[0], c[1], c[2]); });
      // which way it faces (Newell's way, which a hip's three corners or a
      // slope's four both answer), always up and out
      var nx = 0, ny = 0, nz = 0;
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
      }
      var len = Math.hypot(nx, ny, nz) || 1;
      if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      faces.push({ pts: pts, n: [nx / len, ny / len, nz / len], how: how, roof: true });
    }
    function w(c) { return [c[0], c[1], z]; }
    function r(c) { return [c[0], c[1], top]; }
    if (along) {
      face([w(nw), w(ne), r(B), r(A)]); face([w(se), w(sw), r(A), r(B)]);
      face([w(sw), w(nw), r(A)]); face([w(ne), w(se), r(B)]);
    } else {
      face([w(nw), w(sw), r(B), r(A)]); face([w(se), w(ne), r(A), r(B)]);
      face([w(ne), w(nw), r(A)]); face([w(sw), w(se), r(B)]);
    }
    // the eaves: each slope carried on past its wall, down as steeply,
    // meeting its neighbours' at the corners where both hang out
    var e = R.eave || { n: 0, s: 0, w: 0, e: 0 };
    function eave(a, b, out, oa, ob, dx, dy) {
      if (!out) { return; }
      var ax = a[0] + dx * out - (b[0] - a[0] ? Math.sign(b[0] - a[0]) * oa : 0);
      var ay = a[1] + dy * out - (b[1] - a[1] ? Math.sign(b[1] - a[1]) * oa : 0);
      var bx = b[0] + dx * out + (b[0] - a[0] ? Math.sign(b[0] - a[0]) * ob : 0);
      var by = b[1] + dy * out + (b[1] - a[1] ? Math.sign(b[1] - a[1]) * ob : 0);
      face([w(a), w(b), [bx, by, z - out * k], [ax, ay, z - out * k]]);
    }
    eave(nw, ne, e.n, e.w, e.e, 0, -1);
    eave(sw, se, e.s, e.w, e.e, 0, 1);
    eave(nw, sw, e.w, e.n, e.s, -1, 0);
    eave(ne, se, e.e, e.n, e.s, 1, 0);
  }

  // ---- moving smoothly ---------------------------------------------------------
  // (asked for, 2026-10-01: "make sure there are nice animations for
  // everything")  A value of the view -- how far the walls are up, the
  // roof on, the labels showing, where it is looked at from -- is eased to
  // where it is wanted rather than put there, and a change that cannot be
  // eased (from above to walking round inside, say) fades from the old
  // picture to the new.  Asked to keep still, by the system, it does.
  function v3Still() { return typeof STILL !== "undefined" && STILL; }
  function v3Ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function v3Tween(key, to, ms, delay, done) {
    if (!V3) { return; }
    // (a big building does not rise off the paper or lie back down on it:
    // each step of the way was the whole building made again)
    if (key === "rise" && V3.scene !== "space" && v3Big()) { ms = 0; }
    var from = V3[key] === undefined ? to : V3[key];
    if (v3Still() || !ms || Math.abs(from - to) < 1e-6) {
      delete V3.tw[key];
      V3[key] = to; V3.dirty = true;
      if (done) { done(); }
      return;
    }
    V3.tw[key] = { from: from, to: to, t0: performance.now() + (delay || 0), ms: ms, done: done || null };
    V3.dirty = true;
  }
  function v3Tweening() {               // each eased value where it is by now
    var busy = false, now = performance.now();
    Object.keys(V3.tw).forEach(function (key) {
      var t = V3.tw[key], k = Math.max(0, Math.min(1, (now - t.t0) / t.ms));
      V3[key] = t.from + (t.to - t.from) * v3Ease(k);
      busy = true;                       // the last step drawn too, not left half-way
      if (k >= 1) { delete V3.tw[key]; if (t.done) { t.done(); } }
    });
    return busy;
  }
  function v3Hold() {                   // a hand on the view stops the camera's own moves
    ["pitch", "yaw", "scale", "panX", "panY"].forEach(function (k) { delete V3.tw[k]; });
  }
  function v3Fade(ms) {                 // from the picture now to whatever comes next
    if (!V3 || v3Still() || !V3.canvas.width) { return; }
    var snap = document.createElement("canvas");
    snap.width = V3.canvas.width; snap.height = V3.canvas.height;
    snap.getContext("2d").drawImage(V3.canvas, 0, 0);
    V3.fade = { img: snap, t0: performance.now(), ms: ms || 320 };
    V3.dirty = true;
  }

  // (2026-10-03: "for huge buildings too make it so it does not destroy my
  // computer ... make it so objects do not load in if they can not be seen
  // and or not in the room.  Also when hitting the 3d button also stop the
  // website from freezing")  The picture is made as steps, run all at once
  // here -- or, opening a big building, a slice at a time under the bar
  // (v3Open, 40-work.js).  What it is made of is kept while nothing it is
  // made from changes: turning the view round does not make it again.
  function v3Build() {
    var steps = v3BuildSteps(), r;
    do { r = steps.next(); } while (!r.done);
    return r.value;
  }
  // A big building: past this many shapes, what cannot be seen is not made
  // -- inside, under the roof; under the floor above; up the stairs from
  // the garden.
  var V3_BIG = 2000;
  function v3Big() { return hand.nodes.length > V3_BIG; }
  // What a picture was made of, the last few ways of looking at it.  Handed
  // on as copies: what comes after moves faces about (the land, 40-land.js).
  function v3KeptGet(key) {
    var list = V3.kept || (V3.kept = []);
    for (var i = 0; i < list.length; i++) {
      if (list[i].key === key) { var got = list.splice(i, 1)[0]; list.unshift(got); return got; }
    }
    return null;
  }
  function v3KeptPut(made) {
    var list = V3.kept || (V3.kept = []);
    list.unshift(made);
    if (list.length > 3) { list.length = 3; }
  }
  // (2026-10-04, "a stable 60fps") What a part adds to the scene -- a roof, a
  // house number, the wire from the street -- kept while what it is made from
  // is the same (the drawing and the view as v3BuildSteps keys them, the
  // house's settings, the land) and `extra` says the same: handed on as
  // copies, as the rest are.  Each was worked out afresh every time the
  // scene was made, sixty times a second.
  var V3_ADDED = {};
  function v3Added(name, faces, extra, add) {
    var kept = V3.kept && V3.kept[0], key = kept ? kept.key : null, house = typeof hand !== "undefined" && hand ? hand.house : null;
    var land = typeof TERR !== "undefined" && TERR && !TERR.off ? TERR.key || "" : "", K = V3_ADDED[name], i;
    if (key !== null && K && K.key === key && K.house === house && K.land === land && K.extra === extra) {
      for (i = 0; i < K.faces.length; i++) { faces.push(v3FaceCopy(K.faces[i])); }
      return;
    }
    var f0 = faces.length;
    add();
    V3_ADDED[name] = { key: key, house: house, land: land, extra: extra, faces: faces.slice(f0) };
    for (i = f0; i < faces.length; i++) { faces[i] = v3FaceCopy(faces[i]); }
  }
  function v3FaceCopy(f) {
    var c = Object.assign({}, f);
    if (f.mesh) { c.mesh = Object.assign({}, f.mesh); }
    c.src = f;                           // (what it is a copy of: its colors kept on that, gl3Faces)
    return c;
  }
  function* v3BuildSteps() {
    var faces = [], stand = [], spheres = [], rings = [], labels = [];
    if (V3.scene === "space") {
      v3Sky(spheres, rings, stand, labels);
      return { faces: faces, stand: stand, spheres: spheres, rings: rings, labels: labels };
    }
    // (the bar up before anything slow, under it: 40-work.js)
    if (v3Big()) { yield ["house", 0, "paint"]; }
    V3.picture = {};                     // this picture: what is asked once a picture is kept on it
    // Walking round inside a room: that floor, under its ceilings.  Out in
    // the garden: the whole house, roofed.  From above: the floors asked
    // for -- or, flat, the one -- roofed unless lifted off.
    var inside = V3.mode === "walk", indoors = inside && !!V3.inRoom, low = V3.low && !inside;
    // flat (2D), once the walls are down: one floor at a time, as drawn
    var flat = !inside && !!V3.flat && !!V3.flatDone;
    // Storeys (floorsOf, 38-walk.js): each node raised to its floor's height
    // and moved over the ground floor's spot; only the floor walked on, or
    // the floors up to the one asked for, are put up.
    var floors = floorsOf(), links = floorLinks(floors), endOf = {};
    links.forEach(function (pair) { endOf[pair[0].id] = "low"; endOf[pair[1].id] = "high"; });
    // (the flights between floors, for the holes over them: 40-climb.js)
    // (an escalator comes up through a well as a flight does: 40-items.js, 40-mall.js)
    var flightEnds = hand.nodes.filter(function (m) { return (m.kind === "i_stairs" || m.kind === "i_escalator") && endOf[m.id] && !((m.turn || 0) % 90); });
    function wellIn(room, end) {
      if ((room.turn || 0) % 90) { return null; }
      var s = flightEnds.filter(function (m) { return endOf[m.id] === end && insideArea(room, m.x, m.y); })[0];
      if (!s) { return null; }
      var q = turned(s), r = turned(room);
      return { x0: Math.max(room.x - r.w / 2, s.x - q.w / 2), x1: Math.min(room.x + r.w / 2, s.x + q.w / 2),
               y0: Math.max(room.y - r.h / 2, s.y - q.h / 2), y1: Math.min(room.y + r.h / 2, s.y + q.h / 2) };
    }
    // a room's floor or ceiling, as the rectangles round a hole in it
    function aroundWell(room, hole, z, up, how, extra) {
      var r = turned(room), X0 = room.x - r.w / 2, X1 = room.x + r.w / 2, Y0 = room.y - r.h / 2, Y1 = room.y + r.h / 2;
      [[X0, X1, Y0, hole.y0], [X0, X1, hole.y1, Y1], [X0, hole.x0, hole.y0, hole.y1], [hole.x1, X1, hole.y0, hole.y1]].forEach(function (b) {
        if (b[1] - b[0] < 0.5 || b[3] - b[2] < 0.5) { return; }
        var pts = [[b[0], b[2], z], [b[1], b[2], z], [b[1], b[3], z], [b[0], b[3], z]];
        faces.push(Object.assign({ pts: up ? pts : pts.reverse(), n: [0, 0, up ? 1 : -1], how: how }, extra));
      });
    }
    // Up off the paper the floors are where they are drawn, side by side,
    // and slide over the ground floor as the walls go up: stacked only once
    // the house stands, and side by side again laid flat, as on the paper.
    var stack = inside ? 1 : flat ? 0 : Math.max(0, Math.min(1, V3.rise === undefined ? 1 : V3.rise));
    if (stack < 1) {
      floors = floors.map(function (f) { return Object.assign({}, f, { dx: f.dx * stack, dy: f.dy * stack }); });
    }
    var show = inside ? (indoors ? (V3.myLevel || 0) : null) : V3.upTo;
    function shown(f) {
      if (!f) { return true; }
      if (inside) { return !indoors || f.level === show || (V3.flightUp !== undefined && f.level === V3.flightUp); }
      if (flat) { return true; }        // flat, every floor, side by side as drawn
      return show === null || show === undefined || f.level <= show;
    }
    var topLevel = floors.length ? floors[floors.length - 1].level : 0;
    var roofV = V3.roofV === undefined ? 1 : V3.roofV;
    var roofed = !low && !flat && (inside ? !indoors : show === null || show === undefined || show >= topLevel);
    // roofed and settled, from above: what is inside is not seen, so not drawn
    var hush = roofed && !inside && roofV > 0.999 && !V3.tw.roofV;
    var roomsAll = hand.nodes.filter(function (m) { return m.kind === "i_room"; });
    // What is where, filed by the squares of paper it stands over (listNear,
    // 38-walk.js): the room a spot is in, what stands under a lamp, the
    // doors and windows by a wall -- each asked of the few near it, not of
    // every shape in the building (a building of five hundred rooms took
    // seconds a picture)
    var roomsNear = listNear(roomsAll), allKept = null;
    function allNear() { return allKept || (allKept = listNear(hand.nodes)); }
    var openNear = listNear(hand.nodes.filter(function (m) { return WALK_DOORS[m.kind] || m.kind === "i_window"; }));
    function roomsAt(x, y, grow) { var g = Math.abs(grow || 0) + 1; return roomsNear.around(x - g, y - g, x + g, y + g); }
    function nearOf(n) { return allNear().near(n, 2); }
    function roomsHolding(n, grow) {
      return roomsAt(n.x, n.y, grow).filter(function (r) { return r !== n && insideArea(r, n.x, n.y, -grow); }).length;
    }
    // Whether a room on a floor further up, as shown, is over a spot on
    // floor f (seen from above, what is under it is not seen).
    var roomsOver = null;
    function coveredAbove(n, f) {
      if (!roomsOver) {
        var by = new Map();
        roomsAll.forEach(function (u) {
          var fu = floorOfNode(u);
          if (fu) { if (!by.has(fu)) { by.set(fu, []); } by.get(fu).push(u); }
        });
        roomsOver = [];
        by.forEach(function (list, fu) { roomsOver.push({ f: fu, near: listNear(list) }); });
      }
      var x = n.x + f.dx, y = n.y + f.dy;
      return roomsOver.some(function (o) {
        if (o.f.level <= f.level || !shown(o.f)) { return false; }
        var ux = x - o.f.dx, uy = y - o.f.dy;
        return o.near.around(ux, uy, ux, uy).some(function (u) { return insideArea(u, ux, uy); });
      });
    }
    var big = v3Big();
    // In a big building, what cannot be seen from here: from above, what a
    // floor further up is over; from the garden, what is in a room upstairs.
    function unseen(n) {
      var f = floorOfNode(n);
      if (!f) { return false; }
      if (!inside) { return coveredAbove(n, f); }
      if (!indoors) { return f.level !== 0 && roomsHolding(n, 0) > 0; }
      return false;
    }
    // the walls of a room go up to the floor over it, where there is one
    function storeyOf(room) {
      var f = floorOfNode(room), next = f && floorOver(floors, f);
      return next ? next.z - f.z : 0;
    }
    function wallTop(room) {
      var c = ceilOf(room) * FLOOR_PX;
      // (up to the floor over it while a flight is climbed: between the two, the sky showed, 40-climb.js)
      return indoors && V3.flightUp === undefined ? c : Math.max(c, storeyOf(room));
    }
    // the parts of a wall with outdoors beyond them: the rest is inside
    function outsideOnly(room) {
      var hw = room.w / 2, hh = room.h / 2;
      return function (edge, a, b) {
        var runs = [], start = null;
        for (var at = a; ; at = Math.min(b, at + 4)) {
          var lx = edge === "left" ? -hw - 6 : edge === "right" ? hw + 6 : -hw + at;
          var ly = edge === "top" ? -hh - 6 : edge === "foot" ? hh + 6 : -hh + at;
          var pt = v3Local(room, lx, ly);
          var open = !roomsAt(pt[0], pt[1], 0).some(function (o) { return o !== room && insideArea(o, pt[0], pt[1]); });
          if (open && start === null) { start = at; }
          if (!open && start !== null) { runs.push([start, at]); start = null; }
          if (at >= b) { break; }
        }
        if (start !== null) { runs.push([start, b]); }
        return runs;
      };
    }
    function floorOfNode(n) {
      if (n.kind === "i_floor") { return floors.filter(function (o) { return o.n === n; })[0] || null; }
      if (n.kind === "i_lot") { return null; }
      return floorAt(floors, n.x, n.y);
    }
    function ceilAt(n) {
      var room = roomsAt(n.x, n.y, 0).filter(function (m) { return m !== n && insideArea(m, n.x, n.y); })
        .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
      return ceilOf(room || n);
    }
    // the height of the tallest thing under a spot, for what stands on it
    function under(n) {
      var most = 0;
      allNear().around(n.x, n.y, n.x, n.y).forEach(function (m) {
        var high = V3_HIGH[m.kind] !== undefined ? pieceHigh(m) : m.kind === "i_shelf" ? wallHang(m)[1] : undefined;
        if (m === n || high === undefined || LIES_FLAT[m.kind] || !insideArea(m, n.x, n.y)) { return; }
        most = Math.max(most, high);
      });
      return most;
    }
    function roundOrBox(n, z0, z1, how) {
      if (V3_ROUND[n.kind]) {
        var base = [];
        for (var r = 0; r < 12; r++) {
          var t = r / 12 * Math.PI * 2;
          base.push(v3Local(n, Math.cos(t) * n.w / 2, Math.sin(t) * n.h / 2));
        }
        v3Prism(faces, base, z0, z1, { piece: true, color: how.color, edge: how.edge });
        faces.push({ pts: [[-n.w / 2, -n.h / 2], [n.w / 2, -n.h / 2], [n.w / 2, n.h / 2], [-n.w / 2, n.h / 2]]
                       .map(function (p) { var q = v3Local(n, p[0], p[1]); return [q[0], q[1], z1 + 0.2]; }),
                     n: [0, 0, 1], how: { decal: true }, top: true, tex: how.tex, texAt: [0, 1, 3], clipRound: base });
      } else {
        v3Box(faces, n, -n.w / 2, n.w / 2, -n.h / 2, n.h / 2, z0, z1, how);
      }
    }
    // Each thing in its own colors (simLook, 37-board.js): a room's floor
    // its fill, its walls a pale tint of its outline and their tops the
    // outline itself; a piece of furniture its fill, edged in its outline.
    function wallsOf(n) {
      var look = simLook(n);
      return { wall: true, color: v3Mix(look.line, simSheet(), 0.8), edge: look.line };
    }
    // Roofed, from above, what is inside is seen only through the glass:
    // the rooms with a window are built inside -- floor, walls, ceiling and
    // what is in them -- and the rest only from out of doors (2026-10-01:
    // "make sure you can see in through the windows accurate to walls,
    // ceilings, floors"; it was the grass under the house that showed)
    var glazed = hush ? roomsAll.filter(function (r) {
      return openNear.near(r, 16).some(function (w) { return (w.kind === "i_window" || w.kind === "i_slide") && insideArea(r, w.x, w.y, -14); });
    }) : [];
    function seenIn(r) { return glazed.indexOf(r) >= 0; }
    function putNode(n) {
      var look = simLook(n);
      if (hush && n.kind !== "i_room" && !isArea(n.kind)) {
        var holders = roomsAt(n.x, n.y, 12).filter(function (r) { return r !== n && insideArea(r, n.x, n.y, WALK_DOORS[n.kind] ? -12 : 0); });
        if ((WALK_DOORS[n.kind] ? holders.length >= 2 : holders.length >= 1) && !holders.some(seenIn)) { return; }
        // a big building: through its windows, its rooms -- floor, walls,
        // ceiling -- and what is in them only once the roof is off, or walking in
        if (big && !WALK_DOORS[n.kind] && n.kind !== "i_window" && holders.length >= 1) { return; }
      }
      if (big && !hush && n.kind !== "i_room" && !isArea(n.kind) && !WALK_DOORS[n.kind] && n.kind !== "i_window" && unseen(n)) { return; }
      if (n.kind === "i_lot") {                  // the ground the house stands on
        faces.push({ pts: [[-n.w / 2, -n.h / 2], [n.w / 2, -n.h / 2], [n.w / 2, n.h / 2], [-n.w / 2, n.h / 2]]
                       .map(function (p) { var q = v3Local(n, p[0], p[1]); return [q[0], q[1], -1]; }),
                     n: [0, 0, 1], how: { floor: true, color: look.fill, edge: look.line }, floor: true, ground: true });
        return;
      }
      if (n.kind === "i_floor" || n.kind === "i_zone") { return; }
      // made in 3D, by WebGL (38-models.js): a sofa of cushions, not a box
      if (typeof v3ModelPut === "function" && v3ModelPut(faces, n, under, ceilAt, nearOf)) { return; }
      if (ON_TOP[n.kind] && V3_ON[n.kind]) {
        var z0 = under(n) * FLOOR_PX;
        roundOrBox(n, z0, z0 + pieceHigh(n) * FLOOR_PX, { piece: true, tex: v3Texture(n), color: look.fill, edge: look.line });
        return;
      }
      if (FROM_CEILING[n.kind]) {
        // hung from the ceiling on its cord (or its pole), as far down as
        // such a thing hangs
        var hi = ceilAt(n) * FLOOR_PX, drop = hangDrop(n);
        var bottom = Math.min(Math.max(hi - drop[0] * FLOOR_PX, (under(n) + 0.08) * FLOOR_PX), hi - 0.12 * FLOOR_PX);
        var body = Math.min(bottom + drop[1] * FLOOR_PX, hi - 0.03 * FLOOR_PX);
        roundOrBox(n, bottom, body, { piece: true, tex: v3Texture(n), color: look.fill, edge: look.line });
        v3Box(faces, n, -1, 1, -1, 1, body, hi, { piece: true, color: look.line, edge: look.line });
        return;
      }
      if (n.kind === "i_fence") {
        v3Box(faces, n, -n.w / 2, n.w / 2, -2, 2, 0, 1.1 * FLOOR_PX, { piece: true, color: look.fill, edge: look.line });
        return;
      }
      if (BETWEEN_FLOORS[n.kind] && endOf[n.id] === "high") {
        // the top of a flight: the way down, with a rail along it
        if (n.kind === "i_elevator") {
          // (the car, lined, its buttons by its doors: 40-climb.js)
          if (typeof liftCarFaces === "function") { liftCarFaces(faces, n, ceilAt(n) * FLOOR_PX); }
          else { v3Box(faces, n, -n.w / 2, n.w / 2, -n.h / 2, n.h / 2, 0, ceilAt(n) * FLOOR_PX, { piece: true, glass: true, edge: look.line }); }
        } else if (n.kind === "i_spiral") {
          v3Box(faces, n, -2, 2, -2, 2, 0, 1.0 * FLOOR_PX, { piece: true, color: look.line, edge: look.line });
        } else {
          v3Box(faces, n, -n.w / 2, -n.w / 2 + 2, -n.h / 2, n.h / 2, 0, 1.0 * FLOOR_PX, { piece: true, color: look.fill, edge: look.line });
          v3Box(faces, n, n.w / 2 - 2, n.w / 2, -n.h / 2, n.h / 2, 0, 1.0 * FLOOR_PX, { piece: true, color: look.fill, edge: look.line });
          if (n.kind === "i_stairs") {                // (and across the end away from the way down: 40-climb.js)
            v3Box(faces, n, -n.w / 2, n.w / 2, n.h / 2 - 2, n.h / 2, 0, 1.0 * FLOOR_PX, { piece: true, color: look.fill, edge: look.line });
          }
        }
        return;
      }
      if (n.kind === "i_spiral" || n.kind === "i_elevator") {
        var rise = (endOf[n.id] === "low" ? levelRise(n) : ceilAt(n) * FLOOR_PX);
        if (n.kind === "i_elevator") {
          if (typeof liftCarFaces === "function") { liftCarFaces(faces, n, ceilAt(n) * FLOOR_PX); }
          else { v3Box(faces, n, -n.w / 2, n.w / 2, -n.h / 2, n.h / 2, 0, ceilAt(n) * FLOOR_PX, { piece: true, glass: true, edge: look.line }); }
        } else {
          v3Box(faces, n, -2, 2, -2, 2, 0, rise, { piece: true, color: look.line, edge: look.line });
          for (var tr = 0; tr < 12; tr++) {
            var ang = tr / 12 * Math.PI * 2, step = { kind: n.kind, x: n.x + Math.cos(ang) * n.w / 4, y: n.y + Math.sin(ang) * n.h / 4,
                                                        turn: ang * 180 / Math.PI, w: n.w / 2, h: n.h / 5 };
            v3Box(faces, step, -step.w / 2, step.w / 2, -step.h / 2, step.h / 2, rise * tr / 12, rise * tr / 12 + 0.06 * FLOOR_PX,
                  { piece: true, color: look.fill, edge: look.line });
          }
        }
        return;
      }
      if (n.kind === "i_room") {
        var T = Math.max(1, Math.min(6, Math.min(n.w, n.h) * 0.06)), walls = { how: wallsOf(n) };
        var corners = [[-n.w / 2, -n.h / 2], [n.w / 2, -n.h / 2], [n.w / 2, n.h / 2], [-n.w / 2, n.h / 2]];
        // (every room's floor, roofed or not: one face, and where anything
        // was ever seen into a room without one, it was a black hole)
        var wellUp = wellIn(n, "high");
        if (wellUp) { aroundWell(n, wellUp, 0, true, { floor: true, color: look.fill, edge: look.line, room: n }, { floor: true }); }
        else {
          faces.push({ pts: corners.map(function (p) { var q = v3Local(n, p[0], p[1]); return [q[0], q[1], 0]; }),
                       n: [0, 0, 1], how: { floor: true, color: look.fill, edge: look.line, room: n }, floor: true });
        }
        if (inside || (hush && seenIn(n))) {   // overhead, seen from under it (or through a window)
          var up = ceilOf(n) * FLOOR_PX, wellDown = wellIn(n, "low");
          if (wellDown) {
            aroundWell(n, wellDown, up, false, { ceiling: true, color: v3Mix(simSheet(), look.line, 0.05), edge: look.line }, { ceiling: true });
          } else {
            faces.push({ pts: corners.slice().reverse().map(function (p) { var q = v3Local(n, p[0], p[1]); return [q[0], q[1], up]; }),
                         n: [0, 0, -1], how: { ceiling: true, color: v3Mix(simSheet(), look.line, 0.05), edge: look.line },
                         ceiling: true });
          }
          // and over it, unseen, what throws its shadow for it: the sun's
          // view could not tell the top of a wall from the ceiling just over
          // it, and let a line of sunlight in along every wall
          if (inside) {
            faces.push({ pts: corners.map(function (p) { var q = v3Local(n, p[0], p[1]); return [q[0], q[1], up + 0.3 * FLOOR_PX]; }),
                         n: [0, 0, 1], how: { ghost: true, caster: true } });
          }
        }
        var wallsUp = wallTop(n), keepOut = hush && !seenIn(n) ? outsideOnly(n) : null;
        // whether the next room along carries a wall on past this one's end (0 its start, 1 its end)
        var wallGoesOn = function (r, edge, T, which) {
          var hw = r.w / 2, hh = r.h / 2, d = T / 2, e = 1.2, lx, ly;
          if (edge === "top") { ly = -hh + d; lx = which ? hw + e : -hw - e; }
          else if (edge === "foot") { ly = hh - d; lx = which ? hw + e : -hw - e; }
          else if (edge === "left") { lx = -hw + d; ly = which ? hh + e : -hh - e; }
          else { lx = hw - d; ly = which ? hh + e : -hh - e; }
          var p = v3Local(r, lx, ly);
          return roomsAt(p[0], p[1], 2).some(function (o) { return o !== r && o.kind === "i_room" && insideArea(o, p[0], p[1], -1.5); });
        };
        if (hush) { walls.how.noTop = true; }
        // (the doors and windows near this room, once: every room's four walls
        // tried every door and window in the house, 4 ms a picture walking a big one)
        var reach = Math.max(n.w, n.h) / 2 + 160;
        var nearBy = openNear.around(n.x - reach, n.y - reach, n.x + reach, n.y + reach).filter(function (m) {
          return (WALK_DOORS[m.kind] || m.kind === "i_window") && Math.abs(m.x - n.x) <= reach && Math.abs(m.y - n.y) <= reach;
        });
        ["top", "foot", "left", "right"].forEach(function (edge) {
          var holes = [];
          nearBy.forEach(function (m) {
            if (WALK_DOORS[m.kind] && doorLocked(m) && false) { return; }
            var hole = v3Hole(n, edge, T, m);
            if (hole) { hole.door = m.kind !== "i_window"; hole.n = m; holes.push(hole); }
          });
          holes.sort(function (p, q) { return p.a - q.a; });
          // (a wall taken out between two rooms, and the beam over the opening: 39-inside.js)
          var keepHere = typeof wallKeepOpen === "function" ? wallKeepOpen(n, edge, keepOut) : keepOut;
          v3Wall(faces, n, edge, T, holes, walls.how, low, wallsUp, keepHere, [wallGoesOn(n, edge, T, 0), wallGoesOn(n, edge, T, 1)]);
          if (!low && typeof wallBeams === "function") { wallBeams(faces, n, edge); }
        });
      } else if (n.kind === "i_wall") {
        // (a wall as tall as it was made: a desk's screen, 40-kinds.js)
        v3Box(faces, n, -n.w / 2, n.w / 2, -n.h / 2, n.h / 2, 0,
              (low ? Math.min(1.1, n.tall || 1.1) : n.tall || WALL_TALL) * FLOOR_PX, n.screen ? { piece: true, color: "#8f969b", edge: "#5d6166", pat: 21 } : wallsOf(n));
      } else if (WALK_DOORS[n.kind]) {
        if (typeof wallDoorGone === "function" && wallDoorGone(n, roomsAt(n.x, n.y, 30))) { return; }   // its wall taken out
        v3Door(faces, n, V3.doorAt[n.id] !== undefined ? V3.doorAt[n.id] : (typeof doorSwingTo === "function" ? doorSwingTo(n) : doorIsOpen(n) ? 90 : 0));
      } else if (V3_WALL[n.kind]) {
        // on the wall: its back to it, its front to the room, at its height
        // as high as it was hung -- and over whatever stands against the
        // wall under it, where that is taller than where it would start
        var hang = wallHang(n), clear = 0;
        nearOf(n).forEach(function (m) {
          if (m === n || V3_HIGH[m.kind] === undefined || LIES_FLAT[m.kind] || !boxesOverlap(m, n)) { return; }
          clear = Math.max(clear, pieceHigh(m) + 0.06);
        });
        if (clear > hang[0] && hang[1] - hang[0] + clear <= ceilAt(n) - 0.02) { hang = [clear, clear + hang[1] - hang[0]]; }
        var front = v3FrontPic(n, hang);
        // the way its front faces: seen from behind its wall, it is not seen
        var ft = (n.turn || 0) * Math.PI / 180, facing = [-Math.sin(ft), Math.cos(ft), 0];
        if (n.kind === "i_shelf") {
          v3Box(faces, n, -n.w / 2, n.w / 2, -n.h / 2, n.h / 2, hang[0] * FLOOR_PX, hang[1] * FLOOR_PX,
                { piece: true, hang: facing, at: [n.x, n.y, hang[1] * FLOOR_PX], color: look.fill, edge: look.line });
          // and the books on it
          [[-34, -30, 0.24], [-30, -26, 0.22], [-26, -22, 0.25], [-22, -18, 0.2], [-17, -13, 0.23], [-13, -9, 0.21]]
            .forEach(function (b) {
              v3Box(faces, n, b[0] * n.w / 80, b[1] * n.w / 80, -n.h / 2 + 2, n.h / 2 - 3,
                    hang[1] * FLOOR_PX, (hang[1] + b[2]) * FLOOR_PX,
                    { piece: true, hang: facing, at: [n.x, n.y, hang[1] * FLOOR_PX], color: look.fill, edge: look.line });
            });
        } else {
          v3Box(faces, n, -n.w / 2, n.w / 2, -n.h / 2, n.h / 2, hang[0] * FLOOR_PX, hang[1] * FLOOR_PX,
                { piece: true, front: front, dark: n.kind === "i_walltv", hang: facing,
                  at: [n.x, n.y, (hang[0] + hang[1]) / 2 * FLOOR_PX], color: look.fill, edge: look.line });
        }
      } else if (n.kind === "i_stairs") {
        // a flight of steps, each a tread higher than the last, up to the
        // floor above where it leads there
        var treads = 10, rise = (endOf[n.id] === "low" ? levelRise(n) : ceilAt(n) * FLOOR_PX) / treads;
        for (var k = 0; k < treads; k++) {
          var y1 = n.h / 2 - k * n.h / treads, y0 = y1 - n.h / treads;
          v3Box(faces, n, -n.w / 2, n.w / 2, y0, y1, 0, rise * (k + 1), { piece: true, color: look.fill, edge: look.line });
        }
      } else if (n.kind === "i_closetrod") {
        // a rail of clothes: its two posts, the rail across, and what
        // hangs from it, longer and shorter, lighter and darker
        var railTall = pieceHigh(n) * FLOOR_PX, rw = n.w / 2, rd = n.h / 2;
        var post = { piece: true, color: look.line, edge: look.line };
        v3Box(faces, n, -rw, -rw + 2, -1, 1, 0, railTall, post);
        v3Box(faces, n, rw - 2, rw, -1, 1, 0, railTall, post);
        v3Box(faces, n, -rw, rw, -0.8, 0.8, railTall - 4, railTall - 2, post);
        var hung = Math.max(3, Math.floor((n.w - 10) / 9));
        for (var g = 0; g < hung; g++) {
          var gx = -rw + 5 + (g + 0.5) * (n.w - 10) / hung, drop = [0.95, 0.7, 1.05, 0.8, 0.6, 1.0][g % 6];
          v3Box(faces, n, gx - 1.5, gx + 1.5, -rd + 5, rd - 5, Math.max(4, railTall - 5 - drop * FLOOR_PX), railTall - 5,
                { piece: true, color: v3Mix(look.fill, look.line, [0.1, 0.32, 0.18, 0.45, 0.25, 0.05][g % 6]), edge: look.line });
        }
      } else if (n.kind === "i_closetshelves") {
        // open shelves: the sides, the back against the wall, a shelf every
        // 40 cm, and piles of folded clothes on them
        var shTall = pieceHigh(n) * FLOOR_PX, sw = n.w / 2, sd = n.h / 2;
        var board = { piece: true, color: look.fill, edge: look.line };
        v3Box(faces, n, -sw, -sw + 1.5, -sd, sd, 0, shTall, board);
        v3Box(faces, n, sw - 1.5, sw, -sd, sd, 0, shTall, board);
        v3Box(faces, n, -sw, sw, -sd, -sd + 1.2, 0, shTall, board);
        for (var lv = 0; lv * 0.4 * FLOOR_PX < shTall - 1.5; lv++) {
          var sz = lv * 0.4 * FLOOR_PX;
          v3Box(faces, n, -sw + 1.5, sw - 1.5, -sd + 1.2, sd, sz, sz + 1.5, board);
          if (sz + 0.3 * FLOOR_PX >= shTall) { continue; }
          [-0.24, 0.24].forEach(function (at, pi) {
            var px = at * n.w, high = (0.12 + 0.05 * ((lv + pi) % 3)) * FLOOR_PX;
            v3Box(faces, n, px - n.w * 0.17, px + n.w * 0.17, -sd + 4, sd - 4, sz + 1.5, sz + 1.5 + high,
                  { piece: true, color: v3Mix(look.fill, look.line, 0.12 + 0.12 * ((lv + pi) % 3)), edge: look.line });
          });
        }
        v3Box(faces, n, -sw + 1.5, sw - 1.5, -sd + 1.2, sd, shTall - 1.5, shTall, board);
      } else if (V3_HIGH[n.kind] !== undefined) {
        var tall = pieceHigh(n) * FLOOR_PX, tex = v3Texture(n);
        if (V3_ROUND[n.kind]) {
          var base = [];
          for (var r = 0; r < 12; r++) {
            var t = r / 12 * Math.PI * 2;
            base.push(v3Local(n, Math.cos(t) * n.w / 2, Math.sin(t) * n.h / 2));
          }
          v3Prism(faces, base, 0, tall, { piece: true, color: look.fill, edge: look.line });
          // its drawing on top, on a square the size of the round one
          faces.push({ pts: [[-n.w / 2, -n.h / 2], [n.w / 2, -n.h / 2], [n.w / 2, n.h / 2], [-n.w / 2, n.h / 2]]
                         .map(function (p) { var q = v3Local(n, p[0], p[1]); return [q[0], q[1], tall + 0.2]; }),
                       n: [0, 0, 1], how: { decal: true }, top: true, tex: tex, texAt: [0, 1, 3], clipRound: base });
        } else {
          v3Box(faces, n, -n.w / 2, n.w / 2, -n.h / 2, n.h / 2, 0, tall, { piece: true, tex: tex, color: look.fill, edge: look.line });
        }
      } else if (isFigure(n.kind) || n.kind === "actor") {
        if (walkAt && simNow && walkAt.id === n.id) { return; }   // out walking
        if (inside && V3.me && V3.me.as === n.id) { return; }     // it is you
        // a person, standing as they were put: a body, where WebGL draws one (40-tour.js)
        if (isPerson(n) && typeof peopleBody === "function" && typeof modelsOn === "function" && modelsOn()) {
          peopleBody(faces, n, n.x, n.y, 0, peopleFacing(n), 0, look);
          return;
        }
        stand.push({ x: n.x, y: n.y, z: 0, tall: pieceHigh(n) * FLOOR_PX,
                     img: v3Figure(n.kind === "actor" ? "i_person" : n.kind, look) });
      }
    }
    // how high a flight climbs: to the floor of the storey above
    function levelRise(n) {
      var f = floorAt(floors, n.x, n.y), next = f && floorOver(floors, f);
      return f && next ? next.z - f.z : ceilAt(n) * FLOOR_PX;
    }
    // everything put up, each on its own floor -- or, where nothing it is
    // made from has changed since (the view only turned), as it was then;
    // the doors put up afresh each picture, swinging as they do
    var labelsOn = (V3.labelV === undefined ? 1 : V3.labelV) > 0.01;
    var keyNow = [JSON.stringify(hand.nodes), JSON.stringify(hand.links), JSON.stringify(style), V3.scene, V3.mode,
                  V3.inRoom ? V3.inRoom.id : "", indoors ? V3.myLevel || 0 : "", low ? 1 : 0, flat ? 1 : 0, stack.toFixed(3),
                  String(show), hush ? 1 : 0, roofed ? 1 : 0, labelsOn ? 1 : 0, big ? 1 : 0,
                  typeof modelsOn === "function" && modelsOn() ? 1 : 0, walkAt && simNow ? walkAt.id : "",
                  inside && V3.me ? V3.me.as || "" : "", V3.flightUp === undefined ? "" : V3.flightUp].join("|");
    var kept = v3KeptGet(keyNow);
    function putUp(n) {
      var f = floorOfNode(n);
      var f0 = faces.length, s0 = stand.length;
      putNode(n);
      // what each face is a face of: for what it is covered in, and for
      // what a body walking round bumps into (v3Solids)
      for (var t = f0; t < faces.length; t++) { faces[t].node = n; }
      if (!f || (!f.dx && !f.dy && !f.z)) { return; }
      var moved = [];
      for (var i = f0; i < faces.length; i++) {
        faces[i].pts = faces[i].pts.map(function (q) { return [q[0] + f.dx, q[1] + f.dy, q[2] + f.z]; });
        var how = faces[i].how;
        if (how && how.at && moved.indexOf(how) < 0) {
          moved.push(how);
          how.at = [how.at[0] + f.dx, how.at[1] + f.dy, how.at[2] + f.z];
        }
        if (faces[i].clipRound) {
          faces[i].clipRound = faces[i].clipRound.map(function (q) { return [q[0] + f.dx, q[1] + f.dy]; });
        }
      }
      for (var j = s0; j < stand.length; j++) { stand[j].x += f.dx; stand[j].y += f.dy; stand[j].z += f.z; }
    }
    if (!kept) {
      var all = hand.nodes, made = { key: keyNow, faces: null, stand: null, labels: null, doors: [] };
      for (var ni = 0; ni < all.length; ni++) {
        var node = all[ni];
        if (!shown(floorOfNode(node))) { continue; }
        if (WALK_DOORS[node.kind]) { made.doors.push(node); continue; }
        putUp(node);
        if (ni % 40 === 39) { yield [big && !hush ? "models" : "house", (ni + 1) / all.length]; }
      }
      made.faces = faces; made.stand = stand;
      // the names of things: rooms, furniture, people, out in the garden too
      if (labelsOn) { made.labels = yield* v3Names(); } else { made.labels = []; }
      kept = made;
      v3KeptPut(made);
    }
    faces = kept.faces.map(v3FaceCopy);
    stand = kept.stand.map(function (s) { return Object.assign({}, s); });
    labels = kept.labels.map(function (l) { return Object.assign({}, l); });
    // (a door that has not swung since the last picture: put in as it was
    // then, not built again -- its faces copies, as the rest are, so the
    // picture keeps their corners too; a tower's every door was built and
    // joined in again every picture walking round, 2026-10-03)
    var doorsWas = kept.doorFaces || (kept.doorFaces = {});
    kept.doors.forEach(function (n) {
      var at = V3.doorAt[n.id], was = doorsWas[n.id];
      if (was && was.at === at && was.n === n) { Array.prototype.push.apply(faces, was.faces.map(v3FaceCopy)); return; }
      var d0 = faces.length;
      putUp(n);
      var mine = faces.slice(d0);
      doorsWas[n.id] = { at: at, n: n, faces: mine };
      for (var dt = d0; dt < faces.length; dt++) { faces[dt] = v3FaceCopy(faces[dt]); }
    });
    if (walkAt && simNow) {
      var walking = walkAt.id ? nodeById(walkAt.id) : null, wf = floorAt(floors, walkAt.x, walkAt.y);
      if (shown(wf) && !(hush && roomsHolding(walkAt, 0))) {
        var wx = walkAt.x + (wf ? wf.dx : 0), wy = walkAt.y + (wf ? wf.dy : 0), wz = wf ? wf.z : 0;
        var asBody = (!walking || isPerson(walking) || walkAt.kind === "actor") && typeof peopleBody === "function" &&
                     typeof modelsOn === "function" && modelsOn();
        if (asBody) {
          // walking: facing the way they go, a step on with every bit of the way
          var was = V3.walkerAt, moved = was && was.id === walkAt.id ? Math.hypot(wx - was.x, wy - was.y) : 0;
          var headW = moved > 0.5 ? Math.atan2(wy - was.y, wx - was.x) : (was && was.id === walkAt.id ? was.head : Math.PI / 2);
          var phaseW = ((was && was.id === walkAt.id ? was.phase : 0) + moved / (0.36 * FLOOR_PX)) % (Math.PI * 2);
          V3.walkerAt = { id: walkAt.id, x: wx, y: wy, head: headW, phase: phaseW };
          peopleBody(faces, walking || { kind: "i_person", id: 1 }, wx, wy, wz, headW, phaseW, walking ? simLook(walking) : null);
          // (its green ring under it still: the one walking)
          stand.push({ x: wx, y: wy, z: wz, tall: PERSON_TALL * FLOOR_PX, img: null, walker: true, ringOnly: true });
        } else {
          stand.push({ x: wx, y: wy, z: wz, tall: (walking ? pieceHigh(walking) : PERSON_TALL) * FLOOR_PX,
                       img: v3Figure(walkAt.kind, walking ? simLook(walking) : null), walker: true });
        }
      }
    }
    // the roof, settling on or lifting off
    // (a tall building's windows in rows: where a floor has none in a row's place, the same
    // window seen from outside, the wall whole inside -- 40-facade.js)
    if (!low && typeof fcPanels === "function" && hand.nodes.some(function (w) { return w.facade; })) {
      v3Added("facade", faces, String(show), function () { fcPanels(faces, floors, shown); });
    }
    if (roofed && roofV > 0.01) {
      v3Added("roof", faces, roofV + "|" + (V3.tw.roofV ? 1 : 0), function () {
        roofPlan(floors, show, wallTop).forEach(function (R) {
          var look = simLook(R.room);
          roofFaces(faces, R, (1 - roofV) * 2.5 * FLOOR_PX,
                    { roof: true, color: v3Mix(look.line, simSheet(), 0.55), edge: look.line, room: R.room,
                      alpha: roofV, late: roofV < 0.999 || !!V3.tw.roofV });
        });
      });
    }
    function* v3Names() {
      var said = [], all = hand.nodes;
      for (var li = 0; li < all.length; li++) {
        if (li % 200 === 199) { yield ["scene", (li + 1) / all.length]; }
        var one = nameOf(all[li]);
        if (one) { said.push(one); }
      }
      return said;
    }
    function nameOf(n) {
        var f = floorOfNode(n), room = n.kind === "i_room";
        if (!shown(f) || (isArea(n.kind) && !room) || NO_LABEL[n.kind]) { return null; }
        // (a part of another room, 40-oddrooms.js: named once, over its main part)
        if (room && n.partOf !== undefined) { return null; }
        var inRoom = room ? null : roomsAt(n.x, n.y, 0).filter(function (r) { return insideArea(r, n.x, n.y); })[0] || null;
        // from above, what has a floor over it is under that floor, not seen
        if (!inside && f && coveredAbove(n, f)) { return null; }
        if (inside) {
          if (room) { return null; }                  // the room is named at the top
          if (indoors ? inRoom !== V3.inRoom : !!inRoom) { return null; }
        } else if (hush && !room && inRoom) { return null; }
        var z, text;
        if (room) {
          text = roomLabel(n) || kindName("i_room");
          z = hush ? wallTop(n) + 0.6 * FLOOR_PX : 0.15 * FLOOR_PX;
        } else {
          text = String(n.text || "").split("\n")[0].trim() || labelName(n.kind);
          if (isFigure(n.kind) || n.kind === "actor") { z = pieceHigh(n) + 0.3; }
          else if (V3_WALL[n.kind]) { z = wallHang(n)[1] + 0.2; }
          else if (FROM_CEILING[n.kind]) { z = ceilAt(n) - hangDrop(n)[0] - 0.15; }
          else if (ON_TOP[n.kind]) { z = under(n) + pieceHigh(n) + 0.2; }
          else if (V3_HIGH[n.kind] !== undefined) { z = pieceHigh(n) + 0.25; }
          else { z = 0.8; }
          z *= FLOOR_PX;
        }
        return { x: n.x + (f ? f.dx : 0), y: n.y + (f ? f.dy : 0), z: z + (f ? f.z : 0), text: text, room: room };
    }
    return { faces: faces, stand: stand, spheres: spheres, rings: rings, labels: labels };
  }

  // Space: what goes round what (orbitPlan, 39-orbit.js) -- each body a
  // ball the size it is drawn, its path a ring round what it goes round,
  // and the rest standing pictures, where they are now if it is running.
  function v3Sky(spheres, rings, stand, labels) {
    var sky = typeof orbitPlan === "function" ? orbitPlan() : { bodies: [], others: [] };
    sky.bodies.forEach(function (b) {
      var at = orbitAt[b.n.id] || { x: b.n.x, y: b.n.y };
      spheres.push({ x: at.x, y: at.y, z: 0, r: b.r, sun: b.sun, kind: b.n.kind, look: simLook(b.n) });
      labels.push({ x: at.x, y: at.y, z: b.r + 8, text: String(b.n.text || "").split("\n")[0].trim() || kindName(b.n.kind) });
      if (b.around) {
        var mid = orbitAt[b.around.id] || { x: b.around.x, y: b.around.y };
        rings.push({ x: mid.x, y: mid.y, r: b.dist });
      }
    });
    sky.others.forEach(function (n) {
      var at = orbitAt[n.id] || { x: n.x, y: n.y };
      stand.push({ x: at.x, y: at.y, z: 40, tall: 60, img: v3Figure(n.kind, simLook(n)) });
      labels.push({ x: at.x, y: at.y, z: 110, text: String(n.text || "").split("\n")[0].trim() || kindName(n.kind) });
    });
  }

  // ---- pictures, for the tops, the fronts, and those standing ----------------
  var v3Pics = {};
  function v3Pic(key, svg, w, h) {
    if (v3Pics[key]) { return v3Pics[key]; }
    var img = new Image();
    var pic = v3Pics[key] = { img: img, ok: false, w: w, h: h, key: key };
    img.onload = function () { pic.ok = true; if (V3) { V3.dirty = true; } };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    return pic;
  }
  function v3Texture(n) {
    var w = Math.max(8, Math.round(n.w)), h = Math.max(8, Math.round(n.h)), k = 2, look = simLook(n);
    var art = iconArt(n.kind, w / 2, h / 2, w, h, look.fill)
      .replace(/class="inked" fill="#000000"/g, 'class="inked" fill="' + look.line + '"')
      .replace(/class="gap" fill="[^"]*"/g, 'class="gap" fill="' + simSheet() + '"');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * k + '" height="' + h * k +
              '" viewBox="0 0 ' + w + " " + h + '"><g stroke="' + look.line + '" stroke-width="1.3" ' +
              'fill="none" stroke-linecap="round" stroke-linejoin="round">' + art + "</g></svg>";
    return v3Pic("t|" + n.kind + "|" + w + "x" + h + "|" + look.line + look.fill, svg, w, h);
  }
  // The front of something hung on a wall, as it is seen from the room.
  function v3FrontPic(n, hang) {
    var w = Math.max(8, Math.round(n.w)), h = Math.max(6, Math.round((hang[1] - hang[0]) * FLOOR_PX));
    var look = simLook(n), ink = look.line, sheet = look.fill, art = "";
    function R(x, y, rw, rh, fill) {
      return '<rect x="' + x + '" y="' + y + '" width="' + rw + '" height="' + rh + '" fill="' + (fill || "none") + '"/>';
    }
    switch (n.kind) {
      case "i_picture":
        art = R(1, 1, w - 2, h - 2, sheet) + R(4, 4, w - 8, h - 8) +
              '<path d="M4 ' + (h - 4) + ' L' + (w * 0.32) + " " + (h * 0.42) + " L" + (w * 0.5) + " " + (h * 0.62) +
              " L" + (w * 0.68) + " " + (h * 0.35) + " L" + (w - 4) + " " + (h - 4) + '"/>' +
              '<circle cx="' + (w * 0.78) + '" cy="' + (h * 0.3) + '" r="' + Math.min(w, h) * 0.08 + '"/>';
        break;
      case "i_mirror":
        art = R(1, 1, w - 2, h - 2, sheet) + R(3.5, 3.5, w - 7, h - 7) +
              '<path d="M' + w * 0.25 + " " + h * 0.2 + " L" + w * 0.45 + " " + h * 0.08 +
              " M" + w * 0.25 + " " + h * 0.35 + " L" + w * 0.6 + ' 6"/>';
        break;
      case "i_walltv":
        art = R(1, 1, w - 2, h - 2, ink) + R(4, 4, w - 8, h - 8, v3Mix(ink, sheet, 0.12));
        break;
      case "i_wallclock":
        art = '<circle cx="' + w / 2 + '" cy="' + h / 2 + '" r="' + (Math.min(w, h) / 2 - 1) + '" fill="' + sheet + '"/>' +
              '<path d="M' + w / 2 + " " + h / 2 + " V" + h * 0.22 + " M" + w / 2 + " " + h / 2 + " L" + w * 0.7 + " " + h * 0.6 + '"/>';
        break;
      case "i_cabinet":
        art = R(1, 1, w - 2, h - 2, sheet) + '<path d="M' + w / 2 + " 1 V" + (h - 1) + '"/>' +
              '<path d="M' + (w / 2 - 4) + " " + (h - 8) + " v5 M" + (w / 2 + 4) + " " + (h - 8) + ' v5"/>';
        break;
      case "i_radiator":
        art = R(1, 1, w - 2, h - 2, sheet);
        for (var k = 6; k < w - 3; k += 6) { art += '<path d="M' + k + " 3 V" + (h - 3) + '"/>'; }
        break;
      case "i_hooks":
        art = R(1, 1, w - 2, h - 2, sheet);
        break;
      case "i_sconce":
        art = '<path d="M' + w * 0.2 + " 1 H" + w * 0.8 + " L" + (w - 1) + " " + (h - 1) + " H1 Z" + '" fill="' + sheet + '"/>';
        break;
      default:
        art = R(1, 1, w - 2, h - 2, sheet);
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * 2 + '" height="' + h * 2 +
              '" viewBox="0 0 ' + w + " " + h + '"><g stroke="' + ink + '" stroke-width="1.2" fill="none" ' +
              'stroke-linecap="round" stroke-linejoin="round">' + art + "</g></svg>";
    return v3Pic("w|" + n.kind + "|" + w + "x" + h + "|" + ink + sheet, svg, w, h);
  }
  function v3Figure(kind, look) {
    look = look || { fill: simSheet(), line: simInk() };
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="-24 -24 48 48">' +
              simIcon(kind, 46, undefined, undefined, look) + "</svg>";
    return v3Pic("f|" + kind + "|" + look.line + look.fill, svg, 48, 48);
  }

  // ---- looking at it: from above ---------------------------------------------
  function v3Toward() {                  // the way to the eye, in the drawing's numbers
    var cp = Math.cos(V3.pitch), sp = Math.sin(V3.pitch);
    return [Math.sin(V3.yaw) * cp, Math.cos(V3.yaw) * cp, sp];
  }
  function v3Project(p) {
    var px = p[0] - V3.cx, py = p[1] - V3.cy, z = (p[2] || 0) * (V3.rise === undefined ? 1 : V3.rise);
    var cy = Math.cos(V3.yaw), sy = Math.sin(V3.yaw);
    var x1 = px * cy - py * sy, y1 = px * sy + py * cy;
    var cp = Math.cos(V3.pitch), sp = Math.sin(V3.pitch);
    return { x: V3.w / 2 + V3.panX + x1 * V3.scale, y: V3.h / 2 + V3.panY + (y1 * sp - z * cp) * V3.scale,
             near: y1 * cp + z * sp };
  }

  // ---- looking at it: from inside ---------------------------------------------
  // The eye at V3.me, facing `head` (0 is along the paper's x) and tilted
  // up by `pitch`.  A point is turned into the eye's own numbers -- across,
  // up, and how far ahead -- and then onto the screen, the further the
  // smaller.  Anything behind the eye is cut off at V3_NEAR first.
  function v3EyeOf(p) {
    var m = V3.me, e = V3.eye || { x: m.x, y: m.y, z: EYE_TALL * FLOOR_PX };
    var ch = Math.cos(m.head), sh = Math.sin(m.head);
    var cp = Math.cos(m.pitch), sp = Math.sin(m.pitch);
    var dx = p[0] - e.x, dy = p[1] - e.y, dz = (p[2] || 0) - e.z;
    var ahead = dx * ch + dy * sh, across = -dx * sh + dy * ch;
    return [across, -ahead * sp + dz * cp, ahead * cp + dz * sp];
  }
  function v3Screen(c) {
    var f = (V3.w / 2) / Math.tan(V3_FOV / 2);
    return { x: V3.w / 2 + f * c[0] / c[2], y: V3.h / 2 - f * c[1] / c[2], near: -c[2] };
  }
  function v3Clip(cs) {
    var out = [];
    for (var i = 0; i < cs.length; i++) {
      var a = cs[i], b = cs[(i + 1) % cs.length], ina = a[2] >= V3_NEAR, inb = b[2] >= V3_NEAR;
      if (ina) { out.push(a); }
      if (ina !== inb) {
        var t = (V3_NEAR - a[2]) / (b[2] - a[2]);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, V3_NEAR]);
      }
    }
    return out;
  }

  // What it is all turned about: the middle of everything put up.
  function v3Middle(model) {
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    function see(x, y) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    model.faces.forEach(function (f) { f.pts.forEach(function (p) { see(p[0], p[1]); }); });
    model.spheres.forEach(function (s) { see(s.x - s.r, s.y - s.r); see(s.x + s.r, s.y + s.r); });
    model.rings.forEach(function (r) { see(r.x - r.r, r.y - r.r); see(r.x + r.r, r.y + r.r); });
    model.stand.forEach(function (s) { see(s.x, s.y); });
    V3.cx = x0 === Infinity ? 0 : (x0 + x1) / 2;
    V3.cy = y0 === Infinity ? 0 : (y0 + y1) / 2;
  }

  function v3Fit(model) {
    v3Middle(model);
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    var keep = V3.scale;
    V3.scale = 1; V3.panX = 0; V3.panY = 0;
    function see(p) {
      var q = v3Project(p);
      x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y);
    }
    model.faces.forEach(function (f) { f.pts.forEach(see); });
    model.spheres.forEach(function (s) { see([s.x - s.r, s.y, 0]); see([s.x + s.r, s.y, 0]); see([s.x, s.y, s.r]); see([s.x, s.y, -s.r]); });
    model.rings.forEach(function (r) { see([r.x - r.r, r.y, 0]); see([r.x + r.r, r.y, 0]); see([r.x, r.y - r.r, 0]); see([r.x, r.y + r.r, 0]); });
    model.stand.forEach(function (s) { see([s.x, s.y, s.z]); see([s.x, s.y, s.z + s.tall]); });
    if (x0 === Infinity) { V3.scale = keep || 1; return; }
    var s = Math.min((V3.w - 60) / Math.max(1, x1 - x0), (V3.h - 90) / Math.max(1, y1 - y0));
    V3.scale = Math.max(0.05, Math.min(6, s));
    V3.panX = -((x0 + x1) / 2 - V3.w / 2) * V3.scale;
    V3.panY = -((y0 + y1) / 2 - V3.h / 2) * V3.scale + 10;
  }

  function v3Aim(model, pose) {
    var keep = { pitch: V3.pitch, yaw: V3.yaw, rise: V3.rise, scale: V3.scale, panX: V3.panX, panY: V3.panY };
    V3.pitch = pose.pitch; V3.yaw = pose.yaw; V3.rise = pose.rise;
    v3Fit(model);
    var aim = { scale: V3.scale, panX: V3.panX, panY: V3.panY };
    Object.keys(keep).forEach(function (k) { V3[k] = keep[k]; });
    return aim;
  }
  function v3Goal(key) { return V3.tw[key] ? V3.tw[key].to : V3[key]; }
  function v3FitSoon(ms) {               // Fit, eased there
    var model = v3Build();
    var aim = v3Aim(model, { pitch: v3Goal("pitch"), yaw: v3Goal("yaw"), rise: v3Goal("rise") });
    ["scale", "panX", "panY"].forEach(function (k) { v3Tween(k, aim[k], ms === undefined ? 450 : ms); });
  }

  // A roof's courses of tiles: a fine line across it every 30 cm up.
  function v3Courses(ctx, f, proj, color, alpha) {
    var zs = f.pts.map(function (q) { return q[2]; });
    var lo = Math.min.apply(null, zs), hi = Math.max.apply(null, zs), step = 0.3 * FLOOR_PX;
    if (hi - lo < step) { return; }
    ctx.beginPath();
    for (var z = lo + step; z < hi - 1; z += step) {
      var cut = [];
      for (var i = 0; i < f.pts.length && cut.length < 2; i++) {
        var a = f.pts[i], b = f.pts[(i + 1) % f.pts.length];
        if ((a[2] - z) * (b[2] - z) < 0) {
          var t = (z - a[2]) / (b[2] - a[2]);
          cut.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z]);
        }
      }
      if (cut.length < 2) { continue; }
      var p0 = proj(cut[0]), p1 = proj(cut[1]);
      if (!p0 || !p1) { continue; }
      ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
    }
    ctx.strokeStyle = color; ctx.globalAlpha = 0.3 * alpha; ctx.lineWidth = 0.8; ctx.stroke(); ctx.globalAlpha = 1;
  }

  // The names, last, over everything: rooms dark with light words, the
  // rest light with dark; the nearest first, and none on top of another.
  function v3Labels(ctx, labels, inside, ink, sheet) {
    var face = FACES[lettersOf().face] || FACES.sans, items = [], placed = [];
    labels.forEach(function (l) {
      var q;
      if (inside) {
        var c = v3EyeOf([l.x, l.y, l.z]);
        if (c[2] < V3_NEAR * 3 || c[2] > 12 * FLOOR_PX) { return; }
        q = v3Screen(c); q.d = c[2];
      } else { q = v3Project([l.x, l.y, l.z]); q.d = -q.near; }
      if (q.x < -60 || q.y < -20 || q.x > V3.w + 60 || q.y > V3.h + 20) { return; }
      items.push({ l: l, q: q });
    });
    items.sort(function (a, b) { return (b.l.room ? 1 : 0) - (a.l.room ? 1 : 0) || a.q.d - b.q.d; });
    ctx.save();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    items.forEach(function (it) {
      var room = !!it.l.room, h = room ? 21 : 18;
      ctx.font = (room ? "600 12px " : "11px ") + face;
      var w = Math.ceil(ctx.measureText(it.l.text).width) + 14;
      var x = it.q.x - w / 2, y = it.q.y - h / 2 - (room ? 0 : 8);
      if (placed.some(function (r) { return x < r[2] && x + w > r[0] && y < r[3] && y + h > r[1]; })) { return; }
      placed.push([x - 3, y - 3, x + w + 3, y + h + 3]);
      ctx.globalAlpha = (V3.labelV === undefined ? 1 : V3.labelV) * 0.94;
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(x, y, w, h, h / 2); } else { ctx.rect(x, y, w, h); }
      ctx.fillStyle = room ? ink : sheet; ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha *= 0.35; ctx.stroke();
      ctx.globalAlpha = V3.labelV === undefined ? 1 : V3.labelV;
      ctx.fillStyle = room ? sheet : ink;
      ctx.fillText(it.l.text, it.q.x, y + h / 2 + 0.5);
    });
    ctx.restore();
  }

  function v3Draw() {
    if (!V3) { return; }
    V3.dirty = false;
    var c = V3.canvas, ctx = V3.ctx, dpr = window.devicePixelRatio || 1;
    var rect = V3.box.getBoundingClientRect();
    V3.w = Math.max(1, rect.width); V3.h = Math.max(1, rect.height);
    if (c.width !== Math.round(V3.w * dpr) || c.height !== Math.round(V3.h * dpr)) {
      c.width = Math.round(V3.w * dpr); c.height = Math.round(V3.h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, V3.w, V3.h);
    var inside = V3.mode === "walk";
    var ink = simInk(), sheet = simSheet(), sky = V3.scene === "space";
    var light = [-0.35, -0.6, 0.72];
    var eye = null;
    if (inside) {
      // where the eye is on the paper of its own floor, raised to that floor
      // -- and on its way up or down, a step of the stairs at a time
      var plan = v3Ground(), here = floorAt(plan.floors || [], V3.me.x, V3.me.y);
      V3.myLevel = here ? here.level : 0;
      var climb = 0;
      if (V3.climb) {
        var k = Math.min(1, (performance.now() - V3.climb.t0) / 700);
        climb = V3.climb.by * (1 - k * k * (3 - 2 * k));
        if (k >= 1) { V3.climb = null; }
      }
      // (sitting down, 39-inside.js: lower; out of doors, on the land as it
      // rises and falls, 40-land.js)
      V3.eye = { x: V3.me.x + (here ? here.dx : 0), y: V3.me.y + (here ? here.dy : 0),
                 z: (V3.sitting ? 1.12 : EYE_TALL) * FLOOR_PX + (here ? here.z : 0) + climb + (V3.stairZ || 0) +
                    (typeof terrEye === "function" ? terrEye(here) : 0) };
      eye = [V3.eye.x, V3.eye.y, V3.eye.z];
      V3.inRoom = roomAt(plan, V3.me.x, V3.me.y) || null;   // under a ceiling, or out under the sky
    }
    // (made again every picture -- or, where the device is slow, every second or third,
    // the view still moving every picture: 40-perf.js)
    var model = typeof v3BuildPaced === "function" ? v3BuildPaced() : v3Build();
    if (inside && V3.solidsFor !== model) {
      // (the drawing, the view, the doors and the land as they were: the same walls as last time --
      // not while it goes up or is moved into, 40-build.js)
      var kept0 = V3.kept && V3.kept[0], building = typeof bpSite !== "undefined" && bpSite;
      var sk = kept0 && !building ? kept0.key + "|" + JSON.stringify(V3.doorAt || {}) + "|" + (typeof TERR !== "undefined" && TERR ? TERR.key || "" : "") + "|" + model.faces.length : null;
      if (sk === null || V3.solidsKey !== sk) { V3.solids = v3Solids(model); V3.solidsKey = sk; }
      V3.solidsFor = model;
    }   // what walking bumps into (v3Bumps)
    if (!inside && (V3.fitNext || V3.cx === undefined)) { V3.fitNext = false; v3Fit(model); }
    var toward = inside ? null : v3Toward();
    // A home, by WebGL wherever the browser has it (38-view3d-gl.js): a
    // depth buffer, so nothing shows through a wall, pictures that stay on
    // their faces, the sun and the garden.  Space, and a browser without
    // it, are painted the way below.
    if (!sky && typeof v3GlDraw === "function" && v3GlDraw(model, inside)) {
      v3Over(model, inside, ink, sheet, sky);
      return;
    }
    if (inside) {
      // the sky over, and the ground under, the horizon
      var f = (V3.w / 2) / Math.tan(V3_FOV / 2);
      var line = V3.h / 2 + f * Math.tan(V3.me.pitch);
      if (line > 0) {
        var air = ctx.createLinearGradient(0, 0, 0, Math.max(1, line));
        air.addColorStop(0, v3Mix(sheet, "#7fa6cc", 0.45));
        air.addColorStop(1, v3Mix(sheet, "#cfdeeb", 0.4));
        ctx.fillStyle = air;
        ctx.fillRect(0, 0, V3.w, Math.min(V3.h, line));
      }
      ctx.fillStyle = v3Mix(sheet, ink, 0.07);
      ctx.fillRect(0, Math.max(0, line), V3.w, V3.h);
    }
    // where a point is on the screen, and how near: either way of looking
    function place(pts) {
      if (!inside) { return pts.map(v3Project); }
      var cam = v3Clip(pts.map(v3EyeOf));
      return cam.length >= 3 ? cam.map(v3Screen) : null;
    }
    var items = [];
    model.faces.forEach(function (f) {
      if (f.mesh || (f.how && f.how.ghost)) { return; }   // WebGL's alone (38-models.js)
      var dot;
      if (inside) {
        var p0 = f.pts[0];
        dot = f.n[0] * (eye[0] - p0[0]) + f.n[1] * (eye[1] - p0[1]) + f.n[2] * (eye[2] - p0[2]);
      } else {
        dot = f.n[0] * toward[0] + f.n[1] * toward[1] + f.n[2] * toward[2];
      }
      // turned away -- a floor from above always shows, but not from
      // under it, walking round the floor below
      if (dot <= 0.001 && !(f.floor && !inside)) { return; }
      if (f.how.hang) {                              // hung on the far side of its wall
        var hg = f.how.hang;
        var from = inside ? hg[0] * (eye[0] - f.how.at[0]) + hg[1] * (eye[1] - f.how.at[1])
                          : hg[0] * toward[0] + hg[1] * toward[1];
        if (from < 0) { return; }
      }
      var pts = place(f.pts);
      if (!pts) { return; }
      var near = 0;
      pts.forEach(function (p) { near += p.near / pts.length; });
      if (f.top) { near += 0.5; }                    // a top over its own sides
      if (f.floor) { near -= 100000; }               // floors under everything
      if (f.ceiling) { near -= 90000; }              // and ceilings over them, behind all else
      if (f.how.late) { near += 1000000; }           // a roof on its way on or off, over all
      items.push({ face: f, pts: pts, near: near, whole: pts.length === f.pts.length });
    });
    model.stand.forEach(function (s) {
      var base = place([[s.x, s.y, s.z], [s.x, s.y, s.z], [s.x, s.y, s.z]]);
      var top = place([[s.x, s.y, s.z + s.tall], [s.x, s.y, s.z + s.tall], [s.x, s.y, s.z + s.tall]]);
      if (!base || !top || (inside && (base.length !== 3 || top.length !== 3))) { return; }
      items.push({ stand: s, base: base[0], top: top[0], near: base[0].near + 1 });
    });
    model.rings.forEach(function (r) {
      var pts = [];
      for (var k = 0; k <= 72; k++) {
        var t = k / 72 * Math.PI * 2;
        pts.push(v3Project([r.x + Math.cos(t) * r.r, r.y + Math.sin(t) * r.r, 0]));
      }
      items.push({ ring: pts, near: -50000 });
    });
    model.spheres.forEach(function (s) {
      var mid = v3Project([s.x, s.y, s.z]);
      items.push({ sphere: s, mid: mid, near: mid.near });
    });
    items.sort(function (p, q) { return p.near - q.near; });
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    items.forEach(function (it) {
      if (it.face) {
        var f = it.face, n = f.n;
        var lit = Math.max(0, n[0] * light[0] + n[1] * light[1] + n[2] * light[2]);
        // its own color, darker the further it is turned from the light:
        // the depth of it is all in the shading
        var base = f.how.color || sheet, edge = f.how.edge || ink, paint;
        if (f.how.wall && f.top) { paint = edge; }
        else if (f.how.dark) { paint = edge; }
        else if (f.how.glass) { paint = v3Mix(sheet, ink, 0.12); }
        else if (f.how.floor) { paint = v3Mix(base, "#000000", 0.03); }
        else if (f.how.ceiling) { paint = base; }
        else if (f.how.roof) { paint = v3Mix(base, "#000000", 0.03 + (1 - lit) * 0.3); }
        else if (f.top) { paint = v3Mix(base, "#ffffff", 0.08); }
        else { paint = v3Mix(base, "#000000", 0.07 + (1 - lit) * 0.33); }
        ctx.beginPath();
        it.pts.forEach(function (p, k) { if (k) { ctx.lineTo(p.x, p.y); } else { ctx.moveTo(p.x, p.y); } });
        ctx.closePath();
        var seen = f.how.alpha === undefined ? 1 : f.how.alpha;
        ctx.globalAlpha = (f.how.glass ? 0.35 : 1) * seen;
        if (!f.how.decal) { ctx.fillStyle = paint; ctx.fill(); }
        ctx.globalAlpha = 1;
        if (f.roof && it.whole) {
          v3Courses(ctx, f, inside ? function (q) { var c = v3EyeOf(q); return c[2] >= V3_NEAR ? v3Screen(c) : null; }
                                   : v3Project, edge, seen);
        }
        if (f.tex && f.tex.ok && it.whole && f.texAt) {
          var p0 = it.pts[f.texAt[0]], p1 = it.pts[f.texAt[1]], p3 = it.pts[f.texAt[2]], pic = f.tex;
          ctx.save();
          if (f.clipRound) {
            var round = place(f.clipRound.map(function (q) { return [q[0], q[1], f.pts[0][2]]; }));   // at its own height
            ctx.beginPath();
            (round || []).forEach(function (pr, k) { if (k) { ctx.lineTo(pr.x, pr.y); } else { ctx.moveTo(pr.x, pr.y); } });
            ctx.closePath();
          }
          ctx.clip();
          ctx.transform((p1.x - p0.x) / pic.w, (p1.y - p0.y) / pic.w,
                        (p3.x - p0.x) / pic.h, (p3.y - p0.y) / pic.h, p0.x, p0.y);
          ctx.drawImage(pic.img, 0, 0, pic.w, pic.h);
          ctx.restore();
        }
        if (!f.how.decal) {
          ctx.beginPath();
          it.pts.forEach(function (p, k) { if (k) { ctx.lineTo(p.x, p.y); } else { ctx.moveTo(p.x, p.y); } });
          ctx.closePath();
          ctx.strokeStyle = f.how.edge || ink;
          ctx.globalAlpha = (f.how.floor || f.how.ceiling ? 0.35 : 0.7) * seen;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      } else if (it.stand) {
        var s = it.stand, pic = s.img;
        if (!pic.ok) { return; }
        var up = it.base.y - it.top.y;
        if (!inside) {
          // standing, foreshortened as it is looked down on; flat, as an icon on the plan
          var lie = 1 - (V3.rise === undefined ? 1 : V3.rise);
          up = Math.max(Math.cos(V3.pitch), 0.42 + 0.4 * lie) * s.tall * V3.scale;
        }
        if (up < 2) { return; }
        var wide = up * pic.w / pic.h;
        ctx.save();
        if (s.walker) { ctx.shadowColor = "rgba(17, 97, 73, .7)"; ctx.shadowBlur = 14; }
        ctx.drawImage(pic.img, it.base.x - wide / 2, it.base.y - up, wide, up);
        ctx.restore();
        // a shadow on the floor where they stand
        ctx.beginPath();
        ctx.ellipse(it.base.x, it.base.y, wide * 0.28, wide * 0.08 + 1, 0, 0, Math.PI * 2);
        ctx.fillStyle = v3Mix(sheet, ink, 0.25);
        ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
      } else if (it.ring) {
        ctx.beginPath();
        it.ring.forEach(function (p, k) { if (k) { ctx.lineTo(p.x, p.y); } else { ctx.moveTo(p.x, p.y); } });
        ctx.strokeStyle = sky ? sheet : ink;
        ctx.globalAlpha = 0.35; ctx.setLineDash([3, 5]); ctx.lineWidth = 1; ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      } else if (it.sphere) {
        var sp = it.sphere, r = Math.max(2, sp.r * V3.scale), m = it.mid;
        var g = ctx.createRadialGradient(m.x - r * 0.35, m.y - r * 0.4, r * 0.1, m.x, m.y, r);
        var body = (sp.look && sp.look.fill) || sheet;
        if (sp.sun) {
          ctx.save();
          ctx.shadowColor = body; ctx.shadowBlur = r * 0.9;
          g.addColorStop(0, v3Mix(body, "#ffffff", 0.7)); g.addColorStop(1, v3Mix(body, ink, 0.18));
        } else {
          g.addColorStop(0, v3Mix(body, "#ffffff", 0.55)); g.addColorStop(1, v3Mix(body, "#000000", 0.55));
        }
        ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        if (sp.sun) { ctx.restore(); }
        ctx.strokeStyle = sky ? v3Mix(sheet, ink, 0.4) : ink; ctx.lineWidth = 1; ctx.stroke();
        if (sp.kind === "i_planet") {                   // its ring, round it
          ctx.beginPath();
          ctx.ellipse(m.x, m.y, r * 1.7, r * 1.7 * Math.sin(V3.pitch) * 0.5 + 1, 0, 0, Math.PI * 2);
          ctx.strokeStyle = sheet; ctx.globalAlpha = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    });
    v3Over(model, inside, ink, sheet, sky);
  }

  // Over the picture, however it was drawn: the names, the map, and the
  // picture from before a change fading out.
  function v3Over(model, inside, ink, sheet, sky) {
    var ctx = V3.ctx;
    if (!model.faces.length && !model.spheres.length && !model.stand.length) {
      ctx.fillStyle = sky ? sheet : ink;
      ctx.font = "14px " + (FACES[lettersOf().face] || FACES.sans);
      ctx.textAlign = "center";
      ctx.fillText(TXT.v3_empty, V3.w / 2, V3.h / 2);
    }
    if (model.labels && model.labels.length) { v3Labels(ctx, model.labels, inside, ink, sheet); }
    if (inside) { v3Map(); }
    // the picture before a change, fading out over the one after
    if (V3.fade) {
      var fk = (performance.now() - V3.fade.t0) / V3.fade.ms;
      if (fk >= 1) { V3.fade = null; }
      else {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1 - v3Ease(Math.max(0, fk));
        ctx.drawImage(V3.fade.img, 0, 0);
        ctx.restore();
      }
    }
  }

  // ---- walking round inside ---------------------------------------------------
  // The floor plan the walk-through finds its way on (walkPlan, 38-walk.js),
  // kept while the drawing is the same, says where the walls and the
  // furniture are; a door shut stands in its doorway again.
  function v3Ground() {
    var key = JSON.stringify(hand.nodes.map(function (n) { return [n.kind, n.x, n.y, n.w, n.h, n.turn || 0, n.text || "", n.ceil || 0]; }).concat(
      hand.links.map(function (l) { return [l.from, l.to]; })));
    if (!V3.ground || V3.groundKey !== key) { V3.ground = walkPlan(); V3.groundKey = key; }
    return V3.ground;
  }
  function v3Blocked(x, y) {
    var plan = v3Ground();
    if (!plan.cells) { return false; }
    var shut = {};
    plan.doors.forEach(function (d) {
      // shut -- or only open a little, standing across its doorway (40-doors.js)
      var ajar = typeof DOOR_AJAR === "object" && DOOR_AJAR[d.id] && doorIsOpen(d);
      if ((!doorIsOpen(d) || ajar) && (V3.doorAt[d.id] === undefined || V3.doorAt[d.id] < 60)) {
        (plan.doorway[d.id] || []).forEach(function (i) { shut[i] = true; });
      }
    });
    // a floor of a house is walked on, not off into the air round it (or,
    // from the garden, into the drawing of the floor upstairs)
    var floors = plan.floors || [];
    if (floors.length) {
      var there = floorAt(floors, x, y), now = V3.me ? floorAt(floors, V3.me.x, V3.me.y) : there;
      var a = now ? now.level : 0, b = there ? there.level : 0;
      if (a !== b || (a !== 0 && !there)) { return true; }
    }
    var pts = [[x, y], [x - WALK_BODY, y - WALK_BODY], [x + WALK_BODY, y - WALK_BODY],
               [x - WALK_BODY, y + WALK_BODY], [x + WALK_BODY, y + WALK_BODY]];
    if (pts.some(function (p) {
      var c = Math.floor((p[0] - plan.x0) / WALK_CELL), r = Math.floor((p[1] - plan.y0) / WALK_CELL);
      if (c < 0 || r < 0 || c >= plan.cols || r >= plan.rows) { return false; }   // outdoors
      var i = r * plan.cols + c, cell = plan.cells[i];
      return cell === 1 || cell === 2 || shut[i];
    })) { return true; }
    return v3Bumps(x, y);
  }

  // The squares above are ten pixels across, and a body tested at five
  // points of them could still come right up to the end of a wall -- a
  // door's frame, met at a slant -- close enough for the eye to be inside
  // it, and the wall cut open in front of it (asked for, 2026-10-01: "there
  // is still the clipping issues in the 3d walking around mode").  So it is
  // also kept off the walls, the doors and the furniture themselves, as
  // they were put up last time the view was drawn: their sides, as lines
  // on the floor, each with the heights it stands between.
  var V3_CLEAR = WALK_BODY + 3;          // how near the middle of you a wall may come
  function v3Solids(model) {
    var out = [];
    model.faces.forEach(function (f) {
      var n = f.node;
      if (!f.side || !n || BETWEEN_FLOORS[n.kind] || FROM_CEILING[n.kind] || LIES_FLAT[n.kind] ||
          n.kind === "i_rug" || n.kind === "i_lot" || n.kind === "i_floor") { return; }
      var a = f.pts[0], b = f.pts[1], z0 = Infinity, z1 = -Infinity;
      // (any number of corners: the end of a gable is three, 39-styles.js)
      f.pts.forEach(function (p) { z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); });
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.01) { return; }
      out.push([a[0], a[1], b[0], b[1], z0, z1]);
    });
    return out;
  }
  // The nearest any of them comes to a spot on the floor of a storey that
  // starts at height z, between the knees and the top of the head.
  function v3Nearest(px, py, z) {
    var best = Infinity, lo = z + 0.25 * FLOOR_PX, hi = z + 1.8 * FLOOR_PX;
    (V3.solids || []).forEach(function (s) {
      if (s[5] < lo || s[4] > hi) { return; }
      var dx = s[2] - s[0], dy = s[3] - s[1], len = dx * dx + dy * dy;
      var t = Math.max(0, Math.min(1, ((px - s[0]) * dx + (py - s[1]) * dy) / len));
      best = Math.min(best, Math.hypot(px - s[0] - dx * t, py - s[1] - dy * t));
    });
    return best;
  }
  function v3Bumps(x, y) {
    if (!V3 || !V3.solids || !V3.me) { return false; }
    var floors = v3Ground().floors || [], f = floorAt(floors, x, y), g = floorAt(floors, V3.me.x, V3.me.y);
    var to = v3Nearest(x + (f ? f.dx : 0), y + (f ? f.dy : 0), f ? f.z : 0);
    if (to >= V3_CLEAR) { return false; }
    // already too near (put there by a door swinging, say): a step that
    // takes you further off is let through
    var now = v3Nearest(V3.me.x + (g ? g.dx : 0), V3.me.y + (g ? g.dy : 0), g ? g.z : 0);
    return to <= now;
  }

  // Where you start: as the person drawn in the plan -- in a room, or else
  // anywhere -- facing the nearest door; or just outside the front door
  // looking at it; or in the middle of the biggest room.
  function v3Start() {
    var plan = v3Ground();
    var who = plan.people.filter(function (p) { return roomAt(plan, p.x, p.y); })[0] || plan.people[0];
    if (who) {
      var near = plan.doors.slice().sort(function (p, q) {
        return Math.hypot(p.x - who.x, p.y - who.y) - Math.hypot(q.x - who.x, q.y - who.y);
      })[0];
      return { x: who.x, y: who.y, as: who.id, pitch: 0,
               head: near ? Math.atan2(near.y - who.y, near.x - who.x) : -Math.PI / 2 };
    }
    var front = (plan.joins || []).filter(function (j) { return j.rooms.length === 1; })
      .sort(function (p, q) { return (p.door.kind === "i_garagedoor") - (q.door.kind === "i_garagedoor"); })[0];
    if (front) {
      var d = front.door, room = front.rooms[0];
      var dx = d.x - room.x, dy = d.y - room.y, len = Math.hypot(dx, dy) || 1;
      var back = [320, 240, 150].filter(function (b) { return !v3Blocked(d.x + dx / len * b, d.y + dy / len * b); })[0] || 150;
      var x = d.x + dx / len * back, y = d.y + dy / len * back;   // back a few steps, to see the house
      return { x: x, y: y, head: Math.atan2(d.y - y, d.x - x), pitch: 0.12 };
    }
    var big = plan.rooms.slice().sort(function (p, q) { return q.w * q.h - p.w * p.h; })[0];
    return big ? { x: big.x, y: big.y, head: -Math.PI / 2, pitch: 0 } : { x: 0, y: 0, head: 0, pitch: 0 };
  }

  // A step's worth of walking, from the keys held and the pad pressed.
  // W A S D walk -- ahead, back, and a step to either side -- and the
  // arrows are the eyes: left and right to turn, up and down to look up
  // and down (asked for, 2026-10-01: "the arrows are the camera and the
  // wasd is the movement").  The pad on the screen walks and turns.
  function v3Stride(dt) {
    var k = V3.keys, me = V3.me;
    var ahead = (k.w || k.padup ? 1 : 0) - (k.s || k.paddown ? 1 : 0);
    var side = (k.d ? 1 : 0) - (k.a ? 1 : 0);
    var turn = (k.arrowright || k.padright ? 1 : 0) - (k.arrowleft || k.padleft ? 1 : 0);
    var look = (k.arrowup ? 1 : 0) - (k.arrowdown ? 1 : 0);
    if (!ahead && !side) { me.go = 0; }
    if (!ahead && !side && !turn && !look) { return false; }
    me.head += turn * 2.3 * dt;
    if (look) { me.pitch = Math.max(-V3_LOOK_DOWN, Math.min(0.9, me.pitch + look * 1.5 * dt)); }
    if (!ahead && !side) { return true; }
    // up to speed in a quarter of a second, not all at once
    me.go = Math.min(1, (me.go || 0) + dt * 4);
    var pace = WALK_PACE * (k.shift ? 2 : 1) * (0.45 + 0.55 * me.go) * dt;
    var mx = (Math.cos(me.head) * ahead - Math.sin(me.head) * side) * pace;
    var my = (Math.sin(me.head) * ahead + Math.cos(me.head) * side) * pace;
    // in steps no longer than a wall is thick, so a slow frame cannot carry
    // you through one; along each way on its own, so a wall met at a slant
    // is slid along
    var steps = Math.max(1, Math.ceil(Math.hypot(mx, my) / 4));
    for (var i = 0; i < steps; i++) {
      if (mx && !v3Blocked(me.x + mx / steps, me.y)) { me.x += mx / steps; }
      if (my && !v3Blocked(me.x, me.y + my / steps)) { me.y += my / steps; }
    }
    v3Stairs();
    return true;
  }

  // From above, W A S D move over it the way they walk through it: W
  // further in, S back, A and D to the sides -- the arrows turn it.
  function v3Glide(dt) {
    var k = V3.keys;
    var x = (k.d ? 1 : 0) - (k.a ? 1 : 0), y = (k.s ? 1 : 0) - (k.w ? 1 : 0);
    if (!x && !y) { return false; }
    var step = 520 * dt * (k.shift ? 2 : 1);
    V3.panX -= x * step; V3.panY -= y * step;
    return true;
  }

  // Stepping onto stairs (or into a lift) that lead somewhere: up or down
  // to the other end, on the floor above or below.  Arrived, you stand on
  // the other end until you step off it, so it does not send you straight
  // back.
  function v3Stairs() {
    var plan = v3Ground(), me = V3.me;
    if (V3.onStair) {
      var at = nodeById(V3.onStair);
      if (!at || !insideArea(at, me.x, me.y, -6)) { V3.onStair = null; }
      return;
    }
    // (a lift met by every floor of a block, 39-types.js, goes on the way it
    // was going -- up and up, or down -- and back the other way at the end)
    var ways = [];
    (plan.links || []).forEach(function (pair) {
      [0, 1].forEach(function (e) { if (insideArea(pair[e], me.x, me.y, 3)) { ways.push([pair[e], pair[1 - e]]); } });
    });
    function riseOf(w) {
      var a = floorAt(plan.floors, w[0].x, w[0].y), b = floorAt(plan.floors, w[1].x, w[1].y);
      return (b ? b.z : 0) - (a ? a.z : 0);
    }
    if (ways.length > 1) {
      var keep = V3.climbWay || 1;
      ways.sort(function (p, q) { return (riseOf(q) * keep > 0 ? 1 : 0) - (riseOf(p) * keep > 0 ? 1 : 0); });
    }
    ways.slice(0, 1).some(function (way) {
      return [0].some(function () {
        var from = way[0], to = way[1];
        V3.climbWay = riseOf(way) >= 0 ? 1 : -1;
        var fa = floorAt(plan.floors, from.x, from.y), fb = floorAt(plan.floors, to.x, to.y);
        var up = !fa || !fb || fb.z >= fa.z;
        V3.climb = { by: (fa ? fa.z : 0) - (fb ? fb.z : 0), t0: performance.now() };
        me.x = to.x; me.y = to.y;
        V3.onStair = to.id;
        // stepped off the far end of the flight, onto the floor there, so
        // a step back onto it is a step back down
        var t = (to.turn || 0) * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t), long = to.h >= to.w;
        var ax = long ? -sn : c, ay = long ? c : sn;
        var reach = (long ? to.h : to.w) / 2 + WALK_BODY + 8, side = (long ? to.w : to.h) / 2 + WALK_BODY + 8;
        [[ax * reach, ay * reach], [-ax * reach, -ay * reach], [-ay * side, ax * side], [ay * side, -ax * side]]
          .some(function (d) {
            if (v3Blocked(to.x + d[0], to.y + d[1])) { return false; }
            me.x = to.x + d[0]; me.y = to.y + d[1];
            me.head = Math.atan2(d[1], d[0]);
            return true;
          });
        v3Say(say(up ? "v3_went_up" : "v3_went_down", { floor: fb ? floorName(fb) : "" }));
        V3.dirty = true;
        return true;
      });
    });
  }

  // The door in front of you, near enough to reach: opened, or shut.
  function v3UseDoor() {
    var plan = v3Ground(), me = V3.me, best = null, bestCost = Infinity;
    plan.doors.forEach(function (d) {
      var dx = d.x - me.x, dy = d.y - me.y, dist = Math.hypot(dx, dy);
      if (dist > 85) { return; }
      var off = Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - me.head), Math.cos(Math.atan2(dy, dx) - me.head)));
      if (off > 1.4 && dist > 30) { return; }
      var cost = dist + off * 40;
      if (cost < bestCost) { bestCost = cost; best = d; }
    });
    if (!best) { v3Say(TXT.v3_no_door); return; }
    if (doorLocked(best)) { v3Say(TXT.v3_locked); return; }
    var open = doorIsOpen(best);
    // shut on nobody: not while you stand in its doorway
    if (open && insideArea(best, me.x, me.y, -WALK_BODY)) { return; }
    doorOpen[best.id] = !open;
    V3.dirty = true;
  }

  function v3Say(words) {
    var toast = V3 && el(".v3-toast", V3.box);
    if (!toast) { return; }
    toast.textContent = words;
    toast.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { toast.hidden = true; }, 1600);
  }

  // A map of the plan in the corner: the rooms, the doors, and you.
  function v3Map() {
    var map = V3 && el(".v3-map", V3.box);
    if (!map) { return; }
    var plan = v3Ground(), ctx = map.getContext("2d"), dpr = window.devicePixelRatio || 1;
    var W = 150, H = 110;
    if (map.width !== W * dpr) { map.width = W * dpr; map.height = H * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!plan.rooms.length) { return; }
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    var mine = floorAt(plan.floors || [], V3.me.x, V3.me.y);
    var onMap = mine || (plan.floors || []).filter(function (f) { return f.level === 0; })[0] || null;
    var rooms = plan.rooms.filter(function (r) { return floorAt(plan.floors || [], r.x, r.y) === onMap; });
    if (!rooms.length) { rooms = plan.rooms; }
    rooms.forEach(function (r) {
      var t = turned(r);
      x0 = Math.min(x0, r.x - t.w / 2); x1 = Math.max(x1, r.x + t.w / 2);
      y0 = Math.min(y0, r.y - t.h / 2); y1 = Math.max(y1, r.y + t.h / 2);
    });
    var s = Math.min((W - 16) / (x1 - x0 || 1), (H - 16) / (y1 - y0 || 1));
    var ox = (W - (x1 - x0) * s) / 2 - x0 * s, oy = (H - (y1 - y0) * s) / 2 - y0 * s;
    ctx.strokeStyle = simInk(); ctx.fillStyle = simSheet(); ctx.lineWidth = 1.5;
    rooms.forEach(function (r) {
      var t = turned(r);
      ctx.fillRect(ox + (r.x - t.w / 2) * s, oy + (r.y - t.h / 2) * s, t.w * s, t.h * s);
      ctx.strokeRect(ox + (r.x - t.w / 2) * s, oy + (r.y - t.h / 2) * s, t.w * s, t.h * s);
    });
    plan.doors.forEach(function (d) {
      ctx.fillStyle = doorIsOpen(d) ? simSheet() : simInk();
      ctx.beginPath(); ctx.arc(ox + d.x * s, oy + d.y * s, 2.4, 0, Math.PI * 2); ctx.fill();
    });
    var me = V3.me, px = ox + me.x * s, py = oy + me.y * s;
    ctx.save();
    ctx.translate(px, py); ctx.rotate(me.head);
    ctx.fillStyle = "rgb(17, 97, 73)";
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-4, -4.5); ctx.lineTo(-2, 0); ctx.lineTo(-4, 4.5); ctx.closePath(); ctx.fill();
    ctx.restore();
    var where = el(".v3-where", V3.box), room = roomAt(plan, me.x, me.y);
    // named as the plan labels it -- "Studio" -- not as a sentence says it
    var said = room ? roomLabel(room) || roomName(plan, room) : TXT.v3_outside;
    if (mine && (plan.floors || []).length > 1) { said += " \u00b7 " + floorName(mine); }
    if (where) { where.textContent = said; }
  }

  // ---- kept going --------------------------------------------------------------
  function v3Soon() {
    if (!V3 || V3.due) { return; }
    V3.due = true;
    simFrame(function () { if (!V3) { return; } V3.due = false; v3Draw(); });
  }

  // How fast a door goes, degrees a second: as fast as a real one (2026-10-04:
  // "all things are of accurate time") -- one pushed open by hand in about a
  // second, a sliding or folding one in a second and a quarter (each was a
  // third of a second); a garage door on its opener, 40-garage.js.
  function doorRate(n) {
    if (n.kind === "i_door" || n.kind === "i_door2") { return 95; }
    if (n.kind === "i_slide" || n.kind === "i_bifold") { return 72; }
    return 90;
  }
  // While somebody walks, the planets go round, you walk, or a door
  // swings, it is drawn as they move; otherwise only when it is turned,
  // or a picture arrives.
  function v3Watch() {
    if (!V3) { return; }
    var now = performance.now(), dt = Math.min(0.1, (now - (V3.last || now)) / 1000);
    V3.last = now;
    var moving = !!simNow;
    if (moving !== !!V3.wasRunning) { V3.wasRunning = moving; v3Words(); }
    var swung = false;
    hand.nodes.forEach(function (n) {
      if (!WALK_DOORS[n.kind]) { return; }
      var want = typeof doorSwingTo === "function" ? doorSwingTo(n) : doorIsOpen(n) ? 90 : 0, at = V3.doorAt[n.id];
      if (at === undefined) { V3.doorAt[n.id] = want; return; }
      if (at !== want) {
        var rate = doorRate(n);
        V3.doorAt[n.id] = at < want ? Math.min(want, at + dt * rate) : Math.max(want, at - dt * rate);
        swung = true;
      }
    });
    var walked = V3.mode === "walk" ? v3Stride(dt) : v3Glide(dt);
    var eased = v3Tweening();
    if (!V3) { return; }                 // eased all the way shut
    var key = moving ? JSON.stringify(walkAt) + "|" + (typeof orbitTick !== "undefined" ? orbitTick : 0) : "";
    if (V3.dirty || swung || walked || eased || V3.fade || V3.climb || key !== V3.seen) {
      V3.seen = key;
      var t0 = performance.now();
      v3Draw();
      if (V3) { V3.drawMs = performance.now() - t0; }   // (how long a picture takes: what moves on its own waits longer for a slow one)
    }
    simFrame(v3Watch);
  }

  function v3Open() {
    if (V3) { v3Leave(); return; }
    var stage = el("#stage");
    var scene = boardNow();
    if (!stage || !scene) { return; }
    var box = document.createElement("div");
    box.id = "view3d";
    box.className = "view3d" + (scene.name === "space" ? " sky" : "");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", TXT.v3_open);
    box.innerHTML = '<canvas aria-hidden="true"></canvas>' +
      '<div class="v3-bar">' +
      '<button class="btn small primary" type="button" data-v3="run"></button>' +
      '<button class="btn small" type="button" data-v3="mode" aria-pressed="false"></button>' +
      '<button class="btn small" type="button" data-v3="flat" aria-pressed="false"></button>' +
      '<button class="btn small" type="button" data-v3="roof" aria-pressed="true"></button>' +
      '<button class="btn small" type="button" data-v3="labels" aria-pressed="true"></button>' +
      '<button class="btn small" type="button" data-v3="low" aria-pressed="false"></button>' +
      '<button class="btn small" type="button" data-v3="level"></button>' +
      '<button class="btn small" type="button" data-v3="fit"></button>' +
      '<button class="btn small v3-advise" type="button" data-v3="advice" aria-expanded="false"></button>' +
      '<span class="v3-hint"></span>' +
      '<button class="icon small v3-shut" type="button" data-v3="shut">' +
      '<svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5 5 15"/></svg></button></div>' +
      '<div class="v3-advice" hidden></div>' +
      '<div class="v3-where" hidden></div><div class="v3-cross" hidden></div>' +
      '<canvas class="v3-map" width="150" height="110" hidden></canvas>' +
      '<div class="v3-toast" role="status" hidden></div>' +
      '<div class="v3-pad" hidden>' +
      '<button type="button" data-pad="up" aria-label="↑">▲</button>' +
      '<button type="button" data-pad="left" aria-label="←">◀</button>' +
      '<button type="button" data-pad="door" class="v3-pad-door"></button>' +
      '<button type="button" data-pad="right" aria-label="→">▶</button>' +
      '<button type="button" data-pad="down" aria-label="↓">▼</button></div>';
    document.body.appendChild(box);
    V3 = { box: box, canvas: box.firstChild, ctx: box.firstChild.getContext("2d"), scene: scene.name,
           yaw: -0.62, pitch: 1.05, scale: 1, panX: 0, panY: 0, w: 1, h: 1, dirty: true, fitNext: false,
           low: false, mode: "orbit", keys: {}, doorAt: {}, me: null, tw: {},
           rise: 1, roofV: 0, labelV: 0, flat: false, flatDone: false,
           roof: v3Pref("roof"), labels: v3Pref("labels") };
    v3Words();
    v3Place();
    // In: up off the paper -- the plan as it is drawn, straight down on it,
    // turning to look at it from the side as its walls rise, then the roof
    // settling on and the names coming up.
    var r0 = box.getBoundingClientRect();
    V3.w = Math.max(1, r0.width); V3.h = Math.max(1, r0.height);
    // (a big building: made a slice at a time under the bar, 40-work.js,
    // roofed and named from the start -- then shown already standing)
    var big = scene.name !== "space" && v3Big() && typeof workLive === "function";
    function up() {
      var aim = v3Aim(v3Build(), { pitch: 1.05, yaw: -0.62, rise: 1 });
      V3.scale = aim.scale; V3.panX = aim.panX; V3.panY = aim.panY;
      if (big) { V3.pitch = 1.05; V3.yaw = -0.62; V3.dirty = true; return; }
      if (scene.name !== "space") { V3.rise = 0; }
      V3.pitch = Math.PI / 2; V3.yaw = 0;
      // from exactly where the drawing is on the paper, at the paper's zoom,
      // so it rises out of the drawing rather than out of somewhere near it
      var paper = scene.name !== "space" ? v3Paper() : null;
      if (paper) {
        V3.scale = paper.scale; V3.panX = paper.panX; V3.panY = paper.panY;
        ["scale", "panX", "panY"].forEach(function (k) { v3Tween(k, aim[k], 1150); });
      }
      v3Tween("rise", 1, 950);
      v3Tween("pitch", 1.05, 1150);
      v3Tween("yaw", -0.62, 1150);
      if (V3.roof) { v3Tween("roofV", 1, 650, 800); }
      if (V3.labels) { v3Tween("labelV", 1, 450, 1000); }
    }
    if (big) {
      V3.roofV = V3.roof ? 1 : 0; V3.labelV = V3.labels ? 1 : 0;
      var warm = workLive(v3BuildSteps(), {
        stages: ["house", "models", "scene"],
        putBack: function () { if (V3 && V3.box === box && V3.warming) { V3.warming = null; v3Leave(); } }
      });
      V3.warming = workNow;
      warm.then(function (got) {
        if (!V3 || V3.box !== box || got === undefined) { return; }
        V3.warming = null;
        up();
        v3Watch();
      });
    } else {
      up();
    }
    el('[data-v3="flat"]', box).onclick = function () { v3Flat(!V3.flat); };
    el('[data-v3="roof"]', box).onclick = function () {
      V3.roof = !V3.roof;
      v3Pref("roof", V3.roof);
      v3Tween("roofV", V3.roof ? 1 : 0, 650);
      v3Words();
    };
    el('[data-v3="labels"]', box).onclick = function () {
      V3.labels = !V3.labels;
      v3Pref("labels", V3.labels);
      v3Tween("labelV", V3.labels ? 1 : 0, 300);
      v3Words();
    };
    el('[data-v3="run"]', box).onclick = function () { el("#run").click(); v3Words(); };
    el('[data-v3="low"]', box).onclick = function () {
      v3Fade(300);
      V3.low = !V3.low;
      this.setAttribute("aria-pressed", V3.low ? "true" : "false");
      V3.dirty = true;
    };
    el('[data-v3="mode"]', box).onclick = function () { v3Mode(V3.mode === "walk" ? "orbit" : "walk"); };
    // all the floors, or the house cut off above one of them -- the way an
    // architect lifts the floor above off a model to see into the one under
    el('[data-v3="level"]', box).onclick = function () {
      var floors = floorsOf();
      if (floors.length < 2) { return; }
      var levels = floors.map(function (f) { return f.level; });
      var at = V3.upTo === undefined || V3.upTo === null ? -1 : levels.indexOf(V3.upTo);
      v3Fade(350);
      if (V3.flat) {                     // flat: one floor and then the next, round again
        if (at < 0) { at = Math.max(0, levels.indexOf(0)); }
        V3.upTo = levels[(at + 1) % levels.length];
      } else {
        V3.upTo = at + 1 < levels.length ? levels[at + 1] : null;
      }
      V3.dirty = true;
      v3Words();
    };
    el('[data-v3="fit"]', box).onclick = function () {
      if (V3.mode === "walk") { v3Fade(350); V3.me = v3Start(); } else { v3FitSoon(); }
      V3.dirty = true;
    };
    el('[data-v3="advice"]', box).onclick = function () { v3AdviceShow(el(".v3-advice", box).hidden); };
    el('[data-v3="shut"]', box).onclick = v3Leave;
    all(".v3-pad button", box).forEach(function (b) {
      var which = b.dataset.pad;
      if (which === "door") { b.onclick = function () { v3UseDoor(); }; return; }
      function hold(on) { V3.keys["pad" + which] = on; }
      b.addEventListener("pointerdown", function (ev) { ev.preventDefault(); hold(true); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (t) {
        b.addEventListener(t, function () { hold(false); });
      });
    });
    v3Hands(box.firstChild);
    var openBtn = el("#view3d-open");
    if (openBtn) { openBtn.setAttribute("aria-pressed", "true"); }
    if (!big) { v3Watch(); }
  }

  // From above, or walking round inside -- a home only.
  function v3Mode(mode) {
    if (!V3) { return; }
    if (document.pointerLockElement && document.exitPointerLock) { document.exitPointerLock(); }   // the mouse let go
    var to = V3.scene === "space" ? "orbit" : mode;
    if (to !== V3.mode) { v3Fade(420); }
    if (to === "walk" && V3.flat) {      // standing in it, it stands up
      V3.flat = false; V3.flatDone = false;
      ["rise", "pitch", "yaw"].forEach(function (k) { delete V3.tw[k]; });
      V3.rise = 1; V3.pitch = (V3.was && V3.was.pitch) || 1.05; V3.yaw = V3.was ? V3.was.yaw : -0.62;
      V3.roofV = V3.roof ? 1 : 0;
    }
    V3.mode = to;
    var inside = V3.mode === "walk";
    if (inside && !V3.me) { V3.me = v3Start(); }
    V3.keys = {};
    ["v3-where", "v3-cross", "v3-map", "v3-pad"].forEach(function (k) { el("." + k, V3.box).hidden = !inside; });
    V3.box.classList.toggle("walking", inside);
    V3.dirty = true;
    v3Words();
    V3.box.focus({ preventScroll: true });
  }

  function v3Words() {
    if (!V3) { return; }
    var scene = boardNow(), inside = V3.mode === "walk", home = V3.scene !== "space";
    el('[data-v3="run"]', V3.box).textContent = simNow ? TXT.r_stop
      : (scene ? TXT["go_" + scene.name] : TXT.r_run) || TXT.r_run;
    var mode = el('[data-v3="mode"]', V3.box);
    mode.textContent = inside ? TXT.v3_above : TXT.v3_walk;
    mode.hidden = !home;
    mode.setAttribute("aria-pressed", inside ? "true" : "false");
    el('[data-v3="low"]', V3.box).textContent = TXT.v3_low;
    el('[data-v3="low"]', V3.box).hidden = !home || inside || V3.flat;
    var flat = el('[data-v3="flat"]', V3.box);
    flat.textContent = V3.flat ? TXT.v3_3d : TXT.v3_2d;
    flat.title = V3.flat ? TXT.v3_3d_tip : TXT.v3_2d_tip;
    flat.setAttribute("aria-pressed", V3.flat ? "true" : "false");
    flat.hidden = inside;
    var roof = el('[data-v3="roof"]', V3.box);
    roof.textContent = TXT.v3_roof; roof.title = TXT.v3_roof_tip;
    roof.setAttribute("aria-pressed", V3.roof ? "true" : "false");
    roof.hidden = !home || V3.flat;
    var labels = el('[data-v3="labels"]', V3.box);
    labels.textContent = TXT.v3_labels; labels.title = TXT.v3_labels_tip;
    labels.setAttribute("aria-pressed", V3.labels ? "true" : "false");
    var floors = home ? floorsOf() : [], level = el('[data-v3="level"]', V3.box);
    var upTo = floors.filter(function (f) { return f.level === V3.upTo; })[0];
    if (!upTo) { V3.upTo = null; }
    level.hidden = inside || floors.length < 2 || V3.flat;   // flat, every floor shows
    var ground = floors.filter(function (f) { return f.level === 0; })[0] || floors[0];
    level.textContent = V3.flat ? (upTo || ground ? floorName(upTo || ground) : "")
      : upTo ? say("v3_up_to", { floor: floorName(upTo) }) : TXT.v3_all_floors;
    level.title = TXT.v3_floors_tip;
    el('[data-v3="fit"]', V3.box).textContent = inside ? TXT.v3_restart : TXT.fit;
    el(".v3-hint", V3.box).textContent = inside ? TXT.v3_hint_walk : V3.flat ? TXT.v3_hint_flat : TXT.v3_hint;
    el('[data-v3="shut"]', V3.box).title = TXT.v3_close;
    el('[data-v3="shut"]', V3.box).setAttribute("aria-label", TXT.v3_close);
    el(".v3-pad-door", V3.box).textContent = TXT.v3_door;
    // what the suggestions say, and how many there are (38-advice.js)
    var tips = home && typeof boardAdvice === "function" ? boardAdvice() : [];
    var advise = el('[data-v3="advice"]', V3.box);
    advise.hidden = !tips.length;
    advise.textContent = say("v3_tips", { n: tips.length });
    if (!el(".v3-advice", V3.box).hidden) { v3AdviceShow(true); }
  }

  // The suggestions, in a list over the view, each with its way of
  // putting it right where it has one.
  function v3AdviceShow(on) {
    var panel = el(".v3-advice", V3.box), button = el('[data-v3="advice"]', V3.box);
    panel.hidden = !on;
    button.setAttribute("aria-expanded", on ? "true" : "false");
    if (!on) { return; }
    panel.innerHTML = "";
    var tips = typeof boardAdvice === "function" ? boardAdvice() : [];
    if (!tips.length) { panel.hidden = true; return; }
    tips.forEach(function (tip) {
      var row = document.createElement("div");
      row.className = "v3-tip";
      var words = document.createElement("span");
      words.textContent = tip.text;
      row.appendChild(words);
      if (tip.fix && tip.fix.auto) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn small";
        b.textContent = tip.fix.says;
        b.onclick = function () { handMendNow(tip.fix); V3.dirty = true; v3Words(); };
        row.appendChild(b);
      }
      panel.appendChild(row);
    });
  }

  // Over the paper exactly, kept there as the page changes size.
  function v3Place() {
    if (!V3) { return; }
    var r = el("#stage").getBoundingClientRect();
    V3.box.style.left = r.left + "px"; V3.box.style.top = r.top + "px";
    V3.box.style.width = r.width + "px"; V3.box.style.height = r.height + "px";
    V3.dirty = true;
  }
  window.addEventListener("resize", function () { if (V3) { v3Place(); } });

  // Flat, like the plan, straight down on it -- or stood up in 3D again,
  // looked at from where it was: the walls go down or come up, the roof
  // lifts off or settles on, and the view turns, all together.
  function v3Flat(on) {
    if (!V3) { return; }
    if (V3.mode === "walk") { v3Mode("orbit"); }
    V3.yaw = Math.atan2(Math.sin(V3.yaw), Math.cos(V3.yaw));
    V3.flat = on;
    if (on) {
      V3.was = { pitch: v3Goal("pitch"), yaw: Math.atan2(Math.sin(v3Goal("yaw")), Math.cos(v3Goal("yaw"))) };
    }
    // the whole of it in view, as it will be looked at
    var aim = v3Aim(v3Build(), on ? { pitch: Math.PI / 2, yaw: 0, rise: 0 }
                                 : { pitch: (V3.was && V3.was.pitch) || 1.05, yaw: V3.was ? V3.was.yaw : -0.62, rise: 1 });
    // flat, it lies exactly over the drawing on the paper
    if (on && V3.scene !== "space") { aim = v3Paper() || aim; }
    ["scale", "panX", "panY"].forEach(function (k) { v3Tween(k, aim[k], 750); });
    if (on) {
      v3Tween("roofV", 0, 350);
      v3Tween("pitch", Math.PI / 2, 750);
      v3Tween("yaw", 0, 750);
      v3Tween("rise", 0, 750, 0, function () {
        if (V3 && V3.flat && !V3.flatDone) { v3Fade(250); V3.flatDone = true; V3.dirty = true; v3Words(); }
      });
    } else {
      if (V3.flatDone) { v3Fade(250); }
      V3.flatDone = false;
      v3Tween("rise", 1, 800);
      v3Tween("pitch", (V3.was && V3.was.pitch) || 1.05, 800);
      v3Tween("yaw", V3.was ? V3.was.yaw : -0.62, 800);
      if (V3.roof) { v3Tween("roofV", 1, 600, 500); }
    }
    v3Words();
  }

  // Where the drawing is on the paper now, as the view looks straight down
  // (pitch a right angle, turned not at all, walls down): the zoom and the
  // place that puts each thing exactly over its drawing -- by the paper's
  // own transform (getScreenCTM) and where by-hand numbers start on it
  // (handOrigin).  Null when there is no paper to line up with.
  function v3Paper() {
    var svg = typeof chart !== "undefined" ? chart : null;
    var M = svg && svg.getScreenCTM && svg.getScreenCTM();
    if (!M || !V3 || V3.cx === undefined) { return null; }
    var r = V3.box.getBoundingClientRect(), ox = handOrigin.x, oy = handOrigin.y;
    var sx = M.a * (V3.cx + ox) + M.c * (V3.cy + oy) + M.e - r.left;
    var sy = M.b * (V3.cx + ox) + M.d * (V3.cy + oy) + M.f - r.top;
    return { scale: Math.hypot(M.a, M.b) || 1, panX: sx - V3.w / 2, panY: sy - V3.h / 2 };
  }

  // Out: back down onto the paper the way it came up off it, then gone.
  function v3Leave() {
    if (!V3 || V3.leaving) { return; }
    // still being made: that stopped (40-work.js)
    if (V3.warming) { var job = V3.warming; V3.warming = null; if (typeof workStop === "function") { workStop(job); } }
    if (v3Still() || (V3.scene !== "space" && v3Big())) { v3Close(); return; }
    V3.leaving = true;
    if (V3.mode !== "walk") {
      V3.yaw = Math.atan2(Math.sin(V3.yaw), Math.cos(V3.yaw));
      var paper = V3.scene !== "space" ? v3Paper() : null;   // back down onto the drawing itself
      if (paper) { ["scale", "panX", "panY"].forEach(function (k) { v3Tween(k, paper[k], 420); }); }
      v3Tween("labelV", 0, 200);
      v3Tween("roofV", 0, 250);
      v3Tween("rise", 0, 420);
      v3Tween("pitch", Math.PI / 2, 420);
      v3Tween("yaw", 0, 420);
    }
    V3.box.classList.add("closing");
    var going = V3;
    setTimeout(function () { if (V3 === going) { v3Close(); } }, 460);
  }

  // A view's switches, as the viewer last left them (this browser only).
  function v3Pref(name, value) {
    var key = "flowchart-3d-" + name;
    try {
      if (value === undefined) { return localStorage.getItem(key) !== "off"; }
      localStorage.setItem(key, value ? "on" : "off");
    } catch (e) { /* on for this visit, then */ }
    return value === undefined ? true : value;
  }

  function v3Close() {
    if (!V3) { return; }
    if (document.pointerLockElement && document.exitPointerLock) { document.exitPointerLock(); }
    if (V3.box.parentNode) { V3.box.parentNode.removeChild(V3.box); }
    V3 = null;
    var openBtn = el("#view3d-open");
    if (openBtn) { openBtn.setAttribute("aria-pressed", "false"); }
  }

  // From above: turned by dragging, nearer by the wheel or by two fingers
  // apart, moved with Shift (or the right button) held; double-click to
  // fit.  Inside: a drag looks round, the wheel walks, a click (one that
  // did not drag) opens the door in front.
  function v3Hands(canvas) {
    var downs = {}, pinch = null, dragged = 0;
    canvas.addEventListener("pointerdown", function (ev) {
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
      downs[ev.pointerId] = { x: ev.clientX, y: ev.clientY, pan: ev.shiftKey || ev.button === 2 || ev.button === 1 };
      dragged = 0;
      v3Hold();
      var ids = Object.keys(downs);
      if (ids.length === 2) {
        var a = downs[ids[0]], b = downs[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale: V3.scale, mid: [(a.x + b.x) / 2, (a.y + b.y) / 2], ang: Math.atan2(b.y - a.y, b.x - a.x) };
      }
      V3.box.focus({ preventScroll: true });
      ev.preventDefault();
    });
    canvas.addEventListener("pointermove", function (ev) {
      var was = downs[ev.pointerId];
      if (!was || !V3) { return; }
      var dx = ev.clientX - was.x, dy = ev.clientY - was.y;
      was.x = ev.clientX; was.y = ev.clientY;
      dragged += Math.abs(dx) + Math.abs(dy);
      // (2026-10-01: "the dragging and camera controls are inversed")  A drag
      // takes hold of what is seen and pulls it, walking or from above: the
      // view follows the hand.  Looking with the mouse, the mouse locked to
      // the view (below), it is the other way, as in a game.
      if (V3.mode === "walk") {
        if (document.pointerLockElement === canvas) { return; }
        V3.me.head -= dx * 0.005;
        V3.me.pitch = Math.max(-V3_LOOK_DOWN, Math.min(0.9, V3.me.pitch + dy * 0.004));
        V3.dirty = true;
        return;
      }
      var ids = Object.keys(downs);
      if (ids.length === 2 && pinch) {
        var a = downs[ids[0]], b = downs[ids[1]];
        V3.scale = Math.max(0.05, Math.min(8, pinch.scale * (Math.hypot(a.x - b.x, a.y - b.y) || 1) / pinch.d));
        // (2026-10-02: "make it so the 3d mode works on mobile for dragging
        // around")  Two fingers move it as they go, and turn it as they turn.
        var mid = [(a.x + b.x) / 2, (a.y + b.y) / 2], ang = Math.atan2(b.y - a.y, b.x - a.x);
        V3.panX += mid[0] - pinch.mid[0]; V3.panY += mid[1] - pinch.mid[1];
        if (!V3.flat) { V3.yaw += Math.atan2(Math.sin(ang - pinch.ang), Math.cos(ang - pinch.ang)); }
        pinch.mid = mid; pinch.ang = ang;
      } else if (was.pan || V3.flat) {
        V3.panX += dx; V3.panY += dy;
      } else {
        V3.yaw -= dx * 0.006;
        V3.pitch = Math.max(0.22, Math.min(Math.PI / 2, V3.pitch + dy * 0.005));
      }
      V3.dirty = true;
    });
    // Looking with the mouse, walking: a click on the view locks the mouse
    // to it, and moving it looks round -- no button held; a click then uses
    // what is in front (a door, as E does), and Esc lets the mouse go.
    canvas.addEventListener("mousemove", function (ev) {
      if (!V3 || V3.mode !== "walk" || document.pointerLockElement !== canvas) { return; }
      V3.me.head += (ev.movementX || 0) * 0.0025;
      V3.me.pitch = Math.max(-V3_LOOK_DOWN, Math.min(0.9, V3.me.pitch - (ev.movementY || 0) * 0.0022));
      V3.dirty = true;
    });
    function up(ev) {
      delete downs[ev.pointerId];
      if (Object.keys(downs).length < 2) { pinch = null; }
      if (ev.type === "pointerup" && V3 && V3.mode === "walk" && dragged < 6) {
        // (a click on a door or on something to use, uses it: 39-inside.js)
        var rc = canvas.getBoundingClientRect();
        if (document.pointerLockElement !== canvas && typeof v3ClickUse === "function" && v3ClickUse((ev.clientX - rc.left) * (V3.w / (rc.width || V3.w)))) { return; }
        if (document.pointerLockElement === canvas || ev.pointerType !== "mouse" || !canvas.requestPointerLock) { v3UseDoor(); }
        else {
          try { var p = canvas.requestPointerLock(); if (p && p.catch) { p.catch(function () { /* not allowed here */ }); } } catch (e) { /* fine */ }
        }
      }
    }
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });
    canvas.addEventListener("dblclick", function () { if (V3.mode !== "walk") { v3FitSoon(); } });
    canvas.addEventListener("wheel", function (ev) {
      ev.preventDefault();
      v3Hold();
      if (V3.mode === "walk") {
        var step = Math.max(-30, Math.min(30, -ev.deltaY * 0.25)), me = V3.me, bits = Math.ceil(Math.abs(step) / 4) || 1;
        for (var b = 0; b < bits; b++) {         // a wall's thickness at a time, as walking
          var nx = me.x + Math.cos(me.head) * step / bits, ny = me.y + Math.sin(me.head) * step / bits;
          if (!v3Blocked(nx, me.y)) { me.x = nx; }
          if (!v3Blocked(me.x, ny)) { me.y = ny; }
        }
        v3Stairs();
        V3.dirty = true;
        return;
      }
      var r = canvas.getBoundingClientRect();
      var mx = ev.clientX - r.left - V3.w / 2, my = ev.clientY - r.top - V3.h / 2;
      var k = Math.exp(-ev.deltaY * 0.0015);
      var to = Math.max(0.05, Math.min(8, V3.scale * k));
      k = to / V3.scale;
      V3.panX = mx - (mx - V3.panX) * k; V3.panY = my - (my - V3.panY) * k;
      V3.scale = to;
      V3.dirty = true;
    }, { passive: false });
    var WALK_KEYS = { w: 1, a: 1, s: 1, d: 1, arrowup: 1, arrowdown: 1, arrowleft: 1, arrowright: 1, shift: 1 };
    var GLIDE_KEYS = { w: 1, a: 1, s: 1, d: 1, shift: 1 };
    // The letters by where they are on the keyboard, not what is printed on
    // them: W A S D on one is Z Q S D on a French one, in the same place.
    var BY_PLACE = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", KeyQ: "q", KeyE: "e" };
    function keyOf(ev) { return BY_PLACE[ev.code] || (ev.key || "").toLowerCase(); }
    V3.box.addEventListener("keydown", function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest("button, input")) { return; }
      var key = keyOf(ev);
      if (key === "escape") {
        // (2026-10-02: "more straight forward and easy to go back") back to
        // the plan, walking or not -- a locked mouse is let go by the browser
        // itself, before this hears of it
        v3Leave();
        ev.stopPropagation(); return;
      }
      // what is pressed here is the view's: Delete, say, is not for the
      // shape picked on the paper underneath it
      if (key !== "tab") { ev.stopPropagation(); }
      if (V3.mode === "walk") {
        if (key === "e" || key === " " || key === "enter") { v3UseDoor(); }
        else if (WALK_KEYS[key]) { V3.keys[key] = true; }
        else { return; }
        ev.preventDefault();
        return;
      }
      if (GLIDE_KEYS[key]) {             // from above: W A S D move over it (v3Glide)
        v3Hold();
        V3.keys[key] = true;
        ev.preventDefault();
        return;
      }
      var turn = { arrowleft: [-0.12, 0], arrowright: [0.12, 0], arrowup: [0, -0.08], arrowdown: [0, 0.08] }[key];
      if (!turn) { return; }
      v3Hold();
      if (V3.flat) {                     // flat, the arrows move it
        V3.panX -= turn[0] * 300; V3.panY -= turn[1] * 450;
        V3.dirty = true;
        ev.preventDefault(); ev.stopPropagation();
        return;
      }
      V3.yaw += turn[0];
      V3.pitch = Math.max(0.22, Math.min(Math.PI / 2, V3.pitch + turn[1]));
      V3.dirty = true;
      ev.preventDefault(); ev.stopPropagation();
    });
    V3.box.addEventListener("keyup", function (ev) {
      var key = keyOf(ev);
      if (V3 && V3.keys[key]) { delete V3.keys[key]; }
    });
    // a key let go of while the view is not looking does not keep walking
    V3.box.addEventListener("blur", function () { if (V3) { V3.keys = {}; } }, true);
    V3.box.tabIndex = -1;
    V3.box.focus({ preventScroll: true });
  }

  if (el("#view3d-open")) { el("#view3d-open").onclick = function () { if (V3) { v3Leave(); } else { v3Open(); } }; }

  // Kept in step: a run starting or ending changes its Run button, the
  // drawing changing changes what is put up, and a drawing that is no
  // longer a home or a sky -- or no longer by hand -- puts it away.
  var dressBoardFlat = dressBoard;
  dressBoard = function () {
    dressBoardFlat.apply(this, arguments);
    if (!V3) { return; }
    var scene = byHand && boardNow();
    if (!scene || (scene.name !== "home" && scene.name !== "space")) { v3Close(); return; }
    if (scene.name !== V3.scene) {
      V3.scene = scene.name; V3.box.classList.toggle("sky", scene.name === "space"); V3.fitNext = true;
      if (scene.name === "space") { v3Mode("orbit"); }
    }
    V3.dirty = true;
    v3Words();
  };
