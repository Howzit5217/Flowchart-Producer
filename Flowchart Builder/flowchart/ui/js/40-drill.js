// ---------------------------------------------------------------------------
//  40-drill.js -- a fire inside, and getting out: a kitchen fire by day, a
//  fire in the night, in the storm test beside the wind and the wildfire.
//  The house tried as the codes have it -- a smoke alarm in every bedroom,
//  outside them and on every floor, wired together; a way out of every
//  bedroom through a window -- and let loose in 3D: the fire where it
//  starts, its smoke filling the room from the ceiling down and on through
//  the open doors, the alarms going off, sprinklers where there are any,
//  and everybody's way out, walked -- under the smoke, on hands and knees
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (my own list, 2026-10-03d F)  From the research:
  //   once the alarm sounds there may be as little as two minutes to get
  //   out (NFPA); a room furnished as rooms are now reaches flashover in
  //   under five minutes (UL's tests: three and a half), where it once took
  //   half an hour; smoke, not the fire, is what kills, and it does not wake
  //   a sleeper -- the alarm does; a closed bedroom door keeps the smoke out
  //   of a room for many minutes ("close before you doze", UL FSRI); a
  //   smoke alarm in each bedroom, outside each sleeping area and on every
  //   storey, interconnected (IRC R314); an emergency escape window in
  //   every bedroom (IRC R310); a quick-response sprinkler opens in about a
  //   minute and holds the fire where it is (NFPA 13D).  People walk out at
  //   about 1.2 m/s, crawl under smoke at about half a metre a second.
  if (typeof SM_STORMS === "object") { SM_STORMS.push(["drill1", 1, "drill"], ["drill2", 2, "drill"]); }
  var SM_HOLDS_DRILL = ["interconnect", "sprinklers", "closedoors", "ladders"];
  var EV_WALK = 1.2, EV_CRAWL = 0.5, EV_HEAD = 1.5, EV_LOW = 0.8;     // m/s; m: smoke down to head height, to the floor nearly
  var EV_SPRINKLE = 55;                                                // s: a quick-response head open
  var EV_SLEEP = { bed: 1, main: 1, multi: 1 };
  function evDrill(F) { return !!F && F.kind === "drill"; }
  function evNight(St) { return St && St[1] === 2; }
  function evClock(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }

  // ---- the house, read: rooms, how they join, where people are ----------------------------------------
  function evKind(plan, r) { return typeof wireKindOf === "function" ? wireKindOf(plan, r) : "room"; }
  function evPublic() { return typeof fsWanted === "function" && fsWanted(); }
  function evSprinklers() { return evPublic() || smHold("sprinklers"); }
  function evRooms(plan) {
    var P = FLOOR_PX, floors = plan.floors || [];
    return plan.rooms.map(function (r) {
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, q = typeof tieBox === "function" ? tieBox(r) : { l: r.x - r.w / 2, r: r.x + r.w / 2, t: r.y - r.h / 2, b: r.y + r.h / 2 };
      return { n: r, kind: evKind(plan, r), area: Math.max(2, (q.r - q.l) * (q.b - q.t) / (P * P)), ceil: typeof ceilOf === "function" ? ceilOf(r) : 2.6,
               box: q, level: f ? f.level : 0, f: f, links: [], smoke: Infinity, T: Infinity };
    });
  }
  function evRoomOf(R, x, y) {
    var best = null;
    R.forEach(function (r) { var q = r.box; if (x >= q.l && x <= q.r && y >= q.t && y <= q.b && (!best || r.area < best.area)) { best = r; } });
    return best;
  }
  // which rooms a door joins (and which go outside); a bedroom's door shut at night if asked
  function evJoin(plan, R, night) {
    var by = new Map();
    R.forEach(function (r) { by.set(r.n, r); });
    (plan.joins || []).forEach(function (j) {
      if (j.locked) { return; }
      var rs = j.rooms.map(function (n) { return by.get(n); }).filter(Boolean);
      for (var a = 0; a < rs.length; a++) {
        for (var b = a + 1; b < rs.length; b++) {
          var shut = night && smHold("closedoors") && (EV_SLEEP[rs[a].kind] || EV_SLEEP[rs[b].kind]);
          rs[a].links.push({ to: rs[b], shut: shut, door: j.door }); rs[b].links.push({ to: rs[a], shut: shut, door: j.door });
        }
      }
    });
    // (an open stair: the smoke goes up it faster than anywhere -- the rooms at its foot and its head joined)
    (plan.links || []).forEach(function (p) {
      if (p[0].kind === "i_elevator" || p[1].kind === "i_elevator") { return; }
      var lo = evRoomOf(R, p[0].x, p[0].y), hi = evRoomOf(R, p[1].x, p[1].y);
      if (lo && hi && lo !== hi) { lo.links.push({ to: hi, shut: false, up: true }); hi.links.push({ to: lo, shut: false }); }
    });
  }
  // where it starts: the stove by day; at night the sofa, where most deadly house fires start
  function evOrigin(plan, R, night) {
    var want = night ? ["living", "multi", "dining"] : ["kitchen", "multi"], room = null;
    for (var i = 0; i < want.length && !room; i++) { room = R.filter(function (r) { return r.kind === want[i] && r.level === 0; })[0] || null; }
    if (!room) { room = R.filter(function (r) { return r.level === 0; }).sort(function (a, b) { return b.area - a.area; })[0] || R[0]; }
    if (!room) { return null; }
    var kinds = night ? ["i_sofa", "i_armchair", "i_tv"] : ["i_stove", "i_oven", "i_cooktop"], item = null;
    hand.nodes.forEach(function (n) { if (!item && kinds.indexOf(n.kind) >= 0 && evRoomOf([room], n.x, n.y)) { item = n; } });
    return { room: room, at: item ? [item.x, item.y] : [room.n.x, room.n.y], item: item };
  }
  // The smoke: the room it starts in filling from the ceiling down to head
  // height in about a minute and a half (longer in a big room), each room
  // past an open door a while after and more slowly, much more slowly past a
  // shut one; held where it is once a sprinkler opens.
  function evSmoke(R, O) {
    var T0 = Math.max(50, Math.min(200, 90 * Math.sqrt(O.room.area / 15)));
    O.room.smoke = 0; O.room.T = T0; O.room.hops = 0;
    var todo = [O.room];
    while (todo.length) {
      todo.sort(function (a, b) { return a.smoke - b.smoke; });
      var r = todo.shift();
      r.links.forEach(function (l) {
        var q = l.to, at = r.smoke + (l.up ? 0.2 : 0.35) * r.T * (l.shut ? 8 : 1);
        if (at < q.smoke) {
          q.smoke = at; q.hops = r.hops + 1;
          q.T = Math.max(40, Math.min(400, T0 * Math.sqrt(q.area / O.room.area) * Math.pow(1.35, q.hops) * (l.shut ? 3 : 1)));
          todo.push(q);
        }
      });
    }
  }
  // how low the smoke has come in a room by then (m above its floor)
  function evLayer(r, t, M) {
    if (!isFinite(r.smoke) || t < r.smoke) { return r.ceil; }
    var tt = M.sprink ? Math.min(t, Math.max(r.smoke, M.sprink + 20)) : t;
    return Math.max(0.25, r.ceil - (r.ceil - EV_HEAD) * (tt - r.smoke) / r.T);
  }

  // ---- the way out ----------------------------------------------------------------------------------------------
  // From a point to the open air, round what is in the way, through the
  // doors; from an upper floor down the stairs first (never the lift).
  function evRoute(plan, x, y) {
    if (!plan.cells) { return null; }
    var floors = plan.floors || [], links = plan.links || [], pts = [], at = [x, y], guard = 0, length = 0, stairs = 0;
    var outside = plan.evOut || (plan.evOut = evOutside(plan));
    while (guard++ < 8) {
      var f = floors.length ? floorAt(floors, at[0], at[1]) : null, lvl = f ? f.level : 0, wanted, pairs = [];
      if (lvl === 0) { wanted = outside; }
      else {
        // (the stairs on this floor going the way out: down from above, up from a basement)
        links.forEach(function (p) {
          if (p[0].kind === "i_elevator" || p[1].kind === "i_elevator") { return; }
          var here = lvl > 0 ? p[1] : p[0];
          if (floorAt(floors, here.x, here.y) === f) { pairs.push({ here: here, there: lvl > 0 ? p[0] : p[1] }); }
        });
        wanted = [];
        pairs.forEach(function (q) { q.cells = cellsNear(plan, q.here, 0).filter(function (i) { var m = cellMid(plan, i); return insideArea(q.here, m[0], m[1], 2); }); wanted = wanted.concat(q.cells); });
      }
      if (!wanted.length) { return null; }
      var way = walkWay(plan, cellOf(plan, at[0], at[1]), wanted);
      if (!way) { return null; }
      var leg = walkPoints(plan, way);
      if (!leg.length) { leg = [[at[0], at[1]]]; }
      leg[0] = [at[0], at[1]];
      leg.forEach(function (p, i) { if (pts.length && i === 0) { return; } if (pts.length) { var q = pts[pts.length - 1]; if (!q.jump) { length += Math.hypot(p[0] - q[0], p[1] - q[1]); } } pts.push(p); });
      if (lvl === 0) { break; }
      var end = way[way.length - 1], took = pairs.filter(function (q) { return q.cells.indexOf(end) >= 0; })[0];
      if (!took) { return null; }
      // (down the flight: as long again as it is high)
      stairs++; length += 6 * FLOOR_PX;
      at = [took.there.x, took.there.y];
      pts.push(Object.assign([at[0], at[1]], { jump: true }));
    }
    return { pts: pts, len: length / FLOOR_PX, stairs: stairs };
  }
  function evOutside(plan) {
    var out = [], floors = plan.floors || [];
    for (var i = 0; i < plan.cells.length; i++) {
      if (plan.cells[i] !== 0) { continue; }
      var m = cellMid(plan, i), f = floors.length ? floorAt(floors, m[0], m[1]) : null;
      if ((f && f.level !== 0) || roomAt(plan, m[0], m[1])) { continue; }
      out.push(i);
    }
    return out;
  }
  // who is in the house: by day one at the stove and one in the living room; at night one asleep in each bedroom
  function evPeople(plan, R, O, night) {
    var out = [];
    if (night) {
      R.forEach(function (r) { if (EV_SLEEP[r.kind]) { out.push({ room: r, at: [r.n.x, r.n.y], asleep: true }); } });
    } else {
      if (O) { out.push({ room: O.room, at: [O.at[0] + (O.room.n.x - O.at[0]) * 0.35, O.at[1] + (O.room.n.y - O.at[1]) * 0.35], asleep: false }); }
      var other = R.filter(function (r) { return r !== (O && O.room) && (r.kind === "living" || r.kind === "office" || r.kind === "bed" || r.kind === "main"); })[0];
      if (other) { out.push({ room: other, at: [other.n.x, other.n.y], asleep: false }); }
    }
    return out.slice(0, 6);
  }
  function evWindowIn(r) {
    var q = r.box, pad = 0.45 * FLOOR_PX;
    return hand.nodes.some(function (n) { return n.kind === "i_window" && n.x >= q.l - pad && n.x <= q.r + pad && n.y >= q.t - pad && n.y <= q.b + pad; });
  }
  // The whole of it, worked out: the smoke, the alarms, each person's way out and how it goes.
  function evModelNow(St) {
    var plan = walkPlan(), night = evNight(St), R = evRooms(plan);
    if (!R.length) { return null; }
    evJoin(plan, R, night);
    var O = evOrigin(plan, R, night);
    if (!O) { return null; }
    evSmoke(R, O);
    var M = { plan: plan, R: R, O: O, night: night, sprink: evSprinklers() ? EV_SPRINKLE : null, people: [], alarms: [] };
    // the alarms: each sounding a few seconds after the smoke reaches it; wired together, all at the first
    hand.nodes.forEach(function (n) { if (n.kind === "i_smoke") { var r = evRoomOf(R, n.x, n.y); if (r) { M.alarms.push({ n: n, room: r, at: r.smoke + 12 }); } } });
    var first = M.alarms.reduce(function (m, a) { return Math.min(m, a.at); }, Infinity), wired = smHold("interconnect") && M.alarms.length > 1;
    // (a building shared or open to the public: its fire alarm sounds all through it -- set off by the first
    // detector, or by the water flowing once a sprinkler opens)
    if (evPublic()) { wired = true; if (M.sprink) { first = Math.min(first, M.sprink + 5); } }
    if (wired) { M.alarms.forEach(function (a) { a.at = first; }); }
    M.first = first; M.wired = wired;
    evPeople(plan, R, O, night).forEach(function (p) {
      // heard: an alarm in their own room, or one through an open door -- or, awake, the smoke itself
      var heard = Infinity;
      M.alarms.forEach(function (a) {
        if (a.room === p.room) { heard = Math.min(heard, a.at); }
        else if (p.room.links.some(function (l) { return l.to === a.room && !l.shut; })) { heard = Math.min(heard, a.at + 4); }
        else if (wired) { heard = Math.min(heard, a.at); }
      });
      if (!p.asleep && isFinite(p.room.smoke)) { heard = Math.min(heard, p.room.smoke + 20); }
      if (!p.asleep && p.room === O.room) { heard = Math.min(heard, 8); }
      p.heard = heard; p.go = heard + (p.asleep ? 60 : 30);
      p.route = evRoute(plan, p.at[0], p.at[1]);
      p.window = EV_SLEEP[p.room.kind] && evWindowIn(p.room);
      evWalk(M, p);
      M.people.push(p);
    });
    var last = M.people.reduce(function (m, p) { return Math.max(m, isFinite(p.out) ? p.out : p.stuck || 0); }, 0);
    M.end = Math.min(300, Math.max(60, last + 15, (M.sprink || 0) + 25));
    return M;
  }
  var evModel = typeof tieWith === "function" ? tieWith(evModelNow, 1) : evModelNow;
  // A person's way out, walked a quarter second at a time: crawling where
  // the smoke is down to head height, stopped where it is down to the floor
  // -- back to a bedroom window if there is one, else trapped.
  function evWalk(M, p) {
    p.track = [];
    if (!isFinite(p.go)) { p.out = Infinity; p.how = "asleep"; p.stuck = evStuckAt(M, p.room); return; }
    if (!p.route) { p.out = Infinity; p.how = "noway"; p.stuck = evStuckAt(M, p.room); return; }
    var pts = p.route.pts, P = FLOOR_PX, t = p.go, seg = 1, pos = [pts[0][0], pts[0][1]], crawled = 0, R = M.R;
    // (still in bed, or at the stove, until then: and the smoke may have come down meanwhile)
    if (evLayer(p.room, t, M) <= EV_LOW) { return evOut(M, p, t); }
    while (seg < pts.length && t < 400) {
      var q = pts[seg];
      if (q.jump) { pos = [q[0], q[1]]; t += 6 / EV_WALK; p.track.push({ t: t, at: pos.slice(), jump: true }); seg++; continue; }
      var here = evRoomOf(R, pos[0], pos[1]), z = here ? evLayer(here, t, M) : 9;
      if (z <= EV_LOW) { return evOut(M, p, t); }
      var v = (z <= EV_HEAD ? EV_CRAWL : EV_WALK) * P * 0.25, dx = q[0] - pos[0], dy = q[1] - pos[1], d = Math.hypot(dx, dy);
      if (z <= EV_HEAD) { crawled += 0.25; }
      if (d <= v) { pos = [q[0], q[1]]; seg++; } else { pos = [pos[0] + dx / d * v, pos[1] + dy / d * v]; }
      t += 0.25;
      p.track.push({ t: t, at: pos.slice(), low: z <= EV_HEAD });
    }
    p.out = t; p.how = crawled > 2 ? "crawled" : "walked"; p.crawled = crawled;
  }
  function evOut(M, p, t) {
    // (out of a window: on the ground floor straight out; upstairs only down an escape ladder -- else at the window, waiting)
    if (p.window && p.room.level > 0 && !smHold("ladders")) { p.out = Infinity; p.how = "window_wait"; p.stuck = t; return; }
    if (p.window) { p.out = t + (p.room.level > 0 ? 60 : 25); p.how = p.room.level > 0 ? "ladder" : "window"; return; }
    p.out = Infinity; p.how = "trapped"; p.stuck = t;
  }
  function evStuckAt(M, r) { for (var t = 0; t < 400; t += 2) { if (evLayer(r, t, M) <= EV_LOW) { return t; } } return 400; }

  // ---- tried --------------------------------------------------------------------------------------------------
  function evMissing() {
    var plan = walkPlan(), R = evRooms(plan), miss = [];
    var has = function (r) { return hand.nodes.some(function (n) { return n.kind === "i_smoke" && evRoomOf([r], n.x, n.y); }); };
    R.forEach(function (r) { if ((EV_SLEEP[r.kind] || r.kind === "hall") && !has(r)) { miss.push(r); } });
    // (and every floor at least one)
    var levels = {};
    R.forEach(function (r) { levels[r.level] = levels[r.level] || has(r); });
    Object.keys(levels).forEach(function (l) {
      if (levels[l]) { return; }
      var big = R.filter(function (r) { return String(r.level) === l && miss.indexOf(r) < 0; }).sort(function (a, b) { return b.area - a.area; })[0];
      if (big) { miss.push(big); }
    });
    return { rooms: miss, windows: R.filter(function (r) { return EV_SLEEP[r.kind] && r.kind !== "multi" && !evWindowIn(r); }) };
  }
  // the ways out of the building: its outside doors
  function evExits() {
    var plan = walkPlan();
    return (plan.joins || []).filter(function (j) { return !j.locked && j.rooms.length === 1 && WALK_DOORS[j.door.kind] && j.door.kind !== "i_garagedoor"; }).length;
  }
  function evTry(St, B) {
    var out = [], miss = evMissing(), M = null, pub = evPublic();
    try { M = evModel(St); } catch (e) { M = null; }
    var count = hand.nodes.filter(function (n) { return n.kind === "i_smoke"; }).length, sleeps = M && M.R.some(function (r) { return EV_SLEEP[r.kind]; });
    if (pub) {
      // (a building open to the public: a fire alarm all through it, and two ways out once more than 49 use it -- IBC 1006)
      out.push({ k: "alarms", ok: true, said: evSprinklers() ? TXT.sm_dr_bldg_alarm : TXT.sm_dr_bldg_detect, fix: null });
      var exits = evExits(), people = typeof mpPeople === "function" ? mpPeople(hand.nodes.filter(function (n) { return n.kind === "i_room"; })) : 0;
      out.push({ k: "exits", ok: exits >= 2 || people <= 49, said: say(exits >= 2 ? "sm_dr_exits_ok" : people <= 49 ? "sm_dr_exits_one" : "sm_dr_exits_bad", { n: exits, p: people }), fix: null });
    } else {
      out.push({ k: "alarms", ok: !miss.rooms.length, said: miss.rooms.length ? say("sm_dr_alarms_bad", { n: miss.rooms.length }) : TXT.sm_dr_alarms_ok, fix: "ev_alarms" });
      if (count > 1 || miss.rooms.length) {
        out.push({ k: "wired", ok: smHold("interconnect"), said: smHold("interconnect") ? TXT.sm_dr_wired_ok : TXT.sm_dr_wired_bad, fix: "interconnect" });
      }
      if (sleeps) {
        out.push({ k: "egress", ok: !miss.windows.length, said: miss.windows.length ? say("sm_dr_egress_bad", { n: miss.windows.length }) : TXT.sm_dr_egress_ok, fix: "ev_windows" });
      }
    }
    out.push({ k: "sprinklers", ok: true, said: evSprinklers() ? TXT.sm_dr_spr_ok : TXT.sm_dr_spr_none, fix: null });
    if (M) {
      var stuck = M.people.filter(function (p) { return !isFinite(p.out); }), last = M.people.reduce(function (m, p) { return Math.max(m, isFinite(p.out) ? p.out : 0); }, 0);
      out.push({ k: "out", ok: !stuck.length && M.people.length > 0,
                 said: !M.people.length ? TXT.sm_dr_nobody : stuck.length ? say("sm_dr_out_bad", { n: stuck.length, of: M.people.length })
                       : say("sm_dr_out_ok", { t: evClock(last), first: isFinite(M.first) ? evClock(M.first) : "—" }),
                 fix: stuck.length ? (!pub && miss.rooms.length ? "ev_alarms" : !pub && !smHold("interconnect") && count > 1 ? "interconnect" : stuck.some(function (p) { return p.how === "window_wait"; }) && !smHold("ladders") ? "ladders" : M.night && !smHold("closedoors") ? "closedoors" : !evSprinklers() ? "sprinklers" : null) : null });
    }
    out.push({ k: "plan", ok: true, said: TXT.sm_dr_plan, fix: null });
    return { storm: St, V: St[1], q: 0, list: out, B: B, M: M, ok: out.every(function (c) { return c.ok; }) };
  }
  if (typeof smTry === "function") {
    var smTryEv = smTry;
    smTry = function (key) {
      var St = smStormOf(key);
      if (St && St[2] === "drill") { var B = smBuilding(); return B ? evTry(St, B) : null; }
      return smTryEv.apply(this, arguments);
    };
  }
  if (typeof smMeasure === "function") {
    var smMeasureEv = smMeasure;
    smMeasure = function (s) { return s && s[2] === "drill" ? (s[1] === 2 ? TXT.ev_night : TXT.ev_day) : smMeasureEv.apply(this, arguments); };
  }
  // The fixes that are things put in, not switched on: alarms where the code wants them, a window in each bedroom.
  if (typeof smHoldSet === "function") {
    var smHoldSetEv = smHoldSet;
    smHoldSet = function (k, v) {
      if (k === "ev_alarms" || k === "ev_windows") {
        var miss = evMissing();
        if (k === "ev_alarms") {
          miss.rooms.forEach(function (r) { var a = adviceAdd("i_smoke", Math.round(r.n.x), Math.round(r.n.y)); a.own = true; a.wired = true; });
        } else if (typeof starterIntoWall === "function") {
          miss.windows.forEach(function (r) { var put = starterIntoWall(r.n, "i_window", null); if (put) { put(); } });
        }
        if (typeof handKeep === "function") { handKeep(); }
        if (typeof drawHand === "function") { drawHand(); }
        return;
      }
      return smHoldSetEv.apply(this, arguments);
    };
  }
  function evHolds() { return V3 && V3.storm && smStormOf(V3.storm) && smStormOf(V3.storm)[2] === "drill" ? SM_HOLDS_DRILL : null; }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.sm_drill = '<path d="M3.5 16.5V8l6.5-5 6.5 5v8.5z"/><path d="M10 14.6c-1.5 0-2.5-1-2.5-2.4 0-1.7 1.5-2.2 1.8-4.2 1.3.8 1.7 1.8 1.6 2.8.5-.3.8-.7.9-1.3.8.7 1.1 1.6 1.1 2.7 0 1.4-1.2 2.4-2.9 2.4z"/>';
    HOUSE_ICONS.sm_h_interconnect = '<circle cx="5" cy="6" r="2.2"/><circle cx="15" cy="6" r="2.2"/><path d="M7.2 6h5.6"/><path d="M5 8.2v4.3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8.2"/>';
    HOUSE_ICONS.sm_h_sprinklers = '<path d="M10 2.5v4"/><path d="M7.5 6.5h5"/><path d="M10 6.5 6 11M10 6.5l4 4.5M10 6.5v5.5"/><path d="M5 14.5l-1 2M10 15v2M15 14.5l1 2"/>';
    HOUSE_ICONS.sm_h_closedoors = '<path d="M5 17V3h10v14"/><path d="M3 17h14"/><circle cx="12.6" cy="10.2" r=".9"/>';
    HOUSE_ICONS.sm_h_ladders = '<path d="M7 2.5v15M13 2.5v15"/><path d="M7 5.5h6M7 9h6M7 12.5h6M7 16h6"/>';
    HOUSE_ICONS.sm_h_ev_alarms = '<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r="2"/>';
    HOUSE_ICONS.sm_h_ev_windows = '<rect x="4" y="3.5" width="12" height="13" rx="1"/><path d="M4 10h12M10 3.5v13"/>';
  }

  // ---- let loose ----------------------------------------------------------------------------------------------
  var EV = { roofWas: null, beepAt: 0 };
  if (typeof fxStart === "function") {
    var fxStartEv = fxStart;
    fxStart = function () {
      var out = fxStartEv.apply(this, arguments);
      if (FX && FX.kind === "drill") { FX.windV = 0; FX.open = false; FX.ev = null; }
      return out;
    };
  }
  if (typeof fxPlan === "function") {
    var fxPlanEv = fxPlan;
    fxPlan = function (F) {
      var out = fxPlanEv.apply(this, arguments);
      if (F.kind === "drill") {
        try {
          F.ev = evModel(F.St);
          if (F.ev) { F.tEnd = F.ev.end; }
          // (looked at from above: the roof off, to see in)
          if (V3 && V3.mode !== "walk" && V3.roof && EV.roofWas === null) { EV.roofWas = true; V3.roof = false; v3Tween("roofV", 0, 650); }
        } catch (e) { F.ev = null; }
      }
      return out;
    };
  }
  // (the roof put back once the drill is over and done with)
  (function evTick() {
    try {
      var on = typeof fxOn === "function" && fxOn() && FX.kind === "drill";
      if (!on && EV.roofWas && V3) { EV.roofWas = null; if (!V3.roof) { V3.roof = true; v3Tween("roofV", 1, 650); } }
      if (!on && EV.roofWas && !V3) { EV.roofWas = null; }
      // the alarms' sound: three beeps and a pause, as they are made to (the temporal-3 pattern)
      if (on && FX.ev && !FX.done && !(typeof DM === "object" && DM.paused) && FX.t >= FX.ev.first) {
        var ph = ((FX.t - FX.ev.first) % 4);
        var beep = ph < 0.5 ? 0 : ph >= 1 && ph < 1.5 ? 1 : ph >= 2 && ph < 2.5 ? 2 : -1;
        if (beep >= 0 && EV.beepAt !== Math.floor((FX.t - FX.ev.first) / 4) * 3 + beep + 1) {
          EV.beepAt = Math.floor((FX.t - FX.ev.first) / 4) * 3 + beep + 1;
          if (typeof useTone === "function") { useTone([3100], 0.45, false); }
        }
      }
    } catch (e) { /* as it was */ }
    requestAnimationFrame(evTick);
  })();
  if (typeof fxSkyHow === "function") {
    var fxSkyHowEv = fxSkyHow;
    fxSkyHow = function () { return typeof fxOn === "function" && fxOn() && FX.kind === "drill" ? null : fxSkyHowEv.apply(this, arguments); };
  }

  // ---- drawn ------------------------------------------------------------------------------------------------------
  var EV_SMOKE = { piece: true, color: "#46413d", edge: "#46413d", bare: true, alpha: 0.5, late: true };
  var EV_SMOKE_LOW = { piece: true, color: "#2f2b28", edge: "#2f2b28", bare: true, alpha: 0.72, late: true };
  var EV_SMOKE_EDGE = { piece: true, color: "#6a635c", edge: "#6a635c", bare: true, alpha: 0.18, late: true };
  var EV_WAY = { piece: true, color: "#2fd27a", edge: "#2fd27a", pat: 31, bare: true, alpha: 0.9, late: true };
  var EV_ALARM = { piece: true, color: "#ff3b2f", edge: "#ff3b2f", pat: 31, bare: true, alpha: 0.95, late: true };
  var EV_WATER = { piece: true, color: "#9fd4f5", edge: "#9fd4f5", bare: true, alpha: 0.32, late: true };
  var EV_BODY = { piece: true, color: "#3a7bd5", edge: "#2a5aa0" }, EV_SKIN = { piece: true, color: "#d6a27a", edge: "#a87a58" };
  // a point on the paper, in 3D: its floor's own place (x, y, its floor's height)
  function evAt(x, y) {
    var floors = typeof floorsOf === "function" ? floorsOf() : [], f = floors.length ? floorAt(floors, x, y) : null;
    return [x + (f ? f.dx : 0), y + (f ? f.dy : 0), f ? f.z : 0];
  }
  function evFaces(F, out) {
    var M = F.ev, P = FLOOR_PX, t = F.t, now = performance.now() / 1000;
    if (!M) { return; }
    // the smoke in each room: a dark layer under its ceiling, coming down
    M.R.forEach(function (r) {
      var z = evLayer(r, t, M);
      if (z >= r.ceil - 0.02) { return; }
      var q = r.box, a = evAt(q.l, q.t), b = evAt(q.r, q.b), z0 = a[2] + z * P, z1 = a[2] + (r.ceil - 0.02) * P, inset = 0.06 * P;
      evBox(out, a[0] + inset, a[1] + inset, b[0] - inset, b[1] - inset, z0, z1, z <= EV_HEAD ? EV_SMOKE_LOW : EV_SMOKE);
      // (its edge soft: thinner smoke under it, curling)
      var curl = (0.18 + 0.06 * Math.sin(now * 1.3 + r.area)) * P;
      evBox(out, a[0] + inset, a[1] + inset, b[0] - inset, b[1] - inset, Math.max(a[2] + 0.05 * P, z0 - curl), z0, EV_SMOKE_EDGE);
    });
    // the fire where it started, growing -- held small once a sprinkler is on it
    var O = M.O, o = evAt(O.at[0], O.at[1]), grow = Math.min(1, t / 140), held = M.sprink && t > M.sprink;
    var big = held ? Math.max(0.15, Math.min(1, M.sprink / 140) * (1 - Math.min(1, (t - M.sprink) / 25)) * 0.6) : grow;
    var base = o[2] + (O.item && typeof pieceHigh === "function" ? pieceHigh(O.item) * P : 0.4 * P);
    if (typeof wfTongue === "function") {
      for (var i = 0; i < 3 + Math.round(big * 5); i++) {
        var ang = i * 2.4, rr = (0.15 + big * 0.6) * P * (i ? 1 : 0);
        wfTongue(out, o[0] + Math.cos(ang) * rr, o[1] + Math.sin(ang) * rr, base, (0.5 + big * 0.9) * P, (0.4 + big * 1.6) * P * (0.75 + 0.25 * Math.sin(now * 8 + i)), [0, 0, 0], now * 4 + i);
      }
    }
    // the sprinklers over it, open
    if (held) {
      var q2 = O.room.box, c = evAt((q2.l + q2.r) / 2, (q2.t + q2.b) / 2), top = c[2] + (O.room.ceil - 0.05) * P;
      [[O.at[0], O.at[1]], [(q2.l + q2.r) / 2, (q2.t + q2.b) / 2]].forEach(function (h, k) {
        var w = evAt(h[0], h[1]), ring = [];
        for (var s = 0; s < 10; s++) { var g = s / 10 * Math.PI * 2; ring.push([w[0] + Math.cos(g) * 1.6 * P, w[1] + Math.sin(g) * 1.6 * P, w[2]]); }
        for (var s2 = 0; s2 < 10; s2++) {
          var a1 = ring[s2], a2 = ring[(s2 + 1) % 10];
          out.push({ pts: [[w[0], w[1], top], a1, a2], n: [0, 0, 1], how: EV_WATER });
        }
        for (var d = 0; d < 26; d++) {
          var ph = (now * 1.4 + d / 26) % 1, g2 = d * 2.39, rd = ph * 1.6 * P;
          var dx = w[0] + Math.cos(g2) * rd, dy = w[1] + Math.sin(g2) * rd, dz = top - ph * (O.room.ceil - 0.1) * P;
          out.push({ pts: [[dx, dy, dz], [dx + 0.02 * P, dy, dz - 0.12 * P], [dx - 0.02 * P, dy, dz - 0.12 * P]], n: [0, -1, 0], how: EV_WATER });
        }
      });
    }
    // the alarms going off: a red light, flashing
    M.alarms.forEach(function (a) {
      if (t < a.at || (now * 2) % 1 > 0.55) { return; }
      var w = evAt(a.n.x, a.n.y), r0 = evRoomOf(M.R, a.n.x, a.n.y), z = w[2] + ((r0 ? r0.ceil : 2.6) - 0.06) * P, s = 0.09 * P;
      out.push({ pts: [[w[0] - s, w[1] - s, z], [w[0] + s, w[1] - s, z], [w[0] + s, w[1] + s, z], [w[0] - s, w[1] + s, z]], n: [0, 0, -1], how: EV_ALARM });
    });
    // each person, and the way out ahead of them, lit on the floor
    M.people.forEach(function (p) {
      var where = evWhere(p, t), w = evAt(where.at[0], where.at[1]);
      // (out: standing where the way out ends, outside)
      if (where.out) { evPerson(out, w, { low: false }); return; }
      evPerson(out, w, where);
      // (seen from above, over the smoke they are under: a green mark over each)
      if (V3 && V3.mode !== "walk") {
        var room = evRoomOf(M.R, where.at[0], where.at[1]), mz = w[2] + ((room ? room.ceil : 2.6) + 0.45 + 0.08 * Math.sin(now * 4)) * P, ms = 0.5 * P;
        out.push({ pts: [[w[0], w[1], mz - ms], [w[0] + ms * 0.7, w[1], mz + ms * 0.3], [w[0], w[1], mz + ms * 0.15], [w[0] - ms * 0.7, w[1], mz + ms * 0.3]], n: [0, -1, 0], how: EV_WAY });
        out.push({ pts: [[w[0], w[1], mz - ms], [w[0], w[1] + ms * 0.7, mz + ms * 0.3], [w[0], w[1], mz + ms * 0.15], [w[0], w[1] - ms * 0.7, mz + ms * 0.3]], n: [1, 0, 0], how: EV_WAY });
      }
      if (t < p.go || !p.route) { return; }
      var pts = p.route.pts, gone = 0, step = 0.9 * P, lit = 0;
      for (var s = 1; s < pts.length && lit < 40; s++) {
        var a2 = pts[s - 1], b2 = pts[s];
        if (b2.jump) { continue; }
        var L = Math.hypot(b2[0] - a2[0], b2[1] - a2[1]), ux = (b2[0] - a2[0]) / (L || 1), uy = (b2[1] - a2[1]) / (L || 1);
        for (var u = (step - gone % step) % step; u < L; u += step) {
          var cx = a2[0] + ux * u, cy = a2[1] + uy * u;
          if (evAhead(p, where, s, u)) { evChevron(out, evAt(cx, cy), ux, uy, (now * 2 + lit * 0.15) % 1); lit++; }
        }
        gone += L;
      }
    });
  }
  // a box of smoke seen from anywhere: from under it walking through the room, from above with the roof off --
  // each face both ways round (a face turned from the eye is not drawn)
  function evBox(out, x0, y0, x1, y1, z0, z1, how) {
    var c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    [[z0, [0, 0, -1]], [z1, [0, 0, 1]]].forEach(function (h) {
      var pts = c.map(function (q) { return [q[0], q[1], h[0]]; });
      out.push({ pts: pts, n: h[1], how: how });
      out.push({ pts: pts.slice().reverse(), n: [-h[1][0], -h[1][1], -h[1][2]], how: how });
    });
    var ns = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (var i = 0; i < 4; i++) {
      var a = c[i], b = c[(i + 1) % 4], pts = [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]];
      out.push({ pts: pts, n: [ns[i][0], ns[i][1], 0], how: how });
      out.push({ pts: pts.slice().reverse(), n: [-ns[i][0], -ns[i][1], 0], how: how });
    }
  }
  // where a person is by then: on their track, or out
  function evWhere(p, t) {
    if (t < p.go || !p.track.length) { return { at: p.at, low: false, still: true, seg: 0 }; }
    if (isFinite(p.out) && t >= p.out) { return { at: p.track.length ? p.track[p.track.length - 1].at : p.at, out: true }; }
    var i = Math.min(p.track.length - 1, Math.max(0, Math.floor((t - p.go) / 0.25)));
    while (i > 0 && p.track[i].t > t) { i--; }
    return { at: p.track[i].at, low: !!p.track[i].low, idx: i };
  }
  // (the way still ahead: the chevrons from where they are on)
  function evAhead(p, where, seg, u) {
    if (where.idx === undefined) { return true; }
    var at = where.at, pts = p.route.pts, best = Infinity, bs = 0;
    for (var s = 1; s < pts.length; s++) {
      if (pts[s].jump) { continue; }
      var a = pts[s - 1], b = pts[s], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      var k = Math.max(0, Math.min(1, ((at[0] - a[0]) * (b[0] - a[0]) + (at[1] - a[1]) * (b[1] - a[1])) / (L * L))), d = Math.hypot(a[0] + (b[0] - a[0]) * k - at[0], a[1] + (b[1] - a[1]) * k - at[1]);
      if (d < best) { best = d; bs = s + k; }
    }
    var mine = seg + u / (Math.hypot(pts[seg][0] - pts[seg - 1][0], pts[seg][1] - pts[seg - 1][1]) || 1) - 1;
    return mine >= bs - 1;
  }
  function evChevron(out, w, ux, uy, k) {
    var P = FLOOR_PX, z = w[2] + 0.03 * P, s = 0.22 * P, nx = -uy, ny = ux, cx = w[0] + ux * k * 0.2 * P, cy = w[1] + uy * k * 0.2 * P;
    out.push({ pts: [[cx - ux * s + nx * s, cy - uy * s + ny * s, z], [cx + ux * s * 0.2, cy + uy * s * 0.2, z], [cx - ux * s * 0.35, cy - uy * s * 0.35, z],
                     [cx - ux * s - nx * s, cy - uy * s - ny * s, z], [cx - ux * s * 0.6, cy - uy * s * 0.6, z]], n: [0, 0, 1], how: EV_WAY });
  }
  // a person: standing, or down on hands and knees under the smoke
  function evPerson(out, w, where) {
    var P = FLOOR_PX, r = 0.2 * P, tall = where.low ? 0.55 * P : 1.5 * P, ring = [];
    for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2; ring.push([w[0] + Math.cos(a) * r, w[1] + Math.sin(a) * r * (where.low ? 2.2 : 1)]); }
    v3Prism(out, ring, w[2], w[2] + tall, EV_BODY);
    var head = [];
    for (var j = 0; j < 8; j++) { var b = j / 8 * Math.PI * 2; head.push([w[0] + Math.cos(b) * 0.11 * P, w[1] + Math.sin(b) * 0.11 * P]); }
    v3Prism(out, head, w[2] + tall, w[2] + tall + 0.24 * P, EV_SKIN);
  }
  if (typeof fxPicture === "function") {
    var fxPictureEv = fxPicture;
    fxPicture = function (F, model) {
      var out = fxPictureEv.apply(this, arguments);
      if (!F || !out || F.kind !== "drill" || !F.ev) { return out; }
      try { evFaces(F, out.passing.faces); } catch (e) { /* the picture as it was */ }
      return out;
    };
  }

  // ---- said, and reckoned up ---------------------------------------------------------------------------------------
  if (typeof fxSaid === "function") {
    var fxSaidEv = fxSaid;
    fxSaid = function () {
      if (!(typeof fxOn === "function" && fxOn() && FX.kind === "drill" && FX.ev)) { return fxSaidEv.apply(this, arguments); }
      var M = FX.ev, t = FX.t, list = [];
      if (isFinite(M.first) && t >= M.first) { list.push(say("ev_said_alarm", { t: evClock(M.first) })); }
      if (M.sprink && t >= M.sprink) { list.push(say("ev_said_sprink", { t: evClock(M.sprink) })); }
      var outN = M.people.filter(function (p) { return isFinite(p.out) && t >= p.out; }).length;
      if (outN) { list.push(say("ev_said_out", { n: outN, of: M.people.length })); }
      var stuck = M.people.filter(function (p) { return !isFinite(p.out) && t >= (p.stuck || 0); }).length;
      if (stuck) { list.push(say("ev_said_stuck", { n: stuck })); }
      return say("ev_seen", { what: list.length ? list.join(" · ") : TXT.ev_said_none });
    };
  }
  if (typeof dmReport === "function") {
    var dmReportEv = dmReport;
    dmReport = function (F) {
      if (!F || F.kind !== "drill" || !F.ev) { return dmReportEv.apply(this, arguments); }
      var M = F.ev, plan = M.plan, rows = [], info = [];
      M.people.forEach(function (p) {
        var name = typeof roomName === "function" ? roomName(plan, p.room.n) : (p.room.n.text || "");
        rows.push({ k: null, what: name, amount: isFinite(p.out) ? evClock(p.out) : "—", text: TXT["ev_how_" + p.how] || p.how });
      });
      if (isFinite(M.first)) { info.push(say("ev_first", { t: evClock(M.first), wired: M.wired ? TXT.ev_wired : TXT.ev_alone })); } else { info.push(TXT.ev_no_alarm); }
      if (M.sprink) { info.push(say("ev_said_sprink", { t: evClock(M.sprink) })); }
      var stuck = M.people.filter(function (p) { return !isFinite(p.out); }).length, last = M.people.reduce(function (m, p) { return Math.max(m, isFinite(p.out) ? p.out : 0); }, 0);
      return { rows: rows, total: 0, exact: 0, info: info, wrecked: false, done: !!F.done,
               said: stuck ? say("ev_total_bad", { n: stuck }) : say("ev_total_ok", { t: evClock(last) }), note: TXT.ev_note };
    };
  }
