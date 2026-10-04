// ---------------------------------------------------------------------------
//  40-stormfx.js -- the storm let loose on the building in 3D: the wind as
//  it blows (gusting in from one side, or a tornado's funnel crossing the
//  lot) and what it does -- windows broken, the roof peeled off a piece at
//  a time, walls blown down, the house pushed off its foundation or, not
//  held down, carried away whole; what stands in the yard thrown about --
//  each piece weighed, pushed by the wind as hard as that wind pushes, and
//  falling where it falls
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "update the physics too for the tornados and
  // tall winds so things can break and fly away in them too" -- and "by the
  // tornados at the strongest winds the whole house should fly away if it
  // is not built right too")
  //
  // What gives way gives way at the speed the storm test (40-storm.js) says
  // it does: each check there is what the wind does against what holds, and
  // both go as the speed squared, so a part that holds half what it must
  // lets go at 0.71 of the storm's speed.  Here the wind blows as it would,
  // gusting, or turning round the funnel as it passes; each part is let go
  // when the wind where it stands gets to that speed -- the roof a piece at
  // a time from its edges in, the walls a length at a time -- and from then
  // on is a body of its own: as heavy as it is, pushed and lifted by the
  // wind going past it, turned over and over, and stopped by the ground.
  // A house not anchored down goes as one: pushed off its slab, and in a
  // strong enough tornado lifted and carried, coming apart where it lands.
  var FX_RHO = 1.2, FX_G = 9.81, FX_DT = 1 / 240;
  var FX_CELL_U = 2.4, FX_CELL_V = 1.6;        // m: a roof torn off in pieces this size
  var FX_SEG = 3.6;                            // m: a wall blown down in lengths about this long
  var FX_FAR = 260;                            // m from the house: gone
  var FX_BUDGET = 160000;                      // a model's points moving at once (38-models.js), at most
  var FX_K = 2500;                             // how hard the ground pushes back, a kilogram a metre in
  var FX_GONE = { gone: true };
  // what stays where it is: laid on the ground, built in
  var FX_FIXED = { i_lot: 1, i_pool: 1, i_hottub: 1, i_parking: 1, i_court: 1, i_driveway: 1, i_path: 1, i_deck: 1, i_patio: 1,
                   i_firepit: 1, i_garden: 1, i_lawn: 1, i_pond: 1, i_flowerbed: 1, i_floor: 1, i_zone: 1, i_room: 1, i_fireplace: 1,
                   i_well: 1, i_stairs: 1, i_spiral: 1, i_elevator: 1, i_dock: 1, i_boat: 1 };
  // (2026-10-03, asked: "if the winds are so strong the whole house and the
  // trees could be ripped out of the ground and there could be nothing
  // left")  Trees snapped or torn out by the roots at these speeds (m/s:
  // the least, and how much more some stand), and how heavy they are; the
  // strongest winds -- an EF4 or EF5, a category 5 -- tear out what is
  // built in too, and leave the slab bare.
  var FX_TREES = { i_tree: [44, 22, 900], i_palm: [52, 24, 450], i_shrub: [60, 20, 60], i_hedge: [64, 20, 140] };
  var FX_STRONGEST = 74;
  var FX_BUILTIN = { i_counter: 1, i_kitchensink: 1, i_sink: 1, i_toilet: 1, i_shower: 1, i_bath: 1, i_bathtub: 1, i_tub: 1,
                     i_fireplace: 1, i_stairs: 1, i_spiral: 1, i_elevator: 1, i_island: 1, i_vanity: 1, i_waterheater: 1,
                     i_furnace: 1, i_stove: 1, i_dishwasher: 1, i_wardrobe: 1, i_closet: 1 };
  var FX_SMALL = { i_outlet: 1, i_lightswitch: 1, i_smoke: 1, i_vent: 1, i_exhaustfan: 1, i_thermostat: 1, i_picture: 1,
                   i_mirror: 1, i_wallclock: 1, i_sconce: 1, i_porchlight: 1, i_doorbell: 1 };
  // kilograms, where size alone says too little; what holds it down (N); how it meets the wind
  var FX_MASS = { i_bins: 18, i_grill: 45, i_trampoline: 55, i_shed: 450, i_parked: 1450, i_car: 1450, i_mailbox: 12,
                  i_condenser: 75, i_dumpster: 700, i_pavilion: 900, i_swing: 120, i_playset: 250, i_bench: 35,
                  i_sofa: 70, i_bookcase: 110, i_piano: 250, i_fridge: 100, i_washer: 70, i_dryer: 50, i_dresser: 70,
                  i_bedking: 120, i_bed: 90, i_desk: 35, i_tv: 15, i_dining: 60, i_hutch: 90, i_armchair: 35, i_chest: 30,
                  i_coffee: 20, i_sidetable: 8, i_lamp: 5, i_plant: 6, i_ottoman: 10, i_beanbag: 6, i_barcart: 15, i_nightstand: 15 };
  var FX_HOLD = { i_shed: 4000, i_mailbox: 2500, i_condenser: 1500, i_pavilion: 9000, i_swing: 3000, i_playset: 3000,
                  i_fence: 2500, i_flagpole: 6000, i_hoop: 4000 };
  var FX_CD = { i_parked: 0.8, i_car: 0.8, i_trampoline: 0.5, i_tree: 0.6, i_palm: 0.6, i_shrub: 0.8, i_hedge: 0.8 };
  var FX_LIFT = { i_trampoline: 0.12, i_parked: 0.35, i_car: 0.35, i_pavilion: 0.6, i_shed: 0.4, i_tree: 0.08, i_palm: 0.08 };

  var FX = null;                               // the storm being let loose, while one is
  function fxOn() { return !!(FX && typeof V3 !== "undefined" && V3 && V3.storm && FX.storm === V3.storm && FX.box === V3.box); }
  function fxFunnelOn() { return fxOn() && FX.kind === "tornado" && !!FX.plan; }
  function fxHash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10007) / 10007; }
  function fxSig() { var n = hand.nodes, last = n.length ? n[n.length - 1] : null; return n.length + ":" + (last ? last.id + ":" + Math.round(last.x) + ":" + Math.round(last.y) : ""); }
  function fxKey() { return (V3 && V3.storm) + "|" + JSON.stringify(houseOpt("hold") || {}); }
  // (true north to the paper, 40-street.js)
  function fxPaper(x, y) { var t = typeof rdTurned === "function" ? rdTurned(x, y) : [x, y], l = Math.hypot(t[0], t[1]) || 1; return [t[0] / l, t[1] / l]; }

  // ---- begun, again, stopped --------------------------------------------------------------------
  function fxStart(again) {
    if (FX && (again || !V3 || !V3.storm || FX.box !== (V3 && V3.box))) { fxJolt(null); }
    if (typeof V3 === "undefined" || !V3 || !V3.box || !V3.storm || V3.scene === "space") { FX = null; return; }
    var key = fxKey();
    if (!again && FX && FX.key === key && FX.box === V3.box && FX.sig === fxSig()) { return; }
    var St = smStormOf(V3.storm), T = St ? smTry(V3.storm) : null;
    if (!St) { FX = null; return; }
    var B = T ? T.B : null, gives = {};
    (T ? T.list : []).forEach(function (c) { if (!c.ok) { gives[c.k] = true; } });
    var deep = !!B && B.frame !== "tall" && !(typeof v3Big === "function" && v3Big()), kind = St[2];
    FX = { key: key, sig: fxSig(), storm: V3.storm, St: St, V: St[1], kind: kind, box: V3.box, T: T,
           // (the wind with it: an earthquake none, snow a breath, rain over a flood, hail's squall)
           windV: kind === "quake" ? 0 : kind === "snow" ? 4 : kind === "flood" ? 8 : kind === "hail" ? 14 : St[1],
           // (what gives way goes as the square root of the storm's measure -- wind, water -- or as it is: shaking, snow)
           expo: kind === "quake" || kind === "snow" ? 1 : 0.5,
           // (the insides drawn from the first, where the roof or the walls may go -- or the furniture, in an earthquake, or a
           // flood: not built in the middle of it all)
           open: deep && !!(gives.roof || gives.walls || gives.anchors || kind === "quake" || (kind === "flood" && gives.contents)),
           t: 0, tt: 0, plan: null, items: new Map(), free: [], bits: [], dust: [], seen: {}, said: "", done: false,
           rnd: gl3Rand(Math.round(St[1] * 13) + 7), w: [0, 0, 0], shAcc: 0, lfAcc: 0, check: 0, cost: 0, span: null };
    V3.dirty = true;
    fxLoop(FX);
  }
  function fxLoop(F) {
    var last = 0;
    function tick(now) {
      if (FX !== F || typeof V3 === "undefined" || !V3 || V3.box !== F.box || !F.box.isConnected || V3.storm !== F.storm) { return; }
      if (F.plan && !F.done) {
        var dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60;
        try { fxStep(F, dt); } catch (e) { F.done = true; }
        V3.dirty = true;
        fxJolt(F);
      }
      last = now;
      if (now - (F.toldAt || 0) > 250) { F.toldAt = now; fxTell(F); }
      if (!F.done) { requestAnimationFrame(tick); } else { V3.dirty = true; fxTell(F); fxJolt(null); }
    }
    requestAnimationFrame(tick);
  }
  // An earthquake: the picture itself shaken, as the eye standing on the ground sees it
  // (the ground's own movement a few centimetres -- shown as the jolt it is felt as)
  function fxJolt(F) {
    var cv = typeof V3 !== "undefined" && V3 ? V3.canvas : null;
    if (!cv) { return; }
    if (!F || F.kind !== "quake" || F.done || (typeof STILL !== "undefined" && STILL)) { if (cv.style.transform) { cv.style.transform = ""; } return; }
    var q = fxShake(F, F.t, [0, 0]);
    cv.style.transform = "translate(" + (q[0] * 0.9).toFixed(1) + "px," + (q[1] * 0.6).toFixed(1) + "px)";
  }
  // Kept still (26-motion.js): what the storm leaves, at once.
  function fxAtOnce(F) {
    for (var i = 0; i < 2400 && !F.done; i++) { fxStep(F, 1 / 30); }
    F.done = true;
  }

  // ---- the wind -----------------------------------------------------------------------------------
  // Metres and seconds, on the paper's own way round.  A strong wind:
  // gusting up to the storm's speed and down by a fifth or so, swinging a
  // little either way.  A tornado: turning (anticlockwise, seen from above)
  // fastest at the edge of its core, slower further out; drawn in along the
  // ground, rising round its middle; and going on across the land.
  function fxRamp(F, t) {
    var end = F.kind === "tornado" ? Math.max(0, Math.min(1, 1 - (t - F.tEnd) / 4)) : Math.max(0, Math.min(1, 1 - (t - F.tEnd) / 5));
    return F.kind === "tornado" ? Math.min(1, 0.3 + t / 4) * end : Math.min(1, 0.35 + 0.65 * t / 6) * end;
  }
  function fxEye(F, t) {
    var s = (t - F.tMid) * F.Vt;
    return [F.H[0] - F.side[0] * F.miss + F.go[0] * s, F.H[1] - F.side[1] * F.miss + F.go[1] * s];
  }
  function fxWind(F, x, y, z, out) {
    var t = F.tt, hf = Math.pow(Math.max(z, 1.5) / 10, 0.14);
    if (F.kind !== "tornado") {
      var d = F.dir, ph = t - (x * d[0] + y * d[1]) / (0.8 * Math.max(4, F.windV));
      var g = 0.8 + 0.2 * (0.6 * Math.sin(ph * 0.698) + 0.3 * Math.sin(ph * 1.7 + 1.3) + 0.25 * Math.sin(ph * 1.19 + 2.1)) +
              0.32 * Math.exp(-Math.pow((ph - 9) / 1.3, 2)) + 0.32 * Math.exp(-Math.pow((ph - 21) / 1.3, 2));
      var U = F.windV * Math.max(0.5, Math.min(1, g)) * fxRamp(F, t) * hf, a = 0.2 * Math.sin(ph * 0.41 + 0.7), c = Math.cos(a), s = Math.sin(a);
      out[0] = U * (d[0] * c - d[1] * s); out[1] = U * (d[0] * s + d[1] * c); out[2] = 0;
      return out;
    }
    var o = fxEye(F, t), dx = x - o[0], dy = y - o[1], r = Math.sqrt(dx * dx + dy * dy) + 0.01, Rc = F.Rc, k = fxRamp(F, t);
    var vt = F.Vr * (r < Rc ? r / Rc : Rc / r) * k;
    // (round the other way on the paper: its y runs south; its going on felt
    // only near it -- the land round about is not moving with it)
    var inflow = 0.45 * vt * Math.max(0, 1 - z / 120), on = F.Vt * k * Math.exp(-Math.pow(r / (3 * Rc), 2));
    out[0] = (vt * dy / r - inflow * dx / r) * hf + on * F.go[0];
    out[1] = (-vt * dx / r - inflow * dy / r) * hf + on * F.go[1];
    out[2] = F.Wup * Math.exp(-Math.pow((r - 0.75 * Rc) / (0.8 * Rc), 2)) * Math.min(1, 0.5 + z / 12) * (z > 80 ? Math.exp(-(z - 80) / 60) : 1) * k;
    return out;
  }
  // the speed the storm test means: across the ground, at its 10 m
  function fxNom(F, x, y) { var w = fxWind(F, x, y, 10, F.w); return Math.sqrt(w[0] * w[0] + w[1] * w[1]); }

  // ---- the building, in pieces ------------------------------------------------------------------
  // Everything that can come away is an item: the house (held to its
  // slab by its anchors), each length of wall, each piece of the roof and
  // of the ceiling under it, each upper floor, what is on the roof, each
  // pane of glass, each piece of furniture, each thing in the yard.  Each
  // hangs on another -- a wall on the house, a lamp on its floor -- and
  // goes where that goes, till it is let go itself.
  function fxItem(F, id, kind, parent) {
    var it = F.items.get(id);
    if (it) { return it; }
    it = { id: id, kind: kind, parent: parent || null, kids: [], state: "held", box: [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity],
           verts: 0, area: 0, hash: fxHash(id) };
    if (it.parent) { it.parent.kids.push(it); }
    F.items.set(id, it);
    var L = F.plan, list = { wall: L.panels, roof: L.cells, ceil: L.ceils, plate: L.plates, extra: L.extras, glass: L.glass, thing: L.things }[kind];
    if (list) { list.push(it); }
    return it;
  }
  function fxMid(f) {
    var p = f.pts, x = 0, y = 0, z = 0;
    for (var i = 0; i < p.length; i++) { x += p[i][0]; y += p[i][1]; z += p[i][2] || 0; }
    return [x / p.length, y / p.length, z / p.length];
  }
  function fxZ(f) {
    var lo = Infinity, hi = -Infinity;
    for (var i = 0; i < f.pts.length; i++) { var z = f.pts[i][2] || 0; if (z < lo) { lo = z; } if (z > hi) { hi = z; } }
    return [lo, hi];
  }
  function fxInRoom(r, c, grow) {
    var dx = c[0] - r.cx, dy = c[1] - r.cy, lx = dx * r.ca + dy * r.sa, ly = -dx * r.sa + dy * r.ca;
    return Math.abs(lx) <= r.hw + grow && Math.abs(ly) <= r.hh + grow;
  }
  function fxNear(L, c, grow) { for (var i = 0; i < L.rooms.length; i++) { if (fxInRoom(L.rooms[i], c, grow)) { return true; } } return false; }
  function fxEave(L, c) {
    var top = -Infinity;
    L.rooms.forEach(function (r) { if (r.ztop > top && fxInRoom(r, c, 1.2 * L.P)) { top = r.ztop; } });
    return top === -Infinity ? L.top : top;
  }
  // The length of wall a spot is in: the side of the room it is nearest,
  // of the storey it is on, cut in lengths of about FX_SEG.
  function fxPanelAt(F, c, zr, prefer) {
    var L = F.plan, P = L.P, best = null, bd = 0.9 * P;
    for (var i = 0; i < L.rooms.length; i++) {
      var r = L.rooms[i];
      if (prefer && r.n !== prefer) { continue; }
      if (zr[1] < r.z0 - 0.1 * P || zr[0] > r.ztop + 0.1 * P) { continue; }
      var dx = c[0] - r.cx, dy = c[1] - r.cy, lx = dx * r.ca + dy * r.sa, ly = -dx * r.sa + dy * r.ca;
      if (Math.abs(lx) > r.hw + bd || Math.abs(ly) > r.hh + bd) { continue; }
      var e = [[Math.abs(ly + r.hh), "N", lx + r.hw, 2 * r.hw], [Math.abs(ly - r.hh), "S", lx + r.hw, 2 * r.hw],
               [Math.abs(lx + r.hw), "W", ly + r.hh, 2 * r.hh], [Math.abs(lx - r.hw), "E", ly + r.hh, 2 * r.hh]];
      for (var k = 0; k < 4; k++) { if (e[k][0] < bd) { bd = e[k][0]; best = { r: r, side: e[k][1], t: e[k][2], len: e[k][3] }; } }
    }
    if (!best) { return prefer ? fxPanelAt(F, c, zr, null) : null; }
    var segs = Math.max(1, Math.round(best.len / (FX_SEG * P))), seg = Math.max(0, Math.min(segs - 1, Math.floor(best.t / (best.len / segs))));
    var id = "w" + best.r.n.id + best.side + seg, it = F.items.get(id);
    if (!it) {
      it = fxItem(F, id, "wall", L.house);
      it.room = best.r; best.r.panels++;
      var a = Math.atan2(best.r.sa, best.r.ca), out = { N: [0, -1], S: [0, 1], W: [-1, 0], E: [1, 0] }[best.side];
      it.n0 = [out[0] * Math.cos(a) - out[1] * Math.sin(a), out[0] * Math.sin(a) + out[1] * Math.cos(a), 0];
    }
    return it;
  }
  function fxPlate(F, r) { var it = fxItem(F, "p" + r.n.id, "plate", F.plan.house); it.room = r; it.n0 = [0, 0, 1]; return it; }
  function fxPlateOver(F, r, c) {
    var L = F.plan;
    for (var i = 0; i < L.rooms.length; i++) { var q = L.rooms[i]; if (q.level === r.level + 1 && fxInRoom(q, c, 0)) { return fxPlate(F, q); } }
    return null;
  }
  // what is up on the roof -- its trim, its gutters, panels on it -- in
  // squares, each going with the roof under it
  function fxExtra(F, c) {
    var s = FX_CELL_U * F.plan.P;
    return fxItem(F, "x" + Math.floor(c[0] / s) + ":" + Math.floor(c[1] / s), "extra", F.plan.house);
  }
  function fxRoomOf(L, n) {
    var best = null, area = Infinity;
    L.rooms.forEach(function (r) { if (insideArea(r.n, n.x, n.y) && r.n.w * r.n.h < area) { best = r; area = r.n.w * r.n.h; } });
    return best;
  }
  function fxThing(F, n, f) {
    var L = F.plan, k = "n" + n.id;
    if (L.thing.has(k)) { return L.thing.get(k); }
    var it = null, room = fxRoomOf(L, n), wallish = FX_SMALL[n.kind] || (typeof V3_WALL === "object" && V3_WALL[n.kind]) || FROM_CEILING[n.kind];
    var strongest = fxWindy(F) && F.V >= FX_STRONGEST;
    if (!room && FX_TREES[n.kind]) {
      it = fxItem(F, k, "thing", null);
      it.node = n; it.out = true; it.tree = true;
    } else if (!room && n.kind === "i_deck" && strongest) {
      // (a deck, bolted to its posts: torn up only by the strongest)
      it = fxItem(F, k, "thing", null);
      it.node = n; it.out = true; it.built = true;
    } else if (!room) {
      if (wallish) {
        // (a porch light: on the wall it hangs on)
        if (L.split && f && f.pts) { var c = fxMid(f), p = fxPanelAt(F, c, [c[2], c[2]], null); if (p) { it = fxItem(F, k, "small", p); } }
      } else if (!(FX_FIXED[n.kind] || LIES_FLAT[n.kind] || (typeof TERR_DRAPE === "object" && TERR_DRAPE[n.kind] && !FX_HOLD[n.kind]) || WALK_DOORS[n.kind] || pieceHigh(n) < 0.15)) {
        it = fxItem(F, k, "thing", null);
        it.node = n; it.out = true;
      }
    } else if (L.split) {
      if (wallish) {
        var c2 = f && f.pts ? fxMid(f) : null, pn = c2 && !FROM_CEILING[n.kind] ? fxPanelAt(F, c2, [c2[2], c2[2]], null) : null;
        it = fxItem(F, k, "small", pn || (room.level > 0 ? fxPlate(F, room) : L.house));
      } else if (FX_BUILTIN[n.kind] && room.level === 0 && strongest) {
        // (the tubs, the toilets, the counters: torn out at last)
        it = fxItem(F, k, "thing", null);
        it.node = n; it.room = room; it.built = true;
      } else if (FX_BUILTIN[n.kind]) {
        it = room.level > 0 ? fxItem(F, k, "fixture", fxPlate(F, room)) : null;
        if (it) { it.room = room; }
      } else {
        it = fxItem(F, k, "thing", room.level > 0 ? fxPlate(F, room) : null);
        it.node = n; it.room = room;
      }
    }
    if (it && !it.node) { it.node = n; }
    L.thing.set(k, it);
    return it;
  }
  // What a face of the picture is part of: null where it stays as it is;
  // "roof" or "ceil" where it is cut into pieces (fxSplit).
  function fxSort(F, f) {
    var L = F.plan, P = L.P, h = f.how || {}, n = f.node;
    if (f.ground || !f.pts || !f.pts.length) { return null; }
    if (h.roof || f.roof) { return L.split && !f.mesh ? "roof" : null; }
    if (n && n.kind !== "i_room" && !WALK_DOORS[n.kind] && n.kind !== "i_window") { return fxThing(F, n, f); }
    var c = fxMid(f);
    // the glass: each pane its own, broken by what flies
    if (h.glass && !f.mesh && L.vc.windows !== undefined) {
      if (!fxNear(L, c, 0.6 * P)) { return null; }
      var zg = fxZ(f), gl = F.items.get("g" + Math.round(c[0]) + ":" + Math.round(c[1]) + ":" + Math.round(c[2]));
      return gl || fxItem(F, "g" + Math.round(c[0]) + ":" + Math.round(c[1]) + ":" + Math.round(c[2]), "glass",
                          L.split ? (fxPanelAt(F, c, zg, n && n.kind === "i_room" ? n : null) || L.house) : null);
    }
    if (!L.split) { return null; }
    var zr = fxZ(f);
    if (zr[1] <= L.slab + 0.12 * P) { return null; }                    // its foundation, the steps up
    if (n && n.kind === "i_room") {
      var r = L.byId[n.id];
      if (h.floor) { return r && r.level > 0 ? fxPlate(F, r) : null; }   // (the ground floor: the slab, staying)
      if (h.ceiling) { return r && r.top ? "ceil" : (r && fxPlateOver(F, r, c)) || L.house; }
    }
    if (!n && !fxNear(L, c, 1.2 * P)) { return null; }                   // out of doors: a porch's posts, its steps
    var eave = fxEave(L, c);
    // a chimney: from below the eaves to over the roof, on its own foundation
    if (zr[1] > eave + 0.4 * P && zr[0] < eave - 0.6 * P) { L.chim.push(fxBoxXY(f)); return fxChim(F, c); }
    if (zr[0] >= eave - 0.25 * P && !h.wall) {
      for (var i = 0; i < L.chim.length; i++) {
        var b = L.chim[i];
        if (c[0] > b[0] - 0.3 * P && c[0] < b[1] + 0.3 * P && c[1] > b[2] - 0.3 * P && c[1] < b[3] + 0.3 * P) { return fxChim(F, c); }
      }
      return fxExtra(F, c);
    }
    var it = fxPanelAt(F, c, zr, n && n.kind === "i_room" ? n : null) || L.house;
    if (it.kind === "wall" && h.wall && !it.ext && fxOutside(L, f, c)) { it.ext = true; }
    return it;
  }
  // a brick chimney, standing on its own -- in an earthquake, one of the first things to fall
  function fxChim(F, c) {
    if (!(F.kind === "quake" && F.plan.gives.chimney) && !(fxWindy(F) && F.V >= FX_STRONGEST)) { return null; }
    var s = 1.5 * F.plan.P, it = fxItem(F, "ch" + Math.round(c[0] / s) + ":" + Math.round(c[1] / s), "chim", null);
    if (F.plan.chims.indexOf(it) < 0) { F.plan.chims.push(it); }
    return it;
  }
  function fxBoxXY(f) {
    var b = [Infinity, -Infinity, Infinity, -Infinity];
    f.pts.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.max(b[1], p[0]); b[2] = Math.min(b[2], p[1]); b[3] = Math.max(b[3], p[1]); });
    return b;
  }
  // the face of a wall with no room beyond it
  function fxOutside(L, f, c) {
    var n = f.n || [0, 0, 1], p = [c[0] + n[0] * 9, c[1] + n[1] * 9, c[2]];
    return !L.rooms.some(function (r) { return p[2] >= r.z0 - 2 && p[2] <= r.ztop + 2 && fxInRoom(r, p, -2); });
  }
  function fxGrow(it, f) {
    var b = it.box;
    if (f.mesh) {
      var mb = fxMeshBox(f);
      b[0] = Math.min(b[0], mb[0]); b[1] = Math.max(b[1], mb[1]); b[2] = Math.min(b[2], mb[2]);
      b[3] = Math.max(b[3], mb[3]); b[4] = Math.min(b[4], mb[4]); b[5] = Math.max(b[5], mb[5]);
      return;
    }
    for (var i = 0; i < f.pts.length; i++) {
      var p = f.pts[i], z = p[2] || 0;
      if (p[0] < b[0]) { b[0] = p[0]; } if (p[0] > b[1]) { b[1] = p[0]; }
      if (p[1] < b[2]) { b[2] = p[1]; } if (p[1] > b[3]) { b[3] = p[1]; }
      if (z < b[4]) { b[4] = z; } if (z > b[5]) { b[5] = z; }
    }
  }
  function fxOf(F, f) {
    var L = F.plan, key = f.src || null;
    if (key) { var got = L.of.get(key); if (got !== undefined) { return got; } }
    var it = fxSort(F, f);
    if (it && typeof it === "object") {
      if (key || it.box[0] === Infinity) { fxGrow(it, f); }
      if (key && f.mesh) { it.verts += f.mesh.p.length / 3; }
    }
    if (key) { L.of.set(key, it); }
    return it;
  }

  // A model's points (38-models.js) where they stand, and turned with
  // what carries them.
  var fxWorldKept = new WeakMap(), fxBoxKept = new WeakMap();
  function fxMeshKey(f) {
    var m = f.mesh, xf = m.xf || [0, 0, 1, 0, 0];
    return xf.join(",") + "|" + (f.pts[0][0] - m.base[0]) + "," + (f.pts[0][1] - m.base[1]) + "," + (f.pts[0][2] - m.base[2]);
  }
  function fxMeshWorld(f) {
    var m = f.mesh, key = fxMeshKey(f), by = fxWorldKept.get(m.p);
    if (!by) { by = new Map(); fxWorldKept.set(m.p, by); }
    var w = by.get(key);
    if (w) { return w; }
    var xf = m.xf || [0, 0, 1, 0, 0], ox = f.pts[0][0] - m.base[0], oy = f.pts[0][1] - m.base[1], oz = f.pts[0][2] - m.base[2];
    var Pp = m.p, N = m.n, c = xf[2], s = xf[3], count = Pp.length / 3, wp = new Float32Array(count * 3), wn = new Float32Array(count * 3);
    for (var i = 0; i < count * 3; i += 3) {
      var lx = Pp[i], ly = Pp[i + 1], nx = N[i], ny = N[i + 1];
      wp[i] = xf[0] + lx * c - ly * s + ox; wp[i + 1] = xf[1] + lx * s + ly * c + oy; wp[i + 2] = xf[4] + Pp[i + 2] + oz;
      wn[i] = nx * c - ny * s; wn[i + 1] = nx * s + ny * c; wn[i + 2] = N[i + 2];
    }
    w = { p: wp, n: wn };
    if (by.size > 40) { by.clear(); }
    by.set(key, w);
    return w;
  }
  function fxMeshBox(f) {
    var m = f.mesh, key = fxMeshKey(f), by = fxBoxKept.get(m.p);
    if (!by) { by = new Map(); fxBoxKept.set(m.p, by); }
    var b = by.get(key);
    if (b) { return b; }
    var xf = m.xf || [0, 0, 1, 0, 0], ox = f.pts[0][0] - m.base[0], oy = f.pts[0][1] - m.base[1], oz = f.pts[0][2] - m.base[2];
    var Pp = m.p, c = xf[2], s = xf[3];
    b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
    for (var i = 0; i < Pp.length; i += 3) {
      var x = xf[0] + Pp[i] * c - Pp[i + 1] * s + ox, y = xf[1] + Pp[i] * s + Pp[i + 1] * c + oy, z = xf[4] + Pp[i + 2] + oz;
      if (x < b[0]) { b[0] = x; } if (x > b[1]) { b[1] = x; } if (y < b[2]) { b[2] = y; } if (y > b[3]) { b[3] = y; } if (z < b[4]) { b[4] = z; } if (z > b[5]) { b[5] = z; }
    }
    by.set(key, b);
    return b;
  }

  // ---- the roof and the ceiling, in pieces ---------------------------------------------------------
  // Each face cut on a grid of its own plane -- along the slope's foot
  // FX_CELL_U, up it FX_CELL_V -- the same grid for every face in that
  // plane, so a piece across two faces is one piece.
  function fxClip(poly, u0, u1, v0, v1) {
    function cut(pts, k, at, keep) {
      var out = [];
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length], ia = keep(a[k]), ib = keep(b[k]);
        if (ia) { out.push(a); }
        if (ia !== ib) { var t = (at - a[k]) / (b[k] - a[k]); out.push(k === 0 ? [at, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), at]); }
      }
      return out;
    }
    var p = cut(poly, 0, u0, function (v) { return v >= u0; });
    if (p.length >= 3) { p = cut(p, 0, u1, function (v) { return v <= u1; }); }
    if (p.length >= 3) { p = cut(p, 1, v0, function (v) { return v >= v0; }); }
    if (p.length >= 3) { p = cut(p, 1, v1, function (v) { return v <= v1; }); }
    return p;
  }
  function fxSplit(F, f, kind) {
    var L = F.plan, P = L.P, key = kind + f.pts.map(function (p) { return Math.round(p[0]) + "," + Math.round(p[1]) + "," + Math.round(p[2] || 0); }).join(";");
    var s = L.splits.get(key);
    if (s) { return s; }
    var n = f.n || [0, 0, 1], u = Math.abs(n[2]) > 0.95 ? [1, 0, 0] : [-n[1], n[0], 0], ul = Math.hypot(u[0], u[1]) || 1;
    u = [u[0] / ul, u[1] / ul, 0];
    var v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
    var p0 = f.pts[0], d = n[0] * p0[0] + n[1] * p0[1] + n[2] * (p0[2] || 0);
    var poly = f.pts.map(function (p) { return [u[0] * p[0] + u[1] * p[1] + u[2] * (p[2] || 0), v[0] * p[0] + v[1] * p[1] + v[2] * (p[2] || 0)]; });
    var CU = FX_CELL_U * P, CV = FX_CELL_V * P, lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
    poly.forEach(function (q) { lo[0] = Math.min(lo[0], q[0]); lo[1] = Math.min(lo[1], q[1]); hi[0] = Math.max(hi[0], q[0]); hi[1] = Math.max(hi[1], q[1]); });
    var plane = [Math.round(n[0] * 20), Math.round(n[1] * 20), Math.round(n[2] * 20), Math.round(d / (0.3 * P))].join(",");
    s = { parts: [] };
    for (var i = Math.floor(lo[0] / CU); i * CU < hi[0]; i++) {
      for (var j = Math.floor(lo[1] / CV); j * CV < hi[1]; j++) {
        var q = fxClip(poly, i * CU, (i + 1) * CU, j * CV, (j + 1) * CV);
        if (q.length < 3) { continue; }
        var area = 0;
        for (var k = 0; k < q.length; k++) { var a = q[k], b = q[(k + 1) % q.length]; area += a[0] * b[1] - b[0] * a[1]; }
        area = Math.abs(area) / 2;
        if (area < 1) { continue; }
        var pts = q.map(function (w) { return [u[0] * w[0] + v[0] * w[1] + n[0] * d, u[1] * w[0] + v[1] * w[1] + n[1] * d, u[2] * w[0] + v[2] * w[1] + n[2] * d]; });
        var it = fxItem(F, kind[0] + plane + ":" + i + ":" + j, kind, L.house);
        it.area += area / (P * P); it.n0 = n.slice(); it.full = Math.min(1, it.area / (FX_CELL_U * FX_CELL_V));
        fxGrow(it, { pts: pts });
        (it.pts || (it.pts = [])).push.apply(it.pts, pts);
        s.parts.push({ pts: pts, item: it, mid: fxMid({ pts: pts }) });
      }
    }
    L.splits.set(key, s);
    return s;
  }

  // ---- planned: the rooms where they stand, what each piece is -----------------------------------
  function fxPlan(F, model) {
    var P = FLOOR_PX, T = F.T, B = T ? T.B : null, V = F.V;
    var L = { P: P, rooms: [], byId: {}, splits: new Map(), of: new WeakMap(), thing: new Map(), house: null, deep: false, split: false,
              vc: {}, gives: {}, chim: [], chims: [], foot: [], slab: 0, top: 0, panels: [], cells: [], ceils: [], plates: [], extras: [], glass: [], things: [], spots: [] };
    F.plan = L;
    (T ? T.list : []).forEach(function (c) {
      if (c.ok) { return; }
      if (c.k === "windows") { L.vc.windows = F.kind === "hail" ? 0 : V * 0.7; return; }
      if (c.need > 0 && c.have !== undefined && (c.k === "roof" || c.k === "walls" || c.k === "anchors")) { L.vc[c.k] = V * Math.pow(Math.max(0.02, c.have / c.need), F.expo); }
      if (c.k === "chimney" || c.k === "contents" || c.k === "cover" || c.k === "solar") { L.gives[c.k] = true; }
      if (c.k === "anchors") { L.lifts = !!c.lift; }
    });
    L.deep = F.open || (!!B && B.frame !== "tall" && !(typeof v3Big === "function" && v3Big()));
    L.split = F.open;
    // the rooms as they stand in the picture: by their walls and floors
    var floors = typeof floorsOf === "function" ? floorsOf() : [], got = new Map();
    model.faces.forEach(function (f) {
      var n = f.node, h = f.how || {};
      if (!n || n.kind !== "i_room" || f.mesh || !f.pts || !(h.wall || h.floor)) { return; }
      var b = got.get(n);
      if (!b) { b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity]; got.set(n, b); }
      fxGrow({ box: b }, f);
    });
    var fb = [Infinity, -Infinity, Infinity, -Infinity];
    got.forEach(function (b, n) {
      var fl = floors.length ? floorAt(floors, n.x, n.y) : null, a = (n.turn || 0) * Math.PI / 180;
      var r = { n: n, cx: (b[0] + b[1]) / 2, cy: (b[2] + b[3]) / 2, ca: Math.cos(a), sa: Math.sin(a), hw: n.w / 2, hh: n.h / 2,
                level: fl ? fl.level : 0, z0: b[4], ztop: b[5], box: b, panels: 0, gone: 0, roofGone: 0, top: true };
      L.rooms.push(r); L.byId[n.id] = r;
      if (r.level === 0) {
        L.foot.push([b[0] / P, b[1] / P, b[2] / P, b[3] / P]);
        fb[0] = Math.min(fb[0], b[0]); fb[1] = Math.max(fb[1], b[1]); fb[2] = Math.min(fb[2], b[2]); fb[3] = Math.max(fb[3], b[3]);
      }
    });
    if (!L.rooms.length) { L.split = false; F.open = false; }
    L.slab = L.foot.length ? Math.min.apply(null, L.rooms.filter(function (r) { return r.level === 0; }).map(function (r) { return r.z0; })) : 0;
    L.top = L.rooms.reduce(function (t, r) { return Math.max(t, r.ztop); }, 0);
    L.rooms.forEach(function (r) { r.top = !L.rooms.some(function (q) { return q.level > r.level && fxInRoom(q, [r.cx, r.cy], 0); }); });
    if (fb[0] === Infinity) {
      var lot = typeof houseLot === "function" ? houseLot() : null;
      fb = lot ? [lot.x - 1, lot.x + 1, lot.y - 1, lot.y + 1] : [-1, 1, -1, 1];
    }
    L.H = [(fb[0] + fb[1]) / 2, (fb[2] + fb[3]) / 2, L.slab];
    L.footArea = Math.max(1, (fb[1] - fb[0]) * (fb[3] - fb[2]) / (P * P));
    F.H = [L.H[0] / P, L.H[1] / P];
    F.ground = fxLand(F.H[0], F.H[1]);
    L.house = fxItem(F, "house", "house", null);
    L.house.box = [fb[0], fb[1], fb[2], fb[3], L.slab, Math.max(L.top, L.slab + 2.4 * P)];
    // the safe room: in the ground-floor room nearest the middle
    var near = null, nd = Infinity;
    L.rooms.forEach(function (r) { var d = Math.hypot(r.cx - L.H[0], r.cy - L.H[1]); if (r.level === 0 && d < nd) { nd = d; near = r; } });
    L.safeAt = near ? [near.cx, near.cy] : [L.H[0], L.H[1]];
    // the storm's own way across
    if (F.kind === "tornado") {
      // (turning and going on together, at the edge of its core, as fast as its rating)
      var V0 = F.V, Vt = V0 < 60 ? 12 : 15, Ve = Vt * Math.exp(-1 / 9), a2 = 1.2025, b2 = 2 * Ve, c2 = Ve * Ve - V0 * V0;
      F.Vt = Vt; F.Vr = (-b2 + Math.sqrt(b2 * b2 - 4 * a2 * c2)) / (2 * a2);
      // (the stronger, the wider: an EF5's core a hundred metres and more across, its path of
      // damage a few hundred -- not a rope of a funnel)
      F.Rc = 25 + 1.2 * Math.max(0, V0 - 40); F.Wup = 0.35 * F.Vr;
      F.go = fxPaper(0.7071, -0.7071);              // from the southwest, as most go
      F.side = [-F.go[1], F.go[0]];                  // (its right, where it is fastest: the house there)
      F.miss = F.Rc; F.tMid = 220 / Vt; F.tEnd = 2 * F.tMid;
    } else {
      F.dir = F.kind === "hurricane" ? fxPaper(-0.7071, -0.7071) : fxPaper(1, 0);
      F.tEnd = { quake: 18, flood: 34, snow: 24, hail: 20 }[F.kind] || 32;
      // (a flood's water running past, downhill the way the street runs)
      F.flow = fxPaper(-1, 0);
    }
    // each face, sorted once
    model.faces.forEach(function (f) { try { fxOf(F, f); } catch (e) { /* stays */ } });
  }

  // ---- let go -------------------------------------------------------------------------------------
  function fxT(it) {
    for (var q = it; q; q = q.parent) {
      if (q.state === "gone") { return FX_GONE; }
      if (q.body) { return q.body.T; }
    }
    return null;
  }
  function fxMover(it) { for (var q = it; q; q = q.parent) { if (q.state === "gone") { return null; } if (q.body) { return q.body; } } return null; }
  function fxApply(T, p) {
    var R = T.R, dx = p[0] - T.c[0], dy = p[1] - T.c[1], dz = p[2] - T.c[2];
    return [R[0] * dx + R[1] * dy + R[2] * dz + T.x[0], R[3] * dx + R[4] * dy + R[5] * dz + T.x[1], R[6] * dx + R[7] * dy + R[8] * dz + T.x[2]];
  }
  function fxMidOf(it) { var b = it.box; return [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2]; }
  // its box with everything it still carries
  function fxWhole(it, b) {
    b = b || it.box.slice();
    if (it.box[0] !== Infinity) {
      b[0] = Math.min(b[0], it.box[0]); b[1] = Math.max(b[1], it.box[1]); b[2] = Math.min(b[2], it.box[2]);
      b[3] = Math.max(b[3], it.box[3]); b[4] = Math.min(b[4], it.box[4]); b[5] = Math.max(b[5], it.box[5]);
    }
    it.kids.forEach(function (k) { if (k.state === "held" && k.kind !== "small" && k.kind !== "glass") { fxWhole(k, b); } });
    return b;
  }
  function fxMassOf(F, it, d) {
    var k = it.node ? it.node.kind : "";
    switch (it.kind) {
      case "wall": return Math.max(d[0], d[1]) * d[2] * 45;
      case "roof": return Math.max(1, it.area) * 22;
      case "ceil": return Math.max(1, it.area) * 9;
      case "plate": return d[0] * d[1] * 55;
      case "extra": return Math.max(4, Math.min(120, d[0] * d[1] * d[2] * 150));
      case "chim": return d[0] * d[1] * d[2] * 1100;
      case "thing": return FX_MASS[k] || (FX_TREES[k] ? FX_TREES[k][2] : 0) || Math.max(2, Math.min(2000, d[0] * d[1] * d[2] * 60));
      case "debris": return it.mass || 500;
      default: return 10;
    }
  }
  function fxDims(b, P) { return [Math.max(0.05, (b[1] - b[0]) / P), Math.max(0.05, (b[3] - b[2]) / P), Math.max(0.05, (b[5] - b[4]) / P)]; }
  function fxHeavy(F, it) {
    var P = F.plan.P, m = it.kind === "house" ? 15 * F.plan.footArea : fxMassOf(F, it, fxDims(it.box, P));
    it.kids.forEach(function (k) { if (k.state === "held" && k.kind !== "glass" && k.kind !== "small") { m += fxHeavy(F, k); } });
    return m;
  }
  function fxVertsOf(it) { var n = it.verts; it.kids.forEach(function (k) { if (k.state === "held") { n += fxVertsOf(k); } }); return n; }
  function fxLoose(F, it, kick, pop) {
    if (it.state !== "held") { return null; }
    var L = F.plan, P = L.P, mover = fxMover(it.parent), T = mover ? mover.T : null;
    var box = fxWhole(it), c0 = [(box[0] + box[1]) / 2, (box[2] + box[3]) / 2, (box[4] + box[5]) / 2];
    if (box[0] === Infinity) { it.state = "gone"; return null; }
    var x = T ? fxApply(T, c0) : c0.slice(), d = fxDims(box, P), m = fxHeavy(F, it);
    var R = T ? T.R.slice() : [1, 0, 0, 0, 1, 0, 0, 0, 1];
    var b = { it: it, m: m, x: [x[0] / P, x[1] / P, x[2] / P], v: [0, 0, 0], w: [0, 0, 0], R: R, dims: d,
              size: Math.max(0.25, Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) / 1.7),
              I: m * (d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) / 18, ph: it.hash * 40, awake: true, still: 0, hit: 0, pop: pop || 0,
              // (a house's sill on its foundation, shaken, slides sooner than it is dragged)
              mu: it.kind === "house" ? (F.kind === "quake" ? 0.45 : 0.7) : it.node && (it.node.kind === "i_parked" || it.node.kind === "i_car") ? 0.7 : 0.55,
              cd: it.kind === "house" ? 1.2 : FX_CD[it.node ? it.node.kind : ""] || 1.05,
              cl: it.kind === "house" ? 1.0 : it.kind === "extra" ? 0.3 : FX_LIFT[it.node ? it.node.kind : ""] || 0.15,
              start: [x[0] / P, x[1] / P, x[2] / P], verts: fxVertsOf(it), gz: 0 };
    if (mover) {
      // going the way what carried it was going, turning with it
      var rx = b.x[0] - mover.x[0], ry = b.x[1] - mover.x[1], rz = b.x[2] - mover.x[2], w = mover.w;
      b.v = [mover.v[0] + w[1] * rz - w[2] * ry, mover.v[1] + w[2] * rx - w[0] * rz, mover.v[2] + w[0] * ry - w[1] * rx];
      b.w = w.slice();
    }
    if (kick) { b.v[0] += kick[0]; b.v[1] += kick[1]; b.v[2] += kick[2]; }
    // a sheet: the wind on it across its face
    if (it.n0 && (it.kind === "roof" || it.kind === "ceil" || it.kind === "wall" || it.kind === "plate")) {
      b.n0 = it.n0;
      b.A = it.kind === "wall" ? Math.max(d[0], d[1]) * d[2] : it.kind === "plate" ? d[0] * d[1] : Math.max(0.3, it.area);
    }
    // where it can touch the ground: its corners (a sheet: its outline, both faces)
    var hull = [];
    if (it.pts && it.pts.length && it.pts.length <= 24) {
      var nn = it.n0 || [0, 0, 1];
      it.pts.forEach(function (p) { [-0.05, 0.05].forEach(function (o) { hull.push([(p[0] - c0[0]) / P + nn[0] * o, (p[1] - c0[1]) / P + nn[1] * o, (p[2] - c0[2]) / P + nn[2] * o]); }); });
    } else {
      [0, 1].forEach(function (i) { [2, 3].forEach(function (j) { [4, 5].forEach(function (k) { hull.push([(box[i] - c0[0]) / P, (box[j] - c0[1]) / P, (box[k] - c0[2]) / P]); }); }); });
    }
    b.hull = hull;
    b.T = { R: b.R, c: c0, x: x, ver: 1 };
    it.body = b; it.state = "free";
    F.free.push(b);
    // what it leaves open, and what goes with it
    if (it.kind === "wall" && it.room) { it.room.gone++; }
    if (it.kind === "roof") {
      L.rooms.forEach(function (r) { if (fxInRoom(r, c0, 0.5 * P)) { r.roofGone++; } });
      fxNear3(F, it).forEach(function (o) { o.nb = true; });
      fxShingle(F, x, true);
    }
    if (it.kind === "wall" || it.kind === "house") { for (var q = 0; q < (it.kind === "house" ? 10 : 3); q++) { fxPlank(F, x, b.v); } }
    if (it.tree) { fxTorn(F, x, it.node.kind === "i_tree" || it.node.kind === "i_palm"); F.seen.trees = true; }
    return b;
  }
  // the pieces of roof touching one
  function fxNear3(F, it) {
    if (it.near) { return it.near; }
    var c = fxMidOf(it), reach = Math.hypot(FX_CELL_U, FX_CELL_V) * 1.2 * F.plan.P;
    it.near = F.plan.cells.filter(function (o) { if (o === it) { return false; } var d = fxMidOf(o); return Math.hypot(d[0] - c[0], d[1] - c[1], d[2] - c[2]) < reach; });
    return it.near;
  }

  // ---- what lets go, and when --------------------------------------------------------------------
  // The wind across a piece as it meets it: where it stands, less the way
  // what carries it is going.
  function fxLevel(F) {
    var t = F.t, A = F.V;
    switch (F.kind) {
      case "quake": return A * (t < 2 ? t / 2 : t < 10 ? 1 : Math.max(0, 1 - (t - 10) / 6));
      case "flood": return A * (t < 10 ? t / 10 : t < F.tEnd - 9 ? 1 : Math.max(0.15, 1 - (t - (F.tEnd - 9)) / 8 * 0.85));
      case "snow": return A * Math.min(1, t / 14);
      case "hail": return t > 1 && t < F.tEnd - 2 ? A : 0;
      default: return fxNom(F, F.H[0], F.H[1]);
    }
  }
  function fxWindy(F) { return F.kind === "wind" || F.kind === "hurricane" || F.kind === "tornado"; }
  // the ground's shaking, m/s^2 across it: a few seconds rising, eight strong, dying away
  function fxShake(F, t, out) {
    var a = fxLevel(F) * FX_G;
    out[0] = a * (0.6 * Math.sin(2 * Math.PI * 1.7 * t) + 0.4 * Math.sin(2 * Math.PI * 3.1 * t + 1));
    out[1] = a * (0.5 * Math.sin(2 * Math.PI * 2.3 * t + 2) + 0.5 * Math.sin(2 * Math.PI * 1.2 * t + 0.5));
    return out;
  }
  // where the water stands (m, over the land under the house)
  function fxWater(F) { return F.kind === "flood" ? F.ground + fxLevel(F) : -Infinity; }
  function fxAcross(F, it) {
    if (!fxWindy(F)) { return fxLevel(F); }
    var P = F.plan.P, c = fxMidOf(it), mv = fxMover(it.parent), p = mv ? fxApply(mv.T, c) : c;
    var w = fxWind(F, p[0] / P, p[1] / P, 10, F.w);
    return mv ? Math.hypot(w[0] - mv.v[0], w[1] - mv.v[1]) : Math.hypot(w[0], w[1]);
  }
  function fxChecks(F) {
    var L = F.plan, P = L.P, house = L.house, vc = L.vc, held = house.state === "held", rnd = F.rnd;
    var Uh = fxLevel(F), windy = fxWindy(F);
    F.peak = Math.max(F.peak || 0, Uh);
    // the house off its foundation: pushed off -- or lifted, by as much of
    // its roof as is still on it to be pulled up by
    var left = fxRoofLeft(L), lift = windy && L.lifts && left > 0.1 ? vc.anchors / Math.sqrt(left) : vc.anchors;
    if (held && vc.anchors !== undefined && Uh >= lift) {
      var hb = fxLoose(F, house, null, 0);
      if (hb) { hb.cl = fxRoofLeft(L) >= 0.5 ? 1.0 : 0.6; held = false; }
    }
    if (house.body) { house.body.cl = fxRoofLeft(L) >= 0.5 ? 1.0 : 0.6; }
    // the glass
    L.glass.forEach(function (g) {
      if (g.hide || g.state === "gone") { return; }
      if (F.kind === "hail" ? Uh > 0 && F.t > 1.5 + g.hash * 14 : fxAcross(F, g) >= vc.windows * (0.9 + 0.35 * g.hash)) {
        g.hide = true; F.seen.windows = true;
        var mv = fxMover(g), c = mv ? fxApply(mv.T, fxMidOf(g)) : fxMidOf(g);
        for (var i = 0; i < 7; i++) { fxShard(F, c); }
      }
    });
    // the walls, racked over -- while the house still stands on its slab
    var tops = 0, topsGone = 0;
    L.panels.forEach(function (p) {
      if (p.room && p.room.top) { tops++; if (p.state !== "held") { topsGone++; } }
      // (in the wind, only while the house stands on its slab -- pushed off, nothing racks it; shaken, it racks still)
      if (p.state !== "held" || (!held && F.kind !== "quake") || vc.walls === undefined) { return; }
      var need = vc.walls * (p.ext ? 0.92 + 0.25 * p.hash : 1.12 + 0.3 * p.hash) * (p.room && p.room.top ? 0.96 : 1.05);
      if (fxAcross(F, p) >= need) {
        var w = fxWind(F, F.H[0], F.H[1], 3, [0, 0, 0]), l = Math.hypot(w[0], w[1]) || 1;
        fxLoose(F, p, [w[0] / l * 0.8, w[1] / l * 0.8, 0], 0);
      }
    });
    var fallen = (held || F.kind === "quake") && tops > 0 && topsGone / tops >= 0.4;
    // the roof, a piece at a time: its edges first, and next to a piece gone
    // -- peeled, a few a second at first, faster the more is gone (a whole
    // roof does not let go in a moment)
    var peeled = 0;
    L.cells.forEach(function (c) { if (c.state !== "held") { peeled++; } });
    F.peel = Math.min(6, (F.peel || 0) + 0.05 * (3 + 0.15 * peeled));
    L.cells.forEach(function (c) {
      if (c.state !== "held") { return; }
      var need = vc.roof === undefined ? Infinity : vc.roof * (c.full < 0.85 ? 0.86 + 0.12 * c.hash : 1.0 + 0.28 * c.hash) * (c.nb ? 0.8 : 1);
      if (fallen || (F.peel >= 1 && fxAcross(F, c) >= need)) {
        if (!fallen) { F.peel -= 1; }
        // (snow: caving in under the weight, not lifted off)
        if (F.kind === "snow" || !windy) { fxLoose(F, c, [0, 0, -1.5], 0); return; }
        var n = c.n0, w = fxWind(F, F.H[0], F.H[1], 6, [0, 0, 0]);
        var cb = fxLoose(F, c, fallen ? null : [n[0] * 3 + w[0] * 0.15, n[1] * 3 + w[1] * 0.15, Math.max(1.5, n[2] * 3)], fallen ? 0 : 0.5);
        if (cb && !fallen) { cb.w = [cb.w[0] + (rnd() - 0.5) * 4, cb.w[1] + (rnd() - 0.5) * 4, cb.w[2] + (rnd() - 0.5) * 2]; }
      }
    });
    // the ceiling under a piece gone, a moment after
    L.ceils.forEach(function (c) {
      if (c.state !== "held") { return; }
      if (c.over === undefined) { c.over = fxOver(L, c); }
      var o = c.over;
      if (fallen || (o && o.state !== "held" && (c.since = c.since || F.t) < F.t - 0.3 - c.hash * 1.4)) { fxLoose(F, c, [0, 0, 1], 0.3); }
      else if (o && o.state !== "held" && !c.since) { c.since = F.t; }
    });
    // what is up on the roof, with the roof under it
    L.extras.forEach(function (x) {
      if (x.state !== "held") { return; }
      if (x.under === undefined) {
        var c = fxMidOf(x);
        x.under = L.cells.filter(function (q) { var d = fxMidOf(q); return Math.hypot(d[0] - c[0], d[1] - c[1]) < 2.6 * P; });
      }
      if (fallen || x.under.some(function (q) { return q.state !== "held"; })) { fxLoose(F, x, [0, 0, 1], 0); }
    });
    // an upper floor, its walls under it down
    L.plates.forEach(function (p) {
      if (p.state !== "held" || !held || !p.room) { return; }
      var under = 0, gone = 0;
      L.panels.forEach(function (q) { if (q.room && q.room.level === p.room.level - 1) { under++; if (q.state !== "held") { gone++; } } });
      if (under && gone / under >= 0.5) { fxLoose(F, p, null, 0); }
    });
    // a chimney shaken down
    L.chims.forEach(function (it) {
      if (it.state === "held" && it.box[0] !== Infinity && (windy ? fxAcross(F, it) >= 68 + 12 * it.hash : Uh >= 0.25 * (1 + 0.3 * it.hash))) {
        var q = fxShake(F, F.t, [0, 0]), l = Math.hypot(q[0], q[1]) || 1;
        fxLoose(F, it, [q[0] / l * 0.6, q[1] / l * 0.6, 0], 0);
        F.seen.chimney = true;
      }
    });
    // furniture and what is in the yard: pushed harder than it holds, or lifted off
    var busy = 0;
    F.free.forEach(function (b) { if (b.awake) { busy += b.verts; } });
    L.things.forEach(function (it) {
      if (it.state !== "held" || it.box[0] === Infinity) { return; }
      var r = it.room, open = 1;
      if (!windy) {
        if (F.kind === "quake" ? fxTopples(F, it, Uh) : F.kind === "flood" ? fxFloats(F, it) : false) {
          var bq = fxLoose(F, it, null, 0);
          if (bq) { busy += bq.verts; if (it.out) { F.yardOut = (F.yardOut || 0) + 1; } else { F.seen.shelves = F.kind === "quake" || F.seen.shelves; } }
        }
        return;
      }
      if (r) {
        open = house.state !== "held" || r.gone > 0 ? 0.85 : r.roofGone > 0 && r.top ? 0.45 : 0;
        if (house.state !== "held" && !it.parent) { open = 1; }
        if (!open) { return; }
      }
      // (a tree, or what is built in, not kept waiting for room: it is what is asked to go)
      if (it.verts && !it.tree && !it.built && busy + it.verts > FX_BUDGET * 0.75) { return; }
      var c = fxMidOf(it), mv = fxMover(it.parent), p = mv ? fxApply(mv.T, c) : c;
      var gz = fxFloor(F, p[0] / P, p[1] / P, null), w = fxWind(F, p[0] / P, p[1] / P, Math.max(1.5, p[2] / P - gz), F.w);
      var U = (mv ? Math.hypot(w[0] - mv.v[0], w[1] - mv.v[1]) : Math.hypot(w[0], w[1])) * open;
      if (fxGoes(F, it, U)) {
        var b = fxLoose(F, it, null, 0);
        if (b) { busy += b.verts; if (it.out) { F.yardOut = (F.yardOut || 0) + 1; } }
      }
    });
    // asleep, woken by a wind strong enough to move it again -- or by the
    // ground still shaking, or the water come up round it
    F.free.forEach(function (b) {
      if (b.awake || b.it.state === "gone") { return; }
      if (F.kind === "quake" ? Uh > 0.12 : F.kind === "flood" ? fxWater(F) > b.x[2] - b.dims[2] / 2 + 0.05 : false) { b.awake = true; b.still = 0; return; }
      if (!windy) { return; }
      var w = fxWind(F, b.x[0], b.x[1], Math.max(1.5, b.dims[2] / 2), F.w), U = Math.hypot(w[0], w[1]), q = 0.5 * FX_RHO * U * U;
      var push = q * b.cd * Math.max(b.dims[0], b.dims[1]) * b.dims[2], lift = q * (b.n0 ? 0.6 * (b.A || 1) : b.cl * b.dims[0] * b.dims[1]);
      if (push > 0.9 * b.mu * b.m * FX_G || lift > 0.8 * b.m * FX_G) { b.awake = true; b.still = 0; }
    });
    fxSeen(F);
  }
  // shaken over (tall and narrow) or along (sliding), at this much of g
  function fxTopples(F, it, a) {
    var d = it.dims || (it.dims = fxDims(it.box, F.plan.P)), k = it.node ? it.node.kind : "";
    if (FX_HOLD[k]) { a *= 0.5; }
    return a * (0.8 + 0.4 * it.hash) >= Math.min(0.55, Math.min(d[0], d[1]) / Math.max(0.1, d[2]));
  }
  // floated off: the water deeper round it than it sinks
  function fxFloats(F, it) {
    var P = F.plan.P, d = it.dims || (it.dims = fxDims(it.box, P)), m = it.m || (it.m = fxMassOf(F, it, d));
    var sinks = m / (1000 * d[0] * d[1] * 0.35) + (FX_HOLD[it.node ? it.node.kind : ""] || 0) / (9810 * d[0] * d[1] * 0.35);
    return fxWater(F) - it.box[4] / P >= Math.min(d[2], sinks) && sinks < d[2];
  }
  function fxRoofLeft(L) { var n = 0, on = 0; L.cells.forEach(function (c) { n++; if (c.state === "held") { on++; } }); return n ? on / n : 0; }
  function fxOver(L, c) {
    var m = fxMidOf(c), best = null, bd = Infinity;
    L.cells.forEach(function (q) { var d = fxMidOf(q), dd = Math.hypot(d[0] - m[0], d[1] - m[1]); if (d[2] > m[2] && dd < bd) { bd = dd; best = q; } });
    return bd < 2.5 * L.P ? best : null;
  }
  function fxGoes(F, it, U) {
    if (it.tree) { var tr = FX_TREES[it.node.kind]; return U >= tr[0] + tr[1] * it.hash; }
    if (it.built) { return U >= (FX_STRONGEST + 14 * it.hash) * 0.8; }          // (near the ground the wind is about four fifths of its 10 m speed)
    var P = F.plan.P, d = it.dims || (it.dims = fxDims(it.box, P)), m = it.m || (it.m = fxMassOf(F, it, d)), k = it.node ? it.node.kind : "";
    var q = 0.5 * FX_RHO * U * U, drag = q * (FX_CD[k] || 1.05) * Math.max(d[0], d[1]) * d[2], lift = q * (FX_LIFT[k] || 0.15) * d[0] * d[1];
    // (a fence, or its gate: held by a post every couple of metres along it)
    var wgt = m * FX_G, hold = k === "i_fence" || k === "i_gate" ? 900 * Math.max(d[0], d[1]) : FX_HOLD[k] || 0;
    if (lift > wgt + hold) { return true; }
    var rest = Math.max(0, wgt - lift), slide = 0.55 * rest, tip = rest * Math.min(d[0], d[1]) / 2 / Math.max(0.1, d[2] / 2);
    return drag > hold + Math.min(slide, tip);
  }
  // what has happened, for the words under the storm test
  function fxSeen(F) {
    var L = F.plan, s = F.seen, n = 0, gone = 0, cells = 0, cg = 0;
    L.panels.forEach(function (p) { n++; if (p.state !== "held") { gone++; } });
    L.cells.forEach(function (c) { cells++; if (c.state !== "held") { cg++; } });
    // (lifted off by the wind; fallen in, under snow or with the walls under it)
    if (cells && cg / cells >= (F.kind === "snow" ? 0.05 : 0.15)) { s[fxWindy(F) ? "roof" : "cave"] = true; }
    if (F.kind === "flood" && fxWater(F) > L.slab / L.P + 0.02) { s.wet = true; }
    if (F.kind === "hail" && F.t > 3) { if (L.gives.cover) { s.cover = true; } if (L.gives.solar) { s.solar = true; } }
    if (n && gone / n >= 0.15) { s.walls = true; }
    var hb = L.house.body;
    if (hb) {
      var moved = Math.hypot(hb.x[0] - hb.start[0], hb.x[1] - hb.start[1]), up = hb.x[2] - hb.start[2];
      F.rose = Math.max(F.rose || 0, up); F.went = Math.max(F.went || 0, moved);
      if (up > 1.5 || moved > 12) { s[F.kind === "flood" ? "float" : "flew"] = true; }
      else if (moved > 0.3) { s.slid = true; }
      if (hb.broke) { s.walls = true; }
    }
    if (!s.yard) {
      s.yard = F.free.some(function (b) { return b.it.out && Math.hypot(b.x[0] - b.start[0], b.x[1] - b.start[1]) > 1; });
    }
    if (smHold("saferoom") && (s.walls || s.flew || s.slid)) { s.safe = true; }
    if (fxWindy(F) && L.house.state !== "held" && (F.peak || 0) >= FX_STRONGEST && L.split) { s.bare = true; }
    if (F.swept && F.swept.size) { s.trees = true; }
  }
  function fxSaid() {
    if (!fxOn()) { return ""; }
    var e = FX.seen, list = [];
    ["windows", "roof", "cave", "cover", "solar", "chimney", "walls", "slid", "flew", "float", "wet", "shelves", "bare", "trees", "yard", "safe"].forEach(function (k) {
      if (e[k] && !(k === "slid" && (e.flew || e.float))) { list.push(TXT["sm_ev_" + k]); }
    });
    // (a tall building: how far its top swings, and how much larger it is drawn)
    if (FX.sway) {
      var feet = typeof feetHere === "function" && feetHere();
      list.push(say("sm_ev_sway", { move: feet ? Math.round(FX.sway.cm / 2.54) + " in" : FX.sway.cm + " cm", times: FX.sway.times }));
    }
    return say("sm_seen", { what: list.length ? list.join(" · ") : TXT.sm_ev_none });
  }
  function fxTell(F) {
    var s = fxSaid();
    if (s === F.said) { return; }
    F.said = s;
    Array.prototype.forEach.call(document.querySelectorAll(".sm-seen"), function (e) { e.textContent = s; });
  }

  // ---- moved: each body a step at a time ----------------------------------------------------------
  // the ground where a body comes down: the land, and the slab where the house stood
  function fxFloor(F, x, y, b) {
    var L = F.plan, g = b ? b.terr : fxLand(x, y);
    for (var i = 0; i < L.foot.length; i++) {
      var r = L.foot[i];
      if (x >= r[0] && x <= r[1] && y >= r[2] && y <= r[3]) { return Math.max(g, L.slab / L.P); }
    }
    return g;
  }
  // past the ground the picture draws round the house (38-view3d-gl.js: it fades out from 0.72 of the way)
  function fxPast(x, y) {
    var G = typeof V3 !== "undefined" && V3 ? V3.gl : null, s = G && G.scenery;
    if (!s || !s.mid || !s.groundR) { return false; }
    return Math.hypot(x * FLOOR_PX - s.mid[0], y * FLOOR_PX - s.mid[1]) > s.groundR * 0.7;
  }
  function fxLand(x, y) {
    try { return typeof terrGround === "function" ? terrGround(x * FLOOR_PX, y * FLOOR_PX) / FLOOR_PX : 0; } catch (e) { return 0; }
  }
  function fxStep(F, dt) {
    var L = F.plan;
    F.t += dt;
    F.check += dt;
    if (F.check >= 0.05) { F.check = 0; F.tt = F.t; fxChecks(F); }
    var n = Math.max(1, Math.ceil(dt / FX_DT - 1e-6)), h = dt / n, live = F.free.filter(function (b) { return b.awake && b.it.state !== "gone"; });
    live.forEach(function (b) { b.terr = fxLand(b.x[0], b.x[1]); b.gz = b.terr; b.hit = 0; });
    for (var s = 0; s < n; s++) {
      F.tt = F.t - dt + (s + 1) * h;
      for (var i = 0; i < live.length; i++) { fxBody(F, live[i], h); }
    }
    F.tt = F.t;
    live.forEach(function (b) {
      var P = L.P, it = b.it;
      b.T.x[0] = b.x[0] * P; b.T.x[1] = b.x[1] * P; b.T.x[2] = b.x[2] * P; b.T.ver++;
      // gone off over the land -- or come down past where the land is drawn
      if (Math.hypot(b.x[0] - F.H[0], b.x[1] - F.H[1]) > FX_FAR || b.x[2] > 400) { it.state = "gone"; return; }
      if ((b.touch || b.x[2] - b.gz < 1.5) && fxPast(b.x[0], b.x[1])) { it.state = "gone"; return; }
      // come down hard, or rolled right over: what it carried comes apart
      var held = it.kids.filter(function (k) { return k.state === "held"; });
      if (held.length && (b.hit > 6 || (b.touch && b.R[8] < 0.35))) {
        b.broke = true;
        held.forEach(function (k) {
          if (k.kind === "small" || k.kind === "glass") { return; }
          var r = F.rnd;
          fxLoose(F, k, [(r() - 0.5) * 4, (r() - 0.5) * 4, 0.5 + r() * 1.5], 0);
        });
        for (var q = 0; q < 8; q++) { fxPlank(F, [b.x[0] * P, b.x[1] * P, b.x[2] * P], b.v); }
      }
      // settled
      if (b.touch && b.v[0] * b.v[0] + b.v[1] * b.v[1] + b.v[2] * b.v[2] < 0.01 && b.w[0] * b.w[0] + b.w[1] * b.w[1] + b.w[2] * b.w[2] < 0.01) {
        b.still += dt;
        if (b.still > 0.5) { b.awake = false; b.v = [0, 0, 0]; b.w = [0, 0, 0]; }
      } else { b.still = 0; }
    });
    F.free = F.free.filter(function (b) { return b.it.state !== "gone"; });
    fxBits(F, dt);
    if (F.t > F.tEnd + 2 && (F.t > F.tEnd + 25 || (!F.free.some(function (b) { return b.awake; }) && !F.bits.some(function (b) { return !b.rest; })))) {
      F.done = true;
    }
  }
  function fxBody(F, b, h) {
    var m = b.m, R = b.R, x = b.x, v = b.v, w = b.w, U = fxWind(F, x[0], x[1], Math.max(0.5, x[2] - b.gz), F.w);
    var fx = 0, fy = 0, fz = -m * FX_G, tx = 0, ty = 0, tz = 0;
    var rx = U[0] - v[0], ry = U[1] - v[1], rz = U[2] - v[2], s = Math.sqrt(rx * rx + ry * ry + rz * rz) + 1e-6, q = 0.5 * FX_RHO * s;
    if (b.n0) {
      // a sheet: pushed across its face, a little along it; pushed nearer the
      // edge the wind comes in at, so turned over and over -- and, spinning, lifted
      var n0 = b.n0, nx = R[0] * n0[0] + R[1] * n0[1] + R[2] * n0[2], ny = R[3] * n0[0] + R[4] * n0[1] + R[5] * n0[2], nz = R[6] * n0[0] + R[7] * n0[1] + R[8] * n0[2];
      var vn = rx * nx + ry * ny + rz * nz, fn = q * 1.2 * b.A * vn;
      var px = rx - vn * nx, py = ry - vn * ny, pz = rz - vn * nz, pl = Math.sqrt(px * px + py * py + pz * pz) + 1e-6;
      fx += fn * nx + q * 0.08 * b.A * px; fy += fn * ny + q * 0.08 * b.A * py; fz += fn * nz + q * 0.08 * b.A * pz;
      var arm = 0.18 * b.size / pl, ax = px * arm, ay = py * arm, az = pz * arm, gx = fn * nx, gy = fn * ny, gz = fn * nz;
      tx += ay * gz - az * gy; ty += az * gx - ax * gz; tz += ax * gy - ay * gx;
      var spin = Math.min(1, Math.sqrt(w[0] * w[0] + w[1] * w[1] + w[2] * w[2]) / 8);
      fz += q * s * 0.3 * b.A * spin;
    } else {
      // a body: as much of it as faces the wind, and a box's lift over it while upright
      var ux = (R[0] * rx + R[3] * ry + R[6] * rz) / s, uy = (R[1] * rx + R[4] * ry + R[7] * rz) / s, uz = (R[2] * rx + R[5] * ry + R[8] * rz) / s, d = b.dims;
      var k = q * b.cd * (Math.abs(ux) * d[1] * d[2] + Math.abs(uy) * d[0] * d[2] + Math.abs(uz) * d[0] * d[1]);
      fx += k * rx; fy += k * ry; fz += k * rz;
      // (a box's lift is the ground's: the wind over it and none under it --
      // up off the ground, the wind goes under too, and it is gone)
      var clear = Math.max(0, x[2] - b.dims[2] / 2 - b.gz);
      fz += 0.5 * FX_RHO * b.cl * d[0] * d[1] * (rx * rx + ry * ry) * Math.max(0, R[8]) * Math.exp(-clear / 3);
    }
    // turned round with the air turning round a tornado's middle
    if (F.kind === "tornado") {
      var o = fxEye(F, F.tt), ex0 = x[0] - o[0], ey0 = x[1] - o[1], rr = Math.sqrt(ex0 * ex0 + ey0 * ey0) + 0.01;
      // (the strongest: what it picks up near its middle carried up into its
      // cloud, and on with it -- not let fall where it was)
      if (F.V >= FX_STRONGEST && m < 3000 && b.it.kind !== "house" && rr < 1.8 * F.Rc) { fz += m * FX_G * 1.6 * (1 - rr / (1.8 * F.Rc)) * fxRamp(F, F.tt); }
      var spinNow = -F.Vr * (rr < F.Rc ? 1 / F.Rc : F.Rc / (rr * rr)) * fxRamp(F, F.tt);
      tz += b.I * (spinNow - w[2]) * 0.8;
    }
    // the ground shaking under it: seen from the ground, thrown the other way
    if (F.kind === "quake") { var ag = fxShake(F, F.tt, F.ag || (F.ag = [0, 0])); fx -= m * ag[0]; fy -= m * ag[1]; }
    // the water: holding it up as far as it is in it, carrying it along, slowing it
    if (F.kind === "flood") {
      var zw = fxWater(F), lo = Infinity, hi = -Infinity;
      for (var hi0 = 0; hi0 < b.hull.length; hi0++) {
        var hp0 = b.hull[hi0], hz = x[2] + R[6] * hp0[0] + R[7] * hp0[1] + R[8] * hp0[2];
        if (hz < lo) { lo = hz; } if (hz > hi) { hi = hz; }
      }
      if (zw > lo) {
        var dd = b.dims, sub = Math.min(1, (zw - lo) / Math.max(0.1, hi - lo));
        var lift = b.it.kind === "house" ? 1000 * FX_G * dd[0] * dd[1] * Math.min(zw - lo, 0.45) * 0.58 : 1000 * FX_G * dd[0] * dd[1] * dd[2] * 0.35 * sub;
        var fl = F.flow, cur = (F.V >= 2.5 ? 3 : 1.5) * Math.min(1, fxLevel(F) / Math.max(0.1, F.V)), wx = fl[0] * cur - v[0], wy = fl[1] * cur - v[1], wl = Math.sqrt(wx * wx + wy * wy);
        var side = Math.max(dd[0], dd[1]) * Math.min(dd[2], zw - lo) * 500;
        fz += lift - 500 * dd[0] * dd[1] * Math.abs(v[2]) * v[2] * sub;
        fx += side * wl * wx; fy += side * wl * wy;
        tx -= b.I * w[0] * 2 * sub; ty -= b.I * w[1] * 2 * sub; tz -= b.I * w[2] * 2 * sub;
      }
    }
    // (just let go: the wind over the roof it was part of still pulling it up)
    if (b.pop > 0) { fz += q * s * 0.9 * (b.A || b.dims[0] * b.dims[1]); b.pop -= h; }
    // the gusts turning it (a big thing less, and less still on the ground), the air slowing its turning
    var I = b.I, tw = I * s / b.size * 0.5 / (1 + b.size / 3) * (b.touch ? 0.3 : 1), t = F.tt, ph = b.ph;
    tx += tw * Math.sin(t * 1.7 + ph); ty += tw * Math.sin(t * 2.3 + ph * 2.1); tz += tw * 0.6 * Math.sin(t * 1.1 + ph * 3.3);
    var damp = I * (0.4 + 0.03 * s);
    tx -= damp * w[0]; ty -= damp * w[1]; tz -= damp * w[2];
    // the ground under each corner
    var touch = false, kk = m * FX_K / 4, cc = m * Math.sqrt(FX_K) / 4, hull = b.hull;
    for (var i = 0; i < hull.length; i++) {
      var hp = hull[i], qx = R[0] * hp[0] + R[1] * hp[1] + R[2] * hp[2], qy = R[3] * hp[0] + R[4] * hp[1] + R[5] * hp[2], qz = R[6] * hp[0] + R[7] * hp[1] + R[8] * hp[2];
      var dep = fxFloor(F, x[0] + qx, x[1] + qy, b) - (x[2] + qz);
      if (dep <= 0) { continue; }
      touch = true;
      var vpx = v[0] + w[1] * qz - w[2] * qy, vpy = v[1] + w[2] * qx - w[0] * qz, vpz = v[2] + w[0] * qy - w[1] * qx;
      if (-vpz > b.hit) { b.hit = -vpz; }
      var Fn = kk * Math.min(dep, 0.5) - cc * vpz;
      if (Fn < 0) { Fn = 0; }
      var vt = Math.sqrt(vpx * vpx + vpy * vpy), Ft = vt > 1e-4 ? Math.min(b.mu * Fn, vt * m * 25 / 4) / vt : 0, cfx = -vpx * Ft, cfy = -vpy * Ft;
      fx += cfx; fy += cfy; fz += Fn;
      tx += qy * Fn - qz * cfy; ty += qz * cfx - qx * Fn; tz += qx * cfy - qy * cfx;
    }
    b.touch = touch;
    v[0] += fx / m * h; v[1] += fy / m * h; v[2] += fz / m * h;
    w[0] += tx / I * h; w[1] += ty / I * h; w[2] += tz / I * h;
    var sv = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (sv > 160) { v[0] *= 160 / sv; v[1] *= 160 / sv; v[2] *= 160 / sv; }
    var sw = Math.sqrt(w[0] * w[0] + w[1] * w[1] + w[2] * w[2]), cap = touch ? 12 : 25;
    if (sw > cap) { w[0] *= cap / sw; w[1] *= cap / sw; w[2] *= cap / sw; }
    if (touch) { var rr = Math.max(0, 1 - 3 * h); w[0] *= rr; w[1] *= rr; w[2] *= rr; }
    x[0] += v[0] * h; x[1] += v[1] * h; x[2] += v[2] * h;
    var ex = w[0] * h, ey = w[1] * h, ez = w[2] * h;
    for (var c = 0; c < 3; c++) {
      var a0 = R[c], a1 = R[3 + c], a2 = R[6 + c];
      R[c] = a0 + (ey * a2 - ez * a1); R[3 + c] = a1 + (ez * a0 - ex * a2); R[6 + c] = a2 + (ex * a1 - ey * a0);
    }
    fxOrtho(R);
  }
  function fxOrtho(R) {
    var ax = R[0], ay = R[3], az = R[6], l = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
    ax /= l; ay /= l; az /= l;
    var bx = R[1], by = R[4], bz = R[7], d = ax * bx + ay * by + az * bz;
    bx -= d * ax; by -= d * ay; bz -= d * az;
    l = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
    bx /= l; by /= l; bz /= l;
    R[0] = ax; R[3] = ay; R[6] = az; R[1] = bx; R[4] = by; R[7] = bz;
    R[2] = ay * bz - az * by; R[5] = az * bx - ax * bz; R[8] = ax * by - ay * bx;
  }

  // ---- bits: shingles, glass, leaves, splinters, the dust round the funnel ------------------------
  var FX_SHINGLE = { piece: true, color: "#4a4643", edge: "#2f2c2a", bare: true };
  var FX_GLASS = { piece: true, color: "#d4e6ee", edge: "#9fb6c4", bare: true, alpha: 0.7, late: true };
  var FX_LEAF = { piece: true, color: "#5b7a3a", edge: "#3f5728", bare: true };
  var FX_LEAF2 = { piece: true, color: "#8a6a3a", edge: "#5e4826", bare: true };
  var FX_WOOD = { piece: true, color: "#b8925e", edge: "#7d6240", bare: true, pat: 21 };
  var FX_DUST = { piece: true, color: "#6f5f4b", edge: "#5a4c3c", bare: true };
  var FX_HAIL = { piece: true, color: "#f2f5f8", edge: "#cfd8df", bare: true };
  var FX_SLAB = { piece: true, color: "#a9a69e", edge: "#86837c", pat: 10, bare: true };
  var FX_BARK = { piece: true, color: "#5c4632", edge: "#3b2c1f", pat: 11 };
  var FX_CROWN = { piece: true, color: "#3f6a2e", edge: "#2b4a20", pat: 8 };
  // A tree torn out: its leaves and its branches thrown, and -- one
  // standing in the land round about (fxSwept) -- the tree itself, trunk
  // and crown, thrown with them.
  function fxTorn(F, at, big) {
    var r = F.rnd, P = FLOOR_PX;
    for (var i = 0; i < (big ? 18 : 8); i++) { fxBit(F, [at[0] + (r() - 0.5) * 2 * P, at[1] + (r() - 0.5) * 2 * P, at[2] + r() * 3 * P], [0, 0, 1 + r() * 3], "leaf"); }
    for (var j = 0; j < (big ? 3 : 1); j++) { fxPlank(F, at, [0, 0, 0]); }
  }
  function fxTornFree(F, at) {
    if ((F.trunks = (F.trunks || 0) + 1) > 14) { return; }
    var P = FLOOR_PX, g = fxLand(at[0] / P, at[1] / P) * P, own = [], it = fxItem(F, "tr" + F.trunks, "debris", null);
    function ring(r, n) { var o = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; o.push([at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r]); } return o; }
    v3Prism(own, ring(0.2 * P, 6), g, g + 5.2 * P, FX_BARK);
    v3Prism(own, ring(1.8 * P, 8), g + 3.8 * P, g + 7.4 * P, FX_CROWN);
    it.own = own; it.mass = 700;
    own.forEach(function (f) { fxGrow(it, f); });
    var w = fxWind(F, at[0] / P, at[1] / P, 5, [0, 0, 0]);
    fxLoose(F, it, [w[0] * 0.15, w[1] * 0.15, 1.5], 0);
    fxTorn(F, [at[0], at[1], g + 4 * P], true);
  }
  // Whether the wind has been strong enough where a tree of the land round
  // about stands to have torn it out by now: the strongest it has been
  // there -- the tornado as near as it has come yet, or the gusts so far.
  // the trees of the land round about (39-world.js, 40-plants.js), and what grows low
  var FX_LAND_TREES = { broad: 1, fir: 1, birch: 1, palm: 1, oak: 1, maple: 1, spruce: 1, redwood: 1, poplar: 1, willow: 1, cypress: 1,
                        fruit: 1, pine: 1, bamboo: 1, banana: 1, joshua: 1, snag: 1 };
  var FX_LAND_LOW = { bush: 1, flowering: 1, box: 1, agave: 1, fern: 1, dry: 1, dune: 1, grass: 1, flowers: 1, reeds: 1 };
  function fxSwept(at, more) {
    if (!fxOn() || !fxWindy(FX) || !FX.plan || FX.V < 44) { return false; }
    var F = FX, P = FLOOR_PX, x = at[0] / P, y = at[1] / P, h = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1, need = 44 + 22 * h + (more || 0), most;
    if (F.kind === "tornado") {
      var s0 = fxEye(F, 0), dx = x - s0[0], dy = y - s0[1], along = dx * F.go[0] + dy * F.go[1];
      var across = Math.abs(dx * F.go[1] - dy * F.go[0]), now = F.Vt * Math.min(F.t, F.tEnd);
      var near = Math.max(F.Rc, now >= along ? across : Math.hypot(across, along - now));
      most = F.Vr * F.Rc / near + F.Vt * Math.exp(-Math.pow(near / (3 * F.Rc), 2));
    } else {
      // (a wind from one side snaps and fells trees, not all at once: some stand)
      most = (F.peak || 0) * 0.92; need = 50 + 30 * h + (more || 0);
    }
    return most >= need;
  }
  // (the land round about drawn again as the tornado goes on, now and then)
  // -- only once a few more of what stands there would go (the land is
  // a while drawing): what it grows, as it was last drawn, counted
  function fxSweptKey() {
    if (!fxOn() || !fxWindy(FX) || !FX.plan || FX.V < 44) { return ""; }
    var F = FX;
    if (!F.plants) { return "|sw0"; }
    if (F.keyAt !== undefined && F.t - F.keyAt < 0.4 && !F.done) { return F.key; }
    var n = 0;
    F.plants.forEach(function (p) { if (fxSwept(p.at, p.more)) { n++; } });
    F.keyAt = F.t;
    F.key = "|sw" + (F.done || F.t > F.tEnd ? n : Math.floor(n / 6));
    return F.key;
  }
  function fxBit(F, p, v, kind) {
    var r = F.rnd, P = FLOOR_PX, hs = F.kind === "hail" ? Math.max(0.04, F.V / 100) : 0.05;
    var look = { shingle: [0.36, 0.24, 0.15, FX_SHINGLE], glass: [0.12, 0.09, 0.25, FX_GLASS], leaf: [0.09, 0.07, 2.2, r() < 0.6 ? FX_LEAF : FX_LEAF2],
               plank: [1.3, 0.12, 0.06, FX_WOOD], hail: [hs, hs, 0.004, FX_HAIL] }[kind];
    if (F.bits.length > 700) {
      // (the oldest come to rest make room)
      var at = F.bits.findIndex(function (b) { return b.rest; });
      if (at < 0) { return; }
      F.bits.splice(at, 1);
    }
    if (kind === "shingle" && F.shingle) { look[3] = F.shingle; }
    F.bits.push({ x: p[0] / P, y: p[1] / P, z: p[2] / P, vx: v[0], vy: v[1], vz: v[2], w: look[0], h: look[1], c: look[2], how: look[3],
                  a: r() * 6.28, b: r() * 6.28, sa: (r() - 0.5) * 14, sb: (r() - 0.5) * 10, rest: false, kind: kind, life: kind === "leaf" ? 9 : kind === "hail" ? 14 : Infinity });
  }
  function fxShingle(F, at, burst) {
    var r = F.rnd, w = fxWind(F, at[0] / FLOOR_PX, at[1] / FLOOR_PX, 6, [0, 0, 0]);
    fxBit(F, [at[0] + (r() - 0.5) * 60, at[1] + (r() - 0.5) * 60, at[2] + 5], [w[0] * 0.3 + (r() - 0.5) * 3, w[1] * 0.3 + (r() - 0.5) * 3, 2 + r() * (burst ? 5 : 3)], "shingle");
  }
  function fxShard(F, at) {
    var r = F.rnd, w = fxWind(F, at[0] / FLOOR_PX, at[1] / FLOOR_PX, 3, [0, 0, 0]);
    fxBit(F, at, [w[0] * 0.2 + (r() - 0.5) * 5, w[1] * 0.2 + (r() - 0.5) * 5, r() * 3], "glass");
  }
  function fxPlank(F, at, v) {
    var r = F.rnd;
    fxBit(F, [at[0] + (r() - 0.5) * 150, at[1] + (r() - 0.5) * 150, at[2] + r() * 80], [v[0] + (r() - 0.5) * 6, v[1] + (r() - 0.5) * 6, v[2] + r() * 4], "plank");
  }
  function fxBits(F, dt) {
    var L = F.plan, r = F.rnd, P = L.P, U = [0, 0, 0], Uh = fxWindy(F) ? fxNom(F, F.H[0], F.H[1]) : 0;
    // hailstones: falling hard and slanting, bouncing, lying white where they land
    if (F.kind === "hail" && fxLevel(F) > 0) {
      F.hlAcc = (F.hlAcc || 0) + dt * 90;
      while (F.hlAcc >= 1) {
        F.hlAcc -= 1;
        var ha = r() * 6.28, hd = Math.sqrt(r()) * 34, vf = 9 * Math.sqrt(F.V) + 6;
        fxBit(F, [(F.H[0] + Math.cos(ha) * hd) * P, (F.H[1] + Math.sin(ha) * hd) * P, 30 * P], [F.dir[0] * 6, F.dir[1] * 6, -vf], "hail");
      }
    }
    // shingles off the roof still on, the harder the more
    if (L.spots.length && Uh > 30 && F.t < F.tEnd) {
      F.shAcc += dt * Math.min(30, (Uh - 30) * 0.8);
      while (F.shAcc >= 1) { F.shAcc -= 1; var sp = L.spots[Math.floor(r() * L.spots.length)]; fxShingle(F, sp, false); }
    }
    // leaves torn off and blown through
    if (Uh > 15 && F.t < F.tEnd) {
      F.lfAcc += dt * Math.min(40, (Uh - 15) * 0.9);
      while (F.lfAcc >= 1) {
        F.lfAcc -= 1;
        var ang = r() * 6.28, dd = 10 + r() * 40;
        fxBit(F, [(F.H[0] + Math.cos(ang) * dd) * P, (F.H[1] + Math.sin(ang) * dd) * P, (2 + r() * 10) * P], [0, 0, 0], "leaf");
      }
    }
    var keep = [];
    for (var i = 0; i < F.bits.length; i++) {
      var b = F.bits[i];
      b.life -= dt;
      if (b.life <= 0) { continue; }
      if (!b.rest) {
        var g = fxFloor(F, b.x, b.y, null);
        fxWind(F, b.x, b.y, Math.max(0.5, b.z - g), U);
        var rx = U[0] - b.vx, ry = U[1] - b.vy, rz = U[2] - b.vz, s = Math.sqrt(rx * rx + ry * ry + rz * rz), k = 1 - Math.exp(-b.c * s * dt);
        b.vx += rx * k + (r() - 0.5) * s * 0.02; b.vy += ry * k + (r() - 0.5) * s * 0.02; b.vz += rz * k - FX_G * dt;
        b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
        b.a += b.sa * dt; b.b += b.sb * dt;
        if (b.z <= g + 0.02) {
          if (s > 38 && r() < 0.5) { b.z = g + 0.05; b.vz = Math.abs(b.vz) * 0.3 + 1; }
          else { b.z = g + 0.02; b.rest = true; b.vx = b.vy = b.vz = 0; b.b = 0.04 * (r() - 0.5); b.face = null; }
          if (b.rest && fxPast(b.x, b.y)) { continue; }
        }
        if (Math.hypot(b.x - F.H[0], b.y - F.H[1]) > FX_FAR || b.z > 400) { continue; }
      }
      keep.push(b);
    }
    F.bits = keep;
    // the dust and the bits whirled round the foot of the funnel
    if (F.kind === "tornado") {
      if (!F.dust.length) { for (var j = 0; j < 150; j++) { F.dust.push({ a: r() * 6.28, d: 0.3 + r() * 0.95, z: r() * 40, up: 2 + r() * 7, s: 0.3 + r() * 0.5 }); } }
      F.dust.forEach(function (q) {
        var rr = q.d * F.Rc, vt = F.Vr * (rr < F.Rc ? rr / F.Rc : F.Rc / rr) * fxRamp(F, F.t);
        q.a -= vt / Math.max(1, rr) * dt * 0.6;
        q.z += q.up * dt;
        if (q.z > 45) { q.z = 0; q.d = 0.3 + r() * 0.95; }
      });
    }
  }
  function fxBitFace(b, P) {
    if (b.rest && b.face) { return b.face; }
    var ca = Math.cos(b.a), sa = Math.sin(b.a), cb = Math.cos(b.b), sb = Math.sin(b.b);
    var e1 = [ca * cb, sa * cb, sb], e2 = [-sa, ca, 0], n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    var x = b.x * P, y = b.y * P, z = b.z * P, hw = b.w * P / 2, hh = b.h * P / 2;
    var face = { pts: [[x - e1[0] * hw - e2[0] * hh, y - e1[1] * hw - e2[1] * hh, z - e1[2] * hw - e2[2] * hh],
                       [x + e1[0] * hw - e2[0] * hh, y + e1[1] * hw - e2[1] * hh, z + e1[2] * hw - e2[2] * hh],
                       [x + e1[0] * hw + e2[0] * hh, y + e1[1] * hw + e2[1] * hh, z + e1[2] * hw + e2[2] * hh],
                       [x - e1[0] * hw + e2[0] * hh, y - e1[1] * hw + e2[1] * hh, z - e1[2] * hw + e2[2] * hh]], n: n, how: b.how };
    if (b.rest) { face.src = b; b.face = face; }
    return face;
  }

  // ---- the funnel ----------------------------------------------------------------------------------
  // A cone of cloud, narrow at the ground, wide where it joins the cloud
  // over it, leaning the way it goes and swaying; bands turning round it the
  // way the wind turns; a skirt of dust and what it has picked up at its foot.
  function fxMixHex(a, b, k) {
    var p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16), out = "#";
    [16, 8, 0].forEach(function (s) { var v = Math.round(((p >> s) & 255) * (1 - k) + ((q >> s) & 255) * k); out += (v < 16 ? "0" : "") + v.toString(16); });
    return out;
  }
  function fxFunnel(F, out) {
    if (F.kind !== "tornado") { return; }
    var P = FLOOR_PX, t = F.t, o = fxEye(F, t), Rc = F.Rc, H = 170;
    var fade = Math.min(1, Math.max(0, (F.tEnd + 3 - t) / 6)) * Math.min(1, t / 1.2 + 0.2);
    if (fade <= 0.02) { return; }
    var zs = [0, 3, 8, 16, 28, 44, 64, 90, 125, 170], S = 22, spin = -t * F.Vr / Rc * 0.35, g0 = fxLand(o[0], o[1]);
    H = 170;
    function ring(z, wide) {
      var k = z / H;
      return { r: Rc * wide * (0.62 + 0.4 * Math.pow(k, 1.2) + 0.9 * Math.pow(k, 3)), x: o[0] + F.go[0] * z * 0.2 + Math.sin(t * 0.6 + z * 0.02) * 2.5,
               y: o[1] + F.go[1] * z * 0.2 + Math.cos(t * 0.5 + z * 0.017) * 2.5, z: g0 + z };
    }
    // the cloud round it, and a darker core of dust and what it carries, turning faster, in its lower part
    // (lumpy, not a smooth cone: each corner out or in by the turning cloud)
    function at(R, a, z) {
      var lump = 1 + 0.08 * Math.sin(3 * a + z * 0.05 - t * 1.5) + 0.05 * Math.sin(7 * a - z * 0.08 + t);
      return [(R.x + Math.cos(a) * R.r * lump) * P, (R.y + Math.sin(a) * R.r * lump) * P, R.z * P];
    }
    [[1, 1, zs.length, 0], [0.55, 1.6, 7, 1]].forEach(function (shell) {
      for (var i = 0; i + 1 < shell[2]; i++) {
        var A = ring(zs[i], shell[0]), Bq = ring(zs[i + 1], shell[0]), km = (zs[i] + zs[i + 1]) / 2 / H;
        var col = shell[3] ? "#3e3a36" : fxMixHex("#4e4a45", "#767a81", Math.min(1, km * 1.4));
        // (thinning out to nothing at its top: no rim)
        var thin = shell[3] ? 0.32 * Math.max(0, 1 - km / 0.38) : (0.52 - 0.3 * km) * Math.min(1, (1 - km) * 2.5);
        for (var j = 0; j < S; j++) {
          var sp = spin * shell[1], t0 = j / S * Math.PI * 2 + sp, t1 = (j + 1) / S * Math.PI * 2 + sp, tm = (t0 + t1) / 2;
          var band = 0.75 + 0.25 * Math.sin(j * Math.PI * 6 / S + zs[i] * 0.04 - t * 0.8), a = fade * band * thin;
          if (a <= 0.02) { continue; }
          out.push({ pts: [at(A, t0, zs[i]), at(A, t1, zs[i]), at(Bq, t1, zs[i + 1]), at(Bq, t0, zs[i + 1])],
                     n: [Math.cos(tm), Math.sin(tm), 0], how: { piece: true, color: col, edge: col, alpha: a, late: true, bare: true } });
        }
      }
    });
    // the skirt of dust at its foot
    for (var q = 0; q < S; q++) {
      var s0 = q / S * Math.PI * 2 + spin * 1.3, s1 = (q + 1) / S * Math.PI * 2 + spin * 1.3, r0 = Rc * 0.95, r1 = Rc * 1.2, sm = (s0 + s1) / 2;
      out.push({ pts: [[(o[0] + Math.cos(s0) * r0) * P, (o[1] + Math.sin(s0) * r0) * P, g0 * P], [(o[0] + Math.cos(s1) * r0) * P, (o[1] + Math.sin(s1) * r0) * P, g0 * P],
                       [(o[0] + Math.cos(s1) * r1) * P, (o[1] + Math.sin(s1) * r1) * P, (g0 + 16) * P], [(o[0] + Math.cos(s0) * r1) * P, (o[1] + Math.sin(s0) * r1) * P, (g0 + 16) * P]],
                 n: [Math.cos(sm), Math.sin(sm), 0.3], how: { piece: true, color: "#7a6a55", edge: "#5a4c3c", alpha: fade * (0.18 + 0.08 * Math.sin(q * 1.7)), late: true, bare: true } });
    }
    F.dust.forEach(function (d) {
      var rr = d.d * Rc, x = o[0] + Math.cos(d.a) * rr, y = o[1] + Math.sin(d.a) * rr;
      out.push(fxBitFace({ x: x, y: y, z: g0 + d.z, w: d.s, h: d.s * 0.7, a: d.a * 3, b: d.a * 2, how: FX_DUST }, P));
    });
  }
  // A tall building in the wind: its outline bent the way the wind pushes
  // it, more the higher up -- as far as the storm test works out (40-storm.js),
  // with the gusts, swinging at its own pace (about 46/H a second) less with
  // a damper; drawn so many times larger, as an engineer draws it, to be seen.
  function fxSway(F, out) {
    var T = F.T, B = T && T.B, L = F.plan;
    if (!B || !B.tall || !L.rooms.length) { F.sway = null; return; }
    var P = FLOOR_PX, stiff = 1 + (smHold("brace") ? 0.35 : 0) + (smHold("outrigger") ? 0.6 : 0), drift = 0.0024 * F.V * F.V / 1600 / stiff;
    var H = Math.max(10, B.H), U = fxNom(F, F.H[0], F.H[1]), k = U / F.V, swing = smHold("damper") ? 0.16 : 0.32;
    var move = drift * H * k * k * (1 + swing * Math.sin(2 * Math.PI * 46 / H * F.t)), times = Math.max(5, Math.round(0.04 / drift / 5) * 5);
    F.sway = { cm: Math.round(drift * H * (1 + swing) * 100), times: times };
    var w = fxWind(F, F.H[0], F.H[1], 10, [0, 0, 0]), wl = Math.hypot(w[0], w[1]) || 1, dir = [w[0] / wl, w[1] / wl];
    var b = [Infinity, -Infinity, Infinity, -Infinity];
    L.rooms.forEach(function (r) { if (r.level === 0) { b[0] = Math.min(b[0], r.box[0]); b[1] = Math.max(b[1], r.box[1]); b[2] = Math.min(b[2], r.box[2]); b[3] = Math.max(b[3], r.box[3]); } });
    if (b[0] === Infinity) { return; }
    var z0 = L.slab, z1 = L.top, n = 10, how = { piece: true, color: "#e08a3a", edge: "#b0682a", alpha: 0.16, late: true };
    function at(x, y, z) { var s = move * times * Math.pow(Math.max(0, (z - z0) / (z1 - z0)), 1.5) * P; return [x + dir[0] * s, y + dir[1] * s, z]; }
    [[b[0], b[2], b[1], b[2], [0, -1]], [b[1], b[2], b[1], b[3], [1, 0]], [b[1], b[3], b[0], b[3], [0, 1]], [b[0], b[3], b[0], b[2], [-1, 0]]].forEach(function (s) {
      for (var i = 0; i < n; i++) {
        var za = z0 + (z1 - z0) * i / n, zb = z0 + (z1 - z0) * (i + 1) / n;
        out.push({ pts: [at(s[0], s[1], za), at(s[2], s[3], za), at(s[2], s[3], zb), at(s[0], s[1], zb)], n: [s[4][0], s[4][1], 0], how: how });
      }
    });
    out.push({ pts: [at(b[0], b[2], z1), at(b[1], b[2], z1), at(b[1], b[3], z1), at(b[0], b[3], z1)], n: [0, 0, 1], how: how });
  }
  // The water over the land: as far as the land is drawn, rising and going down again.
  function fxFlood(F, out) {
    if (F.kind !== "flood") { return; }
    var P = FLOOR_PX, zw = fxWater(F), G = V3 && V3.gl, s = G && G.scenery, mid = s && s.mid ? s.mid : [F.H[0] * P, F.H[1] * P];
    var R = s && s.groundR ? s.groundR * 0.74 : 140 * P, pts = [];
    if (zw - F.ground < 0.02) { return; }
    for (var i = 0; i < 40; i++) { var a = -i / 40 * Math.PI * 2; pts.push([mid[0] + Math.cos(a) * R, mid[1] + Math.sin(a) * R, zw * P]); }
    out.push({ pts: pts, n: [0, 0, 1], how: { piece: true, color: "#5d8aa3", edge: "#5d8aa3", alpha: 0.62, late: true, bare: true, pat: PAT.water } });
  }
  // The safe room, still standing where the house was: concrete, a steel door.
  function fxSafe(F, out) {
    if (!F.seen.safe) { return; }
    var L = F.plan, P = L.P, c = L.safeAt, h = 1.1 * P, z0 = L.slab, z1 = L.slab + 2.3 * P;
    v3Prism(out, [[c[0] - h, c[1] - h], [c[0] + h, c[1] - h], [c[0] + h, c[1] + h], [c[0] - h, c[1] + h]], z0, z1,
            { piece: true, color: "#a9a69e", edge: "#77746d", pat: PAT.concrete });
    v3Prism(out, [[c[0] - 0.45 * P, c[1] + h], [c[0] + 0.45 * P, c[1] + h], [c[0] + 0.45 * P, c[1] + h + 0.04 * P], [c[0] - 0.45 * P, c[1] + h + 0.04 * P]],
            z0, z0 + 2.0 * P, { piece: true, color: "#5c6166", edge: "#3d4146" });
  }

  // ---- the picture: what moved, where it is now ----------------------------------------------------
  function fxMovePts(f, T, from) {
    var R = T.R, c = T.c, x = T.x, src = from || f.pts, pts = new Array(src.length);
    for (var i = 0; i < src.length; i++) {
      var p = src[i], dx = p[0] - c[0], dy = p[1] - c[1], dz = (p[2] || 0) - c[2];
      pts[i] = [R[0] * dx + R[1] * dy + R[2] * dz + x[0], R[3] * dx + R[4] * dy + R[5] * dz + x[1], R[6] * dx + R[7] * dy + R[8] * dz + x[2]];
    }
    var n = f.n || [0, 0, 1], g = Object.assign({}, f, { pts: pts, fxRest: f,
      n: [R[0] * n[0] + R[1] * n[1] + R[2] * n[2], R[3] * n[0] + R[4] * n[1] + R[5] * n[2], R[6] * n[0] + R[7] * n[1] + R[8] * n[2]] });
    delete g.src; delete g.clipRound;
    return g;
  }
  function fxMoveMesh(f, T) {
    var W = fxMeshWorld(f), R = T.R, c = T.c, x = T.x, count = W.p.length, p = new Float32Array(count), n = new Float32Array(count);
    for (var i = 0; i < count; i += 3) {
      var dx = W.p[i] - c[0], dy = W.p[i + 1] - c[1], dz = W.p[i + 2] - c[2], a = W.n[i], b = W.n[i + 1], e = W.n[i + 2];
      p[i] = R[0] * dx + R[1] * dy + R[2] * dz + x[0]; p[i + 1] = R[3] * dx + R[4] * dy + R[5] * dz + x[1]; p[i + 2] = R[6] * dx + R[7] * dy + R[8] * dz + x[2];
      n[i] = R[0] * a + R[1] * b + R[2] * e; n[i + 1] = R[3] * a + R[4] * b + R[5] * e; n[i + 2] = R[6] * a + R[7] * b + R[8] * e;
    }
    var m = f.mesh;
    return { pts: [[0, 0, 0]], n: f.n, how: f.how, node: f.node, mesh: { p: p, n: n, uv: m.uv, a: m.a, base: [0, 0, 0], xf: [0, 0, 1, 0, 0] } };
  }
  // the same face, moved the same, is the same face (the picture keeps its corners: gl3Faces)
  function fxMovedFace(it, f, T) {
    var key = f.src;
    if (!key) { return f.mesh ? fxMoveMesh(f, T) : fxMovePts(f, T); }
    var made = it.made || (it.made = new WeakMap()), was = made.get(key);
    if (was && was.T === T && was.ver === T.ver) { return was.face; }
    var g = f.mesh ? fxMoveMesh(f, T) : fxMovePts(f, T);
    var proxy = was ? was.proxy : {};
    if (!f.mesh) { g.src = proxy; }
    made.set(key, { T: T, ver: T.ver, face: g, proxy: proxy });
    return g;
  }
  function fxSplitPut(F, f, kind, out, moving) {
    var L = F.plan, s = fxSplit(F, f, kind), any = false;
    for (var i = 0; i < s.parts.length; i++) { if (fxT(s.parts[i].item) !== null) { any = true; break; } }
    if (!any) {
      out.push(f);
      if (kind === "roof" && L.spots.length < 80) { L.spots.push(fxMid(f)); }
      return;
    }
    var bare = Object.assign({}, f.how, { bare: true });
    s.parts.forEach(function (p) {
      var T = fxT(p.item);
      if (T === FX_GONE) { return; }
      if (T === null) {
        // still in place: as itself, without the lines between the pieces
        out.push({ pts: p.pts, n: f.n, how: bare, node: f.node, roof: f.roof });
        if (kind === "roof" && L.spots.length < 80) { L.spots.push(p.mid); }
        return;
      }
      moving.push(fxMovePts(f, T, p.pts));
    });
  }
  function fxPicture(F, model) {
    var L = F.plan, P = L.P, out = [], moving = [], cost = 0;
    L.spots = [];
    for (var i = 0; i < model.faces.length; i++) {
      var f = model.faces[i], it;
      try { it = fxOf(F, f); } catch (e) { it = null; }
      if (it === null || it === undefined) {
        if (F.seen.bare && f.node && f.node.kind === "i_room" && f.how && f.how.floor && L.byId[f.node.id] && L.byId[f.node.id].level === 0) {
          out.push(Object.assign({}, f, { how: FX_SLAB, src: undefined }));
        } else { out.push(f); }
        continue;
      }
      if (it === "roof" || it === "ceil") { fxSplitPut(F, f, it, out, moving); continue; }
      if (it.hide) { continue; }
      var T = fxT(it);
      if (T === null) { out.push(f); continue; }
      if (T === FX_GONE) { continue; }
      var h = f.how || {};
      if (h.ghost || h.decal || it.kind === "small") { continue; }
      if (f.mesh) {
        // carried inside the house: seen only with its roof gone
        if (!it.body && (it.kind === "thing" || it.kind === "fixture") && it.room && !it.room.roofGone) { continue; }
        var nv = f.mesh.p.length / 3;
        if (cost + nv > FX_BUDGET) { continue; }
        cost += nv;
      }
      moving.push(fxMovedFace(it, f, T));
    }
    F.cost = cost;
    // trees torn out of the land round about, flying (fxTornFree)
    F.free.forEach(function (b) {
      if (!b.it.own || b.it.state === "gone") { return; }
      b.it.own.forEach(function (f) { moving.push(fxMovePts(f, b.T)); });
    });
    fxSafe(F, out);
    F.bits.forEach(function (b) { moving.push(fxBitFace(b, P)); });
    fxFunnel(F, moving);
    fxSway(F, moving);
    fxFlood(F, moving);
    // how deep the picture must go, to take in what flies (gl3Above)
    F.span = null;
    if (typeof gl3Depth === "function") {
      var lo = Infinity, hi = -Infinity;
      function see(x, y, z) { var d = gl3Depth([x, y, z]); if (d < lo) { lo = d; } if (d > hi) { hi = d; } }
      F.free.forEach(function (b) {
        var r = b.size * 1.2 * P;
        see(b.T.x[0] - r, b.T.x[1] - r, b.T.x[2] - r); see(b.T.x[0] + r, b.T.x[1] + r, b.T.x[2] + r);
        see(b.T.x[0] - r, b.T.x[1] + r, b.T.x[2] + r); see(b.T.x[0] + r, b.T.x[1] - r, b.T.x[2] - r);
      });
      F.bits.forEach(function (b, k) { if (k % 4 === 0) { see(b.x * P, b.y * P, b.z * P); } });
      if (F.kind === "tornado") {
        var o = fxEye(F, F.t), R = F.Rc * 3 * P;
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { see(o[0] * P + q[0] * R, o[1] * P + q[1] * R, 0); see(o[0] * P + q[0] * R, o[1] * P + q[1] * R, 260 * P); });
      }
      if (lo < hi) { F.span = [lo, hi]; }
    }
    // the names of what has blown away, not left where it stood
    var labels = model.labels, gone = [];
    if (labels && labels.length) {
      var floors = typeof floorsOf === "function" ? floorsOf() : [];
      F.items.forEach(function (it) {
        if (!it.node || it.kind === "house" || (fxT(it) === null && !it.hide)) { return; }
        var fl = floors.length ? floorAt(floors, it.node.x, it.node.y) : null;
        gone.push([it.node.x + (fl ? fl.dx : 0), it.node.y + (fl ? fl.dy : 0)]);
      });
      if (gone.length) {
        labels = labels.filter(function (l) { return l.room || !gone.some(function (g) { return Math.abs(l.x - g[0]) < 0.4 * P && Math.abs(l.y - g[1]) < 0.4 * P; }); });
      }
    }
    var was = model.passing || { faces: [], stand: [] };
    return Object.assign({}, model, { faces: out, labels: labels, passing: { faces: was.faces.concat(moving), stand: was.stand } });
  }

  // ---- wired in --------------------------------------------------------------------------------------
  if (typeof v3Build === "function") {
    var v3BuildFx = v3Build;
    v3Build = function () {
      var F = fxOn() ? FX : null;
      if (F && (F.key !== fxKey() || F.sig !== fxSig())) { fxStart(true); F = FX; }
      if (!F || V3.flat || V3.scene === "space" || (typeof bpSite !== "undefined" && bpSite)) { return v3BuildFx.apply(this, arguments); }
      // (the roof drawn on, the rooms under it built too: it may not stay on)
      var roofV = V3.roofV, open = F.open && (roofV === undefined || roofV >= 0.999) && !(V3.tw && V3.tw.roofV);
      if (open) { V3.roofV = 0.9989; }
      var model;
      try { model = v3BuildFx.apply(this, arguments); } finally { if (open) { V3.roofV = roofV; } }
      if (!model || !model.faces) { return model; }
      try {
        if (open) {
          model.faces.forEach(function (f) { if (f.how && f.how.alpha === 0.9989) { f.how = Object.assign({}, f.how, { alpha: 1, late: false }); } });
        }
        if (!F.plan) {
          fxPlan(F, model);
          var rm = model.faces.filter(function (f) { return f.how && f.how.roof && f.how.room; })[0];
          var mat = rm && typeof houseMat === "function" ? houseMat(rm.how.room, "roof") : null;
          if (mat && mat.color) { F.shingle = { piece: true, color: mat.color, edge: mat.color, bare: true }; }
          if (typeof STILL !== "undefined" && STILL) { fxAtOnce(F); }
        }
        return fxPicture(F, model);
      } catch (e) { return model; }
    };
  }
  // the picture deep enough for the funnel and what flies (38-view3d-gl.js)
  if (typeof gl3Above === "function") {
    var gl3AboveFx = gl3Above;
    gl3Above = function (lo, hi) {
      if (fxOn() && FX.span) { lo = Math.min(lo, FX.span[0] - 40); hi = Math.max(hi, FX.span[1] + 40); }
      return gl3AboveFx.call(this, lo, hi);
    };
  }
  // a wall carried off still painted as the side of the house it was
  if (typeof gl3Outside === "function") {
    var gl3OutsideFx = gl3Outside;
    gl3Outside = function (f, rooms) { return gl3OutsideFx.call(this, f && f.fxRest ? f.fxRest : f, rooms); };
  }
  if (typeof worldPlant === "function") {
    var worldPlantFx = worldPlant;
    worldPlant = function (v, kind, at, rnd, sheetC) {
      var tall = FX_LAND_TREES[kind], low = FX_LAND_LOW[kind];
      // (each, where it grows, for fxSweptKey)
      if ((tall || low) && at && fxOn() && fxWindy(FX) && FX.plan) {
        var pk = Math.round(at[0]) + ":" + Math.round(at[1]);
        if (!FX.plants) { FX.plants = new Map(); }
        if (!FX.plants.has(pk)) { FX.plants.set(pk, { at: [at[0], at[1]], more: low ? 12 : 0 }); }
      }
      if ((tall || low) && at && fxSwept(at, low ? 12 : 0)) {
        // (drawn into nothing, so the land's next trees fall where they always do)
        var out = worldPlantFx.call(this, [], kind, at, rnd, sheetC);
        var F = FX, key = Math.round(at[0]) + ":" + Math.round(at[1]);
        if (!F.swept) { F.swept = new Set(); }
        if (!F.swept.has(key)) {
          F.swept.add(key);
          // (thrown, if it is near enough to be seen going -- a bush, its leaves)
          var near = F.H && Math.hypot(at[0] / FLOOR_PX - F.H[0], at[1] / FLOOR_PX - F.H[1]) < 110;
          if (near && tall) { fxTornFree(F, [at[0], at[1], 0]); } else if (near) { fxTorn(F, [at[0], at[1], fxLand(at[0] / FLOOR_PX, at[1] / FLOOR_PX) * FLOOR_PX + 20], false); }
        }
        return out;
      }
      return worldPlantFx.apply(this, arguments);
    };
  }
  // The street lamps and the power poles: snapped where the wind is
  // stronger still (what is torn out near enough to be seen thrown, as a pole)
  function fxPoleFree(F, at, tall, how) {
    if ((F.poles = (F.poles || 0) + 1) > 8) { return; }
    var P = FLOOR_PX, g = fxLand(at[0] / P, at[1] / P) * P, own = [], it = fxItem(F, "pl" + F.poles, "debris", null), h = 0.08 * P;
    v3Prism(own, [[at[0] - h, at[1] - h], [at[0] + h, at[1] - h], [at[0] + h, at[1] + h], [at[0] - h, at[1] + h]], g, g + tall, how);
    it.own = own; it.mass = 350;
    own.forEach(function (f) { fxGrow(it, f); });
    var w = fxWind(F, at[0] / P, at[1] / P, 5, [0, 0, 0]);
    fxLoose(F, it, [w[0] * 0.1, w[1] * 0.1, 0.5], 0);
  }
  function fxSnapped(at, more, tall, how) {
    if (!fxSwept(at, more)) { return false; }
    var F = FX, key = "p" + Math.round(at[0]) + ":" + Math.round(at[1]);
    if (!F.swept) { F.swept = new Set(); }
    if (!F.swept.has(key)) {
      F.swept.add(key);
      if (F.H && Math.hypot(at[0] / FLOOR_PX - F.H[0], at[1] / FLOOR_PX - F.H[1]) < 110) { fxPoleFree(F, at, tall, how); }
    }
    return true;
  }
  var FX_POST = { piece: true, color: "#3a3d40", edge: "#232527", pat: 22 };
  var FX_POLE = { piece: true, color: "#6b5640", edge: "#4a3b2b" };
  if (typeof worldLamp === "function") {
    var worldLampFx = worldLamp;
    worldLamp = function (v, kind, foot) {
      if (foot && fxSnapped(foot, 18, 4.2 * FLOOR_PX, FX_POST)) { return worldLampFx.apply(this, [[]].concat(Array.prototype.slice.call(arguments, 1))); }
      return worldLampFx.apply(this, arguments);
    };
  }
  if (typeof powerPoles === "function") {
    var powerPolesFx = powerPoles;
    powerPoles = function (F2) {
      var out = powerPolesFx.apply(this, arguments);
      if (!fxOn() || !fxWindy(FX) || !F2 || !F2.world) { return out; }
      return out.filter(function (p) { var w = F2.world(p.lx, p.ly); return !fxSnapped(w, 16, 9 * FLOOR_PX, FX_POLE); });
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyFx = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyFx.apply(this, arguments) + fxSweptKey(); };
  }
  if (typeof weatherNow === "function") {
    var weatherNowFx = weatherNow;
    weatherNow = function () {
      if (FX && typeof V3 !== "undefined" && V3 && V3.storm === FX.storm && FX.box === V3.box) {
        var w = { snow: "snow", flood: "rain", hail: "storm" }[FX.kind];
        if (w) { return w; }
      }
      return weatherNowFx.apply(this, arguments);
    };
  }
  if (typeof smRun === "function") {
    var smRunFx = smRun;
    smRun = function () {
      var out = smRunFx.apply(this, arguments);
      try { fxStart(false); } catch (e) { FX = null; }
      return out;
    };
  }
  // Under the storm test: what has happened so far, and the storm again.
  function fxSection(sheet) {
    if (!V3 || !V3.storm) { return; }
    var row = document.createElement("div");
    row.className = "sm-run";
    var seen = document.createElement("span");
    seen.className = "sm-seen";
    seen.setAttribute("aria-live", "polite");
    seen.textContent = fxSaid();
    var again = document.createElement("button");
    again.type = "button";
    again.className = "btn small";
    again.textContent = TXT.sm_again;
    again.onclick = function () { fxStart(true); if (FX) { FX.said = ""; } seen.textContent = fxSaid(); };
    row.appendChild(seen);
    row.appendChild(again);
    sheet.appendChild(row);
  }
