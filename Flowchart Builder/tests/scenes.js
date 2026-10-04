// ---------------------------------------------------------------------------
//  scenes.js -- the icons, and drawings run as what they are
//
//  Run by tests/run.py where node is installed.  The parts are lifted
//  straight out of flowchart/ui/js -- the icons (03-icon-art.js,
//  03-icons.js), the walk through a home (38-walk.js), the suggestions
//  (38-advice.js), work, networks and travel (39-flows.js) and circuits
//  (39-circuit.js) -- and run with a few stand-ins for the page, so what
//  is checked is the code that actually runs.
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");
var JS = path.join(__dirname, "..", "flowchart", "ui", "js");
function part(name) { return fs.readFileSync(path.join(JS, name), "utf8"); }

var stand = [
  "var hand = { nodes: [], links: [], next: 1, nextLink: 0 };",
  "var TXT = new Proxy({}, { get: function (t, k) { return typeof k === 'string' ? k : undefined; } });",
  "var LANG = 'en', byHand = true, picked = null, chosen = null, many = [], style = {}, HAND_GRID = 5;",
  "var scene = 'home'; function boardNow() { return { name: scene }; }",
  "var BOARD_NEUTRAL = { text: true, note: true, callout: true, i_zone: true };",
  "function say(k, f) { return k + (f ? JSON.stringify(f) : ''); }",
  "function escaped(s) { return String(s); }",
  "function nameRoom(words, line) { return words && words.length ? words.length * line + 16 : 0; }",
  "function kindColors() { return {}; }",
  "function kindName(k) { return k; }",
  "function simName(n) { return String((n && n.text) || (n && n.kind) || '?'); }",
  "function nodeById(id) { return hand.nodes.filter(function (n) { return n.id === id; })[0] || null; }",
  "function turned(n) { var q = Math.round((((n.turn || 0) % 360) + 360) % 360 / 90) % 4, over = q === 1 || q === 3;",
  "  return { kind: n.kind, x: n.x, y: n.y, w: over ? n.h : n.w, h: over ? n.w : n.h }; }",
  "function handType() { return { size: 12.5, line: 15, font: '12.5px sans' }; }",
  "function shownLines(n) { return String(n.text || '').split('\\n'); }",
  "function measure(n) { if (ICONS[n.kind]) { iconMeasure(n); } }",
  "measure.pen = { font: '', measureText: function (s) { return { width: String(s).length * 7 }; } };",
  "function firstWords(k) { return iconFirstWords(k); }",
  "function moveClear() {}",
  "var window = { addEventListener: function () {} }, walkAt = null, simNow = null;",
  "function el() { return null; }",
  "function dressBoard() {}",
  "function drawAdders() {} function drawHandPanel() {} function drawHand() {} function setMode() {}",
  "function handRecall() { return false; } function boardName() { return 'home'; }",
  "var document = { addEventListener: function () {}, body: { classList: { toggle: function () {} } } };",
  "var SCENES = {};",
  "function keepUndo() {} function showReport() {} function handSays() {} var chart = null;"
].join("\n");

