// ---------------------------------------------------------------------------
//  40-doors.js -- doors as they are made: a style of leaf (panels, glass,
//  boards, slats), a handle and the metal it is in, hinges, the frame and
//  its casing; hung either hand, and opened part way as well as all the way
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "there is no way to design what the doors look
  // like and there are no door handles and that they can only be opened
  // fully or closed fully and there are no hinges... Details are important")
  //
  // How a door is made is kept on it, as `n.dd`: { st: its style, hd: its
  // handle, mt: the metal of its handle and hinges, fin: the leaf's finish,
  // hand: "r" hung from the other side, op: how far it opens, in degrees }.
  var DOOR_STYLES = ["flush", "panel6", "panel2", "shaker", "craftsman", "halfglass", "french", "modern", "barn", "louver"];
  var DOOR_HANDLES = ["lever", "knob", "pull"];
  var DOOR_METALS = { brass: ["#c9a14a", 35], chrome: ["#d3d7dc", 23], black: ["#2a2a2b", 22], bronze: ["#6b5643", 22], nickel: ["#b6b4ac", 22] };
  var DOOR_FINS = { drawn: null, white: ["#f3f1ec", 36], oak: ["#c49a62", 21], walnut: ["#6b4a33", 21], black: ["#2b2b2c", 36],
                    sage: ["#9fae8a", 36], navy: ["#2f3e5c", 36], red: ["#8c2f28", 36] };
  var DOOR_OPENS = [70, 90, 110];
  var DOOR_AJAR = {};                    // id -> opened only a little (walking round in 3D)
  function doorDesign(n) {
    var d = n.dd || {};
    return { st: DOOR_STYLES.indexOf(d.st) >= 0 ? d.st : (n.kind === "i_door2" ? "french" : "panel6"),
             hd: DOOR_HANDLES.indexOf(d.hd) >= 0 ? d.hd : "lever", mt: DOOR_METALS[d.mt] ? d.mt : "nickel",
             fin: DOOR_FINS[d.fin] !== undefined ? d.fin : "drawn", hand: d.hand === "r" ? "r" : "l",
             op: DOOR_OPENS.indexOf(+d.op) >= 0 ? +d.op : 90 };
  }
  // How far a door stands open now: shut, a little, or as far as it opens.
  function doorSwingTo(n) {
    if (!doorIsOpen(n)) { return 0; }
    if (DOOR_AJAR[n.id]) { return 28; }
    return n.kind === "i_door" || n.kind === "i_door2" ? doorDesign(n).op : 90;
  }

  // ---- in 3D -------------------------------------------------------------------------------------
  if (typeof v3Door === "function") {
    var v3DoorPlain = v3Door;
    v3Door = function (faces, n, open) {
      if (n.kind !== "i_door" && n.kind !== "i_door2") {
        return v3DoorPlain.call(this, faces, n, Math.min(90, open));        // a slider, a fold, a garage: as far as they go
      }
      try { doorBuild(faces, n, open); } catch (e) { v3DoorPlain.apply(this, arguments); }
    };
  }
  function doorBuild(faces, n, open) {
    var P = FLOOR_PX, H = DOOR_TALL * P, own = simLook(n), D = doorDesign(n);
    var hw = n.w / 2, hh = n.h / 2, line = SNAP_IN_WALL[n.kind] === "swing" ? hh : 0, J = 1.5, deep = 6.5;
    var trimC = typeof styleTrim === "function" ? styleTrim("#f1eee8") : "#f1eee8";
    var trim = { piece: true, color: trimC, edge: own.line };
    var frameTop = H + 0.03 * P;
    // the frame: a jamb each side, the head across -- and the casing round
    // the opening on both faces of the wall, a hand's width
    v3Box(faces, n, -hw, -hw + J, line - deep, line + deep, 0, frameTop, trim);
    v3Box(faces, n, hw - J, hw, line - deep, line + deep, 0, frameTop, trim);
    v3Box(faces, n, -hw, hw, line - deep, line + deep, H - 0.4, frameTop + 1.2, trim);
    var big = typeof v3Big === "function" && v3Big();
    if (!big) {
      var cw = 3.4, cd = 0.7;
      [-1, 1].forEach(function (s) {
        var y0 = line + s * deep, y1 = line + s * (deep + cd);
        v3Box(faces, n, -hw - cw, -hw + 0.3, y0, y1, 0, frameTop + cw * 0.9, trim);
        v3Box(faces, n, hw - 0.3, hw + cw, y0, y1, 0, frameTop + cw * 0.9, trim);
        v3Box(faces, n, -hw - cw - 0.4, hw + cw + 0.4, y0, line + s * (deep + cd + 0.2), frameTop - 0.2, frameTop + cw * 0.9 + 0.4, trim);
      });
    }
    var leaves = n.kind === "i_door2"
      ? [{ x: -hw + 1.3, turn: (n.turn || 0) - open, L: hw - 2 }, { x: hw - 1.3, turn: (n.turn || 0) + 180 + open, L: hw - 2, flip: true }]
      : D.hand === "r" ? [{ x: hw - 1.5, turn: (n.turn || 0) + 180 + open, L: n.w - 3, flip: true }]
                       : [{ x: -hw + 1.5, turn: (n.turn || 0) - open, L: n.w - 3 }];
    leaves.forEach(function (lf) {
      var at = v3Local(n, lf.x, line);
      doorLeaf(faces, { kind: n.kind, x: at[0], y: at[1], turn: lf.turn }, lf.L, H, n.kind === "i_door2" ? 2.6 : 3, D, own, big, lf.flip ? 1 : -1);
    });
  }
  // One leaf, in its own numbers: from its hinges (u 0) to the edge it
  // shuts on (u L), through its thickness (v), up (z).
  function doorLeaf(faces, LN, L, H, t, D, own, plain, swing) {      // (swing: the face, -1 or 1, it opens toward)
    var P = FLOOR_PX, f = DOOR_FINS[D.fin], col = f ? f[0] : own.fill, edge = own.line;
    var wood = { leaf: true, color: col, edge: edge }, raised = { leaf: true, color: v3Mix(col, "#ffffff", 0.06), edge: edge };
    var deepC = { leaf: true, color: v3Mix(col, "#000000", 0.08), edge: edge };
    if (f) { wood.pat = raised.pat = deepC.pat = f[1]; }
    var glass = { leaf: true, glass: true, edge: edge };
    var M = DOOR_METALS[D.mt], metal = { leaf: true, color: M[0], edge: v3Mix(M[0], "#000000", 0.35), pat: M[1], bare: true };
    function box(u0, u1, v0, v1, z0, z1, how) { v3Box(faces, LN, u0, u1, v0, v1, z0, z1, how); }
    function onFaces(u0, u1, z0, z1, proud, how) {       // a panel or a moulding, on both faces
      [-1, 1].forEach(function (s) { box(u0, u1, s * t / 2, s * (t / 2 + proud), z0, z1, how); });
    }
    var s = Math.min(5.5, L * 0.14), rb = 0.1 * H, rt = 0.055 * H;     // the stiles, the bottom rail and the top
    var st = plain ? "flush" : D.st;
    if (st === "flush") { box(0, L, -t / 2, t / 2, 0, H, wood); }
    else if (st === "panel6" || st === "panel2" || st === "shaker") {
      box(0, L, -t / 2, t / 2, 0, H, wood);
      var rows = st === "panel6" ? [[0.06, 0.37], [0.42, 0.74], [0.79, 0.93]] : st === "panel2" ? [[0.06, 0.45], [0.5, 0.93]] : [[0.06, 0.93]];
      var cols = st === "panel6" ? [[s, L / 2 - s * 0.45], [L / 2 + s * 0.45, L - s]] : [[s, L - s]];
      if (st === "shaker") {
        // a frame proud of a flat middle: two stiles, the rails, one across the middle
        onFaces(0, s, 0, H, 0.35, raised); onFaces(L - s, L, 0, H, 0.35, raised);
        onFaces(s, L - s, 0, rb, 0.35, raised); onFaces(s, L - s, H - rt, H, 0.35, raised);
        onFaces(s, L - s, 0.47 * H, 0.47 * H + s, 0.35, raised);
      } else {
        rows.forEach(function (r) { cols.forEach(function (c) {
          onFaces(c[0], c[1], r[0] * H, r[1] * H, 0.15, deepC);                       // its bevel, sunk
          onFaces(c[0] + 1.1, c[1] - 1.1, r[0] * H + 1.1, r[1] * H - 1.1, 0.4, raised);   // and the panel, raised
        }); });
      }
    } else if (st === "halfglass" || st === "french" || st === "craftsman" || st === "modern") {
      var g0 = st === "halfglass" ? 0.5 * H : st === "french" ? rb + 0.06 * H : st === "craftsman" ? 0.72 * H : 0.08 * H;
      var g1 = st === "craftsman" ? H - rt - 1 : H - rt;
      if (st === "modern") {
        // flush, a tall strip of glass toward the handle
        var a0 = L * 0.62, a1 = L * 0.74;
        box(0, a0, -t / 2, t / 2, 0, H, wood); box(a1, L, -t / 2, t / 2, 0, H, wood);
        box(a0, a1, -t / 2, t / 2, 0, g0, wood); box(a0, a1, -t / 2, t / 2, H - g0, H, wood);
        box(a0, a1, -0.3, 0.3, g0, H - g0, glass);
      } else {
        box(0, s, -t / 2, t / 2, 0, H, wood); box(L - s, L, -t / 2, t / 2, 0, H, wood);       // the stiles
        box(s, L - s, -t / 2, t / 2, 0, g0, wood);                                            // below the glass
        box(s, L - s, -t / 2, t / 2, g1, H, wood);                                            // over it
        box(s, L - s, -0.3, 0.3, g0, g1, glass);
        var across = st === "french" ? 2 : st === "craftsman" ? 3 : 1, down = st === "french" ? 5 : 1, bar = 0.9;
        for (var i = 1; i < across; i++) { var u = s + (L - 2 * s) * i / across; box(u - bar / 2, u + bar / 2, -t / 2 + 0.4, t / 2 - 0.4, g0, g1, wood); }
        for (var j = 1; j < down; j++) { var z = g0 + (g1 - g0) * j / down; box(s, L - s, -t / 2 + 0.4, t / 2 - 0.4, z - bar / 2, z + bar / 2, wood); }
        if (st === "halfglass") {
          onFaces(s + 1.6, L - s - 1.6, rb, g0 - s * 0.6, 0.15, deepC);
          onFaces(s + 2.6, L - s - 2.6, rb + 1, g0 - s * 0.6 - 1, 0.4, raised);
        }
        if (st === "craftsman") {
          onFaces(s - 1, L - s + 1, g0 - 2.2, g0 - 0.6, 1.4, raised);                         // the shelf under the lights
          [[s + 1.4, L / 2 - 0.8], [L / 2 + 0.8, L - s - 1.4]].forEach(function (c) {
            onFaces(c[0], c[1], rb, g0 - 3.4, 0.15, deepC);
            onFaces(c[0] + 1, c[1] - 1, rb + 1, g0 - 4.4, 0.4, raised);
          });
        }
        if (st === "french") { onFaces(s + 1.4, L - s - 1.4, 1.4, rb - 0.6, 0.35, raised); }
      }
    } else if (st === "barn") {
      // boards side by side, and a Z of boards across them on each face
      var boards = Math.max(3, Math.round(L / 8)), w = L / boards;
      for (var b = 0; b < boards; b++) { box(b * w + 0.12, (b + 1) * w - 0.12, -t / 2, t / 2, 0, H, b % 2 ? deepC : wood); }
      onFaces(0.6, L - 0.6, 0.1 * H, 0.1 * H + 5, 0.9, raised);
      onFaces(0.6, L - 0.6, 0.86 * H - 5, 0.86 * H, 0.9, raised);
      [-1, 1].forEach(function (sd) { doorBrace(faces, LN, sd, t / 2 + 0.9, 1.4, 0.1 * H + 5, L - 1.4, 0.86 * H - 5, 4.6, raised); });
    } else if (st === "louver") {
      box(0, s, -t / 2, t / 2, 0, H, wood); box(L - s, L, -t / 2, t / 2, 0, H, wood);
      box(s, L - s, -t / 2, t / 2, 0, rb, wood); box(s, L - s, -t / 2, t / 2, H - rt, H, wood);
      box(s, L - s, -t / 2, t / 2, 0.47 * H, 0.47 * H + s, wood);
      [[rb, 0.47 * H], [0.47 * H + s, H - rt]].forEach(function (zz) {
        for (var z2 = zz[0] + 1; z2 + 1.4 < zz[1]; z2 += 2.2) { box(s, L - s, -t / 2 + 0.3, t / 2 - 0.3, z2, z2 + 1.4, deepC); }
      });
    }
    // the handle, toward the edge it shuts on, both faces
    var uh = L - 3.4, zh = 1.0 * P;
    [-1, 1].forEach(function (sd) {
      var o = t / 2;
      function at(a, b) { return sd < 0 ? [-b, -a] : [a, b]; }          // out from this face
      if (D.hd === "pull") {
        var v1 = at(o + 1.6, o + 2.3);
        box(uh - 0.4, uh + 0.4, v1[0], v1[1], zh - 11, zh + 11, metal);
        [zh - 9, zh + 9].forEach(function (zz) { var v2 = at(o, o + 1.6); box(uh - 0.3, uh + 0.3, v2[0], v2[1], zz - 0.4, zz + 0.4, metal); });
        return;
      }
      var rose = at(o, o + 0.45);
      box(uh - 1.2, uh + 1.2, rose[0], rose[1], zh - (D.hd === "knob" ? 1.2 : 2.6), zh + 1.2, metal);   // the rose (a plate, under a lever)
      var neck = at(o + 0.45, o + 1.5);
      box(uh - 0.45, uh + 0.45, neck[0], neck[1], zh - 0.45, zh + 0.45, metal);
      if (D.hd === "knob") {
        var c = at(o + 1.3, o + 3.4), ring = [];
        for (var k = 0; k < 8; k++) {
          var ang = (k + 0.5) / 8 * Math.PI * 2;
          ring.push(v3Local(LN, uh + Math.cos(ang) * 1.3, (c[0] + c[1]) / 2 + Math.sin(ang) * 1.05));
        }
        v3Prism(faces, ring, zh - 1.3, zh + 1.3, metal);
      } else {
        var lv = at(o + 1.4, o + 2.2);
        box(uh - 5.6, uh + 0.4, lv[0], lv[1], zh - 0.42, zh + 0.42, metal);    // the lever, back toward the hinges
      }
    });
    // three hinges on the edge it hangs from, their knuckles showing
    if (!plain) {
      [0.1, 0.5, 0.88].forEach(function (h) {
        var z0 = h * H - 2;
        var kv = swing > 0 ? [t / 2 - 0.9, t / 2 + 0.5] : [-t / 2 - 0.5, -t / 2 + 0.9];
        box(-0.7, 0.5, kv[0], kv[1], z0, z0 + 4, metal);
        box(-0.75, -0.25, kv[0] - 0.05, kv[1] + 0.05, z0 - 0.4, z0 + 4.4, metal);       // the pin's ends
      });
    }
  }
  // a board laid on a face from one corner to the other: a flat strip, standing proud of it
  function doorBrace(faces, LN, sd, proud, u0, z0, u1, z1, w, how) {
    var du = u1 - u0, dz = z1 - z0, l = Math.hypot(du, dz) || 1, nu = -dz / l * w / 2, nz = du / l * w / 2;
    var corners = [[u0 + nu, z0 + nz], [u1 + nu, z1 + nz], [u1 - nu, z1 - nz], [u0 - nu, z0 - nz]];
    var a = (LN.turn || 0) * Math.PI / 180, out = [-Math.sin(a) * sd, Math.cos(a) * sd, 0];
    var pts = corners.map(function (c) { var p = v3Local(LN, c[0], sd * proud); return [p[0], p[1], c[1]]; });
    if (sd < 0) { pts.reverse(); }
    faces.push({ pts: pts, n: out, how: how });
  }

  // ---- opened a little, or all the way ---------------------------------------------------------
  // E (or a press on it) at a shut door opens it a little; again, all the
  // way; again, shut.
  if (typeof v3UseDoor === "function") {
    var v3UseDoorPlain = v3UseDoor;
    v3UseDoor = function () {
      var was = {};
      Object.keys(doorOpen).forEach(function (k) { was[k] = doorOpen[k]; });
      var out = v3UseDoorPlain.apply(this, arguments);
      // which door it was: the one whose state just changed
      Object.keys(doorOpen).forEach(function (k) {
        if (was[k] === doorOpen[k]) { return; }
        if (doorOpen[k]) { DOOR_AJAR[k] = true; v3Say(TXT.dd_ajar); }                       // shut -> a little
        else if (DOOR_AJAR[k]) { DOOR_AJAR[k] = false; doorOpen[k] = true; v3Say(TXT.dd_wide); }   // a little -> all the way
        else { v3Say(TXT.dd_shut); }
      });
      return out;
    };
  }

  // ---- on the plan: hung from the other side, the swing drawn that way --------------------------
  if (typeof shapeSvg === "function") {
    var shapeSvgDoors = shapeSvg;
    shapeSvg = function (moved) {
      var out = shapeSvgDoors.apply(this, arguments), n = moved && moved.src;
      if (n && (n.kind === "i_door") && n.dd && n.dd.hand === "r") {
        return '<g transform="translate(' + (2 * moved.x) + ' 0) scale(-1 1)">' + out + "</g>";
      }
      return out;
    };
  }

  // ---- in a door's panel --------------------------------------------------------------------------
  function doorArt(st) {
    var g = "", x0 = 13, x1 = 27, y0 = 2, y1 = 27;
    function r(a, b, c, d, fill) { return '<rect x="' + a + '" y="' + b + '" width="' + (c - a) + '" height="' + (d - b) + '" rx=".5" fill="' + (fill || "none") + '"/>'; }
    if (st === "panel6") { g = r(15, 4, 19.4, 7.5) + r(20.6, 4, 25, 7.5) + r(15, 9, 19.4, 16) + r(20.6, 9, 25, 16) + r(15, 17.5, 19.4, 25) + r(20.6, 17.5, 25, 25); }
    else if (st === "panel2") { g = r(15, 4, 25, 14) + r(15, 15.5, 25, 25); }
    else if (st === "shaker") { g = r(15.5, 4.5, 24.5, 13.5) + r(15.5, 15, 24.5, 24.5); }
    else if (st === "craftsman") { g = r(15, 4, 18, 8, "#bcd3e0") + r(18.5, 4, 21.5, 8, "#bcd3e0") + r(22, 4, 25, 8, "#bcd3e0") + '<path d="M14 9.4h12"/>' + r(15, 11, 19.4, 25) + r(20.6, 11, 25, 25); }
    else if (st === "halfglass") { g = r(15, 4, 25, 14, "#bcd3e0") + r(15.5, 16, 24.5, 25); }
    else if (st === "french") { g = r(15, 4, 25, 23, "#bcd3e0") + '<path d="M20 4v19M15 7.8h10M15 11.6h10M15 15.4h10M15 19.2h10"/>'; }
    else if (st === "modern") { g = r(21.5, 5, 23.5, 24, "#bcd3e0"); }
    else if (st === "barn") { g = '<path d="M16.5 2v25M20 2v25M23.5 2v25M14 5.5h12M14 23.5h12M14.5 23 25.5 6"/>'; }
    else if (st === "louver") { g = '<path d="M15 5h10M15 7h10M15 9h10M15 11h10M15 13h10M15 16h10M15 18h10M15 20h10M15 22h10M15 24h10"/>'; }
    return '<svg viewBox="0 0 40 28" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1">' +
           r(x0, y0, x1, y1) + g + '<circle cx="24.6" cy="15.5" r=".9" fill="currentColor"/></g></svg>';
  }
  function doorSection(box, n) {
    var sec = document.createElement("div");
    sec.className = "dz-fin dz-design dz-door";
    function set(key, value) {
      keepUndo();
      var dd = Object.assign({}, n.dd || {});
      dd[key] = value;
      n.dd = dd;
      if (typeof handKeep === "function") { handKeep(); }
      if (V3) { V3.dirty = true; }
      if (key === "hand") { drawHand(); }
      draw();
    }
    function row(nameKey, list, on, label, pick, chips) {
      var line = document.createElement("div");
      line.className = "dz-fin-row";
      line.innerHTML = '<span class="dz-fin-name"></span><div class="' + (chips ? "dz-mat-tints" : "seg dz-door-seg") + '"></div>';
      line.firstChild.textContent = TXT[nameKey];
      list.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        if (chips) {
          b.className = "dz-chip" + (v === on ? " on" : "");
          var c = chips(v);
          b.style.background = c || "linear-gradient(135deg, " + simLook(n).fill + " 0 50%, " + simLook(n).line + " 50% 100%)";
          b.title = label(v);
          b.setAttribute("aria-label", label(v));
        } else {
          b.className = "seg-btn" + (v === on ? " on" : "");
          b.textContent = label(v);
        }
        b.setAttribute("aria-pressed", v === on ? "true" : "false");
        b.onclick = function () { pick(v); };
        line.lastChild.appendChild(b);
      });
      sec.appendChild(line);
    }
    function draw() {
      var D = doorDesign(n);
      sec.innerHTML = '<div class="dz-fin-head"><span class="dz-small dz-sub-head"></span></div>';
      sec.querySelector(".dz-sub-head").textContent = TXT.dd_head;
      var grid = document.createElement("div");
      grid.className = "dz-design-grid";
      DOOR_STYLES.forEach(function (st) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "dz-dtile" + (st === D.st ? " on" : "");
        b.setAttribute("aria-pressed", st === D.st ? "true" : "false");
        b.innerHTML = doorArt(st) + "<span></span>";
        b.lastChild.textContent = TXT["dd_st_" + st];
        b.onclick = function () { set("st", st); };
        grid.appendChild(b);
      });
      sec.appendChild(grid);
      row("dd_handle", DOOR_HANDLES, D.hd, function (v) { return TXT["dd_hd_" + v]; }, function (v) { set("hd", v); });
      row("dd_metal", Object.keys(DOOR_METALS), D.mt, function (v) { return TXT["dd_mt_" + v]; }, function (v) { set("mt", v); },
          function (v) { return DOOR_METALS[v][0]; });
      row("dd_finish", Object.keys(DOOR_FINS), D.fin, function (v) { return TXT["dd_fin_" + v]; }, function (v) { set("fin", v); },
          function (v) { return DOOR_FINS[v] ? DOOR_FINS[v][0] : null; });
      if (n.kind === "i_door") {
        row("dd_hinges", ["l", "r"], D.hand, function (v) { return TXT[v === "r" ? "dd_right" : "dd_left"]; }, function (v) { set("hand", v); });
      }
      row("dd_opens", DOOR_OPENS, D.op, function (v) { return v + "°"; }, function (v) { set("op", v); });
    }
    draw();
    box.appendChild(sec);
  }
  if (typeof sizeSection === "function") {
    var sizeSectionDoors = sizeSection;
    sizeSection = function (box, n) {
      var out = sizeSectionDoors.apply(this, arguments);
      try { if (n && (n.kind === "i_door" || n.kind === "i_door2")) { doorSection(box, n); } } catch (e) { /* the size alone */ }
      return out;
    };
  }
