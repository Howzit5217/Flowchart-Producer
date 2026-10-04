// ---------------------------------------------------------------------------
//  40-wildfire.js -- a wildfire, in the storm test beside the wind, the
//  water, the shaking and the snow: a grass fire, a brush fire, a forest
//  crown fire, each by how long its flames are; the house tried as the
//  wildfire research has it -- embers, which start most of the houses that
//  burn, into its vents and onto what burns against its walls; the heat off
//  the flame front, by how close the fuel comes; its roof, its glass -- and
//  let loose in 3D: the front coming across the land with its smoke and its
//  embers, the ground black behind it, and a house that catches burning
//  and falling in
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (my own list, 2026-10-03d E)  The numbers, from the research:
  //   flames a couple of metres long in grass, eight or so in brush, thirty
  //   and more off a forest burning in its crowns (Byram's flame length,
  //   0.0775 I^0.46, from a few hundred to tens of thousands of kW a metre);
  //   a flame front giving off 60 kW/m² (grass) to 100 (a crown fire); wood
  //   lit by a pilot -- an ember -- under 12.5 kW/m² held on it, more for the
  //   moment a front takes to pass (Cohen: a house is not lit by the heat of
  //   a crown fire from 30 m away -- the embers are what do it); window
  //   glass cracking from about 9 kW/m², tempered or shuttered at about 25;
  //   the five feet round a house kept clear of anything that burns, vents
  //   meshed against embers, a Class A roof (IBHS, NFPA Firewise).
  if (typeof SM_STORMS === "object") { SM_STORMS.push(["fire1", 2, "fire"], ["fire2", 8, "fire"], ["fire3", 30, "fire"]); }
  var SM_HOLDS_FIRE = ["vents", "zone0", "space", "siding", "impact", "classa"];
  var WF_BURNS = { i_shrub: 1, i_hedge: 1, i_tree: 1, i_palm: 1, i_flowerbed: 1, i_flowers: 1, i_plantbed: 1, i_planter: 1, i_deck: 1, i_fence: 1,
                   i_gardenbench: 1, i_bench: 1, i_shed: 1, i_gazebo: 1, i_pavilion: 1, i_swing: 1, i_playset: 1, i_bins: 1, i_grill: 1, i_trampoline: 1 };
  var WF_WOOD_OUT = { siding: 1, boards: 1, shakes: 1, logs: 1, timber: 1 };
  var WF_WOOD_ROOF = { woodshakes: 1, thatch: 1 };
  var WF_BURN_S = 40;                 // s: a house, once caught, burning through
  function wfLevel(a) { return a < 4 ? 1 : a < 15 ? 2 : 3; }
  function wfKind() { return typeof fxOn === "function" && fxOn() && FX.kind === "fire"; }

  // ---- the house, tried --------------------------------------------------------------------------------
  function wfRooms() { return hand.nodes.filter(function (n) { return n.kind === "i_room"; }); }
  function wfMat(part) {
    var kinds = {};
    wfRooms().forEach(function (r) { var m = typeof houseMat === "function" ? houseMat(r, part) : null; if (m && m.kind) { kinds[m.kind] = 1; } });
    return Object.keys(kinds);
  }
  function wfWoodWalls(B) {
    var k = wfMat("out");
    if (!k.length) { return !B || B.frame === "wood"; }
    return k.some(function (m) { return WF_WOOD_OUT[m]; });
  }
  function wfRoofBurns() { return wfMat("roof").some(function (m) { return WF_WOOD_ROOF[m]; }); }
  // what burns within five feet of the walls: planted against them, a deck, a fence run up to them
  function wfNear() {
    var P = FLOOR_PX, gap = 1.5 * P, rooms = wfRooms(), floors = typeof floorsOf === "function" ? floorsOf() : [];
    var boxes = rooms.filter(function (r) { var f = floors.length ? floorAt(floors, r.x, r.y) : null; return !f || f.level === 0; }).map(function (r) {
      return typeof tieBox === "function" ? tieBox(r) : { l: r.x - r.w / 2, r: r.x + r.w / 2, t: r.y - r.h / 2, b: r.y + r.h / 2 };
    });
    return hand.nodes.filter(function (n) {
      if (!WF_BURNS[n.kind] || wfInside(n, boxes)) { return false; }
      var hw = (n.w || 0) / 2, hh = (n.h || 0) / 2;
      return boxes.some(function (q) {
        var dx = Math.max(q.l - (n.x + hw), (n.x - hw) - q.r, 0), dy = Math.max(q.t - (n.y + hh), (n.y - hh) - q.b, 0);
        return Math.hypot(dx, dy) < gap;
      });
    });
  }
  function wfInside(n, boxes) { return boxes.some(function (q) { return n.x > q.l && n.x < q.r && n.y > q.t && n.y < q.b; }); }
  // the heat on the wall facing the front: a wide wall of flame as tall as
  // its flames are long, seen from the fuel's edge (the view factor of a
  // long strip, from its foot), times what a flame gives off
  function wfHeat(a, d) {
    var E = wfLevel(a) === 1 ? 60 : wfLevel(a) === 2 ? 80 : 100;
    return E * 0.5 * (1 - d / Math.hypot(d, a));
  }
  function wfFuelGap() { return smHold("space") ? 30 : 10; }
  function wfTry(St, B) {
    var a = St[1], level = wfLevel(a), out = [], d = wfFuelGap(), q = wfHeat(a, d), wood = wfWoodWalls(B) && !smHold("siding");
    var near = wfNear(), feet = typeof feetHere === "function" && feetHere();
    var dist = feet ? Math.round(d * 3.281) + " ft" : d + " m", flux = q.toFixed(q < 10 ? 1 : 0) + " kW/m²";
    // the embers: carried far ahead of the front, in at the vents into the attic
    var vents = level === 1 || smHold("vents");
    out.push({ k: "embers", ok: vents, said: vents ? (level === 1 ? TXT.sm_wf_few : TXT.sm_wf_vents_ok) : TXT.sm_wf_vents_bad, fix: "vents", wf: 10 });
    // the first five feet: what burns there lit by the embers, its flames against the walls
    var zone = level === 1 || smHold("zone0") || !near.length;
    out.push({ k: "zone0", ok: zone, said: zone ? TXT.sm_wf_zone_ok : say("sm_wf_zone_bad", { n: near.length }), fix: "zone0", wf: 4 });
    // the roof, under the embers
    if (wfRoofBurns()) {
      var roof = level === 1 || smHold("classa");
      out.push({ k: "fireroof", ok: roof, said: roof ? TXT.sm_wf_roof_ok : TXT.sm_wf_roof_bad, fix: "classa", wf: 6 });
    }
    // the heat off the front as it reaches the end of the fuel
    var lim = wood ? 20 : 40;
    out.push({ k: "heat", ok: q <= lim, said: say(q <= lim ? "sm_wf_heat_ok" : "sm_wf_heat_bad", { q: flux, d: dist }),
               fix: smHold("space") ? (wfWoodWalls(B) && !smHold("siding") ? "siding" : null) : "space", wf: 2 });
    // the glass: cracked by the heat, the fire in through it
    var glassLim = smHold("impact") ? 25 : 9;
    out.push({ k: "glass", ok: q <= glassLim, said: q <= glassLim ? TXT.sm_wf_glass_ok : TXT.sm_wf_glass_bad, fix: smHold("impact") ? (smHold("space") ? null : "space") : "impact", wf: 3 });
    out.push({ k: "leave", ok: true, said: TXT.sm_wf_leave, fix: null });
    return { storm: St, V: a, q: q, list: out, B: B, ok: out.every(function (c) { return c.ok; }) };
  }
  if (typeof smTry === "function") {
    var smTryWf = smTry;
    smTry = function (key) {
      var St = smStormOf(key);
      if (St && St[2] === "fire") { var B = smBuilding(); return B ? wfTry(St, B) : null; }
      return smTryWf.apply(this, arguments);
    };
  }
  if (typeof smMeasure === "function") {
    var smMeasureWf = smMeasure;
    smMeasure = function (s) {
      if (s && s[2] === "fire") { var feet = typeof feetHere === "function" && feetHere(); return say("sm_wf_flames", { len: feet ? Math.round(s[1] * 3.281) + " ft" : s[1] + " m" }); }
      return smMeasureWf.apply(this, arguments);
    };
  }
  // the holds asked for, with a wildfire chosen: its own (40-storm.js asks)
  function wfHolds() { return V3 && V3.storm && smStormOf(V3.storm) && smStormOf(V3.storm)[2] === "fire" ? SM_HOLDS_FIRE : null; }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.sm_fire = '<path d="M10 17.6c-3.1 0-5.4-2.2-5.4-5.2 0-3.4 3-4.8 3.6-8.6 2.6 1.6 3.4 3.6 3.2 5.6.9-.5 1.5-1.4 1.7-2.6 1.6 1.4 2.3 3.3 2.3 5.4 0 3-2.4 5.4-5.4 5.4z"/><path d="M10 17.6c-1.4 0-2.4-1-2.4-2.4 0-1.6 1.4-2.4 2-4 1.2 1 2.8 2.2 2.8 4 0 1.4-1 2.4-2.4 2.4z"/>';
    HOUSE_ICONS.sm_h_vents = '<rect x="3.5" y="5.5" width="13" height="9" rx="1"/><path d="M5.5 8h9M5.5 10h9M5.5 12h9M8 5.5v9M12 5.5v9"/>';
    HOUSE_ICONS.sm_h_zone0 = '<path d="M6.5 15V8.5L10 5.5l3.5 3V15z"/><path d="M2.5 16.5h15" stroke-dasharray="1.2 1.6"/><path d="M3.5 13.6h1.4M15.1 13.6h1.4"/>';
    HOUSE_ICONS.sm_h_space = '<path d="M8 14V9.5L10 8l2 1.5V14z"/><circle cx="10" cy="11" r="7.2" stroke-dasharray="1.4 1.8"/>';
    HOUSE_ICONS.sm_h_siding = '<path d="M4 16V7.5L10 3.5l6 4V16z"/><path d="M4 10h12M4 13h12M7 10v3M13 10v3M10 13v3"/>';
    HOUSE_ICONS.sm_h_classa = '<path d="M2.8 10.5 10 4.2l7.2 6.3"/><path d="M5 9v7h10V9"/><path d="M8.3 15l1.7-4.6 1.7 4.6M8.9 13.4h2.2"/>';
  }

  // ---- let loose: the front, its smoke and embers, the house catching ---------------------------------
  if (typeof fxStart === "function") {
    var fxStartWf = fxStart;
    fxStart = function () {
      var out = fxStartWf.apply(this, arguments);
      if (FX && FX.kind === "fire") {
        var B = FX.T && FX.T.B;
        // (a wildfire runs before the wind: about 8 m/s, a fresh breeze up to a gale's edge)
        FX.windV = 8;
        FX.open = !!B && B.frame !== "tall" && !(typeof v3Big === "function" && v3Big()) && !(FX.T && FX.T.ok);
        FX.wf = null;
      }
      return out;
    };
  }
  if (typeof fxPlan === "function") {
    var fxPlanWf = fxPlan;
    fxPlan = function (F) {
      var out = fxPlanWf.apply(this, arguments);
      if (F.kind === "fire") { try { wfPlan(F); } catch (e) { F.wf = null; } }
      return out;
    };
  }
  // where the front starts, how fast it comes, where the fuel ends; when the house catches, and how
  function wfPlan(F) {
    var L = F.plan, P = L.P, d = F.dir || [1, 0], a = F.V, level = wfLevel(a), H = [L.H[0] / P, L.H[1] / P];
    var reach = 0;
    L.foot.forEach(function (b) { [[b[0], b[2]], [b[1], b[2]], [b[0], b[3]], [b[1], b[3]]].forEach(function (c) { reach = Math.max(reach, -((c[0] - H[0]) * d[0] + (c[1] - H[1]) * d[1])); }); });
    var gap = wfFuelGap(), start = 75, v = level === 1 ? 3 : level === 2 ? 3.5 : 4, stop = -(reach + gap);
    var arrive = (start + stop) / v, fails = (F.T ? F.T.list : []).filter(function (c) { return !c.ok && c.wf; });
    var first = fails.reduce(function (m, c) { return Math.min(m, c.wf); }, Infinity);
    var W = { H: H, d: d, side: [-d[1], d[0]], a: a, level: level, start: start, stop: stop, v: v, arrive: arrive,
              ign: isFinite(first) ? arrive + first : Infinity, how: fails.map(function (c) { return c.k; }), rnd: gl3Rand(Math.round(a * 31) + 3),
              near: level === 1 || smHold("zone0") ? [] : wfNear().map(function (n) { return n.id; }), fell: {}, said: {}, burnt: false, p: 0, ground: F.ground };
    // (the order the roof and the walls go in, burning: the pieces over the fire first)
    W.cells = L.cells.slice().sort(function (x, y) { return x.hash - y.hash; });
    W.walls = L.panels.filter(function (p) { return p.ext; }).sort(function (x, y) { return x.hash - y.hash; });
    F.wf = W;
    // (looked at from above: drawn back a little, so the front can be seen coming)
    if (V3 && V3.mode !== "walk" && !V3.flat && !(typeof DM === "object" && DM.follow) && typeof v3Tween === "function" && !(typeof STILL !== "undefined" && STILL)) {
      var k = 0.72;
      setTimeout(function () { if (FX === F) { v3Tween("scale", V3.scale * k, 1400); v3Tween("panX", V3.panX * k, 1400); v3Tween("panY", V3.panY * k, 1400); } }, 0);
    }
    F.tEnd = Math.max(arrive + 13, isFinite(W.ign) ? W.ign + WF_BURN_S + 6 : 0);
    return W;
  }
  // the front, s metres along the wind from the house's middle (negative: still coming)
  function wfFront(W, t) { return Math.min(-W.start + W.v * t, W.stop); }
  function wfFlameNow(W, t) {
    // (full while it runs on through fuel, dying down in the half minute after it reaches the end of it)
    var gone = t - W.arrive;
    return gone <= 0 ? 1 : Math.max(0, 1 - gone / 12);
  }
  function wfBurn(W, t) { return isFinite(W.ign) ? Math.max(0, Math.min(1, (t - W.ign) / WF_BURN_S)) : 0; }
  if (typeof fxStep === "function") {
    var fxStepWf = fxStep;
    fxStep = function (F, dt) {
      var out = fxStepWf.apply(this, arguments);
      if (F && F.kind === "fire" && F.wf && F.plan) { try { wfStep(F); } catch (e) { /* as it burns */ } }
      return out;
    };
  }
  function wfStep(F) {
    var W = F.wf, L = F.plan, t = F.t, p = wfBurn(W, t);
    W.p = p;
    if (t >= W.arrive) { W.said.came = true; }
    if (t >= W.arrive + 1 && W.near.length) { W.said.near = true; }
    if (p > 0) { W.said.caught = true; }
    if (!(p > 0) || !L.split) { if (p >= 0.6) { W.burnt = true; } return; }
    // the roof falling in, a piece at a time; the outside walls after it
    W.cells.forEach(function (c, i) {
      if (c.state !== "held" || W.fell[c.id]) { return; }
      if (p > 0.32 + 0.4 * i / Math.max(1, W.cells.length)) { W.fell[c.id] = true; fxLoose(F, c, [0, 0, -1.4], 0.2); }
    });
    W.walls.forEach(function (w, i) {
      if (w.state !== "held" || W.fell[w.id]) { return; }
      if (p > 0.62 + 0.3 * i / Math.max(1, W.walls.length)) {
        W.fell[w.id] = true;
        var c = fxMidOf(w), P = L.P, k = [L.H[0] - c[0], L.H[1] - c[1]], l = Math.hypot(k[0], k[1]) || 1;
        fxLoose(F, w, [k[0] / l * 0.5, k[1] / l * 0.5, 0], 0.15);
      }
    });
    if (p >= 0.6) { W.burnt = true; W.said.burnt = true; }
  }
  // what has happened, for the words under the storm test
  if (typeof fxSaid === "function") {
    var fxSaidWf = fxSaid;
    fxSaid = function () {
      if (!wfKind() || !FX.wf) { return fxSaidWf.apply(this, arguments); }
      var W = FX.wf, list = [];
      if (W.said.came) { list.push(say("wf_ev_came", { d: wfLen(-W.stop) })); }
      if (W.said.near) { list.push(TXT.wf_ev_near); }
      if (W.said.caught) { list.push(TXT["wf_ev_by_" + wfFirstHow(W)] || TXT.wf_ev_caught); }
      if (W.said.burnt) { list.push(TXT.wf_ev_burnt); }
      else if (W.said.came && !isFinite(W.ign) && FX.t > W.arrive + 6) { list.push(TXT.wf_ev_held); }
      return say("wf_seen", { what: list.length ? list.join(" · ") : TXT.sm_ev_none });
    };
  }
  function wfFirstHow(W) {
    var best = null, at = Infinity;
    (FX.T ? FX.T.list : []).forEach(function (c) { if (!c.ok && c.wf && c.wf < at) { at = c.wf; best = c.k; } });
    return best || "heat";
  }
  function wfLen(m) { var feet = typeof feetHere === "function" && feetHere(); return feet ? Math.round(m * 3.281) + " ft" : Math.round(m) + " m"; }
  // a smoky sky, the sun orange through it
  if (typeof fxSkyHow === "function") {
    var fxSkyHowWf = fxSkyHow;
    fxSkyHow = function () {
      if (wfKind()) { var lv = wfLevel(FX.V); return { k: lv === 1 ? 0.3 : lv === 2 ? 0.48 : 0.66, tint: [0.7, 0.44, 0.25], snow: false }; }
      return fxSkyHowWf.apply(this, arguments);
    };
  }

  // ---- drawn ---------------------------------------------------------------------------------------------
  var WF_EMBER = { piece: true, color: "#ffb03a", edge: "#ffb03a", pat: 31, bare: true, alpha: 0.95, late: true };
  var WF_GLOW = { piece: true, color: "#c2410c", edge: "#c2410c", pat: 31, bare: true, alpha: 0.7, late: true };
  var WF_CHAR = { piece: true, color: "#1d1915", edge: "#1d1915", bare: true, alpha: 0.86, late: true };
  // a flame in three: its red-orange edge, its orange body, its yellow heart low down
  var WF_FIRE = [[{ piece: true, color: "#e2501a", edge: "#e2501a", pat: 31, bare: true, alpha: 0.5, late: true }, 1, 1],
                 [{ piece: true, color: "#ff8a22", edge: "#ff8a22", pat: 31, bare: true, alpha: 0.72, late: true }, 0.7, 0.78],
                 [{ piece: true, color: "#ffd873", edge: "#ffd873", pat: 31, bare: true, alpha: 0.88, late: true }, 0.4, 0.46]];
  var WF_SMOKE = [{ piece: true, color: "#3a3531", edge: "#3a3531", bare: true, alpha: 0.14, late: true },
                  { piece: true, color: "#57504a", edge: "#57504a", bare: true, alpha: 0.11, late: true },
                  { piece: true, color: "#7c7268", edge: "#7c7268", bare: true, alpha: 0.08, late: true }];
  function wfHash(i, k) { var x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); }
  // Which way the eye is, from a point: flames and smoke drawn facing it (a
  // shape facing you, not two crossed -- seen from above those were stars)
  function wfToEye(p) {
    if (V3 && V3.mode === "walk" && V3.eye) {
      var dx = V3.eye.x - p[0], dy = V3.eye.y - p[1], dz = V3.eye.z - p[2], l = Math.hypot(dx, dy, dz) || 1;
      return [dx / l, dy / l, dz / l];
    }
    return typeof v3Toward === "function" ? v3Toward() : [0, -0.7, 0.7];
  }
  // a flame: standing up, wide at its foot, bulging, to a tip leaning with the wind and flickering
  function wfTongue(out, x, y, z, w, h, lean, flick) {
    var e = wfToEye([x, y, z + h / 2]), rl = Math.hypot(e[0], e[1]) || 1, r = [-e[1] / rl, e[0] / rl, 0];
    var shape = [[-0.5, 0], [-0.46, 0.18], [-0.3, 0.5], [-0.08, 0.86], [0, 1], [0.12, 0.8], [0.32, 0.46], [0.47, 0.17], [0.5, 0]];
    WF_FIRE.forEach(function (L) {
      var ww = w * L[1], hh = h * L[2];
      out.push({ pts: shape.map(function (q) {
        var up = q[1], bend = up * up, sx = q[0] * ww * (1 - 0.35 * up) + Math.sin((flick || 0) + up * 3) * 0.08 * ww * up;
        return [x + r[0] * sx + lean[0] * hh * bend, y + r[1] * sx + lean[1] * hh * bend, z + up * hh];
      }), n: e, how: L[0] });
    });
  }
  // a puff of smoke: three round shapes facing the eye, heaped -- a cloud's outline, not a disc's
  function wfBasis(p) {
    var e = wfToEye(p), a = Math.abs(e[2]) > 0.95 ? [1, 0, 0] : [0, 0, 1];
    var u = [a[1] * e[2] - a[2] * e[1], a[2] * e[0] - a[0] * e[2], a[0] * e[1] - a[1] * e[0]], ul = Math.hypot(u[0], u[1], u[2]) || 1;
    u = [u[0] / ul, u[1] / ul, u[2] / ul];
    return { e: e, u: u, v: [e[1] * u[2] - e[2] * u[1], e[2] * u[0] - e[0] * u[2], e[0] * u[1] - e[1] * u[0]] };
  }
  function wfDisc(out, c, B, r, how, sides, wob) {
    var pts = [];
    for (var i = 0; i < sides; i++) {
      var q = i / sides * Math.PI * 2, k = r * (1 - wob + wob * Math.sin(i * 2.7 + c[0] * 0.01));
      pts.push([c[0] + (B.u[0] * Math.cos(q) + B.v[0] * Math.sin(q)) * k, c[1] + (B.u[1] * Math.cos(q) + B.v[1] * Math.sin(q)) * k, c[2] + (B.u[2] * Math.cos(q) + B.v[2] * Math.sin(q)) * k]);
    }
    out.push({ pts: pts, n: B.e, how: how });
  }
  function wfPuff(out, x, y, z, r, how) {
    var B = wfBasis([x, y, z]);
    [[-0.5, -0.12, 0.68], [0.5, -0.1, 0.62], [0, 0.22, 1]].forEach(function (q) {
      wfDisc(out, [x + B.u[0] * q[0] * r + B.v[0] * q[1] * r, y + B.u[1] * q[0] * r + B.v[1] * q[1] * r, z + B.u[2] * q[0] * r + B.v[2] * q[1] * r], B, r * q[2], how, 14, 0.1);
    });
  }
  // an ember: a spark, a small diamond facing the eye
  function wfEmber(out, x, y, z, s) {
    var B = wfBasis([x, y, z]);
    out.push({ pts: [[x + B.u[0] * s, y + B.u[1] * s, z + B.u[2] * s], [x + B.v[0] * s * 1.6, y + B.v[1] * s * 1.6, z + B.v[2] * s * 1.6],
                     [x - B.u[0] * s, y - B.u[1] * s, z - B.u[2] * s], [x - B.v[0] * s * 1.6, y - B.v[1] * s * 1.6, z - B.v[2] * s * 1.6]], n: B.e, how: WF_EMBER });
  }
  // the land's height under a point, in px (metres in)
  function wfGround(x, y) { return (typeof fxLand === "function" ? fxLand(x, y) : 0) * FLOOR_PX; }
  function wfFaces(F, out) {
    var W = F.wf, P = FLOOR_PX, t = F.t, d = W.d, sd = W.side, s = wfFront(W, t), flame = wfFlameNow(W, t), lv = W.level;
    var now = performance.now() / 1000, lean = [d[0] * 0.35, d[1] * 0.35];
    function at(along, across) { return [W.H[0] + d[0] * along + sd[0] * across, W.H[1] + d[1] * along + sd[1] * across]; }
    // the ground behind the front: black, the edge just behind it still glowing
    var cell = 12, half = 150;
    for (var a0 = -W.start; a0 < s - 0.5; a0 += cell) {
      var a1 = Math.min(s, a0 + cell), glow = s - a1 < 10 && flame > 0.2;
      for (var c0 = -half; c0 < half; c0 += cell) {
        var c1 = c0 + cell, q = [at(a0, c0), at(a1, c0), at(a1, c1), at(a0, c1)];
        out.push({ pts: q.map(function (p) { return [p[0] * P, p[1] * P, wfGround(p[0], p[1]) + 0.07 * P]; }), n: [0, 0, 1], how: glow ? WF_GLOW : WF_CHAR });
      }
    }
    // the front: flames all along it as long as the fuel lets them be
    if (flame > 0.02) {
      var tall = W.a * flame, gapM = lv === 3 ? 7 : 4;
      for (var c = -half; c <= half; c += gapM) {
        var j = Math.round(c / gapM), wob = 0.62 + 0.38 * Math.sin(now * (5 + wfHash(j, 1) * 4) + j);
        var p = at(s - wfHash(j, 2) * 3, c + (wfHash(j, 3) - 0.5) * gapM), g = wfGround(p[0], p[1]);
        var h = tall * wob * (0.7 + 0.5 * wfHash(j, 4)) * P, w = Math.max(1.2, Math.min(gapM * 1.4, W.a * 0.4)) * P;
        wfTongue(out, p[0] * P, p[1] * P, g, w, h, lean, now * 3 + j);
      }
    }
    // smoke off the front, rising and drifting on with the wind
    var rise = lv === 1 ? 14 : lv === 2 ? 26 : 45;
    for (var k = 0; k < 38; k++) {
      var age = (now * 0.12 + wfHash(k, 5)) % 1, c2 = (wfHash(k, 6) - 0.5) * half * 1.6;
      var o = at(s - 6 + age * 28, c2), r = (3 + age * (lv === 3 ? 15 : 9)) * P, gz = wfGround(o[0], o[1]);
      wfPuff(out, o[0] * P, o[1] * P, gz + (3 + age * rise) * P, r, WF_SMOKE[k % 3]);
    }
    // the embers, carried on ahead of the front -- over the house
    var many = lv === 1 ? 16 : lv === 2 ? 60 : 110, spread = flame > 0.1 ? 1 : 0.4;
    for (var e = 0; e < many * spread; e++) {
      var life = (now * (0.22 + wfHash(e, 7) * 0.12) + wfHash(e, 8)) % 1, run = life * (40 + wfHash(e, 9) * 40);
      var o2 = at(s + run - 4, (wfHash(e, 10) - 0.5) * 120 * (0.3 + life)), z2 = (2 + Math.sin(life * Math.PI) * (6 + lv * 5) + wfHash(e, 11) * 4) * P;
      wfEmber(out, o2[0] * P, o2[1] * P, wfGround(o2[0], o2[1]) + z2, (0.09 + wfHash(e, 12) * 0.08) * P);
    }
    // what burns against the house, alight once the front is there
    if (t >= W.arrive && W.near.length && !W.p) {
      W.near.forEach(function (id, i) {
        var n = nodeById(id);
        if (!n) { return; }
        var fl = typeof floorsOf === "function" ? floorAt(floorsOf(), n.x, n.y) : null, x = n.x + (fl ? fl.dx : 0), y = n.y + (fl ? fl.dy : 0);
        var h = (typeof pieceHigh === "function" ? pieceHigh(n) : 1) * 1.6 * P * (0.7 + 0.3 * Math.sin(now * 6 + i));
        var gz = wfGround(x / P, y / P);
        wfTongue(out, x, y, gz, Math.max(0.8 * P, Math.min(n.w, n.h)), h, lean, now * 3 + i);
      });
    }
    // the house alight: flames on its roof and out of its walls, thick smoke over it
    var pb = W.p;
    if (pb > 0) {
      var L = F.plan, spots = [];
      L.cells.forEach(function (c) { if (c.state === "held") { var m = fxMidOf(c); spots.push([m[0], m[1], c.box[5]]); } });
      L.panels.forEach(function (w) { if (w.ext && w.state === "held") { var m = fxMidOf(w); spots.push([m[0], m[1], w.box[5]]); } });
      if (!spots.length || pb > 0.85) {
        L.foot.forEach(function (b, i) { spots.push([(b[0] + b[1]) / 2 * P, (b[2] + b[3]) / 2 * P, L.slab + 0.3 * P]); });
      }
      var show = Math.min(46, Math.max(3, Math.round(spots.length * Math.min(1, pb * 2.2)))) * (pb >= 1 ? 0.5 : 1);
      var big = Math.sin(Math.min(1, pb * 1.6) * Math.PI / 2) * (pb >= 1 ? 0.3 : pb > 0.85 ? 0.55 : 1);
      for (var i2 = 0; i2 < Math.min(show, spots.length); i2++) {
        var sp = spots[Math.floor(wfHash(i2, 13) * spots.length)], hh = (1.4 + 3.2 * big * wfHash(i2, 14)) * P * (0.7 + 0.3 * Math.sin(now * 7 + i2));
        wfTongue(out, sp[0], sp[1], sp[2] - 0.2 * P, (1.2 + 1.2 * big) * P, hh, lean, now * 3 + i2);
      }
      for (var k2 = 0; k2 < 12; k2++) {
        var age2 = (now * 0.16 + wfHash(k2, 15)) % 1;
        wfPuff(out, L.H[0] + d[0] * age2 * 30 * P, L.H[1] + d[1] * age2 * 30 * P, L.top + (2 + age2 * 30) * P, (3 + age2 * 10) * P, WF_SMOKE[k2 % 3]);
      }
    }
    return { lo: [at(-W.start, -half), at(-W.start, half), at(W.stop + 60, -half), at(W.stop + 60, half)], top: Math.max(rise + 30, W.a * 1.4) };
  }
  // the house blackened as it burns: its walls, its roof, its floors -- and what is in it, gone once it is
  var wfTints = new WeakMap();
  function wfCharred(f, k) {
    var lv = Math.round(k * 8) / 8;
    if (lv <= 0 || !f.how || f.how.glass) { return f; }
    var kept = wfTints.get(f);
    if (kept && kept.lv === lv) { return kept.f; }
    var col = typeof fxMixHex === "function" && /^#[0-9a-f]{6}$/i.test(f.how.color || "") ? fxMixHex(f.how.color, "#17130f", lv * 0.9) : "#2a241f";
    var g = Object.assign({}, f, { how: Object.assign({}, f.how, { color: col, edge: col }) });
    wfTints.set(f, { lv: lv, f: g });
    return g;
  }
  if (typeof fxPicture === "function") {
    var fxPictureWf = fxPicture;
    fxPicture = function (F, model) {
      var out = fxPictureWf.apply(this, arguments);
      if (!F || F.kind !== "fire" || !F.wf || !out) { return out; }
      try {
        var W = F.wf, L = F.plan, P = L.P, k = Math.min(1, W.p * 1.6);
        if (k > 0) {
          var b = L.house.box, pad = 0.6 * P;
          var inHouse = function (f) {
            var q = f.pts && f.pts[0];
            return q && q[0] > b[0] - pad && q[0] < b[1] + pad && q[1] > b[2] - pad && q[1] < b[3] + pad && (q[2] || 0) >= L.slab - 0.05 * P;
          };
          out.faces = out.faces.filter(function (f) { return !(W.p > 0.75 && f.mesh && inHouse(f) && !(f.node && f.node.kind === "i_fireplace")); })
                               .map(function (f) { return inHouse(f) && !f.mesh ? wfCharred(f, k) : f; });
          out.passing.faces = out.passing.faces.map(function (f) { return f.mesh ? f : wfCharred(f, Math.min(1, k + 0.3)); });
          // (the names of what was in it, gone with it)
          if (W.p > 0.75 && out.labels) {
            out.labels = out.labels.filter(function (l) { return l.room || !(l.x > b[0] - pad && l.x < b[1] + pad && l.y > b[2] - pad && l.y < b[3] + pad); });
          }
        }
        var span = wfFaces(F, out.passing.faces);
        // (deep enough for the front out on the land and the smoke over it: gl3Above)
        if (typeof gl3Depth === "function" && span) {
          var lo = F.span ? F.span[0] : Infinity, hi = F.span ? F.span[1] : -Infinity;
          span.lo.forEach(function (p) {
            [0, span.top].forEach(function (z) { var dd = gl3Depth([p[0] * P, p[1] * P, z * P]); lo = Math.min(lo, dd); hi = Math.max(hi, dd); });
          });
          F.span = [lo, hi];
        }
      } catch (e) { /* the picture as it was */ }
      return out;
    };
  }
  // Over the view (40-storm.js asks): ash falling, embers streaming past, a warm haze low down.
  function wfOverlay(g, W, H, t, me, side) {
    var lv = wfLevel(me.St[1]), heat = lv === 1 ? 0.35 : lv === 2 ? 0.6 : 1;
    var haze = g.createLinearGradient(0, H, 0, H * 0.35);
    haze.addColorStop(0, "rgba(214,98,32," + (0.1 + 0.12 * heat).toFixed(3) + ")");
    haze.addColorStop(1, "rgba(214,98,32,0)");
    g.fillStyle = haze;
    g.fillRect(0, 0, W, H);
    var dir = side >= 0 ? 1 : -1;
    me.bits.forEach(function (d, i) {
      if (i % (lv === 1 ? 5 : lv === 2 ? 3 : 2)) { return; }
      var near = d.l, x, y;
      if (d.k || i % 7 === 0) {
        // an ember: quick, low, flickering
        x = (((d.x + t * (0.06 + 0.1 * near) * dir * d.s) % 1) + 1) % 1 * W;
        y = ((d.y + Math.sin(t * 2.4 + d.p) * 0.04 - t * 0.015 * d.s) % 1 + 1) % 1 * H;
        var a = (0.55 + 0.45 * Math.sin(t * 9 + d.p * 3)) * (0.5 + 0.5 * near), r = 1 + near * 2.2;
        g.fillStyle = "rgba(255," + (150 + Math.round(60 * near)) + ",60," + a.toFixed(3) + ")";
        g.beginPath(); g.arc(x, y, r, 0, 6.29); g.fill();
        g.fillStyle = "rgba(255,120,40," + (a * 0.25).toFixed(3) + ")";
        g.beginPath(); g.arc(x, y, r * 3, 0, 6.29); g.fill();
      } else {
        // ash: grey flakes, slow, turning over as they fall
        x = (((d.x + t * 0.02 * dir + Math.sin(t * 0.8 + d.p) * 0.01) % 1) + 1) % 1 * W;
        y = ((d.y + t * (0.02 + 0.03 * near) * d.s) % 1) * H;
        var sz = 0.8 + near * 2.4;
        g.fillStyle = "rgba(196,190,182," + (0.25 + 0.4 * near).toFixed(3) + ")";
        g.save(); g.translate(x, y); g.rotate(t * 2 * d.s + d.p); g.fillRect(-sz, -sz * 0.5, sz * 2, sz); g.restore();
      }
    });
  }

  // ---- reckoned up (40-damage.js) ----------------------------------------------------------------------------
  if (typeof dmReport === "function") {
    var dmReportWf = dmReport;
    dmReport = function (F) {
      if (!F || F.kind !== "fire" || !F.wf || !F.plan) { return dmReportWf.apply(this, arguments); }
      var W = F.wf, L = F.plan, P = L.P, rows = [], total = 0, info = [];
      function add(k, amount, cost) { rows.push({ k: k, amount: amount, cost: Math.round(cost / 100) * 100 }); total += cost; }
      var floor = 0;
      L.rooms.forEach(function (r) { floor += (2 * r.hw / P) * (2 * r.hh / P); });
      if (W.p > 0) {
        // (caught: with no one to put it out, a house burns down -- built again, and what was in it)
        add("burnt", dmArea(floor), floor * DM_COST.buildM2 * 1.5);
      } else if (F.t >= W.arrive) {
        // (come through: its windows cracked by the heat, perhaps; what stood against it burnt)
        var panes = (F.T ? F.T.list : []).some(function (c) { return c.k === "glass" && !c.ok; });
        if (panes) { add("windows", "", 8 * DM_COST.window); }
      }
      var near = F.t >= W.arrive ? W.near.length : 0;
      if (near) { add("wf_near", String(near), near * DM_COST.tree); }
      info.push(say("dm_wf_land", { d: wfLen(W.start + W.stop) }));
      return { rows: rows, total: total < 10000 ? Math.round(total / 100) * 100 : Math.round(total / 1000) * 1000, exact: total, info: info, wrecked: W.p > 0, done: !!F.done };
    };
  }

  // ---- lightning, and the rods that take it (my own list, 2026-10-03d D) -------------------------------------
  // In a thunderstorm the bolt finds what stands highest: a lightning rod
  // where there is one -- along the ridge every twenty feet or so, joined
  // down the wall to a rod in the ground (NFPA 780) -- and runs harmlessly
  // down it; where there is none, the roof's ridge, which it shatters and
  // may set alight.  (A lightning claim on a house came to $18,641 on
  // average in 2024, the Insurance Information Institute's figure.)
  if (typeof SM_HOLDS_HOME === "object" && SM_HOLDS_HOME.indexOf("rod") < 0) { SM_HOLDS_HOME.push("rod"); }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.sm_h_rod = '<path d="M10 2.5v6.5"/><path d="M3 15l7-6 7 6"/><path d="M15.5 13.7V17.5"/><path d="M13.6 17.5h3.8"/><path d="M11.4 4.4 8.8 6.6h2.6l-2.4 2.2"/>';
  }
  var WF_BOLT = [{ piece: true, color: "#b9c6ff", edge: "#b9c6ff", pat: 31, bare: true, alpha: 0.3, late: true }, 1.2,
                 { piece: true, color: "#f4f6ff", edge: "#f4f6ff", pat: 31, bare: true, alpha: 0.95, late: true }, 0.24];
  var WF_ROD = { piece: true, color: "#8d939a", edge: "#5f646a", pat: 22 };
  var WF_STRIKE_COST = 18641;
  function wfThunder(F) { return !!F && (F.kind === "hurricane" || F.kind === "tornado" || F.kind === "hail" || (F.kind === "wind" && F.V >= 33)); }
  if (typeof smTry === "function") {
    var smTryLt = smTry;
    smTry = function (key) {
      var T = smTryLt.apply(this, arguments), St = smStormOf(key);
      if (T && St && wfThunder({ kind: St[2], V: St[1] }) && !(T.B && T.B.tall)) {
        T.list.push({ k: "lightning", ok: true, said: smHold("rod") ? TXT.sm_lt_ok : TXT.sm_lt_risk, fix: null });
      }
      return T;
    };
  }
  // the ridge: the highest edge of the roof, end to end
  function wfRidge(faces) {
    var top = -Infinity, pts = [], tol = 0.12 * FLOOR_PX;
    function roofish(f) { return f.pts && (f.roof || (f.how && f.how.roof)); }
    faces.forEach(function (f) { if (roofish(f)) { f.pts.forEach(function (p) { if ((p[2] || 0) > top) { top = p[2] || 0; } }); } });
    if (top === -Infinity) { return null; }
    faces.forEach(function (f) { if (roofish(f)) { f.pts.forEach(function (p) { if ((p[2] || 0) > top - tol) { pts.push(p); } }); } });
    if (pts.length > 400) { pts = pts.filter(function (p, i) { return i % Math.ceil(pts.length / 400) === 0; }); }
    var a = pts[0], b = pts[0], far = 0;
    pts.forEach(function (p) { pts.forEach(function (q) { var d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d > far) { far = d; a = p; b = q; } }); });
    return { a: a, b: b, z: top, len: far };
  }
  // the rods drawn on: along the ridge, a cable along it and down the end wall into the ground
  function wfRodTips(R) {
    var P = FLOOR_PX, n = Math.max(2, Math.ceil(R.len / (6 * P)) + 1), tips = [];
    for (var i = 0; i < n; i++) {
      var k = 0.04 + 0.92 * i / (n - 1);
      tips.push([R.a[0] + (R.b[0] - R.a[0]) * k, R.a[1] + (R.b[1] - R.a[1]) * k, R.z + 0.6 * P]);
    }
    return tips;
  }
  function wfRods(faces, R) {
    var P = FLOOR_PX, tips = wfRodTips(R), r = 0.012 * P;
    tips.forEach(function (q) { v3Prism(faces, [[q[0] - r, q[1] - r], [q[0] + r, q[1] - r], [q[0] + r, q[1] + r], [q[0] - r, q[1] + r]], R.z, q[2], WF_ROD); });
    var c = 0.008 * P, ux = R.b[0] - R.a[0], uy = R.b[1] - R.a[1], ul = Math.hypot(ux, uy) || 1, sx = -uy / ul * c, sy = ux / ul * c;
    faces.push({ pts: [[R.a[0] - sx, R.a[1] - sy, R.z + 0.02 * P], [R.b[0] - sx, R.b[1] - sy, R.z + 0.02 * P], [R.b[0] + sx, R.b[1] + sy, R.z + 0.02 * P], [R.a[0] + sx, R.a[1] + sy, R.z + 0.02 * P]], n: [0, 0, 1], how: WF_ROD });
    v3Prism(faces, [[R.a[0] - c, R.a[1] - c], [R.a[0] + c, R.a[1] - c], [R.a[0] + c, R.a[1] + c], [R.a[0] - c, R.a[1] + c]], 0, R.z, WF_ROD);
    return tips;
  }
  if (typeof v3Build === "function") {
    var v3BuildLt = v3Build;
    v3Build = function () {
      var model = v3BuildLt.apply(this, arguments);
      try {
        if (model && model.faces && smHold("rod") && V3 && V3.scene !== "space" && !V3.flat && !(typeof bpSite !== "undefined" && bpSite)) {
          var R = wfRidge(model.faces);
          if (R && R.len > 0.5 * FLOOR_PX) { wfRods(model.faces, R); }
        }
      } catch (e) { /* drawn without */ }
      return model;
    };
  }
  // A strike: now and then through the storm, on what stands highest.
  function wfStrikeAt(F, k, model) {
    var L = F.plan, standing = L.house.state === "held" && !L.cells.some(function (c) { return c.state !== "held"; });
    if (!standing) { return null; }
    var R = model ? wfRidge(model.faces) : null, q = 0.15 + 0.7 * wfHash(k, 2), tall = !!(F.T && F.T.B && F.T.B.tall);
    // (a tower is built with its lightning protection on it)
    if (R && (smHold("rod") || tall) && R.len > 0.5 * FLOOR_PX) { var tips = wfRodTips(R); return { at: tips[Math.floor(wfHash(k, 1) * tips.length)], rod: true }; }
    return R ? { at: [R.a[0] + (R.b[0] - R.a[0]) * q, R.a[1] + (R.b[1] - R.a[1]) * q, R.z], rod: false } : null;
  }
  // the bolt: forked down from the cloud base, drawn facing the eye -- a glow round a white core
  function wfBoltFaces(out, from, to, k) {
    var segs = 12, pts = [from];
    for (var i = 1; i < segs; i++) {
      var f = i / segs, j = (1 - f) * 0.9 + 0.1;
      pts.push([from[0] + (to[0] - from[0]) * f + (wfHash(k * 31 + i, 3) - 0.5) * 22 * FLOOR_PX * j,
                from[1] + (to[1] - from[1]) * f + (wfHash(k * 31 + i, 4) - 0.5) * 22 * FLOOR_PX * j,
                from[2] + (to[2] - from[2]) * f]);
    }
    pts.push(to);
    // (and forks off it, part way down, going nowhere)
    var lines = [pts];
    [3, 6].forEach(function (i, n) {
      var o = pts[i], fork = [o];
      for (var f = 1; f <= 4; f++) {
        fork.push([o[0] + (wfHash(k * 7 + n, f) - 0.3) * 9 * FLOOR_PX * f, o[1] + (wfHash(k * 11 + n, f) - 0.5) * 9 * FLOOR_PX * f, o[2] - f * 9 * FLOOR_PX]);
      }
      lines.push(fork);
    });
    lines.forEach(function (line, li) {
    for (var L = 0; L < 2; L++) {
      var how = WF_BOLT[L * 2], w = WF_BOLT[L * 2 + 1] * FLOOR_PX / 2 * (li ? 0.6 : 1);
      for (var s = 0; s < line.length - 1; s++) {
        var a = line[s], b = line[s + 1], B = wfBasis([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
        var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], sd = [d[1] * B.e[2] - d[2] * B.e[1], d[2] * B.e[0] - d[0] * B.e[2], d[0] * B.e[1] - d[1] * B.e[0]], sl = Math.hypot(sd[0], sd[1], sd[2]) || 1;
        sd = [sd[0] / sl * w, sd[1] / sl * w, sd[2] / sl * w];
        out.push({ pts: [[a[0] - sd[0], a[1] - sd[1], a[2] - sd[2]], [b[0] - sd[0], b[1] - sd[1], b[2] - sd[2]], [b[0] + sd[0], b[1] + sd[1], b[2] + sd[2]], [a[0] + sd[0], a[1] + sd[1], a[2] + sd[2]]], n: B.e, how: how });
      }
    }
    });
  }
  if (typeof fxPicture === "function") {
    var fxPictureLt = fxPicture;
    fxPicture = function (F, model) {
      var out = fxPictureLt.apply(this, arguments);
      if (!F || !out || !F.plan || !wfThunder(F)) { return out; }
      try {
        // (every nine seconds or so of the storm; each strike lasting about a third of a second)
        var t = F.t, every = 9, k = Math.floor((t - 4) / every), into = t - 4 - k * every;
        if (!F.wfStrikes) { F.wfStrikes = {}; }
        if (k >= 0 && t < F.tEnd) {
          if (!F.wfStrikes[k]) { F.wfStrikes[k] = wfStrikeAt(F, k, model) || { none: true }; }
          var S = F.wfStrikes[k];
          if (!S.none && into < 0.32) {
            wfBoltFaces(out.passing.faces, [S.at[0] + (wfHash(k, 5) - 0.5) * 60 * FLOOR_PX, S.at[1] + (wfHash(k, 6) - 0.5) * 60 * FLOOR_PX, 180 * FLOOR_PX], S.at, k);
            if (!S.flashed) {
              S.flashed = true;
              if (typeof smBits !== "undefined" && smBits) { smBits.flash = 1; smBits.bolt = null; }
              if (S.rod) { F.wfRodTook = (F.wfRodTook || 0) + 1; } else { F.wfStruck = (F.wfStruck || 0) + 1; }
            }
          }
        }
        // where it struck the roof: sparks thrown off, a little fire a while after
        Object.keys(F.wfStrikes).forEach(function (j) {
          var Q = F.wfStrikes[j], since = t - 4 - j * every;
          if (!Q || Q.none || Q.rod || since > 7 || since < 0) { return; }
          var n = Math.round(14 * Math.max(0, 1 - since / 2));
          for (var e = 0; e < n; e++) {
            var a = wfHash(+j * 17 + e, 7) * Math.PI * 2, r = since * (2 + wfHash(+j * 17 + e, 8) * 4) * FLOOR_PX;
            wfEmber(out.passing.faces, Q.at[0] + Math.cos(a) * r, Q.at[1] + Math.sin(a) * r, Q.at[2] + (since * 3 - since * since * 2.5) * FLOOR_PX, 0.06 * FLOOR_PX);
          }
          if (since > 0.4) {
            var dying = Math.min(1, (7 - since) / 2), grow = Math.min(1, (since - 0.4) / 1.2);
            wfTongue(out.passing.faces, Q.at[0], Q.at[1], Q.at[2] - 0.15 * FLOOR_PX, 1.5 * FLOOR_PX * grow, (1.6 + 0.8 * Math.sin(since * 4)) * FLOOR_PX * dying * grow, [0.12, 0, 0], since * 9);
            for (var w = 0; w < 4; w++) {
              var age = ((since * 0.35 + w / 4) % 1);
              wfPuff(out.passing.faces, Q.at[0] + age * 4 * FLOOR_PX, Q.at[1], Q.at[2] + (1.5 + age * 9) * FLOOR_PX, (0.7 + age * 2.2) * FLOOR_PX * dying, WF_SMOKE[w % 3]);
            }
          }
        });
      } catch (e) { /* the picture as it was */ }
      return out;
    };
  }
  // what the storm did, said; and in the reckoning
  if (typeof fxSaid === "function") {
    var fxSaidLt = fxSaid;
    fxSaid = function () {
      var s = fxSaidLt.apply(this, arguments);
      if (typeof fxOn === "function" && fxOn() && FX.wfStruck) { s += " · " + TXT.sm_ev_struck; }
      else if (typeof fxOn === "function" && fxOn() && FX.wfRodTook) { s += " · " + TXT.sm_ev_rod; }
      return s;
    };
  }
  if (typeof dmReport === "function") {
    var dmReportLt = dmReport;
    dmReport = function (F) {
      var R = dmReportLt.apply(this, arguments);
      if (R && F && F.wfStruck && !R.wrecked) {
        R.rows.push({ k: "struck", amount: String(F.wfStruck), cost: Math.round(WF_STRIKE_COST * F.wfStruck / 100) * 100 });
        R.exact += WF_STRIKE_COST * F.wfStruck;
        R.total = R.exact < 10000 ? Math.round(R.exact / 100) * 100 : Math.round(R.exact / 1000) * 1000;
      }
      return R;
    };
  }
