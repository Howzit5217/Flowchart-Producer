// ---------------------------------------------------------------------------
//  40-skyscraper.js -- a skyscraper is the building, nothing of a house in
//  it or on it: no house style's roof over its top floor, no chimney, no
//  porch; its own styles to pick from -- its forms (40-towers.js) -- where
//  a house's are picked, in Start building and in the view's settings
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "you build a sky scraper and a house is built
  // inside of it to the style rather than only letting you pick the house
  // styles for a house and sky scraper styles for a sky scraper" -- "the
  // skyscraper should be the building and not the house in the skyscraper
  // that should not even be there to begin with")
  var sxKept = { nodes: null, n: -1, bldgs: null, only: false };
  // the floors' buildings that are skyscrapers; and whether that is all there is
  function sxTowers() {
    if (sxKept.nodes !== hand.nodes || sxKept.n !== hand.nodes.length) {
      var set = {}, list = typeof towerBuildings === "function" ? towerBuildings() : [];
      list.forEach(function (b) { b.floors.forEach(function (f) { set[f.bldg] = true; }); });
      var marks = hand.nodes.filter(function (n) { return n.madeWith; });
      sxKept = { nodes: hand.nodes, n: hand.nodes.length, bldgs: set, any: list.length > 0,
                 only: list.length > 0 && marks.every(function (m) { return m.madeWith.type === "tower"; }) };
    }
    return sxKept;
  }
  function sxInTower(floors, r) {
    var K = sxTowers();
    if (!K.any || !r) { return false; }
    var f = floors && floors.length ? floorAt(floors, r.x, r.y) : null;
    return !!(f && K.bldgs[f.bldg]);
  }
  // no house roof over a skyscraper's rooms: the tower has its own top
  if (typeof roofPlan === "function") {
    var roofPlanTower = roofPlan;
    roofPlan = function (floors) {
      var out = roofPlanTower.apply(this, arguments);
      if (!sxTowers().any) { return out; }
      return out.filter(function (R) { return !sxInTower(floors, R.room); });
    };
  }
  // and no house style on a drawing that is skyscrapers only (a style kept
  // from a house built before: its materials, its chimneys, its porch)
  if (typeof styleNow === "function") {
    var styleNowTower = styleNow;
    styleNow = function () { return sxTowers().only ? null : styleNowTower.apply(this, arguments); };
  }
  if (typeof styleRoofShape === "function") {
    var styleRoofShapeTower = styleRoofShape;
    styleRoofShape = function () { return sxTowers().only ? "flat" : styleRoofShapeTower.apply(this, arguments); };
  }
  // Start building: a skyscraper is not given a house's style; its own --
  // its form -- is asked by its type (40-towers.js)
  if (typeof typeStyleRow === "function") {
    var typeStyleRowTower = typeStyleRow;
    typeStyleRow = function (pick, want) {
      if (want && want.type === "tower") { delete want.style; return; }
      return typeStyleRowTower.apply(this, arguments);
    };
  }
  if (typeof starterMake === "function") {
    var starterMakeTower = starterMake;
    starterMake = function (want) {
      if (want && want.type === "tower") { want = Object.assign({}, want); delete want.style; }
      var out = starterMakeTower.call(this, want);
      // (a style left on the house from before: not this building's)
      try {
        if (want && want.type === "tower" && sxTowers().only && hand.house && hand.house.style) {
          var h = Object.assign({}, hand.house);
          delete h.style; delete h.roofShape;
          hand.house = h;
          hand.nodes.forEach(function (r) {
            if (r.kind !== "i_room" || !r.mat) { return; }
            var m = Object.assign({}, r.mat);
            delete m.out; delete m.outC; delete m.roof; delete m.roofC;
            if (Object.keys(m).length) { r.mat = m; } else { delete r.mat; }
          });
        }
      } catch (e) { /* as made */ }
      return out;
    };
  }
  // The view's settings: for a skyscraper, its forms where a house's styles are.
  if (typeof styleSection === "function") {
    var styleSectionTower = styleSection;
    styleSection = function (sheet, head, draw) {
      if (!sxTowers().only || typeof TOWER_ORDER === "undefined") { return styleSectionTower.apply(this, arguments); }
      var marks = hand.nodes.filter(function (n) { return n.madeWith && n.madeWith.type === "tower"; });
      var now = marks.length && marks[marks.length - 1].madeWith.towerForm || "spire";
      head(TXT.sk_form_head);
      worldPicker(sheet, TOWER_ORDER, now, "sk_", function (k) {
        keepUndo();
        marks.forEach(function (m) { m.madeWith = Object.assign({}, m.madeWith, { towerForm: k }); });
        if (typeof handKeep === "function") { handKeep(); }
        if (typeof houseFresh === "function") { houseFresh(); }
        if (V3) { V3.kept = null; V3.dirty = true; }
        draw();
      });
    };
  }
  // Inside its skin every wall is a wall indoors: painted, not the stone or
  // the siding a house's outside walls are (seen through the lobby's glass,
  // 2026-10-03)
  var sxRoomKept = { nodes: null, n: -1, map: null, floors: null };
  function sxRoomInTower(room) {
    if (!room || room.kind !== "i_room" || !sxTowers().any) { return false; }
    if (sxRoomKept.nodes !== hand.nodes || sxRoomKept.n !== hand.nodes.length) {
      sxRoomKept = { nodes: hand.nodes, n: hand.nodes.length, map: new Map(), floors: floorsOf() };
    }
    var m = sxRoomKept.map;
    if (!m.has(room)) { m.set(room, sxInTower(sxRoomKept.floors, room)); }
    return m.get(room);
  }
  if (typeof gl3Outside === "function") {
    var gl3OutsideTower = gl3Outside;
    gl3Outside = function (f) {
      if (f && f.node && sxRoomInTower(f.node)) { return false; }
      return gl3OutsideTower.apply(this, arguments);
    };
  }
