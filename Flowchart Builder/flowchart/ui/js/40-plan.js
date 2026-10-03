// ---------------------------------------------------------------------------
//  40-plan.js -- a floor plan on the paper, easier to read: the arrows
//  joining rooms drawn bold and in color, with a door at their middle
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "The arrows that appear in the design mode are
  // also hard to see on the chart")
  //
  // In a design an arrow between two rooms (or a room and a door) is a
  // door in 3D (39-join.js); on the paper it was a flowchart's arrow, a
  // black line a pixel wide, lost on the lot's grass and the grid.  Now,
  // after each drawing of the paper, such an arrow has a white halo under
  // it, a line three times as thick in the design's own color, a bigger
  // head, and a small door on its middle -- saying what it will be.
  var PLAN_TIE = "#1f7a8c";
  function planTieable(n) {
    return !!n && (n.kind === "i_room" || WALK_DOORS[n.kind] || n.kind === "i_window" || BETWEEN_FLOORS[n.kind]);
  }
  function planArrows() {
    var svg = typeof chart !== "undefined" && chart ? chart : el("#chart");
    if (!svg || !document.body.classList.contains("designing")) { return; }
    var NS = "http://www.w3.org/2000/svg", over = el(".plan-ties", svg);
    if (over) { over.remove(); }
    var links = all(".link[data-link]", svg);
    if (!links.length) { return; }
    // over everything on the paper -- the lot's grass was drawn over the
    // arrows' lines -- in layers: the halos, the lines, the heads, the doors
    over = document.createElementNS(NS, "g");
    over.setAttribute("class", "plan-ties");
    over.setAttribute("aria-hidden", "true");
    var layers = ["halos", "lines", "heads", "doors"].map(function (k) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "plan-ties-" + k);
      over.appendChild(g);
      return g;
    });
    function path(d, attrs, into) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      Object.keys(attrs).forEach(function (k) { p.setAttribute(k, attrs[k]); });
      into.appendChild(p);
      return p;
    }
    var heads = all("polygon.head", svg), any = false, byId = new Map();
    hand.links.forEach(function (l) { byId.set(l.id, l); });
    // (each head's tip read once, not once an arrow)
    var tips = heads.map(function (h) {
      var first = (h.getAttribute("points") || "").split(" ")[0].split(",");
      return [h, +first[0], +first[1]];
    });
    // Every arrow measured first, then all drawn: a class put on between
    // two measures had the browser work the whole paper out again for the
    // next (a second and more on a building of five hundred rooms).
    var todo = [];
    links.forEach(function (g) {
      var id = +g.dataset.link, link = byId.get(id);
      if (!link || !planTieable(nodeById(link.from)) || !planTieable(nodeById(link.to))) { return; }
      var flow = el(".flow", g);
      if (!flow || link.color) { return; }       // one colored by hand keeps its own color
      var len = 0;
      try { len = flow.getTotalLength(); } catch (e) { len = 0; }
      if (len < 4) { return; }
      todo.push({ g: g, link: link, len: len, d: flow.getAttribute("d"), on: g.classList.contains("on"),
                  end: flow.getPointAtLength(len), back: flow.getPointAtLength(Math.max(0, len - 8)),
                  mid: len > 46 ? flow.getPointAtLength(len / 2) : null });
    });
    todo.forEach(function (t) {
      var g = t.g, link = t.link, d = t.d, on = t.on, end = t.end, back = t.back;
      g.classList.add("tie");
      any = true;
      // (drawn in its own colors, not the page's: a picture saved of the paper keeps them)
      path(d, { stroke: "#ffffff", "stroke-width": "8", "stroke-linecap": "round", "stroke-linejoin": "round", opacity: "0.92" }, layers[0]);
      path(d, { stroke: PLAN_TIE, "stroke-width": on ? "4.4" : "3", "stroke-linecap": "round", "stroke-linejoin": "round" }, layers[1]);
      // the plain head under it, put away
      tips.forEach(function (h) {
        if (Math.abs(h[1] - end.x) < 1.5 && Math.abs(h[2] - end.y) < 1.5) { h[0].classList.add("tie-gone"); }
      });
      var dx = end.x - back.x, dy = end.y - back.y, run = Math.hypot(dx, dy) || 1, ux = dx / run, uy = dy / run;
      var cx = end.x - ux * 14, cy = end.y - uy * 14;
      if (link.head !== false) {
        var head = document.createElementNS(NS, "polygon");
        head.setAttribute("points", [end.x, end.y, cx - uy * 6.5, cy + ux * 6.5, cx + uy * 6.5, cy - ux * 6.5].map(function (v) { return v.toFixed(1); }).join(" "));
        head.setAttribute("fill", PLAN_TIE); head.setAttribute("stroke", "#ffffff");
        head.setAttribute("stroke-width", "1.4"); head.setAttribute("stroke-linejoin", "round");
        layers[2].appendChild(head);
      }
      // the door it will be, on its middle (where it is long enough to hold one)
      if (t.mid) {
        var mid = t.mid, badge = document.createElementNS(NS, "g");
        badge.setAttribute("transform", "translate(" + mid.x.toFixed(1) + "," + mid.y.toFixed(1) + ")");
        badge.innerHTML = '<circle r="10" fill="#ffffff" stroke="' + PLAN_TIE + '" stroke-width="2"/>' +
                          '<path d="M-3.6 5.2V-5.2h7.2v10.4M-5.6 5.2h11.2" fill="none" stroke="' + PLAN_TIE + '" stroke-width="1.5" ' +
                          'stroke-linecap="round" stroke-linejoin="round"/><circle cx="1.6" cy="0.6" r="0.9" fill="' + PLAN_TIE + '"/>';
        layers[3].appendChild(badge);
      }
    });
    if (any) { svg.appendChild(over); }
  }
  if (typeof drawHand === "function") {
    var drawHandArrows = drawHand;
    drawHand = function () {
      var out = drawHandArrows.apply(this, arguments);
      try { planArrows(); } catch (e) { /* the arrows as drawn */ }
      return out;
    };
  }

  // ---- a room made bigger or smaller: what is in it stays where it was in it --------------------
  // (asked for, 2026-10-02: "if the room gets bigger or smaller the items in
  // the room remain at their same position in the room")  Pulling a room's
  // corner moved its walls and nothing else: the bed that was against the
  // far wall stood out in the middle of the floor, or out through the wall
  // pulled in.  Now what stands against a wall goes with that wall, and
  // what stands out in the floor keeps its place across the room, as far
  // across it as it was.
  var planResize = null;
  function planRoomLocal(R, x, y) {
    var a = -(R.turn || 0) * Math.PI / 180, dx = x - R.x, dy = y - R.y;
    return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
  }
  function planRoomWorld(R, lx, ly) {
    var a = (R.turn || 0) * Math.PI / 180;
    return [R.x + lx * Math.cos(a) - ly * Math.sin(a), R.y + lx * Math.sin(a) + ly * Math.cos(a)];
  }
  function planFollow() {
    var S = planResize;
    if (!S) { return; }
    var room = S.room, was = S.was;
    if (room.w === S.lastW && room.h === S.lastH && room.x === S.lastX && room.y === S.lastY) { return; }
    S.lastW = room.w; S.lastH = room.h; S.lastX = room.x; S.lastY = room.y;
    var hold = 0.3 * FLOOR_PX;
    S.items.forEach(function (it) {
      var n = it.n, out = [0, 0];
      [0, 1].forEach(function (k) {
        var half0 = (k ? was.h : was.w) / 2, half1 = (k ? room.h : room.w) / 2, v = it.local[k], size = it.half[k];
        var lo = v - size + half0, hi = half0 - (v + size);       // how far off each wall
        if (lo <= hold && hi > hold) { out[k] = -half1 + (v + half0); }
        else if (hi <= hold && lo > hold) { out[k] = half1 - (half0 - v); }
        else { out[k] = -half1 + (v + half0) / (2 * half0 || 1) * 2 * half1; }
      });
      var w = planRoomWorld(room, out[0], out[1]);
      n.x = Math.round(w[0]); n.y = Math.round(w[1]);
    });
  }
  (function () {
    var svg = typeof chart !== "undefined" && chart ? chart : el("#chart");
    var stage = el("#stage");
    if (!stage) { return; }
    stage.addEventListener("pointerdown", function (ev) {
      planResize = null;
      var grip = ev.target.closest && ev.target.closest(".grip");
      if (!grip || ev.button) { return; }
      var room = nodeById(+String(grip.dataset.i).replace(/^h/, ""));
      if (!room || !isArea(room.kind) || room.kind === "i_lot" || room.kind === "i_floor") { return; }
      var items = heldIn(room).map(function (id) { return nodeById(id); }).filter(Boolean).map(function (n) {
        var t = turned(n), rel = ((n.turn || 0) - (room.turn || 0)) % 180 !== 0;
        return { n: n, local: planRoomLocal(room, n.x, n.y), half: rel ? [n.h / 2, n.w / 2] : [n.w / 2, n.h / 2], t: t };
      });
      if (!items.length) { return; }
      planResize = { room: room, was: { x: room.x, y: room.y, w: room.w, h: room.h, turn: room.turn || 0 }, items: items,
                     lastW: room.w, lastH: room.h, lastX: room.x, lastY: room.y };
      void svg;
    }, true);
    window.addEventListener("pointerup", function () { if (planResize) { planFollow(); planResize = null; } }, true);
    window.addEventListener("pointercancel", function () { planResize = null; }, true);
  })();

  // ---- a room carried by a handle of its own ------------------------------------------------------
  // (asked for, 2026-10-02: "an easier way to drag a whole room")  A room
  // full of furniture had little floor left to take hold of it by.  The room
  // picked has a handle over its top edge: dragging it carries the room and
  // all that is in it, the way a press on its floor does.
  function planMoveHandle() {
    var svg = typeof chart !== "undefined" && chart ? chart : el("#chart");
    if (!svg || !document.body.classList.contains("designing")) { return; }
    var old = el(".plan-room-move", svg);
    if (old) { old.remove(); }
    var room = typeof picked !== "undefined" && picked ? nodeById(picked) : null;
    if (!room || !isArea(room.kind) || room.kind === "i_lot") { return; }
    var g = el('.node[data-i="h' + room.id + '"]', svg);
    if (!g) { return; }
    var NS = "http://www.w3.org/2000/svg", t = turned(room);
    var x = room.x + handOrigin.x, y = room.y - t.h / 2 + handOrigin.y - 18;
    var h = document.createElementNS(NS, "g");
    h.setAttribute("class", "plan-room-move");
    h.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
    h.setAttribute("role", "button");
    h.setAttribute("aria-label", TXT.pl_move_room);
    var word = TXT.pl_move_room, wide = 34 + word.length * 6.4;
    h.innerHTML = '<title></title><rect x="' + (-wide / 2) + '" y="-12" width="' + wide + '" height="24" rx="12" fill="' + PLAN_TIE + '"/>' +
                  '<path transform="translate(' + (-wide / 2 + 14) + ',0)" d="M0-6.5v13M-6.5 0h13M-2.4-4.2 0-6.5l2.4 2.3M-2.4 4.2 0 6.5l2.4-2.3M-4.2-2.4-6.5 0l2.3 2.4M4.2-2.4 6.5 0l-2.3 2.4" ' +
                  'fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                  '<text x="' + (-wide / 2 + 26) + '" y="4.2" fill="#ffffff" font-size="12" font-weight="600" stroke="none">' + escaped(word) + "</text>";
    h.firstChild.textContent = TXT.pl_move_room_tip;
    // a press on it is a press on the room's floor
    h.addEventListener("pointerdown", function (ev) {
      if (ev.button) { return; }
      ev.stopPropagation(); ev.preventDefault();
      var fake = new PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: ev.clientX, clientY: ev.clientY,
                                                    pointerId: ev.pointerId, pointerType: ev.pointerType, button: 0, buttons: 1,
                                                    isPrimary: true });
      var target = el(".shape, path, rect", g) || g;
      target.dispatchEvent(fake);
    });
    svg.appendChild(h);
  }
  var drawHandPlan = drawHand;
  drawHand = function () {
    try { planFollow(); } catch (e) { /* as it is */ }
    var out = drawHandPlan.apply(this, arguments);
    try { planMoveHandle(); } catch (e) { /* without it */ }
    return out;
  };
