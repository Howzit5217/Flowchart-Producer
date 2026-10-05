// ---------------------------------------------------------------------------
//  40-movein.js -- the traffic of a building site, and moving in: concrete
//  mixers coming down the street and backing up to pour the slab, a flatbed
//  bringing the timber or the steel, and at the end a removal lorry at the
//  kerb with its back open, the furniture carried out of it, up the path,
//  through the front door, along the rooms -- up the stairs -- to where it
//  goes and set down there; the lights and switches put in where they are,
//  the stairs built up from the floor, the people who live there walking
//  in last
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update the animation so when things are getting
  // placed inside they do not just magically fall from above and they are
  // brought through the front door and to add semi trucks places, cement
  // trucks and to make sure it all looks and runs perfectly")
  //
  // 40-build.js put the building up stage by stage, and set each piece of
  // furniture down out of the air with a bounce.  Here the furniture comes
  // the way it does: a lorry pulls up, and movers carry each piece -- two
  // to a big one, turned along the way they go, a wide one on its side to
  // get it through the doors -- by the way a body walks (38-walk.js's own
  // way round the walls), the doors on the way opened for them.
  var MO_CARRY_H = 0.28;                 // metres: a big piece carried this far off the floor
  var MO_DOOR_W = 0.95;                  // metres: wider than this, it goes through a door on its side
  var MO_MOVER = { own: true, fill: "#2f5d8a", line: "#3b4350", outfit: "polo" };
  var MO_HOLDING = { own: true, fill: "#2f5d8a", line: "#3b4350", outfit: "polo", arms: "carry" };     // (hands out in front: 40-bodies.js)
  var MO_RESIDENT_AT = [0.935, 0.99];    // when those who live there walk in
  var MO_FIXTURE = { i_outlet: 1, i_lightswitch: 1, i_garagebtn: 1, i_breaker: 1, i_thermostat: 1, i_sconce: 1, i_smoke: 1, i_vent: 1, i_exhaustfan: 1,
                     i_wifi: 1, i_camera: 1, i_porchlight: 1, i_floodlight: 1, i_hood: 1, i_ac: 1, i_radiator: 1, i_towelrail: 1, i_hooks: 1,
                     i_evcharger: 1, i_waterheater: 1, i_furnace: 1 };
  var MO_DRIVEN = { i_parked: 1, i_car: 1, i_taxi: 1, i_truck: 1, i_bus: 1, i_bike: 1, i_scooter: 1, i_tree: 1 };
  var MO_BUILT = { i_post: 1, i_fireplace: 1, i_chimney: 1 };

  // ---- the stages, given time to move in -----------------------------------------------------------
  // (the furniture carried, not dropped: the inside done sooner, the moving in longer)
  if (typeof CN_STAGES === "object") {
    CN_STAGES.wood = { site: [0, 0.06], found: [0.05, 0.15], frame: [0.14, 0.33], truss: [0.3, 0.39], shell: [0.36, 0.52], roof: [0.44, 0.58], inside: [0.54, 0.66], furnish: [0.63, 0.925] };
    CN_STAGES.steel = { site: [0, 0.06], found: [0.05, 0.14], frame: [0.13, 0.37], truss: [0.35, 0.39], shell: [0.27, 0.56], roof: [0.5, 0.6], inside: [0.56, 0.68], furnish: [0.65, 0.925] };
    CN_STAGES.tall = { site: [0, 0.05], found: [0.04, 0.12], frame: [0.11, 0.5], truss: [0.49, 0.5], shell: [0.17, 0.62], roof: [0.58, 0.64], inside: [0.54, 0.74], furnish: [0.68, 0.925] };
  }
  if (typeof CN_MS === "object") {
    CN_MS.fast = { wood: 10000, steel: 11000, tall: 13000 };
    CN_MS.watch = { wood: 22000, steel: 25000, tall: 30000 };
  }

  // ---- the vehicles, made as the furniture is made (38-models.js) ----------------------------------
  // Each long along x, its nose to +x, standing on z 0; kept once made.
  var moMade = new Map();
  function moModel(key, make) {
    var got = moMade.get(key);
    if (got) { return got; }
    var M = modelMaker(0, 0, 0, 0);
    try { make(M, FLOOR_PX); } catch (e) { if (window.console && console.warn) { console.warn("vehicle " + key + ":", e && e.message); } }
    got = M.done();
    moMade.set(key, got);
    return got;
  }
  // A model put at x, y turned `yaw` -- moving, its mesh handed over as a
  // fresh view of the same numbers, so what the drawing keeps for each spot
  // (38-view3d-gl.js) goes with the picture instead of piling up.
  function moView(a) { return a && a.buffer ? new a.constructor(a.buffer, a.byteOffset, a.length) : a; }
  function moPut(faces, made, x, y, yaw, z, moving) {
    var c = Math.cos(yaw), s = Math.sin(yaw);
    made.forEach(function (f) {
      var pts = f.pts.map(function (p) { return [x + p[0] * c - p[1] * s, y + p[0] * s + p[1] * c, z + p[2]]; });
      var m = f.mesh;
      faces.push({ pts: pts, n: f.n, how: f.how, moves: !!moving,          // (on the move: drawn apart from what stands still, gl3Faces)
                   mesh: { p: moving ? moView(m.p) : m.p, n: m.n, uv: m.uv, a: m.a, base: pts[0].slice(), xf: [x, y, c, s, z] } });
    });
  }
  function moWheel(M, x, y, r, w, m) {
    var tire = M.mat("rubber", "#1b1b1d"), rim = M.mat("chrome", "#c9cdd2"), hub = M.mat("metal", "#3a3d40");
    M.push().move(x, y, r).tiltX(90);
    M.cyl(0, 0, -w / 2, w / 2, r, tire, { seg: 20, bottom: true });
    M.cyl(0, 0, w / 2, w / 2 + 0.012 * m, r * 0.6, rim, { seg: 16 });
    M.cyl(0, 0, -w / 2 - 0.012 * m, -w / 2, r * 0.6, rim, { seg: 16, bottom: true });
    M.cyl(0, 0, w / 2 + 0.012 * m, w / 2 + 0.05 * m, r * 0.16, hub, { seg: 8 });
    M.cyl(0, 0, -w / 2 - 0.05 * m, -w / 2 - 0.012 * m, r * 0.16, hub, { seg: 8, bottom: true });
    M.pop();
  }
  // both sides of an axle at x; twin tyres for a lorry's back axles
  function moAxle(M, x, half, r, twin, m) {
    [-1, 1].forEach(function (s) {
      if (twin) { moWheel(M, x, s * (half - 0.17 * m), r, 0.26 * m, m); moWheel(M, x, s * (half - 0.45 * m), r, 0.26 * m, m); }
      else { moWheel(M, x, s * (half - 0.2 * m), r, 0.3 * m, m); }
    });
    M.box(x - 0.06 * m, x + 0.06 * m, -half + 0.4 * m, half - 0.4 * m, r - 0.06 * m, r + 0.06 * m, M.mat("metal", "#2a2c30"));
  }
  // A cab: its body, glass all round the top, the grille, lamps and mirrors (front at x1)
  function moCab(M, x0, x1, half, z0, z1, paint, m, o) {
    o = o || {};
    var body = M.mat("lacquer", paint), glass = M.mat("glass", "#1b2632"), chrome = M.mat("chrome", "#d6dadf"), dark = M.mat("metal", "#2a2c30");
    var belt = z0 + (z1 - z0) * 0.5;
    M.box(x0, x1, -half, half, z0, belt + 0.05 * m, body, 0.12 * m);
    M.box(x0 + 0.08 * m, x1 - 0.18 * m, -half + 0.04 * m, half - 0.04 * m, belt, z1, body, 0.16 * m);
    M.box(x1 - 0.24 * m, x1 - 0.12 * m, -half + 0.16 * m, half - 0.16 * m, belt + 0.12 * m, z1 - 0.18 * m, glass, 0.05 * m);       // the windscreen
    M.box(x0 + 0.5 * m, x1 - 0.35 * m, -half + 0.02 * m, half - 0.02 * m, belt + 0.15 * m, z1 - 0.22 * m, glass, 0.04 * m);        // the side windows
    M.box(x1 - 0.06 * m, x1 + 0.03 * m, -half * 0.68, half * 0.68, z0 + 0.15 * m, belt - 0.05 * m, dark, 0.03 * m);                 // the grille
    for (var g = 0; g < 4; g++) {
      var gz = z0 + 0.25 * m + g * (belt - z0 - 0.4 * m) / 3;
      M.box(x1 + 0.02 * m, x1 + 0.05 * m, -half * 0.66, half * 0.66, gz - 0.02 * m, gz + 0.02 * m, chrome);
    }
    M.box(x1 - 0.05 * m, x1 + 0.18 * m, -half - 0.03 * m, half + 0.03 * m, z0 - 0.32 * m, z0 + 0.02 * m, o.bumper ? chrome : dark, 0.05 * m);   // the bumper
    [-1, 1].forEach(function (s) {
      M.box(x1 - 0.02 * m, x1 + 0.04 * m, s * half * 0.72 - 0.17 * m, s * half * 0.72 + 0.17 * m, z0 + 0.05 * m, z0 + 0.22 * m, M.mat("glow", "#fff4d6"), 0.03 * m);
      M.tube([x1 - 0.5 * m, s * half, belt + 0.45 * m], [x1 - 0.5 * m, s * (half + 0.32 * m), belt + 0.5 * m], 0.025 * m, dark, 6);   // the mirrors
      M.box(x1 - 0.56 * m, x1 - 0.44 * m, s * (half + 0.27 * m) - 0.05 * m, s * (half + 0.27 * m) + 0.05 * m, belt + 0.2 * m, belt + 0.72 * m, dark, 0.03 * m);
      M.box(x0 + 0.3 * m, x0 + 0.85 * m, s * half - 0.08 * m, s * half + 0.08 * m, z0 - 0.42 * m, z0 - 0.34 * m, dark);              // a step
    });
    if (o.beacon) { M.box(x0 + 0.6 * m, x0 + 1.0 * m, -0.35 * m, 0.35 * m, z1, z1 + 0.13 * m, M.mat("glow", "#ffb020"), 0.05 * m); }
  }
  // A concrete mixer: a cab-forward lorry, the drum behind turning on its
  // axis, back and up, the hopper over its mouth and the chute under it.
  function moMixerBody(M, m, paint) {
    var dark = M.mat("metal", "#2a2c30"), steel = M.mat("metal", "#9aa0a6"), chrome = M.mat("chrome", "#d4d8dc");
    M.box(-4.7 * m, 3.4 * m, -0.48 * m, 0.48 * m, 0.72 * m, 1.02 * m, dark);                                       // the chassis
    moCab(M, 2.75 * m, 4.65 * m, 1.24 * m, 1.0 * m, 3.15 * m, paint, m, { beacon: true });
    M.box(2.7 * m, 4.6 * m, -1.25 * m, 1.25 * m, 0.92 * m, 1.12 * m, M.mat("metal", "#3a3d40"), 0.05 * m);          // under the cab
    [-1, 1].forEach(function (s) {                                                                                     // the wings over the wheels
      M.box(3.2 * m, 4.25 * m, s * 1.02 * m - 0.24 * m, s * 1.02 * m + 0.24 * m, 1.08 * m, 1.2 * m, dark, 0.04 * m);
      M.box(-4.45 * m, -1.75 * m, s * 1.02 * m - 0.24 * m, s * 1.02 * m + 0.24 * m, 1.12 * m, 1.22 * m, dark, 0.04 * m);
      M.box(-4.55 * m, -4.5 * m, s * 1.02 * m - 0.25 * m, s * 1.02 * m + 0.25 * m, 0.3 * m, 1.1 * m, M.mat("rubber", "#1b1b1d"));   // mud flaps
    });
    M.cyl(2.35 * m, -0.6 * m, 1.05 * m, 2.6 * m, 0.34 * m, M.mat("lacquer", "#e8e8e4"), { seg: 16 });               // the water tank
    M.push().move(2.0 * m, 1.05 * m, 0.72 * m).tiltY(90);                                                            // the fuel tank
    M.cyl(0, 0, -0.5 * m, 0.5 * m, 0.26 * m, chrome, { seg: 14, bottom: true });
    M.pop();
    M.box(0.75 * m, 1.35 * m, -0.55 * m, 0.55 * m, 1.02 * m, 2.45 * m, dark, 0.05 * m);                              // the drum's front stand
    M.box(-3.75 * m, -3.25 * m, -0.75 * m, 0.75 * m, 1.02 * m, 2.35 * m, dark, 0.05 * m);                             // its rollers behind
    // the hopper over the mouth, the chute under it, the ladder up
    M.push().move(-3.55 * m, 0, 2.9 * m);
    M.lathe(0, 0, [[0.18 * m, 0], [0.32 * m, 0.25 * m], [0.62 * m, 0.7 * m], [0.64 * m, 0.76 * m]], steel, { seg: 14 });
    M.pop();
    M.box(-3.9 * m, -3.6 * m, -0.9 * m, -0.84 * m, 0.4 * m, 3.4 * m, steel);
    for (var r = 0; r < 7; r++) { M.box(-3.9 * m, -3.6 * m, -0.92 * m, -0.86 * m, 0.55 * m + r * 0.42 * m, 0.6 * m + r * 0.42 * m, steel); }
    [[-1.25, 0], [-2.95, 1], [-3.95, 1]].forEach(function (a) { moAxle(M, a[0] * m, 1.25 * m, 0.52 * m, !!a[1], m); });
    M.box(-4.75 * m, -4.6 * m, -1.1 * m, 1.1 * m, 0.5 * m, 0.62 * m, M.mat("metal", "#3a3d40"));                  // the bumper behind
    [-1, 1].forEach(function (s) { M.box(-4.77 * m, -4.74 * m, s * 1.0 * m - 0.12 * m, s * 1.0 * m + 0.12 * m, 0.72 * m, 0.84 * m, M.mat("glow", "#c2241c")); });
    moAxle(M, 3.75 * m, 1.24 * m, 0.52 * m, false, m);
  }
  // the drum: bands round it the way they spiral, turned `turn` round its axis
  function moDrum(M, m, turn, a, b) {
    var A = M.mat("lacquer", a), B = M.mat("lacquer", b), dark = M.mat("metal", "#2a2c30");
    M.push().move(-1.0 * m, 0, 2.35 * m).tiltY(-77);
    var prof = [[0.42 * m, -2.05 * m], [0.92 * m, -1.35 * m], [1.12 * m, -0.35 * m], [1.06 * m, 0.7 * m], [0.72 * m, 1.75 * m], [0.44 * m, 2.25 * m]];
    var seg = 28;
    for (var k = 0; k + 1 < prof.length; k++) {
      var p = prof[k], q = prof[k + 1], dr = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dr, dz) || 1, nr = dz / l, nz = -dr / l;
      for (var j = 0; j < seg; j++) {
        var a0 = j / seg * Math.PI * 2 + turn, a1 = (j + 1) / seg * Math.PI * 2 + turn;
        // the band: by where round it is and how far along -- a spiral
        var band = Math.floor(j / 3.5 + (p[1] + q[1]) / (2 * 0.9 * m)) % 2 ? A : B;
        var P1 = [Math.cos(a0) * p[0], Math.sin(a0) * p[0], p[1]], P2 = [Math.cos(a1) * p[0], Math.sin(a1) * p[0], p[1]];
        var Q1 = [Math.cos(a0) * q[0], Math.sin(a0) * q[0], q[1]], Q2 = [Math.cos(a1) * q[0], Math.sin(a1) * q[0], q[1]];
        var n1 = [Math.cos(a0) * nr, Math.sin(a0) * nr, nz], n2 = [Math.cos(a1) * nr, Math.sin(a1) * nr, nz];
        M.tri(band, P1, P2, Q2, n1, n2, n2);
        M.tri(band, P1, Q2, Q1, n1, n2, n1);
      }
    }
    M.disc(0, 0, 2.25 * m, 0.42 * m, 0.42 * m, dark, 16);                                                              // its mouth
    for (var f = 0; f < 3; f++) {                                                                                      // the fins showing at the mouth
      var fa = turn + f * Math.PI * 2 / 3;
      M.tube([Math.cos(fa) * 0.1 * m, Math.sin(fa) * 0.1 * m, 2.2 * m], [Math.cos(fa) * 0.38 * m, Math.sin(fa) * 0.38 * m, 2.0 * m], 0.04 * m, M.mat("metal", "#5c6168"), 4);
    }
    M.pop();
  }
  function moMixer(turn, paint) {
    var step = Math.round(((turn % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2) * 18) % 18;
    return { body: moModel("mixer|" + paint, function (M, m) { moMixerBody(M, m, paint); }),
             drum: moModel("drum|" + paint + "|" + step, function (M, m) { moDrum(M, m, step / 18 * Math.PI * 2, paint === "#f2f2ee" ? "#e2622a" : "#f2f2ee", paint); }) };
  }
  // A semi's tractor: a long bonnet, the cab, the tall pipes behind it, the
  // fuel tanks along its sides, the fifth wheel the trailer sits on.
  function moTractor(paint) {
    return moModel("tractor|" + paint, function (M, m) {
      var body = M.mat("lacquer", paint), dark = M.mat("metal", "#2a2c30"), chrome = M.mat("chrome", "#d8dce0");
      M.box(-3.4 * m, 2.6 * m, -0.5 * m, 0.5 * m, 0.72 * m, 1.02 * m, dark);
      M.box(1.45 * m, 3.22 * m, -0.96 * m, 0.96 * m, 1.02 * m, 2.02 * m, body, 0.22 * m);                              // the bonnet
      M.box(3.18 * m, 3.27 * m, -0.72 * m, 0.72 * m, 1.05 * m, 1.95 * m, chrome, 0.04 * m);                            // the grille
      for (var g = 0; g < 6; g++) { M.box(3.24 * m, 3.29 * m, -0.68 * m, 0.68 * m, 1.12 * m + g * 0.15 * m, 1.15 * m + g * 0.15 * m, dark); }
      M.box(3.2 * m, 3.48 * m, -1.27 * m, 1.27 * m, 0.55 * m, 0.95 * m, chrome, 0.07 * m);                             // the bumper
      [-1, 1].forEach(function (s) {
        M.box(3.15 * m, 3.25 * m, s * 0.88 * m - 0.14 * m, s * 0.88 * m + 0.14 * m, 1.25 * m, 1.48 * m, M.mat("glow", "#fff4d6"), 0.04 * m);
        M.box(2.0 * m, 3.15 * m, s * 1.05 * m - 0.22 * m, s * 1.05 * m + 0.22 * m, 1.02 * m, 1.38 * m, body, 0.12 * m);   // the wings
        M.cyl(-0.82 * m, s * 1.02 * m, 1.1 * m, 4.15 * m, 0.09 * m, chrome, { seg: 10 });                                 // the pipes
        M.push().move(0.35 * m, s * 1.02 * m, 0.78 * m).tiltY(90);                                                         // a tank
        M.cyl(0, 0, -0.62 * m, 0.62 * m, 0.3 * m, chrome, { seg: 16, bottom: true });
        M.pop();
        M.box(-3.5 * m, -3.45 * m, s * 1.0 * m - 0.27 * m, s * 1.0 * m + 0.27 * m, 0.25 * m, 1.05 * m, M.mat("rubber", "#1b1b1d"));
      });
      moCab(M, -0.7 * m, 1.6 * m, 1.22 * m, 1.02 * m, 3.15 * m, paint, m, { bumper: false });
      M.box(-0.7 * m, 1.05 * m, -1.17 * m, 1.17 * m, 3.1 * m, 3.75 * m, body, 0.22 * m);                               // the roof fairing
      M.box(-2.7 * m, -1.5 * m, -0.62 * m, 0.62 * m, 1.02 * m, 1.18 * m, dark, 0.04 * m);                              // the fifth wheel
      moAxle(M, 2.45 * m, 1.24 * m, 0.52 * m, false, m);
      moAxle(M, -1.75 * m, 1.24 * m, 0.52 * m, true, m);
      moAxle(M, -3.05 * m, 1.24 * m, 0.52 * m, true, m);
    });
  }
  // Its trailer, its kingpin at 0: a box -- shut, or its back doors swung
  // round flat to its sides and furniture inside -- or a flatbed with a load.
  function moTrailer(kind, load, paint, cargo) {
    var stack = Math.max(0, Math.min(4, Math.round(load * 4)));
    return moModel("trailer|" + kind + "|" + stack + "|" + paint + "|" + cargo, function (M, m) {
      var dark = M.mat("metal", "#2a2c30"), white = M.mat("plastic", "#f2f2ef"), stripe = M.mat("lacquer", paint), hw = 1.28 * m;
      var x0 = -14.7 * m, x1 = 0.9 * m, fl = 1.25 * m, top = 4.05 * m;
      M.box(x0 + 0.2 * m, x1 - 0.2 * m, -0.45 * m, 0.45 * m, 1.02 * m, fl, dark);
      if (kind === "flat") {
        M.box(x0, x1, -hw, hw, fl, fl + 0.18 * m, M.mat("wood", "#8a6a4a"), 0.03 * m);
        M.box(x0, x1, -hw - 0.02 * m, hw + 0.02 * m, fl - 0.12 * m, fl + 0.02 * m, stripe);
        M.box(x1 - 0.1 * m, x1, -hw, hw, fl, fl + 1.1 * m, dark, 0.04 * m);                                                 // the headboard
        var span = (x1 - x0 - 1.4 * m) / 4;
        for (var k = 0; k < stack; k++) {
          var sx = x1 - 0.8 * m - (k + 0.5) * span, z = fl + 0.18 * m;
          if (cargo === "steel") {
            for (var b = 0; b < 5; b++) {                                                                                     // beams: an I each
              var by = (b - 2) * 0.46 * m, steel = M.mat("metal", "#565e66");
              M.box(sx - span * 0.46, sx + span * 0.46, by - 0.2 * m, by + 0.2 * m, z, z + 0.05 * m, steel);
              M.box(sx - span * 0.46, sx + span * 0.46, by - 0.03 * m, by + 0.03 * m, z + 0.05 * m, z + 0.4 * m, steel);
              M.box(sx - span * 0.46, sx + span * 0.46, by - 0.2 * m, by + 0.2 * m, z + 0.4 * m, z + 0.45 * m, steel);
            }
          } else if (cargo === "truss") {
            for (var t = 0; t < 6; t++) {                                                                                     // trusses, lying flat in a stack
              var tz = z + t * 0.08 * m, wood = M.mat("wood", "#d9b77e");
              M.box(sx - span * 0.47, sx + span * 0.47, -hw + 0.05 * m, -hw + 0.15 * m, tz, tz + 0.06 * m, wood);
              M.tube([sx - span * 0.47, -hw + 0.1 * m, tz + 0.03 * m], [sx, hw - 0.1 * m, tz + 0.03 * m], 0.04 * m, wood, 4);
              M.tube([sx + span * 0.47, -hw + 0.1 * m, tz + 0.03 * m], [sx, hw - 0.1 * m, tz + 0.03 * m], 0.04 * m, wood, 4);
            }
          } else {
            M.box(sx - span * 0.46, sx + span * 0.46, -hw + 0.06 * m, hw - 0.06 * m, z, z + 1.0 * m, M.mat("wood", "#dcbd86"), 0.04 * m);   // a bundle of boards
            M.box(sx - span * 0.47, sx + span * 0.47, -hw + 0.04 * m, hw - 0.04 * m, z + 1.0 * m, z + 1.03 * m, M.mat("plastic", "#e8e2d2"));
          }
          [-0.3, 0.3].forEach(function (u) {                                                                                  // its straps
            M.box(sx + u * span - 0.03 * m, sx + u * span + 0.03 * m, -hw - 0.02 * m, hw + 0.02 * m, z, z + (cargo === "steel" ? 0.47 : cargo === "truss" ? 0.5 : 1.06) * m, M.mat("fabric", "#e0a52a"));
          });
        }
      } else {
        var open = kind === "open";
        if (!open) { M.box(x0, x1, -hw, hw, fl, top, white, 0.05 * m); }
        else {
          // hollow: its walls, its roof, its floor; the cargo inside
          M.box(x0, x1, -hw, -hw + 0.05 * m, fl, top, white);
          M.box(x0, x1, hw - 0.05 * m, hw, fl, top, white);
          M.box(x0, x1, -hw, hw, top - 0.06 * m, top, white);
          M.box(x1 - 0.06 * m, x1, -hw, hw, fl, top, white);
          M.box(x0, x1, -hw, hw, fl, fl + 0.06 * m, M.mat("wood", "#8a6a4a"));
          M.box(x0 + 0.06 * m, x1 - 0.06 * m, -hw + 0.06 * m, -hw + 0.08 * m, fl + 0.06 * m, top - 0.06 * m, M.mat("plastic", "#3b3f44"));
          M.box(x0 + 0.06 * m, x1 - 0.06 * m, hw - 0.08 * m, hw - 0.06 * m, fl + 0.06 * m, top - 0.06 * m, M.mat("plastic", "#3b3f44"));
          var rnd = mRand(7);
          for (var c = 0; c < 9; c++) {                                                                                       // boxes and wrapped furniture
            var cx = x1 - 0.6 * m - (c % 3) * 1.05 * m - Math.floor(c / 3) * 3.4 * m, cy = ((c % 3) - 1) * 0.75 * m;
            var hgt = (0.6 + rnd() * 1.4) * m, quilt = c % 4 === 3;
            M.box(cx - 0.45 * m, cx + 0.45 * m, cy - 0.33 * m, cy + 0.33 * m, fl + 0.06 * m, fl + 0.06 * m + hgt, M.mat(quilt ? "fabric" : "plastic", quilt ? "#2f4f8a" : "#c9a46e"), quilt ? 0.12 * m : 0.02 * m);
          }
          [-1, 1].forEach(function (s) {                                                                                      // the doors, folded back to its sides
            M.box(x0, x0 + hw, s * (hw + 0.02 * m), s * (hw + 0.08 * m), fl + 0.05 * m, top - 0.05 * m, white, 0.02 * m);
          });
        }
        M.box(x0 + 0.5 * m, x1 - 0.5 * m, -hw - 0.012 * m, hw + 0.012 * m, top - 0.75 * m, top - 0.45 * m, stripe);         // its stripe
        M.box(x0 + 0.5 * m, x1 - 0.5 * m, -hw - 0.012 * m, hw + 0.012 * m, top - 0.38 * m, top - 0.3 * m, stripe);
        if (!open) {
          M.box(x0 - 0.02 * m, x0, -hw + 0.04 * m, hw - 0.04 * m, fl + 0.05 * m, top - 0.05 * m, M.mat("plastic", "#e3e3df"));
          [-0.45, 0.45].forEach(function (u) { M.box(x0 - 0.06 * m, x0, u * m - 0.03 * m, u * m + 0.03 * m, fl + 0.3 * m, top - 0.3 * m, M.mat("chrome", "#b9bdc2")); });
        }
      }
      [-1, 1].forEach(function (s) {                                                                                          // its legs, down when it stands alone
        M.box(-1.25 * m, -1.1 * m, s * 0.85 * m - 0.07 * m, s * 0.85 * m + 0.07 * m, 0.15 * m, fl, dark);
        M.box(x0 - 0.04 * m, x0 + 0.03 * m, s * 1.0 * m - 0.13 * m, s * 1.0 * m + 0.13 * m, fl - 0.35 * m, fl - 0.15 * m, M.mat("glow", "#c2241c"));
      });
      M.box(x0 - 0.12 * m, x0 + 0.1 * m, -1.1 * m, 1.1 * m, 0.45 * m, 0.6 * m, dark);                                     // the bar under its back
      moAxle(M, x0 + 1.6 * m, 1.27 * m, 0.52 * m, true, m);
      moAxle(M, x0 + 2.85 * m, 1.27 * m, 0.52 * m, true, m);
    });
  }
  var MO_FIFTH = -2.1;                   // metres back from a tractor's middle to its fifth wheel

  // ---- the street: where the lorries come along -----------------------------------------------------
  // In the lot's own numbers (38-view3d-gl.js gl3Scenery): x along the road,
  // y out to it; the road from hy + walkW on.  With no street, one along
  // the front of the building, past its door.
  function moStreet(ctx, door) {
    var P = ctx.P, lot = typeof houseStreetLot === "function" ? houseStreetLot() : null, a, ox, oy, hy;
    if (lot) { a = (lot.turn || 0) * Math.PI / 180; ox = lot.x; oy = lot.y; hy = lot.h / 2; }
    else {
      var nx = door ? door.nrm[0] : 0, ny = door ? door.nrm[1] : 1;
      a = Math.atan2(-nx, ny); ox = door ? door.out[0] : ctx.cx; oy = door ? door.out[1] : ctx.y1;
      // (as far out as the building's front reaches, and nine metres more)
      var reach = 0;
      [[ctx.x0, ctx.y0], [ctx.x1, ctx.y0], [ctx.x1, ctx.y1], [ctx.x0, ctx.y1]].forEach(function (c) { reach = Math.max(reach, (c[0] - ox) * nx + (c[1] - oy) * ny); });
      hy = reach + 9 * P;
    }
    // (the pavement and any grass strip beside it, out to the kerb: 40-verge.js)
    var c = Math.cos(a), s = Math.sin(a), walkW = typeof streetWalkPx === "function" ? streetWalkPx() : 1.6 * P, roadW = 7 * P;
    var S = { a: a, hy: hy, kerb: hy + walkW, lane: hy + walkW + roadW * 0.27, park: hy + walkW + 1.42 * P, real: !!lot,
              W: function (lx, ly) { return [ox + lx * c - ly * s, oy + lx * s + ly * c]; },
              L: function (x, y) { var dx = x - ox, dy = y - oy; return [dx * c + dy * s, -dx * s + dy * c]; } };
    // the building, in those numbers
    var b = [Infinity, -Infinity, Infinity, -Infinity];
    [[ctx.x0, ctx.y0], [ctx.x1, ctx.y0], [ctx.x1, ctx.y1], [ctx.x0, ctx.y1]].forEach(function (q) {
      var l = S.L(q[0], q[1]); b[0] = Math.min(b[0], l[0]); b[1] = Math.max(b[1], l[0]); b[2] = Math.min(b[2], l[1]); b[3] = Math.max(b[3], l[1]);
    });
    S.box = b;
    // how far along it the lorries come from, and go to: round a bend, not so far
    var curve = typeof houseOpt === "function" && houseOpt("curve");
    S.far = (curve && lot ? lot.w / 2 + 6 * P : Math.max(55 * P, (b[1] - b[0]) / 2 + 40 * P));
    return S;
  }
  // Along the road: heading -x (the kerb on its right), from `from` (local
  // x) to `at`, pulling in to the kerb over the last of it; k 0..1.
  function moAlongRoad(S, from, at, y0, y1, k) {
    var e = cnEase(k), x = from + (at - from) * e, pull = Math.max(0, Math.min(1, (k - 0.6) / 0.4));
    return { x: x, y: y0 + (y1 - y0) * cnEase(pull) };
  }

  // ---- the front door ---------------------------------------------------------------------------------
  // The door out of the ground floor nearest the street -- a door before a
  // garage's -- the way out from it, and the points just outside and inside.
  function moFrontDoor(ctx, plan) {
    var P = ctx.P, floors = plan.floors || [];
    var outs = (plan.joins || []).filter(function (j) {
      if (j.rooms.length !== 1 || j.locked) { return false; }
      var f = floors.length ? floorAt(floors, j.door.x, j.door.y) : null;
      return !f || f.level === 0;
    });
    if (!outs.length) { return null; }
    var lot = typeof houseStreetLot === "function" ? houseStreetLot() : null, la = lot ? (lot.turn || 0) * Math.PI / 180 : 0;
    function toStreet(d) { return lot ? -(d.x - lot.x) * Math.sin(la) + (d.y - lot.y) * Math.cos(la) : d.y; }
    outs.sort(function (p, q) { return (p.door.kind === "i_garagedoor") - (q.door.kind === "i_garagedoor") || toStreet(q.door) - toStreet(p.door); });
    var j = outs[0], d = j.door, r = j.rooms[0];
    // out of the room, square to the wall it stands in
    var t = -(r.turn || 0) * Math.PI / 180, dx = d.x - r.x, dy = d.y - r.y;
    var lx = dx * Math.cos(t) - dy * Math.sin(t), ly = dx * Math.sin(t) + dy * Math.cos(t), nl;
    nl = Math.abs(lx) / (r.w / 2 || 1) > Math.abs(ly) / (r.h / 2 || 1) ? [Math.sign(lx) || 1, 0] : [0, Math.sign(ly) || 1];
    var ra = (r.turn || 0) * Math.PI / 180, nrm = [nl[0] * Math.cos(ra) - nl[1] * Math.sin(ra), nl[0] * Math.sin(ra) + nl[1] * Math.cos(ra)];
    return { d: d, room: r, nrm: nrm, out: [d.x + nrm[0] * 1.1 * P, d.y + nrm[1] * 1.1 * P], in: [d.x - nrm[0] * 0.75 * P, d.y - nrm[1] * 0.75 * P] };
  }
  function moWorldPt(floors, p) {
    var f = floors.length ? floorAt(floors, p[0], p[1]) : null;
    return [p[0] + (f ? f.dx : 0), p[1] + (f ? f.dy : 0), f ? f.z : 0];
  }

  // ---- what each piece is, moving in -----------------------------------------------------------------
  // carried in; put in where it is (a switch, a light); built up from the
  // floor (the stairs, a post); driven in; or someone who lives there
  function moClass(ctx, n) {
    if (!n || n.kind === "i_room" || n.kind === "i_lot" || n.kind === "i_floor" || n.kind === "i_zone" || WALK_DOORS[n.kind] || n.kind === "i_window") { return null; }
    if (!cnOurs(ctx, n)) { return null; }
    if (typeof isPerson === "function" && isPerson(n)) { return "resident"; }
    if (BETWEEN_FLOORS[n.kind] || MO_BUILT[n.kind] || n.kind === "i_wall") { return "rise"; }
    if (MO_DRIVEN[n.kind]) { return "fade"; }
    if (MO_FIXTURE[n.kind] || FROM_CEILING[n.kind]) { return "fixture"; }
    if (ON_THE_WALL[n.kind] && Math.max(n.w || 0, n.h || 0) < 0.6 * ctx.P) { return "fixture"; }
    return "carry";
  }
  // The moving in, worked out once for a building: the door, the street,
  // each piece in turn and when, the people last.
  var moDoorsWas = null;                 // the doors opened for the movers, and how they were
  function moPlan(ctx) {
    if (ctx.mo) { return ctx.mo; }
    var P = ctx.P, S = ctx.S, plan = v3Ground(), floors = plan.floors || [];
    var door = plan.cells ? moFrontDoor(ctx, plan) : null, street = moStreet(ctx, door);
    var M = ctx.mo = { plan: plan, floors: floors, door: door, street: street, items: [], byId: {}, residents: [], residentsById: {} };
    var g0 = ctx.zs[0] || 0;
    // the lorry at the kerb, its back just past the path to the door
    var dl = door ? street.L(door.out[0], door.out[1]) : [(street.box[0] + street.box[1]) / 2, street.box[3]];
    M.vanRear = dl[0] + 2.4 * P;
    var back = street.W(M.vanRear - 1.0 * P, street.park), foot = street.W(M.vanRear + 2.8 * P, street.park), walk = street.W(M.vanRear + 2.8 * P, street.hy + 0.8 * P);
    M.outside = [[back[0], back[1], 1.25 * P + 0.03 * P], [foot[0], foot[1], 0], [walk[0], walk[1], 0]];
    if (door) {
      // round the building, if the door is not on its street side (the walk plan's margin round it)
      var round = moOutsideWay(plan, walk, door.out);
      round.forEach(function (p) { M.outside.push([p[0], p[1], 0]); });
      M.outside.push([door.out[0], door.out[1], g0], [door.d.x, door.d.y, g0]);
      M.doorIdx = M.outside.length - 2;
    }
    hand.nodes.forEach(function (n) {
      var c = moClass(ctx, n);
      if (c !== "carry" && c !== "resident") { return; }
      var f = floors.length ? floorAt(floors, n.x, n.y) : null;
      var it = { n: n, id: n.id, level: f ? f.level : 0, cx: n.x + (f ? f.dx : 0), cy: n.y + (f ? f.dy : 0), fz: f ? f.z : 0,
                 w: n.w || 40, h: n.h || 40, route: undefined };
      it.far = door ? Math.hypot(n.x - door.d.x, n.y - door.d.y) + it.level * 12 * P : 0;
      if (c === "resident") { M.residents.push(it); return; }
      it.wide = Math.min(it.w, it.h) > MO_DOOR_W * P;
      it.big = Math.max(it.w, it.h) > 0.85 * P || it.wide;
      it.small = !it.big && Math.max(it.w, it.h) < 0.7 * P;
      it.late = LIES_FLAT[n.kind] ? 0 : ON_TOP[n.kind] || ON_THE_WALL[n.kind] ? 2 : 1;      // (a rug down first; a lamp after its table)
      M.items.push(it);
    });
    // in order: storey by storey; the far rooms first; what stands on
    // something, or hangs over it, after what it stands on
    M.items.sort(function (a, b) { return (a.late - b.late) || (a.level - b.level) || (b.far - a.far) || (a.id - b.id); });
    // each as long as it takes to carry there (40-movein's own clock below:
    // no more than MO_AT_ONCE on their way at once, hurrying if they must)
    var F0 = S.furnish[0], F1 = S.furnish[1], Wn = F1 - F0, n = M.items.length, sum = 0;
    var ms = bpSite ? bpSite.moMs || bpSite.ms : CN_MS.watch.wood;
    M.items.forEach(function (it) { it.est = moEstimate(ctx, M, it); sum += it.est * 1000 / ms; });
    var hurry = sum > 0 ? Math.min(1, MO_AT_ONCE * Wn / sum) : 1;
    M.items.forEach(function (it, i) {
      it.dur = Math.max(0.012, Math.min(Wn * 0.6, it.est * 1000 / ms * hurry));
      it.t0 = F0 + Math.max(0, Wn - it.dur) * (n > 1 ? i / (n - 1) : 0);
      it.t1 = it.t0 + it.dur;
      M.byId[it.id] = it;
    });
    var k = ctx.moK || 1;
    M.residents.forEach(function (it, i) {
      it.t0 = Math.min(1 - 0.03 * k, 1 - (1 - MO_RESIDENT_AT[0]) * k + i * 0.008 * k);
      it.t1 = Math.min(1 - 0.005 * k, it.t0 + 0.045 * k);
      M.residentsById[it.id] = it;
    });
    M.last = M.items.reduce(function (a, it) { return Math.max(a, it.t1 + it.dur * 0.5); }, F0);
    return M;
  }
  // ---- time enough to carry it all in ------------------------------------------------------------------
  // (2026-10-04) Eighty-odd pieces had six seconds: each was run in at
  // fifteen metres a second.  Now each takes as long as carrying it there
  // does, at a mover's pace; the build given that much longer, up to a
  // point -- less when it is put up on opening the view -- and the stages
  // before it squeezed back to the times they had (the clock's fractions,
  // cnContext's S, scaled by moK).
  var MO_PACE = { big: 2.1, small: 2.5 };       // metres a second, carrying
  var MO_AT_ONCE = 14;                          // pieces on their way at once, at most
  var MO_MORE = { watch: 12000, fast: 8000 };   // ms the moving in may add to the build (12 s asked for, 2026-10-04)
  if (typeof bpGo === "function") {
    var bpGoMove = bpGo;
    bpGo = function (tall, wait, fast) {
      var out = bpGoMove.apply(this, arguments);
      if (bpSite) { bpSite.fast = !!fast; }
      return out;
    };
  }
  function moStages(S, k) {
    if (!k || k === 1) { return S; }
    var out = {};
    Object.keys(S).forEach(function (key) { out[key] = [S[key][0] * k, S[key][1] * k]; });
    out.furnish = [S.furnish[0] * k, 1 - (1 - S.furnish[1]) * k];
    return out;
  }
  // how long a piece takes to carry in: from the lorry to the door, on to
  // it round the corners, up a flight a storey; lifted and set down
  function moEstimate(ctx, M, it) {
    var P = ctx.P, out = 0;
    for (var i = 0; i + 1 < M.outside.length; i++) { out += Math.hypot(M.outside[i + 1][0] - M.outside[i][0], M.outside[i + 1][1] - M.outside[i][1]); }
    var inn = M.door ? Math.hypot(it.cx - M.door.d.x, it.cy - M.door.d.y) * 1.35 : 4 * P;
    return (out + inn + it.level * 7 * P) / P / (it.small ? MO_PACE.small : MO_PACE.big) + 1.4;
  }
  function moStretch(ctx) {
    var site = bpSite;
    site.moK = 1; site.moMs = site.ms;
    var M = moPlan(ctx), need = 0;
    M.items.forEach(function (it) { need += it.est || 0; });
    var base = site.ms, F = (ctx.S.furnish[1] - ctx.S.furnish[0]) * base;
    var extra = Math.max(0, Math.min(site.fast ? MO_MORE.fast : MO_MORE.watch, need * 1000 / MO_AT_ONCE - F));
    if (extra < 400) { return; }
    site.moK = base / (base + extra); site.ms = site.moMs = base + extra;
    ctx.S = moStages(ctx.S, site.moK); ctx.moK = site.moK;
    delete ctx.mo;
    cnKept.by = new WeakMap();
    moPlan(ctx);
  }
  // (a new picture of the building -- walking round instead of looking down
  // on it -- is a new context: its stages squeezed as this build's are)
  if (typeof cnContext === "function") {
    var cnContextMove = cnContext;
    cnContext = function (model) {
      var was = cnKept.ctx, ctx = cnContextMove.apply(this, arguments);
      if (!ctx || !bpSite || ctx.moSite === bpSite) { return ctx; }
      try {
        if (ctx === was) {                           // (the same building, built again)
          ctx.S = CN_STAGES[ctx.frame] || ctx.S; delete ctx.mo; delete ctx.moK; cnKept.by = new WeakMap();
        }
        ctx.moSite = bpSite;
        if (bpSite.moK === undefined) { moStretch(ctx); }
        else if (bpSite.moK !== 1) { ctx.S = moStages(ctx.S, bpSite.moK); ctx.moK = bpSite.moK; }
      } catch (e) { if (window.console && console.warn) { console.warn("moving in, timed:", e && e.message); } }
      return ctx;
    };
  }

  // ---- a way with room either side ------------------------------------------------------------------
  // (walkWay's own way hugs the walls -- the shortest is along them -- and a
  // body walked there with its elbow through the plaster.)  As walkWay, but
  // every square beside a wall dearer to cross, the nearer the dearer, and
  // straightened only where the straight line keeps as clear of the walls.
  var MO_NEAR = [0, 3.2, 1.0, 0.3];            // extra to cross a square 1, 2, 3 squares from a wall
  function moClear(plan) {
    if (plan.moClear) { return plan.moClear; }
    var cols = plan.cols, rows = plan.rows, cells = plan.cells, n = cols * rows, d = new Uint8Array(n).fill(9), q = [];
    for (var i = 0; i < n; i++) { if (cells[i] === 1 || cells[i] === 2) { d[i] = 0; q.push(i); } }
    for (var h = 0; h < q.length; h++) {
      var at = q[h], r = Math.floor(at / cols), c = at % cols, nd = d[at] + 1;
      if (nd > 4) { continue; }
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          var rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) { continue; }
          var j = rr * cols + cc;
          if (d[j] > nd) { d[j] = nd; q.push(j); }
        }
      }
    }
    plan.moClear = d;
    return d;
  }
  function moWay(plan, from, wanted, through) {
    // (one place to get to: looked for toward it, not everywhere round -- 40-works.js)
    if (wanted.length === 1 && typeof wkPlanWay === "function") {
      var got = wkPlanWay(plan, from, wanted[0], through);
      if (got) { return got; }
    }
    var cols = plan.cols, rows = plan.rows, cells = plan.cells, n = cols * rows, D = moClear(plan);
    var cost = new Float64Array(n).fill(Infinity), back = new Int32Array(n).fill(-1), goal = {}, any = false;
    wanted.forEach(function (i) { if (i >= 0 && i < n) { goal[i] = true; any = true; } });
    if (!any || from < 0 || from >= n) { return null; }
    function open(i) { return cells[i] === 0 || cells[i] === 3 || i === from || goal[i] || (through && through(i)); }
    var heap = [[0, from]];
    cost[from] = 0;
    function push(c, i) {
      heap.push([c, i]);
      for (var k = heap.length - 1; k > 0;) {
        var up = (k - 1) >> 1;
        if (heap[up][0] <= heap[k][0]) { break; }
        var tmp = heap[up]; heap[up] = heap[k]; heap[k] = tmp; k = up;
      }
    }
    function pop() {
      var top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        for (var k = 0;;) {
          var l = 2 * k + 1, r = l + 1, m = k;
          if (l < heap.length && heap[l][0] < heap[m][0]) { m = l; }
          if (r < heap.length && heap[r][0] < heap[m][0]) { m = r; }
          if (m === k) { break; }
          var tmp = heap[m]; heap[m] = heap[k]; heap[k] = tmp; k = m;
        }
      }
      return top;
    }
    var STEPS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
    var found = -1;
    while (heap.length) {
      var top = pop(), i = top[1];
      if (top[0] > cost[i]) { continue; }
      if (goal[i]) { found = i; break; }
      var r0 = Math.floor(i / cols), c0 = i % cols;
      for (var s = 0; s < 8; s++) {
        var c = c0 + STEPS[s][0], r = r0 + STEPS[s][1];
        if (c < 0 || r < 0 || c >= cols || r >= rows) { continue; }
        var j = r * cols + c;
        if (!open(j)) { continue; }
        if (STEPS[s][0] && STEPS[s][1] && (!open(r0 * cols + c) || !open(r * cols + c0))) { continue; }
        var to = top[0] + STEPS[s][2] * (1 + (MO_NEAR[D[j]] || 0));
        if (to < cost[j]) { cost[j] = to; back[j] = i; push(to, j); }
      }
    }
    if (found < 0) { return null; }
    var way = [];
    for (var at = found; at >= 0; at = back[at]) { way.push(at); }
    return way.reverse();
  }
  function moPts(plan, way) {
    if (!way || !way.length) { return []; }
    var D = moClear(plan), keep = [way[0]], at = 0;
    function roomy(a, b, need) {
      if (!clearLine(plan, a, b)) { return false; }
      var ax = a % plan.cols, ay = Math.floor(a / plan.cols), bx = b % plan.cols, by = Math.floor(b / plan.cols);
      var steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2;
      for (var k = 0; k <= steps; k++) {
        var t = steps ? k / steps : 0, x = Math.round(ax + (bx - ax) * t), y = Math.round(ay + (by - ay) * t);
        if (D[y * plan.cols + x] < need) { return false; }
      }
      return true;
    }
    while (at < way.length - 1) {
      var low = [], m = 9;
      for (var k = at; k < way.length; k++) { m = Math.min(m, D[way[k]]); low[k] = Math.min(2, m); }
      var far = at + 1;
      for (var k2 = way.length - 1; k2 > at + 1; k2--) {
        if (roomy(way[at], way[k2], low[k2])) { far = k2; break; }
      }
      keep.push(way[far]);
      at = far;
    }
    return keep.map(function (i) { return cellMid(plan, i); });
  }

  // From the pavement round to the door, through the margin the walk plan
  // keeps round the building: none if it is straight there.
  function moOutsideWay(plan, from, to) {
    if (!plan.cells) { return []; }
    var in0 = [Math.max(plan.x0 + 6, Math.min(plan.x0 + plan.cols * WALK_CELL - 6, from[0])), Math.max(plan.y0 + 6, Math.min(plan.y0 + plan.rows * WALK_CELL - 6, from[1]))];
    var a = cellOf(plan, in0[0], in0[1]), b = cellOf(plan, to[0], to[1]);
    if (clearLine(plan, a, b)) { return []; }
    var way = moWay(plan, a, [b]);
    if (!way) { return []; }
    var pts = moPts(plan, way);
    return [in0].concat(pts.slice(1, -1));
  }
  // The way to a piece from where the movers come in, in the walk plan's own
  // squares: round what stands in the way where it can, up the stairs to
  // another floor.  World points, and the doors gone through.
  function moLegs(M, from, n, depth) {
    var plan = M.plan, floors = M.floors, start = cellOf(plan, from[0], from[1]), goal = [cellOf(plan, n.x, n.y)];
    var mine = function (i) { return plan.owner[i] === n.id; }, any = function (i) { return plan.cells[i] === 2; };
    var way = moWay(plan, start, goal, mine) || moWay(plan, start, goal, any);
    if (way) { return { pts: moPts(plan, way).map(function (p) { return moWorldPt(floors, p); }), doors: moDoorsOn(M, way) }; }
    if (depth >= 2) { return null; }
    var fa = floors.length ? floorAt(floors, from[0], from[1]) : null, links = plan.links || [];
    for (var k = 0; k < links.length; k++) {
      for (var e = 0; e < 2; e++) {
        var s0 = links[k][e], s1 = links[k][1 - e];
        if ((floors.length ? floorAt(floors, s0.x, s0.y) : null) !== fa) { continue; }
        var onto = moWay(plan, start, cellsUnder(plan, s0), any);
        if (!onto) { continue; }
        var rest = moLegs(M, [s1.x, s1.y], n, depth + 1);
        if (!rest) { continue; }
        return { pts: moPts(plan, onto).map(function (p) { return moWorldPt(floors, p); }).concat(rest.pts),
                 doors: moDoorsOn(M, onto).concat(rest.doors) };
      }
    }
    return null;
  }
  function moDoorsOn(M, way) {
    var plan = M.plan;
    if (!M.doorAt) {
      M.doorAt = {};
      Object.keys(plan.doorway || {}).forEach(function (id) { plan.doorway[id].forEach(function (i) { M.doorAt[i] = +id; }); });
    }
    var out = [];
    way.forEach(function (i) { var d = M.doorAt[i]; if (d !== undefined && out.indexOf(d) < 0) { out.push(d); } });
    return out;
  }
  // a lift or a stair on a piece's own floor, nearest it: where those for an upper floor come out
  function moLiftFor(M, n) {
    var floors = M.floors, f = floors.length ? floorAt(floors, n.x, n.y) : null, best = null, far = Infinity;
    hand.nodes.forEach(function (s) {
      if (!BETWEEN_FLOORS[s.kind] || (floors.length ? floorAt(floors, s.x, s.y) : null) !== f) { return; }
      var d = Math.hypot(s.x - n.x, s.y - n.y) - (s.kind === "i_elevator" ? 200 : 0);
      if (d < far) { far = d; best = s; }
    });
    return best;
  }
  // The whole way, worked out the first time it is wanted: out of the lorry,
  // up the path, through the door, along the rooms (up the stairs); or,
  // high in a tall building, out of the lift on its own floor.
  function moRoute(ctx, it, fromDoor) {
    if (it.route !== undefined) { return it.route; }
    var M = moPlan(ctx), P = ctx.P, n = it.n, pts = null, lift = false;
    var high = ctx.frame === "tall" ? it.level >= 1 : it.level >= 2;
    if (!high && M.door && M.plan.cells) {
      var legs = moLegs(M, M.door.in, n, 0);
      if (legs) {
        pts = (fromDoor ? M.outside.slice(M.doorIdx) : M.outside.slice()).concat(legs.pts);
        it.doors = legs.doors.concat([M.door.d.id]);
        it.doorAt = fromDoor ? 0 : M.doorIdx;
      }
    }
    if (!pts && M.plan.cells) {
      var s = moLiftFor(M, n), up = s ? moLegs(M, [s.x, s.y], n, 2) : null;
      if (up) { var w0 = moWorldPt(M.floors, [s.x, s.y]); pts = [w0].concat(up.pts); it.doors = up.doors; it.doorAt = 0; lift = true; }
    }
    if (!pts) { it.route = null; return null; }
    pts[pts.length - 1] = [it.cx, it.cy, it.fz];                // set down at its own middle
    it.lift = lift;
    it.route = moPath(pts);
    return it.route;
  }
  function moPath(pts) {
    var L = [0];
    for (var i = 1; i < pts.length; i++) { L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], (pts[i][2] - pts[i - 1][2]) * 0.6)); }
    return { pts: pts, L: L, len: L[L.length - 1] || 1 };
  }
  // where along it, d from its start: x, y, z, and the way it is going there
  function moAt(r, d) {
    d = Math.max(0, Math.min(r.len, d));
    var i = 1;
    while (i < r.L.length - 1 && r.L[i] < d) { i++; }
    var a = r.pts[i - 1], b = r.pts[i], seg = r.L[i] - r.L[i - 1] || 1, k = (d - r.L[i - 1]) / seg;
    var x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k, z = a[2] + (b[2] - a[2]) * k;
    // (which way: looking a little ahead, so it turns a corner rather than snapping round it)
    var ahead = moAtPlain(r, Math.min(r.len, d + 0.7 * FLOOR_PX)), behind = moAtPlain(r, Math.max(0, d - 0.25 * FLOOR_PX));
    var dx = ahead[0] - behind[0], dy = ahead[1] - behind[1], l = Math.hypot(dx, dy);
    if (l < 0.5) { dx = b[0] - a[0]; dy = b[1] - a[1]; l = Math.hypot(dx, dy) || 1; }
    return { x: x, y: y, z: z, dir: [dx / l, dy / l] };
  }
  function moAtPlain(r, d) {
    var i = 1;
    while (i < r.L.length - 1 && r.L[i] < d) { i++; }
    var a = r.pts[i - 1], b = r.pts[i], seg = r.L[i] - r.L[i - 1] || 1, k = Math.max(0, Math.min(1, (d - r.L[i - 1]) / seg));
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  function moTurnTo(a, b, k) {                       // from angle a toward b, the short way round
    var d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
    return a + d * k;
  }
  // easing that starts and stops gently, but goes at a steady pace between
  function moPace(u) {
    var r = 0.12;
    if (u <= 0) { return 0; }
    if (u >= 1) { return 1; }
    var v = 1 / (1 - r);                             // the steady speed, for the eases at each end to add up
    if (u < r) { return v * u * u / (2 * r); }
    if (u > 1 - r) { var w = 1 - u; return 1 - v * w * w / (2 * r); }
    return v * (u - r / 2);
  }

  // ---- a piece on its way: where it is, how it is turned, who carries it ---------------------------------
  // u 0..1 through its trip: lifted out (to 0.06), carried (to 0.88), set
  // down where it goes (to 1).
  function moPose(ctx, it, u) {
    var r = moRoute(ctx, it);
    if (!r) { return null; }
    var P = ctx.P, walkU = Math.max(0, Math.min(1, (u - 0.06) / 0.82)), d = r.len * moPace(walkU), at = moAt(r, d);
    var travel = Math.atan2(at.dir[1], at.dir[0]), alongX = it.w >= it.h;
    var carry = travel + (alongX ? 0 : -Math.PI / 2), final = (it.n.turn || 0) * Math.PI / 180;
    var left = r.len - d, settle = cnEase(Math.max(0, Math.min(1, 1 - left / (1.6 * P))));
    var yaw = moTurnTo(carry, final, settle);
    // a wide piece goes through the doors on its side, righted again as it gets there
    var tilt = it.wide ? Math.PI / 2 * Math.min(1, u / 0.06) * (1 - cnEase(Math.max(0, Math.min(1, 1 - left / (1.3 * P))))) : 0;
    var H = it.H || 0.8 * P, across = (alongX ? it.h : it.w) / 2, hz = H / 2;
    var tiltLift = tilt ? across * Math.abs(Math.sin(tilt)) + hz * Math.abs(Math.cos(tilt)) - hz : 0;
    // (held where the hands are -- 40-bodies.js's carrying hands at about 1.1 m:
    // a low table lifted to them, a tall wardrobe gripped low down its sides)
    var tall = tilt ? across * 2 * Math.abs(Math.sin(tilt)) + H * Math.abs(Math.cos(tilt)) : H;
    var held = it.small ? Math.max(0.3 * P, 0.95 * P - H / 2) : Math.max(MO_CARRY_H * P * 0.7, Math.min(0.85 * P, 1.1 * P - tall));
    var down = cnEase(Math.max(0, Math.min(1, (u - 0.86) / 0.14)));
    var carryZ = at.z + held + tiltLift, z = carryZ + ((it.z0 === undefined ? it.fz : it.z0) - carryZ) * down;
    return { x: at.x, y: at.y, z: z, yaw: yaw, final: final, tilt: tilt, alongX: alongX, hz: hz, dir: at.dir, d: d, at: at, down: down, r: r };
  }
  // a piece's faces where it is on its way
  var moTilts = new WeakMap();
  function moTilted(m, alongX, ang, hz) {
    var step = Math.round(ang / (Math.PI / 30));
    if (!step) { return null; }
    var byP = moTilts.get(m.p);
    if (!byP) { byP = new Map(); moTilts.set(m.p, byP); }
    var key = (alongX ? "x" : "y") + step + "|" + Math.round(hz * 4);
    var got = byP.get(key);
    if (got) { return got; }
    var a = step * Math.PI / 30, c = Math.cos(a), s = Math.sin(a), P0 = m.p, N0 = m.n, p = new Float32Array(P0.length), nn = new Float32Array(N0.length);
    for (var i = 0; i < P0.length; i += 3) {
      var x = P0[i], y = P0[i + 1], z = P0[i + 2] - hz, nx = N0[i], ny = N0[i + 1], nz = N0[i + 2];
      if (alongX) { p[i] = x; p[i + 1] = y * c - z * s; p[i + 2] = y * s + z * c + hz; nn[i] = nx; nn[i + 1] = ny * c - nz * s; nn[i + 2] = ny * s + nz * c; }
      else { p[i] = x * c + z * s; p[i + 1] = y; p[i + 2] = -x * s + z * c + hz; nn[i] = nx * c + nz * s; nn[i + 1] = ny; nn[i + 2] = -nx * s + nz * c; }
    }
    got = { p: p, n: nn };
    byP.set(key, got);
    if (byP.size > 48) { byP.delete(byP.keys().next().value); }
    return got;
  }
  function moMoveFaces(out, list, it, pose) {
    var cx = it.cx, cy = it.cy, dyaw = pose.yaw - pose.final, cd = Math.cos(dyaw), sd = Math.sin(dyaw);
    var tx = pose.x - cx, ty = pose.y - cy, dz = pose.z - (it.z0 === undefined ? it.fz : it.z0);
    function turn(p) { var dx = p[0] - cx, dy = p[1] - cy; return [cx + dx * cd - dy * sd + tx, cy + dx * sd + dy * cd + ty, (p[2] || 0) + dz]; }
    list.forEach(function (f) {
      if (f.how && f.how.ghost) { return; }
      var pts = f.pts.map(turn);
      if (!f.mesh) {
        var n = f.n || [0, 0, 1];
        out.push(Object.assign({}, f, { pts: pts, n: [n[0] * cd - n[1] * sd, n[0] * sd + n[1] * cd, n[2]], src: undefined, moves: true }));
        return;
      }
      var m = f.mesh, xf = m.xf || [0, 0, 1, 0, 0], ox = f.pts[0][0] - m.base[0], oy = f.pts[0][1] - m.base[1], oz = (f.pts[0][2] || 0) - m.base[2];
      var wx = xf[0] + ox - cx, wy = xf[1] + oy - cy, a = Math.atan2(xf[3], xf[2]) + dyaw;
      // (on its side: turned about its own long way, in its own numbers)
      var T = pose.tilt ? moTilted(m, pose.alongX, pose.tilt, pose.hz) : null;
      out.push({ pts: pts, n: f.n, how: f.how, node: f.node, src: undefined, moves: true,
                 mesh: { p: moView(T ? T.p : m.p), n: T ? T.n : m.n, uv: m.uv, a: m.a,
                         base: [pts[0][0] - ox, pts[0][1] - oy, pts[0][2] - oz],
                         xf: [cx + wx * cd - wy * sd + tx - ox, cy + wx * sd + wy * cd + ty - oy, Math.cos(a), Math.sin(a), xf[4] + dz] } });
    });
  }
  // ---- carried in empty ---------------------------------------------------------------------------------
  // A bookcase, a shoe rack, shelving: carried in bare, the books and the
  // shoes after them, on the shelves once they stand (38-models.js leaves
  // them off what is made for M.state.empty).  A full bookcase is some
  // seventy thousand corners -- moved each picture, the drawing stuck.
  var MO_EMPTY = { i_bookcase: 1, i_shoerack: 1, i_closetshelves: 1, i_shelving: 1, i_gondola: 1, i_shelf: 1 };
  var moEmptyNow = null;
  if (typeof modelStateOf === "function") {
    var modelStateOfMove = modelStateOf;
    modelStateOf = function (n) {
      if (moEmptyNow !== null && n && n.id === moEmptyNow) {
        return { key: "empty", empty: true, on: false, passing: false, k: function () { return 0; } };
      }
      return modelStateOfMove.apply(this, arguments);
    };
  }
  function moBare(it, list) {
    var n = it.n;
    if (!n || !MO_EMPTY[n.kind] || typeof v3ModelPut !== "function") { return list; }
    if (it.bare && it.bareOf === list.length) { return it.bare; }
    var mf = null;
    list.forEach(function (f) { if (!mf && f.mesh) { mf = f; } });
    if (!mf) { return list; }
    // (as 40-open3d.js's o3Repaint: made where it stands, moved to where its floor is drawn)
    var off = [mf.pts[0][0] - mf.mesh.base[0], mf.pts[0][1] - mf.mesh.base[1], (mf.pts[0][2] || 0) - mf.mesh.base[2]], z0 = mf.mesh.xf[4];
    var made = [], ok = false, first = null;
    moEmptyNow = n.id;
    try { ok = v3ModelPut(made, n, function () { return z0 / FLOOR_PX; }, function () { return z0 / FLOOR_PX + 3; }, function () { return []; }); }
    catch (e) { ok = false; }
    finally { moEmptyNow = null; }
    made.forEach(function (f) { if (!first && f.mesh) { first = f; } });
    if (!ok || !first) { return list; }
    var dz = z0 - first.mesh.xf[4];
    it.bare = made.filter(function (f) { return !(f.how && f.how.ghost); }).map(function (f) {
      f.pts = f.pts.map(function (q) { return [q[0] + off[0], q[1] + off[1], q[2] + off[2] + dz]; });
      f.node = n;
      return f;
    });
    it.bareOf = list.length;
    return it.bare;
  }
  // The movers: two to a big piece, one at each end; one behind a small one.
  // Walking with it; setting it down; going back out for the next.
  var moMoverBudget = 0;
  function moBody(faces, id, x, y, z, head, phase, fade, look) {
    if (moMoverBudget <= 0 || typeof peopleBody !== "function") { return; }
    moMoverBudget--;
    peopleBody(faces, { kind: "i_person", id: id }, x, y, z, head, phase, look || MO_MOVER, fade);
  }
  function moStep(d, speed) {                         // how far through a step: by the way gone, not faster than a brisk pace
    return d / (0.36 * FLOOR_PX) * Math.min(1, 5.5 * FLOOR_PX / Math.max(1, speed));
  }
  function moCarriers(faces, ctx, it, pose, u, speed) {
    var P = ctx.P, d = pose.dir, side = [-d[1], d[0]], half = Math.max(it.w, it.h) / 2, across = Math.min(it.w, it.h) / 2;
    var head = Math.atan2(d[1], d[0]), phase = pose.down > 0.05 ? 0.25 : moStep(pose.d, speed), fade = Math.min(1, u / 0.05 + 0.15);
    var floorZ = pose.at.z, spots;
    if (it.big) {
      var reach = half + 0.33 * P, off = across + 0.32 * P, k = pose.down;
      spots = [[pose.x + d[0] * reach * (1 - k) + side[0] * off * k, pose.y + d[1] * reach * (1 - k) + side[1] * off * k],
               [pose.x - d[0] * reach * (1 - k) - side[0] * off * k, pose.y - d[1] * reach * (1 - k) - side[1] * off * k]];
    } else {
      spots = [[pose.x - d[0] * (half + 0.28 * P), pose.y - d[1] * (half + 0.28 * P)]];
    }
    // (the one in front walking backwards, facing it; both holding it out in front of them)
    spots.forEach(function (s, i) {
      var h = pose.down > 0.5 ? Math.atan2(pose.y - s[1], pose.x - s[0]) : it.big && i === 0 ? head + Math.PI : head;
      moBody(faces, 700 + it.id * 3 + i, s[0], s[1], floorZ, h, phase + i * Math.PI, fade, pose.down < 0.4 ? MO_HOLDING : null);
    });
  }
  // going back the way they came, as far as the door (or the lift), and gone
  function moGoingBack(faces, ctx, it, k) {
    var r = it.route;
    if (!r || k >= 1) { return; }
    var P = ctx.P, stop = r.L[Math.max(0, it.doorAt || 0)], d = r.len - (r.len - stop) * k, at = moAt(r, d);
    var fade = Math.max(0, Math.min(1, (1 - k) / 0.25));
    var head = Math.atan2(-at.dir[1], -at.dir[0]), count = it.big ? 2 : 1;
    for (var i = 0; i < count; i++) {
      var off = (i ? -1 : 1) * 0.35 * P * (count - 1);
      moBody(faces, 700 + it.id * 3 + i, at.x - at.dir[1] * off, at.y + at.dir[0] * off, at.z, head, moStep(r.len - d, 4 * P) + i * Math.PI, fade);
    }
  }
  // Everything moving in, this picture: the pieces on their way (their
  // faces put where they are now), and the movers; the people coming home.
  function moMoveIn(faces, site, ctx, t, fly) {
    var M = moPlan(ctx), P = ctx.P, ms = bpSite ? bpSite.moMs || bpSite.ms : CN_MS.fast.wood;
    // (as many as are carrying, first: a piece never goes by on its own;
    // those walking back out after, as many as are left -- 40-bodies.js's
    // bodies are kept models now, not hundreds of faces each)
    moMoverBudget = M.items.length > 80 ? 64 : 80;
    var back = [];
    // the front door open for them while they come and go
    if (M.door && t > ctx.S.furnish[0] - 0.02 && t < 0.995) { moOpen(M.door.d.id); }
    M.items.forEach(function (it) {
      if (t < it.t0 - 0.004 || t > it.t1 + it.dur * 0.55) { return; }
      var list = fly[it.id];
      if (list && list.length && it.z0 === undefined) {
        var lo = Infinity, hi = -Infinity;
        list.forEach(function (f) { if (f.how && f.how.ghost) { return; } f.pts.forEach(function (p) { lo = Math.min(lo, p[2] || 0); hi = Math.max(hi, p[2] || 0); }); });
        if (lo < Infinity) { it.z0 = lo; it.H = Math.max(2, hi - lo); }
      }
      var r = moRoute(ctx, it);
      if (t >= it.t1) { if (it.seen && r) { back.push(it); } return; }
      if (!list) { return; }
      var u = Math.max(0, (t - it.t0) / it.dur);
      if (!r) { if (u > 0.5) { Array.prototype.push.apply(faces, list); } return; }      // (no way to it found: put there)
      it.seen = true;
      (it.doors || []).forEach(moOpen);
      var pose = moPose(ctx, it, u);
      if (!pose) { return; }
      moMoveFaces(faces, moBare(it, list), it, pose);
      var speed = r.len / Math.max(0.05, it.dur * 0.82 * ms / 1000);
      moCarriers(site, ctx, it, pose, u, speed);
    });
    back.forEach(function (it) { moGoingBack(site, ctx, it, (t - it.t1) / (it.dur * 0.55)); });
    // those who live there, walking in last
    M.residents.forEach(function (it) {
      if (t < it.t0 || t >= it.t1) { return; }
      var r = moRoute(ctx, it, false);
      if (!r) { return; }
      var u = (t - it.t0) / (it.t1 - it.t0), start = it.lift ? 0 : r.L[2] || 0, d = start + (r.len - start) * moPace(u), at = moAt(r, d);
      var look = typeof simLook === "function" ? simLook(it.n) : null, fade = Math.min(1, u / 0.12);
      var head = u > 0.94 ? (typeof peopleFacing === "function" ? peopleFacing(it.n) : 0) : Math.atan2(at.dir[1], at.dir[0]);
      if (typeof peopleBody === "function") { peopleBody(site, it.n, at.x, at.y, at.z, head, u > 0.94 ? 0 : moStep(d - start, 3 * P), look, fade); }
    });
  }
  function moOpen(id) {
    if (typeof doorOpen !== "object" || id === undefined) { return; }
    moDoorsWas = moDoorsWas || {};
    if (!(id in moDoorsWas)) { moDoorsWas[id] = id in doorOpen ? doorOpen[id] : undefined; }
    doorOpen[id] = true;
  }
  // Built, or let be: the doors as they were.
  function moDone() {
    if (!moDoorsWas || typeof doorOpen !== "object") { moDoorsWas = null; return; }
    Object.keys(moDoorsWas).forEach(function (id) {
      if (moDoorsWas[id] === undefined) { delete doorOpen[id]; } else { doorOpen[id] = moDoorsWas[id]; }
    });
    moDoorsWas = null;
    if (typeof V3 !== "undefined" && V3) { V3.dirty = true; }
  }

  // ---- the lorries --------------------------------------------------------------------------------------
  // where a vehicle is, in the street's numbers, and its heading there
  function moPutLocal(faces, S, made, lx, ly, heading, z, moving) {
    var w = S.W(lx, ly);
    moPut(faces, made, w[0], w[1], S.a + heading, z || 0, moving);
  }
  function moBez(P0, P1, P2, u) {
    var a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
    return { x: P0[0] * a + P1[0] * b + P2[0] * c, y: P0[1] * a + P1[1] * b + P2[1] * c,
             dx: 2 * (1 - u) * (P1[0] - P0[0]) + 2 * u * (P2[0] - P1[0]), dy: 2 * (1 - u) * (P1[1] - P0[1]) + 2 * u * (P2[1] - P1[1]) };
  }
  function moTraffic(faces, ctx, t) {
    var M = moPlan(ctx);
    moMixers(faces, ctx, M, t);
    moDeliveries(faces, ctx, M, t);
    moVan(faces, ctx, M, t);
  }
  // The mixers: down the street, past the spot, backed up to the slab (or
  // stood at the kerb where the building is too near the road), pouring,
  // and away again -- their drums turning all the while.
  function moMixers(faces, ctx, M, t) {
    var S = M.street, P = ctx.P, St = ctx.S, f0 = St.found[0], f1 = St.found[1], count = ctx.frame === "tall" ? 3 : ctx.frame === "steel" ? 2 : 1;
    if (t < f0 - 0.08 || t > f1 + 0.09) { return; }
    var b = S.box, mid = (b[0] + b[1]) / 2, secs = t * (bpSite ? bpSite.ms : 9000) / 1000;
    for (var i = 0; i < count; i++) {
      var xt = mid + (i - (count - 1) / 2) * 3.4 * P, cy = b[3] + 0.9 * P + 4.77 * P, backed = cy < S.lane - 3 * P;
      var R = Math.max(4 * P, S.lane - cy), lag = i * 0.006;
      var tA = f0 - 0.075 + lag, tS = f0 - 0.03 + lag, tP = f0 - 0.004, tO = f1 + 0.004 + lag, tL = f1 + 0.035 + lag, tE = f1 + 0.075 + lag;
      if (t < tA || t > tE) { continue; }
      var pos, head, pouring = t >= tP && t <= tO;
      if (!backed) { cy = S.park; }
      if (t < tS) {                                                   // down the street to just past the spot
        var a = moAlongRoad(S, mid + S.far, backed ? xt - R : xt, S.lane, backed ? S.lane : S.park, (t - tA) / (tS - tA));
        pos = [a.x, a.y]; head = Math.PI;
      } else if (backed && t < tP) {                                  // backed round into the lot
        var u = cnEase((t - tS) / (tP - tS)), q = moBez([xt - R, S.lane], [xt, S.lane], [xt, cy], u);
        pos = [q.x, q.y]; head = Math.atan2(q.dy, q.dx) + Math.PI;
      } else if (t <= tO) { pos = [xt, cy]; head = backed ? Math.PI / 2 : Math.PI; }
      else if (backed && t < tL) {                                    // out again, forwards
        var v = cnEase((t - tO) / (tL - tO)), w = moBez([xt, cy], [xt, S.lane], [xt - R, S.lane], v);
        pos = [w.x, w.y]; head = Math.atan2(w.dy, w.dx);
      } else {                                                        // and away down the street
        var from = backed ? xt - R : xt, g = Math.max(0, Math.min(1, (t - (backed ? tL : tO)) / (tE - (backed ? tL : tO))));
        pos = [from + (mid - S.far - from) * g * g, backed ? S.lane : S.park + (S.lane - S.park) * Math.min(1, g * 3)]; head = Math.PI;
      }
      var moving = !(t >= tP && t <= tO), turn = secs * (pouring ? 3.2 : 1.4) + i;
      var paint = ["#f2f2ee", "#e2622a", "#2f6aa8"][i % 3], mx = moMixer(turn, paint);
      moPutLocal(faces, S, mx.body, pos[0], pos[1], head, 0, moving);
      moPutLocal(faces, S, mx.drum, pos[0], pos[1], head, 0, true);
      // the chute from under the hopper, swung out to the slab; the concrete running down it
      var hc = Math.cos(head), hs = Math.sin(head), pivot = [pos[0] - hc * 3.75 * P, pos[1] - hs * 3.75 * P];
      var aimL = backed ? [pivot[0] - hc * 2.2 * P, pivot[1] - hs * 2.2 * P] : [pivot[0] - 0.2 * P, Math.min(b[3] - 0.6 * P, pivot[1] - 2.4 * P)];
      var reach = Math.hypot(aimL[0] - pivot[0], aimL[1] - pivot[1]), out = pouring ? Math.min(1, (t - tP) / 0.006) : Math.max(0, 1 - (t - tO) / 0.006);
      if (out > 0 && reach > 0.5 * P) {
        var tip = [pivot[0] + (aimL[0] - pivot[0]) * out, pivot[1] + (aimL[1] - pivot[1]) * out];
        var A = S.W(pivot[0], pivot[1]), B = S.W(tip[0], tip[1]), steel = { piece: true, color: "#9aa0a6", edge: "#6b7177", pat: 22 };
        cnBeam(faces, [A[0], A[1], 1.75 * P], [B[0], B[1], 1.05 * P], 0.42 * P, steel, 0.16 * P);
        if (pouring) {
          var top = (ctx.zs[0] || 0) - 0.5;
          cnBeam(faces, [B[0], B[1], 1.0 * P], [B[0], B[1], top + 0.05 * P], 0.22 * P, Object.assign({}, CN_CONCRETE, { pat: 10 }));
          cnPuff(faces, B[0], B[1], top, (secs * 2.2) % 1, 0.5 * P, P);
        }
      }
    }
  }
  // The semis: a flatbed of timber (or steel, or the roof's trusses) at the
  // kerb while the frame goes up, unloaded as the crew carries it off.
  function moDeliveries(faces, ctx, M, t) {
    var S = M.street, P = ctx.P, St = ctx.S, b = S.box, mid = (b[0] + b[1]) / 2;
    var list = ctx.frame === "wood" ? [[St.frame[0] - 0.012, 0.14, "lumber"], [St.truss[0] - 0.03, 0.08, "truss"]]
             : ctx.frame === "steel" ? [[St.frame[0] - 0.012, 0.12, "steel"], [(St.frame[0] + St.frame[1]) / 2, 0.1, "steel"]]
             : [[St.frame[0] - 0.012, 0.12, "steel"], [St.frame[0] + (St.frame[1] - St.frame[0]) * 0.36, 0.1, "steel"], [St.frame[0] + (St.frame[1] - St.frame[0]) * 0.7, 0.1, "steel"]];
    list.forEach(function (dv, i) {
      var tA = dv[0] - 0.045, tP = dv[0], tO = dv[0] + dv[1], tE = tO + 0.05;
      if (t < tA || t > tE) { return; }
      var x = mid - 1.5 * P - (i % 2) * 3 * P, lx, ly, moving = true, load = 1;
      if (t < tP) { var a = moAlongRoad(S, mid + S.far + 8 * P, x, S.lane, S.park, (t - tA) / (tP - tA)); lx = a.x; ly = a.y; }
      else if (t <= tO) { lx = x; ly = S.park; moving = false; load = 1 - 0.75 * (t - tP) / (tO - tP); }
      else { var g = (t - tO) / (tE - tO); lx = x + (mid - S.far - 8 * P - x) * g * g; ly = S.park + (S.lane - S.park) * Math.min(1, g * 3); load = 0.25; }
      moSemi(faces, S, lx, ly, ["#b8352e", "#2f6aa8", "#3d7a4a"][i % 3], moTrailer("flat", load, "#3d6aa8", dv[2]), moving);
    });
  }
  function moSemi(faces, S, lx, ly, paint, trailer, moving) {
    var P = FLOOR_PX;
    moPutLocal(faces, S, moTractor(paint), lx, ly, Math.PI, 0, moving);
    moPutLocal(faces, S, trailer, lx - MO_FIFTH * P, ly, Math.PI, 0.02 * P, moving);   // (heading -x: its trailer behind, to +x)
  }
  // The removal lorry: at the kerb by the path while the furniture comes
  // out of it, its back open and its ramp down; away when the last is in.
  function moVan(faces, ctx, M, t) {
    var S = M.street, P = ctx.P, St = ctx.S, F0 = St.furnish[0];
    var tA = F0 - 0.05, tP = F0 - 0.012, tO = Math.min(0.975, Math.max(0.93, M.last + 0.004)), tE = Math.min(0.999, tO + 0.04);
    if (!M.items.length || t < tA || t > tE) { return; }
    var king = M.vanRear - 14.7 * P, x = king + MO_FIFTH * P, lx, ly = S.park, moving = true, open = t >= tP && t <= tO;
    if (t < tP) { var a = moAlongRoad(S, x + S.far, x, S.lane, S.park, (t - tA) / (tP - tA)); lx = a.x; ly = a.y; }
    else if (t <= tO) { lx = x; moving = false; }
    else { var g = (t - tO) / (tE - tO); lx = x - (S.far + 30 * P) * g * g; ly = S.park + (S.lane - S.park) * Math.min(1, g * 3); }
    moSemi(faces, S, lx, ly, "#f2f2ee", moTrailer(open ? "open" : "box", 1, "#2f5d8a", ""), moving);
    if (open) {
      // its ramp, down from the back to the road
      var ramp = Math.min(1, (t - tP) / 0.008) * Math.min(1, (tO - t) / 0.008), back = lx - MO_FIFTH * P + 14.7 * P;
      var A = S.W(back, ly), B = S.W(back + 2.7 * P * ramp, ly), alu = { piece: true, color: "#b9bdc2", edge: "#7d8186", pat: 23 };
      cnBeam(faces, [A[0], A[1], 1.25 * P], [B[0], B[1], 1.25 * P * (1 - ramp) + 0.04 * P], 1.1 * P, alu, 0.05 * P);
    }
  }

  // ====================================================================== into the build (40-build.js) ==
  // What each piece is when it goes up: carried in, put in, built up, or
  // walked in -- not dropped out of the air.
  if (typeof cnEntry === "function") {
    var cnEntryMove = cnEntry;
    cnEntry = function (ctx, f) {
      var key = f.src || f, got = cnKept.by.get(key);
      if (got !== undefined) { return got; }
      var e = cnEntryMove(ctx, f), n = f.node;
      try {
        if (n && f.pts && (e ? e.kind === "drop" : f.person)) {
          var c = moClass(ctx, n), M = c ? moPlan(ctx) : null, ne = null, lo = e ? e.lo : 0, hi = e ? e.hi : 0, lvl = e ? e.lvl : 0;
          if (c === "carry" && M.byId[n.id]) {
            var it = M.byId[n.id];
            ne = { kind: "carry", id: n.id, t0: it.t0, t1: it.t1, lo: lo, hi: hi, lvl: lvl };
          } else if (c === "resident" && M.residentsById[n.id]) {
            var rz = M.residentsById[n.id];
            ne = { kind: "resident", id: n.id, t0: rz.t0, t1: rz.t1, lo: lo, hi: hi, lvl: lvl };
          } else if (c === "rise" && e) {
            var sl = cnSlot(ctx, n.kind === "i_wall" ? "inside" : MO_BUILT[n.kind] && n.kind !== "i_post" ? "shell" : "frame", lvl), a0 = sl[0] + sl[1] * 0.35;
            ne = { kind: "rise", t0: a0, t1: a0 + Math.max(0.02, sl[1] * 0.45), lo: lo, hi: hi, lvl: lvl };
          } else if (c === "fixture" && e) {
            var si = cnSlot(ctx, "inside", lvl), b0 = si[0] + si[1] * (0.45 + 0.4 * ((n.id * 37) % 100) / 100);
            ne = { kind: "fade", t0: b0, t1: b0 + 0.012, lo: lo, hi: hi, lvl: lvl };
          } else if (c === "fade" && e) {
            var sf = cnSlot(ctx, "furnish", lvl);
            ne = { kind: "fade", t0: sf[0] + sf[1] * 0.5, t1: sf[0] + sf[1] * 0.5 + 0.03, lo: lo, hi: hi, lvl: lvl };
          }
          if (ne) { e = ne; cnKept.by.set(key, e); }
        }
      } catch (err) { /* as 40-build.js has it */ }
      return e;
    };
  }
  // built up from the floor as a wall is; and a model moved handed over as a
  // fresh view of its numbers (moView), so the drawing does not keep one for every spot it passes
  if (typeof cnAnimate === "function") {
    var cnAnimateMove = cnAnimate;
    cnAnimate = function (f, e, k, P) {
      if (e.kind === "rise") { e = { kind: "wall", lo: e.lo, hi: e.hi }; }
      var g = cnAnimateMove.call(this, f, e, k, P);
      if (g && g !== f && f.mesh && g.mesh === f.mesh && g.pts !== f.pts) { g.mesh = Object.assign({}, f.mesh, { p: moView(f.mesh.p) }); }
      if (g && g !== f) { g.moves = true; }            // (drawn apart from what stands still: gl3Faces)
      return g;
    };
  }
  // Each picture while it goes up: as 40-build.js's, the pieces on their
  // way in kept apart, and put where they are now with those carrying them.
  if (typeof cnBuilding === "function") {
    cnBuilding = function (model, t) {
      var ctx = cnContext(model);
      if (!ctx) { return model; }
      var P = ctx.P, S = ctx.S, faces = [], shellTop = -Infinity, fly = {};
      for (var i = 0; i < model.faces.length; i++) {
        var f = model.faces[i], e = cnEntry(ctx, f);
        if (!e) { faces.push(f); continue; }
        if (e.kind === "carry" || e.kind === "resident") {
          if (t >= e.t1) { faces.push(f); }
          else if (t >= e.t0 - 0.004 && e.kind === "carry") { (fly[e.id] || (fly[e.id] = [])).push(f); }
          continue;
        }
        if (t < e.t0) { continue; }
        if (t >= e.t1) { faces.push(f); if (e.kind === "wall" || e.kind === "skin") { shellTop = Math.max(shellTop, e.hi); } continue; }
        var k = (t - e.t0) / (e.t1 - e.t0), g = cnAnimate(f, e, k, P);
        if (g) { faces.push(g); }
        if (e.kind === "wall" || e.kind === "skin") { shellTop = Math.max(shellTop, e.lo + (e.hi - e.lo) * k); }
      }
      var out = Object.assign({}, model, { faces: faces });
      var site = out.passing = { faces: model.passing ? model.passing.faces.slice() : [], stand: model.passing ? model.passing.stand.slice() : [] };
      try { cnSite(site.faces, ctx, t, shellTop); } catch (err) { /* the building alone */ }
      try { moMoveIn(faces, site.faces, ctx, t, fly); } catch (err2) { if (window.console && console.warn) { console.warn("moving in:", err2 && err2.message); } }
      if (out.labels && t < S.inside[0]) { out.labels = out.labels.filter(function (l) { return !l.room; }); }
      // (the names of the pieces not in yet, not over where they will be)
      if (out.labels && t < S.furnish[1] + 0.01 && ctx.mo) {
        var waiting = {};
        ctx.mo.items.concat(ctx.mo.residents).forEach(function (it) { if (t < it.t1) { waiting[Math.round(it.cx) + "," + Math.round(it.cy)] = true; } });
        out.labels = out.labels.filter(function (l) { return l.room || !waiting[Math.round(l.x) + "," + Math.round(l.y)]; });
      }
      return out;
    };
  }
  // The lorries, with the rest of the site; the old mixer standing by the slab given over to them.
  if (typeof cnSite === "function") {
    var cnSiteMove = cnSite;
    cnSite = function (faces, ctx, t) {
      var out = cnSiteMove.apply(this, arguments);
      try { moTraffic(faces, ctx, t); } catch (e) { if (window.console && console.warn) { console.warn("site traffic:", e && e.message); } }
      return out;
    };
  }
  if (typeof cnMixer === "function") { cnMixer = function () {}; }

  // ---- a piece added in 3D afterwards: carried in from the door by the builders --------------------------
  // (one moved or turned stays where it was put; the builders come to see to it)
  if (typeof cnDiff === "function") {
    var cnDiffMove = cnDiff;
    cnDiff = function () {
      var was = cnWatch.by, before = cnWatch.jobs.slice(), out = cnDiffMove.apply(this, arguments);
      if (was) {
        cnWatch.jobs.forEach(function (j) {
          if (before.indexOf(j) >= 0 || j.room || j.fresh !== undefined) { return; }
          j.fresh = !was.has(j.id);
          if (j.fresh) { j.carry = 2400; j.ms = 4600; }
        });
      }
      return out;
    };
  }
  if (typeof cnJobs === "function") {
    cnJobs = function (model) {
      var t = performance.now();
      cnWatch.jobs = cnWatch.jobs.filter(function (j) { return t - j.t0 < j.ms + 900; });
      cnWatch.wrecks = cnWatch.wrecks.filter(function (w) { return t - w.t0 < w.ms; });
      if (!cnWatch.jobs.length && !cnWatch.wrecks.length) { if (moDoorsWas && !bpSite) { moDone(); } return model; }
      var P = FLOOR_PX, by = {}, faces = [], carry = {};
      cnWatch.jobs.forEach(function (j) { by[j.id] = j; });
      for (var i = 0; i < model.faces.length; i++) {
        var f = model.faces[i], j = f.node ? by[f.node.id] : null;
        if (!j) { faces.push(f); continue; }
        if (!j.room) {
          if (j.fresh && t - j.t0 < j.carry) { (carry[j.id] || (carry[j.id] = [])).push(f); continue; }
          faces.push(f);
          continue;
        }
        var k = (t - j.t0 - 600) / j.ms;
        if (k >= 1) { faces.push(f); continue; }
        if (k <= 0) { k = 0; }
        var lo = Infinity, hi = -Infinity;
        f.pts.forEach(function (p) { lo = Math.min(lo, p[2] || 0); hi = Math.max(hi, p[2] || 0); });
        var g = f.how && f.how.wall ? cnAnimate(f, { kind: "wall", lo: lo, hi: hi }, k, P) : cnAnimate(f, { kind: "fade" }, k, P);
        if (g) { faces.push(g); }
      }
      var out = Object.assign({}, model, { faces: faces });
      var passing = out.passing = { faces: model.passing ? model.passing.faces.slice() : [], stand: model.passing ? model.passing.stand.slice() : [] };
      moMoverBudget = 12;
      cnWatch.jobs.forEach(function (j) {
        if (j.fresh && !j.room) {
          try { if (moJobCarry(faces, passing.faces, model, j, t, carry[j.id])) { return; } } catch (e) { /* the old way */ }
          if (carry[j.id] && t - j.t0 > j.carry * 0.5) { Array.prototype.push.apply(faces, carry[j.id]); }
        }
        cnJobCrew(passing.faces, j, t, P);
      });
      cnWatch.wrecks.forEach(function (w) { cnWreckDraw(passing.faces, w, t, P); });
      V3.dirty = true;
      return out;
    };
  }
  // Two builders bring it in by the front door, set it down where it goes, and go.
  function moJobCarry(faces, site, model, j, t, list) {
    var ctx = cnContext(model);
    if (!ctx) { return false; }
    var M = moPlan(ctx), P = ctx.P, it = j.it;
    if (!it) {
      var n = nodeById(j.id), c = n ? moClass(ctx, n) : null;
      if (!n || c !== "carry") { j.it = { fixed: true }; return false; }
      var f = M.floors.length ? floorAt(M.floors, n.x, n.y) : null;
      it = j.it = { n: n, id: n.id, level: f ? f.level : 0, cx: n.x + (f ? f.dx : 0), cy: n.y + (f ? f.dy : 0), fz: f ? f.z : 0, w: n.w || 40, h: n.h || 40, route: undefined };
      it.wide = Math.min(it.w, it.h) > MO_DOOR_W * P; it.big = true; it.small = false;
    }
    if (it.fixed) { return false; }
    var r = moRoute(ctx, it, true);
    if (!r) { return false; }
    if (!j.sized) {                                   // as long as the way in takes
      j.carry = Math.max(1300, Math.min(4200, r.len / (3.6 * P) * 1000));
      j.ms = j.carry + 2300; j.sized = true;
    }
    var e = t - j.t0, u = e / j.carry;
    if (u < 1) {
      if (!list || !list.length) { return true; }
      if (it.z0 === undefined) {
        var lo = Infinity, hi = -Infinity;
        list.forEach(function (q) { if (q.how && q.how.ghost) { return; } q.pts.forEach(function (p) { lo = Math.min(lo, p[2] || 0); hi = Math.max(hi, p[2] || 0); }); });
        if (lo < Infinity) { it.z0 = lo; it.H = Math.max(2, hi - lo); }
      }
      (it.doors || []).forEach(moOpen);
      var pose = moPose(ctx, it, Math.max(0.06, u));
      if (!pose) { return false; }
      moMoveFaces(faces, moBare(it, list), it, pose);
      moCarriers(site, ctx, it, pose, Math.max(0.06, u), r.len / Math.max(0.3, j.carry * 0.82 / 1000));
      it.seen = true;
      return true;
    }
    // stood back a moment, then out the way they came
    var back = (e - j.carry - 500) / Math.max(400, j.ms - j.carry - 900);
    if (back < 0) {
      var pose2 = moPose(ctx, it, 1);
      if (pose2) { moCarriers(site, ctx, it, pose2, 1, 1); }
    } else { moGoingBack(site, ctx, it, back); }
    return true;
  }
