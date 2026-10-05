// ---------------------------------------------------------------------------
//  40-debugworld.js -- a world for trying things in: a dark floor ruled in
//  glowing squares to the horizon, pylons of light and crystal shards and
//  floating cubes where trees would be, ridges drawn in grid lines and
//  towers banded in light round about, under a deep sky with a neon dusk
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "when moving around any world to make it so there
  // is also a debug world theme too that is like this futuristic fake scenery
  // that is future like for testing things")
  //
  // One more land in the view's Settings (WORLD_SCAPES, 39-world.js): its
  // ground, its garden, what stands about and its skyline the shader's own
  // new patterns -- 93 a grid (a line a metre, a brighter one every ten:
  // sizes read off it at a glance), 94 bands of light (a storey's floors, a
  // tower's ribs).  The house and its lot as they are: the world round them
  // made up, plain to see as not real.
  var DZ_GRID = 93, DZ_BANDS = 94, DZ_GLOW = 31;
  var DZ_CYAN = [0.2, 0.9, 1.0], DZ_PINK = [1.0, 0.3, 0.85], DZ_DARK = [0.09, 0.1, 0.15];
  if (typeof WORLD_SCAPES === "object" && WORLD_SCAPES.indexOf("debug") < 0) { WORLD_SCAPES.push("debug"); }
  if (typeof WORLD_LOOK === "object") {
    WORLD_LOOK.debug = { ground: [0.06, 0.075, 0.12], pat: DZ_GRID, lawn: [[0.08, 0.1, 0.16], DZ_GRID],
                         grow: { pylon: 3, crystal: 2, cube: 2 }, dense: 0.6, sky: "grid", debug: true };
  }
  function dzOn() { return typeof worldScape === "function" && worldScape() === "debug"; }

  // ---- what stands about: a pylon of light, a cluster of crystal, a floating cube -------------------------
  var DZ_PROPS = {
    // a dark mast, rings of light up it, a glowing ball on top
    pylon: function (v, at, rnd) {
      var P = FLOOR_PX, tall = (3 + rnd() * 4) * P, col = rnd() < 0.5 ? DZ_CYAN : DZ_PINK;
      worldTube(v, [at[0], at[1], 0], [at[0], at[1], tall], 0.14 * P, 0.07 * P, 8, DZ_DARK, PAT.plain);
      for (var z = 0.8 * P; z < tall - 0.4 * P; z += (0.9 + rnd() * 0.5) * P) { gl3Prism(v, at, 0.2 * P, 0.2 * P, z, z + 0.06 * P, 10, col, DZ_GLOW); }
      worldBall(v, [at[0], at[1], tall + 0.2 * P], 0.28 * P, 1, col, DZ_GLOW);
    },
    // shards, leaning a little each way, from a common foot
    crystal: function (v, at, rnd) {
      var P = FLOOR_PX, n = 3 + Math.floor(rnd() * 3);
      for (var i = 0; i < n; i++) {
        var a = rnd() * Math.PI * 2, off = rnd() * 0.5 * P, foot = [at[0] + Math.cos(a) * off, at[1] + Math.sin(a) * off];
        var tall = (0.8 + rnd() * 2.2) * P, r = (0.12 + rnd() * 0.16) * P;
        gl3Prism(v, foot, r, r * 0.15, 0, tall, 5, i % 2 ? DZ_PINK : DZ_CYAN, i === 0 ? DZ_GLOW : DZ_BANDS);
      }
    },
    // a cube hanging in the air, its faces ruled like the floor, a pillar of light under it
    cube: function (v, at, rnd) {
      var P = FLOOR_PX, s = (0.5 + rnd() * 0.6) * P, z = (1.4 + rnd() * 1.8) * P, a = rnd() * Math.PI;
      var e = [Math.cos(a), Math.sin(a)], d = [-Math.sin(a), Math.cos(a)];
      worldBox(v, at, e, d, s, s, z, z + 2 * s, DZ_DARK, DZ_GRID);
      gl3Prism(v, at, 0.04 * P, 0.04 * P, 0, z, 6, DZ_CYAN, DZ_GLOW);
    }
  };
  if (typeof worldPlant === "function") {
    var worldPlantDz = worldPlant;
    worldPlant = function (v, kind, at, rnd, sheetC) {
      var draw = DZ_PROPS[kind];
      if (draw) { draw(v, at, rnd); return; }
      return worldPlantDz.apply(this, arguments);
    };
  }

  // ---- the skyline: ridges drawn in grid lines, towers banded in light --------------------------------------
  if (typeof worldHorizon === "function") {
    var worldHorizonDz = worldHorizon;
    worldHorizon = function (v, L) {
      var look = worldLook();
      if (!look || look.sky !== "grid") { return worldHorizonDz.apply(this, arguments); }
      var F = GL3_FAR, rnd = gl3Rand(Math.round(L.mid[0] * 3 + L.mid[1] * 11) + 93), P = FLOOR_PX;
      var jag = worldSmooth(160, rnd, 1);
      worldRing(v, L, F * 0.32, F * 0.5, 160, function (th, h) {
        var k = h % 160;
        return 600 + 3800 * Math.pow(jag[k], 1.6) * (0.6 + 0.4 * Math.abs(Math.sin(th * 3 + 0.5)));
      }, DZ_DARK, DZ_GRID, null);
      for (var t = 0; t < 46; t++) {
        var th = rnd() * Math.PI * 2, far = F * (0.24 + rnd() * 0.08), at = [L.mid[0] + Math.cos(th) * far, L.mid[1] + Math.sin(th) * far];
        var wide = (10 + rnd() * 18) * P, high = (30 + Math.pow(rnd(), 1.8) * 160) * P;
        var e = [-Math.sin(th), Math.cos(th)], d = [Math.cos(th), Math.sin(th)];
        worldBox(v, at, e, d, wide / 2, wide * (0.35 + rnd() * 0.3), -3, high, DZ_DARK, DZ_BANDS);
        worldBall(v, [at[0], at[1], high + 2 * P], 1.2 * P, 1, t % 3 ? DZ_CYAN : DZ_PINK, DZ_GLOW);
      }
      return true;
    };
  }

  // ---- the sky: deep blue overhead, a neon dusk round the horizon --------------------------------------------
  if (typeof gl3SkyNow === "function") {
    var gl3SkyNowDz = gl3SkyNow;
    gl3SkyNow = function () {
      var out = gl3SkyNowDz.apply(this, arguments);
      if (!out || !dzOn()) { return out; }
      var night = out.night || 0;
      return Object.assign({}, out, {
        zenith: gl3Mix([0.02, 0.03, 0.09], [0.0, 0.0, 0.02], night), horizon: gl3Mix([0.36, 0.1, 0.42], [0.18, 0.04, 0.24], night),
        below: [0.03, 0.03, 0.07], glow: [0.5, 0.92, 1.0], cloud: [0.12, 0.08, 0.2],
        skyAmb: gl3Mix([0.26, 0.28, 0.42], [0.12, 0.13, 0.22], night), groundAmb: [0.1, 0.08, 0.16],
        sunCol: gl3Mix(out.sunCol, [0.78, 0.86, 1.0], 0.55)
      });
    };
  }

  // ---- the shader: the grid, the bands of light ---------------------------------------------------------------
  if (typeof GL3_FS === "string") {
    var DZ_FS = [
      "  } else if (k > 92.5 && k < 93.5) {",              // the debug world's grid: a line a metre, a brighter one every ten
      "    vec2 dg1 = m, dg10 = m / 10.0;",
      "    vec2 dd1 = min(fract(dg1), 1.0 - fract(dg1)), dd10 = min(fract(dg10), 1.0 - fract(dg10));",
      "    float dl1 = 1.0 - smoothstep(0.0, 0.04, min(dd1.x, dd1.y)), dl10 = 1.0 - smoothstep(0.0, 0.008, min(dd10.x, dd10.y));",
      "    emit += vec3(0.1, 0.8, 1.0) * dl1 * 0.45 * aa(1.0) + vec3(1.0, 0.3, 0.9) * dl10 * 0.85 * aa(0.1);",
      "  } else if (k > 93.5 && k < 94.5) {",              // bands of light: a storey's floors, its ribs
      "    float dz1 = fract(h / 3.2), dz2 = fract(along / 2.4);",
      "    float dfl = 1.0 - smoothstep(0.0, 0.07, min(dz1, 1.0 - dz1)), drb = 1.0 - smoothstep(0.0, 0.05, min(dz2, 1.0 - dz2));",
      "    emit += vec3(0.2, 0.85, 1.0) * dfl * 0.7 * aa(0.31) + vec3(0.95, 0.3, 1.0) * drb * 0.3 * aa(0.42);"].join("\n");
    var dzAnchor = "  } else if (k > 9.5 && k < 10.5) {", dzTx = "(k > 73.5 && k < 82.5)";
    if (GL3_FS.split(dzAnchor).length === 2 && GL3_FS.split(dzTx).length === 2) {
      GL3_FS = GL3_FS.replace(dzAnchor, DZ_FS + "\n" + dzAnchor).replace(dzTx, dzTx + " || (k > 92.5 && k < 94.5)");
    }
  }

  // ---- its tile in Settings -------------------------------------------------------------------------------
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.ws_debug = '<path d="M2.6 15.4h14.8M2.6 11.8h14.8M5 8.6h10M6.8 5.8h6.4M3.6 17.4 7.6 4.2M16.4 17.4 12.4 4.2M10 17.4V4.2"/><path d="M15.4 2.4v2.4M14.2 3.6h2.4"/>';
  }
