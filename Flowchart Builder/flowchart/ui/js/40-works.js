// ---------------------------------------------------------------------------
//  40-works.js -- the building site, worked: everything that goes into the
//  building put there by someone -- each stud, each sheet, each window --
//  and every machine at a job: the excavator digging the basement and
//  loading the lorries, the mixers pouring, the telehandler lifting the
//  timber, the crane setting the trusses.  Worked out once, before it
//  starts, as a timetable (in seconds of the site's own time) for every
//  worker and machine; each picture is that timetable at the time it has
//  got to.  Watched as slowly or as fast as wanted, or skipped.
//
//  This part: the clock and its buttons, the site (the lot, the street,
//  what is in the way), the ways round it, the timetable's makings, and
//  each picture.  The jobs themselves: 40-works-jobs.js; the machines:
//  40-works-mach.js.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "there seems to be some issues of trucks and cars
  // clipping inside of things ... there are no excavators there for basements
  // ... each piece of wood or whatever should be added by workers and windows,
  // and all the furniture should not all be able to fit on one truck and all
  // things should be done by people and the animation can be really long and
  // you can add a speedup button or a skip button ... the machines should not
  // just be there doing something but nothing ... so you actually see the
  // workers building your house with all the tools and machinery")
  var WK = { plan: null, rate: null, groupOf: new WeakMap(), pre: new WeakMap() };
  // (2026-10-05: "have a 512x and 1024x speed to the construction")
  var WK_RATES = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
  var WK_RATE_FRESH = 8, WK_RATE_OPEN = 32;            // how fast it plays: watched / opened in 3D
  var WK_WALK = 1.4, WK_CARRY = 1.15, WK_CLIMB = 0.55;  // metres a second
  var WK_CELL = 0.5;                                    // metres: the site's squares
  // what each square of the site is
  var WK_LOT = 0, WK_ROAD = 1, WK_WALKWAY = 2, WK_HOUSE = 3, WK_THING = 4, WK_PAVED = 5, WK_CAR = 6, WK_STACK = 7, WK_PIT = 8, WK_OFF = 9;
  // (2026-10-05: "machines clipping into one another driving over parts for the house") the materials
  // yard, its stacks: walked into for what is in it, never driven over or stood on
  var WK_YARD = 10;
  // what is laid flat on the ground: driven and walked over
  var WK_FLAT = { i_driveway: 1, i_path: 1, i_asphalt: 1, i_sidewalk: 1, i_patio: 1, i_lawn: 1, i_parking: 1, i_steps: 1, i_rug: 1 };
  var WK_HARD = { i_driveway: 1, i_asphalt: 1, i_parking: 1, i_sidewalk: 1, i_path: 1, i_patio: 1 };
  var WK_VEST = ["#f08a24", "#d9e84a", "#f08a24", "#ff6f3c"];
  // each machine's footprint (metres): its middle forward of where it is put, half its length, half its width
  var WK_FOOT = { excavator: [0, 2.2, 1.45], dumper: [0.35, 4.3, 1.3], lowboy: [-5.8, 9.3, 1.35], telehandler: [-0.2, 2.3, 1.3], crane: [0.35, 6.0, 1.3],
                  mixer: [0, 4.7, 1.25], semi: [-6.65, 10.15, 1.3], pump: [0.2, 5.9, 1.3], pickup: [0, 2.85, 0.95], towercrane: [0, 2.4, 2.4],
                  pumpmix: [-4.9, 11.0, 1.3] };

  // ---- the clock -------------------------------------------------------------------------------
  // bpSite (40-blueprint.js) runs from 0 to 1 over bpSite.ms; the site's own
  // time is that share of the timetable's length.  How fast: bpSite.rate.
  function wkRateDefault(B) { return WK.rate || (B && B.fast ? WK_RATE_OPEN : WK_RATE_FRESH); }
  // (while the jobs are still being worked out, as long as can be: what has
  // gone of it stays where it was, the site's own seconds from its start)
  var WK_LONG = 1e6, WK_NOT_YET = { t0: Infinity, t1: Infinity, anim: "pop" };
  function wkClockStart(plan) {
    var B = plan.bp, rate = wkRateDefault(B);
    B.rate = rate; B.T = WK_LONG; B.ms = WK_LONG * 1000 / rate; B.moK = 1; B.moMs = B.ms;
  }
  // (2026-10-05) A site's calendar, where a part of its own sets one (WK.calendar):
  //   length(plan) -> the seconds the site's clock runs for, the evenings, nights,
  //                   weekends and days rained off with the work (however they are shown)
  //   work(s, plan) -> the work done by then, in the timetable's own seconds (0 .. plan.T)
  //   present(s, plan) -> 0..1, whether the crews are on the site then (optional)
  // Without one the clock is the work itself.
  function wkCalLength(plan) {
    var C = WK.calendar, L = plan.T;
    if (C && typeof C.length === "function" && plan.done) {
      try { var l = C.length(plan); if (isFinite(l) && l > 0) { L = Math.max(plan.T, l); } } catch (e) { L = plan.T; }
    }
    return L;
  }
  function wkCalWork(s, plan) {
    var C = WK.calendar;
    if (!C || typeof C.work !== "function" || !plan.done) { return s; }
    var w;
    try { w = C.work(s, plan); } catch (e) { w = s; }
    return isFinite(w) ? Math.max(0, Math.min(plan.T, w)) : Math.min(s, plan.T);
  }
  function wkCalPresent(s, plan) {
    var C = WK.calendar;
    if (!C || typeof C.present !== "function" || !plan.done) { return 1; }
    try { var p = C.present(s, plan); return isFinite(p) ? Math.max(0, Math.min(1, p)) : 1; } catch (e) { return 1; }
  }
  function wkClock(plan) {
    var B = plan.bp, now = performance.now(), rate = B.rate || wkRateDefault(B), L = wkCalLength(plan);
    // (seconds gone on the site, kept: then the length it really is)
    var gone = B.start > now ? 0 : (now - B.start) / B.ms * (B.T || L);
    if (!WK.rate) { rate = wkRateFor(L, B.fast); }
    var ms = L * 1000 / rate;
    if (B.start <= now) { B.start = now - Math.min(gone, L * 0.999) / L * ms; }
    B.ms = ms; B.T = L; B.rate = rate;
    B.moK = 1; B.moMs = ms;                              // (40-movein.js's own stretching, not wanted)
    wkSpeedShow();
  }
  // how fast it plays unless told: as long as it takes to watch (opened in 3D, a couple of minutes)
  function wkRateFor(T, fast) {
    var want = fast ? 200 : 600, r = WK_RATES[0];
    for (var i = 0; i < WK_RATES.length; i++) { r = WK_RATES[i]; if (T / r <= want) { break; } }
    return r;
  }
  function wkSetRate(r) {
    WK.rate = r;
    if (!bpSite || !bpSite.T) { wkSpeedShow(); return; }
    var now = performance.now(), B = bpSite, t = B.start > now ? 0 : Math.max(0, Math.min(1, (now - B.start) / B.ms)), ms = B.T * 1000 / r;
    if (B.start <= now) { B.start = now - t * ms; }
    B.ms = ms; B.moMs = ms; B.rate = r;
    if (V3) { V3.dirty = true; }
    wkSpeedShow();
  }
  function wkSpeedStep(dir) {
    var r = bpSite && bpSite.rate ? bpSite.rate : wkRateDefault(bpSite), i = WK_RATES.indexOf(r);
    if (i < 0) { i = 3; }
    i = Math.max(0, Math.min(WK_RATES.length - 1, i + dir));
    wkSetRate(WK_RATES[i]);
  }
  // the buttons: slower, how fast, faster -- beside Skip; and what is being done
  function wkSpeedBar(box) {
    all(".v3-speed, .v3-phase", box).forEach(function (b) { b.remove(); });
    var bar = document.createElement("div");
    bar.className = "v3-speed";
    function btn(dir, path, tip) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "v3-speed-btn"; b.dataset.dir = dir;
      b.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="' + path + '"/></svg>';
      b.title = tip; b.setAttribute("aria-label", tip);
      b.onclick = function (ev) { ev.stopPropagation(); wkSpeedStep(+dir); };
      return b;
    }
    bar.appendChild(btn(-1, "M10 2.2 5.4 6l4.6 3.8zM5.6 2.2 1 6l4.6 3.8z", TXT.jb_slower));
    var lbl = document.createElement("span");
    lbl.className = "v3-speed-lbl";
    lbl.setAttribute("aria-live", "polite");
    bar.appendChild(lbl);
    bar.appendChild(btn(1, "M2 2.2 6.6 6 2 9.8zM6.4 2.2 11 6l-4.6 3.8z", TXT.jb_faster));
    var phase = document.createElement("div");
    phase.className = "v3-phase";
    box.appendChild(phase);
    var skip = el(".v3-skip", box);
    if (skip) { box.insertBefore(bar, skip); } else { box.appendChild(bar); }
    wkSpeedShow();
  }
  function wkSpeedShow() {
    var box = V3 && V3.box;
    if (!box) { return; }
    var lbl = el(".v3-speed-lbl", box), r = bpSite && bpSite.rate ? bpSite.rate : wkRateDefault(bpSite);
    if (lbl) { lbl.textContent = r + "×"; lbl.title = TXT.jb_speed_tip; }
    all(".v3-speed-btn", box).forEach(function (b) {
      var at = WK_RATES.indexOf(r);
      b.disabled = b.dataset.dir === "-1" ? at === 0 : at === WK_RATES.length - 1;
    });
  }
  function wkPhaseShow(text) {
    var p = V3 && V3.box ? el(".v3-phase", V3.box) : null;
    if (!p || p.textContent === text) { return; }
    p.textContent = text;
    p.hidden = !text;
  }
  if (typeof bpGo === "function") {
    var bpGoWorks = bpGo;
    bpGo = function (tall, wait, fast) {
      var out = bpGoWorks.apply(this, arguments);
      try {
        if (bpSite && V3 && V3.box) {
          bpSite.fast = !!fast; bpSite.moK = 1; bpSite.wk = true;
          wkSpeedBar(V3.box);
          var me = bpSite, box = V3.box;
          (function tick() {
            if (bpSite !== me || !V3 || V3.box !== box) {
              all(".v3-speed, .v3-phase", box).forEach(function (b) { b.remove(); });
              return;
            }
            var plan = WK.plan && WK.plan.bp === me ? WK.plan : null;
            if (plan && plan.ok && me.T) {
              var now = performance.now(), T = Math.max(0, Math.min(1, (now - me.start) / me.ms)) * me.T;
              // (the site's clock is its calendar's once that is made -- nights, weekends, rain: the work's own time from it)
              wkPhaseShow(wkPhaseAt(plan, plan.done ? wkCalWork(T, plan) : T));
            }
            requestAnimationFrame(tick);
          })();
        }
      } catch (e) { /* as it was */ }
      return out;
    };
  }
  // [ and ] -- slower, faster -- while it goes up (not while typing)
  document.addEventListener("keydown", function (ev) {
    if (!bpSite || !bpSite.wk || ev.ctrlKey || ev.metaKey || ev.altKey || (ev.key !== "[" && ev.key !== "]")) { return; }
    if (ev.target && ev.target.closest && ev.target.closest("input, textarea, select, [contenteditable]")) { return; }
    ev.preventDefault();
    wkSpeedStep(ev.key === "]" ? 1 : -1);
  }, true);
  function wkPhaseAt(plan, T) {
    var best = null;
    plan.say.forEach(function (s) { if (T >= s.t0 && T < s.t1 && (!best || s.t0 >= best.t0)) { best = s; } });
    return best ? TXT[best.key] || "" : "";
  }

  // ---- small sums ---------------------------------------------------------------------------------
  function wkLen(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1], (b[2] || 0) - (a[2] || 0)); }
  function wkLerp(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * k]; }
  function wkClamp(k) { return Math.max(0, Math.min(1, k)); }
  function wkSmooth(k) { k = wkClamp(k); return k * k * (3 - 2 * k); }
  function wkRand(seed) { return typeof gl3Rand === "function" ? gl3Rand(seed) : Math.random; }
  // a line of points, measured: where along it, and which way
  function wkPolyline(pts) {
    var cum = [0];
    for (var i = 1; i < pts.length; i++) { cum.push(cum[i - 1] + wkLen(pts[i - 1], pts[i])); }
    return { pts: pts, cum: cum, len: cum[cum.length - 1] };
  }
  function wkAlong(L, s) {
    var pts = L.pts, cum = L.cum;
    if (pts.length === 1 || s <= 0) { return { p: pts[0].slice(), i: 0 }; }
    if (s >= L.len) { return { p: pts[pts.length - 1].slice(), i: pts.length - 2 }; }
    var lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (cum[mid] <= s) { lo = mid; } else { hi = mid; } }
    var k = (s - cum[lo]) / ((cum[hi] - cum[lo]) || 1);
    return { p: wkLerp(pts[lo], pts[hi], k), i: lo };
  }

  // ---- the site ---------------------------------------------------------------------------------
  // In the street's own numbers (moStreet, 40-movein.js): x along it, y out
  // toward it, the lot's front edge at y = hy, the kerb at S.kerb.
  function wkSite(ctx, model) {
    var P = ctx.P, walk = v3Ground(), floors = walk.floors || [], door = walk.cells ? moFrontDoor(ctx, walk) : null;
    var S = moStreet(ctx, door), lot = typeof houseStreetLot === "function" ? houseStreetLot() : null;
    var site = { ctx: ctx, P: P, walk: walk, floors: floors, door: door, S: S, lot: lot, model: model };
    // the storeys: index i (ctx.zs), its rooms, its outline
    site.levels = ctx.zs.map(function (z, i) {
      var rooms = (ctx.byLevel[i] || []).map(function (o) {
        var r = o.r, t = (r.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
        var poly = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) {
          var lx = q[0] * r.w / 2, ly = q[1] * r.h / 2;
          return [r.x + o.dx + lx * c - ly * s, r.y + o.dy + lx * s + ly * c];
        });
        return { r: r, dx: o.dx, dy: o.dy, z: o.z, ceil: o.ceil, poly: poly };
      });
      var top = rooms.reduce(function (m, o) { return Math.max(m, o.z + o.ceil); }, z + 2.6 * P);
      var fl = floors.filter(function (f) { return Math.abs(f.z - z) < 2; })[0] || null;
      return { i: i, z: z, rooms: rooms, top: top, floor: fl };
    });
    site.ground = Math.max(0, ctx.zs.indexOf(0));
    site.stairs = [];
    (walk.links || []).forEach(function (pair) {
      var A = pair[0], B = pair[1], fa = floors.length ? floorAt(floors, A.x, A.y) : null, fb = floors.length ? floorAt(floors, B.x, B.y) : null;
      if (!fa || !fb) { return; }
      var ia = ctx.zs.indexOf(fa.z), ib = ctx.zs.indexOf(fb.z);
      if (ia < 0 || ib < 0 || Math.abs(ia - ib) !== 1) { return; }
      var lo = ia < ib ? [A, fa] : [B, fb], hi = ia < ib ? [B, fb] : [A, fa];
      site.stairs.push({ lo: Math.min(ia, ib), hi: Math.max(ia, ib), foot: [lo[0].x + lo[1].dx, lo[0].y + lo[1].dy, lo[1].z], top: [hi[0].x + hi[1].dx, hi[0].y + hi[1].dy, hi[1].z] });
    });
    site.cellPx = WK_CELL * P;
    // the lanes the site's traffic keeps to: out past anything parked at the kerb
    site.lanes = { w: S.kerb + 4.3 * P, e: S.kerb + 5.4 * P };
    wkGrid(site);
    return site;
  }
  // the site's squares: the lot, the pavement and the road; the building's
  // footprint; what stands about (trees, a shed, cars parked along the kerb)
  function wkGrid(site) {
    var P = site.P, S = site.S, lot = site.lot, c = site.cellPx;
    var hw = lot ? lot.w / 2 : Math.max(Math.abs(S.box[0]), Math.abs(S.box[1])) + 15 * P;
    var back = lot ? -lot.h / 2 : S.box[2] - 15 * P, front = S.kerb + 9 * P;
    var reach = Math.max(hw + 30 * P, S.far || 0);
    var G = { x0: -reach, y0: back - 1 * P, c: c };
    G.cols = Math.ceil((2 * reach) / c); G.rows = Math.ceil((front - G.y0) / c);
    var n = G.cols * G.rows, t = new Uint8Array(n);
    for (var r = 0; r < G.rows; r++) {
      for (var k = 0; k < G.cols; k++) {
        var lx = G.x0 + (k + 0.5) * c, ly = G.y0 + (r + 0.5) * c, v;
        if (ly > S.kerb + (typeof streetRoadPx === "function" ? streetRoadPx() : 7 * P)) { v = WK_OFF; }   // (the far pavement and what is past it: 40-verge.js)
        else if (ly > S.kerb) { v = WK_ROAD; }
        else if (ly > S.hy) { v = WK_WALKWAY; }
        else if (Math.abs(lx) <= hw && ly >= back) { v = WK_LOT; }
        else { v = WK_OFF; }
        t[r * G.cols + k] = v;
      }
    }
    G.t = t;
    site.G = G;
    function mark(poly, v, only) {
      // a shape's squares (world points): every square whose middle is in it
      var loc = poly.map(function (p) { return S.L(p[0], p[1]); });
      var bx = [Infinity, -Infinity, Infinity, -Infinity];
      loc.forEach(function (q) { bx[0] = Math.min(bx[0], q[0]); bx[1] = Math.max(bx[1], q[0]); bx[2] = Math.min(bx[2], q[1]); bx[3] = Math.max(bx[3], q[1]); });
      var k0 = Math.max(0, Math.floor((bx[0] - G.x0) / c)), k1 = Math.min(G.cols - 1, Math.floor((bx[1] - G.x0) / c));
      var r0 = Math.max(0, Math.floor((bx[2] - G.y0) / c)), r1 = Math.min(G.rows - 1, Math.floor((bx[3] - G.y0) / c));
      for (var rr = r0; rr <= r1; rr++) {
        for (var kk = k0; kk <= k1; kk++) {
          var px = G.x0 + (kk + 0.5) * c, py = G.y0 + (rr + 0.5) * c;
          if (!wkInPoly(loc, px, py)) { continue; }
          var i = rr * G.cols + kk;
          if (only && only.indexOf(t[i]) < 0) { continue; }
          t[i] = v;
          site.gridGen = (site.gridGen || 0) + 1;
        }
      }
    }
    site.mark = mark;
    // what lies flat, hard: driven on
    hand.nodes.forEach(function (n) {
      if (!WK_HARD[n.kind] || cnOurs(site.ctx, n)) { return; }
      mark(wkNodePoly(n, 0), WK_PAVED, [WK_LOT]);
    });
    // what stands on the lot, and its room round it
    hand.nodes.forEach(function (n) {
      if (cnOurs(site.ctx, n) || WK_FLAT[n.kind] || n.kind === "i_lot" || n.kind === "i_floor" || n.kind === "i_zone" || n.kind === "i_room") { return; }
      var grow = /tree|palm|pine|oak/.test(n.kind) ? Math.max(0.6 * P, Math.max(n.w || 0, n.h || 0) * 0.15) : 0.3 * P;
      mark(wkNodePoly(n, grow), WK_THING);
    });
    // the building: every storey's rooms, the basement's too
    site.levels.forEach(function (L) { L.rooms.forEach(function (o) { mark(o.poly, WK_HOUSE); }); });
    // cars parked along the kerb (40-site.js); the lamps, poles and trees along the pavement
    if (lot && typeof lwCurbList === "function") {
      try {
        var free = wkCurbFree();
        // (2026-10-05) the site is laid out before bpSite.wk is set -- but it is laid out only for the works, whose
        // frontage is coned off: no cars there then (none are drawn there), not cars to drive round or count as hit
        var lotF = !free && typeof houseStreetLot === "function" ? houseStreetLot() : null;
        if (lotF) { free = [-lotF.w / 2 - 24 * FLOOR_PX, lotF.w / 2 + 24 * FLOOR_PX]; }
        lwCurbList(lot, function (p) { return S.L(p[0], p[1]); }).forEach(function (b) {
          if (!b.car) { return; }
          if (free && b.x1 > free[0] && b.x0 < free[1]) { return; }       // (coned off for the works)
          wkMarkLocal(site, [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]], WK_CAR);
        });
      } catch (e) { /* none parked */ }
    }
    // (on the pavement and the grass beside it -- not out into the road: a lamp's square reaching the
    // road's first row left no stretch of kerb long enough for a lorry)
    wkKerbThings(site).forEach(function (q) {
      wkMarkLocal(site, [[q.x - q.r, q.y - q.r], [q.x + q.r, q.y - q.r], [q.x + q.r, q.y + q.r], [q.x - q.r, q.y + q.r]], WK_THING, [WK_WALKWAY, WK_LOT, WK_PAVED]);
    });
  }
  // The kerb's parking bays in front of the lot and either side of it (lot-local x range),
  // kept empty for the lorries while a building goes up -- 40-site.js leaves its parked
  // cars out of them (and may cone them off) while this says so; null when nothing is built.
  function wkCurbFree() {
    if (!bpSite || !bpSite.wk) { return null; }
    var lot = typeof houseStreetLot === "function" ? houseStreetLot() : null;
    if (!lot) { return null; }
    return [-lot.w / 2 - 24 * FLOOR_PX, lot.w / 2 + 24 * FLOOR_PX];
  }
  function wkMarkLocal(site, loc, v, only) {
    var S = site.S;
    site.mark(loc.map(function (q) { return S.W(q[0], q[1]); }), v, only);
  }
  function wkInPoly(poly, x, y) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) { inside = !inside; }
    }
    return inside;
  }
  function wkNodePoly(n, grow) {
    var t = (n.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), hw = (n.w || 20) / 2 + grow, hh = (n.h || 20) / 2 + grow;
    var f = typeof floorsOf === "function" && floorsOf().length ? floorAt(floorsOf(), n.x, n.y) : null, dx = f ? f.dx : 0, dy = f ? f.dy : 0;
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(function (q) { return [n.x + dx + q[0] * c - q[1] * s, n.y + dy + q[0] * s + q[1] * c]; });
  }
  // the lamps, the poles and the trees along the pavement (lot-local), as 38-view3d-gl.js and 40-verge.js put them
  function wkKerbThings(site) {
    var P = site.P, S = site.S, lot = site.lot, out = [];
    if (!lot) { return out; }
    if (typeof streetKerbThings === "function") {
      try { return streetKerbThings(lot) || []; } catch (e) { out = []; }
    }
    var every = 18 * P, shift = typeof worldLampShift === "function" ? worldLampShift() : every / 2, reach = 80 * P;
    var lamps = typeof worldLampKind !== "function" || worldLampKind() !== "none";
    if (lamps) {
      for (var x = shift - Math.ceil(reach / every) * every; x < reach; x += every) { out.push({ x: x, y: S.kerb - 0.35 * P, r: 0.5 * P, kind: "lamp" }); }
    }
    try {
      if (typeof powerPoles === "function" && typeof powerKind === "function" && powerKind() === "front") {
        powerPoles(powerFrame(lot), false).forEach(function (p) { out.push({ x: p.lx, y: S.kerb - 0.35 * P, r: 0.6 * P, kind: "pole" }); });
      }
    } catch (e) { /* no poles */ }
    if (typeof streetVerge === "function" && streetVerge() === "trees") {
      // (every so often along the strip: kept off the strip altogether where none is known)
      for (var tx = -reach; tx < reach; tx += 1.5 * P) { out.push({ x: tx, y: S.hy + (S.kerb - S.hy) * 0.7, r: 0.8 * P, kind: "tree" }); }
    }
    return out;
  }
  // the square under a point (lot-local), and back
  function wkCell(site, lx, ly) {
    var G = site.G, k = Math.floor((lx - G.x0) / G.c), r = Math.floor((ly - G.y0) / G.c);
    if (k < 0 || r < 0 || k >= G.cols || r >= G.rows) { return -1; }
    return r * G.cols + k;
  }
  function wkCellMid(site, i) { var G = site.G; return [G.x0 + (i % G.cols + 0.5) * G.c, G.y0 + (Math.floor(i / G.cols) + 0.5) * G.c]; }
  // whether a rectangle (lot-local: middle, half its length along `ang`, half its width) is clear
  function wkRectFree(site, cx, cy, hl, hw, ang, ok, busy, t0, t1) {
    var G = site.G, c = Math.cos(ang), s = Math.sin(ang), r = Math.hypot(hl, hw);
    var k0 = Math.max(0, Math.floor((cx - r - G.x0) / G.c)), k1 = Math.min(G.cols - 1, Math.floor((cx + r - G.x0) / G.c));
    var r0 = Math.max(0, Math.floor((cy - r - G.y0) / G.c)), r1 = Math.min(G.rows - 1, Math.floor((cy + r - G.y0) / G.c));
    // (within the site's squares: its own corners, not the circle round it -- a lorry along the kerb is long and thin)
    var ex = Math.abs(c) * hl + Math.abs(s) * hw, ey = Math.abs(s) * hl + Math.abs(c) * hw;
    if (cx - ex < G.x0 || cx + ex > G.x0 + G.cols * G.c || cy - ey < G.y0 || cy + ey > G.y0 + G.rows * G.c) { return false; }
    for (var rr = r0; rr <= r1; rr++) {
      for (var kk = k0; kk <= k1; kk++) {
        var px = G.x0 + (kk + 0.5) * G.c - cx, py = G.y0 + (rr + 0.5) * G.c - cy;
        var u = px * c + py * s, v = -px * s + py * c;
        if (Math.abs(u) > hl || Math.abs(v) > hw) { continue; }
        if (ok.indexOf(G.t[rr * G.cols + kk]) < 0) { return false; }
      }
    }
    // (and kept apart from any other machine there then)
    if (busy) {
      for (var b = 0; b < busy.length; b++) {
        var o = busy[b];
        if (o.t1 <= t0 || o.t0 >= t1) { continue; }
        var q = o.rect, rr = Math.hypot(q[2], q[3]);
        if (Math.abs(q[0] - cx) > rr + r || Math.abs(q[1] - cy) > rr + r) { continue; }
        if (wkRectsMeet([cx, cy, hl, hw, ang], q)) { return false; }
      }
    }
    return true;
  }
  function wkRectsMeet(a, b) {
    // two turned rectangles: [cx, cy, half length, half width, ang] -- apart along one of their four sides' ways
    function axes(q) { return [[Math.cos(q[4]), Math.sin(q[4])], [-Math.sin(q[4]), Math.cos(q[4])]]; }
    function proj(q, ax) {
      var c = q[0] * ax[0] + q[1] * ax[1], A = axes(q);
      var e = Math.abs(A[0][0] * ax[0] + A[0][1] * ax[1]) * q[2] + Math.abs(A[1][0] * ax[0] + A[1][1] * ax[1]) * q[3];
      return [c - e, c + e];
    }
    var all = axes(a).concat(axes(b));
    for (var i = 0; i < all.length; i++) {
      var p = proj(a, all[i]), q = proj(b, all[i]);
      if (p[1] < q[0] || q[1] < p[0]) { return false; }
    }
    return true;
  }

  // ---- the ways round the site, on foot ---------------------------------------------------------------
  // On the ground: across the squares (round what stands about, round the
  // building once its walls are up, through its front door); inside: the
  // walk plan's own way (38-walk.js) -- through the wall lines too before
  // the walls are up; up and down: the ladder at the scaffold (the pit's,
  // down into a basement) before the stairs are in, then the stairs.
  function wkGridWay(site, a, b, houseOpen) {
    var G = site.G, from = wkCell(site, a[0], a[1]), to = wkCell(site, b[0], b[1]);
    if (from < 0 || to < 0) { return [a, b]; }
    // (the same squares to the same squares: the way worked out before)
    var cache = site.gridCache || (site.gridCache = new Map()), ck = from + ">" + to + (houseOpen ? "o" : "c") + (site.gridGen || 0);
    var kept = cache.get(ck);
    if (kept) { var cp = kept.map(function (q) { return q.slice(); }); cp[0] = a; cp[cp.length - 1] = b; return cp; }
    var way = wkGridWayRaw(site, a, b, houseOpen, from, to);
    if (cache.size > 20000) { cache.clear(); }
    cache.set(ck, way.map(function (q) { return q.slice(); }));
    return way;
  }
  function wkGridWayRaw(site, a, b, houseOpen, from, to) {
    var G = site.G;
    var t = G.t, n = G.cols * G.rows;
    function open(i) { var v = t[i]; return v === WK_LOT || v === WK_ROAD || v === WK_WALKWAY || v === WK_PAVED || v === WK_STACK || v === WK_YARD || (houseOpen && v === WK_HOUSE) || i === from || i === to; }
    // (straight there, if it can be)
    if (wkGridLine(site, a, b, open)) { return [a, b]; }
    // (none, if the two are on runs of open ground never joined: given up at once)
    var lab = wkParts(site, houseOpen ? "walkO" : "walkC", function (i) { var v = t[i]; return v === WK_LOT || v === WK_ROAD || v === WK_WALKWAY || v === WK_PAVED || v === WK_STACK || v === WK_YARD || (houseOpen && v === WK_HOUSE); });
    if (!wkPartsMeet(site, lab, from, to)) {
      wkGridWayRaw.n = (wkGridWayRaw.n || 0) + 1; wkGridWayRaw.fail = (wkGridWayRaw.fail || 0) + 1; wkGridWayRaw.cut = (wkGridWayRaw.cut || 0) + 1;
      return [a, b];
    }
    var A = wkAsBegin(n), run = A.run, shut = A.shut;
    wkAsSet(A, from, 0, -1); wkAsPush(A, 0, from);
    var tc = to % G.cols, tr = Math.floor(to / G.cols), steps = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
    var found = false, guard = 0;
    while (A.hn && guard < 60000) {
      var i = wkAsPop(A);
      if (i === to) { found = true; break; }
      if (shut[i] === run) { continue; }
      shut[i] = run; guard++;
      var c0 = i % G.cols, r0 = Math.floor(i / G.cols), base = A.cost[i];
      for (var s = 0; s < 8; s++) {
        var c = c0 + steps[s][0], r = r0 + steps[s][1];
        if (c < 0 || r < 0 || c >= G.cols || r >= G.rows) { continue; }
        var j = r * G.cols + c;
        if (!open(j)) { continue; }
        if (steps[s][0] && steps[s][1] && (!open(r0 * G.cols + c) || !open(r * G.cols + c0))) { continue; }
        var to2 = base + steps[s][2];
        if (to2 < wkAsCost(A, j)) { wkAsSet(A, j, to2, i); wkAsPush(A, to2 + 1.4 * Math.hypot(c - tc, r - tr), j); }
      }
    }
    wkGridWayRaw.n = (wkGridWayRaw.n || 0) + 1; wkGridWayRaw.steps = (wkGridWayRaw.steps || 0) + guard;
    if (!found) { wkGridWayRaw.fail = (wkGridWayRaw.fail || 0) + 1; wkGridWayRaw.failSteps = (wkGridWayRaw.failSteps || 0) + guard; return [a, b]; }
    var cells = [];
    for (var at = to; at >= 0; at = A.back[at]) { cells.push(at); }
    cells.reverse();
    // straightened: as few straight walks as stay on open squares
    var pts = [a], cur = a, k2 = 0;
    while (k2 < cells.length - 1) {
      var far = k2 + 1;
      for (var q = cells.length - 1; q > k2 + 1; q--) {
        var m = wkCellMid(site, cells[q]);
        if (wkGridLine(site, cur, m, open)) { far = q; break; }
      }
      var mid = wkCellMid(site, cells[far]);
      if (far === cells.length - 1) { break; }
      pts.push(mid); cur = mid; k2 = far;
    }
    pts.push(b);
    return pts;
  }
  function wkGridLine(site, a, b, open) {
    var G = site.G, d = Math.hypot(b[0] - a[0], b[1] - a[1]), steps = Math.max(1, Math.ceil(d / (G.c * 0.5)));
    for (var k = 0; k <= steps; k++) {
      var i = wkCell(site, a[0] + (b[0] - a[0]) * k / steps, a[1] + (b[1] - a[1]) * k / steps);
      if (i < 0 || !open(i)) { return false; }
    }
    return true;
  }
  // ---- the searches' own memory --------------------------------------------------------------------------
  // (2026-10-05, "it can not freeze the site": each way worked out made two arrays the size of
  // the whole site, and a pair -- an object -- for every square it looked at, thousands of ways a
  // timetable; the machines' search had no list of squares done, and went over them again and
  // again.  Now one set of arrays kept and used again, a run number marking what this search has
  // touched, its heap in typed arrays.)
  var WK_AS = { n: 0, run: 0, cost: null, back: null, seen: null, shut: null, hk: new Float64Array(4096), hv: new Int32Array(4096), hn: 0 };
  function wkAsBegin(n) {
    var A = WK_AS;
    if (A.n < n || A.run > 4e9) {
      A.n = Math.max(n, A.n); A.cost = new Float64Array(A.n); A.back = new Int32Array(A.n); A.seen = new Uint32Array(A.n); A.shut = new Uint32Array(A.n); A.run = 0;
    }
    A.run++; A.hn = 0;
    return A;
  }
  // Which squares can be got to from which: each run of open squares numbered, once for each
  // change to the site.  (Two ways in three asked for went between runs never joined -- into the
  // building before its door was open, onto what is stacked -- and each was searched for over the
  // whole of the site before it was given up: millions of squares a timetable.)
  function wkParts(site, key, isOpen) {
    var store = site.parts || (site.parts = {}), gen = site.gridGen || 0, got = store[key];
    if (got && got.gen === gen) { return got.lab; }
    var G = site.G, cols = G.cols, n = cols * G.rows, lab = new Int32Array(n), q = new Int32Array(n), id = 0;
    for (var s0 = 0; s0 < n; s0++) {
      if (lab[s0] || !isOpen(s0)) { continue; }
      id++; lab[s0] = id;
      var h = 0, tl = 0;
      q[tl++] = s0;
      while (h < tl) {
        var i = q[h++], c = i % cols;
        // (side by side only: a corner is cut only where both squares beside it are open, so the runs are the same)
        if (c > 0 && !lab[i - 1] && isOpen(i - 1)) { lab[i - 1] = id; q[tl++] = i - 1; }
        if (c < cols - 1 && !lab[i + 1] && isOpen(i + 1)) { lab[i + 1] = id; q[tl++] = i + 1; }
        if (i >= cols && !lab[i - cols] && isOpen(i - cols)) { lab[i - cols] = id; q[tl++] = i - cols; }
        if (i + cols < n && !lab[i + cols] && isOpen(i + cols)) { lab[i + cols] = id; q[tl++] = i + cols; }
      }
    }
    store[key] = { gen: gen, lab: lab };
    return lab;
  }
  // whether a way from square a to square b can be: a run each is in, or -- a square not open
  // itself, where a way may start or end all the same -- the runs round it
  function wkPartsMeet(site, lab, a, b) {
    var G = site.G, cols = G.cols, rows = G.rows;
    function near(i) {
      if (lab[i]) { return [lab[i]]; }
      var c = i % cols, r = (i - c) / cols, out = [];
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          var rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) { continue; }
          var v = lab[rr * cols + cc];
          if (v && out.indexOf(v) < 0) { out.push(v); }
        }
      }
      return out;
    }
    var x = near(a), y = near(b);
    for (var k = 0; k < x.length; k++) { if (y.indexOf(x[k]) >= 0) { return true; } }
    return false;
  }
  function wkAsCost(A, i) { return A.seen[i] === A.run ? A.cost[i] : Infinity; }
  function wkAsSet(A, i, c, from) { A.seen[i] = A.run; A.cost[i] = c; A.back[i] = from; }
  function wkAsPush(A, key, val) {
    if (A.hn === A.hk.length) {
      var k2 = new Float64Array(A.hn * 2), v2 = new Int32Array(A.hn * 2);
      k2.set(A.hk); v2.set(A.hv); A.hk = k2; A.hv = v2;
    }
    var K = A.hk, V = A.hv, i = A.hn++;
    while (i > 0) { var up = (i - 1) >> 1; if (K[up] <= key) { break; } K[i] = K[up]; V[i] = V[up]; i = up; }
    K[i] = key; V[i] = val;
  }
  function wkAsPop(A) {
    var K = A.hk, V = A.hv, top = V[0], n = --A.hn;
    if (n > 0) {
      var key = K[n], val = V[n], i = 0;
      for (;;) {
        var l = 2 * i + 1;
        if (l >= n) { break; }
        var m = l + 1 < n && K[l + 1] < K[l] ? l + 1 : l;
        if (K[m] >= key) { break; }
        K[i] = K[m]; V[i] = V[m]; i = m;
      }
      K[i] = key; V[i] = val;
    }
    return top;
  }
  function wkPush(h, v) {
    h.push(v);
    for (var k = h.length - 1; k > 0;) { var up = (k - 1) >> 1; if (h[up][0] <= h[k][0]) { break; } var tmp = h[up]; h[up] = h[k]; h[k] = tmp; k = up; }
  }
  function wkPop(h) {
    var top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (var k = 0;;) {
        var l = 2 * k + 1, r = l + 1, m = k;
        if (l < h.length && h[l][0] < h[m][0]) { m = l; }
        if (r < h.length && h[r][0] < h[m][0]) { m = r; }
        if (m === k) { break; }
        var tmp = h[m]; h[m] = h[k]; h[k] = tmp; k = m;
      }
    }
    return top;
  }
  // a world point's storey (index into site.levels) and whether it is in the building
  function wkLevelOf(site, p) {
    var z = p[2] || 0, best = site.ground, d = Infinity;
    site.levels.forEach(function (L, i) { var e = Math.abs(z - L.z); if (e < d) { d = e; best = i; } });
    return best;
  }
  function wkInside(site, p, li) {
    var L = site.levels[li];
    return !!L && L.rooms.some(function (o) { return wkInPoly(o.poly, p[0], p[1]); });
  }
  // ---- room to room: the doors between --------------------------------------------------------------
  // A storey's rooms and the doors that join them, each door a point a
  // step either side of it; a way from room to room through the fewest
  // metres of doors -- straight across each room (empty while it is built).
  function wkRoomGraph(site, li) {
    var cache = site.graphs || (site.graphs = {});
    if (cache[li]) { return cache[li]; }
    var L = site.levels[li], plan = site.walk, P = site.P, floors = site.floors, rooms = L ? L.rooms : [], doors = [];
    (plan && plan.joins || []).forEach(function (j) {
      if (j.locked || j.rooms.length !== 2) { return; }
      var d = j.door, f = floors.length ? floorAt(floors, d.x, d.y) : null;
      if (f ? Math.abs(f.z - L.z) > 2 : li !== site.ground) { return; }
      var ia = -1, ib = -1;
      rooms.forEach(function (o, k) { if (o.r === j.rooms[0]) { ia = k; } if (o.r === j.rooms[1]) { ib = k; } });
      if (ia < 0 || ib < 0) { return; }
      var p = [d.x + (f ? f.dx : 0), d.y + (f ? f.dy : 0)];
      // a step into each room, square to the wall the door is in
      var ca = [rooms[ia].r.x + rooms[ia].dx, rooms[ia].r.y + rooms[ia].dy], cb = [rooms[ib].r.x + rooms[ib].dx, rooms[ib].r.y + rooms[ib].dy];
      var t = (d.turn || 0) * Math.PI / 180, nrm = [-Math.sin(t), Math.cos(t)];
      if (nrm[0] * (ca[0] - p[0]) + nrm[1] * (ca[1] - p[1]) < 0) { nrm = [-nrm[0], -nrm[1]]; }
      var step = 0.45 * P;
      doors.push({ id: d.id, a: ia, b: ib, pa: [p[0] + nrm[0] * step, p[1] + nrm[1] * step, L.z], pb: [p[0] - nrm[0] * step, p[1] - nrm[1] * step, L.z], p: [p[0], p[1], L.z] });
      void cb;
    });
    var g = { rooms: rooms, doors: doors, L: L, paths: {} };
    cache[li] = g;
    return g;
  }
  function wkRoomOf(g, p) {
    for (var k = 0; k < g.rooms.length; k++) { if (wkInPoly(g.rooms[k].poly, p[0], p[1])) { return k; } }
    var best = -1, bd = Infinity;
    g.rooms.forEach(function (o, k) { var d = Math.hypot(o.r.x + o.dx - p[0], o.r.y + o.dy - p[1]); if (d < bd) { bd = d; best = k; } });
    return best;
  }
  // the doors from room ra to room rb, in order, each as [into-from-side point, door, out-side point]
  function wkRoomPath(g, ra, rb) {
    var key = ra + ">" + rb;
    if (g.paths[key] !== undefined) { return g.paths[key]; }
    var n = g.rooms.length, dist = new Array(n).fill(Infinity), via = new Array(n).fill(null), done = new Array(n).fill(false);
    function mid(k) { var o = g.rooms[k]; return [o.r.x + o.dx, o.r.y + o.dy]; }
    dist[ra] = 0;
    for (var it = 0; it < n; it++) {
      var u = -1;
      for (var k = 0; k < n; k++) { if (!done[k] && dist[k] < Infinity && (u < 0 || dist[k] < dist[u])) { u = k; } }
      if (u < 0 || u === rb) { break; }
      done[u] = true;
      g.doors.forEach(function (d) {
        var v = d.a === u ? d.b : d.b === u ? d.a : -1;
        if (v < 0 || done[v]) { return; }
        var m = mid(u), c = Math.hypot(d.p[0] - m[0], d.p[1] - m[1]) + 0.5;
        if (dist[u] + c < dist[v]) { dist[v] = dist[u] + c; via[v] = { from: u, door: d }; }
      });
    }
    var out = null;
    if (ra === rb) { out = []; }
    else if (via[rb]) {
      out = [];
      for (var at = rb; at !== ra; at = via[at].from) {
        var d = via[at].door, fromA = d.a === via[at].from;
        out.unshift(fromA ? [d.pa, d.p, d.pb] : [d.pb, d.p, d.pa]);
      }
    }
    g.paths[key] = out;
    return out;
  }
  // the walk plan's way on one storey (world points in, world points out)
  function wkRoomsWay(site, li, a, b, wallsOpen) {
    // (room to room through the doors: straight across each room)
    var g = wkRoomGraph(site, li);
    if (g.rooms.length) {
      var ra = wkRoomOf(g, a), rb = wkRoomOf(g, b);
      if (wallsOpen || ra === rb) { return [a.slice(), b.slice()]; }
      var via = ra >= 0 && rb >= 0 ? wkRoomPath(g, ra, rb) : null;
      if (via) {
        var out = [a.slice()];
        via.forEach(function (d) { out.push(d[0].slice(), d[1].slice(), d[2].slice()); });
        out.push(b.slice());
        return out;
      }
    }
    return wkRoomsWayCells(site, li, a, b, wallsOpen);
  }
  function wkRoomsWayCells(site, li, a, b, wallsOpen) {
    var L = site.levels[li], plan = site.walk;
    if (!plan || !plan.cells || !L || !L.floor) { return [a, b]; }
    var dx = L.floor.dx || 0, dy = L.floor.dy || 0;
    var s = cellOf(plan, a[0] - dx, a[1] - dy), e = cellOf(plan, b[0] - dx, b[1] - dy);
    var cols = plan.cols, blk = function (i) { return Math.floor((i % cols) / 3) + "," + Math.floor(Math.floor(i / cols) / 3); };
    var cache = site.roomsCache || (site.roomsCache = new Map()), ck = li + ":" + blk(s) + ">" + blk(e) + (wallsOpen ? "o" : "c");
    var kept = cache.get(ck);
    if (kept) { var cp = kept.map(function (q) { return [q[0], q[1], L.z]; }); cp[0] = a.slice(); cp[cp.length - 1] = b.slice(); return cp; }
    var got = wkRoomsWayRaw(site, li, a, b, wallsOpen, L, plan, dx, dy, s, e);
    if (cache.size > 20000) { cache.clear(); }
    cache.set(ck, got.map(function (q) { return q.slice(); }));
    return got;
  }
  function wkRoomsWayRaw(site, li, a, b, wallsOpen, L, plan, dx, dy, s, e) {
    var cells = plan.cells, through = function (i) { return cells[i] === 2 || (wallsOpen && cells[i] === 1); };
    // (straight there, if nothing is in the way)
    if (typeof clearLine === "function" && clearLine(plan, s, e)) { return [a.slice(), b.slice()]; }
    var way = wkPlanWay(plan, s, e, through);
    if (!way) { return [a, b]; }
    var pts = (typeof moPts === "function" ? moPts(plan, way) : walkPoints(plan, way)).map(function (q) { return [q[0] + dx, q[1] + dy, L.z]; });
    if (pts.length) { pts[0] = a.slice(); pts[pts.length - 1] = b.slice(); }
    return pts.length ? pts : [a, b];
  }
  // the walk plan's way, as 40-movein.js's moWay (dearer beside the walls) but
  // looking toward where it is going first (A*): moWay looked everywhere
  // round, every time, and the site's timetable asks thousands of these
  function wkPlanWay(plan, from, to, through) {
    var cols = plan.cols, rows = plan.rows, cells = plan.cells, n = cols * rows;
    if (from < 0 || to < 0 || from >= n || to >= n) { return null; }
    var D = typeof moClear === "function" ? moClear(plan) : null, NEAR = typeof MO_NEAR !== "undefined" ? MO_NEAR : [0, 0, 0, 0];
    function open(i) { return cells[i] === 0 || cells[i] === 3 || i === from || i === to || (through && through(i)); }
    var A = wkAsBegin(n), run = A.run, shut = A.shut;
    wkAsSet(A, from, 0, -1); wkAsPush(A, 0, from);
    var tc = to % cols, tr = Math.floor(to / cols), steps = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
    var found = false, guard = 0;
    while (A.hn && guard < 30000) {
      var i = wkAsPop(A);
      if (i === to) { found = true; break; }
      if (shut[i] === run) { continue; }
      shut[i] = run; guard++;
      var c0 = i % cols, r0 = Math.floor(i / cols), base = A.cost[i];
      for (var s = 0; s < 8; s++) {
        var c = c0 + steps[s][0], r = r0 + steps[s][1];
        if (c < 0 || r < 0 || c >= cols || r >= rows) { continue; }
        var j = r * cols + c;
        if (!open(j)) { continue; }
        if (steps[s][0] && steps[s][1] && (!open(r0 * cols + c) || !open(r * cols + c0))) { continue; }
        var to2 = base + steps[s][2] * (1 + (D ? NEAR[D[j]] || 0 : 0));
        if (to2 < wkAsCost(A, j)) { wkAsSet(A, j, to2, i); wkAsPush(A, to2 + 2.2 * Math.hypot(c - tc, r - tr), j); }   // (leaning hard toward the goal)
      }
    }
    wkPlanWay.n = (wkPlanWay.n || 0) + 1; wkPlanWay.steps = (wkPlanWay.steps || 0) + guard;
    if (!found) { wkPlanWay.fail = (wkPlanWay.fail || 0) + 1; wkPlanWay.failSteps = (wkPlanWay.failSteps || 0) + guard; return null; }
    var way = [];
    for (var at = to; at >= 0; at = A.back[at]) { way.push(at); }
    return way.reverse();
  }
  // A way from a to b (world [x, y, z]) at the site's time T.
  function wkRoute(plan, a, b, T) {
    var t0 = performance.now(), out2 = wkRouteRaw(plan, a, b, T);
    var st = plan.stats || (plan.stats = { routes: 0, routeMs: 0, grid: 0, rooms: 0 });
    st.routes++; st.routeMs += performance.now() - t0;
    return out2;
  }
  function wkRouteRaw(plan, a, b, T) {
    var site = plan.site, g0 = site.ground;
    // (up on the scaffold, or a lorry's bed: out of the building, off the ground -- climbed to from under it)
    function aloft(p) {
      if ((p[2] || 0) < 0.4 * site.P) { return false; }
      for (var i = 0; i < site.levels.length; i++) { if (wkInside(site, p, i)) { return false; } }
      return true;
    }
    var upA = aloft(a), upB = aloft(b);
    if (upA || upB) {
      var A2 = upA ? [a[0], a[1], site.levels[g0].z] : a, B2 = upB ? [b[0], b[1], site.levels[g0].z] : b;
      var mid = wkRouteRaw(plan, A2, B2, T);
      if (upA) { mid.unshift([a[0], a[1], a[2]]); }
      if (upB) { mid.push([b[0], b[1], b[2]]); }
      return mid;
    }
    var la = wkLevelOf(site, a), lb = wkLevelOf(site, b), g = site.ground;
    var ia = wkInside(site, a, la) || la !== g, ib = wkInside(site, b, lb) || lb !== g;
    var out = [];
    function add(pts) { pts.forEach(function (p) { var q = [p[0], p[1], p[2] === undefined ? 0 : p[2]]; if (!out.length || wkLen(out[out.length - 1], q) > 0.5) { out.push(q); } }); }
    var openHouse = !plan.closedAt || T < plan.closedAt;
    function ground(p, q) {
      var tg = performance.now();
      if (plan.stats) { plan.stats.grid++; }
      var A = site.S.L(p[0], p[1]), B = site.S.L(q[0], q[1]);
      var way = wkGridWay(site, A, B, openHouse);
      if (plan.stats) { plan.stats.gridMs = (plan.stats.gridMs || 0) + performance.now() - tg; if (way.length === 2) { plan.stats.straight = (plan.stats.straight || 0) + 1; } }
      return way.map(function (l, i) { var w = site.S.W(l[0], l[1]); return [w[0], w[1], i === 0 ? p[2] || 0 : i === way.length - 1 ? q[2] || 0 : site.levels[g].z]; });
    }
    function inside(li, p, q) {
      var tr = performance.now(), got = wkRoomsWay(site, li, p, q, T < (plan.wallsAt[li] || Infinity));
      if (plan.stats) { plan.stats.rooms++; plan.stats.roomsMs = (plan.stats.roomsMs || 0) + performance.now() - tr; }
      return got;
    }
    // on one storey, from p to q (each in the building or out of it)
    function across(L, p, pin, q, qin) {
      if (L !== g) { add(inside(L, p, q)); return; }
      if (!pin && !qin) { add(ground(p, q)); return; }
      var e = plan.entry ? plan.entry(L, T) : null;
      if (openHouse || !e) {
        // (before its outside walls stand: straight over the open slab or deck)
        if (pin && qin && !openHouse) { add(inside(L, p, q)); return; }
        add(ground(p, q)); return;
      }
      if (pin && qin) { add(inside(L, p, q)); return; }
      if (pin) { add(inside(L, p, e.in)); add([e.out]); add(ground(e.out, q)); return; }
      add(ground(p, e.out)); add([e.in]); add(inside(L, e.in, q));
    }
    // from one storey to the next: the stairs once they are in, or the ladder (from the ground)
    function link(L, M) {
      var st = site.stairs || [];
      if (plan.stairsAt && T >= plan.stairsAt) {
        for (var i = 0; i < st.length; i++) {
          var c = st[i];
          if (c.lo === Math.min(L, M) && c.hi === Math.max(L, M)) {
            return L < M ? { start: c.foot, startIn: true, pts: [c.foot, c.top], end: c.top, endIn: true }
                         : { start: c.top, startIn: true, pts: [c.top, c.foot], end: c.foot, endIn: true };
          }
        }
      }
      var lad = plan.ladder ? plan.ladder(L === g ? M : L, g) : null;
      if (!lad) { return null; }
      return L === g ? { start: lad.foot, startIn: false, pts: lad.pts, end: lad.top, endIn: true }
                     : { start: lad.top, startIn: true, pts: lad.pts.slice().reverse(), end: lad.foot, endIn: false };
    }
    var cur = a, curIn = ia, L = la, guard = 0;
    out.push([a[0], a[1], a[2] || 0]);
    while (L !== lb && guard++ < 8) {
      var stairs = plan.stairsAt && T >= plan.stairsAt && (site.stairs || []).length;
      var next = stairs ? (lb > L ? L + 1 : L - 1) : (L === g ? lb : g);
      var c = link(L, next);
      if (!c) { break; }
      across(L, cur, curIn, c.start, c.startIn);
      add(c.pts);
      cur = c.end; curIn = c.endIn; L = next;
    }
    across(L, cur, curIn, b, ib);
    return out;
  }

  // ---- the timetable: workers ---------------------------------------------------------------------------
  // Each worker's day as a list of spells: walking a way (carrying, or not),
  // or at a job (how they stand to it), or waiting.  Times in seconds.
  function wkWorker(plan, id, look) {
    var w = { id: id, look: look, segs: [], free: 0, at: plan.site ? plan.gate.slice() : [0, 0, 0] };
    plan.workers.push(w);
    return w;
  }
  function wkGo(plan, w, to, opt) {
    opt = opt || {};
    var t0 = Math.max(w.free, opt.after || 0);
    if (wkLen(w.at, to) < 0.2 * plan.site.P) { if (t0 > w.free) { wkWait(w, t0); } return w.free; }
    if (t0 > w.free) { wkWait(w, t0); }
    var pts = opt.straight ? [w.at.slice(), to.slice()] : wkRoute(plan, w.at, to, t0);
    if (pts.length < 2) { pts = [w.at.slice(), to.slice()]; }
    pts[0] = w.at.slice(); pts[pts.length - 1] = to.slice();
    var L = wkPolyline(pts), P = plan.site.P, sec = 0;
    for (var i = 1; i < pts.length; i++) {
      var dz = Math.abs((pts[i][2] || 0) - (pts[i - 1][2] || 0)), dh = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      sec += dz > dh ? dz / P / (plan.hoist && dz > 3 * P ? 2.2 : WK_CLIMB) : wkLen(pts[i - 1], pts[i]) / P / (opt.carry ? WK_CARRY : WK_WALK);
    }
    var seg = { t0: t0, t1: t0 + Math.max(0.3, sec), L: L, carry: opt.carry || null, pose: opt.pose || null };
    w.segs.push(seg);
    w.free = seg.t1; w.at = to.slice();
    return w.free;
  }
  // at work where they stand: facing `face` (radians), so long, so
  function wkDo(w, dur, pose, face, opt) {
    opt = opt || {};
    var t0 = Math.max(w.free, opt.after || 0);
    if (t0 > w.free) { wkWait(w, t0); }
    var seg = { t0: t0, t1: t0 + dur, at: w.at.slice(), pose: pose || "stand", face: face, carry: opt.carry || null, hold: opt.hold || null };
    w.segs.push(seg);
    w.free = seg.t1;
    return seg;
  }
  function wkWait(w, until, face) {
    if (until <= w.free + 1e-6) { return; }
    w.segs.push({ t0: w.free, t1: until, at: w.at.slice(), pose: "stand", face: face === undefined ? null : face });
    w.free = until;
  }
  // the ones free soonest (nearest, among those free together)
  function wkPick(plan, n, near, list) {
    var pool = (list || plan.workers).slice();
    pool.sort(function (a, b) {
      var d = a.free - b.free;
      if (Math.abs(d) > 4 || !near) { return d; }
      return wkLen(a.at, near) - wkLen(b.at, near);
    });
    return pool.slice(0, n);
  }
  function wkTogether(ws, t) {
    var m = t || 0;
    ws.forEach(function (w) { m = Math.max(m, w.free); });
    ws.forEach(function (w) { wkWait(w, m); });
    return m;
  }
  function wkFace(a, b) { return Math.atan2(b[1] - a[1], b[0] - a[0]); }

  // ---- the timetable: what is put there, and the building's own faces ------------------------------------
  // A piece of the site (a stake, a stud, a sheet, the slab): its faces,
  // made once, shown from t0 to t1; while it goes in, `move` gives its faces.
  function wkPiece(plan, t0, faces, opt) {
    opt = opt || {};
    faces.forEach(function (f) { f.src = f; });
    var pc = { t0: t0, t1: opt.t1 === undefined ? Infinity : opt.t1, faces: faces, move: opt.move || null, moveTo: opt.moveTo || t0, live: opt.live || null };
    if (plan.pcLevel !== undefined) { pc.level = plan.pcLevel; }          // (the storey it is part of: hidden with it)
    plan.pieces.push(pc);
    return pc;
  }
  function wkFacesOf(draw) { var f = []; draw(f); return f; }
  // when a part of the building itself goes in: from t0 to t1, how
  function wkReveal(plan, key, t0, t1, anim, opt) {
    var R = plan.rv[key] || (plan.rv[key] = {});
    R.t0 = t0; R.t1 = Math.max(t0, t1); R.anim = anim || "fade";
    if (opt) { Object.keys(opt).forEach(function (k) { R[k] = opt[k]; }); }
    return R;
  }
  function wkSay(plan, key, t0, t1) { plan.say.push({ key: key, t0: t0, t1: t1 }); }

  // ---- the building's own faces: which part of it each is --------------------------------------------------
  // A face's group: the slab ("found"), a wall line outside ("wo:<level>:<way>:<off>"),
  // a room's walls inside ("wi:<room>"), its floor, its ceiling, a roof plane,
  // a window's glass, a door, a piece of furniture, a light or a socket ...
  function wkGroupOf(site, f) {
    var key = f.src || f, got = WK.groupOf.get(key);
    if (got !== undefined) { return got; }
    got = wkClassify(site, f);
    WK.groupOf.set(key, got);
    return got;
  }
  function wkDirKey(n) { return ((Math.round(Math.atan2(n[1], n[0]) / (Math.PI / 4)) % 8) + 8) % 8; }
  function wkClassify(site, f) {
    var ctx = site.ctx, P = site.P;
    if (!f.pts || f.person || f.me) { return null; }
    if (f.outdoors || !cnOurs(ctx, f.node)) {
      // (the lot's own -- a path, a bed, a tree, a car parked: put in by a later job if a part says so, WK.classifyMore;
      // f.outdoors: a face of no drawn thing that is not the building's, a ramp's rails -- 40-access.js)
      if (typeof WK.classifyMore === "function") { try { return WK.classifyMore(site, f) || null; } catch (e) { return null; } }
      return null;
    }
    var h = f.how || {}, lo = Infinity, hi = -Infinity, cx = 0, cy = 0, n = f.pts.length;
    for (var i = 0; i < n; i++) { var p = f.pts[i], z = p[2] || 0; if (z < lo) { lo = z; } if (z > hi) { hi = z; } cx += p[0] / n; cy += p[1] / n; }
    var lvl = cnLevel(ctx, lo + 0.5 * P), node = f.node, roomy = node && node.kind === "i_room", nrm = f.n || [0, 0, 1];
    var g = { lvl: lvl, lo: lo, hi: hi, c: [cx, cy, (lo + hi) / 2], mesh: !!f.mesh, ghost: !!h.ghost };
    if (f.found) { g.key = "found"; return g; }
    if (h.roof || f.roof) {
      // a roof plane: which way it slopes, how far out
      var off = Math.round((nrm[0] * cx + nrm[1] * cy + nrm[2] * (lo + hi) / 2) / (0.6 * P));
      g.key = "roof:" + (Math.abs(nrm[2]) > 0.97 ? "flat" : wkDirKey(nrm)) + ":" + off; g.roof = true; return g;
    }
    if (h.tower) { g.key = (Math.abs(nrm[2]) > 0.9 ? "deck:" : "skin:") + lvl + ":" + wkDirKey(nrm); return g; }
    if (h.ghost && !node) { return null; }
    if (roomy) {
      if (h.glass) { g.key = "glass:" + wkLineKey(site, f, lvl, nrm, cx, cy) + ":" + Math.round(wkAlongLine(nrm, cx, cy) / (1.4 * P)); g.glass = true; return g; }
      if (h.wall && Math.abs(nrm[2]) < 0.5) {
        if (cnOutside(ctx, f, [cx, cy, (lo + hi) / 2], lvl)) { g.key = "wo:" + wkLineKey(site, f, lvl, nrm, cx, cy); g.out = true; g.n = nrm; return g; }
        g.key = "wi:" + node.id; g.room = node; return g;
      }
      if (h.wall) { g.key = "wtop:" + lvl; return g; }
      if (h.floor) { g.key = "floor:" + node.id; g.room = node; return g; }
      if (h.ceiling) { g.key = "ceil:" + node.id; g.room = node; return g; }
      g.key = "wi:" + node.id; g.room = node; return g;
    }
    if (node && WALK_DOORS[node.kind]) { g.key = "door:" + node.id; g.node = node; return g; }
    if (node && node.kind === "i_window") { g.key = "win:" + node.id; g.node = node; return g; }
    if (node) {
      var c = typeof moClass === "function" ? moClass(ctx, node) : "carry";
      g.node = node;
      g.key = (c === "resident" ? "res:" : c === "rise" ? "rise:" : c === "fixture" ? "fix:" : c === "fade" ? "drv:" : wkBuiltIn(node) ? "fit:" : "item:") + node.id;
      return g;
    }
    // what has no piece of the plan: the slab's edge, trim, gutters, the wiring and pipes ...
    if (h.alpha !== undefined && h.alpha < 0.999 && h.late) { g.key = "mep:" + lvl; return g; }
    var L = site.levels[lvl], top = L ? L.top : 0;
    if (lo > top - 0.15 * P && lvl === site.levels.length - 1) { g.key = "rtrim"; return g; }
    var line = wkNearLine(site, lvl, cx, cy);
    if (line) { g.key = "wo:" + line; g.out = true; g.trim = true; return g; }
    g.key = "in:" + lvl;
    return g;
  }
  // which wall line (outside): the way it faces, how far out it stands
  function wkLineKey(site, f, lvl, n, cx, cy) {
    var d = wkDirKey(n), off = Math.round((n[0] * cx + n[1] * cy) / (0.4 * site.P));
    var key = lvl + ":" + d + ":" + off;
    var lines = site.lines || (site.lines = {}), L = lines[key] || (lines[key] = { key: key, lvl: lvl, n: [Math.cos(d * Math.PI / 4), Math.sin(d * Math.PI / 4)], a: Infinity, b: -Infinity, lo: Infinity, hi: -Infinity });
    var along = wkAlongLine(L.n, cx, cy);
    f.pts.forEach(function (p) { var t = wkAlongLine(L.n, p[0], p[1]); L.a = Math.min(L.a, t); L.b = Math.max(L.b, t); L.lo = Math.min(L.lo, p[2] || 0); L.hi = Math.max(L.hi, p[2] || 0); });
    L.off = n[0] * cx + n[1] * cy;
    void along;
    return key;
  }
  function wkAlongLine(n, x, y) { return -n[1] * x + n[0] * y; }
  function wkNearLine(site, lvl, x, y) {
    var best = null, d = 0.9 * site.P;
    Object.keys(site.lines || {}).forEach(function (k) {
      var L = site.lines[k];
      if (L.lvl !== lvl) { return; }
      var off = Math.abs(L.n[0] * x + L.n[1] * y - L.off), t = wkAlongLine(L.n, x, y);
      if (off < d && t > L.a - 0.5 * site.P && t < L.b + 0.5 * site.P) { d = off; best = k; }
    });
    return best;
  }
  // put in by a fitter as the house is finished, not carried in with the furniture
  var WK_BUILT_IN = { i_counter: 1, i_kitchensink: 1, i_sink: 1, i_stove: 1, i_oven: 1, i_dishwasher: 1, i_cabinet: 1, i_island: 1, i_hood: 1,
                      i_toilet: 1, i_bath: 1, i_tub: 1, i_shower: 1, i_vanity: 1, i_basin: 1, i_waterheater: 1, i_furnace: 1, i_closetrod: 1,
                      i_closetshelves: 1, i_fireplace: 1, i_pantry: 1, i_wallcabinet: 1, i_bar: 1, i_reachin: 1, i_medicine: 1 };
  function wkBuiltIn(n) { return !!WK_BUILT_IN[n.kind]; }

  // ---- making the timetable ------------------------------------------------------------------------------
  // The jobs are in 40-works-jobs.js: each phase a function (plan) that adds
  // to the timetable, in order.
  var WK_PHASES = [];
  function wkMake(plan, model) {
    var ctx = cnContext(model);
    if (!ctx) { return false; }
    var site = plan.site = wkSite(ctx, model);
    plan.workers = []; plan.machines = []; plan.pieces = []; plan.rv = {}; plan.say = []; plan.wallsAt = {}; plan.res = [];
    plan.T = 0; plan.closedAt = 0; plan.stairsAt = 0;
    // every face of the building, sorted into its parts -- the outside wall
    // lines found first, so what is fixed to them (trim) knows its line
    model.faces.forEach(function (f) {
      var h = f.how || {}, n = f.node;
      if (!f.pts || !n || n.kind !== "i_room" || !h.wall || !f.n || Math.abs(f.n[2]) >= 0.5) { return; }
      var lo = Infinity, cx = 0, cy = 0, hi = -Infinity;
      f.pts.forEach(function (p) { lo = Math.min(lo, p[2] || 0); hi = Math.max(hi, p[2] || 0); cx += p[0] / f.pts.length; cy += p[1] / f.pts.length; });
      var lvl = cnLevel(ctx, lo + 0.5 * site.P);
      if (cnOutside(ctx, f, [cx, cy, (lo + hi) / 2], lvl)) { wkLineKey(site, f, lvl, f.n, cx, cy); }
    });
    var groups = plan.groups = {};
    model.faces.forEach(function (f) {
      var g = wkGroupOf(site, f);
      if (!g) { return; }
      var G = groups[g.key] || (groups[g.key] = { key: g.key, lvl: g.lvl, faces: [], lo: Infinity, hi: -Infinity, x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, node: g.node || g.room || null, out: !!g.out });
      G.faces.push(f);
      G.lo = Math.min(G.lo, g.lo); G.hi = Math.max(G.hi, g.hi);
      f.pts.forEach(function (p) { G.x0 = Math.min(G.x0, p[0]); G.x1 = Math.max(G.x1, p[0]); G.y0 = Math.min(G.y0, p[1]); G.y1 = Math.max(G.y1, p[1]); });
      if (g.n) { G.n = g.n; }
    });
    // where they come in from the street, and the first to come
    var S = site.S, P = site.P, gx = S.W(site.door ? S.L(site.door.out[0], site.door.out[1])[0] : 0, S.hy + 0.6 * P);
    plan.gate = [gx[0], gx[1], 0];
    plan.next = 0; plan.phaseMs = {};
    return true;
  }
  // The jobs, a few each picture (a big building's took seconds all at once):
  // as many phases as fit in `budget` ms, at least one.
  function wkMakeSome(plan, budget) {
    var t0 = performance.now();
    while (plan.next < WK_PHASES.length) {
      var ph = WK_PHASES[plan.next++], s0 = performance.now();
      plan.pcLevel = undefined;
      try { ph.make(plan); } catch (e) { if (window.console && console.warn) { console.warn("works, " + ph.name + ":", e && e.stack || e); } }
      plan.pcLevel = undefined;
      plan.phaseMs[ph.name] = Math.round(performance.now() - s0);
      if (performance.now() - t0 > budget) { break; }
    }
    if (plan.next >= WK_PHASES.length && !plan.done) { wkMakeEnd(plan); }
  }
  function wkMakeEnd(plan) {
    var groups = plan.groups;
    plan.done = true;
    // and whatever no job put in: there when the inside is done
    var late = plan.doneAt || plan.T;
    Object.keys(groups).forEach(function (k) { if (!plan.rv[k]) { wkReveal(plan, k, late, late, "pop"); } });
    plan.lateR = { t0: late, t1: late, anim: "pop" };
    plan.T = Math.max(plan.T, 10);
    plan.workers.forEach(function (w) { plan.T = Math.max(plan.T, w.free); });
    plan.machines.forEach(function (m) { m.segs.forEach(function (s) { if (s.t1 < 1e8) { plan.T = Math.max(plan.T, s.t1); } }); });
    plan.T += 2;
    // (a timetable gone wrong -- a time not a number -- is not played: the building goes up the old way)
    if (!isFinite(plan.T)) {
      plan.ok = false;
      if (window.console && console.warn) { console.warn("works: the timetable came out " + plan.T + "; built the plain way"); }
      plan.bp.ms = typeof CN_MS === "object" ? CN_MS.fast.wood : 10000;
      return;
    }
    wkClock(plan);
  }
  function wkPlanFor(model) {
    if (!bpSite) { return null; }
    // (the roof comes in as the view opens: its measure taken once it is there)
    if (V3 && V3.roof && ((V3.roofV !== undefined && V3.roofV < 0.999) || (V3.tw && V3.tw.roofV)) && !(WK.plan && WK.plan.bp === bpSite)) { return { wait: true }; }
    if (WK.plan && WK.plan.bp === bpSite) {
      var p0 = WK.plan;
      if (p0.ok && !p0.done) {
        var tm = performance.now();
        try { wkMakeSome(p0, 14); } catch (e2) { p0.ok = false; }
        p0.madeMs += performance.now() - tm;
      }
      return p0.ok ? p0 : null;
    }
    var plan = WK.plan = { bp: bpSite, ok: false };
    WK.groupOf = new WeakMap();
    var t0 = performance.now();
    try { plan.ok = wkMake(plan, model); } catch (e) { plan.ok = false; if (window.console && console.warn) { console.warn("works:", e && e.stack || e); } }
    if (plan.ok) {
      // (the site's own time runs from now; its length known once the jobs are all worked out)
      plan.T = Math.max(plan.T, 1);
      wkClockStart(plan);
      try { wkMakeSome(plan, 10); } catch (e3) { plan.ok = false; }
    }
    plan.madeMs = performance.now() - t0;
    return plan.ok ? plan : null;
  }

  // ---- each picture ----------------------------------------------------------------------------------------
  function wkBuilding(model, t) {
    var plan = wkPlanFor(model);
    if (!plan) { return null; }
    if (plan.wait) {
      // the lot, empty, before anything is begun
      var ctx0 = cnContext(model);
      if (!ctx0) { return null; }
      return Object.assign({}, model, { faces: model.faces.filter(function (f) { return !f.pts || f.person || !cnOurs(ctx0, f.node); }),
                                        labels: [] });
    }
    // (the site's clock, and the work done by then: the same, unless the site keeps a calendar)
    var siteS = Math.max(0, Math.min(1, t)) * (plan.done ? wkCalLength(plan) : plan.T);
    var T = plan.done ? wkCalWork(siteS, plan) : siteS, site = plan.site, faces = [], P = site.P;
    plan.now = T; plan.siteNow = siteS; WK.lastIn = model;
    var fly = plan.fly = {};
    // (2026-10-05: "super laggy and not smooth") Each face's group and times kept by where it
    // stands in the picture, once the timetable is all made: picture after picture the same
    // faces come in the same order (the building kept as it will stand, 40-blueprint.js), and
    // most of them are finished, or not begun and nothing to show yet -- told apart by two
    // numbers, not looked up again (49,000 faces of a block of flats, ten milliseconds a picture).
    var FC = plan.done ? wkFastFor(plan, site, model.faces) : null;
    // (and what is put into the picture's batches as standing still -- the batches kept as they
    // were while that is the very same, 38-view3d-gl.js -- changed only every few seconds, not each
    // time a face is finished: what is finished since, or will change before then, goes in as moving)
    var FD = FC ? wkFoldFor(plan, T) : null, held = 0;
    // (the picture's faces into an array made the size it will be, once -- not grown and copied as it
    // fills, three arrays the size of a block of flats a picture for the memory to clear: 2026-10-05)
    faces = new Array(model.faces.length + 64);
    var fi = 0, xtra = WK.xtra || (WK.xtra = []);
    for (var i = 0; i < model.faces.length; i++) {
      var f = model.faces[i];
      var fj = FC ? FC.idx[i] : -1;
      if (fj >= 0) {
        var fk = FC.kind[fj];
        if (fk === 0) { faces[fi++] = f; continue; }
        if (T >= FC.t1[fj]) { if (FD && FC.t1[fj] > FD.T0) { faces[fi++] = wkMoving(f, FC.hold[fj]); held++; } else { faces[fi++] = f; } continue; }
        if (fk === 1 && T < FC.t0[fj]) { continue; }
        if (fk === 2 && T < FC.tp[fj]) { continue; }
      }
      var g = wkGroupOf(site, f);
      if (!g) { faces[fi++] = f; continue; }
      // (2026-10-04, "a stable 60fps": each part's timing kept on it once the timetable is
      // all made, and what is finished -- most of it, most of the time -- put in first)
      var R = g.Rp === plan ? g.R : plan.rv[g.key] || plan.lateR || WK_NOT_YET;
      if (g.Rp !== plan && plan.done) { g.R = R; g.Rp = plan; }
      if (T >= R.t1) { if (FD && R.t1 > FD.T0) { faces[fi++] = wkMoving(f, wkHoldOf(g.key)); held++; } else { faces[fi++] = f; } continue; }
      var steady = !FD || (fj >= 0 && FC.tp[fj] <= FD.T0 && FC.t0[fj] > FD.Tw);
      if (R.carry && R.carry.wk && T >= R.carry.wk.t0 && T < R.t0) { (fly[g.key] || (fly[g.key] = [])).push(f); continue; }
      if (T < R.t0) {
        if (R.pre && !f.mesh && !(f.how && (f.how.glass || f.how.ghost))) {
          var pre = R.pre;
          if (pre.cut && T < pre.t1) {
            // (put on from the foot up too: boards course by course)
            if (T >= pre.t0) {
              var plo = pre.lo !== undefined ? pre.lo : g.lo, phi = pre.hi !== undefined ? pre.hi : g.hi, pc2 = plo + (phi - plo) * (T - pre.t0) / Math.max(1e-6, pre.t1 - pre.t0);
              if (g.hi <= pc2) { faces[fi++] = wkHeldLook(wkPreLook(f, pre.how), steady, g.key); }
              else if (g.lo < pc2) { var lowp = wkClipZ(f.pts, pc2, true); if (lowp) { faces[fi++] = Object.assign(wkPreLook(f, pre.how), { pts: lowp, moves: true }); } }
            }
          } else if (T >= wkPreAt(pre, g)) { faces[fi++] = wkHeldLook(wkPreLook(f, pre.how), steady, g.key); }
        }
        continue;
      }
      if (T >= R.t1) { faces[fi++] = f; continue; }
      var gf = wkAnimFace(f, g, R, (T - R.t0) / Math.max(1e-6, R.t1 - R.t0), P, xtra, T);
      if (xtra.length) { for (var xi = 0; xi < xtra.length; xi++) { faces[fi++] = xtra[xi]; } xtra.length = 0; }
      if (gf && FD && !gf.moves) { if (gf === f) { gf = wkMoving(f, wkHoldOf(g.key)); } else { gf.moves = true; gf.hold = wkHoldOf(g.key); } held++; }
      if (gf) { faces[fi++] = gf; }
    }
    faces.length = fi;
    if (FD && held > WK_FOLD_MOST) { FD.over = true; }       // (too much going in as moving: folded in, next picture)
    var out = Object.assign({}, model, { faces: faces });
    var passing = out.passing = { faces: model.passing ? model.passing.faces.slice() : [], stand: model.passing ? model.passing.stand.slice() : [] };
    // what has been put there, and what is being put there
    for (var p = 0; p < plan.pieces.length; p++) {
      var pc = plan.pieces[p];
      if (T < pc.t0 || T >= pc.t1 || (pc.level !== undefined && wkStoreyHidden(plan, pc.level))) { continue; }
      var pcHold = WK_HOLDS[p % WK_HOLDS.length];
      // (2026-10-05, "make the moving in spikes smooth too") What a piece draws for itself each
      // picture -- movers going back for the next load, a dolly, the door held open -- is not the
      // house standing still, even what of it is not marked as moving: in its piece's held batch,
      // as it was where it is as it was (38-view3d-gl.js), not a few faces more or less in what
      // stands still -- which put the whole house into its batches again, picture after picture.
      if (pc.live) { var lf = faces.length; pc.live(faces, T); if (FD) { wkHoldFrom(faces, lf, pcHold, pc); } continue; }
      if (pc.move && T < pc.moveTo) { var mf = faces.length; pc.move(faces, T); if (FD) { wkHoldFrom(faces, mf, pcHold, pc); } continue; }
      // (a piece put in or taken out before the next fold: standing still meanwhile, in a held batch
      // of its own piece's -- in or out, one held batch joined again, not the house's)
      var pcStill = !FD || (pc.t0 <= FD.T0 && pc.t1 > FD.Tw);
      for (var q = 0; q < pc.faces.length; q++) { faces.push(pcStill || pc.faces[q].moves ? pc.faces[q] : wkMoving(pc.faces[q], pcHold)); }
    }
    // the machines, and those at work
    plan.machines.forEach(function (m) { try { wkMachineDraw(passing.faces, m, T, plan); } catch (e) { /* not this one */ } });
    // (those at work -- not while the crews are off the site: nights, a day rained off)
    if (wkCalPresent(siteS, plan) > 0.01) {
      plan.workers.forEach(function (w) { try { wkWorkerDraw(passing.faces, w, T, plan); } catch (e) { /* not this one */ } });
    }
    // (the names of rooms and pieces not there yet: none, till it is all in)
    if (out.labels && T < (plan.labelsAt || plan.T - 3)) { out.labels = []; }
    return out;
  }
  // What goes into the picture's batches as standing still, from T0: what is still over the next
  // few seconds of the clock (Tw) -- finished by T0, and a first look not to be taken off by then.
  // Folded in afresh as the clock passes Tw, goes back past T0 (a seek), or too much is moving.
  var WK_FOLD_MS = 3000, WK_FOLD_MOST = 2500;
  function wkFoldFor(plan, T) {
    var F = WK.fold;
    if (F && F.plan === plan && !F.over && T >= F.T0 && T <= F.Tw) { return F; }
    var B = plan.bp, rate = B && B.rate ? B.rate : WK_RATE_OPEN;
    WK.fold = F = { plan: plan, T0: T, Tw: T + rate * WK_FOLD_MS / 1000 * 1.5, over: false };
    return F;
  }
  // a face that stands still, put in as moving meanwhile (the same copy each picture), in one of a
  // few held batches (38-view3d-gl.js, f.hold) -- by its job, so a job done changes one of them
  var WK_HOLDS = ["~h0", "~h1", "~h2", "~h3", "~h4", "~h5"], WK_HOLD_BY = {};
  function wkHoldOf(key) {
    var got = WK_HOLD_BY[key];
    if (got === undefined) {
      var h = 0, s = String(key);
      for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
      got = WK_HOLD_BY[key] = WK_HOLDS[(h >>> 0) % WK_HOLDS.length];
    }
    return got;
  }
  function wkMoving(f, hold) {
    var M = WK.moving || (WK.moving = new WeakMap()), c = M.get(f);
    if (!c || c.hold !== hold) { c = Object.assign({}, f, { moves: true, hold: hold || WK_HOLDS[0] }); M.set(f, c); }
    return c;
  }
  // (and what a piece draws afresh each picture the very same as the last -- a pit dug, standing
  // open: the same copies as last picture, not new ones each picture told apart by what they are)
  function wkHoldFrom(faces, from, hold, pc) {
    var was = pc && pc.wkHeld, now = [], same = !!was && was.inp.length === faces.length - from;
    for (var i = from; i < faces.length; i++) {
      var f = faces[i];
      if (f.moves) { now.push(f); continue; }          // (what moves is new each picture: the rest still matched by place)
      var j = i - from;
      if (same) {
        var g = was.inp[j];
        if (g === f || (g && !g.moves && g.how === f.how && g.mesh === f.mesh && g.node === f.node && wkPtsSame(g.pts, f.pts))) { now.push(f); faces[i] = was.out[j]; continue; }
        same = false;
      }
      now.push(f);
      faces[i] = wkMoving(f, hold);
    }
    if (pc) {
      if (!same || !was) { pc.wkHeld = { inp: now, out: faces.slice(from) }; }
    }
  }
  function wkPtsSame(a, b) {
    if (a === b) { return true; }
    if (!a || !b || a.length !== b.length) { return false; }
    for (var i = 0; i < a.length; i++) { var p = a[i], q = b[i]; if (p[0] !== q[0] || p[1] !== q[1] || (p[2] || 0) !== (q[2] || 0)) { return false; } }
    return true;
  }
  function wkHeldLook(f, steady, key) { if (!steady) { f.moves = true; f.hold = wkHoldOf(key); } return f; }
  // The faces of the picture, by what each is a copy of (its src, as wkGroupOf keys them: the same
  // from one picture to the next, the building made again or not), and for each: 0, of no group --
  // always in; 1, in from t1 and nothing of it before t0; 2, something of it before t0 (carried in,
  // a first look) -- worked out in full each picture from tp, the first moment anything of it shows,
  // until t1.  Matched in order, the list as last time; where it is not (faces taken out -- a pool's
  // ground, 40-gatespool.js -- or put in), found again by name; made again when much of it is new.
  function wkFastFor(plan, site, list) {
    var C = WK.fast, n = list.length, i, f, key;
    // (the very list as last picture, no longer: its places as they were)
    if (C && C.plan === plan && C.list === list && C.listN === n) { return C; }
    if (C && C.plan === plan) {
      if (!C.idx || C.idx.length < n) { C.idx = new Int32Array(n + 1024); }
      var idx = C.idx, j = 0, miss = 0;
      for (i = 0; i < n; i++) {
        f = list[i]; key = f.src || f;
        if (j < C.n && C.refs[j] === key) { idx[i] = j++; continue; }
        var at = C.where.get(key);
        if (at !== undefined) { idx[i] = at; j = at + 1; } else { idx[i] = -1; miss++; }
      }
      if (miss <= Math.max(256, n * 0.1)) { C.list = list; C.listN = n; return C; }
    }
    var refs = new Array(n), where = new Map(), kind = new Uint8Array(n), t0 = new Float64Array(n), t1 = new Float64Array(n), tp = new Float64Array(n),
        idx2 = new Int32Array(n + 1024), hold = new Array(n);
    for (i = 0; i < n; i++) {
      f = list[i]; key = f.src || f;
      refs[i] = key; idx2[i] = i;
      if (!where.has(key)) { where.set(key, i); }
      var g = wkGroupOf(site, f);
      if (!g) { continue; }
      var R = g.Rp === plan ? g.R : plan.rv[g.key] || plan.lateR || WK_NOT_YET;
      if (g.Rp !== plan) { g.R = R; g.Rp = plan; }
      kind[i] = R.pre || (R.carry && R.carry.wk) ? 2 : 1;
      t0[i] = R.t0; t1[i] = R.t1; hold[i] = wkHoldOf(g.key);
      if (kind[i] === 2) {
        // (when the first of it shows: carried in, or its first look -- as wkBuilding tells it)
        var first = R.t0;
        if (R.carry && R.carry.wk) { first = Math.min(first, R.carry.wk.t0); }
        if (R.pre && !f.mesh && !(f.how && (f.how.glass || f.how.ghost))) { first = Math.min(first, R.pre.cut ? R.pre.t0 : wkPreAt(R.pre, g)); }
        tp[i] = first;
      }
    }
    WK.fast = { plan: plan, refs: refs, where: where, n: n, idx: idx2, kind: kind, t0: t0, t1: t1, tp: tp, hold: hold, list: list, listN: n };
    return WK.fast;
  }
  // (2026-10-05: "the beams ... then the floor so they are in that in-between state") Looked at from
  // above with the storeys over one taken off (38-view3d.js's V3.upTo), a storey's framing -- its deck's
  // joists and boards, its walls' studs, the trusses over the top one -- goes with it, as its own rooms
  // do: they stood over the floor below with nothing round them.
  function wkStoreyHidden(plan, li) {
    if (!V3 || V3.mode === "walk" || V3.upTo === null || V3.upTo === undefined || !plan.site) { return false; }
    return li - plan.site.ground > V3.upTo;
  }
  // a face as it looks before it is finished: sheathing on a wall, boards on a roof
  function wkPreLook(f, how) {
    var by = WK.pre.get(f.how || f);
    if (!by) { by = Object.assign({}, f.how || {}, how); WK.pre.set(f.how || f, by); }
    return Object.assign({}, f, { how: by });
  }
  // when a face of a group gets its first look (sheathing, roof boards): at once, or as a sweep passes it
  function wkPreAt(pre, g) {
    if (!pre.axis) { return pre.t0; }
    var a = pre.axis, along = (g.c[0] - a[0]) * a[2] + (g.c[1] - a[1]) * a[3] + (pre.up ? (g.c[2] - pre.up) * 0 : 0);
    return pre.t0 + (pre.t1 - pre.t0) * wkClamp(along / Math.max(1, pre.len));
  }
  // a flat face cut by a level: what is below it (or above)
  function wkClipZ(pts, cut, below) {
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length], za = a[2] || 0, zb = b[2] || 0;
      var ina = below ? za <= cut : za >= cut, inb = below ? zb <= cut : zb >= cut;
      if (ina) { out.push(a); }
      if (ina !== inb) { var k = (cut - za) / ((zb - za) || 1e-9); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, cut]); }
    }
    return out.length >= 3 ? out : null;
  }
  function wkAnimFace(f, g, R, k, P, extra, T) {
    var how = f.how || {};
    switch (R.anim) {
      case "cut": {
        // put on from the foot up (siding course by course, shingles row by row, a sheet of plasterboard)
        if (f.mesh) { return k > 0.5 ? f : null; }
        var lo = R.lo !== undefined ? R.lo : g.lo, hi = R.hi !== undefined ? R.hi : g.hi, cut = lo + (hi - lo) * k;
        var pre = R.pre && !how.glass && T >= wkPreAt(R.pre, g);
        if (g.hi <= cut) { return f; }
        if (g.lo >= cut) { return pre ? wkPreLook(f, R.pre.how) : null; }
        var low = wkClipZ(f.pts, cut, true);
        if (pre && extra) {
          var up = wkClipZ(f.pts, cut, false);
          if (up) { extra.push(Object.assign(wkPreLook(f, R.pre.how), { pts: up, moves: true })); }
        }
        return low ? Object.assign({}, f, { pts: low, moves: true }) : null;
      }
      case "sweep": {
        // along a line (or round a room): each face in as the work passes it
        var c = g.c, frac;
        if (R.angle) { frac = ((Math.atan2(c[1] - R.angle[1], c[0] - R.angle[0]) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2); }
        else { var a = R.axis; frac = ((c[0] - a[0]) * a[2] + (c[1] - a[1]) * a[3]) / Math.max(1, R.len); }
        if (frac > k) { return R.pre && T >= wkPreAt(R.pre, g) ? wkPreLook(f, R.pre.how) : null; }
        return f;
      }
      case "pop": return null;
      case "drop": {
        var z = (1 - wkSmooth(k)) * (R.drop || 0.4 * P);
        return Object.assign({}, f, { pts: f.pts.map(function (p) { return [p[0], p[1], (p[2] || 0) + z]; }), moves: true,
                                      mesh: f.mesh ? Object.assign({}, f.mesh, { p: moView(f.mesh.p), xf: f.mesh.xf ? f.mesh.xf.slice(0, 4).concat([(f.mesh.xf[4] || 0) + z]) : f.mesh.xf }) : f.mesh });
      }
      default: {
        if (f.mesh || how.glass) { return k > 0.5 ? f : null; }
        return Object.assign({}, f, { how: cnFade(how, k), moves: true });
      }
    }
  }

  // ---- drawing those at work ------------------------------------------------------------------------------
  function wkSegAt(list, T) {
    var lo = 0, hi = list.length - 1;
    if (!list.length || T < list[0].t0) { return -1; }
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (list[mid].t0 <= T) { lo = mid; } else { hi = mid - 1; } }
    return lo;
  }
  // where a worker is, which way they face, what they are doing
  function wkWorkerAt(w, T) {
    var i = wkSegAt(w.segs, T);
    if (i < 0) { return null; }
    var s = w.segs[i];
    if (T >= s.t1 && i === w.segs.length - 1) { return w.gone ? null : { p: s.L ? s.L.pts[s.L.pts.length - 1] : s.at, head: s.face || 0, pose: "stand", seg: s, k: 1 }; }
    var k = wkClamp((T - s.t0) / Math.max(1e-6, s.t1 - s.t0));
    if (s.L) {
      var d = s.L.len * k, A = wkAlong(s.L, d), j = A.i, a = s.L.pts[j], b = s.L.pts[Math.min(j + 1, s.L.pts.length - 1)];
      var dz = Math.abs((b[2] || 0) - (a[2] || 0)), dh = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var head = dh > 1e-3 ? Math.atan2(b[1] - a[1], b[0] - a[0]) : (s.lastHead || 0);
      if (dz > dh) {
        // up (or down) a ladder: facing it, from the last way walked
        var prev = s.L.pts[Math.max(0, j - 1)];
        head = Math.hypot(a[0] - prev[0], a[1] - prev[1]) > 1e-3 ? Math.atan2(a[1] - prev[1], a[0] - prev[0]) : head;
        return { p: A.p, head: head, pose: "climb", phase: d / (0.18 * FLOOR_PX), seg: s, k: k };
      }
      return { p: A.p, head: head, pose: s.carry ? "carry" : "walk", phase: d / (0.36 * FLOOR_PX), seg: s, k: k };
    }
    return { p: s.at, head: s.face === null || s.face === undefined ? (w.segs[i - 1] && w.segs[i - 1].L ? wkLastHead(w.segs[i - 1]) : 0) : s.face, pose: s.pose, seg: s, k: k, T: T };
  }
  function wkLastHead(s) {
    var p = s.L.pts, a = p[p.length - 2], b = p[p.length - 1];
    return a && b ? Math.atan2(b[1] - a[1], b[0] - a[0]) : 0;
  }
  function wkWorkerDraw(faces, w, T, plan) {
    var st = wkWorkerAt(w, T);
    if (!st) { return; }
    if (wkStoreyHidden(plan, wkLevelOf(plan.site, st.p))) { return; }      // (up on a storey taken off the view: with it)
    var P = plan.site.P, look = Object.assign({}, w.look), phase = 0, s = st.seg;
    var pose = st.pose;
    if (pose === "walk" || pose === "carry") { phase = st.phase; }
    if (pose === "carry" && s.carry && (s.carry.kind === "studs" || s.carry.kind === "board" || s.carry.kind === "sheet" || s.carry.kind === "rebar")) { look.arms = "shoulder"; }
    else if (pose === "carry" && s.carry && s.carry.kind === "barrow") { look.arms = "push"; }
    else if (pose === "carry") { look.arms = "carry"; }
    else if (pose === "hammer") { look.arms = "hammer"; look.armK = Math.abs(Math.sin((T + w.id) * 7.5)); }
    else if (pose === "up") { look.arms = "up"; }
    else if (pose === "climb") { look.arms = "climb"; phase = st.phase; }
    else if (pose === "kneel") { look.legs = "kneel"; look.arms = "hammer"; look.armK = Math.abs(Math.sin((T + w.id) * 6)) * 0.6; }
    else if (pose === "shovel") { look.arms = "carry"; }
    else if (pose === "hold") { look.arms = "carry"; }
    var fade = 1;
    if (w.segs.length && T < w.segs[0].t0 + 1.5 && w.fadeIn) { fade = wkClamp((T - w.segs[0].t0) / 1.5); }
    var last = w.segs[w.segs.length - 1];
    if (w.gone && last && T > last.t1 - 1.5) { fade = Math.min(fade, wkClamp((last.t1 - T) / 1.5)); }
    if (fade <= 0.02) { return; }
    // (2026-10-05, safety gear) Above 1.8 m a harness; on a roof (or its trusses), its lanyard clipped to the ridge
    var g0 = plan.site.levels[plan.site.ground], anchor = null;
    if (look.ppe && (st.p[2] || 0) - (g0 ? g0.z : 0) > 1.8 * P) {
      look.harness = true;
      anchor = wkAnchor(plan, st.p, T);
      look.tied = !!anchor;
    }
    peopleBody(faces, { kind: "i_builder", id: 600 + w.id }, st.p[0], st.p[1], st.p[2] || 0, st.head, phase, look, fade < 0.999 ? fade : undefined);
    if (anchor) { wkLanyard(faces, st, look, w, anchor, fade); }
    var carry = s && s.carry;
    if (carry && (pose === "carry" || pose === "walk" || pose === "climb")) { wkCarryDraw(faces, carry, st.p, st.head, P, look); }
    if (s && s.hold && (pose !== "walk")) { wkCarryDraw(faces, s.hold, st.p, st.head, P, look); }
  }
  // The roof's planes (from the roof groups, as the trusses are cut to them, 40-works-frame.js), each
  // with its ridge: the top edge a lifeline runs along.
  function wkRoofPlanes(plan) {
    if (plan.wkRoofPl) { return plan.wkRoofPl; }
    var out = [], P = plan.site.P;
    Object.keys(plan.groups || {}).forEach(function (key) {
      if (key.indexOf("roof:") !== 0) { return; }
      (plan.groups[key].faces || []).forEach(function (f) {
        if (!f.pts || f.pts.length < 3) { return; }
        var a = f.pts[0], b = f.pts[1], c = f.pts[2];
        var ux = b[0] - a[0], uy = b[1] - a[1], uz = (b[2] || 0) - (a[2] || 0), vx = c[0] - a[0], vy = c[1] - a[1], vz = (c[2] || 0) - (a[2] || 0);
        var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl; ny /= nl; nz /= nl;
        if (Math.abs(nz) < 0.08) { return; }
        var top = Math.max.apply(null, f.pts.map(function (q) { return q[2] || 0; }));
        var ridge = f.pts.filter(function (q) { return (q[2] || 0) > top - 0.05 * P; }), r0 = ridge[0], r1 = ridge[0], far = -1;
        ridge.forEach(function (p) { ridge.forEach(function (q) { var d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d > far) { far = d; r0 = p; r1 = q; } }); });
        out.push({ key: key, poly: f.pts.map(function (q) { return [q[0], q[1]]; }), nx: nx, ny: ny, nz: nz, d: nx * a[0] + ny * a[1] + nz * (a[2] || 0),
                   r0: [r0[0], r0[1], r0[2] || 0], r1: [r1[0], r1[1], r1[2] || 0] });
      });
    });
    return (plan.wkRoofPl = out);
  }
  // Where one up on a roof clips on: the ridge over the plane they are on (a rope grab on a line along
  // it) -- on the roof once it is sheathed, on the trusses' tops before.  None off a roof.
  function wkAnchor(plan, p, T) {
    var P = plan.site.P, z = p[2] || 0, best = null, bz = Infinity;
    wkRoofPlanes(plan).forEach(function (R) {
      if (!wkInPoly(R.poly, p[0], p[1])) { return; }
      var dz = (R.d - R.nx * p[0] - R.ny * p[1]) / R.nz - z;
      if (dz < -0.6 * P || dz > 2.6 * P || Math.abs(dz) >= bz) { return; }
      bz = Math.abs(dz); best = R;
    });
    if (!best) { return null; }
    var a = best.r0, b = best.r1, ex = b[0] - a[0], ey = b[1] - a[1], l2 = ex * ex + ey * ey;
    var t = l2 > 1e-6 ? Math.max(0.04, Math.min(0.96, ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / l2)) : 0;
    var rv = plan.rv && plan.rv[best.key], on = !rv || T >= rv.t1;
    var q = [a[0] + ex * t, a[1] + ey * t, a[2] + (b[2] - a[2]) * t + (on ? 0.05 : -0.1) * P];
    return Math.hypot(q[0] - p[0], q[1] - p[1]) > 9 * P ? null : q;
  }
  // The lanyard from the D-ring on their back to the anchor, a little slack in it, and its hook.
  var WK_LANYARD = { piece: true, color: "#e8b923", edge: "#a57f12", pat: 27 };
  function wkLanyard(faces, st, look, w, q, fade) {
    var k = Math.round(FLOOR_PX * (0.97 + (((600 + w.id) * 37) % 7) / 100) * 10) / 10, c = Math.cos(st.head), s = Math.sin(st.head);
    var up = (look.legs === "kneel" ? 0.91 : 1.34) * k, x0 = st.p[0] - 0.145 * k * c, y0 = st.p[1] - 0.145 * k * s, z0 = (st.p[2] || 0) + up;
    var a = [x0, y0, z0], len = Math.hypot(q[0] - x0, q[1] - y0, q[2] - z0), sag = Math.min(0.35 * k, len * 0.12);
    var m = [(x0 + q[0]) / 2, (y0 + q[1]) / 2, (z0 + q[2]) / 2 - sag], how = cnFade(WK_LANYARD, fade), f0 = faces.length;
    cnBeam(faces, a, m, 0.022 * k, how);
    cnBeam(faces, m, q, 0.022 * k, how);
    cnBeam(faces, [q[0], q[1], q[2] - 0.03 * k], [q[0], q[1], q[2] + 0.05 * k], 0.05 * k, cnFade(WK_STEEL, fade));
    for (var i = f0; i < faces.length; i++) { faces[i].moves = true; faces[i].person = true; }
  }
  // what is carried: studs on the shoulder, a sheet at the side, a box in front ...
  var WK_TIMBER = { piece: true, color: "#d9b77e", edge: "#a88857", pat: 21 };
  var WK_OSB = { piece: true, color: "#c9a56b", edge: "#9a7b48", pat: 21 };
  var WK_BOARD = { piece: true, color: "#e9e6df", edge: "#b9b5ac", pat: 0 };
  var WK_STEEL = { piece: true, color: "#56606b", edge: "#353b42", pat: 22 };
  var WK_REBAR = { piece: true, color: "#7a4a2e", edge: "#5a3420", pat: 22 };
  var WK_CARD = { piece: true, color: "#b98a56", edge: "#8a6638", pat: 0 };
  function wkCarryDraw(faces, c, p, head, P, look) {
    var f = [Math.cos(head), Math.sin(head)], s = [-Math.sin(head), Math.cos(head)], k = 1;
    function at(fw, sd, up) { return [p[0] + f[0] * fw * P + s[0] * sd * P, p[1] + f[1] * fw * P + s[1] * sd * P, (p[2] || 0) + up * P]; }
    switch (c.kind) {
      case "studs": case "board": case "rebar": {
        var n = Math.min(4, c.n || 1), len = (c.len || 2.4) / 2, how = c.kind === "rebar" ? WK_REBAR : c.how || WK_TIMBER;
        for (var i = 0; i < n; i++) {
          var o = (i % 2) * 0.05, u = Math.floor(i / 2) * 0.05;
          cnBeam(faces, at(-len + 0.4, 0.2 + o, 1.52 + u), at(len + 0.4, 0.2 + o, 1.52 + u), c.kind === "rebar" ? 0.02 * P : 0.045 * P, how, c.kind === "rebar" ? 0.02 * P : 0.09 * P);
        }
        break;
      }
      case "sheet": {
        var w2 = (c.w || 1.2) / 2, h2 = c.h || 2.4, how2 = c.how || WK_OSB;
        // on its long edge at the side, held up under the arm
        var a = at(-h2 / 2 + 0.2, 0.28, 0.35), b = at(h2 / 2 + 0.2, 0.28, 0.35), top = 0.35 + w2 * 2;
        faces.push({ pts: [a, b, [b[0], b[1], (p[2] || 0) + top * P], [a[0], a[1], (p[2] || 0) + top * P]], n: [s[0], s[1], 0], how: how2, moves: true });
        break;
      }
      case "box": {
        var hb = (c.size || 0.45) / 2, cc = at(0.42, 0, 1.0 + hb);
        cnBox(faces, cc[0], cc[1], hb * P, hb * P, cc[2] - hb * P, cc[2] + hb * P, c.how || WK_CARD, head);
        break;
      }
      case "window": {
        var ww = (c.w || 1.0) / 2, wh = c.h || 1.2, m = at(0.45, 0, 0.55), e = [f[0] * 0, f[1] * 0];
        void e;
        var l1 = [m[0] + s[0] * ww * P, m[1] + s[1] * ww * P], l2 = [m[0] - s[0] * ww * P, m[1] - s[1] * ww * P], z0 = m[2], z1 = m[2] + wh * P;
        faces.push({ pts: [[l1[0], l1[1], z0], [l2[0], l2[1], z0], [l2[0], l2[1], z1], [l1[0], l1[1], z1]], n: [f[0], f[1], 0], how: { glass: true, bare: true }, moves: true });
        cnBeam(faces, [l1[0], l1[1], z0], [l2[0], l2[1], z0], 0.06 * P, WK_BOARD); cnBeam(faces, [l1[0], l1[1], z1], [l2[0], l2[1], z1], 0.06 * P, WK_BOARD);
        cnBeam(faces, [l1[0], l1[1], z0], [l1[0], l1[1], z1], 0.06 * P, WK_BOARD); cnBeam(faces, [l2[0], l2[1], z0], [l2[0], l2[1], z1], 0.06 * P, WK_BOARD);
        break;
      }
      case "bucket": {
        var bc = at(0.05, 0.32, 0.55);
        cnBox(faces, bc[0], bc[1], 0.13 * P, 0.13 * P, bc[2] - 0.3 * P, bc[2], c.how || { piece: true, color: "#e8e3d8", edge: "#a9a49a", pat: 27 }, head);
        break;
      }
      case "roll": {
        var r0 = at(0.0, 0.25, 1.55), r1 = at(0.0, -0.25, 1.55);
        cnBeam(faces, r0, r1, 0.25 * P, c.how || { piece: true, color: "#5f8f3a", edge: "#3e6326", pat: 6 });
        break;
      }
      default: break;
    }
    void k; void look;
  }

  // ---- the machines --------------------------------------------------------------------------------------
  // A machine: its kind, and its spells -- each a function of how far
  // through it (0..1) to the machine's state there (where, which way, its
  // arm, its bucket ...); drawn by its kind's own drawing (40-works-mach.js).
  var WK_DRAW = {};
  function wkMachine(plan, kind, opt) {
    var m = { id: plan.machines.length, kind: kind, segs: [], opt: opt || {} };
    plan.machines.push(m);
    return m;
  }
  function wkMSeg(m, t0, t1, state) { var s = { t0: t0, t1: Math.max(t0 + 0.01, t1), state: state }; m.segs.push(s); m.segs.sort(function (a, b) { return a.t0 - b.t0; }); return s; }
  function wkMachineAt(m, T) {
    var i = wkSegAt(m.segs, T);
    if (i < 0) { return null; }
    var s = m.segs[i];
    if (T >= s.t1) {
      if (i === m.segs.length - 1 || s.gone) { return null; }   // gone (till it comes again)
      return s.state(1, T);                                 // (waiting as the last spell left it)
    }
    return s.state(wkClamp((T - s.t0) / (s.t1 - s.t0)), T);
  }
  function wkMachineDraw(faces, m, T, plan) {
    var st = wkMachineAt(m, T);
    if (!st) { return; }
    var draw = WK_DRAW[m.kind];
    if (draw) { draw(faces, st, m, T, plan); }
  }

  // ---- driving: along the road, backed in to a stand, out again --------------------------------------------
  // Paths in the street's own numbers: points [x, y]; the machine's middle
  // goes along it; going backwards, it faces the other way.
  function wkDrivePath(site, pts) {
    var L = wkPolyline(pts.map(function (p) { return [p[0], p[1], 0]; }));
    return L;
  }
  // a smooth turn (a cubic) as points
  function wkCurve(a, b, c, d, n) {
    var out = [];
    for (var i = 0; i <= (n || 12); i++) {
      var t = i / (n || 12), u = 1 - t;
      out.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]);
    }
    return out;
  }
  // The pose (lot-local x, y, heading) of a machine at distance s along a
  // path; `back` if it is reversing along it.  A trailer behind: its pose
  // a hitch's length further back along the same path.
  function wkAlongOn(L, s) {
    if (s >= 0 && s <= L.len) { return wkAlong(L, s).p; }
    var e = 0.5 * FLOOR_PX, a = wkAlong(L, s < 0 ? 0 : L.len).p, b = wkAlong(L, s < 0 ? Math.min(L.len, e) : Math.max(0, L.len - e)).p, d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d < 1e-6) { return a; }
    var over = s < 0 ? -s : s - L.len;
    return [a[0] + (a[0] - b[0]) / d * over, a[1] + (a[1] - b[1]) / d * over];
  }
  function wkPoseOn(L, s, back) {
    var A = wkAlong(L, s), e = 0.6 * FLOOR_PX, B = wkAlong(L, Math.min(L.len, s + e)), C = wkAlong(L, Math.max(0, s - e));
    var dx = B.p[0] - C.p[0], dy = B.p[1] - C.p[1], ang = Math.atan2(dy, dx);
    // a trailer's heading: from its back axles to its kingpin, both on the way the cab has come
    // (or, backing, the way it is going) -- following round a bend, not swung out across it
    // (2026-10-06: and past either end of the way, on straight along its first or last stretch -- a
    // trailer pulled away from the kerb lay straight behind its cab there, not swung out across the
    // pavement round the way's first point, into the lamps)
    var P = FLOOR_PX, dir = back ? 1 : -1, K = { p: wkAlongOn(L, s + dir * 2.1 * P) }, Ax = { p: wkAlongOn(L, s + dir * 12.6 * P) };
    var tang = Math.hypot(K.p[0] - Ax.p[0], K.p[1] - Ax.p[1]) > 0.5 * P ? Math.atan2(K.p[1] - Ax.p[1], K.p[0] - Ax.p[0]) : (back ? ang + Math.PI : ang);
    return { x: A.p[0], y: A.p[1], ang: back ? ang + Math.PI : ang, tang: tang };
  }
  // (2026-10-06, machines clipping: a lorry turning in to the kerb, or out from it, swept its cab --
  // and its trailer behind it -- over the lamps and poles on the pavement and the cars parked past
  // the coned stretch.  Its turn is tried as it was, gentler and sharper; the first that sweeps over
  // nothing is kept, or, none, the one that sweeps over least.  And a stand along the kerb is kept
  // only where one does -- wkStandMid.)
  var WK_SWEEP_BAD = {}, WK_SWEEP_K = [1, 1.3, 0.8, 1.6, 0.65, 2.0];
  [WK_HOUSE, WK_THING, WK_CAR, WK_PIT, WK_OFF, WK_YARD].forEach(function (v) { WK_SWEEP_BAD[v] = 1; });
  // the squares it would be over, driven along L (`back`: reversing), that it may not be -- not
  // counting its own stand's (a parked pickup's own squares, marked as a car); `most`: stopped once past
  function wkSweepHits(site, L, back, stand, len, most, reach) {
    var G = site.G, P = site.P, hits = 0;
    // (its own squares: as wide as a parked pickup is marked, jbMarkCar -- not the stand's room round it,
    // which reaches the lamps at the kerb)
    var own = [stand.cx === undefined ? stand.x : stand.cx, stand.cy === undefined ? stand.y : stand.cy, stand.hl || len / 2 + 0.4 * P, 1.05 * P, stand.ang || 0];
    var oc = Math.cos(own[4]), os = Math.sin(own[4]);
    function rect(cx, cy, hl, hw, ang) {
      var c = Math.cos(ang), s = Math.sin(ang), ex = Math.abs(c) * hl + Math.abs(s) * hw, ey = Math.abs(s) * hl + Math.abs(c) * hw;
      var k0 = Math.max(0, Math.floor((cx - ex - G.x0) / G.c)), k1 = Math.min(G.cols - 1, Math.floor((cx + ex - G.x0) / G.c));
      var r0 = Math.max(0, Math.floor((cy - ey - G.y0) / G.c)), r1 = Math.min(G.rows - 1, Math.floor((cy + ey - G.y0) / G.c));
      for (var rr = r0; rr <= r1; rr++) {
        for (var kk = k0; kk <= k1; kk++) {
          if (!WK_SWEEP_BAD[G.t[rr * G.cols + kk]]) { continue; }
          var px = G.x0 + (kk + 0.5) * G.c, py = G.y0 + (rr + 0.5) * G.c, dx = px - cx, dy = py - cy;
          if (Math.abs(dx * c + dy * s) > hl || Math.abs(-dx * s + dy * c) > hw) { continue; }
          var ox = px - own[0], oy = py - own[1];
          if (Math.abs(ox * oc + oy * os) <= own[2] && Math.abs(-ox * os + oy * oc) <= own[3]) { continue; }
          hits++;
        }
      }
    }
    // (a lorry and its trailer bending behind it; a crane, a pump, a mixer all one -- by its kind, kept on
    // the stand by wkStand, or its length)
    var kind = stand.kind, ft = kind && WK_FOOT[kind], hw = 1.2 * P, half = len * 0.41;
    var artic = kind ? kind === "semi" || kind === "lowboy" : len > 15 * P;
    // (a stand found for more than comes to it -- the pump's, room for a mixer behind: as long as it is)
    if (ft && Math.abs(ft[1] * 2 * P - len) > 2.5 * P) { ft = null; }
    for (var s = 0; s <= L.len && hits <= most; s += 0.75 * P) {
      var q = wkPoseOn(L, s, back);
      // (only near the stand: on along the lane, far off, nothing is parked in the way)
      if (Math.abs(q.x - stand.x) > reach) { continue; }
      if (artic) {
        rect(q.x, q.y, 3.4 * P, hw, q.ang);
        var kx = q.x - Math.cos(q.ang) * 2.1 * P, ky = q.y - Math.sin(q.ang) * 2.1 * P;
        rect(kx - Math.cos(q.tang) * half, ky - Math.sin(q.tang) * half, half, hw, q.tang);
      } else if (ft) {
        rect(q.x + Math.cos(q.ang) * ft[0] * P, q.y + Math.sin(q.ang) * ft[0] * P, ft[1] * P, hw, q.ang);
      } else {
        rect(q.x, q.y, len / 2 + 0.4 * P, hw, q.ang);
      }
    }
    return hits;
  }
  // `make(R)` the way's points for a turn as wide as R: the R that sweeps over least (kept on the
  // stand, as how many squares it does: stand.wkSw).  `quick`: only whether one sweeps over nothing.
  function wkSweepPick(site, stand, len, R, make, back, tag, quick) {
    if (!site.G || !stand) { return make(R); }
    var key = (quick ? "q" : "") + tag + Math.round(len) + ":" + (site.gridGen || 0), memo = stand.wkSw || (stand.wkSw = {});
    if (memo[key] !== undefined) { return make(R * memo[key]); }
    var bestK = 1, bestHits = Infinity, reach = 2.4 * R * WK_SWEEP_K[WK_SWEEP_K.length - 1] + len;
    for (var i = 0; i < WK_SWEEP_K.length && bestHits > 0; i++) {
      var h = wkSweepHits(site, wkDrivePath(site, make(R * WK_SWEEP_K[i])), back, stand, len, quick ? 0 : bestHits, reach);
      if (h < bestHits) { bestHits = h; bestK = WK_SWEEP_K[i]; }
    }
    memo[key] = bestK; memo[key + "h"] = bestHits;
    return make(R * bestK);
  }
  // a stand along the kerb with a turn in to it and one out of it over nothing (lot-local, heading -x)
  function wkSweepClear(site, stand, len) {
    wkArrive(site, stand, len, true); wkLeave(site, stand, len, true);
    var m = stand.wkSw || {}, g = Math.round(len) + ":" + (site.gridGen || 0);
    return !m["qin" + g + "h"] && !m["qout" + g + "h"];
  }
  // A vehicle's arrival: along the near lane from far away (heading -x),
  // and then -- `stand` a pose in the lot, nose to the street -- backed in
  // past the kerb to it; or pulled in along the kerb (stand.street).
  function wkArrive(site, stand, len, quick) {
    var S = site.S, P = site.P, lane = site.lanes.w, R = Math.max(7 * P, len * 0.75), far = S.far || 60 * P;
    if (stand.street && Math.cos(stand.ang) > 0) {
      // (heading +x: come along the far lane, pulled over to this kerb)
      // (driven past along the far lane, pulled in to the kerb beyond it, and backed up to it -- what it
      // backs up to, a pump, stands at the kerb behind it)
      // (in the far lane, out past what is parked at the kerb, then backed round into it)
      // (and backed round as wide as sweeps over nothing at the kerb -- wkSweepPick, R as a share)
      var fl = site.lanes.e, bk2 = wkSweepPick(site, stand, len, R, function (R2) {
        var u = R2 / R, past2 = stand.x + (len * 1.25 + 3 * P) * u;
        return wkCurve([past2, fl], [stand.x + len * 0.55 * u, fl], [stand.x + len * 0.55 * u, stand.y], [stand.x, stand.y], 18);
      }, true, "bin", quick);
      var road2 = [[-far, fl], bk2[0]];
      return { fwd: wkDrivePath(site, road2), back: wkDrivePath(site, bk2) };
    }
    if (stand.street) {
      var road = wkSweepPick(site, stand, len, R, function (R2) {
        return [[far, lane], [stand.x + R2 * 0.9, lane]].concat(wkCurve([stand.x + R2 * 0.9, lane], [stand.x + R2 * 0.5, lane], [stand.x + R2 * 0.4, stand.y], [stand.x, stand.y], 10).slice(1));
      }, false, "in", quick);
      return { fwd: wkDrivePath(site, road), back: null };
    }
    var pass = stand.x - R;                         // driven past it, then backed in
    var fwd = wkDrivePath(site, [[far, lane], [pass, lane]]);
    var entry = Math.min(S.hy - 0.2 * P, stand.y + len / 2);
    var bk = [[pass, lane]].concat(wkCurve([pass, lane], [stand.x, lane], [stand.x, lane - R * 0.7], [stand.x, Math.max(entry, Math.min(lane - R * 0.9, S.hy))], 14).slice(1));
    if (bk[bk.length - 1][1] > stand.y + 1) { bk.push([stand.x, stand.y]); }
    else { bk[bk.length - 1] = [stand.x, stand.y]; }
    return { fwd: fwd, back: wkDrivePath(site, bk) };
  }
  // and away: out to the road, on along it (heading -x)
  function wkLeave(site, stand, len, quick) {
    var S = site.S, P = site.P, lane = site.lanes.w, R = Math.max(7 * P, len * 0.75), far = S.far || 60 * P;
    if (stand.street && Math.cos(stand.ang) > 0) {
      var fl = site.lanes.e;
      return wkDrivePath(site, wkSweepPick(site, stand, len, R, function (R2) {
        var R3 = R2 * 1.7;
        return wkCurve([stand.x, stand.y], [stand.x + R3 * 0.5, stand.y], [stand.x + R3 * 0.6, fl], [stand.x + R3 * 1.2, fl], 16).concat([[far, fl]]);
      }, false, "bout", quick));
    }
    if (stand.street) {
      return wkDrivePath(site, wkSweepPick(site, stand, len, R, function (R2) {
        return wkCurve([stand.x, stand.y], [stand.x - R2 * 0.4, stand.y], [stand.x - R2 * 0.5, lane], [stand.x - R2 * 0.9, lane], 10).concat([[-far, lane]]);
      }, false, "out", quick));
    }
    var y0 = Math.max(stand.y, Math.min(lane - R * 0.9, S.hy));
    var pts = [[stand.x, stand.y]];
    if (y0 > stand.y + 1) { pts.push([stand.x, y0]); }
    return wkDrivePath(site, pts.concat(wkCurve([stand.x, y0], [stand.x, lane], [stand.x - R * 0.4, lane], [stand.x - R, lane], 12).slice(1)).concat([[-far, lane]]));
  }
  // where a vehicle can stand to do a job near `target` (lot-local [x, y]):
  // backed in from the street with room all down its way in, its back
  // within `reach` of the target -- or, failing that, along the kerb.
  function wkStand(plan, spec) {
    var ft = spec.kind && WK_FOOT[spec.kind], P0 = plan.site.P;
    if (ft) { spec = Object.assign({}, spec, { len: ft[1] * 2 * P0, wid: ft[2] * 2 * P0, foff: ft[0] * P0 }); }
    var got = wkStandMid(plan, spec), off = ft ? ft[0] * P0 : 0;
    // (the machine put so its middle is there)
    got.cx = got.x; got.cy = got.y; got.kind = spec.kind;
    got.x -= Math.cos(got.ang) * off; got.y -= Math.sin(got.ang) * off;
    return got;
  }
  function wkStandMid(plan, spec) {
    var site = plan.site, S = site.S, P = site.P, G = site.G, hl = spec.len / 2 + 0.4 * P, hw = spec.wid / 2 + 0.5 * P;
    var tgt = spec.target, best = null, okLot = [WK_LOT, WK_PAVED, WK_WALKWAY], okWay = [WK_LOT, WK_PAVED, WK_WALKWAY, WK_ROAD];
    // (the strip kept round the building for the scaffold: the earth movers and the pour may use it before the scaffold is up)
    if (spec.ring) { okLot = okLot.concat([WK_STACK]); okWay = okWay.concat([WK_STACK]); }
    // (and before anything is built, its footprint is ground like the rest -- not the pit, though)
    if (spec.ground) { okLot = okLot.concat([WK_STACK, WK_HOUSE]); okWay = okWay.concat([WK_STACK, WK_HOUSE]); }
    var t0 = spec.t0 || 0, t1 = spec.t1 === undefined ? Infinity : spec.t1;
    var lotW = site.lot ? site.lot.w / 2 : Math.abs(S.box[0]) + 15 * P;
    if (!spec.street) {
      for (var x = -lotW + hw; x <= lotW - hw; x += 0.5 * P) {
        // how deep it can back: down from the kerb while the way stays clear
        var deep = null;
        for (var y = S.hy - hl; y > G.y0 + hl; y -= 0.5 * P) {
          if (!wkRectFree(site, x, y, hl, hw, Math.PI / 2, okLot, plan.res, t0, t1)) { break; }
          // (and the way in behind it, out to the road)
          deep = y;
          var rear = [x, y - hl], d = Math.hypot(rear[0] - tgt[0], rear[1] - tgt[1]);
          if (d <= (spec.reach || 3 * P) && (!best || d + Math.abs(x - tgt[0]) * 0.3 < best.score)) {
            // (the way in behind it, out to the lane it comes from -- as wide as the bend it backs round sweeps)
            var ln = site.lanes ? site.lanes.w : S.lane;
            if (wkRectFree(site, x, (y + ln) / 2, (ln - y) / 2 + hl * 0.2, hw + 1.2 * P, Math.PI / 2, okWay, plan.res, t0, t1)) {
              best = { x: x, y: y, ang: Math.PI / 2, score: d + Math.abs(x - tgt[0]) * 0.3 };
            }
          }
          if (spec.shallow && deep !== null) { break; }
        }
      }
    }
    if (!best || spec.street) {
      // along the kerb: as near the target as the parked cars and the others let it
      var yk = S.kerb + spec.wid / 2 + 0.25 * P, hk = spec.wid / 2 + 0.1 * P, hlRoom = hl + 1.2 * P;
      // (and with a way in to it and out of it over nothing parked or standing -- wkSweepClear: of
      // the first stretches long enough, the nearest that has; or, none, the nearest)
      var foff = spec.foff || 0;
      var kerbAt = function (busy) {
        var first = null, tries = 0, got = null;
        for (var dx = 0; dx < 100 * P && got === null; dx += 0.5 * P) {
          [tgt[0] + dx, tgt[0] - dx].some(function (xx) {
            if (!wkRectFree(site, xx, yk, hlRoom, hk, Math.PI, [WK_ROAD], busy, t0, t1)) { return false; }
            if (first === null) { first = xx; }
            if (tries++ < 160 && !wkSweepClear(site, { x: xx + foff, y: yk, cx: xx, cy: yk, ang: Math.PI, street: true, hl: hl, hw: hw, kind: spec.kind }, spec.len)) { return false; }
            got = tries <= 160 ? xx : first;
            return true;
          });
        }
        return got !== null ? got : first;
      };
      var kx = kerbAt(plan.res);
      // (none free for all the time it is wanted: the nearest stretch with nothing parked or standing
      // on it -- the times left to whoever asked, plan.noStand counting it -- not the target, cars and all)
      if (kx === null) { kx = kerbAt(null); if (kx !== null) { plan.noStand = (plan.noStand || 0) + 1; } }
      if (kx !== null) { best = { x: kx, y: yk, ang: Math.PI, street: true }; }
    }
    if (!best) {
      best = { x: tgt[0], y: S.kerb + spec.wid / 2 + 0.25 * P, ang: Math.PI, street: true };
      plan.noStand = (plan.noStand || 0) + 1;
    }
    best.hl = hl; best.hw = hw;
    return best;
  }
  // ---- a machine about the lot: a stand anywhere on it near a spot, and its way there ----------------
  // How far each square is from what a machine may not drive over (the
  // building, what stands about, the pit, off the lot), in squares.
  // (`ground`: before anything of the building is up -- its squares driven over like the rest of the
  // lot, as the earth movers do; 2026-10-05: they had no way to a stand on its ground, and were sent
  // there in a straight line, through the pickups parked on the drive)
  function wkVehClear(site, ground) {
    if (ground) {
      if (site.vclrG && site.vclrGGen === site.gridGen) { return site.vclrG; }
    } else if (site.vclr && site.vclrGen === site.gridGen) { return site.vclr; }
    var G = site.G, n = G.cols * G.rows, d = new Uint8Array(n).fill(30), q = [];
    for (var i = 0; i < n; i++) { var v = G.t[i]; if ((v === WK_HOUSE && !ground) || v === WK_THING || v === WK_OFF || v === WK_CAR || v === WK_PIT || v === WK_YARD) { d[i] = 0; q.push(i); } }
    for (var h = 0; h < q.length; h++) {
      var at = q[h], r = Math.floor(at / G.cols), c = at % G.cols, nd = d[at] + 1;
      if (nd > 29) { continue; }
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          var rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= G.rows || cc >= G.cols) { continue; }
          var j = rr * G.cols + cc;
          if (d[j] > nd) { d[j] = nd; q.push(j); }
        }
      }
    }
    if (ground) { site.vclrG = d; site.vclrGGen = site.gridGen; } else { site.vclr = d; site.vclrGen = site.gridGen; }
    return d;
  }
  // a way for a machine `half` wide (each side), lot-local, kept that clear of everything
  function wkVehWay(site, a, b, half, ground) {
    // (the same squares, as wide, on the same site: the way worked out before -- as wkGridWay keeps its own)
    var fc = wkCell(site, a[0], a[1]), tcl = wkCell(site, b[0], b[1]);
    if (fc >= 0 && tcl >= 0) {
      var vc = site.vehCache || (site.vehCache = new Map()), vk = fc + ">" + tcl + ":" + Math.round(half) + (ground ? "g" : "") + ":" + (site.gridGen || 0), was = vc.get(vk);
      if (was) {
        var cp = was.map(function (q) { return q.slice(); });
        cp[0] = a; cp[cp.length - 1] = b;
        if (was.blocked) { cp.blocked = true; }
        return cp;
      }
      var made = wkVehWayFresh(site, a, b, half, ground);
      if (vc.size > 20000) { vc.clear(); }
      var keep = made.map(function (q) { return q.slice(); });
      if (made.blocked) { keep.blocked = true; }
      vc.set(vk, keep);
      return made;
    }
    return wkVehWayFresh(site, a, b, half, ground);
  }
  function wkVehWayFresh(site, a, b, half, ground) {
    var G = site.G, D = wkVehClear(site, ground);
    function clear(h) { var need = Math.ceil(h / G.c); return wkGridLine(site, a, b, function (i) { return D[i] >= need; }); }
    var got = wkVehWayRaw(site, a, b, half, ground);
    if (got.length > 2 || clear(half)) { return got; }
    // (straight only because none was found: tried narrower, down to its own width)
    // (2026-10-05: no narrower than three quarters of what was asked -- the machine's own width with a
    // little to spare; narrower, it scraped through the trucks parked beside its way.  None that wide:
    // blocked, and it stays where it is)
    var tries = [half * 0.85, half * 0.75];
    for (var i = 0; i < tries.length; i++) {
      if (tries[i] >= half) { continue; }
      var g2 = wkVehWayRaw(site, a, b, tries[i], ground);
      if (g2.length > 2 || clear(tries[i])) { return g2; }
    }
    // (none even so: a way only kept off what stands about -- squeezed by it, not driven straight
    // through it, for those that drive it all the same; still blocked, for those that stay put)
    var g3 = wkVehWayRaw(site, a, b, half * 0.6, ground);
    g3.blocked = true;
    return g3;
  }
  function wkVehWayRaw(site, a, b, half, ground) {
    var G = site.G, D = wkVehClear(site, ground), need = Math.ceil(half / G.c), from = wkCell(site, a[0], a[1]), to = wkCell(site, b[0], b[1]);
    if (from < 0 || to < 0) { return [a, b]; }
    function open(i) { return D[i] >= need || i === from || i === to; }
    if (wkGridLine(site, a, b, open)) { return [a, b]; }
    // (none, between runs of ground as wide as it never joined: given up at once)
    if (!wkPartsMeet(site, wkParts(site, "veh" + need + (ground ? "g" : ""), function (i) { return D[i] >= need; }), from, to)) { return [a, b]; }
    var n = G.cols * G.rows, A = wkAsBegin(n), run = A.run, shut = A.shut;
    wkAsSet(A, from, 0, -1); wkAsPush(A, 0, from);
    var tc = to % G.cols, tr = Math.floor(to / G.cols), steps = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]], found = false, guard = 0;
    while (A.hn && guard < 300000) {
      var i = wkAsPop(A);
      if (i === to) { found = true; break; }
      // (each square looked round once: the way to it is the cheapest by then)
      if (shut[i] === run) { continue; }
      shut[i] = run; guard++;
      var c0 = i % G.cols, r0 = Math.floor(i / G.cols), base = A.cost[i];
      for (var s = 0; s < 8; s++) {
        var c = c0 + steps[s][0], r = r0 + steps[s][1];
        if (c < 0 || r < 0 || c >= G.cols || r >= G.rows) { continue; }
        var j = r * G.cols + c;
        if (!open(j)) { continue; }
        var to2 = base + steps[s][2] * (1 + (D[j] < need + 2 ? 0.6 : 0));
        if (to2 < wkAsCost(A, j)) { wkAsSet(A, j, to2, i); wkAsPush(A, to2 + Math.hypot(c - tc, r - tr), j); }
      }
    }
    if (!found) { return [a, b]; }
    var cells = [];
    for (var at = to; at >= 0; at = A.back[at]) { cells.push(at); }
    cells.reverse();
    var pts = [a], cur = a, k = 0;
    while (k < cells.length - 1) {
      var far = k + 1;
      for (var qq = cells.length - 1; qq > k + 1; qq--) { if (wkGridLine(site, cur, wkCellMid(site, cells[qq]), open)) { far = qq; break; } }
      if (far === cells.length - 1) { break; }
      cur = wkCellMid(site, cells[far]); pts.push(cur); k = far;
    }
    pts.push(b);
    return pts;
  }
  // a stand for a machine near `target` (lot-local), anywhere on the lot it fits, facing the target
  function wkNearStand(plan, spec) {
    var site = plan.site, P = site.P, D = wkVehClear(site), hl = spec.len / 2 + 0.3 * P, hw = spec.wid / 2 + 0.3 * P;
    var tgt = spec.target, t0 = spec.t0 || 0, t1 = spec.t1 === undefined ? Infinity : spec.t1, best = null;
    var ok = [WK_LOT, WK_PAVED, WK_STACK, WK_WALKWAY];
    for (var r = Math.max(0.5 * P, spec.min || 0); r <= (spec.reach || 6 * P) && !best; r += 0.5 * P) {
      var steps = Math.max(8, Math.round(2 * Math.PI * r / (0.5 * P)));
      for (var k = 0; k < steps; k++) {
        var a = k / steps * Math.PI * 2, x = tgt[0] + Math.cos(a) * r, y = tgt[1] + Math.sin(a) * r;
        var ang = Math.atan2(tgt[1] - y, tgt[0] - x);
        // (its middle that far back from its nose, facing the target)
        var cx = x - Math.cos(ang) * hl * 0.6, cy = y - Math.sin(ang) * hl * 0.6, ci = wkCell(site, cx, cy);
        if (ci < 0 || D[ci] < 1) { continue; }
        if (!wkRectFree(site, cx, cy, hl, hw, ang, ok, plan.res, t0, t1)) { continue; }
        var score = r + (site.G.t[ci] === WK_WALKWAY ? 2 * P : 0);
        if (!best || score < best.score) { best = { x: cx, y: cy, ang: ang, score: score }; }
      }
    }
    if (!best) { return null; }
    best.hl = hl; best.hw = hw;
    return best;
  }
  function wkReserve(plan, stand, t0, t1) {
    plan.res.push({ rect: [stand.cx === undefined ? stand.x : stand.cx, stand.cy === undefined ? stand.y : stand.cy, stand.hl, stand.hw, stand.ang], t0: t0, t1: t1 });
  }
  // A vehicle's whole visit: driven in, at its stand from `at` to `go`,
  // driven away; its state there given by `work(k, T)` over each spell of
  // `spells` [{t0, t1, fn}] (lot-local pose added).  Returns {arrive, leave}.
  function wkVisit(plan, m, stand, len, tReady, spells, tGo, opt) {
    opt = opt || {};
    var site = plan.site, P = site.P, way = wkArrive(site, stand, len), speed = (opt.speed || 6) * P, slow = 2.2 * P;
    var tf = way.fwd.len / speed + 2, tb = way.back ? way.back.len / slow + 2 : 0;
    var arriveAt = tReady - tb - tf;
    var pose0 = { x: stand.x, y: stand.y, ang: stand.ang };
    function put(pose, extra) { return Object.assign({ x: pose.x, y: pose.y, ang: pose.ang, tang: pose.tang, site: site }, extra || {}); }
    wkMSeg(m, arriveAt, arriveAt + tf, function (k) { return put(wkPoseOn(way.fwd, way.fwd.len * wkEaseDrive(k), false), { moving: true }); });
    if (way.back) { wkMSeg(m, arriveAt + tf, tReady, function (k) { return put(wkPoseOn(way.back, way.back.len * wkSmooth(k), true), { moving: true, reversing: true }); }); }
    var at = tReady;
    spells.forEach(function (sp) {
      if (sp.t0 > at + 0.01) { var hold = at; wkMSeg(m, hold, sp.t0, function () { return put(pose0, opt.idle ? opt.idle() : {}); }); }
      wkMSeg(m, sp.t0, sp.t1, function (k, T) { return put(pose0, sp.fn(k, T)); });
      at = sp.t1;
    });
    if (tGo > at + 0.01) { wkMSeg(m, at, tGo, function () { return put(pose0, opt.idle ? opt.idle() : {}); }); at = tGo; }
    var away = wkLeave(site, stand, len), tl = away.len / speed + 2;
    wkMSeg(m, at, at + tl, function (k) { return put(wkPoseOn(away, away.len * wkEaseDrive(k, true), false), { moving: true }); }).gone = true;
    wkReserve(plan, stand, arriveAt + tf, at + 1);
    return { arrive: arriveAt, ready: tReady, leave: at + tl };
  }
  // (slowing to a stop as it gets there; pulling away as it goes)
  function wkEaseDrive(k, out) { k = wkClamp(k); return out ? 0.5 * k + 0.5 * k * k : 0.5 * k + 0.5 * (1 - (1 - k) * (1 - k)); }

  // ---- the movers' ways too: room to room through the doors (40-movein.js's moLegs looked over every square) ----
  if (typeof moLegs === "function") {
    var moLegsWorks = moLegs;
    moLegs = function (M, from, n, depth) {
      var plan = WK.plan, site = plan && plan.site;
      if (site && site.walk === M.plan && n) {
        try {
          var got = wkLegs(site, M, from, n);
          if (got) { return got; }
        } catch (e) { /* as it was */ }
      }
      return moLegsWorks.apply(this, arguments);
    };
  }
  // from a point (the walk plan's own numbers) to a piece: room to room, up or down the stairs storey by storey
  function wkLegs(site, M, from, n) {
    var floors = M.floors, f = floors.length ? floorAt(floors, from[0], from[1]) : null, fn = floors.length ? floorAt(floors, n.x, n.y) : null;
    var zs = site.ctx.zs, li = zs.indexOf(f ? f.z : 0), lj = zs.indexOf(fn ? fn.z : 0);
    if (li < 0 || lj < 0) { return null; }
    var cur = [from[0] + (f ? f.dx : 0), from[1] + (f ? f.dy : 0), f ? f.z : 0], end = [n.x + (fn ? fn.dx : 0), n.y + (fn ? fn.dy : 0), fn ? fn.z : 0];
    var pts = [cur], ids = [], guard = 0;
    function across(L, a, b) {
      var g = wkRoomGraph(site, L), ra = wkRoomOf(g, a), rb = wkRoomOf(g, b), via = ra >= 0 && rb >= 0 ? wkRoomPath(g, ra, rb) : null;
      if (!via) { return false; }
      via.forEach(function (d) {
        pts.push(d[0].slice(), d[1].slice(), d[2].slice());
        g.doors.forEach(function (dd) { if (dd.p === d[1] && ids.indexOf(dd.id) < 0) { ids.push(dd.id); } });
      });
      pts.push(b.slice());
      return true;
    }
    var L = li;
    while (L !== lj && guard++ < 12) {
      var next = lj > L ? L + 1 : L - 1, best = null, bd = Infinity;
      (site.stairs || []).forEach(function (c) {
        if (c.lo !== Math.min(L, next) || c.hi !== Math.max(L, next)) { return; }
        var s0 = L < next ? c.foot : c.top, d = Math.hypot(s0[0] - cur[0], s0[1] - cur[1]);
        if (d < bd) { bd = d; best = c; }
      });
      if (!best) { return null; }
      var a = L < next ? best.foot : best.top, b = L < next ? best.top : best.foot;
      if (!across(L, cur, a)) { return null; }
      pts.push(b.slice());
      cur = b; L = next;
    }
    if (!across(L, cur, end)) { return null; }
    return { pts: pts, doors: ids };
  }

  // ---- put into the build ----------------------------------------------------------------------------------
  // (40-build.js's staged build, and 40-movein.js's moving in, given over to
  // this while a building goes up; if the timetable cannot be made, as it was)
  if (typeof bpBuilding === "function") {
    var bpBuildingWorks = bpBuilding;
    bpBuilding = function (model, t) {
      var got = null;
      try { got = WK_PHASES.length ? wkBuilding(model, t) : null; } catch (e) { if (window.console && console.warn) { console.warn("works:", e && e.stack || e); } got = null; }
      return got || bpBuildingWorks.apply(this, arguments);
    };
  }
  // the street: the near lane coned off while lorries stand in it -- the
  // cars going by that way held back, none driven through a lorry
  if (typeof worldFolk === "function") {
    var worldFolkWorks = worldFolk;
    worldFolk = function (model) {
      var out = worldFolkWorks.apply(this, arguments);
      try {
        var plan = WK.plan;
        if (plan && plan.ok && bpSite === plan.bp && model.passing && plan.site.lot) {
          // (the street closed to through traffic while the lorries come and go: none driven through one)
          model.passing.faces = model.passing.faces.filter(function (f) { return !f.how || !f.how.car; });
        }
      } catch (e) { /* as it was */ }
      return out;
    };
  }
