// ---------------------------------------------------------------------------
//  40-things3d.js -- the things drawn as pictures (a printer, a laptop, a
//  car, a tree...) made in 3D in a home or a building, at their own sizes
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "some things do not have 3D models too like the
  // printer")  The devices, the vehicles and a few things besides are
  // drawn on the plan as figures -- pictures, like the people -- and in 3D
  // they stood up as flat pictures turned to the eye.  In a home or a
  // building they are made now: each its own model (38-models.js), its own
  // size whatever the size of its picture on the plan (a printer is not a
  // metre across), standing on the floor, on what is under it, or hung on
  // a wall.  Elsewhere -- a network drawn, a circuit, space -- they are
  // still the pictures they are drawn as.
  //
  // [across, front to back] in metres, as it is
  var OBJ3_REAL = {
    i_printer: [0.6, 0.55], i_computer: [0.62, 0.32], i_laptop: [0.34, 0.24], i_tablet: [0.25, 0.18], i_phone: [0.08, 0.16],
    i_server: [0.6, 1.0], i_database: [0.6, 0.9], i_router: [0.26, 0.16], i_switch: [0.44, 0.22], i_firewall: [0.44, 0.26],
    i_wifi: [0.2, 0.06], i_camera: [0.14, 0.3], i_tower: [1.4, 1.4],
    i_car: [4.4, 1.8], i_taxi: [4.6, 1.82], i_truck: [6.8, 2.4], i_bus: [11, 2.5], i_bike: [1.75, 0.6], i_scooter: [1.8, 0.7],
    i_tree: [3.6, 3.6], i_traffic: [0.45, 0.45],
    i_clock: [0.32, 0.06], i_book: [0.16, 0.23], i_trophy: [0.16, 0.16], i_gift: [0.32, 0.32], i_package: [0.42, 0.32],
    i_cart: [0.95, 0.56]
  };
  // how high, standing on the floor (metres)
  Object.assign(V3_HIGH, { i_printer: 1.02, i_server: 2.0, i_database: 1.25, i_tower: 9, i_car: 1.45, i_taxi: 1.62, i_truck: 3.0,
                           i_bus: 3.1, i_bike: 1.05, i_scooter: 1.15, i_tree: 5.5, i_traffic: 3.4, i_cart: 1.0 });
  // standing on whatever is under it -- a desk, a table, a shelf, the floor
  ["i_computer", "i_laptop", "i_tablet", "i_phone", "i_router", "i_switch", "i_firewall", "i_book", "i_trophy", "i_gift", "i_package"]
    .forEach(function (k) { ON_TOP[k] = true; });
  Object.assign(V3_ON, { i_computer: 0.46, i_laptop: 0.23, i_tablet: 0.012, i_phone: 0.01, i_router: 0.17, i_switch: 0.045,
                         i_firewall: 0.045, i_book: 0.04, i_trophy: 0.32, i_gift: 0.26, i_package: 0.3 });
  // hung on a wall, from and to (metres up it)
  Object.assign(V3_WALL, { i_wifi: [2.2, 2.27], i_camera: [2.12, 2.34], i_clock: [1.85, 2.17] });

  if (typeof v3ModelPut === "function") {
    var v3ModelPutPictures = v3ModelPut;
    v3ModelPut = function (faces, n) {
      var R = OBJ3_REAL[n.kind];
      if (!R || !ICONS[n.kind] || !ICONS[n.kind].fig) { return v3ModelPutPictures.apply(this, arguments); }
      if (typeof tieHomeLike === "function" && !tieHomeLike()) { return false; }      // a picture, as drawn
      // its own size -- larger or smaller as its picture was made larger or smaller
      var k = Math.max(0.4, Math.min(3, (n.w || 48) / 48)), P = FLOOR_PX;
      var args = Array.prototype.slice.call(arguments);
      // (a tree's crown as wide as its kind grows, where it says: 40-edit3d.js)
      args[1] = Object.assign({}, n, n.crown > 0 ? { w: n.crown * P, h: n.crown * P } : { w: R[0] * P * k, h: R[1] * P * k });
      return v3ModelPutPictures.apply(this, args);
    };
  }

  // ---- devices ----------------------------------------------------------------------------------
  function obj3Leds(M, x0, x1, y, z, colors) {
    colors.forEach(function (c, i) {
      var x = x0 + (x1 - x0) * (i + 0.5) / colors.length;
      M.box(x - 0.25 * cm, x + 0.25 * cm, y, y + 0.15 * cm, z - 0.25 * cm, z + 0.25 * cm, M.mat("glow", c));
    });
  }
  // an office printer that copies and scans: drawers in a stand, the printer, the scanner's lid
  mDef("i_printer", function (M, W, D, H, C) {
    C = mPick(C, "#e6e5e1", "#3c3e42");
    var body = M.mat("plastic", C.main), dark = M.mat("plastic", C.frame), y1 = D / 2;
    var base = H * 0.52, top = H * 0.88;
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2 + 1 * cm, D / 2 - 1 * cm, 0, 4 * cm, dark);                 // the plinth, on castors
    M.box(-W / 2, W / 2, -D / 2, D / 2, 4 * cm, base, body, 1 * cm);
    [0.2, 0.47, 0.74].forEach(function (t) {                                                          // three drawers of paper
      var z = 4 * cm + (base - 4 * cm) * t;
      M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1, y1 + 0.3 * cm, z - 0.2 * cm, z + 0.2 * cm, dark);
      M.box(-W * 0.18, W * 0.18, y1, y1 + 1 * cm, z + 3 * cm, z + 4 * cm, dark, 0.3 * cm);
    });
    M.box(-W / 2, W / 2, -D / 2, D / 2, base, top, body, 1.5 * cm);                                  // the printer
    M.box(-W * 0.34, W * 0.3, -D * 0.2, D / 2 + 0.2 * cm, base + (top - base) * 0.42, base + (top - base) * 0.52, dark);   // where it comes out
    M.box(-W * 0.3, W * 0.26, -D * 0.16, D * 0.44, base + (top - base) * 0.44, base + (top - base) * 0.47, M.mat("linen", "#fbfaf6"));
    M.box(-W / 2, W / 2, -D / 2, D / 2 - 2 * cm, top, H, body, 1 * cm);                              // the scanner's lid
    M.push().move(W * 0.32, D / 2 - 6 * cm, top + 2 * cm).tiltX(-28);                              // its panel, tilted up at the front
    mScreen(M, -9 * cm, 9 * cm, -1 * cm, 1 * cm, 0, 9 * cm, C.frame);
    M.pop();
    obj3Leds(M, W * 0.18, W * 0.28, y1 + 0.2 * cm, top + 1 * cm, ["#5fd17a", "#f2b84b"]);
  });
  // a computer on a desk: its screen, a keyboard and a mouse
  mDef("i_computer", function (M, W, D, H, C) {
    C = mPick(C, "#1b1d20", "#2b2d31");
    var frame = M.mat("metal", C.frame), sw = W * 0.92, sh = Math.min(sw * 0.58, H * 0.72), sy = -D / 2 + 4 * cm;
    M.box(-W * 0.16, W * 0.16, sy - 3 * cm, sy + 5 * cm, 0, 0.8 * cm, frame, 0.4 * cm);
    M.box(-2 * cm, 2 * cm, sy - 2 * cm, sy, 0.8 * cm, H - sh + 4 * cm, frame);
    mScreen(M, -sw / 2, sw / 2, sy - 1.5 * cm, sy + 1 * cm, H - sh, H, C.main);
    var ky = D / 2 - 7 * cm;
    M.box(-W * 0.34, W * 0.24, ky - 6 * cm, ky + 6 * cm, 0, 1.6 * cm, M.mat("plastic", "#2a2c30"), 0.5 * cm);   // the keyboard
    for (var r = 0; r < 4; r++) {
      M.box(-W * 0.32, W * 0.22, ky - 5 * cm + r * 2.7 * cm, ky - 3.4 * cm + r * 2.7 * cm, 1.6 * cm, 1.9 * cm, M.mat("plastic", "#3b3e43"), 0.2 * cm);
    }
    M.ball(W * 0.36, ky, 1.2 * cm, 3 * cm, 5 * cm, 1.8 * cm, M.mat("plastic", "#2a2c30"), { lat0: 0 });  // the mouse
  });
  // a laptop, open: its keys, and the screen leant back from the hinge
  mDef("i_laptop", function (M, W, D, H, C) {
    C = mPick(C, "#b9bcc1", "#1b1d20");
    var alu = M.mat("metal", C.main), lid = Math.min(D, H * 1.05);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 1.6 * cm, alu, 0.6 * cm);
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, -D / 2 + 2 * cm, D * 0.08, 1.6 * cm, 1.7 * cm, M.mat("plastic", "#24262a"));  // the keys
    M.box(-W * 0.14, W * 0.14, D * 0.16, D / 2 - 2 * cm, 1.6 * cm, 1.65 * cm, M.mat("plastic", "#9da1a7"));               // the pad
    M.push().move(0, -D / 2 + 0.4 * cm, 1.6 * cm).tiltX(14);
    M.box(-W / 2, W / 2, -0.7 * cm, 0, 0, lid, alu, 0.4 * cm);
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, 0, 0.05 * cm, 1 * cm, lid - 1 * cm, M.mat("screen", "#0c0e12"));
    M.pop();
  });
  function obj3Slab(M, W, D, H, C, rim) {
    C = mPick(C, "#1d1f23", "#3a3d42");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("metal", C.frame), Math.min(W, D) * 0.12);
    M.box(-W / 2 + rim, W / 2 - rim, -D / 2 + rim * 1.6, D / 2 - rim * 1.6, H, H + 0.05 * cm, M.mat("screen", "#0c0e12"));
  }
  mDef("i_tablet", function (M, W, D, H, C) { obj3Slab(M, W, D, Math.max(0.6 * cm, H), C, 1 * cm); });
  mDef("i_phone", function (M, W, D, H, C) { obj3Slab(M, W, D, Math.max(0.8 * cm, H), C, 0.4 * cm); });
  // a rack of servers: the frame, a perforated door in front of the units, their lights
  mDef("i_server", function (M, W, D, H, C) {
    C = mPick(C, "#1c1e22", "#33363b");
    var frame = M.mat("metal", C.main), unit = M.mat("metal", C.frame), y1 = D / 2;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 6 * cm, frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 4 * cm, H, frame, 0.5 * cm);
    [-1, 1].forEach(function (s) { M.box(s * W / 2 - s * 3 * cm, s * W / 2, -D / 2, D / 2, 6 * cm, H - 4 * cm, frame); });
    M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, -D / 2, -D / 2 + 2 * cm, 6 * cm, H - 4 * cm, frame);
    var rnd = mRand(29), z = 10 * cm;
    while (z < H - 14 * cm) {
      var u = (1 + Math.floor(rnd() * 3)) * 4.45 * cm;
      M.box(-W / 2 + 3.5 * cm, W / 2 - 3.5 * cm, -D / 2 + 3 * cm, y1 - 4 * cm, z, z + u - 0.4 * cm, unit, 0.3 * cm);
      obj3Leds(M, -W * 0.3, -W * 0.05, y1 - 4 * cm, z + u / 2, rnd() < 0.5 ? ["#5fd17a", "#5fd17a", "#4ea3ff"] : ["#5fd17a", "#f2b84b"]);
      z += u + 0.3 * cm;
    }
    M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, y1 - 1.2 * cm, y1 - 0.8 * cm, 8 * cm, H - 6 * cm, M.mat("glass", "#1a1c20"));     // the door
    M.box(W / 2 - 6 * cm, W / 2 - 4.5 * cm, y1 - 0.8 * cm, y1 + 1.5 * cm, H * 0.45, H * 0.55, M.mat("chrome", "#cfd3d8"));   // its handle
  });
  // storage: a cabinet of disks, row on row
  mDef("i_database", function (M, W, D, H, C) {
    C = mPick(C, "#2a2d32", "#4b5058");
    var body = M.mat("metal", C.main), y1 = D / 2;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, body, 1 * cm);
    for (var r = 0; r < 6; r++) {
      var z0 = 8 * cm + r * (H - 14 * cm) / 6;
      for (var c = 0; c < 8; c++) {
        var x0 = -W / 2 + 4 * cm + c * (W - 8 * cm) / 8;
        M.box(x0 + 0.3 * cm, x0 + (W - 8 * cm) / 8 - 0.3 * cm, y1, y1 + 0.6 * cm, z0, z0 + (H - 14 * cm) / 6 - 1 * cm, M.mat("metal", C.frame), 0.2 * cm);
      }
      obj3Leds(M, -W / 2 + 4 * cm, W / 2 - 4 * cm, y1 + 0.6 * cm, z0 + 2 * cm, ["#5fd17a", "#5fd17a", "#5fd17a", "#4ea3ff", "#5fd17a", "#5fd17a", "#f2b84b", "#5fd17a"]);
    }
  });
  // a router: a low box, its aerials up behind
  mDef("i_router", function (M, W, D, H, C) {
    C = mPick(C, "#f2f1ee", "#2b2d31");
    var body = M.mat("plastic", C.main), z1 = Math.min(H, 4 * cm);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, z1, body, 1.2 * cm);
    obj3Leds(M, -W * 0.35, W * 0.1, D / 2, z1 * 0.55, ["#5fd17a", "#5fd17a", "#4ea3ff", "#5fd17a", "#f2b84b"]);
    [-0.36, 0, 0.36].forEach(function (t, i) {
      M.push().move(W * t, -D / 2 + 1.5 * cm, z1).tiltY((i - 1) * 12);
      M.cyl(0, 0, 0, H - z1, 0.6 * cm, M.mat("plastic", C.frame), { seg: 8, r1: 0.45 * cm });
      M.pop();
    });
  });
  // a network switch, or a firewall: a flat box, a row of ports, their lights
  function obj3Rack1u(M, W, D, H, C, face) {
    var body = M.mat("metal", C.main), y1 = D / 2, z1 = Math.max(3 * cm, H);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, z1, body, 0.3 * cm);
    if (face) { M.box(-W / 2, -W * 0.3, y1, y1 + 0.2 * cm, 0.4 * cm, z1 - 0.4 * cm, M.mat("plastic", face)); }
    for (var i = 0; i < 12; i++) {
      var x = -W * 0.22 + i * W * 0.055;
      M.box(x, x + 1.2 * cm, y1, y1 + 0.15 * cm, z1 * 0.25, z1 * 0.7, M.mat("plastic", "#111214"));
    }
    obj3Leds(M, -W * 0.22, W * 0.44, y1 + 0.15 * cm, z1 * 0.85, ["#5fd17a", "#5fd17a", "#5fd17a", "#f2b84b", "#5fd17a", "#5fd17a"]);
  }
  mDef("i_switch", function (M, W, D, H, C) { obj3Rack1u(M, W, D, H, mPick(C, "#3a3d42", "#2b2d31"), null); });
  mDef("i_firewall", function (M, W, D, H, C) { obj3Rack1u(M, W, D, H, mPick(C, "#2f3236", "#2b2d31"), "#b8352e"); });
  // on the wall: a wireless point, round and flat, its light in the middle
  mDef("i_wifi", function (M, W, D, H, C) {
    C = mPick(C, "#f4f3f0", "#c9ccd0");
    M.push().move(0, -D / 2, H / 2).tiltX(-90);
    M.cyl(0, 0, 0, D * 0.8, W / 2, M.mat("plastic", C.main), { seg: 26, r1: W * 0.46 });
    M.cyl(0, 0, D * 0.8, D * 0.82, W * 0.06, M.mat("glow", "#4ea3ff"), { seg: 12 });
    M.pop();
  });
  // a camera watching from up a wall: its bracket, and it pointed down into the room
  mDef("i_camera", function (M, W, D, H, C) {
    C = mPick(C, "#eceae6", "#2b2d31");
    var body = M.mat("plastic", C.main);
    M.box(-W * 0.4, W * 0.4, -D / 2, -D / 2 + 1.2 * cm, 0, H, body, 0.4 * cm);
    M.tube([0, -D / 2 + 1 * cm, H * 0.5], [0, -D * 0.05, H * 0.62], 1.2 * cm, body, 8);
    M.push().move(0, -D * 0.05, H * 0.6).tiltX(-22);
    M.box(-W * 0.42, W * 0.42, -2 * cm, D * 0.5, -H * 0.28, H * 0.28, body, 2 * cm);
    M.box(-W * 0.42, W * 0.42, -1 * cm, D * 0.56, H * 0.24, H * 0.32, M.mat("plastic", "#d8d6d0"), 1 * cm);        // its hood
    M.push().move(0, D * 0.5, 0).tiltX(-90);
    M.cyl(0, 0, 0, 0.6 * cm, H * 0.18, M.mat("glass", "#14161a"), { seg: 16 });
    M.pop();
    M.pop();
  });
  // a radio mast: four legs leaning in, braced across, the aerials at the top
  mDef("i_tower", function (M, W, D, H, C) {
    C = mPick(C, "#c9cdd2", "#c4382e");
    var steel = M.mat("metal", C.main), r0 = W / 2, r1 = W * 0.12, corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    function at(c, t) { var r = r0 + (r1 - r0) * t; return [c[0] * r, c[1] * r, H * 0.92 * t]; }
    corners.forEach(function (c) { M.tube(at(c, 0), at(c, 1), 3 * cm, steel, 6); });
    for (var k = 0; k < 8; k++) {
      var t0 = k / 8, t1 = (k + 1) / 8;
      for (var i = 0; i < 4; i++) {
        var a = corners[i], b = corners[(i + 1) % 4];
        M.tube(at(a, t0), at(b, t1), 1.2 * cm, steel, 4);
        M.tube(at(a, t1), at(b, t1), 1.2 * cm, steel, 4);
      }
    }
    M.cyl(0, 0, H * 0.92, H, 3 * cm, steel, { seg: 8 });
    [0, 1, 2].forEach(function (i) {
      var a = i / 3 * Math.PI * 2;
      M.box(Math.cos(a) * r1 - 4 * cm, Math.cos(a) * r1 + 4 * cm, Math.sin(a) * r1 - 4 * cm, Math.sin(a) * r1 + 4 * cm,
            H * 0.8, H * 0.9, M.mat("plastic", "#eceae6"), 1 * cm);
    });
    M.ball(0, 0, H, 7 * cm, 7 * cm, 7 * cm, M.mat("glow", C.frame), { seg: 8 });
  });

  // ---- vehicles -----------------------------------------------------------------------------------
  // A wheel, its tyre and its hub, the axle across the vehicle (along y).
  function obj3Wheel(M, x, y, r, w, hub) {
    M.push().move(x, y, r).tiltX(90);
    M.cyl(0, 0, -w / 2, w / 2, r, M.mat("rubber", "#1b1b1d"), { seg: 18, bottom: true });
    M.cyl(0, 0, w / 2 - 0.4 * cm, w / 2 + 0.2 * cm, r * 0.6, M.mat("chrome", hub || "#b9bdc2"), { seg: 14 });
    M.cyl(0, 0, -w / 2 - 0.2 * cm, -w / 2 + 0.4 * cm, r * 0.6, M.mat("chrome", hub || "#b9bdc2"), { seg: 14 });
    M.pop();
  }
  // a car: long along x, its nose to +x
  function obj3Car(M, W, D, H, C, taxi) {
    C = mPick(C, taxi ? "#f2c418" : "#2f4a6a", "#1c1e22");
    var paint = M.mat("lacquer", C.main), glass = M.mat("glass", "#1a2430"), r = Math.min(0.33 * FLOOR_PX, H * 0.22);
    var L = W / 2, S = D / 2, sill = r * 0.9, belt = H * 0.58;
    M.box(-L, L, -S, S, sill, belt, paint, 8 * cm);                                                   // the body
    M.box(-L * 0.62, L * 0.28, -S + 6 * cm, S - 6 * cm, belt - 2 * cm, H - 3 * cm, glass, 10 * cm);    // the cabin's glass
    M.box(-L * 0.55, L * 0.2, -S + 8 * cm, S - 8 * cm, H - 4 * cm, H, paint, 8 * cm);               // its roof
    [[L * 0.62, 1], [L * 0.62, -1], [-L * 0.64, 1], [-L * 0.64, -1]].forEach(function (w) {
      obj3Wheel(M, w[0], w[1] * (S - 10 * cm), r, 20 * cm);
    });
    [-1, 1].forEach(function (s) {
      M.box(L - 1 * cm, L + 0.3 * cm, s * S * 0.62 - 9 * cm, s * S * 0.62 + 9 * cm, belt - 14 * cm, belt - 6 * cm, M.mat("glow", "#fff4d6"), 1 * cm);   // lamps
      M.box(-L - 0.3 * cm, -L + 1 * cm, s * S * 0.66 - 8 * cm, s * S * 0.66 + 8 * cm, belt - 13 * cm, belt - 6 * cm, M.mat("glow", "#c2241c"), 1 * cm);
    });
    M.box(L - 1 * cm, L + 1.5 * cm, -S * 0.9, S * 0.9, sill + 2 * cm, sill + 9 * cm, M.mat("plastic", "#1c1e22"), 2 * cm);    // bumpers
    M.box(-L - 1.5 * cm, -L + 1 * cm, -S * 0.9, S * 0.9, sill + 2 * cm, sill + 9 * cm, M.mat("plastic", "#1c1e22"), 2 * cm);
    if (taxi) {
      M.box(-L * 0.25, -L * 0.05, -S * 0.25, S * 0.25, H, H + 12 * cm, M.mat("glow", "#fff7c2"), 2 * cm);
      M.box(-L * 0.25, -L * 0.05, -S * 0.25, S * 0.25, H, H + 2 * cm, M.mat("plastic", "#1c1e22"));
    }
  }
  mDef("i_car", function (M, W, D, H, C) { obj3Car(M, W, D, H, C, false); });
  mDef("i_taxi", function (M, W, D, H, C) { obj3Car(M, W, D, H * 0.9, C, true); });
  // a lorry: its cab at the front, the load behind
  mDef("i_truck", function (M, W, D, H, C) {
    C = mPick(C, "#c9ced3", "#b8352e");
    var r = 0.48 * FLOOR_PX, L = W / 2, S = D / 2, cab = W * 0.26;
    M.box(-L, L, -S + 8 * cm, S - 8 * cm, r * 0.6, r * 1.1, M.mat("metal", "#2a2c30"));
    M.box(L - cab, L, -S, S, r * 0.9, H * 0.86, M.mat("lacquer", C.frame), 8 * cm);
    M.box(L - 4 * cm, L + 0.5 * cm, -S + 10 * cm, S - 10 * cm, H * 0.5, H * 0.8, M.mat("glass", "#1a2430"), 3 * cm);
    M.box(-L, L - cab - 10 * cm, -S, S, r * 1.1, H, M.mat("metal", C.main), 3 * cm);
    [L - cab * 0.5, -L * 0.3, -L * 0.62].forEach(function (x) { [-1, 1].forEach(function (s) { obj3Wheel(M, x, s * (S - 14 * cm), r, 26 * cm); }); });
    [-1, 1].forEach(function (s) {
      M.box(L - 1 * cm, L + 0.3 * cm, s * S * 0.7 - 10 * cm, s * S * 0.7 + 10 * cm, r * 1.3, r * 1.6, M.mat("glow", "#fff4d6"), 1 * cm);
    });
  });
  // a bus: long, a row of windows down each side, its doors
  mDef("i_bus", function (M, W, D, H, C) {
    C = mPick(C, "#d9a426", "#1c1e22");
    var r = 0.5 * FLOOR_PX, L = W / 2, S = D / 2;
    M.box(-L, L, -S, S, r * 0.7, H, M.mat("lacquer", C.main), 12 * cm);
    M.box(-L + 30 * cm, L - 10 * cm, -S - 0.5 * cm, S + 0.5 * cm, H * 0.55, H * 0.86, M.mat("glass", "#1a2430"));
    M.box(L - 0.5 * cm, L + 0.5 * cm, -S + 12 * cm, S - 12 * cm, H * 0.42, H * 0.9, M.mat("glass", "#1a2430"));
    M.box(L * 0.55, L * 0.75, S - 0.2 * cm, S + 0.8 * cm, r * 0.8, H * 0.86, M.mat("glass", "#26323f"));   // a door
    M.box(-L * 0.1, L * 0.1, S - 0.2 * cm, S + 0.8 * cm, r * 0.8, H * 0.86, M.mat("glass", "#26323f"));
    [L * 0.68, -L * 0.62].forEach(function (x) { [-1, 1].forEach(function (s) { obj3Wheel(M, x, s * (S - 16 * cm), r, 28 * cm); }); });
  });
  // a bicycle: two wheels, the frame between, its saddle and handlebars
  mDef("i_bike", function (M, W, D, H, C) {
    C = mPick(C, "#2f6aa8", "#1c1e22");
    var frame = M.mat("metal", C.main), r = Math.min(0.34 * FLOOR_PX, W * 0.2), fx = W / 2 - r, bx = -W / 2 + r;
    [fx, bx].forEach(function (x) {
      M.push().move(x, 0, r).tiltX(90);
      M.lathe(0, 0, [[r, -1.2 * cm], [r, 1.2 * cm]], M.mat("rubber", "#1b1b1d"), { seg: 26 });
      M.lathe(0, 0, [[r - 2.4 * cm, -0.6 * cm], [r - 2.4 * cm, 0.6 * cm]], M.mat("metal", "#b9bdc2"), { seg: 26 });
      M.cyl(0, 0, -1.5 * cm, 1.5 * cm, 2.5 * cm, M.mat("metal", "#b9bdc2"), { seg: 10 });
      M.pop();
    });
    var crank = [0, 0, r], seatP = [-r * 0.45, 0, H * 0.82], head = [fx - r * 0.42, 0, H * 0.8];
    [[[bx, 0, r], crank], [crank, seatP], [seatP, [bx, 0, r]], [seatP, head], [crank, head], [head, [fx, 0, r]]].forEach(function (t) {
      M.tube(t[0], t[1], 1.4 * cm, frame, 8);
    });
    M.box(seatP[0] - 12 * cm, seatP[0] + 6 * cm, -4 * cm, 4 * cm, H * 0.84, H * 0.88, M.mat("leather", "#1c1e22"), 2 * cm);
    M.tube([head[0], -22 * cm, H * 0.97], [head[0], 22 * cm, H * 0.97], 1.2 * cm, M.mat("metal", "#2b2d31"), 8);
    M.tube(head, [head[0], 0, H * 0.97], 1.4 * cm, frame, 8);
    M.cyl(crank[0], crank[1], r - 1 * cm, r + 1 * cm, 9 * cm, M.mat("metal", "#2b2d31"), { seg: 16 });
  });
  // a scooter: its deck between two wheels, the stem up to the bars
  mDef("i_scooter", function (M, W, D, H, C) {
    C = mPick(C, "#c4382e", "#1c1e22");
    var r = Math.min(0.2 * FLOOR_PX, W * 0.12), fx = W / 2 - r, bx = -W / 2 + r;
    [fx, bx].forEach(function (x) { obj3Wheel(M, x, 0, r, 6 * cm, "#2b2d31"); });
    M.box(bx + r * 0.6, fx - r * 1.4, -D * 0.22, D * 0.22, r * 0.9, r * 1.6, M.mat("lacquer", C.main), 3 * cm);
    M.box(bx - r * 0.3, bx + r * 1.2, -D * 0.2, D * 0.2, r * 1.6, r * 2.4, M.mat("leather", C.frame), 4 * cm);   // the seat over the back
    M.tube([fx, 0, r], [fx - r * 0.8, 0, H * 0.92], 2 * cm, M.mat("lacquer", C.main), 10);
    M.tube([fx - r * 0.8, -D * 0.38, H * 0.95], [fx - r * 0.8, D * 0.38, H * 0.95], 1.4 * cm, M.mat("metal", "#2b2d31"), 8);
    M.box(fx - r * 0.2, fx + r * 0.6, -6 * cm, 6 * cm, H * 0.7, H * 0.8, M.mat("glow", "#fff4d6"), 3 * cm);
  });

  // ---- out of doors -------------------------------------------------------------------------------
  // a tree: its trunk, its boughs, the leaves in lumps -- or, a tree of the
  // lot's own (40-edit3d.js), the shape of its kind: a spruce's tiers, a
  // poplar's column, a palm's fronds, a saguaro's arms
  var OBJ3_TREE_TALL = { oak: 13, maple: 11, broad: 8, spruce: 14, fir: 9, birch: 10, redwood: 22, pine: 12, palm: 9, willow: 10,
                         cypress: 9, banana: 4.5, joshua: 5, cactus: 3.5, poplar: 15, fruit: 4.5 };
  function obj3TreeKind(M, W, D, H, C, n, sp) {
    var R = Math.min(W, D) / 2, rnd = mRand((n && n.id) || 43), bark = M.mat("bark", C.frame), leaves = M.mat("leaves", C.main);
    var trunkR = Math.max(6 * cm, R * 0.08);
    if (sp === "spruce" || sp === "fir" || sp === "redwood" || sp === "cypress") {
      var bare = sp === "redwood" ? H * 0.35 : sp === "cypress" ? H * 0.05 : H * 0.12;
      M.cyl(0, 0, 0, H * 0.96, trunkR, bark, { seg: 9, r1: trunkR * 0.3 });
      if (sp === "cypress") { M.ball(0, 0, H * 0.52, R, R, H * 0.48, leaves, { seg: 9 }); return true; }
      var tiers = sp === "fir" ? 5 : 4, z = bare;
      for (var t = 0; t < tiers; t++) {
        var k = 1 - t / tiers, r = R * (0.35 + 0.65 * k), h = (H - bare) / tiers * 1.55;
        M.cyl(0, 0, z, Math.min(H, z + h), r, leaves, { seg: 10, r1: 0, bottom: true });
        z += (H - bare) / tiers * 0.8;
      }
      return true;
    }
    if (sp === "pine") {
      M.cyl(0, 0, 0, H * 0.82, trunkR, bark, { seg: 9, r1: trunkR * 0.6 });
      for (var p = 0; p < 4; p++) {
        var a = p / 4 * Math.PI * 2 + rnd(), d = R * 0.45;
        M.ball(Math.cos(a) * d, Math.sin(a) * d, H * (0.78 + rnd() * 0.08), R * 0.55, R * 0.55, H * 0.1, leaves, { seg: 8 });
      }
      M.ball(0, 0, H * 0.9, R * 0.6, R * 0.6, H * 0.1, leaves, { seg: 8 });
      return true;
    }
    if (sp === "poplar") {
      M.cyl(0, 0, 0, H * 0.3, trunkR, bark, { seg: 9 });
      M.ball(0, 0, H * 0.58, R * 0.5, R * 0.5, H * 0.43, leaves, { seg: 10 });
      return true;
    }
    if (sp === "palm" || sp === "banana") {
      // a leaning, ringed trunk, the fronds out from its top and drooping
      var lean = (rnd() - 0.5) * R * 0.5, top = [lean, 0, H * 0.92], last = [0, 0, 0];
      for (var s = 1; s <= 6; s++) {
        var q = s / 6, p2 = [lean * q * q, 0, H * 0.92 * q];
        M.tube(last, p2, trunkR * (1 - q * 0.35), bark, 8);
        last = p2;
      }
      var fronds = sp === "palm" ? 9 : 6;
      for (var f = 0; f < fronds; f++) {
        var fa = f / fronds * Math.PI * 2 + rnd() * 0.3, reach = R * (0.9 + rnd() * 0.2);
        // a long, flat leaf out from the crown, arching up and drooping at its tip
        M.push().move(top[0], top[1], top[2]).turn(fa * 180 / Math.PI).tiltY(sp === "palm" ? 18 : 8);
        M.ball(reach * 0.32, 0, H * 0.03, reach * 0.34, R * (sp === "palm" ? 0.11 : 0.2), H * 0.012, leaves, { seg: 7 });
        M.push().move(reach * 0.62, 0, H * 0.03).tiltY(sp === "palm" ? 32 : 18);
        M.ball(reach * 0.2, 0, 0, reach * 0.22, R * (sp === "palm" ? 0.09 : 0.17), H * 0.01, leaves, { seg: 7 });
        M.pop();
        M.pop();
      }
      return true;
    }
    if (sp === "cactus" || sp === "joshua") {
      var body = M.mat("leaves", sp === "cactus" ? "#5c7d45" : C.main);
      if (sp === "cactus") {
        M.cyl(0, 0, 0, H, R * 0.22, body, { seg: 12 });
        M.ball(0, 0, H, R * 0.22, R * 0.22, R * 0.22, body, { seg: 8, lat0: 0 });
        [-1, 1].forEach(function (sd) {
          var z0 = H * (0.35 + rnd() * 0.15), x = sd * R * 0.55;
          M.tube([sd * R * 0.15, 0, z0], [x, 0, z0], R * 0.15, body, 10);
          M.cyl(x, 0, z0, z0 + H * 0.3, R * 0.15, body, { seg: 10 });
          M.ball(x, 0, z0 + H * 0.3, R * 0.15, R * 0.15, R * 0.15, body, { seg: 8, lat0: 0 });
        });
      } else {
        M.cyl(0, 0, 0, H * 0.5, trunkR * 1.4, bark, { seg: 9 });
        for (var j = 0; j < 4; j++) {
          var ja = j / 4 * Math.PI * 2 + rnd(), jend = [Math.cos(ja) * R * 0.7, Math.sin(ja) * R * 0.7, H * (0.75 + rnd() * 0.2)];
          M.tube([0, 0, H * 0.5], jend, trunkR, bark, 7);
          M.ball(jend[0], jend[1], jend[2] + 10 * cm, R * 0.22, R * 0.22, R * 0.22, body, { seg: 7 });
        }
      }
      return true;
    }
    if (sp === "willow") {
      M.cyl(0, 0, 0, H * 0.45, trunkR * 1.3, bark, { seg: 10, r1: trunkR });
      M.ball(0, 0, H * 0.62, R, R, H * 0.36, leaves, { seg: 10 });
      for (var w = 0; w < 7; w++) {
        var wa = w / 7 * Math.PI * 2;
        M.ball(Math.cos(wa) * R * 0.85, Math.sin(wa) * R * 0.85, H * 0.42, R * 0.3, R * 0.3, H * 0.28, leaves, { seg: 7 });
      }
      return true;
    }
    return false;                        // a round crown, as any tree (a birch's trunk pale: in its colors)
  }
  mDef("i_tree", function (M, W, D, H, C, n) {
    C = mPick(C, "#4f7d3a", n && n.sp === "birch" ? "#e8e4dc" : "#6b4a32");
    if (n && n.sp && obj3TreeKind(M, W, D, H, C, n, n.sp)) { return; }
    var rnd = mRand((n && n.id) || 41), trunkH = H * 0.42, R = Math.min(W, D) / 2;
    M.cyl(0, 0, 0, trunkH + R * 0.4, Math.min(W, D) * 0.05, M.mat("bark", C.frame), { seg: 10, r1: Math.min(W, D) * 0.03 });
    for (var b = 0; b < 3; b++) {
      var a = b / 3 * Math.PI * 2 + rnd();
      M.tube([0, 0, trunkH * 0.9], [Math.cos(a) * R * 0.45, Math.sin(a) * R * 0.45, trunkH + R * 0.5], Math.min(W, D) * 0.022, M.mat("bark", C.frame), 6);
    }
    var leaves = M.mat("leaves", C.main);
    M.ball(0, 0, H - R * 0.95, R * 0.95, R * 0.95, R * 0.9, leaves, { seg: 9 });
    for (var k = 0; k < 5; k++) {
      var t = k / 5 * Math.PI * 2 + rnd() * 0.6, d = R * (0.45 + rnd() * 0.15), s = R * (0.45 + rnd() * 0.15);
      M.ball(Math.cos(t) * d, Math.sin(t) * d, H - R * (1.1 + rnd() * 0.35), s, s, s * 0.9, leaves, { seg: 8 });
    }
  });
  // traffic lights: a pole, the signal box on it, red over amber over green
  mDef("i_traffic", function (M, W, D, H, C) {
    C = mPick(C, "#2b2d31", "#1c1e22");
    var steel = M.mat("metal", C.main);
    M.cyl(0, 0, 0, H * 0.62, 5 * cm, steel, { seg: 12 });
    M.box(-W * 0.24, W * 0.24, -D * 0.2, D * 0.26, H * 0.62, H, M.mat("metal", C.frame), 3 * cm);
    [["#d63a2f", 0.9], ["#f2b84b", 0.77], ["#3dbb5e", 0.64]].forEach(function (l) {
      M.push().move(0, D * 0.26, H * (l[1] + 0.04) + 0.5 * cm).tiltX(-90);
      M.cyl(0, 0, 0, 1 * cm, W * 0.15, M.mat("glow", l[0]), { seg: 16 });
      M.pop();
      M.box(-W * 0.18, W * 0.18, D * 0.26, D * 0.26 + 7 * cm, H * (l[1] + 0.04) + W * 0.15, H * (l[1] + 0.04) + W * 0.16, M.mat("metal", C.frame));
    });
  });

  // ---- things -----------------------------------------------------------------------------------
  // a clock on the wall: its rim, its face, the hours, the hands
  mDef("i_clock", function (M, W, D, H, C) {
    C = mPick(C, "#f6f4ef", "#2b2d31");
    var R = Math.min(W, H) / 2;
    M.push().move(0, -D / 2, H / 2).tiltX(-90);
    M.cyl(0, 0, 0, D * 0.8, R, M.mat("metal", C.frame), { seg: 28 });
    M.cyl(0, 0, D * 0.8, D * 0.82, R * 0.9, M.mat("ceramic", C.main), { seg: 28 });
    for (var h = 0; h < 12; h++) {
      var a = h / 12 * Math.PI * 2, rr = R * 0.78;
      M.box(Math.cos(a) * rr - 0.5 * cm, Math.cos(a) * rr + 0.5 * cm, Math.sin(a) * rr - 0.5 * cm, Math.sin(a) * rr + 0.5 * cm, D * 0.82, D * 0.84, M.mat("plastic", C.frame));
    }
    M.box(-0.4 * cm, 0.4 * cm, 0, R * 0.5, D * 0.84, D * 0.86, M.mat("plastic", C.frame));
    M.box(0, R * 0.68, -0.3 * cm, 0.3 * cm, D * 0.86, D * 0.88, M.mat("plastic", C.frame));
    M.pop();
  });
  // a book, shut, lying flat: its covers, and the pages between
  mDef("i_book", function (M, W, D, H, C) {
    C = mPick(C, "#7a2e2a", "#efe9da");
    var cover = M.mat("leather", C.main), t = 0.25 * cm;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, t, cover);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - t, H, cover);
    M.box(-W / 2, -W / 2 + 0.5 * cm, -D / 2, D / 2, 0, H, cover);
    M.box(-W / 2 + 0.5 * cm, W / 2 - 0.3 * cm, -D / 2 + 0.3 * cm, D / 2 - 0.3 * cm, t, H - t, M.mat("linen", C.frame));
  });
  // a cup on a stem on a stone
  mDef("i_trophy", function (M, W, D, H, C) {
    C = mPick(C, "#d4a62a", "#2b2d31");
    var gold = M.mat("brass", C.main), R = Math.min(W, D) / 2;
    M.box(-R * 0.8, R * 0.8, -R * 0.8, R * 0.8, 0, H * 0.18, M.mat("stone", C.frame), 0.5 * cm);
    M.lathe(0, 0, [[R * 0.45, H * 0.18], [R * 0.12, H * 0.26], [R * 0.1, H * 0.5], [R * 0.25, H * 0.58], [R * 0.8, H * 0.72], [R * 0.9, H]], gold,
            { seg: 22, bottom: false, top: false });
    [-1, 1].forEach(function (s) { M.tube([s * R * 0.75, 0, H * 0.9], [s * R * 1.05, 0, H * 0.72], 0.5 * cm, gold, 8); });
  });
  // a present: the box, the ribbon round it both ways, a bow on top
  mDef("i_gift", function (M, W, D, H, C) {
    C = mPick(C, "#c43c4a", "#f2d36b");
    var ribbon = M.mat("fabric", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.82, M.mat("plastic", C.main), 0.3 * cm);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H * 0.78, H * 0.88, M.mat("plastic", C.main), 0.3 * cm);                 // its lid
    M.box(-W * 0.07, W * 0.07, -D / 2 - 0.2 * cm, D / 2 + 0.2 * cm, 0, H * 0.885, ribbon);
    M.box(-W / 2 - 0.2 * cm, W / 2 + 0.2 * cm, -D * 0.07, D * 0.07, 0, H * 0.885, ribbon);
    M.ball(-W * 0.1, 0, H * 0.93, W * 0.12, W * 0.06, H * 0.08, ribbon, { seg: 8 });
    M.ball(W * 0.1, 0, H * 0.93, W * 0.12, W * 0.06, H * 0.08, ribbon, { seg: 8 });
  });
  // a parcel: brown board, taped across the top
  mDef("i_package", function (M, W, D, H, C) {
    C = mPick(C, "#b98e5a", "#d9c7a0");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("wood", C.main), 0.3 * cm);
    M.box(-W * 0.06, W * 0.06, -D / 2 - 0.15 * cm, D / 2 + 0.15 * cm, H - 0.1 * cm, H + 0.15 * cm, M.mat("plastic", C.frame));
    M.box(-W * 0.06, W * 0.06, D / 2, D / 2 + 0.15 * cm, H * 0.7, H, M.mat("plastic", C.frame));
    M.box(-W * 0.06, W * 0.06, -D / 2 - 0.15 * cm, -D / 2, H * 0.7, H, M.mat("plastic", C.frame));
  });
  // a shopping trolley: its wire basket over a frame on castors, the handle behind
  mDef("i_cart", function (M, W, D, H, C) {
    C = mPick(C, "#c9cdd2", "#c4382e");
    var wire = M.mat("chrome", C.main), z0 = H * 0.42, z1 = H * 0.86, x0 = -W / 2 + 10 * cm, x1 = W / 2;
    [[x0 + 4 * cm, -D * 0.34], [x0 + 4 * cm, D * 0.34], [x1 - 8 * cm, -D * 0.3], [x1 - 8 * cm, D * 0.3]].forEach(function (c) {
      M.cyl(c[0], c[1], 0, 6 * cm, 4 * cm, M.mat("rubber", "#1b1b1d"), { seg: 10 });
      M.tube([c[0], c[1], 6 * cm], [c[0] + (c[0] < 0 ? 8 * cm : -6 * cm), c[1] * 0.8, z0], 1 * cm, wire, 6);
    });
    for (var i = 0; i <= 6; i++) {                                                              // the basket, in wires
      var x = x0 + (x1 - x0) * i / 6;
      M.tube([x, -D / 2, z0], [x, -D / 2, z1], 0.4 * cm, wire, 4);
      M.tube([x, D / 2, z0], [x, D / 2, z1], 0.4 * cm, wire, 4);
      M.tube([x, -D / 2, z0], [x, D / 2, z0], 0.4 * cm, wire, 4);
    }
    [z0, (z0 + z1) / 2, z1].forEach(function (z) {
      M.tube([x0, -D / 2, z], [x1, -D / 2, z], 0.5 * cm, wire, 4);
      M.tube([x0, D / 2, z], [x1, D / 2, z], 0.5 * cm, wire, 4);
      M.tube([x1, -D / 2, z], [x1, D / 2, z], 0.5 * cm, wire, 4);
    });
    M.tube([x0 - 8 * cm, -D * 0.46, H], [x0 - 8 * cm, D * 0.46, H], 1.4 * cm, M.mat("plastic", C.frame), 10);   // the handle
    [-1, 1].forEach(function (s) { M.tube([x0, s * D * 0.46, z1], [x0 - 8 * cm, s * D * 0.46, H], 0.8 * cm, wire, 6); });
  });
