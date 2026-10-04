// ---------------------------------------------------------------------------
//  40-works-frame.js -- the frame of the building, put up by hand: the
//  timber delivered on a flatbed and taken off it by the telehandler; each
//  wall made flat on the deck -- the bottom plate, every stud, the headers
//  over the doors and windows, the top plates, carried over an armful at a
//  time and nailed -- then tipped up into place by the pair who made it;
//  the next floor's joists and boards laid on top; the stairs; the roof's
//  trusses lifted off their lorry one by one by the mobile crane and
//  nailed down by those up on the walls; the roof boarded and covered.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  var WK_STUD = { piece: true, color: "#d9b77e", edge: "#a88857", pat: 21 };
  var WK_MSTUD = { piece: true, color: "#b9bec3", edge: "#8a8f94", pat: 23 };
  var WK_JOIST = { piece: true, color: "#cfa868", edge: "#9c7c48", pat: 21 };
  var WK_SHEET = { piece: true, color: "#c9a56b", edge: "#9a7b48", pat: 21 };
  // (not drawn as a wall or a roof is -- painted in the house's own materials -- but as boards)
  var WK_ROOFB = { color: "#b99862", edge: "#8a7048", pat: 21, roof: false, piece: true };      // a roof's boards, before its covering
  var WK_WRAP = { color: "#c9a56b", edge: "#9a7b48", pat: 21, wall: false, piece: true };       // a wall's sheathing, before its siding

  // ---- the walls of a storey, each framed once ---------------------------------------------------------
  // Each line of wall (shared by two rooms: once), with where its doors and
  // windows are along it, which side is in, and its height.
  function jbWalls(J, li) {
    var L = J.levels[li], P = J.P, seen = {}, out = [], plan = J.plan;
    var floors = J.site.floors;
    function inRoom(x, y) { return L.rooms.some(function (o) { return wkInPoly(o.poly, x, y); }); }
    L.rooms.forEach(function (o) {
      var r = o.r, T = Math.max(1, Math.min(6, Math.min(r.w, r.h) * 0.06)), hw = r.w / 2, hh = r.h / 2, H = o.ceil;
      var edges = [[-hw, -hh + T / 2, hw, -hh + T / 2], [hw - T / 2, -hh, hw - T / 2, hh], [hw, hh - T / 2, -hw, hh - T / 2], [-hw + T / 2, hh, -hw + T / 2, -hh]];
      edges.forEach(function (e) {
        var a = v3Local(r, e[0], e[1]), b = v3Local(r, e[2], e[3]);
        a = [a[0] + o.dx, a[1] + o.dy]; b = [b[0] + o.dx, b[1] + o.dy];
        var k = [Math.round((a[0] + b[0]) / 2 / (0.5 * P)), Math.round((a[1] + b[1]) / 2 / (0.5 * P))].join(":");
        if (seen[k]) { return; }
        seen[k] = true;
        var len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 0.3 * P) { return; }
        var u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [-u[1], u[0]], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        var s1 = inRoom(mid[0] + n[0] * 0.6 * P, mid[1] + n[1] * 0.6 * P), s2 = inRoom(mid[0] - n[0] * 0.6 * P, mid[1] - n[1] * 0.6 * P);
        var ext = s1 !== s2, lay = s1 ? n : [-n[0], -n[1]];
        // where it is open: its doors, its windows
        var gaps = [];
        hand.nodes.forEach(function (d) {
          if (!WALK_DOORS[d.kind]) { return; }
          var f = floors.length ? floorAt(floors, d.x, d.y) : null;
          if (f ? Math.abs(f.z - o.z) > 2 : li !== J.g) { return; }
          var p = [d.x + (f ? f.dx : 0), d.y + (f ? f.dy : 0)], t = (p[0] - a[0]) * u[0] + (p[1] - a[1]) * u[1], off = Math.abs((p[0] - a[0]) * n[0] + (p[1] - a[1]) * n[1]);
          if (off > 0.4 * P || t < -0.2 * P || t > len + 0.2 * P) { return; }
          var w = Math.max(0.75 * P, Math.min(5.5 * P, Math.max(d.w || 40, d.h || 10)));
          gaps.push({ t0: Math.max(0, t - w / 2), t1: Math.min(len, t + w / 2), sill: 0, head: Math.min(H - 0.2 * P, (d.kind === "i_garagedoor" ? 2.3 : 2.1) * P), door: d });
        });
        Object.keys(plan.groups).forEach(function (gk) {
          if (gk.indexOf("glass:") !== 0) { return; }
          var G = plan.groups[gk];
          if (G.lvl !== li) { return; }
          var c = [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2], t = (c[0] - a[0]) * u[0] + (c[1] - a[1]) * u[1], off = Math.abs((c[0] - a[0]) * n[0] + (c[1] - a[1]) * n[1]);
          if (off > 0.45 * P || t < 0 || t > len) { return; }
          var w = Math.abs(G.x1 - G.x0) * Math.abs(u[0]) + Math.abs(G.y1 - G.y0) * Math.abs(u[1]) + 0.1 * P;
          gaps.push({ t0: Math.max(0, t - w / 2), t1: Math.min(len, t + w / 2), sill: Math.max(0.2 * P, G.lo - o.z), head: Math.min(H - 0.15 * P, G.hi - o.z), glass: gk });
        });
        out.push({ a: a, b: b, len: len, u: u, n: n, mid: mid, z: o.z, H: H, ext: ext, lay: lay, gaps: gaps, lvl: li, ang: Math.atan2(u[1], u[0]), room: r });
      });
    });
    // the outside walls first, round the building; then those between the rooms
    var cx = J.ctx.cx, cy = J.ctx.cy;
    out.sort(function (p, q) { return (q.ext - p.ext) || (Math.atan2(p.mid[1] - cy, p.mid[0] - cx) - Math.atan2(q.mid[1] - cy, q.mid[0] - cx)); });
    return out;
  }
  // a wall's pieces, in its own numbers: s along it, h up it
  function jbWallParts(W, P) {
    var parts = [], H = W.H, len = W.len;
    function open(s) { return W.gaps.some(function (g) { return s > g.t0 + 0.04 * P && s < g.t1 - 0.04 * P; }); }
    // the bottom plate (broken at the doors), the studs, the headers and sills, the top plates
    var cuts = [0];
    W.gaps.filter(function (g) { return g.door; }).sort(function (p, q) { return p.t0 - q.t0; }).forEach(function (g) { cuts.push(g.t0, g.t1); });
    cuts.push(len);
    for (var c = 0; c + 1 < cuts.length; c += 2) { if (cuts[c + 1] - cuts[c] > 0.1 * P) { parts.push({ s0: cuts[c], s1: cuts[c + 1], h0: 0.022 * P, h1: 0.022 * P, kind: "plate" }); } }
    var n = Math.max(2, Math.round(len / (0.6 * P)) + 1);
    for (var i = 0; i < n; i++) {
      var s = Math.min(len - 0.03 * P, Math.max(0.03 * P, i / (n - 1) * len));
      if (open(s)) { continue; }
      parts.push({ s0: s, s1: s, h0: 0.045 * P, h1: H - 0.09 * P, kind: "stud" });
    }
    W.gaps.forEach(function (g) {
      [g.t0 - 0.025 * P, g.t1 + 0.025 * P].forEach(function (s) { if (s > 0.02 * P && s < len - 0.02 * P) { parts.push({ s0: s, s1: s, h0: 0.045 * P, h1: H - 0.09 * P, kind: "stud" }); } });
      parts.push({ s0: g.t0, s1: g.t1, h0: g.head + 0.05 * P, h1: g.head + 0.05 * P, kind: "header" });
      if (g.sill > 0.1 * P) { parts.push({ s0: g.t0, s1: g.t1, h0: g.sill - 0.03 * P, h1: g.sill - 0.03 * P, kind: "plate" }); }
    });
    parts.push({ s0: 0, s1: len, h0: H - 0.068 * P, h1: H - 0.068 * P, kind: "plate" });
    parts.push({ s0: 0, s1: len, h0: H - 0.022 * P, h1: H - 0.022 * P, kind: "plate" });
    return parts;
  }
  // the wall drawn tipped `phi` from standing (0) to lying flat on the deck (pi/2), with its first `upTo` pieces
  function jbWallDraw(faces, W, parts, phi, upTo, P) {
    var s = Math.sin(phi), c = Math.cos(phi);
    function at(sv, h) { return [W.a[0] + W.u[0] * sv + W.lay[0] * h * s, W.a[1] + W.u[1] * sv + W.lay[1] * h * s, W.z + h * c]; }
    for (var i = 0; i < upTo && i < parts.length; i++) {
      var q = parts[i];
      var how = W.metal ? WK_MSTUD : WK_STUD;
      if (q.kind === "stud") { cnBeam(faces, at(q.s0, q.h0), at(q.s1, q.h1), 0.09 * P, how, 0.045 * P); }
      else { cnBeam(faces, at(q.s0, q.h0), at(q.s1, q.h1), 0.09 * P, how, q.kind === "header" ? 0.2 * P : 0.045 * P); }
    }
  }

  // ---- the telehandler: on site from the first delivery of timber till the last storey is framed ---------------
  function jbTele(plan) {
    var J = jbJ(plan), P = J.P, S = J.S;
    if (J.tele) { return J.tele; }
    var m = wkMachine(plan, "telehandler", {});
    m.site = J.site;
    // its spot: by the yard, on the lot
    var spot = wkNearStand(plan, { len: 5.2 * P, wid: 2.5 * P, target: J.yard.l, reach: 14 * P, min: J.yard.hh + 1.5 * P, t0: 0, t1: 1e9 }) ||
               { x: J.yard.l[0], y: J.yard.l[1] + J.yard.hh + 3 * P, ang: Math.PI / 2, hl: 3 * P, hw: 1.6 * P };
    m.stand = spot; m.home = [spot.x, spot.y]; m.free = 0; m.at = [spot.x, spot.y]; m.head = spot.ang;
    J.tele = m;
    return m;
  }
  // drive it from where it is to `to` (lot-local [x, y]), facing `face` (local radians) at the end
  function jbTeleDrive(plan, m, to, t, face, extra) {
    var site = plan.site, P = site.P, from = m.at, way = wkVehWay(site, from, to, 1.2 * P);
    var pts = way.length > 1 ? way : [from, to];
    var L = wkPolyline(pts.map(function (q) { return [q[0], q[1], 0]; })), dur = Math.max(1.5, L.len / (2.2 * P));
    var x0 = Object.assign({}, extra || {});
    wkMSeg(m, t, t + dur, function (k) { return Object.assign({ site: site, moving: true }, wkPoseOn(L, L.len * wkSmooth(k), false), x0); });
    var end = wkPoseOn(L, L.len, false), turn = face === undefined ? 0 : Math.abs(((face - end.ang) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
    t += dur;
    if (face !== undefined && turn > 0.1) {
      var h0 = end.ang, h1 = face;
      wkMSeg(m, t, t + 1.5, function (k) { return Object.assign({ site: site, x: to[0], y: to[1], ang: wkTurnTo(h0, h1, wkSmooth(k)), moving: true }, x0); });
      t += 1.5;
    }
    m.at = to.slice(); m.head = face === undefined ? end.ang : face; m.free = t;
    return t;
  }
  function jbTeleHold(plan, m, t0, t1, fn) {
    var site = plan.site, at = m.at.slice(), hd = m.head;
    wkMSeg(m, t0, t1, function (k, T) { return Object.assign({ site: site, x: at[0], y: at[1], ang: hd }, fn ? fn(k, T) : {}); });
    m.free = t1;
  }
  // lift a load from the yard to a point (world) -- up onto a deck, or over onto a trailer -- and set it down there
  function jbTeleLift(plan, J, dest, t, load) {
    var m = jbTele(plan), P = J.P, S = J.S, site = J.site;
    t = Math.max(t, m.free);
    // to the yard, the forks under a bundle
    var yd = J.yard.l, near = wkNearStand(plan, { len: 5.2 * P, wid: 2.5 * P, target: yd, reach: 7 * P, min: J.yard.hh + 1.2 * P, t0: t, t1: t + 30 });
    var pick = near ? [near.x, near.y] : m.at.slice();
    t = jbTeleDrive(plan, m, pick, t, Math.atan2(yd[1] - pick[1], yd[0] - pick[0]), { boom: 0.05, ext: 0 });
    jbTeleHold(plan, m, t, t + 3, function (k) { return { boom: 0.05 + 0.08 * k, ext: 0.6 * k, load: k > 0.5 ? load : null }; });
    t += 3;
    // over to the building, as near the spot as it can stand
    var dl = jbLocal(J, dest), stand = wkNearStand(plan, { len: 5.2 * P, wid: 2.5 * P, target: dl, reach: 9 * P, min: 2.2 * P, t0: t, t1: t + 40 });
    var to = stand ? [stand.x, stand.y] : m.at.slice(), face = Math.atan2(dl[1] - to[1], dl[0] - to[0]);
    t = jbTeleDrive(plan, m, to, t, face, { boom: 0.13, ext: 0.6, load: load });
    // boom up and out to the deck, set down, back
    var hz = (dest[2] || 0) / P, reachM = Math.max(0.5, Math.hypot(dl[0] - to[0], dl[1] - to[1]) / P - 0.6);
    var boom = Math.atan2(hz + 0.4 - 1.55, reachM + 1.8), ext = Math.max(0, Math.hypot(reachM + 1.8, hz + 0.4 - 1.55) - 4.0);
    jbTeleHold(plan, m, t, t + 5, function (k) { var q = wkSmooth(k); return { boom: 0.13 + (boom - 0.13) * q, ext: 0.6 + (ext - 0.6) * q, load: load }; });
    jbTeleHold(plan, m, t + 5, t + 7, function (k) { return { boom: boom - 0.03 * k, ext: ext, load: k < 0.5 ? load : null }; });
    var placed = t + 6;
    jbTeleHold(plan, m, t + 7, t + 11, function (k) { var q = wkSmooth(k); return { boom: boom + (0.05 - boom) * q, ext: ext * (1 - q) }; });
    m.free = t + 11;
    return placed;
  }

  // ---- 5. the timber delivered: a flatbed of it, taken off by the telehandler ---------------------------
  WK_PHASES.push({ name: "lumber", make: function (plan) {
    if (jbJ(plan).frame !== "wood") { return; }               // (steel: 40-works-steel.js)
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, t = Math.max(J.foundAt - 60, J.startAt + 30);
    var tele = jbTele(plan);
    // the telehandler comes in on its own wheels: along the road, up onto the lot, to its spot
    var tCome = t - 10, far = S.far || 60 * P, lane = site.lanes.w;
    var inWay = wkVehWay(site, [tele.stand.x, lane], [tele.stand.x, tele.stand.y], 1.3 * P);
    var road = wkPolyline([[far, lane, 0], [tele.stand.x + 4 * P, lane, 0]].concat(inWay.map(function (q) { return [q[0], q[1], 0]; })));
    var tf = road.len / (3.5 * P);
    wkMSeg(tele, tCome - tf, tCome, function (k) { return Object.assign({ site: site, moving: true, boom: 0.05 }, wkPoseOn(road, road.len * wkEaseDrive(k), false)); });
    tele.free = tCome; tele.at = [tele.stand.x, tele.stand.y]; tele.head = wkPoseOn(road, road.len, false).ang;
    // the flatbed at the kerb by the yard; four bundles, each lifted off and put down in the yard
    var semi = jbVehicle(plan, "semi", { target: [J.yard.l[0], S.kerb + 1.4 * P], street: true, t0: t - 20, t1: t + 200 }, { paint: "#3f6e4a", stripe: "#3b4350", cargo: "lumber" });
    jbCome(plan, semi, semi.stand, 19 * P, t, { speed: 5, extra: { load: 1 } });
    var bundles = 4, offs = [], took = [];
    var bedW = function (i) { var x = semi.stand.x - (MO_FIFTH - 1.6 - i * 3.3) * P; return jbWorld(J, [x + 2 * P, semi.stand.y], 1.4 * P); };
    for (var i = 0; i < bundles; i++) {
      // off the trailer: the telehandler drives up beside it, forks over, lifts, backs off to the yard
      var lotHw = site.lot ? site.lot.w / 2 : (S.box[1] - S.box[0]) / 2 + 6 * P;
      var bx = Math.max(-lotHw + 2.5 * P, Math.min(lotHw - 2.5 * P, semi.stand.x + (2.6 + i * 3.4) * P));
      var tt = Math.max(t + 2, tele.free), side = [bx, S.hy - 2.0 * P];
      tt = jbTeleDrive(plan, tele, side, tt, Math.PI / 2, { boom: 0.08, ext: 0 });
      jbTeleHold(plan, tele, tt, tt + 4, function (k) { return { boom: 0.08 + 0.1 * k, ext: 1.4 * k, load: k > 0.6 ? { h: 0.9, how: WK_STUD } : null }; });
      took.push(tt + 3);
      tt += 4;
      var drop = [J.yard.l[0] + (i - 1.5) * 1.5 * P, J.yard.l[1]];
      var at = [drop[0], drop[1] + J.yard.hh + 2.2 * P];
      tt = jbTeleDrive(plan, tele, at, tt, -Math.PI / 2, { boom: 0.15, ext: 0.6, load: { h: 0.9, how: WK_STUD } });
      jbTeleHold(plan, tele, tt, tt + 3, function (k) { return { boom: 0.15 - 0.1 * k, ext: 0.6, load: k < 0.6 ? { h: 0.9, how: WK_STUD } : null }; });
      offs.push(tt + 2);
      tele.free = tt + 3;
      (function (dp, when) {
        var w = jbWorld(J, dp, 0);
        wkPiece(plan, when, wkFacesOf(function (f) {
          cnBox(f, w[0], w[1], 0.6 * P, 0.55 * P, 0, 0.12 * P, WK_STUD, S.a);
          cnBox(f, w[0], w[1], 0.55 * P, 0.5 * P, 0.12 * P, 1.0 * P, WK_STUD, S.a);
          cnBox(f, w[0], w[1], 0.57 * P, 0.52 * P, 0.98 * P, 1.02 * P, { piece: true, color: "#e8e2d2", edge: "#b8b0a0", pat: 27 }, S.a);
        }), { t1: 1e9 });
      })(drop, tt + 2);
    }
    jbStay(semi, semi.here, tele.free + 1, function (k, T) { var n = 0; took.forEach(function (x) { if (T >= x) { n++; } }); return { load: 1 - n / bundles }; });
    semi.here = tele.free + 1;
    jbGo(plan, semi, tele.free + 1, { speed: 5, extra: { load: 0 } });
    J.lumberAt = tele.free;
    J.lumberStacks = offs;
    wkSay(plan, "jb_lumber", t - 15, tele.free);
    tele.at = [tele.stand.x, tele.stand.y];
  } });

  // ---- 6. the frame: storey by storey -- the deck, its walls, the stairs ---------------------------------
  WK_PHASES.push({ name: "frame", make: function (plan) {
    if (jbJ(plan).frame !== "wood") { return; }
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, crew = J.crew;
    var t = Math.max(J.foundAt || 0, J.lumberAt || 0) + 2;
    J.frameAt = t;
    var levels = J.levels, first = J.g;
    // a ladder against the building, by the yard: up to each storey's deck while the stairs are not in
    var yd = J.yard.w, best = null, bd = Infinity;
    jbWalls(J, first).filter(function (W) { return W.ext; }).forEach(function (W) {
      var d = Math.hypot(W.mid[0] - yd[0], W.mid[1] - yd[1]);
      if (d < bd) { bd = d; best = W; }
    });
    if (best) {
      var outN = [-best.lay[0], -best.lay[1]], foot = [best.mid[0] + outN[0] * 0.9 * P, best.mid[1] + outN[1] * 0.9 * P];
      J.upLadder = function (li, lj) {
        var hi = Math.max(li, lj), L = levels[hi];
        if (!L) { return null; }
        var z = L.z, inn = [best.mid[0] - outN[0] * 0.9 * P, best.mid[1] - outN[1] * 0.9 * P, z];
        return { foot: [foot[0], foot[1], 0], top: inn, pts: [[foot[0], foot[1], 0], [foot[0] - outN[0] * 0.35 * P, foot[1] - outN[1] * 0.35 * P, 0], [foot[0] - outN[0] * 0.35 * P, foot[1] - outN[1] * 0.35 * P, z], inn] };
      };
      var oldLadder = plan.ladder;
      plan.ladder = function (li, lj) { return (li === J.base || lj === J.base) && J.pitLadder ? J.pitLadder : J.upLadder(li, lj); };
      void oldLadder;
      var topZ = levels[levels.length - 1].z + 0.9 * P;
      wkPiece(plan, t, wkFacesOf(function (f) {
        var bx = foot[0] - outN[0] * 0.35 * P, by = foot[1] - outN[1] * 0.35 * P, sx = -outN[1] * 0.25 * P, sy = outN[0] * 0.25 * P;
        [-1, 1].forEach(function (s2) { cnBeam(f, [bx + sx * s2 + outN[0] * 0.4 * P, by + sy * s2 + outN[1] * 0.4 * P, 0], [bx + sx * s2, by + sy * s2, topZ], 0.05 * P, WK_STEELY); });
        for (var r = 0; r * 0.3 * P < topZ; r++) { var q = r * 0.3 * P / topZ; cnBeam(f, [bx - sx + outN[0] * 0.4 * P * (1 - q), by - sy + outN[1] * 0.4 * P * (1 - q), r * 0.3 * P], [bx + sx + outN[0] * 0.4 * P * (1 - q), by + sy + outN[1] * 0.4 * P * (1 - q), r * 0.3 * P], 0.03 * P, WK_STEELY); }
      }), { t1: 1e9 });
      J.upLadderPc = plan.pieces[plan.pieces.length - 1];
    }
    var deckTop = {};
    for (var li = first; li < levels.length; li++) {
      var L = levels[li];
      // the deck under this storey: on the foundation walls (over a basement), or on the walls below
      if (li > first || J.base >= 0) {
        t = jbDeck(plan, J, li, t);
      }
      deckTop[li] = t;
      // the timber for this storey's walls: lifted onto its deck (above the ground)
      var stack = J.yard.w;
      if (li > first || J.base >= 0) {
        var inner = L.rooms[0] ? [L.rooms[0].r.x + L.rooms[0].dx, L.rooms[0].r.y + L.rooms[0].dy] : [J.ctx.cx, J.ctx.cy];
        var edge = jbNearEdge(J, li, J.yard.w);
        stack = [edge[0] + (inner[0] - edge[0]) * 0.15, edge[1] + (inner[1] - edge[1]) * 0.15, L.z];
        var placed = jbTeleLift(plan, J, stack, Math.max(t - 20, J.lumberAt || 0), { h: 0.8, how: WK_STUD });
        (function (st, when) {
          wkPiece(plan, when, wkFacesOf(function (f) { cnBox(f, st[0], st[1], 0.55 * P, 0.5 * P, st[2], st[2] + 0.8 * P, WK_STUD, S.a); }), { t1: 1e9 });
        })(stack, placed);
        t = Math.max(t, placed);
      }
      // the walls: outside first, then between the rooms
      var walls = jbWalls(J, li), wallsDone = t, extDone = t;
      walls.forEach(function (W) {
        var end = jbFrameWall(plan, J, W, stack, t);
        wallsDone = Math.max(wallsDone, end);
        if (W.ext) { extDone = Math.max(extDone, end); }
      });
      plan.wallsAt[li] = extDone;
      J["wallsUp" + li] = wallsDone;
      t = extDone;
      if (li === first) {
        // once the ground floor's outside walls stand: in and out by the front door
        plan.closedAt = extDone;
        var dr = site.door;
        if (dr) {
          var fz = L.z;
          plan.entry = function () { return { out: [dr.out[0], dr.out[1], 0], in: [dr.in[0], dr.in[1], fz] }; };
        }
      }
    }
    J.frameDone = Math.max.apply(null, crew.map(function (w) { return w.free; }));
    // the stairs: built up from the floor, each by a carpenter
    var stairs = Object.keys(plan.groups).filter(function (k) { return k.indexOf("rise:") === 0; });
    stairs.forEach(function (k) {
      var G = plan.groups[k], w = wkPick(plan, 1, [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, G.lo])[0];
      var to = [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, levels[G.lvl] ? levels[G.lvl].z : 0];
      wkGo(plan, w, to, { carry: { kind: "studs", n: 3, len: 2.4 }, after: deckTop[Math.min(levels.length - 1, G.lvl + 1)] || J.frameAt });
      var t0 = w.free;
      wkDo(w, 18, "hammer");
      wkReveal(plan, k, t0, w.free, "cut");
    });
    if (stairs.length) { plan.stairsAt = Math.max.apply(null, stairs.map(function (k) { return plan.rv[k].t1; })); }
    wkSay(plan, "jb_frame", J.frameAt, J.frameDone);
    plan.T = Math.max(plan.T, J.frameDone);
  } });
  // the point of a storey's outline nearest a point (world)
  function jbNearEdge(J, li, p) {
    var best = null, bd = Infinity;
    J.levels[li].rooms.forEach(function (o) {
      for (var i = 0; i < 4; i++) {
        var a = o.poly[i], b = o.poly[(i + 1) % 4], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
        var k = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)), q = [a[0] + dx * k, a[1] + dy * k], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
        if (d < bd) { bd = d; best = q; }
      }
    });
    return best || [J.ctx.cx, J.ctx.cy];
  }
  // One wall: made flat on the deck by a pair, piece by piece, an armful
  // carried over each time; tipped up together; nailed off.
  function jbFrameWall(plan, J, W, stack, t) {
    var P = J.P, parts = jbWallParts(W, P), pair = wkPick(plan, 2, [W.mid[0], W.mid[1], W.z]), when = [];
    var side = function (s, d) { return [W.a[0] + W.u[0] * s + W.lay[0] * d, W.a[1] + W.u[1] * s + W.lay[1] * d, W.z]; };
    var face = Math.atan2(-W.lay[1], -W.lay[0]);
    var i = 0, trip = 0;
    while (i < parts.length) {
      var w = pair[trip % 2], batch = parts.slice(i, i + 6);
      wkGo(plan, w, [stack[0] + (trip % 2 ? 0.7 : -0.7) * P, stack[1], stack[2] || W.z], { after: t });
      wkDo(w, 0.7, "hold");
      var first = batch[0], s0 = (first.s0 + first.s1) / 2;
      wkGo(plan, w, side(Math.max(0.2 * P, Math.min(W.len - 0.2 * P, s0)), W.H * 0.55), { carry: { kind: "studs", n: Math.min(4, batch.length), len: Math.min(3.0, Math.max(1.2, (W.H + 0.1) / P)) } });
      batch.forEach(function (q) {
        var sm = Math.max(0.15 * P, Math.min(W.len - 0.15 * P, (q.s0 + q.s1) / 2));
        wkGo(plan, w, side(sm, W.H * 0.55), { straight: true });
        wkDo(w, 0.9, "kneel", face);
        when.push(w.free);
      });
      i += batch.length; trip++;
    }
    // tipped up: both at its top edge, lifting it as they walk it up
    var tUp = wkTogether(pair);
    pair.forEach(function (w, k) {
      var s = W.len * (k ? 0.72 : 0.28);
      wkGo(plan, w, side(s, W.H * 0.95), { straight: true });
    });
    tUp = wkTogether(pair);
    var tilt = 3.2;
    pair.forEach(function (w) { wkDo(w, tilt, "up", face); });
    pair.forEach(function (w, k) { wkGo(plan, w, side(W.len * (k ? 0.72 : 0.28), 0.6 * P), { straight: true }); wkDo(w, 2.2, "hammer", face); });
    var tDone = wkTogether(pair);
    var tilted = tUp + tilt;
    wkPiece(plan, when[0] || tUp, [], { live: function (faces, T) {
      if (T >= tilted) { return; }
      var n = 0; for (var q = 0; q < when.length; q++) { if (T >= when[q]) { n++; } }
      var phi = T < tUp ? Math.PI / 2 : Math.PI / 2 * (1 - wkSmooth((T - tUp) / tilt));
      jbWallDraw(faces, W, parts, phi, n, P);
    } });
    // and standing: drawn once, kept
    var up = wkPiece(plan, tilted, wkFacesOf(function (f) { jbWallDraw(f, W, parts, 0, parts.length, P); }));
    W.piece = up; W.done = tDone;
    (J.wallPieces || (J.wallPieces = [])).push(W);
    return tDone;
  }
  // A deck: the joists across each room, then the boards over them, row by row
  function jbDeck(plan, J, li, t, top) {
    var L = J.levels[li], P = J.P, S = J.S, crew = J.crew, end = t;
    var stack = J.yard.w;
    // (up off the ground: the joists and boards lifted up to it by the telehandler, taken from there)
    var deckZ = top ? L.top : L.z;
    if (deckZ > 1.0 * P) {
      var edge = jbNearEdge(J, li, J.yard.w), inner = L.rooms[0] ? [L.rooms[0].r.x + L.rooms[0].dx, L.rooms[0].r.y + L.rooms[0].dy] : [J.ctx.cx, J.ctx.cy];
      stack = [edge[0] + (inner[0] - edge[0]) * 0.12, edge[1] + (inner[1] - edge[1]) * 0.12, deckZ];
      var placed = jbTeleLift(plan, J, stack, Math.max(t - 25, J.lumberAt || 0), { h: 0.7, how: WK_SHEET });
      (function (st, when) {
        wkPiece(plan, when, wkFacesOf(function (f) { cnBox(f, st[0], st[1], 0.6 * P, 0.6 * P, st[2], st[2] + 0.7 * P, WK_SHEET, S.a); }), { t1: 1e9 });
      })(stack, placed);
      t = Math.max(t, placed);
      end = t;
    }
    L.rooms.forEach(function (o) {
      var r = o.r, along = r.w >= r.h, span = along ? r.h : r.w, run = along ? r.w : r.h, n = Math.max(2, Math.round(run / (0.6 * P)) + 1);
      var tt = (r.turn || 0) * Math.PI / 180, c = Math.cos(tt), s = Math.sin(tt), cx = r.x + o.dx, cy = r.y + o.dy, z = top ? o.z + o.ceil : o.z;
      function at(lx, ly, h) { return [cx + lx * c - ly * s, cy + lx * s + ly * c, h]; }
      var joists = [];
      for (var k = 0; k < n; k++) {
        var u = -run / 2 + run * k / (n - 1);
        joists.push(along ? [at(u, -span / 2, z - 0.15 * P), at(u, span / 2, z - 0.15 * P)] : [at(-span / 2, u, z - 0.15 * P), at(span / 2, u, z - 0.15 * P)]);
      }
      joists.forEach(function (j) {
        var w = wkPick(plan, 1, j[0])[0], mid = wkLerp(j[0], j[1], 0.5);
        wkGo(plan, w, [stack[0], stack[1], stack[2] || 0], { after: t });
        wkDo(w, 0.9, "hold");
        wkGo(plan, w, [mid[0], mid[1], z], { carry: { kind: "board", n: 1, len: Math.min(4, span / P), how: WK_JOIST } });
        wkDo(w, 2.2, "hammer");
        wkPiece(plan, w.free, wkFacesOf(function (f) { cnBeam(f, j[0], j[1], 0.05 * P, WK_JOIST, 0.24 * P); }), { t1: 1e9 });
        end = Math.max(end, w.free);
      });
      // the boards: 1.2 by 2.4 m, rows across
      var nx = Math.max(1, Math.ceil(r.w / (2.4 * P))), ny = Math.max(1, Math.ceil(r.h / (1.2 * P)));
      for (var yy = 0; yy < ny; yy++) {
        for (var xx = 0; xx < nx; xx++) {
          (function (xx, yy) {
            var x0 = -r.w / 2 + r.w * xx / nx, x1 = -r.w / 2 + r.w * (xx + 1) / nx, y0 = -r.h / 2 + r.h * yy / ny, y1 = -r.h / 2 + r.h * (yy + 1) / ny;
            var mid = at((x0 + x1) / 2, (y0 + y1) / 2, z), w = wkPick(plan, 1, mid)[0];
            wkGo(plan, w, [stack[0], stack[1], stack[2] || 0], { after: end - 30 });
            wkDo(w, 0.9, "hold");
            wkGo(plan, w, mid, { carry: { kind: "sheet", w: 1.2, h: 2.4, how: WK_SHEET } });
            wkDo(w, 2.0, "kneel");
            wkPiece(plan, w.free, wkFacesOf(function (f) {
              v3Prism(f, [at(x0, y0), at(x1, y0), at(x1, y1), at(x0, y1)].map(function (p) { return [p[0], p[1]]; }), z - 0.035 * P, z - 0.015 * P, WK_SHEET);
            }), { t1: 1e9 });
            end = Math.max(end, w.free);
          })(xx, yy);
        }
      }
    });
    wkSay(plan, "jb_deck", t, end);
    return end;
  }

  // ---- 7. the roof: the trusses lifted on by the crane, then boarded and covered ------------------------------
  WK_PHASES.push({ name: "roof", make: function (plan) {
    if (jbJ(plan).frame !== "wood") { return; }
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, ctx = J.ctx, crew = J.crew;
    var top = J.levels[J.levels.length - 1], t = (plan.wallsAt[J.levels.length - 1] || J.frameDone || plan.T) + 2;
    var roofKeys = Object.keys(plan.groups).filter(function (k) { return k.indexOf("roof:") === 0; });
    var rLo = Infinity, rHi = -Infinity;
    roofKeys.forEach(function (k) { rLo = Math.min(rLo, plan.groups[k].lo); rHi = Math.max(rHi, plan.groups[k].hi); });
    var pitched = roofKeys.some(function (k) { return k.split(":")[1] !== "flat"; }) && rHi > rLo + 0.5 * P;
    if (pitched) { ctx = Object.assign({}, ctx, { roofLow: rLo, roofTop: rHi }); }
    if (pitched) {
      // the trusses: along the long way, every 60 cm (two at a lift on a long house)
      var alongX = ctx.x1 - ctx.x0 >= ctx.y1 - ctx.y0, len = alongX ? ctx.x1 - ctx.x0 : ctx.y1 - ctx.y0, span = alongX ? ctx.y1 - ctx.y0 : ctx.x1 - ctx.x0;
      var nt = Math.max(3, Math.round(len / (0.6 * P))), zl = ctx.roofLow, zr = ctx.roofTop;
      var lifts = nt > 16 ? Math.ceil(nt / 2) : nt, per = Math.ceil(nt / lifts);
      function truss(f, at, lift, k) {
        function p(u, z) { return alongX ? [at, ctx.y0 + span * u, z + lift] : [ctx.x0 + span * u, at, z + lift]; }
        cnBeam(f, p(0, zl), p(1, zl), 0.07 * P, WK_STUD);
        cnBeam(f, p(0, zl), p(0.5, zr), 0.07 * P, WK_STUD);
        cnBeam(f, p(1, zl), p(0.5, zr), 0.07 * P, WK_STUD);
        cnBeam(f, p(0.5, zl), p(0.5, zr), 0.05 * P, WK_STUD);
        cnBeam(f, p(0.25, zl), p(0.5, zl + (zr - zl) * 0.5), 0.04 * P, WK_STUD);
        cnBeam(f, p(0.75, zl), p(0.5, zl + (zr - zl) * 0.5), 0.04 * P, WK_STUD);
        void k;
      }
      // the truss lorry at the kerb; the crane where its hook can reach the lorry and the whole roof
      var tTruck = t - 25;
      var semi = jbVehicle(plan, "semi", { len: 19 * P, wid: 2.6 * P, target: [(S.box[0] + S.box[1]) / 2 + 8 * P, S.kerb + 1.4 * P], street: true, t0: tTruck - 30, t1: tTruck + lifts * 18 + 60 }, { paint: "#2f5d8a", stripe: "#3b4350", cargo: "truss" });
      jbCome(plan, semi, semi.stand, 19 * P, tTruck, { speed: 5, extra: { load: 1 } });
      var crane = jbVehicle(plan, "crane", { len: 13 * P, wid: 2.8 * P, target: [(S.box[0] + S.box[1]) / 2 - 6 * P, S.kerb + 1.4 * P], street: true, t0: tTruck - 40, t1: tTruck + lifts * 18 + 80 });
      var cSet = tTruck - 5;
      jbCome(plan, crane, crane.stand, 13 * P, cSet - 14, { speed: 5 });
      jbStay(crane, cSet - 14, cSet, function (k) { return { legs: wkSmooth(k), luff: 0.15 + 0.6 * wkSmooth((k - 0.4) / 0.6), len: 10, hook: 3, swing: 0 }; });
      var bedP = jbWorld(J, [semi.stand.x + 9 * P, semi.stand.y], 1.6 * P);
      var cst0 = { x: crane.stand.x, y: crane.stand.y, ang: crane.stand.ang, site: site };
      var lt = Math.max(cSet, t), prev = wkCraneAim(cst0, plan, bedP, bedP[2] + 2 * P), trussAt = [];
      // two on the walls to take each one: at its ends
      var pair = wkPick(plan, 2, [ctx.cx, ctx.cy, zl]);
      pair.forEach(function (w, i) {
        var at0 = alongX ? [ctx.x0 + 0.3 * P, i ? ctx.y1 - 0.4 * P : ctx.y0 + 0.4 * P] : [i ? ctx.x1 - 0.4 * P : ctx.x0 + 0.4 * P, ctx.y0 + 0.3 * P];
        wkGo(plan, w, [at0[0], at0[1], top.z], { after: lt - 20 });
        wkGo(plan, w, [at0[0], at0[1], zl], { straight: true });
      });
      for (var q = 0; q < lifts; q++) {
        var ids = [];
        for (var r = 0; r < per; r++) { var idx = q * per + r; if (idx < nt) { ids.push(idx); } }
        var atL = (alongX ? ctx.x0 : ctx.y0) + len * ((ids[0] + ids[ids.length - 1]) / 2) / Math.max(1, nt - 1);
        var dest = alongX ? [atL, (ctx.y0 + ctx.y1) / 2, zl] : [(ctx.x0 + ctx.x1) / 2, atL, zl];
        var aimBed = wkCraneAim(cst0, plan, bedP, bedP[2] + 0.6 * P), aimUp = wkCraneAim(cst0, plan, bedP, zr + 3 * P), aimOver = wkCraneAim(cst0, plan, dest, zr + 3 * P), aimSet = wkCraneAim(cst0, plan, dest, zl + 1.4 * P);
        // down to the lorry, hooked on, up, swung over, lowered, unhooked, back
        var k0 = lt, kA = k0 + 4, kB = kA + 2, kC = kB + 3, kD = kC + 4, kE = kD + 3, kF = kE + 2;
        (function (p0, a1, a2, a3, a4, ids2, k0, kA, kB, kC, kD, kE, kF, atL, dest) {
          function mix(a, b, k) { return { swing: wkTurnTo(a.swing, b.swing, k), luff: a.luff + (b.luff - a.luff) * k, len: a.len + (b.len - a.len) * k, hook: a.hook + (b.hook - a.hook) * k }; }
          function load(at, rot) {
            return { draw: function (faces, hook) {
              // the truss(es) hanging under the hook, turned as they swing round to their place
              var off = [hook[0] - dest[0], hook[1] - dest[1]];
              ids2.forEach(function (idx2, j) {
                var tAt = (alongX ? ctx.x0 : ctx.y0) + len * idx2 / Math.max(1, nt - 1);
                var f0 = faces.length;
                truss(faces, tAt, hook[2] - 1.4 * P - zl, idx2);
                for (var m2 = f0; m2 < faces.length; m2++) {
                  faces[m2].pts = faces[m2].pts.map(function (pp) { return [pp[0] + off[0] + (alongX ? atL - atL : 0), pp[1] + off[1], pp[2]]; });
                  faces[m2].moves = true;
                }
              });
              void at; void rot;
            } };
          }
          wkMSeg(crane, k0, kA, function (k) { return Object.assign({ legs: 1 }, mix(p0, a1, wkSmooth(k))); });
          wkMSeg(crane, kA, kB, function () { return Object.assign({ legs: 1 }, a1); });
          wkMSeg(crane, kB, kC, function (k) { return Object.assign({ legs: 1, load: load() }, mix(a1, a2, wkSmooth(k))); });
          wkMSeg(crane, kC, kD, function (k) { return Object.assign({ legs: 1, load: load() }, mix(a2, a3, wkSmooth(k))); });
          wkMSeg(crane, kD, kE, function (k) { return Object.assign({ legs: 1, load: load() }, mix(a3, a4, wkSmooth(k))); });
          wkMSeg(crane, kE, kF, function () { return Object.assign({ legs: 1 }, a4); });
        })(prev, aimBed, aimUp, aimOver, aimSet, ids, k0, kA, kB, kC, kD, kE, kF, atL, dest);
        // its segments: the crane's own pose fields, the stand added by the drawing
        crane.segs.slice(-6).forEach(function (sg) { var fn = sg.state; sg.state = function (k, T) { return Object.assign({ x: cst0.x, y: cst0.y, ang: cst0.ang, site: site }, fn(k, T)); }; });
        ids.forEach(function (idx3) {
          var tAt = (alongX ? ctx.x0 : ctx.y0) + len * idx3 / Math.max(1, nt - 1);
          wkPiece(plan, kE + 0.5, wkFacesOf(function (f) { truss(f, tAt, 0, idx3); }), { t1: 1e9 });
        });
        trussAt.push(kE);
        // those on the walls: along to it, guiding it down, nailing it
        pair.forEach(function (w, i) {
          var at1 = alongX ? [atL, i ? ctx.y1 - 0.4 * P : ctx.y0 + 0.4 * P] : [i ? ctx.x1 - 0.4 * P : ctx.x0 + 0.4 * P, atL];
          wkGo(plan, w, [at1[0], at1[1], zl], { straight: true, after: kC });
          wkDo(w, Math.max(0.5, kE - w.free), "up", Math.atan2(dest[1] - at1[1], dest[0] - at1[0]));
          wkDo(w, 2.5, "hammer");
        });
        prev = aimSet;
        lt = Math.max(kF, pair[0].free - 6);
      }
      jbStay(semi, semi.here, lt, function (k, T) { var n = 0; trussAt.forEach(function (x) { if (T >= x) { n++; } }); return { load: 1 - n / lifts }; });
      semi.here = lt;
      jbGo(plan, semi, lt + 1, { speed: 5, extra: { load: 0 } });
      var stow = prev;
      wkMSeg(crane, lt, lt + 14, function (k) { return { x: cst0.x, y: cst0.y, ang: cst0.ang, site: site, legs: 1 - wkSmooth((k - 0.5) * 2), swing: wkTurnTo(stow.swing, 0, wkSmooth(k)), luff: stow.luff + (0.15 - stow.luff) * wkSmooth(k), len: stow.len + (10 - stow.len) * wkSmooth(k), hook: 3 }; });
      crane.here = lt + 14;
      jbGo(plan, crane, lt + 14, { speed: 5 });
      pair.forEach(function (w) { wkGo(plan, w, [w.at[0], w.at[1], top.z], { straight: true }); });
      wkSay(plan, "jb_trusses", tTruck - 10, lt);
      t = lt + 2;
    } else {
      // a flat roof: joists across the top storey, like a deck, at its ceiling
      t = jbDeck(plan, J, J.levels.length - 1, t, true);
    }
    // the roof boarded, from the eaves up, each plane by two up on it
    var tB = t, bEnd = t;
    roofKeys.forEach(function (k, i) {
      var G = plan.groups[k], pair2 = wkPick(plan, 2, [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, G.lo]);
      var dur = Math.max(18, Math.min(70, (G.x1 - G.x0) * (G.y1 - G.y0) / (P * P) * 0.6));
      var s0 = wkTogether(pair2, tB);
      jbRoofCrew(plan, J, G, pair2, s0, dur, { kind: "sheet", w: 1.2, h: 2.4, how: WK_SHEET });
      var R = wkReveal(plan, k, 1e9, 1e9, "cut");
      R.pre = { t0: s0, t1: s0 + dur, how: WK_ROOFB, cut: true, lo: G.lo, hi: G.hi };
      G.boardAt = s0 + dur;
      bEnd = Math.max(bEnd, s0 + dur);
    });
    wkSay(plan, "jb_roofboards", tB, bEnd);
    // and covered: course after course, from the eaves to the ridge
    var cEnd = bEnd;
    roofKeys.forEach(function (k) {
      var G = plan.groups[k], pair3 = wkPick(plan, 2, [(G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, G.lo]);
      var dur = Math.max(25, Math.min(110, (G.x1 - G.x0) * (G.y1 - G.y0) / (P * P) * 0.9));
      var s0 = wkTogether(pair3, Math.max(G.boardAt || bEnd, bEnd - 20));
      jbRoofCrew(plan, J, G, pair3, s0, dur, { kind: "box", size: 0.35, how: { piece: true, color: "#4a4d52", edge: "#2f3236", pat: 0 } });
      var R = plan.rv[k];
      R.t0 = s0; R.t1 = s0 + dur; R.lo = G.lo; R.hi = G.hi;
      cEnd = Math.max(cEnd, s0 + dur);
    });
    // the gutters and trim at the eaves
    if (plan.groups.rtrim) { wkReveal(plan, "rtrim", cEnd - 10, cEnd, "fade"); }
    wkSay(plan, "jb_roofing", bEnd, cEnd);
    J.roofDone = cEnd;
    plan.T = Math.max(plan.T, cEnd);
  } });
  // Two on a roof plane, working up it from the eaves: up the ladder, along
  // the course they are at, a bundle carried each trip.
  function jbRoofCrew(plan, J, G, pair, t0, dur, carry) {
    var P = J.P, f = G.faces[0], n = f.n || [0, 0, 1];
    if (Math.abs(n[2]) < 0.05) { return; }
    var p0 = f.pts[0], off = n[0] * p0[0] + n[1] * p0[1] + n[2] * (p0[2] || 0);
    function zAt(x, y) { return (off - n[0] * x - n[1] * y) / n[2]; }
    // up the slope: against the plane's normal's lean
    var hz = Math.hypot(n[0], n[1]) || 1, up = [-n[0] / hz, -n[1] / hz], across = [-up[1], up[0]];
    var cx = (G.x0 + G.x1) / 2, cy = (G.y0 + G.y1) / 2, width = Math.abs(G.x1 - G.x0) * Math.abs(across[0]) + Math.abs(G.y1 - G.y0) * Math.abs(across[1]);
    var depth = Math.abs(G.x1 - G.x0) * Math.abs(up[0]) + Math.abs(G.y1 - G.y0) * Math.abs(up[1]);
    var steps = Math.max(2, Math.round(dur / 6));
    pair.forEach(function (w, i) {
      var eave = [cx - up[0] * depth * 0.45 + across[0] * width * (i ? 0.25 : -0.25), cy - up[1] * depth * 0.45 + across[1] * width * (i ? 0.25 : -0.25)];
      var p = [eave[0], eave[1], zAt(eave[0], eave[1]) + 0.05 * P];
      if (wkLen(w.at, p) > 1 * P) { wkGo(plan, w, [p[0], p[1], G.lo], { after: t0 - 10 }); wkGo(plan, w, p, { straight: true }); }
      for (var s = 0; s < steps; s++) {
        var k = (s + 0.5) / steps, sweep = Math.sin(s * 1.7 + i) * 0.3;
        var q = [cx + up[0] * depth * (k - 0.5) * 0.9 + across[0] * width * (sweep + (i ? 0.2 : -0.2)), cy + up[1] * depth * (k - 0.5) * 0.9 + across[1] * width * (sweep + (i ? 0.2 : -0.2))];
        var qz = [q[0], q[1], zAt(q[0], q[1]) + 0.05 * P];
        wkGo(plan, w, qz, { straight: true, after: t0 + dur * s / steps, carry: s % 2 ? null : carry });
        wkDo(w, Math.max(0.5, t0 + dur * (s + 1) / steps - w.free - 0.5), "kneel", Math.atan2(up[1], up[0]));
      }
    });
  }
