// ---------------------------------------------------------------------------
//  40-towerkit.js -- what a skyscraper is fitted with that nothing else was:
//  the speed gates between its lobby and its lifts, the bench desks of its
//  open-plan floors and the booths to take a call in, the lobby's feature
//  wall; and on its floors of plant the air handlers, the chillers, the
//  water tanks and the switchboards -- each drawn on the plan and made in 3D
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-06: "do tons of research on sky scrapers and their interior design language
  // and add new models for things and items into the mix")
  //
  // As towers are fitted out: in the lobby a security desk where it sees the doors, a line of speed
  // gates -- glass flaps in steel pedestals, a lane a metre wide, a wider one for a wheelchair -- in
  // front of the lifts' lobby, a wall of stone or light behind the desk; on an office floor the open
  // plan out by the glass in benches of desks back to back, a screen between, and by the core the
  // meeting rooms and the booths for a call; and every fifteenth floor or so up a tall one, the plant
  // that keeps it going: air handlers the size of a lorry, chillers, the tanks, the switchboards.
  // Made as 40-items.js makes its things (itAdd: centimetres across and back to front, the picture
  // on the plan, where it goes in 3D, its model).
  var cmT = MODEL_CM;
  // a desk chair: its seat, its back, its post and its five feet -- facing +y (its back toward -y)
  function tkChair(M, x, y, face, seatC, frameC) {
    M.push().move(x, y, 0);
    if (face) { M.turn(face); }
    var seat = M.mat("fabric", seatC), frame = M.mat("metal", frameC);
    for (var i = 0; i < 5; i++) { var a = i / 5 * Math.PI * 2; M.tube([0, 0, 5 * cmT], [Math.cos(a) * 30 * cmT, Math.sin(a) * 30 * cmT, 4 * cmT], 1.4 * cmT, frame, 6); }
    M.cyl(0, 0, 5 * cmT, 42 * cmT, 2.5 * cmT, frame, { seg: 10 });
    M.box(-24 * cmT, 24 * cmT, -22 * cmT, 24 * cmT, 42 * cmT, 49 * cmT, seat, 3 * cmT);
    M.box(-22 * cmT, 22 * cmT, -27 * cmT, -21 * cmT, 52 * cmT, 98 * cmT, seat, 3 * cmT);
    M.tube([0, -24 * cmT, 46 * cmT], [0, -24 * cmT, 56 * cmT], 1.6 * cmT, frame, 6);
    M.pop();
  }

  // ---- the lobby -----------------------------------------------------------------------------------
  // a speed gate's pedestal: brushed steel, a strip of light along its top, and its glass flaps shut
  // across the lanes each side (a row of them is a row of lanes; walked through, not round)
  itAdd("ic_tower", "i_speedgate", 22, 150, ["o " + itR(0, 0, 22, 150, 5), "t M4 75 H18", "k " + itR(4, 20, 14, 4, 1) + " " + itR(4, 126, 14, 4, 1)], { h: 1.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#c9ced2", "#2a2d31");
    var steel = M.mat("chrome", C.main), glass = M.mat("glass", "#d7e6ee"), dark = M.mat("plastic", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 4 * cmT, steel, 4 * cmT);
    M.box(-W / 2 + 1 * cmT, W / 2 - 1 * cmT, -D / 2 + 2 * cmT, D / 2 - 2 * cmT, H - 4 * cmT, H, dark, 2 * cmT);
    M.box(-W / 2 + 3 * cmT, W / 2 - 3 * cmT, -D / 2 + 6 * cmT, -D / 2 + 22 * cmT, H, H + 0.4 * cmT, M.mat("glow", "#7fd6a2"));     // the reader
    M.box(-W / 2 + 3 * cmT, W / 2 - 3 * cmT, D / 2 - 22 * cmT, D / 2 - 6 * cmT, H, H + 0.4 * cmT, M.mat("glow", "#7fd6a2"));
    // the flaps, shut, a curved pane each side
    [-1, 1].forEach(function (s) {
      M.box(s > 0 ? W / 2 : -W / 2 - 38 * cmT, s > 0 ? W / 2 + 38 * cmT : -W / 2, -0.6 * cmT, 0.6 * cmT, 38 * cmT, 96 * cmT, glass, 0.5 * cmT);
    });
  });
  // a wall of honed stone panels, a line of light along its top and its foot (hung on the wall the
  // lobby's desk stands in front of)
  itAdd("ic_tower", "i_featurewall", 600, 25, function (w, h) {
    var d = "";
    for (var x = 60; x < w - 1; x += 60) { d += "M" + itN(x) + " 0 V" + itN(h) + " "; }
    return ["o " + itR(0, 0, w, h, 0), "t " + (d.trim() || "M0 0")];
  }, { wall: [0, 4.2] }, function (M, W, D, H, C) {
    C = mPick(C, "#d8d2c6", "#2b2622");
    var stone = M.mat("stone", C.main), joint = M.mat("stone", "#b9b2a5"), glow = M.mat("glow", "#ffe9c2");
    var n = Math.max(2, Math.round(W / (60 * cmT)));
    for (var i = 0; i < n; i++) {
      var x0 = -W / 2 + i * W / n, x1 = x0 + W / n - 0.6 * cmT;
      M.box(x0, x1, -D / 2, -D / 2 + 6 * cmT + (i % 2) * 1.2 * cmT, 6 * cmT, H - 8 * cmT, stone);
      M.box(x1, x1 + 0.6 * cmT, -D / 2, -D / 2 + 4 * cmT, 6 * cmT, H - 8 * cmT, joint);
    }
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 9 * cmT, H - 8 * cmT, H, M.mat("metal", C.frame));
    M.box(-W / 2 + 4 * cmT, W / 2 - 4 * cmT, -D / 2 + 9 * cmT, -D / 2 + 9.4 * cmT, H - 7 * cmT, H - 3 * cmT, glow);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 9 * cmT, 0, 6 * cmT, M.mat("metal", C.frame));
    M.box(-W / 2 + 4 * cmT, W / 2 - 4 * cmT, -D / 2 + 9 * cmT, -D / 2 + 9.4 * cmT, 2 * cmT, 5 * cmT, glow);
  });

  // ---- the office floors ------------------------------------------------------------------------------
  // a bench of four desks, two each side of a screen, a monitor and a chair to each (one piece, as an
  // open plan is laid out: a bench at a time)
  itAdd("ic_tower", "i_benchdesk", 280, 280, ["o " + itR(5, 58, 270, 80, 2) + " " + itR(5, 142, 270, 80, 2), "k " + itR(5, 137, 270, 6, 1),
    "t " + itC(70, 28, 22) + " " + itC(210, 28, 22) + " " + itC(70, 252, 22) + " " + itC(210, 252, 22)], { h: 1.25 }, function (M, W, D, H, C) {
    C = mPick(C, "#ece8e0", "#3c3f44");
    var top = M.mat("wood", C.main), leg = M.mat("metal", C.frame), screen = M.mat("fabric", "#7f8b94"), mon = M.mat("screen", "#16181b");
    var z = 73 * cmT, dd = 80 * cmT, x0 = -W / 2 + 5 * cmT, x1 = W / 2 - 5 * cmT;
    [-1, 1].forEach(function (s) {
      var yIn = s * 2 * cmT, yOut = s * (2 * cmT + dd), y0 = Math.min(yIn, yOut), y1 = Math.max(yIn, yOut);
      M.box(x0, x1, y0, y1, z - 2.5 * cmT, z, top, 0.8 * cmT);
      [x0 + 3 * cmT, 0, x1 - 3 * cmT].forEach(function (x) { M.box(x - 2.5 * cmT, x + 2.5 * cmT, y0 + 6 * cmT, y1 - 6 * cmT, 0, z - 2.5 * cmT, leg); });
      M.box(x0 + 3 * cmT, x1 - 3 * cmT, y0 + 6 * cmT, y1 - 6 * cmT, 2 * cmT, 5 * cmT, leg);
      [-0.25, 0.25].forEach(function (u) {
        var x = u * (x1 - x0), my = s * 14 * cmT;
        M.box(x - 27 * cmT, x + 27 * cmT, my - 1.2 * cmT, my + 1.2 * cmT, z + 12 * cmT, z + 44 * cmT, mon, 0.6 * cmT);
        M.box(x - 3 * cmT, x + 3 * cmT, my - s * 1 * cmT - 2 * cmT, my - s * 1 * cmT + 2 * cmT, z, z + 14 * cmT, leg);
        M.box(x - 12 * cmT, x + 12 * cmT, my - 9 * cmT, my + 9 * cmT, z, z + 1 * cmT, leg);
        M.box(x - 20 * cmT, x + 20 * cmT, s * 42 * cmT - 7 * cmT, s * 42 * cmT + 7 * cmT, z, z + 1.6 * cmT, M.mat("plastic", "#2a2c2f"));    // a keyboard
        tkChair(M, x, s * (2 * cmT + dd + 26 * cmT), s > 0 ? 180 : 0, "#3e4a57", "#2a2d31");
      });
    });
    M.box(x0, x1, -2 * cmT, 2 * cmT, z, z + 48 * cmT, screen, 1 * cmT);
  });
  // a booth to take a call in: felt walls, a glass door, a shelf to lean on, a stool, a light
  itAdd("ic_tower", "i_phonebooth", 110, 110, ["o " + itR(0, 0, 110, 110, 4), "t M8 102 H102", "k " + itR(10, 10, 90, 22, 2)], { h: 2.25 }, function (M, W, D, H, C) {
    C = mPick(C, "#56606b", "#2a2d31");
    var felt = M.mat("fabric", C.main), frame = M.mat("metal", C.frame), glass = M.mat("glass", "#d7e6ee"), t = 4 * cmT;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 4 * cmT, frame);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + t, 4 * cmT, H - 6 * cmT, felt);
    M.box(-W / 2, -W / 2 + t, -D / 2, D / 2, 4 * cmT, H - 6 * cmT, felt);
    M.box(W / 2 - t, W / 2, -D / 2, D / 2, 4 * cmT, H - 6 * cmT, felt);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 6 * cmT, H, frame, 1 * cmT);
    M.box(-W / 2 + t, W / 2 - t, D / 2 - 1.2 * cmT, D / 2, 6 * cmT, H - 8 * cmT, glass);
    M.box(W / 2 - t - 3 * cmT, W / 2 - t - 1.5 * cmT, D / 2 + 0.2 * cmT, D / 2 + 3 * cmT, 90 * cmT, 130 * cmT, frame);       // the handle
    M.box(-W / 2 + t, W / 2 - t, -D / 2 + t, -D / 2 + t + 32 * cmT, 100 * cmT, 104 * cmT, M.mat("wood", "#b48a5e"), 1 * cmT);
    M.cyl(0, 6 * cmT, 4 * cmT, 64 * cmT, 2.5 * cmT, frame, { seg: 10 });
    M.cyl(0, 6 * cmT, 64 * cmT, 70 * cmT, 17 * cmT, M.mat("fabric", "#2f3a45"), { seg: 16 });
    M.box(-20 * cmT, 20 * cmT, -6 * cmT, 6 * cmT, H - 7 * cmT, H - 6.2 * cmT, M.mat("glow", "#fff4dc"));
  });

  // ---- the floors of plant -------------------------------------------------------------------------
  // an air handler: its casing in sections, the doors to each, the fan's section, the duct up out of it
  itAdd("ic_tower", "i_ahu", 420, 180, ["o " + itR(0, 0, 420, 180, 3), "t M90 0 V180 M200 0 V180 M310 0 V180", "k " + itR(320, 40, 80, 100, 4)], { h: 2.3 }, function (M, W, D, H, C) {
    C = mPick(C, "#c4c8c9", "#6a7075");
    var case_ = M.mat("metal", C.main), seam = M.mat("metal", C.frame), duct = M.mat("metal", "#b9bec0");
    var body = H * 0.82;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 12 * cmT, seam);                                                       // the plinth
    M.box(-W / 2 + 2 * cmT, W / 2 - 2 * cmT, -D / 2 + 2 * cmT, D / 2 - 2 * cmT, 12 * cmT, body, case_, 2 * cmT);
    [-0.29, -0.03, 0.24].forEach(function (u) { M.box(u * W - 1 * cmT, u * W + 1 * cmT, -D / 2 + 1 * cmT, D / 2 - 1 * cmT, 12 * cmT, body + 0.5 * cmT, seam); });
    // a door to each section, its handles
    [-0.4, -0.16, 0.1, 0.36].forEach(function (u) {
      M.box(u * W - 30 * cmT, u * W + 30 * cmT, D / 2 - 2 * cmT, D / 2 - 1 * cmT, 25 * cmT, body - 15 * cmT, seam);
      M.box(u * W + 22 * cmT, u * W + 26 * cmT, D / 2 - 1 * cmT, D / 2 + 3 * cmT, body * 0.5 - 8 * cmT, body * 0.5 + 8 * cmT, M.mat("chrome", "#d0d4d6"));
    });
    // the duct up out of its top to the ceiling, a flexible joint
    M.box(-W * 0.38 - 35 * cmT, -W * 0.38 + 35 * cmT, -40 * cmT, 40 * cmT, body, H - 10 * cmT, duct);
    M.box(-W * 0.38 - 38 * cmT, -W * 0.38 + 38 * cmT, -43 * cmT, 43 * cmT, H - 10 * cmT, H, M.mat("fabric", "#4a4f54"));
    M.box(W * 0.32 - 35 * cmT, W * 0.32 + 35 * cmT, -40 * cmT, 40 * cmT, body, H, duct);
    // the fan's guard and the control panel on its end
    M.push().move(0, D / 2 - 1 * cmT, body * 0.55).tiltX(-90);
    M.cyl(0, 0, 0, 1.6 * cmT, 35 * cmT, seam, { seg: 18 });
    M.pop();
    M.box(W / 2 - 1 * cmT, W / 2 + 14 * cmT, -25 * cmT, 25 * cmT, 80 * cmT, 150 * cmT, M.mat("plastic", "#d9dcdf"), 1 * cmT);
    M.box(W / 2 + 14 * cmT, W / 2 + 14.4 * cmT, -14 * cmT, 14 * cmT, 120 * cmT, 140 * cmT, M.mat("screen", "#1b2a33"));
  });
  // a chiller: the two shells side by side on its frame, the compressor over them, the pipes, its panel
  itAdd("ic_tower", "i_chiller", 420, 180, ["o " + itR(0, 0, 420, 180, 3), "t M20 50 H400 M20 130 H400", "k " + itR(150, 70, 120, 40, 6)], { h: 2.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#2f6f8f", "#3a3d40");
    var shell = M.mat("lacquer", C.main), frame = M.mat("metal", C.frame), pipe = M.mat("metal", "#9aa0a6");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 14 * cmT, frame);
    [-D * 0.24, D * 0.24].forEach(function (y, i) {
      M.push().move(0, y, 14 * cmT + (i ? 32 : 36) * cmT).tiltY(90);
      M.cyl(0, 0, -W / 2 + 15 * cmT, W / 2 - 15 * cmT, (i ? 32 : 36) * cmT, shell, { seg: 18, bottom: true });
      M.pop();
    });
    M.box(-80 * cmT, 80 * cmT, -40 * cmT, 40 * cmT, 85 * cmT, H - 20 * cmT, M.mat("metal", "#5a6066"), 6 * cmT);           // the compressor
    M.box(-60 * cmT, 60 * cmT, -30 * cmT, 30 * cmT, H - 20 * cmT, H, M.mat("metal", "#4a4f54"), 4 * cmT);
    [-1, 1].forEach(function (s) {
      M.tube([W / 2 - 25 * cmT, s * D * 0.24, 50 * cmT], [W / 2 - 25 * cmT, s * D * 0.24, H + 40 * cmT], 9 * cmT, pipe, 12);
    });
    M.box(-W / 2 - 2 * cmT, -W / 2 + 14 * cmT, -40 * cmT, 40 * cmT, 30 * cmT, 170 * cmT, M.mat("plastic", "#d9dcdf"), 1 * cmT);
    M.box(-W / 2 - 2.4 * cmT, -W / 2 - 2 * cmT, -18 * cmT, 18 * cmT, 120 * cmT, 150 * cmT, M.mat("screen", "#1b2a33"));
  });
  // a water tank: its drum banded round, a ladder up its side, the hatch on its top, the pipes out of its foot
  itAdd("ic_tower", "i_watertank", 260, 260, ["o " + itC(130, 130, 128), "t " + itC(130, 130, 100), "k " + itC(130, 130, 18)], { h: 3.0 }, function (M, W, D, H, C) {
    C = mPick(C, "#8fa3ad", "#4a4f54");
    var drum = M.mat("metal", C.main), band = M.mat("metal", C.frame), R = Math.min(W, D) / 2 - 2 * cmT;
    M.cyl(0, 0, 0, 20 * cmT, R * 0.95, M.mat("concrete", "#a8a8a4"), { seg: 24 });
    M.lathe(0, 0, [[R, 20 * cmT], [R, H - 25 * cmT], [R * 0.86, H - 8 * cmT], [R * 0.12, H], [0.1, H]], drum, { seg: 28 });
    [0.3, 0.55, 0.8].forEach(function (u) { M.lathe(0, 0, [[R + 1 * cmT, 20 * cmT + u * (H - 45 * cmT)], [R + 1 * cmT, 26 * cmT + u * (H - 45 * cmT)]], band, { seg: 28 }); });
    M.cyl(0, 0, H - 6 * cmT, H + 4 * cmT, R * 0.18, band, { seg: 14 });
    [-1, 1].forEach(function (s) { M.tube([s * 22 * cmT, R + 6 * cmT, 0], [s * 22 * cmT, R + 6 * cmT, H - 15 * cmT], 2 * cmT, band, 6); });
    for (var z = 30 * cmT; z < H - 20 * cmT; z += 30 * cmT) { M.tube([-22 * cmT, R + 6 * cmT, z], [22 * cmT, R + 6 * cmT, z], 1.4 * cmT, band, 6); }
    M.push().move(-R * 0.4, R * 0.95, 30 * cmT).tiltX(-90);
    M.cyl(0, 0, 0, 40 * cmT, 7 * cmT, M.mat("metal", "#9aa0a6"), { seg: 12 });
    M.pop();
  });
  // a switchboard: a row of steel cabinets against the wall, their doors, meters and lamps lit
  itAdd("ic_tower", "i_switchgear", 300, 80, function (w, h) {
    var d = "";
    for (var x = 60; x < w - 1; x += 60) { d += "M" + itN(x) + " 0 V" + itN(h) + " "; }
    return ["o " + itR(0, 0, w, h, 2), "t " + (d.trim() || "M0 0")];
  }, { h: 2.2 }, function (M, W, D, H, C) {
    C = mPick(C, "#d3d6d3", "#3a3d40");
    var steel = M.mat("metal", C.main), base = M.mat("metal", C.frame), n = Math.max(1, Math.round(W / (60 * cmT)));
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 10 * cmT, base);
    for (var i = 0; i < n; i++) {
      var x0 = -W / 2 + i * W / n, x1 = x0 + W / n;
      M.box(x0 + 0.5 * cmT, x1 - 0.5 * cmT, -D / 2, D / 2, 10 * cmT, H, steel, 0.8 * cmT);
      M.box(x0 + 3 * cmT, x1 - 3 * cmT, D / 2, D / 2 + 0.8 * cmT, 16 * cmT, H - 8 * cmT, M.mat("metal", "#c6c9c6"));
      M.box(x1 - 9 * cmT, x1 - 6 * cmT, D / 2 + 0.8 * cmT, D / 2 + 3 * cmT, H * 0.45, H * 0.55, M.mat("chrome", "#d0d4d6"));
      M.box(x0 + 10 * cmT, x0 + 26 * cmT, D / 2 + 0.8 * cmT, D / 2 + 1.4 * cmT, H - 40 * cmT, H - 24 * cmT, M.mat("screen", "#e8efe6"));
      ["#5fd16f", "#f2c94c", "#e2563a"].forEach(function (c, k) {
        M.box(x0 + 32 * cmT + k * 6 * cmT, x0 + 35 * cmT + k * 6 * cmT, D / 2 + 0.8 * cmT, D / 2 + 1.6 * cmT, H - 34 * cmT, H - 31 * cmT, M.mat("glow", c));
      });
    }
  });

  // walked to and used, or walked round (38-walk.js): the gates are walked through
  if (typeof WALK_DO === "object") { Object.assign(WALK_DO, { i_benchdesk: 1200, i_phonebooth: 1200, i_ahu: 600, i_chiller: 600, i_watertank: 500, i_switchgear: 600 }); }
  if (typeof NO_LABEL === "object") { Object.assign(NO_LABEL, { i_speedgate: true, i_benchdesk: true }); }
  if (typeof ICON_SET_FACE === "object") { ICON_SET_FACE.ic_tower = "i_speedgate"; }
  // and what a tower's own rooms are fitted with (40-towers.js)
  if (typeof TOWER_ITEM === "object") {
    Object.assign(TOWER_ITEM, { desk: "i_frontdesk", gates: "i_speedgate", lockers: "i_lockers", ahu: "i_ahu", chiller: "i_chiller", tank: "i_watertank",
                                switchgear: "i_switchgear", directory: "i_directory", feature: "i_featurewall", planter: "i_bigplanter",
                                bench: "i_benchdesk", booth: "i_phonebooth" });
  }
