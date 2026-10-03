// ---------------------------------------------------------------------------
//  40-edit.js -- a house changed once it is built: a room (or several)
//  separated from the rest, or joined to it again; and the whole house
//  made again with other choices, where it stands
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "update the design mode so you can edit things
  // after building so if the house is connected and you want them
  // separated to let you be able to do that")
  //
  // Rooms are joined by arrows, and by the doors between rooms that touch
  // (39-join.js); and pulled away from a room it met at a door, a room is
  // joined to it by an arrow, so that it can never quite come apart.
  // Separate takes a room -- or all those picked -- out of its house: the
  // arrows and the doors between it and the rest gone, a door of its own to
  // the outside, set clear of the house on the paper and in 3D, what is in
  // it going with it.  Join to the house undoes that the other way: an
  // arrow to the nearest room.  And Change this house… opens Start a house
  // with the choices it was made with, and makes it again in its place.
  var EDIT_CLEAR = 2.0;                  // metres kept between a room separated and the house

  function editFloorOf(n) {
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    return floors.length ? floorAt(floors, n.x, n.y) : null;
  }
  // Which floor, as something to compare (floorsOf makes new records each time).
  function editStorey(n) { var f = editFloorOf(n); return f ? f.n.id : 0; }
  // What stands in a room: everything inside it but rooms as big, floors and lots.
  function editContents(room) {
    return hand.nodes.filter(function (n) {
      if (n === room || n.kind === "i_floor" || n.kind === "i_lot") { return false; }
      if (n.kind === "i_room" && n.w * n.h >= room.w * room.h) { return false; }
      return insideArea(room, n.x, n.y);
    });
  }
  // The rooms joined to these by arrows or doors, on their floor.
  function editJoined(set) {
    var ids = {}, out = [];
    set.forEach(function (r) { ids[r.id] = true; });
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room" && !ids[r.id]; });
    rooms.forEach(function (o) {
      if (set.some(function (r) { return tieLinked(r, o) || hand.nodes.some(function (d) { return WALK_DOORS[d.kind] && doorIn(d, r) && doorIn(d, o); }); })) { out.push(o); }
    });
    return out;
  }
  function editRoomsPicked(node) {
    var ids = typeof inMany === "function" && node && inMany(node.id) ? many.slice() : node ? [node.id] : [];
    return ids.map(nodeById).filter(function (n) { return n && n.kind === "i_room" && tieSquare(n); });
  }

  // ---- separated ---------------------------------------------------------------------
  function editSeparate(set) {
    if (!set.length) { return; }
    keepUndo();
    if (typeof tieWas !== "undefined") { tieWas = null; }          // (pulled apart by hand, it would be joined again)
    var P = FLOOR_PX, ids = {}, f0 = editStorey(set[0]);
    set.forEach(function (r) { ids[r.id] = true; });
    var inSet = function (n) { return !!n && (ids[n.id] || set.some(function (r) { return n.kind !== "i_room" && insideArea(r, n.x, n.y); })); };
    var others = hand.nodes.filter(function (r) { return r.kind === "i_room" && !ids[r.id] && editStorey(r) === f0; });
    // the doors between them and the rest, gone; and the arrows
    var drop = {};
    hand.nodes.forEach(function (d) {
      if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor") { return; }
      var mine = set.some(function (r) { return doorIn(d, r); }), theirs = others.some(function (o) { return doorIn(d, o); });
      if (mine && theirs) { drop[d.id] = true; }
    });
    hand.nodes = hand.nodes.filter(function (n) { return !drop[n.id]; });
    var cut = 0;
    hand.links = hand.links.filter(function (l) {
      var a = nodeById(l.from), b = nodeById(l.to);
      if (!a || !b) { return true; }
      var ia = ids[a.id] || (tieOpening(a) && set.some(function (r) { return hand.links.some(function (m) { return m !== l && ((m.from === a.id && m.to === r.id) || (m.to === a.id && m.from === r.id)); }); }));
      var ib = ids[b.id] || (tieOpening(b) && set.some(function (r) { return hand.links.some(function (m) { return m !== l && ((m.from === b.id && m.to === r.id) || (m.to === b.id && m.from === r.id)); }); }));
      if ((ids[a.id] && !ib) || (ids[b.id] && !ia)) { cut++; return false; }
      return true;
    });
    // set clear of the house: away from its middle, the way it already lies
    var moving = set.slice();
    set.forEach(function (r) { editContents(r).forEach(function (n) { if (moving.indexOf(n) < 0) { moving.push(n); } }); });
    var sb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    set.forEach(function (r) { var b = tieBox(r); sb.l = Math.min(sb.l, b.l); sb.r = Math.max(sb.r, b.r); sb.t = Math.min(sb.t, b.t); sb.b = Math.max(sb.b, b.b); });
    var near = others.filter(function (o) { return tieGap(tieBox(o), sb) < 6 * P; });
    var base = near.length ? near : others;
    var dir = [1, 0];
    if (base.length) {
      var mx = 0, my = 0;
      base.forEach(function (o) { mx += o.x / base.length; my += o.y / base.length; });
      var vx = (sb.l + sb.r) / 2 - mx, vy = (sb.t + sb.b) / 2 - my;
      dir = Math.abs(vx) >= Math.abs(vy) ? [vx >= 0 ? 1 : -1, 0] : [0, vy >= 0 ? 1 : -1];
    }
    var step = 0.5 * P, moved = 0;
    function clear() {
      var b = { l: sb.l + dir[0] * moved, r: sb.r + dir[0] * moved, t: sb.t + dir[1] * moved, b: sb.b + dir[1] * moved };
      // apart on the paper, and apart from the house as 3D puts it together
      var J = null;
      try { J = tieLayout(); } catch (e) { J = null; }
      return !others.some(function (o) {
        if (tieGap(tieBox(o), b) < EDIT_CLEAR * P) { return true; }
        var jb = J && J.boxes && J.boxes[o.id];
        return jb && tieGap(jb, b) < EDIT_CLEAR * P;
      });
    }
    for (var k = 0; k < 120 && !clear(); k++) { moved += step; }
    moved = Math.round(moved / HAND_GRID) * HAND_GRID;
    moving.forEach(function (n) { n.x = Math.round(n.x + dir[0] * moved); n.y = Math.round(n.y + dir[1] * moved); });
    // a way in: a door in the wall that faced the house, if it has none to the outside
    set.forEach(function (r) {
      if (hand.nodes.some(function (d) { return WALK_DOORS[d.kind] && doorIn(d, r); })) { return; }
      var b = tieBox(r), side = tieSides(b).filter(function (s) {
        return dir[0] ? (!s.across && (dir[0] > 0 ? s.name === "left" : s.name === "right")) : (s.across && (dir[1] > 0 ? s.name === "top" : s.name === "foot"));
      })[0];
      if (!side || side.hi - side.lo < 1.2 * P) { return; }
      var door = { id: hand.next++, kind: "i_door", text: firstWords("i_door"), x: r.x, y: r.y, w: 140, h: 46 };
      measure(door);
      door.own = true;
      var spot = tieSet(door, side, (side.lo + side.hi) / 2, side.into, 0);
      door.x = spot.x; door.y = spot.y;
      if (spot.turn) { door.turn = spot.turn; }
      hand.nodes.push(door);
    });
    if (typeof tieSeen !== "undefined") { tieSeen = { H: null, key: null, J: null }; }
    drawHand(); drawHandPanel(); showReport();
    if (typeof houseFresh === "function") { houseFresh(); }
    if (typeof handSaysSoft === "function") { handSaysSoft(set.length > 1 ? say("ed_separated_n", { n: set.length }) : TXT.ed_separated); }
  }
  // ---- joined again --------------------------------------------------------------------
  function editJoin(room) {
    var f0 = editStorey(room);
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room" && r !== room && tieSquare(r) && editStorey(r) === f0; });
    var to = tieNearest(tieBox(room), rooms, Infinity)[0];
    if (!to) { return; }
    keepUndo();
    hand.links.push({ from: to.id, to: room.id, label: "" });
    if (typeof tieSeen !== "undefined") { tieSeen = { H: null, key: null, J: null }; }
    drawHand(); drawHandPanel(); showReport();
    if (typeof houseFresh === "function") { houseFresh(); }
    if (typeof handSaysSoft === "function") { handSaysSoft(say("ed_joined", { room: roomLabel(to) || kindName("i_room") })); }
  }

  // ---- made again ----------------------------------------------------------------------
  // The house a thing belongs to: the lot it stands in, with the choices it
  // was made with (n.madeWith, 40-hood.js), and everything of it -- on the lot,
  // and the floors over and under it, and what is on those.
  function editHouseOf(n) {
    if (!n) { return null; }
    var lots = hand.nodes.filter(function (l) { return l.kind === "i_lot" && l.madeWith && (l === n || insideArea(l, n.x, n.y)); });
    var mark = lots[0] || null;
    if (!mark) {
      // a house without a lot: its ground floor's frame, or its rooms (all of them)
      var f = editFloorOf(n), frame = f && f.n;
      if (frame && frame.madeWith) { mark = frame; }
      else if (frame && f.level !== 0) {
        var g = (typeof floorsOf === "function" ? floorsOf() : []).filter(function (o) { return o.bldg === f.bldg && o.level === 0; })[0];
        if (g && g.n.madeWith) { mark = g.n; }
      }
      if (!mark) {
        var stamped = hand.nodes.filter(function (m) { return m.madeWith; });
        if (stamped.length === 1 && !lots.length && !hand.nodes.some(function (l) { return l.kind === "i_lot"; })) { mark = stamped[0]; }
      }
    }
    if (!mark) { return null; }
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var all = [mark], ground = mark.kind === "i_lot" ? null : mark;
    hand.nodes.forEach(function (m) { if (m !== mark && insideArea(mark, m.x, m.y) && (mark.kind !== "i_room")) { all.push(m); } });
    if (mark.kind === "i_room") { all = hand.nodes.filter(function (m) { return m.kind !== "i_lot"; }); }
    if (!ground) { ground = all.filter(function (m) { return m.kind === "i_floor"; })[0] || null; }
    var gf = ground && floors.filter(function (o) { return o.n === ground; })[0];
    if (gf) {
      floors.forEach(function (o) {
        if (o.bldg !== gf.bldg || o.n === ground) { return; }
        all.push(o.n);
        hand.nodes.forEach(function (m) { if (m !== o.n && insideArea(o.n, m.x, m.y) && all.indexOf(m) < 0) { all.push(m); } });
      });
    }
    return { mark: mark, nodes: all, want: mark.madeWith };
  }
  var editNow = null;
  function editChange(house) {
    if (!house || typeof starterAsk !== "function") { return; }
    var was = starterWant;
    starterWant = Object.assign({}, starterWant, house.want);
    try { starterAsk(); } finally { starterWant = was; }
    var card = el(".st-sheet .st-card");
    if (!card) { return; }
    card.querySelector("h2").textContent = TXT.ed_change_title;
    var yes = card.querySelector(".st-yes"), go = yes.onclick;
    yes.textContent = TXT.ed_rebuild;
    // the button's words are put back each time the choices change (39-starter.js): kept
    new MutationObserver(function () { if (yes.textContent !== TXT.ed_rebuild) { yes.textContent = TXT.ed_rebuild; } })
      .observe(yes, { childList: true, characterData: true, subtree: true });
    yes.onclick = function () {
      var keep = starterWant;
      editNow = house;
      try { go.apply(this, arguments); } finally { editNow = null; starterWant = keep; }
      try { localStorage.setItem("flowchart-starter", JSON.stringify(keep)); } catch (e) { /* as it was */ }
    };
  }
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var house = editNow;
      if (!house) { return yield* inner(want); }
      editNow = null;
      keepUndo();
      // where it stood: its lot's left side and front, or its rooms' corner
      var mark = house.mark, gone = {};
      house.nodes.forEach(function (n) { gone[n.id] = true; });
      var oldRooms = house.nodes.filter(function (n) { return n.kind === "i_room" && (!editFloorOf(n) || editFloorOf(n).level === 0); });
      var oldBox = mark.kind === "i_lot" ? tieBox(mark) : editBox(oldRooms);
      hand.nodes = hand.nodes.filter(function (n) { return !gone[n.id]; });
      hand.links = hand.links.filter(function (l) { return !gone[l.from] && !gone[l.to]; });
      var before = hand.next, undoWas = keepUndo, out;
      keepUndo = function () { };
      try { out = yield* inner(Object.assign({}, want, { where: "add-quiet" })); } finally { keepUndo = undoWas; }
      var made = hand.nodes.filter(function (n) { return n.id >= before; });
      var lot = made.filter(function (n) { return n.kind === "i_lot"; })[0];
      var floors = typeof floorsOf === "function" ? floorsOf() : [];
      var groundMade = made.filter(function (n) { var f = floors.length ? floorAt(floors, n.x, n.y) : null; return !f || f.level === 0 || n.kind === "i_lot"; });
      var nb = lot ? tieBox(lot) : editBox(groundMade.filter(function (n) { return n.kind === "i_room"; }));
      if (nb.l !== Infinity && oldBox.l !== Infinity) {
        var dx = oldBox.l - nb.l, dy = (mark.kind === "i_lot" ? oldBox.b - nb.b : oldBox.t - nb.t);
        groundMade.forEach(function (n) { n.x = Math.round(n.x + dx); n.y = Math.round(n.y + dy); });
      }
      try { if (typeof hoodRespace === "function") { hoodRespace(); } } catch (e) { /* where it was made */ }
      if (typeof hoodRedraw === "function") { hoodRedraw(); } else { drawHand(); }
      if (typeof handSaysSoft === "function") { handSaysSoft(TXT.ed_rebuilt); }
      return out;
    });
  }
  function editBox(list) {
    var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    list.forEach(function (n) { var q = tieBox(n); b.l = Math.min(b.l, q.l); b.r = Math.max(b.r, q.r); b.t = Math.min(b.t, q.t); b.b = Math.max(b.b, q.b); });
    return b;
  }

  // ---- in the menus: a room's, several rooms', a lot's --------------------------------------
  if (typeof MENU_ICONS === "object") {
    MENU_ICONS.separate = '<rect x="2.5" y="5" width="6" height="10" rx="1"/><rect x="11.5" y="5" width="6" height="10" rx="1"/><path d="M9.2 10h1.6" stroke-dasharray="1 1"/>';
    MENU_ICONS.joinroom = '<rect x="2.5" y="5" width="7.5" height="10" rx="1"/><rect x="10" y="5" width="7.5" height="10" rx="1"/><path d="M10 8.6v2.8"/>';
    MENU_ICONS.rebuild = '<path d="M3.5 10 10 4.5l6.5 5.5V16h-13z"/><path d="M12.6 12.4a2.8 2.8 0 1 1-.8-2"/><path d="M12.2 8.8l-.4 1.6 1.6.3"/>';
  }
  function editRows(node) {
    if (!node || !designMode() || !tieHome()) { return []; }
    var rows = [], rooms = editRoomsPicked(node);
    if (rooms.length) {
      if (editJoined(rooms).length) {
        rows.push({ icon: "separate", name: rooms.length > 1 ? TXT.ed_separate_n : TXT.ed_separate, go: function () { editSeparate(rooms); } });
      } else if (rooms.length === 1 && hand.nodes.some(function (r) { return r.kind === "i_room" && r !== rooms[0]; })) {
        rows.push({ icon: "joinroom", name: TXT.ed_join, go: function () { editJoin(rooms[0]); } });
      }
    }
    var house = editHouseOf(node);
    if (house) { rows.push({ icon: "rebuild", name: TXT.ed_change, go: function () { editChange(house); } }); }
    return rows;
  }
  // Put in after the rows that do something to the shape -- before the
  // first rule after them, as the menu is opened.
  var editMenuFor = null;
  if (typeof openMenu === "function") {
    var openMenuEdit = openMenu;
    openMenu = function (x, y, items) {
      if (editMenuFor && Array.isArray(items)) {
        var extra = [];
        try { extra = editRows(editMenuFor); } catch (e) { extra = []; }
        editMenuFor = null;
        if (extra.length) {
          var at = items.indexOf("-");
          if (at < 0) { at = items.length; }
          var args = Array.prototype.slice.call(arguments);
          args[2] = items.slice(0, at).concat(["-"], extra, items.slice(at));
          return openMenuEdit.apply(this, args);
        }
      }
      editMenuFor = null;
      return openMenuEdit.apply(this, arguments);
    };
  }
  if (typeof shapeMenu === "function") {
    var shapeMenuEdit = shapeMenu;
    shapeMenu = function (node) {
      editMenuFor = node;
      try { return shapeMenuEdit.apply(this, arguments); } finally { editMenuFor = null; }
    };
  }
  if (typeof groupMenu === "function") {
    var groupMenuEdit = groupMenu;
    groupMenu = function () {
      var first = many.length ? nodeById(many[0]) : null;
      editMenuFor = first && first.kind === "i_room" ? first : null;
      try { return groupMenuEdit.apply(this, arguments); } finally { editMenuFor = null; }
    };
  }
