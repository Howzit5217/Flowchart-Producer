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
  "var SCENES = {};"
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
  said.push("circuits worked out");

  return { bad: bad, said: said };
};

var src = stand + "\n" + ["03-icon-art.js", "03-icons.js", "13-hand-apart.js", "38-walk.js", "38-advice.js", "38-view3d.js", "39-flows.js", "39-circuit.js", "39-design.js"]
  .map(part).join("\n") + "\nreturn (" + tests.toString() + ")();";
var out;
try { out = new Function(src)(); }                 // eslint-disable-line no-new-func
catch (e) { console.error("could not run the parts: " + (e && e.stack || e)); process.exit(1); }
if (out.bad.length) { console.error(out.bad.slice(0, 6).join("; ")); process.exit(1); }
console.log(out.said.join("; "));
