// ---------------------------------------------------------------------------
//  40-address.js -- where the house is: its number and its street, on a
//  plate by the front door, on the mailbox, and on the sign at the corner;
//  and a corner lot, a side street run along one side of it
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (my own, 2026-10-03: a house on a street with no number, no name, and
  // never on a corner)  The number and the names are made up -- the same
  // every time for the same lot -- till they are typed in (the Street tab).
  var ADR_CORNERS = ["none", "left", "right"];
  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.number = undefined; HOUSE_PLAIN.streetName = undefined; HOUSE_PLAIN.sideName = undefined; HOUSE_PLAIN.corner = undefined; }
  function adrSeed() {
    var lot = typeof houseLot === "function" ? houseLot() : null;
    return lot ? Math.abs(Math.round(lot.x * 7 + lot.y * 3 + lot.w * 11 + lot.h * 5)) : 7;
  }
  function adrNames() { return String(TXT.addr_streets || "Maple Street").split("|"); }
  function adrNumber() { var n = houseOpt("number"); return n ? String(n) : String(2 + 2 * (adrSeed() % 60)); }
  function adrStreet() { var n = houseOpt("streetName"), all = adrNames(); return n ? String(n) : all[adrSeed() % all.length]; }
  function adrSide() { var n = houseOpt("sideName"), all = adrNames(); return n ? String(n) : all[(adrSeed() + 3) % all.length]; }
  function adrCorner() { var c = houseOpt("corner"); return houseOpt("street") && (c === "left" || c === "right") ? c : "none"; }

  // ---- the lot's own way round: x along the street, y toward it --------------------------------
  function adrFrame() {
    var lot = typeof houseStreetLot === "function" ? houseStreetLot() : null;
    if (!lot) { return null; }
    var a = (lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return { lot: lot, c: c, s: s, hy: lot.h / 2,
             world: function (lx, ly) { return [lot.x + lx * c - ly * s, lot.y + lx * s + ly * c]; },
             local: function (x, y) { var dx = x - lot.x, dy = y - lot.y; return [dx * c + dy * s, -dx * s + dy * c]; } };
  }
  // A picture of words: on a plate, in a color, as wide as they need.
  function adrPic(text, w, h, ink, back, serif) {
    // (sharp enough close up: five hundred dots a metre)
    var k = 512, W = Math.round(w * k), H = Math.round(h * k), size = Math.round(H * 0.62);
    var esc = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '">' +
              (back ? '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="' + Math.round(H * 0.12) + '" fill="' + back + '"/>' +
                      '<rect x="' + Math.round(H * 0.06) + '" y="' + Math.round(H * 0.06) + '" width="' + (W - Math.round(H * 0.12)) + '" height="' + (H - Math.round(H * 0.12)) +
                      '" rx="' + Math.round(H * 0.09) + '" fill="none" stroke="' + ink + '" stroke-width="' + Math.max(1, Math.round(H * 0.03)) + '"/>' : "") +
              '<text x="' + W / 2 + '" y="' + H / 2 + '" font-family="' + (serif ? "Georgia, 'Times New Roman', serif" : "'Segoe UI', Arial, sans-serif") +
              '" font-weight="700" font-size="' + size + '" fill="' + ink + '" text-anchor="middle" dominant-baseline="central"' +
              (esc.length * size * 0.55 > W * 0.88 ? ' textLength="' + Math.round(W * 0.86) + '" lengthAdjust="spacingAndGlyphs"' : "") + ">" + esc + "</text></svg>";
    return v3Pic("adr|" + text + "|" + W + "x" + H + "|" + ink + back, svg, W / k, H / k);
  }
  // A plate standing at `at` (x, y), facing `out`, `w` wide and `h` high
  // about z, its words on the face: both ways round where both are seen.
  function adrPlate(faces, at, out, w, h, z, pic, look, both) {
    // (across it, left to right as it is read: facing it, the reader's right)
    var P = FLOOR_PX, ax = out[1], ay = -out[0], d = 0.02 * P;
    function quad(off, flip) {
      var cx = at[0] + out[0] * off, cy = at[1] + out[1] * off, sx = ax * (flip ? -1 : 1), sy = ay * (flip ? -1 : 1);
      return [[cx - sx * w / 2, cy - sy * w / 2, z + h / 2], [cx + sx * w / 2, cy + sy * w / 2, z + h / 2],
              [cx + sx * w / 2, cy + sy * w / 2, z - h / 2], [cx - sx * w / 2, cy - sy * w / 2, z - h / 2]];
    }
    var base = [[at[0] - ax * w / 2 - out[0] * d, at[1] - ay * w / 2 - out[1] * d], [at[0] + ax * w / 2 - out[0] * d, at[1] + ay * w / 2 - out[1] * d],
                [at[0] + ax * w / 2 + out[0] * d, at[1] + ay * w / 2 + out[1] * d], [at[0] - ax * w / 2 + out[0] * d, at[1] - ay * w / 2 + out[1] * d]];
    if (look) { v3Prism(faces, base, z - h / 2, z + h / 2, look); }
    // (the words a hair off the plate, read the right way round from in front)
    faces.push({ pts: quad(d + 0.004 * P, false), n: [out[0], out[1], 0], how: { decal: true }, tex: pic, texAt: [0, 1, 3] });
    if (both) { faces.push({ pts: quad(-(d + 0.004 * P), true), n: [-out[0], -out[1], 0], how: { decal: true }, tex: pic, texAt: [0, 1, 3] }); }
  }

  // ---- in 3D --------------------------------------------------------------------------------------
  var ADR_PLATE = { piece: true, color: "#2b2f33", edge: "#15181b" };
  var ADR_POLE = { piece: true, color: "#8b9196", edge: "#5d6267", pat: 22 };
  var ADR_GREEN = { piece: true, color: "#1f6b3a", edge: "#0f3d20" };
  function adrFaces(model) {
    var F = adrFrame(), P = FLOOR_PX, faces = [];
    if (!F) { return faces; }
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    function ground(n) { var f = floors.length ? floorAt(floors, n.x, n.y) : null; return !f || f.level === 0; }
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && ground(n); });
    var toStreet = F.world(0, 1), o = F.world(0, 0), nrm = [toStreet[0] - o[0], toStreet[1] - o[1]];
    var lowest = {};
    model.faces.forEach(function (f) {
      if (!f.node || !f.pts || f.mesh) { return; }
      var id = f.node.id;
      f.pts.forEach(function (p) { var z = p[2] || 0; if (lowest[id] === undefined || z < lowest[id]) { lowest[id] = z; } });
    });
    // the number by the front door: of the doors out to the street, the one nearest it
    var best = null, bestY = -Infinity;
    hand.nodes.forEach(function (d) {
      if ((d.kind !== "i_door" && d.kind !== "i_door2") || !ground(d) || d.backDoor || d.fireExit) { return; }
      var q = F.local(d.x, d.y), front = F.world(q[0], q[1] + 0.7 * P), back = F.world(q[0], q[1] - 0.7 * P);
      var inFront = rooms.some(function (r) { return insideArea(r, front[0], front[1]); }), behind = rooms.some(function (r) { return insideArea(r, back[0], back[1]); });
      if (inFront || !behind || q[1] <= bestY) { return; }
      best = d; bestY = q[1];
    });
    var num = adrNumber();
    if (best) {
      var t = (best.turn || 0) * Math.PI / 180, u = [-Math.sin(t), Math.cos(t)], al = [Math.cos(t), Math.sin(t)];
      if (u[0] * nrm[0] + u[1] * nrm[1] < 0) { u = [-u[0], -u[1]]; }
      var fz = lowest[best.id] !== undefined ? lowest[best.id] : 0, w = Math.max(0.3, 0.12 * num.length + 0.1) * P;
      // (beside the door on the side where the wall goes on, not past its corner)
      var sd = [1, -1].filter(function (k) {
        var x = best.x + al[0] * k * (best.w / 2 + 0.6 * P) - u[0] * 0.4 * P, y = best.y + al[1] * k * (best.w / 2 + 0.6 * P) - u[1] * 0.4 * P;
        return rooms.some(function (r) { return insideArea(r, x, y); });
      })[0] || 1;
      var at = [best.x + u[0] * (best.h / 2 + 0.02 * P) + al[0] * sd * (best.w / 2 + 0.36 * P), best.y + u[1] * (best.h / 2 + 0.02 * P) + al[1] * sd * (best.w / 2 + 0.36 * P)];
      adrPlate(faces, at, u, w, 0.16 * P, fz + 1.62 * P, adrPic(num, w / P, 0.16, "#d8bf7a", null, true), ADR_PLATE, false);
    }
    // on the mailbox: a plate on its post, both ways
    hand.nodes.forEach(function (m) {
      if (m.kind !== "i_mailbox" || !ground(m)) { return; }
      var z0 = lowest[m.id] !== undefined ? lowest[m.id] : 0, w = Math.max(0.2, 0.08 * num.length + 0.06) * P;
      adrPlate(faces, [m.x + nrm[0] * 0.05 * P, m.y + nrm[1] * 0.05 * P], nrm, w, 0.08 * P, z0 + 0.62 * P, adrPic(num, w / P, 0.08, "#ffffff", "#20262b", false), ADR_PLATE, true);
    });
    // the sign at the corner of a corner lot: a post, the street's name along it, the side street's across
    var side = adrCorner();
    if (side !== "none") {
      var sx = (side === "left" ? -1 : 1) * (F.lot.w / 2 + 0.8 * P), sy = F.hy + 0.8 * P, foot = F.world(sx, sy);
      var gz = typeof terrGround === "function" ? terrGround(foot[0], foot[1]) : 0;
      v3Prism(faces, [[foot[0] - 0.03 * P, foot[1] - 0.03 * P], [foot[0] + 0.03 * P, foot[1] - 0.03 * P], [foot[0] + 0.03 * P, foot[1] + 0.03 * P], [foot[0] - 0.03 * P, foot[1] + 0.03 * P]],
              gz, gz + 2.95 * P, ADR_POLE);
      var along = F.world(1, 0), alongV = [along[0] - o[0], along[1] - o[1]];
      // (the street's name read from the street, along it; the side street's, along that)
      adrPlate(faces, foot, nrm, 1.1 * P, 0.2 * P, gz + 2.55 * P, adrPic(adrStreet(), 1.1, 0.2, "#ffffff", "#1f6b3a", false), ADR_GREEN, true);
      adrPlate(faces, foot, alongV, 1.1 * P, 0.2 * P, gz + 2.8 * P, adrPic(adrSide(), 1.1, 0.2, "#ffffff", "#1f6b3a", false), ADR_GREEN, true);
    }
    return faces;
  }
  if (typeof v3Build === "function") {
    var v3BuildAddress = v3Build;
    v3Build = function () {
      var model = v3BuildAddress.apply(this, arguments);
      try {
        if (model && model.faces && V3 && V3.scene !== "space" && !(V3.flat && V3.flatDone)) {
          // (while it goes up, the door not in yet: worked out again once it is, 40-build.js)
          v3Added("address", model.faces, typeof bpSite !== "undefined" && bpSite ? "building" : "", function () {
            var add = adrFaces(model);
            for (var i = 0; i < add.length; i++) { model.faces.push(add[i]); }
          });
        }
      } catch (e) { /* no address */ }
      return model;
    };
  }

  // ---- a corner lot: the side street ---------------------------------------------------------------
  // Along the lot's side, from far behind it to the street in front: a
  // pavement next to the lot, the road, a pavement over it; nothing next
  // door that way, and no trees on it.
  function adrSideX(lot) { return (adrCorner() === "left" ? -1 : 1) * lot.w / 2; }
  if (typeof houseStreetBits === "function") {
    var houseStreetBitsCorner = houseStreetBits;
    houseStreetBits = function (v, lot, lotWorld, lotLocal, hy, walkW, sheetC) {
      var out = houseStreetBitsCorner.apply(this, arguments);
      try {
        var side = adrCorner();
        if (side !== "none") {
          var P = FLOOR_PX, sg = side === "left" ? -1 : 1, x0 = adrSideX(lot), reach = 400 * P, roadW = 7 * P, end = hy + walkW;
          var pave = gl3Mix([0.8, 0.79, 0.76], sheetC, 0.2), road = gl3Mix([0.3, 0.31, 0.33], sheetC, 0.08);
          function strip(a, b, z, color, uv, pat) {
            var xa = x0 + sg * a, xb = x0 + sg * b, lo = Math.min(xa, xb), hi = Math.max(xa, xb);
            gl3Poly(v, [lotWorld(lo, -reach, z), lotWorld(hi, -reach, z), lotWorld(hi, end, z), lotWorld(lo, end, z)], [0, 0, 1], color, 1, uv, pat);
          }
          // (the sidewalk stepped back from the kerb by a strip of grass, as along the front: 40-verge.js)
          var vg = typeof streetVergePx === "function" ? streetVergePx() : 0, sideW = walkW - vg;
          strip(0, sideW, -1.5, pave, [[-reach / P, 0], [-reach / P, 1.6], [end / P, 1.6], [end / P, 0]], PAT.walk);
          if (vg && typeof vgGrass === "function") {
            var gr = vgGrass(sheetC), guv = [[-reach / P, 0], [-reach / P, vg / P], [end / P, vg / P], [end / P, 0]];
            strip(sideW, walkW, -1.5, gr.c, guv, gr.pat);
            strip(walkW + roadW, walkW + roadW + vg, -1.5, gr.c, guv, gr.pat);
          }
          // (its middle line along its length: the road's picture turned)
          strip(walkW, walkW + roadW, -2, road, [[-reach / P, -3.5], [-reach / P, 3.5], [end / P, 3.5], [end / P, -3.5]], PAT.road);
          strip(walkW + roadW + vg, walkW * 2 + roadW, -1.5, pave, [[-reach / P, 0], [-reach / P, 1.6], [end / P, 1.6], [end / P, 0]], PAT.walk);
          // and where it meets the street, the road carried across the pavement in front
          var a0 = x0 + sg * walkW, a1 = x0 + sg * (walkW + roadW);
          gl3Poly(v, [lotWorld(Math.min(a0, a1), hy, -1.4), lotWorld(Math.max(a0, a1), hy, -1.4), lotWorld(Math.max(a0, a1), hy + walkW, -1.4), lotWorld(Math.min(a0, a1), hy + walkW, -1.4)],
                  [0, 0, 1], road, 1, null, PAT.plain);
        }
      } catch (e) { /* the street alone */ }
      return out;
    };
  }
  // nothing next door on that side
  if (typeof worldNeighbor === "function") {
    var worldNeighborCorner = worldNeighbor;
    worldNeighbor = function (v, L, s) {
      var side = adrCorner();
      if (side !== "none" && !s.back && (side === "left" ? s.x < 0 : s.x > 0)) { return; }
      return worldNeighborCorner.apply(this, arguments);
    };
  }
  // no trees on it
  if (typeof sceneryKeepOffLot === "function") {
    var sceneryKeepOffCorner = sceneryKeepOffLot;
    sceneryKeepOffLot = function () {
      var was = sceneryKeepOffCorner.apply(this, arguments), side = adrCorner(), lot = side !== "none" ? houseStreetLot() : null;
      if (!lot) { return was; }
      var F = adrFrame(), P = FLOOR_PX, x0 = adrSideX(lot), sg = side === "left" ? -1 : 1;
      return function (p) {
        if (was && was(p)) { return true; }
        var q = F.local(p[0], p[1]), a = (q[0] - x0) * sg;
        return a > -1 * P && a < (1.6 * 2 + 7) * P + 3 * P && q[1] < F.hy + 12 * P;
      };
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyCorner = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyCorner.apply(this, arguments) + "|c" + adrCorner(); };
  }

  // ---- asked: on the Street tab ------------------------------------------------------------------
  function adrField(sheet, label, value, placeholder, set) {
    var row = document.createElement("label");
    row.className = "adr-field";
    var name = document.createElement("span");
    name.textContent = label;
    var input = document.createElement("input");
    input.type = "text";
    input.value = value || "";
    input.placeholder = placeholder;
    input.maxLength = 40;
    input.spellcheck = false;
    input.onchange = function () { set(input.value.trim()); };
    input.onkeydown = function (ev) { ev.stopPropagation(); if (ev.key === "Enter") { input.blur(); } };
    row.appendChild(name);
    row.appendChild(input);
    sheet.appendChild(row);
    return input;
  }
  if (typeof streetSection === "function") {
    var streetSectionAddress = streetSection;
    streetSection = function (sheet, head, draw, noStreet) {
      var out = streetSectionAddress.apply(this, arguments);
      try {
        head(TXT.addr_head);
        function fresh() { if (V3) { V3.dirty = true; if (V3.gl) { V3.gl.scenery = null; } } if (typeof houseFresh === "function") { houseFresh(); } }
        adrField(sheet, TXT.addr_number, houseOpt("number"), adrNumber(), function (v) { houseSetOpt("number", v || undefined); fresh(); });
        adrField(sheet, TXT.addr_street, houseOpt("streetName"), adrStreet(), function (v) { houseSetOpt("streetName", v || undefined); fresh(); });
        head(TXT.addr_corner);
        var g = worldPicker(sheet, ADR_CORNERS, adrCorner(), "addr_corner_", function (k) { houseSetOpt("corner", k === "none" ? undefined : k); fresh(); draw(); });
        if (noStreet) { all("button", g).forEach(function (b) { b.disabled = true; b.title = noStreet; }); }
        if (adrCorner() !== "none") {
          adrField(sheet, TXT.addr_side, houseOpt("sideName"), adrSide(), function (v) { houseSetOpt("sideName", v || undefined); fresh(); });
        }
      } catch (e) { /* the street as it was */ }
      return out;
    };
  }
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      addr_corner_none: '<rect x="5" y="2.6" width="10" height="8.4" rx="1"/><path d="M1.6 14.2h16.8M1.6 17.6h16.8"/>',
      addr_corner_left: '<rect x="8.4" y="2.6" width="9" height="8.4" rx="1"/><path d="M1.6 14.2h16.8M1.6 17.6h16.8M2.4 2v10.4M5.6 2v10.4"/>',
      addr_corner_right: '<rect x="2.6" y="2.6" width="9" height="8.4" rx="1"/><path d="M1.6 14.2h16.8M1.6 17.6h16.8M14.4 2v10.4M17.6 2v10.4"/>'
    });
  }
