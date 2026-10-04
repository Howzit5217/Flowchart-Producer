// ---------------------------------------------------------------------------
//  38-walk.js -- a floor plan, walked through
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================= walking it ==
  // A home drawn from above -- rooms, the doors in their walls, the beds and
  // sofas and stoves in them -- is run by walking through it.  Somebody
  // comes in by the door that leads outside, goes from room to room by the
  // doors between them, and in each room uses what is there: sits on the
  // sofa, cooks at the stove, sleeps in the bed.  The way is found round
  // the furniture and through the doorways, never through a wall, so a room
  // with no door is a room nobody gets into, and the run says so.  A person
  // standing in the plan is the one who walks it; otherwise a visitor does.
  //
  // The plan is read onto a grid a WALK_CELL square: a square is a wall
  // where a room's wall runs through it (or a Wall is drawn there), taken
  // where a piece of furniture stands on it, and open where a door is --
  // a door is drawn standing in its wall, so its box opens the wall.
  var WALK_CELL = 10;
  var WALK_SPEED = 150;                  // pixels a second: a brisk walk
  var WALK_DOORS = { i_door: true, i_door2: true, i_slide: true, i_bifold: true, i_garagedoor: true };
  // What is done at each piece, and for how long (ms, at the walking pace).
  var WALK_DO = {
    i_bed: 1500, i_bed1: 1500, i_crib: 900, i_nightstand: 600, i_wardrobe: 800, i_dresser: 700,
    i_sofa: 1100, i_armchair: 1000, i_coffee: 600, i_tv: 1000, i_fireplace: 900, i_piano: 1200,
    i_bookcase: 900, i_lamp: 500, i_plant: 700,
    i_dining: 1200, i_roundtable: 1100, i_chair: 700, i_desk: 1200, i_officechair: 700,
    i_counter: 800, i_stove: 1200, i_fridge: 700, i_kitchensink: 900,
    i_toilet: 900, i_sink: 700, i_bathtub: 1300, i_shower: 1100, i_washer: 900, i_dryer: 800,
    i_parked: 800, i_shrub: 600, i_stairs: 900,
    i_picture: 700, i_mirror: 700, i_shelf: 700, i_walltv: 1000, i_wallclock: 500, i_sconce: 400,
    i_cabinet: 700, i_hooks: 500, i_radiator: 700,
    i_spiral: 900, i_elevator: 800,
    i_dishwasher: 800, i_island: 900, i_stool: 600, i_trash: 500, i_pantry: 700, i_microwave: 800,
    i_coffeemaker: 900, i_toaster: 700, i_kettle: 700, i_fruitbowl: 500,
    i_vanity: 800, i_hamper: 500, i_ironing: 1000, i_dryrack: 700, i_heater: 500, i_utilitysink: 700,
    i_bedking: 1500, i_bunkbed: 1300, i_vanitytable: 900, i_bench: 600, i_chest: 600, i_sidetable: 500,
    i_filing: 700, i_loveseat: 1000, i_sectional: 1200, i_recliner: 1200, i_ottoman: 600, i_tvstand: 600,
    i_aquarium: 900, i_beanbag: 1000, i_speaker: 700,
    i_tablelamp: 400, i_desklamp: 400, i_vase: 600, i_candle: 600, i_books: 800, i_frame: 500,
    i_basket: 500, i_monitor: 900, i_succulent: 500, i_herbs: 600, i_palm: 600, i_cactus: 500,
    i_flowers: 600, i_arclamp: 400,
    i_cubeshelf: 600, i_cornershelf: 600, i_shoerack: 600, i_coatrack: 500, i_hood: 500,
    i_towelrail: 500, i_medicine: 600,
    i_soundbar: 600, i_console: 1200, i_pc: 1000, i_proscreen: 1000, i_recordplayer: 1000, i_fan: 500,
    i_ac: 500,
    i_grill: 1000, i_pool: 1300, i_patio: 900, i_gardenbench: 800, i_hottub: 1200, i_dogbed: 700,
    i_cattree: 600, i_hedge: 500, i_flowerbed: 600,
    i_reachin: 800, i_closetrod: 900, i_closetshelves: 700,
    // the second lot of icons (03-icon-art.js)
    i_consoletable: 500, i_sideboard: 700, i_chaise: 1300, i_rocker: 1100, i_hutch: 700, i_barcart: 900,
    i_highchair: 800, i_daybed: 1300, i_floormirror: 600, i_toybox: 800, i_standdesk: 1200, i_lshapedesk: 1200,
    i_oven: 1200, i_winecooler: 700, i_freezer: 700, i_cornertub: 1300, i_linencab: 600,
    i_whiteboard: 900, i_dartboard: 900, i_evcharger: 800,
    i_treadmill: 1500, i_exbike: 1400, i_weightbench: 1300, i_yogamat: 1300, i_pooltable: 1300, i_pingpong: 1300,
    i_easel: 1300, i_trampoline: 1200, i_swing: 1100,
    i_firepit: 1100, i_lounger: 1300, i_gazebo: 1000, i_shed: 800, i_planter: 600, i_birdbath: 600,
    i_lamppost: 500, i_pathlight: 500, i_porchlight: 500, i_floodlight: 500, i_mailbox: 700, i_bikerack: 700,
    i_workbench: 1300, i_shelving: 700, i_toolchest: 800, i_furnace: 600, i_waterheater: 600,
    i_gondola: 900, i_checkout: 1200, i_cooler: 700, i_display: 800, i_register: 600, i_schooldesk: 1300,
    i_outlet: 400, i_lightswitch: 300, i_breaker: 800, i_post: 300, i_garagebtn: 300
  };

  // ---- doors: open, shut, locked -------------------------------------------
  // A door is shut until it is opened -- by whoever walks through it, or by
  // you, walking round the house in 3D (38-view3d.js).  One whose words say
  // it is locked stays shut, and nobody gets through it; one whose words
  // say open starts open.
  var DOOR_LOCK = /\b(locked|lock|verschlossen|abgeschlossen|cerrad[ao]|bloquead[ao]|verrouill\w*)\b/i;
  var DOOR_OPENED = /\b(open|offen|abiert[ao]|ouverte?)\b/i;
  var doorOpen = {};                     // id -> open (true) or shut (false), once touched
  function doorLocked(n) { return DOOR_LOCK.test(String(n.text || "")); }
  function doorIsOpen(n) {
    if (doorLocked(n)) { return false; }
    if (doorOpen[n.id] !== undefined) { return doorOpen[n.id]; }
    return DOOR_OPENED.test(String(n.text || ""));
  }
  // What a room is for, from what is in it, where it was not given a name:
  // the first of these with something of its own in the room.
  var ROOM_FOR = [
    ["fr_kitchen", ["i_stove", "i_fridge", "i_kitchensink", "i_counter", "i_island", "i_dishwasher", "i_pantry",
                    "i_oven", "i_winecooler"]],
    ["fr_bath", ["i_toilet", "i_bathtub", "i_shower", "i_vanity", "i_cornertub"]],
    ["fr_bed", ["i_bed", "i_bedking", "i_bed1", "i_bunkbed", "i_crib", "i_daybed"]],
    ["fr_laundry", ["i_washer", "i_dryer", "i_ironing", "i_dryrack", "i_utilitysink"]],
    ["fr_garage", ["i_parked", "i_garagedoor", "i_workbench", "i_toolchest", "i_evcharger"]],
    ["fr_office", ["i_desk", "i_officechair", "i_filing", "i_pc", "i_standdesk", "i_lshapedesk", "i_whiteboard"]],
    ["fr_dining", ["i_dining", "i_roundtable", "i_hutch", "i_sideboard"]],
    ["fr_living", ["i_sofa", "i_loveseat", "i_sectional", "i_armchair", "i_recliner", "i_tv", "i_tvstand",
                   "i_fireplace", "i_piano", "i_chaise"]],
    // last: a room with nothing in it but clothes is a closet to walk into
    ["fr_closet", ["i_closetrod", "i_closetshelves", "i_reachin", "i_wardrobe", "i_shoerack"]]
  ];

  // ---- a room for more than one thing ------------------------------------------
  // (asked for, 2026-10-01: "multipurpose rooms too for like one room
  // homes")  A room with a bed and a stove in it is not a kitchen with a
  // bed in it, which is all the first of the list above could say: it is a
  // studio.  So what a room is for is everything in it says it is for, and
  // a room for two things at once is named the way people name it -- a
  // studio (somewhere to sleep, and to cook or sit), a great room (kitchen
  // and living room in one), an eat-in kitchen, a living and dining room.
  // Anything else is named for the first thing it is for, as it was.
  var ROOM_BOTH = [
    ["studio", ["bed"], ["kitchen", "living", "dining"]],
    ["great", ["kitchen"], ["living"]],
    ["eatin", ["kitchen"], ["dining"]],
    ["livdine", ["living"], ["dining"]]
  ];
  // Everything a room is for, from the kinds of thing in it: { bed: true, ... }
  function roomUses(kinds) {
    var uses = {};
    ROOM_FOR.forEach(function (r) {
      if (r[1].some(function (k) { return kinds.indexOf(k) >= 0; })) { uses[r[0].slice(3)] = true; }
    });
    return uses;
  }
  // The name of a room for two things at once, or null.
  function roomBoth(uses) {
    for (var i = 0; i < ROOM_BOTH.length; i++) {
      var b = ROOM_BOTH[i];
      if (b[1].some(function (u) { return uses[u]; }) && b[2].some(function (u) { return uses[u]; })) { return b[0]; }
    }
    return null;
  }

  // ---- floors of a house ------------------------------------------------------
  // A house of more than one storey is drawn a storey at a time, each in a
  // Floor container (03-icon-art.js), side by side on the paper.  Which is
  // above which is read from what they are called -- Basement, Ground floor,
  // Upstairs, Attic, or a number -- or, called none of those, from where
  // they are, left to right.  The lowest above ground is the ground floor;
  // each is stacked on the one under it in 3D (38-view3d.js), its rooms over
  // the same spot as the ground floor's.  Stairs, a spiral stair or a lift on
  // one floor lead to the same on the next: the one an arrow is drawn to, or
  // else the one in the same place, a floor up.
  var CEIL_PLAIN = 2.6;                  // metres, a ceiling nobody gave a height to
  var LEVEL_SAID = [
    [-10, /basement|cellar|keller|untergeschoss|sótano|sous-sol|\bcave\b/i],
    [0, /ground|main floor|downstairs|erdgeschoss|planta baja|rez|plain-pied/i],
    [10, /upstairs|upper|obergeschoss|planta alta|piso de arriba|étage/i],
    [20, /attic|loft|dachboden|ático|desván|grenier|combles/i]
  ];

  function levelKey(f, k) {
    if (typeof f.storey === "number" && isFinite(f.storey)) { return f.storey * 10; }
    var said = String(f.text || ""), num = /(-?\d+)/.exec(said);
    for (var i = 0; i < LEVEL_SAID.length; i++) {
      if (!LEVEL_SAID[i][1].test(said)) { continue; }
      var key = LEVEL_SAID[i][0];
      // "Upper floor 2" is over "Upper floor 1"; "Basement 2" under "Basement 1"
      if (num && key) { return (key < 0 ? -10 : 10) * Math.abs(+num[1]); }
      return key;
    }
    if (num) { return +num[1] * 10; }
    return k * 10 + 5;
  }

  // How high a room's ceiling is, in metres: its own, else its floor's,
  // else the usual.
  // (the floors picked out of the drawing once, not each time a ceiling is
  // asked about: every room of a big building asked every shape in it,
  // several times a picture -- 2026-10-03)
  var floorsKept = { list: null, count: -1, first: null, last: null, at: 0, floors: [] };
  function floorNodes() {
    var K = floorsKept || (floorsKept = { list: null, count: -1, first: null, last: null, at: 0, floors: [] }), list = hand.nodes, now = performance.now();
    if (K.list !== list || K.count !== list.length || K.first !== list[0] || K.last !== list[list.length - 1] || now - K.at > 250) {
      K.list = list; K.count = list.length; K.first = list[0]; K.last = list[list.length - 1]; K.at = now;
      K.floors = list.filter(function (m) { return m.kind === "i_floor"; });
    }
    return K.floors;
  }
  function ceilOf(n) {
    if (n && n.ceil > 0) { return n.ceil; }
    var f = n && n.kind !== "i_floor" && floorNodes().filter(function (m) {
      return insideArea(m, n.x, n.y);
    })[0];
    return f && f.ceil > 0 ? f.ceil : CEIL_PLAIN;
  }

  // (2026-10-01: "when you make multiple houses instead of being able to
  // see them individually in 3d they are currently stacking on top of one
  // another")  Floors stack with the floors of their own house only: those
  // Start a house made together (`bldg`), those joined by stairs drawn
  // between them, and a floor with neither going with the house whose
  // ground floor is nearest.  Each house's ground floor stays where it is
  // drawn; `up` is the floor over each in its own house.
  // A floor that says which it is: its storey kept on it, or a name or number in its words.
  function levelNamed(f) {
    if (typeof f.storey === "number" && isFinite(f.storey)) { return true; }
    var said = String(f.text || "");
    return /(-?\d+)/.test(said) || LEVEL_SAID.some(function (L) { return L[1].test(said); });
  }
  function floorsOf() {
    var list = hand.nodes.filter(function (n) { return n.kind === "i_floor"; });
    if (!list.length) { return []; }
    var left = list.slice().sort(function (p, q) { return p.x - q.x || p.y - q.y; });
    var all = list.map(function (n) { return { n: n, key: levelKey(n, left.indexOf(n)) }; });
    // A floor saying nothing of which it is: over the floor its stairs come
    // up from -- one flight up from a floor that says it is the first up is
    // the second -- not where it lies on the paper (a block of five drawn in
    // two rows was stacked in the paper's order, its top floor third: 2026-10-03)
    if (all.length > 2 && all.some(function (o) { return !levelNamed(o.n); })) {
      var inF = function (n) {
        var best = null;
        all.forEach(function (o) { if (insideArea(o.n, n.x, n.y) && (!best || o.n.w * o.n.h < best.n.w * best.n.h)) { best = o; } });
        return best;
      };
      var near = [];
      hand.links.forEach(function (l) {
        var a = nodeById(l.from), b = nodeById(l.to);
        // (flights only: a lift may stop at many floors, its links no measure of one storey)
        if (!a || !b || a.kind === "i_elevator" || b.kind === "i_elevator" || !BETWEEN_FLOORS[a.kind] || !BETWEEN_FLOORS[b.kind]) { return; }
        var fa = inF(a), fb = inF(b);
        if (fa && fb && fa !== fb && (fa.n.bldg === undefined || fa.n.bldg === fb.n.bldg)) { near.push([fa, fb]); }
      });
      var known = all.filter(function (o) { return levelNamed(o.n); });
      for (var pass = 0; pass < all.length && near.length; pass++) {
        var grew = false;
        near.forEach(function (e) {
          [[e[0], e[1]], [e[1], e[0]]].forEach(function (q) {
            var from = q[0], to = q[1];
            if (known.indexOf(from) < 0 || known.indexOf(to) >= 0) { return; }
            // away from the ground floor: up from one up, down from one down (up from the ground itself)
            to.key = from.key + (from.key < 0 ? -10 : 10);
            known.push(to); grew = true;
          });
        });
        if (!grew) { break; }
      }
    }
    var top = all.map(function (o, i) { return i; });
    function root(i) { while (top[i] !== i) { i = top[i]; } return i; }
    function join(i, j) { top[root(i)] = root(j); }
    all.forEach(function (o, i) {
      all.forEach(function (p, j) { if (j > i && o.n.bldg !== undefined && o.n.bldg === p.n.bldg) { join(i, j); } });
    });
    function holder(n) {
      var best = -1;
      all.forEach(function (o, i) { if (insideArea(o.n, n.x, n.y) && (best < 0 || o.n.w * o.n.h < all[best].n.w * all[best].n.h)) { best = i; } });
      return best;
    }
    hand.links.forEach(function (l) {
      var a = nodeById(l.from), b = nodeById(l.to);
      if (!a || !b || !BETWEEN_FLOORS[a.kind] || !BETWEEN_FLOORS[b.kind]) { return; }
      var fa = holder(a), fb = holder(b);
      if (fa >= 0 && fb >= 0 && fa !== fb) { join(fa, fb); }
    });
    var houses = {};
    all.forEach(function (o, i) { (houses[root(i)] = houses[root(i)] || []).push(o); });
    var groups = Object.keys(houses).map(function (k) { return houses[k]; });
    // a house without a ground floor (an Upstairs drawn on its own) goes
    // with the nearest that has one -- one house, as it always was
    // (a ground floor: called one, or the first of those called nothing)
    var grounded = groups.filter(function (g) { return g.some(function (o) { return o.key >= 0 && o.key <= 5; }); });
    if (!grounded.length) { groups = [all]; }
    else {
      groups.filter(function (g) { return grounded.indexOf(g) < 0; }).forEach(function (g) {
        var best = null, far = Infinity;
        grounded.forEach(function (h) {
          h.forEach(function (o) { var d = Math.hypot(o.n.x - g[0].n.x, o.n.y - g[0].n.y); if (d < far) { far = d; best = h; } });
        });
        Array.prototype.push.apply(best, g);
      });
      groups = grounded;
    }
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; });
    // (each Floor asked only of the rooms near it: forty floors asked all
    // four hundred rooms each, many times a picture, 2026-10-03)
    var roomsIdx = typeof listNear === "function" && rooms.length > 60 ? listNear(rooms) : null;
    function tall(f) {                   // a storey: its highest ceiling, and the floor over it
      var most = ceilOf(f), ft = turned(f);
      (roomsIdx ? roomsIdx.around(f.x - ft.w / 2, f.y - ft.h / 2, f.x + ft.w / 2, f.y + ft.h / 2) : rooms).forEach(function (r) {
        if (insideArea(f, r.x, r.y)) { most = Math.max(most, ceilOf(r)); }
      });
      return (most + 0.3) * FLOOR_PX;
    }
    var out = [];
    groups.forEach(function (order, b) {
      order.sort(function (p, q) { return p.key - q.key || p.n.x - q.n.x; });
      var ground = 0;
      for (var g = 0; g < order.length; g++) { if (order[g].key >= 0) { ground = g; break; } }
      var base = order[ground].n;
      var z = 0;
      for (var i = ground; i < order.length; i++) { order[i].z = z; z += tall(order[i].n); }
      z = 0;
      for (var j = ground - 1; j >= 0; j--) { z -= tall(order[j].n); order[j].z = z; }
      order.forEach(function (o, k) {
        o.level = k - ground;
        o.dx = base.x - o.n.x; o.dy = base.y - o.n.y;
        o.bldg = b;
        o.up = order[k + 1] || null;
      });
      out = out.concat(order);
    });
    return out.sort(function (p, q) { return p.level - q.level || p.bldg - q.bldg; });
  }
  // The floor over another, in its own house (null at the top).
  function floorOver(floors, f) {
    if (!f) { return null; }
    if (f.up !== undefined) { return f.up; }
    return floors[floors.indexOf(f) + 1] || null;
  }

  function floorAt(floors, x, y) {
    var best = null;
    (floors || []).forEach(function (f) {
      if (insideArea(f.n, x, y) && (!best || f.n.w * f.n.h < best.n.w * best.n.h)) { best = f; }
    });
    return best;
  }

  function floorName(f) {
    var said = String(f.n.text || "").replace(/\s+/g, " ").trim();
    if (said && said !== kindName("i_floor")) { return said; }
    return f.level === 0 ? TXT.fl_ground : f.level > 0 ? say("fl_upper", { n: f.level }) : say("fl_lower", { n: -f.level });
  }

  // Which ways between floors join which: [lower, upper] pairs.
  function floorLinks(floors) {
    var ways = hand.nodes.filter(function (n) { return BETWEEN_FLOORS[n.kind]; });
    var pairs = [], used = {};
    function z(n) { var f = floorAt(floors, n.x, n.y); return f ? f.z : 0; }
    function add(a, b) {
      pairs.push(z(a) <= z(b) ? [a, b] : [b, a]);
      used[a.id] = used[b.id] = true;
    }
    hand.links.forEach(function (l) {
      var a = nodeById(l.from), b = nodeById(l.to);
      // (a lift stops at every floor of a block, 39-types.js: one may be
      // joined to the floor under it and to the one over it)
      if (a && b && BETWEEN_FLOORS[a.kind] && BETWEEN_FLOORS[b.kind] &&
          (!used[a.id] || a.kind === "i_elevator") && (!used[b.id] || b.kind === "i_elevator")) { add(a, b); }
    });
    if (floors.length > 1) {
      ways.forEach(function (a) {
        if (used[a.id]) { return; }
        var fa = floorAt(floors, a.x, a.y), next = fa && floorOver(floors, fa);
        if (!next) { return; }
        var best = null, far = Infinity;
        ways.forEach(function (b) {
          if (b === a || used[b.id] || floorAt(floors, b.x, b.y) !== next) { return; }
          var d = Math.hypot(a.x + fa.dx - b.x - next.dx, a.y + fa.dy - b.y - next.dy);
          if (d < far) { far = d; best = b; }
        });
        if (best) { add(a, best); }
      });
    }
    return pairs;
  }

  function isPerson(n) {
    return n.kind === "actor" || (isFigure(n.kind) && ICON_SET_OF[n.kind] === "ic_people");
  }

  // ---- the plan, read -------------------------------------------------------
  function walkPlan() {
    var rooms = [], doors = [], walls = [], pieces = [], people = [];
    hand.nodes.forEach(function (n) {
      if (n.kind === "i_room") { rooms.push(n); }
      else if (WALK_DOORS[n.kind]) { doors.push(n); }
      else if (n.kind === "i_wall" || n.kind === "i_fence") { walls.push(n); }
      else if (WALK_DO[n.kind] !== undefined) { pieces.push(n); }
      else if (isPerson(n)) { people.push(n); }
    });
    var plan = { rooms: rooms, doors: doors, walls: walls, pieces: pieces, people: people };
    // the paper the plan stands on, and some way round it outside
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    rooms.concat(doors, walls, pieces, people).forEach(function (n) {
      var t = turned(n);
      x0 = Math.min(x0, n.x - t.w / 2); x1 = Math.max(x1, n.x + t.w / 2);
      y0 = Math.min(y0, n.y - t.h / 2); y1 = Math.max(y1, n.y + t.h / 2);
    });
    if (x0 === Infinity) { return plan; }
    var M = 90;
    plan.x0 = Math.floor((x0 - M) / WALK_CELL) * WALK_CELL;
    plan.y0 = Math.floor((y0 - M) / WALK_CELL) * WALK_CELL;
    plan.cols = Math.ceil((x1 + M - plan.x0) / WALK_CELL);
    plan.rows = Math.ceil((y1 + M - plan.y0) / WALK_CELL);
    var cells = plan.cells = new Uint8Array(plan.cols * plan.rows);   // 0 open, 1 wall, 2 taken, 3 door
    var owner = plan.owner = new Int32Array(plan.cols * plan.rows);   // the piece standing there
    function each(n, grow, fn) {
      var t = turned(n), r = Math.max(t.w, t.h) / 2 + grow + WALK_CELL;
      var c0 = Math.max(0, Math.floor((n.x - r - plan.x0) / WALK_CELL));
      var c1 = Math.min(plan.cols - 1, Math.ceil((n.x + r - plan.x0) / WALK_CELL));
      var r0 = Math.max(0, Math.floor((n.y - r - plan.y0) / WALK_CELL));
      var r1 = Math.min(plan.rows - 1, Math.ceil((n.y + r - plan.y0) / WALK_CELL));
      for (var row = r0; row <= r1; row++) {
        for (var col = c0; col <= c1; col++) {
          fn(row * plan.cols + col, plan.x0 + (col + 0.5) * WALK_CELL, plan.y0 + (row + 0.5) * WALK_CELL);
        }
      }
    }
    rooms.forEach(function (room) {
      var wall = Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06));
      each(room, 6, function (i, x, y) {
        if (wallAt(room, x, y, wall)) { cells[i] = 1; }
      });
    });
    walls.forEach(function (w) {
      each(w, 4, function (i, x, y) { if (insideArea(w, x, y, -4)) { cells[i] = 1; } });
    });
    pieces.forEach(function (p) {
      // up on the wall, on a table, flat on the floor, or a stair: walked
      // under, round, over or up -- not in the way
      if (ON_THE_WALL[p.kind] || ON_TOP[p.kind] || LIES_FLAT[p.kind] || BETWEEN_FLOORS[p.kind]) { return; }
      each(p, 0, function (i, x, y) {
        if (insideArea(p, x, y, 1) && cells[i] !== 1) { cells[i] = 2; owner[i] = p.id; }
      });
    });
    // A door opens the wall it stands in -- and the wall of the room on
    // the other side of it too, which is a wall's thickness away.
    // The squares of wall each door opens are kept, so a door shut in 3D
    // can stand in them again; a locked door opens none.
    // Only across the wall, though, not along it: a door by a corner
    // opening the wall round the corner too let a walk out through it.
    function inDoorway(d, x, y) {
      var a = -(d.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      var dx = x - d.x, dy = y - d.y;
      return Math.abs(dx * c - dy * s) <= d.w / 2 + 2 && Math.abs(dx * s + dy * c) <= d.h / 2 + 12;
    }
    plan.doorway = {};
    doors.forEach(function (d) {
      if (doorLocked(d)) { return; }
      var gap = plan.doorway[d.id] = [];
      each(d, 14, function (i, x, y) {
        if (inDoorway(d, x, y) && (cells[i] === 1 || insideArea(d, x, y, -2))) {
          if (cells[i] === 1) { gap.push(i); }
          cells[i] = 3;
        }
      });
    });
    // Which rooms each door joins: those whose wall it stands in.  A door
    // in only one room's wall goes outside.
    var roomsNear = plan._roomsNear = listNear(rooms);
    plan.joins = doors.map(function (d) {
      var by = roomsNear.near(d, 12).filter(function (room) { return doorIn(d, room); });
      return { door: d, rooms: by, locked: doorLocked(d) };
    });
    plan.floors = floorsOf();
    plan.links = floorLinks(plan.floors);
    // and rooms drawn apart, joined by an arrow: a way through each wall
    // where the arrow meets it (39-join.js)
    if (typeof walkTies === "function") { walkTies(plan); }
    return plan;
  }

  // Whether x, y is on a room's wall: inside its box (with a little
  // over) but not inside the floor the wall goes round.
  function wallAt(room, x, y, wall) {
    var a = -(room.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var dx = x - room.x, dy = y - room.y, ux = Math.abs(dx * c - dy * s), uy = Math.abs(dx * s + dy * c);
    var out = 4, inn = wall + 4;
    if (ux > room.w / 2 + out || uy > room.h / 2 + out) { return false; }
    return ux >= room.w / 2 - inn || uy >= room.h / 2 - inn;
  }

  function doorIn(door, room) {
    var wall = Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06));
    var a = (door.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    for (var i = 0; i <= 6; i++) {
      for (var j = 0; j <= 6; j++) {
        var lx = (i / 6 - 0.5) * door.w, ly = (j / 6 - 0.5) * door.h;
        if (wallAt(room, door.x + lx * c - ly * s, door.y + lx * s + ly * c, wall)) { return true; }
      }
    }
    return false;
  }

  // (2026-10-03: a building of five hundred rooms took minutes to check --
  // which room each piece was in asked every room, what was in each room
  // asked every piece)  A list filed by the squares of paper (four metres)
  // its things stand over, made once and asked many times: what stands
  // over any part of a box.
  function listNear(list) {
    var S = 200, cells = new Map(), wide = [], order = new Map();
    list.forEach(function (n, at) {
      order.set(n, at);
      var t = turned(n), hw = Math.max(t.w, n.w || 0) / 2, hh = Math.max(t.h, n.h || 0) / 2;
      var c0 = Math.floor((n.x - hw) / S), c1 = Math.floor((n.x + hw) / S), r0 = Math.floor((n.y - hh) / S), r1 = Math.floor((n.y + hh) / S);
      if (!isFinite(c0 + c1 + r0 + r1) || (c1 - c0 + 1) * (r1 - r0 + 1) > 400) { wide.push(n); return; }
      for (var cy = r0; cy <= r1; cy++) {
        for (var cx = c0; cx <= c1; cx++) {
          var key = cx + "," + cy, cell = cells.get(key);
          if (!cell) { cell = []; cells.set(key, cell); }
          cell.push(n);
        }
      }
    });
    return {
      around: function (l, t, r, b) {
        var out = new Set(wide);
        for (var cy = Math.floor(t / S); cy <= Math.floor(b / S); cy++) {
          for (var cx = Math.floor(l / S); cx <= Math.floor(r / S); cx++) {
            var got = cells.get(cx + "," + cy);
            if (got) { for (var i = 0; i < got.length; i++) { out.add(got[i]); } }
          }
        }
        // (in the list's own order: the first found is the one it always was)
        return Array.from(out).sort(function (a, b) { return order.get(a) - order.get(b); });
      },
      near: function (n, pad) {
        var t = turned(n), hw = Math.max(t.w, n.w || 0) / 2 + (pad || 0), hh = Math.max(t.h, n.h || 0) / 2 + (pad || 0);
        return this.around(n.x - hw, n.y - hh, n.x + hw, n.y + hh);
      }
    };
  }
  function roomAt(plan, x, y) {
    var best = null, idx = plan._roomsNear || (plan._roomsNear = listNear(plan.rooms));
    idx.around(x, y, x, y).forEach(function (room) {
      if (insideArea(room, x, y) && (!best || room.w * room.h < best.w * best.h)) { best = room; }
    });
    return best;
  }
  // What stands in each room (the smallest room round it): worked out once a plan.
  function piecesIn(plan, room) {
    if (!plan._piecesIn) {
      var m = new Map();
      plan.pieces.forEach(function (p) {
        var r = roomAt(plan, p.x, p.y);
        if (r) { var got = m.get(r); if (!got) { got = []; m.set(r, got); } got.push(p); }
      });
      plan._piecesIn = m;
    }
    return plan._piecesIn.get(room) || [];
  }
  function piecesNear(plan) { return plan._piecesNear || (plan._piecesNear = listNear(plan.pieces)); }

  // What a room is called in what is said: its own name, if it was given
  // one, or what it is for, from what is in it -- or simply "the room".
  function roomName(plan, room) {
    var said = String(room.text || "").replace(/\s+/g, " ").trim();
    if (said && said !== kindName("i_room")) { return said; }
    var kinds = piecesNear(plan).near(room, 0).filter(function (p) { return insideArea(room, p.x, p.y); })
                           .map(function (p) { return p.kind; });
    var both = roomBoth(roomUses(kinds));
    if (both && TXT["fr_" + both]) { return TXT["fr_" + both]; }
    for (var k = 0; k < ROOM_FOR.length; k++) {
      if (ROOM_FOR[k][1].some(function (kind) { return kinds.indexOf(kind) >= 0; })) {
        return TXT[ROOM_FOR[k][0]];
      }
    }
    return TXT.fr_room;
  }

  // What a room is labeled, on the plan (03-icons.js) and in 3D: what it
  // was called, or else what is in it says it is -- "Kitchen" -- or nothing,
  // for a room with nothing in it that says.
  function roomLabel(room) {
    var said = String(room.text || "").split("\n")[0].trim();
    if (said) { return said; }
    var kinds = {};
    hand.nodes.forEach(function (n) {
      if (n !== room && ICONS[n.kind] && !isArea(n.kind) && insideArea(room, n.x, n.y)) { kinds[n.kind] = true; }
    });
    var both = roomBoth(roomUses(Object.keys(kinds)));
    if (both && TXT["rl_" + both]) { return TXT["rl_" + both]; }
    for (var k = 0; k < ROOM_FOR.length; k++) {
      if (ROOM_FOR[k][1].some(function (kind) { return kinds[kind]; })) {
        return TXT["rl_" + ROOM_FOR[k][0].slice(3)] || null;
      }
    }
    return null;
  }

  // ---- finding the way ------------------------------------------------------
  // From one square to the nearest of the squares wanted, round what is in
  // the way: across open floor and through doors, eight ways, but never
  // diagonally past a corner (or a wall one square thick would leak).
  function walkWay(plan, from, wanted, through) {
    var cols = plan.cols, rows = plan.rows, cells = plan.cells, n = cols * rows;
    var cost = new Float64Array(n).fill(Infinity), back = new Int32Array(n).fill(-1);
    var goal = {}, any = false;
    wanted.forEach(function (i) { if (i >= 0 && i < n) { goal[i] = true; any = true; } });
    if (!any || from < 0 || from >= n) { return null; }
    function open(i) { return cells[i] === 0 || cells[i] === 3 || i === from || goal[i] || (through && through(i)); }
    var heap = [[0, from]];
    cost[from] = 0;
    function push(c, i) {
      heap.push([c, i]);
      var k = heap.length - 1;
      while (k > 0) {
        var up = (k - 1) >> 1;
        if (heap[up][0] <= heap[k][0]) { break; }
        var tmp = heap[up]; heap[up] = heap[k]; heap[k] = tmp; k = up;
      }
    }
    function pop() {
      var top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        var k = 0;
        for (;;) {
          var l = 2 * k + 1, r = l + 1, m = k;
          if (l < heap.length && heap[l][0] < heap[m][0]) { m = l; }
          if (r < heap.length && heap[r][0] < heap[m][0]) { m = r; }
          if (m === k) { break; }
          var tmp = heap[m]; heap[m] = heap[k]; heap[k] = tmp; k = m;
        }
      }
      return top;
    }
    var STEPS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
                 [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
    var found = -1;
    while (heap.length) {
      var top = pop(), i = top[1];
      if (top[0] > cost[i]) { continue; }
      if (goal[i]) { found = i; break; }
      var r0 = Math.floor(i / cols), c0 = i % cols;
      for (var s = 0; s < 8; s++) {
        var c = c0 + STEPS[s][0], r = r0 + STEPS[s][1];
        if (c < 0 || r < 0 || c >= cols || r >= rows) { continue; }
        var j = r * cols + c;
        if (!open(j)) { continue; }
        if (STEPS[s][0] && STEPS[s][1] && (!open(r0 * cols + c) || !open(r * cols + c0))) { continue; }
        var to = top[0] + STEPS[s][2];
        if (to < cost[j]) { cost[j] = to; back[j] = i; push(to, j); }
      }
    }
    if (found < 0) { return null; }
    var way = [];
    for (var at = found; at >= 0; at = back[at]) { way.push(at); }
    return way.reverse();
  }

  function cellOf(plan, x, y) {
    var c = Math.max(0, Math.min(plan.cols - 1, Math.floor((x - plan.x0) / WALK_CELL)));
    var r = Math.max(0, Math.min(plan.rows - 1, Math.floor((y - plan.y0) / WALK_CELL)));
    return r * plan.cols + c;
  }
  function cellMid(plan, i) {
    return [plan.x0 + (i % plan.cols + 0.5) * WALK_CELL, plan.y0 + (Math.floor(i / plan.cols) + 0.5) * WALK_CELL];
  }

  // Whether a straight line from one square to another stays on open
  // floor all the way: used to draw the way as a few straight walks
  // rather than a staircase of squares.
  function clearLine(plan, a, b) {
    var ax = a % plan.cols, ay = Math.floor(a / plan.cols), bx = b % plan.cols, by = Math.floor(b / plan.cols);
    var steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2;
    for (var k = 0; k <= steps; k++) {
      var t = steps ? k / steps : 0;
      var x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
      // the squares either side of the line, where it runs between two
      var xs = [Math.floor(x + 0.5 - 0.35), Math.floor(x + 0.5 + 0.35)];
      var ys = [Math.floor(y + 0.5 - 0.35), Math.floor(y + 0.5 + 0.35)];
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 2; j++) {
          var cell = plan.cells[ys[j] * plan.cols + xs[i]];
          if (cell === 1 || cell === 2) { return false; }
        }
      }
    }
    return true;
  }
  function walkPoints(plan, way) {
    if (!way || !way.length) { return []; }
    var keep = [way[0]], at = 0;
    while (at < way.length - 1) {
      var far = at + 1;
      for (var k = way.length - 1; k > at + 1; k--) {
        if (clearLine(plan, way[at], way[k])) { far = k; break; }
      }
      keep.push(way[far]);
      at = far;
    }
    return keep.map(function (i) { return cellMid(plan, i); });
  }

  // The squares a piece stands on -- the stairs, to be stood on to go up.
  // The squares a piece could touch, grown by `grow`: the box round it,
  // turned any way.  (Every square of the plan was looked at for every
  // piece: two houses side by side, 300 pieces on 170,000 squares, took
  // the house's suggestions three seconds -- 2026-10-01, "really laggy".)
  function cellsNear(plan, piece, grow) {
    var r = Math.hypot(piece.w || 0, piece.h || 0) / 2 + grow + WALK_CELL, out = [];
    var c0 = Math.max(0, Math.floor((piece.x - r - plan.x0) / WALK_CELL)), c1 = Math.min(plan.cols - 1, Math.ceil((piece.x + r - plan.x0) / WALK_CELL));
    var r0 = Math.max(0, Math.floor((piece.y - r - plan.y0) / WALK_CELL)), r1 = Math.min(plan.rows - 1, Math.ceil((piece.y + r - plan.y0) / WALK_CELL));
    for (var row = r0; row <= r1; row++) { for (var col = c0; col <= c1; col++) { out.push(row * plan.cols + col); } }
    return out;
  }
  function cellsUnder(plan, piece) {
    return cellsNear(plan, piece, 2).filter(function (i) {
      var p = cellMid(plan, i);
      return insideArea(piece, p[0], p[1], 2) && plan.cells[i] !== 1 && plan.cells[i] !== 2;
    });
  }

  // The open squares beside a piece, where it is used from.
  function besideOf(plan, piece) {
    return cellsNear(plan, piece, WALK_CELL * 1.6).filter(function (i) {
      if (plan.cells[i] !== 0 && plan.cells[i] !== 3) { return false; }
      var p = cellMid(plan, i);
      return insideArea(piece, p[0], p[1], -WALK_CELL * 1.6) && !insideArea(piece, p[0], p[1], 0);
    });
  }

  // ---- the walk -------------------------------------------------------------
  var walkAt = null;                     // where the walker is, for the 3D view

  async function walkRun() {
    var plan = walkPlan();
    if (!plan.rooms.length) { simSay(TXT.wk_no_rooms, "warn"); return; }
    // Who walks: the first person standing in the plan, or a visitor.
    var walker = plan.people.filter(function (p) { return roomAt(plan, p.x, p.y); })[0] ||
                 plan.people[0] || null;
    var who = walker ? simName(walker) : TXT.wk_visitor;
    var kind = walker && ICONS[walker.kind] ? walker.kind : "i_person";
    // Where they come in: outside the door that leads out, or in the
    // middle of the biggest room where none does.
    var outside = plan.joins.filter(function (j) { return j.rooms.length === 1 && !j.locked; });
    var start, startRoom, entrance = null;
    if (walker && roomAt(plan, walker.x, walker.y)) {
      start = [walker.x, walker.y]; startRoom = roomAt(plan, walker.x, walker.y);
    } else if (outside.length) {
      // the front door of the ground floor, of a house of several -- a
      // door, before the garage's
      var level = function (j) { var f = floorAt(plan.floors, j.door.x, j.door.y); return f ? Math.abs(f.level) : 0; };
      var garage = function (j) { return j.door.kind === "i_garagedoor" ? 1 : 0; };
      entrance = outside.sort(function (p, q) {
        return level(p) - level(q) || garage(p) - garage(q) || q.door.y - p.door.y;
      })[0];
      var room = entrance.rooms[0], d = entrance.door;
      var dx = d.x - room.x, dy = d.y - room.y, len = Math.hypot(dx, dy) || 1;
      start = [d.x + dx / len * 60, d.y + dy / len * 60];
      startRoom = room;
    } else {
      startRoom = plan.rooms.slice().sort(function (p, q) { return q.w * q.h - p.w * p.h; })[0];
      start = [startRoom.x, startRoom.y];
    }
    // The rooms in the order they are come to, door by door from the first
    // -- every one on this floor, and then up or down the stairs to the
    // room at the other end, and door by door from that.
    var order = [startRoom], seen = {}, later = [];
    seen[startRoom.id] = true;
    for (var k = 0; ; k++) {
      if (k >= order.length) {
        if (!later.length) { break; }
        order.push(later.shift());
      }
      plan.joins.forEach(function (j) {
        if (j.locked || j.rooms.indexOf(order[k]) < 0) { return; }
        j.rooms.forEach(function (r) { if (!seen[r.id]) { seen[r.id] = true; order.push(r); } });
      });
      plan.links.forEach(function (pair) {
        var a = roomAt(plan, pair[0].x, pair[0].y), b = roomAt(plan, pair[1].x, pair[1].y);
        if (a === order[k] && b && !seen[b.id]) { seen[b.id] = true; later.push(b); }
        if (b === order[k] && a && !seen[a.id]) { seen[a.id] = true; later.push(a); }
      });
    }
    var linked = {};                     // stairs that lead somewhere: gone up, not visited
    plan.links.forEach(function (pair) { linked[pair[0].id] = linked[pair[1].id] = true; });
    var shut = plan.rooms.filter(function (r) { return !seen[r.id]; });

    if (walker) { simLight(walker.id, "sim-off"); }
    var sprite = simAdd(simIcon(kind, 34, undefined, undefined, walker ? simLook(walker) : null), "sim-walker");
    var trail = simAdd('<path class="sim-trail" d="" fill="none" stroke="' + simInk() +
                       '" stroke-width="1.6" stroke-dasharray="2 5" opacity="0.55"/>');
    var trailD = "M" + Math.round(start[0]) + " " + Math.round(start[1]);
    var here = start.slice(), litRoom = null, greeted = {};
    function stand(x, y) {
      simPut(sprite, x, y - 14);
      walkAt = { x: x, y: y, kind: kind, id: walker ? walker.id : null };
      // a door walked through is a door opened
      plan.doors.forEach(function (d) {
        if (!doorLocked(d) && !doorOpen[d.id] && insideArea(d, x, y, -8)) { doorOpen[d.id] = true; }
      });
      var room = roomAt(plan, x, y);
      if (room !== litRoom) {
        if (litRoom) { simLight(litRoom.id, null); }
        if (room) { simLight(room.id, "now"); }
        litRoom = room;
      }
      // say hello to anybody else in the house, once, passing
      plan.people.forEach(function (p) {
        if (p === walker || greeted[p.id] || Math.hypot(p.x - x, p.y - y) > 70) { return; }
        greeted[p.id] = true;
        simBubble(p.x, p.y - p.h / 2, TXT.wk_hello, 1200);
      });
    }
    stand(here[0], here[1]);
    simSay(entrance ? say("wk_comes_in", { who: who }) : say("wk_starts", { who: who, room: roomName(plan, startRoom) }));
    await simWait(500);

    async function follow(way) {
      var pts = [here.slice()].concat(walkPoints(plan, way).slice(1));
      var len = simLength(pts);
      await simAnimate(len / WALK_SPEED * 1000, function (t) {
        var p = simAlong(pts, t);
        stand(p.x, p.y);
      });
      pts.slice(1).forEach(function (p) { trailD += " L" + Math.round(p[0]) + " " + Math.round(p[1]); });
      var path = trail && trail.firstChild;
      if (path) { path.setAttribute("d", trailD); }
      here = pts[pts.length - 1].slice();
    }
    // Up or down: from one end of a stair (or a lift) to the other, on the
    // floor above or below.
    async function climb(from, to) {
      var fa = floorAt(plan.floors, from.x, from.y), fb = floorAt(plan.floors, to.x, to.y);
      var up = !fa || !fb || fb.z >= fa.z, where = fb ? floorName(fb) : "";
      simSay(say(from.kind === "i_elevator" ? "wk_lift" : up ? "wk_up" : "wk_down", { who: who, floor: where }));
      simBubble(here[0], here[1] - 34, up ? TXT.wk_up_said : TXT.wk_down_said, 700);
      await simWait(700);
      here = [to.x, to.y];
      trailD += " M" + Math.round(to.x) + " " + Math.round(to.y);
      stand(here[0], here[1]);
      await simWait(300);
    }
    // To the nearest of `goals`, round what is in the way -- and, where they
    // are on another floor, up or down the stairs between, as many flights
    // as it takes (each way of each flight once, so it never goes round).
    var hops = {};
    async function seek(goals, depth) {
      var way = walkWay(plan, cellOf(plan, here[0], here[1]), goals);
      if (way) { await follow(way); return true; }
      if (depth >= 4) { return false; }
      for (var k = 0; k < plan.links.length; k++) {
        for (var e = 0; e < 2; e++) {
          var from = plan.links[k][e], to = plan.links[k][1 - e], key = from.id + ">" + to.id;
          if (hops[key]) { continue; }
          var onto = walkWay(plan, cellOf(plan, here[0], here[1]), cellsUnder(plan, from));
          if (!onto) { continue; }
          hops[key] = true;
          await follow(onto);
          await climb(from, to);
          if (await seek(goals, depth + 1)) { return true; }
        }
      }
      return false;
    }
    async function walkTo(goals) { hops = {}; return seek(goals, 0); }

    var used = 0, rooms = 0, missed = [];
    for (var r = 0; r < order.length; r++) {
      var room = order[r], name = roomName(plan, room);
      var inside = plan.pieces.filter(function (p) {
        return roomAt(plan, p.x, p.y) === room && !linked[p.id];
      });
      if (!inside.length) {
        // nothing in it: across it, and on
        if (!(await walkTo(besideOf(plan, { x: room.x, y: room.y, w: 20, h: 20, turn: 0 })))) {
          missed.push(name); continue;
        }
        rooms++;
        simSay(say("wk_empty", { room: name }));
        await simWait(400);
        await simStep();
        continue;
      }
      rooms++;
      simSay(say("wk_in_room", { room: name }));
      // nearest first, from wherever they are standing
      var left = inside.slice();
      while (left.length) {
        left.sort(function (p, q) {
          return Math.hypot(p.x - here[0], p.y - here[1]) - Math.hypot(q.x - here[0], q.y - here[1]);
        });
        var piece = left.shift();
        // something standing on something else is used from beside that
        var under = ON_TOP[piece.kind] && plan.pieces.filter(function (q) {
          return q !== piece && !ON_TOP[q.kind] && !LIES_FLAT[q.kind] && insideArea(q, piece.x, piece.y);
        })[0];
        var goals = besideOf(plan, under || piece);
        if (!goals.length || !(await walkTo(goals))) {
          simSay(say("wk_cannot_reach", { what: kindName(piece.kind).toLowerCase(), room: name }), "warn");
          continue;
        }
        simLight(piece.id, "now");
        var does = TXT["wk_" + piece.kind] || kindName(piece.kind);
        simBubble(here[0], here[1] - 34, does, WALK_DO[piece.kind] * 0.9);
        simSay(say("wk_does", { who: who, does: does }));
        await simWait(WALK_DO[piece.kind]);
        simLight(piece.id, null);
        used++;
        await simStep();
      }
    }
    if (entrance) {
      // and back out the way they came in
      var door = entrance.door, home = entrance.rooms[0];
      var dx = door.x - home.x, dy = door.y - home.y, len = Math.hypot(dx, dy) || 1;
      var out = cellOf(plan, door.x + dx / len * 60, door.y + dy / len * 60);
      if (await walkTo([out])) { simSay(say("wk_leaves", { who: who })); }
    }
    if (litRoom) { simLight(litRoom.id, null); }
    shut.forEach(function (room) {
      var behind = plan.joins.some(function (j) { return j.locked && j.rooms.indexOf(room) >= 0; });
      simSay(say(behind ? "wk_locked_in" : "wk_no_way_in", { room: roomName(plan, room) }), "warn");
    });
    simSay(say("wk_summary", { rooms: rooms, used: used, area: floorSays(walkFloor(plan), FLOOR_PX) }), "good");
    // and what would make it a better home (38-advice.js)
    boardAdvice().forEach(function (tip) { simSay(say("ad_said", { what: tip.text }), "warn"); });
    walkAt = null;
    await simWait(600);
  }

  // The floor of every room, added up, as the width of a room that size
  // one metre deep -- so floorSays (03-icons.js) can say it.
  function walkFloor(plan) {
    var area = 0;
    plan.rooms.forEach(function (room) { area += room.w * room.h; });
    return area / FLOOR_PX;
  }

  // ---- what Check says about a plan -----------------------------------------
  function walkCheck() {
    var plan = walkPlan(), found = [];
    if (!plan.rooms.length) {
      if (plan.pieces.length) { found.push({ text: TXT.wk_no_rooms }); }
      return found;
    }
    var joined = {};
    plan.joins.forEach(function (j) {
      if (!j.rooms.length) { found.push({ text: TXT.wk_door_loose, id: j.door.id }); }
      j.rooms.forEach(function (r) { joined[r.id] = true; });
    });
    plan.links.forEach(function (pair) {
      pair.forEach(function (end) { var r = roomAt(plan, end.x, end.y); if (r) { joined[r.id] = true; } });
    });
    plan.rooms.forEach(function (room) {
      if (!joined[room.id] && plan.rooms.length + plan.doors.length > 1) {
        found.push({ text: say("wk_no_door", { room: roomName(plan, room) }), id: room.id });
      }
    });
    // furniture standing across a doorway
    plan.doors.forEach(function (d) {
      var hit = piecesNear(plan).near(d, 2).filter(function (p) {
        return insideArea(d, p.x, p.y) || insideArea(p, d.x, d.y);
      })[0];
      if (hit) { found.push({ text: say("wk_blocked", { what: kindName(hit.kind) }), id: hit.id }); }
    });
    return found;
  }

  function walkSum() {
    var plan = walkPlan();
    return say("wk_sum", { rooms: plan.rooms.length, pieces: plan.pieces.length,
                          area: floorSays(walkFloor(plan), FLOOR_PX) });
  }

  // The same, as tiles of a number and what it counts (37-board.js lays
  // them out): the floor's area as its number, its unit under it.
  function walkStats() {
    var plan = walkPlan(), area = floorSays(walkFloor(plan), FLOOR_PX);
    var unit = String(TXT.fp_area || "{n}").replace("{n}", "").trim();
    var n = unit ? area.replace(unit, "").trim() : area;
    return [{ n: String(plan.rooms.length), what: TXT.wk_st_rooms },
            { n: String(plan.pieces.length), what: TXT.wk_st_pieces },
            { n: n, unit: unit, what: TXT.wk_st_floor }];
  }

  SCENES.home = { run: walkRun, check: walkCheck, sum: walkSum, stats: walkStats };
