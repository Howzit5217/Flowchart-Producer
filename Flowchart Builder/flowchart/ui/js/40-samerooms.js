// ---------------------------------------------------------------------------
//  40-samerooms.js -- every room of a kind changed at once: all the
//  bedrooms' floors, every bathroom's walls, the ceilings of all the
//  offices -- in the room's own panel beside the plan and in the 3D view's
//  Materials, by a switch over the room's floor
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "can you also update this so you can change
  // something about multiple of the same room rather than one at a time in
  // the 2d mode and in 3d mode")
  //
  // Rooms are of a kind by their names without their numbers -- Bedroom 2,
  // Bedroom 3; Flat 4B, Flat 7A -- or, unnamed, by what is in them
  // (roomKind, 38-advice.js).
  var srOn = false;
  function srBase(r) {
    return String(r.text || "").replace(/\s+/g, " ").trim().toLowerCase().replace(/[\s#-]*\d+[a-z]?$/i, "").replace(/\s+\d+$/, "").trim();
  }
  var srKept = { nodes: null, n: -1, plan: null };
  // (what it is for first -- the main bedroom a bedroom, an en suite a
  // bathroom -- and where that says nothing, its name without its number)
  function srKindOf(r) {
    try {
      if (srKept.nodes !== hand.nodes || srKept.n !== hand.nodes.length) { srKept = { nodes: hand.nodes, n: hand.nodes.length, plan: walkPlan(), by: new Map() }; }
      if (srKept.by.has(r)) { return srKept.by.get(r); }
      var k = roomKind(srKept.plan, r), b = srBase(r), out = k && k !== "room" && k !== "multi" ? "k:" + k : b ? "t:" + b : "id:" + r.id;
      srKept.by.set(r, out);
      return out;
    } catch (e) { var b2 = srBase(r); return b2 ? "t:" + b2 : "id:" + r.id; }
  }
  function srSame(room) {
    if (!room || room.kind !== "i_room") { return [room]; }
    var k = srKindOf(room);
    return hand.nodes.filter(function (r) { return r.kind === "i_room" && (r === room || srKindOf(r) === k); });
  }
  // the rooms a change goes to: this one, or all of its kind while the switch is on
  function srTargets(room) { return srOn ? srSame(room) : [room]; }

  // a room's floor and walls: picked, or painted any color
  if (typeof setMat === "function") {
    var setMatOne = setMat;
    setMat = function (room, part, kind, color) {
      var out = setMatOne.apply(this, arguments);
      if (!srOn || !room || part === "out" || part === "roof") { return out; }
      srTargets(room).forEach(function (r) {
        if (r === room) { return; }
        var m = Object.assign({}, r.mat || {});
        if (kind) { m[part] = kind; if (color) { m[part + "C"] = color; } else { delete m[part + "C"]; } }
        else { delete m[part]; delete m[part + "C"]; }
        if (Object.keys(m).length) { r.mat = m; } else { delete r.mat; }
      });
      if (typeof handKeep === "function") { handKeep(); }
      if (V3) { V3.dirty = true; }
      return out;
    };
  }
  if (typeof matPaint === "function") {
    var matPaintOne = matPaint;
    matPaint = function (room, part, kind, color) {
      if (!srOn || !room || part === "out" || part === "roof") { return matPaintOne.apply(this, arguments); }
      var self = this;
      srTargets(room).forEach(function (r) { matPaintOne.call(self, r, part, kind, color); });
    };
  }
  // its ceiling's height
  if (typeof sizesOf === "function") {
    var sizesOfOne = sizesOf;
    sizesOf = function (n) {
      var out = sizesOfOne.apply(this, arguments);
      if (!n || n.kind !== "i_room") { return out; }
      out.forEach(function (s) {
        if (s.key !== "ceil") { return; }
        var one = s.set;
        s.set = function (m) {
          one(m);
          if (srOn) { srTargets(n).forEach(function (r) { if (r !== n) { r.ceil = Math.round(m * 1000) / 1000; } }); }
        };
      });
      return out;
    };
  }
  // The switch, over the room's floor: in its panel and in 3D's Materials.
  function srSwitch(room, redraw) {
    var same = srSame(room), row = document.createElement("label");
    row.className = "switch wide sr-same";
    row.title = TXT.sr_same_tip;
    row.innerHTML = '<span></span><input type="checkbox">';
    row.firstChild.textContent = say("sr_same", { n: same.length });
    row.lastChild.checked = srOn;
    row.lastChild.onchange = function () {
      srOn = row.lastChild.checked;
      // (which they are, lit for a moment on the plan)
      if (srOn && typeof flashNodes === "function") { flashNodes(same); }
      if (typeof redraw === "function") { redraw(); }
    };
    return row;
  }
  if (typeof matRow === "function") {
    var matRowOne = matRow;
    matRow = function (room, part, redraw, bare) {
      var row = matRowOne.apply(this, arguments);
      try {
        if (part !== "floor" || !room || room.kind !== "i_room" || srSame(room).length < 2) { return row; }
        var wrap = document.createElement("div");
        wrap.className = "sr-wrap";
        wrap.appendChild(srSwitch(room, redraw));
        wrap.appendChild(row);
        return wrap;
      } catch (e) { return row; }
    };
  }
