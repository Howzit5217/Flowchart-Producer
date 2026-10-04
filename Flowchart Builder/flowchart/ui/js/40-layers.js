// ---------------------------------------------------------------------------
//  40-layers.js -- a design in layers: rooms, walls and doors, furniture,
//  lights and power, plumbing, outside and the site, people -- each shape
//  in one by what it is (or where it was put), and only the layers left
//  open picked: clicked, boxed, Ctrl+A, in 3D; the rest dimmed, a click
//  going through them to what is under it
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "when in select mode you can have different
  // layers on the image so you only select what you are looking for and
  // make sure the website building things also uses the new layering logic
  // and to put it in the right click menu too for the objects")
  //
  // What Start building makes is put in its layers the same way, by what
  // each thing is: its rooms, its walls and doors, the furniture, the lights,
  // the plumbing, and the site round it -- parking, paths, planting, trees.
  var LY_ORDER = ["rooms", "walls", "furniture", "lights", "water", "outside", "people"];
  var LY_LIGHTS = /light|lamp|sconce|chandelier|pendant|ceilingfan|outlet|switch|breaker|panel|smoke|thermostat|doorbell|charger|router|wifi|meter|solar|battery|alarm|camera|speaker|exhaustfan|vent/;
  var LY_WATER = /toilet|sink|shower|bath|tub|vanity|waterheater|heater|washer|dryer|dishwasher|faucet|drain|bidet|urinal|hottub|sprinkler/;
  var lyOff = {};
  try { lyOff = JSON.parse(localStorage.getItem("flowchart-layers-off") || "{}") || {}; } catch (e) { lyOff = {}; }
  function lySave() { try { localStorage.setItem("flowchart-layers-off", JSON.stringify(lyOff)); } catch (e) { /* this visit */ } }
  function lyOn() { return typeof designMode === "function" && designMode(); }
  var lyKept = new WeakMap();
  // which layer a shape is on
  function lyOf(n) {
    if (!n) { return "furniture"; }
    if (n.layer && LY_ORDER.indexOf(n.layer) >= 0) { return n.layer; }
    var got = lyKept.get(n);
    if (got && got.x === n.x && got.y === n.y && got.k === n.kind) { return got.v; }
    var k = n.kind || "", v;
    if (k === "i_room" || k === "i_floor" || k === "i_zone") { v = "rooms"; }
    else if (WALK_DOORS[k] || k === "i_window" || k === "i_wall" || BETWEEN_FLOORS[k]) { v = "walls"; }
    else if (typeof isPerson === "function" && isPerson(n)) { v = "people"; }
    else if (k === "i_lot" || (typeof isArea === "function" && isArea(k))) { v = "outside"; }
    else if (FROM_CEILING[k] || LY_LIGHTS.test(k)) { v = "lights"; }
    else if (LY_WATER.test(k)) { v = "water"; }
    else {
      // out of every room: the yard, the street, the site
      var inside = hand.nodes.some(function (r) { return r.kind === "i_room" && insideArea(r, n.x, n.y); });
      v = inside ? "furniture" : "outside";
    }
    lyKept.set(n, { x: n.x, y: n.y, k: n.kind, v: v });
    return v;
  }
  // whether it can be picked now
  function lyOpen(n) { return !lyOn() || !lyOff[lyOf(n)]; }
  function lyCount(layer) { return hand.nodes.filter(function (n) { return lyOf(n) === layer; }).length; }
  function lyAnyOff() { return LY_ORDER.some(function (l) { return lyOff[l]; }); }
  function lySet(layer, off) {
    if (off) { lyOff[layer] = true; } else { delete lyOff[layer]; }
    lySave();
    // what is taken up from a layer just shut: let go
    if (off && typeof takenIds === "function") {
      var keep = takenIds().filter(function (id) { return lyOpen(nodeById(id)); });
      if (keep.length !== takenIds().length) { takeUp(keep); }
    }
    lyRefresh();
  }
  function lyOnly(layer) {
    LY_ORDER.forEach(function (l) { if (l === layer) { delete lyOff[l]; } else { lyOff[l] = true; } });
    lySave();
    if (typeof takenIds === "function") { takeUp(takenIds().filter(function (id) { return lyOpen(nodeById(id)); })); }
    lyRefresh();
  }
  function lyAll() { lyOff = {}; lySave(); lyRefresh(); }
  function lyRefresh() {
    try { drawHand(); drawHandPanel(); } catch (e) { /* later */ }
    lyButton();
    var pop = el(".ly-pop");
    if (pop && pop.redraw) { pop.redraw(); }
  }

  // ---- on the paper: the shut layers dimmed, a click going through them ---------------------------
  function lyMark() {
    var svg = el("#chart");
    if (!svg) { return; }
    var on = lyOn() && lyAnyOff();
    all(".node[data-i]", svg).forEach(function (g) {
      var n = on ? nodeById(+String(g.dataset.i).slice(1)) : null, lock = !!(n && !lyOpen(n));
      if (g.classList.contains("ly-lock") !== lock) { g.classList.toggle("ly-lock", lock); }
    });
  }
  if (typeof drawHand === "function") {
    var drawHandLy = drawHand;
    drawHand = function () {
      var out = drawHandLy.apply(this, arguments);
      try { lyMark(); } catch (e) { /* drawn as it is */ }
      return out;
    };
  }
  // a box drawn across them takes up only what is on an open layer
  if (typeof mostlyIn === "function") {
    var mostlyInLy = mostlyIn;
    mostlyIn = function (n) { return lyOpen(n) && mostlyInLy.apply(this, arguments); };
  }
  // Ctrl+A: every shape on an open layer
  if (typeof selectAll === "function") {
    var selectAllLy = selectAll;
    selectAll = function () {
      var out = selectAllLy.apply(this, arguments);
      if (lyOn() && lyAnyOff()) { takeUp(takenIds().filter(function (id) { return lyOpen(nodeById(id)); })); drawHand(); drawHandPanel(); }
      return out;
    };
  }
  // in 3D, the same: a piece on a shut layer is not picked
  if (typeof edit3dPick === "function") {
    var edit3dPickLy = edit3dPick;
    edit3dPick = function (id) {
      if (id && !lyOpen(nodeById(id))) { if (typeof v3Say === "function") { v3Say(say("ly_shut", { layer: TXT["ly_" + lyOf(nodeById(id))] })); } return edit3dPickLy.call(this, null); }
      return edit3dPickLy.apply(this, arguments);
    };
  }

  // ---- the Layers button, by Select ------------------------------------------------------------------
  var LY_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3 17 6.6 10 10.2 3 6.6z"/><path d="M3 10.1 10 13.7l7-3.6"/><path d="M3 13.6 10 17.2l7-3.6"/></svg>';
  function lyButton() {
    var seg = el("#tool-seg");
    if (!seg) { return; }
    var b = el("#tool-layers");
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.id = "tool-layers";
      b.className = "btn small ly-btn";
      b.innerHTML = LY_ICON + '<span class="ly-name"></span><span class="ly-badge" hidden></span>';
      b.setAttribute("aria-haspopup", "dialog");
      b.onclick = function (ev) { ev.stopPropagation(); lyPop(b); };
      seg.parentNode.insertBefore(b, seg.nextSibling);
    }
    b.hidden = !lyOn();
    b.querySelector(".ly-name").textContent = TXT.ly_button;
    b.title = TXT.ly_tip;
    var shut = LY_ORDER.filter(function (l) { return lyOff[l]; }).length, badge = b.querySelector(".ly-badge");
    badge.hidden = !shut;
    badge.textContent = shut ? String(LY_ORDER.length - shut) + "/" + LY_ORDER.length : "";
    b.classList.toggle("on", !!shut);
  }
  function lyPop(anchor) {
    var was = el(".ly-pop");
    if (was) { was.remove(); return; }
    var pop = document.createElement("div");
    pop.className = "ly-pop";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", TXT.ly_head);
    function draw() {
      pop.innerHTML = "";
      var head = document.createElement("div");
      head.className = "ly-head";
      head.innerHTML = '<b></b><button type="button" class="btn small"></button>';
      head.firstChild.textContent = TXT.ly_head;
      head.lastChild.textContent = TXT.ly_all;
      head.lastChild.disabled = !lyAnyOff();
      head.lastChild.onclick = function () { lyAll(); };
      pop.appendChild(head);
      LY_ORDER.forEach(function (l) {
        var row = document.createElement("div");
        row.className = "ly-row";
        var sw = document.createElement("label");
        sw.className = "switch wide";
        sw.innerHTML = '<span><em></em> <small></small></span><input type="checkbox">';
        sw.querySelector("em").textContent = TXT["ly_" + l];
        sw.querySelector("small").textContent = String(lyCount(l));
        var box = sw.querySelector("input");
        box.checked = !lyOff[l];
        box.onchange = function () { lySet(l, !box.checked); };
        var only = document.createElement("button");
        only.type = "button";
        only.className = "btn small ly-only";
        only.textContent = TXT.ly_only_short;
        only.title = say("ly_only_tip", { layer: TXT["ly_" + l] });
        only.onclick = function () { lyOnly(l); };
        row.appendChild(sw);
        row.appendChild(only);
        pop.appendChild(row);
      });
      var note = document.createElement("p");
      note.className = "ly-note";
      note.textContent = TXT.ly_note;
      pop.appendChild(note);
    }
    pop.redraw = draw;
    draw();
    document.body.appendChild(pop);
    var r = anchor.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    pop.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + "px";
    pop.style.top = Math.max(8, r.top - h - 8) + "px";
    function away(ev) {
      if (!pop.isConnected) { cleanup(); return; }
      if (ev.type === "keydown" ? ev.key === "Escape" : !pop.contains(ev.target) && ev.target !== anchor && !anchor.contains(ev.target)) { pop.remove(); cleanup(); }
    }
    function cleanup() { document.removeEventListener("pointerdown", away, true); document.removeEventListener("keydown", away, true); }
    setTimeout(function () { document.addEventListener("pointerdown", away, true); document.addEventListener("keydown", away, true); }, 0);
  }

  // ---- in the right-click menu: its layer -------------------------------------------------------------
  if (typeof MENU_ICONS === "object") {
    MENU_ICONS.layers = '<path d="M10 3 17 6.6 10 10.2 3 6.6z"/><path d="M3 10.1 10 13.7l7-3.6"/><path d="M3 13.6 10 17.2l7-3.6"/>';
  }
  var lyMenuIds = null;
  function lyRows(ids) {
    var nodes = ids.map(nodeById).filter(Boolean), layers = {};
    nodes.forEach(function (n) { layers[lyOf(n)] = true; });
    var mine = Object.keys(layers), one = mine.length === 1 ? mine[0] : null, rows = [];
    if (one) {
      rows.push({ head: TXT["ly_" + one] });
      rows.push({ icon: "layers", name: TXT.ly_only, go: function () { lyOnly(one); } });
      rows.push({ icon: "all", name: TXT.ly_pick_all, go: function () {
        if (lyOff[one]) { lySet(one, false); }
        takeUp(hand.nodes.filter(function (n) { return lyOf(n) === one; }).map(function (n) { return n.id; }));
        drawHand(); drawHandPanel();
      } });
      rows.push({ icon: "pin", name: TXT.ly_lock, go: function () { lySet(one, true); } });
      rows.push("-");
    }
    rows.push({ head: TXT.ly_move });
    LY_ORDER.forEach(function (l) {
      var on = one === l;
      rows.push({ mark: on ? tickArt() : '<span class="tick"></span>', name: TXT["ly_" + l], go: function () {
        keepUndo();
        nodes.forEach(function (n) { n.layer = l; lyKept.delete(n); });
        if (typeof handKeep === "function") { handKeep(); }
        lyRefresh();
      } });
    });
    if (nodes.some(function (n) { return n.layer; })) {
      rows.push({ name: TXT.ly_own, go: function () {
        keepUndo();
        nodes.forEach(function (n) { delete n.layer; lyKept.delete(n); });
        if (typeof handKeep === "function") { handKeep(); }
        lyRefresh();
      } });
    }
    return rows;
  }
  if (typeof shapeMenu === "function") {
    var shapeMenuLy = shapeMenu;
    shapeMenu = function (node) {
      lyMenuIds = lyOn() && node ? (typeof inMany === "function" && inMany(node.id) ? many.slice() : [node.id]) : null;
      try { return shapeMenuLy.apply(this, arguments); } finally { lyMenuIds = null; }
    };
  }
  if (typeof groupMenu === "function") {
    var groupMenuLy = groupMenu;
    groupMenu = function () {
      lyMenuIds = lyOn() ? many.slice() : null;
      try { return groupMenuLy.apply(this, arguments); } finally { lyMenuIds = null; }
    };
  }
  if (typeof openMenu === "function") {
    var openMenuLy = openMenu;
    openMenu = function (x, y, rows) {
      if (lyMenuIds && lyMenuIds.length && Array.isArray(rows)) {
        var ids = lyMenuIds, row = { icon: "layers", name: TXT.ly_layer, sub: function () { return lyRows(ids); } };
        lyMenuIds = null;
        rows = rows.slice();
        var at = -1;
        rows.forEach(function (r, i) { if (r && r.icon === "format") { at = i; } });
        if (at < 0) { rows.push("-", row); } else { rows.splice(at, 0, row); }
        var args = Array.prototype.slice.call(arguments);
        args[2] = rows;
        return openMenuLy.apply(this, args);
      }
      return openMenuLy.apply(this, arguments);
    };
  }
  // the button with the rest of the foot bar, in design mode
  if (typeof setMaking === "function") {
    var setMakingLy = setMaking;
    setMaking = function () {
      var out = setMakingLy.apply(this, arguments);
      try { lyButton(); lyMark(); } catch (e) { /* later */ }
      return out;
    };
  }
  try { lyButton(); } catch (e) { /* the foot bar not there yet */ }
