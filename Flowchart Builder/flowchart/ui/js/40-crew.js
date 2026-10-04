// ---------------------------------------------------------------------------
//  40-crew.js -- the builders who come when something is changed in 3D: one
//  crew, kept -- in by a door to the piece you pick up, carrying it with
//  you while you move it about, staying by it while it is still picked,
//  seeing to it when it is put down, going to the next piece you pick, and
//  walking out again by the way they came only once you are done
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "the workers that run out to move things stop
  // glitching by disappearing then running back to move things they should
  // just be there the whole time until I am done moving something")
  //
  // 40-build.js gave each change its own two builders, walking in from nine
  // metres off, fading in, and fading away when the job was done.  A piece
  // carried about settled each time the pointer paused, each settling was a
  // new job, and each job had new builders: gone, and back again from the
  // same place, over and over.  Now the builders belong to no one job:
  // they come once (by the nearest door out of doors, or up the stairs on
  // an upper floor, round the walls the way a body walks -- 38-walk.js),
  // take hold of what you carry and walk it with you, hammer at what is put
  // down or changed, wait by what is still picked, go on to the next thing
  // picked, and leave by the way they came when there is nothing left --
  // fading only once they are out of the door.
  var CREW_RUN = 3.2, CREW_WALK = 1.5;      // metres a second: hurrying to the work; going home
  var CREW_STAY = 1500;                     // ms with nothing to do before they go
  var CREW_MOST = 6;
  var CREW_REACH = 0.3;                     // metres: from a piece's edge to where its carrier stands
  var CREW_LIFT = 0.1;                      // metres: what they carry, held this far off the floor
  var CREW_LOOK = [["#f08a24", "#f2c230"], ["#d9e84a", "#f4f4f1"], ["#f08a24", "#f4f4f1"], ["#d9e84a", "#f2c230"],
                   ["#ff7a3d", "#2f6fae"], ["#e8f04a", "#f08a24"]];        // [vest, hard hat]
  var CREW = { list: [], at: 0, noted: {}, idle: 0, plan: null, planAt: 0, next: 0, wake: 0, busy: false, chosen: {} };

  // ---- what they are for, this picture --------------------------------------------------------------
  // The piece carried (they come for it); the pieces being seen to
  // (40-build.js's jobs, each told to cnJobCrew as the picture is made);
  // the piece still picked (those already about stay with it).
  function crewWants() {
    var out = [], seen = {};
    function add(id, how, job) {
      if (seen[id]) { return; }
      var n = nodeById(id);
      if (!n) { return; }
      seen[id] = true;
      out.push({ id: id, n: n, how: how, job: job || null });
    }
    // (each time a piece is picked up, its carriers' places picked afresh where it is)
    var carry = V3.carry ? V3.carry.id : null;
    if (carry !== CREW.carrying) { if (carry !== null) { delete CREW.chosen[carry]; } CREW.carrying = carry; }
    if (V3.carry) { add(V3.carry.id, "carry"); }
    Object.keys(CREW.noted).forEach(function (id) { add(+id, "work", CREW.noted[id]); });
    if (V3.sel && CREW.list.some(function (m) { return m.mode !== "leave"; })) { add(V3.sel, "wait"); }
    return out;
  }
  function crewBig(n) { return Math.max(n.w || 0, n.h || 0) > 2.4 * FLOOR_PX; }
  function crewCount(w) {
    if (w.how === "carry") { return crewBig(w.n) ? 3 : 2; }
    // (those who carried it stay to see to it -- all of them)
    var on = CREW.list.filter(function (m) { return m.task && m.task.id === w.id && m.mode !== "leave"; }).length;
    return Math.max(on, w.n.kind === "i_room" ? 3 : 2);
  }

  // ---- this picture's floors and rooms --------------------------------------------------------------
  function crewNow() {
    return { P: FLOOR_PX, floors: typeof floorsOf === "function" ? floorsOf() : [],
             rooms: hand.nodes.filter(function (r) { return r.kind === "i_room"; }) };
  }
  function crewRoom(C, x, y) {
    var best = null;
    C.rooms.forEach(function (r) { if (insideArea(r, x, y) && (!best || r.w * r.h < best.w * best.h)) { best = r; } });
    return best;
  }
  function crewFloor(C, x, y) { return C.floors.length ? floorAt(C.floors, x, y) : null; }
  // where one standing at a spot on the paper is in 3D: [dx, dy, z]
  function crewLift(C, x, y) {
    var f = crewFloor(C, x, y);
    var dx = f ? f.dx || 0 : 0, dy = f ? f.dy || 0 : 0;
    if ((f && f.level) || crewRoom(C, x, y)) { return [dx, dy, f ? f.z || 0 : 0]; }
    // (out of doors: on the land, 40-land.js)
    return [dx, dy, typeof worldGroundAt === "function" ? worldGroundAt(x + dx, y + dy) : f ? f.z || 0 : 0];
  }

  // ---- where they stand to a piece ------------------------------------------------------------------
  // Carried: one at each end of its long way (and one at a side, a big
  // one), facing it.  Seen to: those places, the open ones first.  A room:
  // inside it, a step from the middle of each wall, facing the wall.
  function crewSlots(C, w) {
    var n = w.n, P = C.P, t = (n.turn || 0) * Math.PI / 180, u = [Math.cos(t), Math.sin(t)], v = [-Math.sin(t), Math.cos(t)];
    var foot = typeof edit3dFoot === "function" ? edit3dFoot(n) : n, hw = (foot.w || 40) / 2, hh = (foot.h || 40) / 2, out = [];
    function at(a, b) { return [n.x + u[0] * a + v[0] * b, n.y + u[1] * a + v[1] * b]; }
    if (n.kind === "i_room") {
      var g = 0.8 * P;
      [[0, -hh + g, 0, -hh], [0, hh - g, 0, hh], [-hw + g, 0, -hw, 0], [hw - g, 0, hw, 0]].forEach(function (q) {
        out.push({ p: at(q[0], q[1]), look: at(q[2], q[3]) });
      });
      return out;
    }
    var r = CREW_REACH * P, long = hw >= hh;
    var cand = long ? [[-(hw + r), 0], [hw + r, 0], [0, hh + r], [0, -(hh + r)]] : [[0, -(hh + r)], [0, hh + r], [hw + r, 0], [-(hw + r), 0]];
    // (along a long side, room for two more)
    var side = long ? hw : hh;
    if (side > 0.6 * P) {
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (q) {
        cand.push(long ? [q[0] * side / 2, q[1] * (hh + r)] : [q[1] * (hw + r), q[0] * side / 2]);
      });
    }
    // (each facing the piece square on: the place along it straight in front of them)
    cand.forEach(function (q) {
      var along = long ? Math.max(-side * 0.8, Math.min(side * 0.8, q[0])) : Math.max(-side * 0.8, Math.min(side * 0.8, q[1]));
      out.push({ p: at(q[0], q[1]), look: long ? at(along, 0) : at(0, along) });
    });
    // where a body can stand first: in the piece's own room, not in a wall
    // or another piece (one end of a sofa against a wall: its front instead).
    // Picked once for each piece and kept -- carried, they keep their places
    // round it, however it goes; picked again only once it is somewhere new.
    var key = w.how === "carry" ? "carry" : [w.how, Math.round(n.x), Math.round(n.y), n.turn || 0, Math.round(n.w), Math.round(n.h)].join(",");
    var kept = CREW.chosen[n.id];
    if (!kept || kept.key !== key) {
      var room = n.kind === "i_room" ? null : crewRoom(C, n.x, n.y), plan = crewPlan(), good = [], bad = [];
      out.forEach(function (s, i) {
        var ok = (!room || insideArea(room, s.p[0], s.p[1], 0.15 * P)) && crewOpen(plan, s.p[0], s.p[1], n.id);
        (ok ? good : bad).push(i);
      });
      kept = CREW.chosen[n.id] = { key: key, idx: good.concat(bad), good: good.length };
    }
    var list = kept.idx.map(function (i) { return out[i]; });
    list.good = kept.good;
    return list;
  }

  // ---- the way there: round the walls (38-walk.js's plan of them) ----------------------------------------
  function crewPlan() {
    var now = performance.now();
    // (not made again while a piece is carried: its every step was a new plan)
    if (!CREW.plan || (!V3.carry && now - CREW.planAt > 1500)) {
      try { CREW.plan = v3Ground(); } catch (e) { CREW.plan = null; }
      CREW.planAt = now;
    }
    return CREW.plan;
  }
  function crewOpen(plan, x, y, own) {
    if (!plan || !plan.cells) { return true; }
    var c = Math.floor((x - plan.x0) / WALK_CELL), r = Math.floor((y - plan.y0) / WALK_CELL);
    if (c < 0 || r < 0 || c >= plan.cols || r >= plan.rows) { return true; }          // out of doors
    var i = r * plan.cols + c, cell = plan.cells[i];
    return cell === 0 || cell === 3 || (cell === 2 && plan.owner && plan.owner[i] === own);
  }
  // From a spot to a spot: straight where nothing is in the way, else
  // round it, as a few straight walks.
  function crewRoute(a, b, own) {
    var plan = crewPlan();
    if (!plan || !plan.cells || typeof walkWay !== "function") { return [b]; }
    var from = cellOf(plan, a[0], a[1]), to = cellOf(plan, b[0], b[1]);
    if (clearLine(plan, from, to)) { return [b]; }
    var through = function (i) { return plan.owner && plan.owner[i] === own; };
    var goals = [], c0 = to % plan.cols, r0 = Math.floor(to / plan.cols);
    for (var dr = -3; dr <= 3; dr++) {
      for (var dc = -3; dc <= 3; dc++) {
        var c = c0 + dc, r = r0 + dr;
        if (c < 0 || r < 0 || c >= plan.cols || r >= plan.rows || dc * dc + dr * dr > 9) { continue; }
        var i = r * plan.cols + c;
        if (plan.cells[i] === 0 || plan.cells[i] === 3 || through(i)) { goals.push(i); }
      }
    }
    var way = walkWay(plan, from, goals.length ? goals : [to], through);
    if (!way) { return [b]; }
    var pts = walkPoints(plan, way);
    pts.shift();
    pts.push(b);
    return pts;
  }

  // ---- the way in, and out again ----------------------------------------------------------------------
  // For a piece upstairs: up the stairs on its floor (or out of the lift).
  // In a room: the door out of doors nearest it on its floor, from a few
  // steps out past it.  Out of doors: from the street side.
  function crewDoor(C, n) {
    var P = C.P, f = crewFloor(C, n.x, n.y), lvl = f ? f.level || 0 : 0;
    function onFloor(m) { return !C.floors.length || crewFloor(C, m.x, m.y) === f; }
    function near(a, b) { return Math.hypot(a.x - n.x, a.y - n.y) - Math.hypot(b.x - n.x, b.y - n.y); }
    if (lvl) {
      var up = hand.nodes.filter(function (m) { return BETWEEN_FLOORS[m.kind] && onFloor(m); }).sort(near)[0];
      if (up) { return { from: [up.x, up.y], via: [] }; }
    }
    if (crewRoom(C, n.x, n.y)) {
      var best = null;
      hand.nodes.forEach(function (d) {
        if (!WALK_DOORS[d.kind] || !onFloor(d)) { return; }
        var t = (d.turn || 0) * Math.PI / 180, nx = (d.w || 0) >= (d.h || 0) ? -Math.sin(t) : Math.cos(t), ny = (d.w || 0) >= (d.h || 0) ? Math.cos(t) : Math.sin(t);
        [1, -1].forEach(function (s) {
          var out = [d.x + nx * s * 1.2 * P, d.y + ny * s * 1.2 * P];
          if (crewRoom(C, out[0], out[1])) { return; }                    // a door between two rooms
          var dist = Math.hypot(d.x - n.x, d.y - n.y);
          if (!best || dist < best.d) { best = { d: dist, from: [d.x + nx * s * 5 * P, d.y + ny * s * 5 * P], via: [out, [d.x, d.y]] }; }
        });
      });
      if (best) { return best; }
    }
    var lot = hand.nodes.filter(function (m) { return m.kind === "i_lot"; })[0];
    var y = lot ? Math.max(n.y + 6 * P, lot.y + lot.h / 2 + 1.5 * P) : n.y + 8 * P;
    return { from: [n.x + 1.5 * P, y], via: [] };
  }
  function crewNew(C, n, t) {
    var k = CREW.next++, door = crewDoor(C, n), look = CREW_LOOK[k % CREW_LOOK.length];
    // (the way in through the door walked first, then on round the walls from there)
    var m = { id: k, x: door.from[0], y: door.from[1], head: 0, phase: k * 1.7, path: [], lead: door.via.map(function (p) { return p.slice(); }),
              door: door, task: null, slot: null, goal: null, routeAt: 0, hold: false, mode: "come", born: t, fade: 0,
              vest: look[0], hat: look[1], arms: null, armK: 0, freeAt: t };
    // (one behind the other through the door, not all in one spot)
    m.wait = CREW.list.filter(function (o) { return o.born > t - 400; }).length * 260;
    var first = m.lead[0] || [n.x, n.y];
    m.head = Math.atan2(first[1] - m.y, first[0] - m.x);
    return m;
  }
  function crewGo(m, t) {
    m.mode = "leave"; m.task = null; m.slot = null; m.hold = false; m.arms = null;
    var d = m.door, back = d.via.slice().reverse();
    var first = back.length ? back[0] : d.from;
    m.path = crewRoute([m.x, m.y], first, -1).concat(back.slice(1)).concat(back.length ? [d.from] : []);
    m.routeAt = t;
  }

  // ---- each picture: who goes where, and how far they get ------------------------------------------------
  function crewTick(C, wants, t) {
    var dt = Math.max(0, Math.min(0.1, (t - (CREW.at || t)) / 1000)), P = C.P, list = CREW.list;
    CREW.at = t;
    if (wants.length) { CREW.idle = 0; }
    else if (!CREW.idle) { CREW.idle = t; crewWake(CREW_STAY + 60); }
    // the places wanted, each piece's in turn
    var tasks = [], slotsBy = {};
    wants.forEach(function (w) {
      var s = slotsBy[w.id] = crewSlots(C, w), c = Math.min(s.length, crewCount(w));
      // (put down, as many as there is room round it to stand; carried, it is carried)
      if (w.how !== "carry" && s.good !== undefined) { c = Math.min(c, Math.max(1, s.good)); }
      for (var k = 0; k < c; k++) { tasks.push({ w: w, k: k, m: null }); }
    });
    tasks = tasks.slice(0, CREW_MOST);
    var here = list.filter(function (m) { return m.mode !== "leave" || m.fade === 0; });
    // those already with a piece stay with it, each at the place nearest
    // them (carried, then put down, nobody changes sides); the nearest of
    // the rest take what places are left; new ones come for the rest
    function match(T, m) { return Math.hypot(m.x - slotsBy[T.w.id][T.k].p[0], m.y - slotsBy[T.w.id][T.k].p[1]); }
    function pair(ts, ms) {
      var pairs = [];
      ts.forEach(function (T) { ms.forEach(function (m) { pairs.push([match(T, m), T, m]); }); });
      pairs.sort(function (a, b) { return a[0] - b[0]; });
      pairs.forEach(function (q) {
        if (q[1].m || tasks.some(function (U) { return U.m === q[2]; })) { return; }
        q[1].m = q[2];
      });
    }
    wants.forEach(function (w) {
      pair(tasks.filter(function (T) { return T.w === w; }), here.filter(function (m) { return m.task && m.task.id === w.id; }));
    });
    pair(tasks.filter(function (T) { return !T.m; }), here.filter(function (m) { return !tasks.some(function (U) { return U.m === m; }); }));
    tasks.forEach(function (T) {
      if (T.m || T.w.how === "wait" || list.length >= CREW_MOST) { return; }
      T.m = crewNew(C, T.w.n, t); list.push(T.m); here.push(T.m);
    });
    here.forEach(function (m) {
      var T = tasks.filter(function (U) { return U.m === m; })[0];
      if (!T) {
        if (m.task) { m.task = null; m.hold = false; m.freeAt = t; }
        return;
      }
      var was = m.task;
      if (!was || was.id !== T.w.id) { m.hold = false; m.goal = null; if (m.mode === "leave") { m.mode = "come"; m.path = []; } }
      m.task = { id: T.w.id, k: T.k, how: T.w.how, job: T.w.job };
      m.slot = slotsBy[T.w.id][T.k];
      if (T.w.how !== "carry") { m.hold = false; }
    });
    // nothing for them: after a while, home
    list.forEach(function (m) {
      if (m.mode === "leave" || m.task) { return; }
      if ((CREW.idle && t - CREW.idle > CREW_STAY) || t - m.freeAt > CREW_STAY * 2) { crewGo(m, t); }
    });
    CREW.busy = false;
    list.forEach(function (m) { crewStep(C, m, dt, t); });
    CREW.list = list.filter(function (m) { return m.fade < 1; });
  }
  function crewStep(C, m, dt, t) {
    var P = C.P, moved = 0, face = null;
    if (m.wait > 0) { m.wait -= dt * 1000; CREW.busy = true; return; }
    if (m.task && m.slot) {
      var goal = m.slot.p;
      if (m.hold) {
        // carrying it: where it goes, they go
        var d = Math.hypot(goal[0] - m.x, goal[1] - m.y);
        if (d > 2 * P) { m.hold = false; }
        else { m.x = goal[0]; m.y = goal[1]; moved = d; m.path = []; }
      }
      if (!m.hold) {
        if (!m.goal || Math.hypot(goal[0] - m.goal[0], goal[1] - m.goal[1]) > 0.35 * P || !m.path.length) {
          var far = Math.hypot(goal[0] - m.x, goal[1] - m.y);
          if (far > 0.05 * P && (t - m.routeAt > 300 || !m.path.length)) {
            // (just come: in through the door first, then round the walls from it)
            var lead = m.lead || [];
            m.lead = null;
            m.path = lead.length ? lead.concat(crewRoute(lead[lead.length - 1], goal, m.task.id)) : crewRoute([m.x, m.y], goal, m.task.id);
            m.routeAt = t;
          } else if (m.path.length) { m.path[m.path.length - 1] = goal.slice(); }
          m.goal = goal.slice();
        }
        moved = crewWalk(m, dt, CREW_RUN * P);
        if (!m.path.length && Math.hypot(goal[0] - m.x, goal[1] - m.y) < 0.12 * P) {
          m.mode = "work";
          if (m.task.how === "carry") { m.hold = true; }
        }
      }
      if (m.hold || (!moved && !m.path.length)) { face = m.slot.look; }
    } else if (m.mode === "leave") {
      moved = crewWalk(m, dt, CREW_WALK * P);
      if (!m.path.length) {
        // out of the door (or down the stairs): gone
        m.fade = Math.min(1, m.fade + dt / 0.5);
        var a = m.head;
        m.x += Math.cos(a) * CREW_WALK * P * dt; m.y += Math.sin(a) * CREW_WALK * P * dt; moved = CREW_WALK * P * dt;
      }
    }
    // how they move: a step for so far walked; standing, feet together
    if (moved > 0.01) { m.phase += moved / (0.36 * P); CREW.busy = true; }
    else if (Math.abs(Math.sin(m.phase)) > 0.02) { m.phase = Math.round(m.phase / Math.PI) * Math.PI * 0.3 + m.phase * 0.7; CREW.busy = true; }
    if (face) {
      var want = Math.atan2(face[1] - m.y, face[0] - m.x), turn = Math.atan2(Math.sin(want - m.head), Math.cos(want - m.head));
      if (Math.abs(turn) > 0.01) { m.head += turn * Math.min(1, dt * 10); CREW.busy = true; }
    }
    // what the hands do
    m.arms = null; m.armK = 0;
    if (m.task && m.hold) { m.arms = "carry"; }
    else if (m.task && m.task.how === "work" && m.mode === "work" && !m.path.length) {
      var j = m.task.job, e = j ? t - j.t0 : 0;
      if (!j || e < Math.min(2200, (j.ms || 1500))) {
        m.arms = "hammer"; m.armK = Math.abs(Math.sin((t + m.id * 137) / 1000 * Math.PI * 2.5)); CREW.busy = true;
      }
    }
    if (m.fade > 0 || t - m.born < 300) { CREW.busy = true; }
  }
  // along the way, as far as a body gets this picture; facing where it goes
  function crewWalk(m, dt, speed) {
    var go = speed * dt, moved = 0;
    while (go > 0.01 && m.path.length) {
      var q = m.path[0], dx = q[0] - m.x, dy = q[1] - m.y, d = Math.hypot(dx, dy);
      if (d > 0.5) {
        var want = Math.atan2(dy, dx), turn = Math.atan2(Math.sin(want - m.head), Math.cos(want - m.head));
        m.head += turn * Math.min(1, dt * 14);
      }
      if (d <= go) { m.x = q[0]; m.y = q[1]; go -= d; moved += d; m.path.shift(); continue; }
      m.x += dx / d * go; m.y += dy / d * go; moved += go; go = 0;
    }
    return moved;
  }
  function crewWake(ms) {
    clearTimeout(CREW.wake);
    CREW.wake = setTimeout(function () { if (V3) { V3.dirty = true; } }, ms);
  }

  // ---- drawn: a body in a vest and a hard hat, a hammer in hand ---------------------------------------
  function crewDraw(C, faces, m, t) {
    var L = crewLift(C, m.x, m.y), P = C.P, x = m.x + L[0], y = m.y + L[1], z = L[2], id = 520 + m.id;
    var alpha = Math.min(1, (t - m.born) / 250) * (1 - m.fade);
    if (alpha < 0.02) { return; }
    var f0 = faces.length, k = (0.97 + ((id * 37) % 7) / 100) * P;
    peopleBody(faces, { kind: "i_builder", id: id }, x, y, z, m.head, m.phase,
               { own: true, fill: m.vest, line: "#2e3846", arms: m.arms, armK: m.armK }, alpha < 0.999 ? alpha : undefined);
    var fw = [Math.cos(m.head), Math.sin(m.head)], sd = [-Math.sin(m.head), Math.cos(m.head)];
    function at(a, b, c) { return [x + fw[0] * a * k + sd[0] * b * k, y + fw[1] * a * k + sd[1] * b * k, z + c * k]; }
    function ring(cx, cy, ra, rb, n) {
      var out = [];
      for (var q = 0; q < n; q++) { var c = q / n * Math.PI * 2; out.push([cx + fw[0] * Math.cos(c) * ra + sd[0] * Math.sin(c) * rb, cy + fw[1] * Math.cos(c) * ra + sd[1] * Math.sin(c) * rb]); }
      return out;
    }
    // the hard hat: its brim, its crown
    var hat = cnFade({ piece: true, color: m.hat, edge: v3Mix(m.hat, "#000000", 0.25), bare: true }, alpha), hc = at(0.012, 0, 0);
    v3Prism(faces, ring(hc[0], hc[1], 0.15 * k, 0.135 * k, 12), z + 1.715 * k, z + 1.735 * k, hat);
    v3Prism(faces, ring(hc[0], hc[1], 0.118 * k, 0.106 * k, 12), z + 1.735 * k, z + 1.81 * k, hat);
    v3Prism(faces, ring(hc[0], hc[1], 0.075 * k, 0.065 * k, 10), z + 1.81 * k, z + 1.835 * k, hat);
    // the vest's two bright bands
    var band = cnFade({ piece: true, color: "#e4e7ea", edge: "#c8ccd0", bare: true }, alpha);
    v3Prism(faces, ring(x, y, 0.13 * k, 0.178 * k, 12), z + 1.07 * k, z + 1.1 * k, band);
    v3Prism(faces, ring(x, y, 0.13 * k, 0.215 * k, 12), z + 1.28 * k, z + 1.31 * k, band);
    // a hammer, swung (the hand where 40-tour.js puts it)
    if (m.arms === "hammer") {
      var up = m.armK, w = at(0.42 - up * 0.14, 0.23, 1.16 + up * 0.48), a = -0.5 + up * 2.1;
      var dir = [fw[0] * Math.cos(a), fw[1] * Math.cos(a), Math.sin(a)], across = [-fw[0] * Math.sin(a), -fw[1] * Math.sin(a), Math.cos(a)];
      var end = [w[0] + dir[0] * 0.3 * k, w[1] + dir[1] * 0.3 * k, w[2] + dir[2] * 0.3 * k];
      cnBeam(faces, [w[0] - dir[0] * 0.04 * k, w[1] - dir[1] * 0.04 * k, w[2] - dir[2] * 0.04 * k], end, 0.028 * k, cnFade({ piece: true, color: "#8a5a2b", edge: "#5d3c1c", bare: true }, alpha));
      cnBeam(faces, [end[0] - across[0] * 0.05 * k, end[1] - across[1] * 0.05 * k, end[2] - across[2] * 0.05 * k],
             [end[0] + across[0] * 0.07 * k, end[1] + across[1] * 0.07 * k, end[2] + across[2] * 0.07 * k], 0.045 * k, cnFade({ piece: true, color: "#3a3d40", edge: "#222426", bare: true }, alpha));
    }
    for (var i = f0; i < faces.length; i++) { faces[i].person = true; }
  }

  // ---- into the picture ----------------------------------------------------------------------------
  // (each job tells the crew it wants seeing to: 40-build.js's own two
  // builders a job, walking in and out each time, are these now)
  if (typeof cnJobCrew === "function") {
    cnJobCrew = function (faces, j, t, P) {
      if (!j || j.id === undefined) { return; }
      CREW.noted[j.id] = j;
      // dust as it is finished: a piece put in new, a room built again
      var n = nodeById(j.id), e = t - j.t0, dk = (e - j.ms - 400) / 700;
      if (n && (j.fresh || j.room) && dk > 0 && dk < 1) {
        var f = typeof floorsOf === "function" && floorsOf().length ? floorAt(floorsOf(), n.x, n.y) : null;
        cnPuff(faces, n.x + (f ? f.dx : 0), n.y + (f ? f.dy : 0), f ? f.z : 0, dk, j.room ? 2.2 * P : 0.9 * P, P);
      }
    };
  }
  // (carried about: not looked at again until it is put down -- each pause
  // in a carry was a job of its own)
  if (typeof cnDiff === "function") {
    var cnDiffCrew = cnDiff;
    cnDiff = function () {
      if (V3 && V3.carry && cnWatch.by) { cnWatch.pendQ = null; V3.dirty = true; return; }
      return cnDiffCrew.apply(this, arguments);
    };
  }
  if (typeof cnJobs === "function") {
    var cnJobsCrew = cnJobs;
    cnJobs = function (model) {
      CREW.noted = {};
      var out = cnJobsCrew.apply(this, arguments);
      try { out = crewPicture(out, model); } catch (e) { if (window.console) { console.warn("crew:", e && e.message); } }
      return out;
    };
  }
  function crewPicture(out, model) {
    var t = performance.now();
    if (!V3 || bpSite || V3.scene === "space" || typeof peopleBody !== "function") { CREW.list = []; return out; }
    var C = crewNow();
    crewTick(C, crewWants(), t);
    if (!CREW.list.length) { return out; }
    if (out === model) { out = Object.assign({}, model); }
    if (!out.passing || out.passing === model.passing) {
      out.passing = { faces: model.passing ? model.passing.faces.slice() : [], stand: model.passing ? model.passing.stand.slice() : [] };
    }
    // carried: held up off the floor between them
    if (V3.carry && CREW.list.some(function (m) { return m.hold && m.task && m.task.id === V3.carry.id; })) {
      var id = V3.carry.id, lift = CREW_LIFT * C.P;
      out.faces = out.faces.map(function (f) { return f.node && f.node.id === id && !f.person ? cnMovePts(f, 0, 0, lift) : f; });
    }
    CREW.list.forEach(function (m) { crewDraw(C, out.passing.faces, m, t); });
    if (CREW.busy) { V3.dirty = true; }
    return out;
  }
  // a view opened again: no one about
  if (typeof v3Open === "function") {
    var v3OpenCrew = v3Open;
    v3Open = function () {
      CREW.list = []; CREW.noted = {}; CREW.idle = 0; CREW.plan = null; CREW.chosen = {};
      return v3OpenCrew.apply(this, arguments);
    };
  }
