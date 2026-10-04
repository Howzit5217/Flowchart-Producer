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
      return { i: i, x: lot.x + lx * c - ly * s, y: lot.y + lx * s + ly * c, lx: st.x, ly: st.y, head: st.head, c: c, s: s, turn: lot.turn || 0 };
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
  function acSvg(kind) {
    // (the international symbol: a head, the back upright, the arm out, the seat and the legs, the wheel round them)
    var wheel = '<g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round"><circle cx="118" cy="128" r="20" fill="#ffffff" stroke="none"/>' +
                '<path d="M114 160v74h60l28 62" stroke-width="22"/><path d="M114 192h50" stroke-width="18"/>' +
                '<path d="M92 214a60 60 0 1 0 86 84" stroke-width="16"/></g>';
    if (kind === "access") {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="540" viewBox="0 0 256 540"><rect x="6" y="6" width="244" height="528" fill="none" stroke="#1f5fa8" stroke-width="10"/>' +
             '<rect x="30" y="90" width="196" height="250" rx="12" fill="#1f5fa8"/><g transform="translate(-30 30) scale(1.05)">' + wheel + '</g></svg>';
    }
    if (kind === "aisle") {
      var lines = "";
      for (var y = -256; y < 540; y += 36) { lines += '<path d="M0 ' + y + ' L256 ' + (y + 256) + '" stroke="#f4f6f7" stroke-width="12"/>'; }
      return '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="540" viewBox="0 0 256 540"><rect x="6" y="6" width="244" height="528" fill="none" stroke="#f4f6f7" stroke-width="10"/>' + lines + '</svg>';
    }
    if (kind === "sign") {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="18" fill="#1f5fa8"/>' +
             '<g transform="translate(-40 -60) scale(1.05)">' + wheel + '</g></svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="540" viewBox="0 0 256 540"><rect x="6" y="6" width="244" height="528" fill="none" stroke="#2f9e57" stroke-width="12"/>' +
           '<text x="128" y="300" font-family="Arial, sans-serif" font-weight="700" font-size="120" fill="#2f9e57" text-anchor="middle">EV</text></svg>';
  }
  function acPic(kind) { return v3Pic("ac|" + kind, acSvg(kind), kind === "sign" ? 4 : 4, kind === "sign" ? 4 : 8.4); }
  function acFaces() {
    var P = FLOOR_PX, faces = [];
    hand.nodes.forEach(function (lot) {
      if (lot.kind !== "i_parking" || !(lot.access || lot.aisle || lot.ev)) { return; }
      acStalls(lot).forEach(function (st) {
        var kind = (lot.access || []).indexOf(st.i) >= 0 ? "access" : (lot.aisle || []).indexOf(st.i) >= 0 ? "aisle" : (lot.ev || []).indexOf(st.i) >= 0 ? "ev" : null;
        if (!kind) { return; }
        // the stall flat on the ground, its picture read from its open end
        var hw = 1.2 * P, hd = 2.65 * P, ax = [st.c, st.s], ay = [-st.s, st.c], g = (typeof terrGround === "function" ? terrGround(st.x, st.y) : 0) + 0.035 * P;
        var f = st.head < 0 ? 1 : -1;
        // (turned to be read from its open end, the figure's head toward the kerb)
        function at(u, v) { return [st.x - ax[0] * u - ay[0] * v * f, st.y - ax[1] * u - ay[1] * v * f, g]; }
        faces.push({ pts: [at(-hw, hd), at(hw, hd), at(hw, -hd), at(-hw, -hd)], n: [0, 0, 1], how: { decal: true }, tex: acPic(kind), texAt: [0, 1, 3] });
        // at its head: the sign on its post, or the charger
        var head = [st.x - ay[0] * f * (hd + 0.25 * P), st.y - ay[1] * f * (hd + 0.25 * P)], out = [ay[0] * f, ay[1] * f], hz = g - 0.035 * P;
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
