// ---------------------------------------------------------------------------
//  40-smooth.js -- what a picture of the 3D view asks again and again,
//  worked out once a picture: the drawing's key, the plan walked on, what
//  kind of board it is
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "run buttery smooth for this size of a project")
  //
  // While one picture is made (v3Watch: the doors swung, the walker moved,
  // the picture drawn) nothing in the drawing changes, so what is worked out
  // from all of it -- in a tower of forty floors, seven thousand pieces --
  // need be worked out only the first time it is asked.  Measured walking a
  // 40-floor tower: tieKey, v3Ground's key and boardName's were a third of
  // every picture.
  var smoothDepth = 0, smoothMemo = null;
  if (typeof v3Watch === "function") {
    var v3WatchSmooth = v3Watch;
    v3Watch = function () {
      smoothDepth++;
      try { return v3WatchSmooth.apply(this, arguments); }
      finally { smoothDepth--; if (!smoothDepth) { smoothMemo = null; } }
    };
  }
  function smoothGet(name, H, make) {
    if (!smoothDepth) { return make(); }
    smoothMemo = smoothMemo || {};
    var m = smoothMemo[name] || (smoothMemo[name] = new Map());
    if (m.has(H)) { return m.get(H); }
    var v = make();
    m.set(H, v);
    return v;
  }
  if (typeof tieKey === "function") {
    var tieKeySmooth = tieKey;
    tieKey = function (H) { return smoothGet("tie", H, function () { return tieKeySmooth(H); }); };
  }
  if (typeof boardName === "function") {
    var boardNameSmooth = boardName;
    boardName = function () { var self = this, args = arguments; return smoothGet("board", hand, function () { return boardNameSmooth.apply(self, args); }); };
  }
  // The plan walked on: its key a number made from every piece (not the
  // whole drawing written out as text, every time it was asked), and once
  // a picture.
  function smoothHash(H) {
    var h = 0, list = H.nodes;
    for (var i = 0; i < list.length; i++) {
      var n = list[i], t = n.text ? String(n.text) : "";
      h = (h * 31 + n.id * 7 + n.x * 13 + n.y * 17 + n.w * 3 + n.h * 5 + (n.turn || 0) * 11 + n.kind.length * 19 +
           t.length * 23 + (t.charCodeAt(0) || 0) * 37 + (n.ceil || 0) * 29 + (n.lift || 0) * 41) % 1000000007;
    }
    H.links.forEach(function (l) { h = (h * 31 + (+l.from || 0) * 7 + (+l.to || 0) * 11) % 1000000007; });
    return list.length + "|" + H.links.length + "|" + h;
  }
  if (typeof v3Ground === "function") {
    v3Ground = function () {
      return smoothGet("ground", hand, function () {
        var key = smoothHash(hand);
        if (!V3.ground || V3.groundKey !== key) { V3.ground = walkPlan(); V3.groundKey = key; }
        return V3.ground;
      });
    };
  }
  // The floors and how they stack: once a picture (asked by the house, the
  // roofs, the attic, the tower's skin, the walls seen through ...).
  if (typeof floorsOf === "function") {
    var floorsOfSmooth = floorsOf;
    floorsOf = function () { var self = this, args = arguments; return smoothGet("floors", hand, function () { return floorsOfSmooth.apply(self, args); }); };
  }
