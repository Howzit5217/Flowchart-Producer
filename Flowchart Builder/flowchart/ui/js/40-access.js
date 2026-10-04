// ---------------------------------------------------------------------------
//  40-access.js -- a building open to everyone reachable by everyone: in its
//  parking, the accessible stalls nearest the way in, each with its striped
//  aisle beside it, a blue sign at its head; stalls for electric cars with
//  their chargers; and at a public way in, a ramp in place of the steps
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (my own, 2026-10-03: lots of parking and not one stall for a
  // wheelchair; steps up to a shop's door and no other way)  How many
  // accessible stalls, by how many there are in all (the ADA's table);
  // one in ten for electric cars.
  function acNeeded(n) { return n <= 0 ? 0 : n <= 25 ? 1 : n <= 50 ? 2 : n <= 75 ? 3 : n <= 100 ? 4 : n <= 150 ? 5 : n <= 200 ? 6 : 6 + Math.ceil((n - 200) / 100); }
  function acPublic() {
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, b) { return b.id - a.id; });
    var type = marks.length ? marks[0].madeWith.type || "house" : "house";
    return !{ house: 1, cabin: 1, duplex: 1, townhouses: 1 }[type];
  }
  // Each stall of a lot where it is: its middle, its way along the row, which way its nose points.
  function acStalls(lot) {
    if (typeof parkLayout !== "function") { return []; }
    var S = parkLayout(lot.w, lot.h), t = (lot.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    return S.stalls.map(function (st, i) {
      var lx = st.x - lot.w / 2, ly = st.y - lot.h / 2;
      return { i: i, x: lot.x + lx * c - ly * s, y: lot.y + lx * s + ly * c, lx: st.x, ly: st.y, head: st.head, c: c, s: s, turn: lot.turn || 0,
               w: st.w, h: st.h };
    });
  }
  // The ways in: the doors out of the ground floor (not a garage's).
  function acDoors() {
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    return hand.nodes.filter(function (d) {
      if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor" || d.backDoor || d.fireExit) { return false; }
      var f = floors.length ? floorAt(floors, d.x, d.y) : null;
      return !f || f.level === 0;
    });
  }
  // After the lots are laid (40-parking.js): the stalls chosen, the cars
  // out of the aisles.
  function acMark() {
    var lots = hand.nodes.filter(function (n) { return n.kind === "i_parking"; });
    if (!lots.length) { return; }
    var doors = acDoors(), all = [];
    lots.forEach(function (lot) { lot.access = []; lot.aisle = []; lot.ev = []; acStalls(lot).forEach(function (st) { st.lot = lot; all.push(st); }); });
    if (!all.length || !doors.length) { return; }
    function toDoor(st) { return Math.min.apply(null, doors.map(function (d) { return Math.hypot(d.x - st.x, d.y - st.y); })); }
    all.forEach(function (st) { st.far = toDoor(st); });
    var P = FLOOR_PX, byNear = all.slice().sort(function (a, b) { return a.far - b.far; }), want = acNeeded(all.length), used = {};
    function key(st) { return st.lot.id + ":" + st.i; }
    function beside(st) {
      // the stall next to it in its row, nose the same way
      return all.filter(function (o) { return o.lot === st.lot && o.head === st.head && Math.abs(o.ly - st.ly) < 0.5 * P && Math.abs(Math.abs(o.lx - st.lx) - 2.6 * P) < 0.4 * P && !used[key(o)]; })
                .sort(function (a, b) { return a.far - b.far; })[0] || null;
    }
    for (var k = 0; k < byNear.length && want > 0; k++) {
      var st = byNear[k];
      if (used[key(st)]) { continue; }
      var aisle = beside(st);
      if (!aisle) { continue; }
      used[key(st)] = used[key(aisle)] = true;
      st.lot.access.push(st.i); aisle.lot.aisle.push(aisle.i);
      want--;
    }
    // the chargers: the next nearest, one in ten
    var ev = Math.ceil(all.length * 0.1);
    for (var e = 0; e < byNear.length && ev > 0; e++) {
      if (used[key(byNear[e])]) { continue; }
      used[key(byNear[e])] = true;
      byNear[e].lot.ev.push(byNear[e].i);
      ev--;
    }
    // no car parked across an aisle
    var gone = {};
    all.forEach(function (st) {
      if (st.lot.aisle.indexOf(st.i) < 0) { return; }
      hand.nodes.forEach(function (n) { if (n.kind === "i_parked" && Math.hypot(n.x - st.x, n.y - st.y) < 1.4 * P) { gone[n.id] = true; } });
    });
    if (Object.keys(gone).length) {
      hand.nodes = hand.nodes.filter(function (n) { return !gone[n.id]; });
      hand.links = hand.links.filter(function (l) { return !gone[l.from] && !gone[l.to]; });
    }
  }
  if (typeof parkAround === "function") {
    var parkAroundAccess = parkAround;
    parkAround = function () {
      var out = parkAroundAccess.apply(this, arguments);
      try { acMark(); } catch (e) { /* the stalls as they are */ }
      return out;
    };
  }

  // ---- in 3D: painted on the stalls -------------------------------------------------------------
  var AC_POST = { piece: true, color: "#8b9196", edge: "#5d6267", pat: 22 };
  var AC_BLUE = { piece: true, color: "#1f5fa8", edge: "#123d6d" };
  var AC_CHARGER = { piece: true, color: "#34383d", edge: "#1c1f22", pat: 22 };
  var AC_GLOW = { piece: true, color: "#5ad17a", edge: "#2f8a49", pat: 31 };
  // (the international symbol: a head, the back upright, the arm out, the seat and the legs, the wheel round them)
  var AC_WHEEL = '<g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round"><circle cx="118" cy="128" r="20" fill="#ffffff" stroke="none"/>' +
                 '<path d="M114 160v74h60l28 62" stroke-width="22"/><path d="M114 192h50" stroke-width="18"/>' +
                 '<path d="M92 214a60 60 0 1 0 86 84" stroke-width="16"/></g>';
  var AC_SIGN = '<rect width="256" height="256" rx="18" fill="#1f5fa8"/><g transform="translate(-40 -60) scale(1.05)">' + AC_WHEEL + '</g>';
  var AC_LINE = 10;                      // cm: a painted line's width, as the lot's own (38-models.js / 40-parking.js)
  // What is painted in a stall, drawn the stall's own size in centimetres
  // (Wc across, line to line over the lines, Dc from its head down to its
  // open end): its two side lines exactly over the lot's white ones, in
  // its own color, and its mark between them.  (2026-10-04: "the symbols in
  // the parking lot ... matched with the border they are given" -- each was
  // drawn 2.4 by 5.3 metres with its own box round it, in a stall 2.6 by
  // 5.5: its lines ran inside the stall's, with the white ones showing past
  // them, and the far end of it under the paving.)
  function acSvg(kind, Wc, Dc) {
    if (kind === "sign") {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">' + AC_SIGN + '</svg>';
    }
    var L = AC_LINE, k = 2, inner = Wc - 2 * L;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.round(Wc * k) + '" height="' + Math.round(Dc * k) + '" viewBox="0 0 ' + Wc + " " + Dc + '">';
    function sides(color) {
      return '<rect x="0" y="0" width="' + L + '" height="' + Dc + '" fill="' + color + '"/>' +
             '<rect x="' + (Wc - L) + '" y="0" width="' + L + '" height="' + Dc + '" fill="' + color + '"/>';
    }
    if (kind === "access") {
      // the blue square with the figure, past the wheel stop at the head (60 cm in)
      var sq = Math.max(60, Math.min(150, inner - 50)), sx = (Wc - sq) / 2, sy = Math.min(Dc - sq - 40, 110);
      return out + sides("#1f5fa8") + '<g transform="translate(' + sx + " " + sy + ") scale(" + (sq / 256) + ')">' + AC_SIGN + "</g></svg>";
    }
    if (kind === "aisle") {
      // striped, the stripes kept between its lines and short of its ends
      var stripes = "";
      for (var y = -inner; y < Dc + inner; y += 45) { stripes += '<path d="M' + L + " " + y + " L" + (Wc - L) + " " + (y + inner) + '"/>'; }
      return out + sides("#f4f6f7") + '<clipPath id="ac-in"><rect x="' + L + '" y="15" width="' + inner + '" height="' + (Dc - 30) + '"/></clipPath>' +
             '<g clip-path="url(#ac-in)" stroke="#f4f6f7" stroke-width="10">' + stripes + "</g></svg>";
    }
    return out + sides("#2f9e57") + '<text x="' + Wc / 2 + '" y="' + Math.min(Dc - 60, 260) + '" font-family="Arial, sans-serif" font-weight="700" font-size="' +
           Math.round(Math.min(110, inner * 0.55)) + '" fill="#2f9e57" text-anchor="middle">EV</text></svg>';
  }
  function acPic(kind, Wc, Dc) {
    if (kind === "sign") { return v3Pic("ac|sign", acSvg("sign"), 4, 4); }
    Wc = Math.round(Wc); Dc = Math.round(Dc);
    return v3Pic("ac|" + kind + "|" + Wc + "x" + Dc, acSvg(kind, Wc, Dc), Wc / 50, Dc / 50);
  }
  // The top of a lot's paving at a spot, in the lot's own numbers from its
  // middle: its model's top is one flat quad laid on the land by its
  // corners (38-models.js; draped, 40-land.js), cut into two triangles from
  // its first corner to its third -- worked out the same way here, so what
  // is painted on it lies on it, and not half under it where the land falls.
  function acTop(lot) {
    var P = FLOOR_PX, t = (lot.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), W = lot.w, D = lot.h;
    var drape = typeof TERR_ON !== "undefined" && TERR_ON && typeof terrAt === "function";
    function ground(u, v) { return drape ? terrAt(lot.x + u * c - v * s, lot.y + u * s + v * c) + 0.8 : 0; }
    var zA = ground(-W / 2, -D / 2), zB = ground(W / 2, -D / 2), zC = ground(W / 2, D / 2), zD = ground(-W / 2, D / 2);
    // its top, and its painted lines on that (40-parking.js: at least a centimetre and a half; lines 0.4 cm)
    var cm = P / 100, top = Math.max(Math.max(1, pieceHigh(lot) * P), 1.5 * cm) + 0.4 * cm;
    var bend = Math.abs(zA + zC - zB - zD) / 2;          // (how far its two triangles are from one plane)
    return {
      at: function (u, v) {
        var a = (u + W / 2) / W, b = (v + D / 2) / D;
        var z = a >= b ? zA + a * (zB - zA) + b * (zC - zB) : zA + b * (zD - zA) + a * (zC - zD);
        return z + top + bend;
      },
      world: function (u, v) { return [lot.x + u * c - v * s, lot.y + u * s + v * c]; }
    };
  }
  function acFaces() {
    var P = FLOOR_PX, faces = [];
    hand.nodes.forEach(function (lot) {
      if (lot.kind !== "i_parking" || !(lot.access || lot.aisle || lot.ev)) { return; }
      var top = acTop(lot);
      acStalls(lot).forEach(function (st) {
        var kind = (lot.access || []).indexOf(st.i) >= 0 ? "access" : (lot.aisle || []).indexOf(st.i) >= 0 ? "aisle" : (lot.ev || []).indexOf(st.i) >= 0 ? "ev" : null;
        if (!kind) { return; }
        // the stall flat on the paving, line to line (over its lines) and head to open end,
        // its picture read from its open end, the figure's head toward the kerb
        var cm = P / 100, hw = (st.w || 2.6 * P) / 2 + AC_LINE * cm / 2, hd = (st.h || 5.5 * P) / 2;
        var ay = [-st.s, st.c], f = st.head < 0 ? 1 : -1;
        var cu = st.lx - lot.w / 2, cv = st.ly - lot.h / 2;
        // (turned whole, not mirrored, for the row whose heads point the other
        // way; read from the open end, its left to right is the reader's -- the
        // letters and the figure came out back to front)
        // (two marked stalls side by side paint the line between them both: the
        // accessible stall's blue over the rest, then a charger's green, then
        // the aisle's white -- each a hair higher, not the two in one plane)
        var over = kind === "access" ? 0.09 : kind === "ev" ? 0.06 : 0.03;
        function at(u, v) {
          var lu = cu + u * f, lv = cv - v * f, w = top.world(lu, lv);
          return [w[0], w[1], top.at(lu, lv) + over];
        }
        faces.push({ pts: [at(-hw, hd), at(hw, hd), at(hw, -hd), at(-hw, -hd)], n: [0, 0, 1], how: { decal: true },
                     tex: acPic(kind, 2 * hw / cm, 2 * hd / cm), texAt: [0, 1, 3] });
        // at its head: the sign on its post, or the charger
        var head = [st.x - ay[0] * f * (hd + 0.25 * P), st.y - ay[1] * f * (hd + 0.25 * P)], out = [ay[0] * f, ay[1] * f];
        var hz = typeof terrGround === "function" ? terrGround(head[0], head[1]) : 0;
        if (kind === "access") {
          v3Prism(faces, acRing(head, 0.03 * P, 6), hz, hz + 2.1 * P, AC_POST);
          if (typeof adrPlate === "function") { adrPlate(faces, head, out, 0.3 * P, 0.3 * P, hz + 1.85 * P, acPic("sign"), AC_BLUE, true); }
        } else if (kind === "ev") {
          var b = 0.14 * P;
          v3Prism(faces, [[head[0] - b, head[1] - b], [head[0] + b, head[1] - b], [head[0] + b, head[1] + b], [head[0] - b, head[1] + b]], hz, hz + 1.35 * P, AC_CHARGER);
          var gl = [head[0] + out[0] * 0.15 * P, head[1] + out[1] * 0.15 * P];
          v3Prism(faces, [[gl[0] - 0.06 * P, gl[1] - 0.06 * P], [gl[0] + 0.06 * P, gl[1] - 0.06 * P], [gl[0] + 0.06 * P, gl[1] + 0.06 * P], [gl[0] - 0.06 * P, gl[1] + 0.06 * P]],
                  hz + 1.0 * P, hz + 1.25 * P, AC_GLOW);
        }
      });
    });
    return faces;
  }
  function acRing(c, r, n) { var o = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; o.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } return o; }

  // ---- a ramp at a public way in --------------------------------------------------------------
  // In place of the steps down from a door's landing (40-land.js): the
  // same fall at one in twelve, straight out, a hand rail either side.
  var acRamps = [];
  if (typeof terrMake === "function") {
    var terrMakeAccess = terrMake;
    terrMake = function () {
      var T = terrMakeAccess.apply(this, arguments);
      acRamps = [];
      try {
        if (T && T.pads && acPublic()) {
          var P = T.P, keep = [];
          T.doors.forEach(function (o) {
            if (o.garage) { return; }
            var steps = T.pads.filter(function (p) { return p.step && Math.abs((p.x - o.x) * o.ox + (p.y - o.y) * o.oy) < 12 * P && Math.abs((p.x - o.x) * -o.oy + (p.y - o.y) * o.ox) < o.w; });
            if (!steps.length) { return; }
            var fall = -0.03 * P - steps[steps.length - 1].top + 0.18 * P, run = fall * 12, ax = -o.oy, ay = o.ox, n = Math.max(2, Math.ceil(run / (0.3 * P)));
            steps.forEach(function (p) { p.gone = true; });
            var from = 1.2 * P, top = -0.03 * P, ramp = { o: o, from: from, run: run, top: top, fall: fall, ax: ax, ay: ay, hw: o.w / 2 + 0.1 * P };
            for (var i = 0; i < n; i++) {
              var a = from + (i + 0.5) * run / n, z = top - fall * (i + 1) / n;
              keep.push({ x: o.x + o.ox * a, y: o.y + o.oy * a, ax: ax, ay: ay, hw: ramp.hw, hd: run / n / 2 + 0.01 * P, top: z, step: true, ramp: true });
            }
            acRamps.push(ramp);
          });
          if (keep.length) {
            T.pads = T.pads.filter(function (p) { return !p.gone; }).concat(keep);
            keep.forEach(function (p) {
              var lo = Infinity;
              [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].forEach(function (s) {
                lo = Math.min(lo, terrAt(p.x + p.ax * p.hw * s[0] - p.ay * p.hd * s[1], p.y + p.ay * p.hw * s[0] + p.ax * p.hd * s[1]));
              });
              p.lo = Math.min(lo - 0.1 * P, p.top - 0.05 * P);
            });
          }
        }
      } catch (e) { acRamps = []; }
      return T;
    };
  }
  // its rails: posts along both sides, a rail along their tops
  function acRails() {
    var P = FLOOR_PX, faces = [];
    acRamps.forEach(function (R) {
      var o = R.o;
      [-1, 1].forEach(function (sd) {
        var off = sd * R.hw, n = Math.max(2, Math.round(R.run / (1.5 * P)) + 1), prev = null;
        for (var i = 0; i < n; i++) {
          var a = R.from + R.run * i / (n - 1), z = R.top - R.fall * i / (n - 1);
          var x = o.x + o.ox * a + R.ax * off, y = o.y + o.oy * a + R.ay * off;
          v3Prism(faces, acRing([x, y], 0.025 * P, 6), z, z + 0.9 * P, AC_POST);
          if (prev) { xrayBeam(faces, [prev[0], prev[1], prev[2] + 0.9 * P], [x, y, z + 0.9 * P], [R.ax, R.ay, 0], [0, 0, 1], 0.05 * P, 0.05 * P, AC_POST); }
          prev = [x, y, z];
        }
      });
    });
    return faces;
  }
  if (typeof v3Build === "function") {
    var v3BuildAccess = v3Build;
    v3Build = function () {
      var model = v3BuildAccess.apply(this, arguments);
      try {
        if (model && model.faces && V3 && V3.scene !== "space" && !(V3.flat && V3.flatDone)) {
          var add = acFaces().concat(acRails());
          for (var i = 0; i < add.length; i++) { model.faces.push(add[i]); }
        }
      } catch (e) { /* the lot as it is */ }
      return model;
    };
  }
