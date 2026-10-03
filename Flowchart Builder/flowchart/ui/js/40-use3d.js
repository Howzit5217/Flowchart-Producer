// ---------------------------------------------------------------------------
//  40-use3d.js -- what is done with things, walking round in 3D, seen being
//  done, where it is done: water from the spout of the tap itself, filling
//  the bath, falling from the shower's head; a plug in the socket and its
//  cord to what it powers; doors, drawers and lids standing open
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "update it so the actions you do like running
  // water or plugging something in actually visually do something and it is
  // visually in the proper spot from all angles")  The water was a glass
  // thread a centimetre across, from a guess at where a tap would be; a
  // plug, and anything opened, only said so.  Now each is there, in 3D, at
  // the very spot: the models say where their water comes out (M.water,
  // 38-models.js).
  var USE3D_WATER = { piece: true, color: "#dff2ff", edge: "#bfe3ff", pat: 9, bare: true, alpha: 0.88, late: true };
  var USE3D_POOL = { piece: true, color: "#cfe8f7", edge: "#a9d4ef", pat: 9, bare: true, alpha: 0.7, late: true };
  function use3dRing(x, y, r, sides) {
    var out = [];
    for (var k = 0; k < sides; k++) { var a = k / sides * Math.PI * 2; out.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    return out;
  }
  // Water running: false where the model did not say where (drawn the old way).
  function useWaterDraw(model, n, dx, dy, dz, t) {
    var W = typeof modelWaters === "object" ? modelWaters[n.id] : null;
    if (!W || !W.length) { return false; }
    var P = FLOOR_PX, since = V3.use && V3.use.since && V3.use.since[n.id] ? (performance.now() - V3.use.since[n.id]) / 1000 : 30;
    W.forEach(function (w) {
      var x = w.p[0] + dx, y = w.p[1] + dy, top = w.p[2] + dz, low = w.low + dz;
      if (w.kind === "spray") {
        // a shower's head: many fine streams, falling, wetting the tray under
        for (var s = 0; s < 18; s++) {
          var a = s * 2.399, rr = 1.2 + (s % 6) * 0.75, sx = x + Math.cos(a) * rr, sy = y + Math.sin(a) * rr;
          var span = top - low, seg = 5, gap = 9, off = ((t * 140 + s * 7.3) % (seg + gap));
          for (var z = top - off; z > low; z -= seg + gap) {
            var z1 = Math.min(top, z + seg), z0 = Math.max(low, z);
            if (z1 - z0 > 0.4) { v3Prism(model.faces, use3dRing(sx + Math.cos(a) * (top - z) * 0.03, sy + Math.sin(a) * (top - z) * 0.03, 0.22, 5), z0, z1, USE3D_WATER); }
          }
          void span;
        }
        v3Prism(model.faces, use3dRing(x, y, 9 + Math.sin(t * 6) * 0.6, 18), low + 0.1, low + 0.25, USE3D_POOL);
        return;
      }
      // a tap, or a bath's spout: the stream, its ripples going down it, and where it lands
      var r = w.kind === "tub" ? 0.75 : 0.5;
      v3Prism(model.faces, use3dRing(x, y, r, 8), low, top, USE3D_WATER);
      var h = Math.max(1, top - low);
      for (var k = 0; k < 3; k++) {
        var zk = top - ((t * 55 + k * h / 3) % h);
        v3Prism(model.faces, use3dRing(x, y, r * 1.45, 8), Math.max(low, zk - 0.35), Math.max(low, zk), USE3D_WATER);
      }
      var splash = (w.kind === "tub" ? 2.4 : 1.6) + Math.sin(t * 9) * 0.35;
      v3Prism(model.faces, use3dRing(x, y, splash, 14), low + 0.05, low + 0.2, USE3D_POOL);
      if (w.kind === "tub") {
        // the bath filling, up to two thirds of the way in a minute or so
        var fill = Math.min(1, since / 45), H = pieceHigh(n) * P, level = low + (H * 0.66 - (low - dz)) * fill, inset = 0.13 * P;
        if (fill > 0.02) {
          var corners = [[-n.w / 2 + inset, -n.h / 2 + inset], [n.w / 2 - inset, -n.h / 2 + inset], [n.w / 2 - inset, n.h / 2 - inset], [-n.w / 2 + inset, n.h / 2 - inset]]
            .map(function (c) { var q = v3Local(n, c[0], c[1]); return [q[0] + dx, q[1] + dy]; });
          v3Prism(model.faces, corners, low, level, USE3D_POOL);
        }
      }
    });
    return true;
  }

  // ---- plugged in ------------------------------------------------------------------------------------
  // What a socket powers: the nearest thing that takes a plug, in its room.
  var USE3D_PLUGS = { i_lamp: 1, i_tablelamp: 1, i_desklamp: 1, i_arclamp: 1, i_tv: 1, i_monitor: 1, i_pc: 1, i_computer: 1, i_laptop: 1,
                      i_console: 1, i_speaker: 1, i_recordplayer: 1, i_fan: 1, i_heater: 1, i_kettle: 1, i_coffeemaker: 1, i_toaster: 1,
                      i_microwave: 1, i_fridge: 1, i_freezer: 1, i_winecooler: 1, i_printer: 1, i_router: 1, i_aquarium: 1, i_projector: 1,
                      i_treadmill: 1, i_washer: 1, i_dryer: 1, i_dishwasher: 1, i_tablet: 1, i_phone: 1, i_soundbar: 1 };
  function usePlugFor(outlet) {
    var room = useRoomOf(outlet), best = null, far = 2.6 * FLOOR_PX;
    hand.nodes.forEach(function (m) {
      if (!USE3D_PLUGS[m.kind] || (room && useRoomOf(m) !== room)) { return; }
      var d = Math.hypot(m.x - outlet.x, m.y - outlet.y);
      if (d < far) { far = d; best = m; }
    });
    return best;
  }
  function usePlug(outlet) {
    var U = useState();
    U.plug = U.plug || {};
    var on = !U.on[outlet.id];
    U.on[outlet.id] = on;
    var dev = usePlugFor(outlet);
    if (on) {
      U.plug[outlet.id] = dev ? dev.id : null;
      if (dev && (USE_SCREEN[dev.kind] || USE_FAN[dev.kind])) { U.on[dev.id] = true; }
      v3Say(dev ? say("us_plugged", { what: useName(dev) }) : TXT.us_plugged_none);
    } else {
      var was = U.plug[outlet.id] ? nodeById(U.plug[outlet.id]) : null;
      if (was && (USE_SCREEN[was.kind] || USE_FAN[was.kind])) { U.on[was.id] = false; }
      delete U.plug[outlet.id];
      v3Say(was ? say("us_unplugged", { what: useName(was) }) : TXT.us_unplugged_none);
    }
    V3.dirty = true;
  }
  // the plug in the socket, its cord down the wall and across the floor to what it powers
  function usePlugDraw(model, outlet, dev, dx, dy, dz) {
    var P = FLOOR_PX, a = (outlet.turn || 0) * Math.PI / 180, fx = -Math.sin(a), fy = Math.cos(a);
    var hang = wallHang(outlet), zc = (hang[0] + hang[1]) / 2 * P + dz;
    var px = outlet.x + dx + fx * 1.4, py = outlet.y + dy + fy * 1.4;
    var plug = { piece: true, color: "#f1f0ec", edge: "#9a9890", bare: true }, cord = { piece: true, color: "#e9e8e4", edge: "#b3b1aa", bare: true };
    var base = [[-1.1, -0.4], [1.1, -0.4], [1.1, 1.8], [-1.1, 1.8]].map(function (c) {
      return [outlet.x + dx + Math.cos(a) * c[0] - Math.sin(a) * c[1] + fx * 0.4, outlet.y + dy + Math.sin(a) * c[0] + Math.cos(a) * c[1] + fy * 0.4];
    });
    v3Prism(model.faces, base, zc - 1.6, zc + 1.6, plug);
    // down the wall from the plug's foot
    v3Prism(model.faces, use3dRing(px + fx * 0.6, py + fy * 0.6, 0.25, 6), dz + 0.25, zc - 1.6, cord);
    if (!dev) { return; }
    // across the floor, a little slack in it
    var tx = dev.x + dx, ty = dev.y + dy, sx = px + fx * 0.6, sy = py + fy * 0.6, len = Math.hypot(tx - sx, ty - sy);
    var steps = Math.max(2, Math.ceil(len / 12)), last = [sx, sy];
    for (var i = 1; i <= steps; i++) {
      var k = i / steps, sag = Math.sin(k * Math.PI) * Math.min(6, len * 0.08);
      var nx = -(ty - sy) / (len || 1), ny = (tx - sx) / (len || 1);
      var p = [sx + (tx - sx) * k + nx * sag, sy + (ty - sy) * k + ny * sag];
      var ex = p[0] - last[0], ey = p[1] - last[1], el2 = Math.hypot(ex, ey) || 1, wx = -ey / el2 * 0.25, wy = ex / el2 * 0.25;
      v3Prism(model.faces, [[last[0] + wx, last[1] + wy], [p[0] + wx, p[1] + wy], [p[0] - wx, p[1] - wy], [last[0] - wx, last[1] - wy]], dz + 0.05, dz + 0.5, cord);
      last = p;
    }
  }

  // ---- standing open ------------------------------------------------------------------------------
  var USE3D_SWING = { i_fridge: "#d8dce0", i_freezer: "#d8dce0", i_winecooler: "#2b2d31", i_reachin: "#d8dce0", i_cooler: "#d8dce0",
                      i_wardrobe: "#b88a5a", i_hutch: "#b88a5a", i_linencab: "#e9e5dc", i_cabinet: "#b88a5a", i_medicine: "#eceae6",
                      i_pantry: "#e9e5dc", i_sideboard: "#9a7048", i_mailbox: "#2b2b2b", i_microwave: "#2b2d31", i_washer: "#f2f2ef", i_dryer: "#f2f2ef" };
  var USE3D_DRAWER = { i_dresser: 1, i_nightstand: 1, i_chest: 1, i_filing: 1, i_toolchest: 1, i_counter: 1 };
  var USE3D_COLD = { i_fridge: 1, i_freezer: 1, i_winecooler: 1, i_reachin: 1, i_cooler: 1 };
  function useOpenDraw(model, n, dx, dy, dz) {
    var P = FLOOR_PX, H = pieceHigh(n) * P, C = typeof modelColors === "function" ? modelColors(n) : {}, edge = "#4a4d52";
    var hw = n.w / 2, hh = n.h / 2;
    function box(x0, x1, y0, y1, z0, z1, how) {
      var pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (c) { var q = v3Local(n, c[0], c[1]); return [q[0] + dx, q[1] + dy]; });
      v3Prism(model.faces, pts, dz + z0, dz + z1, how);
    }
    var z0 = n.kind === "i_medicine" || n.kind === "i_microwave" || n.kind === "i_mailbox" ? (typeof wallHang === "function" && V3_WALL[n.kind] ? wallHang(n)[0] * P : 0) : 0;
    if (ON_TOP[n.kind] && typeof v3Ground === "function") { z0 = 0; }
    if (USE3D_SWING[n.kind]) {
      var col = C.main || USE3D_SWING[n.kind], cold = !!USE3D_COLD[n.kind];
      var leafHow = { piece: true, color: col, edge: edge, pat: /^#(d|e|f)/i.test(col) ? 22 : 21 };
      var inside = cold ? { piece: true, color: "#f4f8fb", edge: "#c7d3dc", pat: 31 } : { piece: true, color: "#3a3631", edge: "#2a2724" };
      var top = z0 + H - 1.5, foot = z0 + (cold || n.kind === "i_wardrobe" ? 1.5 : 2);
      // the inside, where the door was (as far out as the closed door's handles came: over them)
      box(-hw + 1.4, hw - 1.4, hh - 0.6, hh + 2.2, foot, top, inside);
      // its shelves, and on them, in a fridge, what is kept cold
      var shelves = Math.max(1, Math.round((top - foot) / (0.38 * P)));
      for (var s = 1; s < shelves; s++) {
        var zs = foot + (top - foot) * s / shelves;
        box(-hw + 1.4, hw - 1.4, hh - 0.6, hh + 2.4, zs - 0.25, zs + 0.25, { piece: true, color: cold ? "#e3edf3" : "#6b5a48", edge: edge });
        if (cold) {
          for (var b = 0; b < 3; b++) {
            var bx = -hw + 3 + b * (n.w - 6) / 3 + 1.5;
            box(bx - 1, bx + 1, hh + 1.2, hh + 2.35, zs + 0.25, zs + 2.4 + (b % 2) * 1.4,
                { piece: true, color: ["#c4382e", "#e8c547", "#5fa35a"][(s + b) % 3], edge: edge });
          }
        }
      }
      // the door, swung out on its hinges at one side
      var hinge = v3Local(n, -hw, hh + 2.2), LN = { x: hinge[0] + dx, y: hinge[1] + dy, turn: (n.turn || 0) + 100 };
      var lw = n.w, pts = [[0, 0], [lw, 0], [lw, 1.4], [0, 1.4]].map(function (c) { return v3Local(LN, c[0], c[1]); });
      v3Prism(model.faces, pts, dz + z0 + 0.6, dz + z0 + H - 0.4, leafHow);
      var hd = [[lw - 4, 1.4], [lw - 3, 1.4], [lw - 3, 2.6], [lw - 4, 2.6]].map(function (c) { return v3Local(LN, c[0], c[1]); });
      v3Prism(model.faces, hd, dz + z0 + H * 0.45, dz + z0 + H * 0.7, { piece: true, color: "#c9ced3", edge: edge, pat: 23 });
      return;
    }
    if (USE3D_DRAWER[n.kind]) {
      // the top drawer, pulled out most of the way
      var zt = n.kind === "i_counter" ? H - 0.13 * P : H * 0.72, zb = n.kind === "i_counter" ? H - 0.04 * P : H * 0.93;
      var out = Math.min(n.h * 0.6, 0.42 * P), wood = { piece: true, color: C.main || "#b88a5a", edge: edge, pat: 21 };
      box(-hw + 1.2, hw - 1.2, hh, hh + out, z0 + zt, z0 + zb - 1.4, { piece: true, color: "#3a3631", edge: edge });      // its inside
      box(-hw + 1.2, -hw + 1.9, hh, hh + out, z0 + zt, z0 + zb, wood);
      box(hw - 1.9, hw - 1.2, hh, hh + out, z0 + zt, z0 + zb, wood);
      box(-hw + 1, hw - 1, hh + out, hh + out + 1.1, z0 + zt - 0.4, z0 + zb, wood);                           // its front
      box(-3, 3, hh + out + 1.1, hh + out + 1.9, z0 + (zt + zb) / 2 - 0.4, z0 + (zt + zb) / 2 + 0.4, { piece: true, color: "#c9a14a", edge: edge, pat: 35 });
      return;
    }
    if (n.kind === "i_dishwasher") {
      // its door let down flat, the racks inside
      box(-hw + 1.2, hw - 1.2, hh - 0.6, hh + 0.12, z0 + 4, z0 + H - 3, { piece: true, color: "#2f3236", edge: edge });
      box(-hw + 1, hw - 1, hh, hh + H * 0.72, z0 + 4, z0 + 5.2, { piece: true, color: C.main || "#c9cdd1", edge: edge, pat: 22 });
      [0.35, 0.68].forEach(function (k) { box(-hw + 2, hw - 2, hh - 0.4, hh + n.h * 0.45, z0 + H * k, z0 + H * k + 0.4, { piece: true, color: "#9aa0a6", edge: edge, pat: 23 }); });
      return;
    }
    if (n.kind === "i_toybox") {
      // its lid up, leaning back
      box(-hw + 1.5, hw - 1.5, -hh + 1.5, hh - 1.5, z0 + H - 0.3, z0 + H + 0.05, { piece: true, color: "#3a3631", edge: edge });
      box(-hw, hw, -hh - 1.4, -hh, z0 + H, z0 + H + n.h * 0.95, { piece: true, color: C.main || "#c4382e", edge: edge });
    }
  }

  // Drawn with the rest that is in use, each picture (39-inside.js).
  if (typeof useScene === "function") {
    var useSceneMore = useScene;
    useScene = function (model) {
      useSceneMore.apply(this, arguments);
      if (!V3 || !V3.use || V3.mode !== "walk") { return; }
      var U = V3.use, floors = typeof floorsOf === "function" ? floorsOf() : [];
      hand.nodes.forEach(function (n) {
        if (!U.on[n.id]) { return; }
        var isPlug = n.kind === "i_outlet", isOpen = USE_OPEN[n.kind] && (USE3D_SWING[n.kind] || USE3D_DRAWER[n.kind] || n.kind === "i_dishwasher" || n.kind === "i_toybox");
        if (!isPlug && !isOpen) { return; }
        var f = floors.length ? floorAt(floors, n.x, n.y) : null, dx = f ? f.dx : 0, dy = f ? f.dy : 0, dz = f ? f.z : 0;
        try {
          if (isPlug) { usePlugDraw(model, n, U.plug && U.plug[n.id] ? nodeById(U.plug[n.id]) : null, dx, dy, dz); }
          else { useOpenDraw(model, n, dx, dy, dz); }
        } catch (e) { /* as it stood */ }
      });
    };
  }
