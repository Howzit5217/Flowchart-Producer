// ---------------------------------------------------------------------------
//  40-edit3d.js -- moving things about in 3D: on a grid; red where it cannot
//  go (on top of something else, through a wall), and back where it was if
//  it is let go there; a thing picked to turn or take away; undo and redo;
//  the trees on the lot your own to move
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "if you are moving things in the 3d space that
  // were placed there to make it a grid system and it will let you move or
  // delete the trees on your property but if you try and place something on
  // top of something else to make it so that does not work and it just
  // turns the thing red and if you try and place it there it just goes back
  // to where it was and to allow undoing and redoing in the 3d space too")
  var EDIT3D_GRID = 0.25;                // metres: what is carried steps along a grid this fine (Alt: freely)
  var EDIT3D_BAD = "#e5484d";

  // What a piece takes up of the floor: its own size where it is drawn as a
  // picture of another size (40-things3d.js).
  function edit3dFoot(n) {
    var R = typeof OBJ3_REAL === "object" ? OBJ3_REAL[n.kind] : null, P = FLOOR_PX;
    // (a tree stands on its trunk: its crown goes over what is round it)
    if (n.kind === "i_tree") { return { kind: n.kind, x: n.x, y: n.y, w: 0.8 * P, h: 0.8 * P, turn: 0 }; }
    if (R && ICONS[n.kind] && ICONS[n.kind].fig) {
      var k = Math.max(0.4, Math.min(3, (n.w || 48) / 48));
      return { kind: n.kind, x: n.x, y: n.y, w: R[0] * P * k, h: R[1] * P * k, turn: n.turn || 0 };
    }
    return n;
  }
  // What stands on the floor and takes up room: what cannot share it.
  function edit3dBlocks(k) {
    if (ON_THE_WALL[k] || LIES_FLAT[k] || FROM_CEILING[k] || isArea(k) || WALK_DOORS[k] || k === "i_window" || k === "i_wall") { return false; }
    return isSolid(k) || !!(typeof OBJ3_REAL === "object" && OBJ3_REAL[k] && !ON_TOP[k] && !V3_WALL[k]);
  }
  function edit3dMeet(a, b) {
    var p = turned(a), q = turned(b);
    return Math.abs(a.x - b.x) * 2 < p.w + q.w - 2 && Math.abs(a.y - b.y) * 2 < p.h + q.h - 2;
  }
  // Whether a piece where it is now is somewhere it cannot be: on top of
  // something else, or through the wall of the room it is in.
  function edit3dClash(n) {
    var me = edit3dFoot(n), floors = typeof floorsOf === "function" ? floorsOf() : [];
    var mine = floors.length ? floorAt(floors, n.x, n.y) : null;
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, n.x, n.y); })
      .sort(function (p, q) { return p.w * p.h - q.w * q.h; });
    var room = rooms[0] || null, t = turned(me);
    if (!ON_THE_WALL[n.kind]) {
      if (room && !((room.turn || 0) % 90)) {
        var f = roomInside(room);
        if (me.x - t.w / 2 < f.l - 1 || me.x + t.w / 2 > f.r + 1 || me.y - t.h / 2 < f.t - 1 || me.y + t.h / 2 > f.b + 1) { return true; }
      } else if (!room && hand.nodes.some(function (r) { return r.kind === "i_room" && edit3dMeet(me, r); })) {
        return true;                     // from outside, into a room through its wall
      }
    }
    var onTop = !!ON_TOP[n.kind];
    return hand.nodes.some(function (m) {
      if (m === n || m.id === n.id) { return false; }
      if (floors.length && floorAt(floors, m.x, m.y) !== mine) { return false; }
      if (ON_THE_WALL[n.kind]) { return ON_THE_WALL[m.kind] && edit3dMeet(me, edit3dFoot(m)); }
      if (onTop) { return ON_TOP[m.kind] && edit3dMeet(me, edit3dFoot(m)); }   // on a table, not on another thing on it
      if (!edit3dBlocks(n.kind) && !(ICONS[n.kind] && ICONS[n.kind].fig)) { return false; }
      return edit3dBlocks(m.kind) && edit3dMeet(me, edit3dFoot(m));
    });
  }

  // ---- carried: on the grid, red where it cannot go, put back if let go there --------------------
  // (in place of 40-drag.js's own, which the view calls as it opens)
  if (typeof dragCarry === "function") { dragCarry = edit3dCarry; }
  function edit3dCarry(canvas) {
    canvas.addEventListener("pointerdown", function (ev) {
      if (dragView || ev.button !== 0 || ev.shiftKey || !V3 || V3.scene === "space" || !V3.gl) { return; }
      if (document.pointerLockElement === canvas) { return; }
      var hit = dragPick(ev);
      if (!hit) { if (V3.sel) { edit3dPick(null); } return; }
      var real = nodeById(hit.box.node.id);
      var from = dragOnLevel(hit.ray, hit.box.z0);
      if (!real || !from) { return; }
      ev.preventDefault();
      ev.stopImmediatePropagation();
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      var moved = false, z = hit.box.z0, jn = hit.box.node, startJ = [jn.x, jn.y], was = [real.x, real.y];
      var undoAt = wasLike.length;
      var J = typeof tieHome === "function" && tieHome() && typeof tieLayout === "function" ? tieLayout() : null;
      function toPaper(p) {
        if (!J || !J.any) { return p; }
        var best = null;
        (J.rooms || []).forEach(function (r) {
          var b = J.boxes[r.id];
          if (b && tieIn(b, p[0], p[1]) && (!best || r.w * r.h < best.w * best.h)) { best = r; }
        });
        var d = best ? (J.delta[best.id] || [0, 0]) : [0, 0];
        return [p[0] - d[0], p[1] - d[1]];
      }
      canvas.classList.add("v3-carrying");
      if (typeof v3Hold === "function") { v3Hold(); }
      function move(e) {
        if (e.pointerId !== ev.pointerId || !V3) { return; }
        var R = dragRay(e), at = R && dragOnLevel(R, z);
        if (!at) { return; }
        var dx = at[0] - from[0], dy = at[1] - from[1];
        if (!moved && Math.hypot(dx, dy) < 3) { return; }
        if (!moved) { keepUndo(); moved = true; }
        var put = toPaper([startJ[0] + dx, startJ[1] + dy]);
        if (!e.altKey) {
          // a quarter of a metre at a step, from where it was (so what stood
          // square to a wall stays so) -- and flush to a wall come within half a step of
          var g = EDIT3D_GRID * FLOOR_PX;
          put = edit3dFlush(real, [was[0] + Math.round((put[0] - was[0]) / g) * g, was[1] + Math.round((put[1] - was[1]) / g) * g], g / 2);
        }
        real.x = Math.round(put[0]); real.y = Math.round(put[1]);
        V3.carry = { id: real.id, bad: edit3dClash(real) };
        V3.dirty = true;
      }
      function up(e) {
        if (e.pointerId !== ev.pointerId) { return; }
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        canvas.classList.remove("v3-carrying");
        var bad = V3 && V3.carry && V3.carry.bad;
        if (V3) { V3.carry = null; V3.dirty = true; }
        if (!moved) { edit3dPick(real.id); return; }       // a press, not a carry: picked
        if (bad) {
          // where it cannot go: back where it was, as if never moved
          real.x = was[0]; real.y = was[1];
          if (wasLike.length > undoAt) { wasLike.length = undoAt; showUndo(); }
          v3Say(TXT.e3_back);
          return;
        }
        if (typeof handKeep === "function") { handKeep(); }
        try { drawHand(); drawHandPanel(); } catch (err) { /* the paper catches up later */ }
        if (V3) { v3Say(say("dv_moved", { what: labelName(real.kind) })); }
        edit3dPick(real.id);
      }
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
    }, true);
  }

  function edit3dFlush(n, put, near) {
    var room = hand.nodes.filter(function (r) { return r.kind === "i_room" && !((r.turn || 0) % 90) && insideArea(r, put[0], put[1]); })
      .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
    if (!room || ON_THE_WALL[n.kind]) { return put; }
    var f = roomInside(room), t = turned(edit3dFoot(Object.assign({}, n, { x: put[0], y: put[1] }))), x = put[0], y = put[1];
    if (Math.abs(x - t.w / 2 - f.l) < near) { x = f.l + t.w / 2; } else if (Math.abs(f.r - x - t.w / 2) < near) { x = f.r - t.w / 2; }
    if (Math.abs(y - t.h / 2 - f.t) < near) { y = f.t + t.h / 2; } else if (Math.abs(f.b - y - t.h / 2) < near) { y = f.b - t.h / 2; }
    return [x, y];
  }

  // ---- what shows meanwhile: the grid round it, red, the ring round what is picked -----------------
  if (typeof v3Build === "function") {
    var v3BuildEdit = v3Build;
    v3Build = function () {
      var model = v3BuildEdit.apply(this, arguments);
      try { if (V3 && model && model.faces && (V3.carry || V3.sel)) { edit3dShow(model); } } catch (e) { /* as it is */ }
      return model;
    };
  }
  function edit3dShow(model) {
    var id = V3.carry ? V3.carry.id : V3.sel, n = nodeById(id);
    if (!n) { V3.sel = null; return; }
    var bad = V3.carry && V3.carry.bad, floors = typeof floorsOf === "function" ? floorsOf() : [];
    var f = floors.length ? floorAt(floors, n.x, n.y) : null, dx = f ? f.dx : 0, dy = f ? f.dy : 0, dz = f ? f.z : 0;
    var z0 = Infinity;
    model.faces.forEach(function (face) {
      if (!face.node || face.node.id !== id) { return; }
      face.pts.forEach(function (p) { z0 = Math.min(z0, p[2]); });
      if (bad && face.how && !face.how.ghost) { face.how = Object.assign({}, face.how, { color: EDIT3D_BAD, edge: "#a32b2f", tint: "bad", pat: 0 }); }
    });
    if (z0 === Infinity) { z0 = dz; }
    var base = dz + 1.3;                 // (over a rug)
    var line = { piece: true, color: bad ? EDIT3D_BAD : "#4ea3ff", edge: bad ? EDIT3D_BAD : "#4ea3ff", bare: true };
    function bar(x0, x1, y0, y1) { v3Prism(model.faces, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], base, base + 0.3, line); }
    // the ring round it
    var t = turned(edit3dFoot(n)), cx = n.x + dx, cy = n.y + dy, hw = t.w / 2 + 3, hh = t.h / 2 + 3;
    bar(cx - hw, cx + hw, cy - hh, cy - hh + 0.7); bar(cx - hw, cx + hw, cy + hh - 0.7, cy + hh);
    bar(cx - hw, cx - hw + 0.7, cy - hh, cy + hh); bar(cx + hw - 0.7, cx + hw, cy - hh, cy + hh);
    // and carried, the grid it steps along, faint, a metre and a half round it
    if (V3.carry) {
      var g = EDIT3D_GRID * FLOOR_PX, reach = 1.5 * FLOOR_PX, faint = { piece: true, color: line.color, edge: line.color, bare: true, alpha: 0.45, late: true };
      var gx0 = Math.floor((n.x - reach) / g) * g, gy0 = Math.floor((n.y - reach) / g) * g;
      for (var x = gx0; x <= n.x + reach; x += g) {
        v3Prism(model.faces, [[x + dx - 0.15, n.y - reach + dy], [x + dx + 0.15, n.y - reach + dy], [x + dx + 0.15, n.y + reach + dy], [x + dx - 0.15, n.y + reach + dy]], base - 0.15, base, faint);
      }
      for (var y = gy0; y <= n.y + reach; y += g) {
        v3Prism(model.faces, [[n.x - reach + dx, y + dy - 0.15], [n.x + reach + dx, y + dy - 0.15], [n.x + reach + dx, y + dy + 0.15], [n.x - reach + dx, y + dy + 0.15]], base - 0.15, base, faint);
      }
    }
  }
  // (a model colored red is a model made again in red: its color in what it is kept by)
  if (typeof gl3Mesh === "function") {
    var gl3MeshEdit = gl3Mesh;
    gl3Mesh = function (B, f) {
      if (f && f.how && f.how.tint && f.mesh) {
        // kept apart from its usual colors: the model's points copied, so the red is not kept for it
        var m = Object.assign({}, f.mesh, { p: f.mesh.p.slice ? f.mesh.p.slice() : f.mesh.p, made: null });
        return gl3MeshEdit.call(this, B, Object.assign({}, f, { mesh: m }));
      }
      return gl3MeshEdit.apply(this, arguments);
    };
  }

  // ---- picked: turned, or taken away ---------------------------------------------------------------
  function edit3dPick(id) {
    if (!V3) { return; }
    V3.sel = id && nodeById(id) && !DRAG_FIXED[nodeById(id).kind] ? id : null;
    V3.dirty = true;
    var box = V3.box, bar = el(".v3-picked", box);
    if (!V3.sel) { if (bar) { bar.remove(); } return; }
    var n = nodeById(V3.sel);
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "v3-picked";
      bar.setAttribute("role", "toolbar");
      box.appendChild(bar);
    }
    bar.innerHTML = '<span class="v3-picked-name"></span><button type="button" class="btn small" data-e3="turn"></button>' +
                    '<button type="button" class="btn small" data-e3="del"></button><button type="button" class="btn small" data-e3="done"></button>';
    el(".v3-picked-name", bar).textContent = useName(n);
    el('[data-e3="turn"]', bar).textContent = TXT.e3_turn;
    el('[data-e3="turn"]', bar).title = TXT.e3_turn_tip;
    el('[data-e3="del"]', bar).textContent = TXT.e3_delete;
    el('[data-e3="del"]', bar).title = TXT.e3_delete_tip;
    el('[data-e3="done"]', bar).textContent = TXT.e3_done;
    el('[data-e3="turn"]', bar).onclick = function () { edit3dTurn(); };
    el('[data-e3="del"]', bar).onclick = function () { edit3dDelete(); };
    el('[data-e3="done"]', bar).onclick = function () { edit3dPick(null); };
  }
  function edit3dTurn() {
    var n = V3 && V3.sel ? nodeById(V3.sel) : null;
    if (!n) { return; }
    var undoAt = wasLike.length, was = n.turn || 0;
    keepUndo();
    n.turn = (((was + 90) % 360) + 360) % 360;
    if (edit3dClash(n)) {                // turned, it would not fit: as it was
      n.turn = was;
      if (wasLike.length > undoAt) { wasLike.length = undoAt; showUndo(); }
      v3Say(TXT.e3_no_turn);
      return;
    }
    edit3dSaved();
  }
  function edit3dDelete() {
    var n = V3 && V3.sel ? nodeById(V3.sel) : null;
    if (!n) { return; }
    keepUndo();
    hand.nodes = hand.nodes.filter(function (m) { return m !== n; });
    hand.links = hand.links.filter(function (l) { return l.from !== n.id && l.to !== n.id; });
    v3Say(say("e3_deleted", { what: useName(n) }));
    edit3dPick(null);
    edit3dSaved();
  }
  function edit3dSaved() {
    if (typeof handKeep === "function") { handKeep(); }
    try { drawHand(); drawHandPanel(); } catch (e) { /* later */ }
    if (V3) { V3.dirty = true; V3.ground = null; }
  }

  // ---- keys in the view: undo, redo, take away, turn -------------------------------------------
  if (typeof stepBack === "function") {
    var stepBack3d = stepBack;
    stepBack = function () {
      var out = stepBack3d.apply(this, arguments);
      if (typeof V3 !== "undefined" && V3) {
        V3.dirty = true; V3.ground = null; V3.xrayKept = null;
        if (V3.sel && !nodeById(V3.sel)) { edit3dPick(null); }
      }
      return out;
    };
  }
  document.addEventListener("keydown", function (ev) {
    if (typeof V3 === "undefined" || !V3 || !V3.box || !document.body.contains(V3.box)) { return; }
    if (ev.target && ev.target.closest && ev.target.closest("input, textarea, select, [contenteditable]")) { return; }
    var k = String(ev.key || "").toLowerCase(), cmd = ev.ctrlKey || ev.metaKey;
    if (cmd && k === "z") { ev.preventDefault(); ev.stopPropagation(); stepBack(!!ev.shiftKey); v3Say(ev.shiftKey ? TXT.e3_redone : TXT.e3_undone); return; }
    if (cmd && k === "y") { ev.preventDefault(); ev.stopPropagation(); stepBack(true); v3Say(TXT.e3_redone); return; }
    if (!V3.sel || cmd) { return; }
    if (k === "delete" || k === "backspace") { ev.preventDefault(); ev.stopPropagation(); edit3dDelete(); }
    else if (k === "r") { ev.preventDefault(); ev.stopPropagation(); edit3dTurn(); }
    else if (k === "escape") { ev.preventDefault(); ev.stopPropagation(); edit3dPick(null); }
  }, true);

  // ---- the trees on the lot, the lot's own --------------------------------------------------------
  // The scenery's trees stood on the lot too, and could not be had: a
  // garden's trees are pieces of it now (i_tree, 40-things3d.js), put
  // there once, where the scenery had them -- to move, or take away -- and
  // the scenery's keep off the lot.
  function edit3dLotTrees() {
    if (typeof tieHomeLike === "function" && !tieHomeLike()) { return; }
    var lot = hand.nodes.filter(function (n) { return n.kind === "i_lot"; })[0];
    if (!lot || (hand.house && hand.house.treesPlaced) || (typeof houseOpt === "function" && !houseOpt("trees"))) { return; }
    var P = FLOOR_PX, rnd = typeof gl3Rand === "function" ? gl3Rand(Math.round(Math.abs(lot.x) * 3 + Math.abs(lot.y)) + 11) : Math.random;
    // the kinds the land grows (40-plants.js), as wide and as tall as each grows
    var scapeNow = typeof worldScape === "function" ? worldScape() : "plains";
    var kinds = typeof PLANT_YARD === "object" ? ((PLANT_YARD[scapeNow] || PLANT_YARD.plains).big || []) : [];
    if (!kinds.length) { kinds = ["oak", "maple", "broad"]; }
    var lt = turned(lot), want = Math.max(1, Math.min(7, Math.round(lt.w * lt.h / (P * P) / 240))), placed = [];
    var built = hand.nodes.filter(function (n) { return n !== lot && (n.kind === "i_room" || n.kind === "i_floor" || edit3dBlocks(n.kind) || isArea(n.kind)); });
    var doors = hand.nodes.filter(function (d) { return WALK_DOORS[d.kind]; });
    for (var tries = 0; placed.length < want && tries < want * 60; tries++) {
      var sp = kinds[Math.floor(rnd() * kinds.length)], wide = ((typeof PLANT_SPREAD === "object" && PLANT_SPREAD[sp]) || 4) * P;
      var x = lot.x + (rnd() - 0.5) * (lt.w - 2 * P), y = lot.y + (rnd() - 0.5) * (lt.h - 2 * P);
      if (!insideArea(lot, x, y, 1.2 * P)) { continue; }
      if (built.some(function (b) { var q = turned(b); return Math.abs(b.x - x) * 2 < q.w + wide * 0.55 + 4 * P && Math.abs(b.y - y) * 2 < q.h + wide * 0.55 + 4 * P; })) { continue; }
      if (doors.some(function (d) { return Math.hypot(d.x - x, d.y - y) < wide * 0.4 + 3.5 * P; })) { continue; }
      if (placed.some(function (p) { return Math.hypot(p.x - x, p.y - y) < (p.wide + wide) * 0.4; })) { continue; }
      placed.push({ x: x, y: y, sp: sp, wide: wide });
    }
    keepUndo();
    placed.forEach(function (p) {
      var size = Math.round(Math.max(20, Math.min(140, p.wide / P / 3.6 * 48)));
      hand.nodes.push({ id: hand.next++, kind: "i_tree", x: Math.round(p.x), y: Math.round(p.y), w: size, h: size, text: "", sp: p.sp,
                        crown: Math.round(p.wide / P * 10) / 10,
                        tall: typeof OBJ3_TREE_TALL === "object" ? OBJ3_TREE_TALL[p.sp] || 8 : 8 });
    });
    hand.house = Object.assign({}, hand.house || {}, { treesPlaced: true });
    if (typeof handKeep === "function") { handKeep(); }
    try { drawHand(); } catch (e) { /* later */ }
  }
  if (typeof v3Open === "function") {
    var v3OpenTrees = v3Open;
    v3Open = function () {
      var was = typeof V3 !== "undefined" ? V3 : null;
      if (!was) { try { edit3dLotTrees(); } catch (e) { /* as it was */ } }
      return v3OpenTrees.apply(this, arguments);
    };
  }
  // the scenery's trees, off a lot whose own are pieces of it (gl3Scenery, 38-view3d-gl.js)
  function sceneryKeepOffLot() {
    if (!hand.house || !hand.house.treesPlaced) { return null; }
    var lot = hand.nodes.filter(function (n) { return n.kind === "i_lot"; })[0];
    return lot ? function (p) { return insideArea(lot, p[0], p[1], -1 * FLOOR_PX); } : null;
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyTrees = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyTrees.apply(this, arguments) + (hand.house && hand.house.treesPlaced ? "|tp" : ""); };
  }