var tests = function () {
  var bad = [], said = [];
  function check(ok, what) { if (!ok) { bad.push(what); } }

  // ---- every icon is offered, and draws
  var offered = {};
  ICON_SETS.forEach(function (set) { set[1].forEach(function (k) { offered[k] = true; }); });
  Object.keys(ICONS).forEach(function (k) { check(offered[k], k + " is in no set"); });
  Object.keys(offered).forEach(function (k) { check(!!ICONS[k], k + " is offered but not drawn"); });
  var drawn = 0;
  Object.keys(ICONS).forEach(function (k) {
    [[60, 60], [200, 120], [21, 14]].forEach(function (s) {
      var art = iconArt(k, 100, 100, s[0], s[1], "#ffffff", ["Name"], 15);
      check(art.indexOf("NaN") < 0 && art.indexOf("undefined") < 0 && /<path /.test(art), k + " draws badly at " + s);
      drawn++;
    });
  });
  said.push(Object.keys(ICONS).length + " icons drawn " + drawn + " ways");

  // ---- doors, windows and pictures go into the wall they are put by
  var room = { id: 1, kind: "i_room", x: 200, y: 200, w: 260, h: 200 };
  function put(n) { hand.nodes = [room, n]; measure(n); snapToWalls([n.id]); return n; }
  var d = put({ id: 2, kind: "i_door", x: 210, y: 140, text: "" });
  check(d.x === 210 && d.y === 125 && d.turn === 180, "a door inside the top wall: " + [d.x, d.y, d.turn]);
  d = put({ id: 2, kind: "i_door", x: 210, y: 80, text: "" });
  check(d.y === 75 && d.turn === 0, "a door outside the top wall: " + [d.x, d.y, d.turn]);
  var win = put({ id: 3, kind: "i_window", x: 78, y: 220, text: "" });
  check(win.x === 73 && win.turn === 90, "a window in the left wall: " + [win.x, win.y, win.turn]);
  var pic = put({ id: 4, kind: "i_picture", x: 90, y: 220, text: "" });
  check(pic.x === 79 && pic.turn === 270, "a picture on the left wall: " + [pic.x, pic.y, pic.turn]);
  var far = put({ id: 5, kind: "i_door", x: 200, y: 200, text: "" });
  check(far.x === 200 && far.y === 200 && !far.turn, "a door nowhere near a wall moved");

  // ---- a walk finds its way through doors, and not through walls
  function house(middle) {
    var nodes = [{ id: 1, kind: "i_room", x: 200, y: 200, w: 260, h: 200, text: "" },
                 { id: 2, kind: "i_room", x: 460, y: 200, w: 260, h: 200, text: "" },
                 { id: 3, kind: "i_door", x: 200, y: 125, turn: 180, text: "" }];
    if (middle !== null) { nodes.push({ id: 4, kind: "i_door", x: 355, y: 200, turn: 90, text: middle }); }
    nodes.push({ id: 5, kind: "i_bed", x: 520, y: 220, text: "" });
    hand.nodes = nodes;
    nodes.forEach(function (n) { if (!n.w) { measure(n); } });
    var plan = walkPlan();
    var way = walkWay(plan, cellOf(plan, 200, 40), besideOf(plan, nodeById(5)));
    return { plan: plan, way: way };
  }
  var open = house("");
  check(!!open.way, "no way through an open doorway");
  check(open.plan.joins.filter(function (j) { return j.rooms.length === 2; }).length === 1, "the middle door joins two rooms");
  check(!house(null).way, "a way through a wall with no door");
  check(!house("locked").way, "a way through a locked door");
  // a door in a wall close by a corner opens that wall, not the one round the corner
  hand.nodes = [{ id: 1, kind: "i_room", x: 200, y: 200, w: 260, h: 200, text: "" },
                { id: 2, kind: "i_room", x: 460, y: 200, w: 260, h: 200, text: "" },
                { id: 3, kind: "i_door", x: 330, y: 135, text: "" },
                { id: 5, kind: "i_bed", x: 520, y: 220, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  snapToWalls([3]);
  var corner = walkPlan();
  check(!walkWay(corner, cellOf(corner, 200, 40), besideOf(corner, nodeById(5))), "out round the corner by a door");
  said.push("walks through doors, not walls or locked doors");

  // ---- suggestions, and their fixes
  hand.nodes = [{ id: 1, kind: "i_room", x: 200, y: 200, w: 260, h: 200, text: "Bedroom" },
                { id: 2, kind: "i_bed", x: 200, y: 220, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  hand.next = 10;
  var tips = homeAdvice().map(function (t) { return t; });
  var front = tips.filter(function (t) { return t.text.indexOf("ad_no_front") === 0; })[0];
  var dark = tips.filter(function (t) { return t.text.indexOf("ad_window_bed") === 0; })[0];
  check(!!front && front.fix && front.fix.auto, "no front door: nothing said, or no fix");
  check(!!dark && dark.fix && dark.fix.auto, "a bedroom with no window: nothing said, or no fix");
  if (front) { front.fix.go(); }
  if (dark) { dark.fix.go(); }
  var after = homeAdvice().map(function (t) { return t.text.split("{")[0]; });
  check(after.indexOf("ad_no_front") < 0 && after.indexOf("ad_window_bed") < 0, "fixed, and still said: " + after);
  check(hand.nodes.some(function (n) { return n.kind === "i_window"; }) &&
        hand.nodes.some(function (n) { return n.kind === "i_door"; }), "the fixes added nothing");
  said.push("suggestions said and put right");

  // ---- a house of two floors, the stairs between them
  check(levelKey({ text: "Upper floor 2" }, 0) === 20 && levelKey({ text: "Basement" }, 0) === -10 &&
        levelKey({ text: "Ground floor" }, 3) === 0 && levelKey({ text: "Basement 2" }, 0) === -20, "floors read out of order");
  hand.links = [];
  hand.nodes = [{ id: 1, kind: "i_floor", x: 300, y: 300, w: 400, h: 340, text: "Upstairs" },
                { id: 2, kind: "i_floor", x: -200, y: 300, w: 400, h: 340, text: "Ground floor" },
                { id: 3, kind: "i_room", x: -200, y: 310, w: 300, h: 240, text: "" },
                { id: 4, kind: "i_door", x: -200, y: 425, turn: 0, text: "" },
                { id: 5, kind: "i_stairs", x: -300, y: 310, text: "" },
                { id: 6, kind: "i_room", x: 300, y: 310, w: 300, h: 240, text: "" },
                { id: 7, kind: "i_stairs", x: 200, y: 310, text: "" },
                { id: 8, kind: "i_bed", x: 380, y: 300, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  snapToWalls([4]);
  var floors = floorsOf(), links = floorLinks(floors);
  check(floors.length === 2 && floors[0].n.id === 2 && floors[1].level === 1 && floors[1].z > 0, "the floors stacked wrong");
  check(links.length === 1 && links[0][0].id === 5 && links[0][1].id === 7, "the stairs lead nowhere: " + links.length);
  check(floors[1].dx === -500 && floors[1].dy === 0, "the floor above is not over the one below");
  var upTips = homeAdvice().map(function (t) { return t.text.split("{")[0]; });
  check(upTips.indexOf("ad_boxed_in") < 0 && upTips.indexOf("ad_stairs_nowhere") < 0, "upstairs out of reach: " + upTips);
  check(!walkCheck().some(function (f) { return /^wk_no_door/.test(f.text); }), "a room up the stairs has no way in");
  // stairs in a house of one floor: put right by drawing the floor above
  hand.nodes = [{ id: 1, kind: "i_room", x: 0, y: 0, w: 300, h: 240, text: "" },
                { id: 2, kind: "i_stairs", x: -100, y: 0, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  hand.next = 10;
  var nowhere = homeAdvice().filter(function (t) { return t.text.indexOf("ad_stairs_nowhere") === 0; })[0];
  check(!!nowhere && nowhere.fix && nowhere.fix.auto, "stairs to nowhere: nothing said, or no fix");
  if (nowhere) { nowhere.fix.go(); }
  check(floorsOf().length === 2 && floorLinks(floorsOf()).length === 1, "the floor above was not drawn, or not reached");
  said.push("upstairs and down");

  // ---- roofs: over what nothing stands on, one over rooms making a rectangle
  function wallsUp(r) { return ceilOf(r) * FLOOR_PX; }
  var two = floorsOf(), roofs = roofPlan(two, null, wallsUp);
  check(roofs.length === 1 && roofs[0].level === 1 && Math.abs(roofs[0].z - (two[1].z + 2.6 * FLOOR_PX)) < 1,
        "the roof of a house of two floors: " + JSON.stringify(roofs.map(function (r) { return [r.level, r.z]; })));
  hand.nodes = [{ id: 1, kind: "i_room", x: 0, y: 0, w: 200, h: 200, text: "" },
                { id: 2, kind: "i_room", x: 200, y: 0, w: 200, h: 200, text: "" },
                { id: 3, kind: "i_room", x: 0, y: 200, w: 200, h: 200, text: "", ceil: 3.2 }];
  roofs = roofPlan([], null, wallsUp);
  check(roofs.length === 2 && roofs.some(function (r) { return r.x1 - r.x0 === 400 && r.y1 - r.y0 === 200; }),
        "rooms side by side not roofed as one: " + JSON.stringify(roofs.map(function (r) { return [r.x0, r.x1, r.y0, r.y1]; })));
  var long = roofs.filter(function (r) { return r.x1 - r.x0 === 400; })[0], faces = [];
  check(long && long.eave.n > 0 && long.eave.s === 0, "eaves out over open sides only: " + JSON.stringify(long && long.eave));
  roofFaces(faces, long, 0, {});
  check(faces.length === 7 && faces.every(function (f) { return f.n[2] > 0 && f.pts.every(function (q) { return isFinite(q[2]); }); }),
        "a hip roof of four slopes and its eaves, all facing up: " + faces.length);
  var ridge = Math.max.apply(null, [].concat.apply([], faces.map(function (f) { return f.pts.map(function (q) { return q[2]; }); })));
  check(Math.abs(ridge - (2.6 * FLOOR_PX + 100 * ROOF_PITCH)) < 0.5, "the ridge at the wrong height: " + ridge);
  check(roomLabel({ id: 9, kind: "i_room", x: 0, y: 0, w: 200, h: 200, text: "" }) === null, "an empty room named");
  hand.nodes.push({ id: 4, kind: "i_stove", x: 0, y: 0, w: 30, h: 30, text: "" });
  check(roomLabel(hand.nodes[0]) === "rl_kitchen", "a room with a stove not called a kitchen");
  said.push("roofed, and labeled");

  // ---- a lot: what can be built on it, the house over its line, a drive
  hand.nodes = [{ id: 1, kind: "i_lot", x: 0, y: 0, w: 750, h: 1000, text: "" },
                { id: 2, kind: "i_room", x: 0, y: 200, w: 300, h: 250, text: "" },
                { id: 3, kind: "i_room", x: 250, y: 200, w: 200, h: 250, text: "Garage" },
                { id: 4, kind: "i_door", x: 0, y: 75, turn: 180, text: "" },
                { id: 5, kind: "i_garagedoor", x: 250, y: 325, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  snapToWalls([4, 5]);
  hand.next = 10;
  var lm = lotMeasure(nodeById(1));
  check(Math.abs(lm.build - 12 * 9.5 * FLOOR_PX * FLOOR_PX) < 1, "room to build: " + lm.build / FLOOR_PX / FLOOR_PX);
  check(lm.house === 300 * 250 + 200 * 250 && lm.yard === 750 * 1000 - lm.house, "house and yard: " + [lm.house, lm.yard]);
  check(lm.over.length && lm.over.every(function (o) { return o.side === "front" || o.side === "side"; }), "the house over its line, not said");
  var lotTips = homeAdvice();
  function lotTip(key) { return lotTips.filter(function (t) { return t.text.indexOf(key) === 0; })[0]; }
  var drive = lotTip("ad_no_driveway"), setback = lotTip("ad_setback"), group = lotTip("ad_group_house");
  check(!!drive && drive.fix && drive.fix.auto, "a garage door with no drive: nothing said, or no fix");
  check(!!setback && setback.fix && setback.fix.auto, "over the setback: nothing said, or no fix");
  check(!!group && group.fix && group.fix.auto, "a house of loose rooms on a lot: nothing said");
  if (setback) { setback.fix.go(); }
  check(!lotMeasure(nodeById(1)).over.length, "moved, and still over the line");
  var garage = nodeById(5);
  if (drive) { drivewayFor(walkPlan(), garage)(); }
  var way = hand.nodes.filter(function (n) { return n.kind === "i_driveway"; })[0];
  check(way && Math.abs(way.y + way.h / 2 - 500) < 2 && boxesTouch(garage, way, 30), "the drive does not run from the door to the street");
  if (group) { group.fix.go(); }
  var grouped = homeAdvice().map(function (t) { return t.text.split("{")[0]; });
  check(grouped.indexOf("ad_group_house") < 0 && grouped.indexOf("ad_no_driveway") < 0 && grouped.indexOf("ad_setback") < 0,
        "put right, and still said: " + grouped);
  said.push("a lot measured, a house kept to it, a drive laid");

  // ---- nothing standing in anything else, or in a wall
  hand.links = [];
  hand.nodes = [{ id: 1, kind: "i_room", x: 0, y: 0, w: 400, h: 300, text: "" },
                { id: 2, kind: "i_door", x: 0, y: -125, turn: 180, text: "" },
                { id: 3, kind: "i_sofa", x: -60, y: 40, text: "" },
                { id: 4, kind: "i_coffee", x: -40, y: 50, text: "" },
                { id: 5, kind: "i_bookcase", x: 190, y: 0, turn: 90, text: "" },
                { id: 6, kind: "i_lamp", x: 120, y: -100, text: "" },
                { id: 7, kind: "i_rug", x: -50, y: 45, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  hand.next = 20;
  check(isSolid("i_sofa") && !isSolid("i_rug") && !isSolid("i_tablelamp") && !isSolid("i_door") && !isSolid("i_room"),
        "what takes up the floor, wrong");
  check(boxesMeet(nodeById(3), -60, 40, nodeById(4), -40, 50, 0) && !boxesMeet(nodeById(3), -60, 40, nodeById(7), -50, 45, 0),
        "a sofa and a table in one place not kept apart, or a rug kept from them");
  var overTips = homeAdvice();
  function overTip(key) { return overTips.filter(function (t) { return t.text.indexOf(key) === 0; }); }
  var overlap = overTip("ad_overlap"), inWall = overTip("ad_in_wall");
  check(overlap.length === 1 && overlap[0].fix && overlap[0].fix.auto, "a sofa through a table: " + overlap.length);
  check(inWall.length === 1 && inWall[0].id === 5 && inWall[0].fix && inWall[0].fix.auto, "a bookcase in the wall: " + inWall.length);
  overlap.concat(inWall).forEach(function (t) { t.fix.go(); });
  var after = homeAdvice().map(function (t) { return t.text.split("{")[0]; });
  check(after.indexOf("ad_overlap") < 0 && after.indexOf("ad_in_wall") < 0, "put right, and still said: " + after);
  check(!boxesMeet(nodeById(3), nodeById(3).x, nodeById(3).y, nodeById(4), nodeById(4).x, nodeById(4).y, 0),
        "still one in the other");
  said.push("nothing in anything else");

  // ---- sizes typed, and nothing bigger than what holds it (39-design.js)
  function near(a, b) { return Math.abs(a - b) < 1e-6; }
  check(near(lenRead("1.2 m"), 1.2) && near(lenRead("120 cm"), 1.2) && near(lenRead("2,5"), 2.5) &&
        near(lenRead("3'4\""), 40 * 0.0254) && near(lenRead("3 ft 4 in"), 40 * 0.0254) &&
        near(lenRead("40\""), 40 * 0.0254) && near(lenRead("6 ft"), 6 * 0.3048) && isNaN(lenRead("big")),
        "lengths read wrong");
  check(makingOf({ nodes: [{ kind: "i_sofa" }] }) === "design" && makingOf({ nodes: [{ kind: "oval" }] }) === "flowchart" &&
        makingOf({ making: "flowchart", nodes: [{ kind: "i_sofa" }] }) === "flowchart" && makingOf({ nodes: [] }) === "",
        "what a paper is for, told wrong");
  hand.links = [];
  hand.nodes = [{ id: 1, kind: "i_room", x: 0, y: 0, w: 300, h: 200, text: "" },
                { id: 2, kind: "i_sofa", x: 0, y: 40, text: "" },
                { id: 3, kind: "i_tablelamp", x: 0, y: 40, text: "" },
                { id: 4, kind: "i_wardrobe", x: -100, y: -60, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  var wall = roomWallOf(nodeById(1)), sofa = nodeById(2), lims = limitsOf(sofa);
  check(near(lims.w[1] * FLOOR_PX, 300 - 2 * wall) && near(lims.h[1] * FLOOR_PX, 200 - 2 * wall), "a sofa may outgrow its room");
  check(near(lims.tall[1], ceilOf(nodeById(1))), "a sofa may go through the ceiling");
  check(near(limitsOf(nodeById(3)).w[1] * FLOOR_PX, sofa.w), "a lamp may outgrow what it stands on");
  var roomLims = limitsOf(nodeById(1));
  check(roomLims.w[0] * FLOOR_PX >= sofa.w + 2 * wall - 0.01 && near(roomLims.ceil[0], pieceHigh(nodeById(4)) + 0.02),
        "a room may be made too small, or too low, for what is in it");
  sofa.tall = 1.1;
  check(near(pieceHigh(sofa), 1.1) && near(wallHang({ kind: "i_picture", lift: 1.5, tall: 0.4 })[1], 1.9), "heights typed not kept");
  sofa.x = 140;
  check(keepIn(sofa) && sofa.x + sofa.w / 2 <= 150 - wall + 0.5, "not brought back inside its walls");
  sofa.x = 0; sofa.w = 1000;
  sizeLimited(sofa, { ax: 1, ay: 1, fx: -140, fy: 20 });
  check(sofa.w <= 150 - wall + 140 + 0.01, "grown from a corner through the wall: " + sofa.w);
  // a door in the right wall, by the corner: no doorway round the corner
  var byCorner = { id: 5, kind: "i_door", x: 125, y: -75, w: 50, h: 50, turn: 270 };
  var own = v3Hole(nodeById(1), "right", wall, byCorner);
  check(!v3Hole(nodeById(1), "top", wall, byCorner) && own && own.a < 5 && own.b > 45,
        "a door by a corner cut the wall round it: " + JSON.stringify(own));
  said.push("sizes typed and kept to what holds them");

  // ---- a piece added goes where it would go in a home (39-design.js)
  hand.links = [];
  hand.nodes = [{ id: 1, kind: "i_room", x: 0, y: 0, w: 300, h: 220, text: "Bedroom" },
                { id: 2, kind: "i_room", x: 300, y: 0, w: 300, h: 220, text: "Bath" },
                { id: 3, kind: "i_bed", x: 0, y: -49, text: "" },
                { id: 4, kind: "i_door", x: -60, y: 85, w: 50, h: 50, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  function added(kind) {
    var n = { id: hand.nodes.length + 10, kind: kind, text: "", x: 2000, y: 2000 };
    measure(n);
    hand.nodes.push(n);
    placeWell(n, null);
    return n;
  }
  var stand2 = added("i_nightstand"), loo = added("i_toilet"), robe = added("i_wardrobe");
  var bedNow = nodeById(3);
  check(Math.abs(stand2.y - (bedNow.y - bedNow.h / 2 + stand2.h / 2)) < 1 &&
        Math.abs(Math.abs(stand2.x - bedNow.x) - (bedNow.w + stand2.w) / 2) < 4, "a nightstand not by the bed's head: " + [stand2.x, stand2.y]);
  check(insideArea(nodeById(2), loo.x, loo.y) && !insideArea(nodeById(1), loo.x, loo.y), "a toilet not put in the bathroom");
  check(insideArea(nodeById(1), robe.x, robe.y), "a wardrobe not put in the bedroom");
  hand.nodes.forEach(function (a) {
    hand.nodes.forEach(function (b) {
      if (a.id < b.id && isSolid(a.kind) && isSolid(b.kind) && boxesOverlap(a, b)) { check(false, a.kind + " put on " + b.kind); }
    });
  });
  said.push("pieces added where they go");

  // ---- every piece of a home made in 3D (38-models.js): made without a
  // fault, of real numbers, and about where the piece stands
  var unmade = [], badly = [];
  Object.keys(ICONS).forEach(function (kind) {
    if (V3_HIGH[kind] === undefined && !V3_ON[kind] && !V3_DROP[kind] && !V3_WALL[kind]) { return; }
    if (!MODELS[kind]) { unmade.push(kind); return; }
    var n = { id: 1, kind: kind, text: "", x: 0, y: 0 };
    measure(n);
    var H = pieceHigh(n) * FLOOR_PX, M = modelMaker(0, 0, 0, 0), out;
    try { MODELS[kind](M, n.w, n.h, Math.max(1, H), {}, n, { cord: 20 }); out = M.done(); }
    catch (e) { badly.push(kind + " (" + e.message + ")"); return; }
    var reach = 0.9 * FLOOR_PX, bad = !out.length;
    out.forEach(function (f) {
      for (var i = 0; i < f.mesh.p.length; i += 3) {
        var x = f.mesh.p[i], y = f.mesh.p[i + 1], z = f.mesh.p[i + 2];
        if (!isFinite(x) || !isFinite(y) || !isFinite(z) || Math.abs(x) > n.w / 2 + reach || Math.abs(y) > n.h / 2 + reach ||
            z < -(V3_WALL[kind] || V3_DROP[kind] ? 0.8 : 0.15) * FLOOR_PX || z > H + 2.6 * FLOOR_PX + 20) { bad = true; }
      }
    });
    if (bad) { badly.push(kind); }
  });
  check(!unmade.length, "pieces with no 3D model: " + unmade.join(", "));
  // and every piece that stands counted as furniture: walked to, checked
  var uncounted = Object.keys(V3_HIGH).filter(function (k) {
    return ICONS[k] && WALK_DO[k] === undefined && !LIES_FLAT[k] && k !== "i_pool" && k !== "i_driveway" && k !== "i_path";
  });
  check(!uncounted.length, "pieces not counted as furniture: " + uncounted.join(", "));
  hand.nodes = [{ id: 1, kind: "i_room", x: 0, y: 0, w: 300, h: 300, text: "" }, { id: 2, kind: "i_workbench", x: 0, y: -100, text: "" },
                { id: 3, kind: "i_treadmill", x: 80, y: 60, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  var shop = walkPlan();
  check(shop.pieces.length === 2 && roomKind(shop, nodeById(1)) === "garage", "a workbench's room not a garage, or not counted: " +
        shop.pieces.length + " " + roomKind(shop, nodeById(1)));
  check(!badly.length, "3D models made wrong: " + badly.join(", "));
  said.push(Object.keys(MODELS).length + " pieces made in 3D");

  // ---- opened, each the way it is made (40-open3d.js): what opens the same
  // shut, half open and open, every hole cut in what is behind it, no faults
  var openBad = [], opened = 0;
  Object.keys(MODELS).forEach(function (kind) {
    if (!ICONS[kind]) { return; }
    var n = { id: 1, kind: kind, text: "", x: 0, y: 0 };
    measure(n);
    var H = pieceHigh(n) * FLOOR_PX;
    function make(k) {
      o3Making = n;
      var M = modelMaker(0, 0, 0, 0);
      o3Making = null;
      if (k !== null) { M.state = { k: function () { return k; }, on: true, key: "t", passing: k < 1 }; }
      MODELS[kind](M, n.w, n.h, Math.max(1, H), {}, n, { cord: 20, state: M.state });
      var cut = M.holes.every(function (h) { return !!o3HostOf(M, h); }), out = M.done(), fine = !!out.length;
      out.forEach(function (f) { for (var i = 0; i < f.mesh.p.length; i++) { if (!isFinite(f.mesh.p[i])) { fine = false; } } });
      return { fronts: (out.fronts || []).length, cut: cut, fine: fine };
    }
    try {
      var shut = make(null), half = make(0.5), open = make(1);
      if (!shut.fronts) { return; }
      opened++;
      if (half.fronts !== shut.fronts || open.fronts !== shut.fronts || !half.cut || !open.cut || !half.fine || !open.fine) { openBad.push(kind); }
    } catch (e) { openBad.push(kind + " (" + e.message + ")"); }
  });
  check(opened > 30 && !openBad.length, "pieces opened wrong: " + openBad.join(", ") + " (" + opened + " open)");
  said.push(opened + " pieces opened as made");

  // ---- rooms drawn apart, joined by arrows: put together in 3D
  hand.nodes = [{ id: 1, kind: "i_room", x: 0, y: 0, w: 300, h: 200, text: "" },
                { id: 2, kind: "i_room", x: 520, y: 30, w: 200, h: 200, text: "" },
                { id: 3, kind: "i_room", x: 20, y: 420, w: 240, h: 160, text: "" },
                { id: 4, kind: "i_door", x: 10, y: 260, w: 50, h: 50, text: "" },
                { id: 5, kind: "i_stove", x: 560, y: 60, text: "" },
                { id: 6, kind: "i_bed", x: 20, y: 440, text: "" }];
  hand.nodes.forEach(function (n) { if (!n.w) { measure(n); } });
  hand.links = [{ id: 1, from: 1, to: 2, label: "" }, { id: 2, from: 1, to: 4, label: "" }, { id: 3, from: 4, to: 3, label: "" }];
  hand.next = 7;
  var J = tieLayout(), bx = J.boxes;
  check(J.any && Math.abs(bx[2].l - bx[1].r) < 0.5 && Math.min(bx[2].b, bx[1].b) - Math.max(bx[2].t, bx[1].t) >= 59,
        "the kitchen did not come up against the living room: " + JSON.stringify([bx[1], bx[2]]));
  check(Math.abs(bx[3].t - bx[1].b) < 0.5 && Math.min(bx[3].r, bx[1].r) - Math.max(bx[3].l, bx[1].l) >= 59,
        "the bedroom did not come up under it: " + JSON.stringify(bx[3]));
  check(J.moves[5] && near(J.moves[5].x, 560 + J.delta[2][0]) && near(J.moves[5].y, 60 + J.delta[2][1]), "the stove was left behind");
  var between = J.moves[4], under = tieWall(bx[1], bx[3]);
  check(between && under && between.turn === 180 &&
        tieInWall({ kind: "i_door", x: between.x, y: between.y, w: 50, h: 50, turn: 180 }, 0, 0, under),
        "the door drawn between them is not in the wall between: " + JSON.stringify(between));
  check(J.made.length === 1 && J.made[0].node.turn === 90 && near(J.made[0].node.x, bx[1].r + 25),
        "no door where the arrow had none: " + JSON.stringify(J.made));
  var real = hand, whole = tieHand(1);
  check(whole && whole.links.length === 0 && whole.nodes.length === real.nodes.length + 1, "put together, the arrows are still there");
  function reaches(plan, a, b) {         // from the middle of one to a corner of the other, clear of the bed
    return !!walkWay(plan, cellOf(plan, a.x, a.y), [cellOf(plan, b.x - b.w / 2 + 25, b.y - b.h / 2 + 25)]);
  }
  hand = whole;
  var inside3d = walkPlan();
  check(inside3d.joins.filter(function (j) { return j.rooms.length === 2; }).length === 2 &&
        reaches(inside3d, nodeById(1), nodeById(2)) && reaches(inside3d, nodeById(1), nodeById(3)),
        "put together, the rooms cannot be walked between");
  hand = real;
  var onPaper = walkPlan();
  check(reaches(onPaper, nodeById(1), nodeById(2)) && reaches(onPaper, nodeById(1), nodeById(3)) &&
        onPaper.joins.filter(function (j) { return j.door.id === 4; })[0].rooms.length === 2,
        "on the paper, the walk does not follow the arrows");
  check(tieCovers(nodeById(1), 162, 0) && !tieCovers(nodeById(1), -162, 0), "a wall the kitchen comes against still looks outside");
  var arrows = hand.links;
  hand.links = [];
  check(!reaches(walkPlan(), nodeById(1), nodeById(2)), "the walk went through a wall");
  hand.links = arrows;
  // pushed together, the arrow becomes a door; pulled apart, a door an arrow
  hand.nodes = [{ id: 1, kind: "i_room", x: 0, y: 0, w: 300, h: 200, text: "" },
                { id: 2, kind: "i_room", x: 250, y: 0, w: 200, h: 200, text: "" }];
  hand.links = [{ id: 1, from: 1, to: 2, label: "" }];
  hand.next = 3;
  tieTidy();
  var put = hand.nodes.filter(function (n) { return n.kind === "i_door"; })[0];
  check(!hand.links.length && put && doorIn(put, nodeById(1)) && doorIn(put, nodeById(2)), "pushed together, still an arrow and no door");
  tieWas = tieDoors();
  nodeById(2).x += 350; put.x += 350;
  check(tieApart([2]) && hand.links.length === 1 && hand.links[0].from === 1 && hand.links[0].to === 2,
        "pulled apart, nothing joins them: " + JSON.stringify(hand.links));
  J = tieLayout();
  check(!J.made.length && near(J.boxes[2].l, J.boxes[1].r) && J.moves[put.id] && near(J.moves[put.id].x, put.x - 350),
        "put together again, not at its own door: " + JSON.stringify([J.boxes[2], J.moves[put.id], J.made]));
  // added: a room joined to the one before it, a door between two to both
  var later = { id: 9, kind: "i_room", x: 0, y: 330, w: 200, h: 160, text: "" };
  hand.nodes.push(later);
  check(tieNew(later, nodeById(1)) && hand.links.some(function (l) { return l.from === 1 && l.to === 9; }),
        "a new room was not joined to the room before it");
  var mid = { id: 10, kind: "i_door", x: 0, y: 175, w: 50, h: 50, text: "" };
  hand.nodes.push(mid);
  check(tieNew(mid, null) && hand.links.filter(function (l) { return l.from === 10 || l.to === 10; }).length === 2,
        "a door put down between two rooms was not joined to both");
  check(tieable(nodeById(1)) && tieable(mid) && !tieable({ kind: "i_sofa" }) && !tieAllowed(nodeById(1), { kind: "i_sofa" }),
        "arrows offered to the furniture of a floor plan");
  hand.links = [];
  said.push("rooms drawn apart, put together");

  // ---- Start a house: laid out, furnished, nothing left to put right
  [true, false].forEach(function (spread) {
    hand.nodes = []; hand.links = []; hand.next = 1;
    starterMake({ beds: 3, baths: 2, open: false, office: true, laundry: true, garage: true, closet: true, spread: spread });
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    // (every room asked for -- the halls and the rooms a squarer plan adds
    // between them come and go with the layout, 2026-10-03)
    var made = {};
    starterLast.forEach(function (o) { made[o.kind] = (made[o.kind] || 0) + 1; });
    var asked = (made.main || 0) + (made.bed || 0) === 3 && (made.ensuite || 0) + (made.bath || 0) === 2 &&
                !!(made.office && made.laundry && made.garage && made.closet && made.kitchen && made.living && made.hall);
    check(asked && rooms.length === starterLast.length, "Start a house made " + JSON.stringify(made) + ", " + rooms.length + " rooms");
    var tips = homeAdvice().map(function (t) { return t.text; });
    check(!tips.length, "Start a house left things to put right (" + (spread ? "spread" : "together") + "): " + tips.join(" / "));
    // and every piece it was to put in, in
    var lack = [];
    starterLast.forEach(function (one) {
      var spec = STARTER_ROOMS[one.kind], have = hand.nodes.filter(function (n) {
        return n !== one.room && insideArea(one.room, n.x, n.y, -14);
      }).map(function (n) { return n.kind; });
      spec.wall.concat(spec.mid).forEach(function (k) {
        var at = -1;
        k.split("|").some(function (c) { at = have.indexOf(c); return at >= 0; });
        if (at >= 0) { have.splice(at, 1); } else { lack.push(one.kind + ": " + k); }
      });
    });
    check(!lack.length, "Start a house left out " + lack.join(", "));
    var plan = walkPlan(), joined = {};
    plan.joins.forEach(function (j) { j.rooms.forEach(function (r) { joined[r.id] = true; }); });
    check(rooms.every(function (r) { return joined[r.id]; }), "a room of the house made has no way in");
    if (spread) {
      check(hand.links.length >= 13 && tieLayout().any, "spread out, the house made is not joined by arrows");
    } else {
      check(!hand.links.some(function (l) { return nodeById(l.from).kind === "i_room" && nodeById(l.to).kind === "i_room"; }),
            "put together, arrows are still left between rooms");
    }
  });
  hand.nodes = []; hand.links = [];
  said.push("a house started, spread out and put together");

  // ---- circuits, worked out
  function circuit(nodes, links) {
    hand.nodes = nodes; hand.links = links;
    nodes.forEach(function (n) { n.w = n.w || 60; n.h = n.h || 60; });
    return circuitSolve(circuitRead());
  }
  function partOf(s, id) { return s.parts.filter(function (p) { return p.n.id === id; })[0]; }
  var s1 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_resistor", text: "100 Ω", x: 100, y: 0 }],
                   [{ from: 1, to: 2 }, { from: 2, to: 1 }]);
  var amps1 = partOf(s1, 2).amps;
  check(Math.abs(amps1 - 9 / 100.3) < 1e-4, "9 V over 100 ohms: " + amps1);
  var s2 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_resistor", text: "330", x: 100, y: 0 },
                    { id: 3, kind: "i_led", text: "", x: 200, y: 0 }],
                   [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }]);
  var amps2 = partOf(s2, 3).amps;
  check(Math.abs(amps2 - 7 / 355.3) < 1e-4, "an LED and 330 ohms: " + amps2);
  var s3 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_resistor", text: "330", x: 100, y: 0 },
                    { id: 3, kind: "i_led", text: "", x: 200, y: 0 }],
                   [{ from: 2, to: 1 }, { from: 2, to: 3 }, { from: 3, to: 1 }]);   // + into its cathode
  check(Math.abs(partOf(s3, 3).amps) < 1e-6, "an LED the wrong way round lit");
  var s4 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_switch_on", text: "off", x: 100, y: 0 },
                    { id: 3, kind: "i_bulb", text: "", x: 200, y: 0 }],
                   [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }]);
  check(!s4.flows, "current through a switch that is off");
  var s5 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_switch_on", text: "", x: 100, y: 0 }],
                   [{ from: 1, to: 2 }, { from: 2, to: 1 }]);
  check(s5.short, "a battery shorted by a switch was not a short");
  // the parts added later: a fuse melts on a short, a diode one way only,
  // the meters read what goes through and across
  circuitBlown = {};
  var s6 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_fuse", text: "2 A", x: 100, y: 0 }],
                   [{ from: 1, to: 2 }, { from: 2, to: 1 }]);
  check(circuitBlown[2] && !s6.short && !s6.flows, "a fuse across a battery did not melt");
  circuitBlown = {};
  var s7 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_resistor", text: "100", x: 100, y: 0 },
                    { id: 3, kind: "i_diode", text: "", x: 200, y: 0 }],
                   [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }]);
  check(Math.abs(partOf(s7, 3).amps - 8.3 / 100.8) < 1e-3, "a diode the right way round: " + partOf(s7, 3).amps);
  var s8 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_resistor", text: "100", x: 100, y: 0 },
                    { id: 3, kind: "i_diode", text: "", x: 200, y: 0 }],
                   [{ from: 2, to: 1 }, { from: 2, to: 3 }, { from: 3, to: 1 }]);   // + into its cathode
  check(Math.abs(partOf(s8, 3).amps) < 1e-6, "current through a diode the wrong way round");
  var s9 = circuit([{ id: 1, kind: "i_battery", text: "9 V", x: 0, y: 0 }, { id: 2, kind: "i_ammeter", text: "", x: 100, y: 0 },
                    { id: 3, kind: "i_dimmer", text: "300", x: 200, y: 0 }, { id: 4, kind: "i_voltmeter", text: "", x: 200, y: 100 }],
                   [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }, { from: 3, to: 4 }, { from: 4, to: 3 }]);
  check(Math.abs(partOf(s9, 2).amps - 9 / 300.31) < 1e-4 && Math.abs(Math.abs(partOf(s9, 4).volts) - 9 * 300 / 300.31) < 0.01,
        "the meters read wrong: " + partOf(s9, 2).amps + " A, " + partOf(s9, 4).volts + " V");
  said.push("circuits worked out");

  // ---- people made whole (40-bodies.js): every outfit on a man and a woman,
  // a child, standing, walking, carrying, hammering -- every number a number,
  // standing on the ground, as tall as a person, and not too many corners
  var bodyBad = [], bodies = 0, most = 0;
  Object.keys(BD_OUTFITS).forEach(function (outfit) {
    ["m", "f"].forEach(function (sex) {
      ["short", "long", "pony", "bun"].forEach(function (hair, hi) {
        var sp = bdSpec({ sex: sex, outfit: outfit, hairStyle: hair, beard: sex === "m" && hi % 2 === 0, child: hi === 3 });
        [[0, "", 0, true], [1.3, "", 0, true], [2.9, "carry", 0, true], [0, "hammer", 0.7, true], [4, "", 0, false]].forEach(function (pose) {
          var made = bdMake(sp, pose[0], pose[1], pose[2], pose[3], 50), verts = 0, lo = Infinity, hi2 = -Infinity, ok = true;
          made.order.forEach(function (slot) {
            var g = made.slots[slot];
            if (g.p.length % 9 || g.n.length !== g.p.length) { ok = false; }
            for (var i = 0; i < g.p.length; i++) { if (!isFinite(g.p[i]) || !isFinite(g.n[i])) { ok = false; break; } }
            verts += g.p.length / 3; lo = Math.min(lo, g.lo[2]); hi2 = Math.max(hi2, g.hi[2]);
          });
          most = Math.max(most, verts); bodies++;
          var tall = hi2 / 50, want = pose[3] ? (sp.child ? [1.7, 2.1] : [1.68, 1.95]) : [0.6, 1.0];
          if (!ok || verts > 9000 || lo < -0.02 * 50 || lo > 0.02 * 50 || tall < want[0] || tall > want[1]) {
            bodyBad.push(sex + " " + outfit + " " + hair + " " + pose.join("/") + ": " + verts + " corners, " + (lo / 50).toFixed(2) + ".." + tall.toFixed(2) + " m" + (ok ? "" : ", bad numbers"));
          }
        });
      });
    });
  });
  check(!bodyBad.length, "people made wrong: " + bodyBad.slice(0, 4).join("; "));
  said.push(bodies + " people made whole (" + Object.keys(BD_OUTFITS).length + " outfits, up to " + most + " corners)");

  return { bad: bad, said: said };
};

var src = stand + "\n" + ["03-icon-art.js", "03-icons.js", "13-hand-apart.js", "38-walk.js", "38-advice.js", "38-view3d.js", "38-models.js", "39-flows.js", "39-circuit.js", "39-design.js", "39-join.js", "39-starter.js", "40-open3d.js", "40-bodies.js"]
  .map(part).join("\n") + "\nreturn (" + tests.toString() + ")();";
var out;
try { out = new Function(src)(); }                 // eslint-disable-line no-new-func
catch (e) { console.error("could not run the parts: " + (e && e.stack || e)); process.exit(1); }
if (out.bad.length) { console.error(out.bad.slice(0, 6).join("; ")); process.exit(1); }
console.log(out.said.join("; "));
