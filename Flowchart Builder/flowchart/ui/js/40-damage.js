// ---------------------------------------------------------------------------
//  40-damage.js -- the storm test, watched and reckoned up: a bar over the
//  3D view while a storm is let loose -- paused, slowed down or sped up,
//  the camera kept on what the storm carries off, a tornado's way across
//  chosen -- and, when it has passed, what was lost and roughly what
//  putting it right costs
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (my own list, 2026-10-03d B and C, the user: "keep adding more things
  // and make sure everything works")
  var DM = { paused: false, rate: 1, follow: false, path: "edge", atOnce: false, shut: null, vt: null, real: null, bar: null, card: null, cardFor: null };
  var DM_RATES = [1, 0.5, 0.25, 2];
  // Rough repair costs, US dollars, 2025 averages: an asphalt roof put back
  // about $6.50 a square foot (and the decking under it where it went with
  // it); an outside wall rebuilt about $22 a square foot; a window about
  // $1,000 put in; a house built again $162 a square foot (the NAHB's 2025
  // survey); one pushed off its foundation lifted and set back, up to $25
  // a square foot; a fallen tree taken away about $1,000; an inch of water through
  // a house about $25,000 (FEMA's FloodSmart) -- deeper, more, slower.
  var DM_COST = { roofM2: 70, deckM2: 45, wallM2: 240, window: 1000, skinM2: 1300, chimney: 8000, thing: 500, fixture: 1200,
                  tree: 1000, yard: 300, shed: 3000, car: 25000, solar: 18000, buildM2: 1744, floodM2: 108, resetM2: 270 };
  var DM_CARS = { i_parked: 1, i_car: 1, i_truck: 1, i_van: 1, i_suv: 1 };
  var DM_SHEDS = { i_shed: 1, i_pavilion: 1, i_gazebo: 1, i_playset: 1 };

  // ---- the storm's own clock: stopped, slowed, sped -----------------------------------------------
  // (one time for everything that moves with the storm: the bodies flying,
  // the rain over the view -- 40-storm.js asks it through smNow)
  function dmClock(now) {
    if (DM.vt === null) { DM.vt = now; DM.real = now; return now; }
    if (now !== DM.real) {
      var k = dmLive() ? (DM.paused ? 0 : DM.rate) : 1;
      DM.vt += (now - DM.real) * k;
      DM.real = now;
    }
    return DM.vt;
  }
  function dmLive() { return typeof fxOn === "function" && fxOn() && !!FX.plan; }
  if (typeof fxStep === "function") {
    var fxStepDm = fxStep;
    fxStep = function (F, dt) {
      if (!DM.atOnce && F === FX) {
        if (DM.paused) { return; }
        dt *= DM.rate;
      }
      var out = fxStepDm.call(this, F, dt);
      try { dmTrack(F); } catch (e) { /* kept as it was */ }
      return out;
    };
  }
  if (typeof fxAtOnce === "function") {
    var fxAtOnceDm = fxAtOnce;
    fxAtOnce = function () { DM.atOnce = true; try { return fxAtOnceDm.apply(this, arguments); } finally { DM.atOnce = false; } };
  }
  // the deepest the water came inside, over the ground floor
  function dmTrack(F) {
    var L = F.plan;
    if (!L || (F.kind !== "flood" && F.kind !== "hurricane")) { return; }
    var w = fxWater(F) - L.slab / L.P;
    if (isFinite(w)) { F.dmWet = Math.max(F.dmWet || 0, w); }
  }
  // (a storm chosen while the building is still going up: built at once, so the storm comes now -- not after)
  if (typeof smRun === "function") {
    var smRunDm = smRun;
    smRun = function () {
      try { var sk = V3 && V3.storm && V3.box && typeof bpSite !== "undefined" && bpSite ? el(".v3-skip", V3.box) : null; if (sk) { sk.click(); } } catch (e) { /* as it goes */ }
      DM.paused = false;
      return smRunDm.apply(this, arguments);
    };
  }
  // A tornado's way across: right over the house (the calm of its middle
  // between two walls of wind), along its strongest edge (as it was), or
  // close by -- most houses near a tornado are not in its core.
  if (typeof fxPlan === "function") {
    var fxPlanDm = fxPlan;
    fxPlan = function (F) {
      var out = fxPlanDm.apply(this, arguments);
      if (F.kind === "tornado" && F.Rc) { F.miss = DM.path === "over" ? 0 : DM.path === "near" ? F.Rc + 90 : F.Rc; }
      return out;
    };
  }

  // ---- what was lost, and roughly the cost ----------------------------------------------------------
  function dmMoney(v) {
    var lang = (document.documentElement && document.documentElement.lang) || "en";
    try { return new Intl.NumberFormat(lang, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }
    catch (e) { return "$" + Math.round(v).toLocaleString(); }
  }
  function dmArea(m2) {
    var feet = typeof feetHere === "function" && feetHere();
    return feet ? Math.round(m2 * 10.764).toLocaleString() + " ft²" : Math.round(m2).toLocaleString() + " m²";
  }
  function dmDims(it, P) { var b = it.box; return b[0] === Infinity ? [0, 0, 0] : [(b[1] - b[0]) / P, (b[3] - b[2]) / P, (b[5] - b[4]) / P]; }
  function dmLost(it) { return it.state !== "held" || !!it.hide; }
  // (deeper water, more of the house to put right: walls, floors, wiring, what stood on the floor --
  // fast at first, slower past a metre, as the depth-damage curves go)
  function dmFloodPerM2(d) { return d <= 0 ? 0 : DM_COST.floodM2 * (1 + 6 * (1 - Math.exp(-d))); }
  function dmReport(F) {
    var L = F && F.plan;
    if (!L) { return null; }
    var P = L.P, rows = [], total = 0, info = [];
    function add(k, amount, cost) { rows.push({ k: k, amount: amount, cost: Math.round(cost / 100) * 100 }); total += cost; }
    var floor = 0, ground = 0;
    L.rooms.forEach(function (r) { var a = (2 * r.hw / P) * (2 * r.hh / P); floor += a; if (r.level === 0) { ground += a; } });
    var hb = L.house.body, moved = hb ? Math.hypot(hb.x[0] - hb.start[0], hb.x[1] - hb.start[1]) : 0;
    var wrecked = !!(F.seen.flew || F.seen.float || F.seen.bare || moved > 12 || (hb && hb.broke));
    if (wrecked) {
      // (lifted off, carried, or left a bare slab: built again, and what was in it bought again)
      add("loss", dmArea(floor), floor * DM_COST.buildM2 * 1.5);
    } else {
      // (pushed off its foundation and come to rest: lifted, and set back on it)
      if (moved > 0.3) { add("slid", dmArea(ground), ground * DM_COST.resetM2); }
      var roofM2 = 0, roofAll = 0;
      L.cells.forEach(function (c) { roofAll += c.area; if (dmLost(c)) { roofM2 += c.area; } });
      // (not cut into pieces -- hail, a flood: the ground floor's footprint, sloped)
      if (!L.cells.length) { roofAll = ground * 1.15; }
      if (roofM2 > 0.5) { add("roof", dmArea(roofM2), roofM2 * (DM_COST.roofM2 + DM_COST.deckM2)); }
      if (F.seen.cover) { add("cover", dmArea(roofAll - roofM2), (roofAll - roofM2) * DM_COST.roofM2); }
      var wallM2 = 0;
      L.panels.forEach(function (p) { if (p.ext && dmLost(p)) { var d = dmDims(p, P); wallM2 += Math.max(d[0], d[1]) * d[2]; } });
      if (wallM2 > 0.5) { add("walls", dmArea(wallM2), wallM2 * DM_COST.wallM2); }
      // (a window's panes -- its sashes, both its faces -- counted as the one window)
      var panes = 0, wins = [];
      L.glass.forEach(function (g) {
        if (!dmLost(g)) { return; }
        var c = fxMidOf(g);
        if (!wins.some(function (w) { return Math.hypot(w[0] - c[0], w[1] - c[1]) < 1.0 * P && Math.abs(w[2] - c[2]) < 1.0 * P; })) { wins.push(c); panes++; }
      });
      if (panes) { add("windows", String(panes), panes * DM_COST.window); }
      var skinM2 = 0;
      L.skins.forEach(function (s) { if (dmLost(s)) { var d = dmDims(s, P); skinM2 += Math.max(d[0], d[1]) * d[2]; } });
      if (skinM2 > 0.5) { add("skin", dmArea(skinM2), skinM2 * DM_COST.skinM2); }
      var chims = L.chims.filter(dmLost).length;
      if (chims) { add("chimney", String(chims), chims * DM_COST.chimney); }
      var things = 0, fixtures = 0;
      L.things.forEach(function (it) { if (it.out || it.tree || !dmLost(it)) { return; } if (it.built) { fixtures++; } else { things++; } });
      if (things) { add("things", String(things), things * DM_COST.thing); }
      if (fixtures) { add("fixtures", String(fixtures), fixtures * DM_COST.fixture); }
      if ((F.dmWet || 0) > 0.01) { add("flood", dmDepthSaid(F.dmWet), ground * dmFloodPerM2(F.dmWet)); }
    }
    if (F.seen.solar) { add("solar", "", DM_COST.solar); }
    var trees = 0, cars = 0, sheds = 0, yard = 0;
    L.things.forEach(function (it) {
      if (!it.out || !dmLost(it)) { return; }
      var k = it.node ? it.node.kind : "";
      if (it.tree) { trees++; } else if (DM_CARS[k]) { cars++; } else if (DM_SHEDS[k]) { sheds++; } else { yard++; }
    });
    if (trees) { add("trees", String(trees), trees * DM_COST.tree); }
    if (cars) { add("cars", String(cars), cars * DM_COST.car); }
    if (sheds) { add("sheds", String(sheds), sheds * DM_COST.shed); }
    if (yard) { add("yard", String(yard), yard * DM_COST.yard); }
    // round about: the neighbors' houses, the trees on the land (not this house's to pay for)
    var nb = 0, land = 0;
    if (F.swept) { F.swept.forEach(function (k) { if (String(k).indexOf("nb") === 0) { nb++; } else { land++; } }); }
    if (nb) { info.push(say("dm_neighbors", { n: nb })); }
    if (land) { info.push(say("dm_land", { n: land })); }
    if (F.seen.safe) { info.push(TXT.dm_safe); }
    return { rows: rows, total: total < 10000 ? Math.round(total / 100) * 100 : Math.round(total / 1000) * 1000, exact: total, info: info, wrecked: wrecked, done: !!F.done };
  }
  function dmHead(F) { return F && F.kind === "fire" && TXT.dm_head_fire ? TXT.dm_head_fire : F && F.kind === "drill" && TXT.dm_head_drill ? TXT.dm_head_drill : TXT.dm_head; }
  function dmDepthSaid(m) { return typeof smDepth === "function" ? smDepth(m) : m.toFixed(2) + " m"; }
  // the report drawn into a box: a row for each, the total, where the numbers come from
  function dmReportInto(box, R) {
    box.innerHTML = "";
    if (!R.rows.length) {
      var none = document.createElement("p");
      none.className = "dm-none";
      none.textContent = TXT.dm_none;
      box.appendChild(none);
    } else {
      var list = document.createElement("ul");
      list.className = "dm-rows";
      R.rows.forEach(function (r) {
        var li = document.createElement("li");
        li.innerHTML = '<span class="dm-what"></span><span class="dm-amt"></span><span class="dm-cost"></span>';
        li.querySelector(".dm-what").textContent = r.what || TXT["dm_" + r.k];
        li.querySelector(".dm-amt").textContent = r.amount;
        li.querySelector(".dm-cost").textContent = r.text !== undefined ? r.text : dmMoney(r.cost);
        list.appendChild(li);
      });
      box.appendChild(list);
      var tot = document.createElement("p");
      tot.className = "dm-total";
      tot.textContent = R.said || say(R.done ? "dm_total" : "dm_total_so_far", { cost: dmMoney(R.total) });
      box.appendChild(tot);
    }
    R.info.forEach(function (s) {
      var p = document.createElement("p");
      p.className = "dm-info";
      p.textContent = s;
      box.appendChild(p);
    });
    if (R.rows.length) {
      var note = document.createElement("p");
      note.className = "dm-note";
      note.textContent = R.note || TXT.dm_note;
      box.appendChild(note);
    }
  }

  // ---- in the storm test's sheet: the way across, what was lost ---------------------------------------
  if (typeof fxSection === "function") {
    var fxSectionDm = fxSection;
    fxSection = function (sheet) {
      var out = fxSectionDm.apply(this, arguments);
      try { dmSection(sheet); } catch (e) { /* the sheet as it was */ }
      return out;
    };
  }
  function dmSection(sheet) {
    if (!dmLive() && !(typeof fxOn === "function" && fxOn())) { return; }
    var F = FX, wrap = document.createElement("div");
    wrap.className = "dm-sheet";
    if (F.kind === "tornado") {
      var h = document.createElement("div");
      h.className = "v3-mats-head";
      h.textContent = TXT.dm_path;
      wrap.appendChild(h);
      var grid = document.createElement("div");
      grid.className = "hs-tiles";
      ["over", "edge", "near"].forEach(function (k) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "hs-tile";
        b.setAttribute("aria-pressed", DM.path === k ? "true" : "false");
        b.innerHTML = houseIcon("dm_path_" + k) + '<span class="hs-tile-name"></span>';
        b.querySelector(".hs-tile-name").textContent = TXT["dm_path_" + k];
        b.onclick = function () {
          DM.path = k;
          Array.prototype.forEach.call(grid.children, function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
          fxStart(true);
          if (FX) { FX.said = ""; }
        };
        grid.appendChild(b);
      });
      wrap.appendChild(grid);
    }
    var head = document.createElement("div");
    head.className = "v3-mats-head";
    head.textContent = dmHead(F);
    wrap.appendChild(head);
    var box = document.createElement("div");
    box.className = "dm-report";
    box.setAttribute("aria-live", "polite");
    wrap.appendChild(box);
    sheet.appendChild(wrap);
    var R = dmReport(FX);
    if (R) { dmReportInto(box, R); } else { box.textContent = TXT.dm_wait; }
    DM.sheetBox = box;
  }

  // ---- over the 3D view: the bar, and the report when it has passed -------------------------------------
  var DM_ICON = {
    pause: '<path d="M7 4.5v11M13 4.5v11"/>',
    play: '<path d="M6.5 4.2v11.6L16 10z"/>',
    follow: '<circle cx="10" cy="10" r="5.6"/><circle cx="10" cy="10" r="1.6"/><path d="M10 1.8v3M10 15.2v3M1.8 10h3M15.2 10h3"/>',
    again: '<path d="M15.6 10a5.6 5.6 0 1 1-1.7-4"/><path d="M14.4 2.6l-.4 3.6-3.6-.4"/>',
    report: '<path d="M5 3.5h10v13H5z"/><path d="M7.5 7h5M7.5 10h5M7.5 13h3"/>',
    shut: '<path d="M5 5l10 10M15 5L5 15"/>'
  };
  function dmSvg(k) { return '<svg viewBox="0 0 20 20" aria-hidden="true">' + DM_ICON[k] + "</svg>"; }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.dm_path_over = '<path d="M3 17h14"/><path d="M10 15.4V3"/><path d="M6.5 6.5 10 3l3.5 3.5"/><path d="M7.4 15.4v-3h5.2v3"/>';
    HOUSE_ICONS.dm_path_edge = '<path d="M3 17h14"/><path d="M13.6 15.4V3"/><path d="M10.4 6.2 13.6 3l3.2 3.2"/><path d="M3.6 15.4v-3h5.2v3"/>';
    HOUSE_ICONS.dm_path_near = '<path d="M3 17h14"/><path d="M16.4 15.4V3"/><path d="M14.2 5.2 16.4 3l2 2.2"/><path d="M3 15.4v-3h5.2v3"/><path d="M11 9.5h1.6"/>';
  }
  function dmBar() {
    var bar = document.createElement("div");
    bar.className = "dm-bar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", TXT.dm_bar);
    bar.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); });
    bar.addEventListener("wheel", function (ev) { ev.stopPropagation(); });
    function btn(cls, html, label, on) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dm-b " + cls;
      b.innerHTML = html;
      b.setAttribute("aria-label", label);
      b.title = label;
      b.onclick = on;
      bar.appendChild(b);
      return b;
    }
    bar.play = btn("dm-play", dmSvg("pause"), TXT.dm_pause, function () { DM.paused = !DM.paused; dmBarFresh(); });
    bar.rate = btn("dm-rate", "<span>1×</span>", TXT.dm_rate, function () {
      DM.rate = DM_RATES[(DM_RATES.indexOf(DM.rate) + 1) % DM_RATES.length];
      dmBarFresh();
    });
    bar.follow = btn("dm-follow", dmSvg("follow") + "<span></span>", TXT.dm_follow_tip, function () { DM.follow = !DM.follow; dmBarFresh(); });
    bar.follow.lastChild.textContent = TXT.dm_follow;
    bar.again = btn("dm-again", dmSvg("again"), TXT.dm_again, function () {
      DM.paused = false; DM.cardFor = null; dmCardShut();
      fxStart(true);
      if (FX) { FX.said = ""; }
      dmBarFresh();
    });
    bar.report = btn("dm-show", dmSvg("report"), TXT.dm_head, function () { DM.cardFor = null; DM.shut = null; dmCard(true); });
    bar.time = document.createElement("span");
    bar.time.className = "dm-time";
    bar.time.setAttribute("aria-hidden", "true");
    bar.appendChild(bar.time);
    return bar;
  }
  function dmBarFresh() {
    var bar = DM.bar;
    if (!bar) { return; }
    var done = !!(FX && FX.done);
    bar.play.innerHTML = dmSvg(DM.paused ? "play" : "pause");
    bar.play.setAttribute("aria-label", DM.paused ? TXT.dm_play : TXT.dm_pause);
    bar.play.title = bar.play.getAttribute("aria-label");
    bar.play.setAttribute("aria-pressed", DM.paused ? "true" : "false");
    bar.play.disabled = done;
    var shown = DM.rate === 0.5 ? "½×" : DM.rate === 0.25 ? "¼×" : DM.rate + "×";
    bar.rate.firstChild.textContent = shown;
    bar.rate.setAttribute("aria-label", say("dm_rate_now", { rate: shown }));
    bar.rate.classList.toggle("dm-on", DM.rate !== 1);
    bar.follow.setAttribute("aria-pressed", DM.follow ? "true" : "false");
    bar.report.hidden = !done;
  }
  function dmCardShut() { if (DM.card) { DM.card.remove(); DM.card = null; } }
  function dmCard(force) {
    var F = FX, R = dmReport(F);
    if (!R || !V3 || !V3.box) { return; }
    dmCardShut();
    if (!force && DM.shut === F) { return; }
    var c = document.createElement("div");
    c.className = "dm-card";
    c.setAttribute("role", "dialog");
    c.setAttribute("aria-label", TXT.dm_head);
    c.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); });
    c.addEventListener("wheel", function (ev) { ev.stopPropagation(); });
    c.innerHTML = '<div class="dm-card-head"><b></b><span class="dm-card-sub"></span><button type="button" class="dm-x">' + dmSvg("shut") + "</button></div><div class=\"dm-report\"></div>";
    c.querySelector("b").textContent = dmHead(F);
    c.querySelector(".dm-card-sub").textContent = TXT["sm_" + F.storm] + " · " + smMeasure(F.St);
    var x = c.querySelector(".dm-x");
    x.setAttribute("aria-label", TXT.dm_close);
    x.title = TXT.dm_close;
    x.onclick = function () { DM.shut = F; dmCardShut(); };
    dmReportInto(c.querySelector(".dm-report"), R);
    V3.box.appendChild(c);
    DM.card = c;
    DM.cardFor = F;
  }
  // Each picture: the bar there while a storm is let loose, the camera after
  // what flies, the report up once it has passed.
  function dmFollow(F) {
    if (!DM.follow || DM.paused || !V3 || V3.mode === "walk" || V3.flat || !F.plan || V3.w === undefined) { return; }
    var L = F.plan, P = L.P, b = L.house.body && L.house.body.awake ? L.house.body : null;
    if (!b) { F.free.forEach(function (q) { if (q.awake && q.it.state !== "gone" && (!b || q.m > b.m)) { b = q; } }); }
    var at = b ? [b.x[0] * P, b.x[1] * P, b.x[2] * P] : DM.lastAt || [L.H[0], L.H[1], L.H[2]];
    DM.lastAt = at;
    var q = v3Project(at), k = 0.12;
    V3.panX -= (q.x - V3.w / 2) * k;
    V3.panY -= (q.y - V3.h / 2) * k;
    V3.dirty = true;
  }
  (function dmTick() {
    try {
      var on = typeof fxOn === "function" && fxOn(), box = V3 && V3.box;
      if (!on || !box || !box.isConnected) {
        if (DM.bar) { DM.bar.remove(); DM.bar = null; }
        dmCardShut();
        if (!on) { DM.paused = false; }
      } else {
        if (!DM.bar || DM.bar.parentNode !== box) { if (DM.bar) { DM.bar.remove(); } DM.bar = dmBar(); box.appendChild(DM.bar); dmBarFresh(); }
        var F = FX;
        if (DM.bar.time) {
          var s = Math.max(0, Math.floor(F.t || 0)), shown = Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
          if (DM.bar.time.textContent !== shown) { DM.bar.time.textContent = shown; }
        }
        if (F.done !== DM.wasDone) { DM.wasDone = F.done; dmBarFresh(); }
        if (DM.card && DM.cardFor !== F) { dmCardShut(); }
        if (F.done && F.plan && DM.cardFor !== F && DM.shut !== F) { dmCard(false); }
        if (!F.done) { dmFollow(F); }
        // (the report in the sheet, kept up as it goes)
        if (DM.sheetBox && DM.sheetBox.isConnected && (DM.sheetF !== F || Math.abs((F.t || 0) - (DM.sheetAt || 0)) > 0.5 || F.done !== DM.sheetDone)) {
          DM.sheetAt = F.t || 0; DM.sheetF = F; DM.sheetDone = F.done;
          var R = dmReport(F);
          if (R) { dmReportInto(DM.sheetBox, R); }
        }
      }
    } catch (e) { /* tried again next picture */ }
    requestAnimationFrame(dmTick);
  })();
