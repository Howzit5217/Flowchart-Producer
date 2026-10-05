// ---------------------------------------------------------------------------
//  40-drag.js -- Drag view: a switch (and a tap of Shift) between dragging
//  things and dragging only the view, on the paper and in 3D -- and in 3D,
//  furniture picked up and carried across the floor
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "it being easier to drag things where there is a
  // drag toggle where you can turn it on and off with shifting and so when
  // it is on you can drag around but not dragging things")
  //
  // One switch for both: with Drag view on, every drag moves the view --
  // over a shape too -- and nothing on the plan can be knocked out of place;
  // a tap still picks a shape.  Off, a drag on a shape moves it, as ever on
  // the paper, and now in 3D as well: a piece of furniture is taken hold of
  // where it is seen and carried across its floor.  A quick tap of Shift,
  // with nothing else pressed, flips it.
  var dragView = false;
  try { dragView = localStorage.getItem("flowchart-drag-view") === "on"; } catch (e) { /* off */ }
  function dragViewSet(on, told) {
    dragView = !!on;
    // (kept for the paper: in 3D it is the view's own, on as it opens -- below)
    var paper = dragPaperWas === null || dragPaperWas === undefined;
    if (paper) { try { localStorage.setItem("flowchart-drag-view", dragView ? "on" : "off"); } catch (e) { /* this visit */ } }
    dragViewShow();
    if (told) {
      var words = dragView ? TXT.dv_on : TXT.dv_off;
      if (typeof V3 !== "undefined" && V3 && typeof v3Say === "function") { v3Say(words); }
      else if (typeof handSays === "function") { handSays(words); }
    }
  }
  var DRAG_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.4 9.2V4.6a1.3 1.3 0 0 1 2.6 0v4.2V3.6a1.3 1.3 0 0 1 2.6 0v5.2' +
                  'V5a1.3 1.3 0 0 1 2.6 0v6.6c0 3.4-2.2 5.8-5.4 5.8-2.2 0-3.6-1-4.8-2.8L3 11.6a1.3 1.3 0 0 1 2-1.6l2.4 2.4"/></svg>';
  // The button beside Move and Select, under the paper.
  function dragViewShow() {
    document.body.classList.toggle("drag-view", dragView);
    var seg = el("#tool-seg");
    if (seg && !el("#tool-view")) {
      var b = document.createElement("button");
      b.className = "seg-btn";
      b.id = "tool-view";
      b.type = "button";
      b.innerHTML = DRAG_ICON + '<span data-w="tool_view"></span>';
      b.onclick = function () { dragViewSet(!dragView); };
      seg.appendChild(b);
      // choosing Move or Select is choosing to drag things
      ["#tool-move", "#tool-select"].forEach(function (id) {
        var t = el(id);
        if (t) { t.addEventListener("click", function () { if (dragView) { dragViewSet(false); } }); }
      });
    }
    var v = el("#tool-view");
    if (v) {
      v.lastChild.textContent = TXT.tool_view;
      v.title = TXT.tool_view_tip;
      v.classList.toggle("on", dragView);
      v.setAttribute("aria-pressed", dragView ? "true" : "false");
    }
    if (dragView) {
      ["#tool-move", "#tool-select"].forEach(function (id) {
        var t = el(id);
        if (t) { t.classList.remove("on"); t.setAttribute("aria-pressed", "false"); }
      });
    } else if (typeof showTool === "function" && typeof handTool !== "undefined") { showTool(handTool); }
    if (typeof V3 !== "undefined" && V3 && typeof v3Words === "function") { v3Words(); }
  }
  if (typeof showTool === "function") {
    var showToolDragging = showTool;
    showTool = function () {
      var out = showToolDragging.apply(this, arguments);
      if (dragView) {
        ["#tool-move", "#tool-select"].forEach(function (id) {
          var t = el(id);
          if (t) { t.classList.remove("on"); t.setAttribute("aria-pressed", "false"); }
        });
      }
      return out;
    };
  }
  try { dragViewShow(); } catch (e) { /* the bar without it */ }

  // ---- a tap of Shift ------------------------------------------------------------------------
  // Down and up again quickly with nothing else pressed between -- Shift
  // held for a box, a click, or running while walking is not a tap.
  var shiftTap = null;
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Shift") { if (!ev.repeat) { shiftTap = performance.now(); } return; }
    shiftTap = null;
  }, true);
  ["pointerdown", "wheel"].forEach(function (t) { window.addEventListener(t, function () { shiftTap = null; }, true); });
  window.addEventListener("keyup", function (ev) {
    if (ev.key !== "Shift" || shiftTap === null) { return; }
    var quick = performance.now() - shiftTap < 450;
    shiftTap = null;
    if (!quick || (typeof typingNow === "function" && typingNow())) { return; }
    var on = document.activeElement;
    if (on && on.closest && on.closest("input, textarea, select, [contenteditable]")) { return; }
    var inView = typeof V3 !== "undefined" && V3 && V3.scene !== "space";
    if (!inView && !byHand) { return; }
    dragViewSet(!dragView, true);
  }, true);

  // ---- on the paper: every drag the view's ---------------------------------------------------
  // Caught on the way down, before a shape can take it, the way Space and a
  // drag moves about (11-hand-many.js); a press let go where it was picks
  // the shape it was on.
  (function () {
    var stage = el("#stage");
    if (!stage) { return; }
    stage.addEventListener("pointerdown", function (ev) {
      if (!dragView || !byHand || ev.button !== 0 || (typeof pinched !== "undefined" && pinched)) { return; }
      var paper = el("#chart");
      if (!paper || !paper.contains(ev.target) || (ev.target.closest && ev.target.closest(".menu, .typing, input, textarea"))) { return; }
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof glideStop === "function") { glideStop(); }
      var fromX = ev.clientX, fromY = ev.clientY, wasL = stage.scrollLeft, wasT = stage.scrollTop;
      var wasX = typeof holdX !== "undefined" ? holdX : 0, wasY = typeof holdY !== "undefined" ? holdY : 0, went = 0;
      var g = ev.target.closest ? ev.target.closest(".node") : null;
      try { stage.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      stage.classList.add("grabbing");
      function move(e) {
        if (e.pointerId !== ev.pointerId) { return; }
        if (typeof pinched !== "undefined" && pinched) { done(); return; }
        went = Math.max(went, Math.abs(e.clientX - fromX) + Math.abs(e.clientY - fromY));
        if (loose) {
          holdX = wasX + (e.clientX - fromX);
          holdY = wasY + (e.clientY - fromY);
          holdClamp();
        } else {
          stage.scrollLeft = wasL - (e.clientX - fromX);
          stage.scrollTop = wasT - (e.clientY - fromY);
        }
      }
      function done(e) {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", done);
        window.removeEventListener("pointercancel", done);
        stage.classList.remove("grabbing");
        if (e && e.type === "pointerup" && went < 5 && g && g.dataset && g.dataset.i) {
          // a tap: the shape it was on, taken up
          var id = +String(g.dataset.i).replace(/^h/, "");
          if (nodeById(id)) {
            picked = id; chosen = null;
            if (typeof many !== "undefined") { many = []; }
            drawHand(); drawHandPanel();
          }
        }
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", done);
      window.addEventListener("pointercancel", done);
    }, true);
  })();

  // ---- in 3D: carrying furniture ---------------------------------------------------------------
  // What the view drew last, and with what camera (38-view3d-gl.js keeps it):
  // a press is turned into a ray through the picture, and the nearest piece
  // it meets -- not one behind a wall or under the roof -- is taken hold of.
  var DRAG_FIXED = { i_room: 1, i_floor: 1, i_lot: 1, i_zone: 1, i_window: 1, i_wall: 1 };
  function dragInverse(m) {
    var a = m, inv = new Float32Array(16);
    inv[0] = a[5] * a[10] * a[15] - a[5] * a[11] * a[14] - a[9] * a[6] * a[15] + a[9] * a[7] * a[14] + a[13] * a[6] * a[11] - a[13] * a[7] * a[10];
    inv[4] = -a[4] * a[10] * a[15] + a[4] * a[11] * a[14] + a[8] * a[6] * a[15] - a[8] * a[7] * a[14] - a[12] * a[6] * a[11] + a[12] * a[7] * a[10];
    inv[8] = a[4] * a[9] * a[15] - a[4] * a[11] * a[13] - a[8] * a[5] * a[15] + a[8] * a[7] * a[13] + a[12] * a[5] * a[11] - a[12] * a[7] * a[9];
    inv[12] = -a[4] * a[9] * a[14] + a[4] * a[10] * a[13] + a[8] * a[5] * a[14] - a[8] * a[6] * a[13] - a[12] * a[5] * a[10] + a[12] * a[6] * a[9];
    inv[1] = -a[1] * a[10] * a[15] + a[1] * a[11] * a[14] + a[9] * a[2] * a[15] - a[9] * a[3] * a[14] - a[13] * a[2] * a[11] + a[13] * a[3] * a[10];
    inv[5] = a[0] * a[10] * a[15] - a[0] * a[11] * a[14] - a[8] * a[2] * a[15] + a[8] * a[3] * a[14] + a[12] * a[2] * a[11] - a[12] * a[3] * a[10];
    inv[9] = -a[0] * a[9] * a[15] + a[0] * a[11] * a[13] + a[8] * a[1] * a[15] - a[8] * a[3] * a[13] - a[12] * a[1] * a[11] + a[12] * a[3] * a[9];
    inv[13] = a[0] * a[9] * a[14] - a[0] * a[10] * a[13] - a[8] * a[1] * a[14] + a[8] * a[2] * a[13] + a[12] * a[1] * a[10] - a[12] * a[2] * a[9];
    inv[2] = a[1] * a[6] * a[15] - a[1] * a[7] * a[14] - a[5] * a[2] * a[15] + a[5] * a[3] * a[14] + a[13] * a[2] * a[7] - a[13] * a[3] * a[6];
    inv[6] = -a[0] * a[6] * a[15] + a[0] * a[7] * a[14] + a[4] * a[2] * a[15] - a[4] * a[3] * a[14] - a[12] * a[2] * a[7] + a[12] * a[3] * a[6];
    inv[10] = a[0] * a[5] * a[15] - a[0] * a[7] * a[13] - a[4] * a[1] * a[15] + a[4] * a[3] * a[13] + a[12] * a[1] * a[7] - a[12] * a[3] * a[5];
    inv[14] = -a[0] * a[5] * a[14] + a[0] * a[6] * a[13] + a[4] * a[1] * a[14] - a[4] * a[2] * a[13] - a[12] * a[1] * a[6] + a[12] * a[2] * a[5];
    inv[3] = -a[1] * a[6] * a[11] + a[1] * a[7] * a[10] + a[5] * a[2] * a[11] - a[5] * a[3] * a[10] - a[9] * a[2] * a[7] + a[9] * a[3] * a[6];
    inv[7] = a[0] * a[6] * a[11] - a[0] * a[7] * a[10] - a[4] * a[2] * a[11] + a[4] * a[3] * a[10] + a[8] * a[2] * a[7] - a[8] * a[3] * a[6];
    inv[11] = -a[0] * a[5] * a[11] + a[0] * a[7] * a[9] + a[4] * a[1] * a[11] - a[4] * a[3] * a[9] - a[8] * a[1] * a[7] + a[8] * a[3] * a[5];
    inv[15] = a[0] * a[5] * a[10] - a[0] * a[6] * a[9] - a[4] * a[1] * a[10] + a[4] * a[2] * a[9] + a[8] * a[1] * a[6] - a[8] * a[2] * a[5];
    var det = a[0] * inv[0] + a[1] * inv[4] + a[2] * inv[8] + a[3] * inv[12];
    if (!det) { return null; }
    for (var i = 0; i < 16; i++) { inv[i] /= det; }
    return inv;
  }
  function dragApply(m, v) {             // a column-major matrix times a point
    return [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
            m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3], m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]];
  }
  // The ray through a point of the view: from where, and which way.
  function dragRay(ev) {
    var G = V3 && V3.gl;
    if (!G || !G.mvp) { return null; }
    var r = V3.canvas.getBoundingClientRect();
    var nx = (ev.clientX - r.left) / Math.max(1, r.width) * 2 - 1, ny = 1 - (ev.clientY - r.top) / Math.max(1, r.height) * 2;
    var inv = dragInverse(G.mvp);
    if (!inv) { return null; }
    var a = dragApply(inv, [nx, ny, -1, 1]), b = dragApply(inv, [nx, ny, 1, 1]);
    if (!a[3] || !b[3]) { return null; }
    a = [a[0] / a[3], a[1] / a[3], a[2] / a[3]]; b = [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]) || 1;
    return { o: a, d: [d[0] / l, d[1] / l, d[2] / l] };
  }
  // How far along the ray it meets a flat face, or Infinity.
  function dragHitFace(R, pts, n) {
    var dn = R.d[0] * n[0] + R.d[1] * n[1] + R.d[2] * n[2];
    if (Math.abs(dn) < 1e-6) { return Infinity; }
    var p0 = pts[0], t = ((p0[0] - R.o[0]) * n[0] + (p0[1] - R.o[1]) * n[1] + (p0[2] - R.o[2]) * n[2]) / dn;
    if (t <= 0) { return Infinity; }
    var x = R.o[0] + R.d[0] * t, y = R.o[1] + R.d[1] * t, z = R.o[2] + R.d[2] * t;
    // inside it: on the same side of every edge (it is convex)
    var ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
    var i0 = ax >= ay && ax >= az ? 1 : 0, i1 = ax >= ay && ax >= az ? 2 : ay >= az ? 2 : 1;
    var q = [x, y, z], sign = 0;
    for (var k = 0; k < pts.length; k++) {
      var p = pts[k], s = pts[(k + 1) % pts.length];
      var c = (s[i0] - p[i0]) * (q[i1] - p[i1]) - (s[i1] - p[i1]) * (q[i0] - p[i0]);
      if (Math.abs(c) < 1e-9) { continue; }
      if (!sign) { sign = c > 0 ? 1 : -1; } else if ((c > 0 ? 1 : -1) !== sign) { return Infinity; }
    }
    return t;
  }
  function dragPick(ev) {
    var model = V3 && V3.dragModel, R = dragRay(ev);
    if (!model || !R) { return null; }
    var boxes = {}, wall = Infinity;
    model.faces.forEach(function (f) {
      var n = f.node;
      if (f.me || f.found || !f.pts || f.pts.length < 3) { return; }
      // a wall, a floor, the roof: what is behind it is not to be had
      if (!n || DRAG_FIXED[n.kind] || WALK_DOORS[n.kind] || BETWEEN_FLOORS[n.kind]) {
        if ((f.how && f.how.ghost) || f.floor) { return; }
        var t = dragHitFace(R, f.pts, f.n);
        if (t < wall) { wall = t; }
        return;
      }
      var b = boxes[n.id] || (boxes[n.id] = { node: n, x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, z0: Infinity, z1: -Infinity });
      f.pts.forEach(function (p) {
        b.x0 = Math.min(b.x0, p[0]); b.x1 = Math.max(b.x1, p[0]); b.y0 = Math.min(b.y0, p[1]); b.y1 = Math.max(b.y1, p[1]);
        b.z0 = Math.min(b.z0, p[2]); b.z1 = Math.max(b.z1, p[2]);
      });
    });
    var best = null, near = Infinity;
    Object.keys(boxes).forEach(function (id) {
      var b = boxes[id], lo = 0, hi = Infinity;
      [["x0", "x1", 0], ["y0", "y1", 1], ["z0", "z1", 2]].forEach(function (ax) {
        var o = R.o[ax[2]], d = R.d[ax[2]], a = b[ax[0]] - 1, c = b[ax[1]] + 1;
        if (Math.abs(d) < 1e-9) { if (o < a || o > c) { lo = Infinity; } return; }
        var t1 = (a - o) / d, t2 = (c - o) / d;
        lo = Math.max(lo, Math.min(t1, t2)); hi = Math.min(hi, Math.max(t1, t2));
      });
      if (lo <= hi && lo < near) { near = lo; best = b; }
    });
    if (!best || near > wall + 2) { return null; }
    return { box: best, ray: R };
  }
  // Where the ray meets the level a piece stands on.
  function dragOnLevel(R, z) {
    if (Math.abs(R.d[2]) < 0.04) { return null; }
    var t = (z - R.o[2]) / R.d[2];
    if (t <= 0) { return null; }
    return [R.o[0] + R.d[0] * t, R.o[1] + R.d[1] * t];
  }
  function dragCarry(canvas) {
    canvas.addEventListener("pointerdown", function (ev) {
      if (dragView || ev.button !== 0 || ev.shiftKey || !V3 || V3.scene === "space" || !V3.gl) { return; }
      if (document.pointerLockElement === canvas) { return; }
      var hit = dragPick(ev);
      if (!hit) { return; }
      var real = nodeById(hit.box.node.id);
      var from = dragOnLevel(hit.ray, hit.box.z0);
      if (!real || !from) { return; }
      ev.preventDefault();
      ev.stopImmediatePropagation();
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      var moved = false, z = hit.box.z0, jn = hit.box.node, startJ = [jn.x, jn.y];
      // (rooms drawn apart are put together in 3D, 39-join.js: where it is
      // set down in 3D is in the room there, and on the paper by that room's
      // own way of moving -- the rooms stay put while it is carried)
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
        real.x = Math.round(put[0]); real.y = Math.round(put[1]);
        V3.dirty = true;
      }
      function up(e) {
        if (e.pointerId !== ev.pointerId) { return; }
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        canvas.classList.remove("v3-carrying");
        if (!moved) { return; }
        if (typeof handKeep === "function") { handKeep(); }
        try { drawHand(); drawHandPanel(); } catch (err) { /* the paper catches up later */ }
        if (V3) { V3.dirty = true; v3Say(say("dv_moved", { what: labelName(real.kind) })); }
      }
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
    }, true);
  }
  // The picture the press is matched against: the last one built (38-view3d.js).
  if (typeof v3Build === "function") {
    var v3BuildForDrag = v3Build;
    v3Build = function () {
      var model = v3BuildForDrag.apply(this, arguments);
      if (V3) { V3.dragModel = model; }
      return model;
    };
  }

  // ---- the switch in the 3D view's bar ---------------------------------------------------------
  HOUSE_ICONS.drag = '<path d="M7.4 9.2V4.6a1.3 1.3 0 0 1 2.6 0v4.2V3.6a1.3 1.3 0 0 1 2.6 0v5.2V5a1.3 1.3 0 0 1 2.6 0v6.6c0 3.4-2.2 5.8-5.4 5.8-2.2 0-3.6-1-4.8-2.8L3 11.6a1.3 1.3 0 0 1 2-1.6l2.4 2.4"/>';
  if (typeof V3_GROUPS !== "undefined") { V3_GROUPS[1].push("drag"); }
  function dragButton() {
    if (!V3 || !V3.box) { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar) { return; }
    var b = el('[data-v3="drag"]', bar);
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.className = "btn small";
      b.dataset.v3 = "drag";
      b.onclick = function () { dragViewSet(!dragView, true); };
      var g = el('.v3-group[data-group="1"]', bar) || bar;
      g.appendChild(b);
    }
    var lbl = el(".v3-lbl", b);
    if (lbl) { if (lbl.textContent !== TXT.tool_view) { lbl.textContent = TXT.tool_view; } } else { b.textContent = TXT.tool_view; }
    b.title = TXT.dv_tip3d;
    b.setAttribute("aria-label", TXT.tool_view);
    b.setAttribute("aria-pressed", dragView ? "true" : "false");
    b.hidden = V3.scene === "space";
  }
  // With it on, a tap in 3D still picks what it is on -- its menu opened,
  // as a click does with it off (40-open3d.js) -- and only a drag is the
  // view's, as on the paper.  (2026-10-05: the view opening with it on had
  // put every piece out of reach of a click: "issues with the activating
  // things in the 3d area".)  Walking, a click uses things either way.
  function dragTap(canvas) {
    var down = null;
    canvas.addEventListener("pointerdown", function (ev) {
      down = null;
      if (!dragView || ev.button !== 0 || ev.shiftKey || !V3 || V3.scene === "space" || !V3.gl || V3.mode === "walk" || V3.o3Follow) { return; }
      if (document.pointerLockElement === canvas) { return; }
      down = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
    }, true);
    canvas.addEventListener("pointercancel", function () { down = null; });
    canvas.addEventListener("pointerup", function (ev) {
      var d = down;
      down = null;
      if (!d || d.id !== ev.pointerId || !dragView || !V3 || V3.mode === "walk") { return; }
      if (Math.hypot(ev.clientX - d.x, ev.clientY - d.y) > 6) { return; }   // a drag: the view's
      var hit = dragPick(ev), real = hit ? nodeById(hit.box.node.id) : null;
      if (!real) { if (V3.sel && typeof edit3dPick === "function") { edit3dPick(null); } return; }
      if (typeof edit3dPick === "function") { edit3dPick(real.id); }
      var x = ev.clientX, y = ev.clientY;
      if (typeof o3Menu === "function") { setTimeout(function () { o3Menu(real.id, x, y); }, 0); }   // (after the click that would shut it)
    });
  }
  // (2026-10-05: "when you go into 3d mode the drag view is toggled on") --
  // the 3D view opens with every drag the view's; the paper's own choice
  // given back when it closes.
  var dragPaperWas = null;
  if (typeof v3Open === "function") {
    var v3OpenDrag = v3Open;
    v3Open = function () {
      var was = V3, out = v3OpenDrag.apply(this, arguments);
      try {
        if (V3 && V3 !== was) {
          if (dragPaperWas === null) { dragPaperWas = dragView; }
          if (!dragView) { dragViewSet(true); }
          dragCarry(V3.canvas); dragTap(V3.canvas); dragButton(); v3Words();
        }
      } catch (e) { /* the view without it */ }
      return out;
    };
  }
  if (typeof v3Close === "function") {
    var v3CloseDrag = v3Close;
    v3Close = function () {
      var out = v3CloseDrag.apply(this, arguments);
      try { if (!V3 && dragPaperWas !== null) { var back = dragPaperWas; dragPaperWas = null; if (back !== dragView) { dragViewSet(back); } } } catch (e) { /* as it is */ }
      return out;
    };
  }
  if (typeof v3Words === "function") {
    var v3WordsDrag = v3Words;
    v3Words = function () {
      var out = v3WordsDrag.apply(this, arguments);
      try { dragButton(); if (typeof v3DressBar === "function") { v3DressBar(); } } catch (e) { /* fine */ }
      return out;
    };
  }
